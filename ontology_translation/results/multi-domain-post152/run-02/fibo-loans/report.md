# Ontology-recovery eval report

Generated: 2026-09-02T18:35:03.706Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **48.1%** | **53.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 36.8% / 100.0% / 53.8% | 66.7% / 76.2% / 71.1% | 21/57 full · 16/24 scoped ground-truth classes matched; 21 recovered |
| Relationship recall / precision / F1 | 51.6% / 80.0% / 62.7% | 52.9% / 45.0% / 48.6% | 16/31 full · 9/17 scoped ground-truth relationships matched; 20 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 16.3% / 88.9% / 27.6% | 36.4% / 44.4% / 40.0% | 8/49 full · 4/11 scoped ground-truth properties matched; 9 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **48.1%** | **53.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 36.8% / 100.0% / 53.8% | 66.7% / 76.2% / 71.1% | 21/57 full · 16/24 scoped ground-truth classes matched; 21 recovered |
| Relationship recall / precision / F1 | 51.6% / 80.0% / 62.7% | 52.9% / 45.0% / 48.6% | 16/31 full · 9/17 scoped ground-truth relationships matched; 20 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 16.3% / 88.9% / 27.6% | 36.4% / 44.4% / 40.0% | 8/49 full · 4/11 scoped ground-truth properties matched; 9 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 74.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 51.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 57.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 74.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 51.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 57.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 65 turns, 777s wall-clock
- Real app-agent API calls: 106 (apply_ontology_yaml called 34× · get_graph_state called 5×)
- Tool outcomes seen in transcript: 34 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3850313 total (3830141 prompt · 20172 completion) across 196 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 5 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: Speaker labeling/state handling looks broken at the start: the persona’s opening message is duplicated as `app-user`, suggesting the interviewer may be consuming/transcribing the wrong speaker turn.
- **Turn 6**: Tool says `✓ Applied: 3 added` after the user confirmed **four** classes (Loan, Borrower, Lender, Servicer). The assistant then claims “we now have four confirmed classes,” so either the tool under-applied or reporting is inconsistent.
- **Turn 23**: Tool reports `0 added, 2 updated` after confirming four properties (`Loan.principalAmount`, `Loan.maturityDate`, `Loan.prepaymentPenaltyPeriodMonths`, `CreditAgreement.maturityDate`). Assistant recap lists all four, so state/report mismatch again.
- **Turn 29**: Assistant says “the generic InterestRate class is removed, and the model now keeps only the fixed-rate and variable-rate paths,” but the tool reports only `✓ Removed: 1 element(s)`. Unless the class removal auto-deleted the relationship, this may have left a dangling or unreported edge.
- **Turn 65**: The interviewer correctly pushes back that BorrowingCapacity is not justified by the accepted questions, but the conversation stops there without resolving/recording the correction. Leaves the interview in an unfinished state.

## Noteworthy observations
- **Turn 3**: Good recap and narrowing move, but the follow-up about “closely related role that actually does the day-to-day work under it” feels generic/template-driven and not clearly motivated by the elicited domain.
- **Turns 4–5**: Strong handling of scope correction. The interviewer cleanly distinguishes formal review actions from everyday maintenance actions and updates the model accordingly.
- **Turns 7–8**: Good follow-up on schedule granularity. The interviewer noticed the domain expert’s nuance and avoided collapsing distinct schedule types into one generic class.
- **Turns 8–15**: Strong discipline around not inventing relationships. The interviewer repeatedly checks before forcing `Loan -> CreditAgreement` or `Loan -> SecuredLoan`, which is good ontology hygiene.
- **Turns 11–15**: Efficient workaround for tool limitations. Reframing the collateral review action to take `SecuredLoan` as input is a sensible recovery from lack of subclassing.
- **Turns 20–22**: Good pattern of translating nuanced business language (“governed by”, “subject to”) into explicit recordable edges while asking for confirmation rather than flattening unilaterally.
- **Turns 24–30**: The agent manages tool limitations reasonably well, but the proliferation of near-specialization classes (`SecuredLoan`, `CollateralizedLoan`, `FixedInterestRate`, `VariableInterestRate`) shows the prompt/tool combination struggles when inheritance is unavailable. This creates modeling overhead and repeated “don’t invent a connector” loops.
- **Turns 31–33**: Property elicitation is generally disciplined, but the interviewer becomes a bit too checklist-driven, asking many low-yield “keep/don’t keep” questions one by one.
- **Turns 45–57**: Nice recovery on action semantics. The persona objected to “record a review result,” and the interviewer adjusted to confirmation/verification semantics instead of forcing a nonexistent artifact.
- **Turns 62–65**: Good bounded expansion behavior. The interviewer explicitly filters late additions against accepted competency questions/actions instead of blindly expanding scope.
- **Turns 63–65**: The interviewer catches a real inconsistency around BorrowingCapacity justification, which is good, but it exposes that earlier competency-question tracking was imperfect: the agent hadn’t cleanly persisted which questions remained in scope versus merely mentioned early on.
- **Overall**: The interviewer is careful and methodical, especially about not inventing facts, but somewhat inefficient. Many confirmation turns could likely be collapsed, and repeated tool/state checks plus exact-wording confirmations make the interview longer than necessary.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
