# Ontology-recovery eval report

Generated: 2026-11-05T03:56:11.521Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **59.7%** | **55.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 43.9% / 92.6% / 59.5% | 70.8% / 63.0% / 66.7% | 25/57 full · 17/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 51.6% / 64.0% / 57.1% | 58.8% / 40.0% / 47.6% | 16/31 full · 10/17 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 49.0% / 85.7% / 62.3% | 90.9% / 35.7% / 51.3% | 24/49 full · 10/11 scoped ground-truth properties matched; 28 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **62.8%** | **58.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 45.6% / 96.3% / 61.9% | 75.0% / 66.7% / 70.6% | 26/57 full · 18/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 58.1% / 72.0% / 64.3% | 64.7% / 44.0% / 52.4% | 18/31 full · 11/17 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 49.0% / 85.7% / 62.3% | 90.9% / 35.7% / 51.3% | 24/49 full · 10/11 scoped ground-truth properties matched; 28 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 40.0% / 33.3% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 30.4% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 60.0% / 50.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 30.4% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 86 turns, 939s wall-clock
- Real app-agent API calls: 136 (apply_ontology_yaml called 43× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 43 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4366118 total (4323516 prompt · 42602 completion) across 222 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 8 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turns 15–17:** The interviewer added **Accrued Interest** before confirming whether the example question was in scope. Once the expert clarified it was not, the edit tool could not delete the entry; the interviewer asked the expert to remove it, but the expert could not edit the canvas. The out-of-scope entry remained.
- **Turns 77–79:** The interviewer initially put the evidence required for confirmation into action preconditions. That could prevent a check from running when evidence was missing—and thus prevent a “not confirmed” report. It noticed and corrected the modeling error.

## Noteworthy observations
- **Turns 1–4:** Starting with 16 real questions and five verification actions gave the interview a clear scope and kept the checks distinct from approvals or changes to loan terms.
- **Turns 27–34, 47–50:** The interviewer resisted inventing links to make answers work. It documented the unresolved prepayment-terms association and treated facility redrawability as only partly answerable.
- **Turns 56–70:** Alias and connection-phrase elicitation became repetitive: five-item batches continued despite repeated “none” answers. A bulk confirmation could have saved many turns.
- **Turns 81–86:** The final replay clearly separated supported answers from gaps and did not claim validation had passed. Some follow-up link questions revisited limits already established, adding little before the final recap.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
