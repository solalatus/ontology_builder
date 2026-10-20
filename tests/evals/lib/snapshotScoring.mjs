// ONE SNAPSHOT, SCORED (issue #182)
//
// Every snapshot -- a paired-stage snapshot, the wrap-up of an interview, or
// a baseline's extracted model -- is scored the same way: from its own
// recovered-model.yaml (the path rescore-saved-run.mjs takes), heuristic on
// both denominators, with its own judge verdicts stored beside it, rules and
// actions, and an offline replay of the saved files as a check that it
// reproduces the live numbers. Moved here from run-multi-domain-benchmark.mjs
// unchanged, so the baseline runner (run-baseline-b1.mjs) scores on exactly
// the same code path.
import fs from "node:fs";
import path from "node:path";
import { computeRecoveryMetrics, computeHeuristicMatchPairs, computeRuleMetrics, computeActionMetrics } from "./recoveryMetrics.mjs";
import { computeSemanticRecoveryMetrics, computeSemanticRuleActionMetrics } from "./llmMatcher.mjs";
import { writeHeuristicMatches, writeSemanticJudgments, writeSemanticMatches } from "./reportGenerator.mjs";
import { recoveredStateFromYaml } from "../score-baseline.mjs";
import { rescoreRun } from "../rescore-saved-run.mjs";

/**
 * Scores `snap.yamlText` into `dir` (which must already hold it as
 * recovered-model.yaml, for the offline replay) and writes dir/metrics.json.
 * Returns the metrics entry.
 */
export async function scoreSnapshot({ snap, dir, domain, groundTruth, scopedGroundTruth, apiKey, model, chat, logError = console.error, label = domain }) {
  const { state, droppedEdges } = recoveredStateFromYaml(snap.yamlText);
  const sm = computeRecoveryMetrics(groundTruth, state);
  const ssm = computeRecoveryMetrics(scopedGroundTruth, state);
  writeHeuristicMatches(computeHeuristicMatchPairs(groundTruth, state), { dir });
  let sem = null, semScoped = null, semRuleAction = null;
  try {
    sem = await computeSemanticRecoveryMetrics({ groundTruth, recoveredState: state, apiKey, model, chat });
    semScoped = await computeSemanticRecoveryMetrics({ groundTruth: scopedGroundTruth, recoveredState: state, apiKey, model, chat });
    semRuleAction = await computeSemanticRuleActionMetrics({ groundTruth, recoveredState: state, apiKey, model, chat });
  } catch (err) {
    logError(`${label}: semantic judge pass failed on snapshot ${snap.label}, heuristic only: ${String((err && err.message) || err)}`);
    sem = null; semScoped = null; semRuleAction = null;
  }
  writeSemanticJudgments({ fullDomain: sem, scoped: semScoped }, { dir });
  writeSemanticMatches({ fullDomain: sem, scoped: semScoped }, { dir });
  const counts = {
    classes: state.nodes.length,
    relationships: state.edges.length,
    properties: state.nodes.reduce((n, x) => n + x.properties.length, 0),
    allowedValueLists: state.nodes.reduce((n, x) => n + x.properties.filter((pr) => (pr.allowed || []).length > 0).length, 0),
    rules: state.rules.length,
    actions: state.actions.length,
    droppedEdges,
  };
  const replay = rescoreRun(dir, domain);
  const same = (a, b) => (a === null || a === undefined || b === null || b === undefined ? a == b : Math.abs(a - b) < 1e-9);
  const offlineRescoreAgrees = same(replay.heuristic.full.recoveryEffectiveness, sm.recoveryEffectiveness)
    && same(replay.heuristic.practical.recoveryEffectiveness, ssm.recoveryEffectiveness)
    && same(replay.semantic.full && replay.semantic.full.recoveryEffectiveness, sem && sem.recoveryEffectiveness);
  if (!offlineRescoreAgrees) logError(`${label}: WARNING snapshot ${snap.label}: the offline rescore does not reproduce the live score`);
  const entry = {
    label: snap.label, turn: snap.turn, stage: snap.stage, elapsedSec: snap.elapsedSec, counts,
    metrics: sm, scopedMetrics: ssm, semanticMetrics: sem, semanticScopedMetrics: semScoped,
    ruleMetrics: computeRuleMetrics(groundTruth, state.rules || []), actionMetrics: computeActionMetrics(groundTruth, state),
    semanticRuleActionMetrics: semRuleAction, offlineRescoreAgrees,
  };
  fs.writeFileSync(path.join(dir, "metrics.json"), `${JSON.stringify(entry, null, 2)}\n`);
  return entry;
}
