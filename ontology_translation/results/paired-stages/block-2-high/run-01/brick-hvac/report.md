# Ontology-recovery eval report

Generated: 2026-10-20T12:29:29.895Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **84.1%** | **65.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 76.9% / 100.0% / 87.0% | 100.0% / 60.0% / 75.0% | 30/39 full · 18/18 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 77.1% / 100.0% / 87.1% | 68.4% / 48.1% / 56.5% | 27/35 full · 13/19 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 64.3% / 100.0% / 78.3% | 87.5% / 51.9% / 65.1% | 27/42 full · 14/16 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **84.1%** | **65.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 76.9% / 100.0% / 87.0% | 100.0% / 60.0% / 75.0% | 30/39 full · 18/18 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 77.1% / 100.0% / 87.1% | 68.4% / 48.1% / 56.5% | 27/35 full · 13/19 scoped ground-truth relationships matched; 27 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 64.3% / 100.0% / 78.3% | 87.5% / 51.9% / 65.1% | 27/42 full · 14/16 scoped ground-truth properties matched; 27 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 23.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 21.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 16.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 71.4% / 71.4% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 23.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 21.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 16.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 124 turns, 1689s wall-clock
- Real app-agent API calls: 205 (apply_ontology_yaml called 57× · get_graph_state called 10×)
- Tool outcomes seen in transcript: 57 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 11419382 total (11348766 prompt · 70616 completion) across 331 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 10 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 57–58:** A checker warning treated “all 30 class meanings are captured” as a claim that the *latest edit* changed 30 items. The interviewer checked the canvas and clarified the count; the warning appears to conflate a total with an edit count.
- **Turns 87–88, 95:** The canvas reported two apparent false positives: economizer verification supposedly read AHU status, and a read-only occupied-zone check supposedly changed occupancy. It also flagged Zone-to-Thermostat navigation despite the agreed reverse lookup on `Thermostat → Zone`. The interviewer explained the warnings rather than changing the ontology to silence them.

## Noteworthy observations

- **Turns 2–6, 20–23:** The interviewer accepted corrections that materially improved the model: separate thermostat and AHU points, successive readings for trends, and distinct setpoint types. It did, however, declare the class pass complete at turn 20 before the expert identified missing setpoints and a heating valve.
- **Turns 32–40:** The interviewer repeatedly sought links for Pump and CO2DifferentialSensor after the expert had established that both were identified-item checks. Leaving them disconnected was right; the repeated probes were inefficient.
- **Turns 96–104:** The systematic coverage pass reached all 30 classes, tracked 16 new candidates, and closed each with a reason rather than silently adding equipment to complete a diagram.
- **Turns 105–124:** The naming pass was orderly and its ledger matches the reported renames. At turn 124 the interviewer also updated three rule/action references after renaming `occupancyReport` to `occupied`; useful maintenance, though beyond a pure naming edit.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
