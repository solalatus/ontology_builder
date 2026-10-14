// Majority-vote merge of several interview models (issue #174). Pure
// functions over in-memory .domain.yaml documents: no file access, so the
// same core can back a UI later (its output -- groups with support counts and
// a review queue -- maps onto the app's Import Review).
//
// Design: ontology_translation/results/majority-vote/DESIGN.md (pre-registered).
//
//   groups = buildGroups(docs)          which elements of different runs are the same
//   { doc } = buildModel(docs, groups, { runs, threshold })
//   reviewQueue(groups, { runs, threshold })

import { normalizeDomainYamlDoc } from "./groundTruthModel.mjs";
import { matchClasses, matchProperties, matchRelationships, matchRules, matchActions } from "./recoveryMetrics.mjs";
import { recoveredStateFromDoc } from "../score-baseline.mjs";

export const ELEMENT_TYPES = ["classes", "properties", "relationships", "rules", "actions"];

// --- Element keys ------------------------------------------------------------

const classKey = (run, name) => `c|${run}|${name}`;
const propertyKey = (run, className, prop) => `p|${run}|${className}|${prop}`;
const relationshipKey = (run, unit) => `r|${run}|${unit}`;
const ruleKey = (run, name) => `u|${run}|${name}`;
const actionKey = (run, name) => `a|${run}|${name}`;
export const runOf = (key) => Number(key.split("|")[1]);

/**
 * A run's relationships as units: the loader merges a reciprocal pair
 * (A->B plus B->A) into one normalized relationship, which is one element
 * here too. Raw relationships the loader drops (dangling endpoint,
 * subclassing label) become their own unit so nothing silently disappears.
 */
export function relationshipUnits(doc, normalized) {
  const rawToUnit = new Map();
  const units = new Map(); // unit id -> raw indices
  for (const rel of normalized.relationships) {
    const raw = [Number(rel.id.slice(4))];
    if (rel.reciprocalId) raw.push(Number(rel.reciprocalId.slice(4)));
    units.set(rel.id, raw);
    for (const i of raw) rawToUnit.set(i, rel.id);
  }
  (doc.relationships || []).forEach((_, i) => {
    if (!rawToUnit.has(i)) {
      units.set(`raw_${i}`, [i]);
      rawToUnit.set(i, `raw_${i}`);
    }
  });
  return { rawToUnit, units };
}

// --- Grouping ----------------------------------------------------------------

/**
 * Strongest-first union-find with one constraint: a group never holds two
 * elements of the same run. An edge that would break it is skipped and
 * returned as a conflict. Deterministic: weight descending, then pair order,
 * then keys.
 */
export function groupElements(elements, edges) {
  const parent = new Map(elements.map((e) => [e, e]));
  const runs = new Map(elements.map((e) => [e, new Set([runOf(e)])]));
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)));
      x = parent.get(x);
    }
    return x;
  };
  const sorted = [...edges].sort((x, y) =>
    y.weight - x.weight || x.pair - y.pair || x.a.localeCompare(y.a) || x.b.localeCompare(y.b));
  const conflicts = [];
  for (const edge of sorted) {
    if (!parent.has(edge.a) || !parent.has(edge.b)) continue;
    const ra = find(edge.a);
    const rb = find(edge.b);
    if (ra === rb) continue;
    const overlap = [...runs.get(ra)].some((r) => runs.get(rb).has(r));
    if (overlap) {
      conflicts.push(edge);
      continue;
    }
    parent.set(rb, ra);
    for (const r of runs.get(rb)) runs.get(ra).add(r);
  }
  const byRoot = new Map();
  for (const e of elements) {
    const r = find(e);
    if (!byRoot.has(r)) byRoot.set(r, []);
    byRoot.get(r).push(e);
  }
  const groups = [...byRoot.values()].map((members) => members.sort((x, y) => runOf(x) - runOf(y) || x.localeCompare(y)));
  groups.sort((x, y) => x[0].localeCompare(y[0]));
  return { groups, conflicts };
}

