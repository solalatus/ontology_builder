# Ontology-recovery eval report

Generated: 2026-10-20T18:46:41.984Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **89.6%** | **78.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 95.2% / 97.6% | 100.0% / 71.4% / 83.3% | 20/20 full · 15/15 scoped ground-truth classes matched; 21 recovered |
| Relationship recall / precision / F1 | 100.0% / 92.9% / 96.3% | 100.0% / 57.1% / 72.7% | 13/13 full · 8/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 60.0% / 100.0% / 75.0% | 100.0% / 66.7% / 80.0% | 3/5 full · 2/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **89.6%** | **78.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 95.2% / 97.6% | 100.0% / 71.4% / 83.3% | 20/20 full · 15/15 scoped ground-truth classes matched; 21 recovered |
| Relationship recall / precision / F1 | 100.0% / 92.9% / 96.3% | 100.0% / 57.1% / 72.7% | 13/13 full · 8/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 60.0% / 100.0% / 75.0% | 100.0% / 66.7% / 80.0% | 3/5 full · 2/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 49.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 38.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.5% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 49.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 38.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.5% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 80 turns, 1392s wall-clock
- Real app-agent API calls: 133 (apply_ontology_yaml called 40× · get_graph_state called 9×)
- Tool outcomes seen in transcript: 40 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 4519633 total (4479717 prompt · 39916 completion) across 213 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 10 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 12:** An additional ontology edit was skipped because only one edit could be applied in the message. The interviewer disclosed the skip and removed the unintended “Maintenance Tech” alias at turn 13.
- **Turns 55–56:** A system warning treated “all 21 classes now have a meaning” as though the interviewer claimed to have *added* 21 classes. The interviewer then corrected a claim it had not made.
- **Turns 79–80:** After promising to replay **every** recorded question and action against the model, the interviewer gave an aggregate gap summary instead. The promised item-by-item coverage check is not visible.

## Noteworthy observations
- **Turns 2–5, 8–17:** The interviewer confirmed wording before recording requirements and preserved consequential distinctions, particularly event versus state, process versus work order, and main versus supporting activities.
- **Turns 18–39:** It resisted inventing links to close navigation gaps and kept limitations of the canvas visible. Several follow-ups revisited paths the expert had already declined, making this pass lengthy.
- **Turns 41–49, 61–73:** It distinguished action preconditions from post-action verification and avoided turning unspecified checks into invented fields or rules. The expert corrected its proposed single input for the failure action at turn 67.
- **Turns 74–79:** The bounded expansion questions guarded against omissions, but mostly repeated that no further records or evidence sources were defined.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
