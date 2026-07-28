import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, APP_URL } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// Helper Agent (helper_agent_plan.md), Phase 1: collapsed/expanded panel,
// BYOK connect modal, live GET /v1/models call (doubles as the real-world
// CORS check per plan §3), default-model heuristic with manual override.
// No chat-turn API calls yet (Phase 2) — the connected panel's send button
// stays disabled here on purpose.
//
// All OpenAI calls are mocked via page.route(); this suite never makes a
// real network request, so it needs no API key and is deterministic in CI.

const MODELS_URL = "https://api.openai.com/v1/models";

function mockModelsRoute(page, { status = 200, models = null } = {}) {
  return page.route(MODELS_URL, (route) => {
    if (status !== 200) {
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ error: { message: "mocked failure" } }) });
      return;
    }
    const data = (models || defaultModelList()).map((m) => ({ id: m.id, object: "model", created: m.created, owned_by: "openai" }));
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data }) });
  });
}

function defaultModelList() {
  return [
    { id: "gpt-4o-mini", created: 1715000000 },
    { id: "gpt-4.1", created: 1730000000 },
    { id: "o3-mini", created: 1735000000 },
    { id: "o1-preview", created: 1720000000 },
    { id: "text-embedding-3-small", created: 1740000000 },
  ];
}

// Mirrors withPage() (tests/lib/page.mjs), but tolerates the one console
// message Chromium itself logs for a non-2xx or aborted fetch() response
// ("Failed to load resource: ...") — that's the browser's own devtools-style
// resource log, not an application error, and the two tests that
// deliberately mock a 401/network failure trigger it as an expected
// byproduct of a real fetch() call, not a bug.
async function withPageAllowingResourceErrors(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
  const unexpected = consoleErrors.filter((m) => !/Failed to load resource/.test(m));
  assert.deepEqual(unexpected, [], "expected no console/page errors other than the mocked fetch failure's own resource-load log");
}

async function openPanel(page) {
  await page.click("#agent-panel-toggle");
  await page.waitForFunction(() => window.__kg.agent.isExpanded());
}

test("agent panel is collapsed by default and expands via its toggle", async () => {
  await withPage(async (page) => {
    const expandedBefore = await page.evaluate(() => window.__kg.agent.isExpanded());
    assert.equal(expandedBefore, false);
    assert.equal(await page.evaluate(() => document.getElementById("agent-panel").classList.contains("expanded")), false);

    await openPanel(page);
    assert.equal(await page.evaluate(() => document.getElementById("agent-panel").classList.contains("expanded")), true);
    const disconnectedDisplay = await page.evaluate(() => getComputedStyle(document.getElementById("agent-panel-disconnected")).display);
    assert.notEqual(disconnectedDisplay, "none");
    const connectedDisplay = await page.evaluate(() => getComputedStyle(document.getElementById("agent-panel-connected")).display);
    assert.equal(connectedDisplay, "none");
  });
});

test("submitting the connect modal with an empty key shows an inline error and makes no network call", async () => {
  await withPage(async (page) => {
    let called = false;
    await page.route(MODELS_URL, (route) => { called = true; route.abort(); });
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.waitForSelector("#agent-connect-overlay", { state: "visible" });
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() === "emptyKey");
    const errorText = await page.textContent("#agent-connect-error");
    assert.match(errorText, /API key/i);
    assert.equal(called, false, "an empty key must never trigger a network call");
  });
});

test("a valid key fetches models, defaults to the newest reasoning model, and lets the user override it before finalizing", async () => {
  await withPage(async (page) => {
    await mockModelsRoute(page);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");

    // Stage 1 -> stage 2: model select becomes populated + enabled, defaulting
    // to the newest reasoning-family model (o3-mini, created 1735000000 > o1-preview's 1720000000).
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    const preselected = await page.$eval("#agent-model-select-modal", (el) => el.value);
    assert.equal(preselected, "o3-mini");

    // Override to a different model before confirming.
    await page.selectOption("#agent-model-select-modal", "gpt-4.1");
    await page.click("#agent-connect-submit");

    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    const connectedModel = await page.evaluate(() => window.__kg.agent.state.model);
    assert.equal(connectedModel, "gpt-4.1");

    // Modal closed, connected UI visible, chat input still disabled (Phase 2 territory).
    const overlayDisplay = await page.evaluate(() => getComputedStyle(document.getElementById("agent-connect-overlay")).display);
    assert.equal(overlayDisplay, "none");
    assert.equal(await page.isDisabled("#agent-chat-input"), true);
    assert.equal(await page.isDisabled("#agent-chat-send"), true);
    const panelSelectValue = await page.$eval("#agent-model-select", (el) => el.value);
    assert.equal(panelSelectValue, "gpt-4.1");
  });
});

