# Ontology-recovery eval report

Generated: 2026-10-20T10:06:13.716Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.0%** | **61.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.4% / 100.0% / 64.3% | 75.0% / 66.7% / 70.6% | 27/57 full · 18/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 74.2% / 88.5% / 80.7% | 88.2% / 57.7% / 69.8% | 23/31 full · 15/17 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 69.4% / 94.4% / 80.0% | 90.9% / 27.8% / 42.6% | 34/49 full · 10/11 scoped ground-truth properties matched; 36 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.0%** | **61.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.4% / 100.0% / 64.3% | 75.0% / 66.7% / 70.6% | 27/57 full · 18/24 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 74.2% / 88.5% / 80.7% | 88.2% / 57.7% / 69.8% | 23/31 full · 15/17 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 69.4% / 94.4% / 80.0% | 90.9% / 27.8% / 42.6% | 34/49 full · 10/11 scoped ground-truth properties matched; 36 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 28.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 30.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 60.0% / 50.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 28.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 30.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 151 turns, 1734s wall-clock
- Real app-agent API calls: 225 (apply_ontology_yaml called 56× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 57 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 11581421 total (11523167 prompt · 58254 completion) across 378 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 16 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 71:** An ontology edit was skipped because only one edit could be applied in the message, leaving duplicate rate links temporarily. The interviewer disclosed this and removed the duplicates at turn 72.
- **Turns 120–121:** The interviewer called `maximum advance amount` a **Loan** field, although the persona had placed it on **CreditFacility**. The persona corrected the mistake, and the interviewer’s subsequent ledger used the right class.
- **Turns 119–128:** The **interest-calculation event** entered the candidate ledger, but was not explicitly tested with the persona before being marked declined. That falls short of the requested candidate-by-candidate closure.

## Noteworthy observations

- **Turns 29–44, 102–111:** The interviewer consistently kept missing retrieval paths and evidence sources open rather than inventing links or claiming the checks were executable. The distinction between a defined check and an end-to-end capability was especially clear.
- **Turns 113–128:** The systematic coverage pass reached all 27 classes, but the candidate review was lengthy and occasionally repeated distinctions already established.
- **Turns 129–151:** The naming pass followed the requested order and kept rename counts consistent. The interviewer also clarified that “secured loan” described when a link applies, rather than renaming the entire Loan class.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
