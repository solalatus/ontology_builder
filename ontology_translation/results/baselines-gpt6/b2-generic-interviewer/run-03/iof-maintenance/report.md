# Ontology-recovery eval report

Generated: 2026-10-21T04:42:11.309Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **37.1%** | **31.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 86.7% / 74.3% | 66.7% / 66.7% / 66.7% | 13/20 full · 10/15 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 38.5% / 35.7% / 37.0% | 37.5% / 21.4% / 27.3% | 5/13 full · 3/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/5 full · 0/2 scoped ground-truth properties matched; 1 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **42.0%** | **37.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 86.7% / 74.3% | 66.7% / 66.7% / 66.7% | 13/20 full · 10/15 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 53.8% / 50.0% / 51.9% | 62.5% / 35.7% / 45.5% | 7/13 full · 5/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/5 full · 0/2 scoped ground-truth properties matched; 1 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 33.3% / 30.8% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 40.0% / 66.7% / 50.0% | 2/5 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 100.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 46.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 66.7% / 61.5% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 40.0% / 66.7% / 50.0% | 2/5 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 100.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 46.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 7 turns, 138s wall-clock
- Real app-agent API calls: 24 (apply_ontology_yaml called 9× · get_graph_state called 2×)
- Tool outcomes seen in transcript: 9 applied · 2 skipped · 0 no-op · 0 error
- Tokens: 160617 total (151234 prompt · 9383 completion) across 31 API calls

## LLM review of the conversation

## Errors
- **Turn 5:** The assistant repeats its acknowledgement and two questions in the same message—a visible duplicate.
- **Turns 6–7:** The tool reports that an additional ontology edit was skipped in each turn. The assistant does not acknowledge the skipped edits or establish whether the intended changes were saved before saying the model is complete.

## Noteworthy observations
- **Turns 2–5:** The interviewer checks proposed links and cardinality rules rather than assuming them. This lets the expert rule out unsupported direct failure links, investigation statuses, and assignment rules.
- **Turn 7:** The closing summary preserves the key distinction: a process may leave an item degraded without an event, but a failed state begins with a failure event.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
