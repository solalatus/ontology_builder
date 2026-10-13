import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, dragNode } from "./lib/page.mjs";

// Issues #163 and #164: the Helper Agent panel shifts #canvas-wrap right
// (issue #55), animated by a CSS `left` transition. #163: the canvas's
// backing store used to be sized from a measurement taken *before* that
// transition moved the box, so it stayed stale (stretched drawing, drags
// panning instead of moving nodes) until a window resize. #164: HTML
// overlays anchored to world coordinates (selection toolbar, inline rename
// inputs) used canvas-local coordinates as page coordinates, so they landed
// one panel-width too far left whenever the panel was open.

async function canvasSizes(page) {
  return page.evaluate(() => {
    const c = document.getElementById("canvas");
    const rect = c.getBoundingClientRect();
    return { bufferW: c.width, bufferH: c.height, rectW: rect.width, rectH: rect.height, rectLeft: rect.left, dpr: window.devicePixelRatio || 1 };
  });
}

// Waits for the panel transition to finish: the canvas box has stopped
// moving and sits at the panel offset.
async function expandPanelAndSettle(page) {
  await page.click("#agent-panel-toggle");
  await page.waitForFunction(() => window.__kg.agent.isExpanded());
  await page.waitForFunction(() => {
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--agent-panel-offset")) || 0;
    return offset > 0 && Math.abs(document.getElementById("canvas").getBoundingClientRect().left - offset) < 0.5;
  });
}

function bufferMatches(s) {
  return Math.abs(s.bufferW - Math.round(s.rectW * s.dpr)) <= 1 && Math.abs(s.bufferH - Math.round(s.rectH * s.dpr)) <= 1;
}

test("#163: after expanding the Helper Agent panel, the canvas backing store matches its real (shrunk) size without any window resize", async () => {
  await withPage(async (page) => {
    const before = await canvasSizes(page);
    assert.ok(bufferMatches(before), "sanity: buffer matches the box with the panel collapsed");

    await expandPanelAndSettle(page);
    // The ResizeObserver fires on the frame after layout settles; wait for
    // it rather than guessing a delay. Before the fix this never became true.
    await page.waitForFunction(() => {
      const c = document.getElementById("canvas");
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      return Math.abs(c.width - Math.round(r.width * dpr)) <= 1;
    }, null, { timeout: 3000 });
    const after = await canvasSizes(page);
    assert.ok(after.rectW < before.rectW, "the canvas box really shrank");
    assert.ok(bufferMatches(after), `buffer ${after.bufferW}x${after.bufferH} should match box ${after.rectW}x${after.rectH} @${after.dpr}x`);
  });
});

test("#163: collapsing the panel again restores a full-width backing store", async () => {
  await withPage(async (page) => {
    await expandPanelAndSettle(page);
    await page.click("#agent-panel-toggle");
    await page.waitForFunction(() => !window.__kg.agent.isExpanded());
    await page.waitForFunction(() => document.getElementById("canvas").getBoundingClientRect().left < 0.5);
    await page.waitForFunction(() => {
      const c = document.getElementById("canvas");
      return Math.abs(c.width - Math.round(c.getBoundingClientRect().width * (window.devicePixelRatio || 1))) <= 1;
    }, null, { timeout: 3000 });
    const s = await canvasSizes(page);
    assert.ok(bufferMatches(s));
    assert.equal(Math.round(s.rectW), 1200, "full viewport width again");
  });
});

test("#163: with the panel open, dragging a node moves the node (it does not pan the canvas)", async () => {
  await withPage(async (page) => {
    await expandPanelAndSettle(page);
    await page.waitForFunction(() => {
      const c = document.getElementById("canvas");
      return Math.abs(c.width - Math.round(c.getBoundingClientRect().width * (window.devicePixelRatio || 1))) <= 1;
    });
    await addNodeViaDblClick(page, 400, 300, "Alpha");
    await page.evaluate(() => window.__kg.actions.clearSelection());
    const cameraBefore = await page.evaluate(() => ({ ...window.__kg.camera }));
    const nodeBefore = await page.evaluate(() => ({ ...window.__kg.state.nodes[0] }));

    await dragNode(page, 400, 300, 520, 360);

    const cameraAfter = await page.evaluate(() => ({ ...window.__kg.camera }));
    const nodeAfter = await page.evaluate(() => ({ ...window.__kg.state.nodes[0] }));
    assert.deepEqual(cameraAfter, cameraBefore, "the camera did not pan");
    assert.ok(nodeAfter.x - nodeBefore.x > 80, `node moved right (dx=${nodeAfter.x - nodeBefore.x})`);
    assert.ok(nodeAfter.y - nodeBefore.y > 30, `node moved down (dy=${nodeAfter.y - nodeBefore.y})`);
  });
});

async function nodePageRect(page, label) {
  return page.evaluate((l) => {
    const n = window.__kg.state.nodes.find((x) => x.label === l);
    const cam = window.__kg.camera;
    const r = document.getElementById("canvas").getBoundingClientRect();
    return {
      left: n.x * cam.scale + cam.panX + r.left, top: n.y * cam.scale + cam.panY + r.top,
      right: (n.x + n.w) * cam.scale + cam.panX + r.left, bottom: (n.y + n.h) * cam.scale + cam.panY + r.top,
    };
  }, label);
}

