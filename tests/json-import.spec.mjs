import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode, APP_URL } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// Canonical JSON import — spec.md §5.5.
//
// The format this covers was write-only for the app's whole life before this
// suite existed: Save Version wrote a full-fidelity `.json` that no code path
// could read back, so the one format documented as "canonical, full-fidelity,
// the source of truth" was the one you could not reopen. These tests exist to
// keep the round trip closed — most of them assert that what comes back is
// byte-for-byte what went out, because "it imported something" is exactly the
// bar the old TXT-only path already cleared while still losing every
// coordinate on the canvas.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.resolve(__dirname, "fixtures", name);
const readFixture = (name) => fs.readFileSync(fixture(name), "utf8");

async function importFixture(page, name) {
  await page.setInputFiles("#import-file-input", fixture(name));
  await page.waitForSelector("#import-overlay", { state: "visible" });
}

// Drives an import from inline text under an arbitrary filename, without
// touching disk — same synthetic-DataTransfer technique phase6.spec.mjs uses.
async function dropText(page, text, filename) {
  await page.evaluate(({ t, name }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([t], name, { type: "application/json" }));
    document.getElementById("canvas").dispatchEvent(
      new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { t: text, name: filename });
  await page.waitForSelector("#import-overlay", { state: "visible" });
}

// Mirrors the local download helpers in phase5.spec.mjs / agent-ontology-*:
// the round-trip test has to go through the real Save Version pipeline, not
// call the export builder directly, since the point is that what the app
// *writes to disk* is what it can read back.
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

const graphState = (page) => page.evaluate(() => ({
  nodes: window.__kg.state.nodes,
  edges: window.__kg.state.edges,
  rules: window.__kg.state.rules,
  actions: window.__kg.state.actions,
  meta: window.__kg.state.meta,
  graphName: window.__kg.state.graphName,
}));

// --------------------------------------------------------------------------
// The round trip itself
// --------------------------------------------------------------------------

test("Save Version's own JSON output re-imports into an identical graph", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 200, 200, "Alpha");
    await addNodeViaDblClick(page, 600, 200, "Beta");
    await createEdgeViaConnectMode(page, 200, 200, 600, 200, "leads to");
    await page.evaluate(() => {
      const [alpha] = window.__kg.state.nodes;
      alpha.meaning = "The first one.";
      alpha.aliases = ["first", "a"];
      alpha.properties = [{ id: "p_x", name: "amount", type: "number", unit: "EUR", allowed: null }];
      const rule = window.__kg.actions.createRule("isBig", ["amount > 100"]);
      window.__kg.actions.createAction("escalate", alpha.id, [rule.id], "escalated", "ticket exists");
    });

    await page.click("#btn-save-version");
    await page.waitForTimeout(250);
    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    assert.ok(jsonDl, "Save Version must have written a .json");
    const exported = await readDownload(jsonDl);
    const before = await graphState(page);

    await dropText(page, exported, jsonDl.suggestedFilename());
    await page.click("#import-replace");
    await page.waitForTimeout(150);
    const after = await graphState(page);

    assert.deepEqual(after.nodes, before.nodes, "nodes must survive the round trip untouched");
    assert.deepEqual(after.edges, before.edges, "edges must survive the round trip untouched");
    assert.deepEqual(after.rules, before.rules);
    assert.deepEqual(after.actions, before.actions);
    assert.equal(after.graphName, before.graphName);
    assert.equal(after.meta.graph_id, before.meta.graph_id);
    assert.equal(after.meta.version, before.meta.version, "reopening a save is not itself a new version");
  });
});

test("Replace restores coordinates exactly rather than re-laying out", async () => {
  await withPage(async (page) => {
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const byLabel = Object.fromEntries(nodes.map((n) => [n.label, n]));
    // The exact values from the fixture — any autolayout pass would move these.
    assert.equal(byLabel["Ügyfélkérdés"].x, 40);
    assert.equal(byLabel["Ügyfélkérdés"].y, 80);
    assert.equal(byLabel["Dokumentáció"].x, 400);
    assert.equal(byLabel["Válaszvázlat"].x, 220);
    // Non-default box geometry has to survive too, not just position.
    assert.equal(byLabel["Válaszvázlat"].w, 200);
    assert.equal(byLabel["Válaszvázlat"].h, 80);
  });
});

