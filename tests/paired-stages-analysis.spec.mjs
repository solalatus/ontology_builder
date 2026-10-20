import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadRuns, aggregate, evaluateCriteria, renderReport, stdev } from "./evals/analyze-paired-stages.mjs";

// Issue #182's report generator, on a synthetic results tree: paired
// differences per run, the pre-registered pass criteria, exclusion of
// unclean runs. Offline.

function metricsEntry(label, turn, { composite, relF1 = 0.5, propF1 = 0.4, classPrecision = 1, allowed = 3, relPrecision = 0.7 }) {
  const dim = (f1, precision = 0.8) => ({ recall: f1, precision, f1, matched: 1, groundTruthTotal: 2, recoveredTotal: 2 });
  const m = { recoveryEffectiveness: composite, classes: dim(composite, classPrecision), relationships: dim(relF1, relPrecision), properties: dim(propF1), controlledValueFidelity: 0.5 };
  return { label, turn, elapsedSec: turn * 60, counts: { classes: 10, relationships: 8, properties: 6, allowedValueLists: allowed },
    metrics: m, scopedMetrics: { ...m, recoveryEffectiveness: composite + 0.1 }, semanticMetrics: null,
    ruleMetrics: { f1: 0.2 }, actionMetrics: { identification: { f1: 0.3 } }, offlineRescoreAgrees: true };
}

function writeRun(root, block, runId, domain, snaps, { stoppedReason = "stages_complete" } = {}) {
  const dir = path.join(root, block, runId, domain);
  for (const [label, turn, opts] of snaps) {
    const sdir = path.join(dir, "snapshots", label);
    fs.mkdirSync(sdir, { recursive: true });
    fs.writeFileSync(path.join(sdir, "metrics.json"), JSON.stringify(metricsEntry(label, turn, opts)));
    fs.writeFileSync(path.join(sdir, "recovered-model.yaml"), "classes:\n  Loan: {}\n");
    fs.writeFileSync(path.join(sdir, "snapshot.json"), JSON.stringify({ label, turn }));
  }
  fs.writeFileSync(path.join(dir, "provenance.json"), JSON.stringify({
    status: "complete", stoppedReason, totalCostUsd: 10, cachedShare: 0.9, wallClockSec: 3600,
    stages: { sweepRounds: [{}, {}], stagesCapped: [], namingRenames: { relationshipsRenamed: 3, relationshipsRedirected: 1, propertiesRenamed: 2, classesRenamed: 0 } },
    snapshots: snaps.map(([label, turn]) => ({ label, turn, cost: { all: { costUsd: turn / 10, promptTokens: turn * 1000, cachedTokens: turn * 900 } } })),
  }));
}

function tree(compositesByDomain, { blocks = ["block-1-medium"], unclean = null } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "paired-analysis-"));
  for (const block of blocks) {
    for (const [domain, runs] of Object.entries(compositesByDomain)) {
      runs.forEach(([a, b, c, extra = {}], i) => writeRun(root, block, `run-0${i + 1}`, domain, [
        ["A", 50, { composite: a, ...(extra.A || {}) }], ["B", 80, { composite: b, ...(extra.B || {}) }], ["C", 100, { composite: c, ...(extra.C || {}) }],
      ], unclean && unclean.domain === domain && unclean.run === i ? { stoppedReason: "wallclock_timeout" } : {}));
    }
  }
  return root;
}

