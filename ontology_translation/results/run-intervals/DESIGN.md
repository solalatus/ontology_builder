# Run-to-run intervals for the article tables: design note

Committed before the analysis runs. Offline, no model calls. Inputs are the committed per-run scores only:
- `summary.json` of each results root;
- the first paper's runs, rescored with the current scorer (`tests/evals/rescore-saved-run.mjs`).

## Why

Every cell of the article's tables is a mean over 3 runs. A co-author's review asked for min–max or bootstrap intervals (the Brick HVAC sd is ±0.096).

## What is reported

Quantities, heuristic policy, full domain:
- composite;
- class F1, relationship F1 and property F1.

Cells:

| Cell | Source |
|---|---|
| First paper, itops | `tests/evals/results/runs/run-0{1,2,3}` rescored |
| Aug–Sep and post-#152, published domains | `multi-domain*/summary.json` |
| Aug–Sep and post-#152, itops | the corresponding `-control` roots |
| Final, all five domains | `final-scores/summary.json`; clean runs only |
| Baselines, all five domains | `baselines-gpt6/summary.json`: interactive, B1, B2, B3 |

1. **Per domain:** mean, min and max over its 3 runs. This is the primary interval: with 3 runs, min–max is the honest description.
2. **Macro over the 4 published domains:** mean plus a percentile bootstrap interval.
   - Each draw resamples 3 runs with replacement within each domain and averages domain means.
   - 10000 draws, fixed seed 20261104, 2.5 / 97.5 percentiles.
3. **Differences behind the article's improvement claims**, each with the same bootstrap interval:
   - itops, final − first paper;
   - published macro, final − Aug–Sep;
   - published macro, interactive − B3, and interactive − B2.

## Caveat (stated in the article)

With 3 runs a bootstrap interval understates the uncertainty: it can only recombine three observed values. The intervals are descriptive, not inferential, and the article says so.
