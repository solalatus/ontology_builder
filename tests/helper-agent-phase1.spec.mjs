import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, APP_URL, waitForComputedStyle } from "./lib/page.mjs";
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
  await page.evaluate(() => window.__kg.welcome.close()); // issue #78: this file has its own page-open helper, not tests/lib/page.mjs's withPage()
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

// Issue #55: "make the chat panel resizable ... and maybe shrink/resize the
// graph showing field accordingly, and I also mean the header menu here."
// Before this, #agent-panel was a fixed-position overlay -- widening it
// just covered more of the canvas rather than making more usable room, and
// the toolbar sat underneath it unconditionally. These tests pin the real
// push-layout behavior: collapsed must stay byte-identical to the old
// always-0 offset (every test above this one runs in that state), and
// expanding/resizing must visibly shift both the toolbar and the canvas.
// Waits for the 120ms `left` transition to actually finish rather than
// guessing at 150ms. The guess is right on an idle machine and wrong on a
// loaded one, which is how this file's push-layout assertions flaked in a full
// suite run while passing every time in isolation: the value sampled was a
// mid-transition `84.3px` instead of the settled width.
async function settledLeft(page, id) {
  const read = () => page.evaluate((elId) => getComputedStyle(document.getElementById(elId)).left, id);
  let last = await read();
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(25);
    const next = await read();
    if (next === last) return next;
    last = next;
  }
  return last;
}

test("toolbar and canvas sit flush left (0px) while the agent panel is collapsed -- the default, unchanged from before issue #55", async () => {
  await withPage(async (page) => {
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("toolbar")).left), "0px");
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("canvas-wrap")).left), "0px");
  });
});

test("expanding the agent panel pushes the toolbar and canvas right by the panel's own width", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    const panelWidth = await page.evaluate(() => document.getElementById("agent-panel-body").getBoundingClientRect().width);
    const toggleWidth = await page.evaluate(() => document.getElementById("agent-panel-toggle").getBoundingClientRect().width);
    const expectedOffset = `${Math.round(panelWidth + toggleWidth)}px`;

    assert.equal(await settledLeft(page, "toolbar"), expectedOffset);
    assert.equal(await settledLeft(page, "canvas-wrap"), expectedOffset);
  });
});

test("collapsing the agent panel again snaps the toolbar and canvas back to 0", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await settledLeft(page, "toolbar"); // let it push out first
    await page.click("#agent-panel-toggle"); // collapse
    assert.equal(await settledLeft(page, "toolbar"), "0px");
    assert.equal(await settledLeft(page, "canvas-wrap"), "0px");
  });
});

test("dragging the resize handle widens the panel and pushes the toolbar/canvas by the new width", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    const before = await page.evaluate(() => window.__kg.agent.state.panelWidth);

    const handle = await page.$("#agent-panel-resize-handle");
    const box = await handle.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + 50);
    await page.mouse.down();
    await page.mouse.move(box.x + 150, box.y + 50, { steps: 5 });
    await page.mouse.up();

    const after = await page.evaluate(() => window.__kg.agent.state.panelWidth);
    assert.ok(after > before, `expected the panel to widen past ${before}px, got ${after}px`);

    const bodyWidth = await page.evaluate(() => document.getElementById("agent-panel-body").getBoundingClientRect().width);
    const toggleWidth = await page.evaluate(() => document.getElementById("agent-panel-toggle").getBoundingClientRect().width);
    assert.equal(await settledLeft(page, "toolbar"), `${Math.round(bodyWidth + toggleWidth)}px`);
  });
});

test("resize width is clamped to a sane range and can't be dragged arbitrarily small or large", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.evaluate(() => window.__kg.agent.setPanelWidth(10));
    const tooSmall = await page.evaluate(() => window.__kg.agent.state.panelWidth);
    assert.ok(tooSmall >= 200, `expected a clamped minimum, got ${tooSmall}px`);

    await page.evaluate(() => window.__kg.agent.setPanelWidth(99999));
    const tooLarge = await page.evaluate(() => window.__kg.agent.state.panelWidth);
    assert.ok(tooLarge < 99999, `expected a clamped maximum, got ${tooLarge}px`);
  });
});

