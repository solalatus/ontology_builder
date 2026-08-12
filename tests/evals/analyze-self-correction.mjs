// OFFLINE ANALYSIS FOR THE issue #85 BATCH — control vs treatment
//
//   node tests/evals/analyze-self-correction.mjs
//
// No model calls. Scores both arms against the same fixture with the same
// one-to-one scorer and both denominators, and prints the per-run and mean
// figures side by side. The comparison is arm-vs-arm, never against the
// published anchors: those were produced on a different model, which is the
// whole reason a fresh control arm exists (SELF_CORRECTION_EVAL.md §2).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./lib/recoveryMetrics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "results", "baselines", "self-correcting-interviewer");
const RUNS = ["run-01", "run-02", "run-03"];
const full = loadGroundTruthModel();
const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
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

console.log("\n=== Cost and loop behaviour ===");
for (const arm of ["control", "treatment"]) {
  const p = data[arm].map((r) => r.prov);
  console.log(`${arm.padEnd(10)} turns ${p.map((x) => x.turnsUsed).join("/")} (mean ${mean(p.map((x) => x.turnsUsed)).toFixed(0)})  `
    + `applies ${p.map((x) => x.applyToolCalls).join("/")}  multi-apply turns ${p.map((x) => x.turnsWithMoreThanOneApply).join("/")}  `
    + `stopped ${[...new Set(p.map((x) => x.stoppedReason))].join(",")}`);
}
