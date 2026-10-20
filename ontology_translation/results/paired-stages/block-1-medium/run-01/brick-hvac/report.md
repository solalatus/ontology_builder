# Ontology-recovery eval report

Generated: 2026-10-20T09:36:00.263Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.9%** | **52.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.4% / 100.0% / 72.1% | 72.2% / 59.1% / 65.0% | 22/39 full · 13/18 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 51.4% / 81.8% / 63.2% | 36.8% / 31.8% / 34.1% | 18/35 full · 7/19 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.2% / 100.0% / 62.3% | 62.5% / 52.6% / 57.1% | 19/42 full · 10/16 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **68.2%** | **57.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.4% / 100.0% / 72.1% | 72.2% / 59.1% / 65.0% | 22/39 full · 13/18 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 57.1% / 90.9% / 70.2% | 52.6% / 45.5% / 48.8% | 20/35 full · 10/19 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.2% / 100.0% / 62.3% | 62.5% / 52.6% / 57.1% | 19/42 full · 10/16 scoped ground-truth properties matched; 19 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 20.0% / 16.7% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 18.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 21.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 18.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 18.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 21.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 18.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 78 turns, 1012s wall-clock
- Real app-agent API calls: 132 (apply_ontology_yaml called 30× · get_graph_state called 11×)
- Tool outcomes seen in transcript: 31 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 5815622 total (5780673 prompt · 34949 completion) across 210 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 5 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 48:** An edit created an accidental empty rule, and an additional edit was skipped because only one edit could apply per message. The placeholder was removed at turn 49.
- **Turns 63–69:** The interviewer said the canvas had 23 relationships, but asked about the air-handler-to-terminal-unit relationship twice. It later confirmed that the connection was recorded only once, leaving **one of the 23 relationships apparently unreviewed**.
- **Turn 78:** After the naming pass, rule and action text still referenced old names, including `OccupancySensor.indication`. The interviewer identified the inconsistency but ended the pass without updating those references.

## Noteworthy observations
- **Turns 16–22:** The interviewer carefully separated a relationship the agent needs to look up from an actual space-to-zone assignment, and kept economizer eligibility unresolved rather than inventing sensors or thresholds.
- **Turns 40–50:** It distinguished a temperature-based *need* from permission to command equipment, handled conflicting deadband evidence, and defined verification without claiming command acknowledgment or a valve fault.
- **Turns 57–62:** The requested coverage pass reached all 22 classes and accounted for each newly surfaced candidate in a ledger. It assessed additions against the agreed tasks rather than adding nearby building concepts automatically.
- **Turn 69:** The expert caught the duplicate relationship prompt; the interviewer checked live state and acknowledged that the duplication was in its questions, not on the canvas.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
