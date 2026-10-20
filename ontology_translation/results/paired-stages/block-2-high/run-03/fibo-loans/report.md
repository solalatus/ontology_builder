# Ontology-recovery eval report

Generated: 2026-10-20T14:05:43.778Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.5%** | **52.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 38.6% / 100.0% / 55.7% | 66.7% / 72.7% / 69.6% | 22/57 full · 16/24 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 61.3% / 90.5% / 73.1% | 64.7% / 52.4% / 57.9% | 19/31 full · 11/17 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 30.6% / 100.0% / 46.9% | 36.4% / 26.7% / 30.8% | 15/49 full · 4/11 scoped ground-truth properties matched; 15 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.5%** | **52.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 38.6% / 100.0% / 55.7% | 66.7% / 72.7% / 69.6% | 22/57 full · 16/24 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 61.3% / 90.5% / 73.1% | 64.7% / 52.4% / 57.9% | 19/31 full · 11/17 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 30.6% / 100.0% / 46.9% | 36.4% / 26.7% / 30.8% | 15/49 full · 4/11 scoped ground-truth properties matched; 15 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 9 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 19.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 15.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 66.7% / 75.0% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 9 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 19.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 15.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 117 turns, 1340s wall-clock
- Real app-agent API calls: 192 (apply_ontology_yaml called 54× · get_graph_state called 11×)
- Tool outcomes seen in transcript: 54 applied · 3 skipped · 0 no-op · 0 error
- Tokens: 9178958 total (9120561 prompt · 58397 completion) across 309 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 10 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 58:** A rename attempt removed both rate relationships, but the replacement edit was skipped, temporarily leaving the model without them. The interviewer noticed and restored them at turn 59.
- **Turn 82:** The tool applied a payment-rule update but skipped the payment-record action in the same message. The interviewer tracked the pending action and saved it at turn 83.
- **Turns 78–83, 91–92:** The canvas’s directed-path checks could not verify the hand-off and prepayment actions’ required reverse lookups. The interviewer preserved the expert-confirmed relationship directions and correctly left deployment support for target-based search unverified.

## Noteworthy observations

- **Turns 29–33:** The interviewer spent several turns resolving how Prepayment Terms could be found without inventing a new relationship. This protected the model, though the exchange was repetitive.
- **Turns 42–48, 67–71:** Good restraint: it did not infer loan type or interest-bearing status from missing links or add unsupported fields. It made the resulting undecidable checks explicit.
- **Turns 93–103:** The systematic class-by-class pass kept a candidate ledger and declined plausible but out-of-scope additions rather than expanding the model indiscriminately.
- **Turns 104–117:** The naming pass followed the requested order and kept confirmed directions intact. The final ledger accounted for the seven relationship, seven property, and three class renames.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
