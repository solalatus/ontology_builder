// A scripted interviewer for the paired-stage harness's mocked tests
// (issue #182): answers the app's model calls by what the app was last told,
// in either API's shape. It walks one short interview to its wrap-up, a
// two-round coverage sweep and its close-out, and a naming pass, so a test
// can check where each snapshot lands.
import { STAGE_TEXTS } from "../evals/lib/pairedStages.mjs";

export const SEED_YAML = [
  "competency_questions:",
  "  - text: Which supplier issued a given invoice?",
  "classes:",
  "  Invoice:",
  "    meaning: A request for payment.",
  "    properties:",
  "      amount:",
  "        type: number",
  "  Supplier:",
  "    meaning: A party that issues invoices.",
  "relationships:",
  "  - name: connectsTo",
  "    from: Invoice",
  "    to: Supplier",
  "",
].join("\n");

const USAGE = { prompt_tokens: 1000, completion_tokens: 50, total_tokens: 1050, prompt_tokens_details: { cached_tokens: 800 }, completion_tokens_details: { reasoning_tokens: 20 } };

/**
 * `next({ lastRole, lastText, lastToolCallId })` returns the interviewer's
 * move: `{ text }` or `{ toolCall: { id, name, args } }`.
 */
export function scriptedInterviewer() {
  let mode = "interview";
  let interviewTurns = 0;
  const followUps = {
    seed: "I have recorded the first classes. What else does the agent need to know about suppliers?",
    part: "Does an invoice have parts of its own?",
    rename: "What do you call the connection between an invoice and a supplier?",
  };
  function next({ lastRole, lastText, lastToolCallId }) {
    if (lastRole === "tool") return { text: followUps[lastToolCallId] || "Recorded." };
    const said = String(lastText || "");
    if (said === STAGE_TEXTS.en.sweepFirst) { mode = "sweep1"; return { toolCall: { id: "part", name: "apply_ontology_yaml", args: { yaml: "classes:\n  Part:\n    meaning: A component.\n" } } }; }
    if (said.startsWith("Thank you. These classes were added")) { mode = "sweep2"; return { text: "Nothing further came up.\nCOVERAGE LEDGER: surfaced=0; added=0; declined=0; open=0" }; }
    if (said === STAGE_TEXTS.en.sweepCloseout) { mode = "closeout"; return { text: "I re-ran both checks over the whole model; the ontology is complete and nothing is outstanding." }; }
    if (said === STAGE_TEXTS.en.naming) {
      mode = "naming";
      return { toolCall: { id: "rename", name: "rename_ontology_elements", args: { renames: [
        { kind: "relationship", from: "connectsTo", to: "issues", source: "Invoice", target: "Supplier", reverse: true },
        { kind: "property", from: "amount", to: "totalAmount", className: "Invoice" },
        { kind: "class", from: "Supplier", to: "Vendor" },
      ] } } };
    }
    if (mode === "sweep1") return { text: "Recorded.\nCOVERAGE LEDGER: surfaced=2; added=1; declined=1; open=0" };
    if (mode === "naming") return { text: "All recorded in your words.\nNAMING LEDGER: relationships_renamed=1; relationships_redirected=1; properties_renamed=1; classes_renamed=1" };
    interviewTurns++;
    if (interviewTurns === 1) return { toolCall: { id: "seed", name: "apply_ontology_yaml", args: { yaml: SEED_YAML } } };
    return { text: "Thank you. The ontology is complete: every class, relationship and property is confirmed." };
  }
  return { next, get mode() { return mode; } };
}

/** The move, as a Chat Completions body. */
export function asChatCompletion(move) {
  const message = move.toolCall
    ? { role: "assistant", content: null, tool_calls: [{ id: move.toolCall.id, type: "function", function: { name: move.toolCall.name, arguments: JSON.stringify(move.toolCall.args) } }] }
    : { role: "assistant", content: move.text };
  return { id: "c", object: "chat.completion", choices: [{ index: 0, message, finish_reason: move.toolCall ? "tool_calls" : "stop" }], usage: USAGE };
}

/** The move, as a Responses API body. */
export function asResponse(move) {
  const output = move.toolCall
    ? [{ type: "function_call", call_id: move.toolCall.id, name: move.toolCall.name, arguments: JSON.stringify(move.toolCall.args) }]
    : [{ type: "message", role: "assistant", content: [{ type: "output_text", text: move.text }] }];
  return { id: "r", object: "response", output,
    usage: { input_tokens: 1000, output_tokens: 50, input_tokens_details: { cached_tokens: 800 }, output_tokens_details: { reasoning_tokens: 20 } } };
}

/** What the app was last told, from a Chat Completions request body. */
export function lastFromChatBody(body) {
  const last = body.messages[body.messages.length - 1];
  return { lastRole: last.role, lastText: typeof last.content === "string" ? last.content : "", lastToolCallId: last.tool_call_id };
}

/** The same, from a Responses API request body. */
export function lastFromResponsesBody(body) {
  const last = body.input[body.input.length - 1];
  if (last.type === "function_call_output") return { lastRole: "tool", lastText: last.output, lastToolCallId: last.call_id };
  return { lastRole: last.role, lastText: typeof last.content === "string" ? last.content : "" };
}
