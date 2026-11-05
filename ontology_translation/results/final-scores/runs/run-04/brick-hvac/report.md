# Ontology-recovery eval report

Generated: 2026-11-05T04:15:30.035Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **68.4%** | **61.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 71.8% / 100.0% / 83.6% | 94.4% / 60.7% / 73.9% | 28/39 full · 17/18 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 42.9% / 51.7% / 46.9% | 52.6% / 34.5% / 41.7% | 15/35 full · 10/19 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 59.5% / 100.0% / 74.6% | 87.5% / 56.0% / 68.3% | 25/42 full · 14/16 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **82.9%** | **71.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 71.8% / 100.0% / 83.6% | 94.4% / 60.7% / 73.9% | 28/39 full · 17/18 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 82.9% / 100.0% / 90.6% | 89.5% / 58.6% / 70.8% | 29/35 full · 17/19 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 59.5% / 100.0% / 74.6% | 87.5% / 56.0% / 68.3% | 25/42 full · 14/16 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 13.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 16.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 100.0% / 60.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 13.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 16.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 92 turns, 1114s wall-clock
- Real app-agent API calls: 168 (apply_ontology_yaml called 58× · get_graph_state called 11×)
- Tool outcomes seen in transcript: 58 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 7665297 total (7618493 prompt · 46804 completion) across 260 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 51:** A tool edit removed the unsupported Zone → Space link but skipped a second edit in the same message. The interviewer noticed and saved the connection meanings at turn 52.
- **Turns 18–51:** The interviewer initially recorded Zone → Space as navigable despite the expert’s warning that no reliable assignment existed for a particular room. It was removed only at turn 51.
- **Turns 75–76:** The occupied-zone rule initially treated healthy device readings as prerequisites for *performing* the check, which would have hidden faults. The expert corrected this, and the rule was updated.
- **Turns 40 and 92:** The consistency check appears to misread `Economizer.status` as air-handler status. The interviewer identified the warning as incorrect, but it remained in the final check.

## Noteworthy observations

- **Turns 24–29, 77–81:** Strong restraint around missing paths and command points: the interviewer kept pump selection, economizer use, and cooling/heating changes from becoming unsupported automatic actions.
- **Turns 44–64:** The meaning-and-alias pass was careful but unusually long, often confirming a small group of already-established links per turn. Batching more of those confirmations could shorten the interview.
- **Turns 91–92:** The question-by-question replay made covered, partial, and open capabilities easy to audit, and surfaced a useful final clarification about what the CO₂ comparison can support.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
