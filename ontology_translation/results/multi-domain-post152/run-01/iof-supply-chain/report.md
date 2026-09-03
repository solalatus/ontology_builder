# Ontology-recovery eval report

Generated: 2026-09-03T10:10:30.166Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **68.8%** | **74.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 66.0% / 94.6% / 77.8% | 92.9% / 70.3% / 80.0% | 35/53 full · 26/28 scoped ground-truth classes matched; 37 recovered |
| Relationship recall / precision / F1 | 56.7% / 42.5% / 48.6% | 60.9% / 35.0% / 44.4% | 17/30 full · 14/23 scoped ground-truth relationships matched; 40 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.0%** | **80.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 69.8% / 100.0% / 82.2% | 96.4% / 73.0% / 83.1% | 37/53 full · 27/28 scoped ground-truth classes matched; 37 recovered |
| Relationship recall / precision / F1 | 76.7% / 57.5% / 65.7% | 78.3% / 45.0% / 57.1% | 23/30 full · 18/23 scoped ground-truth relationships matched; 40 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 65.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 48.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 66.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 65.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 48.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 66.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 92 turns, 1311s wall-clock
- Real app-agent API calls: 210 (apply_ontology_yaml called 56× · get_graph_state called 61×)
- Tool outcomes seen in transcript: 56 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 17475256 total (17444356 prompt · 30900 completion) across 306 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**: The assistant says “the tool correctly flags that [action] input classes are not defined yet,” but no such tool output is shown there; instead a system note says there are **5 consistency problems unresolved**. The assistant appears to paraphrase/guess tool state rather than accurately report it.
- **Turn 3**: The assistant proceeds despite the system warning about unresolved consistency problems, rather than explicitly reconciling or surfacing them.
- **Turn 23–24**: The assistant claims “you also want a separate freight forwarding process concept” before the class had been confirmed, then has to backtrack and explicitly ask whether to add `FreightForwardingProcess`.
- **Turn 34–36**: Similar pattern with `ConsigningProcess`: the assistant introduces and leans on a new class during relationship elicitation, then has to stop and confirm it afterward.
- **Turn 45**: The assistant asserts “Phase 3 is still not fully closed yet, because some confirmed classes still have no relationships at all,” then lists open classes; later it treats these intentionally-unconnected classes as acceptable. This is a prompt/process contradiction about whether every confirmed class must be connected immediately.
- **Turn 48**: The assistant says “The next required gap to close is the action-input problem,” jumping back from Phase 3 to unresolved Phase 1/8 issues. Not necessarily wrong, but indicates phase management drift.
- **Turn 49–50**: To support `receiveShipment`, the assistant adds `Shipment --hasReceivingActivity--> ReceivingActivity`, but later the user explicitly says that link should not be the *core gating condition*. The assistant keeps the structural link anyway; not a direct contradiction, but it shows model edits were used to satisfy tooling rather than clearly separated from domain-true requirements.
- **Turn 66–69**: The receive rule initially depends on a transport process “reaching the destination node,” but there is no structural way to align `ShipToLocation` with `SupplyChainNode`. This gap is only discovered in final validation, despite the assistant having built the rule earlier.
- **Turn 88**: The assistant declares “all 12 persisted competency questions now have enough modeled orientation to be addressed,” but in the same validation notes says CQ4 is only partly covered. It later softens this as a caveat, but the “all 12” claim overstates completeness.
- **Turn 92**: The system flags a factual bug: the assistant says “all 12 were recorded” even though the tool on that turn “added 0 and updated 1.” This is a concrete count/reporting error.

## Noteworthy observations
- **Turns 1–2**: Good opening structure: the assistant clearly frames phases and asks for natural-language competency questions before schema details.
- **Turns 2–18**: Efficient use of narrow, binary “separate class or not?” questions keeps momentum high and reduces ambiguity.
- **Turns 3–18**: However, the interview becomes very mechanistic/class-by-class. It is efficient for ontology construction but somewhat brittle and exhausting; several later gaps stem from premature commitment to classes before relationship patterns were stabilized.
- **Turn 3 onward**: The repeated “recap + next focused question” pattern is strong for maintaining context and making the transcript skimmable.
- **Turns 19–34**: Good technique in moving from competency questions to concrete relationship paths instead of abstract ontology talk.
- **Turns 22–34**: The assistant does a nice job not overcommitting when the persona pushes back on speculative process-to-service links.
- **Turns 23, 25, 27, 35**: Repeated emergence of new classes during relationship capture (`FreightForwardingProcess`, `SupplyChainNode`, `StorageFacility`, `ConsigningProcess`) suggests the earlier class elicitation phase was too narrow; an explicit “what other process/location/document concepts are implied by your questions?” checkpoint would likely reduce churn.
- **Turns 34–48**: The assistant is commendably cautious about not inventing direct links for Shipper/Consignee/Supplier/Carrier without confirmation.
- **Turns 45–48**: The insistence that unconnected classes must be resolved creates unnecessary friction, especially when the persona explicitly wants some concepts left open. A better prompt might allow “intentionally unconnected for now” without treating it as a failure state.
- **Turns 50–54**: Good restraint on properties; the assistant successfully avoids over-modeling fields and keeps focus on decision-bearing data.
- **Turns 64–79**: Strong handling of rules/actions: the assistant notices when preconditions/effects/verifications don’t line up and asks to tighten them.
- **Turns 66–92**: Final validation is useful and catches real structural issues. This was one of the strongest parts of the interview.
- **Turn 79 onward**: Nice bounded expansion move around `Shipment`; adding `BillOfLading` was a productive domain-expansion example.
- **Overall**: The biggest prompt-optimization lesson is to reduce late-stage churn by introducing an earlier “implied neighboring concepts” sweep and by distinguishing clearly between:
  - domain-truth links,
  - navigation/convenience links added for actions,
  - and intentionally open items left unresolved for this session.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
