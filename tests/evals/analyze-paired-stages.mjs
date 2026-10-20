// ISSUE #182: THE PAIRED-STAGE REPORT, from saved runs only (no model calls)
//
//   node tests/evals/analyze-paired-stages.mjs [--write]
//
// Reads every run under ontology_translation/results/paired-stages/block-*/
// (snapshots/<A|B|C>/metrics.json, provenance.json, metrics.json), computes
// the tables DESIGN.md pre-registers, evaluates each ticket's pass criterion,
// and prints the report; --write saves it as REPORT.md and summary.json in
// that directory. A run that did not end `stages_complete` is listed but not
// averaged in.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { attributeRun } from "./attribute-recall.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..", "ontology_translation", "results", "paired-stages");
const DOMAINS = ["fibo-loans", "brick-hvac"];
const BLOCK_DIRS = { "block-1-medium": "medium", "block-2-high": "high" };

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
export const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
// Sample standard deviation (n - 1); null below two values.
export const stdev = (xs) => {
  if (xs.length < 2) return null;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
};

/** The numbers one snapshot contributes, flattened. */
export function snapshotRow(entry) {
  const h = entry.metrics, s = entry.scopedMetrics, sem = entry.semanticMetrics;
  return {
    composite: h.recoveryEffectiveness,
    scopedComposite: s.recoveryEffectiveness,
    semanticComposite: sem ? sem.recoveryEffectiveness : null,
    classRecall: h.classes.recall, classPrecision: h.classes.precision, classF1: h.classes.f1,
    relRecall: h.relationships.recall, relPrecision: h.relationships.precision, relF1: h.relationships.f1,
    propRecall: h.properties.recall, propPrecision: h.properties.precision, propF1: h.properties.f1,
    semClassF1: sem ? sem.classes.f1 : null, semRelF1: sem ? sem.relationships.f1 : null, semPropF1: sem ? sem.properties.f1 : null,
    rulesF1: entry.ruleMetrics ? entry.ruleMetrics.f1 : null,
    actionsF1: entry.actionMetrics ? entry.actionMetrics.identification.f1 : null,
    valueFidelity: h.controlledValueFidelity,
    allowedValueLists: entry.counts ? entry.counts.allowedValueLists : null,
    classes: entry.counts ? entry.counts.classes : null,
    relationships: entry.counts ? entry.counts.relationships : null,
    properties: entry.counts ? entry.counts.properties : null,
  };
}

export function loadRuns(root = ROOT) {
  const runs = [];
  for (const [blockDir, effort] of Object.entries(BLOCK_DIRS)) {
    const bdir = path.join(root, blockDir);
    if (!fs.existsSync(bdir)) continue;
    for (const runId of fs.readdirSync(bdir).filter((d) => /^run-\d+$/.test(d)).sort()) {
      for (const domain of DOMAINS) {
        const dir = path.join(bdir, runId, domain);
        const prov = readJson(path.join(dir, "provenance.json"));
        if (!prov) continue;
        const snaps = {};
        for (const label of ["A", "B", "C"]) {
          const m = readJson(path.join(dir, "snapshots", label, "metrics.json"));
          if (m) snaps[label] = { ...snapshotRow(m), turn: m.turn, elapsedSec: m.elapsedSec, offlineRescoreAgrees: m.offlineRescoreAgrees };
        }
        const metrics = readJson(path.join(dir, "metrics.json"));
        const snapCost = Object.fromEntries((prov.snapshots || []).map((s) => [s.label, s.cost && s.cost.all]));
        runs.push({
          block: blockDir, effort, runId, domain, dir, prov, snaps, snapCost,
          ops: metrics ? metrics.operationalStats : null,
          clean: prov.status === "complete" && prov.stoppedReason === "stages_complete" && ["A", "B", "C"].every((l) => snaps[l]),
        });
      }
    }
  }
  return runs;
}

const KEYS = ["composite", "scopedComposite", "semanticComposite", "classRecall", "classPrecision", "classF1", "relRecall", "relPrecision", "relF1",
  "propRecall", "propPrecision", "propF1", "semClassF1", "semRelF1", "semPropF1", "rulesF1", "actionsF1", "valueFidelity", "allowedValueLists",
  "classes", "relationships", "properties"];

