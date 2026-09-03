# Ontology-recovery eval report

Generated: 2026-09-03T10:01:04.008Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **52.0%** | **60.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 82.1% / 92.0% / 86.8% | 25/53 full · 23/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 73.3% / 75.9% / 74.6% | 87.0% / 69.0% / 76.9% | 22/30 full · 20/23 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 10.0% / 17.4% | 100.0% / 10.0% / 18.2% | 2/3 full · 2/2 scoped ground-truth properties matched; 20 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **52.0%** | **60.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 82.1% / 92.0% / 86.8% | 25/53 full · 23/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 73.3% / 75.9% / 74.6% | 87.0% / 69.0% / 76.9% | 22/30 full · 20/23 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 10.0% / 17.4% | 100.0% / 10.0% / 18.2% | 2/3 full · 2/2 scoped ground-truth properties matched; 20 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 20.0% / 100.0% / 33.3% | 1/5 ground-truth rules matched (core condition equivalence, not name alone); 1 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 25.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 79.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 60.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 20.0% / 100.0% / 33.3% | 1/5 ground-truth rules matched (core condition equivalence, not name alone); 1 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 25.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 79.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 60.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 50 turns, 754s wall-clock
- Real app-agent API calls: 125 (apply_ontology_yaml called 36× · get_graph_state called 37×)
- Tool outcomes seen in transcript: 36 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 7656014 total (7633234 prompt · 22780 completion) across 177 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**: Tool says **“23 added, 0 updated”** after the user requested revisions to an existing 25-question list. This suggests misapplied edits; some items should likely have been updated/removed rather than only added.
- **Turn 4**: System reports **“The agent left 5 consistency problem(s) unresolved”** and the interviewer immediately continues without resolving or even surfacing them. Real state-management gap.
- **Turn 40**: Persona asked to add **two** relationships (`Shipment -> ReceivingProcess` and `Shipment -> TransportProcess`), but tool reports **only 1 added** and assistant claims only `ReceivingProcess` was recorded. This is a concrete missed edit.
- **Turn 41**: Assistant later notices the missing `Shipment -> TransportProcess` path, confirming the prior incomplete apply.
- **Turn 18**: Assistant says it removed **“the two competency questions”** unsupported by structure, but actually one removed item was the broad service question representing multiple previously discussed service questions; the cleanup may not fully reflect prior accepted intent.
- **Turn 37**: Assistant explicitly drops `prepareShipment` preconditions from the action record because the tool only supports named-rule preconditions. That loses user-provided action semantics unless represented elsewhere; arguably a modeling/tool limitation surfaced as data loss.

## Noteworthy observations
- **Turn 1**: Good opening structure: starts with competency questions before classes and keeps the first ask narrow.
- **Turn 2**: Efficient normalization of user questions into more atomic competency questions, but it initially **over-split** several items and had to be corrected.
- **Turn 3**: Good recovery: interviewer accepted the persona’s corrections on combining/splitting and recognized missing tracking coverage for logistic unit/load.
- **Turn 4**: The follow-up on subordinate roles/operating context feels only weakly justified by the ontology task and introduced staffing detail the persona later deprioritized.
- **Turns 11–13**: Strong interview technique when the persona distinguished **facility vs location vs supply chain node**; the interviewer correctly paused relationship entry and reopened class decisions before recording.
- **Turns 13–16**: Nice restraint: interviewer repeatedly avoids inventing links the persona didn’t confirm, especially around freight-forwarding and service/process links.
- **Turns 17–18**: Good scope discipline. The interviewer explicitly tested weakly connected classes and removed `Sublot`, `LogisticsService`, `PackagingService`, and `StorageService` when the persona couldn’t ground them.
- **Turn 18**: However, removing the broad service competency question may have been somewhat premature; a reviewer tuning the prompt might want clearer guidance on when to preserve a competency question despite deferred structure.
- **Turns 35–41**: Good example of iterative consistency checking around actions. The interviewer caught unsupported preconditions/effects and forced missing relationship decisions instead of hand-waving them.
- **Turn 37**: The assistant was transparent about tool limitations (“preconditions point to named rules”), which is good, but it also shows a workflow inefficiency: user had to restate preconditions that weren’t actually preserved as such.
- **Turns 45–50**: Strong final validation pass. The interviewer did not falsely declare completion; it identified genuine acceptance-test gaps, got explicit fixes, then revalidated.
- **Overall**: The interviewer was generally careful, scoped, and willing to retract overreach. Main prompt-optimization opportunity: better synchronization between proposed edits and tool application, and stronger handling when the system reports unresolved consistency issues.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
