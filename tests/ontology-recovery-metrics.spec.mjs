import { test } from "node:test";
import assert from "node:assert/strict";
import yaml from "js-yaml";
import {
  loadGroundTruthModel, scopeGroundTruth, loadRawFixtureText,
  isRecoverableProperty, isRecoverableRelationship, buildReducedActions,
} from "./evals/lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./evals/lib/recoveryMetrics.mjs";

// Fast, deterministic unit tests for tests/evals/'s own matching/metrics
// logic -- pure JS, no browser, no API key, so these run as part of the
// main suite (tests/*.spec.mjs) even though the eval itself (which needs a
// real key) lives separately under tests/evals/.
//
// fixtures/itops_mtsr.yaml itself was physically corrected (identifier/uri
// properties, "is a" predicates, and multi-input actions removed) on top of
// keeping isRecoverableProperty/isRecoverableRelationship/buildReducedActions
// as a safety net (helper_agent_todo.md's dated Log entry) -- so the bundled
// fixture no longer has anything for these filters to actually remove.
// They're tested directly against synthetic predicates/actions below
// instead of relying on the fixture happening to contain a removable case,
// which is what still makes them a real safety net if the fixture is ever
// replaced by a fresh, uncorrected gold-standard upload.

test("isRecoverableProperty rejects only identifier/uri-target datatype predicates", () => {
  assert.equal(isRecoverableProperty({ kind: "datatype", to: "identifier" }), false);
  assert.equal(isRecoverableProperty({ kind: "datatype", to: "uri" }), false);
  assert.equal(isRecoverableProperty({ kind: "datatype", to: "text" }), true);
  assert.equal(isRecoverableProperty({ kind: "controlled-value", to: "someValueSet" }), true);
  // An object-kind predicate is a relationship, not a property -- its `to`
  // is a class id, which could coincidentally be named "identifier"/"uri";
  // the kind check must gate this, not the to-value alone.
  assert.equal(isRecoverableProperty({ kind: "object", to: "identifier" }), true);
});

test("isRecoverableRelationship rejects only \"is a\" (subclass) predicates", () => {
  assert.equal(isRecoverableRelationship({ label: "is a" }), false);
  assert.equal(isRecoverableRelationship({ label: "impacts" }), true);
  assert.equal(isRecoverableRelationship({ label: "declared from" }), true);
});

test("buildReducedActions reduces a multi-input synthetic action to its first-listed input and reports the drop count", () => {
  const classes = { incident: { id: "incident" }, commander: { id: "commander" } };
  const doc = {
    actions: {
      declareMajorIncident: { label: "Declare major incident", inputs: { incident: "incident", commander: "commander" } },
      acknowledgeAlert: { label: "Acknowledge alert", inputs: { alert: "incident" } }, // single input, reuses "incident" class id for simplicity
    },
  };
  const actions = buildReducedActions(doc, classes);
  const declare = actions.find((a) => a.id === "declareMajorIncident");
  assert.equal(declare.primaryInputClassId, "incident");
  assert.equal(declare.droppedInputCount, 1);
  const ack = actions.find((a) => a.id === "acknowledgeAlert");
  assert.equal(ack.droppedInputCount, 0);
});

test("buildReducedActions skips an action whose primary input references a non-existent class, defensively", () => {
  const classes = { incident: { id: "incident" } };
  const doc = { actions: { bogus: { label: "Bogus", inputs: { thing: "doesNotExist" } } } };
  assert.deepEqual(buildReducedActions(doc, classes), []);
});

