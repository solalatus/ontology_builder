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
    recoveredModelYamlPath: path.join(dir, "recovered-model.yaml"),
    heuristicMatchesPath: path.join(dir, "heuristic-matches.json"),
    semanticJudgmentsPath: path.join(dir, "semantic-judgments.json"),
    semanticMatchesPath: path.join(dir, "semantic-matches.json"),
  };
}

const CHAT_URL = "https://api.openai.com/v1/chat/completions";

function pct(x) {
  return x === null || x === undefined ? "n/a" : `${(x * 100).toFixed(1)}%`;
}

// Overwritten every run, not accumulated -- "full conversation logs,
// overwritten at each pass" per the user's own instruction. Fixed filename,
// committed with every PR that includes a live run, not gitignored (see the
// .gitignore's own comment, and tests/evals/README.md).
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
// The 5-row metrics table body, shared between the heuristic and semantic
// sections below so the two can never drift out of the same shape/columns
// -- a reader comparing them should only ever see the numbers differ, never
// the layout.
function metricsTableLines(m, s) {
  return [
    "| Metric | Full domain | Practical scope | Detail |",
    "|---|---|---|---|",
    `| **Recovery effectiveness (composite)** | **${pct(m.recoveryEffectiveness)}** | **${pct(s.recoveryEffectiveness)}** | equal-weighted: class F1, relationship F1, property F1, value fidelity |`,
    `| Class recall / precision / F1 | ${pct(m.classes.recall)} / ${pct(m.classes.precision)} / ${pct(m.classes.f1)} | ${pct(s.classes.recall)} / ${pct(s.classes.precision)} / ${pct(s.classes.f1)} | ${m.classes.matched}/${m.classes.groundTruthTotal} full · ${s.classes.matched}/${s.classes.groundTruthTotal} scoped ground-truth classes matched; ${m.classes.recoveredTotal} recovered |`,
    `| Relationship recall / precision / F1 | ${pct(m.relationships.recall)} / ${pct(m.relationships.precision)} / ${pct(m.relationships.f1)} | ${pct(s.relationships.recall)} / ${pct(s.relationships.precision)} / ${pct(s.relationships.f1)} | ${m.relationships.matched}/${m.relationships.groundTruthTotal} full · ${s.relationships.matched}/${s.relationships.groundTruthTotal} scoped ground-truth relationships matched; ${m.relationships.recoveredTotal} recovered (subclass/"is a" predicates excluded from both -- see README) |`,
    `| Property recall / precision / F1 | ${pct(m.properties.recall)} / ${pct(m.properties.precision)} / ${pct(m.properties.f1)} | ${pct(s.properties.recall)} / ${pct(s.properties.precision)} / ${pct(s.properties.f1)} | ${m.properties.matched}/${m.properties.groundTruthTotal} full · ${s.properties.matched}/${s.properties.groundTruthTotal} scoped ground-truth properties matched; ${m.properties.recoveredTotal} recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |`,
    `| Controlled-value fidelity | ${pct(m.controlledValueFidelity)} | ${pct(s.controlledValueFidelity)} | average allowed-value overlap across matched controlled-value properties |`,
  ];
}

