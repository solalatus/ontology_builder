# Baselines at the shipped configuration: design note (pre-registration)

Committed before the first paid run. The question is the one a reviewer of the final scores (`../final-scores/`) asks first: does the interactive method earn its machinery, or would a simpler procedure on the same model do as well?

Three comparison conditions from `tests/evals/EXPERIMENT_BRIEF.md` §3 are run on all five domains. Each varies one factor against the final-score runs and holds everything else fixed.

| Condition | The one factor varied | How its model is produced |
|---|---|---|
| **Interactive** (the final scores; reused, not re-run) | — | committed during the interview by the staged interviewer |
| **B1, one-shot** | how a conversation becomes a model | one extraction call over the *interactive run's own* finished transcript |
| **B2, generic interviewer** | the interviewer's system prompt | a fresh interview with a short generic prompt; tools, commits and stopping unchanged |
| **B3, no commits** | whether anything can be committed mid-conversation | a fresh interview with the staged prompt but no tools; one extraction call over its own transcript at the wrap-up |

B1 is paired: its run-NN uses the transcript of the interactive run-NN on the same domain, so B1 minus interactive is a within-conversation difference.

## The prompts are the pre-registered originals

The baseline prompts are not written or changed here (brief §4.6). Both are pinned by hash to the ones the original itops runs recorded (`tests/baseline-conditions.spec.mjs`):

- **B2's generic prompt:** `1ab4027e…`. It was moved verbatim from `baseline-b2-generic-interviewer.eval.spec.mjs` to `tests/evals/lib/baselineConditions.mjs`.
- **B1's and B3's extraction prompt** (`baseline-one-shot.mjs`'s `SYSTEM_PROMPT`): `41c2e221…`.

Neither contains any gold content (§4.2).

## Fixed for every run

The same settings as the final scores (`../final-scores/DESIGN.md`), except where stated:

- **Model:** `gpt-6-sol` on Azure for the interviewer, persona, classifier and judge. Interviews run at the app's default effort, `high`.
- **Extraction effort:** the B1 and B3 extraction call is sent at effort `high`, the shipped interviewer's default, so the comparison is not between two efforts. The original itops runs sent none, on a different model.
- **Persona:** the same persona files and wrapper.
- **Scoring:** snapshot A is scored exactly as a final-score snapshot (`tests/evals/lib/snapshotScoring.mjs`):
  - heuristic on the full domain and the practical scope;
  - rules and actions;
  - semantic, with this run's own judge verdicts stored beside it (§4.5);
  - an offline-replay check.

  For B2, snapshot A is the canvas at the interviewer's wrap-up. For B3 and B1, it is the extracted model.
- **Caps:** 120-minute wall clock, 300 turns, 600 s per app turn, 10 USD per run.
- **Order:** one run at a time, alternating domains:
  1. B1, 15 extraction calls;
  2. B3, 15 interviews;
  3. B2, 15 interviews.

  B3 comes before B2 because it is the condition closest to the paper's claim (brief §3).
- **Budget:** `tests/evals/run-paired-stages.mjs --block=baselines --budget=80`. The driver stops before starting any item once 80 USD are recorded under this directory.
- **Estimate:** about 50 USD and 7 hours.

**Exclusion.** A run that hits a cap, fails, or ends any way other than its condition's clean end is excluded and reported, not averaged in. The clean ends are `extracted` for B1 and `stages_complete` for B2 and B3. The driver stops at such a run. If the cause is specific to that run, the driver is restarted with that run skipped. If it is systematic, for example every B2 run hitting the same cap, nothing more is spent and the owner decides. A run is never re-run without the owner.

## Reported (`tests/evals/analyze-baselines.mjs`)

- **Per domain**, as mean ± sample stdev over 3 runs, for interactive, B1, B2 and B3:
  - composite on the heuristic scorer, full domain, which is the primary measure;
  - practical scope; semantic;
  - class, relationship and property F1; rules F1; actions F1;
  - turns and cost.
- **Paired B1 minus interactive**, per run.
- **Macro means** over the four published domains (primary) and over all five.

**Reading rule**, fixed now. On a domain, the interactive composite *beats* a baseline when the difference of means exceeds the larger of the two stdevs. The two are *level* when the difference is within that. Otherwise the baseline is *ahead*. Over the five domains, the result for each baseline is the count of beats, levels and aheads.

No other comparison is a pass criterion. Three replicates detect differences of about 0.1 (#182).

## Not part of this

- B4 (private scratch model) and B5 (a held-out domain). itops already serves as the domain the prompt was not tuned on for memorization; it is not held out from prompt tuning.
- Any change to a baseline prompt.
- Comparing these runs with the original itops baselines, which used `gpt-5.5`, an earlier persona and an earlier app.

## Amendment 1, 2026-10-20 21:55 UTC (after B1, before any B3 result)

**What happened.** The first B3 run (fibo-loans run-01) was stopped at turn 80 by the harness's no-tool-activity stall detector (`wasted_turns_no_tool_activity`; issue #133, item 8). It cost 1.24 USD.

The detector ends a run in which the app goes 80 turns without a tool call. It was added in September to catch dead loops, after the original B3 runs of August. Under B3 the app is offered no tools at all, so the detector is certain to fire on every B3 run. It measures nothing about the condition. The transcript shows a productive interview, still confirming meanings at turn 80.

**The change.** The detector does not stop a run that is offered no tools (`toolActivityExpected` in `conversationOrchestrator.mjs`, set by the runner for B3 only). The rest is unchanged for every condition:
- the detector still applies to every run that is offered tools;
- the streak is still counted;
- the turn, wall-clock and cost caps still apply;
- every other loop guard still applies.

A dry run past the threshold covers it (`tests/baseline-conditions.spec.mjs`), and it fails without the change.

**The stopped run.** It produced no snapshot and no extraction, so it has no result that could be kept or discarded. Its files are kept in `excluded/`, and its cost stays in the budget. Its slot is re-run. This departs from "a run is never re-run without the owner", which exists to stop an unlucky outcome being re-drawn. There is no outcome here. The deviation is stated here and in the write-up.

## Note, 2026-10-21 01:21 UTC: container restart

The machine running the series was restarted during B3 fibo-loans run-03, at turn 32 and 0.40 USD. The run was killed, not ended by anything in the protocol, and produced no snapshot. Its files are kept in `excluded/` and its cost stays in the budget. Its slot is re-run, for the same reason as Amendment 1: there is no outcome to keep or discard. The 25 runs completed before the restart were unaffected.
