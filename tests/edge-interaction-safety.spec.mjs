import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode, APP_URL } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// User-reported bug pair (2026-08): dragging an edge for longer than
// LONG_PRESS_MS (600ms) deleted it outright, no matter how far the pointer
// had moved -- "dragging the relationship down a lot now seems to delete
// it. This must NOT happen ever." Root cause: pointerdown on an edge armed
// the same long-press-delete timer a node gets, but unlike moveNode,
// nothing in pointermove ever cancelled it on movement (the edge branch
// never set dragMode to anything, so pointermove's move-cancels-the-timer
// check, keyed on dragMode, never ran for it). Fixed by giving edges their
// own dragMode ("moveEdgeLabel") with the identical press/hold/move
// handling nodes already had -- which doubles as the fix for the paired
// feature request: dragging an edge's own label (previously not a real
// interaction at all) now repositions it along the edge via edge.labelT,
// a field that already existed (autolayout-only, see
// resolveEdgeLabelPositions()) but was never user-facing.
//
// tests/phase1.spec.mjs's existing "long-press on an edge deletes it" test
// is left untouched -- a genuinely stationary long-press must still delete,
// exactly like the analogous node test right above it. These tests cover
// what that one doesn't: movement during the hold, and the new drag
// itself.

async function idleEdgeBetween(page, ax, ay, bx, by, relation = "") {
  await createEdgeViaConnectMode(page, ax, ay, bx, by, relation);
  // Connect mode is sticky and stays armed after creating the edge; leave
  // it so plain press/drag (an idle-mode-only interaction) can run.
  await page.evaluate(() => window.__kg.actions.setMode("idle"));
}

test("dragging an edge for longer than the long-press threshold never deletes it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 650, 250, "Beta");
    await idleEdgeBetween(page, 250, 250, 650, 250, "relates to");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.move(box.x + 450, box.y + 250); // on the edge line
    await page.mouse.down();
    // Slowly drag downward across a span exceeding LONG_PRESS_MS (600ms) —
    // exactly "dragging the relationship down a lot."
    for (let i = 1; i <= 8; i++) {
      await page.mouse.move(box.x + 450, box.y + 250 + i * 25, { steps: 3 });
      await page.waitForTimeout(100);
    }
    await page.mouse.up();

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1, "a drag must never delete the edge, no matter how long it takes");
  });
});

test("a stationary long-press on an edge still deletes it (unchanged behavior)", async () => {
  // Regression guard for the fix above: movement-cancels-the-timer must not
  // have accidentally also disabled the plain, no-movement long-press-
  // delete gesture nodes and edges both still rely on.
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 650, 250, "Beta");
    await idleEdgeBetween(page, 250, 250, 650, 250, "relates to");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.move(box.x + 450, box.y + 250);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 0);
  });
});

test("a quick drag well under the threshold cancels the delete timer and leaves the edge selected", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 650, 250, "Beta");
    await idleEdgeBetween(page, 250, 250, 650, 250, "relates to");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.move(box.x + 450, box.y + 250);
    await page.mouse.down();
    await page.mouse.move(box.x + 450, box.y + 280, { steps: 5 }); // past MOVE_THRESHOLD immediately
    await page.mouse.up();
    // Give any (incorrectly still-armed) delete timer a chance to fire.
    await page.waitForTimeout(700);

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);
    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.type, "edge");
  });
});

test("dragging an edge's label repositions it (edge.labelT changes toward the drag direction)", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 750, 250, "Beta");
    await idleEdgeBetween(page, 250, 250, 750, 250, "relates to");
    const box = await page.locator("#canvas").boundingBox();

    const before = await page.evaluate(() => window.__kg.state.edges[0].labelT);
    assert.equal(before, undefined, "a freshly created edge has no custom label position yet");

    // The label renders just above the straight line's midpoint.
    await page.mouse.move(box.x + 500, box.y + 235);
    await page.mouse.down();
    await page.mouse.move(box.x + 700, box.y + 235, { steps: 10 }); // drag toward the Beta end
    await page.mouse.up();

    const after = await page.evaluate(() => window.__kg.state.edges[0].labelT);
    assert.equal(typeof after, "number");
    assert.ok(after > 0.6, `expected the label to have moved toward the target end (t closer to 1), got ${after}`);
  });
});

test("repositioning a label is a real undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 750, 250, "Beta");
    await idleEdgeBetween(page, 250, 250, 750, 250, "relates to");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.move(box.x + 500, box.y + 235);
    await page.mouse.down();
    await page.mouse.move(box.x + 700, box.y + 235, { steps: 10 });
    await page.mouse.up();
    const moved = await page.evaluate(() => window.__kg.state.edges[0].labelT);
    assert.ok(typeof moved === "number" && moved > 0.6);

    await page.evaluate(() => window.__kg.actions.undo());
    const afterUndo = await page.evaluate(() => window.__kg.state.edges[0].labelT);
    assert.equal(afterUndo, undefined, "undo should restore the pre-drag (never customized) position");

    await page.evaluate(() => window.__kg.actions.redo());
    const afterRedo = await page.evaluate(() => window.__kg.state.edges[0].labelT);
    assert.equal(afterRedo, moved);
  });
});

