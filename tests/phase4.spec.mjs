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

test("boot requests persistent storage (best-effort, doesn't block or throw)", async () => {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.addInitScript(() => {
    window.__persistCalled = false;
    const original = navigator.storage.persist.bind(navigator.storage);
    navigator.storage.persist = (...args) => {
      window.__persistCalled = true;
      return original(...args);
    };
  });
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.waitForFunction(() => window.__persistCalled === true);
  await browser.close();
  assert.deepEqual(consoleErrors, []);
});

test("reloading with a saved graph shows a restore toast naming the node/edge counts", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "relates to");
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 2);

    await page.waitForFunction(() => document.getElementById("restore-toast").classList.contains("visible"));
    const text = await page.textContent("#restore-toast");
    assert.match(text, /2/, "toast should mention the restored node count");
    assert.match(text, /1/, "toast should mention the restored edge count");
  });
});

test("a fresh load with nothing saved yet shows no restore toast", async () => {
  await withPage(async (page) => {
    const visible = await page.evaluate(() => document.getElementById("restore-toast").classList.contains("visible"));
    assert.equal(visible, false);
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

test("a burst of many scheduled saves coalesces into far fewer than N actual writes, and still persists the latest state", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.storage.whenIdle()); // settle the one real save from adding the node

    const result = await page.evaluate(async () => {
      let setItemCalls = 0;
      const originalSetItem = localStorage.setItem.bind(localStorage);
      localStorage.setItem = (key, value) => { setItemCalls++; return originalSetItem(key, value); };
      for (let i = 0; i < 10; i++) window.__kg.storage.save(); // 10 synchronous, un-awaited schedule calls
      await window.__kg.storage.whenIdle();
      localStorage.setItem = originalSetItem;
      return { setItemCalls, raw: localStorage.getItem("kg-canvas-live") };
    });

    assert.ok(result.setItemCalls < 10, `expected far fewer than 10 actual writes from 10 scheduled saves (coalesced), got ${result.setItemCalls}`);
    assert.ok(result.setItemCalls >= 1, "at least one write should still happen");
    const parsed = JSON.parse(result.raw);
    assert.equal(parsed.nodes.length, 1);
    assert.equal(parsed.nodes[0].label, "Alpha");
  });
});

test("a moderately large graph (50 nodes, ~30 edges, nested groups) round-trips exactly across a reload", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      const outer = window.__kg.actions.createNode(0, 0, "Outer", "group");
      outer.w = 2000; outer.h = 1500;
      const ids = [];
      for (let i = 0; i < 48; i++) {
        const col = i % 8, row = Math.floor(i / 8);
        const n = window.__kg.actions.createNode(100 + col * 200, 100 + row * 200, `N${i}`, "entity");
        ids.push(n.id);
        n.groups.push(outer.id);
        window.__kg.actions.createEdge(outer.id, n.id, "contains", true, true);
      }
      for (let i = 0; i < 30; i++) {
        window.__kg.actions.createEdge(ids[i % ids.length], ids[(i + 7) % ids.length], `rel${i}`);
      }
      window.__kg.markDirty();
      window.__kg.storage.save();
    });
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 49);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 49, "48 entities + 1 outer group");
    assert.equal(edges.length, 48 + 30, "48 contains edges + 30 regular edges");
    const outer = nodes.find((n) => n.label === "Outer");
    const someMember = nodes.find((n) => n.label === "N10");
    assert.deepEqual(someMember.groups, [outer.id]);
    const regularEdges = edges.filter((e) => !e.auto);
    assert.equal(regularEdges.length, 30);
    assert.ok(regularEdges.every((e) => e.relation.startsWith("rel")));
  });
});

test("Clear does not touch the separately-stored theme preference", async () => {
  await withPage(async (page) => {
    await page.click("#btn-theme-toggle"); // dark -> light
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.click("#btn-clear");
    await page.click("#confirm-ok");
    await page.evaluate(() => window.__kg.storage.whenIdle());

    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 0);
    assert.equal(await page.evaluate(() => window.__kg.theme.get()), "light",
      "Clear must only affect graph data, never the independently-stored theme preference");
    assert.equal(await page.evaluate(() => localStorage.getItem("kg-theme")), "light");
  });
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

test("a localStorage write failure (e.g. quota exceeded) is caught, doesn't crash the app, and whenIdle() still resolves instead of hanging", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.storage.whenIdle()); // settle the save from adding the node

    const result = await page.evaluate(async () => {
      const originalSetItem = localStorage.setItem.bind(localStorage);
      localStorage.setItem = () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); };
      window.__kg.actions.createNode(500, 500, "Beta", "entity");
      window.__kg.markDirty();
      window.__kg.storage.save();
      await window.__kg.storage.whenIdle(); // must resolve, not hang, even though the write threw
      localStorage.setItem = originalSetItem;
      return { nodeCount: window.__kg.state.nodes.length };
    });
    assert.equal(result.nodeCount, 2, "the in-memory edit itself must survive a failed write");

    // The app must keep working normally afterward — a real save with the
    // failure lifted should still succeed.
    await page.evaluate(() => window.__kg.storage.save());
    await page.evaluate(() => window.__kg.storage.whenIdle());
    const raw = await page.evaluate(() => localStorage.getItem("kg-canvas-live"));
    const parsed = JSON.parse(raw);
    assert.equal(parsed.nodes.length, 2, "a subsequent successful save persists the current (already-edited) state");
  });
});

test("an OPFS write failure (createWritable/write throwing) is caught, doesn't crash the app, and whenIdle() still resolves instead of hanging", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.storage.whenIdle()); // settle the save from adding the node, caching the "opfs" backend

    const result = await page.evaluate(async () => {
      const originalGetDirectory = navigator.storage.getDirectory.bind(navigator.storage);
      // detectStorageBackend() already cached "opfs" from the settled save
      // above, so this only breaks writeGraphPayload()'s own later call —
      // never backend detection itself.
      navigator.storage.getDirectory = () => { throw new DOMException("Disk quota exceeded", "QuotaExceededError"); };
      window.__kg.actions.createNode(500, 500, "Beta", "entity");
      window.__kg.markDirty();
      window.__kg.storage.save();
      await window.__kg.storage.whenIdle(); // must resolve, not hang, even though the write threw
      navigator.storage.getDirectory = originalGetDirectory;
      return { nodeCount: window.__kg.state.nodes.length, backend: window.__kg.storage.detectBackend ? await window.__kg.storage.detectBackend() : null };
    });
    assert.equal(result.nodeCount, 2, "the in-memory edit itself must survive a failed OPFS write");
    assert.equal(result.backend, "opfs", "backend detection itself is untouched by the write failure");

    // The app must keep working normally afterward — a real save with the
    // failure lifted should still succeed.
    await page.evaluate(() => window.__kg.storage.save());
    await page.evaluate(() => window.__kg.storage.whenIdle());
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 2);
  }, { url: `${server.url}/index.html` });
});
