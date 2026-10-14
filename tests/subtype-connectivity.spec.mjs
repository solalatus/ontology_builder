import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  words, componentsOf, pairStatus, foldedIntoParentValue, nameHintHits, summarize, analyzeAll, OUTPUT_PATH,
} from "./evals/subtype-connectivity.mjs";

// Issue #155 step 1: how recovered interview models treat the subtype
// pairs found by the reference-model audit. Unit tests on synthetic models,
// then the committed result against a fresh run.

const node = (id, label, properties = []) => ({ id, label, properties });

test("words splits CamelCase, acronyms and separators", () => {
  assert.deepEqual(words("SecuredLoan"), ["secured", "loan"]);
  assert.deepEqual(words("CO2Sensor"), ["co2", "sensor"]);
  assert.deepEqual(words("HVACZone"), ["hvac", "zone"]);
  assert.deepEqual(words("is_secured-flag"), ["is", "secured", "flag"]);
});

test("pairStatus distinguishes linked, connected through others, not connected, and missing ends", () => {
  const nodes = [node("a", "Loan"), node("b", "SecuredLoan"), node("c", "Collateral"), node("d", "Island")];
  const edges = [{ source: "b", target: "c" }, { source: "c", target: "a" }];
  const component = componentsOf(nodes, edges);
  const [loan, secured, collateral, island] = nodes;
  assert.equal(pairStatus({ subNode: collateral, superNode: loan, edges, component }), "linked");
  assert.equal(pairStatus({ subNode: secured, superNode: loan, edges, component }), "connected");
  assert.equal(pairStatus({ subNode: island, superNode: loan, edges, component }), "not connected");
  assert.equal(pairStatus({ subNode: secured, superNode: undefined, edges, component }), "parent not recovered");
  assert.equal(pairStatus({ subNode: undefined, superNode: loan, edges, component }), "subtype not recovered");
  assert.equal(pairStatus({ subNode: undefined, superNode: undefined, edges, component }), "neither recovered");
});

test("foldedIntoParentValue finds the subtype as an allowed value or in a property name", () => {
  const state = node("s", "MaintenanceState", [{ name: "stateCategory", type: "enum", allowed: ["operating", "degraded", "failed"] }]);
  assert.equal(foldedIntoParentValue("DegradedState", "MaintenanceState", state), "stateCategory = degraded");
  const loan = node("l", "Loan", [{ name: "isSecured", type: "boolean", allowed: ["true", "false"] }]);
  assert.equal(foldedIntoParentValue("SecuredLoan", "Loan", loan), "isSecured (boolean)");
  // Every distinguishing word must be present, not just one of them.
  assert.equal(foldedIntoParentValue("RevolvingLineOfCredit", "Loan", node("x", "Loan", [{ name: "revolving", type: "boolean" }])), null);
  assert.equal(foldedIntoParentValue("UnsecuredLoan", "Loan", loan), null, "isSecured does not say unsecured");
  assert.equal(foldedIntoParentValue("Loan", "Loan", loan), null, "no distinguishing words");
  assert.equal(foldedIntoParentValue("SecuredLoan", "Loan", undefined), null, "parent not recovered");
});

test("nameHintHits matches a whole-word name suffix and records whether the pair is linked", () => {
  const nodes = [
    node("1", "Facility"), node("2", "StorageFacility"), node("3", "Loan"), node("4", "SecuredLoan"),
    node("5", "Pump"), node("6", "PackagedHeatPump"), node("7", "Loans"), node("8", "LoanOfficer"),
  ];
  const component = componentsOf(nodes, [{ source: "4", target: "3" }]);
  assert.deepEqual(nameHintHits(nodes, component), [
    { subtype: "PackagedHeatPump", parent: "Pump", linked: false }, // a known false positive: a heat pump is not a pump
    { subtype: "SecuredLoan", parent: "Loan", linked: true },
    { subtype: "StorageFacility", parent: "Facility", linked: false },
  ]);
});

test("summarize applies the gate recorded on #155: an unlinked kind in at least one run, in two or more domains", () => {
  const run = (domain, statuses) => ({
    domain, name_hint_hits: [],
    pairs: statuses.map(([category, status]) => ({ category, status })),
  });
  const oneDomain = summarize([run("a", [["kind", "not connected"]]), run("b", [["value", "not connected"], ["kind", "connected"]])]);
  assert.equal(oneDomain.gate_met, false, "a value does not count, nor a connected kind");
  assert.deepEqual(oneDomain.domains_with_an_unlinked_kind, ["a"]);
  const twoDomains = summarize([run("a", [["kind", "not connected"]]), run("b", [["kind", "not connected"]]), run("b", [])]);
  assert.equal(twoDomains.gate_met, true);
  assert.equal(twoDomains.by_domain.b.runs, 2);
  assert.equal(twoDomains.by_domain.b.runs_with_unlinked_kind, 1);
});

test("on the committed runs the matcher reproduces every run's own heuristic-matches.json, and the committed result is current", () => {
  const fresh = analyzeAll();
  for (const era of Object.values(fresh)) {
    assert.equal(era.runs.length, 15);
    for (const run of era.runs) assert.ok(run.matcher_reproduces_committed_matches, `${run.corpus}/${run.run}/${run.domain}`);
  }
  const committed = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
  assert.deepEqual(committed, JSON.parse(JSON.stringify(fresh)));
});

test("the claims REPORT.md makes about FIBO's motivating subtypes hold in the current-prompt runs", () => {
  const committed = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
  const fibo = (era) => committed[era].runs.filter((r) => r.domain === "fibo-loans");
  const status = (run, sub) => run.pairs.find((p) => p.subclass === sub).status;
  for (const run of fibo("current_prompt")) {
    // Never recovered as a separate class under the current prompt...
    assert.ok(["subtype not recovered", "neither recovered"].includes(status(run, "SecuredLoan")), run.run);
    assert.ok(["subtype not recovered", "neither recovered"].includes(status(run, "CollateralizedLoan")), run.run);
  }
  // ...whereas a pre-#152 run left both unlinked from their parent.
  assert.ok(fibo("pre_152_prompt").some((r) => status(r, "SecuredLoan") === "not connected" && status(r, "CollateralizedLoan") === "not connected"));
});
