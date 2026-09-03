import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import {
  loadGroundTruthModel, scopeGroundTruth, loadRawFixtureText, resolveDomainYamlPath,
  isRecoverableProperty, isRecoverableRelationship, buildReducedActions,
  mergeReciprocalRelationshipPairs,
} from "./evals/lib/groundTruthModel.mjs";
import {
  computeRecoveryMetrics, computeMatchDetail, matchClasses, matchProperties, matchRelationships, computeHeuristicMatchPairs, MATCH_THRESHOLDS,
  matchRules, computeRuleMetrics, computeRuleMatchDetail, matchActions, computeActionMetrics, computeActionMatchDetail,
} from "./evals/lib/recoveryMetrics.mjs";
import { recoveredStateFromYaml } from "./evals/score-baseline.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Issue #133/E18 (external audit): the function's own comment promises
// "three-or-more-way ... groups are left untouched," but the code never
// actually enforced a group-size check -- it would merge the first
// opposite-direction pair it happened to find and silently guess which
// member was the "real" partner, arbitrarily collapsing fwd1+rev1 while
// leaving fwd2 alone. This test used to assert exactly that buggy behavior
// as if it were correct; now asserts the policy the comment always
// described: a 3-member group is left entirely untouched, no merging at all.
test("mergeReciprocalRelationshipPairs leaves a 3+-member class-pair group entirely untouched, per its own documented policy -- does not arbitrarily merge the first opposite-direction pair it finds", () => {
  const relationships = [
    { id: "fwd1", label: "is supported by", fromClassId: "incident", toClassId: "evidence" },
    { id: "rev1", label: "documents", fromClassId: "evidence", toClassId: "incident" },
    { id: "fwd2", label: "is otherwise linked to", fromClassId: "incident", toClassId: "evidence" },
  ];
  const merged = mergeReciprocalRelationshipPairs(relationships);
  assert.equal(merged.length, 3, "no merging at all -- a real, three-or-more-way group, not a reciprocal pair plus an unrelated extra fact");
  for (const rel of merged) assert.equal(rel.reciprocalLabel, undefined, `${rel.id} must not have been merged`);
});

