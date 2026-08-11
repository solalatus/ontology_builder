import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// Ontology Change Review (issue #74), retrospective scope this round: a
// persistent, optional "Review changes" facility over history.past — a
// deterministic semantic diff engine (classes/relationships/properties/
// rules/actions, plus relationship direction-changed), a 4-level dialog
// (Summary/Details/Graph diff/YAML diff), Previous/Next navigation mirroring
// undo's own unbounded depth, and reuse of the existing Undo mechanism.
// Preview mode (Apply/Reject, staleness hashing, the structured metadata
// API) is explicitly out of scope this round — see helper_agent_todo.md's
// dated log entry — so it isn't tested here either.

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

function mockModelsRoute(page) {
  const models = [{ id: "gpt-4o-mini", created: 1715000000, object: "model", owned_by: "openai" }];
  return page.route(MODELS_URL, (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data: models }) });
  });
}

function chatCompletionBody(replyText) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: replyText }, finish_reason: "stop" }] };
}

function toolCall(id, argsObj) {
  return { id, type: "function", function: { name: "apply_ontology_yaml", arguments: JSON.stringify(argsObj) } };
}

function toolCallCompletionBody(toolCalls, content = null) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content, tool_calls: toolCalls }, finish_reason: "tool_calls" }] };
}

function mockChatSequence(page, responders) {
  let callIndex = 0;
  page.route(CHAT_URL, (route) => {
    const responder = responders[Math.min(callIndex, responders.length - 1)];
    callIndex++;
    const { status = 200, body } = responder();
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
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

async function sendChatMessage(page, text) {
  await page.fill("#agent-chat-input", text);
  await page.click("#agent-chat-send");
}

async function dropYaml(page, text, filename = "import.domain.yaml") {
  await page.evaluate(({ t, name }) => {
    const dt = new DataTransfer();
    const file = new File([t], name, { type: "text/yaml" });
    dt.items.add(file);
    document.getElementById("canvas").dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { t: text, name: filename });
  await page.waitForSelector("#import-overlay", { state: "visible" });
}

async function mergeYaml(page, text) {
  await dropYaml(page, text);
  await page.click("#import-merge");
  await page.waitForTimeout(120);
}

// Plain snapshot builders for the diff-engine's own pure-function tests --
// deliberately hand-built, not derived from a live page, so these tests are
// fast and isolate exactly what computeSemanticDiff() itself does.
function snap(nodes = [], edges = [], rules = [], actions = []) {
  return { nodes, edges, rules, actions };
}
function mkNode(id, label, meaning = null, aliases = [], properties = []) {
  return { id, label, x: 0, y: 0, w: 160, h: 60, meaning, aliases, properties };
}
function mkEdge(id, source, target, relation, directed = true, meaning = null, aliases = []) {
  return { id, source, target, relation, directed, meaning, aliases };
}

async function diffOf(page, before, after) {
  return page.evaluate(([b, a]) => window.__kg.reviewChanges.computeSemanticDiff(b, a), [before, after]);
}

// --------------------------------------------------------------------------
// Semantic diff engine — pure function tests
// --------------------------------------------------------------------------

test("diff engine: detects a class addition", async () => {
  await withPage(async (page) => {
    const before = snap([mkNode("n1", "Invoice")]);
    const after = snap([mkNode("n1", "Invoice"), mkNode("n2", "Supplier", "Who sends it.")]);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.classes.added.length, 1);
    assert.equal(diff.classes.added[0].name, "Supplier");
    assert.equal(diff.classes.removed.length, 0);
    assert.equal(diff.classes.changed.length, 0);
  });
});

test("diff engine: detects a class removal", async () => {
  await withPage(async (page) => {
    const before = snap([mkNode("n1", "Invoice"), mkNode("n2", "Supplier")]);
    const after = snap([mkNode("n1", "Invoice")]);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.classes.removed.length, 1);
    assert.equal(diff.classes.removed[0].name, "Supplier");
  });
});

test("diff engine: detects a class meaning change", async () => {
  await withPage(async (page) => {
    const before = snap([mkNode("n1", "Invoice", "old meaning")]);
    const after = snap([mkNode("n1", "Invoice", "new meaning")]);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.classes.changed.length, 1);
    assert.equal(diff.classes.changed[0].before.meaning, "old meaning");
    assert.equal(diff.classes.changed[0].after.meaning, "new meaning");
  });
});

test("diff engine: detects relationship additions and removals", async () => {
  await withPage(async (page) => {
    const nodes = [mkNode("n1", "Invoice"), mkNode("n2", "Supplier")];
    const before = snap(nodes, []);
    const after = snap(nodes, [mkEdge("e1", "n1", "n2", "issuedBy")]);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.relationships.added.length, 1);
    assert.equal(diff.relationships.added[0].name, "issuedBy");
    const diffReverse = await diffOf(page, after, before);
    assert.equal(diffReverse.relationships.removed.length, 1);
  });
});

