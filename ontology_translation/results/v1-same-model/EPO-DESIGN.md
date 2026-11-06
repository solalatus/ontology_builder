# First-generation interviewer with the same models on the held-out domain (E1-ePO): design note

Committed before the first paid call of this block (2026-11-06, Berlin time; the commit time is the record). No v1 interview on epo-ordering has run.

## Why

E1 (`DESIGN.md` here) measured the interviewer gain only on the four development domains, on which the second generation was tuned (in-sample), and on the itops control, where there was none. The co-author's review asked for the one out-of-sample test that exists: the first-generation interviewer with the same models on the held-out ePO domain. The E1 results were known when this note was written; this note exists because of them.

## Runs

- **3 interviews, epo-ordering** (`run-paired-stages.mjs --block=v1-same-model-epo`), into `epo/run-0X/epo-ordering/`.
- Exactly the E1 v1 arm (`ONTOLOGY_EVAL_INTERVIEWER_GENERATION=v1`: v1.0 prompt and its two tools, no repair loop; the relay audit as in E1), with gpt-6-sol in every role and the final-scores caps (120 min, 300 turns, 600 s per app turn, 30 USD per run).
- **Comparison arm:** the 3 committed interactive ePO runs (`../epo-heldout/interactive/`, the frozen final interviewer, same models). Not re-run.
- One interview at a time; no other block on the deployment meanwhile.
- **Interruptions and run ends:** as in `DESIGN.md` ("Interruptions and run ends"): an infrastructure failure is moved to `failed-attempts/` and rerun alone; a behavioural or cap stop is a result of the arm and is scored on its final model.

## Reported

Per run and as mean [min–max]: composite, class / relationship / property F1 (heuristic, full domain), turns, cost; added to `REPORT.md` here by `tests/evals/v1-same-model-report.mjs`, and to `../t-intervals/`.

## Reading (fixed in advance)

- **Quantity:** composite, interactive (final interviewer) − v1, plain Welch 95 %, 3 against 3; relationship F1 the same way, descriptive.
- **Ceiling, stated now:** the final interviewer is at 96.8 % composite (93.6–100.0) on this domain. A difference near zero can therefore not show that the two generations are equal; it shows only that this domain does not separate them.
- **Three outcomes (as in E1):**
  - (a) lower bound > 0: "on the held-out domain too, the second-generation interviewer scores X points higher [a, b]";
  - (b) estimate > 0, interval includes 0: "X points higher on the held-out domain; with 3 runs per arm the difference is within run-to-run spread [a, b]";
  - (c) estimate ≤ 0: "no gain on the held-out domain [a, b], where the final interviewer is near the ceiling".
- The outcome decides wording only. The result goes into the article whatever it is.
