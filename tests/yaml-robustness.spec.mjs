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
// Same-column block sequences (PyYAML's own default `yaml.safe_dump()`
// style: a list's dashes sit at the *same* column as the key that owns
// it, not one column deeper). Both styles are equally valid YAML, but this
// app's own exporter only ever writes the "one deeper" style, so this half
// went untested until the ontology_translation compiler's real LLM-authored
// output (domains/brick-hvac/reference.domain.yaml) turned out to use the
// same-column style throughout and imported as completely empty -- the
// first same-column list silently desynced every enclosing loop above it,
// losing the rest of the document with no error at all.
// --------------------------------------------------------------------------

test("A same-column top-level list (dash aligned with its own key) parses", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "competency_questions:\n- id: cq1\n  text: hello\n- id: cq2\n  text: world\n");
    assert.equal(p.competencyQuestions.length, 2);
    assert.deepEqual(p.competencyQuestions[0], { id: "cq1", text: "hello" });
    assert.deepEqual(p.competencyQuestions[1], { id: "cq2", text: "world" });
  });
});

test("A same-column list of scalars parses", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: x\n    aliases:\n    - bill\n    - receipt\n");
    assert.deepEqual(p.classes.Invoice.aliases, ["bill", "receipt"]);
  });
});

test("A same-column allowed list keeps every entry as a string, never a real boolean (regression: Brick CRAH)", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  CRAH:\n    meaning: x\n    properties:\n      status:\n        type: text\n        allowed:\n        - false\n        - true\n        - alarm\n");
    const allowed = p.classes.CRAH.properties.status.allowed;
    assert.deepEqual(allowed, ["false", "true", "alarm"]);
    assert.ok(allowed.every((v) => typeof v === "string"), "every allowed entry must come back as a string");
  });
});

test("A same-column list correctly closes before the next sibling key at that same column", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "competency_questions:\n- id: cq1\n  text: hello\nclasses:\n  AHU:\n    meaning: x\n");
    assert.equal(p.competencyQuestions.length, 1);
    assert.ok(p.classes.AHU, "classes: after the list must still be reached, not lost");
    assert.equal(p.classes.AHU.meaning, "x");
  });
});

test("Same-column relationships with multi-field list items parse (not confused with a plain-scalar list item)", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  AHU:\n    meaning: x\n  Zone:\n    meaning: y\nrelationships:\n- name: serves\n  from: AHU\n  to: Zone\n  meaning: z\n  aliases: []\n");
    assert.equal(p.relationships.length, 1);
    assert.deepEqual(p.relationships[0], { name: "serves", from: "AHU", to: "Zone", meaning: "z", aliases: [] });
  });
});

test("Same-column sequences nested several levels deep all resolve correctly", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  AHU:\n    meaning: x\n    properties:\n      status:\n        type: text\n        allowed:\n        - off\n        - on\n");
    assert.deepEqual(p.classes.AHU.properties.status.allowed, ["off", "on"]);
  });
});

test("Same-column and one-deeper-indented lists both parse correctly within a single mixed document", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  Fan:\n    meaning: x\n    aliases:\n    - blower\n    - fan\nrelationships:\n  - name: serves\n    from: Fan\n    to: Zone\n    meaning: z\n    aliases: []\n");
    assert.deepEqual(p.classes.Fan.aliases, ["blower", "fan"]);
    assert.equal(p.relationships.length, 1);
    assert.equal(p.relationships[0].name, "serves");
  });
});

