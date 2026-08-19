import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, waitForDownloads } from "./lib/page.mjs";

// Import Review (issue #122) -- deterministic half only: the diff-driven
// dialog UI, the decision widget (keep current / take incoming / free-text
// note), decided/total gating, the no-LLM Apply path, the Markdown decisions
// export, and the dialog's open/close/undo behavior. The proposer ("Suggest
// matches") and execution-agent paths are covered separately in
// tests/import-review-agent.spec.mjs, since those need mocked LLM calls.

async function readDownload(dl) {
  const stream = await dl.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

// Seeds state.meta (only set for real once "Save Version" has run) and
// returns the live graph as a JSON string, exactly like exportJson() in
// tests/import-review-diff.spec.mjs.
async function exportJson(page) {
  return page.evaluate(() => {
    if (!window.__kg.state.meta) {
      window.__kg.state.meta = { format_version: 1, graph_id: "test-graph", version: 0, created: "2026-01-01T00:00:00Z" };
    }
    return JSON.stringify(window.__kg.formats.buildJsonExport());
  });
}

async function openReviewFor(page, json) {
  await page.evaluate((text) => window.__kg.formats.openImportDialog(text, "json", "test.json"), json);
  await page.click("#import-review");
  await page.waitForSelector("#import-review-overlay", { state: "visible" });
}

test("the Review button is offered for JSON and YAML imports, not TXT", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const json = await exportJson(page);
    await page.evaluate((text) => window.__kg.formats.openImportDialog(text, "json", "test.json"), json);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    assert.equal(await page.locator("#import-review").isVisible(), true);
    await page.click("#import-cancel");

    await page.evaluate(() => window.__kg.formats.openImportDialog("classes:\n  Widget:\n    properties: {}\n", "yaml"));
    await page.waitForSelector("#import-overlay", { state: "visible" });
    assert.equal(await page.locator("#import-review").isVisible(), true);
    await page.click("#import-cancel");

    await page.evaluate(() => window.__kg.formats.openImportDialog("Widget\nGadget\nWidget -> Gadget: connectsTo\n", "txt"));
    await page.waitForSelector("#import-overlay", { state: "visible" });
    assert.equal(await page.locator("#import-review").isVisible(), false, "TXT has no properties/rules/actions/CQs for Review to add over plain Merge/Replace");
  });
});

test("opening Review buckets a changed class, an added class, and a removed class into the right sections", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await addNodeViaDblClick(page, 600, 300, "DropMe");
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Edited elsewhere.";
      root.nodes = root.nodes.filter((n) => n.label !== "DropMe");
      root.nodes.push({ id: "extra1", label: "Extra", x: 900, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      return JSON.stringify(root);
    }, json);

    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const bySection = (s) => items.filter((i) => i.section === s).map((i) => i.label);
    assert.deepEqual(bySection("matched"), ["Widget"]);
    assert.deepEqual(bySection("currentOnly"), ["DropMe"]);
    assert.deepEqual(bySection("incomingOnly"), ["Extra"]);
    assert.equal(await page.locator(".import-review-item").count(), 3);
  });
});

test("an orphan class in the incoming file is flagged in the quality-flags callout", async () => {
  await withPage(async (page) => {
    // The class-no-relationships check only fires once the graph has at
    // least one relationship at all (see consistencyExactChecks's own
    // comment) -- so the incoming file needs one connected pair plus one
    // orphan to exercise it.
    const yaml = "classes:\n  A:\n    properties: {}\n  B:\n    properties: {}\n  Lonely:\n    properties: {}\nrelationships:\n  - name: connectsTo\n    from: A\n    to: B\n";
    await page.evaluate((text) => window.__kg.formats.openImportDialog(text, "yaml"), yaml);
    await page.click("#import-review");
    await page.waitForSelector("#import-review-overlay", { state: "visible" });

    assert.deepEqual(await page.evaluate(() => window.__kg.importReview.getOrphanNames()), ["Lonely"]);
    assert.equal(await page.locator("#import-review-flags").isVisible(), true);
    assert.equal(await page.locator(".import-review-chip").count(), 1);
    assert.equal(await page.locator(".import-review-chip").first().textContent(), "Lonely");
  });
});

test("the decision widget toggles a choice on/off, accepts a free-text note, and Apply stays disabled until everything is decided", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.push({ id: "extra1", label: "Extra", x: 900, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      return JSON.stringify(root);
    }, json);
    await openReviewFor(page, mutated);

    assert.equal(await page.evaluate(() => window.__kg.importReview.allDecided()), false);
    assert.equal(await page.locator("#import-review-apply").isDisabled(), true);

    const row = page.locator(".import-review-item").first();
    await row.locator(".choice-a").click();
    assert.equal(await row.locator(".choice-a").evaluate((el) => el.classList.contains("on")), true);
    assert.equal(await row.evaluate((el) => el.classList.contains("decided")), true);

    // Clicking the same choice again un-picks it.
    await row.locator(".choice-a").click();
    assert.equal(await row.locator(".choice-a").evaluate((el) => el.classList.contains("on")), false);
    assert.equal(await row.evaluate((el) => el.classList.contains("undecided")), true);

    // A note alone is also a valid, standalone decision.
    await row.locator(".import-review-note").fill("do something specific");
    assert.equal(await row.evaluate((el) => el.classList.contains("decided")), true);

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    for (const item of items) await page.evaluate((id) => window.__kg.importReview.setChoice(id, "a"), item.id);
    // Re-apply the note decision (setChoice above replaced the first item's decision).
    await row.locator(".import-review-note").fill("do something specific");

    assert.equal(await page.evaluate(() => window.__kg.importReview.allDecided()), true);
    assert.equal(await page.locator("#import-review-apply").isDisabled(), false);
  });
});

