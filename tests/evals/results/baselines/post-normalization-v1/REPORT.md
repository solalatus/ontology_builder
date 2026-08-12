# `post-normalization-v1` — results and recommendation

Experiment specified by [issue #75](https://github.com/solalatus/ontology_builder/issues/75).
Methodology and the **pre-registered** analysis plan: `../../../POST_NORMALIZATION.md`
(committed before any candidate existed — see `git log`).
Every table below is regenerated offline by
`node tests/evals/analyze-post-normalization.mjs run-01 run-02 run-03`, which
writes `metrics.md` alongside this file. No API key is needed to re-derive them.

---

## 0. Headline

A dedicated post-interview structural review pass, run on the finished
transcript and ontology of each frozen anchor run, changed very little (1–6
semantic edits against models of 670–890 lines), stayed inside the intended
normalization categories, invented no domain content in two runs of three, and
**was preferred by blind transcript-grounded judges in 2 of 3 runs**. In the
third run it was **unanimously rejected**, at high confidence, by both judges in
both orderings, for a specific and diagnosable reason.

The deterministic recovery scorer detected **nothing at all**: 17 of 18
run × dimension × scope cells moved by exactly 0.0 points, and the eighteenth by
+0.1.

Pre-registered success criterion 6 therefore fails, and with it criteria 3 and 5.

**Recommendation: B — promising, insufficient evidence to integrate.** The
smallest next experiment is specified in §7. Implementation stops here, per
issue #75 §11.

---

## 1. Invariants

| Check | Result |
|---|---|
| Production interviewer prompt, before | `sha256:3554cef37978da3cf8eeef502182fd722e229d881260e7324cf4e6a75a2c173f` (en), `sha256:e484350e1e111505d949b89c3218bb8040c99fca2e09c2e95c6518940e8775f5` (hu) |
| Production interviewer prompt, after | **identical** — same two hashes |
| Production tool surface changed | **no** — `apply_ontology_yaml`, `get_graph_state`, in that order, asserted on a real outgoing request |
| Normalization tool reachable from an interview | **no** |
| `index.html` changed | **no** — byte-identical to `origin/main` |
| Frozen run artifacts changed | **no** — every transcript and ontology the run read was hashed at read time and is re-verified on every ordinary test run |

The first four are enforced by `tests/agent-production-invariants.spec.mjs` and
the last by `tests/post-normalization.spec.mjs`; both are in the default suite,
so they fail on an ordinary CI run rather than only when someone remembers to
check. This is stronger than the "before/after hash" issue #75 §1 asked for: the
invariant is now permanently guarded rather than observed once.

---

## 2. Deterministic metrics

Original = the interactive anchor run's own ontology. Normalized = the candidate
produced from it. Heuristic pass, one-to-one scorer, both denominators.

### Aggregate F1 (mean of 3 runs)

| Scope | Dimension | Original | Normalized | Δ |
|---|---|---|---|---|
| Full domain | classes | 43.4 | 43.4 | +0.0 |
| Full domain | relationships | 9.9 | 9.9 | +0.0 |
| Full domain | properties | 20.5 | 20.5 | +0.0 |
| Practical | classes | 63.9 | 63.9 | +0.0 |
| Practical | relationships | 15.5 | 15.5 | +0.0 |
| Practical | properties | 18.4 | 18.4 | +0.0 |

Per run, every cell is +0.0 except run-03 practical relationships (+0.1). No
edge was discarded for naming an undeclared endpoint class in either arm. Full
per-run precision/recall/F1 tables are in `metrics.md` §1.

`cross-run-analyses.mjs` and `threshold-sensitivity.mjs` were run on the
condition as `EXPERIMENT_BRIEF.md` §6 requires. Both produce output **identical
to the interactive arm's**: same set-level stability (classes Jaccard 0.48–0.71,
relationships 0.20–0.31, properties 0.30–0.46), same endpoint-conditioned
relationship recovery (43% / 35% / 12%), and `class F1 > relationship F1` in
60/60 threshold combinations.

**This is itself a finding, and it was predicted in the pre-registration (§5.1).**
Criteria 7 and 8 pass — aggregate F1 did not decrease — but they pass
*vacuously*. They did not measure that quality was preserved; they measured that
nothing the normalizer did is visible to a metric computed as agreement with a
fixed reference model. A structural review that reshapes rule conditions,
splits an overloaded predicate, or repairs a value set is invisible to recovery
F1 by construction. For any future work on structure, F1 is a guardrail against
catastrophe, not an endpoint.

---

## 3. Blind structural judge (primary endpoint)

Two judge models, neither of them the normalizer's; every pair judged in both
orderings; a judge's verdict counts only if it survives the swap.

