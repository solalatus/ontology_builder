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
  try {
    await fn(page, downloads);
  } finally {
    await browser.close();
  }
  assert.deepEqual(consoleErrors, [], "expected no console/page errors during the test");
}

async function saveVersion(page, graphName) {
  await page.click("#btn-save-version");
  const needsName = await page.locator(".kg-inline-input").count();
  if (needsName && graphName !== undefined) {
    await page.locator(".kg-inline-input").fill(graphName);
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
  }
}

async function readDownload(dl) {
  const stream = await dl.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

test("first Save Version prompts for a graph name; subsequent saves don't re-prompt", async () => {
  await withDownloadPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");

    await page.click("#btn-save-version");
    assert.equal(await page.locator(".kg-inline-input").count(), 1, "first save should prompt for a name");
    await page.locator(".kg-inline-input").fill("My Graph");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    await page.click("#btn-save-version");
    await page.waitForTimeout(100);
    assert.equal(await page.locator(".kg-inline-input").count(), 0, "second save should not re-prompt");
  });
});

test("Escape while the graph-name prompt is open cancels the save entirely — no meta, no downloads", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-save-version");
    await page.waitForSelector(".kg-inline-input");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 0);
    const meta = await page.evaluate(() => window.__kg.state.meta);
    assert.equal(meta, null);
  });
});

test("Save Version writes exactly two downloads, both with the versioned filename convention", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await saveVersion(page, "Frankfurt AI Ontology");
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 2);
    const names = downloads.map((d) => d.suggestedFilename()).sort();
    assert.match(names[0], /^Frankfurt-AI-Ontology_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.json$/);
    assert.match(names[1], /^Frankfurt-AI-Ontology_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.txt$/);
  });
});

test("graph name is sanitized for filename safety (spaces and punctuation)", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await saveVersion(page, "  My!! Graph///Name  ");
    await page.waitForTimeout(200);

    const jsonName = downloads.find((d) => d.suggestedFilename().endsWith(".json")).suggestedFilename();
    assert.ok(!/[!/\s]/.test(jsonName), `filename should have no spaces/slashes/bangs: ${jsonName}`);
    assert.match(jsonName, /^My-GraphName_v0001_/); // whitespace -> '-', other unsafe chars just stripped
  });
});

test("the JSON export matches Section 5.1's schema exactly and round-trips through JSON.parse", async () => {
  await withDownloadPage(async (page, downloads) => {
    await page.click("#btn-add-group");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 600, box.y + 400);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("South Asian Languages");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    await addNodeViaDblClick(page, 250, 250, "Andhra Pradesh");
    await addNodeViaDblClick(page, 650, 250, "Telugu");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "language used");
    await page.evaluate(() => window.__kg.actions.setMode("idle")); // Connect mode is sticky
    await dragNode(page, 250, 250, 550, 400); // Andhra Pradesh into the group

    await saveVersion(page, "South Asia");
    await page.waitForTimeout(200);

    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const parsed = JSON.parse(await readDownload(jsonDl));

    assert.equal(parsed.meta.format_version, 1);
    assert.match(parsed.meta.graph_id, /^[0-9a-f-]{36}$/i);
    assert.equal(parsed.meta.version, 1);
    assert.match(parsed.meta.created, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal(parsed.meta.created, parsed.meta.saved); // same instant, first save

    assert.equal(parsed.nodes.length, 3);
    const group = parsed.nodes.find((n) => n.type === "group");
    const member = parsed.nodes.find((n) => n.label === "Andhra Pradesh");
    const other = parsed.nodes.find((n) => n.label === "Telugu");
    assert.equal(group.boundary_mode, "manual");
    assert.deepEqual(member.groups, [group.id]);
    assert.deepEqual(other.groups, []);
    for (const n of [group, member, other]) {
      assert.ok("x" in n && "y" in n && "w" in n && "h" in n && "notes" in n);
    }
    assert.equal(member.notes, null);

    assert.equal(parsed.edges.length, 2);
    const relEdge = parsed.edges.find((e) => !e.auto);
    const containsEdge = parsed.edges.find((e) => e.auto);
    assert.equal(relEdge.relation, "language used");
    assert.equal(relEdge.directed, true);
    assert.equal(containsEdge.relation, "contains");
    assert.equal(containsEdge.source, group.id);
    assert.equal(containsEdge.target, member.id);
  });
});

