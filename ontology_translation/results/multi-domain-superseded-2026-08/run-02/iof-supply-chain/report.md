# Ontology-recovery eval report

Generated: 2026-08-21T14:28:00.530Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.5%** | **85.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 58.5% / 100.0% / 73.8% | 89.3% / 80.6% / 84.7% | 31/53 full · 25/28 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 60.0% / 75.0% / 66.7% | 73.9% / 70.8% / 72.3% | 18/30 full · 17/23 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **77.2%** | **88.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 58.5% / 100.0% / 73.8% | 89.3% / 80.6% / 84.7% | 31/53 full · 25/28 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 70.0% / 87.5% / 77.8% | 82.6% / 79.2% / 80.9% | 21/30 full · 19/23 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 20.0% / 50.0% / 28.6% | 1/5 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 50.0% / 66.7% | 5/5 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 46.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 40.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 20.0% / 50.0% / 28.6% | 1/5 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 50.0% / 66.7% | 5/5 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 46.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 40.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 75 turns, 1015s wall-clock
- Real app-agent API calls: 155 (apply_ontology_yaml called 40× · get_graph_state called 40×)
- Tool outcomes seen in transcript: 40 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 11150604 total (11120774 prompt · 29830 completion) across 298 API calls

## LLM review of the conversation

## Errors
- **Turn 3**: Tool reports “✓ Applied: 21 added” after the user only supplied 9 actions; assistant says it captured “12 competency questions and 9 actions,” so the edit count likely folded in prior unpersisted items without clear accounting.
- **Turn 3**: System warns “9 consistency problem(s) unresolved,” but the interviewer does not inspect or address them before proceeding.
- **Turn 11**: Assistant says it recorded 6 additions including `ShipFromLocation`, `ShipToLocation`, and relationships, but never explicitly records or justifies any relationship between those locations and existing place concepts; this later contributes to repeated state/coverage confusion.
- **Turn 15**: Assistant infers “Sublot should be removed from the current class set” from the persona saying “keep Sublot out for now,” which is reasonable, but it then immediately generalizes the same issue to other classes without first checking whether they are already connected by accepted CQs.
- **Turns 27–32**: Major state-management problem around removals. The persona says to remove several classes; the assistant says it “won’t treat those as settled until they’re actually edited,” then later says cleanup is “recorded,” then later discovers they were still present. Repeated false confidence about deletions.
- **Turn 29**: Tool says “0 added, 7 updated” after revising CQ11 and supposedly removing 6 classes. The assistant interprets this as successful cleanup even though later checks show the removals did not happen.
- **Turns 31–32**: Assistant introduces a workaround for missing subclassing by asking for an “operational connector” between `StorageFacility` and `Facility`; this is acceptable, but after persona chooses removal of `StorageFacility`, the assistant again reports success before later finding the class still present.
- **Turn 38**: Tool says “1 added, 1 updated” when replacing `confirmReceiptAtCorrectDestination` with `confirmReceiptAtReceivingFacility`; later the old action is still present, showing the replacement/removal did not actually occur.
- **Turns 52–59**: Repeated cleanup attempts via null/merge-style edits fail, but the assistant keeps alternating between “done” and “not actually removed.” This is the clearest real bug: the tool/edit strategy cannot delete reliably, and the interviewer keeps acting as if it can.
- **Turn 61**: Relationship meaning for `involvesCarrier` is applied to both `TransportationService -> Carrier` and `ShipmentPreparationProcess -> Carrier` under one label, which may be acceptable, but it blurs distinct relationship usages under one shared semantics without checking whether the tool distinguishes edge-specific descriptions.
- **Turn 75**: Validation is said to use the “persisted live state,” but the analysis mixes the intended model and the dirty live graph. This is honest by the end, but earlier validations/recaps had already treated intended removals as if persisted.

## Noteworthy observations
- **Turn 1**: Strong opening technique: starts with competency questions and actions before classes/properties.
- **Turns 4–14**: Good discipline in small, justified class/relationship batches; the interviewer repeatedly asks for keep/drop and wording corrections instead of overcommitting.
- **Turns 9–14**: The persona repeatedly resists direct links; the interviewer generally handles this well by backing off and asking narrower follow-ups rather than arguing.
- **Turns 16–21**: Efficient recovery when service applicability proves under-modeled; introduces process/activity as a missing abstraction rather than forcing bad direct links.
- **Turns 18–30**: Some inefficiency from repeatedly adding classes that were justified only by language/CQs, then later removing them under a stricter “must have a confirmed connection now” standard. The prompt seems to oscillate between “accept if in competency questions” and “accept only if already connected.”
- **Turns 27–30**: The interviewer does a good job explicitly surfacing isolated classes and tightening scope, but could have done this much earlier to avoid churn.
- **Turns 33–43**: Strong action/model alignment work. Re-anchoring `receiveShipment` and `confirmReceipt...` on `ReceivingProcess` is a good example of fixing ontology/action mismatch instead of adding weak direct links.
- **Turns 44–47**: Good restraint on properties. The interviewer correctly challenges whether actions really require status fields instead of assuming them.
- **Turns 48–64**: Language-layer elicitation is systematic and efficient. Good move to stop soliciting aliases after two “none” batches.
- **Turns 56–60**: Good honesty once the deletion bug is undeniable. The interviewer explicitly distinguishes the accepted intended model from the dirty live canvas instead of continuing to paper over it.
- **Turn 67–69**: Nice handling of rule modeling: catches that the persona’s broader shipment-readiness rule is not fully supported and preserves it as an open modeling gap rather than silently narrowing it.
- **Turn 75**: Final validation is useful and skimmable, especially the separation between partial CQ coverage and live-canvas leftovers.
- **Overall**: Biggest prompt-optimization takeaway is tool-awareness: the agent needs a stronger protocol for verifying destructive edits before recapping them as completed. It should not say “removed” unless a subsequent state check confirms removal.
- **Overall**: Another prompt issue is criterion drift. The interviewer alternates between “keep because it appears in accepted business questions” and “remove unless it has a confirmed relationship now.” That inconsistency caused churn on service/process classes.


## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
