import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGroups, buildModel, groupElements, reviewQueue, restrict, runOf } from "./evals/lib/majorityVote.mjs";
import { chooseBestPair, componentCount } from "./evals/majority-vote-merge.mjs";

// Issue #174: the majority-vote merge's grouping and voting, on a small
// three-run fixture where the right answer is known.

const props = (...names) => Object.fromEntries(names.map((n) => [n, { type: "date" }]));
const RUNS = () => [
  {
    competency_questions: [{ id: "cq1", text: "Which borrower owes a loan?" }],
    classes: { Loan: { meaning: "A loan.", properties: props("maturityDate") }, Borrower: { properties: {} }, Collateral: { properties: {} } },
    relationships: [
      { name: "hasBorrower", from: "Loan", to: "Borrower" },
      { name: "securedBy", from: "Loan", to: "Collateral" },
    ],
    rules: { loanNeedsBorrower: { conditions: ["A loan must have a borrower recorded before approval."] } },
    actions: {
      approveLoan: { input: "Loan", preconditions: ["loanNeedsBorrower"], effect: "The loan is approved.", verification: "Check status." },
      releaseCollateral: { input: "Collateral", preconditions: [], effect: "Collateral released.", verification: "Check." },
    },
  },
  {
    classes: { Loan: { properties: props("maturityDate") }, Borrower: { properties: {} } },
    relationships: [{ name: "hasBorrower", from: "Loan", to: "Borrower" }],
    rules: { loanNeedsBorrower: { conditions: ["A loan must have a borrower recorded before approval."] } },
    actions: {
      approveLoan: { input: "Loan", preconditions: ["loanNeedsBorrower"], effect: "Approved.", verification: "Check." },
      releaseCollateral: { input: "Loan", preconditions: [], effect: "Released.", verification: "Check." },
    },
  },
  {
    classes: { Loan: { properties: {} }, Borrower: { properties: {} }, Guarantor: { properties: {} } },
    relationships: [
      { name: "hasBorrower", from: "Loan", to: "Borrower" },
      { name: "borrows", from: "Borrower", to: "Loan" }, // reciprocal of hasBorrower: one unit
    ],
    rules: {},
    actions: { approveLoan: { input: "Loan", preconditions: [], effect: "Approved.", verification: "Check." } },
  },
];

const supportOf = (groups, type, key) => restrict(groups[type].groups.find((g) => g.includes(key)), [0, 1, 2]).support;

test("groups the same element across runs and counts its support", () => {
  const groups = buildGroups(RUNS());
  assert.equal(supportOf(groups, "classes", "c|0|Loan"), 3);
  assert.equal(supportOf(groups, "classes", "c|0|Borrower"), 3);
  assert.equal(supportOf(groups, "classes", "c|0|Collateral"), 1);
  assert.equal(supportOf(groups, "classes", "c|2|Guarantor"), 1);
  assert.equal(supportOf(groups, "properties", "p|0|Loan|maturityDate"), 2);
  assert.equal(supportOf(groups, "rules", "u|0|loanNeedsBorrower"), 2);
  assert.equal(supportOf(groups, "actions", "a|0|approveLoan"), 3);
});

test("a reciprocal pair within one run is one relationship element, and is emitted whole", () => {
  const groups = buildGroups(RUNS());
  const unitsOfRun2 = Object.values(groups.units[2]);
  assert.deepEqual(unitsOfRun2, [[0, 1]], "hasBorrower and borrows form one unit");
  assert.equal(supportOf(groups, "relationships", "r|0|rel_0"), 3);
  const onlyRun2 = buildModel(RUNS(), groups, { runs: [2], threshold: 1 }).doc;
  assert.deepEqual(onlyRun2.relationships.map((r) => r.name).sort(), ["borrows", "hasBorrower"]);
});

test("thresholds: union keeps everything, majority keeps support >= 2, intersection keeps support 3", () => {
  const docs = RUNS();
  const groups = buildGroups(docs);
  const model = (threshold) => buildModel(docs, groups, { runs: [0, 1, 2], threshold }).doc;
  assert.deepEqual(Object.keys(model(1).classes).sort(), ["Borrower", "Collateral", "Guarantor", "Loan"]);
  assert.deepEqual(Object.keys(model(2).classes).sort(), ["Borrower", "Loan"]);
  assert.deepEqual(Object.keys(model(3).classes).sort(), ["Borrower", "Loan"]);
  assert.deepEqual(Object.keys(model(2).classes.Loan.properties), ["maturityDate"]);
  assert.deepEqual(Object.keys(model(3).classes.Loan.properties), [], "maturityDate is in 2 runs only");
  assert.deepEqual(Object.keys(model(2).rules), ["loanNeedsBorrower"]);
  assert.deepEqual(Object.keys(model(3).rules), []);
});

