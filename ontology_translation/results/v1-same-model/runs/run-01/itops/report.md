# Ontology-recovery eval report

Generated: 2026-11-04T22:44:38.942Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **54.4%** | **66.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.5% / 100.0% / 65.3% | 87.5% / 63.6% / 73.7% | 33/68 full · 21/24 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 38.0% / 91.1% / 53.6% | 75.0% / 60.0% / 66.7% | 41/108 full · 27/36 scoped ground-truth relationships matched; 45 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 30.6% / 79.1% / 44.2% | 80.0% / 46.5% / 58.8% | 34/111 full · 20/25 scoped ground-truth properties matched; 43 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 88.2% | 83.3% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **54.4%** | **66.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.5% / 100.0% / 65.3% | 87.5% / 63.6% / 73.7% | 33/68 full · 21/24 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 38.0% / 91.1% / 53.6% | 75.0% / 60.0% / 66.7% | 41/108 full · 27/36 scoped ground-truth relationships matched; 45 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 30.6% / 79.1% / 44.2% | 80.0% / 46.5% / 58.8% | 34/111 full · 20/25 scoped ground-truth properties matched; 43 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 94.1% | 91.7% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 63.6% / 33.3% / 43.7% | 7/11 ground-truth rules matched (core condition equivalence, not name alone); 21 recovered |
| Action identification recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 9 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 30.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 90.9% / 47.6% / 62.5% | 10/11 ground-truth rules matched (core condition equivalence, not name alone); 21 recovered |
| Action identification recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 9 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 30.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 147 turns, 2089s wall-clock
- Real app-agent API calls: 279 (apply_ontology_yaml called 107× · get_graph_state called 24×)
- Tool outcomes seen in transcript: 107 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 15530842 total (15459975 prompt · 70867 completion) across 426 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 32–34:** The interviewer added two relationships in the reverse of the expert’s preferred direction, then added the preferred links without removing the originals. The reverse links remain on the canvas as superseded duplicates.
- **Turns 52, 104, 146–147:** Approval and submission were initially modeled as separate fields on Communications and Regulatory notifications. The expert later clarified that each record has one authoritative `status` field, but the old fields could not be deleted. A rule now says to ignore them; the final response rightly notes that enforcement remains untested.
- **Turn 146:** An ontology edit was skipped because only one edit could be applied per message. The interviewer noticed and retried it successfully at turn 147.

## Noteworthy observations

- **Turns 1–132:** The interviewer anchored the model in ten practical questions and ten actions, and consistently separated candidate-finding links from authorization, execution, and verified outcomes. That discipline was particularly useful for recovery, reporting, and closure.
- **Turns 91–100:** Asking for relationship aliases in repeated batches of five produced mostly “none.” A single grouped confirmation would likely have captured the same information much faster.
- **Turns 133–146:** The final replay found useful gaps—current on-call identification, additional-alert correlation, recovery-option suitability, and deployment execution status—but only after extensive modeling. An earlier replay could have surfaced these sooner.
- **Turns 125–130:** The interviewer accepted corrections to action inputs rather than forcing its assumptions: failover and stakeholder updates target the incident, while restore targets the backup set.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
