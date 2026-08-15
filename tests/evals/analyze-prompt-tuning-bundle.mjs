// OFFLINE ANALYSIS FOR THE prompt-tuning-bundle BATCH — control vs treatment
//
//   node tests/evals/analyze-prompt-tuning-bundle.mjs
//
// No model calls. Same shape as analyze-phase6-constraint-fix.mjs, extended
// to n=5 runs per arm (PROMPT_TUNING_BUNDLE.md §2's deliberate upgrade from
// n=3, given that eval's own confound hunt proved n=3 isn't always enough to
// separate a real effect from this project's demonstrated baseline variance).
// This script only covers the quantitative measures (§3's top table); the
// six qualitative-only ideas are read by hand against §3's per-idea table,
// not scored here.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./lib/recoveryMetrics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONDITION = process.argv[2] || "prompt-tuning-bundle";
const ROOT = path.join(__dirname, "results", "baselines", CONDITION);
const N = Number(process.argv[3]) || 5;
const RUNS = Array.from({ length: N }, (_, i) => `run-${String(i + 1).padStart(2, "0")}`);
const full = loadGroundTruthModel();
const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const spread = (xs) => Math.max(...xs) - Math.min(...xs);
const pct = (x) => (x * 100).toFixed(1);

// Only runs that actually completed (baseline-provenance.json exists) are
// read, so this can be run mid-batch (e.g. after run-01, before committing
// to run-02..05) without erroring on the missing ones.
function availableRuns(arm) {
  return RUNS.filter((r) => fs.existsSync(path.join(ROOT, arm, r, "baseline-provenance.json")));
}

const data = {};
for (const arm of ["control", "treatment"]) {
  data[arm] = availableRuns(arm).map((runId) => {
    const dir = path.join(ROOT, arm, runId);
    const { state } = recoveredStateFromYaml(fs.readFileSync(path.join(dir, "recovered-model.yaml"), "utf8"));
    const prov = JSON.parse(fs.readFileSync(path.join(dir, "baseline-provenance.json"), "utf8"));
    return { runId, prov, full: computeRecoveryMetrics(full, state), practical: computeRecoveryMetrics(scoped, state) };
  });
}

console.log(`control: ${data.control.length}/${N} runs available, treatment: ${data.treatment.length}/${N} runs available`);
if (data.control.length < 2 || data.treatment.length < 2) {
  console.log("Fewer than 2 runs in one arm -- too early for a meaningful comparison. Run more before reading these numbers.");
}

for (const scope of ["full", "practical"]) {
  console.log(`\n=== ${scope === "full" ? "Full domain" : "Practical scope"} — F1 ===`);
  console.log(`dimension        control (${data.control.map((r) => r.runId.slice(-2)).join("/")})        mean    `
    + `treatment (${data.treatment.map((r) => r.runId.slice(-2)).join("/")})      mean     delta`);
  for (const dim of ["classes", "relationships", "properties"]) {
    const c = data.control.map((r) => r[scope][dim].f1);
    const t = data.treatment.map((r) => r[scope][dim].f1);
    if (!c.length || !t.length) continue;
    const d = (mean(t) - mean(c)) * 100;
    console.log(`${dim.padEnd(15)} ${c.map(pct).join(" / ").padEnd(24)} ${pct(mean(c)).padStart(5)}   `
      + `${t.map(pct).join(" / ").padEnd(23)} ${pct(mean(t)).padStart(5)}   ${(d >= 0 ? "+" : "") + d.toFixed(1)}`);
  }
  const cv = data.control.map((r) => r[scope].controlledValueFidelity ?? 0);
  const tv = data.treatment.map((r) => r[scope].controlledValueFidelity ?? 0);
  if (cv.length && tv.length && (cv.some(Boolean) || tv.some(Boolean))) {
    console.log(`${"value fidelity".padEnd(15)} ${cv.map(pct).join(" / ").padEnd(24)} ${pct(mean(cv)).padStart(5)}   `
      + `${tv.map(pct).join(" / ").padEnd(23)} ${pct(mean(tv)).padStart(5)}   ${(((mean(tv) - mean(cv)) * 100) >= 0 ? "+" : "") + ((mean(tv) - mean(cv)) * 100).toFixed(1)}`);
  }
}

console.log("\n=== Allowed-value lists captured (raw count per run, idea #5) ===");
{
  const c = data.control.map((r) => r.prov.allowedValueListCount ?? 0);
  const t = data.treatment.map((r) => r.prov.allowedValueListCount ?? 0);
  if (c.length) console.log(`control    ${c.join(" / ")}   (mean ${mean(c).toFixed(1)})`);
  if (t.length) console.log(`treatment  ${t.join(" / ")}   (mean ${mean(t).toFixed(1)})`);
  console.log("Bar (PROMPT_TUNING_BUNDLE.md §3): must not regress from control -- a modest positive shift is "
    + "the honest expectation for this lighter, isolated edit, not a #96-style multi-fold recovery.");
}

console.log("\n=== Cost and interview behaviour ===");
for (const arm of ["control", "treatment"]) {
  const p = data[arm].map((r) => r.prov);
  if (!p.length) continue;
  console.log(`${arm.padEnd(10)} turns ${p.map((x) => x.turnsUsed).join("/")} (mean ${mean(p.map((x) => x.turnsUsed)).toFixed(0)})  `
    + `applies ${p.map((x) => x.applyToolCalls).join("/")}  get_graph_state ${p.map((x) => x.getGraphStateCalls ?? 0).join("/")}  `
    + `stopped ${[...new Set(p.map((x) => x.stoppedReason))].join(",")}`);
}

const truncated = [];
for (const arm of ["control", "treatment"]) {
  for (const r of data[arm]) {
    if (r.prov.stoppedReason === "wallclock_timeout") truncated.push(`${arm}/${r.runId}`);
  }
}
if (truncated.length) {
  console.log(`\n!! TRUNCATED BY THE CLOCK: ${truncated.join(", ")}`);
  console.log("   Not scored (PROMPT_TUNING_BUNDLE.md §5) -- an interview cut off mid-phase measures the budget,");
  console.log("   not the interviewer. Raise ONTOLOGY_EVAL_WALLCLOCK_MINUTES and re-run those runs.");
}

console.log("\n=== Is any F1 delta larger than the run-to-run spread? ===");
if (data.control.length >= 2 && data.treatment.length >= 2) {
  for (const scope of ["full", "practical"]) {
    for (const dim of ["classes", "relationships", "properties"]) {
      const pick = (r) => r[scope][dim].f1;
      const c = data.control.map(pick);
      const t = data.treatment.map(pick);
      const delta = Math.abs(mean(t) - mean(c)) * 100;
      const widest = Math.max(spread(c), spread(t)) * 100;
      const verdict = delta > widest ? "larger than spread — inspect" : "within spread — not a finding yet";
      console.log(`${scope.padEnd(10)} ${dim.padEnd(15)} |delta| ${delta.toFixed(1)} vs widest spread ${widest.toFixed(1)}  → ${verdict}`);
    }
  }
} else {
  console.log("(need at least 2 runs per arm for a spread comparison)");
}

console.log("\n=== Reminder: six of eight ideas are qualitative-only ===");
console.log("Ideas #1, #2, #3, #7, #8, #10 are not visible to any number above. Read PROMPT_TUNING_BUNDLE.md");
console.log("§3's per-idea table against all available transcripts before drawing any conclusion from this script alone.");

if (truncated.length) process.exitCode = 1;