// Rules/actions (issue #105) -- deliberately its OWN section and its own
// table, never folded into recoveryEffectiveness above or into
// metricsTableLines's own table: the issue's own explicit instruction was
// not to change that composite yet ("a later issue can define a new
// composite once enough domains have been run"). Only rendered when the
// caller actually has this data (a domain with real rules/actions in its
// ground truth, and a recovered state that captured window.__kg.state.
// rules/actions) -- absent for every existing caller, so writeReport's
// default behavior is completely unchanged unless a caller opts in.
//
// `identification` is {recall, precision, f1, matched, groundTruthTotal,
// recoveredTotal} -- from either recoveryMetrics.mjs's own
// computeRuleMetrics/computeActionMetrics().identification (heuristic) or
// llmMatcher.mjs's aggregateSemanticRuleActionMetrics().rules/.actions
// (semantic). `actionComponents` is always the heuristic
// computeActionMetrics()'s own return value -- input-class accuracy and
// precondition/effect/verification recovery are never semantically
// re-judged (see recoveryMetrics.mjs's own module comment on why), so
// there is only ever one version of these regardless of which
// identification numbers are being shown alongside them.
function ruleActionTableLines(ruleIdentification, actionIdentification, actionComponents) {
  return [
    "| Metric | Value | Detail |",
    "|---|---|---|",
    `| Rule recall / precision / F1 | ${pct(ruleIdentification.recall)} / ${pct(ruleIdentification.precision)} / ${pct(ruleIdentification.f1)} | ${ruleIdentification.matched}/${ruleIdentification.groundTruthTotal} ground-truth rules matched (core condition equivalence, not name alone); ${ruleIdentification.recoveredTotal} recovered |`,
    `| Action identification recall / precision / F1 | ${pct(actionIdentification.recall)} / ${pct(actionIdentification.precision)} / ${pct(actionIdentification.f1)} | ${actionIdentification.matched}/${actionIdentification.groundTruthTotal} ground-truth actions matched by name/meaning; ${actionIdentification.recoveredTotal} recovered |`,
    `| Action input-class accuracy | ${actionComponents.inputClassAccuracy === null ? "n/a" : pct(actionComponents.inputClassAccuracy)} | of ${actionComponents.inputClassChecked} matched action(s) whose input class itself was recoverable at all |`,
    `| Action precondition recovery | ${actionComponents.preconditionRecovery === null ? "n/a (no matched gold action had preconditions)" : pct(actionComponents.preconditionRecovery)} | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |`,
    `| Action effect recovery | ${actionComponents.effectRecovery === null ? "n/a" : pct(actionComponents.effectRecovery)} | token-overlap similarity between gold and recovered effect text |`,
    `| Action verification recovery | ${actionComponents.verificationRecovery === null ? "n/a" : pct(actionComponents.verificationRecovery)} | token-overlap similarity between gold and recovered verification text |`,
  ];
}

// semanticMetrics/semanticScopedMetrics (llmMatcher.mjs's
// computeSemanticRecoveryMetrics) are always rendered as their own section
// right after the heuristic one, never merged into one table and never
// silently replacing it -- a reader should always be able to see both the
// free/instant/deterministic score and the LLM-adjudicated one side by
// side, so it's visible how much of any difference is wording variance the
// judge caught vs. a real difference in what was actually modeled (see
// llmMatcher.mjs's own module doc for why this module exists at all).
export function writeReport({
  metrics, scopedMetrics, semanticMetrics, semanticScopedMetrics, operationalStats, orchestratorResult, llmReviewText,
  interviewerModel, personaModel, classifierModel, dir = RESULTS_DIR,
  // Issue #105, additive and optional -- see ruleActionTableLines's own
  // module comment for the exact shapes expected. Every existing caller
  // omits these and gets exactly the report this function already wrote.
  ruleMetrics, actionMetrics, semanticRuleActionMetrics,
}) {
  fs.mkdirSync(dir, { recursive: true });
  const m = metrics;
  const s = scopedMetrics;
  const scopeBlurb =
    "Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's " +
    "68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical " +
    "competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, " +
    "single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers " +
    "give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview " +
    "quality on their own.";
  const lines = [
    "# Ontology-recovery eval report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Heuristic (regex/token-overlap) metrics",
    "",
    scopeBlurb,
    "",
    ...metricsTableLines(m, s),
    "",
  ];
  if (semanticMetrics && semanticScopedMetrics) {
    lines.push(
      "## Semantic (LLM-adjudicated) metrics",
      "",
      "Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: " +
      "the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss " +
      "the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden " +
      "wording, or a controlled-value list using a different labeling convention for the same real scale). The " +
      "judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, " +
      "so this section's numbers are always >= the section above's on every recall metric. Any gap between the two " +
      "sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or " +
      "missing recovery costs the same in both.",
      "",
      ...metricsTableLines(semanticMetrics, semanticScopedMetrics),
      "",
    );
  } else {
    lines.push(
      "## Semantic (LLM-adjudicated) metrics",
      "",
      "_Not computed for this run -- see run stats below for why (e.g. no API budget available for the extra " +
      "judge calls). The heuristic metrics above are unaffected either way._",
      "",
    );
  }
  if (ruleMetrics && actionMetrics) {
    lines.push(
      "## Rules and actions (heuristic)",
      "",
      "Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- " +
      "a later issue can define a new composite once enough domains have been run with this data). A rule counts " +
      "as recovered only when its core decision condition is semantically close to gold's, not merely its name " +
      "(recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its " +
      "input class, preconditions, effect, and verification text were also individually recovered.",
      "",
      ...ruleActionTableLines(ruleMetrics, actionMetrics.identification, actionMetrics),
      "",
    );
    if (semanticRuleActionMetrics) {
      lines.push(
        "## Rules and actions (semantic)",
        "",
        "Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the " +
        "heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy " +
        "and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether " +
        "the rule/action itself counts as recovered at all is.",
        "",
        ...ruleActionTableLines(semanticRuleActionMetrics.rules, semanticRuleActionMetrics.actions, actionMetrics),
        "",
      );
    }
  }
  lines.push(
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
  );
  fs.writeFileSync(pathsFor(dir).reportPath, lines.join("\n"));
}

