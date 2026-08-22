import { test } from "node:test";
import assert from "node:assert/strict";
import { createPersonaAgent } from "./evals/lib/personaAgent.mjs";
import { appearsFinished } from "./evals/lib/conversationOrchestrator.mjs";
import { generateLlmReview } from "./evals/lib/reportGenerator.mjs";

// The relay (tests/lib/liveOpenAi.mjs, see live-openai-relay-backoff.spec.mjs)
// isn't the only real API call site in the eval harness -- personaAgent.mjs,
// conversationOrchestrator.mjs's appearsFinished classifier, and
// reportGenerator.mjs's generateLlmReview all make their own direct
// fetch() calls, outside the browser/relay entirely. A real eval run hit
// exactly this gap: the persona's own call failed on a transient 429
// ~98 seconds into a genuine conversation, well past the connect-flow
// retries the relay already covers, with no retry logic of its own. All
// three now share the same backoff (tests/lib/liveOpenAi.mjs's
// RATE_LIMIT_MAX_ATTEMPTS/rateLimitBackoffMs/isInsufficientQuotaError) as
// callAgentChatRaw and the relay. These tests monkey-patch Node's global
// fetch with a scripted sequence -- deterministic, no API key, no real
// network.

function scriptedFetch(responses) {
  let callIndex = 0;
  return async () => {
    const { status, body } = responses[Math.min(callIndex, responses.length - 1)];
    callIndex++;
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
}

function withMockedFetch(responses, fn) {
  const realFetch = global.fetch;
  const calls = [];
  const scripted = scriptedFetch(responses);
  global.fetch = async (...args) => {
    calls.push(args);
    return scripted();
  };
  return (async () => {
    try {
      return await fn(calls);
    } finally {
      global.fetch = realFetch;
    }
  })();
}

test("personaAgent retries a transient rate limit and succeeds once it recovers", async () => {
  await withMockedFetch(
    [
      { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } } },
      { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } } },
      { status: 200, body: { choices: [{ message: { role: "assistant", content: "Sure, happy to continue." } }] } },
    ],
    async (calls) => {
      const persona = createPersonaAgent({ apiKey: "sk-test", model: "gpt-test" });
      const result = await persona.reply("Can you tell me more about incident severity?");
      assert.equal(result.text, "Sure, happy to continue.");
      assert.equal(calls.length, 3, "expected the two failed attempts plus the eventual success");
    }
  );
});

test("personaAgent does not retry a permanent insufficient_quota error", async () => {
  await withMockedFetch(
    [{ status: 429, body: { error: { message: "You exceeded your current quota.", code: "insufficient_quota" } } }],
    async (calls) => {
      const persona = createPersonaAgent({ apiKey: "sk-test", model: "gpt-test" });
      await assert.rejects(() => persona.reply("hello"), /persona agent call failed: HTTP 429/);
      assert.equal(calls.length, 1, "a permanent quota error must not be retried");
    }
  );
});

test("appearsFinished retries a transient rate limit and succeeds once it recovers", async () => {
  await withMockedFetch(
    [
      { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } } },
      { status: 200, body: { choices: [{ message: { role: "assistant", content: "phase 9 / final wrap-up\nYES" } }] } },
    ],
    async (calls) => {
      const result = await appearsFinished("The ontology interview is now complete.", { apiKey: "sk-test", model: "gpt-test" });
      assert.equal(result, true);
      assert.equal(calls.length, 2, "expected the one failed attempt plus the eventual success");
    }
  );
});

// Issue #133/E16 (external audit): this used to assert appearsFinished
// *threw* on a permanent classifier failure, taking the entire run down
// with it over one failed "is this finished?" check. Now degrades to
// "not finished" instead -- the conservative direction, since the run
// keeps going rather than ending prematurely, and the failure itself is
// still not silently retried indefinitely (still exactly 1 call).
test("appearsFinished does not retry a permanent insufficient_quota error, and degrades to \"not finished\" rather than crashing the run", async () => {
  await withMockedFetch(
    [{ status: 429, body: { error: { message: "You exceeded your current quota.", code: "insufficient_quota" } } }],
    async (calls) => {
      const result = await appearsFinished("some interviewer message", { apiKey: "sk-test", model: "gpt-test" });
      assert.equal(result, false, "a failed classifier call must default to \"not finished\", not crash the run");
      assert.equal(calls.length, 1, "a permanent quota error must not be retried");
    }
  );
});

test("appearsFinished degrades to \"not finished\" when a `chat` override throws, instead of crashing the run", async () => {
  const chat = async () => { throw new Error("provider returned an empty reply twice in a row"); };
  const result = await appearsFinished("some interviewer message", { apiKey: "unused", model: "gpt-test", chat });
  assert.equal(result, false);
});

test("generateLlmReview retries a transient rate limit and succeeds once it recovers", async () => {
  await withMockedFetch(
    [
      { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } } },
      { status: 200, body: { choices: [{ message: { role: "assistant", content: "## Errors\nNone observed.\n## Noteworthy observations\nNone observed." } }] } },
    ],
    async (calls) => {
      const orchestratorResult = { log: [{ turn: 0, speaker: "persona", text: "hi" }] };
      const review = await generateLlmReview({ apiKey: "sk-test", model: "gpt-test", orchestratorResult });
      assert.match(review, /None observed/);
      assert.equal(calls.length, 2, "expected the one failed attempt plus the eventual success");
    }
  );
});

test("generateLlmReview degrades to a soft-fail message (not a throw) once retries are exhausted against a rate limit that never clears", async () => {
  await withMockedFetch(
    [{ status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } } }],
    async (calls) => {
      const orchestratorResult = { log: [{ turn: 0, speaker: "persona", text: "hi" }] };
      const review = await generateLlmReview({ apiKey: "sk-test", model: "gpt-test", orchestratorResult });
      assert.match(review, /LLM review call failed: HTTP 429/);
      assert.equal(calls.length, 4, "expected exactly 4 total attempts (1 initial + 3 retries), not an unbounded retry loop");
    }
  );
});
