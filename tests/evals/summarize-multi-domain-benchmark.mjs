// CROSS-DOMAIN BENCHMARK SUMMARIZER (issue #111)
//
//   node tests/evals/summarize-multi-domain-benchmark.mjs \
//     --domains=brick-hvac,iof-maintenance,iof-supply-chain,fibo-loans \
//     --runs=run-01,run-02,run-03
//
// Reads every completed domain x replicate run's metrics.json + provenance.json
// (written by run-multi-domain-benchmark.mjs -- no new API calls here, this
// script is pure aggregation) plus each domain's own
// ontology_translation/domains/<domain>/translation-evaluation.json (issue
// #103's translation-quality report, so elicitation error is never read in
// isolation from translation error -- see #111's own "Translation-quality
// context" section). Writes exactly the four artifacts #111 asks for, direct
// children of ontology_translation/results/multi-domain/ (not nested under a
// run id -- that's reserved for the per-replicate raw run output):
//
//   summary.json            -- machine-readable: every run, per-domain
//                               aggregates, macro statistics, correlations
//   summary.md               -- the publication-oriented report
//   runs.csv                 -- one row per domain x replicate (#111: "do not
//                               aggregate away individual runs")
//   domain-comparison.csv    -- one row per domain: mean +/- stdev across
//                               replicates, next to translation-quality
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const RESULTS_ROOT = path.join(REPO_ROOT, "ontology_translation", "results", "multi-domain");
const DOMAINS_DIR = path.join(REPO_ROOT, "ontology_translation", "domains");

const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};
const csvList = (name) => {
  const v = arg(name);
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
};

