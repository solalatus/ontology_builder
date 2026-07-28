import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";

// Agent Ontology, Phase B (agent_ontology_todo.md): the Class/Relationship
// details editor — a new 4th icon in #sel-toolbar opening #details-overlay,
// with aliases/properties sections shown for nodes and hidden for edges.

async function selectNodeOnCanvas(page, sx, sy) {
  const box = await page.locator("#canvas").boundingBox();
  await page.mouse.click(box.x + sx, box.y + sy);
}

async function openDetailsForSelection(page) {
  await page.click("#sel-details");
  await page.waitForSelector("#details-overlay", { state: "visible" });
}

test("selecting a node and clicking Edit Details opens a modal pre-filled with its meaning/aliases/properties", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      n.meaning = "A request for payment.";
      n.aliases = ["bill"];
      n.properties = [{ id: "p1", name: "amount", type: "number", unit: "EUR", allowed: null }];
    });
    await selectNodeOnCanvas(page, 300, 300);
    await openDetailsForSelection(page);

    assert.equal(await page.locator("#details-title").textContent(), "Edit Class Details");
    assert.equal(await page.locator("#details-meaning").inputValue(), "A request for payment.");
    assert.equal(await page.locator(".details-alias-input").inputValue(), "bill");
    assert.equal(await page.locator(".details-property-name").inputValue(), "amount");
    assert.equal(await page.locator(".details-property-type").inputValue(), "number");
    assert.equal(await page.locator(".details-property-unit").inputValue(), "EUR");
    assert.equal(await page.locator("#details-aliases-section").evaluate((el) => getComputedStyle(el).display), "block");
    assert.equal(await page.locator("#details-properties-section").evaluate((el) => getComputedStyle(el).display), "block");
  });
});

test("a group node's details dialog reads 'Edit Group Details', not 'Edit Class Details'", async () => {
  await withPage(async (page) => {
    await page.click("#btn-add-group");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 500, box.y + 400);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Team");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" }); // placeNewNodeAt selects the new group
    await openDetailsForSelection(page);
    assert.equal(await page.locator("#details-title").textContent(), "Edit Group Details");
  });
});

test("an edge's details dialog shows only Meaning — aliases/properties sections are hidden", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Invoice");
    await addNodeViaDblClick(page, 650, 250, "Supplier");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "issued by"); // selects the new edge
    await openDetailsForSelection(page);
    assert.equal(await page.locator("#details-title").textContent(), "Edit Relationship Details");
    assert.equal(await page.locator("#details-aliases-section").evaluate((el) => getComputedStyle(el).display), "none");
    assert.equal(await page.locator("#details-properties-section").evaluate((el) => getComputedStyle(el).display), "none");
  });
});

test("editing meaning/aliases/properties and clicking Save commits everything as a single undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);

    await openDetailsForSelection(page);
    await page.locator("#details-meaning").fill("A request for payment.");
    await page.click("#details-add-alias");
    await page.locator(".details-alias-input").fill("bill");
    await page.click("#details-add-property");
    await page.locator(".details-property-name").fill("amount");
    await page.locator(".details-property-type").selectOption("number");
    await page.locator(".details-property-unit").fill("EUR");
    await page.click("#details-save");
    await page.waitForSelector("#details-overlay", { state: "hidden" });

    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(node.meaning, "A request for payment.");
    assert.deepEqual(node.aliases, ["bill"]);
    assert.equal(node.properties.length, 1);
    assert.equal(node.properties[0].name, "amount");
    assert.equal(node.properties[0].type, "number");
    assert.equal(node.properties[0].unit, "EUR");

    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfter, historyBefore + 1, "the whole edit commits as exactly one undo step");

    await page.evaluate(() => window.__kg.actions.undo());
    const undone = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(undone.meaning, null);
    assert.deepEqual(undone.aliases, []);
    assert.deepEqual(undone.properties, []);
  });
});

test("clicking Cancel discards edits and pushes no undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);

    await openDetailsForSelection(page);
    await page.locator("#details-meaning").fill("Should not be saved");
    await page.click("#details-cancel");
    await page.waitForSelector("#details-overlay", { state: "hidden" });

    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(node.meaning, null);
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), historyBefore);
  });
});

