import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL, withPage, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";

// Agent Ontology, Phase F (agent_ontology_todo.md): Domain Model YAML export
// — the load-bearing deliverable the whole initiative exists for
// (agent_ontology_spec.md §1/§5). `buildDomainYamlExport()` is a bare global
// function (classic, non-module <script>), reached directly via
// page.evaluate the same way python-parity.spec.mjs reaches
// window.parseTxtImport — most tests here call it directly rather than
// going through the full Save Version download pipeline, since the
// structure under test is the YAML content, not the download mechanics
// (those are covered by phase5.spec.mjs's own three-download assertions).

async function domainYaml(page) {
  return page.evaluate(() => window.buildDomainYamlExport());
}

// Mirrors phase5.spec.mjs's own local download-handling helpers.
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

test("the exported YAML reproduces the howto's own worked example structure exactly", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      const invoice = window.__kg.actions.createNode(100, 100, "Invoice");
      invoice.meaning = "A request from a supplier to receive payment.";
      invoice.aliases = ["bill"];
      invoice.properties = [
        { id: "p1", name: "invoiceNumber", type: "text", unit: null, allowed: null },
        { id: "p2", name: "amount", type: "number", unit: "EUR", allowed: null },
        { id: "p3", name: "status", type: "text", unit: null, allowed: ["draft", "matched", "disputed", "approved", "paid"] },
        { id: "p4", name: "dueDate", type: "date", unit: null, allowed: null },
      ];
      const supplier = window.__kg.actions.createNode(400, 100, "Supplier");
      window.__kg.actions.createEdge(invoice.id, supplier.id, "issued by");
      const rule = window.__kg.actions.createRule("canApproveInvoice", [
        "invoice status is matched", "supplier risk status is clear",
      ]);
      window.__kg.actions.createAction(
        "approveInvoice", invoice.id, [rule.id],
        "invoice status becomes approved", "confirm the new invoice status",
      );
      window.__kg.markDirty();
    });

    const yaml = await domainYaml(page);
    assert.equal(yaml, [
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
      "      status:",
      "        type: text",
      "        allowed:",
      "          - draft",
      "          - matched",
      "          - disputed",
      "          - approved",
      "          - paid",
      "      dueDate:",
      "        type: date",
      "  Supplier:",
      "    meaning: null",
      "    aliases: []",
      "    properties: {}",
      "relationships:",
      "  - name: issuedBy",
      "    from: Invoice",
      "    to: Supplier",
      "    meaning: null",
      "    aliases: []",
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
    ].join("\n"));
  });
});

// Relationships gained an aliases field (mirroring classes) after a real
// ontology-recovery eval run found the interviewer eliciting real
// relationship synonyms from a domain expert with nowhere to store them —
// see helper_agent_todo.md's dated addendum and index.html's createEdge().
test("a relationship's aliases are included in the export, same shape as a class's", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      const invoice = window.__kg.actions.createNode(100, 100, "Invoice");
      const supplier = window.__kg.actions.createNode(400, 100, "Supplier");
      const edge = window.__kg.actions.createEdge(invoice.id, supplier.id, "issued by");
      edge.aliases = ["billed by", "sent by"];
      window.__kg.markDirty();
    });
    const yaml = await domainYaml(page);
    assert.ok(yaml.includes("- name: issuedBy\n    from: Invoice\n    to: Supplier\n    meaning: null\n    aliases:\n      - billed by\n      - sent by\n"));
  });
});

test("an empty graph exports valid, minimal YAML — no crash, no undefined leaking through", async () => {
  await withPage(async (page) => {
    const yaml = await domainYaml(page);
    assert.equal(yaml, "classes: {}\nrelationships: []\nrules: {}\nactions: {}\n");
  });
});

test("relationships is a list, not a name-keyed map — two edges deriving the same camelCase name both survive intact", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "A");
    await addNodeViaDblClick(page, 650, 250, "B");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "issued by");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "issued  BY"); // different casing/spacing, same derived key
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const yaml = await domainYaml(page);
    const matches = [...yaml.matchAll(/- name: issuedBy\n/g)];
    assert.equal(matches.length, 2, "both edges keep their own list entry — no silent overwrite on a name collision");
    assert.ok(yaml.includes("from: A\n    to: B\n    meaning: null"), "at least one relationship resolves to the right endpoints");
  });
});

// classes/rules/actions ARE name-keyed maps (unlike relationships above) —
// nothing in the UI stops two nodes/rules/actions from sharing a
// label/name, so a plain object-literal map would let the second silently
// overwrite the first's entire entry. assignUniqueExportNames() (index.html)
// disambiguates with a numeric suffix instead, so both survive.
test("two classes sharing a label both survive the export, disambiguated with a numeric suffix", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Invoice");
    await addNodeViaDblClick(page, 650, 250, "Invoice");

    const yaml = await domainYaml(page);
    assert.ok(yaml.includes("Invoice:\n"), "the first Invoice keeps its plain name");
    assert.ok(yaml.includes("Invoice_2:\n"), "the second Invoice gets a disambiguating suffix instead of overwriting the first");
  });
});

