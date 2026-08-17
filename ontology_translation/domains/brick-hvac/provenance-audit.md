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

## Second follow-up: a third scan gap, and a root-cause code fix (round 5)

Manual spot-check round 5 sampled 3 more items with the same uncited-
paraphrase defect (`relationships[11]`, `relationships[13]`,
`relationships[23]`). One of them, `relationships[13]`, had already been
"fixed" once by round 4 — for a *different* citation gap on the same
mapping. Diffing showed round 4's own reground rewrite introduced fresh
prose that itself named `TemperatureSetpoint` without citing it, and
nothing rescanned that fix's own output afterward.

### A third scan-methodology gap

Round 4's scan still missed real gaps because it only matched evidence
text against the source ontology's *spaced* label form (`"Temperature
Deadband Setpoint"`). Compiler-generated evidence sometimes instead names
the concept using the domain's own compiled PascalCase class name
(`"TemperatureDeadbandSetpoint"`, no space) — a string that never contains
the spaced label as a substring, so it was never matched, regardless of
case-sensitivity or label length.

**Corrected matcher**: in addition to the existing case-insensitive,
word-boundary spaced-label check, added a second check that extracts every
maximal contiguous alphabetic token from the evidence text (`re.findall(
r'[A-Za-z]+', text)`) and compares each, lowercased, for **exact equality**
against the label's no-space form. Exact-token comparison (not a raw
substring search over the whole no-space-stripped text) was deliberate:
substring search produces real false positives across word boundaries once
spaces are stripped (`"Wing"` inside `"flowing"`, `"city"` inside
`"capacity"`) — comparing whole tokens avoids that class of noise entirely.

### Full rescan, all 127 mappings

Raw hits with the corrected matcher: 125. Applying the round-4 stoplist
alone still left 66 — nearly all from `AHU`/`Air Handling Unit`/`Air
Handler Unit` being three genuinely distinct Brick class IRIs for the same
real-world concept, so any mapping citing only one already-correct synonym
still showed as "missing" the others. Added a **synonym-cluster check**:
if a mapping already cites *any* IRI from the same real-world-concept
cluster as a flagged label, that label is not a fresh gap (clusters:
AHU/Air_Handler_Unit/Air_Handling_Unit; Brick's/REC's `area`; Brick's
Occupancy_Sensor/REC's OccupancySensorEquipment; Brick's Heat_Exchanger/HX).
Also expanded the stoplist with `area`, `regulates`, `capacity`, `includes`
— real Brick/REC labels that are also common English words, found
producing false positives from ordinary prose ("regulates" appearing
inside `TerminalUnit`'s own already-cited definition, not as a separate
predicate claim; "capacity" inside a "cooling capacity" standard-practice
phrase, not the specific `rec#capacity` property).

That left 46 candidates, each manually checked against
`reference.domain.yaml`'s actual relationship `from`/`to` endpoints to
separate genuine uncited endpoints from two remaining false-positive
shapes: a label appearing only incidentally inside a *different*,
already-cited class's own quoted definition (e.g. `"fan"` inside
`AirHandlingUnit`'s own definition, cited for `AirHandlingUnit` itself, not
evidence that a *different* mapping about `Fan` needs its own citation);
and self-critical caveat text (a rationale explicitly saying a claim
*isn't* well-grounded is not a citation gap for the thing it declines to
claim).

**Result: 21 genuine items** — dominated by `AirHandlingUnit`-family
`hasPart`/`hasPoint`/`feeds` relationships whose endpoint was named in
evidence prose but never cited in that mapping's own `source_iris`, plus a
few bare predicate citations (`hasPart`, `feeds`) described in prose but
never formally cited. Fixed directly (pure Python addition of the missing
IRI(s) to each mapping's `source_iris`) — every one of the 21 already had
correct prose; only the citation was missing, unlike the earlier two
audits which also needed prose rewritten.

`relationships[29]` is a **third-round finding on the same target_path**:
flagged in round 3's raw 72, dropped as (apparently) not real, still
uncited after round 4's fix pass (which happened to touch this path for an
unrelated reason). Worth stating plainly: "not flagged in the last audit"
is not the same guarantee as "genuinely fixed" until a rescan with a
corrected matcher actually re-clears it.

### A root-cause code fix, not another data patch

Investigating `relationships[23]` specifically found the round-4-style
replace-not-merge regression had **also** independently hit round 3's own
fix for this exact mapping: its `hasPart` citation was silently dropped by
that repair batch, and `Space` — which round 3's own raw scan had *already
correctly flagged* as missing — was never even included in that batch's
`source_context` to begin with. This is the **second separate occurrence**
of the same failure mode (round 3's batch, then round 4's batch,
independently), which crosses the line from "be more careful constructing
the next batch" to "fix it in the code so it can't recur no matter how the
next batch is built."

Fixed in `repair.py`'s `apply_repairs()`: for `reground` decisions
specifically, `source_iris` is now the union of the mapping's existing
citations and the new decision's citations, not a wholesale replace.
`reground` is documented as "the element's own content is already fine,
just under-evidenced" — there is no legitimate case where it should drop a
previously-valid citation, so union is always correct for this action
(left `replace` untouched, since replaced content can genuinely mean the
old citations no longer apply). New regression test:
`tests/test_repair.py::test_reground_merges_source_iris_instead_of_replacing`.

### Verification

- Structural validity: 0 errors.
- 0/127 mappings with empty `source_iris`; mapping count unchanged (127).
- **Independent re-judge of all 21 changed elements**: 0 unsupported, 1
  contested (`classes.AirPlenum.properties.airflowState` — 2 `supported`,
  1 `partially_supported`, the same disclosed, non-blocking borderline
  category already accepted elsewhere in this domain). Cost: $0.1821.
- Full offline test suite: 201/201 passing (200 + 1 new regression test).

**Lesson, stated plainly, again**: three rounds in a row have now found a
real gap in the *previous* round's own "comprehensive" fix — first the
scan's case-sensitivity and length filter, then its label-normalization
assumption, then a data-construction bug that recurred independently
twice. The fix that finally stuck for the recurring part was moving the
invariant into code (`repair.py`'s merge-not-replace) instead of trusting
each future batch to be constructed correctly by hand. Full account of the
round-5 sample that triggered this: `manual-spot-check.md`.
