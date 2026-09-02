import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// Issue #153 -- rename_ontology_element. Root cause this fixes: apply_
// ontology_changes matches an existing class/rule/action by its CURRENT
// name, so using it to enact a "renamed" merge decision (giving it the
// NEW name) silently creates a second, empty-of-history entity instead of
// renaming the original -- the original's properties/relationships are
// then either left behind as an apparent duplicate, or destroyed outright
// if the agent "cleans up" by removing the original (deleteNode() cascades
// to every edge attached to it). Confirmed as the real mechanism behind the
// cascading-merge regression in ontology_translation/results/cascading-merge/
// (brick-hvac's Air Handling Unit -> AirHandlingUnit rename losing its
// economizerStatus/status properties and locatedIn/locatedOn relationships).
//
// Same mocking convention as tests/import-review-agent.spec.mjs.

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
function mockChatSequence(page, responders) {
  let callIndex = 0;
  page.route(CHAT_URL, (route) => {
    const body = route.request().postDataJSON();
    const responder = responders[Math.min(callIndex, responders.length - 1)];
    callIndex++;
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(responder(body, callIndex)) });
  });
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

// The merger tool set must always include the new tool -- if this drifts,
// every test below would fail for the wrong reason (a real request never
// carrying the tool at all), so it's worth its own explicit assertion.
test("the merger's tool set includes rename_ontology_element", async () => {
  await withPage(async (page) => {
    const names = await page.evaluate(() => Object.values(window.__kg.importReview.tools).map((t) => t.function.name));
    assert.ok(names.includes("rename_ontology_element"));
  });
});

test("rename_ontology_element renames a class in place, preserving its properties and relationships untouched", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Air Handling Unit");
    await addNodeViaDblClick(page, 600, 300, "Air Temperature Sensor");
    const before = await page.evaluate(() => {
      const ahu = window.__kg.state.nodes.find((n) => n.label === "Air Handling Unit");
      ahu.properties.push({ id: "p1", name: "economizerStatus", type: "text", unit: null, allowed: ["enabled", "disabled"] });
      const sensor = window.__kg.state.nodes.find((n) => n.label === "Air Temperature Sensor");
      window.__kg.actions.createEdge(ahu.id, sensor.id, "hasPoint", true);
      return { ahuId: ahu.id, edgeCount: window.__kg.state.edges.length };
    });

    await connectAgent(page);
    const json = await exportJson(page);
    // Simulates the real cascading-merge shape: the incoming file (another
    // independent run) never mentions "Air Handling Unit" at all, using its
    // own "AirHandlingUnit" spelling instead -- so this pairing genuinely
    // needs a human/proposer decision to be recognized as the same concept,
    // same as import-review-agent.spec.mjs's own Gadget/Contraption pattern.
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes = root.nodes.filter((n) => n.label !== "Air Handling Unit");
      root.edges = root.edges.filter((e) => e.relation !== "hasPoint");
      root.nodes.push({ id: "extra1", label: "AirHandlingUnit", x: 900, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      return JSON.stringify(root);
    }, json);

    mockChatSequence(page, [
      () => toolCallBody([toolCall("call_1", "rename_ontology_element", { kind: "class", from: "Air Handling Unit", to: "AirHandlingUnit" })]),
      () => textBody("Renamed to match the incoming spelling."),
    ]);

    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const currentOnly = items.find((i) => i.section === "currentOnly" && i.label === "Air Handling Unit");
    assert.ok(currentOnly, "expected 'Air Handling Unit' to show up as a current-only leftover");
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "Same concept as incoming's AirHandlingUnit, just a naming convention difference -- rename it."), currentOnly.id);
    // The incoming-only counterpart still needs a decision too.
    const incomingOnly = items.find((i) => i.section === "incomingOnly" && i.label === "AirHandlingUnit");
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "Same concept as current's Air Handling Unit -- no separate action needed once the current one is renamed."), incomingOnly.id);
    // The hasPoint relationship is also current-only now (filtered out of
    // the incoming file above) -- a plain "keep current" is the realistic,
    // deterministic decision for it (nothing about it changed).
    const relItem = items.find((i) => i.kind === "relationship" && i.section === "currentOnly");
    assert.ok(relItem, "expected the hasPoint relationship to show up as a current-only leftover");
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "a"), relItem.id);

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    assert.ok(await page.evaluate(() => window.__kg.importReview.getAgentPreview()));
    await page.click("#import-review-agent-preview-confirm");
    await page.waitForFunction(() => window.__kg.importReview.getAgentPreview() === null);

    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.ok, true);
    assert.ok(result.touched.some((t) => t.kind === "class" && t.action === "renamed" && t.name === "Air Handling Unit → AirHandlingUnit"));

    const after = await page.evaluate((ahuId) => {
      const node = window.__kg.state.nodes.find((n) => n.id === ahuId);
      return {
        stillSameId: Boolean(node),
        label: node && node.label,
        properties: node && node.properties.map((p) => p.name),
        edges: window.__kg.state.edges.filter((e) => e.source === ahuId || e.target === ahuId).map((e) => e.relation),
      };
    }, before.ahuId);
    assert.equal(after.stillSameId, true, "the original node object (same internal id) must still exist -- a true in-place rename, not delete+recreate");
    assert.equal(after.label, "AirHandlingUnit");
    assert.deepEqual(after.properties, ["economizerStatus"], "the property must survive the rename untouched");
    assert.deepEqual(after.edges, ["hasPoint"], "the relationship must survive the rename untouched");
    assert.equal(await page.evaluate(() => window.__kg.state.edges.length), before.edgeCount, "no edge should have been lost or duplicated");
  });
});

