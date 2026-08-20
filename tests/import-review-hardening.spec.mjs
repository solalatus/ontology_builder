import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// Import Review hardening (issue #126) -- a real merge of two ontology
// extractions surfaced six defects the tool's own automated pass never
// flagged: a backwards relationship direction, an inverted containment
// edge, a self-contradictory property enum, and four near-duplicate
// relation names for shapes the graph already had a name for. This file
// locks in the fixes: the merger prompt's relation-vocabulary reuse
// guidance, the two new LLM-tier semantic checks, the execution-agent
// dry-run preview, the post-Apply consistency re-check, and the bulk-default
// action. Entirely synthetic (small-appliance domain), per this project's
// own no-real-domain-data-in-the-repo rule -- never the real ontology that
// motivated the issue.

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

test("the relation-vocabulary summary groups by name, counts occurrences, and lists real from/to examples", async () => {
  await withPage(async (page) => {
    const ids = await page.evaluate(() => {
      const a = window.__kg.actions.createNode(0, 0, "Toaster");
      const b = window.__kg.actions.createNode(200, 0, "Kettle");
      const c = window.__kg.actions.createNode(400, 0, "Blender");
      const d = window.__kg.actions.createNode(0, 200, "Appliance");
      return { a: a.id, b: b.id, c: c.id, d: d.id };
    });
    await page.evaluate((ids) => {
      window.__kg.actions.createEdge(ids.a, ids.d, "altípusa", true);
      window.__kg.actions.createEdge(ids.b, ids.d, "altípusa", true);
      window.__kg.actions.createEdge(ids.c, ids.d, "altípusa", true);
      window.__kg.actions.createEdge(ids.a, ids.b, "relatedTo", true);
    }, ids);

    const lines = await page.evaluate(() => window.__kg.importReview.relationVocabulary());
    assert.equal(lines.length, 2, "two distinct relation names");
    assert.match(lines[0], /^- altípusa \(used 3×:/, "the more frequent name sorts first");
    assert.match(lines[0], /Toaster → Appliance/);
    assert.match(lines[0], /Kettle → Appliance/);
    assert.match(lines[1], /^- relatedTo \(used 1×: Toaster → Kettle\)$/);
  });
});

test("the merger's user message includes the current graph's relation vocabulary, and the system prompt tells it to reuse one", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Toaster");
    await addNodeViaDblClick(page, 600, 300, "Appliance");
    await page.evaluate(() => {
      const t = window.__kg.state.nodes.find((n) => n.label === "Toaster");
      const a = window.__kg.state.nodes.find((n) => n.label === "Appliance");
      window.__kg.actions.createEdge(t.id, a.id, "altípusa", true);
    });
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Toaster").meaning = "A small kitchen appliance.";
      return JSON.stringify(root);
    }, json);

    const requestBodies = mockChatSequence(page, [() => textBody("Nothing to add.")]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "take the new meaning"), items[0].id);
    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());

    assert.equal(requestBodies.length, 1);
    const userMsg = requestBodies[0].messages.find((m) => m.role === "user").content;
    assert.match(userMsg, /EXISTING RELATION NAMES IN THE CURRENT GRAPH/);
    assert.match(userMsg, /altípusa \(used 1×: Toaster → Appliance\)/);

    const prompts = await page.evaluate(() => window.__kg.importReview.prompts);
    assert.match(prompts.merger, /REUSE THE GRAPH'S OWN VOCABULARY/);
    assert.match(prompts.merger, /coining a near-duplicate or writing the direction backwards/);
  });
});

test("the graph with no relationships yet still gets a (none) vocabulary line, not an empty/missing section", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Toaster");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Toaster").meaning = "Edited.";
      return JSON.stringify(root);
    }, json);
    const requestBodies = mockChatSequence(page, [() => textBody("Nothing to add.")]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "take it"), items[0].id);
    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    const userMsg = requestBodies[0].messages.find((m) => m.role === "user").content;
    assert.match(userMsg, /EXISTING RELATION NAMES IN THE CURRENT GRAPH: \(none yet/);
  });
});

