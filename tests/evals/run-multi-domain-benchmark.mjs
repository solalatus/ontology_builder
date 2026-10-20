// MULTI-DOMAIN ELICITATION BENCHMARK RUNNER (issue #111)
//
//   node tests/evals/run-multi-domain-benchmark.mjs --domain=brick-hvac --run=run-01
//
// with the provider's credentials in the repo-root .env (OpenAI, Azure OpenAI
// or AWS Bedrock; see tests/lib/llmProvider.mjs).
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
// WHICH PROVIDER
// --------------
// Whichever tests/lib/llmProvider.mjs resolves from the environment (issue
// #183): OpenAI, Azure OpenAI or AWS Bedrock. The runs committed so far were
// made on Azure OpenAI, the only provider configured at the time. Every real
// call this eval makes -- the app agent (relayed through the browser), the
// persona, the completion classifier, the transcript review, and the LLM
// judge -- goes to that one provider, with one model unless a per-role
// variable below says otherwise.
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
import { forwardChatToRealProvider, connectAgentLiveProvider } from "../lib/liveProvider.mjs";
import { llmEnv, resolveLlmConfig, missingCredentials, defaultModel } from "../lib/llmProvider.mjs";
import { execFileSync } from "node:child_process";
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";
import { deriveOpeningLine, WRAPPER_PATH } from "./lib/personaAgent.mjs";
import { chatMessagesOnce } from "./lib/chatClient.mjs";
import {
  loadGroundTruthModel, scopeGroundTruth, resolveDomainYamlPath, resolveDomainPersonaPath, listAvailableDomains,
} from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics, computeHeuristicMatchPairs, computeRuleMetrics, computeActionMetrics } from "./lib/recoveryMetrics.mjs";
import { computeSemanticRecoveryMetrics, computeSemanticRuleActionMetrics } from "./lib/llmMatcher.mjs";
import {
  writeConversationLog, computeOperationalStats, generateLlmReview, writeReport, writeToolCallLog,
  writeRecoveredModelYaml, writeHeuristicMatches, writeSemanticJudgments, writeSemanticMatches,
  writeModelSanitizerFindings,
} from "./lib/reportGenerator.mjs";
import yaml from "js-yaml";
import { findModelIssues } from "./lib/modelSanitizer.mjs";
import { createStageController, DEFAULT_STAGE_TURN_CAPS } from "./lib/pairedStages.mjs";
import { runCost, pricesFromEnv } from "./lib/runCost.mjs";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { rescoreRun } from "./rescore-saved-run.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_RESULTS_ROOT = path.resolve(__dirname, "..", "..", "ontology_translation", "results", "multi-domain");

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

