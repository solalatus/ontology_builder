# Ontology-recovery eval report

Generated: 2026-09-02T18:38:42.083Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **77.3%** | **69.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 70.0% / 93.3% / 80.0% | 86.7% / 86.7% / 86.7% | 14/20 full · 13/15 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 53.8% / 50.0% / 51.9% | 87.5% / 50.0% / 63.6% | 7/13 full · 7/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **82.2%** | **72.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 70.0% / 93.3% / 80.0% | 86.7% / 86.7% / 86.7% | 14/20 full · 13/15 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 69.2% / 64.3% / 66.7% | 100.0% / 57.1% / 72.7% | 9/13 full · 8/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 81.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 77.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 50.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 81.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 77.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 50.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 61 turns, 925s wall-clock
- Real app-agent API calls: 126 (apply_ontology_yaml called 36× · get_graph_state called 27×)
- Tool outcomes seen in transcript: 36 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4994810 total (4974055 prompt · 20755 completion) across 197 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: Duplicate seed prompt/state weirdness: the persona intro appears at turn 0 and is then repeated as `app-user` at turn 1. Likely transcript/rendering bug or app echoing user content as a new turn.
- **Turn 3**: Tool says `✓ Applied: 12 added` immediately after a terminology-distinction answer, but the assistant recap implies those were the 12 competency questions from earlier. Looks like the tool application is lagged/misattributed to the wrong turn.
- **Turn 12–14**: Assistant says “Before I record the next relationships…” then asks for a missing class (`FunctioningProcess`), but at turn 14 the tool reports `✓ Applied: 3 added` and the assistant claims it recorded the new class plus two prior relationships. This is a state-management smell: additions were bundled late and not clearly aligned to user confirmation points.
- **Turn 17**: Assistant proposes removing `FailedState` and turning failed into a value of `MaintenanceState`, despite having just accepted `FailedState` as a required separate class and relationship target. Not fatal, but a notable wobble in model commitment caused by tool limitations.
- **Turn 24 / 26**: Tool reports only `1 updated` after multiple properties were introduced (`stateCategory`, then four WorkOrder properties). Either the tool is collapsing edits unexpectedly or the apply summaries are inaccurate.
- **Turn 42–46**: Action support/path checking is inconsistent. The assistant first treats reverse navigation limits as a model gap, then as an action-design issue, then rewrites natural-language effect/verification text to appease the checker without changing ontology structure. This suggests the validator is overly text/direction sensitive and the agent is working around it rather than modeling cleanly.
- **Turn 48**: Tool reports `✓ Applied: 1 added, 1 updated` for adding a rule and updating an action, but no explicit tool-backed capture of prior actions/rules was shown consistently. State transitions for actions/rules are opaque.
- **Turn 61**: “Final check” still reports unresolved warnings, yet the assistant immediately proposes degrading action effect wording to “the maintenance process is now described for execution,” which changes domain meaning and hides `WorkOrder`. This is a real bug/anti-pattern: optimizing phrasing for the validator at the expense of ontology fidelity.

## Noteworthy observations
- **Turn 1**: Strong opening move: starts with competency questions before classes/properties. Good elicitation discipline.
- **Turn 2**: Efficient early disambiguation of near-synonyms (`item/asset`, `qualification/qualification specification`, etc.). Good move that prevented later confusion.
- **Turn 3–4**: The “role/context completeness check” felt somewhat canned and only loosely connected to the user’s stated scope; still, the persona handled it well.
- **Turn 5–9**: Good batching of candidate classes tied back to specific competency questions. Efficient and traceable.
- **Turn 11**: Missed an obvious follow-up earlier: once `RequiredFunction` was central, the interviewer should have anticipated that “maintenance process” and “functioning process” were different. It only discovered this after proposing poor relationship options.
- **Turn 11–15**: Nice recovery when corrected on function modeling. The agent accepted the correction and introduced `FunctioningProcess` cleanly.
- **Turn 16–18**: Good handling of tool limitations around subclassing. The assistant explicitly surfaced the limitation instead of silently encoding a fake relation.
- **Turn 20–29**: Property elicitation was disciplined and scope-controlled; the interviewer repeatedly resisted adding decorative fields. This was one of the stronger stretches.
- **Turn 25**: The user introduced WorkOrder properties (`date`, `task description`, `task code`, `cost`) that were not directly motivated by the original competency questions. The assistant accepted them without probing whether they were needed for actions/reporting versus merely common operational data.
- **Turn 34–40**: Alias capture was mostly careful. Good catch at turn 37 on “failure mode” possibly colliding with `FailureModeCode`.
- **Turn 41–52**: Action elicitation exposed a weakness in the framework: the interviewer had deferred action modeling too long, so relationship-direction issues only surfaced late. Earlier lightweight action-path checks could have prevented rework.
- **Turn 42–44**: Good distinction between **qualification** and **assignment** despite tool inverse warnings. The assistant correctly resisted collapsing those.
- **Turn 45–60**: The assistant did a solid job tightening action preconditions/effects/verification once the validator complaints were exposed. This was a productive cleanup pass.
- **Turn 55**: Validation summary was useful and skimmable; good reviewer-style recap.
- **Turn 61**: However, the final cleanup instinct is dangerous: the assistant starts suggesting semantically weaker, checker-safe rewordings instead of preserving domain truth and marking validator limitations explicitly. Prompt should discourage “wording hacks” that erase important entities just to satisfy directional checks.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
