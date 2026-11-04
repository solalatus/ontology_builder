// PERSONA ABLATION REPORT (ontology_translation/results/persona-ablation/DESIGN.md)
//
//   node tests/evals/persona-ablation-report.mjs [--write]
//
// Offline, no API calls. Three itops arms, all rescored with the current
// scorer from their saved recovered-model.yaml:
//   first-paper  tests/evals/results/runs/run-0X            (gpt-4o-mini persona, first paper)
//   ablation     results/persona-ablation/runs/run-0X/itops  (final interviewer, gpt-4o-mini persona)
//   final        results/final-scores/runs/run-0X/itops      (final interviewer, gpt-6-sol persona)
// Reports per run and mean [min-max]: composite, class/relationship/property
// F1, precision and recall (heuristic, full domain); the bootstrap intervals
// of final - ablation and ablation - first paper (same resampling as
// run-intervals.mjs); and the three Amendment-1 checks: who named first,
// precision, confirm-only persona turns.
// --write saves results.json and REPORT.md into the persona-ablation folder.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { rescoreRun } from "./rescore-saved-run.mjs";
import { resolveDomainYamlPath, loadGroundTruthModel } from "./lib/groundTruthModel.mjs";
import { collectMultiSegmentIdentifiers } from "./lib/leakDetector.mjs";
import { parseConversationLog } from "./lib/reportGenerator.mjs";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { computeFirstSpeakerIdentifiers, crossReferenceMatchedIdentifiers } from "./lib/interviewerPriorKnowledge.mjs";
import { goldTerms, confirmOnly } from "./persona-confirm-only.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const RESULTS = path.join(ROOT, "ontology_translation", "results");
const OUT_DIR = path.join(RESULTS, "persona-ablation");
const RUNS = ["run-01", "run-02", "run-03"];
const ARMS = {
  "first-paper": RUNS.map((r) => ({ run: r, dir: path.join(__dirname, "results", "runs", r), domain: null })),
  ablation: RUNS.map((r) => ({ run: r, dir: path.join(RESULTS, "persona-ablation", "runs", r, "itops"), domain: "itops" })),
  final: RUNS.map((r) => ({ run: r, dir: path.join(RESULTS, "final-scores", "runs", r, "itops"), domain: "itops" })),
};
const DRAWS = 10000, SEED = 20261104;

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

function scores(run) {
  // The first paper's runs carry no domain of their own; rescoreRun scores them
  // against the itops fixture (the same 68 / 108 / 111 gold as the domain yaml).
  const m = rescoreRun(run.dir, run.domain).heuristic.full;
  const pick = (x) => ({ f1: x.f1, precision: x.precision, recall: x.recall });
  return { composite: m.recoveryEffectiveness, classes: pick(m.classes), relationships: pick(m.relationships), properties: pick(m.properties) };
}

function whoNamedFirst(run) {
  const domainYamlPath = resolveDomainYamlPath("itops");
  const domainYamlDoc = yaml.load(fs.readFileSync(domainYamlPath, "utf8"));
  const groundTruth = loadGroundTruthModel({ format: "domain-yaml", path: domainYamlPath });
  const candidates = collectMultiSegmentIdentifiers(domainYamlDoc);
  const entries = parseConversationLog(fs.readFileSync(path.join(run.dir, "conversation-log.md"), "utf8"));
  const { interviewerFirst, personaFirst, expertWordsFirst } = computeFirstSpeakerIdentifiers(entries, candidates);
  const heuristicMatches = JSON.parse(fs.readFileSync(path.join(run.dir, "heuristic-matches.json"), "utf8"));
  const { state } = recoveredStateFromYaml(fs.readFileSync(path.join(run.dir, "recovered-model.yaml"), "utf8"));
  const cross = (ids) => crossReferenceMatchedIdentifiers({ identifiers: ids, domainYamlDoc, groundTruth, recoveredState: state, heuristicMatches });
  const named = new Set([...interviewerFirst, ...personaFirst, ...expertWordsFirst]);
  const matchedInterviewerFirst = cross(interviewerFirst).size, matchedNamed = cross(named).size;
  return {
    named: named.size, interviewerFirst: interviewerFirst.size, expertWordsFirst: expertWordsFirst.size, personaFirstRaw: personaFirst.size,
    interviewerFirstShare: named.size ? interviewerFirst.size / named.size : null,
    matchedNamed, matchedInterviewerFirst,
    interviewerFirstShareOfMatches: matchedNamed ? matchedInterviewerFirst / matchedNamed : null,
  };
}

