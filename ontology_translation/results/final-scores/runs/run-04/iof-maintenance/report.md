# Ontology-recovery eval report

Generated: 2026-11-05T04:36:24.981Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **74.2%** | **70.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.0% / 92.3% / 72.7% | 73.3% / 84.6% / 78.6% | 12/20 full · 11/15 scoped ground-truth classes matched; 13 recovered |
| Relationship recall / precision / F1 | 53.8% / 70.0% / 60.9% | 75.0% / 60.0% / 66.7% | 7/13 full · 6/8 scoped ground-truth relationships matched; 10 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 80.0% / 100.0% / 88.9% | 100.0% / 50.0% / 66.7% | 4/5 full · 2/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **74.2%** | **70.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.0% / 92.3% / 72.7% | 73.3% / 84.6% / 78.6% | 12/20 full · 11/15 scoped ground-truth classes matched; 13 recovered |
| Relationship recall / precision / F1 | 53.8% / 70.0% / 60.9% | 75.0% / 60.0% / 66.7% | 7/13 full · 6/8 scoped ground-truth relationships matched; 10 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 80.0% / 100.0% / 88.9% | 100.0% / 50.0% / 66.7% | 4/5 full · 2/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 40.0% / 66.7% / 50.0% | 2/5 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 100.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 33.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 34.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 27.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 100.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 33.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 34.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 27.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 108 turns, 1220s wall-clock
- Real app-agent API calls: 159 (apply_ontology_yaml called 40× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 40 applied · 0 skipped · 1 no-op · 0 error
- Tokens: 5878192 total (5811042 prompt · 67150 completion) across 267 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 21 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 33:** The assistant’s reply is duplicated verbatim in the same message.
- **Turn 107:** The final recap says the process and work order are “tracked over time,” although the interview established no dependable start, active-order, or closure fact and explicitly left work-order date out.

## Noteworthy observations
- **Turns 2–5:** The interviewer checks wording before recording questions and preserves useful distinctions: effects need not be downstream, and a failure-mode code does not establish recurrence.
- **Turns 17–18:** It initially treats asset condition as a possible property and omits **Maintenance State** despite earlier discussion of a failure event beginning a failed state. The expert catches this; the interviewer corrects the class set.
- **Turns 23–41:** It resists inventing links to fill gaps in the asset’s current state, required function, maintenance process, and disposition. That keeps unanswered questions visibly unanswered.
- **Turns 80–101:** The interview becomes repetitive after verification sources are repeatedly declared undefined. A consolidated gap review earlier would likely have saved many turns.
- **Turns 107–108:** The final check surfaces a genuine assignment ambiguity. The interviewer gets a precise answer without treating assignment as evidence of qualification.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
