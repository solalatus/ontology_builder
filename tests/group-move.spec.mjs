import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaButton, dragNode } from "./lib/page.mjs";

// Places a 320x220 group centered at (gx, gy) and a 160x60 entity centered
// at (mx, my), then nudges the entity by a few pixels so its membership
// actually commits (creation alone never joins a group — Phase 2, Decision
// #2 — only a real drag-and-drop does).
async function setUpGroupWithMember(page, gx, gy, mx, my) {
  await addNodeViaButton(page, "#btn-add-group", gx, gy, "Group1");
  await addNodeViaButton(page, "#btn-add-node", mx, my, "Member");
  await dragNode(page, mx, my, mx + 5, my + 5);
}

async function nodeState(page) {
  return page.evaluate(() => window.__kg.state.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, w: n.w, h: n.h, groups: n.groups })));
}

// --- Group move drags contained members along --------------------------

test("dragging a group (not its resize handle) moves every contained member by the exact same delta", async () => {
  await withPage(async (page) => {
    await setUpGroupWithMember(page, 400, 300, 350, 300);
    const before = await nodeState(page);
    const member = before.find((n) => n.label === "Member");
    assert.deepEqual(member.groups.length, 1, "membership must have committed before the move");

    // Drag from a point on the group that does NOT overlap the member.
    await dragNode(page, 500, 380, 600, 530);

    const after = await nodeState(page);
    const group = after.find((n) => n.label === "Group1");
    const memberAfter = after.find((n) => n.label === "Member");
    assert.equal(group.x, 340); // 240 + 100
    assert.equal(group.y, 340); // 190 + 150
    assert.equal(memberAfter.x, member.x + 100);
    assert.equal(memberAfter.y, member.y + 150);
    assert.deepEqual(memberAfter.groups, member.groups, "membership survives an in-place move");
  });
});

test("resizing a group (its corner handle) never moves a contained member", async () => {
  await withPage(async (page) => {
    await setUpGroupWithMember(page, 400, 300, 350, 300);
    const before = await nodeState(page);
    const member = before.find((n) => n.label === "Member");
    const group = before.find((n) => n.label === "Group1");

    // Bottom-right resize handle sits at (group.x+group.w, group.y+group.h).
    await dragNode(page, group.x + group.w, group.y + group.h, group.x + group.w + 140, group.y + group.h + 140);

    const after = await nodeState(page);
    const memberAfter = after.find((n) => n.label === "Member");
    const groupAfter = after.find((n) => n.label === "Group1");
    assert.equal(memberAfter.x, member.x, "resize must never move a member's x");
    assert.equal(memberAfter.y, member.y, "resize must never move a member's y");
    assert.ok(groupAfter.w > group.w && groupAfter.h > group.h, "the group itself must actually have resized");
  });
});

test("a nested member (member of an inner group, which is itself a member of an outer group) moves too when the outer group is dragged", async () => {
  await withPage(async (page) => {
    // Outer group, big. Inner group, small enough to nest inside Outer but
    // still bigger (by area) than a default entity, so Deep can nest in it.
    await addNodeViaButton(page, "#btn-add-group", 700, 500, "Outer");
    await addNodeViaButton(page, "#btn-add-group", 300, 300, "Inner");
    const inner = (await nodeState(page)).find((n) => n.label === "Inner");
    await dragNode(page, inner.x + inner.w, inner.y + inner.h, inner.x + 200, inner.y + 150);

    // Drag Inner fully inside Outer's bounds to commit nesting.
    const outerBefore = (await nodeState(page)).find((n) => n.label === "Outer");
    const innerNow = (await nodeState(page)).find((n) => n.label === "Inner");
    const innerCenter = { x: innerNow.x + innerNow.w / 2, y: innerNow.y + innerNow.h / 2 };
    const targetCenter = { x: outerBefore.x + outerBefore.w / 2, y: outerBefore.y + outerBefore.h / 2 };
    await dragNode(page, innerCenter.x, innerCenter.y, targetCenter.x, targetCenter.y);

    // Add an entity and nest it inside Inner.
    const innerAfterNest = (await nodeState(page)).find((n) => n.label === "Inner");
    const entityPos = { x: innerAfterNest.x + 20, y: innerAfterNest.y + 20 };
    await addNodeViaButton(page, "#btn-add-node", entityPos.x + 80, entityPos.y + 30, "Deep");
    await dragNode(page, entityPos.x + 80, entityPos.y + 30, entityPos.x + 85, entityPos.y + 35);

    const beforeMove = await nodeState(page);
    const outer = beforeMove.find((n) => n.label === "Outer");
    const deep = beforeMove.find((n) => n.label === "Deep");
    const innerBeforeMove = beforeMove.find((n) => n.label === "Inner");
    assert.ok(deep.groups.length >= 1, "Deep must have committed membership somewhere");

    // Drag Outer from a corner that doesn't overlap Inner or Deep.
    await dragNode(page, outer.x + 10, outer.y + 10, outer.x + 210, outer.y + 160);

    const afterMove = await nodeState(page);
    const outerAfter = afterMove.find((n) => n.label === "Outer");
    const innerAfter = afterMove.find((n) => n.label === "Inner");
    const deepAfter = afterMove.find((n) => n.label === "Deep");
    const dx = outerAfter.x - outer.x, dy = outerAfter.y - outer.y;
    assert.equal(innerAfter.x, innerBeforeMove.x + dx);
    assert.equal(innerAfter.y, innerBeforeMove.y + dy);
    assert.equal(deepAfter.x, deep.x + dx, "a member of a member (nested two levels deep) must move too");
    assert.equal(deepAfter.y, deep.y + dy);
  });
});

