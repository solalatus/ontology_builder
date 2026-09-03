# Ontology-recovery eval report

Generated: 2026-09-03T08:07:12.253Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **74.2%** | **81.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.8% / 93.3% / 67.5% | 82.1% / 76.7% / 79.3% | 28/53 full · 23/28 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 70.0% / 80.8% / 75.0% | 69.6% / 61.5% / 65.3% | 21/30 full · 16/23 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **77.0%** | **85.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.6% / 100.0% / 72.3% | 89.3% / 83.3% / 86.2% | 30/53 full · 25/28 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 73.3% / 84.6% / 78.6% | 73.9% / 65.4% / 69.4% | 22/30 full · 17/23 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 40.0% / 66.7% / 50.0% | 2/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 36.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 57.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 43.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 40.0% / 66.7% / 50.0% | 2/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 36.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 57.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 43.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 93 turns, 1328s wall-clock
- Real app-agent API calls: 163 (apply_ontology_yaml called 34× · get_graph_state called 35×)
- Tool outcomes seen in transcript: 34 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 10463812 total (10434612 prompt · 29200 completion) across 259 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 11 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 6**: Assistant says “the tool correctly flagged a modeling issue” about undefined action input classes, but the tool output only says “✓ Applied: 5 added, 0 updated.” This looks like fabricated tool interpretation.
- **Turn 7**: Assistant claims “The tool now correctly warns that SupplyRelationship is not yet connected to Supplier or Customer,” but the actual preceding system note was a generic unresolved-consistency message, not that specific warning.
- **Turn 10**: Assistant states “this tool does not support subclassing.” That constraint was not evidenced by any tool output in the transcript; could be a prompt-level assumption, but it’s presented as if known system behavior.
- **Turn 17–18**: The interviewer introduces `ShipFromLocation` and `ShipToLocation` as new classes during the relationship phase, despite earlier framing Phase 2/class selection as closed. Not fatal, but it shows phase/state drift.
- **Turn 40–41**: Persona had explicitly kept `InventoryManagement` out at turn 13, but the interviewer later re-opened scope and added `InventoryManagementProcess` to ground `TraceableResourceUnit`. This is defensible after user approval, but it contradicts the earlier “kept out” closure and indicates weak phase discipline.
- **Turn 55**: Tool says “✓ Applied: 0 added, 1 updated” after adding both `TrackingEvent.eventTime` and `TrackingEvent.eventType`; the assistant reports both as recorded without noticing the apparent mismatch.
- **Turn 69**: Tool says “9 updated” for a batch of 7 relationship meanings; assistant does not notice or reconcile the count discrepancy.
- **Turn 74–80**: Rules are added/linked, but the assistant never surfaces actual tool grounding details, while later validation references specific effect/verification mismatches. Those validations may be plausible, but they read partly invented rather than strictly tool-derived.

## Noteworthy observations
- **Turn 1**: Efficient opening: asks for natural-language competency questions first rather than jumping to classes.
- **Turn 2**: Over-eager decomposition. The interviewer split questions into many atomized CQs before confirming with the expert, causing rework and some distortion of operational phrasing.
- **Turn 3**: Good recovery after correction. The assistant accepted the persona’s preferred 12-question set and recorded it cleanly.
- **Turn 3–4**: The follow-up about subordinate roles/context was weakly justified. It did extract useful context, but it wasn’t clearly tied to an immediate modeling decision.
- **Turn 6 onward**: Strong habit of “small justified batch” elicitation. This kept the session organized and made expert confirmations easy.
- **Turn 9–13**: Good interviewing discipline around generic vs specific process/service concepts. The interviewer let the persona reject overly generic `Process`/`Service` modeling and pivoted to specific classes.
- **Turn 17–24**: The interviewer did a good job not forcing Node/Facility/location equivalence and repeatedly asked for “real path, not guessed shortcut.”
- **Turn 19–25**: Strong avoidance of invented links. The interviewer repeatedly backed off when the persona said a direct edge was not grounded.
- **Turn 26–31**: Good correction on `recordTrackingEvent`: the interviewer allowed the action input to change from `Shipment` to `TrackingEvent` when the original grounding proved poor.
- **Turn 31–33**: Good technique in testing whether to re-center `receiveShipment...` on `ReceivingProcess`; the interviewer accepted the expert’s insistence that the business action remains shipment-centered.
- **Turn 33–54**: Very persistent gap-closing, but also somewhat inefficient. Many turns were spent confirming that classes/services had no safe relationships yet. This is useful for honesty, but a prompt optimization could batch “strict open items” faster.
- **Turn 40–43**: Nice example of surfacing scope tension explicitly: broad concept (`TraceableResourceUnit`) was under-connected, and the interviewer asked for a direct scope decision rather than silently leaving it broken.
- **Turn 49–54**: The assistant continued eliciting despite already knowing some classes would remain unconnected. Could have switched earlier to a “known incomplete/open-item register” mode to save turns.
- **Turn 62 onward**: Efficient batching of definitions/meanings. Good repetitive-pattern handling.
- **Turn 71 onward**: Good minimal alias handling; interviewer noticed diminishing returns and stopped “fishing.”
- **Turn 76–79**: Good modeling integrity. The interviewer refused to weaken the preparation rule just because the graph lacked support.
- **Turn 80–83**: Bounded expansion pass was well done: asked only for nearby missing concepts, found `BillOfLading`, then explicitly deferred it rather than adding another dangling class.
- **Turn 85–92**: Strong final honesty. The assistant clearly enumerated open items and did not pretend the ontology was complete.
- **Overall**: Best aspect is epistemic discipline: the interviewer often resisted inventing edges. Main downside is verbosity/turn count from repeatedly asking one narrow yes/no gap question at a time when some could have been grouped.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
