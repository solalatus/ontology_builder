import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, applyImport } from "./lib/page.mjs";

// Agent Ontology, Phase G (agent_ontology_todo.md): Domain Model YAML import
// — the inverse of Phase F's export. Deliberately more aggressive than the
// base app's own TXT node/edge import (spec.md §5.3): a class/relationship/
// rule/action matched against something already on canvas gets its fields
// overwritten by the imported values on both Merge and Replace, not left
// untouched — only Replace additionally removes anything absent from the
// file. See the dated Log entry in agent_ontology_todo.md for the decision.

async function dropYaml(page, text, filename = "import.domain.yaml") {
  await page.evaluate(({ t, name }) => {
    const dt = new DataTransfer();
    const file = new File([t], name, { type: "text/yaml" });
    dt.items.add(file);
    const canvas = document.getElementById("canvas");
    canvas.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { t: text, name: filename });
  await page.waitForSelector("#import-overlay", { state: "visible" });
}

async function importSummary(page) {
  return page.locator("#import-summary").textContent();
}

const WORKED_EXAMPLE_YAML = [
  "classes:",
  "  Invoice:",
  "    meaning: A request from a supplier to receive payment.",
  "    aliases:",
  "      - bill",
  "    properties:",
  "      invoiceNumber:",
  "        type: text",
  "      amount:",
  "        type: number",
  "        unit: EUR",
  "  Supplier:",
  "    meaning: An organization providing goods or services.",
  "    aliases: []",
  "    properties: {}",
  "relationships:",
  "  - name: issuedBy",
  "    from: Invoice",
  "    to: Supplier",
  "    meaning: The supplier that submitted the invoice.",
  "rules:",
  "  canApproveInvoice:",
  "    conditions:",
  "      - invoice status is matched",
  "      - supplier risk status is clear",
  "actions:",
  "  approveInvoice:",
  "    input: Invoice",
  "    preconditions:",
  "      - canApproveInvoice",
  "    effect: invoice status becomes approved",
  "    verification: confirm the new invoice status",
  "",
].join("\n");

test("Merge on an empty graph reproduces a full worked-example YAML exactly — classes, relationships, rules, and actions all land correctly", async () => {
  await withPage(async (page) => {
    await dropYaml(page, WORKED_EXAMPLE_YAML);
    await applyImport(page, "#import-merge");

    const { nodes, edges, rules, actions } = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes,
      edges: window.__kg.state.edges,
      rules: window.__kg.state.rules,
      actions: window.__kg.state.actions,
    }));
    assert.equal(nodes.length, 2);
    assert.equal(edges.length, 1);
    assert.equal(rules.length, 1);
    assert.equal(actions.length, 1);

    const invoice = nodes.find((n) => n.label === "Invoice");
    const supplier = nodes.find((n) => n.label === "Supplier");
    assert.equal(invoice.meaning, "A request from a supplier to receive payment.");
    assert.deepEqual(invoice.aliases, ["bill"]);
    assert.equal(invoice.properties.length, 2);
    assert.ok(invoice.properties.some((p) => p.name === "amount" && p.type === "number" && p.unit === "EUR"));

    assert.equal(edges[0].source, invoice.id);
    assert.equal(edges[0].target, supplier.id);
    assert.equal(edges[0].relation, "issuedBy", "the edge's relation label becomes the imported camelCase name");
    assert.equal(edges[0].meaning, "The supplier that submitted the invoice.");

    assert.equal(rules[0].name, "canApproveInvoice");
    assert.deepEqual(rules[0].conditions, ["invoice status is matched", "supplier risk status is clear"]);

    assert.equal(actions[0].name, "approveInvoice");
    assert.equal(actions[0].inputClassId, invoice.id);
    assert.deepEqual(actions[0].preconditions, [rules[0].id]);
    assert.equal(actions[0].effect, "invoice status becomes approved");
  });
});

