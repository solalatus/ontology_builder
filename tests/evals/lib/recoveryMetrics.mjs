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

// Checks a gold relationship's label against a recovered edge's label --
// each side widened by its own aliases when it has any. Previously only
// the recovered side could carry aliases (the app's edges gained an
// aliases field after a real eval run found synonyms with nowhere to go --
// see the module comment on relationshipRecovered's old inline version);
// gold's own predicate label had nowhere to put one, since the MTSR
// fixture's predicates never declared any. `.domain.yaml`-sourced ground
// truth (issue #104) genuinely can: its own relationships carry a real
// `aliases:` field the compiler pipeline populates from source synonyms,
// so this is no longer a one-sided widening by construction -- MTSR-
// sourced relationships simply have an empty `rel.aliases` and this
// degrades to exactly the old one-sided behavior for them, zero change.
export function relationshipLabelMatchesEdge(rel, edge, thresholds = MATCH_THRESHOLDS) {
  const goldLabels = [rel.label, ...(rel.aliases || [])];
  const edgeLabels = [edge.relation, ...(edge.aliases || [])];
  return goldLabels.some((g) => edgeLabels.some((c) => labelsMatch(g, c, thresholds.relationshipOrProperty)));
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
export function matchClasses(groundTruth, recoveredNodes, thresholds = MATCH_THRESHOLDS) {
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
      if (bestScore >= thresholds.class) {
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

// Builds { goldPropertyId -> recovered property } the same way matchClasses
// builds its class assignment: every gold property whose host class matched
// contributes a weighted candidate edge to each property of that matched
// node clearing REL_PROP_LABEL_MATCH_THRESHOLD, and maxWeightBipartiteMatching
// picks the globally optimal assignment.
//
// One-to-one for the same reason classes are. The earlier per-gold-property
// `.find()` accepted the first threshold-passing property independently for
// each gold property, so one recovered property could be credited to several
// gold properties at once -- the property-level form of the many-to-one
// defect an external review found at class level. It also left the dimension
// with no precision figure at all, because a recovered property was never
// consumed by exactly one gold property and so could not be counted against
// a denominator. The assignment below fixes both: `matchedKeys.size` is
// simultaneously the recall numerator and the precision numerator.
//
// Recovered properties are keyed by node id plus their index within that
// node, not by name, so two same-named properties on one node stay distinct
// candidates instead of silently collapsing into one.
export function matchProperties(groundTruth, recoveredNodes, gtToRecovered, thresholds = MATCH_THRESHOLDS) {
  const nodesById = new Map(recoveredNodes.map((n) => [n.id, n]));
  const propertyByKey = new Map();
  const candidateEdges = [];
  for (const prop of groundTruth.properties) {
    for (const nodeId of gtToRecovered.get(prop.classId) || []) {
      const node = nodesById.get(nodeId);
      if (!node) continue;
      (node.properties || []).forEach((p, index) => {
        const key = `${nodeId}::${index}`;
        propertyByKey.set(key, { nodeId, index, property: p });
        const score = labelSimilarity(prop.label, p.name);
        if (score >= thresholds.relationshipOrProperty) {
          candidateEdges.push({ left: prop.id, right: key, weight: score });
        }
      });
    }
  }
  const assignment = maxWeightBipartiteMatching(candidateEdges);
  const goldToRecovered = new Map();
  for (const { left, right } of assignment) {
    goldToRecovered.set(left, { key: right, ...propertyByKey.get(right) });
  }
  // Precision denominator: every property of every recovered class, matched
  // host class or not -- the same "complete recovered set of that kind" rule
  // classes and relationships already use, so a model that invents
  // properties on classes gold never had is penalised the same way one that
  // invents whole classes is.
  const recoveredTotal = recoveredNodes.reduce((a, n) => a + (n.properties || []).length, 0);
  return {
    goldToRecovered,
    matchedKeys: new Set(assignment.map((e) => e.right)),
    recoveredTotal,
    matches: assignment.map(({ left, right, weight }) => ({
      goldId: left, recoveredId: right, recoveredName: (propertyByKey.get(right) || {}).property?.name, weight,
    })),
  };
}

export function computeRecoveryMetrics(groundTruth, recoveredState, thresholds = MATCH_THRESHOLDS) {
  const nodes = recoveredState.nodes || [];
  const edges = recoveredState.edges || [];
  const { gtToRecovered, recoveredToGt } = matchClasses(groundTruth, nodes, thresholds);

  // Classes
  const classMatchedCount = gtToRecovered.size;
  const classRecall = Object.keys(groundTruth.classes).length
    ? classMatchedCount / Object.keys(groundTruth.classes).length : 0;
  const classPrecision = nodes.length ? recoveredToGt.size / nodes.length : 0;

  // Relationships: a ground-truth relationship is recovered if some edge
  // connects a recovered-node-matched-to-fromClass to a recovered-node-
  // matched-to-toClass with a semantically close relation label. Checks
  // both sides' aliases (relationshipLabelMatchesEdge, above) -- gold's own
  // relationship can carry real aliases now (.domain.yaml-sourced ground
  // truth; MTSR-sourced relationships simply have none, unaffected).
  //
  // A gt relationship carrying `reciprocalLabel` (groundTruthModel.mjs's
  // mergeReciprocalRelationshipPairs) represents one real-world connection
  // gold happened to phrase from both ends -- recovered as satisfied by
  // either direction, not both, since a correctly-modeled recovered graph
  // only ever has one edge for it.
  function reciprocalOf(rel) {
    return rel.reciprocalLabel ? { label: rel.reciprocalLabel, aliases: rel.reciprocalAliases || [] } : null;
  }
  function relationshipRecovered(rel, fromNodeIds, toNodeIds) {
    const forward = edges.some((e) => fromNodeIds.has(e.source) && toNodeIds.has(e.target) && relationshipLabelMatchesEdge(rel, e, thresholds));
    if (forward) return true;
    const reciprocal = reciprocalOf(rel);
    if (!reciprocal) return false;
    return edges.some((e) => toNodeIds.has(e.source) && fromNodeIds.has(e.target) && relationshipLabelMatchesEdge(reciprocal, e, thresholds));
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
      const forward = rel.fromClassId === srcGtClass && rel.toClassId === tgtGtClass && relationshipLabelMatchesEdge(rel, e, thresholds);
      if (forward) return true;
      const reciprocal = reciprocalOf(rel);
      if (!reciprocal) return false;
      return rel.toClassId === srcGtClass && rel.fromClassId === tgtGtClass && relationshipLabelMatchesEdge(reciprocal, e, thresholds);
    });
    if (matchesSomeGtRel) recoveredRelMatchedToGt++;
  }
  const relPrecision = edges.length ? recoveredRelMatchedToGt / edges.length : 0;

  // Properties (+ controlled-value fidelity for matched controlled-value properties)
  const propMatch = matchProperties(groundTruth, nodes, gtToRecovered, thresholds);
  const propMatched = propMatch.goldToRecovered.size;
  const fidelityScores = [];
  for (const prop of groundTruth.properties) {
    const hit = propMatch.goldToRecovered.get(prop.id);
    if (hit && prop.allowedValues && prop.allowedValues.length) {
      fidelityScores.push(jaccard(prop.allowedValues, hit.property.allowed || []));
    }
  }
  const propertyRecall = groundTruth.properties.length ? propMatched / groundTruth.properties.length : 0;
  const propertyPrecision = propMatch.recoveredTotal ? propMatch.matchedKeys.size / propMatch.recoveredTotal : 0;
  const controlledValueFidelity = fidelityScores.length
    ? fidelityScores.reduce((a, b) => a + b, 0) / fidelityScores.length : null;

  const classF1 = f1(classRecall, classPrecision);
  const relationshipF1 = f1(relRecall, relPrecision);
  const propertyF1 = f1(propertyRecall, propertyPrecision);

  // Composite "recovery effectiveness": equal-weighted average of the four
  // headline dimensions (class F1, relationship F1, property F1, value
  // fidelity) -- a documented default, not a derived/statistically-fit
  // weighting. Value fidelity is excluded from the average (treated as 0
  // contribution weight) when no controlled-value property was ever
  // matched, rather than penalizing a short interview that just never
  // reached that territory. The property term was property *recall* until
  // that dimension gained a precision figure (matchProperties above); it is
  // F1 now, so all three dimensions enter the composite like for like and a
  // model that lists many unmatched properties no longer scores as well here
  // as one that lists only the ones gold actually has.
  const components = [classF1, relationshipF1, propertyF1];
  if (controlledValueFidelity !== null) components.push(controlledValueFidelity);
  const recoveryEffectiveness = components.reduce((a, b) => a + b, 0) / components.length;

  return {
    classes: { recall: classRecall, precision: classPrecision, f1: classF1, matched: classMatchedCount, groundTruthTotal: Object.keys(groundTruth.classes).length, recoveredTotal: nodes.length },
    relationships: { recall: relRecall, precision: relPrecision, f1: relationshipF1, matched: relMatched, groundTruthTotal: groundTruth.relationships.length, recoveredTotal: edges.length },
    properties: { recall: propertyRecall, precision: propertyPrecision, f1: propertyF1, matched: propMatched, groundTruthTotal: groundTruth.properties.length, recoveredTotal: propMatch.recoveredTotal },
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
export function computeMatchDetail(groundTruth, recoveredState, thresholds = MATCH_THRESHOLDS) {
  const nodes = recoveredState.nodes || [];
  const edges = recoveredState.edges || [];
  const { gtToRecovered, recoveredToGt } = matchClasses(groundTruth, nodes, thresholds);

  const matchedGtClassIds = new Set(gtToRecovered.keys());
  const matchedRecoveredNodeIds = new Set(recoveredToGt.keys());
  const unmatchedGoldClasses = Object.values(groundTruth.classes)
    .filter((c) => !matchedGtClassIds.has(c.id))
    .map((c) => ({ id: c.id, label: c.label, aliases: c.aliases }));
  const unmatchedRecoveredNodes = nodes
    .filter((n) => !matchedRecoveredNodeIds.has(n.id))
    .map((n) => ({ id: n.id, label: n.label, meaning: n.meaning, aliases: n.aliases || [] }));

  function reciprocalOf(rel) {
    return rel.reciprocalLabel ? { label: rel.reciprocalLabel, aliases: rel.reciprocalAliases || [] } : null;
  }
  function relationshipHeuristicMatch(rel, fromNodeIds, toNodeIds) {
    const forward = edges.some((e) => fromNodeIds.has(e.source) && toNodeIds.has(e.target) && relationshipLabelMatchesEdge(rel, e, thresholds));
    if (forward) return true;
    const reciprocal = reciprocalOf(rel);
    if (!reciprocal) return false;
    return edges.some((e) => toNodeIds.has(e.source) && fromNodeIds.has(e.target) && relationshipLabelMatchesEdge(reciprocal, e, thresholds));
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
      const forward = rel.fromClassId === srcGtClass && rel.toClassId === tgtGtClass && relationshipLabelMatchesEdge(rel, e, thresholds);
      if (forward) return true;
      const reciprocal = reciprocalOf(rel);
      if (!reciprocal) return false;
      return rel.toClassId === srcGtClass && rel.fromClassId === tgtGtClass && relationshipLabelMatchesEdge(reciprocal, e, thresholds);
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

  const propMatch = matchProperties(groundTruth, nodes, gtToRecovered, thresholds);
  const unmatchedGoldProperties = [];
  const matchedControlledValueProperties = [];
  let propEligibleCount = 0, propMatchedCount = 0;
  for (const prop of groundTruth.properties) {
    const nodeIds = gtToRecovered.get(prop.classId) || [];
    if (!nodeIds.length) continue; // host class never matched -- not a wording question
    propEligibleCount++;
    const hit = propMatch.goldToRecovered.get(prop.id);
    const matchedProp = hit ? hit.property : null;
    if (!matchedProp) {
      const hostNode = nodes.find((n) => nodeIds.includes(n.id));
      // The judge is offered the host node's properties that the
      // deterministic assignment did not already consume -- offering it one
      // another gold property already owns would let the semantic pass
      // reintroduce exactly the many-to-one crediting matchProperties exists
      // to prevent. The parallel `...Keys` array lets llmMatcher.mjs resolve
      // a judge's chosen name back to the one recovered property it refers
      // to, for the semantic pass's own precision denominator.
      const offered = (hostNode && hostNode.properties || [])
        .map((p, index) => ({ name: p.name, key: `${hostNode.id}::${index}` }))
        .filter((p) => !propMatch.matchedKeys.has(p.key));
      unmatchedGoldProperties.push({
        id: prop.id, label: prop.label, hostClassLabel: labelOf(prop.classId),
        hostNodeId: (hostNode && hostNode.id) || null,
        recoveredHostProperties: offered.map((p) => p.name),
        recoveredHostPropertyKeys: offered.map((p) => p.key),
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
      // Precision-side counts, mirroring the class/relationship blocks above,
      // so the semantic pass can compute a property precision on the same
      // denominator the deterministic pass uses.
      matchedRecoveredCount: propMatch.matchedKeys.size, recoveredTotal: propMatch.recoveredTotal,
      matchedKeys: [...propMatch.matchedKeys],
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
export function computeHeuristicMatchPairs(groundTruth, recoveredState, thresholds = MATCH_THRESHOLDS) {
  const nodes = recoveredState.nodes || [];
  const edges = recoveredState.edges || [];
  const { gtToRecovered, matches: classMatches } = matchClasses(groundTruth, nodes, thresholds);

  const relationshipMatches = [];
  for (const rel of groundTruth.relationships) {
    const fromNodeIds = new Set(gtToRecovered.get(rel.fromClassId) || []);
    const toNodeIds = new Set(gtToRecovered.get(rel.toClassId) || []);
    if (!fromNodeIds.size || !toNodeIds.size) continue;
    const forwardEdge = edges.find((e) => fromNodeIds.has(e.source) && toNodeIds.has(e.target) && relationshipLabelMatchesEdge(rel, e, thresholds));
    if (forwardEdge) { relationshipMatches.push({ goldId: rel.id, edgeId: forwardEdge.id, direction: "forward" }); continue; }
    if (rel.reciprocalLabel) {
      const reciprocal = { label: rel.reciprocalLabel, aliases: rel.reciprocalAliases || [] };
      const reciprocalEdge = edges.find((e) => toNodeIds.has(e.source) && fromNodeIds.has(e.target) && relationshipLabelMatchesEdge(reciprocal, e, thresholds));
      if (reciprocalEdge) relationshipMatches.push({ goldId: rel.id, edgeId: reciprocalEdge.id, direction: "reciprocal" });
    }
  }

  // Properties reuse matchProperties's one-to-one assignment for the same
  // reason classes reuse matchClasses's: it is exactly the pairing the
  // reported numbers were computed from, so heuristic-matches.json records
  // what actually produced them rather than a second, looser re-derivation.
  const propertyMatches = [...matchProperties(groundTruth, nodes, gtToRecovered, thresholds).goldToRecovered]
    .map(([goldId, hit]) => ({ goldId, hostNodeId: hit.nodeId, matchedPropertyName: hit.property.name }));

  return { classes: classMatches, relationships: relationshipMatches, properties: propertyMatches };
}

// ---------------------------------------------------------------------------
// Rules and actions (issue #105) -- deliberately standalone functions, not
// folded into computeRecoveryMetrics above. Two reasons: (1) the issue's own
// explicit instruction not to change the existing recoveryEffectiveness
// composite is easiest to honor with certainty by never touching that
// function's return shape at all, rather than adding fields to it and
// trusting nothing downstream accidentally picks them up; (2) action
// component scoring needs its own class-match pass (for input-class
// accuracy) -- computeMatchDetail/computeHeuristicMatchPairs above already
// established the precedent of independently re-deriving matchClasses's
// assignment rather than threading a shared result through, so this follows
// the same "zero risk of behavior drift in the untouched functions" logic.
//
// Ground truth has no rules concept at all for MTSR-sourced domains
// (groundTruth.rules is always []) -- every metric here degrades gracefully
// to 0/null in that case, the same "nothing to recover, nothing recovered"
// convention every other empty-denominator case in this file already uses.

const RULE_MATCH_THRESHOLD = 0.35;
// "A rule is recovered only if the core decision condition is semantically
// equivalent; matching the name alone is insufficient" (issue #105's own
// words) -- the combined threshold above is dominated by condition
// similarity (weighted 0.7 vs name's 0.3 below), but a rule with a
// coincidentally similar name and near-zero real condition overlap could
// still clear it on name alone if condition similarity were simply low
// rather than genuinely zero. This second, independent floor makes that
// literal instruction a hard requirement, not just a weighting preference.
const RULE_CONDITION_MIN_OVERLAP = 0.12;

function ruleConditionText(rule) {
  return (rule.conditions || []).join(" ");
}

// One-to-one bipartite match, same shape as matchClasses/matchProperties
// above. Candidate weight combines name similarity and condition-text
// similarity (labelSimilarity reused directly -- it is already exactly
// "tokenize two free-text strings and Jaccard the token sets," which is
// the right operation for condition prose too, not just short labels).
export function matchRules(groundTruth, recoveredRules, thresholds = MATCH_THRESHOLDS) {
  const gtRules = groundTruth.rules || [];
  const candidateEdges = [];
  for (const gtRule of gtRules) {
    for (const rec of recoveredRules) {
      const nameSim = labelSimilarity(gtRule.label, rec.name);
      const conditionSim = labelSimilarity(ruleConditionText(gtRule), ruleConditionText(rec));
      const combined = 0.3 * nameSim + 0.7 * conditionSim;
      if (combined >= RULE_MATCH_THRESHOLD && conditionSim >= RULE_CONDITION_MIN_OVERLAP) {
        candidateEdges.push({ left: gtRule.id, right: rec.id, weight: combined });
      }
    }
  }
  const assignment = maxWeightBipartiteMatching(candidateEdges);
  const gtToRecovered = new Map();
  const recoveredToGt = new Map();
  for (const { left, right } of assignment) {
    gtToRecovered.set(left, right);
    recoveredToGt.set(right, left);
  }
  return { gtToRecovered, recoveredToGt, matches: assignment.map(({ left, right, weight }) => ({ goldId: left, recoveredId: right, weight })) };
}

// Rule precision/recall/F1 -- issue #105's own explicit requirement.
// Deliberately just identification (is this rule recovered at all, under
// the "real condition equivalence" bar above), not a blend with anything
// else -- matches classes/relationships/properties, which are all pure
// identification F1 too; component-level detail lives in
// computeActionMetrics below for actions, and rules have no further
// components of their own to report separately.
export function computeRuleMetrics(groundTruth, recoveredRules, thresholds = MATCH_THRESHOLDS) {
  const gtRules = groundTruth.rules || [];
  const { gtToRecovered, recoveredToGt } = matchRules(groundTruth, recoveredRules, thresholds);
  const matched = gtToRecovered.size;
  const recall = gtRules.length ? matched / gtRules.length : 0;
  const precision = recoveredRules.length ? recoveredToGt.size / recoveredRules.length : 0;
  return { recall, precision, f1: f1(recall, precision), matched, groundTruthTotal: gtRules.length, recoveredTotal: recoveredRules.length };
}

// Action identification -- same one-to-one bipartite shape as matchRules,
// weighted purely on name/meaning similarity. Input-class agreement is
// deliberately NOT part of the matching weight here: issue #105 lists
// "correct effect but wrong input class" as a required test scenario,
// which only makes sense if a wrong input class does not prevent the
// action itself from being identified -- it is scored as its own separate
// component metric below instead (computeActionMetrics), never a gate on
// whether the action counts as found at all.
export function matchActions(groundTruth, recoveredActions, thresholds = MATCH_THRESHOLDS) {
  const gtActions = groundTruth.actions || [];
  const candidateEdges = [];
  for (const gtAction of gtActions) {
    for (const rec of recoveredActions) {
      const score = labelSimilarity(gtAction.label, rec.name);
      if (score >= thresholds.relationshipOrProperty) {
        candidateEdges.push({ left: gtAction.id, right: rec.id, weight: score });
      }
    }
  }
  const assignment = maxWeightBipartiteMatching(candidateEdges);
  const gtToRecovered = new Map();
  const recoveredToGt = new Map();
  for (const { left, right } of assignment) {
    gtToRecovered.set(left, right);
    recoveredToGt.set(right, left);
  }
  return { gtToRecovered, recoveredToGt, matches: assignment.map(({ left, right, weight }) => ({ goldId: left, recoveredId: right, weight })) };
}

// Resolves a recovered action's own `preconditions` (a list of RULE ids --
// index.html's real data model, mirroring the gold side's pre-resolution
// in groundTruthModel.mjs, see that module's own comment) into the real
// condition text those rules actually carry, by looking them up in the
// recovered state's own rules list. Cannot be done at ground-truth-load
// time the way the gold side is, since it depends on what a live run
// actually recovered.
function resolveRecoveredActionPreconditionText(action, recoveredRules) {
  const rulesById = new Map(recoveredRules.map((r) => [r.id, r]));
  return (action.preconditions || [])
    .flatMap((ruleId) => (rulesById.get(ruleId) || {}).conditions || [])
    .join(" ");
}

function average(scores) {
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

// Action identification recall/precision/F1, plus the four component
// metrics issue #105 asks for reported separately (not blended into one
// number): input-class accuracy, precondition/effect/verification
// recovery. Each component is `null`, not 0, when no MATCHED pair had that
// field populated on the gold side at all -- "do not penalize fields that
// are absent from the reference domain" (the issue's own words) requires a
// real, distinguishable "not applicable" outcome, not a score that looks
// like a genuine 0% recovery of something that was never there to recover.
export function computeActionMetrics(groundTruth, recoveredState, thresholds = MATCH_THRESHOLDS) {
  const gtActions = groundTruth.actions || [];
  const recoveredActions = recoveredState.actions || [];
  const recoveredRules = recoveredState.rules || [];
  const { gtToRecovered: gtToRecoveredClasses } = matchClasses(groundTruth, recoveredState.nodes || [], thresholds);
  const { gtToRecovered, recoveredToGt } = matchActions(groundTruth, recoveredActions, thresholds);

  const matched = gtToRecovered.size;
  const identificationRecall = gtActions.length ? matched / gtActions.length : 0;
  const identificationPrecision = recoveredActions.length ? recoveredToGt.size / recoveredActions.length : 0;
  const identificationF1 = f1(identificationRecall, identificationPrecision);

  const recoveredById = new Map(recoveredActions.map((a) => [a.id, a]));
  let inputClassChecked = 0, inputClassCorrect = 0;
  const preconditionScores = [], effectScores = [], verificationScores = [];

  for (const gtAction of gtActions) {
    const recId = gtToRecovered.get(gtAction.id);
    if (!recId) continue;
    const rec = recoveredById.get(recId);
    if (!rec) continue;

    // Input-class accuracy is only meaningful once the gold input class
    // itself matched *something* recovered (gtToRecoveredClasses, from
    // matchClasses) -- an input class that was never recovered at all is a
    // class-level miss, not an action-input mismatch, same "don't conflate
    // levels" discipline computeMatchDetail applies to relationships above.
    const matchedRecoveredClassIds = gtToRecoveredClasses.get(gtAction.primaryInputClassId) || [];
    if (matchedRecoveredClassIds.length) {
      inputClassChecked++;
      if (rec.inputClassId && matchedRecoveredClassIds.includes(rec.inputClassId)) inputClassCorrect++;
    }

    if (gtAction.preconditions && gtAction.preconditions.length) {
      preconditionScores.push(labelSimilarity(gtAction.preconditions.join(" "), resolveRecoveredActionPreconditionText(rec, recoveredRules)));
    }
    if (gtAction.effect) effectScores.push(labelSimilarity(gtAction.effect, rec.effect || ""));
    if (gtAction.verification) verificationScores.push(labelSimilarity(gtAction.verification, rec.verification || ""));
  }

  return {
    identification: {
      recall: identificationRecall, precision: identificationPrecision, f1: identificationF1,
      matched, groundTruthTotal: gtActions.length, recoveredTotal: recoveredActions.length,
    },
    inputClassAccuracy: inputClassChecked ? inputClassCorrect / inputClassChecked : null,
    inputClassChecked,
    preconditionRecovery: average(preconditionScores),
    effectRecovery: average(effectScores),
    verificationRecovery: average(verificationScores),
  };
}

// The llmMatcher.mjs equivalent of computeMatchDetail above, for rules and
// actions -- the residual unmatched items the semantic-judge supplement
// gets to look at. Deliberately scoped to IDENTIFICATION only: the
// component metrics above (input-class accuracy, precondition/effect/
// verification recovery) stay heuristic-only, the same scope issue #105's
// own "LLM-semantic supplement" section lists (rule/action MATCHING, not a
// semantic re-score of every component the way controlledValueFidelity
// gets one) -- matching classes/relationships' own existing pattern
// exactly, not a new one invented for this issue.
export function computeRuleMatchDetail(groundTruth, recoveredRules, thresholds = MATCH_THRESHOLDS) {
  const gtRules = groundTruth.rules || [];
  const { gtToRecovered, recoveredToGt } = matchRules(groundTruth, recoveredRules, thresholds);
  const unmatchedGold = gtRules.filter((r) => !gtToRecovered.has(r.id));
  const unmatchedRecovered = recoveredRules.filter((r) => !recoveredToGt.has(r.id));
  return {
    unmatchedGold, unmatchedRecovered,
    matchedGoldCount: gtToRecovered.size, matchedRecoveredCount: recoveredToGt.size,
    goldTotal: gtRules.length, recoveredTotal: recoveredRules.length,
  };
}

export function computeActionMatchDetail(groundTruth, recoveredState, thresholds = MATCH_THRESHOLDS) {
  const gtActions = groundTruth.actions || [];
  const recoveredActions = recoveredState.actions || [];
  const { gtToRecovered, recoveredToGt } = matchActions(groundTruth, recoveredActions, thresholds);
  const unmatchedGold = gtActions.filter((a) => !gtToRecovered.has(a.id));
  const unmatchedRecovered = recoveredActions.filter((a) => !recoveredToGt.has(a.id));
  return {
    unmatchedGold, unmatchedRecovered,
    matchedGoldCount: gtToRecovered.size, matchedRecoveredCount: recoveredToGt.size,
    goldTotal: gtActions.length, recoveredTotal: recoveredActions.length,
  };
}
