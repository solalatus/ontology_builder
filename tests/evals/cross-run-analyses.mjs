// SET-LEVEL STABILITY AND ENDPOINT-CONDITIONED RELATIONSHIP RECOVERY
//
//   node tests/evals/cross-run-analyses.mjs run-01 run-02 run-03
//
// Two analyses over a set of saved runs, both fully offline (no model calls,
// stored judge verdicts replayed as-is) and both answering questions the
// per-run metric tables cannot:
//
// 1. SET-LEVEL STABILITY. Per-run recall says how *much* was recovered, never
//    *whether the same things* were. Two runs at 60% recall could agree
//    completely or overlap barely at all. This reports, per dimension, how
//    many distinct gold items were recovered by at least one run, how many by
//    every run, and the pairwise Jaccard overlap of the per-run recovered
//    sets. A dimension whose per-run numbers look stable while its Jaccard
//    overlap is low is not stable in any sense that matters.
//
// 2. ENDPOINT-CONDITIONED RELATIONSHIP RECOVERY. Relationship matching
//    consumes the class-level assignment, so a gold relationship whose
//    endpoint classes were never recovered was never reachable: part of the
//    raw relationship deficit is really a class deficit reported twice. This
//    restricts the gold relationship denominator to relationships whose
//    *both* endpoints the run did recover, and reports recovery against that
//    achievable subset. Whatever gap survives this conditioning is a genuine
//    relationship-elicitation deficit, not endpoint gating.
//
// Both use the semantic (heuristic + replayed judge) pass and the practical
// scope by default -- the reading the paper reports -- and both scopes and
// policies are available via flags:
//
//   --scope=full|practical   (default practical)
//   --policy=semantic|heuristic (default semantic)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeHeuristicMatchPairs, computeMatchDetail } from "./lib/recoveryMetrics.mjs";
import { oneToOneMatchedIds, resolvePropertyJudgments } from "./lib/llmMatcher.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.join(__dirname, "results", "runs");

// The gold ids each run recovered, per dimension: the deterministic
// assignment, plus -- under the semantic policy -- whatever the stored judge
// verdicts additionally confirmed about items that assignment left unmatched.
// Same layering rule the metrics use: the judge only ever adds.
export function recoveredGoldIds(gold, state, savedJudgments, policy) {
  const heuristic = computeHeuristicMatchPairs(gold, state);
  const ids = {
    classes: new Set(heuristic.classes.map((m) => m.goldId)),
    relationships: new Set(heuristic.relationships.map((m) => m.goldId)),
    properties: new Set(heuristic.properties.map((m) => m.goldId)),
  };
  if (policy !== "semantic" || !savedJudgments) return ids;

  const detail = computeMatchDetail(gold, state);
  const unmatched = (list) => new Set(list.map((g) => g.id));
  const only = (judgments, allowed) => (judgments || []).filter((j) => allowed.has(j.goldId));
  for (const id of oneToOneMatchedIds(only(savedJudgments.classes, unmatched(detail.classes.unmatchedGold))).goldIds) ids.classes.add(id);
  for (const id of oneToOneMatchedIds(only(savedJudgments.relationships, unmatched(detail.relationships.unmatchedGold))).goldIds) ids.relationships.add(id);
  for (const id of resolvePropertyJudgments(only(savedJudgments.properties, unmatched(detail.properties.unmatchedGold)), detail.properties).goldIds) ids.properties.add(id);
  return ids;
}

function jaccard(a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 1;
}

