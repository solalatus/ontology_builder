import { test } from "node:test";
import assert from "node:assert/strict";
import { loadEnvKey } from "./lib/env.mjs";
import {
  buildClassJudgePrompt, parseClassJudgeResponse,
  buildRelationshipJudgePrompt, parseRelationshipJudgeResponse,
  buildPropertyJudgePrompt, parsePropertyJudgeResponse,
  buildValueFidelityJudgePrompt, parseValueFidelityJudgeResponse,
  judgeClasses, judgeRelationships, judgeProperties, judgeValueFidelity,
  computeSemanticRecoveryMetrics,
} from "./evals/lib/llmMatcher.mjs";

// This file is the LLM-judge supplement's own test file -- deliberately
// separate from tests/ontology-recovery-metrics.spec.mjs, which covers only
// recoveryMetrics.mjs's free/instant/deterministic regex-and-token-overlap
// matcher. Everything in *this* file either tests pure, API-free prompt-
// building/response-parsing logic (the bulk of it, always run) or makes a
// real, opt-in OpenAI call (the last section, skipped without an API key --
// same convention as tests/helper-agent-live-openai.spec.mjs).

// PROMPT BUILDING / RESPONSE PARSING -- pure functions, no network -------

test("buildClassJudgePrompt lists every unmatched gold class as a numbered REFERENCE item and every unmatched recovered node as a numbered CANDIDATE, with aliases/meaning included", () => {
  const gold = [{ id: "g1", label: "Service Desk", aliases: ["service desk", "help desk"] }];
  const recovered = [{ id: "r1", label: "Application Support Team", meaning: "handles app issues", aliases: [] }];
  const { system, user } = buildClassJudgePrompt(gold, recovered);
  assert.match(system, /Default to NO MATCH/);
  assert.match(system, /confident/);
  assert.match(user, /1\. Service Desk \(aka: help desk\)/);
  assert.match(user, /1\. Application Support Team -- handles app issues/);
});

test("buildClassJudgePrompt handles an empty candidate list without crashing", () => {
  const { user } = buildClassJudgePrompt([{ id: "g1", label: "X", aliases: [] }], []);
  assert.match(user, /\(none\)/);
});

test("parseClassJudgeResponse maps a MATCH line back to the correct gold/recovered id pair by position", () => {
  const gold = [{ id: "g1", label: "A" }, { id: "g2", label: "B" }];
  const recovered = [{ id: "r1", label: "X" }, { id: "r2", label: "Y" }];
  const text = "1: MATCH 2 -- same concept, different name\n2: NO MATCH -- genuinely different";
  const result = parseClassJudgeResponse(text, gold, recovered);
  assert.deepEqual(result, [
    { goldId: "g1", recoveredId: "r2", verdict: "MATCH" },
    { goldId: "g2", recoveredId: null, verdict: "NO MATCH" },
  ]);
});

test("parseClassJudgeResponse treats a missing or malformed line as NO MATCH rather than crashing", () => {
  const gold = [{ id: "g1", label: "A" }, { id: "g2", label: "B" }];
  const recovered = [{ id: "r1", label: "X" }];
  const result = parseClassJudgeResponse("1: MATCH 1 -- ok\n(the model forgot line 2 entirely)", gold, recovered);
  assert.deepEqual(result, [
    { goldId: "g1", recoveredId: "r1", verdict: "MATCH" },
    { goldId: "g2", recoveredId: null, verdict: "NO MATCH" },
  ]);
});

test("parseClassJudgeResponse ignores a MATCH referencing a candidate index that doesn't exist, defaulting to NO MATCH", () => {
  const gold = [{ id: "g1", label: "A" }];
  const recovered = [{ id: "r1", label: "X" }];
  const result = parseClassJudgeResponse("1: MATCH 99 -- hallucinated index", gold, recovered);
  assert.deepEqual(result, [{ goldId: "g1", recoveredId: null, verdict: "NO MATCH" }]);
});

test("buildRelationshipJudgePrompt shows the reciprocal phrasing alongside the primary label and includes both endpoint class labels", () => {
  const gold = [{ id: "rel1", label: "is supported by", reciprocalLabel: "documents", fromClassLabel: "Incident", toClassLabel: "Evidence Item" }];
  const recovered = [{ id: "e1", relation: "hasEvidence", aliases: ["evidence collected for"], fromClassLabel: "Incident", toClassLabel: "Evidence Item" }];
  const { user } = buildRelationshipJudgePrompt(gold, recovered);
  assert.match(user, /Incident -is supported by-> Evidence Item \(or phrased as "documents" from Evidence Item to Incident\)/);
  assert.match(user, /Incident -hasEvidence-> Evidence Item \(aka: evidence collected for\)/);
});

test("parseRelationshipJudgeResponse pairs REFERENCE relationships to CANDIDATE edges the same way the class judge does", () => {
  const gold = [{ id: "rel1", label: "x" }];
  const recovered = [{ id: "e1", relation: "y" }];
  const result = parseRelationshipJudgeResponse("1: MATCH 1 -- same connection, different verb", gold, recovered);
  assert.deepEqual(result, [{ goldId: "rel1", recoveredId: "e1", verdict: "MATCH" }]);
});

