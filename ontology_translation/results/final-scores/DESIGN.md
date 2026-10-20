# Final scores: design note

Committed before the runs. This is the one result for all five benchmark domains at the configuration main ships after #191:

- the interviewer prompt with naming at confirmation time (#187) and the rule against stopping mid-interview (#188);
- `rename_ontology_elements` in every interview;
- default effort `high`.

It is descriptive. Nothing is decided by it: there is no pass criterion and no arm comparison.

## Runs

| Domain | Gold (classes / relationships / properties) | Source of its 3 runs |
|---|---|---|
| fibo-loans | 57 / 31 / 49 | `default-change-187/treatment/`, the #187 measurement, which ran exactly this app state |
| brick-hvac | 39 / 35 / 42 | `default-change-187/treatment/` |
| iof-maintenance | 20 / 13 / 5 | new, `final-scores/runs/` |
| iof-supply-chain | 53 / 30 / 3 | new, `final-scores/runs/` |
| itops | 68 / 108 / 111 | new, `final-scores/runs/`. The hand-authored, never-published domain, which serves as the contamination control |

The 9 new runs use `tests/evals/run-paired-stages.mjs --block=final`. That is the same configuration as #187's treatment (`default-change-187/DESIGN.md`, "Fixed for every run"):

- **Model and effort:** `gpt-6-sol` on Azure, with no effort passed, so the app's default `high` runs.
- **What runs:** the interview to the interviewer's own wrap-up, scored as snapshot A from its YAML export, with its own judge verdicts and an offline-replay check.
- **Caps:** 120-minute wall clock, 300 turns, 600 s per app turn, 30 USD per run.
- **Order:** one run at a time, alternating domain by domain.
- **Budget:** the driver stops before starting a run once 60 USD are recorded under this directory.

A run that hits a cap, or ends other than `stages_complete`, is reported and not averaged in. If that happens, the owner is asked before it is re-run.

## Reported (`tests/evals/analyze-final-scores.mjs`)

- **Per domain**, as mean ± sample stdev over its 3 runs:
  - composite on the heuristic scorer, full domain; practical scope; semantic;
  - class, relationship and property recall, precision and F1;
  - rules F1, actions F1, allowed-value lists.
- **Macro means** over all five domains and over the four published ones.
- **Contamination check.** The interviewer-first raw gold identifiers per run, raw and per 100 gold elements, for itops against the four published domains. Persona-first must be 0.
- **Per run:** turns, wall clock, cost, cached share.

## Not comparable, and not compared

The earlier multi-domain runs (`multi-domain-post152/`, `multi-domain-control-post152/`) used `gpt-5.4`, an earlier prompt and the provider-default effort. They are history, not a baseline. A comparison of this configuration against one-shot or no-commit baselines on the same model is not part of this result.

## Amendment, 2026-10-20 (after the runs, before the write-up)

The contamination check's measure was corrected. It used to count a gold identifier against the interviewer whenever the interviewer was the first to write it in raw form, even when the expert had already said the same words in plain language. It now credits the expert's plain-words mentions (`tests/evals/lib/interviewerPriorKnowledge.mjs`).

This changes no score and no run. Only that column is affected. The earlier published figures that used the same tool were recounted the same way (`ANALYSIS.md`, reading 3).

