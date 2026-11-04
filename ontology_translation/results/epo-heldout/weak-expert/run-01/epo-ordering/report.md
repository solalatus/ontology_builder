# Ontology-recovery eval report

Generated: 2026-11-04T19:33:56.156Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 25-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **27.1%** | **33.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 44.0% / 84.6% / 57.9% | 58.8% / 76.9% / 66.7% | 11/25 full · 10/17 scoped ground-truth classes matched; 13 recovered |
| Relationship recall / precision / F1 | 4.0% / 6.7% / 5.0% | 5.9% / 6.7% / 6.3% | 1/25 full · 1/17 scoped ground-truth relationships matched; 15 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 15.8% / 22.2% / 18.5% | 50.0% / 18.5% / 27.0% | 6/38 full · 5/10 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **37.1%** | **41.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 44.0% / 84.6% / 57.9% | 58.8% / 76.9% / 66.7% | 11/25 full · 10/17 scoped ground-truth classes matched; 13 recovered |
| Relationship recall / precision / F1 | 28.0% / 46.7% / 35.0% | 29.4% / 33.3% / 31.3% | 7/25 full · 5/17 scoped ground-truth relationships matched; 15 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 15.8% / 22.2% / 18.5% | 50.0% / 18.5% / 27.0% | 6/38 full · 5/10 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 8 recovered |
| Action identification recall / precision / F1 | 100.0% / 70.0% / 82.4% | 7/7 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 0.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 14.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 26.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 8 recovered |
| Action identification recall / precision / F1 | 100.0% / 70.0% / 82.4% | 7/7 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 0.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 14.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 26.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 86 turns, 841s wall-clock
- Real app-agent API calls: 138 (apply_ontology_yaml called 41× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 41 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 5571252 total (5529149 prompt · 42103 completion) across 224 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 4, 21, 86:** System count warnings appear to confuse a turn’s edit count with the interviewer’s cumulative total. The interviewer had correctly described 15 questions and, later, 12 classes; the final warning repeats the pattern.
- **Turn 85:** A tool limit skipped the attempted allowance/charge verification edit. The interviewer identified the gap and completed the correction in turn 86.
- **Turns 59–60:** Incoming change and cancellation replies are allowed when the request status is already **Confirmed**, with no check for an existing reply. That leaves duplicate or conflicting seller decisions possible.

## Noteworthy observations

- **Turns 5–7, 28–30, 61–63:** Strong clarifications corrected the seller-versus-buyer action boundary, introduced line-specific change details, and resolved the conflict between *In Transit* and requiring an actual delivery date.
- **Turn 68:** The interviewer accepted one allowance **or** charge per Order Line, despite the expert raising cases where both apply. The suggested workaround of duplicating an item line was not checked against the order-line requirements.
- **Turns 75–76:** Setting Order Status to **Completed** whenever Delivery Status becomes **Delivered** was accepted without checking partial or multi-line deliveries.
- **Turns 84–86:** The final replay caught a rule-ordering error and surfaced two naming/verification gaps. The interviewer repaired those while clearly leaving the unknown Requested Delivery Period choices open.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