test("Replace preserves ids, so edges and actions keep pointing at the right things", async () => {
  await withPage(async (page) => {
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const s = await graphState(page);
    assert.deepEqual(s.nodes.map((n) => n.id), ["n1", "n2", "n7"]);
    assert.deepEqual(s.edges.map((e) => e.id), ["e1", "e4"]);
    assert.deepEqual(s.rules.map((r) => r.id), ["r1", "r3"]);
    assert.deepEqual(s.actions.map((a) => a.id), ["a1", "a2"]);
    assert.equal(s.edges[0].source, "n1");
    assert.equal(s.edges[0].target, "n2");
    assert.equal(s.actions[0].inputClassId, "n1");
    assert.deepEqual(s.actions[0].preconditions, ["r1"]);
  });
});

test("Accented text, aliases and property allowed-lists all survive intact", async () => {
  await withPage(async (page) => {
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const s = await graphState(page);
    const q = s.nodes.find((n) => n.label === "Ügyfélkérdés");
    assert.equal(q.meaning, "Egy ügyféltől érkező konkrét kérdés.");
    assert.deepEqual(q.aliases, ["kérdés", "fórumkérdés"]);
    assert.deepEqual(q.properties.map((p) => p.name), ["kérdésSzöveg", "állapot"]);
    assert.deepEqual(q.properties[1].allowed, ["megválaszolt", "megválaszolatlan"]);
    assert.equal(s.edges[0].meaning, "A kérdés megválaszolásához használt forrás.");
    assert.deepEqual(s.edges[0].aliases, ["forrása"]);
    assert.equal(s.edges[1].directed, false, "an undirected edge must not silently become directed");
    assert.deepEqual(s.rules[0].conditions, ["állapot == megválaszolatlan", "van legalább egy forrás"]);
    assert.equal(s.actions[1].verification, "Az állapot megválaszolt.");
  });
});

// --------------------------------------------------------------------------
// Identity: version chain, graph name, id counters
// --------------------------------------------------------------------------

// Subject to the same environment-specific Unicode-`download`-attribute
// Chromium quirk documented at tests/filename-sanitization.spec.mjs's
// "An accented graph name reaches the saved filenames intact" test — this
// fixture's accented graph name can trip the identical browser-side issue
// in an affected environment. Not an app bug; left as-is for the same
// reasons given there.
test("A restore continues the file's version series instead of starting a new graph", async () => {
  await withDownloadPage(async (page, downloads) => {
    await importFixture(page, "accented-roundtrip.json");
    // Empty canvas, so Replace is hidden and the single offered action is
    // itself the full restore — see "On an empty canvas..." above.
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const meta = await page.evaluate(() => window.__kg.state.meta);
    assert.equal(meta.graph_id, "3f2a1c40-0000-4000-8000-abcdefabcdef");
    assert.equal(meta.version, 7, "the restored graph is the same graph, not a fresh one");
    assert.equal(meta.created, "2026-01-02T03:04:00Z");

    // The next Save Version must continue at v0008, not restart at v0001.
    await page.click("#btn-save-version");
    await page.waitForTimeout(250);
    assert.equal(downloads.length, 3);
    for (const dl of downloads) assert.match(dl.suggestedFilename(), /_v0008_/);
  });
});

test("The graph name comes back from meta.graph_name", async () => {
  await withPage(async (page) => {
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    assert.equal(await page.evaluate(() => window.__kg.state.graphName), "Ügyfélkérdés ontológia");
    assert.equal(await page.locator("#graph-title").textContent(), "Ügyfélkérdés ontológia");
  });
});

