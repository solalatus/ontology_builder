# Ontology-recovery eval report

Generated: 2026-10-20T11:29:33.922Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **68.4%** | **61.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 69.2% / 100.0% / 81.8% | 94.4% / 63.0% / 75.6% | 27/39 full · 17/18 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 45.7% / 48.5% / 47.1% | 57.9% / 33.3% / 42.3% | 16/35 full · 11/19 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 61.9% / 100.0% / 76.5% | 87.5% / 53.8% / 66.7% | 26/42 full · 14/16 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **83.2%** | **71.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 69.2% / 100.0% / 81.8% | 94.4% / 63.0% / 75.6% | 27/39 full · 17/18 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 88.6% / 93.9% / 91.2% | 100.0% / 57.6% / 73.1% | 31/35 full · 19/19 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 61.9% / 100.0% / 76.5% | 87.5% / 53.8% / 66.7% | 26/42 full · 14/16 scoped ground-truth properties matched; 26 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 8.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 25.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 57.1% / 57.1% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 8.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 25.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 110 turns, 1728s wall-clock
- Real app-agent API calls: 183 (apply_ontology_yaml called 45× · get_graph_state called 13×)
- Tool outcomes seen in transcript: 45 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 10673728 total (10622350 prompt · 51378 completion) across 295 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 42:** A tool limit allowed the interviewer to remove the reverse-direction thermostat–zone relationship but skipped its replacement, temporarily leaving the live model without that connection. The interviewer disclosed the gap and restored the correct relationship in turn 43.
- **Turns 3, 68:** The original temperature-call question arose in the thermostat/zone context, but the final replay marks it conditionally covered using **air-handler** cooling and heating rules. It notes that thermostat readings are separate without showing a corresponding zone-temperature decision path. The persona accepted the replay, but this looks like a coverage mismatch worth checking.
- **Turns 63, 69:** The saved deadband action initially treated a failed within-band test as “cannot verify,” even when reliable data established the reading was *outside* the band. The final check caught and corrected it.

## Noteworthy observations

- **Turns 21–29, 61–62:** The interviewer consistently separated location, serving, and control associations, and kept the missing zone-to-space assignment explicit rather than inventing a terminal-unit route.
- **Turns 71–88:** The systematic class-by-class pass surfaced candidates the earlier bounded expansion missed. The running ledger accounted for all 16 candidates and avoided adding unrelated plant equipment.
- **Turns 90–110:** The naming pass covered relationships, properties, and classes in manageable groups and preserved distinctions despite standardizing point properties to `value`. The final relationship-direction warnings were explained rather than “fixed” by reversing confirmed facts.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