test("#164: with the panel open, the selection toolbar is anchored to the selected node, not one panel-width to its left", async () => {
  await withPage(async (page) => {
    await expandPanelAndSettle(page);
    await addNodeViaDblClick(page, 400, 300, "Alpha");
    await page.evaluate(() => window.__kg.actions.selectNode(window.__kg.state.nodes[0].id));
    await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display === "flex");

    const node = await nodePageRect(page, "Alpha");
    const anchor = await page.evaluate(() => {
      const el = document.getElementById("sel-toolbar");
      return { left: parseFloat(el.style.left), top: parseFloat(el.style.top) };
    });
    assert.ok(Math.abs(anchor.left - node.right) < 1, `toolbar anchor x ${anchor.left} should be the node's right edge ${node.right}`);
    assert.ok(Math.abs(anchor.top - node.top) < 1, `toolbar anchor y ${anchor.top} should be the node's top edge ${node.top}`);
    const canvasLeft = await page.evaluate(() => document.getElementById("canvas").getBoundingClientRect().left);
    const tb = await page.locator("#sel-toolbar").boundingBox();
    assert.ok(tb.x > canvasLeft, "the toolbar sits over the canvas, not under the panel");
  });
});

test("#164: with the panel open, double-clicking a node opens the rename input over that node", async () => {
  await withPage(async (page) => {
    await expandPanelAndSettle(page);
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await addNodeViaDblClick(page, 650, 300, "Beta");
    const beta = await nodePageRect(page, "Beta");

    await page.mouse.dblclick((beta.left + beta.right) / 2, (beta.top + beta.bottom) / 2);
    await page.waitForSelector(".kg-inline-input");
    assert.equal(await page.locator(".kg-inline-input").inputValue(), "Beta");
    const box = await page.locator(".kg-inline-input").boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    assert.ok(cx > beta.left && cx < beta.right, `input center x ${cx} should be inside Beta [${beta.left}, ${beta.right}]`);
    assert.ok(cy > beta.top && cy < beta.bottom, `input center y ${cy} should be inside Beta [${beta.top}, ${beta.bottom}]`);

    await page.locator(".kg-inline-input").fill("Gamma");
    await page.keyboard.press("Enter");
    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label).sort());
    assert.deepEqual(labels, ["Alpha", "Gamma"], "renamed the node that was double-clicked");
  });
});

test("#164: with the panel open, the selection-toolbar rename button opens the edge rename input over the edge midpoint", async () => {
  await withPage(async (page) => {
    await expandPanelAndSettle(page);
    await addNodeViaDblClick(page, 200, 300, "Alpha");
    await addNodeViaDblClick(page, 600, 300, "Beta");
    await page.evaluate(() => {
      const [a, b] = window.__kg.state.nodes;
      const e = window.__kg.actions.createEdge(a.id, b.id, "relates to", true);
      window.__kg.actions.selectEdge(e.id);
    });
    await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display === "flex");
    await page.click("#sel-rename");
    await page.waitForSelector(".kg-inline-input");
    assert.equal(await page.locator(".kg-inline-input").inputValue(), "relates to");

    const mid = await page.evaluate(() => {
      const [a, b] = window.__kg.state.nodes;
      const cam = window.__kg.camera;
      const r = document.getElementById("canvas").getBoundingClientRect();
      const wx = (a.x + a.w / 2 + b.x + b.w / 2) / 2, wy = (a.y + a.h / 2 + b.y + b.h / 2) / 2;
      return { x: wx * cam.scale + cam.panX + r.left, y: wy * cam.scale + cam.panY + r.top };
    });
    const box = await page.locator(".kg-inline-input").boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    assert.ok(Math.abs(cx - mid.x) < 4, `input center x ${cx} near edge midpoint ${mid.x}`);
    assert.ok(Math.abs(cy - mid.y) < 4, `input center y ${cy} near edge midpoint ${mid.y}`);
    await page.keyboard.press("Escape");
  });
});

test("#164: with the panel open, an inline input near the canvas's left edge is clamped to the canvas, not hidden under the panel", async () => {
  await withPage(async (page) => {
    await expandPanelAndSettle(page);
    // Double-click empty canvas right at its left edge: the new-node input
    // is centered on the click, so unclamped it would hang over the panel.
    const canvasBox = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(canvasBox.x + 5, canvasBox.y + 300);
    await page.waitForSelector(".kg-inline-input");
    const box = await page.locator(".kg-inline-input").boundingBox();
    assert.ok(box.x >= canvasBox.x, `input left ${box.x} should not be left of the canvas ${canvasBox.x}`);
    await page.keyboard.press("Escape");
  });
});

test("#164: with the panel collapsed, overlay anchoring is unchanged (toolbar at the node's right edge)", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 400, 300, "Alpha");
    await page.evaluate(() => window.__kg.actions.selectNode(window.__kg.state.nodes[0].id));
    await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display === "flex");
    const node = await nodePageRect(page, "Alpha");
    const left = await page.evaluate(() => parseFloat(document.getElementById("sel-toolbar").style.left));
    assert.ok(Math.abs(left - node.right) < 1);
  });
});
