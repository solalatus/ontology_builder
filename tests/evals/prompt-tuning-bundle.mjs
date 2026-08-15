// PROMPT/BEHAVIOR TUNING BUNDLE EVALUATION (8 approved ideas from the ground-up review)
//
//   AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... \
//   node tests/evals/prompt-tuning-bundle.mjs --arm=control   --run=run-01
//   node tests/evals/prompt-tuning-bundle.mjs --arm=treatment --run=run-01
//
// See PROMPT_TUNING_BUNDLE.md for the pre-registered design, measures and
// pass criteria — nothing here should be read without that document. Same
// shape as phase6-constraint-fix.mjs: control is the live, unmodified shipped
// prompt (hash-verified); treatment applies a set of verified, exactly-once
// String.replace() edits to that same live text, each asserted to match
// before being applied, so a drifted live prompt aborts the run rather than
// silently testing stale text. AGENT_KNOWLEDGE is recovered algebraically via
// the same sentinel-probe technique phase6-constraint-fix.mjs introduced, so
// the treatment arm keeps the same knowledge grounding the control arm gets
// for free.
//
// Unlike phase6-constraint-fix.mjs's two edits, this bundle touches nine
// locations across GROUND RULES, Phase 5/6/7/8/9(b), CONSISTENCY CHECK and
// AGENT_KNOWLEDGE's own "Final check" list — eight ideas, several of which
// (rules consistency, the reconciled checklists) each touch more than one
// spot. See PROMPT_TUNING_BUNDLE.md §1 for which idea maps to which edit.
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

const CONDITION = "prompt-tuning-bundle";
const OUT_ROOT = path.join(__dirname, "results", "baselines", CONDITION);

// Same shipped-prompt hash phase6-constraint-fix.mjs verified against
// (results/baselines/competency-questions/treatment/run-0{1,2,3}/
// baseline-provenance.json, and re-confirmed by phase6-constraint-fix's own
// control arm). main's Phase 6/9(b) text has not moved since (the #96 fix
// was not merged), so this bundle's control arm must reconstruct to the
// same value.
const SHIPPED_PROMPT_SHA256 = "0173b3f31cd00b5e776cffa2f2e6d3016686d98df6cbfa9e3a6ab4e1a0b0dee0";

