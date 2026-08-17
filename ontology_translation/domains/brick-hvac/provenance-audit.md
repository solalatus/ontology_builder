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
