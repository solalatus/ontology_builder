# Ontology-recovery eval report

Generated: 2026-11-05T06:20:07.242Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **86.6%** | **62.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 64.9% / 100.0% / 78.7% | 87.5% / 56.8% / 68.9% | 37/57 full · 21/24 scoped ground-truth classes matched; 37 recovered |
| Relationship recall / precision / F1 | 93.5% / 96.7% / 95.1% | 100.0% / 56.7% / 72.3% | 29/31 full · 17/17 scoped ground-truth relationships matched; 30 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 75.5% / 100.0% / 86.0% | 100.0% / 29.7% / 45.8% | 37/49 full · 11/11 scoped ground-truth properties matched; 37 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **87.7%** | **62.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 64.9% / 100.0% / 78.7% | 87.5% / 56.8% / 68.9% | 37/57 full · 21/24 scoped ground-truth classes matched; 37 recovered |
| Relationship recall / precision / F1 | 96.8% / 100.0% / 98.4% | 100.0% / 56.7% / 72.3% | 30/31 full · 17/17 scoped ground-truth relationships matched; 30 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 75.5% / 100.0% / 86.0% | 100.0% / 29.7% / 45.8% | 37/49 full · 11/11 scoped ground-truth properties matched; 37 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 16.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 75.0% / 54.5% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 16.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 107 turns, 1290s wall-clock
- Real app-agent API calls: 182 (apply_ontology_yaml called 60× · get_graph_state called 9×)
- Tool outcomes seen in transcript: 61 applied · 3 skipped · 1 no-op · 0 error
- Tokens: 8898355 total (8841841 prompt · 56514 completion) across 289 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 10 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 17–19:** The tool skipped second ontology edits under a one-edit-per-message limit. The interviewer tracked the pending changes and recovered, but the multi-edit attempts cost turns.
- **Turns 91–93:** The setup-readiness action was initially given `loanSetupReady` as a *precondition*, which would stop it running on the loans it needed to assess. The interviewer caught and corrected this.
- **Turns 60–63:** Anticipated payment counts were added to four schedules before their relevance was checked, then removed when the expert confirmed no agreed question or check needed them.

## Noteworthy observations

- **Turns 26–30, 59–63:** The expert had to catch omissions in both concept and property coverage after the interviewer proposed closing those phases. A systematic replay against accepted questions earlier could have avoided the rework.
- **Turns 39–46, 89–97:** The interviewer handled attribution gaps well: it did not attach accrued interest or prepayment terms to a loan without evidence, and made the prepayment check report undetermined applicability.
- **Turns 91–96:** Action design became notably precise once it separated *conditions for running a check* from *conditions for confirming its result*, and distinguished absent records from records that could not be inspected.
- **Turns 106–107:** The final replay clearly distinguished model coverage from answers available in a supplied record, and preserved known gaps rather than treating the checklist as a pass.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
