import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "../lib/page.mjs";
import { loadEnvKey } from "../lib/env.mjs";
import { connectAgentLive } from "../lib/liveOpenAi.mjs";
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./lib/recoveryMetrics.mjs";
import { writeConversationLog, computeOperationalStats, generateLlmReview, writeReport, writeToolCallLog } from "./lib/reportGenerator.mjs";

// Ontology-recovery eval — see tests/evals/README.md for the full design
// writeup. Not part of the default `node --test tests/*.spec.mjs` run
// (this file lives under tests/evals/, which that non-recursive glob never
// sees); run explicitly with `node --test tests/evals/*.eval.spec.mjs`.
//
// Simulates a full ontology-elicitation interview: the app's real helper
// agent (interviewer, driven through the real browser+API exactly like
// tests/helper-agent-live-openai.spec.mjs) against a second, independent
// LLM playing Eszter Farkas (tests/evals/lib/personaAgent.mjs), whose
// answers are grounded in the hidden ground-truth ontology
// (tests/evals/fixtures/itops_mtsr.yaml). At the end, the agent's recovered
// canvas model is diffed against the ground truth and a report is written.
//
// This is an eval, not a strict pass/fail test: two real, non-deterministic
// LLMs are talking to each other, so run-to-run variance is expected and
// normal. The assertions below are generous sanity floors that catch
// outright breakage (a crash, a NaN metric, zero API calls happening at
// all) -- the actual value of this file is the report it writes, not a
// binary verdict.

const OPENAI_API_KEY = loadEnvKey("OPENAI_API_KEY");
const skip = OPENAI_API_KEY
  ? false
  : "Set OPENAI_API_KEY in a .env file at the repo root (see tests/README.md) to run the ontology-recovery eval.";

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

test(
  "ontology-recovery eval: simulated interview against the Hungarian bank IT-ops ontology",
  { skip, timeout: WALLCLOCK_MS + 10 * 60 * 1000 },
  async () => {
    await withPage(async (page) => {
      const modelResponses = await connectAgentLive(page, OPENAI_API_KEY);
      const interviewerModel = await page.evaluate(() => window.__kg.agent.state.model);
      assert.ok(interviewerModel, "expected the real connect flow to pick a real model");
      void modelResponses;
      const classifierModel = CLASSIFIER_MODEL_OVERRIDE || interviewerModel;

      // Live progress: re-uses the exact same writers the final, successful
      // path calls once at the end, so results/conversation-log.md and
      // results/tool-calls.md are real and current at any point during a
      // run -- checking them mid-run (every couple of minutes, say) shows
      // real turn-by-turn progress instead of a stale or empty file, and a
      // hang or crash mid-run still leaves everything up through the last
      // completed turn on disk instead of nothing (both files are
      // function-local return values otherwise, discarded by an exception
      // thrown mid-loop -- exactly what happened investigating a real
      // timeout while validating this same fix, see helper_agent_todo.md's
      // dated Log entry).
      const onProgress = (snapshot) => {
        writeConversationLog({ ...snapshot, stoppedReason: `in progress (${snapshot.phase}, turn ${snapshot.turn})` });
        writeToolCallLog(snapshot.rawApiLog);
      };

      const orchestratorResult = await runOntologyRecoveryConversation({
        page,
        apiKey: OPENAI_API_KEY,
        personaModel: PERSONA_MODEL,
        classifierModel,
        maxTurns: MAX_TURNS,
        wallClockMs: WALLCLOCK_MS,
        onProgress,
      });

      assert.ok(orchestratorResult.turnsUsed >= 1, "expected at least one real turn to happen");
      assert.ok(orchestratorResult.chatResponses.length >= 1, "expected at least one real app-agent API call");

      const recoveredState = await page.evaluate(() => ({
        nodes: window.__kg.state.nodes,
        edges: window.__kg.state.edges,
      }));
      const groundTruth = loadGroundTruthModel();
      const metrics = computeRecoveryMetrics(groundTruth, recoveredState);
      const scopedGroundTruth = scopeGroundTruth(groundTruth, groundTruth.practicalScopeClassIds);
      const scopedMetrics = computeRecoveryMetrics(scopedGroundTruth, recoveredState);

      assert.ok(Number.isFinite(metrics.recoveryEffectiveness), "composite score must be a real number, not NaN");
      assert.ok(metrics.classes.recall >= 0 && metrics.classes.recall <= 1);
      assert.ok(Number.isFinite(scopedMetrics.recoveryEffectiveness), "scoped composite score must be a real number, not NaN");

      const operationalStats = computeOperationalStats(orchestratorResult);
      writeConversationLog(orchestratorResult);
      writeToolCallLog(orchestratorResult.rawApiLog);
      const reviewModel = REVIEW_MODEL_OVERRIDE || interviewerModel;
      const llmReviewText = await generateLlmReview({ apiKey: OPENAI_API_KEY, model: reviewModel, orchestratorResult });
      writeReport({ metrics, scopedMetrics, operationalStats, orchestratorResult, llmReviewText, interviewerModel, personaModel: PERSONA_MODEL, classifierModel });
    });
  }
);
