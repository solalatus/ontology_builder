# Ontology-recovery eval report

Generated: 2026-09-03T08:03:37.154Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.9%** | **64.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.6% / 100.0% / 69.0% | 79.2% / 63.3% / 70.4% | 30/57 full · 19/24 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 80.6% / 78.1% / 79.4% | 94.1% / 50.0% / 65.3% | 25/31 full · 16/17 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 34.7% / 85.0% / 49.3% | 81.8% / 45.0% / 58.1% | 17/49 full · 9/11 scoped ground-truth properties matched; 20 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **66.8%** | **65.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.6% / 100.0% / 69.0% | 83.3% / 66.7% / 74.1% | 30/57 full · 20/24 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 80.6% / 78.1% / 79.4% | 94.1% / 50.0% / 65.3% | 25/31 full · 16/17 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 36.7% / 90.0% / 52.2% | 81.8% / 45.0% / 58.1% | 18/49 full · 9/11 scoped ground-truth properties matched; 20 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 51.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 31.4% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 51.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 31.4% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 62 turns, 1114s wall-clock
- Real app-agent API calls: 124 (apply_ontology_yaml called 42× · get_graph_state called 15×)
- Tool outcomes seen in transcript: 42 applied · 3 skipped · 0 no-op · 0 error
- Tokens: 6156632 total (6129981 prompt · 26651 completion) across 191 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3** — Tool/application behavior looks inconsistent: `✓ Applied: 41 added` followed by `✓ Applied: 0 added, 5 updated`, yet the assistant claims it has already “recorded your accepted competency-question set and the tighter 5-action set” while a system message still says **5 consistency problems unresolved**.
- **Turn 6** — Assistant says “The tool now also correctly warns that Loan is not yet connected to Collateral,” but no tool warning is shown in that turn.
- **Turn 8** — Assistant says “Those 12 classes are now added,” but its own recap lists only 9 newly confirmed classes plus 4 “possible additional concepts”; the mapping from user input to exactly 12 added classes is opaque and likely includes silent additions.
- **Turn 11–15** — Real modeling thrash around secured-loan representation:
  - `SecuredForm` added earlier,
  - then persona rejects it,
  - then assistant proposes `SecuredLoan`,
  - then removes `SecuredForm`,
  - later adds `SecuredLoan`,
  - then removes `SecuredLoan`,
  - finally falls back to direct `Loan --hasCollateral--> Collateral`.
  This is not necessarily wrong given tool limits, but it reflects the interviewer adding/removing ontology elements repeatedly before stabilizing.
- **Turn 15** — Per-turn tool limit causes only one edit to apply; assistant leaves the model knowingly incomplete again. Not a prompt error by itself, but a real workflow/tool limitation impacting state consistency.
- **Turn 17** — Assistant says `✓ Applied: 8 added` and lists 2 new classes + 6 relationships, which is coherent, but one of those relationships is `Loan --hasInterestRate--> InterestRate`, even though the assistant had just deferred recording that until after further clarification. Slight state-management slippage.
- **Turn 25** — Assistant claims “The classes still with no relationships are: CreditFacility, InterestObligation,” immediately after having already recorded `CreditFacility --hasSubFacility--> SubFacility` and later `CreditFacility --hasBorrower/hasLender`. This is internally inconsistent about what “no relationships” means.
- **Turn 30** — Tool says `✓ Applied: 0 added, 1 updated` after the assistant records **six** Loan properties. Either the tool summary is misleading or the assistant overstated what was persisted.
- **Turn 40** — Tool says `✓ Applied: 0 added, 9 updated` for a batch of **7** relationship meanings. Count mismatch suggests duplicate/extra unintended updates or reporting inconsistency.
- **Turn 43** — Tool says `✓ Applied: 0 added, 12 updated` for a batch of **8** relationship meanings. Another clear count mismatch.
- **Turn 58** — Assistant says the “automated second-opinion review reported no additional observations,” but the only tool output shown is a standard ontology check; no separate second-opinion review appears in transcript.
- **Turn 58** — Assistant refers to persisted **cq14: “What secured form applies to this loan, if any?”** but that exact normalized question was never explicitly shown in the accepted competency-question list; it appears to have been silently transformed from earlier feedback.
- **Turn 62** — Assistant declares “Everything else discussed in scope has been captured into the live ontology,” despite several earlier places where tool summaries did not obviously reflect all claimed updates; confidence exceeds visible evidence.

