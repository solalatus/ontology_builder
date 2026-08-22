# Ontology-recovery eval report

Generated: 2026-08-22T17:05:43.649Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **63.9%** | **75.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 96.2% / 63.3% | 71.4% / 76.9% / 74.1% | 25/53 full · 20/28 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 46.7% / 50.0% / 48.3% | 56.5% / 46.4% / 51.0% | 14/30 full · 13/23 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **69.3%** | **77.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.8% | 71.4% / 76.9% / 74.1% | 26/53 full · 20/28 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 60.0% / 64.3% / 62.1% | 65.2% / 53.6% / 58.8% | 18/30 full · 15/23 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 73.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 28.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 37.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 73.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 28.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 37.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 87 turns, 1652s wall-clock
- Real app-agent API calls: 170 (apply_ontology_yaml called 41× · get_graph_state called 42×)
- Tool outcomes seen in transcript: 41 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 11019152 total (10992889 prompt · 26263 completion) across 336 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 12 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**: Tool says `✓ Applied: 13 added, 0 updated` immediately after the user corrected 3 of the normalized competency questions. That suggests the corrections were **not actually applied as updates**; likely the uncorrected versions were stored.
- **Turn 5**: Assistant says actions were “captured conversationally, but not yet persistable,” yet the previous tool call reported `✓ Applied: 5 added, 0 updated`. Contradiction between tool state and assistant state.
- **Turn 5**: System reports `The agent left 5 consistency problem(s) unresolved — see Check.` Assistant ignores this and proceeds without inspecting/resolving them.
- **Turn 14**: After the user introduced **SupplyChainNode** and rejected a direct `TransportProcess → Carrier` link, the tool reports `✓ Applied: 5 added, 0 updated` after only 1 new class + 4 relationships were discussed. Count is suspicious but not provably wrong; however:
- **Turn 14**: Assistant records `Shipment --shipsFromLocation--> Location` / `shipsToLocation`, despite the user explicitly saying to keep **distinct ship-from and ship-to location concepts**. The assistant collapsed them into one `Location` class with role-specific predicates, which may be acceptable, but it did **not** acknowledge the modeling tradeoff after the user asked for distinct concepts.
- **Turn 37**: Assistant records `Shipment --isAssociatedWithTransportProcessReachingDestinationNode--> TransportProcess` as a relationship. This bakes a **rule/precondition condition** (“reaching destination node”) into a relationship name, which is likely a modeling bug and later causes awkward navigation/rule handling.
- **Turn 57**: Tool reports `✓ Applied: 1 added, 1 updated` for `recordTrackingEvent`, but the assistant claims the action’s “effect and verification now reflect the event type, event time, and the tracked object” even though those exact effect/verification details were never elicited from the user. Overreach / invented action semantics.
- **Turn 58**: Same issue for `evaluateSupplyRelationship`: assistant says “effect and verification now reflect exactly that review” without eliciting explicit effect/verification language.
- **Turn 79**: Tool reports `✓ Applied: 1 added, 2 updated` immediately after only a relationship meaning was requested. Assistant then says it “recorded the rule and action update,” which was not announced beforehand. This looks like a hidden side effect / misapplied edit.
- **Turn 80–81**: Assistant adds `Shipment --hasShipmentPreparationProcess--> ShipmentPreparationProcess`, then discovers it duplicates `ShipmentPreparationProcess --preparesShipment--> Shipment`. This was self-inflicted: it asked for a direct bridge to satisfy tool navigation, creating a known inverse duplication in a system that “wants one directed relationship per real-world connection.”
- **Turn 81**: Assistant says it “can’t safely remove” the redundant inverse because the tool only adds/updates and cannot delete. If true, that’s a real product/tooling limitation surfaced by the interview flow.
- **Turn 85–86**: Similar pattern for `Shipment --hasReceivingProcess--> ReceivingProcess`: added primarily to satisfy tool navigation from action input, not because it had been independently grounded earlier. Less clearly a bug than the shipment-preparation duplicate, but it shows the ontology being shaped by tooling constraints rather than elicited semantics.

## Noteworthy observations
- **Turn 1**: Good opening move: starts with competency questions before classes.
- **Turn 2**: Efficient normalization of the user’s 8 questions into 13 atomic questions, but it may have over-split without first checking whether that granularity was desired.
- **Turn 3 onward**: Strong habit of recapping and keeping a narrow next question; very skimmable and disciplined.
- **Turn 5–6**: Good follow-up on role distinctions and operating context; surfaced carrier vs freight forwarder and shipper vs consignee early.
- **Turn 9–10**: Good responsiveness to user-preferred terminology (“process” over “activity,” “material trade item” over “material item”).
- **Turn 12–25**: Interview gets **overly conservative and slow** in the relationships phase. The agent repeatedly asks one tiny “confirm/not yet” question at a time, producing many turns with little new information.
- **Turn 18–23**: Good technique in offering structured alternatives (A/B/C/D) once ambiguity appeared around transport responsibility.
- **Turn 22–28**: The agent fixates on “every class needs at least one relationship before this phase is complete,” which drives inefficient questioning and seems more like a tooling/prompt artifact than domain-driven elicitation.
- **Turn 23–25**: The consignee thread is especially inefficient: multiple turns are spent preserving an intentionally unconnected class instead of just marking it as an open item sooner.
- **Turn 36**: Good recovery: the assistant stops the one-by-one probing and batches unresolved gaps into A–E. This is a much better elicitation pattern and should have happened earlier.
- **Turn 37 onward**: The agent gets stronger once it starts treating some items as explicit open issues instead of forcing closure immediately.
- **Turn 59–61**: Good discipline in refusing to formalize `receiveShipment` preconditions when the model lacked a link between ship-to location and destination node.
- **Turn 61–64**: Also good discipline in leaving `prepareShipment` and `receiveShipment` with open preconditions rather than inventing structure.
- **Turn 75–82**: However, once trying to close `prepareShipment`, the agent starts optimizing for **tool navigation paths from the action input** rather than ontology quality, leading to duplicate/inverse relationships and cleanup debt.
- **Turn 79–82**: The assistant explains tooling constraints clearly, which is useful for debugging the system prompt/product, but it reveals the elicitation is being distorted by implementation constraints.
- **Turn 87**: Final recap is clear and honest about incompleteness, including one substantive open item and one cleanup item. Good stopping behavior.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
