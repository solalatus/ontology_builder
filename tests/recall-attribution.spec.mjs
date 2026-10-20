import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import { normalizeDomainYamlDoc } from "./evals/lib/groundTruthModel.mjs";
import {
  attributeSnapshot, parseAppliedYaml, unionOfCommitted, attributionTransitions, normalizeTokens,
} from "./evals/lib/recallAttribution.mjs";
import { attributeRun } from "./evals/attribute-recall.mjs";
import { parseConversationLog } from "./evals/lib/reportGenerator.mjs";

// Issue #182's per-item recall attribution: every gold item a snapshot
// missed gets exactly one reason, decided in a fixed order from what the run
// left on disk. A small synthetic gold model, so each category is hit on
// purpose. Offline, no model calls.

const GOLD = normalizeDomainYamlDoc(yaml.load(`
classes:
  Boiler:
    properties:
      status: { type: text }
      flowRate: { type: number }
  HeatingValve: {}
  Pump: {}
  Chimney: {}
  ExpansionTank: {}
relationships:
  - { name: feeds, from: Boiler, to: HeatingValve }
  - { name: drives, from: Pump, to: ExpansionTank }
`));

const toolCallsMd = (entries) => entries.map(({ turn, yaml: y }) => [
  `### Turn ${turn} — assistant`, "", "**Tool call: `apply_ontology_yaml`**", "", "```", JSON.stringify({ yaml: y }, null, 2), "```", "",
].join("\n")).join("\n");

const conversationMd = (entries) => ["# log", "", ...entries.flatMap(({ turn, speaker, text }) => [`### Turn ${turn} — ${speaker}`, "", text, ""])].join("\n");

const LOG = parseConversationLog(conversationMd([
  { turn: 1, speaker: "persona", text: "We run boilers.\nEach boiler feeds a heating valve, and we track the flow rate of a boiler." },
  { turn: 2, speaker: "app-assistant", text: "Noted. Is there a pump?" },
  { turn: 3, speaker: "persona", text: "Yes, pumps. And an expansion tank sits on the loop." },
  { turn: 9, speaker: "persona", text: "Oh, and a chimney." },
  { turn: 9, speaker: "harness", text: "Chimney chimney chimney (stage text is never read)." },
]));

const APPLIED = parseAppliedYaml(toolCallsMd([
  { turn: 2, yaml: "classes:\n  Boiler:\n    properties:\n      status:\n        type: text\n  HeatingValve: {}\n  Pump: {}\nrelationships:\n  - name: connectsTo\n    from: Boiler\n    to: HeatingValve\n" },
  { turn: 4, yaml: "classes:\n  ExpansionTank: {}\n" },
]));

// The snapshot: ExpansionTank was removed again, the boiler-valve edge has
// the wrong verb, Pump is there under its own name.
const SNAPSHOT = `
classes:
  Boiler:
    properties:
      status: { type: text }
  HeatingValve: {}
  Pump: {}
relationships:
  - { name: connectsTo, from: Boiler, to: HeatingValve }
`;

test("the shared log parser keeps every line of an entry (#189)", () => {
  assert.equal(LOG[0].text, "We run boilers.\nEach boiler feeds a heating valve, and we track the flow rate of a boiler.");
  assert.equal(LOG.length, 5);
});

test("applied YAML is read with its turn, and the union keeps everything ever committed", () => {
  assert.deepEqual(APPLIED.map((a) => a.turn), [2, 4]);
  assert.deepEqual(Object.keys(unionOfCommitted(APPLIED).classes).sort(), ["Boiler", "ExpansionTank", "HeatingValve", "Pump"]);
  assert.deepEqual(Object.keys(unionOfCommitted(APPLIED, 3).classes).sort(), ["Boiler", "HeatingValve", "Pump"], "commits after the snapshot's turn are ignored");
});

