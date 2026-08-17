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
