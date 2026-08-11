import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL, withPage, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";

// Agent Ontology, Phase A (agent_ontology_todo.md): data-model additions only
// — meaning/aliases/properties on Node, meaning on Edge, and two new
// top-level collections (rules, actions). No UI yet (Phase B/C/D/E); these
// tests exercise the data layer directly via window.__kg, the same way the
// base app's own phase*.spec.mjs files test data-model shape before any UI
// exists for it.

// Mirrors phase5.spec.mjs's own local download-handling helpers — this file
// needs the same acceptDownloads: true page lifecycle for the JSON export
// test below, and follows that file's precedent of defining it locally
// rather than sharing it, since it's the only other spec file that needs it.
async function withDownloadPage(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, acceptDownloads: true });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  const downloads = [];
  page.on("download", (dl) => downloads.push(dl));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate(() => window.__kg.welcome.close()); // issue #78: this file has its own page-open helper, not tests/lib/page.mjs's withPage()
  try {
    await fn(page, downloads);
  } finally {
    await browser.close();
  }
  assert.deepEqual(consoleErrors, [], "expected no console/page errors during the test");
}

async function readDownload(dl) {
  const stream = await dl.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

test("createRule/createAction produce sequential ids and land in state.rules/state.actions", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => {
      const r1 = window.__kg.actions.createRule("canApproveInvoice", ["invoice status is matched", "supplier risk status is clear"]);
      const r2 = window.__kg.actions.createRule("canRejectInvoice", ["invoice status is disputed"]);
      const a1 = window.__kg.actions.createAction("approveInvoice", "n1", [r1.id], "invoice status becomes approved", "confirm the new invoice status");
      return { r1, r2, a1, rules: window.__kg.state.rules, actions: window.__kg.state.actions };
    });
    assert.equal(result.r1.id, "r1");
    assert.equal(result.r2.id, "r2");
    assert.equal(result.a1.id, "a1");
    assert.equal(result.rules.length, 2);
    assert.equal(result.actions.length, 1);
    assert.deepEqual(result.rules[0].conditions, ["invoice status is matched", "supplier risk status is clear"]);
    assert.equal(result.actions[0].inputClassId, "n1");
    assert.deepEqual(result.actions[0].preconditions, ["r1"]);
    assert.equal(result.actions[0].effect, "invoice status becomes approved");
    assert.equal(result.actions[0].verification, "confirm the new invoice status");
  });
});

test("deleteRule/deleteAction remove by id and leave everything else untouched", async () => {
  await withPage(async (page) => {
    const counts = await page.evaluate(() => {
      const r1 = window.__kg.actions.createRule("ruleA", ["x"]);
      const r2 = window.__kg.actions.createRule("ruleB", ["y"]);
      const a1 = window.__kg.actions.createAction("actA", "n1", [], "e", "v");
      window.__kg.actions.deleteRule(r1.id);
      return {
        ruleIds: window.__kg.state.rules.map((r) => r.id),
        actionIds: window.__kg.state.actions.map((a) => a.id),
        deletedRuleId: r1.id, survivingRuleId: r2.id, actionId: a1.id,
      };
    });
    assert.deepEqual(counts.ruleIds, [counts.survivingRuleId]);
    assert.ok(!counts.ruleIds.includes(counts.deletedRuleId));
    assert.deepEqual(counts.actionIds, [counts.actionId]);

    await page.evaluate((actionId) => window.__kg.actions.deleteAction(actionId), counts.actionId);
    const remaining = await page.evaluate(() => window.__kg.state.actions);
    assert.deepEqual(remaining, []);
  });
});

