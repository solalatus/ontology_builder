# Ontology-recovery eval report

Generated: 2026-08-22T16:58:33.858Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.2%** | **77.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 82.1% / 92.0% / 86.8% | 25/53 full · 23/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 53.3% / 72.7% / 61.5% | 65.2% / 68.2% / 66.7% | 16/30 full · 15/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 66.7% / 80.0% | 3/3 full · 2/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **79.1%** | **80.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 82.1% / 92.0% / 86.8% | 25/53 full · 23/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 63.3% / 86.4% / 73.1% | 73.9% / 77.3% / 75.6% | 19/30 full · 17/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 66.7% / 80.0% | 3/3 full · 2/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 50.0% / 66.7% | 5/5 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 35.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 23.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 50.0% / 66.7% | 5/5 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 35.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 23.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 48 turns, 1177s wall-clock
- Real app-agent API calls: 94 (apply_ontology_yaml called 25× · get_graph_state called 21×)
- Tool outcomes seen in transcript: 25 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3914556 total (3892745 prompt · 21811 completion) across 188 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: The transcript includes an odd duplicated persona message as `app-user` before the assistant starts. Looks like a simulation/logging artifact rather than intentional dialogue.
- **Turn 3**: Tool reports `20 added` after the CQ grouping split, but the persona listed 11 tracking + 9 execution questions. Count is numerically right, but there’s no indication whether the original 8 were superseded or duplicated; state handling is ambiguous.
- **Turn 8**: Tool says `10 added` after confirming 5 classes (`PurchaseOrder`, `Supplier`, `Customer`, `FreightForwarder`, `FreightForwardingService`) plus umbrella `TraceableResourceUnit` and 4 concrete traceable classes = 10, but this implicitly treats the earlier proposed generic `TraceableUnit` as not added/replaced without any explicit update/removal. Potential hidden state inconsistency.
- **Turn 13**: Tool says `10 added` after adding `StorageFacility` plus a batch of relationships. The count seems high for what was explicitly confirmed; suggests the tool may be adding extra inferred objects/edges without surfacing them.
- **Turn 15**: Tool says `2 updated` when the persona said “Receiving activity” and “Shipment preparation activity” are just plain-language alternatives, but the assistant later summarizes them as aliases. That’s plausible, but the tool action is opaque and could have created alias/state changes not clearly reviewed.
- **Turn 32**: Tool reports `7 updated` after defining meanings for only 5 relationships. Likely updated extra relationships not shown, which is suspicious and hard to audit.
- **Turn 33**: Tool reports `6 updated` after 5 relationship meanings; again suggests hidden edits or count mismatch.
- **Turn 41–43**: The assistant identifies an obsolete combined action, splits it into two, but cannot actually remove the old one because the tool lacks deletion. This leaves the live ontology knowingly inconsistent.
- **Turn 43**: Assistant asks whether to “replace” or “retire” the old combined action, even though it already knows the tool cannot delete. This follow-up doesn’t actually resolve the state bug.
- **Turn 44–45**: The assistant binds `prepareShipment` to a precondition that the live model/tool cannot navigate from the action input (`Shipment`) because the relation exists only in reverse. It correctly identifies this as a tool limitation, but still leaves a broken validation path in place.
- **Turn 45**: Assistant claims “I’ve now done the required check against the live state” and gives a validation-style summary despite explicitly acknowledging unresolved tool/state issues and an obsolete action still lingering. Slight overclaim.
- **Turn 47**: Assistant says the session produced “20 competency questions,” but after splitting/rewriting some originals, it is unclear whether the final ontology contains exactly those 20 and not duplicates/obsolete variants. State accounting remains fuzzy.

## Noteworthy observations
- **Turn 1**: Strong opening move: asks for real business questions first and avoids premature class modeling.
- **Turn 2**: Good follow-up to split visibility vs. execution questions; helped surface decision-oriented requirements rather than just lookup facts.
- **Turn 3**: Nice targeted prompt about roles and operating context; elicited useful process preconditions without overfocusing on org chart detail.
- **Turn 4**: Good clarification on “warehouse floor” vs. “warehouse staff”; efficient synonym disambiguation.
- **Turn 5–8**: Generally solid incremental class elicitation. The interviewer adapted well when the persona wanted `TransportProcess` instead of vague `Transport`.
- **Turn 8**: Particularly good that the assistant noticed the tool can’t model subclassing and explicitly tested whether separate classes were operationally justified.
- **Turn 9–12**: Good recovery when initial relationship proposals over-compressed shipment/process/location distinctions. The interviewer let the expert reshape the model instead of defending its first draft.
- **Turn 10**: Efficiently converted rejected relationships into missing class prompts (`SupplyChainNode`, process classes, `TransportationService`).
- **Turn 13–16**: Strong technique in surfacing n-ary dependency via `SupplyRelationship` instead of forcing lossy binary relations.
- **Turn 14**: Good catch that “activity” vs. “process” might create duplicates; nice cleanup question.
- **Turn 16–17**: The interviewer proposed several speculative relationships (ReceivingProcess→Shipment, StorageProcess→Shipment, prep process→from/to node) that the persona rejected. Not terrible, but somewhat inefficient and shows a tendency to over-connect the graph.
- **Turn 18–19**: The assistant again handled tool limitations thoughtfully by asking whether ship-from and ship-to needed separate classes because role distinction couldn’t be expressed otherwise.
- **Turn 20–24**: The interviewer became overly constrained by an internal rule that “every confirmed class needs at least one recorded relationship,” pushing repeatedly on under-connected classes (`FreightForwardingService`, `TraceableResourceUnit`, `Sublot`) even after the expert explicitly preferred leaving them under-connected. This seems like prompt/tool pressure leaking into the interview.
- **Turn 21–24**: Repeated attempts to force a forwarding-context structure (`ShipmentPreparationProcess→FreightForwardingService`, `ForwardingArrangement`) despite consistent caution from the expert. Useful once, but it became somewhat pushy.
- **Turn 24–26**: Good discipline in property elicitation: the assistant accepted “very few properties” and did not insist on identifiers/statuses everywhere.
- **Turn 25**: Good focused question on whether statuses were genuinely needed; avoided ontology bloat.
- **Turn 26–35**: Language-layer elicitation was methodical but long and somewhat mechanical. Efficient for completeness, but likely not the highest-value use of interview time compared with unresolved decision logic.
- **Turn 35–40**: Constraint/rule elicitation was strong. The assistant resisted inventing controlled vocabularies and corrected itself when the persona provided a broader traceability rule not yet supported by the model.
- **Turn 39–40**: Very good move to check whether a proposed rule was actually supported by captured structure before recording it.
- **Turn 40–44**: Action elicitation was productive, and the assistant did well noticing action/input mismatches and over-broad action scope.
- **Turn 41–45**: Good honesty about tool limitations and validation gaps; the assistant did not paper over them.
- **Turn 45–47**: Strong ending behavior: identified unresolved competency-question coverage gaps and explicitly stopped when the expert said the missing traceable-unit logic was not grounded.
- **Overall**: Best aspects were incremental confirmation, willingness to revise, and refusal to invent missing business logic. Main weakness was occasional prompt-driven insistence on fully connecting every class/action even when the domain expert preferred a looser, partially specified model.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
