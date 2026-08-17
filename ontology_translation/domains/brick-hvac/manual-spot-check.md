# Manual spot-check — Brick HVAC translation

Human evidence supplementing the automated QA suite (issue #103), done
in-session across multiple rounds. Full structured data (every sampled
item, verbatim source/result pairs, all rounds) is in
`manual-spot-check.json`, keyed by `rounds`; this file is the readable
summary, newest round first.

## Round 5 (2026-08-17)

10%-stratified sample (13 of 127 artefacts, seed 823; two items overlap
prior rounds by chance, `classes.HeatingValve` and `relationships[23]`,
both re-checked fresh). **Result: 10/13 accepted clean, 3/13 flagged.**

- **`relationships[11]`** (AHU hasPoint TemperatureDeadbandSetpoint):
  `source_iris` cited only `hasPoint`. The rationale explicitly discusses
  "the AHU-to-TemperatureDeadbandSetpoint pairing" — neither endpoint's
  real, citable class was cited.
- **`relationships[13]`** (Thermostat hasPoint TemperatureSetpoint): cited
  `hasPoint` + `Thermostat`, but the rationale said *"A TemperatureSetpoint
  is therefore a standard point..."* — `Temperature_Setpoint` (a real,
  distinct Brick class) was never cited.
- **`relationships[23]`** (Floor hasPart Space): cited only `Floor`.
  Neither `hasPart` nor `Space` was cited.

