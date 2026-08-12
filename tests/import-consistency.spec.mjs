import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// IMPORT-PATH CONSISTENCY WARNING (issue #88)
//
// After #84 the agent is told when its own edit introduces a contradiction.
// A person importing a file was told nothing. This closes that asymmetry:
// the dialog says what the chosen action would leave behind, before anything
// is committed. Offline throughout.

// One contradiction: canClose requires a status value the property forbids.
const BROKEN = `classes:
  Incident:
    properties:
      status:
        type: text
        allowed:
          - new
          - closed
rules:
  canClose:
    conditions:
      - Incident status is archived.
actions:
  close:
    input: Incident
    preconditions:
      - canClose
    effect: e
    verification: v
`;

const CLEAN = `classes:
  Incident:
    properties: {}
  Engineer:
    properties: {}
relationships:
  - name: assignedTo
    from: Incident
    to: Engineer
`;

const openImport = (page, text) => page.evaluate((t) => window.__kg.formats.openImportDialog(t, "yaml"), text);
const commit = (page, text, button) => page.evaluate(([t, b]) => {
  window.__kg.formats.openImportDialog(t, "yaml");
  document.getElementById(b).click();
}, [text, button]);
const summary = (page) => page.locator("#import-summary").textContent();

test("a file that would introduce a contradiction says so before anything is committed", async () => {
  await withPage(async (page) => {
    await openImport(page, BROKEN);
    const text = await summary(page);
    assert.match(text, /Consistency:/);
    assert.match(text, /1 contradiction/);
    // Warned, not blocked, and nothing has changed yet.
    assert.equal(await page.locator("#import-merge").isVisible(), true);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 0);
  });
});

test("a clean file says nothing at all — the quiet path stays quiet", async () => {
  await withPage(async (page) => {
    await openImport(page, CLEAN);
    assert.equal(/Consistency:/.test(await summary(page)), false);
  });
});

test("notes never reach the dialog, however incomplete the file is", async () => {
  // Three classes, one relationship, an effect-less action: all `note`, all
  // normal for a partial model. Warning about them on every import is how a
  // user learns to stop reading the line.
  await withPage(async (page) => {
    await openImport(page, "classes:\n  A:\n    properties: {}\n  B:\n    properties: {}\n  C:\n    properties: {}\nrelationships:\n  - name: r\n    from: A\n    to: B\nrules:\n  unused:\n    conditions:\n      - Something.\nactions:\n  act:\n    input: A\n    preconditions: []\n    effect: \"\"\n    verification: \"\"\n");
    assert.equal(/Consistency:/.test(await summary(page)), false);
  });
});

test("Merge and Replace are counted separately, because they leave different models", async () => {
  // The case a file-only check gets wrong: this file is clean on its own, but
  // merging it onto a graph that already contradicts itself leaves the
  // contradiction in place, while replacing removes it.
  await withPage(async (page) => {
    await commit(page, BROKEN, "import-replace");
    assert.ok((await page.evaluate(() => window.__kg.consistency.current())).some((f) => f.severity === "error"));

    await openImport(page, CLEAN);
    const text = await summary(page);
    assert.match(text, /Merge would leave 1 contradiction/);
    assert.match(text, /Replace would leave 0/);
  });
});

test("a file clean on its own still warns when it contradicts the graph it lands on", async () => {
  await withPage(async (page) => {
    // Start from a graph whose Incident.status allows only new/closed.
    await commit(page, "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n        allowed:\n          - new\n          - closed\n", "import-replace");
    assert.deepEqual(await page.evaluate(() => window.__kg.consistency.current().filter((f) => f.severity === "error")), []);

    // A file containing only a rule — no contradiction anywhere in the file
    // itself, because it declares no property to contradict.
    const ruleOnly = "rules:\n  canArchive:\n    conditions:\n      - Incident status is archived.\nactions:\n  archive:\n    input: Incident\n    preconditions:\n      - canArchive\n    effect: e\n    verification: v\n";
    await openImport(page, ruleOnly);
    assert.match(await summary(page), /Merge would leave 1 contradiction/);
  });
});

test("the projection never edits the graph", async () => {
  await withPage(async (page) => {
    await commit(page, CLEAN, "import-replace");
    const before = await page.evaluate(() => ({ nodes: window.__kg.state.nodes.length, history: window.__kg.history.past.length }));
    await openImport(page, BROKEN);
    await page.click("#import-cancel");
    assert.deepEqual(await page.evaluate(() => ({ nodes: window.__kg.state.nodes.length, history: window.__kg.history.past.length })), before);
  });
});

test("the projection helpers merge by name and let Replace stand alone", async () => {
  await withPage(async (page) => {
    const projected = await page.evaluate(() => {
      const current = { classes: { A: { properties: { p: { type: "text" } } } }, relationships: [{ name: "r", from: "A", to: "A" }], rules: { x: {} }, actions: {} };
      const incoming = { classes: { A: { properties: { q: { type: "text" } } }, B: {} }, relationships: [{ name: "s", from: "A", to: "B" }], rules: { y: {} }, actions: {} };
      return {
        merged: window.__kg.consistency.projectImport(current, incoming, "merge"),
        replaced: window.__kg.consistency.projectImport(current, incoming, "replace"),
      };
    });
    assert.deepEqual(Object.keys(projected.merged.classes).sort(), ["A", "B"]);
    assert.deepEqual(Object.keys(projected.merged.classes.A.properties).sort(), ["p", "q"], "properties merge rather than replace");
    assert.equal(projected.merged.relationships.length, 2);
    assert.deepEqual(Object.keys(projected.merged.rules).sort(), ["x", "y"]);
    assert.deepEqual(Object.keys(projected.replaced.classes), ["A", "B"], "replace leaves you with the file alone");
    assert.equal(projected.replaced.relationships.length, 1);
  });
});

test("a relationship the import would drop is counted in what it leaves behind", async () => {
  await withPage(async (page) => {
    await openImport(page, "classes:\n  Incident:\n    properties: {}\nrelationships:\n  - name: causedBy\n    from: Incident\n    to: Ghost\n");
    const text = await summary(page);
    assert.match(text, /1 relationship\(s\) cannot be stored/,
      "the count is the number of relationships, not the length of the joined label string");
    assert.match(text, /Incident --causedBy--> Ghost/);
    assert.match(text, /1 contradiction/, "counted once, not once per source");
  });
});

test("the warning retranslates with the interface", async () => {
  await withPage(async (page) => {
    await openImport(page, BROKEN);
    assert.match(await summary(page), /Consistency:/);
    await page.click("#import-cancel");
    await page.evaluate(() => window.__kg.lang.toggle());
    await openImport(page, BROKEN);
    assert.match(await summary(page), /Konzisztencia:/);
  });
});
