# Translation quality report: brick-hvac

**Hard gates: PASS**

## Structural validity (hard gate)
- ok: True
- errors: 0, warnings: 0

## Provenance completeness (hard gate)
- ok: True
- element provenance coverage: 100.0%
- source disposition coverage: 100.0%

## Reverse coverage
- coverage: 100.0%
- silently dropped: 0

## Independent semantic judging (hard gate: zero majority-unsupported)
- majority-unsupported elements: 0

## Translation stability (report-only, heuristic)
- classes: F1=0.85
- relationships: F1=0.78
- properties: F1=0.64
- allowed_values: F1=0.37

## Round-trip score (diagnostic, report-only)
- sampled: 5, average score: 0.90

## Competency-question support (report-only)
- support score: 40.0% (10 CQs)

## Manual spot-check (human evidence, in-session, 2026-08-17)
- 10% stratified sample of the 175 source-mapped artefacts (18 items):
  17 accepted, 1 rejected. See `manual-spot-check.md` / `.json` for the
  full sample and verdicts.
- The 1 reject (`classes.CRAH.properties.status`) found a real,
  spec-violating defect (bool/string-mixed `allowed` list) present on 16
  classes' `status` property. Manually corrected in this file (no LLM
  rerun); `validate_domain.py` was extended to catch this automatically
  going forward.
- Note in hindsight: the `allowed_values` stability F1 of 0.37 above (the
  lowest of any stability metric) was already a signal that the compiler
  was inconsistent about `allowed` lists across its 3 independent runs —
  worth watching on future domains even where the structural gate passes.

## Repair pass (standing policy: don't just drop rejected elements, 2026-08-17)
- The 3 relationships removed during the original QA pass were revisited
  with a targeted repair call (`repair.py`, ~$0.04) rather than left
  dropped by default:
  - `relationships[57]` **CondensingUnit hasPart Compressor** (`replace`,
    correcting the original wrongly-targeted `Chiller hasPart Compressor`
    — CondensingUnit's own source definition explicitly says it comprises
    a compressor).
  - `relationships[58]` **Zone hasPoint TemperatureDeadbandSetpoint**
    (`reground`, same relationship, now grounded against the zone's
    existing heating/cooling setpoint siblings instead of the original
    hedged evidence).
  - `AHU hasPart AirPlenum` (`drop`, confirmed correct: the domain already
    has `AHU feeds AirPlenum`, which is what the evidence actually
    supported).
- Both additions were independently re-judged by the same 3-judge
  semantic-judging process used for the rest of the domain: **unanimously
  supported, 0 unsupported** ($0.0126).
- Relationship count: 57 → 59. All hard gates re-checked and still clean
  (structural 0 errors, provenance 100%/100%, reverse coverage 100%,
  semantic judging 0 majority-unsupported).

## Systemic judging fix + second repair pass (2026-08-17, same day)

A manual review of the two additions above raised a real concern about a
*different*, never-independently-scrutinized relationship
(`Chiller hasPart CondensingUnit`) — checking it revealed judges only ever
saw the compiler's own self-reported evidence text, never the real source
material, so a confident-sounding but ungrounded claim could sail through
unchallenged. Fixed generally in `evaluate.py` (not specific to this
domain): judges now see real, independently-resolved source class
definitions, and non-unanimous verdicts are now tracked as "contested"
even when a majority still passes.

Found and fixed two further real bugs surfaced by actually running the
fix at full scale (177 elements × 3 judges) rather than trusting unit
tests alone:
- PascalCase/camelCase class names (`CondensingUnit`) never matched
  spaced source labels (`Condensing Unit`) — ground truth silently failed
  for almost every multi-word class.
- The judge prompt let partial-by-design ground truth (an action only
  ever resolves its input class) read as evidence *against* an action,
  producing false negatives.

With both fixed, a full re-judge found the real pattern: every `status`
property in the file shared one identical templated justification, which
held up for equipment (AHU, Fan, Chiller...) but not consistently for
sensors/valves — 6 unsupported, 15 contested, all traced to this. Ran the
9 affected properties/rule through a **generalized** `repair.py` (rebuilt
to repair any element kind in place, not just retroactively-append
relationships — the original version only worked for the one case it was
first written against):
- 3 valve properties **renamed** `status` → `position` (the allowed
  values were fine; the property name was the ungrounded part —
  `HeatingValve`, `IsolationValve`, `SteamValve`).
- 3 items **regrounded** with stronger, specific evidence (majority was
  already supported, just contested — the CO2 ventilation rule, and two
  sensor properties).
- 3 sensor `status` properties **genuinely dropped**
  (`CO2LevelSensor`, `WaterTemperatureSensor`, `AirQualitySensor`) — no
  defensible grounding and no honestly-supported narrower replacement.

All resulting elements independently re-judged afterward: **unanimous
supported, 0 unsupported.** Final state: 174 elements (177 − 3 genuine
drops), **0 unsupported, 8 contested** (real, disclosed judge
disagreement on otherwise-passing elements — left as-is, not
force-resolved, per the same "report, don't hide" principle). Total real
Azure cost across this entire re-judge/fix/repair/verify lineage: ~$1.64
(judging) + ~$0.024 (repair) ≈ **$1.66**.
