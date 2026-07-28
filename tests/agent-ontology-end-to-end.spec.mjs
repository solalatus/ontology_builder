import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";

// Agent Ontology, Phase I (agent_ontology_todo.md): a single, long, realistic
// authoring session exercising Phases A through H *together* — the same
// "one file, integration bugs only surface in combination" rationale
// tests/end-to-end-workflow.spec.mjs uses for the base app, but for the
// Agent Ontology layer specifically: classes with meaning/aliases/
// properties, a relationship with its own meaning, a rule and an action
// referencing each other, export (all three formats), undo/redo, Tier 1
// reload persistence of every new field at once, and a YAML re-import that
// exercises Phase G's aggressive-overwrite semantics against real drift.
// Every individual piece here is covered elsewhere in isolation; this file
// exists to catch what only shows up when they interact in one session.

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
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
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

async function nodeByLabel(page, label) {
  return page.evaluate((l) => window.__kg.state.nodes.find((n) => n.label === l), label);
}

async function openDetailsFor(page, screenX, screenY) {
  const box = await page.locator("#canvas").boundingBox();
  await page.mouse.click(box.x + screenX, box.y + screenY);
  await page.click("#sel-details");
  await page.waitForSelector("#details-overlay", { state: "visible" });
}

async function saveDetails(page) {
  await page.click("#details-save");
  await page.waitForSelector("#details-overlay", { state: "hidden" });
}

