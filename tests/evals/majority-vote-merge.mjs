// Issue #174, phase 1: majority-vote merge of three interviews vs. the LLM
// cascade, offline on committed runs. No API calls, no new interviews.
// Pre-registered design: ontology_translation/results/majority-vote/DESIGN.md.
//
// Usage: node tests/evals/majority-vote-merge.mjs [--write]
//   --write  writes every built arm's recovered-model.yaml, results.json and
//            REPORT.md under ontology_translation/results/majority-vote/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadGroundTruthModel, resolveDomainYamlPath } from "./lib/groundTruthModel.mjs";
import { computeRecoveryMetrics, computeRuleMetrics, computeActionMetrics } from "./lib/recoveryMetrics.mjs";
import { recoveredStateFromDoc } from "./score-baseline.mjs";
import { buildGroups, buildModel, reviewQueue, restrict, ELEMENT_TYPES } from "./lib/majorityVote.mjs";
import { withPage } from "../lib/page.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const RESULTS = path.join(REPO, "ontology_translation", "results");
export const OUT_DIR = path.join(RESULTS, "majority-vote");

const FOUR = ["brick-hvac", "fibo-loans", "iof-maintenance", "iof-supply-chain"];
export const ERAS = {
  current: {
    label: "current prompt (post #152)",
    runs: (d) => (d === "itops" ? "multi-domain-control-post152" : "multi-domain-post152"),
    cascade: "cascading-merge-post152",
  },
  "pre-152": {
    label: "pre-#152 prompt (replication)",
    runs: (d) => (d === "itops" ? "multi-domain-control" : "multi-domain"),
    cascade: "cascading-merge",
  },
};
export const DOMAINS = [...FOUR, "itops"];
const RUN_IDS = ["run-01", "run-02", "run-03"];
const PAIRS = [[0, 1], [0, 2], [1, 2]];
const pairName = ([a, b]) => `(${a + 1},${b + 1})`;

// Same computations as rescoreRun() (heuristic, full domain), on a document.
export function scoreDoc(doc, domain) {
  const gold = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath(domain) });
  const { state } = recoveredStateFromDoc(doc);
  const h = computeRecoveryMetrics(gold, state);
  const pick = ({ precision, recall, f1, matched, recoveredTotal, groundTruthTotal }) => ({ precision, recall, f1, matched, recoveredTotal, groundTruthTotal });
  return {
    composite: h.recoveryEffectiveness,
    classes: pick(h.classes),
    relationships: pick(h.relationships),
    properties: pick(h.properties),
    rules_f1: computeRuleMetrics(gold, state.rules || []).f1,
    actions_f1: computeActionMetrics(gold, state).identification.f1,
  };
}

export function componentCount(doc) {
  const names = Object.keys(doc.classes || {});
  const parent = new Map(names.map((n) => [n, n]));
  const find = (x) => { while (parent.get(x) !== x) x = parent.get(x); return x; };
  for (const r of doc.relationships || []) {
    if (parent.has(r.from) && parent.has(r.to)) parent.set(find(r.from), find(r.to));
  }
  return new Set(names.map(find)).size;
}

/** Gold-free choice among the three pair unions (DESIGN.md "Best pair"). */
export function chooseBestPair(candidates) {
  return [...candidates].sort((x, y) =>
    x.errors_and_warnings - y.errors_and_warnings || x.components - y.components || x.index - y.index)[0];
}

const loadDoc = (file) => yaml.load(fs.readFileSync(file, "utf8")) || {};
export const dumpDoc = (doc) => yaml.dump(doc, { lineWidth: -1, noRefs: true, sortKeys: false });

function supportProfile(groups) {
  const out = {};
  for (const type of ELEMENT_TYPES) {
    const counts = [0, 0, 0];
    for (const g of groups[type].groups) counts[restrict(g, [0, 1, 2]).support - 1] += 1;
    out[type] = { support_1: counts[0], support_2: counts[1], support_3: counts[2], conflicts: groups[type].conflicts.length };
  }
  return out;
}

export const armSlug = (arm) => arm.replace(/[^a-z0-9]+/gi, "-").replace(/-+$/, "");

