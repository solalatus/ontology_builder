import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loadGroundTruthModel, scopeGroundTruth, listAvailableDomains, resolveDomainYamlPath, resolveDomainPersonaPath,
} from "./evals/lib/groundTruthModel.mjs";

// Offline, deterministic tests for groundTruthModel.mjs's issue #104
// addition: loading any ontology_translation/domains/*/reference.domain.yaml
// as ground truth, alongside the pre-existing MTSR path. No live API calls.

test("listAvailableDomains finds every domain with a reference.domain.yaml, auto-discovered (no manifest.yaml)", () => {
  const domains = listAvailableDomains();
  for (const expected of ["brick-hvac", "fibo-loans", "iof-maintenance", "iof-supply-chain", "itops"]) {
    assert.ok(domains.includes(expected), `expected ${expected} to be auto-discovered, got: ${domains.join(", ")}`);
  }
});

test("resolveDomainYamlPath throws a clear error naming available domains for an unknown domain id", () => {
  assert.throws(() => resolveDomainYamlPath("not-a-real-domain"), /unknown EVAL_DOMAIN.*not-a-real-domain.*Available domains/s);
});

test("resolveDomainPersonaPath returns null for a domain with no persona.md, rather than throwing", () => {
  // Every real domain today has one, so this is a synthetic-shape check --
  // exercised indirectly by the "no crash" behavior wherever this is
  // consumed (ontology-recovery.eval.spec.mjs's own explicit assert.ok
  // check turns a missing persona.md into a clear skip, not a crash).
  assert.equal(resolveDomainPersonaPath("definitely-not-a-real-domain-id"), null);
});

test("loadGroundTruthModel({format: 'domain-yaml'}) requires an explicit path", () => {
  assert.throws(() => loadGroundTruthModel({ format: "domain-yaml" }), /requires a path/);
});

test("loadGroundTruthModel rejects an unknown format", () => {
  assert.throws(() => loadGroundTruthModel({ format: "yolo" }), /unknown format/);
});

test("a .domain.yaml-sourced ground truth exposes real rules, unlike MTSR (which has no rules concept at all)", () => {
  const mtsr = loadGroundTruthModel();
  assert.deepEqual(mtsr.rules, [], "MTSR has no rules concept -- always empty");

  const domainYaml = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath("brick-hvac") });
  assert.ok(domainYaml.rules.length > 0, "brick-hvac's reference.domain.yaml has real rules");
  const rule = domainYaml.rules.find((r) => r.id === "needsCoolingFromSetpoint");
  assert.ok(rule, "expected the needsCoolingFromSetpoint rule to survive the load");
  assert.ok(rule.conditions.length > 0);
});

test("rule condition text feeds the practical-scope corpus (the issue's own explicit requirement)", () => {
  // brick-hvac's needsCoolingFromSetpoint rule mentions "cooling temperature
  // setpoint" -- CoolingTemperatureSetpoint should land in practical scope
  // because of that, even if no competency question or action happened to
  // name it directly.
  const gt = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath("brick-hvac") });
  assert.ok(gt.practicalScopeClassIds.has("CoolingTemperatureSetpoint"),
    "expected a class only mentioned in a rule's own conditions to be pulled into practical scope");
});

test("a .domain.yaml relationship's own aliases are preserved (MTSR relationships never had anywhere to put one)", () => {
  const gt = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath("brick-hvac") });
  // AirHandlingUnit has an "AHU"/"Air Handler Unit" alias declared on the
  // CLASS -- relationships in this fixture don't declare their own, but the
  // shape must be present (an empty array, not undefined) so
  // recoveryMetrics.mjs's relationshipLabelMatchesEdge can safely spread it.
  for (const rel of gt.relationships) {
    assert.ok(Array.isArray(rel.aliases), `relationship ${rel.id} must have an aliases array, even if empty`);
  }
});

test("scopeGroundTruth carries the rules field through (filtered by classId when a rule declares one, kept otherwise)", () => {
  const gt = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath("brick-hvac") });
  const scoped = scopeGroundTruth(gt, gt.practicalScopeClassIds, gt.practicalScopePropertyIds);
  assert.ok(Array.isArray(scoped.rules));
  // Every domain-yaml rule today has no classId (rules aren't anchored to
  // one class) -- scopeGroundTruth must not silently drop them all.
  assert.equal(scoped.rules.length, gt.rules.length);
});

test("a class name is split on camelCase boundaries into its label BEFORE lowercasing (regression: pre-lowercasing would break downstream Jaccard matching)", () => {
  const gt = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath("brick-hvac") });
  assert.equal(gt.classes.AirHandlingUnit.label, "Air Handling Unit");
  assert.ok(gt.classes.AirHandlingUnit.aliases.includes("air handling unit"));
});
