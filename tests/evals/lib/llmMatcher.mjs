import { CHAT_URL, RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError } from "../../lib/liveOpenAi.mjs";
import {
  computeRecoveryMetrics, computeMatchDetail, computeRuleMetrics, computeActionMetrics,
  computeRuleMatchDetail, computeActionMatchDetail,
} from "./recoveryMetrics.mjs";
import { maxWeightBipartiteMatching } from "./bipartiteMatching.mjs";

// LLM-JUDGE SUPPLEMENT to recoveryMetrics.mjs's heuristic token-overlap
// matcher -- built specifically to catch the failure mode a real live run
// surfaced: controlled-value fidelity collapsing from 100% to 31.8% between
// two runs of the *same unmodified prompt*, purely because the interviewer
// proposed "Critical/High/Medium/Low" one run and gold's own hidden list
// used "sev1-critical/sev2-high/..." the other -- the same real distinction,
// zero token overlap, scored as if it were a totally different scale.
//
// Deliberately a SUPPLEMENT, not a replacement: recoveryMetrics.mjs's own
// computeRecoveryMetrics/computeMatchDetail are completely untouched by
// this file and stay the fast, free, deterministic first pass. This module
// only ever judges the *residual* items that pass already failed to
// match -- never re-litigates anything the heuristic already resolved --
// so API cost is bounded by how much disagreement exists, not by the size
// of the ontology. reportGenerator.mjs renders both results side by side,
// never one replacing the other in the report -- a reader should always be
// able to see how much of any score difference is wording variance the
// judge caught vs. a real difference in what was actually modeled.
//
// STRICT judging, by design: every judge prompt below defaults to "no
// match" and requires the model to name the specific shared concept, not
// just flag two things as "related" or "in the same domain area" --
// otherwise this would quietly turn into the synonym dictionary this
// project has repeatedly and deliberately declined to build elsewhere
// (recoveryMetrics.mjs's own module doc), just laundered through an LLM
// call instead of a hand-maintained list. Direction is still never judged
// away for relationships -- the judge only ever picks a label match; which
// specific edge direction counts as satisfying it is still decided by the
// same deterministic logic recoveryMetrics.mjs already uses (see
// computeSemanticRecoveryMetrics below).

const JUDGE_LINE_RE = /^\s*(\d+)\s*:\s*(MATCH\s+(\d+)|NO MATCH)/i;

