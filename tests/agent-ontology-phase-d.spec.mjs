import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// Agent Ontology, Phase D/E (agent_ontology_todo.md): the Rules/Actions
// manager — one shared "Domain Model" modal (the only new top-level toolbar
// button this whole feature adds), draft-then-commit on Save, same
// philosophy as the Phase B/C details dialog.

async function openDomainModel(page) {
  await page.click("#btn-domain-model");
  await page.waitForSelector("#domain-model-overlay", { state: "visible" });
}

async function addRuleWithCondition(page, name, condition) {
  await page.click("#domain-model-add-rule");
  await page.locator(".dm-rule-name").last().fill(name);
  await page.locator(".domain-model-rule-card .details-add-btn").last().click();
  await page.locator(".dm-rule-condition-input").last().fill(condition);
}

test("adding a rule with conditions and saving persists it with a real, sequential id", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    await addRuleWithCondition(page, "canApproveInvoice", "invoice status is matched");
    await page.locator(".domain-model-rule-card .details-add-btn").click(); // second condition
    await page.locator(".dm-rule-condition-input").last().fill("supplier risk status is clear");
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    const rules = await page.evaluate(() => window.__kg.state.rules);
    assert.equal(rules.length, 1);
    assert.equal(rules[0].id, "r1");
    assert.equal(rules[0].name, "canApproveInvoice");
    assert.deepEqual(rules[0].conditions, ["invoice status is matched", "supplier risk status is clear"]);
  });
});

test("adding an action referencing a class and a same-session rule persists correctly, resolving the draft precondition id to the rule's real id", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await openDomainModel(page);
    await addRuleWithCondition(page, "canApproveInvoice", "invoice status is matched");
    await page.click("#domain-model-add-action");
    await page.locator(".dm-action-name").fill("approveInvoice");
    await page.locator(".dm-action-input-class").selectOption({ label: "Invoice" });
    await page.locator(".dm-action-preconditions").selectOption({ label: "canApproveInvoice" });
    await page.locator(".dm-action-effect").fill("invoice status becomes approved");
    await page.locator(".dm-action-verification").fill("confirm the new invoice status");
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    const { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.equal(actions.length, 1);
    assert.equal(actions[0].name, "approveInvoice");
    assert.equal(actions[0].inputClassId, "n1");
    assert.deepEqual(actions[0].preconditions, [rules[0].id], "the action's precondition resolves to the rule's real (not draft) id");
    assert.equal(actions[0].effect, "invoice status becomes approved");
    assert.equal(actions[0].verification, "confirm the new invoice status");
  });
});

test("opening the dialog pre-fills existing rules/actions, including a pre-selected precondition", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await page.evaluate(() => {
      const rule = window.__kg.actions.createRule("canApproveInvoice", ["invoice status is matched"]);
      window.__kg.actions.createAction("approveInvoice", window.__kg.state.nodes[0].id, [rule.id], "invoice status becomes approved", "confirm the new invoice status");
    });
    await openDomainModel(page);

    assert.equal(await page.locator(".dm-rule-name").inputValue(), "canApproveInvoice");
    assert.equal(await page.locator(".dm-rule-condition-input").inputValue(), "invoice status is matched");
    assert.equal(await page.locator(".dm-action-name").inputValue(), "approveInvoice");
    assert.equal(await page.locator(".dm-action-input-class").inputValue(), "n1");
    const selected = await page.locator(".dm-action-preconditions").evaluate((el) => [...el.selectedOptions].map((o) => o.textContent));
    assert.deepEqual(selected, ["canApproveInvoice"]);
    assert.equal(await page.locator(".dm-action-effect").inputValue(), "invoice status becomes approved");
    assert.equal(await page.locator(".dm-action-verification").inputValue(), "confirm the new invoice status");
  });
});

test("editing and saving commits as a single undo step, and undo fully reverts it", async () => {
  await withPage(async (page) => {
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    await openDomainModel(page);
    await addRuleWithCondition(page, "ruleA", "condition A");
    await page.click("#domain-model-add-action");
    await page.locator(".dm-action-name").fill("actionA");
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfter, historyBefore + 1, "adding a rule and an action together commits as exactly one undo step");

    await page.evaluate(() => window.__kg.actions.undo());
    const { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.deepEqual(rules, []);
    assert.deepEqual(actions, []);
  });
});

