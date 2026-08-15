// OFFLINE ANALYSIS FOR THE issue #96 PHASE 6 CONSTRAINT-FIX BATCH — control vs treatment
//
//   node tests/evals/analyze-phase6-constraint-fix.mjs
//
// No model calls. Scores both arms against the same fixture with the same
// one-to-one scorer and both denominators, same shape as
// analyze-cq-non-regression.mjs, plus one more row this batch exists to
// answer: the raw allowed-value-list count per run (PHASE6_CONSTRAINT_FIX.md
// §3 — the decisive measure, not the fidelity percentage, which
// competency-questions/REPORT.md found too unstable to score at n=3).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./lib/recoveryMetrics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONDITION = process.argv[2] || "phase6-constraint-fix";
const ROOT = path.join(__dirname, "results", "baselines", CONDITION);
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

// The decisive measure (PHASE6_CONSTRAINT_FIX.md §3/§5): a raw per-run count,
// not a scored percentage — REPORT.md found the fidelity percentage too
// unstable at n=3 (averaged over as few as one matched property), but the
// coverage gap under it (1/9/11 vs 17/37/26) was the real, consistent finding.
console.log("\n=== Allowed-value lists captured (raw count per run) ===");
{
  const c = data.control.map((r) => r.prov.allowedValueListCount ?? 0);
  const t = data.treatment.map((r) => r.prov.allowedValueListCount ?? 0);
  console.log(`control    ${c.join(" / ")}   (mean ${mean(c).toFixed(1)})`);
  console.log(`treatment  ${t.join(" / ")}   (mean ${mean(t).toFixed(1)})`);
  console.log("Reference: CQ_NON_REGRESSION.md's own control/treatment for this same shipped prompt "
    + "were 17/37/26 vs 1/9/11 — this batch's control is expected to land near that treatment figure "
    + "(same unfixed prompt), and the fix succeeds only if this batch's treatment recovers materially "
    + "toward that control figure, consistently across all three runs, not as a one-off.");
}

console.log("\n=== Cost and interview behaviour ===");
for (const arm of ["control", "treatment"]) {
  const p = data[arm].map((r) => r.prov);
  console.log(`${arm.padEnd(10)} turns ${p.map((x) => x.turnsUsed).join("/")} (mean ${mean(p.map((x) => x.turnsUsed)).toFixed(0)})  `
    + `applies ${p.map((x) => x.applyToolCalls).join("/")}  get_graph_state ${p.map((x) => x.getGraphStateCalls ?? 0).join("/")}  `
    + `stopped ${[...new Set(p.map((x) => x.stoppedReason))].join(",")}`);
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
  console.log("   An interview cut off mid-phase measures the budget, not the interviewer. Raise");
  console.log("   ONTOLOGY_EVAL_WALLCLOCK_MINUTES and re-run those runs (PHASE6_CONSTRAINT_FIX.md §5).");
}

// n = 3 per arm — same limitation the anchor set and CQ_NON_REGRESSION.md
// carry, for the F1 dimensions only. The allowed-value-list count is read as
// a raw number above, not run through this spread test (§5's stated reason).
console.log("\n=== Is any F1 delta larger than the run-to-run spread? ===");
for (const scope of ["full", "practical"]) {
  for (const dim of ["classes", "relationships", "properties"]) {
    const pick = (r) => r[scope][dim].f1;
    const c = data.control.map(pick);
    const t = data.treatment.map(pick);
    const delta = Math.abs(mean(t) - mean(c)) * 100;
    const widest = Math.max(spread(c), spread(t)) * 100;
    const verdict = delta > widest ? "larger than spread — inspect" : "within spread — not a finding at n=3";
    console.log(`${scope.padEnd(10)} ${dim.padEnd(15)} |delta| ${delta.toFixed(1)} vs widest spread ${widest.toFixed(1)}  → ${verdict}`);
  }
}

if (truncated.length) process.exitCode = 1;