test("dragging a group is still exactly one undo step, and undo restores every member's exact prior position", async () => {
  await withPage(async (page) => {
    await setUpGroupWithMember(page, 400, 300, 350, 300);
    const before = await nodeState(page);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);

    await dragNode(page, 500, 380, 650, 560);
    const historyAfterDrag = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfterDrag, historyBefore + 1, "group move + member cascade must be exactly one undo step");

    await page.click("#btn-undo");
    const afterUndo = await nodeState(page);
    for (const n of before) {
      const restored = afterUndo.find((x) => x.id === n.id);
      assert.equal(restored.x, n.x, `${n.label} x not restored`);
      assert.equal(restored.y, n.y, `${n.label} y not restored`);
    }

    await page.click("#btn-redo");
    const afterRedo = await nodeState(page);
    const memberRedo = afterRedo.find((n) => n.label === "Member");
    assert.equal(memberRedo.x, before.find((n) => n.label === "Member").x + 150);
    assert.equal(memberRedo.y, before.find((n) => n.label === "Member").y + 180);
  });
});

test("dragging a group onto a previously unrelated node still absorbs it AND carries existing members along, in one drag", async () => {
  await withPage(async (page) => {
    await setUpGroupWithMember(page, 400, 300, 350, 300);
    await addNodeViaButton(page, "#btn-add-node", 900, 600, "Newcomer");

    const before = await nodeState(page);
    const group = before.find((n) => n.label === "Group1");
    const newcomer = before.find((n) => n.label === "Newcomer");
    assert.equal(newcomer.groups.length, 0);

    // Drag the group so it now fully contains Newcomer too.
    const dx = newcomer.x + newcomer.w / 2 - (group.x + group.w / 2);
    const dy = newcomer.y + newcomer.h / 2 - (group.y + group.h / 2);
    await dragNode(page, group.x + 10, group.y + 10, group.x + 10 + dx, group.y + 10 + dy);

    const after = await nodeState(page);
    const memberAfter = after.find((n) => n.label === "Member");
    const newcomerAfter = after.find((n) => n.label === "Newcomer");
    assert.equal(memberAfter.x, before.find((n) => n.label === "Member").x + dx, "the pre-existing member must still have moved along");
    assert.ok(newcomerAfter.groups.length > 0, "the newly-overlapped node must have been absorbed");
    // Newcomer wasn't dragged itself — only absorbed by the group landing on it.
    assert.equal(newcomerAfter.x, newcomer.x);
    assert.equal(newcomerAfter.y, newcomer.y);
  });
});

test("a node that's a member of two overlapping groups keeps membership in the one being dragged, but loses it in the stationary one it no longer overlaps", async () => {
  await withPage(async (page) => {
    // A: 140,190..460,410 ; B: 240,190..560,410 ; overlap 240..460,190..410
    await addNodeViaButton(page, "#btn-add-group", 300, 300, "A");
    await addNodeViaButton(page, "#btn-add-group", 400, 300, "B");
    await addNodeViaButton(page, "#btn-add-node", 100, 700, "D");
    await dragNode(page, 100, 700, 350, 300); // D joins A (tie -> first created)
    await dragNode(page, 350, 300, 356, 304); // D joins B too (now member of both)

    let state = await nodeState(page);
    let d = state.find((n) => n.label === "D");
    const groupA = state.find((n) => n.label === "A");
    const groupB = state.find((n) => n.label === "B");
    assert.deepEqual(d.groups.sort(), [groupA.id, groupB.id].sort(), "D must be a member of both before the drag");

    // Drag A far away — D is a direct member of A, so it travels along;
    // B never moves, so D leaves B's now-stale overlap behind.
    await dragNode(page, groupA.x + 10, groupA.y + 10, groupA.x + 500, groupA.y + 500);

    state = await nodeState(page);
    d = state.find((n) => n.label === "D");
    const groupBAfter = state.find((n) => n.label === "B");
    assert.deepEqual(d.groups, [groupA.id], "D stays a member of A (carried along) but is released from B (never moved, no longer overlapped)");
    assert.deepEqual(groupBAfter, groupB, "B itself is completely untouched by A's drag");
  });
});

// --- Visual distinction: membership hue + move-vs-resize highlight -----

