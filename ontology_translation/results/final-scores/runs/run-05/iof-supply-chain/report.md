# Ontology-recovery eval report

Generated: 2026-11-05T05:57:57.984Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **78.4%** | **93.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.4% / 100.0% / 75.3% | 100.0% / 87.5% / 93.3% | 32/53 full · 28/28 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 73.3% / 88.0% / 80.0% | 91.3% / 84.0% / 87.5% | 22/30 full · 21/23 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **78.4%** | **93.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.4% / 100.0% / 75.3% | 100.0% / 87.5% / 93.3% | 32/53 full · 28/28 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 73.3% / 88.0% / 80.0% | 91.3% / 84.0% / 87.5% | 22/30 full · 21/23 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 37.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 36.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 30.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 37.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 36.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 30.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 90 turns, 815s wall-clock
- Real app-agent API calls: 147 (apply_ontology_yaml called 48× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 48 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 5312908 total (5272993 prompt · 39915 completion) across 237 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 4–5:** The interviewer added two standalone questions before confirming they were requirements. The expert rejected both as independent questions, and the interviewer removed them.
- **Turns 20–21:** The interviewer initially declined to preserve “storage facility is a kind of facility,” despite the expert stating it explicitly. It corrected course after the expert intervened.
- **Turns 81–82:** A second ontology edit was skipped because only one edit could be applied per message. The interviewer checked the canvas and added the three outstanding actions on the next turn.

## Noteworthy observations

- **Turns 28–45, 71–73:** Good restraint around missing evidence paths: the interviewer did not invent shipment-to-process, service, or traceable-unit links to make the model appear complete.
- **Turns 47–50, 76–82:** It usefully distinguished an action’s intended effect from evidence that it succeeded, though several turns were spent re-establishing that distinction.
- **Turns 52–66:** Collecting class meanings, relationship meanings, and aliases in small batches was thorough but lengthy; much of this could likely be consolidated.
- **Turns 89–90:** The final validation clearly labeled partial coverage as incomplete and carried forward specific gaps rather than declaring a pass.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