## Noteworthy observations
- **Turn 1** — Good start: asks for real questions/actions first, grounding ontology work in acceptance tests before class modeling.
- **Turn 2** — Good normalization move: splits compound questions into atomic competency questions.
- **Turn 2** — Missed follow-up opportunity: when turning “secured or unsecured” into a binary question, the assistant didn’t proactively preserve the expert’s likely need for secured subtypes, which later caused churn.
- **Turn 3** — Good technique: asks a narrow role/context follow-up before moving on.
- **Turn 4–9** — Generally strong phased elicitation: classes are introduced in small justified batches tied back to accepted questions/actions.
- **Turn 5–8** — Good responsiveness to naming/domain refinements (`IndividualPaymentTransaction`, `InterestRateResetSchedule`, split schedule classes, etc.).
- **Turn 10–15** — The secured-loan thread is the most inefficient stretch:
  - assistant had already been warned that “secured form” was delicate,
  - still pushed for direct `Loan -> SecuredLoan`/`Loan -> SecuredForm` constructs,
  - then had to walk them back.
  Prompt could better instruct the agent to pause earlier when the expert signals a subtype/taxonomy issue under tool constraints.
- **Turn 11–15** — Despite the churn, the assistant handled tool constraints transparently and explicitly tracked known incomplete state after skipped edits, which is good operational hygiene.
- **Turn 16–19** — Nice recovery: when the expert reframed terms as governing principal/interest, the assistant noticed two latent concepts (`Principal`, `Interest`) and confirmed them explicitly instead of assuming.
- **Turn 19–21** — Efficient relationship elicitation using compact verb-phrase prompts.
- **Turn 22** — Good discipline: assistant does not silently create “credit limit type” as a class just because it was mentioned.
- **Turn 25–28** — Good example of not forcing graph connectivity just for its own sake; assistant explicitly tests whether a real Loan–CreditFacility link exists instead of inventing one.
- **Turn 29–35** — Property phase is mostly disciplined and well-scoped to decision-bearing fields. Good job separating computed review outcomes from stored properties.
- **Turn 33–34** — Strong handling of tool limitation: assistant explicitly asks for a practical secured indicator because subtype support is absent.
- **Turn 35 onward** — Language-layer capture is thorough but somewhat long-winded. Depending on goals, this may be lower-value compared with deeper validation of competency-question coverage.
- **Turn 43–46** — Good constraint elicitation around fixed choices and operational consequences of wrong/missing values.
- **Turn 44–46** — Another example of prompt/tool mismatch: allowed values “belong on a property, not directly on a class concept,” forcing removal of `RateType` late. The agent did recover, but this restructuring could potentially have been anticipated earlier.
- **Turn 46–52** — Rule/action phase is crisp and useful. The assistant keeps rules narrow and gets the expert to distinguish setup readiness from later payment-tracking checks.
- **Turn 52–57** — Bounded expansion pass is well executed as an explicit question, not silent scope creep. Good reviewer-worthy behavior.
- **Turn 53–56** — However, expansion introduced classes (`CreditEnhancementAgreement`) that remained only weakly integrated. Assistant did at least flag this and confirm the user wanted to keep them.
- **Turn 58–61** — Validation phase is strong in spirit: the assistant explicitly identifies one partial-coverage gap and asks whether to patch it or accept it.
- **Overall** — The interviewer is generally careful, incremental, and good at confirming distinctions. Main optimization opportunities:
  - better anticipation of tool constraints around subtype/taxonomy/enumeration,
  - less overclaiming about what the tool has persisted,
  - tighter reconciliation between tool outputs and assistant summaries,
  - avoid repeated “known incomplete state” cycles when one additional clarification could have prevented intermediate edits.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
