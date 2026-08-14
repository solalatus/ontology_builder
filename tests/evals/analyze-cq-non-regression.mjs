// OFFLINE ANALYSIS FOR THE issue #94 BATCH — control vs treatment
//
//   node tests/evals/analyze-cq-non-regression.mjs
//
// No model calls. Scores both arms against the same fixture with the same
// one-to-one scorer and both denominators, and prints the per-run and mean
// figures side by side. The comparison is arm-vs-arm, never against the
// published anchors: those were produced on a different model, which is the
// whole reason a fresh control arm exists (CQ_NON_REGRESSION.md §2).
//
// Deliberately the same shape as analyze-self-correction.mjs, down to the
// output columns — issue #85 already settled how a two-arm within-model
// interviewer comparison is read here, and a second condition inventing its
// own table would make the two incomparable for no gain.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./lib/recoveryMetrics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "results", "baselines", "competency-questions");
const RUNS = ["run-01", "run-02", "run-03"];
const full = loadGroundTruthModel();
const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const spread = (xs) => Math.max(...xs) - Math.min(...xs);
const pct = (x) => (x * 100).toFixed(1);

const data = {};
for (const arm of ["control", "treatment"]) {
  data[arm] = RUNS.map((runId) => {
    const dir = path.join(ROOT, arm, runId);
    const { state } = recoveredStateFromYaml(fs.readFileSync(path.join(dir, "recovered-model.yaml"), "utf8"));
    const prov = JSON.parse(fs.readFileSync(path.join(dir, "baseline-provenance.json"), "utf8"));
    return { runId, prov, full: computeRecoveryMetrics(full, state), practical: computeRecoveryMetrics(scoped, state) };
  });
}

for (const scope of ["full", "practical"]) {
  console.log(`\n=== ${scope === "full" ? "Full domain" : "Practical scope"} — F1 ===`);
  console.log("dimension        control (r1/r2/r3)        mean    treatment (r1/r2/r3)      mean     delta");
  for (const dim of ["classes", "relationships", "properties"]) {
    const c = data.control.map((r) => r[scope][dim].f1);
    const t = data.treatment.map((r) => r[scope][dim].f1);
    const d = (mean(t) - mean(c)) * 100;
    console.log(`${dim.padEnd(15)} ${c.map(pct).join(" / ").padEnd(24)} ${pct(mean(c)).padStart(5)}   `
      + `${t.map(pct).join(" / ").padEnd(23)} ${pct(mean(t)).padStart(5)}   ${(d >= 0 ? "+" : "") + d.toFixed(1)}`);
  }
  const cv = data.control.map((r) => r[scope].controlledValueFidelity ?? 0);
  const tv = data.treatment.map((r) => r[scope].controlledValueFidelity ?? 0);
  if (cv.some(Boolean) || tv.some(Boolean)) {
    console.log(`${"value fidelity".padEnd(15)} ${cv.map(pct).join(" / ").padEnd(24)} ${pct(mean(cv)).padStart(5)}   `
      + `${tv.map(pct).join(" / ").padEnd(23)} ${pct(mean(tv)).padStart(5)}   ${(((mean(tv) - mean(cv)) * 100) >= 0 ? "+" : "") + ((mean(tv) - mean(cv)) * 100).toFixed(1)}`);
  }
}

console.log("\n=== Cost and interview behaviour ===");
for (const arm of ["control", "treatment"]) {
  const p = data[arm].map((r) => r.prov);
  console.log(`${arm.padEnd(10)} turns ${p.map((x) => x.turnsUsed).join("/")} (mean ${mean(p.map((x) => x.turnsUsed)).toFixed(0)})  `
    + `applies ${p.map((x) => x.applyToolCalls).join("/")}  get_graph_state ${p.map((x) => x.getGraphStateCalls ?? 0).join("/")}  `
    + `stopped ${[...new Set(p.map((x) => x.stoppedReason))].join(",")}`);
}

// Competency questions are DESCRIPTION, never a score: the control arm's
// prompt cannot produce them at all, so a difference here is the treatment
// doing its job, not evidence about interview quality (CQ_NON_REGRESSION.md §3).
console.log("\n=== Competency questions recorded (descriptive, not scored) ===");
for (const arm of ["control", "treatment"]) {
  console.log(`${arm.padEnd(10)} ${data[arm].map((r) => r.prov.competencyQuestionsRecorded ?? 0).join(" / ")}`);
}

// Validity gates, printed loudly rather than left for a reader to spot in the
// provenance line. Two things void the comparison outright.
const truncated = [];
for (const arm of ["control", "treatment"]) {
  for (const r of data[arm]) {
    if (r.prov.stoppedReason === "wallclock_timeout") truncated.push(`${arm}/${r.runId}`);
  }
}
if (truncated.length) {
  console.log(`\n!! TRUNCATED BY THE CLOCK: ${truncated.join(", ")}`);
  console.log("   An interview cut off mid-phase measures the budget, not the interviewer, and the");
  console.log("   truncation is not symmetric here — the treatment's Phase 1 front-loads competency");
  console.log("   questions before class modeling, so a binding clock costs the treatment more.");
  console.log("   Raise ONTOLOGY_EVAL_WALLCLOCK_MINUTES and re-run those runs.");
}

// n = 3 per arm, the same limitation the anchor set carries: a difference
// smaller than the within-arm run-to-run spread is not a finding
// (CQ_NON_REGRESSION.md §5, mirroring SELF_CORRECTION_EVAL.md's own rule).
console.log("\n=== Is any delta larger than the run-to-run spread? ===");
for (const scope of ["full", "practical"]) {
  for (const dim of ["classes", "relationships", "properties"]) {
    const c = data.control.map((r) => r[scope][dim].f1);
    const t = data.treatment.map((r) => r[scope][dim].f1);
    const delta = Math.abs(mean(t) - mean(c)) * 100;
    const widest = Math.max(spread(c), spread(t)) * 100;
    const verdict = delta > widest ? "larger than spread — inspect" : "within spread — not a finding at n=3";
    console.log(`${scope.padEnd(10)} ${dim.padEnd(15)} |delta| ${delta.toFixed(1)} vs widest spread ${widest.toFixed(1)}  → ${verdict}`);
  }
}

if (truncated.length) process.exitCode = 1;
