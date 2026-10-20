# Ontology-recovery eval report

Generated: 2026-10-20T15:58:18.961Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **70.8%** | **61.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 76.9% / 100.0% / 87.0% | 100.0% / 60.0% / 75.0% | 30/39 full · 18/18 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 42.9% / 48.4% / 45.5% | 52.6% / 32.3% / 40.0% | 15/35 full · 10/19 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 93.8% / 53.6% / 68.2% | 28/42 full · 15/16 scoped ground-truth properties matched; 28 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **86.0%** | **71.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 76.9% / 100.0% / 87.0% | 100.0% / 60.0% / 75.0% | 30/39 full · 18/18 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 85.7% / 96.8% / 90.9% | 94.7% / 58.1% / 72.0% | 30/35 full · 18/19 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 93.8% / 53.6% / 68.2% | 28/42 full · 15/16 scoped ground-truth properties matched; 28 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 14.3% / 16.7% / 15.4% | 1/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 66.7% / 61.5% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 84 turns, 942s wall-clock
- Real app-agent API calls: 136 (apply_ontology_yaml called 43× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 43 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 5549390 total (5505809 prompt · 43581 completion) across 220 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 10 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 16:** The interviewer overrode the expert’s explicit request for distinct outside-air and return-air CO2 sensor kinds, arguing that separate classes would duplicate devices. The expert corrected it, and the interviewer recorded the requested classes at turn 17.
- **Turns 23–34:** The model treated an occupancy sensor’s association with a space and its physical installation in a space as conflicting links. Resolving the warning required removing the installation-location fact. The interviewer preserved the more important association and stated the loss, but this is a real modeling limitation.

## Noteworthy observations

- **Turns 2–7, 21–38:** Strong attention to avoiding unsupported paths: the interviewer kept zone coverage, plant circulation, sensor attribution, and economizer inputs unresolved rather than inferring them from nearby equipment.
- **Turns 50–53:** The interviewer declared the alias checks effectively finished after probing only two groups; the expert then supplied two missed aliases. A broader final alias check would have been more reliable.
- **Turns 53–62, 76–83:** The interview became repetitive: safeguards and neighboring structures were checked in many small batches after the expert had repeatedly confirmed the same boundaries.
- **Turn 84:** The final audit clearly distinguished covered, conditional, and unresolved questions and did not manufacture links to satisfy checker warnings. It was thorough, though much longer than the preceding interview style suggested.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
