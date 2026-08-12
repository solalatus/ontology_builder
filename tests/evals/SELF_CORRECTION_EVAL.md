# Issue #85: does the self-correction loop make the interviewer worse?

**Status: pre-registration.** Written and committed before any interview ran,
for the same reason `POST_NORMALIZATION.md` was — so the design and the pass
criteria cannot be chosen after seeing which way the result falls. The commit
adding this file contains no results; `git log` is the check.

Gates the merge of #84.

## 1. The single factor varied

> **Whether the interviewer receives consistency findings after each edit and
> may spend up to two extra applies fixing them before replying.**

Held fixed: the persona and its model, the fixture, the interviewer model, the
stopping conditions, the tool surface (still exactly two tools), the scorer,
both denominators, the harness revision, and the browser build.

This is not asking whether the checker finds real defects — #83's labelled
corpus settled that. It asks the narrower and more dangerous question: does
giving the interviewer a self-correction loop damage the interview?

## 2. Design, and a deviation stated up front

The anchor distribution in `results/runs/` was produced on
`gpt-5.5-2026-04-23` via OpenAI. **That model is not reachable on the Azure
endpoint available here** — the same deviation `POST_NORMALIZATION.md` §2
records. For that condition, running the normalizer on `gpt-5.4` was merely
conservative. Here it would be fatal: the interviewer model is precisely the
thing that has to be held fixed, and comparing fresh `gpt-5.4` interviews
against `gpt-5.5` anchors would vary the model and the treatment at once.

So **both arms are re-run**, and the comparison is within-model:

| Arm | Interviewer | Findings in tool results | Applies per turn |
|---|---|---|---|
| `control` | frozen pre-#84 prompt (`fixtures/interviewer-prompt-pre-84.txt`) | no | 1 |
| `treatment` | shipped #84 prompt | yes | up to 3 |

Six interviews, `gpt-5.4` throughout, persona `gpt-4o-mini`, same stopping
conditions. **The published anchors are untouched and are not the comparison
surface** — they were produced on a different model and are only context.

The control arm runs from **this same checkout**, via two eval-only switches
that already have precedent here (`systemPromptOverride`, `toolsDisabled`):
`agentState.systemPromptOverride` carries the frozen pre-#84 prompt, and
`agentState.selfCorrectionDisabled` restores the pre-#84 turn behaviour. The
runner **verifies the reconstructed control prompt against the golden hash that
shipped before #84** (`3554cef3…`) and refuses to run if it does not match — a
control arm that is not actually the old interviewer would make the whole
comparison void, silently. Running the control from a worktree at `main`
instead would have varied the harness revision and the Chromium build too.

## 3. Measures

Per run and aggregate, control vs treatment:

| | |
|---|---|
| class / relationship / property F1, both scopes | the standard surface |
| controlled-value fidelity | what B2 showed collapses first when an interviewer degrades |
| turn count, total API calls | did the loop lengthen the interview |
| applies per turn, turns with >1 apply | direct cost of the loop |
| tool results carrying findings | did the treatment arm actually engage |
| stopping reason | did the loop interact badly with termination |

**F1 is a guardrail, not the endpoint.** #75 established it cannot see
structural change at this magnitude. It can see an interview that got shorter,
narrower or more distracted, which is the failure this exists to catch.

## 4. Qualitative inspection — what actually decides it

Read all six transcripts and report each point explicitly:

1. **Did the agent chase findings instead of interviewing?**
2. **Did it "fix" anything by weakening the model** — deleting the condition
   that raised `value-not-allowed` instead of adding the value, dropping the
   precondition that raised `unreachable-from-action-input` instead of adding
   the relationship? #75 has both on record as real LLM behaviour, and #84's
   prompt prohibits them precisely because they are the cheap way out.
   **Any instance is a blocking failure.**
3. **Did it push through, and did it say so?** Every override must be stated.
4. **Did Phase 9 still run properly**, with both validation checks?
5. **Did findings leak into the conversation as jargon?** The expert should
   never see `unreachable-from-action-input`.
6. **Did interviews terminate normally?** The classifier has previously run
   160+ turns past a finished interview.
7. **False positives in the wild**: every warning that was in fact wrong, and
   what the agent did about it.

## 5. Pass criteria

- No instance of a finding resolved by weakening or deleting the item that
  raised it (§4.2). **Blocking.**
- Aggregate class, relationship and property F1 do not decrease materially
  against the control arm; any decrease is inspected and explained item by item.
- Controlled-value fidelity does not regress.
- Turn count and API calls do not increase disproportionately — the loop should
  cost extra applies, not extra interview.
- Phase 9 still performs both validation checks in the treatment arm.
- Interviews terminate normally in both arms.
- Elicitation quality not visibly degraded on qualitative read.

If it fails, #84 does not merge as written. Fallbacks, in order of preference:
demote noisy Tier B checks to `note` so they stop reaching the agent; cut the
apply budget from 3 to 2; or make the whole loop a toggle defaulting to off, as
Tier C already is.

**n = 3 per arm.** Same limitation the anchor set carries. A difference smaller
than the run-to-run spread is not a finding, and will be reported as one that
cannot be resolved at this n rather than as a result.

## 6. Operational guarantees

Because the key's balance is unknown, the runner is built so an interruption
costs nothing beyond the interview it interrupts:

- **Idempotent.** A run with a `baseline-provenance.json` is skipped. Re-running
  the batch after any failure does only what is missing, and never overwrites.
- **Checkpointed.** Every turn writes the transcript, the raw API log and the
  ontology so far under `checkpoint/`. A run killed at turn 40 leaves 40 turns
  of auditable material, not nothing.
- **Failures are typed.** `out_of_funds`, `auth_failed`, `rate_limited` and
  `error` are distinguished in `progress.json`, so a spent key is not mistaken
  for a defect.
- **A partial run never looks complete.** `baseline-provenance.json` is written
  only on a clean finish.
- Nothing under `results/runs/` is read or written at any point.

Live status: `node tests/evals/self-correction-status.mjs`.
