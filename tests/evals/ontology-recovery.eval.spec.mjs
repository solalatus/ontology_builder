import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { withPage } from "../lib/page.mjs";
import { loadEnvKey } from "../lib/env.mjs";
import { connectAgentLive } from "../lib/liveOpenAi.mjs";
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";
import {
  loadGroundTruthModel, scopeGroundTruth, resolveDomainYamlPath, resolveDomainPersonaPath, listAvailableDomains,
} from "./lib/groundTruthModel.mjs";
import { deriveOpeningLine } from "./lib/personaAgent.mjs";
import { computeRecoveryMetrics, computeHeuristicMatchPairs, computeRuleMetrics, computeActionMetrics } from "./lib/recoveryMetrics.mjs";
import { computeSemanticRecoveryMetrics, computeSemanticRuleActionMetrics } from "./lib/llmMatcher.mjs";
import {
  writeConversationLog, computeOperationalStats, generateLlmReview, writeReport, writeToolCallLog,
  writeRecoveredModelYaml, writeHeuristicMatches, writeSemanticJudgments, writeSemanticMatches, RESULTS_DIR,
} from "./lib/reportGenerator.mjs";

// Ontology-recovery eval — see tests/evals/README.md for the full design
// writeup. Not part of the default `node --test tests/*.spec.mjs` run
// (this file lives under tests/evals/, which that non-recursive glob never
// sees); run explicitly with `node --test tests/evals/*.eval.spec.mjs`.
//
// Simulates a full ontology-elicitation interview: the app's real helper
// agent (interviewer, driven through the real browser+API exactly like
// tests/helper-agent-live-openai.spec.mjs) against a second, independent
// LLM playing a persona (tests/evals/lib/personaAgent.mjs) whose answers
// are grounded in a hidden ground-truth ontology. At the end, the agent's
// recovered canvas model is diffed against the ground truth and a report
// is written.
//
// This is an eval, not a strict pass/fail test: two real, non-deterministic
// LLMs are talking to each other, so run-to-run variance is expected and
// normal. The assertions below are generous sanity floors that catch
// outright breakage (a crash, a NaN metric, zero API calls happening at
// all) -- the actual value of this file is the report it writes, not a
// binary verdict.
//
// EVAL_DOMAIN (issue #104) picks which domain to run against. Defaults to
// "itops" -- the original, hand-authored persona-eszter.md + MTSR fixture,
// completely unchanged from before this option existed, still writing to
// the original shared tests/evals/results/ (every other tool under
// tests/evals/ -- rescore-saved-run.mjs, score-baseline.mjs,
// cross-run-analyses.mjs, threshold-sensitivity.mjs, README.md -- reads
// from exactly that path, so itops's default behavior stays load-bearing
// for all of them). Any other value resolves to that domain's own
// ontology_translation/domains/<id>/reference.domain.yaml + persona.md
// (auto-discovered -- see groundTruthModel.mjs's own module comment for
// why there's no separate manifest.yaml to keep in sync) and writes to its
// own isolated ontology_translation/results/runs/<domain>/<run-id>/,
// so repeated runs -- of the same or different domains -- never overwrite
// each other's results the way the single shared directory used to.
const EVAL_DOMAIN = process.env.EVAL_DOMAIN || "itops";
const IS_ITOPS = EVAL_DOMAIN === "itops";

function resolveDomainInputs(domainId) {
  if (domainId === "itops") {
    // Unchanged defaults -- personaAgent.mjs/groundTruthModel.mjs already
    // default to exactly these when nothing is passed.
    return { groundTruthArgs: {}, personaArgs: {}, resultsDir: RESULTS_DIR };
  }
  const domainYamlPath = resolveDomainYamlPath(domainId); // throws with a clear "available domains" list if unknown
  const personaPath = resolveDomainPersonaPath(domainId);
  assert.ok(personaPath, `EVAL_DOMAIN="${domainId}" has no persona.md -- cannot run a live interview without one`);
  const groundTruthText = fs.readFileSync(domainYamlPath, "utf8");
  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsDir = path.resolve(
    path.dirname(domainYamlPath), "..", "..", "results", "runs", domainId, runId
  );
  return {
    groundTruthArgs: { format: "domain-yaml", path: domainYamlPath },
    personaArgs: {
      personaPath, groundTruthText, groundTruthFilename: "reference.domain.yaml",
      openingLine: deriveOpeningLine(fs.readFileSync(personaPath, "utf8")),
    },
    resultsDir,
  };
}

const OPENAI_API_KEY = loadEnvKey("OPENAI_API_KEY");
const skip = OPENAI_API_KEY
  ? false
  : "Set OPENAI_API_KEY in a .env file at the repo root (see tests/README.md) to run the ontology-recovery eval.";
