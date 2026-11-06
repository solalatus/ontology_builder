// E1 REPORT: FIRST-GENERATION INTERVIEWER WITH THE SAME MODELS
// (ontology_translation/results/v1-same-model/DESIGN.md)
//
//   node tests/evals/v1-same-model-report.mjs [--write]
//
// Offline, no model calls. Two arms, gpt-6-sol in every role:
//   v1     results/v1-same-model/runs/run-0X/<domain>
//   final  run-01..03 as in results/final-scores/ (brick-hvac and fibo-loans
//          from results/default-change-187/treatment/), plus the run-04/05
//          top-up in results/final-scores/runs/
// A clean run is scored on snapshot A, a run that ended on its own behaviour
// or a cap on its final metrics.json (DESIGN.md, "Interruptions and run
// ends"); both with snapshotRow (analyze-paired-stages.mjs), as the final
// scores are. Checks that the final arm's run-01..03 reproduce the committed
// run-intervals values. Then the readings fixed in DESIGN.md: the stratified
// Welch interval of the macro difference (composite primary, relationship F1
// key secondary), three outcomes; itops and per-domain plain Welch.
// --write saves REPORT.md and results.json (cells in the run-intervals
// format) into results/v1-same-model/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { snapshotRow } from "./analyze-paired-stages.mjs";
import { interviewerFirstCount, goldSize } from "./analyze-final-scores.mjs";
import { stratifiedWelch, welch, welchLinear, threeOutcome, mean } from "./lib/welch.mjs";
import { ARM_STOPS } from "./run-paired-stages.mjs";
import { rescoreRun } from "./rescore-saved-run.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS = path.resolve(__dirname, "..", "..", "ontology_translation", "results");
const OUT_DIR = path.join(RESULTS, "v1-same-model");
const DEV = ["brick-hvac", "iof-maintenance", "iof-supply-chain", "fibo-loans"];
const ALL = [...DEV, "itops"];
const METRICS = ["composite", "classF1", "relF1", "propF1"];
const EXTRA = ["classRecall", "classPrecision", "relRecall", "relPrecision", "propRecall", "propPrecision", "rulesF1", "actionsF1"];
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };

const FINAL_OLD = { "brick-hvac": "default-change-187/treatment", "fibo-loans": "default-change-187/treatment" };
const finalDir = (d, r) => path.join(RESULTS, ["run-01", "run-02", "run-03"].includes(r) && FINAL_OLD[d] ? FINAL_OLD[d] : "final-scores/runs", r, d);
const v1Dir = (d, r) => path.join(OUT_DIR, "runs", r, d);
const RUNS = { v1: (d) => (d === "itops" ? ["run-01", "run-02", "run-03"] : ["run-01", "run-02", "run-03", "run-04", "run-05"]) };
RUNS.final = RUNS.v1;

/** One run, scored per DESIGN.md; null if it has not ended (or ended on infrastructure). */
export function scoreRun(dir, domain) {
  const prov = readJson(path.join(dir, "provenance.json"));
  if (!prov || prov.status !== "complete") return null;
  const clean = prov.stoppedReason === "stages_complete";
  if (!ARM_STOPS.includes(prov.stoppedReason)) return { excluded: true, stoppedReason: prov.stoppedReason };
  const m = readJson(path.join(dir, clean ? path.join("snapshots", "A", "metrics.json") : "metrics.json"));
  if (!m) return null;
  const c = interviewerFirstCount(dir, domain);
  const g = goldSize(domain);
  return {
    row: snapshotRow(m), clean, stoppedReason: prov.stoppedReason, turns: prov.turnsUsed, costUsd: prov.totalCostUsd,
    scoredOn: clean ? "snapshot A" : "final metrics.json",
    interviewerFirstPer100: c ? (100 * c.interviewerFirst) / (g.classes + g.relationships + g.properties) : null,
    relayAudit: prov.v1Interviewer ? prov.v1Interviewer.relayAudit : null,
  };
}

