# Ontology-recovery eval report

Generated: 2026-08-21T14:10:13.583Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **66.0%** | **68.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.6% / 93.8% / 67.4% | 87.5% / 65.6% / 75.0% | 30/57 full · 21/24 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 80.6% / 80.6% / 80.6% | 88.2% / 48.4% / 62.5% | 25/31 full · 15/17 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 34.7% / 89.5% / 50.0% | 90.9% / 52.6% / 66.7% | 17/49 full · 10/11 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **67.1%** | **68.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.6% / 93.8% / 67.4% | 87.5% / 65.6% / 75.0% | 30/57 full · 21/24 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 83.9% / 83.9% / 83.9% | 88.2% / 48.4% / 62.5% | 26/31 full · 15/17 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 34.7% / 89.5% / 50.0% | 90.9% / 52.6% / 66.7% | 17/49 full · 10/11 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 50.0% / 22.2% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 80.0% / 44.4% / 57.1% | 4/5 ground-truth actions matched by name/meaning; 9 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 12.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 47.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 50.0% / 22.2% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 55.6% / 71.4% | 5/5 ground-truth actions matched by name/meaning; 9 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 12.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 47.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 57 turns, 862s wall-clock
- Real app-agent API calls: 127 (apply_ontology_yaml called 34× · get_graph_state called 36×)
- Tool outcomes seen in transcript: 34 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 9648985 total (9623229 prompt · 25756 completion) across 238 API calls

## LLM review of the conversation

## Errors
- **Turn 1**: Speaker labeling/state ingestion looks wrong: the persona’s opening appears duplicated as `app-user`, suggesting the app may be echoing persona content as user input rather than maintaining clean turn roles.
- **Turn 3**: The agent says it has “persisted” competency questions/actions, but immediately after, the system reports **9 consistency problems unresolved**. It proceeds without resolving or clearly surfacing them to the user until later.
- **Turn 5**: Agent acknowledges stale placeholder `LoanRecord` remains and cannot delete it, but keeps building on top of a known duplicate class. This creates lingering model inconsistency that affects later steps.
- **Turn 7**: Agent says `PaymentSchedule` was split into distinct classes, but later models them all under one generic `hasSchedule` relation anyway; not a fatal contradiction, but the edit/recap is somewhat misleading about how much structural distinction was actually captured.
- **Turn 18**: Agent reports “some actions still assume paths from `Loan` to things like `Interest Payment Terms`, `PrincipalRepaymentTerms`, `Collateral`, `CollateralizedLoan`, and `CreditFacility`” — this is effectively the result of the interviewer having earlier assigned `Loan` as the blanket input class for actions before relationship design was settled.
- **Turn 21–22**: `LoanToValueMeasure` is explicitly replaced, but the stale class remains in the live model and continues to affect warnings. Same cleanup failure pattern as `LoanRecord`.
- **Turn 25–26**: `InterestRate` is replaced by `Fixed Interest Rate` and `Variable Interest Rate`, but stale `InterestRate` remains in the live model, again leaving model/tool state divergent from the elicited intent.
- **Turn 39**: Assistant claims it “tightened [the action’s] effect/verification” for `verifyCollateralTrackingDetailsForCollateralizedLoan`, but no user confirmation was solicited for that edit. That’s a mild overreach beyond pure confirmation.
- **Turn 53–55**: Rules `securedLoanHasCollateral` and `collateralizedLoanHasTrackingRatios` are used as **preconditions** for verification actions. Semantically, those sound more like the condition being verified than prerequisites to running the check; likely misapplied action structure.
- **Turn 57**: Final recap says “Core ontology content captured and persisted” despite multiple acknowledged stale classes still present and two unresolved warnings. Overstates completion/consistency of the live model.

## Noteworthy observations
- **Turn 3 onward**: Good practice in repeatedly recapping and asking narrow follow-ups; the interview stays controlled and incremental.
- **Turn 3**: The required follow-up about role distinctions/context feels prompt-driven rather than naturally derived from the user’s stated goals; it interrupts momentum after actions were supplied.
- **Turn 4**: Good recovery when the persona flags that `Loan` alone is too narrow; the agent adapts and adds `Credit Agreement` / `Credit Facility`.
- **Turn 6–10**: Efficient decomposition of classes/properties/relationships into small batches kept the persona engaged and yielded high-quality distinctions.
- **Turn 11–13**: Strong interviewer behavior when the persona rejects direct `Loan -> terms` links; the agent pauses and explicitly asks whether `Principal` and `Interest` should become classes instead of forcing its initial structure.
- **Turn 15–19**: The tool’s lack of subclassing causes a lot of inefficiency. The interviewer handles it transparently, but substantial time is spent inventing/negotiating workaround bridges (`hasLoan`) that the persona repeatedly says are unnatural.
- **Turn 18–24**: Good recognition that action input classes were wrong for secured/collateralized workflows; switching action inputs to `SecuredLoan` / `CollateralizedLoan` was a useful repair.
- **Turn 23–24**: Nice restraint in not forcing `CreditAgreement` links “just because the phrase appeared in competency questions.” The agent follows the narrower, validated operational scope.
- **Turn 27–30**: Good discipline in rejecting generic `status`, `amortizing`, and `interestBearing` flags when the persona says they’re not justified yet.
- **Turn 31 onward**: The language-layer batching is efficient, though somewhat mechanical. It works well because the persona is cooperative.
- **Turn 37–42**: Useful move to revisit action coverage after language capture began; shows awareness that model completeness matters more than phase purity.
- **Turn 43–45**: Good optimization: after two alias batches with almost no results, the agent stops soliciting more aliases instead of grinding through all classes.
- **Overall**: The biggest prompt-level issue is premature commitment to structure (especially action input classes and some direct links) before enough ontology has been elicited. The agent is decent at repairing this later, but it creates avoidable churn.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
