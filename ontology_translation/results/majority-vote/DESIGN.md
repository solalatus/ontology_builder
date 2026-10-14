# Majority-vote merge of three interviews: pre-registered design (issue #174, phase 1)

Committed before any result was computed. Results and the report follow in
later commits; any deviation from this note is recorded in the report.

## Question

With three independent interviews and no gold standard, is it better to
combine them by **vote** (keep what at least two found) than by the
existing LLM **cascade** (merge 1+2, then fold in 3)? The cascade's
two-way stage helped (5-domain composite 0.654 single-run mean → 0.742);
its three-way stage hurt (→ 0.665).

## Data (all committed; no re-runs, no API calls)

| Era | Interviews (3 per domain) | Cascade baselines |
|---|---|---|
| current prompt (primary) | `results/multi-domain-post152/` (brick-hvac, fibo-loans, iof-maintenance, iof-supply-chain), `results/multi-domain-control-post152/` (itops) | `results/cascading-merge-post152/<domain>/merge-1-2`, `merge-1-2-3` |
| pre-#152 prompt (replication) | `results/multi-domain/`, `results/multi-domain-control/` | `results/cascading-merge/<domain>/merge-1-2`, `merge-1-2-3` |

Gold: `ontology_translation/domains/<domain>/reference.domain.yaml`, the same
files every run and merge was scored against.

## Arms, per domain and era

| Arm | Built from | Needs gold to build? |
|---|---|---|
| run-01, run-02, run-03 | committed interviews | no |
| merge(1,2), merge(1,2,3) | committed LLM cascade | no |
| **union** | element groups found in ≥ 1 of 3 runs | no |
| **majority** | element groups found in ≥ 2 of 3 runs | no |
| **intersection** | element groups found in all 3 runs | no |
| **union(1,2)** | runs 1 and 2 only, ≥ 1 of 2: the deterministic counterpart of merge(1,2), same input pair | no |
| **best pair** | the union of the pair chosen without gold (below) | no |

union(1,2) is a control: against merge(1,2) it separates "deterministic vs.
LLM reconciliation" from "vote vs. cascade", which the comparison of majority
with merge(1,2,3) mixes.

## Grouping (which elements of different runs are "the same")

- Matching uses the project's own heuristic matcher, the one the scores come
  from: each run is loaded as a reference model
  (`loadGroundTruthModel({ format: "domain-yaml" })`) and matched against the
  other run's recovered state (`recoveredStateFromYaml`), for the three pairs
  (1,2), (1,3), (2,3), lower-numbered run as reference.
  - classes: `matchClasses`
  - properties: `matchProperties`, under that pair's class matching
  - relationships: `matchRelationships`, under that pair's class matching. A
    run's reciprocal pair (A→B plus B→A, merged into one unit by the loader)
    is one element.
  - rules: `matchRules`; actions: `matchActions`
- Elements become nodes; every pairwise match becomes an edge with the
  matcher's own weight. Groups are built by adding edges **strongest first**
  (ties: pair order, then element ids). An edge that would put two elements of
  the **same run** in one group is skipped and recorded as a **conflict**.
- Support of a group = the number of runs it contains (1–3).

## Building a model from groups

- **Classes:** kept if support ≥ threshold. The **representative** is the
  member from the lowest-numbered run; its name, meaning and aliases are used
  unchanged (no alias enrichment from other members).
- **Properties:** kept if support ≥ threshold and their class's group is kept;
  representative's name, type and allowed values unchanged (no value voting;
  controlled-value fidelity is not reported for most domains).
- **Relationships:** kept if support ≥ threshold and both endpoint class
  groups are kept; the representative unit is emitted (both directions for a
  reciprocal unit) with endpoints renamed to the representative class names.
  Exact duplicates are dropped.
- **Rules:** kept if support ≥ threshold; representative body.
- **Actions:** kept if support ≥ threshold and the input class group is kept;
  input renamed to the representative; preconditions remapped to kept rule
  representatives of the same run, others dropped.
- **Name collisions** (two kept groups with the same representative name) keep
  the higher-support group's name; the other gets a numeric suffix and is
  counted.
- Competency questions: the representative run's list (not scored).

Thresholds: union 1, majority 2, intersection 3; union(1,2) and best pair use
only their two runs with threshold 1.

## Best pair without gold

For each pair, build its union and run the app's deterministic consistency
checker (`computeOntologyFindings`, in a page). Choose the pair with the
fewest errors plus warnings; ties by the fewest connected components (over
relationships, undirected); then the lowest pair.

## Scoring

Every arm is scored with `rescoreRun()` (`tests/evals/rescore-saved-run.mjs`),
the function the cascade baselines were scored with: heuristic only, full
domain. It reproduces the committed baseline scores exactly. Reported per arm:
composite recovery effectiveness; classes, relationships, properties
precision / recall / F1; rule F1; action identification F1.

**Primary outcome:** 5-domain macro composite (equal weight per domain),
current-prompt era, **majority vs. merge(1,2,3)** and **majority vs.
merge(1,2)**. Secondary: union(1,2) vs. merge(1,2); best pair; the same
comparisons in the pre-#152 era as a replication.

**Review load** (the cost of "vote, then review"): in the majority arm, the
number of support-1 groups per element type plus the conflicts — what a human
would have to look at.

## What would count as convincing

Stated before results: majority beats merge(1,2,3) on the primary outcome
**in both eras**, and is at least level with merge(1,2) in at least one era,
with a review load a person could reasonably work through. Anything less is
reported as not convincing.

## Caveats (to be repeated in the report)

- n = 3 runs per domain, one fixed run labelling; per-domain differences are
  single data points.
- The vote is deterministic, the cascade is an LLM merge: union(1,2) vs.
  merge(1,2) is the control for that difference.
- Heuristic scoring only, as the baselines; it matches wording, and the vote
  keeps one run's wording while the LLM merge rephrases. LLM-based scoring is
  phase 2 of #174.

## Implementation note

If convincing, a UI version may follow. The grouping and voting core is
therefore written as pure functions over model documents (no file access),
producing groups with support counts and a review queue that maps onto the
app's Import Review.
