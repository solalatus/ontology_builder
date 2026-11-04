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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const RESULTS = path.join(ROOT, "ontology_translation", "results");
const OUT_DIR = path.join(RESULTS, "epo-heldout");
const DOMAIN = "epo-ordering";
const RUNS = ["run-01", "run-02", "run-03"];
const runDir = (arm, r) => path.join(OUT_DIR, arm === "b3" ? "b3-no-commit" : "interactive", r, DOMAIN);
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

export function runAll() {
  const out = { draws: DRAWS, seed: SEED, goldElements, band: BAND, arms: {}, means: {}, differences: {}, reading: {}, postHoc: {} };
  for (const arm of ["interactive", "b3"]) out.arms[arm] = RUNS.map((r) => measure(arm, r));
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
  out.postHoc.personaBeyondBriefing = Object.fromEntries(["interactive", "b3"].map((arm) => [arm, RUNS.map((r) => personaBeyondBriefing(runDir(arm, r)))]));
  return out;
}

const pct = (x) => (x === null || x === undefined ? "n/a" : (100 * x).toFixed(1));
const cell = (s) => (s ? `${pct(s.mean)} [${pct(s.min)}–${pct(s.max)}]` : "n/a");
export function renderReport(res) {
  const L = ["# ePO eOrdering, held out: results", "", `Generated by \`tests/evals/epo-heldout-report.mjs\` (offline; rescored with the current scorer; heuristic, full domain unless stated). Gold: ${res.goldElements} elements. Values in %, mean [min–max] over 3 runs.`, ""];
  L.push("| Metric | Interactive | B3 (no live commits) |", "|---|---|---|");
  const rows = [["Composite (full domain)", "composite"], ["Class F1", "classF1"], ["Relationship F1", "relF1"], ["Property F1", "propF1"],
    ["Relationship precision", "relP"], ["Relationship recall", "relR"], ["Class recall", "classR"], ["Rules F1", "rulesF1"], ["Actions F1", "actionsF1"],
    ["Composite (practical scope)", "practicalComposite"], ["Relationship / class recall ratio (x100)", "endpointRatio"], ["Conditional rate", "conditionalRate"],
    ["Interviewer-first identifiers per 100 gold elements (x100)", "interviewerFirstPer100"]];
  for (const [label, key] of rows) L.push(`| ${label} | ${cell(res.means.interactive[key])} | ${cell(res.means.b3[key])} |`);
  L.push("", "## Per run", "", "| Arm | Run | Turns | Cost USD | Composite | Rel F1 | Practical composite |", "|---|---|---|---|---|---|---|");
  for (const arm of ["interactive", "b3"]) for (const r of res.arms[arm]) L.push(`| ${arm} | ${r.run} | ${r.turns} | ${r.costUsd.toFixed(2)} | ${pct(r.full.composite)} | ${pct(r.full.relationships.f1)} | ${pct(r.practical.composite)} |`);
  L.push("", "## Differences (percentage points, 95 % bootstrap over runs)", "", "| Difference | Estimate | 95 % interval |", "|---|---|---|");
  for (const [k, d] of Object.entries(res.differences)) L.push(`| ${k} | ${(100 * d.estimate).toFixed(1)} | [${(100 * d.lo).toFixed(1)}, ${(100 * d.hi).toFixed(1)}] |`);
  L.push("", "## Readings fixed in DESIGN.md", "", `- Generalisation (published range ${pct(res.band.lo)}–${pct(res.band.hi)}, itops mean ${pct(res.band.below)}): **${res.reading.generalisation}**.`, `- Overfitting check: **${res.reading.overfittingCheck}**.`);
  L.push("", "## Post-hoc check (disclosed; not in DESIGN.md)", "", "Multi-word gold class names that are absent from the persona briefing, and how many of them the simulated expert said first in each run:", "");
  for (const [arm, rs] of Object.entries(res.postHoc.personaBeyondBriefing)) L.push(`- ${arm}: ${rs.map((x) => `${x.personaSaidFirst}/${x.absentFromBriefing}`).join(", ")} (of ${rs[0].multiWordClasses} multi-word class names)`);
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
