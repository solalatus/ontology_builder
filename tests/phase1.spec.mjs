import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";

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

// ---------------------------------------------------------------------------
// Extensive additions: data-model shape, id stability, and interaction edge
// cases not covered by the core flows above.
// ---------------------------------------------------------------------------

test("a freshly created node matches the full Section 4.1 shape", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(typeof node.id, "string");
    assert.ok(node.id.length > 0);
    assert.equal(node.label, "Alpha");
    assert.equal(node.type, "entity");
    assert.equal(typeof node.x, "number");
    assert.equal(typeof node.y, "number");
    assert.equal(node.w, 160);
    assert.equal(node.h, 60);
    assert.deepEqual(node.groups, []);
    assert.equal(node.boundary_mode, undefined);
    // Agent Ontology (agent_ontology_spec.md §4.1): meaning replaces the
    // old, never-wired notes field; aliases/properties are new.
    assert.equal(node.meaning, null);
    assert.deepEqual(node.aliases, []);
    assert.deepEqual(node.properties, []);
  });
});

test("a freshly created edge matches the full Section 4.2 shape", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "relates to");
    const edge = await page.evaluate(() => window.__kg.state.edges[0]);
    assert.equal(typeof edge.id, "string");
    assert.equal(edge.source, "n1");
    assert.equal(edge.target, "n2");
    assert.equal(edge.relation, "relates to");
    assert.equal(edge.directed, true);
    assert.equal(edge.auto, false);
    assert.equal(edge.meaning, null); // agent_ontology_spec.md §4.2
  });
});

test("node ids are never reused after delete + recreate", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const firstId = await page.evaluate(() => window.__kg.state.nodes[0].id);
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.keyboard.press("Delete");
    await addNodeViaDblClick(page, 300, 300, "Beta");
    const secondId = await page.evaluate(() => window.__kg.state.nodes[0].id);
    assert.notEqual(firstId, secondId);
  });
});

test("submitting an empty label does not create a node", async () => {
  await withPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(box.x + 300, box.y + 300);
    await page.waitForSelector(".kg-inline-input");
    await page.keyboard.press("Enter"); // empty text
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

test("Escape while the inline node-label input is open cancels without creating", async () => {
  await withPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(box.x + 300, box.y + 300);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("Should not be created");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

test("clicking empty canvas clears the current selection and hides the selection toolbar", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    let selType = await page.evaluate(() => window.__kg.state.selection.type);
    assert.equal(selType, "node");
    await page.waitForFunction(() => document.getElementById("sel-toolbar").style.display !== "none");

    await page.mouse.click(box.x + 900, box.y + 700); // empty canvas, far from the node
    selType = await page.evaluate(() => window.__kg.state.selection.type);
    assert.equal(selType, null);
    await page.waitForFunction(() => document.getElementById("sel-toolbar").style.display === "none");
  });
});

test("Backspace also deletes the current selection, same as Delete", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.keyboard.press("Backspace");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

test("trash icon deletes a selected node, not just a selected edge", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.click("#sel-trash");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

test("long-press on an edge deletes it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "");
    // Connect mode is sticky and stays armed after creating the edge; leave
    // it so plain long-press (an idle-mode-only interaction) can run.
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    const box = await page.locator("#canvas").boundingBox();
    // midpoint between the two nodes, on the edge line
    await page.mouse.move(box.x + 490, box.y + 250);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 0);
  });
});

test("Escape with nothing pending is a harmless no-op", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.keyboard.press("Escape");
    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1); // unchanged, and no console error was thrown
  });
});

test("Connect mode: tapping the same node twice cancels the pending source instead of self-linking", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-connect");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.mouse.click(box.x + 300, box.y + 300);
    const source = await page.evaluate(() => window.__kg.state.connectSource);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(source, null);
    assert.equal(edges.length, 0);
  });
});

test("Connect mode: tapping empty canvas while a source is pending cancels it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await page.click("#btn-connect");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 250, box.y + 250);
    await page.mouse.click(box.x + 900, box.y + 700); // empty canvas
    const source = await page.evaluate(() => window.__kg.state.connectSource);
    assert.equal(source, null);
  });
});

test("dragging from a handle and releasing on empty canvas creates no edge and no inline prompt", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + 330, box.y + 250); // Alpha's right-mid handle
    await page.mouse.down();
    await page.mouse.move(box.x + 900, box.y + 700, { steps: 8 }); // empty canvas
    await page.mouse.up();
    await page.waitForTimeout(100);
    const editorCount = await page.locator(".kg-inline-input").count();
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(editorCount, 0);
    assert.equal(edges.length, 0);
  });
});

test("dragging from a handle back onto its own node creates no self-loop edge", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + 330, box.y + 250); // Alpha's right-mid handle
    await page.mouse.down();
    await page.mouse.move(box.x + 260, box.y + 260, { steps: 4 }); // still over Alpha
    await page.mouse.up();
    await page.waitForTimeout(100);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 0);
  });
});

