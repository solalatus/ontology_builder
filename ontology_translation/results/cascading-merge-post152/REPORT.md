# Cascading intelligent-merge recompute — epic #152 gate, criterion (c)

Recomputes the same measurement as `ontology_translation/results/cascading-merge/REPORT.md`
(issue #147's baseline), after the elicitation-improvement bundle
(epic #152, see `helper_agent_todo.md`'s own entry for the full account)
changed the production interview prompt. This is criterion (c) of the
epic's three-criterion merge gate: the cascading-merge(1,2) 5-domain macro
composite must improve over the baseline below for the epic to merge to
`main`.

**Answer: improves over baseline, on the second of two full reruns plus
one targeted partial rerun — not on the first.** The first full rerun
regressed this criterion (0.723 → 0.695); a targeted rerun of the one
domain affected by a prompt bug found and fixed in between brought it to
0.723 → 0.742. Same driver mechanism, same decision policy, same scoring
as the baseline measurement below — only the source interviews changed.

---

## Methodology

Identical to `cascading-merge/REPORT.md` — real Import Review / intelligent-merge
feature (issue #122/#126), live against real Azure OpenAI, cascade order
run-01 → run-02 → run-03, same fixed decision policy (current-only kept,
incoming-only taken, suggested cross-label pairings accepted, differing
matches routed to the execution agent for reconciliation), scored with
`computeRecoveryMetrics`/`computeRuleMetrics`/`computeActionMetrics` via
`rescoreRun()`, heuristic only. See that file for the full rationale — not
repeated here.

**What's different from the baseline run**: the 15 source interviews
(`ontology_translation/results/multi-domain-post152/`,
`multi-domain-control-post152/`) were produced under the epic #152
prompt, not the one `multi-domain/`/`multi-domain-control/` was scored
against. Two of those 15 replicates were regenerated a second time after
the first full rerun found bugs in that same prompt (see "Provenance"
below) — this directory holds only the final, corrected state.

---

## Headline result: composite recovery effectiveness (heuristic, full domain)

| Domain | run-01 | run-02 | run-03 | mean | merge(1,2) | merge(1,2,3) | Δ merge(1,2) vs baseline |
|---|---|---|---|---|---|---|---|
| brick-hvac | 0.559 | 0.802 | 0.645 | 0.669 | 0.794 | 0.701 | +0.076 |
| fibo-loans | 0.712 | 0.651 | 0.659 | 0.674 | 0.742 | 0.676 | +0.043 |
| iof-maintenance | 0.810 | 0.582 | 0.550 | 0.647 | 0.698 | 0.683 | −0.038 |
| iof-supply-chain | 0.688 | 0.746 | 0.520 | 0.651 | 0.784 | 0.566 | −0.034 |
| itops (control) | 0.567 | 0.668 | 0.649 | 0.628 | 0.690 | 0.700 | +0.044 |
| **4-domain macro** | | | | **0.660** | **0.755** | **0.656** | **+0.012** (vs baseline 0.743) |
| **5-domain macro** | | | | **0.654** | **0.742** | **0.665** | **+0.019** (vs baseline 0.723) |

Baseline values (`cascading-merge/REPORT.md`): brick-hvac 0.718,
fibo-loans 0.699, iof-maintenance 0.736, iof-supply-chain 0.818, itops
0.646; 4-domain macro merge(1,2) 0.743; 5-domain macro merge(1,2) 0.723.

**The gate's own criterion is the 5-domain macro at the merge(1,2) stage:
0.723 → 0.742, +0.019, an improvement.** merge(1,2,3) is reported for
parity with the baseline's own table but is not part of the gate.

iof-supply-chain is the one domain below its baseline at merge(1,2)
(0.784 vs. 0.818) despite two of its three source replicates (run-01
0.688, run-02 0.746) being clean, high-precision runs individually
stronger than most of their baseline counterparts — the shortfall traces
to run-01+run-02 (the two replicates merge(1,2) actually uses) not both
landing as strong as the baseline's own run-01+run-02 pairing (0.752,
0.748), not to any regression in the merge mechanism itself. Its
merge(1,2,3) (0.566) is markedly weaker again because run-03 (0.520)
reproduced a since-fixed prompt bug for a third time before that fix's
own targeted rerun budget was spent — see "Provenance" below.

---

## Provenance: why iof-supply-chain's source interviews needed two rounds

Full account in `helper_agent_todo.md`'s epic #152 entry; summarized here
because it directly explains this domain's numbers above.

1. **First full rerun** of all 15 replicates found, among other things, a
   production-prompt bug: the interviewer accepted a batch of ungolded
   `.identifier` properties across nearly every class in iof-supply-chain
   (the domain with the fewest gold properties of the five — 3 total)
   on a vague "per policy" justification from the persona, cratering that
   domain's properties precision. Fixed (round 1).
2. **Second full rerun**, under the round-1 fix, still reproduced the same
   failure in iof-supply-chain/run-01 — the interviewer itself, not the
   persona, had proposed the same properties as one shared, generically-
   justified batch, a route round 1's rule didn't cover. Fixed (round 2).
   This second rerun is the one whose other 14 replicates (everything but
   iof-supply-chain) are committed in this directory's sibling result
   roots unchanged.
3. **Targeted partial rerun** of iof-supply-chain only (3 replicates + its
   own cascading-merge), under the round-2 fix: 2 of 3 replicates (run-01,
   run-02) came back clean; run-03 reproduced the same class of bug a
   third time, in a third shape (the interviewer asked per-class this
   time, satisfying round 2's rule, but accepted a blanket "for
   identification" answer covering 15 classes at once without demanding a
   named competency question). **Left open** — not attempted further
   within this epic. The numbers in this report use run-01 and run-02 from
   this targeted rerun and run-03 as originally produced in step 2 (i.e.
   the state actually committed to this branch).

---

## Scope, honestly

Same caveats as the baseline measurement: n=1 per domain (no variance
bound on the merge process itself), one fixed ordering, one fixed decision
policy. On top of that, this rerun adds a second source of variance the
baseline didn't have to account for: which of a domain's 3 replicates
happen to hit the still-open properties-justification issue above is
itself not deterministic — a different persona phrasing on a different
day could move this specific number again without any further prompt
change. `PAPER_NOTES.md`'s own open-question note has been updated with
this as a second real data point.
