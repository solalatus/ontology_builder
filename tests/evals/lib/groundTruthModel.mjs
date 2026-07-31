import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURE_PATH = path.resolve(__dirname, "..", "fixtures", "itops_mtsr.yaml");

export function loadRawFixtureText() {
  return fs.readFileSync(FIXTURE_PATH, "utf8");
}

// A predicate whose *target* is a pure record-keeping datatype (identifier,
// uri) is exactly the kind of field the app's own baked howto doc
// (AGENT_KNOWLEDGE in index.html) tells the agent to skip: "Do not include
// technical fields that users never ask about." Scoring these as recall
// failures would penalize the agent for correctly following its own
// instructions -- a real domain interview surfaces "what severity is this"
// or "who owns this service", not "what is this record's internal
// identifier field called".
//
// This started as the one deliberate edit to the ground truth the user
// asked for ("modify the yaml based on the handbook, skip what is needed"),
// implemented purely as a documented, auditable filter over an untouched
// fixture rather than a hand-trimmed copy of the YAML that could silently
// drift from the canonical source. The user later asked for the bundled
// fixture itself to be physically corrected too, on top of keeping this
// filter as a safety net (helper_agent_todo.md's dated Log entry) -- so
// `fixtures/itops_mtsr.yaml` no longer contains any identifier/uri-target
// properties to filter, and this function is now a no-op against it. It
// stays exported and unit-tested directly (not just indirectly through the
// fixture) so it's still doing real, verified work if that fixture is ever
// replaced by a fresh, uncorrected gold-standard upload.
export function isRecoverableProperty(predicate) {
  return !(predicate.kind !== "object" && (predicate.to === "identifier" || predicate.to === "uri"));
}

