# Ontology-recovery eval report

Generated: 2026-09-02T18:38:48.800Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **47.4%** | **57.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 41.5% / 95.7% / 57.9% | 75.0% / 91.3% / 82.4% | 22/53 full · 21/28 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 56.7% / 77.3% / 65.4% | 69.6% / 72.7% / 71.1% | 17/30 full · 16/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 11.1% / 19.0% | 100.0% / 11.1% / 20.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 18 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **49.6%** | **59.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 43.4% / 100.0% / 60.5% | 75.0% / 91.3% / 82.4% | 23/53 full · 21/28 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 60.0% / 81.8% / 69.2% | 73.9% / 77.3% / 75.6% | 18/30 full · 17/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 11.1% / 19.0% | 100.0% / 11.1% / 20.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 18 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 40.0% / 100.0% / 57.1% | 2/5 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 62.5% / 76.9% | 5/5 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 12.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 44.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 40.0% / 100.0% / 57.1% | 2/5 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 62.5% / 76.9% | 5/5 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 12.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 44.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 65 turns, 930s wall-clock
- Real app-agent API calls: 129 (apply_ontology_yaml called 32× · get_graph_state called 32×)
- Tool outcomes seen in transcript: 32 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 7147947 total (7127271 prompt · 20676 completion) across 205 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: The transcript shows the persona’s opening statement duplicated as both `persona` turn 0 and `app-user` turn 1. This looks like orchestration/UI plumbing, not interviewer behavior, but it is a transcript/system bug.
- **Turn 5**: Assistant says the tool “correctly flagged a structural issue” about actions lacking confirmed input classes, but no tool output actually shows that at that moment; instead a later `app-system` message reports unresolved consistency problems. The assistant appears to infer tool state not explicitly returned.
- **Turn 5**: `app-system` reports **8 consistency problems unresolved**; the assistant does not address or inspect them directly and continues the interview. That’s a real state-management issue.
- **Turn 12**: Tool says **“5 added”** after confirming `Facility` plus `Lot/Sublot/LogisticUnit/Load`. This likely means the assistant silently recorded four classes from turn 10 plus the newly introduced `Facility` all at once. Not necessarily wrong, but it indicates deferred application / delayed state commit that could confuse auditability.
- **Turn 50**: Assistant incorrectly claims “all 8 actions still have missing input classes,” then `app-system` flags that the last turn actually added only **1** item. The assistant had mixed up current commit counts/state; this is a concrete bug.
- **Turn 52**: Tool says **7 actions updated**, which implies `maintainTraceability` may also have been assigned despite the prior turn leaving it open. The assistant’s recap says it’s still open. This suggests possible mismatch between applied edits and spoken recap.

## Noteworthy observations
- **Turn 1**: Strong opening structure: asks for natural-language competency questions before ontology primitives. Good elicitation discipline.
- **Turns 2, 4, 6, 11, 16, 19, 21, 24, 26, 29, 31, 34, 42, 47, 49, 53, 55**: Repeated use of narrow, one-issue clarifications is very effective. The interviewer consistently prevents premature modeling assumptions.
- **Turns 3, 8, 9, 10, 12**: Good batching of candidate classes; efficient and easy for the persona to answer.
- **Turns 18–23**: Excellent restraint around incomplete service-path modeling. The agent notices the missing path to `TransportationService` and explicitly leaves it open instead of inventing a connector.
- **Turns 25–27, 53–56**: Similarly good handling of receiving-path incompleteness; the interviewer repeatedly checks whether to leave gaps explicit rather than forcing a false `Shipment -> ReceivingProcess` link.
- **Turn 28 onward**: Property elicitation is somewhat tool-driven rather than domain-driven. The interviewer has to “argue” the persona into generic identifiers. Reasonable given tooling constraints, but it creates friction and could be streamlined by framing identifiers as implementation-agnostic identity needs from the start.
- **Turns 29–32**: Good recovery when the persona rejects status fields and concrete ID schemes. The assistant adapts by using process/event structure and generic identifiers.
- **Turns 41–44**: Good synonym hygiene. The assistant correctly rejects “order” as too ambiguous for `PurchaseOrder`.
- **Turns 46–50**: Rule elicitation is careful and high quality. The interviewer checks every rule against currently modeled structure and narrows unsupported business rules instead of overclaiming.
- **Turns 50–59**: Action modeling is where tool constraints visibly strain the interview. The “single input class” limitation forces awkward compromises, especially for `maintainTraceability`. The assistant handles it fairly well, but this area is inefficient and may merit prompt/tool redesign.
- **Turn 58–64**: The assistant is very aware of directed-edge/navigation limitations imposed by the tool. This is good for correctness, but it may also be overfitting ontology capture to query-path mechanics. The persona explicitly pushes back on adding inverse edges “just to satisfy navigation in one tool.”
- **Turn 64–65**: Strong close. The assistant provides a crisp, prioritized open-items list and does not pretend validation is complete.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
