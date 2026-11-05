# Ontology-recovery eval report

Generated: 2026-11-05T02:37:12.392Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **67.7%** | **80.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 96.3% / 65.0% | 78.6% / 81.5% / 80.0% | 26/53 full · 22/28 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 53.3% / 64.0% / 58.2% | 65.2% / 60.0% / 62.5% | 16/30 full · 15/23 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **67.7%** | **80.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 96.3% / 65.0% | 78.6% / 81.5% / 80.0% | 26/53 full · 22/28 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 53.3% / 64.0% / 58.2% | 65.2% / 60.0% / 62.5% | 16/30 full · 15/23 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 66.7% / 72.7% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 42.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 34.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 47.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 66.7% / 72.7% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 6 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 42.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 34.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 47.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 73 turns, 789s wall-clock
- Real app-agent API calls: 120 (apply_ontology_yaml called 37× · get_graph_state called 9×)
- Tool outcomes seen in transcript: 37 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3464718 total (3428529 prompt · 36189 completion) across 193 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 3:** The interviewer’s response repeats the same paragraph and question verbatim.
- **Turns 21–23, 53–55:** Three case-specific associations were added as ontology edges, then the expert clarified they were not confirmed standing links. The interviewer could only mark the edges “UNCONFIRMED,” not remove them, leaving a canvas that an edge-only reader could misinterpret.
- **Turn 54:** After discovering those disputed edges, the interviewer asked the expert to remove them from the canvas without first establishing that the expert had edit access. The expert could not.

## Noteworthy observations

- **Turns 1–6, 62–68:** The interviewer efficiently grounded the model in actual questions and five distinct actions, then kept action-time checks separate from requirements on every record.
- **Turns 25–34:** Repeated probing of shipment-specific service, storage, and traceability links established sensible “don’t infer” boundaries, but became repetitive after the expert said no standard link or evidence source was known.
- **Turns 43–57:** The lengthy definition and link-meaning pass surfaced the standing-link mistake, but only after the problematic edges had been added.
- **Turns 1, 69–71:** “Where’s my order?” was the opening example, yet its intended answer was not clarified until the final replay. That late follow-up usefully exposed same-date tracking ties and the distinction between arrival and receipt.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