export function runAll() {
  const terms = goldTerms(resolveDomainYamlPath("itops"));
  const out = { draws: DRAWS, seed: SEED, arms: {}, means: {}, differences: {}, reading: {} };
  for (const [arm, runs] of Object.entries(ARMS)) {
    out.arms[arm] = runs.map((run) => {
      const prov = (() => { try { return JSON.parse(fs.readFileSync(path.join(run.dir, "provenance.json"), "utf8")); } catch { return null; } })();
      return {
        run: run.run, turns: prov ? prov.turnsUsed : null, costUsd: prov ? prov.totalCostUsd : null, stopped: prov ? prov.stoppedReason : null,
        ...scores(run), whoNamedFirst: whoNamedFirst(run), confirmOnly: confirmOnly(run.dir, terms),
      };
    });
  }
  const val = {
    composite: (x) => x.composite, classF1: (x) => x.classes.f1, relF1: (x) => x.relationships.f1, propF1: (x) => x.properties.f1,
    classP: (x) => x.classes.precision, relP: (x) => x.relationships.precision, propP: (x) => x.properties.precision,
    classR: (x) => x.classes.recall, relR: (x) => x.relationships.recall, propR: (x) => x.properties.recall,
    interviewerFirstShare: (x) => x.whoNamedFirst.interviewerFirstShare,
    interviewerFirstShareOfMatches: (x) => x.whoNamedFirst.interviewerFirstShareOfMatches,
    confirmOnlyShare: (x) => x.confirmOnly.share,
  };
  for (const arm of Object.keys(ARMS)) {
    out.means[arm] = {};
    for (const [k, f] of Object.entries(val)) {
      const xs = out.arms[arm].map(f).filter((x) => typeof x === "number");
      out.means[arm][k] = xs.length ? { mean: mean(xs), min: Math.min(...xs), max: Math.max(...xs) } : null;
    }
  }
  let k = 0;
  for (const m of ["composite", "classF1", "relF1", "propF1"]) {
    for (const [a, b] of [["final", "ablation"], ["ablation", "first-paper"], ["final", "first-paper"]]) {
      out.differences[`${m}: ${a} - ${b}`] = diffInterval(out.arms[a].map(val[m]), out.arms[b].map(val[m]), SEED + 300 + k++);
    }
  }
  // Share of the first-paper -> final gain that remains at the weak persona (DESIGN.md, "Reading").
  for (const m of ["composite", "relF1"]) {
    const total = out.means.final[m].mean - out.means["first-paper"][m].mean;
    out.reading[`${m}: share of the gain carried by interviewer/prompt/tools`] = total ? (out.means.ablation[m].mean - out.means["first-paper"][m].mean) / total : null;
    out.reading[`${m}: share of the gain carried by the stronger persona`] = total ? (out.means.final[m].mean - out.means.ablation[m].mean) / total : null;
  }
  // Amendment 1, fixed reading.
  const A = out.means.ablation, F = out.means.final;
  const c1 = A.interviewerFirstShareOfMatches.mean > F.interviewerFirstShareOfMatches.mean;
  const c2 = A.confirmOnlyShare.mean >= F.confirmOnlyShare.mean + 0.10;
  const c3 = A.relP.mean <= F.relP.mean;
  out.reading.rubberStamping = { higherInterviewerFirstShareOfMatches: c1, confirmOnlyAtLeast10ppHigher: c2, relPrecisionNoHigher: c3, verdict: c1 && c2 && c3 ? "supported" : "not supported" };
  return out;
}

const pct = (x) => (x === null || x === undefined ? "n/a" : (100 * x).toFixed(1));
const cell = (s) => (s ? `${pct(s.mean)} [${pct(s.min)}–${pct(s.max)}]` : "n/a");
export function renderReport(res) {
  const arms = ["first-paper", "ablation", "final"];
  const L = ["# Persona ablation on itops: results", "", "Generated by `tests/evals/persona-ablation-report.mjs` (offline; all arms rescored with the current scorer, heuristic, full domain). Values in %, mean [min–max] over 3 runs.", ""];
  L.push("| Metric | First paper | Ablation (final interviewer, 4o-mini persona) | Final |", "|---|---|---|---|");
  const rows = [["Composite", "composite"], ["Class F1", "classF1"], ["Relationship F1", "relF1"], ["Property F1", "propF1"],
    ["Class precision", "classP"], ["Relationship precision", "relP"], ["Property precision", "propP"],
    ["Class recall", "classR"], ["Relationship recall", "relR"], ["Property recall", "propR"],
    ["Interviewer-first share of named terms", "interviewerFirstShare"], ["Interviewer-first share of matched terms", "interviewerFirstShareOfMatches"],
    ["Confirm-only persona turns (class+relationship window)", "confirmOnlyShare"]];
  for (const [label, key] of rows) L.push(`| ${label} | ${arms.map((a) => cell(res.means[a][key])).join(" | ")} |`);
  L.push("", "## Per run", "", "| Arm | Run | Turns | Cost USD | Composite | Rel F1 | Interviewer-first (matched) | Confirm-only |", "|---|---|---|---|---|---|---|---|");
  for (const a of arms) for (const r of res.arms[a]) {
    L.push(`| ${a} | ${r.run} | ${r.turns ?? "n/a"} | ${typeof r.costUsd === "number" ? r.costUsd.toFixed(2) : "n/a"} | ${pct(r.composite)} | ${pct(r.relationships.f1)} | ${r.whoNamedFirst.interviewerFirst}/${r.whoNamedFirst.named} (${r.whoNamedFirst.matchedInterviewerFirst}/${r.whoNamedFirst.matchedNamed}) | ${r.confirmOnly.confirmOnly}/${r.confirmOnly.turns} |`);
  }
  L.push("", "## Differences (percentage points, 95 % bootstrap over runs)", "", "| Difference | Estimate | 95 % interval |", "|---|---|---|");
  for (const [k, d] of Object.entries(res.differences)) L.push(`| ${k} | ${(100 * d.estimate).toFixed(1)} | [${(100 * d.lo).toFixed(1)}, ${(100 * d.hi).toFixed(1)}] |`);
  L.push("", "## Reading (fixed in DESIGN.md)", "");
  for (const [k, v] of Object.entries(res.reading)) if (typeof v === "number") L.push(`- ${k}: ${pct(v)} %`);
  const rs = res.reading.rubberStamping;
  L.push(`- Rubber-stamping concern (Amendment 1): **${rs.verdict}** (higher interviewer-first share of matches: ${rs.higherInterviewerFirstShareOfMatches}; confirm-only share at least 10 pp higher: ${rs.confirmOnlyAtLeast10ppHigher}; relationship precision no higher: ${rs.relPrecisionNoHigher}).`);
  L.push("", "Cost is the harness figure, which prices the persona's gpt-4o-mini calls at the gpt-6-sol rate (upper bound).", "");
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