const ENV = llmEnv();
const LLM = resolveLlmConfig(ENV);
// No built-in default: a benchmark run names its model (LLM_MODEL, or the
// provider's own AZURE_OPENAI_DEPLOYMENT / BEDROCK_MODEL).
const MODEL = ENV.EVAL_INTERVIEWER_MODEL || defaultModel(LLM, null, ENV);
const PERSONA_MODEL = ENV.ONTOLOGY_EVAL_PERSONA_MODEL || MODEL;
const CLASSIFIER_MODEL = ENV.ONTOLOGY_EVAL_CLASSIFIER_MODEL || MODEL;
const REVIEW_MODEL = ENV.ONTOLOGY_EVAL_REVIEW_MODEL || MODEL;
// Issue #181: the interviewer's reasoning effort, chosen in the connect
// dialog like a user would; unset means the app's default (`medium`). The
// effort actually sent is read back from the app and recorded below.
const REASONING_EFFORT = ENV.EVAL_REASONING_EFFORT || null;
const MAX_TURNS = Number(ENV.ONTOLOGY_EVAL_MAX_TURNS) || 200;
const WALLCLOCK_MINUTES = Number(ENV.ONTOLOGY_EVAL_WALLCLOCK_MINUTES) || 45;
// Issue #182: the paired stages after the interviewer's own wrap-up --
// snapshot A, the coverage sweep (#179), snapshot B, the naming pass (#180),
// snapshot C. Off unless asked for; with both off a run is exactly what it
// always was.
const COVERAGE_SWEEP = ENV.ONTOLOGY_EVAL_COVERAGE_SWEEP === "1";
const NAMING_PASS = ENV.ONTOLOGY_EVAL_NAMING_PASS === "1";
// Snapshot A alone (issue #187's measurement): the interview to its own
// wrap-up, scored exactly like a paired-stage snapshot, no stages injected.
const SNAPSHOT_AT_WRAPUP = ENV.ONTOLOGY_EVAL_SNAPSHOT_AT_WRAPUP === "1";
const STAGES = COVERAGE_SWEEP || NAMING_PASS || SNAPSHOT_AT_WRAPUP;
const SWEEP_MAX_ROUNDS = Number(ENV.ONTOLOGY_EVAL_SWEEP_MAX_ROUNDS) || 3;
const STAGE_TURN_CAPS = {
  sweepRound: Number(ENV.ONTOLOGY_EVAL_SWEEP_ROUND_TURN_CAP) || DEFAULT_STAGE_TURN_CAPS.sweepRound,
  sweepCloseout: Number(ENV.ONTOLOGY_EVAL_SWEEP_CLOSEOUT_TURN_CAP) || DEFAULT_STAGE_TURN_CAPS.sweepCloseout,
  naming: Number(ENV.ONTOLOGY_EVAL_NAMING_TURN_CAP) || DEFAULT_STAGE_TURN_CAPS.naming,
};
// One app turn may take this long before the run counts as hung. An explicit
// effort on a long transcript is slower per call than the old default (#181).
const APP_TURN_TIMEOUT_MS = (Number(ENV.ONTOLOGY_EVAL_APP_TURN_TIMEOUT_SEC) || 90) * 1000;
// A per-run spending ceiling, checked before every turn against the running
// cost of both the app's and the harness's calls. Unset: no ceiling.
const RUN_COST_CAP_USD = Number(ENV.EVAL_RUN_COST_CAP_USD) || null;
const PRICES = pricesFromEnv(ENV);

