# Ontology-recovery eval report

Generated: 2026-09-02T16:44:18.396Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **0.0%** | **0.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/39 full · 0/18 scoped ground-truth classes matched; 0 recovered |
| Relationship recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/35 full · 0/19 scoped ground-truth relationships matched; 0 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/42 full · 0/16 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **0.0%** | **0.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/39 full · 0/18 scoped ground-truth classes matched; 0 recovered |
| Relationship recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/35 full · 0/19 scoped ground-truth relationships matched; 0 recovered (subclass/"is a" predicates excluded from both -- see README) |
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

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 2 turns, 16s wall-clock
- Real app-agent API calls: 3 (apply_ontology_yaml called 0× · get_graph_state called 1×)
- Tool outcomes seen in transcript: 0 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 41307 total (40739 prompt · 568 completion) across 6 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 1 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: The app echoes the persona’s opening statement back as `app-user`, suggesting a transcript/tooling duplication or role-handling bug.
- **Turn 1**: Assistant says “starting from a blank model” immediately after only “Checked the current ontology state.” If the tool actually knows state, the conclusion is ungrounded unless the check explicitly returned blank.
- **Turn 2**: Assistant says “before I record them,” implying nothing has been stored yet; not necessarily wrong, but it risks state ambiguity after framing the questions as already “captured.”

## Noteworthy observations
- **Turn 1**: Good interview structure: explicitly stages the process (questions → actions → ontology elements), which helps manage scope.
- **Turn 1**: Strong first prompt asks for naturally phrased “real questions,” likely to elicit useful competency questions.
- **Turn 2**: Useful normalization of the user’s examples into generalized competency questions without over-formalizing them.
- **Turn 2**: Good confirmation step before committing edits; reduces silent misinterpretation.
- **Turn 2**: Slightly inefficient to ask for 5–10 questions and then immediately rephrase all 10 for confirmation in one block; could instead acknowledge and record first, then refine selectively.
- **Turn 2**: Missed an obvious domain follow-up on the last question (“Can economizer operation be used here…”) because “given situation” is underspecified; could have asked what factors matter (OA temp/enthalpy, humidity, lockouts, occupancy, plant state).
- **Turn 2**: Several questions imply distinct relation types the interviewer could flag explicitly for later modeling (serves, upstream-of, associated-with, located-in, part-of, belongs-to, control-association), but it doesn’t yet surface that structure.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
