# Ontology-recovery eval report

Generated: 2026-08-21T15:00:50.549Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.2%** | **75.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 70.0% / 93.3% / 80.0% | 86.7% / 86.7% / 86.7% | 14/20 full · 13/15 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 69.2% / 100.0% / 81.8% | 100.0% / 88.9% / 94.1% | 9/13 full · 8/8 scoped ground-truth relationships matched; 9 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 80.0% / 57.1% / 66.7% | 100.0% / 28.6% / 44.4% | 4/5 full · 2/2 scoped ground-truth properties matched; 7 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.2%** | **75.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 70.0% / 93.3% / 80.0% | 86.7% / 86.7% / 86.7% | 14/20 full · 13/15 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 69.2% / 100.0% / 81.8% | 100.0% / 88.9% / 94.1% | 9/13 full · 8/8 scoped ground-truth relationships matched; 9 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 80.0% / 57.1% / 66.7% | 100.0% / 28.6% / 44.4% | 4/5 full · 2/2 scoped ground-truth properties matched; 7 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 100.0% / 44.4% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 27.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 47.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 54.5% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 100.0% / 44.4% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 27.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 47.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 54.5% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **max_turns_reached**, after 200 turns, 1581s wall-clock
- Real app-agent API calls: 248 (apply_ontology_yaml called 23× · get_graph_state called 25×)
- Tool outcomes seen in transcript: 23 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 15760386 total (15738679 prompt · 21707 completion) across 647 API calls

## LLM review of the conversation

## Errors
- **Turn 3** — Tool says `✓ Applied: 13 added, 0 updated` right after the user said “record them, with those wording adjustments.” Several items were explicitly reworded, so this looks like a misapplied edit or misleading tool report.
- **Turn 5** — Assistant claims “the tool quite rightly flags that their input classes don’t exist yet,” but no such tool output is shown. The only visible outputs are a state check and `✓ Applied: 5 added, 0 updated`.
- **Turn 5** — System reports “The agent left 5 consistency problem(s) unresolved — see Check.” The assistant does not inspect/resolve them and instead proceeds as if Phase 1 is closed.
- **Turn 7** — Assistant says “I also updated the action `Classify an item as failed` so its input is `MaintainableItem`,” but the tool output only says `✓ Applied: 4 added, 1 updated` without making clear that the action update actually succeeded; coupled with earlier tool/report mismatches, this is shaky state handling.
- **Turn 9** — Assistant says “We now have 15 confirmed classes,” but counting the classes recorded by that point yields 15 only if all previous renames/omissions were handled perfectly; given earlier tool-report inconsistencies, this confidence is overstated.
- **Turn 18** — Assistant says it recorded `FailureModeCode.codeValue`, but the tool says `✓ Applied: 0 added, 1 updated`. That’s plausible as an update to an existing class, but the assistant consistently glosses over the add/update distinction, making auditing hard.
- **Turn 31** — Assistant refuses to record the allowed values for `MaintenanceState` because it is “a class rather than a property,” even though the interview had already accepted `MaintenanceState` as the representation of the category. This is more a modeling/tool limitation than domain logic, but it leaves a confirmed constraint unrepresented.
- **Turn 35** — Assistant declines to record the failure-classification rule because the ontology lacks links to express one condition. It does not record even the partial rule or note it in a structured way beyond prose, losing actionable state.
- **Turns 41–200** — The conversation enters a pathological repetition loop (`“That covers it well, thank you.”` / `“You’re welcome.”`) for ~160 turns. This is a clear termination/state-management bug.

## Noteworthy observations
- **Turn 1** — Good start: the interviewer anchored on competency questions before classes/properties, which is efficient for ontology elicitation.
- **Turns 2–4** — Strong technique: it normalized the user’s natural-language questions/actions into atomic candidate statements and asked for confirmation rather than assuming.
- **Throughout early turns** — The interviewer was commendably strict about not inferring reverse relationships or extra semantics just for convenience; this likely improved ontology fidelity.
- **Turns 9–17** — Relationship elicitation became somewhat inefficient. The assistant repeatedly proposed direct/reverse links, got told “not yet,” then asked adjacent variants one by one. A more efficient move would have been to summarize the unresolved pattern and ask for the expert’s preferred representation.
- **Turns 14–17** — Good discipline: when competency questions could not yet be supported by agreed relationships, the assistant explicitly marked them as open modeling gaps instead of papering them over.
- **Turns 17–23** — Property elicitation was careful and mostly good, but the assistant sometimes asked about identifiers/names in a scattered way, causing extra turns for small decisions.
- **Turn 20** — Nice catch: it did not assume which identifying text field (`identifier` vs `name`) the user wanted.
- **Turns 31–39** — The assistant handled rule/action modeling conservatively, distinguishing business truth from what the current ontology can actually evaluate. That’s good ontology hygiene.
- **Turn 38** — Good transparency: it acknowledged the navigation limitation caused by one-way relationship choices rather than silently adding reverse links.
- **Turn 40** — The end-of-session open-items summary was useful, concrete, and reviewer-friendly.
- **Overall** — The interviewer was highly disciplined but sometimes overly rigid, leading to many turns spent confirming non-decisions (“not yet confirmed”) instead of seeking a higher-level modeling commitment.
- **Overall** — The transcript appears to duplicate each persona utterance as `app-user` before the assistant responds. If this is system-generated rather than intentional, it adds noise and may contribute to state confusion.


## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
