// RUN-TO-RUN INTERVALS FOR THE ARTICLE TABLES
//
//   node tests/evals/run-intervals.mjs [--write]
//
// Offline, no model calls: reads committed summary.json files and rescores
// the first paper's three runs with the current scorer. Per-domain min-max
// over the 3 runs, and percentile-bootstrap intervals for the 4-published
// macro means and for the differences the article claims. Design:
// ontology_translation/results/run-intervals/DESIGN.md. --write saves
// results.json and REPORT.md there; without it, nothing is written.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rescoreRun } from "./rescore-saved-run.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const RESULTS = path.join(ROOT, "ontology_translation", "results");
const OUT_DIR = path.join(RESULTS, "run-intervals");
const PUBLISHED = ["brick-hvac", "iof-maintenance", "iof-supply-chain", "fibo-loans"];
const METRICS = ["composite", "classF1", "relF1", "propF1"];
const DRAWS = 10000, SEED = 20261104;

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(RESULTS, p), "utf8"));

// Each source returns { domain: [ {composite, classF1, relF1, propF1}, ... 3 runs ] }.
function fromMultiDomain(root) {
  const out = {};
  for (const r of readJson(`${root}/summary.json`).runs_detail) {
    if (r.degraded) continue;
    (out[r.domain] ||= []).push({ composite: r.recoveryEffectivenessFull, classF1: r.classesFullF1, relF1: r.relationshipsFullF1, propF1: r.propertiesFullF1 });
  }
  return out;
}
const rowMetrics = (row) => ({ composite: row.composite, classF1: row.classF1, relF1: row.relF1, propF1: row.propF1 });
function fromFinal() {
  const out = {};
  for (const d of readJson("final-scores/summary.json").domains) out[d.id] = d.runs.filter((r) => r.clean).map((r) => rowMetrics(r.row));
  return out;
}
function fromBaselines(condition) {
  const out = {};
  for (const d of readJson("baselines-gpt6/summary.json").domains) {
    const c = d.conditions[condition];
    if (c && c.runs) out[d.id] = c.runs.filter((r) => r.clean !== false).map((r) => rowMetrics(r.row));
  }
  return out;
}
function fromFirstPaper() {
  const runs = ["run-01", "run-02", "run-03"].map((id) => {
    const m = rescoreRun(path.join(__dirname, "results", "runs", id), "itops").heuristic.full;
    return { composite: m.recoveryEffectiveness, classF1: m.classes.f1, relF1: m.relationships.f1, propF1: m.properties.f1 };
  });
  return { itops: runs };
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const resample = (xs, r) => xs.map(() => xs[Math.floor(r() * xs.length)]);
const pctile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))];

// Bootstrap of a statistic over several cells: f(cellsResampled) -> number.
function bootstrap(cells, f, seed) {
  const r = rng(seed), vals = [];
  for (let i = 0; i < DRAWS; i++) vals.push(f(cells.map((xs) => resample(xs, r))));
  vals.sort((a, b) => a - b);
  return { lo: pctile(vals, 0.025), hi: pctile(vals, 0.975) };
}

