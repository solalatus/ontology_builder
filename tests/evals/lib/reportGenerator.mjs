import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError } from "../../lib/liveOpenAi.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RESULTS_DIR = path.resolve(__dirname, "..", "results");
export const LOG_PATH = path.join(RESULTS_DIR, "conversation-log.md");
export const REPORT_PATH = path.join(RESULTS_DIR, "report.md");
export const TOOL_CALL_LOG_PATH = path.join(RESULTS_DIR, "tool-calls.md");

// Every write* function below defaults to RESULTS_DIR (the real, shared,
// gitignored eval results a live run writes to and this app's own
// documented workflow tells a user to `tail` mid-run) -- but accepts an
// optional `dir` override, purely so tests/ontology-recovery-transparency.
// spec.mjs's *mocked* unit tests (synthetic "first run marker"/"opening
// line" fixture content) can point at a throwaway directory instead. Before
// this existed, those unit tests wrote straight to the shared RESULTS_DIR --
// harmless in isolation, but running the full mocked suite (`node --test
// tests/*.spec.mjs`) right after a real live eval run silently clobbered
// that run's actual conversation-log.md/tool-calls.md/report.md with
// synthetic fixture text, discovered only when a later investigation went
// looking for the real transcript and found test placeholders instead (see
// helper_agent_todo.md's dated addendum). Real eval callers
// (ontology-recovery.eval.spec.mjs) never pass this option, so their
// behavior -- and the exported LOG_PATH/REPORT_PATH/TOOL_CALL_LOG_PATH
// constants other tooling may already read from -- is unchanged.
export function pathsFor(dir = RESULTS_DIR) {
  return {
    logPath: path.join(dir, "conversation-log.md"),
    reportPath: path.join(dir, "report.md"),
    toolCallLogPath: path.join(dir, "tool-calls.md"),
  };
}

const CHAT_URL = "https://api.openai.com/v1/chat/completions";

function pct(x) {
  return x === null || x === undefined ? "n/a" : `${(x * 100).toFixed(1)}%`;
}

// Overwritten every run, not accumulated -- "full conversation logs,
// overwritten at each pass" per the user's own instruction. Fixed filename,
// gitignored (tests/evals/README.md).
//
// Also the live progress view: the eval spec's onProgress callback (see
// conversationOrchestrator.mjs) calls this same function after every turn
// with the conversation-so-far, not just once at the very end -- so
// checking this file mid-run (`cat`/`tail` it, or open it in an editor)
// shows real, current progress, not a stale or empty file. `status` is
// free text -- pass a real stoppedReason for the final call, or something
// like "in progress -- turn 7 started, sending to app agent" for an
// interim one; either way it and the "last updated" timestamp below are
// what let a 2-minute glance tell "still moving" from "stuck since
// <timestamp>" (this file's own mtime is the same signal, but the explicit
// timestamp means that read doesn't require a second `stat` call).
export function writeConversationLog(orchestratorResult, { dir = RESULTS_DIR } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const lines = [
    "# Ontology-recovery eval — conversation log",
    "",
    `Status: **${orchestratorResult.stoppedReason}** — ${orchestratorResult.turnsUsed} turn(s) so far, ` +
    `${(orchestratorResult.durationMs / 1000).toFixed(0)}s elapsed.`,
    `Last updated: ${new Date().toISOString()}`,
    "",
  ];
  for (const entry of orchestratorResult.log) {
    lines.push(`### Turn ${entry.turn} — ${entry.speaker}`, "", entry.text, "");
  }
  fs.writeFileSync(pathsFor(dir).logPath, lines.join("\n"));
}

// Tool-call activity, read from both the raw real API responses (for exact
// tool_calls counts) and the app's own visible transcript tool notes (for
// outcome classification: applied/skipped/nothing/error) -- mirrors the
// same note-text convention tests/helper-agent-live-openai.spec.mjs already
// asserts against.
export function computeOperationalStats(orchestratorResult) {
  let applyToolCalls = 0, getGraphStateCalls = 0;
  for (const r of orchestratorResult.chatResponses) {
    const msg = r.body && r.body.choices && r.body.choices[0] && r.body.choices[0].message;
    for (const c of (msg && msg.tool_calls) || []) {
      if (c.function && c.function.name === "apply_ontology_yaml") applyToolCalls++;
      if (c.function && c.function.name === "get_graph_state") getGraphStateCalls++;
    }
  }
  const toolNotes = orchestratorResult.log.filter((e) => e.speaker === "app-tool");
  const count = (re) => toolNotes.filter((e) => re.test(e.text)).length;
  return {
    appAgentApiCalls: orchestratorResult.chatResponses.length,
    applyToolCalls,
    getGraphStateCalls,
    toolApplied: count(/applied/i),
    toolSkipped: count(/skipped/i),
    toolNothing: count(/nothing new or changed/i),
    toolError: count(/could not be applied/i),
  };
}

