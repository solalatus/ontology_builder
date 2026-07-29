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

// Relays the app's real outgoing request to the real OpenAI API and relays
// the real response back untouched. Returns the array of real response
// bodies seen, in order, for callers that want to inspect what the live API
// actually sent back.
export function forwardToRealOpenAi(page, url) {
  const responses = [];
  page.route(url, async (route) => {
    const req = route.request();
    let res, text;
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
