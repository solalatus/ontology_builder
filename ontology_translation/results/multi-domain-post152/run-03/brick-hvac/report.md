# Ontology-recovery eval report

Generated: 2026-09-02T19:31:11.582Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **70.8%** | **59.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 69.2% / 100.0% / 81.8% | 88.9% / 59.3% / 71.1% | 27/39 full · 16/18 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 80.0% / 87.5% / 83.6% | 73.7% / 43.8% / 54.9% | 28/35 full · 14/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 35.7% / 68.2% / 46.9% | 62.5% / 45.5% / 52.6% | 15/42 full · 10/16 scoped ground-truth properties matched; 22 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 85.7% | 85.7% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **72.7%** | **62.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 69.2% / 100.0% / 81.8% | 88.9% / 59.3% / 71.1% | 27/39 full · 16/18 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 85.7% / 93.8% / 89.6% | 84.2% / 50.0% / 62.7% | 30/35 full · 16/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 35.7% / 68.2% / 46.9% | 62.5% / 45.5% / 52.6% | 15/42 full · 10/16 scoped ground-truth properties matched; 22 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 85.7% | 85.7% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 41.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 43.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 41.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 43.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 57 turns, 747s wall-clock
- Real app-agent API calls: 125 (apply_ontology_yaml called 32× · get_graph_state called 32×)
- Tool outcomes seen in transcript: 32 applied · 0 skipped · 1 no-op · 0 error
- Tokens: 7334564 total (7311145 prompt · 23419 completion) across 185 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 31**
  - Tool/app said “Recorded the allowed value lists for those five bounded properties,” but the tool reported **`0 added, 4 updated`** even though five properties were discussed. Looks like one bounded-value edit was not applied or not tracked correctly.
- **Turn 37**
  - App claimed it recorded the 5 actions “with your wording change reflected in `maintainWithinDeadband`,” but the persona’s note was only accepted verbally; no evidence the specific rename/update was separately validated. Could be fine, but it’s a soft state-tracking inconsistency.
- **Turn 50**
  - App added six expansion classes immediately, then in turn 51 recognized most were not actually connected/confirmed. This is a real workflow bug: it prematurely committed future-scope classes before establishing they were needed for current competency questions.
- **Turn 51**
  - App says it recorded “the two confirmed properties from the expansion pass” (`Space.maximumOccupancy`, `Zone.occupancyStatus`) even though there was **no explicit confirmation of property names or creation step** after the expansion brainstorm. It inferred and applied edits without the usual confirmation pattern.
- **Turn 54**
  - App added `OccupancySensor locatedIn Space` despite already having `Space hasOccupancySensor OccupancySensor`, then immediately had to unwind it after the tool warned it was likely an inverse duplicate. This is a concrete misapplied edit the interviewer should have anticipated.
- **Across transcript**
  - The assistant repeatedly references validation/checker constraints about graph directionality and “one directed relationship per real-world connection,” but still continues to model other inverse-ish/location shortcuts selectively. The modeling policy is inconsistently applied.

## Noteworthy observations
- **Turn 2**
  - Good move to atomize competency questions, but the first split was overly aggressive and drifted away from the persona’s operational phrasing. Persona had to pull it back.
- **Turn 3**
  - Strong recovery: the interviewer accepted the correction instead of defending the 21-item decomposition.
- **Turn 4**
  - The “required follow-up” about subordinate roles/operating context felt prompt-driven and somewhat off the main ontology path. It gathered useful context, but not obviously necessary at that moment.
- **Turn 6**
  - Nice disciplined batching of candidate classes in small sets. Efficient and easy for the persona to review.
- **Turn 7–9**
  - Good elicitation behavior: when the persona said generic `Setpoint`, `CO2Sensor`, and `ControlValve` were too coarse, the interviewer paused to ask whether distinctions should be modeled as subclasses/kinds vs properties instead of guessing.
- **Turn 12**
  - Good handling of a tooling limitation (`no subclassing`). The interviewer explicitly surfaced the constraint and negotiated a workaround rather than pretending the ontology could support an umbrella class formally.
- **Turn 16–18**
  - Strong catch on the `TemperatureSensor` vs `AirTemperatureSensor` mismatch. This is exactly the kind of class-granularity issue worth resolving before relationships are committed.
- **Turn 18**
  - Useful transparency: the assistant explained the alias collision and how it resolved it after the tool flagged ambiguity.
- **Turn 21–23**
  - The interviewer was a bit too checker-driven (“zero-relationship class” cleanup) rather than question-driven. It worked, but it risks optimizing for ontology completeness metrics over domain usefulness.
- **Turn 24–28**
  - Good minimalism on properties: the assistant resisted adding lots of extra text fields until the persona justified `name`.
- **Turn 29–31**
  - Efficient constraint elicitation overall, though asking “what breaks if it’s missing or wrong?” for every bounded field was somewhat repetitive.
- **Turn 31–32**
  - Good correction by the persona on `OccupancySensor.occupied` not being boolean. The assistant accepted the fix cleanly.
- **Turn 33–35**
  - Very good restraint around economizer logic. The interviewer explicitly avoided overclaiming a full rule when the model didn’t support one.
- **Turn 35**
  - Nice example of capturing a conservative rule (`economizerContextAvailable`) instead of a false decision rule.
- **Turn 37–39**
  - The action modeling started to expose tool/prompt limitations. `enableEconomizer` was under-specified, and the interviewer had to backfill semantics after the tool warning. Good recovery, but indicates action capture should probably require explicit precondition/effect/verification upfront.
- **Turn 45–46**
  - The persona correctly refused to add fake direct facts just to satisfy navigation. Good domain discipline.
- **Turn 46–48**
  - The interviewer handled verification for `increaseCooling`/`increaseHeating` well by using later sensor trends rather than inventing actuator state not yet modeled.
- **Turn 48–53**
  - The bounded domain-expansion pass was mixed:
    - good that it was explicitly bounded;
    - inefficient that future-only plant classes were added first, then removed later.
- **Turn 53**
  - The validation summary was useful and skimmable, but it came very late and included some partial-coverage issues that could have been surfaced earlier.
- **Turn 54–57**
  - The session ended responsibly: the interviewer did not force closure where the tool’s graph-direction assumptions conflicted with the domain truth. Good prompt-following on “don’t invent facts,” even though it left known incompleteness.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
