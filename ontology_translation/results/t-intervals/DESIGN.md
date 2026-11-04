# Welch t-intervals for the article's differences (S1): design note

Written 2026-11-04 (Berlin time), before this analysis was run. It is offline and costs nothing. The per-run values were known: they are the committed values behind the article. Two expected outcomes were computed beforehand from `run-intervals/results.json` (listed below, "Expected").

## Why

The article's intervals so far are 95 % percentile bootstraps over 3 runs per arm (`tests/evals/run-intervals.mjs`, `../run-intervals/`). Three values give only 10 distinct resamples per arm, so the percentile interval understates the uncertainty. This analysis replaces them in the article with Welch t-intervals. `run-intervals/` is not changed; it stays the record of the old method.

## Method (`tests/evals/t-intervals.mjs`, `tests/evals/lib/welch.mjs`)

- **Cells:** mean and [min–max] over the runs for every cell, as in `run-intervals/results.json`, plus the cells of the two revision-1 experiments (E1 `v1-same-model/results.json`, E2 `epo-heldout/results.json`, arm `weak`).
- **Single-domain differences** (itops, ePO): plain Welch, mean(a) − mean(b) ± t(0.975, df) · sqrt(s²_a/n_a + s²_b/n_b), Welch–Satterthwaite df.
- **Macro differences over several domains:** the domain-stratified Welch interval of `v1-same-model/DESIGN.md`: D = (1/K) Σ_d (mean_a,d − mean_b,d), Var(D) = (1/K²) Σ_d (s²_a,d/n_a,d + s²_b,d/n_b,d), Welch–Satterthwaite df. The domains are fixed strata, not a sample of domains.
- 95 %, two-sided. With 3 runs per arm these intervals are wide; they describe the runs, not a population.

## Differences (every difference the article reports with an interval)

Development macro (4 domains, stratified):
1. composite, final − Aug–Sep (Table II, +12.3);
2. composite, interactive − B2 (Table V);
3. composite, interactive − B3 (Table V, the +9.3 commit effect);
4. relationship F1, interactive − B3 (Table V);
5. composite and relationship F1, B1 − interactive (Table V, the one-shot baseline);
6. E1 primary and key secondary, final − v1 same-model (from `v1-same-model/results.json`, recomputed here with the same function).

itops (plain Welch):
7. composite, interactive − B3;
8. composite, class, relationship and property F1: final − first paper; persona ablation − first paper; final − persona ablation (Table III breakdown rows);
9. E1 descriptive: composite and relationship F1, final − v1 same-model.

ePO (plain Welch):
10. composite and relationship F1, interactive − B3;
11. E2: composite and relationship F1, interactive − weak expert, and the difference of drops (as in `epo-heldout/WEAK-EXPERT-DESIGN.md`).

## Wording rule for the article (fixed now)

"Clear" (or any similar adjective) only when the 95 % interval excludes 0. Otherwise the number and its interval stay and the adjective goes. A number is never dropped.

## Expected (computed 2026-11-04 from `run-intervals/results.json`, before this note)

With 3 against 3 the itops interviewer-only gain (persona ablation − first paper) is +4.0 composite [−5.6, +13.7] and +8.3 relationship F1 [−1.7, +18.3]. The +8.3 loses "clear". E1 replaces it as the evidence for the interviewer's own contribution.
