// SCORES A COMPARISON-CONDITION BASELINE AND COMPARES IT TO THE INTERACTIVE RUNS
//
//   node tests/evals/score-baseline.mjs <condition> <run-id> [...]
//   node tests/evals/score-baseline.mjs b1-one-shot run-01 run-02 run-03
//
// Fully offline: no model calls. Reads a condition's recovered-model.yaml
// (produced by baseline-one-shot.mjs / baseline-b2-generic-interviewer.eval.spec.mjs /
// baseline-b3-no-commit.eval.spec.mjs, one per <condition>/<run-id>/) and scores
// it with the same deterministic one-to-one scorer, the same fixture, and the
// same two denominators used for the interactive runs, then prints the two
// side by side. Extend this file for a new condition rather than forking it
// (EXPERIMENT_BRIEF.md §6) -- every condition's output already shares the
// same recovered-model.yaml grammar (§5), so nothing about this file is
// condition-specific beyond the directory it reads from.
//
// IMPORTANT -- WHAT IS AND IS NOT COMPARABLE
// ------------------------------------------
// Only the HEURISTIC pass is comparable here. The interactive runs' semantic
// figures come from an LLM judge that was asked about the specific
// near-misses those runs left; a baseline's near-misses are different items,
// so reusing those verdicts would be meaningless and re-judging would
// require new model calls with their own provenance (EXPERIMENT_BRIEF.md
// §4.5). This script therefore compares deterministic scores only, and says
// so in its output. That is the honest comparison: the same fixed rule
// applied to both models.
//
// NOTE on properties: all three dimensions compare F1. Properties used to
// have recall only, because they were matched by a one-sided lookup that
// could credit one recovered property to several gold properties and so
// supported no precision denominator. matchProperties() (recoveryMetrics.mjs)
// now assigns them one-to-one like classes and relationships, which is what
// makes a property precision -- and therefore a like-for-like comparison
// across all three dimensions -- well defined. This matters most here: a
// condition that emits many properties gold never had used to look strong on
// coverage alone.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./lib/recoveryMetrics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.join(__dirname, "results", "runs");
const BASELINES_ROOT = path.join(__dirname, "results", "baselines");

export function recoveredStateFromYaml(text) {
  const doc = yaml.load(text) || {};
  const labelToId = new Map();
  const nodes = Object.entries(doc.classes || {}).map(([label, c], index) => {
    const id = `n${index + 1}`;
    labelToId.set(label, id);
    return {
      id, label, meaning: (c && c.meaning) || "", aliases: (c && c.aliases) || [],
      properties: Object.entries((c && c.properties) || {}).map(([name, p]) => ({
        name, type: p && p.type, allowed: (p && p.allowed) || [],
      })),
    };
  });
  const edges = (doc.relationships || [])
    .map((e, index) => ({
      id: `e${index + 1}`, source: labelToId.get(e.from), target: labelToId.get(e.to),
      relation: e.name, aliases: e.aliases || [], meaning: e.meaning || "",
    }))
    // A one-shot/no-commit model can name an endpoint class it never
    // declared. The interactive agent cannot: the app rejects an edge whose
    // endpoints are not on the canvas. Dropping these keeps the comparison
    // fair rather than crediting a baseline for edges its own model cannot
    // support -- the count of dropped edges is reported so the discard is
    // visible (EXPERIMENT_BRIEF.md §7.2).
    .filter((e) => e.source && e.target);
  const declaredEdges = (doc.relationships || []).length;

  // Rules/actions (issue #133/E17): previously omitted entirely, so a saved
  // run's rules/actions could never be re-scored offline from its own
  // recovered-model.yaml even though buildDomainModel exports both --
  // exactly the tool rescore-saved-run.mjs and this ticket's own retroactive
  // quantification need. Keyed by name in the export the same way gold's
  // own `.domain.yaml` rules/actions are (see groundTruthModel.mjs), so the
  // name doubles as a stable id -- matchRules/matchActions only need `id`
  // to build their assignment map, not a separately-generated one.
  const rules = Object.entries(doc.rules || {}).map(([name, r]) => ({
    id: name, name, conditions: (r && r.conditions) || [],
  }));
  const actions = Object.entries(doc.actions || {}).map(([name, a]) => ({
    id: name, name, inputClassId: a && a.input,
    preconditions: (a && a.preconditions) || [], effect: (a && a.effect) || "", verification: (a && a.verification) || "",
  }));

  return { state: { nodes, edges, rules, actions }, droppedEdges: declaredEdges - edges.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [condition, ...runIds] = process.argv.slice(2);
  if (!condition || !runIds.length) {
    console.error("Usage: node tests/evals/score-baseline.mjs <condition> <run-id> [...]");
    console.error("Example: node tests/evals/score-baseline.mjs b1-one-shot run-01 run-02 run-03");
    process.exit(1);
  }
  const BASE_DIR = path.join(BASELINES_ROOT, condition);

  const full = loadGroundTruthModel();
  const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
  const pct = (x) => `${(x * 100).toFixed(0)}%`;

  const rows = [];
  for (const runId of runIds) {
    const basePath = path.join(BASE_DIR, runId, "recovered-model.yaml");
    if (!fs.existsSync(basePath)) {
      console.error(`${condition}/${runId}: no baseline model found at ${path.relative(process.cwd(), basePath)} -- generate it first`);
      continue;
    }
    const interactivePath = path.join(RUNS_DIR, runId, "recovered-model.yaml");
    if (!fs.existsSync(interactivePath)) {
      console.error(`${runId}: no interactive recovered-model.yaml found at ${path.relative(process.cwd(), interactivePath)} -- not one of the three anchor runs?`);
      continue;
    }
    const { state: baseState, droppedEdges } = recoveredStateFromYaml(fs.readFileSync(basePath, "utf8"));
    const { state: interactiveState } = recoveredStateFromYaml(fs.readFileSync(interactivePath, "utf8"));

    for (const [scopeLabel, gold] of [["full", full], ["practical", scoped]]) {
      const b = computeRecoveryMetrics(gold, baseState);
      const i = computeRecoveryMetrics(gold, interactiveState);
      rows.push({ runId, scopeLabel, b, i, droppedEdges });
    }
  }

  console.log(`Condition: ${condition}. Heuristic pass only (deterministic). Semantic-judge figures are NOT comparable:`);
  console.log("the judge was asked about the interactive runs' specific near-misses, not this condition's.\n");
  console.log("run      scope      dimension      baseline   interactive   delta");
  for (const { runId, scopeLabel, b, i } of rows) {
    for (const [dim, key] of [["class", "classes"], ["relationship", "relationships"], ["property", "properties"]]) {
      const bf = b[key].f1, inf = i[key].f1;
      const delta = (inf - bf) * 100;
      const sign = delta > 0 ? "+" : "";
      console.log(
        `${runId}  ${scopeLabel.padEnd(9)}  ${(dim + " (F1)").padEnd(19)}  ${pct(bf).padStart(7)}   ${pct(inf).padStart(9)}   ${sign}${delta.toFixed(1)} pts`
      );
    }
  }

  const dropped = rows.filter((r) => r.scopeLabel === "full" && r.droppedEdges > 0);
  if (dropped.length) {
    console.log(`\n${condition} edges discarded for naming an undeclared endpoint class:`);
    for (const r of dropped) console.log(`  ${r.runId}: ${r.droppedEdges}`);
  }

  console.log("\nReading: a positive delta means the interactive agent scored higher than this");
  console.log("condition over the same fixture. A delta at or below zero means the factor this");
  console.log("condition varies did not earn its complexity on this fixture.");
}
