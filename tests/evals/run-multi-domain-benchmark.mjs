// MULTI-DOMAIN ELICITATION BENCHMARK RUNNER (issue #111)
//
//   AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... \
//   node tests/evals/run-multi-domain-benchmark.mjs --domain=brick-hvac --run=run-01
//
// WHAT THIS ANSWERS
// ------------------
// The epic's own scientific objective (#101): "Does the ontology-elicitation
// method recover Agent Ontologies reliably across substantially different
// domains?" Runs one full live ontology-recovery interview (the same
// simulated-persona, real-app-agent conversation ontology-recovery.eval.spec.mjs
// runs for itops) against a single translated domain's own
// reference.domain.yaml + persona.md, scores it with every metric this repo
// has (heuristic + semantic classes/relationships/properties, heuristic +
// semantic rules/actions, both full-domain and practical-scope), and writes
// everything -- report, transcript, tool-call log, recovered model, raw
// judge responses -- to its own isolated results directory. Run once per
// domain (one process per --domain=, so a shell can launch all of them in
// parallel); summarize-multi-domain-benchmark.mjs then reads every domain's
// saved metrics.json (no API calls) and writes the cross-domain comparison.
//
// WHY AZURE, NOT OPENAI
// ----------------------
// No OPENAI_API_KEY is configured in this environment; AZURE_OPENAI_* is
// (the same resource ontology_translation/tools' compiler pipeline already
// spends against). tests/evals/lib/chatClient.mjs's chatOnce() and
// tests/lib/liveAzureOpenAi.mjs already carry full Azure support built for
// self-correction-eval.mjs's own non-regression runs -- reused here
// directly, not reimplemented. Every real call this eval makes -- the app
// agent (relayed through the browser), the persona, the completion
// classifier, the transcript review, and the LLM judge -- goes through the
// same AZURE_OPENAI_DEPLOYMENT.
//
// LIVE PROGRESS, CHECKPOINTING, IDEMPOTENCE
// -------------------------------------------
// Same three guarantees as self-correction-eval.mjs (see that file's own
// header for the fuller rationale): progress.json after every turn, a
// checkpoint/ directory with the transcript/tool-log/recovered-model so-far
// after every turn the app actually acted on, and a completed run
// (provenance.json already on disk) is never re-run or re-spent unless
// --force is passed.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { launchChromium } from "../lib/browser.mjs";
import { APP_URL } from "../lib/page.mjs";
import { forwardToRealAzure, configureAzureEndpoint, openPanel } from "../lib/liveAzureOpenAi.mjs";
import { execFileSync } from "node:child_process";
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";
import { deriveOpeningLine, WRAPPER_PATH } from "./lib/personaAgent.mjs";
import { chatMessagesOnce, sumUsage, DEFAULT_AZURE_API_VERSION } from "./lib/chatClient.mjs";
import {
  loadGroundTruthModel, scopeGroundTruth, resolveDomainYamlPath, resolveDomainPersonaPath, listAvailableDomains,
} from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics, computeHeuristicMatchPairs, computeRuleMetrics, computeActionMetrics } from "./lib/recoveryMetrics.mjs";
import { computeSemanticRecoveryMetrics, computeSemanticRuleActionMetrics } from "./lib/llmMatcher.mjs";
import {
  writeConversationLog, computeOperationalStats, generateLlmReview, writeReport, writeToolCallLog,
  writeRecoveredModelYaml, writeHeuristicMatches, writeSemanticJudgments, writeSemanticMatches,
} from "./lib/reportGenerator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_ROOT = path.resolve(__dirname, "..", "..", "ontology_translation", "results", "multi-domain");

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (err) { return null; }
}

// Issue #133/E8 (external audit): provenance.json previously recorded which
// files a run used (domainYamlPath, personaPath) but not what state they
// were actually IN at the time -- a domain.yaml, persona.md, or wrapper
// prompt edited after a run completed left the old run's provenance
// pointing at a path whose current content no longer matches what was
// really sent. Hashing the exact text makes a run's provenance verifiable
// against the repo at any later commit, not just trusted by path.
function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

// Best-effort -- a shallow clone or a source tree with no .git at all must
// never abort a real benchmark run just because its own provenance can't be
// fully stamped.
function currentCommitSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: __dirname, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};
const flag = (name) => process.argv.slice(2).includes(`--${name}`);