test("diff engine: detects a relationship direction change as its own category, not remove+add", async () => {
  await withPage(async (page) => {
    const nodes = [mkNode("n1", "Invoice"), mkNode("n2", "Supplier")];
    const before = snap(nodes, [mkEdge("e1", "n1", "n2", "relatesTo")]);
    const after = snap(nodes, [mkEdge("e1", "n2", "n1", "relatesTo")]);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.relationships.directionChanged.length, 1, "must be classified as direction-changed");
    assert.equal(diff.relationships.added.length, 0, "must not also appear as a plain addition");
    assert.equal(diff.relationships.removed.length, 0, "must not also appear as a plain removal");
    assert.equal(diff.relationships.directionChanged[0].before.from, "Invoice");
    assert.equal(diff.relationships.directionChanged[0].after.from, "Supplier");
  });
});

test("diff engine: detects a relationship field change (not a direction change) as changed", async () => {
  await withPage(async (page) => {
    const nodes = [mkNode("n1", "Invoice"), mkNode("n2", "Supplier")];
    const before = snap(nodes, [mkEdge("e1", "n1", "n2", "issuedBy", true, "old meaning")]);
    const after = snap(nodes, [mkEdge("e1", "n1", "n2", "issuedBy", true, "new meaning")]);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.relationships.changed.length, 1);
    assert.equal(diff.relationships.directionChanged.length, 0);
  });
});

test("diff engine: detects property additions, removals, and changes on a matched class", async () => {
  await withPage(async (page) => {
    const before = snap([mkNode("n1", "Invoice", null, [], [
      { name: "amount", type: "number" },
      { name: "status", type: "text" },
    ])]);
    const after = snap([mkNode("n1", "Invoice", null, [], [
      { name: "amount", type: "number", unit: "EUR" }, // changed (gained a unit)
      { name: "dueDate", type: "date" }, // added
      // "status" removed
    ])]);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.properties.added.length, 1);
    assert.equal(diff.properties.added[0].name, "dueDate");
    assert.equal(diff.properties.added[0].className, "Invoice");
    assert.equal(diff.properties.removed.length, 1);
    assert.equal(diff.properties.removed[0].name, "status");
    assert.equal(diff.properties.changed.length, 1);
    assert.equal(diff.properties.changed[0].name, "amount");
    assert.equal(diff.properties.changed[0].after.unit, "EUR");
  });
});

test("diff engine: a brand-new class's own properties are not separately reported as property-added", async () => {
  await withPage(async (page) => {
    const before = snap([]);
    const after = snap([mkNode("n1", "Invoice", null, [], [{ name: "amount", type: "number" }])]);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.classes.added.length, 1);
    assert.equal(diff.properties.added.length, 0, "a wholly new class's properties are covered by the class addition itself");
  });
});

test("diff engine: detects rule and action changes", async () => {
  await withPage(async (page) => {
    const beforeRules = [{ id: "r1", name: "isOverdue", conditions: ["a"] }];
    const afterRules = [{ id: "r1", name: "isOverdue", conditions: ["a", "b"] }];
    const beforeActions = [{ id: "a1", name: "sendReminder", inputClassId: null, preconditions: [], effect: "old", verification: "" }];
    const afterActions = [{ id: "a1", name: "sendReminder", inputClassId: null, preconditions: [], effect: "new", verification: "" }];
    const before = snap([], [], beforeRules, beforeActions);
    const after = snap([], [], afterRules, afterActions);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.rules.changed.length, 1);
    assert.deepEqual(diff.rules.changed[0].after.conditions, ["a", "b"]);
    assert.equal(diff.actions.changed.length, 1);
    assert.equal(diff.actions.changed[0].after.effect, "new");
  });
});

