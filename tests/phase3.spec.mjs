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

test("a long chain of 20 sequential adds fully undoes back to empty and fully redoes back to 20, in order", async () => {
  await withPage(async (page) => {
    // Bypasses the UI for setup speed (20 real dblclick+type+Enter round
    // trips would be needlessly slow for a stress test); each add still
    // goes through the same pushHistory() choke point every real action
    // uses, via window.__kg.actions.pushHistoryFor (not exposed directly),
    // so instead each iteration mirrors pushHistory()'s own two-snapshot
    // shape by hand (nodes/edges/rules/actions — the same four arrays
    // snapshotState() itself clones, see agent_ontology_spec.md §4.3) and
    // drives undo/redo through the real action functions afterward, not
    // raw DOM clicks — a manually-pushed history.past entry doesn't
    // refresh the Undo/Redo buttons' disabled attribute (that only
    // happens inside pushHistory()/undo()/redo() itself), so clicking the
    // DOM buttons here would hang on a stale disabled button rather than
    // testing the history logic at all.
    for (let i = 0; i < 20; i++) {
      await page.evaluate((label) => {
        const snap = () => ({
          nodes: window.__kg.state.nodes.map((n) => ({ ...n, aliases: [...n.aliases], properties: n.properties.map((p) => ({ ...p })) })),
          edges: window.__kg.state.edges.map((e) => ({ ...e })),
          rules: window.__kg.state.rules.map((r) => ({ ...r, conditions: [...r.conditions] })),
          actions: window.__kg.state.actions.map((a) => ({ ...a, preconditions: [...a.preconditions] })),
        });
        const before = snap();
        window.__kg.actions.createNode(50 + (label % 10) * 60, 50 + Math.floor(label / 10) * 80, `N${label}`);
        const after = snap();
        window.__kg.history.past.push({ before, after });
        window.__kg.history.future = [];
      }, i);
    }
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 20);
    assert.equal((await historyLengths(page)).past, 20);

    for (let i = 0; i < 20; i++) await page.evaluate(() => window.__kg.actions.undo());
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 0);
    assert.equal((await historyLengths(page)).future, 20);
    assert.equal(await undoBtnDisabled(page), true, "the button's disabled state should reflect the real history after real undo() calls");

    for (let i = 0; i < 20; i++) await page.evaluate(() => window.__kg.actions.redo());
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 20);
    assert.equal(nodes[0].label, "N0");
    assert.equal(nodes[19].label, "N19");
    assert.equal(await redoBtnDisabled(page), true);
  });
});

test("undo and redo always clear the current selection rather than trying to restore it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await addNodeViaDblClick(page, 500, 300, "Beta");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 500, box.y + 300); // select Beta
    assert.equal((await page.evaluate(() => window.__kg.state.selection)).type, "node");

    await page.click("#btn-undo");
    assert.equal((await page.evaluate(() => window.__kg.state.selection)).type, null);

    await page.mouse.click(box.x + 300, box.y + 300); // select Alpha
    assert.equal((await page.evaluate(() => window.__kg.state.selection)).type, "node");

    await page.click("#btn-redo");
    assert.equal((await page.evaluate(() => window.__kg.state.selection)).type, null,
      "redo should clear selection rather than reselecting whatever was selected before it ran");
  });
});

test("alternating undo/redo cycles land on exactly the right state at every step, not just at the ends", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 200, 200, "A");
    await addNodeViaDblClick(page, 400, 200, "B");
    await addNodeViaDblClick(page, 600, 200, "C");
    const labelsNow = async () => (await page.evaluate(() => window.__kg.state.nodes)).map((n) => n.label).sort();

    assert.deepEqual(await labelsNow(), ["A", "B", "C"]);
    await page.click("#btn-undo");
    assert.deepEqual(await labelsNow(), ["A", "B"]);
    await page.click("#btn-undo");
    assert.deepEqual(await labelsNow(), ["A"]);
    await page.click("#btn-redo");
    assert.deepEqual(await labelsNow(), ["A", "B"]);
    await page.click("#btn-undo");
    assert.deepEqual(await labelsNow(), ["A"]);
    await page.click("#btn-undo");
    assert.deepEqual(await labelsNow(), []);
    await page.click("#btn-redo");
    await page.click("#btn-redo");
    await page.click("#btn-redo");
    assert.deepEqual(await labelsNow(), ["A", "B", "C"]);
    assert.equal(await redoBtnDisabled(page), true);
  });
});

