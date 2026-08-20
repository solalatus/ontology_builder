import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// Import Review (issue #122) -- cross-label pairing GROUPING. A live run
// against real, complex, real-world data (never reproduced here -- this
// file uses a synthetic generic domain throughout, deliberately unrelated
// to anything in the actual test session) showed the proposer naturally
// proposes many-to-one and one-to-many groupings ("generalized"/
// "specialized" are *defined* that way), and that the dialog's original
// strict-1-to-1 pairing logic silently dropped every proposed pair beyond
// the first that reused an already-claimed endpoint. This file locks in the
// union-find-based grouping fix, the deletion-caution merger prompt
// hardening, and the execution agent's closing-commentary surfacing that
// followed from that same finding.

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

function textBody(content) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }] };
}
function toolCall(id, name, argsObj) {
  return { id, type: "function", function: { name, arguments: JSON.stringify(argsObj) } };
}
function toolCallBody(toolCalls, content = null) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content, tool_calls: toolCalls }, finish_reason: "tool_calls" }] };
}

function mockChatSequence(page, responders) {
  const requestBodies = [];
  let callIndex = 0;
  page.route(CHAT_URL, (route) => {
    const body = route.request().postDataJSON();
    requestBodies.push(body);
    const responder = responders[Math.min(callIndex, responders.length - 1)];
    callIndex++;
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(responder(body, callIndex)) });
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

// Synthetic fixture (generic small-appliance domain, nothing to do with any
// real ontology) exercising both directions in one shot: three current-only
// classes generalizing into one incoming class (Toaster/Kettle/Blender ->
// Appliance), and one current-only class specializing into three incoming
// classes (RawMaterial -> Metal/Plastic/Glass).
async function buildGroupingFixture(page) {
  await addNodeViaDblClick(page, 300, 300, "Toaster");
  await addNodeViaDblClick(page, 600, 300, "Kettle");
  await addNodeViaDblClick(page, 900, 300, "Blender");
  await addNodeViaDblClick(page, 300, 600, "RawMaterial");
  const json = await exportJson(page);
  return page.evaluate((text) => {
    const root = JSON.parse(text);
    root.nodes = root.nodes.filter((n) => !["Toaster", "Kettle", "Blender", "RawMaterial"].includes(n.label));
    let x = 1200;
    for (const label of ["Appliance", "Metal", "Plastic", "Glass"]) {
      root.nodes.push({ id: `extra_${label}`, label, x: (x += 200), y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
    }
    return JSON.stringify(root);
  }, json);
}

const GENERALIZE_SPECIALIZE_PROPOSAL = [
  { currentKind: "class", currentName: "Toaster", incomingKind: "class", incomingName: "Appliance", relationKind: "generalized", note: "a kitchen appliance" },
  { currentKind: "class", currentName: "Kettle", incomingKind: "class", incomingName: "Appliance", relationKind: "generalized", note: "also a kitchen appliance" },
  { currentKind: "class", currentName: "Blender", incomingKind: "class", incomingName: "Appliance", relationKind: "generalized", note: "also a kitchen appliance" },
  { currentKind: "class", currentName: "RawMaterial", incomingKind: "class", incomingName: "Metal", relationKind: "specialized", note: "one kind of raw material" },
  { currentKind: "class", currentName: "RawMaterial", incomingKind: "class", incomingName: "Plastic", relationKind: "specialized", note: "another kind of raw material" },
  { currentKind: "class", currentName: "RawMaterial", incomingKind: "class", incomingName: "Glass", relationKind: "specialized", note: "a third kind of raw material" },
];

test("a many-to-one proposal (3 current classes -> 1 incoming class) groups into one combined item instead of dropping two of the three pairs", async () => {
  await withPage(async (page) => {
    const mutated = await buildGroupingFixture(page);
    await connectAgent(page);
    mockChatSequence(page, [() => textBody("```json\n" + JSON.stringify(GENERALIZE_SPECIALIZE_PROPOSAL) + "\n```")]);
    await openReviewFor(page, mutated);

    await page.click("#import-review-suggest");
    await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending());

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const applianceGroup = items.find((i) => i.currentNames && i.currentNames.includes("Toaster"));
    assert.ok(applianceGroup, "expected one combined item for the Toaster/Kettle/Blender -> Appliance grouping");
    assert.deepEqual(applianceGroup.currentNames.sort(), ["Blender", "Kettle", "Toaster"]);
    assert.deepEqual(applianceGroup.incomingNames, ["Appliance"]);
    assert.equal(applianceGroup.isPaired, true);
    assert.match(applianceGroup.context, /generalized/);
    assert.match(applianceGroup.label, /Toaster/);
    assert.match(applianceGroup.label, /Kettle/);
    assert.match(applianceGroup.label, /Blender/);
    assert.match(applianceGroup.label, /Appliance/);

    // Every original leftover item is gone from currentOnly/incomingOnly -- not left dangling.
    assert.ok(!items.some((i) => i.section === "currentOnly" && ["Toaster", "Kettle", "Blender"].includes(i.label)));
    assert.ok(!items.some((i) => i.section === "incomingOnly" && i.label === "Appliance"));

    // Exactly one row rendered for the whole group, not three.
    const rows = await page.locator(`[data-item-id="${applianceGroup.id}"]`).count();
    assert.equal(rows, 1);
  });
});

test("a one-to-many proposal (1 current class -> 3 incoming classes) groups the other direction the same way", async () => {
  await withPage(async (page) => {
    const mutated = await buildGroupingFixture(page);
    await connectAgent(page);
    mockChatSequence(page, [() => textBody("```json\n" + JSON.stringify(GENERALIZE_SPECIALIZE_PROPOSAL) + "\n```")]);
    await openReviewFor(page, mutated);
    await page.click("#import-review-suggest");
    await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending());

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const materialGroup = items.find((i) => i.currentNames && i.currentNames.includes("RawMaterial"));
    assert.ok(materialGroup, "expected one combined item for the RawMaterial -> Metal/Plastic/Glass grouping");
    assert.deepEqual(materialGroup.currentNames, ["RawMaterial"]);
    assert.deepEqual(materialGroup.incomingNames.sort(), ["Glass", "Metal", "Plastic"]);
    assert.match(materialGroup.context, /specialized/);

    // Both groups (many-to-one and one-to-many) coexist correctly in the same review.
    assert.equal(items.filter((i) => i.isPaired).length, 2);
  });
});

test("a transitive chain (current item bridging two otherwise-separate incoming targets) still resolves to one group", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Bridge");
    await addNodeViaDblClick(page, 600, 300, "Other");
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes = root.nodes.filter((n) => !["Bridge", "Other"].includes(n.label));
      root.nodes.push({ id: "e1", label: "TargetA", x: 900, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      root.nodes.push({ id: "e2", label: "TargetB", x: 1100, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      return JSON.stringify(root);
    }, json);
    await connectAgent(page);
    // "Bridge" pairs with both TargetA and TargetB; "Other" pairs with
    // TargetB too -- transitively, Bridge+Other+TargetA+TargetB must all
    // land in one group, not two separate ones.
    const proposal = [
      { currentKind: "class", currentName: "Bridge", incomingKind: "class", incomingName: "TargetA", relationKind: "reframed", note: "n1" },
      { currentKind: "class", currentName: "Bridge", incomingKind: "class", incomingName: "TargetB", relationKind: "reframed", note: "n2" },
      { currentKind: "class", currentName: "Other", incomingKind: "class", incomingName: "TargetB", relationKind: "reframed", note: "n3" },
    ];
    mockChatSequence(page, [() => textBody("```json\n" + JSON.stringify(proposal) + "\n```")]);
    await openReviewFor(page, mutated);
    await page.click("#import-review-suggest");
    await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending());

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const paired = items.filter((i) => i.isPaired);
    assert.equal(paired.length, 1, "the shared TargetB endpoint must transitively merge both current items into one group");
    assert.deepEqual(paired[0].currentNames.sort(), ["Bridge", "Other"]);
    assert.deepEqual(paired[0].incomingNames.sort(), ["TargetA", "TargetB"]);
  });
});

