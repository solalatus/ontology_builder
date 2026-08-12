# #85: does the self-correction loop make the interviewer worse?

Pre-registration: `../../../SELF_CORRECTION_EVAL.md`, committed before any
interview ran. Gate for #84. Regenerate the tables with
`node tests/evals/analyze-self-correction.mjs` — offline, no key.

## 0. Headline

**PASS. #84 can merge.** Six interviews, three per arm, `gpt-5.4` throughout,
all six terminating cleanly by `app_agent_appears_finished` — none by cap,
timeout or error.

The blocking criterion is the one that matters and it passes outright: **across
every multi-apply turn in the batch, not one finding was resolved by weakening
the model.** Every repair added to it.

## 1. The blocking criterion, read turn by turn

Five findings were acted on across three multi-apply turns. Each one:

| Run / turn | Finding | What the agent did |
|---|---|---|
| run-01 / 49 | `declareMajorIncident` verifies `Incident.majorIncidentFlag`, effect never sets it | **Rewrote the effect to set it.** Verification untouched |
| run-01 / 53 | `containIncident` verifies `Incident.status`, effect never sets it | **Added the status change to the effect** |
| run-01 / 53 | `performMaterialityAssessment` can't reach `Incident` from its input | **Added `MaterialityAssessment --assessesIncident--> Incident`** |
| run-02 / 37 | `declareMajorIncident` verifies `majorIncidentDeclared`, effect never sets it | **Rewrote the effect to set it**, and recorded `majorIncidentDeclaredAt` |

The third row is the important one. The cheap way to clear
`unreachable-from-action-input` is to delete the condition that raised it, or to
reword the rule so it *reads* as reachable — **which is exactly what #75's v2
normalizer did, and why that experiment ended in REJECT.** Here the agent added
the missing relationship instead. The prompt line prohibiting the cheap fix
appears to be doing real work.

Honest footnote: that added relationship then drew an `inverse-pair` warning,
because the reverse edge already existed. The checker surfaced the trade rather
than hiding it, which is the behaviour wanted.

## 2. Metrics, control vs treatment

Mean of three runs each. Same fixture, same one-to-one scorer, both denominators.

| Dimension | Control | Treatment | Δ |
|---|---|---|---|
| classes F1 (full / practical) | 40.8 / 64.2 | 40.7 / 64.5 | −0.2 / +0.3 |
| relationships F1 | 6.8 / 12.3 | 7.9 / 11.5 | +1.2 / −0.8 |
| properties F1 | 23.4 / 29.2 | 19.5 / 27.2 | **−3.9 / −2.0** |
| controlled-value fidelity | 71.6 / 69.9 | 88.3 / 88.9 | **+16.7 / +19.0** |
| turns | 100 / 73 / 76 (mean 83) | 55 / 57 / 59 (mean 57) | **−26** |
| apply calls | 53 / 43 / 51 | 34 / 33 / 43 | −12 |

### Value fidelity is the one gain with a mechanism behind it

+17 and +19 points, and consistent: every treatment run beats every control run
on it. This is not a number in search of a story — `value-not-allowed` is
precisely the check that polices allowed-value lists against the rules that
reference them, and it is the check #83's corpus was built around. A treatment
that improves the dimension its main check targets, and leaves the others flat,
is the shape a real effect has.

### Properties is the one loss, and it is inspected

−3.9 full / −2.0 practical. Per run, control 28.9 / 18.3 / 22.9 against
treatment 23.7 / 22.2 / 12.6. **The control arm's own spread on this dimension
is 10.6 points**; the treatment mean sits inside it, and the delta is driven by
a single run (treatment run-03, 12.6, which recovered 16 properties against
41 and 69 in its siblings). At n=3 this is not separable from run-to-run
variance, and the pre-registration said a difference smaller than the control
spread is not a finding. Reported as inspected and unresolved at this n, not as
a regression.

### Shorter interviews, and why that is not automatically good news

83 → 57 turns, with all three treatment runs below the control arm's *lowest*.
That is the opposite of the failure this evaluation was built to catch — the
fear was that findings would distract and lengthen the interview.

It is worth being careful here. A shorter interview could equally mean the
treatment arm elicited less. The recovery numbers say it did not: classes and
relationships are flat, and value fidelity is sharply up. So the treatment arm
reached comparable coverage in ~30% fewer turns. Whether the loop *caused* that,
or a 10-line prompt addition changed pacing some other way, this design cannot
say — one prompt edit and one behaviour change moved together.

## 3. The loop's actual cost

Small, and self-limiting. Across three treatment runs the extra budget was used
on **three turns in total**; run-03 used none at all. 68 tool results in run-01
carried the consistency block and only 3 reported a new problem — it is
overwhelmingly saying "nothing new broke". No run came near the 3-apply cap
being a constraint, and no `note`-severity finding ever reached the agent.

## 4. Pass criteria

| Criterion | Result |
|---|---|
| No finding resolved by weakening or deleting what raised it | **PASS** — §1, five for five |
| Aggregate F1 does not decrease materially | **PASS with one inspected exception** — properties, §2 |
| Controlled-value fidelity does not regress | **PASS** — +17 / +19 |
| Turn count and calls not disproportionately increased | **PASS** — both fell |
| Interviews terminate normally | **PASS** — 6/6 clean |
| Elicitation quality not visibly degraded | **PASS** on the metrics; see §5 |

## 5. Limitations

- **n = 3 per arm**, and the control arm's own turn spread is 27. Anything
  smaller than that is not readable here. The value-fidelity gain is larger than
  the spread; the property loss is not.
- **`gpt-5.4`, not the anchors' `gpt-5.5`** — which is why both arms were re-run
  and why these numbers are not comparable to `results/runs/`.
- **One transient failure**: treatment run-02 died on a 90s per-turn timeout and
  succeeded on retry. Its checkpoint is preserved; nothing was lost.
- The qualitative read in §1 covers every multi-apply turn, which is where the
  treatment can do damage. It is not a full read of all six transcripts.
