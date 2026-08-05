// Compares the app's recovered domain model (raw window.__kg.state, read
// straight from the page -- node.label/meaning/aliases/properties,
// edge.source/target/relation) against groundTruthModel.mjs's filtered
// ground truth, and computes the eval's headline metrics.
//
// Matching is heuristic string normalization, not an LLM judge -- simple,
// deterministic, and cheap, at the cost of missing recoveries phrased in a
// very different way than the ground truth's own labels/aliases. Documented
// as a known limitation in tests/evals/README.md rather than solved with a
// second LLM-matching pass, to keep this eval's own moving parts small.

import { maxWeightBipartiteMatching } from "./bipartiteMatching.mjs";

// Recovered relationship names come out of the app in its own camelCase
// dialect ("isImplementedBy", "dependsOn" -- the YAML shape the agent's
// own tool schema uses), while the ground truth's predicate labels are
// natural-language phrases ("is implemented by", "depends on"). Splitting
// camelCase into words *before* lowercasing lets those actually compare
// equal instead of "isimplementedby" (one unsplit token) never overlapping
// with ["implemented", "by"] -- confirmed live: this was silently
// suppressing almost all relationship recall (0.7% despite 60 real
// recovered edges in the run that found it), an eval-tooling bug, not a
// reflection of real interview quality. Same known consecutive-uppercase-
// acronym limitation as the app's own toCamelCaseId() (helper_agent_todo.md
// / TODO.md's own prior note on that) -- not fixed here either, for the
// same reason: not worth the complexity for what's realistically never a
// real predicate name in this domain.
function splitCamelCase(s) {
  return String(s || "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function normalize(s) {
  return splitCamelCase(s)
    .toLowerCase()
    .replace(/[^a-z0-9áéíóöőúüű\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set(["a", "an", "the", "is", "of", "its", "to", "for", "has", "have"]);
function tokenize(s) {
  return normalize(s).split(" ").filter((w) => w && !STOPWORDS.has(w));
}

// Two labels "match" if they're identical after normalization, or their
// stopword-stripped token sets overlap heavily enough (Jaccard >= threshold).
// Plain substring containment was tried first and rejected: "Incident" is a
// substring of "Major Incident", which would wrongly count a single generic
// "Incident" node as recovering the ontology's distinct majorIncident and
// cybersecurityIncident classes too. Token-set Jaccard tolerates real
// rephrasing (a dropped article, reordered words) without conflating
// genuinely different multi-word concepts that merely share a word.
//
// Two different thresholds, not one: classes get every one of the ground
// truth's own declared aliases *and* the recovered node's own
// label/meaning/aliases cross-checked against each other (matchClasses,
// below) -- a rich many-to-many *candidate-label* comparison with real
// tolerance for rephrasing built in, feeding a one-to-one bipartite match
// at the class/node level itself (see matchClasses's own comment).
// Relationships and properties get none of that: the
// fixture's `predicates:` section (both object- and datatype-kind) has no
// `aliases:` field at all, and the app's own edge/property data model has
// no alias concept either (unlike nodes) -- so it's always exactly one
// recorded label against exactly one gold label, with nowhere else to look.
// Auditing a real confirmatory eval run's actual recovered relationships
// against gold (helper_agent_todo.md's dated addendum) found this asymmetry
// silently costing real, correct recoveries at the class threshold: e.g.
// the interviewer recorded "Incident handledUsing Runbook" for gold's
// "Incident is handled with Runbook" (Jaccard 0.33 -- one shared word,
// "handled", out of three total) and "Incident recoveredUsing RecoveryPlan"
// for gold's "Incident is recovered with RecoveryPlan" (same 0.33) -- both
// exactly the same relationship, correct class pair and direction, just a
// "using" vs "with" preposition choice the agent could never have known to
// avoid, since gold's exact wording is deliberately hidden from it. A
// relationship/property match is also always gated by its class pair (or
// host class) already matching, which does most of the disambiguating work
// a class match relies on alone -- so a lower bar here is safe in a way it
// wouldn't be for classes. REL_PROP_LABEL_MATCH_THRESHOLD is set just below
// that real 0.33 case. It does NOT rescue a genuine different-word choice
// with zero token overlap at all (e.g. gold's "impacts" vs a recorded
// "affects" -- Jaccard 0, no threshold fixes that without a synonym
// dictionary this eval deliberately doesn't maintain, see this file's own
// module doc) -- that residual gap is accepted, not silently hidden.
const CLASS_LABEL_MATCH_THRESHOLD = 0.6;
const REL_PROP_LABEL_MATCH_THRESHOLD = 0.3;

// Single exported source of truth for the two thresholds above, for any
// other module (e.g. a comparison-condition baseline script) that needs to
// report or reuse them -- kept in sync with the two consts by construction,
// not a second copy that could drift (EXPERIMENT_BRIEF.md §7.5's own
// "matching thresholds live in one place" requirement).
export const MATCH_THRESHOLDS = {
  class: CLASS_LABEL_MATCH_THRESHOLD,
  relationshipOrProperty: REL_PROP_LABEL_MATCH_THRESHOLD,
};

// The raw Jaccard score behind labelsMatch's threshold check, exposed
// separately so matchClasses (below) can use it as an edge weight for
// one-to-one bipartite matching instead of just a boolean pass/fail.
function labelSimilarity(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = tokenize(a), tb = tokenize(b);
  if (!ta.length || !tb.length) return 0;
  const sa = new Set(ta), sb = new Set(tb);
  let intersection = 0;
  for (const t of sa) if (sb.has(t)) intersection++;
  const union = new Set([...sa, ...sb]).size;
  return union > 0 ? intersection / union : 0;
}

function labelsMatch(a, b, threshold = CLASS_LABEL_MATCH_THRESHOLD) {
  return labelSimilarity(a, b) >= threshold;
}

function jaccard(a, b) {
  const sa = new Set(a.map(normalize));
  const sb = new Set(b.map(normalize));
  if (sa.size === 0 && sb.size === 0) return 1;
  let intersection = 0;
  for (const x of sa) if (sb.has(x)) intersection++;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 1 : intersection / union;
}

function f1(recall, precision) {
  if (recall + precision === 0) return 0;
  return (2 * recall * precision) / (recall + precision);
}

// Builds { gtClassId -> [recoveredNodeId] } by matching each ground-truth
// class's label/aliases against each recovered node's label/meaning/aliases.
//
// One-to-one by construction: every gold-class/recovered-node pair whose
// best alias/label similarity clears CLASS_LABEL_MATCH_THRESHOLD becomes a
// weighted candidate edge, and maxWeightBipartiteMatching (bipartiteMatching.mjs)
// picks the globally optimal assignment where each gold class and each
// recovered node is used at most once. Before this fix, every
// threshold-passing pair was accepted directly -- a single recovered node
// whose aliases happened to overlap two different gold classes (a real,
// confirmed case: an "Incident Commander" node's "major incident manager"
// alias clearing the threshold against both the incidentCommander and
// majorIncident gold classes) counted as recovering *both*, inflating class
// recall (counted per gold class) without inflating precision (deduped per
// node) -- an external review of this eval caught it. gtToRecovered's
// values are still arrays for call-site compatibility, just capped at
// length 1 now; no downstream relationship/property-matching code needed to
// change, since it only ever consumes these two maps as data.
export function matchClasses(groundTruth, recoveredNodes) {
  const candidateEdges = [];
  for (const gtClass of Object.values(groundTruth.classes)) {
    for (const node of recoveredNodes) {
      const candidateLabels = [node.label, node.meaning, ...(node.aliases || [])].filter(Boolean);
      let bestScore = 0;
      for (const gtAlias of gtClass.aliases) {
        for (const c of candidateLabels) {
          const score = labelSimilarity(gtAlias, c);
          if (score > bestScore) bestScore = score;
        }
      }
      if (bestScore >= CLASS_LABEL_MATCH_THRESHOLD) {
        candidateEdges.push({ left: gtClass.id, right: node.id, weight: bestScore });
      }
    }
  }
  const assignment = maxWeightBipartiteMatching(candidateEdges);
  const gtToRecovered = new Map();
  const recoveredToGt = new Map();
  for (const { left, right } of assignment) {
    gtToRecovered.set(left, [right]);
    recoveredToGt.set(right, left);
  }
  // `matches` (the raw {left, right, weight}[] assignment, renamed goldId/
  // recoveredId for readability) is additive -- existing callers destructure
  // only gtToRecovered/recoveredToGt and are unaffected. Exposed for
  // computeHeuristicMatchPairs below, which reuses it directly instead of
  // re-deriving the same assignment a third time.
  return { gtToRecovered, recoveredToGt, matches: assignment.map(({ left, right, weight }) => ({ goldId: left, recoveredId: right, weight })) };
}

export function computeRecoveryMetrics(groundTruth, recoveredState) {
  const nodes = recoveredState.nodes || [];
  const edges = recoveredState.edges || [];
  const { gtToRecovered, recoveredToGt } = matchClasses(groundTruth, nodes);

  // Classes
  const classMatchedCount = gtToRecovered.size;
  const classRecall = Object.keys(groundTruth.classes).length
    ? classMatchedCount / Object.keys(groundTruth.classes).length : 0;
  const classPrecision = nodes.length ? recoveredToGt.size / nodes.length : 0;

  // Relationships: a ground-truth relationship is recovered if some edge
  // connects a recovered-node-matched-to-fromClass to a recovered-node-
  // matched-to-toClass with a semantically close relation label. Checks the
  // edge's own aliases too, not just its primary label -- the app's
  // relationships gained an aliases field (mirroring classes) after a real
  // eval run found the interviewer eliciting real relationship synonyms
  // from the persona with nowhere to store them (see helper_agent_todo.md's
  // dated addendum). Gold's own relationship label still has no alias list
  // (the fixture's predicates never had one, unlike classes) -- this is a
  // one-sided widening on the recovered side only.
  function edgeLabelMatchesGt(gtLabel, edge) {
    const candidates = [edge.relation, ...(edge.aliases || [])];
    return candidates.some((c) => labelsMatch(gtLabel, c, REL_PROP_LABEL_MATCH_THRESHOLD));
  }
  // A gt relationship carrying `reciprocalLabel` (groundTruthModel.mjs's
  // mergeReciprocalRelationshipPairs) represents one real-world connection
  // gold happened to phrase from both ends -- recovered as satisfied by
  // either direction, not both, since a correctly-modeled recovered graph
  // only ever has one edge for it.
  function relationshipRecovered(rel, fromNodeIds, toNodeIds) {
    const forward = edges.some((e) => fromNodeIds.has(e.source) && toNodeIds.has(e.target) && edgeLabelMatchesGt(rel.label, e));
    if (forward) return true;
    if (!rel.reciprocalLabel) return false;
    return edges.some((e) => toNodeIds.has(e.source) && fromNodeIds.has(e.target) && edgeLabelMatchesGt(rel.reciprocalLabel, e));
  }
  let relMatched = 0;
  for (const rel of groundTruth.relationships) {
    const fromNodeIds = new Set(gtToRecovered.get(rel.fromClassId) || []);
    const toNodeIds = new Set(gtToRecovered.get(rel.toClassId) || []);
    if (!fromNodeIds.size || !toNodeIds.size) continue;
    if (relationshipRecovered(rel, fromNodeIds, toNodeIds)) relMatched++;
  }
  const relRecall = groundTruth.relationships.length ? relMatched / groundTruth.relationships.length : 0;
  let recoveredRelMatchedToGt = 0;
  for (const e of edges) {
    const srcGtClass = recoveredToGt.get(e.source);
    const tgtGtClass = recoveredToGt.get(e.target);
    if (!srcGtClass || !tgtGtClass) continue;
    const matchesSomeGtRel = groundTruth.relationships.some((rel) => {
      const forward = rel.fromClassId === srcGtClass && rel.toClassId === tgtGtClass && edgeLabelMatchesGt(rel.label, e);
      if (forward) return true;
      if (!rel.reciprocalLabel) return false;
      return rel.toClassId === srcGtClass && rel.fromClassId === tgtGtClass && edgeLabelMatchesGt(rel.reciprocalLabel, e);
    });
    if (matchesSomeGtRel) recoveredRelMatchedToGt++;
  }
  const relPrecision = edges.length ? recoveredRelMatchedToGt / edges.length : 0;

  // Properties (+ controlled-value fidelity for matched controlled-value properties)
  let propMatched = 0;
  const fidelityScores = [];
  for (const prop of groundTruth.properties) {
    const nodeIds = gtToRecovered.get(prop.classId) || [];
    let matchedProp = null;
    for (const nodeId of nodeIds) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;
      const hit = (node.properties || []).find((p) => labelsMatch(prop.label, p.name, REL_PROP_LABEL_MATCH_THRESHOLD));
      if (hit) { matchedProp = hit; break; }
    }
    if (matchedProp) {
      propMatched++;
      if (prop.allowedValues && prop.allowedValues.length) {
        fidelityScores.push(jaccard(prop.allowedValues, matchedProp.allowed || []));
      }
    }
  }
  const propertyRecall = groundTruth.properties.length ? propMatched / groundTruth.properties.length : 0;
  const controlledValueFidelity = fidelityScores.length
    ? fidelityScores.reduce((a, b) => a + b, 0) / fidelityScores.length : null;

  const classF1 = f1(classRecall, classPrecision);
  const relationshipF1 = f1(relRecall, relPrecision);

  // Composite "recovery effectiveness": equal-weighted average of the four
  // headline dimensions (class F1, relationship F1, property recall, value
  // fidelity) -- a documented default, not a derived/statistically-fit
  // weighting. Value fidelity is excluded from the average (treated as 0
  // contribution weight) when no controlled-value property was ever
  // matched, rather than penalizing a short interview that just never
  // reached that territory.
  const components = [classF1, relationshipF1, propertyRecall];
  if (controlledValueFidelity !== null) components.push(controlledValueFidelity);
  const recoveryEffectiveness = components.reduce((a, b) => a + b, 0) / components.length;

  return {
    classes: { recall: classRecall, precision: classPrecision, f1: classF1, matched: classMatchedCount, groundTruthTotal: Object.keys(groundTruth.classes).length, recoveredTotal: nodes.length },
    relationships: { recall: relRecall, precision: relPrecision, f1: relationshipF1, matched: relMatched, groundTruthTotal: groundTruth.relationships.length, recoveredTotal: edges.length },
    properties: { recall: propertyRecall, matched: propMatched, groundTruthTotal: groundTruth.properties.length },
    controlledValueFidelity,
    recoveryEffectiveness,
  };
}

// MATCH DETAIL FOR THE LLM-JUDGE SUPPLEMENT (llmMatcher.mjs) --------------
// computeRecoveryMetrics above is the fast, free, deterministic pass and is
// left completely untouched by this -- every existing test in
// tests/ontology-recovery-metrics.spec.mjs keeps exercising exactly that
// regex/token-based matcher, unaffected by anything below. This is a
// separate, additive function that re-derives the same matching (some
// duplication with the loops above, accepted deliberately so the heuristic
// function above has zero risk of behavior drift) but also collects what it
// *couldn't* match -- the residual gold items and recovered items llmMatcher.mjs
// hands to a real LLM judge for a second opinion, since a token-overlap
// threshold can't tell "sev1-critical" and "Critical" are the same severity
// scale, only that they don't share enough words.
//
// Deliberately narrow about what counts as a worthwhile residual pair to
// judge: relationships/properties are only included here when their class-
// pair/host-class *already matched* heuristically -- if the endpoint classes
// themselves never matched, no relationship label judgment can rescue that,
// it's a class-level miss already visible in computeRecoveryMetrics's own
// unmatched classes. This keeps the LLM judge's job to exactly the "same
// concept, different words" question it's actually good at, not asked to
// also re-derive class-level matching from scratch.
export function computeMatchDetail(groundTruth, recoveredState) {
  const nodes = recoveredState.nodes || [];
  const edges = recoveredState.edges || [];
  const { gtToRecovered, recoveredToGt } = matchClasses(groundTruth, nodes);

  const matchedGtClassIds = new Set(gtToRecovered.keys());
  const matchedRecoveredNodeIds = new Set(recoveredToGt.keys());
  const unmatchedGoldClasses = Object.values(groundTruth.classes)
    .filter((c) => !matchedGtClassIds.has(c.id))
    .map((c) => ({ id: c.id, label: c.label, aliases: c.aliases }));
  const unmatchedRecoveredNodes = nodes
    .filter((n) => !matchedRecoveredNodeIds.has(n.id))
    .map((n) => ({ id: n.id, label: n.label, meaning: n.meaning, aliases: n.aliases || [] }));

  function edgeLabelMatchesGt(gtLabel, edge) {
    const candidates = [edge.relation, ...(edge.aliases || [])];
    return candidates.some((c) => labelsMatch(gtLabel, c, REL_PROP_LABEL_MATCH_THRESHOLD));
  }
  function relationshipHeuristicMatch(rel, fromNodeIds, toNodeIds) {
    const forward = edges.some((e) => fromNodeIds.has(e.source) && toNodeIds.has(e.target) && edgeLabelMatchesGt(rel.label, e));
    if (forward) return true;
    if (!rel.reciprocalLabel) return false;
    return edges.some((e) => toNodeIds.has(e.source) && fromNodeIds.has(e.target) && edgeLabelMatchesGt(rel.reciprocalLabel, e));
  }
  const labelOf = (id) => (groundTruth.classes[id] || {}).label || id;
  const unmatchedGoldRelationships = [];
  let relEligibleGoldCount = 0, relMatchedGoldCount = 0; // "eligible" = endpoints matched, a real wording question
  for (const rel of groundTruth.relationships) {
    const fromNodeIds = new Set(gtToRecovered.get(rel.fromClassId) || []);
    const toNodeIds = new Set(gtToRecovered.get(rel.toClassId) || []);
    if (!fromNodeIds.size || !toNodeIds.size) continue; // class-level miss, not a wording question
    relEligibleGoldCount++;
    if (relationshipHeuristicMatch(rel, fromNodeIds, toNodeIds)) {
      relMatchedGoldCount++;
    } else {
      unmatchedGoldRelationships.push({
        id: rel.id, label: rel.label, reciprocalLabel: rel.reciprocalLabel || null,
        fromClassLabel: labelOf(rel.fromClassId), toClassLabel: labelOf(rel.toClassId),
      });
    }
  }
  const unmatchedRecoveredEdges = [];
  let relEligibleRecoveredCount = 0, relMatchedRecoveredCount = 0;
  for (const e of edges) {
    const srcGtClass = recoveredToGt.get(e.source);
    const tgtGtClass = recoveredToGt.get(e.target);
    if (!srcGtClass || !tgtGtClass) continue; // endpoints never matched a gt class at all -- not a wording question either
    relEligibleRecoveredCount++;
    const matchesSomeGtRel = groundTruth.relationships.some((rel) => {
      const forward = rel.fromClassId === srcGtClass && rel.toClassId === tgtGtClass && edgeLabelMatchesGt(rel.label, e);
      if (forward) return true;
      if (!rel.reciprocalLabel) return false;
      return rel.toClassId === srcGtClass && rel.fromClassId === tgtGtClass && edgeLabelMatchesGt(rel.reciprocalLabel, e);
    });
    if (matchesSomeGtRel) {
      relMatchedRecoveredCount++;
    } else {
      unmatchedRecoveredEdges.push({
        id: e.id, relation: e.relation, aliases: e.aliases || [],
        fromClassLabel: labelOf(srcGtClass), toClassLabel: labelOf(tgtGtClass),
      });
    }
  }

  const unmatchedGoldProperties = [];
  const matchedControlledValueProperties = [];
  let propEligibleCount = 0, propMatchedCount = 0;
  for (const prop of groundTruth.properties) {
    const nodeIds = gtToRecovered.get(prop.classId) || [];
    if (!nodeIds.length) continue; // host class never matched -- not a wording question
    propEligibleCount++;
    let matchedProp = null;
    for (const nodeId of nodeIds) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;
      const hit = (node.properties || []).find((p) => labelsMatch(prop.label, p.name, REL_PROP_LABEL_MATCH_THRESHOLD));
      if (hit) { matchedProp = hit; break; }
    }
    if (!matchedProp) {
      const hostNode = nodes.find((n) => nodeIds.includes(n.id));
      unmatchedGoldProperties.push({
        id: prop.id, label: prop.label, hostClassLabel: labelOf(prop.classId),
        recoveredHostProperties: (hostNode && hostNode.properties || []).map((p) => p.name),
      });
    } else {
      propMatchedCount++;
    }
    if (matchedProp && prop.allowedValues && prop.allowedValues.length) {
      matchedControlledValueProperties.push({
        id: prop.id, label: prop.label, goldAllowedValues: prop.allowedValues, recoveredAllowedValues: matchedProp.allowed || [],
        heuristicFidelity: jaccard(prop.allowedValues, matchedProp.allowed || []),
      });
    }
  }

  return {
    classes: {
      unmatchedGold: unmatchedGoldClasses, unmatchedRecovered: unmatchedRecoveredNodes,
      matchedGoldCount: matchedGtClassIds.size, matchedRecoveredCount: matchedRecoveredNodeIds.size,
      goldTotal: Object.keys(groundTruth.classes).length, recoveredTotal: nodes.length,
    },
    relationships: {
      unmatchedGold: unmatchedGoldRelationships, unmatchedRecovered: unmatchedRecoveredEdges,
      // "eligible" counts (endpoints matched some gt class) are the real denominators the LLM-judge
      // pass adds on top of -- a relationship/edge whose endpoints never matched anything is a
      // class-level miss and was never eligible for this residual judging in the first place.
      matchedGoldCount: relMatchedGoldCount, eligibleGoldCount: relEligibleGoldCount, goldTotal: groundTruth.relationships.length,
      matchedRecoveredCount: relMatchedRecoveredCount, eligibleRecoveredCount: relEligibleRecoveredCount, recoveredTotal: edges.length,
    },
    properties: {
      unmatchedGold: unmatchedGoldProperties, matchedControlledValue: matchedControlledValueProperties,
      matchedGoldCount: propMatchedCount, eligibleGoldCount: propEligibleCount, goldTotal: groundTruth.properties.length,
    },
  };
}

// MATCHED-PAIR DETAIL, for reproducibility artifacts (tests/evals/results/
// heuristic-matches.json). A third, additive pass over the same matching
// logic as computeRecoveryMetrics/computeMatchDetail above -- same accepted
// duplication, same reasoning as computeMatchDetail's own module comment:
// zero risk of behavior drift in either existing, already-tested function.
//
// Unlike computeMatchDetail (which reports what *didn't* match, for the LLM
// judge), this reports exactly which gold item matched which recovered
// item and why -- the gap an external review flagged: today only aggregate
// percentages ever reach disk, so verifying which specific pairing produced
// them required hand-parsing tool-calls.md. Classes reuse matchClasses's
// own `matches` field directly rather than re-deriving it a third time,
// since that one-to-one assignment is exactly what's needed here too.
export function computeHeuristicMatchPairs(groundTruth, recoveredState) {
  const nodes = recoveredState.nodes || [];
  const edges = recoveredState.edges || [];
  const { gtToRecovered, matches: classMatches } = matchClasses(groundTruth, nodes);

  function edgeLabelMatchesGt(gtLabel, edge) {
    const candidates = [edge.relation, ...(edge.aliases || [])];
    return candidates.some((c) => labelsMatch(gtLabel, c, REL_PROP_LABEL_MATCH_THRESHOLD));
  }

  const relationshipMatches = [];
  for (const rel of groundTruth.relationships) {
    const fromNodeIds = new Set(gtToRecovered.get(rel.fromClassId) || []);
    const toNodeIds = new Set(gtToRecovered.get(rel.toClassId) || []);
    if (!fromNodeIds.size || !toNodeIds.size) continue;
    const forwardEdge = edges.find((e) => fromNodeIds.has(e.source) && toNodeIds.has(e.target) && edgeLabelMatchesGt(rel.label, e));
    if (forwardEdge) { relationshipMatches.push({ goldId: rel.id, edgeId: forwardEdge.id, direction: "forward" }); continue; }
    if (rel.reciprocalLabel) {
      const reciprocalEdge = edges.find((e) => toNodeIds.has(e.source) && fromNodeIds.has(e.target) && edgeLabelMatchesGt(rel.reciprocalLabel, e));
      if (reciprocalEdge) relationshipMatches.push({ goldId: rel.id, edgeId: reciprocalEdge.id, direction: "reciprocal" });
    }
  }

  const propertyMatches = [];
  for (const prop of groundTruth.properties) {
    const nodeIds = gtToRecovered.get(prop.classId) || [];
    for (const nodeId of nodeIds) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;
      const hit = (node.properties || []).find((p) => labelsMatch(prop.label, p.name, REL_PROP_LABEL_MATCH_THRESHOLD));
      if (hit) { propertyMatches.push({ goldId: prop.id, hostNodeId: nodeId, matchedPropertyName: hit.name }); break; }
    }
  }

  return { classes: classMatches, relationships: relationshipMatches, properties: propertyMatches };
}