// Issue #133/E1 (external audit): the judge prompt asks for a plain
// "N: MATCH M -- reason" line, but a real model does not always answer in
// exactly that shape -- curly quotes, a markdown bullet/heading/bold
// wrapper, or "N." instead of "N:" all previously made a well-formed
// verdict invisible to JUDGE_LINE_RE and the property/value-fidelity
// regexes below (measured: curly quotes and markdown numbering both
// dropped a real verdict from 2/2 recognized to 0/2). Normalizing once,
// centrally, before every line-level regex test in this file is more
// robust than hand-relaxing each pattern's own anchor.
function normalizeJudgeLine(line) {
  return line
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"') // curly -> straight quotes
    .replace(/^\s*[-*•#]+\s*/, "") // leading bullet/heading marker ("- ", "* ", "# ")
    .replace(/\*\*/g, "") // bold markers anywhere -- purely decorative for parsing
    .replace(/^(\s*\d+)\s*[.)]\s*/, "$1: "); // "1." or "1)" -> "1: "
}

// Issue #133/E1: previously any REFERENCE item the judge didn't produce a
// recognizable line for was silently left `null` (treated as NO MATCH),
// making a genuinely truncated or malformed response indistinguishable
// from the judge legitimately saying "no match" to everything -- worst on
// exactly the domains with the most unmatched gold, where a shortfall is
// easiest to miss. The prompt's own contract is "exactly one line per
// REFERENCE item, in order"; any run producing fewer recognized lines than
// that now fails loudly instead of silently scoring the shortfall as 0.
function parsePairingResponse(text, goldCount) {
  const lines = String(text || "").split("\n");
  const verdicts = new Array(goldCount).fill(null); // null = no verdict line seen (treated as no match)
  let recognizedCount = 0;
  for (const rawLine of lines) {
    const m = JUDGE_LINE_RE.exec(normalizeJudgeLine(rawLine));
    if (!m) continue;
    const goldIndex = Number(m[1]) - 1;
    if (goldIndex < 0 || goldIndex >= goldCount) continue;
    if (verdicts[goldIndex] === null) recognizedCount++;
    verdicts[goldIndex] = m[3] ? Number(m[3]) - 1 : -1; // -1 = explicit NO MATCH
  }
  if (goldCount > 0 && recognizedCount < goldCount) {
    throw new Error(
      `parsePairingResponse: judge response recognized only ${recognizedCount}/${goldCount} REFERENCE-item verdict `
      + `lines (the prompt asks for exactly one line per item) -- treating this as a truncated or malformed `
      + `response rather than silently scoring the missing ${goldCount - recognizedCount} as NO MATCH. Raw response: `
      + `${JSON.stringify(String(text || "").slice(0, 2000))}`
    );
  }
  return verdicts;
}

// Shared REFERENCE-list-vs-CANDIDATE-list judging shape, used for both
// classes and relationships below -- any candidate could in principle match
// any reference item, so both need the full N-by-M list in front of the
// judge at once (still just one API call, not N*M of them).
export function buildPairingJudgePrompt({ kind, instructions, goldItems, goldText, candidateItems, candidateText }) {
  const system =
    `You are strictly auditing whether AI-recovered ${kind} correctly capture a hidden reference ontology's ` +
    `${kind}, for an automated scoring pipeline -- not giving a helpful answer, judging one. For each REFERENCE ` +
    `item, decide whether any CANDIDATE refers to the exact same real-world concept a domain expert would treat ` +
    `as interchangeable. Default to NO MATCH. Only answer MATCH if you are confident they mean the same thing, ` +
    `not merely related, not merely in the same category, not merely sharing a word. ${instructions} If several ` +
    `candidates could apply, pick the single best one. Respond with exactly one line per REFERENCE item, in ` +
    `order, formatted as either "N: MATCH M -- <one short reason>" or "N: NO MATCH -- <one short reason>" (N is ` +
    `the reference item's number, M is the candidate's number). Output nothing else -- no preamble, no summary.`;
  const goldList = goldItems.map((item, i) => `${i + 1}. ${goldText(item)}`).join("\n");
  const candidateList = candidateItems.length
    ? candidateItems.map((item, i) => `${i + 1}. ${candidateText(item)}`).join("\n")
    : "(none)";
  const user = `REFERENCE ${kind} (the hidden ground truth):\n${goldList}\n\nCANDIDATE ${kind} (what was actually recovered):\n${candidateList}`;
  return { system, user };
}

export function parseClassJudgeResponse(text, unmatchedGold, unmatchedRecovered) {
  const verdicts = parsePairingResponse(text, unmatchedGold.length);
  return unmatchedGold.map((gold, i) => {
    const ci = verdicts[i];
    const matched = ci !== null && ci >= 0 && ci < unmatchedRecovered.length;
    return { goldId: gold.id, recoveredId: matched ? unmatchedRecovered[ci].id : null, verdict: matched ? "MATCH" : "NO MATCH" };
  });
}

export function buildClassJudgePrompt(unmatchedGold, unmatchedRecovered) {
  return buildPairingJudgePrompt({
    kind: "classes",
    // Issue #133/E14 (external audit): this instruction was itops-specific
    // ("incident-response work") but sent verbatim to every domain's own
    // class judge -- HVAC equipment, loan contracts, supply-chain events
    // alike. Generalized to the same underlying discipline (two things
    // sharing a role in one process are not automatically the same class)
    // without naming any one domain.
    instructions: "Two classes named for different roles, parties, or artifacts are NOT the same class just because they participate in the same real-world process.",
    goldItems: unmatchedGold,
    goldText: (c) => `${c.label}${c.aliases && c.aliases.length ? ` (aka: ${c.aliases.filter((a) => a !== c.label.toLowerCase()).join(", ")})` : ""}`,
    candidateItems: unmatchedRecovered,
    candidateText: (n) => `${n.label}${n.meaning ? ` -- ${n.meaning}` : ""}${n.aliases && n.aliases.length ? ` (aka: ${n.aliases.join(", ")})` : ""}`,
  });
}

export function parseRelationshipJudgeResponse(text, unmatchedGold, unmatchedRecovered) {
  const verdicts = parsePairingResponse(text, unmatchedGold.length);
  return unmatchedGold.map((gold, i) => {
    const ci = verdicts[i];
    const matched = ci !== null && ci >= 0 && ci < unmatchedRecovered.length;
    return { goldId: gold.id, recoveredId: matched ? unmatchedRecovered[ci].id : null, verdict: matched ? "MATCH" : "NO MATCH" };
  });
}

export function buildRelationshipJudgePrompt(unmatchedGold, unmatchedRecovered) {
  return buildPairingJudgePrompt({
    kind: "relationships",
    instructions:
      "Every reference relationship already has its correct endpoint classes confirmed elsewhere -- you are only " +
      "judging whether the CANDIDATE's label/aliases mean the same real-world connection as the REFERENCE's " +
      "label (which may include a reciprocal phrasing from the other direction, shown in parentheses -- treat " +
      "either phrasing as satisfying the match). Do not credit a candidate that describes a genuinely different " +
      "kind of connection between the same two classes.",
    goldItems: unmatchedGold,
    goldText: (r) => `${r.fromClassLabel} -${r.label}-> ${r.toClassLabel}${r.reciprocalLabel ? ` (or phrased as "${r.reciprocalLabel}" from ${r.toClassLabel} to ${r.fromClassLabel})` : ""}`,
    candidateItems: unmatchedRecovered,
    candidateText: (e) => `${e.fromClassLabel} -${e.relation}-> ${e.toClassLabel}${e.aliases && e.aliases.length ? ` (aka: ${e.aliases.join(", ")})` : ""}`,
  });
}

// Properties are a different shape: each unmatched gold property already
// comes with its own small, already-scoped candidate list (the real
// properties on the one specific host node that already matched that
// property's class) -- no cross-matching needed, and no reason to show one
// property's candidates when judging another. One call still covers every
// unmatched property, just with an independent numbered judgment per line
// rather than a shared candidate list.
export function buildPropertyJudgePrompt(unmatchedGold) {
  const system =
    "You are strictly auditing whether AI-recovered properties correctly capture a hidden reference ontology's " +
    "properties, for an automated scoring pipeline -- not giving a helpful answer, judging one. For each " +
    "REFERENCE property, decide whether any of its own listed CANDIDATE property names (already confirmed to " +
    "live on the correct class) refers to the same real-world field a domain expert would treat as " +
    "interchangeable. Default to NO MATCH. A property that is merely thematically related (e.g. both about " +
    "timing, or both about status) is NOT a match unless they clearly represent the same specific field. " +
    "Respond with exactly one line per REFERENCE property, in order, formatted as either " +
    '"N: MATCH \\"<candidate name>\\" -- <one short reason>" or "N: NO MATCH -- <one short reason>". Output ' +
    "nothing else.";
  const list = unmatchedGold.map((p, i) => {
    const candidates = p.recoveredHostProperties.length ? p.recoveredHostProperties.map((n) => `"${n}"`).join(", ") : "(none)";
    return `${i + 1}. REFERENCE: "${p.label}" on class ${p.hostClassLabel} -- CANDIDATES on that same recovered class: ${candidates}`;
  }).join("\n");
  return { system, user: list };
}

export function parsePropertyJudgeResponse(text, unmatchedGold) {
  const lines = String(text || "").split("\n");
  const results = unmatchedGold.map((p) => ({ goldId: p.id, matchedPropertyName: null, verdict: "NO MATCH" }));
  const lineRe = /^\s*(\d+)\s*:\s*MATCH\s+"([^"]*)"/i;
  for (const rawLine of lines) {
    const m = lineRe.exec(normalizeJudgeLine(rawLine));
    if (!m) continue;
    const i = Number(m[1]) - 1;
    if (i < 0 || i >= unmatchedGold.length) continue;
    // Issue #133/E1: matched case-insensitively after trimming -- the judge
    // must still pick a real offered candidate, not invent one, but "status"
    // must not be silently rejected as a non-match just because the model
    // echoed it back as "Status" or with incidental surrounding whitespace.
    const candidateName = m[2].trim();
    const realCandidate = unmatchedGold[i].recoveredHostProperties.find((c) => c.trim().toLowerCase() === candidateName.toLowerCase());
    if (!realCandidate) continue;
    results[i] = { goldId: unmatchedGold[i].id, matchedPropertyName: realCandidate, verdict: "MATCH" };
  }
  return results;
}