// REPRODUCIBILITY ARTIFACTS ------------------------------------------------
// report.md only ever shows aggregate percentages -- verifying which
// specific recovered item satisfied which gold item, or what a judge call
// actually said before its verdict got folded into a Set, previously
// required hand-parsing tool-calls.md (for the final graph) or wasn't
// possible at all (judge raw text/per-item verdicts were computed then
// discarded -- see llmMatcher.mjs's computeSemanticRecoveryMetrics). An
// external review flagged this gap; these four files close it. Same
// overwritten-every-run convention as the three files above, same {dir}
// override for the mocked test suite.

// The exact YAML get_graph_state itself would return, captured directly via
// window.buildDomainYamlExport() rather than reconstructed from the last
// get_graph_state tool call in tool-calls.md (which can be stale if the
// model edited the ontology again afterward without re-calling the tool).
export function writeRecoveredModelYaml(recoveredModelYaml, { dir = RESULTS_DIR } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(pathsFor(dir).recoveredModelYamlPath, recoveredModelYaml);
}

// recoveryMetrics.mjs's computeHeuristicMatchPairs(groundTruth, recoveredState)
// output, verbatim -- exactly which gold class/relationship/property matched
// which recovered node/edge/property name, one-to-one for classes.
export function writeHeuristicMatches(matchPairs, { dir = RESULTS_DIR } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(pathsFor(dir).heuristicMatchesPath, JSON.stringify(matchPairs, null, 2));
}

// llmMatcher.mjs's computeSemanticRecoveryMetrics(...).judgments and
// .rawResponses, verbatim, for both denominators -- every judge call's full
// per-item verdicts (MATCH and NO MATCH alike, with the judge's own stated
// reason where the parser captured one) plus the judge's raw response text
// for each of the (up to four) calls actually made. Full-domain and
// practical-scope are two genuinely separate sets of real API calls (a
// narrower unmatchedGold under the scoped ground truth), not one result
// shown twice -- same "always show both denominators, never one silently
// replacing the other" convention as writeReport's own metrics/scopedMetrics
// pair (see this file's module doc). Either `fullDomain`/`scoped` argument
// is `null` when that semantic pass wasn't computed for this run at all (no
// API budget, etc -- same condition writeReport already handles).
export function writeSemanticJudgments({ fullDomain, scoped }, { dir = RESULTS_DIR } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const summarize = (semanticResult) => semanticResult
    ? { judgments: semanticResult.judgments, rawResponses: semanticResult.rawResponses }
    : { judgments: null, rawResponses: null, note: "Semantic pass not computed for this run." };
  const body = { fullDomain: summarize(fullDomain), scoped: summarize(scoped) };
  fs.writeFileSync(pathsFor(dir).semanticJudgmentsPath, JSON.stringify(body, null, 2));
}

// The MATCH-only, one-to-one-*resolved* subset of the above
// (computeSemanticRecoveryMetrics's .resolvedMatches) -- the pairs actually
// used to compute the semantic recall/precision numbers in report.md,
// distinct from judgments.json's full MATCH-and-NO-MATCH record. Same
// full-domain/practical-scope pairing as writeSemanticJudgments above.
export function writeSemanticMatches({ fullDomain, scoped }, { dir = RESULTS_DIR } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const summarize = (semanticResult) => semanticResult ? semanticResult.resolvedMatches : { note: "Semantic pass not computed for this run." };
  const body = { fullDomain: summarize(fullDomain), scoped: summarize(scoped) };
  fs.writeFileSync(pathsFor(dir).semanticMatchesPath, JSON.stringify(body, null, 2));
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
