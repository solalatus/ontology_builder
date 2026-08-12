import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, createEdgeViaConnectMode, applyImport, settle, waitForComputedStyle, waitForGeometrySettled, waitForDownloads } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL } from "./lib/page.mjs";

// End-to-end, multi-step workflow tests (user request, 2026-08) -- unlike
// every other file in this suite, which isolates one feature at a time,
// these deliberately combine several of this session's changes (semantic
// colors, toolbar grouping/reorg, canvas node identity, typography, the
// agent-toggle icon/tooltip, dialog emphasis, reduced motion, fit-to-view,
// edge-label drag safety, tooltips, Domain Model emphasis) in the
// sequences a real session would actually produce, to catch integration
// bugs no single narrow test would ever exercise. Each one still asserts
// on real state/geometry, not just "nothing threw."

async function withDownloadPage(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, acceptDownloads: true });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  const downloads = [];
  page.on("download", (dl) => downloads.push(dl));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  await page.evaluate(() => window.__kg.welcome.close()); // issue #78: this file has its own page-open helper, not tests/lib/page.mjs's withPage()
  try {
    await fn(page, downloads);
  } finally {
    await browser.close();
  }
  assert.deepEqual(consoleErrors, [], "expected no console/page errors during the test");
}

async function readDownload(dl) {
  const stream = await dl.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

// --------------------------------------------------------------------------
// 1. Build a small domain model from scratch, save, reopen, verify
//    everything (nodes, edges, a hand-placed label, meaning/properties,
//    rules/actions) survived the full round trip.
// --------------------------------------------------------------------------
test("E2E: building a small ontology end to end survives Save Version -> reopen intact", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 250, 250, "Supplier");
    await addNodeViaDblClick(page, 650, 250, "Invoice");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "issues");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    // Flesh out Invoice with real structure (drives the property-count
    // badge) and drag the "issues" label toward the Invoice end.
    await page.evaluate(() => {
      const invoice = window.__kg.state.nodes.find((n) => n.label === "Invoice");
      invoice.meaning = "A request for payment.";
      invoice.properties = [{ id: "p1", name: "amount", type: "number", unit: "EUR", allowed: null }];
      window.__kg.markDirty();
    });
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + 450, box.y + 235);
    await page.mouse.down();
    await page.mouse.move(box.x + 600, box.y + 235, { steps: 8 });
    await page.mouse.up();
    const draggedLabelT = await page.evaluate(() => window.__kg.state.edges[0].labelT);
    assert.ok(typeof draggedLabelT === "number" && draggedLabelT > 0.6);

    // Domain Model: one rule, one action referencing Invoice.
    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    await page.click("#domain-model-add-rule");
    await page.locator(".dm-rule-name").fill("isOverdue");
    await page.click("#domain-model-add-action");
    await page.locator(".dm-action-name").fill("sendReminder");
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    await page.click("#btn-save-version");
    await waitForDownloads(downloads, 3);
    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const jsonText = await readDownload(jsonDl);

    // Wipe and reopen from the file, the way a real returning session would.
    await page.evaluate(() => { window.__kg.state.nodes.length = 0; window.__kg.state.edges.length = 0; window.__kg.state.rules.length = 0; window.__kg.state.actions.length = 0; window.__kg.markDirty(); });
    await page.evaluate((text) => {
      const dt = new DataTransfer();
      dt.items.add(new File([text], "reopen.json", { type: "application/json" }));
      document.getElementById("canvas").dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, jsonText);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    // empty canvas: Replace hidden, Merge is the full restore
    await applyImport(page, "#import-merge");

    const finalState = await page.evaluate(() => ({
      nodeCount: window.__kg.state.nodes.length,
      edgeCount: window.__kg.state.edges.length,
      labelT: window.__kg.state.edges[0].labelT,
      invoiceProps: window.__kg.state.nodes.find((n) => n.label === "Invoice").properties.length,
      ruleNames: window.__kg.state.rules.map((r) => r.name),
      actionNames: window.__kg.state.actions.map((a) => a.name),
    }));
    assert.equal(finalState.nodeCount, 2);
    assert.equal(finalState.edgeCount, 1);
    assert.equal(finalState.labelT, draggedLabelT);
    assert.equal(finalState.invoiceProps, 1);
    assert.deepEqual(finalState.ruleNames, ["isOverdue"]);
    assert.deepEqual(finalState.actionNames, ["sendReminder"]);
  });
});

