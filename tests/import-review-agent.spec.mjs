import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, APP_URL, addNodeViaDblClick } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// Import Review (issue #122) -- the two LLM-touching pieces: the read-only
// "Suggest matches" proposer and the dedicated, mutating execution agent
// (the "merger"). Both are mocked via page.route(), the same convention the
// rest of the agent surface already uses (tests/helper-agent-phase3.spec.mjs
// and siblings) -- no real network call, deterministic in CI.

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

function mockModelsRoute(page) {
  const models = [{ id: "gpt-4o-mini", created: 1715000000, object: "model", owned_by: "openai" }];
  return page.route(MODELS_URL, (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data: models }) });
  });
}

async function connectAgent(page) {
  await mockModelsRoute(page);
  const expanded = await page.evaluate(() => window.__kg.agent.isExpanded());
  if (!expanded) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", "sk-test-key");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);
}

function toolCall(id, name, argsObj) {
  return { id, type: "function", function: { name, arguments: JSON.stringify(argsObj) } };
}
function toolCallBody(toolCalls) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: toolCalls }, finish_reason: "tool_calls" }] };
}
function textBody(content) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }] };
}

// responders[i] handles the i-th request to CHAT_URL (clamped to the last
// responder once exhausted, matching helper-agent-phase3.spec.mjs's own
// mockChatSequence). Returns the array of raw request bodies for assertions
// on what was actually sent (e.g. which tools were attached).
function mockChatSequence(page, responders, { status = 200 } = {}) {
  const requestBodies = [];
  let callIndex = 0;
  page.route(CHAT_URL, (route) => {
    const body = route.request().postDataJSON();
    requestBodies.push(body);
    const responder = responders[Math.min(callIndex, responders.length - 1)];
    callIndex++;
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(responder(body, callIndex)) });
  });
  return requestBodies;
}

async function exportJson(page) {
  return page.evaluate(() => {
    if (!window.__kg.state.meta) {
      window.__kg.state.meta = { format_version: 1, graph_id: "test-graph", version: 0, created: "2026-01-01T00:00:00Z" };
    }
    return JSON.stringify(window.__kg.formats.buildJsonExport());
  });
}

async function openReviewFor(page, json) {
  await page.evaluate((text) => window.__kg.formats.openImportDialog(text, "json", "test.json"), json);
  await page.click("#import-review");
  await page.waitForSelector("#import-review-overlay", { state: "visible" });
}

// A mocked HTTP failure makes Chromium itself log "Failed to load resource"
// to the console -- expected noise for the two tests below that deliberately
// mock a 500, not a real bug. Same pattern tests/helper-agent-phase3.spec.mjs
// already established for exactly this case.
async function withPageAllowingResourceErrors(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  await page.evaluate(() => window.__kg.welcome.close());
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
  const unexpected = consoleErrors.filter((m) => !/Failed to load resource/.test(m));
  assert.deepEqual(unexpected, [], "expected no console/page errors other than a mocked fetch failure's own resource-load log");
}

test("Suggest matches is disabled without a connection, and never sends tools (read-only)", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const json = await exportJson(page);
    await openReviewFor(page, json);
    assert.equal(await page.locator("#import-review-suggest").isDisabled(), true, "no agent connection yet");
  });
});

test("Suggest matches proposes a cross-label pair, which moves both leftover items into one matched row", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Gadget");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes = root.nodes.filter((n) => n.label !== "Gadget");
      root.nodes.push({ id: "extra1", label: "Contraption", x: 900, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      return JSON.stringify(root);
    }, json);

    const requestBodies = mockChatSequence(page, [
      () => textBody('```json\n[{"currentKind":"class","currentName":"Gadget","incomingKind":"class","incomingName":"Contraption","relationKind":"renamed","note":"same thing, renamed"}]\n```'),
    ]);
    await openReviewFor(page, mutated);

    const before = await page.evaluate(() => window.__kg.importReview.getItems());
    assert.deepEqual(before.map((i) => i.section).sort(), ["currentOnly", "incomingOnly"]);

    await page.click("#import-review-suggest");
    await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending());

    assert.equal(requestBodies.length, 1);
    assert.equal(requestBodies[0].tools, undefined, "the proposer must never carry a tools array -- it can never mutate anything");

    const after = await page.evaluate(() => window.__kg.importReview.getItems());
    assert.equal(after.length, 1);
    assert.equal(after[0].section, "matched");
    assert.equal(after[0].isPaired, true);
    assert.match(after[0].label, /Gadget.*Contraption/);
  });
});

test("a failed Suggest matches call leaves every item exactly as it was, reported, not silent", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Gadget");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes = root.nodes.filter((n) => n.label !== "Gadget");
      root.nodes.push({ id: "extra1", label: "Contraption", x: 900, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      return JSON.stringify(root);
    }, json);

    await page.route(CHAT_URL, (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: { message: "boom" } }) }));
    await openReviewFor(page, mutated);
    const before = await page.evaluate(() => window.__kg.importReview.getItems());

    await page.click("#import-review-suggest");
    await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending());
    assert.equal(await page.evaluate(() => window.__kg.importReview.didSuggestFail()), true);
    const after = await page.evaluate(() => window.__kg.importReview.getItems());
    assert.deepEqual(after.map((i) => i.id).sort(), before.map((i) => i.id).sort());
  });
});

