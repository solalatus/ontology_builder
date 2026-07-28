import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaButton, dragNode } from "./lib/page.mjs";

// A second finger arriving to start a pinch while a drag is already in
// progress used to corrupt or silently discard the in-flight drag: the
// second pointer's own pointerdown reached the app's main hit-testing
// handler *before* the pinch-recognition logic below it ever ran, and
// could reassign dragMode/movingNodeId out from under the first pointer.
// These tests dispatch raw touch PointerEvents (same technique
// phase0.spec.mjs's pinch tests use) since Playwright's high-level touch
// API can't drive two independently-timed fingers with this precision.
function pe(type, id, cx, cy, isPrimary = true) {
  return { type, pointerId: id, clientX: cx, clientY: cy, isPrimary };
}

async function dispatchTouch(page, events) {
  await page.evaluate((evts) => {
    const canvas = document.getElementById("canvas");
    for (const e of evts) {
      canvas.dispatchEvent(new PointerEvent(e.type, {
        pointerId: e.pointerId, pointerType: "touch", clientX: e.clientX, clientY: e.clientY,
        bubbles: true, isPrimary: e.isPrimary,
      }));
    }
  }, events);
}

async function historyLength(page) {
  return page.evaluate(() => window.__kg.history.past.length);
}

test("a pinch interrupting a single-finger node drag commits the partial move as one undo step, instead of losing it", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-node", 400, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    const before = await page.evaluate(() => ({ ...window.__kg.state.nodes[0] }));
    const historyBefore = await historyLength(page);

    await dispatchTouch(page, [
      pe("pointerdown", 1, box.x + 400, box.y + 300),
      pe("pointermove", 1, box.x + 500, box.y + 450),
    ]);
    const mid = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.notEqual(mid.x, before.x, "the drag must have actually moved the node before the interruption");

    // Second finger arrives — pinch owns the interaction from here.
    await dispatchTouch(page, [pe("pointerdown", 2, box.x + 20, box.y + 20, false)]);

    const after = await page.evaluate(() => window.__kg.state.nodes[0]);
    const historyAfter = await historyLength(page);
    assert.deepEqual({ x: after.x, y: after.y }, { x: mid.x, y: mid.y }, "position is preserved, not reverted or further changed");
    assert.equal(historyAfter, historyBefore + 1, "the partial move must be committed as exactly one undo step");

    await page.evaluate(() => window.__kg.actions.undo());
    const restored = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(restored.x, before.x);
    assert.equal(restored.y, before.y);
  });
});

test("a pinch starting immediately (no movement yet) produces no spurious undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-node", 400, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    const before = await page.evaluate(() => ({ ...window.__kg.state.nodes[0] }));
    const historyBefore = await historyLength(page);

    await dispatchTouch(page, [
      pe("pointerdown", 1, box.x + 400, box.y + 300),
      pe("pointerdown", 2, box.x + 20, box.y + 20, false),
    ]);

    const after = await page.evaluate(() => window.__kg.state.nodes[0]);
    const historyAfter = await historyLength(page);
    assert.equal(historyAfter, historyBefore, "nothing changed, so nothing should be pushed to history");
    assert.deepEqual({ x: after.x, y: after.y }, { x: before.x, y: before.y });
  });
});

test("a pinch starting cancels a pending long-press-delete timer — the node survives instead of being deleted ~600ms later", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-node", 400, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();

    await dispatchTouch(page, [pe("pointerdown", 1, box.x + 400, box.y + 300)]);
    await page.waitForTimeout(150); // well before the 600ms long-press threshold
    await dispatchTouch(page, [pe("pointerdown", 2, box.x + 20, box.y + 20, false)]);

    await page.waitForTimeout(700); // past the long-press threshold
    const nodeCount = await page.evaluate(() => window.__kg.state.nodes.length);
    assert.equal(nodeCount, 1, "the node must not be deleted once the interaction has moved on to a pinch");
  });
});

