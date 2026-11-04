# Ontology-recovery eval report

Generated: 2026-11-04T23:14:20.410Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **71.8%** | **67.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 46.2% / 54.5% / 50.0% | 62.5% / 45.5% / 52.6% | 6/13 full · 5/8 scoped ground-truth relationships matched; 11 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 80.0% / 100.0% / 88.9% | 100.0% / 50.0% / 66.7% | 4/5 full · 2/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **77.3%** | **74.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 72.7% / 66.7% | 87.5% / 63.6% / 73.7% | 8/13 full · 7/8 scoped ground-truth relationships matched; 11 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 80.0% / 100.0% / 88.9% | 100.0% / 50.0% / 66.7% | 4/5 full · 2/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 42.9% / 42.9% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 40.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 34.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 100.0% / 100.0% | 7/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 40.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 40.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 34.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 72 turns, 659s wall-clock
- Real app-agent API calls: 117 (apply_ontology_yaml called 34× · get_graph_state called 10×)
- Tool outcomes seen in transcript: 34 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3154716 total (3120642 prompt · 34074 completion) across 190 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 25–27:** The interviewer added **Strategy → Job** after the expert described the strategy as governing the job. The expert corrected the stored direction to **Job → governed by → Strategy**, but the update left the incorrect reverse link on the canvas. The interviewer detected and flagged it, but could not remove it.
- **Turn 69:** The competency recap says question 3 is answerable only while the failed state is current. That limitation is accurate, but it exposes a gap in the original question that had not been surfaced when the connections phase was closed.

## Noteworthy observations

- **Turns 12–20, 22–30:** The interviewer tested proposed classes and links against the agreed questions and actions, accepted the expert’s corrections, and avoided inventing paths for assignment, asset-specific functions, or failure history.
- **Turns 26–31, 69–72:** It kept the incorrect canvas link and unsupported questions visible rather than claiming a clean validation. It also distinguished qualification from actual assignment and action preconditions from post-action verification.
- **Turns 36–41:** The interviewer added work-order task code as useful for consistent identification, then rejected work-order date because no agreed question or action used it. The different inclusion standard is worth tightening.
- **Turns 61–70:** The failure-recording action was modeled with Failure Event as its primary input, but the need to identify the affected asset separately was made an explicit blocking condition only after the final competency check.
- **Turns 1–72:** The structured questioning was careful but lengthy for an interview introduced as “about nine short phases”; several confirmations repeated already-settled distinctions.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
