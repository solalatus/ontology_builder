// EPO HELD-OUT REPORT (ontology_translation/results/epo-heldout/DESIGN.md)
//
//   node tests/evals/epo-heldout-report.mjs [--write]
//
// Offline, no API calls. Arms on epo-ordering, rescored with the current scorer:
//   interactive  results/epo-heldout/interactive/run-0X/epo-ordering
//   b3           results/epo-heldout/b3-no-commit/run-0X/epo-ordering/snapshots/A
//                (B3 keeps its scored, post-interview model in snapshot A, as in baselines-gpt6)
// Reports per run and mean [min-max]: composite, class / relationship / property
// F1, precision, recall (heuristic; full domain and practical scope), rules and
// actions F1; the endpoint ratio and conditional rate; interviewer-first
// identifiers per 100 gold elements; cost and turns. Then the readings fixed in
// DESIGN.md, and one disclosed post-hoc check (persona naming beyond its briefing).
// --write saves results.json and REPORT.md into the epo-heldout folder.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { rescoreRun } from "./rescore-saved-run.mjs";
import { measureRun } from "./endpoint-conditioned-by-domain.mjs";
import { resolveDomainYamlPath, loadGroundTruthModel, scopeGroundTruth } from "./lib/groundTruthModel.mjs";
import { collectMultiSegmentIdentifiers } from "./lib/leakDetector.mjs";
import { parseConversationLog } from "./lib/reportGenerator.mjs";
import { computeFirstSpeakerIdentifiers } from "./lib/interviewerPriorKnowledge.mjs";
import { parseTurns, plainWords } from "./persona-confirm-only.mjs";
import { welch, welchDiffOfDiffs } from "./lib/welch.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const RESULTS = path.join(ROOT, "ontology_translation", "results");
const OUT_DIR = path.join(RESULTS, "epo-heldout");
const DOMAIN = "epo-ordering";
const RUNS = ["run-01", "run-02", "run-03"];
// Revision 1, E2 (WEAK-EXPERT-DESIGN.md): the weak-expert arm, the interactive
// configuration with the gpt-4o-mini persona. Scored like interactive.
const ARM_DIR = { interactive: "interactive", b3: "b3-no-commit", weak: "weak-expert" };
const runDir = (arm, r) => path.join(OUT_DIR, ARM_DIR[arm], r, DOMAIN);
const scoredDir = (arm, r) => (arm === "b3" ? path.join(runDir(arm, r), "snapshots", "A") : runDir(arm, r));
const DRAWS = 10000, SEED = 20261104;
// Fixed in DESIGN.md before any run.
const BAND = { lo: 0.680, hi: 0.911, below: 0.577 };

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const resample = (xs, r) => xs.map(() => xs[Math.floor(r() * xs.length)]);
const pctile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))];
function diffInterval(a, b, seed) {
  const r = rng(seed), vals = [];
  for (let i = 0; i < DRAWS; i++) vals.push(mean(resample(a, r)) - mean(resample(b, r)));
  vals.sort((x, y) => x - y);
  return { estimate: mean(a) - mean(b), lo: pctile(vals, 0.025), hi: pctile(vals, 0.975) };
}

const domainYamlPath = resolveDomainYamlPath(DOMAIN);
const domainDoc = yaml.load(fs.readFileSync(domainYamlPath, "utf8"));
const goldFull = loadGroundTruthModel({ format: "domain-yaml", path: domainYamlPath });
const goldScoped = scopeGroundTruth(goldFull, goldFull.practicalScopeClassIds, goldFull.practicalScopePropertyIds);
const goldElements = Object.keys(goldFull.classes).length + goldFull.relationships.length + (Array.isArray(goldFull.properties) ? goldFull.properties.length : Object.keys(goldFull.properties || {}).length);

