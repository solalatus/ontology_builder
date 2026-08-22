# Ontology-recovery eval report

Generated: 2026-08-22T17:18:48.352Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **81.0%** | **71.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 72.7% / 66.7% | 87.5% / 63.6% / 73.7% | 8/13 full · 7/8 scoped ground-truth relationships matched; 11 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **81.0%** | **71.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 72.7% / 66.7% | 87.5% / 63.6% / 73.7% | 8/13 full · 7/8 scoped ground-truth relationships matched; 11 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 93.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 49.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 55.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 93.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 49.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 55.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 73 turns, 695s wall-clock
- Real app-agent API calls: 144 (apply_ontology_yaml called 33× · get_graph_state called 38×)
- Tool outcomes seen in transcript: 33 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 7383704 total (7361641 prompt · 22063 completion) across 284 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 8 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: `app-user` duplicates the persona’s opening statement verbatim. Looks like a transcript/plumbing bug rather than intentional dialogue.
- **Turn 2**: Assistant says it captured **16 competency questions** from a list of 12 bullets by “split versions,” but the split logic is not shown and may be overstated. Not clearly wrong, but suspicious bookkeeping.
- **Turn 3**: System reports **5 consistency problems unresolved** immediately after the assistant says unresolved tool warnings are “expected” and will be handled later. The agent does not actually inspect or address them at that point.
- **Turn 6**: Tool says **4 added, 0 updated** after the persona explicitly requested renaming `QualificationOrCertification` to `QualificationSpecification`. That suggests a likely misapplied add-vs-update edit, potentially leaving the old class behind.
- **Turn 8**: Assistant accepts the persona’s correction that `FailureEvent -> MaintainableItem` should not be the main relation, but at turn 9 records `FailureEvent --initiates--> MaintenanceState` rather than the narrower **failed state** the persona specified. It notes the constraint in prose instead of modeling it cleanly.
- **Turn 9**: Tool reports **3 added** when the assistant claims to have recorded 3 relationships, including `MaintainableItem --hasMaintenanceState--> MaintenanceState`, which had already been substantively confirmed earlier. Possible duplicate insertion rather than update.
- **Turn 14**: Tool reports **2 added** even though the assistant says it recorded one relationship plus one previously confirmed relationship (`requiresQualification`). Possible delayed/misaligned application.
- **Turn 24**: Assistant says the work-order properties are “tied directly to the create/close work-order actions,” but `workOrderDate`, `taskCode`, and `cost` were not actually tied by the persona to close/create preconditions in a precise way. Mild overclaim.
- **Turn 55**: Assistant adds action details for `classifyItemAsFailed`, including effect/verification about “the relevant item,” despite there being no modeled `FailureEvent ↔ MaintainableItem` link and the persona repeatedly rejecting that direct connection. This is an inferred action semantics gap.
- **Turn 61**: Assistant records `startMaintenanceProcess` with verification “confirm the maintenance process is recorded as started” despite earlier agreeing there is **no modeled process status/state property**. That verification is not grounded in the ontology.
- **Turn 62**: Similarly records `closeMaintenanceWorkOrder` with verification “recorded as closed” despite no accepted work-order status/state property. Again ungrounded.
- **Turn 63–65**: Validation says the next step is to fix action-state verification via status/current-state properties, but when the persona declines inventing one, the agent just abandons the branch. Not a contradiction, but it reveals the earlier action verifications were prematurely recorded.
- **Turn 69–70**: Assistant correctly identifies `taskDescription` as minimal support for “performed task information,” but had previously framed the work-order properties as already sufficient/decision-relevant. The later exchange shows they were not sufficient after all.

## Noteworthy observations
- **Turn 1**: Good opening strategy: starts from competency questions/actions rather than schema-first abstraction, which fit the persona well.
- **Turn 2–3**: Good catch by the persona on **work order record vs maintenance process**; the assistant accepts and carries the distinction forward consistently.
- **Turn 3**: The “required narrow follow-up” about subordinate roles/operating context feels generic and weakly motivated by the elicited content. It interrupts momentum.
- **Turn 4–7**: Strong technique in proposing **small justified batches** of candidate classes tied to accepted questions/actions. Efficient and easy for the expert to correct.
- **Turn 7–12**: The assistant responds well to corrections, especially around **maintenance process vs functioning process** and refusal to over-assume person→qualification-spec links.
- **Turn 8–10**: Nice move to ask for exact verb phrases one relation at a time when the persona objected to vague wording.
- **Turn 11–16**: Good discipline in not forcing an assignment-outcome relationship after the persona declined it. The agent repeatedly distinguishes **capability** from **assignment outcome**.
- **Turn 16–18**: Strong follow-up when `FailureModeCode` implied a missing intermediate concept; the assistant correctly surfaces **UndesirableDisposition** as a needed class rather than stuffing the code onto the event.
- **Turn 20–22**: Repeatedly asking for “obvious” omitted links (item↔event, item↔process, item↔functioning process) became somewhat inefficient. The persona had clearly signaled a preference for **minimal, question-justified modeling**.
- **Turn 23–33**: Property elicitation became very mechanical and somewhat low-yield, with many turns just confirming “no property needed.” Could be compressed into batched yes/no passes.
- **Turn 24–25**: Useful moment where the persona volunteered concrete work-order properties; this was one of the few high-value property turns.
- **Turn 43–47**: Good methodological honesty when the assistant refuses to pretend a rule is fully grounded if the ontology lacks the needed modeled fact.
- **Turn 45**: The assistant briefly proposes a **circular rewrite** of the failed-classification rule (“precondition = already failed”), which the persona rightly rejects. Good recovery afterward.
- **Turn 47–54**: Solid handling of business rules with explicit acknowledgment of **unresolved modeling dependencies** rather than forcing artificial fields.
- **Turn 55–62**: Action elicitation exposes a structural issue: the tool/action framework seems to prefer **single-input, forward-navigable paths**, but the persona’s ontology preferences reject convenience reverse links. This mismatch is worth prompt/tool redesign attention.
- **Turn 58–60**: Good restraint in not adding `assignedTo` just to satisfy action verification, though the resulting action representation is weak.
- **Turn 62 onward**: Validation pass is candid and useful. The assistant clearly distinguishes what is complete vs what remains open, which is valuable behavior.
- **Overall**: The interview is generally careful and domain-sensitive, but somewhat **overconstrained by tool expectations** (single input class, navigability, status verification), causing repeated attempts to elicit convenience modeling the persona did not want. A prompt optimization opportunity is to let the agent mark such gaps as intentional earlier, reducing repetitive follow-ups.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
