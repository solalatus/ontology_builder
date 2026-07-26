import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, addNodeViaButton, dragNode } from "./lib/page.mjs";

// Defaults from index.html: entity 160x60, group 320x220. A node created via
// a click at (sx, sy) is centered there, so its rect is
// [sx - w/2, sy - w/2] .. [sx + w/2, sy + h/2].

test("Add Group creates a type:group node with the Section 4.3 defaults", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A");
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(node.type, "group");
    assert.equal(node.w, 320);
    assert.equal(node.h, 220);
    assert.equal(node.boundary_mode, "manual");
    assert.deepEqual(node.groups, []);
    assert.equal(node.label, "Group A");
  });
});

test("Add Group is one-shot: mode reverts to idle after placement", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A");
    const mode = await page.evaluate(() => window.__kg.state.mode);
    assert.equal(mode, "idle");
  });
});

test("Escape while Add Group is armed cancels back to idle without placing", async () => {
  await withPage(async (page) => {
    await page.click("#btn-add-group");
    await page.keyboard.press("Escape");
    const mode = await page.evaluate(() => window.__kg.state.mode);
    assert.equal(mode, "idle");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

test("dragging a smaller node fully into a group commits membership and creates exactly one auto contains edge", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");   // rect 20,70 .. 180,130 (outside)
    await dragNode(page, 100, 100, 600, 400); // drop at group's center

    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);

    assert.deepEqual(member.groups, [group.id]);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].source, group.id);
    assert.equal(edges[0].target, member.id);
    assert.equal(edges[0].relation, "contains");
    assert.equal(edges[0].directed, true);
    assert.equal(edges[0].auto, true);
  });
});

test("a node created directly inside a group's boundary does not auto-join (creation is not a drag-drop)", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 600, 400, "Member");   // created already fully inside
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.deepEqual(member.groups, []);
    assert.equal(edges.length, 0);
  });
});

test("a drop that only partially overlaps the group does not commit membership", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    await dragNode(page, 100, 100, 440, 400); // centered on the group's left edge: half in, half out
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.deepEqual(member.groups, []);
    assert.equal(edges.length, 0);
  });
});

test("a drop that only partially overlaps does not remove already-committed membership", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400); // full containment: commits
    await dragNode(page, 600, 400, 760, 400); // now centered on the group's right edge: partial overlap

    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.deepEqual(member.groups, [group.id]);
    assert.equal(edges.length, 1);
  });
});

test("dragging a member fully outside the group removes membership and its contains edge", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A");
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400); // commits
    await dragNode(page, 600, 400, 100, 100); // drag it back out, fully clear of the group

    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.deepEqual(member.groups, []);
    assert.equal(edges.length, 0);
  });
});

// NOTE: this is the SECOND reversal of this decision — see the dated Log
// entries. First, moving a group never cascaded membership at all. Then a
// user-requested change made a group's own drag symmetric with a member's
// own drag: dropping onto previously-unrelated nodes absorbed them, and
// dragging away from a member (down to zero overlap) released it. Now, a
// group's move is a *rigid-body* operation: every currently-contained
// member (recursively, including members of nested member groups) moves by
// the exact same delta as the group itself, so its position *relative to
// the group* never changes during the drag — which makes "drag the group
// away until it stops overlapping a member" physically unreachable, since
// the member is welded to the group's own motion. A member can still only
// ever be released by its own independent drag (below). Absorbing
// previously-unrelated nodes the group's new position now covers is
// unaffected by this and still happens, since those nodes don't move.
// Resizing (below) is unchanged and still never cascades or drags members,
// per Section 4.3's explicit language about that specific case.
test("dragging a group far away keeps a contained member fully intact — it travels with the group instead of being released", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400); // commits; member now centered at group's center

    // Grab the group at a point inside its box but outside the member's box,
    // and drag it very far away.
    await dragNode(page, 460, 300, 1500, 1500);

    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);

    assert.notEqual(group.x, 440); // it actually moved
    assert.deepEqual(member.groups, [group.id], "the member travels with the group instead of losing membership");
    assert.equal(edges.length, 1, "the contains edge survives the move too");
  });
});

test("nudging a group by a small delta carries a member by the exact same delta, staying fully (not partially) contained", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member"); // will land at 600,400 center -> rect 520,370..680,430
    await dragNode(page, 100, 100, 600, 400); // commits
    const memberBefore = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));

    // A small nudge would have left only partial overlap under the old,
    // non-rigid behavior — now the member rides along, so it stays exactly
    // where it always was relative to the group.
    await dragNode(page, 460, 300, 560, 300);

    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    assert.equal(member.x, memberBefore.x + 100, "member moves by the same delta as the group (100,0)");
    assert.equal(member.y, memberBefore.y);
    assert.deepEqual(member.groups, [group.id], "still fully contained, since it moved rigidly with the group");
  });
});