/** Mean and stdev of every key, per snapshot, and of the paired differences. */
export function aggregate(runs) {
  const out = { n: runs.length, snapshots: {}, deltas: {} };
  for (const label of ["A", "B", "C"]) {
    out.snapshots[label] = {};
    for (const k of KEYS) {
      const xs = runs.map((r) => r.snaps[label] && r.snaps[label][k]).filter((x) => typeof x === "number");
      out.snapshots[label][k] = { mean: mean(xs), sd: stdev(xs), n: xs.length };
    }
  }
  for (const [name, a, b] of [["B-A", "A", "B"], ["C-B", "B", "C"], ["C-A", "A", "C"]]) {
    out.deltas[name] = {};
    for (const k of KEYS) {
      const xs = runs.map((r) => (r.snaps[a] && r.snaps[b] && typeof r.snaps[a][k] === "number" && typeof r.snaps[b][k] === "number" ? r.snaps[b][k] - r.snaps[a][k] : null)).filter((x) => x !== null);
      out.deltas[name][k] = { mean: mean(xs), sd: stdev(xs), n: xs.length, values: xs };
    }
  }
  return out;
}

const groupBy = (runs, block, domain) => runs.filter((r) => r.clean && r.block === block && r.domain === domain);

/** The pass criteria in DESIGN.md, evaluated. Each: { met: true|false|null, detail }. */
export function evaluateCriteria(runs) {
  const res = {};
  const b1 = Object.fromEntries(DOMAINS.map((d) => [d, aggregate(groupBy(runs, "block-1-medium", d))]));
  const b2 = Object.fromEntries(DOMAINS.map((d) => [d, aggregate(groupBy(runs, "block-2-high", d))]));
  const anyOverCap = runs.some((r) => !r.clean);
  const fmt = (x) => (x === null || x === undefined ? "n/a" : (x >= 0 ? "+" : "") + x.toFixed(3));

  for (const [blockName, agg] of [["block 1 (medium)", b1], ["block 2 (high)", b2]]) {
    if (!DOMAINS.every((d) => agg[d].n > 0)) continue;
    const domainMeans = DOMAINS.map((d) => agg[d].deltas["B-A"].composite.mean);
    const meanBoth = mean(domainMeans);
    const precB = DOMAINS.map((d) => agg[d].snapshots.B.classPrecision.mean);
    const avlDelta = DOMAINS.map((d) => agg[d].deltas["B-A"].allowedValueLists.mean);
    res[`#179 ${blockName}`] = {
      met: meanBoth >= 0.05 && precB.every((p) => p >= 0.95) && avlDelta.every((x) => x >= 0) && !anyOverCap,
      detail: `B-A composite, mean of both domains ${fmt(meanBoth)} (need >= +0.050; ${DOMAINS.map((d, i) => `${d} ${fmt(domainMeans[i])}`).join(", ")}); `
        + `class precision at B ${precB.map((p) => p.toFixed(3)).join(" / ")} (need >= 0.95); allowed-value lists B-A ${avlDelta.map(fmt).join(" / ")} (need >= 0)`,
    };
    const naming = DOMAINS.map((d) => {
      const dl = agg[d].deltas["C-B"];
      const sdRel = agg[d].snapshots.B.relF1.sd, sdProp = agg[d].snapshots.B.propF1.sd;
      const up = (dl.relF1.mean !== null && sdRel !== null && dl.relF1.mean > sdRel) || (dl.propF1.mean !== null && sdProp !== null && dl.propF1.mean > sdProp);
      return { d, up, relPrecOk: dl.relPrecision.mean >= 0, text: `${d}: rel F1 ${fmt(dl.relF1.mean)} vs sd ${sdRel === null ? "n/a" : sdRel.toFixed(3)}, prop F1 ${fmt(dl.propF1.mean)} vs sd ${sdProp === null ? "n/a" : sdProp.toFixed(3)}, rel precision ${fmt(dl.relPrecision.mean)}` };
    });
    res[`#180 ${blockName}`] = { met: naming.every((x) => x.up && x.relPrecOk) && !anyOverCap, detail: naming.map((x) => x.text).join("; ") };
    const floors = DOMAINS.map((d) => ({ d, comp: agg[d].deltas["C-A"].composite.mean, scoped: agg[d].deltas["C-A"].scopedComposite.mean }));
    res[`floors ${blockName}`] = { met: floors.every((f) => f.comp >= 0 && f.scoped >= 0) && !anyOverCap,
      detail: floors.map((f) => `${f.d}: C-A composite ${fmt(f.comp)}, practical ${fmt(f.scoped)}`).join("; ") };
  }
  if (DOMAINS.every((d) => b1[d].n > 0 && b2[d].n > 0)) {
    const per = DOMAINS.map((d) => {
      const diff = b2[d].snapshots.A.composite.mean - b1[d].snapshots.A.composite.mean;
      const sd = b1[d].snapshots.A.composite.sd;
      return { d, diff, sd, beats: sd !== null && diff > sd };
    });
    res["#181 high vs medium at A"] = { met: per.every((x) => x.beats) && !anyOverCap,
      detail: per.map((x) => `${x.d}: high - medium ${fmt(x.diff)} vs medium sd ${x.sd === null ? "n/a" : x.sd.toFixed(3)}`).join("; ") };
  }
  return res;
}

