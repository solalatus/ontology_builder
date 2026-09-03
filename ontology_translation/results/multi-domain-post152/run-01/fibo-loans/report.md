# Ontology-recovery eval report

Generated: 2026-09-03T06:54:00.188Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **71.2%** | **61.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.9% / 100.0% / 67.4% | 75.0% / 62.1% / 67.9% | 29/57 full · 18/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 77.4% / 85.7% / 81.4% | 82.4% / 50.0% / 62.2% | 24/31 full · 14/17 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 49.0% / 96.0% / 64.9% | 90.9% / 40.0% / 55.6% | 24/49 full · 10/11 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **71.2%** | **63.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.9% / 100.0% / 67.4% | 79.2% / 65.5% / 71.7% | 29/57 full · 19/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 77.4% / 85.7% / 81.4% | 82.4% / 50.0% / 62.2% | 24/31 full · 14/17 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 49.0% / 96.0% / 64.9% | 90.9% / 40.0% / 55.6% | 24/49 full · 10/11 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 100.0% / 60.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 38.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 35.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 42.6% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 100.0% / 60.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 38.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 35.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 42.6% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 77 turns, 1203s wall-clock
- Real app-agent API calls: 152 (apply_ontology_yaml called 55× · get_graph_state called 18×)
- Tool outcomes seen in transcript: 55 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 7331582 total (7304365 prompt · 27217 completion) across 232 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: Interviewer says “we’re starting from an empty model” even though the transcript already contains persona context at turn 0; may be benign, but suggests confusion between conversation state and ontology state.
- **Turn 5**: Assistant claims “the tool is correctly warning that their input class is not yet defined,” but the visible tool output only shows generic checks/applies, not that warning. Looks like fabricated tool interpretation.
- **Turn 5**: System says “The agent left 5 consistency problem(s) unresolved,” but the assistant does not inspect or resolve them before continuing.
- **Turn 11–13**: Assistant introduces `PrincipalObligation` / `InterestObligation` as new classes instead of first checking whether existing `Principal` / `Interest` concepts suffice; recovered later, but this was a prompt-induced detour.
- **Turn 21**: Tool says only one edit was applied and an additional ontology edit was skipped. Assistant acknowledges incomplete state, but this is a real tool/workflow failure that required recovery.
- **Turn 27**: After tool output `🔍 Checked the current ontology state.`, assistant proceeds as if no apply happened and asks for confirmation; this is fine, but indicates the assistant/tool exchange was not tightly synchronized.
- **Turn 33**: Persona confirms four properties, but tool reports only “0 added, 2 updated.” Assistant says “Recorded” without noticing the mismatch or checking which two actually persisted.
- **Turn 47**: Persona gives per-property consequences for three booleans, but tool reports only “0 added, 1 updated.” Assistant summarizes as if all three constraints were fully captured.
- **Turn 56**: Assistant maps named rules as “preconditions” for actions even though the persona described them as both preconditions and check basis; this risks a semantic mismatch between trigger conditions and validation logic.
- **Turn 76**: Assistant says “all 12 persisted competency questions and all 5 actions” are covered, then a system warning flags a mismatch in what was actually added/updated this turn. Even if the coverage claim may be true overall, the assistant mixed validation summary with incorrect persistence wording.
- **Throughout**: Repeated discrepancy risk between what the persona confirmed and what the tool actually persisted; the assistant often says “recorded” after partial updates without reconciling counts.

## Noteworthy observations
- **Turn 2**: Good move splitting compound competency questions, but the interviewer over-atomized too aggressively and had to be corrected by the persona.
- **Turn 3**: Efficient recovery after correction; accepted the domain expert’s grouped framing instead of arguing for maximal normalization.
- **Turn 4**: The “required narrow follow-up” about day-to-day roles/operating context felt template-driven and low-value for the stated modeling goal.
- **Turn 5 onward**: Strong discipline in asking keep/drop and whether something must be a separate class vs property; good ontology elicitation hygiene.
- **Turn 6–9**: Good sensitivity to operational distinctions (`Loan` vs `CreditAgreement`, `Collateral` vs `SecurityAgreement`, separate schedule classes).
- **Turn 11–15**: Interviewer repeatedly proposed links the persona had not justified yet (`Loan→CreditAgreement`, `Loan→SecurityAgreement`), then had to back off. Useful cautionary note: prompt may be too eager to complete graph structure.
- **Turn 17–21**: Nice recovery pattern when `PaymentHistory` and then the `PrepaymentTerm` reversal surfaced; interviewer adapted instead of forcing earlier assumptions.
- **Turn 18–19**: Good catch that the expert wanted one generic `hasSchedule` relationship while still preserving distinct schedule classes. That’s a solid modeling compromise.
- **Turn 20–21**: Excellent handling of a class/property reversal. The interviewer explicitly paused to confirm whether `PrepaymentTerm` should remain a class rather than silently mutating the model.
- **Turn 25–29**: The interviewer correctly detected that dropping `interestRate` and `interestRateType` implied missing structure, then elicited `FixedInterestRate` / `VariableInterestRate`. Good follow-through.
- **Turn 31–33**: Good restraint on `PaymentTransaction` fields; the persona pushed back, and the interviewer did not over-model without evidence.
- **Turn 49–57**: Rule elicitation was generally careful, especially distinguishing externally scoped action selection from in-model trigger rules.
- **Turn 50**: Strong moment: interviewer explicitly says it cannot “honestly record a checkable named rule yet without inventing that trigger.” Good epistemic discipline.
- **Turn 57–70**: Bounded expansion pass was useful and well controlled. Interviewer did not dump everything in at once; it routed each candidate through class/relationship/property checks.
- **Turn 71–76**: Validation pass was valuable and surfaced an actual remaining gap (LTV/CLTV), then cleanly closed it.
- **Overall**: Interview technique was methodical and mostly high quality, but somewhat inefficient due to rigid phase structure, occasional over-eagerness to add links/classes, and frequent “confirm exact batch” turns that could likely be compressed.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
