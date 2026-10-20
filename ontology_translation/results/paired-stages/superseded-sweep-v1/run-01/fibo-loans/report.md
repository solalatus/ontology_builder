# Ontology-recovery eval report

Generated: 2026-10-20T08:52:27.050Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 57-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **61.8%** | **67.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 43.9% / 100.0% / 61.0% | 79.2% / 76.0% / 77.6% | 25/57 full · 19/24 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 77.4% / 96.0% / 85.7% | 94.1% / 64.0% / 76.2% | 24/31 full · 16/17 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 26.5% / 72.2% / 38.8% | 63.6% / 38.9% / 48.3% | 13/49 full · 7/11 scoped ground-truth properties matched; 18 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **61.8%** | **67.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 43.9% / 100.0% / 61.0% | 79.2% / 76.0% / 77.6% | 25/57 full · 19/24 scoped ground-truth classes matched; 25 recovered |
| Relationship recall / precision / F1 | 77.4% / 96.0% / 85.7% | 94.1% / 64.0% / 76.2% | 24/31 full · 16/17 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 26.5% / 72.2% / 38.8% | 63.6% / 38.9% / 48.3% | 13/49 full · 7/11 scoped ground-truth properties matched; 18 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 60.0% / 50.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 80.0% / 80.0% / 80.0% | 4/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 13.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.4% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 13.5% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 21.4% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 121 turns, 1306s wall-clock
- Real app-agent API calls: 196 (apply_ontology_yaml called 53× · get_graph_state called 10×)
- Tool outcomes seen in transcript: 54 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 8851614 total (8805706 prompt · 45908 completion) across 317 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 8 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 22:** A second ontology edit was skipped because only one edit could be applied per message. The interviewer noticed the resulting duplicate schedule question and removed it at turn 23.
- **Turns 98–102:** After checking the canvas, the interviewer reported **26 classes**, then corrected the count to **25** partway through the coverage pass.
- **Turns 96–97:** Automated review found that all five actions used their *passing conditions* as prerequisites for running the checks. The interviewer corrected the actions so missing evidence can produce a failed or unresolved result.

## Noteworthy observations
- **Turns 29–43:** The interviewer repeatedly revisited the missing Loan → Prepayment Terms path after the expert said it was unknown. The eventual loan-specific logical value was useful, but the repeated questions added little.
- **Turns 75–88:** The interviewer preserved important boundaries: missing evidence is not evidence of inapplicability; checks do not approve credit or prove funding; and reverse lookup of interest terms does not reverse the business relationship.
- **Turns 98–104:** The requested class-by-class coverage pass was grouped efficiently and ended with a ledger. It surfaced no new candidates, though it substantially repeated an earlier bounded expansion pass.
- **Turns 105–121:** The naming pass covered relationships, properties, then classes in small groups, retained unchanged names, and updated references after renaming.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