const MODEL = process.env.EVAL_INTERVIEWER_MODEL || process.env.AZURE_OPENAI_DEPLOYMENT;
const PERSONA_MODEL = process.env.ONTOLOGY_EVAL_PERSONA_MODEL || MODEL;
const CLASSIFIER_MODEL = process.env.ONTOLOGY_EVAL_CLASSIFIER_MODEL || MODEL;
const REVIEW_MODEL = process.env.ONTOLOGY_EVAL_REVIEW_MODEL || MODEL;
const MAX_TURNS = Number(process.env.ONTOLOGY_EVAL_MAX_TURNS) || 200;
const WALLCLOCK_MINUTES = Number(process.env.ONTOLOGY_EVAL_WALLCLOCK_MINUTES) || 45;

// Same deployment-vs-model-id gotcha self-correction-eval.mjs's own header
// documents: on Azure, "model" in the connect UI is a deployment NAME, and
// the app only offers deployments the resource's real /openai/deployments
// listing returns -- passing a model id that happens not to also be the
// deployment's name produces a 404 that reads like a missing resource, not
// a wrong model.
async function connectAzure(page, apiKey, endpoint, model) {
  const deploymentsUrl = `${endpoint.replace(/\/+$/, "")}/openai/deployments**`;
  forwardToRealAzure(page, deploymentsUrl);
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
  if (picked !== model) throw new Error(`deployment "${model}" not offered by the endpoint; got: ${picked}`);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 60000 });
}

