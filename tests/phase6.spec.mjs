import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { withPage, addNodeViaDblClick, dragNode, createEdgeViaConnectMode, applyImport } from "./lib/page.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.resolve(__dirname, "fixtures", name);

async function triggerImport(page, fixtureName) {
  await page.setInputFiles("#import-file-input", fixture(fixtureName));
  await page.waitForSelector("#import-overlay", { state: "visible" });
}

async function importSummary(page) {
  return page.locator("#import-summary").textContent();
}

// Drives an import via synthetic drag-drop (DataTransfer + DragEvent) rather
// than a real file on disk, for inline text content that only needs to
// exist for one test — same technique the malformed-edge-lines test uses.
async function dropText(page, text, filename = "import.txt") {
  await page.evaluate(({ t, name }) => {
    const dt = new DataTransfer();
    const file = new File([t], name, { type: "text/plain" });
    dt.items.add(file);
    const canvas = document.getElementById("canvas");
    canvas.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { t: text, name: filename });
  await page.waitForSelector("#import-overlay", { state: "visible" });
}

test("Merge on an empty graph reproduces the spec's own worked example exactly", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 5);
    assert.equal(edges.length, 3);

    const andhra = nodes.find((n) => n.label === "Andhra Pradesh");
    const telugu = nodes.find((n) => n.label === "Telugu");
    const marathi = nodes.find((n) => n.label === "Marathi");
    const guatemala = nodes.find((n) => n.label === "Guatemala");
    const eu = nodes.find((n) => n.label === "European Union");

    assert.ok(andhra && telugu && marathi && guatemala && eu);
    assert.ok(edges.some((e) => e.source === andhra.id && e.target === telugu.id && e.relation === "language used" && e.directed === true));
    assert.ok(edges.some((e) => e.source === andhra.id && e.target === marathi.id && e.relation === "language used" && e.directed === true));
    assert.ok(edges.some((e) => e.source === guatemala.id && e.target === eu.id && e.relation === "diplomatic relation" && e.directed === false));
  });
});

test("Merge is idempotent — re-importing the same file adds nothing and creates no duplicates", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await applyImport(page, "#import-merge");

    await triggerImport(page, "spec-example.txt");
    const summary = await importSummary(page);
    assert.match(summary, /Merge: 0 node\(s\) and 0 edge\(s\) would be added/);
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 5);
    assert.equal(edges.length, 3);
  });
});

test("existing nodes are matched (not duplicated) and keep their size on merge — position now shifts because merge folds in a full autolayout reflow (issue #57)", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 700, 500, "Andhra Pradesh");
    await dragNode(page, 700, 500, 900, 650); // move it somewhere custom
    const before = await page.evaluate(() => window.__kg.state.nodes[0]);

    await triggerImport(page, "spec-example.txt");
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 5, "Andhra Pradesh matched, not duplicated");
    const after = nodes.find((n) => n.label === "Andhra Pradesh");
    assert.equal(after.w, before.w, "autolayout only ever touches x/y, never size");
    assert.equal(after.h, before.h);
    // Position is deliberately not asserted equal here (that was this
    // test's whole point before issue #57): every commitYamlImport/
    // commitTxtImport call now folds a full-graph autolayout pass into its
    // own single undo step, so even a matched, previously hand-placed node
    // moves along with everything else. See the dedicated reflow test
    // below for that behavior itself.
  });
});

test("merge never deletes an edge that's missing from the TXT — additive only", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Andhra Pradesh");
    await addNodeViaDblClick(page, 650, 250, "Extra Node");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "not in the TXT");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    await triggerImport(page, "spec-example.txt");
    await applyImport(page, "#import-merge");

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.ok(edges.some((e) => e.relation === "not in the TXT"), "pre-existing edge must survive a merge");
  });
});

