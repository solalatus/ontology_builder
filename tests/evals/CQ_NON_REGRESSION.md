# Issue #94: does making competency questions first-class make the interviewer worse?

Pre-registered before the arms were run. Written to mirror
`SELF_CORRECTION_EVAL.md` section for section, because issue #85 already
settled how a two-arm within-model interviewer comparison is designed, read and
reported in this repository. Nothing here re-derives that; the only differences
are the factor varied and the deviations §2 records.

## 1. The single factor varied

The **interviewer's system prompt**, and nothing else:

- Phase 1 is renamed "Competency questions and actions", names and defines the
  artefact, defers class/relationship/property/rule/action modeling until the
  questions and actions are established, and persists each confirmed question
  (or confirmed batch) through `apply_ontology_yaml`'s `competency_questions`
  section.
- Phase 0 recognizes competency questions already attached to the model rather
  than discarding them or regenerating a set of its own.
- Phases 2, 3, 4 and 8 justify candidates against the persisted questions
  instead of against "Phase 1 material".
- Phase 9(a) reads the persisted list back from `get_graph_state` rather than
  from the agent's own memory of the conversation.
- `summarizeAgentHistory()` preserves confirmed questions verbatim through a
  compaction.

The app code, tool surface, storage, importers, scorer, fixture and persona are
identical in both arms. The tool *descriptions* mention competency questions in
both arms — see §6.

## 2. Design, and the deviations stated up front

The anchor distribution in `results/runs/` was produced on `gpt-5.5-2026-04-23`
via OpenAI. **That model is not deployed on the Azure endpoint available here**
— the same deviation `SELF_CORRECTION_EVAL.md` §2 records. Comparing fresh
interviews against those anchors would vary the model and the treatment at
once, so **both arms are re-run** and the comparison is within-model.

| Arm | Interviewer prompt | Records competency questions |
|---|---|---|
| `control` | frozen pre-#94 prompt (`fixtures/interviewer-prompt-pre-94.txt`) | no — it does not know they exist |
| `treatment` | shipped #94 prompt | yes |

**Six interviews, `n = 3` per arm**, interviewer `gpt-5.4`, persona
`gpt-4o-mini-internal`, same stopping conditions, 120 turns / 45 minutes —
issue #85's exact configuration, on the same Azure resource it used, not a new
one. **The published anchors are untouched and are not the comparison surface.**

The control arm runs from **this same checkout** via the eval-only
`agentState.systemPromptOverride` switch that already has precedent here, and
the runner **verifies the reconstructed control prompt against the golden hash
that shipped before #94** (`eff34f3e…`), refusing to run if it does not match —
a control arm that is not actually the old interviewer would void the whole
comparison silently.

Two deviations from the established setup remain, both forced by this
environment and both minimal:

1. **The deployment *listing* is stubbed.** This resource answers
   `GET /openai/deployments` with an empty list even though its deployments are
   real and callable. The app populates its model dropdown from that listing, so
   the runner fulfills that one request locally. Every chat call — the
   interviewer's included — is a real relayed Azure call. Nothing about the
   interviewer, its tools or its prompt is stubbed.
2. **The harness's own model calls preserve message roles.** The shared
   `chatOnce` helper takes a single system + user pair, so routing a running
   conversation through it flattens every prior turn into one blob with the
   roles stripped. A first attempt did that and the persona re-emitted its
   scripted opening line on all 19 turns of the run; it was discarded. The
   runner sends a real multi-turn array instead.

A third condition, `gpt-5-mini`, was run before `gpt-5.4` was found to be
deployed. It is kept as a deliberate weaker-interviewer replication rather than
discarded — see §7.

## 3. Measures

Per run and aggregate, control vs treatment, via
`analyze-cq-non-regression.mjs` (the same shape as
`analyze-self-correction.mjs`):

| | |
|---|---|
| class / relationship / property F1, both scopes | the standard surface |
| controlled-value fidelity | as in #85 |
| turns, apply calls, `get_graph_state` calls, stop reason | cost and behaviour |
| competency questions recorded | **descriptive only, never scored** |

The last row is not a measure of anything. The control arm structurally cannot
record competency questions, so a difference there is the treatment doing its
job, not evidence about interview quality. **The measured quantity is ontology
recovery, identically for both arms** — a feature that captures requirements
beautifully while eliciting a worse ontology is a regression, and this is the
instrument that would show it.

## 4. Qualitative inspection — what actually decides it

Numbers at `n = 3` cannot settle this alone. Read, per arm:

1. Does the treatment arm actually reach the modeling phases, or does Phase 1
   consume the interview? The front-loading is the specific risk this change
   introduces.
2. Does Phase 9 in the treatment arm read the persisted list back through
   `get_graph_state`, rather than reciting the conversation?
3. Are the recorded competency questions real requirements in the expert's own
   terms, or the interviewer's paraphrases accepted without confirmation?
4. Does either arm show the interviewer stuck in a dead loop — the failure the
   discarded `gpt-4o` attempt exposed, since fixed in `handleAgentToolCall`.

## 5. Pass criteria

- Aggregate class, relationship and property F1 do not decrease materially
  against the control arm; any decrease is inspected and explained item by item.
- Controlled-value fidelity does not regress.
- Turn count does not increase disproportionately — competency questions should
  cost some Phase 1 turns, not the whole interview.