// A self-loop's "opposite direction" is itself (fromClassId === toClassId),
// so the ordinary partner test is vacuously true for any *other* self-loop
// on the same class -- without an explicit exclusion, two unrelated
// self-loop facts on the same class would be incorrectly merged into one
// reciprocal pair (issue #133/E18).
test("mergeReciprocalRelationshipPairs never merges two self-loop relationships on the same class into a reciprocal pair", () => {
  const relationships = [
    { id: "loop1", label: "depends on a peer instance of", fromClassId: "service", toClassId: "service" },
    { id: "loop2", label: "replicates to a peer instance of", fromClassId: "service", toClassId: "service" },
  ];
  const merged = mergeReciprocalRelationshipPairs(relationships);
  assert.equal(merged.length, 2, "both self-loops stay separate, real facts -- not merged into one reciprocal pair");
  for (const rel of merged) assert.equal(rel.reciprocalLabel, undefined);
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

// Found via a deep transcript dig, not a synthetic hypothesis: labelSimilarity's
// STOPWORDS set includes "has"/"have" (module comment above it), so a
// relationship named literally "has" -- one of the most natural relation
// names an LLM defaults to for possession/composition -- tokenizes to an
// EMPTY set once stopwords are stripped, and the unconditional
// `if (!ta.length || !tb.length) return 0` used to make it unmatchable
// against ANY gold relationship regardless of content. Confirmed against a
// real committed run (brick-hvac/run-02): its recovered model correctly
// captures and applies "AirHandlingUnit has AirTemperatureSensor" against
// gold's own "AirHandlingUnit hasPoint AirTemperatureSensor" -- correct
// content, correct class pair, previously scored as a pure recall miss.
// Fixed with a fallback to unstripped tokens, applied SYMMETRICALLY to both
// sides being compared (not decided per-string independently -- an earlier,
// broken draft of this fix let a bare "has" fall back to its own unstripped
// ["has"] while the OTHER side ("has Point") still got stripped down to
// ["point"], leaving disjoint token sets and still scoring 0; the tests
// below pin the symmetric, correct behavior). Measured impact re-scoring
// all 15 real completed live interviews: relationship macro F1 55.4% ->
// 57.8%, zero domains regress (TODO.md's dated entry has the full table).
test("computeRecoveryMetrics: a relationship named literally \"has\" matches gold's \"has Point\" -- previously unconditionally unmatchable, since \"has\" alone tokenizes to an empty stopword-stripped set", () => {
  const groundTruth = {
    classes: {
      ahu: { id: "ahu", label: "Air Handling Unit", aliases: ["air handling unit"] },
      sensor: { id: "sensor", label: "Air Temperature Sensor", aliases: ["air temperature sensor"] },
    },
    relationships: [{ id: "rel_0", label: "has Point", fromClassId: "ahu", toClassId: "sensor" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "Air Handling Unit", meaning: "x", aliases: [], properties: [] },
      { id: "n2", label: "Air Temperature Sensor", meaning: "y", aliases: [], properties: [] },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", relation: "has" }],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.relationships.matched, 1, "a bare \"has\" edge must be able to match a \"has Point\" gold relationship on the right class pair");
  assert.equal(metrics.relationships.recall, 1);
});

test("computeRecoveryMetrics: the \"has\" fallback does not rescue a genuine different-word choice with zero token overlap (still a real, accepted vocabulary gap, not fixed by this)", () => {
  const groundTruth = {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      service: { id: "service", label: "IT Service", aliases: ["it service"] },
    },
    relationships: [{ id: "rel_0", label: "impacts", fromClassId: "incident", toClassId: "service" }],
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
  assert.equal(metrics.relationships.matched, 0, "\"impacts\" vs \"affects\" share zero tokens -- a real synonym gap the stopword fix does not and should not paper over");
});

// --- issue #142: Porter2 stemming ------------------------------------------
//
// Builds the minimal groundTruth/recovered pair the "has" tests above
// construct by hand, for a gold relationship label vs. a recovered relation
// name, and returns whether computeRecoveryMetrics actually credits it as
// matched -- factored out here since this block needs many such pairs.
function relLabelMatched(goldLabel, recoveredRelation) {
  const groundTruth = {
    classes: {
      a: { id: "a", label: "A", aliases: ["a"] },
      b: { id: "b", label: "B", aliases: ["b"] },
    },
    relationships: [{ id: "rel_0", label: goldLabel, fromClassId: "a", toClassId: "b" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "A", meaning: "x", aliases: [], properties: [] },
      { id: "n2", label: "B", meaning: "y", aliases: [], properties: [] },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", relation: recoveredRelation }],
  };
  return computeRecoveryMetrics(groundTruth, recovered).relationships.matched === 1;
}

// The four confirmed-fixable gaps the manual audit behind issues #140-#142
// found -- pure grammatical-inflection mismatches Porter2 stemming closes
// (see ontology_translation/TODO.md's dated entry for the real committed
// runs each of these was found in).
test("Porter2 stemming: gold \"hasLocation\" now matches a recovered \"locatedIn\" (brick-hvac/run-01's real gap)", () => {
  assert.ok(relLabelMatched("hasLocation", "locatedIn"));
});

test("Porter2 stemming: gold \"hasLocation\" now matches a recovered \"locatedOnFloor\" (brick-hvac/run-03's real gap)", () => {
  assert.ok(relLabelMatched("hasLocation", "locatedOnFloor"));
});

test("Porter2 stemming: gold \"secures\" now matches a recovered \"isSecuredByAgreement\" (fibo-loans/run-02's real gap)", () => {
  assert.ok(relLabelMatched("secures", "isSecuredByAgreement"));
});

test("Porter2 stemming: gold \"governsPaymentOf\" now matches a recovered \"governPaymentOfInterest\" (fibo-loans/run-03's real gap)", () => {
  assert.ok(relLabelMatched("governsPaymentOf", "governPaymentOfInterest"));
});

// Explicitly-out-of-scope cases: true vocabulary/synonym gaps, not
// grammatical inflections -- stemming must not paper over these. Confirming
// they STILL fail is as much the point of this feature as confirming the
// four cases above now pass; a stemmer that accidentally widened these
// would be masking a real recovery gap, not fixing one.
test("Porter2 stemming does not rescue \"hasPart\" vs a recovered \"hasFloor\" -- different words, not an inflection (brick-hvac/run-03's real, accepted gap)", () => {
  assert.equal(relLabelMatched("hasPart", "hasFloor"), false);
});

test("Porter2 stemming does not rescue \"hasAgent\" vs a recovered \"involvesCarrier\" -- different words (iof-supply-chain's real, accepted gap)", () => {
  assert.equal(relLabelMatched("hasAgent", "involvesCarrier"), false);
});

test("Porter2 stemming does not rescue \"owns\" vs a recovered \"accountableFor\" -- a true synonym, not an inflection (itops/run-02's real, accepted gap)", () => {
  assert.equal(relLabelMatched("owns", "accountableFor"), false);
});

// Stopword-interaction regression: STOPWORDS is checked against the
// ORIGINAL word, not the stemmed one (see recoveryMetrics.mjs's own
// comment on why -- Porter2 stems "its" to "it", which would otherwise
// need STOPWORDS to carry "it" purely as a stemming artifact). Pins that a
// gold label built entirely from stopwords plus one real word still
// tokenizes to just that one real word, not extra noise from a
// stopword's own stem leaking through.
test("Porter2 stemming does not break stopword filtering: \"its own location\" still tokenizes down to just \"location\"-rooted content", () => {
  assert.ok(relLabelMatched("its own location", "locatedIn"));
});

// The original stopword-symmetric-fallback fix (issue found via the F1
// investigation, already covered above) must survive stemming being added
// on top of it -- a bare "has" still tokenizes to an empty stopword-
// stripped set (STOPWORDS still contains it, unstemmed match), still falls
// back to its own unstripped, now-stemmed token, and that must still equal
// the other side's own stemmed "point" token family.
test("Porter2 stemming does not reintroduce the bare-\"has\" stopword bug: \"has\" still matches gold's \"has Point\"", () => {
  assert.ok(relLabelMatched("has Point", "has"));
});

// Bilingual safety guard (see recoveryMetrics.mjs's own comment on why an
// English stemmer is not applied to non-ASCII tokens): a Hungarian alias
// containing the accented characters this app's own normalize() regex
// explicitly allows must still compare by exact string equality, unaffected
// by the English-only stemmer sitting downstream of that check.
test("Porter2 stemming leaves a Hungarian-alias exact match untouched (bilingual safety guard)", () => {
  const groundTruth = {
    classes: {
      a: { id: "a", label: "A", aliases: ["a"] },
      b: { id: "b", label: "B", aliases: ["b"] },
    },
    relationships: [{ id: "rel_0", label: "szállító kapcsolat", fromClassId: "a", toClassId: "b" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "A", meaning: "x", aliases: [], properties: [] },
      { id: "n2", label: "B", meaning: "y", aliases: [], properties: [] },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", relation: "szállító kapcsolat" }],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.relationships.matched, 1, "an exact Hungarian-string match must still match after adding an English-only stemmer");
});

// Issue #158 audit: confirmed by tracing matchRelationships/
// relationshipLabelMatchesEdge that gold-side relationship aliases ARE
// cross-checked, symmetric with the recovered edge's own aliases -- the
// same tolerance classes get, just gated by REL_PROP_LABEL_MATCH_THRESHOLD
// (0.3) instead of CLASS_LABEL_MATCH_THRESHOLD (0.6). tests/evals/README.md
// previously (incorrectly) said relationships got "none of that" alias
// cross-checking at all -- stale since the 2026-07-30 fix that gave edges a
// real `aliases` field, predating `.domain.yaml`-sourced ground truth
// (issue #104) actually carrying gold-side relationship aliases to check
// against. This test pins the current, correct behavior directly rather
// than leaving it to be re-discovered from a prose claim: neither side's
// bare label matches the other's at all, and the match only exists because
// both sides' aliases are consulted.
test("matchRelationships credits a gold relationship's own alias against a recovered edge's own alias (issue #158)", () => {
  const groundTruth = {
    classes: {
      incident: { id: "incident", label: "Incident", aliases: ["incident"] },
      resolverGroup: { id: "resolverGroup", label: "Resolver Group", aliases: ["resolver group"] },
    },
    // Gold's own recorded label/aliases share zero tokens with the recovered
    // edge's label/aliases below -- the only way this can match at all is via
    // gold's alias against the recovered edge's alias, both sides at once.
    relationships: [{
      id: "rel_0", label: "escalatedTo", aliases: ["routed to"], fromClassId: "incident", toClassId: "resolverGroup",
    }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [], properties: [] },
      { id: "n2", label: "Resolver Group", meaning: "", aliases: [], properties: [] },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", relation: "handedOffTo", aliases: ["routed to"] }],
  };
  const { gtToRecovered } = matchClasses(groundTruth, recovered.nodes);
  const relMatch = matchRelationships(groundTruth, recovered.edges, gtToRecovered);
  assert.equal(relMatch.matches.length, 1, "gold's alias and the recovered edge's alias share real token overlap and must match");
  assert.equal(relMatch.matches[0].goldId, "rel_0");
  assert.equal(relMatch.matches[0].recoveredId, "e1");

  // Negative control: strip both aliases and the same pair must NOT match --
  // proves the match above genuinely came from alias credit, not from some
  // other path (e.g. the class-pair gate alone being enough).
  const groundTruthNoAlias = {
    ...groundTruth,
    relationships: [{ id: "rel_0", label: "escalatedTo", fromClassId: "incident", toClassId: "resolverGroup" }],
  };
  const recoveredNoAlias = { nodes: recovered.nodes, edges: [{ id: "e1", source: "n1", target: "n2", relation: "handedOffTo" }] };
  const relMatchNoAlias = matchRelationships(groundTruthNoAlias, recoveredNoAlias.edges, gtToRecovered);
  assert.equal(relMatchNoAlias.matches.length, 0, "without either side's alias, \"escalatedTo\" and \"handedOffTo\" share no tokens and must not match");
});

// Companion negative case: properties genuinely have no alias concept on
// either side (neither source ground-truth format nor the product's own
// property schema declares one) -- tests/evals/README.md's claim is
// accurate for this dimension specifically, unlike relationships above.
test("matchProperties has no alias concept on either side (issue #158) -- a same-meaning, zero-token-overlap pair does not match", () => {
  const groundTruth = {
    classes: { incident: { id: "incident", label: "Incident", aliases: ["incident"] } },
    relationships: [],
    properties: [{ id: "prop_0", label: "severity", classId: "incident" }],
  };
  const recovered = {
    nodes: [{ id: "n1", label: "Incident", meaning: "", aliases: [], properties: [{ name: "criticality" }] }],
    edges: [],
  };
  const { gtToRecovered } = matchClasses(groundTruth, recovered.nodes);
  const propMatch = matchProperties(groundTruth, recovered.nodes, gtToRecovered);
  assert.equal(propMatch.goldToRecovered.size, 0, "no alias/synonym path exists for properties, so a genuine synonym with zero token overlap cannot match");
});

test("real-data regression (brick-hvac/run-02): the recovered model's real bare-\"has\" edges now match their corresponding gold hasPoint/hasPart relationships", () => {
  const domain = "brick-hvac";
  const runDir = path.resolve(__dirname, "..", "ontology_translation", "results", "multi-domain", "run-02", domain);
  const groundTruth = loadGroundTruthModel({ path: resolveDomainYamlPath(domain), format: "domain-yaml" });
  const { state: recovered } = recoveredStateFromYaml(fs.readFileSync(path.join(runDir, "recovered-model.yaml"), "utf8"));
  const { gtToRecovered } = matchClasses(groundTruth, recovered.nodes);
  const relMatch = matchRelationships(groundTruth, recovered.edges, gtToRecovered);

  const hasEdges = recovered.edges.filter((e) => e.relation === "has");
  assert.ok(hasEdges.length > 0, "expected this real run's recovered model to contain bare-\"has\" edges -- test fixture assumption");
  const matchedRecoveredIds = new Set(relMatch.matches.map((m) => m.recoveredId));
  const matchedHasEdges = hasEdges.filter((e) => matchedRecoveredIds.has(e.id));
  assert.ok(
    matchedHasEdges.length >= hasEdges.length - 1,
    `expected nearly all of this run's ${hasEdges.length} bare-"has" edges to now match a gold relationship (matched: ${matchedHasEdges.length}) -- `
    + "before the stopword-symmetric-fallback fix, none of them ever could, regardless of content",
  );
});

// Real-data regression for issue #142's stemming fix. The manual audit that
// found issues #140-#142 confirmed by hand that brick-hvac/run-01's own
// recovered model correctly captures 4 real "located in/on" facts
// (locatedIn AirHandlingUnit->Building, locatedOn AirHandlingUnit->Floor,
// locatedIn TerminalUnit->Space, locatedIn Thermostat->Space) that gold
// records as hasLocation -- all 4 were unmatchable before Porter2 stemming,
// purely because "located" and "location" are different tokens with zero
// Jaccard overlap, not because the content was wrong.
test("real-data regression (brick-hvac/run-01): the recovered model's real \"locatedIn\"/\"locatedOn\" edges now match gold's hasLocation relationships", () => {
  const domain = "brick-hvac";
  const runDir = path.resolve(__dirname, "..", "ontology_translation", "results", "multi-domain", "run-01", domain);
  const groundTruth = loadGroundTruthModel({ path: resolveDomainYamlPath(domain), format: "domain-yaml" });
  const { state: recovered } = recoveredStateFromYaml(fs.readFileSync(path.join(runDir, "recovered-model.yaml"), "utf8"));
  const { gtToRecovered } = matchClasses(groundTruth, recovered.nodes);
  const relMatch = matchRelationships(groundTruth, recovered.edges, gtToRecovered);

  const locatedEdges = recovered.edges.filter((e) => e.relation === "locatedIn" || e.relation === "locatedOn");
  assert.equal(locatedEdges.length, 4, "expected this real run's recovered model to contain exactly 4 locatedIn/locatedOn edges -- test fixture assumption");
  const matchedRecoveredIds = new Set(relMatch.matches.map((m) => m.recoveredId));
  const matchedLocatedEdges = locatedEdges.filter((e) => matchedRecoveredIds.has(e.id));
  assert.equal(
    matchedLocatedEdges.length, 4,
    `expected all 4 of this run's locatedIn/locatedOn edges to now match a gold hasLocation relationship (matched: ${matchedLocatedEdges.length}) -- `
    + "before Porter2 stemming, none of them ever could, since \"located\" and \"location\" shared zero tokens",
  );

  // Every one of the 4 edges must be matched against gold's own
  // hasLocation relationship specifically, not some unrelated gold
  // relationship that happens to also clear the threshold now that
  // stemming is in play.
  const relById = new Map(groundTruth.relationships.map((r) => [r.id, r]));
  for (const e of locatedEdges) {
    const match = relMatch.matches.find((m) => m.recoveredId === e.id);
    assert.ok(match, `expected ${e.relation} (${e.id}) to be matched`);
    const rel = relById.get(match.goldId);
    // loadDomainYamlGroundTruthModel() derives .label from the raw YAML key
    // via buildDomainYamlLabel (camelCase -> space-separated), so gold's
    // own "hasLocation" key reads as the label "has Location" here.
    assert.equal(rel.label, "has Location", `${e.relation} (${e.id}) matched ${match.goldId} ("${rel.label}"), expected gold's hasLocation`);
  }
});

// Overstemming regression, found by hand-checking the #142 rescore's actual
// output rather than by a synthetic case: Porter2 stems "planned" (the
// "scheduled" sense, an adjective on Start/End) down to "plan" (the
// "document" sense), so before this exception a property named
// "implementation Plan" spuriously shared a token with "plannedStart" on
// nothing but that collision -- confirmed live against itops/run-02's own
// recovered model, where the practical-scope property matcher (the two
// real "Change.planned*" gold properties that would otherwise win those
// recovered slots are out of scope there) matched Change.implementationPlan
// -> "plannedStart" and Change.backoutPlan -> "plannedEnd" at weight 0.333,
// clearing REL_PROP_LABEL_MATCH_THRESHOLD (0.3) on a single coincidental
// shared token. STEM_EXCEPTIONS (recoveryMetrics.mjs) keeps "planned"
// unstemmed to close this; a global threshold change was rejected instead
// (see that exception's own comment for the corpus-wide scan that ruled it
// out -- many other correct matches sit at that identical weight).
function propLabelMatched(goldPropLabel, recoveredPropName) {
  const groundTruth = {
    classes: { a: { id: "a", label: "A", aliases: ["a"] } },
    relationships: [],
    properties: [{ id: "a.prop", label: goldPropLabel, classId: "a" }],
  };
  const recovered = {
    nodes: [{ id: "n1", label: "A", meaning: "x", aliases: [], properties: [{ name: recoveredPropName }] }],
    edges: [],
  };
  return computeRecoveryMetrics(groundTruth, recovered).properties.matched === 1;
}

test("Porter2 stemming does not conflate \"implementation Plan\" with \"plannedStart\" -- \"planned\" (scheduled) and \"Plan\" (document) are different words that happen to share a Porter2 stem (itops/run-02's real false positive, now closed)", () => {
  assert.equal(propLabelMatched("implementation Plan", "plannedStart"), false);
  assert.equal(propLabelMatched("backout Plan", "plannedEnd"), false);
});

test("the \"planned\" stem exception is narrow: \"planning\" and \"plans\" still stem normally and still match a gold \"Plan\" property", () => {
  assert.ok(propLabelMatched("recovery Plan", "recoveryPlanning"));
  assert.ok(propLabelMatched("recovery Plan", "recoveryPlans"));
});

test("real-data regression (itops/run-02): Change.implementationPlan and Change.backoutPlan stay correctly unmatched in practical scope, where the two real Change.planned* gold properties that would otherwise claim those recovered slots are out of scope", () => {
  const domain = "itops";
  const runDir = path.resolve(__dirname, "..", "ontology_translation", "results", "multi-domain-control", "run-02", domain);
  const full = loadGroundTruthModel({ path: resolveDomainYamlPath(domain), format: "domain-yaml" });
  const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
  const { state: recovered } = recoveredStateFromYaml(fs.readFileSync(path.join(runDir, "recovered-model.yaml"), "utf8"));
  const { gtToRecovered } = matchClasses(scoped, recovered.nodes);
  const propMatch = matchProperties(scoped, recovered.nodes, gtToRecovered);
  assert.ok(!propMatch.goldToRecovered.has("Change.implementationPlan"), "Change.implementationPlan must not match anything in practical scope");
  assert.ok(!propMatch.goldToRecovered.has("Change.backoutPlan"), "Change.backoutPlan must not match anything in practical scope");
});

// Issue #133/E2 (external audit): relationship precision previously came
// from two independent existential `.some()` scans instead of a one-to-one
// bipartite assignment, so N recovered edges all matching the same one gold
// relationship all counted toward precision's numerator. Demonstrated by
// the audit: 5 identical parallel edges for 1 gold relationship scored
// precision=1.00 instead of the true 1/5=0.20. matchRelationships (reused
// by computeRecoveryMetrics) fixes this the same way matchClasses/
// matchProperties/matchRules/matchActions already work.
test("computeRecoveryMetrics: relationship precision is one-to-one -- N parallel duplicate edges for 1 gold relationship do not each count toward precision", () => {
  const groundTruth = {
    classes: {
      a: { id: "a", label: "A", aliases: ["a"] },
      b: { id: "b", label: "B", aliases: ["b"] },
    },
    relationships: [{ id: "a_serves_b", label: "serves", fromClassId: "a", toClassId: "b" }],
    properties: [],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "A", meaning: "x", aliases: [], properties: [] },
      { id: "n2", label: "B", meaning: "y", aliases: [], properties: [] },
    ],
    edges: Array.from({ length: 5 }, (_, i) => ({ id: `e${i}`, source: "n1", target: "n2", relation: "serves" })),
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.relationships.matched, 1, "still exactly 1 gold relationship recovered, not double-counted");
  assert.equal(metrics.relationships.recall, 1);
  assert.equal(metrics.relationships.precision, 0.2, "only 1 of the 5 recovered edges can be credited -- the other 4 are surplus, same discipline as duplicate classes/properties");
});

// Real-data regression, added after a post-merge dig into #133's own
// numbers: brick-hvac/run-02 (one of the 12 committed live re-run results)
// scored an unusually low relationship F1 (0.20), and a first look at
// heuristic-matches.json appeared to show every matched pair pointing at
// the WRONG recovered edge (e.g. gold "feeds AirHandlingUnit->AirPlenum"
// seemingly matched to a recovered "feeds AirHandlingUnit->TerminalUnit"
// edge) -- which would have been a real bipartite-matching bug. It wasn't:
// the apparent mismatch was an off-by-one in the *investigation* itself
// (gold relationship ids are `rel_${index}` from a 0-indexed Array.map;
// the ad-hoc check that first spotted this used 1-indexed labels). Once
// corrected, every one of that run's 6 matched pairs is exactly right.
// This test makes that verification permanent and automatic instead of
// something only discoverable by hand-reading JSON with the right ids:
// for a real committed run with genuinely low recall, every pair
// matchRelationships reports must have a recovered edge whose actual
// source/target node labels correspond to the matched gold relationship's
// actual fromClassId/toClassId labels -- not merely "some edge with the
// right relation name landed on some gold relationship of the same name",
// which is exactly the shape a real class-pair-gating bug would produce.
test("matchRelationships on a real committed low-recall run (brick-hvac/run-02): every matched pair's recovered edge genuinely connects the same two classes as its gold relationship", () => {
  const domain = "brick-hvac";
  const runDir = path.resolve(__dirname, "..", "ontology_translation", "results", "multi-domain", "run-02", domain);
  const groundTruth = loadGroundTruthModel({ path: resolveDomainYamlPath(domain), format: "domain-yaml" });
  const recoveredYamlText = fs.readFileSync(path.join(runDir, "recovered-model.yaml"), "utf8");
  const { state: recovered } = recoveredStateFromYaml(recoveredYamlText);

  const { gtToRecovered } = matchClasses(groundTruth, recovered.nodes);
  const relMatch = matchRelationships(groundTruth, recovered.edges, gtToRecovered);

  assert.ok(relMatch.matches.length >= 4, "expected this real low-recall run to still have several matched relationships to check -- test fixture assumption");

  const relById = new Map(groundTruth.relationships.map((r) => [r.id, r]));
  const nodeById = new Map(recovered.nodes.map((n) => [n.id, n]));
  const edgeById = new Map(recovered.edges.map((e) => [e.id, e]));

  for (const { goldId, recoveredId } of relMatch.matches) {
    const rel = relById.get(goldId);
    const edge = edgeById.get(recoveredId);
    assert.ok(rel, `matched goldId ${goldId} must be a real gold relationship`);
    assert.ok(edge, `matched recoveredId ${recoveredId} must be a real recovered edge`);

    const expectedFromLabel = groundTruth.classes[rel.fromClassId].label;
    const expectedToLabel = groundTruth.classes[rel.toClassId].label;
    const edgeFromLabel = nodeById.get(edge.source)?.label;
    const edgeToLabel = nodeById.get(edge.target)?.label;

    // Alphanumeric-only, case-insensitive comparison -- matchClasses itself
    // treats "Outside-Air CO2 Sensor" (recovered) and "Outside Air CO2
    // Sensor" (gold) as the same class (its own label-matching normalizes
    // punctuation the same way), and this test should agree with the real
    // matcher's own notion of "the same class", not a stricter one of its
    // own that happens to reject a real, correct match on formatting alone.
    const canon = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    // Either the forward pairing or (for a reciprocal relationship) the
    // swapped one is legitimate -- matchRelationships itself allows both --
    // but it must be one of exactly those two, never some other class pair
    // entirely.
    const forwardMatch = canon(edgeFromLabel) === canon(expectedFromLabel) && canon(edgeToLabel) === canon(expectedToLabel);
    const reciprocalMatch = canon(edgeFromLabel) === canon(expectedToLabel) && canon(edgeToLabel) === canon(expectedFromLabel);
    assert.ok(
      forwardMatch || reciprocalMatch,
      `${goldId} (${rel.label}: ${expectedFromLabel} -> ${expectedToLabel}) matched to ${recoveredId} `
      + `(${edge.relation}: ${edgeFromLabel} -> ${edgeToLabel}) -- recovered edge does not connect the same two classes as the gold relationship`,
    );
  }
});

// Real-data regression for issue #141's bipartite-matching fix. Before the
// fix, fibo-loans/run-01's own heuristic-matches.json assigned gold
// `InterestPaymentTerms` to the recovered model's orphaned `InterestTerms`
// stub node (weight ~0.667) and let a different, unrelated gold class
// (`InterestPayment`, an event class the run never actually recovered) claim
// the real, identically-named `InterestPaymentTerms` recovered node instead
// (also ~0.667) -- because 0.667+0.667 beat the objectively correct 1.0+0
// under plain sum-maximization. Same shape for `InterestRateResetSchedule`
// vs. the orphaned `RateResetSchedule` stub and `InterestRateReset`. See
// ontology_translation/TODO.md's dated entry for the full audit.
test("real-data regression (fibo-loans/run-01): matchClasses assigns InterestPaymentTerms/InterestRateResetSchedule to their real, identically-named recovered nodes, not decoy stubs (issue #141)", () => {
  const domain = "fibo-loans";
  const runDir = path.resolve(__dirname, "..", "ontology_translation", "results", "multi-domain", "run-01", domain);
  const groundTruth = loadGroundTruthModel({ path: resolveDomainYamlPath(domain), format: "domain-yaml" });
  const { state: recovered } = recoveredStateFromYaml(fs.readFileSync(path.join(runDir, "recovered-model.yaml"), "utf8"));
  const { gtToRecovered } = matchClasses(groundTruth, recovered.nodes);

  const nodeIdByLabel = new Map(recovered.nodes.map((n) => [n.label, n.id]));

  const iptNodeId = nodeIdByLabel.get("InterestPaymentTerms");
  assert.ok(iptNodeId, "expected this real run to contain a recovered node literally named InterestPaymentTerms -- test fixture assumption");
  assert.deepEqual(
    gtToRecovered.get("InterestPaymentTerms"), [iptNodeId],
    "gold InterestPaymentTerms must match the real, identically-named recovered node, not be traded down to the InterestTerms decoy stub"
  );
  // The event class genuinely has no recovered counterpart in this run
  // (confirmed by the original manual audit) and must now be correctly
  // unmatched, not credited via a node stolen from InterestPaymentTerms.
  assert.equal(gtToRecovered.has("InterestPayment"), false);

  const irrsNodeId = nodeIdByLabel.get("InterestRateResetSchedule");
  assert.ok(irrsNodeId, "expected this real run to contain a recovered node literally named InterestRateResetSchedule -- test fixture assumption");
  assert.deepEqual(gtToRecovered.get("InterestRateResetSchedule"), [irrsNodeId]);
  assert.equal(gtToRecovered.has("InterestRateReset"), false);
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

// Issue #133/E6 (external audit): recoveryEffectiveness used to silently
// average 3 components when no controlled-value property was ever matched
// and 4 when one was -- the same field name meaning two different,
// incomparable computations depending on what a run happened to touch. Now
// fixed at exactly 3 components always; the 4-component variant is a
// separate, distinctly-named field.
test("computeRecoveryMetrics: recoveryEffectiveness is always the fixed 3-component average, never silently 4, even when a controlled-value property matches", () => {
  const groundTruth = twoClassGroundTruth({
    properties: [{ id: "prop1", label: "has severity", classId: "incident", kind: "controlled-value", targetId: "severitySet", allowedValues: ["sev1", "sev2"] }],
  });
  const recoveredState = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [], properties: [{ name: "severity", allowed: ["sev1", "sev2"] }] },
      { id: "n2", label: "Evidence Item", meaning: "", aliases: [] },
    ],
    edges: [],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recoveredState);
  assert.ok(metrics.controlledValueFidelity !== null, "a controlled-value property was matched -- fidelity must be computed");
  const expectedCore = (metrics.classes.f1 + metrics.relationships.f1 + metrics.properties.f1) / 3;
  assert.ok(Math.abs(metrics.recoveryEffectiveness - expectedCore) < 1e-9, "recoveryEffectiveness must be the fixed 3-component average, not folding in fidelity");
  const expectedWithFidelity = (metrics.classes.f1 + metrics.relationships.f1 + metrics.properties.f1 + metrics.controlledValueFidelity) / 4;
  assert.ok(Math.abs(metrics.recoveryEffectivenessWithFidelity - expectedWithFidelity) < 1e-9);
  assert.equal(metrics.controlledValuePropertyGoldTotal, 1);
  assert.equal(metrics.controlledValuePropertyMatchedCount, 1);
});

test("computeRecoveryMetrics: recoveryEffectivenessWithFidelity is null (not silently equal to recoveryEffectiveness) when no controlled-value property was ever matched", () => {
  const groundTruth = loadGroundTruthModel();
  const metrics = computeRecoveryMetrics(groundTruth, { nodes: [], edges: [] });
  assert.equal(metrics.recoveryEffectivenessWithFidelity, null);
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

// Regression test for an external reviewer's confirmed finding: one
// recovered node whose aliases Jaccard-overlap two different gold classes
// used to be counted as recovering *both* (recall inflated, since it counts
// per gold class; precision not, since it dedupes per node) -- the reported
// real example was an "Incident Commander" node's "major incident manager"
// alias clearing the threshold against both incidentCommander and
// majorIncident. matchClasses must now assign that node to only the
// better-scoring gold class, one-to-one.
test("matchClasses assigns one recovered node overlapping two gold classes to only the better-scoring class, not both", () => {
  const groundTruth = {
    classes: {
      incidentCommander: { id: "incidentCommander", label: "Incident Commander", aliases: ["incident commander"] },
      majorIncident: { id: "majorIncident", label: "Major Incident", aliases: ["major incident", "major incident manager"] },
    },
  };
  // A single recovered node whose own alias list happens to also clear the
  // Jaccard threshold against the majorIncident class's alias (0.6, right at
  // CLASS_LABEL_MATCH_THRESHOLD -- confirmed by direct computation), in
  // addition to its primary label matching incidentCommander exactly (1.0).
  const nodes = [{ id: "n7", label: "Incident Commander", meaning: "", aliases: ["major incident manager on call"] }];
  const { gtToRecovered, recoveredToGt } = matchClasses(groundTruth, nodes);

  const matchedClassCount = [...gtToRecovered.values()].filter((ids) => ids.length).length;
  assert.equal(matchedClassCount, 1, "only one gold class may claim the single recovered node");
  assert.equal(recoveredToGt.get("n7"), "incidentCommander", "the exact-label match should win over the looser alias-only match");
  assert.equal(gtToRecovered.has("majorIncident"), false, "majorIncident must be left unmatched, not double-counted");
});

// Same shape, but the conflict is on the recovered side: two different
// recovered nodes both plausibly match one gold class. Only one may claim
// it -- the other stays unmatched rather than inflating precision's
// denominator coverage for a class it didn't actually distinguish.
test("matchClasses assigns one gold class claimed by two recovered nodes to only the better-scoring node", () => {
  const groundTruth = {
    classes: { serviceOwner: { id: "serviceOwner", label: "Service Owner", aliases: ["service owner", "business service owner"] } },
  };
  const nodes = [
    { id: "n1", label: "Service Owner", meaning: "", aliases: [] },
    // Scores 0.75 against the gold class's "business service owner" alias
    // (confirmed by direct computation) -- above threshold, but below n1's
    // 1.0 exact match, so this is a real but losing candidate, not a tie.
    { id: "n2", label: "Business Owner", meaning: "", aliases: ["business service owner group"] },
  ];
  const { gtToRecovered, recoveredToGt } = matchClasses(groundTruth, nodes);
  assert.deepEqual(gtToRecovered.get("serviceOwner"), ["n1"], "the exact label match should win");
  assert.equal(recoveredToGt.get("n1"), "serviceOwner");
  assert.equal(recoveredToGt.has("n2"), false, "the displaced node must not also claim the class");
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

// computeHeuristicMatchPairs -- the tests/evals/results/heuristic-matches.json
// source data (reportGenerator.mjs's new writer). Exercises all three
// matched-pair kinds against one shared fixture.
test("computeHeuristicMatchPairs reports exactly which gold item matched which recovered item, for classes, relationships, and properties", () => {
  const groundTruth = twoClassGroundTruth({
    relationships: [{ id: "rel1", label: "is supported by", fromClassId: "incident", toClassId: "evidence" }],
    properties: [{ id: "prop1", label: "severity", classId: "incident" }],
  });
  const recoveredState = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [], properties: [{ name: "severity", allowed: [] }] },
      { id: "n2", label: "Evidence Item", meaning: "", aliases: [] },
      { id: "n3", label: "Unrelated Node", meaning: "", aliases: [] }, // matches nothing, must not appear anywhere
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", relation: "is supported by", aliases: [] }],
  };
  const pairs = computeHeuristicMatchPairs(groundTruth, recoveredState);

  assert.equal(pairs.classes.length, 2);
  const classById = new Map(pairs.classes.map((p) => [p.goldId, p]));
  assert.equal(classById.get("incident").recoveredId, "n1");
  assert.equal(classById.get("evidence").recoveredId, "n2");
  assert.ok(classById.get("incident").weight > 0, "class matches should carry the similarity weight, not just the pairing");

  assert.deepEqual(pairs.relationships, [{ goldId: "rel1", edgeId: "e1", direction: "forward" }]);
  assert.deepEqual(pairs.properties, [{ goldId: "prop1", hostNodeId: "n1", matchedPropertyName: "severity" }]);
});

test("computeHeuristicMatchPairs returns empty arrays, not a crash, when nothing matches at all", () => {
  const groundTruth = twoClassGroundTruth({
    relationships: [{ id: "rel1", label: "is supported by", fromClassId: "incident", toClassId: "evidence" }],
    properties: [{ id: "prop1", label: "severity", classId: "incident" }],
  });
  const pairs = computeHeuristicMatchPairs(groundTruth, { nodes: [], edges: [] });
  assert.deepEqual(pairs, { classes: [], relationships: [], properties: [] });
});

test("computeHeuristicMatchPairs records a reciprocal-direction relationship match with direction: \"reciprocal\"", () => {
  const groundTruth = twoClassGroundTruth({
    relationships: [{ id: "rel1", label: "is supported by", reciprocalLabel: "documents", fromClassId: "incident", toClassId: "evidence" }],
  });
  const recoveredState = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [] },
      { id: "n2", label: "Evidence Item", meaning: "", aliases: [] },
    ],
    edges: [{ id: "e1", source: "n2", target: "n1", relation: "documents", aliases: [] }],
  };
  const pairs = computeHeuristicMatchPairs(groundTruth, recoveredState);
  assert.deepEqual(pairs.relationships, [{ goldId: "rel1", edgeId: "e1", direction: "reciprocal" }]);
});

// PROPERTY MATCHING IS ONE-TO-ONE, AND HAS A PRECISION -----------------
// The property-level form of the many-to-one defect an external review found
// at class level: one recovered property could satisfy several gold
// properties at once, inflating recall against a dimension that had no
// precision figure to pay for it.
test("matchProperties assigns one recovered property overlapping two gold properties to only the better-scoring one", () => {
  const groundTruth = {
    classes: { incident: { id: "incident", label: "Incident", aliases: ["incident"] } },
    relationships: [],
    properties: [
      { id: "incident_has_status", label: "has status", classId: "incident", allowedValues: null },
      { id: "incident_has_status_reason", label: "has status reason", classId: "incident", allowedValues: null },
    ],
  };
  const recovered = {
    nodes: [{ id: "n1", label: "Incident", meaning: "", aliases: [], properties: [{ name: "status", type: "text", allowed: [] }] }],
    edges: [],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.properties.matched, 1, "one recovered property can satisfy exactly one gold property, not both");
  assert.equal(metrics.properties.precision, 1, "and that single recovered property is fully accounted for on the precision side");
});

test("property precision is denominated on every recovered property, including ones on classes gold never matched", () => {
  const groundTruth = {
    classes: { incident: { id: "incident", label: "Incident", aliases: ["incident"] } },
    relationships: [],
    properties: [{ id: "incident_has_status", label: "has status", classId: "incident", allowedValues: null }],
  };
  const recovered = {
    nodes: [
      { id: "n1", label: "Incident", meaning: "", aliases: [], properties: [{ name: "status", type: "text", allowed: [] }, { name: "colour", type: "text", allowed: [] }] },
      // A class gold has no counterpart for at all -- its properties still
      // count against precision, the same way the class itself counts
      // against class precision.
      { id: "n2", label: "Weather", meaning: "", aliases: [], properties: [{ name: "temperature", type: "number", allowed: [] }] },
    ],
    edges: [],
  };
  const metrics = computeRecoveryMetrics(groundTruth, recovered);
  assert.equal(metrics.properties.matched, 1);
  assert.equal(metrics.properties.recall, 1);
  assert.equal(metrics.properties.recoveredTotal, 3);
  assert.equal(metrics.properties.precision, 1 / 3);
  assert.equal(metrics.properties.f1, (2 * 1 * (1 / 3)) / (1 + 1 / 3));
});

test("computeMatchDetail never offers the LLM judge a recovered property the deterministic assignment already consumed", () => {
  const groundTruth = {
    classes: { incident: { id: "incident", label: "Incident", aliases: ["incident"] } },
    relationships: [],
    properties: [
      { id: "incident_has_status", label: "has status", classId: "incident", allowedValues: null },
      { id: "incident_has_severity", label: "has severity", classId: "incident", allowedValues: null },
    ],
  };
  const recovered = {
    nodes: [{ id: "n1", label: "Incident", meaning: "", aliases: [], properties: [{ name: "status", type: "text", allowed: [] }] }],
    edges: [],
  };
  const detail = computeMatchDetail(groundTruth, recovered);
  const severity = detail.properties.unmatchedGold.find((g) => g.id === "incident_has_severity");
  assert.ok(severity, "severity is unmatched and should be offered to the judge");
  assert.deepEqual(severity.recoveredHostProperties, [], "but 'status' is already taken by has-status, so there is nothing left to offer");
});

// Thresholds are parameters, so threshold-sensitivity.mjs can sweep them.
test("computeRecoveryMetrics accepts explicit thresholds and defaults to MATCH_THRESHOLDS", () => {
  const groundTruth = {
    classes: { incident: { id: "incident", label: "Major Incident", aliases: ["major incident"] } },
    relationships: [],
    properties: [],
  };
  const recovered = { nodes: [{ id: "n1", label: "Incident", meaning: "", aliases: [], properties: [] }], edges: [] };
  // "incident" vs "major incident": Jaccard 0.5 -- below the 0.6 default,
  // above a 0.4 sweep point.
  assert.equal(computeRecoveryMetrics(groundTruth, recovered).classes.matched, 0);
  assert.equal(computeRecoveryMetrics(groundTruth, recovered, MATCH_THRESHOLDS).classes.matched, 0);
  assert.equal(computeRecoveryMetrics(groundTruth, recovered, { class: 0.4, relationshipOrProperty: 0.3 }).classes.matched, 1);
});

// RULES AND ACTIONS (issue #105) ------------------------------------------
// Same convention as everything above: synthetic ground truth/recovered
// objects built inline, no new domain fixture files needed (the issue's
// own instruction to keep any new fixtures under ontology_translation/
// domains/ is honored vacuously -- none of these tests need one, matching
// how every existing test in this file already works).

test("matchRules finds a rule via real condition-text overlap even when its name is completely different -- name alone is insufficient, but is not required either", () => {
  const groundTruth = {
    rules: [{ id: "g1", label: "needsCoolingFromSetpoint", conditions: ["measured air temperature is above the applicable cooling temperature setpoint"] }],
  };
  const recoveredRules = [{ id: "r1", name: "totallyUnrelatedRuleName", conditions: ["measured air temperature is above the applicable cooling temperature setpoint"] }];
  const { gtToRecovered } = matchRules(groundTruth, recoveredRules);
  assert.equal(gtToRecovered.get("g1"), "r1");
});

test("matchRules does NOT match on a similar name alone when the condition text has essentially no real overlap", () => {
  const groundTruth = {
    rules: [{ id: "g1", label: "needsCoolingFromSetpoint", conditions: ["measured air temperature is above the applicable cooling temperature setpoint"] }],
  };
  const recoveredRules = [{ id: "r1", name: "needsCoolingFromSetpoint", conditions: ["the system requires a scheduled maintenance inspection"] }];
  const { gtToRecovered } = matchRules(groundTruth, recoveredRules);
  assert.equal(gtToRecovered.size, 0, "a matching name with a genuinely unrelated condition must not count as recovered");
});

test("computeRuleMetrics reports recall/precision/F1 and degrades to 0, not NaN, with no gold rules or no recovered rules", () => {
  const groundTruth = { rules: [{ id: "g1", label: "x", conditions: ["a"] }] };
  assert.deepEqual(computeRuleMetrics(groundTruth, []).recall, 0);
  assert.deepEqual(computeRuleMetrics({ rules: [] }, [{ id: "r1", name: "x", conditions: ["a"] }]).precision, 0);
  const perfect = computeRuleMetrics(groundTruth, [{ id: "r1", name: "x", conditions: ["a"] }]);
  assert.equal(perfect.recall, 1);
  assert.equal(perfect.precision, 1);
  assert.equal(perfect.f1, 1);
});

test("matchRules maintains one-to-one assignment: two recovered rules both plausible for one gold rule are not both credited", () => {
  const groundTruth = {
    rules: [{ id: "g1", label: "needsCoolingFromSetpoint", conditions: ["measured air temperature is above the cooling temperature setpoint"] }],
  };
  const recoveredRules = [
    { id: "r1", name: "needsCoolingFromSetpoint", conditions: ["measured air temperature is above the cooling temperature setpoint"] },
    { id: "r2", name: "coolingSetpointExceeded", conditions: ["measured air temperature is above the cooling temperature setpoint"] },
  ];
  const { gtToRecovered, recoveredToGt } = matchRules(groundTruth, recoveredRules);
  assert.equal(gtToRecovered.size, 1);
  assert.equal(recoveredToGt.size, 1, "only one of the two candidates should be consumed by the single gold rule");
});

test("computeRuleMatchDetail lists a gold rule as unmatched only when nothing recovered matched it", () => {
  const groundTruth = { rules: [{ id: "g1", label: "x", conditions: ["a real condition"] }, { id: "g2", label: "y", conditions: ["another real condition"] }] };
  const recoveredRules = [{ id: "r1", name: "x", conditions: ["a real condition"] }];
  const detail = computeRuleMatchDetail(groundTruth, recoveredRules);
  assert.equal(detail.unmatchedGold.length, 1);
  assert.equal(detail.unmatchedGold[0].id, "g2");
  assert.equal(detail.unmatchedRecovered.length, 0);
});

function actionGroundTruth(actions) {
  return {
    classes: {
      AirHandlingUnit: { id: "AirHandlingUnit", label: "Air Handling Unit", aliases: ["air handling unit"] },
      Zone: { id: "Zone", label: "Zone", aliases: ["zone"] },
    },
    relationships: [], properties: [], rules: [], actions,
  };
}

test("matchActions identifies an action by name even when its effect is wrong -- identification and effect recovery are separate questions", () => {
  const groundTruth = actionGroundTruth([{
    id: "increaseCooling", label: "increaseCooling", primaryInputClassId: "AirHandlingUnit",
    preconditions: [], effect: "the cooling path is commanded to reduce air temperature toward the cooling setpoint", verification: "",
  }]);
  const recoveredState = {
    nodes: [{ id: "n1", label: "Air Handling Unit", meaning: "", aliases: [], properties: [] }], edges: [],
    rules: [],
    actions: [{ id: "a1", name: "increaseCooling", inputClassId: "n1", preconditions: [], effect: "the unit is powered off entirely", verification: "" }],
  };
  const metrics = computeActionMetrics(groundTruth, recoveredState);
  assert.equal(metrics.identification.matched, 1, "same-name action must still be identified");
  assert.ok(metrics.effectRecovery < 0.2, `wrong effect should score low, got ${metrics.effectRecovery}`);
});

test("computeActionMetrics: correct effect but wrong input class scores each component independently", () => {
  const groundTruth = actionGroundTruth([{
    id: "increaseCooling", label: "increaseCooling", primaryInputClassId: "AirHandlingUnit",
    preconditions: [], effect: "the cooling path is commanded to reduce air temperature toward the cooling setpoint", verification: "",
  }]);
  const recoveredState = {
    nodes: [
      { id: "n1", label: "Air Handling Unit", meaning: "", aliases: [], properties: [] },
      { id: "n2", label: "Zone", meaning: "", aliases: [], properties: [] },
    ],
    edges: [],
    rules: [],
    actions: [{
      id: "a1", name: "increaseCooling", inputClassId: "n2" /* wrong -- should be n1, the AHU */,
      preconditions: [], effect: "the cooling path is commanded to reduce air temperature toward the cooling setpoint", verification: "",
    }],
  };
  const metrics = computeActionMetrics(groundTruth, recoveredState);
  assert.equal(metrics.identification.matched, 1);
  assert.equal(metrics.inputClassAccuracy, 0, "wrong input class must score 0, not be silently ignored");
  assert.ok(metrics.effectRecovery > 0.8, `correct effect should still score high, got ${metrics.effectRecovery}`);
});

test("computeActionMetrics: partial precondition recovery is a real fraction, not rounded to 0 or 1", () => {
  const groundTruth = actionGroundTruth([{
    id: "declareMajor", label: "declareMajor", primaryInputClassId: "AirHandlingUnit",
    preconditions: ["incident severity is sev1 critical or sev2 high", "at least one impacted service is identified", "a commander has been assigned"],
    effect: "", verification: "",
  }]);
  const recoveredState = {
    nodes: [{ id: "n1", label: "Air Handling Unit", meaning: "", aliases: [], properties: [] }], edges: [],
    rules: [{ id: "r1", name: "sevCheck", conditions: ["incident severity is sev1 critical or sev2 high"] }],
    actions: [{ id: "a1", name: "declareMajor", inputClassId: "n1", preconditions: ["r1"], effect: "", verification: "" }],
  };
  const metrics = computeActionMetrics(groundTruth, recoveredState);
  assert.ok(metrics.preconditionRecovery > 0 && metrics.preconditionRecovery < 1, `expected a real partial score, got ${metrics.preconditionRecovery}`);
});

test("computeActionMetrics does not penalize a component field that is genuinely absent from the reference domain -- null, not 0", () => {
  const groundTruth = actionGroundTruth([{
    id: "noop", label: "noop", primaryInputClassId: "AirHandlingUnit",
    preconditions: [], effect: "", verification: "",
  }]);
  const recoveredState = {
    nodes: [{ id: "n1", label: "Air Handling Unit", meaning: "", aliases: [], properties: [] }], edges: [],
    rules: [],
    actions: [{ id: "a1", name: "noop", inputClassId: "n1", preconditions: [], effect: "did something unexpected", verification: "checked something" }],
  };
  const metrics = computeActionMetrics(groundTruth, recoveredState);
  assert.equal(metrics.preconditionRecovery, null, "gold had no preconditions -- must be n/a, not a penalized 0");
  assert.equal(metrics.effectRecovery, null, "gold had no effect -- must be n/a, not a penalized 0");
  assert.equal(metrics.verificationRecovery, null, "gold had no verification -- must be n/a, not a penalized 0");
});

test("matchActions maintains one-to-one assignment: a duplicated recovered action cannot satisfy two different gold actions at once", () => {
  const groundTruth = actionGroundTruth([
    { id: "increaseCooling", label: "increaseCooling", primaryInputClassId: "AirHandlingUnit", preconditions: [], effect: "", verification: "" },
    { id: "increaseCoolingSlightly", label: "increaseCoolingSlightly", primaryInputClassId: "AirHandlingUnit", preconditions: [], effect: "", verification: "" },
  ]);
  const recoveredActions = [{ id: "a1", name: "increaseCooling", inputClassId: "n1", preconditions: [], effect: "", verification: "" }];
  const { gtToRecovered, recoveredToGt } = matchActions(groundTruth, recoveredActions);
  assert.ok(gtToRecovered.size <= 1, "one recovered action cannot be credited to two different gold actions");
  assert.equal(recoveredToGt.size, gtToRecovered.size);
});

test("computeActionMatchDetail lists a gold action as unmatched only when nothing recovered matched it", () => {
  const groundTruth = actionGroundTruth([
    { id: "increaseCooling", label: "increaseCooling", primaryInputClassId: "AirHandlingUnit", preconditions: [], effect: "", verification: "" },
    { id: "enableEconomizer", label: "enableEconomizer", primaryInputClassId: "AirHandlingUnit", preconditions: [], effect: "", verification: "" },
  ]);
  const recoveredState = { nodes: [], edges: [], rules: [], actions: [{ id: "a1", name: "increaseCooling", inputClassId: "n1", preconditions: [], effect: "", verification: "" }] };
  const detail = computeActionMatchDetail(groundTruth, recoveredState);
  assert.equal(detail.unmatchedGold.length, 1);
  assert.equal(detail.unmatchedGold[0].id, "enableEconomizer");
});

test("computeRuleMetrics and computeActionMetrics handle a domain with no rules/actions at all without crashing or producing NaN (MTSR-sourced ground truth's own real shape)", () => {
  const groundTruth = { classes: {}, relationships: [], properties: [], rules: [], actions: [] };
  const recoveredState = { nodes: [], edges: [], rules: [], actions: [] };
  const ruleMetrics = computeRuleMetrics(groundTruth, []);
  const actionMetrics = computeActionMetrics(groundTruth, recoveredState);
  assert.ok(Number.isFinite(ruleMetrics.recall) && Number.isFinite(ruleMetrics.precision) && Number.isFinite(ruleMetrics.f1));
  assert.ok(Number.isFinite(actionMetrics.identification.recall) && Number.isFinite(actionMetrics.identification.f1));
  assert.equal(actionMetrics.inputClassAccuracy, null);
});
