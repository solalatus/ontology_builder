# Held-out domain (ePO eOrdering), weak simulated expert: design note

Committed before the first paid call of this block (2026-11-04, about 20:30 Berlin time). No interview of this block has run. The interactive and B3 ePO results (`REPORT.md`) were known when this note was written; this note exists because of them.

## Question

With the interviewer frozen at the final configuration, how much of the ePO result survives when the simulated expert is the first paper's persona model (`gpt-4o-mini`) instead of `gpt-6-sol`?

The interactive ePO cell reached a composite of 96.8 %. A post-hoc count (`ANALYSIS.md`) showed that the `gpt-6-sol` persona said 10 to 13 of the 14 multi-word gold class names that are absent from its briefing. This block measures how much of the ePO headline depends on the strong expert's knowledge of the public vocabulary, in the same way as the itops persona ablation (`../persona-ablation/DESIGN.md`).

## Runs

- **3 runs, epo-ordering** (`run-paired-stages.mjs --block=epo-4omini`), into `weak-expert/run-0X/epo-ordering/`.
- Exactly the `epo-interactive` configuration, with **one change**: `ONTOLOGY_EVAL_PERSONA_MODEL=gpt-4o-mini`. Everything else is unchanged:
  - interviewer `gpt-6-sol` at the app's default effort (`high`); `index.html` as on `main`, which is unchanged against `2cb93e0` for the interviewer prompt and tools;
  - persona text: `domains/epo-ordering/persona.md` and the wrapper, as for the interactive cell;
  - the completion classifier and semantic judge stay `gpt-6-sol`;
  - snapshot A at the wrap-up;
  - caps 120 min, 300 turns, 600 s per app turn, 30 USD per run.
- On this Azure resource the `gpt-4o-mini` deployment is named `gpt-4o-mini` (model version 2024-07-18), the deployment the itops persona ablation used. The override passes this name directly.
- The block runs alone: no other block runs on the deployment at the same time.
- **Cost accounting:** the harness prices every call at the gpt-6-sol rate, so the recorded cost is an upper bound, as in the persona ablation.
- **Interruptions:** an interview cut off by a network or rate-limit failure is resumed by re-running the same block command, which continues from the checkpoint. If it cannot resume, only that interview's incomplete folder is moved to `failed-attempts/` (kept, not averaged) and the interview is rerun alone. Either event is recorded in `REPORT.md`. (The owner approved this procedure in advance for this block, 2026-11-04.)
- **Exclusion:** a run that ends other than `stages_complete` and cannot be rerun is reported and not averaged.

## Reported

Added as a third column to `REPORT.md` by `tests/evals/epo-heldout-report.mjs`, per run and as mean [min–max]:
- composite and class, relationship and property F1 (heuristic, full domain), with precision and recall;
- rules and actions F1, practical-scope composite, the endpoint ratio and conditional rate;
- **contamination counts as for the other ePO cells:** interviewer-first identifiers per 100 gold elements, and the post-hoc persona-beyond-briefing count of `ANALYSIS.md` (multi-word gold class names absent from the briefing that the persona said first);
- cost and turns.

Intervals (S1 of the revision): Welch t-intervals at 95 %, Welch–Satterthwaite degrees of freedom. With 3 runs per arm they describe the runs, not a population.

## Reading (fixed in advance)

Quantities, in percentage points of composite (full domain), each with its 95 % Welch interval:
- **ePO drop** = interactive (96.8) − weak expert. Plain Welch, 3 against 3.
- **itops drop** = final itops (57.7) − persona ablation (29.4), from the committed per-run values (`../persona-ablation/`), plain Welch, 3 against 3.
- **Difference of drops** = ePO drop − itops drop, with variance the sum of the four s²/n terms and Welch–Satterthwaite degrees of freedom.

The same three quantities are reported for relationship F1, descriptively.

Interpretation, on composite, fixed now:
1. **ePO drop ≥ itops drop** (point estimate): "the ePO headline depends on the simulated expert at least as much as the itops result does."
2. **Clearly smaller:** the upper bound of the difference-of-drops interval is below 0: "the interviewer carries more of the result on ePO than on itops; the likely reason is that the vocabulary of this public ontology is in the models' prior knowledge." The vocabulary prior is named as the likely reason, not as a shown cause.
3. Anything else (smaller on average, interval including 0): the numbers are reported without either label.

No other reading. The drop is also reported as a share of the interactive composite, descriptively. The article keeps, whatever the outcome: "the pipeline holds on a new domain; it does not show elicitation from a naive expert".
