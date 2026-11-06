# Ontology-recovery eval report

Generated: 2026-11-06T17:10:39.662Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **23.2%** | **30.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 35.3% / 85.7% / 50.0% | 66.7% / 57.1% / 61.5% | 24/68 full · 16/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 3.7% / 8.7% / 5.2% | 5.6% / 4.3% / 4.9% | 4/108 full · 2/36 scoped ground-truth relationships matched; 46 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 9.9% / 26.8% / 14.5% | 32.0% / 19.5% / 24.2% | 11/111 full · 8/25 scoped ground-truth properties matched; 41 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 97.1% | 96.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **28.5%** | **38.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 38.2% / 92.9% / 54.2% | 75.0% / 64.3% / 69.2% | 26/68 full · 18/24 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 12.0% / 28.3% / 16.9% | 25.0% / 19.6% / 22.0% | 13/108 full · 9/36 scoped ground-truth relationships matched; 46 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 9.9% / 26.8% / 14.5% | 32.0% / 19.5% / 24.2% | 11/111 full · 8/25 scoped ground-truth properties matched; 41 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 99.9% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 18.2% / 13.3% / 15.4% | 2/11 ground-truth rules matched (core condition equivalence, not name alone); 15 recovered |
| Action identification recall / precision / F1 | 81.8% / 90.0% / 85.7% | 9/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 88.9% | of 9 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 23.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 18.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 18.2% / 13.3% / 15.4% | 2/11 ground-truth rules matched (core condition equivalence, not name alone); 15 recovered |
| Action identification recall / precision / F1 | 81.8% / 90.0% / 85.7% | 9/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 88.9% | of 9 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 23.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 18.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-6-sol` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-6-sol`
- Stopped: **stages_complete**, after 163 turns, 2124s wall-clock
- Real app-agent API calls: 270 (apply_ontology_yaml called 93× · get_graph_state called 13×)
- Tool outcomes seen in transcript: 93 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 18912507 total (18824967 prompt · 87540 completion) across 433 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 9 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors

- **Turn 25–26:** A dependency correction left two incorrect `dependsOnItservice` links on the live canvas alongside the intended forward link. The tool skipped a second edit, and the interviewer reported it could not delete links. The contradiction remained at the final check.
- **Turn 109–111:** The interviewer recorded seven actions as having confirmed checks and described them as executable, but later found that **Contain Incident** lacked a readable readiness check and **Send Stakeholder Communication** lacked a pre-send recipient list. It subsequently qualified both actions rather than treating them as fully autonomous.
- **Turn 150–152:** After adding **Incident Commander**, the interviewer checked its alias but never elicited its class definition, despite saying every class had a plain-language meaning.

## Noteworthy observations

- **Turn 97–98, 114–115, 126–128:** Strong consistency checks caught contradictory Backup Set status requirements, an invented “Assigned” Incident status, and an invented “Major Incident” status before encoding them.
- **Turn 134–137, 143–146:** The late validation replay exposed consequential data gaps: the service-to-component path cannot identify *incident-affected* Configuration Items, and modeled email fields cannot reliably match owners to Stakeholders. The interviewer appropriately marked future links as unpopulated.
- **Turn 61–86:** The alias phase spent roughly 25 turns asking small batches of near-identical questions, mostly receiving “None.” A consolidated pass would likely have been more efficient.
- **Turn 153–156:** The communication test became precise about status, timing, dispatch, and at least one recipient. The interviewer also kept the important limitation visible: that test does **not** establish that every required recipient received an update.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
