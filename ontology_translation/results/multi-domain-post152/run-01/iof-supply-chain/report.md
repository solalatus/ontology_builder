# Ontology-recovery eval report

Generated: 2026-09-03T06:58:08.522Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **52.0%** | **58.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.6% / 100.0% / 72.3% | 92.9% / 86.7% / 89.7% | 30/53 full · 26/28 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 73.3% / 66.7% / 69.8% | 87.0% / 60.6% / 71.4% | 22/30 full · 20/23 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 7.7% / 13.8% | 100.0% / 7.7% / 14.3% | 2/3 full · 2/2 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **55.1%** | **58.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.6% / 100.0% / 72.3% | 92.9% / 86.7% / 89.7% | 30/53 full · 26/28 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 83.3% / 75.8% / 79.4% | 87.0% / 60.6% / 71.4% | 25/30 full · 20/23 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 7.7% / 13.8% | 100.0% / 7.7% / 14.3% | 2/3 full · 2/2 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 62.5% / 76.9% | 5/5 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 75.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 36.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 42.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 62.5% / 76.9% | 5/5 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 75.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 36.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 42.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 81 turns, 1447s wall-clock
- Real app-agent API calls: 169 (apply_ontology_yaml called 39× · get_graph_state called 39×)
- Tool outcomes seen in transcript: 39 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 11083733 total (11051713 prompt · 32020 completion) across 255 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3** — Tool reports `✓ Applied: 23 added, 0 updated` after the persona only refined/merged the CQ set. This looks like an over-add/misapplied edit, and the assistant’s “recorded 23 competency questions” is hard to reconcile with the merge/drop guidance.
- **Turn 13** — Tool reports `✓ Applied: 3 added, 0 updated` when the assistant says it recorded **one new class** plus **two direct relationships**. Count mismatch.
- **Turn 16** — Tool reports `✓ Applied: 10 added, 0 updated`, but the assistant lists 3 new classes + 7 relationships = 10 while one of those relationships (`TransportationService → Carrier`) had effectively already been established in dialogue earlier; likely duplicate/re-add behavior or at least confusing state handling.
- **Turns 25–33** — The interviewer/tool enters a brittle loop where classes are added because CQs require them, then removed because they lack confirmed relationships. This is a methodology/state bug more than domain elicitation: the system loses coherence between “in-scope concept” and “currently relationship-closed class.”
- **Turn 34** — Assistant says Supplier/Customer/ShipFromLocation/ShipToLocation have “zero relationships recorded,” even though they are already targets of recorded relationships. This suggests the validator only counts outgoing edges and the interviewer treats that as ontology incompleteness, which is a tool/method bug.
- **Turn 59** — Tool shows `✓ Applied: 9 added` and then `✓ Applied: 0 added, 9 updated` for the action step, suggesting duplicate or two-phase application without clear explanation.
- **Turn 59** — Assistant claims “Shipment → TrackingEvent is missing as a direct reachable path for the dispatch/receive action wording” even though the persona had repeatedly rejected adding reverse facts and said the existing event→shipment fact should suffice. The assistant/tool keeps treating directional navigation limitations as ontology defects.
- **Turns 64–70** — Same directional-path bug recurs for actions (`Shipment` to `ShipmentPreparationProcess`, `ReceivingProcess`, `Facility`), repeatedly pushing for reverse links the persona explicitly does not want.
- **Turn 77** — Validation says “common aliases captured where actually confirmed (`item`, `order`)” but only `order` was explicitly added as an alias via tool; `item` had been discussed earlier, but no visible later confirmation that it remains captured correctly after all edits.
- **Turn 77** — Validation says “class meanings are present for almost all of the established core,” but by then some late-added classes lacked meanings; the assistant notices this only afterward. Premature positive validation summary.
- **Turn 81** — Session ends despite the assistant previously saying Phase 10 validation should be run/formalized after open items; there’s no clear final validation tool run after the last fixes.

## Noteworthy observations
- **Turn 1** — Strong opening technique: asks for real business questions first rather than jumping straight to classes/fields.
- **Turn 2** — Over-atomization: the interviewer splits natural business questions too aggressively, creating many artificial CQs the persona has to merge back. This costs turns and cognitive load.
- **Turns 3–5** — Good follow-up on roles (`supplier`, `carrier`, `freight forwarder`, `shipper`) and operational context; this usefully surfaces role-vs-entity distinctions.
- **Turns 5–11** — Efficient, disciplined class confirmation in batches tied to accepted questions. This part is methodical and productive.
- **Turn 12** — Nice move noticing that `SupplyRelationship` is needed as its own class rather than flattening to item→supplier.
- **Turns 14–18** — Good elicitation of direct-vs-indirect relationships, but the interviewer repeatedly frames questions around “direct facts on their own,” which biases toward graph-shape concerns over domain usefulness.
- **Turns 19–33** — Large amount of inefficiency from the “every confirmed class must have confirmed relationships now” rule. It causes churn, removals, and reintroductions rather than letting partially specified but clearly relevant concepts remain parked in-scope.
- **Turn 22** — Good catch that service applicability questions are under-modeled, but the interviewer misses an obvious meta-step: explicitly asking whether those CQs should be deferred along with the ungrounded service classes, instead of trying to force relationships.
- **Turns 23–33** — The interviewer is transparent about incompleteness and does not fabricate facts; this is good. But it also gets stuck in a validator-driven cleanup loop that dominates the conversation.
- **Turns 34–37** — The assistant handles the persona’s refusal to add reverse facts appropriately in language, but the underlying method continues to penalize asymmetric modeling; useful signal for prompt/tool redesign.
- **Turns 38–42** — Property elicitation is efficient and well-scoped; asking only for decision-bearing properties works well.
- **Turns 43–50** — Meaning/definition pass is clean and compact. Good discipline in getting one-sentence business definitions.
- **Turns 52–57** — Good transition from constraints to rules; the traceability rule and “can record tracking event” rule are elicited clearly.
- **Turn 54** — The need to reintroduce `TraceableResourceUnit` shows the earlier removals were premature; a more tolerant “candidate/incomplete” state would avoid this churn.
- **Turns 57–63** — Action elicitation is good, but again the interviewer over-focuses on graph navigability from a chosen input class rather than on action semantics.
- **Turns 63–71** — Strong domain elicitation: preconditions for `prepare shipment` and `receive shipment` become much more realistic. However, the interviewer misses a cleaner modeling question about whether actions can reference conditions via derived/inferred paths instead of only direct forward links.
- **Turns 71–76** — Bounded expansion around `Shipment` is well handled; the persona gives sensible neighboring concepts. Good restraint in parking `Consignee` and `BillOfLading` when unconnected.
- **Overall** — The interviewer is careful, transparent, and generally good at not inventing domain facts. The biggest optimization target is the method/tool constraint that treats asymmetric or not-yet-connected concepts as errors, leading to repeated add/remove churn and many turns spent on validator appeasement instead of ontology substance.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
