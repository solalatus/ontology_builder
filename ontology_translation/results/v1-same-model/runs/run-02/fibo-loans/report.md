# Ontology-recovery eval report

Generated: 2026-11-04T23:45:11.048Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **66.5%** | **52.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.4% / 93.1% / 62.8% | 70.8% / 58.6% / 64.2% | 27/57 full · 17/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 58.1% / 60.0% / 59.0% | 70.6% / 40.0% / 51.1% | 18/31 full · 12/17 scoped ground-truth relationships matched; 30 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 71.4% / 85.4% / 77.8% | 100.0% / 26.8% / 42.3% | 35/49 full · 11/11 scoped ground-truth properties matched; 41 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **68.7%** | **55.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.4% / 93.1% / 62.8% | 79.2% / 65.5% / 71.7% | 27/57 full · 19/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 64.5% / 66.7% / 65.6% | 70.6% / 40.0% / 51.1% | 20/31 full · 12/17 scoped ground-truth relationships matched; 30 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 71.4% / 85.4% / 77.8% | 100.0% / 26.8% / 42.3% | 35/49 full · 11/11 scoped ground-truth properties matched; 41 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 60.0% / 60.0% / 60.0% | 3/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 19.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 60.0% / 50.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 2 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 19.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 95 turns, 1026s wall-clock
- Real app-agent API calls: 157 (apply_ontology_yaml called 54× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 54 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 5458231 total (5410112 prompt · 48119 completion) across 252 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 5 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 33:** After adding Prepayment Terms as a separate entry, the interviewer asked the persona to remove it from the canvas. The persona could not edit the canvas; the interviewer later repaired the representation by annotating the entry instead.
- **Turns 77–78:** Renaming the collateral relationship added a second link rather than replacing the first. The interviewer caught the mistake and marked the old link as legacy, but both entries remain and must not be counted as separate evidence.
- **Turns 91–93:** The interviewer initially proposed verifying checks by rereading saved findings, then left the actions without conditions for a confirmed result. The persona corrected both points; the interviewer revised the rules and actions to require comparison with source records.

## Noteworthy observations

- **Turns 14–17:** The interviewer called the class list complete before checking it against the original questions. The persona surfaced missing obligations, accrued interest, day-count convention, and valuation measures; the interviewer acknowledged the premature conclusion.
- **Turns 23–43:** Careful link elicitation avoided plausible but unsupported connections, particularly Loan → Credit Facility, Loan → Security Agreement, and Loan → Accrued Interest.
- **Turns 61–83:** The language pass established useful distinctions, but reviewing nearly every class and link meaning in separate batches made the interview lengthy.
- **Turns 94–95:** The final replay against the original questions was effective: it identified the unresolved security-agreement support claim and accrued-interest association rather than declaring the model complete.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
