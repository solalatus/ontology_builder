# Ontology-recovery eval report

Generated: 2026-09-03T08:01:42.711Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **64.5%** | **58.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 66.7% / 100.0% / 80.0% | 88.9% / 61.5% / 72.7% | 26/39 full · 16/18 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 42.9% / 46.9% / 44.8% | 52.6% / 31.3% / 39.2% | 15/35 full · 10/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 54.8% / 92.0% / 68.7% | 81.3% / 52.0% / 63.4% | 23/42 full · 13/16 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **79.4%** | **70.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 66.7% / 100.0% / 80.0% | 94.4% / 65.4% / 77.3% | 26/39 full · 17/18 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 82.9% / 90.6% / 86.6% | 89.5% / 53.1% / 66.7% | 29/35 full · 17/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 57.1% / 96.0% / 71.6% | 87.5% / 56.0% / 68.3% | 24/42 full · 14/16 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 75.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 64.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 27.5% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 75.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 64.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 27.5% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 63 turns, 997s wall-clock
- Real app-agent API calls: 139 (apply_ontology_yaml called 35× · get_graph_state called 37×)
- Tool outcomes seen in transcript: 35 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 9668557 total (9636659 prompt · 31898 completion) across 205 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 44–51**: Action modeling repeatedly collided with graph direction/tool constraints. The interviewer first accepted valve/plenum/zone-based actions, then had to backtrack because the ontology only supported navigation in the opposite direction. This is a real state/planning issue: actions were elicited before checking whether the modeled relationships could support their inputs.
- **Turn 50–52**: The interviewer changed the meaning of two actions (“check upstream cooling/heating equipment for a valve”) into the reverse operator workflow (“start from chiller/boiler”), then later removed them after the persona said the meaning had drifted too much. This is a substantive mis-modeling/correction cycle.
- **Turn 60**: Validation claimed “at least one class still has no relationship recorded,” specifically calling out generic `CO2Sensor`, but did not clearly identify any other leftover isolated classes despite implying there might be more. Slightly muddy/overstated validation output.
- **Turn 62–63**: Even after the economizer rule/action mismatch was fixed, the tool surfaced another wording warning requiring yet another manual rephrase. Suggests brittle or overly literal action verification logic.

## Noteworthy observations
- **Turn 1–3**: Strong opening technique: the interviewer started with competency questions and pushed to normalize them into acceptance tests before ontology structure. Good requirements-first framing.
- **Turn 2**: The interviewer over-normalized the expert’s list into 21 atomic questions despite the persona’s original offer to help tighten them. This created avoidable churn that the persona had to undo.
- **Turn 3**: Good follow-up on roles and operating context; this efficiently surfaced important contextual qualifiers without prematurely modeling them.
- **Turn 4–8**: Generally good discipline around only adding classes justified by accepted questions, but the interviewer repeatedly proposed generic classes (`HVACEquipment`, `HeatingDevice`, `CoolingDevice`, generic point/reading concepts) that the persona had to trim back.
- **Turn 17–19**: Nice catch that generic `CO2Sensor` was insufficient for the accepted outside-air vs return-air question. Good willingness to revisit class structure when a competency gap appeared.
- **Turn 21–28**: Effective property elicitation overall, especially distinguishing bounded choice properties from numeric/open-text ones. Good separation of “decision-bearing” properties from descriptive nice-to-haves.
- **Turn 23–27**: The interviewer handled the setpoint/sensor specificity issue well once it emerged, but it was a predictable follow-up from the expert’s earlier warning that generic `TemperatureSensor`/`Setpoint` would likely need splitting.
- **Turn 42–53**: The actions phase was the weakest stretch. The interviewer kept trying to force inspection/query behaviors into “actions,” then discovered tool/path constraints late. Prompt could likely steer the agent to distinguish state-changing actions from lookup/inspection routines earlier.
- **Turn 44–47**: Good behavior in not silently adding mirrored reverse relationships just to satisfy the tool; the interviewer explicitly checked with the persona before altering directionality.
- **Turn 51–52**: Strong recovery: when the persona said several actions had drifted into pseudo-actions, the interviewer accepted the correction and reduced the set cleanly to five.
- **Turn 53–60**: Bounded expansion pass was disciplined and useful. The interviewer correctly pushed back on tempting additions (humidifier, spatial descriptive attributes, water-side sensors) unless they tied back to accepted questions/actions.
- **Turn 60–63**: Final validation was helpful and concrete, but somewhat tool-centric. The interviewer did a good job distinguishing real contradictions from intentional dual semantics (occupancy sensor placement vs control association, reporting action verification).

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