export async function runExperiment({ write = false, collect = null } = {}) {
  const results = { design: "ontology_translation/results/majority-vote/DESIGN.md", eras: {} };
  await withPage(async (page) => {
    const findingsOf = (doc) => page.evaluate((m) => window.__kg.consistency.compute(m, {}), doc);
    for (const [era, cfg] of Object.entries(ERAS)) {
      const eraOut = { label: cfg.label, domains: {} };
      for (const domain of DOMAINS) {
        const runDirs = RUN_IDS.map((r) => path.join(RESULTS, cfg.runs(domain), r, domain));
        const docs = runDirs.map((d) => loadDoc(path.join(d, "recovered-model.yaml")));
        const groups = buildGroups(docs);

        const built = {
          union: buildModel(docs, groups, { runs: [0, 1, 2], threshold: 1 }),
          majority: buildModel(docs, groups, { runs: [0, 1, 2], threshold: 2 }),
          intersection: buildModel(docs, groups, { runs: [0, 1, 2], threshold: 3 }),
          "union(1,2)": buildModel(docs, groups, { runs: [0, 1], threshold: 1 }),
        };
        const candidates = [];
        for (const [index, pair] of PAIRS.entries()) {
          const model = index === 0 ? built["union(1,2)"] : buildModel(docs, groups, { runs: pair, threshold: 1 });
          const findings = await findingsOf(model.doc);
          candidates.push({
            index, pair: pairName(pair), model,
            errors_and_warnings: findings.filter((f) => f.severity !== "note").length,
            components: componentCount(model.doc),
            composite: scoreDoc(model.doc, domain).composite,
          });
        }
        const best = chooseBestPair(candidates);
        built["best pair"] = best.model;

        const arms = {};
        RUN_IDS.forEach((r, i) => { arms[r] = scoreDoc(docs[i], domain); });
        for (const stage of ["merge-1-2", "merge-1-2-3"]) {
          arms[stage === "merge-1-2" ? "merge(1,2)" : "merge(1,2,3)"] = scoreDoc(loadDoc(path.join(RESULTS, cfg.cascade, domain, stage, "recovered-model.yaml")), domain);
        }
        for (const [arm, { doc, stats }] of Object.entries(built)) {
          arms[arm] = { ...scoreDoc(doc, domain), name_collisions: stats.collisions };
          const file = path.join(OUT_DIR, era, domain, armSlug(arm), "recovered-model.yaml");
          if (collect) collect.set(file, dumpDoc(doc));
          if (write) {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, dumpDoc(doc));
          }
        }
        eraOut.domains[domain] = {
          arms,
          best_pair: {
            chosen: best.pair,
            // composite is gold-scored for reporting only; the choice never sees it.
            candidates: candidates.map(({ pair, errors_and_warnings, components, composite }) => ({ pair, errors_and_warnings, components, composite })),
          },
          support: supportProfile(groups),
          review_queue_majority: reviewQueue(groups, { runs: [0, 1, 2], threshold: 2 }),
        };
      }
      eraOut.macro = macro(eraOut.domains);
      results.eras[era] = eraOut;
    }
  });
  if (write) {
    fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(results, null, 2) + "\n");
    fs.writeFileSync(path.join(OUT_DIR, "REPORT.md"), renderReport(JSON.parse(JSON.stringify(results))));
  }
  return results;
}

export function macro(domains) {
  const arms = Object.keys(Object.values(domains)[0].arms);
  const out = {};
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  for (const arm of arms) {
    const per = Object.values(domains).map((d) => d.arms[arm]);
    out[arm] = {
      composite: mean(per.map((p) => p.composite)),
      classes_f1: mean(per.map((p) => p.classes.f1)),
      relationships_f1: mean(per.map((p) => p.relationships.f1)),
      properties_f1: mean(per.map((p) => p.properties.f1)),
      rules_f1: mean(per.map((p) => p.rules_f1 ?? 0)),
      actions_f1: mean(per.map((p) => p.actions_f1 ?? 0)),
    };
  }
  return out;
}

// --- Report ---------------------------------------------------------------
// Every number below comes from results.json; tests check the committed
// REPORT.md is exactly what this renders.

