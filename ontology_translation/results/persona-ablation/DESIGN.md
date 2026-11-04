# Persona ablation on itops: design note

Committed before the runs.

## Question

Between the first paper and the final configuration, itops relationship F1 rose from 10.7 % to 59.0 % (prior runs rescored with the current scorer). Over the same period the simulated expert changed from `gpt-4o-mini` to a model as strong as the interviewer. This experiment separates the two: how much of the gain remains when the final interviewer talks to the first paper's persona model?

## Runs

- **3 runs, itops**, at the shipped configuration of `final-scores/` (`run-paired-stages.mjs --block=persona-4omini`), with exactly one change: `ONTOLOGY_EVAL_PERSONA_MODEL=gpt-4o-mini`. Everything else stays as in the final scores:
  - interviewer `gpt-6-sol` at the app's default effort (`high`);
  - prompt as at `2cb93e0`;
  - persona text: the converted `domains/itops/persona.md` and the wrapper;
  - the completion classifier and semantic judge stay `gpt-6-sol`;
  - snapshot A at the wrap-up.
- **Caps:** 120 min, 300 turns, 600 s per app turn. The cost cap is 30 USD per run, and the driver stops once 20 USD are recorded under this directory.
- **Cost accounting:** the harness prices every call at the gpt-6-sol rate. The persona's gpt-4o-mini calls are therefore over-counted, so the recorded cost is an upper bound.
- **Exclusion:** a run that ends other than `stages_complete` is reported and not averaged. The owner is asked before any re-run.

## Reported

Per run and as mean [min–max], heuristic, full domain:
- composite;
- class, relationship and property F1;
- recall and precision;
- the endpoint-conditioned rate (`tests/evals/endpoint-conditioned-by-domain.mjs`, extended with this cell).

These are set beside the first paper's rescored runs and the final itops runs (`final-scores/runs/*/itops`).

## Reading (fixed in advance)

- Final − ablation = the share of the gain carried by the stronger persona.
- Ablation − first paper = the share carried by the interviewer, prompt and tool changes, at the first paper's persona model.
- The persona text also differs from the first paper's hand-written `persona-eszter.md`. So the ablation isolates the persona *model*, not the persona as a whole. The article says so.
- 3 runs per arm: descriptive. Differences are reported with the bootstrap interval of `tests/evals/run-intervals.mjs`.