test("a hallucinated pair (naming an item that doesn't exist) is ignored without crashing or affecting real pairs", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "RealCurrent");
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes = root.nodes.filter((n) => n.label !== "RealCurrent");
      root.nodes.push({ id: "e1", label: "RealIncoming", x: 900, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      return JSON.stringify(root);
    }, json);
    await connectAgent(page);
    const proposal = [
      { currentKind: "class", currentName: "RealCurrent", incomingKind: "class", incomingName: "RealIncoming", relationKind: "renamed", note: "real pair" },
      { currentKind: "class", currentName: "DoesNotExist", incomingKind: "class", incomingName: "AlsoDoesNotExist", relationKind: "renamed", note: "hallucinated" },
    ];
    mockChatSequence(page, [() => textBody("```json\n" + JSON.stringify(proposal) + "\n```")]);
    await openReviewFor(page, mutated);
    await page.click("#import-review-suggest");
    await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending());

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    assert.equal(items.length, 1);
    assert.equal(items[0].isPaired, true);
    assert.deepEqual(items[0].currentNames, ["RealCurrent"]);
  });
});

test("rejecting a grouped pairing (Keep current) is a pure no-op for every member, deterministic, no agent call", async () => {
  await withPage(async (page) => {
    const mutated = await buildGroupingFixture(page);
    await connectAgent(page);
    mockChatSequence(page, [() => textBody("```json\n" + JSON.stringify(GENERALIZE_SPECIALIZE_PROPOSAL) + "\n```")]);
    await openReviewFor(page, mutated);
    await page.click("#import-review-suggest");
    await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending());

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const requestBodies = mockChatSequence(page, [() => textBody("should never be reached")]);
    for (const item of items) {
      await page.evaluate((id) => window.__kg.importReview.setChoice(id, "a"), item.id);
    }
    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());

    assert.equal(requestBodies.length, 0, "rejecting every grouped pairing must never call the execution agent");
    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.touched.length, 0);
    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label).sort());
    assert.deepEqual(labels, ["Blender", "Kettle", "RawMaterial", "Toaster"], "nothing from the incoming file should have been imported");
  });
});

