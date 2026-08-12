# Labelled corpus for the consistency checker (issue #83 §8)

The three anchor runs each shipped an independent LLM review of their own
conversation, and those reviews recorded **30 concrete defects** between them
(`tests/evals/results/runs/run-0{1,2,3}/report.md`, Errors sections: 4 / 14 /
12). They were written at the time, by a reviewer with no knowledge of this
feature, about real models produced by real interviews. That makes them the
closest thing to ground truth this repository has for "what goes wrong in an
elicited ontology", and they cost nothing to use: no API key, no new run.

`labels.json` maps every one of them to a verdict about **this** checker.

## The headline, and it is not what we expected going in

**Only 8 of the 30 are model-level defects a checker over the domain model
could ever see, and 3 of those are in reach of a lexical checker today.** The
largest group by far — **22 of 30**, of which 12 are one single recurring
observation — is not about the model at all. They are about the *interviewer's
process*:

> *"Values were provided for six properties, but tool result says 4 updated;
> assistant claims all recorded."*

That defect is invisible to any amount of inspection of the finished ontology,
because the finished ontology is exactly what the tool did apply. It is a
mismatch between what the agent said and what the tool reported, and the fix
for it is a richer tool result — which is #84, not this issue. Recording that
here rather than quietly scoring against a denominator of 30 is the point of
labelling the corpus at all.

The remaining 5 are model-level but out of lexical reach: they turn on
knowing that "acknowledgement timestamp" means a field, or that a verification
requiring an Incident Commander implies a precondition that does not exist.
Those are real defects and a future check may reach some of them; today they
are labelled `out-of-scope` with a reason, not counted as misses.

## How to read the numbers

- `detectable` — the checker should find it, and the test asserts it does.
- `process` — not a property of the model; no model checker can see it.
- `out-of-scope` — a real model defect, beyond what a lexical checker reaches,
  with the reason stated.

## What the checker actually found

29 findings across the three models: 1 error, 26 warnings, 2 notes. All three
`detectable` defects are found. The single error is the documented Turn 43
contradiction and nothing else — no false positives at error severity.

The most interesting number is not in the documented list at all:
**`unreachable-from-action-input` fires 15 times across the three independent
interviews.** Every instance is an action whose preconditions reason about a
class the agent cannot navigate to from the action's own input. That is the
same defect class #75's normalizer diagnosed correctly in run-03 and then
failed to repair. Seeing it fifteen times suggests the concept–structure gap
this eval program has been circling for five conditions has a concrete,
mechanical signature after all.

## Unlabelled findings

`unlabelled_findings` enumerates everything the checker reports on these three
models that is **not** in the documented list, each with a written
adjudication. A false-positive *rate* over three models is not a statistic
worth quoting; an enumerated list a reviewer can disagree with is. Two of them
turned out to be real defects the original review missed.
