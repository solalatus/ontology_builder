# Ontology-recovery eval report

Generated: 2026-10-20T11:59:32.201Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.6%** | **63.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.1% / 100.0% / 71.9% | 79.2% / 59.4% / 67.9% | 32/57 full · 19/24 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 90.3% / 90.3% / 90.3% | 94.1% / 51.6% / 66.7% | 28/31 full · 16/17 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 51.0% / 100.0% / 67.6% | 90.9% / 40.0% / 55.6% | 25/49 full · 10/11 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.6%** | **63.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.1% / 100.0% / 71.9% | 79.2% / 59.4% / 67.9% | 32/57 full · 19/24 scoped ground-truth classes matched; 32 recovered |
| Relationship recall / precision / F1 | 90.3% / 90.3% / 90.3% | 94.1% / 51.6% / 66.7% | 28/31 full · 16/17 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 51.0% / 100.0% / 67.6% | 90.9% / 40.0% / 55.6% | 25/49 full · 10/11 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 60.0% / 60.0% / 60.0% | 3/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 21.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 19.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 60.0% / 50.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 21.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 19.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 114 turns, 1640s wall-clock
- Real app-agent API calls: 183 (apply_ontology_yaml called 42× · get_graph_state called 10×)
- Tool outcomes seen in transcript: 42 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 9980894 total (9914410 prompt · 66484 completion) across 298 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 1 caught, 9 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 84:** The boolean-field correction remains unresolved in the live export: allowed values still appear as quoted `"true"` and `"false"`. The interviewer flags the type mismatch but closes validation without confirming it is fixed.
- **Turn 93:** The coverage ledger is corrected only at the end, after two candidates were omitted from its running counts. The final totals reconcile, but the requested running candidate list was not reliably maintained.

## Noteworthy observations

- **Turns 85–88:** The interviewer initially planned to skip classes previously discussed, despite the request to cover *every* class, then corrected course. Its next question still framed the inquiry around the “agreed questions and checks,” contrary to the requested open-ended discovery; later groups improved on this.
- **Turns 74–75:** Good restraint on navigation warnings: the interviewer confirmed a reverse lookup for interest terms rather than inventing a reverse-direction relationship, and kept supplied prepayment terms separate from loan-specific applicability.
- **Turns 99–100:** The interviewer caught that `hasSchedule` was an odd name for a link to an event and asked for confirmation before applying the expert’s explicit preference. This preserved the requested wording, though the resulting name could mislead readers.
- **Across turns 1–84:** The interview is careful about missing evidence and unsupported links, but repeatedly reconfirms small groups of fields and conditions. The result is a very long elicitation for the stated scope.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
