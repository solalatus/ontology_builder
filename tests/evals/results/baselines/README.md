# Comparison conditions: does the elicitation machinery earn its complexity?

The three-run replication set in `../runs/` shows what the interactive elicitation agent
recovered. It cannot show whether any of the machinery is responsible for that. Each condition
here varies exactly one factor against those same three runs and holds everything else fixed —
persona, fixture, interviewer model (`gpt-5.5-2026-04-23`), stopping conditions, scorer. The
specification is `../../EXPERIMENT_BRIEF.md`; nothing under `../runs/` was modified at any point.

| Condition | Single factor varied | Model produced by | Turns |
|---|---|---|---|
| **Interactive** (anchor, `../runs/`) | — | incremental `apply_ontology_yaml` during the interview | 52 / 51 / 57 |
| **B1** `b1-one-shot/` | how a conversation becomes a model | one extraction call over the *interactive runs' own* finished transcripts | (reuses those transcripts) |
| **B2** `b2-generic-interviewer/` | the interviewer's system prompt | incremental commits, exactly as interactive | 12 / 7 / 9 |
| **B3** `b3-no-commit/` | whether anything can be committed mid-conversation | one extraction call over this run's own transcript | 72 / 68 / 84 |
| **post-normalization-v1** `post-normalization-v1/` | whether a finished ontology gets a dedicated structural review pass | one review call over the interactive run's own transcript **and its own ontology** | (reuses those transcripts) |

B4 (private scratch model) and B5 (held-out fixture) were not run.

`post-normalization-v1` is the odd one out and is read differently from B1–B3.
The B-conditions each replace some part of the pipeline that *produces* a model,
so they are alternatives to the interactive run. This one starts *from* the
interactive run's own output and asks whether reviewing it afterwards improves
it, so its comparison is paired rather than between-groups, and its primary
endpoint is a blind transcript-grounded judge rather than recovery F1 — for
reasons the condition's own pre-registration argues before any result existed
(`../../POST_NORMALIZATION.md` §5.1). Its report is
`post-normalization-v1/REPORT.md`; issue #75 is the specification.

## Results

Heuristic (deterministic) pass only, F1 in every dimension. The semantic figures are **not**
comparable across conditions: the judge was asked about the *interactive* runs' specific
near-misses, and those verdicts do not transfer to a different model's different near-misses
(`EXPERIMENT_BRIEF.md` §4.5). B2's per-trial `report.md` carries its own semantic numbers from its
own judge calls; B1 and B3 were never judged.

Reproduce with `node tests/evals/score-baseline.mjs <condition> <run-id> [...]`.

### Full domain (68 classes / 108 relationships / 111 properties)

| Condition | Class F1 | Rel. F1 | Prop. F1 |
|---|---|---|---|
| Interactive | 44.7 / 45.7 / 40.0 (**43.5**) | 13.3 / 12.2 / 4.1 (**9.9**) | 14.8 / 28.4 / 18.4 (**20.5**) |
| B1 one-shot | 44.7 / 45.7 / 40.0 (**43.5**) | 13.4 / 12.2 / 4.1 (**9.9**) | 16.7 / 32.0 / 18.4 (**22.4**) |
| B2 generic interviewer | 30.9 / 31.7 / 39.6 (**34.1**) | 2.6 / 3.3 / 8.8 (**4.9**) | 12.3 / 5.3 / 13.6 (**10.4**) |
| B3 no commit | 54.2 / 51.9 / 44.4 (**50.2**) | 4.9 / 6.3 / 6.9 (**6.0**) | 27.6 / 27.1 / 23.7 (**26.1**) |
| post-normalization-v1 | 44.7 / 45.7 / 40.0 (**43.4**) | 13.3 / 12.2 / 4.1 (**9.9**) | 14.8 / 28.4 / 18.4 (**20.5**) |

### Practical scope (28 / 41 / 26)

| Condition | Class F1 | Rel. F1 | Prop. F1 |
|---|---|---|---|
| Interactive | 70.4 / 65.4 / 56.0 (**63.9**) | 24.1 / 17.3 / 5.0 (**15.5**) | 15.4 / 21.8 / 17.9 (**18.4**) |
| B1 one-shot | 70.4 / 65.4 / 56.0 (**63.9**) | 24.4 / 17.5 / 5.1 (**15.7**) | 19.7 / 27.1 / 17.9 (**21.6**) |
| B2 generic interviewer | 24.6 / 32.5 / 51.0 (**36.0**) | 2.6 / 0.0 / 6.5 (**3.0**) | 5.6 / 6.0 / 9.4 (**7.0**) |
| B3 no commit | 59.7 / 62.5 / 57.6 (**59.9**) | 6.2 / 6.6 / 9.3 (**7.4**) | 17.4 / 21.3 / 16.4 (**18.4**) |
| post-normalization-v1 | 70.4 / 65.4 / 56.0 (**63.9**) | 24.1 / 17.3 / 5.1 (**15.5**) | 15.4 / 21.8 / 17.9 (**18.4**) |