test("diff engine: rule/action additions and removals are detected by name", async () => {
  await withPage(async (page) => {
    const before = snap([], [], [{ id: "r1", name: "ruleA", conditions: [] }], [{ id: "a1", name: "actionA", inputClassId: null, preconditions: [], effect: "", verification: "" }]);
    const after = snap([], [], [{ id: "r2", name: "ruleB", conditions: [] }], [{ id: "a2", name: "actionB", inputClassId: null, preconditions: [], effect: "", verification: "" }]);
    const diff = await diffOf(page, before, after);
    assert.equal(diff.rules.removed.length, 1);
    assert.equal(diff.rules.removed[0].name, "ruleA");
    assert.equal(diff.rules.added.length, 1);
    assert.equal(diff.rules.added[0].name, "ruleB");
    assert.equal(diff.actions.removed[0].name, "actionA");
    assert.equal(diff.actions.added[0].name, "actionB");
  });
});

test("diff engine: internal ids never create a false semantic change (identity is label/name, not id)", async () => {
  await withPage(async (page) => {
    // Same class, wildly different internal ids -- must diff as unchanged.
    const before = snap([mkNode("id-aaa", "Invoice", "a bill")]);
    const after = snap([mkNode("id-zzz", "Invoice", "a bill")]);
    const diff = await diffOf(page, before, after);
    assert.ok(await page.evaluate((d) => window.__kg.reviewChanges.isSemanticDiffEmpty(d), diff));
  });
});

test("diff engine: an identical before/after pair deterministically produces an empty diff", async () => {
  await withPage(async (page) => {
    const model = snap(
      [mkNode("n1", "Invoice", "a bill", ["bill"], [{ name: "amount", type: "number" }])],
      [mkEdge("e1", "n1", "n1", "self", true, "loop")], // pathological but must still diff as empty against itself
      [{ id: "r1", name: "ruleA", conditions: ["x"] }],
      [{ id: "a1", name: "actionA", inputClassId: "n1", preconditions: ["r1"], effect: "e", verification: "v" }],
    );
    const diff = await diffOf(page, model, model);
    assert.ok(await page.evaluate((d) => window.__kg.reviewChanges.isSemanticDiffEmpty(d), diff));
  });
});

// --------------------------------------------------------------------------
// YAML line diff (Level 4)
// --------------------------------------------------------------------------

test("diffLines: identical text produces only same-type lines", async () => {
  await withPage(async (page) => {
    const lines = await page.evaluate(() => window.__kg.reviewChanges.diffLines("a\nb\nc", "a\nb\nc"));
    assert.ok(lines.every((l) => l.type === "same"));
  });
});

test("diffLines: an inserted line shows as added, surrounding lines stay same", async () => {
  await withPage(async (page) => {
    const lines = await page.evaluate(() => window.__kg.reviewChanges.diffLines("a\nc", "a\nb\nc"));
    assert.deepEqual(lines.map((l) => l.type), ["same", "added", "same"]);
    assert.equal(lines[1].line, "b");
  });
});

// --------------------------------------------------------------------------
// Toolbar button + navigation, driven through the real UI
// --------------------------------------------------------------------------

test("the Review changes button is disabled with an empty history and enables after the first edit", async () => {
  await withPage(async (page) => {
    assert.equal(await page.evaluate(() => document.getElementById("btn-review-changes").disabled), true);
    await mergeYaml(page, "classes:\n  Invoice:\n    meaning: A bill.\n");
    assert.equal(await page.evaluate(() => document.getElementById("btn-review-changes").disabled), false);
  });
});