test("rename_ontology_element refuses to rename onto an already-existing name", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await addNodeViaDblClick(page, 600, 300, "Gadget");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Needs a decision.";
      return JSON.stringify(root);
    }, json);

    mockChatSequence(page, [
      () => toolCallBody([toolCall("call_1", "rename_ontology_element", { kind: "class", from: "Widget", to: "Gadget" })]),
      () => textBody("Could not rename -- name already in use."),
    ]);

    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "Treat this as the same as Gadget."), items[0].id);

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    // Nothing was actually touched (the rename call errored, and the model's
    // only other output was a closing remark) -- straight to the result
    // panel, no preview to confirm.
    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.touched.length, 0);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 2, "both original classes must still exist, untouched");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Widget").meaning), null);
  });
});

test("rename_ontology_element works the same way for rules and actions", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Incident");
    await page.evaluate(() => {
      window.__kg.actions.createRule("oldRuleName", ["Incident status is open"]);
      const incident = window.__kg.state.nodes.find((n) => n.label === "Incident");
      window.__kg.actions.createAction("oldActionName", incident.id, [], "Incident is closed.", "Read it back.");
    });
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Incident").meaning = "Needs a decision.";
      return JSON.stringify(root);
    }, json);

    mockChatSequence(page, [
      () => toolCallBody([
        toolCall("call_1", "rename_ontology_element", { kind: "rule", from: "oldRuleName", to: "newRuleName" }),
        toolCall("call_2", "rename_ontology_element", { kind: "action", from: "oldActionName", to: "newActionName" }),
      ]),
      () => textBody("Renamed both."),
    ]);

    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "Rename the rule and action to the new naming convention."), items[0].id);

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    await page.click("#import-review-agent-preview-confirm");
    await page.waitForFunction(() => window.__kg.importReview.getAgentPreview() === null);

    const rule = await page.evaluate(() => window.__kg.state.rules.find((r) => r.name === "newRuleName"));
    assert.ok(rule);
    assert.deepEqual(rule.conditions, ["Incident status is open"], "conditions must survive the rename");
    const action = await page.evaluate(() => window.__kg.state.actions.find((a) => a.name === "newActionName"));
    assert.ok(action);
    assert.equal(action.effect, "Incident is closed.");
    assert.equal(action.verification, "Read it back.");
  });
});

test("removing a class that still has properties/relationships surfaces a content-loss warning, not silence", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await addNodeViaDblClick(page, 600, 300, "Gadget");
    await page.evaluate(() => {
      const widget = window.__kg.state.nodes.find((n) => n.label === "Widget");
      widget.properties.push({ id: "p1", name: "uniqueField", type: "text", unit: null, allowed: null });
      const gadget = window.__kg.state.nodes.find((n) => n.label === "Gadget");
      window.__kg.actions.createEdge(widget.id, gadget.id, "connectsTo", true);
    });
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Gadget").meaning = "Needs a decision.";
      return JSON.stringify(root);
    }, json);

    mockChatSequence(page, [
      () => toolCallBody([toolCall("call_1", "remove_ontology_elements", { classes: ["Widget"] })]),
      () => textBody("Removed the redundant class."),
    ]);

    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "Widget is redundant, remove it."), items[0].id);

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    await page.click("#import-review-agent-preview-confirm");
    await page.waitForFunction(() => window.__kg.importReview.getAgentPreview() === null);

    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    const warning = result.touched.find((t) => t.kind === "warning");
    assert.ok(warning, "a class removed while it still had properties/relationships must produce a visible warning entry");
    assert.match(warning.name, /"Widget"/);
    assert.match(warning.name, /1 propert/);
    assert.match(warning.name, /1 relationship/);

    // And it must actually render, not just exist in the data.
    const resultLines = await page.locator("#import-review-result-list li").allTextContents();
    assert.ok(resultLines.some((l) => l.startsWith("Warning:")), `expected a "Warning:" line, got ${JSON.stringify(resultLines)}`);
  });
});
