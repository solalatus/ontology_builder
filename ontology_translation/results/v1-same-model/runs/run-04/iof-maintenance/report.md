# Ontology-recovery eval report

Generated: 2026-11-05T02:22:32.359Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.0%** | **58.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 70.0% / 87.5% / 77.8% | 73.3% / 68.8% / 71.0% | 14/20 full · 11/15 scoped ground-truth classes matched; 16 recovered |
| Relationship recall / precision / F1 | 61.5% / 57.1% / 59.3% | 75.0% / 42.9% / 54.5% | 8/13 full · 6/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 83.3% / 90.9% | 100.0% / 33.3% / 50.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 6 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.0%** | **58.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 70.0% / 87.5% / 77.8% | 73.3% / 68.8% / 71.0% | 14/20 full · 11/15 scoped ground-truth classes matched; 16 recovered |
| Relationship recall / precision / F1 | 61.5% / 57.1% / 59.3% | 75.0% / 42.9% / 54.5% | 8/13 full · 6/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 83.3% / 90.9% | 100.0% / 33.3% / 50.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 6 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 59.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 60.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 40.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 59.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 60.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 40.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 76 turns, 866s wall-clock
- Real app-agent API calls: 118 (apply_ontology_yaml called 34× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 34 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3286765 total (3249137 prompt · 37628 completion) across 194 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turns 32, 38–40, 76:** The interviewer added a separate `finalCost` field before confirming the record’s schema. The expert clarified that the existing **cost** field holds the final amount, but the erroneous field remained on the canvas.
- **Turns 37–40:** The property recap omitted established work-order fields. After the expert supplied them, the interviewer initially excluded date, task description, and task code from the agent-facing model, requiring another correction.
- **Turns 15–16:** The interviewer asked the expert to rename canvas entries despite the expert having no canvas access. It then used searchable names for the existing keys, leaving the underlying names unchanged.

## Noteworthy observations
- **Turns 17–25, 72–75:** Strong restraint about unsupported links and lookups. The interviewer identified gaps—such as selecting the current state or finding a work order from an asset—rather than inventing connections.
- **Turns 61–71:** The action review usefully separated preconditions from evidence that an action took effect, especially for assignment, work start, and closure.
- **Turns 49–56:** The language pass became repetitive: several rounds asked for relationship aliases, including repeated “none” responses. This could likely be consolidated.
- **Turns 64–65:** The interviewer caught the overlap between “operating” and “degraded” classification and left it unresolved rather than imposing an unstated normal-performance test.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