async function main() {
  const domain = arg("domain");
  const runId = arg("run");
  if (!domain || !runId) {
    console.error("Usage: node tests/evals/run-multi-domain-benchmark.mjs --domain=<id> --run=<run-id> [--force] [--resultsDir=<path>]");
    console.error(`Available domains: ${listAvailableDomains().join(", ")}`);
    process.exit(1);
  }
  // Issue #137: a clearly-named sibling results directory (e.g. a
  // contamination-free control-domain arm) needs to write somewhere other
  // than ontology_translation/results/multi-domain/ without mixing into
  // the 4-domain macro statistics that directory's own summarizer pass
  // computes. Defaults to the original hardcoded path -- every existing
  // call site is completely unaffected. Relative paths resolve against the
  // current working directory, matching how a shell would interpret any
  // other CLI path argument.
  const RESULTS_ROOT = path.resolve(process.cwd(), arg("resultsDir", DEFAULT_RESULTS_ROOT));
  const missing = missingCredentials(LLM);
  if (missing || !MODEL) {
    console.error(missing || "Set LLM_MODEL (or AZURE_OPENAI_DEPLOYMENT / BEDROCK_MODEL) to the interviewer model.");
    process.exit(1);
  }
  const { apiKey } = LLM;
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
  const chat = async (messages, model, extraBody = {}) => {
    const call = await chatMessagesOnce({
      config: LLM,
      model, messages, extraBody,
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
  // The running cost (issue #182), refreshed before every turn and shown in
  // progress.json so a run can be followed, and stopped, while it is going.
  let latestCost = null;
  const refreshCost = async () => {
    try {
      const appUsageLog = await page.evaluate(() => window.__kg.agent.state.usage);
      latestCost = runCost({ appUsageLog, harnessUsages: usages, prices: PRICES });
    } catch (err) { /* the page may be mid-navigation; keep the last figure */ }
    return latestCost;
  };
  const costLine = () => (latestCost ? {
    costUsd: Number(latestCost.all.costUsd.toFixed(3)),
    appCalls: latestCost.app.calls,
    promptTokens: latestCost.all.promptTokens,
    cachedShare: latestCost.all.cachedShare === null ? null : Number(latestCost.all.cachedShare.toFixed(3)),
    reasoningTokens: latestCost.all.reasoningTokens,
  } : {});
  const stageSnapshots = [];
  let stageController = null;
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
    // On Azure the model is a deployment name, offered only if the
    // resource's own deployment listing returns it; a name that isn't
    // fails here rather than as a 404 mid-interview.
    await connectAgentLiveProvider(page, LLM, { model: MODEL, reasoningEffort: REASONING_EFFORT });
    const reasoningEffort = await page.evaluate(() => window.__kg.agent.effectiveReasoningEffort());

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

    if (STAGES) {
      const exportDoc = async () => yaml.load(await page.evaluate(() => window.buildDomainYamlExport())) || {};
      stageController = createStageController({
        sweep: COVERAGE_SWEEP, naming: NAMING_PASS, sweepMaxRounds: SWEEP_MAX_ROUNDS, turnCaps: STAGE_TURN_CAPS, lang: "en",
        // Each snapshot is written the moment it is taken, so a run that
        // dies later still keeps it, together with the running cost at that
        // moment (the per-stage cost is the difference between two).
        captureSnapshot: async (label, { turn, stage }) => {
          const text = await page.evaluate(() => window.buildDomainYamlExport());
          const dir = path.join(outDir, "snapshots", label);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, "recovered-model.yaml"), text);
          const cost = await refreshCost();
          const entry = { label, turn, stage, takenAt: new Date().toISOString(), elapsedSec: Math.round((Date.now() - startedAt) / 1000),
            cost: cost && { all: cost.all, app: cost.app, harness: cost.harness } };
          fs.writeFileSync(path.join(dir, "snapshot.json"), `${JSON.stringify(entry, null, 2)}\n`);
          stageSnapshots.push({ ...entry, yamlText: text });
          console.log(`${domain}/${runId}: snapshot ${label} at turn ${turn} ($${cost ? cost.all.costUsd.toFixed(2) : "?"} so far)`);
          return yaml.load(text) || {};
        },
        readModel: exportDoc,
        renameLog: () => page.evaluate(() => window.__kg.agent.state.renameLog),
        log: (line) => console.log(`${domain}/${runId}: ${line}`),
      });
    }

    const orchestratorResult = await runOntologyRecoveryConversation({
      page, apiKey, personaModel: PERSONA_MODEL, classifierModel: CLASSIFIER_MODEL,
      maxTurns: MAX_TURNS, wallClockMs: WALLCLOCK_MINUTES * 60 * 1000,
      installRelay: (p) => forwardChatToRealProvider(p, LLM),
      chat,
      personaPath, groundTruthText, groundTruthFilename: "reference.domain.yaml", groundTruthFormat: "domain-yaml", openingLine,
      appTurnTimeoutMs: APP_TURN_TIMEOUT_MS,
      stageController,
      shouldStop: async () => {
        const cost = await refreshCost();
        if (RUN_COST_CAP_USD && cost && cost.all.costUsd >= RUN_COST_CAP_USD) {
          console.error(`${domain}/${runId}: cost cap reached ($${cost.all.costUsd.toFixed(2)} >= $${RUN_COST_CAP_USD}), stopping`);
          return "cost_cap_reached";
        }
        return null;
      },
      onProgress: ({ phase, turn, turnsUsed, durationMs, log, rawApiLog }) => {
        writeProgress({
          phase, turn, turnsUsed, durationSec: Math.round(durationMs / 1000), logEntries: log.length,
          ...(stageController ? { stage: stageController.stage, sweepRound: stageController.round, snapshots: stageSnapshots.map((x) => `${x.label}@${x.turn}`) } : {}),
          ...costLine(),
        });
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
    // Issue #140: report-only, offline (no model call) content-quality scan
    // of the export the run itself just produced -- never strips anything
    // from this run's own recovered-model.yaml, only records what a human
    // reviewer would flag (leftover deletion-sentinel text, duplicate/
    // self-loop relationships). Best-effort: a parse failure here must never
    // fail an otherwise-successful run over a report-only side artifact.
    try {
      writeModelSanitizerFindings(findModelIssues(yaml.load(recoveredModelYaml) || {}), { dir: outDir });
    } catch (err) {
      console.error(`model-sanitizer scan failed (non-fatal): ${err.message}`);
    }

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
    // The app's own usage log, not the relayed bodies: a Responses API body
    // reports input_tokens/output_tokens, which summing body.usage.prompt_tokens
    // counted as zero (issue #182). The log is normalized and has cached
    // tokens; the conversation's cost as of its last turn, before scoring.
    const conversationCost = runCost({ appUsageLog: await page.evaluate(() => window.__kg.agent.state.usage), harnessUsages: usages, prices: PRICES });
    operationalStats.totalTokens = conversationCost.all.promptTokens + conversationCost.all.completionTokens;
    operationalStats.promptTokens = conversationCost.all.promptTokens;
    operationalStats.completionTokens = conversationCost.all.completionTokens;
    operationalStats.cachedTokens = conversationCost.all.cachedTokens;
    operationalStats.cachedShare = conversationCost.all.cachedShare;
    operationalStats.reasoningTokens = conversationCost.all.reasoningTokens;
    operationalStats.tokenCallCount = conversationCost.all.calls;
    operationalStats.conversationCostUsd = conversationCost.all.costUsd;
    operationalStats.appCost = conversationCost.app;
    operationalStats.appCostByKind = conversationCost.appByKind;
    operationalStats.harnessCost = conversationCost.harness;
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

    // Issue #182: every snapshot scored the same way, from its own
    // recovered-model.yaml (the path rescore-saved-run.mjs takes), with its
    // own judge verdicts stored beside it, so B - A and C - B are computed on
    // one scoring path and can be replayed offline. The offline replay is run
    // here once as a check that it reproduces the live numbers.
    const snapshotScores = [];
    for (const snap of stageSnapshots) {
      writeProgress({ phase: `scoring_snapshot_${snap.label}`, turnsUsed: orchestratorResult.turnsUsed, ...costLine() });
      const dir = path.join(outDir, "snapshots", snap.label);
      const { state, droppedEdges } = recoveredStateFromYaml(snap.yamlText);
      const sm = computeRecoveryMetrics(groundTruth, state);
      const ssm = computeRecoveryMetrics(scopedGroundTruth, state);
      writeHeuristicMatches(computeHeuristicMatchPairs(groundTruth, state), { dir });
      let sem = null, semScoped = null, semRuleAction = null;
      try {
        sem = await computeSemanticRecoveryMetrics({ groundTruth, recoveredState: state, apiKey, model: CLASSIFIER_MODEL, chat });
        semScoped = await computeSemanticRecoveryMetrics({ groundTruth: scopedGroundTruth, recoveredState: state, apiKey, model: CLASSIFIER_MODEL, chat });
        semRuleAction = await computeSemanticRuleActionMetrics({ groundTruth, recoveredState: state, apiKey, model: CLASSIFIER_MODEL, chat });
      } catch (err) {
        console.error(`${domain}/${runId}: semantic judge pass failed on snapshot ${snap.label}, heuristic only: ${String((err && err.message) || err)}`);
        sem = null; semScoped = null; semRuleAction = null;
      }
      writeSemanticJudgments({ fullDomain: sem, scoped: semScoped }, { dir });
      writeSemanticMatches({ fullDomain: sem, scoped: semScoped }, { dir });
      const counts = {
        classes: state.nodes.length,
        relationships: state.edges.length,
        properties: state.nodes.reduce((n, x) => n + x.properties.length, 0),
        allowedValueLists: state.nodes.reduce((n, x) => n + x.properties.filter((pr) => (pr.allowed || []).length > 0).length, 0),
        rules: state.rules.length,
        actions: state.actions.length,
        droppedEdges,
      };
      const replay = rescoreRun(dir, domain);
      const same = (a, b) => (a === null || a === undefined || b === null || b === undefined ? a == b : Math.abs(a - b) < 1e-9);
      const offlineRescoreAgrees = same(replay.heuristic.full.recoveryEffectiveness, sm.recoveryEffectiveness)
        && same(replay.heuristic.practical.recoveryEffectiveness, ssm.recoveryEffectiveness)
        && same(replay.semantic.full && replay.semantic.full.recoveryEffectiveness, sem && sem.recoveryEffectiveness);
      if (!offlineRescoreAgrees) console.error(`${domain}/${runId}: WARNING snapshot ${snap.label}: the offline rescore does not reproduce the live score`);
      const entry = {
        label: snap.label, turn: snap.turn, stage: snap.stage, elapsedSec: snap.elapsedSec, counts,
        metrics: sm, scopedMetrics: ssm, semanticMetrics: sem, semanticScopedMetrics: semScoped,
        ruleMetrics: computeRuleMetrics(groundTruth, state.rules || []), actionMetrics: computeActionMetrics(groundTruth, state),
        semanticRuleActionMetrics: semRuleAction, offlineRescoreAgrees,
      };
      fs.writeFileSync(path.join(dir, "metrics.json"), `${JSON.stringify(entry, null, 2)}\n`);
      snapshotScores.push(entry);
      console.log(`${domain}/${runId}: snapshot ${snap.label} composite(full)=${sm.recoveryEffectiveness.toFixed(3)} (scoped)=${ssm.recoveryEffectiveness.toFixed(3)}`
        + (sem ? ` semantic=${sem.recoveryEffectiveness.toFixed(3)}` : ""));
    }
    const finalCost = await refreshCost();

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
      // Issue #182: the per-snapshot scores, compact (the full entries are in snapshots/<label>/metrics.json).
      snapshots: snapshotScores.map((x) => ({
        label: x.label, turn: x.turn, counts: x.counts, offlineRescoreAgrees: x.offlineRescoreAgrees,
        composite: x.metrics.recoveryEffectiveness, scopedComposite: x.scopedMetrics.recoveryEffectiveness,
        semanticComposite: x.semanticMetrics ? x.semanticMetrics.recoveryEffectiveness : null,
      })),
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
      // The interviewer's effort as sent (issue #181); null for a
      // non-reasoning model, which never gets the parameter.
      reasoningEffort,
      // The endpoint hostname can identify a specific Azure resource (and, in
      // practice, the account/organization behind it) -- not a credential,
      // but not something that belongs in committed, potentially-public
      // provenance either now that issue #133/E9 un-ignores this file.
      // Hashed instead of stored raw: still lets two runs be verified as
      // having used the same resource without disclosing which one.
      provider: LLM.provider, endpointSha256: sha256(LLM.endpoint),
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
      // Issue #182: the run's budget and stage settings, what the stages
      // did, and what the run cost.
      maxTurns: MAX_TURNS, wallClockMinutes: WALLCLOCK_MINUTES, appTurnTimeoutSec: APP_TURN_TIMEOUT_MS / 1000,
      runCostCapUsd: RUN_COST_CAP_USD, prices: PRICES,
      coverageSweep: COVERAGE_SWEEP, namingPass: NAMING_PASS,
      ...(STAGES ? { sweepMaxRounds: SWEEP_MAX_ROUNDS, stageTurnCaps: STAGE_TURN_CAPS } : {}),
      stages: orchestratorResult.stages,
      snapshots: stageSnapshots.map((x) => ({ label: x.label, turn: x.turn, stage: x.stage, elapsedSec: x.elapsedSec, cost: x.cost })),
      harnessMessages: orchestratorResult.harnessMessages,
      classifierParamsDropped: orchestratorResult.classifierParamsDropped,
      cachedShare: operationalStats.cachedShare,
      reasoningTokens: operationalStats.reasoningTokens,
      conversationCostUsd: operationalStats.conversationCostUsd,
      totalCostUsd: finalCost ? finalCost.all.costUsd : null,
      totalCost: finalCost,
    }, null, 2)}\n`);

    writeProgress({ phase: "done", turnsUsed: orchestratorResult.turnsUsed, stoppedReason: orchestratorResult.stoppedReason, ...costLine() });
    console.log(`${domain}/${runId}: done. ${orchestratorResult.turnsUsed} turns, stopped=${orchestratorResult.stoppedReason}, `
      + `recoveryEffectiveness(full)=${metrics.recoveryEffectiveness.toFixed(3)} (scoped)=${scopedMetrics.recoveryEffectiveness.toFixed(3)}`);
  } catch (err) {
    const message = String((err && err.message) || err);
    const kind = /insufficient_quota|exceeded your current quota|billing/i.test(message) ? "out_of_funds"
      : /401|invalid[_ ]api[_ ]key|Access denied|Unauthorized/i.test(message) ? "auth_failed"
      : /429/.test(message) ? "rate_limited"
      : "error";
    writeProgress({ phase: "failed", failureKind: kind, error: message.slice(0, 600), ...costLine() });
    console.error(`${domain}/${runId}: FAILED (${kind}) — ${message.slice(0, 300)}`);
    console.error(`Partial transcript/model are in ${path.relative(process.cwd(), checkpointDir)}; re-running resumes.`);
    process.exitCode = kind === "out_of_funds" ? 3 : 1;
  } finally {
    await browser.close();
  }
}

await main();
