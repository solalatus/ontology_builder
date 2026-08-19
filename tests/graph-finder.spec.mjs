import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";

// Ctrl+F graph finder (issue #121): a command-palette-style search over
// every element in the model -- classes, relationships, properties, rules,
// actions, competency questions -- not just canvas nodes/edges. Covers the
// issue's Definition of Done: opening/closing, autocomplete across all six
// kinds, per-kind result routing (canvas highlight+pan for nodes/edges,
// dialog-scroll-highlight for everything else), keyboard nav, and the two
// interaction contracts confirmed with the repo owner during planning --
// Ctrl+F displaces whatever dialog is already open rather than being
// blocked by it, and native browser find is left alone while a text field
// has focus.

async function openFinder(page) {
  await page.keyboard.press("Control+f");
  await page.waitForSelector("#graph-finder-overlay", { state: "visible" });
}

async function searchFinder(page, query) {
  await page.fill("#graph-finder-input", query);
  await page.waitForTimeout(30); // input listener re-renders synchronously; a tick for Playwright's own event loop to catch up
}

// Builds one instance of every result kind, all sharing the "zeta" token so
// a single query can exercise cross-kind matching -- the point of the
// unified index over building six kind-specific fixtures separately.
async function buildZetaFixture(page) {
  await addNodeViaDblClick(page, 300, 300, "ZetaWidget");
  await addNodeViaDblClick(page, 600, 300, "ZetaGadget");
  await createEdgeViaConnectMode(page, 300, 300, 600, 300, "zetaLink");

  const box = await page.locator("#canvas").boundingBox();
  await page.mouse.click(box.x + 300, box.y + 300);
  await page.click("#sel-details");
  await page.waitForSelector("#details-overlay", { state: "visible" });
  await page.click("#details-add-property");
  await page.locator(".details-property-name").last().fill("zetaWeight");
  await page.click("#details-save");
  await page.waitForSelector("#details-overlay", { state: "hidden" });

  await page.click("#btn-domain-model");
  await page.waitForSelector("#domain-model-overlay", { state: "visible" });
  await page.click("#domain-model-add-rule");
  await page.locator(".dm-rule-name").last().fill("zetaRule");
  await page.click("#domain-model-add-action");
  await page.locator(".dm-action-name").last().fill("zetaAction");
  await page.click("#domain-model-add-cq");
  await page.locator(".dm-cq-text").last().fill("What is zeta?");
  await page.click("#domain-model-save");
  await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
}

test("Ctrl+F opens the finder, and it indexes and matches all six element kinds by a shared substring", async () => {
  await withPage(async (page) => {
    await buildZetaFixture(page);
    await openFinder(page);
    await searchFinder(page, "zeta");

    const results = await page.evaluate(() => window.__kg.finder.getResults());
    assert.equal(results.length, 7, "2 nodes + 1 edge + 1 property + 1 rule + 1 action + 1 cq");
    assert.deepEqual(
      results.map((r) => r.kind).sort(),
      ["action", "cq", "edge", "node", "node", "property", "rule"],
    );
    assert.equal(await page.locator(".graph-finder-result").count(), 7, "the rendered rows match the index");
  });
});

test("matching is plain case-insensitive substring, not fuzzy", async () => {
  await withPage(async (page) => {
    await buildZetaFixture(page);
    await openFinder(page);

    await searchFinder(page, "ZETA");
    assert.equal((await page.evaluate(() => window.__kg.finder.getResults())).length, 7, "uppercase query still matches");

    await searchFinder(page, "ztea"); // scrambled -- a fuzzy matcher would still hit this, a substring one won't
    assert.equal((await page.evaluate(() => window.__kg.finder.getResults())).length, 0);
    assert.equal(await page.locator("#graph-finder-empty").isHidden(), false);
  });
});