test("An export written before meta.graph_name recovers its name from the filename", async () => {
  await withPage(async (page) => {
    await importFixture(page, "legacy-named_v0007_2026-03-04T0506Z.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    assert.equal(await page.evaluate(() => window.__kg.state.graphName), "legacy-named");
  });
});

test("A filename that doesn't match the versioned convention leaves the name alone", async () => {
  await withPage(async (page) => {
    const text = readFixture("legacy-named_v0007_2026-03-04T0506Z.json");
    const nameBefore = await page.evaluate(() => window.__kg.state.graphName);
    await dropText(page, text, "some-random-export.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => window.__kg.state.graphName), nameBefore);
  });
});

// This is the failure mode that corrupts a graph silently rather than
// loudly: restore nodes n1..n7 while the id counter still sits at 1, and the
// next node the user adds is a *second* n1 — after which every id-keyed
// lookup (edge endpoints, action inputs, selection, undo) resolves to
// whichever of the two find() reaches first.
test("Id counters are lifted clear of the restored ids", async () => {
  await withPage(async (page) => {
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    // Near the canvas's own corner, not its old (700, 500) near-center spot:
    // fitViewToContent() (issue #64 follow-up) now recenters/rescales the
    // camera onto the just-restored graph, and that graph's own small
    // footprint ends up comfortably centered — a hardcoded near-center
    // screen coordinate that used to be empty canvas before this change can
    // now land on top of one of the fixture's own nodes instead. A corner
    // stays clear of the fitted (padded, centered) content at this
    // viewport size.
    await addNodeViaDblClick(page, 1100, 750, "Új osztály");
    const ids = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.id));
    assert.equal(new Set(ids).size, ids.length, `duplicate node ids after import: ${ids}`);
    assert.ok(!["n1", "n2", "n7"].includes(ids[ids.length - 1]), `reused a restored id: ${ids}`);

    const ruleIds = await page.evaluate(() => {
      window.__kg.actions.createRule("új", []);
      return window.__kg.state.rules.map((r) => r.id);
    });
    assert.equal(new Set(ruleIds).size, ruleIds.length, `duplicate rule ids after import: ${ruleIds}`);
  });
});

// Reopening a saved file into a fresh session is the primary use of this
// format, and on an empty canvas the dialog hides Replace (there is nothing
// to replace) — so the single remaining button has to perform the full
// restore, or the round trip would be unreachable in exactly the case people
// need it most.
test("On an empty canvas the only offered action is the full restore", async () => {
  await withPage(async (page) => {
    await importFixture(page, "accented-roundtrip.json");
    assert.equal(await page.locator("#import-replace").isVisible(), false);
    assert.match(await page.locator("#import-summary").textContent(), /exactly as saved/i);

    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const s = await graphState(page);
    assert.deepEqual(s.nodes.map((n) => n.id), ["n1", "n2", "n7"], "ids must be preserved, not regenerated");
    assert.equal(s.nodes[0].x, 40, "coordinates must be preserved");
    assert.equal(s.meta.version, 7, "the version chain must be preserved");
    assert.equal(s.graphName, "Ügyfélkérdés ontológia");
  });
});

// --------------------------------------------------------------------------
// Merge semantics
// --------------------------------------------------------------------------

test("Merge keeps an existing node's position but takes the file's content", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 400, "Ügyfélkérdés");
    const placed = await page.evaluate(() => ({ ...window.__kg.state.nodes[0] }));

    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const node = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Ügyfélkérdés"));
    assert.equal(node.id, placed.id, "a label match must update in place, not duplicate");
    assert.equal(node.x, placed.x, "merge must never move a box the user has already positioned");
    assert.equal(node.y, placed.y);
    assert.equal(node.meaning, "Egy ügyféltől érkező konkrét kérdés.", "content comes from the file");
    assert.deepEqual(node.aliases, ["kérdés", "fórumkérdés"]);
  });
});

test("Merge uses a new node's saved position when that space is free", async () => {
  await withPage(async (page) => {
    // Placed far away from every fixture coordinate, so nothing collides.
    await addNodeViaDblClick(page, 900, 700, "Máshol");
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const node = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Dokumentáció"));
    assert.equal(node.x, 400);
    assert.equal(node.y, 80);
  });
});

test("Merge never drops a new box exactly on top of an existing one", async () => {
  await withPage(async (page) => {
    // Occupy the fixture's own (40, 80) slot with a differently-labelled node,
    // so the incoming "Ügyfélkérdés" cannot be placed there.
    await page.evaluate(() => {
      const n = window.__kg.actions.createNode(40, 80, "Foglalt");
      n.w = 160; n.h = 60;
    });
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const incoming = nodes.find((n) => n.label === "Ügyfélkérdés");
    const occupier = nodes.find((n) => n.label === "Foglalt");
    assert.notDeepEqual(
      { x: incoming.x, y: incoming.y }, { x: occupier.x, y: occupier.y },
      "the shelf fallback must kick in when the saved position is taken");
  });
});

