# Comprehensive provenance audit — Brick HVAC translation

Not a sample. A full read-through of all 127 `translation.json` mappings,
triggered by manual spot-check round 2 finding that `relationships[31]`
(Thermostat serves Zone) had real, verifiable evidence but an empty
`source_iris` list — and the reviewer asking, correctly, whether that was
an isolated slip or a pattern: *"this looks like whack a mole more and
more... read through the whole ... output, and try to fix ALL issues."*

**Date:** 2026-08-17
**Method:** deterministic scan (`_index_source_records_by_iri` +
`_index_source_classes_by_label` from `evaluate.py`) checking every mapping's
`source_evidence`/`rationale` text against the real source class labels
present in `scoped_ir.json`, flagging any mapping whose text names or
paraphrases a specific real class that isn't among its cited `source_iris`.
A second, cruder substring check (does the cited definition's text appear in
the evidence) produced mostly false positives from legitimate paraphrasing
and was discarded — flagged findings below are only from the class-mention
check, manually reviewed against the real source text for each one before
acting.

## Result

**72 raw flags → 31 after removing false positives** (comparison-only
mentions like "already modeled the same way for Boiler and Chiller" that
don't claim to quote Boiler/Chiller's own definitions; nested-substring
artifacts like "Setpoint" matching inside the already-cited
"Temperature_Deadband_Setpoint"). Combined with the 16 mappings that had
`source_iris: []` entirely (a superset partially overlapping the 31),
**42 of 127 mappings (33%)** needed their `source_iris` corrected.

### Root cause

Found in `compiler-prompt.md` itself: the provenance section explicitly told
the compiler *"empty list `[]` is valid for a rule/action grounded in
standard practice rather than a literal source IRI — say so in `rationale`
instead."* That's a direct license for exactly this defect — describing a
concept in prose instead of citing it, even when a real, citable IRI for
that exact concept was sitting right there in the input IR. Fixed in
`compiler-prompt.md`: `source_iris` must now include every class/property
the evidence names or paraphrases, standard-practice groundings included;
empty is reserved for claims genuinely tied to no specific concept at all.
This is a general fix, not Brick-specific — it changes how every future
domain gets compiled.

### Fixing the 42 existing mappings

Two `repair.py` reground passes (all provenance-only — **zero domain.yaml
content changed**, only `source_iris`/`source_evidence`/`confidence`/
`rationale`):

**Pass 1 (42 items, $0.106): 33 succeeded, 9 were correctly dropped by the
repair model rather than fabricated.** The 9 drops were a bug in the
audit's own input, not a real content problem: for 9 reinstate.py-produced
equipment classes (`CondensingUnit`, `CoolingTower`, `HeatExchanger`,
`Humidifier`, `IsolationValve`, `Pump`, `SpaceHeater`,
`WaterTemperatureSensor`, `DryCooler`), the source context given to the
repair model included only their *sibling/precedent* classes (Boiler,
Chiller, Fan, CoolingValve, AirTemperatureSensor — the classes their
standard-practice evidence names for comparison) but never each item's own
real class definition. Correctly refusing to fabricate a class's own
property from only its siblings' definitions, the model dropped all 9
rather than invent grounding. This is the same discipline the whole
pipeline has been built around all session — worth noting as evidence it's
working, not just a nuisance.

**Pass 2 (9 items, corrected source context including each item's own real
definition, $0.033): all 9 reground successfully** — e.g. `DryCooler`'s
status property now cites `Dry_Cooler`'s own definition *and* the sibling
plant-equipment classes its status convention follows, instead of only the
siblings.

### Verification (not taken on the repair calls' own word)

- Structural validity: 0 errors (unaffected — no content changed).
- Provenance completeness: 100% / 100%.
- Reverse coverage: 100%.
- **Independent re-judging of all 42 changed elements** (not a sample —
  every one): **0 majority-unsupported**, 3 contested
  (`CoolingValve.properties.position`, `CoolingTower.properties.status`,
  `IsolationValve.properties.position` — all "does a modulating/controllable
  device have a numeric position/status value" calls where judges split
  supported/partially_supported; the same category of disclosed,
  non-blocking borderline call already accepted elsewhere in this domain,
  not force-resolved here either).

