# Manual spot-check — Brick HVAC translation (round 2)

Human evidence supplementing the automated QA suite (issue #103), done
in-session. Full structured data (all 13 sampled items, verbatim
source/result pairs) is in `manual-spot-check.json`; this file is the
readable summary. This round supersedes the first spot-check round
(2026-08-17, pre-rerun) — its sampled artefact population no longer exists
after the full clean pipeline rerun and the disposition-judging fix that
followed it.

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
