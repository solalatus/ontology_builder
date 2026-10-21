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

**Status: tested (issue #147) — mixed result, not a uniform win.** Ran the
concrete first design: the 3 existing replicates and their individual
scoring kept exactly as the baseline; additionally cascade-merged
(`merge(run-01, run-02)`, then `merge(that, run-03)`) through the app's own
real Import Review / intelligent-merge feature, driven live against real
Azure OpenAI, and scored the same way. Full methodology, per-domain tables,
and root-cause spot-checks: `ontology_translation/results/cascading-merge/
REPORT.md`.

**The two-way merge result supports the analogy**: `merge(run-01, run-02)`
beat the 3-replicate mean's composite recovery effectiveness in 5/5 domains
and the single best individual replicate in 3/5 (iof-supply-chain,
fibo-loans, itops) — consistent with the human-elicitation-workshop
premise this note started from. **The three-way cascade did not extend
that pattern**: adding a third source through the same mechanism regressed
composite recovery relative to the two-way merge in 3/5 domains (brick-hvac
sharply, -0.107), and the full three-way result underperformed the single
best individual replicate in 3/5 domains overall — confirmed as a real
content effect in two domains by hand (relationships/properties recall
genuinely dropped between stages, precision unaffected or also dropping,
not merely a scoring artifact). Rule recovery was the one dimension that
improved cleanly and consistently in every domain at every stage. Given
n=1 per domain (one cascading-merge run, not a replicated condition the
way the 3 individual runs are), none of this should be read as more than
a single, real data point per domain — a proper follow-up would replicate
the merge condition itself, and try orderings beyond the fixed 1→2→3
cascade used here.

**A second real data point (epic #152, 2026-09-03): merge(1,2) result did
not replicate cleanly, and the reason traces to interviewer-behavior
variance, not the merge mechanism.** After a set of interviewer prompt
changes (`helper_agent_todo.md`'s epic #152 entry), the 5-domain
merge(1,2) macro moved from baseline 0.723 to 0.695 on the first rerun (a
regression) and 0.742 on a corrected rerun (an improvement) — the same
merge script, same domains, two different results a few hours apart,
entirely explained by one domain's (iof-supply-chain) source replicates
swinging between a clean run (properties precision 1.0) and a run
contaminated by a since-fixed prompt bug (properties precision as low as
0.08) depending on how a simulated persona happened to phrase one answer.
This is itself evidence for the n=1 caution above: a single cascading-merge
data point is exactly as sensitive to its two source replicates' own
variance as this note already expected, and that variance can be large
enough to flip the merge's own improvement/regression verdict.

**Related methodological note: the properties-recall dimension is
extremely fragile on a domain with few gold properties.** iof-supply-chain's
own `reference.domain.yaml` defines exactly 3 properties total across ~20
classes (the sparsest of the 5 benchmark domains by a wide margin — the
next-sparsest, iof-maintenance, has 8). With a denominator of 3, a single
extra recovered-but-ungolded property swings precision by a third; the
prompt bug above, at its worst, recovered 26 properties against those 3
gold ones (precision 0.077) versus a clean run's 2 (precision 1.0) — a
0.66-point swing in `recoveryEffectiveness` from one axis alone, on a
domain that is also structurally saturated with "traceable X" vocabulary
that plausibly invites exactly this kind of over-elicitation. Worth
considering for any future benchmark redesign: either weight the macro
composite by each domain's own gold-element counts, or treat
`recoveryEffectivenessScoped` (the practical-scope variant) as the primary
comparator on domains below some minimum gold-property count.

---

## 2026-10-20 — Final scores at the shipped configuration, and a refinement of the interviewer-first count

**The result** (`ontology_translation/results/final-scores/`, 3 interviews per domain, all 15 clean, `gpt-6-sol` at default effort `high`, the #187/#188 prompt): composite 0.781 macro over the four published domains (iof-maintenance 0.911, brick-hvac 0.811, iof-supply-chain 0.721, fibo-loans 0.680) and 0.577 on the unpublished itops control; 0.740 over all five. Precision is 0.89–1.00 almost everywhere; what is missing is class recall on the large domains (0.45–0.49), which #182 traced to the competency-question inclusion test rather than to nobody asking. The score falls with gold size (38 to 287 elements), and itops is both the largest and the only unpublished domain, so one control cannot separate the two.

**Methods note: the expert's own words count.** The interviewer-first measure (`tests/evals/lib/interviewerPriorKnowledge.mjs`) asks whether the interviewer wrote a gold identifier before the expert said it. Until 2026-10-20 it matched raw identifiers only. That credited the interviewer whenever it was first to *write* a term in camelCase, including the expert's own phrase written back: "failure mode code" became `FailureModeCode`. The measure then partly reflected the interviewer's formatting habit rather than its prior knowledge.

It now credits the expert's plain-words mentions made before the interviewer's first raw use. The leak guard (persona-first) is unchanged. Recounted offline:
- the 12 published-domain runs of `multi-domain/`: 80, previously 330;
- the earlier itops control: 32, previously 167;
- the final-scores runs: 0–4 per run on the published domains and 1–10 on itops.

A hand check of a sample of the moved terms found each to be the expert's own phrase, most of them from the opening competency questions. For the paper, report the corrected measure. The unpublished domain shows the most interviewer-first terms, which is the opposite of what memorization would predict.

---

## 2026-10-21 — Baselines at the shipped configuration: what each part of the method contributes

`ontology_translation/results/baselines-gpt6/`: all five domains, 3 runs per condition, `gpt-6-sol`. Each condition varies one factor against the final scores; the prompts are the pre-registered originals.

Macro composite, four published domains:

| Condition | Composite | Reading against interactive (5 domains) |
|---|---|---|
| Interactive | 0.781 | |
| B1, one-shot extraction over the interactive transcript | 0.786 | level on all 5 |
| B3, staged prompt but no tools, extracted at the end | 0.688 | interactive beats it on 2, level on 3 |
| B2, generic prompt | 0.353 | interactive beats it on all 5 |

**For the paper.**
- **The staged interview prompt carries most of the quality:** +0.43 over a generic interviewer with the same model, persona and tools. The generic interviewer wraps up after 4 to 13 turns.
- **Committing to a live model during the interview helps the conversation, mostly the relationships.** Relationship F1 is 0.785 with commits and 0.600 without. Without commits the interview is longer: 142 turns against 96.
- **It does not help the conversion.** B1 and B3 share the extraction prompt but read different conversations: 0.786 against 0.688. The live model's value is in how it steers the conversation, and in what the expert can see, not in turning talk into a model.

**Caveat.** B1 is generous by construction. The #187 interviewer names every element it records, so its transcript documents the model.

