// Issue #155, step 1 of the deferred-with-gate decision: do real interview
// outputs leave subtypes unlinked from their parent, and which kind of
// subtype (kind / value / state / role / individual, per the reviewer
// classification of the reference-model audit)?
//
// Offline and deterministic. For every current-prompt recovered model
// (results/multi-domain-post152 plus results/multi-domain-control-post152's
// itops runs) it re-runs the project's own heuristic class matcher against
// the run's reference model, checks that this reproduces the run's
// committed heuristic-matches.json, and then, for every candidate pair in
// ontology_translation/results/subclass-audit/audit.json, records whether
// the interview recovered the subtype and its parent and whether they are
// linked. It also tries the cheap consistency-check hint #155 proposes (a
// class whose name ends with another class's name, not linked to it) on
// each recovered model.
//
// Usage: node tests/evals/subtype-connectivity.mjs [--write]
//   --write  writes ontology_translation/results/subclass-audit/recovered-connectivity.json

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadGroundTruthModel, resolveDomainYamlPath } from "./lib/groundTruthModel.mjs";
import { computeHeuristicMatchPairs } from "./lib/recoveryMetrics.mjs";
import { recoveredStateFromYaml } from "./score-baseline.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const RESULTS = path.join(REPO, "ontology_translation", "results");
export const AUDIT_DIR = path.join(RESULTS, "subclass-audit");
export const OUTPUT_PATH = path.join(AUDIT_DIR, "recovered-connectivity.json");

const FOUR = ["brick-hvac", "fibo-loans", "iof-maintenance", "iof-supply-chain"];
// The corpus run with the current interviewer prompt (post epic #152); the
// gate recorded on #155 is evaluated on this one.
export const CORPUS = [
  { dir: "multi-domain-post152", domains: FOUR },
  { dir: "multi-domain-control-post152", domains: ["itops"] },
];
// The same benchmark under the pre-#152 prompt, which produced the islands
// that motivated #155: reported for comparison only.
export const COMPARISON_CORPUS = [
  { dir: "multi-domain", domains: FOUR },
  { dir: "multi-domain-control", domains: ["itops"] },
];

const STATUSES = ["linked", "connected", "not connected", "parent not recovered", "subtype not recovered", "neither recovered"];

export function words(label) {
  return String(label || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Connected components over the recovered edges, as nodeId -> root. */
export function componentsOf(nodes, edges) {
  const parent = new Map(nodes.map((n) => [n.id, n.id]));
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)));
      x = parent.get(x);
    }
    return x;
  };
  for (const e of edges) {
    if (parent.has(e.source) && parent.has(e.target)) parent.set(find(e.source), find(e.target));
  }
  return new Map(nodes.map((n) => [n.id, find(n.id)]));
}

/**
 * Words that tell the subtype apart from its parent ("secured" for
 * SecuredLoan/Loan). When the subtype was not recovered as a class, a
 * property of the recovered parent that carries those words, as an allowed
 * value (stateCategory = degraded) or in its own name (isSecured), means
 * the interview folded it into the parent instead.
 */
export function foldedIntoParentValue(subLabel, superLabel, parentNode) {
  const parentWords = new Set(words(superLabel));
  const distinguishing = words(subLabel).filter((w) => !parentWords.has(w));
  if (!distinguishing.length || !parentNode) return null;
  const carries = (text) => {
    const w = new Set(words(text));
    return distinguishing.every((d) => w.has(d));
  };
  for (const prop of parentNode.properties || []) {
    for (const value of prop.allowed || []) {
      if (carries(value)) return `${prop.name} = ${value}`;
    }
  }
  for (const prop of parentNode.properties || []) {
    if (carries(prop.name)) return `${prop.name} (${prop.type || "property"})`;
  }
  return null;
}

export function pairStatus({ subNode, superNode, edges, component }) {
  if (!subNode && !superNode) return "neither recovered";
  if (!superNode) return "parent not recovered";
  if (!subNode) return "subtype not recovered";
  const linked = edges.some((e) => (e.source === subNode.id && e.target === superNode.id) || (e.source === superNode.id && e.target === subNode.id));
  if (linked) return "linked";
  return component.get(subNode.id) === component.get(superNode.id) ? "connected" : "not connected";
}

/**
 * The cheap hint: class A's name ends with class B's whole name
 * (SecuredLoan / Loan), and no chain of relationships links them.
 */
export function nameHintHits(nodes, component) {
  const hits = [];
  for (const a of nodes) {
    const aw = words(a.label);
    for (const b of nodes) {
      if (a.id === b.id) continue;
      const bw = words(b.label);
      if (bw.length >= aw.length) continue;
      const tail = aw.slice(aw.length - bw.length);
      if (tail.join(" ") !== bw.join(" ")) continue;
      hits.push({ subtype: a.label, parent: b.label, linked: component.get(a.id) === component.get(b.id) });
    }
  }
  return hits.sort((x, y) => (x.subtype + x.parent).localeCompare(y.subtype + y.parent));
}