// Regression coverage for a real bug a live ontology-recovery eval run
// found in itself (see helper_agent_todo.md's dated Log entry): parseYamlValueToken
// only special-cased the *empty* inline list "[]" -- a non-empty one like
// "aliases: [ticket, issue]" or "preconditions: [canApproveInvoice]" fell
// through to the plain-string branch, so Array.isArray() checks downstream
// saw a string and silently treated the field as not given, dropping
// exactly what was sent. This is completely idiomatic YAML for a short
// list and a real model wrote it unprompted. Same worked example as above,
// but every list field uses inline flow syntax instead of block "- item"
// lines, to prove both styles now parse identically.
const INLINE_LIST_WORKED_EXAMPLE_YAML = [
  "classes:",
  "  Invoice:",
  "    meaning: A request from a supplier to receive payment.",
  "    aliases: [bill]",
  "    properties:",
  "      invoiceNumber:",
  "        type: text",
  "      amount:",
  "        type: number",
  "        unit: EUR",
  "  Supplier:",
  "    meaning: An organization providing goods or services.",
  "    aliases: []",
  "    properties: {}",
  "relationships:",
  "  - name: issuedBy",
  "    from: Invoice",
  "    to: Supplier",
  "    meaning: The supplier that submitted the invoice.",
  "rules:",
  "  canApproveInvoice:",
  "    conditions:",
  "      - invoice status is matched",
  "      - supplier risk status is clear",
  "actions:",
  "  approveInvoice:",
  "    input: Invoice",
  "    preconditions: [canApproveInvoice]",
  "    effect: invoice status becomes approved",
  "    verification: confirm the new invoice status",
  "",
].join("\n");

test("Merge parses inline flow-list syntax (\"aliases: [bill]\", \"preconditions: [canApproveInvoice]\") the same as block-list syntax", async () => {
  await withPage(async (page) => {
    await dropYaml(page, INLINE_LIST_WORKED_EXAMPLE_YAML);
    await applyImport(page, "#import-merge");

    const { nodes, rules, actions } = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes,
      rules: window.__kg.state.rules,
      actions: window.__kg.state.actions,
    }));
    const invoice = nodes.find((n) => n.label === "Invoice");
    assert.deepEqual(invoice.aliases, ["bill"], "an inline single-item list must parse to a real array, not the literal string \"[bill]\"");

    assert.equal(rules.length, 1);
    assert.equal(actions.length, 1);
    assert.deepEqual(actions[0].preconditions, [rules[0].id],
      "the action's inline-list precondition must resolve to the real rule id, not be dropped to []");
  });
});

// Regression coverage for issue #76: a relationship written as an inline
// flow *map* list item (`- {name: issuedBy, from: Invoice, to: Supplier}`)
// used to parse into a garbage single-key object instead of a real
// {name, from, to} triple, so name/from/to all came back undefined and
// commitYamlImport()'s undeclared-endpoint guard silently dropped the whole
// relationship — no error, no edge, one fewer item in the diff summary with
// nothing explaining why. Same worked example as above, but the
// relationship uses flow-map-as-list-item syntax instead of block style, to
// prove both now parse identically and the edge actually reaches the canvas
// through the real import pipeline, not just the standalone parser.
const FLOW_MAP_RELATIONSHIP_WORKED_EXAMPLE_YAML = [
  "classes:",
  "  Invoice:",
  "    meaning: A request from a supplier to receive payment.",
  "  Supplier:",
  "    meaning: An organization providing goods or services.",
  "relationships:",
  "  - {name: issuedBy, from: Invoice, to: Supplier, meaning: The supplier that submitted the invoice.}",
  "",
].join("\n");

test("Merge parses a relationship written as a flow-map list item (\"- {name: r, from: A, to: B}\") the same as block-style syntax (issue #76)", async () => {
  await withPage(async (page) => {
    await dropYaml(page, FLOW_MAP_RELATIONSHIP_WORKED_EXAMPLE_YAML);
    await applyImport(page, "#import-merge");

    const { nodes, edges } = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes,
      edges: window.__kg.state.edges,
    }));
    const invoice = nodes.find((n) => n.label === "Invoice");
    const supplier = nodes.find((n) => n.label === "Supplier");
    assert.equal(edges.length, 1, "the flow-map relationship must actually reach the canvas as a real edge, not be silently dropped");
    assert.equal(edges[0].source, invoice.id);
    assert.equal(edges[0].target, supplier.id);
    assert.equal(edges[0].relation, "issuedBy");
    assert.equal(edges[0].meaning, "The supplier that submitted the invoice.");
  });
});