test("resized panel width persists across a reload", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.evaluate(() => window.__kg.agent.setPanelWidth(480));

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    const restored = await page.evaluate(() => window.__kg.agent.state.panelWidth);
    assert.equal(restored, 480);
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

    // Modal closed, connected UI visible. The chat input is enabled once
    // connected (live chat is Phase 2); the send button stays disabled
    // until there's actually something typed to send — see
    // tests/helper-agent-phase2.spec.mjs for the full chat-loop coverage.
    const overlayDisplay = await page.evaluate(() => getComputedStyle(document.getElementById("agent-connect-overlay")).display);
    assert.equal(overlayDisplay, "none");
    assert.equal(await page.isDisabled("#agent-chat-input"), false);
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

// Regression test for a bug found by running against a real OpenAI key's
// actual model list (tests/helper-agent-live-openai.spec.mjs): the newest
// id in the "reasoning" pool was a deep-research variant -- a specialized
// autonomous-research product, not a general chat model -- because it sorts
// newer by `created` than the ordinary o-series/gpt-5 ids alongside it.
test("pickDefaultAgentModel excludes deep-research/search-preview/search-api variants even when they're the newest id", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => {
      const models = [
        { id: "o4-mini", created: 100 },
        { id: "o4-mini-deep-research-2025-06-26", created: 999 }, // newest id, but not a general chat model
        { id: "gpt-5-search-api-2025-10-14", created: 998 }, // also newest-ish, also not a general chat model
      ];
      return window.__kg.agent.pickDefaultModel(models);
    });
    assert.equal(result, "o4-mini");
  });
});

// Second half of the same live-discovered bug: OpenAI's gpt-5.x family is
// this account's actual current reasoning-capable lineup, but the original
// heuristic only recognized "o<digit>" ids and the literal words
// think/reason -- so gpt-5.x was silently invisible to the "reasoning pool"
// and a much older o-series id would win by default even when a newer
// gpt-5.x release existed.
test("pickDefaultAgentModel treats gpt-5.x and later as reasoning-family, preferring it over an older non-reasoning id", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => {
      const models = [
        { id: "o1", created: 100 },
        { id: "gpt-5.5", created: 900 },
        { id: "gpt-4.1", created: 500 }, // newer than o1 but not reasoning-family -- must lose to gpt-5.5
      ];
      return window.__kg.agent.pickDefaultModel(models);
    });
    assert.equal(result, "gpt-5.5");
  });
});

// A second, more severe live-discovered bug on top of the deep-research one
// above: the *newest* id in the real reasoning pool, "gpt-5.6-luna", turned
// out to return a real 400 ("Function tools ... are not supported ... in
// /v1/chat/completions") the instant tools were attached -- which is every
// real request this app makes, since apply_ontology_yaml/get_graph_state are
// always sent. Nothing in OpenAI's /v1/models response signals this ahead of
// time; the fix is to prefer the "standard tier" (bare version, no
// mini/nano/pro/preview-codename suffix) over any suffixed variant,
// including ones newer than it -- see isStandardTierModel's own comment.
test("pickDefaultAgentModel prefers a standard-tier reasoning model over a newer mini/nano/pro variant", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => window.__kg.agent.pickDefaultModel([
      { id: "gpt-5", created: 100 },
      { id: "gpt-5-mini", created: 999 },
      { id: "gpt-5-pro", created: 998 },
    ]));
    assert.equal(result, "gpt-5");
  });
});

// The exact real-world shape of the live-discovered bug: a preview-codename
// variant ("-luna") that is both the newest id *and* passes every other
// filter (it's reasoning-family, it's not deep-research/search/embedding),
// yet is not standard-tier and must still lose to an older standard-tier release.
test("pickDefaultAgentModel prefers a standard-tier reasoning model over a newer preview-codename variant", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => window.__kg.agent.pickDefaultModel([
      { id: "gpt-5.5", created: 500 },
      { id: "gpt-5.6-luna", created: 999 },
    ]));
    assert.equal(result, "gpt-5.5");
  });
});

// A dated snapshot of the standard tier (no mini/nano/pro/codename suffix,
// just a pinned release date) still counts as standard-tier -- only an
// actual size/specialty/preview suffix should be deprioritized.
test("pickDefaultAgentModel treats a dated snapshot of the standard tier as standard-tier, not a variant", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => window.__kg.agent.pickDefaultModel([
      { id: "gpt-5-mini", created: 999 },
      { id: "gpt-5-2025-08-07", created: 100 },
    ]));
    assert.equal(result, "gpt-5-2025-08-07");
  });
});

