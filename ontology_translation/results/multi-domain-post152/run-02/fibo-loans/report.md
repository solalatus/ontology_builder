# Ontology-recovery eval report

Generated: 2026-09-03T07:32:40.423Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.1%** | **62.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 54.4% / 96.9% / 69.7% | 79.2% / 59.4% / 67.9% | 31/57 full · 19/24 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 80.6% / 73.5% / 76.9% | 94.1% / 47.1% / 62.7% | 25/31 full · 16/17 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 34.7% / 81.0% / 48.6% | 81.8% / 42.9% / 56.3% | 17/49 full · 9/11 scoped ground-truth properties matched; 21 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.8%** | **63.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.1% / 100.0% / 71.9% | 83.3% / 62.5% / 71.4% | 32/57 full · 20/24 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 80.6% / 73.5% / 76.9% | 94.1% / 47.1% / 62.7% | 25/31 full · 16/17 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 34.7% / 81.0% / 48.6% | 81.8% / 42.9% / 56.3% | 17/49 full · 9/11 scoped ground-truth properties matched; 21 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 52.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 36.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 48.6% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 52.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 36.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 48.6% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 61 turns, 1434s wall-clock
- Real app-agent API calls: 144 (apply_ontology_yaml called 40× · get_graph_state called 42×)
- Tool outcomes seen in transcript: 40 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 11362076 total (11333864 prompt · 28212 completion) across 209 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1 / throughout**: The transcript appears duplicated into `app-user` turns, suggesting orchestration/logging confusion rather than a clean app↔persona exchange. Not an ontology bug per se, but a real transcript/tooling artifact.
- **Turn 3**: Tool says `✓ Applied: 38 added, 0 updated` then `✓ Applied: 1 added, 5 updated` after the user merely refined the CQ/action list. Counts look inflated/misaligned with the actual edits and suggest the tool is applying opaque bulk changes.
- **Turn 5**: After the persona said to keep **three** classes (`Loan`, `CreditAgreement`, `CreditFacility`), the tool reports only `2 added, 0 updated`. Likely missed/ignored one class or had prior hidden state not reflected to the interviewer.
- **Turn 9**: Persona said **drop** generic `SecuritySupport`, **keep** `BorrowingCapacity`, **keep** `SubFacility`, and noted `SecurityAgreement` would be needed instead. Tool reports `3 added, 0 updated`, and the assistant says “Added `SecurityAgreement`,” but does not explicitly confirm whether this was actually added by the tool vs inferred by the assistant. Feels like a silent, interviewer-initiated edit.
- **Turn 14–15**: Interviewer correctly identifies that `CreditAgreement -> ...RepaymentTerms` is unsupported, but leaves two accepted competency questions knowingly under-modeled for a long stretch before resolving them much later. Not a hard contradiction, but state remains knowingly inconsistent for many turns.
- **Turn 18**: Assistant summarizes secured-loan support as `Loan -> Collateral <- SecurityAgreement`, even though the persona had explicitly said there is **no direct Loan → SecurityAgreement** link. The shorthand is directionally understandable but blurs the actual navigable path.
- **Turn 20–21**: `Principal` and `Interest` are introduced very late as classes only because the tool cannot record term relationships otherwise. This is a modeling pivot caused by tool constraints, not elicited as a natural domain need upfront.
- **Turn 23**: The assistant says it replaced “funded or effective date” with `initialExchangeDate` “per your direction,” but the persona said “initial funding or exchange date” and earlier “funded or put into effect.” The chosen label is narrower/odd and seems like a misapplied wording choice.
- **Turn 24–27**: Open/closed-end distinction is first treated as a property batch issue, then converted midstream into new classes in Phase 4. That works, but it reflects the interviewer not having recognized earlier that this was a structural distinction, causing avoidable backtracking.
- **Turn 52–54**: The interviewer asks for rules “using only facts already in the model,” then discovers `loanReadinessCheck` depends on a not-modeled path to `InterestPaymentTerms`. This is a real prompt/state-management miss: the interviewer should have recognized the gap before soliciting the rule.
- **Turn 54**: Tool reports `2 added, 0 updated` when only two rules were named, but no rule conditions were shown as being stored. Repeated pattern of tool confirmations being too coarse to trust.
- **Turn 57**: Assistant claims it “recorded the action-to-rule mapping and tightened the action wording,” but the immediately following tool call shows only a state check, not an apply/update. Likely an unsupported or unlogged edit.
- **Turn 60**: Validation claims “every class and relationship has a meaning sentence,” but the two late-added relationships `CreditAgreement --hasPrincipalRepaymentTerms--> ...` and `--hasInterestPaymentTerms--> ...` were never explicitly given relationship meaning sentences after being added.

