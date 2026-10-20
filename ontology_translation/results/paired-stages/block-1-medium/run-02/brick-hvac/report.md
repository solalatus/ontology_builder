# Ontology-recovery eval report

Generated: 2026-10-20T10:25:31.613Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **70.5%** | **60.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.4% / 100.0% / 72.1% | 77.8% / 63.6% / 70.0% | 22/39 full · 14/18 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 60.0% / 100.0% / 75.0% | 47.4% / 42.9% / 45.0% | 21/35 full · 9/19 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 47.6% / 100.0% / 64.5% | 75.0% / 60.0% / 66.7% | 20/42 full · 12/16 scoped ground-truth properties matched; 20 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **70.5%** | **63.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.4% / 100.0% / 72.1% | 77.8% / 63.6% / 70.0% | 22/39 full · 14/18 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 60.0% / 100.0% / 75.0% | 57.9% / 52.4% / 55.0% | 21/35 full · 11/19 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 47.6% / 100.0% / 64.5% | 75.0% / 60.0% / 66.7% | 20/42 full · 12/16 scoped ground-truth properties matched; 20 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 25.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 23.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 16.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 71.4% / 71.4% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 25.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 23.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 16.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 97 turns, 1041s wall-clock
- Real app-agent API calls: 159 (apply_ontology_yaml called 42× · get_graph_state called 11×)
- Tool outcomes seen in transcript: 42 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 7012308 total (6974080 prompt · 38228 completion) across 256 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 40–42, 73:** Automated warnings treated “all 22 classes have meanings” as a claim about how many items the latest edit changed. The interviewer spent turns correcting a count that was already a cumulative total.
- **Turns 63–65, 73–75:** Two consistency-checker warnings about the read-only occupied-zone action remained unresolved in the model. The expert confirmed that reverse lookup through `Thermostat → serves → Zone` is valid, but the interviewer could only explain away the warnings, not clear them.

## Noteworthy observations

- **Turns 2–34:** The interviewer consistently preserved important distinctions—serving versus location, control points versus physical parts, and an available setpoint versus the active one—without inventing BAS readings or commands.
- **Turns 35–47:** Eliciting meanings for every class and connection was thorough but laborious; the repeated batches made this a notably long phase.
- **Turns 72–74:** Replaying the recorded questions surfaced a missing basis for the CO₂ recommendation and corrected the deadband action’s verification: later drift does not invalidate a decision justified at the time.
- **Turns 76–97:** The requested coverage and naming passes kept explicit ledgers and avoided adding concepts merely because they existed. The coverage pass did, however, ask about **Zone** twice (turns 76 and 81).

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
