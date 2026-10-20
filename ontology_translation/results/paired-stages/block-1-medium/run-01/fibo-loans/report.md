# Ontology-recovery eval report

Generated: 2026-10-20T09:17:04.808Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **55.9%** | **50.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 35.1% / 100.0% / 51.9% | 58.3% / 70.0% / 63.6% | 20/57 full · 14/24 scoped ground-truth classes matched; 20 recovered |
| Relationship recall / precision / F1 | 58.1% / 94.7% / 72.0% | 58.8% / 52.6% / 55.6% | 18/31 full · 10/17 scoped ground-truth relationships matched; 19 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 28.6% / 93.3% / 43.7% | 36.4% / 26.7% / 30.8% | 14/49 full · 4/11 scoped ground-truth properties matched; 15 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **55.9%** | **50.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 35.1% / 100.0% / 51.9% | 58.3% / 70.0% / 63.6% | 20/57 full · 14/24 scoped ground-truth classes matched; 20 recovered |
| Relationship recall / precision / F1 | 58.1% / 94.7% / 72.0% | 58.8% / 52.6% / 55.6% | 18/31 full · 10/17 scoped ground-truth relationships matched; 19 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 28.6% / 93.3% / 43.7% | 36.4% / 26.7% / 30.8% | 14/49 full · 4/11 scoped ground-truth properties matched; 15 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 19.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 71.4% / 71.4% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 19.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 113 turns, 1382s wall-clock
- Real app-agent API calls: 180 (apply_ontology_yaml called 44× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 44 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 7471607 total (7429689 prompt · 41918 completion) across 293 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 5 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 93:** The interviewer repeats its amortizing-loan recap and prepayment question verbatim in the same message.
- **Turns 39, 65–66:** It records schedule-content fields and anticipated-payment counts, then removes them after confirming they are not established fields or inputs to the agreed checks. This avoidable edit churn briefly makes the canvas more specific than the evidence supports.
- **Turn 95:** The requested systematic pass called for open questions about what exists around *every* class, without limiting answers to the agreed tasks. The interviewer instead skips previously discussed groups and frames its first question around “the agreed checks,” narrowing the requested discovery pass.

## Noteworthy observations

- **Turns 19–27, 68–77:** The interviewer consistently leaves applicability and prepayment-term identification unresolved rather than inventing links or treating missing values as evidence that a check does not apply.
- **Turns 79–94:** It makes the backward-lookup warnings and the unconfirmed operating-system capability explicit, without reversing the expert-confirmed governing relationships just to clear warnings.
- **Turns 101–113:** The naming pass is orderly: it checks the live canvas, batches the items, preserves relationship directions, and updates rule/action references after a property rename.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