test("Merge adds nothing twice when the same file is imported again", async () => {
  await withPage(async (page) => {
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);
    const first = await graphState(page);

    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);
    const second = await graphState(page);

    assert.equal(second.nodes.length, first.nodes.length);
    assert.equal(second.edges.length, first.edges.length);
    assert.equal(second.rules.length, first.rules.length);
    assert.equal(second.actions.length, first.actions.length);
  });
});

test("Merge leaves content the file doesn't mention alone", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 800, 600, "Sajátom");
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(labels.includes("Sajátom"), "merge must never remove anything");
  });
});

test("Merge into a non-empty canvas leaves the existing graph's identity untouched", async () => {
  // The highest-risk edge case for a preserve-the-ids importer: merging a
  // second, unrelated graph's file must never let that file's own
  // graph_id/version/created hijack the canvas's existing identity. Only
  // the full-restore path (replace, or merge into an empty canvas) may
  // touch state.meta at all -- see commitJsonImport's own fullRestore
  // branching.
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 800, 600, "Sajátom");
    const before = await page.evaluate(() => window.__kg.state.meta);

    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const after = await page.evaluate(() => window.__kg.state.meta);
    assert.deepEqual(after, before, "merging into a non-empty canvas must never adopt the file's own graph_id/version");
  });
});

test("Merge is exactly one undo step, regardless of how many entities it touches", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 800, 600, "Sajátom");
    const before = await page.evaluate(() => window.__kg.history.past.length);

    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-merge");
    await page.waitForFunction(() => window.__kg.state.nodes.length === 4);

    const after = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after - before, 1, "merge must cost exactly one undo step no matter how many nodes/edges it adds");

    await page.click("#btn-undo");
    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(labels, ["Sajátom"], "one undo must fully revert the merge, leaving only what predated it");
  });
});

test("Replace discards content the file doesn't mention", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 800, 600, "Sajátom");
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-replace");
    await page.waitForTimeout(150);

    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(labels, ["Ügyfélkérdés", "Dokumentáció", "Válaszvázlat"]);
  });
});

// --------------------------------------------------------------------------
// Undo
// --------------------------------------------------------------------------

test("A full JSON restore is a single undo step, name and version included", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Eredeti");
    const before = await graphState(page);

    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-replace");
    await page.waitForTimeout(150);

    await page.click("#btn-undo");
    await page.waitForTimeout(100);
    const after = await graphState(page);

    assert.deepEqual(after.nodes.map((n) => n.label), before.nodes.map((n) => n.label));
    assert.deepEqual(after.meta, before.meta, "undo must roll back the version chain too");
    assert.equal(after.graphName, before.graphName);
    assert.equal(await page.locator("#graph-title").textContent(), before.graphName);
  });
});

test("Redo re-applies the restore", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Eredeti");
    await importFixture(page, "accented-roundtrip.json");
    await page.click("#import-replace");
    await page.waitForTimeout(150);
    await page.click("#btn-undo");
    await page.waitForTimeout(100);
    await page.click("#btn-redo");
    await page.waitForTimeout(100);

    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(labels, ["Ügyfélkérdés", "Dokumentáció", "Válaszvázlat"]);
    assert.equal(await page.evaluate(() => window.__kg.state.meta.version), 7);
  });
});

// --------------------------------------------------------------------------
// Tolerance: hand-edited and damaged files
// --------------------------------------------------------------------------

test("A dangling edge is dropped with a warning instead of breaking the import", async () => {
  await withPage(async (page) => {
    const doc = {
      nodes: [{ id: "n1", label: "A" }],
      edges: [{ id: "e1", source: "n1", target: "nope", relation: "r" }],
    };
    await dropText(page, JSON.stringify(doc), "damaged.json");
    const summary = await page.locator("#import-summary").textContent();
    assert.match(summary, /dangling/i);
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const s = await graphState(page);
    assert.equal(s.nodes.length, 1);
    assert.equal(s.edges.length, 0);
  });
});

