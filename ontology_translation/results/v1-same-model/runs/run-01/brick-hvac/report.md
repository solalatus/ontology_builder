# Ontology-recovery eval report

Generated: 2026-11-04T21:04:32.562Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **60.3%** | **51.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 82.1% / 97.0% / 88.9% | 100.0% / 54.5% / 70.6% | 32/39 full · 18/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 40.0% / 36.8% / 38.4% | 52.6% / 26.3% / 35.1% | 14/35 full · 10/19 scoped ground-truth relationships matched; 38 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.2% / 65.5% / 53.5% | 68.8% / 37.9% / 48.9% | 19/42 full · 11/16 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **86.0%** | **62.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 84.6% / 100.0% / 91.7% | 100.0% / 54.5% / 70.6% | 33/39 full · 18/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 94.3% / 86.8% / 90.4% | 89.5% / 44.7% / 59.6% | 33/35 full · 17/19 scoped ground-truth relationships matched; 38 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 64.3% / 93.1% / 76.1% | 81.3% / 44.8% / 57.8% | 27/42 full · 13/16 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 14.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 57.1% / 57.1% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 14.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 87 turns, 1062s wall-clock
- Real app-agent API calls: 151 (apply_ontology_yaml called 51× · get_graph_state called 12×)
- Tool outcomes seen in transcript: 51 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 6014147 total (5961584 prompt · 52563 completion) across 241 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 9 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 38–39:** Earlier edits left three misleading links on the canvas. The interviewer could only mark them **“REMOVE—do not use,”** not delete them, so the live model remained unsafe to use without that warning.
- **Turns 79–84:** The occupied-zone action initially gated the *check* on evidence needed only for a successful normal result. That would have prevented it from reporting unknown occupancy or a faulty thermostat. The interviewer caught and corrected this in turn 84.
- **Turn 83:** A second ontology edit was skipped because only one edit can apply per message. The interviewer disclosed the pending correction rather than claiming it had succeeded.
- **Turn 80:** A system warning misread “all 16 questions” as a claim about items added in the last edit. The interviewer clarified the counts in turn 81.

## Noteworthy observations

- **Turns 17–34:** The interviewer consistently tested whether plausible connections were *recorded* before adding them. This preserved important limits around the plenum path, zone-to-terminal-unit lookup, and plant sensors.
- **Turns 68–80:** It separated evidence required for a particular command from fields required on every record, and distinguished issuing a command from verifying its effect.
- **Turns 5–67:** Elicitation was meticulous but lengthy, with many single-category confirmation rounds. Batching related names and definitions could reduce turns without relaxing the connection checks.
- **Turns 81–85:** The final test surfaced a question the model could not answer as phrased; the interviewer narrowed it with the expert and paused with the checklist explicitly open rather than declaring completion.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