test("dragging on the edge's line (not precisely the label) still repositions the label, and still never deletes", async () => {
  // findEdgeLabelAt() is checked first, but pointerdown falls back to the
  // existing path-proximity hit test (findEdgeAt()) when the press didn't
  // start inside the label's own box -- both arm the same drag.
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 750, 250, "Beta");
    await idleEdgeBetween(page, 250, 250, 750, 250, "relates to");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.move(box.x + 500, box.y + 250); // squarely on the line itself
    await page.mouse.down();
    await page.mouse.move(box.x + 700, box.y + 250, { steps: 10 });
    await page.waitForTimeout(700); // long enough to have deleted it under the old bug
    await page.mouse.up();

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);
    assert.ok(typeof edges[0].labelT === "number" && edges[0].labelT > 0.6);
  });
});

// --------------------------------------------------------------------------
// Persistence: a hand-dragged label position is a deliberate edit now, not
// an ephemeral autolayout scratch value, and has to survive the same
// round trips every other edit does.
// --------------------------------------------------------------------------

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

test("a custom label position survives Save Version -> reopen (JSON round trip)", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 200, 200, "Alpha");
    await addNodeViaDblClick(page, 700, 200, "Beta");
    await createEdgeViaConnectMode(page, 200, 200, 700, 200, "leads to");
    await page.evaluate(() => {
      window.__kg.actions.setMode("idle");
      window.__kg.state.edges[0].labelT = 0.75;
      window.__kg.markDirty();
    });

    await page.click("#btn-save-version");
    await page.waitForTimeout(250);
    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const jsonText = await readDownload(jsonDl);

    await page.evaluate(() => { window.__kg.state.nodes.length = 0; window.__kg.state.edges.length = 0; window.__kg.markDirty(); });

    await page.evaluate((text) => {
      const dt = new DataTransfer();
      dt.items.add(new File([text], "reopen.json", { type: "application/json" }));
      document.getElementById("canvas").dispatchEvent(
        new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, jsonText);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    // Canvas is empty at this point (cleared above), so Replace is hidden —
    // Merge is the only offered action, and it behaves as a full restore
    // onto nothing to merge with (same convention json-import.spec.mjs's
    // own tests use).
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const labelT = await page.evaluate(() => window.__kg.state.edges[0].labelT);
    assert.equal(labelT, 0.75, "a dragged label position must not silently reset to the midpoint on reopen");
  });
});

test("merging a file into an existing graph does not move an already-placed label on a matched edge", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 200, 200, "Alpha");
    await addNodeViaDblClick(page, 700, 200, "Beta");
    await createEdgeViaConnectMode(page, 200, 200, 700, 200, "leads to");
    await page.evaluate(() => {
      window.__kg.actions.setMode("idle");
      window.__kg.state.edges[0].labelT = 0.2; // the user's own hand-placed position
      window.__kg.markDirty();
    });

    const importedJson = await page.evaluate(() => JSON.stringify({
      meta: { format_version: 1, graph_id: null, version: 0, created: null, saved: null },
      nodes: [
        { id: "x1", label: "Alpha", x: 0, y: 0, w: 160, h: 60, meaning: null, aliases: [], properties: [] },
        { id: "x2", label: "Beta", x: 300, y: 0, w: 160, h: 60, meaning: null, aliases: [], properties: [] },
      ],
      edges: [{ id: "xe1", source: "x1", target: "x2", relation: "leads to", directed: true, meaning: null, aliases: [], labelT: 0.9 }],
      rules: [], actions: [],
    }));
    await page.evaluate((text) => {
      const dt = new DataTransfer();
      dt.items.add(new File([text], "merge-in.json", { type: "application/json" }));
      document.getElementById("canvas").dispatchEvent(
        new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, importedJson);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1, "same source/target/relation/directed should have matched the existing edge, not duplicated it");
    assert.equal(edges[0].labelT, 0.2, "merging must not overwrite a label position the user already placed, same as it never overwrites node x/y");
  });
});

test("merging a file that introduces a brand-new edge does carry over that edge's own label position", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 200, 200, "Alpha");
    await addNodeViaDblClick(page, 700, 200, "Beta");

    const importedJson = await page.evaluate(() => JSON.stringify({
      meta: { format_version: 1, graph_id: null, version: 0, created: null, saved: null },
      nodes: [
        { id: "x1", label: "Alpha", x: 0, y: 0, w: 160, h: 60, meaning: null, aliases: [], properties: [] },
        { id: "x2", label: "Beta", x: 300, y: 0, w: 160, h: 60, meaning: null, aliases: [], properties: [] },
      ],
      edges: [{ id: "xe1", source: "x1", target: "x2", relation: "leads to", directed: true, meaning: null, aliases: [], labelT: 0.9 }],
      rules: [], actions: [],
    }));
    await page.evaluate((text) => {
      const dt = new DataTransfer();
      dt.items.add(new File([text], "merge-in.json", { type: "application/json" }));
      document.getElementById("canvas").dispatchEvent(
        new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, importedJson);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].labelT, 0.9);
  });
});
