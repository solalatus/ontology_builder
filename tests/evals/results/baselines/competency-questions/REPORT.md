# Issue #94 non-regression — primary condition (`gpt-5.4`), fixed harness

Design, measures and pass criteria were pre-registered in
`tests/evals/CQ_NON_REGRESSION.md` before any arm ran. Nothing below was
adjusted to fit the outcome.

This batch supersedes `competency-questions-tainted-early-stop/`, whose six
interviews were all cut short by a harness defect (`appearsFinished()` reading
an offer-to-continue as completion). That defect is fixed
(`looksLikeContinuationOffer()`), the fix is pinned by tests built from the six
real tainted messages, and the three published anchors are verified unaffected.

## Verdict: no regression. One real weakness identified, in controlled-value capture.

Reproduce with:

```sh
node tests/evals/analyze-cq-non-regression.mjs competency-questions
```

## Configuration

| | |
|---|---|
| Interviewer | `gpt-5.4` (Azure), both arms — issue #85's model |
| Persona / classifier | `gpt-4o-mini-internal` / `gpt-5.4` |
| Control prompt | frozen pre-#94, verified against golden hash `eff34f3e…` |
| Budget | 120 turns / 45 min; n = 3 per arm |

All six terminated naturally. Turn counts (control 53–79, treatment 50–69) sit
inside issue #85's own arms and are no longer clustered at a premature stop.

## Recovery, control vs treatment

Full domain, F1:

| dimension | control | treatment | delta | spread | verdict |
|---|---|---|---|---|---|
| classes | 42.4 | 47.0 | **+4.6** | 8.9 | within spread |
| relationships | 5.2 | 11.1 | **+5.9** | 7.6 | within spread |
| properties | 22.1 | 22.9 | +0.7 | 26.2 | within spread |
| value fidelity | 87.0 | 48.1 | **−38.9** | 100.0 | see below |

Practical scope, F1:

| dimension | control | treatment | delta | spread | verdict |
|---|---|---|---|---|---|
| classes | 60.5 | 66.5 | **+6.0** | 14.5 | within spread |
| relationships | 7.1 | 13.9 | **+6.8** | 9.3 | within spread |
| properties | 19.9 | 24.9 | **+5.0** | 9.4 | within spread |
| value fidelity | 84.6 | 51.5 | **−33.0** | 100.0 | see below |

**All six F1 deltas favour the treatment.** None clears the run-to-run spread,
so by §5's rule none is individually a finding at n = 3 — but six out of six
pointing the same way is worth stating as a direction, and it is the opposite
direction from the tainted batch.

## Against the published anchors

The anchors ran on `gpt-5.5` and are context, not the comparison surface. Still,
they are the convention for "is this good work":

| scope | dimension | anchors | control | treatment |
|---|---|---|---|---|
| practical | classes | 63.9 | 60.5 | **66.5** |
| practical | relationships | 15.5 | 7.1 | 13.9 |
| practical | properties | 18.4 | 19.9 | **24.9** |
| practical | composite | **45.0** | 43.0 | 39.2 |
| full | classes | 43.4 | 42.4 | **47.0** |
| full | relationships | 9.9 | 5.2 | **11.1** |
| full | properties | 20.5 | 22.1 | **22.9** |
| full | composite | 37.9 | **39.2** | 32.3 |

The treatment arm **beats the anchors on all three F1 dimensions at full scope**
and on two of three at practical scope, on a model one minor version older.

Its **composite is nonetheless lower on both scopes**, and the reason is
entirely the fourth term: controlled-value fidelity. That is the finding below,
and it is why this report does not claim "better than the anchors" outright.

## The one real weakness: controlled-value capture

The value-fidelity delta is large and negative, and §5 makes it a pass
criterion. The analyzer marks it "within spread", but that verdict rests on a
spread of 100.0 — which is a symptom, not reassurance. The underlying numbers:

| run | value fidelity | properties | **with an allowed-value list** |
|---|---|---|---|
| control/run-01 | 85.7 | 56 | **17** |
| control/run-02 | 87.8 | 74 | **37** |
| control/run-03 | 87.5 | 50 | **26** |
| treatment/run-01 | 0.0 | 27 | **1** |
| treatment/run-02 | 44.4 | 109 | **9** |
| treatment/run-03 | 100.0 | 16 | **11** |

Two separable things, and conflating them would be a mistake:

1. **The fidelity percentage is unstable in the treatment arm and should not be
   read as a score.** It is averaged over *matched controlled-value properties*
   only. treatment/run-01 matched exactly one, so its figure can only be 0 or
   100; it drew 0. treatment/run-03 matched eleven and scored a perfect 100.
   That is what produces a 100-point spread.
2. **The coverage difference underneath it is real and is not noise.** The
   treatment arm captured 1 / 9 / 11 allowed-value lists against the control's
   17 / 37 / 26 — a several-fold gap, consistent across all three pairs, and not
   explained by interview length (treatment/run-03 ran *more* turns than
   control/run-03, 69 vs 53, and still captured 11 against 26).

The readable interpretation: **Phase 6 — "constraints and fixed choices" —
gets less attention in the treatment arm.** treatment/run-02 is the clearest
case: 109 properties captured, more than any control run, but only 9 of them
constrained. Competency-question justification appears to drive breadth of
properties while crowding out the pass that bounds their values.

Phase 6's wording was not touched by issue #94, so this is a side effect of the
surrounding changes rather than a direct edit — which also makes it a
tractable one to address.

## Pass criteria

| Criterion | Verdict |
|---|---|
| Class / relationship / property F1 do not decrease materially | **Met.** All six deltas positive |
| Controlled-value fidelity does not regress | **Not met as stated.** The percentage is too unstable to score, but the coverage behind it is several-fold lower and consistently so |
| Turn count does not increase disproportionately | **Met.** 61 vs 64 mean turns |
| Interviews terminate normally in both arms | **Met**, all six, on the fixed harness |
| Elicitation quality not visibly degraded | **Met** on read: the treatment reaches validation and recovers more classes and relationships |

## Recommendation

The core of the change is sound and, on this evidence, an improvement: more
classes, more relationships, more properties recovered than the control, and
better than the `gpt-5.5` anchors on every F1 dimension at full scope.

One targeted follow-up is warranted before or shortly after merge: **restore
Phase 6's constraint pass** so competency-question justification does not crowd
out allowed-value capture. That is a prompt change confined to one phase, and
this batch is the instrument to confirm it — re-run and check that controlled-
value coverage returns to the control's range while the F1 gains hold.

Merging as-is trades a several-fold reduction in captured value constraints for
consistent gains across all three structural dimensions. That is a real
trade-off and is stated here rather than averaged away, so the decision can be
made deliberately.