const pct = (x) => (x === null || x === undefined ? "—" : x.toFixed(3));
const pm = (s) => (s.mean === null ? "—" : `${s.mean.toFixed(3)}${s.sd === null ? "" : ` ± ${s.sd.toFixed(3)}`}`);
const signed = (s) => (s.mean === null ? "—" : `${s.mean >= 0 ? "+" : ""}${s.mean.toFixed(3)}${s.sd === null ? "" : ` ± ${s.sd.toFixed(3)}`}`);

export function renderReport(runs) {
  const lines = ["# Paired stages: results (issue #182)", "",
    "Generated by `tests/evals/analyze-paired-stages.mjs` from the saved runs; design and pass criteria in `DESIGN.md`. "
    + "Values are mean ± sample stdev over the clean replicates (n per cell shown). Heuristic, full domain, unless marked.", ""];

  lines.push("## Runs", "", "| Block | Domain | Run | Stopped | Turns A/B/C | Wall clock | Cost USD | Cached share | Reasoning tokens | Rounds | Capped | Renames r/rd/p/c | Rescore ok |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of runs) {
    const st = r.prov.stages || {};
    const nr = st.namingRenames || {};
    lines.push(`| ${r.effort} | ${r.domain} | ${r.runId} | ${r.prov.stoppedReason}${r.clean ? "" : " (excluded)"} | ${["A", "B", "C"].map((l) => (r.snaps[l] ? r.snaps[l].turn : "—")).join("/")} | `
      + `${Math.round((r.prov.wallClockSec || 0) / 60)} min | ${typeof r.prov.totalCostUsd === "number" ? r.prov.totalCostUsd.toFixed(2) : "—"} | ${pct(r.prov.cachedShare)} | ${r.prov.reasoningTokens ?? "—"} | `
      + `${(st.sweepRounds || []).length} | ${(st.stagesCapped || []).join(", ") || "none"} | ${[nr.relationshipsRenamed, nr.relationshipsRedirected, nr.propertiesRenamed, nr.classesRenamed].map((x) => x ?? "—").join("/")} | `
      + `${["A", "B", "C"].every((l) => r.snaps[l] && r.snaps[l].offlineRescoreAgrees) ? "yes" : "NO"} |`);
  }
  lines.push("");

  const rowsFor = [["composite", "Composite"], ["scopedComposite", "Composite, practical scope"], ["semanticComposite", "Composite, semantic"],
    ["classRecall", "Class recall"], ["classPrecision", "Class precision"], ["classF1", "Class F1"],
    ["relRecall", "Relationship recall"], ["relPrecision", "Relationship precision"], ["relF1", "Relationship F1"],
    ["propRecall", "Property recall"], ["propPrecision", "Property precision"], ["propF1", "Property F1"],
    ["semRelF1", "Relationship F1, semantic"], ["semPropF1", "Property F1, semantic"],
    ["rulesF1", "Rules F1"], ["actionsF1", "Actions F1"], ["valueFidelity", "Controlled-value fidelity"], ["allowedValueLists", "Allowed-value lists"],
    ["classes", "Classes recovered (count)"], ["relationships", "Relationships (count)"], ["properties", "Properties (count)"]];

  for (const [block, effort] of Object.entries(BLOCK_DIRS)) {
    for (const d of DOMAINS) {
      const group = groupBy(runs, block, d);
      if (!group.length) continue;
      const agg = aggregate(group);
      lines.push(`## ${d}, ${effort} (n = ${group.length})`, "", "| Measure | A | B | C | B − A | C − B | C − A |", "|---|---|---|---|---|---|---|");
      for (const [k, name] of rowsFor) {
        lines.push(`| ${name} | ${pm(agg.snapshots.A[k])} | ${pm(agg.snapshots.B[k])} | ${pm(agg.snapshots.C[k])} | ${signed(agg.deltas["B-A"][k])} | ${signed(agg.deltas["C-B"][k])} | ${signed(agg.deltas["C-A"][k])} |`);
      }
      lines.push("");
      // Per-stage operations: turns and cost between snapshots.
      lines.push("| Stage | Turns | Minutes | Cost USD | Prompt tokens | Cached share |", "|---|---|---|---|---|---|");
      const stage = (fromL, toL, name) => {
        const xs = group.map((r) => {
          const from = fromL ? r.snapCost[fromL] : { costUsd: 0, promptTokens: 0, cachedTokens: 0 };
          const to = r.snapCost[toL];
          if (!from || !to) return null;
          return {
            turns: r.snaps[toL].turn - (fromL ? r.snaps[fromL].turn : 0),
            minutes: (r.snaps[toL].elapsedSec - (fromL ? r.snaps[fromL].elapsedSec : 0)) / 60,
            cost: to.costUsd - from.costUsd,
            prompt: to.promptTokens - from.promptTokens,
            cached: to.cachedTokens - from.cachedTokens,
          };
        }).filter(Boolean);
        const m = (f) => mean(xs.map(f));
        lines.push(`| ${name} | ${(m((x) => x.turns) ?? 0).toFixed(1)} | ${(m((x) => x.minutes) ?? 0).toFixed(1)} | ${(m((x) => x.cost) ?? 0).toFixed(2)} | ${Math.round(m((x) => x.prompt) ?? 0)} | ${pct(mean(xs.map((x) => (x.prompt ? x.cached / x.prompt : 0))))} |`);
      };
      stage(null, "A", "Interview (to A)");
      stage("A", "B", "Coverage sweep (A to B)");
      stage("B", "C", "Naming pass (B to C)");
      lines.push("");
    }
  }

  // #181: between blocks at snapshot A.
  if (runs.some((r) => r.block === "block-2-high")) {
    lines.push("## `high` versus `medium` at snapshot A (#181)", "", "| Domain | medium A composite | high A composite | difference |", "|---|---|---|---|");
    for (const d of DOMAINS) {
      const m = aggregate(groupBy(runs, "block-1-medium", d)).snapshots.A.composite;
      const h = aggregate(groupBy(runs, "block-2-high", d)).snapshots.A.composite;
      lines.push(`| ${d} | ${pm(m)} | ${pm(h)} | ${m.mean !== null && h.mean !== null ? (h.mean - m.mean >= 0 ? "+" : "") + (h.mean - m.mean).toFixed(3) : "—"} |`);
    }
    lines.push("");
  }

  lines.push("## Pass criteria", "");
  for (const [name, r] of Object.entries(evaluateCriteria(runs))) lines.push(`- **${name}: ${r.met ? "met" : "not met"}.** ${r.detail}`);
  lines.push("");

  // Attribution at A and C, summed over clean runs.
  lines.push("## Recall attribution at A and C (summed over clean runs)", "", "| Block | Domain | Snapshot | Dimension | recovered | endpoint missing | other name | removed | mentioned | never | gold |", "|---|---|---|---|---|---|---|---|---|---|---|");
  for (const [block, effort] of Object.entries(BLOCK_DIRS)) {
    for (const d of DOMAINS) {
      const group = groupBy(runs, block, d);
      if (!group.length) continue;
      const atts = group.map((r) => attributeRun(r.dir, d));
      for (const label of ["A", "C"]) {
        for (const dim of ["classes", "relationships", "properties"]) {
          const sum = (k) => atts.reduce((s, a) => s + ((a.snapshots[label] && a.snapshots[label].counts[dim][k]) || 0), 0);
          lines.push(`| ${effort} | ${d} | ${label} | ${dim} | ${sum("recovered")} | ${sum("endpoint_class_missing")} | ${sum("other_name")} | ${sum("removed")} | ${sum("mentioned_not_committed")} | ${sum("never_mentioned")} | ${sum("goldTotal")} |`);
        }
      }
    }
  }
  lines.push("");
  return lines.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runs = loadRuns();
  const report = renderReport(runs);
  console.log(report);
  if (process.argv.includes("--write")) {
    fs.writeFileSync(path.join(ROOT, "REPORT.md"), `${report}\n`);
    const summary = { generatedAt: new Date().toISOString(), runs: runs.map((r) => ({ block: r.block, domain: r.domain, runId: r.runId, clean: r.clean, snaps: r.snaps, cost: r.prov.totalCostUsd })), criteria: evaluateCriteria(runs) };
    fs.writeFileSync(path.join(ROOT, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  }
}