test("the LLM consistency tier tags findings with relation-direction/property-enum-coherence, and an unknown check falls back to model-review", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await connectAgent(page);
    const prompt = await page.evaluate(() => window.__kg.consistency.llm.prompt);
    assert.match(prompt, /relation-direction/);
    assert.match(prompt, /property-enum-coherence/);
    const checkKinds = await page.evaluate(() => window.__kg.consistency.llm.checkKinds());
    assert.deepEqual([...checkKinds].sort(), ["model-review", "property-enum-coherence", "relation-direction"]);

    await page.route(CHAT_URL, (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify(textBody([
        "```json",
        JSON.stringify([
          { check: "relation-direction", severity: "warning", subject: "requires", message: "reads backwards from how it is stored" },
          { check: "property-enum-coherence", severity: "warning", subject: "Widget.state", message: "brittle is not a kind of ductile" },
          { check: "not-a-real-check", severity: "warning", subject: "x", message: "should fall back" },
          { severity: "warning", subject: "y", message: "no check field at all should also fall back" },
        ]),
        "```",
      ].join("\n"))),
    }));
    await page.evaluate(() => window.__kg.consistency.llm.run());
    await page.waitForFunction(() => window.__kg.consistency.llm.results().length === 4);
    const results = await page.evaluate(() => window.__kg.consistency.llm.results());
    assert.deepEqual(results.map((r) => r.check).sort(), ["model-review", "model-review", "property-enum-coherence", "relation-direction"]);
    assert.ok(results.every((r) => r.severity === "warning"), "the LLM tier never outranks a deterministic error");
  });
});

test("the execution agent's proposed changes show as a dry-run preview -- with real field content -- before anything is committed", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Toaster");
    await addNodeViaDblClick(page, 600, 300, "Appliance");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Toaster").meaning = "Edited elsewhere.";
      return JSON.stringify(root);
    }, json);
    mockChatSequence(page, [
      () => toolCallBody([toolCall("call_1", "apply_ontology_changes", {
        yaml: "relationships:\n  - name: altípusa\n    from: Toaster\n    to: Appliance\n    meaning: A toaster is a kind of appliance.\n",
      })]),
      () => textBody("Added the specialization edge."),
    ]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "take the new meaning, and it's a kind of Appliance"), items[0].id);

    const edgeCountBefore = await page.evaluate(() => window.__kg.state.edges.length);
    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());

    // Nothing landed on the live graph yet.
    assert.equal(await page.evaluate(() => window.__kg.state.edges.length), edgeCountBefore,
      "the agent's own mutation must not be visible on the live graph until Confirm");
    assert.equal(await page.locator("#import-review-result").isVisible(), false, "no result panel yet -- only the preview");

    const preview = await page.evaluate(() => window.__kg.importReview.getAgentPreview());
    assert.ok(preview, "a preview must be pending");
    const relLine = preview.lines.find((l) => l.kind === "relationship");
    assert.ok(relLine, "the diff must surface the new relationship");
    assert.match(relLine.detail, /A toaster is a kind of appliance\./, "the preview must show the real meaning text, not just a touched-list name");

    await page.waitForSelector("#import-review-agent-preview", { state: "visible" });
    const previewText = await page.locator("#import-review-agent-preview-list").textContent();
    assert.match(previewText, /A toaster is a kind of appliance\./);

    await page.click("#import-review-agent-preview-confirm");
    await page.waitForFunction(() => window.__kg.importReview.getAgentPreview() === null);
    assert.equal(await page.evaluate(() => window.__kg.state.edges.length), edgeCountBefore + 1, "confirming actually commits the edge");
    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.ok, true);
  });
});

