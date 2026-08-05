// RE-SCORES A SAVED RUN OFFLINE, WITH NO MODEL CALLS
//
//   node tests/evals/rescore-saved-run.mjs <run-dir> [...]
//   node tests/evals/rescore-saved-run.mjs results/runs/run-01 results/runs/run-02 results/runs/run-03
//
// Reads a run directory's persisted artifacts -- recovered-model.yaml, and
// semantic-judgments.json when present -- and recomputes every metric with
// the current scorer, on both denominators, under both matching policies.
// Nothing is written; nothing under results/ is touched.
//
// This is what makes a scoring fix applicable to runs that already happened.
// A transcript and a recovered model are facts about a run; the numbers over
// them are a function of the scorer, and when the scorer is corrected the
// honest response is to re-derive the old runs' numbers rather than to
// re-run the interviews (which would be different interviews) or to leave a
// known-defective figure in place. Two defects have already been fixed this
// way: class-level many-to-one matching, then the analogous property-level
// one.
//
// WHAT IS NOT RE-DERIVED: the judge's verdicts. The semantic pass replays the
// stored ones (aggregateSemanticMetrics) and never asks a new question. Those
// verdicts are answers about the specific near-misses this run left, and they
// are as much a part of the run's record as its transcript. Re-judging would
// be a new measurement with its own cost and its own provenance, not a
// re-score -- EXPERIMENT_BRIEF.md §4.5 makes the same point about carrying a
// judge's verdicts across conditions. One consequence is visible and
// intended: if a scoring change leaves a gold item unmatched that the judge
// was never asked about, it stays unmatched, so a replayed semantic figure is
// conservative rather than optimistic.
//
// Re-scoring is metric-idempotent, not byte-identical (EXPERIMENT_BRIEF.md
// §7.6) -- run it twice and the numbers match, though a regenerated report
// would carry a new timestamp.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./lib/recoveryMetrics.mjs";
import { aggregateSemanticMetrics } from "./lib/llmMatcher.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function rescoreRun(runDir) {
  const modelPath = path.join(runDir, "recovered-model.yaml");
  if (!fs.existsSync(modelPath)) throw new Error(`no recovered-model.yaml in ${runDir}`);
  const { state, droppedEdges } = recoveredStateFromYaml(fs.readFileSync(modelPath, "utf8"));

  const full = loadGroundTruthModel();
  const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);

  const judgmentsPath = path.join(runDir, "semantic-judgments.json");
  const saved = fs.existsSync(judgmentsPath) ? JSON.parse(fs.readFileSync(judgmentsPath, "utf8")) : null;

  const out = { runDir, droppedEdges, heuristic: {}, semantic: {} };
  for (const [scopeKey, gold, savedKey] of [["full", full, "fullDomain"], ["practical", scoped, "scoped"]]) {
    out.heuristic[scopeKey] = computeRecoveryMetrics(gold, state);
    const judgments = saved && saved[savedKey] && saved[savedKey].judgments;
    out.semantic[scopeKey] = judgments
      ? aggregateSemanticMetrics({ groundTruth: gold, recoveredState: state, judgments })
      : null;
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runDirs = process.argv.slice(2);
  if (!runDirs.length) {
    console.error("Usage: node tests/evals/rescore-saved-run.mjs <run-dir> [...]");
    console.error("Example: node tests/evals/rescore-saved-run.mjs tests/evals/results/runs/run-01");
    process.exit(1);
  }
  const pct = (x) => (x === null || x === undefined ? "  -- " : `${(x * 100).toFixed(1)}%`);
  console.log("Offline re-score with the current scorer. No model calls; stored judge verdicts replayed as-is.\n");
  console.log("run                policy     scope      class F1  rel F1   prop F1  val.fid  composite");
  for (const dir of runDirs) {
    const abs = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
    const r = rescoreRun(fs.existsSync(abs) ? abs : path.join(__dirname, dir));
    const name = path.basename(r.runDir);
    for (const [policy, block] of [["heuristic", r.heuristic], ["semantic", r.semantic]]) {
      for (const scope of ["full", "practical"]) {
        const m = block[scope];
        if (!m) { console.log(`${name.padEnd(18)} ${policy.padEnd(10)} ${scope.padEnd(10)} (no stored judge verdicts)`); continue; }
        console.log(
          `${name.padEnd(18)} ${policy.padEnd(10)} ${scope.padEnd(10)} ${pct(m.classes.f1).padStart(8)}  ${pct(m.relationships.f1).padStart(6)}  ${pct(m.properties.f1).padStart(7)}  ${pct(m.controlledValueFidelity).padStart(7)}  ${pct(m.recoveryEffectiveness).padStart(9)}`
        );
      }
    }
    if (r.droppedEdges) console.log(`${name.padEnd(18)} edges discarded for naming an undeclared endpoint class: ${r.droppedEdges}`);
  }
}
