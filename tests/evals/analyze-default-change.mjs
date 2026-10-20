// ISSUE #187: THE DEFAULT-CHANGE MEASUREMENT, from saved runs only
//
//   node tests/evals/analyze-default-change.mjs [--write]
//
// Treatment: ontology_translation/results/default-change-187/treatment/ -- the
// shipped app after #187/#188 (naming question asked at confirmation time,
// rename tool, the #188 stopping rule, default effort `high`), snapshot A at
// the interviewer's own wrap-up. Control: #182's block 1 snapshot A (the
// previous prompt at explicit `medium`, same model, persona and scorer).
// Context, not control: #182's block 1 snapshot C (the old prompt plus the
// separate naming pass) and block 2 snapshot A (the old prompt at `high`).
// Evaluates the pass criteria pre-registered in that directory's DESIGN.md;
// --write saves REPORT.md and summary.json beside it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { snapshotRow, mean, stdev } from "./analyze-paired-stages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS = path.resolve(__dirname, "..", "..", "ontology_translation", "results");
export const DOMAINS = ["fibo-loans", "brick-hvac"];

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };

/** Every run's snapshot-`label` row under `dir/run-NN/<domain>/`. */
export function loadArm(dir, label) {
  const rows = [];
  if (!fs.existsSync(dir)) return rows;
  for (const runId of fs.readdirSync(dir).filter((d) => /^run-\d+$/.test(d)).sort()) {
    for (const domain of DOMAINS) {
      const runDir = path.join(dir, runId, domain);
      const prov = readJson(path.join(runDir, "provenance.json"));
      const m = readJson(path.join(runDir, "snapshots", label, "metrics.json"));
      if (!prov) continue;
      rows.push({
        runId, domain, prov,
        clean: prov.status === "complete" && prov.stoppedReason === "stages_complete" && Boolean(m),
        row: m ? snapshotRow(m) : null, turn: m ? m.turn : null,
      });
    }
  }
  return rows;
}

const stat = (rows, domain, key) => {
  const xs = rows.filter((r) => r.clean && r.domain === domain).map((r) => r.row[key]).filter((x) => typeof x === "number");
  return { mean: mean(xs), sd: stdev(xs), n: xs.length };
};

/** The pre-registered criteria (DESIGN.md), evaluated. */
export function evaluate(treatment, control) {
  const out = {};
  const allClean = treatment.length > 0 && treatment.every((r) => r.clean);
  const perDomain = (fn) => DOMAINS.map((d) => ({ d, ...fn(d) }));
  const fmt = (x) => (x === null || x === undefined ? "n/a" : (x >= 0 ? "+" : "") + x.toFixed(3));

  const nonReg = perDomain((d) => {
    const t = stat(treatment, d, "composite"), c = stat(control, d, "composite");
    const ts = stat(treatment, d, "scopedComposite"), cs = stat(control, d, "scopedComposite");
    return { ok: t.mean !== null && c.mean !== null && t.mean >= c.mean - (c.sd || 0) && ts.mean >= cs.mean - (cs.sd || 0),
      text: `${d}: composite ${t.mean?.toFixed(3)} vs control ${c.mean?.toFixed(3)} ± ${c.sd?.toFixed(3)}; practical ${ts.mean?.toFixed(3)} vs ${cs.mean?.toFixed(3)} ± ${cs.sd?.toFixed(3)}` };
  });
  out["1. non-regression (composite and practical scope not below control mean − sd, both domains)"] = { met: nonReg.every((x) => x.ok), detail: nonReg.map((x) => x.text).join("; ") };

  const naming = perDomain((d) => {
    const dr = stat(treatment, d, "relF1").mean - stat(control, d, "relF1").mean;
    const dp = stat(treatment, d, "propF1").mean - stat(control, d, "propF1").mean;
    const sr = stat(control, d, "relF1").sd, sp = stat(control, d, "propF1").sd;
    const dprec = stat(treatment, d, "relPrecision").mean - stat(control, d, "relPrecision").mean;
    return { ok: ((sr !== null && dr > sr) || (sp !== null && dp > sp)) && dprec >= 0,
      text: `${d}: rel F1 ${fmt(dr)} vs control sd ${sr?.toFixed(3)}, prop F1 ${fmt(dp)} vs sd ${sp?.toFixed(3)}, rel precision ${fmt(dprec)}` };
  });
  out["2. naming carried into the prompt (#180's criterion, against control A, both domains)"] = { met: naming.every((x) => x.ok), detail: naming.map((x) => x.text).join("; ") };

  const cut = treatment.filter((r) => r.prov.stoppedReason === "interview_ended_incomplete");
  out["3. no interview cut short (#188)"] = { met: allClean && cut.length === 0,
    detail: `${treatment.filter((r) => r.clean).length}/${treatment.length} runs ended stages_complete at a genuine wrap-up; ${cut.length} ended interview_ended_incomplete` };

  const effort = [...new Set(treatment.map((r) => r.prov.reasoningEffort))];
  out["4. the default effort that ran is high, every run inside the caps"] = { met: allClean && effort.length === 1 && effort[0] === "high",
    detail: `effort recorded: ${effort.join(", ")}; stopped: ${[...new Set(treatment.map((r) => r.prov.stoppedReason))].join(", ")}` };
  return out;
}

