import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { tagApiMessagesWithTurn, looksLikeEarlyPhaseCheckpoint, looksLikePureAcknowledgment } from "./evals/lib/conversationOrchestrator.mjs";
import { writeConversationLog, writeToolCallLog, writeReport, pathsFor, RESULTS_DIR } from "./evals/lib/reportGenerator.mjs";

// Own throwaway directory, not the real tests/evals/results/ -- these are
// mocked unit tests writing synthetic fixture content ("first run marker",
// "opening line"), and a real live eval run writes its actual transcript to
// that same shared, gitignored directory. Before this existed, running the
// full mocked suite (`node --test tests/*.spec.mjs`) right after a real live
// eval run silently clobbered that run's real conversation-log.md/
// tool-calls.md/report.md with this file's own test fixtures -- discovered
// only when a later investigation went looking for the real transcript and
// found test placeholders instead (see helper_agent_todo.md's dated
// addendum). reportGenerator.mjs's write* functions accept this `{ dir }`
// override specifically so these tests never touch the real results files.
const TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "ontology-eval-transparency-test-"));
const { logPath: LOG_PATH, toolCallLogPath: TOOL_CALL_LOG_PATH, reportPath: REPORT_PATH } = pathsFor(TEST_DIR);

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

// Deterministic pre-filter for appearsFinished()'s classifier -- catches
// the interviewer's own consistent "Phase N recap" phrasing (N 0-8) before
// ever asking the LLM, since a real run found even an explicitly-instructed
// classifier model misjudging exactly this shape of message as the final
// wrap-up. See helper_agent_todo.md's dated Log entry for the real turn
// that triggered this.
const REAL_FALSE_POSITIVE_MESSAGE = "Recorded those 5 stakeholder, approval, and change-linkage relationships.\n\n" +
  "**Phase 3 recap — relationships captured:**\n\n" +
  "- Alerts trigger incidents.\n" +
  "- Incidents affect IT services, involve configuration items, are assigned to resolver groups.\n\n" +
  "Every class now has at least one relationship to something else.\n\n" +
  "Please confirm: is this relationship set accurate enough to move into **decision-bearing properties**, " +
  "or is there any important missing connection?";

test("looksLikeEarlyPhaseCheckpoint catches the exact real message that fooled the LLM classifier", () => {
  assert.equal(looksLikeEarlyPhaseCheckpoint(REAL_FALSE_POSITIVE_MESSAGE), true);
});

test("looksLikeEarlyPhaseCheckpoint catches \"Phase N recap\" for every early phase (0-8), and the reverse \"recap ... phase N\" order", () => {
  for (let n = 0; n <= 8; n++) {
    assert.equal(looksLikeEarlyPhaseCheckpoint(`**Phase ${n} recap — some heading:**\n\nDetails here.`), true, `phase ${n} recap should match`);
  }
  assert.equal(looksLikeEarlyPhaseCheckpoint("Here's a quick recap of phase 5 before we continue."), true);
});

test("looksLikeEarlyPhaseCheckpoint catches \"Phase N is confirmed complete\" for early phases", () => {
  assert.equal(looksLikeEarlyPhaseCheckpoint("Great — Phase 5 is confirmed complete. Moving on to constraints."), true);
});

test("looksLikeEarlyPhaseCheckpoint does not match phase 9 (the real final pass) so it still reaches the LLM classifier", () => {
  assert.equal(looksLikeEarlyPhaseCheckpoint("**Phase 9 recap — final validation:**\n\nEverything checks out."), false);
  assert.equal(looksLikeEarlyPhaseCheckpoint("Phase 9 is confirmed complete. The ontology is ready to use."), false);
});

test("looksLikeEarlyPhaseCheckpoint does not match a genuine final wrap-up with no phase-recap phrasing at all", () => {
  const finalMessage = "## Final validation pass\n\nI ran the competency check against your original questions and " +
    "actions, and the final checklist. Every question is answerable and every action has preconditions. " +
    "The ontology is ready for use.";
  assert.equal(looksLikeEarlyPhaseCheckpoint(finalMessage), false);
});

test("looksLikeEarlyPhaseCheckpoint does not match ordinary text with no phase/recap markers", () => {
  assert.equal(looksLikeEarlyPhaseCheckpoint("What is the current status of the incident?"), false);
  assert.equal(looksLikeEarlyPhaseCheckpoint(""), false);
});

// Second, independent safety net -- a real run looped 160+ turns of pure
// "Thank you" / "You're welcome" / "Take care" after the interview had
// already, explicitly finished, because appearsFinished's classifier call
// was silently failing (see the max_tokens fix above/nearby in the Log).
// looksLikePureAcknowledgment needs no API call and detects the *shape* of
// a content-free closing exchange directly, as a backstop that can't be
// fooled by a classifier model's judgment call.
test("looksLikePureAcknowledgment recognizes short stock closing lines with no question", () => {
  assert.equal(looksLikePureAcknowledgment("Thank you!"), true);
  assert.equal(looksLikePureAcknowledgment("You're welcome!"), true);
  assert.equal(looksLikePureAcknowledgment("Take care."), true);
  assert.equal(looksLikePureAcknowledgment("Sounds good, thank you for walking through this."), true);
  assert.equal(looksLikePureAcknowledgment("Great, thanks so much for your time today."), true);
  assert.equal(looksLikePureAcknowledgment("No problem at all."), true);
  assert.equal(looksLikePureAcknowledgment("Goodbye!"), true);
});