test("each missed item gets exactly one category, in the documented order", () => {
  const r = attributeSnapshot({ groundTruth: GOLD, snapshotYaml: SNAPSHOT, turn: 8, log: LOG, applied: APPLIED });
  const cat = (dim, label) => r.items[dim].find((x) => x.label === label).category;
  assert.equal(cat("classes", "Boiler"), "recovered");
  assert.equal(cat("classes", "Expansion Tank"), "removed", "committed at turn 4, gone by the snapshot");
  assert.equal(cat("classes", "Chimney"), "never_mentioned", "named only at turn 9, after the snapshot (and in harness text)");
  assert.equal(cat("relationships", "Boiler feeds HeatingValve"), "mentioned_not_committed", "verb and both endpoints in one message, committed under another verb");
  assert.equal(cat("relationships", "Pump drives ExpansionTank"), "endpoint_class_missing");
  assert.equal(cat("properties", "Boiler.status"), "recovered");
  assert.equal(cat("properties", "Boiler.flowRate"), "mentioned_not_committed");
  for (const dim of ["classes", "relationships", "properties"]) {
    const c = r.counts[dim];
    const sum = ["recovered", "endpoint_class_missing", "other_name", "removed", "mentioned_not_committed", "never_mentioned"].reduce((s, k) => s + c[k], 0);
    assert.equal(sum, c.goldTotal, `${dim}: the categories add up to the gold total`);
  }
  assert.equal(r.counts.classes.scorerMatched, r.counts.classes.recovered, "same matching as the scorer");
});

test("a semantic match comes before removed or mentioned: the item is there under another name", () => {
  const semanticMatches = { fullDomain: { classes: [], relationships: [{ goldId: GOLD.relationships[0].id, recoveredId: "e1" }], properties: [] } };
  const r = attributeSnapshot({ groundTruth: GOLD, snapshotYaml: SNAPSHOT, turn: 8, log: LOG, applied: APPLIED, semanticMatches });
  assert.equal(r.items.relationships.find((x) => x.label === "Boiler feeds HeatingValve").category, "other_name");
  assert.equal(r.semanticAvailable, true);
});

test("transitions between two snapshots list each item's move", () => {
  const a = attributeSnapshot({ groundTruth: GOLD, snapshotYaml: SNAPSHOT, turn: 8, log: LOG, applied: APPLIED });
  const c = attributeSnapshot({ groundTruth: GOLD, snapshotYaml: SNAPSHOT.replace("connectsTo", "feeds"), turn: 8, log: LOG, applied: APPLIED });
  assert.deepEqual(attributionTransitions(a, c).relationships, { "mentioned_not_committed->recovered": 1 });
});

test("normalization is the scorer's: camelCase split, stemmed", () => {
  assert.deepEqual(normalizeTokens("HeatingValves"), normalizeTokens("heating valve"));
});

test("attributeRun reads a paired-stage run directory snapshot by snapshot, at each one's turn", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "attribution-"));
  try {
    fs.writeFileSync(path.join(dir, "conversation-log.md"), conversationMd([{ turn: 1, speaker: "persona", text: "A loan has a borrower." }]));
    fs.writeFileSync(path.join(dir, "tool-calls.md"), toolCallsMd([{ turn: 1, yaml: "classes:\n  Loan: {}\n" }]));
    for (const [label, turn, model] of [["A", 1, "classes:\n  Loan: {}\n"], ["C", 2, "classes:\n  Loan: {}\n  Borrower: {}\n"]]) {
      fs.mkdirSync(path.join(dir, "snapshots", label), { recursive: true });
      fs.writeFileSync(path.join(dir, "snapshots", label, "recovered-model.yaml"), model);
      fs.writeFileSync(path.join(dir, "snapshots", label, "snapshot.json"), JSON.stringify({ label, turn }));
    }
    const r = attributeRun(dir, "fibo-loans");
    assert.deepEqual(Object.keys(r.snapshots), ["A", "C"]);
    assert.equal(r.snapshots.A.turn, 1);
    assert.ok(r.transitionsAtoC.classes["mentioned_not_committed->recovered"] >= 1, "Borrower: named at turn 1, recovered by C");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