// Rules and actions (issue #105) -- same shared pairing-judge shape as
// classes/relationships above (buildPairingJudgePrompt), since matching
// them is the same underlying question: does any CANDIDATE refer to the
// same real-world rule/action a domain expert would treat as
// interchangeable. Scoped to identification only, matching classes/
// relationships' own precedent -- see recoveryMetrics.mjs's
// computeRuleMatchDetail/computeActionMatchDetail module comment for why
// the component metrics (precondition/effect/verification recovery,
// input-class accuracy) stay heuristic-only rather than also getting a
// semantic re-score the way controlledValueFidelity does.
export function parseRuleJudgeResponse(text, unmatchedGold, unmatchedRecovered) {
  const verdicts = parsePairingResponse(text, unmatchedGold.length);
  return unmatchedGold.map((gold, i) => {
    const ci = verdicts[i];
    const matched = ci !== null && ci >= 0 && ci < unmatchedRecovered.length;
    return { goldId: gold.id, recoveredId: matched ? unmatchedRecovered[ci].id : null, verdict: matched ? "MATCH" : "NO MATCH" };
  });
}

export function buildRuleJudgePrompt(unmatchedGold, unmatchedRecovered) {
  return buildPairingJudgePrompt({
    kind: "rules",
    instructions:
      "A rule is the same real-world rule only if its core decision condition is semantically equivalent -- " +
      "matching only the rule's own name/topic, with a genuinely different triggering condition, is NOT a match.",
    goldItems: unmatchedGold,
    goldText: (r) => `${r.label} -- conditions: ${(r.conditions || []).join("; ") || "(none stated)"}`,
    candidateItems: unmatchedRecovered,
    candidateText: (r) => `${r.name} -- conditions: ${(r.conditions || []).join("; ") || "(none stated)"}`,
  });
}

export function parseActionJudgeResponse(text, unmatchedGold, unmatchedRecovered) {
  const verdicts = parsePairingResponse(text, unmatchedGold.length);
  return unmatchedGold.map((gold, i) => {
    const ci = verdicts[i];
    const matched = ci !== null && ci >= 0 && ci < unmatchedRecovered.length;
    return { goldId: gold.id, recoveredId: matched ? unmatchedRecovered[ci].id : null, verdict: matched ? "MATCH" : "NO MATCH" };
  });
}

export function buildActionJudgePrompt(unmatchedGold, unmatchedRecovered) {
  return buildPairingJudgePrompt({
    kind: "actions",
    instructions:
      "Two actions are the same real-world action only if they represent the same operation with the same " +
      "intended effect -- an action with a similar name but a genuinely different effect is NOT a match. Input " +
      "class and precondition/verification detail are scored separately elsewhere; judge identity here, not " +
      "whether every field matches too.",
    goldItems: unmatchedGold,
    goldText: (a) => `${a.label}${a.effect ? ` -- effect: ${a.effect}` : ""}`,
    candidateItems: unmatchedRecovered,
    candidateText: (a) => `${a.name}${a.effect ? ` -- effect: ${a.effect}` : ""}`,
  });
}

// Controlled-value fidelity: not a binary match/no-match (the property is
// already heuristically matched) but a continuous 0-100 semantic-overlap
// re-score, the direct fix for the exact failure this module exists for
// (sev1-critical/sev2-high/... vs Critical/High/... -- the same scale,
// heuristic Jaccard score near 0). Still strict: told explicitly not to
// award credit for "both are severity-like scales" if the actual value
// counts/meanings diverge.
export function buildValueFidelityJudgePrompt(matchedControlledValue) {
  const system =
    "You are strictly re-scoring how well a recovered controlled-value list matches a hidden reference list, for " +
    "an automated scoring pipeline. The two lists may use completely different wording conventions (e.g. " +
    '"sev1-critical" vs "Critical") -- score based on whether they represent the SAME underlying set of real ' +
    "distinctions (same number of meaningfully distinct values, same real-world meaning each), not on word " +
    "overlap. If the recovered list has extra, missing, or merged distinctions compared to the reference, that " +
    "must lower the score. Respond with exactly one line per item, in order, formatted as " +
    '"N: <score 0-100> -- <one short reason>", where 0 means no real overlap and 100 means the lists represent ' +
    "the identical set of real distinctions. Output nothing else.";
  const list = matchedControlledValue.map((p, i) =>
    `${i + 1}. "${p.label}" -- REFERENCE values: [${p.goldAllowedValues.join(", ")}] -- RECOVERED values: [${p.recoveredAllowedValues.join(", ")}]`
  ).join("\n");
  return { system, user: list };
}

