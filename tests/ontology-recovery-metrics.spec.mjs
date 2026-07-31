import { test } from "node:test";
import assert from "node:assert/strict";
import yaml from "js-yaml";
import {
  loadGroundTruthModel, scopeGroundTruth, loadRawFixtureText,
  isRecoverableProperty, isRecoverableRelationship, buildReducedActions,
  mergeReciprocalRelationshipPairs,
} from "./evals/lib/groundTruthModel.mjs";
import { computeRecoveryMetrics, computeMatchDetail, matchClasses } from "./evals/lib/recoveryMetrics.mjs";

// This file covers recoveryMetrics.mjs's own regex/token-overlap matcher
// only -- deterministic, no API key, no network. The LLM-judge supplement
// built on top of it (llmMatcher.mjs, judging the residual near-misses this
// matcher can't reach) has its own separate, clearly-labeled test file,
// tests/ontology-recovery-llm-matching.spec.mjs -- kept apart deliberately
// so it's always obvious which tests exercise the free/instant heuristic
// pass and which exercise the LLM-adjudicated one.

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

test("mergeReciprocalRelationshipPairs merges two opposite-direction predicates between the same class pair into one entry with a reciprocalLabel", () => {
  const relationships = [
    { id: "incident_isSupportedBy_evidence", label: "is supported by", fromClassId: "incident", toClassId: "evidence" },
    { id: "evidence_documents_incident", label: "documents", fromClassId: "evidence", toClassId: "incident" },
  ];
  const merged = mergeReciprocalRelationshipPairs(relationships);
  assert.equal(merged.length, 1, "the reciprocal pair should collapse into a single scoring unit");
  assert.equal(merged[0].id, "incident_isSupportedBy_evidence", "keeps the first-encountered entry as canonical");
  assert.equal(merged[0].label, "is supported by");
  assert.equal(merged[0].reciprocalLabel, "documents");
  assert.equal(merged[0].reciprocalId, "evidence_documents_incident");
});

test("mergeReciprocalRelationshipPairs leaves a lone relationship (no opposite-direction partner) untouched", () => {
  const relationships = [{ id: "incident_impacts_itService", label: "impacts", fromClassId: "incident", toClassId: "itService" }];
  const merged = mergeReciprocalRelationshipPairs(relationships);
  assert.deepEqual(merged, relationships);
  assert.equal(merged[0].reciprocalLabel, undefined);
});

test("mergeReciprocalRelationshipPairs leaves two same-direction predicates between the same class pair untouched (two real facts, not one double-counted)", () => {
  // e.g. the fixture's own System/Application -supports-> ITService pair is
  // two genuinely different classes -- but a same-direction pair sharing
  // one class-pair key would be two distinct real predicates, not a
  // reciprocal phrasing of one fact, and must not be collapsed.
  const relationships = [
    { id: "a", label: "hasBackup", fromClassId: "itService", toClassId: "backup" },
    { id: "b", label: "hasWorkaround", fromClassId: "itService", toClassId: "backup" },
  ];
  const merged = mergeReciprocalRelationshipPairs(relationships);
  assert.equal(merged.length, 2, "same-direction predicates between the same classes are two real facts, never merged");
  assert.ok(merged.every((r) => r.reciprocalLabel === undefined));
});

test("mergeReciprocalRelationshipPairs only pairs each relationship once, even with 3+ entries sharing a class-pair key", () => {
  const relationships = [
    { id: "fwd1", label: "is supported by", fromClassId: "incident", toClassId: "evidence" },
    { id: "rev1", label: "documents", fromClassId: "evidence", toClassId: "incident" },
    { id: "fwd2", label: "is otherwise linked to", fromClassId: "incident", toClassId: "evidence" },
  ];
  const merged = mergeReciprocalRelationshipPairs(relationships);
  assert.equal(merged.length, 2, "fwd1+rev1 merge into one unit; fwd2 has no partner left and stays separate");
  const mergedPair = merged.find((r) => r.id === "fwd1");
  assert.equal(mergedPair.reciprocalLabel, "documents");
  const lone = merged.find((r) => r.id === "fwd2");
  assert.equal(lone.reciprocalLabel, undefined);
});

