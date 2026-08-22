// RE-SCORES A SAVED RUN OFFLINE, WITH NO MODEL CALLS
//
//   node tests/evals/rescore-saved-run.mjs <run-dir> [...]
//   node tests/evals/rescore-saved-run.mjs results/runs/run-01 results/runs/run-02 results/runs/run-03
//
// Reads a run directory's persisted artifacts -- recovered-model.yaml, and
// semantic-judgments.json when present -- and recomputes every metric with
// the current scorer, on both denominators, under both matching policies.
// Nothing is written; nothing under results/ is touched.
//
// This is what makes a scoring fix applicable to runs that already happened.
// A transcript and a recovered model are facts about a run; the numbers over
// them are a function of the scorer, and when the scorer is corrected the
// honest response is to re-derive the old runs' numbers rather than to
// re-run the interviews (which would be different interviews) or to leave a
// known-defective figure in place. Two defects have already been fixed this
// way: class-level many-to-one matching, then the analogous property-level
// one.
//
// WHAT IS NOT RE-DERIVED: the judge's verdicts. The semantic pass replays the
// stored ones (aggregateSemanticMetrics) and never asks a new question. Those
// verdicts are answers about the specific near-misses this run left, and they
// are as much a part of the run's record as its transcript. Re-judging would
// be a new measurement with its own cost and its own provenance, not a
// re-score -- EXPERIMENT_BRIEF.md §4.5 makes the same point about carrying a
// judge's verdicts across conditions. One consequence is visible and
// intended: if a scoring change leaves a gold item unmatched that the judge
// was never asked about, it stays unmatched, so a replayed semantic figure is
// conservative rather than optimistic.
//
// Re-scoring is metric-idempotent, not byte-identical (EXPERIMENT_BRIEF.md
// §7.6) -- run it twice and the numbers match, though a regenerated report
// would carry a new timestamp.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth, resolveDomainYamlPath, listAvailableDomains } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics, computeRuleMetrics, computeActionMetrics } from "./lib/recoveryMetrics.mjs";
import { aggregateSemanticMetrics } from "./lib/llmMatcher.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Issue #133/E3 (external audit): this used to always score against itops's
// own fixture (loadGroundTruthModel() zero-arg), silently -- pointed at a
// brick-hvac (or any non-itops) run, it would score an HVAC recovered model
// against IT-operations gold and print plausible near-zero numbers with no
// error at all. `domain` now selects the real ground truth
// (resolveDomainYamlPath + the "domain-yaml" loader format), defaulting to
// itops only for backward compatibility with the pre-#104 `results/runs/`
// anchors, which have no domain of their own to name. A run directory that
// looks like it's under `results/multi-domain/` (this repo's own multi-domain
// benchmark output, issue #111) refuses to run without an explicit `domain`
// -- exactly the run tree this mistake would otherwise silently corrupt.
//
// Issue #133/N4 (independent audit of this same fix): the original pattern
// required a trailing path separator right after "multi-domain" --
// `results/multi-domain-superseded-2026-08/...` (E9's own committed
// snapshot directory) never matched, verified live: `rescoreRun` on that
// directory with no `--domain` silently scored a real brick-hvac recovered
// model against itops's own 68-class fixture and printed a plausible-
// looking 0.000. No trailing separator required now, so any directory
// whose name merely STARTS WITH "multi-domain" under `results/` is caught.
export function rescoreRun(runDir, domain = null) {
  const modelPath = path.join(runDir, "recovered-model.yaml");
  if (!fs.existsSync(modelPath)) throw new Error(`no recovered-model.yaml in ${runDir}`);
  if (!domain && /results[\\/]multi-domain/.test(runDir)) {
    throw new Error(
      `${runDir} looks like a multi-domain benchmark run (results/multi-domain*/) but no --domain= was given -- `
      + `refusing to silently score it against itops's own fixture. Pass --domain=<id>. `
      + `Available domains: ${listAvailableDomains().join(", ")}`
    );
  }
  const { state, droppedEdges } = recoveredStateFromYaml(fs.readFileSync(modelPath, "utf8"));

  const full = domain ? loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath(domain) }) : loadGroundTruthModel();
  const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);

  const judgmentsPath = path.join(runDir, "semantic-judgments.json");
  const saved = fs.existsSync(judgmentsPath) ? JSON.parse(fs.readFileSync(judgmentsPath, "utf8")) : null;

  const out = { runDir, droppedEdges, heuristic: {}, semantic: {}, rules: {}, actions: {} };
  for (const [scopeKey, gold, savedKey] of [["full", full, "fullDomain"], ["practical", scoped, "scoped"]]) {
    out.heuristic[scopeKey] = computeRecoveryMetrics(gold, state);
    const judgments = saved && saved[savedKey] && saved[savedKey].judgments;
    out.semantic[scopeKey] = judgments
      ? aggregateSemanticMetrics({ groundTruth: gold, recoveredState: state, judgments })
      : null;
    // Rules/actions (issue #133/E3+E17): the heuristic pass only -- there is
    // no per-run-and-scope stored semantic rule/action judgment file to
    // replay the way classes/relationships/properties have, so this covers
    // what a re-score can actually re-derive from recovered-model.yaml alone.
    out.rules[scopeKey] = computeRuleMetrics(gold, state.rules || []);
    out.actions[scopeKey] = computeActionMetrics(gold, state);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rawArgs = process.argv.slice(2);
  const domainArg = rawArgs.find((a) => a.startsWith("--domain="));
  const domain = domainArg ? domainArg.split("=").slice(1).join("=") : null;
  const runDirs = rawArgs.filter((a) => !a.startsWith("--domain="));
  if (!runDirs.length) {
    console.error("Usage: node tests/evals/rescore-saved-run.mjs [--domain=<id>] <run-dir> [...]");
    console.error("Example: node tests/evals/rescore-saved-run.mjs tests/evals/results/runs/run-01");
    console.error("Example: node tests/evals/rescore-saved-run.mjs --domain=brick-hvac ontology_translation/results/multi-domain/run-01/brick-hvac");
    process.exit(1);
  }
  const pct = (x) => (x === null || x === undefined ? "  -- " : `${(x * 100).toFixed(1)}%`);
  console.log("Offline re-score with the current scorer. No model calls; stored judge verdicts replayed as-is.\n");
  console.log("run                policy     scope      class F1  rel F1   prop F1  val.fid  composite");
  for (const dir of runDirs) {
    const abs = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
    const r = rescoreRun(fs.existsSync(abs) ? abs : path.join(__dirname, dir), domain);
    const name = path.basename(r.runDir);
    for (const [policy, block] of [["heuristic", r.heuristic], ["semantic", r.semantic]]) {
      for (const scope of ["full", "practical"]) {
        const m = block[scope];
        if (!m) { console.log(`${name.padEnd(18)} ${policy.padEnd(10)} ${scope.padEnd(10)} (no stored judge verdicts)`); continue; }
        console.log(
          `${name.padEnd(18)} ${policy.padEnd(10)} ${scope.padEnd(10)} ${pct(m.classes.f1).padStart(8)}  ${pct(m.relationships.f1).padStart(6)}  ${pct(m.properties.f1).padStart(7)}  ${pct(m.controlledValueFidelity).padStart(7)}  ${pct(m.recoveryEffectiveness).padStart(9)}`
        );
      }
    }
    for (const scope of ["full", "practical"]) {
      const rules = r.rules[scope], actions = r.actions[scope];
      console.log(
        `${name.padEnd(18)} ${"heuristic".padEnd(10)} ${scope.padEnd(10)} rules F1 ${pct(rules.f1)} (${rules.matched}/${rules.groundTruthTotal})  `
        + `actions F1 ${pct(actions.identification.f1)} (${actions.identification.matched}/${actions.identification.groundTruthTotal})`
      );
    }
    if (r.droppedEdges) console.log(`${name.padEnd(18)} edges discarded for naming an undeclared endpoint class: ${r.droppedEdges}`);
  }
}
