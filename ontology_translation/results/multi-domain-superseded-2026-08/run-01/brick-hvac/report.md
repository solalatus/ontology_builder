# Ontology-recovery eval report

Generated: 2026-08-21T14:05:29.420Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **71.4%** | **59.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 61.5% / 92.3% / 73.8% | 83.3% / 57.7% / 68.2% | 24/39 full · 15/18 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 60.0% / 60.0% / 60.0% | 47.4% / 25.7% / 33.3% | 21/35 full · 9/19 scoped ground-truth relationships matched; 35 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 35.7% / 93.8% / 51.7% | 37.5% / 37.5% / 37.5% | 15/42 full · 6/16 scoped ground-truth properties matched; 16 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **78.1%** | **68.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 66.7% / 100.0% / 80.0% | 88.9% / 61.5% / 72.7% | 26/39 full · 16/18 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 77.1% / 77.1% / 77.1% | 78.9% / 42.9% / 55.6% | 27/35 full · 15/19 scoped ground-truth relationships matched; 35 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 38.1% / 100.0% / 55.2% | 43.8% / 43.8% / 43.8% | 16/42 full · 7/16 scoped ground-truth properties matched; 16 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 60.0% / 50.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 60.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 68.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 62.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 60.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 68.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 62.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 32 turns, 577s wall-clock
- Real app-agent API calls: 73 (apply_ontology_yaml called 20× · get_graph_state called 21×)
- Tool outcomes seen in transcript: 20 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3411359 total (3388698 prompt · 22661 completion) across 135 API calls

## LLM review of the conversation

## Errors
- **Turn 1**: Speaker/state handling bug at the start: the persona intro from turn 0 is duplicated as `app-user` at turn 1, suggesting the app is echoing persona content back as user input.
- **Turn 7**: The assistant says it “updated the language layer so **AirHandler** carries the aliases **air handling unit** and **AHU**,” but the persona had explicitly asked for wording correction, not aliasing as a substitute for renaming. The agent never clearly resolves whether the canonical class label remains `AirHandler` despite the preference against that term.
- **Turn 28**: Tool reports “✓ Applied: 2 added,” but the assistant says it recorded both `shouldIncreaseHeating` and `shouldEnableEconomizer`. `shouldIncreaseHeating` had already been discussed in prior turns and should likely have been added earlier; the sequencing suggests delayed/misaligned persistence.
- **Turn 32**: Validation contradicts earlier recorded state. It claims many classes have “zero relationships” (e.g. `Economizer`, `CoolingValve`, `HeatingValve`, sensor/setpoint classes) even though those classes were explicitly connected via `hasPoint`, `hasPart`, and `feeds` relationships in turns 9–11. This looks like either a validator bug or misinterpretation of stored edges.
- **Turn 32**: The assistant says “Every class has at least one relationship: **no**” based on the faulty validation, which undermines trust in the final audit and suggests the interviewer/tool lost track of ontology state.

## Noteworthy observations
- **Turn 1**: Strong opening move: asks for concrete competency questions and actions before modeling. Efficient and well-scoped.
- **Turn 2**: Good recap and narrowing follow-up on roles/context; keeps scope disciplined.
- **Turns 3–6**: Good pattern of proposing small class batches with justification. The interviewer also correctly surfaces tool limitations around subclassing before committing structure.
- **Turns 4–6**: The interviewer handled “generic plus specific” classes reasonably despite tool limitations, but this created avoidable complexity later; a better prompt might encourage choosing one modeling style unless retrieval genuinely requires both.
- **Turn 7**: Nice catch of the earlier economizer relationship gap; good example of using tool feedback to steer elicitation.
- **Turns 8–12**: Good relationship elicitation overall. The agent repeatedly checks directionality and avoids adding reverse links unless explicitly needed.
- **Turns 10–12**: The persona repeatedly preferred `hasPoint` over separate `hasSensor` / `hasSetpoint`, and the assistant adapted well. Good domain-language alignment.
- **Turns 12–16**: Efficient property elicitation. The interviewer steers away from duplicate derived properties and asks about datatypes/units at the right moment.
- **Turns 13 & 29**: Good behavior when model support is incomplete: the assistant explicitly flags when a rule cannot be fully grounded and asks whether to narrow, extend, or record as broad/open.
- **Turns 26–31**: The economizer and occupied-zone verification rules were knowingly recorded as partially ungrounded. This is acceptable if intentional, but the interviewer could have done one more follow-up to tag them explicitly as “non-executable operational heuristics” rather than ordinary rules.
- **Turn 29**: Missed obvious follow-up: since `verifyOccupiedZoneHasActiveConditioning` depends on “assigned and operating,” the interviewer could have asked whether “operating” requires additional properties on thermostat/terminal unit. Instead, it accepted wording the current model cannot support.
- **Turns 16–21**: The language-layer phase is methodical but somewhat long. Given the sparse aliases, the interviewer did eventually stop “fishing,” which was good.
- **Turn 32**: Final validation is useful in principle, but the faulty relationship audit is the biggest quality issue in the transcript; it obscures what is actually complete vs. open.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
