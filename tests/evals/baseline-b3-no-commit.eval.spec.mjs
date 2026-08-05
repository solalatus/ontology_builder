import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPage } from "../lib/page.mjs";
import { loadEnvKey } from "../lib/env.mjs";
import { connectAgentLive, RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError, CHAT_URL } from "../lib/liveOpenAi.mjs";
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";
import { SYSTEM_PROMPT as B1_EXTRACTION_SYSTEM_PROMPT, extractYaml } from "./baseline-one-shot.mjs";
import { writeConversationLog, writeToolCallLog, pathsFor } from "./lib/reportGenerator.mjs";

// CONDITION B3 -- "structured interview without tool calls"
// (EXPERIMENT_BRIEF.md, the brief's own highest-priority untried condition).
// Varies exactly one factor against a real interactive run: whether anything
// can be committed mid-conversation. Held fixed: the REAL staged interviewer
// prompt (AGENT_SYSTEM_PROMPT_BASE + AGENT_KNOWLEDGE, completely untouched --
// unlike B2, nothing here overrides it), the persona, the fixture, the
// interviewer model, the stopping conditions.
//
// How tool calls are suppressed: agentState.toolsDisabled = true
// (index.html's small, additive, eval-only hook -- see its own comment) means
// sendAgentChatMessage() sends no `tools` field at all for this connection,
// so the model can never emit a tool_call -- apply_ontology_yaml is
// structurally unreachable, not merely discouraged. The interview otherwise
// proceeds exactly like an interactive run (same runOntologyRecoveryConversation
// loop, same persona, same stopping conditions) -- the model just replies in
// plain text every turn instead of ever committing.
//
// Because nothing ever commits, window.__kg.state stays empty for the whole
// run -- there is nothing to score there. Once the interview stops, ONE more
// call reuses B1's exact extraction pattern (same SYSTEM_PROMPT, same
// extractYaml) to pull the final MTSR model out of the finished transcript --
// this run's own transcript, produced by the REAL staged prompt with
// commits suppressed, not a saved interactive-run transcript. This keeps B3
// from needing any commitYamlImport/tool-call re-enabling trickery: the
// scorer only ever reads recovered-model.yaml from disk (score-baseline.mjs),
// never the live canvas state, so nothing needs to be pushed back into
// window.__kg.state at all.
//
// COST: one full fresh interview per trial (same order of magnitude as an
// interactive run) plus exactly one extra extraction call. Output:
// tests/evals/results/baselines/b3-no-commit/<trial-id>/ --
// conversation-log.md/tool-calls.md (live progress, same writers as the
// interactive eval, pointed at this condition's own {dir}), then
// recovered-model.yaml/raw-response.md/baseline-provenance.json in exactly
// B1's own shape, scored afterward the same way:
//   node tests/evals/score-baseline.mjs b3-no-commit <trial-id>
// Nothing under tests/evals/results/runs/ is ever touched (EXPERIMENT_BRIEF.md §4.1).

const OPENAI_API_KEY = loadEnvKey("OPENAI_API_KEY");
const skip = OPENAI_API_KEY
  ? false
  : "Set OPENAI_API_KEY in a .env file at the repo root (see tests/README.md) to run condition B3.";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX_TURNS = Number(process.env.ONTOLOGY_EVAL_MAX_TURNS) || 500;
const WALLCLOCK_MINUTES = Number(process.env.ONTOLOGY_EVAL_WALLCLOCK_MINUTES) || 45;
const WALLCLOCK_MS = WALLCLOCK_MINUTES * 60 * 1000;
const PERSONA_MODEL = process.env.ONTOLOGY_EVAL_PERSONA_MODEL || "gpt-4o-mini";
const CLASSIFIER_MODEL_OVERRIDE = process.env.ONTOLOGY_EVAL_CLASSIFIER_MODEL || null;
// Same reasoning as baseline-one-shot.mjs's own MODEL default -- same model
// as the interviewer itself, so any difference isolates the procedure
// (structured-with-tools vs. structured-without-tools), not model capability.
const EXTRACTION_MODEL = process.env.BASELINE_MODEL || null;
const TRIAL_ID = process.env.BASELINE_TRIAL_ID || "trial-01";
const OUT_DIR = path.join(__dirname, "results", "baselines", "b3-no-commit", TRIAL_ID);

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

