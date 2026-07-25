import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";

async function historyLengths(page) {
  return page.evaluate(() => ({ past: window.__kg.history.past.length, future: window.__kg.history.future.length }));
}

// Bypasses the UI for fast graph setup (createNode/createEdge don't push
// undo history themselves — only user-facing actions like a completed drag
// or the inline-input commit do — so this leaves history.past empty,
// letting each test start Auto-layout from a clean undo stack).
async function seedGraph(page, nodes, edges = []) {
  await page.evaluate(({ nodes, edges }) => {
    const ids = nodes.map((n) => window.__kg.actions.createNode(n.x, n.y, n.label, n.type).id);
    for (const [a, b, relation] of edges) {
      window.__kg.actions.createEdge(ids[a], ids[b], relation ?? "related to");
    }
    window.__kg.markDirty();
  }, { nodes, edges });
}

test("Auto-layout on an empty or single-node graph is a no-op — no history entry, no crash", async () => {
  await withPage(async (page) => {
    await page.click("#btn-autolayout");
    assert.deepEqual(await historyLengths(page), { past: 0, future: 0 });

    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const before = await page.evaluate(() => window.__kg.state.nodes[0]);
    // The inline-input commit itself is one history entry; autolayout on a
    // single node must not add a second one nor move the lone node.
    const pastAfterAdd = (await historyLengths(page)).past;

    await page.click("#btn-autolayout");
    const after = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(after.x, before.x);
    assert.equal(after.y, before.y);
    assert.equal((await historyLengths(page)).past, pastAfterAdd);
  });
});

test("Auto-layout moves nodes and is exactly one undo step regardless of node count", async () => {
  await withPage(async (page) => {
    await seedGraph(
      page,
      [
        { x: 100, y: 100, label: "A", type: "entity" },
        { x: 110, y: 105, label: "B", type: "entity" },
        { x: 105, y: 95, label: "C", type: "entity" },
        { x: 108, y: 110, label: "D", type: "entity" },
        { x: 95, y: 90, label: "E", type: "entity" },
      ],
      [[0, 1, "connects to"], [1, 2, "connects to"], [2, 3, "connects to"], [3, 4, "connects to"]],
    );
    const before = await page.evaluate(() => window.__kg.state.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })));
    assert.deepEqual(await historyLengths(page), { past: 0, future: 0 });

    await page.click("#btn-autolayout");

    const after = await page.evaluate(() => window.__kg.state.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })));
    assert.equal(after.length, before.length);
    const movedCount = after.filter((n, i) => n.x !== before[i].x || n.y !== before[i].y).length;
    assert.ok(movedCount > 0, "at least one node should have moved");

    assert.deepEqual(await historyLengths(page), { past: 1, future: 0 });

    await page.click("#btn-undo");
    const restored = await page.evaluate(() => window.__kg.state.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })));
    assert.deepEqual(restored, before, "one Undo should restore every node's pre-layout position");
    assert.deepEqual(await historyLengths(page), { past: 0, future: 1 });

    await page.click("#btn-redo");
    const redone = await page.evaluate(() => window.__kg.state.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })));
    assert.deepEqual(redone, after, "one Redo should re-apply the exact same layout result");
  });
});

test("Auto-layout changes only node positions — ids, labels, edges, and group membership are untouched", async () => {
  await withPage(async (page) => {
    await seedGraph(
      page,
      [
        { x: 100, y: 100, label: "Group", type: "group" },
        { x: 150, y: 150, label: "Member", type: "entity" },
      ],
    );
    // Establish real membership the same way a drag would, via the exposed action.
    await page.evaluate(() => {
      const member = window.__kg.state.nodes.find((n) => n.label === "Member");
      const group = window.__kg.state.nodes.find((n) => n.label === "Group");
      member.groups = [group.id];
      window.__kg.actions.updateGroupMembership(member);
    });
    await page.evaluate(() => window.__kg.actions.createEdge(
      window.__kg.state.nodes.find((n) => n.label === "Group").id,
      window.__kg.state.nodes.find((n) => n.label === "Member").id,
      "unrelated edge",
    ));
    const beforeSnapshot = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes.map(({ id, label, type, w, h, groups }) => ({ id, label, type, w, h, groups })),
      edgeCount: window.__kg.state.edges.length,
    }));

    await page.click("#btn-autolayout");

    const afterSnapshot = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes.map(({ id, label, type, w, h, groups }) => ({ id, label, type, w, h, groups })),
      edgeCount: window.__kg.state.edges.length,
    }));
    assert.deepEqual(afterSnapshot, beforeSnapshot, "non-position fields must be byte-identical after layout");
  });
});

test("Auto-layout does not crash or hang on disconnected components and a floating group with no edges", async () => {
  await withPage(async (page) => {
    await seedGraph(
      page,
      [
        { x: 50, y: 50, label: "Island A", type: "entity" },
        { x: 60, y: 60, label: "Island B", type: "entity" },
        { x: 400, y: 400, label: "Lonely Group", type: "group" },
        { x: 200, y: 200, label: "Connected 1", type: "entity" },
        { x: 210, y: 210, label: "Connected 2", type: "entity" },
      ],
      [[3, 4, "linked"]],
    );
    const start = Date.now();
    await page.click("#btn-autolayout");
    await page.waitForFunction(() => window.__kg.history.past.length === 1);
    assert.ok(Date.now() - start < 10000, "autolayout should complete quickly, not hang");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 5);
    for (const n of nodes) {
      assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y), `node ${n.label} has a non-finite position`);
    }
  });
});

test("Auto-layout is reachable only via its explicit toolbar button — never runs on its own", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await addNodeViaDblClick(page, 500, 300, "Beta");
    await createEdgeViaConnectMode(page, 300, 300, 500, 300, "connects to");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const beforeReload = await page.evaluate(() => window.__kg.state.nodes.map((n) => ({ x: n.x, y: n.y })));
    await page.evaluate(() => window.__kg.storage.whenIdle());
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction((n) => window.__kg.state.nodes.length === n, beforeReload.length);

    const afterReload = await page.evaluate(() => window.__kg.state.nodes.map((n) => ({ x: n.x, y: n.y })));
    assert.deepEqual(afterReload, beforeReload, "reload must never silently re-layout the graph");
  });
});