test("A duplicated node id is repaired rather than allowed to shadow", async () => {
  await withPage(async (page) => {
    const doc = { nodes: [{ id: "n1", label: "A" }, { id: "n1", label: "B" }] };
    await dropText(page, JSON.stringify(doc), "dupes.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const ids = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.id));
    assert.equal(new Set(ids).size, 2, `ids must stay unique: ${ids}`);
  });
});

test("A node with a null width is restored at the default size, not zero-width", async () => {
  await withPage(async (page) => {
    const doc = { nodes: [{ id: "n1", label: "A", x: 10, y: 10, w: null, h: null }] };
    await dropText(page, JSON.stringify(doc), "nullsize.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.ok(node.w > 0, "a zero-width box is invisible and unclickable");
    assert.ok(node.h > 0);
  });
});

test("Nodes with no label are skipped, the rest still import", async () => {
  await withPage(async (page) => {
    const doc = { nodes: [{ id: "n1" }, { id: "n2", label: "Kept" }] };
    await dropText(page, JSON.stringify(doc), "partial.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(labels, ["Kept"]);
  });
});

test("An action pointing at a class the file doesn't contain imports without it", async () => {
  await withPage(async (page) => {
    const doc = {
      nodes: [{ id: "n1", label: "A" }],
      actions: [{ id: "a1", name: "act", inputClassId: "n99", preconditions: ["r99"], effect: "e", verification: "v" }],
    };
    await dropText(page, JSON.stringify(doc), "orphan-action.json");
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    const action = await page.evaluate(() => window.__kg.state.actions[0]);
    assert.equal(action.inputClassId, null);
    assert.deepEqual(action.preconditions, []);
    assert.equal(action.effect, "e");
  });
});

test("A graph with no nodes at all is reported, not silently imported", async () => {
  await withPage(async (page) => {
    await dropText(page, JSON.stringify({ meta: { version: 1 }, nodes: [], edges: [] }), "empty.json");
    const summary = await page.locator("#import-summary").textContent();
    assert.match(summary, /nothing to import/i);
    assert.equal(await page.locator("#import-merge").isVisible(), false);
    assert.equal(await page.locator("#import-replace").isVisible(), false);
  });
});

test("A bare {} is treated the same as an explicitly-empty graph, not an error", async () => {
  await withPage(async (page) => {
    await dropText(page, "{}", "bare.json");
    const summary = await page.locator("#import-summary").textContent();
    assert.match(summary, /nothing to import/i);
    assert.equal(await page.locator("#import-merge").isVisible(), false);
    assert.equal(await page.locator("#import-replace").isVisible(), false);
  });
});

test("A top-level JSON array is rejected with a clear message instead of crashing", async () => {
  await withPage(async (page) => {
    await dropText(page, "[1,2,3]", "array.json");
    const summary = await page.locator("#import-summary").textContent();
    assert.match(summary, /not a JSON object/i);
    assert.equal(await page.locator("#import-merge").isVisible(), false);
    assert.equal(await page.locator("#import-replace").isVisible(), false);
  });
});

test("A large graph survives the round trip", async () => {
  await withPage(async (page) => {
    const doc = { meta: { format_version: 1, graph_id: "big", version: 1 }, nodes: [], edges: [] };
    for (let i = 1; i <= 200; i++) {
      doc.nodes.push({ id: `n${i}`, label: `Node ${i}`, x: (i % 20) * 200, y: Math.floor(i / 20) * 120, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
    }
    for (let i = 1; i < 200; i++) {
      doc.edges.push({ id: `e${i}`, source: `n${i}`, target: `n${i + 1}`, relation: "next", directed: true, meaning: null, aliases: [] });
    }
    await dropText(page, JSON.stringify(doc), "big_v0001_2026-01-01T0000Z.json");
    await page.click("#import-merge"); // empty canvas — this is the restore path
    await page.waitForTimeout(400);

    const s = await graphState(page);
    assert.equal(s.nodes.length, 200);
    assert.equal(s.edges.length, 199);
    assert.equal(s.nodes[41].x, (42 % 20) * 200, "coordinates must not be reflowed at scale either");
  });
});
