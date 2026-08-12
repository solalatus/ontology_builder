import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, addNodeViaButton, createEdgeViaConnectMode, dragNode, waitForViewSettled } from "./lib/page.mjs";

async function historyLengths(page) {
  return page.evaluate(() => ({ past: window.__kg.history.past.length, future: window.__kg.history.future.length }));
}

test("double-clicking an existing node opens a rename field pre-filled with its current label; committing renames it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.dblclick(box.x + 300, box.y + 300);
    await page.waitForSelector(".kg-inline-input");
    assert.equal(await page.locator(".kg-inline-input").inputValue(), "Alpha");
    await page.locator(".kg-inline-input").fill("Renamed Alpha");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1, "renaming must not create a second node");
    assert.equal(nodes[0].label, "Renamed Alpha");
  });
});

test("Escape while renaming a node cancels without changing the label", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.dblclick(box.x + 300, box.y + 300);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Should not stick");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    const label = await page.evaluate(() => window.__kg.state.nodes[0].label);
    assert.equal(label, "Alpha");
  });
});

test("submitting the same (unchanged) label or an empty label is a no-op — no history entry created", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const before = await historyLengths(page);
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.dblclick(box.x + 300, box.y + 300);
    await page.waitForSelector(".kg-inline-input");
    await page.keyboard.press("Enter"); // unchanged
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    assert.equal(await page.evaluate(() => window.__kg.state.nodes[0].label), "Alpha");
    assert.deepEqual(await historyLengths(page), before, "unchanged submission must not push an undo step");

    await page.mouse.dblclick(box.x + 300, box.y + 300);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("   ");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    assert.equal(await page.evaluate(() => window.__kg.state.nodes[0].label), "Alpha", "blank submission must not blank the label");
    assert.deepEqual(await historyLengths(page), before);
  });
});

test("renaming a node is exactly one undo step, fully reversible", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const before = await historyLengths(page);
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.dblclick(box.x + 300, box.y + 300);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Beta");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    assert.equal((await historyLengths(page)).past, before.past + 1);
    await page.click("#btn-undo");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes[0].label), "Alpha");
    await page.click("#btn-redo");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes[0].label), "Beta");
  });
});

test("double-clicking an existing edge (on its line) opens a rename field pre-filled with its relation; committing renames it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "A");
    await addNodeViaDblClick(page, 650, 250, "B");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "old relation");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(box.x + 450, box.y + 250); // midpoint of the edge line

    await page.waitForSelector(".kg-inline-input");
    assert.equal(await page.locator(".kg-inline-input").inputValue(), "old relation");
    await page.locator(".kg-inline-input").fill("new relation");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1, "renaming must not create a second edge");
    assert.equal(edges[0].relation, "new relation");
  });
});

test("renaming an edge is exactly one undo step, fully reversible", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "A");
    await addNodeViaDblClick(page, 650, 250, "B");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "old relation");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    const before = await historyLengths(page);

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(box.x + 450, box.y + 250);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("new relation");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    assert.equal((await historyLengths(page)).past, before.past + 1);
    await page.click("#btn-undo");
    assert.equal(await page.evaluate(() => window.__kg.state.edges[0].relation), "old relation");
    await page.click("#btn-redo");
    assert.equal(await page.evaluate(() => window.__kg.state.edges[0].relation), "new relation");
  });
});

test("the floating selection toolbar's rename button opens the same rename prompt — the touch-friendly equivalent to double-click", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300); // select it
    await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display !== "none");

    await page.click("#sel-rename");
    await page.waitForSelector(".kg-inline-input");
    assert.equal(await page.locator(".kg-inline-input").inputValue(), "Alpha");
    await page.locator(".kg-inline-input").fill("Renamed via toolbar");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    assert.equal(await page.evaluate(() => window.__kg.state.nodes[0].label), "Renamed via toolbar");
  });
});

