# Ontology-recovery eval report

Generated: 2026-11-05T05:08:47.043Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **64.5%** | **71.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 45.6% / 100.0% / 62.7% | 79.2% / 73.1% / 76.0% | 26/57 full · 19/24 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 71.0% / 84.6% / 77.2% | 88.2% / 57.7% / 69.8% | 22/31 full · 15/17 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 36.7% / 100.0% / 53.7% | 90.9% / 55.6% / 69.0% | 18/49 full · 10/11 scoped ground-truth properties matched; 18 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.7%** | **73.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 45.6% / 100.0% / 62.7% | 79.2% / 73.1% / 76.0% | 26/57 full · 19/24 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 74.2% / 88.5% / 80.7% | 94.1% / 61.5% / 74.4% | 23/31 full · 16/17 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 36.7% / 100.0% / 53.7% | 90.9% / 55.6% / 69.0% | 18/49 full · 10/11 scoped ground-truth properties matched; 18 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 28.6% / 28.6% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 14.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 57.1% / 57.1% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 14.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 85 turns, 796s wall-clock
- Real app-agent API calls: 143 (apply_ontology_yaml called 45× · get_graph_state called 10×)
- Tool outcomes seen in transcript: 45 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 5427567 total (5385836 prompt · 41731 completion) across 228 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 83:** The interviewer said the loan had three schedule links; the model had four, including the interest-rate reset schedule. It corrected the recap at turn 84.
- **Turns 84–85:** A second-opinion review found that four actions treated evidence of a *successful* check as a precondition for running it. That would prevent them from reporting missing evidence as “unconfirmed.” The interviewer updated the actions at turn 85.
- **Turns 58–59:** The expert said “Payment Transaction” was shorthand, not an exact alias for “Individual Payment Transaction.” The interviewer nevertheless said it remained recorded as an alternative name; that alias should be reconsidered.

## Noteworthy observations

- **Turns 9–15, 33–44:** Good restraint in separating loans, facilities, and agreements, and in leaving unsupported record mappings open rather than inventing links.
- **Turns 25–26, 74–76:** The interviewer handled useful edge cases well: a missing collateral link does not invalidate guarantee support, and a reverse lookup for interest terms does not require a new relationship.
- **Turns 52–82:** The wording, constraint, and expansion passes became repetitive. Many successive questions reconfirmed individual definitions or that no more detail was needed; batching would likely have shortened the interview.
- **Turns 83–85:** The final replay surfaced a new gap—how to select the dated collateral value used for a loan—and the interviewer explicitly preserved it as unresolved.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
