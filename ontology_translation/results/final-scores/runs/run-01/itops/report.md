# Ontology-recovery eval report

Generated: 2026-10-20T18:23:05.592Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **46.6%** | **64.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 38.2% / 100.0% / 55.3% | 83.3% / 76.9% / 80.0% | 26/68 full · 20/24 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 31.5% / 97.1% / 47.6% | 63.9% / 65.7% / 64.8% | 34/108 full · 23/36 scoped ground-truth relationships matched; 35 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 24.3% / 77.1% / 37.0% | 60.0% / 42.9% / 50.0% | 27/111 full · 15/25 scoped ground-truth properties matched; 35 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 91.7% | 90.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **46.6%** | **64.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 38.2% / 100.0% / 55.3% | 83.3% / 76.9% / 80.0% | 26/68 full · 20/24 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 31.5% / 97.1% / 47.6% | 63.9% / 65.7% / 64.8% | 34/108 full · 23/36 scoped ground-truth relationships matched; 35 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 24.3% / 77.1% / 37.0% | 60.0% / 42.9% / 50.0% | 27/111 full · 15/25 scoped ground-truth properties matched; 35 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 91.7% | 90.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 81.8% / 90.0% / 85.7% | 9/11 ground-truth rules matched (core condition equivalence, not name alone); 10 recovered |
| Action identification recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 48.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 29.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 34.4% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth rules matched (core condition equivalence, not name alone); 10 recovered |
| Action identification recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 48.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 29.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 34.4% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 101 turns, 1418s wall-clock
- Real app-agent API calls: 177 (apply_ontology_yaml called 63× · get_graph_state called 10×)
- Tool outcomes seen in transcript: 63 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 8985270 total (8934902 prompt · 50368 completion) across 278 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 12 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 35:** The tool skipped an additional ontology edit because it applies only one edit per message. The interviewer noticed and added the omitted workaround connections at turn 36.
- **Turn 100:** The replay says failover verifies the *actual deployment environment and plan used*, but the action agreed at turn 91 specified verification of service health and critical transactions. It did not explicitly record or verify those two additional outcomes.

## Noteworthy observations

- **Turns 26–28, 31–33, 40–42:** The interviewer caught tempting but invalid inferences—automatic resolver-group selection, a stored failover target, channel disruption, and who is currently on call—and narrowed questions rather than inventing relationships.
- **Turns 56–76:** The terminology and missing-value passes were thorough but lengthy. Batching more of the straightforward alias and field checks could make the interview more efficient.
- **Turns 84–86:** The expert declined an `approved`-status gate for emergency-change execution and communication sending. The interviewer respected that boundary, but these safety-sensitive choices warranted a brief explicit confirmation of how approval is enforced before execution.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
