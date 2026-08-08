import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// Domain Model YAML parser robustness (agent_ontology_spec.md §11).
//
// The parser is hand-rolled — index.html ships with zero runtime dependencies
// (spec.md §2), so there is no js-yaml to lean on. That is a deliberate
// trade, but it means every YAML construct it does *not* handle degrades
// silently rather than erroring: an unrecognized value token falls through to
// the plain-string branch, downstream `Array.isArray`/`typeof === "object"`
// checks see a string, and the field is quietly created empty. Two separate
// live bugs (inline flow lists from a real agent tool call; three-space
// indentation dropping every odd line) reached users that way before anyone
// noticed, which is why the coverage here is deliberately construct-by-
// construct rather than one happy-path round trip.

const parse = (page, yaml) =>
  page.evaluate((y) => window.__kg.formats.parseDomainYamlImport(y), yaml);

// --------------------------------------------------------------------------
// The exporter's own output must always survive its own parser
// --------------------------------------------------------------------------

test("Everything this app exports, it can read back", async () => {
  await withPage(async (page) => {
    const round = await page.evaluate(() => {
      const kg = window.__kg;
      const alpha = kg.actions.createNode(0, 0, "Számla");
      alpha.meaning = "Egy szállítói fizetési kérés.";
      alpha.aliases = ["bill", "invoice"];
      alpha.properties = [
        { id: "p1", name: "összeg", type: "number", unit: "EUR", allowed: null },
        { id: "p2", name: "állapot", type: "text", unit: null, allowed: ["draft", "sent"] },
      ];
      const beta = kg.actions.createNode(300, 0, "Szállító");
      beta.meaning = null;
      const edge = kg.actions.createEdge(alpha.id, beta.id, "kiállította", true);
      edge.meaning = "A számlát benyújtó szállító.";
      edge.aliases = ["from"];
      const rule = kg.actions.createRule("jóváhagyható", ["összeg < 1000", "állapot == sent"]);
      kg.actions.createAction("jóváhagyás", alpha.id, [rule.id], "A számla jóváhagyva.", "Van jóváhagyási bejegyzés.");
      const yaml = kg.formats.buildDomainYamlExport();
      return { yaml, parsed: kg.formats.parseDomainYamlImport(yaml) };
    });

    const p = round.parsed;
    assert.equal(p.classes["Számla"].meaning, "Egy szállítói fizetési kérés.");
    assert.deepEqual(p.classes["Számla"].aliases, ["bill", "invoice"]);
    assert.deepEqual(p.classes["Számla"].properties["összeg"], { type: "number", unit: "EUR" });
    assert.deepEqual(p.classes["Számla"].properties["állapot"].allowed, ["draft", "sent"]);
    assert.equal(p.classes["Szállító"].meaning, null);
    assert.equal(p.relationships.length, 1);
    assert.equal(p.relationships[0].meaning, "A számlát benyújtó szállító.");
    assert.deepEqual(p.rules["jóváhagyható"].conditions, ["összeg < 1000", "állapot == sent"]);
    assert.equal(p.actions["jóváhagyás"].input, "Számla");
    assert.deepEqual(p.actions["jóváhagyás"].preconditions, ["jóváhagyható"]);
  });
});

test("A meaning containing a colon, a hash and a newline round-trips", async () => {
  await withPage(async (page) => {
    const parsed = await page.evaluate(() => {
      const kg = window.__kg;
      const n = kg.actions.createNode(0, 0, "Tricky");
      n.meaning = "key: value # not a comment\nsecond line";
      return kg.formats.parseDomainYamlImport(kg.formats.buildDomainYamlExport());
    });
    assert.equal(parsed.classes.Tricky.meaning, "key: value # not a comment\nsecond line");
  });
});

// --------------------------------------------------------------------------
// Indentation
// --------------------------------------------------------------------------

test("Two-space indentation (the exporter's own) parses", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: two\n");
    assert.equal(p.classes.Invoice.meaning, "two");
  });
});

test("Four-space indentation parses", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n    Invoice:\n        meaning: four\n");
    assert.equal(p.classes.Invoice.meaning, "four");
  });
});

// Odd indentation used to hit a `columns % 2 !== 0 -> continue` guard, so
// every line of a three-space file was dropped on the floor and the import
// reported "0 items" for a perfectly valid document.
test("Three-space indentation parses instead of losing every line", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n   Invoice:\n      meaning: three\n      aliases:\n         - bill\n");
    assert.equal(p.classes.Invoice.meaning, "three");
    assert.deepEqual(p.classes.Invoice.aliases, ["bill"]);
  });
});

test("Tab indentation parses", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n\tInvoice:\n\t\tmeaning: tabbed\n");
    assert.equal(p.classes.Invoice.meaning, "tabbed");
  });
});

test("A list of maps at any indent width keeps its items separate", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "relationships:\n    - name: issuedBy\n      from: Invoice\n      to: Supplier\n    - name: paidBy\n      from: Invoice\n      to: Customer\n");
    assert.equal(p.relationships.length, 2);
    assert.equal(p.relationships[0].name, "issuedBy");
    assert.equal(p.relationships[1].to, "Customer");
  });
});

// --------------------------------------------------------------------------
// Scalars and flow collections
// --------------------------------------------------------------------------