test("opening Review changes shows the latest edit by default", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  Invoice:\n    meaning: first.\n");
    await mergeYaml(page, "classes:\n  Supplier:\n    meaning: second.\n");
    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    assert.equal(await page.evaluate(() => window.__kg.reviewChanges.getIndex()), 1, "index 1 is the latest of 2 entries");
    const summary = await page.locator("#review-panel-summary").innerText();
    assert.match(summary, /Supplier/);
  });
});

test("Previous/Next edit navigation moves through history.past and respects both bounds", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  A:\n    meaning: one.\n");
    await mergeYaml(page, "classes:\n  B:\n    meaning: two.\n");
    await mergeYaml(page, "classes:\n  C:\n    meaning: three.\n");
    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });

    assert.equal(await page.evaluate(() => window.__kg.reviewChanges.getIndex()), 2);
    assert.equal(await page.locator("#review-changes-next").isDisabled(), true);

    await page.click("#review-changes-prev");
    assert.equal(await page.evaluate(() => window.__kg.reviewChanges.getIndex()), 1);
    await page.click("#review-changes-prev");
    assert.equal(await page.evaluate(() => window.__kg.reviewChanges.getIndex()), 0);
    assert.equal(await page.locator("#review-changes-prev").isDisabled(), true);

    // Bounds: clicking Previous again (button disabled, but assert the
    // underlying function itself also refuses to go out of range).
    await page.evaluate(() => window.__kg.reviewChanges.navigate(-1));
    assert.equal(await page.evaluate(() => window.__kg.reviewChanges.getIndex()), 0);

    await page.click("#review-changes-next");
    await page.click("#review-changes-next");
    assert.equal(await page.evaluate(() => window.__kg.reviewChanges.getIndex()), 2);
    assert.equal(await page.locator("#review-changes-next").isDisabled(), true);
  });
});

test("navigation reaches every entry regardless of how many there are -- mirrors undo's own unbounded depth, no separate cap", async () => {
  await withPage(async (page) => {
    for (let i = 0; i < 12; i++) {
      await mergeYaml(page, `classes:\n  C${i}:\n    meaning: n${i}.\n`);
    }
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), 12);
    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    for (let i = 0; i < 11; i++) await page.click("#review-changes-prev");
    assert.equal(await page.evaluate(() => window.__kg.reviewChanges.getIndex()), 0, "must be able to reach the very first entry, no matter how many entries exist");
  });
});

// --------------------------------------------------------------------------
// Read-only guarantee
// --------------------------------------------------------------------------

test("opening, navigating, and switching tabs never mutates the graph or pushes new history", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  A:\n    meaning: one.\n");
    await mergeYaml(page, "classes:\n  B:\n    meaning: two.\n");
    const before = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes.length,
      historyLength: window.__kg.history.past.length,
    }));

    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    await page.click("#review-tab-details");
    await page.click("#review-tab-graph");
    await page.click("#review-graph-before");
    await page.click("#review-graph-after");
    await page.click("#review-tab-yaml");
    await page.click("#review-changes-prev");
    await page.click("#review-changes-next");
    await page.click("#review-changes-close");

    const after = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes.length,
      historyLength: window.__kg.history.past.length,
    }));
    assert.deepEqual(after, before, "reviewing must never change graph state or the history stack");
  });
});

// --------------------------------------------------------------------------
// Undo integration
// --------------------------------------------------------------------------

test("Undo this edit is enabled only when viewing the latest entry, and reuses the real undo() path", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  A:\n    meaning: one.\n");
    await mergeYaml(page, "classes:\n  B:\n    meaning: two.\n");
    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });

    assert.equal(await page.locator("#review-changes-undo").isDisabled(), false, "latest entry must allow Undo");
    await page.click("#review-changes-prev");
    assert.equal(await page.locator("#review-changes-undo").isDisabled(), true, "an older entry must not allow one-click Undo");

    await page.click("#review-changes-next"); // back to latest
    const nodeLabelsBefore = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(nodeLabelsBefore.includes("B"));

    await page.click("#review-changes-undo");
    assert.equal(await page.evaluate(() => document.getElementById("review-changes-overlay").style.display), "none", "Undo this edit also closes the dialog");
    const nodeLabelsAfter = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(!nodeLabelsAfter.includes("B"), "the class from the undone edit must be gone");
    assert.ok(nodeLabelsAfter.includes("A"), "the earlier edit must be untouched");
    assert.equal(await page.evaluate(() => window.__kg.history.future.length), 1, "undo() must have gone through the real history.future path, redo-able like any other undo");
  });
});

