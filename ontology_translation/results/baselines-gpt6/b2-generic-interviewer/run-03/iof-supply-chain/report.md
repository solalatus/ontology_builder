# Ontology-recovery eval report

Generated: 2026-10-21T04:46:51.714Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **51.5%** | **65.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 32.1% / 89.5% / 47.2% | 60.7% / 89.5% / 72.3% | 17/53 full · 17/28 scoped ground-truth classes matched; 19 recovered |
| Relationship recall / precision / F1 | 43.3% / 59.1% / 50.0% | 56.5% / 59.1% / 57.8% | 13/30 full · 13/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 50.0% / 57.1% | 100.0% / 50.0% / 66.7% | 2/3 full · 2/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **51.5%** | **65.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 32.1% / 89.5% / 47.2% | 60.7% / 89.5% / 72.3% | 17/53 full · 17/28 scoped ground-truth classes matched; 19 recovered |
| Relationship recall / precision / F1 | 43.3% / 59.1% / 50.0% | 56.5% / 59.1% / 57.8% | 13/30 full · 13/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 50.0% / 57.1% | 100.0% / 50.0% / 66.7% | 2/3 full · 2/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 60.0% / 50.0% / 54.5% | 3/5 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 68.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 30.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 32.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 66.7% / 72.7% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 68.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 30.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 32.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 13 turns, 233s wall-clock
- Real app-agent API calls: 37 (apply_ontology_yaml called 16× · get_graph_state called 2×)
- Tool outcomes seen in transcript: 15 applied · 2 skipped · 0 no-op · 0 error
- Tokens: 371633 total (355921 prompt · 15712 completion) across 51 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 1 app-agent error turn(s) (toolRoundLimit=1), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 1 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 6:** The interviewer exceeded the tool-use limit and was stopped before it could respond. The user had to prompt it to continue.
- **Turns 9 and 12:** The tool reported skipped ontology edits. Turn 9’s pending actions were added in turn 10, and turn 12’s wording fix was made in turn 13, but the interruptions made edit state harder to follow.

## Noteworthy observations
- **Turns 2–3:** The interviewer usefully separated an “arrived” tracking event from evidence that transport reached its destination and receiving was completed. Its turn 3 summary still said “confirmed arrival,” prompting the expert to restate the distinction.
- **Turns 4–5:** Good follow-up on whether tracking events establish shipment-to-unit associations; the expert clarified that they do not necessarily prove membership.
- **Turns 8–10:** The interviewer caught that “sign off” was informal and avoided adding an unsupported preparation-completion requirement or dispatch gate.
- **Turn 12:** The interviewer surfaced a link-description wording issue despite a clean consistency check, then corrected it after confirmation.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
