# Ontology-recovery eval report

Generated: 2026-11-05T00:48:21.243Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **71.1%** | **60.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.0% / 85.7% / 70.6% | 73.3% / 78.6% / 75.9% | 12/20 full · 11/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 53.8% / 50.0% / 51.9% | 75.0% / 42.9% / 54.5% | 7/13 full · 6/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 83.3% / 90.9% | 100.0% / 33.3% / 50.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 6 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.1%** | **62.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 53.8% / 50.0% / 51.9% | 75.0% / 42.9% / 54.5% | 7/13 full · 6/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 83.3% / 90.9% | 100.0% / 33.3% / 50.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 6 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 85.7% / 85.7% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 60.0% / 60.0% / 60.0% | 3/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 65.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 60.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 49.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 85.7% / 85.7% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 65.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 60.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 49.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 70 turns, 776s wall-clock
- Real app-agent API calls: 118 (apply_ontology_yaml called 40× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 40 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 3199525 total (3164844 prompt · 34681 completion) across 190 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 5 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 35–38, 50–70:** The interviewer added `performedTasks` as a Work Order property despite no agreement on a separate field. Its removal failed, and the property remained on the canvas. The interviewer disclosed the discrepancy and left validation open, but the model was not corrected.
- **Turn 36:** After the failed removal, the interviewer asked the persona to delete the property directly on the canvas; the persona could not edit it.
- **Turns 37, 68:** The tool reported that one of two edits was skipped, yet the interviewer said both work-order date and task code were added and later validated both as recorded. The transcript does not establish that the skipped edit was retried.
- **Turns 61–63:** The interviewer proposed Asset as the failure-recording action’s single input after the persona had framed the action around a failure event. The persona had to correct this; the interviewer then recorded Failure Event as the primary input.

## Noteworthy observations

- **Turns 6–24:** The interviewer tested proposed classes and links against actual questions and actions, preserving useful distinctions such as failure event versus failed state, and qualification versus assignment.
- **Turns 25–34, 52–60:** It generally avoided inventing fields, thresholds, approvals, or action prerequisites, and separated pre-action checks from post-action verification.
- **Turns 1–67:** The interview was unusually granular. Repeated single-point confirmations and recurring reminders about approvals and scope added many turns after the distinctions were settled.
- **Turns 35–70:** The interviewer was transparent about the persistent canvas discrepancy rather than claiming a clean result. A more useful recovery would have been to resolve the failed edit—or explicitly establish that the tool could not—before continuing validation.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
