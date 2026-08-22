import { test } from "node:test";
import assert from "node:assert/strict";
import { withLeakGuard, trackToolActivityStreak, WASTED_TURN_THRESHOLD, excludeAlreadySaidByInterviewer, runOntologyRecoveryConversation } from "./evals/lib/conversationOrchestrator.mjs";

// Issue #133 (external audit self-review): withLeakGuard was extracted out
// of runOntologyRecoveryConversation's own inline closure specifically so
// this retry/pop/exhaust logic could be exercised directly with a fake
// reply() -- the inline version could only be reached through the full
// turn loop, which needs a live Playwright page and a real or mocked API
// call. These tests drive it with a scripted reply() and a fake
// popLastExchange()/messages array, no browser or network involved.

function fakeReply(scriptedTexts) {
  const calls = [];
  let i = 0;
  const fn = async (incomingText) => {
    calls.push(incomingText);
    const text = scriptedTexts[Math.min(i, scriptedTexts.length - 1)];
    i++;
    return { text, usage: null };
  };
  return { fn, calls };
}

test("withLeakGuard returns the reply unchanged, with no leaked identifiers, when it never leaks", async () => {
  const { fn, calls } = fakeReply(["a perfectly clean natural-language reply"]);
  const result = await withLeakGuard({
    reply: fn,
    incomingText: "hello",
    leakCandidates: new Set(["AirHandlingUnit"]),
    maxRetries: 2,
  });
  assert.equal(result.reply.text, "a perfectly clean natural-language reply");
  assert.deepEqual(result.leaked, []);
  assert.equal(result.exhausted, undefined);
  assert.equal(calls.length, 1, "a clean first reply must not trigger any retry");
});

test("withLeakGuard is a pass-through no-op when leakCandidates is null (no .domain.yaml ground truth to check against)", async () => {
  const { fn, calls } = fakeReply(["I'd call it AirHandlingUnit, whatever that means to this test"]);
  const result = await withLeakGuard({ reply: fn, incomingText: "hello", leakCandidates: null });
  assert.deepEqual(result.leaked, []);
  assert.equal(calls.length, 1);
});

test("withLeakGuard retries once on a leaking first reply and returns the clean retry, marking the leak event resolved", async () => {
  const { fn, calls } = fakeReply([
    "I'd call it AirHandlingUnit",
    "I'd call it an air handling unit",
  ]);
  const events = [];
  let poppedCount = 0;
  const result = await withLeakGuard({
    reply: fn,
    popLastExchange: () => { poppedCount++; },
    incomingText: "what do you call it",
    leakCandidates: new Set(["AirHandlingUnit"]),
    maxRetries: 2,
    onLeakAttempt: (event) => events.push(event),
  });
  assert.equal(result.reply.text, "I'd call it an air handling unit");
  assert.deepEqual(result.leaked, []);
  assert.equal(result.exhausted, undefined);
  assert.equal(calls.length, 2, "one original call plus one retry");
  assert.equal(poppedCount, 1, "popLastExchange must be called exactly once, before the retry");
  assert.equal(events.length, 1, "exactly one leak attempt was recorded");
  assert.equal(events[0].resolved, true, "the recorded event must be mutated to resolved once the retry came back clean");
});

// Issue #133/N5 (independent audit of this same fix): a retry must not
// just resend the identical text -- it should carry a corrective note
// naming exactly what leaked, per item 4's own original spec.
test("withLeakGuard's retry appends a corrective note naming exactly what leaked, not a resend of the identical prompt", async () => {
  const { fn, calls } = fakeReply([
    "I'd call it AirHandlingUnit",
    "I'd call it an air handling unit",
  ]);
  await withLeakGuard({
    reply: fn,
    incomingText: "what do you call it",
    leakCandidates: new Set(["AirHandlingUnit"]),
    maxRetries: 2,
  });
  assert.equal(calls[0], "what do you call it", "the first call is the real, unmodified interviewer message");
  assert.notEqual(calls[1], calls[0], "the retry must not be an identical resend");
  assert.match(calls[1], /^what do you call it/, "the retry still carries the original interviewer message");
  assert.match(calls[1], /AirHandlingUnit/, "the retry names exactly which identifier leaked");
  assert.match(calls[1], /not part of the interviewer/i, "the corrective note must be framed as internal, never attributable to the real interviewer");
});

