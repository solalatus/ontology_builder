// THE FIRST-GENERATION INTERVIEWER AS A HARNESS CONDITION (revision 1, E1;
// ontology_translation/results/v1-same-model/DESIGN.md)
//
//   ONTOLOGY_EVAL_INTERVIEWER_GENERATION=v1 node tests/evals/run-multi-domain-benchmark.mjs ...
//
// Runs the v1.0 interviewer (tag v1.0-coginfocom2026) inside the current app
// and harness, so that the only thing that differs from a final-configuration
// run is what makes the interviewer first-generation:
//   - its system prompt (10 phases): AGENT_SYSTEM_PROMPT_BASE + AGENT_KNOWLEDGE
//     of v1.0, byte for byte (fixtures/v1-interviewer/system-prompt.txt);
//   - its tools: apply_ontology_yaml and get_graph_state as v1.0 defined them,
//     and nothing else (fixtures/v1-interviewer/tools.json);
//   - no consistency-checker repair loop: the app's own eval switch
//     selfCorrectionDisabled, which restores the pre-#84 turn (one commit per
//     turn, no findings appended to any tool result, get_graph_state returns
//     the plain export).
// index.html itself is not touched. The prompt goes in through the app's
// existing eval-only systemPromptOverride (the language directive is appended
// by the app exactly as v1.0 appended it). The tool list is replaced in the
// relay (tests/lib/liveAzureOpenAi.mjs), on the request the app sends, in
// whichever shape it sends (Chat Completions or Responses). The same relay
// hook replaces the one tool-result text of the current app that names a
// tool v1 does not have (the "Skipped" note of a second commit in a turn)
// with v1.0's own wording, so the model is never told about a tool it lacks.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const V1_FIXTURE_DIR = path.resolve(__dirname, "..", "fixtures", "v1-interviewer");

export const GENERATIONS = ["v1"];
// The commit the fixtures were taken from (git show v1.0-coginfocom2026:index.html).
export const V1_SOURCE_SHA = "2896779e0f981866b42b3eaa82be24b070c7d633";
export const V1_SYSTEM_PROMPT = fs.readFileSync(path.join(V1_FIXTURE_DIR, "system-prompt.txt"), "utf8");
export const V1_TOOLS = JSON.parse(fs.readFileSync(path.join(V1_FIXTURE_DIR, "tools.json"), "utf8"));
export const V1_TOOL_NAMES = V1_TOOLS.map((t) => t.function.name);

export const sha256 = (text) => crypto.createHash("sha256").update(text, "utf8").digest("hex");
// Pinned when the fixtures were extracted; tests/v1-interviewer-generation.spec.mjs checks them.
export const V1_FIXTURE_SHA256 = {
  systemPrompt: "b47e60a7e8f685d98d5c33ab167c89d1dfb20c726f17e74ce9ef5d8a2cf63585",
};

// The current app's note for a second commit in one turn, and v1.0's note for
// the same event (v1.0 index.html, handleAgentToolCall).
export const V2_SKIP_TEXT = "Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. "
  + "The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. "
  + "Reply to the expert instead.";
export const V1_SKIP_TEXT = "Skipped: only one apply_ontology_yaml call is applied per message.";

const responsesShape = (tools) => tools.map((t) => ({ type: "function", ...t.function }));

/**
 * Rewrites one outgoing app request body (JSON text) for the v1 arm. Returns
 * { body, rewrote } where rewrote lists what changed. A body without tools
 * (compaction summaries and similar) is returned unchanged.
 */
export function rewriteRequestBodyForV1(bodyText) {
  if (!bodyText) return { body: bodyText, rewrote: [] };
  let body;
  try { body = JSON.parse(bodyText); } catch { return { body: bodyText, rewrote: [] }; }
  if (!body || !Array.isArray(body.tools)) return { body: bodyText, rewrote: [] };
  const rewrote = [];
  const responses = body.tools.some((t) => t && t.type === "function" && !t.function && t.name);
  body.tools = responses ? responsesShape(V1_TOOLS) : JSON.parse(JSON.stringify(V1_TOOLS));
  rewrote.push(responses ? "tools(responses)" : "tools(chat)");
  const swap = (text) => (typeof text === "string" && text === V2_SKIP_TEXT ? V1_SKIP_TEXT : text);
  if (Array.isArray(body.messages)) {
    for (const m of body.messages) {
      if (m && m.role === "tool" && m.content === V2_SKIP_TEXT) { m.content = swap(m.content); rewrote.push("skip-note"); }
    }
  }
  if (Array.isArray(body.input)) {
    for (const item of body.input) {
      if (item && item.type === "function_call_output" && item.output === V2_SKIP_TEXT) { item.output = swap(item.output); rewrote.push("skip-note"); }
    }
  }
  return { body: JSON.stringify(body), rewrote };
}

/** The system prompt text of an outgoing app request, in either API shape. */
export function systemPromptOf(body) {
  if (Array.isArray(body.messages)) { const s = body.messages.find((m) => m.role === "system"); return s ? String(s.content) : null; }
  if (typeof body.instructions === "string") return body.instructions;
  if (Array.isArray(body.input)) { const s = body.input.find((m) => m.role === "system" || m.role === "developer"); return s ? String(s.content) : null; }
  return null;
}

/** The tool names an outgoing app request offers, in either API shape. */
export function toolNamesOf(body) {
  return Array.isArray(body.tools) ? body.tools.map((t) => (t.function ? t.function.name : t.name)) : [];
}
