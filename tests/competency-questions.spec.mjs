import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, applyImport } from "./lib/page.mjs";

// Competency Questions (issue #94) — persistence, both file formats, the
// Domain Model editor, and Review Changes.
//
// A CQ is a requirement *on* the ontology, not an element of it: the real
// question a future agent must be able to answer (or have enough orientation
// to work out how to answer). So the tests below are mostly about the thing
// the issue says was missing before — durability. A question that survives
// only in the conversation is not a requirement, it is a memory.
//
// The CQ coverage check (the one model-based part of the feature) is a
// separate file, tests/cq-coverage.spec.mjs, so a mocked-API test never sits
// next to these purely offline ones.

const CQ_ONLY_YAML = [
  "competency_questions:",
  "  - id: cq_external_17",
  "    text: Which escalation policy applies to this support request?",
  "  - id: cq_external_18",
  "    text: What evidence is required before the request can be closed?",
  "",
].join("\n");

const readCqs = (page) => page.evaluate(() => window.__kg.state.competencyQuestions.map((cq) => ({ ...cq })));

async function seedCqs(page, texts) {
  return page.evaluate((list) => list.map((text) => window.__kg.actions.createCompetencyQuestion(text).id), texts);
}

async function openDomainModel(page) {
  await page.click("#btn-domain-model");
  await page.waitForSelector("#domain-model-overlay", { state: "visible" });
}

// --- Persistence -----------------------------------------------------------

test("a payload saved before competency questions existed loads as an empty list, not an error", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      // Exactly the shape writeGraphToStorage() produced before issue #94:
      // no competencyQuestions, no nextCqNum.
      localStorage.setItem("kg-canvas-live", JSON.stringify({
        nodes: [{ id: "n1", label: "Invoice", x: 10, y: 10, w: 160, h: 60 }],
        edges: [], nextNodeNum: 2, nextEdgeNum: 1,
        graphName: "Legacy", graphNameIsDefault: false,
        rules: [], actions: [], nextRuleNum: 1, nextActionNum: 1,
      }));
    });
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    assert.deepEqual(await readCqs(page), []);
    assert.equal(await page.evaluate(() => window.__kg.state.nextCqNum), 1);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 1, "the rest of the payload still loads");
  });
});

test("a competency question and its counter survive a save/reload", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["Which escalation policy applies to this support request?"]);
    await page.evaluate(() => window.__kg.storage.save());
    await page.evaluate(() => window.__kg.storage.whenIdle());
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));

    const cqs = await readCqs(page);
    assert.equal(cqs.length, 1);
    assert.equal(cqs[0].id, "cq1");
    assert.equal(cqs[0].text, "Which escalation policy applies to this support request?");
    assert.equal(await page.evaluate(() => window.__kg.state.nextCqNum), 2,
      "the counter must survive too, or the next question minted would be a second cq1");
  });
});

test("a stored payload whose ids run ahead of the counter still cannot mint a duplicate id", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      localStorage.setItem("kg-canvas-live", JSON.stringify({
        nodes: [], edges: [], nextNodeNum: 1, nextEdgeNum: 1,
        rules: [], actions: [],
        // Hand-edited/externally-produced: ids well past the counter.
        nextCqNum: 1,
        competencyQuestions: [{ id: "cq7", text: "Which team owns this?" }],
      }));
    });
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));

    assert.equal(await page.evaluate(() => window.__kg.state.nextCqNum), 8);
    const minted = await page.evaluate(() => window.__kg.actions.createCompetencyQuestion("A second question.").id);
    assert.equal(minted, "cq8");
  });
});

test("editing competency questions in the Domain Model dialog is one undo step", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["First question?", "Second question?"]);
    await openDomainModel(page);
    // Two edits, one Save: reword the first, remove the second.
    await page.locator("#domain-model-cq-list .dm-cq-text").first().fill("First question, reworded?");
    await page.locator("#domain-model-cq-list .details-row-remove").last().click();
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    assert.deepEqual((await readCqs(page)).map((cq) => cq.text), ["First question, reworded?"]);

    await page.click("#btn-undo");
    assert.deepEqual((await readCqs(page)).map((cq) => cq.text), ["First question?", "Second question?"],
      "one undo must restore both halves of the same save");

    await page.click("#btn-redo");
    assert.deepEqual((await readCqs(page)).map((cq) => cq.text), ["First question, reworded?"]);
  });
});

// --- Canonical JSON --------------------------------------------------------