test("discarding the dry-run preview keeps the deterministic bucket's changes but drops nothing else -- the agent's own edit never lands", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Toaster");
    await addNodeViaDblClick(page, 600, 300, "Gadget");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Toaster").meaning = "Deterministic change.";
      root.nodes.find((n) => n.label === "Gadget").meaning = "Judgement change.";
      return JSON.stringify(root);
    }, json);
    mockChatSequence(page, [
      () => toolCallBody([toolCall("call_1", "apply_ontology_changes", { yaml: "classes:\n  Gadget:\n    meaning: Judgement change.\n" })]),
      () => textBody("Done."),
    ]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const toaster = items.find((i) => i.label === "Toaster");
    const gadget = items.find((i) => i.label === "Gadget");
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "b"), toaster.id); // plain, deterministic
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "take it, needs judgement"), gadget.id); // agent

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    assert.ok(await page.evaluate(() => window.__kg.importReview.getAgentPreview()));

    await page.click("#import-review-agent-preview-discard");
    await page.waitForFunction(() => window.__kg.importReview.getAgentPreview() === null);

    const toasterMeaning = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Toaster").meaning);
    assert.equal(toasterMeaning, "Deterministic change.", "the deterministic bucket's own change still lands");
    const gadgetMeaning = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Gadget").meaning);
    assert.equal(gadgetMeaning, null, "the discarded agent change never lands");

    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.ok, true);
    assert.deepEqual(result.touched, [{ kind: "class", name: "Toaster", action: "updated" }]);
    assert.match(result.message, /discarded/i);

    // One combined undo step for exactly what was actually kept.
    await page.evaluate(() => window.__kg.actions.undo());
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Toaster").meaning), null);
  });
});

test("closing the dialog with a preview still pending discards the whole Apply, including the deterministic bucket -- no orphaned, un-undoable mutation", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Toaster");
    await addNodeViaDblClick(page, 600, 300, "Gadget");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Toaster").meaning = "Deterministic change.";
      root.nodes.find((n) => n.label === "Gadget").meaning = "Judgement change.";
      return JSON.stringify(root);
    }, json);
    mockChatSequence(page, [
      () => toolCallBody([toolCall("call_1", "apply_ontology_changes", { yaml: "classes:\n  Gadget:\n    meaning: Judgement change.\n" })]),
      () => textBody("Done."),
    ]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const toaster = items.find((i) => i.label === "Toaster");
    const gadget = items.find((i) => i.label === "Gadget");
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "b"), toaster.id);
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "take it, needs judgement"), gadget.id);

    const undoDisabledBeforeApply = await page.locator("#btn-undo").isDisabled();
    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    assert.ok(await page.evaluate(() => window.__kg.importReview.getAgentPreview()), "a preview should be pending");
    // Deterministic bucket's mutation is live on `state` right now, but not
    // yet in history -- this is exactly the window closeImportReview() has
    // to defend.
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Toaster").meaning), "Deterministic change.");

    await page.keyboard.press("Escape");
    assert.equal(await page.evaluate(() => window.__kg.importReview.isOpen()), false);
    assert.equal(await page.evaluate(() => window.__kg.importReview.getAgentPreview()), null);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Toaster").meaning), null,
      "the deterministic bucket's not-yet-committed change must be reverted too, not left dangling with no undo entry");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Gadget").meaning), null);
    assert.equal(await page.locator("#btn-undo").isDisabled(), undoDisabledBeforeApply, "nothing from this Apply attempt should have entered history at all");
  });
});