test("undoing an Auto-layout after several unrelated prior actions only reverts the layout, not the earlier actions", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 200, 200, "A");
    await addNodeViaDblClick(page, 400, 200, "B");
    await createEdgeViaConnectMode(page, 200, 200, 400, 200, "linked");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    const positionsBeforeLayout = await page.evaluate(() => window.__kg.state.nodes.map((n) => ({ x: n.x, y: n.y })));

    await page.click("#btn-autolayout");
    // add, add, connect = 3 steps already on the stack; +1 for the layout = 4.
    // autoLayout() runs synchronously within the click handler, so by the
    // time click() resolves the push has already happened — no need to
    // (and, since it's already past 3 by then, no correct way to) wait for
    // an intermediate count.
    await page.waitForFunction(() => window.__kg.history.past.length === 4);

    const positionsAfterLayout = await page.evaluate(() => window.__kg.state.nodes.map((n) => ({ x: n.x, y: n.y })));
    assert.notDeepEqual(positionsAfterLayout, positionsBeforeLayout);

    await page.click("#btn-undo"); // undo only the layout
    const positionsAfterUndo = await page.evaluate(() => window.__kg.state.nodes.map((n) => ({ x: n.x, y: n.y })));
    assert.deepEqual(positionsAfterUndo, positionsBeforeLayout);

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(nodes.length, 2, "the earlier node adds must still be intact");
    assert.equal(edges.length, 1, "the earlier edge connect must still be intact");
  });
});

test("a long, heterogeneous action sequence (add, move, rename, connect, toggle direction, move again, delete) fully undoes step-by-step and fully redoes back, matching an exact snapshot at every single intermediate step", async () => {
  await withPage(async (page) => {
    const snapshot = () => page.evaluate(() => ({
      nodes: window.__kg.state.nodes.map((n) => ({ ...n, aliases: [...n.aliases], properties: n.properties.map((p) => ({ ...p })) })),
      edges: window.__kg.state.edges.map((e) => ({ ...e })),
    }));
    const snapshots = [await snapshot()]; // index 0 = the empty starting state

    // Step 1: create a node.
    await addNodeViaButton(page, "#btn-add-node", 300, 300, "Alpha");
    snapshots.push(await snapshot());

    // Step 2: create a second node.
    await addNodeViaButton(page, "#btn-add-node", 700, 300, "Beta");
    snapshots.push(await snapshot());

    // Step 3: move the first node.
    await dragNode(page, 300, 300, 340, 260);
    snapshots.push(await snapshot());

    // Step 4: rename it.
    const alpha = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Alpha"));
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(box.x + alpha.x + alpha.w / 2, box.y + alpha.y + alpha.h / 2);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Renamed");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    snapshots.push(await snapshot());

    // Step 5: create a third, unrelated node.
    await addNodeViaDblClick(page, 950, 700, "Outsider");
    snapshots.push(await snapshot());

    // Step 6: connect Renamed -> Outsider.
    const renamed = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Renamed"));
    const outsider = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Outsider"));
    await createEdgeViaConnectMode(
      page,
      renamed.x + renamed.w / 2, renamed.y + renamed.h / 2,
      outsider.x + outsider.w / 2, outsider.y + outsider.h / 2,
      "connects to",
    );
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    snapshots.push(await snapshot());

    // Step 7: toggle the new edge's direction.
    const edgeMid = await page.evaluate(() => {
      const e = window.__kg.state.edges[0];
      const src = window.__kg.state.nodes.find((n) => n.id === e.source);
      const tgt = window.__kg.state.nodes.find((n) => n.id === e.target);
      return { x: (src.x + src.w / 2 + tgt.x + tgt.w / 2) / 2, y: (src.y + src.h / 2 + tgt.y + tgt.h / 2) / 2 };
    });
    await page.mouse.click(box.x + edgeMid.x, box.y + edgeMid.y);
    await page.click("#sel-toggle-dir");
    snapshots.push(await snapshot());

    // Step 8: move Renamed again.
    const renamedNow = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Renamed"));
    await dragNode(page, renamedNow.x + renamedNow.w / 2, renamedNow.y + renamedNow.h / 2,
      renamedNow.x + renamedNow.w / 2 + 140, renamedNow.y + renamedNow.h / 2 + 100);
    snapshots.push(await snapshot());

    // Step 9: delete Outsider — removes its incident edge too, as one step.
    await page.mouse.click(box.x + (await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Outsider").x)) + 80,
      box.y + (await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Outsider").y)) + 30);
    await page.keyboard.press("Delete");
    snapshots.push(await snapshot());

    assert.equal(snapshots.length, 10, "9 actions recorded, plus the initial empty state");
    const historyDepth = (await historyLengths(page)).past;
    assert.equal(historyDepth, 9, "each of the 9 actions above is exactly one undo step");

    // Walk all the way back, checking the *exact* snapshot at every step —
    // not just the two ends.
    for (let i = snapshots.length - 1; i > 0; i--) {
      await page.click("#btn-undo");
      const current = await snapshot();
      assert.deepEqual(current, snapshots[i - 1], `undo step ${i}: expected snapshot ${i - 1}`);
    }
    assert.equal((await historyLengths(page)).past, 0);

    // And all the way forward again — must land on each exact snapshot too.
    for (let i = 1; i < snapshots.length; i++) {
      await page.click("#btn-redo");
      const current = await snapshot();
      assert.deepEqual(current, snapshots[i], `redo step ${i}: expected snapshot ${i}`);
    }
    assert.equal((await historyLengths(page)).future, 0);
  });
});
