import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL } from "./lib/page.mjs";
import { forwardToRealAzure } from "./lib/liveAzureOpenAi.mjs";

// Issue #133/E5 (external audit): forwardToRealAzure used to retry a
// transient 429 with only RATE_LIMIT_MAX_ATTEMPTS/rateLimitBackoffMs
// (1s/2s/4s, 4 attempts, ~7s total) -- the weakest retry of any real call
// site in this repo, even though the app agent's own calls carry the
// largest prompts of any call site (the growing transcript plus tool
// schemas) and are therefore the most likely to hit Azure's real
// tokens-per-minute budget. Now shares chatClient.mjs's own TPM-aware
// backoff (tpmBackoffMs/TPM_MAX_ATTEMPTS, 6 attempts) and honours
// Retry-After. Mirrors live-openai-relay-backoff.spec.mjs's own pattern:
// monkey-patches Node's global fetch (what the relay itself calls) with a
// scripted sequence -- deterministic, no API key, no real network. Uses a
// short-circuited retry-after=0 on every attempt so the test doesn't
// actually wait out tpmBackoffMs's real 30s-scale delays.

const CHAT_URL = "https://example-resource.openai.azure.com/openai/deployments/gpt-5.4/chat/completions**";

function scriptedFetch(responses) {
  let callIndex = 0;
  return async () => {
    const { status, body, headers } = responses[Math.min(callIndex, responses.length - 1)];
    callIndex++;
    return { status, headers: { get: (k) => (headers && headers[k.toLowerCase()]) || null }, text: async () => JSON.stringify(body) };
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

test("forwardToRealAzure retries a transient 429 past the old 4-attempt bound, up to the shared TPM-aware 6-attempt one", async () => {
  const realFetch = global.fetch;
  const calls = [];
  // Five 429s in a row (more than the old RATE_LIMIT_MAX_ATTEMPTS=4 total
  // attempts would have survived), then a real success on the 6th --
  // succeeding here is only possible if the retry bound is now 6, not 4.
  const scripted = scriptedFetch([
    { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } }, headers: { "retry-after": "0.001" } },
    { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } }, headers: { "retry-after": "0.001" } },
    { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } }, headers: { "retry-after": "0.001" } },
    { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } }, headers: { "retry-after": "0.001" } },
    { status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } }, headers: { "retry-after": "0.001" } },
    { status: 200, body: { id: "chatcmpl-test", choices: [{ message: { role: "assistant", content: "ok" } }] } },
  ]);
  global.fetch = async (...args) => { calls.push(args); return scripted(); };
  try {
    await withRelayPage(async (page) => {
      const responses = forwardToRealAzure(page, CHAT_URL);
      const result = await page.evaluate(async (url) => {
        const res = await fetch(url, { method: "POST", headers: { "api-key": "test-key" }, body: "{}" });
        return { status: res.status, body: await res.json() };
      }, CHAT_URL);

      assert.equal(calls.length, 6, "expected the relay to survive 5 transient 429s and succeed on the 6th attempt, past the old 4-attempt bound");
      assert.equal(result.status, 200, "the page must only ever see the eventual success, not an intermediate 429");
      assert.equal(responses[0].retries, 5, "the completed response should report how many 429 retries it absorbed");
    });
  } finally {
    global.fetch = realFetch;
  }
}, { timeout: 30000 });

test("forwardToRealAzure does not retry a permanent insufficient_quota error", async () => {
  const realFetch = global.fetch;
  const calls = [];
  const scripted = scriptedFetch([
    { status: 429, body: { error: { message: "You exceeded your current quota.", code: "insufficient_quota" } } },
  ]);
  global.fetch = async (...args) => { calls.push(args); return scripted(); };
  try {
    await withRelayPage(async (page) => {
      const responses = forwardToRealAzure(page, CHAT_URL);
      const result = await page.evaluate(async (url) => {
        const res = await fetch(url, { method: "POST", headers: { "api-key": "test-key" }, body: "{}" });
        return { status: res.status, body: await res.json() };
      }, CHAT_URL);

      assert.equal(calls.length, 1, "a permanent quota error must not be retried");
      assert.equal(result.status, 429);
      assert.equal(responses[0].retries, 0);
    });
  } finally {
    global.fetch = realFetch;
  }
});
