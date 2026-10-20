// INTERVIEWER PRIOR-KNOWLEDGE ANALYSIS (issue #137, follow-up to #133)
//
// #133's leak guard and Finding A's own retroactive audit both measure one
// direction of contamination: the PERSONA reciting the hidden ground truth's
// raw internal identifiers back at the interviewer. Finding A's own written
// caveat named the mirror-image channel it explicitly did not measure: the
// INTERVIEWER guessing those same raw identifiers because it was plausibly
// pretrained on the published source ontology (Brick, IOF, FIBO) being
// translated, not because it elicited them from the persona. PR #136's
// post-#133 audit quantified that channel on the clean 12-run set for the
// first time, ad hoc; this module makes that measurement a permanent,
// reusable tool instead of a one-off script, since #137 asks for exactly
// this same computation again on the new itops control-arm runs -- and any
// future domain/run added to this benchmark can reuse it without anyone
// re-deriving the method by hand.
//
// WHAT "INTERVIEWER-FIRST" MEANS
// -------------------------------
// Same first-speaker method Finding A used on the persona side, applied
// symmetrically: for every raw multi-segment gold identifier that appears
// anywhere in the transcript, which side said it FIRST? "First" respects
// the real turn order the orchestrator actually produces -- within one turn
// number the interviewer's statement (app-assistant) precedes that same
// turn's persona reply (confirmed against real committed transcripts during
// #133's post-merge verification: the two share a turn number, not separate
// ones). An identifier the interviewer says before the persona ever does
// (or that the persona never says at all) is interviewer-first; the
// reverse is persona-first -- the same shape #133's leak guard exists to
// catch and correct.
//
// WHAT "ENDED UP AS A SCORED MATCH" MEANS
// -----------------------------------------
// Whether an interviewer-first raw identifier corresponds to a scored
// heuristic match, checked per element kind against exactly the matching
// this benchmark's own scorer produced (heuristic-matches.json for
// classes/relationships/properties, re-running matchRules/matchActions
// directly for rules/actions, which #105 deliberately keeps out of
// heuristic-matches.json). This is an EXISTENTIAL check, not a specific-
// instance one, for two of the five dimensions -- documented at each
// cross-reference site below. It answers "could this identifier plausibly
// have contributed to a scored match", the same coarseness Finding A's own
// original methodology used, not "this exact recovered element definitely
// came from this exact leaked mention".
import { findLeakedIdentifiers } from "./leakDetector.mjs";
import { matchRules, matchActions } from "./recoveryMetrics.mjs";

// Walks a parsed conversation log (reportGenerator.mjs's parseConversationLog)
// turn by turn and buckets every candidate identifier that appears anywhere
// in the transcript into interviewerFirst or personaFirst, by whichever
// side said it first. `entries` is the full {turn, speaker, text}[] array;
// `candidateSet` is whatever set of raw identifiers this call cares about
// checking (typically leakDetector.mjs's collectMultiSegmentIdentifiers --
// deliberately NOT buildLeakCandidateSet's brief-excluded version, since the
// interviewer is never shown the persona's brief, so whether a word happens
// to appear there has no bearing on the interviewer side -- see that
// function's own header comment).
//
// THE EXPERT'S OWN WORDS COUNT (2026-10-20)
// -----------------------------------------
// A raw identifier is a formatting of words: MaintenanceWorkOrderRecord is
// "maintenance work order record". When the persona says those words in
// plain language and the interviewer then writes them back as the raw
// identifier, the term came from the expert, not from the interviewer's
// memory. Counting only raw forms credited the interviewer with it, so an
// interviewer that happened to echo labels in camelCase scored as heavily
// "contaminated" without knowing anything. So the persona's plain-words
// mentions are tracked too (expertWordsFirst), and an identifier whose
// words the persona said before the interviewer's first raw use is never
// interviewer-first. personaFirst stays raw-only: it is #133's leak guard,
// which is about the persona reciting hidden raw identifiers, and saying a
// term in ordinary words is exactly what the persona is meant to do.

/** "MaintenanceWorkOrderRecord" -> "maintenance work order record". */
export function identifierWords(id) {
  return String(id).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
}

const plainText = (t) => String(t || "").toLowerCase().replace(/[*_`]/g, " ").replace(/[-\s]+/g, " ");
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Whole words at the start, so "close incident" is not found inside
// "foreclose incident"; open at the end, so a plural still counts.
function saysInWords(text, id) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(identifierWords(id))}`).test(text);
}

