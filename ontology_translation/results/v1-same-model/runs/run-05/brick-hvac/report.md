# Ontology-recovery eval report

Generated: 2026-11-05T03:11:32.001Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **53.6%** | **49.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 74.4% / 87.9% / 80.6% | 94.4% / 51.5% / 66.7% | 29/39 full · 17/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 25.7% / 28.1% / 26.9% | 36.8% / 21.9% / 27.5% | 9/35 full · 7/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.2% / 65.5% / 53.5% | 75.0% / 41.4% / 53.3% | 19/42 full · 12/16 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **82.8%** | **68.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 82.1% / 97.0% / 88.9% | 100.0% / 54.5% / 70.6% | 32/39 full · 18/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 80.0% / 87.5% / 83.6% | 89.5% / 53.1% / 66.7% | 28/35 full · 17/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 64.3% / 93.1% / 76.1% | 93.8% / 51.7% / 66.7% | 27/42 full · 15/16 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 8 recovered |
| Action identification recall / precision / F1 | 60.0% / 60.0% / 60.0% | 3/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 18.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 10.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 13.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 50.0% / 53.3% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 8 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 18.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 10.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 13.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 97 turns, 980s wall-clock
- Real app-agent API calls: 158 (apply_ontology_yaml called 54× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 54 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 5618872 total (5572194 prompt · 46678 completion) across 255 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 12 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 16, 33–34, 95–97:** The interviewer added `ThermostatTemperatureSensor` as a separate class, then learned the thermostat’s point should use `TemperatureSensor`. The edit tool could not remove the extra class, so the saved model retains an acknowledged erroneous, unconnected class.
- **Turn 17:** The interviewer asked the expert to remove classes directly from the canvas; the expert could not edit it. The request did not provide a workable cleanup path.

## Noteworthy observations

- **Turns 13–15, 26–29:** Good restraint on plant troubleshooting: the interviewer adopted the expert’s correction rather than presenting candidate assets as a verified cooling path.
- **Turns 49–50, 79–81:** Critical prerequisites—active-setpoint context, economizer suitability criteria, and a source of command permission—surfaced late. Asking about these earlier could have clarified which proposed actions were actually executable.
- **Turns 65–75:** The one-group-at-a-time alias review consumed many turns, most yielding “none.” Batching exact-alias questions or offering a default of no aliases would be more efficient.
- **Turns 85–86, 95–96:** The expert had to separate *starting* an occupied-zone check from its operating-status finding. The interviewer eventually caught that the terminal-unit route lacked verified zone–space membership and narrowed the first-pass action to an assigned thermostat.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
