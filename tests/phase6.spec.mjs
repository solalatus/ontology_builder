import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { withPage, addNodeViaDblClick, addNodeViaButton, dragNode, createEdgeViaConnectMode } from "./lib/page.mjs";

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
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 6);
    assert.equal(edges.length, 4);

    const group = nodes.find((n) => n.label === "South Asian Languages");
    const andhra = nodes.find((n) => n.label === "Andhra Pradesh");
    const telugu = nodes.find((n) => n.label === "Telugu");
    const marathi = nodes.find((n) => n.label === "Marathi");
    const guatemala = nodes.find((n) => n.label === "Guatemala");
    const eu = nodes.find((n) => n.label === "European Union");

    assert.equal(group.type, "group");
    assert.deepEqual(andhra.groups, [group.id]);
    assert.deepEqual(telugu.groups, []);

    const containsEdge = edges.find((e) => e.auto);
    assert.equal(containsEdge.source, group.id);
    assert.equal(containsEdge.target, andhra.id);
    assert.equal(containsEdge.relation, "contains");

    const ordinary = edges.filter((e) => !e.auto);
    assert.equal(ordinary.length, 3);
    assert.ok(ordinary.some((e) => e.source === andhra.id && e.target === telugu.id && e.relation === "language used" && e.directed === true));
    assert.ok(ordinary.some((e) => e.source === andhra.id && e.target === marathi.id && e.relation === "language used" && e.directed === true));
    assert.ok(ordinary.some((e) => e.source === guatemala.id && e.target === eu.id && e.relation === "diplomatic relation" && e.directed === false));
  });
});

test("Merge is idempotent — re-importing the same file adds nothing and creates no duplicates", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    await triggerImport(page, "spec-example.txt");
    const summary = await importSummary(page);
    assert.match(summary, /Merge: 0 node\(s\) and 0 edge\(s\) would be added/);
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 6);
    assert.equal(edges.length, 4);
  });
});

test("existing nodes keep their position, size, and groups untouched on merge — matched purely by label", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 700, 500, "Andhra Pradesh");
    await dragNode(page, 700, 500, 900, 650); // move it somewhere custom
    const before = await page.evaluate(() => window.__kg.state.nodes[0]);

    await triggerImport(page, "spec-example.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 6, "Andhra Pradesh matched, not duplicated");
    const after = nodes.find((n) => n.label === "Andhra Pradesh");
    assert.equal(after.x, before.x);
    assert.equal(after.y, before.y);
    assert.equal(after.w, before.w);
    assert.equal(after.h, before.h);
  });
});

test("merge never deletes an edge that's missing from the TXT — additive only", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Andhra Pradesh");
    await addNodeViaDblClick(page, 650, 250, "Extra Node");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "not in the TXT");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    await triggerImport(page, "spec-example.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.ok(edges.some((e) => e.relation === "not in the TXT"), "pre-existing edge must survive a merge");
  });
});

test("newly created nodes are auto-placed via shelf/grid, not full autolayout, and don't collide with existing content", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Preexisting"); // rect ~170,220..330,280

    await triggerImport(page, "subset.txt"); // Andhra Pradesh, Telugu — both new
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const preexisting = nodes.find((n) => n.label === "Preexisting");
    const imported = nodes.filter((n) => n.label !== "Preexisting");
    assert.equal(imported.length, 2);
    for (const n of imported) {
      // shelf starts below the existing content's bounding box
      assert.ok(n.y >= preexisting.y + preexisting.h, `imported node "${n.label}" should be placed below existing content`);
    }
  });
});

test("newly imported nodes are flagged (highlighted) until the next discrete action clears it", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "subset.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

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
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    await triggerImport(page, "subset.txt"); // fully already present -> 0/0, but graph has content now
    const summary = await importSummary(page);
    assert.match(summary, /Merge: 0 node\(s\) and 0 edge\(s\) would be added/);
    assert.match(summary, /Replace: same additions, plus 4 node\(s\)\/edge\(s\)/);
    await page.click("#import-cancel");

    await triggerImport(page, "subset.txt");
    await page.click("#import-replace");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes.sort(), ["Andhra Pradesh", "Telugu"]);
  });
});

