# Ontology-recovery eval report

Generated: 2026-09-02T18:20:45.915Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **70.8%** | **64.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.6% / 100.0% / 69.0% | 83.3% / 66.7% / 74.1% | 30/57 full · 20/24 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 87.1% / 81.8% / 84.4% | 94.1% / 48.5% / 64.0% | 27/31 full · 16/17 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 42.9% / 95.5% / 59.2% | 81.8% / 40.9% / 54.5% | 21/49 full · 9/11 scoped ground-truth properties matched; 22 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **70.8%** | **64.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.6% / 100.0% / 69.0% | 83.3% / 66.7% / 74.1% | 30/57 full · 20/24 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 87.1% / 81.8% / 84.4% | 94.1% / 48.5% / 64.0% | 27/31 full · 16/17 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 42.9% / 95.5% / 59.2% | 81.8% / 40.9% / 54.5% | 21/49 full · 9/11 scoped ground-truth properties matched; 22 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 83.3% / 76.9% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 83.3% / 90.9% | 5/5 ground-truth actions matched by name/meaning; 6 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 79.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 80.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 68.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 85.7% / 100.0% / 92.3% | 6/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 83.3% / 90.9% | 5/5 ground-truth actions matched by name/meaning; 6 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 79.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 80.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 68.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 86 turns, 1520s wall-clock
- Real app-agent API calls: 190 (apply_ontology_yaml called 50× · get_graph_state called 51×)
- Tool outcomes seen in transcript: 50 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 15234411 total (15201048 prompt · 33363 completion) across 298 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: Speaker/state handling bug at start: the persona’s intro appears first as `persona` at turn 0 and then duplicated as `app-user` at turn 1, suggesting transcript plumbing confusion.
- **Turn 31**: Tool limitation caused a partial/misapplied edit. It removed 3 elements and then reported “only one edit is applied per message,” leaving the ontology in an intermediate inconsistent state that the assistant had to manually repair in later turns.
- **Turn 31–32**: Assistant claims “I’ve already removed … the too-generic Beneficiary class” before replacement was added; because of the one-edit limitation, that removal/addition sequence was not atomic and briefly broke the model.
- **Turn 39–42**: Property placement contradiction around `prepaymentPenaltyTermMonths`. It was first modeled on `PrepaymentTerms`, then the persona corrected it to belong on `Loan`, and the assistant left the duplicate in place pending explicit deletion. Not fatal, but this shows the interviewer had recorded an incorrect property location and needed cleanup.
- **Turn 67–71**: Late addition of `SecuredLoan` created avoidable model churn. After changing the action input to `SecuredLoan`, the existing rule still referenced `Loan`, causing a mismatch the assistant only discovered after the tool update.
- **Turn 72–86**: The assistant initially moved toward closure (“validated state”) before Phase 9 additions had meanings/relationship meanings/properties. It recovered, but the interview reached a “final validation” state only after reopening several supposedly-complete phases.

## Noteworthy observations
- **Turn 2**: Good atomic-question split check. Efficiently turned broad competency questions into finer-grained ontology requirements.
- **Turn 5–7**: Good resistance to premature merging. The assistant checked whether `Loan`, `CreditAgreement`, and `CreditFacility` were truly distinct rather than assuming synonyms.
- **Turn 7–9**: Good follow-up on whether schedules should be separate classes vs. one class with a type property; that was an important modeling fork.
- **Turn 9–13**: The interviewer nearly closed Phase 2 too early and missed obvious classes (`Principal`, `Interest`, `Fixed interest rate`, `Variable interest rate`) until the persona had to re-open it.
- **Turn 15–24**: Generally strong relationship elicitation: the assistant repeatedly asked for directed business relationships and accepted “no path needed yet” instead of forcing edges.
- **Turn 17–18**: Nice adaptation to tool limits around subtype modeling by asking for an operational direct `Loan → Collateral` relation.
- **Turn 18–20**: Good recovery when the persona clarified that terms should both govern `Principal`/`Interest` and also be directly reachable from `Loan`.
- **Turn 22–27**: The assistant kept unconnected classes in scope and explicitly chased missing relationship paths instead of silently leaving isolated classes.
- **Turn 28–32**: Efficient handling of the newly introduced beneficiary concept, though the rename/repair sequence exposed the tool’s non-atomic edit weakness.
- **Turn 33–35**: Good pushback on `IndividualPaymentTransaction` lacking identifying properties. The persona declined to add them, and the assistant correctly marked that as an open modeling limitation rather than inventing fields.
- **Turn 36–38**: Good follow-up when the persona hinted `CreditFacility` needed more amount fields; the interviewer didn’t let “credit limit” stand as the only measure.
- **Turn 39–42**: The assistant required an explicit delete confirmation before removing the duplicate property from `PrepaymentTerms`; cautious, but somewhat inefficient given the persona had already said “model it on loan.”
- **Turn 52–60**: Solid rule capture overall, especially keeping some triggers as plain-language conditions rather than forcing extra flags.
- **Turn 58–60**: Good willingness to refine rule wording when the persona wanted the rule to preserve the semantic “governs payment of principal,” not just possession of terms.
- **Turn 67–71**: The `SecuredLoan` handling shows a recurring prompt issue: introducing late classes forces expensive rework. The interviewer could likely ask earlier whether contextual forms like secured/amortizing/collateralized loans need explicit classes vs. rule conditions.
- **Turn 72–81**: Phase 9 was useful and surfaced genuinely missing measurement concepts, but it also showed that “bounded expansion” can destabilize a supposedly finished ontology if the interviewer closes too aggressively beforehand.
- **Turn 84–86**: Good validation behavior: instead of declaring success, the assistant identified concrete remaining gaps (missing properties and relationship meanings) and closed them systematically.
- **Overall**: Good interview discipline and recap structure, but somewhat over-phased/verbose. Several “please confirm” checkpoints happened just before likely corrections, which created avoidable reopenings.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
