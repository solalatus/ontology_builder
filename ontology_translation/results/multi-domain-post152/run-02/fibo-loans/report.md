# Ontology-recovery eval report

Generated: 2026-09-02T19:14:59.859Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **60.8%** | **52.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 42.1% / 100.0% / 59.3% | 62.5% / 62.5% / 62.5% | 24/57 full · 15/24 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 51.6% / 69.6% / 59.3% | 52.9% / 39.1% / 45.0% | 16/31 full · 9/17 scoped ground-truth relationships matched; 23 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 49.0% / 92.3% / 64.0% | 81.8% / 34.6% / 48.6% | 24/49 full · 9/11 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **62.1%** | **53.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 42.1% / 100.0% / 59.3% | 62.5% / 62.5% / 62.5% | 24/57 full · 15/24 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 54.8% / 73.9% / 63.0% | 58.8% / 43.5% / 50.0% | 17/31 full · 10/17 scoped ground-truth relationships matched; 23 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 49.0% / 92.3% / 64.0% | 81.8% / 34.6% / 48.6% | 24/49 full · 9/11 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 85.7% / 85.7% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 50.0% / 66.7% | 5/5 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 56.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 39.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 85.7% / 85.7% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 50.0% / 66.7% | 5/5 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 56.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 39.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 53 turns, 537s wall-clock
- Real app-agent API calls: 99 (apply_ontology_yaml called 34× · get_graph_state called 10×)
- Tool outcomes seen in transcript: 34 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3869993 total (3849227 prompt · 20766 completion) across 157 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**
  - The assistant says “the tool flagged the actions because action inputs must reference classes we haven’t defined yet” and then proceeds, but the system immediately reports **10 unresolved consistency problems**. The assistant does not surface or resolve them directly at that point.
- **Turn 12**
  - The interviewer records `Loan -> hasCollateral -> Collateral` after the persona explicitly asked to **avoid a blanket loan-to-collateral relationship** and treat it as conditional on secured classification. The assistant notes the caveat, but still encodes the broader relationship anyway.
- **Turn 36–38**
  - The “interest-bearing loan needs interest payment terms” rule is paraphrased inconsistently. The persona’s condition is malformed (“has either ... and ... are present”), and the assistant records a rule name that implies the correct dependency, but never cleanly restates the exact logic. Could hide a rule-definition bug.
- **Turn 45–46**
  - The assistant asks for bounded expansion “only mention categories that are genuinely missing,” then accepts a large new batch of concepts that were not tied back to prior competency questions/actions. This is more prompt drift than a hard bug, but it weakens the claimed scoped validation.
- **Turn 52**
  - The assistant claims “the current model is structurally consistent” and “automated second-opinion review reported no additional observations,” but there is no visible second-opinion tool call in the transcript. This looks like fabricated process reporting.
- **Turn 52**
  - Validation says “Every class has at least one relationship,” but some late-added classes only got relationships after extra cleanup prompted by the assistant. This was eventually fixed, but the assistant nearly reached validation with under-integrated additions; the process is brittle.

## Noteworthy observations
- **Turn 1–3**
  - Strong phased structure at the start: competency questions first, then actions, then classes/relationships/properties/rules/actions.
- **Turn 3**
  - Good narrow follow-up on roles and whether “payment collector” is distinct. This efficiently prevented over-modeling.
- **Turn 8–9**
  - Good recovery when the persona rejected a catch-all `VariableRateTerms` class. The assistant paused and asked a precise clarification about `InterestRateResetSchedule`.
- **Turn 11–15**
  - The interviewer repeatedly proposes overly broad universal relationships (`Loan -> Collateral`, `Loan -> LoanToValueMeasure`) and relies on later rules/caveats to narrow them. Pattern suggests the agent defaults to flattening domain nuance into direct links.
- **Turn 13–14**
  - Nice handling of the persona’s semantic distinction (“terms govern payment of principal/interest” vs “loan has terms”). The assistant preserved the governance meaning without forcing extra classes.
- **Turn 16–18**
  - Good elicitation around interest-rate modeling: the assistant did not silently create an `InterestRate` superclass and instead asked whether fixed/variable should be separate classes.
- **Turn 20–22**
  - Efficient constraint on property creep: the assistant explicitly asks only about six classes and accepts “existence is enough” for several, avoiding unnecessary detail.
- **Turn 29–34**
  - Alias collection became somewhat mechanical. The assistant continued asking batch-by-batch despite repeated “none” answers, only stopping after two consecutive empty relationship-alias batches.
- **Turn 35–36**
  - Good caution on controlled vocabularies: the persona resisted inventing payment-frequency value lists, and the assistant preserved them as intentionally open rather than guessing.
- **Turn 36–38**
  - Missed obvious follow-up: once amortization schedule emerged as operationally distinct, the agent could have revisited whether generic `PaymentSchedule` was still needed or should be typed/refactored.
- **Turn 43–45**
  - Good distinction between formal rules and operational reviews. The assistant didn’t force everything into validation logic.
- **Turn 45–50**
  - The bounded-expansion phase is informative but costly. It re-opened class/relationship/meaning work late in the interview, increasing churn and risking scope creep.
- **Turn 48–50**
  - Good discipline in not forcing relationships for `CreditAgreement`/`SecurityAgreement`/`CreditFacility` when the persona said those shortcuts weren’t established business truths.
- **Turn 52–53**
  - Good self-audit to notice overlapping prepayment rules and ask for cleanup.
- **Overall**
  - The interviewer is generally strong at asking one focused clarification at a time, but it tends to over-propose ontology structure first and let the persona prune it back, rather than eliciting the expert’s native structure before suggesting candidates.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