// --------------------------------------------------------------------------
// Source tagging + evidence (agent vs. manual edits)
// --------------------------------------------------------------------------

test("a manual (non-agent) edit is tagged source: user-edit with no evidence", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  Invoice:\n    meaning: A bill.\n");
    const entry = await page.evaluate(() => window.__kg.history.past[window.__kg.history.past.length - 1]);
    assert.equal(entry.source, "user-edit");
    assert.equal(entry.evidenceIndex, null);
    const evidence = await page.evaluate((e) => window.__kg.reviewChanges.resolveReviewEvidence(e), entry);
    assert.equal(evidence, null);
  });
});

test("an agent tool-call edit is tagged source: agent-auto-edit, and its evidence resolves to the model's own follow-up reply", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: "classes:\n  Invoice:\n    meaning: A bill.\n" })]) }),
      () => ({ body: chatCompletionBody("I've added the Invoice class because the expert described billing first.") }),
    ]);
    await sendChatMessage(page, "Let's track invoices.");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const entry = await page.evaluate(() => window.__kg.history.past[window.__kg.history.past.length - 1]);
    assert.equal(entry.source, "agent-auto-edit");
    assert.equal(typeof entry.evidenceIndex, "number");

    const evidence = await page.evaluate((e) => window.__kg.reviewChanges.resolveReviewEvidence(e), entry);
    assert.equal(evidence, "I've added the Invoice class because the expert described billing first.");

    // ...and it actually renders in the dialog's evidence box.
    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    assert.equal(await page.locator("#review-changes-evidence").isHidden(), false);
    assert.match(await page.locator("#review-changes-evidence-text").textContent(), /billing first/);
  });
});

test("an agent edit with no follow-up reply yet (turn still settling) resolves to no evidence, gracefully", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    // Tool call only, no second response queued -- the follow-up reply never
    // arrives (route falls through to the last responder, itself a tool
    // call again, but committedThisTurn blocks a second real commit; the
    // point here is only that evidence resolution doesn't throw or hang
    // when transcript has nothing past evidenceIndex).
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: "classes:\n  Invoice:\n    meaning: A bill.\n" })]) }),
      () => ({ body: chatCompletionBody("") }), // empty reply -- resolveReviewEvidence must treat blank text as "no evidence" too
    ]);
    await sendChatMessage(page, "Let's track invoices.");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const entry = await page.evaluate(() => window.__kg.history.past[window.__kg.history.past.length - 1]);
    const evidence = await page.evaluate((e) => window.__kg.reviewChanges.resolveReviewEvidence(e), entry);
    assert.equal(evidence, null);

    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    assert.equal(await page.locator("#review-changes-evidence").isHidden(), true, "the evidence box must stay hidden, not show an empty label");
  });
});

test("reviewing works correctly whether or not optional rationale/evidence is present -- both a manual and an agent edit are fully reviewable in the same session", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  Invoice:\n    meaning: A bill.\n"); // manual, no evidence
    await connectAgent(page);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: "classes:\n  Supplier:\n    meaning: Who sends it.\n" })]) }),
      () => ({ body: chatCompletionBody("Added the Supplier class too.") }),
    ]);
    await sendChatMessage(page, "and suppliers");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    // Latest (agent) entry has evidence.
    assert.equal(await page.locator("#review-changes-evidence").isHidden(), false);
    // Older (manual) entry has none, and the dialog doesn't error rendering it.
    await page.click("#review-changes-prev");
    assert.equal(await page.locator("#review-changes-evidence").isHidden(), true);
    const summary = await page.locator("#review-panel-summary").innerText();
    assert.match(summary, /Invoice/);
  });
});

