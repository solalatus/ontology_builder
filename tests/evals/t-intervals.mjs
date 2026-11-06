// WELCH t-INTERVALS FOR THE ARTICLE'S DIFFERENCES (revision 1, S1)
//
//   node tests/evals/t-intervals.mjs [--write]
//
// Offline, no model calls. Reads the committed per-run values
// (results/run-intervals/results.json; results/epo-heldout/results.json for
// the weak-expert arm; results/v1-same-model/results.json for E1) and gives
// every cell as mean [min–max] and every difference the article reports with
// a 95 % Welch t-interval: domain-stratified for macro differences over the
// four development domains, plain Welch for a single domain. Design:
// results/t-intervals/DESIGN.md. run-intervals/ is read, never written.
// --write saves results.json and REPORT.md in results/t-intervals/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stratifiedWelch, welch, welchDiffOfDiffs, mean } from "./lib/welch.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS = path.resolve(__dirname, "..", "..", "ontology_translation", "results");
const OUT_DIR = path.join(RESULTS, "t-intervals");
const DEV = ["brick-hvac", "iof-maintenance", "iof-supply-chain", "fibo-loans"];
const METRICS = ["composite", "classF1", "relF1", "propF1"];
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(path.join(RESULTS, p), "utf8")); } catch { return null; } };

const cellOf = (values) => ({ n: values.length, mean: mean(values), min: Math.min(...values), max: Math.max(...values), values });

export function loadCells() {
  const ri = readJson("run-intervals/results.json");
  const cells = {};
  for (const [gen, doms] of Object.entries(ri.cells)) {
    cells[gen] = {};
    for (const [d, c] of Object.entries(doms)) { cells[gen][d] = { n: c.n }; for (const m of METRICS) if (c[m]) cells[gen][d][m] = cellOf(c[m].values); }
  }
  const epo = readJson("epo-heldout/results.json");
  if (epo && epo.arms && epo.arms.weak) {
    const w = epo.arms.weak;
    const pick = { composite: (x) => x.full.composite, classF1: (x) => x.full.classes.f1, relF1: (x) => x.full.relationships.f1, propF1: (x) => x.full.properties.f1 };
    cells["epo-weak-expert"] = { "epo-ordering": { n: w.length, ...Object.fromEntries(METRICS.map((m) => [m, cellOf(w.map(pick[m]))])) } };
  }
  const v1 = readJson("v1-same-model/results.json");
  if (v1 && v1.cells) {
    for (const [arm, key] of [["v1-same-model", "v1-same-model"], ["final", "final-n5"]]) {
      if (!v1.cells[arm]) continue;
      cells[key] = {};
      for (const [d, c] of Object.entries(v1.cells[arm])) { cells[key][d] = { n: c.n }; for (const m of METRICS) if (c[m]) cells[key][d][m] = cellOf(c[m].values); }
    }
  }
  if (v1 && v1.epo) {
    cells["epo-v1-same-model"] = { "epo-ordering": { n: v1.epo.cells["v1-same-model"].n } };
    for (const m of METRICS) cells["epo-v1-same-model"]["epo-ordering"][m] = cellOf(v1.epo.cells["v1-same-model"][m].values);
  }
  return cells;
}

