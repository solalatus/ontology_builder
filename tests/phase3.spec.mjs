import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, addNodeViaButton, dragNode, createEdgeViaConnectMode } from "./lib/page.mjs";

async function undoBtnDisabled(page) { return page.evaluate(() => document.getElementById("btn-undo").disabled); }
async function redoBtnDisabled(page) { return page.evaluate(() => document.getElementById("btn-redo").disabled); }
async function historyLengths(page) {
  return page.evaluate(() => ({ past: window.__kg.history.past.length, future: window.__kg.history.future.length }));
}

test("Undo and Redo buttons start disabled on a fresh graph", async () => {
  await withPage(async (page) => {
    assert.equal(await undoBtnDisabled(page), true);
    assert.equal(await redoBtnDisabled(page), true);
  });
});

test("after one action, Undo is enabled and Redo stays disabled", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    assert.equal(await undoBtnDisabled(page), false);
    assert.equal(await redoBtnDisabled(page), true);
  });
});

test("Add Node: Undo removes it, Redo restores it with the same id", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const originalId = await page.evaluate(() => window.__kg.state.nodes[0].id);

    await page.click("#btn-undo");
    let nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
    assert.equal(await undoBtnDisabled(page), true);
    assert.equal(await redoBtnDisabled(page), false);

    await page.click("#btn-redo");
    nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].id, originalId);
    assert.equal(nodes[0].label, "Alpha");
    assert.equal(await undoBtnDisabled(page), false);
    assert.equal(await redoBtnDisabled(page), true);
  });
});

test("Move node: Undo restores the exact original position, Redo re-applies the move", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const before = await page.evaluate(() => window.__kg.state.nodes[0]);

    await dragNode(page, 300, 300, 500, 450);
    const moved = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.notEqual(moved.x, before.x);

    await page.click("#btn-undo");
    const afterUndo = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(afterUndo.x, before.x);
    assert.equal(afterUndo.y, before.y);

    await page.click("#btn-redo");
    const afterRedo = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(afterRedo.x, moved.x);
    assert.equal(afterRedo.y, moved.y);
  });
});

test("Add Edge: Undo removes it, Redo restores it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "relates to");
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 1);

    await page.click("#btn-undo");
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 0);

    await page.click("#btn-redo");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].relation, "relates to");
  });
});

test("Toggle edge direction: Undo flips it back, Redo re-flips it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "");
    await page.click("#sel-toggle-dir");
    assert.equal(await page.evaluate(() => window.__kg.state.edges[0].directed), false);

    await page.click("#btn-undo");
    assert.equal(await page.evaluate(() => window.__kg.state.edges[0].directed), true);

    await page.click("#btn-redo");
    assert.equal(await page.evaluate(() => window.__kg.state.edges[0].directed), false);
  });
});

test("Delete node: Undo restores the node AND its incident edges as one step", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "relates to");

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 250, box.y + 250);
    await page.keyboard.press("Delete");
    assert.equal((await page.evaluate(() => window.__kg.state.nodes)).length, 1);
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 0);

    await page.click("#btn-undo");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 2);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].relation, "relates to");
  });
});

test("Delete edge (trash icon): Undo restores it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "relates to");
    await page.click("#sel-trash");
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 0);

    await page.click("#btn-undo");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].relation, "relates to");
  });
});

test("Group membership from a drag-in is a single undo step: Undo removes both groups[] and the auto edge together", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A");
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    const before = await historyLengths(page);

    await dragNode(page, 100, 100, 600, 400); // commits membership
    const after = await historyLengths(page);
    assert.equal(after.past, before.past + 1, "membership commit is exactly one more undo step, not two");

    let member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Member"));
    assert.equal(member.groups.length, 1);
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 1);

    await page.click("#btn-undo");
    member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Member"));
    assert.deepEqual(member.groups, []);
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 0);

    await page.click("#btn-redo");
    member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Member"));
    assert.equal(member.groups.length, 1);
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 1);
  });
});

test("resizing a group: Undo restores the exact original size, Redo re-applies it", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290..760,510
    await dragNode(page, 760, 510, 600, 380); // shrink via resize corner
    const resized = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(resized.w, 160);
    assert.equal(resized.h, 90);

    await page.click("#btn-undo");
    const restored = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(restored.w, 320);
    assert.equal(restored.h, 220);

    await page.click("#btn-redo");
    const redone = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(redone.w, 160);
    assert.equal(redone.h, 90);
  });
});

test("long-press delete is also exactly one undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + 300, box.y + 300);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();
    assert.equal((await page.evaluate(() => window.__kg.state.nodes)).length, 0);

    const lengths = await historyLengths(page);
    assert.equal(lengths.past, 2, "one step for add, one for the long-press delete");

    await page.click("#btn-undo");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].label, "Alpha");
  });
});

test("a new action after Undo discards the redo stack", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 500, 250, "Beta");
    await page.click("#btn-undo"); // Beta undone, redo now has one entry
    assert.equal(await redoBtnDisabled(page), false);

    await addNodeViaDblClick(page, 800, 250, "Gamma"); // a fresh action

    assert.equal(await redoBtnDisabled(page), true);
    const labels = (await page.evaluate(() => window.__kg.state.nodes)).map((n) => n.label).sort();
    assert.deepEqual(labels, ["Alpha", "Gamma"]);
  });
});

test("the Undo button is genuinely disabled with an empty stack (unclickable), and calling undo() directly is still a harmless no-op", async () => {
  await withPage(async (page) => {
    assert.equal(await undoBtnDisabled(page), true);
    await assert.rejects(() => page.click("#btn-undo", { timeout: 500 }), /disabled|Timeout/i);
    // Defensive check on the underlying guard, independent of the disabled attribute.
    await page.evaluate(() => window.__kg.actions.undo());
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0); // no error, nothing to undo
  });
});

test("the Redo button is genuinely disabled with an empty future stack, and calling redo() directly is still a harmless no-op", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    assert.equal(await redoBtnDisabled(page), true);
    await assert.rejects(() => page.click("#btn-redo", { timeout: 500 }), /disabled|Timeout/i);
    await page.evaluate(() => window.__kg.actions.redo());
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1); // unchanged
  });
});

test("each of several sequential add-node actions is exactly one undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 200, 200, "A");
    await addNodeViaDblClick(page, 400, 200, "B");
    await addNodeViaDblClick(page, 600, 200, "C");
    const lengths = await historyLengths(page);
    assert.equal(lengths.past, 3);

    await page.click("#btn-undo");
    await page.click("#btn-undo");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].label, "A");
  });
});

test("the undo stack is not persisted across reload — a fresh load always starts empty", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await addNodeViaDblClick(page, 500, 300, "Beta");
    let lengths = await historyLengths(page);
    assert.equal(lengths.past, 2);

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    lengths = await historyLengths(page);
    assert.equal(lengths.past, 0);
    assert.equal(lengths.future, 0);
    assert.equal(await undoBtnDisabled(page), true);
  });
});
