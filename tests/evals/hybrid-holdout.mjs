// Issue #174: the hybrid merge (union, except relationships need 2 of 3
// interviews) on a hold-out of interviews phase 1 never touched.
// Pre-registered: ontology_translation/results/majority-vote/HYBRID-DESIGN.md.
// Offline: committed interviews only, no API calls.
//
// Usage: node tests/evals/hybrid-holdout.mjs [--write]
//   --write  writes results.json, REPORT.md and each hybrid model under
//            ontology_translation/results/majority-vote/hybrid/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { buildGroups, buildModel, reviewQueue } from "./lib/majorityVote.mjs";
import { scoreDoc, dumpDoc, ERAS, DOMAINS } from "./majority-vote-merge.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const RESULTS = path.join(REPO, "ontology_translation", "results");
export const OUT_DIR = path.join(RESULTS, "majority-vote", "hybrid");

const B = "tests/evals/results/baselines";
export const HOLDOUT_SETS = [
  "tests/evals/results/runs",
  `${B}/competency-questions/control`, `${B}/competency-questions/treatment`,
  `${B}/competency-questions-gpt-5-mini/control`, `${B}/competency-questions-gpt-5-mini/treatment`,
  `${B}/prompt-tuning-bundle/control`, `${B}/prompt-tuning-bundle/treatment`,
  `${B}/self-correcting-interviewer/control`, `${B}/self-correcting-interviewer/treatment`,
  `${B}/b2-generic-interviewer`,
];

export const ARMS = {
  union: { threshold: 1 },
  hybrid: { threshold: 1, thresholds: { relationships: 2 } },
  majority: { threshold: 2 },
  intersection: { threshold: 3 },
};

export function setRuns(dir) {
  return fs.readdirSync(path.join(REPO, dir))
    .filter((d) => !/INVALID/.test(d) && fs.existsSync(path.join(REPO, dir, d, "recovered-model.yaml")))
    .sort();
}

