# Ontology-recovery eval report

Generated: 2026-11-04T23:25:51.158Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **69.2%** | **80.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.6% / 100.0% / 72.3% | 85.7% / 80.0% / 82.8% | 30/53 full · 24/28 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 53.3% / 57.1% / 55.2% | 65.2% / 53.6% / 58.8% | 16/30 full · 15/23 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **69.2%** | **80.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 56.6% / 100.0% / 72.3% | 85.7% / 80.0% / 82.8% | 30/53 full · 24/28 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 53.3% / 57.1% / 55.2% | 65.2% / 53.6% / 58.8% | 16/30 full · 15/23 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 60.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 36.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 46.6% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 60.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 36.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 46.6% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 73 turns, 633s wall-clock
- Real app-agent API calls: 118 (apply_ontology_yaml called 36× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 36 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3401350 total (3369025 prompt · 32325 completion) across 191 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 8 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turns 7–8, 14, 16, 29–30:** The interviewer added classes before confirming they served the agreed tasks. Six were later marked out of scope, but the tool could not delete them and the persona could not edit the canvas. The final live model therefore retains unwanted entries.
- **Turns 65–66:** The blocking-rule recap omitted the shipment’s **ship-to location** from the receipt requirements, despite the rule including it. The persona caught the omission, and the interviewer clarified it.

## Noteworthy observations
- **Turns 20–25, 40–41, 72–73:** Strong distinction between a planned route or assigned carrier and evidence of actual arrival or movement. The interviewer left unsupported conclusions open rather than inventing links or fields.
- **Turns 35–37, 72–73:** Several original questions remain only partly answerable: most service coverage cannot be tied to a particular activity, and the evidence format needed to confirm arrival is undefined. The final review states these limits clearly.
- **Turns 47–59:** The alias pass asked many near-identical questions, mostly receiving “none.” Batching these would shorten an interview initially described as roughly nine short phases.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