test("pickDefaultAgentModel falls back to the newest chat model when no reasoning-family model is available", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => {
      const models = [
        { id: "gpt-3.5-turbo", created: 100 },
        { id: "gpt-4o", created: 300 },
        { id: "whisper-1", created: 500 }, // excluded: not a chat model
      ];
      return window.__kg.agent.pickDefaultModel(models);
    });
    assert.equal(result, "gpt-4o");
  });
});

test("an invalid key surfaces an inline error and does not connect", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await mockModelsRoute(page, { status: 401 });
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-bad-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() === "invalidKey");
    const errorText = await page.textContent("#agent-connect-error");
    assert.match(errorText, /rejected|invalid/i);
    assert.equal(await page.evaluate(() => window.__kg.agent.state.connected), false);
  });
});

test("a network/CORS failure surfaces an inline error distinct from an invalid key", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await page.route(MODELS_URL, (route) => route.abort("failed"));
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() === "network");
    const errorText = await page.textContent("#agent-connect-error");
    assert.match(errorText, /network|CORS/i);
  });
});

test("remembering the key persists it to localStorage and pre-fills the modal on next open; leaving it unchecked keeps it in-memory only", async () => {
  await withPage(async (page) => {
    await mockModelsRoute(page);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-remember-me");
    await page.check("#agent-remember-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit"); // finalize with the default model

    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    const stored = await page.evaluate(() => localStorage.getItem("kg-agent-key"));
    assert.equal(stored, "sk-remember-me");

    // Disconnect, then reopening the connect modal should pre-fill the remembered key.
    await page.click("#agent-disconnect");
    await page.click("#agent-connect-open");
    const prefilled = await page.$eval("#agent-key-input", (el) => el.value);
    assert.equal(prefilled, "sk-remember-me");
    await page.click("#agent-connect-cancel");
  });
});

test("without checking remember, no key is persisted to localStorage", async () => {
  await withPage(async (page) => {
    await mockModelsRoute(page);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-ephemeral");
    // remember checkbox left unchecked (default)
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    const stored = await page.evaluate(() => localStorage.getItem("kg-agent-key"));
    assert.equal(stored, null);
  });
});

test("forgetting a saved key clears storage and hides the forget-key affordance", async () => {
  await withPage(async (page) => {
    await mockModelsRoute(page);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-to-forget");
    await page.check("#agent-remember-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.hasStoredKey() === true);

    const forgetRowVisible = await page.evaluate(() => getComputedStyle(document.getElementById("agent-forget-key-row")).display !== "none");
    assert.equal(forgetRowVisible, true);

    await page.click("#agent-forget-key");
    assert.equal(await page.evaluate(() => localStorage.getItem("kg-agent-key")), null);
    const forgetRowHiddenAfter = await page.evaluate(() => getComputedStyle(document.getElementById("agent-forget-key-row")).display === "none");
    assert.equal(forgetRowHiddenAfter, true);
  });
});

test("disconnecting returns the panel to its disconnected state", async () => {
  await withPage(async (page) => {
    await mockModelsRoute(page);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    await page.click("#agent-disconnect");
    assert.equal(await page.evaluate(() => window.__kg.agent.state.connected), false);
    const connectedDisplay = await page.evaluate(() => getComputedStyle(document.getElementById("agent-panel-connected")).display);
    assert.equal(connectedDisplay, "none");
  });
});

test("panel and modal text swap language when the app's language is toggled", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    const introEn = await page.textContent("#agent-panel-intro");
    assert.match(introEn, /connect/i);

    await page.evaluate(() => window.__kg.lang.toggle());
    const introHu = await page.textContent("#agent-panel-intro");
    assert.match(introHu, /csatlakozz/i);
    assert.notEqual(introEn, introHu);
  }, { lang: "en" });
});
