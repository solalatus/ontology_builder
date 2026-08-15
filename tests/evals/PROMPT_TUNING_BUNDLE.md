# Prompt/behavior-tuning bundle: 8 ideas from a ground-up review

Pre-registered before either arm is run. Follows `PHASE6_CONSTRAINT_FIX.md`'s
own section structure (factor, design, measures, qualitative questions, pass
criteria, limitations, results), itself following `CQ_NON_REGRESSION.md`. The
one deliberate departure from both: this eval's measures are **qualitative-
first**, not F1-first — six of the eight ideas here are invisible to
`recoveryMetrics.mjs` by construction (no rules/actions scoring exists, and
"did the interviewer stop offering false skip-ahead choices" isn't an F1
dimension at all). Treating F1 as the only signal would fly blind on 6 of 8
ideas, so this document specifies what transcript evidence counts as pass/fail
for each of those before any run happens, the same discipline the numeric
pass criteria get elsewhere.

## 0. How this list was produced (for context, not re-derived here)

A ground-up review (three parallel research passes: full history of every
prior prompt-tuning change in `helper_agent_todo.md`, every eval report's
qualitative findings, and a fresh open-ended read of transcripts across
multiple conditions) plus direct reading of the live prompt text produced 12
candidate ideas. The user selected 8 of them (numbered as originally
presented) and explicitly rejected 4 (illustrative-vs-confirmed distinction,
atomization dedup guard, recap-redundancy reduction, `get_graph_state`
frequency nudge) as not worth pursuing this round. This document covers only
the 8 kept ideas.

## 1. The single factor varied, and the idea-to-edit map

The **interviewer's system prompt**, in nine locations, and nothing else.
Several kept ideas touch more than one location (reconciling the two
near-duplicate "final check" lists and applying uniform closing discipline is
one idea realized in three places):

| Idea | What it targets | Edit location(s) |
|---|---|---|
| #1 — rule/action authoring-time consistency | the single most corroborated finding across every eval this project has run: rules/actions referencing properties or values that don't exist in the model | Phase 7 (rules), Phase 8 (actions, effect/verification text) |
| #2 — no false "skip ahead?" choice on incomplete phases | doubly corroborated: the harness's own `appearsFinished` bug and the #96 investigation's Phase 6 deferral evidence both trace to this exact pattern | GROUND RULES (new bullet) |
| #3 — reconcile duplicate checklists, apply closing discipline uniformly | `AGENT_KNOWLEDGE`'s own "Final check" duplicates Phase 9(b) verbatim including the same weak wording, untouched by the #96 fix attempt; phases with strong closing discipline get elaborate checklist items, phases without get thin-to-absent ones | Phase 5 (closing check added), Phase 9(b) checklist (three items strengthened/added), `AGENT_KNOWLEDGE` Final check item 5 |
| #5 — Phase 6 batch cap + per-item justification | an observed control/treatment difference in the #96 transcripts that was never itself the tested variable — isolated here per that eval's own recorded smaller-fallback suggestion | Phase 6 |
| #6 — adaptive alias-elicitation stopping | six consecutive "none" answers didn't stop the interviewer opening a seventh alias batch | Phase 5 |
| #7 — harden against echoed-state confusion | a real correctness bug, not just inefficiency: one transcript needed five separate self-corrections after mistaking echoed text for a genuine new confirmation | GROUND RULES (new bullet) |
| #8 — name inverse-relationship-pair duplicates explicitly | this exact, deterministically-flagged defect recurs untouched across multiple runs despite the validator catching it every time | CONSISTENCY CHECK |
| #10 — never end on a dangling open question | the best transcript in the whole sample ends fully resolved; several others simply stop mid-negotiation, especially exactly when real gaps exist | Phase 9 closing paragraph |