test("progress counters and section labels update live as decisions are made", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "A");
    await addNodeViaDblClick(page, 600, 300, "B");
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "A").meaning = "changed";
      root.nodes.find((n) => n.label === "B").meaning = "also changed";
      return JSON.stringify(root);
    }, json);
    await openReviewFor(page, mutated);

    assert.equal(await page.locator("#import-review-progress").textContent(), "0 of 2 decided");
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "a"), items[0].id);
    assert.equal(await page.locator("#import-review-progress").textContent(), "1 of 2 decided");
    assert.match(await page.locator("#import-review-matched-label").textContent(), /1\/2 decided/);
  });
});

test("Apply (no notes, no pairs) mutates the graph deterministically with no agent call, and Cancel discards nothing already committed", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    await addNodeViaDblClick(page, 600, 300, "DropMe");
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Edited elsewhere.";
      root.nodes = root.nodes.filter((n) => n.label !== "DropMe");
      root.nodes.push({ id: "extra1", label: "Extra", x: 900, y: 300, w: 160, h: 60, meaning: null, aliases: [], properties: [] });
      return JSON.stringify(root);
    }, json);
    await openReviewFor(page, mutated);

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    const widget = items.find((i) => i.label === "Widget");
    const dropMe = items.find((i) => i.label === "DropMe");
    const extra = items.find((i) => i.label === "Extra");
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "b"), widget.id); // take incoming meaning
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "a"), dropMe.id); // keep current -- DropMe survives
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "b"), extra.id); // take incoming -- Extra gets created

    await page.click("#import-review-apply");
    await page.waitForFunction(() => !window.__kg.importReview.isApplyPending());

    const result = await page.evaluate(() => window.__kg.importReview.getLastResult());
    assert.equal(result.ok, true);
    assert.deepEqual(result.touched.sort((a, b) => a.name.localeCompare(b.name)),
      [{ kind: "class", name: "Extra", action: "added" }, { kind: "class", name: "Widget", action: "updated" }]);

    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label).sort());
    assert.deepEqual(labels, ["DropMe", "Extra", "Widget"]);
    const widgetMeaning = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Widget").meaning);
    assert.equal(widgetMeaning, "Edited elsewhere.");

    // One combined step: a single Undo reverts every touched entity at once.
    await page.evaluate(() => window.__kg.actions.undo());
    const labelsAfterUndo = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label).sort());
    assert.deepEqual(labelsAfterUndo, ["DropMe", "Widget"]);
    const widgetMeaningAfterUndo = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Widget").meaning);
    assert.equal(widgetMeaningAfterUndo, null);
  });
});

test("Cancel and the overlay backdrop close the dialog without ever touching state", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Edited elsewhere.";
      return JSON.stringify(root);
    }, json);
    await openReviewFor(page, mutated);
    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setChoice(id, "b"), items[0].id);

    await page.click("#import-review-cancel");
    await page.waitForSelector("#import-review-overlay", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Widget").meaning), null);

    await openReviewFor(page, mutated);
    await page.click("#import-review-overlay", { position: { x: 5, y: 5 } });
    await page.waitForSelector("#import-review-overlay", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Widget").meaning), null);
  });
});

test("Escape closes the Review dialog", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const json = await exportJson(page);
    await openReviewFor(page, json);
    await page.keyboard.press("Escape");
    await page.waitForSelector("#import-review-overlay", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__kg.importReview.isOpen()), false);
  });
});

test("Download decisions produces a Markdown file naming every item and its decision", async () => {
  await withPage(async (page) => {
    const downloads = [];
    page.on("download", (dl) => downloads.push(dl));
    await addNodeViaDblClick(page, 300, 300, "Widget");
    const json = await exportJson(page);
    const mutated = await page.evaluate((text) => {
      const root = JSON.parse(text);
      root.nodes.find((n) => n.label === "Widget").meaning = "Edited elsewhere.";
      return JSON.stringify(root);
    }, json);
    await openReviewFor(page, mutated);

    const items = await page.evaluate(() => window.__kg.importReview.getItems());
    await page.evaluate((id) => window.__kg.importReview.setNote(id, "keep thinking about this one"), items[0].id);
    await page.evaluate(() => window.__kg.importReview.setSharedNote("overall this looks fine"));

    await page.click("#import-review-download");
    await waitForDownloads(downloads, 1);
    assert.match(downloads[0].suggestedFilename(), /^import-review-decisions_.*\.md$/);
    const content = await readDownload(downloads[0]);
    assert.match(content, /Widget/);
    assert.match(content, /keep thinking about this one/);
    assert.match(content, /overall this looks fine/);
  });
});
