// ENDPOINT-CONDITIONED RELATIONSHIP RECOVERY, PER DOMAIN AND GENERATION
//
//   node tests/evals/endpoint-conditioned-by-domain.mjs [--write]
//
// Offline, no model calls; stored judge verdicts replayed as-is. Applies the
// measure of cross-run-analyses.mjs (the first paper's itops-only analysis) to
// every domain's own gold and to every generation's saved runs. Design and
// reading rules: ontology_translation/results/endpoint-conditioned/DESIGN.md.
// --write saves results.json and REPORT.md next to that design note; without
// it, nothing is written.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth, resolveDomainYamlPath } from "./lib/groundTruthModel.mjs";
import { recoveredGoldIds } from "./cross-run-analyses.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const RESULTS = path.join(ROOT, "ontology_translation", "results");
const OUT_DIR = path.join(RESULTS, "endpoint-conditioned");
const PUBLISHED = ["brick-hvac", "iof-maintenance", "iof-supply-chain", "fibo-loans"];
const RUNS = ["run-01", "run-02", "run-03"];

// Generation -> domain -> the three run directories (DESIGN.md, "Cells").
const at = (root) => (domain) => RUNS.map((r) => path.join(RESULTS, root, r, domain));
const CELLS = [
  // The first paper's runs are scored against their own fixture (itops_mtsr.yaml): the same
  // 68 / 108 / 111 gold as the converted itops domain, and the ids its stored judge verdicts use.
  { generation: "first-paper", gold: "itops-mtsr", domains: { itops: RUNS.map((r) => path.join(__dirname, "results", "runs", r)) } },
  { generation: "aug-sep", domains: Object.fromEntries([...PUBLISHED.map((d) => [d, at("multi-domain")(d)]), ["itops", at("multi-domain-control")("itops")]]) },
  { generation: "post-152", domains: Object.fromEntries([...PUBLISHED.map((d) => [d, at("multi-domain-post152")(d)]), ["itops", at("multi-domain-control-post152")("itops")]]) },
  {
    generation: "final",
    domains: {
      "fibo-loans": at("default-change-187/treatment")("fibo-loans"),
      "brick-hvac": at("default-change-187/treatment")("brick-hvac"),
      "iof-maintenance": at("final-scores/runs")("iof-maintenance"),
      "iof-supply-chain": at("final-scores/runs")("iof-supply-chain"),
      itops: at("final-scores/runs")("itops"),
    },
  },
  // B3 keeps its scored (post-interview extraction) model in snapshots/A.
  { generation: "final-b3", domains: Object.fromEntries([...PUBLISHED, "itops"].map((d) => [d, at("baselines-gpt6/b3-no-commit")(d).map((x) => path.join(x, "snapshots", "A"))])) },
  // Added 2026-11-04 after the paid runs: the persona ablation (final interviewer, gpt-4o-mini persona)
  // and the held-out ePO domain (interactive, and B3 from its snapshot A).
  { generation: "persona-ablation", domains: { itops: at("persona-ablation/runs")("itops") } },
  { generation: "epo-interactive", domains: { "epo-ordering": at("epo-heldout/interactive")("epo-ordering") } },
  { generation: "epo-b3", domains: { "epo-ordering": at("epo-heldout/b3-no-commit")("epo-ordering").map((x) => path.join(x, "snapshots", "A")) } },
];

function goldFor(domain, scope) {
  const full = domain === "itops-mtsr" ? loadGroundTruthModel() : loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath(domain) });
  return scope === "full" ? full : scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
}

function readJudgments(runDir, scope) {
  const p = path.join(runDir, "semantic-judgments.json");
  if (!fs.existsSync(p)) return null;
  const saved = JSON.parse(fs.readFileSync(p, "utf8"));
  const block = saved[scope === "full" ? "fullDomain" : "scoped"];
  return block && block.judgments ? block.judgments : null;
}

