# Issue #89: does the optional LLM consistency pass earn being switched on?

**Status: pre-registration.** Committed before the first call, same discipline
as `POST_NORMALIZATION.md` and `SELF_CORRECTION_EVAL.md`.

## 1. The question

> **Does Tier C find real contradictions the deterministic checks miss, and at
> what false-positive cost?**

Both halves. A pass that finds three extra real defects and invents seven is not
an improvement — it is what teaches people to stop reading findings.

## 2. Why this is cheap, and why it is not #75 again

It scores **finished ontologies**, so there are no interviews. One call per
model, nine models available: the three anchors plus the six #85 arm models.

#75 gave an LLM **authority to rewrite** a model and the answer was no, twice.
Tier C has no authority — it reports, a human reads, nothing changes unless they
act. The failure mode #75 found (inventing structure, destroying elicited text)
is unavailable to it. What *is* available is inventing findings, which is
exactly what this measures.

## 3. Method

For each model, run Tier C once and classify every finding against the
deterministic output:

| Category | Meaning |
|---|---|
| `novel-true` | a real contradiction no Tier A/B check reported — the entire case for the feature |
| `duplicate` | the deterministic checks already had it; harmless, and evidence of calibration |
| `false` | not a contradiction in the model at all |
| `out-of-scope` | a genuine observation about completeness or style, which the prompt explicitly asks it not to report |

Every finding adjudicated **in writing**, the way
`fixtures/consistency-corpus/labels.json` does. A false-positive rate over nine
models is not a statistic worth quoting; an enumerated list a reviewer can
disagree with is.

Provenance per run: model, prompt SHA-256, source ontology SHA-256, usage.

## 4. Decision rule, fixed before running

- **Switch the default on** only if `novel-true` findings appear in a majority
  of models **and** `false` findings average below one per model.
- **Keep it default-off, documented** if it is mostly duplicates. Not a failure:
  a second opinion that agrees is reassuring, just not worth a call.
- **Remove it** if it mostly invents, or mostly reports completeness gaps the
  prompt told it not to.

**Ambiguity resolves to keep it default-off.** The burden of proof is on
switching something on by default, not on leaving it alone.

## 5. Limitations, stated up front

- The adjudication is mine, not blind. A finding I judge `false` is a judgement,
  not a measurement, and the list is published so it can be disputed.
- Nine models from one fixture and one domain — the same external-validity limit
  the whole program carries.
- Tier C runs on `gpt-5.4` here, not the model a user would have connected.
