# Contamination-free control arm (issue #137, follow-up to #133/#136)

This directory holds the `itops` domain run **3 times** under the exact same
configuration as `ontology_translation/results/multi-domain/` (same
interviewer model/deployment, same interviewer/wrapper prompts -- verified
via matching `interviewerPromptSha256`/`wrapperSha256` in `provenance.json`
across both directories -- same runner, same scorer, same replicate count),
kept in a **separate, sibling directory** deliberately (issue #137's own
suggested design) rather than mixed into `multi-domain/`'s own 4-domain
macro statistics.

## Why a separate domain, and why a separate directory

`itops`'s ground truth (`ontology_translation/domains/itops/reference.domain.yaml`)
is a mechanical conversion of `tests/evals/fixtures/itops_mtsr.yaml` -- a
hand-authored fictional Hungarian bank's IT-operations domain, published
nowhere. Unlike the four domains in `multi-domain/` (Brick, IOF Maintenance,
IOF Supply Chain, FIBO Loans -- all translated from real, published
industry ontologies), the interviewer model cannot have been pretrained on
this specific vocabulary. #133's Finding A named exactly this channel as an
out-of-scope caveat on its own leak audit: the interviewer's own prior
knowledge of a published source ontology could inflate recovery scores in a
way no persona-side leak guard can catch or correct, because the interviewer
is never shown the persona's ground truth at all -- it would be reciting its
own training data, not eliciting anything.

Kept in its own directory rather than folded into `multi-domain/`'s 4-domain
macro statistics because `itops` is structurally different in a way that
would corrupt an apples-to-apples comparison if averaged in alongside the
translated domains: see "The domain-size confound" below.

## Persona choice

Uses the converted `persona.md` (not the richer, hand-authored
`tests/evals/fixtures/persona-eszter.md` the frozen itops replication runs
in `tests/evals/results/runs/` use) -- for configuration parity with the
other four domains in `multi-domain/`, all of which use their own converted
`persona.md`. This is a real, deliberate deviation from the frozen
replications' own configuration; see `tests/evals/results/runs/README.md`'s
"Synthetic-control role" section for that separate, non-comparable control.

## Results

`run-01` originally hit the default 45-minute wall-clock cap at 127 turns
while still doing real, specific modeling work (not a stall -- see
"Provenance / reproducibility" below), so it was re-run once with
`ONTOLOGY_EVAL_WALLCLOCK_MINUTES=90`/`ONTOLOGY_EVAL_MAX_TURNS=280` (`--force`)
to let it reach a natural stopping point rather than an artificial one. The
numbers below are from that completed run. This alone closed roughly
4.3 points of the composite gap (see "The domain-size confound" below) --
direct, measured confirmation that the original budget was part of the
story, not just a hypothesis.

| Dimension | itops (this control arm) | 4 published-ontology domains (`multi-domain/`) | Delta |
|---|---|---|---|
| Classes (full) | 67.3% | 68.3% | -1.0 pt |
| Relationships (full) | 48.2% | 57.3% | -9.1 pt |
| Properties (full) | 58.7% | 64.6% | -5.9 pt |
| Composite recovery effectiveness (full) | 58.1% | 63.4% | -5.3 pt |
| Rules | 61.3% | 66.0% | -4.7 pt |
| Actions (identification) | 81.0% | 87.6% | -6.6 pt |

Every dimension is now modestly negative (before the `run-01` re-run, rules
was anomalously +8.2 pt above the published domains -- an artifact of the
truncated run, not a real effect) -- a materially more coherent signal:
consistently somewhat harder across the board, not a mixed picture.

Interviewer-first raw identifier introductions (the channel this control
arm exists to measure -- see `tests/evals/lib/interviewerPriorKnowledge.mjs`),
computed with the same tool re-run against both directories:

| Arm | Total interviewer-first | Per-run range | Matched (scored) | Persona-first (leak audit) |
|---|---|---|---|---|
| itops (3 runs, this control arm) | 10 | 0-7 | 9 (90%) | 0 |
| 4 published domains (12 runs) | 31 | 0-8 | 31 (100%) | 0 |

**The interviewer-first counts do NOT show a stark separation.** itops's
per-run range (0-7) sits inside the published domains' own range (0-8), not
an order of magnitude below it. This directly revises PR #136's own ad hoc
figures for the published-domain side (330 total, range 4-46/run) -- no
script for that computation was ever committed anywhere in this repo's
history (confirmed via `git log --all --grep="interviewer-first"`), so it
was unreproducible; `tests/evals/interviewer-prior-knowledge-report.mjs` is
now the first actually-runnable, tested implementation of this measurement,
and re-running it against the same 12 published-domain transcripts produces
31, not 330. See `ontology_translation/TODO.md`'s dated entry for the full
correction and the reasoning that ruled out several benign explanations for
the gap without fully resolving it.