function normalizeLabel(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function stripPunctuation(s) {
  return String(s || "").replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
}

// "is a" (subclass) predicates -- the fixture originally modeled 23 of
// these, e.g. "Major Incident is a Incident", "Application is a
// Configuration Item" -- encode a taxonomy relationship this app's data
// model has no way to represent: it's flat classes plus directed
// relationship edges only, no subclassing (see index.html's
// commitYamlImport comment, and a real eval run's own interviewer
// explicitly saying so mid-interview: "this tool does not use subclassing
// directly ... instead, connect them with a clear relationship"). A
// correctly-behaving interview therefore models "Major Incident declared
// from Incident" instead of forcing "is a" onto a generic relationship edge
// -- scoring that choice as a recall miss would penalize *correct* behavior,
// not bad interview technique.
//
// The bundled fixture has since had all 23 physically removed too (same
// "also correct the file itself, keep the filter as a safety net" request
// as isRecoverableProperty above) -- exported and unit-tested directly for
// the same reason.
export function isRecoverableRelationship(predicate) {
  return predicate.label !== "is a";
}

// RECIPROCAL RELATIONSHIP PAIRS ------------------------------------------
// A real live-eval run audited directly against this fixture (helper_agent_
// todo.md's dated addendum) found 7 class-pairs in the practical scope --
// 14 of 48 scoped relationships, 29.2% -- modeled as two separate predicate
// entries for what is really one real-world connection, phrased from each
// end: e.g. "is supported by" (Incident -> Evidence Item) and "documents"
// (Evidence Item -> Incident) are the same fact, not two. This app's data
// model represents each real-world connection as exactly one directed edge
// (creating both directions would be redundant, wrong modeling, not
// better modeling) -- so scoring each gold direction as a separately
// recoverable relationship silently caps achievable recall below 100% no
// matter how good an interview is, and makes which half gets credited
// dependent on which arbitrary direction+wording the interviewer happens to
// land on, not on interview quality. A real run's actual recovered graph
// (same addendum) had modeled the real-world connection for 5 of these 7
// pairs correctly -- via `hasEvidence`, `hasPostIncidentReview`, etc -- and
// still scored 0/2 on every one of them, because the single edge it created
// only ever satisfies one of the two gold directions.
//
// Merges each such pair into one relationship entry carrying both labels
// (`label` for the canonical direction this function picks -- the
// first-encountered of the pair, stable and deterministic -- plus
// `reciprocalLabel` for the other), so recoveryMetrics.mjs can credit the
// pair as recovered if *either* direction is found, not require both. Only
// pairs of exactly two predicates in opposite directions between the same
// two classes are merged; three-or-more-way or same-direction groups (two
// genuinely different facts that happen to share a class pair, e.g. two
// distinct predicates both from System to ITService) are left untouched,
// since collapsing those would hide a real missed relationship instead of
// an artifact of double-counting one fact.
export function mergeReciprocalRelationshipPairs(relationships) {
  const byPairKey = new Map();
  for (const rel of relationships) {
    const key = [rel.fromClassId, rel.toClassId].sort().join("|");
    if (!byPairKey.has(key)) byPairKey.set(key, []);
    byPairKey.get(key).push(rel);
  }
  const consumedIds = new Set();
  const merged = [];
  for (const rel of relationships) {
    if (consumedIds.has(rel.id)) continue;
    const group = byPairKey.get([rel.fromClassId, rel.toClassId].sort().join("|"));
    const partner = group.find(
      (other) => !consumedIds.has(other.id) && other.id !== rel.id &&
        other.fromClassId === rel.toClassId && other.toClassId === rel.fromClassId
    );
    consumedIds.add(rel.id);
    if (partner) {
      consumedIds.add(partner.id);
      merged.push({ ...rel, reciprocalLabel: partner.label, reciprocalId: partner.id });
    } else {
      merged.push(rel);
    }
  }
  return merged;
}

// GROUND-TRUTH ACTIONS, REDUCED TO A SINGLE INPUT ------------------------
// The fixture's own actions originally declared potentially several named
// inputs (e.g. declareMajorIncident: inputs: {incident: incident,
// commander: incidentCommander}) -- but this app's Action node has exactly
// one input class: index.html's `inputClassId` is a scalar field, not a
// list, the YAML tool schema's `input:` key is singular, and the Actions
// manager UI is a single-select, not a multi-select. That's a deliberate
// scope decision (AGENT_SYSTEM_PROMPT_BASE's own Phase 8 note tells the
// interviewer so explicitly), not a bug -- see helper_agent_todo.md's dated
// Log entry for the fuller reasoning, which also covers why this is a
// genuine ontology-expressiveness limit and not just a file-format detail.
//
// Crediting a ground-truth action's *secondary* inputs anywhere in this
// eval would hold a correctly-behaving interview to a standard the app can
// never satisfy -- the same reasoning as isRecoverableRelationship's "is a"
// exclusion above. buildReducedActions keeps only the first-listed input
// per action (the record the action is fundamentally about, by the
// fixture's own ordering convention) and reports how many were dropped, so
// that omission is an explicit, auditable choice instead of an accident of
// which fields happen to get read.
//
// The bundled fixture's own `actions:` have since had every secondary
// input physically removed too, so `droppedInputCount` is 0 for all of them
// against the current file -- exported and unit-tested directly against
// synthetic multi-input actions for the same "still a real safety net"
// reason as the two filters above.
export function buildReducedActions(doc, classes) {
  const actions = [];
  for (const [id, a] of Object.entries(doc.actions || {})) {
    const inputEntries = Object.entries(a.inputs || {});
    if (!inputEntries.length) continue;
    const primaryInputClassId = inputEntries[0][1];
    if (!classes[primaryInputClassId]) continue; // references a non-class (shouldn't happen, defensive)
    actions.push({
      id,
      label: a.label || id,
      primaryInputClassId,
      droppedInputCount: inputEntries.length - 1,
    });
  }
  return actions;
}

// PRACTICAL INTERVIEW SCOPE ---------------------------------------------
// The fixture models a *comprehensive* 68-class reference domain, built for
// reuse across many possible interviews/experiments, not a scoped
// deliverable for any single one of them. A real, single-session,
// competency-question-driven interview -- this app's own actual
// methodology: elicit real questions/actions first (Phase 1), then model
// only what's needed to answer them -- will only ever reach the slice of
// that domain implied by whatever questions/actions actually came up.
// Scoring against the full 68-class domain every run measures the wrong
// thing: it grades a focused domain interview against an entire reference
// textbook, not against what a good interview on this topic could
// realistically be expected to cover.
//
// practicalScopeClassIds gives a second, tighter, and just as auditable
// denominator: every class whose label or a declared alias appears
// (case/punctuation-insensitive, whole-word) inside the fixture's *own*
// canonical competencyQuestions + actions section -- question text; action
// labels, preconditions, effects, verification, and authorization text;
// plus each action's *primary* input class (see buildReducedActions --
// secondary inputs are deliberately never credited here, for the same
// reason they're dropped there). That's exactly the same kind of "real
// questions and real actions" material Phase 1 of the app's own interview
// methodology is built to elicit and scope everything else from. It's
// mechanical, not hand-picked: it only depends on what the fixture's own
// canonical competency-test material actually talks about, so it can't
// silently drift into an arbitrary hand-trimmed subset the way editing the
// YAML by hand could.
function buildScopeCorpus(doc, classes, reducedActions) {
  const corpusParts = [...(doc.competencyQuestions || [])];
  for (const a of Object.values(doc.actions || {})) {
    corpusParts.push(a.label || "");
    corpusParts.push(...(a.preconditions || []));
    corpusParts.push(...(a.effects || []));
    corpusParts.push(...(a.verification || []));
    corpusParts.push(...(a.authorization || []));
  }
  for (const a of reducedActions) corpusParts.push(classes[a.primaryInputClassId].label);
  return ` ${stripPunctuation(normalizeLabel(corpusParts.join(" \n ")))} `;
}

function buildPracticalScopeClassIds(classes, corpus) {
  const scope = new Set();
  for (const [id, c] of Object.entries(classes)) {
    // c.aliases already includes the class's own label (see below), each
    // pre-normalized to lowercase -- strip punctuation the same way the
    // corpus was, so "on-call engineer" matches "on call engineer".
    const hit = c.aliases.some((a) => {
      const stripped = stripPunctuation(a);
      return stripped.length > 2 && corpus.includes(` ${stripped} `);
    });
    if (hit) scope.add(id);
  }
  return scope;
}

// Properties get the same treatment as classes above, against the exact
// same corpus -- but independently, not merely inherited from their host
// class already being in scope. A property on an in-scope class can still
// be a field nobody's actual question or action ever mentions by name --
// exactly the "nice to know" field AGENT_KNOWLEDGE already tells the agent
// to reject, regardless of which class it lives on. Unlike classes,
// properties have no `aliases:` in the fixture to check (same asymmetry
// recoveryMetrics.mjs documents for relationship labels) -- own label only.
//
// Whole-phrase substring (the class approach above) doesn't work here: the
// fixture's own predicate-label convention is "has X" / "is X" for two
// thirds of all predicates ("has criticality tier", "is critical
// provider"), and a natural competency question is never going to contain
// that exact "has X" phrase verbatim -- confirmed empirically, it matched
// zero of 111 properties on the first attempt. Content-word overlap against
// the corpus (stopword-stripped, same idea as recoveryMetrics.mjs's own
// tokenize/labelsMatch) is the forgiving version: "has criticality tier"
// only needs "criticality" and "tier" to each appear *somewhere* in the
// corpus, not adjacent to each other or to "has".
const SCOPE_STOPWORDS = new Set(["a", "an", "the", "is", "of", "its", "to", "for", "has", "have", "and", "or"]);
function scopeTokens(s) {
  return stripPunctuation(normalizeLabel(s)).split(" ").filter((w) => w && !SCOPE_STOPWORDS.has(w));
}
function buildPracticalScopePropertyIds(properties, corpus) {
  const corpusTokens = new Set(scopeTokens(corpus));
  const scope = new Set();
  for (const p of properties) {
    const tokens = scopeTokens(p.label);
    if (tokens.length && tokens.every((t) => corpusTokens.has(t))) scope.add(p.id);
  }
  return scope;
}

// Filters a loaded ground-truth model down to only the classes named in
// classIds (plus relationships/properties/actions anchored to them), for
// scoring against a narrower denominator (e.g. practicalScopeClassIds)
// while reusing the exact same computeRecoveryMetrics logic used for the
// full domain -- no separate scoring code path to keep in sync.
//
// propertyIds, if given, additionally requires each property's own id to be
// in practicalScopePropertyIds -- not just its host class being in
// classIds -- see buildPracticalScopePropertyIds above. Optional (defaults
// to no extra filtering) so callers that only care about class-level
// scoping don't need to thread it through.
export function scopeGroundTruth(groundTruth, classIds, propertyIds = null) {
  const classes = {};
  for (const [id, c] of Object.entries(groundTruth.classes)) {
    if (classIds.has(id)) classes[id] = c;
  }
  const relationships = groundTruth.relationships.filter(
    (r) => classIds.has(r.fromClassId) && classIds.has(r.toClassId)
  );
  const properties = groundTruth.properties.filter(
    (p) => classIds.has(p.classId) && (!propertyIds || propertyIds.has(p.id))
  );
  const actions = (groundTruth.actions || []).filter((a) => classIds.has(a.primaryInputClassId));
  return { ...groundTruth, classes, relationships, properties, actions };
}

// Builds the normalized comparison structure used by recoveryMetrics.mjs.
// classes: id -> { id, label, aliases: string[] (normalized, includes label) }
// relationships: [{ id, label, fromClassId, toClassId }]  (object-kind predicates)
// properties: [{ id, label, classId, kind, targetId, allowedValues: string[]|null }]
//   (datatype/controlled-value predicates that survive the filter above)
// valueSets: id -> { label, values: string[] }
// actions: [{ id, label, primaryInputClassId, droppedInputCount }] -- see
//   buildReducedActions; not currently scored by computeRecoveryMetrics
//   (no action-recall metric exists yet), exposed for documentation and any
//   future consumer that needs the fixture's actions already reduced to
//   what this app's single-input model can represent.
export function loadGroundTruthModel({ includeAllProperties = false } = {}) {
  const doc = yaml.load(loadRawFixtureText());

  const classes = {};
  for (const [id, c] of Object.entries(doc.classes || {})) {
    const aliases = new Set([normalizeLabel(c.label)]);
    for (const a of c.aliases || []) aliases.add(normalizeLabel(a));
    classes[id] = { id, label: c.label, aliases: [...aliases] };
  }

  const valueSets = {};
  for (const [id, v] of Object.entries(doc.valueSets || {})) {
    valueSets[id] = { label: v.label, values: (v.values || []).map(String) };
  }

  const relationships = [];
  const properties = [];
  for (const [id, p] of Object.entries(doc.predicates || {})) {
    if (p.kind === "object") {
      if (!classes[p.from] || !classes[p.to]) continue; // predicate targets a non-class (shouldn't happen, defensive)
      if (!isRecoverableRelationship(p)) continue;
      relationships.push({ id, label: p.label, fromClassId: p.from, toClassId: p.to });
    } else {
      if (!classes[p.from]) continue;
      if (!includeAllProperties && !isRecoverableProperty(p)) continue;
      const allowedValues = p.kind === "controlled-value" && valueSets[p.to] ? valueSets[p.to].values : null;
      properties.push({ id, label: p.label, classId: p.from, kind: p.kind, targetId: p.to, allowedValues });
    }
  }

  const mergedRelationships = mergeReciprocalRelationshipPairs(relationships);

  const actions = buildReducedActions(doc, classes);
  const scopeCorpus = buildScopeCorpus(doc, classes, actions);
  const practicalScopeClassIds = buildPracticalScopeClassIds(classes, scopeCorpus);
  const practicalScopePropertyIds = buildPracticalScopePropertyIds(properties, scopeCorpus);

  return {
    classes, relationships: mergedRelationships, properties, valueSets, actions, metadata: doc.metadata || {},
    practicalScopeClassIds, practicalScopePropertyIds,
  };
}