test("An inline flow-list item that's a quoted string containing a comma doesn't get split on that inner comma", async () => {
  await withPage(async (page) => {
    const text = [
      "classes:",
      '  Invoice:',
      '    aliases: ["bill, formal", memo]',
      "",
    ].join("\n");
    await dropYaml(page, text);
    await applyImport(page, "#import-merge");

    const invoice = (await page.evaluate(() => window.__kg.state.nodes))[0];
    assert.deepEqual(invoice.aliases, ["bill, formal", "memo"]);
  });
});

test("Merge is idempotent — re-importing the exact same file produces no duplicates", async () => {
  await withPage(async (page) => {
    await dropYaml(page, WORKED_EXAMPLE_YAML);
    await applyImport(page, "#import-merge");

    await dropYaml(page, WORKED_EXAMPLE_YAML);
    await applyImport(page, "#import-merge");

    const { nodes, edges, rules, actions } = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes.length,
      edges: window.__kg.state.edges.length,
      rules: window.__kg.state.rules.length,
      actions: window.__kg.state.actions.length,
    }));
    assert.equal(nodes, 2);
    assert.equal(edges, 1);
    assert.equal(rules, 1);
    assert.equal(actions, 1);
  });
});

test("Merge overwrites a matched class's meaning/aliases/properties wholesale — old properties are gone, not merged field-by-field", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      const invoice = window.__kg.actions.createNode(100, 100, "Invoice");
      invoice.meaning = "OLD MEANING";
      invoice.aliases = ["old-alias"];
      invoice.properties = [{ id: "old", name: "oldProp", type: "text", unit: null, allowed: null }];
      window.__kg.markDirty();
    });

    const text = [
      "classes:",
      "  Invoice:",
      "    meaning: NEW MEANING",
      "    aliases:",
      "      - new-alias",
      "    properties:",
      "      newProp:",
      "        type: text",
      "relationships: []",
      "rules: {}",
      "actions: {}",
      "",
    ].join("\n");
    await dropYaml(page, text);
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(nodes.length, 1, "matched by label, not duplicated");
    const invoice = nodes[0];
    assert.equal(invoice.meaning, "NEW MEANING");
    assert.deepEqual(invoice.aliases, ["new-alias"]);
    assert.equal(invoice.properties.length, 1);
    assert.equal(invoice.properties[0].name, "newProp", "the old property is fully gone, not kept alongside the new one");
  });
});

test("Merge never removes a class/rule/action that isn't mentioned in the file — additive-only for unmatched entries", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      window.__kg.actions.createNode(900, 900, "Outsider");
      window.__kg.actions.createRule("outsiderRule", ["some condition"]);
      window.__kg.markDirty();
    });

    const text = [
      "classes:",
      "  Newcomer:",
      "    meaning: null",
      "    aliases: []",
      "    properties: {}",
      "relationships: []",
      "rules: {}",
      "actions: {}",
      "",
    ].join("\n");
    await dropYaml(page, text);
    await applyImport(page, "#import-merge");

    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(labels.sort(), ["Newcomer", "Outsider"]);
    const ruleNames = await page.evaluate(() => window.__kg.state.rules.map((r) => r.name));
    assert.deepEqual(ruleNames, ["outsiderRule"]);
  });
});

test("Replace mode removes classes/relationships/rules/actions absent from the file, in exactly one undo step, fully reversible", async () => {
  await withPage(async (page) => {
    await dropYaml(page, WORKED_EXAMPLE_YAML);
    await applyImport(page, "#import-merge");
    await page.evaluate(() => {
      window.__kg.actions.createNode(900, 900, "ToBeRemoved");
      window.__kg.markDirty();
    });
    const before = await page.evaluate(() => window.__kg.history.past.length);

    const trimmed = [
      "classes:",
      "  Invoice:",
      "    meaning: A request from a supplier to receive payment.",
      "    aliases:",
      "      - bill",
      "    properties: {}",
      "relationships: []",
      "rules: {}",
      "actions: {}",
      "",
    ].join("\n");
    await dropYaml(page, trimmed);
    await applyImport(page, "#import-replace");

    const after = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after, before + 1, "Replace is exactly one undo step regardless of how much changed");

    let labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(labels, ["Invoice"], "Supplier, ToBeRemoved, and the edge/rule/action all pruned");
    assert.equal(await page.evaluate(() => window.__kg.state.edges.length), 0);
    assert.equal(await page.evaluate(() => window.__kg.state.rules.length), 0);
    assert.equal(await page.evaluate(() => window.__kg.state.actions.length), 0);

    await page.click("#btn-undo");
    labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label).sort());
    assert.deepEqual(labels, ["Invoice", "Supplier", "ToBeRemoved"], "one Undo restores the full pre-Replace graph");
    assert.equal(await page.evaluate(() => window.__kg.state.edges.length), 1);
  });
});