The exact before/after text for all nine edits is in
`tests/evals/prompt-tuning-bundle.mjs`'s `OLD_*`/`NEW_*` constants, each
applied via a verified, exactly-once `String.replace()` — a live prompt that
has drifted from what this file assumes aborts the run rather than silently
testing stale text (same discipline `phase6-constraint-fix.mjs` established).
Tool descriptions, app code, storage, importers, scorer, fixture and persona
are identical in both arms.

## 2. Design

| Arm | Interviewer prompt |
|---|---|
| `control` | shipped prompt, unmodified (current `main`, hash-verified against `0173b3f3…`) |
| `treatment` | shipped prompt + all nine edits above |

**Five interviews per arm (`n = 5`), not three.** Explicit, deliberate
upgrade from the `n = 3` every prior eval in this project used, because
`PHASE6_CONSTRAINT_FIX.md`'s own confound hunt proved the baseline itself has
large run-to-run variance (the *identical* unmodified prompt scored 1/9/11
allowed-value lists in one `n=3` batch and 22/13/22 in another, with every
other variable ruled out) — `n=3` was demonstrably not enough to separate a
real effect from that noise for at least one of this bundle's measures, and
this bundle carries more hypotheses than that eval did.

Same model configuration as every prior eval in this line: interviewer
`gpt-5.4`, persona `gpt-4o-mini-internal`, classifier `gpt-5.4`, 120 turns /
45 minutes, same Azure resource, same two inherited harness deviations
(stubbed deployment listing, role-preserving harness calls).

**Staged commitment, agreed explicitly before any run**: one trial per arm
first (`run-01`), read qualitatively against §4 before spending the other
four. If `run-01` looks sound, launch `run-02..05` for both arms. This is a
deliberate change from `CQ_NON_REGRESSION.md`/`PHASE6_CONSTRAINT_FIX.md`,
which committed to the full `n=3` upfront — here as a cost control (this
bundle costs `2 × 5 = 10` live interviews at `n=5` instead of `2 × 3 = 6` at
`n=3`, and testing eight ideas one-by-one at `n=3` each would have cost `8 ×
6 = 48`; bundling plus staged commitment is the agreed way to keep this
affordable without abandoning the "always look at one before committing"
discipline this project already follows elsewhere).

**Fallback if the bundle fails** (§5): bisect, don't retest all eight
individually. Split into two clusters by interaction risk, not by source:

- **Group A — low risk** (guardrails/efficiency, don't compete for interview
  budget): #2, #6, #7, #8.
- **Group B — higher risk** (elicitation-additive, most likely to reproduce
  the crowding dynamic that sank both #94's Phase 6 side-effect and the #96
  fix itself): #1, #3, #5, #10.

Re-run only the cluster the failure implicates, at the same `n=5`, before
drilling into individual ideas.

## 3. Measures

**Quantitative** (`analyze-prompt-tuning-bundle.mjs`, same shape as its
predecessors):

