// NON-REGRESSION EVALUATION OF THE SELF-CORRECTING INTERVIEWER (issue #85)
//
//   AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... \
//   node tests/evals/self-correction-eval.mjs --arm=control   --run=run-01
//   node tests/evals/self-correction-eval.mjs --arm=treatment --run=run-01
//
// WHAT THIS ANSWERS
// -----------------
// Issue #84 gives the interviewer consistency findings and a budget to act on
// them. #83's corpus already establishes the checker finds real defects; this
// asks the narrower and more dangerous question: does the self-correction loop
// make it a *worse interviewer*?
//
// WHY BOTH ARMS ARE RE-RUN (the deviation, stated up front)
// ---------------------------------------------------------
// The anchor distribution in results/runs/ was produced on
// `gpt-5.5-2026-04-23` via OpenAI. That model is not reachable on the Azure
// endpoint available here. Comparing fresh `gpt-5.4` interviews against
// `gpt-5.5` anchors would vary the model and the treatment at once, and the
// result would answer nothing -- so this runs a *fresh control arm too*, and
// compares within-model. Six interviews rather than three. The published
// anchors are untouched and are not the comparison surface.
//
// HOW THE CONTROL ARM IS PRODUCED
// -------------------------------
// From this same checkout, not a separate one: `agentState.systemPromptOverride`
// is set to the frozen pre-#84 interviewer prompt (fixtures/
// interviewer-prompt-pre-84.txt, verified against the golden hash that shipped
// with it) and `agentState.selfCorrectionDisabled` restores the pre-#84 turn
// behaviour -- one commit per turn, no findings on any tool result. Running the
// control from a git worktree at main would also vary the harness revision and
// the Chromium build; this way the two arms differ by the treatment alone.
//
// LIVE PROGRESS, AND SURVIVING A FAILURE
// --------------------------------------
// Each run writes progress.json after every turn (the orchestrator's own
// onProgress hook). A 45-minute interview is otherwise a black box, and a
// status file is what makes a hang distinguishable from slow progress without
// waiting for the artifact.
//
// It also checkpoints. Every turn writes the transcript so far, the raw API log
// so far, and the ontology as it stands, under checkpoint/. If the key runs out
// of funds at turn 40, or the container dies, that interview is not lost -- the
// partial transcript and the partial model are on disk and auditable, and the
// provenance records that the run is partial rather than leaving something that
// looks finished.
//
// And it is idempotent. A run whose baseline-provenance.json already exists is
// skipped, so re-invoking the whole batch after any failure only does what is
// actually missing. Nothing is ever overwritten by a re-run, and nothing under
// results/runs/ is read or written at any point.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { launchChromium } from "../lib/browser.mjs";
import { APP_URL } from "../lib/page.mjs";
import { forwardToRealAzure, configureAzureEndpoint, openPanel } from "../lib/liveAzureOpenAi.mjs";
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = path.join(__dirname, "results", "baselines", "self-correcting-interviewer");
const PRE_84_PROMPT = path.join(__dirname, "fixtures", "interviewer-prompt-pre-84.txt");

// The hashes tests/agent-production-invariants.spec.mjs pinned before #84
// changed the prompt. The control arm reconstructs that exact prompt from the
// fixture; if the reconstruction does not hash to this, the control arm is not
// the pre-#84 interviewer and the comparison is void, so it fails loudly.
const PRE_84_PROMPT_SHA256_EN = "3554cef37978da3cf8eeef502182fd722e229d881260e7324cf4e6a75a2c173f";

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};

const MODEL = process.env.EVAL_INTERVIEWER_MODEL || "gpt-5.4";
const PERSONA_MODEL = process.env.ONTOLOGY_EVAL_PERSONA_MODEL || "gpt-4o-mini";
const MAX_TURNS = Number(process.env.ONTOLOGY_EVAL_MAX_TURNS) || 120;
const WALLCLOCK_MINUTES = Number(process.env.ONTOLOGY_EVAL_WALLCLOCK_MINUTES) || 45;

