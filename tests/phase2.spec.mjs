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

test("moving the group itself afterward does not cascade or alter the member's committed membership", async () => {
  await withPage(async (page) => {
    await addNodeViaButton(page, "#btn-add-group", 600, 400, "Group A"); // rect 440,290 .. 760,510
    await addNodeViaButton(page, "#btn-add-node", 100, 100, "Member");
    await dragNode(page, 100, 100, 600, 400); // commits; member now centered at group's center

    // Grab the group at a point inside its box but outside the member's box.
    await dragNode(page, 460, 300, 1000, 700);

    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    const member = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "entity"));
    const edges = await page.evaluate(() => window.__kg.state.edges);

    assert.notEqual(group.x, 440); // it actually moved
    assert.deepEqual(member.groups, [group.id]); // membership untouched despite now being visually disjoint
    assert.equal(edges.length, 1);
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