/** Every 3-element subset, in lexicographic order. */
export function triples(items) {
  const out = [];
  for (let a = 0; a < items.length; a++)
    for (let b = a + 1; b < items.length; b++)
      for (let c = b + 1; c < items.length; c++) out.push([items[a], items[b], items[c]]);
  return out;
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const loadDoc = (file) => yaml.load(fs.readFileSync(file, "utf8")) || {};

function scoreTriple(docs, domain, collect, fileFor) {
  const groups = buildGroups(docs);
  const out = { singles: mean(docs.map((d) => scoreDoc(d, domain).composite)) };
  for (const [arm, opts] of Object.entries(ARMS)) {
    const { doc } = buildModel(docs, groups, { runs: [0, 1, 2], ...opts });
    const s = scoreDoc(doc, domain);
    out[arm] = { composite: s.composite, relationships: { precision: s.relationships.precision, recall: s.relationships.recall } };
    if (arm === "hybrid" && collect) collect.set(fileFor(), dumpDoc(doc));
  }
  out.hybrid_review = reviewQueue(groups, { runs: [0, 1, 2], ...ARMS.hybrid });
  return out;
}

export function runHoldout({ collect = null } = {}) {
  const sets = [];
  for (const dir of HOLDOUT_SETS) {
    const runs = setRuns(dir);
    const perTriple = triples(runs).map((t) => ({
      runs: t,
      ...scoreTriple(t.map((r) => loadDoc(path.join(REPO, dir, r, "recovered-model.yaml"))), "itops", collect,
        () => path.join(OUT_DIR, "holdout", dir.replace(/^tests\/evals\/results\//, "").replace(/\//g, "__"), t.join("+"), "recovered-model.yaml")),
    }));
    const avg = (f) => mean(perTriple.map(f));
    const set = { set: dir, interviews: runs.length, triples: perTriple.length, singles: avg((t) => t.singles) };
    for (const arm of Object.keys(ARMS)) {
      set[arm] = {
        composite: avg((t) => t[arm].composite),
        relationships: { precision: avg((t) => t[arm].relationships.precision), recall: avg((t) => t[arm].relationships.recall) },
      };
    }
    set.hybrid_review_relationships = avg((t) => t.hybrid_review.relationships.below_threshold + t.hybrid_review.relationships.conflicts);
    sets.push(set);
  }
  return sets;
}

/** The pre-registered criterion (HYBRID-DESIGN.md "Outcomes"). */
export function holdoutCriterion(sets) {
  const m = (arm) => mean(sets.map((s) => s[arm].composite));
  const winsVsUnion = sets.filter((s) => s.hybrid.composite > s.union.composite).length;
  const out = {
    sets: sets.length,
    mean: { singles: mean(sets.map((s) => s.singles)), ...Object.fromEntries(Object.keys(ARMS).map((a) => [a, m(a)])) },
    hybrid_wins_vs_union: winsVsUnion,
    hybrid_wins_vs_majority: sets.filter((s) => s.hybrid.composite > s.majority.composite).length,
  };
  out.beats_union_on_mean = out.mean.hybrid > out.mean.union;
  out.beats_majority_on_mean = out.mean.hybrid > out.mean.majority;
  out.wins_at_least_9_of_11 = winsVsUnion >= 9;
  out.convincing = out.beats_union_on_mean && out.beats_majority_on_mean && out.wins_at_least_9_of_11;
  return out;
}

/** Secondary: the hybrid on the phase-1 interviews (the data that suggested it). */
export function runPhase1({ collect = null } = {}) {
  const phase1 = JSON.parse(fs.readFileSync(path.join(RESULTS, "majority-vote", "results.json"), "utf8"));
  const out = {};
  for (const [era, cfg] of Object.entries(ERAS)) {
    const domains = {};
    for (const domain of DOMAINS) {
      const docs = ["run-01", "run-02", "run-03"].map((r) => loadDoc(path.join(RESULTS, cfg.runs(domain), r, domain, "recovered-model.yaml")));
      const groups = buildGroups(docs);
      const { doc } = buildModel(docs, groups, { runs: [0, 1, 2], ...ARMS.hybrid });
      if (collect) collect.set(path.join(OUT_DIR, "phase1", era, domain, "recovered-model.yaml"), dumpDoc(doc));
      const arms = phase1.eras[era].domains[domain].arms;
      domains[domain] = {
        hybrid: scoreDoc(doc, domain).composite,
        union: arms.union.composite, majority: arms.majority.composite,
        "merge(1,2)": arms["merge(1,2)"].composite, "merge(1,2,3)": arms["merge(1,2,3)"].composite,
      };
    }
    const keys = Object.keys(Object.values(domains)[0]);
    out[era] = { domains, macro: Object.fromEntries(keys.map((k) => [k, mean(Object.values(domains).map((d) => d[k]))])) };
  }
  return out;
}

export function runAll(opts = {}) {
  const holdout = runHoldout(opts);
  return {
    design: "ontology_translation/results/majority-vote/HYBRID-DESIGN.md",
    holdout: { sets: holdout, criterion: holdoutCriterion(holdout) },
    phase1: runPhase1(opts),
  };
}

// --- Report (every number from results.json) ---------------------------------

const f3 = (x) => x.toFixed(3);
const signed = (x) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(3)}`;

export function renderReport(r) {
  const out = [];
  const w = (s = "") => out.push(s);
  const c = r.holdout.criterion;
  w("# Hybrid merge on a hold-out (issue #174)");
  w();
  w("Generated by `tests/evals/hybrid-holdout.mjs` from `results.json`. Design pre-registered in");
  w("[`../HYBRID-DESIGN.md`](../HYBRID-DESIGN.md), committed before any hybrid result. Offline: committed");
  w("interviews only, no API calls.");
  w();
  w("**Hybrid** = union of everything the three interviews found, except relationships, which need two of");
  w("the three.");
  w();
  w(`**Verdict on the hold-out: ${c.convincing ? "convincing" : "not convincing"}** by the pre-registered criterion`);
  w(`(hybrid beats union and majority on the mean, and beats union in at least 9 of the ${c.sets} sets; see the deviation below).`);
  w();
  w("## Primary: hold-out, mean composite over the sets");
  w();
  w("| single interview | union | **hybrid** | majority | intersection |");
  w("|---:|---:|---:|---:|---:|");
  w(`| ${f3(c.mean.singles)} | ${f3(c.mean.union)} | **${f3(c.mean.hybrid)}** | ${f3(c.mean.majority)} | ${f3(c.mean.intersection)} |`);
  w();
  w(`- Hybrid − union: ${signed(c.mean.hybrid - c.mean.union)} on the mean; hybrid beats union in **${c.hybrid_wins_vs_union} of ${c.sets}** sets `
    + `(needed: 9). ${c.beats_union_on_mean ? "Beats" : "Does not beat"} union on the mean.`);
  w(`- Hybrid − majority: ${signed(c.mean.hybrid - c.mean.majority)} on the mean; hybrid beats majority in ${c.hybrid_wins_vs_majority} of ${c.sets} sets. `
    + `${c.beats_majority_on_mean ? "Beats" : "Does not beat"} majority on the mean.`);
  w(`- Hybrid − single interview: ${signed(c.mean.hybrid - c.mean.singles)}.`);
  w();
  w("## Per set");
  w();
  w("| Set | Interviews (triples) | single | union | hybrid | majority | intersection | hybrid − union | Relationships P / R, union → hybrid | Hybrid review load (relationships) |");
  w("|---|---|---:|---:|---:|---:|---:|---:|---|---:|");
  for (const s of r.holdout.sets) {
    const pr = (a) => `${s[a].relationships.precision.toFixed(2)} / ${s[a].relationships.recall.toFixed(2)}`;
    w(`| ${s.set.replace("tests/evals/results/", "")} | ${s.interviews} (${s.triples}) | ${f3(s.singles)} | ${f3(s.union.composite)} | ${f3(s.hybrid.composite)} | `
      + `${f3(s.majority.composite)} | ${f3(s.intersection.composite)} | ${signed(s.hybrid.composite - s.union.composite)} | ${pr("union")} → ${pr("hybrid")} | ${s.hybrid_review_relationships.toFixed(1)} |`);
  }
  w();
  w("A set with five interviews is the average over all ten of its triples; every set has equal weight.");
  w();
  w("## Secondary: the phase-1 interviews (the data that suggested the hybrid)");
  w();
  w("Not an independent test: the idea came from these runs. Shown next to the LLM cascade, which only");
  w("exists here.");
  w();
  w("| Era | merge(1,2), LLM | merge(1,2,3), LLM | union | **hybrid** | majority |");
  w("|---|---:|---:|---:|---:|---:|");
  for (const [era, e] of Object.entries(r.phase1)) {
    const m = e.macro;
    w(`| ${era} | ${f3(m["merge(1,2)"])} | ${f3(m["merge(1,2,3)"])} | ${f3(m.union)} | **${f3(m.hybrid)}** | ${f3(m.majority)} |`);
  }
  w();
  w("Per domain (hybrid − union):");
  w();
  for (const [era, e] of Object.entries(r.phase1)) {
    w(`- ${era}: ` + Object.entries(e.domains).map(([d, v]) => `${d} ${signed(v.hybrid - v.union)}`).join(", ") + ".");
  }
  w();
  w("## Caveats");
  w();
  w("- The hold-out is one domain (itops), older prompts and low-recall interviews: a different regime");
  w("  from the current multi-domain runs.");
  w("- Heuristic scoring only (wording-based); the semantic judge is phase 2 of #174.");
  w("- A fully clean test would use fresh multi-domain interviews (new runs).");
  w("- Relationship precision and recall are both near the floor on the hold-out (old, low-recall interviews");
  w("  against 108 gold relationships), so it tests the relationship vote in a regime where relationships carry");
  w("  little signal.");
  w();
  w("## Deviation from the design");
  w();
  w(`HYBRID-DESIGN.md says \"eleven sets\" and \"at least 9 of the 11\", but its own table lists ${c.sets} sets: the`);
  w("count in the text was wrong. The table is what was run, and the threshold was kept at 9 wins (now out of");
  w(`${c.sets}, which is stricter). The verdict does not depend on it: the hybrid beat union in ${c.hybrid_wins_vs_union} of ${c.sets} sets.`);
  w();
  w("## Reproduce");
  w();
  w("```sh");
  w("node tests/evals/hybrid-holdout.mjs --write");
  w("```");
  return out.join("\n") + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const write = process.argv.includes("--write");
  const files = new Map();
  const r = runAll({ collect: files });
  if (write) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    for (const [file, text] of files) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, text);
    }
    fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(r, null, 2) + "\n");
    fs.writeFileSync(path.join(OUT_DIR, "REPORT.md"), renderReport(JSON.parse(JSON.stringify(r))));
    console.log(`wrote ${files.size} hybrid models, results.json, REPORT.md`);
  }
  const c = r.holdout.criterion;
  console.log("hold-out mean:", JSON.stringify(Object.fromEntries(Object.entries(c.mean).map(([k, v]) => [k, +v.toFixed(3)]))));
  console.log("hybrid wins vs union:", c.hybrid_wins_vs_union, "of", c.sets, "| convincing:", c.convincing);
  for (const [era, e] of Object.entries(r.phase1)) console.log("phase1", era, JSON.stringify(Object.fromEntries(Object.entries(e.macro).map(([k, v]) => [k, +v.toFixed(3)]))));
}
