# Ontology-recovery eval report

Generated: 2026-10-20T19:00:16.812Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.2%** | **94.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 85.7% / 96.0% / 90.6% | 25/53 full · 24/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 73.3% / 100.0% / 84.6% | 91.3% / 95.5% / 93.3% | 22/30 full · 21/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.2%** | **94.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 85.7% / 96.0% / 90.6% | 25/53 full · 24/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 73.3% / 100.0% / 84.6% | 91.3% / 95.5% / 93.3% | 22/30 full · 21/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 40.0% / 100.0% / 57.1% | 2/5 ground-truth actions matched by name/meaning; 2 recovered |
| Action input-class accuracy | 100.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 61.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 29.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 40.0% / 100.0% / 57.1% | 2/5 ground-truth actions matched by name/meaning; 2 recovered |
| Action input-class accuracy | 100.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 61.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 29.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 76 turns, 793s wall-clock
- Real app-agent API calls: 124 (apply_ontology_yaml called 31× · get_graph_state called 13×)
- Tool outcomes seen in transcript: 31 applied · 2 skipped · 1 no-op · 0 error
- Tokens: 4597831 total (4562295 prompt · 35536 completion) across 201 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 9 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 9:** The tool skipped an additional ontology edit because only one edit could be applied in the message. The interviewer correctly treated the connections as unrecorded, but the attempted batch did not fully apply.
- **Turns 13–14:** The tool reported successful edits and then another skipped edit. The location-role correction was left half-finished at turn 13 (**Ship From Location** existed; **Ship To Location** did not) before being fixed at turn 14.
- **Turn 48:** An attempted ontology edit made no change. The subsequent edit removed the overly broad **item** alias, so this appears to be a harmless redundant tool call.
- **Turn 76:** The interviewer cites an “automated second-opinion review,” but the visible transcript shows only a state check, not a separate review result. That attribution is unsupported by the visible tool output.

## Noteworthy observations

- **Turns 2–3, 20–35:** The interviewer preserved important distinctions—carrier versus forwarder, arrival versus receipt, and operational checks versus established connections—and did not invent paths when the expert could not supply them.
- **Turns 7–8:** “Leave [roles] out of the current model” sounded more final than the expert intended. The expert corrected the scope, and the interviewer adopted a first-pass-versus-wider-model distinction.
- **Turns 55–59:** The expert caught proposed extra blockers for preparation and receipt. The interviewer corrected the rules, keeping preconditions separate from post-action verification.
- **Turns 61–68:** Repeated questions about read-back evidence established that prepare, dispatch, and receive could not yet be verified, but revisited already-known gaps several times. An earlier summary of unresolved evidence paths could have shortened this phase.
- **Turns 75–76:** The final replay clearly separates covered, partial, and unsupported requirements, and reports the three unfinished actions without presenting them as complete.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