test("Replace mode removes nodes/edges absent from the TXT, in exactly one undo step, fully reversible", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);
    const before = await page.evaluate(() => window.__kg.history.past.length);

    await triggerImport(page, "subset.txt");
    await page.click("#import-replace");
    await page.waitForTimeout(150);

    const after = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after, before + 1, "Replace is exactly one undo step regardless of how much changed");

    let nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes.sort(), ["Andhra Pradesh", "Telugu"]);
    let edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);

    await page.click("#btn-undo");
    nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.equal(nodes.length, 6, "one Undo restores the full pre-Replace graph");
    edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 4);
  });
});

test("Replace mode preserves position for nodes that survive, and prunes group membership not redeclared", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);
    const beforeAndhra = await page.evaluate(() =>
      window.__kg.state.nodes.find((n) => n.label === "Andhra Pradesh"));

    // subset.txt keeps Andhra Pradesh + Telugu but drops the "South Asian
    // Languages -> Andhra Pradesh : contains" line entirely.
    await triggerImport(page, "subset.txt");
    await page.click("#import-replace");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const andhra = nodes.find((n) => n.label === "Andhra Pradesh");
    assert.equal(andhra.x, beforeAndhra.x);
    assert.equal(andhra.y, beforeAndhra.y);
    assert.deepEqual(andhra.groups, [], "membership not redeclared in the replace TXT must be pruned");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.filter((e) => e.auto).length, 0, "the now-orphaned contains edge must be removed too");
  });
});

test("Cancel on the import dialog applies nothing", async () => {
  await withPage(async (page) => {
    await triggerImport(page, "spec-example.txt");
    await page.click("#import-cancel");
    await page.waitForTimeout(100);
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
    await page.waitForTimeout(100);
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

test("label matching is case-sensitive — a differently-cased label is a distinct node, not a match", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "andhra pradesh"); // lowercase
    await triggerImport(page, "subset.txt"); // has "Andhra Pradesh"
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.equal(labels.length, 3, "distinct casing means a new node, not a match");
    assert.ok(labels.includes("andhra pradesh"));
    assert.ok(labels.includes("Andhra Pradesh"));
  });
});

test("matching requires both label AND type — importing the same label as a different type creates a second, distinct node", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Andhra Pradesh"); // entity

    await triggerImport(page, "andhra-as-group.txt"); // same label, declared as [group]
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 2, "label match alone isn't enough — type must match too");
    const byType = Object.fromEntries(nodes.map((n) => [n.type, n]));
    assert.equal(byType.entity.label, "Andhra Pradesh");
    assert.equal(byType.group.label, "Andhra Pradesh");
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
    await page.click("#import-merge");
    await page.waitForTimeout(150);

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
    await page.click("#import-merge");
    await page.waitForTimeout(150);

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

test("a file with only groups declared and no ## EDGES section at all imports cleanly", async () => {
  await withPage(async (page) => {
    const text = ["## NODES", "Solo Group [group]", "Another Group [group]"].join("\n");
    await dropText(page, text, "groups-only.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 2);
    assert.ok(nodes.every((n) => n.type === "group"));
    assert.equal(edges.length, 0);
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
    await page.click("#import-merge");
    await page.waitForTimeout(150);

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
    await page.click("#import-merge");
    await page.waitForTimeout(150);
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
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes.sort(), ["Andhra Pradesh", "Telugu"], "Telugu is back after re-merging");
    const newTelugu = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Telugu"));
    assert.notEqual(newTelugu.id, telugu.id, "the re-created node gets a fresh id, not the old deleted one");
  });
});

test("merge adds a new member to an already-existing group (matched by label) via a contains line", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 300, 300, "South Asian Languages");
    const existingGroup = await page.evaluate(() => window.__kg.state.nodes[0]);

    const text = [
      "## NODES",
      "South Asian Languages [group]",
      "Kannada",
      "",
      "## EDGES",
      "South Asian Languages -> Kannada : contains",
    ].join("\n");
    await dropText(page, text, "new-member.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 2, "matched the existing group by label — did not create a duplicate group node");
    const group = nodes.find((n) => n.label === "South Asian Languages");
    const kannada = nodes.find((n) => n.label === "Kannada");
    assert.equal(group.id, existingGroup.id, "the pre-existing group node itself is untouched, just its membership grows");
    assert.deepEqual(kannada.groups, [group.id]);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    const autoEdge = edges.find((e) => e.auto);
    assert.equal(autoEdge.source, group.id);
    assert.equal(autoEdge.target, kannada.id);
  });
});