export function analyzeRun({ domain, runDir, auditPairs, categoryOf }) {
  const recovered = recoveredStateFromYaml(fs.readFileSync(path.join(runDir, "recovered-model.yaml"), "utf8")).state;
  const groundTruth = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath(domain) });
  const pairs = computeHeuristicMatchPairs(groundTruth, recovered);

  // Reproducibility check: the same gold classes must match as in the run's
  // own committed heuristic-matches.json (node ids differ: the live run used
  // canvas ids, this uses export order, so compare gold ids only).
  const committed = JSON.parse(fs.readFileSync(path.join(runDir, "heuristic-matches.json"), "utf8"));
  const goldNow = pairs.classes.map((m) => m.goldId).sort();
  const goldThen = committed.classes.map((m) => m.goldId).sort();
  const reproduces = JSON.stringify(goldNow) === JSON.stringify(goldThen);

  const nodeById = new Map(recovered.nodes.map((n) => [n.id, n]));
  const goldToNode = new Map(pairs.classes.map((m) => [m.goldId, nodeById.get(m.recoveredId)]));
  const component = componentsOf(recovered.nodes, recovered.edges);

  const results = auditPairs.map(({ subclass, superclass }) => {
    const subNode = goldToNode.get(subclass);
    const superNode = goldToNode.get(superclass);
    const status = pairStatus({ subNode, superNode, edges: recovered.edges, component });
    const entry = { subclass, superclass, category: categoryOf(subclass, superclass), status };
    if (subNode) entry.recovered_subtype = subNode.label;
    if (superNode) entry.recovered_parent = superNode.label;
    if (status === "subtype not recovered") {
      const folded = foldedIntoParentValue(subclass, superclass, superNode);
      if (folded) entry.folded_as = folded;
    }
    return entry;
  });

  return {
    domain,
    run: path.basename(path.dirname(runDir)),
    corpus: path.basename(path.dirname(path.dirname(runDir))),
    recovered_classes: recovered.nodes.length,
    recovered_relationships: recovered.edges.length,
    components: new Set(component.values()).size,
    matcher_reproduces_committed_matches: reproduces,
    pairs: results,
    name_hint_hits: nameHintHits(recovered.nodes, component),
  };
}

export function summarize(runs) {
  const byCategory = {};
  const byDomain = {};
  for (const run of runs) {
    const d = (byDomain[run.domain] ||= { runs: 0, runs_with_unlinked_kind: 0, unlinked_kind_pairs: 0, name_hint_unlinked: 0, name_hint_linked: 0 });
    d.runs += 1;
    const unlinkedKinds = run.pairs.filter((p) => p.category === "kind" && p.status === "not connected").length;
    d.unlinked_kind_pairs += unlinkedKinds;
    if (unlinkedKinds > 0) d.runs_with_unlinked_kind += 1;
    d.name_hint_unlinked += run.name_hint_hits.filter((h) => !h.linked).length;
    d.name_hint_linked += run.name_hint_hits.filter((h) => h.linked).length;
    for (const p of run.pairs) {
      const c = (byCategory[p.category] ||= Object.fromEntries([...STATUSES, "folded into a parent value"].map((s) => [s, 0])));
      c[p.status] += 1;
      if (p.folded_as) c["folded into a parent value"] += 1;
    }
  }
  // The gate recorded on #155: at least one run per domain with an
  // unlinked kind, in two or more domains.
  const domainsMeetingGate = Object.entries(byDomain).filter(([, d]) => d.runs_with_unlinked_kind >= 1).map(([k]) => k).sort();
  return { by_category: byCategory, by_domain: byDomain, domains_with_an_unlinked_kind: domainsMeetingGate, gate_met: domainsMeetingGate.length >= 2 };
}

export function analyzeCorpus(corpus = CORPUS) {
  const audit = JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "audit.json"), "utf8"));
  const classification = yaml.load(fs.readFileSync(path.join(AUDIT_DIR, "classification.yaml"), "utf8"));
  const runs = [];
  for (const { dir, domains } of corpus) {
    const runIds = fs.readdirSync(path.join(RESULTS, dir)).filter((n) => /^run-\d+$/.test(n)).sort();
    for (const domain of domains) {
      const auditPairs = audit.domains.find((d) => d.domain === domain).candidates;
      const categories = new Map(classification.pairs[domain].map((p) => [`${p.sub}|${p.super}`, p.category]));
      for (const run of runIds) {
        const runDir = path.join(RESULTS, dir, run, domain);
        if (!fs.existsSync(path.join(runDir, "recovered-model.yaml"))) continue;
        runs.push(analyzeRun({ domain, runDir, auditPairs, categoryOf: (s, p) => categories.get(`${s}|${p}`) }));
      }
    }
  }
  return {
    corpus: corpus.map((c) => `ontology_translation/results/${c.dir}`),
    statuses: STATUSES,
    summary: summarize(runs),
    runs,
  };
}

export function analyzeAll() {
  return { current_prompt: analyzeCorpus(CORPUS), pre_152_prompt: analyzeCorpus(COMPARISON_CORPUS) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const all = analyzeAll();
  const result = all.current_prompt;
  const text = JSON.stringify(all, null, 2) + "\n";
  if (process.argv.includes("--write")) {
    fs.writeFileSync(OUTPUT_PATH, text);
    console.log(`wrote ${path.relative(REPO, OUTPUT_PATH)}`);
  }
  const s = result.summary;
  console.log(`runs: ${result.runs.length}; matcher reproduces committed matches in ${result.runs.filter((r) => r.matcher_reproduces_committed_matches).length}`);
  for (const [cat, counts] of Object.entries(s.by_category)) console.log(cat.padEnd(11), JSON.stringify(counts));
  for (const [dom, d] of Object.entries(s.by_domain)) console.log(dom.padEnd(17), JSON.stringify(d));
  console.log("gate met:", s.gate_met, s.domains_with_an_unlinked_kind);
}
