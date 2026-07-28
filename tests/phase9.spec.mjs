import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// Bypasses the UI for fast graph setup — createNode() alone doesn't push
// undo history (see phase8.spec.mjs's seedGraph), and building ~1,000 nodes
// through real pointer events would make this suite glacially slow.
async function seedGrid(page, count, cols, spacing) {
  await page.evaluate(({ count, cols, spacing }) => {
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      window.__kg.actions.createNode(col * spacing, row * spacing, `N${i}`);
    }
    window.__kg.markDirty();
  }, { count, cols, spacing });
}

async function setCamera(page, { scale, panX, panY }) {
  await page.evaluate(({ scale, panX, panY }) => {
    window.__kg.camera.scale = scale;
    window.__kg.camera.panX = panX;
    window.__kg.camera.panY = panY;
    window.__kg.render(); // synchronous, deterministic — no rAF wait needed
  }, { scale, panX, panY });
}

test("viewport culling draws far fewer nodes when zoomed into a small region of a 1,000-node graph", async () => {
  await withPage(async (page) => {
    await seedGrid(page, 1000, 50, 300); // spans ~14,860 x 5,760 world units
    await setCamera(page, { scale: 3, panX: 0, panY: 0 }); // zoomed into the corner near the origin

    const stats = await page.evaluate(() => window.__kg.perf.getRenderStats());
    assert.equal(stats.nodesTotal, 1000);
    assert.ok(stats.nodesDrawn > 0, "at least the corner's nodes should be visible");
    assert.ok(stats.nodesDrawn < stats.nodesTotal / 10,
      `expected far fewer than 100 of 1000 nodes drawn when zoomed in, got ${stats.nodesDrawn}`);
  });
});

test("zooming out to fit the whole graph draws (nearly) every node — culling isn't losing anything", async () => {
  await withPage(async (page) => {
    await seedGrid(page, 1000, 50, 300);
    await setCamera(page, { scale: 0.08, panX: 10, panY: 10 }); // fits the whole grid in the viewport

    const stats = await page.evaluate(() => window.__kg.perf.getRenderStats());
    assert.equal(stats.nodesTotal, 1000);
    assert.ok(stats.nodesDrawn > stats.nodesTotal * 0.9,
      `expected nearly all 1000 nodes visible when zoomed out to fit, got ${stats.nodesDrawn}`);
  });
});

test("render() stays within a generous frame-time budget even drawing all ~1,000 nodes (smoke check, not a strict CI gate)", async () => {
  await withPage(async (page) => {
    await seedGrid(page, 1000, 50, 300);
    await setCamera(page, { scale: 0.08, panX: 10, panY: 10 }); // the worst case: (nearly) everything actually drawn

    const avgMs = await page.evaluate(() => {
      const N = 20;
      const start = performance.now();
      for (let i = 0; i < N; i++) {
        window.__kg.markDirty();
        window.__kg.render();
      }
      return (performance.now() - start) / N;
    });
    assert.ok(avgMs < 100, `expected render() to average well under 100ms even with ~1,000 nodes drawn, got ${avgMs.toFixed(2)}ms`);
  });
});

test("disconnected nodes scattered across a huge world are culled purely by position, same as connected nodes", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      const a = window.__kg.actions.createNode(0, 0, "ConnA");
      const b = window.__kg.actions.createNode(200, 0, "ConnB");
      window.__kg.actions.createEdge(a.id, b.id, "linked");
      window.__kg.actions.createNode(100, 300, "IsolatedNear"); // in view
      window.__kg.actions.createNode(5000, 5000, "IsolatedFar"); // out of view
      window.__kg.actions.createNode(8000, 100, "IsolatedFar2"); // out of view
      window.__kg.markDirty();
    });
    await setCamera(page, { scale: 1, panX: 0, panY: 0 });

    const { rect, nodes, stats } = await page.evaluate(() => ({
      rect: window.__kg.perf.getVisibleWorldRect(),
      nodes: window.__kg.state.nodes,
      stats: window.__kg.perf.getRenderStats(),
    }));

    function overlaps(n, r) {
      return !(n.x + n.w <= r.x || n.x >= r.x + r.w || n.y + n.h <= r.y || n.y >= r.y + r.h);
    }
    const expectedVisible = nodes.filter((n) => overlaps(n, rect)).length;
    assert.equal(stats.nodesDrawn, expectedVisible,
      "drawn count should exactly match what geometrically overlaps the visible rect, regardless of connectivity");
    // Sanity: this scattered setup should be a genuine mix, not everything or nothing.
    assert.ok(expectedVisible > 0 && expectedVisible < nodes.length);
  });
});

test("clicking a node that's actually on screen after zooming in still selects it correctly (culling doesn't break hit-testing)", async () => {
  await withPage(async (page) => {
    await seedGrid(page, 1000, 50, 300);
    // panY offset keeps N0 clear of the fixed toolbar, which visually overlaps
    // the top of the canvas element without shrinking its own bounding box.
    await setCamera(page, { scale: 3, panX: 100, panY: 150 });

    // N0 sits at world (0,0); with scale=3/panX=100/panY=150 its screen box is (100,150)-(580,330).
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 150, box.y + 200);

    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.type, "node");
    const label = await page.evaluate(() =>
      window.__kg.state.nodes.find((n) => n.id === window.__kg.state.selection.id).label);
    assert.equal(label, "N0");
  });
});

test("edges are culled independently of their endpoint nodes' own visibility bookkeeping — a long edge crossing the viewport still draws", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      const a = window.__kg.actions.createNode(-5000, 400, "FarLeft");
      const b = window.__kg.actions.createNode(5000, 400, "FarRight");
      window.__kg.actions.createEdge(a.id, b.id, "spans the whole view");
      window.__kg.markDirty();
    });
    // Both endpoints are far outside the viewport, but the edge's segment
    // passes straight through it — the bounding-box cull must still catch this.
    await setCamera(page, { scale: 1, panX: 0, panY: 0 });

    const stats = await page.evaluate(() => window.__kg.perf.getRenderStats());
    assert.equal(stats.edgesTotal, 1);
    assert.equal(stats.edgesDrawn, 1, "an edge whose segment crosses the viewport must be drawn even if both endpoints are off-screen");
  });
});
