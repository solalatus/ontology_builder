// PHASE 6 CONSTRAINT-CAPTURE FIX EVALUATION (issue #96)
//
//   AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... \
//   node tests/evals/phase6-constraint-fix.mjs --arm=control   --run=run-01
//   node tests/evals/phase6-constraint-fix.mjs --arm=treatment --run=run-01
//
// See PHASE6_CONSTRAINT_FIX.md for the pre-registered design, measures and
// pass criteria — nothing here should be read without that document. This
// file is deliberately the same shape as cq-non-regression.mjs, since that is
// this repository's established pattern for a two-arm, within-model,
// prompt-only interviewer comparison, and this eval is a direct follow-up to
// that one's own §8 finding (controlled-value capture regressed 17/37/26 ->
// 1/9/11 even though structural F1 improved).
//
// THE ONE DIFFERENCE FROM cq-non-regression.mjs'S CONTROL MECHANISM
// -------------------------------------------------------------------
// cq-non-regression.mjs's control arm reconstructs a no-longer-live prompt
// from a frozen fixture and checks it against a golden hash. Here, the
// CONTROL arm *is* the live, currently-shipped prompt (no override at all) --
// there is nothing to reconstruct. The TREATMENT arm is built by taking that
// same live text (fetched fresh via window.__kg.agent.buildSystemPrompt(), so
// it always reflects whatever is actually live on this checkout, not a
// possibly-stale copy pasted into this file) and applying two exact
// String.replace() edits, each asserted to match the live text exactly once
// before being applied. A live prompt that has drifted from what this file
// assumes throws immediately, rather than silently testing text nobody
// intended.
//
// The control arm also asserts its own hash against the one
// cq-non-regression.mjs recorded for the shipped treatment prompt
// (0173b3f3...) -- see PHASE6_CONSTRAINT_FIX.md §6's stated limitation. A
// mismatch means main's Phase 6/9(b) text moved again since that eval ran,
// and the two evals' baselines would no longer be the same prompt.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { launchChromium } from "../lib/browser.mjs";
import { APP_URL } from "../lib/page.mjs";
import { forwardToRealAzure, configureAzureEndpoint, openPanel } from "../lib/liveAzureOpenAi.mjs";
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";
import { DEFAULT_AZURE_API_VERSION } from "./lib/chatClient.mjs";
import { RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs } from "../lib/liveOpenAi.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONDITION = "phase6-constraint-fix";
const OUT_ROOT = path.join(__dirname, "results", "baselines", CONDITION);

// The shipped prompt's hash as cq-non-regression.mjs recorded it for its own
// treatment arm (results/baselines/competency-questions/treatment/run-0{1,2,3}
// /baseline-provenance.json, all three identical). This eval's control arm
// must reconstruct to the same value, or the two evals are not comparing the
// same baseline.
const SHIPPED_PROMPT_SHA256 = "0173b3f31cd00b5e776cffa2f2e6d3016686d98df6cbfa9e3a6ab4e1a0b0dee0";

const OLD_PHASE_6 = [
  "6. Constraints and fixed choices: for properties with a small value set,",
  "   capture the allowed list. Ask \"what breaks if this value is missing or",
  "   wrong?\" to decide if a property is required/bounded. Batch the allowed-",
  "   value question across several properties that clearly need one.",
].join("\n");

const NEW_PHASE_6 = [
  "6. Constraints and fixed choices: go through every property captured so",
  "   far, not only the ones that already look obviously enumerated — for each",
  "   one, decide out loud whether it takes one of a small, known set of values",
  "   (e.g. status, type, category, priority, severity, and similar) or is",
  "   free-form/numeric/open text. Capture the allowed list for every property",
  "   that fits the fixed-set case, and ask \"what breaks if this value is",
  "   missing or wrong?\" to decide if it's required/bounded. Batch the",
  "   allowed-value question across several properties at once (see GROUND",
  "   RULES) — batching only changes how many turns this takes, not which",
  "   properties get asked about. Before leaving this phase, call",
  "   get_graph_state and check the actual property list directly — any",
  "   property you have not explicitly classified as fixed-set or not is",
  "   unfinished, not something to defer to validation.",
].join("\n");

const OLD_CHECKLIST_CLAUSE = "fixed value lists are used where appropriate;";
const NEW_CHECKLIST_CLAUSE = "every property whose value is naturally a small fixed set (status, type, "
  + "category, priority, severity, and similar) has a captured allowed-value list;";