function replaceExactlyOnce(text, oldSub, newSub, label) {
  const count = text.split(oldSub).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly 1 occurrence of the substring to replace, found ${count} — `
      + "the live prompt has drifted from what this eval assumes; refusing to run a void comparison");
  }
  return text.split(oldSub).join(newSub);
}

// --- Edit 1 (ideas #2, #7): GROUND RULES gains two new bullets -----------
const OLD_GROUND_RULES_TAIL = [
  "- This is a general-purpose ontology-building tool for ANY domain -- not",
  "  specialized to any one field, industry, or process. Never reach for a",
  "  specific domain's vocabulary (e.g. borrowed from IT operations, retail,",
  "  healthcare, or any other one field) as your own illustrative example,",
  "  either in your own reasoning or in what you say to the expert. When you",
  "  need a concrete example, either use an abstract placeholder (Class A,",
  "  Role X, Team 1) or ground it in whatever the expert has actually told",
  "  you in this specific conversation -- never words carried over from a",
  "  different, unrelated domain.",
].join("\n");
const NEW_GROUND_RULES_TAIL = `${OLD_GROUND_RULES_TAIL}
- A phase that still has required work left is not optional — never offer
  the expert a choice between finishing it and skipping ahead to a later
  phase (e.g. validation). State plainly what's confirmed and what's still
  open; let them decide whether to continue in a follow-up session, but
  don't frame remaining required work itself as something to skip.
- Don't mistake your own or the expert's earlier wording being repeated
  back to you (a recap, an echoed reply) for a fresh confirmation of new
  content, and don't treat something as recorded because it reads like it
  was — call get_graph_state to check before relying on either.`;

// --- Edit 2 (ideas #6, #3): Phase 5 gains adaptive alias-stopping + a ------
// --- closing meaning-sentence check ---------------------------------------
const OLD_PHASE_5 = [
  "5. Language layer: for every class and relationship, capture one plain",
  "   meaning sentence; ask about aliases/synonyms explicitly (don't assume).",
  "   This phase is exactly the repeating-pattern case GROUND RULES describes —",
  "   batch meanings (then, separately, batch aliases) across several classes",
  "   or relationships rather than one exchange per item. Relationship aliases",
  "   are real, storable data (the relationships YAML shape has its own",
  "   aliases list, same as classes) — once the expert confirms a batch of",
  "   them, actually call apply_ontology_yaml with those aliases before moving",
  "   on. Don't let a good answer here become conversation-only.",
].join("\n");
const NEW_PHASE_5 = `${OLD_PHASE_5} If two batches in
   a row bring back no real aliases beyond what's already captured, stop
   actively soliciting more and move on — a domain that genuinely has
   little alternate terminology isn't a reason to keep asking, and the
   expert can always raise one later if it comes up. Before leaving this
   phase, call get_graph_state and check directly that every class and
   relationship has a meaning sentence — anything missing one is unfinished,
   not skippable.`;

// --- Edit 3 (idea #5): Phase 6 gains a batch cap + per-item justification -
const OLD_PHASE_6 = [
  "6. Constraints and fixed choices: for properties with a small value set,",
  "   capture the allowed list. Ask \"what breaks if this value is missing or",
  "   wrong?\" to decide if a property is required/bounded. Batch the allowed-",
  "   value question across several properties that clearly need one.",
].join("\n");
const NEW_PHASE_6 = [
  "6. Constraints and fixed choices: for properties with a small value set,",
  "   capture the allowed list. Ask \"what breaks if this value is missing or",
  "   wrong?\" for each property to decide if it's required/bounded — a real",
  "   answer per property, not one blanket answer for the whole batch. Batch",
  "   the allowed-value question across several properties that clearly need",
  "   one, capped at around 10 per batch so each one still gets a real answer",
  "   rather than a rushed pass through a long list.",
].join("\n");

// --- Edit 4 (idea #1): Phase 7 gains an authoring-time consistency check --
const OLD_PHASE_7 = [
  "7. Rules: capture named, plain-language condition lists only where a real",
  "   decision depends on them.",
].join("\n");
const NEW_PHASE_7 = [
  "7. Rules: capture named, plain-language condition lists only where a real",
  "   decision depends on them. Before recording a condition, check that",
  "   every property, relationship, or value it names is one you've actually",
  "   captured — if it refers to a status, category, or value that isn't in",
  "   that property's own allowed list, resolve which one is right (fix the",
  "   allowed list, or fix the condition) rather than recording a rule the",
  "   model can't actually be checked against.",
].join("\n");

// --- Edit 5 (idea #1): Phase 8 gains the same consistency discipline for --
// --- effect/verification text ---------------------------------------------
const OLD_PHASE_8_TAIL = [
  "   participant through a relationship, a property, or a precondition",
  "   instead of trying to give the action a second input. This is a",
  "   deliberate limit of this tool, not something to work around or",
  "   apologize for.",
].join("\n");
const NEW_PHASE_8_TAIL = `${OLD_PHASE_8_TAIL} Its effect and
   verification text should only reference properties and relationships
   that are actually in the model — if describing what changes or how to
   check it needs something not yet captured, capture that first rather
   than describing a check the model doesn't actually support.`;

// --- Edit 6 (idea #3): Phase 9(b) checklist gains a meaning-sentence item, -
// --- a strengthened constraint item, and a new rules-consistency item -----
const OLD_CHECKLIST_TAIL = "common synonyms are captured;\n"
  + "       fixed value lists are used where appropriate; important actions have\n"
  + "       explicit conditions.";
const NEW_CHECKLIST_TAIL = "common synonyms are captured; every class and "
  + "relationship has a meaning sentence; every property whose value is "
  + "naturally a small fixed set (status, type, category, priority, "
  + "severity, and similar) has a captured allowed-value list; every rule "
  + "and action only references properties, relationships, and values "
  + "actually captured in the model; important actions have\n"
  + "       explicit conditions.";

// --- Edit 7 (idea #10): Phase 9 closing gains a never-end-on-a-dangling-- --
// --- question requirement --------------------------------------------------
const OLD_PHASE_9_CLOSING = [
  "   If either check finds a real gap, go back and close it before continuing",
  "   — don't just note the gap and report the interview complete anyway.",
  "   Report the result of both checks to the expert plainly.",
].join("\n");
const NEW_PHASE_9_CLOSING = `${OLD_PHASE_9_CLOSING} If real gaps remain
   that can't be resolved in this session, say so as a named, itemized list
   of open items rather than leaving the conversation on an unanswered
   question — ending on an unresolved question is not the same as ending
   with a clear account of what's left.`;

// --- Edit 8 (idea #8): CONSISTENCY CHECK names inverse-relationship-pair --
// --- duplicates as a near-certain-real pattern -----------------------------
const OLD_CONSISTENCY_TAIL = [
  "are certain a reported problem is not real, you may leave it and carry on — but",
  "say so briefly rather than passing over it silently.",
].join("\n");
const NEW_CONSISTENCY_TAIL = `${OLD_CONSISTENCY_TAIL} One [warning] pattern
is almost always real, not a false positive: the same two classes connected
by both a relationship and its reverse (e.g. [Class A] --relatesTo-->
[Class B] alongside [Class B] --relatesTo--> [Class A], worded differently)
— this tool models one connection per pair, not both directions as separate
facts, so resolve which direction the expert actually uses and remove the
other rather than leaving both on the chance the warning might be wrong.`;

// --- Edit 9 (idea #3): AGENT_KNOWLEDGE's own "Final check" item 5 --------
// --- reconciled with the same wording as the Phase 9(b) checklist item ---
const OLD_KNOWLEDGE_ITEM_5 = "5. Are fixed value lists used where appropriate?";
const NEW_KNOWLEDGE_ITEM_5 = "5. Does every property whose value is naturally "
  + "a small fixed set (status, type, category, priority, severity, and "
  + "similar) have a captured allowed-value list?";

function buildTreatmentPrompt(livePrompt) {
  let text = livePrompt;
  text = replaceExactlyOnce(text, OLD_GROUND_RULES_TAIL, NEW_GROUND_RULES_TAIL, "GROUND RULES tail (ideas #2/#7)");
  text = replaceExactlyOnce(text, OLD_PHASE_5, NEW_PHASE_5, "Phase 5 (ideas #6/#3)");
  text = replaceExactlyOnce(text, OLD_PHASE_6, NEW_PHASE_6, "Phase 6 (idea #5)");
  text = replaceExactlyOnce(text, OLD_PHASE_7, NEW_PHASE_7, "Phase 7 (idea #1)");
  text = replaceExactlyOnce(text, OLD_PHASE_8_TAIL, NEW_PHASE_8_TAIL, "Phase 8 tail (idea #1)");
  text = replaceExactlyOnce(text, OLD_CHECKLIST_TAIL, NEW_CHECKLIST_TAIL, "Phase 9(b) checklist tail (idea #3)");
  text = replaceExactlyOnce(text, OLD_PHASE_9_CLOSING, NEW_PHASE_9_CLOSING, "Phase 9 closing (idea #10)");
  text = replaceExactlyOnce(text, OLD_CONSISTENCY_TAIL, NEW_CONSISTENCY_TAIL, "CONSISTENCY CHECK tail (idea #8)");
  text = replaceExactlyOnce(text, OLD_KNOWLEDGE_ITEM_5, NEW_KNOWLEDGE_ITEM_5, "AGENT_KNOWLEDGE Final check item 5 (idea #3)");
  return text;
}

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};

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

