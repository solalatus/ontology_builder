# Ontology-recovery eval report

Generated: 2026-10-20T13:41:48.944Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **81.8%** | **63.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 84.6% / 100.0% / 91.7% | 100.0% / 54.5% / 70.6% | 33/39 full · 18/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 65.7% / 71.9% / 68.7% | 73.7% / 43.8% / 54.9% | 23/35 full · 14/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 73.8% / 100.0% / 84.9% | 93.8% / 48.4% / 63.8% | 31/42 full · 15/16 scoped ground-truth properties matched; 31 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **90.7%** | **68.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 84.6% / 100.0% / 91.7% | 100.0% / 54.5% / 70.6% | 33/39 full · 18/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 91.4% / 100.0% / 95.5% | 94.7% / 56.3% / 70.6% | 32/35 full · 18/19 scoped ground-truth relationships matched; 32 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 73.8% / 100.0% / 84.9% | 93.8% / 48.4% / 63.8% | 31/42 full · 15/16 scoped ground-truth properties matched; 31 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 27.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 26.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 60.0% / 50.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 27.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 26.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 125 turns, 2080s wall-clock
- Real app-agent API calls: 212 (apply_ontology_yaml called 56× · get_graph_state called 12×)
- Tool outcomes seen in transcript: 57 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 12860507 total (12787351 prompt · 73156 completion) across 338 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 12 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turns 25–89:** The interviewer kept both occupancy-sensor reporting and mounting-location connections despite a duplicate-pair warning. At turn 88 it recognized the export permits only one connection per class pair, then removed the mounting-location link at turn 89. The conflict was resolved, but much later than it could have been.
- **Turns 46–47:** An ontology edit was skipped because only one edit could be applied per message. The interviewer disclosed the temporary duplicate sensor representation and removed the old class on the next turn.
- **Turns 80–102:** Validation continued to flag reverse navigation from Zone to its serving Thermostat. The interviewer treated those warnings as harmless without demonstrating that the recorded action can perform that lookup. The warning remains unresolved.

## Noteworthy observations

- **Turns 17–32:** Strong discipline around evidence: the interviewer kept service, physical location, and upstream feeds distinct, and left unsupported plant and zone paths unresolved rather than inventing links.
- **Turns 91–101:** The requested 33-class coverage pass maintained a candidate ledger and closed every surfaced item. Only Floor level number passed the requirements test.
- **Turns 103–125:** The naming pass followed the requested order and group sizes, with counts matching the edits. It correctly left **HX** unadded because the pass prohibited additions.
- **Throughout:** The interview was careful but repetitive. Many turns reconfirmed settled distinctions; batching related value-boundary and terminology questions could shorten the session without relaxing its evidence rules.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
