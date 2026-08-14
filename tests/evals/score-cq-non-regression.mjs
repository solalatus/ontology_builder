// SCORES ISSUE #94'S TWO-ARM NON-REGRESSION EVALUATION
//
//   node tests/evals/score-cq-non-regression.mjs run-01 [run-02 ...]
//
// Fully offline: no model calls. Reads each arm's recovered-model.yaml under
// results/baselines/competency-questions/{control,treatment}/<run-id>/ and
// scores both with the same deterministic one-to-one scorer, the same fixture,
// and the same two denominators the interactive runs use.
//
// WHY THIS IS NOT score-baseline.mjs
// ----------------------------------
// That script answers "how does condition X compare to the three published
// interactive anchor runs?" — the right question for a comparison condition.
// This one answers a different question with a different comparison surface:
// control arm vs treatment arm, both freshly run in this same environment on
// the same model, because the anchors were produced on a model this
// environment cannot reach (see cq-non-regression.mjs's header). It reuses that
// script's own `recoveredStateFromYaml` rather than re-deriving the YAML → state
// mapping, so the two cannot drift apart in how they read a recovered model.
//
// WHAT A RESULT MEANS
// -------------------
// The measured quantity is ontology recovery, identically for both arms. The
// treatment arm additionally records competency questions; the control arm
// structurally cannot, so that count is reported as description and is NOT part
// of any score. Two live LLMs are talking to each other, so a small delta in
// either direction is noise, not signal — the question this answers is whether
// the rewritten interviewer *degrades* recovery, and the honest reading is
// stated at the bottom of the output.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./lib/recoveryMetrics.mjs";
import { recoveredStateFromYaml } from "./score-baseline.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "results", "baselines", "competency-questions");
const ARMS = ["control", "treatment"];

const runIds = process.argv.slice(2);
if (!runIds.length) {
  console.error("Usage: node tests/evals/score-cq-non-regression.mjs <run-id> [...]");
  process.exit(1);
}

const full = loadGroundTruthModel();
const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
const pct = (x) => `${(x * 100).toFixed(0)}%`;

const rows = [];
for (const runId of runIds) {
  const arms = {};
  let missing = false;
  for (const arm of ARMS) {
    const modelPath = path.join(ROOT, arm, runId, "recovered-model.yaml");
    if (!fs.existsSync(modelPath)) {
      console.error(`${arm}/${runId}: no recovered-model.yaml at ${path.relative(process.cwd(), modelPath)} — run it first`);
      missing = true;
      continue;
    }
    const provenancePath = path.join(ROOT, arm, runId, "baseline-provenance.json");
    const provenance = fs.existsSync(provenancePath) ? JSON.parse(fs.readFileSync(provenancePath, "utf8")) : {};
    const { state, droppedEdges } = recoveredStateFromYaml(fs.readFileSync(modelPath, "utf8"));
    arms[arm] = { state, droppedEdges, provenance };
  }
  if (missing) continue;
  for (const [scopeLabel, gold] of [["full", full], ["practical", scoped]]) {
    rows.push({
      runId, scopeLabel,
      control: computeRecoveryMetrics(gold, arms.control.state),
      treatment: computeRecoveryMetrics(gold, arms.treatment.state),
    });
  }
  console.log(`\n${runId} provenance`);
  for (const arm of ARMS) {
    const p = arms[arm].provenance;
    console.log(`  ${arm.padEnd(9)} model=${p.model} prompt=${String(p.interviewerPromptSha256).slice(0, 12)} `
      + `turns=${p.turnsUsed} stopped=${p.stoppedReason} applies=${p.applyToolCalls} `
      + `cqs=${p.competencyQuestionsRecorded ?? 0} droppedEdges=${arms[arm].droppedEdges}`);
  }
}

console.log("\nOntology recovery against tests/evals/fixtures/itops_mtsr.yaml — deterministic");
console.log("one-to-one scorer, identical for both arms. Competency questions are NOT scored here.\n");
console.log("run      scope      dimension            control   treatment   delta");
for (const { runId, scopeLabel, control, treatment } of rows) {
  for (const [dim, key] of [["class", "classes"], ["relationship", "relationships"], ["property", "properties"]]) {
    const c = control[key].f1, t = treatment[key].f1;
    const delta = (t - c) * 100;
    const sign = delta > 0 ? "+" : "";
    console.log(
      `${runId}  ${scopeLabel.padEnd(9)}  ${(dim + " (F1)").padEnd(19)}  ${pct(c).padStart(7)}   ${pct(t).padStart(9)}   ${sign}${delta.toFixed(1)} pts`
    );
  }
  const cComposite = control.recoveryEffectiveness, tComposite = treatment.recoveryEffectiveness;
  const delta = (tComposite - cComposite) * 100;
  console.log(
    `${runId}  ${scopeLabel.padEnd(9)}  ${"composite".padEnd(19)}  ${pct(cComposite).padStart(7)}   ${pct(tComposite).padStart(9)}   ${delta > 0 ? "+" : ""}${delta.toFixed(1)} pts`
  );
}

console.log("\nReading: a delta at or above zero means the rewritten interviewer recovered at least");
console.log("as much of the domain as the one it replaced. A small negative delta is within the");
console.log("run-to-run variance two live models produce and is not by itself a regression; a");
console.log("large, consistent negative delta across dimensions and scopes would be.");