function countAllowedValueLists(yamlText) {
  const matches = yamlText.match(/^\s*allowed:\s*\n(\s*-\s.+\n?)+/gm) || [];
  return matches.length;
}

async function main() {
  const armName = arg("arm");
  const runId = arg("run");
  if (!["control", "treatment"].includes(armName) || !runId) {
    console.error("Usage: node tests/evals/prompt-tuning-bundle.mjs --arm=control|treatment --run=run-01");
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
        throw new Error(`control arm's live prompt does not match the recorded shipped-prompt hash `
          + `(got ${actualHash}, expected ${SHIPPED_PROMPT_SHA256}) -- `
          + "main's prompt text has moved since that hash was recorded; refusing to run a void comparison");
      }
    } else {
      const sentinel = " EVAL_PROBE_SENTINEL ";
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
      bundleApplied: armName === "treatment",
      stoppedReason: result.stoppedReason,
      turnsUsed: result.turnsUsed,
      wallClockSec: Math.round((Date.now() - startedAt) / 1000),
      applyToolCalls: applyCalls,
      getGraphStateCalls: graphStateCalls,
      allowedValueListCount,
      note: "8-idea prompt/behavior-tuning bundle from the ground-up review (ideas 1,2,3,5,6,7,8,10; "
        + "4,9,11,12 excluded per user selection). The control arm runs the genuinely live, unmodified "
        + "shipped prompt (verified against the recorded hash); the treatment arm applies nine verified "
        + "String.replace() edits (see PROMPT_TUNING_BUNDLE.md §1 for the idea-to-edit map) to that same "
        + "live text. The deployment LISTING is stubbed (this resource returns an empty list for "
        + "deployments that are callable); every chat call is a real relayed Azure call. Nothing under "
        + "results/runs/ was read or written.",
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
