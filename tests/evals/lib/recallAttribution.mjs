// PER-ITEM RECALL ATTRIBUTION (issue #182)
//
// For every gold class, relationship and property a snapshot of a run did
// not recover, says why, using only what the run left on disk. Checked in
// this order; the first one that applies is the item's category:
//
//   endpoint_class_missing  (relationships, properties) an endpoint or host
//                           class is itself unmatched, so the item could not
//                           be matched whatever it was called
//   other_name              the semantic judge matched it to something the
//                           heuristic scorer did not accept (a wording miss)
//   removed                 something the heuristic scorer would have matched
//                           was committed (apply_ontology_yaml) at or before
//                           the snapshot, and is no longer there -- removed,
//                           or renamed away
//   mentioned_not_committed the expert or the interviewer named it in the
//                           conversation, at or before the snapshot, and it
//                           never reached the model
//   never_mentioned         none of the above
//
// "Named" is a token match after the scorer's own normalization (camelCase
// split, lower case, punctuation dropped, Snowball-stemmed): a class by any
// of its gold forms; a relationship by its verb phrase in the same message as
// both endpoint classes; a property by its name in the same message as its
// host class. Interviewer and expert messages are read; tool notes and the
// harness's own stage instructions are not.
//
// Matched items are counted as `recovered` (heuristic) so the categories add
// up to the gold total.
import snowballFactory from "snowball-stemmers";
import yaml from "js-yaml";
import { recoveredStateFromDoc } from "../score-baseline.mjs";
import { computeHeuristicMatchPairs, computeMatchDetail } from "./recoveryMetrics.mjs";

const stemmer = snowballFactory.newStemmer("english");

export function normalizeTokens(text) {
  return String(text || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9áéíóöőúüű\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (/^[a-z0-9]+$/.test(w) ? stemmer.stem(w) : w));
}

const phrase = (text) => ` ${normalizeTokens(text).join(" ")} `;

/**
 * conversation-log.md back into { turn, speaker, text } entries, every line of
 * each entry. reportGenerator.mjs's parseConversationLog keeps only the first
 * line of a multi-line entry (its end-of-text lookahead is `\n*$` under the m
 * flag, which matches at any line end); two committed reports pin numbers
 * computed with it, so it is left as it is and this reads the whole text.
 */
export function parseConversationLogFull(text) {
  const entries = [];
  const re = /^### Turn (\d+) — ([a-z-]+)\n\n([\s\S]*?)(?=\n### Turn |\s*(?![\s\S]))/gm;
  let m;
  while ((m = re.exec(String(text || "")))) entries.push({ turn: Number(m[1]), speaker: m[2], text: m[3].trim() });
  return entries;
}