test("two rules sharing a name both survive the export, and an action's precondition still resolves to the right one", async () => {
  await withPage(async (page) => {
    const ids = await page.evaluate(() => {
      const ruleA = window.__kg.actions.createRule("sameName", ["condition A"]);
      const ruleB = window.__kg.actions.createRule("sameName", ["condition B"]);
      return { a: ruleA.id, b: ruleB.id };
    });

    const yaml = await domainYaml(page);
    assert.ok(yaml.includes("sameName:\n    conditions:\n      - condition A"), "the first rule keeps its plain name");
    assert.ok(yaml.includes("sameName_2:\n    conditions:\n      - condition B"), "the second rule gets a disambiguating suffix");

    // An action referencing the *second* rule by id must resolve its
    // precondition to the disambiguated name, not the original (colliding) one.
    await page.evaluate((ruleBId) => {
      window.__kg.actions.createAction("useSecondRule", null, [ruleBId], "effect", "verify");
    }, ids.b);
    const yaml2 = await domainYaml(page);
    assert.ok(yaml2.includes("useSecondRule:\n    input: null\n    preconditions:\n      - sameName_2"),
      "the action's precondition must point at the disambiguated rule it actually references");
  });
});

test("two actions sharing a name both survive the export, disambiguated with a numeric suffix", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      window.__kg.actions.createAction("sameAction", null, [], "effect one", "verify one");
      window.__kg.actions.createAction("sameAction", null, [], "effect two", "verify two");
    });

    const yaml = await domainYaml(page);
    assert.ok(yaml.includes("sameAction:\n    input: null\n    preconditions: []\n    effect: effect one"));
    assert.ok(yaml.includes("sameAction_2:\n    input: null\n    preconditions: []\n    effect: effect two"));
  });
});

test("property export includes type always, unit only for number properties that have one, and allowed only when non-empty", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      const n = window.__kg.actions.createNode(100, 100, "Widget");
      n.properties = [
        { id: "p1", name: "plainText", type: "text", unit: null, allowed: null },
        { id: "p2", name: "count", type: "number", unit: null, allowed: null }, // number with NO unit set
        { id: "p3", name: "weight", type: "number", unit: "kg", allowed: null },
        { id: "p4", name: "flag", type: "boolean", unit: null, allowed: [] }, // empty allowed array
        { id: "p5", name: "tier", type: "text", unit: null, allowed: ["gold", "silver"] },
      ];
      window.__kg.markDirty();
    });
    const yaml = await domainYaml(page);
    assert.ok(yaml.includes("plainText:\n        type: text\n"));
    assert.ok(!yaml.includes("count:\n        type: number\n        unit"), "no unit set -> unit key omitted");
    assert.ok(yaml.includes("weight:\n        type: number\n        unit: kg\n"));
    assert.ok(!yaml.includes("flag:\n        type: boolean\n        allowed"), "empty allowed array -> allowed key omitted, not an empty list");
    assert.ok(yaml.includes("tier:\n        type: text\n        allowed:\n          - gold\n          - silver\n"));
  });
});

test("class/edge meaning is included as the literal null when unset, and as the actual text when set", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "A");
    await addNodeViaDblClick(page, 650, 250, "B");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "relates to");
    await page.evaluate(() => {
      window.__kg.actions.setMode("idle");
      window.__kg.state.nodes.find((n) => n.label === "A").meaning = "Meaning of A.";
      window.__kg.state.edges[0].meaning = "Meaning of the edge.";
    });
    const yaml = await domainYaml(page);
    assert.ok(yaml.includes("A:\n    meaning: Meaning of A."));
    assert.ok(yaml.includes("B:\n    meaning: null"));
    assert.ok(yaml.includes("meaning: Meaning of the edge."));
  });
});

test("scalars containing YAML-significant characters (colon, hash, quotes, newline) are double-quoted and escaped; plain-safe scalars are left bare", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      const n = window.__kg.actions.createNode(100, 100, 'Weird: Name "quoted" #tag');
      n.meaning = "line one\nline two";
      n.aliases = ["plain alias", "has: colon"];
      window.__kg.markDirty();
    });
    const yaml = await domainYaml(page);
    assert.ok(yaml.includes('"Weird: Name \\"quoted\\" #tag":'), "the class key itself is quoted/escaped");
    assert.ok(yaml.includes('meaning: "line one\\nline two"'));
    assert.ok(yaml.includes("      - plain alias"), "a plain-safe alias stays unquoted");
    assert.ok(yaml.includes('      - "has: colon"'), "an alias containing a colon+space gets quoted");
  });
});

test("relation-label camelCase derivation handles multi-word, single-word, and punctuation-heavy relations", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 200, 200, "A");
    await addNodeViaDblClick(page, 500, 200, "B");
    await addNodeViaDblClick(page, 800, 200, "C");
    await addNodeViaDblClick(page, 200, 500, "D");
    await createEdgeViaConnectMode(page, 200, 200, 500, 200, "issued by");
    await createEdgeViaConnectMode(page, 500, 200, 800, 200, "mentors");
    await createEdgeViaConnectMode(page, 800, 200, 200, 500, "is-a-kind-of");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const yaml = await domainYaml(page);
    assert.ok(yaml.includes("- name: issuedBy\n"));
    assert.ok(yaml.includes("- name: mentors\n"));
    assert.ok(yaml.includes("- name: isAKindOf\n"));
  });
});

