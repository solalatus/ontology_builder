// Detects (and, for the unambiguous subset, strips) content-quality defects
// in a recovered ontology export -- the raw {competency_questions, classes,
// relationships, rules, actions} shape parsed straight from a
// `recovered-model.yaml`, same shape recoveredStateFromYaml (score-baseline.
// mjs) itself parses from js-yaml.load().
//
// Built for issue #140, itself a follow-up to the manual, page-by-page audit
// of all 15 real multi-domain benchmark runs (see ontology_translation/
// TODO.md's dated entry). That audit found the *scorer* correctly ignores
// this content -- every duplicate/reciprocal edge and every sentinel-tagged
// item checked was confirmed absent from heuristic-matches.json -- so this
// module is not a scoring fix; it is about the shipped/exported ontology
// itself being visibly wrong to a human reader:
//
//   - a relationship or class whose `meaning` (or an alias) is a literal
//     deletion sentinel ("REMOVE", "__REMOVE__") left over from an app-agent
//     turn that apparently intended to retract something it had added
//     earlier in the interview. Root cause (documented in TODO.md): the live
//     interview's app-agent tool set is apply_ontology_yaml (upsert-only --
//     "a field you don't mention is never cleared") plus the read-only
//     get_graph_state; unlike the separate Import Review merger flow (issue
//     #122/#126), it has no remove_ontology_elements-equivalent tool wired
//     in, so there is no real way for it to retract something once said --
//     rewriting `meaning` to a self-directed note is the only lever it has.
//   - a self-loop relationship (from === to) whose name duplicates a
//     properly-typed relationship elsewhere in the same model -- a mangled
//     copy of the real edge, not a second real fact.
//   - two relationships between the same class pair in opposite directions
//     (a genuine reciprocal-pair *duplicate*, not the legitimate reciprocal-
//     pair *credit* mechanism recoveryMetrics.mjs's matchRelationships uses
//     for scoring, which is unrelated to this).
//   - a `meaning` of `null`/empty -- always advisory only, since some are
//     genuinely load-bearing content missing only a description (confirmed
//     during the audit: several null-meaning classes/edges were still
//     wired into real, otherwise-correct relationships).
//
// Two severities, matching how confidently each check can be auto-applied
// without silently deleting real recovered content:
//   "strip"    -- unambiguous: an explicit deletion sentinel, or a self-loop
//                 proven redundant by a same-named non-self-loop sibling.
//                 sanitizeRecoveredModel(doc, {strip:true}) removes these.
//   "advisory" -- everything else (reciprocal-pair duplicates, "leftover"/
//                 "superseded"/"deprecated"/"TODO"/"placeholder" language,
//                 null/empty meaning). Never auto-removed: the audit found
//                 at least one "leftover... superseded" class that was still
//                 actively wired into a real edge in its own model --
//                 blindly deleting anything matching this language would
//                 have destroyed genuinely-recovered content, not cleaned it
//                 up. These are surfaced for a human (or a future, better-
//                 informed app-agent turn) to resolve.

const EXACT_REMOVAL_SENTINELS = new Set(["remove", "__remove__"]);

// Substring/word-boundary patterns, deliberately checked only against
// `meaning` prose (never against short alias tokens, where a coincidental
// word match is more likely) and never auto-stripped -- see module doc.
const ADVISORY_MEANING_PATTERNS = [
  { name: "TODO", regex: /\btodo\b/i },
  { name: "DEPRECATED", regex: /\bdeprecated\b/i },
  { name: "SUPERSEDED", regex: /\bsuperseded\b/i },
  { name: "LEFTOVER", regex: /\bleftover\b/i },
  { name: "PLACEHOLDER", regex: /\bplaceholder\b/i },
];

function isExactRemovalSentinel(value) {
  return typeof value === "string" && EXACT_REMOVAL_SENTINELS.has(value.trim().toLowerCase());
}

function advisoryMeaningMatch(value) {
  if (typeof value !== "string") return null;
  const hit = ADVISORY_MEANING_PATTERNS.find((p) => p.regex.test(value));
  return hit ? hit.name : null;
}

function isBlank(value) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