## Noteworthy observations
- **Turn 1**: Strong opening structure from the interviewer: starts from competency questions before classes/properties, which is appropriate for ontology elicitation.
- **Turn 2**: Good atomic rewrite of business questions, but it over-normalized aggressively and overgeneralized “loan or credit agreement” across contexts the persona later had to correct.
- **Turn 3**: Good recovery when the persona narrowed scope and object applicability; interviewer accepted corrections instead of defending earlier abstractions.
- **Turn 3**: The “required narrow follow-up” about subordinate day-to-day roles/context feels somewhat canned and weakly justified by the current state; it interrupts momentum before core object modeling.
- **Turn 4–10**: Generally efficient class elicitation. The interviewer regularly asks keep/drop and checks merge/rename decisions, which keeps the persona focused.
- **Turn 6–8**: Good interviewer behavior around `PaymentHistory`—explicitly checks whether it’s a real business object vs just a collection.
- **Turn 7–8**: Nice handling of schedule granularity. The interviewer let the persona split one generic “PaymentSchedule” into six distinct classes instead of prematurely collapsing them.
- **Turn 8–10**: The interviewer did a good job surfacing whether metrics like collateral value/LTV/CLTV should be classes vs properties, rather than assuming.
- **Turn 11–13**: Careful relationship elicitation overall, especially asking for “real path, not just endpoint.” Good discipline.
- **Turn 12–13**: Good pushback on the “secured loan” qualifier when the tool can’t represent subclass scope. The assistant explicitly asks how to preserve the qualification rather than flattening silently.
- **Turn 14–15**: Good restraint: the interviewer refuses to invent `CreditAgreement -> RepaymentTerms` links just because they seem plausible.
- **Turn 19–21**: The interviewer notices zero-relationship classes and forces closure. That’s a strong quality-control move, though it led to late class additions.
- **Turn 22–35**: Property elicitation was methodical and mostly good, with repeated checks on whether distinctions should be structural classes vs properties.
- **Turn 24–27**: Good persistence on the open-end/closed-end CQ. The interviewer correctly refuses to let that question remain unsupported.
- **Turn 29–31**: Also good persistence on prepayment terms. The interviewer catches that dropping `prepaymentTerms` as a property would otherwise break a confirmed CQ/action, and forces a structural replacement.
- **Turn 32–34**: Useful pushback on `PaymentTransaction` having no properties. Even though the persona kept the model intentionally minimal, the interviewer tested whether “trackable in servicing” really required field-level detail.
- **Turn 34–36**: Similar good pushback on fixed/variable: interviewer noticed the reset schedule alone did not define rate type and forced a clearer representation.
- **Turn 36 onward**: Meaning/alias collection is thorough but quite long and mechanical. This phase appears expensive relative to the modeling value gained; could likely be compressed or deferred.
- **Turn 45–47**: Alias elicitation is decent, but the interviewer appropriately stops probing after two mostly-empty batches.
- **Turn 52–57**: Rule/action phases expose a recurring issue: the interviewer’s prompt/tooling expects “preconditions” for actions that are actually evaluative checks, causing repeated warning churn. This seems like a systemic prompt mismatch worth fixing.
- **Turn 57–61**: Final validation summary is helpful and transparent about limitations, especially the fixed/variable exclusivity issue. Good reviewer-style wrap-up.
- **Overall**: The interviewer is strong at constraint-checking and gap detection, but the process is overlong, slightly too tool-schema-driven, and occasionally lets tool limitations reshape the ontology (e.g., late `Principal`/`Interest` classes, evaluative-action warning churn).

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
