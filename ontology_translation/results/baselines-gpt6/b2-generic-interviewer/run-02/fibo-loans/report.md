# Ontology-recovery eval report

Generated: 2026-10-21T04:16:40.944Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **25.7%** | **33.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 15.8% / 60.0% / 25.0% | 33.3% / 53.3% / 41.0% | 9/57 full · 8/24 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 22.6% / 41.2% / 29.2% | 35.3% / 35.3% / 35.3% | 7/31 full · 6/17 scoped ground-truth relationships matched; 17 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 18.4% / 30.0% / 22.8% | 45.5% / 16.7% / 24.4% | 9/49 full · 5/11 scoped ground-truth properties matched; 30 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **27.4%** | **33.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 17.5% / 66.7% / 27.8% | 33.3% / 53.3% / 41.0% | 10/57 full · 8/24 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 22.6% / 41.2% / 29.2% | 35.3% / 35.3% / 35.3% | 7/31 full · 6/17 scoped ground-truth relationships matched; 17 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 20.4% / 33.3% / 25.3% | 45.5% / 16.7% / 24.4% | 10/49 full · 5/11 scoped ground-truth properties matched; 30 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 21.4% / 28.6% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 14 recovered |
| Action identification recall / precision / F1 | 20.0% / 14.3% / 16.7% | 1/5 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 3.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 28.6% / 38.1% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 14 recovered |
| Action identification recall / precision / F1 | 40.0% / 28.6% / 33.3% | 2/5 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 3.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 6 turns, 160s wall-clock
- Real app-agent API calls: 16 (apply_ontology_yaml called 6× · get_graph_state called 1×)
- Tool outcomes seen in transcript: 6 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 117341 total (107544 prompt · 9797 completion) across 22 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 1 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 6:** The interviewer says the final model “passed its consistency check,” but the visible tool response only confirms that the ontology state was checked; it does not show a pass result.

## Noteworthy observations
- **Turns 2–5:** The interviewer usefully tested boundaries instead of treating facilities as loans or scheduled payments as recorded payments. The question about an empty payment history at setup caught an important exception.
- **Turn 6:** The interview closes without probing what a valid collateral link must contain for a secured loan, despite collateral being an explicit setup sign-off check in turn 1.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
