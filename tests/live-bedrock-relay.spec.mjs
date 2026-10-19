import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL } from "./lib/page.mjs";
import { forwardToRealBedrock } from "./lib/liveProvider.mjs";

// Issue #183: the relay the live Bedrock suite and the eval scripts use to
// carry the page's real requests to bedrock-mantle. Same approach as
// live-azure-relay-backoff.spec.mjs: Node's global fetch (what the relay
// calls) is scripted -- deterministic, no key, no network.

const MANTLE = "https://bedrock-mantle.us-east-1.api.aws";

async function withRelayPage(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage();
  await page.goto(APP_URL);
  try { await fn(page); } finally { await browser.close(); }
}

function scripted(responses) {
  const calls = [];
  const real = global.fetch;
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    const { status, body, headers } = responses[Math.min(calls.length - 1, responses.length - 1)];
    return { status, headers: { get: (k) => (headers && headers[k.toLowerCase()]) || null }, text: async () => JSON.stringify(body) };
  };
  return { calls, restore: () => { global.fetch = real; } };
}

test("the relay forwards the app's own Authorization header and body to the same URL, GET and POST alike", async () => {
  const m = scripted([{ status: 200, body: { data: [] } }, { status: 200, body: { choices: [] } }]);
  try {
    await withRelayPage(async (page) => {
      const responses = forwardToRealBedrock(page, `${MANTLE}/**`);
      await page.evaluate(async (base) => {
        await fetch(`${base}/v1/models`, { headers: { Authorization: "Bearer ABSKpage" } });
        await fetch(`${base}/openai/v1/chat/completions`, { method: "POST", headers: { Authorization: "Bearer ABSKpage", "Content-Type": "application/json" }, body: JSON.stringify({ model: "openai.gpt-6.1-sol" }) });
      }, MANTLE);
      assert.equal(m.calls.length, 2);
      assert.equal(m.calls[0].url, `${MANTLE}/v1/models`);
      assert.equal(m.calls[0].init.method, "GET");
      assert.equal(m.calls[0].init.body, undefined);
      assert.equal(m.calls[1].url, `${MANTLE}/openai/v1/chat/completions`);
      assert.equal(m.calls[1].init.headers.Authorization, "Bearer ABSKpage", "the app's header, not one re-derived by the relay");
      assert.deepEqual(JSON.parse(m.calls[1].init.body), { model: "openai.gpt-6.1-sol" });
      assert.deepEqual(responses.map((r) => [r.status, r.url]), [[200, `${MANTLE}/v1/models`], [200, `${MANTLE}/openai/v1/chat/completions`]]);
    });
  } finally { m.restore(); }
});

test("a transient 429 is absorbed in the relay; the page sees only the final answer", async () => {
  const rate = { status: 429, body: { error: { message: "Too many requests" } }, headers: { "retry-after": "0.001" } };
  const m = scripted([rate, rate, { status: 200, body: { choices: [{ message: { content: "ok" } }] } }]);
  try {
    await withRelayPage(async (page) => {
      const responses = forwardToRealBedrock(page, `${MANTLE}/**`);
      const status = await page.evaluate(async (base) => (await fetch(`${base}/openai/v1/chat/completions`, { method: "POST", body: "{}" })).status, MANTLE);
      assert.equal(status, 200);
      assert.equal(m.calls.length, 3);
      assert.equal(responses[0].retries, 2);
    });
  } finally { m.restore(); }
}, { timeout: 30000 });