test("the rename button is visible in the selection toolbar for both node and edge selections (unlike the direction-toggle, which is edge-only)", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display !== "none");
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.getElementById("sel-rename")).display), "none");
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("sel-toggle-dir")).display), "none");

    await addNodeViaDblClick(page, 650, 250, "Beta");
    await createEdgeViaConnectMode(page, 300, 300, 650, 250, "relates to");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    const edgeId = await page.evaluate(() => window.__kg.state.edges[0].id);
    // render() called synchronously right after selecting, so the assertions
    // below can't race a not-yet-run rAF pass reflecting the new selection.
    await page.evaluate((id) => { window.__kg.actions.selectEdge(id); window.__kg.render(); }, edgeId);
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.getElementById("sel-rename")).display), "none");
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.getElementById("sel-toggle-dir")).display), "none");
  });
});

// --- Inline-input positioning ------------------------------------------
// The rename field must anchor to the node/edge's own geometry (center,
// curve midpoint) rather than to wherever the triggering click/tap landed
// — otherwise double-clicking near a corner of a large/zoomed node pops the
// field up far from the node, which reads as arbitrary ("funky").

async function inputCenter(page) {
  const box = await page.locator(".kg-inline-input").boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test("double-clicking far from a node's center still anchors the rename field to the node's center, not the click point", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-node", 600, 400, "Big Node");
    const box = await page.locator("#canvas").boundingBox();

    // Node default size is 160x60 — double-click near its top-left
    // corner, far from the (600,400) center.
    await page.mouse.dblclick(box.x + 535, box.y + 375);
    await page.waitForSelector(".kg-inline-input");

    const center = await inputCenter(page);
    assert.ok(Math.abs(center.x - box.x - 600) < 1, `expected input x centered on node (600), got ${center.x - box.x}`);
    assert.ok(Math.abs(center.y - box.y - 400) < 1, `expected input y centered on node (400), got ${center.y - box.y}`);
    await page.keyboard.press("Escape");
  });
});

test("the rename field's anchor tracks the node after zoom/pan, matching worldToScreen(center) exactly", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 400, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();

    // Zoom in around the node, then pan, so screen != canvas-local == world.
    await page.mouse.move(box.x + 400, box.y + 300);
    await page.mouse.wheel(0, -600);
    await page.mouse.move(box.x + 200, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 350, box.y + 350, { steps: 5 });
    await page.mouse.up();
    await waitForViewSettled(page);

    const expected = await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      return window.__kg.worldToScreen(n.x + n.w / 2, n.y + n.h / 2);
    });

    // Double-click anywhere on the (now large) node — near one of its edges.
    const clickTarget = await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      return window.__kg.worldToScreen(n.x + 5, n.y + 5);
    });
    await page.mouse.dblclick(box.x + clickTarget.x, box.y + clickTarget.y);
    await page.waitForSelector(".kg-inline-input");

    const center = await inputCenter(page);
    assert.ok(Math.abs(center.x - box.x - expected.x) < 1, `x mismatch: ${center.x - box.x} vs ${expected.x}`);
    assert.ok(Math.abs(center.y - box.y - expected.y) < 1, `y mismatch: ${center.y - box.y} vs ${expected.y}`);
    await page.keyboard.press("Escape");
  });
});

