# Ontology-recovery eval report

Generated: 2026-10-21T04:24:21.424Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **29.7%** | **29.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 35.0% / 58.3% / 43.8% | 33.3% / 41.7% / 37.0% | 7/20 full · 5/15 scoped ground-truth classes matched; 12 recovered |
| Relationship recall / precision / F1 | 23.1% / 23.1% / 23.1% | 25.0% / 15.4% / 19.0% | 3/13 full · 2/8 scoped ground-truth relationships matched; 13 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 20.0% / 25.0% / 22.2% | 50.0% / 25.0% / 33.3% | 1/5 full · 1/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **34.3%** | **35.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 40.0% / 66.7% / 50.0% | 40.0% / 50.0% / 44.4% | 8/20 full · 6/15 scoped ground-truth classes matched; 12 recovered |
| Relationship recall / precision / F1 | 30.8% / 30.8% / 30.8% | 37.5% / 23.1% / 28.6% | 4/13 full · 3/8 scoped ground-truth relationships matched; 13 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 20.0% / 25.0% / 22.2% | 50.0% / 25.0% / 33.3% | 1/5 full · 1/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 44.4% / 50.0% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 9 recovered |
| Action identification recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 66.7% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 24.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 66.7% / 75.0% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 9 recovered |
| Action identification recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 66.7% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 24.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 8 turns, 143s wall-clock
- Real app-agent API calls: 23 (apply_ontology_yaml called 8× · get_graph_state called 2×)
- Tool outcomes seen in transcript: 8 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 155191 total (145821 prompt · 9370 completion) across 31 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 1 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 2:** The interviewer output two near-duplicate responses in one message, repeating the same modeling summary and questions.
- **Turn 3:** It treated final cost as a work-order closure precondition. The expert corrected this: final cost is verified in the closed record, not required as a separate precondition.
- **Turn 4:** A second ontology edit was skipped because only one edit could be applied in that message. The interviewer disclosed the incomplete update and applied the remaining corrections in turn 5.

## Noteworthy observations
- **Turns 2–5:** The interviewer tested ambiguous distinctions—failure process versus event, activity versus supporting work, and qualification versus certification—and incorporated the expert’s corrections.
- **Turns 6–7:** It avoided inferring priority or an automatic work-order trigger from asset state, then confirmed how strategy and failure effects relate to those decisions.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