function mean(values) {
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

// Sample stdev (n-1); falls back to 0 for a single observation rather than
// NaN, since "no dispersion observed yet" is the honest reading of one run.
function stdev(values) {
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

function pearson(xs, ys) {
  const pairs = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pairs.length < 3) return null; // not enough points for a meaningful r
  const xv = pairs.map((p) => p[0]), yv = pairs.map((p) => p[1]);
  const mx = mean(xv), my = mean(yv);
  const num = pairs.reduce((a, [x, y]) => a + (x - mx) * (y - my), 0);
  const denX = Math.sqrt(pairs.reduce((a, [x]) => a + (x - mx) ** 2, 0));
  const denY = Math.sqrt(pairs.reduce((a, [, y]) => a + (y - my) ** 2, 0));
  if (denX === 0 || denY === 0) return null;
  return num / (denX * denY);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function loadTranslationQuality(domain) {
  const p = path.join(DOMAINS_DIR, domain, "translation-evaluation.json");
  if (!fs.existsSync(p)) return null;
  const d = readJson(p);
  const pairs = (d.translation_stability && d.translation_stability.pairs) || [];
  const stabilityF1s = [];
  for (const pair of pairs) {
    for (const facet of ["classes", "relationships", "properties", "allowed_values"]) {
      if (pair[facet] && Number.isFinite(pair[facet].f1)) stabilityF1s.push(pair[facet].f1);
    }
  }
  const cqResults = (d.cq_support && d.cq_support.results) || [];
  const cqSupportRate = cqResults.length ? cqResults.filter((r) => r.supported).length / cqResults.length : null;
  return {
    hardGatesOk: d.hard_gates_ok ?? null,
    structuralValidityOk: (d.structural_validity && d.structural_validity.ok) ?? null,
    provenanceElementCoverage: (d.provenance_completeness && d.provenance_completeness.element_provenance_coverage) ?? null,
    reverseCoverage: (d.reverse_coverage && d.reverse_coverage.coverage) ?? null,
    translationStabilityMeanF1: mean(stabilityF1s),
    cqSupportRate,
  };
}

function extractRunRow(domain, runId, m, prov) {
  const g = (obj, ...keys) => keys.reduce((o, k) => (o ? o[k] : null), obj);
  return {
    domain, replicate: runId,
    model: prov.model, personaModel: prov.personaModel, classifierModel: prov.classifierModel,
    turnsUsed: prov.turnsUsed, stoppedReason: prov.stoppedReason, wallClockSec: prov.wallClockSec,
    appAgentApiCalls: g(m.operationalStats, "appAgentApiCalls"),
    applyToolCalls: g(m.operationalStats, "applyToolCalls"),
    totalTokens: g(m.operationalStats, "totalTokens"),
    classesFullF1: g(m.metrics, "classes", "f1"), classesFullRecall: g(m.metrics, "classes", "recall"), classesFullPrecision: g(m.metrics, "classes", "precision"),
    relationshipsFullF1: g(m.metrics, "relationships", "f1"),
    propertiesFullF1: g(m.metrics, "properties", "f1"), propertiesFullRecall: g(m.metrics, "properties", "recall"),
    controlledValueFidelityFull: g(m.metrics, "controlledValueFidelity"),
    recoveryEffectivenessFull: g(m.metrics, "recoveryEffectiveness"),
    classesScopedF1: g(m.scopedMetrics, "classes", "f1"),
    relationshipsScopedF1: g(m.scopedMetrics, "relationships", "f1"),
    propertiesScopedF1: g(m.scopedMetrics, "properties", "f1"),
    recoveryEffectivenessScoped: g(m.scopedMetrics, "recoveryEffectiveness"),
    semanticClassesFullF1: g(m.semanticMetrics, "classes", "f1"),
    semanticRelationshipsFullF1: g(m.semanticMetrics, "relationships", "f1"),
    semanticPropertiesFullF1: g(m.semanticMetrics, "properties", "f1"),
    rulesF1: g(m.ruleMetrics, "f1"),
    actionsIdentificationF1: g(m.actionMetrics, "identification", "f1"),
    semanticRulesF1: g(m.semanticRuleActionMetrics, "rules", "f1"),
    semanticActionsF1: g(m.semanticRuleActionMetrics, "actions", "identification", "f1") ?? g(m.semanticRuleActionMetrics, "actions", "f1"),
  };
}

function fmt(v, digits = 3) {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(digits);
  return String(v);
}

function toCsv(rows, columns) {
  const header = columns.join(",");
  const body = rows.map((r) => columns.map((c) => {
    const v = r[c];
    const s = fmt(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\n");
  return `${header}\n${body}\n`;
}

async function main() {
  const domains = csvList("domains");
  const runs = csvList("runs");
  if (domains.length === 0 || runs.length === 0) {
    console.error("Usage: node tests/evals/summarize-multi-domain-benchmark.mjs --domains=<d1,d2,...> --runs=<r1,r2,...>");
    process.exit(1);
  }

  const rows = [];
  const missing = [];
  for (const domain of domains) {
    for (const runId of runs) {
      const dir = path.join(RESULTS_ROOT, runId, domain);
      const provPath = path.join(dir, "provenance.json");
      const metricsPath = path.join(dir, "metrics.json");
      if (!fs.existsSync(provPath) || !fs.existsSync(metricsPath)) { missing.push(`${domain}/${runId}`); continue; }
      rows.push(extractRunRow(domain, runId, readJson(metricsPath), readJson(provPath)));
    }
  }
  if (missing.length) {
    console.error(`Warning: ${missing.length} domain/replicate run(s) not yet complete, excluded from this summary: ${missing.join(", ")}`);
  }
  if (rows.length === 0) {
    console.error("No completed runs found for the given --domains/--runs -- nothing to summarize.");
    process.exit(1);
  }

  // Per-domain aggregates (mean +/- stdev across that domain's replicates),
  // next to translation quality. Ground-truth sizes come straight off the
  // first available run's metrics.json (identical across replicates of the
  // same domain, since it's the same reference.domain.yaml every time).
  const domainAgg = {};
  for (const domain of domains) {
    const domainRows = rows.filter((r) => r.domain === domain);
    if (domainRows.length === 0) continue;
    const col = (name) => domainRows.map((r) => r[name]);
    const sampleMetrics = readJson(path.join(RESULTS_ROOT, domainRows[0].replicate, domain, "metrics.json"));
    domainAgg[domain] = {
      replicates: domainRows.length,
      groundTruthTotals: {
        classes: sampleMetrics.metrics.classes.groundTruthTotal,
        relationships: sampleMetrics.metrics.relationships.groundTruthTotal,
        properties: sampleMetrics.metrics.properties.groundTruthTotal,
        rules: sampleMetrics.ruleMetrics ? sampleMetrics.ruleMetrics.groundTruthTotal : 0,
        actions: sampleMetrics.actionMetrics ? sampleMetrics.actionMetrics.identification.groundTruthTotal : 0,
      },
      classesFullF1: { mean: mean(col("classesFullF1")), stdev: stdev(col("classesFullF1")) },
      relationshipsFullF1: { mean: mean(col("relationshipsFullF1")), stdev: stdev(col("relationshipsFullF1")) },
      propertiesFullF1: { mean: mean(col("propertiesFullF1")), stdev: stdev(col("propertiesFullF1")) },
      recoveryEffectivenessFull: { mean: mean(col("recoveryEffectivenessFull")), stdev: stdev(col("recoveryEffectivenessFull")) },
      classesScopedF1: { mean: mean(col("classesScopedF1")), stdev: stdev(col("classesScopedF1")) },
      recoveryEffectivenessScoped: { mean: mean(col("recoveryEffectivenessScoped")), stdev: stdev(col("recoveryEffectivenessScoped")) },
      semanticClassesFullF1: { mean: mean(col("semanticClassesFullF1")), stdev: stdev(col("semanticClassesFullF1")) },
      rulesF1: { mean: mean(col("rulesF1")), stdev: stdev(col("rulesF1")) },
      actionsIdentificationF1: { mean: mean(col("actionsIdentificationF1")), stdev: stdev(col("actionsIdentificationF1")) },
      turnsUsed: { mean: mean(col("turnsUsed")), stdev: stdev(col("turnsUsed")) },
      totalTokens: { mean: mean(col("totalTokens")), stdev: stdev(col("totalTokens")) },
      translationQuality: loadTranslationQuality(domain),
    };
  }

  // Macro statistics: average of per-domain means, each domain weighted
  // equally regardless of its size -- #111 explicitly rules out a
  // micro-average here ("large ontologies must not dominate").
  const domainList = Object.keys(domainAgg);
  const macro = (metricKey) => {
    const perDomainMeans = domainList.map((d) => domainAgg[d][metricKey].mean).filter((v) => v !== null);
    return { mean: mean(perDomainMeans), stdev: stdev(perDomainMeans), domains: perDomainMeans.length };
  };
  const macroStats = {
    classesFullF1: macro("classesFullF1"),
    relationshipsFullF1: macro("relationshipsFullF1"),
    propertiesFullF1: macro("propertiesFullF1"),
    recoveryEffectivenessFull: macro("recoveryEffectivenessFull"),
    classesScopedF1: macro("classesScopedF1"),
    recoveryEffectivenessScoped: macro("recoveryEffectivenessScoped"),
    rulesF1: macro("rulesF1"),
    actionsIdentificationF1: macro("actionsIdentificationF1"),
  };

  // Cross-domain analyses (#111's own list of questions), computed from the
  // real numbers above rather than asserted -- correlations need >= 3
  // domains to mean anything and come back null otherwise (pearson()
  // enforces that itself).
  const sizeOf = (d) => Object.values(domainAgg[d].groundTruthTotals).reduce((a, b) => a + b, 0);
  const sizeVsF1 = pearson(domainList.map(sizeOf), domainList.map((d) => domainAgg[d].recoveryEffectivenessFull.mean));
  const stabilityVsF1 = pearson(
    domainList.map((d) => domainAgg[d].translationQuality && domainAgg[d].translationQuality.translationStabilityMeanF1),
    domainList.map((d) => domainAgg[d].recoveryEffectivenessFull.mean),
  );
  const relVsClass = domainList.map((d) => ({
    domain: d, delta: domainAgg[d].relationshipsFullF1.mean - domainAgg[d].classesFullF1.mean,
  }));
  const relHarderCount = relVsClass.filter((r) => r.delta < 0).length;
  const propRecallVsClassRecall = domainList.map((d) => {
    const dRows = rows.filter((r) => r.domain === d);
    return { domain: d, propRecall: mean(dRows.map((r) => r.propertiesFullRecall)), classRecall: mean(dRows.map((r) => r.classesFullRecall)) };
  });
  const propUnderElicitedCount = propRecallVsClassRecall.filter((r) => r.propRecall < r.classRecall).length;

  const elementConsistency = ["classesFullF1", "relationshipsFullF1", "propertiesFullF1", "rulesF1", "actionsIdentificationF1"]
    .map((key) => ({ key, mean: macroStats[key] ? macroStats[key].mean : mean(domainList.map((d) => domainAgg[d][key].mean)), stdev: macroStats[key] ? macroStats[key].stdev : stdev(domainList.map((d) => domainAgg[d][key].mean)) }))
    .filter((e) => e.mean !== null)
    .sort((a, b) => (b.mean - b.stdev) - (a.mean - a.stdev));

  const crossDomainAnalysis = {
    consistentlyRecoveredElements: elementConsistency.map((e) => ({ element: e.key, macroMeanF1: e.mean, macroStdevF1: e.stdev })),
    relationshipsHarderThanClasses: { perDomain: relVsClass, domainsWhereHarder: relHarderCount, ofDomains: relVsClass.length,
      conclusion: relHarderCount === relVsClass.length ? "yes, in every domain" : relHarderCount === 0 ? "no, not in any domain" : `mixed -- harder in ${relHarderCount}/${relVsClass.length} domains` },
    propertiesUnderElicited: { perDomain: propRecallVsClassRecall, domainsWhereUnder: propUnderElicitedCount, ofDomains: propRecallVsClassRecall.length,
      conclusion: propUnderElicitedCount === propRecallVsClassRecall.length ? "yes, in every domain" : propUnderElicitedCount === 0 ? "no, not in any domain" : `mixed -- under-elicited in ${propUnderElicitedCount}/${propRecallVsClassRecall.length} domains` },
    domainAbstractionLevel: {
      note: "Abstraction level has no numeric proxy in this benchmark's own metrics -- reading the per-domain F1s in domain-comparison.csv against each domain's known character (brick-hvac: concrete physical equipment graph; iof-maintenance/iof-supply-chain: process- and event-centric industrial ontologies; fibo-loans: abstract financial/regulatory concepts) is left to the reader rather than asserted here.",
    },
    ontologySizeVsRecovery: { pearsonR: sizeVsF1, perDomain: domainList.map((d) => ({ domain: d, size: sizeOf(d), recoveryEffectivenessFull: domainAgg[d].recoveryEffectivenessFull.mean })),
      conclusion: sizeVsF1 === null ? "not enough domains for a meaningful correlation" : sizeVsF1 < -0.3 ? "larger domains recovered worse (negative correlation)" : sizeVsF1 > 0.3 ? "larger domains recovered better (positive correlation)" : "no clear relationship" },
    translationStabilityVsElicitation: { pearsonR: stabilityVsF1,
      conclusion: stabilityVsF1 === null ? "not enough domains for a meaningful correlation" : stabilityVsF1 > 0.3 ? "more stable translations elicited better (positive correlation)" : stabilityVsF1 < -0.3 ? "more stable translations elicited worse (negative correlation)" : "no clear relationship" },
    interviewerChangeGeneralization: {
      note: "Not applicable to this run -- every domain and replicate used the same single interviewer model/deployment. Answering this question requires a follow-up run holding domains fixed and varying the interviewer model, which is out of scope for this pass.",
    },
  };

  fs.mkdirSync(RESULTS_ROOT, { recursive: true });

  const summaryJson = {
    schemaVersion: 1, generatedAt: new Date().toISOString(),
    domains, runs, missingRuns: missing,
    runs_detail: rows,
    perDomain: domainAgg,
    macro: macroStats,
    crossDomainAnalysis,
  };
  fs.writeFileSync(path.join(RESULTS_ROOT, "summary.json"), `${JSON.stringify(summaryJson, null, 2)}\n`);

  const runsCsvColumns = [
    "domain", "replicate", "model", "turnsUsed", "stoppedReason", "wallClockSec", "appAgentApiCalls", "applyToolCalls", "totalTokens",
    "classesFullF1", "classesFullRecall", "classesFullPrecision", "relationshipsFullF1", "propertiesFullF1", "propertiesFullRecall",
    "controlledValueFidelityFull", "recoveryEffectivenessFull",
    "classesScopedF1", "relationshipsScopedF1", "propertiesScopedF1", "recoveryEffectivenessScoped",
    "semanticClassesFullF1", "semanticRelationshipsFullF1", "semanticPropertiesFullF1",
    "rulesF1", "actionsIdentificationF1", "semanticRulesF1", "semanticActionsF1",
  ];
  fs.writeFileSync(path.join(RESULTS_ROOT, "runs.csv"), toCsv(rows, runsCsvColumns));

  const domainComparisonRows = domainList.map((d) => {
    const a = domainAgg[d];
    const tq = a.translationQuality || {};
    return {
      domain: d, replicates: a.replicates,
      groundTruthClasses: a.groundTruthTotals.classes, groundTruthRelationships: a.groundTruthTotals.relationships, groundTruthProperties: a.groundTruthTotals.properties,
      classesFullF1Mean: a.classesFullF1.mean, classesFullF1Stdev: a.classesFullF1.stdev,
      relationshipsFullF1Mean: a.relationshipsFullF1.mean, relationshipsFullF1Stdev: a.relationshipsFullF1.stdev,
      propertiesFullF1Mean: a.propertiesFullF1.mean, propertiesFullF1Stdev: a.propertiesFullF1.stdev,
      recoveryEffectivenessFullMean: a.recoveryEffectivenessFull.mean, recoveryEffectivenessFullStdev: a.recoveryEffectivenessFull.stdev,
      classesScopedF1Mean: a.classesScopedF1.mean, recoveryEffectivenessScopedMean: a.recoveryEffectivenessScoped.mean,
      rulesF1Mean: a.rulesF1.mean, actionsIdentificationF1Mean: a.actionsIdentificationF1.mean,
      turnsUsedMean: a.turnsUsed.mean, totalTokensMean: a.totalTokens.mean,
      translationHardGatesOk: tq.hardGatesOk, translationStructuralValidityOk: tq.structuralValidityOk,
      translationProvenanceCoverage: tq.provenanceElementCoverage, translationReverseCoverage: tq.reverseCoverage,
      translationStabilityMeanF1: tq.translationStabilityMeanF1, translationCqSupportRate: tq.cqSupportRate,
    };
  });
  const domainComparisonColumns = [
    "domain", "replicates", "groundTruthClasses", "groundTruthRelationships", "groundTruthProperties",
    "classesFullF1Mean", "classesFullF1Stdev", "relationshipsFullF1Mean", "relationshipsFullF1Stdev", "propertiesFullF1Mean", "propertiesFullF1Stdev",
    "recoveryEffectivenessFullMean", "recoveryEffectivenessFullStdev", "classesScopedF1Mean", "recoveryEffectivenessScopedMean",
    "rulesF1Mean", "actionsIdentificationF1Mean", "turnsUsedMean", "totalTokensMean",
    "translationHardGatesOk", "translationStructuralValidityOk", "translationProvenanceCoverage", "translationReverseCoverage",
    "translationStabilityMeanF1", "translationCqSupportRate",
  ];
  fs.writeFileSync(path.join(RESULTS_ROOT, "domain-comparison.csv"), toCsv(domainComparisonRows, domainComparisonColumns));

  const md = [];
  md.push("# Multi-domain elicitation benchmark -- cross-domain report", "");
  md.push(`Generated ${summaryJson.generatedAt}. Domains: ${domains.join(", ")}. Replicates: ${runs.join(", ")} (${runs.length}/domain).`);
  if (missing.length) md.push(`\n**${missing.length} run(s) excluded as incomplete:** ${missing.join(", ")}`);
  md.push("", "## Macro statistics (equal weight per domain, per #111's own methodology)", "");
  md.push("| Metric | Macro mean F1 | Macro stdev (dispersion) | Domains |", "|---|---|---|---|");
  for (const [key, label] of [
    ["classesFullF1", "Classes (full domain)"], ["relationshipsFullF1", "Relationships (full domain)"], ["propertiesFullF1", "Properties (full domain)"],
    ["recoveryEffectivenessFull", "Composite recovery effectiveness (full)"],
    ["classesScopedF1", "Classes (practical scope)"], ["recoveryEffectivenessScoped", "Composite recovery effectiveness (scoped)"],
    ["rulesF1", "Rules"], ["actionsIdentificationF1", "Actions (identification)"],
  ]) {
    const s = macroStats[key];
    md.push(`| ${label} | ${fmt(s.mean)} | ${fmt(s.stdev)} | ${s.domains} |`);
  }

  md.push("", "## Per-domain results (mean +/- stdev across replicates)", "");
  md.push("| Domain | Replicates | Classes F1 | Relationships F1 | Properties F1 | Recovery effectiveness | Rules F1 | Actions F1 |", "|---|---|---|---|---|---|---|---|");
  for (const d of domainList) {
    const a = domainAgg[d];
    md.push(`| ${d} | ${a.replicates} | ${fmt(a.classesFullF1.mean)} ± ${fmt(a.classesFullF1.stdev)} | ${fmt(a.relationshipsFullF1.mean)} ± ${fmt(a.relationshipsFullF1.stdev)} `
      + `| ${fmt(a.propertiesFullF1.mean)} ± ${fmt(a.propertiesFullF1.stdev)} | ${fmt(a.recoveryEffectivenessFull.mean)} ± ${fmt(a.recoveryEffectivenessFull.stdev)} `
      + `| ${fmt(a.rulesF1.mean)} | ${fmt(a.actionsIdentificationF1.mean)} |`);
  }

  md.push("", "## Translation-quality context (issue #103's own evaluation, alongside elicitation)", "");
  md.push("Elicitation error observed below is not the same as translation error: a domain that translated poorly going in cannot", "recover perfectly no matter how good the interview is. See each domain's own `translation-evaluation.json` for full detail.", "");
  md.push("| Domain | Hard gates OK | Structural validity | Provenance coverage | Reverse coverage | Translation stability F1 | CQ support rate |", "|---|---|---|---|---|---|---|");
  for (const d of domainList) {
    const tq = domainAgg[d].translationQuality || {};
    md.push(`| ${d} | ${fmt(tq.hardGatesOk)} | ${fmt(tq.structuralValidityOk)} | ${fmt(tq.provenanceElementCoverage)} | ${fmt(tq.reverseCoverage)} | ${fmt(tq.translationStabilityMeanF1)} | ${fmt(tq.cqSupportRate)} |`);
  }

  md.push("", "## Cross-domain analyses", "");
  md.push("**Which ontology elements are consistently recovered?** Ranked by macro mean F1 minus dispersion (rewards both high and stable recovery):");
  for (const e of crossDomainAnalysis.consistentlyRecoveredElements) md.push(`- ${e.element}: mean ${fmt(e.macroMeanF1)}, stdev ${fmt(e.macroStdevF1)}`);
  md.push("", `**Are relationships systematically harder than classes?** ${crossDomainAnalysis.relationshipsHarderThanClasses.conclusion}.`);
  for (const r of crossDomainAnalysis.relationshipsHarderThanClasses.perDomain) md.push(`- ${r.domain}: relationships F1 − classes F1 = ${fmt(r.delta)}`);
  md.push("", `**Are properties systematically under-elicited?** ${crossDomainAnalysis.propertiesUnderElicited.conclusion} (comparing property recall to class recall).`);
  for (const r of crossDomainAnalysis.propertiesUnderElicited.perDomain) md.push(`- ${r.domain}: property recall ${fmt(r.propRecall)} vs class recall ${fmt(r.classRecall)}`);
  md.push("", `**Does domain abstraction level affect recovery?** ${crossDomainAnalysis.domainAbstractionLevel.note}`);
  md.push("", `**Does ontology size affect recovery?** Pearson r = ${fmt(crossDomainAnalysis.ontologySizeVsRecovery.pearsonR)} -- ${crossDomainAnalysis.ontologySizeVsRecovery.conclusion}.`);
  for (const r of crossDomainAnalysis.ontologySizeVsRecovery.perDomain) md.push(`- ${r.domain}: ${r.size} total ground-truth elements, recovery effectiveness ${fmt(r.recoveryEffectivenessFull)}`);
  md.push("", `**Does translation stability correlate with elicitation score?** Pearson r = ${fmt(crossDomainAnalysis.translationStabilityVsElicitation.pearsonR)} -- ${crossDomainAnalysis.translationStabilityVsElicitation.conclusion}.`);
  md.push("", `**Do interviewer changes improve all domains or only IT Ops?** ${crossDomainAnalysis.interviewerChangeGeneralization.note}`);

  md.push("", "## Reproducibility", "");
  for (const r of rows) {
    md.push(`- ${r.domain}/${r.replicate}: model \`${r.model}\` (persona \`${r.personaModel}\`, classifier \`${r.classifierModel}\`), `
      + `${r.turnsUsed} turns, stopped=${r.stoppedReason}, ${r.wallClockSec}s wall-clock, ${fmt(r.totalTokens)} tokens`);
  }
  md.push("", "See `runs.csv` for every individual run's full metric set (not aggregated away), and `domain-comparison.csv` for the per-domain table above in machine-readable form.");

  fs.writeFileSync(path.join(RESULTS_ROOT, "summary.md"), `${md.join("\n")}\n`);

  console.log(`Wrote summary.json, summary.md, runs.csv, domain-comparison.csv to ${path.relative(process.cwd(), RESULTS_ROOT)}`);
  console.log(`${rows.length} run(s) summarized across ${domainList.length} domain(s); ${missing.length} incomplete run(s) excluded.`);
}

await main();