// One real LLM call reading the full conversation log, asked to flag
// errors/noteworthy events -- the user's own explicit request ("report
// generation can use an LLM (intelligent one) to highlight any errors or
// noteworthy events"). Defaults to whatever model the interviewer itself
// connected with (already a real, live-picked standard-tier model per the
// app's own default-model heuristic), overridable via
// ONTOLOGY_EVAL_REVIEW_MODEL for a deliberately different reviewer model.
export async function generateLlmReview({ apiKey, model, orchestratorResult }) {
  const transcriptText = orchestratorResult.log
    .map((e) => `[turn ${e.turn} | ${e.speaker}]\n${e.text}`)
    .join("\n\n");
  let res, data;
  // Retries a transient 429 with backoff, same as every other real API call
  // site in the app/test suite -- this one still degrades to a soft-fail
  // message rather than throwing once retries are exhausted, matching its
  // existing behavior (a review failure shouldn't crash the whole eval run).
  for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
    res = await fetch(CHAT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are reviewing a transcript of a simulated ontology-elicitation interview between an " +
              "AI interviewer (speaker labels starting with \"app-\") and a simulated domain-expert persona " +
              "(speaker label \"persona\"). Write a concise, skimmable review in markdown with two sections: " +
              "'## Errors' (tool failures, contradictions, the interviewer losing track of state, misapplied " +
              "edits, or anything that looks like a real bug) and '## Noteworthy observations' (good or bad " +
              "interview technique, missed obvious follow-ups, especially efficient or inefficient moments, " +
              "anything a reviewer optimizing this agent's prompt would want to know). Use bullet points with " +
              "the turn number. If a section has nothing to report, write 'None observed.' under it. Do not " +
              "restate the whole transcript.",
          },
          { role: "user", content: transcriptText },
        ],
      }),
    });
    data = await res.json();
    if (res.ok) break;
    if (res.status === 429 && !isInsufficientQuotaError(data) && attempt < RATE_LIMIT_MAX_ATTEMPTS) {
      await sleepMs(rateLimitBackoffMs(attempt));
      continue;
    }
    break;
  }
  if (!res.ok) return `_LLM review call failed: HTTP ${res.status} ${data && data.error && data.error.message}_`;
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "_LLM review returned no content._";
}

// report.md: metrics table up front (per the user's own instruction --
// "things one can optimize against"), then operational stats, then the LLM
// review, then a pointer to the full log. Overwritten every run.
//
// Two metrics objects are reported side by side, not one replacing the
// other: `metrics` is scored against the fixture's full 68-class reference
// domain (comprehensive, for context/comparability across fixture
// revisions); `scopedMetrics` is scored against practicalScopeClassIds --
// the classes the fixture's own canonical competency-questions/actions
// material actually talks about (see groundTruthModel.mjs). A single-
// session, competency-driven interview can only ever reach the second one;
// showing both, rather than quietly swapping the denominator, is what makes
// this an addition to transparency rather than a way to make the number
// look better.
export function writeReport({ metrics, scopedMetrics, operationalStats, orchestratorResult, llmReviewText, interviewerModel, personaModel, classifierModel, dir = RESULTS_DIR }) {
  fs.mkdirSync(dir, { recursive: true });
  const m = metrics;
  const s = scopedMetrics;
  const lines = [
    "# Ontology-recovery eval report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Headline metrics",
    "",
    "Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's " +
    "68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical " +
    "competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, " +
    "single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers " +
    "give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview " +
    "quality on their own.",
    "",
    "| Metric | Full domain | Practical scope | Detail |",
    "|---|---|---|---|",
    `| **Recovery effectiveness (composite)** | **${pct(m.recoveryEffectiveness)}** | **${pct(s.recoveryEffectiveness)}** | equal-weighted: class F1, relationship F1, property recall, value fidelity |`,
    `| Class recall / precision / F1 | ${pct(m.classes.recall)} / ${pct(m.classes.precision)} / ${pct(m.classes.f1)} | ${pct(s.classes.recall)} / ${pct(s.classes.precision)} / ${pct(s.classes.f1)} | ${m.classes.matched}/${m.classes.groundTruthTotal} full · ${s.classes.matched}/${s.classes.groundTruthTotal} scoped ground-truth classes matched; ${m.classes.recoveredTotal} recovered |`,
    `| Relationship recall / precision / F1 | ${pct(m.relationships.recall)} / ${pct(m.relationships.precision)} / ${pct(m.relationships.f1)} | ${pct(s.relationships.recall)} / ${pct(s.relationships.precision)} / ${pct(s.relationships.f1)} | ${m.relationships.matched}/${m.relationships.groundTruthTotal} full · ${s.relationships.matched}/${s.relationships.groundTruthTotal} scoped ground-truth relationships matched; ${m.relationships.recoveredTotal} recovered (subclass/"is a" predicates excluded from both -- see README) |`,
    `| Property recall | ${pct(m.properties.recall)} | ${pct(s.properties.recall)} | ${m.properties.matched}/${m.properties.groundTruthTotal} full · ${s.properties.matched}/${s.properties.groundTruthTotal} scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |`,
    `| Controlled-value fidelity | ${pct(m.controlledValueFidelity)} | ${pct(s.controlledValueFidelity)} | average allowed-value overlap across matched controlled-value properties |`,
    "",
    "## Run stats",
    "",
    `- Interviewer model: \`${interviewerModel}\` · Persona model: \`${personaModel}\` · Classifier model: \`${classifierModel}\``,
    `- Stopped: **${orchestratorResult.stoppedReason}**, after ${orchestratorResult.turnsUsed} turns, ${(orchestratorResult.durationMs / 1000).toFixed(0)}s wall-clock`,
    `- Real app-agent API calls: ${operationalStats.appAgentApiCalls} (apply_ontology_yaml called ${operationalStats.applyToolCalls}× · get_graph_state called ${operationalStats.getGraphStateCalls}×)`,
    `- Tool outcomes seen in transcript: ${operationalStats.toolApplied} applied · ${operationalStats.toolSkipped} skipped · ${operationalStats.toolNothing} no-op · ${operationalStats.toolError} error`,
    "",
    "## LLM review of the conversation",
    "",
    llmReviewText,
    "",
    "## Full conversation log",
    "",
    "See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real " +
    "apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside " +
    "it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather " +
    "than the interviewer's own narration of it.",
    "",
  ];
  fs.writeFileSync(pathsFor(dir).reportPath, lines.join("\n"));
}