export function parseValueFidelityJudgeResponse(text, matchedControlledValue) {
  const lines = String(text || "").split("\n");
  const results = matchedControlledValue.map((p) => ({ id: p.id, semanticFidelity: null }));
  const lineRe = /^\s*(\d+)\s*:\s*(\d+(?:\.\d+)?)/;
  for (const rawLine of lines) {
    const m = lineRe.exec(normalizeJudgeLine(rawLine));
    if (!m) continue;
    const i = Number(m[1]) - 1;
    if (i < 0 || i >= matchedControlledValue.length) continue;
    const score = Math.max(0, Math.min(100, Number(m[2]))) / 100;
    results[i] = { id: matchedControlledValue[i].id, semanticFidelity: score };
  }
  return results;
}

// Real API call, same retry shape as every other live call site in this
// suite (personaAgent.mjs, conversationOrchestrator.mjs's classifier,
// reportGenerator.mjs's review call). Deliberately does NOT set
// `temperature` -- same reasoning as index.html's own callAgentChatRaw()
// and conversationOrchestrator.mjs's appearsFinished(): a reasoning-tier
// model can reject a request parameter an ordinary chat model accepts
// (this project's own real, previously-hit example was `max_tokens`), and
// this judge is meant to work with whatever model the caller passes,
// standard or reasoning-tier alike, not just the ones this file happens to
// have been tested against. This means exact determinism isn't guaranteed
// call to call -- this file's own live determinism test checks for a
// stable discrete verdict on a clear-cut case, not an identical continuous
// score on an inherently ambiguous one.
// `chat`, if given, replaces the OpenAI fetch below entirely -- same
// injection point/shape as personaAgent.mjs's own `chat` override
// (`async (messages) => ({ text, usage })`), so a caller running the
// whole eval against a non-OpenAI provider (e.g. issue #111's Azure-backed
// multi-domain benchmark runner) can point every real API call this eval
// makes -- app agent, persona, classifier, AND the judge -- at the same
// provider with one consistent override shape, not three different ones.
// Every existing caller (undefined chat) is completely unaffected.
// Issue #133/E1 (external audit): a truncated judge response (finish_reason
// "length", e.g. a token-budget cutoff mid-list) was previously
// indistinguishable from a real, complete response that simply had fewer
// recognized lines -- run-multi-domain-benchmark.mjs's own `chat` wrapper
// returns `finishReason` (chatClient.mjs's chatOnce/chatMessagesOnce always
// did), but nothing here ever looked at it. Checked and hard-failed on in
// both the `chat`-override and raw-fetch paths, so a truncation surfaces as
// a loud, specific error rather than a silently short verdict list (which
// parsePairingResponse's own new count check would likely also catch, but
// this names the actual cause instead of leaving it to be inferred).
async function callJudge({ apiKey, model, system, user, onRawResponse, chat = null }) {
  if (chat) {
    const { text, finishReason } = await chat([{ role: "system", content: system }, { role: "user", content: user }], model);
    if (onRawResponse) onRawResponse(text);
    if (finishReason === "length") {
      throw new Error(`llmMatcher judge call (model "${model}") was truncated (finish_reason=length) -- the judge's response is incomplete, not a real all-NO-MATCH verdict.`);
    }
    return text;
  }
  let res, data;
  for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
    res = await fetch(CHAT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
    data = await res.json();
    if (res.ok && !data.error) break;
    const retryable = res.status === 429 && !isInsufficientQuotaError(data) && attempt < RATE_LIMIT_MAX_ATTEMPTS;
    if (retryable) { await sleepMs(rateLimitBackoffMs(attempt)); continue; }
    throw new Error(`llmMatcher judge call failed (HTTP ${res.status}, model "${model}"): ${(data.error && data.error.message) || "unknown error"}`);
  }
  const choice = data.choices && data.choices[0];
  const text = (choice && choice.message && choice.message.content) || "";
  if (onRawResponse) onRawResponse(text);
  if (choice && choice.finish_reason === "length") {
    throw new Error(`llmMatcher judge call (model "${model}") was truncated (finish_reason=length) -- the judge's response is incomplete, not a real all-NO-MATCH verdict.`);
  }
  return text;
}

// onRawResponse is optional everywhere below (undefined for every existing
// caller/test) -- purely additive, so no existing call site's return shape
// or behavior changes. computeSemanticRecoveryMetrics (below) is the one
// caller that passes it, to capture the judge's raw response text for the
// semantic-judgments.json reproducibility artifact (tests/evals/README.md)
// without needing a breaking change to these four functions' established
// return-an-array contract, which several existing tests already assert on
// directly.
export async function judgeClasses({ apiKey, model, unmatchedGold, unmatchedRecovered, onRawResponse, chat = null }) {
  if (!unmatchedGold.length || !unmatchedRecovered.length) return unmatchedGold.map((g) => ({ goldId: g.id, recoveredId: null, verdict: "NO MATCH" }));
  const { system, user } = buildClassJudgePrompt(unmatchedGold, unmatchedRecovered);
  const text = await callJudge({ apiKey, model, system, user, onRawResponse, chat });
  return parseClassJudgeResponse(text, unmatchedGold, unmatchedRecovered);
}

export async function judgeRelationships({ apiKey, model, unmatchedGold, unmatchedRecovered, onRawResponse, chat = null }) {
  if (!unmatchedGold.length || !unmatchedRecovered.length) return unmatchedGold.map((g) => ({ goldId: g.id, recoveredId: null, verdict: "NO MATCH" }));
  const { system, user } = buildRelationshipJudgePrompt(unmatchedGold, unmatchedRecovered);
  const text = await callJudge({ apiKey, model, system, user, onRawResponse, chat });
  return parseRelationshipJudgeResponse(text, unmatchedGold, unmatchedRecovered);
}

