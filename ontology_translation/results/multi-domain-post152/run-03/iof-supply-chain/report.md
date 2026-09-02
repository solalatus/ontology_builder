# Ontology-recovery eval report

Generated: 2026-09-02T19:26:31.295Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **36.2%** | **37.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 58.5% / 93.9% / 72.1% | 85.7% / 72.7% / 78.7% | 31/53 full · 24/28 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 33.3% / 40.0% / 36.4% | 34.8% / 32.0% / 33.3% | 10/30 full · 8/23 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/3 full · 0/2 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **38.9%** | **38.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 62.3% / 100.0% / 76.7% | 89.3% / 75.8% / 82.0% | 33/53 full · 25/28 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 36.7% / 44.0% / 40.0% | 34.8% / 32.0% / 33.3% | 11/30 full · 8/23 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/3 full · 0/2 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 0.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 34.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 27.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 0.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 34.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 27.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **pleasantry_loop_detected**, after 55 turns, 475s wall-clock
- Real app-agent API calls: 81 (apply_ontology_yaml called 24× · get_graph_state called 2×)
- Tool outcomes seen in transcript: 24 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 2442335 total (2427168 prompt · 15167 completion) across 141 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 13 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: Speaker/state handling bug at session start: the persona’s opening message from turn 0 is duplicated as an `app-user` message in turn 1, indicating the app echoed the persona content back as user input.
- **Turn 4**: The assistant says the 5 actions were only captured “conceptually” and not resolved into valid ontology entries because input classes do not yet exist, but the prior tool message says **“✓ Applied: 5 added”**. This is a clear contradiction between tool state and assistant narration.
- **Turn 4**: System reports **“The agent left 5 consistency problem(s) unresolved — see Check.”** The assistant never inspects or addresses those problems, and proceeds as if nothing happened.
- **Turn 12**: Tool says **“✓ Applied: 3 added”**, but the assistant only reports one new class plus two relationships. Likely correct arithmetic, but the assistant does not explicitly account for all three additions, making state tracking fuzzy.
- **Turn 39–41**: The assistant accepts “Customer is currently reached through SupplyRelationship” and then “Supplier is also reached through SupplyRelationship,” but no confirmed relationship connects **Shipment** (or another backbone class) to **SupplyRelationship**. This is presented as if it provides a usable path when it does not.
- **Turn 55**: The assistant ends by saying “Next time we’ll resume…” after the user has already indicated the session is over; harmless, but slightly redundant state-wise.

## Noteworthy observations
- **Turn 1**: Strong framing at the start: the interviewer sets a phased process and begins with competency questions, which is efficient for ontology elicitation.
- **Turn 2**: Good move to challenge bundled business questions and distinguish grouped business questions from potentially separate ontology concepts.
- **Turns 5–9**: Good discipline in confirming candidate classes before asserting relationships; the interviewer generally avoids overcommitting structure too early.
- **Turns 9–18**: Effective yes/no relationship probing. The format keeps elicitation crisp and makes it easy to separate confirmed links from speculative ones.
- **Turns 10–17**: Nice responsiveness to the expert’s distinctions (e.g., ShipmentPreparation vs service context; SupplyChainNode vs ship-from/ship-to). This is a strong modeling instinct.
- **Turn 18 onward**: The interview starts generating many late-surfacing classes from relationship discussion (Receiving, Storage, StorageFacility, TraceableResourceUnit, InventoryManagement, ConsigningProcess, Container, service classes). This is not wrong, but it suggests the class-discovery phase was not fully exhausted before entering relationship elicitation.
- **Turns 23–27**: The interviewer handles uncertainty well by explicitly preserving open gaps instead of forcing paths. This is one of the better parts of the interaction.
- **Turns 26–28**: The assistant may be too willing to promote explanatory phrases into classes (`TraceableResourceUnit`, `InventoryManagement`) with minimal challenge about whether they are core domain entities versus broader functional areas. A tighter prompt might require stronger evidence before class creation.
- **Turns 28–52**: The tail becomes somewhat inefficient: many turns are spent individually confirming that various paths remain open. Useful for rigor, but verbose and potentially fatiguing; some of these could have been batched.
- **Turns 39–48**: The interviewer occasionally talks about things being “reached through” other classes even when no actual graph path has been confirmed. That phrasing risks overstating model completeness.
- **Turn 53**: The summary is solid and usefully distinguishes confirmed backbone vs. explicitly open gaps. Good stopping-point behavior.
- **Overall**: Interview technique is generally careful and conservative, with a commendable bias against hallucinating ontology structure. Main optimization opportunity is better tool-state reconciliation and more aggressive batching of “still open?” checks.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
