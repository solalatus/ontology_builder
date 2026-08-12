# Condition `post-normalization-v1`: does a dedicated structural review pass improve an already-elicited ontology?

**Status of this document:** pre-registration and methodology. Sections 1–6 were
written and committed **before** the condition was executed, so the analysis
plan and the success criteria in §5 could not be chosen after seeing which way
the result fell. The commit that added this file contains no results; the
results arrived in a later commit. That ordering is the whole point of writing
it down, and it is checkable in `git log`.

Implements the experiment specified in
[issue #75](https://github.com/solalatus/ontology_builder/issues/75). It is an
**evaluation-only** condition: the production interviewer is not modified, and
no integration decision is taken here.

---

## 1. The scientific question

The comparison conditions already run (`results/baselines/README.md`) produced
one finding that none of them explains:

> **The concept–structure gap is condition-invariant.** Class F1 exceeds
> relationship F1 in all 12 condition-runs under both denominators, and exceeds
> property F1 in all 24 condition-run-scope combinations. The gap survives
> one-shot extraction, a generic interviewer, and an interview that never
> commits.

B1 additionally showed that the tool-committing loop does not improve *what* is
recovered — it recovers the same gold items as a single extraction call over its
own transcript, to the decimal, in all three runs.

Both results point the same way: the residual weakness is in **structure**, and
the elicitation loop is not where it is produced. The interviewer prompt has
already been pushed hard at exactly this problem — its Phase 3 and Phase 9(b)
carry the jointly-mentioned-pair check, the direct-link-versus-chain probe, the
anti-generic-bucket rule, the "should be assigned implies two relationships"
rule and the anti-subclassing rule, several of which were accepted because they
raised this same fixture's scores. Whatever remains, remains *after* that.

This condition asks the one question none of the existing arms asks:

> **Single factor varied: whether a finished ontology receives a dedicated
> structural review pass, by a separate reviewer, before it is used.**

Held fixed: the interview itself (the three frozen anchor transcripts are read,
never re-run), the persona, the fixture, the scorer, both denominators, and the
production interviewer, which is not touched at all.

### What this condition is not

It is **not** an interviewer change, not a claim about unseen domains, and not
an integration proposal. It is also not a recovery-improvement mechanism in the
sense B1/B2/B3 are: it starts from the interactive run's own ontology, so it can
only reshape what elicitation already produced. A structural pass that improved
nothing would be a real and reportable result — issue #75 says so explicitly
("A poor `v1` result is valid"), and so does `EXPERIMENT_BRIEF.md` §1.

---

## 2. Setup

| | |
|---|---|
| Condition id | `post-normalization-v1` |
| Input per run | `results/runs/<run>/conversation-log.md` + `results/runs/<run>/recovered-model.yaml`, read-only |
| Evidence boundary | the transcript and the ontology. Nothing else — no fixture, no interviewer prompt, no scores |
| Model calls | exactly **one** per run |
| Output | `results/baselines/post-normalization-v1/<run>/` |
| Frozen prompt | `lib/normalizerPromptV1.mjs`, SHA-256 `a0f52cb08189eb4de142fa4b5c4b10299c3ccb101d574924274c60a423956489` |

### Models, and a deviation from `EXPERIMENT_BRIEF.md` §4.3

The brief requires the interviewer model to be held fixed at
`gpt-5.5-2026-04-23`. **That model was not reachable on the endpoint available
for this condition** (an Azure OpenAI resource whose deployment list contains
`gpt-5.1`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.6-sol`, `gpt-5-mini`, `gpt-4.1`,
`gpt-4o`, `gpt-4o-mini`, `o4-mini` — no `gpt-5.5`). This is a real deviation and
it is recorded here rather than smoothed over.

The choice made in response, and why:

* **Normalizer: `gpt-5.4` (resolved id `gpt-5.4-2026-03-05`)** — the nearest
  available model in the same family, and deliberately the **predecessor** of
  the anchor interviewer rather than a successor. A normalizer *stronger* than
  the interviewer that produced the ontology would confound the result: any
  improvement could be raw capability rather than the structural-review framing
  this condition is about. A normalizer no stronger than the interviewer cannot
  make that mistake. This makes the condition conservative in the direction that
  matters — it can understate a benefit, not manufacture one.
* **Judges: `gpt-5.6-sol` and `gpt-5.1`, neither of them the normalizer's
  model.** A judge sharing a model with the normalizer makes self-preference
  indistinguishable from a real quality difference. Two independent judges also
  give an inter-judge agreement rate, which is the only available read on how
  noisy this endpoint is at n=3.

Consequence for reading the numbers: the deterministic F1 comparison is still
exact (both arms are scored by the same offline scorer, and the *original* arm
is the frozen anchor model itself, produced on `gpt-5.5`), but the normalizer's
own capability is not identical to the anchor interviewer's. A future re-run on
`gpt-5.5-2026-04-23` — `EVAL_PROVIDER=openai NORMALIZER_MODEL=gpt-5.5-2026-04-23
node tests/evals/post-normalization.mjs …` — would close the deviation without
any code change.

No sampling parameters are sent. `temperature` and `max_tokens` are omitted
because the reasoning-tier models this runs on reject non-default values
outright (confirmed live; see `baseline-one-shot.mjs`'s request-body comment).
Provenance records `temperature: null` meaning *not sent*, not *sent as zero*.

---

## 3. What the normalizer is asked to do

The frozen v1 prompt (`lib/normalizerPromptV1.mjs`) casts the model as a
knowledge-engineering **reviewer**, not an interviewer, and gives it the
eight-category structural audit from issue #75 §4: context-dependent properties,
relationship direction, missing direct operational relationships, duplicated or
incorrectly split concepts, class/property boundary errors, action-input
reachability, unstructured semantic blobs, and unsupported structures.

Its stated objective is the **minimum justified structural edit**, with
"prefer no change over a speculative change" as the explicit tie-break. The
failure mode being guarded against is the opposite of the interviewer's: an
interviewer fails by under-eliciting, a reviewer fails by inventing.

It returns two blocks: one complete candidate ontology in the app's own export
grammar, and a change manifest (issue #75 §14) giving a type, summary, reason,
agent impact, before/after and transcript evidence per conceptual change.

**The manifest is rationale, not evidence.** The authoritative record of what
changed is the deterministic diff (`lib/ontologyDiff.mjs`), computed from the
two ontologies without asking the model anything. A model's account of its own
edits is exactly the kind of claim this repository's own eval reports have
already caught being wrong (see run-02's "assistant claims all recorded" entries).

---

## 4. Artifacts

Per run, under `results/baselines/post-normalization-v1/<run-id>/`:

| File | What it is |
|---|---|
| `recovered-model.yaml` | the candidate ontology. Named for the shared output contract (`EXPERIMENT_BRIEF.md` §5) so `score-baseline.mjs`, `cross-run-analyses.mjs` and `threshold-sensitivity.mjs` read it unchanged |
| `raw-response.md` | the model's untouched reply |
| `change-manifest.json` | the model's own account of its changes |
| `normalization-diff.json` / `.md` | the deterministic semantic diff — the authoritative change record |
| `baseline-provenance.json` | models (requested and resolved), request params, prompt/transcript/ontology SHA-256, token usage, validation result, diff summary |

At condition root: `frozen-inputs.sha256.json` (a hash of every frozen anchor
file the run opened), `metrics.md` (regenerated by the analysis script), and
`judge/` (verdicts plus every raw judge reply).

### Reproducing

```sh
npm install
# 1. candidates (3 model calls)
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com AZURE_OPENAI_API_KEY=... \
  node tests/evals/post-normalization.mjs run-01 run-02 run-03
# 2. blind structural judge (12 model calls: 3 runs x 2 orderings x 2 judges)
AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... \
  node tests/evals/judge-post-normalization.mjs run-01 run-02 run-03
# 3-5. deterministic scoring and analysis (no model calls)
node tests/evals/score-baseline.mjs post-normalization-v1 run-01 run-02 run-03
node tests/evals/cross-run-analyses.mjs --condition=post-normalization-v1 run-01 run-02 run-03
node tests/evals/threshold-sensitivity.mjs --condition=post-normalization-v1 run-01 run-02 run-03
node tests/evals/analyze-post-normalization.mjs run-01 run-02 run-03
```

Steps 3–5 need no API key and no network: every number in `REPORT.md` is
re-derivable from committed artifacts, the same property the interactive runs
have.

---

## 5. Pre-registered analysis plan

Fixed before execution. Encoded in `analyze-post-normalization.mjs` rather than
applied by hand, so it cannot be quietly reinterpreted once the direction of the
result is known.

### 5.1 Primary endpoint: the blind structural judge

Deterministic recovery F1 is **not** the primary endpoint for this condition,
and the reason is a property of the measurement, not a preference about the
outcome:

* The scorer measures agreement with a reference model that has its own
  conventions — flat classes, one directed edge per real-world connection,
  12 reciprocal predicate pairs collapsed into single scored units. Reifying a
  context-dependent property into an association concept is precisely what
  audit category A asks for, and against a fixture that models the same fact
  flatly it scores as a lost property plus two unmatched relationships. A
  *correct* normalization can therefore lower F1.
* At n=3, relationship F1 is the noisiest dimension in the whole program
  (4.9–15.7 across existing conditions), so a few points in either direction is
  not a detectable effect.

The primary endpoint is therefore the transcript-grounded blind A/B judge
(issue #75 §9), which asks the question the condition is actually about:
given only the evidence the ontology was built from, is the normalized model a
better shared representation for an agent?

### 5.2 How verdicts are aggregated

1. Each (run, judge) pair is judged **twice**, in both orderings. A judge's
   verdict for a run counts only if it **survives the swap**; if the two
   orderings disagree, that judge's verdict for that run is `unstable` and
   contributes no preference.
2. A run's outcome is `normalized` if at least one judge is stable for it and no
   stable judge preferred the original; `original` symmetrically; `tie`
   otherwise.
3. Adverse findings (material regressions, unsupported additions, competency
   coverage loss) are counted over **all four** verdicts for a run, stable or
   not: a defect a judge described is evidence regardless of which way its
   preference fell.
4. A run counts as **materially worse** for the normalized model if its outcome
   is `original`, or if a strict majority of its four verdicts reported at least
   one material regression in the normalized model.
5. Order-bias and inter-judge agreement rates are reported unconditionally. A
   judge that flips on a majority of runs is reported as uninformative rather
   than averaged in.

### 5.3 Success criteria (issue #75 §10)

| # | Criterion | Checked by |
|---|---|---|
| 1 | Production interviewer byte-identical throughout | `tests/agent-production-invariants.spec.mjs` (golden prompt SHA-256 + runtime tool surface) |
| 2 | No frozen anchor artifact modified | `tests/post-normalization.spec.mjs` (re-hashes every input the run read) |
| 3 | No unsupported domain content introduced | judge: no run where a majority of verdicts report unsupported additions in the normalized model |
| 4 | No rule or action disappears accidentally | deterministic diff: any rule/action removal must be claimed in the manifest |
| 5 | Competency/action coverage not materially reduced | judge: no run where a majority of verdicts report competency loss in the normalized model |
| 6 | Judge prefers normalized in a majority of runs and finds it materially worse in none | §5.2 |
| 7 | Relationship quality does not regress in aggregate | aggregate relationship F1 delta ≥ 0 (full domain) |
| 8 | Aggregate class/relationship/property F1 does not decrease | all three aggregate deltas ≥ 0 (full domain) |
| 9 | Any local regression inspected and explicitly reported | narrative, in `REPORT.md` |
| 10 | Changes correspond to the intended normalization categories, not generic expansion | manifest change-type distribution + inspection of the deterministic diff |
| + | Every candidate is applicable to the real graph | `tests/post-normalization.spec.mjs` round-trips each candidate through the app's own import path |

**Pre-committed exception clause for criteria 7 and 8.** If an F1 decrease is
traced to the scoring-convention mismatch described in §5.1 — a change the judge
endorses and the transcript supports, which scores worse only because the fixture
models the same fact in a different shape — it is reported as an inspected
exception with the specific items named, and it does **not** by itself convert a
positive judge result into a negative recommendation. It does lower the
recommendation ceiling: with any such exception in play, the strongest available
recommendation is **A1** (manual, opt-in) — never A2 or A3, which change the
production interviewer.

### 5.4 Recommendation mapping (issue #75 §12)

* **A (integrate)** requires criteria 1–8 to pass, subject to §5.3's exception
  clause. Sub-option A1 (UI-only opt-in), A2 (interviewer-offered opt-in) or A3
  (automatic post-Phase-9 proposal) is then argued explicitly, with A3 requiring
  a robust completion trigger to exist.
* **B (promising, insufficient evidence)** if the judge result is positive but a
  criterion fails, or if the endpoint is too noisy to read at n=3. B must name
  the smallest next experiment.
* **C (do not integrate)** if the normalizer invents unsupported content, loses
  competency coverage, or materially degrades the model.

In every case, implementation stops after the recommendation and waits for an
explicit integration decision (issue #75 §11).

---

## 6. Known limitations, stated up front

1. **n = 3, one fixture, one domain.** Same limitation the anchor runs carry
   (`README.md`, "A methodological limitation"). This condition inherits it in
   full: the three transcripts it normalizes are the same three the interviewer
   prompt was iterated against. Nothing here is evidence of transfer to an
   unseen domain, and B5 (held-out fixture) remains the highest-value untried
   condition in the program.
2. **The judge is an LLM.** It has no ground truth either; it is a strong reader
   of the transcript, which is the correct evidence boundary for this question
   but is not an oracle. Two judges and two orderings bound the noise; they do
   not remove it.
3. **The normalizer model is not the anchor interviewer's model** (§2).
4. **A single-shot reviewer cannot ask.** The normalizer's evidence boundary is
   closed by construction, so an ambiguity a human interviewer would resolve
   with one question must be left unchanged. This bounds how much of the
   structural gap this design can close at all, and it is a genuine argument for
   eventually pairing normalization with a review step where the user can answer
   — not a defect in the measurement.
5. **The deterministic scorer cannot see agent-readiness** (§5.1). It is a
   guardrail here, not a target.
6. **No human-subject data.** Same as everything else in this repository.

---

# Part II — condition `post-normalization-v2`

**Status: pre-registration.** Written and committed before the v2 normalizer was
ever called, for the same reason Part I was. Part I's result is already reported
in `results/baselines/post-normalization-v1/REPORT.md` and is not revised by
anything here.

## 7. Why v2, and what single factor it varies

v1 failed pre-registered criterion 6 on run-03, unanimously and at high
confidence, for two causes that the report traced to gaps in the *prompt* rather
than to unreliability in the model (REPORT.md §4):

* **(a)** v1 permits an action-input reachability defect to be "repaired" by
  rewording a rule condition rather than by changing the graph, which leaves the
  rule asserting navigation the model cannot support.
* **(b)** v1 gives no precedence rule when the one-edge-per-connection profile
  rule conflicts with a relationship the expert explicitly confirmed — and did
  not apply that profile rule consistently across runs anyway.

v2 adds exactly two constraints, one per cause, to v1's own `CONSTRAINTS` list.
**Single factor varied: those two constraints.** Everything else — role, evidence
boundary, the eight-category audit, the objective, the output grammar, the
manifest shape, the normalizer model (`gpt-5.4`), the three frozen anchor runs,
the judge prompt, the blinding salt, and the entire analysis path — is held
fixed.

That is enforced mechanically, not by inspection: `lib/normalizerPromptV2.mjs`
*constructs* v2 by inserting the two constraints into v1's string, and
`tests/post-normalization.spec.mjs` asserts that deleting the inserted block from
v2 reproduces v1 byte for byte. A future edit that reworded any shared part while
adding a third rule fails the default test suite.

v1 stays frozen at `a0f52cb0…`. v2 is `d0e35420…`, in its own module and its own
condition directory.

## 8. The widened judge panel

v1's outcome was decided by one run out of three, on a two-judge panel, one of
whose members flipped on the order swap once. That is not enough resolution to
carry an integration decision, and the fix is cheap.

The panel becomes **four** models — `gpt-5.6-sol`, `gpt-5.1` (the original pair),
plus `gpt-4.1-internal` and `o4-mini`. None is the normalizer's model or a
variant of it. Both orderings are still judged, so the design is 4 judges × 2
orderings × 3 runs = 24 verdicts per condition.

Two rules govern this, and both are fixed now rather than after the numbers
arrive:

1. **The widened panel is applied to v1 as well as v2.** Comparing a v2 judged by
   four models against a v1 judged by two would confound the treatment with the
   panel. v1's existing twelve replies are reused from disk verbatim — the judge
   never re-requests a cell it already has — so only the twelve new
   (judge × run × order) cells are called.
2. **v1's pre-registered result is preserved exactly.** The analysis reports the
   original two-judge panel's outcome, recomputed by filtering the same stored
   verdicts, alongside the full-panel outcome, and flags any run where the two
   disagree. Widening the panel is allowed to *add* information; it is not
   allowed to quietly redefine an outcome already published.

## 9. Success criteria

**Unchanged from §5.3.** The same ten criteria, the same aggregation rules in
§5.2, the same exception clause. They are evaluated on the full four-judge panel
for both conditions.

Additionally, and specific to v2, the two constraints are only shown to have
worked if the *specific* v1 failures are gone:

* no v2 candidate rewords a rule condition to reference a path the graph does not
  contain (checked by reading the rule diffs against the relationship diffs, and
  by whether any judge raises it);
* no v2 candidate removes a relationship the transcript shows the expert
  explicitly confirming.

A v2 that passes the ten criteria by making *no changes at all* has not
succeeded either — it has only become inert. The deterministic diff is reported
alongside, and a near-empty diff is called what it is.

## 10. The final keep/reject rule

Part I ended in "B — insufficient evidence", which was the honest answer but is
not a decision. This experiment ends in a binary recommendation:

* **KEEP** — the approach earns production integration, as **A1** only (a manual,
  opt-in "Review structure" action routed through the Ontology Change Review
  facility in preview mode; no interviewer change). Requires **all** of criteria
  3–8 to pass on the full panel, **and** both v2-specific checks in §9 to hold,
  **and** the deterministic diff to show the normalizer still doing substantive
  work rather than nothing.
* **REJECT** — do not integrate. Recommended if v2 is materially worse in any
  run, or introduces unsupported content or competency loss in a majority of any
  run's verdicts, or turns out to have gone inert.

**If the evidence lands ambiguous, the recommendation is REJECT.** Integration is
the action that carries the risk — it puts a component that can rewrite a model
the user has already confirmed into a shipping product — so the burden of proof
sits on integration, not on leaving things as they are. An ambiguous REJECT will
say exactly what it is and what would overturn it, rather than being dressed up
as a clean negative.

Either way, implementation stops at the recommendation and waits for an explicit
decision (issue #75 §11).