// issue #57: new content lands via shelf/grid placement first (unchanged --
// computeImportShelf() still avoids initial overlap with existing content),
// but the commit now folds a full autolayout reflow on top of that before
// its own single pushHistory, so the *final* graph is never just "shelf
// plus whatever was already there" the way it was before this issue.
test("import triggers a full-graph autolayout reflow, not just shelf placement of the new nodes", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Preexisting"); // rect ~170,220..330,280
    const preexistingBefore = await page.evaluate(() => window.__kg.state.nodes[0]);

    await triggerImport(page, "subset.txt"); // Andhra Pradesh, Telugu — both new
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 3);
    const preexistingAfter = nodes.find((n) => n.label === "Preexisting");
    assert.notEqual(
      `${preexistingAfter.x},${preexistingAfter.y}`,
      `${preexistingBefore.x},${preexistingBefore.y}`,
      "a pre-existing node the import didn't even touch should still move -- proof this is a real graph-wide reflow, not just placement of the two new nodes"
    );

    // Folded into the import's own undo step (see commitTxtImport's own
    // comment), not a second, separate one -- one Undo restores both the
    // content and the reflowed position together.
    await page.click("#btn-undo");
    const restoredNodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(restoredNodes.length, 1, "one Undo removes the imported content too, not just the reflow");
    assert.equal(restoredNodes[0].x, preexistingBefore.x);
    assert.equal(restoredNodes[0].y, preexistingBefore.y);
  });
});

test("newly imported nodes are flagged (highlighted) until the next discrete action clears it", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "subset.txt");
    await applyImport(page, "#import-merge");

    let flagged = await page.evaluate(() => [...window.__kg.getNewlyImportedIds()]);
    assert.equal(flagged.length, 2);

    await addNodeViaDblClick(page, 900, 700, "Something else");
    flagged = await page.evaluate(() => [...window.__kg.getNewlyImportedIds()]);
    assert.equal(flagged.length, 0, "a new discrete action should clear the highlight");
  });
});

test("Replace button is hidden when the current graph is already empty (nothing to remove)", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    const visible = await page.locator("#import-replace").isVisible();
    assert.equal(visible, false);
  });
});

test("Import dialog's diff summary counts match what actually happens on commit", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await applyImport(page, "#import-merge");

    await triggerImport(page, "subset.txt"); // fully already present -> 0/0, but graph has content now
    const summary = await importSummary(page);
    assert.match(summary, /Merge: 0 node\(s\) and 0 edge\(s\) would be added/);
    assert.match(summary, /Replace: same additions, plus 3 node\(s\)\/edge\(s\)/);
    await page.click("#import-cancel");

    await triggerImport(page, "subset.txt");
    await applyImport(page, "#import-replace");

    const nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes.sort(), ["Andhra Pradesh", "Telugu"]);
  });
});

test("Replace mode removes nodes/edges absent from the TXT, in exactly one undo step, fully reversible", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await applyImport(page, "#import-merge");
    const before = await page.evaluate(() => window.__kg.history.past.length);

    await triggerImport(page, "subset.txt");
    await applyImport(page, "#import-replace");

    const after = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after, before + 1, "Replace is exactly one undo step regardless of how much changed");

    let nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes.sort(), ["Andhra Pradesh", "Telugu"]);
    let edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);

    await page.click("#btn-undo");
    nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.equal(nodes.length, 5, "one Undo restores the full pre-Replace graph");
    edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 3);
  });
});

test("Cancel on the import dialog applies nothing", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await page.click("#import-cancel");
    await page.waitForSelector("#import-overlay", { state: "hidden" });
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
    const overlayDisplay = await page.evaluate(() => getComputedStyle(document.getElementById("import-overlay")).display);
    assert.equal(overlayDisplay, "none");
  });
});

test("clicking outside the import dialog (the backdrop) also cancels", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await page.mouse.click(20, 20);
    await page.waitForSelector("#import-overlay", { state: "hidden" });
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

test("label matching is case-sensitive — a differently-cased label is a distinct node, not a match", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "andhra pradesh"); // lowercase
    await triggerImport(page, "subset.txt"); // has "Andhra Pradesh"
    await applyImport(page, "#import-merge");

    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.equal(labels.length, 3, "distinct casing means a new node, not a match");
    assert.ok(labels.includes("andhra pradesh"));
    assert.ok(labels.includes("Andhra Pradesh"));
  });
});