test("dragging a group onto previously-unrelated nodes absorbs them as members", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 100, 100, "Group A"); // rect -60,-10 .. 260,210
    await addNodeViaDblClick(page, 900, 700, "Loner");

    // Loner sits far from Group A initially — no membership yet.
    let loner = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Loner"));
    assert.deepEqual(loner.groups, []);

    // Drag the group (grabbed at a point inside it, away from any handle)
    // so it now fully contains Loner.
    const lonerCenter = { x: loner.x + loner.w / 2, y: loner.y + loner.h / 2 };
    await dragNode(page, 100, 100, lonerCenter.x, lonerCenter.y);

    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    loner = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Loner"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    const autoEdge = edges.find((e) => e.auto);

    assert.deepEqual(loner.groups, [group.id], "Loner joins the group purely because the group was dragged onto it");
    assert.equal(autoEdge.source, group.id);
    assert.equal(autoEdge.target, loner.id);
  });
});

test("dragging a group onto a new node absorbs it, while an existing member (carried along in the same drag) keeps its own membership — all as one undo step", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "OldMember");
    await dragNode(page, 100, 100, 600, 400); // OldMember joins Group A
    await addNodeViaDblClick(page, 900, 600, "NewNeighbor"); // rect 820,570..980,630
    const oldMemberBefore = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "OldMember"));

    const before = await page.evaluate(() => window.__kg.history.past.length);
    // Grab point (460,300) is offset (-140,-100) from the group's own
    // center (600,400); dragging that grab point to NewNeighbor's center
    // minus that same offset lands the group's *center* exactly on
    // NewNeighbor's center, guaranteeing full containment (group is
    // 320x220, well bigger than NewNeighbor's default 160x60).
    await dragNode(page, 460, 300, 900 - 140, 600 - 100);

    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    const oldMember = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "OldMember"));
    const newNeighbor = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "NewNeighbor"));
    assert.deepEqual(oldMember.groups, [group.id], "carried along with the group, so it's still fully contained");
    assert.equal(oldMember.x, oldMemberBefore.x + (900 - 140 - 460));
    assert.equal(oldMember.y, oldMemberBefore.y + (600 - 100 - 300));
    assert.deepEqual(newNeighbor.groups, [group.id], "absorbed because the group's new position now covers it");

    const after = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after, before + 1, "the whole drag (move + carry + absorb) is exactly one undo step");

    await page.click("#btn-undo");
    const oldMemberRestored = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "OldMember"));
    const newNeighborRestored = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "NewNeighbor"));
    assert.deepEqual(oldMemberRestored, oldMemberBefore, "undo restores the member's exact prior position/membership");
    assert.deepEqual(newNeighborRestored.groups, [], "undo also reverts the newly-absorbed membership");
  });
});

test("resizing the group afterward does not alter existing membership", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400); // commits

    // Shrink the group via its resize corner (760,510) down to well below the member's extent.
    await dragNode(page, 760, 510, 500, 350);

    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);

    assert.ok(group.w < 320 && group.h < 220); // it actually shrank
    assert.deepEqual(member.groups, [group.id]); // still a member, unchanged by resize
    assert.equal(edges.length, 1);
  });
});

test("dragging a group's resize corner changes w/h by the drag delta and is clamped to a minimum size", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510, corner at 760,510
    await dragNode(page, 760, 510, 600, 380); // dx=-160, dy=-130
    let group = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(group.w, 160);
    assert.equal(group.h, 90);

    // Drag far past the minimum — should clamp, not collapse to zero/negative.
    await dragNode(page, 600, 380, -5000, -5000);
    group = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.ok(group.w > 0);
    assert.ok(group.h > 0);
    assert.equal(group.w, 60); // MIN_GROUP_SIZE
    assert.equal(group.h, 60);
  });
});

