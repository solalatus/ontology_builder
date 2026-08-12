import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode, settle } from "./lib/page.mjs";

// issue #64 ("Crowded graph layout") follow-up feature: selecting a node
// highlights every edge touching it, and selecting an edge highlights the
// two node boxes at its ends -- so a class's whole immediate neighborhood
// (or a relationship's two endpoints) is visible at a glance in a crowded
// layout. window.__kg.getHighlightedConnections() exposes the exact
// derived set render() paints from, so most of these assert against that
// directly; one test (at the bottom) also samples an actual rendered
// canvas pixel, the same technique tests/theme.spec.mjs uses, to confirm
// the wiring reaches Canvas2D draw calls and not just in-memory state.

async function highlighted(page) {
  return page.evaluate(() => {
    const h = window.__kg.getHighlightedConnections();
    return { nodeIds: [...h.nodeIds].sort(), edgeIds: [...h.edgeIds].sort() };
  });
}

// A small hub-and-two-leaves graph, plus one isolated node (D) for the
// no-connections edge case. Center (A) is at screen (400,300); leaves at
// (300,200) and (500,200); the isolated node at (400,450). Camera is
// default (scale 1, panX/panY 0) for a fresh withPage() session, so these
// screen coordinates double as the nodes' own world-space centers
// (placeNewNodeAt centers a new node exactly on its creation click) --
// letting later clicks and edge-midpoint math reuse the same numbers
// without a worldToScreen round-trip.
async function buildHubGraph(page) {
  await addNodeViaDblClick(page, 400, 300, "A");
  await addNodeViaDblClick(page, 300, 200, "B");
  await addNodeViaDblClick(page, 500, 200, "C");
  await addNodeViaDblClick(page, 400, 450, "D"); // isolated -- no edges
  await createEdgeViaConnectMode(page, 400, 300, 300, 200, "toB");
  await createEdgeViaConnectMode(page, 400, 300, 500, 200, "toC");
  // Connect mode is sticky (tests/lib/page.mjs's own note on
  // createEdgeViaConnectMode) -- back to idle so the plain selection
  // clicks below land as ordinary clicks, not connect-mode taps.
  await page.evaluate(() => window.__kg.actions.setMode("idle"));
  const ids = await page.evaluate(() => {
    const byLabel = Object.fromEntries(window.__kg.state.nodes.map((n) => [n.label, n.id]));
    const edgeIds = window.__kg.state.edges.map((e) => e.id);
    return { byLabel, edgeIds };
  });
  return ids;
}

test("selecting a node highlights every edge touching it, and highlights no nodes", async () => {
  await withPage(async (page) => {
    const { byLabel, edgeIds } = await buildHubGraph(page);
    await page.mouse.click(...(await canvasPoint(page, 400, 300)));

    const sel = await page.evaluate(() => window.__kg.state.selection);
    assert.deepEqual(sel, { type: "node", id: byLabel.A });

    const h = await highlighted(page);
    assert.deepEqual(h.edgeIds, [...edgeIds].sort(), "both of A's edges should be highlighted");
    assert.deepEqual(h.nodeIds, [], "a node selection highlights edges, not other node boxes");
  });
});

test("selecting a leaf node highlights only its own single edge, not the other leaf's", async () => {
  await withPage(async (page) => {
    const { byLabel } = await buildHubGraph(page);
    await page.mouse.click(...(await canvasPoint(page, 300, 200))); // node B

    const h = await highlighted(page);
    assert.equal(h.edgeIds.length, 1, "B has exactly one edge (A-B)");
    const edge = await page.evaluate((id) => window.__kg.state.edges.find((e) => e.id === id), h.edgeIds[0]);
    assert.ok(
      (edge.source === byLabel.A && edge.target === byLabel.B) || (edge.source === byLabel.B && edge.target === byLabel.A),
      "the highlighted edge should be A-B, not A-C",
    );
  });
});