test("paired differences are taken per run and then averaged", () => {
  const root = tree({ "fibo-loans": [[0.6, 0.7, 0.72], [0.5, 0.62, 0.6]], "brick-hvac": [[0.4, 0.45, 0.5]] });
  try {
    const runs = loadRuns(root);
    assert.equal(runs.length, 3);
    const agg = aggregate(runs.filter((r) => r.domain === "fibo-loans"));
    assert.ok(Math.abs(agg.deltas["B-A"].composite.mean - 0.11) < 1e-9);
    assert.ok(Math.abs(agg.deltas["C-A"].composite.mean - 0.11) < 1e-9);
    assert.ok(Math.abs(agg.snapshots.A.composite.sd - stdev([0.6, 0.5])) < 1e-12);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("#179 is met only with +0.05 on the mean of both domains, class precision at B >= 0.95, and allowed-value lists not down", () => {
  const ok = tree({ "fibo-loans": [[0.6, 0.66, 0.66], [0.5, 0.56, 0.56]], "brick-hvac": [[0.4, 0.45, 0.45], [0.5, 0.55, 0.55]] });
  const lowPrecision = tree({ "fibo-loans": [[0.6, 0.7, 0.7, { B: { classPrecision: 0.9 } }]], "brick-hvac": [[0.4, 0.5, 0.5]] });
  const small = tree({ "fibo-loans": [[0.6, 0.62, 0.62]], "brick-hvac": [[0.4, 0.43, 0.43]] });
  try {
    assert.equal(evaluateCriteria(loadRuns(ok))["#179 block 1 (medium)"].met, true);
    assert.equal(evaluateCriteria(loadRuns(lowPrecision))["#179 block 1 (medium)"].met, false);
    assert.equal(evaluateCriteria(loadRuns(small))["#179 block 1 (medium)"].met, false);
  } finally { for (const r of [ok, lowPrecision, small]) fs.rmSync(r, { recursive: true, force: true }); }
});

test("#180 needs relationship or property F1 up by more than the replicate stdev at B, on both domains, without losing relationship precision", () => {
  const up = { B: { relF1: 0.5 }, C: { relF1: 0.6 } };
  const root = tree({ "fibo-loans": [[0.6, 0.6, 0.6, up], [0.6, 0.6, 0.6, { B: { relF1: 0.52 }, C: { relF1: 0.62 } }]], "brick-hvac": [[0.4, 0.4, 0.4, up], [0.4, 0.4, 0.4, { B: { relF1: 0.51 }, C: { relF1: 0.61 } }]] });
  const precisionDown = tree({ "fibo-loans": [[0.6, 0.6, 0.6, { ...up, C: { relF1: 0.6, relPrecision: 0.6 } }], [0.6, 0.6, 0.6, { B: { relF1: 0.52 }, C: { relF1: 0.62, relPrecision: 0.6 } }]],
    "brick-hvac": [[0.4, 0.4, 0.4, up], [0.4, 0.4, 0.4, { B: { relF1: 0.51 }, C: { relF1: 0.61 } }]] });
  try {
    assert.equal(evaluateCriteria(loadRuns(root))["#180 block 1 (medium)"].met, true);
    assert.equal(evaluateCriteria(loadRuns(precisionDown))["#180 block 1 (medium)"].met, false);
  } finally { for (const r of [root, precisionDown]) fs.rmSync(r, { recursive: true, force: true }); }
});

test("#181: high wins only if its A composite beats medium's by more than medium's replicate stdev on both domains", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "paired-181-"));
  try {
    const put = (block, domain, values) => values.forEach((a, i) => writeRun(root, block, `run-0${i + 1}`, domain, [["A", 50, { composite: a }], ["B", 80, { composite: a }], ["C", 100, { composite: a }]]));
    put("block-1-medium", "fibo-loans", [0.60, 0.62, 0.61]);
    put("block-1-medium", "brick-hvac", [0.50, 0.55, 0.60]);
    put("block-2-high", "fibo-loans", [0.70, 0.71, 0.69]);
    put("block-2-high", "brick-hvac", [0.56, 0.57, 0.58]);
    const c = evaluateCriteria(loadRuns(root))["#181 high vs medium at A"];
    assert.equal(c.met, false, "brick-hvac: +0.020 does not beat medium's stdev of 0.050");
    assert.match(c.detail, /fibo-loans: high - medium \+0\.090/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("a run that did not end stages_complete is listed, excluded from the means, and fails the no-cap floor", () => {
  const root = tree({ "fibo-loans": [[0.6, 0.7, 0.7], [0.1, 0.9, 0.9]], "brick-hvac": [[0.4, 0.5, 0.5]] }, { unclean: { domain: "fibo-loans", run: 1 } });
  try {
    const runs = loadRuns(root);
    assert.equal(runs.filter((r) => !r.clean).length, 1);
    const report = renderReport(runs);
    assert.match(report, /wallclock_timeout \(excluded\)/);
    assert.match(report, /## fibo-loans, medium \(n = 1\)/);
    assert.equal(evaluateCriteria(runs)["#179 block 1 (medium)"].met, false, "a run over a cap fails every criterion");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
