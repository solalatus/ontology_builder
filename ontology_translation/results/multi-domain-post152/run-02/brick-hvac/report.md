# Ontology-recovery eval report

Generated: 2026-09-02T18:39:25.710Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **78.6%** | **62.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 84.6% / 100.0% / 91.7% | 100.0% / 54.5% / 70.6% | 33/39 full · 18/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 74.3% / 78.8% / 76.5% | 68.4% / 39.4% / 50.0% | 26/35 full · 13/19 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 52.4% / 95.7% / 67.7% | 81.3% / 56.5% / 66.7% | 22/42 full · 13/16 scoped ground-truth properties matched; 23 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **82.5%** | **67.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 84.6% / 100.0% / 91.7% | 100.0% / 54.5% / 70.6% | 33/39 full · 18/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 85.7% / 90.9% / 88.2% | 89.5% / 51.5% / 65.4% | 30/35 full · 17/19 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 52.4% / 95.7% / 67.7% | 81.3% / 56.5% / 66.7% | 22/42 full · 13/16 scoped ground-truth properties matched; 23 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 60.0% / 75.0% / 66.7% | 3/5 ground-truth actions matched by name/meaning; 4 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 100.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 90.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 77.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth actions matched by name/meaning; 4 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 100.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 90.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 77.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 55 turns, 1030s wall-clock
- Real app-agent API calls: 131 (apply_ontology_yaml called 36× · get_graph_state called 36×)
- Tool outcomes seen in transcript: 36 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 9171468 total (9145214 prompt · 26254 completion) across 197 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**: Tool says `✓ Applied: 10 added` for the action list, but the assistant immediately says the actions “can’t be recorded properly yet” because actions require an input class first. That’s contradictory and looks like state/tool integration confusion.
- **Turn 3**: System reports “8 consistency problem(s) unresolved — see Check.” The assistant ignores this and continues normally without surfacing or resolving them.
- **Turn 29**: Tool reports `✓ Applied: 0 added, 16 updated` after the user only defined 5 relationship meanings. Update count looks implausible / likely misapplied bulk edit.
- **Turn 45–48**: The agent creates a formal action `verifyOccupiedZoneHasActiveConditioning`, then discovers its own graph-direction/tool limitation, adds an inverse relationship to compensate, gets forced to remove it, and finally removes the action. This is a real state-management / planning failure that caused churn.
- **Turn 46**: Assistant frames the bidirectional `Thermostat ↔ Zone` issue as requiring one modeled direction only. That may be a tool constraint, but the agent had just added the inverse as a workaround; this is effectively a self-created inconsistency.
- **Turn 52**: Assistant says “What I confirmed from the persisted competency questions” and numbers them `cq1...cq14`, but the original questions were 10 plus 2 added later; the numbering/mapping is muddled and not transparently grounded.
- **Turn 52**: Validation says `cq4` is “Which temperature setpoints belong to a given air handler?” and `cq5` is “If air temperature is off target...” but earlier numbering in the interview did not clearly establish this persisted numbering. Looks like unstable indexing/state labeling.
- **Turn 52**: Assistant claims “other originally named actions were intentionally kept as rules/checks instead of formal actions,” but earlier it had already attempted to record actions before classes existed. The retrospective summary hides that inconsistency.

## Noteworthy observations
- **Turn 1**: Good opening move: asks for competency questions before classes/properties.
- **Turns 2–4**: Efficiently captures plant-side scope addition and operating context (`occupied/unoccupied/unknown`), which materially affects later modeling.
- **Turns 5–10**: Strong interview technique in batching classes into small justified sets and explicitly testing generic-vs-specific modeling choices.
- **Turns 8–10**: Good follow-up on over-generic classes (`Equipment`, `HeatingCoolingDevice`, `Valve`). The persona’s push toward operationally meaningful specificity was elicited well.
- **Turns 11–18**: Relationship elicitation is generally solid, but the agent repeatedly proposes directions/links that don’t quite match the persona’s mental model, then corrects after feedback. Prompt could likely be improved to ask for preferred direction first instead of proposing many candidate edges.
- **Turn 13–15**: Good catch that generic temperature/CO2 classes were too broad for actual questions; the agent paused and introduced more specific classes instead of forcing properties onto the generic ones.
- **Turn 15**: Nice ambiguity handling around aliases (`air temperature sensor` vs generic `temperature sensor`).
- **Turns 19–23**: Property elicitation was well-structured and operationally grounded (“what is needed for decision/check/action?”).
- **Turn 21**: Good nuance captured: `OccupancySensor` should not share the same property name as `Zone`, even if values overlap.
- **Turns 31–34**: Asking “what breaks if missing or wrong?” is especially effective; it forced operational justification for constraints rather than arbitrary schema design.
- **Turns 35–39**: Rule elicitation was mixed. Good job separating pure temperature logic from equipment availability, but the economizer rule was knowingly accepted as high-level/plain-language despite not being machine-checkable in the current model.
- **Turn 38**: Good discipline in noticing when a proposed rule referenced unmodeled facts. The follow-up was appropriate.
- **Turns 40–48**: Action-phase was inefficient. The interviewer should have anticipated the one-input-class limitation and graph direction problem before formalizing `verifyOccupiedZoneHasActiveConditioning`.
- **Turn 42**: Good recovery when the assistant noticed verification referred to an unmodeled `mode`; it asked for a constrained fix rather than improvising.
- **Turn 48–52**: Bounded domain expansion was handled well: the agent explicitly routed new concepts back through earlier phases instead of silently inserting them.
- **Turn 50**: Good restraint after the persona mentioned pumps/cooling towers/heat exchangers: the interviewer did not invent plant-path edges just to complete a chain.
- **Turn 52**: Validation pass is useful and reviewer-friendly, especially calling out partial coverage and likely false positives. However, it arrived very late; a lighter mid-interview validation might have caught the zone/action navigation issue earlier.
- **Overall**: The agent is strong at incremental ontology elicitation and at preserving domain-expert wording. Main optimization opportunity is reducing self-inflicted churn from tool constraints: it should reason about navigability/action formalization earlier before committing edits.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
