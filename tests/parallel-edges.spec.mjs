import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, addNodeViaButton, createEdgeViaConnectMode } from "./lib/page.mjs";

async function geometryOf(page, edgeId) {
  return page.evaluate((id) => window.__kg.getEdgeGeometry(id), edgeId);
}

test("a single edge between two nodes is unaffected — no bend, straight line", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 400, "A");
    await addNodeViaDblClick(page, 650, 400, "B");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "relates to");
    const edgeId = await page.evaluate(() => window.__kg.state.edges[0].id);

    const geo = await geometryOf(page, edgeId);
    assert.equal(geo.control, null, "a lone edge between a pair must never bend");
    assert.deepEqual(geo.mid, { x: (geo.a.x + geo.b.x) / 2, y: (geo.a.y + geo.b.y) / 2 });
  });
});

test("two edges between the same pair bend to opposite sides, by equal amounts, perpendicular to the line", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 400, "A");
    await addNodeViaDblClick(page, 650, 400, "B");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "first");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "second");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 2);

    const geoA = await geometryOf(page, edges[0].id);
    const geoB = await geometryOf(page, edges[1].id);
    assert.notEqual(geoA.control, null);
    assert.notEqual(geoB.control, null);

    const straightMid = { x: (geoA.a.x + geoA.b.x) / 2, y: (geoA.a.y + geoA.b.y) / 2 };
    const offsetA = { x: geoA.control.x - straightMid.x, y: geoA.control.y - straightMid.y };
    const offsetB = { x: geoB.control.x - straightMid.x, y: geoB.control.y - straightMid.y };

    // Opposite sides: offsets point in exactly opposite directions.
    assert.ok(Math.abs(offsetA.x + offsetB.x) < 1e-9, "x offsets should cancel");
    assert.ok(Math.abs(offsetA.y + offsetB.y) < 1e-9, "y offsets should cancel");
    // Non-zero: they actually bent, not both sitting at the straight line.
    const magA = Math.hypot(offsetA.x, offsetA.y);
    assert.ok(magA > 5, `expected a real bend offset, got magnitude ${magA}`);

    // Perpendicular to the straight line (dot product ~0).
    const lineDx = geoA.b.x - geoA.a.x, lineDy = geoA.b.y - geoA.a.y;
    const dot = offsetA.x * lineDx + offsetA.y * lineDy;
    assert.ok(Math.abs(dot) < 1e-6, `expected the offset perpendicular to the edge, dot product was ${dot}`);
  });
});

test("three edges between the same pair bend symmetrically — the middle one stays on the straight line", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 400, "A");
    await addNodeViaDblClick(page, 650, 400, "B");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "r1");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "r2");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "r3");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 3);

    const geos = await Promise.all(edges.map((e) => geometryOf(page, e.id)));
    const straightMid = { x: (geos[0].a.x + geos[0].b.x) / 2, y: (geos[0].a.y + geos[0].b.y) / 2 };
    const dists = geos.map((g) => Math.hypot(g.control.x - straightMid.x, g.control.y - straightMid.y));

    dists.sort((a, b) => a - b);
    assert.ok(dists[0] < 1e-6, "one of the three must sit exactly on the straight line (the centered one)");
    assert.ok(Math.abs(dists[1] - dists[2]) < 1e-9, "the other two must bend by equal magnitude, on opposite sides");
    assert.ok(dists[1] > 5, "the outer two must actually be offset, not all three collapsed to the same line");
  });
});

test("five edges between the same pair bend symmetrically at five distinct, evenly-spaced offsets, and every curve is still individually hit-testable", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 400, "A");
    await addNodeViaDblClick(page, 650, 400, "B");
    for (const relation of ["r1", "r2", "r3", "r4", "r5"]) {
      await createEdgeViaConnectMode(page, 250, 400, 650, 400, relation);
    }
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    await page.evaluate(() => window.__kg.actions.clearSelection());
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 5);

    const geos = await Promise.all(edges.map((e) => geometryOf(page, e.id)));
    const straightMid = { x: (geos[0].a.x + geos[0].b.x) / 2, y: (geos[0].a.y + geos[0].b.y) / 2 };
    // Signed offset along the perpendicular axis (not just magnitude), so
    // the symmetric -2,-1,0,+1,+2-step spacing is checked precisely rather
    // than just "five different distances."
    const lineDx = geos[0].b.x - geos[0].a.x, lineDy = geos[0].b.y - geos[0].a.y;
    const len = Math.hypot(lineDx, lineDy);
    const nx = -lineDy / len, ny = lineDx / len;
    const signedOffsets = geos.map((g) => (g.control.x - straightMid.x) * nx + (g.control.y - straightMid.y) * ny);
    signedOffsets.sort((a, b) => a - b);

    const EDGE_BEND_STEP = 60; // world units per step, mirrors index.html's own constant
    const expected = [-2, -1, 0, 1, 2].map((step) => step * EDGE_BEND_STEP);
    for (let i = 0; i < 5; i++) {
      assert.ok(Math.abs(signedOffsets[i] - expected[i]) < 1e-6,
        `step ${i - 2}: expected offset ${expected[i]}, got ${signedOffsets[i]}`);
    }

    // Every one of the 5 curves must still resolve to its own distinct edge
    // when clicked at its own midpoint — not just "some" of them, as a
    // higher multiplicity is exactly where a hit-testing regression (e.g.
    // curves bunching close enough together to be ambiguous) would show up
    // first.
    const box = await page.locator("#canvas").boundingBox();
    for (let i = 0; i < edges.length; i++) {
      const geo = await geometryOf(page, edges[i].id);
      await page.mouse.click(box.x + geo.mid.x, box.y + geo.mid.y);
      const selection = await page.evaluate(() => window.__kg.state.selection);
      assert.equal(selection.id, edges[i].id, `clicking edge ${i}'s own midpoint should select edge ${i}, not a neighbor`);
    }
  });
});

