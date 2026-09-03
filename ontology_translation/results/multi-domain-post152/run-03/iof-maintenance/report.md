# Ontology-recovery eval report

Generated: 2026-09-03T07:56:37.854Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **55.0%** | **54.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 50.0% / 55.2% | 87.5% / 43.8% / 58.3% | 8/13 full · 7/8 scoped ground-truth relationships matched; 16 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.0% / 28.6% / 33.3% | 50.0% / 14.3% / 22.2% | 2/5 full · 1/2 scoped ground-truth properties matched; 7 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **60.5%** | **54.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 50.0% / 55.2% | 87.5% / 43.8% / 58.3% | 8/13 full · 7/8 scoped ground-truth relationships matched; 16 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 60.0% / 42.9% / 50.0% | 50.0% / 14.3% / 22.2% | 3/5 full · 1/2 scoped ground-truth properties matched; 7 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 75.0% / 54.5% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 48.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 54.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 66.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 48.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 54.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 66.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 48 turns, 703s wall-clock
- Real app-agent API calls: 104 (apply_ontology_yaml called 28× · get_graph_state called 27×)
- Tool outcomes seen in transcript: 28 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4715861 total (4693583 prompt · 22278 completion) across 162 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**: Assistant says “the tool rejected the action inputs” and “action structures are still incomplete,” but the tool output was `✓ Applied: 17 added, 0 updated.` This is a clear contradiction/misreport of tool behavior.
- **Turn 3**: System reports “5 consistency problem(s) unresolved,” but the assistant does not inspect or address them before proceeding.
- **Turn 19**: After introducing `MaintenanceState`, assistant says it “added the broader class and relationship” and implies a clean addition, but this creates a duplicate `hasMaintenanceState` relation target problem that it only notices much later in validation.
- **Turn 23**: Assistant says it “Added on MaintenanceWorkOrderRecord: performedTaskDetails, finalCost,” but tool output was `0 added, 1 updated.` Likely harmless narration drift, but still inaccurate state reporting.
- **Turn 48**: Assistant claims “all 12” were recorded / validation gaps closed in a way the system immediately flags as numerically inaccurate: system says the turn actually added 0 and updated 4, and the assistant was told to restate the true numbers but did not.
- **Turn 46–48**: Assistant declares the ontology “usable, mostly complete” while still acknowledging unresolved action-navigation warnings caused by directionality. Not necessarily wrong, but it overstates completeness relative to known tool limitations.

## Noteworthy observations
- **Turn 2**: The follow-up about whether “maintenance person” has a subordinate day-to-day role and whether logic depends on operating context feels generic/template-driven and only weakly motivated by the user’s actual list. It slowed progress.
- **Turns 3–6**: Good discipline in grounding candidate classes directly in competency questions/actions and batching confirmations efficiently.
- **Turn 7**: Good recovery when relationship elicitation surfaced missing classes (`FailedState`, `UndesirableDisposition`). The interviewer correctly revised course instead of forcing premature relations.
- **Turns 8–12**: Strong handling of relation wording precision. The assistant repeatedly checked verb directionality and did not bulldoze the domain expert into accepting stronger semantics than warranted.
- **Turn 12**: Good interview technique separating qualification from assignment. This prevented a common modeling collapse.
- **Turns 13–17**: Efficiently handled reverse-direction temptations by explicitly checking whether reverse links are real domain facts versus just navigational conveniences.
- **Turns 18–21**: The assistant only noticed late that `FailedState` was too narrow for the earlier competency questions about operating/degraded/failed. This was an important miss that should have been caught when those questions were first analyzed.
- **Turns 21–25**: Good property minimalism. The assistant resisted adding IDs/statuses just because they are common in systems, and tied properties back to confirmed actions.
- **Turns 34–36**: Nice correction when the close rule revealed a genuinely needed `MaintenanceActivity.isCompleted` property after earlier excluding activity status. This shows adaptive elicitation.
- **Turns 37–41**: Good pattern of reconciling rule semantics with current model constraints instead of silently inventing new structure.
- **Turns 41–43**: Smart move to reframe `createMaintenanceWorkOrder` around `MaintenanceProcess` once it became clear the original input class didn’t fit the modeled logic.
- **Turns 43–46**: Bounded expansion pass was efficient and appropriately scoped; good that the assistant explicitly asked and then stopped when the persona declined further expansion.
- **Turn 46**: Validation pass was valuable and surfaced real issues, especially duplicate relation naming and missing representable effects for start/close.
- **Turn 46**: However, the assistant introduces an “automated second opinion” with no visible tool output supporting it, which makes provenance of those findings unclear in the transcript.
- **Overall**: The interviewer was generally careful, incremental, and good at semantic precision, but had recurring narration/state-reporting inaccuracies around tool results and completeness claims.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