function replaceExactlyOnce(text, oldSub, newSub, label) {
  const count = text.split(oldSub).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly 1 occurrence of the substring to replace, found ${count} — `
      + "the live prompt has drifted from what this eval assumes; refusing to run a void comparison");
  }
  return text.split(oldSub).join(newSub);
}

function buildTreatmentPrompt(livePrompt) {
  let text = replaceExactlyOnce(livePrompt, OLD_PHASE_6, NEW_PHASE_6, "Phase 6 paragraph");
  text = replaceExactlyOnce(text, OLD_CHECKLIST_CLAUSE, NEW_CHECKLIST_CLAUSE, "Phase 9(b) checklist clause");
  return text;
}

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};

// Same pair CQ_NON_REGRESSION.md's primary batch used, on the same Azure
// resource, for direct comparability — this eval is a follow-up to that
// batch, not an independent design.
const MODEL = process.env.EVAL_INTERVIEWER_MODEL || "gpt-5.4";
const PERSONA_MODEL = process.env.ONTOLOGY_EVAL_PERSONA_MODEL || "gpt-4o-mini-internal";
const CLASSIFIER_MODEL = process.env.ONTOLOGY_EVAL_CLASSIFIER_MODEL || MODEL;
const REACHABLE_DEPLOYMENTS = (process.env.EVAL_AZURE_DEPLOYMENTS
  || "gpt-5.4,gpt-4o-mini-internal,gpt-4o,gpt-5-mini,o4-mini").split(",");
const MAX_TURNS = Number(process.env.ONTOLOGY_EVAL_MAX_TURNS) || 120;
const WALLCLOCK_MINUTES = Number(process.env.ONTOLOGY_EVAL_WALLCLOCK_MINUTES) || 45;

async function azureChatMessages({ endpoint, apiKey, apiVersion, model, messages, label }) {
  const url = `${endpoint}/openai/deployments/${model}/chat/completions?api-version=${apiVersion}`;
  for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (err) { data = { error: { message: text.slice(0, 500) } }; }
    if (res.ok) {
      const choice = data.choices && data.choices[0];
      const reply = (choice && choice.message && choice.message.content) || "";
      if (!reply.trim()) throw new Error(`${label}: provider returned an empty reply (finish_reason=${choice && choice.finish_reason})`);
      return { text: reply, usage: data.usage || null };
    }
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= RATE_LIMIT_MAX_ATTEMPTS) {
      throw new Error(`${label}: chat call failed: HTTP ${res.status} ${data && data.error && data.error.message}`);
    }
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : rateLimitBackoffMs(attempt);
    console.log(`  ${label}: HTTP ${res.status}, waiting ${Math.round(waitMs / 1000)}s before attempt ${attempt + 1}/${RATE_LIMIT_MAX_ATTEMPTS}`);
    await sleepMs(waitMs);
  }
  throw new Error(`${label}: exhausted retries`);
}

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

// Count of properties carrying a non-empty allowed-value list, read straight
// from the recovered YAML text -- deliberately a raw text count, not routed
// through the scorer's matching logic, because this is a recovered-model
// property (self-referential: does THIS run's own model have constrained
// properties), not a recovery-against-ground-truth measure. Matches how
// REPORT.md's 17/37/26 vs 1/9/11 counts were derived for the eval this
// follows up on.
function countAllowedValueLists(yamlText) {
  const matches = yamlText.match(/^\s*allowed:\s*\n(\s*-\s.+\n?)+/gm) || [];
  return matches.length;
}

async function main() {
  const armName = arg("arm");
  const runId = arg("run");
  if (!["control", "treatment"].includes(armName) || !runId) {
    console.error("Usage: node tests/evals/phase6-constraint-fix.mjs --arm=control|treatment --run=run-01");
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

    const livePrompt = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
    if (armName === "control") {
      const actualHash = sha256(livePrompt);
      if (actualHash !== SHIPPED_PROMPT_SHA256) {
        throw new Error(`control arm's live prompt does not match the hash cq-non-regression.mjs recorded `
          + `for the shipped treatment prompt (got ${actualHash}, expected ${SHIPPED_PROMPT_SHA256}) -- `
          + "main's Phase 6/9(b) text has moved since that eval ran; refusing to run a void comparison");
      }
      // No override: this arm runs the genuinely live, unmodified prompt.
    } else {
      // buildAgentSystemPrompt()'s override branch is
      // `agentState.systemPromptOverride + agentLanguageDirective()` -- it
      // appends the directive itself and does NOT append AGENT_KNOWLEDGE (see
      // that function's own comment: the override swaps in "a different
      // interviewer prompt entirely... without touching AGENT_SYSTEM_PROMPT_
      // BASE/AGENT_KNOWLEDGE", i.e. it REPLACES both, not just the base). So
      // an override string must already carry AGENT_KNOWLEDGE baked in, or
      // the treatment arm would silently lose domain-knowledge grounding --
      // a confound this eval's design (§1) explicitly rules out ("Nothing
      // else changes"). AGENT_KNOWLEDGE is not exposed as a separate value on
      // window.__kg, so it's recovered algebraically: a sentinel override
      // reveals exactly what the directive's own text is, and subtracting
      // that known suffix from the live (non-override) prompt yields
      // base+knowledge with no assumptions about either one's content.
      const sentinel = " EVAL_PROBE_SENTINEL ";
      await page.evaluate((s) => { window.__kg.agent.state.systemPromptOverride = s; }, sentinel);
      const probed = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
      if (!probed.startsWith(sentinel)) {
        throw new Error("sentinel probe did not round-trip through the override -- refusing to run a void comparison");
      }
      const directive = probed.slice(sentinel.length);
      if (!livePrompt.endsWith(directive)) {
        throw new Error("live prompt does not end with the probed language directive -- refusing to run a void comparison");
      }
      const baseAndKnowledge = livePrompt.slice(0, livePrompt.length - directive.length);
      const treatmentBaseAndKnowledge = buildTreatmentPrompt(baseAndKnowledge);
      await page.evaluate((prompt) => { window.__kg.agent.state.systemPromptOverride = prompt; }, treatmentBaseAndKnowledge);
      const actual = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
      if (actual !== treatmentBaseAndKnowledge + directive) {
        throw new Error("treatment arm prompt override did not take effect as built -- refusing to run a void comparison");
      }
    }
    const promptSha = sha256(await page.evaluate(() => window.__kg.agent.buildSystemPrompt()));
    writeProgress({ phase: "interviewing", turnsUsed: 0, promptSha256: promptSha });

    const result = await runOntologyRecoveryConversation({
      page,
      apiKey,
      personaModel: PERSONA_MODEL,
      classifierModel: CLASSIFIER_MODEL,
      maxTurns: MAX_TURNS,
      wallClockMs: WALLCLOCK_MINUTES * 60 * 1000,
      installRelay: (p) => forwardToRealAzure(p, `${endpoint}/openai/deployments/**`),
      chat: async (messages, model) => azureChatMessages({
        endpoint, apiKey,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || DEFAULT_AZURE_API_VERSION,
        model, messages, label: `${armName}/${runId} harness`,
      }),
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
    const allowedValueListCount = countAllowedValueLists(recoveredYaml);
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
      condition: `${CONDITION}/${armName}`,
      arm: armName, runId,
      generatedAt: new Date().toISOString(),
      model: MODEL, personaModel: PERSONA_MODEL, classifierModel: CLASSIFIER_MODEL,
      provider: "azure", endpoint,
      interviewerPromptSha256: promptSha,
      phase6FixApplied: armName === "treatment",
      stoppedReason: result.stoppedReason,
      turnsUsed: result.turnsUsed,
      wallClockSec: Math.round((Date.now() - startedAt) / 1000),
      applyToolCalls: applyCalls,
      getGraphStateCalls: graphStateCalls,
      allowedValueListCount,
      note: "Issue #96 follow-up to CQ_NON_REGRESSION.md. The control arm runs the genuinely live, "
        + "unmodified shipped prompt (verified against that eval's own recorded treatment-arm hash); the "
        + "treatment arm applies exactly two verified String.replace() edits (Phase 6 paragraph, Phase 9(b) "
        + "checklist clause) to that same live text. See PHASE6_CONSTRAINT_FIX.md for the full design. "
        + "The deployment LISTING is stubbed (this resource returns an empty list for deployments that are "
        + "callable); every chat call is a real relayed Azure call. Nothing under results/runs/ was read or written.",
    }, null, 2)}\n`);
    writeProgress({ phase: "done", turnsUsed: result.turnsUsed, stoppedReason: result.stoppedReason });
    console.log(`${armName}/${runId}: ${result.turnsUsed} turns, stopped=${result.stoppedReason}, `
      + `${applyCalls} apply calls, ${allowedValueListCount} allowed-value lists captured`);
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
