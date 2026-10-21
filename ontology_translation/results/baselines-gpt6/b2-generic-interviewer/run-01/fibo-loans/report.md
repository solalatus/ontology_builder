# Ontology-recovery eval report

Generated: 2026-10-21T03:54:38.196Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **34.1%** | **41.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 33.3% / 79.2% / 46.9% | 62.5% / 62.5% / 62.5% | 19/57 full · 15/24 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 35.5% / 50.0% / 41.5% | 35.3% / 27.3% / 30.8% | 11/31 full · 6/17 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 8.2% / 44.4% / 13.8% | 27.3% / 33.3% / 30.0% | 4/49 full · 3/11 scoped ground-truth properties matched; 9 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **38.9%** | **44.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 38.6% / 91.7% / 54.3% | 66.7% / 66.7% / 66.7% | 22/57 full · 16/24 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 38.7% / 54.5% / 45.3% | 41.2% / 31.8% / 35.9% | 12/31 full · 7/17 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 10.2% / 55.6% / 17.2% | 27.3% / 33.3% / 30.0% | 5/49 full · 3/11 scoped ground-truth properties matched; 9 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 33.3% / 37.5% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 9 recovered |
| Action identification recall / precision / F1 | 40.0% / 50.0% / 44.4% | 2/5 ground-truth actions matched by name/meaning; 4 recovered |
| Action input-class accuracy | 50.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 7.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 44.4% / 50.0% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 9 recovered |
| Action identification recall / precision / F1 | 60.0% / 75.0% / 66.7% | 3/5 ground-truth actions matched by name/meaning; 4 recovered |
| Action input-class accuracy | 50.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 7.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 5 turns, 129s wall-clock
- Real app-agent API calls: 15 (apply_ontology_yaml called 4× · get_graph_state called 2×)
- Tool outcomes seen in transcript: 4 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 109185 total (98846 prompt · 10339 completion) across 20 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 1 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 2:** The interviewer’s response is duplicated verbatim.
- **Turns 3 and 5:** The tool skips an edit at turn 3, saying only one ontology edit is allowed per message, but reports both an applied edit and a rename at turn 5. The edit limit appears inconsistently enforced.

## Noteworthy observations
- **Turns 2–3:** The interviewer asks useful questions about which relationships the records actually support. The expert’s correction prevents an unsupported required draw-to-sub-facility link.
- **Turn 3:** The interviewer explicitly acknowledges the skipped edit rather than claiming the distinct schedule records were added.
- **Turns 4–5:** The final scope check usefully distinguishes a borrower’s repayment obligation from a guaranty and from a credit-enhancement beneficiary.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
