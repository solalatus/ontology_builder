import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL, addNodeViaDblClick, addNodeViaButton, dragNode, createEdgeViaConnectMode } from "./lib/page.mjs";

// Phase 5 needs to intercept real browser downloads, which the shared
// withPage() helper doesn't set up (acceptDownloads) and doesn't expose a
// download-collecting hook for — so this file drives its own page lifecycle
// instead of reusing withPage, following the same console-error-checking
// discipline by hand.
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
  // The app's real default UI language is Hungarian; this suite (like the
  // shared withPage() in lib/page.mjs) pins English so its existing text
  // assertions stay decoupled from the language feature. Pinned via
  // evaluate() post-load rather than addInitScript — see the comment in
  // lib/page.mjs's withPage() for why an addInitScript localStorage write
  // racing with page.reload() is intermittently destructive to Tier 1 data
  // on file:// origins.
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  try {
    await fn(page, downloads);
  } finally {
    await browser.close();
  }
  assert.deepEqual(consoleErrors, [], "expected no console/page errors during the test");
}

// The graph name is an always-visible, always-editable title (click to
// rename), independent of Save Version — not a save-time prompt.
async function setGraphTitle(page, name) {
  await page.click("#graph-title");
  await page.waitForSelector(".kg-inline-input");
  await page.locator(".kg-inline-input").fill(name);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".kg-inline-input", { state: "detached" });
}

async function saveVersion(page) {
  await page.click("#btn-save-version");
}

async function readDownload(dl) {
  const stream = await dl.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

test("the graph title defaults to 'Untitled Graph' and is visible without any prior action", async () => {
  await withDownloadPage(async (page) => {
    const text = await page.locator("#graph-title").textContent();
    assert.equal(text, "Untitled Graph");
    const graphName = await page.evaluate(() => window.__kg.state.graphName);
    assert.equal(graphName, "Untitled Graph");
  });
});

test("clicking the title opens a rename field pre-filled with the current name; committing updates both state and the DOM", async () => {
  await withDownloadPage(async (page) => {
    await page.click("#graph-title");
    const value = await page.locator(".kg-inline-input").inputValue();
    assert.equal(value, "Untitled Graph");
    await page.locator(".kg-inline-input").fill("Frankfurt AI Ontology");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    assert.equal(await page.evaluate(() => window.__kg.state.graphName), "Frankfurt AI Ontology");
    assert.equal(await page.locator("#graph-title").textContent(), "Frankfurt AI Ontology");
  });
});

test("Enter/Space on the focused title also opens the rename field (keyboard access, not just click)", async () => {
  await withDownloadPage(async (page) => {
    await page.locator("#graph-title").focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".kg-inline-input").count(), 1);
    await page.keyboard.press("Escape");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    await page.locator("#graph-title").focus();
    await page.keyboard.press(" ");
    assert.equal(await page.locator(".kg-inline-input").count(), 1);
  });
});

test("Escape while renaming cancels without changing the name", async () => {
  await withDownloadPage(async (page) => {
    await page.click("#graph-title");
    await page.locator(".kg-inline-input").fill("Should not stick");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    assert.equal(await page.evaluate(() => window.__kg.state.graphName), "Untitled Graph");
    assert.equal(await page.locator("#graph-title").textContent(), "Untitled Graph");
  });
});

test("committing an empty/whitespace-only name reverts to 'Untitled Graph' rather than going blank", async () => {
  await withDownloadPage(async (page) => {
    await setGraphTitle(page, "   ");
    assert.equal(await page.evaluate(() => window.__kg.state.graphName), "Untitled Graph");
    assert.equal(await page.locator("#graph-title").textContent(), "Untitled Graph");
  });
});

test("a renamed graph title survives a reload", async () => {
  await withDownloadPage(async (page) => {
    await setGraphTitle(page, "Persistent Title");
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.graphName === "Persistent Title");

    assert.equal(await page.locator("#graph-title").textContent(), "Persistent Title");
  });
});