export async function judgeRules({ apiKey, model, unmatchedGold, unmatchedRecovered, onRawResponse, chat = null }) {
  if (!unmatchedGold.length || !unmatchedRecovered.length) return unmatchedGold.map((g) => ({ goldId: g.id, recoveredId: null, verdict: "NO MATCH" }));
  const { system, user } = buildRuleJudgePrompt(unmatchedGold, unmatchedRecovered);
  const text = await callJudge({ apiKey, model, system, user, onRawResponse, chat });
  return parseRuleJudgeResponse(text, unmatchedGold, unmatchedRecovered);
}

export async function judgeActions({ apiKey, model, unmatchedGold, unmatchedRecovered, onRawResponse, chat = null }) {
  if (!unmatchedGold.length || !unmatchedRecovered.length) return unmatchedGold.map((g) => ({ goldId: g.id, recoveredId: null, verdict: "NO MATCH" }));
  const { system, user } = buildActionJudgePrompt(unmatchedGold, unmatchedRecovered);
  const text = await callJudge({ apiKey, model, system, user, onRawResponse, chat });
  return parseActionJudgeResponse(text, unmatchedGold, unmatchedRecovered);
}

export async function judgeProperties({ apiKey, model, unmatchedGold, onRawResponse, chat = null }) {
  const withCandidates = unmatchedGold.filter((p) => p.recoveredHostProperties.length);
  if (!withCandidates.length) return unmatchedGold.map((p) => ({ goldId: p.id, matchedPropertyName: null, verdict: "NO MATCH" }));
  const { system, user } = buildPropertyJudgePrompt(withCandidates);
  const text = await callJudge({ apiKey, model, system, user, onRawResponse, chat });
  const judged = parsePropertyJudgeResponse(text, withCandidates);
  const byId = new Map(judged.map((j) => [j.goldId, j]));
  return unmatchedGold.map((p) => byId.get(p.id) || { goldId: p.id, matchedPropertyName: null, verdict: "NO MATCH" });
}

export async function judgeValueFidelity({ apiKey, model, matchedControlledValue, onRawResponse, chat = null }) {
  if (!matchedControlledValue.length) return [];
  const { system, user } = buildValueFidelityJudgePrompt(matchedControlledValue);
  const text = await callJudge({ apiKey, model, system, user, onRawResponse, chat });
  return parseValueFidelityJudgeResponse(text, matchedControlledValue);
}

function f1(recall, precision) {
  if (recall + precision === 0) return 0;
  return (2 * recall * precision) / (recall + precision);
}

// Reduces a list of {goldId, recoveredId, verdict} judge verdicts to a
// one-to-one assignment via maxWeightBipartiteMatching (weight 1 for every
// MATCH edge, since a judge verdict is binary -- this becomes plain maximum
// bipartite matching). Without this, nothing stops two different REFERENCE
// lines in the judge prompt from independently picking the same CANDIDATE
// (buildPairingJudgePrompt's "pick the single best" instruction only
// constrains one gold item's own line, not different lines from claiming
// the same candidate) -- the exact same recall-inflates/precision-doesn't
// asymmetry recoveryMetrics.mjs's matchClasses() had, one level up, caught
// by the same external review. Used for classes and relationships, the two
// judge passes that share one candidate pool across multiple gold items;
// the property judge (below) already scopes each gold property to its own
// already-matched host node's property list, so no cross-item conflict of
// this shape can arise there.
export function oneToOneMatchedIds(judgments) {
  const edges = judgments
    .filter((j) => j.verdict === "MATCH" && j.recoveredId)
    .map((j) => ({ left: j.goldId, right: j.recoveredId, weight: 1 }));
  const assignment = maxWeightBipartiteMatching(edges);
  return {
    goldIds: new Set(assignment.map((e) => e.left)),
    recoveredIds: new Set(assignment.map((e) => e.right)),
    // The resolved {goldId, recoveredId} pairs themselves, additive to the
    // two Sets above (existing callers destructure only goldIds/recoveredIds
    // for counting) -- for tests/evals/results/semantic-matches.json, which
    // needs the actual one-to-one-resolved pairing, not just a raw MATCH-
    // verdict filter that could still contain the very duplicate-recoveredId
    // conflict this function exists to resolve.
    matches: assignment.map(({ left, right }) => ({ goldId: left, recoveredId: right })),
  };
}

// Resolves the property judge's verdicts into a one-to-one assignment over
// the *recovered* properties, the way oneToOneMatchedIds does for classes and
// relationships.
//
// This used to be unnecessary: the property judge scopes each gold property
// to its own already-matched host node's property list, so no two gold
// properties on *different* classes can collide. Two gold properties on the
// *same* class still can, and once properties gained a precision figure the
// collision stopped being merely cosmetic -- crediting one recovered property
// to two gold properties would count it twice in the recall numerator while
// the precision denominator sees it once. Each judge MATCH is therefore
// resolved to a concrete recovered-property key (node id + index within that
// node, computeMatchDetail's own `recoveredHostPropertyKeys`), and a key
// already taken by an earlier verdict is not handed out again.
//
// A judgment naming a property that is not on its gold item's offered list at
// all (a judge hallucinating a name) resolves to no key: it still counts for
// recall, exactly as before this function existed, but contributes nothing to
// precision, since there is no recovered property it can be pointing at.
export function resolvePropertyJudgments(judgments, propertyDetail) {
  const offeredByGoldId = new Map(
    (propertyDetail.unmatchedGold || []).map((g) => [g.id, { names: g.recoveredHostProperties || [], keys: g.recoveredHostPropertyKeys || [] }])
  );
  const taken = new Set(propertyDetail.matchedKeys || []);
  const goldIds = new Set();
  const recoveredKeys = new Set();
  const resolved = [];
  for (const j of judgments) {
    if (j.verdict !== "MATCH") continue;
    goldIds.add(j.goldId);
    const offered = offeredByGoldId.get(j.goldId);
    let key = null;
    if (offered) {
      for (let i = 0; i < offered.names.length; i++) {
        if (offered.names[i] === j.matchedPropertyName && !taken.has(offered.keys[i])) { key = offered.keys[i]; break; }
      }
    }
    if (key) { taken.add(key); recoveredKeys.add(key); }
    resolved.push({ goldId: j.goldId, matchedPropertyName: j.matchedPropertyName, recoveredKey: key });
  }
  return { goldIds, recoveredKeys, matches: resolved };
}