test("an edge also matches on its endpoints' labels, not just its own relation name", async () => {
  await withPage(async (page) => {
    await buildZetaFixture(page);
    await openFinder(page);
    await searchFinder(page, "ZetaGadget"); // a node label, not the edge's own "zetaLink" relation

    const results = await page.evaluate(() => window.__kg.finder.getResults());
    assert.ok(
      results.some((r) => r.kind === "edge" && r.ownerLabel === "ZetaWidget → ZetaGadget"),
      "the edge shows up because its ownerLabel (endpoint labels) contains the query",
    );
  });
});

test("an empty query lists every element; a non-matching query shows the empty state", async () => {
  await withPage(async (page) => {
    await buildZetaFixture(page);
    const fullIndexSize = await page.evaluate(() => window.__kg.finder.buildIndex().length);
    await openFinder(page);
    assert.equal(await page.locator(".graph-finder-result").count(), fullIndexSize, "opening with no query lists everything");

    await searchFinder(page, "nothing matches this at all");
    assert.equal(await page.locator(".graph-finder-result").count(), 0);
    assert.equal(await page.locator("#graph-finder-empty").isHidden(), false);
  });
});

test("selecting a node result highlights it on canvas and pans the camera to it when it's off-screen", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => window.__kg.actions.createNode(5000, 5000, "FarNode"));
    const box = await page.locator("#canvas").boundingBox();

    await openFinder(page);
    await searchFinder(page, "FarNode");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#graph-finder-overlay", { state: "hidden" });

    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.type, "node");

    const screenPos = await page.evaluate(() => {
      const n = window.__kg.state.nodes.find((n) => n.label === "FarNode");
      return window.__kg.worldToScreen(n.x + n.w / 2, n.y + n.h / 2);
    });
    assert.ok(Math.abs(screenPos.x - box.width / 2) < 2, `expected the node centered horizontally, got x=${screenPos.x}`);
    assert.ok(Math.abs(screenPos.y - box.height / 2) < 2, `expected the node centered vertically, got y=${screenPos.y}`);
  });
});

test("selecting a node that's already on-screen leaves the camera untouched", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "NearNode");
    const before = await page.evaluate(() => window.__kg.worldToScreen(0, 0));

    await openFinder(page);
    await searchFinder(page, "NearNode");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#graph-finder-overlay", { state: "hidden" });

    const after = await page.evaluate(() => window.__kg.worldToScreen(0, 0));
    assert.deepEqual(after, before, "an already-visible target shouldn't cause a jarring camera jump");
  });
});

test("selecting an edge result highlights it and pans to the midpoint of its endpoints when off-screen", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      const a = window.__kg.actions.createNode(5000, 5000, "FarA");
      const b = window.__kg.actions.createNode(5400, 5000, "FarB");
      window.__kg.actions.createEdge(a.id, b.id, "farLink");
    });
    const box = await page.locator("#canvas").boundingBox();

    await openFinder(page);
    await searchFinder(page, "farLink");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#graph-finder-overlay", { state: "hidden" });

    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.type, "edge");

    const screenPos = await page.evaluate(() => {
      const [a, b] = window.__kg.state.nodes;
      const mid = { x: (a.x + a.w / 2 + b.x + b.w / 2) / 2, y: (a.y + a.h / 2 + b.y + b.h / 2) / 2 };
      return window.__kg.worldToScreen(mid.x, mid.y);
    });
    assert.ok(Math.abs(screenPos.x - box.width / 2) < 2);
    assert.ok(Math.abs(screenPos.y - box.height / 2) < 2);
  });
});

test("selecting a property result opens the owning class's Details dialog, scrolls to and flashes the row, without touching canvas selection", async () => {
  await withPage(async (page) => {
    await buildZetaFixture(page);
    const priorSelection = await page.evaluate(() => window.__kg.state.selection); // the ZetaWidget node, still selected from fixture setup

    await openFinder(page);
    await searchFinder(page, "zetaWeight");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#graph-finder-overlay", { state: "hidden" });
    await page.waitForSelector("#details-overlay", { state: "visible" });

    assert.equal(await page.locator(".details-property-row.finder-flash").count(), 1);
    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.deepEqual(selection, priorSelection, "a property has no canvas presence of its own -- selection is unaffected");
  });
});