// A drag-based membership change is guarded against giving a node a
// spurious second, direct membership in a bigger ancestor group when it's
// already nested in a smaller group inside that same ancestor — see the
// updateGroupMembership() fix/tests in phase2.spec.mjs and
// group-move.spec.mjs. TXT import establishes membership from declared
// `contains` lines rather than geometry, but a file can just as easily
// declare the same redundant relationship directly, so it needs the same
// guard through a different mechanism (declared/known group-to-group
// nesting, not rectFullyContains()).
test("a TXT file declaring a leaf's containment in both an inner AND an outer (ancestor) group keeps only the innermost, real membership", async () => {
  await withPage(async (page) => {
    const text = [
      "## NODES",
      "Outer [group]",
      "Inner [group]",
      "Leaf",
      "",
      "## EDGES",
      "Outer -> Inner : contains",
      "Inner -> Leaf : contains",
      "Outer -> Leaf : contains", // redundant — Leaf is already transitively in Outer via Inner
    ].join("\n");
    await dropText(page, text, "redundant-nesting.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const outer = nodes.find((n) => n.label === "Outer");
    const inner = nodes.find((n) => n.label === "Inner");
    const leaf = nodes.find((n) => n.label === "Leaf");
    assert.deepEqual(inner.groups, [outer.id], "Inner really is nested in Outer");
    assert.deepEqual(leaf.groups, [inner.id], "Leaf keeps only its real, innermost membership — not also a direct one in Outer");

    const autoEdges = await page.evaluate(() => window.__kg.state.edges.filter((e) => e.auto));
    assert.equal(autoEdges.length, 2, "exactly Outer->Inner and Inner->Leaf — no redundant Outer->Leaf edge");
    assert.ok(!autoEdges.some((e) => e.source === outer.id && e.target === leaf.id), "no direct Outer->Leaf contains edge");
  });
});

test("the same redundant-nesting file imports identically regardless of which order the contains lines appear in", async () => {
  await withPage(async (page) => {
    const text = [
      "## NODES",
      "Outer [group]",
      "Inner [group]",
      "Leaf",
      "",
      "## EDGES",
      "Outer -> Leaf : contains", // the redundant line declared FIRST this time
      "Outer -> Inner : contains",
      "Inner -> Leaf : contains",
    ].join("\n");
    await dropText(page, text, "redundant-nesting-reordered.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const outer = nodes.find((n) => n.label === "Outer");
    const inner = nodes.find((n) => n.label === "Inner");
    const leaf = nodes.find((n) => n.label === "Leaf");
    assert.deepEqual(leaf.groups, [inner.id], "same result no matter the line order in the file");
    const autoEdges = await page.evaluate(() => window.__kg.state.edges.filter((e) => e.auto));
    assert.equal(autoEdges.length, 2);
  });
});

test("a leaf declared as a member of two genuinely separate (non-nested) groups still gets both memberships from a TXT import", async () => {
  await withPage(async (page) => {
    const text = [
      "## NODES",
      "GroupA [group]",
      "GroupB [group]",
      "Leaf",
      "",
      "## EDGES",
      "GroupA -> Leaf : contains",
      "GroupB -> Leaf : contains",
    ].join("\n");
    await dropText(page, text, "two-separate-groups.txt");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const groupA = nodes.find((n) => n.label === "GroupA");
    const groupB = nodes.find((n) => n.label === "GroupB");
    const leaf = nodes.find((n) => n.label === "Leaf");
    assert.equal(leaf.groups.length, 2, "neither group is an ancestor of the other, so this is legitimate overlapping membership");
    assert.ok(leaf.groups.includes(groupA.id) && leaf.groups.includes(groupB.id));

    const autoEdges = await page.evaluate(() => window.__kg.state.edges.filter((e) => e.auto));
    assert.equal(autoEdges.length, 2, "both contains edges are real, not redundant");
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
