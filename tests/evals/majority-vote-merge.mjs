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

export async function runExperiment({ write = false } = {}) {
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
          if (write) {
            const dir = path.join(OUT_DIR, era, domain, arm.replace(/[(),]/g, (c) => ({ "(": "-", ")": "", ",": "-" })[c]));
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, "recovered-model.yaml"), dumpDoc(doc));
          }
        }
        eraOut.domains[domain] = {
          arms,
          best_pair: {
            chosen: best.pair,
            candidates: candidates.map(({ pair, errors_and_warnings, components }) => ({ pair, errors_and_warnings, components })),
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

if (import.meta.url === `file://${process.argv[1]}`) {
  const results = await runExperiment({ write: process.argv.includes("--write") });
  for (const [era, e] of Object.entries(results.eras)) {
    console.log(`\n${era}: 5-domain macro composite`);
    for (const [arm, m] of Object.entries(e.macro)) console.log(`  ${arm.padEnd(14)} ${m.composite.toFixed(3)}`);
  }
}
