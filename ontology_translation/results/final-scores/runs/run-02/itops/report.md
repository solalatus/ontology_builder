# Ontology-recovery eval report

Generated: 2026-10-20T19:35:13.756Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.7%** | **64.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 58.8% / 100.0% / 74.1% | 87.5% / 52.5% / 65.6% | 40/68 full · 21/24 scoped ground-truth classes matched; 40 recovered |
| Relationship recall / precision / F1 | 51.9% / 96.6% / 67.5% | 88.9% / 55.2% / 68.1% | 56/108 full · 32/36 scoped ground-truth relationships matched; 58 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 39.6% / 93.6% / 55.7% | 84.0% / 44.7% / 58.3% | 44/111 full · 21/25 scoped ground-truth properties matched; 47 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 95.0% | 91.7% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **66.2%** | **64.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 58.8% / 100.0% / 74.1% | 87.5% / 52.5% / 65.6% | 40/68 full · 21/24 scoped ground-truth classes matched; 40 recovered |
| Relationship recall / precision / F1 | 51.9% / 96.6% / 67.5% | 88.9% / 55.2% / 68.1% | 56/108 full · 32/36 scoped ground-truth relationships matched; 58 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.5% / 95.7% / 57.0% | 88.0% / 46.8% / 61.1% | 45/111 full · 22/25 scoped ground-truth properties matched; 47 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 95.0% | 91.7% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 81.8% / 81.8% / 81.8% | 9/11 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.6% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.6% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 137 turns, 2015s wall-clock
- Real app-agent API calls: 235 (apply_ontology_yaml called 86× · get_graph_state called 9×)
- Tool outcomes seen in transcript: 86 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 14334659 total (14267122 prompt · 67537 completion) across 372 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 11 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 24–25 and 123–124:** The system flagged “all 34” and “all 11” as incorrect by comparing total canvas counts with changes made in a single turn. The interviewer clarified the totals; these appear to be **false-positive count warnings**, not failed edits.
- **Turns 90–99:** The interviewer repeatedly said it had “captured” missing-or-wrong-value consequences, but no canvas edits are shown in those turns. If those consequences were meant to persist in the ontology, their recording is unverified.

## Noteworthy observations

- **Turns 2–4, 28–30, 41–42:** The interviewer consistently tested distinctions before adding links or rules—for example, channel delivery versus confirmed disruption, documented dependencies versus configuration-item scope, and emergency-change justification versus a change that resolved an incident.
- **Turns 113–120:** Canvas warnings prompted useful follow-ups about alert routing, restore verification, and change-workflow evidence. The interviewer kept external checks visible instead of inventing graph links.
- **Turns 75–99 and 124–133:** The alias, missing-value, and missing-items passes became highly repetitive. Larger batches or a shorter confirmation pass could likely preserve the same safeguards with fewer turns.
- **Turns 134–137:** The final replay clearly separated modeled paths from live or workflow-held verification, and the interviewer checked automated objections with the expert rather than silently changing valid status lists.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