// Orchestrates the full semantic pass: heuristic first (computeRecoveryMetrics/
// computeMatchDetail, both untouched), then judges every residual, then
// recomputes recall/precision/F1/composite on top of the heuristic counts
// plus whatever the judge additionally confirmed. Returns the exact same
// shape as computeRecoveryMetrics so reportGenerator.mjs can render both
// side by side with one shared table-building function.
// `chat`, if given, threads through to every judge call below -- see
// callJudge's own comment for why (issue #111's Azure-backed multi-domain
// benchmark runner is the first caller that actually needs this).
export async function computeSemanticRecoveryMetrics({ groundTruth, recoveredState, apiKey, model, chat = null }) {
  const detail = computeMatchDetail(groundTruth, recoveredState);

  // Raw judge response text, captured via the onRawResponse callback rather
  // than changing judgeClasses/etc.'s own return shape (see their shared
  // comment above) -- for the semantic-judgments.json reproducibility
  // artifact (tests/evals/README.md), the missing piece an external review
  // flagged: today only aggregate percentages ever reach disk.
  const rawResponses = {};

  const classes = await judgeClasses({ apiKey, model, chat, unmatchedGold: detail.classes.unmatchedGold, unmatchedRecovered: detail.classes.unmatchedRecovered, onRawResponse: (t) => { rawResponses.classes = t; } });
  const relationships = await judgeRelationships({ apiKey, model, chat, unmatchedGold: detail.relationships.unmatchedGold, unmatchedRecovered: detail.relationships.unmatchedRecovered, onRawResponse: (t) => { rawResponses.relationships = t; } });
  const properties = await judgeProperties({ apiKey, model, chat, unmatchedGold: detail.properties.unmatchedGold, onRawResponse: (t) => { rawResponses.properties = t; } });
  const valueFidelity = await judgeValueFidelity({ apiKey, model, chat, matchedControlledValue: detail.properties.matchedControlledValue, onRawResponse: (t) => { rawResponses.valueFidelity = t; } });

  return { ...aggregateSemanticMetrics({ groundTruth, recoveredState, judgments: { classes, relationships, properties, valueFidelity } }), rawResponses };
}

