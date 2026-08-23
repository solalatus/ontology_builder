// Issue #133/E13 (external audit): a regex-based, robust checker for the
// persona reply verbatim-leaking a raw `.domain.yaml` internal identifier
// (e.g. "AirHandlingUnit", "hasBorrower") -- the exact failure mode Finding A
// measured directly in real transcripts (brick-hvac/run-03 turn 49,
// iof-maintenance/run-02 turn 5, fibo-loans/run-02 and run-03).
//
// Deliberately narrow in what counts as a "leak": the audit itself measured
// that a naive "flag any word that also appears in the ground truth" checker
// false-positives constantly, because most ground-truth words ARE ordinary
// domain vocabulary the persona is *supposed* to say (status, cost, value,
// ratio, amount, rate, serves, feeds, uses, tests, requires, Supplier,
// Shipment, Distributor, Traceability all measured as real false positives).
// This checker only flags a RAW, un-split, multi-segment camelCase/
// PascalCase compound (isMultiSegmentIdentifier below) that is NOT already
// part of the persona's own brief (buildLeakCandidateSet below) -- a real
// domain expert would say "air handling unit", never the literal token
// "AirHandlingUnit"; seeing the raw compound verbatim is strong evidence the
// model regurgitated the internal key rather than describing the concept.

// Splits 'AirHandlingUnit' -> ['Air','Handling','Unit'], 'hasBorrower' ->
// ['has','Borrower']. A fourth small copy of this exact split
// (recoveryMetrics.mjs, groundTruthModel.mjs, and now here) -- deliberately
// not shared, matching those files' own stated reasoning: each runs at a
// different stage (match time / ground-truth-construction time / leak-
// detection time) and coupling three-now-four independently-evolving call
// sites to one shared signature is worse than one extra five-line function.
function splitCamelCase(s) {
  return String(s || "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

// A raw identifier only counts as a *leakable secret* when it's a
// multi-segment compound (2+ words once split). A single-segment identifier
// (Status, cost, Supplier, Shipment) is indistinguishable from an ordinary
// English word the persona is expected to use freely -- see the module
// header for the audit's own measured false-positive list.
function isMultiSegmentIdentifier(rawIdentifier) {
  const segments = splitCamelCase(rawIdentifier).trim().split(/\s+/).filter(Boolean);
  return segments.length >= 2;
}

// Collects every raw internal identifier straight from the parsed
// `.domain.yaml` document -- class names, each class's own property keys,
// relationship names, rule names, action names -- deliberately BEFORE any
// natural-language splitting, since a leak is exactly the model reproducing
// the raw, un-split key verbatim. Mirrors groundTruthModel.mjs's own
// loadDomainYamlGroundTruthModel walk of the same document shape.
export function collectRawIdentifiers(domainYamlDoc) {
  const ids = new Set();
  for (const [className, c] of Object.entries((domainYamlDoc && domainYamlDoc.classes) || {})) {
    ids.add(className);
    for (const propName of Object.keys((c && c.properties) || {})) ids.add(propName);
  }
  // Issue #133/N3 (independent audit of this same fix): a relationship's
  // own `aliases:` entries are real raw identifiers too (real example:
  // iof-maintenance's "prescribedBy") -- they were skipped here, so a
  // leaked alias could never be flagged by the runtime guard even though
  // relationship aliases ARE scored (relationshipLabelMatchesEdge checks
  // [rel.label, ...rel.aliases]), making this a live, undetectable
  // inflation channel in exactly the dimension Finding A recorded as having
  // "no leaked-and-matched instances."
  for (const r of (domainYamlDoc && domainYamlDoc.relationships) || []) {
    if (r && r.name) ids.add(r.name);
    for (const alias of (r && r.aliases) || []) ids.add(alias);
  }
  for (const name of Object.keys((domainYamlDoc && domainYamlDoc.rules) || {})) ids.add(name);
  for (const name of Object.keys((domainYamlDoc && domainYamlDoc.actions) || {})) ids.add(name);
  return ids;
}

// Every raw identifier in the document that clears the multi-segment bar
// (module header: a single-segment identifier is indistinguishable from
// ordinary English vocabulary), with NO brief exclusion applied. Issue #137:
// pulled out of buildLeakCandidateSet below so the interviewer-prior-
// knowledge tool (tests/evals/lib/interviewerPriorKnowledge.mjs) can reuse
// the identical "what counts as a checkable raw identifier" definition this
// module already establishes, without also picking up the brief exclusion --
// that exclusion is specifically about whether the PERSONA had legitimate
// reason to already know a word (it was handed the word in its own
// character sketch), which has no equivalent meaning on the interviewer
// side: the interviewer is never shown the persona's brief, so whether a
// word happens to appear there is irrelevant to whether the interviewer's
// use of it reflects pretrained knowledge of the source ontology.
export function collectMultiSegmentIdentifiers(domainYamlDoc) {
  const candidates = new Set();
  for (const id of collectRawIdentifiers(domainYamlDoc)) {
    if (isMultiSegmentIdentifier(id)) candidates.add(id);
  }
  return candidates;
}

// Given the raw document plus the persona's OWN brief text (persona.md --
// legitimately handed to the persona as its character sketch, free to
// mention domain vocabulary), returns the identifiers that would actually be
// a leak if they appeared verbatim in a reply: multi-segment compounds not
// already present, verbatim, somewhere in the persona's own brief. An
// identifier the brief already spells out in full is vocabulary the persona
// is *supposed* to know and use, not a hidden internal key.
export function buildLeakCandidateSet(domainYamlDoc, personaBriefText = "") {
  const brief = String(personaBriefText || "");
  const candidates = new Set();
  for (const id of collectMultiSegmentIdentifiers(domainYamlDoc)) {
    if (brief.includes(id)) continue;
    candidates.add(id);
  }
  return candidates;
}

// Word-boundary-safe verbatim search: a leak is the *exact* camelCase/
// PascalCase compound appearing in text, not a substring hit inside an
// unrelated longer word. \b is safe here because every real domain
// identifier starts and ends on a word character (letters/digits only).
function containsVerbatim(text, identifier) {
  const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(text);
}

// Scans one piece of text (a single persona reply, or a whole transcript)
// for verbatim occurrences of any candidate raw identifier. Returns the
// list of identifiers actually found -- empty means clean.
export function findLeakedIdentifiers(text, candidateSet) {
  const hay = String(text || "");
  const found = [];
  for (const id of candidateSet) if (containsVerbatim(hay, id)) found.push(id);
  return found;
}