test("parallel edges pointing in opposite directions (A->B and B->A) still fan out distinctly, not mirrored onto the same curve", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 400, "A");
    await addNodeViaDblClick(page, 650, 400, "B");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "forward");
    // A third edge declared B->A (reversed source/target) rather than
    // A->B — the bend's perpendicular axis must be canonical (independent
    // of which node this specific edge calls "source"), or this edge's
    // own a->b direction is flipped relative to its sibling's, silently
    // mirroring its offset onto the same curve instead of fanning out.
    const ids = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.id));
    await page.evaluate((ids) => {
      window.__kg.actions.createEdge(ids[1], ids[0], "backward");
    }, ids);

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 2);
    const geos = await Promise.all(edges.map((e) => geometryOf(page, e.id)));
    assert.notEqual(geos[0].control, null);
    assert.notEqual(geos[1].control, null);

    const dist = Math.hypot(geos[0].mid.x - geos[1].mid.x, geos[0].mid.y - geos[1].mid.y);
    assert.ok(dist > 10, `expected the two curves' midpoints to be clearly apart, got ${dist} apart (${JSON.stringify(geos[0].mid)} vs ${JSON.stringify(geos[1].mid)})`);
  });
});

test("bending ignores auto (contains) edges — a group's contains edge doesn't cause a real edge to the same member to bend", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 300, 300, "Group");
    await addNodeViaDblClick(page, 700, 500, "Member");
    // Manually establish membership (creates an auto contains edge Group->Member).
    await page.evaluate(() => {
      const group = window.__kg.state.nodes.find((n) => n.type === "group");
      const member = window.__kg.state.nodes.find((n) => n.type === "entity");
      member.groups.push(group.id);
      window.__kg.actions.createEdge(group.id, member.id, "contains", true, true);
    });
    // Now add one genuine, visible edge between the very same pair.
    await createEdgeViaConnectMode(page, 300, 300, 700, 500, "also related");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const realEdge = await page.evaluate(() => window.__kg.state.edges.find((e) => !e.auto));
    const geo = await geometryOf(page, realEdge.id);
    assert.equal(geo.control, null, "the auto contains edge must not count toward this pair's bend group");
  });
});

test("hit-testing resolves each bent edge to its own curve, not always the first one in the pair", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 400, "A");
    await addNodeViaDblClick(page, 650, 400, "B");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "first");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "second");
    await page.evaluate(() => window.__kg.actions.setMode("idle")); // connect mode is sticky and would intercept the plain clicks below
    // The second edge is left auto-selected by createEdgeViaConnectMode,
    // which shows the floating selection toolbar right near its curve
    // (translate(-50%,-170%) of its own anchor) — close enough, with this
    // bend size, to visually overlap and swallow a click meant for the
    // first curve. Clear it first so only the canvas can receive the click.
    await page.evaluate(() => window.__kg.actions.clearSelection());
    const edges = await page.evaluate(() => window.__kg.state.edges);
    const geoFirst = await geometryOf(page, edges[0].id);
    const geoSecond = await geometryOf(page, edges[1].id);

    const box = await page.locator("#canvas").boundingBox();
    // Click at each curve's actual midpoint (geo.mid) — the control point
    // itself is a bezier "pull" point the curve bends toward but never
    // passes through, so it's not on the drawn/hit-tested path at all.
    await page.mouse.click(box.x + geoFirst.mid.x, box.y + geoFirst.mid.y);
    let selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.id, edges[0].id, "clicking the first curve's midpoint should select the first edge");

    await page.mouse.click(box.x + geoSecond.mid.x, box.y + geoSecond.mid.y);
    selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.id, edges[1].id, "clicking the second curve's midpoint should select the second edge");
  });
});

test("double-clicking near one bent curve's peak renames that specific edge, not its parallel sibling", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 400, "A");
    await addNodeViaDblClick(page, 650, 400, "B");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "first");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "second");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    const geoSecond = await geometryOf(page, edges[1].id);

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(box.x + geoSecond.mid.x, box.y + geoSecond.mid.y);
    await page.waitForSelector(".kg-inline-input");
    assert.equal(await page.locator(".kg-inline-input").inputValue(), "second");
    await page.locator(".kg-inline-input").fill("second renamed");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    const relations = await page.evaluate(() => window.__kg.state.edges.map((e) => e.relation).sort());
    assert.deepEqual(relations, ["first", "second renamed"]);
  });
});

test("viewport culling accounts for a bent edge's curve bulge, not just its straight-line bounding box", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 400, "A");
    await addNodeViaDblClick(page, 650, 400, "B");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "first");
    await createEdgeViaConnectMode(page, 250, 400, 650, 400, "second");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    const geo = await geometryOf(page, edges[0].id); // bends upward (negative y offset)

    // Zoom/pan so only the curve's peak (well above the straight a-b line)
    // is inside the viewport — the straight segment itself would be culled.
    await page.evaluate((cy) => {
      window.__kg.camera.scale = 8;
      window.__kg.camera.panX = -300 * 8 + 600;
      window.__kg.camera.panY = -(cy - 20) * 8 + 400;
      window.__kg.render();
    }, geo.control.y);

    const stats = await page.evaluate(() => window.__kg.perf.getRenderStats());
    assert.equal(stats.edgesDrawn, 2, "both bent edges should still be drawn since their curves reach into view");
  });
});
