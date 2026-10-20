# Ontology-recovery eval report

Generated: 2026-10-20T17:00:32.985Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **69.1%** | **59.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.4% / 100.0% / 64.3% | 75.0% / 66.7% / 70.6% | 27/57 full · 18/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 67.7% / 80.8% / 73.7% | 76.5% / 50.0% / 60.5% | 21/31 full · 13/17 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 53.1% / 100.0% / 69.3% | 81.8% / 34.6% / 48.6% | 26/49 full · 9/11 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **71.4%** | **61.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.4% / 100.0% / 64.3% | 75.0% / 66.7% / 70.6% | 27/57 full · 18/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 74.2% / 88.5% / 80.7% | 82.4% / 53.8% / 65.1% | 23/31 full · 14/17 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 53.1% / 100.0% / 69.3% | 81.8% / 34.6% / 48.6% | 26/49 full · 9/11 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 18.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.5% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 83.3% / 76.9% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 18.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.5% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 96 turns, 1036s wall-clock
- Real app-agent API calls: 157 (apply_ontology_yaml called 50× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 50 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 6466069 total (6421589 prompt · 44480 completion) across 253 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 15 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 82:** The tool skipped a second ontology edit because only one edit can be applied per message. The interviewer checked the live state, identified that the amortizing-loan rule had not been saved, and added it at turn 83. No lasting omission is visible.

## Noteworthy observations
- **Turns 6–7, 75–83:** The interviewer caught a consequential distinction: a guarantee does not satisfy the collateral-only check. It kept security-kind and other conditional checks unresolved when the model lacked a reliable trigger.
- **Turns 25–29, 85–89:** It did not invent links to payment or prepayment terms. It also surfaced the readiness check’s dependence on reverse lookup rather than hiding the navigation warning.
- **Turns 49–74:** The definition and missing-value passes were thorough but repetitive. Grouping more confirmations could shorten the interview without losing the distinctions the expert had already established.
- **Turns 95–96:** The final replay clearly separated covered questions from facility-specific retrieval gaps and checks requiring external context; it did not present the ontology as complete.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