No edge was discarded for naming an undeclared endpoint class in any condition.

## What the conditions show

**B1 — incremental committing does not improve what is recovered.** B1 recovers *the same gold
items* as the interactive run it was built from: class, relationship, and property recall are
identical to the decimal in all three runs. Its F1 is marginally higher only because it emits less
surplus (45 vs 65, 70 vs 93, 41 vs 41 properties; 41 vs 42, 39 vs 40, 38 vs 39 edges), and surplus
costs precision. Every delta `score-baseline.mjs` prints for B1 is zero or negative.

This is a real negative result for the tool-committing loop *as a recovery mechanism*, and B1 was
deliberately given the generous side of the comparison: it inherits the interactive agent's
questioning for free. What the loop does provide — the expert watching the model take shape and
being able to correct it mid-interview — is a visibility property that a recovery metric computed
against a hidden fixture cannot detect either way. It should be claimed as that, not as accuracy.

**B2 — the staged interviewer prompt does earn its complexity.** The generic prompt loses on every
dimension in every trial, and controlled-value fidelity collapses (2.5–55.6% against 62.4–95.9%).
Two of its trials also over-generate heavily (94 classes / 169 edges; 52 / 75) against gold's 68 and
108, so the loss is in precision as much as coverage. **Confound:** the generic prompt also ends the
interview far sooner (7–12 turns against 51–57), through the same stopping condition. Prompt and
interview length are not separated here; this condition varies the prompt, and the prompt determines
both.

**B3 — suppressing commits changes the interview, not just the bookkeeping.** With
`apply_ontology_yaml` structurally unreachable, the interviewer runs longer (68–84 turns) and the
extracted model is broader: full-domain class F1 rises 4–10 points over the interactive runs and
property F1 5–13 points. Relationship F1 falls in two of three trials. **Two confounds:** the turn
counts differ, and B3's model comes from B1's extraction call rather than from committed tool
calls — so B3 vs interactive varies committing *and* the model-building path, while B3 vs B1
isolates the effect of tool availability on the conversation itself.

**post-normalization-v1 — a structural review pass is invisible to this scorer.** The condition's
figures above are identical to the interactive arm's to the decimal, and that is the result, not a
copy-paste error: 17 of 18 run × dimension × scope cells moved by exactly 0.0 points and the
eighteenth by +0.1, while the blind structural judge preferred the reviewed model in 2 of 3 runs and
rejected it unanimously in the third. `cross-run-analyses.mjs` and `threshold-sensitivity.mjs`
likewise return output indistinguishable from the interactive arm's. Recovery F1 measures agreement
with a fixed reference model; splitting an overloaded predicate, repairing a value set, or
rewriting rule conditions does not move it in either direction. Criteria "F1 did not decrease"
passed here **vacuously**, and should be read as a guardrail against catastrophe rather than as
evidence that quality was preserved. Full result and the B (insufficient evidence) recommendation:
`post-normalization-v1/REPORT.md`.

**The concept–structure gap is condition-invariant.** Class F1 exceeds relationship F1 in all 12
condition-runs under both denominators, and exceeds property F1 in all 24 condition-run-scope
combinations. The gap survives one-shot extraction, a generic interviewer, an interview that
never commits, and a dedicated post-hoc structural review pass. Whatever produces it, it is not the
tool-calling loop.

## Methodological notes

**B2's invalidated first trial is kept, not deleted.** `b2-generic-interviewer/trial-01-INVALID-dict-relationships-bug/`
is the condition's first attempt: the generic prompt did not state the exact `relationships:` YAML
grammar, the model emitted a dict-keyed shape, and `index.html`'s parser silently dropped it to an
empty list. The prompt was corrected to include the same structural grammar block every condition
gets — a fact about the target format, not about interview strategy or domain content — and the
three trials above were run with it. The invalid trial is preserved so that the correction is
visible rather than merely asserted (`EXPERIMENT_BRIEF.md` §4.6).

**Provenance.** Every directory carries `baseline-provenance.json`: model ids, prompt and transcript
SHA-256, turn count, stopping reason, wall-clock, token usage.
