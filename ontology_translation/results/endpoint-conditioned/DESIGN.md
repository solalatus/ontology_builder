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

## Amendment 1: reading rule replaced (written after the first output was seen)

The rule under "How it is read" compared the conditional rate with class recall. The two are not commensurable:
- class recall is a share of all gold classes;
- the conditional rate is a share of a subset that already presupposes the classes.

The first paper's own runs pass that rule: conditional 32.6 % against class recall 29.4 % on the primary reading. Yet the gap was the first paper's main finding. A rule that the original gap also passes cannot show a change, so it is withdrawn. This amendment is written after the first output was seen, and it is reported as such.

Replacement rule, primary reading:

1. **The gap**, as the first paper stated it, is raw relationship recall against raw class recall on the same runs. It is measured as the **ratio relationship recall / class recall** (first paper: 0.25).
   - The gap counts as **closed** in a cell if the ratio is at least 1.0.
   - Otherwise the ratio is reported as how far the gap has narrowed.
2. **The conditional rate** says where a remaining relationship deficit comes from. It is not a pass criterion.
   - A high rate means that relationships between classes the run found are elicited. The rest of the deficit is then endpoint gating, which is a class-recall problem.
   - A low rate means relationship elicitation itself falls short.
3. **Density check.** itops is the only dense gold model (1.59 relationships per class; the published domains have 0.54–0.90). The question is whether the conditional rate on itops in a generation is close to the published macro rate.
   - If it is, recovering a relationship once both endpoints are found does not depend on gold density.
   - Any remaining raw gap is then about classes.

The per-run eligible and recovered counts for the first paper's runs are compared with the published figures (semantic policy, practical scope; 31 / 24 / 19 eligible, 13 / 14 / 8 recovered) as a check of the script.
