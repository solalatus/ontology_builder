# Run-to-run intervals: analysis

Numbers from `REPORT.md`: heuristic, full domain, 3 runs per cell, 95 % percentile bootstrap (10000 draws). With 3 runs these intervals are descriptive.

## The improvement claims

All of the article's improvement claims have bootstrap intervals clear of zero:

| Claim | Estimate | 95 % bootstrap |
|---|---|---|
| itops relationship F1, final − first paper | +0.483 | [0.389, 0.576] |
| itops composite, final − first paper | +0.322 | [0.221, 0.413] |
| Published composite, final − Aug–Sep | +0.123 | [0.073, 0.172] |
| Published relationship F1, interactive − B3 | +0.184 | [0.097, 0.272] |
| Published composite, interactive − B2 | +0.427 | [0.382, 0.472] |

## The one difference that is not clear of zero

itops composite, interactive − B3: −0.086, bootstrap [−0.211, 0.034]. The no-commit baseline's lead on the unpublished domain is within run-to-run variation. The article should report it as "B3 level with or ahead of interactive on itops", not as a firm reversal. The endpoint-conditioned analysis (`../endpoint-conditioned/ANALYSIS.md`) locates the difference in class recall.

## Widest per-domain spreads (min–max over 3 runs)

- Final, Brick HVAC, relationship F1: 0.455–0.899.
- Final, itops, composite: 0.466–0.657.
- B3, Brick HVAC, relationship F1: 0.143–0.646.

These belong in the article's tables as [min–max], next to the means.