test("recursive membership: a resized (smaller) group can join a bigger group, and an entity dropped in the nested area joins only the innermost group", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 700, 400, "Outer"); // rect 540,290 .. 860,510
    await addNodeViaButton(page, "#btn-add-group", 200, 200, "Inner"); // rect 40,90 .. 360,310, corner at 360,310

    // Shrink Inner to 200x150 (still bigger than a default 160x60 entity, smaller than Outer's 320x220).
    await dragNode(page, 360, 310, 240, 240);
    let inner = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Inner"));
    assert.equal(inner.w, 200);
    assert.equal(inner.h, 150);

    // Drag Inner (grab its body, not its own resize handle) fully into Outer.
    await dragNode(page, 140, 165, 700, 400);

    const outer = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Outer"));
    inner = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Inner"));
    assert.deepEqual(inner.groups, [outer.id]);

    // Now drop an entity into Inner's new location (which is itself inside Outer).
    await addNodeViaButton(page, "#btn-add-node", 100, 700, "Leaf");
    const innerCenter = { x: inner.x + inner.w / 2, y: inner.y + inner.h / 2 };
    await dragNode(page, 100, 700, innerCenter.x, innerCenter.y);

    const leaf = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Leaf"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    const autoEdges = edges.filter((e) => e.auto);

    assert.deepEqual(leaf.groups, [inner.id]); // innermost only, not also Outer
    assert.equal(autoEdges.length, 2); // Outer->Inner, Inner->Leaf
    assert.ok(!autoEdges.some((e) => e.source === outer.id && e.target === leaf.id), "no direct Outer->Leaf edge");
  });
});

test("overlapping membership: a node can belong to two separate groups via two sequential drags, ties broken by creation order", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 300, 300, "A"); // rect 140,190 .. 460,410
    await addNodeViaButton(page, "#btn-add-group", 400, 300, "B"); // rect 240,190 .. 560,410
    // Overlap region: x 240..460, y 190..410 — big enough for a default entity.
    await addNodeViaButton(page, "#btn-add-node", 100, 700, "D");

    await dragNode(page, 100, 700, 350, 300); // first drop, inside the overlap of both A and B
    const groupA = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "A"));
    const groupB = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "B"));
    let d = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "D"));
    assert.deepEqual(d.groups, [groupA.id], "same-size tie resolves to the first-created group");

    await dragNode(page, 350, 300, 356, 304); // second real drag, still inside the overlap
    d = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "D"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    const autoEdges = edges.filter((e) => e.auto);

    assert.equal(d.groups.length, 2);
    assert.ok(d.groups.includes(groupA.id) && d.groups.includes(groupB.id));
    assert.equal(autoEdges.length, 2);
  });
});

test("deleting a group cleans up the (former) member's groups[] and the contains edge", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A");
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400);

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 460, box.y + 300); // a point inside the group, outside the member
    let sel = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(sel.type, "node");
    await page.keyboard.press("Delete");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].label, "Member");
    assert.deepEqual(nodes[0].groups, []);
    assert.equal(edges.length, 0);
  });
});

test("deleting a member removes its contains edge but leaves the group intact", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A");
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400);

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 600, box.y + 400); // the member sits on top here
    let sel = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(sel.type, "node");
    const selectedLabel = await page.evaluate(() =>
      window.__kg.state.nodes.find((n) => n.id === window.__kg.state.selection.id).label);
    assert.equal(selectedLabel, "Member");
    await page.keyboard.press("Delete");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].type, "group");
    assert.equal(edges.length, 0);
  });
});

test("deleting a grandparent group only cleans up its direct child — a deeper (grandchild) membership is untouched", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 700, 400, "Outer"); // rect 540,290 .. 860,510
    await addNodeViaButton(page, "#btn-add-group", 200, 200, "Inner"); // rect 40,90 .. 360,310, corner at 360,310
    await dragNode(page, 360, 310, 240, 240); // shrink Inner to 200x150
    await dragNode(page, 140, 165, 700, 400); // drag Inner's body fully into Outer

    await addNodeViaButton(page, "#btn-add-node", 100, 700, "Leaf");
    let inner = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Inner"));
    const innerCenter = { x: inner.x + inner.w / 2, y: inner.y + inner.h / 2 };
    await dragNode(page, 100, 700, innerCenter.x, innerCenter.y); // Leaf joins Inner only

    // Delete Outer (click a spot inside Outer's box but outside Inner's).
    const outer = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Outer"));
    inner = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Inner"));
    const box = await page.locator("#canvas").boundingBox();
    // A point inside Outer's rect but outside Inner's (Outer spans 540,290..860,510).
    const spotX = inner.x + inner.w + 20 <= outer.x + outer.w ? inner.x + inner.w + 20 : outer.x + 10;
    const spotY = outer.y + 10;
    await page.mouse.click(box.x + spotX, box.y + spotY);
    let sel = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(sel.type, "node");
    const selectedLabel = await page.evaluate(() =>
      window.__kg.state.nodes.find((n) => n.id === window.__kg.state.selection.id).label);
    assert.equal(selectedLabel, "Outer");
    await page.keyboard.press("Delete");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const remainingInner = nodes.find((n) => n.label === "Inner");
    const leaf = nodes.find((n) => n.label === "Leaf");
    const edges = await page.evaluate(() => window.__kg.state.edges);

    assert.equal(nodes.length, 2, "Outer is gone, Inner and Leaf remain");
    assert.deepEqual(remainingInner.groups, [], "Inner's link to the deleted Outer is cleaned up");
    assert.deepEqual(leaf.groups, [remainingInner.id], "Leaf's membership in Inner is completely unaffected by Outer's deletion");
    assert.equal(edges.length, 1, "only the surviving Inner->Leaf contains edge remains");
    assert.equal(edges[0].source, remainingInner.id);
    assert.equal(edges[0].target, leaf.id);
  });
});