// --------------------------------------------------------------------------
// Ordinary agent edits remain auto-applied -- this feature changes nothing
// about when/how edits are committed (issue §9's own requirement).
// --------------------------------------------------------------------------

test("ordinary agent tool-call edits still auto-apply immediately, with no Accept/Reject step introduced", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: "classes:\n  Invoice:\n    meaning: A bill.\n" })]) }),
      () => ({ body: chatCompletionBody("done") }),
    ]);
    await sendChatMessage(page, "track invoices");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    // Applied without ever opening the review dialog -- proves it's not
    // gating anything.
    const nodeLabels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(nodeLabels.includes("Invoice"));
    assert.equal(await page.evaluate(() => document.getElementById("review-changes-overlay").style.display), "", "the review dialog must never auto-open on an ordinary edit");
  });
});

// --------------------------------------------------------------------------
// Graph diff (Level 3): status classification, and the position-noise fix
// --------------------------------------------------------------------------

test("graph diff: an unrelated later edit does not make an untouched node's status read as changed (position moves from autolayout must not count)", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  Invoice:\n    meaning: A bill.\n  Supplier:\n    meaning: Who sends it.\n" +
      "relationships:\n  - name: issuedBy\n    from: Invoice\n    to: Supplier\n");
    // A second, unrelated import triggers computeAutoLayoutPositions() again,
    // which repositions every node, including Invoice/Supplier untouched by
    // this edit's own content -- exactly the scenario that used to render
    // them as spuriously "changed" before the position-noise fix.
    await mergeYaml(page, "classes:\n  Payment:\n    meaning: A settlement.\n" +
      "relationships:\n  - name: settles\n    from: Payment\n    to: Invoice\n");

    const entry = await page.evaluate(() => window.__kg.history.past[window.__kg.history.past.length - 1]);

    const afterNodes = entry.after.nodes;
    const invoiceId = afterNodes.find((n) => n.label === "Invoice").id;
    const supplierId = afterNodes.find((n) => n.label === "Supplier").id;

    const statuses = await page.evaluate(({ e, invoiceId, supplierId }) => {
      const sets = window.__kg.reviewChanges.computeReviewGraphDiffSets(e.before, e.after);
      return { invoice: sets.statusByNodeId.get(invoiceId), supplier: sets.statusByNodeId.get(supplierId) };
    }, { e: entry, invoiceId, supplierId });

    assert.equal(statuses.invoice, undefined, "Invoice must not be flagged as changed just because autolayout moved it");
    assert.equal(statuses.supplier, undefined, "Supplier must not be flagged as changed either");
  });
});

test("graph diff: a genuinely edited node (meaning changed) is correctly classified as changed, not unchanged", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  Invoice:\n    meaning: old meaning.\n");
    await mergeYaml(page, "classes:\n  Invoice:\n    meaning: new meaning.\n");
    const entry = await page.evaluate(() => window.__kg.history.past[window.__kg.history.past.length - 1]);
    const invoiceId = entry.after.nodes.find((n) => n.label === "Invoice").id;
    const status = await page.evaluate(({ e, id }) => {
      const sets = window.__kg.reviewChanges.computeReviewGraphDiffSets(e.before, e.after);
      return sets.statusByNodeId.get(id);
    }, { e: entry, id: invoiceId });
    assert.equal(status, "changed");
  });
});

// --------------------------------------------------------------------------
// Language toggle
// --------------------------------------------------------------------------

test("the dialog's static chrome and dynamic content both retranslate on a language toggle while open", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  Invoice:\n    meaning: A bill.\n");
    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    const enTitle = await page.locator("#review-changes-title").textContent();
    const enSummary = await page.locator("#review-panel-summary").textContent();

    await page.evaluate(() => window.__kg.lang.toggle());

    const otherTitle = await page.locator("#review-changes-title").textContent();
    const otherSummary = await page.locator("#review-panel-summary").textContent();
    assert.notEqual(enTitle, otherTitle);
    assert.notEqual(enSummary, otherSummary);
    assert.ok(otherTitle.length > 0);
  });
});

// --------------------------------------------------------------------------
// Level 4 (YAML diff) matches the before/after models directly
// --------------------------------------------------------------------------

