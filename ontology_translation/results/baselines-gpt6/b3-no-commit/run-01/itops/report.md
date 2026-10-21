# Ontology-recovery eval report

Generated: 2026-10-20T23:32:57.356Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **0.0%** | **0.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/68 full · 0/24 scoped ground-truth classes matched; 0 recovered |
| Relationship recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/108 full · 0/36 scoped ground-truth relationships matched; 0 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/111 full · 0/25 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **0.0%** | **0.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/68 full · 0/24 scoped ground-truth classes matched; 0 recovered |
| Relationship recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/108 full · 0/36 scoped ground-truth relationships matched; 0 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/111 full · 0/25 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/11 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/11 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/11 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/11 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 165 turns, 1465s wall-clock
- Real app-agent API calls: 165 (apply_ontology_yaml called 0× · get_graph_state called 0×)
- Tool outcomes seen in transcript: 0 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 10302916 total (10212193 prompt · 90723 completion) across 333 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 165 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 46–47, 61–64, 107:** The interviewer repeatedly states that the model cannot represent *Security event* as a kind of *Event*. With no graph or schema access shown, that is an unverified tool limitation. It appropriately leaves the restricted relationships open, but overstates why they are open.
- **Turn 106:** It proposes **Incident response team coordinates Incident** again after the expert had explicitly restricted the target to **Major incident** at turn 43. The interviewer accepts the correction at turn 107, but this is a state-tracking lapse.
- **Turn 165:** Calling the model **“known-incomplete”** conflates unresolved design and workflow gaps with unverified persistence. The interviewer cannot establish what is in the live ontology.

## Noteworthy observations

- **Turns 1–13:** The interviewer usefully separates questions from the seven conditional actions, but spends many turns repeatedly splitting and reconfirming the initial examples.
- **Turns 33–36, 49–52, 143–147:** Strong boundary-setting: it distinguishes recorded relationships from authorization checks and does not invent sources for resolver-group support, commander assignment, recovery targets, or approvals.
- **Turns 92–124:** The exhaustive, small-batch definitions and alias pass preserves important distinctions, but is costly. Larger batches or a draft for targeted correction could be more efficient.
- **Turns 163–165:** It correctly refuses to claim live-graph validation. After learning no export was available, it could still have offered a concise conversation-level specification or validation checklist as a handoff.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
