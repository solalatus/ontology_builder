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

function normalize(s) {
  return String(s || "")
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
// stopword-stripped token sets overlap heavily (Jaccard >= LABEL_MATCH_THRESHOLD).
// Plain substring containment was tried first and rejected: "Incident" is a
// substring of "Major Incident", which would wrongly count a single generic
// "Incident" node as recovering the ontology's distinct majorIncident and
// cybersecurityIncident classes too. Token-set Jaccard tolerates real
// rephrasing (a dropped article, reordered words) without conflating
// genuinely different multi-word concepts that merely share a word.
const LABEL_MATCH_THRESHOLD = 0.6;
function labelsMatch(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const ta = tokenize(a), tb = tokenize(b);
  if (!ta.length || !tb.length) return false;
  const sa = new Set(ta), sb = new Set(tb);
  let intersection = 0;
  for (const t of sa) if (sb.has(t)) intersection++;
  const union = new Set([...sa, ...sb]).size;
  return union > 0 && intersection / union >= LABEL_MATCH_THRESHOLD;
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

// Builds { gtClassId -> [recoveredNodeIds] } by matching each ground-truth
// class's label/aliases against each recovered node's label/meaning/aliases.
function matchClasses(groundTruth, recoveredNodes) {
  const gtToRecovered = new Map();
  const recoveredToGt = new Map();
  for (const gtClass of Object.values(groundTruth.classes)) {
    const matches = [];
    for (const node of recoveredNodes) {
      const candidateLabels = [node.label, node.meaning, ...(node.aliases || [])].filter(Boolean);
      const isMatch = gtClass.aliases.some((gtAlias) => candidateLabels.some((c) => labelsMatch(gtAlias, c)));
      if (isMatch) {
        matches.push(node.id);
        if (!recoveredToGt.has(node.id)) recoveredToGt.set(node.id, gtClass.id);
      }
    }
    if (matches.length) gtToRecovered.set(gtClass.id, matches);
  }
  return { gtToRecovered, recoveredToGt };
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
  // matched-to-toClass with a semantically close relation label.
  let relMatched = 0;
  for (const rel of groundTruth.relationships) {
    const fromNodeIds = new Set(gtToRecovered.get(rel.fromClassId) || []);
    const toNodeIds = new Set(gtToRecovered.get(rel.toClassId) || []);
    if (!fromNodeIds.size || !toNodeIds.size) continue;
    const found = edges.some((e) => fromNodeIds.has(e.source) && toNodeIds.has(e.target) && labelsMatch(rel.label, e.relation));
    if (found) relMatched++;
  }
  const relRecall = groundTruth.relationships.length ? relMatched / groundTruth.relationships.length : 0;
  let recoveredRelMatchedToGt = 0;
  for (const e of edges) {
    const srcGtClass = recoveredToGt.get(e.source);
    const tgtGtClass = recoveredToGt.get(e.target);
    if (!srcGtClass || !tgtGtClass) continue;
    if (groundTruth.relationships.some((rel) => rel.fromClassId === srcGtClass && rel.toClassId === tgtGtClass && labelsMatch(rel.label, e.relation))) {
      recoveredRelMatchedToGt++;
    }
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
      const hit = (node.properties || []).find((p) => labelsMatch(prop.label, p.name));
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