async function connectAzure(page, apiKey, endpoint, model) {
  const deploymentsUrl = `${endpoint.replace(/\/+$/, "")}/openai/deployments**`;
  forwardToRealAzure(page, deploymentsUrl);
  await openPanel(page);
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", apiKey);
  await configureAzureEndpoint(page, endpoint);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 60000 });
  // Pin the interviewer model rather than accepting the app's own default
  // heuristic: both arms must run on the same one for the comparison to mean
  // anything, and "whatever the heuristic picks today" is not a fixed value.
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
    console.error("Usage: node tests/evals/self-correction-eval.mjs --arm=control|treatment --run=run-01");
    process.exit(1);
  }
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!endpoint || !apiKey) { console.error("AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY are required."); process.exit(1); }

  const outDir = path.join(OUT_ROOT, armName, runId);
  // Idempotence: a completed run is never re-run, never re-spent, never
  // overwritten. `--force` exists, but has to be asked for.
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
      const base = fs.readFileSync(PRE_84_PROMPT, "utf8");
      await page.evaluate((prompt) => {
        window.__kg.agent.state.systemPromptOverride = prompt;
        window.__kg.agent.setSelfCorrectionDisabled(true);
      }, base);
      const actual = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
      if (sha256(actual) !== PRE_84_PROMPT_SHA256_EN) {
        throw new Error(`control arm prompt does not reconstruct the pre-#84 interviewer `
          + `(got ${sha256(actual)}, expected ${PRE_84_PROMPT_SHA256_EN}) -- refusing to run a void comparison`);
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
        // Checkpoint after the app's real content lands, not on every tick --
        // one page.evaluate per turn is cheap next to a model call, and it is
        // what makes an interrupted run recoverable rather than wasted.
        if (phase !== "app_turn_complete") return;
        checkpoint(log, rawApiLog).catch(() => { /* best effort, never fatal */ });
      },
    });

    // Everything the standard offline tooling needs, in the shape
    // EXPERIMENT_BRIEF.md §5 defines, plus the per-turn measures issue #85 asks
    // for that only this runner can see.
    const recoveredYaml = await page.evaluate(() => window.__kg.formats.buildDomainYamlExport());
    const applyCalls = result.rawApiLog.filter((m) => m.role === "assistant" && Array.isArray(m.tool_calls)
      && m.tool_calls.some((c) => c.function && c.function.name === "apply_ontology_yaml")).length;
    const appliesByTurn = {};
    for (const m of result.rawApiLog) {
      if (m.role !== "tool" || typeof m.content !== "string" || !m.content.startsWith("Applied.")) continue;
      appliesByTurn[m.turn] = (appliesByTurn[m.turn] || 0) + 1;
    }
    const findingsSeen = result.rawApiLog.filter((m) => m.role === "tool" && typeof m.content === "string"
      && m.content.includes("CONSISTENCY CHECK")).length;

    fs.writeFileSync(path.join(outDir, "recovered-model.yaml"), recoveredYaml);
    fs.writeFileSync(path.join(outDir, "conversation-log.md"),
      result.log.map((e) => `### turn ${e.turn} — ${e.speaker}\n\n${e.text}\n`).join("\n"));
    fs.writeFileSync(path.join(outDir, "raw-api-log.json"), `${JSON.stringify(result.rawApiLog, null, 1)}\n`);
    fs.writeFileSync(path.join(outDir, "baseline-provenance.json"), `${JSON.stringify({
      schemaVersion: 1,
      condition: `self-correcting-interviewer/${armName}`,
      arm: armName, runId,
      generatedAt: new Date().toISOString(),
      model: MODEL, personaModel: PERSONA_MODEL,
      provider: "azure", endpoint,
      interviewerPromptSha256: promptSha,
      selfCorrectionEnabled: armName === "treatment",
      stoppedReason: result.stoppedReason,
      turnsUsed: result.turnsUsed,
      wallClockSec: Math.round((Date.now() - startedAt) / 1000),
      applyToolCalls: applyCalls,
      appliesByTurn,
      maxAppliesInOneTurn: Math.max(0, ...Object.values(appliesByTurn)),
      turnsWithMoreThanOneApply: Object.values(appliesByTurn).filter((n) => n > 1).length,
      toolResultsCarryingFindings: findingsSeen,
      note: "Fresh interview under issue #85's within-model design. The control arm runs the frozen "
        + "pre-#84 interviewer prompt with self-correction disabled, from this same checkout, so the two "
        + "arms differ by the treatment alone. Nothing under results/runs/ was read or written.",
    }, null, 2)}\n`);
    writeProgress({ phase: "done", turnsUsed: result.turnsUsed, stoppedReason: result.stoppedReason });
    console.log(`${armName}/${runId}: ${result.turnsUsed} turns, stopped=${result.stoppedReason}, `
      + `${applyCalls} apply calls, max ${Math.max(0, ...Object.values(appliesByTurn))} applies in one turn`);
  } catch (err) {
    // Tell a spent key apart from a bug. "insufficient_quota", a 401, or a
    // hard 429 that outlasted the backoff all mean "stop and top up", and
    // reporting them as a generic failure would send someone hunting a
    // defect that is not there.
    const message = String((err && err.message) || err);
    const kind = /insufficient_quota|exceeded your current quota|billing/i.test(message) ? "out_of_funds"
      : /401|invalid[_ ]api[_ ]key|Access denied|Unauthorized/i.test(message) ? "auth_failed"
      : /429/.test(message) ? "rate_limited"
      : "error";
    writeProgress({ phase: "failed", failureKind: kind, error: message.slice(0, 600) });
    console.error(`${armName}/${runId}: FAILED (${kind}) — ${message.slice(0, 300)}`);
    console.error(`Partial transcript and model are in ${path.relative(process.cwd(), checkpointDir)}; `
      + `re-running this command resumes the batch without redoing completed runs.`);
    process.exitCode = kind === "out_of_funds" ? 3 : 1;
    return;
  } finally {
    await browser.close();
  }
}

await main();