// The pure, model-call-free half of the semantic pass: given a set of judge
// verdicts (fresh from computeSemanticRecoveryMetrics above, or replayed from
// a saved run's semantic-judgments.json), recompute every semantic metric.
//
// Split out so rescore-saved-run.mjs can re-derive a past run's numbers after
// a scoring change with zero API calls and zero new verdicts -- which is the
// only honest way to rescore: the judge was asked about the near-misses that
// run left, and those questions and answers are fixed artifacts. Re-running
// the judge would be a different measurement, not a re-score.
export function aggregateSemanticMetrics({ groundTruth, recoveredState, judgments }) {
  const heuristic = computeRecoveryMetrics(groundTruth, recoveredState);
  const detail = computeMatchDetail(groundTruth, recoveredState);

  // A verdict only ever *adds* to the heuristic pass, so it may only speak
  // about an item that pass left unmatched. Live, that is automatic -- the
  // judge is handed exactly those items. On a replay it is not: a scoring
  // change can promote an item the judge was once asked about into a
  // heuristic match, and counting the stored verdict too would credit the
  // same gold item twice (recall) while precision saw it once. Verdicts about
  // items the current heuristic pass already matched are therefore dropped,
  // not added -- they cost nothing, since that item is already counted.
  // Issue #133/E15 (external audit): the gold side was filtered to "still
  // unmatched" but the *recovered* side never was, so a replayed judgment
  // naming a recoveredId the current heuristic pass already consumed (for a
  // *different* gold item) got credited a second time on top of that
  // heuristic match -- demonstrated by the audit producing precision=2.00.
  // Both sides now get the same "still unmatched by the current heuristic
  // pass" filter, symmetric with how resolvePropertyJudgments already seeds
  // `taken` from `detail.properties.matchedKeys` for the same reason.
  const stillUnmatched = (list) => new Set(list.map((g) => g.id));
  const unmatchedClassIds = stillUnmatched(detail.classes.unmatchedGold);
  const unmatchedRelIds = stillUnmatched(detail.relationships.unmatchedGold);
  const unmatchedPropIds = stillUnmatched(detail.properties.unmatchedGold);
  const unmatchedRecoveredNodeIds = stillUnmatched(detail.classes.unmatchedRecovered);
  const unmatchedRecoveredEdgeIds = stillUnmatched(detail.relationships.unmatchedRecovered);
  const classJudgments = (judgments.classes || [])
    .filter((j) => unmatchedClassIds.has(j.goldId) && (!j.recoveredId || unmatchedRecoveredNodeIds.has(j.recoveredId)));
  const relJudgments = (judgments.relationships || [])
    .filter((j) => unmatchedRelIds.has(j.goldId) && (!j.recoveredId || unmatchedRecoveredEdgeIds.has(j.recoveredId)));
  const propJudgments = (judgments.properties || []).filter((j) => unmatchedPropIds.has(j.goldId));
  const fidelityJudgments = judgments.valueFidelity || [];

  const { goldIds: extraGoldClassIds, recoveredIds: extraRecoveredNodeIds, matches: resolvedClassMatches } = oneToOneMatchedIds(classJudgments);
  const { goldIds: extraGoldRelIds, recoveredIds: extraRecoveredEdgeIds, matches: resolvedRelMatches } = oneToOneMatchedIds(relJudgments);
  const { goldIds: extraGoldPropIds, recoveredKeys: extraRecoveredPropKeys } = resolvePropertyJudgments(propJudgments, detail.properties);
  const semanticFidelityById = new Map(fidelityJudgments.filter((j) => j.semanticFidelity !== null).map((j) => [j.id, j.semanticFidelity]));

  const classMatched = detail.classes.matchedGoldCount + extraGoldClassIds.size;
  const classRecall = detail.classes.goldTotal ? classMatched / detail.classes.goldTotal : 0;
  const classPrecisionMatched = detail.classes.matchedRecoveredCount + extraRecoveredNodeIds.size;
  const classPrecision = detail.classes.recoveredTotal ? classPrecisionMatched / detail.classes.recoveredTotal : 0;
  const classF1 = f1(classRecall, classPrecision);

  const relMatched = detail.relationships.matchedGoldCount + extraGoldRelIds.size;
  const relRecall = detail.relationships.goldTotal ? relMatched / detail.relationships.goldTotal : 0;
  const relPrecisionMatched = detail.relationships.matchedRecoveredCount + extraRecoveredEdgeIds.size;
  const relPrecision = detail.relationships.recoveredTotal ? relPrecisionMatched / detail.relationships.recoveredTotal : 0;
  const relF1 = f1(relRecall, relPrecision);

  const propMatched = detail.properties.matchedGoldCount + extraGoldPropIds.size;
  const propertyRecall = detail.properties.goldTotal ? propMatched / detail.properties.goldTotal : 0;
  const propPrecisionMatched = detail.properties.matchedRecoveredCount + extraRecoveredPropKeys.size;
  const propertyPrecision = detail.properties.recoveredTotal ? propPrecisionMatched / detail.properties.recoveredTotal : 0;
  const propertyF1 = f1(propertyRecall, propertyPrecision);

  // Value fidelity: the judge's semantic score replaces the heuristic
  // Jaccard score for a matched property only when it actually returned
  // one (a parse failure falls back to the heuristic score rather than
  // silently dropping that property's contribution).
  const fidelityScores = detail.properties.matchedControlledValue.map((p) =>
    semanticFidelityById.has(p.id) ? semanticFidelityById.get(p.id) : p.heuristicFidelity
  );
  const controlledValueFidelity = fidelityScores.length ? fidelityScores.reduce((a, b) => a + b, 0) / fidelityScores.length : null;

  // Same fixed, always-3-component composite as computeRecoveryMetrics --
  // issue #133/E6, see that function's own comment for why the divisor must
  // never silently vary with whether a controlled-value property happened
  // to be matched. recoveryEffectivenessWithFidelity is the separate,
  // distinctly-named 4-component variant.
  const recoveryEffectiveness = (classF1 + relF1 + propertyF1) / 3;
  const recoveryEffectivenessWithFidelity = controlledValueFidelity !== null
    ? (classF1 + relF1 + propertyF1 + controlledValueFidelity) / 4
    : null;

  // Invariant, issue #133/E15: every recall/precision/F1 above must be a
  // real fraction. A failure here means a judgment slipped past both the
  // gold-side and recovered-side "still unmatched" filters above and is
  // double-crediting something the heuristic pass already counted --
  // exactly the class of bug this ticket exists to catch, not something to
  // silently clamp and paper over.
  for (const [name, value] of [
    ["classRecall", classRecall], ["classPrecision", classPrecision],
    ["relRecall", relRecall], ["relPrecision", relPrecision],
    ["propertyRecall", propertyRecall], ["propertyPrecision", propertyPrecision],
  ]) {
    if (!(value >= 0 && value <= 1)) throw new Error(`aggregateSemanticMetrics: ${name}=${value} is outside [0,1] -- a judgment double-credited an already heuristically-matched item`);
  }

  return {
    classes: { recall: classRecall, precision: classPrecision, f1: classF1, matched: classMatched, groundTruthTotal: detail.classes.goldTotal, recoveredTotal: detail.classes.recoveredTotal },
    relationships: { recall: relRecall, precision: relPrecision, f1: relF1, matched: relMatched, groundTruthTotal: detail.relationships.goldTotal, recoveredTotal: detail.relationships.recoveredTotal },
    properties: { recall: propertyRecall, precision: propertyPrecision, f1: propertyF1, matched: propMatched, groundTruthTotal: detail.properties.goldTotal, recoveredTotal: detail.properties.recoveredTotal },
    controlledValueFidelity,
    controlledValuePropertyGoldTotal: detail.properties.controlledValuePropertyGoldTotal,
    controlledValuePropertyMatchedCount: fidelityScores.length,
    recoveryEffectiveness,
    recoveryEffectivenessWithFidelity,
    judgeCallCount: [detail.classes.unmatchedGold.length && detail.classes.unmatchedRecovered.length,
      detail.relationships.unmatchedGold.length && detail.relationships.unmatchedRecovered.length,
      detail.properties.unmatchedGold.some((p) => p.recoveredHostProperties.length),
      detail.properties.matchedControlledValue.length].filter(Boolean).length,
    // Additive fields (existing callers only ever destructured the metrics
    // fields above, via `"x" in result`-style checks, not a strict shape
    // match -- see tests/ontology-recovery-llm-matching.spec.mjs's own live
    // shape test) -- the full per-item judgments (MATCH and NO MATCH alike)
    // plus each judge call's raw response text, for
    // tests/evals/results/semantic-judgments.json and
    // semantic-matches.json (reportGenerator.mjs's new writers).
    judgments: { classes: classJudgments, relationships: relJudgments, properties: propJudgments, valueFidelity: fidelityJudgments },
    // The one-to-one-*resolved* MATCH pairs only (a subset of judgments.* --
    // excludes NO MATCH items and any judge verdict that lost its conflict to
    // a rival under oneToOneMatchedIds / resolvePropertyJudgments). For
    // tests/evals/results/semantic-matches.json. Heuristic counts the run was
    // built on travel alongside them, so a rescore can be checked against the
    // pass it was layered onto.
    resolvedMatches: {
      classes: resolvedClassMatches,
      relationships: resolvedRelMatches,
      properties: resolvePropertyJudgments(propJudgments, detail.properties).matches
        .map(({ goldId, matchedPropertyName }) => ({ goldId, matchedPropertyName })),
      valueFidelity: fidelityJudgments.filter((j) => j.semanticFidelity !== null),
    },
    heuristic,
  };
}

