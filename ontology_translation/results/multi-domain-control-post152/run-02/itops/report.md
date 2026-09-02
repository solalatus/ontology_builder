# Ontology-recovery eval report

Generated: 2026-09-02T16:13:08.498Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **70.6%** | **55.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 57.4% / 100.0% / 72.9% | 83.3% / 51.3% / 63.5% | 39/68 full · 20/24 scoped ground-truth classes matched; 39 recovered |
| Relationship recall / precision / F1 | 39.8% / 86.0% / 54.4% | 66.7% / 48.0% / 55.8% | 43/108 full · 24/36 scoped ground-truth relationships matched; 50 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 73.0% / 100.0% / 84.4% | 100.0% / 30.9% / 47.2% | 81/111 full · 25/25 scoped ground-truth properties matched; 81 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **71.8%** | **55.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 57.4% / 100.0% / 72.9% | 83.3% / 51.3% / 63.5% | 39/68 full · 20/24 scoped ground-truth classes matched; 39 recovered |
| Relationship recall / precision / F1 | 42.6% / 92.0% / 58.2% | 66.7% / 48.0% / 55.8% | 46/108 full · 24/36 scoped ground-truth relationships matched; 50 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 73.0% / 100.0% / 84.4% | 100.0% / 30.9% / 47.2% | 81/111 full · 25/25 scoped ground-truth properties matched; 81 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 18.2% / 28.6% / 22.2% | 2/11 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 90.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 22.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 38.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 34.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 27.3% / 42.9% / 33.3% | 3/11 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 90.9% / 100.0% / 95.2% | 10/11 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 90.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 22.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 38.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 34.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 68 turns, 985s wall-clock
- Real app-agent API calls: 128 (apply_ontology_yaml called 43× · get_graph_state called 15×)
- Tool outcomes seen in transcript: 43 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 7932167 total (7894844 prompt · 37323 completion) across 252 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1 / 2 / 3 / 4 onward**: The transcript appears duplicated through `app-user` turns; the assistant is effectively responding to echoed persona content rather than a clean turn structure. This may be a simulation artifact, but in a real run it would indicate message-role handling/state ingestion problems.
- **Turn 4**: Assistant claims “Phase 1 is now captured in substance” immediately after the tool reports `11 consistency problem(s) unresolved`. It acknowledges a note about undefined action inputs, but proceeds as if phase closure is fine despite the system warning.
- **Turn 4**: Assistant says it captured **18 competency questions** from an original list of 12. Persona immediately pushes back that the count framing is not meaningful. This looks like over-processing / invented granularity rather than faithful capture.
- **Turn 10**: Assistant’s Phase 2 recap says the class inventory is solid, but persona points out two already-in-scope missing classes (`MajorIncident`, `CybersecurityIncident`). This is a genuine omission in scope tracking.
- **Turn 14–17**: Assistant asks whether to create direct `Incident -> [specific technical subtype]` links right after the persona had already emphasized keeping `Incident -> ConfigurationItem` as the stable direct fact. This is not catastrophic, but it shows weak retention of a just-established modeling constraint.
- **Turn 27**: Assistant had captured only `Incident --resolvedByChange--> Change`, then itself notices this does not support the already-accepted causation question. This exposes a temporary misfit between accepted question coverage and modeled relations.
- **Turn 33 / 57**: Assistant repeatedly proposes/checks rules using facts not actually modeled yet (`accepted residual condition`, required communications completeness, post-incident review). It eventually corrects this, but the first-pass rule formulation overreaches the current ontology state.
- **Turn 61–67**: Several action definitions were accepted before being machine-checkable; then the assistant had to backtrack and simplify verification/effects to satisfy the tool. This is a real workflow bug/inefficiency: action capture should probably enforce “only modeled facts” earlier, not after tool rejection.
- **Turn 64–65**: `restoreDataFromBackupSet` was initially modeled with input `BackupSet`, but the assistant only later realized the rule/navigation was impossible from that input given current edge directions. This is a concrete action-input/path design miss.
- **Turn 68**: Assistant says “After that, we still must do Phase 9 … before final validation,” but immediately starts only a very narrow Incident-focused question. Not a bug by itself, but it suggests phase framing may be more rigid than useful and risks dragging the interview further than necessary.

## Noteworthy observations
- **Turn 1**: Strong opening move: asks for real questions first, grounded in user needs rather than ontology primitives.
- **Turn 3**: Good narrow follow-up on roles and operating context; well-scoped and avoids broad drift.
- **Turn 5–12**: Efficient class elicitation in small justified batches. The assistant consistently asks “does the agent need to identify/retrieve/connect/pass this to a tool,” which is a good anti-bloat discipline.
- **Turn 10–12**: Good recovery when persona points out missing `MajorIncident` and `CybersecurityIncident`; assistant immediately turns them into explicit candidate classes.
- **Turn 14 onward**: The relationship elicitation is generally strong: asks for “real paths,” distinguishes direct business-facing path vs supporting technical path, and repeatedly checks direction/verb choice.
- **Turn 15 / 23 / 25 / 28 / 30**: Good behavior when new concepts emerge mid-relationship work (`Application`, `KnownError`, `Problem`, `Environment`, `SecurityEvent`): assistant pauses and explicitly confirms them as classes instead of silently inventing them.
- **Turn 21–22**: Nice handling of duplicate/inverse relation warning; asks for canonical direction and captures the operational rationale.
- **Turn 33–35**: Good discipline in recording declined additions. The recap of “tempting but unjustified extras” is useful and likely prompt-worthy behavior.
- **Turn 36–55**: Property and bounded-value elicitation is methodical and mostly efficient. Good pattern of asking not just for values, but “what breaks if missing/wrong.”
- **Turn 38–39**: Good resistance to symmetry bias; assistant notices missing `ConfigurationItem.status` but accepts the expert’s argument not to add it.
- **Turn 56–59**: Strong rule-elicitation technique overall: explicitly asks to use only already-modeled facts and to call out unsupported rules rather than forcing them.
- **Turn 60–67**: Action elicitation is valuable, but comparatively inefficient because machine-checkability is validated late. Prompt could likely be improved by asking the expert to mark each precondition/effect/verification as “modeled now” vs “open gap” upfront.
- **Turn 67**: Good decision to remove `executeEmergencyChange` rather than pretending the current model supports it. This is a positive sign of scope honesty.
- **Overall**: The interviewer is careful, structured, and usually grounded in accepted scope. Main optimization opportunity is reducing rework: it repeatedly allows operationally correct but currently unmodeled conditions into summaries/actions/rules, then has to clean them up after tool feedback.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
