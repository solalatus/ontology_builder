import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// Follow-up to the Agent Ontology Rules/Actions manager (agent_ontology_spec.md
// §7, covered in isolation by tests/agent-ontology-phase-d.spec.mjs): loading
// a real, larger domain model (50 classes, 19 rules, 10 actions) into the
// Domain Model dialog surfaced several usability problems at that scale --
// covered individually elsewhere in that file's updated assertions, this
// file covers the *scale-specific* behavior those individual-field tests
// don't: reachability of Save/Cancel on a long list, the checkbox-list
// preconditions picker's basic shape, live section counts, and the new
// per-section name filter -- using synthetic rules/actions built through the
// real UI, not any external ontology.

async function openDomainModel(page) {
  await page.click("#btn-domain-model");
  await page.waitForSelector("#domain-model-overlay", { state: "visible" });
}

async function checkPrecondition(container, ruleName) {
  await container.locator(".dm-precondition-option")
    .filter({ hasText: new RegExp(`^${ruleName}$`) })
    .locator(".dm-precondition-checkbox")
    .check();
}

async function addRuleWithCondition(page, name, condition) {
  await page.click("#domain-model-add-rule");
  await page.locator(".dm-rule-name").last().fill(name);
  await page.locator(".domain-model-rule-card .details-add-btn").last().click();
  await page.locator(".dm-rule-condition-input").last().fill(condition);
}

test("Save/Cancel stay visible inside the dialog's own bounds regardless of how long the rule/action list scrolls", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    for (let i = 0; i < 15; i++) {
      await addRuleWithCondition(page, `rule${i}`, `condition text for rule ${i}`);
    }

    // Scroll the body most of the way down -- the footer must stay pinned
    // at the dialog's own bottom edge the whole time, not travel with the
    // scrolled content the way it did when Save/Cancel were just the last
    // two elements in one long scrolling column.
    await page.evaluate(() => {
      const body = document.querySelector("#domain-model-dialog .details-dialog-body");
      body.scrollTop = body.scrollHeight; // scroll all the way down
    });

    const { dialogBottom, footerBottom, saveVisible } = await page.evaluate(() => {
      const dialog = document.getElementById("domain-model-dialog");
      const footer = dialog.querySelector(".details-dialog-footer");
      const save = document.getElementById("domain-model-save");
      const dRect = dialog.getBoundingClientRect();
      const fRect = footer.getBoundingClientRect();
      const sRect = save.getBoundingClientRect();
      return {
        dialogBottom: dRect.bottom,
        footerBottom: fRect.bottom,
        saveVisible: sRect.top >= dRect.top && sRect.bottom <= dRect.bottom + 1,
      };
    });
    assert.ok(Math.abs(dialogBottom - footerBottom) < 2, "the footer's bottom edge should sit right at the dialog's own bottom edge");
    assert.ok(saveVisible, "the Save button should be fully within the dialog's bounds, not scrolled out of view");

    // And it must actually still be clickable/functional from there.
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__kg.state.rules.length), 15);
  });
});

test("the class Details dialog's footer is fixed the same way, for a class with enough properties to overflow it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.click("#sel-details");
    await page.waitForSelector("#details-overlay", { state: "visible" });

    for (let i = 0; i < 10; i++) {
      await page.click("#details-add-property");
      await page.locator(".details-property-name").last().fill(`prop${i}`);
    }

    await page.evaluate(() => {
      const body = document.querySelector("#details-dialog .details-dialog-body");
      body.scrollTop = body.scrollHeight;
    });
    const { dialogBottom, footerBottom } = await page.evaluate(() => {
      const dialog = document.getElementById("details-dialog");
      const footer = dialog.querySelector(".details-dialog-footer");
      return { dialogBottom: dialog.getBoundingClientRect().bottom, footerBottom: footer.getBoundingClientRect().bottom };
    });
    assert.ok(Math.abs(dialogBottom - footerBottom) < 2, "the Details dialog's footer should also stay pinned to its own bottom edge");

    await page.click("#details-save");
    await page.waitForSelector("#details-overlay", { state: "hidden" });
  });
});

test("rule conditions and action effect/verification are multi-line textareas that preserve long text exactly", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    const longCondition = "This is a deliberately long, multi-clause condition sentence written the way a real domain expert would phrase a rule, long enough that it would have overflowed a single-line input field and been impossible to read without scrolling the text cursor through it.";
    await addRuleWithCondition(page, "longConditionRule", longCondition);
    await page.click("#domain-model-add-action");
    const longEffect = "A similarly long, free-text effect sentence describing exactly what changes in the world once this action has been carried out successfully by the agent.";
    const longVerification = "And an equally long verification sentence describing precisely how a human reviewer would confirm the effect actually took place as described above.";
    await page.locator(".dm-action-name").fill("longTextAction");
    await page.locator(".dm-action-effect").fill(longEffect);
    await page.locator(".dm-action-verification").fill(longVerification);

    const tagNames = await page.evaluate(() => ({
      condition: document.querySelector(".dm-rule-condition-input").tagName,
      effect: document.querySelector(".dm-action-effect").tagName,
      verification: document.querySelector(".dm-action-verification").tagName,
    }));
    assert.deepEqual(tagNames, { condition: "TEXTAREA", effect: "TEXTAREA", verification: "TEXTAREA" });

    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    const { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    assert.equal(rules[0].conditions[0], longCondition, "the full long condition text survives the textarea round-trip exactly, untruncated");
    assert.equal(actions[0].effect, longEffect);
    assert.equal(actions[0].verification, longVerification);
  });
});