const cellOf = (xs) => ({ mean: mean(xs), min: Math.min(...xs), max: Math.max(...xs), values: xs });

export function runAll() {
  const out = { design: "results/v1-same-model/DESIGN.md", arms: {}, cells: {}, incomplete: {}, reproduces: null, primary: null, keySecondary: null, descriptive: {}, reading: {} };
  for (const arm of ["v1", "final"]) {
    out.arms[arm] = {};
    out.incomplete[arm] = [];
    for (const d of ALL) {
      out.arms[arm][d] = [];
      for (const r of RUNS[arm](d)) {
        const s = scoreRun(arm === "v1" ? v1Dir(d, r) : finalDir(d, r), d);
        if (!s || s.excluded) { out.incomplete[arm].push(`${d}/${r}${s ? ` (${s.stoppedReason})` : ""}`); continue; }
        out.arms[arm][d].push({ runId: r, ...s });
      }
    }
  }
  const cellName = { v1: "v1-same-model", final: "final" };
  for (const arm of ["v1", "final"]) {
    out.cells[cellName[arm]] = {};
    for (const d of ALL) {
      const runs = out.arms[arm][d];
      if (!runs.length) continue;
      const c = { n: runs.length };
      for (const m of [...METRICS, ...EXTRA]) { const xs = runs.map((x) => x.row[m]).filter((x) => typeof x === "number"); if (xs.length) c[m] = cellOf(xs); }
      out.cells[cellName[arm]][d] = c;
    }
  }
  // The final arm's run-01..03 must be the committed run-intervals values.
  const ri = readJson(path.join(RESULTS, "run-intervals", "results.json"));
  out.reproduces = ALL.every((d) => METRICS.every((m) => {
    const committed = ri.cells.final[d][m].values;
    const mine = out.arms.final[d].filter((x) => ["run-01", "run-02", "run-03"].includes(x.runId)).map((x) => x.row[m]);
    return committed.length === mine.length && committed.every((v, i) => Math.abs(v - mine[i]) < 1e-12);
  }));
  const ready = (ds) => ds.every((d) => out.cells["v1-same-model"][d] && out.cells.final[d] && out.cells["v1-same-model"][d].n >= 2 && out.cells.final[d].n >= 2);
  const strat = (m, filter = () => true) => stratifiedWelch(DEV.map((d) => ({
    a: out.arms.final[d].filter(filter).map((x) => x.row[m]), b: out.arms.v1[d].filter(filter).map((x) => x.row[m]),
  })));
  if (ready(DEV)) {
    out.primary = { metric: "composite", ...strat("composite") };
    out.keySecondary = { metric: "relF1", ...strat("relF1") };
    out.descriptive.classF1 = strat("classF1");
    out.descriptive.propF1 = strat("propF1");
    // Sensitivity (second co-author review, B4): the LLM-judged semantic matching policy.
    out.descriptive.semantic = { composite: strat("semanticComposite"), relF1: strat("semRelF1"), classF1: strat("semClassF1"),
      macro: Object.fromEntries(["v1", "final"].map((a) => [a, { composite: mean(DEV.map((d) => mean(out.arms[a][d].map((x) => x.row.semanticComposite)))), relF1: mean(DEV.map((d) => mean(out.arms[a][d].map((x) => x.row.semRelF1)))) }])) };
    const anyUnclean = DEV.some((d) => [...out.arms.final[d], ...out.arms.v1[d]].some((x) => !x.clean));
    out.descriptive.primaryCleanRunsOnly = anyUnclean ? (() => { try { return strat("composite", (x) => x.clean); } catch { return null; } })() : "all runs clean: identical to the primary";
    for (const d of DEV) out.descriptive[d] = Object.fromEntries(["composite", "relF1"].map((m) => [m, welch(out.arms.final[d].map((x) => x.row[m]), out.arms.v1[d].map((x) => x.row[m]))]));
    out.reading.primary = threeOutcome(out.primary);
    out.reading.keySecondary = threeOutcome(out.keySecondary);
  }
  if (ready(["itops"])) out.descriptive.itops = Object.fromEntries(METRICS.map((m) => [m, welch(out.arms.final.itops.map((x) => x.row[m]), out.arms.v1.itops.map((x) => x.row[m]))]));
  // E1 on the held-out domain (EPO-DESIGN.md): the v1 arm against the committed
  // interactive ePO runs, both rescored like every ePO cell (heuristic, full domain).
  const epoRuns = ["run-01", "run-02", "run-03"];
  const epoV1 = epoRuns.map((r) => ({ r, dir: path.join(OUT_DIR, "epo", r, "epo-ordering") }))
    .map(({ r, dir }) => ({ r, dir, prov: readJson(path.join(dir, "provenance.json")) }))
    .filter((x) => x.prov && x.prov.status === "complete" && ARM_STOPS.includes(x.prov.stoppedReason));
  if (epoV1.length === epoRuns.length) {
    const pick = (m) => ({ composite: m.recoveryEffectiveness, classF1: m.classes.f1, relF1: m.relationships.f1, propF1: m.properties.f1 });
    const v1 = epoV1.map((x) => ({ runId: x.r, stoppedReason: x.prov.stoppedReason, turns: x.prov.turnsUsed, costUsd: x.prov.totalCostUsd,
      relayAudit: x.prov.v1Interviewer && x.prov.v1Interviewer.relayAudit, row: pick(rescoreRun(x.dir, "epo-ordering").heuristic.full) }));
    const inter = ri.cells["epo-interactive"]["epo-ordering"];
    out.epo = { v1, cells: { "v1-same-model": { n: v1.length }, final: { n: inter.n } }, differences: {} };
    for (const m of METRICS) {
      out.epo.cells["v1-same-model"][m] = cellOf(v1.map((x) => x.row[m]));
      out.epo.cells.final[m] = cellOf(inter[m].values);
    }
    for (const m of ["composite", "relF1"]) out.epo.differences[m] = welch(inter[m].values, v1.map((x) => x.row[m]));
    out.reading.epo = threeOutcome(out.epo.differences.composite);
  }
  // B1 of the second co-author review (WEAK-EXPERT-ITOPS-DESIGN.md): interviewer x
  // simulated expert on itops, all with gpt-6-sol as interviewer model.
  const dRuns = ["run-01", "run-02", "run-03"].map((r) => ({ r, s: scoreRun(path.join(OUT_DIR, "weak-expert-itops", r, "itops"), "itops") }));
  if (dRuns.every((x) => x.s && !x.s.excluded) && out.arms.v1.itops.length >= 2) {
    const cellVals = {
      A: (m) => ri.cells.final.itops[m].values,
      B: (m) => ri.cells["persona-ablation"].itops[m].values,
      C: (m) => out.arms.v1.itops.map((x) => x.row[m]),
      D: (m) => dRuns.map((x) => x.s.row[m]),
    };
    const lin = (m, ws) => welchLinear(Object.entries(ws).map(([k, w]) => ({ values: cellVals[k](m), w })));
    out.twoByTwo = { cells: {}, effects: {}, runs: dRuns.map((x) => ({ runId: x.r, stoppedReason: x.s.stoppedReason, turns: x.s.turns, costUsd: x.s.costUsd, relayAudit: x.s.relayAudit, composite: x.s.row.composite, relF1: x.s.row.relF1 })) };
    for (const k of ["A", "B", "C", "D"]) out.twoByTwo.cells[k] = Object.fromEntries(METRICS.map((m) => [m, cellOf(cellVals[k](m))]));
    for (const m of ["composite", "relF1"]) {
      out.twoByTwo.effects[m] = {
        interviewerStrongExpert: lin(m, { A: 1, C: -1 }), interviewerWeakExpert: lin(m, { B: 1, D: -1 }),
        expertV2: lin(m, { A: 1, B: -1 }), expertV1: lin(m, { C: 1, D: -1 }),
        interviewerMain: lin(m, { A: 0.5, B: 0.5, C: -0.5, D: -0.5 }), expertMain: lin(m, { A: 0.5, C: 0.5, B: -0.5, D: -0.5 }),
        interaction: lin(m, { A: 1, B: -1, C: -1, D: 1 }),
      };
    }
  }
  out.macro = {};
  for (const [cn, doms] of Object.entries(out.cells)) if (DEV.every((d) => doms[d])) out.macro[cn] = Object.fromEntries(METRICS.map((m) => [m, mean(DEV.map((d) => doms[d][m].mean))]));
  return out;
}

