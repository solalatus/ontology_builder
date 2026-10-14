# Hybrid merge on a hold-out: pre-registered design (issue #174)

Committed before the hybrid was computed on any data, and before any merged
arm was computed on the hold-out. Results follow in a later commit; any
deviation is recorded in the report.

**Disclosure.** While checking that the hold-out is usable, the composite of
each single interview in it was computed (about 0.15–0.33). No union,
majority, hybrid or other merged arm has been computed on it.

## Where the idea came from

Phase 1 (`DESIGN.md`, `REPORT.md`): in the 30 phase-1 interviews, most
classes the 2-of-3 vote drops are correct (92% / 77%), while most
relationships found by a single interview are wrong (28% / 41%). Hence:
keep everything any interview found, but vote on relationships. Because the
idea came from those 30 interviews, they cannot test it; the hold-out can.

## The hybrid

Built with the same grouping and model construction as phase 1
(`tests/evals/lib/majorityVote.mjs`), with one change from **union**:

| Element | union | **hybrid** | majority |
|---|---|---|---|
| classes | ≥ 1 of 3 | ≥ 1 of 3 | ≥ 2 of 3 |
| properties | ≥ 1 | ≥ 1 | ≥ 2 |
| **relationships** | ≥ 1 | **≥ 2** | ≥ 2 |
| rules | ≥ 1 | ≥ 1 | ≥ 2 |
| actions | ≥ 1 | ≥ 1 | ≥ 2 |

So hybrid vs. union isolates exactly the relationship vote.

## Hold-out (untouched by phase 1)

All itops, scored against `ontology_translation/domains/itops/reference.domain.yaml`
with the same heuristic scoring as phase 1 (`scoreDoc`, equal to `rescoreRun`).
Eleven sets of independent interviews, each a "three interviews of the same
domain" case:

| Set | Interviews |
|---|---|
| `tests/evals/results/runs` (the paper's runs) | 3 |
| `baselines/competency-questions/control`, `/treatment` | 3, 3 |
| `baselines/competency-questions-gpt-5-mini/control`, `/treatment` | 3, 3 |
| `baselines/prompt-tuning-bundle/control`, `/treatment` | 5, 5 |
| `baselines/self-correcting-interviewer/control`, `/treatment` | 3, 3 |
| `baselines/b2-generic-interviewer` (trial-01..03) | 3 |

A set with five interviews contributes all 10 of its triples, averaged; every
set has equal weight.

**Excluded:** `b1-one-shot`, `b3-no-commit` and
`competency-questions-tainted-early-stop` (deliberately degraded, not
interviews in the normal sense); `post-normalization-v1`/`-v2` (LLM rewrites
of the paper's runs, not independent interviews);
`b2-generic-interviewer/trial-01-INVALID-dict-relationships-bug` (marked
invalid); `results/multi-domain-superseded-2026-08` (known to leak gold
identifiers into the interviews, which would favour keeping everything).

## Arms

Single-interview mean, union, **hybrid**, majority, intersection. No LLM
merge exists for the hold-out, so the cascade is not an arm here.

## Outcomes

**Primary:** mean composite over the 11 hold-out sets, hybrid vs. union and
hybrid vs. majority.

**Convincing** if the hybrid's mean beats both union and majority, **and** the
hybrid beats union in at least 9 of the 11 sets (a tie is not a win; 9 of 11
is a one-sided sign test at p ≈ 0.03).

**Secondary:**
- relationship precision and recall, hybrid vs. union, on the hold-out
- the hybrid's review load: relationship groups found by one interview, plus
  relationship conflicts
- the same arms on the 30 phase-1 interviews (both eras, 5 domains), next to
  the LLM cascade, **labelled as the data that suggested the idea**

## Caveats (to be repeated in the report)

- One domain, older prompts, low-recall interviews: a different regime from
  the current multi-domain runs.
- Heuristic scoring only; the semantic judge is phase 2 of #174.
- A fully clean test would use fresh multi-domain interviews (new runs).
