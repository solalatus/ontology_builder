import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL } from "./lib/page.mjs";
import { forwardToRealOpenAi, CHAT_URL } from "./lib/liveOpenAi.mjs";

// forwardToRealOpenAi (tests/lib/liveOpenAi.mjs) relays a page's real
// outgoing request to Node's own fetch() and back -- used by every live
// OpenAI test/eval to work around this sandbox's browser-side CORS/network
// restrictions (see that file's own header comment). It now retries a
// transient 429 with backoff *inside the relay*, before ever calling
// route.fulfill(): a real confirmatory eval run hit exactly this (three
// "Failed to load resource: 429" console errors during model discovery
// killed the run before it even reached the interview), and withPage()'s
// strict "no console/page errors" assertion means the page must never see
// a failed intermediate attempt, only the eventual outcome.
//
// Monkey-patches Node's global fetch (what the relay itself calls) with a
// scripted sequence instead of hitting the real network -- deterministic,
// no API key required, and isolates the relay's own retry logic from
// whatever the real OpenAI API happens to be doing right now.

function scriptedFetch(responses) {
  let callIndex = 0;
  return async () => {
    const { status, body } = responses[Math.min(callIndex, responses.length - 1)];
    callIndex++;
    return { status, text: async () => JSON.stringify(body) };
  };
}

async function withRelayPage(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage();
  await page.goto(APP_URL);
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
}

test("forwardToRealOpenAi retries a transient 429 internally, and the page only ever sees the eventual success", async () => {
  const realFetch = global.fetch;
  const calls = [];
  const scripted = scriptedFetch([
    { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } } },
    { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } } },
    { status: 200, body: { id: "chatcmpl-test", choices: [{ message: { role: "assistant", content: "ok" } }] } },
  ]);
  global.fetch = async (...args) => {
    calls.push(args);
    return scripted();
  };
  try {
    await withRelayPage(async (page) => {
      const responses = forwardToRealOpenAi(page, CHAT_URL);
      const result = await page.evaluate(async (url) => {
        const res = await fetch(url, { method: "POST", headers: { Authorization: "Bearer sk-test" }, body: "{}" });
        return { status: res.status, body: await res.json() };
      }, CHAT_URL);

      assert.equal(calls.length, 3, "expected the relay to retry the two transient 429s before succeeding");
      assert.equal(result.status, 200, "the page must only ever see the eventual success, not an intermediate 429");
      assert.equal(result.body.choices[0].message.content, "ok");
      assert.equal(responses.length, 1, "one relayed request should produce exactly one recorded (final) response, not one per attempt");
      assert.equal(responses[0].status, 200);
    });
  } finally {
    global.fetch = realFetch;
  }
});

test("forwardToRealOpenAi does not retry a permanent insufficient_quota error", async () => {
  const realFetch = global.fetch;
  const calls = [];
  const scripted = scriptedFetch([
    { status: 429, body: { error: { message: "You exceeded your current quota.", code: "insufficient_quota" } } },
  ]);
  global.fetch = async (...args) => {
    calls.push(args);
    return scripted();
  };
  try {
    await withRelayPage(async (page) => {
      const responses = forwardToRealOpenAi(page, CHAT_URL);
      const result = await page.evaluate(async (url) => {
        const res = await fetch(url, { method: "POST", headers: { Authorization: "Bearer sk-test" }, body: "{}" });
        return { status: res.status, body: await res.json() };
      }, CHAT_URL);

      assert.equal(calls.length, 1, "a permanent quota error must not be retried");
      assert.equal(result.status, 429);
      assert.equal(result.body.error.code, "insufficient_quota");
      assert.equal(responses.length, 1);
      assert.equal(responses[0].status, 429);
    });
  } finally {
    global.fetch = realFetch;
  }
});

test("forwardToRealOpenAi gives up after a bounded number of attempts against a rate limit that never clears", async () => {
  const realFetch = global.fetch;
  const calls = [];
  const scripted = scriptedFetch([
    { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } } },
  ]);
  global.fetch = async (...args) => {
    calls.push(args);
    return scripted();
  };
  try {
    await withRelayPage(async (page) => {
      forwardToRealOpenAi(page, CHAT_URL);
      const result = await page.evaluate(async (url) => {
        const res = await fetch(url, { method: "POST", headers: { Authorization: "Bearer sk-test" }, body: "{}" });
        return { status: res.status };
      }, CHAT_URL);

      assert.equal(calls.length, 4, "expected exactly 4 total attempts (1 initial + 3 retries), not an unbounded retry loop");
      assert.equal(result.status, 429, "the page should finally see the terminal failure once retries are exhausted");
    });
  } finally {
    global.fetch = realFetch;
  }
});
