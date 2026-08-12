import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, applyImport } from "./lib/page.mjs";

// Import routing — which file goes to which parser, and what happens to a
// file that belongs to none of them (spec.md §5.3/§5.5).
//
// The behaviour these lock down replaced a genuinely silent failure: routing
// used to be "does the name end in .yaml/.yml? if not, it's an edge list",
// so a canonical .json chosen through the file dialog's own "All files"
// escape hatch went to the TXT parser, found no "## NODES" header, produced
// an empty parse, and offered Merge and Replace anyway — with Replace on an
// empty parse standing ready to wipe the graph "to match" a file the app had
// never actually understood.

const detect = (page, filename, text) =>
  page.evaluate(({ f, t }) => window.__kg.formats.detectImportKind(f, t), { f: filename, t: text });

const JSON_DOC = JSON.stringify({
  meta: { format_version: 1, graph_id: "g", version: 1 },
  nodes: [{ id: "n1", label: "A", x: 0, y: 0, w: 160, h: 60, meaning: null, aliases: [], properties: [] }],
  edges: [],
});
const TXT_DOC = "## NODES\nA\nB\n\n## EDGES\nA -> B : rel\n";
const YAML_DOC = "classes:\n  A:\n    meaning: x\n    aliases: []\n    properties: {}\n";

async function dropFile(page, text, filename) {
  await page.evaluate(({ t, name }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([t], name));
    document.getElementById("canvas").dispatchEvent(
      new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { t: text, name: filename });
}

// --------------------------------------------------------------------------
// Extension routing — every case that worked before must still work
// --------------------------------------------------------------------------

test("Extension routing is unchanged for the formats that already worked", async () => {
  await withPage(async (page) => {
    assert.equal(await detect(page, "graph.txt", TXT_DOC), "txt");
    assert.equal(await detect(page, "graph.domain.yaml", YAML_DOC), "yaml");
    assert.equal(await detect(page, "graph.yml", YAML_DOC), "yaml");
    assert.equal(await detect(page, "GRAPH.YAML", YAML_DOC), "yaml");
    assert.equal(await detect(page, "graph.json", JSON_DOC), "json");
  });
});

test("A .txt keeps going to the edge-list parser even when it holds YAML-ish text", async () => {
  await withPage(async (page) => {
    // The extension stays authoritative wherever it isn't provably wrong —
    // only unambiguous JSON overrides it.
    assert.equal(await detect(page, "graph.txt", YAML_DOC), "txt");
  });
});

// --------------------------------------------------------------------------
// Content sniffing — the hole this closes
// --------------------------------------------------------------------------

test("A canonical JSON export is recognized whatever it is called", async () => {
  await withPage(async (page) => {
    assert.equal(await detect(page, "graph.txt", JSON_DOC), "json");
    assert.equal(await detect(page, "graph.yaml", JSON_DOC), "json");
    assert.equal(await detect(page, "graph", JSON_DOC), "json");
    assert.equal(await detect(page, "graph.export", JSON_DOC), "json");
  });
});

test("An extensionless file is sniffed rather than assumed to be an edge list", async () => {
  await withPage(async (page) => {
    assert.equal(await detect(page, "noext", TXT_DOC), "txt");
    assert.equal(await detect(page, "noext", YAML_DOC), "yaml");
  });
});

test("A .json that isn't valid JSON reports the syntax error, not an empty edge list", async () => {
  await withPage(async (page) => {
    assert.equal(await detect(page, "graph.json", '{"nodes": [},'), "invalid-json");
  });
});

test("A file in no supported format is unrecognized", async () => {
  await withPage(async (page) => {
    assert.equal(await detect(page, "data.csv", "a,b,c\n1,2,3\n"), "unknown");
    assert.equal(await detect(page, "notes.md", "# Heading\n\nSome prose.\n"), "unknown");
    assert.equal(await detect(page, "empty", ""), "unknown");
  });
});

// --------------------------------------------------------------------------
// What the dialog does about it
// --------------------------------------------------------------------------

test("An unreadable JSON file offers no import action at all", async () => {
  await withPage(async (page) => {
    await dropFile(page, '{"nodes": [},', "broken.json");
    await page.waitForSelector("#import-overlay", { state: "visible" });

    assert.match(await page.locator("#import-summary").textContent(), /could not be read/i);
    assert.equal(await page.locator("#import-merge").isVisible(), false);
    assert.equal(await page.locator("#import-replace").isVisible(), false);
    assert.equal(await page.locator("#import-cancel").isVisible(), true);
  });
});

test("An unrecognized file says so instead of importing nothing in silence", async () => {
  await withPage(async (page) => {
    await dropFile(page, "a,b,c\n1,2,3\n", "data.csv");
    await page.waitForSelector("#import-overlay", { state: "visible" });

    assert.match(await page.locator("#import-summary").textContent(), /isn't in any format/i);
    assert.equal(await page.locator("#import-merge").isVisible(), false);
    assert.equal(await page.locator("#import-replace").isVisible(), false);
  });
});

test("A well-formed but empty edge list is reported rather than offered", async () => {
  await withPage(async (page) => {
    await dropFile(page, "## NODES\n\n## EDGES\n", "empty.txt");
    await page.waitForSelector("#import-overlay", { state: "visible" });

    assert.match(await page.locator("#import-summary").textContent(), /nothing to import/i);
    assert.equal(await page.locator("#import-merge").isVisible(), false);
  });
});

// The specific accident the old routing invited: Replace against a file the
// app never parsed would have deleted the whole graph "to match" it.
test("An unimportable file cannot be used to wipe the graph", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Keep me");
    await dropFile(page, "a,b,c\n1,2,3\n", "data.csv");
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await page.click("#import-cancel");
    await page.waitForSelector("#import-overlay", { state: "hidden" });

    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(labels, ["Keep me"]);
  });
});

test("The action buttons come back for the next, valid file", async () => {
  await withPage(async (page) => {
    await dropFile(page, "a,b,c\n", "data.csv");
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await page.click("#import-cancel");
    await page.waitForSelector("#import-overlay", { state: "hidden" });

    await dropFile(page, TXT_DOC, "graph.txt");
    await page.waitForSelector("#import-overlay", { state: "visible" });
    assert.equal(await page.locator("#import-merge").isVisible(), true,
      "hiding the buttons for a bad file must not disable them permanently");
  });
});

// --------------------------------------------------------------------------
// Drag-and-drop accepts what the file picker accepts
// --------------------------------------------------------------------------

test("Dropping a .json opens the JSON importer", async () => {
  await withPage(async (page) => {
    await dropFile(page, JSON_DOC, "graph_v0001_2026-01-01T0000Z.json");
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].id, "n1");
  });
});

test("Dropping a file with an unclaimed extension still imports if the content is right", async () => {
  await withPage(async (page) => {
    await dropFile(page, JSON_DOC, "export.bak");
    await page.waitForSelector("#import-overlay", { state: "visible" });
    assert.match(await page.locator("#import-summary").textContent(), /exactly as saved/i);
  });
});

test("The file picker advertises all three importable extensions", async () => {
  await withPage(async (page) => {
    const accept = await page.getAttribute("#import-file-input", "accept");
    for (const ext of [".txt", ".json", ".yaml", ".yml"]) {
      assert.ok(accept.includes(ext), `accept="${accept}" is missing ${ext}`);
    }
  });
});