function measure(arm, r) {
  const dir = scoredDir(arm, r);
  const o = rescoreRun(dir, DOMAIN);
  const pick = (x) => ({ f1: x.f1, precision: x.precision, recall: x.recall });
  const sc = (k) => ({ composite: o.heuristic[k].recoveryEffectiveness, classes: pick(o.heuristic[k].classes), relationships: pick(o.heuristic[k].relationships), properties: pick(o.heuristic[k].properties), rulesF1: o.rules[k] && o.rules[k].f1, actionsF1: o.actions[k] && o.actions[k].identification && o.actions[k].identification.f1 });
  const ep = measureRun(goldFull, dir, "full", "heuristic");
  const entries = parseConversationLog(fs.readFileSync(path.join(runDir(arm, r), "conversation-log.md"), "utf8"));
  const { interviewerFirst, personaFirst } = computeFirstSpeakerIdentifiers(entries, collectMultiSegmentIdentifiers(domainDoc));
  const prov = JSON.parse(fs.readFileSync(path.join(runDir(arm, r), "provenance.json"), "utf8"));
  return {
    run: r, turns: prov.turnsUsed, costUsd: prov.totalCostUsd, stopped: prov.stoppedReason,
    full: sc("full"), practical: sc("practical"),
    endpoint: { ratio: ep.classRecall ? ep.relRecall / ep.classRecall : null, conditionalRate: ep.conditionalRate, classRecall: ep.classRecall, relRecall: ep.relRecall },
    interviewerFirstPer100: (100 * interviewerFirst.size) / goldElements, personaFirstRaw: personaFirst.size,
  };
}