test("a relationship needs both endpoint classes kept; the representative comes from the lowest run", () => {
  const docs = RUNS();
  const groups = buildGroups(docs);
  const union = buildModel(docs, groups, { runs: [0, 1, 2], threshold: 1 }).doc;
  assert.ok(union.relationships.some((r) => r.name === "securedBy"));
  const majority = buildModel(docs, groups, { runs: [0, 1, 2], threshold: 2 }).doc;
  assert.deepEqual(majority.relationships.map((r) => `${r.from} ${r.name} ${r.to}`), ["Loan hasBorrower Borrower"]);
  assert.equal(majority.classes.Loan.meaning, "A loan.", "run 1's body, unchanged");
  assert.deepEqual(majority.competency_questions, docs[0].competency_questions);
});

test("an action needs its (representative's) input class kept; preconditions are remapped to kept rules", () => {
  const docs = RUNS();
  const groups = buildGroups(docs);
  const majority = buildModel(docs, groups, { runs: [0, 1, 2], threshold: 2 }).doc;
  // releaseCollateral is in two runs, but its representative (run 1) takes
  // Collateral, which only run 1 has: dropped.
  assert.deepEqual(Object.keys(majority.actions), ["approveLoan"]);
  assert.deepEqual(majority.actions.approveLoan.preconditions, ["loanNeedsBorrower"]);
  const intersection = buildModel(docs, groups, { runs: [0, 1, 2], threshold: 3 }).doc;
  assert.deepEqual(intersection.actions.approveLoan.preconditions, [], "the rule did not survive, so the reference goes");
});

test("restricting to a pair votes among those two runs only", () => {
  const docs = RUNS();
  const groups = buildGroups(docs);
  const pair = buildModel(docs, groups, { runs: [0, 1], threshold: 1 }).doc;
  assert.deepEqual(Object.keys(pair.classes).sort(), ["Borrower", "Collateral", "Loan"]);
  assert.equal(pair.actions.releaseCollateral.input, "Collateral");
});

test("groupElements: strongest first, and never two elements of one run in a group (the conflict rule)", () => {
  const elements = ["c|0|A", "c|0|A2", "c|1|B", "c|2|C"];
  const edges = [
    { a: "c|0|A", b: "c|1|B", weight: 0.9, pair: 0 },
    { a: "c|0|A2", b: "c|1|B", weight: 0.8, pair: 0 }, // would join A and A2 (both run 0)
    { a: "c|1|B", b: "c|2|C", weight: 0.7, pair: 2 },
  ];
  const { groups, conflicts } = groupElements(elements, edges);
  assert.deepEqual(groups, [["c|0|A", "c|1|B", "c|2|C"], ["c|0|A2"]]);
  assert.deepEqual(conflicts.map((e) => e.a), ["c|0|A2"]);
  // Order of the input does not matter.
  assert.deepEqual(groupElements(elements, [...edges].reverse()).groups, groups);
  assert.equal(runOf("p|2|Loan|x"), 2);
});

test("reviewQueue counts what falls below the threshold, per type, plus conflicts", () => {
  const groups = buildGroups(RUNS());
  const q = reviewQueue(groups, { runs: [0, 1, 2], threshold: 2 });
  assert.equal(q.classes.below_threshold, 2); // Collateral, Guarantor
  assert.equal(q.relationships.below_threshold, 1); // securedBy
  assert.equal(q.total, Object.values(q).filter((v) => typeof v === "object").reduce((n, t) => n + t.below_threshold + t.conflicts, 0));
});

test("best pair without gold: fewest errors and warnings, then fewest components, then lowest pair", () => {
  const c = (index, errors_and_warnings, components) => ({ index, pair: `p${index}`, errors_and_warnings, components });
  assert.equal(chooseBestPair([c(0, 3, 1), c(1, 1, 5), c(2, 2, 1)]).index, 1);
  assert.equal(chooseBestPair([c(0, 1, 4), c(1, 1, 2), c(2, 1, 2)]).index, 1);
  assert.equal(componentCount({ classes: { A: {}, B: {}, C: {} }, relationships: [{ from: "A", to: "B" }] }), 2);
});

// --- The committed experiment is current -----------------------------------

import fs from "node:fs";
import path from "node:path";
import { runExperiment, renderReport, OUT_DIR } from "./evals/majority-vote-merge.mjs";

test("the committed results, every built arm's model and REPORT.md are exactly what a fresh run produces", async () => {
  const files = new Map();
  const fresh = JSON.parse(JSON.stringify(await runExperiment({ collect: files })));
  const committed = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "results.json"), "utf8"));
  assert.deepEqual(fresh, committed);
  assert.equal(files.size, 2 * 5 * 5, "two eras, five domains, five built arms");
  for (const [file, text] of files) assert.equal(fs.readFileSync(file, "utf8"), text, file);
  assert.equal(fs.readFileSync(path.join(OUT_DIR, "REPORT.md"), "utf8"), renderReport(committed));
});