test("a pinch starting cancels a pending edge long-press-delete timer too", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-node", 250, 250, "A");
    await addNodeViaButton(page, "#btn-add-node", 650, 250, "B");
    await page.evaluate(() => window.__kg.actions.setMode("connect"));
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 250, box.y + 250);
    await page.mouse.click(box.x + 650, box.y + 250);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("rel");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    await dispatchTouch(page, [pe("pointerdown", 1, box.x + 450, box.y + 250)]); // edge midpoint
    await page.waitForTimeout(150);
    await dispatchTouch(page, [pe("pointerdown", 2, box.x + 20, box.y + 20, false)]);

    await page.waitForTimeout(700);
    const edgeCount = await page.evaluate(() => window.__kg.state.edges.length);
    assert.equal(edgeCount, 1, "the edge must not be deleted once the interaction has moved on to a pinch");
  });
});

test("a pinch interrupting a createEdge drag creates no phantom edge and no undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-node", 300, 300, "A");
    await addNodeViaButton(page, "#btn-add-node", 700, 300, "B");
    const box = await page.locator("#canvas").boundingBox();
    const nodeA = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "A"));
    const handle = { x: nodeA.x + nodeA.w, y: nodeA.y + nodeA.h / 2 };
    const historyBefore = await historyLength(page);

    await dispatchTouch(page, [
      pe("pointerdown", 1, box.x + handle.x, box.y + handle.y),
      pe("pointermove", 1, box.x + handle.x + 100, box.y + handle.y),
    ]);
    await dispatchTouch(page, [pe("pointerdown", 2, box.x + 20, box.y + 20, false)]);

    const edges = await page.evaluate(() => window.__kg.state.edges.length);
    const historyAfter = await historyLength(page);
    assert.equal(edges, 0, "no edge exists until a target is confirmed — an interrupted drag creates none");
    assert.equal(historyAfter, historyBefore, "nothing to undo for a cancelled ghost edge");
  });
});

test("a second finger's pointerdown never hijacks an in-progress single-finger drag — the first finger keeps driving it exclusively once the pinch starts", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-node", 400, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();

    await dispatchTouch(page, [
      pe("pointerdown", 1, box.x + 400, box.y + 300),
      pe("pointermove", 1, box.x + 500, box.y + 450),
    ]);
    const mid = await page.evaluate(() => ({ ...window.__kg.state.nodes[0] }));

    await dispatchTouch(page, [pe("pointerdown", 2, box.x + 20, box.y + 20, false)]);
    // Finger 1 keeps moving after the pinch has started — this must now be
    // ignored by the (already-aborted) drag, not resume moving the node.
    await dispatchTouch(page, [pe("pointermove", 1, box.x + 550, box.y + 500)]);

    const after = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(after.x, mid.x, "finger 1's post-pinch-start movement must not keep dragging the node");
    assert.equal(after.y, mid.y);
  });
});

test("a genuine pointercancel event (not just a pinch) also commits a partial drag instead of losing it", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-node", 400, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    const before = await page.evaluate(() => ({ ...window.__kg.state.nodes[0] }));
    const historyBefore = await historyLength(page);

    await dispatchTouch(page, [
      pe("pointerdown", 1, box.x + 400, box.y + 300),
      pe("pointermove", 1, box.x + 480, box.y + 420),
    ]);
    const mid = await page.evaluate(() => ({ ...window.__kg.state.nodes[0] }));
    assert.notEqual(mid.x, before.x, "the drag must have actually moved the node before the cancel");

    // A real pointercancel — e.g. the OS reclaiming the gesture for a
    // system action — rather than a second finger's pointerdown.
    await page.evaluate(() => {
      const canvas = document.getElementById("canvas");
      canvas.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 1, pointerType: "touch", bubbles: true }));
    });

    const after = await page.evaluate(() => window.__kg.state.nodes[0]);
    const historyAfter = await historyLength(page);
    assert.deepEqual({ x: after.x, y: after.y }, { x: mid.x, y: mid.y });
    assert.equal(historyAfter, historyBefore + 1, "the partial move is committed as one undo step, not lost");
  });
});

