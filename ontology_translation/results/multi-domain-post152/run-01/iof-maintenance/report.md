# Ontology-recovery eval report

Generated: 2026-09-03T06:46:45.766Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **81.0%** | **71.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 72.7% / 66.7% | 87.5% / 63.6% / 73.7% | 8/13 full · 7/8 scoped ground-truth relationships matched; 11 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **81.0%** | **71.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 72.7% / 66.7% | 87.5% / 63.6% / 73.7% | 8/13 full · 7/8 scoped ground-truth relationships matched; 11 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 92.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 85.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 77.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 92.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 85.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 77.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 55 turns, 778s wall-clock
- Real app-agent API calls: 108 (apply_ontology_yaml called 32× · get_graph_state called 20×)
- Tool outcomes seen in transcript: 32 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3977630 total (3957539 prompt · 20091 completion) across 165 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 12**: Tool reports **“✓ Applied: 3 added”** after the persona only confirmed **one** new relationship (`FunctioningProcess -> realizesRequiredFunction`) and re-affirmed two previously discussed relationships. The count is suspicious and may indicate misapplied edits or duplicate additions.
- **Turn 20**: Tool reports **“0 added, 1 updated”** when the assistant says it **recorded four properties** on `MaintenanceWorkOrderRecord`. That looks like an ontology-edit accounting bug or incorrect persistence summary.
- **Turn 36–38**: The interviewer correctly catches that the persona referenced an unmodeled relation (`person satisfies qualification specification`), but later the **rule text still semantically relies on a qualification-specification requirement plus person qualification-for-activity without ever connecting those two facts**. Not a hard contradiction, but it leaves the rule underspecified relative to the stated rationale.
- **Turn 52 onward**: The assistant says it is doing a competency check against the **persisted** model, but some findings are based on narrative interpretation rather than clearly persisted structures (e.g. “path/direction issues remain” for actions). This is acceptable review behavior, but the distinction between persisted ontology facts vs. execution-layer traversal assumptions gets blurry.

## Noteworthy observations
- **Turn 2**: Good narrowing move: the interviewer asks a focused follow-up on roles/context rather than rushing into ontology structure.
- **Turns 3–6**: Strong technique: proposes small batches of candidate classes tied directly to accepted competency questions, and accepts naming corrections cleanly (`MaintainableItem`, `MaintenanceWorkOrderRecord`, `QualificationSpecification`).
- **Turns 6–15**: Good discipline around not storing both directions of the same fact unnecessarily. The interviewer repeatedly checks whether reverse links are real domain facts or just traversal conveniences.
- **Turns 10–15**: The interviewer handles emerging gaps well by pausing to add `FunctioningProcess` only when the persona introduces it. Good state management here.
- **Turns 13–15**: Positive behavior: explicitly marks CQ coverage as partial instead of forcing invented links. This is one of the strongest parts of the interview.
- **Turns 17–25**: Good phase discipline around properties: the assistant resists adding operational fields until actions justify them.
- **Turn 22**: Strong pushback. The interviewer notices that “close work order” seems to require some representational state, and asks how closure would be verified without a status field.
- **Turns 23–25**: Also good restraint: after discovering closure depends on activity completion, the interviewer explicitly leaves the action partially modeled rather than inventing a completion property.
- **Turns 37–38**: Good bug-avoidance behavior: catches the persona trying to use an unmodeled relation and forces the rule back onto established facts.
- **Turns 43–46**: Efficient recovery when a new action implies a missing assignment fact. The interviewer correctly interrupts action capture, adds the missing relationship, then resumes.
- **Turns 42–50**: Repeated “directionality warning” pattern is useful, but also suggests the prompt may be overcommitting to directed-edge operationalization during elicitation. In several places the interviewer ends up with domain-approved semantics that are awkward for action execution.
- **Turns 52–55**: Final validation pass is strong overall: concise gap inventory, clear distinction between covered vs. partially covered CQs, and no pressure to over-model unresolved parts.
- **Overall**: The interview is impressively disciplined and stateful, but somewhat inefficient because several later action-execution issues are predictable consequences of earlier insistence on single preferred directions. A prompt optimization might encourage the agent to distinguish earlier between:
  - **domain-truth direction**
  - **query/action traversal needs**
  - **whether inverse traversal is assumed by the runtime even if not stored as a separate ontology fact**

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
