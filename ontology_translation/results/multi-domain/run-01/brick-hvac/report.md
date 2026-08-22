# Ontology-recovery eval report

Generated: 2026-08-22T17:15:59.823Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **53.4%** | **48.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.4% / 100.0% / 72.1% | 77.8% / 63.6% / 70.0% | 22/39 full · 14/18 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 48.6% / 68.0% / 56.7% | 31.6% / 24.0% / 27.3% | 17/35 full · 6/19 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 19.0% / 88.9% / 31.4% | 37.5% / 66.7% / 48.0% | 8/42 full · 6/16 scoped ground-truth properties matched; 9 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 75.0% | 75.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **60.1%** | **57.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.4% / 100.0% / 72.1% | 77.8% / 63.6% / 70.0% | 22/39 full · 14/18 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 65.7% / 92.0% / 76.7% | 63.2% / 48.0% / 54.5% | 23/35 full · 12/19 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 19.0% / 88.9% / 31.4% | 37.5% / 66.7% / 48.0% | 8/42 full · 6/16 scoped ground-truth properties matched; 9 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 83.8% | 83.8% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 60.0% / 60.0% / 60.0% | 3/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 88.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 25.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 41.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 88.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 25.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 41.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 43 turns, 526s wall-clock
- Real app-agent API calls: 90 (apply_ontology_yaml called 26× · get_graph_state called 21×)
- Tool outcomes seen in transcript: 26 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4146490 total (4124393 prompt · 22097 completion) across 175 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3** — Tool says **“26 added, 0 updated”** after the persona asked to *reword* several previously drafted competency questions. That strongly suggests the agent added duplicates instead of updating the existing list.
- **Turn 3** — Assistant claims the 26 competency questions are “confirmed,” but it never showed the revised accepted wording after the user’s corrections; likely state drift between discussed and saved versions.
- **Turn 6** — Assistant says it “captured the five core actions conceptually,” but the tool had already applied **5 added** before class confirmation. This indicates actions may have been created in an inconsistent state, which the system then flags.
- **Turn 6** — System reports **5 consistency problems unresolved** immediately after the assistant said the model would be brought into consistency; confirms a real unresolved-state bug.
- **Turn 8 / 10** — Generic **CO2Sensor** was added, then later the model also added **OutsideAirCO2Sensor** and **ReturnAirCO2Sensor** without cleaning up the original class; leftover unused class persisted and later required manual scoping out.
- **Turn 16–17** — Assistant asks how to model CO2 despite earlier having already committed to a generic **CO2Sensor** class and related justification; this is a partial backtrack/rework caused by earlier premature modeling.
- **Turn 34–39** — Inverse relationship handling is buggy:
  - Added **Zone isServedBy Thermostat**,
  - tool warned about inverse-pair conflict,
  - persona chose to remove it,
  - assistant later says it was removed,
  - but **Turn 40** check reveals it still exists on the canvas marked **REMOVE**.
- **Turn 39** — Assistant says the stored inverse relationship was removed, but **Turn 40** proves it was not actually removed from the live model. Clear misreport of state.
- **Turn 29 / 30** — Tool updates **24** items for relationship meanings and then another **24** for aliases, which seems implausibly high relative to the listed relationships and may indicate over-application or duplicate edits.
- **Turn 40** — Assistant’s “final validation” uncovers unresolved issues that should have been caught earlier, especially the lingering inverse artifact; suggests weak synchronization between prior apply steps and actual ontology state.

## Noteworthy observations
- **Turn 1** — Strong opening: the interviewer frames the phased process clearly and starts with competency questions rather than jumping into schema.
- **Turn 2** — Good normalization move: assistant converts raw user questions into atomic competency questions. This is efficient, though it over-split some items and then had to be corrected.
- **Turn 3–5** — Generally good elicitation discipline: the assistant asks for one narrow required follow-up on roles/context, then transitions to actions.
- **Turn 5** — Nice attempt to convert actions into “atomic, model-testable actions,” but it over-modeled troubleshooting checks as first-class actions; the persona had to narrow scope.
- **Turn 6 onward** — Repeatedly useful pattern: “small justified batch” of classes/relationships keeps the interview manageable and grounded in confirmed questions.
- **Turn 9** — Good tool-aware modeling question about whether setpoint distinctions should be separate classes or typed variants, explicitly referencing lack of subclassing.
- **Turn 10–13** — Good restraint: assistant pushes back on adding broader plant-side equipment unless justified by confirmed questions/actions.
- **Turn 15** — Missed obvious alternative for CO2 modeling: the assistant presented relationship-vs-class options only after already introducing **CO2Sensor** earlier, creating avoidable churn.
- **Turn 18–21** — Good scope control on location and zone/space relationships; interviewer avoids over-modeling when persona says “not yet.”
- **Turn 21–25** — Good property elicitation overall; especially solid when the persona rejects derived/stored fields like `activeControlAvailable` and `economizerEligible`.
- **Turn 24–25** — Nice distinction between verifiable action state and derived verification via trends; interviewer accepts not all actions need explicit status flags.
- **Turn 33–38** — The interviewer handled the zone-input vs thermostat-direction conflict transparently, but became overly constrained by the tool. A better prompt might encourage modeling guidance like “keep natural domain direction and record action traversal limitation” earlier, instead of trying to force a schema workaround.
- **Turn 39–43** — Validation phase was valuable: it surfaced real leftover issues (inverse artifact, unused class, missing enum). Good that the agent did not falsely declare full completion once it checked the live model.
- **Overall** — The assistant is strong at structured ontology elicitation and scope discipline, but weak at keeping the persisted state aligned with conversational decisions. The main optimization target is reducing premature writes and ensuring edits truly update/remove prior artifacts rather than layering new objects on top.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