test("accepting a grouped pairing sends every member's name to the execution agent, and Download decisions lists the whole group", async () => {
  await withPage(async (page) => {
    const mutated = await buildGroupingFixture(page);
    await connectAgent(page);
    mockChatSequence(page, [() => textBody("```json\n" + JSON.stringify(GENERALIZE_SPECIALIZE_PROPOSAL) + "\n```")]);
    await openReviewFor(page, mutated);
    await page.click("#import-review-suggest");
    await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending());

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    for (const item of items) await page.evaluate((id) => window.__kg.importReview.setChoice(id, "b"), item.id);

    const downloads = [];
    page.on("download", (dl) => downloads.push(dl));
    await page.click("#import-review-download");
    await new Promise((r) => setTimeout(r, 200));
    const stream = await downloads[0].createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const md = Buffer.concat(chunks).toString("utf-8");
    for (const name of ["Toaster", "Kettle", "Blender", "Appliance", "RawMaterial", "Metal", "Plastic", "Glass"]) {
      assert.match(md, new RegExp(name), `expected the downloaded decisions to name "${name}"`);
    }

    const requestBodies = mockChatSequence(page, [
      (body) => {
        const userMsg = body.messages.find((m) => m.role === "user");
        for (const name of ["Toaster", "Kettle", "Blender", "Appliance", "RawMaterial", "Metal", "Plastic", "Glass"]) {
          assert.match(userMsg.content, new RegExp(name), `expected the merger's own prompt content to name "${name}"`);
        }
        return toolCallBody([toolCall("call_1", "apply_ontology_changes", { yaml: "classes:\n  Appliance:\n    meaning: A generalized kitchen appliance.\n" })]);
      },
      () => textBody("Done."),
    ]);
    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    assert.ok(requestBodies.length >= 1);
  });
});

test("the execution agent's closing commentary is surfaced in the result panel and getLastResult(), not silently discarded", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Edited elsewhere.";
      return JSON.stringify(root);
    }, json);
    mockChatSequence(page, [
      () => toolCallBody(
        [toolCall("call_1", "apply_ontology_changes", { yaml: "classes:\n  Widget:\n    meaning: Edited elsewhere.\n" })],
      ),
      () => textBody("I updated Widget's meaning, but left everything else alone since the note didn't call for more than that."),
    ]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "take the new meaning"), items[0].id);

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());

    // The commentary is already visible on the dry-run preview, before
    // anything is committed (issue #126).
    const preview = await page.evaluate(() => window.__kg.importReview.getAgentPreview());
    assert.match(preview.agentCommentary, /left everything else alone/);
    assert.equal(await page.locator("#import-review-agent-preview-commentary").isVisible(), true);
    assert.match(await page.locator("#import-review-agent-preview-commentary").textContent(), /left everything else alone/);

    await page.click("#import-review-agent-preview-confirm");
    await page.waitForFunction(() => window.__kg.importReview.getAgentPreview() === null);

    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.match(result.commentary, /left everything else alone/);
    assert.equal(await page.locator("#import-review-result-commentary").isVisible(), true);
    assert.match(await page.locator("#import-review-result-commentary").textContent(), /left everything else alone/);
  });
});

