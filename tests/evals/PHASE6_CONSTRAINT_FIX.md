# Issue #96: does restoring Phase 6's constraint pass recover allowed-value coverage without giving back the competency-question gains?

Pre-registered before either arm is run. Follows `CQ_NON_REGRESSION.md`'s own
section structure (factor, design, measures, qualitative questions, pass
criteria, limitations, results) — that document's own §8 named this exact
follow-up ("restore Phase 6's constraint pass... re-run and check that
controlled-value coverage returns to the control's range while the F1 gains
hold"), so this eval is that re-run, not a new design. It has no section
analogous to that document's §7 (a second interviewer model kept as a
replication) — nothing here needed one.

## 1. The single factor varied

The **interviewer's system prompt, in exactly two places**, and nothing else:

- **Phase 6 ("Constraints and fixed choices")** is rewritten from open,
  self-selecting discretion ("properties that clearly need one") to a
  systematic pass: classify every captured property as fixed-set or not, out
  loud, rather than only the ones that already look obviously enumerated; and
  a closing instruction — call `get_graph_state` and check the actual property
  list before leaving the phase, the same discipline Phase 3 already applies to
  relationship coverage.
- **Phase 9(b)'s final checklist** gets one bullet sharpened: "fixed value
  lists are used where appropriate" (vague, and — per the qualitative read
  below — not actually applied as a check) becomes a concrete criterion naming
  the property shapes that should have one (status, type, category, priority,
  severity, and similar).

Nothing else changes: same tool descriptions, same Phase 0–5/7/8/9(a) text,
same app code, tool surface, storage, importers, scorer, fixture and persona as
the shipped (#94/#95) prompt this eval treats as its baseline.

## 2. Design, and the deviations stated up front

| Arm | Interviewer prompt | Phase 6 discipline | Phase 9(b) constraint bullet |
|---|---|---|---|
| `control` | shipped prompt, unmodified (current `main`) | open/self-selecting | vague |
| `treatment` | shipped prompt + the two edits in §1 | systematic pass + closing check | concrete criterion |

**Six interviews, `n = 3` per arm**, interviewer `gpt-5.4`, persona
`gpt-4o-mini-internal`, same stopping conditions, 120 turns / 45 minutes — the
exact configuration `CQ_NON_REGRESSION.md` used, on the same Azure resource, for
the same reason: continuity with the batch this eval is a direct follow-up to.

Unlike `CQ_NON_REGRESSION.md`'s control (a *frozen, no-longer-live* pre-#94
prompt reconstructed from a fixture and checked against a golden hash), this
eval's control **is** the live prompt — `window.__kg.agent.buildSystemPrompt()`
called with no override, read fresh at run time. The treatment arm is built by
taking that same live text and applying two exact, whole-substring
`String.replace()` operations (the old Phase 6 paragraph → the new one, the old
checklist clause → the new one), each asserted to match **exactly once** before
being applied. If either substring is not found exactly once — because the live
prompt drifted from what this document assumes — the run aborts rather than
silently testing stale or wrong text. This is stricter than a hash check: it
guarantees the treatment differs from the control by precisely the two edits in
§1, verified at the moment each run starts, not at design time.

One mechanism note, added before any scored run completed: `buildAgentSystemPrompt()`'s
override branch is `agentState.systemPromptOverride + agentLanguageDirective()`
— it appends the language directive itself and does **not** append
`AGENT_KNOWLEDGE` (by design, per that function's own comment — an override is
meant to replace both the base prompt and the knowledge, for conditions like
the generic-interviewer one that want neither). Building the treatment prompt
naively from the live, no-override output therefore both double-appended the
directive and silently dropped `AGENT_KNOWLEDGE` — caught immediately by this
runner's own post-set verification assertion (§2's design already commits to
"nothing else changes," so a silent knowledge-loss would have been exactly the
kind of confound that assertion exists to catch), on `treatment/run-01`'s first
attempt, before any interview turn beyond the harness's own setup ran. The
runner now recovers `AGENT_KNOWLEDGE` algebraically — probing the directive's
own text via a sentinel override, then subtracting that known suffix from the
live prompt to get base+knowledge — and bakes it into the treatment override
alongside the two edits, so the override path carries the same knowledge grounding
the control arm gets for free. No run was scored before this was caught.

Two deviations, both inherited from `CQ_NON_REGRESSION.md` rather than new here:

1. **The deployment *listing* is stubbed** (this Azure resource answers
   `GET /openai/deployments` with an empty list even though the deployments are
   real and callable). Every chat call is a real relayed Azure call.
2. **The harness's own model calls preserve message roles** (flattening a
   running conversation into one blob previously broke the persona — see
   `CQ_NON_REGRESSION.md` §2).