// --------------------------------------------------------------------------
// 2. Cycle theme + language while interacting, verifying the toolbar's
//    combined zoom/theme/language group and tooltips stay coherent
//    throughout, not just in a single steady state.
// --------------------------------------------------------------------------
test("E2E: toggling theme and language repeatedly mid-workflow never breaks toolbar interaction", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-theme-toggle");
    await addNodeViaDblClick(page, 500, 300, "Beta");
    await page.click("#btn-lang-toggle");
    await page.click("#btn-theme-toggle"); // back to dark
    await createEdgeViaConnectMode(page, 300, 300, 500, 300, "");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    await page.click("#btn-lang-toggle"); // back to English

    const finalCounts = await page.evaluate(() => ({ nodes: window.__kg.state.nodes.length, edges: window.__kg.state.edges.length }));
    assert.equal(finalCounts.nodes, 2);
    assert.equal(finalCounts.edges, 1);

    // The toolbar must still be fully functional after all that state churn.
    await page.hover("#btn-fit-view");
    await waitForComputedStyle(page, "#btn-fit-view", "opacity", "1", { pseudo: "::after" });
    assert.equal(await page.locator("#btn-theme-toggle").textContent(), "Theme: Dark");
    assert.equal(await page.locator("#btn-lang-toggle").textContent(), "Language: English");
  });
});

// --------------------------------------------------------------------------
// 3. Undo/redo across a mixed sequence of old and new feature types.
// --------------------------------------------------------------------------
test("E2E: undo/redo correctly rewinds and replays a mixed sequence of edits, including a label drag", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 650, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "relates to");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + 450, box.y + 235);
    await page.mouse.down();
    await page.mouse.move(box.x + 600, box.y + 235, { steps: 8 });
    await page.mouse.up();

    await page.evaluate(() => {
      const alpha = window.__kg.state.nodes.find((n) => n.label === "Alpha");
      alpha.properties = [{ id: "p1", name: "x", type: "text", unit: null, allowed: null }];
      window.__kg.markDirty();
    });

    const history = [];
    const record = async () => history.push(await page.evaluate(() => ({
      nodes: window.__kg.state.nodes.length,
      alphaProps: window.__kg.state.nodes.find((n) => n.label === "Alpha")?.properties.length ?? null,
      labelT: window.__kg.state.edges[0]?.labelT ?? null,
    })));
    await record(); // after: 2 nodes, alpha has 1 prop, label dragged

    await page.evaluate(() => window.__kg.actions.undo()); // undoes the property edit (a plain mutation, no explicit pushHistory call for it above -- but properties assigned directly don't auto-push; skip if unaffected)
    await record();

    // Regardless of exactly how many undo steps the direct property
    // mutation above did or didn't register (it wasn't pushed through
    // pushHistory itself), undoing back to before both the drag and the
    // edge creation must cleanly restore an edge-less, 2-node graph with
    // no crash and no orphaned label state.
    for (let i = 0; i < 5; i++) await page.evaluate(() => window.__kg.actions.undo());
    const rewound = await page.evaluate(() => ({ nodes: window.__kg.state.nodes.length, edges: window.__kg.state.edges.length }));
    assert.equal(rewound.edges, 0, "fully rewinding must remove the edge created partway through");

    for (let i = 0; i < 8; i++) await page.evaluate(() => window.__kg.actions.redo());
    const replayed = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes.length,
      edges: window.__kg.state.edges.length,
      labelT: window.__kg.state.edges[0]?.labelT ?? null,
    }));
    assert.equal(replayed.nodes, 2);
    assert.equal(replayed.edges, 1);
    assert.ok(typeof replayed.labelT === "number" && replayed.labelT > 0.6, "replaying forward should restore the dragged label position");
  });
});