`relationships[13]` had already gone through a round-4 reground once — for
a *different* gap (it was missing `Thermostat`'s citation). Diffing the
before/after showed the round-4 fix's own rewritten prose introduced a
fresh, previously-vaguer mention of `TemperatureSetpoint` that became
citation-worthy — and nothing rescanned that fix's own output afterward.
That, combined with `relationships[11]`'s target endpoint
(`TemperatureDeadbandSetpoint`) never having a space in the evidence text
(`"AHU-to-TemperatureDeadbandSetpoint"`, the domain's own compiled
PascalCase name, not Brick's spaced label `"Temperature Deadband
Setpoint"`), pointed to a **third distinct scan-methodology gap** beyond
round 4's case-sensitivity and short-label-filter fixes: the scan never
matched evidence text that names a concept via the domain's own compiled
class name rather than the source ontology's spaced label.

Reviewer directed escalation (*"yes, escalate and fix the normalization
gap for all 3"*). Rather than patch only these 3, re-scanned all 127
mappings with a corrected matcher (word-boundary case-insensitive, plus a
second check for a label's no-space form as an exact contiguous alphabetic
token in the text — catching compiled-name mentions without the
substring-collision false positives a naive no-space substring search
would produce, e.g. `"Wing"` inside `"flowing"`). Filtered the raw hits
with an expanded stoplist (`area`, `regulates`, `capacity`, `includes`
joined the round-4 stoplist — all real Brick/REC labels that double as
generic English words) and a synonym-cluster check (citing one member of a
real synonym pair/triple — e.g. `AHU`/`Air_Handler_Unit`/
`Air_Handling_Unit`, or Brick's/REC's `area` — already covers a mention of
another member, not a fresh gap). Every remaining candidate was manually
checked against `reference.domain.yaml`'s actual relationship endpoints to
separate genuine uncited endpoints from incidental mentions inside an
already-cited class's own quoted definition (e.g. `"fan"` appearing only
because it's part of `AirHandlingUnit`'s own quoted definition, not
because a given mapping is actually about `Fan`) or self-critical caveat
text (a rationale explicitly disclaiming that a claim *isn't* well-grounded
is not itself a citation gap).

**Result: 21 genuine items**, dominated by `AirHandlingUnit`-family
relationships (`hasPart`/`hasPoint`/`feeds`) whose `from` or `to` endpoint
was named in evidence prose but never cited in that same mapping's
`source_iris`, plus a handful of predicate citations (`hasPart`, `feeds`)
described in prose but never formally cited. `relationships[29]` is now a
**third-round finding on the same target_path** — flagged in round 3's raw
scan, never made that round's final 42-item fix, still uncited after round
4's fix pass (which touched a different citation gap on a different item)
— a reminder that "no longer flagged in the last audit" isn't the same
guarantee as "genuinely fixed" until a rescan with the corrected matcher
actually re-clears it.

**A root-cause fix, not just another data patch:** confirmed the same
replace-not-merge regression from round 4 had *also* independently hit
round 3's own fix for `relationships[23]` — its `hasPart` citation was
silently dropped by that repair batch, and `Space` (which round 3's own
raw scan had correctly flagged as also missing) was never even included in
that batch's `source_context` in the first place. Given this is now the
**second time** this exact failure mode has surfaced across two different
repair batches, fixed it in `repair.py` itself rather than relying on
batch-construction discipline again: `apply_repairs()` now unions old and
new `source_iris` for `reground` decisions instead of replacing wholesale
— reground is documented as "content is already fine, just
under-evidenced," so it never has a legitimate reason to drop a
previously-valid citation. New regression test:
`tests/test_repair.py::test_reground_merges_source_iris_instead_of_replacing`.

The 21-item fix itself was applied directly (pure Python `source_iris`
addition, no LLM repair call needed) — unlike rounds 3-4, the
evidence/rationale prose in every one of these 21 already correctly named
the concept; only the citation itself was missing.

**Verification**: structural validation 0 errors, 0/127 mappings with
empty `source_iris`. Independent re-judge of all 21 changed elements:
**0 unsupported**, 1 contested (`classes.AirPlenum.properties.airflowState`
— 2 judges `supported`, 1 `partially_supported` on whether the plenum's
definition specifically supports an `airflowState` property vs. just a
general functional role; the same disclosed, non-blocking borderline
category already accepted elsewhere in this domain), cost $0.1821.

The other 10 of 13 sampled items this round: accepted with no flag —
`classes.HeatingValve`, `classes.DryCooler`, `classes.TerminalUnit`,
`classes.CoolingTemperatureSetpoint`, `classes.CO2Sensor.properties.value`,
`classes.CoolingTower.properties.status`,
`classes.CoolingValve.properties.position`,
`classes.HeatingTemperatureSetpoint.properties.value`,
`rules.investigateAirQuality`, `actions.increaseHeating` — every named
source class in each mapping's evidence was already present in its
`source_iris`.

**Full account: `provenance-audit.md`** (third follow-up section).

### Cost

Round-5 sample review + comprehensive rescan: no LLM calls (manual +
deterministic scan only). 21-item fix: no LLM call (direct correction).
Independent re-judge of all 21 changed elements: $0.1821.

## Round 4 (2026-08-17)

10%-stratified sample (13 of 127 artefacts, seed 512, all fresh from
round 3's). **Result: 10/13 accepted clean, 3/13 flagged** —
`classes.Chiller.properties.coolingCapacity`, `classes.Chiller.properties.status`,
`relationships[10]` (AHU hasPoint HeatingTemperatureSetpoint) — each an
evidence text that named/paraphrased a real source class without citing
it, the same category round 3's comprehensive audit was supposed to have
already eliminated.

Rather than treat these as three more one-off patches (the reviewer had
already ruled that out as a pattern in round 3 — *"this looks like whack
a mole more and more"*), the finding was escalated to auditing the round-3
audit's own methodology. Two real gaps were found:

- **Case-sensitivity**: the round-3 scan matched real class labels
  case-sensitively (e.g. `Chiller`), but `classes.Chiller.properties.status`'s
  evidence text used lowercase — *"standard HVAC practice for chiller
  operating state"* — and was never matched.
- **Short-label filtering**: the round-3 scan's label-collection step
  dropped labels of length ≤ 3, excluding "AHU" — so
  `relationships[10]`'s evidence, *"standard HVAC control practice
  associates heating setpoints with AHU control"*, was missed even by a
  case-insensitive rescan until the filter itself was found and removed.

**Fix**: re-ran the scan case-insensitively with no length filter — 107
raw hits, dominated by generic short Brick labels that collide with
common English words (`Class`, `Equipment`, `Space`, `Sensor`, `Setpoint`,
`Location`, `Entity`, `Outside`, `Pump`, `Point`, etc.). Filtered with an
explicit stoplist of those terms (107 → 27), then manually read the full
evidence/rationale text for each of the 27 to separate genuine uncited
paraphrases from false positives (ordinary English usage of a word that
happens to double as a class label; or a class name appearing incidentally
inside a quote that was already correctly cited). Landed on **20 genuine
items** (the 3 from this round's sample plus 17 more found only by the
comprehensive rescan, not sampling) — reground with corrected `source_iris`,
same provenance-only, zero-content-change discipline as round 3's fix.

**A second defect found while building the fix, not in the mappings
themselves**: the repair batch's `source_context` for each item listed
only the *new* citation to add, not the item's pre-existing correct ones
(bare property IRIs like `rec#value`/`rec#status`, relationship
predicates like `hasPart`/`hasPoint`/`feeds`, and in `relationships[30]`'s
case, a previously-correct `Space` citation). `repair.py`'s
`apply_repairs()` replaces `source_iris` wholesale rather than merging, so
all 20 items lost their previously-correct citations the moment the new
one was added — confirmed by diffing `relationships[30]` and then
systematically checking all 20. Fixed directly (pure Python union of
old+new `source_iris`, no re-run needed) rather than by re-calling the
repair model.

**Verification**: structural validation 0 errors, 0/127 mappings with
empty `source_iris`, mapping count unchanged (127, provenance-only edit).
Independent re-judge of all 20 changed elements: **0 unsupported**, 3
contested (`classes.CO2Sensor.properties.value`, `relationships[13]`,
`relationships[29]` — disclosed borderline supported/partially_supported
splits, same non-blocking category already accepted elsewhere in this
domain), cost $0.1475.

The other 10 of 13 sampled items this round: accepted with no flag —
`classes.AirPlenum`, `classes.Zone`, `classes.AirTemperatureSetpoint`,
`classes.HeatingValve`, `classes.HeatingValve.properties.position`,
`classes.SpaceHeater.properties.status`, `relationships[14]`,
`relationships[15]`, `rules.needsCoolingFromSetpoint`,
`actions.enableEconomizer` — matched their source material directly, with
correctly-cited `source_iris` in every case.

**Full account of the audit-methodology gap and corrected scan
methodology: `provenance-audit.md`.**

### Cost

Round-4 sample review: no LLM calls (manual only). Second-pass rescan +
stoplist filtering: no LLM calls (deterministic scan + manual review).
Reground fix + re-judge: $0.1475.

## Round 3 (2026-08-17)

10%-stratified sample (13 of 127 artefacts, seed 306 — a fresh sample, one
item overlapping round 2's by chance: `classes.Humidifier`, still solid).
**Result: 13/13 accepted.**

Two flags in this round were not one-off slips — they were the second and
third data points (after round 2's `relationships[31]`) in a systemic
pattern the reviewer directed a full investigation into rather than
accepting piecemeal:

- **`relationships[22]`** (Building hasPart Floor): cited evidence was
  borrowed from an unrelated third class (`Site`) documenting Brick's
  general hasPart/isPartOf convention, not from Building's or Floor's own
  definitions — neither endpoint's real definition was cited at all.
- **`actions.verifyOccupiedZoneConditioning`**: `source_iris` was entirely
  empty despite the rationale explicitly naming 4 specific classes (Zone,
  OccupancySensor, Thermostat, TerminalUnit) with real, citable IRIs.
  Confirmed via diff against the original fresh-compile output that this
  was never touched by any repair pass — the defect was in `compile.py`'s
  own original output, not just `repair.py`'s reground path (already fixed
  after round 2).

Given the pattern, the reviewer asked for a full comprehensive audit of all
127 mappings rather than another sample. **Full account:
`provenance-audit.md`** — 42 of 127 mappings (33%) had incomplete
`source_iris`; root cause was `compiler-prompt.md` itself explicitly
licensing empty citations for standard-practice claims. Fixed generally in
the prompt (affects every future domain) and reground for all 42 existing
mappings, independently re-verified (0 majority-unsupported across all 42).

All other 11 of 13 sampled items in this round: accepted with no flag —
`classes.Space` (Brick+REC consolidation), `classes.TemperatureDeadbandSetpoint`,
`classes.Filter`, `classes.SpaceHeater.properties.status`,
`classes.Boiler.properties.status`, `relationships[2]`, `relationships[3]`,
`rules.economizerReducesMechanicalConditioning` matched their source
material directly. `classes.TemperatureDeadbandSetpoint.properties.value`
flagged for the same label-only-grounding pattern already accepted in round
2 (`maxOccupancy`) — accepted for the same reason. `classes.Chiller.
properties.coolingCapacity` checked and confirmed correct: Brick really does
type `coolingCapacity` as `owl:ObjectProperty` (a real quirk in Brick's own
RDF), and the compiler correctly still modeled it as `type: number` in the
Agent Ontology regardless.

## Round 2 (2026-08-17)

Supersedes the first spot-check round (2026-08-17, pre-rerun) — its sampled
artefact population no longer exists after the full clean pipeline rerun
and the disposition-judging fix that followed it.

**Date:** 2026-08-17
**Reviewer:** repo owner (szablevi@gmail.com), in-session with the coding agent
**Artefact definition:** every individually source-mapped element in
`translation.json`'s `mappings` list — classes, class properties,
relationships, rules, actions (127 total at sampling time). Competency
questions excluded, same reasoning as round 1.

## Sampling method

Stratified by artefact type, proportional allocation, seed fixed at `106`
(same seed as round 1, for consistency of convention — the underlying
population is entirely different now).

| Type | Population | Sampled |
|---|---|---|
| classes | 39 | 4 |
| properties | 42 | 4 |
| relationships | 34 | 3 |
| rules | 7 | 1 |
| actions | 5 | 1 |
| **Total** | **127** | **13 (10.2%)** |

## Result: 13 accept, 0 reject

The agent presented all 13 with source vs. result, proactively flagging 4 as
worth a closer look before the reviewer rated anything. The reviewer
confirmed 3 of those flags as non-issues and asked for deeper investigation
on the 4th, which surfaced a real, fixed defect.

**S5 — `classes.Space.properties.maxOccupancy` — accepted.** Flagged: the
cited source (`rec#maxOccupancy`) has zero definition text in the source
ontology — the property is grounded purely in its own name being
self-explanatory. Reviewer accepted; genuinely nothing else to check it
against, and the name is unambiguous.

**S7 — `classes.Thermostat.properties.status` — accepted.** Flagged: uses
`allowed: [normal, fault, offline]`, a different vocabulary from every
other equipment class's `[off, on, alarm]` status convention in this
domain. Reviewer accepted as a deliberate, defensible distinction (a
thermostat is a control device reporting health/fault state, not on/off
equipment), not an unnoticed inconsistency.

**S9 — `relationships[12]` (Thermostat hasPoint TemperatureSensor) —
accepted.** Flagged: the rationale says the thermostat's setpoint-maintenance
definition "implies" sensor input rather than stating it directly. Reviewer
accepted as a reasonable, disclosed inference, not a fabrication.

**S10 — `relationships[31]` (Thermostat serves Zone) — accepted, with a
real defect found and fixed.** Flagged: `source_iris` was empty despite the
evidence text quoting what claimed to be Zone's real definition. Reviewer
asked the agent to investigate further rather than accept on the flag
alone.

Investigation confirmed the quoted evidence — *"maintained throughout by a
single controlling device"* — is a genuine, verbatim substring of Zone's
real Brick source definition, and turned up an additional real match the
mapping also hadn't cited: `rec#servicedBy`, an object property that
directly matches the "serves" relationship concept. So the underlying claim
was doubly well-grounded in real material; the mapping just never recorded
that. Root cause: `repair.py`'s `reground` action (which had produced this
mapping during an earlier repair pass) asked the model for
`source_evidence`/`confidence`/`rationale` as free text, but never asked for
`source_iris` as separate, structured, machine-checkable data — so even an
accurate prose citation left the mapping just as unverifiable as before the
repair, to anything except a human reading it closely.

Fixed generally in `repair.py` (not just this one mapping): `source_iris`
is now a required field on every `reground`/`replace` decision, validated
before anything is applied. Re-ran the reground call for this specific item
with the fix in place — `source_iris` now correctly lists Zone, Thermostat,
and `servicedBy`. Independently re-judged after the fix (not taken on the
repair call's own word): unanimous supported, 0 contested.

**A related self-correction, not itself an artefact finding:** the agent
initially flagged `actions.maintainWithinDeadband`'s rationale as "stale" —
the wording references the action's pre-rename name,
`maintainCurrentMode`. The reviewer challenged this directly, given the
session's full-clean-rerun claim: *"how can stale things be in there?"* The
agent verified by diffing against the pre-repair compile output and found
the current rationale text is genuinely different from the original,
proving it was written fresh during the repair-driven rename — the old name
is referenced deliberately, to explain *why* the rename happened, not
because anything was left unrefreshed. Flag withdrawn; logged here as a
transparency note on the review process itself, not as an artefact defect.

S1–S4, S6, S8, S11–S13 (9 of 13): accepted with no flag and no comment —
source evidence matched the resulting content in every case checked.

## Cost

Investigation and fix for S10: 3 real repair/re-judge Azure calls, ~$0.03
combined (negligible relative to the session's other spend).