test("Inline flow lists parse (regression: a real agent tool call sent these)", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    aliases: [bill, invoice]\n");
    assert.deepEqual(p.classes.Invoice.aliases, ["bill", "invoice"]);
  });
});

// The other half of the same failure mode: a flow *map* fell through to the
// plain-string branch, so `amount: {type: number}` created a property with
// no type at all, silently.
test("Inline flow maps parse", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    properties:\n      amount: {type: number, unit: EUR}\n");
    assert.deepEqual(p.classes.Invoice.properties.amount, { type: "number", unit: "EUR" });
  });
});

test("A nested flow list inside a flow map parses", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    properties:\n      status: {type: text, allowed: [draft, sent]}\n");
    assert.deepEqual(p.classes.Invoice.properties.status.allowed, ["draft", "sent"]);
  });
});

test("Single-quoted scalars lose their quotes", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: 'it''s a bill'\n    aliases: ['bill', 'inv']\n");
    assert.equal(p.classes.Invoice.meaning, "it's a bill");
    assert.deepEqual(p.classes.Invoice.aliases, ["bill", "inv"]);
  });
});

test("Double-quoted scalars keep their escapes", async () => {
  await withPage(async (page) => {
    const p = await parse(page, 'classes:\n  Invoice:\n    meaning: "line\\none: two"\n');
    assert.equal(p.classes.Invoice.meaning, "line\none: two");
  });
});

test("A tilde is null, like an explicit null", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: ~\n");
    assert.equal(p.classes.Invoice.meaning, null);
  });
});

test("Empty collections stay empty collections, not strings", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    aliases: []\n    properties: {}\n");
    assert.deepEqual(p.classes.Invoice.aliases, []);
    assert.deepEqual(p.classes.Invoice.properties, {});
  });
});

// --------------------------------------------------------------------------
// Comments
// --------------------------------------------------------------------------

test("A trailing comment is stripped", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: a bill   # provisional\n");
    assert.equal(p.classes.Invoice.meaning, "a bill");
  });
});

test("A hash with no leading space is part of the value", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: draft#2\n");
    assert.equal(p.classes.Invoice.meaning, "draft#2");
  });
});

test("A hash inside quotes is part of the value", async () => {
  await withPage(async (page) => {
    const p = await parse(page, 'classes:\n  Invoice:\n    meaning: "tag # one"\n');
    assert.equal(p.classes.Invoice.meaning, "tag # one");
    const q = await parse(page, "classes:\n  Invoice:\n    meaning: 'tag # one'\n");
    assert.equal(q.classes.Invoice.meaning, "tag # one");
  });
});

test("A whole-line comment is ignored wherever it appears", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "# top\nclasses:\n  # about Invoice\n  Invoice:\n    meaning: kept\n");
    assert.equal(p.classes.Invoice.meaning, "kept");
  });
});

// --------------------------------------------------------------------------
// Block scalars
// --------------------------------------------------------------------------

test("A literal block scalar keeps its line breaks", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: |\n      first line\n      second line\n");
    assert.equal(p.classes.Invoice.meaning, "first line\nsecond line");
  });
});

test("A folded block scalar joins its lines", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: >\n      first part\n      second part\n");
    assert.equal(p.classes.Invoice.meaning, "first part second part");
  });
});

test("Chomping indicators are accepted", async () => {
  await withPage(async (page) => {
    for (const header of ["|", "|-", "|+", ">", ">-", ">+"]) {
      const p = await parse(page, `classes:\n  Invoice:\n    meaning: ${header}\n      body text\n`);
      assert.equal(p.classes.Invoice.meaning, "body text", `header ${header}`);
    }
  });
});

test("A block scalar's body is content, not YAML", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  Invoice:\n    meaning: |\n      # not a comment\n      key: not a key\n");
    assert.equal(p.classes.Invoice.meaning, "# not a comment\nkey: not a key");
  });
});

test("A block scalar stops at the next sibling key", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  Invoice:\n    meaning: |\n      the body\n    aliases:\n      - bill\n");
    assert.equal(p.classes.Invoice.meaning, "the body");
    assert.deepEqual(p.classes.Invoice.aliases, ["bill"]);
  });
});

test("A block scalar in a list item parses", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "rules:\n  isOverdue:\n    conditions:\n      - |\n        dueDate < today\n      - simple one\n");
    assert.deepEqual(p.rules.isOverdue.conditions, ["dueDate < today", "simple one"]);
  });
});

// --------------------------------------------------------------------------
// Malformed input must degrade, never throw
// --------------------------------------------------------------------------

test("Malformed documents return an empty model instead of throwing", async () => {
  await withPage(async (page) => {
    for (const bad of ["", "   ", "just a bare string", ": : :", "classes:\n  - not a map\n", "classes:\n"]) {
      const p = await parse(page, bad);
      assert.ok(p && typeof p.classes === "object", `parser must always return a model shape for ${JSON.stringify(bad)}`);
      assert.ok(Array.isArray(p.relationships));
    }
  });
});

test("An unterminated quote doesn't hang or throw", async () => {
  await withPage(async (page) => {
    const p = await parse(page, 'classes:\n  Invoice:\n    meaning: "never closed\n');
    assert.ok(p && typeof p.classes === "object");
  });
});