test("clicking Cancel discards all edits made since opening, pushing no undo step", async () => {
  await withPage(async (page) => {
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    await openDomainModel(page);
    await addRuleWithCondition(page, "shouldNotPersist", "x");
    await page.click("#domain-model-cancel");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    assert.deepEqual(await page.evaluate(() => window.__kg.state.rules), []);
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), historyBefore);
  });
});

test("pressing Escape closes the dialog without saving", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    await addRuleWithCondition(page, "shouldNotPersist", "x");
    await page.keyboard.press("Escape");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    assert.deepEqual(await page.evaluate(() => window.__kg.state.rules), []);
  });
});

test("a rule left without a name isn't saved, and an action referencing it drops the dangling precondition", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    await page.click("#domain-model-add-rule"); // left nameless
    await page.click("#domain-model-add-action");
    await page.locator(".dm-action-name").fill("actionA");
    await page.locator(".dm-action-preconditions").selectOption({ index: 0 }); // selects the nameless draft rule's option
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    const { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.deepEqual(rules, []);
    assert.equal(actions.length, 1);
    assert.deepEqual(actions[0].preconditions, [], "a precondition pointing at a never-named (never-saved) rule is dropped, not left dangling");
  });
});

test("removing a rule row before saving also removes it from any action's precondition selection", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    await addRuleWithCondition(page, "ruleA", "x");
    await page.click("#domain-model-add-action");
    await page.locator(".dm-action-name").fill("actionA");
    await page.locator(".dm-action-preconditions").selectOption({ label: "ruleA" });
    assert.equal(await page.locator(".dm-action-preconditions option").count(), 1);

    await page.locator(".domain-model-rule-card .details-row-remove").first().click();
    assert.equal(await page.locator(".dm-action-preconditions option").count(), 0, "the removed rule's option must disappear from the live preconditions select too");

    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    const { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.deepEqual(rules, []);
    assert.deepEqual(actions[0].preconditions, []);
  });
});

test("deleting a rule (via the data-layer action, outside the dialog) drops it from any action's preconditions", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    const result = await page.evaluate(() => {
      const rule = window.__kg.actions.createRule("canApproveInvoice", ["x"]);
      const action = window.__kg.actions.createAction("approveInvoice", window.__kg.state.nodes[0].id, [rule.id], "e", "v");
      window.__kg.actions.deleteRule(rule.id);
      return { actionPreconditions: window.__kg.state.actions.find((a) => a.id === action.id).preconditions };
    });
    assert.deepEqual(result.actionPreconditions, []);
  });
});

test("deleting a node that's referenced as an action's input class nulls the reference instead of deleting the action", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    const result = await page.evaluate(() => {
      const node = window.__kg.state.nodes[0];
      const action = window.__kg.actions.createAction("approveInvoice", node.id, [], "e", "v");
      window.__kg.actions.deleteNode(node.id);
      return { action: window.__kg.state.actions.find((a) => a.id === action.id) };
    });
    assert.ok(result.action, "the action itself must survive the node's deletion");
    assert.equal(result.action.inputClassId, null);
  });
});

test("the input-class dropdown reflects current canvas nodes, and 'no class' remains selectable", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await addNodeViaDblClick(page, 700, 300, "Supplier");
    await openDomainModel(page);
    await page.click("#domain-model-add-action");
    const options = await page.locator(".dm-action-input-class option").allTextContents();
    assert.deepEqual(options.slice(1), ["Invoice", "Supplier"]);
    assert.equal(await page.locator(".dm-action-input-class").inputValue(), "", "no class selected by default");
  });
});

test("a no-op save (dialog opened and immediately saved, nothing edited) pushes no undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await page.evaluate(() => window.__kg.actions.createRule("existingRule", ["x"]));
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    await openDomainModel(page);
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), historyBefore);
  });
});

test("toggling language updates the Domain Model dialog's static labels/title", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    assert.equal(await page.locator("#domain-model-rules-label").textContent(), "Rules");
    await page.evaluate(() => window.__kg.lang.toggle());
    assert.equal(await page.locator("#domain-model-rules-label").textContent(), "Szabályok");
    assert.equal(await page.locator("#domain-model-title").textContent(), "Doménmodell");
  });
});