test("groundTruthModel's bundled fixture has 7 reciprocal relationship pairs in the practical scope, a real and audited fraction of scored relationships", () => {
  // Pinned to the real live-eval audit that found this (helper_agent_todo.md's
  // dated addendum): 7 class-pairs, 14 of the 48 pre-merge scoped
  // relationships (29.2%), collapse to 7 scoring units post-merge.
  const gt = loadGroundTruthModel();
  const scoped = scopeGroundTruth(gt, gt.practicalScopeClassIds, gt.practicalScopePropertyIds);
  const reciprocalCount = scoped.relationships.filter((r) => r.reciprocalLabel).length;
  assert.equal(reciprocalCount, 7);
  const expectedPairLabels = [
    ["resolves", "is assigned to"],
    ["receives", "is sent to"],
    ["may open", "is triggered by"],
    ["is supported by", "documents"],
    ["is communicated through", "is about"],
    ["is evaluated by", "assesses"],
    ["is reviewed in", "reviews"],
  ];
  for (const [label, reciprocalLabel] of expectedPairLabels) {
    const hit = scoped.relationships.find((r) => r.label === label && r.reciprocalLabel === reciprocalLabel);
    assert.ok(hit, `expected a merged pair "${label}" / "${reciprocalLabel}"`);
  }
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

// A reciprocal-pair gt relationship (label + reciprocalLabel, see
// groundTruthModel.mjs's mergeReciprocalRelationshipPairs) must be creditable
// by recovering *either* direction -- the app correctly models the real
// connection with exactly one edge, and shouldn't be penalized for not also
// creating a redundant second edge in the opposite direction just to match
// gold's own choice to phrase the same fact twice.
test("computeRecoveryMetrics credits a reciprocal-pair relationship when only the canonical direction is recovered", () => {
  const groundTruth = {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      evidence: { id: "evidence", label: "Evidence", aliases: ["evidence"] },
    },
    relationships: [{ id: "a", label: "is supported by", reciprocalLabel: "documents", fromClassId: "incident", toClassId: "evidence" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [], properties: [] },
      { id: "n2", label: "Evidence", meaning: "", aliases: [], properties: [] },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", relation: "isSupportedBy" }],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.relationships.matched, 1);
  assert.equal(metrics.relationships.recall, 1);
});

test("computeRecoveryMetrics credits a reciprocal-pair relationship when only the reciprocal direction is recovered (opposite edge direction, reciprocal label)", () => {
  const groundTruth = {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      evidence: { id: "evidence", label: "Evidence", aliases: ["evidence"] },
    },
    relationships: [{ id: "a", label: "is supported by", reciprocalLabel: "documents", fromClassId: "incident", toClassId: "evidence" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [], properties: [] },
      { id: "n2", label: "Evidence", meaning: "", aliases: [], properties: [] },
    ],
    // Edge runs Evidence -> Incident, using gold's *reciprocal* label "documents".
    edges: [{ id: "e1", source: "n2", target: "n1", relation: "documents" }],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.relationships.matched, 1, "the reciprocal direction+label must count as recovering the same real-world connection");
  assert.equal(metrics.relationships.recall, 1);
  assert.equal(metrics.relationships.precision, 1, "the recovered edge must also count on the precision side via the reciprocal check");
});

test("computeRecoveryMetrics does NOT credit a reciprocal-pair relationship from an edge in the wrong direction using the wrong (non-reciprocal) label", () => {
  const groundTruth = {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      evidence: { id: "evidence", label: "Evidence", aliases: ["evidence"] },
    },
    relationships: [{ id: "a", label: "is supported by", reciprocalLabel: "documents", fromClassId: "incident", toClassId: "evidence" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [], properties: [] },
      { id: "n2", label: "Evidence", meaning: "", aliases: [], properties: [] },
    ],
    // Reverse direction, but with the *canonical* label, not "documents" --
    // shares zero tokens with "documents", so this must still miss.
    edges: [{ id: "e1", source: "n2", target: "n1", relation: "isSupportedBy" }],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.relationships.matched, 0);
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
  // mergeReciprocalRelationshipPairs (groundTruthModel.mjs) collapses each
  // opposite-direction pair sharing a class pair into one scoring unit --
  // every raw object predicate still contributes to a relationship, just
  // not always its own dedicated one, so the count drops by exactly the
  // number of merged pairs, not by nothing.
  const reciprocalPairCount = filtered.relationships.filter((r) => r.reciprocalLabel).length;
  assert.equal(filtered.relationships.length, rawObjectPredicateCount - reciprocalPairCount);
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

// computeMatchDetail: the residual "what the heuristic matcher couldn't
// reach" detail llmMatcher.mjs judges a second time. Built on the exact
// same matchClasses() the heuristic metrics use (imported and tested
// directly here too), not a re-derivation that could silently drift.

test("matchClasses is exported and produces the same class pairing computeRecoveryMetrics relies on internally", () => {
  const groundTruth = {
    classes: { incident: { id: "incident", label: "Incident", aliases: ["incident"] } },
  };
  const nodes = [{ id: "n1", label: "Incident", meaning: "", aliases: [] }];
  const { gtToRecovered, recoveredToGt } = matchClasses(groundTruth, nodes);
  assert.deepEqual(gtToRecovered.get("incident"), ["n1"]);
  assert.equal(recoveredToGt.get("n1"), "incident");
});

function twoClassGroundTruth(overrides = {}) {
  return {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      evidence: { id: "evidence", label: "Evidence Item", aliases: ["evidence item"] },
    },
    relationships: [],
    properties: [],
    ...overrides,
  };
}

test("computeMatchDetail lists a gold class as unmatched only when nothing in the recovered nodes matched it, alongside every unmatched recovered node", () => {
  const groundTruth = twoClassGroundTruth();
  const recoveredState = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [] }, // matches gold's Incident
      { id: "n2", label: "Some Invented Class", meaning: "", aliases: [] }, // matches nothing
    ],
    edges: [],
  };
  const detail = computeMatchDetail(groundTruth, recoveredState);
  assert.deepEqual(detail.classes.unmatchedGold.map((c) => c.id), ["evidence"]);
  assert.deepEqual(detail.classes.unmatchedRecovered.map((n) => n.id), ["n2"]);
});