test("the cascade baselines and single runs reproduce their own committed scores", () => {
  // The comparison is only fair if the arms are scored exactly as the
  // committed runs and merges were.
  const results = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "results.json"), "utf8"));
  const RES = path.join(OUT_DIR, "..");
  const dirs = {
    current: { runs: (d) => (d === "itops" ? "multi-domain-control-post152" : "multi-domain-post152"), cascade: "cascading-merge-post152" },
    "pre-152": { runs: (d) => (d === "itops" ? "multi-domain-control" : "multi-domain"), cascade: "cascading-merge" },
  };
  for (const [era, e] of Object.entries(results.eras)) {
    for (const [domain, d] of Object.entries(e.domains)) {
      const metrics = (dir) => JSON.parse(fs.readFileSync(path.join(RES, dir, "metrics.json"), "utf8")).metrics.recoveryEffectiveness;
      for (const run of ["run-01", "run-02", "run-03"]) {
        assert.equal(d.arms[run].composite, metrics(path.join(dirs[era].runs(domain), run, domain)), `${era} ${domain} ${run}`);
      }
      assert.equal(d.arms["merge(1,2)"].composite, metrics(path.join(dirs[era].cascade, domain, "merge-1-2")), `${era} ${domain} merge(1,2)`);
      assert.equal(d.arms["merge(1,2,3)"].composite, metrics(path.join(dirs[era].cascade, domain, "merge-1-2-3")), `${era} ${domain} merge(1,2,3)`);
    }
  }
});

test("per-type thresholds: the hybrid keeps every class but votes on relationships", () => {
  const docs = RUNS();
  const groups = buildGroups(docs);
  const hybrid = buildModel(docs, groups, { runs: [0, 1, 2], threshold: 1, thresholds: { relationships: 2 } }).doc;
  assert.deepEqual(Object.keys(hybrid.classes).sort(), ["Borrower", "Collateral", "Guarantor", "Loan"], "all classes, as union");
  assert.deepEqual(hybrid.relationships.map((r) => r.name), ["hasBorrower"], "securedBy was found by one run only");
  assert.deepEqual(Object.keys(hybrid.actions).sort(), ["approveLoan", "releaseCollateral"], "actions as union");
  const q = reviewQueue(groups, { runs: [0, 1, 2], threshold: 1, thresholds: { relationships: 2 } });
  assert.equal(q.relationships.below_threshold, 1);
  assert.equal(q.classes.below_threshold, 0);
});

// --- Hybrid on the hold-out (HYBRID-DESIGN.md) ------------------------------

import { triples, setRuns, holdoutCriterion, runAll, renderReport as renderHybridReport, OUT_DIR as HYBRID_DIR, HOLDOUT_SETS } from "./evals/hybrid-holdout.mjs";

test("hold-out helpers: triples of a set, invalid runs excluded, the pre-registered criterion", () => {
  assert.deepEqual(triples(["a", "b", "c"]), [["a", "b", "c"]]);
  assert.equal(triples(["1", "2", "3", "4", "5"]).length, 10);
  assert.ok(!setRuns("tests/evals/results/baselines/b2-generic-interviewer").some((r) => /INVALID/.test(r)));
  assert.equal(HOLDOUT_SETS.length, 10, "the sets the design's table lists");
  const set = (u, h, m) => ({ singles: 0, union: { composite: u }, hybrid: { composite: h }, majority: { composite: m }, intersection: { composite: 0 } });
  const all = (h) => Array.from({ length: 10 }, () => set(0.3, h, 0.2));
  assert.equal(holdoutCriterion(all(0.31)).convincing, true);
  assert.equal(holdoutCriterion(all(0.29)).convincing, false);
  const eightWins = [...Array.from({ length: 8 }, () => set(0.3, 0.4, 0.2)), set(0.3, 0.2, 0.2), set(0.3, 0.2, 0.2)];
  assert.equal(holdoutCriterion(eightWins).wins_at_least_9_of_11, false, "8 wins is not enough");
});

test("the committed hybrid results, models and report are exactly what a fresh run produces", () => {
  const files = new Map();
  const fresh = JSON.parse(JSON.stringify(runAll({ collect: files })));
  const committed = JSON.parse(fs.readFileSync(path.join(HYBRID_DIR, "results.json"), "utf8"));
  assert.deepEqual(fresh, committed);
  for (const [file, text] of files) assert.equal(fs.readFileSync(file, "utf8"), text, file);
  assert.equal(fs.readFileSync(path.join(HYBRID_DIR, "REPORT.md"), "utf8"), renderHybridReport(committed));
});
