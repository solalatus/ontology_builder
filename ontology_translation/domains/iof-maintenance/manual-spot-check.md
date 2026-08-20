# Manual spot-check — IOF Maintenance translation

Human evidence supplementing the automated QA suite (issue #103), done
in-session. Full structured data is in `manual-spot-check.json`; this file
is the readable summary.

## Round 1 (2026-08-20) — 5/5 accept, 0/5 reject

**Reviewer:** repo owner (szablevi@gmail.com), in-session with the coding agent
**Artefact definition:** every individually source-mapped element in
`translation.json`'s `mappings` list — classes, class properties,
relationships, rules, actions (50 total at sampling time). Competency
questions excluded, same convention as Brick and IOF Supply Chain.

## Sampling method

Stratified by artefact type, proportional allocation (largest remainder),
seed fixed at `108` (matching this issue's number, same convention as
Brick's `106` and IOF Supply Chain's `109`).

| Type | Population | Sampled |
|---|---|---|
| classes | 20 | 2 |
| properties | 7 | 1 |
| relationships | 13 | 1 |
| rules | 7 | 1 |
| actions | 5 | 0 |
| **Total** | **50** | **5 (10%)** |

## Result: 5 accept, 0 reject

All 5 sampled items checked out cleanly against a freshly regenerated
`source_ir.json` — direct, literal source-text grounding for every one,
no fabrication, no borrowed-domain-practice hand-waving.

- **`classes.DegradedState`** — accepted. Meaning is a near-verbatim
  restatement of the source's own definition text ("state of reduced
  ability to perform as required but with acceptable reduced
  performance").
- **`classes.FailureEvent`** — accepted. Meaning ("an event that causes
  an item to lose its ability to perform a required function") is the
  source's own plain-language definition, distinct from the source's
  formal FOL definitions also present on the class (correctly not
  reproduced verbatim as if they were the meaning).
- **`classes.MaintenanceWorkOrderRecord.properties.taskCode`** —
  accepted. The source definition explicitly lists "task codes" as one
  of the record's commonly used fields; `type: text` with no invented
  `allowed` list is exactly the low-risk shape the round-1/round-2
  IOF-Supply-Chain fixes established as correct for a property whose
  existence, but not a specific value set, is grounded.
- **`relationships[11]` (`FailureProcess resultsIn FailedState`)** —
  accepted. FailureProcess's own source definition ("process that
  changes some quality of an item causing the item to become degraded
  or failed") directly supports a failure process resulting in a
  failed state.
- **`rules.canClassifyFailedState`** — accepted. Both conditions restate
  FailedState's own source definition ("state of an item being unable
  to perform a required function due to a failure event") without
  adding anything beyond it.

No items were flagged for a closer look before rating — the general
pipeline hardening done earlier this session (see below and
`ontology_translation/TODO.md`) had already been exercised twice, via
real `repair.py` calls, against the two real defects this domain's own
compiler runs surfaced (a mis-attributed `stateOf` relationship and a
self-loop `hasMaintenanceState` relationship — both dropped for cause,
not sampled into this spot check since they never reached the final
accepted `reference.domain.yaml`).

## This domain's pipeline generalization work

Per this round's standing policy ("fix the conversion pipeline in the
most generalizable, domain independent level... tomorrow ANY ontology
can come, in ANY form, and this has to work flawlessly"), five
domain-agnostic pipeline fixes came out of converting this domain, none
of them specific to IOF or to maintenance ontologies:

1. **`evaluate.py`'s `endpoint_citation_gate`** now accepts a
   relationship's citation of a real `someValuesFrom`/`allValuesFrom`
   restriction (matched by IRI local-name) as valid endpoint evidence
   even when the endpoint class has no dedicated `classes.<Name>`
   mapping of its own — fixes a false-positive class of defect that can
   occur in any source ontology where a class is real and load-bearing
   but only ever referenced via restrictions, never given its own
   top-level class record.
2. **`extract.py`** gained a general
   `discover_annotation_predicates()` mechanism that finds any source
   ontology's own custom annotation vocabulary by naming convention
   (matching predicate local names against `definition|description|
   comment|...` and `synonym|altLabel|alias|...` patterns) instead of
   only recognizing `rdfs`/`skos`/`dcterms`. An earlier attempt that
   hardcoded IOF's own `iof-av:` namespace was caught and replaced with
   this general mechanism per direct reviewer correction mid-session.
3. **`run_pipeline.py`** now derives the fetched source file's on-disk
   extension from the manifest's `source_url` instead of always writing
   `source.ttl` — fixes a real crash (`rdflib.Graph().parse()` failing
   on RDF/XML content saved with a `.ttl` extension) for any future
   domain whose source isn't Turtle.
4. **`reinstate.py`**'s dynamically-built prompt no longer cites Brick
   HVAC's own relationship vocabulary (`hasPart`, `feeds`, `serves`,
   `hasPoint`, `hasLocation`) as illustrative examples — replaced with
   generic language pointing at the domain's own real
   `domain_relationships` data, so the instructions don't quietly bias
   every future domain's reinstate runs toward Brick-shaped
   relationships.
5. **`validate_domain.py`** gained a new `self_loop_relationship`
   warning (a relationship whose `from` and `to` are the same class) —
   this defect class was not caught by any existing gate and was found
   only by direct manual reading of a candidate `reference.domain.yaml`;
   `compiler-prompt.md` and `repair-prompt.md` were both hardened with a
   matching rule against using a same-class self-loop as a fallback for
   a missing or out-of-scope endpoint.

All five are covered by new regression tests (271/271 full offline suite
passing) and were cross-checked for zero false positives against the
already-accepted Brick HVAC and IOF Supply Chain content.

### Cost

$0 sample review (reused a freshly regenerated `source_ir.json`) +
~$0.02 (two targeted `repair.py` calls during candidate adjudication) +
~$1.50 (two full official `evaluate.py` re-runs to confirm convergence
after each repair round).
