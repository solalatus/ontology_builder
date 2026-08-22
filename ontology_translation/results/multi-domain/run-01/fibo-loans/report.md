# Ontology-recovery eval report

Generated: 2026-08-22T16:59:28.643Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **59.9%** | **56.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 54.4% / 96.9% / 69.7% | 83.3% / 62.5% / 71.4% | 31/57 full · 20/24 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 64.5% / 71.4% / 67.8% | 64.7% / 39.3% / 48.9% | 20/31 full · 11/17 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 30.6% / 68.2% / 42.3% | 72.7% / 36.4% / 48.5% | 15/49 full · 8/11 scoped ground-truth properties matched; 22 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **60.7%** | **57.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.1% / 100.0% / 71.9% | 87.5% / 65.6% / 75.0% | 32/57 full · 21/24 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 64.5% / 71.4% / 67.8% | 64.7% / 39.3% / 48.9% | 20/31 full · 11/17 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 30.6% / 68.2% / 42.3% | 72.7% / 36.4% / 48.5% | 15/49 full · 8/11 scoped ground-truth properties matched; 22 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 62.5% / 76.9% | 5/5 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 54.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 26.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 62.5% / 76.9% | 5/5 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 80.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 54.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 26.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 64 turns, 1275s wall-clock
- Real app-agent API calls: 135 (apply_ontology_yaml called 35× · get_graph_state called 36×)
- Tool outcomes seen in transcript: 35 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 9232753 total (9206249 prompt · 26504 completion) across 261 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: Speaker/state bug at session start: the persona’s opening message from turn 0 is duplicated as `app-user` in turn 1, indicating transcript plumbing/role confusion.
- **Turn 3**: Assistant says “actions can only be stored once their input class exists” and that the tool is flagging missing input class, but the visible tool output only says `✓ Applied: 28 added, 0 updated.` No visible evidence of that specific tool failure.
- **Turn 3**: `app-system` reports “8 consistency problem(s) unresolved,” but the assistant doesn’t explicitly inspect or reconcile them beyond a generic comment. State handling is vague.
- **Turn 7 / 18 / 37**: Class renaming/deprecation is mishandled. `RateResetSchedule` is added, later `InterestRateResetSchedule` is added as a replacement, but the old class remains. Similarly `InterestTerms`, `DebtTerms`, and `SecurityAgreement` stay in the graph as deprecated because the tool can’t delete. This leaves duplicate/stale ontology state.
- **Turn 15–16**: The interviewer backs itself into a tooling/modeling corner by creating `SecuredLoan` as a separate class without subtype support, then asks for a fabricated workflow relationship from `Loan` to `SecuredLoan`. Persona rightly rejects it; this exposed a real modeling/tool mismatch.
- **Turn 18**: Assistant says adding schedule relationships “cleared the missing-path warning for `AmortizationSchedule`,” but there’s no visible check output showing that specific warning status.
- **Turn 30**: Tool reports `4 added, 1 updated`, but the assistant claims to have added 2 classes, 6 properties, and 2 relationships in one shot. The recap likely overstates what was actually persisted.
- **Turn 32**: Assistant says `Loan.rateCap` was added based on the prior tool call, but the preceding tool output (`2 added, 3 updated`) is too coarse to verify; combined with earlier “add/update only” limitations, persistence status is somewhat opaque.
- **Turn 37**: Tool says `0 added, 2 updated`, but assistant claims four properties were added/decided (`paymentFrequency`, `paymentDay`, `compounding`, another `paymentFrequency`). At least two of those were not actually persisted, or the recap is inaccurate.
- **Turn 44**: Tool says `0 added, 15 updated` after only 10 relationship meanings were supplied. Either hidden edits occurred or the assistant/tool accounting is inconsistent.
- **Turn 58**: Tool check runs with no apply result, but assistant treats the state as if the “keep empty” action-precondition decisions are now settled. This may be fine conversationally, but not as a persisted-state claim.
- **Turn 62**: Persona supplies both a property name and allowed values for `CreditFacility.facilityType`, but tool reports only `0 added, 1 updated`; assistant then claims both property and allowed values were recorded. Persistence of the value set is unclear.
- **Overall**: Repeated claims that warnings were “cleared” or specific issues persisted/deprecated are often not grounded in visible tool output. The interviewer sometimes reports inferred state rather than confirmed state.

## Noteworthy observations
- **Turn 1**: Good technique to start with competency questions and actions before classes; that likely improved domain fit.
- **Turns 3–10**: Efficient incremental batching of class decisions worked well; the interviewer kept questions narrow and justified by prior requirements.
- **Turns 6–8**: Strong follow-up when the expert pushed back on over-generic schedule and terms classes. The interviewer adapted instead of forcing the original schema.
- **Turns 12–16**: Good that the assistant did not bulldoze through the expert’s collateral/security nuance. It explicitly surfaced the subtype/tool limitation instead of silently encoding a wrong universal relationship.
- **Turns 16–23**: Mixed quality on relationship elicitation. The interviewer repeatedly proposed broad “Loan has X terms” links, and the persona had to keep narrowing them. Prompt could better discourage speculative direct attachments.
- **Turns 20–22**: Nice recovery on `InterestTerms`; the assistant recognized the class was too vague and stopped building on it.
- **Turns 21 / 27 / 37**: Inefficiency from add/update-only tooling. The interviewer repeatedly has to mark things as deprecated instead of actually removing them, leaving graph clutter. Prompt/workflow should probably avoid adding tentative classes before they are stable.
- **Turns 24–26**: Good recognition that the ontology had split into two neighboring object families (`Loan` and `CreditFacility`) and that they should be modeled separately rather than forcibly connected.
- **Turns 28–36**: Property elicitation was generally strong: the interviewer let the expert push structure into classes where needed and flags where appropriate, instead of flattening everything into loan properties.
- **Turns 31–34**: Good catch by the persona that LTV/CLTV belong on `CollateralizedLoan`, not all `SecuredLoan`s. The interviewer handled the correction well.
- **Turns 46–48**: Solid handling of controlled vocabularies: the interviewer asked for allowed values, got a policy-vs-domain distinction, and did not force artificial enums.
- **Turns 48–57**: Rules/actions phase was efficient and appropriately conservative. Good choice to keep servicing readiness as aggregation rather than inventing a mega-rule.
- **Turns 58–60**: Excellent late-stage validation behavior. The interviewer noticed a competency-question/model mismatch and repaired the acceptance test instead of distorting the ontology.
- **Overall**: The biggest optimization opportunity is reducing premature ontology writes. Several classes/relations were added speculatively, then deprecated later because the tool couldn’t delete. A prompt tweak to delay persistence until after local confirmation of a batch would likely improve state cleanliness.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
