# Ontology-recovery eval report

Generated: 2026-11-05T02:53:55.414Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **79.1%** | **62.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 57.9% / 94.3% / 71.7% | 87.5% / 60.0% / 71.2% | 33/57 full · 21/24 scoped ground-truth classes matched; 35 recovered |
| Relationship recall / precision / F1 | 96.8% / 88.2% / 92.3% | 100.0% / 50.0% / 66.7% | 30/31 full · 17/17 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 61.2% / 90.9% / 73.2% | 100.0% / 33.3% / 50.0% | 30/49 full · 11/11 scoped ground-truth properties matched; 33 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **81.5%** | **62.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 57.9% / 94.3% / 71.7% | 87.5% / 60.0% / 71.2% | 33/57 full · 21/24 scoped ground-truth classes matched; 35 recovered |
| Relationship recall / precision / F1 | 96.8% / 88.2% / 92.3% | 100.0% / 50.0% / 66.7% | 30/31 full · 17/17 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 67.3% / 100.0% / 80.5% | 100.0% / 33.3% / 50.0% | 33/49 full · 11/11 scoped ground-truth properties matched; 33 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 40.0% / 33.3% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 44.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 26.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 44.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 26.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 89 turns, 938s wall-clock
- Real app-agent API calls: 147 (apply_ontology_yaml called 45× · get_graph_state called 12×)
- Tool outcomes seen in transcript: 45 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 5608444 total (5564680 prompt · 43764 completion) across 239 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 32–33, 47:** The interviewer added a general `Loan → collateralized by → Collateral` link despite the expert specifying a **secured loan**. It later added the narrower link, but the overbroad one remained because the tool could not delete it.
- **Turns 55–56, 80–81:** The expert clarified that a secured loan can be supported by a third-party guarantee, yet the recorded secured-loan check requires collateral to be linked. That leaves the check’s scope inconsistent for guarantee-only secured loans.
- **Turns 48–49, 85:** The interviewer acknowledged that the canvas cannot navigate from **Collateralized Loan** through **Secured Loan** to its collateral, then described questions 11–14 as supported in the final replay. The ratio-to-collateral evidence path remains unresolved.
- **Turns 85–86:** After repeatedly stating that deletion was unavailable, the interviewer asked the persona to remove obsolete entries directly. The persona had no canvas access, so the request could not advance validation.

## Noteworthy observations

- **Turns 7–8, 27, 68, 74:** Corrections and a preferred rename accumulated superseded classes and duplicate links. The interviewer disclosed each cleanup need rather than silently treating the entries as valid, but the add/update-only workflow left the canvas unclean.
- **Turns 28–32, 81–84:** Strong handling of the prepayment gap: the interviewer did not invent a link to applicable terms or mark the review confirmed from an unrelated penalty period.
- **Turns 62–79:** The language and fixed-choice passes were careful but inefficient, using many turns to confirm mostly empty alias and choice lists. Larger batches could have shortened the interview.
- **Turns 85–89:** The final handoff clearly listed pending deletions and withheld final validation, though several closing turns repeated the same stopping point.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
