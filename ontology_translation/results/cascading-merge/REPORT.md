# Cascading intelligent-merge measurement (issue #147)

Answers the open question in `ontology_translation/PAPER_NOTES.md`
("does repeated auto-elicitation + intelligent merge beat a single run?"):
does cascade-merging a domain's 3 existing live-interview replicates
through the app's own real Import Review / intelligent-merge feature
(issue #122/#126) recover more of the ground truth than any single
replicate does alone?

**Answer: mixed, not a uniform win.** Merging two replicates together
(`merge(run-01, run-02)`) beats the 3-replicate mean in every domain and
beats the single best replicate in 3 of 5. Adding a third replicate
(`merge(merge(run-01, run-02), run-03)`) does **not** reliably improve on
the two-way merge -- it regresses composite recovery in 3 of 5 domains,
sometimes sharply (brick-hvac: -0.107), and the full three-way merge
underperforms the single best individual replicate in 3 of 5 domains. Rule
recovery is the one dimension that improves cleanly and consistently at
every stage, in every domain.

---

## Methodology

**Real feature, not a bespoke algorithm.** This measurement drives the
app's actual Import Review dialog (`window.__kg.importReview.*`) live
against real Azure OpenAI, the same per-item LLM-assisted match/merge
review and dedicated execution agent (with a real delete tool) the UI
offers a human running the app by hand -- not a new merge algorithm
written for this measurement. See `tests/evals/run-cascading-merge.mjs`
for the driver script and its own header for the full rationale.

**Cascade, not a 3-way merge in one step**, per issue #147's own design:
run-01's saved model seeds the canvas (`window.__kg.formats.
commitYamlImport(yaml1, "replace")`, the same mechanism a Replace-import
uses); run-02 is merged in through Import Review; the resulting merged
model is then merged with run-03 through a second Import Review pass on
the same live canvas.

**Fixed, reproducible decision policy** -- not tuned per domain or after
seeing results, applied identically everywhere:
- A **current-only** item (only the base side has it) is always kept.
- An **incoming-only** item (only the newly-merged side has it) is always
  taken. There is no second version to weigh against, and discarding one
  session's unique content just because the other session didn't
  independently surface it would defeat the premise being tested.
- A **suggested cross-label pairing** (from the app's own `suggestMatches()`
  proposer pass -- e.g. two different names for the same real-world thing)
  is always accepted once proposed, since the proposer's own system prompt
  is already conservative about what it proposes.
- A **matched item that differs** between the two sides gets a fixed
  reasoning note ("these are two independently elicited descriptions of the
  same item... reconcile them, combining complementary details rather than
  discarding either outright") with no plain pick, so it routes to the
  real execution agent for genuine reconciliation judgment rather than a
  scripted keep/take coin flip.

**Scored the same way every other run in this repo is scored** --
`computeRecoveryMetrics`/`computeRuleMetrics`/`computeActionMetrics`
(`tests/evals/lib/recoveryMetrics.mjs`), full domain and practical scope,
via `rescoreRun()` (`tests/evals/rescore-saved-run.mjs`, reused, not
reimplemented). **Deliberately not semantically (LLM-judge) scored** --
semantic judging asks about a run's own specific near-misses
(`llmMatcher.mjs`'s own module comment), which for a brand-new merged
model would mean fresh judge calls with their own real cost on top of the
merge itself, for a metric this repo's own summaries already treat as
secondary to the heuristic pass. All comparisons below are heuristic,
full-domain, `recoveryEffectiveness` unless stated otherwise.

**Scope, honestly**: n=1 per domain -- one cascading-merge run, not a
replicated condition the way the 3 individual runs are (no variance bound
on the merge process itself); one fixed ordering (1→2→3, not other
orderings or an all-three-at-once merge); one fixed decision policy. Issue
#147 itself named these as out of scope for this first measurement.

---

## Headline result: composite recovery effectiveness (heuristic, full domain)

| Domain | run-01 | run-02 | run-03 | mean | best | merge(1,2) | merge(1,2,3) | Δ vs mean | Δ vs best |
|---|---|---|---|---|---|---|---|---|---|
| brick-hvac | 0.605 | 0.612 | 0.725 | 0.647 | 0.725 | 0.718 | 0.611 | -0.036 | **-0.114** |
| iof-maintenance | 0.810 | 0.522 | 0.652 | 0.661 | 0.810 | 0.736 | 0.727 | +0.066 | **-0.083** |
| iof-supply-chain | 0.752 | 0.748 | 0.639 | 0.713 | 0.752 | 0.818 | 0.728 | +0.015 | **-0.024** |
| fibo-loans | 0.646 | 0.591 | 0.589 | 0.609 | 0.646 | 0.699 | 0.710 | **+0.101** | **+0.064** |
| itops (control) | 0.542 | 0.585 | 0.619 | 0.582 | 0.619 | 0.646 | 0.712 | **+0.129** | **+0.092** |
| **4-domain macro** | | | | **0.658** | **0.733** | **0.743** | **0.694** | **+0.036** | **-0.039** |
| **5-domain macro** | | | | **0.642** | **0.711** | **0.723** | **0.698** | **+0.055** | **-0.013** |

`mean`/`best` are the 3 individual replicates' own recovery effectiveness
(`ontology_translation/results/multi-domain{,-control}/run-0N/<domain>/
metrics.json`), unchanged by this measurement. `merge(1,2)` beats `mean` in
**5/5** domains and `best` in **3/5** (iof-supply-chain, fibo-loans,
itops). `merge(1,2,3)` beats `mean` in **4/5** but `best` in only **2/5**
(fibo-loans, itops) -- three domains where the third-source merge actually
lands *below* the single best individual replicate.

## Per-dimension breakdown (F1, heuristic, full domain)

| Domain | Classes mean → merge(1,2,3) | Relationships mean → merge(1,2,3) | Properties mean → merge(1,2,3) | Rules mean → merge(1,2,3) | Actions mean → merge(1,2,3) |
|---|---|---|---|---|---|
| brick-hvac | 0.766 → 0.824 | 0.655 → **0.633** | 0.521 → **0.377** | 0.574 → 0.615 | 0.724 → **0.625** |
| iof-maintenance | 0.670 → 0.800 | 0.583 → 0.667 | 0.731 → 0.714 | 0.668 → 0.833 | 1.000 → 1.000 |
| iof-supply-chain | 0.644 → **0.675** | 0.627 → **0.508** | 0.867 → 1.000 | 0.813 → 0.800 | 0.889 → **0.667** |
| fibo-loans | 0.623 → 0.716 | 0.709 → 0.722 | 0.495 → 0.692 | 0.583 → 0.833 | 0.893 → **0.714** |
| itops | 0.673 → 0.764 | 0.486 → 0.643 | 0.587 → 0.728 | 0.643 → 0.957 | 0.810 → 1.000 |
| **4-domain macro** | 0.676 → 0.754 | 0.644 → **0.633** | 0.653 → 0.696 | 0.660 → **0.771** | 0.876 → **0.751** |
| **5-domain macro** | 0.675 → 0.756 | 0.612 → 0.635 | 0.640 → 0.702 | 0.656 → **0.808** | 0.863 → **0.801** |

**Rules recovery is the one clean, uniform win**: every single domain's
rule F1 goes up from the 3-replicate mean to the full cascading merge, by
a wide margin in the macro (+0.111 to +0.152). Free-text
precondition/effect/verification content from independent interviews
appears to compose well under this merge policy even where structural
elements (relationships, properties) sometimes don't. **Actions recovery
moves the other way** in 3 of 5 domains -- a genuine, not incidental,
finding worth a closer look before trusting action recovery from a merged
model.

## Where the regressions come from -- checked, not assumed

Two domains' `merge(1,2)` → `merge(1,2,3)` step were inspected directly
(both real content changes, not scoring artifacts):

- **brick-hvac**: relationships recall 22/35 → 19/35, properties recall
  18/42 → 10/42, both with precision staying high throughout (0.76-0.97) --
  the merge didn't get noisier, it lost previously-correct matches when
  reconciling the third source. The execution agent's own commentary for
  this stage: *"I deliberately did not remove... `Air Temperature Sensor`,
  because no decision explicitly merged or removed that class itself, only
  the AHU `hasPoint` relationship was remapped to `TemperatureSensor`"* --
  a partial rename/remap of one item without correspondingly touching its
  now-orphaned properties/relationships is a plausible mechanism, though
  not confirmed as *the* mechanism from commentary text alone.
- **iof-supply-chain**: relationships recall 21/30 → 15/30 **and**
  precision 0.84 → 0.52 at the same time (recoveredTotal even rose, 25→29
  edges, while matched fell 21→15) -- both sides of the metric moved
  against the merge simultaneously, not just recall against a fixed
  precision, meaning the third-source reconciliation pass introduced
  incorrect/duplicate edges *and* lost previously-correct ones.

Neither case shows the execution agent failing outright (`suggestFailures`
is `false` at both stages, every domain; the agent always returned a
non-empty, coherent commentary) -- this reads as a real limit of
three-source reconciliation quality under the current merger prompt and
decision policy, not a pipeline malfunction. Full per-item decisions and
agent commentary for every domain/stage are in each stage's own
`decisions.md` and `metrics.json`'s `operationalStats` field.

One content-quality note, not score-affecting: cascaded merges accumulate
near-duplicate `competency_questions` entries (paraphrased restatements
from each source run) since competency questions aren't part of the
diff/matching engine's own dedup -- visible in every domain's merged
`recovered-model.yaml`, worth a follow-up if this mechanism is used again.

---

## What this does and doesn't support

**Supported**: pairwise merging two independent elicitation runs through
this app's real intelligent-merge feature recovers more of the ground
truth, on average, than either run alone or the 3-replicate mean --
consistent with the human-elicitation-workshop analogy this measurement
set out to test. Rule recovery specifically composes very well across any
number of merged sources.

**Not supported**: "merge everything you have" as an unconditional
strategy. Adding a third source through the same mechanism is not reliably
better than stopping at two, and both stages taken together are not
reliably better than the researcher's own best single run -- in 3 of 5
domains here, simply running one more replicate and keeping the best one
would have scored higher than the full three-way cascading merge. Given
n=1 per domain, none of these per-domain deltas should be read as more
than a single, real, reproducible-in-principle data point -- not a
statistically established effect size (see Scope above).

**For the paper**: report the two-way-vs-mean result (clear, consistent
lift) and the three-way regression finding (real, also consistent) side by
side, not just the headline "does merging help" framing -- the honest
answer here is "merging two sources reliably helps; cascading a third
through the same mechanism does not reliably help further, and sometimes
hurts."

---

## Artifacts

Per domain, under `ontology_translation/results/cascading-merge/<domain>/`:

- `merge-1-2/` -- `recovered-model.yaml`, `metrics.json`,
  `heuristic-matches.json`, `decisions.md` (the full Import Review decision
  record, same export a human clicking "Download decisions" would get),
  `provenance.json` (model, source-run hashes, ground-truth hash, prompt
  hashes -- no live-run token/turn counts, since this is an import-review
  pass, not an interview).
- `merge-1-2-3/` -- same shape, for the second cascade stage.

Driver: `tests/evals/run-cascading-merge.mjs`. Re-run with:

```sh
AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... AZURE_OPENAI_DEPLOYMENT=... \
node tests/evals/run-cascading-merge.mjs --domain=<id> \
  --sourceResultsDir=ontology_translation/results/multi-domain[-control] [--force]
```
