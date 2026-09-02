import { test } from "node:test";
import assert from "node:assert/strict";
import { loadEnvKey } from "./lib/env.mjs";
import {
  buildClassJudgePrompt, parseClassJudgeResponse,
  buildRelationshipJudgePrompt, parseRelationshipJudgeResponse,
  buildPropertyJudgePrompt, parsePropertyJudgeResponse,
  buildValueFidelityJudgePrompt, parseValueFidelityJudgeResponse,
  buildRuleJudgePrompt, parseRuleJudgeResponse, buildActionJudgePrompt, parseActionJudgeResponse,
  judgeClasses, judgeRelationships, judgeProperties, judgeValueFidelity, judgeRules, judgeActions,
  computeSemanticRecoveryMetrics, oneToOneMatchedIds, aggregateSemanticRuleActionMetrics, aggregateSemanticMetrics,
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

// Issue #133/E1 (external audit): this used to assert the exact bug the
// audit flagged -- "a wholly unparsed response is indistinguishable from a
// genuine all-no-match." A response missing a REFERENCE item's verdict
// line entirely (the prompt's own contract is "exactly one line per item")
// is now treated as a truncated/malformed response and fails loudly,
// instead of silently scoring the missing item as NO MATCH.
test("parseClassJudgeResponse fails loudly when the judge response is missing a REFERENCE item's verdict line entirely, rather than silently scoring it NO MATCH", () => {
  const gold = [{ id: "g1", label: "A" }, { id: "g2", label: "B" }];
  const recovered = [{ id: "r1", label: "X" }];
  assert.throws(
    () => parseClassJudgeResponse("1: MATCH 1 -- ok\n(the model forgot line 2 entirely)", gold, recovered),
    /recognized only 1\/2/,
  );
});

// Issue #133/E1: the audit measured curly quotes and markdown bullet/bold/
// numbering both dropping a real verdict from 2/2 recognized to 0/2 --
// reproduced here directly against parseClassJudgeResponse (through
// parsePairingResponse's shared normalizeJudgeLine), not just the raw regex.
test("parseClassJudgeResponse recognizes verdict lines wrapped in markdown (bullet, bold, \"N.\" numbering) and curly quotes, not just the prompt's own plain \"N: \" shape", () => {
  const gold = [{ id: "g1", label: "A" }, { id: "g2", label: "B" }];
  const recovered = [{ id: "r1", label: "X" }, { id: "r2", label: "Y" }];
  const variants = [
    "- **1:** MATCH **2** -- same concept\n- **2:** NO MATCH -- different",
    "**1.** MATCH 2 -- same concept\n**2.** NO MATCH -- different",
    "1) MATCH 2 -- same concept\n2) NO MATCH -- different",
  ];
  for (const text of variants) {
    const result = parseClassJudgeResponse(text, gold, recovered);
    assert.deepEqual(result, [
      { goldId: "g1", recoveredId: "r2", verdict: "MATCH" },
      { goldId: "g2", recoveredId: null, verdict: "NO MATCH" },
    ], `should have parsed: ${text}`);
  }
});

test("parseClassJudgeResponse ignores a MATCH referencing a candidate index that doesn't exist, defaulting to NO MATCH", () => {
  const gold = [{ id: "g1", label: "A" }];
  const recovered = [{ id: "r1", label: "X" }];
  const result = parseClassJudgeResponse("1: MATCH 99 -- hallucinated index", gold, recovered);
  assert.deepEqual(result, [{ goldId: "g1", recoveredId: null, verdict: "NO MATCH" }]);
});

// ONE-TO-ONE AGGREGATION -- fixes an external reviewer's confirmed finding:
// the judge prompt only says "pick the single best [candidate]" per
// REFERENCE line, so nothing stops two different REFERENCE lines from
// independently picking the same CANDIDATE -- the same recall-inflates/
// precision-doesn't asymmetry recoveryMetrics.mjs's matchClasses() had.
// oneToOneMatchedIds (used inside computeSemanticRecoveryMetrics for both
// classes and relationships) is what resolves that; tested directly here
// since it's a pure function, no API call needed.

test("oneToOneMatchedIds resolves two different gold items both judged MATCH against the same recovered id to only one of them", () => {
  // Mirrors the reviewer's reported case: two different REFERENCE lines
  // (e.g. "incidentCommander" and "majorIncident") both independently
  // judged MATCH against the same CANDIDATE node.
  const judgments = [
    { goldId: "incidentCommander", recoveredId: "n7", verdict: "MATCH" },
    { goldId: "majorIncident", recoveredId: "n7", verdict: "MATCH" },
  ];
  const { goldIds, recoveredIds } = oneToOneMatchedIds(judgments);
  assert.equal(goldIds.size, 1, "only one gold item may keep its MATCH once the shared candidate is resolved one-to-one");
  assert.equal(recoveredIds.size, 1);
  assert.ok(goldIds.has("incidentCommander") || goldIds.has("majorIncident"));
});

test("oneToOneMatchedIds keeps every match when there's no conflict at all", () => {
  const judgments = [
    { goldId: "g1", recoveredId: "r1", verdict: "MATCH" },
    { goldId: "g2", recoveredId: "r2", verdict: "MATCH" },
    { goldId: "g3", recoveredId: null, verdict: "NO MATCH" },
  ];
  const { goldIds, recoveredIds } = oneToOneMatchedIds(judgments);
  assert.deepEqual([...goldIds].sort(), ["g1", "g2"]);
  assert.deepEqual([...recoveredIds].sort(), ["r1", "r2"]);
});

test("oneToOneMatchedIds on an all-NO-MATCH list returns empty sets, not a crash", () => {
  const judgments = [{ goldId: "g1", recoveredId: null, verdict: "NO MATCH" }];
  const { goldIds, recoveredIds } = oneToOneMatchedIds(judgments);
  assert.equal(goldIds.size, 0);
  assert.equal(recoveredIds.size, 0);
});

// Issue #133/E15 (external audit): aggregateSemanticMetrics filtered stale
// judgments by "is the gold side still unmatched?" but never by "is the
// *recovered* side still unmatched?" -- so a replayed judgment naming a
// recoveredId the current heuristic pass already consumed (for a different
// gold item) got double-credited on top of that heuristic match. The audit
// demonstrated this producing precision=2.00; reproduced exactly here with
// one recovered node that already heuristically matched gold class X, plus
// a stale judgment claiming that same node also matches unmatched gold
// class Y.
test("aggregateSemanticMetrics drops a stale judgment whose recoveredId the current heuristic pass already consumed, instead of double-crediting it", () => {
  const groundTruth = {
    classes: {
      x: { id: "x", label: "X", aliases: ["x"] },
      y: { id: "y", label: "Y", aliases: ["y"] },
    },
    relationships: [], properties: [],
  };
  const recoveredState = {
    nodes: [{ id: "n1", label: "X", meaning: "", aliases: [] }], // heuristically matches X, one-to-one
    edges: [],
  };
  const judgments = {
    classes: [{ goldId: "y", recoveredId: "n1", verdict: "MATCH" }], // stale: n1 already spoken for by X
    relationships: [], properties: [], valueFidelity: [],
  };
  const result = aggregateSemanticMetrics({ groundTruth, recoveredState, judgments });
  assert.equal(result.classes.matched, 1, "the stale judgment must not add a second match on top of X's real heuristic one");
  assert.equal(result.classes.precision, 1, "precision must stay a real fraction (<=1), not 2.00 from double-crediting n1");
  assert.equal(result.classes.recoveredTotal, 1);
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

// Issue #133/E1: the audit measured curly quotes dropping a real property
// verdict from 2/2 recognized to 0/2 (the parser hard-required an ASCII
// `"`), and separately flagged that a candidate name should match
// case-insensitively after trimming rather than being rejected as a
// hallucination just because the model echoed it back with different
// casing or incidental whitespace.
test("parsePropertyJudgeResponse recognizes curly-quoted candidate names and matches case-insensitively after trimming", () => {
  const unmatchedGold = [{ id: "p1", label: "has severity", hostClassLabel: "Incident", recoveredHostProperties: ["priority"] }];
  const curlyQuoted = parsePropertyJudgeResponse("1: MATCH “priority” -- same field, different name", unmatchedGold);
  assert.deepEqual(curlyQuoted, [{ goldId: "p1", matchedPropertyName: "priority", verdict: "MATCH" }]);
  const differentCase = parsePropertyJudgeResponse('1: MATCH "Priority" -- same field', unmatchedGold);
  assert.deepEqual(differentCase, [{ goldId: "p1", matchedPropertyName: "priority", verdict: "MATCH" }], "must resolve back to the real offered candidate's own casing, not the judge's echo");
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

// Issue #133/E1: the audit measured bold "**1:**" numbering dropping a real
// value-fidelity score from 2/2 recognized to 0/2.
test("parseValueFidelityJudgeResponse recognizes a bold-numbered verdict line", () => {
  const matched = [{ id: "p1" }];
  const result = parseValueFidelityJudgeResponse("**1:** 75 -- close but not identical", matched);
  assert.equal(result[0].semanticFidelity, 0.75);
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

// RULES AND ACTIONS (issue #105) -- same prompt-building/parsing +
// pure-aggregation-function coverage as classes/relationships above; no
// new domain fixture files needed, same as recoveryMetrics.mjs's own
// rule/action tests.

test("buildRuleJudgePrompt shows each rule's real condition text, not just its name, and instructs that name alone is insufficient", () => {
  const gold = [{ id: "g1", label: "needsCoolingFromSetpoint", conditions: ["measured air temperature is above the applicable cooling temperature setpoint"] }];
  const recovered = [{ id: "r1", name: "coolingCheck", conditions: ["measured air temperature is above the applicable cooling temperature setpoint"] }];
  const { system, user } = buildRuleJudgePrompt(gold, recovered);
  assert.match(system, /core decision condition is semantically equivalent/);
  assert.match(system, /name\/topic.*NOT a match/);
  assert.match(user, /needsCoolingFromSetpoint -- conditions: measured air temperature is above/);
  assert.match(user, /coolingCheck -- conditions: measured air temperature is above/);
});

test("parseRuleJudgeResponse maps a MATCH line back to the correct gold/recovered id pair by position", () => {
  const gold = [{ id: "g1", label: "A" }, { id: "g2", label: "B" }];
  const recovered = [{ id: "r1", name: "X" }, { id: "r2", name: "Y" }];
  const text = "1: MATCH 2 -- same real condition, different name\n2: NO MATCH -- no equivalent condition found";
  const results = parseRuleJudgeResponse(text, gold, recovered);
  assert.deepEqual(results, [
    { goldId: "g1", recoveredId: "r2", verdict: "MATCH" },
    { goldId: "g2", recoveredId: null, verdict: "NO MATCH" },
  ]);
});

test("buildActionJudgePrompt includes each action's effect text, not just its name -- the signal a differently-named equivalent action can still be judged by", () => {
  const gold = [{ id: "g1", label: "increaseCooling", effect: "the cooling path is commanded to reduce air temperature toward the cooling setpoint" }];
  const recovered = [{ id: "r1", name: "coolMore", effect: "the cooling path is commanded to reduce air temperature toward the cooling setpoint" }];
  const { user } = buildActionJudgePrompt(gold, recovered);
  assert.match(user, /increaseCooling -- effect: the cooling path is commanded/);
  assert.match(user, /coolMore -- effect: the cooling path is commanded/);
});

test("parseActionJudgeResponse maps a MATCH line back to the correct gold/recovered id pair by position", () => {
  const gold = [{ id: "g1", label: "A" }];
  const recovered = [{ id: "r1", name: "X" }];
  const results = parseActionJudgeResponse("1: MATCH 1 -- same real effect, different name", gold, recovered);
  assert.deepEqual(results, [{ goldId: "g1", recoveredId: "r1", verdict: "MATCH" }]);
});

test("judgeRules/judgeActions skip the API call entirely when either side is empty", async () => {
  const ruleResult = await judgeRules({ apiKey: "unused", model: "unused", unmatchedGold: [{ id: "g1" }], unmatchedRecovered: [] });
  assert.deepEqual(ruleResult, [{ goldId: "g1", recoveredId: null, verdict: "NO MATCH" }]);
  const actionResult = await judgeActions({ apiKey: "unused", model: "unused", unmatchedGold: [{ id: "g1" }], unmatchedRecovered: [] });
  assert.deepEqual(actionResult, [{ goldId: "g1", recoveredId: null, verdict: "NO MATCH" }]);
});

// `chat` OVERRIDE (issue #111) -- a caller running the whole eval against a
// non-OpenAI provider (Azure) needs every judge call routed through its own
// provider config too, not just the app agent/persona/classifier. No live
// call, no network: a fake `chat` in place of the real OpenAI fetch proves
// the override is actually used (and receives the right system/user
// prompt), never that fetch("https://api.openai.com/...") gets called.
test("judgeClasses routes through a `chat` override instead of the OpenAI fetch when one is given", async () => {
  const calls = [];
  const chat = async (messages, model) => {
    calls.push({ messages, model });
    return { text: "1: MATCH 1 -- exact match", usage: null };
  };
  const gold = [{ id: "g1", label: "Service Desk", aliases: ["service desk"] }];
  const recovered = [{ id: "r1", label: "Help Desk", meaning: "", aliases: [] }];
  const result = await judgeClasses({ apiKey: "unused-with-chat-override", model: "my-azure-deployment", unmatchedGold: gold, unmatchedRecovered: recovered, chat });
  assert.equal(calls.length, 1, "expected exactly one call through the override, not the real fetch");
  assert.equal(calls[0].model, "my-azure-deployment");
  assert.equal(calls[0].messages[0].role, "system");
  assert.equal(calls[0].messages[1].role, "user");
  assert.match(calls[0].messages[1].content, /Service Desk/);
  assert.deepEqual(result, [{ goldId: "g1", recoveredId: "r1", verdict: "MATCH" }]);
});

// Issue #133/E1: chatOnce/chatMessagesOnce always returned `finishReason`,
// but nothing here ever looked at it -- a truncated judge response
// (finish_reason "length", e.g. a token-budget cutoff mid-list) was
// indistinguishable from a real, complete all-NO-MATCH verdict. judgeClasses
// (via callJudge) now hard-fails on it instead.
test("judgeClasses fails loudly when the chat override reports the response was truncated (finish_reason=length), instead of scoring it as a real verdict", async () => {
  const chat = async () => ({ text: "1: MATCH 1", usage: null, finishReason: "length" });
  const gold = [{ id: "g1", label: "Service Desk", aliases: ["service desk"] }];
  const recovered = [{ id: "r1", label: "Help Desk", meaning: "", aliases: [] }];
  await assert.rejects(
    () => judgeClasses({ apiKey: "unused", model: "my-azure-deployment", unmatchedGold: gold, unmatchedRecovered: recovered, chat }),
    /truncated/,
  );
});

test("computeSemanticRecoveryMetrics threads a `chat` override through its internal judgeClasses call, not just when judgeClasses is called directly", async () => {
  // A real unmatched-gold-vs-unmatched-recovered pair (a class heuristic
  // matching can't reach: zero label/alias overlap) so judgeClasses actually
  // makes a call rather than short-circuiting on an empty list.
  const groundTruth = {
    classes: { c1: { id: "c1", label: "Widget", aliases: ["widget"] } },
    relationships: [], properties: [], rules: [], actions: [],
    practicalScopeClassIds: new Set(), practicalScopePropertyIds: new Set(),
  };
  const recoveredState = { nodes: [{ id: "n1", label: "Gadget", meaning: "", aliases: [] }], edges: [] };
  let calls = 0;
  const chat = async () => { calls++; return { text: "1: MATCH 1 -- same concept", usage: null }; };
  const result = await computeSemanticRecoveryMetrics({ groundTruth, recoveredState, apiKey: "unused", model: "unused", chat });
  assert.equal(calls, 1, "expected the override to be reached through computeSemanticRecoveryMetrics's own internal judgeClasses call");
  assert.equal(result.classes.matched, 1, "the fake MATCH verdict should have been credited");
});

test("aggregateSemanticRuleActionMetrics: a paraphrased rule the heuristic pass genuinely cannot match is rescued by a confirmed judge verdict", () => {
  // Zero shared tokens between gold's and the recovered rule's condition
  // text -- a real paraphrase, not just a reworded synonym -- so the
  // heuristic pass (token-overlap only) has no way to find this on its own.
  // That's exactly the case the semantic supplement exists for.
  const groundTruth = {
    classes: {}, relationships: [], properties: [], actions: [],
    rules: [{ id: "g1", label: "needsCoolingFromSetpoint", conditions: ["measured air temperature is above the applicable cooling temperature setpoint"] }],
  };
  const recoveredRules = [{ id: "r1", name: "hotterThanTarget", conditions: ["the zone feels warmer than what the occupants configured as comfortable"] }];
  const recoveredState = { nodes: [], edges: [], rules: recoveredRules, actions: [] };

  const heuristicOnly = aggregateSemanticRuleActionMetrics({ groundTruth, recoveredState, judgments: { rules: [], actions: [] } });
  assert.equal(heuristicOnly.rules.matched, 0, "sanity: the heuristic pass alone really does miss this paraphrase");

  const judged = aggregateSemanticRuleActionMetrics({
    groundTruth, recoveredState,
    judgments: { rules: [{ goldId: "g1", recoveredId: "r1", verdict: "MATCH" }], actions: [] },
  });
  assert.equal(judged.rules.matched, 1);
  assert.equal(judged.rules.recall, 1);
});

test("aggregateSemanticRuleActionMetrics: a differently-named equivalent action the heuristic pass misses on name alone is rescued the same way", () => {
  const groundTruth = {
    classes: {}, relationships: [], properties: [], rules: [],
    actions: [{ id: "g1", label: "increaseCooling", primaryInputClassId: "AirHandlingUnit", preconditions: [], effect: "the cooling path is commanded to reduce air temperature toward the cooling setpoint", verification: "" }],
  };
  // "coolMore" (this test's original recovered name) picked up a real
  // heuristic-level token overlap with "increaseCooling" once issue #142's
  // Porter2 stemming shipped -- "cooling" and "cool" now stem to the same
  // root, which is correct behavior, not a bug, but it stopped being a
  // genuinely zero-heuristic-overlap example. "chillFurther" still shares
  // no stemmed tokens at all with "increaseCooling" (verified directly),
  // so it keeps testing what this test is actually about: the semantic
  // judge rescuing a pair the heuristic pass truly cannot reach on its own.
  const recoveredActions = [{ id: "r1", name: "chillFurther", inputClassId: "n1", preconditions: [], effect: "the cooling path is commanded to reduce air temperature toward the cooling setpoint", verification: "" }];
  const recoveredState = { nodes: [], edges: [], rules: [], actions: recoveredActions };

  const heuristicOnly = aggregateSemanticRuleActionMetrics({ groundTruth, recoveredState, judgments: { rules: [], actions: [] } });
  assert.equal(heuristicOnly.actions.matched, 0, "sanity: 'increaseCooling' vs 'chillFurther' shares no tokens at all, even after stemming");

  const judged = aggregateSemanticRuleActionMetrics({
    groundTruth, recoveredState,
    judgments: { rules: [], actions: [{ goldId: "g1", recoveredId: "r1", verdict: "MATCH" }] },
  });
  assert.equal(judged.actions.matched, 1);
  assert.equal(judged.actions.recall, 1);
  // Component metrics (input-class accuracy, precondition/effect/
  // verification recovery) are always computed from the HEURISTIC pass's
  // own matched pairs only, never extended by a semantic-judge-confirmed
  // identification -- the same scoping controlledValueFidelity already
  // uses (aggregateSemanticMetrics never re-scores a property's fidelity
  // via the semantic property judge's own matches either, only ever the
  // heuristic matchProperties assignment). Since the heuristic pass never
  // matched this pair at all, there is nothing to average -- n/a, not a
  // fabricated 0 *or* a value that only exists because a different layer
  // found the pairing.
  assert.equal(judged.actions.components.effectRecovery, null);
});

test("aggregateSemanticRuleActionMetrics never lowers recall below the heuristic pass -- a stored verdict about an item the heuristic pass now matches on its own is dropped, not double-counted", () => {
  const groundTruth = {
    classes: {}, relationships: [], properties: [], actions: [],
    rules: [{ id: "g1", label: "needsCoolingFromSetpoint", conditions: ["measured air temperature is above the applicable cooling temperature setpoint"] }],
  };
  const recoveredRules = [{ id: "r1", name: "needsCoolingFromSetpoint", conditions: ["measured air temperature is above the applicable cooling temperature setpoint"] }];
  const recoveredState = { nodes: [], edges: [], rules: recoveredRules, actions: [] };
  // A stale verdict about the same gold rule the heuristic pass now
  // matches on its own (e.g. from a replay after a scoring change).
  const stale = { rules: [{ goldId: "g1", recoveredId: "r1", verdict: "MATCH" }], actions: [] };
  const result = aggregateSemanticRuleActionMetrics({ groundTruth, recoveredState, judgments: stale });
  assert.equal(result.rules.matched, 1, "must not double-count -- still exactly 1, not 2");
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
    nodes: [
      { id: "n1", label: "Incident", meaning: "an unplanned event", aliases: [], properties: [{ name: "sevLevel", allowed: ["sev1", "sev2"] }] },
      // Deliberately unmatchable by the heuristic pass (no gold class in
      // this fixture plausibly shares tokens with this label) -- guarantees
      // detail.classes.unmatchedRecovered is non-empty, so judgeClasses
      // actually makes its real API call below rather than short-circuiting.
      { id: "n2", label: "Xyzzy Quux Zorbnak", meaning: "a deliberately unmatchable placeholder node", aliases: [] },
    ],
    edges: [],
  };
  const heuristic = computeRecoveryMetrics(scoped, recoveredState);
  const semantic = await computeSemanticRecoveryMetrics({ groundTruth: scoped, recoveredState, apiKey: OPENAI_API_KEY, model: LIVE_MODEL });
  assert.ok("classes" in semantic && "relationships" in semantic && "properties" in semantic && "controlledValueFidelity" in semantic && "recoveryEffectiveness" in semantic);
  assert.ok(semantic.classes.recall >= heuristic.classes.recall);
  assert.ok(semantic.relationships.recall >= heuristic.relationships.recall);
  assert.ok(semantic.properties.recall >= heuristic.properties.recall);

  // The new reproducibility-artifact fields (tests/evals/results/
  // semantic-judgments.json's source data): the class judge call this
  // fixture actually triggers (recoveredState above leaves real unmatched
  // gold classes and an unmatched recovered node) must have both its
  // parsed per-item judgments and its raw response text captured, not
  // silently discarded.
  assert.ok(Array.isArray(semantic.judgments.classes) && semantic.judgments.classes.length > 0);
  assert.equal(typeof semantic.rawResponses.classes, "string");
  assert.ok(semantic.rawResponses.classes.length > 0, "the judge's raw class-judgment response text should be captured, not empty");
  // judgments.* is always an array (even [] when that judge call never
  // fired, e.g. valueFidelity here since this fixture's one property never
  // heuristically matched a controlled-value gold property) -- structural
  // shape, not a claim every judge call always fires for every fixture.
  assert.ok(Array.isArray(semantic.judgments.relationships));
  assert.ok(Array.isArray(semantic.judgments.properties));
  assert.ok(Array.isArray(semantic.judgments.valueFidelity));
});