test("Apply re-runs the deterministic consistency checks and reports only what this merge newly introduced, not pre-existing findings", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Toaster");
    await addNodeViaDblClick(page, 600, 300, "Gadget");
    // A pre-existing note, unrelated to anything this merge touches -- must
    // never show up as "newly introduced" just because it was found again.
    await page.evaluate(() => window.__kg.actions.createRule("preexistingOrphan", ["Gadget must be labelled"]));

    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Toaster").meaning = "Edited elsewhere.";
      return JSON.stringify(root);
    }, json);
    // The mocked tool call deliberately introduces a self-loop -- a
    // structural defect computeOntologyFindings() can always catch
    // deterministically, standing in for the kind of merge-introduced
    // problem this check exists to surface without needing another API call.
    mockChatSequence(page, [
      () => toolCallBody([toolCall("call_1", "apply_ontology_changes", {
        yaml: "classes:\n  Toaster:\n    meaning: Edited elsewhere.\nrelationships:\n  - name: dependsOn\n    from: Toaster\n    to: Toaster\n    meaning: circular by construction\n",
      })]),
      () => textBody("Done."),
    ]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "take the new meaning"), items[0].id);

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    await page.click("#import-review-agent-preview-confirm");
    await page.waitForFunction(() => window.__kg.importReview.getAgentPreview() === null);

    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    // Introducing the first relationship in the whole graph also "wakes up"
    // class-no-relationships for Gadget (see that check's own gate: it stays
    // silent while relationships.length === 0, the normal state of a model
    // still being built) -- a second real, newly-true finding, not a test
    // artifact, on top of the self-loop itself.
    const newChecks = result.newConsistencyFindings.map((f) => f.check).sort();
    assert.deepEqual(newChecks, ["class-no-relationships", "self-loop"], `got ${JSON.stringify(result.newConsistencyFindings)}`);
    assert.ok(!result.newConsistencyFindings.some((f) => f.check === "orphan-rule"),
      "the pre-existing orphan rule must not be reported as newly introduced");

    assert.equal(await page.locator("#import-review-new-findings").isVisible(), true);
    const findingsText = await page.locator("#import-review-new-findings-list").textContent();
    assert.match(findingsText, /self-loop/);
  });
});

test("no new findings after Apply keeps the new-findings panel hidden, not an empty box", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Toaster");
    await connectAgent(page);
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Toaster").meaning = "Edited elsewhere.";
      return JSON.stringify(root);
    }, json);
    mockChatSequence(page, [
      () => toolCallBody([toolCall("call_1", "apply_ontology_changes", { yaml: "classes:\n  Toaster:\n    meaning: Edited elsewhere.\n" })]),
      () => textBody("Done."),
    ]);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "take it"), items[0].id);
    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());
    await page.click("#import-review-agent-preview-confirm");
    await page.waitForFunction(() => window.__kg.importReview.getAgentPreview() === null);

    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.deepEqual(result.newConsistencyFindings, []);
    assert.equal(await page.locator("#import-review-new-findings").isVisible(), false);
  });
});

test("the bulk-default action marks only undecided current-only items 'keep current', leaving decided items and every other section alone", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "OnlyHere1");
    await addNodeViaDblClick(page, 600, 300, "OnlyHere2");
    await addNodeViaDblClick(page, 300, 600, "AlreadyDecided");
    await addNodeViaDblClick(page, 600, 600, "HasANote");
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes = root.nodes.filter((n) => !["OnlyHere1", "OnlyHere2", "AlreadyDecided", "HasANote"].includes(n.label));
      root.nodes.push({ id: "extra_new", label: "IncomingOnly", x: 1500, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      return JSON.stringify(root);
    }, json);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const alreadyDecided = items.find((i) => i.label === "AlreadyDecided");
    const hasANote = items.find((i) => i.label === "HasANote");
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "b"), alreadyDecided.id);
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "actually drop this one"), hasANote.id);

    await page.click("#import-review-bulk-keep-current");

    const after = await page.evaluate(() => window.__kg.importReview.getItems().map((i) => ({
      label: i.label, section: i.section, decision: window.__kg.importReview.getDecision(i.id),
    })));
    const only1 = after.find((i) => i.label === "OnlyHere1");
    const only2 = after.find((i) => i.label === "OnlyHere2");
    assert.equal(only1.decision.choice, "a");
    assert.equal(only2.decision.choice, "a");
    // Left exactly as the human set them -- bulk-default must never override
    // an existing choice or a written note.
    const decided = after.find((i) => i.label === "AlreadyDecided");
    assert.equal(decided.decision.choice, "b");
    const noted = after.find((i) => i.label === "HasANote");
    assert.equal(noted.decision.note, "actually drop this one");
    assert.equal(noted.decision.choice, null);
    // The incoming-only item is a different section entirely -- untouched,
    // deliberately left undecided here to prove the bulk action never
    // reaches across sections.
    const incoming = after.find((i) => i.label === "IncomingOnly");
    assert.equal(incoming.decision.choice, null);
    assert.equal(await page.evaluate(() => window.__kg.importReview.allDecided()), false,
      "the untouched incoming-only item should still be the one thing blocking Apply");
  });
});