export function measureRun(gold, runDir, scope, policy) {
  const { state } = recoveredStateFromYaml(fs.readFileSync(path.join(runDir, "recovered-model.yaml"), "utf8"));
  const judgments = policy === "semantic" ? readJudgments(runDir, scope) : null;
  if (policy === "semantic" && !judgments) return null;
  const ids = recoveredGoldIds(gold, state, judgments, policy);
  let eligible = 0, recoveredEligible = 0, recoveredIneligible = 0;
  for (const rel of gold.relationships) {
    const ok = ids.classes.has(rel.fromClassId) && ids.classes.has(rel.toClassId);
    if (ok) { eligible++; if (ids.relationships.has(rel.id)) recoveredEligible++; }
    else if (ids.relationships.has(rel.id)) recoveredIneligible++;
  }
  const nClasses = Object.keys(gold.classes).length, nRels = gold.relationships.length;
  return {
    classRecall: nClasses ? ids.classes.size / nClasses : null,
    relRecall: nRels ? ids.relationships.size / nRels : null,
    eligibleShare: nRels ? eligible / nRels : null,
    conditionalRate: eligible ? recoveredEligible / eligible : null,
    eligible, recoveredEligible, recoveredIneligible, goldRelationships: nRels, goldClasses: nClasses,
  };
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
function summarize(perRun) {
  const ok = perRun.filter(Boolean);
  if (!ok.length) return null;
  const pick = (k) => ok.map((r) => r[k]).filter((x) => x !== null);
  const cr = pick("conditionalRate");
  if (!cr.length) return null;
  return {
    n: ok.length,
    conditionalRate: { mean: mean(cr), min: Math.min(...cr), max: Math.max(...cr) },
    classRecall: mean(pick("classRecall")),
    relRecall: mean(pick("relRecall")),
    eligibleShare: mean(pick("eligibleShare")),
    // DESIGN.md amendment 1: the gap as the first paper stated it.
    relToClassRecall: mean(pick("relRecall")) / mean(pick("classRecall")),
    eligible: pick("eligible"),
    recoveredEligible: pick("recoveredEligible"),
    recoveredIneligible: pick("recoveredIneligible"),
  };
}

export function densityOf(domain) {
  const g = goldFor(domain, "full");
  const nC = Object.keys(g.classes).length, nR = g.relationships.length;
  const distinct = g.relationships.filter((r) => r.fromClassId !== r.toClassId).length;
  return { classes: nC, relationships: nR, relPerClass: nR / nC, distinctEndpointShare: nR ? distinct / nR : null };
}

export function runAll() {
  const out = { density: {}, readings: {} };
  for (const d of [...PUBLISHED, "itops", "epo-ordering"]) out.density[d] = densityOf(d);
  for (const scope of ["full", "practical"]) {
    for (const policy of ["heuristic", "semantic"]) {
      const key = `${policy}/${scope}`;
      out.readings[key] = {};
      for (const cell of CELLS) {
        const g = {};
        for (const [domain, dirs] of Object.entries(cell.domains)) {
          const gold = goldFor(cell.gold || domain, scope);
          const perRun = dirs.map((dir) => (fs.existsSync(path.join(dir, "recovered-model.yaml")) ? measureRun(gold, dir, scope, policy) : null));
          g[domain] = { runs: dirs.map((d) => path.relative(ROOT, d)), perRun, summary: summarize(perRun) };
        }
        const pub = PUBLISHED.map((d) => g[d] && g[d].summary).filter(Boolean);
        if (pub.length === PUBLISHED.length) {
          g.macroPublished = {
            conditionalRate: mean(pub.map((s) => s.conditionalRate.mean)),
            classRecall: mean(pub.map((s) => s.classRecall)),
            relRecall: mean(pub.map((s) => s.relRecall)),
            eligibleShare: mean(pub.map((s) => s.eligibleShare)),
            relToClassRecall: mean(pub.map((s) => s.relToClassRecall)),
          };
        }
        out.readings[key][cell.generation] = g;
      }
    }
  }
  return out;
}

const pct = (x) => (x === null || x === undefined ? "--" : (100 * x).toFixed(1));

export function renderReport(res) {
  const L = [];
  L.push("# Endpoint-conditioned relationship recovery: report", "");
  L.push("Generated by `tests/evals/endpoint-conditioned-by-domain.mjs --write`. Offline: no model calls, stored judge verdicts replayed as they are. Design and reading rules: `DESIGN.md`.", "");
  L.push("Column definitions:", "");
  L.push("- **Cond.**: relationships recovered among those whose two endpoint classes were both recovered, in %, as the mean over 3 runs [min–max].");
  L.push("- **Class R / Rel R**: raw class and relationship recall, in %.");
  L.push("- **Eligible**: share of the gold relationships whose two endpoints were both recovered, in %.");
  L.push("- **Rel/Class R**: relationship recall divided by class recall (DESIGN.md amendment 1). 1.0 or more means the gap is closed; the first paper's value is 0.25.");
  L.push("- **Rec. w/o endpoints**: per run, the gold relationships recovered even though their two endpoint classes were not both recovered.", "");
  L.push("## Gold density", "", "| Domain | Classes | Relationships | Rel. per class | Distinct-endpoint share |", "|---|---|---|---|---|");
  for (const [d, x] of Object.entries(res.density)) L.push(`| ${d} | ${x.classes} | ${x.relationships} | ${x.relPerClass.toFixed(2)} | ${pct(x.distinctEndpointShare)} |`);
  for (const [key, gens] of Object.entries(res.readings)) {
    L.push("", `## Reading: ${key}${key === "heuristic/full" ? " (primary)" : ""}`, "");
    L.push("| Generation | Domain | Rel/Class R | Cond. [min–max] | Class R | Rel R | Eligible | Rec. w/o endpoints |", "|---|---|---|---|---|---|---|---|");
    for (const [gen, g] of Object.entries(gens)) {
      for (const [domain, cell] of Object.entries(g)) {
        if (domain === "macroPublished") continue;
        const s = cell.summary;
        if (!s) { L.push(`| ${gen} | ${domain} | | no stored verdicts | | | | |`); continue; }
        L.push(`| ${gen} | ${domain} | ${s.relToClassRecall.toFixed(2)} | ${pct(s.conditionalRate.mean)} [${pct(s.conditionalRate.min)}–${pct(s.conditionalRate.max)}] | ${pct(s.classRecall)} | ${pct(s.relRecall)} | ${pct(s.eligibleShare)} | ${s.recoveredIneligible.join("/")} |`);
      }
      if (g.macroPublished) {
        const m = g.macroPublished;
        L.push(`| ${gen} | **macro, 4 published** | **${m.relToClassRecall.toFixed(2)}** | **${pct(m.conditionalRate)}** | ${pct(m.classRecall)} | ${pct(m.relRecall)} | ${pct(m.eligibleShare)} | |`);
      }
    }
  }
  return L.join("\n") + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = runAll();
  const report = renderReport(res);
  if (process.argv.includes("--write")) {
    fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(res, null, 2) + "\n");
    fs.writeFileSync(path.join(OUT_DIR, "REPORT.md"), report);
    console.log(`wrote ${path.relative(process.cwd(), OUT_DIR)}/results.json and REPORT.md`);
  } else {
    process.stdout.write(report);
  }
}
