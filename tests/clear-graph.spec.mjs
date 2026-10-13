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
    await page.click("#btn-add-node"); // arm Add Node mode
    assert.equal(await page.evaluate(() => window.__kg.state.mode), "addNode");

    await page.click("#btn-clear");
    assert.equal(await overlayDisplay(page), "flex");
    await page.keyboard.press("Escape"); // should only dismiss the dialog

    assert.equal(await overlayDisplay(page), "none");
    assert.equal(await page.evaluate(() => window.__kg.state.mode), "addNode", "armed mode survives the dialog's own Escape");
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

test("confirming Clear empties nodes and edges", async () => {
  await withPage(async (page) => {
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
    // Wait for the restore path itself to finish rather than sleeping past it.
    await page.evaluate(() => window.__kg.storage.whenIdle());

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Issue #162: Clear removes the whole domain model -- competency questions,
// rules and actions too, not just nodes and edges -- in one undo step, names
// what it removes, and is enabled whenever any of it exists.
// ---------------------------------------------------------------------------
async function seedNonGraphContent(page) {
  await page.evaluate(() => {
    const a = window.__kg.actions;
    a.createCompetencyQuestion("Which invoices are overdue?");
    a.createCompetencyQuestion("Who approves a payment?");
    const r = a.createRule("isOverdue", ["due date has passed"]);
    a.createAction("approve", null, [r.id], "approved", "status is approved");
    window.__kg.markDirty();
  });
}

async function modelCounts(page) {
  return page.evaluate(() => ({
    nodes: window.__kg.state.nodes.length, edges: window.__kg.state.edges.length,
    cqs: window.__kg.state.competencyQuestions.length,
    rules: window.__kg.state.rules.length, actions: window.__kg.state.actions.length,
  }));
}

test("#162: Clear is enabled when only competency questions, rules or actions exist (no nodes or edges)", async () => {
  await withPage(async (page) => {
    assert.equal(await clearBtnDisabled(page), true);
    await page.evaluate(() => { window.__kg.actions.createCompetencyQuestion("Only a question."); window.__kg.markDirty(); });
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === false);
  });
});

test("#162: confirming Clear removes nodes, edges, competency questions, rules and actions", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 700, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 700, 250, "relates to");
    await seedNonGraphContent(page);
    assert.deepEqual(await modelCounts(page), { nodes: 2, edges: 1, cqs: 2, rules: 1, actions: 1 });

    await page.click("#btn-clear");
    await page.click("#confirm-ok");

    assert.deepEqual(await modelCounts(page), { nodes: 0, edges: 0, cqs: 0, rules: 0, actions: 0 });
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === true);
  });
});

test("#162: the confirm message names what will be removed, with counts", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 700, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 700, 250, "relates to");
    await seedNonGraphContent(page);
    await page.click("#btn-clear");
    assert.equal(
      await page.locator("#confirm-message").textContent(),
      "Clear the entire model? This removes 2 classes, 1 relationship, 2 competency questions, 1 rule and 1 action. This can be undone with the Undo button.",
    );
    await page.click("#confirm-cancel");
    assert.deepEqual(await modelCounts(page), { nodes: 2, edges: 1, cqs: 2, rules: 1, actions: 1 }, "cancel touches nothing");
  });
});

test("#162: clearing the whole model is one undo step, and Undo/Redo restore and re-clear all five kinds", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await seedNonGraphContent(page);
    const before = await page.evaluate(() => window.__kg.history.past.length);
    await page.click("#btn-clear");
    await page.click("#confirm-ok");
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), before + 1);

    await page.click("#btn-undo");
    assert.deepEqual(await modelCounts(page), { nodes: 1, edges: 0, cqs: 2, rules: 1, actions: 1 });
    const cqTexts = await page.evaluate(() => window.__kg.state.competencyQuestions.map((q) => q.text));
    assert.deepEqual(cqTexts, ["Which invoices are overdue?", "Who approves a payment?"]);

    await page.click("#btn-redo");
    assert.deepEqual(await modelCounts(page), { nodes: 0, edges: 0, cqs: 0, rules: 0, actions: 0 });
  });
});

test("#162: a cleared model stays empty across a reload (questions, rules and actions too)", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await seedNonGraphContent(page);
    await page.evaluate(() => window.__kg.storage.whenIdle());
    await page.click("#btn-clear");
    await page.click("#confirm-ok");
    await page.evaluate(() => window.__kg.storage.whenIdle());
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.evaluate(() => window.__kg.storage.whenIdle());
    assert.deepEqual(await modelCounts(page), { nodes: 0, edges: 0, cqs: 0, rules: 0, actions: 0 });
  });
});

test("#162: with no Helper Agent conversation, the restart-conversation option is not offered", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-clear");
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("confirm-option-row")).display), "none");
    await page.click("#confirm-cancel");
  });
});

test("#162: with a conversation, the option is offered unchecked; leaving it unchecked keeps the conversation", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.agent.state.transcript.push({ role: "user", text: "Hello" }));
    await page.click("#btn-clear");
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("confirm-option-row")).display), "flex");
    assert.equal(await page.isChecked("#confirm-option"), false);
    await page.click("#confirm-ok");
    assert.equal((await modelCounts(page)).nodes, 0);
    assert.equal(await page.evaluate(() => window.__kg.agent.state.transcript.length), 1, "conversation kept");
  });
});

test("#162: checking the option clears the model and restarts the Helper Agent conversation", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await seedNonGraphContent(page);
    await page.evaluate(() => {
      window.__kg.agent.state.transcript.push({ role: "user", text: "Hello" });
      window.__kg.agent.state.apiMessages.push({ role: "user", content: "Hello" });
    });
    await page.click("#btn-clear");
    await page.check("#confirm-option");
    await page.click("#confirm-ok");
    assert.deepEqual(await modelCounts(page), { nodes: 0, edges: 0, cqs: 0, rules: 0, actions: 0 });
    const conv = await page.evaluate(() => ({ t: window.__kg.agent.state.transcript.length, a: window.__kg.agent.state.apiMessages.length }));
    assert.deepEqual(conv, { t: 0, a: 0 });
  });
});

test("#162: the option row resets between dialogs (another confirm dialog never shows a stale checkbox)", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.agent.state.transcript.push({ role: "user", text: "Hello" }));
    await page.click("#btn-clear");
    await page.check("#confirm-option");
    await page.click("#confirm-cancel");
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("confirm-option-row")).display), "none");
    await page.click("#btn-clear");
    assert.equal(await page.isChecked("#confirm-option"), false, "re-opened unchecked");
    await page.click("#confirm-cancel");
  });
});
