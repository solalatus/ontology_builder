# Ontology-recovery eval report

Generated: 2026-11-04T09:58:20.656Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 25-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **100.0%** | **67.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 68.0% / 81.0% | 25/25 full · 17/17 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 68.0% / 81.0% | 25/25 full · 17/17 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 26.3% / 41.7% | 38/38 full · 10/10 scoped ground-truth properties matched; 38 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **100.0%** | **67.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 68.0% / 81.0% | 25/25 full · 17/17 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 68.0% / 81.0% | 25/25 full · 17/17 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 26.3% / 41.7% | 38/38 full · 10/10 scoped ground-truth properties matched; 38 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 38.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 41.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 42.9% / 42.9% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 38.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 41.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 74 turns, 1653s wall-clock
- Real app-agent API calls: 126 (apply_ontology_yaml called 42× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 42 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4244132 total (4209975 prompt · 34157 completion) across 200 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 6:** The interviewer counted five recording actions by combining confirmation and rejection. The expert corrected this to seven distinct actions at turn 7; the interviewer then updated the model.

## Noteworthy observations
- **Turns 15–27:** The interviewer called the candidate class set complete too early. The expert supplied several more distinctions. Requiring a concrete desk question before adding each one kept the expansion grounded, but made this stretch lengthy.
- **Turns 35–38:** Good handling of model limits: the interviewer did not invent a price class or an agreement-to-order link to work around missing relationships.
- **Turn 73:** The replay found two content gaps—what an order line requests and what additional response information says—that could have been caught when those classes were first discussed. They remained open at close.
- **Turns 54–60 and 65–72:** Repeated, value-by-value and neighboring-area checks were thorough but laborious; batching more of these checks could shorten the interview.
- **Turn 74:** The final review appropriately separated a possible boolean representation issue from a confirmed validation failure and made the model’s remaining gaps explicit.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
