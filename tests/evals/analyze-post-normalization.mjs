// OFFLINE ANALYSIS FOR THE post-normalization-v1 CONDITION
//
//   node tests/evals/analyze-post-normalization.mjs run-01 run-02 run-03
//
// Fully offline: no model calls. Reads the frozen anchor runs, the candidates
// written by post-normalization.mjs, and the stored verdicts written by
// judge-post-normalization.mjs, and applies the PRE-REGISTERED decision rule in
// POST_NORMALIZATION.md §5 mechanically. Writes results/baselines/
// post-normalization-v1/metrics.md, which is the file the report's tables are
// copied from -- so every number in the report is regenerable from committed
// artifacts without an API key, the same property the interactive runs have.
//
// The decision rule is applied by this script rather than by the person reading
// the numbers on purpose. It was committed before any result existed (see the
// git history of POST_NORMALIZATION.md), and encoding it here is what stops it
// from being quietly reinterpreted once the direction of the result is known.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./lib/recoveryMetrics.mjs";
import { CONDITION } from "./post-normalization.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.join(__dirname, "results", "runs");
const COND_DIR = path.join(__dirname, "results", "baselines", CONDITION);

const pct1 = (x) => (x * 100).toFixed(1);
const signed = (x) => `${x >= 0 ? "+" : ""}${x.toFixed(1)}`;
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// ---------------------------------------------------------------------------
// Deterministic recovery metrics, original vs normalized, both denominators.
// ---------------------------------------------------------------------------
export function collectMetrics(runIds) {
  const full = loadGroundTruthModel();
  const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
  const rows = [];
  for (const runId of runIds) {
    const original = recoveredStateFromYaml(fs.readFileSync(path.join(RUNS_DIR, runId, "recovered-model.yaml"), "utf8"));
    const normalized = recoveredStateFromYaml(fs.readFileSync(path.join(COND_DIR, runId, "recovered-model.yaml"), "utf8"));
    for (const [scope, gold] of [["full", full], ["practical", scoped]]) {
      rows.push({
        runId, scope,
        original: computeRecoveryMetrics(gold, original.state),
        normalized: computeRecoveryMetrics(gold, normalized.state),
        droppedEdgesOriginal: original.droppedEdges,
        droppedEdgesNormalized: normalized.droppedEdges,
      });
    }
  }
  return rows;
}