test("withLeakGuard exhausts after maxRetries and returns exhausted:true with the leak still present, never silently patching the text", async () => {
  const { fn, calls } = fakeReply(["I'd call it AirHandlingUnit"]); // leaks every single time, deterministic fake
  const events = [];
  let poppedCount = 0;
  const result = await withLeakGuard({
    reply: fn,
    popLastExchange: () => { poppedCount++; },
    incomingText: "what do you call it",
    leakCandidates: new Set(["AirHandlingUnit"]),
    maxRetries: 2,
    onLeakAttempt: (event) => events.push(event),
  });
  assert.equal(result.exhausted, true);
  assert.deepEqual(result.leaked, ["AirHandlingUnit"]);
  assert.equal(result.reply.text, "I'd call it AirHandlingUnit", "the last (still-leaking) reply is returned, not discarded or rewritten");
  assert.equal(calls.length, 3, "1 original + 2 retries = 3 total calls for maxRetries=2");
  assert.equal(poppedCount, 2, "popLastExchange runs once per retry, not once per attempt including the last exhausted one");
  assert.equal(events.length, 3, "one leak event per attempt, including the final exhausted one");
  assert.ok(events.every((e) => e.resolved === false), "none of the events are ever marked resolved when the call ultimately exhausts");
});

test("withLeakGuard works with no popLastExchange or onLeakAttempt callbacks at all (both optional)", async () => {
  const { fn } = fakeReply(["I'd call it AirHandlingUnit", "an air handling unit"]);
  const result = await withLeakGuard({
    reply: fn,
    incomingText: "what do you call it",
    leakCandidates: new Set(["AirHandlingUnit"]),
    maxRetries: 1,
  });
  assert.deepEqual(result.leaked, []);
  assert.equal(result.reply.text, "an air handling unit");
});

test("withLeakGuard defaults maxRetries to 2 when not given", async () => {
  const { fn, calls } = fakeReply(["I'd call it AirHandlingUnit"]);
  const result = await withLeakGuard({
    reply: fn,
    incomingText: "what do you call it",
    leakCandidates: new Set(["AirHandlingUnit"]),
  });
  assert.equal(result.exhausted, true);
  assert.equal(calls.length, 3, "default maxRetries=2 means 1 original + 2 retries");
});

// Issue #133/item 8: trackToolActivityStreak is the pure state-transition
// step behind the general stall detector -- driven directly here with a
// scripted sequence of true/false tool-activity flags, no page/API needed.
test("trackToolActivityStreak resets to 0 on any turn with tool activity", () => {
  const result = trackToolActivityStreak({ current: 5, max: 8 }, true);
  assert.deepEqual(result, { current: 0, max: 8, crossedThreshold: false });
});

test("trackToolActivityStreak increments current and tracks the running max on a no-activity turn", () => {
  const first = trackToolActivityStreak({ current: 0, max: 0 }, false);
  assert.deepEqual(first, { current: 1, max: 1, crossedThreshold: false });
  const second = trackToolActivityStreak(first, false);
  assert.deepEqual(second, { current: 2, max: 2, crossedThreshold: false });
});

test("trackToolActivityStreak preserves the running max across a reset -- a later no-activity turn doesn't lose the earlier high-water mark", () => {
  let state = { current: 0, max: 0 };
  for (let i = 0; i < 10; i++) state = trackToolActivityStreak(state, false);
  assert.equal(state.max, 10);
  state = trackToolActivityStreak(state, true); // reset
  assert.equal(state.current, 0);
  assert.equal(state.max, 10, "the earlier streak's high-water mark must survive the reset");
  state = trackToolActivityStreak(state, false);
  assert.equal(state.current, 1);
  assert.equal(state.max, 10, "a fresh, still-short streak must not overwrite the earlier higher max");
});