// `condition` selects a comparison condition's directory under
// results/baselines/ instead of the interactive runs (EXPERIMENT_BRIEF.md §6:
// "Extend it for new conditions rather than forking it"). A condition has no
// stored judge verdicts of its own -- the judge was asked about the
// *interactive* runs' near-misses -- so it is only ever read under the
// heuristic policy, enforced at the call site below (§4.5).
export function loadRun(runId, scopeName, condition = null) {
  const dir = condition
    ? path.join(__dirname, "results", "baselines", condition, runId)
    : path.join(RUNS_DIR, runId);
  const { state } = recoveredStateFromYaml(fs.readFileSync(path.join(dir, "recovered-model.yaml"), "utf8"));
  const judgmentsPath = path.join(dir, "semantic-judgments.json");
  const saved = fs.existsSync(judgmentsPath) ? JSON.parse(fs.readFileSync(judgmentsPath, "utf8")) : null;
  const key = scopeName === "full" ? "fullDomain" : "scoped";
  return { runId, state, judgments: saved && saved[key] && saved[key].judgments };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const scopeName = (args.find((a) => a.startsWith("--scope=")) || "--scope=practical").split("=")[1];
  const conditionArg = args.find((a) => a.startsWith("--condition="));
  const condition = conditionArg ? conditionArg.split("=")[1] : null;
  // A condition defaults to (and is restricted to) the heuristic policy: its
  // near-misses are not the ones the stored judge verdicts cover.
  const policy = (args.find((a) => a.startsWith("--policy=")) || (condition ? "--policy=heuristic" : "--policy=semantic")).split("=")[1];
  const runIds = args.filter((a) => !a.startsWith("--"));
  if (!runIds.length) {
    console.error("Usage: node tests/evals/cross-run-analyses.mjs [--scope=full|practical] [--policy=semantic|heuristic] [--condition=<name>] <run-id> [...]");
    console.error("Example: node tests/evals/cross-run-analyses.mjs run-01 run-02 run-03");
    process.exit(1);
  }
  if (condition && policy === "semantic") {
    console.error(`--condition=${condition} cannot be read under --policy=semantic: the stored judge verdicts were`);
    console.error("asked about the interactive runs' near-misses, not this condition's (EXPERIMENT_BRIEF.md §4.5).");
    process.exit(1);
  }

  const full = loadGroundTruthModel();
  const gold = scopeName === "full" ? full : scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
  const runs = runIds.map((id) => {
    const r = loadRun(id, scopeName, condition);
    return { runId: id, ids: recoveredGoldIds(gold, r.state, r.judgments, policy) };
  });

  console.log(`Source: ${condition || "interactive runs"}. Scope: ${scopeName}. Policy: ${policy}. Offline -- no model calls; stored judge verdicts replayed as-is.\n`);

  console.log("=== Set-level stability ===");
  console.log("dimension       gold   >=1 run   all runs   pairwise Jaccard");
  const dims = [["classes", Object.keys(gold.classes).length], ["relationships", gold.relationships.length], ["properties", gold.properties.length]];
  for (const [dim, goldTotal] of dims) {
    const sets = runs.map((r) => r.ids[dim]);
    const union = new Set(sets.flatMap((s) => [...s]));
    const intersection = new Set([...union].filter((id) => sets.every((s) => s.has(id))));
    const pairwise = [];
    for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) pairwise.push(jaccard(sets[i], sets[j]));
    const range = pairwise.length ? `${Math.min(...pairwise).toFixed(2)}-${Math.max(...pairwise).toFixed(2)}` : "n/a";
    console.log(`${dim.padEnd(15)} ${String(goldTotal).padStart(4)}   ${String(union.size).padStart(7)}   ${String(intersection.size).padStart(8)}   ${range}`);
  }

  console.log("\n=== Endpoint-conditioned relationship recovery ===");
  console.log("Gold relationships restricted to those whose BOTH endpoint classes the run recovered.");
  console.log("run       eligible   recovered   rate");
  for (const { runId, ids } of runs) {
    let eligible = 0, recovered = 0;
    for (const rel of gold.relationships) {
      if (!ids.classes.has(rel.fromClassId) || !ids.classes.has(rel.toClassId)) continue;
      eligible++;
      if (ids.relationships.has(rel.id)) recovered++;
    }
    const rate = eligible ? `${((recovered / eligible) * 100).toFixed(0)}%` : "n/a";
    console.log(`${runId.padEnd(9)} ${String(eligible).padStart(8)}   ${String(recovered).padStart(9)}   ${rate.padStart(4)}`);
  }
  console.log("\nA rate well below 100% means endpoint gating does not account for the relationship");
  console.log("deficit on its own: those relationships were reachable and still were not elicited.");
}