/** Every apply_ontology_yaml argument in a tool-calls.md, with its turn. */
export function parseAppliedYaml(toolCallsMd) {
  const out = [];
  const headers = [...String(toolCallsMd || "").matchAll(/^### Turn (\d+) — /gm)].map((m) => ({ index: m.index, turn: Number(m[1]) }));
  const re = /\*\*Tool call: `apply_ontology_yaml`\*\*\n\n```\n([\s\S]*?)\n```/g;
  let m;
  while ((m = re.exec(toolCallsMd))) {
    const header = headers.filter((h) => h.index < m.index).pop();
    let args = null;
    try { args = JSON.parse(m[1]); } catch { continue; }
    if (args && typeof args.yaml === "string") out.push({ turn: header ? header.turn : 0, yaml: args.yaml });
  }
  return out;
}

/**
 * Everything ever committed through apply_ontology_yaml up to `turn`, as one
 * model: classes merged by name (their properties too), relationships kept
 * once per name and endpoints.
 */
export function unionOfCommitted(applied, turn = Infinity) {
  const classes = {};
  const relationships = [];
  const seen = new Set();
  for (const a of applied) {
    if (a.turn > turn) continue;
    let doc;
    try { doc = yaml.load(a.yaml); } catch { continue; }
    if (!doc || typeof doc !== "object") continue;
    for (const [name, c] of Object.entries(doc.classes || {})) {
      const into = classes[name] || (classes[name] = { properties: {}, aliases: [] });
      if (c && typeof c === "object") {
        Object.assign(into.properties, c.properties || {});
        for (const al of c.aliases || []) if (!into.aliases.includes(al)) into.aliases.push(al);
        if (c.meaning) into.meaning = c.meaning;
      }
    }
    for (const r of Array.isArray(doc.relationships) ? doc.relationships : []) {
      if (!r || !r.name || !r.from || !r.to) continue;
      const key = `${r.name}|${r.from}|${r.to}`;
      if (seen.has(key)) continue;
      seen.add(key);
      relationships.push({ name: r.name, from: r.from, to: r.to, aliases: r.aliases || [] });
    }
  }
  // An endpoint named only in a relationship still counts as committed.
  for (const r of relationships) for (const c of [r.from, r.to]) if (!classes[c]) classes[c] = { properties: {}, aliases: [] };
  return { classes, relationships };
}

function matchedGoldIds(groundTruth, state) {
  const pairs = computeHeuristicMatchPairs(groundTruth, state);
  return {
    classes: new Set(pairs.classes.map((p) => p.goldId)),
    relationships: new Set(pairs.relationships.map((p) => p.goldId)),
    properties: new Set(pairs.properties.map((p) => p.goldId)),
  };
}

/** Gold ids the semantic judge matched, from a semantic-matches.json body. */
export function semanticMatchedGoldIds(semanticMatches) {
  const full = semanticMatches && semanticMatches.fullDomain;
  const ids = (list) => new Set(Array.isArray(list) ? list.map((x) => x.goldId) : []);
  return { classes: ids(full && full.classes), relationships: ids(full && full.relationships), properties: ids(full && full.properties) };
}

/**
 * Attributes one snapshot.
 *   groundTruth     the scorer's normalized gold model
 *   snapshotYaml    the snapshot's recovered-model.yaml text
 *   turn            the snapshot's turn (conversation and commits after it are ignored)
 *   log             [{ turn, speaker, text }] (parseConversationLogFull's output)
 *   applied         parseAppliedYaml's output
 *   semanticMatches the snapshot's semantic-matches.json body, or null
 */
export function attributeSnapshot({ groundTruth, snapshotYaml, turn = Infinity, log = [], applied = [], semanticMatches = null }) {
  const { state } = recoveredStateFromDoc(yaml.load(snapshotYaml) || {});
  const now = matchedGoldIds(groundTruth, state);
  const everCommitted = matchedGoldIds(groundTruth, recoveredStateFromDoc(unionOfCommitted(applied, turn)).state);
  const semantic = semanticMatchedGoldIds(semanticMatches);
  const messages = log
    .filter((e) => e.turn <= turn && (e.speaker === "persona" || e.speaker === "app-assistant"))
    .map((e) => phrase(e.text));
  const classForms = (id) => {
    const c = groundTruth.classes[id];
    return c ? [...new Set([c.label, ...(c.aliases || [])])].map(phrase).filter((f) => f.trim()) : [];
  };
  const mentionsClass = (m, id) => classForms(id).some((f) => m.includes(f));

  const decide = (dim, id, { gate = null, mentioned }) => {
    if (now[dim].has(id)) return "recovered";
    if (gate && !gate()) return "endpoint_class_missing";
    if (semantic[dim].has(id)) return "other_name";
    if (everCommitted[dim].has(id)) return "removed";
    return messages.some(mentioned) ? "mentioned_not_committed" : "never_mentioned";
  };

  const items = { classes: [], relationships: [], properties: [] };
  for (const id of Object.keys(groundTruth.classes)) {
    items.classes.push({ id, label: groundTruth.classes[id].label, category: decide("classes", id, { mentioned: (m) => mentionsClass(m, id) }) });
  }
  for (const rel of groundTruth.relationships) {
    const verbForms = [rel.label, ...(rel.aliases || [])].map(phrase).filter((f) => f.trim());
    items.relationships.push({
      id: rel.id, label: `${rel.fromClassId} ${rel.label} ${rel.toClassId}`,
      category: decide("relationships", rel.id, {
        gate: () => now.classes.has(rel.fromClassId) && now.classes.has(rel.toClassId),
        mentioned: (m) => verbForms.some((f) => m.includes(f)) && mentionsClass(m, rel.fromClassId) && mentionsClass(m, rel.toClassId),
      }),
    });
  }
  for (const prop of groundTruth.properties) {
    const form = phrase(prop.label);
    items.properties.push({
      id: prop.id, label: prop.id,
      category: decide("properties", prop.id, {
        gate: () => now.classes.has(prop.classId),
        mentioned: (m) => m.includes(form) && mentionsClass(m, prop.classId),
      }),
    });
  }

  const CATEGORIES = ["recovered", "endpoint_class_missing", "other_name", "removed", "mentioned_not_committed", "never_mentioned"];
  const counts = Object.fromEntries(Object.entries(items).map(([dim, list]) => [dim,
    Object.fromEntries(CATEGORIES.map((c) => [c, list.filter((x) => x.category === c).length]).concat([["goldTotal", list.length]]))]));
  // A sanity check that this module's matching is the scorer's.
  const detail = computeMatchDetail(groundTruth, state);
  counts.classes.scorerMatched = detail.classes.matchedGoldCount;
  return { turn: Number.isFinite(turn) ? turn : null, semanticAvailable: Boolean(semanticMatches && semanticMatches.fullDomain && semanticMatches.fullDomain.classes), counts, items };
}

/** Moves between two attributions of the same run (e.g. A to C): `{ "from->to": n }` per dimension. */
export function attributionTransitions(before, after) {
  const out = {};
  for (const dim of ["classes", "relationships", "properties"]) {
    const prev = new Map(before.items[dim].map((x) => [x.id, x.category]));
    const moves = {};
    for (const x of after.items[dim]) {
      const from = prev.get(x.id);
      if (from && from !== x.category) moves[`${from}->${x.category}`] = (moves[`${from}->${x.category}`] || 0) + 1;
    }
    out[dim] = moves;
  }
  return out;
}