test("preconditions are a checkbox list — no native <select> involved, and each rule can be checked/unchecked independently with a plain click", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    await addRuleWithCondition(page, "ruleA", "a");
    await addRuleWithCondition(page, "ruleB", "b");
    await addRuleWithCondition(page, "ruleC", "c");
    await page.click("#domain-model-add-action");
    await page.locator(".dm-action-name").fill("actionA");

    const hasSelect = await page.evaluate(() => Boolean(document.querySelector(".dm-action-preconditions select")));
    assert.equal(hasSelect, false, "no native <select> should remain in the preconditions picker");

    const preconditions = page.locator(".dm-action-preconditions");
    const checkboxFor = (name) => preconditions.locator(".dm-precondition-option")
      .filter({ hasText: new RegExp(`^${name}$`) }).locator(".dm-precondition-checkbox");

    // Plain clicks, no modifier key held -- the whole point of the change.
    await checkboxFor("ruleA").check();
    await checkboxFor("ruleC").check();
    assert.deepEqual(
      await preconditions.evaluate((el) => [...el.querySelectorAll(".dm-precondition-checkbox")].map((cb) => cb.checked)),
      [true, false, true],
    );

    // Unchecking one leaves the other checked, independently.
    await checkboxFor("ruleA").uncheck();
    assert.deepEqual(
      await preconditions.evaluate((el) => [...el.querySelectorAll(".dm-precondition-checkbox")].map((cb) => cb.checked)),
      [false, false, true],
    );

    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    const { rules, actions } = await page.evaluate(() => ({ rules: window.__kg.state.rules, actions: window.__kg.state.actions }));
    const ruleC = rules.find((r) => r.name === "ruleC");
    assert.deepEqual(actions[0].preconditions, [ruleC.id]);
  });
});

test("the preconditions list shows a placeholder instead of an empty box when there are no rules yet", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    await page.click("#domain-model-add-action"); // no rules exist at all
    const text = await page.locator(".dm-action-preconditions").textContent();
    assert.ok(text.trim().length > 0, "an empty preconditions list should say something, not render as a blank box");
    assert.equal(await page.locator(".dm-precondition-checkbox").count(), 0);
  });
});

test("Rules/Actions section labels show a live count that updates as cards are added and removed", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    assert.equal(await page.locator("#domain-model-rules-label").textContent(), "Rules (0)");
    assert.equal(await page.locator("#domain-model-actions-label").textContent(), "Actions (0)");

    await addRuleWithCondition(page, "ruleA", "a");
    await addRuleWithCondition(page, "ruleB", "b");
    assert.equal(await page.locator("#domain-model-rules-label").textContent(), "Rules (2)");

    await page.click("#domain-model-add-action");
    assert.equal(await page.locator("#domain-model-actions-label").textContent(), "Actions (1)");

    await page.locator(".domain-model-rule-card .details-row-remove").first().click();
    assert.equal(await page.locator("#domain-model-rules-label").textContent(), "Rules (1)", "removing a rule card updates the count immediately, before Save");
  });
});

test("filtering rules by name hides non-matching cards but a hidden card is still saved, not silently dropped", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    await addRuleWithCondition(page, "invoiceApproved", "x");
    await addRuleWithCondition(page, "invoiceRejected", "y");
    await addRuleWithCondition(page, "supplierVerified", "z");

    await page.locator("#domain-model-rules-filter").fill("invoice");
    const visibleNames = async () => {
      const cards = page.locator(".domain-model-rule-card");
      const names = [];
      for (const card of await cards.all()) {
        if (await card.isVisible()) names.push(await card.locator(".dm-rule-name").inputValue());
      }
      return names;
    };
    assert.deepEqual((await visibleNames()).sort(), ["invoiceApproved", "invoiceRejected"], "only name-matching cards stay visible");
    // The count in the section label reflects the total, not just what the filter currently shows.
    assert.equal(await page.locator("#domain-model-rules-label").textContent(), "Rules (3)");

    // Save while still filtered — the hidden "supplierVerified" card must
    // not be excluded just because it wasn't visible at Save time; the
    // filter is a view, not an edit.
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    const ruleNames = (await page.evaluate(() => window.__kg.state.rules)).map((r) => r.name).sort();
    assert.deepEqual(ruleNames, ["invoiceApproved", "invoiceRejected", "supplierVerified"]);
  });
});

