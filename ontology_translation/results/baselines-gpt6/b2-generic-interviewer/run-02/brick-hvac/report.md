# Ontology-recovery eval report

Generated: 2026-10-21T04:21:05.655Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **17.9%** | **21.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 23.1% / 52.9% / 32.1% | 38.9% / 41.2% / 40.0% | 9/39 full · 7/18 scoped ground-truth classes matched; 17 recovered |
| Relationship recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/35 full · 0/19 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 16.7% / 30.4% / 21.5% | 31.3% / 21.7% / 25.6% | 7/42 full · 5/16 scoped ground-truth properties matched; 23 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 0.0% | 0.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **21.1%** | **26.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 23.1% / 52.9% / 32.1% | 38.9% / 41.2% / 40.0% | 9/39 full · 7/18 scoped ground-truth classes matched; 17 recovered |
| Relationship recall / precision / F1 | 5.7% / 8.0% / 6.7% | 10.5% / 8.0% / 9.1% | 2/35 full · 2/19 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 19.0% / 34.8% / 24.6% | 37.5% / 26.1% / 30.8% | 8/42 full · 6/16 scoped ground-truth properties matched; 23 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 0.0% | 0.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 12 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth actions matched by name/meaning; 4 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 12 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth actions matched by name/meaning; 4 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 9 turns, 197s wall-clock
- Real app-agent API calls: 22 (apply_ontology_yaml called 8× · get_graph_state called 2×)
- Tool outcomes seen in transcript: 8 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 205508 total (190148 prompt · 15360 completion) across 31 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 1 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 4:** The tool reports that an additional ontology edit was skipped because only one edit can be applied per message. The transcript does not show an explicit retry, so it is unclear whether the intended edit made it into the model.
- **Turns 2–3:** Each assistant turn contains two near-identical versions of the same question, suggesting a response-generation or presentation bug.

## Noteworthy observations
- **Turns 1–3:** The interviewer builds a useful equipment-to-zone troubleshooting path and checks that BAS status indicates a call for flow, not proof of flow.
- **Turns 4–6:** It usefully separates alarm indication, occupant impact, and formal priority or dispatch, without inventing a fixed alarm threshold.
- **Turn 8:** The proposed closure test is too broad: temperatures need not rise when there is no heating call. The expert corrects this, and the subsequent edit is reported as applied.
- **Turns 5–8:** Repeated “last” and “final” checks make the ending feel drawn out, though they elicit useful plant-alarm and heating-path details.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