export function runAll() {
  const cells = loadCells();
  const out = { method: "Welch t, 95 %, two-sided; macro differences domain-stratified (results/t-intervals/DESIGN.md)", cells, differences: {} };
  const vals = (gen, d, m) => cells[gen][d][m].values;
  const add = (name, a, b, metric, domains) => {
    if (!cells[a] || !cells[b] || !domains.every((d) => cells[a][d] && cells[b][d])) return;
    const iv = domains.length > 1
      ? stratifiedWelch(domains.map((d) => ({ a: vals(a, d, metric), b: vals(b, d, metric) })))
      : welch(vals(a, domains[0], metric), vals(b, domains[0], metric));
    out.differences[name] = { a, b, metric, domains, kind: domains.length > 1 ? "stratified Welch" : "Welch", ...iv, clearOfZero: iv.lo > 0 || iv.hi < 0 };
  };
  // Development macro (stratified).
  add("dev composite: final - aug-sep", "final", "aug-sep", "composite", DEV);
  add("dev relF1: final - aug-sep", "final", "aug-sep", "relF1", DEV);
  add("dev composite: interactive - B2", "baseline-interactive", "baseline-b2", "composite", DEV);
  add("dev composite: interactive - B3", "baseline-interactive", "baseline-b3", "composite", DEV);
  add("dev relF1: interactive - B3", "baseline-interactive", "baseline-b3", "relF1", DEV);
  add("dev composite: B1 - interactive", "baseline-b1", "baseline-interactive", "composite", DEV);
  add("dev relF1: B1 - interactive", "baseline-b1", "baseline-interactive", "relF1", DEV);
  add("dev composite: final - v1 same-model (E1 primary)", "final-n5", "v1-same-model", "composite", DEV);
  add("dev relF1: final - v1 same-model (E1 key secondary)", "final-n5", "v1-same-model", "relF1", DEV);
  add("dev classF1: final - v1 same-model", "final-n5", "v1-same-model", "classF1", DEV);
  add("dev propF1: final - v1 same-model", "final-n5", "v1-same-model", "propF1", DEV);
  // itops (plain Welch).
  add("itops composite: interactive - B3", "baseline-interactive", "baseline-b3", "composite", ["itops"]);
  for (const m of METRICS) {
    add(`itops ${m}: final - first paper`, "final", "first-paper", m, ["itops"]);
    add(`itops ${m}: persona ablation - first paper`, "persona-ablation", "first-paper", m, ["itops"]);
    add(`itops ${m}: final - persona ablation`, "final", "persona-ablation", m, ["itops"]);
    add(`itops ${m}: final - v1 same-model`, "final-n5", "v1-same-model", m, ["itops"]);
    add(`itops ${m}: v1 same-model - first paper`, "v1-same-model", "first-paper", m, ["itops"]);
  }
  // E1 per development domain (descriptive).
  for (const d of DEV) for (const m of ["composite", "relF1"]) add(`${d} ${m}: final - v1 same-model`, "final-n5", "v1-same-model", m, [d]);
  // ePO (plain Welch).
  for (const m of ["composite", "relF1"]) {
    add(`epo ${m}: interactive - B3`, "epo-interactive", "epo-b3", m, ["epo-ordering"]);
    add(`epo ${m}: interactive - weak expert`, "epo-interactive", "epo-weak-expert", m, ["epo-ordering"]);
    add(`epo ${m}: final - v1 same-model`, "epo-interactive", "epo-v1-same-model", m, ["epo-ordering"]);
    if (cells["epo-weak-expert"]) {
      const iv = welchDiffOfDiffs(vals("epo-interactive", "epo-ordering", m), vals("epo-weak-expert", "epo-ordering", m), vals("final", "itops", m), vals("persona-ablation", "itops", m));
      out.differences[`${m}: ePO drop - itops drop`] = { kind: "Welch, difference of differences", metric: m, ...iv, clearOfZero: iv.lo > 0 || iv.hi < 0 };
    }
  }
  // Macro means of the cells (for the tables).
  out.macro = {};
  for (const [gen, doms] of Object.entries(cells)) {
    if (!DEV.every((d) => doms[d])) continue;
    out.macro[gen] = Object.fromEntries(METRICS.filter((m) => DEV.every((d) => doms[d][m])).map((m) => [m, { mean: mean(DEV.map((d) => doms[d][m].mean)) }]));
  }
  return out;
}

const p1 = (x) => (100 * x).toFixed(1);
const sg = (x) => `${x >= 0 ? "+" : ""}${p1(x)}`;
export function renderReport(res) {
  const L = ["# Welch t-intervals: report", "", "Generated by `tests/evals/t-intervals.mjs --write`. Offline. Heuristic policy, full domain. Design: `DESIGN.md`.", "",
    "- Cells: mean [min–max] over the runs, in %.",
    "- Differences: percentage points, 95 % Welch t-interval; macro differences over the four development domains are domain-stratified (domains as fixed strata).",
    "- With 3 runs per arm these intervals are wide; they describe the runs, not a population.",
    "- \"Clear\" in the article only where the interval excludes 0 (last column).", "",
    "## Differences", "", "| Difference | Estimate | 95 % interval | df | Kind | Excludes 0 |", "|---|---|---|---|---|---|"];
  for (const [k, x] of Object.entries(res.differences)) L.push(`| ${k} | ${sg(x.estimate)} | [${sg(x.lo)}, ${sg(x.hi)}] | ${x.df.toFixed(1)} | ${x.kind} | ${x.clearOfZero ? "yes" : "no"} |`);
  L.push("", "## Cells", "", "| Cell | Domain | n | Composite | Class F1 | Rel F1 | Prop F1 |", "|---|---|---|---|---|---|---|");
  const c = (x) => (x ? `${p1(x.mean)} [${p1(x.min)}–${p1(x.max)}]` : "--");
  for (const [gen, doms] of Object.entries(res.cells)) for (const [d, x] of Object.entries(doms)) L.push(`| ${gen} | ${d} | ${x.n} | ${c(x.composite)} | ${c(x.classF1)} | ${c(x.relF1)} | ${c(x.propF1)} |`);
  return L.join("\n") + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = runAll();
  const report = renderReport(res);
  if (process.argv.includes("--write")) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(res, null, 2) + "\n");
    fs.writeFileSync(path.join(OUT_DIR, "REPORT.md"), report);
    console.log(`wrote ${path.relative(process.cwd(), OUT_DIR)}/results.json and REPORT.md`);
  } else process.stdout.write(report);
}