test("trackToolActivityStreak crosses the threshold at exactly WASTED_TURN_THRESHOLD consecutive no-activity turns, not one before", () => {
  let state = { current: 0, max: 0 };
  for (let i = 0; i < WASTED_TURN_THRESHOLD - 1; i++) {
    state = trackToolActivityStreak(state, false);
    assert.equal(state.crossedThreshold, false, `must not cross before turn ${WASTED_TURN_THRESHOLD}`);
  }
  state = trackToolActivityStreak(state, false);
  assert.equal(state.current, WASTED_TURN_THRESHOLD);
  assert.equal(state.crossedThreshold, true);
});

// Issue #133/N2 (independent audit of this same fix): the real pathological
// streak lengths, as measured by replaying the detector over the two real
// Finding B incidents' actual committed transcripts (brick-hvac/run-02,
// iof-maintenance/run-03) -- not the earlier prose estimate (~68/~159) this
// test originally used, which undercounted slightly.
test("trackToolActivityStreak reproduces the shape of both real Finding B incidents (160 and 171 consecutive no-activity turns) -- both cross the threshold well before the end", () => {
  for (const realIncidentLength of [160, 171]) {
    let state = { current: 0, max: 0 };
    let crossedAt = null;
    for (let turn = 1; turn <= realIncidentLength; turn++) {
      state = trackToolActivityStreak(state, false);
      if (state.crossedThreshold && crossedAt === null) crossedAt = turn;
    }
    assert.equal(crossedAt, WASTED_TURN_THRESHOLD, `a ${realIncidentLength}-turn dead loop must have been caught at turn ${WASTED_TURN_THRESHOLD}, not run to completion`);
  }
});

// Issue #133/N2: the real measured high-water mark across every
// legitimately-finished run in the real committed archive (20 turns, in
// iof-supply-chain/run-01) must NOT trip the detector -- the whole point of
// raising the threshold was to put real margin between this number and the
// pathological streaks above.
test("trackToolActivityStreak does not cross the threshold for the real measured healthy-run high-water mark (20 consecutive no-activity turns)", () => {
  let state = { current: 0, max: 0 };
  for (let turn = 1; turn <= 20; turn++) state = trackToolActivityStreak(state, false);
  assert.equal(state.crossedThreshold, false, "a genuinely healthy run's own real worst streak must not trip the detector");
  assert.ok(WASTED_TURN_THRESHOLD - 20 >= 40, "the margin between the real healthy high-water mark and the threshold should be generous, not tight");
});

// Issue #133/N1 (independent audit of this same fix): excludeAlreadySaidByInterviewer
// is the fix for the guard's own false-positive class -- an ordinary
// "interviewer proposes X, persona confirms X" exchange.
test("excludeAlreadySaidByInterviewer removes only identifiers already said, leaving genuinely novel ones", () => {
  const candidates = new Set(["AirHandlingUnit", "hasBorrower", "needsCoolingFromSetpoint"]);
  const alreadySaid = new Set(["AirHandlingUnit"]);
  const effective = excludeAlreadySaidByInterviewer(candidates, alreadySaid);
  assert.deepEqual(effective, new Set(["hasBorrower", "needsCoolingFromSetpoint"]));
});

test("excludeAlreadySaidByInterviewer passes null through unchanged (no .domain.yaml ground truth to guard)", () => {
  assert.equal(excludeAlreadySaidByInterviewer(null, new Set(["x"])), null);
});

test("excludeAlreadySaidByInterviewer returns the full set unchanged when the interviewer has said nothing yet", () => {
  const candidates = new Set(["AirHandlingUnit", "hasBorrower"]);
  const effective = excludeAlreadySaidByInterviewer(candidates, new Set());
  assert.deepEqual(effective, candidates);
});

