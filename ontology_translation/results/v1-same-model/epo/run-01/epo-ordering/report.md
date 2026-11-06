# Ontology-recovery eval report

Generated: 2026-11-06T09:29:40.233Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 25-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **92.2%** | **63.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 68.0% / 81.0% | 25/25 full · 17/17 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 84.0% / 77.8% / 80.8% | 82.4% / 51.9% / 63.6% | 21/25 full · 14/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 92.1% / 100.0% / 95.9% | 100.0% / 28.6% / 44.4% | 35/38 full · 10/10 scoped ground-truth properties matched; 35 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **94.8%** | **64.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 68.0% / 81.0% | 25/25 full · 17/17 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 92.0% / 85.2% / 88.5% | 88.2% / 55.6% / 68.2% | 23/25 full · 15/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 92.1% / 100.0% / 95.9% | 100.0% / 28.6% / 44.4% | 35/38 full · 10/10 scoped ground-truth properties matched; 35 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 19.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 42.9% / 42.9% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 19.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 75 turns, 771s wall-clock
- Real app-agent API calls: 122 (apply_ontology_yaml called 39× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 39 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3621304 total (3585919 prompt · 35385 completion) across 197 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 14 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 38–40, 75:** An attempted edit left `accountingCost` on **Order line** despite agreement to exclude it. The interviewer first called its text type incorrect, then accepted the expert’s correction that the type was valid. It could only exclude the field in its instructions, so the canvas never received the agreed cleanup.
- **Turns 72–73:** A system warning treated “15 questions” as a claim about the latest edit’s item count. The interviewer corrected the count, but its preceding statement was about replaying the questions, not adding 15 items. This looks like a false-positive count warning.

## Noteworthy observations

- **Turns 1–2, 65–72:** Starting with the desk’s questions and actions paid off: the interviewer kept document matching, evidence retention, and action-blocking checks tied to the actual work.
- **Turns 19–25, 73–75:** The interviewer resisted inventing links or values, especially the missing order-to-charge/tax path and matches between changed or agreement lines and original lines. Its final replay stated the resulting limits rather than claiming full coverage.
- **Turns 41–62:** Meanings and aliases were checked in many small, repetitive batches. After several consecutive “no exact aliases” answers, a consolidated check would likely have reached the same result faster.
- **Turns 28–38:** The interviewer initially added accounting cost without testing whether a task used it, then caught the scope issue much later. Testing each proposed value against the agreed questions and actions before saving it would have avoided the failed cleanup.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