// When a key's reasoning pool has no standard-tier candidate at all (e.g.
// an account whose only reasoning access is the mini tier), the heuristic
// must still fall back to the full reasoning pool rather than skipping past
// it straight to an ordinary chat model.
test("pickDefaultAgentModel falls back to the full reasoning pool when no standard-tier reasoning model is available", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => window.__kg.agent.pickDefaultModel([
      { id: "o3-mini", created: 100 },
      { id: "gpt-4o", created: 999 }, // newer, but not reasoning-family -- must still lose to o3-mini
    ]));
    assert.equal(result, "o3-mini");
  });
});

test("pickDefaultAgentModel does not treat gpt-4.x as reasoning-family (only gpt-5 and above)", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => window.__kg.agent.pickDefaultModel([
      { id: "gpt-4.1", created: 100 },
      { id: "gpt-4o", created: 200 },
    ]));
    // No reasoning-family candidate in this list at all -- falls back to the
    // newest plain chat model, same fallback path the pre-existing test above covers.
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

// Issue #58: #agent-connect-open, #agent-restart-conversation,
// #agent-disconnect, and #agent-chat-send had no CSS rule at all, so they
// fell back to the browser's own unstyled button chrome instead of the
// app's theme tokens -- inconsistent with every other themed button, and
// unreadable in at least one reported browser. Assert their computed
// background/color actually match the theme tokens in both themes, in
// both the disconnected and connected panel states.
async function themedBtnColors(page, id) {
  return page.evaluate((elId) => {
    const cs = getComputedStyle(document.getElementById(elId));
    return { bg: cs.backgroundColor, color: cs.color };
  }, id);
}

test("#agent-connect-open uses the app's themed button colors, not the browser default, in both themes", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    const dark = await themedBtnColors(page, "agent-connect-open");
    assert.equal(dark.bg, "rgb(44, 44, 44)", "dark --btn-bg");
    assert.equal(dark.color, "rgb(232, 232, 232)", "dark --toolbar-fg");

    // Toggled via the test hook, not a click on #btn-theme-toggle: the
    // toolbar can wrap under the open agent panel at this viewport width,
    // which is an unrelated layout quirk that would otherwise intercept
    // the click -- window.__kg.theme.toggle() is the same hook
    // tests/theme.spec.mjs itself uses to sidestep exactly that.
    await page.evaluate(() => window.__kg.theme.toggle());
    // Wait for the settled colour rather than a fixed 150ms -- see settledLeft.
    await waitForComputedStyle(page, "#agent-connect-open", "backgroundColor", "rgb(255, 255, 255)");
    const light = await themedBtnColors(page, "agent-connect-open");
    assert.equal(light.bg, "rgb(255, 255, 255)", "light --btn-bg");
    assert.equal(light.color, "rgb(26, 26, 26)", "light --toolbar-fg");
  });
});

test("#agent-restart-conversation, #agent-disconnect, and #agent-chat-send use the app's themed button colors once connected, in both themes", async () => {
  await withPage(async (page) => {
    await mockModelsRoute(page);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit"); // finalize with the default model
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    for (const id of ["agent-restart-conversation", "agent-disconnect", "agent-chat-send"]) {
      const dark = await themedBtnColors(page, id);
      assert.equal(dark.bg, "rgb(44, 44, 44)", `${id}: dark --btn-bg`);
      assert.equal(dark.color, "rgb(232, 232, 232)", `${id}: dark --toolbar-fg`);
    }

    await page.evaluate(() => window.__kg.theme.toggle());
    await waitForComputedStyle(page, "#agent-restart-conversation", "backgroundColor", "rgb(255, 255, 255)");
    for (const id of ["agent-restart-conversation", "agent-disconnect", "agent-chat-send"]) {
      const light = await themedBtnColors(page, id);
      assert.equal(light.bg, "rgb(255, 255, 255)", `${id}: light --btn-bg`);
      assert.equal(light.color, "rgb(26, 26, 26)", `${id}: light --toolbar-fg`);
    }
  });
});
