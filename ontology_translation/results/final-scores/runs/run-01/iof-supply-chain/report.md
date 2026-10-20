# Ontology-recovery eval report

Generated: 2026-10-20T17:58:08.257Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.5%** | **91.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 82.1% / 92.0% / 86.8% | 25/53 full · 23/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 70.0% / 100.0% / 82.4% | 82.6% / 90.5% / 86.4% | 21/30 full · 19/23 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.5%** | **91.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 82.1% / 92.0% / 86.8% | 25/53 full · 23/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 70.0% / 100.0% / 82.4% | 82.6% / 90.5% / 86.4% | 21/30 full · 19/23 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 50.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 26.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 29.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 50.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 26.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 29.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 79 turns, 918s wall-clock
- Real app-agent API calls: 124 (apply_ontology_yaml called 36× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 36 applied · 3 skipped · 0 no-op · 0 error
- Tokens: 4213368 total (4175068 prompt · 38300 completion) across 205 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 9 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 65:** The tool applied only one edit and skipped the attempts to save the preparation and receipt checks. The interviewer noticed and successfully recorded them at turn 66.
- **Turn 70:** The same one-edit-per-message limit caused the prepare and receive action definitions to be skipped. They were recorded at turn 71, but the repeated failure suggests the interviewer did not adapt to the tool limit.
- **Turn 79:** The interviewer says an “automated second opinion” found no additional observations, but the visible transcript shows only an ontology-state check. That claim is not independently supported by the shown tool output.

## Noteworthy observations

- **Turns 17–33, 61–71:** The interviewer consistently resisted inventing shipment-specific links or treating tracking events, sites, and endpoints as proof of process completion. It kept prepare and receive blocked where evidence was unavailable.
- **Turns 43–58:** The class-definition, relationship-definition, and alias confirmations were careful but lengthy, especially after the expert repeatedly declined aliases. Batching more aggressively could shorten the interview.
- **Turn 78:** The question-and-action replay clearly separated covered answers, partial paths, and blocked actions, making the model’s limits easy to audit.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
