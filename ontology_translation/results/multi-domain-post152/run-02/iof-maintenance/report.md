# Ontology-recovery eval report

Generated: 2026-09-03T07:30:48.329Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.2%** | **60.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 85.0% / 94.4% / 89.5% | 93.3% / 77.8% / 84.8% | 17/20 full · 14/15 scoped ground-truth classes matched; 18 recovered |
| Relationship recall / precision / F1 | 69.2% / 52.9% / 60.0% | 87.5% / 41.2% / 56.0% | 9/13 full · 7/8 scoped ground-truth relationships matched; 17 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 20.0% / 33.3% / 25.0% | 50.0% / 33.3% / 40.0% | 1/5 full · 1/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **64.8%** | **62.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 85.0% / 94.4% / 89.5% | 93.3% / 77.8% / 84.8% | 17/20 full · 14/15 scoped ground-truth classes matched; 18 recovered |
| Relationship recall / precision / F1 | 92.3% / 70.6% / 80.0% | 100.0% / 47.1% / 64.0% | 12/13 full · 8/8 scoped ground-truth relationships matched; 17 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 20.0% / 33.3% / 25.0% | 50.0% / 33.3% / 40.0% | 1/5 full · 1/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 42.9% / 42.9% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 62.5% / 76.9% | 5/5 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 42.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 71.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 69.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 42.9% / 42.9% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 62.5% / 76.9% | 5/5 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 42.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 71.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 69.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 65 turns, 1296s wall-clock
- Real app-agent API calls: 103 (apply_ontology_yaml called 30× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 30 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 3828041 total (3804173 prompt · 23868 completion) across 175 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3** — The tool reported `Applied: 26 added` for “18 competency questions,” then the system immediately said **8 consistency problems unresolved**. The assistant did not inspect or resolve those problems and proceeded as if Phase 1 was clean.
- **Turn 3** — The interviewer asked an odd, likely prompt-driven but mis-scoped question about “closely related role” and “operating context” that was not clearly grounded in the acceptance-test material and did not seem necessary before class elicitation.
- **Turn 12** — Real edit sequencing bug: the generic `MaintenanceState` was removed before the replacement state classes were added; tool also warned **“only one edit is applied per message.”** The assistant acknowledged the temporary broken state but still let the ontology sit inconsistent across turns.
- **Turn 13** — The assistant claimed it had added direct current-state relationships from `MaintainableMaterialItem` to each concrete state, even though only **9 items** were added total after introducing 3 new classes plus 3 process/event relationships; the count suggests possible mismatch/overclaim unless relationship totals were tracked elsewhere.
- **Turn 19** — The assistant/tool said `Applied: 4 added` for four relationship outcomes, but one was a **non-add** (`do not add FailureEvent → RequiredFunction` had just been reversed to add; still plausible) and this section felt bookkeeping-fragile. More broadly, the assistant often asserted exact persistence details without re-checking.
- **Turn 28** — Tool output said `0 added, 1 updated` right after a response that rejected all proposed properties; likely indicates a silent type/default update not explained by the assistant.
- **Turn 33** — Tool said `0 added, 1 updated` after adding three aliases (`maintenance work order`, `work order`, `MWO`), implying alias handling may be collapsing to one field/update; the assistant did not note this potential tooling quirk.
- **Turn 37** — The same alias `is prescribed by` was applied to two different relationships with very different semantics (`isGovernedBy` and `requires`). The interviewer accepted this without caution; that is a likely language-layer modeling bug or future ambiguity source.
- **Turn 42–47** — Rules were added before all needed model support was settled; e.g. close-work-order rule required activity completion, which was only added later. The assistant eventually repaired this, but rule creation order was shaky.
- **Turn 50** — The assistant said it had added three state-classification rules “using only facts already in the model,” but the prior discussion explicitly established that the raw decision basis was **outside** the model and rules had to be outcome-style only. This is not necessarily wrong, but the distinction was muddy and easy to misapply.
- **Turn 53** — After updating three actions, the assistant reported only **one** “real modeling gap,” but then surfaced additional checker warnings and changed action input later. State tracking around action validity was brittle.
- **Turn 57–58** — The assistant accepted a known navigation limitation for `startMaintenanceProcess` rather than resolving it, leaving an action whose precondition is not navigable from its input under the stored edge direction. Not a contradiction, but a knowingly incomplete executable model.
- **Turn 61 onward** — The assistant repeatedly called the model “largely validated” / “usable” despite a known unresolved action limitation and earlier unresolved consistency warnings. This overstates completion.

## Noteworthy observations
- **Turn 2** — Good early cleanup: the interviewer noticed over-splitting of state questions and ambiguity around required-function questions before recording.
- **Turns 4–8** — Efficient class elicitation in justified batches tied directly to competency questions/actions; good discipline in asking keep/drop rather than free brainstorming.
- **Turns 8–12** — Good handling of tool limitation around lack of subclassing: the interviewer explicitly surfaced the modeling constraint and negotiated an alternative. This was one of the stronger moments.
- **Turns 9–11** — Strong technique: the assistant resisted adding a direct `item experienced failure event` relation when the expert had not supported it.
- **Turns 16–19** — Good restraint around `FailureEvent → RequiredFunction`: the interviewer did not force a verb, recognized the gap, and got an explicit broad association only after the persona confirmed it.
- **Turns 20–24** — Nice pattern of checking whether “hanging” classes really needed more connections, though it became somewhat tool-driven rather than domain-driven.
- **Turn 25** — Missed follow-up: the persona introduced **final cost** and performed-task info as closure-critical, but the interviewer initially asked about status properties instead of immediately probing closure-supporting data requirements.
- **Turns 26–28** — Good narrowing on properties: the interviewer consistently pushed back on identifiers and generic statuses that weren’t needed for accepted questions/actions.
- **Turns 38–39** — Good disambiguation step before recording aliases that could easily have been false synonyms (`failure`, `functional failure`, `failure mode`, etc.).
- **Turn 41** — Nice catch that the user’s wording (“satisfies required qualification”) did not match the stored model (`isQualifiedFor activity`); the interviewer resolved to model-grounded phrasing.
- **Turns 44–46** — Good recovery when closure rule referenced unsupported completion facts; the assistant asked for the minimal model addition instead of inventing a process-level status.
- **Turns 47–50** — The state-classification rule discussion exposed a recurring prompt issue: the interviewer kept trying to make every action fully checkable inside the ontology even after the persona had clearly scoped raw condition assessment outside the model.
- **Turns 52–58** — Action modeling was the weakest section. The interviewer repeatedly ran into directionality/input-class problems because actions were forced into a one-input-class shape after the ontology had already been modeled. Several repairs were needed.
- **Turn 56** — Good catch that assignment required a real stored assignment relation if the action is meant to have an effect, not just a verification.
- **Turn 57** — Solid judgment rejecting the tool’s “inverse” warning between `isAssignedTo` and `isQualifiedFor`; that shows useful semantic sanity-checking rather than blindly obeying lint.
- **Turns 58–61** — The bounded domain-expansion pass was efficient but low-yield; likely required by prompt, yet it consumed several turns to repeatedly elicit “none.”
- **Overall** — Strong ontology discipline, good anti-hallucination behavior, and generally careful scope control. Main weakness is over-reliance on tool/workflow constraints, which caused awkward detours, temporary inconsistencies, and a final model with an explicitly accepted action-path limitation.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