test("Save Version never blocks on a prompt — clicking it immediately produces three downloads using the current title", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await saveVersion(page);
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 3);
    const names = downloads.map((d) => d.suggestedFilename()).sort();
    assert.match(names[0], /^Untitled-Graph_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.domain\.yaml$/);
    assert.match(names[1], /^Untitled-Graph_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.json$/);
    assert.match(names[2], /^Untitled-Graph_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.txt$/);
  });
});

test("Save Version writes exactly three downloads named after a custom title, per the versioned filename convention", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await setGraphTitle(page, "Frankfurt AI Ontology");
    await saveVersion(page);
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 3);
    const names = downloads.map((d) => d.suggestedFilename()).sort();
    assert.match(names[0], /^Frankfurt-AI-Ontology_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.domain\.yaml$/);
    assert.match(names[1], /^Frankfurt-AI-Ontology_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.json$/);
    assert.match(names[2], /^Frankfurt-AI-Ontology_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.txt$/);
  });
});

test("graph name is sanitized for filename safety (spaces and punctuation) at save time, not at rename time", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await setGraphTitle(page, "  My!! Graph///Name  ");
    // The displayed title keeps the raw, human-readable form...
    assert.equal(await page.locator("#graph-title").textContent(), "My!! Graph///Name");

    await saveVersion(page);
    await page.waitForTimeout(200);

    // ...only the filename is sanitized.
    const jsonName = downloads.find((d) => d.suggestedFilename().endsWith(".json")).suggestedFilename();
    assert.ok(!/[!/\s]/.test(jsonName), `filename should have no spaces/slashes/bangs: ${jsonName}`);
    assert.match(jsonName, /^My-GraphName_v0001_/); // whitespace -> '-', other unsafe chars just stripped
  });
});

test("the JSON export matches Section 5.1's schema exactly and round-trips through JSON.parse", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 250, 250, "Andhra Pradesh");
    await addNodeViaDblClick(page, 650, 250, "Telugu");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "language used");
    await page.evaluate(() => window.__kg.actions.setMode("idle")); // Connect mode is sticky

    await saveVersion(page);
    await page.waitForTimeout(200);

    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const parsed = JSON.parse(await readDownload(jsonDl));

    assert.equal(parsed.meta.format_version, 1);
    assert.match(parsed.meta.graph_id, /^[0-9a-f-]{36}$/i);
    assert.equal(parsed.meta.version, 1);
    assert.match(parsed.meta.created, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal(parsed.meta.created, parsed.meta.saved); // same instant, first save
    assert.ok(!("graph_name" in parsed.meta), "graph name is filename-only, not part of the canonical meta object");

    assert.equal(parsed.nodes.length, 2);
    const member = parsed.nodes.find((n) => n.label === "Andhra Pradesh");
    const other = parsed.nodes.find((n) => n.label === "Telugu");
    // Agent Ontology (agent_ontology_spec.md §4.1): meaning replaces the
    // old, never-wired notes field; aliases/properties are new.
    for (const n of [member, other]) {
      assert.ok("x" in n && "y" in n && "w" in n && "h" in n && "meaning" in n && "aliases" in n && "properties" in n);
    }
    assert.equal(member.meaning, null);
    assert.deepEqual(member.aliases, []);
    assert.deepEqual(member.properties, []);

    assert.equal(parsed.edges.length, 1);
    const relEdge = parsed.edges[0];
    assert.equal(relEdge.relation, "language used");
    assert.equal(relEdge.directed, true);
    assert.equal(relEdge.meaning, null); // agent_ontology_spec.md §4.2

    // agent_ontology_spec.md §4.3 — additive top-level collections, present
    // and empty when nothing's been authored yet (Phase A has no UI for
    // these; a future phase's tests cover non-empty rules/actions export).
    assert.deepEqual(parsed.rules, []);
    assert.deepEqual(parsed.actions, []);
  });
});