test("double-clicking near an edge's endpoint (not its midpoint) still anchors the rename field to the edge's actual curve midpoint", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "A");
    await addNodeViaDblClick(page, 650, 250, "B");
    // Two edges between the same pair bend into curves — the midpoint is
    // then off the straight line, a stronger test that positioning tracks
    // real edge geometry rather than a naive straight-line guess.
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "first");
    await page.evaluate(() => window.__kg.actions.setMode("connect"));
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 250, box.y + 250);
    await page.mouse.click(box.x + 650, box.y + 250);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("second");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    const secondEdgeId = await page.evaluate(() => window.__kg.state.edges.find((e) => e.relation === "second").id);
    const { expectedMid, clickPoint } = await page.evaluate((id) => {
      const geo = window.__kg.getEdgeGeometry(id);
      const bez = (t) => geo.control
        ? {
            x: (1 - t) ** 2 * geo.a.x + 2 * (1 - t) * t * geo.control.x + t ** 2 * geo.b.x,
            y: (1 - t) ** 2 * geo.a.y + 2 * (1 - t) * t * geo.control.y + t ** 2 * geo.b.y,
          }
        : { x: geo.a.x + (geo.b.x - geo.a.x) * t, y: geo.a.y + (geo.b.y - geo.a.y) * t };
      // A point 15% of the way along the curve from its source anchor —
      // on the curve itself (so it hit-tests as the edge), but far from
      // the midpoint at t=0.5.
      const near = bez(0.15);
      return {
        expectedMid: window.__kg.worldToScreen(geo.mid.x, geo.mid.y),
        clickPoint: window.__kg.worldToScreen(near.x, near.y),
      };
    }, secondEdgeId);

    await page.mouse.dblclick(box.x + clickPoint.x, box.y + clickPoint.y);
    await page.waitForSelector(".kg-inline-input");
    assert.equal(await page.locator(".kg-inline-input").inputValue(), "second");

    const center = await inputCenter(page);
    assert.ok(Math.abs(center.x - box.x - expectedMid.x) < 1, `x mismatch: ${center.x - box.x} vs ${expectedMid.x}`);
    assert.ok(Math.abs(center.y - box.y - expectedMid.y) < 1, `y mismatch: ${center.y - box.y} vs ${expectedMid.y}`);
    await page.keyboard.press("Escape");
  });
});

test("a rename field near the top of the viewport is clamped below the toolbar, never rendering underneath it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 400, 300, "Near Top");
    const box = await page.locator("#canvas").boundingBox();

    // Drag the node up close to the toolbar, but not fully underneath it.
    await page.mouse.move(box.x + 400, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 20, box.y + 100, { steps: 10 });
    await page.mouse.up();
    await waitForViewSettled(page);

    const nodeScreen = await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      return window.__kg.worldToScreen(n.x + n.w / 2, n.y + n.h / 2);
    });
    await page.mouse.dblclick(box.x + nodeScreen.x, box.y + nodeScreen.y);
    await page.waitForSelector(".kg-inline-input");

    const inputBox = await page.locator(".kg-inline-input").boundingBox();
    const toolbarBottom = await page.evaluate(() => document.getElementById("toolbar").getBoundingClientRect().bottom);
    assert.ok(inputBox.y >= toolbarBottom - 0.5, `input top ${inputBox.y} should be at/below toolbar bottom ${toolbarBottom}`);
    assert.ok(inputBox.x >= 0, `input should not spill off the left edge, got x=${inputBox.x}`);
    await page.keyboard.press("Escape");
  });
});

