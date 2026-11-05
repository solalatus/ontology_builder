# Ontology-recovery eval report

Generated: 2026-11-05T00:13:26.515Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **69.1%** | **59.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.3% / 97.6% / 74.5% | 87.5% / 50.0% / 63.6% | 41/68 full · 21/24 scoped ground-truth classes matched; 42 recovered |
| Relationship recall / precision / F1 | 54.6% / 92.2% / 68.6% | 83.3% / 46.9% / 60.0% | 59/108 full · 30/36 scoped ground-truth relationships matched; 64 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 48.6% / 94.7% / 64.3% | 88.0% / 38.6% / 53.7% | 54/111 full · 22/25 scoped ground-truth properties matched; 57 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 82.6% | 84.6% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **69.5%** | **59.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.3% / 97.6% / 74.5% | 87.5% / 50.0% / 63.6% | 41/68 full · 21/24 scoped ground-truth classes matched; 42 recovered |
| Relationship recall / precision / F1 | 54.6% / 92.2% / 68.6% | 83.3% / 46.9% / 60.0% | 59/108 full · 30/36 scoped ground-truth relationships matched; 64 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 49.5% / 96.5% / 65.5% | 92.0% / 40.4% / 56.1% | 55/111 full · 23/25 scoped ground-truth properties matched; 57 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 82.6% | 84.6% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 84.6% / 91.7% | 11/11 ground-truth rules matched (core condition equivalence, not name alone); 13 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 42.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 50.6% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 84.6% / 91.7% | 11/11 ground-truth rules matched (core condition equivalence, not name alone); 13 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 42.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 31.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 50.6% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 104 turns, 1594s wall-clock
- Real app-agent API calls: 201 (apply_ontology_yaml called 82× · get_graph_state called 14×)
- Tool outcomes seen in transcript: 82 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 11266124 total (11203767 prompt · 62357 completion) across 305 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 9:** An ontology edit was skipped because only one edit could be applied per message. The interviewer noticed and added the missing ServiceDesk class at turn 10.
- **Turns 23–24, 36–37:** The interviewer added `MonitoringRule → evaluatedBy → MonitoringTool`, then accepted that it was misleading. Its tool could not delete the link; it remains on the live canvas. Asking the persona to remove it did not help because the persona had no canvas access.
- **Turns 41–44:** The interviewer added a general `Incident.classification` field, then learned that only `category` was established as a general field. The unwanted field also could not be deleted.
- **Turn 38:** The assistant response contains a duplicated summary and two versions of the same restore question.
- **Turns 38–40, 104:** `Change → justified by → Incident` and `SecurityOperations → monitors → Event` are stored on general classes, although the expert restricted them to emergency changes and security events. The interviewer carried those qualifications in prose, but the live links alone do not enforce them.

## Noteworthy observations

- **Turns 1–3:** Starting with ten questions and then eleven guarded actions gave the interview a useful acceptance test. The interviewer consistently distinguished recorded links from approvals, causal findings, and proof that an action succeeded.
- **Turns 18–35:** The interviewer often proposed direct links explicitly as questions and accepted deliberate omissions. This helped avoid treating dependency as confirmed impact or candidate recovery resources as safe to use.
- **Turns 54–77:** The class- and relationship-alias pass took 24 turns. Small batches were careful, but a consolidated table would likely have captured the same wording more efficiently.
- **Turns 95–103:** The competency replay surfaced important gaps—definitively correlated later alerts, confirmed channel impact, next on-call assignment, and technical-record identity—but only after the lengthy alias and action passes. An earlier replay could have exposed them sooner.
- **Turns 36–37, 104:** The interviewer ultimately reported the three undeletable canvas items and qualified the result as a draft rather than claiming clean validation.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
