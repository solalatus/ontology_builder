# Ontology-recovery eval report

Generated: 2026-10-20T16:16:44.842Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **68.6%** | **55.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.9% | 70.8% / 60.7% / 65.4% | 28/57 full · 17/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 74.2% / 85.2% / 79.3% | 76.5% / 48.1% / 59.1% | 23/31 full · 13/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 46.9% / 85.2% / 60.5% | 72.7% / 29.6% / 42.1% | 23/49 full · 8/11 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **68.6%** | **55.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.9% | 70.8% / 60.7% / 65.4% | 28/57 full · 17/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 74.2% / 85.2% / 79.3% | 76.5% / 48.1% / 59.1% | 23/31 full · 13/17 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 46.9% / 85.2% / 60.5% | 72.7% / 29.6% / 42.1% | 23/49 full · 8/11 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 20.0% / 16.7% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 35.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 17.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 35.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 99 turns, 1070s wall-clock
- Real app-agent API calls: 162 (apply_ontology_yaml called 51× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 51 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 6892819 total (6847196 prompt · 45623 completion) across 261 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 12 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 79–82:** The interviewer initially made `loanReadinessConfirmed` a precondition for the readiness review. That would prevent the diagnostic action from running when evidence was missing—the case it needs to report. It caught and corrected the error.
- **Turns 80–84, 99:** The canvas warned that actions could not navigate backward from Interest or Principal to governing terms. The expert confirmed the *intended* reverse lookup but said system support was an implementation question. The interviewer left the warnings unresolved while treating the lookup as workable; those actions may still need an implementation check.
- **Turn 99:** The final answer cites an “automated second opinion” with no corresponding invocation visible in the transcript.

## Noteworthy observations

- **Turns 3–10, 73–78:** The interviewer consistently separated recorded facts from check-specific requirements. It preserved conditional rules—for example, requiring a reset schedule for the variable-rate review without requiring every optional rate detail.
- **Turns 40–45, 98–99:** It did not invent an accrued-interest-to-loan association or payment allocations and due amounts to make two questions appear answerable. The final recap clearly marks both gaps open.
- **Turns 41–43, 63–72:** Elicitation became repetitive: it revisited the unresolved accrued-interest association after the expert declined to define it, then checked missing-or-wrong behavior value by value. Grouping those checks could shorten the interview without losing the distinctions.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