test("a matched relationship gets its meaning overwritten and its relation label normalized to the imported camelCase name", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "A");
    await addNodeViaDblClick(page, 650, 250, "B");
    await page.evaluate(() => {
      const a = window.__kg.state.nodes.find((n) => n.label === "A");
      const b = window.__kg.state.nodes.find((n) => n.label === "B");
      const edge = window.__kg.actions.createEdge(a.id, b.id, "issued by"); // human-readable, not yet camelCase
      edge.meaning = "OLD";
      window.__kg.markDirty();
    });

    const text = [
      "classes:",
      "  A:",
      "    meaning: null",
      "    aliases: []",
      "    properties: {}",
      "  B:",
      "    meaning: null",
      "    aliases: []",
      "    properties: {}",
      "relationships:",
      "  - name: issuedBy",
      "    from: A",
      "    to: B",
      "    meaning: NEW",
      "rules: {}",
      "actions: {}",
      "",
    ].join("\n");
    await dropYaml(page, text);
    await applyImport(page, "#import-merge");

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1, "matched by (from, to, derived camelCase name) — not duplicated");
    assert.equal(edges[0].relation, "issuedBy");
    assert.equal(edges[0].meaning, "NEW");
  });
});

test("a relationship referencing a class not declared in the file and not on canvas is skipped defensively, without crashing", async () => {
  await withPage(async (page) => {
    const text = [
      "classes:",
      "  A:",
      "    meaning: null",
      "    aliases: []",
      "    properties: {}",
      "relationships:",
      "  - name: relatesTo",
      "    from: A",
      "    to: Ghost",
      "    meaning: null",
      "rules: {}",
      "actions: {}",
      "",
    ].join("\n");
    await dropYaml(page, text);
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes, ["A"]);
    assert.equal(await page.evaluate(() => window.__kg.state.edges.length), 0);
  });
});

test("Replace button is hidden when the current graph is already empty (nothing to remove)", async () => {
  await withPage(async (page) => {
    await dropYaml(page, WORKED_EXAMPLE_YAML);
    const visible = await page.locator("#import-replace").isVisible();
    assert.equal(visible, false);
  });
});

test("Cancel on the import dialog applies nothing", async () => {
  await withPage(async (page) => {
    await dropYaml(page, WORKED_EXAMPLE_YAML);
    await page.click("#import-cancel");
    await page.waitForSelector("#import-overlay", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 0);
    const overlayDisplay = await page.evaluate(() => getComputedStyle(document.getElementById("import-overlay")).display);
    assert.equal(overlayDisplay, "none");
  });
});

test("commit order resolves references regardless of the YAML file's own section order — actions/relationships declared before classes/rules still resolve", async () => {
  await withPage(async (page) => {
    const text = [
      "actions:",
      "  approveInvoice:",
      "    input: Invoice",
      "    preconditions:",
      "      - canApproveInvoice",
      "    effect: approved",
      "    verification: check",
      "relationships:",
      "  - name: issuedBy",
      "    from: Invoice",
      "    to: Supplier",
      "    meaning: null",
      "rules:",
      "  canApproveInvoice:",
      "    conditions:",
      "      - a condition",
      "classes:",
      "  Invoice:",
      "    meaning: null",
      "    aliases: []",
      "    properties: {}",
      "  Supplier:",
      "    meaning: null",
      "    aliases: []",
      "    properties: {}",
      "",
    ].join("\n");
    await dropYaml(page, text);
    await applyImport(page, "#import-merge");

    const { nodes, edges, rules, actions } = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes,
      edges: window.__kg.state.edges,
      rules: window.__kg.state.rules,
      actions: window.__kg.state.actions,
    }));
    assert.equal(nodes.length, 2);
    assert.equal(edges.length, 1, "the relationship resolved even though it appeared before 'classes:' in the file");
    const invoice = nodes.find((n) => n.label === "Invoice");
    assert.equal(actions[0].inputClassId, invoice.id, "the action's input resolved even though it appeared before 'classes:'");
    assert.deepEqual(actions[0].preconditions, [rules[0].id], "the action's precondition resolved even though it appeared before 'rules:'");
  });
});