test("dragging a node from deep inside a nested group to just outside it (but still inside the outer group) reassigns membership from inner to outer in one drag", async () => {
  await withPage(async (page) => {
    // Precise geometry set up directly (bypassing the UI, same pattern as
    // phase8/phase9's setup helpers) — Outer is large enough to leave a
    // margin around Inner that's big enough to actually fit a default
    // 160x60 entity in the "ring" between them, which a UI-driven default-
    // sized Outer/Inner pair (320x220 / resized-down) cannot geometrically
    // provide (the margin ends up smaller than a default entity itself).
    // Membership + contains edges set directly rather than via
    // updateGroupMembership() — that function's own auto-detect search
    // would also match Leaf against Outer (which, being huge, fully
    // contains Leaf too), double-joining it before the drag under test
    // even happens. Setting the exact intended starting state avoids that.
    await page.evaluate(() => {
      const outer = window.__kg.actions.createNode(0, 0, "Outer", "group");
      outer.w = 600; outer.h = 400;
      const inner = window.__kg.actions.createNode(50, 50, "Inner", "group");
      inner.w = 150; inner.h = 100;
      inner.groups.push(outer.id);
      window.__kg.actions.createEdge(outer.id, inner.id, "contains", true, true);
      const leaf = window.__kg.actions.createNode(70, 70, "Leaf", "entity");
      leaf.groups.push(inner.id);
      window.__kg.actions.createEdge(inner.id, leaf.id, "contains", true, true);
      window.__kg.markDirty();
    });

    let inner = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Inner"));
    let outer = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Outer"));
    let leaf = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Leaf"));
    assert.deepEqual(leaf.groups, [inner.id], "sanity check: setup actually placed Leaf in Inner");

    // Drag Leaf (grabbing its current center) to (400,300) — deep inside
    // Outer's 600x400 box, nowhere near Inner's 50,50..200,150 corner.
    const leafCenter = { x: leaf.x + leaf.w / 2, y: leaf.y + leaf.h / 2 };
    await dragNode(page, leafCenter.x, leafCenter.y, 400, 300);

    leaf = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Leaf"));
    const edges = await page.evaluate(() => window.__kg.state.edges);
    const autoEdges = edges.filter((e) => e.auto);

    assert.deepEqual(leaf.groups, [outer.id], "membership transitions straight from Inner to Outer in one drag");
    assert.equal(autoEdges.length, 2, "Outer->Inner unchanged, plus the new Outer->Leaf edge");
    assert.ok(autoEdges.some((e) => e.source === outer.id && e.target === leaf.id));
    assert.ok(!autoEdges.some((e) => e.source === inner.id && e.target === leaf.id), "the old Inner->Leaf edge is gone");
  });
});

test("a contains edge is never selectable by clicking near it — the click resolves to a node instead", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400); // member now centered in the group, rect 520,370..680,430

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 460, box.y + 300); // inside the group, outside the member's box
    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.type, "node");
    const label = await page.evaluate(() =>
      window.__kg.state.nodes.find((n) => n.id === window.__kg.state.selection.id).label);
    assert.equal(label, "Group A");
  });
});

test("hit-testing picks the smallest (topmost) box regardless of creation order", async () => {
  await withPage(async (page) => {
    // Case 1: group created first, entity (smaller) created second, sitting inside it.
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290..760,510
    await addNodeViaButton(page, "#btn-add-node", 600, 400, "Entity A"); // rect 520,370..680,430, drawn after
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 600, box.y + 400); // inside both boxes
    let label = await page.evaluate(() =>
      window.__kg.state.nodes.find((n) => n.id === window.__kg.state.selection.id).label);
    assert.equal(label, "Entity A");
    await page.mouse.click(box.x + 900, box.y + 700); // deselect

    // Case 2: entity created first this time, group (bigger) created second on top of it.
    await addNodeViaButton(page, "#btn-add-node", 200, 200, "Entity B");
    await addNodeViaButton(page, "#btn-add-group", 200, 200, "Group B"); // created after, but bigger
    await page.mouse.click(box.x + 200, box.y + 200); // inside both boxes
    label = await page.evaluate(() =>
      window.__kg.state.nodes.find((n) => n.id === window.__kg.state.selection.id).label);
    assert.equal(label, "Entity B", "smaller box wins the hit-test even though it was created first");
  });
});
