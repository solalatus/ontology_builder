import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  GENERIC_SYSTEM_PROMPT, EXTRACTION_SYSTEM_PROMPT, ORIGINAL_PROMPT_SHA256, sha256, extractModelFromTranscript,
} from "./evals/lib/baselineConditions.mjs";
import { baselineItems, baselineCommand } from "./evals/run-paired-stages.mjs";

// The baseline conditions (EXPERIMENT_BRIEF.md §3) on the multi-domain
// runner: their prompts are the pre-registered originals (§4.6), and B1, B2
// and B3 each run end to end against the mock Azure resource, so no key and
// no network are needed.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const run = promisify(execFile);

test("the baseline prompts are byte-identical to the ones the original itops runs used", () => {
  assert.equal(sha256(GENERIC_SYSTEM_PROMPT), ORIGINAL_PROMPT_SHA256.generic);
  assert.equal(sha256(EXTRACTION_SYSTEM_PROMPT), ORIGINAL_PROMPT_SHA256.extraction);
  for (const c of ["b2-generic-interviewer", "b3-no-commit"]) {
    const prov = JSON.parse(fs.readFileSync(path.join(__dirname, "evals", "results", "baselines", c, "trial-01", "baseline-provenance.json"), "utf8"));
    assert.equal(prov.systemPromptSha256 || prov.extractionSystemPromptSha256, c === "b2-generic-interviewer" ? ORIGINAL_PROMPT_SHA256.generic : ORIGINAL_PROMPT_SHA256.extraction);
  }
});

test("extraction sends the original prompt and user message, parses a fenced reply, and refuses prose", async () => {
  let sent = null;
  const chat = async (messages, model, extraBody) => { sent = { messages, model, extraBody }; return { text: "Here it is.\n```yaml\nclasses:\n  Loan:\n    meaning: A loan.\n```\n", usage: { prompt_tokens: 10 } }; };
  const x = await extractModelFromTranscript({ transcript: "### Turn 1\nhello", chat, model: "m", extraBody: { reasoning_effort: "high" } });
  assert.equal(sent.messages[0].content, EXTRACTION_SYSTEM_PROMPT);
  assert.equal(sent.messages[1].content, "Here is the complete interview transcript.\n\n### Turn 1\nhello");
  assert.deepEqual(sent.extraBody, { reasoning_effort: "high" });
  assert.equal(x.yamlText, "classes:\n  Loan:\n    meaning: A loan.\n");
  assert.equal(x.provenance.extractionSystemPromptSha256, ORIGINAL_PROMPT_SHA256.extraction);
  assert.equal(x.provenance.transcriptSha256, sha256("### Turn 1\nhello"));
  await assert.rejects(extractModelFromTranscript({ transcript: "t", chat: async () => ({ text: "I could not build a model." }), model: "m" }), /no `classes:` block/);
});

test("the baselines block: B1 over all 15 final-score transcripts, then B3, then B2, alternating domains", () => {
  const items = baselineItems();
  assert.equal(items.length, 45);
  assert.deepEqual([...new Set(items.map((i) => i.condition))], ["b1-one-shot", "b3-no-commit", "b2-generic-interviewer"]);
  assert.deepEqual(items.slice(0, 5).map((i) => i.domain), ["fibo-loans", "brick-hvac", "iof-maintenance", "iof-supply-chain", "itops"]);
  const b1 = baselineCommand(items[0], "/R");
  assert.equal(b1.cleanStop, "extracted");
  assert.ok(b1.args.includes("--source=ontology_translation/results/default-change-187/treatment"));
  const b3 = baselineCommand(items[15], "/R");
  assert.equal(b3.cleanStop, "stages_complete");
  assert.deepEqual(b3.env, { ONTOLOGY_EVAL_CONDITION: "b3-no-commit" });
  assert.ok(b3.args.includes("--resultsDir=/R/b3-no-commit"));
  // Every B1 source is a committed, complete final-score run.
  for (const it of items.filter((i) => i.condition === "b1-one-shot")) {
    const src = baselineCommand(it, "/R").args.find((a) => a.startsWith("--source=")).slice(9);
    const prov = JSON.parse(fs.readFileSync(path.join(ROOT, src, it.runId, it.domain, "provenance.json"), "utf8"));
    assert.equal(prov.status, "complete");
    assert.ok(fs.existsSync(path.join(ROOT, src, it.runId, it.domain, "conversation-log.md")));
  }
});