| Run | gpt-5.1 (primary / reversed) | gpt-5.6-sol (primary / reversed) | Outcome | Materially worse? |
|---|---|---|---|---|
| run-01 | normalized / normalized | normalized / normalized | **normalized** | no |
| run-02 | original / tie *(unstable)* | normalized / normalized | **normalized** | no |
| run-03 | original / original | original / original | **original** | **YES** |

Order-bias: gpt-5.1 flipped on 1 of 3 runs, gpt-5.6-sol on 0 of 3.
Inter-judge agreement: 2/2 on the runs where both judges were stable.

Adverse findings, counted over all four verdicts per run (pre-registered):

| Run | Material regressions (norm / orig) | Unsupported additions (norm / orig) | Competency loss (norm / orig) |
|---|---|---|---|
| run-01 | 2/4 vs 4/4 | 0/4 vs 0/4 | 2/4 vs 2/4 |
| run-02 | 2/4 vs 2/4 | 1/4 vs 0/4 | 1/4 vs 2/4 |
| run-03 | 3/4 vs 2/4 | 4/4 vs 2/4 | 4/4 vs 1/4 |

**Post hoc, explicitly not pre-registered.** A judge reviewing two nearly
identical models often reports the same *pre-existing* defect against both. The
counts above cannot separate "the normalizer introduced this" from "the
interview already had this". Restricting to verdicts where only the normalized
arm drew the finding:

| Run | Material regressions | Unsupported additions | Competency loss |
|---|---|---|---|
| run-01 | 0/4 | 0/4 | 0/4 |
| run-02 | 0/4 | 1/4 | 0/4 |
| run-03 | 1/4 | 2/4 | 3/4 |

Concretely: both gpt-5.6-sol verdicts for run-03 list a `canDeclareMajorIncident`
tier-1/tier-2 narrowing as an unsupported addition **in whichever model they were
reviewing** — and the deterministic diff shows that rule is semantically
identical in both arms (the only textual difference is YAML quoting). That
criticism is of the interview, not of the normalizer. This decomposition is
reported because it is true, **not** to revise the verdict: the criteria table in
§5 uses the pre-registered counts.

---

## 4. What the normalizer actually did

| Run | Semantic changes | Classes | Relationships | Properties | Rules | Actions |
|---|---|---|---|---|---|---|
| run-01 | 6 | — | +3 / −3 | — | — | — |
| run-02 | 1 | — | — | 1 changed | — | — |
| run-03 | 4 | — | −1 | — | 3 changed | — |

