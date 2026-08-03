# Three-run replication set (frozen configuration)

Per an external reviewer's explicit request: the single-run design was the review's largest remaining
empirical limitation. Rather than re-tune anything, this directory freezes the interviewer prompt, the
`itops_mtsr.yaml` fixture, all three models (interviewer/persona/classifier), and the scoring code exactly
as they stood after the class-matching fix (`recoveryMetrics.mjs`'s `matchClasses()` one-to-one bipartite
matching), then runs the eval three times back to back with **zero changes between runs**.

- **`run-01/`** — the pre-designated anchor run: the same run already reviewed in detail elsewhere (this is
  the run the class-matching fix's correctness was originally verified against).
- **`run-02/`**, **`run-03/`** — pure replications under the identical frozen configuration. Not further
  development rounds — nothing was tuned in response to their results.

Each subdirectory holds all seven result files verbatim (`report.md`, `conversation-log.md`,
`tool-calls.md`, `recovered-model.yaml`, `heuristic-matches.json`, `semantic-judgments.json`,
`semantic-matches.json`), exactly as `tests/evals/lib/reportGenerator.mjs` wrote them for that run — the
top-level `tests/evals/results/` directory (which always reflects only the *latest* run, by its own
long-standing overwrite convention) held `run-03`'s output at the time these were archived.

All three are reported below; none is picked as "the" result. `replication-runs.html` in this same
directory is a static, self-contained page rendering the same tables and findings below for a quicker
side-by-side read — open it directly in a browser, no server or build step needed (same "single portable
file" convention as `index.html` itself, spec.md §2).

## Run stats

| Run | Turns | Wall-clock | App-agent calls | `apply_ontology_yaml` | `get_graph_state` | Applied / Skipped |
|---|---|---|---|---|---|---|
| **run-01 (anchor)** | 52 | 1062s | 138 | 40× | 46× | 40 / 0 |
| run-02 | 51 | 961s | 133 | 39× | 43× | 39 / 0 |
| run-03 | 57 | 882s | 110 | 49× | **5×** | 48 / 3 |

## Heuristic metrics (regex/token-overlap, one-to-one matched)

### Full domain (68 classes / 108 relationships / 111 properties)

| Metric | run-01 (anchor) | run-02 | run-03 | Mean | Range |
|---|---|---|---|---|---|
| **Recovery effectiveness** | **36.4%** | **36.6%** | **38.6%** | 37.2% | 2.2 pt |
| Class recall / precision / F1 | 30.9 / 80.8 / 44.7 | 30.9 / 87.5 / 45.7 | 26.5 / 81.8 / 40.0 | 29.4 / 83.4 / 43.5 | 4.4 pt (recall) |
| Relationship recall / precision / F1 | 9.3 / 23.8 / 13.3 | 8.3 / 22.5 / 12.2 | 2.8 / 7.7 / 4.1 | 6.8 / 18.0 / 9.9 | 6.5 pt (recall) |
| Property recall | 12.6% | 26.1% | 14.4% | 17.7% | 13.5 pt |
| Controlled-value fidelity | 75.2% | 62.4% | 95.9% | 77.8% | 33.5 pt |

### Practical scope (28 classes / 41 relationships / 26 properties)

| Metric | run-01 (anchor) | run-02 | run-03 | Mean | Range |
|---|---|---|---|---|---|
| **Recovery effectiveness** | **50.6%** | **50.7%** | **45.1%** | 48.8% | 5.6 pt |
| Class recall / precision / F1 | 67.9 / 73.1 / 70.4 | 60.7 / 70.8 / 65.4 | 50.0 / 63.6 / 56.0 | 59.5 / 69.2 / 63.9 | 17.9 pt (recall) |
| Relationship recall / precision / F1 | 24.4 / 23.8 / 24.1 | 17.1 / 17.5 / 17.3 | 4.9 / 5.1 / 5.0 | 15.5 / 15.5 / 15.5 | 19.5 pt (recall) |
| Property recall | 26.9% | 50.0% | 23.1% | 33.3% | 26.9 pt |
| Controlled-value fidelity | 80.8% | 70.1% | 96.4% | 82.4% | 26.3 pt |

## Semantic metrics (LLM-adjudicated — always ≥ heuristic, per denominator)

### Full domain

| Metric | run-01 (anchor) | run-02 | run-03 | Mean | Range |
|---|---|---|---|---|---|
| **Recovery effectiveness** | **40.0%** | **46.8%** | **43.3%** | 43.4% | 6.8 pt |
| Class recall / precision / F1 | 33.8 / 88.5 / 48.9 | 32.4 / 91.7 / 47.8 | 29.4 / 90.9 / 44.4 | 31.9 / 90.4 / 47.0 | 4.4 pt (recall) |
| Relationship recall / precision / F1 | 13.0 / 33.3 / 18.7 | 17.6 / 47.5 / 25.7 | 12.0 / 33.3 / 17.7 | 14.2 / 38.0 / 20.7 | 5.6 pt (recall) |
| Property recall | 16.2% | 29.7% | 15.3% | 20.4% | 14.4 pt |
| Controlled-value fidelity | 76.3% | 83.8% | 95.7% | 85.3% | 19.4 pt |

### Practical scope

| Metric | run-01 (anchor) | run-02 | run-03 | Mean | Range |
|---|---|---|---|---|---|
| **Recovery effectiveness** | **56.3%** | **61.1%** | **50.9%** | 56.1% | 10.2 pt |
| Class recall / precision / F1 | 75.0 / 80.8 / 77.8 | 64.3 / 75.0 / 69.2 | 53.6 / 68.2 / 60.0 | 64.3 / 74.7 / 69.0 | 21.4 pt (recall) |
| Relationship recall / precision / F1 | 31.7 / 31.0 / 31.3 | 34.1 / 35.0 / 34.6 | 19.5 / 20.5 / 20.0 | 28.4 / 28.8 / 28.6 | 14.6 pt (recall) |
| Property recall | 34.6% | 53.8% | 26.9% | 38.4% | 26.9 pt |

## Findings

**The concept–structure gap repeats in all three runs.** Classes are recovered at roughly 2–10× the rate of
relationships in every run, both heuristic and semantic, both denominators — the single most stable pattern
in the whole replication set, more stable than any individual metric's own value across runs. Full-domain
class vs. relationship recall (heuristic): 30.9→9.3, 30.9→8.3, 26.5→2.8.

**Run-to-run variance is substantial and metric-dependent.** The equal-weighted composite is tight
(full-domain heuristic: 36.4–38.6%, a 2.2-point range) because sub-metric swings partly cancel out.
Individual sub-metrics vary far more: full-domain relationship recall swings more than 3× (2.8%–9.3%), and
controlled-value fidelity swings 33.5 points (62.4%–95.9%) — plausibly a small-sample artifact, since only a
handful of controlled-value properties are matched in any single run and one or two wording differences
move the average sharply. **Composite-level stability should not be read as sub-metric-level stability.**

**Low property recall is repeated, not a one-off of the anchor run.** Full-domain property recall is low in
2 of 3 runs (run-01: 12.6%, run-03: 14.4%) and markedly higher only in run-02 (26.1%). The anchor run's own
number is representative of the majority pattern, not an unlucky outlier — reading only the anchor would, if
anything, have *understated* how variable this metric actually is, not overstated a problem specific to that
one run.

**Run-03's behavioral outlier (observed, not established as causal).** Run-03 called `get_graph_state` only
5 times against 43–46 times in runs 1–2, despite having the most turns (57) and the most applied edits (48).
This coincides with run-03 also posting the lowest relationship recall by a wide margin. Presented as a
correlation worth investigating in future work — a 3-run set cannot establish causation on its own, and no
attempt was made to test it (that would require changing something between runs, which this replication set
was explicitly designed not to do).

## What this does and doesn't resolve

- **Removes** the "single stochastic run" objection: the anchor's numbers are now shown alongside two
  independent replications under the identical frozen configuration, not presented as the only possible
  outcome.
- **Does not resolve** the development–evaluation overlap — the prompt was iteratively tuned against this
  same fixture before this replication set existed (see `tests/evals/README.md`'s own section on this).
- **Does not resolve** the absence of unseen-domain transfer evidence — all three runs use the same fixture.
- **Does not resolve** the absence of real human–agent interview data — the persona side remains a
  single-pass simulated LLM in all three runs.
- **No further tuning happened**: run-02 and run-03 are replications under the configuration frozen
  immediately after run-01 — nothing about the prompt, fixture, models, or scoring code changed in response
  to their results.