async function main() {
  const domain = arg("domain");
  const runId = arg("run");
  if (!domain || !runId) {
    console.error("Usage: node tests/evals/run-multi-domain-benchmark.mjs --domain=<id> --run=<run-id> [--force]");
    console.error(`Available domains: ${listAvailableDomains().join(", ")}`);
    process.exit(1);
  }
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!endpoint || !apiKey || !MODEL) {
    console.error("AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT are required.");
    process.exit(1);
  }
  const domainYamlPath = resolveDomainYamlPath(domain); // throws with a clear "available domains" list if unknown
  const personaPath = resolveDomainPersonaPath(domain);
  if (!personaPath) { console.error(`Domain "${domain}" has no persona.md -- cannot run a live interview.`); process.exit(1); }

  const outDir = path.join(RESULTS_ROOT, runId, domain);
  // Issue #133/E10 (external audit): the completeness check used to be
  // plain existsSync(provenance.json) -- true for a provenance.json left
  // behind by a run that later failed partway through a --force redo just
  // as easily as a genuinely finished one, and provenance.json was written
  // *last*, after every other artifact, so a failed redo could leave a NEW
  // transcript/recovered-model sitting beside the OLD provenance/metrics,
  // silently mismatched. Now checks `status === "complete"` specifically,
  // and --force wipes the whole run directory before starting rather than
  // writing over it -- no partial overlap between an old run and a new one
  // is possible.
  const provenancePath = path.join(outDir, "provenance.json");
  const existingProvenance = fs.existsSync(provenancePath) ? readJsonSafe(provenancePath) : null;
  if (existingProvenance && existingProvenance.status === "complete" && !flag("force")) {
    console.log(`${domain}/${runId}: already complete -- skipping (pass --force to redo it)`);
    return;
  }
  if (flag("force") && fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  const runUuid = crypto.randomUUID();
  fs.mkdirSync(path.join(outDir, "checkpoint"), { recursive: true });
  // Written immediately, before any real work starts, and overwritten with
  // the full version (same runUuid) only once every other artifact this
  // run produces has already landed -- so a run that dies partway through
  // leaves an unambiguous `status: "in-progress"` marker behind instead of
  // no marker (silently re-run-able, fine) or a stale "complete" one
  // (silently trusted as done, not fine).
  fs.writeFileSync(provenancePath, `${JSON.stringify({ schemaVersion: 1, domain, runId, runUuid, status: "in-progress", startedAt: new Date().toISOString() }, null, 2)}\n`);
  const progressPath = path.join(outDir, "progress.json");
  const startedAt = Date.now();
  const writeProgress = (extra) => {
    try {
      fs.writeFileSync(progressPath, `${JSON.stringify({
        domain, runId, model: MODEL, startedAt: new Date(startedAt).toISOString(),
        elapsedSec: Math.round((Date.now() - startedAt) / 1000), ...extra,
      }, null, 1)}\n`);
    } catch (err) { /* progress reporting must never break the run */ }
  };
  writeProgress({ phase: "starting", turnsUsed: 0 });

  // The one Node-side call every real API call this eval makes ends up
  // routed through -- app agent (via the relay below), persona, classifier,
  // review, and the LLM judge alike. One provider config, one place a
  // future non-Azure run would need to change. usages accumulates every
  // call's token usage for issue #111's "tokens/cost where available"
  // per-domain report requirement (see the app-agent-side usages folded in
  // below, after the orchestrator finishes -- this array only covers the
  // persona/classifier/review/judge side, not the app agent's own calls,
  // which are relayed straight to Azure and never pass through here).
  //
  // chatMessagesOnce, not chatOnce (issue #133/Finding C): chatOnce only
  // ever accepted a single system+user pair, so routing personaAgent.mjs's
  // own growing multi-turn `messages` array through it meant flattening
  // every prior turn into one undifferentiated blob with the roles
  // stripped -- the exact pattern cq-non-regression.mjs's own header
  // documents as having caused a persona to re-emit its scripted opening
  // line on all 19 turns of a real run. `messages` is sent to
  // chatMessagesOnce exactly as given, roles intact -- a no-op difference
  // for the classifier/review/judge's own always-2-message calls, and the
  // real fix for the persona's real conversation.
  const usages = [];
  const chat = async (messages, model) => {
    const call = await chatMessagesOnce({
      config: { provider: "azure", endpoint, apiKey, apiVersion: process.env.AZURE_OPENAI_API_VERSION || DEFAULT_AZURE_API_VERSION },
      model, messages,
      label: `${domain}/${runId}`,
    });
    if (call.usage) usages.push(call.usage);
    // finishReason threaded through (issue #133/E1): llmMatcher.mjs's
    // callJudge hard-fails on "length" rather than silently scoring a
    // truncated judge response as if it were a complete all-NO-MATCH one.
    return { text: call.reply, usage: call.usage, finishReason: call.finishReason };
  };

  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const checkpointDir = path.join(outDir, "checkpoint");
  const checkpoint = async (log, rawApiLog) => {
    fs.writeFileSync(path.join(checkpointDir, "conversation-log.md"),
      log.map((e) => `### turn ${e.turn} — ${e.speaker}\n\n${e.text}\n`).join("\n"));
    fs.writeFileSync(path.join(checkpointDir, "raw-api-log.json"), `${JSON.stringify(rawApiLog, null, 1)}\n`);
    fs.writeFileSync(path.join(checkpointDir, "recovered-model.yaml"),
      await page.evaluate(() => window.buildDomainYamlExport()));
  };

  try {
    await page.goto(APP_URL);
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
    await page.evaluate(() => window.__kg.welcome.close());
    writeProgress({ phase: "connecting", turnsUsed: 0 });
    await connectAzure(page, apiKey, endpoint, MODEL);

    // Issue #133/E8: the app's own real system prompt, fetched from the live
    // page rather than re-derived statically -- buildAgentSystemPrompt() is
    // the exact function index.html itself calls to build each request
    // (see its own call site), so hashing its actual return value can never
    // drift out of sync with what index.html's prompt-building code changes
    // to later.
    const interviewerPromptText = await page.evaluate(() => window.buildAgentSystemPrompt());

    const openingLine = deriveOpeningLine(fs.readFileSync(personaPath, "utf8"));
    const groundTruthText = fs.readFileSync(domainYamlPath, "utf8");
    writeProgress({ phase: "interviewing", turnsUsed: 0 });

    const orchestratorResult = await runOntologyRecoveryConversation({
      page, apiKey, personaModel: PERSONA_MODEL, classifierModel: CLASSIFIER_MODEL,
      maxTurns: MAX_TURNS, wallClockMs: WALLCLOCK_MINUTES * 60 * 1000,
      installRelay: (p) => forwardToRealAzure(p, `${endpoint}/openai/deployments/**`),
      chat,
      personaPath, groundTruthText, groundTruthFilename: "reference.domain.yaml", groundTruthFormat: "domain-yaml", openingLine,
      onProgress: ({ phase, turn, turnsUsed, durationMs, log, rawApiLog }) => {
        writeProgress({ phase, turn, turnsUsed, durationSec: Math.round(durationMs / 1000), logEntries: log.length });
        if (phase !== "app_turn_complete") return;
        checkpoint(log, rawApiLog).catch(() => { /* best effort, never fatal */ });
      },
    });

    if (orchestratorResult.turnsUsed < 1) throw new Error("expected at least one real turn to happen");
    if (orchestratorResult.chatResponses.length < 1) throw new Error("expected at least one real app-agent API call");

    const recoveredState = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes, edges: window.__kg.state.edges,
      rules: window.__kg.state.rules, actions: window.__kg.state.actions,
    }));
    const recoveredModelYaml = await page.evaluate(() => window.buildDomainYamlExport());
    writeRecoveredModelYaml(recoveredModelYaml, { dir: outDir });

    const groundTruth = loadGroundTruthModel({ format: "domain-yaml", path: domainYamlPath });
    const metrics = computeRecoveryMetrics(groundTruth, recoveredState);
    const scopedGroundTruth = scopeGroundTruth(groundTruth, groundTruth.practicalScopeClassIds, groundTruth.practicalScopePropertyIds);
    const scopedMetrics = computeRecoveryMetrics(scopedGroundTruth, recoveredState);
    if (!Number.isFinite(metrics.recoveryEffectiveness) || !Number.isFinite(scopedMetrics.recoveryEffectiveness)) {
      throw new Error("composite recovery-effectiveness score is not a real number (NaN) -- refusing to write a broken report");
    }
    writeHeuristicMatches(computeHeuristicMatchPairs(groundTruth, recoveredState), { dir: outDir });
    const ruleMetrics = computeRuleMetrics(groundTruth, recoveredState.rules || []);
    const actionMetrics = computeActionMetrics(groundTruth, recoveredState);

    const operationalStats = computeOperationalStats(orchestratorResult);
    const appAgentUsages = orchestratorResult.chatResponses
      .map((r) => r.body && r.body.usage)
      .filter(Boolean);
    const totalUsage = sumUsage([...usages, ...appAgentUsages]);
    operationalStats.totalTokens = totalUsage.total_tokens;
    operationalStats.promptTokens = totalUsage.prompt_tokens;
    operationalStats.completionTokens = totalUsage.completion_tokens;
    operationalStats.tokenCallCount = totalUsage.calls;
    writeConversationLog(orchestratorResult, { dir: outDir });
    writeToolCallLog(orchestratorResult.rawApiLog, { dir: outDir });
    writeProgress({ phase: "scoring", turnsUsed: orchestratorResult.turnsUsed });
    const llmReviewText = await generateLlmReview({ apiKey, model: REVIEW_MODEL, orchestratorResult, chat });

    let semanticMetrics = null, semanticScopedMetrics = null, semanticRuleActionMetrics = null;
    try {
      semanticMetrics = await computeSemanticRecoveryMetrics({ groundTruth, recoveredState, apiKey, model: CLASSIFIER_MODEL, chat });
      semanticScopedMetrics = await computeSemanticRecoveryMetrics({ groundTruth: scopedGroundTruth, recoveredState, apiKey, model: CLASSIFIER_MODEL, chat });
      semanticRuleActionMetrics = await computeSemanticRuleActionMetrics({ groundTruth, recoveredState, apiKey, model: CLASSIFIER_MODEL, chat });
    } catch (err) {
      console.error(`${domain}/${runId}: semantic judge pass failed, continuing with heuristic-only report: ${String((err && err.message) || err)}`);
      semanticMetrics = null; semanticScopedMetrics = null; semanticRuleActionMetrics = null;
    }
    writeSemanticJudgments({ fullDomain: semanticMetrics, scoped: semanticScopedMetrics }, { dir: outDir });
    writeSemanticMatches({ fullDomain: semanticMetrics, scoped: semanticScopedMetrics }, { dir: outDir });

    writeReport({
      metrics, scopedMetrics, semanticMetrics, semanticScopedMetrics, operationalStats, orchestratorResult,
      llmReviewText, interviewerModel: MODEL, personaModel: PERSONA_MODEL, classifierModel: CLASSIFIER_MODEL, dir: outDir,
      ruleMetrics, actionMetrics, semanticRuleActionMetrics,
    });

    // Consolidated, machine-readable metrics for summarize-multi-domain-
    // benchmark.mjs's own cross-domain comparison pass -- reading this one
    // file instead of re-deriving anything from report.md's prose.
    fs.writeFileSync(path.join(outDir, "metrics.json"), `${JSON.stringify({
      domain, runId, runUuid, metrics, scopedMetrics, semanticMetrics, semanticScopedMetrics,
      ruleMetrics, actionMetrics, semanticRuleActionMetrics, operationalStats,
    }, null, 2)}\n`);

    // Overwrites the "in-progress" marker written at the top of main()
    // (issue #133/E10) -- same runUuid, now status: "complete", and only
    // reached once every other artifact this run produces has already
    // landed on disk. A run that dies before here leaves the in-progress
    // marker behind, which the completeness check above correctly does not
    // treat as done.
    fs.writeFileSync(provenancePath, `${JSON.stringify({
      schemaVersion: 1, domain, runId, runUuid, status: "complete", generatedAt: new Date().toISOString(),
      model: MODEL, personaModel: PERSONA_MODEL, classifierModel: CLASSIFIER_MODEL,
      // The endpoint hostname identifies a specific Azure resource (and, in
      // practice, the account/organization behind it) -- not a credential,
      // but not something that belongs in committed, potentially-public
      // provenance either now that issue #133/E9 un-ignores this file.
      // Hashed instead of stored raw: still lets two runs be verified as
      // having used the same resource without disclosing which one.
      provider: "azure", endpointSha256: sha256(endpoint),
      domainYamlPath: path.relative(path.resolve(__dirname, "..", ".."), domainYamlPath),
      personaPath: path.relative(path.resolve(__dirname, "..", ".."), personaPath),
      stoppedReason: orchestratorResult.stoppedReason,
      turnsUsed: orchestratorResult.turnsUsed,
      wallClockSec: Math.round((Date.now() - startedAt) / 1000),
      semanticJudgingSucceeded: semanticMetrics !== null,
      // Issue #133/E4: a run that hit real API errors or lost history to
      // compaction previously looked identical to a clean one everywhere
      // provenance is read from -- surfaced here so a consumer can exclude
      // or flag it rather than silently averaging it in at full weight.
      degraded: operationalStats.degraded,
      errorCounts: operationalStats.errorCounts,
      compactionEvents: operationalStats.compactionEvents,
      // Issue #133/E8: what exact prompts/ground-truth text and what exact
      // repo state actually produced this run -- verifiable against the
      // repo at any later commit, not just trusted from a path string that
      // may have since been edited.
      repoCommitSha: currentCommitSha(),
      interviewerPromptSha256: sha256(interviewerPromptText),
      personaPromptSha256: sha256(fs.readFileSync(personaPath, "utf8")),
      groundTruthSha256: sha256(groundTruthText),
      wrapperSha256: sha256(fs.readFileSync(WRAPPER_PATH, "utf8")),
    }, null, 2)}\n`);

    writeProgress({ phase: "done", turnsUsed: orchestratorResult.turnsUsed, stoppedReason: orchestratorResult.stoppedReason });
    console.log(`${domain}/${runId}: done. ${orchestratorResult.turnsUsed} turns, stopped=${orchestratorResult.stoppedReason}, `
      + `recoveryEffectiveness(full)=${metrics.recoveryEffectiveness.toFixed(3)} (scoped)=${scopedMetrics.recoveryEffectiveness.toFixed(3)}`);
  } catch (err) {
    const message = String((err && err.message) || err);
    const kind = /insufficient_quota|exceeded your current quota|billing/i.test(message) ? "out_of_funds"
      : /401|invalid[_ ]api[_ ]key|Access denied|Unauthorized/i.test(message) ? "auth_failed"
      : /429/.test(message) ? "rate_limited"
      : "error";
    writeProgress({ phase: "failed", failureKind: kind, error: message.slice(0, 600) });
    console.error(`${domain}/${runId}: FAILED (${kind}) — ${message.slice(0, 300)}`);
    console.error(`Partial transcript/model are in ${path.relative(process.cwd(), checkpointDir)}; re-running resumes.`);
    process.exitCode = kind === "out_of_funds" ? 3 : 1;
  } finally {
    await browser.close();
  }
}

await main();