export function runAll() {
  const sources = {
    "first-paper": fromFirstPaper(),
    "aug-sep": { ...fromMultiDomain("multi-domain"), ...fromMultiDomain("multi-domain-control") },
    "post-152": { ...fromMultiDomain("multi-domain-post152"), ...fromMultiDomain("multi-domain-control-post152") },
    final: fromFinal(),
    "baseline-interactive": fromBaselines("interactive"),
    "baseline-b1": fromBaselines("b1-one-shot"),
    "baseline-b2": fromBaselines("b2-generic-interviewer"),
    "baseline-b3": fromBaselines("b3-no-commit"),
  };
  const out = { draws: DRAWS, seed: SEED, cells: {}, macro: {}, differences: {} };
  for (const [gen, doms] of Object.entries(sources)) {
    out.cells[gen] = {};
    for (const [domain, runs] of Object.entries(doms)) {
      out.cells[gen][domain] = { n: runs.length };
      for (const m of METRICS) {
        const xs = runs.map((r) => r[m]).filter((x) => typeof x === "number");
        if (xs.length) out.cells[gen][domain][m] = { mean: mean(xs), min: Math.min(...xs), max: Math.max(...xs), values: xs };
      }
    }
    if (PUBLISHED.every((d) => doms[d] && doms[d].length)) {
      out.macro[gen] = {};
      for (const [i, m] of METRICS.entries()) {
        const cells = PUBLISHED.map((d) => doms[d].map((r) => r[m]));
        out.macro[gen][m] = { mean: mean(cells.map(mean)), ...bootstrap(cells, (cs) => mean(cs.map(mean)), SEED + i) };
      }
    }
  }
  // Differences behind the article's claims.
  const diff = (name, a, b, metric, domains, seedOffset) => {
    const ca = domains.map((d) => sources[a][d].map((r) => r[metric]));
    const cb = domains.map((d) => sources[b][d].map((r) => r[metric]));
    const f = (cs) => mean(cs.slice(0, domains.length).map(mean)) - mean(cs.slice(domains.length).map(mean));
    out.differences[name] = { metric, a, b, domains, estimate: f([...ca, ...cb]), ...bootstrap([...ca, ...cb], f, SEED + 100 + seedOffset) };
  };
  let k = 0;
  for (const m of METRICS) diff(`itops ${m}: final - first paper`, "final", "first-paper", m, ["itops"], k++);
  for (const m of METRICS) diff(`published ${m}: final - aug-sep`, "final", "aug-sep", m, PUBLISHED, k++);
  diff("published composite: interactive - B3", "baseline-interactive", "baseline-b3", "composite", PUBLISHED, k++);
  diff("published relF1: interactive - B3", "baseline-interactive", "baseline-b3", "relF1", PUBLISHED, k++);
  diff("published composite: interactive - B2", "baseline-interactive", "baseline-b2", "composite", PUBLISHED, k++);
  diff("itops composite: interactive - B3", "baseline-interactive", "baseline-b3", "composite", ["itops"], k++);
  return out;
}

const f3 = (x) => (typeof x === "number" ? x.toFixed(3) : "--");
export function renderReport(res) {
  const L = ["# Run-to-run intervals: report", "",
    "Generated by `tests/evals/run-intervals.mjs --write`. Offline. Heuristic policy, full domain. Design: `DESIGN.md`.", "",
    "- Per domain: mean [min–max] over 3 runs.",
    `- Macro and differences: mean with a 95 % percentile-bootstrap interval (${res.draws} draws, seed ${res.seed}, runs resampled within each domain).`,
    "- With 3 runs per cell the intervals are descriptive, not inferential.", "",
    "## Per domain", "", "| Generation | Domain | Composite | Class F1 | Rel F1 | Prop F1 |", "|---|---|---|---|---|---|"];
  const cell = (c) => (c ? `${f3(c.mean)} [${f3(c.min)}–${f3(c.max)}]` : "--");
  for (const [gen, doms] of Object.entries(res.cells)) for (const [d, c] of Object.entries(doms)) L.push(`| ${gen} | ${d} | ${cell(c.composite)} | ${cell(c.classF1)} | ${cell(c.relF1)} | ${cell(c.propF1)} |`);
  L.push("", "## Macro over the 4 published domains", "", "| Generation | Composite | Class F1 | Rel F1 | Prop F1 |", "|---|---|---|---|---|");
  const bi = (x) => (x ? `${f3(x.mean)} [${f3(x.lo)}, ${f3(x.hi)}]` : "--");
  for (const [gen, m] of Object.entries(res.macro)) L.push(`| ${gen} | ${bi(m.composite)} | ${bi(m.classF1)} | ${bi(m.relF1)} | ${bi(m.propF1)} |`);
  L.push("", "## Differences behind the article's claims", "", "| Difference | Estimate | 95 % bootstrap |", "|---|---|---|");
  for (const [name, x] of Object.entries(res.differences)) L.push(`| ${name} | ${f3(x.estimate)} | [${f3(x.lo)}, ${f3(x.hi)}] |`);
  return L.join("\n") + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = runAll();
  const report = renderReport(res);
  if (process.argv.includes("--write")) {
    fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(res, null, 2) + "\n");
    fs.writeFileSync(path.join(OUT_DIR, "REPORT.md"), report);
    console.log(`wrote ${path.relative(process.cwd(), OUT_DIR)}/results.json and REPORT.md`);
  } else process.stdout.write(report);
}