test("groundTruthModel's bundled fixture has already had every identifier/uri-target property physically removed, so the filter is a documented no-op against it", () => {
  const filtered = loadGroundTruthModel();
  const unfiltered = loadGroundTruthModel({ includeAllProperties: true });
  assert.deepEqual(filtered.properties, unfiltered.properties,
    "the bundled fixture should already be clean -- filtering it should change nothing");
  assert.ok(!unfiltered.properties.some((p) => p.targetId === "identifier" || p.targetId === "uri"),
    "the raw fixture itself must no longer declare any identifier/uri-target property");
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

// A real confirmatory eval run recorded these exact two relationships
// (class pair, direction, and meaning all correct) but they scored as
// unmatched at the class-level 0.6 Jaccard threshold -- "using" vs "with"
// is a one-word preposition difference the interviewer could never have
// known to avoid, since gold's exact wording is deliberately hidden from
// it (helper_agent_todo.md's dated addendum has the full audit). Pins that
// the lower relationship/property threshold recovers real matches like
// these, which the class-level threshold alone would still reject.
test("computeRecoveryMetrics credits a relationship recorded with a different preposition than gold's exact wording", () => {
  const groundTruth = {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      runbook: { id: "runbook", label: "Runbook", aliases: ["runbook"] },
    },
    relationships: [{ id: "incident_is_handled_with_runbook", label: "is handled with", fromClassId: "incident", toClassId: "runbook" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "x", aliases: [], properties: [] },
      { id: "n2", label: "Runbook", meaning: "y", aliases: [], properties: [] },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", relation: "handledUsing" }],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.relationships.matched, 1, "\"handledUsing\" should match gold's \"is handled with\" despite the preposition difference");
  assert.equal(metrics.relationships.recall, 1);
});

// The residual limit this threshold change does NOT fix, documented rather
// than silently papered over: a genuine different word choice with zero
// token overlap at all can never match under Jaccard, no matter how low the
// threshold goes, without a synonym dictionary this eval deliberately
// doesn't maintain (recoveryMetrics.mjs's own module doc).
test("computeRecoveryMetrics still does not credit a relationship whose label shares no words with gold's, even a very close synonym", () => {
  const groundTruth = {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      itService: { id: "itService", label: "IT Service", aliases: ["it service"] },
    },
    relationships: [{ id: "incident_impacts_itService", label: "impacts", fromClassId: "incident", toClassId: "itService" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "x", aliases: [], properties: [] },
      { id: "n2", label: "IT Service", meaning: "y", aliases: [], properties: [] },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", relation: "affects" }],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.relationships.matched, 0, "\"affects\" vs \"impacts\" share zero tokens -- not fixable by threshold tuning alone");
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

test("groundTruthModel's bundled fixture has already had every \"is a\" predicate physically removed, so the filter is a documented no-op against it", () => {
  const filtered = loadGroundTruthModel();
  assert.ok(!filtered.relationships.some((r) => r.label === "is a"),
    "no subclass predicate should be scored as a relationship -- the app has no subclassing to model it with");
  const rawObjectPredicateCount = Object.values(yaml.load(loadRawFixtureText()).predicates)
    .filter((p) => p.kind === "object").length;
  const isACount = Object.values(yaml.load(loadRawFixtureText()).predicates)
    .filter((p) => p.kind === "object" && p.label === "is a").length;
  assert.equal(isACount, 0, "the raw fixture itself must no longer declare any \"is a\" predicate");
  assert.equal(filtered.relationships.length, rawObjectPredicateCount);
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

// practicalScopePropertyIds: a property on an in-scope class isn't
// automatically in scope itself -- its own label has to independently
// appear (content-word overlap, not a class hand-me-down) in the fixture's
// own competency-question/action corpus. Pins the real, auditable result
// against the bundled fixture: a genuine, non-trivial reduction (not a
// no-op, and not everything), and specific real examples on each side of
// the line -- decision-bearing fields (status, severity) survive, generic
// administrative ones (name, description, version) don't, matching
// AGENT_KNOWLEDGE's own "reject nice to know fields" instruction.
test("groundTruthModel's practicalScopePropertyIds is a real, non-trivial, auditable subset of the class-scoped properties", () => {
  const gt = loadGroundTruthModel();
  const classScopedProperties = gt.properties.filter((p) => gt.practicalScopeClassIds.has(p.classId));
  const propertyScoped = classScopedProperties.filter((p) => gt.practicalScopePropertyIds.has(p.id));
  assert.ok(propertyScoped.length > 0, "property scope must not be empty");
  assert.ok(propertyScoped.length < classScopedProperties.length,
    "property-level scoping must be a real reduction on top of class-level scoping, not a no-op");
  const inScopeLabels = propertyScoped.map((p) => p.label);
  for (const expected of ["has status", "has severity"]) {
    assert.ok(inScopeLabels.includes(expected), `expected "${expected}" to survive property-level scoping`);
  }
  const outOfScopeLabels = classScopedProperties.filter((p) => !gt.practicalScopePropertyIds.has(p.id)).map((p) => p.label);
  for (const excluded of ["has name", "has description", "has version"]) {
    assert.ok(outOfScopeLabels.includes(excluded), `expected "${excluded}" to be excluded by property-level scoping`);
  }
});

test("scopeGroundTruth, given propertyIds, additionally requires each property's own id to be in scope, not just its host class", () => {
  const gt = loadGroundTruthModel();
  const scoped = scopeGroundTruth(gt, gt.practicalScopeClassIds, gt.practicalScopePropertyIds);
  assert.ok(scoped.properties.every((p) => gt.practicalScopePropertyIds.has(p.id)));
  const classOnlyScoped = scopeGroundTruth(gt, gt.practicalScopeClassIds);
  assert.ok(scoped.properties.length < classOnlyScoped.properties.length,
    "passing propertyIds must reduce the property count versus class-only scoping");
});

test("scopeGroundTruth without propertyIds keeps its prior class-only behavior (backward compatible default)", () => {
  const gt = loadGroundTruthModel();
  const classIdsOnly = scopeGroundTruth(gt, gt.practicalScopeClassIds);
  const explicitNull = scopeGroundTruth(gt, gt.practicalScopeClassIds, null);
  assert.deepEqual(classIdsOnly.properties, explicitNull.properties);
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

test("groundTruthModel's bundled fixture has already had every action's secondary inputs physically removed, so every action reduces cleanly with nothing dropped", () => {
  const gt = loadGroundTruthModel();
  const raw = yaml.load(loadRawFixtureText());
  assert.ok(gt.actions.length > 0);
  for (const a of gt.actions) {
    const rawInputs = Object.entries(raw.actions[a.id].inputs);
    assert.equal(rawInputs.length, 1, `${a.id} in the raw fixture should already declare exactly one input`);
    assert.equal(a.primaryInputClassId, rawInputs[0][1]);
    assert.equal(a.droppedInputCount, 0);
  }
  // declareMajorIncident was the original multi-input example (incident,
  // commander) -- pin that its primary input survived the physical edit
  // correctly, even though there's nothing left to drop now.
  const declare = gt.actions.find((a) => a.id === "declareMajorIncident");
  assert.equal(declare.primaryInputClassId, "incident");
  assert.equal(declare.droppedInputCount, 0);
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
