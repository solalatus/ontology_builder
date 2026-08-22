# Ontology-recovery eval report

Generated: 2026-08-22T16:56:01.067Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **57.5%** | **62.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.6% / 96.8% / 68.2% | 91.7% / 71.0% / 80.0% | 30/57 full · 22/24 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 58.1% / 58.1% / 58.1% | 58.8% / 32.3% / 41.7% | 18/31 full · 10/17 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 30.6% / 93.8% / 46.2% | 81.8% / 56.3% / 66.7% | 15/49 full · 9/11 scoped ground-truth properties matched; 16 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **63.6%** | **68.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 54.4% / 100.0% / 70.5% | 91.7% / 71.0% / 80.0% | 31/57 full · 22/24 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 74.2% / 74.2% / 74.2% | 82.4% / 45.2% / 58.3% | 23/31 full · 14/17 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 30.6% / 93.8% / 46.2% | 81.8% / 56.3% / 66.7% | 15/49 full · 9/11 scoped ground-truth properties matched; 16 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 100.0% / 25.0% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 1 recovered |
| Action identification recall / precision / F1 | 100.0% / 83.3% / 90.9% | 5/5 ground-truth actions matched by name/meaning; 6 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 15.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 43.6% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 100.0% / 25.0% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 1 recovered |
| Action identification recall / precision / F1 | 100.0% / 83.3% / 90.9% | 5/5 ground-truth actions matched by name/meaning; 6 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 15.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 43.6% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 56 turns, 1038s wall-clock
- Real app-agent API calls: 115 (apply_ontology_yaml called 29× · get_graph_state called 30×)
- Tool outcomes seen in transcript: 29 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 5789296 total (5764185 prompt · 25111 completion) across 219 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: Persona’s opening message appears duplicated as `app-user`, suggesting transcript/input plumbing duplication.
- **Turn 23**: Assistant explicitly reports a tool/schema failure: Loan properties may not have persisted because the format “doesn’t actually support a top-level `properties:` block.” This is a real persistence bug or prompt/tool mismatch.
- **Turn 24**: `app-tool` only shows a state check, but the assistant says “Confirmed” as if the model state had been changed/recorded. No apply step is shown.
- **Turn 25–26**: Generic `InterestRate` class/link were acknowledged as superseded, but not actually removed; stale model state persisted throughout and had to be carried as cleanup debt.
- **Turn 38–39**: Same issue for `SupportAgreement`: persona explicitly asked for removal, but assistant could only leave it as an unresolved cleanup artifact. This is a tooling limitation exposed in-session.
- **Turn 45**: Tool reports only `1 updated` after confirming boolean constraints for three properties; likely partial persistence or misleading tool summary.
- **Turn 33 / 43**: Assistant asks for meanings for `LoanToValue`, `CombinedLoanToValue`, and `CollateralValueAsOfDate` even though those meanings had already been captured earlier; mild state-tracking redundancy.
- **Turn 42**: Assistant solicits meanings for both `Loan --isCollateralizedBy--> Collateral` and `CollateralizedLoan --isCollateralizedBy--> Collateral`, even though the domain expert had already tightened the former to not be universal. This preserves a potentially contradictory generic link instead of clearly deprecating it.
- **Turn 51**: Actions surfaced structural validation problems only after being added, implying the assistant didn’t pre-check navigability before persisting actions.

## Noteworthy observations
- **Turn 1**: Good interview control: starts from competency questions/actions before classes.
- **Turns 3–10**: Strong decomposition habit. Assistant repeatedly split compound concepts and asked narrow follow-ups, which elicited useful distinctions like separate schedule types, security agreement vs. credit enhancement agreement, etc.
- **Turns 5–10**: Interview was efficient at extracting domain boundaries, but sometimes too class-happy; many follow-ups converted nuanced business distinctions into new classes without first checking whether they could be handled by subclasses, types, or rules.
- **Turns 11–19**: Good discipline in not forcing relationships the expert rejected (`Loan`↔`CreditFacility`, direct `Loan`↔`Beneficiary`).
- **Turns 12–15**: Nice recovery when “terms govern principal/interest” implied missing intermediate concepts; assistant noticed a modeling mismatch instead of bulldozing ahead.
- **Turns 16–18**: Assistant asked several relationship questions in forms that implicitly universalized conditional facts (“Loan has collateral/security agreement/credit enhancement agreement”), and the persona had to repeatedly tighten them to secured/collateralized cases.
- **Turns 20–21**: Good recognition that some classes were “light” because they are attribute-heavy, not relationship-heavy.
- **Turns 23–26**: Helpful transparency about persistence issues and cleanup debt; good reviewer-facing behavior even though it reveals a tool bug.
- **Turns 27–32**: Strong elicitation around collateral measures. The assistant successfully uncovered date-sensitive valuation and properly scoped LTV/CLTV to collateralized loans.
- **Turns 29–32**: Efficient use of subclass-like distinctions (`CollateralizedLoan`, `SecuredLoan`) to avoid overgeneralizing to all loans.
- **Turns 34–43**: Language-layer phase was methodical but somewhat tedious; many turns were spent collecting one-sentence meanings/aliases that may have lower value than unresolved structural gaps.
- **Turn 38 onward**: Good restraint in stopping alias solicitation after repeated “none” answers.
- **Turns 48–50**: Good move to derive an actual business rule for “complete enough to service”; this tied the ontology back to an operational decision.
- **Turns 51–54**: Valuable validation behavior: assistant surfaced navigability/tooling issues rather than silently “fixing” the business model. Especially good that it accepted the persona’s preference for semantic correctness over tool convenience.
- **Overall**: Interview quality was strong on domain elicitation and transparency, but the session exposed a prompt/tool mismatch around edits, deletion, and property persistence. The agent also tends to accumulate stale artifacts instead of managing deprecation/removal cleanly.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
