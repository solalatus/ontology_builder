# Translation quality report: epo-ordering

**Hard gates: PASS**

## Structural validity (hard gate)
- ok: True
- errors: 0, warnings: 0

## Provenance completeness (hard gate)
- ok: True
- element provenance coverage: 100.0%
- source disposition coverage: 100.0%

## Relationship/action endpoint citation completeness (hard gate)
- ok: True
- gaps: 0

## Referential consistency (report-only)
- ok: False
- issues: 1

## Reverse coverage
- coverage: 100.0%
- silently dropped: 0

## Independent semantic judging (hard gate: zero majority-unsupported)
- majority-unsupported elements: 0

## Independent judging of exclusions (hard gate: zero majority-unjustified)
- majority-unjustified exclusions: 0
- contested exclusions: 2

## Translation stability (report-only, heuristic)
- classes: F1=1.00
- relationships: F1=0.37
- properties: F1=0.96
- allowed_values: F1=1.00

## Round-trip score (diagnostic, report-only)
- sampled: 5, average score: 0.91

## Competency-question support (report-only)
- support score: 100.0% (10 CQs)

## Post-run note (2026-11-04): owl:unionOf domains in extract.py

During this translation, `tools/extract.py` passed `owl:unionOf` domains and ranges on as opaque blank-node ids. That affected 19 of the 80 eOrdering properties. It caused the round-1 defects corrected in repair round 2 (see `manual-spot-check.md`), and it left three properties excluded with a false "unnamed domain" reason: `hasStatus`, `hasAmount` and `isCalculatedOn`.

After all runs on this domain, `extract.py` was fixed to expand unions into their member classes, with a test in `tools/tests/test_extract.py`. On this source, 0 of 80 properties now keep an unresolved domain or range.

**The frozen gold was not regenerated.** Every reported run was scored against the round-2 gold (`reference.domain.yaml` sha256 `ecd6fe08…`), which still excludes those three properties. Including them would need a recompile and re-evaluation (about 2 USD) and would change the gold after the runs. Recorded as a known limitation.

The same construct occurs in two earlier sources: IOF Supply Chain (8 declarations) and IOF Maintenance (1). Brick and FIBO have none. Their accepted gold models were built with the old extractor and are left unchanged. A future re-translation would pick up the fix.