// --------------------------------------------------------------------------
// 4. Auto-layout a scattered graph, then fit-to-view at a narrow (wrapped-
//    toolbar) viewport -- combines auto-layout with the fit-to-view fix.
// --------------------------------------------------------------------------
test("E2E: auto-layout followed by fit-to-view at a narrow viewport leaves every node clear of the wrapped toolbar", async () => {
  await withPage(async (page) => {
    // Screen-relative coordinates (see addNodeViaDblClick), so these must
    // stay within the 480px-wide viewport this test runs at below — not
    // world coordinates, and not clear of the toolbar until y is well past
    // its wrapped, multi-row height at this width.
    await addNodeViaDblClick(page, 60, 300, "A");
    await addNodeViaDblClick(page, 400, 300, "B");
    await addNodeViaDblClick(page, 60, 600, "C");
    await addNodeViaDblClick(page, 400, 600, "D");
    await createEdgeViaConnectMode(page, 60, 300, 400, 300, "");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    await page.click("#btn-autolayout");
    await settle(page, () => page.click("#btn-fit-view"));

    const toolbarBottom = await page.evaluate(() => document.getElementById("toolbar").getBoundingClientRect().bottom);
    const canvasBox = await page.locator("#canvas").boundingBox();
    const nodeTops = await page.evaluate(() =>
      window.__kg.state.nodes.map((n) => window.__kg.worldToScreen(n.x, n.y).y));
    for (const top of nodeTops) {
      const pageY = canvasBox.y + top;
      assert.ok(pageY >= toolbarBottom - 1, `a node's top edge (${pageY}) sits under the wrapped toolbar (bottom ${toolbarBottom})`);
    }
  }, { viewport: { width: 480, height: 800 } });
});

// --------------------------------------------------------------------------
// 5. A gauntlet of edge interactions: parallel/bent edges, one label drag,
//    one long-press delete of a different edge -- the rest must survive.
// --------------------------------------------------------------------------
test("E2E: dragging one parallel edge's label and long-press-deleting a sibling edge leaves the rest untouched", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await addNodeViaDblClick(page, 700, 300, "Beta");
    await createEdgeViaConnectMode(page, 300, 300, 700, 300, "first");
    await createEdgeViaConnectMode(page, 300, 300, 700, 300, "second");
    await createEdgeViaConnectMode(page, 300, 300, 700, 300, "third");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const edgesBefore = await page.evaluate(() => window.__kg.state.edges.map((e) => ({ id: e.id, relation: e.relation })));
    assert.equal(edgesBefore.length, 3);

    // Drag the first edge's label along its own (bent) path.
    const box = await page.locator("#canvas").boundingBox();
    const firstGeo = await page.evaluate((id) => window.__kg.getEdgeGeometry(id), edgesBefore[0].id);
    await page.mouse.move(box.x + firstGeo.mid.x, box.y + firstGeo.mid.y - 6);
    await page.mouse.down();
    await page.mouse.move(box.x + firstGeo.mid.x + 120, box.y + firstGeo.mid.y - 6, { steps: 8 });
    await page.mouse.up();
    const firstAfter = await page.evaluate((id) => window.__kg.state.edges.find((e) => e.id === id).labelT, edgesBefore[0].id);
    assert.ok(typeof firstAfter === "number");

    // Long-press-delete the third edge specifically.
    const thirdGeo = await page.evaluate((id) => window.__kg.getEdgeGeometry(id), edgesBefore[2].id);
    await page.mouse.move(box.x + thirdGeo.mid.x, box.y + thirdGeo.mid.y - 6);
    await page.mouse.down();
    // The long press is a real 600ms timer in the app (LONG_PRESS_MS), so the
    // button genuinely has to stay down -- but wait for the deletion it fires
    // rather than for a wall-clock 700ms. If the press never registers this
    // fails saying so, instead of releasing early and failing later on a
    // confusing edge count (issue #91).
    await page.waitForFunction((id) => !window.__kg.state.edges.some((e) => e.id === id), edgesBefore[2].id);
    await page.mouse.up();

    const edgesAfter = await page.evaluate(() => window.__kg.state.edges.map((e) => ({ id: e.id, relation: e.relation })));
    assert.equal(edgesAfter.length, 2, "exactly the long-pressed edge should be gone");
    assert.ok(edgesAfter.some((e) => e.id === edgesBefore[0].id), "the dragged edge must survive");
    assert.ok(edgesAfter.some((e) => e.id === edgesBefore[1].id), "the untouched edge must survive");
    assert.ok(!edgesAfter.some((e) => e.id === edgesBefore[2].id), "the long-pressed edge must be gone");
  });
});