test("the TXT export matches Section 5.2's grammar exactly, including the contains line", async () => {
  await withDownloadPage(async (page, downloads) => {
    await page.click("#btn-add-group");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 600, box.y + 400);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("South Asian Languages");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    await addNodeViaDblClick(page, 250, 250, "Andhra Pradesh");
    await addNodeViaDblClick(page, 650, 250, "Telugu");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "language used");
    await page.evaluate(() => window.__kg.actions.setMode("idle")); // Connect mode is sticky
    await dragNode(page, 250, 250, 550, 400);

    await saveVersion(page, "South Asia");
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
    assert.deepEqual(nodesSection.sort(), ["Andhra Pradesh", "South Asian Languages [group]", "Telugu"].sort());

    const edgesStart = lines.indexOf("## EDGES") + 1;
    const edgesSection = lines.slice(edgesStart).filter((l) => l.length > 0);
    assert.deepEqual(
      edgesSection.sort(),
      ["Andhra Pradesh -> Telugu : language used", "South Asian Languages -> Andhra Pradesh : contains"].sort()
    );
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

    await saveVersion(page, "Diplomacy");
    await page.waitForTimeout(200);

    const txtDl = downloads.find((d) => d.suggestedFilename().endsWith(".txt"));
    const text = await readDownload(txtDl);
    assert.ok(text.includes("Guatemala <-> European Union : diplomatic relation"));
  });
});

test("saving twice increments the version number monotonically, both in the filename and the JSON meta", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await saveVersion(page, "Repeat Test");
    await page.waitForTimeout(200);
    await page.click("#btn-save-version"); // no name prompt this time
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 4);
    const jsonNames = downloads.filter((d) => d.suggestedFilename().endsWith(".json")).map((d) => d.suggestedFilename());
    assert.ok(jsonNames.some((n) => n.includes("_v0001_")));
    assert.ok(jsonNames.some((n) => n.includes("_v0002_")));

    const secondJson = downloads.filter((d) => d.suggestedFilename().endsWith(".json"))[1];
    const parsed = JSON.parse(await readDownload(secondJson));
    assert.equal(parsed.meta.version, 2);
  });
});

test("graph_id, version, and graph_name survive a reload and keep incrementing across sessions", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await saveVersion(page, "Persistent Graph");
    await page.waitForTimeout(200);
    const firstGraphId = await page.evaluate(() => window.__kg.state.meta.graph_id);
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.meta !== null);

    await page.click("#btn-save-version"); // should NOT prompt for a name again
    await page.waitForTimeout(300);

    assert.equal(downloads.length, 4);
    const secondJson = downloads.filter((d) => d.suggestedFilename().endsWith(".json"))[1];
    const parsed = JSON.parse(await readDownload(secondJson));
    assert.equal(parsed.meta.graph_id, firstGraphId, "graph_id must not change across sessions");
    assert.equal(parsed.meta.version, 2, "version continues from where it left off, not reset to 1");
  });
});

test("Save Version does not create an undo step — it's an export, not a graph mutation", async () => {
  await withDownloadPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const before = await page.evaluate(() => window.__kg.history.past.length);
    await saveVersion(page, "No Undo Test");
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after, before);
  });
});

test("saving an empty graph produces valid, structurally-correct (empty) JSON and TXT", async () => {
  await withDownloadPage(async (page, downloads) => {
    // Save Version isn't gated on having content, unlike Clear.
    await saveVersion(page, "Empty Graph");
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 2);
    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const parsed = JSON.parse(await readDownload(jsonDl));
    assert.deepEqual(parsed.nodes, []);
    assert.deepEqual(parsed.edges, []);

    const txtDl = downloads.find((d) => d.suggestedFilename().endsWith(".txt"));
    const text = await readDownload(txtDl);
    assert.ok(text.includes("## NODES\n\n## EDGES\n"));
  });
});
