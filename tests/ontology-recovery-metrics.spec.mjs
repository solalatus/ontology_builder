import { test } from "node:test";
import assert from "node:assert/strict";
import yaml from "js-yaml";
import { loadGroundTruthModel, scopeGroundTruth, loadRawFixtureText } from "./evals/lib/groundTruthModel.mjs";
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

test("groundTruthModel excludes \"is a\" (subclass) predicates from scored relationships", () => {
  const filtered = loadGroundTruthModel();
  assert.ok(!filtered.relationships.some((r) => r.label === "is a"),
    "no subclass predicate should be scored as a relationship -- the app has no subclassing to model it with");
  // Sanity: the raw fixture really does define "is a" predicates, so the
  // assertion above is exercising the filter, not a fixture that has none.
  const rawObjectPredicateCount = Object.values(yaml.load(loadRawFixtureText()).predicates)
    .filter((p) => p.kind === "object").length;
  const isACount = Object.values(yaml.load(loadRawFixtureText()).predicates)
    .filter((p) => p.kind === "object" && p.label === "is a").length;
  assert.ok(isACount > 0, "expected the raw fixture to contain at least one \"is a\" predicate");
  assert.equal(filtered.relationships.length, rawObjectPredicateCount - isACount);
});

test("groundTruthModel's practicalScopeClassIds is a real, non-trivial, auditable subset of the full domain", () => {
  const gt = loadGroundTruthModel();
  const total = Object.keys(gt.classes).length;
  const scopeSize = gt.practicalScopeClassIds.size;
  assert.ok(scopeSize > 0, "practical scope must not be empty");
  assert.ok(scopeSize < total, "practical scope must be strictly smaller than the full 68-class reference domain");
  // Classes central to the fixture's own canonical competency questions/
  // actions must be in scope...
  const inScopeLabels = [...gt.practicalScopeClassIds].map((id) => gt.classes[id].label);
  for (const expected of ["Incident", "Major Incident", "IT Service", "Resolver Group", "Regulatory Notification"]) {
    assert.ok(inScopeLabels.includes(expected), `expected "${expected}" to be in the practical scope`);
  }
  // ...while classes from the fixture's broader infrastructure/monitoring/
  // organizational layers that the canonical competency questions and
  // actions never mention must not be.
  for (const excluded of ["Server", "Virtual Machine", "Monitoring Tool", "Network Operations Centre", "Vendor"]) {
    assert.ok(!inScopeLabels.includes(excluded), `expected "${excluded}" to be outside the practical scope`);
  }
});

test("scopeGroundTruth filters classes/relationships/properties down to only the given class ids", () => {
  const gt = loadGroundTruthModel();
  const scoped = scopeGroundTruth(gt, gt.practicalScopeClassIds);
  assert.equal(Object.keys(scoped.classes).length, gt.practicalScopeClassIds.size);
  assert.ok(Object.keys(scoped.classes).length < Object.keys(gt.classes).length);
  assert.ok(scoped.relationships.every((r) =>
    gt.practicalScopeClassIds.has(r.fromClassId) && gt.practicalScopeClassIds.has(r.toClassId)));
  assert.ok(scoped.relationships.length < gt.relationships.length);
  assert.ok(scoped.properties.every((p) => gt.practicalScopeClassIds.has(p.classId)));
  assert.ok(scoped.properties.length < gt.properties.length);
});

test("computeRecoveryMetrics against a scoped ground truth never has a smaller denominator than what was actually reachable", () => {
  const gt = loadGroundTruthModel();
  const scoped = scopeGroundTruth(gt, gt.practicalScopeClassIds);
  const recovered = { nodes: [], edges: [] };
  const full = computeRecoveryMetrics(gt, recovered);
  const narrowed = computeRecoveryMetrics(scoped, recovered);
  assert.ok(narrowed.classes.groundTruthTotal <= full.classes.groundTruthTotal);
  assert.ok(narrowed.relationships.groundTruthTotal <= full.relationships.groundTruthTotal);
  assert.ok(narrowed.properties.groundTruthTotal <= full.properties.groundTruthTotal);
  // Both must still be well-formed (no NaN) even scored against an empty recovered state.
  assert.ok(Number.isFinite(narrowed.recoveryEffectiveness));
});

test("groundTruthModel reduces every multi-input fixture action to a single primary input, dropping the rest with a count", () => {
  const gt = loadGroundTruthModel();
  const raw = yaml.load(loadRawFixtureText());
  assert.ok(gt.actions.length > 0);
  for (const a of gt.actions) {
    const rawInputs = Object.entries(raw.actions[a.id].inputs);
    assert.equal(a.primaryInputClassId, rawInputs[0][1], `${a.id}'s primary input must be the first-listed one in the raw fixture`);
    assert.equal(a.droppedInputCount, rawInputs.length - 1, `${a.id}'s dropped count must match how many extra inputs the raw fixture actually declares`);
  }
  // Sanity: the fixture really does define at least one multi-input action,
  // so the assertions above are exercising real reduction, not a no-op.
  assert.ok(gt.actions.some((a) => a.droppedInputCount > 0), "expected at least one real multi-input action in the fixture");
  // declareMajorIncident is a known multi-input case (incident, commander) --
  // pin its exact reduction so a future fixture edit that reorders its
  // inputs is caught, not silently accepted.
  const declare = gt.actions.find((a) => a.id === "declareMajorIncident");
  assert.equal(declare.primaryInputClassId, "incident");
  assert.equal(declare.droppedInputCount, 1);
});

test("groundTruthModel does not report a dropped input for an action that only ever had one", () => {
  const gt = loadGroundTruthModel();
  const raw = yaml.load(loadRawFixtureText());
  const singleInputActionId = Object.keys(raw.actions).find((id) => Object.keys(raw.actions[id].inputs).length === 1);
  assert.ok(singleInputActionId, "expected the fixture to contain at least one single-input action for this test to mean anything");
  const reduced = gt.actions.find((a) => a.id === singleInputActionId);
  assert.equal(reduced.droppedInputCount, 0);
});

test("scopeGroundTruth filters actions to only those whose primary input class is in scope", () => {
  const gt = loadGroundTruthModel();
  const scoped = scopeGroundTruth(gt, gt.practicalScopeClassIds);
  assert.ok(scoped.actions.every((a) => gt.practicalScopeClassIds.has(a.primaryInputClassId)));
  const excludedClassIds = new Set(Object.keys(gt.classes).filter((id) => !gt.practicalScopeClassIds.has(id)));
  assert.ok(!scoped.actions.some((a) => excludedClassIds.has(a.primaryInputClassId)));
});

test("scopeGroundTruth on a synthetic ground truth keeps only in-scope actions", () => {
  const groundTruth = {
    classes: { a: { id: "a", label: "A", aliases: ["a"] }, b: { id: "b", label: "B", aliases: ["b"] } },
    relationships: [],
    properties: [],
    actions: [
      { id: "act1", label: "Act 1", primaryInputClassId: "a", droppedInputCount: 0 },
      { id: "act2", label: "Act 2", primaryInputClassId: "b", droppedInputCount: 1 },
    ],
  };
  const scoped = scopeGroundTruth(groundTruth, new Set(["a"]));
  assert.deepEqual(scoped.actions.map((a) => a.id), ["act1"]);
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