const p1 = (x) => (typeof x === "number" ? (100 * x).toFixed(1) : "n/a");
const sg = (x) => `${x >= 0 ? "+" : ""}${p1(x)}`;
const iv = (x) => `${sg(x.estimate)} [${sg(x.lo)}, ${sg(x.hi)}]`;
const WORDING = {
  a: (x) => `with the same models in every role, the second-generation interviewer scores ${p1(x.estimate)} points higher [${sg(x.lo)}, ${sg(x.hi)}]`,
  b: (x) => `${p1(x.estimate)} points higher on average; with 5 runs per arm the difference is within run-to-run spread [${sg(x.lo)}, ${sg(x.hi)}]`,
  c: (x) => `no gain over the first-generation interviewer with the same models [${sg(x.lo)}, ${sg(x.hi)}]`,
};
export function renderReport(res) {
  const L = ["# First-generation interviewer with the same models (E1): results", "",
    "Generated by `tests/evals/v1-same-model-report.mjs` (offline; heuristic, full domain). Design: `DESIGN.md`. gpt-6-sol in every role in both arms. Values in %, mean [min–max]; differences in percentage points with 95 % Welch t-intervals (macro: domain-stratified). With 5 runs per arm (3 on itops) the intervals describe the runs, not a population.", ""];
  const cell = (c) => (c ? `${p1(c.mean)} [${p1(c.min)}–${p1(c.max)}]` : "n/a");
  L.push("| Domain | n v1 / final | Composite v1 | Composite final | Rel F1 v1 | Rel F1 final | Class F1 v1 | Class F1 final |", "|---|---|---|---|---|---|---|---|");
  for (const d of ALL) {
    const a = res.cells["v1-same-model"][d], b = res.cells.final[d];
    L.push(`| ${d} | ${a ? a.n : 0} / ${b ? b.n : 0} | ${cell(a && a.composite)} | ${cell(b && b.composite)} | ${cell(a && a.relF1)} | ${cell(b && b.relF1)} | ${cell(a && a.classF1)} | ${cell(b && b.classF1)} |`);
  }
  if (res.macro["v1-same-model"] && res.macro.final) {
    L.push(`| **Macro, 4 dev.** | | ${p1(res.macro["v1-same-model"].composite)} | ${p1(res.macro.final.composite)} | ${p1(res.macro["v1-same-model"].relF1)} | ${p1(res.macro.final.relF1)} | ${p1(res.macro["v1-same-model"].classF1)} | ${p1(res.macro.final.classF1)} |`);
  }
  L.push("", `Final arm run-01..03 reproduce the committed \`run-intervals/results.json\` values: **${res.reproduces ? "yes" : "NO"}**.`);
  if (res.primary) {
    L.push("", "## Readings fixed in DESIGN.md", "",
      `- **Primary (macro composite, final − v1):** ${iv(res.primary)}, df ${res.primary.df.toFixed(1)}. Outcome (${res.reading.primary}): "${WORDING[res.reading.primary](res.primary)}".`,
      `- **Key secondary (macro relationship F1, final − v1):** ${iv(res.keySecondary)}, df ${res.keySecondary.df.toFixed(1)}. Outcome (${res.reading.keySecondary}): "${WORDING[res.reading.keySecondary](res.keySecondary)}".`,
      "", "## Descriptive", "",
      `- Macro class F1: ${iv(res.descriptive.classF1)}; macro property F1: ${iv(res.descriptive.propF1)}.`,
      `- Semantic matching policy (sensitivity): macro composite ${iv(res.descriptive.semantic.composite)}, relationship F1 ${iv(res.descriptive.semantic.relF1)}, class F1 ${iv(res.descriptive.semantic.classF1)}.`,
      `- Primary, clean runs only: ${typeof res.descriptive.primaryCleanRunsOnly === "string" ? res.descriptive.primaryCleanRunsOnly : res.descriptive.primaryCleanRunsOnly ? iv(res.descriptive.primaryCleanRunsOnly) : "n/a (a stratum has fewer than 2 clean runs)"}.`);
    for (const d of DEV) L.push(`- ${d}: composite ${iv(res.descriptive[d].composite)}, relationship F1 ${iv(res.descriptive[d].relF1)} (plain Welch).`);
  }
  if (res.descriptive.itops) L.push(`- itops (3 against 3, plain Welch): composite ${iv(res.descriptive.itops.composite)}, relationship F1 ${iv(res.descriptive.itops.relF1)}, class F1 ${iv(res.descriptive.itops.classF1)}, property F1 ${iv(res.descriptive.itops.propF1)}.`);
  if (res.epo) {
    const e = res.epo, o = res.reading.epo;
    const EPOW = { a: (x) => `on the held-out domain too, the second-generation interviewer scores ${p1(x.estimate)} points higher [${sg(x.lo)}, ${sg(x.hi)}]`,
      b: (x) => `${p1(x.estimate)} points higher on the held-out domain; with 3 runs per arm the difference is within run-to-run spread [${sg(x.lo)}, ${sg(x.hi)}]`,
      c: (x) => `no gain on the held-out domain [${sg(x.lo)}, ${sg(x.hi)}], where the final interviewer is near the ceiling` };
    L.push("", "## Held-out domain (EPO-DESIGN.md)", "", "| Arm | n | Composite | Class F1 | Rel F1 | Prop F1 |", "|---|---|---|---|---|---|");
    for (const [k, c] of Object.entries(e.cells)) L.push(`| ${k === "final" ? "final (committed interactive ePO runs)" : "v1 same-model"} | ${c.n} | ${cell(c.composite)} | ${cell(c.classF1)} | ${cell(c.relF1)} | ${cell(c.propF1)} |`);
    L.push("", `- **Composite, final − v1 (plain Welch, 3 vs 3):** ${iv(e.differences.composite)}, df ${e.differences.composite.df.toFixed(1)}. Outcome (${o}): "${EPOW[o](e.differences.composite)}".`,
      `- Relationship F1, final − v1 (descriptive): ${iv(e.differences.relF1)}.`,
      `- v1 runs: ${e.v1.map((x) => `${x.runId} ${x.stoppedReason}, ${x.turns} turns, ${x.costUsd.toFixed(2)} USD, composite ${p1(x.row.composite)}, relay ${x.relayAudit ? `${x.relayAudit.toolRequests}/${x.relayAudit.violations.length}` : "?"}`).join("; ")}.`);
  }
  if (res.twoByTwo) {
    const t = res.twoByTwo;
    L.push("", "## Interviewer x simulated expert on itops (WEAK-EXPERT-ITOPS-DESIGN.md)", "", "Cells (gpt-6-sol interviewer model; 3 runs each): A v2 + gpt-6-sol expert (final), B v2 + gpt-4o-mini (persona ablation), C v1 + gpt-6-sol (E1), D v1 + gpt-4o-mini (this block).", "",
      "| Cell | Composite | Rel F1 | Class F1 |", "|---|---|---|---|");
    for (const k of ["A", "B", "C", "D"]) L.push(`| ${k} | ${cell(t.cells[k].composite)} | ${cell(t.cells[k].relF1)} | ${cell(t.cells[k].classF1)} |`);
    const lab = { interviewerStrongExpert: "interviewer, strong expert (A − C)", interviewerWeakExpert: "interviewer, weak expert (B − D)", expertV2: "expert, v2 interviewer (A − B)", expertV1: "expert, v1 interviewer (C − D)", interviewerMain: "interviewer main effect", expertMain: "expert main effect", interaction: "interaction (A − B) − (C − D)" };
    L.push("", "| Effect | Composite | Rel F1 |", "|---|---|---|");
    for (const k of Object.keys(lab)) L.push(`| ${lab[k]} | ${iv(t.effects.composite[k])} | ${iv(t.effects.relF1[k])} |`);
    L.push("", `Cell D runs: ${t.runs.map((x) => `${x.runId} ${x.stoppedReason}, ${x.turns} turns, ${typeof x.costUsd === "number" ? x.costUsd.toFixed(2) : "?"} USD, composite ${p1(x.composite)}`).join("; ")}.`);
  }
  L.push("", "## Per run", "", "| Arm | Domain | Run | Stop | Scored on | Turns | Cost USD | Composite | Rel F1 | Interviewer-first / 100 gold | v1 relay audit (tool requests / violations / skip notes) |", "|---|---|---|---|---|---|---|---|---|---|---|");
  for (const arm of ["v1", "final"]) for (const d of ALL) for (const x of res.arms[arm][d]) {
    const a = x.relayAudit ? `${x.relayAudit.toolRequests} / ${x.relayAudit.violations.length} / ${x.relayAudit.skipNotesRewritten}` : "";
    L.push(`| ${arm} | ${d} | ${x.runId} | ${x.stoppedReason} | ${x.scoredOn} | ${x.turns} | ${typeof x.costUsd === "number" ? x.costUsd.toFixed(2) : "n/a"} | ${p1(x.row.composite)} | ${p1(x.row.relF1)} | ${x.interviewerFirstPer100 === null ? "n/a" : x.interviewerFirstPer100.toFixed(1)} | ${a} |`);
  }
  // Interviews cut off by infrastructure (DESIGN.md): kept, not averaged, rerun alone.
  const failed = [];
  for (const root of [path.join(OUT_DIR, "failed-attempts"), path.join(RESULTS, "final-scores", "failed-attempts")]) {
    if (!fs.existsSync(root)) continue;
    for (const name of fs.readdirSync(root).sort()) {
      const pr = readJson(path.join(root, name, "progress.json")) || {};
      failed.push(`\`${path.relative(RESULTS, path.join(root, name))}/\`: phase ${pr.phase || "?"}, ${pr.turnsUsed ?? "?"} turns, ${typeof pr.costUsd === "number" ? pr.costUsd.toFixed(2) : "?"} USD${pr.failureKind ? `, ${pr.failureKind}` : ""}`);
    }
  }
  L.push("", "## Interruptions", "", ...(failed.length ? failed.map((x) => `- ${x}; not averaged, the interview was rerun alone.`) : ["- none"]));
  const inc = Object.entries(res.incomplete).filter(([, v]) => v.length);
  if (inc.length) L.push("", `Not (yet) scored: ${inc.map(([a, v]) => `${a}: ${v.join(", ")}`).join("; ")}.`);
  const cost = (arm) => ALL.flatMap((d) => res.arms[arm][d].filter((x) => !(arm === "final" && ["run-01", "run-02", "run-03"].includes(x.runId))).map((x) => x.costUsd || 0)).reduce((a, b) => a + b, 0);
  L.push("", `Cost of the runs made for E1 (harness figure, gpt-6-sol rate): v1 arm ${cost("v1").toFixed(2)} USD, final top-up ${cost("final").toFixed(2)} USD.`, "");
  return L.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const res = runAll();
  const md = renderReport(res);
  if (process.argv.includes("--write")) {
    fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(res, null, 2) + "\n");
    fs.writeFileSync(path.join(OUT_DIR, "REPORT.md"), md);
  }
  console.log(md);
}