## The domain-size confound

itops has **321** total ground-truth elements (68 classes, 111 properties,
120 relationships, 11 rules, 11 actions) -- more than double the largest
published domain (fibo-loans, 149) and up to 6x the smallest
(iof-maintenance, 50). Confirmed directly, not just inferred: `run-01`
originally hit the default 45-minute wall-clock limit at 127 turns while
still doing real, specific modeling work (visible in its own
`conversation-log.md`), and re-running it with a 90-minute budget let it
reach a natural stop at 111 turns -- and closed roughly 4.3 of the
composite gap's original 9.6 points on its own (see "Results" above). Mean
turns-used for itops (92.7) is 1.4-2.1x every published domain's own mean
(44.3-66.0), and mean total tokens (22.2M) is roughly 3.3-5.6x theirs
(4.0-6.7M) -- itops is not just larger on paper, it measurably costs more
interview budget to cover at the same thoroughness.

**What this means for the remaining composite-score gap (-5.3 pt)**: even
after removing the clearest budget artifact, it cannot be confidently
attributed mainly to pretraining contamination inflating the
published-ontology domains' scores, because domain size and pretraining-
familiarity are still confounded in this single-arm design -- itops is
simultaneously the only contamination-free domain in this comparison AND
by far the largest one, and even a 90-minute budget may not be fully
sufficient for a 321-element domain (`run-01` still listed real open items
at its own natural stopping point, not "nothing left to do"). A residual
domain-size effect and a pretraining-contamination effect would produce the
same directional result here (itops scoring lower), and this arm alone
cannot fully separate them. The interviewer-first counts above argue
mildly against pretraining being the dominant remaining effect (no stark
separation from the published domains), which leaves domain size/density as
the more likely primary driver of what's left, but this is a read of the
evidence, not a proof -- a same-size-and-structure comparison is needed to
actually isolate the variable.

**The right follow-up, not taken in this pass**: issue #137's own suggested
"optional second arm" -- a mechanically obfuscated (renamed) copy of one
translated domain, holding structure/size/meanings/competency-questions
fixed while replacing every identifier and natural-language label with
synthetic-but-natural vocabulary the interviewer could not have memorized.
That design holds domain size constant and isolates the pretraining
variable directly, which this single-domain control arm cannot do on its
own. Deliberately not attempted in this pass: a rushed mechanical renaming
that produces incoherent or unnatural prose would compromise the interview
itself (and this benchmark's own scorer, which is label/meaning-sensitive)
in ways that could produce a misleading result of its own -- worse than
leaving the comparison honestly confounded and naming the confound plainly,
which is what this document does.

## Provenance / reproducibility

- `smoke-01` (a single-replicate cost-gating smoke run, per this project's
  own established practice before a live multi-replicate spend) completed
  clean (`degraded: false`, `stoppedReason: "app_agent_appears_finished"`,
  55 turns, `leakEventsCount: 0`) and was deleted afterward -- not one of
  the three reported replicates.
- `run-01`: first attempt hit `wallclock_timeout` at 127 turns (45-minute
  default budget) while genuinely still working -- re-run once with
  `ONTOLOGY_EVAL_WALLCLOCK_MINUTES=90 ONTOLOGY_EVAL_MAX_TURNS=280 --force`,
  reaching a natural `app_agent_appears_finished` stop at 111 turns,
  `degraded: false`, `leakEventsCount: 0`, `maxConsecutiveTurnsWithNoToolActivity: 8`.
  Same `interviewerPromptSha256`/`wrapperSha256` as the first attempt and
  every run in `multi-domain/` -- raising the turn/wall-clock budget does
  not change the prompts or model, only how long the run is allowed to run.
  The reported figures throughout this document are from this completed
  re-run, not the truncated first attempt.
- `run-02`: `pleasantry_loop_detected`, 91 turns, `degraded: false`,
  `leakEventsCount: 0` -- verified against its own transcript: turns 89-91
  are pure "Take care" / "You too" / "Thank you" after an explicit,
  substantive stopping point at turn 88 ("this is a good first cut... a
  good stopping place"). A genuine correct catch, the same shape as
  `iof-supply-chain/run-02` in `multi-domain/`.
- `run-03`: `app_agent_appears_finished`, 76 turns, `degraded: false`,
  `leakEventsCount: 0` -- clean finish with a substantive, specific
  close-out (open items named explicitly, not a vague wrap-up).

All three runs used `model: "gpt-5.4"` with `interviewerPromptSha256` and
`wrapperSha256` identical to every run in `multi-domain/` -- true
configuration parity, verifiable directly from each run's own
`provenance.json`, not just asserted here.
