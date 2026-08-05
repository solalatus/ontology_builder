// IS THE DIMENSION ORDERING AN ARTEFACT OF THE MATCHING THRESHOLDS?
//
//   node tests/evals/threshold-sensitivity.mjs run-01 run-02 run-03
//
// The headline observation of this eval is an ordering between dimensions --
// class F1 above relationship F1 -- not any single number's value. That
// ordering is only worth reporting if it survives the two arbitrary constants
// that produced it (MATCH_THRESHOLDS: 0.6 for classes, 0.3 for relationships
// and properties). This sweeps the deterministic pass over a grid around
// both, re-scores every saved run at every combination, and reports whether
// the ordering ever reverses.
//
// Fully offline: the saved recovered models are re-scored, no interview and
// no model call is involved.
//
// ONLY THE DETERMINISTIC PASS CAN BE SWEPT. The semantic pass layers a judge's
// verdicts on top of whatever the deterministic pass left unmatched, and the
// judge was asked about the residuals the *default* thresholds produced. A
// different threshold leaves a different residual set, which those stored
// verdicts do not cover -- and asking again would be a new measurement per
// grid cell, not a sensitivity check on this one. The sweep is therefore
// reported for the heuristic policy alone, which is also the conservative
// direction: the semantic pass only ever adds matches.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics, MATCH_THRESHOLDS } from "./lib/recoveryMetrics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.join(__dirname, "results", "runs");

export const CLASS_GRID = [0.4, 0.5, 0.6, 0.7, 0.8];
export const REL_PROP_GRID = [0.2, 0.3, 0.4, 0.5];

// Every (run, class threshold, relationship/property threshold) cell, with
// the two F1s whose ordering is under test.
export function sweep(states, gold, classGrid = CLASS_GRID, relPropGrid = REL_PROP_GRID) {
  const cells = [];
  for (const { runId, state } of states) {
    for (const classThreshold of classGrid) {
      for (const relPropThreshold of relPropGrid) {
        const m = computeRecoveryMetrics(gold, state, { class: classThreshold, relationshipOrProperty: relPropThreshold });
        cells.push({
          runId, classThreshold, relPropThreshold,
          classF1: m.classes.f1, relationshipF1: m.relationships.f1, propertyF1: m.properties.f1,
        });
      }
    }
  }
  return cells;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const scopeName = (args.find((a) => a.startsWith("--scope=")) || "--scope=full").split("=")[1];
  const runIds = args.filter((a) => !a.startsWith("--"));
  if (!runIds.length) {
    console.error("Usage: node tests/evals/threshold-sensitivity.mjs [--scope=full|practical] <run-id> [...]");
    console.error("Example: node tests/evals/threshold-sensitivity.mjs run-01 run-02 run-03");
    process.exit(1);
  }

  const full = loadGroundTruthModel();
  const gold = scopeName === "full" ? full : scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
  const states = runIds.map((runId) => ({
    runId,
    state: recoveredStateFromYaml(fs.readFileSync(path.join(RUNS_DIR, runId, "recovered-model.yaml"), "utf8")).state,
  }));

  const cells = sweep(states, gold);
  const pct = (x) => `${(x * 100).toFixed(0)}%`;

  console.log(`Scope: ${scopeName}. Heuristic pass only (see this file's header). Default thresholds: class ${MATCH_THRESHOLDS.class}, rel/prop ${MATCH_THRESHOLDS.relationshipOrProperty}.`);
  console.log(`Grid: class ${CLASS_GRID.join(", ")} x rel/prop ${REL_PROP_GRID.join(", ")} over ${runIds.length} run(s) = ${cells.length} combinations.\n`);
  console.log("run       class thr  rel/prop thr   class F1   rel F1   prop F1   class > rel");
  for (const c of cells) {
    const ok = c.classF1 > c.relationshipF1;
    console.log(
      `${c.runId.padEnd(9)} ${String(c.classThreshold).padStart(9)}  ${String(c.relPropThreshold).padStart(12)}   ${pct(c.classF1).padStart(8)}  ${pct(c.relationshipF1).padStart(7)}  ${pct(c.propertyF1).padStart(8)}   ${ok ? "yes" : "NO"}`
    );
  }

  const reversals = cells.filter((c) => c.classF1 <= c.relationshipF1);
  console.log(`\nclass F1 > relationship F1 in ${cells.length - reversals.length}/${cells.length} combinations.`);
  if (reversals.length) {
    console.log("Reversals (the ordering does NOT hold here):");
    for (const c of reversals) console.log(`  ${c.runId} class=${c.classThreshold} rel/prop=${c.relPropThreshold}: ${pct(c.classF1)} vs ${pct(c.relationshipF1)}`);
    process.exitCode = 1;
  } else {
    console.log("No reversal anywhere on the grid: the ordering is not an artefact of one parameter choice.");
  }
}
