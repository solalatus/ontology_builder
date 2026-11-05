# Ontology-recovery eval report

Generated: 2026-11-05T01:50:44.607Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.2%** | **65.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.9% / 100.0% / 69.2% | 87.5% / 58.3% / 70.0% | 36/68 full · 21/24 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 42.6% / 95.8% / 59.0% | 77.8% / 58.3% / 66.7% | 46/108 full · 28/36 scoped ground-truth relationships matched; 48 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 31.5% / 87.5% / 46.4% | 76.0% / 47.5% / 58.5% | 35/111 full · 19/25 scoped ground-truth properties matched; 40 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 87.5% | 83.3% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.6%** | **65.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.9% / 100.0% / 69.2% | 87.5% / 58.3% / 70.0% | 36/68 full · 21/24 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 42.6% / 95.8% / 59.0% | 77.8% / 58.3% / 66.7% | 46/108 full · 28/36 scoped ground-truth relationships matched; 48 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 32.4% / 90.0% / 47.7% | 76.0% / 47.5% / 58.5% | 36/111 full · 19/25 scoped ground-truth properties matched; 40 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 93.8% | 91.7% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 70.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 59.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 39.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 52.4% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 70.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 59.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 39.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 52.4% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 103 turns, 1277s wall-clock
- Real app-agent API calls: 175 (apply_ontology_yaml called 64× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 64 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 7920148 total (7863502 prompt · 56646 completion) across 278 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 11 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 20:** The interviewer recast “runs on infrastructure component” and “uses database” as links to generic Configuration Items, losing the distinct target types the expert had specified. It corrected the model at turn 21.
- **Turn 33:** The assistant response was duplicated verbatim.
- **Turn 98:** The tool reported that an additional ontology edit was skipped, but the interviewer said it had tightened both the communication and notification rules. The transcript does not confirm that both changes persisted.
- **Turn 101:** The interviewer said it had recorded “all 11 actions” when that edit added only three. A system warning prompted a correct total-count clarification at turn 102.
- **Turn 103:** The final replay identifies question 3 as partly unanswered but does not give question 8 the same explicit verdict: the model can trace recent changes and deployments, not determine whether they *contributed* to the incident.

## Noteworthy observations

- **Turns 5–41:** The interviewer consistently tested classes and direct links against the agreed tasks, and accepted explicit model limits rather than inventing relationships—for example, resolver-group eligibility and shared managed-component identity.
- **Turns 63–82:** Asking about relationship aliases one small batch at a time became repetitive after the expert repeatedly said to leave them empty. A grouped confirmation would likely have been more efficient.
- **Turns 94–97:** The interviewer initially sought approval for 11 rules without showing their wording. The expert caught this; reviewing the rules in batches then exposed and corrected overly strict declaration and emergency-change gates.
- **Turns 102–103:** The final replay usefully distinguishes confirmed triggering alerts from merely relevant candidates, preserving the expert’s warning against overstating what the model proves.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
