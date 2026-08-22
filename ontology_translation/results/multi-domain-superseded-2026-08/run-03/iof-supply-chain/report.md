# Ontology-recovery eval report

Generated: 2026-08-21T14:45:41.461Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **79.2%** | **93.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 54.7% / 100.0% / 70.7% | 89.3% / 86.2% / 87.7% | 29/53 full · 25/28 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 76.7% / 100.0% / 86.8% | 91.3% / 91.3% / 91.3% | 23/30 full · 21/23 scoped ground-truth relationships matched; 23 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **79.2%** | **93.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 54.7% / 100.0% / 70.7% | 89.3% / 86.2% / 87.7% | 29/53 full · 25/28 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 76.7% / 100.0% / 86.8% | 91.3% / 91.3% / 91.3% | 23/30 full · 21/23 scoped ground-truth relationships matched; 23 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 20.0% / 100.0% / 33.3% | 1/5 ground-truth rules matched (core condition equivalence, not name alone); 1 recovered |
| Action identification recall / precision / F1 | 20.0% / 100.0% / 33.3% | 1/5 ground-truth actions matched by name/meaning; 1 recovered |
| Action input-class accuracy | 100.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 85.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 58.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 100.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 20.0% / 100.0% / 33.3% | 1/5 ground-truth rules matched (core condition equivalence, not name alone); 1 recovered |
| Action identification recall / precision / F1 | 20.0% / 100.0% / 33.3% | 1/5 ground-truth actions matched by name/meaning; 1 recovered |
| Action input-class accuracy | 100.0% | of 1 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 85.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 58.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 100.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 47 turns, 668s wall-clock
- Real app-agent API calls: 107 (apply_ontology_yaml called 29× · get_graph_state called 31×)
- Tool outcomes seen in transcript: 29 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4734610 total (4711648 prompt · 22962 completion) across 197 API calls

## LLM review of the conversation

## Errors
- **Turn 1 / transcript setup**
  - `app-user` repeats the persona’s opening statement verbatim instead of a distinct system/user move. Looks like transcript plumbing duplicated the seed utterance.
- **Turn 3**
  - Tool says `✓ Applied: 19 added, 0 updated` after the persona *revised* the CQ set, but the assistant then says “we now have 19 confirmed competency questions” without confirming whether prior 21 were replaced/updated. Suggests additive behavior where replacement was intended.
- **Turn 3**
  - Assistant claims “You kept freight forwarding service, not freight forwarding process” and “grouped traceable unit question instead of four separate ones,” but there is no evidence the previously proposed split questions/process variant were actually removed from the live ontology before moving on.
- **Turn 8**
  - Persona says `TransportMove` should be dropped/renamed to `TransportProcess`; tool reports `4 added, 0 updated`. If `TransportMove` had been added or proposed in-model, this likely failed to enact the rename/drop cleanly.
- **Turn 16**
  - After confirming `SupplyChainNode` plus 5 relationships, tool reports `6 added, 0 updated`. Plausible count, but it implies all were newly added only at that point; earlier transport relationships may have been left inconsistent until then.
- **Turn 18**
  - Tool reports `4 added, 0 updated` after adding `StorageFacility` plus 3 `occursAt` relationships. Fine numerically, but it likely left the earlier generic `StorageProcess -> Facility` understanding unresolved unless overwritten; assistant doesn’t verify replacement vs coexistence.
- **Turn 21**
  - Assistant says it “can’t safely remove classes with the available tool,” revealing a real tool limitation: no delete support. This leaves known-invalid state (`Sublot`) in the ontology.
- **Turn 27**
  - Tool reports `0 added, 1 updated` when persona confirmed **two** properties (`eventTime`, `eventType`) for `TrackingEvent`. At least one property update appears to have been lost or merged incorrectly.
- **Turn 40**
  - Tool reports `0 added, 4 updated` after the persona provided 3 relationship meanings plus aliases for 4 classes, of which only one alias was real. Update count doesn’t align with the content; possible partial persistence or opaque batching.
- **Turn 47**
  - Validation says “I replayed each persisted competency question,” but earlier open issues strongly suggest the persisted model may still contain stale CQs/classes/relationships due to additive-only edits. The validation may be reasoning from conversation state more than trustworthy persisted state.

## Noteworthy observations
- **Turn 2**
  - Good move: assistant atomized the initial 10 questions into testable CQs. However, it over-split without first checking whether the domain expert wanted grouped traceability handling.
- **Turn 3**
  - Persona gave a much cleaner CQ set plus a new CQ about service applicability; this was high-value elicitation content. Assistant adapted reasonably well.
- **Turn 3–5**
  - The “worker under the role” follow-up felt generic and weakly grounded in the domain. It produced some useful nearby roles, but wasn’t an obvious next-best question.
- **Turn 5 onward**
  - The batchwise keep/drop class elicitation was efficient and disciplined. Good prompt pattern for ontology construction.
- **Turn 7–9**
  - Nice catch on `transport move` vs `transport process`; assistant explicitly reconciled terminology instead of silently normalizing it.
- **Turn 10–12**
  - Assistant appropriately distinguished process context from service context after the persona emphasized it. Good interview hygiene.
- **Turn 12–19**
  - Relationship elicitation was generally strong, but the assistant repeatedly proposed slightly overcommitted verbs (`includes`, `hasResponsibleCarrier`, `hasLot`, `usesService`) that the persona had to reel back. Prompt could bias toward more neutral candidate wording.
- **Turn 14–18**
  - The persona repeatedly redirected the model toward `SupplyChainNode` vs `Facility`, and later `StorageFacility` vs `Facility`. Assistant handled corrections well, but these were predictable follow-ups that could have been anticipated earlier.
- **Turn 19–25**
  - Very good that the assistant noticed isolated classes and initiated a cleanup pass instead of pretending completeness.
- **Turn 20–25**
  - The service-class handling became somewhat circular/inefficient: multiple turns established that services stay in scope but their connecting relationships are intentionally unconfirmed. The assistant kept pushing for closure after the persona had already signaled “open item.”
- **Turn 25–28**
  - Good recovery: when identifiers were rejected, the assistant switched to decision-relevant properties instead of forcing a schema convention.
- **Turn 41–46**
  - Strong sequence around `TrackingEvent`: values, constraints, rule, and action were elicited cleanly and tied back to operational consequences.
- **Turn 45**
  - Good internal consistency check: assistant noticed the action effect didn’t fully match verification and asked for a precise correction.
- **Turn 47**
  - Final validation was useful and candid about gaps. Especially good that it identified partial coverage for several CQs instead of overclaiming completeness.
- **Overall**
  - Main optimization opportunity: the agent should better track “accepted vs proposed vs rejected vs cleanup-needed” in a stateful way and avoid acting as though additive tool writes equal a clean minimum model.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