async function dropYaml(page, text, filename = "reimport.domain.yaml") {
  await page.evaluate(({ t, name }) => {
    const dt = new DataTransfer();
    const file = new File([t], name, { type: "text/yaml" });
    dt.items.add(file);
    const canvas = document.getElementById("canvas");
    canvas.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { t: text, name: filename });
  await page.waitForSelector("#import-overlay", { state: "visible" });
}

test("a realistic Agent Ontology authoring session — classes, a relationship, a rule and action, export, undo/redo, reload, and a YAML re-import — stays internally consistent throughout", async () => {
  await withDownloadPage(async (page, downloads) => {
    // --- Phase 1: two classes, each with meaning/aliases/properties ------
    await addNodeViaDblClick(page, 250, 250, "Invoice");
    await openDetailsFor(page, 250, 250);
    await page.locator("#details-meaning").fill("A request from a supplier to receive payment.");
    await page.click("#details-add-alias");
    await page.locator(".details-alias-input").fill("bill");
    await page.click("#details-add-property");
    await page.locator(".details-property-name").fill("amount");
    await page.locator(".details-property-type").selectOption("number");
    await page.locator(".details-property-unit").fill("EUR");
    await saveDetails(page);

    await addNodeViaDblClick(page, 650, 250, "Supplier");
    await openDetailsFor(page, 650, 250);
    await page.locator("#details-meaning").fill("An organization providing goods or services.");
    await page.click("#details-add-alias");
    await page.locator(".details-alias-input").fill("vendor");
    await saveDetails(page);

    let invoice = await nodeByLabel(page, "Invoice");
    let supplier = await nodeByLabel(page, "Supplier");
    assert.equal(invoice.meaning, "A request from a supplier to receive payment.");
    assert.deepEqual(supplier.aliases, ["vendor"]);

    // --- Phase 2: connect them, then set the relationship's own meaning --
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "issued by");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    const edgeIdBefore = await page.evaluate(() => window.__kg.state.edges[0].id);
    await page.evaluate((id) => { window.__kg.actions.selectEdge(id); window.__kg.render(); }, edgeIdBefore);
    await page.click("#sel-details");
    await page.waitForSelector("#details-overlay", { state: "visible" });
    await page.locator("#details-meaning").fill("The supplier that submitted the invoice.");
    await saveDetails(page);

    let edge = await page.evaluate(() => window.__kg.state.edges[0]);
    assert.equal(edge.meaning, "The supplier that submitted the invoice.");

    // --- Phase 3: a rule and an action referencing it + the Invoice class
    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    await page.click("#domain-model-add-rule");
    await page.locator(".dm-rule-name").last().fill("canApproveInvoice");
    await page.locator(".domain-model-rule-card .details-add-btn").last().click();
    await page.locator(".dm-rule-condition-input").last().fill("invoice status is matched");
    await page.click("#domain-model-add-action");
    await page.locator(".dm-action-name").fill("approveInvoice");
    await page.locator(".dm-action-input-class").selectOption({ label: "Invoice" });
    await page.locator(".dm-action-preconditions").selectOption({ label: "canApproveInvoice" });
    await page.locator(".dm-action-effect").fill("invoice status becomes approved");
    await page.locator(".dm-action-verification").fill("confirm the new invoice status");
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    const { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.equal(rules.length, 1);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].inputClassId, invoice.id);
    assert.deepEqual(actions[0].preconditions, [rules[0].id]);

    // --- Phase 4: Save Version — all three files, YAML content matches ---
    await page.click("#btn-save-version");
    await page.waitForTimeout(200);
    assert.equal(downloads.length, 3);

    const yamlDl = downloads.find((d) => d.suggestedFilename().endsWith(".domain.yaml"));
    const exportedYaml = await readDownload(yamlDl);
    assert.ok(exportedYaml.includes("Invoice:"));
    assert.ok(exportedYaml.includes("meaning: A request from a supplier to receive payment."));
    assert.ok(exportedYaml.includes("- bill"));
    assert.ok(exportedYaml.includes("amount:\n        type: number\n        unit: EUR"));
    assert.ok(exportedYaml.includes("- name: issuedBy"));
    assert.ok(exportedYaml.includes("meaning: The supplier that submitted the invoice."));
    assert.ok(exportedYaml.includes("canApproveInvoice:"));
    assert.ok(exportedYaml.includes("approveInvoice:"));
    assert.ok(exportedYaml.includes("input: Invoice"));

    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const parsedJson = JSON.parse(await readDownload(jsonDl));
    assert.equal(parsedJson.nodes.length, 2);
    assert.equal(parsedJson.rules.length, 1);
    assert.equal(parsedJson.actions.length, 1);

    // --- Phase 5: undo back through the domain-model save, then redo -----
    const snapshotAfterSave = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    await page.click("#btn-undo"); // undoes the domain-model Save (one step, per Phase D/E's own decision)
    assert.equal(await page.evaluate(() => window.__kg.state.rules.length), 0, "undo removes the rule/action as one step");
    assert.equal(await page.evaluate(() => window.__kg.state.actions.length), 0);

    await page.click("#btn-redo");
    const afterRedo = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.deepEqual(afterRedo, snapshotAfterSave, "redo lands back on the exact pre-undo rules/actions state");

    // --- Phase 6: reload — every new field, across every collection, must
    // survive Tier 1 persistence together, not just individually ----------
    await page.evaluate(() => window.__kg.storage.whenIdle());
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 2);
    await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });

    invoice = await nodeByLabel(page, "Invoice");
    supplier = await nodeByLabel(page, "Supplier");
    edge = await page.evaluate(() => window.__kg.state.edges[0]);
    const reloadedRulesActions = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.equal(invoice.meaning, "A request from a supplier to receive payment.");
    assert.deepEqual(invoice.aliases, ["bill"]);
    assert.equal(invoice.properties[0].unit, "EUR");
    assert.deepEqual(supplier.aliases, ["vendor"]);
    assert.equal(edge.meaning, "The supplier that submitted the invoice.");
    assert.equal(reloadedRulesActions.rules.length, 1);
    assert.equal(reloadedRulesActions.actions.length, 1);
    assert.equal(reloadedRulesActions.actions[0].inputClassId, invoice.id, "the reloaded action's class reference still resolves to the reloaded Invoice node's id");

    // --- Phase 7: simulate drift, then re-import the earlier export to
    // aggressively restore it (Phase G semantics) --------------------------
    await openDetailsFor(page, 250, 250); // Invoice is still at its original placement post-reload
    await page.locator("#details-meaning").fill("DRIFTED — someone edited this by hand.");
    await saveDetails(page);
    assert.equal((await nodeByLabel(page, "Invoice")).meaning, "DRIFTED — someone edited this by hand.");

    await dropYaml(page, exportedYaml);
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const restoredInvoice = await nodeByLabel(page, "Invoice");
    assert.equal(restoredInvoice.meaning, "A request from a supplier to receive payment.", "the re-import overwrote the drifted meaning back to the exported value");
    const nodesAfterReimport = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodesAfterReimport.length, 2, "re-importing matched classes, no duplicates");
    const edgesAfterReimport = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edgesAfterReimport.length, 1, "the relationship matched too, no duplicate edge");
    const rulesActionsAfterReimport = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.equal(rulesActionsAfterReimport.rules.length, 1);
    assert.equal(rulesActionsAfterReimport.actions.length, 1);

    // --- Phase 8: Clear, then Undo restores the fully-reconciled graph ---
    await page.click("#btn-clear");
    await page.click("#confirm-ok");
    await page.waitForTimeout(50);
    assert.equal((await page.evaluate(() => window.__kg.state.nodes)).length, 0);

    await page.click("#btn-undo");
    const finalNodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(finalNodes.length, 2, "undo restores the full graph exactly as it was right before Clear");
    const finalInvoice = finalNodes.find((n) => n.label === "Invoice");
    assert.equal(finalInvoice.meaning, "A request from a supplier to receive payment.");
    assert.equal((await page.evaluate(() => window.__kg.state.rules)).length, 1);
    assert.equal((await page.evaluate(() => window.__kg.state.actions)).length, 1);
  });
});

