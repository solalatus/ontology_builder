# Ontology-recovery eval report

Generated: 2026-09-03T07:33:53.999Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **80.2%** | **62.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 92.3% / 100.0% / 96.0% | 100.0% / 50.0% / 66.7% | 36/39 full · 18/18 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 82.9% / 93.5% / 87.9% | 89.5% / 54.8% / 68.0% | 29/35 full · 17/19 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.5% / 94.4% / 56.7% | 56.3% / 50.0% / 52.9% | 17/42 full · 9/16 scoped ground-truth properties matched; 18 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **80.2%** | **62.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 92.3% / 100.0% / 96.0% | 100.0% / 50.0% / 66.7% | 36/39 full · 18/18 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 82.9% / 93.5% / 87.9% | 89.5% / 54.8% / 68.0% | 29/35 full · 17/19 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.5% / 94.4% / 56.7% | 56.3% / 50.0% / 52.9% | 17/42 full · 9/16 scoped ground-truth properties matched; 18 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 100.0% / 92.3% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 71.4% / 83.3% | 5/5 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 74.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 55.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 43.5% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 100.0% / 92.3% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 71.4% / 83.3% | 5/5 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 74.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 55.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 43.5% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 81 turns, 1521s wall-clock
- Real app-agent API calls: 139 (apply_ontology_yaml called 41× · get_graph_state called 15×)
- Tool outcomes seen in transcript: 41 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 7698262 total (7667387 prompt · 30875 completion) across 227 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 11 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 5** — The assistant said the tool was “correctly flagging” incomplete actions due to missing input classes, but the actual tool output only said “The agent left 8 consistency problem(s) unresolved — see Check.” The assistant inferred specifics not shown.
- **Turn 15** — `app-tool` reported “✓ Applied: 4 added” after the user kept only **Building** and **Floor** in the prior batch and then added **Chiller** and **Boiler**. This is plausibly correct, but the assistant’s recap glossed over the fact that the previous keep/drop batch itself was never explicitly persisted in a visible tool step; state transitions are a bit opaque.
- **Turn 27** — `app-tool` reported “✓ Applied: 6 added” after only four `hasLocation` facts were confirmed in the immediately preceding question. The assistant explained this by also counting earlier containment facts, but that means the edit spanned multiple earlier confirmations rather than just the last answer. This is stateful but confusing and could indicate delayed or bundled persistence.
- **Turn 69** — Real tool limitation surfaced: when the persona said one action should get an input class and another should be removed, the tool only removed one element and skipped the additional edit (“only one edit is applied per message”). The assistant noticed and deferred the remaining updates, but this is a genuine tool/workflow failure mode.
- **Turn 70** — The assistant claimed “The remaining action-input errors are now cleared,” but the user’s previous message only supplied preconditions, not the skipped `verifyThermostatControlContext` / `investigateAirQualityConcern` input-class updates from turn 69. Unless the tool silently applied those too, this looks like the assistant losing track of what had actually been persisted.
- **Turn 72** — The assistant/tool surfaced directional reachability warnings for `verifyOccupiedZoneConditioning`, but one proposed fix option was “Add a direct relationship Zone served by Thermostat in the reverse operational direction,” even though `Thermostat serves Zone` already existed and the issue seemed to be engine traversal/directionality, not ontology absence per se. The fix framing was muddled.

## Noteworthy observations
- **Turn 1** — Strong start: the interviewer framed the task around competency questions first, which elicited highly concrete operational requirements quickly.
- **Turns 2–3** — Good normalization move, but the assistant initially over-split and over-committed the CQ list. The persona had to prune several items back. Prompt could better bias toward preserving operator phrasing and resisting speculative decomposition.
- **Turns 5–7** — The assistant pursued roles/context even though unresolved action consistency issues were already flagged. That’s a bit process-fragile: it kept interviewing productively, but without first reconciling a known model error.
- **Turns 8–17** — Generally solid class elicitation technique: small justified batches, repeated “keep/drop,” and willingness to test over/under-splitting explicitly. This was efficient and domain-appropriate.
- **Turns 13–16** — Nice restraint on generic abstractions (`HVACEquipment`, `CoolingPath`, etc.). The interviewer correctly let the persona reject vague umbrella classes in favor of concrete equipment.
- **Turns 20–23** — Important modeling tension handled honestly: the assistant recognized that `verifyOccupiedZoneConditioning` lacked structural support and did not force a fake link after the persona rejected `Zone–Space` and `TerminalUnit–Zone`.
- **Turns 28–30** — Good handling of taxonomy limitation. The assistant explicitly distinguished operational relationships from subclassing and avoided inventing bogus links just to connect the graph.
- **Turns 30–45** — Very inefficient stretch. The interviewer got trapped in many one-by-one “do you want this exact fact?” questions for disconnected classes, mostly yielding “no.” A better optimization would be to ask whether to defer a whole unresolved cluster much earlier.
- **Turns 45–48** — Good recovery in property elicitation: the persona corrected several proposed properties as being on the wrong class, and the assistant adapted rather than defending the initial choices.
- **Turns 64–67** — Rule elicitation was mostly strong: the assistant constrained rules to already-modeled facts and let the persona rename them into domain language. Good prompt behavior.
- **Turns 68–73** — The assistant did a good job surfacing that one “action” (`traceComfortComplaintUpstream`) was actually a workflow, not a discrete executable action. That’s a useful distinction for ontology/action design.
- **Turns 79–81** — Validation pass was valuable: the assistant explicitly called out partial CQ/action support instead of declaring success. Good transparency.
- **Overall** — The interviewer was consistently careful about not fabricating ontology structure, which is excellent. The main optimization issue is conversational efficiency: too many exact-pair follow-ups once it was clear several classes would remain intentionally open.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