const MOCK_ENV = {
  MOCK_AZURE_ENDPOINT: "https://mock-resource.openai.azure.com", LLM_PROVIDER: "azure",
  AZURE_OPENAI_ENDPOINT: "https://mock-resource.openai.azure.com", AZURE_OPENAI_API_KEY: "mock-key", LLM_MODEL: "gpt-6-sol",
  ONTOLOGY_EVAL_SNAPSHOT_AT_WRAPUP: "1", ONTOLOGY_EVAL_COVERAGE_SWEEP: "", ONTOLOGY_EVAL_NAMING_PASS: "",
  ONTOLOGY_EVAL_APP_TURN_TIMEOUT_SEC: "60", EVAL_RUN_COST_CAP_USD: "5",
};
const runner = (args, env) => run(process.execPath, ["--import", "./tests/lib/mockAzureFetch.mjs", ...args], { cwd: ROOT, timeout: 280000, env: { ...process.env, ...MOCK_ENV, ...env } });
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

test("dry runs: B3 commits nothing and scores its extracted model, B2 sends the generic prompt, B1 extracts from B2's transcript", { timeout: 900000 }, async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "baselines-dry-"));
  try {
    await runner(["tests/evals/run-multi-domain-benchmark.mjs", "--domain=brick-hvac", "--run=dry-01", `--resultsDir=${root}/b3`], { ONTOLOGY_EVAL_CONDITION: "b3-no-commit" });
    const b3 = path.join(root, "b3", "dry-01", "brick-hvac");
    const p3 = readJson(path.join(b3, "provenance.json"));
    assert.equal(p3.status, "complete");
    assert.equal(p3.stoppedReason, "stages_complete");
    assert.equal(p3.condition, "b3-no-commit");
    assert.equal(p3.toolsDisabled, true);
    assert.equal(p3.extraction.extractionSystemPromptSha256, ORIGINAL_PROMPT_SHA256.extraction);
    assert.deepEqual(p3.extraction.extraBody, { reasoning_effort: "high" });
    assert.equal(p3.extraction.transcriptSha256, sha256(fs.readFileSync(path.join(b3, p3.extraction.transcript), "utf8")));
    assert.match(fs.readFileSync(path.join(b3, p3.extraction.transcript), "utf8"), /What does the agent need to know/);
    const m3 = readJson(path.join(b3, "snapshots", "A", "metrics.json"));
    assert.equal(m3.counts.classes, 2, "snapshot A is the extracted model, not the empty canvas");
    assert.equal(m3.offlineRescoreAgrees, true);
    assert.match(fs.readFileSync(path.join(b3, "snapshots", "A", "raw-response.md"), "utf8"), /```yaml/);

    await runner(["tests/evals/run-multi-domain-benchmark.mjs", "--domain=brick-hvac", "--run=dry-01", `--resultsDir=${root}/b2`], { ONTOLOGY_EVAL_CONDITION: "b2-generic-interviewer" });
    const b2 = path.join(root, "b2", "dry-01", "brick-hvac");
    const p2 = readJson(path.join(b2, "provenance.json"));
    assert.equal(p2.stoppedReason, "stages_complete");
    assert.equal(p2.conditionPromptSha256, ORIGINAL_PROMPT_SHA256.generic);
    assert.notEqual(p2.interviewerPromptSha256, p3.interviewerPromptSha256, "B2 sent a different prompt from the staged one");
    assert.equal(readJson(path.join(b2, "snapshots", "A", "metrics.json")).counts.classes, 2);

    await runner(["tests/evals/run-baseline-b1.mjs", "--domain=brick-hvac", "--run=dry-01", `--source=${root}/b2`, `--resultsDir=${root}/b1`], {});
    const b1 = path.join(root, "b1", "dry-01", "brick-hvac");
    const p1 = readJson(path.join(b1, "provenance.json"));
    assert.equal(p1.status, "complete");
    assert.equal(p1.stoppedReason, "extracted");
    assert.equal(p1.source.runUuid, p2.runUuid);
    assert.equal(p1.extraction.transcriptSha256, sha256(fs.readFileSync(path.join(b2, "conversation-log.md"), "utf8")));
    assert.equal(p1.offlineRescoreAgrees, true);
    assert.ok(p1.totalCostUsd > 0);
    // A complete B1 run is never re-spent.
    const again = await runner(["tests/evals/run-baseline-b1.mjs", "--domain=brick-hvac", "--run=dry-01", `--source=${root}/b2`, `--resultsDir=${root}/b1`], {});
    assert.match(again.stdout, /already complete/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("an unknown condition, or a condition with stages on, is refused before anything runs", async () => {
  await assert.rejects(runner(["tests/evals/run-multi-domain-benchmark.mjs", "--domain=brick-hvac", "--run=x", "--resultsDir=/nonexistent"], { ONTOLOGY_EVAL_CONDITION: "b9" }), /Unknown ONTOLOGY_EVAL_CONDITION/);
  await assert.rejects(runner(["tests/evals/run-multi-domain-benchmark.mjs", "--domain=brick-hvac", "--run=x", "--resultsDir=/nonexistent"], { ONTOLOGY_EVAL_CONDITION: "b3-no-commit", ONTOLOGY_EVAL_NAMING_PASS: "1" }), /runs to the wrap-up only/);
});

test("the pre-registered reading: beats beyond the larger stdev, level within it, ahead below it; the report renders with conditions missing", async () => {
  const { reading, summarize, renderReport, CONDITIONS } = await import("./evals/analyze-baselines.mjs");
  assert.equal(reading({ mean: 0.8, sd: 0.05 }, { mean: 0.6, sd: 0.1 }), "beats");
  assert.equal(reading({ mean: 0.8, sd: 0.05 }, { mean: 0.75, sd: 0.1 }), "level");
  assert.equal(reading({ mean: 0.6, sd: 0.02 }, { mean: 0.7, sd: 0.05 }), "ahead");
  assert.equal(reading({ mean: 0.6, sd: 0.02 }, { mean: null, sd: null }), null);
  const report = renderReport(summarize(fs.mkdtempSync(path.join(os.tmpdir(), "baselines-empty-"))));
  assert.deepEqual(CONDITIONS.map((c) => c.id), ["interactive", "b1-one-shot", "b2-generic-interviewer", "b3-no-commit"]);
  assert.match(report, /\| fibo-loans \| 0\.680 ± 0\.016 \| — \| — \| — \|/);
  assert.match(report, /## Pre-registered reading/);
});

test("B3 is not stopped by the no-tool-activity stall detector: a tool-less interview past its threshold still reaches the wrap-up", { timeout: 600000 }, async () => {
  const { WASTED_TURN_THRESHOLD } = await import("./evals/lib/conversationOrchestrator.mjs");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "baselines-b3-long-"));
  try {
    await runner(["tests/evals/run-multi-domain-benchmark.mjs", "--domain=brick-hvac", "--run=dry-01", `--resultsDir=${root}`],
      { ONTOLOGY_EVAL_CONDITION: "b3-no-commit", MOCK_TOOLLESS_QUESTIONS: String(WASTED_TURN_THRESHOLD + 5), ONTOLOGY_EVAL_MAX_TURNS: "300" });
    const prov = readJson(path.join(root, "dry-01", "brick-hvac", "provenance.json"));
    assert.equal(prov.stoppedReason, "stages_complete");
    assert.ok(prov.turnsUsed > WASTED_TURN_THRESHOLD, `ran ${prov.turnsUsed} turns`);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