test("clearing the filter restores every card, and reopening the dialog starts unfiltered", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    await addRuleWithCondition(page, "ruleA", "a");
    await addRuleWithCondition(page, "ruleB", "b");

    await page.locator("#domain-model-rules-filter").fill("ruleA");
    assert.equal(await page.locator(".domain-model-rule-card:visible").count(), 1);

    await page.locator("#domain-model-rules-filter").fill("");
    assert.equal(await page.locator(".domain-model-rule-card:visible").count(), 2, "clearing the filter shows every card again");

    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    await openDomainModel(page);
    assert.equal(await page.locator("#domain-model-rules-filter").inputValue(), "", "reopening the dialog doesn't carry over a stale filter from the previous session");
    assert.equal(await page.locator(".domain-model-rule-card:visible").count(), 2);
  });
});

test("the dialog holds up at the real scale that motivated this rework: 50 classes, 19 rules, 10 actions", async () => {
  // b886500's own commit message cites this exact shape (a real user's
  // domain model) as what surfaced the original overflow/truncation/select
  // problems this whole file otherwise covers piecemeal (15 rules here, 10
  // properties in the Details-dialog test) -- nothing previously exercised
  // the combined scale itself. Classes are seeded directly (state, not the
  // UI) since node creation isn't what this dialog is testing; rules and
  // actions go through the real UI, matching every other test in this file.
  await withPage(async (page) => {
    await page.evaluate(() => {
      for (let i = 0; i < 50; i++) window.__kg.actions.createNode((i % 10) * 180, Math.floor(i / 10) * 100, `Class${i}`);
    });

    await openDomainModel(page);
    for (let i = 0; i < 19; i++) {
      await addRuleWithCondition(page, `rule${i}`, `condition text for rule ${i}`);
    }
    for (let i = 0; i < 10; i++) {
      await page.click("#domain-model-add-action");
      const card = page.locator(".domain-model-action-card").last();
      await card.locator(".dm-action-name").fill(`action${i}`);
      await card.locator(".dm-action-input-class").selectOption({ label: `Class${i}` });
      await checkPrecondition(card.locator(".dm-action-preconditions"), "rule0");
      await card.locator(".dm-action-effect").fill(`effect text for action ${i}`);
      await card.locator(".dm-action-verification").fill(`verification text for action ${i}`);
    }

    assert.equal(await page.locator("#domain-model-rules-label").textContent(), "Rules (19)");
    assert.equal(await page.locator("#domain-model-actions-label").textContent(), "Actions (10)");

    // Footer must still be reachable at this scale, exactly the guarantee
    // the first test in this file already pins for the 15-rule case.
    await page.evaluate(() => {
      const body = document.querySelector("#domain-model-dialog .details-dialog-body");
      body.scrollTop = body.scrollHeight;
    });
    const saveVisible = await page.evaluate(() => {
      const dialog = document.getElementById("domain-model-dialog");
      const sRect = document.getElementById("domain-model-save").getBoundingClientRect();
      const dRect = dialog.getBoundingClientRect();
      return sRect.top >= dRect.top && sRect.bottom <= dRect.bottom + 1;
    });
    assert.ok(saveVisible, "Save must stay reachable even scrolled to the bottom of 19 rules + 10 actions");

    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__kg.state.rules.length), 19);
    assert.equal(await page.evaluate(() => window.__kg.state.actions.length), 10);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 50);

    // Reopening must reflect exactly what was saved, not a truncated or
    // duplicated subset.
    await openDomainModel(page);
    assert.equal(await page.locator(".domain-model-rule-card").count(), 19);
    assert.equal(await page.locator(".domain-model-action-card").count(), 10);
  });
});

test("the class Details dialog holds up with 50 classes worth of siblings on the canvas", async () => {
  // Confirms the Details dialog itself (not just Domain Model) stays
  // functional at the same real-world class count, complementing this
  // file's existing 10-property Details-dialog test with the "many
  // classes exist" half of the original bug report rather than "one class
  // has many properties".
  await withPage(async (page) => {
    await page.evaluate(() => {
      for (let i = 0; i < 50; i++) window.__kg.actions.createNode((i % 10) * 180, Math.floor(i / 10) * 100, `Class${i}`);
    });
    const targetId = await page.evaluate(() => window.__kg.state.nodes[25].id);
    await page.evaluate((id) => window.__kg.actions.selectNode(id), targetId);
    await page.click("#sel-details");
    await page.waitForSelector("#details-overlay", { state: "visible" });

    await page.locator("#details-meaning").fill("Meaning at scale.");
    await page.click("#details-save");
    await page.waitForSelector("#details-overlay", { state: "hidden" });

    const meaning = await page.evaluate((id) => window.__kg.state.nodes.find((n) => n.id === id).meaning, targetId);
    assert.equal(meaning, "Meaning at scale.");
  });
});