## 3. Measures

Per run and aggregate, control vs treatment, via
`analyze-phase6-constraint-fix.mjs` (the same shape as
`analyze-cq-non-regression.mjs`, extended with one more row):

| | |
|---|---|
| class / relationship / property F1, both scopes | the standard surface — must not regress from the #94 gains |
| controlled-value fidelity | as in #85/#94 |
| **raw allowed-value-list count per run** | **the decisive measure this follow-up exists to move** — `REPORT.md`'s own finding was the raw count (control 17/37/26 vs treatment 1/9/11), not the fidelity percentage, which that report found "too unstable to score" at this n |
| turns, apply calls, `get_graph_state` calls, stop reason | cost and behaviour |

## 4. Qualitative inspection — what actually decides it

Numbers at `n = 3` cannot settle this alone, and the two concrete failure modes
this fix targets were only found by reading transcripts, not by looking at
scores. Read, per arm:

1. Does the treatment arm actually reach Phase 6 as a distinct, systematic
   pass, or does it still get deferred in favour of an early validation pass —
   the exact pattern found in `competency-questions/treatment/run-01` (turn
   ~61: the interviewer itself offered to skip straight to validation, and the
   persona accepted)?
2. Does the treatment arm still narrowly self-select which properties "clearly"
   need a constraint, leaving most of the captured properties unexamined — the
   `competency-questions/treatment/run-02` pattern (8 of 109 properties even
   considered)?
3. In the treatment arm, does Phase 9(b)'s checklist read-back actually
   surface a gap in allowed-value coverage if one remains, or does it stay
   silent on it the way `competency-questions/treatment/run-01`'s own "Final
   checklist check" did (six "what passes" bullets, none mentioning controlled
   vocabularies, despite an actual gap already existing at that point)?
4. Does the Phase 6 rewrite cost the interview disproportionate turns, at the
   expense of the phases #94 was written to protect (competency questions,
   relationship coverage)?

## 5. Pass criteria

- **Controlled-value-list count** materially increases from the treatment
  baseline (1/9/11) toward the control's range from `CQ_NON_REGRESSION.md`
  (17/37/26) — not necessarily matching it, but a clear, consistent multi-fold
  recovery across all three runs, not a one-off.
- Aggregate class, relationship and property F1 (both scopes) do **not** give
  back the #94 gains: no material decrease against this eval's own `control`
  arm (the shipped, unfixed prompt), which is itself already the #94 treatment
  and carries its gains forward as the floor to hold.
- Turn count does not increase disproportionately.
- Phase 9(b) checklist, on qualitative read, actually engages with allowed-value
  coverage in the treatment arm (§4.3) rather than reciting the same silent
  pattern found in the unfixed prompt.
- Interviews terminate normally in both arms. A run stopped by
  `wallclock_timeout` is not scored, for the same reason
  `CQ_NON_REGRESSION.md` §5 excludes one: it measures the budget, not the
  interviewer. The analyzer refuses to report such a run and exits non-zero.
- Elicitation quality not visibly degraded on qualitative read.

**If it fails, issue #96 is not fixed by this prompt edit and `index.html` is
not changed.** Fallbacks, in order of preference: strengthen Phase 9(b) alone
(if the checklist bullet change recovers most of the gap on its own, the
heavier Phase 6 rewrite may be unnecessary); tighten Phase 6's batching
instruction further (e.g. require an explicit yes/no per property rather than
"decide out loud," if the current wording still leaves room to skim); or leave
issue #96 open with the qualitative evidence recorded, rather than ship a fix
that doesn't move the number that matters.

**n = 3 per arm.** Same limitation the anchor set and `CQ_NON_REGRESSION.md`
carry. A difference smaller than the run-to-run spread is not a finding for the
F1 dimensions, and will be reported as one that cannot be resolved at this n —
`analyze-phase6-constraint-fix.mjs` computes that comparison explicitly, same as
its predecessor. The allowed-value-list count is read as a raw, per-run number
rather than run through the spread test, because it is a count of a rare event
(few properties get one at all in the baseline), where the spread test's
assumptions fit poorly — the same reason `REPORT.md` reported it as raw counts
rather than as a scored percentage.

## 6. Known limitations

- This eval's `control` arm is the shipped, **already-crowded** prompt (#94/#95
  as merged) — not a pristine pre-#94 baseline. That is deliberate: the
  question this eval answers is narrower than #94's own ("does this specific,
  additional edit recover constraint coverage without undoing #94's gains"),
  and the shipped prompt is the correct floor to hold for that question.
