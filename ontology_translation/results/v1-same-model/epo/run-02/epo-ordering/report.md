# Ontology-recovery eval report

Generated: 2026-11-06T09:46:42.493Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 25-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **83.9%** | **62.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 88.0% / 100.0% / 93.6% | 100.0% / 77.3% / 87.2% | 22/25 full · 17/17 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 68.0% / 70.8% / 69.4% | 64.7% / 45.8% / 53.7% | 17/25 full · 11/17 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 81.6% / 96.9% / 88.6% | 100.0% / 31.3% / 47.6% | 31/38 full · 10/10 scoped ground-truth properties matched; 32 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **90.3%** | **62.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 88.0% / 100.0% / 93.6% | 100.0% / 77.3% / 87.2% | 22/25 full · 17/17 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 84.0% / 87.5% / 85.7% | 64.7% / 45.8% / 53.7% | 21/25 full · 11/17 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 84.2% / 100.0% / 91.4% | 100.0% / 31.3% / 47.6% | 32/38 full · 10/10 scoped ground-truth properties matched; 32 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 14.3% / 14.3% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 7.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 12.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 71.4% / 71.4% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 7.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 12.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 70 turns, 982s wall-clock
- Real app-agent API calls: 157 (apply_ontology_yaml called 37× · get_graph_state called 49×)
- Tool outcomes seen in transcript: 37 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 7112126 total (7073228 prompt · 38898 completion) across 227 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 29, 33, 60–61, 70:** The model stored the single response-description value as `fulfilmentDescription`. After the expert corrected the name, the interviewer could not rename it with the merge-only editor and briefly asked the expert to edit the canvas, which the expert could not do. The incorrect label remains.
- **Turns 65–70:** The actions originally requested as **send** an order change or cancellation were modelled as recording them as submitted and checking their order links. The interviewer caught the mismatch during validation, but the live `sendOrderChange` and `sendOrderCancellation` names still imply transmission that the model cannot verify.

## Noteworthy observations

- **Turns 16–27:** The interviewer tested proposed links instead of filling gaps by assumption. It kept both the change-line-to-original-line match and the adjustment-tax-to-order path explicitly unresolved.
- **Turns 28–40:** Value elicitation was careful about evidence: it did not infer a supplied-now quantity, price basis, item description, or fixed response outcome from nearby text or quantities.
- **Turns 41–59:** The meanings-and-aliases pass was thorough but repetitive, especially after the expert repeatedly declined relationship aliases. Larger batches could have shortened it.
- **Turns 68–70:** Replaying the original questions and actions against the live model exposed substantive coverage gaps, including the difference between linking a document to an order and proving it was sent.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
