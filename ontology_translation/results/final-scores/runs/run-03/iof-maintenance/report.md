# Ontology-recovery eval report

Generated: 2026-10-20T19:50:41.165Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **88.8%** | **69.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 80.0% / 94.1% / 86.5% | 86.7% / 76.5% / 81.3% | 16/20 full · 13/15 scoped ground-truth classes matched; 17 recovered |
| Relationship recall / precision / F1 | 76.9% / 83.3% / 80.0% | 87.5% / 58.3% / 70.0% | 10/13 full · 7/8 scoped ground-truth relationships matched; 12 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **91.5%** | **72.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 80.0% / 94.1% / 86.5% | 86.7% / 76.5% / 81.3% | 16/20 full · 13/15 scoped ground-truth classes matched; 17 recovered |
| Relationship recall / precision / F1 | 84.6% / 91.7% / 88.0% | 100.0% / 66.7% / 80.0% | 11/13 full · 8/8 scoped ground-truth relationships matched; 12 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 40.0% / 57.1% | 5/5 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 66.7% / 61.5% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 20.0% / 100.0% / 33.3% | 1/5 ground-truth actions matched by name/meaning; 1 recovered |
| Action input-class accuracy | 100.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 50.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 66.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 80.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 83.3% / 76.9% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 20.0% / 100.0% / 33.3% | 1/5 ground-truth actions matched by name/meaning; 1 recovered |
| Action input-class accuracy | 100.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 50.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 66.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 80.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 92 turns, 884s wall-clock
- Real app-agent API calls: 138 (apply_ontology_yaml called 37× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 37 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4723693 total (4684667 prompt · 39026 completion) across 230 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 14 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 50:** The interviewer added `taskCode` but withheld `workOrderDate` pending a link to an agreed requirement, even though the expert had given the same rationale for both. It added the date after asking a follow-up.
- **Turns 58–59:** The interviewer said “qualification” was already an alternate name for `QualificationSpecification`. The expert rejected that equivalence, and the interviewer removed the alias.
- **Turn 63:** The interviewer reversed the recorded strategy–process relationship after the expert said “strategy governs process” and “process is governed by strategy” express the same fact. It also retained “governs” as an alternate phrase for the reversed direction, where it does not read naturally.

## Noteworthy observations

- **Turns 23–38, 91–92:** The interviewer generally resisted inventing links to make asset-specific questions or assignment checks appear supported. Its final replay clearly marked partial and unsupported paths.
- **Turns 75–80:** It recorded only the work-order creation action, leaving four required actions unrecorded because their effects or verification could not be supported. The expert confirmed this as a limitation of the current canvas, not a change in scope.
- **Turns 81–90:** The interview became repetitive: after several explicit statements that record layouts and evidence sources were unavailable, it continued asking similar gap and expansion questions. A shorter unresolved-items handoff would have been more efficient.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
