import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, addNodeViaButton, createEdgeViaConnectMode } from "./lib/page.mjs";

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

test("renaming a group node uses the group's placeholder and renames just as well as an entity", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Old Group Name");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.dblclick(box.x + 600, box.y + 400);
    await page.waitForSelector(".kg-inline-input");
    assert.equal(await page.locator(".kg-inline-input").getAttribute("placeholder"), "Group label");
    assert.equal(await page.locator(".kg-inline-input").inputValue(), "Old Group Name");
    await page.locator(".kg-inline-input").fill("New Group Name");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].label, "New Group Name");
    assert.equal(nodes[0].type, "group");
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
