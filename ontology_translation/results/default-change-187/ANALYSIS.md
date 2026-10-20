# Default change #187: analysis

The generated tables are in `REPORT.md`, and the pre-registration is in `DESIGN.md`. The treatment is 6 runs (fibo-loans and brick-hvac, 3 each) of the shipped app after #187 and #188:

- the naming question asked at confirmation time, with the rename tool;
- the rule against stopping mid-interview;
- default effort `high`.

The control is #182's block 1 snapshot A: the old prompt at explicit `medium`. All 6 runs ended `stages_complete` on a genuine wrap-up, at effort `high`, inside every cap.

## Criteria

| Criterion | Verdict |
|---|---|
| 1. Non-regression | **Met.** fibo-loans composite 0.680 vs 0.655 ± 0.108 (practical 0.583 vs 0.561); brick-hvac 0.811 vs 0.509 ± 0.051 (practical 0.616 vs 0.469) |
| 2. The naming gain carries into the prompt, both domains | **Not met on fibo-loans, met on brick-hvac.** fibo-loans relationship F1 +0.054 against a control stdev of 0.081, property F1 −0.001, relationship precision +0.061. brick-hvac relationship F1 +0.381, property F1 +0.360, relationship precision +0.326 |
| 3. No interview cut short (#188) | **Met.** 6/6 genuine wrap-ups, 0 `interview_ended_incomplete` |
| 4. Default `high` ran, inside the caps | **Met** |

**The owner's decision, 2026-10-20.** Criterion 2 fails on fibo-loans. The owner decided to merge and close #187 with that stated: the naming gain is clear on brick-hvac, within noise on fibo-loans, and not regressed anywhere.

## Readings

- **One interview now matches or beats the old two-stage result.** brick-hvac reaches 0.811, above #182's old prompt plus the separate naming stage (block 1 C: 0.683). fibo-loans reaches 0.680, level with it (0.686). The naming stage cost about 0.85 USD and 6 minutes per run on top of the interview. Asked at confirmation time, the naming costs nothing extra: runs average 2.31 USD and 20 minutes, against 2.82 USD and 26 minutes for #182's block 1 runs with all their stages.
- **Replicate spread is much smaller.** fibo-loans composite ±0.016, against ±0.108 for the control; brick-hvac ±0.096, against ±0.051. fibo-loans was the domain whose noisy control made criterion 2 fail.
- **Two factors changed together.** This arm changes the prompt and the effort at once, by design (`DESIGN.md`), so it cannot attribute the gain to one or the other. The context column helps: the old prompt at `high` (#182 block 2 A) scores 0.605 on fibo-loans and 0.520 on brick-hvac, no better than the old prompt at `medium`. So the gain here comes mostly from the prompt change rather than from `high`.
- **Where brick-hvac's gain comes from.**
  - Class recall rose from 0.607 to 0.846.
  - Property F1 rose from 0.479 to 0.839, with property precision at 0.990.
  - Allowed-value lists rose from 9.7 to 16.0 per run.
  - The #188 stopping rule should keep the interviewer going through the later phases. Rules F1 stays low, as before.
- **Semantic and heuristic scores now nearly agree** (fibo-loans 0.687 vs 0.680). The judge finds little left to rescue, because the names on the canvas are the expert's.