async function pixelAt(page, worldX, worldY) {
  return page.evaluate(({ wx, wy }) => {
    const canvas = document.getElementById("canvas");
    const c = canvas.getContext("2d");
    const screen = window.__kg.worldToScreen(wx, wy);
    const dpr = window.devicePixelRatio || 1;
    const data = c.getImageData(Math.round(screen.x * dpr), Math.round(screen.y * dpr), 1, 1).data;
    return [data[0], data[1], data[2]];
  }, { wx: worldX, wy: worldY });
}

test("a node's fill pixel changes once it becomes a group member, and reverts once it's dragged back out", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 400, 300, "Group1");
    await addNodeViaButton(page, "#btn-add-node", 900, 600, "Solo");
    await page.waitForTimeout(60);
    const soloBeforeCenter = (await nodeState(page)).find((n) => n.label === "Solo");
    const nonMemberPixel = await pixelAt(page, soloBeforeCenter.x + soloBeforeCenter.w / 2, soloBeforeCenter.y + 10);

    // Drag Solo fully inside the group to commit membership.
    const group = (await nodeState(page)).find((n) => n.label === "Group1");
    await dragNode(page, soloBeforeCenter.x + 10, soloBeforeCenter.y + 10, group.x + 40, group.y + 40);
    await page.waitForTimeout(60);
    const memberNow = (await nodeState(page)).find((n) => n.label === "Solo");
    assert.equal(memberNow.groups.length, 1);
    const memberPixel = await pixelAt(page, memberNow.x + memberNow.w / 2, memberNow.y + 10);

    assert.notDeepEqual(memberPixel, nonMemberPixel, "fill color must change once the node becomes a member");

    // Drag it back out.
    await dragNode(page, memberNow.x + 10, memberNow.y + 10, 900, 600);
    await page.waitForTimeout(60);
    const backOut = (await nodeState(page)).find((n) => n.label === "Solo");
    assert.equal(backOut.groups.length, 0);
    const revertedPixel = await pixelAt(page, backOut.x + backOut.w / 2, backOut.y + 10);
    assert.deepEqual(revertedPixel, nonMemberPixel, "fill color must revert once membership is released");
  });
});

test("window.__kg.getNodeVisualState reports isMember correctly for a member vs. a non-member vs. the group itself", async () => {
  await withPage(async (page) => {
    await setUpGroupWithMember(page, 400, 300, 350, 300);
    await addNodeViaButton(page, "#btn-add-node", 900, 600, "Solo");

    const ids = await page.evaluate(() => Object.fromEntries(window.__kg.state.nodes.map((n) => [n.label, n.id])));
    const groupState = await page.evaluate((id) => window.__kg.getNodeVisualState(id), ids.Group1);
    const memberState = await page.evaluate((id) => window.__kg.getNodeVisualState(id), ids.Member);
    const soloState = await page.evaluate((id) => window.__kg.getNodeVisualState(id), ids.Solo);

    assert.equal(groupState.isMember, false, "a group itself is never rendered with the member hue");
    assert.equal(memberState.isMember, true);
    assert.equal(soloState.isMember, false);
  });
});

test("mid-drag visual state: a group being moved reports isBeingMoved, never isBeingResized, and reverts once the drag ends", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 400, 300, "Group1");
    const box = await page.locator("#canvas").boundingBox();
    const groupId = await page.evaluate(() => window.__kg.state.nodes[0].id);

    await page.mouse.move(box.x + 500, box.y + 380); // a point on the group, off-handle
    await page.mouse.down();
    await page.mouse.move(box.x + 550, box.y + 430, { steps: 5 });

    const mid = await page.evaluate((id) => window.__kg.getNodeVisualState(id), groupId);
    assert.equal(mid.isBeingMoved, true);
    assert.equal(mid.isBeingResized, false);

    await page.mouse.up();
    const after = await page.evaluate((id) => window.__kg.getNodeVisualState(id), groupId);
    assert.equal(after.isBeingMoved, false, "the highlight must clear once the drag ends");
  });
});

test("mid-drag visual state: resizing a group reports isBeingResized, never isBeingMoved, and never moves the group's own position", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 400, 300, "Group1");
    const box = await page.locator("#canvas").boundingBox();
    const group = (await nodeState(page))[0];
    const groupId = group.id;

    await page.mouse.move(box.x + group.x + group.w, box.y + group.y + group.h); // resize handle
    await page.mouse.down();
    await page.mouse.move(box.x + group.x + group.w + 60, box.y + group.y + group.h + 60, { steps: 5 });

    const mid = await page.evaluate((id) => window.__kg.getNodeVisualState(id), groupId);
    assert.equal(mid.isBeingResized, true);
    assert.equal(mid.isBeingMoved, false);
    const midPos = (await nodeState(page)).find((n) => n.id === groupId);
    assert.equal(midPos.x, group.x, "a resize drag must never move the group's own x");
    assert.equal(midPos.y, group.y, "a resize drag must never move the group's own y");

    await page.mouse.up();
    const after = await page.evaluate((id) => window.__kg.getNodeVisualState(id), groupId);
    assert.equal(after.isBeingResized, false, "the highlight must clear once the drag ends");
  });
});