test("the TXT export matches Section 5.2's grammar exactly", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 250, 250, "Andhra Pradesh");
    await addNodeViaDblClick(page, 650, 250, "Telugu");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "language used");
    await page.evaluate(() => window.__kg.actions.setMode("idle")); // Connect mode is sticky

    await saveVersion(page);
    await page.waitForTimeout(200);

    const txtDl = downloads.find((d) => d.suggestedFilename().endsWith(".txt"));
    const text = await readDownload(txtDl);
    const lines = text.split("\n");

    assert.equal(lines[0], "# KG Canvas export");
    assert.equal(lines[1], "# format_version: 1");
    assert.match(lines[2], /^# graph_id: [0-9a-f-]{36}$/i);
    assert.equal(lines[3], "# version: 1");
    assert.match(lines[4], /^# saved: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal(lines[5], "");
    assert.equal(lines[6], "## NODES");

    const nodesSection = lines.slice(7, lines.indexOf("## EDGES") - 1);
    assert.deepEqual(nodesSection.sort(), ["Andhra Pradesh", "Telugu"].sort());

    const edgesStart = lines.indexOf("## EDGES") + 1;
    const edgesSection = lines.slice(edgesStart).filter((l) => l.length > 0);
    assert.deepEqual(edgesSection, ["Andhra Pradesh -> Telugu : language used"]);
  });
});

test("a bidirectional edge exports with <-> in the TXT edge list", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 250, 250, "Guatemala");
    await addNodeViaDblClick(page, 650, 250, "European Union");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "diplomatic relation");
    await page.evaluate(() => window.__kg.actions.setMode("idle")); // Connect mode is sticky
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 460, box.y + 250); // select the new edge (its midpoint)
    await page.click("#sel-toggle-dir"); // flip to bidirectional

    await saveVersion(page);
    await page.waitForTimeout(200);

    const txtDl = downloads.find((d) => d.suggestedFilename().endsWith(".txt"));
    const text = await readDownload(txtDl);
    assert.ok(text.includes("Guatemala <-> European Union : diplomatic relation"));
  });
});

test("saving twice increments the version number monotonically, both in the filename and the JSON meta", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await saveVersion(page);
    await page.waitForTimeout(200);
    await saveVersion(page);
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 6);
    const jsonNames = downloads.filter((d) => d.suggestedFilename().endsWith(".json")).map((d) => d.suggestedFilename());
    assert.ok(jsonNames.some((n) => n.includes("_v0001_")));
    assert.ok(jsonNames.some((n) => n.includes("_v0002_")));

    const secondJson = downloads.filter((d) => d.suggestedFilename().endsWith(".json"))[1];
    const parsed = JSON.parse(await readDownload(secondJson));
    assert.equal(parsed.meta.version, 2);
  });
});

test("graph_id and version survive a reload and keep incrementing across sessions; the renamed title survives too", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await setGraphTitle(page, "Persistent Graph");
    await saveVersion(page);
    await page.waitForTimeout(200);
    const firstGraphId = await page.evaluate(() => window.__kg.state.meta.graph_id);
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.meta !== null);

    assert.equal(await page.locator("#graph-title").textContent(), "Persistent Graph");

    await saveVersion(page);
    await page.waitForTimeout(300);

    assert.equal(downloads.length, 6);
    const secondJson = downloads.filter((d) => d.suggestedFilename().endsWith(".json"))[1];
    const parsed = JSON.parse(await readDownload(secondJson));
    assert.equal(parsed.meta.graph_id, firstGraphId, "graph_id must not change across sessions");
    assert.equal(parsed.meta.version, 2, "version continues from where it left off, not reset to 1");
    const secondName = downloads.filter((d) => d.suggestedFilename().endsWith(".json"))[1].suggestedFilename();
    assert.match(secondName, /^Persistent-Graph_v0002_/);
  });
});

test("Save Version does not create an undo step — it's an export, not a graph mutation", async () => {
  await withDownloadPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const before = await page.evaluate(() => window.__kg.history.past.length);
    await saveVersion(page);
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after, before);
  });
});

test("renaming the graph title also does not create an undo step", async () => {
  await withDownloadPage(async (page) => {
    const before = await page.evaluate(() => window.__kg.history.past.length);
    await setGraphTitle(page, "Renamed");
    const after = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after, before);
  });
});

