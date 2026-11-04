# Ontology-recovery eval report

Generated: 2026-11-04T10:03:27.644Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **34.6%** | **44.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 39.7% / 87.1% / 54.5% | 70.8% / 54.8% / 61.8% | 27/68 full · 17/24 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 15.7% / 47.2% / 23.6% | 27.8% / 27.8% / 27.8% | 17/108 full · 10/36 scoped ground-truth relationships matched; 36 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 16.2% / 62.1% / 25.7% | 48.0% / 41.4% / 44.4% | 18/111 full · 12/25 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 95.2% | 93.8% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **34.6%** | **45.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 39.7% / 87.1% / 54.5% | 75.0% / 58.1% / 65.5% | 27/68 full · 18/24 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 15.7% / 47.2% / 23.6% | 27.8% / 27.8% / 27.8% | 17/108 full · 10/36 scoped ground-truth relationships matched; 36 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 16.2% / 62.1% / 25.7% | 48.0% / 41.4% / 44.4% | 18/111 full · 12/25 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 95.2% | 93.8% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 36.4% / 40.0% / 38.1% | 4/11 ground-truth rules matched (core condition equivalence, not name alone); 10 recovered |
| Action identification recall / precision / F1 | 63.6% / 70.0% / 66.7% | 7/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 66.7% | of 6 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 29.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 29.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 36.4% / 40.0% / 38.1% | 4/11 ground-truth rules matched (core condition equivalence, not name alone); 10 recovered |
| Action identification recall / precision / F1 | 63.6% / 70.0% / 66.7% | 7/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 66.7% | of 6 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 29.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 29.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 36.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 144 turns, 2144s wall-clock
- Real app-agent API calls: 227 (apply_ontology_yaml called 72× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 72 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 14163306 total (14100428 prompt · 62878 completion) across 371 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 11 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 121–122:** The interviewer records Assign Incident and Record Incident Details as single-input actions, but the first also needs a *selected resolver group* and the second needs *requested new values*. The transcript never explains how those targets reach the actions.
- **Turns 139–144:** The replay marks questions about *impacted* Business Services and Customer Channels as covered by dependency links, despite the interviewer’s earlier distinction that those links show only **potential** impact, not live impact (turn 60). The final validation overstates what the model can answer.
- **Turns 123–144:** The checker continues to emit ten navigation warnings, including a text-match false positive for “Status changes.” The interviewer explains them, but the validation tool remains noisy rather than resolving or suppressing known false positives.

## Noteworthy observations

- **Turns 29, 39, 105–109, 110–112:** Good targeted follow-ups catch contradictory direct links, unsafe communication states, reversed backup-status logic, and an unlisted Incident Status before rules are finalized.
- **Turns 140–144:** The second opinion catches a genuine dependency-direction error that survived the earlier relationship review. The interviewer corrects it and confirms the resulting lookup path.
- **Turns 94–100, 130–138:** The interview becomes repetitive: it asks for missing-value consequences field by field, then repeatedly invites “No” for neighboring concepts. Grouping these checks could shorten the session without losing the useful exceptions.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