export function renderReport({ treatment, control, contextC, contextHighA }) {
  const keys = [["composite", "Composite"], ["scopedComposite", "Composite, practical scope"], ["semanticComposite", "Composite, semantic"],
    ["classRecall", "Class recall"], ["classPrecision", "Class precision"], ["relRecall", "Relationship recall"], ["relPrecision", "Relationship precision"],
    ["relF1", "Relationship F1"], ["propRecall", "Property recall"], ["propPrecision", "Property precision"], ["propF1", "Property F1"],
    ["rulesF1", "Rules F1"], ["actionsF1", "Actions F1"], ["allowedValueLists", "Allowed-value lists"]];
  const cell = (rows, d, k) => { const s = stat(rows, d, k); return s.mean === null ? "—" : `${s.mean.toFixed(3)}${s.sd === null ? "" : ` ± ${s.sd.toFixed(3)}`}`; };
  const lines = ["# Default change #187: results", "",
    "Generated by `tests/evals/analyze-default-change.mjs`; design and criteria in `DESIGN.md`. Mean ± sample stdev over clean runs; heuristic, full domain, unless marked.", ""];
  lines.push("## Runs", "", "| Domain | Run | Stopped | Turn of A | Effort | Wall clock | Cost USD | Cached share |", "|---|---|---|---|---|---|---|---|");
  for (const r of treatment) {
    lines.push(`| ${r.domain} | ${r.runId} | ${r.prov.stoppedReason}${r.clean ? "" : " (excluded)"} | ${r.turn ?? "—"} | ${r.prov.reasoningEffort} | ${Math.round((r.prov.wallClockSec || 0) / 60)} min | ${typeof r.prov.totalCostUsd === "number" ? r.prov.totalCostUsd.toFixed(2) : "—"} | ${typeof r.prov.cachedShare === "number" ? r.prov.cachedShare.toFixed(3) : "—"} |`);
  }
  lines.push("");
  for (const d of DOMAINS) {
    lines.push(`## ${d}`, "", "| Measure | Treatment (new prompt, high) | Control: #182 block 1 A (old prompt, medium) | Context: block 1 C (old prompt + naming stage, medium) | Context: block 2 A (old prompt, high) |", "|---|---|---|---|---|");
    for (const [k, name] of keys) lines.push(`| ${name} | ${cell(treatment, d, k)} | ${cell(control, d, k)} | ${cell(contextC, d, k)} | ${cell(contextHighA, d, k)} |`);
    lines.push("");
  }
  lines.push("## Pre-registered criteria", "");
  for (const [name, r] of Object.entries(evaluate(treatment, control))) lines.push(`- **${name}: ${r.met ? "met" : "not met"}.** ${r.detail}`);
  lines.push("");
  return lines.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arms = {
    treatment: loadArm(path.join(RESULTS, "default-change-187", "treatment"), "A"),
    control: loadArm(path.join(RESULTS, "paired-stages", "block-1-medium"), "A"),
    contextC: loadArm(path.join(RESULTS, "paired-stages", "block-1-medium"), "C"),
    contextHighA: loadArm(path.join(RESULTS, "paired-stages", "block-2-high"), "A"),
  };
  const report = renderReport(arms);
  console.log(report);
  if (process.argv.includes("--write")) {
    const dir = path.join(RESULTS, "default-change-187");
    fs.writeFileSync(path.join(dir, "REPORT.md"), `${report}\n`);
    fs.writeFileSync(path.join(dir, "summary.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), criteria: evaluate(arms.treatment, arms.control) }, null, 2)}\n`);
  }
}
