import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { tagApiMessagesWithTurn } from "./evals/lib/conversationOrchestrator.mjs";
import { writeToolCallLog, writeReport, TOOL_CALL_LOG_PATH, REPORT_PATH } from "./evals/lib/reportGenerator.mjs";

// Fast, deterministic unit tests for the eval's full-transparency logging
// (tests/evals/lib/conversationOrchestrator.mjs's rawApiLog capture and
// reportGenerator.mjs's tool-calls.md writer) -- pure JS, no browser, no
// API key, mirroring tests/ontology-recovery-metrics.spec.mjs's own
// rationale for living at the top level instead of under tests/evals/.
//
// The user's own explicit ask: full transparency into what the interviewer
// actually sent as apply_ontology_yaml/get_graph_state tool-call arguments
// and what it actually got back, independent of its own narration in the
// human-readable conversation log or the LLM review's summary of that
// narration -- see a real eval run's "tool/state sync issue" LLM-review
// notes (turns 22/23, 35, 36 of the run right after the batching fix
// shipped) that could previously only be judged by trusting the
// interviewer's own retelling.

test("tagApiMessagesWithTurn tags every message with its turn number and passes content through unchanged", () => {
  const apiMessages = [
    { role: "user", content: "hello" },
    {
      role: "assistant",
      content: null,
      tool_calls: [{ id: "call_1", function: { name: "apply_ontology_yaml", arguments: '{"yaml":"classes:\\n  incident: {}\\n"}' } }],
    },
    { role: "tool", tool_call_id: "call_1", content: "Applied. Added 1, updated 0 existing item(s)." },
  ];
  const tagged = tagApiMessagesWithTurn(apiMessages, 7);
  assert.equal(tagged.length, 3);
  assert.ok(tagged.every((m) => m.turn === 7));
  // Original fields survive untouched, including the raw tool_calls arguments string.
  assert.equal(tagged[1].tool_calls[0].function.arguments, '{"yaml":"classes:\\n  incident: {}\\n"}');
  assert.equal(tagged[2].content, "Applied. Added 1, updated 0 existing item(s).");
});

test("tagApiMessagesWithTurn handles an empty slice without error", () => {
  assert.deepEqual(tagApiMessagesWithTurn([], 3), []);
});

test("writeToolCallLog renders each tool call's real arguments (pretty-printed) and each tool result's real content", () => {
  const rawApiLog = [
    { turn: 1, role: "user", content: "I lead IT operations..." },
    {
      turn: 1,
      role: "assistant",
      content: null,
      tool_calls: [{ id: "call_1", function: { name: "get_graph_state", arguments: "{}" } }],
    },
    { turn: 1, role: "tool", tool_call_id: "call_1", content: "classes: {}\nrelationships: []\n" },
    {
      turn: 2,
      role: "assistant",
      content: "Recorded it.",
      tool_calls: [{
        id: "call_2",
        function: { name: "apply_ontology_yaml", arguments: '{"yaml":"classes:\\n  incident:\\n    meaning: x\\n"}' },
      }],
    },
    { turn: 2, role: "tool", tool_call_id: "call_2", content: "Applied. Added 1, updated 0 existing item(s)." },
  ];
  writeToolCallLog(rawApiLog);
  const text = fs.readFileSync(TOOL_CALL_LOG_PATH, "utf8");

  assert.match(text, /### Turn 1 — assistant/);
  assert.match(text, /\*\*Tool call: `get_graph_state`\*\*/);
  assert.match(text, /### Turn 1 — tool/);
  assert.match(text, /classes: \{\}\nrelationships: \[\]/);
  assert.match(text, /\*\*Tool call: `apply_ontology_yaml`\*\*/);
  // The apply_ontology_yaml call's real yaml argument must appear, not just a summary --
  // this is the exact content that a suspected tool/state-sync issue needs to be checked against.
  assert.match(text, /classes:\\n {2}incident:\\n {4}meaning: x/);
  assert.match(text, /Applied\. Added 1, updated 0 existing item\(s\)\./);
  assert.match(text, /### Turn 2 — assistant/);
  assert.match(text, /Recorded it\./);
});

test("writeToolCallLog overwrites the previous run's file rather than accumulating", () => {
  writeToolCallLog([{ turn: 1, role: "user", content: "first run marker" }]);
  writeToolCallLog([{ turn: 1, role: "user", content: "second run marker" }]);
  const text = fs.readFileSync(TOOL_CALL_LOG_PATH, "utf8");
  assert.ok(!text.includes("first run marker"));
  assert.ok(text.includes("second run marker"));
});

function fakeMetrics(overrides = {}) {
  return {
    recoveryEffectiveness: 0.5,
    classes: { recall: 0.5, precision: 0.5, f1: 0.5, matched: 1, groundTruthTotal: 2, recoveredTotal: 2 },
    relationships: { recall: 0.5, precision: 0.5, f1: 0.5, matched: 1, groundTruthTotal: 2, recoveredTotal: 2 },
    properties: { recall: 0.5, matched: 1, groundTruthTotal: 2 },
    controlledValueFidelity: 0.5,
    ...overrides,
  };
}

test("writeReport renders both the full-domain and practical-scope metrics, clearly distinguished", () => {
  const metrics = fakeMetrics({ recoveryEffectiveness: 0.392 });
  const scopedMetrics = fakeMetrics({ recoveryEffectiveness: 0.7, classes: { recall: 0.8, precision: 0.9, f1: 0.85, matched: 1, groundTruthTotal: 1, recoveredTotal: 2 } });
  const orchestratorResult = { stoppedReason: "app_agent_appears_finished", turnsUsed: 39, durationMs: 1000 };
  const operationalStats = { appAgentApiCalls: 1, applyToolCalls: 1, getGraphStateCalls: 1, toolApplied: 1, toolSkipped: 0, toolNothing: 0, toolError: 0 };

  writeReport({ metrics, scopedMetrics, operationalStats, orchestratorResult, llmReviewText: "None observed.", interviewerModel: "gpt-test", personaModel: "gpt-test-persona" });
  const text = fs.readFileSync(REPORT_PATH, "utf8");

  assert.match(text, /Full domain/);
  assert.match(text, /Practical scope/);
  assert.match(text, /39\.2%/); // full-domain composite
  assert.match(text, /70\.0%/); // scoped composite
  assert.match(text, /tool-calls\.md/); // points readers at the new transparency log
});
