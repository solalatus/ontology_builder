# Ontology-recovery eval report

Generated: 2026-11-04T21:30:11.974Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.6%** | **87.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 54.7% / 100.0% / 70.7% | 89.3% / 86.2% / 87.7% | 29/53 full · 25/28 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 66.7% / 74.1% / 70.2% | 82.6% / 70.4% / 76.0% | 20/30 full · 19/23 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.6%** | **87.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 54.7% / 100.0% / 70.7% | 89.3% / 86.2% / 87.7% | 29/53 full · 25/28 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 66.7% / 74.1% / 70.2% | 82.6% / 70.4% / 76.0% | 20/30 full · 19/23 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 42.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 35.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 42.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 35.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 86 turns, 786s wall-clock
- Real app-agent API calls: 131 (apply_ontology_yaml called 39× · get_graph_state called 5×)
- Tool outcomes seen in transcript: 39 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3829930 total (3790870 prompt · 39060 completion) across 217 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 13 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turns 52, 67:** The interviewer claimed every class had a plain-language definition, but it never requested definitions for several recorded classes, including Shipment, Purchase Order, Transport Process, Lot, Sublot, Logistic Unit, Load, and Tracking Event. The language recap therefore overstates what was captured.
- **Turns 21–22:** The editing tool could not rename *Supply Arrangement* to the expert’s preferred *Supply Relationship*. The interviewer asked the expert to rename it on the canvas, but the expert could not edit it. The alias workaround avoided a duplicate, but the requested rename remained undone.

## Noteworthy observations
- **Turns 9–11, 24–29:** The interviewer repeatedly checked whether a proposed connection was actually established before adding it. This was especially useful for storage facilities, shipment-specific processes, and freight-forwarding evidence.
- **Turns 48–67:** Definitions and aliases were elicited in many small batches, including a second check of Shipment. This made the interview lengthy without catching the missing definitions noted above.
- **Turns 82–85:** Testing against the original questions exposed a previously missed receipt gap: no established way to show that the receiving facility is *this shipment’s* destination facility. The interviewer updated the rule and, when asked to stop, clearly reported the model as partial rather than filling gaps by assumption.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
