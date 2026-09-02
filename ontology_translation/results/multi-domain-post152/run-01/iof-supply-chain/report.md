# Ontology-recovery eval report

Generated: 2026-09-02T17:43:10.557Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.6%** | **85.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.4% / 100.0% / 75.3% | 92.9% / 81.3% / 86.7% | 32/53 full · 26/28 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 66.7% / 64.5% / 65.6% | 82.6% / 61.3% / 70.4% | 20/30 full · 19/23 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.9%** | **86.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.4% / 100.0% / 75.3% | 92.9% / 81.3% / 86.7% | 32/53 full · 26/28 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 76.7% / 74.2% / 75.4% | 87.0% / 64.5% / 74.1% | 23/30 full · 20/23 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 45.5% / 62.5% | 5/5 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 28.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 45.5% / 62.5% | 5/5 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 28.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 112 turns, 1748s wall-clock
- Real app-agent API calls: 216 (apply_ontology_yaml called 47× · get_graph_state called 53×)
- Tool outcomes seen in transcript: 47 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 20902988 total (20870117 prompt · 32871 completion) across 404 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 9 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**
  - The transcript duplicates the persona’s opening utterance as `app-user`, suggesting a simulation/wiring bug in speaker routing.
- **Turn 3**
  - Tool says `✓ Applied: 16 added, 0 updated` after the assistant claims it captured **16 confirmed competency questions with consolidations**. This is inconsistent with the user’s request to consolidate several items; it looks like raw additions rather than proper updates/merges.
- **Turn 5**
  - `app-system` reports **10 consistency problems unresolved**, but the assistant ignores this and proceeds as if Phase 1 is confirmed. Real validation signal is dropped.
- **Turn 8**
  - Tool reports `✓ Applied: 4 added, 0 updated` for the batch where the expert explicitly said to **replace** Movement/Transport with **TransportProcess** and ForwardingArrangement with **FreightForwardingService**. This suggests misapplied edits or failure to remove/rename superseded classes.
- **Turn 9**
  - Same pattern: expert asked to rename activity classes to **processes** and umbrella to **TraceableResourceUnit**; tool only says `11 added, 0 updated`, implying the old names may have remained rather than being updated.
- **Turn 16–18**
  - Assistant “corrected the preparation-side wording” by adding new relations (`hasCarrierAsAgent`, `occursAtFacility`) only after the expert objected, but earlier weaker relations were likely still present until turn 21. State was temporarily contradictory.
- **Turn 17**
  - Assistant introduces new classes `SupplyChainNode` and `TransportationService` even though it had just asked the persona to use “classes we now have”; this reveals it had been eliciting relationships against an incomplete class set.
- **Turn 21**
  - Tool says `✓ Removed: 2 element(s)` and **skipped an additional ontology edit because only one edit is applied per message**. Assistant acknowledges several relationships are only “ready to persist next,” meaning ontology state lags behind conversation and edits were partially lost.
- **Turn 24**
  - Tool applies **9 additions in one go**, including several previously deferred relationships. Given the one-edit-per-message limitation reported at turn 21, the tool behavior is inconsistent.
- **Turn 49**
  - Assistant says “That closes the last relationship-isolated class” after adding `Lot —isSubdividedIntoSublot→ Sublot`, but later Phase 9 adds new classes (`BillOfLading`, `Traceability`) that of course were not part of that claim. Not a hard contradiction, but the “complete” language is premature.
- **Turn 79**
  - Tool check occurs when confirming input classes for three actions, but no `Applied` line appears; assistant still treats them as confirmed. Potential silent failure / unpersisted action inputs.
- **Turn 85**
  - Assistant records `evaluateSupplyRelationship` with **preconditions/effect/verification** immediately after only asking for the input class. The persona never confirmed those specifics in that turn; assistant filled them in unilaterally.
- **Turn 98**
  - Tool removes the generic `confirmCurrentActivitySite`, but the three replacement actions are not yet added until turn 99. Temporary hole in action coverage caused by sequencing.
