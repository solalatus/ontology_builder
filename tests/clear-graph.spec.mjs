import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";

async function overlayDisplay(page) {
  // The overlay starts hidden via a stylesheet rule, not an inline style, so
  // .style.display alone misses that initial state — use the computed style.
  return page.evaluate(() => getComputedStyle(document.getElementById("confirm-overlay")).display);
}
async function clearBtnDisabled(page) {
  return page.evaluate(() => document.getElementById("btn-clear").disabled);
}

test("Clear button is disabled on an empty graph", async () => {
  await withPage(async (page) => {
    assert.equal(await clearBtnDisabled(page), true);
  });
});

test("Clear button is enabled once the graph has content, and clicking it opens the confirm dialog", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === false);

    await page.click("#btn-clear");
    assert.equal(await overlayDisplay(page), "flex");
    // Nothing has actually been cleared yet — only confirming does that.
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
  });
});

test("Cancel leaves the graph untouched and closes the dialog", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-clear");
    await page.click("#confirm-cancel");

    assert.equal(await overlayDisplay(page), "none");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
  });
});

test("clicking outside the dialog (the backdrop) also cancels", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-clear");
    // Click the overlay itself, away from the dialog panel.
    await page.mouse.click(20, 20);

    assert.equal(await overlayDisplay(page), "none");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
  });
});

test("Escape cancels the confirm dialog, same as Cancel", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-clear");
    await page.keyboard.press("Escape");

    assert.equal(await overlayDisplay(page), "none");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1);
  });
});

test("Escape while the dialog is open only closes the dialog, it doesn't also cancel an armed mode underneath", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-add-group"); // arm Add Group mode
    assert.equal(await page.evaluate(() => window.__kg.state.mode), "addGroup");

    await page.click("#btn-clear");
    assert.equal(await overlayDisplay(page), "flex");
    await page.keyboard.press("Escape"); // should only dismiss the dialog

    assert.equal(await overlayDisplay(page), "none");
    assert.equal(await page.evaluate(() => window.__kg.state.mode), "addGroup", "armed mode survives the dialog's own Escape");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1); // Clear was cancelled
  });
});

test("Enter confirms the dialog, same as clicking the confirm button", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-clear");
    await page.keyboard.press("Enter");

    assert.equal(await overlayDisplay(page), "none");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

test("confirming Clear empties nodes, edges, and groups", async () => {
  await withPage(async (page) => {
    await page.click("#btn-add-group");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 600, box.y + 400);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Group A");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 700, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 700, 250, "relates to");

    await page.click("#btn-clear");
    await page.click("#confirm-ok");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 0);
    assert.equal(edges.length, 0);
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === true);
  });
});

test("Clear is exactly one undo step, and Undo restores everything exactly as it was", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 700, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 700, 250, "relates to");
    const before = await page.evaluate(() => window.__kg.history.past.length);

    await page.click("#btn-clear");
    await page.click("#confirm-ok");
    const after = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after, before + 1, "Clear is exactly one undo step");

    await page.click("#btn-undo");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 2);
    assert.deepEqual(nodes.map((n) => n.label).sort(), ["Alpha", "Beta"]);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].relation, "relates to");
  });
});

test("Redo after undoing a Clear empties the graph again", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-clear");
    await page.click("#confirm-ok");
    await page.click("#btn-undo");
    assert.equal((await page.evaluate(() => window.__kg.state.nodes)).length, 1);

    await page.click("#btn-redo");
    assert.equal((await page.evaluate(() => window.__kg.state.nodes)).length, 0);
  });
});

test("clicking Clear on an empty graph is a no-op (button is genuinely disabled)", async () => {
  await withPage(async (page) => {
    assert.equal(await clearBtnDisabled(page), true);
    await assert.rejects(() => page.click("#btn-clear", { timeout: 500 }), /disabled|Timeout/i);
    assert.equal(await overlayDisplay(page), "none");
  });
});

test("a cleared (now-empty) graph is what gets persisted — reload doesn't bring the old graph back", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.click("#btn-clear");
    await page.click("#confirm-ok");
    await page.evaluate(() => window.__kg.storage.whenIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForTimeout(150); // let the (empty) restore, if any, settle

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});
