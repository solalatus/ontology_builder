# Ontology-recovery eval report

Generated: 2026-11-04T11:25:37.344Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 25-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **96.8%** | **70.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 96.0% / 100.0% / 98.0% | 100.0% / 70.8% / 82.9% | 24/25 full · 17/17 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 96.0% / 100.0% / 98.0% | 100.0% / 70.8% / 82.9% | 24/25 full · 17/17 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 89.5% / 100.0% / 94.4% | 100.0% / 29.4% / 45.5% | 34/38 full · 10/10 scoped ground-truth properties matched; 34 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **96.8%** | **70.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 96.0% / 100.0% / 98.0% | 100.0% / 70.8% / 82.9% | 24/25 full · 17/17 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 96.0% / 100.0% / 98.0% | 100.0% / 70.8% / 82.9% | 24/25 full · 17/17 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 89.5% / 100.0% / 94.4% | 100.0% / 29.4% / 45.5% | 34/38 full · 10/10 scoped ground-truth properties matched; 34 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 42.9% / 42.9% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 28.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 37.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 51.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 42.9% / 42.9% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 28.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 37.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 51.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 83 turns, 828s wall-clock
- Real app-agent API calls: 130 (apply_ontology_yaml called 40× · get_graph_state called 5×)
- Tool outcomes seen in transcript: 40 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4254940 total (4222478 prompt · 32462 completion) across 213 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 9 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

None observed.

## Noteworthy observations

- **Turns 2–9:** The interviewer split compound desk checks into precise questions and accepted important corrections, including “recorded” rather than “agreed” price and separate change and cancellation replies.
- **Turns 38–43:** When the canvas could not represent two distinct allowance links, the interviewer left the price-associated lookup open rather than conflating it with allowance applicability.
- **Turns 56–63:** Asking for the consequence of every property being missing or wrong made this stretch repetitive. Several values could likely have been checked in larger batches.
- **Turns 70–80:** A late expansion check uncovered agreement lines and six more delivery values. It was useful, but meant adding requirements after the actions had already been defined.
- **Turns 82–83:** The final audit distinguishes covered lookups from partial ones and preserves known gaps despite a clean consistency check.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
