# Ontology-recovery eval report

Generated: 2026-10-21T04:00:16.231Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **34.5%** | **36.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 43.6% / 68.0% / 53.1% | 61.1% / 44.0% / 51.2% | 17/39 full · 11/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 22.9% / 25.0% / 23.9% | 31.6% / 18.8% / 23.5% | 8/35 full · 6/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 21.4% / 34.6% / 26.5% | 43.8% / 26.9% / 33.3% | 9/42 full · 7/16 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 0.0% | 0.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **42.4%** | **40.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 43.6% / 68.0% / 53.1% | 61.1% / 44.0% / 51.2% | 17/39 full · 11/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 42.9% / 46.9% / 44.8% | 42.1% / 25.0% / 31.4% | 15/35 full · 8/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 23.8% / 38.5% / 29.4% | 50.0% / 30.8% / 38.1% | 10/42 full · 8/16 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 0.0% | 0.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 18 recovered |
| Action identification recall / precision / F1 | 40.0% / 14.3% / 21.1% | 2/5 ground-truth actions matched by name/meaning; 14 recovered |
| Action input-class accuracy | 50.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 7.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 16.7% / 24.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 18 recovered |
| Action identification recall / precision / F1 | 40.0% / 14.3% / 21.1% | 2/5 ground-truth actions matched by name/meaning; 14 recovered |
| Action input-class accuracy | 50.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 7.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 8 turns, 267s wall-clock
- Real app-agent API calls: 32 (apply_ontology_yaml called 14× · get_graph_state called 3×)
- Tool outcomes seen in transcript: 14 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 363378 total (343135 prompt · 20243 completion) across 41 API calls

## LLM review of the conversation

## Errors
- **Turns 3 and 5:** The interviewer’s response is duplicated within each turn, repeating both the summary and questions.
- **Turns 6–7:** The interviewer says it left pump and cooling-tower impact traces unconnected, then discovers two existing checks that incorrectly imply those connections. The earlier state summary was premature.
- **Turn 7:** An ontology edit was skipped because only one edit could be applied per message. The interviewer correctly disclosed the incomplete model and applied the remaining corrections in turn 8.

## Noteworthy observations
- **Turns 1–3:** The interviewer elicited a concrete troubleshooting sequence and preserved the expert’s distinction between evidence prompting investigation and evidence warranting dispatch, without inventing a universal threshold.
- **Turns 4–6:** Follow-ups usefully separated economizer cooling conditions from CO₂ ventilation checks, and equipment location from what equipment serves. The expert also corrected an over-broad terminal-unit-to-zone trace.
- **Turn 8:** The final response reports a consistency check and clearly states which plant-impact relationships remain unverified.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
