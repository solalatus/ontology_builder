// NON-REGRESSION EVALUATION OF THE COMPETENCY-QUESTION INTERVIEWER (issue #94)
//
//   AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... \
//   node tests/evals/cq-non-regression.mjs --arm=control   --run=run-01
//   node tests/evals/cq-non-regression.mjs --arm=treatment --run=run-01
//
// WHAT THIS ANSWERS
// -----------------
// Issue #94 makes competency questions first-class and rewrites parts of the
// interviewer's prompt to match: Phase 1 names and persists them, Phase 0
// recognizes imported ones, Phases 2-4/8 justify against them, and Phase 9
// reads the persisted list back from get_graph_state instead of from memory.
// The feature's own correctness is covered by the offline suite. This asks the
// only question that suite cannot: **does the rewritten interviewer recover
// less of a domain than the one it replaced?**
//
// The measured quantity is therefore ontology recovery against the same hidden
// ground truth (fixtures/itops_mtsr.yaml) the repository's existing interactive
// runs use — not anything about competency questions themselves. A feature that
// captures requirements beautifully while eliciting a worse ontology is a
// regression, and this is the instrument that would show it.
//
// WHY BOTH ARMS ARE RE-RUN (the deviation, stated up front)
// ---------------------------------------------------------
// Same reasoning as tests/evals/self-correction-eval.mjs, whose structure this
// file follows deliberately rather than inventing a second design: the anchor
// distribution in results/runs/ was produced on a model that is not reachable
// from this environment. Comparing a fresh interview against those anchors
// would vary the model and the treatment at once. So a fresh **control** arm is
// run too and the comparison is within-model. The published anchors are
// untouched and are not the comparison surface.
//
// HOW THE CONTROL ARM IS PRODUCED
// -------------------------------
// From this same checkout, not a separate one: `agentState.systemPromptOverride`
// is set to the frozen pre-#94 interviewer prompt
// (fixtures/interviewer-prompt-pre-94.txt) and the reconstruction is verified
// against the golden hash that shipped before this issue changed it. If it does
// not reconstruct byte-for-byte, the run aborts rather than produce a void
// comparison. Everything else — harness revision, Chromium build, app code,
// persona, fixture, scorer — is identical across the two arms, so they differ
// by the interviewer prompt alone.
//
// Note on what the control arm can and cannot say: the pre-#94 prompt never
// mentions competency_questions, so the control interview records none. That is
// the honest control, not a handicap — the point of the comparison is the
// ontology, which both arms are scored on identically.
//
// THE ONE HARNESS DEVIATION, STATED
// ---------------------------------
// This Azure resource answers GET /openai/deployments with an empty list even
// though its deployments are real and callable (a control-plane permission
// quirk, verified by calling each deployment directly). The app's connect flow
// populates its model dropdown from that listing, so the runner fulfills *that
// one request* with a synthetic listing of the deployments confirmed reachable.
// Every chat call — the interviewer's included — is a real, relayed Azure call.
// Nothing about the interviewer, its tools, or its prompt is stubbed.
//
// LIVE PROGRESS, CHECKPOINTS, IDEMPOTENCE
// ---------------------------------------
// As in self-correction-eval.mjs: progress.json after every turn, a checkpoint
// of the transcript/API log/ontology-so-far each time the app's turn lands, and
// a completed run (one with baseline-provenance.json) is skipped rather than
// re-spent. Nothing under results/runs/ is ever read or written.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { launchChromium } from "../lib/browser.mjs";
import { APP_URL } from "../lib/page.mjs";
import { forwardToRealAzure, configureAzureEndpoint, openPanel } from "../lib/liveAzureOpenAi.mjs";
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";
import { chatOnce, DEFAULT_AZURE_API_VERSION } from "./lib/chatClient.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = path.join(__dirname, "results", "baselines", "competency-questions");
const PRE_94_PROMPT = path.join(__dirname, "fixtures", "interviewer-prompt-pre-94.txt");

// The hash tests/agent-production-invariants.spec.mjs pinned before issue #94
// changed the prompt. The control arm reconstructs that exact prompt from the
// fixture; if the reconstruction does not hash to this, the control arm is not
// the pre-#94 interviewer and the comparison is void, so it fails loudly.
const PRE_94_PROMPT_SHA256_EN = "eff34f3e70f85419e078cbc3bfb827d7e0d58066b33a74c8db09df1e9f337fa2";

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};