if (!IS_ITOPS && !skip && !listAvailableDomains().includes(EVAL_DOMAIN)) {
  throw new Error(`EVAL_DOMAIN="${EVAL_DOMAIN}" not found. Available: itops, ${listAvailableDomains().join(", ")}`);
}

// Raised from 100 to 500 once the interviewer's own pacing was fixed to
// batch similar low-ambiguity items instead of one-per-turn (index.html's
// GROUND RULES/INTERVIEW PROCESS -- see helper_agent_todo.md's dated Log
// entry) -- with that fix, more turns means covering more of the ground
// truth instead of just spending more turns re-asking the same shape of
// question. The 45-minute wallclock default below remains the practical
// real-world bound regardless of this cap.
const MAX_TURNS = Number(process.env.ONTOLOGY_EVAL_MAX_TURNS) || 500;
const WALLCLOCK_MINUTES = Number(process.env.ONTOLOGY_EVAL_WALLCLOCK_MINUTES) || 45;
const WALLCLOCK_MS = WALLCLOCK_MINUTES * 60 * 1000;
const PERSONA_MODEL = process.env.ONTOLOGY_EVAL_PERSONA_MODEL || "gpt-4o-mini";
// No longer a fixed cheap default (was "gpt-4o-mini") -- a real run found
// the deterministic pre-filter in conversationOrchestrator.mjs's
// looksLikeEarlyPhaseCheckpoint() was needed precisely because a cheap,
// low-token-budget model was hard to instruction-away from a false
// positive. Defaulting to whatever real, live-picked "standard tier" model
// the interviewer itself connects with (same pattern REVIEW_MODEL_OVERRIDE
// already uses below) gives the LLM fallback a more capable model too,
// without hardcoding a specific model id here that could drift out of date
// or not exist for a given key/account.
const CLASSIFIER_MODEL_OVERRIDE = process.env.ONTOLOGY_EVAL_CLASSIFIER_MODEL || null;
const REVIEW_MODEL_OVERRIDE = process.env.ONTOLOGY_EVAL_REVIEW_MODEL || null;

const { groundTruthArgs, personaArgs, resultsDir } = skip ? {} : resolveDomainInputs(EVAL_DOMAIN);
if (!skip) fs.mkdirSync(resultsDir, { recursive: true });

