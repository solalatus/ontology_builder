# Ontology-recovery eval report

Generated: 2026-11-05T00:34:28.666Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.8%** | **45.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 84.6% / 97.1% / 90.4% | 100.0% / 52.9% / 69.2% | 33/39 full · 18/18 scoped ground-truth classes matched; 34 recovered |
| Relationship recall / precision / F1 | 40.0% / 37.8% / 38.9% | 47.4% / 24.3% / 32.1% | 14/35 full · 9/19 scoped ground-truth relationships matched; 37 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.5% / 56.7% / 47.2% | 50.0% / 26.7% / 34.8% | 17/42 full · 8/16 scoped ground-truth properties matched; 30 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **88.5%** | **64.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 84.6% / 97.1% / 90.4% | 100.0% / 52.9% / 69.2% | 33/39 full · 18/18 scoped ground-truth classes matched; 34 recovered |
| Relationship recall / precision / F1 | 94.3% / 89.2% / 91.7% | 94.7% / 48.6% / 64.3% | 33/35 full · 18/19 scoped ground-truth relationships matched; 37 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 71.4% / 100.0% / 83.3% | 87.5% / 46.7% / 60.9% | 30/42 full · 14/16 scoped ground-truth properties matched; 30 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 18.2% / 22.2% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 36.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 18.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 29.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 54.5% / 66.7% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 36.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 18.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 29.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 104 turns, 1196s wall-clock
- Real app-agent API calls: 162 (apply_ontology_yaml called 48× · get_graph_state called 9×)
- Tool outcomes seen in transcript: 48 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 6184631 total (6134360 prompt · 50271 completion) across 268 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 36–37, 71, 76:** Wording corrections left a superseded setpoint class and three superseded relationships on the canvas. The interviewer disclosed the duplicates, but the saved ontology still contains them.
- **Turns 90–94:** The occupied-zone task was initially recorded with pass-level evidence as a precondition, which could prevent it from running to produce an *unverified* finding. The interviewer caught and revised this during validation.
- **Turn 82:** The interviewer said the existing deadband rule covered a **zone** conclusion, although that rule had been developed for an **air-handler** action. The expert had explicitly warned against borrowing air-handler settings for a zone without verified control context.

## Noteworthy observations

- **Turns 23–28:** The interviewer tested proposed equipment only against narrow checks and nearly excluded items relevant to the broader floor-or-space inventory question. The expert corrected the scope, and the interviewer acknowledged it.
- **Turns 29–48, 92–100:** Strong restraint around missing relationships: the interviewer did not infer zone membership, plant associations, served floors, or sensor roles from proximity or shared equipment. Validation exposed useful answerability gaps.
- **Turns 62–76:** The exhaustive, item-by-item alias pass consumed many turns while finding only two class aliases and three preferred relationship wordings. Batching would likely preserve the distinctions more efficiently.
- **Turns 101–104:** The interviewer respected the request to pause and handed off the unresolved checks as open rather than declaring validation complete.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
