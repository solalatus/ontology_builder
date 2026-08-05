import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPage } from "../lib/page.mjs";
import { loadEnvKey } from "../lib/env.mjs";
import { connectAgentLive } from "../lib/liveOpenAi.mjs";
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics, computeHeuristicMatchPairs } from "./lib/recoveryMetrics.mjs";
import { computeSemanticRecoveryMetrics } from "./lib/llmMatcher.mjs";
import {
  writeConversationLog, computeOperationalStats, generateLlmReview, writeReport, writeToolCallLog,
  writeRecoveredModelYaml, writeHeuristicMatches, writeSemanticJudgments, writeSemanticMatches, pathsFor,
} from "./lib/reportGenerator.mjs";

// CONDITION B2 -- "generic interviewer" (EXPERIMENT_BRIEF.md). Varies exactly
// one factor against a real interactive run: the interviewer's own system
// prompt. Everything else is identical -- same persona, same fixture, same
// interviewer model, same stopping conditions, same tool availability (the
// model can still call apply_ontology_yaml/get_graph_state and commits
// normally, mid-conversation, exactly like an interactive run), same scorer.
//
// This is NOT the same code path as tests/evals/ontology-recovery.eval.spec.mjs
// writing to a different directory -- it's genuinely reused verbatim
// (runOntologyRecoveryConversation, connectAgentLive, the whole scoring
// pipeline) with exactly one new step: setting agentState.systemPromptOverride
// (index.html's small, additive, eval-only hook -- see its own comment)
// before the first message, so the real staged AGENT_SYSTEM_PROMPT_BASE/
// AGENT_KNOWLEDGE never reaches the model at all for this run.
//
// Held fixed vs. varied, and why the prompt below is shaped as it is
// (EXPERIMENT_BRIEF.md §4.2, §5): it must not leak the hidden fixture or the
// app's own staged interview technique (that's exactly the factor being
// varied away), but it does need the same structural profile-constraints
// paragraph every condition gets, since that's a fact about the *target
// format*, not domain content or interview strategy -- without it, this
// condition would be handicapped by an unrelated knowledge gap (never being
// told there's no subclassing) rather than by the thing actually being
// tested (a generic vs. a staged interview approach).
//
// COST: one full fresh interview per trial (tens of real API calls, same
// order of magnitude as an interactive run) -- NOT cheap like B1. Output:
// tests/evals/results/baselines/b2-generic-interviewer/<trial-id>/, the same
// seven-file shape ontology-recovery.eval.spec.mjs already produces (report.md,
// conversation-log.md, tool-calls.md, recovered-model.yaml, heuristic-matches.json,
// semantic-judgments.json, semantic-matches.json) via the same reportGenerator.mjs
// writers, pointed at this condition's own {dir}. Nothing under
// tests/evals/results/runs/ is ever touched (EXPERIMENT_BRIEF.md §4.1).

const OPENAI_API_KEY = loadEnvKey("OPENAI_API_KEY");
const skip = OPENAI_API_KEY
  ? false
  : "Set OPENAI_API_KEY in a .env file at the repo root (see tests/README.md) to run condition B2.";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX_TURNS = Number(process.env.ONTOLOGY_EVAL_MAX_TURNS) || 500;
const WALLCLOCK_MINUTES = Number(process.env.ONTOLOGY_EVAL_WALLCLOCK_MINUTES) || 45;
const WALLCLOCK_MS = WALLCLOCK_MINUTES * 60 * 1000;
const PERSONA_MODEL = process.env.ONTOLOGY_EVAL_PERSONA_MODEL || "gpt-4o-mini";
const CLASSIFIER_MODEL_OVERRIDE = process.env.ONTOLOGY_EVAL_CLASSIFIER_MODEL || null;
const REVIEW_MODEL_OVERRIDE = process.env.ONTOLOGY_EVAL_REVIEW_MODEL || null;
// Distinct from the interactive anchors' run-01/02/03 labels on purpose --
// this is a brand-new interview each trial, not a re-score of an existing
// transcript, and the different naming keeps the two kinds of "run id" from
// ever being confused with each other in results/baselines/ vs results/runs/.
const TRIAL_ID = process.env.BASELINE_TRIAL_ID || "trial-01";
const OUT_DIR = path.join(__dirname, "results", "baselines", "b2-generic-interviewer", TRIAL_ID);

// Deliberately short and generic ("interview this expert and build a domain
// model" -- the brief's own example), procedural profile-constraints
// paragraph included (structural, not domain-specific -- see this file's own
// header comment), zero fixture content, zero staged-interview technique.
const GENERIC_SYSTEM_PROMPT = `Interview this domain expert and build a compact domain model of what they describe.

Ask questions, confirm what you've understood, and use the apply_ontology_yaml tool to add or update classes, relationships, rules, and actions in the model as you go -- call it whenever you've confirmed something new or changed, not only once at the end. Use the get_graph_state tool if you need to check the model's current state.

The model has flat classes and directed relationship edges: there is no subclassing (express a specialization as a relationship instead), and each real-world connection should be exactly one directed edge, never also its inverse. Include a property only when it is decision-relevant -- something the expert would filter, compare, or act on -- not a purely technical identifier or record-keeping field. Use the expert's own vocabulary for class, relationship, and property names and aliases.

Use this YAML shape when calling apply_ontology_yaml:

classes:
  ClassName:
    meaning: <one sentence, or omit>
    aliases: [alt name, ...]
    properties:
      propName:
        type: text | number | date | boolean
        unit: <only if type is number and a unit applies>
        allowed: [choice1, choice2, ...]   # only if a fixed list exists

relationships:
  - name: camelCaseVerbPhrase
    from: ClassA
    to: ClassB
    meaning: <one sentence, or omit>
    aliases: [alt phrasing, ...]

rules:
  ruleName:
    conditions:
      - <plain-language condition>

actions:
  actionName:
    input: ClassName
    preconditions: [ruleName, ...]

When you believe the interview has covered what the expert needs, say so clearly.`;

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

