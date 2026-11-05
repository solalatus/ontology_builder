# Ontology-recovery eval report

Generated: 2026-11-05T03:23:51.560Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **80.2%** | **64.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 73.3% / 78.6% / 75.9% | 13/20 full · 11/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 66.7% / 64.0% | 75.0% / 50.0% / 60.0% | 8/13 full · 6/8 scoped ground-truth relationships matched; 12 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **80.2%** | **64.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 73.3% / 78.6% / 75.9% | 13/20 full · 11/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 66.7% / 64.0% | 75.0% / 50.0% / 60.0% | 8/13 full · 6/8 scoped ground-truth relationships matched; 12 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 62.5% / 66.7% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 8 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 51.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 56.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 62.5% / 66.7% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 8 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 51.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 56.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 65 turns, 710s wall-clock
- Real app-agent API calls: 112 (apply_ontology_yaml called 38× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 38 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 2877038 total (2840673 prompt · 36365 completion) across 177 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 24:** The interviewer treated an active work order and assigned activities as *preconditions* for starting work. The persona corrected these to **post-start verification** checks at turn 25.
- **Turns 26–27, 63–64:** It added task code and work-order date before checking whether the agreed questions or actions needed them. The merge-only tool could not remove them; asking the persona to edit the canvas at turn 63 did not help because they had no access.
- **Turns 39–43:** Links previously recorded as relationships were later clarified as conceptual or provisional, including the asset–function, state–asset, and assignment links. The interviewer acknowledged this, but the links remained on the canvas, leaving a mismatch between recorded structure and verified data.
- **Turn 50:** It promoted final-cost verification to a pre-close condition. The persona corrected the timing at turn 51, and the interviewer updated the rule.

## Noteworthy observations

- **Turns 7, 14, 17–20:** The interviewer resisted adding convenient but unneeded links and surfaced real evidence gaps, particularly the lost function among several and the asset a proposed process concerns.
- **Turns 51–57:** The action-rule pass usefully separated preconditions, intended changes, and afterward verification after the earlier timing corrections.
- **Turns 1–65:** The interview was thorough but repetitive: frequent recaps, confirmation requests, and checklist passes stretched a promised set of “short phases” across 65 turns.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
