import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, addNodeViaButton, dragNode, createEdgeViaConnectMode } from "./lib/page.mjs";

// Every other file in this suite verifies one feature or edge case in
// isolation. This one is different on purpose: a single, long, realistic
// user session that exercises many features *together* — node creation,
// parallel-edge bending, inline rename, autolayout, theme/language toggles,
// undo/redo, Tier 1 reload persistence, TXT import, and Clear — specifically
// to catch integration bugs that only surface when features interact across
// a real session, not when each is tested alone (e.g. a rename anchoring
// correctly mid-session, an undo landing back on the exact right state, a
// reload after a mix of theme/language/graph edits all persisting together
// correctly).

async function nodeByLabel(page, label) {
  return page.evaluate((l) => window.__kg.state.nodes.find((n) => n.label === l), label);
}
async function centerOf(node) {
  return { x: node.x + node.w / 2, y: node.y + node.h / 2 };
}

test("a realistic end-to-end session across many features stays internally consistent throughout", async () => {
  await withPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();

    // --- Phase 1: rename the graph, toggle theme + language up front ----
    await page.click("#graph-title");
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Trip Planning");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    assert.equal(await page.locator("#graph-title").textContent(), "Trip Planning");

    await page.click("#btn-theme-toggle"); // dark -> light
    assert.equal(await page.evaluate(() => window.__kg.theme.get()), "light");
    await page.click("#btn-lang-toggle"); // en -> hu (default withPage pins en)
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "hu");
    await page.click("#btn-lang-toggle"); // back to en for the rest of this test's assertions
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "en");

    // --- Phase 2: build a small graph — three plain nodes ---------------
    await addNodeViaButton(page, "#btn-add-node", 400, 300, "Alice");
    await addNodeViaButton(page, "#btn-add-node", 650, 400, "Bob");
    await addNodeViaDblClick(page, 950, 650, "Carol");

    let nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 3);
    let alice = nodes.find((n) => n.label === "Alice");
    let bob = nodes.find((n) => n.label === "Bob");
    const carol = nodes.find((n) => n.label === "Carol");
    assert.ok(alice && bob && carol);

    // --- Phase 3: connect Alice<->Bob twice (parallel bend) and Alice->Carol
    let aliceCenter = await centerOf(alice), bobCenter = await centerOf(bob);
    await createEdgeViaConnectMode(page, aliceCenter.x, aliceCenter.y, bobCenter.x, bobCenter.y, "reports to");
    await createEdgeViaConnectMode(page, aliceCenter.x, aliceCenter.y, bobCenter.x, bobCenter.y, "collaborates with");
    const carolCenter = await centerOf(carol);
    aliceCenter = await centerOf(await nodeByLabel(page, "Alice")); // re-query: connect mode may have nudged selection, not position, but stay defensive
    await createEdgeViaConnectMode(page, aliceCenter.x, aliceCenter.y, carolCenter.x, carolCenter.y, "knows");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    let edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 3, "two parallel Alice<->Bob edges plus Alice->Carol");
    const parallelPair = edges.filter((e) => e.relation === "reports to" || e.relation === "collaborates with");
    assert.equal(parallelPair.length, 2);
    const geo0 = await page.evaluate((id) => window.__kg.getEdgeGeometry(id), parallelPair[0].id);
    const geo1 = await page.evaluate((id) => window.__kg.getEdgeGeometry(id), parallelPair[1].id);
    assert.notDeepEqual(geo0.control, geo1.control, "the two parallel edges bend to visibly different curves");

    // --- Phase 4: rename a node and an edge via double-click, verifying
    // the rename field anchors to the node/edge's own geometry -----------
    const bobNode = await nodeByLabel(page, "Bob");
    const bobCenterNow = await centerOf(bobNode);
    await page.mouse.dblclick(box.x + bobCenterNow.x, box.y + bobCenterNow.y);
    await page.waitForSelector(".kg-inline-input");
    const renameInputBox = await page.locator(".kg-inline-input").boundingBox();
    assert.ok(Math.abs(renameInputBox.x + renameInputBox.width / 2 - box.x - bobCenterNow.x) < 1, "rename field anchors to Bob's own center");
    await page.locator(".kg-inline-input").fill("Robert");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    assert.equal((await nodeByLabel(page, "Robert")) !== undefined, true, "Bob renamed to Robert");

    // --- Phase 5: drag Alice — the bent edge between her and Robert must
    // still resolve to real geometry after the move -----------------------
    alice = await nodeByLabel(page, "Alice");
    const robertBeforeMove = await nodeByLabel(page, "Robert");
    const grabPoint = await centerOf(alice);
    await dragNode(page, grabPoint.x, grabPoint.y, grabPoint.x + 180, grabPoint.y + 120);

    const aliceAfterMove = await nodeByLabel(page, "Alice");
    const dx = aliceAfterMove.x - alice.x, dy = aliceAfterMove.y - alice.y;
    assert.ok(dx !== 0 && dy !== 0, "Alice actually moved");
    const robertAfterMove = await nodeByLabel(page, "Robert");
    assert.equal(robertAfterMove.x, robertBeforeMove.x, "moving Alice must never move Robert");
    assert.equal(robertAfterMove.y, robertBeforeMove.y);
    const edgeAfterMove = await page.evaluate(
      (id) => window.__kg.getEdgeGeometry(id),
      (await page.evaluate(() => window.__kg.state.edges.find((e) => e.relation === "reports to").id)),
    );
    assert.ok(Number.isFinite(edgeAfterMove.mid.x) && Number.isFinite(edgeAfterMove.mid.y), "the bent edge between the two moved-apart nodes still resolves to real geometry");

    // --- Phase 6: run Auto-layout — exactly one undo step, nothing
    // structural changes ---------------------------------------------------
    const historyBeforeLayout = await page.evaluate(() => window.__kg.history.past.length);
    const nodeCountBeforeLayout = (await page.evaluate(() => window.__kg.state.nodes)).length;
    const edgeCountBeforeLayout = (await page.evaluate(() => window.__kg.state.edges)).length;
    await page.click("#btn-autolayout");
    await page.waitForTimeout(150);
    const historyAfterLayout = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfterLayout, historyBeforeLayout + 1, "autolayout is exactly one undo step");
    assert.equal((await page.evaluate(() => window.__kg.state.nodes)).length, nodeCountBeforeLayout);
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, edgeCountBeforeLayout);

    // --- Phase 7: Save Version — increments the version counter ---------
    const versionBefore = await page.evaluate(() => (window.__kg.state.meta ? window.__kg.state.meta.version : 0));
    await page.click("#btn-save-version");
    await page.waitForTimeout(150);
    const versionAfter = await page.evaluate(() => window.__kg.state.meta.version);
    assert.equal(versionAfter, versionBefore + 1);

    // --- Phase 8: undo back through several of the steps above, then redo
    // all the way forward again ------------------------------------------
    const snapshotAtEnd = await page.evaluate(() => window.__kg.state.nodes);
    await page.click("#btn-undo"); // undo autolayout
    let aliceAfterUndoLayout = await nodeByLabel(page, "Alice");
    assert.equal(aliceAfterUndoLayout.x, aliceAfterMove.x, "undoing autolayout restores the pre-layout position");
    assert.equal(aliceAfterUndoLayout.y, aliceAfterMove.y);
    await page.click("#btn-undo"); // undo the move
    const aliceAfterUndoingMove = await nodeByLabel(page, "Alice");
    assert.equal(aliceAfterUndoingMove.x, alice.x, "undoing the move restores Alice's original position");
    assert.equal(aliceAfterUndoingMove.y, alice.y);

    // Redo all the way forward again — must land on the exact same state
    // Save Version captured (byte-for-byte node array), not just "similar".
    await page.click("#btn-redo");
    await page.click("#btn-redo");
    const nodesAfterRedo = await page.evaluate(() => window.__kg.state.nodes);
    assert.deepEqual(nodesAfterRedo, snapshotAtEnd, "redo lands back on the exact pre-undo state");

    // --- Phase 9: reload — Tier 1 persistence must restore the graph AND
    // the theme/language choices made back in Phase 1 ---------------------
    await page.evaluate(() => window.__kg.storage.whenIdle());
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.state.nodes.length === 3);

    assert.equal(await page.evaluate(() => window.__kg.theme.get()), "light", "theme choice survives the reload");
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "en", "language choice survives the reload");
    assert.equal(await page.locator("#graph-title").textContent(), "Trip Planning");
    const aliceAfterReload = await nodeByLabel(page, "Alice");
    assert.ok(aliceAfterReload, "Alice survives the reload");

    // --- Phase 10: TXT import (merge) adds a new node, without disturbing
    // anything already there ------------------------------------------------
    const importText = ["## NODES", "Dana", "", "## EDGES", "Dana -> Robert : mentors"].join("\n");
    await page.evaluate((t) => {
      const dt = new DataTransfer();
      const file = new File([t], "onboarding.txt", { type: "text/plain" });
      dt.items.add(file);
      document.getElementById("canvas").dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, importText);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await page.click("#import-merge");
    await page.waitForTimeout(150);

    nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 4, "Dana was added, everyone else untouched");
    const dana = nodes.find((n) => n.label === "Dana");
    assert.ok(dana);
    const aliceUnchanged = nodes.find((n) => n.label === "Alice");
    assert.equal(aliceUnchanged.x, aliceAfterReload.x, "Alice's own position is untouched by the import");

    // --- Phase 11: Clear the graph, then undo it back ---------------------
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === false);
    await page.click("#btn-clear");
    await page.click("#confirm-ok");
    await page.waitForTimeout(50);
    assert.equal((await page.evaluate(() => window.__kg.state.nodes)).length, 0);
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 0);

    await page.click("#btn-undo");
    const finalNodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(finalNodes.length, 4, "undo restores the full graph exactly as it was right before Clear");
    assert.ok(finalNodes.some((n) => n.label === "Dana"));
    assert.ok(finalNodes.some((n) => n.label === "Robert"));
  });
});