test("clicking outside the dialog (on the overlay) closes it without saving", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    await openDetailsForSelection(page);
    await page.locator("#details-meaning").fill("Should not be saved");
    await page.click("#details-overlay", { position: { x: 5, y: 5 } }); // outside the dialog box, still inside the overlay
    await page.waitForSelector("#details-overlay", { state: "hidden" });
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(node.meaning, null);
  });
});

test("pressing Escape closes the dialog without saving", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    await openDetailsForSelection(page);
    await page.locator("#details-meaning").fill("Should not be saved");
    await page.keyboard.press("Escape");
    await page.waitForSelector("#details-overlay", { state: "hidden" });
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(node.meaning, null);
  });
});

test("backspacing inside the meaning textarea doesn't fall through to the canvas-level delete-selection shortcut", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    await openDetailsForSelection(page);
    await page.locator("#details-meaning").fill("text");
    await page.locator("#details-meaning").press("Backspace");
    assert.equal(await page.locator("#details-overlay").evaluate((el) => getComputedStyle(el).display), "flex", "the dialog must still be open");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 1, "the selected node must not have been deleted");
  });
});

test("removing an alias row via its ✕ button before saving drops it from the persisted aliases", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await page.evaluate(() => { window.__kg.state.nodes[0].aliases = ["bill", "statement"]; });
    await selectNodeOnCanvas(page, 300, 300);
    await openDetailsForSelection(page);
    assert.equal(await page.locator(".details-alias-input").count(), 2);
    await page.locator("#details-aliases-list .details-row-remove").first().click();
    assert.equal(await page.locator(".details-alias-input").count(), 1);
    await page.click("#details-save");
    await page.waitForSelector("#details-overlay", { state: "hidden" });
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.deepEqual(node.aliases, ["statement"]);
  });
});

test("the property Unit field is only visible when the property's own type is number", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    await openDetailsForSelection(page);
    await page.click("#details-add-property");
    const unitInput = page.locator(".details-property-unit");
    assert.equal(await unitInput.evaluate((el) => getComputedStyle(el).display), "none", "text is the default type — unit starts hidden");
    await page.locator(".details-property-type").selectOption("number");
    assert.notEqual(await unitInput.evaluate((el) => getComputedStyle(el).display), "none");
    await page.locator(".details-property-type").selectOption("date");
    assert.equal(await unitInput.evaluate((el) => getComputedStyle(el).display), "none");
  });
});

test("a newly-added property row left without a name isn't saved", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    await openDetailsForSelection(page);
    await page.click("#details-add-property"); // left entirely empty
    await page.click("#details-save");
    await page.waitForSelector("#details-overlay", { state: "hidden" });
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.deepEqual(node.properties, []);
  });
});

test("allowed values are parsed from a comma-separated string, trimmed, with empty entries dropped", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    await openDetailsForSelection(page);
    await page.click("#details-add-property");
    await page.locator(".details-property-name").fill("status");
    await page.locator(".details-property-allowed").fill("draft, matched,, approved ");
    await page.click("#details-save");
    await page.waitForSelector("#details-overlay", { state: "hidden" });
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.deepEqual(node.properties[0].allowed, ["draft", "matched", "approved"]);
  });
});

test("opening the dialog and saving with no actual changes pushes no undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    await openDetailsForSelection(page);
    await page.click("#details-save");
    await page.waitForSelector("#details-overlay", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), historyBefore);
  });
});

test("toggling language updates the details dialog's static labels/title", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await selectNodeOnCanvas(page, 300, 300);
    await openDetailsForSelection(page);
    assert.equal(await page.locator("#details-meaning-label").textContent(), "Meaning");
    await page.evaluate(() => window.__kg.lang.toggle());
    assert.equal(await page.locator("#details-meaning-label").textContent(), "Jelentés");
    assert.equal(await page.locator("#details-title").textContent(), "Osztály részleteinek szerkesztése");
  });
});

test("a node with no meaning/aliases/properties set behaves exactly as before this phase — rename (✎) still works label-only", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Original");
    await selectNodeOnCanvas(page, 300, 300);
    await page.click("#sel-rename");
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Renamed");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(node.label, "Renamed");
    assert.equal(node.meaning, null);
    assert.deepEqual(node.aliases, []);
    assert.deepEqual(node.properties, []);
  });
});