const f3 = (x) => (x == null ? "n/a" : x.toFixed(3));
const signed = (x) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(3)}`;
const KEY_ARMS = ["merge(1,2)", "merge(1,2,3)", "union", "majority", "intersection", "union(1,2)", "best pair"];

/** The pre-registered criterion (DESIGN.md "What would count as convincing"). */
export function criterion(results) {
  const eras = Object.entries(results.eras).map(([era, e]) => ({
    era,
    vsCascade3: e.macro.majority.composite - e.macro["merge(1,2,3)"].composite,
    vsMerge2: e.macro.majority.composite - e.macro["merge(1,2)"].composite,
  }));
  const beatsCascadeEverywhere = eras.every((e) => e.vsCascade3 > 0);
  const levelWithMerge2Somewhere = eras.some((e) => e.vsMerge2 >= -0.005);
  return { eras, beatsCascadeEverywhere, levelWithMerge2Somewhere, convincing: beatsCascadeEverywhere && levelWithMerge2Somewhere };
}

/** What the vote throws away (union minus majority), pooled over domains. */
export function droppedByVote(era) {
  const out = {};
  for (const dim of ["classes", "relationships", "properties"]) {
    let dropped = 0;
    let correct = 0;
    for (const d of Object.values(era.domains)) {
      dropped += d.arms.union[dim].recoveredTotal - d.arms.majority[dim].recoveredTotal;
      correct += d.arms.union[dim].matched - d.arms.majority[dim].matched;
    }
    out[dim] = { dropped, correct, share_correct: dropped ? correct / dropped : null };
  }
  return out;
}

export function renderReport(results) {
  const out = [];
  const w = (s = "") => out.push(s);
  const crit = criterion(results);
  const eraNames = Object.keys(results.eras);
  w("# Majority-vote merge of three interviews vs. the LLM cascade (issue #174, phase 1)");
  w();
  w("Generated by `tests/evals/majority-vote-merge.mjs` from `results.json`. Design pre-registered in");
  w("[`DESIGN.md`](DESIGN.md), committed before any result. Offline: committed interviews only, no API calls.");
  w();
  w(`**Verdict: ${crit.convincing ? "convincing" : "not convincing"}** by the pre-registered criterion (majority beats the`);
  w("three-way cascade in both eras, and is level with the two-way merge in at least one).");
  w();
  w("## Primary outcome: 5-domain macro composite");
  w();
  w("| Era | majority | merge(1,2,3) | majority − merge(1,2,3) | merge(1,2) | majority − merge(1,2) |");
  w("|---|---:|---:|---:|---:|---:|");
  for (const e of crit.eras) {
    const m = results.eras[e.era].macro;
    w(`| ${results.eras[e.era].label} | ${f3(m.majority.composite)} | ${f3(m["merge(1,2,3)"].composite)} | ${signed(e.vsCascade3)} | ${f3(m["merge(1,2)"].composite)} | ${signed(e.vsMerge2)} |`);
  }
  w();
  w(`- Beats the three-way cascade in both eras: **${crit.beatsCascadeEverywhere ? "yes" : "no"}**.`);
  w(`- Level with the two-way merge (within 0.005) in at least one era: **${crit.levelWithMerge2Somewhere ? "yes" : "no"}**.`);
  w();
  w("## Why: what the vote throws away");
  w();
  w("Elements the vote drops (in the union of three, not in the majority), pooled over the five domains,");
  w("and how many of them matched gold. Approximate: gold matching is one-to-one, so a dropped element's");
  w("match can move to another element.");
  w();
  w("| Era | Classes dropped (correct) | Relationships dropped (correct) | Properties dropped (correct) |");
  w("|---|---|---|---|");
  for (const era of eraNames) {
    const d = droppedByVote(results.eras[era]);
    const cell = (x) => `${x.dropped} (${x.correct}, ${x.share_correct == null ? "n/a" : Math.round(100 * x.share_correct) + "%"})`;
    w(`| ${era} | ${cell(d.classes)} | ${cell(d.relationships)} | ${cell(d.properties)} |`);
  }
  w();
  w("Interviews are recall-limited: a class only one interview found is usually real, so voting discards");
  w("correct classes and the composite falls. Relationships are the opposite: most single-interview");
  w("relationships are wrong, and voting raises their precision. The vote helps where noise is the");
  w("problem and hurts where incompleteness is.");
  w();
  w("**Not tested here, a hypothesis only:** a hybrid that takes the union of classes and votes on");
  w("relationships. It was suggested by these results, so testing it on the same runs would be circular;");
  w("it needs its own pre-registration.");
  w();
  w("## All arms, 5-domain macro");
  w();
  for (const era of eraNames) {
    const m = results.eras[era].macro;
    w(`### ${results.eras[era].label}`);
    w();
    w("| Arm | Composite | Classes F1 | Relationships F1 | Properties F1 | Rules F1 | Actions F1 |");
    w("|---|---:|---:|---:|---:|---:|---:|");
    for (const [arm, v] of Object.entries(m)) {
      w(`| ${arm} | ${f3(v.composite)} | ${f3(v.classes_f1)} | ${f3(v.relationships_f1)} | ${f3(v.properties_f1)} | ${f3(v.rules_f1)} | ${f3(v.actions_f1)} |`);
    }
    w();
    w("Precision / recall, macro over domains:");
    w();
    w("| Arm | Classes P / R | Relationships P / R | Properties P / R |");
    w("|---|---|---|---|");
    const doms = Object.values(results.eras[era].domains);
    const pr = (arm, dim) => {
      const p = doms.reduce((a, d) => a + d.arms[arm][dim].precision, 0) / doms.length;
      const r = doms.reduce((a, d) => a + d.arms[arm][dim].recall, 0) / doms.length;
      return `${p.toFixed(2)} / ${r.toFixed(2)}`;
    };
    for (const arm of KEY_ARMS) w(`| ${arm} | ${pr(arm, "classes")} | ${pr(arm, "relationships")} | ${pr(arm, "properties")} |`);
    w();
  }
  w("## Per domain: composite");
  w();
  for (const era of eraNames) {
    const e = results.eras[era];
    const arms = Object.keys(e.macro);
    w(`### ${e.label}`);
    w();
    w("| Domain | " + arms.join(" | ") + " |");
    w("|---|" + arms.map(() => "---:").join("|") + "|");
    for (const [d, v] of Object.entries(e.domains)) w(`| ${d} | ` + arms.map((a) => f3(v.arms[a].composite)).join(" | ") + " |");
    w(`| **macro** | ` + arms.map((a) => `**${f3(e.macro[a].composite)}**`).join(" | ") + " |");
    w();
  }
  w("## Secondary comparisons");
  w();
  w("| Era | union(1,2) − merge(1,2) | union − merge(1,2,3) | best pair − merge(1,2) |");
  w("|---|---:|---:|---:|");
  for (const era of eraNames) {
    const m = results.eras[era].macro;
    w(`| ${era} | ${signed(m["union(1,2)"].composite - m["merge(1,2)"].composite)} | ${signed(m.union.composite - m["merge(1,2,3)"].composite)} | ${signed(m["best pair"].composite - m["merge(1,2)"].composite)} |`);
  }
  w();
  const macros = eraNames.map((era) => results.eras[era].macro);
  const llmAddsLittle = macros.every((m) => Math.abs(m["union(1,2)"].composite - m["merge(1,2)"].composite) < 0.01);
  const unionBeatsCascade3 = macros.every((m) => m.union.composite > m["merge(1,2,3)"].composite);
  // A random pick among the three pair unions is the baseline a selector has to beat.
  const randomPair = (era) => {
    const doms = Object.values(results.eras[era].domains);
    return doms.reduce((a, d) => a + d.best_pair.candidates.reduce((x, c) => x + c.composite, 0) / d.best_pair.candidates.length, 0) / doms.length;
  };
  const bestPairVsRandom = eraNames.map((era) => results.eras[era].macro["best pair"].composite - randomPair(era));
  w("- **union(1,2) vs. merge(1,2)** is the pre-registered control for \"deterministic vs. LLM");
  w("  reconciliation\" on the same two interviews. " + (llmAddsLittle
    ? "On this heuristic score the LLM merge adds nothing measurable (under 0.01 in every era) over a plain union."
    : "The two differ by 0.01 or more in at least one era."));
  w("  The scorer matches wording, and the union keeps the interviews' wording while the LLM merge rephrases,");
  w("  so this needs the semantic judge (phase 2) before it is believed.");
  w("- **union vs. merge(1,2,3):** " + (unionBeatsCascade3
    ? "a plain union of all three beats the LLM three-way cascade in every era, so the cascade's third step loses more than the noise of a three-way union explains."
    : "a plain union of all three does not beat the LLM three-way cascade in every era."));
  w("- **Best pair chosen without gold** (fewest consistency errors and warnings), against a random pick");
  w("  among the three pair unions (their average): " + eraNames.map((era, i) => `${era} ${signed(bestPairVsRandom[i])}`).join(", ") + ". "
    + (bestPairVsRandom.every((d) => d <= 0.005)
      ? "The deterministic checker does not pick better pairs than chance here."
      : "The checker picks better than chance in at least one era.") + " Choices per domain:");
  for (const era of eraNames) {
    w(`  ${era}: ` + Object.entries(results.eras[era].domains).map(([d, v]) => `${d} ${v.best_pair.chosen}`).join(", ") + ".");
  }
  w();
  w("## Exploratory, not pre-registered: how much of \"merging two helps\" is the choice of pair");
  w();
  w("The cascade only ever merged runs 1 and 2. Run numbering is arbitrary, so the deterministic unions of");
  w("all three pairs (scored for the best-pair baseline above) show what merging two interviews gives on");
  w("average.");
  w();
  w("| Era | union(1,2) | union(1,3) | union(2,3) | average pair | union of all 3 | single-run mean | merge(1,2), LLM |");
  w("|---|---:|---:|---:|---:|---:|---:|---:|");
  const exploratory = {};
  for (const era of eraNames) {
    const e = results.eras[era];
    const doms = Object.values(e.domains);
    const pair = (p) => doms.reduce((a, d) => a + d.best_pair.candidates.find((c) => c.pair === p).composite, 0) / doms.length;
    const pairs = ["(1,2)", "(1,3)", "(2,3)"].map(pair);
    const avgPair = pairs.reduce((a, b) => a + b, 0) / 3;
    const singles = ["run-01", "run-02", "run-03"].reduce((a, r) => a + e.macro[r].composite, 0) / 3;
    exploratory[era] = { avgPair, singles, union3: e.macro.union.composite, merge2: e.macro["merge(1,2)"].composite, pairs };
    w(`| ${era} | ${pairs.map(f3).join(" | ")} | ${f3(avgPair)} | ${f3(e.macro.union.composite)} | ${f3(singles)} | ${f3(e.macro["merge(1,2)"].composite)} |`);
  }
  w();
  for (const era of eraNames) {
    const x = exploratory[era];
    w(`- ${era}: merging two interviews gains ${signed(x.avgPair - x.singles)} over a single interview on average `
      + `(${signed(x.merge2 - x.singles)} for the pair the cascade used); the union of all three gains ${signed(x.union3 - x.singles)}.`);
  }
  w();
  const xs = Object.values(exploratory);
  const unionsBeatSingle = xs.every((x) => x.pairs.every((p) => p > x.singles) && x.union3 > x.singles);
  const union3AtLeastPair = xs.every((x) => x.union3 >= x.avgPair - 0.005);
  w("Reading: " + (unionsBeatSingle
    ? "every pair union and the union of all three beat a single interview on average"
    : "not every union beats a single interview on average")
    + ", but the published two-way figure depends on which pair was labelled (1,2). "
    + (union3AtLeastPair
      ? "The union of all three is about as good as an average pair or better (within 0.005 or above, in every era), and needs no choice of pair."
      : "The union of all three falls below an average pair in at least one era."));
  w("The LLM merge was only run on pair (1,2), so the other pairs use the deterministic union, which matched");
  w("the LLM merge on that pair.");
  w();
  w("## Review load of the majority vote");
  w();
  w("Elements below the threshold (found by one interview) plus conflicts: what a person would review.");
  w();
  w("| Domain | " + eraNames.join(" | ") + " |");
  w("|---|" + eraNames.map(() => "---:").join("|") + "|");
  for (const d of Object.keys(results.eras[eraNames[0]].domains)) {
    w(`| ${d} | ` + eraNames.map((era) => results.eras[era].domains[d].review_queue_majority.total).join(" | ") + " |");
  }
  w();
  w("## Caveats");
  w();
  w("- n = 3 runs per domain and one fixed run labelling; per-domain differences are single data points.");
  w("- Heuristic scoring only, the same basis as the cascade baselines; see phase 2 of #174.");
  w("- The vote is deterministic and the cascade is an LLM merge; union(1,2) vs. merge(1,2) is the control.");
  w("- No deviations from DESIGN.md.");
  w();
  w("## Reproduce");
  w();
  w("```sh");
  w("node tests/evals/majority-vote-merge.mjs --write");
  w("```");
  return out.join("\n") + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const results = await runExperiment({ write: process.argv.includes("--write") });
  for (const [era, e] of Object.entries(results.eras)) {
    console.log(`\n${era}: 5-domain macro composite`);
    for (const [arm, m] of Object.entries(e.macro)) console.log(`  ${arm.padEnd(14)} ${m.composite.toFixed(3)}`);
  }
}