// One finding per class/relationship for the `meaning` field, in priority
// order (an explicit removal sentinel outranks advisory language, which
// outranks a bare null/empty) -- a single item only ever needs one
// "something is off with this text" finding, not three overlapping ones.
function meaningFinding(kind, identity, meaning) {
  if (isExactRemovalSentinel(meaning)) {
    return { severity: "strip", kind, identity, field: "meaning", pattern: "REMOVAL_SENTINEL", detail: `meaning is the literal deletion sentinel "${meaning.trim()}"` };
  }
  const advisoryHit = advisoryMeaningMatch(meaning);
  if (advisoryHit) {
    return { severity: "advisory", kind, identity, field: "meaning", pattern: advisoryHit, detail: `meaning contains editorial language ("${advisoryHit.toLowerCase()}") that reads as a leftover note rather than a real definition: ${JSON.stringify(meaning)}` };
  }
  if (isBlank(meaning)) {
    return { severity: "advisory", kind, identity, field: "meaning", pattern: "NULL_MEANING", detail: "meaning is null/empty" };
  }
  return null;
}

function aliasRemovalFinding(kind, identity, aliases) {
  const hit = (aliases || []).find(isExactRemovalSentinel);
  if (!hit) return null;
  return { severity: "strip", kind, identity, field: "aliases", pattern: "REMOVAL_SENTINEL", detail: `aliases contains the literal deletion sentinel "${hit.trim()}"` };
}

function relationshipIdentity(rel) {
  return `${rel.name} (${rel.from} → ${rel.to})`;
}

// Self-loop (from === to) whose name exactly matches (case-insensitively) a
// *different*, properly-typed (non-self-loop) relationship elsewhere in the
// model -- the shape found in fibo-loans/run-02: a stray
// `hasSubFacility CreditFacility→CreditFacility` self-loop sitting next to
// the correct `hasSubFacility CreditFacility→SubFacility`. Requiring a
// same-named sibling (rather than flagging every self-loop) keeps this
// check high-confidence: a domain can have a genuine self-referential
// relationship (e.g. "reportsTo" between two Employees), so only a self-loop
// that is *also* a name-collision with a real, differently-targeted edge is
// treated as unambiguous defect.
function findSelfLoopDuplicates(relationships) {
  const byLowerName = new Map();
  for (const rel of relationships) {
    const key = (rel.name || "").toLowerCase();
    if (!byLowerName.has(key)) byLowerName.set(key, []);
    byLowerName.get(key).push(rel);
  }
  const findings = [];
  for (const rel of relationships) {
    if (rel.from !== rel.to) continue;
    const siblings = byLowerName.get((rel.name || "").toLowerCase()) || [];
    const properSibling = siblings.find((s) => s !== rel && s.from !== s.to);
    if (properSibling) {
      findings.push({
        severity: "strip", kind: "relationship", identity: relationshipIdentity(rel), field: "pair", pattern: "SELF_LOOP_DUPLICATE",
        detail: `self-loop ${relationshipIdentity(rel)} duplicates the properly-typed ${relationshipIdentity(properSibling)} elsewhere in the same model`,
        relationship: rel,
      });
    }
  }
  return findings;
}

// Two relationships between the same unordered class pair, opposite
// direction -- always advisory (see module doc: this project's own
// mergeReciprocalRelationshipPairs, in groundTruthModel.mjs, deliberately
// only merges *exactly* 2-member opposite-direction groups for gold data
// authored with editorial care, and even there stops short of assuming
// every such pair states one fact rather than two genuinely different
// ones). Self-loops are excluded (handled by findSelfLoopDuplicates above)
// since `[from,to].sort()` degenerates for them and every self-loop would
// otherwise trivially "pair" with every other self-loop on the same class.
function findReciprocalPairDuplicates(relationships) {
  const byPairKey = new Map();
  for (const rel of relationships) {
    if (rel.from === rel.to) continue;
    const key = [rel.from, rel.to].sort().join("|");
    if (!byPairKey.has(key)) byPairKey.set(key, []);
    byPairKey.get(key).push(rel);
  }
  const findings = [];
  const reported = new Set();
  for (const rel of relationships) {
    if (rel.from === rel.to) continue;
    const key = [rel.from, rel.to].sort().join("|");
    if (reported.has(key)) continue;
    const group = byPairKey.get(key);
    if (group.length !== 2) continue;
    const [a, b] = group;
    if (a.from === b.to && a.to === b.from) {
      reported.add(key);
      findings.push({
        severity: "advisory", kind: "relationship-pair", identity: `${relationshipIdentity(a)} / ${relationshipIdentity(b)}`, field: "pair", pattern: "RECIPROCAL_PAIR",
        detail: `${relationshipIdentity(a)} and ${relationshipIdentity(b)} connect the same two classes in opposite directions -- confirm these are two genuinely distinct facts, not the same fact stated twice`,
      });
    }
  }
  return findings;
}

