// CONDITION B1 ON ANY DOMAIN: ONE-SHOT EXTRACTION OVER A FINISHED INTERVIEW
//
//   node tests/evals/run-baseline-b1.mjs --domain=brick-hvac --run=run-01 \
//     --source=ontology_translation/results/default-change-187/treatment \
//     --resultsDir=ontology_translation/results/baselines-gpt6/b1-one-shot
//
// with the provider's credentials in the repo-root .env.
//
// The multi-domain form of baseline-one-shot.mjs (EXPERIMENT_BRIEF.md §3,
// B1): one extraction call, with that file's own prompt and parsing, over
// the transcript of a finished interactive run (<source>/<run>/<domain>/
// conversation-log.md, opened read-only), then the extracted model scored as
// snapshot A exactly as an interview's wrap-up is (lib/snapshotScoring.mjs:
// heuristic, judge, rules and actions, offline-replay check). The
// conversation is held fixed: B1's snapshot A and the source run's snapshot A
// differ only in how the conversation became a model.
//
// The output has the runner's shape, so the same analysis reads both:
// <resultsDir>/<run>/<domain>/{provenance.json, snapshots/A/...}. A complete
// run is never re-run unless --force is passed.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { llmEnv, resolveLlmConfig, missingCredentials, defaultModel } from "../lib/llmProvider.mjs";
import { chatMessagesOnce } from "./lib/chatClient.mjs";
import { loadGroundTruthModel, scopeGroundTruth, resolveDomainYamlPath } from "./lib/groundTruthModel.mjs";
import { scoreSnapshot } from "./lib/snapshotScoring.mjs";
import { extractModelFromTranscript } from "./lib/baselineConditions.mjs";
import { runCost, pricesFromEnv } from "./lib/runCost.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const ENV = llmEnv();
const LLM = resolveLlmConfig(ENV);
const MODEL = ENV.EVAL_INTERVIEWER_MODEL || defaultModel(LLM, null, ENV);
const CLASSIFIER_MODEL = ENV.ONTOLOGY_EVAL_CLASSIFIER_MODEL || MODEL;
const EXTRACTION_EFFORT = ENV.EVAL_BASELINE_EXTRACTION_EFFORT || "high";
const PRICES = pricesFromEnv(ENV);

const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};
const sha256 = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const commitSha = () => { try { return execFileSync("git", ["rev-parse", "HEAD"], { cwd: __dirname, encoding: "utf8" }).trim(); } catch { return null; } };

