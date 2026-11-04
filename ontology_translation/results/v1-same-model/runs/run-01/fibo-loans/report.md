# Ontology-recovery eval report

Generated: 2026-11-04T21:46:16.180Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **77.4%** | **59.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.9% / 100.0% / 67.4% | 79.2% / 65.5% / 71.7% | 29/57 full · 19/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 74.2% / 79.3% / 76.7% | 88.2% / 51.7% / 65.2% | 23/31 full · 15/17 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 83.7% / 93.2% / 88.2% | 100.0% / 25.0% / 40.0% | 41/49 full · 11/11 scoped ground-truth properties matched; 44 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **80.4%** | **60.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.9% / 100.0% / 67.4% | 79.2% / 65.5% / 71.7% | 29/57 full · 19/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 80.6% / 86.2% / 83.3% | 94.1% / 55.2% / 69.6% | 25/31 full · 16/17 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 85.7% / 95.5% / 90.3% | 100.0% / 25.0% / 40.0% | 42/49 full · 11/11 scoped ground-truth properties matched; 44 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 60.0% / 50.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 16.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 16.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 78 turns, 925s wall-clock
- Real app-agent API calls: 142 (apply_ontology_yaml called 57× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 57 applied · 3 skipped · 0 no-op · 0 error
- Tokens: 4283493 total (4238607 prompt · 44886 completion) across 220 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 8 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 19:** An ontology edit was skipped because the message attempted more than one edit. The interviewer acknowledged the class additions but did not identify what the skipped edit contained.
- **Turns 35–39:** Loan and agreement fields were entered before confirmation. Later, two edits were skipped at turn 38, and the interviewer had to correct its claim that `initialExchangeDate` had been added. The obsolete `initialFundingDate` fields remained alongside it.
- **Turns 74–75:** The fifth check was initially given the wrong pass condition: it required a determination that a prepayment penalty applied, rather than checking only whether the period was recorded. The expert corrected it, and the edit was updated.

## Noteworthy observations

- **Turns 27–34, 77:** The interviewer handled an unsupported question well: it did not invent a link from a loan to accrued interest, kept the amount question explicitly unsupported, and declined to call the model fully validated.
- **Turns 9–10:** The expert mentioned that an amortizing loan needs an amortization schedule. The interviewer noticed this might imply a sixth check, but never returned to resolve it.
- **Turns 48–69:** The meanings-and-aliases pass was careful but disproportionately long; many turns confirmed that no aliases existed. Batching these questions could shorten the interview.
- **Turns 59–78:** Preferred labels and superseded fields remained unresolved in the canvas. The interviewer tracked the cleanup accurately and avoided duplicate entries, but the final artifact still needs manual correction.
- **Turns 11 and 73:** Assistant text was duplicated within each turn, adding noise without advancing the interview.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
