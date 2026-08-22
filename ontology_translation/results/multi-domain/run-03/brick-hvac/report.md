# Ontology-recovery eval report

Generated: 2026-08-22T16:52:10.283Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **68.5%** | **52.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 64.1% / 100.0% / 78.1% | 83.3% / 60.0% / 69.8% | 25/39 full · 15/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 54.3% / 59.4% / 56.7% | 36.8% / 21.9% / 27.5% | 19/35 full · 7/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 54.8% / 100.0% / 70.8% | 75.0% / 52.2% / 61.5% | 23/42 full · 12/16 scoped ground-truth properties matched; 23 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.5%** | **62.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 64.1% / 100.0% / 78.1% | 83.3% / 60.0% / 69.8% | 25/39 full · 15/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 74.3% / 81.3% / 77.6% | 73.7% / 43.8% / 54.9% | 26/35 full · 14/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 54.8% / 100.0% / 70.8% | 75.0% / 52.2% / 61.5% | 23/42 full · 12/16 scoped ground-truth properties matched; 23 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 50.0% / 22.2% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 80.0% / 44.4% / 57.1% | 4/5 ground-truth actions matched by name/meaning; 9 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 21.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 27.6% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 50.0% / 22.2% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 80.0% / 44.4% / 57.1% | 4/5 ground-truth actions matched by name/meaning; 9 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 21.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 27.6% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 44 turns, 760s wall-clock
- Real app-agent API calls: 86 (apply_ontology_yaml called 24× · get_graph_state called 18×)
- Tool outcomes seen in transcript: 24 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3738496 total (3714198 prompt · 24298 completion) across 163 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**: Tool says `19 added, 0 updated` after the persona explicitly corrected/refined the prior 23-question draft. This looks like misapplied persistence: corrections should likely have updated/replaced prior items, not only added.
- **Turn 14**: `Economizer` is added as a new class late, even though it had already been implicitly discussed as part of AHU parts and then introduced only because the interviewer noticed it ad hoc. Not a hard bug, but indicates class capture lagging behind elicited content.
- **Turn 24**: The interviewer had to admit the old generic `TemperatureSetpoint` class still remained because the tool could not remove it. This leaves the live model knowingly inconsistent with the confirmed conceptual model.
- **Turn 42–44**: The interviewer adds inverse relationships for action reachability, then immediately discovers the tool/profile only wants one direction per connection. This created duplicate inverse edges and forced a later corrective decision. Real state-management/design bug.
- **Turn 44**: The session ends with unresolved duplicate relationships still present in the live graph (`feeds/fedBy`, `serves/servedBy`) and the superseded generic setpoint class still lingering. The interviewer correctly flags this, but the ontology remains in a knowingly dirty state.
- **Turn 31**: Tool reports `19 updated` after only six relationship meanings were provided. That update count looks suspicious and may indicate the tool is touching more records than intended.

## Noteworthy observations
- **Turn 1**: Strong opening structure: starts from competency questions before classes/properties. Good ontology-elicitation discipline.
- **Turn 2**: The interviewer over-atomized the question list too aggressively, introducing distinctions the persona did not endorse (thermostat→space, terminal unit→zone, split occupied-zone check). Good that it asked for confirmation before persisting, but this pattern caused avoidable correction churn.
- **Turn 3**: Good recovery: interviewer explicitly summarized the persona’s corrections and preserved them accurately.
- **Turn 4**: Useful “role/context” follow-up was well targeted and kept narrow.
- **Turns 5–7**: Good technique testing candidate classes in batches and explicitly probing whether generic abstractions (`Equipment`, `AirHandlingSystem`, generic `Valve`, generic `HeatPump`) were real or unnecessary.
- **Turn 8**: Slightly risky recap of “20 confirmed classes” before later adding `Economizer`; recaps were helpful but became stale quickly.
- **Turn 9–11**: Good sensitivity to relationship direction and containment wording. The interviewer let the persona choose operationally natural directions instead of imposing generic ontology conventions.
- **Turn 10**: Efficient focused follow-up on direct location targets by class.
- **Turn 12–13**: Good handling of relationship-name granularity; interviewer surfaced a tool constraint instead of silently inventing many hyper-specific predicates.
- **Turn 14–16**: Strong pushback handling. The persona corrected several wrong plant-side links, and the interviewer accepted the correction cleanly rather than defending the initial model.
- **Turn 16**: The interviewer’s claim that some classes “still need” more relationships because they only had incoming links is questionable ontology reasoning; a class having only incoming edges is not itself a gap.
- **Turn 17–18**: Nice correction loop on spatial structure. Persona introduced `Building --hasZone--> Zone`; interviewer caught it and confirmed explicitly.
- **Turns 20–23**: Property elicitation was generally strong, especially distinguishing shared property names from class-specific value sets (`status` values differ by class; valves/dampers need `position`, plenum needs `airflowState`).
- **Turn 23**: Excellent catch by the persona that the setpoint question could not be modeled properly with one generic `TemperatureSetpoint` plus an `activeForControl` boolean. This was an important conceptual correction.
- **Turn 24**: Good transparency from the interviewer about tool limitations and the superseded-but-not-removed class; useful reviewer behavior even though the state remained dirty.
- **Turns 35–39**: Rule elicitation was careful and appropriately constrained to already-modeled structures. Good that the interviewer flagged when a rule overreached the current graph.
- **Turn 38**: Strong meta-reasoning: interviewer recognized the current model only directly supported the thermostat branch and explicitly checked whether to rely on the zone→space→terminal-unit path in the rule.
- **Turns 40–41**: Good action elicitation pivot, but notably late. Actions came only after rules, even though the initial framing said questions first, then actions, then ontology. This likely contributed to the later relationship-direction conflict.
- **Turns 42–44**: The biggest prompt-level issue: action modeling happened after relationship directions were already committed, forcing inverse-link retrofits and duplicate-edge cleanup. For this agent, action/navigation direction should probably be tested earlier when relationships are first elicited.
- **Overall**: The interviewer was disciplined, transparent, and good at summarizing corrections, but the process was somewhat inefficient due to repeated “confirm before persist” loops followed by tool limitations that prevented real replacement/removal. The prompt might benefit from asking earlier whether the ontology must support traversal from complaint object → upstream/source object, to avoid later direction reversals.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