test("the canonical JSON export carries competencyQuestions, and re-importing it preserves ids exactly", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["Which escalation policy applies?", "What evidence closes a request?"]);
    // buildJsonExport() reads state.meta, which only exists once something has
    // been saved — stand one in rather than driving a whole Save Version.
    await page.evaluate(() => {
      window.__kg.state.meta = {
        format_version: 1, graph_id: "g-cq-test", version: 1,
        created: "2026-01-01T00:00:00Z", saved: "2026-01-01T00:00:00Z",
      };
    });
    const json = await page.evaluate(() => JSON.stringify(window.__kg.formats.buildJsonExport(new Date().toISOString())));
    const parsed = JSON.parse(json);
    assert.deepEqual(parsed.competencyQuestions, [
      { id: "cq1", text: "Which escalation policy applies?" },
      { id: "cq2", text: "What evidence closes a request?" },
    ]);

    // Reopen into a fresh session: the empty-canvas path is a full restore.
    await page.evaluate(() => { window.__kg.state.competencyQuestions.length = 0; window.__kg.markDirty(); });
    await page.evaluate((text) => window.__kg.formats.commitJsonImport(text, "merge", "graph_v0001_2026-01-01T0000Z.json"), json);
    assert.deepEqual(await readCqs(page), parsed.competencyQuestions, "full restore preserves both id and text");
  });
});

test("a JSON file written before competency questions existed still imports", async () => {
  await withPage(async (page) => {
    const legacy = JSON.stringify({
      meta: { format_version: 1, graph_id: "g1", version: 1, created: null, saved: null },
      nodes: [{ id: "n1", label: "Invoice", x: 0, y: 0, w: 160, h: 60 }],
      edges: [], rules: [], actions: [],
    });
    const parsed = await page.evaluate((t) => window.__kg.formats.parseJsonImport(t), legacy);
    assert.equal(parsed.ok, true);
    assert.deepEqual(parsed.graph.competencyQuestions, []);
    assert.deepEqual(parsed.warnings, [], "an absent field is not a defect worth warning about");
  });
});

test("a JSON file containing only competency questions is not classified as empty", async () => {
  await withPage(async (page) => {
    const cqOnly = JSON.stringify({
      meta: { format_version: 1, graph_id: "g1", version: 1 },
      nodes: [], edges: [], rules: [], actions: [],
      competencyQuestions: [{ id: "cq1", text: "Which escalation policy applies?" }],
    });
    await page.evaluate((t) => window.__kg.formats.openImportDialog(t, "json"), cqOnly);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    const summary = await page.locator("#import-summary").textContent();
    // The empty-file branch is the one that offers no action at all; anything
    // that still offers Merge/Restore means the file was understood.
    assert.equal(await page.locator("#import-merge").isVisible(), true,
      `a CQ-only file must remain importable, got: ${summary}`);
    await applyImport(page);
    assert.deepEqual((await readCqs(page)).map((cq) => cq.text), ["Which escalation policy applies?"]);
  });
});

test("JSON merge updates a matching competency question and adds a new one; Replace drops the unmatched", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["Original wording?", "Untouched question?"]);
    const incoming = JSON.stringify({
      meta: { format_version: 1, graph_id: "g1", version: 1 },
      nodes: [{ id: "n1", label: "Invoice", x: 0, y: 0, w: 160, h: 60 }], edges: [], rules: [], actions: [],
      competencyQuestions: [
        { id: "cq1", text: "Reworded by the file." },
        { id: "cq9", text: "Brand new question?" },
      ],
    });
    await page.evaluate((t) => window.__kg.formats.commitJsonImport(t, "merge", null), incoming);
    assert.deepEqual(await readCqs(page), [
      { id: "cq1", text: "Reworded by the file." },
      { id: "cq2", text: "Untouched question?" },
      { id: "cq9", text: "Brand new question?" },
    ], "merge updates by id, leaves unmentioned questions alone, and keeps the file's own new id");

    await page.evaluate((t) => window.__kg.formats.commitJsonImport(t, "replace", null), incoming);
    assert.deepEqual((await readCqs(page)).map((cq) => cq.id), ["cq1", "cq9"],
      "replace leaves exactly what the file lists");
  });
});

// --- Domain Model YAML -----------------------------------------------------

test("the Domain Model YAML export writes competency_questions first", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["Which escalation policy applies to this support request?"]);
    const yaml = await page.evaluate(() => window.__kg.formats.buildDomainYamlExport());
    assert.match(yaml, /^competency_questions:\n {2}- id: cq1\n {4}text: Which escalation policy applies to this support request\?\n/);
    assert.ok(yaml.indexOf("competency_questions:") < yaml.indexOf("classes:"),
      "requirements lead the document they motivate");
  });
});

