# Manual spot-check — Brick HVAC translation

Human evidence supplementing the automated QA suite (issue #103), done
in-session before issue #106 is closed. Full structured data (all 18
sampled items, verbatim source/result pairs) is in `manual-spot-check.json`;
this file is the readable summary.

**Date:** 2026-08-17
**Reviewer:** repo owner (szablevi@gmail.com), in-session with the coding agent
**Artefact definition:** every individually source-mapped element in
`translation.json`'s `mappings` list — classes, class properties,
relationships, rules, actions (175 total). Competency questions are
excluded: they're synthesized from the whole domain rather than mapped from
specific source IRIs, so there's no "original source info" to check them
against the same way.

## Sampling method

Stratified by artefact type, proportional allocation with largest-remainder
rounding (not pure random — with only 9 rules and 9 actions in the
population, a pure-random 18-item draw could easily miss those categories
entirely). Seed fixed at `106` for reproducibility.

| Type | Population | Sampled |
|---|---|---|
| classes | 48 | 5 |
| properties | 52 | 5 |
| relationships | 57 | 6 |
| rules | 9 | 1 |
| actions | 9 | 1 |
| **Total** | **175** | **18 (10.3%)** |

## Result: 17 accept, 1 reject

S1–S9 and S11–S18 (17 of 18): **accepted**, no comment. Source evidence
matched the resulting class/property/relationship/rule/action meaningfully
in every case checked.

**S10 — `classes.CRAH.properties.status` — rejected.**

Reviewer flagged it for a source-doc check. Findings:

1. `rec:status` in the pinned Brick source (`Brick.ttl:32600`) is a bare
   `owl:DatatypeProperty` with only an `rdfs:label "status"` — no comment,
   no range, no enumeration. There is no source-doc basis for *any*
   specific `allowed` value set on `status`.
2. Independent of that: `agent_ontology_spec.md` Section 5 types `allowed`
   as `string[] | null`. This class's `allowed` list was
   `[false, true, "cooling", "alarm"]` — YAML booleans mixed with strings.
   That's a direct type violation of our own format spec, not just a
   grounding weakness.
3. A full scan of the accepted candidate found the same defect on **16
   classes total**, all following the identical `[false, true, ...]`
   pattern: `AHU`, `Boiler`, `Chiller`, `Compressor`, `CondensingUnit`,
   `CoolingTower`, `Fan`, `HeatExchanger`, `Humidifier`, `Pump`,
   `SpaceHeater`, `TerminalUnit`, `Thermostat`, `WallAirConditioner`,
   `CRAC`, `CRAH`. Only the smaller "point"-class status properties in the
   sample (S6, S8, S9 — sensor/deck classes) came out as clean, single-type
   string enums.

## Remediation

**Code fix** (prevents recurrence, applies to all future compiles/domains):

- `tools/validate_domain.py` — the structural hard gate now flags
  `allowed_not_all_strings` when any `allowed` entry isn't a `str`
  (previously it only checked that `allowed` was *a list at all*).
- `tools/tests/test_validate_domain.py` — added coverage.
- `tools/prompts/compiler-prompt.md` — added an explicit instruction that
  `allowed` entries must always be plain strings, never bare YAML
  booleans, citing this finding.

**Data fix** (this domain only, manual, no rerun):

Manually edited `reference.domain.yaml`: replaced the literal YAML `false`
/ `true` values with the strings `"off"` / `"on"` in the `status.allowed`
list of all 16 affected classes. Diff is exactly those 32 lines — nothing
else in the file changed.

> **This was a manual correction, not a fresh LLM compile.** The compiler
> was not re-invoked; no Azure API calls were made for this fix; the rest
> of the translation's content and every mapping's provenance rationale in
> `translation.json` are unchanged from the originally accepted candidate.

**Re-validation performed:** re-ran the free, offline, deterministic
structural gate (`tools/validate_domain.py`) against the corrected file
with the new check active — 0 errors, 0 warnings. Full offline test suite
(95 tests) re-run and passing.

**Not done:** no LLM compile or evaluate re-run. `translation-evaluation.json`'s
semantic-judging, round-trip, and CQ-support numbers are unchanged from the
original accepted run and reflect the pre-fix content for those layers
(none of which examined `allowed`-list value types).
