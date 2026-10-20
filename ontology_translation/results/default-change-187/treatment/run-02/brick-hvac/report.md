# Ontology-recovery eval report

Generated: 2026-10-20T16:42:33.390Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **82.5%** | **58.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 89.7% / 100.0% / 94.6% | 100.0% / 51.4% / 67.9% | 35/39 full · 18/18 scoped ground-truth classes matched; 35 recovered |
| Relationship recall / precision / F1 | 65.7% / 69.7% / 67.6% | 68.4% / 39.4% / 50.0% | 23/35 full · 13/19 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 76.2% / 97.0% / 85.3% | 87.5% / 42.4% / 57.1% | 32/42 full · 14/16 scoped ground-truth properties matched; 33 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **92.3%** | **63.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 89.7% / 100.0% / 94.6% | 100.0% / 51.4% / 67.9% | 35/39 full · 18/18 scoped ground-truth classes matched; 35 recovered |
| Relationship recall / precision / F1 | 94.3% / 100.0% / 97.1% | 89.5% / 51.5% / 65.4% | 33/35 full · 17/19 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 76.2% / 97.0% / 85.3% | 87.5% / 42.4% / 57.1% | 32/42 full · 14/16 scoped ground-truth properties matched; 33 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 8 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 18.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 37.5% / 40.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 8 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 18.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 115 turns, 1478s wall-clock
- Real app-agent API calls: 195 (apply_ontology_yaml called 67× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 67 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 9911352 total (9851028 prompt · 60324 completion) across 310 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 8 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 38, 92–94, 114–115:** Air-handler part relationships were recorded from component to handler, creating action-navigation warnings. The economizer direction was corrected at turn 93, but the other five were only caught and reversed during the final checklist.
- **Turn 94:** The tool skipped an additional ontology edit because only one edit could be applied per message. The interviewer did not identify the skipped edit or explicitly verify whether it still needed applying.
- **Turns 113–114:** A system warning challenged “all 32” because the replay turn added no questions, conflating the existing total with that turn’s edit count. The interviewer checked and clarified that 32 questions already existed.

## Noteworthy observations

- **Turns 28–44, 78–93:** Strong discipline around evidence: the interviewer kept serving assignments, physical locations, reported states, BAS permission, and verified operation separate, and left unsupported space-to-zone, plant-path, and economizer-sensing links open.
- **Turns 56–77:** The meaning and missing-value passes were thorough but highly repetitive. Batching more confirmations could have shortened the interview without losing the expert’s distinctions.
- **Turns 88–89, 113–115:** The interviewer found a practical reverse lookup for thermostats serving a known zone, while correctly retaining the unresolved terminal-unit route. The final checklist also caught the remaining relationship-direction error.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