test("buildPropertyJudgePrompt scopes each REFERENCE property to only its own host node's real candidate property names, not a shared pool", () => {
  const unmatchedGold = [
    { id: "p1", label: "has severity", hostClassLabel: "Incident", recoveredHostProperties: ["priority", "status"] },
    { id: "p2", label: "has region", hostClassLabel: "Service", recoveredHostProperties: [] },
  ];
  const { user } = buildPropertyJudgePrompt(unmatchedGold);
  assert.match(user, /1\. REFERENCE: "has severity" on class Incident -- CANDIDATES on that same recovered class: "priority", "status"/);
  assert.match(user, /2\. REFERENCE: "has region" on class Service -- CANDIDATES on that same recovered class: \(none\)/);
});

test("parsePropertyJudgeResponse only accepts a MATCH naming a candidate that was actually offered for that property, rejecting a hallucinated name", () => {
  const unmatchedGold = [{ id: "p1", label: "has severity", hostClassLabel: "Incident", recoveredHostProperties: ["priority"] }];
  const legit = parsePropertyJudgeResponse('1: MATCH "priority" -- same field, different name', unmatchedGold);
  assert.deepEqual(legit, [{ goldId: "p1", matchedPropertyName: "priority", verdict: "MATCH" }]);
  const hallucinated = parsePropertyJudgeResponse('1: MATCH "madeUpFieldName" -- ...', unmatchedGold);
  assert.deepEqual(hallucinated, [{ goldId: "p1", matchedPropertyName: null, verdict: "NO MATCH" }]);
});

test("buildValueFidelityJudgePrompt presents both raw value lists verbatim without any pre-normalization, leaving the semantic judgment entirely to the model", () => {
  const matched = [{ id: "prop1", label: "has severity", goldAllowedValues: ["sev1-critical", "sev2-high"], recoveredAllowedValues: ["Critical", "High"] }];
  const { user, system } = buildValueFidelityJudgePrompt(matched);
  assert.match(user, /REFERENCE values: \[sev1-critical, sev2-high\] -- RECOVERED values: \[Critical, High\]/);
  assert.match(system, /SAME underlying set of real/);
  assert.match(system, /extra, missing, or merged distinctions/);
});

test("parseValueFidelityJudgeResponse clamps an out-of-range score into 0-1 and converts the 0-100 scale correctly", () => {
  const matched = [{ id: "p1" }, { id: "p2" }, { id: "p3" }];
  const result = parseValueFidelityJudgeResponse("1: 90 -- near-identical scale\n2: 0 -- no relation\n3: 150 -- (a broken over-100 score)", matched);
  assert.equal(result[0].semanticFidelity, 0.9);
  assert.equal(result[1].semanticFidelity, 0);
  assert.equal(result[2].semanticFidelity, 1); // clamped
});

test("parseValueFidelityJudgeResponse leaves semanticFidelity null for a property the model's response never covered, so callers can fall back to the heuristic score", () => {
  const matched = [{ id: "p1" }, { id: "p2" }];
  const result = parseValueFidelityJudgeResponse("1: 80 -- ok", matched);
  assert.equal(result[0].semanticFidelity, 0.8);
  assert.equal(result[1].semanticFidelity, null);
});

// ORCHESTRATION SHORT-CIRCUITS -- no API call needed when there's nothing
// to judge (empty unmatched lists), so these run unconditionally too.

test("judgeClasses skips the API call entirely and returns all-NO-MATCH when there are no unmatched recovered nodes to compare against", async () => {
  const result = await judgeClasses({ apiKey: "unused", model: "unused", unmatchedGold: [{ id: "g1", label: "X" }], unmatchedRecovered: [] });
  assert.deepEqual(result, [{ goldId: "g1", recoveredId: null, verdict: "NO MATCH" }]);
});

test("judgeRelationships skips the API call entirely when there are no unmatched gold relationships to judge", async () => {
  const result = await judgeRelationships({ apiKey: "unused", model: "unused", unmatchedGold: [], unmatchedRecovered: [{ id: "e1", relation: "x" }] });
  assert.deepEqual(result, []);
});

test("judgeProperties skips the API call for properties with no candidate properties at all on their host node", async () => {
  const result = await judgeProperties({ apiKey: "unused", model: "unused", unmatchedGold: [{ id: "p1", label: "x", hostClassLabel: "C", recoveredHostProperties: [] }] });
  assert.deepEqual(result, [{ goldId: "p1", matchedPropertyName: null, verdict: "NO MATCH" }]);
});

test("judgeValueFidelity skips the API call entirely when nothing was heuristically matched", async () => {
  const result = await judgeValueFidelity({ apiKey: "unused", model: "unused", matchedControlledValue: [] });
  assert.deepEqual(result, []);
});

// LIVE ROUND-TRIP (opt-in, real OpenAI call) ------------------------------

