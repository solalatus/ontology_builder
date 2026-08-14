# Issue #94 non-regression — primary condition (`gpt-5.4`)

Design, measures and pass criteria were pre-registered in
`tests/evals/CQ_NON_REGRESSION.md` before these arms ran. Nothing below was
adjusted to fit the outcome.

## Verdict: FAIL. The interviewer prompt change does not merge as written.

Two dimensions decrease by more than the run-to-run spread, and both are core
recovery measures. Per §5, that is a fail, and the change owes a fallback.

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
| Treatment prompt | shipped #94 |
| Budget | 120 turns / 45 min |
| n | 3 per arm, six interviews |

All six terminated naturally (`app_agent_appears_finished`); none is excluded by
§5's truncation rule. Turn counts land inside issue #85's own arms (control
73–100 there, 61–91 here; treatment 55–59 there, 49–59 here), so this batch is
readable against the established work.

## Recovery, control vs treatment

Full domain, F1:

| dimension | control (r1/r2/r3) | mean | treatment (r1/r2/r3) | mean | delta |
|---|---|---|---|---|---|
| classes | 53.5 / 47.8 / 50.5 | 50.6 | 45.5 / 40.0 / 43.7 | 43.0 | **−7.6** |
| relationships | 7.1 / 2.9 / 4.9 | 4.9 | 10.4 / 5.8 / 4.6 | 6.9 | +2.0 |
| properties | 26.0 / 24.2 / 20.7 | 23.6 | 15.7 / 18.0 / 10.8 | 14.8 | **−8.8** |
| value fidelity | 67.3 / 90.0 / 28.6 | 62.0 | 87.5 / 88.9 / 85.7 | 87.4 | +25.4 |

Practical scope, F1:

| dimension | control (r1/r2/r3) | mean | treatment (r1/r2/r3) | mean | delta |
|---|---|---|---|---|---|
| classes | 68.9 / 53.8 / 65.5 | 62.7 | 66.7 / 52.0 / 51.1 | 56.6 | −6.1 |
| relationships | 9.7 / 2.7 / 6.2 | 6.2 | 14.7 / 8.6 / 3.2 | 8.8 | +2.6 |
| properties | 16.3 / 34.4 / 20.2 | 23.6 | 32.7 / 17.1 / 22.2 | 24.0 | +0.4 |
| value fidelity | 67.3 / 100.0 / 40.0 | 69.1 | 85.7 / 85.7 / 80.0 | 83.8 | +14.7 |

## What survives the n = 3 rule

| scope | dimension | \|delta\| | widest spread | verdict |
|---|---|---|---|---|
| full | **classes** | **7.6** | **5.6** | **larger than spread — treatment worse** |
| full | relationships | 2.0 | 5.8 | within spread |
| full | **properties** | **8.8** | **7.2** | **larger than spread — treatment worse** |
| full | value fidelity | 25.4 | 61.4 | within spread |
| practical | classes | 6.1 | 15.6 | within spread |
| practical | relationships | 2.6 | 11.5 | within spread |
| practical | properties | 0.4 | 18.1 | within spread |
| practical | value fidelity | 14.7 | 60.0 | within spread |

## Mechanism — inspected item by item, as §5 requires

The treatment arm recovers **less of everything**, and the cause is visible in
the raw counts rather than in any single scoring artifact:

| | classes | relationships | properties | turns | applies |
|---|---|---|---|---|---|
| control mean | 28.0 | 50.0 | 69.3 | 78 | 51.3 |
| treatment mean | 20.3 | 26.0 | 34.7 | 55 | 37.7 |
| | **−27%** | **−48%** | **−50%** | −29% | −27% |

Per run, the pattern is consistent — every treatment run is smaller than every
control run on classes and relationships:

| arm/run | classes | relationships | properties | turns | applies |
|---|---|---|---|---|---|
| control/run-01 | 33 | 62 | 97 | 82 | 49 |
| control/run-02 | 24 | 32 | 38 | 91 | 54 |
| control/run-03 | 27 | 56 | 73 | 61 | 51 |
| treatment/run-01 | 20 | 27 | 29 | 59 | 40 |
| treatment/run-02 | 22 | 29 | 56 | 49 | 34 |
| treatment/run-03 | 19 | 22 | 19 | 57 | 39 |

**The interview ends sooner and covers less.** §4's first question was whether
Phase 1 front-loading consumes the interview. The precise answer is subtler and
worse than a simple yes: the treatment arm does reach the modeling phases, but
the whole interview concludes ~29% earlier, having committed ~27% fewer applies,
and the model it leaves behind is proportionally smaller. Competency-question
work displaces modeling turns rather than adding to them, and the completion
classifier — which is not treatment-aware — sees a coherent, self-consistent
model and calls the interview finished.

**A genuine counterweight, stated because it is real:** what the treatment does
capture, it captures more accurately. Value fidelity rises from 62.0 to 87.4
(full) and 69.1 to 83.8 (practical), and the treatment's runs are far tighter
(85.7–88.9 against the control's 28.6–90.0). Relationship F1 is also nominally
higher on both scopes. The honest characterisation is a **smaller, tighter,
higher-fidelity model rather than a uniformly worse one** — but "smaller" is
what the pass criteria measure, and they measure it deliberately.

Both deltas sit close to their spreads (7.6 vs 5.6; 8.8 vs 7.2), so this is a
real but not overwhelming effect. It is not, however, dismissible: it is
directionally consistent across all three paired runs on both dimensions.

## Pass criteria

| Criterion | Verdict |
|---|---|
| Class / relationship / property F1 do not decrease materially | **FAILED.** Full-domain classes −7.6 and properties −8.8, both larger than spread |
| Controlled-value fidelity does not regress | Met — it improves substantially |
| Turn count does not increase disproportionately | Met literally (it *decreases*), but this is the mechanism of the failure, not a pass |
| Interviews terminate normally in both arms | Met, all six |
| Elicitation quality not visibly degraded | Not separately assessed; the size deficit is the finding |

## The two conditions disagree, which is itself the finding

The weaker-interviewer condition (`competency-questions-gpt-5-mini`) showed no
regression and a property-F1 *gain* clearing its spread. This one shows a
class- and property-F1 loss clearing its spread. §7 anticipated exactly this:
two conditions disagreeing is a finding neither would surface alone.

The reconciling reading: on a weak interviewer the control is already
turn-limited and thin, so focusing the interview costs little and the tighter
targeting helps. On a strong interviewer the control has real headroom to keep
elaborating, and ending ~29% earlier forfeits it. **The change is not neutral;
it trades breadth for focus, and the stronger the interviewer, the more breadth
there is to lose.**

## Recommendation

Per §5's fallback order, the first fallback is indicated: **move
competency-question persistence later in Phase 1, or otherwise stop the
competency-question work from displacing modeling turns**, then re-run this
batch. The data model, file formats, Domain Model UI, Review Changes
integration and coverage check are not implicated by this result — competency
questions can still be imported and hand-authored — so the narrower third
fallback (ship everything except the interviewer prompt change) remains
available if a revised prompt cannot recover the deficit.
