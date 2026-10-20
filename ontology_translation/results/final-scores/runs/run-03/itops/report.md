# Ontology-recovery eval report

Generated: 2026-10-20T20:40:43.189Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **60.6%** | **70.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.5% / 100.0% / 65.3% | 87.5% / 63.6% / 73.7% | 33/68 full · 21/24 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 45.4% / 98.0% / 62.0% | 86.1% / 62.0% / 72.1% | 49/108 full · 31/36 scoped ground-truth relationships matched; 50 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 37.8% / 97.7% / 54.5% | 88.0% / 51.2% / 64.7% | 42/111 full · 22/25 scoped ground-truth properties matched; 43 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 87.5% | 83.3% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **60.6%** | **70.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.5% / 100.0% / 65.3% | 87.5% / 63.6% / 73.7% | 33/68 full · 21/24 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 45.4% / 98.0% / 62.0% | 86.1% / 62.0% / 72.1% | 49/108 full · 31/36 scoped ground-truth relationships matched; 50 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 37.8% / 97.7% / 54.5% | 88.0% / 51.2% / 64.7% | 42/111 full · 22/25 scoped ground-truth properties matched; 43 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 93.8% | 91.7% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 72.7% / 80.0% / 76.2% | 8/11 ground-truth rules matched (core condition equivalence, not name alone); 10 recovered |
| Action identification recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 9 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 33.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 28.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 32.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth rules matched (core condition equivalence, not name alone); 10 recovered |
| Action identification recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 9 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 33.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 28.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 32.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 114 turns, 1870s wall-clock
- Real app-agent API calls: 202 (apply_ontology_yaml called 75× · get_graph_state called 11×)
- Tool outcomes seen in transcript: 75 applied · 3 skipped · 0 no-op · 0 error
- Tokens: 11670664 total (11604963 prompt · 65701 completion) across 316 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 8 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 5–6, 35:** System warnings treated correct cumulative totals (“17 questions,” “all 33 classes”) as errors because they compared them with the *latest edit’s* count. The interviewer spent turns correcting a count that was already right.
- **Turns 26, 99, 113:** The tool skipped additional edits because it applies only one edit per message. The interviewer disclosed the skips and later revisited the changes; no unresolved skipped edit is apparent.

## Noteworthy observations

- **Turns 23–24, 27–28:** Good restraint: the interviewer revised an unanswerable configuration-item question and left resolver-group selection dependent on authoritative routing, rather than inventing graph links.
- **Turns 109–112:** Three acceptance-test gaps surfaced only in the final replay: “all associated active alerts,” general safe use of runbooks/workarounds, and which corrective-action statuses count as open. Earlier follow-ups could have exposed these sooner.
- **Turns 53–62, 100–108:** The synonym batches and repeated “No, covered” expansion checks made the interview lengthy for relatively few changes. Batching or a shorter confirmation pass would be more efficient.
- **Turns 87–89, 94–95:** Action consistency checks caught genuine navigation assumptions about alert routing and restore verification. The interviewer kept the required external checks instead of adding unsupported relationships.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