test("the YAML diff view's added lines reflect the actual after-model content", async () => {
  await withPage(async (page) => {
    await mergeYaml(page, "classes:\n  Invoice:\n    meaning: A bill.\n");
    await mergeYaml(page, "classes:\n  Supplier:\n    meaning: Who sends it.\n");
    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    await page.click("#review-tab-yaml");
    const addedLines = await page.evaluate(() =>
      [...document.querySelectorAll("#review-yaml-diff .diff-line-added")].map((el) => el.textContent));
    assert.ok(addedLines.some((l) => l.includes("Supplier")));
    assert.ok(addedLines.some((l) => l.includes("Who sends it.")));
    const removedLines = await page.evaluate(() =>
      [...document.querySelectorAll("#review-yaml-diff .diff-line-removed")].length);
    assert.equal(removedLines, 0, "a pure addition must not show any removed lines");
  });
});

// --------------------------------------------------------------------------
// Empty-diff edge case in the dialog itself
// --------------------------------------------------------------------------

test("an edit that nets to an empty semantic diff (e.g. re-importing identical content) shows the no-changes message instead of blank panels", async () => {
  await withPage(async (page) => {
    const yaml = "classes:\n  Invoice:\n    meaning: A bill.\n";
    await mergeYaml(page, yaml);
    // Re-importing the exact same file is idempotent at the semantic level
    // but still costs its own history entry (Merge always applies and
    // pushes -- see agent-ontology-phase-g.spec.mjs's own idempotency test).
    await mergeYaml(page, yaml);
    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    const summary = await page.locator("#review-panel-summary").textContent();
    assert.match(summary, /no changes/i);
  });
});

// --------------------------------------------------------------------------
// Agent chat welcome message (static, pre-first-message, i18n)
// --------------------------------------------------------------------------

test("the agent panel shows a static welcome message before any chat message exists, and it disappears once a message is sent", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const welcomeText = await page.locator("#agent-welcome-message").textContent();
    assert.ok(welcomeText.length > 0);
    // It's explanatory chrome, not a real transcript entry -- must never be
    // counted in the transcript array itself (evidenceIndex/persistence
    // both key off this length).
    assert.equal(await page.evaluate(() => window.__kg.agent.state.transcript.length), 0);

    mockChatSequence(page, [() => ({ body: chatCompletionBody("hi there") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    assert.equal(await page.locator("#agent-welcome-message").count(), 0, "the welcome placeholder must be replaced once real messages exist");
    assert.ok((await page.evaluate(() => window.__kg.agent.state.transcript.length)) > 0);
  });
});

test("the welcome message retranslates on a language toggle, and reappears correctly after Restart Conversation clears the transcript", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const huText = await page.locator("#agent-welcome-message").textContent();

    await page.evaluate(() => window.__kg.lang.toggle());
    const enText = await page.locator("#agent-welcome-message").textContent();
    assert.notEqual(huText, enText);
    assert.ok(enText.length > 0);

    mockChatSequence(page, [() => ({ body: chatCompletionBody("hi there") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    assert.equal(await page.locator("#agent-welcome-message").count(), 0);

    await page.click("#agent-restart-conversation");
    await page.waitForSelector("#confirm-overlay", { state: "visible" });
    await page.click("#confirm-ok");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 0);
    assert.equal(await page.locator("#agent-welcome-message").count(), 1, "restarting the conversation must bring the welcome placeholder back");
  });
});

// --------------------------------------------------------------------------
// Review changes toolbar button tooltip
// --------------------------------------------------------------------------

test("the Review changes button carries a short explanatory tooltip that retranslates on language toggle", async () => {
  await withPage(async (page) => {
    const huTooltip = await page.getAttribute("#btn-review-changes", "data-tooltip");
    assert.ok(huTooltip && huTooltip.length > 0);
    // A short tooltip should stay well clear of the shared [data-tooltip]
    // CSS rule's white-space:nowrap overflow risk (found and fixed this
    // round for this exact button) -- pinned here as a coarse guard against
    // regressing back to an unreadable, viewport-overflowing sentence.
    assert.ok(huTooltip.length < 100, "tooltip text should stay short enough to render as a single readable line");

    await page.evaluate(() => window.__kg.lang.toggle());
    const enTooltip = await page.getAttribute("#btn-review-changes", "data-tooltip");
    assert.notEqual(huTooltip, enTooltip);
    assert.ok(enTooltip.length > 0 && enTooltip.length < 100);
  });
});

// --------------------------------------------------------------------------
// Adjacent coverage: mixed manual + agent edits through the same undo stack
// (pushHistory's source/evidenceIndex metadata is genuinely new surface
// this round -- phase3.spec.mjs already covers plain undo/redo mechanics
// exhaustively for manual-only sequences, so this focuses specifically on
// what's new: does each entry's source/evidence survive being interleaved
// with a different kind of edit, and survive the past<->future move?)
// --------------------------------------------------------------------------

test("manual and agent edits interleaved in one session each keep their own correct source tag, in order, unaffected by the other kind", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha"); // manual #1

    await connectAgent(page);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: "classes:\n  Invoice:\n    meaning: A bill.\n" })]) }),
      () => ({ body: chatCompletionBody("done") }),
    ]);
    await sendChatMessage(page, "track invoices");
    await page.waitForFunction(() => !window.__kg.agent.isSending()); // agent #2

    await addNodeViaDblClick(page, 500, 300, "Beta"); // manual #3

    const sources = await page.evaluate(() => window.__kg.history.past.map((e) => e.source));
    assert.deepEqual(sources, ["user-edit", "agent-auto-edit", "user-edit"]);
    const evidenceFlags = await page.evaluate(() => window.__kg.history.past.map((e) => e.evidenceIndex !== null));
    assert.deepEqual(evidenceFlags, [false, true, false]);
  });
});