test("malformed edge lines (no connector, no relation separator) are skipped without crashing", async () => {
  await withPage(async (page) => {
    const text = [
      "## NODES",
      "Alpha",
      "Beta",
      "",
      "## EDGES",
      "Alpha Beta no connector or separator here",
      "Alpha -> Beta no separator",
      "Alpha -> Beta : real relation",
    ].join("\n");
    // Drive it through a synthetic drag-drop rather than a real file on disk,
    // since this content only needs to exist for this one test.
    await page.evaluate(async (t) => {
      const dt = new DataTransfer();
      const file = new File([t], "malformed.txt", { type: "text/plain" });
      dt.items.add(file);
      const canvas = document.getElementById("canvas");
      const evt = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt });
      canvas.dispatchEvent(evt);
    }, text);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 2);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].relation, "real relation");
  });
});

test("drag-and-drop of a .txt file onto the canvas opens the same import dialog as the file picker", async () => {
  await withPage(async (page) => {
    const text = fs.readFileSync(fixture("subset.txt"), "utf-8");
    await page.evaluate(async (t) => {
      const dt = new DataTransfer();
      const file = new File([t], "subset.txt", { type: "text/plain" });
      dt.items.add(file);
      const canvas = document.getElementById("canvas");
      canvas.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, text);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes.sort(), ["Andhra Pradesh", "Telugu"]);
  });
});

test("TXT import triggers a background save — the imported graph survives a reload", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "subset.txt");
    await page.click("#import-merge");
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 2);

    const nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes.sort(), ["Andhra Pradesh", "Telugu"]);
  });
});

test("blank lines, trailing whitespace, and extra spacing throughout the file don't break parsing", async () => {
  await withPage(async (page) => {
    const text = [
      "",
      "   ",
      "## NODES",
      "",
      "  Alpha  ",
      "",
      "",
      "Beta",
      "   ",
      "## EDGES",
      "",
      "  Alpha -> Beta : relates to  ",
      "",
    ].join("\n");
    await dropText(page, text, "whitespace.txt");
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.deepEqual(nodes.sort(), ["Alpha", "Beta"], "leading/trailing whitespace around labels is trimmed");
    assert.equal(edges.length, 1);
    assert.equal(edges[0].relation, "relates to");
  });
});

test("merging a file that references a node previously deleted from the current graph re-creates it fresh", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "subset.txt");
    await applyImport(page, "#import-merge");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 2);

    // Delete "Telugu" from the live graph — merging the same file again
    // should treat it as absent-from-current-graph and recreate it, since
    // matching is against the live graph, not import history.
    // Imported nodes land near world (0,0), which sits directly under the
    // fixed toolbar that visually overlaps the top of the canvas element —
    // pan down first so the click actually reaches the canvas.
    await page.evaluate(() => { window.__kg.camera.panY = 150; window.__kg.render(); });
    const box = await page.locator("#canvas").boundingBox();
    const telugu = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Telugu"));
    const screen = await page.evaluate((n) => window.__kg.worldToScreen(n.x + n.w / 2, n.y + n.h / 2), telugu);
    await page.mouse.click(box.x + screen.x, box.y + screen.y);
    const sel = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(sel.type, "node", "sanity check: the click actually selected the node before deleting it");
    await page.keyboard.press("Delete");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 1);

    await triggerImport(page, "subset.txt");
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes.sort(), ["Andhra Pradesh", "Telugu"], "Telugu is back after re-merging");
    const newTelugu = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Telugu"));
    assert.notEqual(newTelugu.id, telugu.id, "the re-created node gets a fresh id, not the old deleted one");
  });
});

test("a large import (~200 nodes) completes without hanging or crashing", async () => {
  await withPage(async (page) => {
    const nodeLines = Array.from({ length: 200 }, (_, i) => `Node${i}`);
    const edgeLines = Array.from({ length: 150 }, (_, i) => `Node${i} -> Node${(i + 37) % 200} : rel${i}`);
    const text = ["## NODES", ...nodeLines, "", "## EDGES", ...edgeLines].join("\n");

    const start = Date.now();
    await dropText(page, text, "large.txt");
    await page.click("#import-merge");
    await page.waitForFunction(() => window.__kg.state.nodes.length === 200);
    assert.ok(Date.now() - start < 15000, "a 200-node import should complete quickly, not hang");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 200);
    assert.equal(edges.length, 150);
  });
});