test(
  "condition B3: real staged interviewer prompt, tools disabled so nothing commits mid-conversation, final model extracted once from the finished transcript",
  { skip, timeout: WALLCLOCK_MS + 10 * 60 * 1000 },
  async () => {
    await withPage(async (page) => {
      const modelResponses = await connectAgentLive(page, OPENAI_API_KEY);
      const interviewerModel = await page.evaluate(() => window.__kg.agent.state.model);
      assert.ok(interviewerModel, "expected the real connect flow to pick a real model");
      void modelResponses;
      const classifierModel = CLASSIFIER_MODEL_OVERRIDE || interviewerModel;
      const extractionModel = EXTRACTION_MODEL || interviewerModel;

      await page.evaluate(() => {
        window.__kg.agent.state.toolsDisabled = true;
      });
      const sentPromptHasRealPrompt = await page.evaluate(() => window.__kg.agent.buildSystemPrompt().includes("ROLE"));
      assert.ok(sentPromptHasRealPrompt, "B3 must keep the real staged prompt -- only tool availability should differ from an interactive run");

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

      const toolCallsMade = orchestratorResult.rawApiLog.some((m) => Array.isArray(m.tool_calls) && m.tool_calls.length);
      assert.equal(toolCallsMade, false, "with tools disabled, no tool_call should ever have been possible -- a true here would mean the suppression hook failed silently");

      writeConversationLog(orchestratorResult, { dir: OUT_DIR });
      writeToolCallLog(orchestratorResult.rawApiLog, { dir: OUT_DIR });

      // Extraction: B1's exact prompt/parsing, fed this run's own transcript
      // (just written above) instead of a saved interactive-run transcript.
      const transcriptPath = pathsFor(OUT_DIR).logPath;
      const transcript = fs.readFileSync(transcriptPath, "utf8");
      const userPrompt = `Here is the complete interview transcript.\n\n${transcript}`;

      let res, data;
      for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
        res = await fetch(CHAT_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          // No `temperature` -- same reasoning-tier incompatibility confirmed
          // live for baseline-one-shot.mjs's own identical call (HTTP 400 on
          // gpt-5.5-... otherwise); see that file's matching comment.
          body: JSON.stringify({
            model: extractionModel,
            messages: [
              { role: "system", content: B1_EXTRACTION_SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
          }),
        });
        data = await res.json();
        if (res.ok) break;
        if (res.status === 429 && attempt < RATE_LIMIT_MAX_ATTEMPTS && !isInsufficientQuotaError(data)) {
          await sleepMs(rateLimitBackoffMs(attempt));
          continue;
        }
        throw new Error(`B3 extraction call failed: HTTP ${res.status} ${data && data.error && data.error.message}`);
      }
      const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      const yamlText = extractYaml(reply);

      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUT_DIR, "recovered-model.yaml"), yamlText);
      fs.writeFileSync(path.join(OUT_DIR, "raw-response.md"), reply);
      fs.writeFileSync(path.join(OUT_DIR, "baseline-provenance.json"), JSON.stringify({
        schemaVersion: 1,
        condition: "structured-interview-no-commit",
        trialId: TRIAL_ID,
        generatedAt: new Date().toISOString(),
        interviewerModel,
        personaModel: PERSONA_MODEL,
        classifierModel,
        extractionModel,
        extractionSystemPromptSha256: sha256(B1_EXTRACTION_SYSTEM_PROMPT),
        transcriptSha256: sha256(transcript),
        transcriptPath: path.relative(path.join(__dirname, ".."), transcriptPath),
        turnsUsed: orchestratorResult.turnsUsed,
        stoppedReason: orchestratorResult.stoppedReason,
        interviewDurationMs: orchestratorResult.durationMs,
        extractionUsage: data.usage || null,
        note: "Real, fresh interview against the persona, real staged interviewer prompt, tools disabled so "
          + "apply_ontology_yaml was structurally unreachable for the whole interview -- confirmed zero "
          + "tool_calls in rawApiLog. Final model extracted with exactly one more call, same prompt/parsing "
          + "as baseline-one-shot.mjs (condition B1), fed this run's own transcript.",
      }, null, 2));

      console.log(`B3/${TRIAL_ID}: ${orchestratorResult.turnsUsed} turns, stopped "${orchestratorResult.stoppedReason}", extracted model -> ${path.relative(process.cwd(), OUT_DIR)}`);
      console.log(`Score with:  node tests/evals/score-baseline.mjs b3-no-commit ${TRIAL_ID}`);
    });
  }
);