export function aggregateMetrics(rows) {
  const out = {};
  for (const scope of ["full", "practical"]) {
    out[scope] = {};
    for (const dim of ["classes", "relationships", "properties"]) {
      const scoped = rows.filter((r) => r.scope === scope);
      const o = mean(scoped.map((r) => r.original[dim].f1));
      const n = mean(scoped.map((r) => r.normalized[dim].f1));
      out[scope][dim] = { original: o, normalized: n, deltaPts: (n - o) * 100 };
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Judge aggregation, exactly as pre-registered (POST_NORMALIZATION.md §5).
// ---------------------------------------------------------------------------
const nonEmpty = (xs) => Array.isArray(xs) && xs.length > 0;

export function aggregateJudge(judgments, runIds) {
  const judgeModels = [...new Set(judgments.map((j) => j.judgeModel))].sort();
  const perRun = [];

  for (const runId of runIds) {
    const forRun = judgments.filter((j) => j.runId === runId);
    const perJudge = [];
    for (const judgeModel of judgeModels) {
      const pair = forRun.filter((j) => j.judgeModel === judgeModel);
      const primary = pair.find((j) => j.order === "primary");
      const reversed = pair.find((j) => j.order === "reversed");
      // A judge only "has a verdict" for a run when it survives the ordering
      // swap. Disagreement between the two orderings is position-following,
      // not content-following, and is recorded as unstable rather than being
      // averaged into a preference it never actually expressed.
      const stable = primary && reversed && primary.preferred === reversed.preferred;
      perJudge.push({
        judgeModel,
        primary: primary ? primary.preferred : null,
        reversed: reversed ? reversed.preferred : null,
        verdict: stable ? primary.preferred : "unstable",
        confidence: stable ? [primary.confidence, reversed.confidence] : [],
      });
    }

    const verdicts = perJudge.map((j) => j.verdict);
    const normalizedVotes = verdicts.filter((v) => v === "normalized").length;
    const originalVotes = verdicts.filter((v) => v === "original").length;
    let outcome = "tie";
    if (normalizedVotes > originalVotes && normalizedVotes >= 1 && originalVotes === 0) outcome = "normalized";
    else if (originalVotes > normalizedVotes && normalizedVotes === 0) outcome = "original";

    // Adverse-finding counts are over all four verdicts for the run, not only
    // the stable ones: an unstable judge still reported concrete defects, and
    // a defect is evidence regardless of which way its preference fell.
    const count = (field) => forRun.filter((j) => nonEmpty(j[field])).length;
    const total = forRun.length;
    perRun.push({
      runId, perJudge, outcome, total,
      materialRegressionsNormalized: count("material_regressions_normalized"),
      materialRegressionsOriginal: count("material_regressions_original"),
      unsupportedAdditionsNormalized: count("unsupported_additions_normalized"),
      unsupportedAdditionsOriginal: count("unsupported_additions_original"),
      competencyLossNormalized: count("competency_coverage_loss_normalized"),
      competencyLossOriginal: count("competency_coverage_loss_original"),
      // "materially worse in this run" = the run went to the original model, or
      // a majority of this run's verdicts (>= 3 of 4) named a material
      // regression in the normalized model.
      materiallyWorse: outcome === "original" || count("material_regressions_normalized") * 2 > total,
    });
  }

  const flips = [];
  for (const judgeModel of judgeModels) {
    const pairs = runIds.map((runId) => {
      const p = judgments.find((j) => j.runId === runId && j.judgeModel === judgeModel && j.order === "primary");
      const r = judgments.find((j) => j.runId === runId && j.judgeModel === judgeModel && j.order === "reversed");
      return p && r ? p.preferred === r.preferred : null;
    }).filter((x) => x !== null);
    flips.push({ judgeModel, pairs: pairs.length, flipped: pairs.filter((x) => !x).length });
  }

  // Inter-judge agreement over the runs where both judges were stable.
  const bothStable = perRun.filter((r) => r.perJudge.every((j) => j.verdict !== "unstable"));
  const agreeing = bothStable.filter((r) => new Set(r.perJudge.map((j) => j.verdict)).size === 1);

  return { judgeModels, perRun, flips, interJudge: { comparable: bothStable.length, agreeing: agreeing.length } };
}

// ---------------------------------------------------------------------------
// Structural-change accounting: what the normalizer actually did.
// ---------------------------------------------------------------------------
export function collectChanges(runIds) {
  return runIds.map((runId) => {
    const dir = path.join(COND_DIR, runId);
    const provenance = JSON.parse(fs.readFileSync(path.join(dir, "baseline-provenance.json"), "utf8"));
    const diff = JSON.parse(fs.readFileSync(path.join(dir, "normalization-diff.json"), "utf8"));
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, "change-manifest.json"), "utf8"));
    const byType = {};
    for (const entry of manifest) byType[entry.changeType || "unspecified"] = (byType[entry.changeType || "unspecified"] || 0) + 1;
    // Criterion §10.4: a rule or action that disappears without the manifest
    // claiming a deliberate removal is an accidental loss, not a normalization.
    const claimsRemoval = manifest.some((e) => /remove|merge|consolidat/i.test(`${e.changeType} ${e.summary}`));
    return {
      runId, provenance, diff, manifest, byType,
      rulesRemoved: diff.rules.removed.map((r) => r.name),
      actionsRemoved: diff.actions.removed.map((a) => a.name),
      unexplainedRemovals: (diff.rules.removed.length + diff.actions.removed.length) > 0 && !claimsRemoval,
      validation: provenance.validation,
      usage: provenance.usage,
    };
  });
}

// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const runIds = process.argv.slice(2);
  if (!runIds.length) {
    console.error("Usage: node tests/evals/analyze-post-normalization.mjs <run-id> [...]");
    process.exit(1);
  }

  const rows = collectMetrics(runIds);
  const agg = aggregateMetrics(rows);
  const changes = collectChanges(runIds);

  const judgePath = path.join(COND_DIR, "judge", "judgments.json");
  const judgeDoc = fs.existsSync(judgePath) ? JSON.parse(fs.readFileSync(judgePath, "utf8")) : null;
  const judge = judgeDoc ? aggregateJudge(judgeDoc.judgments, runIds) : null;

  const md = [];
  md.push(`# ${CONDITION} -- metrics`, "");
  md.push(`Generated by \`node tests/evals/analyze-post-normalization.mjs ${runIds.join(" ")}\`. Fully offline.`, "");
  md.push(`Original = the interactive anchor run's own ontology (\`results/runs/<run>/recovered-model.yaml\`).`);
  md.push(`Normalized = the candidate this condition produced from it.`, "");

  // -- deterministic metrics -------------------------------------------------
  md.push("## 1. Deterministic recovery metrics (heuristic pass, one-to-one scorer)", "");
  for (const scope of ["full", "practical"]) {
    md.push(`### ${scope === "full" ? "Full domain (68 classes / 108 relationships / 111 properties)" : "Practical scope (28 / 41 / 26)"}`, "");
    md.push("| Run | Dimension | Original P/R/F1 | Normalized P/R/F1 | ΔF1 (pts) |");
    md.push("|---|---|---|---|---|");
    for (const runId of runIds) {
      const r = rows.find((x) => x.runId === runId && x.scope === scope);
      for (const [label, dim] of [["classes", "classes"], ["relationships", "relationships"], ["properties", "properties"]]) {
        const o = r.original[dim], n = r.normalized[dim];
        md.push(`| ${runId} | ${label} | ${pct1(o.precision)} / ${pct1(o.recall)} / **${pct1(o.f1)}** | ${pct1(n.precision)} / ${pct1(n.recall)} / **${pct1(n.f1)}** | ${signed((n.f1 - o.f1) * 100)} |`);
      }
    }
    md.push("");
    md.push("| Aggregate (mean of 3 runs) | Original F1 | Normalized F1 | Δ (pts) |");
    md.push("|---|---|---|---|");
    for (const dim of ["classes", "relationships", "properties"]) {
      const a = agg[scope][dim];
      md.push(`| ${dim} | ${pct1(a.original)} | ${pct1(a.normalized)} | ${signed(a.deltaPts)} |`);
    }
    md.push("");
  }
  const dropped = rows.filter((r) => r.scope === "full" && (r.droppedEdgesOriginal || r.droppedEdgesNormalized));
  md.push(dropped.length
    ? `Edges discarded for naming an undeclared endpoint class: ${dropped.map((r) => `${r.runId} original ${r.droppedEdgesOriginal} / normalized ${r.droppedEdgesNormalized}`).join("; ")}.`
    : "No edge was discarded for naming an undeclared endpoint class, in either arm.");
  md.push("");

  // -- judge -----------------------------------------------------------------
  md.push("## 2. Blind transcript-grounded structural judge (primary endpoint)", "");
  if (!judge) {
    md.push("_No judgments.json found -- run `judge-post-normalization.mjs` first._", "");
  } else {
    md.push(`Judges: ${judge.judgeModels.join(", ")}. Every pair judged in both orderings; a judge's verdict for a run counts only if it survives the swap.`, "");
    md.push("| Run | " + judge.judgeModels.map((m) => `${m} (primary / reversed)`).join(" | ") + " | Run outcome | Materially worse? |");
    md.push("|---|" + judge.judgeModels.map(() => "---|").join("") + "---|---|");
    for (const r of judge.perRun) {
      const cells = judge.judgeModels.map((m) => {
        const j = r.perJudge.find((x) => x.judgeModel === m);
        return `${j.primary} / ${j.reversed}${j.verdict === "unstable" ? " (unstable)" : ""}`;
      });
      md.push(`| ${r.runId} | ${cells.join(" | ")} | **${r.outcome}** | ${r.materiallyWorse ? "YES" : "no"} |`);
    }
    md.push("");
    md.push("| Run | Material regressions (norm / orig) | Unsupported additions (norm / orig) | Competency loss (norm / orig) |");
    md.push("|---|---|---|---|");
    for (const r of judge.perRun) {
      md.push(`| ${r.runId} | ${r.materialRegressionsNormalized}/${r.total} vs ${r.materialRegressionsOriginal}/${r.total} | ${r.unsupportedAdditionsNormalized}/${r.total} vs ${r.unsupportedAdditionsOriginal}/${r.total} | ${r.competencyLossNormalized}/${r.total} vs ${r.competencyLossOriginal}/${r.total} |`);
    }
    md.push("");
    md.push(`Order-bias check: ${judge.flips.map((f) => `${f.judgeModel} flipped ${f.flipped}/${f.pairs}`).join("; ")}.`);
    md.push(`Inter-judge agreement: ${judge.interJudge.agreeing}/${judge.interJudge.comparable} runs where both judges were stable.`, "");
  }

  // -- what the normalizer did ----------------------------------------------
  md.push("## 3. What the normalizer actually changed (deterministic diff)", "");
  md.push("| Run | Total semantic changes | Classes +/-/~ | Relationships +/-/~/dir | Properties +/-/~ | Rules +/-/~ | Actions +/-/~ |");
  md.push("|---|---|---|---|---|---|---|");
  for (const c of changes) {
    const s = c.provenance.diffSummary;
    md.push(`| ${c.runId} | ${s.totalChanges} | ${s.classes.added}/${s.classes.removed}/${s.classes.changed} `
      + `| ${s.relationships.added}/${s.relationships.removed}/${s.relationships.changed}/${s.relationships.directionChanged} `
      + `| ${s.properties.added}/${s.properties.removed}/${s.properties.changed} `
      + `| ${s.rules.added}/${s.rules.removed}/${s.rules.changed} `
      + `| ${s.actions.added}/${s.actions.removed}/${s.actions.changed} |`);
  }
  md.push("");
  md.push("Change types the normalizer itself claimed (from its manifest -- rationale, not evidence):", "");
  const allTypes = [...new Set(changes.flatMap((c) => Object.keys(c.byType)))].sort();
  if (allTypes.length) {
    md.push("| Change type | " + runIds.join(" | ") + " |");
    md.push("|---|" + runIds.map(() => "---|").join(""));
    for (const type of allTypes) md.push(`| ${type} | ${changes.map((c) => c.byType[type] || 0).join(" | ")} |`);
  } else {
    md.push("_(no manifest entries)_");
  }
  md.push("");
  for (const c of changes) {
    if (c.rulesRemoved.length || c.actionsRemoved.length) {
      md.push(`${c.runId}: rules removed [${c.rulesRemoved.join(", ") || "none"}], actions removed [${c.actionsRemoved.join(", ") || "none"}]`
        + `${c.unexplainedRemovals ? " -- **not claimed in the manifest**" : " (claimed in the manifest)"}.`);
    }
  }
  md.push("");
  md.push("### Candidate validation", "");
  md.push("| Run | Hard errors | Warnings |");
  md.push("|---|---|---|");
  for (const c of changes) md.push(`| ${c.runId} | ${c.validation.errors.length} | ${c.validation.warnings.length} |`);
  for (const c of changes) {
    for (const e of c.validation.errors) md.push(`- ERROR ${c.runId}: ${e}`);
    for (const w of c.validation.warnings) md.push(`- warning ${c.runId}: ${w}`);
  }
  md.push("");

  // -- pre-registered decision rule -----------------------------------------
  md.push("## 4. Pre-registered success criteria (POST_NORMALIZATION.md §5)", "");
  const majorityNormalized = judge ? judge.perRun.filter((r) => r.outcome === "normalized").length : 0;
  const anyMateriallyWorse = judge ? judge.perRun.some((r) => r.materiallyWorse) : true;
  const anyMajorityUnsupported = judge ? judge.perRun.some((r) => r.unsupportedAdditionsNormalized * 2 > r.total) : true;
  const anyMajorityCompetencyLoss = judge ? judge.perRun.some((r) => r.competencyLossNormalized * 2 > r.total) : true;
  const anyUnexplainedRemoval = changes.some((c) => c.unexplainedRemovals);
  const anyValidationError = changes.some((c) => c.validation.errors.length > 0);
  const relDelta = agg.full.relationships.deltaPts;
  const allF1NonDecreasing = ["classes", "relationships", "properties"].every((d) => agg.full[d].deltaPts >= 0);

  const criteria = [
    ["3. No unsupported domain content introduced", !anyMajorityUnsupported],
    ["4. No rule/action disappears unexplained", !anyUnexplainedRemoval],
    ["5. Competency/action coverage not materially reduced", !anyMajorityCompetencyLoss],
    ["6. Judge prefers normalized in a majority of runs, not materially worse in any", judge ? (majorityNormalized * 2 > runIds.length && !anyMateriallyWorse) : false],
    ["7. Relationship quality does not regress in aggregate", relDelta >= 0],
    ["8. Aggregate class/relationship/property F1 does not decrease (full domain)", allF1NonDecreasing],
    ["(additional) Every candidate is applicable: no hard validation error", !anyValidationError],
  ];
  md.push("| Criterion | Result |");
  md.push("|---|---|");
  for (const [name, ok] of criteria) md.push(`| ${name} | ${ok ? "PASS" : "**FAIL**"} |`);
  md.push("");
  md.push(`Criteria 1 and 2 (production interviewer byte-identical, frozen artifacts unmodified) are asserted by the default test suite, not by this script: \`tests/agent-production-invariants.spec.mjs\` and \`tests/post-normalization.spec.mjs\`.`, "");

  // -- cost ------------------------------------------------------------------
  md.push("## 5. Cost", "");
  const normUsage = changes.map((c) => c.usage).filter(Boolean);
  const nTok = normUsage.reduce((a, u) => a + (u.total_tokens || 0), 0);
  md.push(`- Normalizer: ${changes.length} calls, model \`${changes[0] && changes[0].provenance.modelReported}\`, ${nTok.toLocaleString("en-US")} total tokens.`);
  if (judgeDoc) {
    md.push(`- Judge: ${judgeDoc.usageTotal.calls} calls across ${judgeDoc.judgeModels.join(" + ")}, ${judgeDoc.usageTotal.total_tokens.toLocaleString("en-US")} total tokens.`);
    md.push(`- Combined: ${(judgeDoc.usageTotal.calls + changes.length)} model calls, ${(nTok + judgeDoc.usageTotal.total_tokens).toLocaleString("en-US")} tokens. No interview was re-run.`);
  }
  md.push("");

  const outPath = path.join(COND_DIR, "metrics.md");
  fs.writeFileSync(outPath, `${md.join("\n")}\n`);
  console.log(md.join("\n"));
  console.log(`\nWrote ${path.relative(process.cwd(), outPath)}`);
}