test("unicode and quoted-scalar class names/meanings survive an export-then-reimport round trip intact", async () => {
  await withPage(async (page) => {
    const yaml = await page.evaluate(() => {
      const n = window.__kg.actions.createNode(100, 100, 'Café: "Müller" #1 日本語');
      n.meaning = "line one\nline two, with a colon: here";
      n.aliases = ["plain", "has: colon"];
      window.__kg.markDirty();
      return window.buildDomainYamlExport();
    });

    await page.evaluate(() => { window.__kg.state.nodes.length = 0; window.__kg.markDirty(); });
    await dropYaml(page, yaml);
    await applyImport(page, "#import-merge");

    const node = await page.evaluate(() => window.__kg.state.nodes[0]);
    assert.equal(node.label, 'Café: "Müller" #1 日本語');
    assert.equal(node.meaning, "line one\nline two, with a colon: here");
    assert.deepEqual(node.aliases, ["plain", "has: colon"]);
  });
});

test("malformed/truncated YAML degrades gracefully — missing sections default to empty, no crash", async () => {
  await withPage(async (page) => {
    await dropYaml(page, "classes:\n  Only:\n    meaning: null\n    aliases: []\n    properties: {}\n", "truncated.domain.yaml");
    await applyImport(page, "#import-merge");

    const nodes = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(nodes, ["Only"]);
    assert.equal(await page.evaluate(() => window.__kg.state.edges.length), 0);
    assert.equal(await page.evaluate(() => window.__kg.state.rules.length), 0);
    assert.equal(await page.evaluate(() => window.__kg.state.actions.length), 0);
  });
});

// Contract change (spec.md §5.6): this used to assert that a garbage file
// opened the normal dialog and that clicking Merge imported all-zero without
// crashing. Not crashing was the right half; offering the action was not —
// the same dialog offered *Replace* too, which on an empty parse stood ready
// to delete the whole graph "to match" a file the app had never understood.
// A file that yields nothing to import now says so and offers no action.
test("a completely empty/garbage file is reported, with no import action offered", async () => {
  await withPage(async (page) => {
    await dropYaml(page, "not yaml at all, just some\nrandom text\n", "garbage.yaml");

    assert.match(await page.locator("#import-summary").textContent(), /nothing to import/i);
    assert.equal(await page.locator("#import-merge").isVisible(), false);
    assert.equal(await page.locator("#import-replace").isVisible(), false);

    await page.click("#import-cancel");
    await page.waitForSelector("#import-overlay", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 0);
    assert.equal(await page.evaluate(() => window.__kg.state.edges.length), 0);
  });
});

test("a .yml extension (not just .yaml) is recognized and routed to the domain-model importer", async () => {
  await withPage(async (page) => {
    await dropYaml(page, WORKED_EXAMPLE_YAML, "graph.yml");
    const summary = await importSummary(page);
    assert.match(summary, /item\(s\) would be added/, "routed to the YAML importer's summary phrasing, not the TXT one");
  });
});

test("the diff-summary counts match what actually happens on commit", async () => {
  await withPage(async (page) => {
    await dropYaml(page, WORKED_EXAMPLE_YAML);
    const summary = await importSummary(page);
    assert.match(summary, /Merge: 5 item\(s\) would be added, 0 existing item\(s\) would be updated/);
    await applyImport(page, "#import-merge");

    // Re-importing the same file again: everything now matches (0 added, 5 changed).
    await dropYaml(page, WORKED_EXAMPLE_YAML);
    const summary2 = await importSummary(page);
    assert.match(summary2, /Merge: 0 item\(s\) would be added, 5 existing item\(s\) would be updated/);
  });
});

