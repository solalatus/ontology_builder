import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

// The benchmark runner itself, end to end, against an in-process stand-in
// for an Azure OpenAI resource (tests/lib/mockAzureFetch.mjs): connect,
// relay, the Responses fallback, the paired stages, snapshots A/B/C, their
// scoring and the offline-rescore check, token and cost accounting, and the
// provenance a real run records (issue #182). No key, no network: the
// endpoint and key are overridden, so nothing can reach a real resource.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const run = promisify(execFile);

test("a dry run of the paired-stage benchmark produces three scored snapshots, a cost and full provenance", { timeout: 300000 }, async () => {
  const resultsDir = fs.mkdtempSync(path.join(os.tmpdir(), "paired-stages-dry-"));
  try {
    const endpoint = "https://mock-resource.openai.azure.com";
    await run(process.execPath, [
      "--import", "./tests/lib/mockAzureFetch.mjs",
      "tests/evals/run-multi-domain-benchmark.mjs", "--domain=brick-hvac", "--run=dry-01", `--resultsDir=${resultsDir}`,
    ], {
      cwd: ROOT, timeout: 280000,
      env: {
        ...process.env,
        MOCK_AZURE_ENDPOINT: endpoint, LLM_PROVIDER: "azure", AZURE_OPENAI_ENDPOINT: endpoint, AZURE_OPENAI_API_KEY: "mock-key",
        LLM_MODEL: "gpt-6-sol", EVAL_REASONING_EFFORT: "high",
        ONTOLOGY_EVAL_COVERAGE_SWEEP: "1", ONTOLOGY_EVAL_NAMING_PASS: "1",
        ONTOLOGY_EVAL_APP_TURN_TIMEOUT_SEC: "60", EVAL_RUN_COST_CAP_USD: "5", ONTOLOGY_EVAL_WALLCLOCK_MINUTES: "120",
      },
    });
    const dir = path.join(resultsDir, "dry-01", "brick-hvac");
    const prov = JSON.parse(fs.readFileSync(path.join(dir, "provenance.json"), "utf8"));
    assert.equal(prov.status, "complete");
    assert.equal(prov.stoppedReason, "stages_complete");
    assert.equal(prov.reasoningEffort, "high");
    assert.equal(prov.wallClockMinutes, 120);
    assert.deepEqual(prov.snapshots.map((s) => [s.label, s.turn]), [["A", 2], ["B", 6], ["C", 8]]);
    assert.deepEqual(prov.harnessMessages.map((m) => m.turn), [2, 4, 5, 6]);
    assert.deepEqual(prov.classifierParamsDropped, ["temperature"]);
    assert.equal(prov.stages.namingRenames.relationshipsRedirected, 1);
    assert.ok(prov.totalCostUsd > prov.conversationCostUsd && prov.conversationCostUsd > 0, "scoring calls are counted on top of the conversation");
    assert.ok(prov.cachedShare > 0);
    assert.ok(prov.snapshots.every((s, i, a) => i === 0 || s.cost.all.costUsd >= a[i - 1].cost.all.costUsd), "cost at each snapshot only grows");

    for (const label of ["A", "B", "C"]) {
      for (const f of ["recovered-model.yaml", "metrics.json", "heuristic-matches.json", "semantic-judgments.json", "snapshot.json"]) {
        assert.ok(fs.existsSync(path.join(dir, "snapshots", label, f)), `snapshots/${label}/${f}`);
      }
    }
    const metrics = JSON.parse(fs.readFileSync(path.join(dir, "metrics.json"), "utf8"));
    assert.deepEqual(metrics.snapshots.map((s) => s.label), ["A", "B", "C"]);
    assert.ok(metrics.snapshots.every((s) => s.offlineRescoreAgrees));
    assert.deepEqual(metrics.snapshots.map((s) => s.counts.classes), [2, 3, 3]);
    const ops = metrics.operationalStats;
    assert.ok(ops.promptTokens > 0 && ops.cachedTokens > 0 && ops.reasoningTokens > 0, "Responses-shape usage is counted");
    assert.equal(ops.applyToolCalls, 2, "tool calls in Responses-shape bodies are counted");
    assert.equal(ops.renameToolCalls, 1);

    const progress = JSON.parse(fs.readFileSync(path.join(dir, "progress.json"), "utf8"));
    assert.equal(progress.phase, "done");
    assert.ok(progress.costUsd > 0);
  } finally {
    fs.rmSync(resultsDir, { recursive: true, force: true });
  }
});