test("renaming a node holds up under zoom + pan-near-edge combined: the field anchors to the node and stays clamped on-screen", async () => {
  await withPage(async (page) => {
    // Each of zoom/pan and screen-edge clamping is tested individually
    // elsewhere — this combines both, since neither test alone would catch
    // a regression that only appears when they interact (e.g. clamping
    // computed against the wrong, un-zoomed anchor).
    await addNodeViaButton(page, "#btn-add-node", 500, 400, "Member");
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Member"));

    const box = await page.locator("#canvas").boundingBox();
    const memberScreenBefore = await page.evaluate(() => {
      const n = window.__kg.state.nodes.find((l) => l.label === "Member");
      return window.__kg.worldToScreen(n.x + n.w / 2, n.y + n.h / 2);
    });

    // Zoom in heavily on the node, then pan it very close to the left
    // edge of the viewport — close enough that its true (unclamped)
    // center would render off-screen.
    await page.mouse.move(box.x + memberScreenBefore.x, box.y + memberScreenBefore.y);
    await page.mouse.wheel(0, -800);
    await page.mouse.move(box.x + 700, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 100, box.y + 300, { steps: 8 });
    await page.mouse.up();
    await waitForViewSettled(page);

    const trueAnchor = await page.evaluate(() => {
      const n = window.__kg.state.nodes.find((l) => l.label === "Member");
      return window.__kg.worldToScreen(n.x + n.w / 2, n.y + n.h / 2);
    });
    assert.ok(trueAnchor.x < 0, "sanity check: the node's true center is now genuinely off-screen to the left");

    // Double-click well inside the now-huge, mostly off-screen node box
    // (its right portion is still on-screen after the pan).
    await page.mouse.dblclick(box.x + 60, box.y + 350);
    await page.waitForSelector(".kg-inline-input");
    assert.equal(await page.locator(".kg-inline-input").inputValue(), "Member", "still the correct node, correctly pre-filled");

    const inputBox = await page.locator(".kg-inline-input").boundingBox();
    assert.ok(inputBox.x >= 0, `the clamp must still keep the field fully on-screen (x=${inputBox.x}), even anchored to an off-screen true center`);
    assert.ok(inputBox.x + inputBox.width <= box.width + 0.5, "field must not spill off the right edge either");
    const toolbarBottom = await page.evaluate(() => document.getElementById("toolbar").getBoundingClientRect().bottom);
    assert.ok(inputBox.y >= toolbarBottom - 0.5, "field must still clear the toolbar");

    await page.locator(".kg-inline-input").fill("Renamed Member");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    const renamed = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Renamed Member"));
    assert.ok(renamed, "the rename itself committed correctly despite both conditions combined");
    assert.equal(renamed.id, member.id);
  });
});

test("a rename field near the right/bottom viewport edge is clamped fully on-screen", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 400, 300, "Near Corner");
    const box = await page.locator("#canvas").boundingBox();
    const viewport = page.viewportSize();

    await page.mouse.move(box.x + 400, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + viewport.width - 15, box.y + viewport.height - 10, { steps: 10 });
    await page.mouse.up();
    await waitForViewSettled(page);

    const nodeScreen = await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      return window.__kg.worldToScreen(n.x + n.w / 2, n.y + n.h / 2);
    });
    await page.mouse.dblclick(box.x + nodeScreen.x, box.y + nodeScreen.y);
    await page.waitForSelector(".kg-inline-input");

    const inputBox = await page.locator(".kg-inline-input").boundingBox();
    assert.ok(inputBox.x + inputBox.width <= viewport.width + 0.5, `input right edge ${inputBox.x + inputBox.width} should be within viewport width ${viewport.width}`);
    assert.ok(inputBox.y + inputBox.height <= viewport.height + 0.5, `input bottom edge ${inputBox.y + inputBox.height} should be within viewport height ${viewport.height}`);
    await page.keyboard.press("Escape");
  });
});

test("the selection toolbar's rename button (touch equivalent) is unaffected by click position, since it never had one — still centers on the node", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-node", 600, 400, "Big Node");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 535, box.y + 375); // click near the corner to select, not the center
    await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display !== "none");

    await page.click("#sel-rename");
    await page.waitForSelector(".kg-inline-input");
    const center = await inputCenter(page);
    assert.ok(Math.abs(center.x - box.x - 600) < 1);
    assert.ok(Math.abs(center.y - box.y - 400) < 1);
    await page.keyboard.press("Escape");
  });
});

test("a renamed label/relation survives a reload, just like any other edit", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "A");
    await addNodeViaDblClick(page, 650, 250, "B");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "old relation");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(box.x + 250, box.y + 250);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("A Renamed");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    await page.evaluate(() => window.__kg.storage.whenIdle());
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 2);

    const label = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "A Renamed" || n.label === "A"));
    assert.equal(label.label, "A Renamed");
  });
});
