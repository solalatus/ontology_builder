# Ontology-recovery eval report

Generated: 2026-11-05T05:29:46.057Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **84.0%** | **67.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 71.8% / 100.0% / 83.6% | 88.9% / 57.1% / 69.6% | 28/39 full · 16/18 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 88.6% / 100.0% / 93.9% | 89.5% / 54.8% / 68.0% | 31/35 full · 17/19 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 59.5% / 100.0% / 74.6% | 81.3% / 52.0% / 63.4% | 25/42 full · 13/16 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **84.0%** | **67.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 71.8% / 100.0% / 83.6% | 88.9% / 57.1% / 69.6% | 28/39 full · 16/18 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 88.6% / 100.0% / 93.9% | 89.5% / 54.8% / 68.0% | 31/35 full · 17/19 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 59.5% / 100.0% / 74.6% | 81.3% / 52.0% / 63.4% | 25/42 full · 13/16 scoped ground-truth properties matched; 25 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 28.6% / 28.6% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 23.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 13.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 42.9% / 42.9% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 23.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 13.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 107 turns, 1218s wall-clock
- Real app-agent API calls: 176 (apply_ontology_yaml called 56× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 56 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 7981963 total (7930402 prompt · 51561 completion) across 283 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 8 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 32–35:** The interviewer dismissed a checker warning about two opposing Space–Occupancy Sensor links as a false alarm. It later discovered the tool permits only one directed link per class pair and removed the physical-location link. The final model reflects the expert’s choice, but the earlier edit and diagnosis were wrong.
- **Turns 36–37:** An ontology edit retained **“is installed in”** as an alias after the expert rejected that wording for an outside-air sensor. A second edit was skipped by the tool; the interviewer noticed and removed the alias on the next turn.

## Noteworthy observations

- **Turns 2–4, 25–26, 32–33:** The interviewer consistently tested whether a connection supported the proposed conclusion. This kept thermostat-to-zone control, terminal-unit-to-space service, and physical location from being conflated.
- **Turns 19–22:** Asking whether the class list was complete surfaced five missing setpoint kinds and an occupancy sensor before the relationship phase.
- **Turns 53–69:** The one-by-one passes over definitions, aliases, and missing-value consequences were careful but lengthy; batching more of this review could reduce turns without losing the distinctions.
- **Turns 87–105:** The bounded expansion found useful additions, but adding two new acceptance questions just before validation extended the interview substantially.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