// Runs every check against `doc` (the raw parsed recovered-model.yaml
// shape) and returns the full, unfiltered findings list. Never mutates
// `doc`. Safe to call on its own for a report-only pass (see
// validate-recovered-model.mjs and run-multi-domain-benchmark.mjs's
// report-only integration).
export function findModelIssues(doc) {
  const findings = [];
  for (const [className, def] of Object.entries(doc.classes || {})) {
    const mf = meaningFinding("class", className, def && def.meaning);
    if (mf) findings.push(mf);
    const af = aliasRemovalFinding("class", className, def && def.aliases);
    if (af) findings.push(af);
  }
  const relationships = doc.relationships || [];
  for (const rel of relationships) {
    const identity = relationshipIdentity(rel);
    const mf = meaningFinding("relationship", identity, rel.meaning);
    if (mf) findings.push({ ...mf, relationship: rel });
    const af = aliasRemovalFinding("relationship", identity, rel.aliases);
    if (af) findings.push({ ...af, relationship: rel });
  }
  findings.push(...findSelfLoopDuplicates(relationships));
  findings.push(...findReciprocalPairDuplicates(relationships));
  return findings;
}

// Applies the "strip" subset of findModelIssues(doc)'s findings to a fresh
// copy of `doc` and returns { model, findings, removed }. `findings` is
// always the full, unfiltered list (strip + advisory) computed against the
// ORIGINAL doc, so advisory issues remain visible even when strip:true --
// this function reports everything it saw, whether or not it acted on it.
//
// strip:false (the default) returns model === a plain deep copy of doc,
// unchanged -- report-only callers (the benchmark runner's own integration,
// and validate-recovered-model.mjs without --write) never need a second
// code path to get the findings list.
export function sanitizeRecoveredModel(doc, { strip = false } = {}) {
  const findings = findModelIssues(doc);
  const model = JSON.parse(JSON.stringify(doc || {}));
  const removed = { classes: [], relationships: [] };
  if (!strip) return { model, findings, removed };

  const classesToRemove = new Set(
    findings.filter((f) => f.severity === "strip" && f.kind === "class").map((f) => f.identity)
  );
  for (const name of classesToRemove) {
    if (model.classes && name in model.classes) {
      delete model.classes[name];
      removed.classes.push(name);
    }
  }

  // Keyed by (name, from, to) rather than object identity: `findings` was
  // computed against the original `doc`, but `model` (and its relationships)
  // is a fresh JSON.parse(JSON.stringify(doc)) copy, so the objects
  // themselves are never ===-equal across the two.
  const directStripReasonByKey = new Map();
  for (const f of findings) {
    if (f.severity !== "strip" || f.kind !== "relationship" || !f.relationship) continue;
    const r = f.relationship;
    directStripReasonByKey.set(`${r.name}::${r.from}::${r.to}`, f.pattern);
  }

  const survivors = [];
  for (const rel of model.relationships || []) {
    const key = `${rel.name}::${rel.from}::${rel.to}`;
    const directReason = directStripReasonByKey.get(key);
    const cascaded = classesToRemove.has(rel.from) || classesToRemove.has(rel.to);
    if (directReason || cascaded) {
      removed.relationships.push({ identity: relationshipIdentity(rel), reason: directReason || "CASCADE_REMOVED_CLASS" });
      continue;
    }
    survivors.push(rel);
  }
  model.relationships = survivors;

  return { model, findings, removed };
}

export function formatFindings(findings) {
  if (!findings.length) return "No issues found.";
  const strip = findings.filter((f) => f.severity === "strip");
  const advisory = findings.filter((f) => f.severity === "advisory");
  const lines = [];
  if (strip.length) {
    lines.push(`${strip.length} strippable (unambiguous) issue(s):`);
    for (const f of strip) lines.push(`  [strip]    ${f.kind} ${f.identity} -- ${f.detail}`);
  }
  if (advisory.length) {
    lines.push(`${advisory.length} advisory (needs a human look) issue(s):`);
    for (const f of advisory) lines.push(`  [advisory] ${f.kind} ${f.identity} -- ${f.detail}`);
  }
  return lines.join("\n");
}