// Post-hoc, disclosed: multi-word gold class names absent from persona.md that the persona says first.
function personaBeyondBriefing(dir) {
  const norm = (s) => s.toLowerCase().replace(/[*_`]/g, " ").replace(/[-\s]+/g, " ");
  const brief = norm(fs.readFileSync(path.join(ROOT, "ontology_translation", "domains", DOMAIN, "persona.md"), "utf8"));
  const multi = Object.keys(domainDoc.classes).map(plainWords).filter((w) => w.includes(" "));
  const absent = multi.filter((w) => !brief.includes(w));
  const t = parseTurns(fs.readFileSync(path.join(dir, "conversation-log.md"), "utf8")).map((x) => ({ ...x, n: norm(x.text) }));
  const said = absent.filter((w) => { const e = t.find((x) => x.n.includes(w)); return e && e.role === "persona"; });
  return { multiWordClasses: multi.length, absentFromBriefing: absent.length, personaSaidFirst: said.length };
}

const complete = (arm, r) => { try { const p = JSON.parse(fs.readFileSync(path.join(runDir(arm, r), "provenance.json"), "utf8")); return p.status === "complete"; } catch { return false; } };

export function runAll() {
  const out = { draws: DRAWS, seed: SEED, goldElements, band: BAND, arms: {}, means: {}, differences: {}, reading: {}, postHoc: {} };
  for (const arm of ["interactive", "b3"]) out.arms[arm] = RUNS.map((r) => measure(arm, r));
  // The weak-expert arm is reported once all its runs have ended.
  if (RUNS.every((r) => complete("weak", r))) out.arms.weak = RUNS.map((r) => measure("weak", r));
  const val = {
    composite: (x) => x.full.composite, classF1: (x) => x.full.classes.f1, relF1: (x) => x.full.relationships.f1, propF1: (x) => x.full.properties.f1,
    relP: (x) => x.full.relationships.precision, relR: (x) => x.full.relationships.recall, classR: (x) => x.full.classes.recall,
    rulesF1: (x) => x.full.rulesF1, actionsF1: (x) => x.full.actionsF1,
    practicalComposite: (x) => x.practical.composite,
    endpointRatio: (x) => x.endpoint.ratio, conditionalRate: (x) => x.endpoint.conditionalRate,
    interviewerFirstPer100: (x) => x.interviewerFirstPer100 / 100,
  };
  for (const arm of Object.keys(out.arms)) {
    out.means[arm] = {};
    for (const [k, f] of Object.entries(val)) {
      const xs = out.arms[arm].map(f).filter((x) => typeof x === "number");
      out.means[arm][k] = xs.length ? { mean: mean(xs), min: Math.min(...xs), max: Math.max(...xs) } : null;
    }
  }
  let k = 0;
  for (const m of ["composite", "relF1", "classF1", "propF1"]) out.differences[`${m}: interactive - B3`] = diffInterval(out.arms.interactive.map(val[m]), out.arms.b3.map(val[m]), SEED + 500 + k++);
  const c = out.means.interactive.composite.mean;
  out.reading.generalisation = c >= BAND.lo && c <= BAND.hi ? "transfers"
    : c < BAND.below ? "does not transfer"
    : c > BAND.hi ? "above the published range (the fixed rule has no label for this case)"
    : "between the itops mean and the published range (reported without a label)";
  const d = out.differences["composite: interactive - B3"];
  out.reading.overfittingCheck = d.lo <= 0
    ? "B3 level with or ahead of interactive (interval includes 0 or is negative): the itops pattern is not specific to itops"
    : "interactive clearly ahead of B3: the itops pattern (B3 level with interactive) is specific to itops";
  out.postHoc.personaBeyondBriefing = Object.fromEntries(Object.keys(out.arms).map((arm) => [arm, RUNS.map((r) => personaBeyondBriefing(runDir(arm, r)))]));
  if (out.arms.weak) out.weakExpert = weakExpertReading(out, val);
  return out;
}

// WEAK-EXPERT-DESIGN.md, "Reading (fixed in advance)": the ePO drop against the
// itops persona-ablation drop, Welch t-intervals. The itops values are the
// committed per-run values of run-intervals/results.json (final itops, persona
// ablation), the cells the article's Table III shows.
function weakExpertReading(out, val) {
  const ri = JSON.parse(fs.readFileSync(path.join(RESULTS, "run-intervals", "results.json"), "utf8"));
  const res = { stoppedReasons: out.arms.weak.map((x) => x.stopped), metrics: {} };
  for (const m of ["composite", "relF1"]) {
    const inter = out.arms.interactive.map(val[m]), weak = out.arms.weak.map(val[m]);
    const fin = ri.cells.final.itops[m].values, abl = ri.cells["persona-ablation"].itops[m].values;
    res.metrics[m] = {
      epoDrop: welch(inter, weak), itopsDrop: welch(fin, abl), differenceOfDrops: welchDiffOfDiffs(inter, weak, fin, abl),
      epoRetainedShare: mean(weak) / mean(inter), itopsRetainedShare: mean(abl) / mean(fin),
    };
  }
  const c = res.metrics.composite;
  res.reading = c.epoDrop.estimate >= c.itopsDrop.estimate
    ? "the ePO headline depends on the simulated expert at least as much as the itops result does"
    : c.differenceOfDrops.hi < 0
      ? "the interviewer carries more of the result on ePO than on itops; the likely reason is that the vocabulary of this public ontology is in the models' prior knowledge"
      : "neither label: the ePO drop is smaller on average, but the difference of drops is within run-to-run spread";
  res.readingCase = c.epoDrop.estimate >= c.itopsDrop.estimate ? 1 : c.differenceOfDrops.hi < 0 ? 2 : 3;
  return res;
}

const pct = (x) => (x === null || x === undefined ? "n/a" : (100 * x).toFixed(1));
const cell = (s) => (s ? `${pct(s.mean)} [${pct(s.min)}–${pct(s.max)}]` : "n/a");
export function renderReport(res) {
  const L = ["# ePO eOrdering, held out: results", "", `Generated by \`tests/evals/epo-heldout-report.mjs\` (offline; rescored with the current scorer; heuristic, full domain unless stated). Gold: ${res.goldElements} elements. Values in %, mean [min–max] over 3 runs.`, ""];
  const arms = Object.keys(res.arms);
  const head = { interactive: "Interactive", b3: "B3 (no live commits)", weak: "Weak expert (gpt-4o-mini persona)" };
  L.push(`| Metric | ${arms.map((a) => head[a]).join(" | ")} |`, `|---|${arms.map(() => "---").join("|")}|`);
  const rows = [["Composite (full domain)", "composite"], ["Class F1", "classF1"], ["Relationship F1", "relF1"], ["Property F1", "propF1"],
    ["Relationship precision", "relP"], ["Relationship recall", "relR"], ["Class recall", "classR"], ["Rules F1", "rulesF1"], ["Actions F1", "actionsF1"],
    ["Composite (practical scope)", "practicalComposite"], ["Relationship / class recall ratio (x100)", "endpointRatio"], ["Conditional rate", "conditionalRate"],
    ["Interviewer-first identifiers per 100 gold elements (x100)", "interviewerFirstPer100"]];
  for (const [label, key] of rows) L.push(`| ${label} | ${arms.map((a) => cell(res.means[a][key])).join(" | ")} |`);
  L.push("", "## Per run", "", "| Arm | Run | Turns | Cost USD | Composite | Rel F1 | Practical composite |", "|---|---|---|---|---|---|---|");
  for (const arm of arms) for (const r of res.arms[arm]) L.push(`| ${arm} | ${r.run} | ${r.turns} | ${r.costUsd.toFixed(2)} | ${pct(r.full.composite)} | ${pct(r.full.relationships.f1)} | ${pct(r.practical.composite)} |`);
  L.push("", "## Differences (percentage points, 95 % bootstrap over runs)", "", "| Difference | Estimate | 95 % interval |", "|---|---|---|");
  for (const [k, d] of Object.entries(res.differences)) L.push(`| ${k} | ${(100 * d.estimate).toFixed(1)} | [${(100 * d.lo).toFixed(1)}, ${(100 * d.hi).toFixed(1)}] |`);
  L.push("", "## Readings fixed in DESIGN.md", "", `- Generalisation (published range ${pct(res.band.lo)}–${pct(res.band.hi)}, itops mean ${pct(res.band.below)}): **${res.reading.generalisation}**.`, `- Overfitting check: **${res.reading.overfittingCheck}**.`);
  L.push("", "## Post-hoc check (disclosed; not in DESIGN.md)", "", "Multi-word gold class names that are absent from the persona briefing, and how many of them the simulated expert said first in each run:", "");
  for (const [arm, rs] of Object.entries(res.postHoc.personaBeyondBriefing)) L.push(`- ${arm}: ${rs.map((x) => `${x.personaSaidFirst}/${x.absentFromBriefing}`).join(", ")} (of ${rs[0].multiWordClasses} multi-word class names)`);
  if (res.weakExpert) {
    const w = res.weakExpert, pp = (x) => (100 * x).toFixed(1), sg = (x) => `${x >= 0 ? "+" : ""}${pp(x)}`;
    const iv = (x) => `${sg(x.estimate)} [${sg(x.lo)}, ${sg(x.hi)}] (df ${x.df.toFixed(1)})`;
    L.push("", "## Weak expert (WEAK-EXPERT-DESIGN.md): drops, 95 % Welch t-intervals, percentage points", "",
      "| Metric | ePO drop (interactive − weak) | itops drop (final − persona ablation) | ePO drop − itops drop | Retained share ePO / itops |", "|---|---|---|---|---|");
    for (const [m, x] of Object.entries(w.metrics)) L.push(`| ${m === "relF1" ? "Relationship F1" : "Composite"} | ${iv(x.epoDrop)} | ${iv(x.itopsDrop)} | ${iv(x.differenceOfDrops)} | ${pp(x.epoRetainedShare)} % / ${pp(x.itopsRetainedShare)} % |`);
    L.push("", `Stop reasons, weak expert: ${w.stoppedReasons.join(", ")}.`, "", `**Reading fixed in WEAK-EXPERT-DESIGN.md (case ${w.readingCase}): ${w.reading}.**`, "",
      "With 3 runs per arm these intervals are wide; they describe the runs, not a population. Relationship F1 is descriptive.");
  }
  L.push("", "Cost is the harness figure (gpt-6-sol rate for every call).", "");
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