const OPENAI_API_KEY = loadEnvKey("OPENAI_API_KEY");
const skip = OPENAI_API_KEY ? false : "Set OPENAI_API_KEY in a .env file at the repo root to run the live LLM-judge tests.";
const LIVE_MODEL = process.env.ONTOLOGY_EVAL_CLASSIFIER_MODEL || "gpt-4o-mini";

test("live: the judge correctly credits sev1-critical/sev2-high vs Critical/High as the same real scale, the exact case that motivated this module", { skip }, async () => {
  const matched = [{ id: "prop1", label: "has severity", goldAllowedValues: ["sev1-critical", "sev2-high", "sev3-medium", "sev4-low"], recoveredAllowedValues: ["Critical", "High", "Medium", "Low"] }];
  const result = await judgeValueFidelity({ apiKey: OPENAI_API_KEY, model: LIVE_MODEL, matchedControlledValue: matched });
  assert.equal(result.length, 1);
  assert.ok(result[0].semanticFidelity !== null, "expected the judge to return a parseable score");
  assert.ok(result[0].semanticFidelity >= 0.75, `expected a high semantic-overlap score for the same 4-level scale under different wording, got ${result[0].semanticFidelity}`);
});

test("live: the judge does NOT credit two genuinely different roles as the same class, even when both are plausible incident-response roles", { skip }, async () => {
  const gold = [{ id: "g1", label: "Service Desk", aliases: ["service desk"] }];
  const recovered = [{ id: "r1", label: "Executive Sponsor", meaning: "Senior executive accountable for strategic oversight", aliases: [] }];
  const result = await judgeClasses({ apiKey: OPENAI_API_KEY, model: LIVE_MODEL, unmatchedGold: gold, unmatchedRecovered: recovered });
  assert.equal(result[0].verdict, "NO MATCH", "a service desk and an executive sponsor are not the same role, strict judging must say so");
});

// A first version of this test used a continuous value-fidelity score on a
// genuinely ambiguous fixture (gold's 2-value list vs. a 4-value superset --
// real judges could reasonably land anywhere between "same core distinction,
// extra granularity" and "meaningfully different scale"), and got two
// legitimately different scores (0.25 vs 0.5) across two live calls. Since
// callJudge deliberately never pins `temperature` (see its own comment --
// same reasoning-tier-model-compatibility caution as index.html's
// callAgentChatRaw()), exact numeric reproducibility isn't guaranteed, and
// testing for it on an ambiguous case was really testing the fixture's own
// ambiguity, not the judge's stability. Re-scoped to what actually matters
// for trustworthiness: a *discrete* verdict (MATCH/NO MATCH) on a
// deliberately clear-cut, unambiguous case should not flip between calls.
test("live: the judge's discrete verdict is stable across two identical calls on a clear-cut case (same input, same MATCH/NO MATCH), even without temperature pinned", { skip }, async () => {
  const gold = [{ id: "g1", label: "Service Desk", aliases: ["service desk"] }];
  const recovered = [{ id: "r1", label: "Executive Sponsor", meaning: "Senior executive accountable for strategic oversight", aliases: [] }];
  const first = await judgeClasses({ apiKey: OPENAI_API_KEY, model: LIVE_MODEL, unmatchedGold: gold, unmatchedRecovered: recovered });
  const second = await judgeClasses({ apiKey: OPENAI_API_KEY, model: LIVE_MODEL, unmatchedGold: gold, unmatchedRecovered: recovered });
  assert.equal(first[0].verdict, "NO MATCH");
  assert.equal(second[0].verdict, first[0].verdict, "expected the same clear-cut verdict across two identical calls");
});

test("live: computeSemanticRecoveryMetrics returns the same shape as the heuristic computeRecoveryMetrics and never scores below the heuristic pass on recall (it can only add matches, never remove them)", { skip }, async () => {
  const { loadGroundTruthModel, scopeGroundTruth } = await import("./evals/lib/groundTruthModel.mjs");
  const { computeRecoveryMetrics } = await import("./evals/lib/recoveryMetrics.mjs");
  const gt = loadGroundTruthModel();
  const scoped = scopeGroundTruth(gt, gt.practicalScopeClassIds, gt.practicalScopePropertyIds);
  const recoveredState = {
    nodes: [{ id: "n1", label: "Incident", meaning: "an unplanned event", aliases: [], properties: [{ name: "sevLevel", allowed: ["sev1", "sev2"] }] }],
    edges: [],
  };
  const heuristic = computeRecoveryMetrics(scoped, recoveredState);
  const semantic = await computeSemanticRecoveryMetrics({ groundTruth: scoped, recoveredState, apiKey: OPENAI_API_KEY, model: LIVE_MODEL });
  assert.ok("classes" in semantic && "relationships" in semantic && "properties" in semantic && "controlledValueFidelity" in semantic && "recoveryEffectiveness" in semantic);
  assert.ok(semantic.classes.recall >= heuristic.classes.recall);
  assert.ok(semantic.relationships.recall >= heuristic.relationships.recall);
  assert.ok(semantic.properties.recall >= heuristic.properties.recall);
});