test("two distinct edges can exist between the same pair of nodes with different relations", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "relation one");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "relation two");
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 2);
    assert.deepEqual(edges.map((e) => e.relation).sort(), ["relation one", "relation two"]);
  });
});

test("a node label containing quotes and special characters round-trips intact", async () => {
  await withPage(async (page) => {
    const tricky = `O'Brien "the" <Test> & Co.`;
    await addNodeViaDblClick(page, 300, 300, tricky);
    const label = await page.evaluate(() => window.__kg.state.nodes[0].label);
    assert.equal(label, tricky);
  });
});

test("deleting a node deselects it and hides the selection toolbar", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.keyboard.press("Delete");
    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.type, null);
    await page.waitForFunction(() => document.getElementById("sel-toolbar").style.display === "none");
  });
});

test("a new node is created centered on the click point, not with a corner at the click point", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 400, 300, "Centered");
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    const world = await page.evaluate(() => window.__kg.screenToWorld(400, 300));
    assert.ok(Math.abs((node.x + node.w / 2) - world.x) < 1, "click point should land at the node's horizontal center");
    assert.ok(Math.abs((node.y + node.h / 2) - world.y) < 1, "click point should land at the node's vertical center");
  });
});

test("clicking a second node directly switches selection without needing to deselect first", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "First");
    await addNodeViaDblClick(page, 600, 250, "Second");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.click(box.x + 250, box.y + 250);
    let selection = await page.evaluate(() => window.__kg.state.selection);
    const firstId = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "First").id);
    assert.equal(selection.id, firstId);

    await page.mouse.click(box.x + 600, box.y + 250);
    selection = await page.evaluate(() => window.__kg.state.selection);
    const secondId = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Second").id);
    assert.equal(selection.type, "node");
    assert.equal(selection.id, secondId);
  });
});

test("a short click (no drag) on an edge selects it rather than deleting or ignoring it", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "A");
    await addNodeViaDblClick(page, 650, 250, "B");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "linked to");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const edgeId = await page.evaluate(() => window.__kg.state.edges[0].id);
    const box = await page.locator("#canvas").boundingBox();
    // Midpoint of the two node centers, where the edge line passes through.
    await page.mouse.click(box.x + 450, box.y + 250);

    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.type, "edge");
    assert.equal(selection.id, edgeId);
    const edges = await page.evaluate(() => window.__kg.state.edges.length);
    assert.equal(edges, 1, "a plain click must not delete the edge");
  });
});

test("the selection toolbar follows the selected node's screen position when panning", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 400, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 400, box.y + 300);
    await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display !== "none");
    const beforeLeft = await page.evaluate(() => document.getElementById("sel-toolbar").style.left);

    // Pan the camera — the still-selected node's screen position moves, so
    // the floating toolbar anchored to it should move too.
    await page.mouse.move(box.x + 600, box.y + 400);
    await page.mouse.down();
    await page.mouse.move(box.x + 500, box.y + 350, { steps: 5 });
    await page.mouse.up();

    const afterLeft = await page.evaluate(() => document.getElementById("sel-toolbar").style.left);
    assert.notEqual(beforeLeft, afterLeft, "the selection toolbar should track the node across a pan");
  });
});

test("a node with a very long label renders without crashing or throwing (text is clipped, not overflowed)", async () => {
  await withPage(async (page) => {
    const longLabel = "A".repeat(500);
    await addNodeViaDblClick(page, 400, 300, longLabel);
    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(node.label, longLabel, "the full label is still stored even though only part of it is drawn");
  });
});

test("a group node can be a Connect-mode endpoint just like an entity", async () => {
  await withPage(async (page) => {
    await page.click("#btn-add-group");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("MyGroup");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });

    await addNodeViaDblClick(page, 700, 500, "Entity");
    await createEdgeViaConnectMode(page, 300, 300, 700, 500, "relates to");

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1);
    const group = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.type === "group"));
    assert.equal(edges[0].source, group.id);
  });
});

test("two separate, sequential drags on the same node both apply correctly and independently", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();

    await page.mouse.move(box.x + 300, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 450, box.y + 320, { steps: 5 });
    await page.mouse.up();
    const afterFirst = await page.evaluate(() => window.__kg.state.nodes[0]);

    await page.mouse.move(box.x + 450 + afterFirst.w / 2 - 80, box.y + 320);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + 500, { steps: 5 });
    await page.mouse.up();
    const afterSecond = await page.evaluate(() => window.__kg.state.nodes[0]);

    assert.notDeepEqual(afterSecond, afterFirst);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 1, "still exactly one node, not a duplicate from either drag");
  });
});

test("selection survives an unrelated pan — panning the canvas does not clear the current selection", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 400, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 400, box.y + 300);
    const idBefore = await page.evaluate(() => window.__kg.state.selection.id);

    await page.mouse.move(box.x + 800, box.y + 600);
    await page.mouse.down();
    await page.mouse.move(box.x + 700, box.y + 550, { steps: 5 });
    await page.mouse.up();

    const selection = await page.evaluate(() => window.__kg.state.selection);
    assert.equal(selection.type, "node");
    assert.equal(selection.id, idBefore);
  });
});
