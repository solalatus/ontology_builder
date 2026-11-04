# Ontology-recovery eval report

Generated: 2026-11-04T20:45:35.167Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 25-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **31.2%** | **30.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.0% / 60.0% / 53.3% | 58.8% / 50.0% / 54.1% | 12/25 full · 10/17 scoped ground-truth classes matched; 20 recovered |
| Relationship recall / precision / F1 | 20.0% / 20.8% / 20.4% | 29.4% / 20.8% / 24.4% | 5/25 full · 5/17 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 26.3% / 16.1% / 20.0% | 50.0% / 8.1% / 13.9% | 10/38 full · 5/10 scoped ground-truth properties matched; 62 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **39.5%** | **37.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.0% / 65.0% / 57.8% | 58.8% / 50.0% / 54.1% | 13/25 full · 10/17 scoped ground-truth classes matched; 20 recovered |
| Relationship recall / precision / F1 | 40.0% / 41.7% / 40.8% | 52.9% / 37.5% / 43.9% | 10/25 full · 9/17 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 26.3% / 16.1% / 20.0% | 50.0% / 8.1% / 13.9% | 10/38 full · 5/10 scoped ground-truth properties matched; 62 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 15 recovered |
| Action identification recall / precision / F1 | 57.1% / 50.0% / 53.3% | 4/7 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 0.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 9.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 11.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 10.4% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 15 recovered |
| Action identification recall / precision / F1 | 57.1% / 50.0% / 53.3% | 4/7 ground-truth actions matched by name/meaning; 8 recovered |
| Action input-class accuracy | 0.0% | of 4 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 9.8% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 11.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 10.4% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 184 turns, 2431s wall-clock
- Real app-agent API calls: 286 (apply_ontology_yaml called 86× · get_graph_state called 13×)
- Tool outcomes seen in transcript: 86 applied · 2 skipped · 1 no-op · 0 error
- Tokens: 20971349 total (20879522 prompt · 91827 completion) across 470 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 16 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 63–64:** The system warned that “all 17” class meanings was an incorrect edit count, although the interviewer was describing the accumulated state, not the latest edit. The interviewer then issued an unnecessary correction.
- **Turn 122:** An additional ontology edit was skipped by the tool. The interviewer noticed that the action had not been saved and saved it at turn 123; this appears recovered, not an outstanding gap.
- **Turn 88–90:** The recorded rule for *accepting* a supplier response requires an Accepted response and quantities matching the original order. That appears to rule out accepting the partial fulfilment or backordered terms the desk had earlier said it may accept. The interviewer did not test that conflict before recording the rule.
- **Turn 179–180:** A supplier-accepted cancellation of a pending change is recorded by marking the change request **Rejected**. This avoids the Pending-status blocker but conflates cancellation by the desk with rejection of the change request.

## Noteworthy observations

- **Turns 78–80, 96–97:** The interviewer caught two consequential contradictions—absence of a no-commitment quantity does not rule out backorders, and “In Progress” is not an allowed Delivery Status—and narrowed the rules before saving them.
- **Turns 99–110:** Asking what actually proves receipt exposed missing Delivery Evidence, evidence lines, and receipt dates. This was a useful follow-up from an action’s verification requirement.
- **Turns 159–179:** The competency check uncovered a substantial effective-quantity and change-history gap. The interviewer worked through accepted changes, reversals, sequencing, and replay rather than declaring the model complete prematurely, though the long chain was costly.
- **Turns 180–184:** The second-opinion check caught a create-action precondition that required the allowance-or-charge record to exist already. The interviewer corrected the sequence and checked the final state.
- **Turns 145–158:** The bounded scope check resisted several “for completeness” additions while finding one task-relevant Response Description field.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