// Deployment NAMES on this resource, not model ids — on Azure the two are
// independent. Both arms must run on the same interviewer model for the
// comparison to mean anything, so it is pinned rather than left to the app's
// own default-pick heuristic.
const MODEL = process.env.EVAL_INTERVIEWER_MODEL || "gpt-4o";
const PERSONA_MODEL = process.env.ONTOLOGY_EVAL_PERSONA_MODEL || "gpt-4o";
const REACHABLE_DEPLOYMENTS = (process.env.EVAL_AZURE_DEPLOYMENTS || "gpt-4o,gpt-5-mini,o4-mini").split(",");
const MAX_TURNS = Number(process.env.ONTOLOGY_EVAL_MAX_TURNS) || 120;
const WALLCLOCK_MINUTES = Number(process.env.ONTOLOGY_EVAL_WALLCLOCK_MINUTES) || 30;

// See "THE ONE HARNESS DEVIATION" above. Fulfilled locally rather than relayed,
// because the real listing is empty on this resource and the app would report
// "no chat-capable models" for deployments that answer chat requests fine.
async function stubDeploymentListing(page, endpoint) {
  await page.route(`${endpoint}/openai/deployments?*`, (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({
      object: "list",
      data: REACHABLE_DEPLOYMENTS.map((id) => ({ id, object: "deployment", model: id, status: "succeeded" })),
    }),
  }));
}

async function connectAzure(page, apiKey, endpoint, model) {
  await stubDeploymentListing(page, endpoint);
  await openPanel(page);
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", apiKey);
  await configureAzureEndpoint(page, endpoint);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 60000 });
  const picked = await page.evaluate((wanted) => {
    const select = document.getElementById("agent-model-select-modal");
    const option = [...select.options].find((o) => o.value === wanted);
    if (!option) return null;
    select.value = wanted;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return select.value;
  }, model);
  if (picked !== model) throw new Error(`deployment ${model} not offered by the endpoint; got: ${picked}`);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 60000 });
}

