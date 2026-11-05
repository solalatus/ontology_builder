# Ontology-recovery eval report

Generated: 2026-11-05T01:08:34.444Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **67.4%** | **80.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.6% / 100.0% / 72.3% | 92.9% / 86.7% / 89.7% | 30/53 full · 26/28 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 50.0% / 50.0% / 50.0% | 60.9% / 46.7% / 52.8% | 15/30 full · 14/23 scoped ground-truth relationships matched; 30 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.2%** | **90.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.6% / 100.0% / 72.3% | 92.9% / 86.7% / 89.7% | 30/53 full · 26/28 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 73.3% / 73.3% / 73.3% | 95.7% / 73.3% / 83.0% | 22/30 full · 22/23 scoped ground-truth relationships matched; 30 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 43.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 35.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 43.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 27.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 35.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 93 turns, 1100s wall-clock
- Real app-agent API calls: 144 (apply_ontology_yaml called 42× · get_graph_state called 9×)
- Tool outcomes seen in transcript: 41 applied · 3 skipped · 0 no-op · 0 error
- Tokens: 5462964 total (5414438 prompt · 48526 completion) across 236 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 1 app-agent error turn(s) (toolRoundLimit=1), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 11 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 53:** The interviewer exceeded the per-message tool limit while editing the purchase-order–item relationship. An unintended duplicate link was added; later edits were skipped, leaving the canvas without the agreed single “concerns” link.
- **Turns 66–67:** After acknowledging it could not delete links with its tool, the interviewer asked the persona to remove them. The persona could not access the canvas, so the cleanup remained unresolved.
- **Turns 87–92:** A missing-event rule was added before the interviewer established how to match an occurrence to an event. The persona clarified that subject, date, and type identify only candidate matches; the interviewer then corrected the rule.

## Noteworthy observations
- **Turns 10–20:** The interviewer carefully separated shipment-location roles from physical places and negotiated a workable Freight Container representation without duplicating a physical record. This was precise, though time-consuming.
- **Turns 29–38, 86–92:** The interviewer consistently refused to invent links or infer arrival, storage of particular goods, service applicability, or shipment-wide traceable units from weaker evidence. The final replay made those limits visible.
- **Turns 58–72:** The alias review was thorough but proceeded through many small groups despite repeated “none” answers. A shorter grouped confirmation could have saved turns.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