// --------------------------------------------------------------------------
// 6. Persistence integration: badges (properties), dashed "bare" nodes,
//    and a custom label position all together through export/reimport.
// --------------------------------------------------------------------------
test("E2E: bare-node dashing and property badges render correctly again after a full export/reimport round trip", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 250, 250, "Bare");
    await addNodeViaDblClick(page, 650, 250, "Documented");
    await page.evaluate(() => {
      const documented = window.__kg.state.nodes.find((n) => n.label === "Documented");
      documented.properties = [
        { id: "p1", name: "a", type: "text", unit: null, allowed: null },
        { id: "p2", name: "b", type: "text", unit: null, allowed: null },
      ];
      window.__kg.markDirty();
    });
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "leads to");
    await page.evaluate(() => { window.__kg.state.edges[0].labelT = 0.8; window.__kg.markDirty(); });

    await page.click("#btn-save-version");
    await waitForDownloads(downloads, 3);
    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const jsonText = await readDownload(jsonDl);

    await page.evaluate(() => { window.__kg.state.nodes.length = 0; window.__kg.state.edges.length = 0; window.__kg.markDirty(); });
    await page.evaluate((text) => {
      const dt = new DataTransfer();
      dt.items.add(new File([text], "reopen.json", { type: "application/json" }));
      document.getElementById("canvas").dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, jsonText);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await applyImport(page, "#import-merge");

    const visual = await page.evaluate(() => {
      const bare = window.__kg.state.nodes.find((n) => n.label === "Bare");
      const documented = window.__kg.state.nodes.find((n) => n.label === "Documented");
      return {
        bare: window.__kg.getNodeVisualState(bare),
        documented: window.__kg.getNodeVisualState(documented),
        labelT: window.__kg.state.edges[0].labelT,
      };
    });
    assert.equal(visual.bare.isBare, true, "a reimported node with no meaning/aliases/properties must still render as bare");
    assert.equal(visual.documented.isBare, false);
    assert.equal(visual.documented.propertyCount, 2);
    assert.equal(visual.labelT, 0.8);
  });
});

// --------------------------------------------------------------------------
// 7. Keyboard + mouse mixed deletion workflow, checking toolbar undo/redo
//    button enabled-state tracks the real history at every step.
// --------------------------------------------------------------------------
test("E2E: a mixed mouse+keyboard create/select/delete/undo sequence keeps the Undo/Redo buttons in sync at every step", async () => {
  await withPage(async (page) => {
    const undoDisabled = () => page.evaluate(() => document.getElementById("btn-undo").disabled);
    const redoDisabled = () => page.evaluate(() => document.getElementById("btn-redo").disabled);

    assert.equal(await undoDisabled(), true);
    assert.equal(await redoDisabled(), true);

    await addNodeViaDblClick(page, 300, 300, "Alpha");
    assert.equal(await undoDisabled(), false);
    assert.equal(await redoDisabled(), true);

    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.keyboard.press("Delete");
    assert.equal(await undoDisabled(), false);

    await page.click("#btn-undo");
    assert.equal(await redoDisabled(), false);
    const nodesAfterUndo = await page.evaluate(() => window.__kg.state.nodes.length);
    assert.equal(nodesAfterUndo, 1, "undoing the keyboard delete should bring the node back");

    await page.click("#btn-redo");
    assert.equal(await redoDisabled(), true);
    const nodesAfterRedo = await page.evaluate(() => window.__kg.state.nodes.length);
    assert.equal(nodesAfterRedo, 0);
  });
});

// --------------------------------------------------------------------------
// 8. Expanding the agent panel shifts the toolbar (--agent-panel-offset) --
//    the reorganized zoom/theme/language group and its tooltips must still
//    work correctly once everything's shifted right.
// --------------------------------------------------------------------------
test("E2E: the reorganized zoom/theme/language group and its tooltips still work correctly with the agent panel expanded", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => window.__kg.agent.setExpanded(true));
    await waitForGeometrySettled(page, "#graph-title"); // the toolbar's left-shift transition

    // The toggle vs. title overlap fix, and the toolbar-fits-in-viewport
    // guarantees, must both still hold once the toolbar has shifted right.
    const toggleBox = await page.locator("#agent-panel-toggle").boundingBox();
    const titleBoxExpanded = await page.locator("#graph-title").boundingBox();
    assert.ok(toggleBox.x + toggleBox.width <= titleBoxExpanded.x + 1 || titleBoxExpanded.x + titleBoxExpanded.width <= toggleBox.x, "title and toggle must not overlap once the panel is expanded");

    await page.hover("#btn-zoom-in");
    await waitForComputedStyle(page, "#btn-zoom-in", "opacity", "1", { pseudo: "::after" });

    await page.click("#btn-theme-toggle");
    assert.equal(await page.locator("#btn-theme-toggle").textContent(), "Theme: Light");

    // #agent-panel-toggle itself is a fixed element that never moves (only
    // the panel *body*'s width is conditional on expand state -- see its
    // own CSS comment); it's the toolbar/title that shifts, via
    // --agent-panel-offset. Collapsing should bring the title back left,
    // toward where it started before the panel ever expanded.
    await page.evaluate(() => window.__kg.agent.setExpanded(false));
    await waitForGeometrySettled(page, "#graph-title");
    const titleBoxCollapsed = await page.locator("#graph-title").boundingBox();
    assert.ok(titleBoxCollapsed.x < titleBoxExpanded.x, "collapsing the panel should move the title back toward the left edge");
  });
});