test("no commentary from the model leaves the commentary line hidden, not an empty box", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Edited elsewhere.";
      return JSON.stringify(root);
    }, json);
    mockChatSequence(page, [
      () => toolCallBody([toolCall("call_1", "apply_ontology_changes", { yaml: "classes:\n  Widget:\n    meaning: Edited elsewhere.\n" })]),
      () => textBody(null),
    ]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "take the new meaning"), items[0].id);

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    assert.equal(await page.locator("#import-review-agent-preview-commentary").isVisible(), false);

    await page.click("#import-review-agent-preview-confirm");
    await page.waitForFunction(() => window.__kg.importReview.getAgentPreview() === null);

    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.commentary, "");
    assert.equal(await page.locator("#import-review-result-commentary").isVisible(), false);
  });
});

test("the shipped merger prompt actually contains the deletion-caution guidance, not just a comment in the source", async () => {
  await withPage(async (page) => {
    const prompts = await page.evaluate(() => window.__kg.importReview.prompts);
    assert.match(prompts.merger, /conservative about removal/i);
    assert.match(prompts.merger, /vague or general instruction/i);
    assert.match(prompts.merger, /keep it and say why/i);
    // The proposer must stay a plain read-only prompt -- no mutation
    // language accidentally introduced into it.
    assert.doesNotMatch(prompts.proposer, /remove_ontology_elements|apply_ontology_changes/);
  });
});

test("a large-scale grouped review (many groups + many plain items) still renders and gates correctly", async () => {
  await withPage(async (page) => {
    // 20 current-only classes, each independently pairing with its own
    // incoming class (20 separate single-member groups, not one giant one)
    // plus 20 plain exact-name-changed matched items -- scale sanity check,
    // not a specific-content assertion.
    // Direct world-space creation, not addNodeViaDblClick -- 40 real
    // double-click round trips would be slow and, at this count, some
    // would land past the visible canvas's screen bounds; scale is the only
    // thing this test cares about, not exercising the click-to-place UI.
    const currentLabels = Array.from({ length: 20 }, (_, i) => `Old${i}`);
    await page.evaluate((labels) => {
      for (let i = 0; i < labels.length; i++) window.__kg.actions.createNode(300 + (i % 5) * 200, 300 + Math.floor(i / 5) * 150, labels[i]);
      for (let i = 0; i < 20; i++) window.__kg.actions.createNode(300 + (i % 5) * 200, 1200 + Math.floor(i / 5) * 150, `Stable${i}`);
    }, currentLabels);
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes = root.nodes.filter((n) => !n.label.startsWith("Old"));
      for (let i = 0; i < 20; i++) {
        root.nodes.push({ id: `new${i}`, label: `New${i}`, x: 2000 + i * 60, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      }
      for (const n of root.nodes) {
        if (n.label.startsWith("Stable")) n.meaning = "changed";
      }
      return JSON.stringify(root);
    }, json);
    const proposal = currentLabels.map((label, i) => ({
      currentKind: "class", currentName: label, incomingKind: "class", incomingName: `New${i}`, relationKind: "renamed", note: `${label} became New${i}`,
    }));
    mockChatSequence(page, [() => textBody("```json\n" + JSON.stringify(proposal) + "\n```")]);
    await openReviewFor(page, mutated);
    await page.click("#import-review-suggest");
    await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending(), null, { timeout: 15000 });

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    assert.equal(items.filter((i) => i.isPaired).length, 20);
    assert.equal(items.filter((i) => i.section === "matched" && !i.isPaired).length, 20);
    assert.equal(items.length, 40);
    assert.equal(await page.locator(".import-review-item").count(), 40);

    for (const item of items) await page.evaluate((id) => window.__kg.importReview.setChoice(id, "a"), item.id);
    assert.equal(await page.evaluate(() => window.__kg.importReview.allDecided()), true);
    assert.equal(await page.locator("#import-review-apply").isDisabled(), false);
  });
});