// The shape of the real bug: a full, PyYAML-style document (same-column
// dashes throughout -- competency_questions, aliases, allowed, and
// relationships) exercising every section of the target format at once,
// the way `yaml.safe_dump()` (and the compiler's real LLM output) actually
// writes it. Before the fix this parsed to zero classes.
test("A full PyYAML-style document (same-column dashes throughout every section) parses completely", async () => {
  await withPage(async (page) => {
    const doc = [
      "competency_questions:",
      "- id: cq1",
      "  text: Which AHU serves a given zone?",
      "classes:",
      "  AHU:",
      "    meaning: An air handling unit.",
      "    aliases:",
      "    - Air Handler Unit",
      "    properties:",
      "      status:",
      "        type: text",
      "        allowed:",
      "        - off",
      "        - on",
      "  Zone:",
      "    meaning: A controlled area.",
      "relationships:",
      "- name: serves",
      "  from: AHU",
      "  to: Zone",
      "  meaning: The AHU conditions the zone.",
      "  aliases: []",
      "rules:",
      "  needsCooling:",
      "    conditions:",
      "    - zone temperature exceeds cooling setpoint",
      "actions:",
      "  enableCooling:",
      "    input: AHU",
      "    preconditions:",
      "    - needsCooling",
      "    effect: cooling is enabled",
      "    verification: confirm supply air temperature drops",
      "",
    ].join("\n");
    const p = await parse(page, doc);
    assert.equal(Object.keys(p.classes).length, 2, "both classes must be reached");
    assert.equal(p.classes.AHU.meaning, "An air handling unit.");
    assert.deepEqual(p.classes.AHU.aliases, ["Air Handler Unit"]);
    assert.deepEqual(p.classes.AHU.properties.status.allowed, ["off", "on"]);
    assert.equal(p.relationships.length, 1);
    assert.equal(p.relationships[0].name, "serves");
    assert.deepEqual(p.rules.needsCooling.conditions, ["zone temperature exceeds cooling setpoint"]);
    assert.equal(p.actions.enableCooling.input, "AHU");
    assert.deepEqual(p.actions.enableCooling.preconditions, ["needsCooling"]);
    assert.equal(p.competencyQuestions.length, 1);
  });
});

// --------------------------------------------------------------------------
// Plain-scalar line folding: YAML lets an unquoted scalar continue onto
// further, more-indented lines (both a "key: value" pair's value and a
// bare "- value" list item), folding them together the same way an
// explicit ">" block scalar does. The compiler's real LLM-authored output
// wraps long prose fields (meaning/text/effect/conditions/...) exactly
// this way; without support for it, the unconsumed continuation line
// desynced every enclosing loop above it, silently truncating the rest of
// the document (found via the same Brick HVAC file).
// --------------------------------------------------------------------------

test("A wrapped 'key: value' plain scalar folds onto one line", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  AHU:\n    meaning: An assembly consisting of sections containing a fan,\n      filters and coils.\n");
    assert.equal(p.classes.AHU.meaning, "An assembly consisting of sections containing a fan, filters and coils.");
  });
});

test("A wrapped '- value' plain scalar list item folds onto one line", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "rules:\n  protectAgainstFrost:\n    conditions:\n    - frost sensor indicates frost risk on the\n      AHU's coil\n");
    assert.deepEqual(p.rules.protectAgainstFrost.conditions, ["frost sensor indicates frost risk on the AHU's coil"]);
  });
});

test("A wrapped scalar spanning three physical lines folds all of them", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  AHU:\n    meaning: line one,\n      line two,\n      line three\n");
    assert.equal(p.classes.AHU.meaning, "line one, line two, line three");
  });
});

test("A blank line inside a wrapped scalar becomes a real line break, not a space (folds like '>')", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  AHU:\n    meaning: first paragraph\n\n      second paragraph\n");
    assert.equal(p.classes.AHU.meaning, "first paragraph\nsecond paragraph");
  });
});

test("Wrapping does not fire when the next line is a sibling key, not deeper", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: short\n    aliases:\n      - bill\n");
    assert.equal(p.classes.Invoice.meaning, "short");
    assert.deepEqual(p.classes.Invoice.aliases, ["bill"]);
  });
});

test("Wrapping does not swallow a dash list item's own nested fields (regression: multi-field list items)", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "competency_questions:\n- id: cq1\n  text: hello world\n");
    assert.deepEqual(p.competencyQuestions[0], { id: "cq1", text: "hello world" });
  });
});

