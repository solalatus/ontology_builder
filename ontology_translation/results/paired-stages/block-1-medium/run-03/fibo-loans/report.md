# Ontology-recovery eval report

Generated: 2026-10-20T10:58:49.681Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **74.9%** | **57.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.9% / 100.0% / 67.4% | 75.0% / 62.1% / 67.9% | 29/57 full · 18/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 80.6% / 86.2% / 83.3% | 94.1% / 55.2% / 69.6% | 25/31 full · 16/17 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 63.3% / 88.6% / 73.8% | 72.7% / 22.9% / 34.8% | 31/49 full · 8/11 scoped ground-truth properties matched; 35 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **74.9%** | **57.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.9% / 100.0% / 67.4% | 75.0% / 62.1% / 67.9% | 29/57 full · 18/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 80.6% / 86.2% / 83.3% | 94.1% / 55.2% / 69.6% | 25/31 full · 16/17 scoped ground-truth relationships matched; 29 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 63.3% / 88.6% / 73.8% | 72.7% / 22.9% / 34.8% | 31/49 full · 8/11 scoped ground-truth properties matched; 35 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 14.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.6% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 14.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.6% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 137 turns, 1878s wall-clock
- Real app-agent API calls: 216 (apply_ontology_yaml called 57× · get_graph_state called 9×)
- Tool outcomes seen in transcript: 57 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 11654777 total (11598668 prompt · 56109 completion) across 354 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 17 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turns 98–104, 137:** The canvas cannot navigate from a Loan to its governing interest or principal terms via the confirmed reverse lookup. Loan readiness and prepayment review were recorded, but those parts cannot be verified from a Loan input; both warnings remained unresolved.
- **Turn 107:** The interviewer reported an “automated second opinion” with no additional observations, but the visible tool calls at that turn only show two ontology-state checks. The basis for that claim is not visible.

## Noteworthy observations
- **Turns 23–43:** The interviewer resisted inventing direct links to resolve difficult paths, especially for accrued interest, prepayment terms, and collateralized-loan ratios. It recorded the resulting limits rather than treating missing evidence as zero or a pass.
- **Turns 81–82:** A useful follow-up exposed an awkward check: a guarantee-only loan is secured but cannot pass the *collateral-link* check. The interviewer kept that narrow result distinct from judging the guarantee’s validity.
- **Turns 109–115:** The requested class-by-class coverage pass stayed focused on the agreed questions and actions; newly surfaced concepts were declined with reasons rather than added merely because they exist.
- **Turns 116–137:** The naming pass followed the requested order, preserved unchanged names, and updated free-text rule/action references after property renames.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
