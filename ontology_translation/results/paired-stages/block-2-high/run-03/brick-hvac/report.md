# Ontology-recovery eval report

Generated: 2026-10-20T14:19:49.192Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **41.7%** | **31.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 84.6% / 100.0% / 91.7% | 100.0% / 54.5% / 70.6% | 33/39 full · 18/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 31.4% / 35.5% / 33.3% | 31.6% / 19.4% / 24.0% | 11/35 full · 6/19 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/42 full · 0/16 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **61.9%** | **44.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 84.6% / 100.0% / 91.7% | 100.0% / 54.5% / 70.6% | 33/39 full · 18/18 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 88.6% / 100.0% / 93.9% | 84.2% / 51.6% / 64.0% | 31/35 full · 16/19 scoped ground-truth relationships matched; 31 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/42 full · 0/16 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 65 turns, 794s wall-clock
- Real app-agent API calls: 104 (apply_ontology_yaml called 25× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 25 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3975694 total (3934721 prompt · 40973 completion) across 174 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 10:** The interviewer says the five actions have been “recorded,” but no action-writing tool call appears. It later says actions have not been modeled (turns 43–49).
- **Turns 43–48:** The interviewer treats four intentionally standalone classes as a blocker to all further modeling. Even after the expert confirms they are retrieved by identity and have no documented links, it repeatedly ends the work instead of proceeding with properties, rules, and actions while preserving that limitation.
- **Turns 46–47:** Despite a direct request for a class-by-class coverage pass, the interviewer refuses to start it, citing the unfinished relationship pass. It leaves the requested ledger undone.
- **Turns 59–60:** During a naming-only pass that specified use of the rename tool and no additions, the interviewer uses an edit tool to add alternatives, including *storey*. These were not class renames.

## Noteworthy observations

- **Turns 2–8:** The interviewer efficiently breaks operational questions into traceable paths and checks important limits: location versus service, reported position versus proven response, and potential plant impact versus confirmed failure.
- **Turns 30–32:** It initially keeps two Space–Occupancy Sensor links despite a duplicate warning, then checks the live state and resolves the collision with the expert. The retained link correctly represents whose reading applies, not mounting location.
- **Turns 35–42:** It consistently avoids inventing zone membership, sensor-to-equipment links, economizer thresholds, or BAS command authority. Those are useful safeguards, though the later insistence that every class have a relationship becomes counterproductive.
- **Turns 50–65:** The naming pass is orderly, covers the stated relationships and classes in batches, and ends with the requested ledger.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