test("a Domain Model YAML without the section still imports, and a CQ-only file is valid input", async () => {
  await withPage(async (page) => {
    const legacy = "classes:\n  Invoice:\n    properties: {}\nrelationships: []\nrules: {}\nactions: {}\n";
    const parsedLegacy = await page.evaluate((t) => window.__kg.formats.parseDomainYamlImport(t), legacy);
    assert.deepEqual(parsedLegacy.competencyQuestions, []);

    await page.evaluate((t) => window.__kg.formats.openImportDialog(t, "yaml"), CQ_ONLY_YAML);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await applyImport(page);
    assert.deepEqual(await readCqs(page), [
      { id: "cq_external_17", text: "Which escalation policy applies to this support request?" },
      { id: "cq_external_18", text: "What evidence is required before the request can be closed?" },
    ], "the external-requirements-seed workflow needs no classes to be a real import");
  });
});

test("YAML merge adds and updates competency questions without deleting unmentioned ones; Replace removes them", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["Kept, unmentioned?", "Will be reworded?"]);
    const incoming = [
      "competency_questions:",
      "  - id: cq2",
      "    text: Reworded by the file?",
      "  - text: Added with no id at all?",
      "",
    ].join("\n");

    await page.evaluate((t) => window.__kg.formats.openImportDialog(t, "yaml"), incoming);
    await applyImport(page, "#import-merge");
    assert.deepEqual(await readCqs(page), [
      { id: "cq1", text: "Kept, unmentioned?" },
      { id: "cq2", text: "Reworded by the file?" },
      { id: "cq3", text: "Added with no id at all?" },
    ], "a missing id is assigned safely rather than rejected");

    await page.evaluate((t) => window.__kg.formats.openImportDialog(t, "yaml"), incoming);
    await applyImport(page, "#import-replace");
    assert.deepEqual((await readCqs(page)).map((cq) => cq.text),
      ["Reworded by the file?", "Added with no id at all?"],
      "replace removes what the file does not mention");
  });
});

test("an id-less competency question with identical text does not create an obvious duplicate", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["Which escalation policy applies?"]);
    const incoming = "competency_questions:\n  - text: Which escalation policy applies?\n";
    await page.evaluate((t) => window.__kg.formats.openImportDialog(t, "yaml"), incoming);
    await applyImport(page, "#import-merge");
    assert.deepEqual(await readCqs(page), [{ id: "cq1", text: "Which escalation policy applies?" }]);
  });
});

test("agent-merge can add a competency question and can reword one by id", async () => {
  await withPage(async (page) => {
    // The agent's own tool path (commitYamlImport's "agent-merge" mode), not
    // the manual dialog: a confirmed CQ has to be persistable mid-interview.
    await page.evaluate(() => window.__kg.formats.commitYamlImport(
      "competency_questions:\n  - text: Which escalation policy applies?\n", "agent-merge"));
    assert.deepEqual(await readCqs(page), [{ id: "cq1", text: "Which escalation policy applies?" }]);

    await page.evaluate(() => window.__kg.formats.commitYamlImport(
      "competency_questions:\n  - id: cq1\n    text: Which escalation policy applies to this support request?\n", "agent-merge"));
    assert.deepEqual(await readCqs(page), [
      { id: "cq1", text: "Which escalation policy applies to this support request?" },
    ], "rewording by id must stay the same requirement, not become a second one");
  });
});

test("an empty competency question is dropped on import rather than stored as a blank requirement", async () => {
  await withPage(async (page) => {
    const parsed = await page.evaluate(() => window.__kg.formats.parseDomainYamlImport(
      "competency_questions:\n  - id: cq1\n    text: \"\"\n  - id: cq2\n    text: A real one?\n"));
    assert.deepEqual(parsed.competencyQuestions, [{ id: "cq2", text: "A real one?" }]);
  });
});

// --- Domain Model dialog ---------------------------------------------------

test("competency questions render, add, and remove in the existing Domain Model dialog", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["Which escalation policy applies?"]);
    await openDomainModel(page);

    assert.equal(await page.locator("#domain-model-cq-list .domain-model-cq-card").count(), 1);
    assert.match(await page.locator("#domain-model-cq-label").textContent(), /Competency questions \(1\)/);
    assert.equal(await page.locator("#domain-model-cq-list .dm-cq-text").first().inputValue(),
      "Which escalation policy applies?");

    await page.click("#domain-model-add-cq");
    assert.match(await page.locator("#domain-model-cq-label").textContent(), /\(2\)/);
    await page.locator("#domain-model-cq-list .dm-cq-text").last().fill("What evidence closes a request?");
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });

    assert.deepEqual((await readCqs(page)).map((cq) => cq.text),
      ["Which escalation policy applies?", "What evidence closes a request?"]);
  });
});