// FULL TRANSPARENCY LOG ---------------------------------------------------
// The human-readable conversation-log.md only ever contains the interview
// participants' visible text plus the app's short tool notes ("Checked the
// current ontology state.", "Applied: 3 added, 1 updated."). It never shows
// what the interviewer actually *sent* as apply_ontology_yaml's yaml
// argument, or exactly what get_graph_state returned -- so a suspected
// tool/state-sync issue (an LLM reviewer narrating "aliases weren't
// retained") could previously only be judged by trusting the interviewer's
// own retelling. tool-calls.md instead dumps the raw OpenAI-API-level
// message log conversationOrchestrator.mjs already captures via
// window.__kg.agent.state.apiMessages (the exact request/response content
// the app itself sent and received) -- every tool call's real arguments and
// every tool result's real content, turn by turn, so any future dispute
// about what actually happened can be checked against ground truth instead
// of a summary. Overwritten every run, same convention as the other results
// files.
function formatToolCallEntry(entry) {
  const lines = [`### Turn ${entry.turn} — ${entry.role}`, ""];
  if (entry.role === "assistant" && Array.isArray(entry.tool_calls) && entry.tool_calls.length) {
    for (const call of entry.tool_calls) {
      const name = (call.function && call.function.name) || "(unknown tool)";
      const rawArgs = (call.function && call.function.arguments) || "";
      let prettyArgs = rawArgs;
      try { prettyArgs = JSON.stringify(JSON.parse(rawArgs), null, 2); } catch (err) { /* not JSON, print raw */ }
      lines.push(`**Tool call: \`${name}\`**`, "", "```", prettyArgs, "```", "");
    }
    if (entry.content) lines.push(entry.content, "");
  } else {
    lines.push(entry.content || "_(empty)_", "");
  }
  return lines.join("\n");
}

// Also written live, turn by turn, same as writeConversationLog above --
// same onProgress callback, same reasoning: a hang mid-run should leave a
// file showing every tool call up through the last completed turn, not
// nothing at all.
export function writeToolCallLog(rawApiLog, { dir = RESULTS_DIR } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const lines = [
    "# Ontology-recovery eval — raw tool-call transparency log",
    "",
    "Exact API-level messages (real tool_calls arguments, real tool result content) captured from " +
    "`window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually " +
    "sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of " +
    "it.",
    `Last updated: ${new Date().toISOString()}`,
    "",
  ];
  for (const entry of rawApiLog) lines.push(formatToolCallEntry(entry));
  fs.writeFileSync(pathsFor(dir).toolCallLogPath, lines.join("\n"));
}
