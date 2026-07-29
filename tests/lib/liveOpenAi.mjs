import assert from "node:assert/strict";
import { APP_URL } from "./page.mjs";
import { launchChromium } from "./browser.mjs";

// Shared plumbing for driving the app's real helper agent against the
// genuine OpenAI API, reused by tests/helper-agent-live-openai.spec.mjs and
// tests/evals/ontology-recovery.eval.spec.mjs. See the live-openai spec's
// own file header for the full rationale (why a real headless Chromium in
// this sandbox can't reach api.openai.com directly, and why relaying
// through Node's own fetch() from inside page.route() is the fix).

export const MODELS_URL = "https://api.openai.com/v1/models";
export const CHAT_URL = "https://api.openai.com/v1/chat/completions";

// Same backoff shape as index.html's own AGENT_RATE_LIMIT_MAX_ATTEMPTS --
// a real, shared account/org rate limit under real API load (this sandbox's
// own live test/eval runs all draw on the same key) produces a genuine
// transient 429 fairly often, and retrying it *inside the relay* matters
// for a reason client-side retries alone can't fix: withPage() (page.mjs)
// asserts zero console/page errors, and Chromium logs its own "Failed to
// load resource: ... 429" console message for *every* non-2xx response it
// receives, even one a caller's own retry loop recovers from. If the relay
// forwarded each failed attempt back to the page before eventually
// succeeding, the page would still see (and log) every intermediate
// failure and the test would fail regardless of the final outcome. Retrying
// here, before ever calling route.fulfill(), means the page only ever sees
// one response per request -- the eventual success, or the final failure --
// exactly like a real (non-relayed) client would experience a single slow
// call rather than several distinct failed ones.
const RELAY_RATE_LIMIT_MAX_ATTEMPTS = 4; // 1 initial try + 3 retries
function relayRateLimitBackoffMs(attempt) {
  return Math.min(1000 * 2 ** (attempt - 1), 4000); // 1s, 2s, 4s
}
function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Relays the app's real outgoing request to the real OpenAI API and relays
// the real response back untouched (after retrying a transient 429 -- see
// above). Returns the array of real, final response bodies seen, in order
// (one per relayed request, post-retry), for callers that want to inspect
// what the live API actually sent back.
export function forwardToRealOpenAi(page, url) {
  const responses = [];
  page.route(url, async (route) => {
    const req = route.request();
    let res, text;
    for (let attempt = 1; attempt <= RELAY_RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
      try {
        res = await fetch(url, {
          method: req.method(),
          headers: { Authorization: req.headers()["authorization"], "Content-Type": "application/json" },
          body: req.postData(),
        });
        text = await res.text();
      } catch (err) {
        await route.fulfill({ status: 599, contentType: "application/json", body: JSON.stringify({ error: { message: String(err) } }) });
        return;
      }
      if (res.status !== 429 || attempt >= RELAY_RATE_LIMIT_MAX_ATTEMPTS) break;
      let parsedErr = null;
      try { parsedErr = JSON.parse(text); } catch (err) { /* non-JSON error body */ }
      const isPermanentQuotaError = parsedErr && parsedErr.error && parsedErr.error.code === "insufficient_quota";
      if (isPermanentQuotaError) break; // no amount of waiting fixes this one
      await sleepMs(relayRateLimitBackoffMs(attempt));
    }
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (err) { /* non-JSON body, leave parsed null */ }
    responses.push({ status: res.status, body: parsed });
    await route.fulfill({ status: res.status, contentType: "application/json", body: text });
  });
  return responses;
}

export async function openPanel(page) {
  const expanded = await page.evaluate(() => window.__kg.agent.isExpanded());
  if (!expanded) await page.click("#agent-panel-toggle");
}

// Drives the real connect flow with a real key: real GET /v1/models
// (relayed, see forwardToRealOpenAi), real default-model selection against
// the real returned list, then finalizes. Returns the real model list.
export async function connectAgentLive(page, apiKey) {
  const modelResponses = forwardToRealOpenAi(page, MODELS_URL);
  await openPanel(page);
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", apiKey);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 30000 });
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 30000 });
  return modelResponses;
}

export async function sendChatMessage(page, text, { timeout = 60000 } = {}) {
  await page.fill("#agent-chat-input", text);
  await page.click("#agent-chat-send");
  await page.waitForFunction(() => !window.__kg.agent.isSending(), null, { timeout });
}

// Mirrors withPage() (tests/lib/page.mjs), but tolerates the console
// message Chromium itself logs for a real, non-2xx fetch() response
// ("Failed to load resource: ...") -- the browser's own devtools-style
// resource log, not an application error. Needed whenever a test
// deliberately triggers a real non-2xx response (e.g. an invalid key).
export async function withPageAllowingResourceErrors(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
  const unexpected = consoleErrors.filter((m) => !/Failed to load resource/.test(m));
  assert.deepEqual(unexpected, [], "expected no console/page errors other than the real fetch failure's own resource-load log");
}
