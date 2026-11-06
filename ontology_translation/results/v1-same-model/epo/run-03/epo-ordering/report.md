# Ontology-recovery eval report

Generated: 2026-11-06T09:58:24.685Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 25-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **92.1%** | **67.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 68.0% / 81.0% | 25/25 full · 17/17 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 88.0% / 84.6% / 86.3% | 94.1% / 61.5% / 74.4% | 22/25 full · 16/17 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 84.2% / 97.0% / 90.1% | 100.0% / 30.3% / 46.5% | 32/38 full · 10/10 scoped ground-truth properties matched; 33 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **96.1%** | **68.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 100.0% / 100.0% / 100.0% | 100.0% / 68.0% / 81.0% | 25/25 full · 17/17 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 100.0% / 96.2% / 98.0% | 100.0% / 65.4% / 79.1% | 25/25 full · 17/17 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 84.2% / 97.0% / 90.1% | 100.0% / 30.3% / 46.5% | 32/38 full · 10/10 scoped ground-truth properties matched; 33 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 10.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 28.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 71.4% / 71.4% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth actions matched by name/meaning; 7 recovered |
| Action input-class accuracy | 100.0% | of 7 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 10.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 28.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 73 turns, 674s wall-clock
- Real app-agent API calls: 129 (apply_ontology_yaml called 47× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 47 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3600008 total (3564310 prompt · 35698 completion) across 202 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 60:** The interviewer stored five relationship aliases after the expert said they would not maintain fixed aliases. It caught the mistake, asked, and removed them at turn 61.
- **Turns 72–73:** The final replay overstates coverage of questions 3 and 4. The model can retrieve Contract Information and Order Lines, but defines no contract-detail fields or item description for reporting *which* contract information or *what* was ordered (turns 32 and 37).

## Noteworthy observations
- **Turns 23–28:** Good restraint on links: the interviewer adopted “submitted for” rather than wording that implies acceptance, then surfaced the agreement-to-order lookup gap instead of guessing a match.
- **Turns 30 and 65–71:** It kept exact-record matching separate from a lookup method the model does not define, and made missing or wrong links blockers for the seven actions without inventing other preconditions.
- **Turns 72–73:** It correctly left the change-line-to-original-line match open while preserving the narrower ability to list lines contained in a change request.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