test("camelCase derivation is idempotent — re-deriving from an already-camelCase relation label doesn't flatten it", async () => {
  // Phase G's importer normalizes a matched edge's relation text to the
  // imported camelCase name (see agent_ontology_todo.md's Phase G Log
  // entry). If toCamelCaseId() weren't idempotent, re-exporting after that
  // normalization would derive a *different* name the second time around
  // (e.g. "issuedBy" -> "issuedby", losing the internal capital), breaking
  // a re-import's ability to recognize its own previously-normalized edge.
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 200, 200, "A");
    await addNodeViaDblClick(page, 500, 200, "B");
    await createEdgeViaConnectMode(page, 200, 200, 500, 200, "issuedBy"); // already camelCase, not "issued by"
    await page.evaluate(() => window.__kg.actions.setMode("idle"));

    const yaml = await domainYaml(page);
    assert.ok(yaml.includes("- name: issuedBy\n"), "re-deriving from an already-camelCase label is a no-op, not a further flattening");
  });
});

test("known, accepted limitation: consecutive uppercase letters (e.g. from back-to-back single-letter words) aren't perfectly stable across a second derivation, but settle after that", async () => {
  // toCamelCaseId()'s own comment documents this precisely: a run of 2+
  // uppercase letters has no internal lowercase-then-uppercase boundary for
  // the idempotency fix to find, so re-deriving from an already-camelCase
  // string can lowercase part of a run a from-scratch derivation would have
  // capitalized. This is pinned, not fixed — it never affects a *first*
  // derivation from a human-typed relation label (every real caller), and
  // the result is stable after that one lossy step, so it can't reintroduce
  // the re-import duplicate-edge bug the idempotency fix above targets. If
  // this test starts failing, toCamelCaseId() changed in a way that needs
  // its own comment (and this test) revisited, not silently ignored.
  await withPage(async (page) => {
    const results = await page.evaluate(() => {
      const first = window.toCamelCaseId("is-a-kind-of");
      const second = window.toCamelCaseId(first);
      const third = window.toCamelCaseId(second);
      return { first, second, third };
    });
    assert.equal(results.first, "isAKindOf", "a fresh derivation from hyphenated words capitalizes each word normally");
    assert.equal(results.second, "isAkindOf", "known limitation: re-deriving from that result lowercases part of the consecutive-capital run");
    assert.equal(results.third, results.second, "but it's stable from there — a third derivation doesn't drift any further");
  });
});

test("an action referencing a deleted input class exports input: null rather than a dangling id", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    const box = await page.locator("#canvas").boundingBox();
    await page.evaluate(() => {
      const invoice = window.__kg.state.nodes.find((n) => n.label === "Invoice");
      const rule = window.__kg.actions.createRule("someRule", ["a condition"]);
      window.__kg.actions.createAction("someAction", invoice.id, [rule.id], "effect text", "verify text");
    });
    // Delete the class the same way a real user would — via selection + Delete
    // — so deleteNode()'s own inputClassId-nulling cleanup runs, matching
    // real app behavior rather than hand-simulating a stale reference.
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.keyboard.press("Delete");

    const yaml = await domainYaml(page);
    assert.ok(yaml.includes("someAction:\n    input: null\n"));
  });
});

test("Save Version bundles the domain YAML as a third file, named per the versioned filename convention, alongside JSON/TXT", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await page.click("#btn-save-version");
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 3);
    const yamlDl = downloads.find((d) => d.suggestedFilename().endsWith(".domain.yaml"));
    assert.ok(yamlDl, "expected a .domain.yaml download");
    assert.match(yamlDl.suggestedFilename(), /^Untitled-Graph_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.domain\.yaml$/);

    const yaml = await readDownload(yamlDl);
    assert.ok(yaml.includes("Invoice:"));
  });
});

test("Save Version does not change JSON/TXT content or shape — the YAML export is purely additive", async () => {
  await withDownloadPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 250, 250, "A");
    await addNodeViaDblClick(page, 650, 250, "B");
    await createEdgeViaConnectMode(page, 250, 250, 650, 250, "relates to");
    await page.evaluate(() => window.__kg.actions.setMode("idle"));
    await page.click("#btn-save-version");
    await page.waitForTimeout(200);

    const jsonDl = downloads.find((d) => d.suggestedFilename().endsWith(".json"));
    const parsed = JSON.parse(await readDownload(jsonDl));
    assert.equal(parsed.nodes.length, 2);
    assert.equal(parsed.edges.length, 1);
    assert.ok(!("auto" in parsed.edges[0]), "no stale auto field from the removed Groups feature");

    const txtDl = downloads.find((d) => d.suggestedFilename().endsWith(".txt"));
    const text = await readDownload(txtDl);
    assert.ok(text.includes("A -> B : relates to"));
  });
});
