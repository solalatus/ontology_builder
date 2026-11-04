# Ontology-recovery eval report

Generated: 2026-11-04T23:02:45.629Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **81.8%** | **50.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 46.2% / 63.2% | 39/39 full · 18/18 scoped ground-truth classes matched; 39 recovered |
| Relationship recall / precision / F1 | 68.6% / 61.5% / 64.9% | 68.4% / 33.3% / 44.8% | 24/35 full · 13/19 scoped ground-truth relationships matched; 39 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 73.8% / 88.6% / 80.5% | 68.8% / 31.4% / 43.1% | 31/42 full · 11/16 scoped ground-truth properties matched; 35 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **93.4%** | **58.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 46.2% / 63.2% | 39/39 full · 18/18 scoped ground-truth classes matched; 39 recovered |
| Relationship recall / precision / F1 | 94.3% / 84.6% / 89.2% | 89.5% / 43.6% / 58.6% | 33/35 full · 17/19 scoped ground-truth relationships matched; 39 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 83.3% / 100.0% / 90.9% | 87.5% / 40.0% / 54.9% | 35/42 full · 14/16 scoped ground-truth properties matched; 35 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 17.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 22.4% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 83.3% / 76.9% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 17.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 22.4% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 94 turns, 1030s wall-clock
- Real app-agent API calls: 156 (apply_ontology_yaml called 48× · get_graph_state called 13×)
- Tool outcomes seen in transcript: 48 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 6358388 total (6302845 prompt · 55543 completion) across 250 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 10 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

None observed. The tool calls report successful edits, and the interviewer does not visibly lose track of the agreed distinctions.

## Noteworthy observations

- **Turns 13–21:** The interviewer initially excluded water-temperature sensors, CO₂ differential sensors, and several equipment types until each had an explicit question. This kept scope disciplined, but the expert had to repeatedly justify useful troubleshooting items.
- **Turns 22–40:** Strong distinction between documented connections and plausible ones. The interviewer consistently avoided inferring service, location, or plant paths from equipment type or proximity.
- **Turns 56–76:** The alias review was inefficient: many separate turns asked for exact alternatives and received “none.” Batching the remaining names and links would likely preserve the result with fewer turns.
- **Turns 77–93:** Decision-rule and validation checks were careful about missing evidence, command-versus-result verification, and questions the model could not fully answer. Narrowing several questions to identified items was a useful correction, though it came late in a 94-turn interview.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