test("a plain keep/take decision with no note never reaches the execution agent, even when connected", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Edited elsewhere.";
      return JSON.stringify(root);
    }, json);

    const requestBodies = mockChatSequence(page, [() => textBody("should never be reached")]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "b"), items[0].id);

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    assert.equal(requestBodies.length, 0, "a plain no-note decision must be fully deterministic");
    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.match(result.message, /Nothing needed the execution agent/);
  });
});

test("a free-text note routes to the execution agent, which can touch an element the note never named (a ripple change), all reported and landing as one undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await page.evaluate(() => window.__kg.actions.createRule("legacyRule", ["Widget must be legacy-named"]));
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Renamed concept.";
      return JSON.stringify(root);
    }, json);

    const requestBodies = mockChatSequence(page, [
      (body) => {
        assert.ok(Array.isArray(body.tools) && body.tools.some((t) => t.function.name === "remove_ontology_elements"),
          "the merger must always carry both tools");
        // The model decides, on its own reasoning, that the note about
        // Widget also makes the unrelated "legacyRule" stale -- something
        // the human never explicitly flagged in this review at all.
        return toolCallBody([
          toolCall("call_1", "apply_ontology_changes", { yaml: "classes:\n  Widget:\n    meaning: Renamed concept.\n" }),
          toolCall("call_2", "remove_ontology_elements", { rules: ["legacyRule"] }),
        ]);
      },
      () => textBody("Done."),
    ]);

    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "Take the new meaning; also the legacy naming rule no longer applies."), items[0].id);

    const before = await page.evaluate(() => window.__kg.state.rules.length);
    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());

    assert.equal(requestBodies.length, 2, "one round with tool calls, then one follow-up round to confirm no more tools are needed");
    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.ok, true);
    assert.deepEqual(result.touched.sort((a, b) => a.kind.localeCompare(b.kind)), [
      { kind: "class", name: "Widget", action: "upserted" },
      { kind: "rule", name: "legacyRule", action: "removed" },
    ]);

    const widgetMeaning = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Widget").meaning);
    assert.equal(widgetMeaning, "Renamed concept.");
    assert.equal(await page.evaluate(() => window.__kg.state.rules.length), before - 1, "the ripple removal actually happened");

    // One combined undo step for both the class upsert and the rule removal.
    await page.evaluate(() => window.__kg.actions.undo());
    assert.equal(await page.evaluate(() => window.__kg.state.rules.length), before);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Widget").meaning), null);
  });
});

test("remove_ontology_elements removing a class and a property report correct, singular kind labels -- not the naive-plural-strip bug a live run surfaced", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await addNodeViaDblClick(page, 600, 300, "Obsolete");
    await page.evaluate(() => {
      const widget = window.__kg.state.nodes.find((n) => n.label === "Widget");
      widget.properties.push({ id: "p1", name: "legacyFlag", type: "boolean", unit: null, allowed: null });
    });
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Trimmed down.";
      return JSON.stringify(root);
    }, json);

    mockChatSequence(page, [
      () => toolCallBody([
        toolCall("call_1", "apply_ontology_changes", { yaml: "classes:\n  Widget:\n    meaning: Trimmed down.\n" }),
        toolCall("call_2", "remove_ontology_elements", { classes: ["Obsolete"], properties: [{ className: "Widget", name: "legacyFlag" }] }),
      ]),
      () => textBody("Done."),
    ]);

    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "Trim the obsolete class and the legacy flag property, they're both dead weight."), items[0].id);

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.ok, true);
    const removedKinds = result.touched.filter((t) => t.action === "removed").map((t) => t.kind).sort();
    assert.deepEqual(removedKinds, ["class", "property"], "must be the singular kind names importReviewKindLabel() actually knows, not a naive plural strip");

    // And the result panel must actually render a real label for each, not a blank one.
    const resultLines = await page.locator("#import-review-result-list li").allTextContents();
    assert.ok(resultLines.some((l) => l.startsWith("Class:")), `expected a "Class:" line, got ${JSON.stringify(resultLines)}`);
    assert.ok(resultLines.some((l) => l.startsWith("Property:")), `expected a "Property:" line, got ${JSON.stringify(resultLines)}`);

    assert.equal(await page.evaluate(() => window.__kg.state.nodes.some((n) => n.label === "Obsolete")), false);
    const widgetProps = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Widget").properties.map((p) => p.name));
    assert.deepEqual(widgetProps, []);
  });
});

test("an execution-agent failure leaves the deterministic bucket's changes standing and reports the failure, not silent", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await addNodeViaDblClick(page, 600, 300, "Gadget");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Deterministic change.";
      root.nodes.find((n) => n.label === "Gadget").meaning = "Needs judgement.";
      return JSON.stringify(root);
    }, json);

    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const widget = items.find((i) => i.label === "Widget");
    const gadget = items.find((i) => i.label === "Gadget");
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "b"), widget.id); // plain, deterministic
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "think about whether to take this"), gadget.id); // needs the agent

    await page.route(CHAT_URL, (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: { message: "boom" } }) }));

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());

    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.ok, false);
    assert.match(result.message, /couldn't finish/i);
    assert.deepEqual(result.touched, [{ kind: "class", name: "Widget", action: "updated" }],
      "the deterministic bucket's own change is still reported as applied");

    const widgetMeaning = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Widget").meaning);
    assert.equal(widgetMeaning, "Deterministic change.", "the deterministic change survives an execution-agent failure");
    const gadgetMeaning = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Gadget").meaning);
    assert.equal(gadgetMeaning, null, "the agent-bucket item was never applied");
  });
});
