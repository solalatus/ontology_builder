# Ontology-recovery eval report

Generated: 2026-08-21T14:47:11.642Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **64.3%** | **59.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.9% | 75.0% / 64.3% / 69.2% | 28/57 full · 18/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 64.5% / 71.4% / 67.8% | 70.6% / 42.9% / 53.3% | 20/31 full · 12/17 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 42.9% / 95.5% / 59.2% | 81.8% / 40.9% / 54.5% | 21/49 full · 9/11 scoped ground-truth properties matched; 22 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **64.3%** | **59.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.9% | 75.0% / 64.3% / 69.2% | 28/57 full · 18/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 64.5% / 71.4% / 67.8% | 70.6% / 42.9% / 53.3% | 20/31 full · 12/17 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 42.9% / 95.5% / 59.2% | 81.8% / 40.9% / 54.5% | 21/49 full · 9/11 scoped ground-truth properties matched; 22 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 49.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 48.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 66.5% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 49.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 48.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 66.5% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 55 turns, 736s wall-clock
- Real app-agent API calls: 108 (apply_ontology_yaml called 38× · get_graph_state called 15×)
- Tool outcomes seen in transcript: 38 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4719725 total (4693636 prompt · 26089 completion) across 216 API calls

## LLM review of the conversation

## Errors
- **Turn 4** — The assistant says “the tool is correctly flagging a gap” about actions using `Loan` before classes exist, but the actual tool output just says `✓ Applied: 5 added, 0 updated.` The mismatch looks like fabricated tool feedback.
- **Turn 4** — Assistant asks an odd follow-up about “closely related role[s] that actually do the day-to-day work” before finishing basic class elicitation. This appears to lose the stated phased plan (“Phase 1’s last required follow-up before classes”) and is not grounded in prior needs.
- **Turn 6** — Tool reports `5 added, 5 updated` after the user said to **drop Party** and keep Loan/CreditFacility plus Borrower/Lender/Servicer. The assistant never explicitly confirms that `Party` was removed, and later recap only mentions kept classes. Possible misapplied or at least unverified edit.
- **Turn 8** — User said **drop** `RepaymentTerm`, `PaymentSchedule`, `VariableRateFeature`, and `CollateralValuation`, but tool says `11 added, 0 updated.` No drops/updates are mentioned; assistant recap says they were dropped. Possible ontology edit bug or assistant assuming changes weren’t applied.
- **Turn 11–12** — User corrected `Loan --isSecuredBy--> Collateral` to a secured-loan-specific relation, then compromised to `Loan --is collateralized by--> Collateral`. Assistant says “Recorded” and tool applies 4 additions, but there is no explicit indication the previously proposed `isSecuredBy` / `hasSecurityAgreement` relations were removed if they had been staged. Risk of stale relationships persisting.
- **Turn 14** — Tool says `11 added, 0 updated` when only 2 new classes (`Principal`, `Interest`) and several relationships were discussed. Count may be plausible, but the assistant also claims schedule verbs were “normalized,” despite prior schedule relations not having actually been added yet. Suggests the assistant may be losing track of ontology state.
- **Turn 20–21** — User says plain loan-level `interestRate` should be dropped as primary approach in favor of linked rate records. Assistant does not persist this batch then asks a new class-structure question; there is no tool call. Later the model behaves as if the property batch was captured. State transition is unclear.
- **Turn 23–24** — Persona says keep `VariableInterestRate` plus add `FloatingInterestRate` and `ManagedInterestRate`, implying a taxonomy/subtype relation. Assistant records only parallel `Loan --hasInterestRate--> ...` links to all three/four classes, without clarifying subtype semantics. This creates a likely modeling contradiction with the user’s intended structure.
- **Turn 26** — Tool says `0 added, 4 updated` after confirming `isSecured` should be kept. But the prior property batch included far more than four changes, and some had not visibly been applied. State accounting looks unreliable.
- **Turn 28** — Assistant recap says “added `Loan.initialExchangeDate`… `LoanToValueRatio.ratio`… `CombinedLoanToValueRatio.ratio`,” but the immediately preceding user input was only about `initialExchangeDate`, `loanBalance`, and dropping `creditLimit` from Loan. Ratios were from an earlier batch and not just handled here. This is a concrete state-tracking error in recap.
- **Turn 44** — Tool says `0 added, 1 updated` after discussing allowed values for **four** boolean properties (`isSecured`, `interestOnly`, `negativeAmortization`, `balloonPayment`). Either tool application count is wrong or assistant overstates what was persisted.
- **Turn 55** — Formal validation calls CQ6 only “partly covered” because there is no direct `Loan ↔ SecurityAgreement` link, even though the user explicitly accepted traversal through collateral as sufficient for this slice. This re-opens a settled design choice as if it were an unresolved gap.

## Noteworthy observations
- **Turn 1** — Good move to start from competency questions instead of schema; that elicited rich, domain-grounded content quickly.
- **Turn 2** — The assistant aggressively atomized the user’s bundled questions into 29 items, but the persona immediately pushed back. This shows over-optimization for testability at the expense of preserving business phrasing.
- **Turn 3** — Good recovery: the assistant accepted the tighter operational wording and persisted the user’s preferred acceptance-test set.
- **Turn 4 onward** — The transcript repeatedly includes duplicated `app-user` turns that simply echo persona content. The assistant mostly ignores this noise well, but it makes the interview look tool-pipeline-driven rather than conversational.
- **Turn 5–9** — Efficient keep/drop batching for candidate classes worked well; the persona could steer specificity without being forced into full ontology design from scratch.
- **Turn 7–9** — Strong interviewing technique: when the persona rejected generic bucket classes, the assistant adapted and let the domain expert split them into operationally meaningful classes.
- **Turn 11–19** — The assistant handled “this tool doesn’t model subclassing” constraints transparently and productively. It asked focused compromise questions rather than silently flattening semantics.
- **Turn 13–18** — Good restraint in pausing before inventing `Principal` and `Interest` classes. The assistant correctly checked whether those classes were truly needed.
- **Turn 16–19** — The assistant got somewhat tool-driven, chasing “every class must be connected” rather than user value. This led to adding `SubFacility` mainly to satisfy graph completeness, not because it was central to the accepted actions/questions.
- **Turn 20–29** — Property elicitation was mixed: the assistant proposed many plausible fields, but several were not directly grounded in the accepted competency questions and had to be corrected. Prompt could emphasize stricter scope discipline.
- **Turn 21–24** — Missed obvious follow-up on how `VariableInterestRate`, `FloatingInterestRate`, and `ManagedInterestRate` relate. Because the tool allegedly lacks subclassing, the assistant should have clarified whether the latter two are substitutes, refinements, or parallel records.
- **Turn 26–29** — Good job letting the persona distinguish convenience flags (`isSecured`) from meaningful support (`isCollateralizedBy`), and distinguishing `availableAmount` from `creditLimit`.
- **Turn 29–40** — The language-layer collection became very long and mechanical. Likely low-value relative to remaining modeling risks; prompt could shorten or opportunistically stop earlier.
- **Turn 42–49** — Rule elicitation was efficient and well-grounded in prior actions. The assistant kept rules tied to operational checks instead of abstract integrity constraints.
- **Turn 49–54** — Tightening actions one by one with input/preconditions/effect/verification/evidence was a strong pattern and produced useful operational semantics.
- **Turn 54–55** — The formal validation pass was useful, but the assistant framed previously accepted tradeoffs as “open items.” Prompt should distinguish “accepted limitation” from “gap” more carefully.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