// Everything above uses exactly one rule and one action, the minimal shape
// needed to prove a reference resolves at all. A real domain model reads
// more like a workflow: several stages, each gated by its own rule, with a
// later stage's action sometimes depending on more than one precondition
// at once (not just "the one rule right before it"). This test builds that
// shape through the real Domain Model UI — a 4-stage invoice approval
// chain — and checks the chain survives Save, mid-chain deletion, export,
// and undo/redo intact.
test("a longer, realistic chain of rules and actions (a 4-stage invoice workflow) resolves correctly end to end, including a multi-precondition action and mid-chain rule deletion", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });

    async function addRule(name, conditions) {
      await page.click("#domain-model-add-rule");
      await page.locator(".dm-rule-name").last().fill(name);
      for (const cond of conditions) {
        await page.locator(".domain-model-rule-card").last().locator(".details-add-btn").click();
        await page.locator(".dm-rule-condition-input").last().fill(cond);
      }
    }
    async function addAction(name, preconditionNames, effect, verification) {
      await page.click("#domain-model-add-action");
      const card = page.locator(".domain-model-action-card").last();
      await card.locator(".dm-action-name").fill(name);
      await card.locator(".dm-action-input-class").selectOption({ label: "Invoice" });
      await card.locator(".dm-action-preconditions").selectOption(preconditionNames.map((label) => ({ label })));
      await card.locator(".dm-action-effect").fill(effect);
      await card.locator(".dm-action-verification").fill(verification);
    }

    // Stage 1: submit
    await addRule("invoiceReceived", ["invoice has arrived", "invoice has a valid PO reference"]);
    await addAction("submitInvoice", ["invoiceReceived"],
      "invoice status becomes submitted", "check invoice status is submitted");
    // Stage 2: match
    await addRule("invoiceMatched", ["invoice amount matches PO amount", "invoice status is submitted"]);
    await addAction("matchInvoice", ["invoiceMatched"],
      "invoice status becomes matched", "check invoice status is matched");
    // Stage 3: approve — gated on *two* preconditions at once, a genuine
    // longer-chain reference pattern the single-rule tests elsewhere never
    // exercise.
    await addRule("supplierRiskClear", ["supplier risk status is clear"]);
    await addAction("approveInvoice", ["invoiceMatched", "supplierRiskClear"],
      "invoice status becomes approved", "check invoice status is approved");
    // Stage 4: pay
    await addRule("invoiceApproved", ["invoice status is approved"]);
    await addAction("payInvoice", ["invoiceApproved"],
      "invoice status becomes paid", "check payment confirmation");

    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    let { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.equal(rules.length, 4);
    assert.equal(actions.length, 4);
    const byName = (list, name) => list.find((x) => x.name === name);
    const approveAction = byName(actions, "approveInvoice");
    const matchedRule = byName(rules, "invoiceMatched");
    const riskRule = byName(rules, "supplierRiskClear");
    assert.equal(approveAction.preconditions.length, 2, "the approve stage really did keep both preconditions");
    assert.deepEqual(new Set(approveAction.preconditions), new Set([matchedRule.id, riskRule.id]));
    assert.equal(byName(actions, "payInvoice").inputClassId, (await nodeByLabel(page, "Invoice")).id);

    // Save Version — the exported YAML should read as one coherent chain,
    // not four disconnected fragments.
    await page.click("#btn-save-version");
    await page.waitForTimeout(200);
    const yamlDl = downloads.find((d) => d.suggestedFilename().endsWith(".domain.yaml"));
    const yaml = await readDownload(yamlDl);
    for (const name of ["invoiceReceived", "invoiceMatched", "supplierRiskClear", "invoiceApproved"]) {
      assert.ok(yaml.includes(`${name}:`), `expected rule ${name} in the export`);
    }
    for (const name of ["submitInvoice", "matchInvoice", "approveInvoice", "payInvoice"]) {
      assert.ok(yaml.includes(`${name}:`), `expected action ${name} in the export`);
    }
    assert.ok(yaml.includes("preconditions:\n      - invoiceMatched\n      - supplierRiskClear")
      || yaml.includes("preconditions:\n      - supplierRiskClear\n      - invoiceMatched"),
      "approveInvoice's two preconditions both made it into the export, in some order");

    // Mid-chain deletion, through the real dialog UI (not a data-layer
    // bypass) so the removal is a normal, undoable edit: removing
    // "invoiceMatched" (stage 2's rule) must cleanly drop it from *both*
    // places that reference it — matchInvoice's own (now-empty) precondition
    // list and approveInvoice's two-item one — without disturbing the rest
    // of the chain.
    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    let matchedRuleCard = null;
    for (const card of await page.locator(".domain-model-rule-card").all()) {
      if ((await card.locator(".dm-rule-name").inputValue()) === "invoiceMatched") { matchedRuleCard = card; break; }
    }
    assert.ok(matchedRuleCard, "sanity check: found invoiceMatched's card");
    await matchedRuleCard.locator(".details-row-remove").first().click();
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    ({ rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions })));
    assert.equal(rules.length, 3, "invoiceMatched is gone, the other three stages' rules remain");
    assert.deepEqual(byName(actions, "matchInvoice").preconditions, [], "matchInvoice's dangling precondition was scrubbed");
    assert.deepEqual(byName(actions, "approveInvoice").preconditions, [riskRule.id], "approveInvoice keeps its still-valid precondition, drops only the deleted one");
    assert.equal(actions.length, 4, "no action itself was deleted — only the dangling reference");

    // Undo restores the whole chain, including the deleted rule and both
    // dangling-reference cleanups, as one step (the dialog's Save is always
    // exactly one undo entry, regardless of how much changed inside it).
    await page.click("#btn-undo");
    ({ rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions })));
    assert.equal(rules.length, 4, "undo brings invoiceMatched back");
    assert.equal(byName(actions, "approveInvoice").preconditions.length, 2, "and restores both of approveInvoice's preconditions");
  });
});
