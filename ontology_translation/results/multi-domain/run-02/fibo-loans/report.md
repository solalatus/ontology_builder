# Ontology-recovery eval report

Generated: 2026-08-22T17:17:35.855Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.7%** | **59.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 38.6% / 100.0% / 55.7% | 75.0% / 81.8% / 78.3% | 22/57 full · 18/24 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 64.5% / 74.1% / 69.0% | 82.4% / 51.9% / 63.6% | 20/31 full · 14/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 34.7% / 100.0% / 51.5% | 45.5% / 29.4% / 35.7% | 17/49 full · 5/11 scoped ground-truth properties matched; 17 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **59.9%** | **60.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 38.6% / 100.0% / 55.7% | 75.0% / 81.8% / 78.3% | 22/57 full · 18/24 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 67.7% / 77.8% / 72.4% | 88.2% / 55.6% / 68.2% | 21/31 full · 15/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 34.7% / 100.0% / 51.5% | 45.5% / 29.4% / 35.7% | 17/49 full · 5/11 scoped ground-truth properties matched; 17 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 69.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 35.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 69.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 35.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 60 turns, 621s wall-clock
- Real app-agent API calls: 110 (apply_ontology_yaml called 25× · get_graph_state called 25×)
- Tool outcomes seen in transcript: 25 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4937998 total (4916726 prompt · 21272 completion) across 228 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 10 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: Transcript labeling bug: the persona’s opening statement at turn 0 is duplicated as `app-user` at turn 1.
- **Turn 3**: Assistant says the tool flagged a structural issue about missing input class names, but does not clearly resolve or name the exact issue before moving on; then a system message says 5 consistency problems remain unresolved.
- **Turn 5**: Assistant says updating actions to `Loan` “fixed the earlier structural error,” but later much more action/input cleanup is still needed. This looks overstated/inaccurate.
- **Turn 10–13**: Assistant asks for `Loan → SecurityAgreement`, gets “remove as stated,” but later records `Collateral --isSecuredByAgreement--> SecurityAgreement` at turn 21 without explicitly proposing/confirming that exact direction/name first. The induced edge is plausible but was not cleanly elicited.
- **Turn 21**: Assistant recap says it recorded 6 relationships, including `Collateral --isSecuredByAgreement--> SecurityAgreement`, but tool says 7 added; one item is omitted from recap (`CreditFacility --hasSubFacility--> CreditFacility`), suggesting state-tracking sloppiness.
- **Turn 23–24**: Real bug: assistant acknowledges the incorrect self-loop `CreditFacility --hasSubFacility--> CreditFacility` should be removed, but does not actually remove it and carries it as a lingering live-model issue to the end.
- **Turn 31–33**: Assistant had earlier accepted `reviewVariableRateSetup` as about reset scheduling info, then nudges toward `resetFrequency`/`nextResetDate`; user rejects. Not a hard bug, but the assistant pushed properties not grounded in prior confirmed scope.
- **Turn 34–36**: Assistant records `InterestPaymentTerms`/`PrincipalRepaymentTerms` properties as `text for now` for frequencies without explicit confirmation of datatype at that moment; later user does confirm free text generally, so this is minor but slightly presumptive.
- **Turn 48–51**: Assistant notices missing navigable link from `Loan` to `InterestPaymentTerms` only very late, despite that gap being implied much earlier by the readiness action. State/coverage checking was delayed.
- **Turn 59**: Assistant’s validation says “Open issues remain, so I should not call the interview complete yet” solely because of missing `Loan -> PrincipalRepaymentTerms`, but ignores that the self-loop bug is still unresolved and was known much earlier. Prioritization is odd.

## Noteworthy observations
- **Turn 1**: Good start: asks for acceptance-test style domain sentence and concrete competency questions rather than fields.
- **Turn 2**: Efficient move to atomic competency questions, though the assistant does not show the actual split, making it hard to verify.
- **Turn 3**: Good narrowing prompt for roles and operating context; kept the user focused on two specific follow-up points.
- **Turn 4–10**: Strong class elicitation flow overall. Assistant repeatedly proposes a small batch, asks keep/remove, and follows naming corrections well.
- **Turn 6–8**: Good handling of over-merged concepts (`PaymentSchedule`, `InterestRateResetSetup`, `PaymentEntry`). Assistant adapts to domain distinctions instead of forcing generic names.
- **Turn 8–10**: Nice catch that “security support” was broader than collateral and needed a better class name; good follow-up to get `SecurityAgreement`.
- **Turn 10–20**: Relationship phase is thorough but somewhat inefficient. The assistant repeatedly proposes overly direct `Loan → X` links, gets corrected, then later asks for direct links again “for tool checkability.” This pattern is productive but verbose and cyclical.
- **Turn 12**: Good transparency about tool limitation (“does not support subclassing”) and asking the user to choose a practical modeling workaround.
- **Turn 14–18**: Good elicitation of directionality (“terms govern payment of…”) rather than assuming all relations originate from the loan.
- **Turn 20–24**: Good recovery on isolated classes by asking what they connect to. This prevented dead classes from remaining unattached.
- **Turn 21–24**: The assistant handles the self-loop warning responsibly by confirming whether it was intended, but inability to remove it is a significant tooling/prompt limitation.
- **Turn 29–33**: Good resistance handling when the user rejects status-flag properties (`securedStatus`, `rateType`, `servicingPhase`). Assistant incorporates the conceptual distinction rather than arguing.
- **Turn 30–31**: Important observation for prompt optimization: the assistant itself notices an action/model mismatch (`verify secured loan support` without a secured-status field). This is exactly the kind of consistency check the agent should do earlier and more often.
- **Turn 32–34**: Good example of deriving properties from business checks rather than generic schedule metadata; the user’s “presence of reset schedule + loan-level rate-change terms” answer was well surfaced.
- **Turn 34–37**: Missed obvious follow-up: user removed `paymentDate` and `paymentAmount` from `IndividualPaymentTransaction`, which is counterintuitive for a payment record. Assistant accepted without probing why, even though this weakens the usefulness of that class.
- **Turn 38–45**: Language layer is handled efficiently in batches; good practice to collect definitions and aliases after structural modeling.
- **Turn 46–58**: Rule elicitation is solid. Assistant pushes from vague business phrasing to model-expressible conditions and catches when direct navigable links are needed for operational checks.
- **Turn 49–50**: Good distinction between business rule expression and extra tool-navigation links. This is one of the stronger moments in the interview.
- **Turn 55–58**: Good catch that `reviewPrepaymentTerms` was defined on `Loan` but structurally lived on `PrepaymentTerms`; assistant resolves by asking whether to change action input vs add a navigable path.
- **Turn 59–60**: Final validation pass is useful and skimmable, but it exposes that the model is intentionally loan-centric while the competency questions were phrased as “loan or credit agreement.” This scope-boundary should likely have been forced much earlier rather than left to the end.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
