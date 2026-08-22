# Ontology-recovery eval report

Generated: 2026-08-21T14:46:59.162Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **78.4%** | **79.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 61.5% / 96.0% / 75.0% | 94.4% / 68.0% / 79.1% | 24/39 full · 17/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 68.6% / 86.2% / 76.4% | 78.9% / 55.2% / 65.0% | 24/35 full · 15/19 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.2% / 100.0% / 62.3% | 81.3% / 68.4% / 74.3% | 19/42 full · 13/16 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **78.4%** | **79.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 61.5% / 96.0% / 75.0% | 94.4% / 68.0% / 79.1% | 24/39 full · 17/18 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 68.6% / 86.2% / 76.4% | 78.9% / 55.2% / 65.0% | 24/35 full · 15/19 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.2% / 100.0% / 62.3% | 81.3% / 68.4% / 74.3% | 19/42 full · 13/16 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 20.0% / 5.6% / 8.7% | 1/5 ground-truth actions matched by name/meaning; 18 recovered |
| Action input-class accuracy | 100.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 57.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 29.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 81.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 20.0% / 5.6% / 8.7% | 1/5 ground-truth actions matched by name/meaning; 18 recovered |
| Action input-class accuracy | 100.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 57.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 29.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 81.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 69 turns, 740s wall-clock
- Real app-agent API calls: 82 (apply_ontology_yaml called 6× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 6 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3752966 total (3723785 prompt · 29181 completion) across 208 API calls

## LLM review of the conversation

## Errors
- **Turn 4**: Assistant claims “The tool also correctly flagged that some of those actions assume connections we haven’t modeled yet,” but no such tool output appears in the transcript.
- **Turn 8**: After the persona explicitly says to rename/replace `AirHandler`, the assistant only “confirms” and moves on; no apply/update happens, leaving the conflict unresolved.
- **Turn 9**: Assistant’s recap includes **Building** as a confirmed class even though it had not been proposed/confirmed in the class phase yet.
- **Turn 16**: Assistant says the duplicate `AirHandler` is “still unresolved in the live model” even though there was never a successful apply/removal after the user approved replacement; this is effectively a dropped edit.
- **Turn 24**: Assistant says the persisted model includes “specific point classes for outside-air vs return-air CO2 and for the temperature setpoint roles,” but no visible tool action for those additions happened at that point; likely overstated state.
- **Turn 40**: Assistant says “OccupancySensor is still not yet in the live model” after earlier confirming it as justified; later turns show it indeed had not yet been added—state lag persisted for a long stretch.
- **Turn 41**: Assistant says the remaining class meanings are “approved for storage” but does not invoke the tool; persistence is deferred while phrased as if nearly done.
- **Turn 59**: Assistant says OccupancySensor and Economizer are “approved as final additions” but again does not apply them yet.
- **Turn 60**: Large apply happens, but the assistant still cannot resolve/delete obsolete `AirHandler`; this longstanding duplicate/alias collision remains unresolved despite repeated confirmations from the user to replace it. This is the clearest real bug/tool limitation affecting ontology correctness.
- **Turn 60**: Assistant reports that “older draft actions” remain in the live model alongside cleaned-up ones and cannot remove them automatically; another unresolved state-management/tooling limitation.
- **Turn 67–68**: Relationship meanings are confirmed for storage, but no tool apply occurs before the session ends; leaves known persistence gap open.

## Noteworthy observations
- **Turn 1 onward**: Strong phased structure (purpose → questions/actions → classes → relationships → properties → rules → actions) keeps the interview organized and easy for the persona to answer.
- **Turns 6–7**: Good handling of naming correction (`AirHandlingUnit` vs `AirHandler`) by asking explicitly rather than silently merging—though execution later failed.
- **Turns 9–12**: Good discipline in testing whether candidate concepts deserve to be classes versus properties/context. The persona’s removals were productively elicited.
- **Turn 14–16**: Assistant adapted well when the persona’s answer implied a class refactor (specific CO2 sensor and setpoint roles), instead of forcing everything into generic classes.
- **Turns 18–21**: Nice recovery when plant-side relationships were initially overcommitted; the interviewer let the persona re-anchor the model around valves rather than direct chiller/boiler→AHU links.
- **Turns 24–27**: Good catch that occupancy handling implied a missing `OccupancySensor` class; this was a useful follow-up triggered by property discussion.
- **Turns 30–32**: Efficiently scoped economizer modeling by first testing property-vs-class, then adding only the minimal class/property needed and later correctly marking the decision rule as open.
- **Turns 41–43**: Good elicitation of bounded value sets *and* consequences of missing/wrong values—useful for later validation and prioritization.
- **Turns 43–50**: Rule elicitation was generally strong, especially renaming the occupancy rule to match the persona’s operational framing and splitting temperature logic into separate named rules.
- **Turns 50–58**: Action modeling was careful and tool-aware, especially splitting actions by input class due to one-input-class tool constraints.
- **Turns 54–66**: Particularly good follow-up on action/relationship direction mismatch. The assistant resisted inventing reverse relationships and instead refined action wording to “match existing forward relationships,” which is prompt-worthy behavior.
- **Throughout**: The assistant often says “captured” or “stored in conversation” without persisting immediately. This is transparent, but also creates long stretches where confirmed content is not actually in the live model.
- **Throughout**: Repeated recap blocks are helpful for state tracking, but somewhat verbose; several could likely be shortened without losing control of the interview.
- **Overall**: Biggest optimization target is tool-state hygiene: the interviewer recognized collisions, stale classes, and superseded actions, but the workflow/tooling couldn’t clean them up. Prompt/tool design should support explicit deletion/replacement and clearer distinction between “confirmed in chat” vs “persisted in ontology.”

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
