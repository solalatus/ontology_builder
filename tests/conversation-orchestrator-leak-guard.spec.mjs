import { test } from "node:test";
import assert from "node:assert/strict";
import { withLeakGuard, trackToolActivityStreak, WASTED_TURN_THRESHOLD } from "./evals/lib/conversationOrchestrator.mjs";

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

test("trackToolActivityStreak reproduces the shape of both real Finding B incidents (68 and 159 consecutive no-activity turns) -- both cross the threshold well before the end", () => {
  for (const realIncidentLength of [68, 159]) {
    let state = { current: 0, max: 0 };
    let crossedAt = null;
    for (let turn = 1; turn <= realIncidentLength; turn++) {
      state = trackToolActivityStreak(state, false);
      if (state.crossedThreshold && crossedAt === null) crossedAt = turn;
    }
    assert.equal(crossedAt, WASTED_TURN_THRESHOLD, `a ${realIncidentLength}-turn dead loop must have been caught at turn ${WASTED_TURN_THRESHOLD}, not run to completion`);
  }
});