| | |
|---|---|
| class / relationship / property F1, both scopes | must not regress materially from control |
| controlled-value fidelity | descriptive |
| allowed-value-list raw count (idea #5) | must not regress from control; a modest positive shift is the honest bar here, not a #96-style multi-fold recovery — idea #5 alone is a much lighter edit than that rejected rewrite |
| turns, apply calls, `get_graph_state` calls, stop reason | cost and behaviour |

**Qualitative** (read all ten transcripts — 5 control + 5 treatment —
systematically for each row; this is the primary evidence for six of the
eight ideas, not a supplement to the numbers):

| Idea | What counts as evidence the edit worked |
|---|---|
| #1 | For every rule/action in the final recovered model, does its condition/precondition/verification reference only properties and values actually present (and, for values, actually in that property's allowed list)? Count contradictions found, treatment vs. control. |
| #2 | Scan for any turn offering the expert a choice to skip a still-incomplete required phase (the `run-01`-style "would you like validation now, or should I continue with X?" pattern). Count instances, treatment vs. control. |
| #3 | Does Phase 5 close with a `get_graph_state`-checked meaning-sentence pass? Does the Phase 9(b) checklist, when it fires, actually name meaning-sentence coverage and rule/action consistency as checked items (not just recite the old wording)? |
| #7 | Any turn where the interviewer has to walk back an assumption because it mistook echoed/recap text for a fresh confirmation — count instances, treatment vs. control. |
| #8 | If an inverse-relationship-pair `[warning]` fires, does the interviewer actually resolve it (pick a direction, remove the other) rather than dismissing it as "probably not real"? |
| #10 | Does the transcript end fully resolved, or with an explicit itemized list of open items — or does it trail off on an unanswered question? |

## 4. Qualitative inspection — what actually decides it

Beyond the per-idea checks in §3, read for:

1. Does the bundle, taken together, cost disproportionate turns relative to
   control — the mechanism behind both #94's Phase 6 side-effect and #96's
   own failure (heavier phases drawing down the same finite budget without
   the turn count increasing to compensate)?
2. Do any two edits visibly interact badly — e.g. does the strengthened
   Phase 9(b) checklist (#3) combined with the never-end-on-a-dangling-
   question rule (#10) produce a *longer*, not clearer, closing sequence?
3. Does anything in the bundle reproduce a failure mode this project has
   already seen and rejected (an open-ended "anything else?" probe wrecking
   precision; a heavier phase crowding out others)?

## 5. Pass criteria

The bundle passes only if **all** of the following hold:

- Aggregate class, relationship and property F1 (both scopes) do not
  materially decrease against `control`.
- Allowed-value-list count does not decrease against `control` (idea #5's
  bar, deliberately modest — see §3).
- At least 5 of the 6 qualitative-only ideas (#1, #2, #3, #7, #8, #10) show
  their intended behavior change in a majority of treatment runs, with the
  corresponding failure pattern still visible (or not meaningfully rarer) in
  control. A dimension where control *also* shows no instances of the
  targeted failure isn't evidence either way and is reported as such, not
  scored as a pass.
- Interviews terminate normally in both arms (`app_agent_appears_finished`);
  a run stopped by `wallclock_timeout` is not scored, same reasoning as
  every prior eval in this line.
- No interaction identified in §4.2/§4.3.

**If it fails**, `index.html` is not changed for the failing portion.
Bisect per §2's fallback — re-test only the implicated cluster (Group A or
Group B) at `n=5` before considering any individual idea in isolation.
Partial success is a real, expected outcome here (unlike the all-or-nothing
verdicts on `CQ_NON_REGRESSION`/`PHASE6_CONSTRAINT_FIX`, this bundle can
reasonably ship 6 of 8 ideas and drop or re-test 2) — the write-up should say
exactly which ideas passed, which didn't, and which were ambiguous, not
collapse to a single verdict.

**`n = 5` is still small relative to the demonstrated baseline variance.** A
difference smaller than the run-to-run spread is not a finding for the F1/
allowed-value-count dimensions, reported the same way `analyze-phase6-
constraint-fix.mjs` already does — "within spread" is read as inconclusive,
not as a pass or a fail.

## 6. Known limitations

- Six of the eight ideas are validated by manual transcript reading against
  the criteria in §3, not by an automated metric — more subjective than F1,
  mitigated only by reading all ten transcripts systematically against the
  same explicit criteria rather than impressionistically.
- Bundling means a passing result doesn't establish which specific idea(s)
  earned the improvement versus rode along neutrally — an accepted tradeoff
  of the agreed bundling strategy (§2), not a new caveat.
- Same standing limitation every eval in this project carries: this prompt
  has been iteratively tuned against the same single fixture/persona through
  many rounds already (documented at length in the prompt-tuning history
  ledger), with no held-out domain to confirm any result here generalizes.
- Idea #5's own supporting evidence (the batch-cap/per-item-justification
  difference) was an incidental observation from the #96 transcripts, not
  itself a controlled comparison — treated accordingly with a modest pass
  bar (§3), not the same weight as the doubly-corroborated ideas (#1, #2).

## 7. Results

Not yet run. Nothing above has been altered since this document was written
and frozen.