test("looksLikePureAcknowledgment rejects real content even when it starts with a closing-sounding word", () => {
  // Long enough that it's clearly still substantive, not just a sign-off.
  const longReply = "Thanks for that -- before we move on, I want to flag that the incident-to-problem link " +
    "also needs a root-cause category captured, since that's what the post-incident review depends on later.";
  assert.equal(looksLikePureAcknowledgment(longReply), false);
});

test("looksLikePureAcknowledgment rejects a message ending in a question, even a short one", () => {
  assert.equal(looksLikePureAcknowledgment("Thanks -- one more thing, does that cover it?"), false);
});

test("looksLikePureAcknowledgment rejects ordinary domain content and empty input", () => {
  assert.equal(looksLikePureAcknowledgment("An incident impacts an IT service."), false);
  assert.equal(looksLikePureAcknowledgment(""), false);
  assert.equal(looksLikePureAcknowledgment(null), false);
});

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
  writeToolCallLog(rawApiLog, { dir: TEST_DIR });
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
  writeToolCallLog([{ turn: 1, role: "user", content: "first run marker" }], { dir: TEST_DIR });
  writeToolCallLog([{ turn: 1, role: "user", content: "second run marker" }], { dir: TEST_DIR });
  const text = fs.readFileSync(TOOL_CALL_LOG_PATH, "utf8");
  assert.ok(!text.includes("first run marker"));
  assert.ok(text.includes("second run marker"));
});

test("writeConversationLog is safe to call repeatedly with a growing, in-progress log and always reflects the latest call's content", () => {
  // This is exactly the onProgress usage pattern in ontology-recovery.eval.spec.mjs:
  // called once per turn with a partial log, not just once at the very end.
  writeConversationLog({
    stoppedReason: "in progress (turn_started, turn 1)",
    turnsUsed: 1,
    durationMs: 5000,
    log: [{ turn: 0, speaker: "persona", text: "opening line" }],
  }, { dir: TEST_DIR });
  let text = fs.readFileSync(LOG_PATH, "utf8");
  assert.match(text, /Status: \*\*in progress \(turn_started, turn 1\)\*\*/);
  assert.match(text, /Last updated: \d{4}-\d{2}-\d{2}T/);
  assert.match(text, /opening line/);
  assert.ok(!text.includes("turn 2 reply"), "the second turn hasn't happened yet in this snapshot");

  writeConversationLog({
    stoppedReason: "app_agent_appears_finished",
    turnsUsed: 2,
    durationMs: 9000,
    log: [
      { turn: 0, speaker: "persona", text: "opening line" },
      { turn: 1, speaker: "app-assistant", text: "first reply" },
      { turn: 2, speaker: "persona", text: "turn 2 reply" },
    ],
  }, { dir: TEST_DIR });
  text = fs.readFileSync(LOG_PATH, "utf8");
  assert.match(text, /Status: \*\*app_agent_appears_finished\*\*/);
  assert.match(text, /turn 2 reply/);
});

test("writeToolCallLog includes a live-updated timestamp so a repeated read can tell fresh from stale", () => {
  writeToolCallLog([{ turn: 1, role: "user", content: "x" }], { dir: TEST_DIR });
  const text = fs.readFileSync(TOOL_CALL_LOG_PATH, "utf8");
  assert.match(text, /Last updated: \d{4}-\d{2}-\d{2}T/);
});

test("pathsFor() with no argument resolves to the real, shared RESULTS_DIR a live eval run uses -- the default this file's own TEST_DIR override must never change", () => {
  const defaultPaths = pathsFor();
  assert.equal(defaultPaths.logPath, path.join(RESULTS_DIR, "conversation-log.md"));
  assert.equal(defaultPaths.reportPath, path.join(RESULTS_DIR, "report.md"));
  assert.equal(defaultPaths.toolCallLogPath, path.join(RESULTS_DIR, "tool-calls.md"));
});

test("this file's own write* calls never touch the real, shared RESULTS_DIR -- only TEST_DIR", () => {
  writeToolCallLog([{ turn: 1, role: "user", content: "isolation probe -- must not land in the real results dir" }], { dir: TEST_DIR });
  const realToolCallLogPath = pathsFor(RESULTS_DIR).toolCallLogPath;
  if (fs.existsSync(realToolCallLogPath)) {
    const realText = fs.readFileSync(realToolCallLogPath, "utf8");
    assert.ok(!realText.includes("isolation probe"), "a mocked unit test must never write into the real eval results directory");
  }
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

  writeReport({
    metrics, scopedMetrics, operationalStats, orchestratorResult, llmReviewText: "None observed.",
    interviewerModel: "gpt-test", personaModel: "gpt-test-persona", classifierModel: "gpt-test-classifier",
    dir: TEST_DIR,
  });
  const text = fs.readFileSync(REPORT_PATH, "utf8");

  assert.match(text, /Full domain/);
  assert.match(text, /Practical scope/);
  assert.match(text, /39\.2%/); // full-domain composite
  assert.match(text, /70\.0%/); // scoped composite
  assert.match(text, /tool-calls\.md/); // points readers at the new transparency log
  assert.match(text, /Classifier model: `gpt-test-classifier`/);
});