// Rule/action counterpart to computeSemanticRecoveryMetrics above (issue
// #105) -- deliberately a separate, standalone function rather than folded
// into computeSemanticRecoveryMetrics/aggregateSemanticMetrics, whose
// existing return shape reportGenerator.mjs and rescore-saved-run.mjs
// already depend on; adding fields there risked a regression in exactly
// the code this change isn't supposed to touch. Same two-layer pattern
// (heuristic first, then judge the residual, then recompute recall/
// precision/F1 with the extra matches added), scoped to identification
// only for both rules and actions -- see recoveryMetrics.mjs's
// computeRuleMatchDetail/computeActionMatchDetail for why the action
// component metrics (input-class accuracy, precondition/effect/
// verification recovery) are not semantically re-judged here, only
// recomputed from the now-larger matched set.
export async function computeSemanticRuleActionMetrics({ groundTruth, recoveredState, apiKey, model, chat = null }) {
  const ruleDetail = computeRuleMatchDetail(groundTruth, recoveredState.rules || []);
  const actionDetail = computeActionMatchDetail(groundTruth, recoveredState);

  const rawResponses = {};
  const ruleJudgments = await judgeRules({
    apiKey, model, chat, unmatchedGold: ruleDetail.unmatchedGold, unmatchedRecovered: ruleDetail.unmatchedRecovered,
    onRawResponse: (t) => { rawResponses.rules = t; },
  });
  const actionJudgments = await judgeActions({
    apiKey, model, chat, unmatchedGold: actionDetail.unmatchedGold, unmatchedRecovered: actionDetail.unmatchedRecovered,
    onRawResponse: (t) => { rawResponses.actions = t; },
  });

  return { ...aggregateSemanticRuleActionMetrics({ groundTruth, recoveredState, judgments: { rules: ruleJudgments, actions: actionJudgments } }), rawResponses };
}

// The pure, model-call-free half, split out for the same replay/rescore
// reason aggregateSemanticMetrics is above.
export function aggregateSemanticRuleActionMetrics({ groundTruth, recoveredState, judgments }) {
  const ruleDetail = computeRuleMatchDetail(groundTruth, recoveredState.rules || []);
  const actionDetail = computeActionMatchDetail(groundTruth, recoveredState);

  const stillUnmatched = (list) => new Set(list.map((g) => g.id));
  const unmatchedRuleIds = stillUnmatched(ruleDetail.unmatchedGold);
  const unmatchedActionIds = stillUnmatched(actionDetail.unmatchedGold);
  const ruleJudgments = (judgments.rules || []).filter((j) => unmatchedRuleIds.has(j.goldId));
  const actionJudgments = (judgments.actions || []).filter((j) => unmatchedActionIds.has(j.goldId));

  const { goldIds: extraRuleGoldIds, recoveredIds: extraRuleRecoveredIds, matches: resolvedRuleMatches } = oneToOneMatchedIds(ruleJudgments);
  const { goldIds: extraActionGoldIds, recoveredIds: extraActionRecoveredIds, matches: resolvedActionMatches } = oneToOneMatchedIds(actionJudgments);

  const ruleMatched = ruleDetail.matchedGoldCount + extraRuleGoldIds.size;
  const ruleRecall = ruleDetail.goldTotal ? ruleMatched / ruleDetail.goldTotal : 0;
  const rulePrecisionMatched = ruleDetail.matchedRecoveredCount + extraRuleRecoveredIds.size;
  const rulePrecision = ruleDetail.recoveredTotal ? rulePrecisionMatched / ruleDetail.recoveredTotal : 0;

  const actionMatched = actionDetail.matchedGoldCount + extraActionGoldIds.size;
  const actionRecall = actionDetail.goldTotal ? actionMatched / actionDetail.goldTotal : 0;
  const actionPrecisionMatched = actionDetail.matchedRecoveredCount + extraActionRecoveredIds.size;
  const actionPrecision = actionDetail.recoveredTotal ? actionPrecisionMatched / actionDetail.recoveredTotal : 0;

  return {
    rules: {
      recall: ruleRecall, precision: rulePrecision, f1: f1(ruleRecall, rulePrecision),
      matched: ruleMatched, groundTruthTotal: ruleDetail.goldTotal, recoveredTotal: ruleDetail.recoveredTotal,
    },
    // Component metrics (input-class accuracy, precondition/effect/
    // verification recovery) are heuristic-only by design (see this
    // function's own module comment) -- recomputed here from the full
    // recovered state so a caller reading this one function's output still
    // sees them, not because the semantic judge itself re-scored them.
    actions: {
      recall: actionRecall, precision: actionPrecision, f1: f1(actionRecall, actionPrecision),
      matched: actionMatched, groundTruthTotal: actionDetail.goldTotal, recoveredTotal: actionDetail.recoveredTotal,
      components: computeActionMetrics(groundTruth, recoveredState),
    },
    judgeCallCount: [
      ruleDetail.unmatchedGold.length && ruleDetail.unmatchedRecovered.length,
      actionDetail.unmatchedGold.length && actionDetail.unmatchedRecovered.length,
    ].filter(Boolean).length,
    judgments: { rules: ruleJudgments, actions: actionJudgments },
    resolvedMatches: { rules: resolvedRuleMatches, actions: resolvedActionMatches },
    heuristic: { rules: computeRuleMetrics(groundTruth, recoveredState.rules || []), actions: computeActionMetrics(groundTruth, recoveredState) },
  };
}
