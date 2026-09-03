# Ontology-recovery eval report

Generated: 2026-09-03T07:13:15.415Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **55.9%** | **54.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 64.1% / 100.0% / 78.1% | 94.4% / 68.0% / 79.1% | 25/39 full · 17/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 71.4% / 78.1% / 74.6% | 84.2% / 50.0% / 62.7% | 25/35 full · 16/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 9.5% / 36.4% / 15.1% | 18.8% / 27.3% / 22.2% | 4/42 full · 3/16 scoped ground-truth properties matched; 11 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **64.8%** | **69.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 64.1% / 100.0% / 78.1% | 94.4% / 68.0% / 79.1% | 25/39 full · 17/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 71.4% / 78.1% / 74.6% | 94.7% / 56.3% / 70.6% | 25/35 full · 18/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 26.2% / 100.0% / 41.5% | 50.0% / 72.7% / 59.3% | 11/42 full · 8/16 scoped ground-truth properties matched; 11 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 100.0% / 60.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 100.0% / 60.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 61 turns, 859s wall-clock
- Real app-agent API calls: 137 (apply_ontology_yaml called 36× · get_graph_state called 39×)
- Tool outcomes seen in transcript: 36 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 7826803 total (7802656 prompt · 24147 completion) across 201 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**: Tool says **“✓ Applied: 13 added, 0 updated”** after the persona requested merges/changes to the draft CQ list. That looks wrong for an edit operation; likely duplicated rather than revised the original set.
- **Turn 19**: Persona explicitly asked to keep the general AHU→CO2Sensor link along with the two specific CO2 sensor classes, but the assistant/tool only persisted the two specific classes and two specific relationships. The recap claims the broad CO2Sensor link is retained, but no corresponding apply entry appears here.
- **Turn 22**: Assistant introduced and persisted **DeadbandSetpoint** as a new class based on a property-modeling correction, but there was no explicit follow-up on whether generic **TemperatureSetpoint** should still remain or how the deadband class relates conceptually to it. Not a hard bug, but this was a structural change made with incomplete reconciliation.
- **Turn 24**: Persona said **Zone.occupancyState** and **Economizer.status** should be kept, but there is no tool apply event before the assistant says “Confirmed.” These properties seem to get persisted only later at turn 25, bundled with another follow-up. Mild state-tracking inconsistency.
- **Turn 53**: Duplicate tool call: **“🔍 Checked the current ontology state.”** appears twice in the same turn before validation output.
- **Turn 56**: Assistant says “I applied the new location links,” including **OccupancySensor --hasLocation--> Space**, but after the user says to keep both facts at turn 57 there is no tool apply event confirming any corrective override/confirmation in state despite a warning-based ambiguity.
- **Turn 59–61**: The assistant stops with the ontology knowingly incomplete, despite the process framing earlier suggesting phases toward completion. Not inherently wrong, but if completion was expected, this is a workflow gap rather than a graceful close.

## Noteworthy observations
- **Turn 1**: Good technique: starts from competency questions instead of classes/fields. Strong elicitation move.
- **Turn 2**: Efficient consolidation move by proposing an atomic CQ list, but it slightly over-split obvious operationally unified questions; the persona had to merge many back.
- **Turn 3**: Good targeted follow-up on roles and operating context; it surfaced important context variables early without drifting into org modeling.
- **Turns 4–10**: Generally strong batching strategy for class elicitation—small, justified batches tied back to confirmed questions.
- **Turn 8**: Good restraint: assistant explicitly avoids silently inventing valve subclasses after the persona rejected generic Valve.
- **Turns 11–15**: Relationship elicitation was solid and disciplined, especially distinguishing **service**, **location**, and **composition** rather than collapsing them.
- **Turn 12**: Nice modeling correction: persona simplified many bespoke AHU relations into the two reusable patterns **hasPoint** and **hasPart**; this is a strong ontology-design outcome.
- **Turn 15–16**: Good catch that sensor→setpoint should not be forced as a direct edge; assistant correctly deferred to control logic.
- **Turns 16–19**: The subclassing limitation was handled transparently, but it led to some awkward duplication (generic CO2Sensor plus specific CO2 sensor classes and parallel AHU links). Worth prompt tuning: ask earlier whether the tool supports taxonomy and adapt elicitation strategy up front.
- **Turn 20 onward**: Property elicitation was effective; the assistant repeatedly tested candidate properties against concrete decision use, which kept scope fairly tight.
- **Turn 21–27**: Good recovery when the persona preferred specific setpoint classes over a generic controlRole property. The assistant adapted cleanly.
- **Turn 29–30**: Missed obvious pushback: the assistant asked about temperature sensor role classes for economizer logic right after both parties had already acknowledged economizer logic was probably underspecified. This was a somewhat inefficient probe.
- **Turn 33 onward**: The language-layer pass was thorough but long. Once patterns were stable, this became somewhat mechanical and likely lower-value than resolving remaining logic gaps sooner.
- **Turns 47–49**: Very good discipline on the economizer rule: assistant refused to encode vague explanatory statements as checkable rules.
- **Turn 53**: Validation against persisted state was strong and useful. It correctly identified partial coverage and open gaps instead of pretending completeness.
- **Turn 54–58**: Good recovery strategy during validation: either narrow a CQ or add missing structure. This is a productive pattern worth keeping.
- **Overall**: The interviewer was generally stateful and methodical, but the session was probably too long for the amount of ontology actually finalized. A prompt optimization opportunity is to compress repetitive meaning/alias collection and spend more effort earlier on unresolved decision logic and coverage gaps.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