test("selecting a rule, action, or CQ result opens the Domain Model dialog and flashes that specific card", async () => {
  await withPage(async (page) => {
    await buildZetaFixture(page);

    await openFinder(page);
    await searchFinder(page, "zetaRule");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    assert.equal(await page.locator(".domain-model-rule-card.finder-flash").count(), 1);
    await page.click("#domain-model-cancel");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    await openFinder(page);
    await searchFinder(page, "zetaAction");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    assert.equal(await page.locator(".domain-model-action-card.finder-flash").count(), 1);
    await page.click("#domain-model-cancel");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    await openFinder(page);
    await searchFinder(page, "What is zeta");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    assert.equal(await page.locator(".domain-model-cq-card.finder-flash").count(), 1);
  });
});

test("Escape closes the finder without selecting anything or changing existing selection", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    const before = await page.evaluate(() => window.__kg.state.selection);

    await openFinder(page);
    await searchFinder(page, "Widget");
    await page.keyboard.press("Escape");
    await page.waitForSelector("#graph-finder-overlay", { state: "hidden" });

    assert.equal(await page.evaluate(() => window.__kg.finder.isOpen()), false);
    assert.deepEqual(await page.evaluate(() => window.__kg.state.selection), before);
  });
});

test("clicking a result row selects it, same as pressing Enter would", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "ClickTarget");
    await openFinder(page);
    await searchFinder(page, "ClickTarget");
    await page.click(".graph-finder-result");
    await page.waitForSelector("#graph-finder-overlay", { state: "hidden" });

    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.type, "node");
  });
});

test("clicking the overlay backdrop closes the finder, same as every other dialog in this app", async () => {
  await withPage(async (page) => {
    await openFinder(page);
    await page.click("#graph-finder-overlay", { position: { x: 5, y: 5 } }); // outside the dialog itself
    await page.waitForSelector("#graph-finder-overlay", { state: "hidden" });
  });
});

test("arrow keys move the active result and wrap at both ends", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "ArrowA");
    await addNodeViaDblClick(page, 600, 300, "ArrowB");
    await addNodeViaDblClick(page, 900, 300, "ArrowC");
    await openFinder(page);
    await searchFinder(page, "Arrow");
    assert.equal(await page.evaluate(() => window.__kg.finder.getActiveIndex()), 0, "the first result starts active");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    assert.equal(await page.evaluate(() => window.__kg.finder.getActiveIndex()), 2);

    await page.keyboard.press("ArrowDown"); // wraps past the last result back to the first
    assert.equal(await page.evaluate(() => window.__kg.finder.getActiveIndex()), 0);

    await page.keyboard.press("ArrowUp"); // wraps the other direction too
    assert.equal(await page.evaluate(() => window.__kg.finder.getActiveIndex()), 2);

    const activeRowIndex = await page.evaluate(() => document.querySelector(".graph-finder-result.finder-active").dataset.index);
    assert.equal(activeRowIndex, "2", "the DOM's active-row class tracks the same index");
  });
});

test("Ctrl+F is suppressed while a text input or textarea has focus, so native browser find isn't stolen", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.click("#sel-details");
    await page.waitForSelector("#details-overlay", { state: "visible" });
    await page.locator("#details-meaning").focus();

    await page.keyboard.press("Control+f");
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.__kg.finder.isOpen()), false);
    assert.equal(await page.locator("#graph-finder-overlay").isVisible(), false);
  });
});

test("Ctrl+F displaces whatever dialog is already open, rather than being blocked by it", async () => {
  await withPage(async (page) => {
    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });

    await page.keyboard.press("Control+f");
    await page.waitForSelector("#graph-finder-overlay", { state: "visible" });
    assert.equal(await page.locator("#domain-model-overlay").isVisible(), false, "the previously-open dialog gets closed, not stacked underneath");
  });
});

test("the toolbar's Find button also opens the finder", async () => {
  await withPage(async (page) => {
    await page.click("#btn-graph-finder");
    await page.waitForSelector("#graph-finder-overlay", { state: "visible" });
    assert.equal(await page.evaluate(() => window.__kg.finder.isOpen()), true);
  });
});
