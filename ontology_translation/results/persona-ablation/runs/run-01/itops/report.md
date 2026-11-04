# Ontology-recovery eval report

Generated: 2026-11-04T09:25:57.386Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **26.7%** | **34.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 27.9% / 70.4% / 40.0% | 54.2% / 48.1% / 51.0% | 19/68 full · 13/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 12.0% / 38.2% / 18.3% | 22.2% / 23.5% / 22.9% | 13/108 full · 8/36 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 15.3% / 37.0% / 21.7% | 40.0% / 21.7% / 28.2% | 17/111 full · 10/25 scoped ground-truth properties matched; 46 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **28.7%** | **36.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 29.4% / 74.1% / 42.1% | 58.3% / 51.9% / 54.9% | 20/68 full · 14/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 13.9% / 44.1% / 21.1% | 25.0% / 26.5% / 25.7% | 15/108 full · 9/36 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 16.2% / 39.1% / 22.9% | 40.0% / 21.7% / 28.2% | 18/111 full · 10/25 scoped ground-truth properties matched; 46 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 9.1% / 8.3% / 8.7% | 1/11 ground-truth rules matched (core condition equivalence, not name alone); 12 recovered |
| Action identification recall / precision / F1 | 72.7% / 80.0% / 76.2% | 8/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 87.5% | of 8 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 19.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 19.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 9.1% / 8.3% / 8.7% | 1/11 ground-truth rules matched (core condition equivalence, not name alone); 12 recovered |
| Action identification recall / precision / F1 | 72.7% / 80.0% / 76.2% | 8/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 87.5% | of 8 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 19.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 19.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 202 turns, 3026s wall-clock
- Real app-agent API calls: 296 (apply_ontology_yaml called 85× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 85 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 22876111 total (22793562 prompt · 82549 completion) across 498 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 13 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 76:** The system incorrectly flagged “all 27 class meanings are now recorded” as a claim that 27 items were updated in that turn. The interviewer checked the canvas and clarified the cumulative count at turn 77.
- **Turns 172–202:** Two directed-navigation warnings for **Close Incident** remained at final validation. The interviewer accepted the expert’s claim that a reverse-endpoint query works, but the canvas still could not verify the path; the final “covered” claim rests on that untested lookup.

## Noteworthy observations

- **Turns 24, 29, 31, 150, 156:** The interviewer caught consequential contradictions before recording them, including dependency direction, direct specialist assignment, Event-link direction, compromised Evidence, and post-incident review timing.
- **Turns 166–169:** A navigation check exposed that **Send Stakeholder Communication** could not start from a communication record. Changing its input to Incident resolved that warning without inventing a reverse link.
- **Turns 176–199:** The nine-question “anything missing?” pass produced repeated “covered” answers, yet the subsequent replay found a real gap in checking *all* active alerts and events. Running the replay earlier would have been more efficient.
- **Turns 149–155, 122–131:** The interviewer did not revisit a workflow tension: documenting Evidence is barred once an Incident is **resolved**, while **resolved** is eligible for closure only after required Evidence is complete. This may prevent late evidence collection needed to close an otherwise resolved incident.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
