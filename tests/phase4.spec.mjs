import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, dragNode, createEdgeViaConnectMode, APP_URL } from "./lib/page.mjs";
import { startStaticServer } from "./lib/server.mjs";
import { launchChromium } from "./lib/browser.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Under file:// (the default withPage origin, and the deployment mode
// Section 2 promises — "opens directly in a browser"), OPFS throws
// SecurityError, so the app falls back to localStorage. This is the path
// most real "just double-click index.html" usage will actually exercise.
// ---------------------------------------------------------------------------

test("under file://, the storage backend resolves to localStorage, not OPFS", async () => {
  await withPage(async (page) => {
    const backend = await page.evaluate(() => window.__kg.storage.detectBackend());
    assert.equal(backend, "localStorage");
  });
});

test("an edit schedules a save; after it settles, localStorage holds the graph payload", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.storage.whenIdle());
    const raw = await page.evaluate(() => localStorage.getItem("kg-canvas-live"));
    assert.ok(raw, "expected a saved payload");
    const parsed = JSON.parse(raw);
    assert.equal(parsed.nodes.length, 1);
    assert.equal(parsed.nodes[0].label, "Alpha");
  });
});

test("reloading the page restores nodes, edges, and groups from the live-save backend", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "relates to");
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 2);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 2);
    assert.deepEqual(nodes.map((n) => n.label).sort(), ["Alpha", "Beta"]);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].relation, "relates to");
  });
});

test("group membership (groups[] and the auto contains edge) survives a reload", async () => {
  await withPage(async (page) => {
    await page.click("#btn-add-group");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 600, box.y + 400);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Group A");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    await addNodeViaDblClick(page, 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400); // commits membership
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 2);

    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.deepEqual(member.groups, [group.id]);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].auto, true);
  });
});

test("id counters persist too: a node added after reload never collides with a restored id", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha"); // n1
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 1);

    await addNodeViaDblClick(page, 600, 300, "Beta"); // should be n2, not n1 again
    const ids = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.id));
    assert.equal(new Set(ids).size, 2, "ids must be unique after a restore");
    assert.ok(!ids.includes("n1") || ids.filter((id) => id === "n1").length === 1);
  });
});

test("a post-undo state is what gets persisted and restored, not the undone one", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await addNodeViaDblClick(page, 600, 300, "Beta");
    await page.click("#btn-undo"); // Beta undone
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 1);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].label, "Alpha");
  });
});

test("a fresh profile with nothing ever saved loads to the normal empty state, no error", async () => {
  await withPage(async (page) => {
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 0);
    assert.equal(edges.length, 0);
  });
});

test("a corrupted saved payload is ignored gracefully — the app boots to an empty graph, not a crash", async () => {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  // Seed corrupt data before the app's own boot script runs.
  await page.addInitScript(() => {
    localStorage.setItem("kg-canvas-live", "{not valid json");
  });
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  const nodes = await page.evaluate(() => window.__kg.state.nodes);
  assert.equal(nodes.length, 0);
  await browser.close();
  assert.deepEqual(consoleErrors, []);
});

test("camera pan/zoom and selection are not restored across reload — only graph data persists", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.zoomAt(400, 400, 2));
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300); // select it (post-zoom, roughly still near it)
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 1);

    const camera = await page.evaluate(() => window.__kg.camera);
    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(camera.scale, 1);
    assert.equal(camera.panX, 0);
    assert.equal(selection.type, null);
  });
});

// ---------------------------------------------------------------------------
// Served over http(s), OPFS is actually usable — verify that code path for
// real rather than only the localStorage fallback above.
// ---------------------------------------------------------------------------

let server;
before(async () => {
  server = await startStaticServer(path.resolve(__dirname, ".."));
});
after(async () => {
  await server.close();
});

test("when served over http, the storage backend resolves to opfs", async () => {
  await withPage(async (page) => {
    const backend = await page.evaluate(() => window.__kg.storage.detectBackend());
    assert.equal(backend, "opfs");
  }, { url: `${server.url}/index.html` });
});

test("OPFS-backed graph (nodes, edges, groups) round-trips correctly across a reload when served", async () => {
  await withPage(async (page) => {
    await page.click("#btn-add-group");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 600, box.y + 400);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Group A");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    await addNodeViaDblClick(page, 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400);
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 2);

    const backend = await page.evaluate(() => window.__kg.storage.detectBackend());
    assert.equal(backend, "opfs");
    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.deepEqual(member.groups, [group.id]);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].auto, true);
  }, { url: `${server.url}/index.html` });
});