test("undo/redo through an interleaved manual/agent/manual sequence preserves each entry's source and evidenceIndex exactly, round-tripping past into future and back", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await connectAgent(page);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: "classes:\n  Invoice:\n    meaning: A bill.\n" })]) }),
      () => ({ body: chatCompletionBody("done") }),
    ]);
    await sendChatMessage(page, "track invoices");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    await addNodeViaDblClick(page, 500, 300, "Beta");

    const before = await page.evaluate(() => window.__kg.history.past.map((e) => ({ source: e.source, hasEvidence: e.evidenceIndex !== null })));

    // Undo all three, into history.future, then redo all three back.
    await page.click("#btn-undo");
    await page.click("#btn-undo");
    await page.click("#btn-undo");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 0);
    const futureAfterUndo = await page.evaluate(() => window.__kg.history.future.map((e) => ({ source: e.source, hasEvidence: e.evidenceIndex !== null })));
    // future is popped-and-pushed in undo order, i.e. reverse of past.
    assert.deepEqual(futureAfterUndo, [...before].reverse());

    await page.click("#btn-redo");
    await page.click("#btn-redo");
    await page.click("#btn-redo");
    const afterRedo = await page.evaluate(() => window.__kg.history.past.map((e) => ({ source: e.source, hasEvidence: e.evidenceIndex !== null })));
    assert.deepEqual(afterRedo, before, "source/evidence metadata must survive an undo+redo round trip unchanged");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 3);
  });
});

test("undoing back past an agent edit to a manual one, then making a new manual edit, discards the agent entry from the redo stack (mixed-type redo invalidation)", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await connectAgent(page);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: "classes:\n  Invoice:\n    meaning: A bill.\n" })]) }),
      () => ({ body: chatCompletionBody("done") }),
    ]);
    await sendChatMessage(page, "track invoices");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    await page.click("#btn-undo"); // undoes the agent edit
    assert.equal(await page.evaluate(() => window.__kg.history.future.length), 1);
    assert.equal(await page.evaluate(() => window.__kg.history.future[0].source), "agent-auto-edit");

    await addNodeViaDblClick(page, 500, 300, "Beta"); // a fresh manual edit
    assert.equal(await page.evaluate(() => window.__kg.history.future.length), 0, "a new edit after undo must discard the redo stack regardless of what kind of entry was sitting there");
  });
});
