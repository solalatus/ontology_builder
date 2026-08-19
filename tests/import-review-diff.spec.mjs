import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";

// Import Review (issue #122) -- diff plumbing. Covers jsonGraphToSnapshot()/
// yamlModelToSnapshot()/computeImportReviewDiff() (window.__kg.importReview),
// the adapters that let the new Review dialog reuse diffDomainModels() (the
// same engine issue #74's Review Changes dialog already relies on) against a
// *parsed incoming import* instead of a second history snapshot. Pure-logic
// coverage, no dialog UI involved yet.

// buildJsonExport() returns a plain object (callers JSON.stringify() it
// themselves -- see performSaveVersion()) and requires state.meta, which
// only exists once "Save Version" has run for real. Seeds it directly in the
// same shape performSaveVersion() would, since these tests aren't exercising
// saving itself, then returns the export as a JSON string ready for
// parseJsonImport().
async function exportJson(page) {
  return page.evaluate(() => {
    if (!window.__kg.state.meta) {
      window.__kg.state.meta = { format_version: 1, graph_id: "test-graph", version: 0, created: "2026-01-01T00:00:00Z" };
    }
    return JSON.stringify(window.__kg.formats.buildJsonExport());
  });
}

test("a JSON import identical to the live graph diffs empty", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await addNodeViaDblClick(page, 600, 300, "Gadget");
    await createEdgeViaConnectMode(page, 300, 300, 600, 300, "connectsTo");

    const json = await exportJson(page);
    const diff = await page.evaluate((json) => {
      const parsed = window.__kg.formats.parseJsonImport(json);
      return window.__kg.importReview.computeDiff(parsed.graph, "json");
    }, json);
    assert.deepEqual(diff.classes, { added: [], removed: [], changed: [] });
    assert.deepEqual(diff.relationships, { added: [], removed: [], changed: [], directionChanged: [] });
  });
});

test("a JSON import with one new class and one changed class reports both, correctly bucketed", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.click("#sel-details");
    await page.waitForSelector("#details-overlay", { state: "visible" });
    await page.locator("#details-meaning").fill("Original meaning.");
    await page.click("#details-save");
    await page.waitForSelector("#details-overlay", { state: "hidden" });

    const json = await exportJson(page);
    const diff = await page.evaluate((json) => {
      const root = JSON.parse(json);
      // Mutate the exported JSON directly, offline, the way an external file
      // the user picked up elsewhere would legitimately differ.
      root.nodes.find((n) => n.label === "Widget").meaning = "Edited elsewhere.";
      root.nodes.push({ id: "extra1", label: "Extra", x: 900, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      const parsed = window.__kg.formats.parseJsonImport(JSON.stringify(root));
      return window.__kg.importReview.computeDiff(parsed.graph, "json");
    }, json);
    assert.deepEqual(diff.classes.added.map((c) => c.name), ["Extra"]);
    assert.equal(diff.classes.removed.length, 0);
    assert.deepEqual(diff.classes.changed.map((c) => c.name), ["Widget"]);
    assert.equal(diff.classes.changed[0].before.meaning, "Original meaning.");
    assert.equal(diff.classes.changed[0].after.meaning, "Edited elsewhere.");
  });
});

test("a JSON import missing a class the live graph has reports it removed", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "KeepMe");
    await addNodeViaDblClick(page, 600, 300, "DropMe");

    const json = await exportJson(page);
    const diff = await page.evaluate((json) => {
      const root = JSON.parse(json);
      root.nodes = root.nodes.filter((n) => n.label !== "DropMe");
      const parsed = window.__kg.formats.parseJsonImport(JSON.stringify(root));
      return window.__kg.importReview.computeDiff(parsed.graph, "json");
    }, json);
    assert.deepEqual(diff.classes.removed.map((c) => c.name), ["DropMe"]);
    assert.equal(diff.classes.added.length, 0);
    assert.equal(diff.classes.changed.length, 0);
  });
});

test("a JSON import's relationships and properties diff by name, matching a swapped direction as direction-changed", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await addNodeViaDblClick(page, 600, 300, "Gadget");
    await createEdgeViaConnectMode(page, 300, 300, 600, 300, "connectsTo");

    const json = await exportJson(page);
    const diff = await page.evaluate((json) => {
      const root = JSON.parse(json);
      const widget = root.nodes.find((n) => n.label === "Widget");
      const gadget = root.nodes.find((n) => n.label === "Gadget");
      const edge = root.edges[0];
      // Swap source/target -- the direction-changed detection path.
      edge.source = gadget.id;
      edge.target = widget.id;
      widget.properties.push({ id: "p1", name: "weight", type: "number", unit: "kg", allowed: null });
      const parsed = window.__kg.formats.parseJsonImport(JSON.stringify(root));
      return window.__kg.importReview.computeDiff(parsed.graph, "json");
    }, json);
    assert.equal(diff.relationships.added.length, 0);
    assert.equal(diff.relationships.removed.length, 0);
    assert.equal(diff.relationships.changed.length, 0);
    assert.equal(diff.relationships.directionChanged.length, 1, "swapped from/to should read as direction-changed, not remove+add");
    assert.deepEqual(diff.properties.added.map((p) => p.name), ["weight"]);
  });
});

test("a YAML import diffs the same way -- new rule, changed action, matched-unchanged class stays out of the diff", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await page.evaluate(() => {
      window.__kg.actions.createAction("ship", null, [], "It ships.", "Check the tracking number.");
    });

    const diff = await page.evaluate(() => {
      const yaml = window.__kg.formats.buildDomainYamlExport();
      const parsed = window.__kg.formats.parseDomainYamlImport(
        yaml + "\nrules:\n  isReady:\n    conditions:\n      - stock is available\n",
      );
      // Change the action's effect text in the parsed model directly.
      parsed.actions.ship.effect = "It ships internationally.";
      return window.__kg.importReview.computeDiff(parsed, "yaml");
    });
    assert.deepEqual(diff.classes, { added: [], removed: [], changed: [] }, "the untouched Widget class must not show up as changed");
    assert.deepEqual(diff.rules.added.map((r) => r.name), ["isReady"]);
    assert.deepEqual(diff.actions.changed.map((a) => a.name), ["ship"]);
    assert.equal(diff.actions.changed[0].before.effect, "It ships.");
    assert.equal(diff.actions.changed[0].after.effect, "It ships internationally.");
  });
});

test("a YAML import omitting an optional field (no aliases/meaning) is not a false 'changed' against a live class that also has none", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Bare");

    const diff = await page.evaluate(() => {
      const parsed = window.__kg.formats.parseDomainYamlImport("classes:\n  Bare:\n    properties: {}\n");
      return window.__kg.importReview.computeDiff(parsed, "yaml");
    });
    assert.deepEqual(diff.classes, { added: [], removed: [], changed: [] },
      "an omitted meaning/aliases field must normalize the same way buildDomainModel's own defaults do, not read as a spurious diff");
  });
});

test("a YAML relationship referencing an undeclared class is dropped defensively, not thrown", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");

    const diff = await page.evaluate(() => {
      const parsed = window.__kg.formats.parseDomainYamlImport(
        "classes:\n  Widget:\n    properties: {}\nrelationships:\n  - name: connectsTo\n    from: Widget\n    to: Nonexistent\n",
      );
      return window.__kg.importReview.computeDiff(parsed, "yaml");
    });
    assert.equal(diff.relationships.added.length, 0, "a dangling reference should be skipped, not fabricated into a phantom relationship");
  });
});
