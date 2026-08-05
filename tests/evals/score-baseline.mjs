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
// NOTE on properties: computeRecoveryMetrics()'s `properties` dimension has
// only `recall` (no `f1`/`precision` -- properties are matched by a one-sided
// lookup against each matched class's recovered fields, with no equivalent
// "does every recovered property correspond to a real gold property"
// precision computation anywhere in this codebase). The class/relationship
// rows below compare F1; the property row compares recall -- this is not an
// oversight, it's the only number that dimension actually has.
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
  return { state: { nodes, edges }, droppedEdges: declaredEdges - edges.length };
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
    for (const [dim, key, metric] of [["class", "classes", "f1"], ["relationship", "relationships", "f1"], ["property", "properties", "recall"]]) {
      const bf = b[key][metric], inf = i[key][metric];
      const delta = (inf - bf) * 100;
      const sign = delta > 0 ? "+" : "";
      console.log(
        `${runId}  ${scopeLabel.padEnd(9)}  ${(dim + (metric === "recall" ? " (recall)" : " (F1)")).padEnd(19)}  ${pct(bf).padStart(7)}   ${pct(inf).padStart(9)}   ${sign}${delta.toFixed(0)} pts`
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
