# Paired stages: analysis (issue #182)

These are the readings of `REPORT.md`, which holds the generated tables. The design and pass criteria are in `DESIGN.md`, including Amendment 1, which changed the sweep to ask open questions. There are 12 clean runs: fibo-loans and brick-hvac, 3 replicates each, at explicit `medium` (block 1) and explicit `high` (block 2), on `gpt-6-sol`. All of them ended `stages_complete`, none hit a cap, and none were degraded. The offline rescore reproduced every snapshot.

## Cost and operations

| | Measured | #182's estimate |
|---|---|---|
| Whole protocol | 42.84 USD (36.68 for the 12 runs, 6.16 for the two superseded sweep-v1 runs) | 150 to 200 USD |
| Per run | 2.82 USD at `medium`, 3.29 at `high` | — |
| Cached share | 96 to 99% of prompt tokens | — |
| Wall clock | 26 min at `medium`, 28 at `high` (cap 120) | — |
| Reasoning tokens per run | 13k at `medium`, 29k at `high` | — |

Per-stage cost, averaged per run:

| Stage | Cost USD | Time |
|---|---|---|
| Interview | 1.3 to 2.0 | 13 to 19 min |
| Coverage sweep | 0.26 to 0.37 | 2 to 3 min |
| Naming pass | 0.77 to 0.93 | 5 to 7 min |

Transient 429s were retried, at peaks of roughly 400k TPM, so running the jobs one at a time was right.

## #179, coverage sweep: not met (both blocks)

B − A composite, mean of both domains: +0.005 at `medium` and +0.001 at `high`, against the +0.05 required. 10 of the 12 sweeps added nothing to the model.

- **The sweep does what #179 asked; it surfaces.** With the open-question text (Amendment 1), each sweep surfaced 8 to 31 candidates, many of them gold items #179 names: credit enhancement agreement and beneficiary, accrued interest, anticipated number of payments, outstanding amounts, air plenum, humidifier, pumps, cooling tower. Per-item attribution shows gold classes moving from *never mentioned* to *mentioned, not committed* between A and B, for example fibo-loans `medium` run-02: 16 → 7 never mentioned.
- **The inclusion test then declines them.** The interviewer rejected almost every candidate as "not needed for the recorded competency questions or actions". The two additions (brick-hvac `medium` run-03: 5 items, +0.032; `high` run-02: 1 item, +0.007) were properties or relationships, never classes.
- **Conclusion.** The residual class recall is gated by the scope of the competency questions, not by nobody asking. Without relaxing the inclusion test, which the owner rejected on 2026-10-14, a post-wrap-up sweep cannot move the composite. Class precision at B is also below 0.95 at `high` (0.937 / 0.960), but that is a property of snapshot A, which B equals.

## #180, naming pass: not met at `medium`, met at `high`; the floors hold in both

Promotion into the shipped prompt, with a non-regression run, is #187 (owner's decision, 2026-10-20).

| | fibo-loans | brick-hvac |
|---|---|---|
| C − B composite, `medium` | +0.031 | +0.163 |
| C − B composite, `high` | +0.097 | +0.170 |
| C − B relationship F1, `medium` | +0.061 | +0.306 |
| C − B relationship F1, `high` | +0.196 | +0.314 |
| C − B relationship precision, `medium` | +0.072 | +0.384 |
| C − B relationship precision, `high` | +0.215 | +0.349 |

- **The pre-registered test.** Relationship or property F1 must rise by more than the replicate stdev at B, on both domains.
  - Block 1 fails on fibo-loans: relationship F1 rose +0.061 against a stdev of 0.081.
  - Block 2 passes on both domains.
  - The no-regression floors (composite and practical scope not down) hold in every cell.
- **Mechanism.** The naming pass mostly converts wording the semantic judge already accepted into names the heuristic scorer also accepts. On brick-hvac `high` run-01, all 19 relationships the judge matched at A matched heuristically at C, and the judge had nothing left to add. The semantic composite rises much less than the heuristic: C − A is +0.015 to +0.061.
- **Conclusion.** The pass mainly closes the heuristic-to-semantic gap, as #180 predicted. It also adds precision: class precision reaches 1.000 at C in every cell.
- **Cost.** About 0.85 USD and 6 minutes per run.
- **Direction.** Relationships were redirected only 4 times in 12 runs. The persona almost always kept the recorded direction.

## #181, `high` vs `medium`: not met; explicit `medium` stays

Snapshot-A composite, `high` minus `medium`:

| Domain | Difference | `medium` replicate stdev |
|---|---|---|
| fibo-loans | −0.050 | 0.108 |
| brick-hvac | +0.010 | 0.051 |

`high` costs about 17% more per run and uses 2.2 times the reasoning tokens. The result does not depend on the anomaly below: without that run, brick-hvac becomes +0.062, which exceeds its stdev, but fibo-loans is still −0.050, so "on both domains" still fails.

## Anomaly: one truncated interview

Block 2's brick-hvac run-03 ended its interview in Phase 3. At turn 43 the persona said "That's a fair place to leave it" and then "Take care". The interviewer accepted a "known-incomplete first pass": no properties, rules or actions were captured. The classifier read the sign-off as a wrap-up.

- **How it is counted.** No cap was hit, so under the pre-registered rules the run counts, and it is averaged in above.
- **Effect.** Excluding it changes no pass/fail verdict.
- **Ticket: #188.** The `high` interviewer accepted the persona's mid-interview stop instead of offering to continue the remaining phases. Neither the persona wrapper nor the interviewer prompt is meant to allow that.

## Other notes

- **Judge noise.** Re-judging an identical model (B = A) moved the semantic composite by up to 0.011. Semantic differences smaller than that are noise.
- **Replicate spread.** Snapshot-A composite ranges 0.53 to 0.74 within fibo-loans `medium`. Three replicates per cell detect effects of about +0.1, as #182 planned, and nothing smaller.
- **Parser bug (fixed in #189).** `reportGenerator.mjs`'s `parseConversationLog` kept only the first line of each multi-line entry. The attribution here always used full text, first through its own parser and since #189 through the fixed shared one, so these numbers are unaffected. The fix reversed two earlier figures: the interviewer-first identifier counts, 330 and 167, not 31 and 10. Since 2026-10-20 the expert's plain-words mentions also count, which gives 80 and 32; see `multi-domain-control/README.md`.
