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
import { runOntologyRecoveryConversation } from "./lib/conversationOrchestrator.mjs";
import { deriveOpeningLine } from "./lib/personaAgent.mjs";
import { chatOnce, sumUsage, DEFAULT_AZURE_API_VERSION } from "./lib/chatClient.mjs";
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
  if (fs.existsSync(path.join(outDir, "provenance.json")) && !flag("force")) {
    console.log(`${domain}/${runId}: already complete -- skipping (pass --force to redo it)`);
    return;
  }
  fs.mkdirSync(path.join(outDir, "checkpoint"), { recursive: true });
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
  const usages = [];
  const chat = async (messages, model) => {
    const call = await chatOnce({
      config: { provider: "azure", endpoint, apiKey, apiVersion: process.env.AZURE_OPENAI_API_VERSION || DEFAULT_AZURE_API_VERSION },
      model, systemPrompt: messages[0].content,
      userPrompt: messages.slice(1).map((m) => m.content).join("\n\n"),
      label: `${domain}/${runId}`,
    });
    if (call.usage) usages.push(call.usage);
    return { text: call.reply, usage: call.usage };
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

    const openingLine = deriveOpeningLine(fs.readFileSync(personaPath, "utf8"));
    const groundTruthText = fs.readFileSync(domainYamlPath, "utf8");
    writeProgress({ phase: "interviewing", turnsUsed: 0 });

    const orchestratorResult = await runOntologyRecoveryConversation({
      page, apiKey, personaModel: PERSONA_MODEL, classifierModel: CLASSIFIER_MODEL,
      maxTurns: MAX_TURNS, wallClockMs: WALLCLOCK_MINUTES * 60 * 1000,
      installRelay: (p) => forwardToRealAzure(p, `${endpoint}/openai/deployments/**`),
      chat,
      personaPath, groundTruthText, groundTruthFilename: "reference.domain.yaml", openingLine,
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
      domain, runId, metrics, scopedMetrics, semanticMetrics, semanticScopedMetrics,
      ruleMetrics, actionMetrics, semanticRuleActionMetrics, operationalStats,
    }, null, 2)}\n`);

    fs.writeFileSync(path.join(outDir, "provenance.json"), `${JSON.stringify({
      schemaVersion: 1, domain, runId, generatedAt: new Date().toISOString(),
      model: MODEL, personaModel: PERSONA_MODEL, classifierModel: CLASSIFIER_MODEL,
      provider: "azure", endpoint,
      domainYamlPath: path.relative(path.resolve(__dirname, "..", ".."), domainYamlPath),
      personaPath: path.relative(path.resolve(__dirname, "..", ".."), personaPath),
      stoppedReason: orchestratorResult.stoppedReason,
      turnsUsed: orchestratorResult.turnsUsed,
      wallClockSec: Math.round((Date.now() - startedAt) / 1000),
      semanticJudgingSucceeded: semanticMetrics !== null,
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
