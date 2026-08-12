import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// isAnyModalOpen() (index.html) exists because nothing traps focus inside an
// open modal, so Tab (or a direct click on an unrelated toolbar button) can
// reach a second dialog's open button while a first one is still showing --
// see agent-ontology-phase-d.spec.mjs's own Details-vs-Domain-Model test for
// the original case this guards against. Consistency, Review Changes, and
// Agent Connect were added after that guard was written and were never
// added to its checklist, so any of the three could stack on top of an
// already-open dialog (and, since they weren't checked by OTHER dialogs
// either, other dialogs could stack on top of them). This file pins both
// directions for all three.

async function openDetails(page) {
  await addNodeViaDblClick(page, 300, 300, "Invoice");
  const box = await page.locator("#canvas").boundingBox();
  await page.mouse.click(box.x + 300, box.y + 300); // select the node
  await page.click("#sel-details");
  await page.waitForSelector("#details-overlay", { state: "visible" });
}

async function overlayDisplay(page, id) {
  // getComputedStyle, not .style.display: an overlay that was never opened
  // has no inline style at all (it's hidden by the .modal-overlay CSS
  // class's own display:none), so .style.display would read "" rather than
  // "none" for it.
  return page.evaluate((id) => getComputedStyle(document.getElementById(id)).display, id);
}

test("opening Consistency while Details is already open is a no-op, not a stacked second modal", async () => {
  await withPage(async (page) => {
    await openDetails(page);
    await page.evaluate(() => document.getElementById("btn-consistency").click());
    assert.equal(await overlayDisplay(page, "consistency-overlay"), "none",
      "Consistency must not open while Details is already open");
    assert.equal(await overlayDisplay(page, "details-overlay"), "flex",
      "the already-open Details dialog must stay open, undisturbed");
  });
});

test("opening Review Changes while Details is already open is a no-op, not a stacked second modal", async () => {
  await withPage(async (page) => {
    await openDetails(page); // also leaves one undo-step behind, enabling the button
    await page.evaluate(() => document.getElementById("btn-review-changes").click());
    assert.equal(await overlayDisplay(page, "review-changes-overlay"), "none",
      "Review Changes must not open while Details is already open");
    assert.equal(await overlayDisplay(page, "details-overlay"), "flex",
      "the already-open Details dialog must stay open, undisturbed");
  });
});

test("opening Agent Connect while Details is already open is a no-op, not a stacked second modal", async () => {
  await withPage(async (page) => {
    await openDetails(page);
    await page.evaluate(() => document.getElementById("agent-connect-open").click());
    assert.equal(await overlayDisplay(page, "agent-connect-overlay"), "none",
      "Agent Connect must not open while Details is already open");
    assert.equal(await overlayDisplay(page, "details-overlay"), "flex",
      "the already-open Details dialog must stay open, undisturbed");
  });
});

test("opening Domain Model while Consistency is already open is a no-op, not a stacked second modal", async () => {
  await withPage(async (page) => {
    await page.click("#btn-consistency");
    await page.waitForSelector("#consistency-overlay", { state: "visible" });
    await page.evaluate(() => document.getElementById("btn-domain-model").click());
    assert.equal(await overlayDisplay(page, "domain-model-overlay"), "none",
      "Domain Model must not open while Consistency is already open");
    assert.equal(await overlayDisplay(page, "consistency-overlay"), "flex",
      "the already-open Consistency dialog must stay open, undisturbed");
  });
});
