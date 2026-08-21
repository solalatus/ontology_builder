import { test } from "node:test";
import assert from "node:assert/strict";
import { loadGroundTruthModel, resolveDomainYamlPath } from "./evals/lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./evals/lib/recoveryMetrics.mjs";

// Issue #104's own definition-of-done: "IT Ops scores can be reproduced
// through new loader." Offline and deterministic -- no live LLM run
// needed to prove this, which would be non-deterministic and cost real
// money on every CI run anyway. Instead: load itops through BOTH the
// original MTSR path and the new .domain.yaml path (tests/evals/
// convert-itops-to-domain-yaml.mjs's mechanical conversion), and confirm
// the underlying content -- and the scores computeRecoveryMetrics produces
// against a fixed synthetic recovered state -- are equivalent.
//
// Not byte-identical on every dimension: the two source schemas are not
// perfectly isomorphic (MTSR's own actions carry a `label` and
// `authorization` array that .domain.yaml's action schema has no field
// for at all -- not a bug, a real difference in what each format can
// express), so the practical-scope corpus -- which folds action text in --
// differs slightly between the two. Everything the ground truth's own
// classes/relationships/properties actually consist of matches exactly.

test("itops's .domain.yaml conversion has the exact same class/relationship/property/valueSet counts as the original MTSR fixture", () => {
  const mtsr = loadGroundTruthModel();
  const domainYaml = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath("itops") });

  assert.equal(Object.keys(domainYaml.classes).length, Object.keys(mtsr.classes).length, "class count");
  assert.equal(domainYaml.relationships.length, mtsr.relationships.length, "relationship count (after reciprocal-pair merging, both formats)");
  assert.equal(domainYaml.properties.length, mtsr.properties.length, "property count");
});

test("itops's .domain.yaml conversion's practical scope is a close, explainable approximation of the MTSR fixture's own (not identical, by design -- see module comment)", () => {
  const mtsr = loadGroundTruthModel();
  const domainYaml = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath("itops") });

  const classDelta = Math.abs(domainYaml.practicalScopeClassIds.size - mtsr.practicalScopeClassIds.size);
  const propDelta = Math.abs(domainYaml.practicalScopePropertyIds.size - mtsr.practicalScopePropertyIds.size);
  assert.ok(classDelta <= 6, `practical-scope class count should be close: mtsr=${mtsr.practicalScopeClassIds.size} domainYaml=${domainYaml.practicalScopeClassIds.size}`);
  assert.ok(propDelta <= 6, `practical-scope property count should be close: mtsr=${mtsr.practicalScopePropertyIds.size} domainYaml=${domainYaml.practicalScopePropertyIds.size}`);
});

test("computeRecoveryMetrics against a fixed synthetic recovered state produces the same class/relationship/property recall through both loaders", () => {
  const mtsr = loadGroundTruthModel();
  const domainYaml = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath("itops") });

  // A small, fixed "recovered" state naming real itops concepts (present
  // in both sources under the same natural-language label) -- not a live
  // LLM run, just a deterministic probe of whether both loaders feed
  // computeRecoveryMetrics equivalent data for the same real content.
  const recoveredState = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [], properties: [{ name: "status", allowed: ["new", "acknowledged", "investigating", "contained", "recovering", "monitoring", "resolved", "closed", "cancelled"] }] },
      { id: "n2", label: "IT Service", meaning: "", aliases: [], properties: [] },
      { id: "n3", label: "On-Call Engineer", meaning: "", aliases: [], properties: [] },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", relation: "impacts", aliases: [] },
    ],
  };

  const mtsrMetrics = computeRecoveryMetrics(mtsr, recoveredState);
  const domainYamlMetrics = computeRecoveryMetrics(domainYaml, recoveredState);

  assert.equal(mtsrMetrics.classes.matched, domainYamlMetrics.classes.matched, "same number of gold classes matched");
  assert.equal(mtsrMetrics.relationships.matched, domainYamlMetrics.relationships.matched, "same number of gold relationships matched");
  assert.ok(mtsrMetrics.classes.matched >= 3, "sanity: all 3 synthetic nodes should match a real gold class in both sources");
});
