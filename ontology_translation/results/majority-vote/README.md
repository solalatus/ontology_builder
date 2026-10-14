# Combining several interviews: what was tried, and what is a dead end (issue #174)

Question: with three interviews of the same domain and no gold standard, how
do you combine them for the best final F1? Everything here is offline on
committed interviews (no API calls, no new runs) and scored with the same
heuristic scorer as the published benchmark.

## Results

| Experiment | Pre-registered in | Report | Verdict |
|---|---|---|---|
| Majority vote (keep what ≥ 2 of 3 found) vs. the LLM cascade | [`DESIGN.md`](DESIGN.md) | [`REPORT.md`](REPORT.md) | **Dead end.** Beats merge(1,2,3) in one era only (0.692 vs 0.665; 0.663 vs 0.698), below merge(1,2) in both. |
| Hybrid (union, but relationships need ≥ 2 of 3), on a hold-out of 10 untouched itops sets | [`HYBRID-DESIGN.md`](HYBRID-DESIGN.md) | [`hybrid/REPORT.md`](hybrid/REPORT.md) | **Dead end.** 0.272 vs union 0.290; beat union in 0 of 10 sets. |
| Collapsing relationships that link the same two classes in a union | not run | below | **Dead end, by estimate.** At most about +0.01–0.02 composite. |
| LLM-based re-scoring (phase 2 of #174) | issue #174 | — | **Not pursued.** A measurement, not an improvement: it cannot raise F1. |

## What held up

- **Any union of interviews beats a single interview.** Hold-out: 0.220 → 0.290.
  Phase-1 runs: +0.037 (current prompt) and +0.095 (pre-#152) for the union of
  all three.
- **A deterministic union equals the LLM merge** on the same two interviews
  (+0.001, +0.002), and a union of all three beats the LLM three-way cascade
  in both eras (+0.026, +0.040). Heuristic scoring only: it matches wording,
  and the union keeps the interviews' wording.
- **The published two-way gain depends on the pair.** The cascade only merged
  runs 1 and 2, which in the current era is the best of the three pairs
  (0.742 vs 0.669 and 0.665). An average pair gains +0.038 over a single
  interview, not +0.088.
- **Voting discards real classes.** A class only one interview found is
  usually correct (92% / 77% of the classes the vote dropped matched gold);
  interviews are recall-limited. Relationships are the opposite (28% / 41% of
  single-interview relationships correct).
- **The consistency checker cannot pick the better pair without gold** (no
  better than chance).

## The relationship-collapsing estimate

Checked structurally on the committed union models, no gold scoring:

| | relationships | distinct class pairs | extra relationships on an already-linked pair |
|---|---:|---:|---:|
| union of 3, current prompt | 284 | 239 | 45 (16%) |
| union of 3, pre-#152 prompt | 201 | 181 | 20 (10%) |
| gold models | 230 | 215 | 15 (7%) |

About 125 of the current union's 284 relationships are scored wrong
(precision 0.56). Collapsing can only touch the 45 that repeat an
already-linked pair, some of which are legitimate (gold has 7% such). Ceiling
about +0.02 composite, realistically about +0.01: not worth pursuing.

## Why phase 2 was not run

Phase 2 re-scores existing models with an LLM judge. It changes the ruler,
not the models, so it cannot improve final F1; its only use would be choosing
between a union and an LLM merge, which tie today and where an LLM is not a
constraint.

## Where final F1 actually is

Class precision is already about 0.97; the gap is **recall at interview
time**, which no way of combining finished interviews can fix. The one
untested idea for combining is pruning the union's unsupported relationships
with an LLM check against the interview transcripts they came from (a few
dollars, no new interviews); recorded here, not opened as a ticket.