export function computeFirstSpeakerIdentifiers(entries, candidateSet) {
  const interviewerFirst = new Set();
  const personaFirst = new Set();
  const expertWordsFirst = new Set();
  // Every raw identifier the interviewer has written so far, whoever gets
  // the credit: the leak guard asks only whether the persona wrote a raw
  // form before the interviewer did, as it always has.
  const interviewerWroteRaw = new Set();
  const maxTurn = entries.reduce((m, e) => Math.max(m, e.turn), 0);
  for (let turn = 1; turn <= maxTurn; turn++) {
    const appText = (entries.find((e) => e.turn === turn && e.speaker === "app-assistant") || {}).text || "";
    const personaText = (entries.find((e) => e.turn === turn && e.speaker === "persona") || {}).text || "";
    // Interviewer's statement in this turn is credited before this same
    // turn's persona reply is even checked -- matches the real causal order
    // (the persona is replying TO this turn's interviewer message).
    if (appText) {
      for (const id of findLeakedIdentifiers(appText, candidateSet)) {
        if (!personaFirst.has(id) && !expertWordsFirst.has(id) && !interviewerWroteRaw.has(id)) interviewerFirst.add(id);
        interviewerWroteRaw.add(id);
      }
    }
    if (personaText) {
      for (const id of findLeakedIdentifiers(personaText, candidateSet)) {
        if (!interviewerWroteRaw.has(id)) personaFirst.add(id);
      }
      const plain = plainText(personaText);
      for (const id of candidateSet) {
        if (!interviewerWroteRaw.has(id) && !personaFirst.has(id) && saysInWords(plain, id)) expertWordsFirst.add(id);
      }
    }
  }
  return { interviewerFirst, personaFirst, expertWordsFirst };
}

// Given a set of raw identifiers and everything one completed run produced,
// returns the subset that ended up as a scored heuristic match somewhere.
//
//   domainYamlDoc    -- yaml.load()'d raw reference.domain.yaml (js-yaml
//                        object, NOT the processed ground-truth model) --
//                        needed to map a relationship's goldId (`rel_N`,
//                        zero-indexed -- see groundTruthModel.mjs's own
//                        `id: `rel_${index}`` and #133's post-merge
//                        verification entry in TODO.md for why getting this
//                        index base right matters) back to its raw name/
//                        aliases, since that's what a leaked mention of a
//                        relationship actually looks like in prose.
//   groundTruth       -- loadGroundTruthModel({format:"domain-yaml"}) result,
//                        needed by matchRules/matchActions.
//   recoveredState    -- recoveredStateFromYaml(...).state (nodes/edges/
//                        rules/actions) for the SAME run, needed to
//                        re-derive the rule/action matches
//                        heuristic-matches.json never persists (#105 kept
//                        those two standalone).
//   heuristicMatches  -- the run's own committed heuristic-matches.json
//                        (classes/relationships/properties), i.e. exactly
//                        the assignment the published scores came from --
//                        not re-derived, so this never disagrees with the
//                        run's own reported numbers.
export function crossReferenceMatchedIdentifiers({ identifiers, domainYamlDoc, groundTruth, recoveredState, heuristicMatches }) {
  const matchedClassIds = new Set((heuristicMatches.classes || []).map((m) => m.goldId));

  const ruleMatch = matchRules(groundTruth, (recoveredState && recoveredState.rules) || []);
  const matchedRuleIds = new Set(ruleMatch.gtToRecovered.keys());
  const actionMatch = matchActions(groundTruth, (recoveredState && recoveredState.actions) || []);
  const matchedActionIds = new Set(actionMatch.gtToRecovered.keys());

  // Property goldId is `${classId}.${propName}` (groundTruthModel.mjs's own
  // scheme); a raw identifier as collectRawIdentifiers records it is the
  // bare propName with no class qualifier, so this checks "was a property
  // with exactly this bare name matched on ANY class" -- existential, not
  // instance-specific. A same-named property on two different classes where
  // only one instance matched would read as "matched" here even if a given
  // mention was really about the other, unmatched one.
  const matchedPropertyBareNames = new Set(
    (heuristicMatches.properties || []).map((m) => String(m.goldId).split(".").slice(1).join(".")),
  );

  const rawRelationships = (domainYamlDoc && domainYamlDoc.relationships) || [];
  const matchedRelationshipRawNames = new Set();
  for (const m of (heuristicMatches.relationships || [])) {
    const idx = Number(String(m.goldId).replace(/^rel_/, ""));
    const r = rawRelationships[idx];
    if (!r) continue;
    if (r.name) matchedRelationshipRawNames.add(r.name);
    for (const alias of r.aliases || []) matchedRelationshipRawNames.add(alias);
  }

  const matched = new Set();
  for (const id of identifiers) {
    if (matchedClassIds.has(id) || matchedRuleIds.has(id) || matchedActionIds.has(id)
      || matchedPropertyBareNames.has(id) || matchedRelationshipRawNames.has(id)) {
      matched.add(id);
    }
  }
  return matched;
}
