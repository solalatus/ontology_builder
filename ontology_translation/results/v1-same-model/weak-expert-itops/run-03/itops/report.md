# Ontology-recovery eval report

Generated: 2026-11-06T17:22:55.440Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **17.3%** | **21.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 33.8% / 79.3% / 47.4% | 66.7% / 55.2% / 60.4% | 23/68 full · 16/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 2.8% / 13.6% / 4.6% | 2.8% / 4.5% / 3.4% | 3/108 full · 1/36 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/111 full · 0/25 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **22.8%** | **29.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 41.2% / 96.6% / 57.7% | 79.2% / 65.5% / 71.7% | 28/68 full · 19/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 6.5% / 31.8% / 10.8% | 13.9% / 22.7% / 17.2% | 7/108 full · 5/36 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/111 full · 0/25 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/11 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/11 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/11 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/11 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 80 turns, 670s wall-clock
- Real app-agent API calls: 101 (apply_ontology_yaml called 16× · get_graph_state called 4×)
- Tool outcomes seen in transcript: 16 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3730441 total (3704636 prompt · 25805 completion) across 227 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 48 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 20–24:** The interviewer added four role links after the persona said they *“should ideally”* exist, without confirming they were maintained in current records. All four later proved unknown. The tool could not delete them, leaving unconfirmed links on the canvas.
- **Turn 23:** The interviewer asked the persona to remove those links, despite the persona having no canvas-editing access. It acknowledged the mistake at turn 24 but could not correct the canvas.

## Noteworthy observations

- **Turns 1–2:** Capturing 20 real questions and 10 actions gave the interview useful acceptance criteria. The interviewer asked the persona to distinguish executable actions from recommendations, but did not follow up when the response left that distinction unclear—particularly for emergency changes and regulatory submissions.
- **Turns 17–19, 21–24:** Pressing for “yes/no/unknown” when the persona gave conditional answers was good discipline. Applying that current-records standard *before* editing the four role links would have prevented the canvas problem.
- **Turns 25–33:** The interviewer kept unknown relationships out of subsequent edits and produced a clear verification list, appropriately pausing rather than inventing missing reporting and recovery paths.
- **Turns 34–80:** The paused interview fell into a prolonged acknowledgment loop with no new findings or modeling. A single handoff message followed by waiting for substantive input would be more efficient.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