test("Cancel leaves competency questions untouched, and an empty card is never saved", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["Original?"]);
    await openDomainModel(page);
    await page.locator("#domain-model-cq-list .dm-cq-text").first().fill("Edited but abandoned?");
    await page.click("#domain-model-cancel");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    assert.deepEqual((await readCqs(page)).map((cq) => cq.text), ["Original?"]);

    await openDomainModel(page);
    await page.click("#domain-model-add-cq"); // added, never typed into
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    assert.deepEqual((await readCqs(page)).map((cq) => cq.text), ["Original?"]);
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), 0,
      "a no-op save must not create an undo step either");
  });
});

test("the competency-question filter hides non-matching cards without dropping them on Save", async () => {
  await withPage(async (page) => {
    await seedCqs(page, ["Which escalation policy applies?", "Who owns this service?"]);
    await openDomainModel(page);
    await page.fill("#domain-model-cq-filter", "escalation");
    assert.equal(await page.locator("#domain-model-cq-list .domain-model-cq-card").first().isVisible(), true);
    assert.equal(await page.locator("#domain-model-cq-list .domain-model-cq-card").last().isVisible(), false);

    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    assert.equal((await readCqs(page)).length, 2, "the filter is a view, not a deletion");
  });
});

test("the language toggle relabels the competency-question UI", async () => {
  await withPage(async (page) => {
    await openDomainModel(page);
    assert.match(await page.locator("#domain-model-cq-label").textContent(), /Competency questions/);
    assert.match(await page.locator("#domain-model-add-cq").textContent(), /Add competency question/);
    await page.evaluate(() => window.__kg.lang.toggle());
    assert.match(await page.locator("#domain-model-cq-label").textContent(), /Kompetenciakérdések/);
    assert.match(await page.locator("#domain-model-add-cq").textContent(), /Kompetenciakérdés hozzáadása/);
  });
});

// --- Review Changes --------------------------------------------------------

test("added, changed and removed competency questions all show up in the semantic diff", async () => {
  await withPage(async (page) => {
    const diff = await page.evaluate(() => {
      const before = { nodes: [], edges: [], rules: [], actions: [], competencyQuestions: [
        { id: "cq1", text: "When should a request be escalated?" },
        { id: "cq2", text: "Who closes the request?" },
      ] };
      const after = { nodes: [], edges: [], rules: [], actions: [], competencyQuestions: [
        { id: "cq1", text: "Which escalation policy applies to this support request?" },
        { id: "cq3", text: "What evidence is required before the request can be closed?" },
      ] };
      return window.__kg.reviewChanges.computeSemanticDiff(before, after);
    });
    assert.deepEqual(diff.competencyQuestions.added.map((c) => c.text),
      ["What evidence is required before the request can be closed?"]);
    assert.deepEqual(diff.competencyQuestions.removed.map((c) => c.text), ["Who closes the request?"]);
    assert.deepEqual(diff.competencyQuestions.changed, [{
      id: "cq1",
      before: "When should a request be escalated?",
      after: "Which escalation policy applies to this support request?",
    }], "a reworded question is one changed requirement, not a delete plus an add");
  });
});

test("a competency-question-only change is not an empty semantic diff, and reads as such in the dialog", async () => {
  await withPage(async (page) => {
    const empty = await page.evaluate(() => {
      const base = { nodes: [], edges: [], rules: [], actions: [], competencyQuestions: [] };
      const after = { ...base, competencyQuestions: [{ id: "cq1", text: "Which escalation policy applies?" }] };
      const diff = window.__kg.reviewChanges.computeSemanticDiff(base, after);
      return window.__kg.reviewChanges.isSemanticDiffEmpty(diff);
    });
    assert.equal(empty, false);

    // ...and end to end, through a real edit and the real dialog.
    await page.evaluate(() => window.__kg.formats.commitYamlImport(
      "competency_questions:\n  - text: Which escalation policy applies?\n", "agent-merge"));
    await page.evaluate(() => window.__kg.reviewChanges.open());
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    assert.match(await page.locator("#review-panel-summary").textContent(), /1 competency question added/);
    await page.evaluate(() => window.__kg.reviewChanges.setTab("details"));
    assert.match(await page.locator("#review-panel-details").textContent(), /Which escalation policy applies\?/);
  });
});