/** Groups of every element type across the given documents (one per run). */
export function buildGroups(docs) {
  const normalized = docs.map((d) => normalizeDomainYamlDoc(d));
  const states = docs.map((d) => recoveredStateFromDoc(d).state);
  const units = docs.map((d, i) => relationshipUnits(d, normalized[i]));

  const elements = { classes: [], properties: [], relationships: [], rules: [], actions: [] };
  docs.forEach((doc, run) => {
    for (const [cls, c] of Object.entries(doc.classes || {})) {
      elements.classes.push(classKey(run, cls));
      for (const prop of Object.keys((c && c.properties) || {})) elements.properties.push(propertyKey(run, cls, prop));
    }
    for (const unit of units[run].units.keys()) elements.relationships.push(relationshipKey(run, unit));
    for (const name of Object.keys(doc.rules || {})) elements.rules.push(ruleKey(run, name));
    for (const name of Object.keys(doc.actions || {})) elements.actions.push(actionKey(run, name));
  });

  const edges = { classes: [], properties: [], relationships: [], rules: [], actions: [] };
  let pair = 0;
  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++, pair++) {
      const nodes = states[j].nodes;
      const labelOf = new Map(nodes.map((n) => [n.id, n.label]));
      const classMatch = matchClasses(normalized[i], nodes);
      for (const m of classMatch.matches) {
        edges.classes.push({ a: classKey(i, m.goldId), b: classKey(j, labelOf.get(m.recoveredId)), weight: m.weight, pair });
      }
      for (const m of matchProperties(normalized[i], nodes, classMatch.gtToRecovered).matches) {
        const dot = m.goldId.indexOf(".");
        const nodeId = m.recoveredId.split("::")[0];
        edges.properties.push({
          a: propertyKey(i, m.goldId.slice(0, dot), m.goldId.slice(dot + 1)),
          b: propertyKey(j, labelOf.get(nodeId), m.recoveredName),
          weight: m.weight, pair,
        });
      }
      for (const m of matchRelationships(normalized[i], states[j].edges, classMatch.gtToRecovered).matches) {
        const rawIndex = Number(m.recoveredId.slice(1)) - 1;
        edges.relationships.push({
          a: relationshipKey(i, m.goldId), b: relationshipKey(j, units[j].rawToUnit.get(rawIndex)), weight: m.weight, pair,
        });
      }
      for (const m of matchRules(normalized[i], states[j].rules).matches) {
        edges.rules.push({ a: ruleKey(i, m.goldId), b: ruleKey(j, m.recoveredId), weight: m.weight, pair });
      }
      for (const m of matchActions(normalized[i], states[j].actions).matches) {
        edges.actions.push({ a: actionKey(i, m.goldId), b: actionKey(j, m.recoveredId), weight: m.weight, pair });
      }
    }
  }

  const out = { runs: docs.length, units: units.map((u) => Object.fromEntries(u.units)) };
  for (const type of ELEMENT_TYPES) out[type] = groupElements(elements[type], edges[type]);
  return out;
}

// --- Voting and building a model ---------------------------------------------

/** Members of a group restricted to `runs`, with its support there. */
export function restrict(group, runs) {
  const members = group.filter((k) => runs.includes(runOf(k)));
  return { members, support: new Set(members.map(runOf)).size };
}

const rest = (key, n) => key.split("|").slice(2, 2 + n);

/**
 * Builds a .domain.yaml document from the groups that reach `threshold`
 * support among `runs`, per the design: representative = the member from
 * the lowest-numbered run, used unchanged.
 */
