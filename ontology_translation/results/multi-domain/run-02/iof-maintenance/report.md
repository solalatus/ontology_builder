# Ontology-recovery eval report

Generated: 2026-08-22T16:58:15.465Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **50.8%** | **55.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 45.0% / 90.0% / 60.0% | 60.0% / 90.0% / 72.0% | 9/20 full · 9/15 scoped ground-truth classes matched; 10 recovered |
| Relationship recall / precision / F1 | 46.2% / 50.0% / 48.0% | 75.0% / 50.0% / 60.0% | 6/13 full · 6/8 scoped ground-truth relationships matched; 12 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.0% / 50.0% / 44.4% | 50.0% / 25.0% / 33.3% | 2/5 full · 1/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **50.8%** | **55.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 45.0% / 90.0% / 60.0% | 60.0% / 90.0% / 72.0% | 9/20 full · 9/15 scoped ground-truth classes matched; 10 recovered |
| Relationship recall / precision / F1 | 46.2% / 50.0% / 48.0% | 75.0% / 50.0% / 60.0% | 6/13 full · 6/8 scoped ground-truth relationships matched; 12 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.0% / 50.0% / 44.4% | 50.0% / 25.0% / 33.3% | 2/5 full · 1/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 49.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 35.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 57.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 49.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 35.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 57.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 50 turns, 1209s wall-clock
- Real app-agent API calls: 100 (apply_ontology_yaml called 25× · get_graph_state called 25×)
- Tool outcomes seen in transcript: 25 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3846219 total (3827411 prompt · 18808 completion) across 199 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: The interviewer says “There are about 9 short phases total,” but later behaves as if additional required phases/checks keep emerging; not necessarily wrong, but suggests shaky phase/state management.
- **Turn 2**: Assistant claims “the tool flagged that the action input classes aren’t defined yet,” but the visible tool output only says `✓ Applied: 15 added, 0 updated.` This looks like fabricated tool interpretation.
- **Turn 2**: `app-system` reports “5 consistency problem(s) unresolved,” but the assistant does not inspect or address them directly; it continues the interview as if only one vague issue exists.
- **Turn 7**: Tool says `✓ Applied: 2 added, 0 updated` after the user only narrowed a relationship from `MaintenanceState` to `FailedState`; later turns confirm the broader relationship was not replaced. This indicates a misapplied edit / additive update bug.
- **Turn 9**: Assistant knowingly leaves contradictory live relationships in place (`FailureEvent -> MaintenanceState` and `FailureEvent -> FailedState`) and continues building on top of both instead of immediately reconciling.
- **Turn 10**: Assistant records `MaintenanceActivity --qualifiedPersonFor--> QualifiedMaintenancePerson`, which is not the phrasing the user endorsed; it had already been warned the wording was likely wrong.
- **Turn 13**: Tool reports `0 added, 1 updated` for a requested deletion of the inverse qualification link, but the assistant cannot verify whether deletion actually happened. This suggests the edit mechanism doesn’t support deletion cleanly and the assistant is operating beyond tool capability.
- **Turn 16**: Assistant confirms the stale bad relationships are still present after checking, so earlier “recorded”/“updated” claims were materially unreliable.
- **Turn 20**: Tool says `0 added, 1 updated` after a property batch with one keep and three excludes. The interviewer never clarifies what exactly was updated, making ontology state hard to trust.
- **Turn 22–25**: The interviewer reverses earlier property exclusions (`finalCost`, then `activityStatus`) because it failed to anticipate closure-verification needs. This is not fatal, but it shows loss of global consistency while eliciting.
- **Turn 37**: Assistant says it “recorded” four rules after the user selected **A** to avoid adding a needed person-to-qualification relationship. Given the earlier caveats about tool constraints and unresolved contradictions, this may have overcommitted a partially grounded rule set.
- **Turn 41–44**: Assistant adds inverse relationship `MaintenanceProcess --isDescribedBy--> MaintenanceWorkOrder` solely to satisfy action navigation, immediately triggers an inverse-pair conflict, then removes it and accepts a warning. This is a real modeling thrash / inefficient edit cycle.
- **Turn 48–50**: Despite multiple unresolved live-model contradictions and deletion artifacts, the assistant stops without actually attempting the promised cleanup edit or validation pass. It leaves the ontology in a knowingly inconsistent state.

## Noteworthy observations
- **Turn 1**: Good technique to start from competency questions and actions instead of ontology structure.
- **Turn 2–5**: Efficient batching of candidate classes tied explicitly to user questions/actions; this kept elicitation concrete and domain-grounded.
- **Turn 5–9**: Strong follow-up on state/failure semantics. The interviewer correctly probes whether event→item should be direct or mediated by failed state.
- **Turn 8**: Good handling of “tool does not model subclassing”; the interviewer asks for an operational link instead of forcing taxonomy.
- **Turn 9 onward**: The interviewer is commendably explicit when it notices contradictions, but too willing to postpone cleanup while continuing to build dependent structure.
- **Turn 10–12**: Nice recovery when the user reframes qualification around `QualificationSpecification`; the interviewer catches a hidden class and tests it properly.
- **Turn 13–19**: Repeatedly asking whether direct links are needed vs. two-step paths is good ontology discipline, but the conversation gets somewhat overlong because the agent keeps re-asking consequences of earlier decisions instead of consolidating them.
- **Turn 19–26**: Property elicitation is mixed. The assistant appropriately tries to avoid redundant status fields, but misses obvious verification implications and has to backtrack on `finalCost` and `activityStatus`.
- **Turn 21–25**: Good interview move: challenge exclusions by pointing to a concrete action (“how would you verify closure?”). This surfaced necessary properties.
- **Turn 25–33**: Language-layer capture is systematic, but somewhat low-value relative to unresolved structural issues. The agent probably should have cleaned contradictions before spending many turns on meanings/aliases.
- **Turn 33–35**: Good distinction between “a known needed value” and “an allowed-value list.” Nice follow-up on `activityStatus`.
- **Turn 35–37**: Good rule-vs-verification nuance for close-work-order; the interviewer correctly distinguishes preconditions from verification facts.
- **Turn 37–48**: Action modeling exposes an important prompt issue: the agent’s ontology/action framework seems to require navigability from a single input class along directed edges, which clashes with the preferred domain-centric direction of several relationships. This caused repeated compromises and warnings.
- **Turn 39–48**: The interviewer handles those action/navigation clashes transparently, but inefficiently; it discovers them late, after relationship decisions were already cemented. A better prompt might test action navigability earlier before locking canonical directions.
- **Turn 49–50**: Final status summary is honest and useful, clearly separating domain certainty from live-model cleanup debt.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