test("selecting an isolated node (no edges) highlights nothing", async () => {
  await withPage(async (page) => {
    await buildHubGraph(page);
    await page.mouse.click(...(await canvasPoint(page, 400, 450))); // node D, no edges

    const sel = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(sel.type, "node");
    const h = await highlighted(page);
    assert.deepEqual(h.edgeIds, []);
    assert.deepEqual(h.nodeIds, []);
  });
});

test("selecting an edge highlights its two endpoint node boxes, and highlights no other edges", async () => {
  await withPage(async (page) => {
    const { byLabel } = await buildHubGraph(page);
    // Midpoint of A(400,300)-B(300,200) at default 1:1 camera.
    await page.mouse.click(...(await canvasPoint(page, 350, 250)));

    const sel = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(sel.type, "edge");

    const h = await highlighted(page);
    assert.deepEqual(h.nodeIds, [byLabel.A, byLabel.B].sort(), "the two endpoints of the selected A-B edge");
    assert.deepEqual(h.edgeIds, [], "an edge selection highlights node boxes, not other edges");
  });
});

test("clicking empty canvas clears both selection and the highlight set", async () => {
  await withPage(async (page) => {
    await buildHubGraph(page);
    await page.mouse.click(...(await canvasPoint(page, 400, 300)));
    assert.notDeepEqual(await highlighted(page), { nodeIds: [], edgeIds: [] });

    await page.mouse.click(...(await canvasPoint(page, 900, 700))); // empty canvas area
    const sel = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(sel.type, null);
    assert.deepEqual(await highlighted(page), { nodeIds: [], edgeIds: [] });
  });
});

test("selecting a different node replaces the previous highlight set rather than adding to it", async () => {
  await withPage(async (page) => {
    const { byLabel, edgeIds } = await buildHubGraph(page);
    await page.mouse.click(...(await canvasPoint(page, 400, 300))); // A: both edges highlighted
    assert.equal((await highlighted(page)).edgeIds.length, 2);

    await page.mouse.click(...(await canvasPoint(page, 300, 200))); // B: only A-B
    const h = await highlighted(page);
    assert.equal(h.edgeIds.length, 1);
  });
});

// Real Canvas2D pixel check, same technique as tests/theme.spec.mjs's
// "toggling theme actually repaints the canvas" test -- confirms the
// highlight reaches actual draw calls, not just window.__kg's in-memory
// derived state.
test("selecting a node actually repaints its connected edge in the highlight color, not the default stroke", async () => {
  await withPage(async (page) => {
    await buildHubGraph(page);
    // buildHubGraph()'s own createEdgeViaConnectMode calls leave the last
    // edge created (A-C) selected as a side effect of graph construction --
    // a real "nothing selected yet" baseline needs that cleared first, both
    // so the "before" sample isn't itself mid-selection-highlight, and so
    // the render loop has a stable, settled frame to paint (sampling
    // getImageData() right after a state change races the dirty-flag
    // requestAnimationFrame loop otherwise).
    await settle(page, () => page.evaluate(() => window.__kg.actions.clearSelection()));

    const samplePoint = async () => page.evaluate(() => {
      const canvas = document.getElementById("canvas");
      const c = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      // A point on the A-B edge line, away from either node box and away
      // from the edge-label text (which the app draws in a different
      // color) -- (370, 270) sits on the 400,300 -> 300,200 segment.
      const screen = window.__kg.worldToScreen(370, 270);
      const data = c.getImageData(Math.round(screen.x * dpr), Math.round(screen.y * dpr), 1, 1).data;
      return [data[0], data[1], data[2]];
    });

    const beforePixel = await samplePoint();
    // select A, and wait for the dirty-flag render loop to actually repaint
    await settle(page, async () => page.mouse.click(...(await canvasPoint(page, 400, 300))));
    const afterPixel = await samplePoint();

    assert.notDeepEqual(beforePixel, afterPixel, "the A-B edge's rendered pixel should change once A is selected");
  });
});

async function canvasPoint(page, worldX, worldY) {
  const box = await page.locator("#canvas").boundingBox();
  const screen = await page.evaluate(({ worldX, worldY }) => window.__kg.worldToScreen(worldX, worldY), { worldX, worldY });
  return [box.x + screen.x, box.y + screen.y];
}
