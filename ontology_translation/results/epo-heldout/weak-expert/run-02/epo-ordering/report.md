# Ontology-recovery eval report

Generated: 2026-11-04T20:03:44.555Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 25-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **18.9%** | **18.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 24.0% / 50.0% / 32.4% | 29.4% / 41.7% / 34.5% | 6/25 full · 5/17 scoped ground-truth classes matched; 12 recovered |
| Relationship recall / precision / F1 | 16.0% / 21.1% / 18.2% | 11.8% / 10.5% / 11.1% | 4/25 full · 2/17 scoped ground-truth relationships matched; 19 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 5.3% / 7.4% / 6.2% | 20.0% / 7.4% / 10.8% | 2/38 full · 2/10 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **24.8%** | **24.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 28.0% / 58.3% / 37.8% | 35.3% / 50.0% / 41.4% | 7/25 full · 6/17 scoped ground-truth classes matched; 12 recovered |
| Relationship recall / precision / F1 | 24.0% / 31.6% / 27.3% | 23.5% / 21.1% / 22.2% | 6/25 full · 4/17 scoped ground-truth relationships matched; 19 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 7.9% / 11.1% / 9.2% | 20.0% / 7.4% / 10.8% | 3/38 full · 2/10 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 12 recovered |
| Action identification recall / precision / F1 | 71.4% / 45.5% / 55.6% | 5/7 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 0.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 5.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 9.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 11.5% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 41.7% / 52.6% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 12 recovered |
| Action identification recall / precision / F1 | 71.4% / 45.5% / 55.6% | 5/7 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 0.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 5.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 9.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 11.5% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 147 turns, 1709s wall-clock
- Real app-agent API calls: 241 (apply_ontology_yaml called 79× · get_graph_state called 12×)
- Tool outcomes seen in transcript: 79 applied · 5 skipped · 1 no-op · 0 error
- Tokens: 14752463 total (14680930 prompt · 71533 completion) across 388 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 11 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 41, 90, 108, 120:** The tool skipped additional ontology edits because it applies only one edit per message. The interviewer noticed the skipped edits and recorded them in later turns; no permanent loss is evident.
- **Turns 31–32, 58–59:** Automated warnings treated the interviewer’s total class counts as claims about the latest edit. The interviewer clarified the distinction and checked the live canvas.
- **Turns 104–109:** The interviewer found a sequencing conflict: the response-review rule required a response to be attached, while the action was meant to attach it. It added an attachment rule and action, but the transcript does not show an explicit correction to the original review rule.

## Noteworthy observations

- **Turns 43–85:** Strong probing exposed that backorder quantities alone cannot determine what is payable. The interviewer elicited supplied and paid quantities and challenged several adjustment formulas before recording one.
- **Turns 124–130:** Backorder status is inferred partly from a decrease in outstanding quantity, yet the update action deliberately does not update *quantity supplied*. A decrease reported as a correction could therefore be mistaken for partial fulfillment; this deserved a follow-up.
- **Turns 120–122:** The interviewer accepted sending a cancellation request to the *proposed* seller without revisiting its earlier distinction from the seller the order was *actually submitted to*. A misdirected order makes that choice consequential.
- **Turns 55–71, 137–142:** Alias checks, property-by-property consequence checks, and repeated “anything else?” checks were thorough but lengthy for the information gained.
- **Turns 144–147:** The automated second opinion found a real counteroffer gap, and the interviewer resolved it by requiring a new seller acceptance before changing the order. It correctly disclosed that the second opinion was not rerun after the fix.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
