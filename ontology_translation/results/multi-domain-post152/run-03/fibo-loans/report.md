# Ontology-recovery eval report

Generated: 2026-09-02T19:31:13.055Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **60.2%** | **63.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 45.6% / 96.3% / 61.9% | 79.2% / 70.4% / 74.5% | 26/57 full · 19/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 77.4% / 88.9% / 82.8% | 94.1% / 59.3% / 72.7% | 24/31 full · 16/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 22.4% / 91.7% / 36.1% | 45.5% / 41.7% / 43.5% | 11/49 full · 5/11 scoped ground-truth properties matched; 12 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **62.2%** | **66.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.4% / 100.0% / 64.3% | 83.3% / 74.1% / 78.4% | 27/57 full · 20/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 80.6% / 92.6% / 86.2% | 100.0% / 63.0% / 77.3% | 25/31 full · 17/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 22.4% / 91.7% / 36.1% | 45.5% / 41.7% / 43.5% | 11/49 full · 5/11 scoped ground-truth properties matched; 12 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 53.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 69.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 53.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 69.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 65 turns, 744s wall-clock
- Real app-agent API calls: 109 (apply_ontology_yaml called 33× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 33 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4105694 total (4084490 prompt · 21204 completion) across 176 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 5 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**
  - Likely speaker/state bug: `app-user` repeats the persona’s opening statement verbatim, as if the system echoed the persona into the user channel.
- **Turn 4**
  - Tool/application inconsistency: assistant says actions were captured, but immediately notes the tool “won’t fully accept those actions yet,” and a system message says **5 consistency problems unresolved**. The assistant proceeds as if Phase 1 is basically done.
- **Turn 7**
  - Misleading recap: assistant says “Confirmed as distinct classes: `Loan`, `Borrower`, `Lender`, `Servicer`,” but tool says only **3 added**. `Loan` appears to have existed already or was not actually added; recap blurs persisted vs conceptual state.
- **Turn 10**
  - Assistant claims “the tool also correctly flagged that some actions now refer to classes that are not yet connected,” but no such tool output is shown in the transcript.
- **Turn 24–28**
  - Assistant introduces a new `InterestRate` concept/property path before confirming it, then later admits it added a stray extra element and removes `SecuredStatus` at turn 27. This is a real misapplication/overreach the assistant had to clean up.
- **Turn 29–30**
  - Count mismatch: persona confirms **6** properties, but tool reports **0 added, 5 updated**. Either one property was not persisted or the tool summary is inconsistent; assistant does not notice.
- **Turn 32**
  - Assistant says `firstRateChangeTerm` was “captured” as a loan property after a tool update of **0 added, 1 updated**, but that property had not been explicitly confirmed as an existing property beforehand in the shown transcript. Feels like state drift / unannounced prior insertion.
- **Turn 49–50**
  - Assistant claims there is still “one real mismatch” and later “one pre-existing consistency warning somewhere,” but does not surface a concrete check result. This looks like vague state reporting rather than grounded tool output.
- **Turn 56**
  - Validation summary contradicts prior framing by escalating a “likely real issue” with the `InterestPaymentTerm` path, even though the model already had `Loan -> Interest` and `InterestPaymentTerm -> governs... -> Interest`, and the persona had explicitly accepted that path. Assistant seems to conflate tool queryability with ontology validity.
- **Turn 59**
  - Assistant says it “also tightened the `reviewPrepaymentTerms` wording so the earlier warning should now be resolved,” but no user confirmation for a new wording change happened at this turn; this appears to be an unprompted edit or at least an ungrounded claim.
- **Turn 59–61**
  - The assistant adds `UnsecuredLoan`, then discovers the tool cannot support inheritance / dangling-class constraints, then removes it two turns later. This is a workflow bug or prompt failure: it should have checked representability before committing a class that immediately violates tool constraints.

## Noteworthy observations
- **Turn 2**
  - Good technique: starts with competency questions before schema details.
- **Turns 3–6**
  - Efficient handling of action scoping; good that it verified whether all actions target `Loan` instead of assuming.
- **Turn 5**
  - Weak/odd follow-up: asks about “closely related role that actually does the day-to-day work” and “specific operating context.” This feels prompt-driven rather than motivated by the user’s domain, and it didn’t produce useful ontology structure.
- **Turns 7–10**
  - Good recovery on schedule modeling: the assistant notices `PaymentSchedule` is too narrow and drills into separate schedule classes appropriately.
- **Turns 14–18**
  - Strong elicitation move: when the persona rejects direct `Loan -> ...Term` links, the assistant follows the semantic path instead of forcing a shortcut.
- **Turns 19–22**
  - Nice discipline around not inventing `CreditFacility -> Loan` just because it seems plausible.
- **Turn 20**
  - The assistant correctly notices newly introduced concepts (`SubFacility`, `CollateralValueRecord`) and explicitly asks whether they are in scope now vs future extensions.
- **Turns 23–28**
  - Mixed quality: the assistant usefully pushes structural modeling for fixed vs variable rates, but it also drifts into introducing concepts before confirmation and then has to clean up stray additions.
- **Turns 30–31**
  - Good restraint: accepts the persona’s refusal to confirm natural-sounding fields like payment date/amount/status instead of padding the model.
- **Turns 39–47**
  - Rule elicitation is generally strong and grounded in actions, though the assistant repeatedly over-focuses on what the tool can check rather than preserving the ontology semantics cleanly.
- **Turn 41**
  - The assistant’s concern about rule checkability is reasonable, but it nearly pushes the ontology toward tool-oriented reverse links. The persona had to keep it semantically honest.
- **Turns 56–64**
  - Final validation is useful, but overly long and a bit self-contradictory: it mixes “baseline accepted” with repeated warnings of unresolved issues, and some “tool warning” language is not clearly tied to observed tool output.
- **Overall**
  - Positive: the interviewer usually respected the expert’s corrections and avoided many tempting but unconfirmed shortcuts.
  - Negative: several moments show the assistant optimizing for tool constraints/checklist completion over domain fidelity, especially around `InterestPaymentTerm` linkage and `UnsecuredLoan`.
  - Prompt optimization note: the agent would benefit from stricter separation between **conceptual recap** and **persisted ontology state**, because several recaps implied things were recorded/validated when the tool evidence was partial or inconsistent.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
