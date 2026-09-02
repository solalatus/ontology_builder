# Ontology-recovery eval report

Generated: 2026-09-02T17:52:32.209Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.7%** | **62.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 64.1% / 100.0% / 78.1% | 83.3% / 60.0% / 69.8% | 25/39 full · 15/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 71.4% / 92.6% / 80.6% | 78.9% / 55.6% / 65.2% | 25/35 full · 15/19 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.2% / 100.0% / 62.3% | 56.3% / 47.4% / 51.4% | 19/42 full · 9/16 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.8%** | **65.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 64.1% / 100.0% / 78.1% | 83.3% / 60.0% / 69.8% | 25/39 full · 15/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 77.1% / 100.0% / 87.1% | 89.5% / 63.0% / 73.9% | 27/35 full · 17/19 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.2% / 100.0% / 62.3% | 56.3% / 47.4% / 51.4% | 19/42 full · 9/16 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 60.0% / 50.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 22.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 22.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 61 turns, 672s wall-clock
- Real app-agent API calls: 114 (apply_ontology_yaml called 38× · get_graph_state called 13×)
- Tool outcomes seen in transcript: 38 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 5045193 total (5020791 prompt · 24402 completion) across 194 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 4**: Assistant says “the tool flagged that the action inputs reference classes we haven’t defined yet,” but the visible tool output only says `✓ Applied: 20 added, 0 updated.` The warning appears fabricated or at least unsupported by the transcript.
- **Turn 4**: System reports “The agent left 5 consistency problem(s) unresolved,” but the assistant does not inspect or resolve them, and proceeds as if only a generic warning exists. Loss of tool/state fidelity.
- **Turn 10–12**: Assistant repeatedly frames the `checkActiveControlAvailability` action as requiring navigability from `Zone` to `Thermostat`, even though the relationship `Thermostat serves Zone` already exists and could often be queried in reverse at the graph/query layer. This may be a real app limitation, but the assistant keeps treating it as ontology incompleteness rather than separating model semantics from query-direction concerns until much later.
- **Turn 19–24**: The assistant spends many turns trying to “fix” the directionality issue, then ultimately concedes it’s a tool-direction problem. This is a state-management/product bug smell: the app seems unable to represent inverse traversal cleanly, and the interviewer burns time on it.
- **Turn 21**: Assistant says “There is still at least one relationship gap left somewhere in the confirmed class list,” then asks whether to remove generic `CO2Sensor`. That is not a relationship gap; it’s a class hierarchy/modeling choice. Misdiagnosis of validation state.
- **Turn 22–23**: After removing `CO2Sensor`, assistant still claims “one unresolved relationship-side gap” remains, then shifts to `TemperatureSetpoint` and then to relationship orientation. This looks like the interviewer/tool is guessing at validation failures rather than reading a precise diagnostic.
- **Turn 31–32**: Assistant asks whether `Economizer` needs to be a class, despite the persona already having explicitly proposed “add the economizer as its own thing” with relationship and property. Redundant confirmation after a clear domain instruction.
- **Turn 45**: Tool output says `✓ Applied: 0 added, 4 updated.` after collecting allowed values for **5** properties (`AirHandlingUnit.status`, `Zone.occupancyStatus`, `Thermostat.mode`, `Thermostat.status`, `TerminalUnit.status`). Likely a real tool misapplication or dropped update.
- **Turn 60**: Assistant claims a “separate automated review” reported two observations, but no such review/tool output appears in the transcript. Unsupported insertion.
- **Turn 60**: Validation says the competency question “Which zone or space does this thermostat serve?” is only partly covered, but that exact question was part of the original acceptance test and the interviewer had earlier accepted not modeling `Thermostat serves Space`. Final validation surfaces this as partial only at the end instead of earlier as an explicit accepted limitation.

## Noteworthy observations
- **Turn 1**: Strong opening: starts with competency questions/actions before classes/relationships. Good ontology-elicitation discipline.
- **Turn 3**: Good targeted follow-up on role distinctions and operating context; efficiently elicits occupancy/deadband/economizer context without drifting broad.
- **Turn 5–7**: Good handling of domain naming and subclass granularity; the interviewer lets the persona rename `AirHandler`→`AirHandlingUnit/AHU`, `Control Zone`→`Zone`, and split setpoints/valves/sensors where operationally meaningful.
- **Turn 8–12**: Relationship elicitation is generally crisp and incremental, but over-indexes on avoiding any unconfirmed link, which is good for precision but slows progress.
- **Turn 10–12**: Missed an obvious follow-up: since `Zone` lacked a path to `Space`, the interviewer could have asked whether `Thermostat locatedIn Space` plus `TerminalUnit serves Space` was enough for any intended queries before spiraling into directionality concerns.
- **Turn 13–15**: Nice catch on `TemperatureSensor` being too generic for AHU air-side use; the assistant correctly probes whether to introduce `AirTemperatureSensor` rather than silently overloading the generic class.
- **Turn 16–17**: Good insistence on confirming whether outside-air vs return-air CO2 belongs in class structure versus tags. This is exactly the kind of modeling decision that matters later.
- **Turn 19–24**: Inefficient stretch. The interviewer spends several turns on a storage/query-direction issue that likely belongs in implementation notes, not domain elicitation. Prompt could tell the agent to record “inverse traversal required by app” and move on.
- **Turn 24–30**: Property elicitation is well scoped: only “decision-bearing” properties tied to confirmed questions/actions. This kept the model lean.
- **Turn 26**: Good catch that measured temperature should live on the sensor, not duplicated on the AHU.
- **Turn 30–32**: Good recovery on economizer modeling. The agent notices verification is ahead of the model and elicits `Economizer` as a distinct thing with `status`.
- **Turn 36**: Slightly awkward prompt bug: “Please give me a one-sentence plain meaning for these 2 classes: 1. CO2DifferentialSensor 2. AirHandlingUnit’s broader location/context is already covered...” The second item is malformed; the persona handled it gracefully.
- **Turn 38–43**: Language-layer capture is thorough, maybe more thorough than necessary. If optimizing for speed, many meanings/aliases could likely be deferred or autogenerated after structural validation.
- **Turn 47–53**: Rule elicitation is solid. Assistant usefully forces the persona to restate conditions in terms of already-modeled facts, preventing hand-wavy rules.
- **Turn 54–59**: Good distinction between state-changing actions and inspection actions. The assistant correctly challenges using a rule as a precondition for a check action.
- **Turn 60–61**: Final validation is useful in principle, but the assistant introduces unsupported “automated second-opinion review” language and reopens previously accepted implementation constraints. A better prompt would have it clearly separate: domain-complete vs app-executable-with-current-directionality.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
