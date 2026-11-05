# Ontology-recovery eval report

Generated: 2026-11-05T03:39:21.457Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **64.1%** | **80.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 82.1% / 92.0% / 86.8% | 25/53 full · 23/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 43.3% / 54.2% / 48.1% | 56.5% / 54.2% / 55.3% | 13/30 full · 13/23 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **71.5%** | **83.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 47.2% / 100.0% / 64.1% | 82.1% / 92.0% / 86.8% | 25/53 full · 23/28 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 63.3% / 79.2% / 70.4% | 65.2% / 62.5% / 63.8% | 19/30 full · 15/23 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 47.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 32.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 47.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 32.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 88 turns, 881s wall-clock
- Real app-agent API calls: 137 (apply_ontology_yaml called 39× · get_graph_state called 9×)
- Tool outcomes seen in transcript: 39 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4690846 total (4649311 prompt · 41535 completion) across 226 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turns 20, 53–55:** The interviewer added a standing Shipment → Preparation Process relationship, then learned the expert meant only a shipment-specific preparation check. The editing tool could not delete the link, so it remains in the canvas marked **WITHDRAWN — DELETE**. The interviewer correctly stopped relying on it, but the live model still needs cleanup.
- **Turns 51–52:** A system warning twice treated “all 25 class meanings are recorded” as a claim that the latest edit added 25 items. The interviewer had meant the cumulative total and clarified it; the warning appears to be a false positive.

## Noteworthy observations
- **Turns 1–3:** Starting with practical questions and actions gave the interview a useful test for later modeling choices. The interviewer consistently preserved the expert’s warning not to turn an expected arrival into a recorded event or receipt.
- **Turns 21–37:** Follow-ups usefully separated general ontology links from evidence about a *particular* shipment. The interviewer did not invent transport, receipt, storage, or traceability links simply to fill gaps.
- **Turns 40–43, 59–67:** The interview became repetitive: it revisited rejected service-type fields and polled nearly every class and relationship for aliases, mostly receiving “none.” Batching these checks could save turns.
- **Turns 82–88:** The final replay clearly identified answers that remain conditional on external evidence and paused without claiming validation was complete or the withdrawn link had been deleted.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