test("a pointercancel during a pan cleanly ends the pan without pushing any (nonexistent) undo step", async () => {
  await withPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();
    const panBefore = await page.evaluate(() => ({ ...window.__kg.camera }));

    await dispatchTouch(page, [
      pe("pointerdown", 1, box.x + 200, box.y + 200),
      pe("pointermove", 1, box.x + 350, box.y + 300),
    ]);
    const panMid = await page.evaluate(() => ({ ...window.__kg.camera }));
    assert.notEqual(panMid.panX, panBefore.panX, "the pan must have actually moved the camera before the cancel");

    await page.evaluate(() => {
      const canvas = document.getElementById("canvas");
      canvas.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 1, pointerType: "touch", bubbles: true }));
    });

    // Panning has no undo history at all — cancelling it mid-flight must
    // not touch history, and a fresh drag on the same node afterward must
    // work normally (dragMode/activePointerId were properly released).
    await addNodeViaButton(page, "#btn-add-node", 500, 500, "Alpha");
    const placed = await page.evaluate(() => ({ ...window.__kg.state.nodes[0] }));
    await dragNode(page, 500, 500, 550, 550);
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    // Screen-space delta scales by the current camera zoom (unchanged by a
    // pan) to get the expected world-space delta, rather than assuming
    // screen == world coordinates.
    const scale = await page.evaluate(() => window.__kg.camera.scale);
    assert.equal(node.x, placed.x + 50 / scale, "moved by the drag delta, proving normal interaction resumed cleanly");
    assert.equal(node.y, placed.y + 50 / scale);
  });
});

// abortActiveDrag()'s commit path (see index.html's commitDragIfChanged())
// diffs the drag's "before" snapshot against the current state via
// JSON.stringify to decide whether anything actually changed — cheap for a
// typical graph, but the whole point of a QA/coverage pass is not assuming
// that scales; this proves it does, on a graph big enough that the
// per-frame render/culling budget in phase9.spec.mjs already treats as its
// own stress scenario.
async function seedGrid(page, count, cols, spacing) {
  await page.evaluate(({ count, cols, spacing }) => {
    for (let i = 0; i < count; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      window.__kg.actions.createNode(col * spacing, row * spacing, `N${i}`);
    }
    window.__kg.markDirty();
  }, { count, cols, spacing });
}

test("a pinch interrupting a drag on a 1000-node graph still commits quickly, correctly, and without hanging", async () => {
  await withPage(async (page) => {
    await seedGrid(page, 1000, 50, 300);
    const box = await page.locator("#canvas").boundingBox();
    // Node 0 sits at world (0,0); with the default camera (scale 1, no
    // pan) that's screen (0,0) relative to the canvas — nudge the camera
    // so it's actually clickable within the viewport.
    await page.evaluate(() => { window.__kg.camera.panX = 400; window.__kg.camera.panY = 300; window.__kg.markDirty(); });

    const before = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "N0"));
    const historyBefore = await historyLength(page);

    const start = Date.now();
    await dispatchTouch(page, [
      pe("pointerdown", 1, box.x + 400, box.y + 300), // node N0's screen position after the pan above
      pe("pointermove", 1, box.x + 500, box.y + 420),
    ]);
    await dispatchTouch(page, [pe("pointerdown", 2, box.x + 20, box.y + 20, false)]); // pinch interrupts
    const elapsed = Date.now() - start;

    assert.ok(elapsed < 5000, `expected the interrupted drag on a 1000-node graph to commit quickly, took ${elapsed}ms`);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1000, "no node lost or duplicated");
    const after = nodes.find((n) => n.label === "N0");
    assert.notEqual(after.x, before.x, "the interrupted node actually moved");
    assert.equal((await historyLength(page)), historyBefore + 1, "the partial move on a large graph is still committed as one undo step");

    await page.evaluate(() => window.__kg.actions.undo());
    const restored = (await page.evaluate(() => window.__kg.state.nodes)).find((n) => n.label === "N0");
    assert.equal(restored.x, before.x, "undo restores the exact prior position even on a large graph");
  });
});
