import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURE_PATH = path.resolve(__dirname, "..", "fixtures", "itops_mtsr.yaml");

// ontology_translation/domains/ -- see repository layout (issue #101). Every
// domain folder there is self-describing (a fixed filename convention, not
// a hand-maintained manifest listing them): reference.domain.yaml is the
// hidden ground truth, persona.md (optional here -- only personaAgent.mjs's
// live-interview path needs it) is the character sketch. Domains are
// discovered by directory scan, not a separate registry file, so adding one
// never requires updating a second place by hand (issue #104's own
// decision, made explicitly against the issue text's original
// manifest.yaml sketch -- see TODO.md's dated Log entry for why).
export const DOMAINS_DIR = path.resolve(__dirname, "..", "..", "..", "ontology_translation", "domains");

export function listAvailableDomains() {
  if (!fs.existsSync(DOMAINS_DIR)) return [];
  return fs.readdirSync(DOMAINS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(DOMAINS_DIR, e.name, "reference.domain.yaml")))
    .map((e) => e.name)
    .sort();
}

export function resolveDomainYamlPath(domainId) {
  const p = path.join(DOMAINS_DIR, domainId, "reference.domain.yaml");
  if (!fs.existsSync(p)) {
    const available = listAvailableDomains();
    throw new Error(
      `unknown EVAL_DOMAIN "${domainId}" -- no ${p} found. Available domains: ${available.join(", ") || "(none found)"}`
    );
  }
  return p;
}

export function resolveDomainPersonaPath(domainId) {
  const p = path.join(DOMAINS_DIR, domainId, "persona.md");
  return fs.existsSync(p) ? p : null;
}

export function loadRawFixtureText() {
  return fs.readFileSync(FIXTURE_PATH, "utf8");
}