- Same model-family caveat as every eval in this directory: results describe
  `gpt-5.4` behaviour on this Azure resource, not a claim about other models.
- The verified-substring-replace mechanism (§2) only guards against the
  treatment prompt silently drifting from what this document assumes; it does
  not guard against the *control* prompt having drifted from what
  `CQ_NON_REGRESSION.md` measured, if `main` changed Phase 6/9(b) text again
  between that eval and this one. The control arm's provenance records the
  live prompt's hash for exactly this reason — checked against
  `CQ_NON_REGRESSION.md`'s own recorded treatment-arm prompt hash before
  results are read as comparable.

## 7. Results

All six runs have completed. Neither this document's design, measures nor pass
criteria were altered after the results were seen.

**Allowed-value-list count (the decisive measure, §3/§5):**

| | run-01 | run-02 | run-03 | mean | spread |
|---|---|---|---|---|---|
| control | 22 | 13 | 22 | 19.0 | 9 |
| treatment | 29 | 19 | 20 | 22.7 | 10 |
| delta | +7 | +6 | **-2** | +3.7 | |

**Fails the pre-registered pass criterion.** §5 required "a clear, consistent
multi-fold recovery across all three runs, not a one-off" — this is neither
clear, nor multi-fold, nor consistent: `run-03` favours the *control*. The
delta (+3.7) is smaller than either arm's own run-to-run spread (9 and 10).
Notably, this batch's own control — the identical, unmodified shipped prompt
`CQ_NON_REGRESSION.md` measured at 1/9/11 — landed at 22/13/22 here: far
higher than that eval's own treatment-arm numbers, and closer to *that* eval's
control range (17/37/26) than to its own treatment range. The severe crowding
`REPORT.md` documented is real (its qualitative evidence — the explicit
Phase 6 deferral in `run-01`, the narrow 8-of-109 self-selection in `run-02`
— was read directly from those transcripts, not inferred) but it is evidently
not a deterministic per-run outcome; run-to-run variance in the *baseline*
is large enough that this fix's effect, if any, is not distinguishable from
noise at n=3.

**Full-domain structural F1, treatment − control:** classes -9.9, relationships
-4.7, properties -13.9 (`analyze-phase6-constraint-fix.mjs` output). All three
point the *wrong* direction — the opposite of what `CQ_NON_REGRESSION.md`
found for #94 itself (all six of its deltas favoured treatment). The classes
delta (9.9) **exceeds the run-to-run spread** (9.7) — the one dimension in
this batch that clears the significance bar §5 sets, and it is a real
regression, not a wash. Practical-scope classes shows the same -9.9 (within
spread there, 11.3). Controlled-value fidelity is mixed: full scope +6.5
(favours treatment), practical scope -4.6 (favours control) — both within
spread, and, per §5's own limitation note, this percentage is unstable at
n=3 regardless of direction.

**Qualitative read confirms the mechanism worked exactly as designed — Phase 6
now runs as a genuine systematic pass** ("Before we leave the constraints
phase, I need to classify the remaining properties that have not yet been
explicitly classified as fixed-set or open," `treatment/run-02`) **and
Phase 9(b)'s checklist engages with constraint coverage instead of staying
silent on it** ("Fixed value lists captured for small decision-bearing sets:
yes," `treatment/run-01`) in every treatment run. Both §4.1 and §4.3's
questions resolve in the fix's favour. What the qualitative read cannot show,
and what the F1 numbers surface instead, is the plausible cost: a heavier,
more thorough Phase 6 is still a phase that costs conversation turns and
model attention, and turn count did **not** increase to pay for it (treatment
mean 46 turns vs control's 50 — *fewer*, if anything). The more likely
account is that the same finite interview budget that used to under-serve
Phase 6 now serves it adequately by drawing down from elsewhere — Phase 2/3's
class and relationship coverage — which is the same crowding dynamic
`REPORT.md` diagnosed, relocated rather than removed.

**Consequence: the fix does not merge.** Per §5's stated fallback order,
`index.html` is not changed. Issue #96 stays open. The qualitative evidence
this eval produced — that a systematic Phase 6 pass and a sharpened Phase 9(b)
checklist bullet reliably change interviewer *behaviour* in the intended way,
even though the net *ontology-recovery* effect at n=3 is a wash-to-negative —
is worth recording against the issue for whoever picks it up next: the
untried fallback this batch's evidence points toward is sharpening Phase 9(b)
**alone**, without Phase 6's heavier rewrite, since Phase 9(b)'s engagement
was the more unambiguous win here and Phase 6's added weight is the more
plausible source of the structural cost. That is a new, smaller experiment
that would need its own pre-registration, not an extension of this one.