test("saving an empty graph produces valid, structurally-correct (empty) JSON, TXT, and domain YAML", async () => {
  await withDownloadPage(async (page, downloads) => {
    // Save Version isn't gated on having content, unlike Clear.
    await saveVersion(page);
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 3);
    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const parsed = JSON.parse(await readDownload(jsonDl));
    assert.deepEqual(parsed.nodes, []);
    assert.deepEqual(parsed.edges, []);

    const txtDl = downloads.find((d) => d.suggestedFilename().endsWith(".txt"));
    const text = await readDownload(txtDl);
    assert.ok(text.includes("## NODES\n\n## EDGES\n"));

    const yamlDl = downloads.find((d) => d.suggestedFilename().endsWith(".domain.yaml"));
    const yaml = await readDownload(yamlDl);
    assert.equal(yaml, "classes: {}\nrelationships: []\nrules: {}\nactions: {}\n");
  });
});

test("unicode and special characters in labels/relations survive both JSON and TXT export intact", async () => {
  await withDownloadPage(async (page, downloads) => {
    const label1 = "Café Müller 日本語";
    const label2 = "Zürich <-> Tōkyō";
    const relation = 'says "hello" — 100% sure';
    await addNodeViaDblClick(page, 250, 250, label1);
    await addNodeViaDblClick(page, 650, 250, label2);
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, relation);
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    await saveVersion(page);
    await page.waitForTimeout(200);

    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const parsedJson = JSON.parse(await readDownload(jsonDl));
    assert.ok(parsedJson.nodes.some((n) => n.label === label1));
    assert.ok(parsedJson.nodes.some((n) => n.label === label2));
    assert.equal(parsedJson.edges[0].relation, relation);

    const txtDl = downloads.find((d) => d.suggestedFilename().endsWith(".txt"));
    const text = await readDownload(txtDl);
    assert.ok(text.includes(label1));
    assert.ok(text.includes(label2));
    assert.ok(text.includes(relation));
  });
});

test("undoing an unrelated action after a save does not reset or duplicate the version counter on the next save", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await saveVersion(page); // v1
    await page.waitForTimeout(200);

    await addNodeViaDblClick(page, 600, 300, "Beta");
    await page.click("#btn-undo"); // undo the Beta add — unrelated to meta/version at all

    await saveVersion(page); // v2
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 6);
    const jsonNames = downloads.filter((d) => d.suggestedFilename().endsWith(".json")).map((d) => d.suggestedFilename());
    assert.ok(jsonNames.some((n) => n.includes("_v0001_")));
    assert.ok(jsonNames.some((n) => n.includes("_v0002_")));
    const secondJson = downloads.filter((d) => d.suggestedFilename().endsWith(".json"))[1];
    const parsed = JSON.parse(await readDownload(secondJson));
    assert.equal(parsed.meta.version, 2, "undo must not reset or otherwise perturb the version counter");
    assert.equal(parsed.nodes.length, 1, "Beta's undo should still be reflected — only Alpha remains");
  });
});

test("TXT export lists nodes and edges in creation order, not some other implicit order", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 700, 250, "Zebra");
    await addNodeViaDblClick(page, 250, 250, "Apple");
    await addNodeViaDblClick(page, 450, 450, "Mango");
    await createEdgeViaConnectMode(page, 700, 250, 250, 250, "first edge");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    await createEdgeViaConnectMode(page, 250, 250, 450, 450, "second edge");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    await saveVersion(page);
    await page.waitForTimeout(200);

    const txtDl = downloads.find((d) => d.suggestedFilename().endsWith(".txt"));
    const text = await readDownload(txtDl);
    const nodesIdx = { zebra: text.indexOf("Zebra"), apple: text.indexOf("Apple"), mango: text.indexOf("Mango") };
    assert.ok(nodesIdx.zebra < nodesIdx.apple && nodesIdx.apple < nodesIdx.mango, "nodes listed in creation order");
    const edgesIdx = { first: text.indexOf("first edge"), second: text.indexOf("second edge") };
    assert.ok(edgesIdx.first < edgesIdx.second, "edges listed in creation order");
  });
});
