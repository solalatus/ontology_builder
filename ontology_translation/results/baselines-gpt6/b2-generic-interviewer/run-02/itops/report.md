# Ontology-recovery eval report

Generated: 2026-10-21T04:31:42.734Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **26.3%** | **29.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 41.2% / 65.1% / 50.5% | 70.8% / 39.5% / 50.7% | 28/68 full · 17/24 scoped ground-truth classes matched; 43 recovered |
| Relationship recall / precision / F1 | 13.0% / 19.4% / 15.6% | 25.0% / 12.5% / 16.7% | 14/108 full · 9/36 scoped ground-truth relationships matched; 72 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 8.1% / 30.0% / 12.8% | 24.0% / 20.0% / 21.8% | 9/111 full · 6/25 scoped ground-truth properties matched; 30 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 28.6% | 33.3% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **30.3%** | **35.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 42.6% / 67.4% / 52.3% | 75.0% / 41.9% / 53.7% | 29/68 full · 18/24 scoped ground-truth classes matched; 43 recovered |
| Relationship recall / precision / F1 | 20.4% / 30.6% / 24.4% | 41.7% / 20.8% / 27.8% | 22/108 full · 15/36 scoped ground-truth relationships matched; 72 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 9.0% / 33.3% / 14.2% | 28.0% / 23.3% / 25.5% | 10/111 full · 7/25 scoped ground-truth properties matched; 30 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 28.6% | 33.3% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 54.5% / 66.7% / 60.0% | 6/11 ground-truth rules matched (core condition equivalence, not name alone); 9 recovered |
| Action identification recall / precision / F1 | 72.7% / 80.0% / 76.2% | 8/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 75.0% | of 8 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 54.5% / 66.7% / 60.0% | 6/11 ground-truth rules matched (core condition equivalence, not name alone); 9 recovered |
| Action identification recall / precision / F1 | 81.8% / 90.0% / 85.7% | 9/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 75.0% | of 8 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 4 turns, 143s wall-clock
- Real app-agent API calls: 16 (apply_ontology_yaml called 7× · get_graph_state called 2×)
- Tool outcomes seen in transcript: 7 applied · 2 skipped · 0 no-op · 0 error
- Tokens: 186535 total (174229 prompt · 12306 completion) across 20 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 1 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 2:** An ontology edit was skipped because only one edit was allowed per message. The interviewer did not identify which intended changes were left unapplied.
- **Turn 4:** The interviewer identified a circular notification-submission rule in the live model but ended the interview without correcting it. Another edit was skipped in that turn, so the submission rule remains unsafe to use.

## Noteworthy observations
- **Turns 1–3:** The interviewer used a major-incident scenario to elicit operational decisions, then asked focused follow-ups about recovery approvals, reporting stages, closure, and rejected notifications.
- **Turns 2–3:** It preserved important distinctions: an alert is not automatically an incident, a major incident is not automatically reportable, and recovery acceptance is not necessarily emergency-change risk acceptance.
- **Turn 4:** Flagging the unresolved rule rather than presenting the model as complete was good transparency, though the interview ended with a known defect.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