async function main() {
  const domain = arg("domain"), runId = arg("run"), source = arg("source"), resultsDir = arg("resultsDir");
  if (!domain || !runId || !source || !resultsDir) {
    console.error("Usage: node tests/evals/run-baseline-b1.mjs --domain=<id> --run=<run-id> --source=<results dir> --resultsDir=<out dir> [--force]");
    process.exit(1);
  }
  const missing = missingCredentials(LLM);
  if (missing || !MODEL) { console.error(missing || "Set LLM_MODEL to the model."); process.exit(1); }
  const sourceDir = path.resolve(process.cwd(), source, runId, domain);
  const transcriptPath = path.join(sourceDir, "conversation-log.md");
  const sourceProv = readJson(path.join(sourceDir, "provenance.json"));
  if (!fs.existsSync(transcriptPath) || !sourceProv || sourceProv.status !== "complete") {
    console.error(`${domain}/${runId}: no complete source run at ${path.relative(ROOT, sourceDir)}`);
    process.exit(1);
  }
  const outDir = path.resolve(process.cwd(), resultsDir, runId, domain);
  const provenancePath = path.join(outDir, "provenance.json");
  const existing = readJson(provenancePath);
  if (existing && existing.status === "complete" && !process.argv.includes("--force")) {
    console.log(`${domain}/${runId}: already complete -- skipping (pass --force to redo it)`);
    return;
  }
  if (process.argv.includes("--force")) fs.rmSync(outDir, { recursive: true, force: true });
  const snapDir = path.join(outDir, "snapshots", "A");
  fs.mkdirSync(snapDir, { recursive: true });
  const runUuid = crypto.randomUUID();
  const startedAt = Date.now();
  fs.writeFileSync(provenancePath, `${JSON.stringify({ schemaVersion: 1, domain, runId, runUuid, status: "in-progress", startedAt: new Date(startedAt).toISOString() }, null, 2)}\n`);

  const usages = [];
  const chat = async (messages, model, extraBody = {}) => {
    const call = await chatMessagesOnce({ config: LLM, model, messages, extraBody, label: `b1 ${domain}/${runId}` });
    if (call.usage) usages.push(call.usage);
    return { text: call.reply, usage: call.usage, finishReason: call.finishReason };
  };
  const progress = (phase, extra = {}) => {
    const cost = runCost({ harnessUsages: usages, prices: PRICES });
    fs.writeFileSync(path.join(outDir, "progress.json"), `${JSON.stringify({ domain, runId, phase, elapsedSec: Math.round((Date.now() - startedAt) / 1000), costUsd: Number(cost.all.costUsd.toFixed(3)), ...extra }, null, 1)}\n`);
  };

  try {
    const transcript = fs.readFileSync(transcriptPath, "utf8");
    progress("extracting");
    const x = await extractModelFromTranscript({ transcript, chat, model: MODEL, extraBody: { reasoning_effort: EXTRACTION_EFFORT } });
    fs.writeFileSync(path.join(snapDir, "recovered-model.yaml"), x.yamlText);
    fs.writeFileSync(path.join(snapDir, "raw-response.md"), x.reply);
    const sourceRel = path.relative(ROOT, transcriptPath);
    fs.writeFileSync(path.join(snapDir, "extraction.json"), `${JSON.stringify({ condition: "b1-one-shot", transcript: sourceRel, ...x.provenance }, null, 2)}\n`);
    console.log(`${domain}/${runId}: B1 extracted the model (${(x.usage && x.usage.prompt_tokens) || "?"} prompt tokens)`);

    progress("scoring_snapshot_A");
    const domainYamlPath = resolveDomainYamlPath(domain);
    const groundTruth = loadGroundTruthModel({ format: "domain-yaml", path: domainYamlPath });
    const scopedGroundTruth = scopeGroundTruth(groundTruth, groundTruth.practicalScopeClassIds, groundTruth.practicalScopePropertyIds);
    const snap = { label: "A", turn: null, stage: "extraction", elapsedSec: Math.round((Date.now() - startedAt) / 1000), yamlText: x.yamlText };
    const entry = await scoreSnapshot({ snap, dir: snapDir, domain, groundTruth, scopedGroundTruth, apiKey: LLM.apiKey, model: CLASSIFIER_MODEL, chat, label: `${domain}/${runId}` });
    const cost = runCost({ harnessUsages: usages, prices: PRICES });
    console.log(`${domain}/${runId}: snapshot A composite(full)=${entry.metrics.recoveryEffectiveness.toFixed(3)} (scoped)=${entry.scopedMetrics.recoveryEffectiveness.toFixed(3)}`
      + (entry.semanticMetrics ? ` semantic=${entry.semanticMetrics.recoveryEffectiveness.toFixed(3)}` : ""));

    fs.writeFileSync(provenancePath, `${JSON.stringify({
      schemaVersion: 1, domain, runId, runUuid, status: "complete", generatedAt: new Date().toISOString(),
      condition: "b1-one-shot",
      // No interview happens: "extracted" in place of the runner's stages_complete.
      stoppedReason: "extracted",
      model: MODEL, classifierModel: CLASSIFIER_MODEL, provider: LLM.provider, endpointSha256: sha256(LLM.endpoint),
      extractionEffort: EXTRACTION_EFFORT,
      source: { transcript: sourceRel, runUuid: sourceProv.runUuid, turnsUsed: sourceProv.turnsUsed, stoppedReason: sourceProv.stoppedReason },
      extraction: { ...x.provenance, transcript: sourceRel },
      domainYamlPath: path.relative(ROOT, domainYamlPath), groundTruthSha256: sha256(fs.readFileSync(domainYamlPath, "utf8")),
      repoCommitSha: commitSha(),
      wallClockSec: Math.round((Date.now() - startedAt) / 1000),
      offlineRescoreAgrees: entry.offlineRescoreAgrees,
      prices: PRICES, totalCostUsd: cost.all.costUsd, totalCost: cost,
    }, null, 2)}\n`);
    progress("done");
  } catch (err) {
    const message = String((err && err.message) || err);
    progress("failed", { error: message.slice(0, 600) });
    console.error(`${domain}/${runId}: FAILED — ${message.slice(0, 300)}`);
    process.exitCode = 1;
  }
}

await main();
