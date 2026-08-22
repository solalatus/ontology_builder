import { test } from "node:test";
import assert from "node:assert/strict";
import { chatOnce, chatMessagesOnce } from "./evals/lib/chatClient.mjs";

// Issue #133/Finding C: chatOnce only ever accepted a single system+user
// pair, so a caller with a real multi-turn conversation (personaAgent.mjs's
// own growing `messages` array) had to flatten every prior turn into one
// undifferentiated blob to use it -- the exact pattern that caused a real
// persona to re-emit its scripted opening line on all 19 turns of a run
// once role boundaries were lost (see cq-non-regression.mjs's own header).
// chatOnce and chatMessagesOnce now share one retry/request core
// (chatRequest); these tests monkey-patch global fetch to verify each
// public function still builds the request shape its own name promises,
// deterministic, no API key, no real network.

function withMockedFetch(body, fn) {
  const realFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true, status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify(body),
    };
  };
  return (async () => {
    try { return await fn(calls); } finally { global.fetch = realFetch; }
  })();
}

const OK_BODY = { choices: [{ message: { content: "reply text" }, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }, model: "gpt-5.4" };
const CONFIG = { provider: "azure", endpoint: "https://example-resource.openai.azure.com", apiKey: "test-key", apiVersion: "2024-12-01-preview" };

test("chatOnce sends exactly a system+user pair, roles intact", async () => {
  await withMockedFetch(OK_BODY, async (calls) => {
    const result = await chatOnce({ config: CONFIG, model: "gpt-5.4", systemPrompt: "You are a judge.", userPrompt: "Compare these two.", label: "test" });
    assert.equal(result.reply, "reply text");
    const sentBody = JSON.parse(calls[0].init.body);
    assert.deepEqual(sentBody.messages, [
      { role: "system", content: "You are a judge." },
      { role: "user", content: "Compare these two." },
    ]);
  });
});

test("chatMessagesOnce sends a real multi-turn array exactly as given, roles intact -- no flattening", async () => {
  const conversation = [
    { role: "system", content: "You are the persona." },
    { role: "user", content: "What classes matter here?" },
    { role: "assistant", content: "A temperature sensor and a setpoint." },
    { role: "user", content: "Anything else?" },
  ];
  await withMockedFetch(OK_BODY, async (calls) => {
    const result = await chatMessagesOnce({ config: CONFIG, model: "gpt-5.4", messages: conversation, label: "test" });
    assert.equal(result.reply, "reply text");
    const sentBody = JSON.parse(calls[0].init.body);
    assert.deepEqual(sentBody.messages, conversation, "the real multi-turn array must be sent exactly as given, not flattened into one blob");
    // Assistant turns are a first-class role in the wire request, not text
    // merged into a "user" message -- the actual bug this fix addresses.
    assert.equal(sentBody.messages.filter((m) => m.role === "assistant").length, 1);
  });
});

// Issue #133/E16 (external audit): a 200-OK-but-empty reply used to throw
// immediately with no retry -- distinct from the 429/5xx retry loop, which
// only covers a failed HTTP response. Reasoning-tier models genuinely
// return empty content sometimes when a turn's budget goes entirely to
// reasoning; one retry of the exact same request absorbs that transient
// case.
test("chatOnce retries once on a 200-OK-but-empty reply, and succeeds if the retry has real content", async () => {
  const EMPTY_BODY = { choices: [{ message: { content: "" }, finish_reason: "stop" }], usage: null, model: "gpt-5.4" };
  let callCount = 0;
  const realFetch = global.fetch;
  global.fetch = async () => {
    callCount++;
    const body = callCount === 1 ? EMPTY_BODY : OK_BODY;
    return { ok: true, status: 200, headers: { get: () => null }, text: async () => JSON.stringify(body) };
  };
  try {
    const result = await chatOnce({ config: CONFIG, model: "gpt-5.4", systemPrompt: "s", userPrompt: "u", label: "test" });
    assert.equal(callCount, 2, "expected exactly one retry after the first empty reply");
    assert.equal(result.reply, "reply text");
  } finally {
    global.fetch = realFetch;
  }
});

test("chatOnce throws when the reply is empty twice in a row, not an unbounded retry loop", async () => {
  const EMPTY_BODY = { choices: [{ message: { content: "" }, finish_reason: "stop" }], usage: null, model: "gpt-5.4" };
  let callCount = 0;
  const realFetch = global.fetch;
  global.fetch = async () => {
    callCount++;
    return { ok: true, status: 200, headers: { get: () => null }, text: async () => JSON.stringify(EMPTY_BODY) };
  };
  try {
    await assert.rejects(
      () => chatOnce({ config: CONFIG, model: "gpt-5.4", systemPrompt: "s", userPrompt: "u", label: "test" }),
      /empty reply twice in a row/,
    );
    assert.equal(callCount, 2, "expected exactly 2 total attempts (1 initial + 1 retry), not an unbounded loop");
  } finally {
    global.fetch = realFetch;
  }
});

test("chatMessagesOnce and chatOnce agree on the reply/usage shape they return", async () => {
  await withMockedFetch(OK_BODY, async () => {
    const viaMessages = await chatMessagesOnce({ config: CONFIG, model: "gpt-5.4", messages: [{ role: "system", content: "s" }, { role: "user", content: "u" }], label: "test" });
    const viaOnce = await chatOnce({ config: CONFIG, model: "gpt-5.4", systemPrompt: "s", userPrompt: "u", label: "test" });
    assert.deepEqual(viaMessages, viaOnce, "both public functions share the same request/response core, so an equivalent call must return an identical result");
  });
});