test("a node's meaning/aliases/properties and an edge's meaning survive a Tier 1 save/reload round-trip", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Invoice");
    await addNodeViaDblClick(page, 650, 250, "Supplier");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "issued by");

    await page.evaluate(() => {
      const invoice = window.__kg.state.nodes.find((n) => n.label === "Invoice");
      invoice.meaning = "A request from a supplier to receive payment.";
      invoice.aliases = ["bill"];
      invoice.properties = [
        { id: "p1", name: "amount", type: "number", unit: "EUR", allowed: null },
        { id: "p2", name: "status", type: "text", unit: null, allowed: ["draft", "matched", "approved"] },
      ];
      const edge = window.__kg.state.edges.find((e) => e.relation === "issued by");
      edge.meaning = "The supplier that submitted the invoice.";
      window.__kg.markDirty();
      window.__kg.storage.save();
    });
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 2);

    const invoice = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Invoice"));
    const edge = await page.evaluate(() => window.__kg.state.edges.find((e) => e.relation === "issued by"));
    assert.equal(invoice.meaning, "A request from a supplier to receive payment.");
    assert.deepEqual(invoice.aliases, ["bill"]);
    assert.deepEqual(invoice.properties, [
      { id: "p1", name: "amount", type: "number", unit: "EUR", allowed: null },
      { id: "p2", name: "status", type: "text", unit: null, allowed: ["draft", "matched", "approved"] },
    ]);
    assert.equal(edge.meaning, "The supplier that submitted the invoice.");
  });
});

test("rules and actions, and their id counters, survive a Tier 1 save/reload round-trip", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await page.evaluate(() => {
      const rule = window.__kg.actions.createRule("canApproveInvoice", ["invoice status is matched"]);
      window.__kg.actions.createAction("approveInvoice", window.__kg.state.nodes[0].id, [rule.id], "invoice status becomes approved", "confirm the new invoice status");
      window.__kg.storage.save(); // createRule/createAction don't self-schedule a save, same as createNode/createEdge — the caller's job (normally pushHistory())
    });
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 1);

    const { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.equal(rules.length, 1);
    assert.equal(rules[0].name, "canApproveInvoice");
    assert.equal(actions.length, 1);
    assert.equal(actions[0].name, "approveInvoice");
    assert.deepEqual(actions[0].preconditions, [rules[0].id]);

    // A rule/action created post-reload must not collide with a restored id
    // — the same invariant already proven for node/edge ids in phase4.spec.mjs.
    const newIds = await page.evaluate(() => {
      const r = window.__kg.actions.createRule("anotherRule", []);
      const a = window.__kg.actions.createAction("anotherAction", window.__kg.state.nodes[0].id, [], "", "");
      return { ruleId: r.id, actionId: a.id };
    });
    assert.notEqual(newIds.ruleId, rules[0].id);
    assert.notEqual(newIds.actionId, actions[0].id);
  });
});

test("a payload saved before Agent Ontology existed (no meaning/aliases/properties/rules/actions) loads cleanly with sensible defaults", async () => {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  // Seeds a pre-Phase-A-shaped payload before the app's own boot script
  // runs — same pattern phase4.spec.mjs uses for its corrupted-payload test.
  await page.addInitScript(() => {
    const legacyPayload = {
      nodes: [
        { id: "n1", label: "Old Node", type: "entity", x: 100, y: 100, w: 160, h: 60, groups: [] },
      ],
      edges: [],
      nextNodeNum: 2,
      nextEdgeNum: 1,
      graphName: "Legacy Graph",
      meta: null,
    };
    localStorage.setItem("kg-canvas-live", JSON.stringify(legacyPayload));
  });
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.waitForFunction(() => window.__kg.state.nodes.length === 1);

  const node = await page.evaluate(() => window.__kg.state.nodes[0]);
  assert.equal(node.label, "Old Node");
  assert.equal(node.meaning, null);
  assert.deepEqual(node.aliases, []);
  assert.deepEqual(node.properties, []);
  const { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
  assert.deepEqual(rules, []);
  assert.deepEqual(actions, []);

  // A node/rule/action created after loading a legacy payload must still
  // get a valid, non-colliding id.
  const freshIds = await page.evaluate(() => {
    const n = window.__kg.actions.createNode(400, 400, "New Node", "entity");
    const r = window.__kg.actions.createRule("newRule", []);
    return { nodeId: n.id, ruleId: r.id };
  });
  assert.equal(freshIds.nodeId, "n2");
  assert.equal(freshIds.ruleId, "r1");

  await browser.close();
  assert.deepEqual(consoleErrors, []);
});

test("the JSON export includes meaning/aliases/properties on nodes, meaning on edges, and populated rules/actions arrays", async () => {
  await withDownloadPage(async (page, downloads) => {
    await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
    await addNodeViaDblClick(page, 250, 250, "Invoice");
    await addNodeViaDblClick(page, 650, 250, "Supplier");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "issued by");
    await page.evaluate(() => {
      const invoice = window.__kg.state.nodes.find((n) => n.label === "Invoice");
      invoice.meaning = "A request from a supplier to receive payment.";
      invoice.aliases = ["bill"];
      invoice.properties = [{ id: "p1", name: "amount", type: "number", unit: "EUR", allowed: null }];
      const edge = window.__kg.state.edges.find((e) => e.relation === "issued by");
      edge.meaning = "The supplier that submitted the invoice.";
      const rule = window.__kg.actions.createRule("canApproveInvoice", ["invoice status is matched"]);
      window.__kg.actions.createAction("approveInvoice", invoice.id, [rule.id], "invoice status becomes approved", "confirm the new invoice status");
      window.__kg.markDirty();
    });

    await page.click("#btn-save-version");
    await page.waitForTimeout(200);

    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const parsed = JSON.parse(await readDownload(jsonDl));

    const invoice = parsed.nodes.find((n) => n.label === "Invoice");
    assert.equal(invoice.meaning, "A request from a supplier to receive payment.");
    assert.deepEqual(invoice.aliases, ["bill"]);
    assert.deepEqual(invoice.properties, [{ id: "p1", name: "amount", type: "number", unit: "EUR", allowed: null }]);

    const edge = parsed.edges.find((e) => e.relation === "issued by");
    assert.equal(edge.meaning, "The supplier that submitted the invoice.");

    assert.equal(parsed.rules.length, 1);
    assert.equal(parsed.rules[0].name, "canApproveInvoice");
    assert.deepEqual(parsed.rules[0].conditions, ["invoice status is matched"]);
    assert.equal(parsed.actions.length, 1);
    assert.equal(parsed.actions[0].name, "approveInvoice");
    assert.equal(parsed.actions[0].inputClassId, invoice.id);
    assert.deepEqual(parsed.actions[0].preconditions, [parsed.rules[0].id]);
  });
});

