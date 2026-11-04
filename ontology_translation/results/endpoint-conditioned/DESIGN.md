# Endpoint-conditioned relationship recovery across generations: design note

Committed before the analysis is run. Offline: no model calls. Stored judge verdicts are replayed as they are and never re-asked.

## Question

Is the change in relationship F1 since the first paper a real gain in eliciting relationships? Two other effects could produce the same numbers:
- **Endpoint gating.** A gold relationship whose two classes were not both recovered cannot be matched, so a class deficit reappears as a relationship deficit.
- **Gold density.** The four published gold models have fewer relationships than classes (35/39, 13/20, 30/53, 31/57). The itops fixture has the reverse (108/68). A sparse relationship layer may be easier to recover.

The first paper (`v1.0-coginfocom2026`) reported the conditional rate on itops only: semantic policy, practical scope, 42 / 58 / 42 % over its three runs (`tests/evals/cross-run-analyses.mjs`). This note applies the same measure to every domain and every generation.

## Measure, per run

Define:
- **eligible**: the gold relationships whose two endpoint classes the run recovered;
- **recovered (eligible)**: the eligible relationships the run also recovered.

The measure is

**conditional rate = recovered (eligible) / eligible.**

Also reported, from the same assignment:
- class recall;
- raw relationship recall;
- the eligible share of the gold (eligible / gold relationships);
- relationships recovered without both endpoints recovered. This should be rare, because relationship matching uses the class assignment.

The recovered sets come from `recoveredGoldIds()` in `tests/evals/cross-run-analyses.mjs`: the one-to-one heuristic assignment, plus, under the semantic policy, the stored judge verdicts for items that assignment left unmatched. Gold is each domain's `ontology_translation/domains/<id>/reference.domain.yaml`. For the first paper's runs this means the converted itops gold, with the same 68 / 108 / 111 counts. The measure uses the current scorer.

## Cells

Each cell has 3 runs.

| Generation | Domains | Runs |
|---|---|---|
| First paper (`v1.0`, gpt-5.5 interviewer, gpt-4o-mini persona) | itops | `tests/evals/results/runs/run-0{1,2,3}` |
| Aug–Sep (gpt-5.4) | 4 published | `results/multi-domain/` |
| Aug–Sep (gpt-5.4) | itops | `results/multi-domain-control/` |
| Phase epic #152 (gpt-5.4) | 4 published | `results/multi-domain-post152/` |
| Phase epic #152 (gpt-5.4) | itops | `results/multi-domain-control-post152/` |
| Final (gpt-6-sol, effort high) | fibo-loans, brick-hvac | `results/default-change-187/treatment/` |
| Final (gpt-6-sol, effort high) | iof-maintenance, iof-supply-chain, itops | `results/final-scores/runs/` |
| Final baseline B3, no commits | all five | `results/baselines-gpt6/b3-no-commit/` |

## Reported

- **Primary reading:** heuristic policy, full domain. This is the reading of every table in the planned article.
- **Secondary readings:** semantic policy, wherever a run has stored verdicts, and practical scope.
- **Per cell:**
  - mean and min–max over the 3 runs of the conditional rate;
  - class recall and raw relationship recall;
  - the eligible share;
  - macro means over the 4 published domains.
- **Gold density per domain:** relationships per class, and the share of gold relationships whose two endpoints are distinct classes.

## How it is read (fixed in advance)

- The concept-structure gap counts as closed in a generation if, on the primary reading, the conditional rate is at least the class recall on the same runs.
- If the published domains meet that bar and itops does not, the closing is domain-dependent and cannot be stated generally.
- If neither meets it, the raw relationship-F1 gain reflects better class recovery (endpoint gating), not better relationship elicitation.

This note decides nothing by a significance test. With 3 runs per cell it is descriptive.
