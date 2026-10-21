# Ontology-recovery eval report

Generated: 2026-10-21T04:52:43.147Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **32.8%** | **39.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.1% / 74.4% / 57.7% | 83.3% / 46.5% / 59.7% | 32/68 full · 20/24 scoped ground-truth classes matched; 43 recovered |
| Relationship recall / precision / F1 | 13.9% / 24.6% / 17.8% | 25.0% / 14.8% / 18.6% | 15/108 full · 9/36 scoped ground-truth relationships matched; 61 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 14.4% / 55.2% / 22.9% | 44.0% / 37.9% / 40.7% | 16/111 full · 11/25 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 36.4% | 44.4% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **36.1%** | **43.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.5% / 76.7% / 59.5% | 83.3% / 46.5% / 59.7% | 33/68 full · 20/24 scoped ground-truth classes matched; 43 recovered |
| Relationship recall / precision / F1 | 20.4% / 36.1% / 26.0% | 38.9% / 23.0% / 28.9% | 22/108 full · 14/36 scoped ground-truth relationships matched; 61 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 14.4% / 55.2% / 22.9% | 44.0% / 37.9% / 40.7% | 16/111 full · 11/25 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 36.4% | 44.4% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 54.5% / 54.5% / 54.5% | 6/11 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 54.5% / 85.7% / 66.7% | 6/11 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 46.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 63.6% / 63.6% / 63.6% | 7/11 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 63.6% / 100.0% / 77.8% | 7/11 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 46.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 0.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 0.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 7 turns, 220s wall-clock
- Real app-agent API calls: 23 (apply_ontology_yaml called 7× · get_graph_state called 2×)
- Tool outcomes seen in transcript: 7 applied · 2 skipped · 0 no-op · 0 error
- Tokens: 302667 total (285559 prompt · 17108 completion) across 30 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 1 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 2–3:** The interviewer sent two near-duplicate sets of questions in each response. This looks like a response-generation bug and makes the exchange harder to follow.
- **Turns 4 and 6:** The tool skipped an additional ontology edit because only one edit could be applied per message. The interviewer correctly flagged what remained pending and addressed it later, but the skipped edits required extra turns.

## Noteworthy observations

- **Turns 1–3:** Questions focused on consequential distinctions—alert versus incident, major declaration versus status, and materiality assessment versus notification—rather than inventing bank-specific thresholds or authorities.
- **Turns 4–6:** The interviewer checked whether component types were always configuration items and whether restore targets could be generalised. These follow-ups prevented overly broad ontology links.
- **Turns 4 and 6:** After skipped edits, the interviewer explicitly said which facts were *not yet modeled*. That was good state tracking despite the tool limitation.
- **Turn 7:** The closing summary usefully preserved the distinction between a corrective action being verified and merely having an implementing change.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