Self-declared change types: `repair-action-reachability` ×5,
`split-conflated-concept` ×1. Nothing was categorised as generic expansion, no
class was added or removed anywhere, and **no rule or action was ever deleted**
(criterion 4 passes). Both candidates and originals validate clean against the
app's grammar, and each candidate round-trips through the app's real YAML import
path without losing a single class, relationship, property, rule or action —
which is direct evidence that a future `Apply` (issue #80 §14) has a working
commit path to build on.

### run-02 — a verifiable hit

The single edit was adding `approved` to `RegulatoryNotification.status`'s
allowed values, because `canSendRegulatoryNotification` requires that status.
This is **exactly** the defect this repository's own independent conversation
review of run-02 recorded at the time:

> **Turn 43:** `canSendRegulatoryNotification` requires notification status
> `approved`, but earlier allowed values for `RegulatoryNotification.status` did
> **not** include `approved` … This is a real contradiction that the interviewer
> missed.
> — `results/runs/run-02/report.md`

The normalizer found it independently, from the transcript alone, with no access
to that review. This is the strongest single result in the experiment: an
internal contradiction that survived a 51-turn staged interview *and* its own
Phase-9 validation pass was caught by one review call. Whatever else is true, a
post-hoc structural pass can find things the interview cannot.

### run-01 — endorsed, but arguably out of scope

`escalatedTo` was used for three edges from `Incident` to three different owner
classes; the normalizer split it into `escalatedToServiceOwner`,
`escalatedToApplicationOwner` and `escalatedToTechnicalOwner`. All four verdicts
preferred the result, and material regressions dropped from 4/4 to 2/4. Note
that the original modelling was not actually broken — three directed edges with
one predicate name to three different target classes is legal and unambiguous —
so this is a readability improvement the judges liked more than a structural
repair. It cost nothing on the scorer.

### run-03 — the failure, and it is the interesting part

Two distinct failure modes, both worth naming precisely because they are
fixable and neither is "the model was careless":

**(a) A reachability defect repaired in the wrong layer.** The normalizer
correctly diagnosed that `canNotifyStakeholders`, `canGeneratePostIncidentReview`
and `canCloseIncident` reference `Incident` facts from actions whose input class
is `StakeholderCommunication` / `PostIncidentReview`, while every linking edge
points `Incident → record` — the wrong direction to traverse. That diagnosis is
right, and both judges independently confirmed the defect exists in the original
too. But the repair was made **in the rule's natural-language text**, rewording
conditions to "the related Incident has status…", rather than in the graph. The
rule now asserts navigation the model cannot support, turning a latent defect
into an explicit inconsistency. Every judge caught this:

> Rule `canNotifyStakeholders` … refers to 'The related Incident' and its impact
> and status, but `StakeholderCommunication` has no modeled relationship back to
> `Incident`, making those conditions unreachable from the rule's perspective.
> — gpt-5.1, reversed order

This is a **prompt defect, not a model defect**. Audit category F is the one
category where a text-level edit is available and wrong, and v1 never says that
a reachability repair must be a relationship change. A v2 can state it in one
sentence.

**(b) A profile rule applied over explicit expert evidence.** The normalizer
removed `MonitoringSystem → generates → Alert` as an inverse duplicate of
`Alert → originatedFrom → MonitoringSystem`. Under the MTSR profile that removal
is *correct* — "exactly one directed edge per real-world connection, never also
its inverse" — and this repository's own deterministic validator independently
flags that exact pair as a violation in the original. All four judges
nevertheless counted it as a loss, because the transcript shows the expert
confirming the edge and because it removes source-first navigation from a
monitoring system to its alerts.

Both readings are defensible, and they conflict. The judges were never told the
profile, so they are not authoritative about profile compliance; equally, the
normalizer was told to preserve competency coverage and did not weigh that
against the profile rule. **v1 gives no precedence rule for this conflict, and
that gap is a real finding about the specification, not only about this run.**
Note also that the same inverse-pair violation exists untouched in run-01 (two of
them) and run-02 (one) — so v1 is not even consistent with itself about when the
profile rule applies.

---

## 5. Pre-registered criteria, cost, and execution history

| # | Criterion | Result |
|---|---|---|
| 1 | Production interviewer byte-identical | **PASS** |
| 2 | No frozen anchor artifact modified | **PASS** |
| 3 | No unsupported domain content introduced | **FAIL** (run-03) |
| 4 | No rule/action disappears accidentally | **PASS** |
| 5 | Competency/action coverage not materially reduced | **FAIL** (run-03) |
| 6 | Judge prefers normalized in a majority of runs, materially worse in none | **FAIL** (2/3 majority met; run-03 materially worse) |
| 7 | Relationship quality does not regress in aggregate | PASS (vacuously — see §2) |
| 8 | Aggregate class/relationship/property F1 does not decrease | PASS (vacuously — see §2) |
| 9 | Local regressions inspected and reported | **PASS** — §4 |
| 10 | Changes match the intended categories, not generic expansion | **PASS** |
| + | Every candidate applicable to the real graph | **PASS** |

### Cost

| | Calls | Tokens |
|---|---|---|
| Normalizer (`gpt-5.4-2026-03-05`) | 3 | 215,220 (measured) |
| Judge, final execution | 5 | 360,359 (measured, ~72k/call) |
| Judge, earlier interrupted executions | 11 | ~792,000 (estimated at the measured per-call rate) |
| **Total** | **19 completed calls** | **≈1.37M tokens** |

No interview was re-run; the persona was never invoked. For scale, one anchor
interview is ~135 API calls and ~1000s of wall clock, and re-running the anchor
distribution would be three of those.

### Execution history, in full

The judge batch was executed three times. Nothing about the prompts, the models,
the blinding or the two ontologies changed between them — only the harness:

1. **Batch A (4 calls, discarded).** Aborted: a reply arrived as a well-formed
   verdict inside an *unterminated* ```json fence, which the parser could not
   read. Raw replies preserved in `judge/raw-aborted-parser-bug/`, with the four
   verdicts it produced listed there, so that re-running cannot be mistaken for
   quietly discarding an unfavourable first result.
2. **Batch B (7 calls, kept).** Aborted on an Azure tokens-per-minute 429 that
   the repository's shared 4-attempt/4-second backoff cannot outlast.
3. **Batch C (5 calls, kept).** Reused batch B's stored replies verbatim and
   issued only the 5 missing calls.

The reported analysis uses batches B and C — twelve verdicts, one per cell, none
of them re-rolled. Three harness changes came out of this and are
regression-tested: the parser accepts unterminated fences and bare objects; an
unreadable reply is recorded and the batch continues, exiting non-zero; and a
stored raw reply is always reused rather than re-requested, so no cell can ever
be sampled twice.

---

## 6. What this means, beyond the pass/fail

**A structural review pass finds things a staged interview does not.** run-02 is
the proof: a contradiction between a rule and a value set, missed by the
interviewer and by its own Phase-9 validation, found from the transcript alone in
one call. This is not a marginal claim about scores; it is a defect class the
interview demonstrably cannot self-detect, because the interviewer is validating
the model it just built with the expert's agreement.

**But v1 also demonstrates the reviewer's characteristic failure.** Given a real
defect it cannot fix within its evidence boundary, v1 rewrote prose so the defect
*reads* as fixed. That is the reviewer-side analogue of the interviewer's
"overstates coverage" failures the anchor reports already document. It is
correctable by specification, and it is exactly what a preview-before-apply
review step exists to catch — a human looking at run-03's rule diff would see the
problem immediately.

**Consequences for issue #80, if preview mode is built:**

* The Apply path is viable: candidates validate and round-trip losslessly.
* **The review dialog's Rules section cannot be a second-class citizen.** All of
  run-03's damage is in rule-condition wording. It is completely invisible in a
  graph before/after view, and visible only at the details and raw-YAML levels.
  A preview UI that leads with the graph diff would have shown a user four
  "changes" and one removed edge, and hidden the actual problem.
* Whole-candidate Apply/Reject (issue #75 §15) would have forced a run-03 user to
  reject all four changes to avoid three bad ones. That is the right first
  version — per-change application needs dependency modelling — but it is worth
  recording that the coarse granularity has an observed cost, not only a
  theoretical one.

**Consequence for the paper.** The concept–structure gap survives a fifth
condition. Recovery F1 moved by 0.0 points under a pass that made real,
judge-endorsed structural changes — further evidence that the gap is not
something the elicitation machinery produces, and new evidence that the metric
itself cannot see structural quality at all.

---

## 7. Recommendation: **B — promising, insufficient evidence**

Not **C**: the normalizer never expanded the domain, never removed a rule or
action, made 1–6 edits against 670–890-line models, produced applicable
candidates in every run, was preferred 2 of 3 runs by independent blind judges,
and scored one verifiable, independently-corroborated hit. That is not an
unreliable component.

Not **A**: criterion 6 fails on a real regression, and the failure is not noise —
it is unanimous across two judge models and both orderings, at high confidence,
with a concrete mechanism. Integrating a pass that can rewrite rule conditions
into claims the graph does not support would put a defect *into* a model that a
user has already confirmed.

### What blocks integration, precisely

1. v1 permits a reachability repair to be made in rule text rather than in the
   graph (§4a).
2. v1 gives no precedence rule for profile-versus-expert-evidence conflicts, and
   applies the profile rule inconsistently across runs (§4b).
3. n = 3 with a 2–1 split is not a distribution. The primary endpoint is an LLM
   judge, and one run decided the outcome.

### The smallest next experiment

**v2, one protocol re-run, ~1.1M tokens and no interview:**

* Add exactly two constraints to the normalizer prompt, as
  `POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V2` in its own module and its own
  condition directory (`post-normalization-v2`), leaving v1 frozen:
  1. *A reachability repair must be expressed as a relationship change. Never
     reword a rule so that it references a path the graph does not contain; a
     rule may only reference navigation the modeled relationships support.*
  2. *Where the one-edge-per-connection profile rule conflicts with a
     relationship the expert explicitly confirmed, keep the expert's
     relationship and change nothing.*
* Re-run the identical protocol on the same three frozen runs: 3 normalizer
  calls, 12 judge calls, same judges, same blinding, same pre-registered rule.
* Pre-register the same criteria unchanged **before** running.

Two further things worth doing, in this order:

* **Raise judge n before trusting any verdict at this margin.** Two more judge
  models over the same 6 cells (12 more calls) would turn a 2–1 run split into
  something with an error bar. Cheap, and it strengthens or kills the endpoint
  itself rather than the treatment.
* **B5 (held-out fixture) remains the binding external-validity limitation** for
  the whole program, this condition included. All three transcripts here are the
  ones the interviewer prompt was iterated against. Normalization is unusually
  cheap to evaluate on a new domain — one interview, then one extra call per
  condition — so it is a good passenger on that experiment rather than a reason
  to run it separately.

### If integration is later approved anyway

The evidence supports **A1 and only A1** — a manual, opt-in "Review structure"
action, no production interviewer change, every proposal shown through the
general Ontology Change Review facility in preview mode before anything is
applied. A2 and A3 change or trigger from the interviewer and would need the
fresh non-regression evaluation of issue #75 §17; nothing here justifies paying
for that yet. A3 is additionally unsupportable on its own terms: it needs a
reliable Phase-9 completion signal, and this repository's own stopping
classifier has already been observed running 160+ turns past a finished
interview (`README.md`, "What it does").

**Implementation stops here and waits for an explicit decision** (issue #75 §11).
