# Ontology-recovery eval report

Generated: 2026-10-20T15:41:49.108Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **66.2%** | **59.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 40.4% / 100.0% / 57.5% | 75.0% / 78.3% / 76.6% | 23/57 full · 18/24 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 67.7% / 100.0% / 80.8% | 82.4% / 66.7% / 73.7% | 21/31 full · 14/17 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 44.9% / 91.7% / 60.3% | 45.5% / 20.8% / 28.6% | 22/49 full · 5/11 scoped ground-truth properties matched; 24 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **66.2%** | **59.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 40.4% / 100.0% / 57.5% | 75.0% / 78.3% / 76.6% | 23/57 full · 18/24 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 67.7% / 100.0% / 80.8% | 82.4% / 66.7% / 73.7% | 21/31 full · 14/17 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 44.9% / 91.7% / 60.3% | 45.5% / 20.8% / 28.6% | 22/49 full · 5/11 scoped ground-truth properties matched; 24 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 16.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 18.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 16.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 18.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 96 turns, 1108s wall-clock
- Real app-agent API calls: 160 (apply_ontology_yaml called 52× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 52 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 6479249 total (6436818 prompt · 42431 completion) across 256 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 9 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 26:** A second ontology edit was skipped because only one edit could be applied per message. The interviewer also acknowledged adding three unconfirmed party-link aliases; it removed them at turn 27.
- **Turn 56:** Renaming the reset-schedule link retained the old wording as an alias without confirmation. The expert rejected that alias at turn 57, and the interviewer removed it.

## Noteworthy observations
- **Turns 32–42, 80–88:** The interviewer kept a genuine prepayment gap visible instead of inventing a loan-to-terms link. The loan-focused check therefore remained unconfirmed even when separately supplied terms contained a penalty period.
- **Turns 44–45, 94–96:** It correctly avoided declaring schedules matched from payment counts alone. Validation also exposed two other unanswered questions: how to classify an arbitrary loan as secured, and which prepayment terms apply to a loan.
- **Turns 33–41, 89–93:** The interview repeatedly revisited the same prepayment gap and ran several “anything else?” passes after the expert had declined additional records. These were cautious but inefficient.
- **Turn 94:** The final replay was useful, but it came late: the recorded “Is the loan secured?” question proved unanswerable for an arbitrary loan only at validation.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
