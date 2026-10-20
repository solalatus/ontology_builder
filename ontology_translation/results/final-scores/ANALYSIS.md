# Final scores: analysis

These are the readings of `REPORT.md`, which holds the generated tables. The design is in `DESIGN.md`, committed before the runs.

The result covers all five benchmark domains, three interviews each, at the configuration main ships after #191:

- the interviewer prompt with naming at confirmation time (#187) and the rule against stopping mid-interview (#188);
- the rename tool in every interview;
- default effort `high`;
- `gpt-6-sol` on Azure.

fibo-loans and brick-hvac reuse #187's treatment runs, which ran exactly this app state. The other nine runs are new.

## The result

| Domain | Gold elements (classes + relationships + properties) | Composite (heuristic, full domain) | Range over 3 runs | Semantic | Practical scope |
|---|---|---|---|---|---|
| iof-maintenance | 38 | **0.911** ± 0.033 | 0.888 to 0.949 | 0.920 | 0.740 |
| brick-hvac | 116 | **0.811** ± 0.096 | 0.708 to 0.898 | 0.903 | 0.616 |
| iof-supply-chain | 86 | **0.721** ± 0.065 | 0.646 to 0.762 | 0.721 | 0.888 |
| fibo-loans | 137 | **0.680** ± 0.016 | 0.662 to 0.691 | 0.687 | 0.583 |
| itops (unpublished control) | 287 | **0.577** ± 0.099 | 0.466 to 0.657 | 0.578 | 0.664 |
| **Four published domains, macro mean (primary)** | | **0.781** | | 0.808 | 0.707 |
| All five, macro mean | | 0.740 | | 0.762 | 0.698 |

The four published domains are the primary result, and itops is reported beside them as the leakage control. That is the convention in `PAPER_NOTES.md` (2026-09-02). The single figure across everything is **0.740**.

## Every run was clean

- **15 of 15 runs** ended `stages_complete` at a genuine wrap-up.
- No run hit a cap, and none was cut short. That is #188's failure mode, and it did not recur in 15 runs.
- Every run recorded effort `high`.
- Every snapshot passed the offline-replay check: rescoring the saved YAML from disk gave the same numbers.
- I re-checked this independently afterwards with `tests/evals/rescore-saved-run.mjs`, the domain given per run. All 15 snapshots reproduce their composite, practical-scope, semantic, rules F1 and actions F1 exactly.
- The persona never said a raw gold identifier first: the leak guard counts 0 in all 15 runs.

## Readings

**1. What is recorded is almost always right. What is missing is recall.**
- Class precision is 0.95 to 1.00 in every domain, and property precision is 0.89 to 1.00.
- Relationship precision is 0.89 to 0.97 everywhere except brick-hvac (0.70 ± 0.21).
- Class recall is low on the three large domains: fibo-loans 0.46, iof-supply-chain 0.45, itops 0.49.

This matches #182's coverage-sweep finding (#179). The interviewer commits what the recorded competency questions and actions need. The gold ontologies contain more than that.

A sweep after the wrap-up surfaced the missing items, but did not get them added, because of the competency-question inclusion test. On 2026-10-14 the owner decided not to relax that test. So this recall gap reflects the method's scope rule, not a defect, and it is the main reason scores are below 1.

**2. The score falls with domain size.** Ordered by gold size:

| Domain | Gold elements | Composite |
|---|---|---|
| iof-maintenance | 38 | 0.911 |
| iof-supply-chain | 86 | 0.721 |
| brick-hvac | 116 | 0.811 |
| fibo-loans | 137 | 0.680 |
| itops | 287 | 0.577 |

brick-hvac is the only exception to the trend. An interview of 80 to 140 turns covers a 38-element domain nearly completely, but not one of 287.

itops is both the largest domain and the only unpublished one. With one control domain, its lower score cannot be split between "unpublished" and "large". The domain-size confound noted in `multi-domain-control/README.md` still applies.

**3. No sign that the interviewer recites published ontologies.** The check counts the gold identifiers the interviewer wrote before the expert had said them, either as the identifier or in plain words (`lib/interviewerPriorKnowledge.mjs`).

| Domain | Interviewer-first per run | Range | Persona-first (leak guard) |
|---|---|---|---|
| fibo-loans | 0.0 | 0 to 0 | 0 |
| brick-hvac | 0.0 | 0 to 0 | 0 |
| iof-maintenance | 2.7 | 0 to 4 | 0 |
| iof-supply-chain | 2.7 | 0 to 5 | 0 |
| itops (cannot have been memorized) | 4.0 | 1 to 10 | 0 |

- **The unpublished domain has the most.** If the interviewer were reciting published ontologies from memory, the published domains would show more of these than itops. They show fewer.
- **They are obvious names, not recalled ones.** Almost all are verb–noun action names that follow directly from the conversation, such as `startMaintenanceProcess`, `recordTrackingEvent` and `closeIncident`.
- **Memorized terms would show up here, and they don't.** The IOF-specific terms one would expect from memory, `DispositionToFail` and `UndesirableDisposition`, were said in plain words by the expert first.

Per 100 gold elements the figures are 0.0, 0.0, 7.0, 3.1 and 1.4 (`REPORT.md`). iof-maintenance's 7.0 is 8 identifiers over a gold of only 38 elements, so per run is the fairer comparison.

**The count was corrected on 2026-10-20, before this write-up.** It used to count only raw identifiers, so it credited the interviewer whenever it was the first to write a term in camelCase, even when that term was the expert's own phrase written back. For example, the expert said "maintenance work order record" and the interviewer recorded it as `MaintenanceWorkOrderRecord`. The tool now credits the expert's plain-words mentions, with unit tests (`tests/interviewer-prior-knowledge.spec.mjs`).

Every earlier figure was recounted the same way, offline:
- the published domains' 12 runs (`multi-domain/`): 80, previously reported as 330;
- the earlier itops control (`multi-domain-control/`): 32, previously 167.

A hand check of a sample of the terms the correction moved found each to be the expert's own phrase. Most of them come from the opening competency questions.

**4. The heuristic and semantic scores now agree** everywhere except brick-hvac (0.811 vs 0.903). Earlier in the series, much of the gap between the two scorers was wording: the judge accepted the interviewer's paraphrase where the heuristic scorer did not. With the expert's own term asked for at confirmation time (#187), there is little left for the judge to rescue.

On iof-supply-chain the two scores are identical in all three runs. In runs 01 and 02 every recorded item already matched heuristically, so no judge call was needed. In run 03 the judge was called twice and accepted nothing further.

**5. Rules differ sharply by domain.**
- Rules F1 is 0.70 to 0.86 on the two IOF domains and itops.
- It is 0.30 ± 0.38 on fibo-loans and 0.05 on brick-hvac.
- Actions F1 is 0.78 to 1.00 everywhere.

This is the weakest dimension on two of the four published domains, and it is not part of the composite.

**6. Replicate spread.**
- brick-hvac and itops vary by about ±0.10 between runs; fibo-loans by only ±0.016.
- iof-supply-chain's third run is the low one: 0.646, against 0.755 and 0.762. It recorded a few ungolded relationships and one extra property, and with only 3 gold properties that one extra property costs a third of the precision. `PAPER_NOTES.md` already flags that domain's property dimension as fragile.
- Three replicates detect differences of about 0.1, as #182 planned, and nothing smaller.

## Cost and time

| | Value |
|---|---|
| These 15 runs | 33.64 USD: 19.80 for the 9 new runs, 13.84 for #187's six |
| Per run | 1.52 to 4.04 USD, mean 2.24 |
| Wall clock | 14 to 35 minutes; cap 120 |
| Turns to the wrap-up | 76 to 137 |
| Cached share of prompt tokens | 96 to 99% |
| The whole series on Azure | 76.48 USD: #182 42.84, #187 13.84, these 9 runs 19.80 |

The whole series is the work in `paired-stages/`, `default-change-187/` and `final-scores/`.

## What the series established

| Ticket | Question | Answer |
|---|---|---|
| #179 | Does a coverage sweep after the wrap-up raise recall? | **No** (+0.005 / +0.001). It surfaces the missing items, but the competency-question test declines them |
| #180 | Does a separate naming pass help? | **Yes at `high`**, mainly by turning the interviewer's wording into the expert's |
| #181 | Is `high` better than `medium` for the interview? | **No** with the old prompt. The owner made `high` the default anyway, together with #187 |
| #187 | Ask for the expert's term at confirmation time instead of in a separate stage | **Shipped.** At least as good as the old prompt plus the separate stage, at no extra cost |
| #188 | The interviewer accepted a mid-interview farewell | **Fixed.** 0 of 15 runs cut short since the fix: #187's 6 and the 9 new ones |
| #189 | Parser kept only the first line of each log entry | **Fixed.** The interviewer-first figures were corrected to 330 and 167 |
| This result | One score for the shipped configuration | **0.781** on the four published domains, **0.577** on the unpublished control, **0.740** over all five |

## What is left

**Open tickets.** Only two remain, and neither is an experiment that is waiting to run:

- **#172 [FUTURE]:** a guarded, label-only `specializes` for genuine kinds, scored without re-translation.
- **#184:** live verification of the Bedrock provider. It waits on the key.

**Limits to state in a paper.** These are properties of the setup, not open work:

- **One interviewer model** (`gpt-6-sol`). One simulated expert persona per domain, not human experts.
- **One unpublished domain.** It is also the largest, so leakage and size cannot be separated (reading 2).
- **Three replicates per domain**, which detect differences of about 0.1.
- **The recall ceiling is set by the scope rule** (reading 1). The data identify only one lever that would move recall: what counts as in scope. The owner decided on 2026-10-14 not to pull it.
- **No baselines on this model.** The earlier comparisons used other models and an earlier prompt, so `DESIGN.md` does not compare against them:
  - the one-shot, generic-interviewer and no-commit baselines (`tests/evals/results/baselines/`) ran on itops only, with `gpt-5.5`;
  - the earlier multi-domain runs used `gpt-5.4`.

  A paper claiming "the interview beats one-shot extraction" at this configuration would need those baselines re-run on `gpt-6-sol`. That is the one measurement a reviewer would likely ask for that this series does not provide.