// Issue #133/N1: the exact real failure mode, reproduced end to end with
// withLeakGuard + excludeAlreadySaidByInterviewer wired together the same
// way the orchestrator wires them -- the interviewer proposes a name, the
// persona simply confirms it verbatim, and that alone must never trigger a
// retry or an abort.
test("withLeakGuard + excludeAlreadySaidByInterviewer together: a persona reply that only echoes an interviewer-proposed identifier is not a leak", async () => {
  const leakCandidates = new Set(["QualificationSpecification"]);
  const interviewerText = "Should I record this class as QualificationSpecification?";
  const identifiersSaidByInterviewer = new Set(findLeakedIdentifiersLike(interviewerText, leakCandidates));
  const effective = excludeAlreadySaidByInterviewer(leakCandidates, identifiersSaidByInterviewer);

  const { fn, calls } = fakeReply(["Yes, QualificationSpecification is exactly right."]);
  const result = await withLeakGuard({ reply: fn, incomingText: interviewerText, leakCandidates: effective, maxRetries: 2 });

  assert.deepEqual(result.leaked, []);
  assert.equal(result.exhausted, undefined);
  assert.equal(calls.length, 1, "a pure echo-back of an interviewer-proposed identifier must never trigger a retry");
});

test("withLeakGuard + excludeAlreadySaidByInterviewer together: a persona reply introducing a DIFFERENT, genuinely novel identifier is still caught", async () => {
  const leakCandidates = new Set(["needsCoolingFromSetpoint"]);
  const interviewerText = "Do you want this recorded as needsCooling?"; // a different, non-matching string -- the interviewer never said the real identifier
  const identifiersSaidByInterviewer = new Set(findLeakedIdentifiersLike(interviewerText, leakCandidates));
  const effective = excludeAlreadySaidByInterviewer(leakCandidates, identifiersSaidByInterviewer);
  assert.deepEqual(effective, leakCandidates, "the interviewer's near-miss guess must not exclude the real identifier");

  const { fn } = fakeReply(["I'd use needsCoolingFromSetpoint instead."]);
  const result = await withLeakGuard({ reply: fn, incomingText: interviewerText, leakCandidates: effective, maxRetries: 0 });
  assert.deepEqual(result.leaked, ["needsCoolingFromSetpoint"]);
  assert.equal(result.exhausted, true, "a genuinely novel leaked identifier must still be caught");
});

// Minimal stand-in for findLeakedIdentifiers (leakDetector.mjs) -- exact
// same word-boundary semantics, kept local so this file doesn't need to
// import leakDetector.mjs just for two tests.
function findLeakedIdentifiersLike(text, candidateSet) {
  const found = [];
  for (const id of candidateSet) {
    if (new RegExp(`\\b${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text)) found.push(id);
  }
  return found;
}

// Issue #133/N7b (independent audit of this same fix): a caller passing a
// real, non-default groundTruthFilename but forgetting
// groundTruthFormat: "domain-yaml" used to silently run with both defenses
// disabled. Checked before any live page/API interaction, so this can be
// tested with no real page or apiKey at all.
test("runOntologyRecoveryConversation throws before doing any real work when groundTruthFilename is set but groundTruthFormat isn't \"domain-yaml\"", async () => {
  await assert.rejects(
    () => runOntologyRecoveryConversation({
      page: null, apiKey: "unused", personaPath: "/dev/null", groundTruthText: "classes: {}",
      groundTruthFilename: "reference.domain.yaml", // real domain filename, format forgotten
    }),
    /groundTruthFormat/,
  );
});

test("runOntologyRecoveryConversation does not throw the N7b check when groundTruthFilename is left at its itops default", async () => {
  // Reaches real work past the check (page: null), so it must fail for a
  // DIFFERENT reason (a null page has no .evaluate) -- not the N7b guard.
  await assert.rejects(
    () => runOntologyRecoveryConversation({ page: null, apiKey: "unused" }),
    (err) => !/groundTruthFormat/.test(err.message),
  );
});
