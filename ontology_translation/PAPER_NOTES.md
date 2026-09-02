# Paper notes — remarks for the write-up

Not a task list (see `TODO.md` for that) and not implementation guidance
(see `tests/evals/EXPERIMENT_BRIEF.md` for that). This file collects short,
dated scientific remarks — design rationale and open questions — meant to be
pulled directly into the companion paper's Methods/Discussion/Future-Work
sections. Add to it whenever a design decision or an open question is worth
recording in its own right, separate from the engineering log.

---

## 2026-09-02 — Domain selection: a real+synthetic split to bound pretraining leakage

The multi-domain benchmark (epic #101/#111) scores the interviewer against
**five** domains, not four: Brick HVAC, IOF Maintenance, IOF Supply Chain,
and FIBO Loans (`ontology_translation/results/multi-domain/`) are each
mechanically translated from a real, published industry ontology; `itops`
(`ontology_translation/results/multi-domain-control/`) is a hand-authored,
unpublished fictional domain (a fictional Hungarian bank's IT-operations
model), run as a **separate control arm** rather than folded into the
four-domain macro statistics.

**Why**: an interviewer LLM's apparent recovery on a *published* source
ontology is confounded with whatever it already knows about that ontology
from pretraining — the model may be reciting a structure it has seen before
rather than eliciting it from the persona at all, and no persona-side leak
guard can catch or correct this, because the interviewer is never shown the
persona's ground truth to begin with (first named as an explicit,
out-of-scope caveat on the leak audit in issue #133, Finding A). A domain the
model cannot plausibly have training exposure to is the only direct check
against this: `itops` exists specifically to be that domain, and its
provenance (unpublished, fictional, hand-authored) is what makes the check
work, not an incidental property of it.

Kept in a **separate directory** rather than mixed into the four-domain
macro statistics because `itops` is also structurally different in ways
(size, abstraction level) that would confound an apples-to-apples average if
blended in — see `ontology_translation/results/multi-domain-control/README.md`
("Why a separate domain, and why a separate directory", "The domain-size
confound") for the full reasoning and the resulting itops-vs-published-domain
comparison table.

**For the paper**: report the four published-ontology domains as the primary
result and `itops` as a dedicated leakage-bound control, not as a fifth data
point in the same average — exactly how the repository's own results
directories are already split.

---

## 2026-09-02 — Open question: does repeated auto-elicitation + intelligent merge beat a single run?

Human elicitation practice motivated a specific, still-untested hypothesis
about the automated agent.

In human-led domain elicitation (running structured workshops with a domain
expert to build a shared model), running **separate sessions with different
participants and then merging the results** has empirically produced better
captured models than a single, larger session — different participants
surface different facts, phrasings, and edge cases, and a deliberate merge
pass reconciles the overlaps and gaps. This is the premise the app's own
**Import Review** feature (issue #122) was built around: importing a second,
independently authored domain model triggers a per-item, LLM-assisted merge
decision UI (`Suggest matches`) backed by a dedicated execution agent with
its own delete tool (`remove_ontology_elements`, issue #126), so two models
built separately can be reconciled into one rather than one simply
overwriting the other.

**The open question**: does the same principle transfer to *automated*
elicitation? That is — does running the interactive interview agent multiple
independent times against the same persona/fixture, then reconciling the N
resulting recovered models through the same intelligent-merge machinery,
recover more of the ground truth than any single run does alone (or than a
naive union of the N runs would)? The analogy to human multi-session
elicitation suggests it plausibly could: different runs of the same
interviewer prompt already show real turn-by-turn variation (see the
per-replicate spread in `ontology_translation/results/multi-domain/summary.md`
and `multi-domain-control/summary.md`), which is exactly the kind of
independent-sampling variance a merge step could exploit.

**Status: untested.** No condition in this repository currently runs
repeated auto-elicitation and merges the outputs — every existing
comparison condition (`tests/evals/EXPERIMENT_BRIEF.md` §3, B1–B5) varies a
single-run factor. This is a natural candidate for a future condition
(informally, "B6 — repeated elicitation + intelligent merge") were resources
available: run N replicates, merge them via the Import Review execution
agent (or an equivalent offline merge pass), and rescore the merged model
against the same ground truth to see whether it beats the best individual
replicate. Flagging this now so it is not lost before someone has the budget
to run it.

**Tracked as issue #147**, with a concrete first design: keep the 3
existing replicates and their individual scoring as the baseline, unchanged;
additionally cascade-merge them (`merge(run-01, run-02)`, then
`merge(that, run-03)`) via the same Import Review machinery, score the
final merged model the same way, and report whether it lifts recovery
effectiveness over the best individual replicate.