test("undo/redo restores rules with independently-cloned arrays — a later in-place mutation on live state can't leak into a stored snapshot", async () => {
  await withPage(async (page) => {
    // Mirrors phase3.spec.mjs's own hand-rolled history-entry pattern (see
    // its "long chain of 20 sequential adds" test): no UI creates rules yet
    // (Phase B/C/D/E), so this pushes a history entry by hand, matching
    // exactly what snapshotState()/pushHistory() do internally, to prove
    // restoreSnapshot() hands back independent clones — not aliased
    // references to whatever's live — via real undo()/redo() calls.
    const result = await page.evaluate(() => {
      const snap = () => ({
        nodes: window.__kg.state.nodes.map((n) => ({ ...n, aliases: [...n.aliases], properties: n.properties.map((p) => ({ ...p })) })),
        edges: window.__kg.state.edges.map((e) => ({ ...e })),
        rules: window.__kg.state.rules.map((r) => ({ ...r, conditions: [...r.conditions] })),
        actions: window.__kg.state.actions.map((a) => ({ ...a, preconditions: [...a.preconditions] })),
      });

      const before = snap();
      window.__kg.actions.createRule("canApproveInvoice", ["invoice status is matched"]);
      const after = snap();
      window.__kg.history.past.push({ before, after });
      window.__kg.history.future = [];

      // Mutate live state's rule conditions in place, after the snapshot.
      window.__kg.state.rules[0].conditions.push("mutated after the fact");
      const liveConditionsBeforeUndo = [...window.__kg.state.rules[0].conditions];

      window.__kg.actions.undo();
      const rulesAfterUndo = window.__kg.state.rules;

      window.__kg.actions.redo();
      const rulesAfterRedo = window.__kg.state.rules;

      return { liveConditionsBeforeUndo, rulesAfterUndo, rulesAfterRedo };
    });
    assert.deepEqual(result.liveConditionsBeforeUndo, ["invoice status is matched", "mutated after the fact"], "sanity: the in-place mutation actually happened on live state");
    assert.deepEqual(result.rulesAfterUndo, [], "undo restores the pre-creation snapshot, unaffected by the later in-place mutation on live state's array");
    assert.equal(result.rulesAfterRedo.length, 1);
    assert.deepEqual(result.rulesAfterRedo[0].conditions, ["invoice status is matched"], "redo restores the post-creation snapshot's own clone, not the mutated live array — proves restoreSnapshot() doesn't alias");
  });
});
