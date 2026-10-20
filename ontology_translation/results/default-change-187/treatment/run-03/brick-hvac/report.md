# Ontology-recovery eval report

Generated: 2026-10-20T17:20:12.550Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **89.8%** | **65.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 87.2% / 100.0% / 93.2% | 100.0% / 52.9% / 69.2% | 34/39 full · 18/18 scoped ground-truth classes matched; 34 recovered |
| Relationship recall / precision / F1 | 88.6% / 91.2% / 89.9% | 89.5% / 50.0% / 64.2% | 31/35 full · 17/19 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 76.2% / 100.0% / 86.5% | 93.8% / 46.9% / 62.5% | 32/42 full · 15/16 scoped ground-truth properties matched; 32 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **91.8%** | **67.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 87.2% / 100.0% / 93.2% | 100.0% / 52.9% / 69.2% | 34/39 full · 18/18 scoped ground-truth classes matched; 34 recovered |
| Relationship recall / precision / F1 | 94.3% / 97.1% / 95.7% | 100.0% / 55.9% / 71.7% | 33/35 full · 19/19 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 76.2% / 100.0% / 86.5% | 93.8% / 46.9% / 62.5% | 32/42 full · 15/16 scoped ground-truth properties matched; 32 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 22.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 57.1% / 57.1% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 22.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 22.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-6-sol` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 101 turns, 1119s wall-clock
- Real app-agent API calls: 167 (apply_ontology_yaml called 56× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 56 applied · 0 skipped · 1 no-op · 0 error
- Tokens: 7950863 total (7900347 prompt · 50516 completion) across 268 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 5 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turns 63–64:** The interviewer treated “office” as an alias for **Space**, although the expert had established it as a kind of space. The first attempted ontology edit found nothing to change; a later edit succeeded, but the transcript does not show whether an incorrect alias had actually been stored.
- **Turns 87–100:** The occupied-zone action initially framed verification as confirming an assigned thermostat was “operating.” The expert clarified that normal status and an appropriate mode establish only **availability to control**, not active conditioning. The interviewer updated the action after the final competency check.

## Noteworthy observations
- **Turns 28–46, 99–101:** Strong restraint around missing connections: the interviewer repeatedly distinguished recorded paths from plausible inferences and reported unanswered questions as model limits rather than fabricating links.
- **Turns 56–74:** The class-definition and field-constraint passes were careful but laborious. Batching more of the closely related confirmations could shorten the interview without sacrificing the distinctions.
- **Turns 90–98:** A late expansion pass uncovered the Building → Zone path and a generic CO₂ point after actions had already been defined. The interviewer justified both with questions and included them in the final audit, but earlier bounded expansion might have avoided the backtrack.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