export function buildModel(docs, groups, { runs, threshold }) {
  const stats = { collisions: 0 };
  const kept = (type) => groups[type].groups
    .map((g) => restrict(g, runs))
    .filter((g) => g.support >= threshold)
    // Higher support first, so it keeps the plain name on a collision.
    .sort((x, y) => y.support - x.support || x.members[0].localeCompare(y.members[0]));

  const uniqueName = (taken, name) => {
    if (!taken.has(name)) return name;
    stats.collisions += 1;
    let n = 2;
    while (taken.has(`${name}${n}`)) n += 1;
    return `${name}${n}`;
  };

  // Classes
  const classes = {};
  const classRep = new Map(); // class element key -> output class name
  for (const g of kept("classes")) {
    const [cls] = rest(g.members[0], 1);
    const body = (docs[runOf(g.members[0])].classes || {})[cls] || {};
    const name = uniqueName(new Set(Object.keys(classes)), cls);
    const { properties, ...withoutProps } = body;
    classes[name] = { ...withoutProps, properties: {} };
    for (const m of g.members) classRep.set(m, name);
  }

  // Properties: on the output class of their own class element
  for (const g of kept("properties")) {
    const rep = g.members[0];
    const [cls, prop] = rest(rep, 2);
    const owner = classRep.get(classKey(runOf(rep), cls));
    if (!owner) continue; // its class did not make it
    const body = ((docs[runOf(rep)].classes || {})[cls] || {}).properties?.[prop];
    const name = uniqueName(new Set(Object.keys(classes[owner].properties)), prop);
    classes[owner].properties[name] = body ?? {};
  }

  // Relationships: both endpoints kept; endpoints renamed to representatives
  const relationships = [];
  const seen = new Set();
  for (const g of kept("relationships")) {
    const rep = g.members[0];
    const run = runOf(rep);
    const [unit] = rest(rep, 1);
    for (const rawIndex of groups.units[run][unit] || []) {
      const rel = (docs[run].relationships || [])[rawIndex];
      if (!rel) continue;
      const from = classRep.get(classKey(run, rel.from));
      const to = classRep.get(classKey(run, rel.to));
      if (!from || !to) continue;
      const id = `${rel.name}|${from}|${to}`;
      if (seen.has(id)) continue;
      seen.add(id);
      relationships.push({ ...rel, from, to });
    }
  }

  // Rules
  const rules = {};
  const ruleRep = new Map();
  for (const g of kept("rules")) {
    const rep = g.members[0];
    const [name] = rest(rep, 1);
    const out = uniqueName(new Set(Object.keys(rules)), name);
    rules[out] = (docs[runOf(rep)].rules || {})[name] || {};
    for (const m of g.members) ruleRep.set(m, out);
  }

  // Actions: input class kept; preconditions remapped within the run
  const actions = {};
  for (const g of kept("actions")) {
    const rep = g.members[0];
    const run = runOf(rep);
    const [name] = rest(rep, 1);
    const body = (docs[run].actions || {})[name] || {};
    const input = classRep.get(classKey(run, body.input));
    if (!input) continue;
    const preconditions = (body.preconditions || []).map((r) => ruleRep.get(ruleKey(run, r))).filter(Boolean);
    actions[uniqueName(new Set(Object.keys(actions)), name)] = { ...body, input, preconditions };
  }

  const lowest = Math.min(...runs);
  const doc = {
    competency_questions: docs[lowest].competency_questions || [],
    classes, relationships, rules, actions,
  };
  return { doc, stats };
}

/** What a person would have to review after a vote: elements below the
 * threshold (found by fewer runs) plus the recorded conflicts. */
export function reviewQueue(groups, { runs, threshold }) {
  const out = {};
  for (const type of ELEMENT_TYPES) {
    const below = groups[type].groups.map((g) => restrict(g, runs)).filter((g) => g.support > 0 && g.support < threshold);
    out[type] = {
      below_threshold: below.length,
      conflicts: groups[type].conflicts.filter((e) => runs.includes(runOf(e.a)) && runs.includes(runOf(e.b))).length,
    };
  }
  out.total = Object.values(out).reduce((n, t) => n + t.below_threshold + t.conflicts, 0);
  return out;
}