// --- Scale (no other agent-ontology test exercises the YAML export/import
// path at anything beyond a handful of entries — this proves the recursive
// serializer/parser (yamlLines()/parseYamlBlock()) doesn't hang, doesn't
// blow the stack on deep-ish nesting, and round-trips correctly at a size
// closer to what a real generated domain model could reach) -------------

test("a large domain model (150 classes, 100 relationships, 50 rules, 50 actions) round-trips through export then re-import correctly and quickly", async () => {
  await withPage(async (page) => {
    const start = Date.now();
    const yaml = await page.evaluate(() => {
      const nodeIds = [];
      for (let i = 0; i < 150; i++) {
        const n = window.__kg.actions.createNode((i % 15) * 200, Math.floor(i / 15) * 150, `Class${i}`);
        n.meaning = `Meaning of Class${i}.`;
        n.aliases = [`alias${i}a`, `alias${i}b`];
        n.properties = [
          { id: `p${i}a`, name: "code", type: "text", unit: null, allowed: null },
          { id: `p${i}b`, name: "amount", type: "number", unit: "EUR", allowed: null },
        ];
        nodeIds.push(n.id);
      }
      for (let i = 0; i < 100; i++) {
        const src = nodeIds[i % nodeIds.length];
        const tgt = nodeIds[(i + 37) % nodeIds.length];
        const edge = window.__kg.actions.createEdge(src, tgt, `relatesTo${i}`);
        edge.meaning = `Relationship ${i}.`;
      }
      const ruleIds = [];
      for (let i = 0; i < 50; i++) {
        const r = window.__kg.actions.createRule(`rule${i}`, [`condition ${i}a`, `condition ${i}b`]);
        ruleIds.push(r.id);
      }
      for (let i = 0; i < 50; i++) {
        window.__kg.actions.createAction(
          `action${i}`, nodeIds[i], [ruleIds[i], ruleIds[(i + 1) % ruleIds.length]],
          `effect ${i}`, `verification ${i}`,
        );
      }
      window.__kg.markDirty();
      return window.buildDomainYamlExport();
    });
    const exportMs = Date.now() - start;
    assert.ok(exportMs < 10000, `export of a 350-entry domain model should be quick, took ${exportMs}ms`);

    // Clear and re-import into a fresh graph — the strongest round-trip
    // check, since a Merge into the *same* graph would trivially "match"
    // everything by construction.
    await page.evaluate(() => {
      window.__kg.state.nodes.length = 0;
      window.__kg.state.edges.length = 0;
      window.__kg.state.rules.length = 0;
      window.__kg.state.actions.length = 0;
      window.__kg.markDirty();
    });

    const importStart = Date.now();
    await dropYaml(page, yaml, "large.domain.yaml");
    await page.click("#import-merge");
    await page.waitForFunction(() => window.__kg.state.nodes.length === 150);
    const importMs = Date.now() - importStart;
    assert.ok(importMs < 15000, `re-import of a 350-entry domain model should be quick, took ${importMs}ms`);

    const { nodes, edges, rules, actions } = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes,
      edges: window.__kg.state.edges,
      rules: window.__kg.state.rules,
      actions: window.__kg.state.actions,
    }));
    assert.equal(nodes.length, 150);
    assert.equal(edges.length, 100);
    assert.equal(rules.length, 50);
    assert.equal(actions.length, 50);

    const class42 = nodes.find((n) => n.label === "Class42");
    assert.equal(class42.meaning, "Meaning of Class42.");
    assert.deepEqual(class42.aliases, ["alias42a", "alias42b"]);
    assert.equal(class42.properties.length, 2);
    assert.ok(class42.properties.some((p) => p.name === "amount" && p.unit === "EUR"));

    const action7 = actions.find((a) => a.name === "action7");
    assert.equal(action7.effect, "effect 7");
    assert.equal(action7.preconditions.length, 2, "both preconditions on a re-imported action resolved to real rule ids");

    const relatesTo23Count = edges.filter((e) => e.relation === "relatesTo23").length;
    assert.equal(relatesTo23Count, 1, "no duplicate/dropped relationships at scale");
  });
});