test(
  "condition B2: generic interviewer prompt, same persona/fixture/model/tools/stopping conditions as an interactive run",
  { skip, timeout: WALLCLOCK_MS + 10 * 60 * 1000 },
  async () => {
    await withPage(async (page) => {
      const modelResponses = await connectAgentLive(page, OPENAI_API_KEY);
      const interviewerModel = await page.evaluate(() => window.__kg.agent.state.model);
      assert.ok(interviewerModel, "expected the real connect flow to pick a real model");
      void modelResponses;
      const classifierModel = CLASSIFIER_MODEL_OVERRIDE || interviewerModel;

      await page.evaluate((prompt) => {
        window.__kg.agent.state.systemPromptOverride = prompt;
      }, GENERIC_SYSTEM_PROMPT);
      const sentPrompt = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
      assert.ok(sentPrompt.startsWith(GENERIC_SYSTEM_PROMPT), "the override must actually be what gets sent, not silently ignored");

      const { logPath, toolCallLogPath, reportPath } = pathsFor(OUT_DIR);
      void logPath; void toolCallLogPath; void reportPath; // documents the writer target; writers take {dir} directly below
      const onProgress = (snapshot) => {
        writeConversationLog({ ...snapshot, stoppedReason: `in progress (${snapshot.phase}, turn ${snapshot.turn})` }, { dir: OUT_DIR });
        writeToolCallLog(snapshot.rawApiLog, { dir: OUT_DIR });
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
      const recoveredModelYaml = await page.evaluate(() => window.buildDomainYamlExport());
      writeRecoveredModelYaml(recoveredModelYaml, { dir: OUT_DIR });

      const groundTruth = loadGroundTruthModel();
      const metrics = computeRecoveryMetrics(groundTruth, recoveredState);
      const scopedGroundTruth = scopeGroundTruth(groundTruth, groundTruth.practicalScopeClassIds, groundTruth.practicalScopePropertyIds);
      const scopedMetrics = computeRecoveryMetrics(scopedGroundTruth, recoveredState);

      assert.ok(Number.isFinite(metrics.recoveryEffectiveness), "composite score must be a real number, not NaN");
      assert.ok(Number.isFinite(scopedMetrics.recoveryEffectiveness), "scoped composite score must be a real number, not NaN");

      writeHeuristicMatches(computeHeuristicMatchPairs(groundTruth, recoveredState), { dir: OUT_DIR });

      const operationalStats = computeOperationalStats(orchestratorResult);
      writeConversationLog(orchestratorResult, { dir: OUT_DIR });
      writeToolCallLog(orchestratorResult.rawApiLog, { dir: OUT_DIR });
      const reviewModel = REVIEW_MODEL_OVERRIDE || interviewerModel;
      const llmReviewText = await generateLlmReview({ apiKey: OPENAI_API_KEY, model: reviewModel, orchestratorResult });

      let semanticMetrics = null, semanticScopedMetrics = null;
      try {
        semanticMetrics = await computeSemanticRecoveryMetrics({ groundTruth, recoveredState, apiKey: OPENAI_API_KEY, model: classifierModel });
        semanticScopedMetrics = await computeSemanticRecoveryMetrics({ groundTruth: scopedGroundTruth, recoveredState, apiKey: OPENAI_API_KEY, model: classifierModel });
      } catch (err) {
        semanticMetrics = null;
        semanticScopedMetrics = null;
      }
      writeSemanticJudgments({ fullDomain: semanticMetrics, scoped: semanticScopedMetrics }, { dir: OUT_DIR });
      writeSemanticMatches({ fullDomain: semanticMetrics, scoped: semanticScopedMetrics }, { dir: OUT_DIR });

      writeReport({
        metrics, scopedMetrics, semanticMetrics, semanticScopedMetrics, operationalStats, orchestratorResult, llmReviewText,
        interviewerModel, personaModel: PERSONA_MODEL, classifierModel, dir: OUT_DIR,
      });

      // Provenance (EXPERIMENT_BRIEF.md §4.4) -- condition, prompt hash,
      // model config, turn/stopping data, timestamp. The rest of the run's
      // provenance (token usage per call, etc.) is already implicit in
      // tool-calls.md/report.md's own run-stats section for this directory.
      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUT_DIR, "baseline-provenance.json"), JSON.stringify({
        schemaVersion: 1,
        condition: "generic-interviewer",
        trialId: TRIAL_ID,
        generatedAt: new Date().toISOString(),
        interviewerModel,
        personaModel: PERSONA_MODEL,
        classifierModel,
        systemPromptSha256: sha256(GENERIC_SYSTEM_PROMPT),
        systemPrompt: GENERIC_SYSTEM_PROMPT,
        turnsUsed: orchestratorResult.turnsUsed,
        stoppedReason: orchestratorResult.stoppedReason,
        durationMs: orchestratorResult.durationMs,
        note: "Real, fresh interview against the persona -- tools left enabled, so apply_ontology_yaml "
          + "commits mid-conversation exactly like an interactive run. Only the interviewer's own system "
          + "prompt differs from tests/evals/ontology-recovery.eval.spec.mjs.",
      }, null, 2));
    });
  }
);
