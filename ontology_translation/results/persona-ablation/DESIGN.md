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

## Amendment 1: persona contribution checks

**When:** written on 2026-11-04 at about 10:45 Berlin time. Run-01 had already finished (10:25) and run-02 was running. No score, match file or conversation log of any ablation run had been opened.

**Why:** a review raised a concern about the gpt-4o-mini persona. A weak persona may mostly accept what the interviewer proposes, which would make the ablation measure the interviewer's prior knowledge rather than elicitation. The checks below make that visible. They add to the readings above and change none of them.

**Checks.** All are offline and computed only after all three runs have ended. Each is reported for three arms: ablation, final itops (`final-scores/runs/*/itops`) and the first paper's rescored itops runs.

1. **Who named first.** Run `tests/evals/interviewer-prior-knowledge-report.mjs` on each arm. Report two numbers:
   - the share of gold identifiers that the interviewer introduced first;
   - the same share among the scored heuristic matches.
2. **Precision.** Report class, relationship and property precision next to recall, using the existing scorer.
3. **Confirm-only persona turns.** Count persona turns in the class and relationship phases, with phase taken from `conversation-log.md`. A turn is confirm-only when both of these hold:
   - (a) it introduces no gold identifier, or plain-word form of one, that has not already appeared in the conversation;
   - (b) it opens with an assent (yes, yeah, correct, right, exactly, that's right, sounds good, agreed) or is under 25 words.

   Report the share per run.

**Reading (fixed now).** The rubber-stamping concern is called *supported* when the ablation arm, compared with final, has all three of the following:
- a higher interviewer-first share among matches;
- a confirm-only share at least 10 percentage points higher;
- relationship precision no higher.

Otherwise it is called *not supported*. With 3 runs per arm this is descriptive. The article reports the numbers either way.

### Amendment 1a: phase window for check 3

**When:** written 2026-11-04 at about 11:15 Berlin time, during run-03, still before any ablation artefact was opened.

`conversation-log.md` carries no per-turn phase markers, so the "class and relationship phases" of check 3 are defined operationally from `tool-calls.md`. The window runs from the first turn whose `apply_ontology_yaml` call has a top-level `classes:` key, up to and including the last turn whose call has a top-level `relationships:` key. The persona turns of check 3 are those with a turn index inside this window.

This definition was derived from the logs of the final itops run-01 only (classes start at turn 10, relationships end at turn 39). Nothing else in Amendment 1 changes.
