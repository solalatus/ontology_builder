# Ontology-recovery eval report

Generated: 2026-08-21T14:24:44.382Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **69.5%** | **74.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.9% | 87.5% / 75.0% / 80.8% | 28/57 full · 21/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 83.9% / 96.3% / 89.7% | 100.0% / 63.0% / 77.3% | 26/31 full · 17/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 36.7% / 94.7% / 52.9% | 90.9% / 52.6% / 66.7% | 18/49 full · 10/11 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **69.5%** | **74.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.9% | 87.5% / 75.0% / 80.8% | 28/57 full · 21/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 83.9% / 96.3% / 89.7% | 100.0% / 63.0% / 77.3% | 26/31 full · 17/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 36.7% / 94.7% / 52.9% | 90.9% / 52.6% / 66.7% | 18/49 full · 10/11 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 100.0% / 60.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 66.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 56.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 100.0% / 60.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 66.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 56.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 62 turns, 815s wall-clock
- Real app-agent API calls: 116 (apply_ontology_yaml called 28× · get_graph_state called 26×)
- Tool outcomes seen in transcript: 28 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 6146376 total (6118980 prompt · 27396 completion) across 232 API calls

## LLM review of the conversation

## Errors
- **Turn 21**
  - The assistant admits **PrepaymentTerms** was removed from scope but could not actually delete it: “tool can add or update entries, but it does not give me a safe delete mechanism.” This is a real tooling limitation leaving the persisted ontology inconsistent with agreed scope.
- **Turn 25–26**
  - The interviewer introduced a major modeling dependency late: the user had already asked CQs about interest rate, but only at turn 25 did the assistant realize removing `Loan.interestRate` would break coverage unless rate-record classes were added. This indicates delayed state/integrity checking.
- **Turn 27–28**
  - The assistant asked “Should I update competency question 5… Yes/no,” but the proposed wording in the prompt and the persona’s “No… So yes to the substance” response were effectively the same. The exchange shows a confusing yes/no framing bug rather than a substantive clarification.
- **Turn 36**
  - Tool output says `✓ Applied: 0 added, 14 updated` after only 6 relationship meanings were supplied. That looks like a suspicious over-application or count bug.
- **Turn 44**
  - Tool output says `✓ Applied: 0 added, 1 updated` after constraints were provided for **three** boolean properties. Likely partial persistence or incorrect update count.
- **Turn 45–46**
  - The assistant says constraints were “Recorded in working notes” rather than persisted, unlike prior steps. This suggests inconsistency in whether information was actually written to the ontology/tool state.
- **Turn 53**
  - The assistant explicitly says it did **not** add the precondition “loan record exists” because actions only reference named rules. This creates a mismatch between elicited action structure and what the tool can represent, with the final action only partially matching the expert’s specification.
- **Turn 55–56**
  - The assistant uses `variableRateSetupComplete` as an **action precondition** for “reviewVariableRateLoanSetup.” Semantically, that makes the review action only executable once completeness is already true; more natural would be to have the action determine whether the rule holds. This looks like a modeling misapplication.
- **Turn 60**
  - Similar issue for `prepaymentPenaltyTimingRecorded`: the review action uses the condition being reviewed as a precondition, so the action can only run if the thing it checks is already true.
- **Turn 62**
  - Final validation claims some CQs are “covered” or “mostly covered” despite known structural disconnects (e.g. secured-loan question from plain Loan; CQs 6–7 lacking anchoring to loan/agreement). The assistant does note gaps, but the headline coverage labels are somewhat contradictory.

## Noteworthy observations
- **Turn 3**
  - Good adaptation: the assistant accepted the persona’s cleanup of competency questions rather than pushing its original over-broadened phrasing.
- **Turn 3–4**
  - The follow-up about “closely related role that actually does the day-to-day work” feels generic/template-driven and not well targeted to the domain inputs gathered so far.
- **Turn 6–8**
  - Strong technique: the assistant broke class elicitation into small batches and checked keep/remove decisions explicitly.
- **Turn 11–13**
  - The interviewer handled the user’s rejection of proposed relationship phrasings reasonably well by surfacing the hidden modeling assumption (“Principal” and “Interest” would need to be classes).
- **Turn 14–17**
  - Inefficient loop around `SecuredLoan` / `CollateralizedLoan`: because subclassing wasn’t supported, the assistant spent several turns probing structures that ultimately remained disconnected from `Loan`, producing a knowingly awkward model.
- **Turn 17–20**
  - Good discipline: the assistant repeatedly refused to invent unjustified links just to satisfy tool constraints.
- **Turn 19–21**
  - The agent surfaced an important product issue: the tool apparently expects every class to have a relationship, which pressured the interview. This is useful prompt/tool feedback.
- **Turn 21 onward**
  - The assistant repeatedly carried a known “ghost class” (**PrepaymentTerms**) as an unresolved cleanup item instead of pretending it was fixed. Good honesty, but also evidence the workflow lacks a proper remove/edit mechanism.
- **Turn 24–30**
  - Property elicitation was generally efficient and domain-sensitive; the assistant let the expert narrow fields and avoid unnecessary status flags/details.
- **Turn 25**
  - Good catch on the missing interest-rate path before persisting property changes; this prevented a real coverage hole.
- **Turn 31–43**
  - The language-layer phase was exhaustive but somewhat mechanical. Low-information alias rounds (“none” repeatedly) could likely be compressed after the first sparse batch.
- **Turn 46–60**
  - Rules/actions phase exposed a prompt design issue: actions are forced to use named rules as preconditions, which led to awkward formulations where a “review/check” action can only run when the reviewed condition is already satisfied.
- **Turn 50–53**
  - Nice corrective behavior: when the expert’s first readiness action exceeded the current model, the assistant narrowed the action rather than fabricating support.
- **Turn 60–62**
  - Good validation behavior overall: the assistant did not overclaim completeness and explicitly listed open gaps, including new late-breaking requirements from the persona.
- **Overall**
  - The interviewer was generally careful and transparent, but the session shows friction from tool/schema constraints: no safe delete, action preconditions limited to named rules, and no subclassing. Many later turns were spent working around those constraints rather than eliciting domain truth.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
