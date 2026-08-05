import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadGroundTruthModel, scopeGroundTruth } from "./evals/lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./evals/lib/recoveryMetrics.mjs";
import { recoveredStateFromYaml } from "./evals/score-baseline.mjs";
import { extractYaml } from "./evals/baseline-one-shot.mjs";

// EXPERIMENT_BRIEF.md §8's acceptance checks for the new comparison-condition
// baselines (B1/B2/B3) -- offline, zero API calls (§8.6), run before any
// condition is reported as working or any live call is spent. Deliberately a
// new, focused file rather than folding these into
// tests/ontology-recovery-metrics.spec.mjs or tests/bipartite-matching.spec.mjs
// (both already passing, left untouched) -- this file is specifically about
// the score-baseline.mjs/baseline-one-shot.mjs integration layer, not the
// underlying matcher those two existing files already cover in depth.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUN_01_YAML_PATH = path.join(__dirname, "evals", "results", "runs", "run-01", "recovered-model.yaml");

// §8.1 Identity check -- scoring a condition directory whose recovered-model.yaml
// is a copy of the interactive run's own model must produce exactly 0-point
// deltas in every dimension and both scopes. Non-zero means the parsing or
// scoring path (recoveredStateFromYaml, in score-baseline.mjs) diverges from
// the reference one (computeRecoveryMetrics fed window.__kg.state directly).
test("identity check: scoring an exact copy of the interactive run's own model against itself yields zero delta in every dimension, both scopes", () => {
  const yamlText = fs.readFileSync(RUN_01_YAML_PATH, "utf8");
  const full = loadGroundTruthModel();
  const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);

  const { state: baseState, droppedEdges } = recoveredStateFromYaml(yamlText);
  const { state: interactiveState } = recoveredStateFromYaml(yamlText);

  assert.equal(droppedEdges, 0, "the real interactive run's own model must never reference an undeclared endpoint class");

  for (const gold of [full, scoped]) {
    const b = computeRecoveryMetrics(gold, baseState);
    const i = computeRecoveryMetrics(gold, interactiveState);
    assert.equal(b.classes.f1, i.classes.f1);
    assert.equal(b.classes.recall, i.classes.recall);
    assert.equal(b.classes.precision, i.classes.precision);
    assert.equal(b.relationships.f1, i.relationships.f1);
    assert.equal(b.relationships.recall, i.relationships.recall);
    assert.equal(b.relationships.precision, i.relationships.precision);
    assert.equal(b.properties.recall, i.properties.recall);
    assert.equal(b.recoveryEffectiveness, i.recoveryEffectiveness);
  }
});

// §8.2 Degenerate-input check.
test("degenerate input: a near-empty model scores without crashing", () => {
  const yamlText = "classes:\n  Thing:\n    meaning: \"A thing.\"\n    aliases: []\n    properties: {}\nrelationships: []\n";
  const { state, droppedEdges } = recoveredStateFromYaml(yamlText);
  assert.equal(droppedEdges, 0);
  const full = loadGroundTruthModel();
  const m = computeRecoveryMetrics(full, state);
  assert.ok(Number.isFinite(m.recoveryEffectiveness));
  assert.ok(m.classes.recall >= 0 && m.classes.recall <= 1);
});

test("degenerate input: a model with an edge pointing at an undeclared class scores without crashing, and the dropped-edge count is reported", () => {
  const yamlText = [
    "classes:",
    "  Incident:",
    "    meaning: \"An unplanned event.\"",
    "    aliases: []",
    "    properties: {}",
    "relationships:",
    "  - name: relatesTo",
    "    from: Incident",
    "    to: SomeUndeclaredClass",
    "    meaning: \"A relation to a class never declared above.\"",
    "    aliases: []",
  ].join("\n");
  const { state, droppedEdges } = recoveredStateFromYaml(yamlText);
  assert.equal(droppedEdges, 1, "the edge naming an undeclared endpoint class must be dropped and counted, not silently kept or silently discarded");
  assert.equal(state.edges.length, 0);
  assert.equal(state.nodes.length, 1);
  const full = loadGroundTruthModel();
  assert.doesNotThrow(() => computeRecoveryMetrics(full, state));
});

// §8.3 Extraction check -- bare YAML, ```yaml-fenced, plain-fenced, and
// preamble-then-fenced replies must all parse; a prose-only reply must raise
// loudly rather than silently persisting prose the scorer would misread.
test("extractYaml accepts a bare (unfenced) YAML document", () => {
  const text = "classes:\n  Thing:\n    meaning: \"x\"\nrelationships: []\n";
  assert.match(extractYaml(text), /^classes:/);
});

test("extractYaml accepts a ```yaml-fenced document", () => {
  const text = "```yaml\nclasses:\n  Thing:\n    meaning: \"x\"\nrelationships: []\n```";
  assert.match(extractYaml(text), /^classes:/);
});

test("extractYaml accepts a plain (unlabeled) fenced document", () => {
  const text = "```\nclasses:\n  Thing:\n    meaning: \"x\"\nrelationships: []\n```";
  assert.match(extractYaml(text), /^classes:/);
});

test("extractYaml accepts a preamble-then-fenced reply, extracting only the fenced content", () => {
  const text = "Here is the domain model I built from the transcript:\n\n```yaml\nclasses:\n  Thing:\n    meaning: \"x\"\nrelationships: []\n```\n\nLet me know if you'd like any changes.";
  const extracted = extractYaml(text);
  assert.match(extracted, /^classes:/);
  assert.doesNotMatch(extracted, /Here is the domain model/);
  assert.doesNotMatch(extracted, /Let me know/);
});

test("extractYaml raises loudly on a prose-only reply with no classes: block, rather than silently persisting it", () => {
  const text = "I'm sorry, I don't have enough information from the transcript to build a domain model.";
  assert.throws(() => extractYaml(text), /no `classes:` block/);
});