test(
  `ontology-recovery eval: simulated interview against the ${EVAL_DOMAIN} ontology`,
  { skip, timeout: WALLCLOCK_MS + 10 * 60 * 1000 },
  async () => {
    await withPage(async (page) => {
      const modelResponses = await connectAgentLive(page, OPENAI_API_KEY);
      const interviewerModel = await page.evaluate(() => window.__kg.agent.state.model);
      assert.ok(interviewerModel, "expected the real connect flow to pick a real model");
      void modelResponses;
      const classifierModel = CLASSIFIER_MODEL_OVERRIDE || interviewerModel;

      // Live progress: re-uses the exact same writers the final, successful
      // path calls once at the end, so <resultsDir>/conversation-log.md and
      // <resultsDir>/tool-calls.md are real and current at any point during a
      // run -- checking them mid-run (every couple of minutes, say) shows
      // real turn-by-turn progress instead of a stale or empty file, and a
      // hang or crash mid-run still leaves everything up through the last
      // completed turn on disk instead of nothing (both files are
      // function-local return values otherwise, discarded by an exception
      // thrown mid-loop -- exactly what happened investigating a real
      // timeout while validating this same fix, see helper_agent_todo.md's
      // dated Log entry).
      const onProgress = (snapshot) => {
        writeConversationLog({ ...snapshot, stoppedReason: `in progress (${snapshot.phase}, turn ${snapshot.turn})` }, { dir: resultsDir });
        writeToolCallLog(snapshot.rawApiLog, { dir: resultsDir });
      };

      const orchestratorResult = await runOntologyRecoveryConversation({
        page,
        apiKey: OPENAI_API_KEY,
        personaModel: PERSONA_MODEL,
        classifierModel,
        maxTurns: MAX_TURNS,
        wallClockMs: WALLCLOCK_MS,
        onProgress,
        ...personaArgs,
      });

      assert.ok(orchestratorResult.turnsUsed >= 1, "expected at least one real turn to happen");
      assert.ok(orchestratorResult.chatResponses.length >= 1, "expected at least one real app-agent API call");

      const recoveredState = await page.evaluate(() => ({
        nodes: window.__kg.state.nodes,
        edges: window.__kg.state.edges,
        // Issue #105: rules/actions weren't captured at all before this --
        // no rule/action recall metric could exist without them.
        rules: window.__kg.state.rules,
        actions: window.__kg.state.actions,
      }));
      // The exact YAML get_graph_state itself would return, captured
      // directly rather than reconstructed by hand from tool-calls.md's
      // last get_graph_state block (which can be stale if the model kept
      // editing afterward without re-calling the tool) -- an external
      // review flagged this as a real reproducibility gap.
      const recoveredModelYaml = await page.evaluate(() => window.buildDomainYamlExport());
      writeRecoveredModelYaml(recoveredModelYaml, { dir: resultsDir });

      const groundTruth = loadGroundTruthModel(groundTruthArgs);
      const metrics = computeRecoveryMetrics(groundTruth, recoveredState);
      const scopedGroundTruth = scopeGroundTruth(groundTruth, groundTruth.practicalScopeClassIds, groundTruth.practicalScopePropertyIds);
      const scopedMetrics = computeRecoveryMetrics(scopedGroundTruth, recoveredState);

      assert.ok(Number.isFinite(metrics.recoveryEffectiveness), "composite score must be a real number, not NaN");
      assert.ok(metrics.classes.recall >= 0 && metrics.classes.recall <= 1);
      assert.ok(Number.isFinite(scopedMetrics.recoveryEffectiveness), "scoped composite score must be a real number, not NaN");

      // Exactly which gold class/relationship/property matched which
      // recovered node/edge/property name -- full domain only (practical
      // scope's matches are always a subset of the same ids, so a second
      // scoped pass would be redundant here, unlike the semantic judge
      // passes below, which make genuinely separate API calls per
      // denominator).
      writeHeuristicMatches(computeHeuristicMatchPairs(groundTruth, recoveredState), { dir: resultsDir });

      // Rules/actions (issue #105) -- full domain only, same reasoning as
      // the heuristic-matches write above: there is no separate "practical
      // scope" denominator for rules/actions yet (scopeGroundTruth already
      // carries groundTruth.rules through unfiltered -- see its own
      // comment -- so a scoped pass here would currently just repeat the
      // same numbers, not a genuinely different measurement).
      const ruleMetrics = computeRuleMetrics(groundTruth, recoveredState.rules || []);
      const actionMetrics = computeActionMetrics(groundTruth, recoveredState);

      const operationalStats = computeOperationalStats(orchestratorResult);
      writeConversationLog(orchestratorResult, { dir: resultsDir });
      writeToolCallLog(orchestratorResult.rawApiLog, { dir: resultsDir });
      const reviewModel = REVIEW_MODEL_OVERRIDE || interviewerModel;
      const llmReviewText = await generateLlmReview({ apiKey: OPENAI_API_KEY, model: reviewModel, orchestratorResult });

      // The LLM-judge supplement (llmMatcher.mjs) -- always attempted on a
      // real run, per the user's own explicit "always show both versions of
      // results" instruction, but wrapped so a judge failure (a transient
      // API error, an exhausted quota) degrades the report to the heuristic
      // section alone rather than failing the whole eval run over a
      // best-effort scoring supplement. writeReport's own "not computed"
      // fallback note (reportGenerator.mjs) makes that degradation visible
      // in the report itself, not a silently missing section.
      let semanticMetrics = null, semanticScopedMetrics = null, semanticRuleActionMetrics = null;
      try {
        semanticMetrics = await computeSemanticRecoveryMetrics({ groundTruth, recoveredState, apiKey: OPENAI_API_KEY, model: classifierModel });
        semanticScopedMetrics = await computeSemanticRecoveryMetrics({ groundTruth: scopedGroundTruth, recoveredState, apiKey: OPENAI_API_KEY, model: classifierModel });
        semanticRuleActionMetrics = await computeSemanticRuleActionMetrics({ groundTruth, recoveredState, apiKey: OPENAI_API_KEY, model: classifierModel });
      } catch (err) {
        semanticMetrics = null;
        semanticScopedMetrics = null;
        semanticRuleActionMetrics = null;
      }
      writeSemanticJudgments({ fullDomain: semanticMetrics, scoped: semanticScopedMetrics }, { dir: resultsDir });
      writeSemanticMatches({ fullDomain: semanticMetrics, scoped: semanticScopedMetrics }, { dir: resultsDir });

      writeReport({
        metrics, scopedMetrics, semanticMetrics, semanticScopedMetrics, operationalStats, orchestratorResult,
        llmReviewText, interviewerModel, personaModel: PERSONA_MODEL, classifierModel, dir: resultsDir,
        ruleMetrics, actionMetrics, semanticRuleActionMetrics,
      });
      console.log(`[ontology-recovery] EVAL_DOMAIN=${EVAL_DOMAIN} results written to ${resultsDir}`);
    });
  }
);
