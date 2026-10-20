# Ontology-recovery eval report

Generated: 2026-10-20T13:05:13.760Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.4%** | **59.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.9% | 79.2% / 67.9% / 73.1% | 28/57 full · 19/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 77.4% / 88.9% / 82.8% | 94.1% / 59.3% / 72.7% | 24/31 full · 16/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 63.3% / 100.0% / 77.5% | 63.6% / 22.6% / 33.3% | 31/49 full · 7/11 scoped ground-truth properties matched; 31 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.4%** | **59.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.9% | 79.2% / 67.9% / 73.1% | 28/57 full · 19/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 77.4% / 88.9% / 82.8% | 94.1% / 59.3% / 72.7% | 24/31 full · 16/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 63.3% / 100.0% / 77.5% | 63.6% / 22.6% / 33.3% | 31/49 full · 7/11 scoped ground-truth properties matched; 31 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 20.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 31.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 20.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 31.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 154 turns, 2068s wall-clock
- Real app-agent API calls: 233 (apply_ontology_yaml called 51× · get_graph_state called 12×)
- Tool outcomes seen in transcript: 51 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 13499337 total (13414987 prompt · 84350 completion) across 387 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 15 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 35:** A rename attempted as a removal and replacement hit a one-edit-per-message tool limit, temporarily deleting `BorrowingCapacity`. The interviewer noticed and restored it at turn 36.
- **Turn 113:** The interviewer described Collateral as having a security agreement, implying an outward link that had explicitly been ruled out. The persona corrected the direction at turn 114.

## Noteworthy observations

- **Turns 8–11, 98–108:** The interviewer kept review checks narrow: a guarantee-only loan does not pass a *collateral-link* check, and finding a payment history does not prove payment compliance.
- **Turns 45–78, 117–118:** Persistent probing exposed consequential coverage gaps—no loan attribution for accrued interest, no selection path for prepayment terms, and no established transaction details or schedule entries. The final coverage assessment did not claim those questions were answerable.
- **Turns 119–134:** The requested all-class pass maintained a candidate ledger and resisted adding plausible but unsupported concepts. It also surfaced a late applicability gap: the model cannot independently identify an arbitrary loan as secured before running the collateral-link review.
- **Turns 135–154:** The naming pass followed the requested relationship → property → class order and preserved direction. When asked to narrow ratio-link sources to collateralized loans, the interviewer stated that renaming alone could not change their endpoints.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