test("Wrapping never fires on quoted, flow-collection, null or empty values", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      'classes:\n  Invoice:\n    meaning: "quoted"\n    aliases: [a, b]\n    properties: {}\n');
    assert.equal(p.classes.Invoice.meaning, "quoted");
    assert.deepEqual(p.classes.Invoice.aliases, ["a", "b"]);
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

// --------------------------------------------------------------------------
// Flow maps as list items (issue #76) -- a flow map used as a *value*
// (`amount: {type: number}`, covered above) already worked; a flow map used
// as a list item (`- {name: r, from: A, to: B}`, exactly the shape a
// `relationships:` entry invites) did not. parseYamlBlock()'s list branch
// ran splitYamlKeyValue() on the item's raw text before ever checking
// whether it was a flow collection, so `{name: r, from: A, to: B}` split on
// its first colon into a bogus key/value pair (`{"{name": "r, from: A, to:
// B}"}`) instead of reaching parseYamlValueToken(), which already knows how
// to parse flow maps correctly. No error was raised -- relationship.name/
// from/to all came back undefined, and commitYamlImport()'s undeclared-
// endpoint guard silently dropped the entry.
// --------------------------------------------------------------------------

test("A flow map as a list item parses into a real object, not a garbage key (issue #76)", async () => {
  await withPage(async (page) => {
    const p = await parse(page,
      "classes:\n  Invoice:\n    meaning: A bill.\n  Supplier:\n    meaning: Who sends it.\n" +
      "relationships:\n  - {name: issuedBy, from: Invoice, to: Supplier}\n");
    assert.equal(p.relationships.length, 1);
    assert.deepEqual(p.relationships[0], { name: "issuedBy", from: "Invoice", to: "Supplier" });
  });
});

test("A nested flow map inside a flow-map list item parses", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "relationships:\n  - {name: r, from: A, to: B, x: {y: 1}}\n");
    assert.deepEqual(p.relationships[0], { name: "r", from: "A", to: "B", x: { y: "1" } });
  });
});

test("An empty flow map and a flow list as list items still parse as before", async () => {
  await withPage(async (page) => {
    const p1 = await parse(page, "relationships:\n  - {}\n");
    assert.deepEqual(p1.relationships, [{}]);
    const p2 = await parse(page, "relationships:\n  - [a, b]\n");
    assert.deepEqual(p2.relationships, [["a", "b"]]);
  });
});

// Backwards-compatibility pin: the only way a list item could legitimately
// start with a literal `{` is a key that itself begins with `{`, and the
// exporter always quotes such a key (yamlScalar() treats `{` as an
// indicator character) -- so this guard can never fire on this app's own
// output or on a hand-written file that quotes the key the way the format
// requires. Pinned directly rather than left as an argument in prose.
test("A quoted brace-initial key as a list item is unaffected by the flow-map guard", async () => {
  await withPage(async (page) => {
    const p = await parse(page, 'relationships:\n  - "{name": literal\n');
    assert.deepEqual(p.relationships, [{ "{name": "literal" }]);
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

// Pre-existing bug, unrelated to plain-scalar folding: a blank line inside
// an explicit ">" scalar is *itself* what inserts the paragraph break's
// "\n", so the next non-blank line must just append to that -- adding a
// second "\n" of its own doubled it ("first\n\nsecond" instead of
// "first\nsecond"). Untested until plain-scalar folding needed the exact
// same blank-line behavior and exposed it.
test("A blank line inside a folded block scalar becomes exactly one line break", async () => {
  await withPage(async (page) => {
    const p = await parse(page, "classes:\n  Invoice:\n    meaning: >\n      first paragraph\n\n      second paragraph\n");
    assert.equal(p.classes.Invoice.meaning, "first paragraph\nsecond paragraph");
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