test("computeMatchDetail flags a relationship as unmatched only when its endpoint classes DID match but no edge's label matched -- not when the endpoints themselves never matched", () => {
  const groundTruth = twoClassGroundTruth({
    relationships: [{ id: "rel1", label: "is supported by", fromClassId: "incident", toClassId: "evidence" }],
  });
  // Endpoints matched, but the recovered edge's relation label shares no
  // tokens with "is supported by" -- exactly the kind of case the LLM judge
  // exists for.
  const recoveredState = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [] },
      { id: "n2", label: "Evidence Item", meaning: "", aliases: [] },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", relation: "hasEvidence", aliases: [] }],
  };
  const detail = computeMatchDetail(groundTruth, recoveredState);
  assert.deepEqual(detail.relationships.unmatchedGold.map((r) => r.id), ["rel1"]);
  assert.equal(detail.relationships.unmatchedGold[0].fromClassLabel, "Incident");
  assert.equal(detail.relationships.unmatchedGold[0].toClassLabel, "Evidence Item");
  assert.deepEqual(detail.relationships.unmatchedRecovered.map((e) => e.id), ["e1"]);
});

test("computeMatchDetail excludes a relationship from unmatchedGold when its endpoint classes never matched at all -- that's a class-level miss, not a wording question the LLM judge can fix", () => {
  const groundTruth = twoClassGroundTruth({
    relationships: [{ id: "rel1", label: "is supported by", fromClassId: "incident", toClassId: "evidence" }],
  });
  const recoveredState = {
    nodes: [{ id: "n1", label: "Incident", meaning: "", aliases: [] }], // Evidence never recovered at all
    edges: [],
  };
  const detail = computeMatchDetail(groundTruth, recoveredState);
  assert.deepEqual(detail.relationships.unmatchedGold, []);
});

test("computeMatchDetail excludes a relationship already satisfied by its reciprocal-direction label from unmatchedGold", () => {
  const groundTruth = twoClassGroundTruth({
    relationships: [{ id: "rel1", label: "is supported by", reciprocalLabel: "documents", fromClassId: "incident", toClassId: "evidence" }],
  });
  const recoveredState = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [] },
      { id: "n2", label: "Evidence Item", meaning: "", aliases: [] },
    ],
    // Reverse direction, using the reciprocal label -- already a heuristic match.
    edges: [{ id: "e1", source: "n2", target: "n1", relation: "documents", aliases: [] }],
  };
  const detail = computeMatchDetail(groundTruth, recoveredState);
  assert.deepEqual(detail.relationships.unmatchedGold, []);
  assert.deepEqual(detail.relationships.unmatchedRecovered, []);
});

test("computeMatchDetail lists a property as unmatched only when its host class matched but no property name matched, including what the host node's real properties actually are", () => {
  const groundTruth = twoClassGroundTruth({
    properties: [{ id: "prop1", label: "has severity", classId: "incident", kind: "controlled-value", targetId: "severitySet", allowedValues: ["sev1", "sev2"] }],
  });
  const recoveredState = {
    nodes: [{ id: "n1", label: "Incident", meaning: "", aliases: [], properties: [{ name: "priority", allowed: ["p1", "p2"] }] }],
    edges: [],
  };
  const detail = computeMatchDetail(groundTruth, recoveredState);
  assert.equal(detail.properties.unmatchedGold.length, 1);
  assert.equal(detail.properties.unmatchedGold[0].id, "prop1");
  assert.equal(detail.properties.unmatchedGold[0].hostClassLabel, "Incident");
  assert.deepEqual(detail.properties.unmatchedGold[0].recoveredHostProperties, ["priority"]);
});

test("computeMatchDetail reports a matched controlled-value property's heuristic fidelity score alongside both raw value lists, for the LLM judge to re-score", () => {
  const groundTruth = twoClassGroundTruth({
    properties: [{ id: "prop1", label: "has severity", classId: "incident", kind: "controlled-value", targetId: "severitySet", allowedValues: ["sev1-critical", "sev2-high"] }],
  });
  const recoveredState = {
    nodes: [{ id: "n1", label: "Incident", meaning: "", aliases: [], properties: [{ name: "severity", allowed: ["Critical", "High"] }] }],
    edges: [],
  };
  const detail = computeMatchDetail(groundTruth, recoveredState);
  assert.equal(detail.properties.unmatchedGold.length, 0);
  assert.equal(detail.properties.matchedControlledValue.length, 1);
  const m = detail.properties.matchedControlledValue[0];
  assert.equal(m.id, "prop1");
  assert.deepEqual(m.goldAllowedValues, ["sev1-critical", "sev2-high"]);
  assert.deepEqual(m.recoveredAllowedValues, ["Critical", "High"]);
  // Real heuristic score is low here (different label conventions) -- the whole point of the LLM re-score.
  assert.ok(m.heuristicFidelity < 0.5, `expected a low token-overlap fidelity score, got ${m.heuristicFidelity}`);
});