- **Turn 110**
  - Assistant claims validation finds `dispatchShipment` “still in the ontology as an action with no input class,” but earlier the action was intentionally left open and not clearly persisted. This may reflect stale placeholder state rather than grounded ontology content.
- **Turn 112**
  - Tool order flips (`Removed` before `Checked`) unlike earlier patterns; minor, but suggests inconsistent tool logging.
- **Overall**
  - Repeated mismatch between conversationally “captured/confirmed” content and what the tool actually persisted. The assistant often narrates future persistence or assumes success despite tool limits/errors.

## Noteworthy observations
- **Turn 1**
  - Strong opening: the interviewer starts with competency questions rather than classes, which is good ontology elicitation discipline.
- **Turn 2**
  - Efficient normalization of competency questions, but it over-splits some items prematurely; the expert has to push back and re-consolidate obvious groupings.
- **Turn 3–5**
  - Good follow-up on roles/context, but the interviewer asks a somewhat abstract meta-question (“closely related role… operating context”) before finishing requirements. Useful, but a bit diffuse.
- **Turn 6 onward**
  - The phased, batch-oriented style is efficient and easy to follow. Good prompting pattern for ontology work.
- **Turn 7–10**
  - Good behavior: the interviewer repeatedly lets the expert correct class names (“process” vs “activity,” “MaterialTradeItem,” “TraceableResourceUnit”) instead of defending its initial wording.
- **Turn 14–20**
  - Strong elicitation technique around paths: repeatedly asks “what connects to what” before asking for verb phrases. This avoids premature predicate invention.
- **Turn 15, 20, 25, 26, 31**
  - Good focused gap-closing. The interviewer notices when a competency question is not actually answerable with current paths and asks for the missing connector.
- **Turn 17–19**
  - Also a good example of restraint: once the expert declines to confirm `TransportProcess -> TransportationService`, the interviewer marks a real modeling gap instead of inventing it.
- **Turn 22–32**
  - The interviewer is appropriately disciplined about leaving classes relationship-open when the expert won’t ground them. Good anti-hallucination behavior.
- **Turn 33–37**
  - Nice recovery: rather than endlessly circling open items, the interviewer prioritizes the one with operational value (“carrier-for-movement”) and resolves it cleanly.
- **Turn 41–49**
  - Slight inefficiency: grounding `LogisticUnit`, `Load`, and `Sublot` one by one is thorough but somewhat plodding.
- **Turn 50–55**
  - Very good property discipline. The interviewer resists adding common-but-ungrounded status fields and accepts process links/action conditions instead.
- **Turn 56–66**
  - Language-layer pass is methodical but long. Good for completeness, though likely expensive in turns. Could be compressed further.
- **Turn 67–77**
  - Rules phase is well handled: the interviewer explicitly narrows rules to what the model can actually support, instead of encoding domain-intuitive but unmodeled conditions.
- **Turn 78–99**
  - Actions phase is strong overall. The assistant respects the one-input constraint and even refactors `confirmCurrentActivitySite` into three actions instead of forcing a bad abstraction.
- **Turn 82–83**
  - Good prompt optimization insight: explicitly allowing “leave as open” for an action avoids forcing fake state changes.
- **Turn 100–109**
  - Bounded expansion pass is useful and appropriately constrained. Good that new concepts introduced late (`BillOfLading`, `Traceability`) are routed back through class/relationship capture instead of being tacked on loosely.
- **Turn 110–112**
  - Validation pass is valuable and candid about remaining gaps. Good behavior to ask whether to remove or keep the unresolved action rather than silently fixing it.
- **Overall**
  - Best aspect: the interviewer is unusually good at recognizing unsupported inferences and asking for explicit grounding.
  - Main weakness: it too often speaks as if ontology state is settled when tool persistence is partial or inconsistent. Prompt should probably force the agent to distinguish **conversation-confirmed** vs **tool-persisted** state after every tool call.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