- Phase 9 still performs both validation checks in the treatment arm.
- Interviews terminate normally in both arms. **A run stopped by
  `wallclock_timeout` is not scored**: it measures the budget, not the
  interviewer, and the truncation is asymmetric here, since the treatment's
  front-loaded Phase 1 means a binding clock costs the treatment its modeling
  phases and not the control's — the direction that manufactures a false
  regression. The analyzer refuses to report such a run and exits non-zero.
- Elicitation quality not visibly degraded on qualitative read.

If it fails, #94 does not merge as written. Fallbacks, in order of preference:
move competency-question persistence later in Phase 1 so modeling starts
sooner; cut the confirmation requirement to batch-only; or keep the data model,
formats, UI and coverage check and revert the interviewer prompt alone, since
questions can still be imported and authored by hand without it.

**n = 3 per arm.** Same limitation the anchor set carries. A difference smaller
than the run-to-run spread is not a finding, and will be reported as one that
cannot be resolved at this n rather than as a result — the analyzer computes
that comparison explicitly rather than leaving it to a reader's judgement.

## 6. Known limitation: the control arm is not a pure pre-#94 interviewer

The control runs the pre-#94 *prompt* against this build's tool descriptions,
which mention `competency_questions`, and against a `get_graph_state` whose
output carries an empty `competency_questions:` section. Running the control
from a worktree at `main` would have removed that at the cost of varying the
harness revision and the Chromium build too — a worse trade, and the same one
`SELF_CORRECTION_EVAL.md` §2 already rejected.

The residual effect is small and, if anything, favours the control: the old
prompt never tells it to use that section, so the descriptions are inert text.
It is recorded here rather than assumed away.

## 7. Two interviewer models, both kept

The first batch ran on `gpt-5-mini` because a probe of generic deployment names
(`gpt-4o`, `gpt-4.1`, `gpt-5-mini`, `o4-mini`) suggested nothing stronger was
deployed. That was wrong: this is the same Azure resource issue #85 ran on, and
`gpt-5.4` and `gpt-4o-mini-internal` are both live under exactly the deployment
names `self-correction-eval.mjs` already hardcodes. The probe never tried them.

The `gpt-5-mini` batch is **kept rather than discarded**, under
`results/baselines/competency-questions-gpt-5-mini/`, because it is a result in
its own right and not merely a failed attempt:

- It is a **weaker-interviewer replication** of the same two arms. Whether the
  treatment degrades recovery when the interviewer has less capacity to spare is
  a harder question than whether it degrades recovery on a strong one, and
  arguably the more informative one — Phase 1 front-loading should bite hardest
  where there is least headroom.
- It is an **independent second within-model comparison**. Two model conditions
  agreeing is stronger evidence than either alone; two disagreeing is a finding
  that neither would have surfaced.
- It demonstrates the feature works end to end on a small model: 20 and 17
  competency questions elicited, confirmed and persisted through real interviews.
- Its interviews all terminated naturally (`app_agent_appears_finished`), so it
  is a valid comparison, not a truncated one.

Its known weakness is stated plainly: recovery is lower and **more variable**
than any previous generation (practical class F1 27.9–62.2, against 55.3–70.8
across the anchors and issue #85's arms). At n = 3 that spread is wide enough
that only a large effect could clear it, so this batch is expected to be
low-powered — informative about direction and about robustness under a weak
interviewer, not decisive on its own.

The primary batch is therefore re-run on `gpt-5.4` with persona
`gpt-4o-mini-internal` — issue #85's exact configuration, which removes two of
the four deviations §2 records, leaving only the stubbed deployment listing and
the role-preserving harness calls.

## 8. Results

Both conditions have run. Neither this document's design, measures nor pass
criteria were altered after the fact.

- **Primary, `gpt-5.4`** — `results/baselines/competency-questions/REPORT.md`.
  **FAIL.** Full-domain class F1 −7.6 (spread 5.6) and property F1 −8.8
  (spread 7.2): both decreases clear the n = 3 rule, and the deficit is
  directionally consistent across all three paired runs. Mechanism: the
  treatment interview terminates ~29% earlier with ~27% fewer applies, leaving
  a model ~27% smaller in classes and ~50% smaller in properties.
  Competency-question work displaces modeling turns rather than adding to them.
  Value fidelity improves substantially (62.0 → 87.4), so the honest reading is
  a smaller, tighter, higher-fidelity model — but breadth is what these criteria
  measure, deliberately.
- **Secondary, `gpt-5-mini`** —
  `results/baselines/competency-questions-gpt-5-mini/REPORT.md`. No regression
  detected; full-domain property F1 *gained* 5.7 clearing its spread.

The two conditions disagree, which §7 anticipated as a finding neither would
surface alone: on a weak interviewer the control is already turn-limited, so
focusing the interview costs little; on a strong one there is real headroom to
forfeit. The change trades breadth for focus, and the stronger the interviewer,
the more breadth there is to lose.

**Consequence, per §5: issue #94 does not merge as written.** The first
fallback is indicated — stop competency-question work displacing modeling
turns, then re-run this batch. Nothing in the data model, file formats, Domain
Model UI, Review Changes integration or coverage check is implicated; the
narrower third fallback (ship all of that, revert the interviewer prompt alone)
remains available.