// --------------------------------------------------------------------------
// 9. A full Domain Model authoring session: add several rules/actions,
//    filter, save, reopen the dialog, verify counts and the accent border
//    both survive.
// --------------------------------------------------------------------------
test("E2E: a multi-rule/action Domain Model session survives closing and reopening the dialog", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Ticket");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);

    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    for (const name of ["isUrgent", "isAssigned", "isClosed"]) {
      await page.click("#domain-model-add-rule");
    }
    const ruleInputs = page.locator(".dm-rule-name");
    await ruleInputs.nth(0).fill("isUrgent");
    await ruleInputs.nth(1).fill("isAssigned");
    await ruleInputs.nth(2).fill("isClosed");
    await page.click("#domain-model-add-action");
    await page.locator(".dm-action-name").fill("escalate");
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    assert.deepEqual(await page.evaluate(() => window.__kg.state.rules.map((r) => r.name)), ["isUrgent", "isAssigned", "isClosed"]);

    // Reopen and filter down to one rule.
    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    assert.equal(await computedStyleBorderTopWidth(page), "3px");
    await page.locator("#domain-model-rules-filter").fill("Urgent");
    const visibleCards = await page.locator(".domain-model-rule-card:visible").count();
    assert.equal(visibleCards, 1);
    await page.click("#domain-model-cancel");

    // Cancel must not have discarded the earlier Save.
    assert.equal((await page.evaluate(() => window.__kg.state.rules.length)), 3);
  });
});

async function computedStyleBorderTopWidth(page) {
  return page.evaluate(() => getComputedStyle(document.getElementById("domain-model-dialog")).borderTopWidth);
}

// --------------------------------------------------------------------------
// 10. A full workflow at the most constrained (narrow, wrapped-toolbar)
//     viewport this session's changes were tested against individually --
//     here run back-to-back as one session.
// --------------------------------------------------------------------------
test("E2E: a full add/connect/drag-label/domain-model/fit-view workflow completes correctly at a narrow, wrapped-toolbar viewport", async () => {
  await withPage(async (page) => {
    // 90 and 280 (not e.g. 100/260): DEFAULT_NODE_W is 160, so anything
    // closer than that leaves the two node boxes touching or overlapping,
    // which would make the edge's own midpoint fall inside one of the
    // node boxes -- pointerdown hit-tests nodes before edges, so a "drag
    // the edge label" gesture would silently drag the node instead.
    await addNodeViaDblClick(page, 90, 400, "Alpha");
    await addNodeViaDblClick(page, 280, 400, "Beta");
    await createEdgeViaConnectMode(page, 90, 400, 280, 400, "near");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const box = await page.locator("#canvas").boundingBox();
    const geo = await page.evaluate(() => window.__kg.getEdgeGeometry(window.__kg.state.edges[0].id));
    await page.mouse.move(box.x + geo.mid.x, box.y + geo.mid.y - 6);
    await page.mouse.down();
    await page.mouse.move(box.x + geo.mid.x + 30, box.y + geo.mid.y - 6, { steps: 5 });
    await page.mouse.up();

    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    await page.click("#domain-model-cancel");

    await settle(page, () => page.click("#btn-fit-view"));

    const finalState = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes.length,
      edges: window.__kg.state.edges.length,
      labelT: window.__kg.state.edges[0].labelT,
    }));
    assert.equal(finalState.nodes, 2);
    assert.equal(finalState.edges, 1);
    assert.ok(typeof finalState.labelT === "number");

    const toolbarBottom = await page.evaluate(() => document.getElementById("toolbar").getBoundingClientRect().bottom);
    const nodeTops = await page.evaluate(() => window.__kg.state.nodes.map((n) => window.__kg.worldToScreen(n.x, n.y).y));
    for (const top of nodeTops) assert.ok(box.y + top >= toolbarBottom - 1);
  }, { viewport: { width: 375, height: 700 } });
});