async function main() {
  const armName = arg("arm");
  const runId = arg("run");
  if (!["control", "treatment"].includes(armName) || !runId) {
    console.error("Usage: node tests/evals/cq-non-regression.mjs --arm=control|treatment --run=run-01");
    process.exit(1);
  }
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!endpoint || !apiKey) { console.error("AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY are required."); process.exit(1); }

  const outDir = path.join(OUT_ROOT, armName, runId);
  if (fs.existsSync(path.join(outDir, "baseline-provenance.json")) && arg("force") === null) {
    console.log(`${armName}/${runId}: already complete — skipping (pass --force= to redo it)`);
    return;
  }
  fs.mkdirSync(path.join(outDir, "checkpoint"), { recursive: true });
  const progressPath = path.join(outDir, "progress.json");
  const startedAt = Date.now();
  const writeProgress = (extra) => {
    try {
      fs.writeFileSync(progressPath, `${JSON.stringify({
        arm: armName, runId, model: MODEL, startedAt: new Date(startedAt).toISOString(),
        elapsedSec: Math.round((Date.now() - startedAt) / 1000), ...extra,
      }, null, 1)}\n`);
    } catch (err) { /* progress reporting must never break the run */ }
  };
  writeProgress({ phase: "starting", turnsUsed: 0 });

  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const checkpointDir = path.join(outDir, "checkpoint");
  const checkpoint = async (log, rawApiLog) => {
    fs.writeFileSync(path.join(checkpointDir, "conversation-log.md"),
      log.map((e) => `### turn ${e.turn} — ${e.speaker}\n\n${e.text}\n`).join("\n"));
    fs.writeFileSync(path.join(checkpointDir, "raw-api-log.json"), `${JSON.stringify(rawApiLog, null, 1)}\n`);
    fs.writeFileSync(path.join(checkpointDir, "recovered-model.yaml"),
      await page.evaluate(() => window.__kg.formats.buildDomainYamlExport()));
  };
  try {
    await page.goto(APP_URL);
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
    await page.evaluate(() => window.__kg.welcome.close());
    writeProgress({ phase: "connecting", turnsUsed: 0 });
    await connectAzure(page, apiKey, endpoint, MODEL);

    if (armName === "control") {
      const base = fs.readFileSync(PRE_94_PROMPT, "utf8");
      await page.evaluate((prompt) => { window.__kg.agent.state.systemPromptOverride = prompt; }, base);
      const actual = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
      if (sha256(actual) !== PRE_94_PROMPT_SHA256_EN) {
        throw new Error(`control arm prompt does not reconstruct the pre-#94 interviewer `
          + `(got ${sha256(actual)}, expected ${PRE_94_PROMPT_SHA256_EN}) -- refusing to run a void comparison`);
      }
    }
    const promptSha = sha256(await page.evaluate(() => window.__kg.agent.buildSystemPrompt()));
    writeProgress({ phase: "interviewing", turnsUsed: 0, promptSha256: promptSha });

    const result = await runOntologyRecoveryConversation({
      page,
      apiKey,
      personaModel: PERSONA_MODEL,
      classifierModel: MODEL,
      maxTurns: MAX_TURNS,
      wallClockMs: WALLCLOCK_MINUTES * 60 * 1000,
      installRelay: (p) => forwardToRealAzure(p, `${endpoint}/openai/deployments/**`),
      chat: async (messages, model) => {
        const call = await chatOnce({
          config: { provider: "azure", endpoint, apiKey, apiVersion: process.env.AZURE_OPENAI_API_VERSION || DEFAULT_AZURE_API_VERSION },
          model, systemPrompt: messages[0].content,
          userPrompt: messages.slice(1).map((m) => m.content).join("\n\n"),
          label: `${armName}/${runId} harness`,
        });
        return { text: call.reply, usage: call.usage };
      },
      onProgress: ({ phase, turn, turnsUsed, durationMs, log, rawApiLog }) => {
        const lastApp = [...log].reverse().find((e) => String(e.speaker).startsWith("app-assistant"));
        const applies = rawApiLog.filter((m) => m.role === "tool" && typeof m.content === "string"
          && m.content.startsWith("Applied.")).length;
        writeProgress({
          phase, turn, turnsUsed, promptSha256: promptSha,
          durationSec: Math.round(durationMs / 1000),
          logEntries: log.length, appliesSoFar: applies,
          lastAppLine: lastApp ? String(lastApp.text).slice(0, 220) : null,
        });
        if (phase !== "app_turn_complete") return;
        checkpoint(log, rawApiLog).catch(() => { /* best effort, never fatal */ });
      },
    });

    const recoveredYaml = await page.evaluate(() => window.__kg.formats.buildDomainYamlExport());
    // Recorded for description, never for scoring: the control arm cannot
    // produce these at all, so a difference here is the treatment working, not
    // a quality measure. The comparison surface is the ontology.
    const competencyQuestions = await page.evaluate(() => window.__kg.state.competencyQuestions.map((cq) => ({ ...cq })));
    const applyCalls = result.rawApiLog.filter((m) => m.role === "assistant" && Array.isArray(m.tool_calls)
      && m.tool_calls.some((c) => c.function && c.function.name === "apply_ontology_yaml")).length;
    const graphStateCalls = result.rawApiLog.filter((m) => m.role === "assistant" && Array.isArray(m.tool_calls)
      && m.tool_calls.some((c) => c.function && c.function.name === "get_graph_state")).length;

    fs.writeFileSync(path.join(outDir, "recovered-model.yaml"), recoveredYaml);
    fs.writeFileSync(path.join(outDir, "conversation-log.md"),
      result.log.map((e) => `### turn ${e.turn} — ${e.speaker}\n\n${e.text}\n`).join("\n"));
    fs.writeFileSync(path.join(outDir, "raw-api-log.json"), `${JSON.stringify(result.rawApiLog, null, 1)}\n`);
    fs.writeFileSync(path.join(outDir, "baseline-provenance.json"), `${JSON.stringify({
      schemaVersion: 1,
      condition: `competency-questions/${armName}`,
      arm: armName, runId,
      generatedAt: new Date().toISOString(),
      model: MODEL, personaModel: PERSONA_MODEL,
      provider: "azure", endpoint,
      interviewerPromptSha256: promptSha,
      competencyQuestionsEnabled: armName === "treatment",
      stoppedReason: result.stoppedReason,
      turnsUsed: result.turnsUsed,
      wallClockSec: Math.round((Date.now() - startedAt) / 1000),
      applyToolCalls: applyCalls,
      getGraphStateCalls: graphStateCalls,
      competencyQuestionsRecorded: competencyQuestions.length,
      competencyQuestions,
      note: "Fresh interview under issue #94's within-model design. The control arm runs the frozen "
        + "pre-#94 interviewer prompt from this same checkout, so the two arms differ by the interviewer "
        + "prompt alone. The deployment LISTING is stubbed (this resource returns an empty list for "
        + "deployments that are callable); every chat call is a real relayed Azure call. Nothing under "
        + "results/runs/ was read or written.",
    }, null, 2)}\n`);
    writeProgress({ phase: "done", turnsUsed: result.turnsUsed, stoppedReason: result.stoppedReason });
    console.log(`${armName}/${runId}: ${result.turnsUsed} turns, stopped=${result.stoppedReason}, `
      + `${applyCalls} apply calls, ${competencyQuestions.length} competency questions recorded`);
  } catch (err) {
    const message = String((err && err.message) || err);
    const spent = /insufficient_quota|401|429/.test(message);
    writeProgress({ phase: spent ? "aborted_quota" : "failed", error: message.slice(0, 500) });
    console.error(`${armName}/${runId} failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
