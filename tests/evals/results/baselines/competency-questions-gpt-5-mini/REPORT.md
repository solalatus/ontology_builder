# Issue #94 non-regression — weaker-interviewer condition (`gpt-5-mini`)

Design, measures and pass criteria were pre-registered in
`tests/evals/CQ_NON_REGRESSION.md` before these arms ran. Nothing below was
adjusted to fit the outcome.

**This is the secondary condition, not the primary one.** It ran on
`gpt-5-mini` because a probe of generic Azure deployment names suggested nothing
stronger was deployed; that was wrong, and the primary batch runs on `gpt-5.4`
(issue #85's own configuration). This condition is kept because it is a result
in its own right — see `CQ_NON_REGRESSION.md` §7 — and because Phase 1
front-loading should bite hardest where the interviewer has least headroom to
spare, which makes a weak interviewer the more searching test of the specific
risk this change introduces.

Reproduce with:

```sh
node tests/evals/analyze-cq-non-regression.mjs competency-questions-gpt-5-mini
```

## Configuration

| | |
|---|---|
| Interviewer | `gpt-5-mini` (Azure), both arms |
| Persona / classifier | `gpt-4o` / `gpt-5-mini` |
| Control prompt | frozen pre-#94, verified against golden hash `eff34f3e…` |
| Treatment prompt | shipped #94, hash `0173b3f3…` |
| Budget | 120 turns / 45 min |
| n | 3 per arm, six interviews |

## Every interview terminated on its own

| Arm | Run | Turns | Sec | Applies | CQs | Stopped |
|---|---|---|---|---|---|---|
| control | run-01 | 24 | 1027 | 21 | 0 | `app_agent_appears_finished` |
| control | run-02 | 20 | 689 | 18 | 0 | `app_agent_appears_finished` |
| control | run-03 | 30 | 1279 | 31 | 0 | `app_agent_appears_finished` |
| treatment | run-01 | 18 | 751 | 22 | 20 | `app_agent_appears_finished` |
| treatment | run-02 | 12 | 472 | 8 | 17 | `app_agent_appears_finished` |
| treatment | run-03 | 29 | 1158 | 21 | 20 | `app_agent_appears_finished` |

No run hit the wall-clock, so none is excluded by §5's truncation rule.

## Recovery, control vs treatment

Full domain, F1:

| dimension | control (r1/r2/r3) | mean | treatment (r1/r2/r3) | mean | delta |
|---|---|---|---|---|---|
| classes | 40.0 / 16.9 / 26.5 | 27.8 | 47.8 / 29.6 / 30.6 | 36.0 | **+8.2** |
| relationships | 7.4 / 4.5 / 4.5 | 5.5 | 8.0 / 11.1 / 4.4 | 7.8 | +2.4 |
| properties | 15.0 / 13.5 / 13.3 | 13.9 | 19.7 / 19.4 / 19.8 | 19.7 | **+5.7** |
| value fidelity | 10.7 / 69.8 / 9.1 | 29.9 | 18.1 / 22.7 / 21.0 | 20.6 | −9.3 |

Practical scope, F1:

| dimension | control (r1/r2/r3) | mean | treatment (r1/r2/r3) | mean | delta |
|---|---|---|---|---|---|
| classes | 62.2 / 27.9 / 41.9 | 44.0 | 53.8 / 43.9 / 35.6 | 44.4 | +0.4 |
| relationships | 14.5 / 6.2 / 9.1 | 9.9 | 4.8 / 16.9 / 5.0 | 8.9 | −1.0 |
| properties | 13.3 / 12.8 / 15.4 | 13.8 | 26.9 / 23.7 / 11.2 | 20.6 | +6.8 |
| value fidelity | 8.9 / 66.7 / 10.4 | 28.6 | 17.5 / 45.4 / 12.1 | 25.0 | −3.6 |

## What survives the n = 3 rule

A delta smaller than the widest within-arm spread is not a finding
(`CQ_NON_REGRESSION.md` §5). Applying that mechanically:

| scope | dimension | \|delta\| | widest spread | verdict |
|---|---|---|---|---|
| full | classes | 8.2 | 23.1 | within spread |
| full | relationships | 2.4 | 6.7 | within spread |
| full | **properties** | **5.7** | **1.7** | **larger than spread — inspect** |
| full | value fidelity | 9.3 | 60.7 | within spread |
| practical | classes | 0.4 | 34.3 | within spread |
| practical | relationships | 1.0 | 12.1 | within spread |
| practical | properties | 6.8 | 15.7 | within spread |
| practical | value fidelity | 3.6 | 57.8 | within spread |

**One dimension clears the bar, and it favours the treatment**: full-domain
property F1, +5.7 against a control spread of 1.7. The treatment arm's three
runs are strikingly tight there (19.7 / 19.4 / 19.8) where the control's are
uniformly lower (15.0 / 13.5 / 13.3). A plausible reading is that persisted
competency questions give the property phase a stable target to justify against,
which is exactly what §1 of the change intends — but at n = 3, on one scope
only, this is a lead to confirm in the `gpt-5.4` batch, not a claim.

**The −9.3 on full-domain value fidelity is not a regression.** The control
mean is carried by a single outlier run (69.8 against its own 10.7 and 9.1);
the within-arm spread is 60.7, six times the delta. The analyzer applies the
same spread test to this measure precisely so a number like that cannot be read
as a finding.

## Pass criteria

| Criterion | Verdict |
|---|---|
| Class / relationship / property F1 do not decrease materially | **Met.** Every delta is ≥ 0 except practical relationships (−1.0), an order of magnitude inside its spread |
| Controlled-value fidelity does not regress | **Met.** Nominal decrease sits far inside a spread dominated by one control outlier |
| Turn count does not increase disproportionately | **Met, and then some.** Treatment used *fewer* turns (mean 20 vs 25) |
| Interviews terminate normally in both arms | **Met.** All six, naturally |
| Phase 9 performs both checks; elicitation not degraded | Qualitative, pending on the primary batch |

**The specific risk this change introduces did not materialize.** §4's first
question was whether Phase 1 front-loading consumes the interview. It did not:
the treatment arm recorded 20 / 17 / 20 competency questions *and* finished in
fewer turns than the control, while recovering at least as much of the domain.

## Honest limits

- **Low-powered by construction.** `gpt-5-mini` recovers less and varies more
  than any previous generation here (practical class F1 27.9–62.2, against
  55.3–70.8 across the anchors and issue #85's arms). Most deltas are therefore
  unresolvable at n = 3, exactly as §7 predicted before the batch ran.
- **No regression detected is not the same as non-regression demonstrated.**
  This condition supports the former. The `gpt-5.4` batch is the one that can
  speak to the latter.
- The control arm runs the pre-#94 prompt against this build's tool
  descriptions (`CQ_NON_REGRESSION.md` §6).
