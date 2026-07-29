import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RESULTS_DIR = path.resolve(__dirname, "..", "results");
export const LOG_PATH = path.join(RESULTS_DIR, "conversation-log.md");
export const REPORT_PATH = path.join(RESULTS_DIR, "report.md");

const CHAT_URL = "https://api.openai.com/v1/chat/completions";

function pct(x) {
  return x === null || x === undefined ? "n/a" : `${(x * 100).toFixed(1)}%`;
}

// Overwritten every run, not accumulated -- "full conversation logs,
// overwritten at each pass" per the user's own instruction. Fixed filename,
// gitignored (tests/evals/README.md).
export function writeConversationLog(orchestratorResult) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const lines = [
    "# Ontology-recovery eval — conversation log",
    "",
    `Stopped: **${orchestratorResult.stoppedReason}** after ${orchestratorResult.turnsUsed} turns, ` +
    `${(orchestratorResult.durationMs / 1000).toFixed(0)}s wall-clock.`,
    "",
  ];
  for (const entry of orchestratorResult.log) {
    lines.push(`### Turn ${entry.turn} — ${entry.speaker}`, "", entry.text, "");
  }
  fs.writeFileSync(LOG_PATH, lines.join("\n"));
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
  const res = await fetch(CHAT_URL, {
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
  const data = await res.json();
  if (!res.ok) return `_LLM review call failed: HTTP ${res.status} ${data && data.error && data.error.message}_`;
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "_LLM review returned no content._";
}

// report.md: metrics table up front (per the user's own instruction --
// "things one can optimize against"), then operational stats, then the LLM
// review, then a pointer to the full log. Overwritten every run.
export function writeReport({ metrics, operationalStats, orchestratorResult, llmReviewText, interviewerModel, personaModel }) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const m = metrics;
  const lines = [
    "# Ontology-recovery eval report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Headline metrics",
    "",
    "| Metric | Value | Detail |",
    "|---|---|---|",
    `| **Recovery effectiveness (composite)** | **${pct(m.recoveryEffectiveness)}** | equal-weighted: class F1, relationship F1, property recall, value fidelity |`,
    `| Class recall / precision / F1 | ${pct(m.classes.recall)} / ${pct(m.classes.precision)} / ${pct(m.classes.f1)} | ${m.classes.matched}/${m.classes.groundTruthTotal} ground-truth classes matched; ${m.classes.recoveredTotal} recovered |`,
    `| Relationship recall / precision / F1 | ${pct(m.relationships.recall)} / ${pct(m.relationships.precision)} / ${pct(m.relationships.f1)} | ${m.relationships.matched}/${m.relationships.groundTruthTotal} ground-truth relationships matched; ${m.relationships.recoveredTotal} recovered |`,
    `| Property recall | ${pct(m.properties.recall)} | ${m.properties.matched}/${m.properties.groundTruthTotal} ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |`,
    `| Controlled-value fidelity | ${pct(m.controlledValueFidelity)} | average allowed-value overlap across matched controlled-value properties |`,
    "",
    "## Run stats",
    "",
    `- Interviewer model: \`${interviewerModel}\` · Persona model: \`${personaModel}\``,
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
    "See `conversation-log.md` in this same directory (overwritten every run alongside this report).",
    "",
  ];
  fs.writeFileSync(REPORT_PATH, lines.join("\n"));
}