A full authoritative `evaluate.py` pass was deliberately **not** re-run for
this fix: domain.yaml content is unchanged (provenance-only edit), the other
85 mappings were already independently verified clean in the prior full
pass, and all 42 changed ones were independently re-verified directly. Re-
running the full ~$4, ~1000-call pass would have re-confirmed content that
didn't change, not surfaced new information.

## What this changes

`translation.json`'s `source_iris` fields for the 42 listed mappings.
Nothing in `reference.domain.yaml` changed — every class, property,
relationship, rule, and action is exactly what it was; only the provenance
record that backs each claim is now actually checkable against the source,
instead of trusting the compiler's own prose.

**Total cost, this audit + fix:** ~$0.49 (two repair passes, one
comprehensive re-judge of all 42 changed elements).

## Follow-up: two real gaps in this audit's own scan, found in round 4

Manual spot-check round 4 sampled 3 items with the exact same defect this
audit was meant to have eliminated (`classes.Chiller.properties.status`,
`classes.Chiller.properties.coolingCapacity`, `relationships[10]`). Rather
than patch those 3 in isolation, the scan above was itself audited and two
real bugs were found in it:

1. **Case-sensitivity.** The label-match regex compared real Brick labels
   (stored capitalized, e.g. `Chiller`) against evidence text
   case-sensitively. Compiler-generated evidence sometimes lowercased them
   ("standard HVAC practice for **chiller** operating state") and was never
   matched.
2. **Short-label filtering.** The label-collection step excluded labels of
   length ≤ 3, dropping "AHU" — so `relationships[10]`'s evidence
   ("...associates heating setpoints with **AHU** control") was missed even
   after fixing (1), until the length filter itself was found and removed.

**Corrected scan**: case-insensitive matching, no length filter. This
surfaced 107 raw hits — far noisier than the original 72, because it now
also matches ordinary English words that coincide with short/generic Brick
labels (`Class`, `Equipment`, `HVAC Equipment`, `Space`, `Setpoint`,
`Temperature Setpoint`, `Sensor`, `Temperature Sensor`, `Location`,
`Entity`, `Outside`, `Pump`, `Point`). Filtered with an explicit stoplist
of those terms (107 → 27), then every one of the 27 was manually read in
full — evidence and rationale text against the real candidate class's
definition — to separate genuine uncited paraphrases from false positives:
plain English usage of a word that happens to double as a class label, or
a class name appearing incidentally inside a quote from a *different,
already-correctly-cited* source class's own definition.

**Result: 20 genuine items** (the 3 from round 4's sample, plus 17 more
that only the corrected comprehensive rescan caught — never sampled,
never flagged before). Reground with the same provenance-only discipline
as the original 42: zero `reference.domain.yaml` content changed, only
`source_iris`/`source_evidence`/`confidence`/`rationale` corrected.

### A second defect, found while applying this fix (not in repair.py itself)

Building the 20-item repair batch, each item's `source_context` listed
only the *new* citation to add — not the item's pre-existing correct ones
(bare property IRIs like `rec#value`/`rec#status`, relationship predicates
like `hasPart`/`hasPoint`/`hasLocation`/`feeds`, and in `relationships[30]`'s
case a previously-correct `Space` class citation). `repair.py`'s
`apply_repairs()` does `mapping.update(provenance)`, which **replaces**
`source_iris` wholesale rather than merging — so all 20 items silently lost
their previously-correct citations the moment the new one was added. This
is a process bug in how the audit's fix batch was constructed, not a
`repair.py` code defect; found by diffing `relationships[30]`'s before/after
`source_iris` and confirmed present in all 20 of 20 items in the batch.

**Fixed directly**, no further LLM call: a pure Python union of each item's
old and new `source_iris` (old first, then new, deduplicated), applied to
`translation.json`.

### Verification

- Structural validity: 0 errors.
- 0/127 mappings with empty `source_iris`; mapping count unchanged (127).
- **Independent re-judge of all 20 changed elements**: 0 unsupported, 3
  contested (`classes.CO2Sensor.properties.value`, `relationships[13]`,
  `relationships[29]` — disclosed borderline supported/partially_supported
  splits, the same non-blocking category already accepted elsewhere in
  this domain). Cost: $0.1475.

**Lesson, stated plainly**: a "comprehensive" audit is only as
comprehensive as its own scan logic. Continued independent spot-checking
after this audit was first declared complete found two real gaps in the
scan itself, not just in the mappings it was meant to catch. Full account
of the round-4 sample that triggered this: `manual-spot-check.md`.