// Splits 'AirHandlingUnit' -> ['Air', 'Handling', 'Unit'], 'eventType' ->
// ['event', 'Type']. Purely mechanical case-boundary splitting -- no domain
// vocabulary, so it works identically for any class/property/relationship
// name in any domain. Mirrors recoveryMetrics.mjs's own splitCamelCase
// exactly (kept as a second small copy rather than a shared import, since
// this one runs at ground-truth-construction time and that one runs at
// match time -- see the note on buildDomainYamlLabel below for why the
// order this runs in actually matters, not just cosmetic duplication).
function splitCamelCase(s) {
  return String(s || "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function normalizeLabel(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function stripPunctuation(s) {
  return String(s || "").replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
}

// `.domain.yaml`'s classes/properties/relationships are keyed by PascalCase/
// camelCase identifiers (AirHandlingUnit, eventType, hasBorrower), not a
// separate natural-language `label` field the way the MTSR fixture's
// records carry one. splitCamelCase MUST run on the raw identifier before
// any lowercasing -- recoveryMetrics.mjs's own normalize() only splits on a
// lowercase-then-uppercase boundary, which no longer exists once the string
// is already all-lowercase. Skipping this (i.e. lowercasing first, splitting
// second) would silently turn "Air Handling Unit" into the single opaque
// token "airhandlingunit", which then can never Jaccard-match a recovered
// node's real, space-separated "Air Handling Unit" label -- a real class of
// bug this function exists specifically to avoid, not just a style choice.
function buildDomainYamlLabel(identifier) {
  return splitCamelCase(identifier).trim();
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
//
// MTSR-specific by construction (checks the fixture's own `kind`/`to`
// value-typing convention) -- `.domain.yaml`'s property `type` vocabulary
// (validate_domain.py's VALID_PROPERTY_TYPES: text/number/date/boolean) has
// no identifier/uri primitive at all, and the compiler pipeline that
// produces `.domain.yaml` already dispositions raw source identifiers as
// not-agent-relevant before a property is ever emitted -- so there is
// nothing for an equivalent filter to do on that side, by construction, not
// by omission.
export function isRecoverableProperty(predicate) {
  return !(predicate.kind !== "object" && (predicate.to === "identifier" || predicate.to === "uri"));
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
//
// Purely a label check, so it's format-agnostic and applied to every loaded
// ground truth regardless of source (see buildNormalizedModel below) --
// `.domain.yaml`'s own compiler prompt already instructs against turning
// subclass hierarchies into relationships in the first place, so this is
// expected to be a no-op there too, same "safety net, not a load-bearing
// requirement" reasoning as isRecoverableProperty.
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
//
// Format-agnostic (operates on the already-normalized {id, fromClassId,
// toClassId} shape only) -- applied uniformly to every loaded ground truth
// regardless of source, see buildNormalizedModel below.
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
      merged.push({ ...rel, reciprocalLabel: partner.label, reciprocalId: partner.id, reciprocalAliases: partner.aliases || [] });
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
//
// MTSR-specific shape (doc.actions[id].inputs is a {name: classId} map) --
// `.domain.yaml`'s own actions already declare exactly one `input:` class
// id, so there is no reduction to do there at all; see
// buildActionsFromDomainYaml below for that format's own, much simpler,
// equivalent.
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

function buildActionsFromDomainYaml(doc, classes) {
  const actions = [];
  for (const [id, a] of Object.entries(doc.actions || {})) {
    if (!a || !classes[a.input]) continue; // references a non-class (shouldn't happen, defensive)
    actions.push({ id, label: buildDomainYamlLabel(id), primaryInputClassId: a.input, droppedInputCount: 0 });
  }
  return actions;
}

// PRACTICAL INTERVIEW SCOPE ---------------------------------------------
// A hidden ground truth models a *comprehensive* reference domain, built
// for reuse across many possible interviews/experiments, not a scoped
// deliverable for any single one of them. A real, single-session,
// competency-question-driven interview -- this app's own actual
// methodology: elicit real questions/actions first (Phase 1), then model
// only what's needed to answer them -- will only ever reach the slice of
// that domain implied by whatever questions/actions actually came up.
// Scoring against the full domain every run measures the wrong thing: it
// grades a focused domain interview against an entire reference textbook,
// not against what a good interview on this topic could realistically be
// expected to cover.
//
// buildPracticalScopeClassIds gives a second, tighter, and just as
// auditable denominator: every class whose label or a declared alias
// appears (case/punctuation-insensitive, whole-word) inside a corpus built
// from the ground truth's own canonical competency-question/action/rule
// material. That's exactly the same kind of "real questions and real
// actions" material Phase 1 of the app's own interview methodology is
// built to elicit and scope everything else from. It's mechanical, not
// hand-picked: it only depends on what the ground truth's own canonical
// competency-test material actually talks about, so it can't silently
// drift into an arbitrary hand-trimmed subset the way editing the source
// by hand could.
//
// Format-agnostic: takes a pre-flattened corpusParts array rather than a
// raw `doc`, so each format's own loader assembles that array from its own
// schema (MTSR's competencyQuestions/actions vs. `.domain.yaml`'s
// competency_questions/rules/actions) and this function -- and everything
// downstream of it -- never needs to know which format produced it.
function buildScopeCorpus(corpusParts, classes, reducedActions) {
  const parts = [...corpusParts];
  for (const a of reducedActions) parts.push(classes[a.primaryInputClassId].label);
  return ` ${stripPunctuation(normalizeLabel(parts.join(" \n ")))} `;
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
// properties have no `aliases:` in either source format -- own label only.
//
// Whole-phrase substring (the class approach above) doesn't work here: a
// natural competency question is never going to contain a "has X" / "is X"
// predicate-label phrase verbatim -- confirmed empirically against the MTSR
// fixture, it matched zero of 111 properties on the first attempt. Content-
// word overlap against the corpus (stopword-stripped, same idea as
// recoveryMetrics.mjs's own tokenize/labelsMatch) is the forgiving version:
// "has criticality tier" only needs "criticality" and "tier" to each appear
// *somewhere* in the corpus, not adjacent to each other or to "has".
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
  const rules = (groundTruth.rules || []).filter((r) => !r.classId || classIds.has(r.classId));
  return { ...groundTruth, classes, relationships, properties, actions, rules };
}

// Shared post-processing applied identically regardless of which format
// loaded the raw classes/relationships/properties/rules/actions/corpusParts
// -- keeps every format-specific loader below responsible only for parsing
// its own schema, never for re-implementing scope derivation or reciprocal-
// pair merging a second time.
function buildNormalizedModel({ classes, relationships, properties, valueSets, rules, actions, corpusParts, metadata }) {
  const recoverableRelationships = relationships.filter(isRecoverableRelationship);
  const mergedRelationships = mergeReciprocalRelationshipPairs(recoverableRelationships);

  const scopeCorpus = buildScopeCorpus(corpusParts, classes, actions);
  const practicalScopeClassIds = buildPracticalScopeClassIds(classes, scopeCorpus);
  const practicalScopePropertyIds = buildPracticalScopePropertyIds(properties, scopeCorpus);

  return {
    classes, relationships: mergedRelationships, properties, valueSets, rules, actions, metadata,
    practicalScopeClassIds, practicalScopePropertyIds,
  };
}

// MTSR loader -- tests/evals/fixtures/itops_mtsr.yaml's own schema
// (doc.classes/doc.predicates/doc.valueSets/doc.actions/
// doc.competencyQuestions). Unchanged behavior from before issue #104.
function loadMtsrGroundTruthModel(fixturePath, { includeAllProperties = false } = {}) {
  const doc = yaml.load(fs.readFileSync(fixturePath, "utf8"));

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
      relationships.push({ id, label: p.label, fromClassId: p.from, toClassId: p.to });
    } else {
      if (!classes[p.from]) continue;
      if (!includeAllProperties && !isRecoverableProperty(p)) continue;
      const allowedValues = p.kind === "controlled-value" && valueSets[p.to] ? valueSets[p.to].values : null;
      properties.push({ id, label: p.label, classId: p.from, kind: p.kind, targetId: p.to, allowedValues });
    }
  }

  const actions = buildReducedActions(doc, classes);

  const corpusParts = [...(doc.competencyQuestions || [])];
  for (const a of Object.values(doc.actions || {})) {
    corpusParts.push(a.label || "");
    corpusParts.push(...(a.preconditions || []));
    corpusParts.push(...(a.effects || []));
    corpusParts.push(...(a.verification || []));
    corpusParts.push(...(a.authorization || []));
  }

  return buildNormalizedModel({
    classes, relationships, properties, valueSets, rules: [], actions, corpusParts, metadata: doc.metadata || {},
  });
}

// `.domain.yaml` loader -- issue #104's own new path. Maps (see the issue's
// own field mapping, now grounded in 4 real accepted domains rather than
// approximate):
//   classes.* -> gold classes (id = the class's own key; label/aliases
//     derived from it -- see buildDomainYamlLabel above for why splitting
//     camelCase BEFORE lowercasing is load-bearing, not cosmetic)
//   nested class properties -> gold properties (id = "ClassName.propName",
//     kind = "controlled-value" when `allowed` is present, else the
//     property's own `type`)
//   property `allowed` -> controlled values (inlined directly on the
//     property, unlike MTSR's separate valueSets indirection -- there is
//     nothing else to build a separate valueSets table from)
//   relationships[] -> gold relationships (id = "rel_<index>" -- the list
//     carries no id of its own)
//   relationship `aliases` -> matching aliases, credited on the GOLD side
//     too now, not just the recovered side (see recoveryMetrics.mjs's
//     relationshipLabelMatchesEdge) -- `.domain.yaml` relationships
//     genuinely carry real aliases the MTSR schema never had anywhere to
//     put, so there is real data here to use instead of leaving the
//     one-sided-widening gap recoveryMetrics.mjs's own comment used to
//     document as a known limitation.
//   rules -> gold rules (id = the rule's own key; NEW normalized field --
//     see the module-level note below on why this isn't scored yet)
//   rule conditions + competency_questions + action inputs/effects/
//     verification -> practical-scope corpus (the issue's own explicit
//     list for this format)
//   competency_questions -> scope corpus (rules/actions text feeds the
//     same corpus, see buildScopeCorpus)
//
// `rules` is a genuinely new normalized field (MTSR has no rules concept at
// all -- `rules: []` there, always) -- exposed on the model now because the
// issue's own practical-scope corpus explicitly needs rule condition text,
// but not yet consumed by recoveryMetrics.mjs's computeRecoveryMetrics
// (no rule-recall metric exists yet, same "exposed, not yet scored" status
// `actions` already had before this issue, tracked separately: issue #105).
export function loadDomainYamlGroundTruthModel(domainYamlPath) {
  const doc = yaml.load(fs.readFileSync(domainYamlPath, "utf8"));

  const classes = {};
  for (const [name, c] of Object.entries(doc.classes || {})) {
    const aliases = new Set([normalizeLabel(buildDomainYamlLabel(name))]);
    for (const a of (c && c.aliases) || []) aliases.add(normalizeLabel(a));
    classes[name] = { id: name, label: buildDomainYamlLabel(name), aliases: [...aliases] };
  }

  const properties = [];
  for (const [className, c] of Object.entries(doc.classes || {})) {
    for (const [propName, p] of Object.entries((c && c.properties) || {})) {
      const allowedValues = Array.isArray(p.allowed) ? p.allowed.map(String) : null;
      properties.push({
        id: `${className}.${propName}`,
        label: buildDomainYamlLabel(propName),
        classId: className,
        kind: allowedValues ? "controlled-value" : (p.type || "text"),
        targetId: null,
        allowedValues,
      });
    }
  }

  const relationships = (doc.relationships || []).map((r, index) => ({
    id: `rel_${index}`,
    label: buildDomainYamlLabel(r.name),
    fromClassId: r.from,
    toClassId: r.to,
    aliases: (r.aliases || []).map(normalizeLabel),
  })).filter((r) => classes[r.fromClassId] && classes[r.toClassId]);

  const rules = Object.entries(doc.rules || {}).map(([name, r]) => ({
    id: name, label: buildDomainYamlLabel(name), conditions: (r && r.conditions) || [],
  }));

  const actions = buildActionsFromDomainYaml(doc, classes);

  const corpusParts = [...(doc.competency_questions || []).map((cq) => cq.text || "")];
  for (const r of rules) corpusParts.push(...r.conditions);
  for (const a of Object.values(doc.actions || {})) {
    corpusParts.push(...((a && a.preconditions) || []));
    if (a && a.effect) corpusParts.push(a.effect);
    if (a && a.verification) corpusParts.push(a.verification);
  }

  return buildNormalizedModel({
    classes, relationships, properties, valueSets: {}, rules, actions, corpusParts,
    metadata: { id: path.basename(path.dirname(domainYamlPath)) },
  });
}

// Builds the normalized comparison structure used by recoveryMetrics.mjs.
// classes: id -> { id, label, aliases: string[] (normalized, includes label) }
// relationships: [{ id, label, fromClassId, toClassId, aliases?: string[] }]  (object-kind predicates)
// properties: [{ id, label, classId, kind, targetId, allowedValues: string[]|null }]
//   (datatype/controlled-value predicates that survive the filter above)
// valueSets: id -> { label, values: string[] }
// rules: [{ id, label, conditions: string[] }] -- not currently scored by
//   computeRecoveryMetrics (issue #105 tracks adding that); always empty
//   for MTSR-sourced ground truth, which has no rules concept.
// actions: [{ id, label, primaryInputClassId, droppedInputCount }] -- see
//   buildReducedActions/buildActionsFromDomainYaml; not currently scored by
//   computeRecoveryMetrics (no action-recall metric exists yet), exposed
//   for documentation and any future consumer that needs the ground
//   truth's actions already reduced to what this app's single-input model
//   can represent.
//
// Two ways to call this, both format-explicit so a caller can never end up
// silently scoring against the wrong shape:
//   loadGroundTruthModel()                                 -- backward-compat
//     default: MTSR, tests/evals/fixtures/itops_mtsr.yaml. Every existing
//     call site (10 of them, across tests/evals/*.mjs) uses exactly this
//     zero-arg form and is completely unaffected by anything in this file.
//   loadGroundTruthModel({ format: "mtsr", path })          -- MTSR, explicit path
//   loadGroundTruthModel({ format: "domain-yaml", path })   -- .domain.yaml
export function loadGroundTruthModel({ path: fixturePath, format = "mtsr", includeAllProperties = false } = {}) {
  if (format === "domain-yaml") {
    if (!fixturePath) throw new Error('loadGroundTruthModel({ format: "domain-yaml" }) requires a path');
    return loadDomainYamlGroundTruthModel(fixturePath);
  }
  if (format !== "mtsr") throw new Error(`loadGroundTruthModel: unknown format "${format}"`);
  return loadMtsrGroundTruthModel(fixturePath || FIXTURE_PATH, { includeAllProperties });
}
