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
const DEFAULT_RESULTS_ROOT = path.join(REPO_ROOT, "ontology_translation", "results", "multi-domain");
const DOMAINS_DIR = path.join(REPO_ROOT, "ontology_translation", "domains");

const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};
const csvList = (name) => {
  const v = arg(name);
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
};
const flag = (name) => process.argv.slice(2).includes(`--${name}`);

function mean(values) {
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

// Sample stdev (n-1). Issue #133/E20 (external audit): previously fell back
// to 0 for a single observation -- indistinguishable in every rendered
// table from "we measured this and it's genuinely rock-solid consistent",
// when the honest reading of n=1 is "we don't know the dispersion at all
// yet". Returns null instead, which fmt() below already renders as a blank
// cell rather than a misleading "0.000".
function stdev(values) {
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length < 2) return null;
  const m = mean(xs);
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

// Issue #133/N7c: same shape as every other per-dimension aggregate here
// ({mean, stdev}), plus how many of the `attemptedCount` rows actually
// contributed a real value -- a mean computed from fewer real observations
// than were attempted (e.g. a semantic judging failure on some replicates)
// must never look the same as one computed from all of them.
function withN(values, attemptedCount) {
  return { mean: mean(values), stdev: stdev(values), n: values.filter((v) => Number.isFinite(v)).length, attemptedCount };
}

function pearsonR(pairs) {
  const xv = pairs.map((p) => p[0]), yv = pairs.map((p) => p[1]);
  const mx = mean(xv), my = mean(yv);
  const num = pairs.reduce((a, [x, y]) => a + (x - mx) * (y - my), 0);
  const denX = Math.sqrt(pairs.reduce((a, [x]) => a + (x - mx) ** 2, 0));
  const denY = Math.sqrt(pairs.reduce((a, [, y]) => a + (y - my) ** 2, 0));
  if (denX === 0 || denY === 0) return null;
  return num / (denX * denY);
}

// Issue #133/E20: previously returned a bare number (or null), with no
// record of how many points it was actually computed from -- a reader
// looking at just "r = 0.62" has no way to tell that apart from "r = 0.62,
// n = 3", which is a very different amount of evidence. Now returns the n
// and a percentile bootstrap 95% CI alongside r, both null when n < 3 (not
// enough points for either to mean anything -- matches the existing
// require-3-points floor for r itself).
function pearson(xs, ys) {
  const pairs = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const n = pairs.length;
  if (n < 3) return { r: null, n, ci95: null };
  const r = pearsonR(pairs);
  if (r === null) return { r: null, n, ci95: null };
  const RESAMPLES = 2000;
  const boot = [];
  for (let i = 0; i < RESAMPLES; i++) {
    const sample = Array.from({ length: n }, () => pairs[Math.floor(Math.random() * n)]);
    const ri = pearsonR(sample);
    if (ri !== null) boot.push(ri);
  }
  boot.sort((a, b) => a - b);
  const ci95 = boot.length
    ? [boot[Math.floor(0.025 * boot.length)], boot[Math.min(boot.length - 1, Math.floor(0.975 * boot.length))]]
    : null;
  return { r, n, ci95 };
}

// Issue #133/E20: r being computable (n >= 3) is not the same bar as a
// directional claim ("larger domains recovered better") being trustworthy
// -- with n=3 or n=4, a |r| > 0.3 threshold is nearly guaranteed to fire on
// pure noise. Categorical verdicts are suppressed below this separate,
// stricter floor; r/n/ci95 are still always reported regardless.
const MIN_N_FOR_VERDICT = 5;

function correlationConclusion(result, negativeLabel, positiveLabel) {
  if (result.r === null) return `not enough domains for a meaningful correlation (n=${result.n})`;
  if (result.n < MIN_N_FOR_VERDICT) return `r=${result.r.toFixed(2)}, but n=${result.n} is below this report's own floor of ${MIN_N_FOR_VERDICT} for a directional conclusion -- not stated as a verdict`;
  if (result.r < -0.3) return negativeLabel;
  if (result.r > 0.3) return positiveLabel;
  return "no clear relationship";
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
    // Issue #133/E4: surfaced so a degraded run (real API errors and/or a
    // context-compaction event) is visible in runs.csv, not silently
    // averaged into the macro statistics at the same weight as a clean run.
    degraded: prov.degraded ?? false, totalErrorTurns: g(m.operationalStats, "totalErrorTurns") ?? 0, compactionEvents: prov.compactionEvents ?? 0,
    // Issue #133/N7c: a semantic judging failure does NOT mark the whole
    // run degraded (the heuristic scoring is still perfectly valid) but
    // must be visible somewhere -- surfaced here, and factored into the
    // semantic-dimension aggregates' own n via withN() below, rather than
    // silently averaging over fewer runs than the heuristic figures.
    semanticJudgingSucceeded: prov.semanticJudgingSucceeded ?? null,
    appAgentApiCalls: g(m.operationalStats, "appAgentApiCalls"),
    applyToolCalls: g(m.operationalStats, "applyToolCalls"),
    totalTokens: g(m.operationalStats, "totalTokens"),
    classesFullF1: g(m.metrics, "classes", "f1"), classesFullRecall: g(m.metrics, "classes", "recall"), classesFullPrecision: g(m.metrics, "classes", "precision"),
    relationshipsFullF1: g(m.metrics, "relationships", "f1"),
    propertiesFullF1: g(m.metrics, "properties", "f1"), propertiesFullRecall: g(m.metrics, "properties", "recall"),
    controlledValueFidelityFull: g(m.metrics, "controlledValueFidelity"),
    // Issue #133/E6: recoveryEffectiveness is now always the fixed
    // 3-component figure (see recoveryMetrics.mjs's own comment) --
    // recoveryEffectivenessWithFidelityFull is the separate, distinctly
    // named 4-component variant, and the gold/matched controlled-value
    // counts make a fidelity figure's own denominator visible.
    recoveryEffectivenessFull: g(m.metrics, "recoveryEffectiveness"),
    recoveryEffectivenessWithFidelityFull: g(m.metrics, "recoveryEffectivenessWithFidelity"),
    controlledValuePropertyGoldTotal: g(m.metrics, "controlledValuePropertyGoldTotal"),
    controlledValuePropertyMatchedCount: g(m.metrics, "controlledValuePropertyMatchedCount"),
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

// Issue #133/E20: a Pearson r reported with no CI reads as more precise
// than n=3-4 domains can actually support -- this makes the uncertainty
// visible right next to the point estimate instead of only in summary.json.
function fmtCi(ci95) {
  return ci95 ? `[${fmt(ci95[0], 2)}, ${fmt(ci95[1], 2)}]` : "n/a";
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
    console.error("Usage: node tests/evals/summarize-multi-domain-benchmark.mjs --domains=<d1,d2,...> --runs=<r1,r2,...> [--resultsDir=<path>]");
    process.exit(1);
  }
  // Issue #137: mirrors run-multi-domain-benchmark.mjs's own --resultsDir=
  // override, for the same reason -- a sibling results directory (e.g. a
  // contamination-free control-domain arm) needs its own summary without
  // mixing into ontology_translation/results/multi-domain/'s 4-domain
  // macro statistics. Defaults to the original hardcoded path.
  const RESULTS_ROOT = path.resolve(process.cwd(), arg("resultsDir", DEFAULT_RESULTS_ROOT));

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

  // Issue #133/E4: a degraded run (real API errors and/or a context-
  // compaction event -- computeOperationalStats's own gate) is excluded
  // from the macro statistics by default, the same "run-validity gate" the
  // audit asked for, rather than silently averaged in at full weight next
  // to clean runs. Still listed in runs.csv either way (E4's own "do not
  // aggregate away individual runs" discipline) -- only the macro rollup
  // below is affected. --include-degraded overrides this explicitly.
  const includeDegraded = flag("include-degraded");
  const degradedRows = rows.filter((r) => r.degraded);
  const macroRows = includeDegraded ? rows : rows.filter((r) => !r.degraded);
  if (degradedRows.length && !includeDegraded) {
    console.error(`Warning: ${degradedRows.length} degraded run(s) excluded from macro statistics (pass --include-degraded to include them): `
      + degradedRows.map((r) => `${r.domain}/${r.replicate}`).join(", "));
  }
  if (macroRows.length === 0) {
    console.error("Every completed run is degraded and --include-degraded was not passed -- nothing left to summarize.");
    process.exit(1);
  }

  // Per-domain aggregates (mean +/- stdev across that domain's replicates),
  // next to translation quality. Ground-truth sizes come straight off the
  // first available run's metrics.json (identical across replicates of the
  // same domain, since it's the same reference.domain.yaml every time).
  const domainAgg = {};
  for (const domain of domains) {
    const domainRows = macroRows.filter((r) => r.domain === domain);
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
      // Issue #133/E6: controlled-value fidelity, reported next to the gold
      // controlled-value-property count it was actually computed from --
      // fidelity numbers are not comparable across domains/runs with wildly
      // different controlled-value-property counts without this.
      controlledValueFidelityFull: { mean: mean(col("controlledValueFidelityFull")), stdev: stdev(col("controlledValueFidelityFull")) },
      controlledValuePropertyGoldTotal: domainRows[0].controlledValuePropertyGoldTotal ?? null,
      classesScopedF1: { mean: mean(col("classesScopedF1")), stdev: stdev(col("classesScopedF1")) },
      recoveryEffectivenessScoped: { mean: mean(col("recoveryEffectivenessScoped")), stdev: stdev(col("recoveryEffectivenessScoped")) },
      // Issue #133/N7c (independent audit of this same fix): a semantic
      // judging failure (e.g. E1's new truncation throw) drops
      // semanticMetrics to null for that run, which mean()/stdev() already
      // correctly exclude from the average -- but with no visible n, a
      // reader has no way to tell a mean computed from all 3 replicates
      // apart from one computed from just 1, after 2 silently failed.
      // Exposed here for every semantic dimension, not only classes.
      semanticClassesFullF1: withN(col("semanticClassesFullF1"), domainRows.length),
      semanticRelationshipsFullF1: withN(col("semanticRelationshipsFullF1"), domainRows.length),
      semanticPropertiesFullF1: withN(col("semanticPropertiesFullF1"), domainRows.length),
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

  // Issue #133/E7 (external audit): a macro F1 reported with no sense of how
  // many actual ground-truth elements it was ever computed over reads as
  // more solid than a genuinely tiny denominator (e.g. a domain with 4 gold
  // rules) supports. Sums each dimension's real gold element count across
  // every contributing domain and flags the total when it falls below a
  // declared floor, rather than silently presenting every dimension's F1 at
  // the same apparent confidence.
  const MIN_GOLD_SUPPORT_N = 10;
  const GOLD_SUPPORT_DIMENSION = {
    classesFullF1: "classes", classesScopedF1: "classes",
    relationshipsFullF1: "relationships", propertiesFullF1: "properties",
    rulesF1: "rules", actionsIdentificationF1: "actions",
  };
  const goldSupportFor = (key) => {
    const dim = GOLD_SUPPORT_DIMENSION[key];
    if (!dim) return null; // composite metrics (recoveryEffectiveness*) span multiple dimensions -- no single gold n
    return domainList.reduce((a, d) => a + (domainAgg[d].groundTruthTotals[dim] || 0), 0);
  };
  const macroStats = {
    classesFullF1: macro("classesFullF1"),
    relationshipsFullF1: macro("relationshipsFullF1"),
    propertiesFullF1: macro("propertiesFullF1"),
    recoveryEffectivenessFull: macro("recoveryEffectivenessFull"),
    controlledValueFidelityFull: macro("controlledValueFidelityFull"),
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
    const dRows = macroRows.filter((r) => r.domain === d);
    return { domain: d, propRecall: mean(dRows.map((r) => r.propertiesFullRecall)), classRecall: mean(dRows.map((r) => r.classesFullRecall)) };
  });
  const propUnderElicitedCount = propRecallVsClassRecall.filter((r) => r.propRecall < r.classRecall).length;

  const elementConsistency = ["classesFullF1", "relationshipsFullF1", "propertiesFullF1", "rulesF1", "actionsIdentificationF1"]
    .map((key) => ({ key, mean: macroStats[key] ? macroStats[key].mean : mean(domainList.map((d) => domainAgg[d][key].mean)), stdev: macroStats[key] ? macroStats[key].stdev : stdev(domainList.map((d) => domainAgg[d][key].mean)) }))
    .filter((e) => e.mean !== null)
    // stdev is now null (not 0) when only one domain contributed -- treat
    // that as "no penalty" for ranking purposes only; the stored/reported
    // stdev field itself stays null, this ?? 0 never leaks into output.
    .sort((a, b) => (b.mean - (b.stdev ?? 0)) - (a.mean - (a.stdev ?? 0)));

  const crossDomainAnalysis = {
    consistentlyRecoveredElements: elementConsistency.map((e) => ({ element: e.key, macroMeanF1: e.mean, macroStdevF1: e.stdev })),
    relationshipsHarderThanClasses: { perDomain: relVsClass, domainsWhereHarder: relHarderCount, ofDomains: relVsClass.length,
      conclusion: relHarderCount === relVsClass.length ? "yes, in every domain" : relHarderCount === 0 ? "no, not in any domain" : `mixed -- harder in ${relHarderCount}/${relVsClass.length} domains` },
    propertiesUnderElicited: { perDomain: propRecallVsClassRecall, domainsWhereUnder: propUnderElicitedCount, ofDomains: propRecallVsClassRecall.length,
      conclusion: propUnderElicitedCount === propRecallVsClassRecall.length ? "yes, in every domain" : propUnderElicitedCount === 0 ? "no, not in any domain" : `mixed -- under-elicited in ${propUnderElicitedCount}/${propRecallVsClassRecall.length} domains` },
    domainAbstractionLevel: {
      note: "Abstraction level has no numeric proxy in this benchmark's own metrics -- reading the per-domain F1s in domain-comparison.csv against each domain's known character (brick-hvac: concrete physical equipment graph; iof-maintenance/iof-supply-chain: process- and event-centric industrial ontologies; fibo-loans: abstract financial/regulatory concepts) is left to the reader rather than asserted here.",
    },
    ontologySizeVsRecovery: { pearsonR: sizeVsF1.r, n: sizeVsF1.n, ci95: sizeVsF1.ci95, perDomain: domainList.map((d) => ({ domain: d, size: sizeOf(d), recoveryEffectivenessFull: domainAgg[d].recoveryEffectivenessFull.mean })),
      conclusion: correlationConclusion(sizeVsF1, "larger domains recovered worse (negative correlation)", "larger domains recovered better (positive correlation)") },
    translationStabilityVsElicitation: { pearsonR: stabilityVsF1.r, n: stabilityVsF1.n, ci95: stabilityVsF1.ci95,
      conclusion: correlationConclusion(stabilityVsF1, "more stable translations elicited worse (negative correlation)", "more stable translations elicited better (positive correlation)") },
    interviewerChangeGeneralization: {
      note: "Not applicable to this run -- every domain and replicate used the same single interviewer model/deployment. Answering this question requires a follow-up run holding domains fixed and varying the interviewer model, which is out of scope for this pass.",
    },
  };

  fs.mkdirSync(RESULTS_ROOT, { recursive: true });

  const summaryJson = {
    schemaVersion: 1, generatedAt: new Date().toISOString(),
    domains, runs, missingRuns: missing,
    degradedRuns: degradedRows.map((r) => `${r.domain}/${r.replicate}`), includeDegraded,
    runs_detail: rows,
    perDomain: domainAgg,
    macro: macroStats,
    // Issue #133/E7: the aggregate gold-element denominator behind each
    // macro F1 above, and the floor below which this report flags it as low
    // support -- see goldSupportFor()'s own comment.
    macroGoldSupportN: Object.fromEntries(Object.keys(macroStats).map((k) => [k, goldSupportFor(k)])),
    minGoldSupportN: MIN_GOLD_SUPPORT_N,
    crossDomainAnalysis,
  };
  fs.writeFileSync(path.join(RESULTS_ROOT, "summary.json"), `${JSON.stringify(summaryJson, null, 2)}\n`);

  const runsCsvColumns = [
    "domain", "replicate", "degraded", "totalErrorTurns", "compactionEvents", "semanticJudgingSucceeded",
    "model", "turnsUsed", "stoppedReason", "wallClockSec", "appAgentApiCalls", "applyToolCalls", "totalTokens",
    "classesFullF1", "classesFullRecall", "classesFullPrecision", "relationshipsFullF1", "propertiesFullF1", "propertiesFullRecall",
    "controlledValueFidelityFull", "controlledValuePropertyGoldTotal", "controlledValuePropertyMatchedCount",
    "recoveryEffectivenessFull", "recoveryEffectivenessWithFidelityFull",
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
  if (degradedRows.length) {
    md.push(`\n**${degradedRows.length} degraded run(s)** (real API errors and/or a context-compaction event -- issue #133/E4) `
      + `${includeDegraded ? "included in macro statistics (--include-degraded was passed)" : "excluded from macro statistics"}: `
      + `${degradedRows.map((r) => `${r.domain}/${r.replicate}`).join(", ")}`);
  }
  md.push("", "## Macro statistics (equal weight per domain, per #111's own methodology)", "");
  md.push(`| Metric | Macro mean F1 | Macro stdev (dispersion) | Domains | Gold support (Σ ground-truth elements, floor n≥${MIN_GOLD_SUPPORT_N}) |`, "|---|---|---|---|---|");
  for (const [key, label] of [
    ["classesFullF1", "Classes (full domain)"], ["relationshipsFullF1", "Relationships (full domain)"], ["propertiesFullF1", "Properties (full domain)"],
    ["recoveryEffectivenessFull", "Composite recovery effectiveness (full)"],
    ["classesScopedF1", "Classes (practical scope)"], ["recoveryEffectivenessScoped", "Composite recovery effectiveness (scoped)"],
    ["rulesF1", "Rules"], ["actionsIdentificationF1", "Actions (identification)"],
  ]) {
    const s = macroStats[key];
    const n = goldSupportFor(key);
    const supportCell = n === null ? "n/a (composite)" : n < MIN_GOLD_SUPPORT_N ? `**${n} (low support)**` : String(n);
    md.push(`| ${label} | ${fmt(s.mean)} | ${fmt(s.stdev)} | ${s.domains} | ${supportCell} |`);
  }

  // Issue #133/E19 (external audit): "practical scope" is calibrated
  // differently for classes than for properties (whole-phrase substring
  // with any alias vs. all-content-tokens overlap -- see
  // tests/evals/README.md's own "Full domain vs. practical scope" section
  // for the full reasoning), which the audit found undocumented anywhere a
  // reader of just this published report would see it. Stated explicitly
  // here rather than only in source comments.
  md.push(
    "",
    "## Methodology notes",
    "",
    "**Practical-scope calibration is not the same rule for every dimension.** " +
      "A class enters practical scope when its label or an alias appears as a " +
      "whole phrase in the domain's own competency-question/action corpus; a " +
      "property enters practical scope only when *every* content word of its " +
      "own label appears *somewhere* in that same corpus (a more forgiving " +
      "test, since natural competency questions never contain a \"has X\"-style " +
      "predicate label verbatim). The two are not directly comparable measures " +
      "of the same thing -- see `tests/evals/README.md`'s \"Full domain vs. " +
      "practical scope\" section for the full reasoning and the fixture-level " +
      "numbers that motivated the difference.",
  );

  md.push("", "## Per-domain results (mean +/- stdev across replicates; gold n = ground-truth element count that dimension's recall/precision was computed against)", "");
  md.push("| Domain | Replicates | Classes F1 (gold n) | Relationships F1 (gold n) | Properties F1 (gold n) | Recovery effectiveness | Rules F1 (gold n) | Actions F1 (gold n) |", "|---|---|---|---|---|---|---|---|");
  const goldN = (n) => n < MIN_GOLD_SUPPORT_N ? `**n=${n}**` : `n=${n}`;
  for (const d of domainList) {
    const a = domainAgg[d];
    const g = a.groundTruthTotals;
    md.push(`| ${d} | ${a.replicates} | ${fmt(a.classesFullF1.mean)} ± ${fmt(a.classesFullF1.stdev)} (${goldN(g.classes)}) | ${fmt(a.relationshipsFullF1.mean)} ± ${fmt(a.relationshipsFullF1.stdev)} (${goldN(g.relationships)}) `
      + `| ${fmt(a.propertiesFullF1.mean)} ± ${fmt(a.propertiesFullF1.stdev)} (${goldN(g.properties)}) | ${fmt(a.recoveryEffectivenessFull.mean)} ± ${fmt(a.recoveryEffectivenessFull.stdev)} `
      + `| ${fmt(a.rulesF1.mean)} (${goldN(g.rules)}) | ${fmt(a.actionsIdentificationF1.mean)} (${goldN(g.actions)}) |`);
  }

  // Issue #133/N7c (independent audit of this same fix): a semantic
  // judging failure (E1's new truncation throw, among other causes) drops
  // a run's semanticMetrics to null without marking the whole run
  // degraded -- the heuristic scoring stays perfectly valid. That means a
  // semantic mean here can legitimately be computed from fewer replicates
  // than the heuristic figures above; "n" makes that explicit instead of
  // presenting every semantic figure at the same apparent confidence.
  md.push("", "## Semantic (LLM-judged) scoring (n = replicates whose semantic judging actually succeeded, out of replicates attempted)", "");
  md.push("| Domain | Classes F1 | Relationships F1 | Properties F1 |", "|---|---|---|---|");
  for (const d of domainList) {
    const a = domainAgg[d];
    const semN = (s) => `n=${s.n}/${s.attemptedCount}`;
    md.push(`| ${d} | ${fmt(a.semanticClassesFullF1.mean)} ± ${fmt(a.semanticClassesFullF1.stdev)} (${semN(a.semanticClassesFullF1)}) `
      + `| ${fmt(a.semanticRelationshipsFullF1.mean)} ± ${fmt(a.semanticRelationshipsFullF1.stdev)} (${semN(a.semanticRelationshipsFullF1)}) `
      + `| ${fmt(a.semanticPropertiesFullF1.mean)} ± ${fmt(a.semanticPropertiesFullF1.stdev)} (${semN(a.semanticPropertiesFullF1)}) |`);
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
  md.push("", `**Does ontology size affect recovery?** Pearson r = ${fmt(crossDomainAnalysis.ontologySizeVsRecovery.pearsonR, 2)} (n=${crossDomainAnalysis.ontologySizeVsRecovery.n}, 95% CI ${fmtCi(crossDomainAnalysis.ontologySizeVsRecovery.ci95)}) -- ${crossDomainAnalysis.ontologySizeVsRecovery.conclusion}.`);
  for (const r of crossDomainAnalysis.ontologySizeVsRecovery.perDomain) md.push(`- ${r.domain}: ${r.size} total ground-truth elements, recovery effectiveness ${fmt(r.recoveryEffectivenessFull)}`);
  md.push("", `**Does translation stability correlate with elicitation score?** Pearson r = ${fmt(crossDomainAnalysis.translationStabilityVsElicitation.pearsonR, 2)} (n=${crossDomainAnalysis.translationStabilityVsElicitation.n}, 95% CI ${fmtCi(crossDomainAnalysis.translationStabilityVsElicitation.ci95)}) -- ${crossDomainAnalysis.translationStabilityVsElicitation.conclusion}.`);
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
