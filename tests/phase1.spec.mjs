import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

test("double-click empty canvas adds a node with the entered label", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].label, "Alpha");
    assert.equal(nodes[0].type, "entity");
    assert.equal(nodes[0].w, 160);
    assert.equal(nodes[0].h, 60);
    assert.deepEqual(nodes[0].groups, []);
  });
});

test("dblclick on an existing node does not create a duplicate", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(box.x + 300, box.y + 300);
    await page.waitForTimeout(100);
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
  });
});

test("Add Node button arms placement mode; next canvas tap places one node", async () => {
  await withPage(async (page) => {
    await page.click("#btn-add-node");
    let mode = await page.evaluate(() => window.__kg.state.mode);
    assert.equal(mode, "addNode");

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 400, box.y + 250);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Beta");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].label, "Beta");

    mode = await page.evaluate(() => window.__kg.state.mode);
    assert.equal(mode, "idle", "Add Node is one-shot, mode reverts after placement");
  });
});

test("Escape while Add Node is armed cancels back to idle without placing", async () => {
  await withPage(async (page) => {
    await page.click("#btn-add-node");
    await page.keyboard.press("Escape");
    const mode = await page.evaluate(() => window.__kg.state.mode);
    assert.equal(mode, "idle");
  });
});

test("dragging a node body moves it by the drag delta", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const before = await page.evaluate(() => window.__kg.state.nodes[0]);
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + 300, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 360, box.y + 340, { steps: 5 });
    await page.mouse.up();
    const after = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.ok(Math.abs(after.x - before.x - 60) < 2, `dx ~ 60, got ${after.x - before.x}`);
    assert.ok(Math.abs(after.y - before.y - 40) < 2, `dy ~ 40, got ${after.y - before.y}`);
  });
});

test("dragging from a node's edge handle to another node creates a directed edge", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    const box = await page.locator("#canvas").boundingBox();
    // Alpha is centered at (250,250), default w=160 -> right-mid handle at screen x=330,y=250.
    await page.mouse.move(box.x + 330, box.y + 250);
    await page.mouse.down();
    await page.mouse.move(box.x + 600, box.y + 250, { steps: 8 });
    await page.mouse.up();
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("relates to");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].relation, "relates to");
    assert.equal(edges[0].directed, true);
    assert.equal(edges[0].auto, false);
  });
});

async function createEdgeViaConnectMode(page, ax, ay, bx, by, relation) {
  await page.click("#btn-connect");
  const box = await page.locator("#canvas").boundingBox();
  await page.mouse.click(box.x + ax, box.y + ay);
  await page.mouse.click(box.x + bx, box.y + by);
  await page.waitForSelector(".kg-inline-input");
  if (relation) await page.locator(".kg-inline-input").fill(relation);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".kg-inline-input", { state: "detached" });
}

test("Connect mode: tap source then target creates an edge", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "connects to");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].relation, "connects to");
  });
});

test("Escape cancels a pending Connect-mode source selection", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await page.click("#btn-connect");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 250, box.y + 250);
    let source = await page.evaluate(() => window.__kg.state.connectSource);
    assert.equal(source, "n1");
    await page.keyboard.press("Escape");
    source = await page.evaluate(() => window.__kg.state.connectSource);
    assert.equal(source, null);
  });
});

test("selecting an edge and clicking the direction toggle flips directed", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "");

    let edge = await page.evaluate(() => window.__kg.state.edges[0]);
    assert.equal(edge.directed, true);

    await page.click("#sel-toggle-dir");
    edge = await page.evaluate(() => window.__kg.state.edges[0]);
    assert.equal(edge.directed, false);
  });
});

test("Delete key removes the selected node and its incident edges", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "");

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 250, box.y + 250);
    const selType = await page.evaluate(() => window.__kg.state.selection.type);
    assert.equal(selType, "node");

    await page.keyboard.press("Delete");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].label, "Beta");
    assert.equal(edges.length, 0);
  });
});

test("trash icon deletes the selected edge", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "");

    await page.click("#sel-trash");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 0);
  });
});

test("long-press on a node deletes it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + 300, box.y + 300);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

test("a short press (below long-press threshold) does not delete, just selects", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + 300, box.y + 300);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.up();
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
  });
});

test("pan still works unaffected by node/edge interaction handling (no regression)", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    // drag starting on empty canvas, away from the node, should pan
    await page.mouse.move(box.x + 900, box.y + 600);
    await page.mouse.down();
    await page.mouse.move(box.x + 850, box.y + 560, { steps: 5 });
    await page.mouse.up();
    const camera = await page.evaluate(() => window.__kg.camera);
    assert.ok(Math.abs(camera.panX - -50) < 2);
    assert.ok(Math.abs(camera.panY - -40) < 2);
  });
});
