# Ontology-recovery eval report

Generated: 2026-10-21T04:35:55.201Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **46.6%** | **40.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 42.1% / 88.9% / 57.1% | 58.3% / 51.9% / 54.9% | 24/57 full · 14/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 41.9% / 44.8% / 43.3% | 41.2% / 24.1% / 30.4% | 13/31 full · 7/17 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 30.6% / 55.6% / 39.5% | 63.6% / 25.9% / 36.8% | 15/49 full · 7/11 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **50.2%** | **42.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 45.6% / 96.3% / 61.9% | 62.5% / 55.6% / 58.8% | 26/57 full · 15/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 45.2% / 48.3% / 46.7% | 41.2% / 24.1% / 30.4% | 14/31 full · 7/17 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 32.7% / 59.3% / 42.1% | 63.6% / 25.9% / 36.8% | 16/49 full · 7/11 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 20.0% / 20.0% / 20.0% | 1/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 13.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 50.0% / 36.4% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 20.0% / 20.0% / 20.0% | 1/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 13.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 9 turns, 178s wall-clock
- Real app-agent API calls: 23 (apply_ontology_yaml called 9× · get_graph_state called 2×)
- Tool outcomes seen in transcript: 9 applied · 2 skipped · 0 no-op · 0 error
- Tokens: 229244 total (215821 prompt · 13423 completion) across 32 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 1 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 2 and 8:** The tool skipped an additional ontology edit because only one edit could be applied per message. The interviewer did not revisit either skipped edit before declaring the model complete at turn 9; the transcript does not show whether those edits were still needed.
- **Turns 3 and 5:** The interviewer’s question appeared twice in the same response, with slightly different wording at turn 5. This looks like a response-generation bug.

## Noteworthy observations

- **Turns 2–7:** Follow-ups usefully separated concepts that could have been conflated: inspection versus readiness confirmation, facility versus loan, terms versus schedules, and payment transactions versus payment events.
- **Turns 3–8:** The interviewer generally respected the expert’s limits instead of inventing loan-to-facility links, mandatory event fields, draw-posting rules, or authority to correct records after a failed check.
- **Turn 9:** The completion claim was confident despite the earlier skipped edits; a final check of whether those proposed edits mattered would have made the close more reliable.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
