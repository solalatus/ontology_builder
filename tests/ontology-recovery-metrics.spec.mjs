import { test } from "node:test";
import assert from "node:assert/strict";
import { loadGroundTruthModel } from "./evals/lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./evals/lib/recoveryMetrics.mjs";

// Fast, deterministic unit tests for tests/evals/'s own matching/metrics
// logic -- pure JS, no browser, no API key, so these run as part of the
// main suite (tests/*.spec.mjs) even though the eval itself (which needs a
// real key) lives separately under tests/evals/.

test("groundTruthModel excludes only identifier/uri-target properties, keeps everything else", () => {
  const filtered = loadGroundTruthModel();
  const unfiltered = loadGroundTruthModel({ includeAllProperties: true });
  assert.ok(unfiltered.properties.length > filtered.properties.length, "the filter must actually remove something");
  assert.ok(!filtered.properties.some((p) => p.targetId === "identifier" || p.targetId === "uri"),
    "no identifier/uri-target property should survive the filter");
  assert.ok(unfiltered.properties.some((p) => p.targetId === "identifier"),
    "sanity: the fixture really does contain identifier-target properties before filtering");
  // Nothing else should be dropped -- same count once identifier/uri ones are excluded.
  const nonIdUriCount = unfiltered.properties.filter((p) => p.targetId !== "identifier" && p.targetId !== "uri").length;
  assert.equal(filtered.properties.length, nonIdUriCount);
});

test("computeRecoveryMetrics matches a camelCase recovered relation name against the ground truth's natural-language label", () => {
  const groundTruth = {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      itService: { id: "itService", label: "IT Service", aliases: ["it service"] },
    },
    relationships: [{ id: "incident_impacts_itService", label: "is implemented by", fromClassId: "incident", toClassId: "itService" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "x", aliases: [], properties: [] },
      { id: "n2", label: "IT Service", meaning: "y", aliases: [], properties: [] },
    ],
    // The app's own camelCase dialect -- this is what a real tool call's
    // relationship `name:` field ends up stored as (edge.relation).
    edges: [{ id: "e1", source: "n1", target: "n2", relation: "isImplementedBy" }],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.relationships.matched, 1, "camelCase \"isImplementedBy\" must match ground truth's \"is implemented by\"");
  assert.equal(metrics.relationships.recall, 1);
});

test("computeRecoveryMetrics still does not conflate a short generic label with a longer one that happens to contain it", () => {
  // Regression pin for the substring-matching pitfall this project already
  // rejected once (recoveryMetrics.mjs's own header comment): "Incident"
  // must not falsely match a class literally named "Major Incident".
  const groundTruth = {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      majorIncident: { id: "majorIncident", label: "Major Incident", aliases: ["major incident"] },
    },
    relationships: [],
    properties: [],
  };
  const recovered = { nodes: [{ id: "n1", label: "Incident", meaning: "", aliases: [], properties: [] }], edges: [] };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.classes.matched, 1, "only the real Incident match should count, not Major Incident too");
});

test("computeRecoveryMetrics handles an entirely empty recovered state without crashing or producing NaN", () => {
  const groundTruth = loadGroundTruthModel();
  const metrics = computeRecoveryMetrics(groundTruth, { nodes: [], edges: [] });
  assert.equal(metrics.classes.recall, 0);
  assert.equal(metrics.relationships.recall, 0);
  assert.equal(metrics.properties.recall, 0);
  assert.equal(metrics.controlledValueFidelity, null);
  assert.ok(Number.isFinite(metrics.recoveryEffectiveness));
  assert.equal(metrics.recoveryEffectiveness, 0);
});
