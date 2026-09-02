# Ontology-recovery eval report

Generated: 2026-09-02T15:50:36.380Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **57.6%** | **54.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 51.5% / 97.2% / 67.3% | 83.3% / 55.6% / 66.7% | 35/68 full · 20/24 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 35.2% / 66.7% / 46.1% | 58.3% / 36.8% / 45.2% | 38/108 full · 21/36 scoped ground-truth relationships matched; 57 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 44.1% / 90.7% / 59.4% | 80.0% / 37.0% / 50.6% | 49/111 full · 20/25 scoped ground-truth properties matched; 54 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **60.7%** | **56.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.9% / 100.0% / 69.2% | 87.5% / 58.3% / 70.0% | 36/68 full · 21/24 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 40.7% / 77.2% / 53.3% | 61.1% / 38.6% / 47.3% | 44/108 full · 22/36 scoped ground-truth relationships matched; 57 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 44.1% / 90.7% / 59.4% | 80.0% / 37.0% / 50.6% | 49/111 full · 20/25 scoped ground-truth properties matched; 54 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 27.3% / 75.0% / 40.0% | 3/11 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 27.3% / 100.0% / 42.9% | 3/11 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 56.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 50.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 37.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 36.4% / 100.0% / 53.3% | 4/11 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 27.3% / 100.0% / 42.9% | 3/11 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 56.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 50.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 37.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 68 turns, 1100s wall-clock
- Real app-agent API calls: 162 (apply_ontology_yaml called 46× · get_graph_state called 47×)
- Tool outcomes seen in transcript: 46 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 13464059 total (13432470 prompt · 31589 completion) across 294 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: `app-user` repeats the persona’s opening message verbatim. Looks like a transcript/plumbing issue rather than interview behavior.
- **Turn 15**: Tool reports `✓ Applied: 10 added` after the user only introduced **Application** plus several relationships. Count looks implausible / state mutation likely bundled unclearly.
- **Turn 19**: Interviewer models **MajorIncident** as a separate class and adds `Incident → MajorIncident`, even though the persona said a major incident is still an incident treated distinctly operationally. This may be acceptable, but it creates awkward semantics and later causes traversal/modeling tension.
- **Turn 29**: Duplicate tool calls (`Checked the current ontology state` twice) around one response suggest redundant tool invocation.
- **Turn 31**: Tool says `0 added, 6 updated` after 8 classes were discussed for state/status properties; likely miscount or failed updates for some items.
- **Turn 47**: Tool says `0 added, 6 updated` after 10 bounded-property lists were provided. Another likely miscount / partial-apply issue.
- **Turn 50**: Major-incident declaration rule is recorded with severity condition paraphrased as “critical or high,” but allowed values were defined as `sev1-critical`, `sev2-high`, etc. Potential enum/value mismatch unless normalized elsewhere.
- **Turn 51–52**: Rule `regulatoryNotificationMayBeSubmitted` is treated as covering “required and due,” but the persona’s condition set is actually about **submission eligibility**, not notification requirement determination. The interviewer notes this somewhat, but still records a rule name that can mislead.
- **Turn 59–61**: Action `declareMajorIncident` triggers a consistency warning because the model cannot traverse from `Incident` to `IncidentCommander` in the stored direction. This remains unresolved in the live model.
- **Turn 64**: The assistant explicitly says the tool found an “actual error” in `closeIncident`, then immediately says it’s not substantively correct and is a parser false positive. Contradictory framing.
- **Turn 64**: System message says “The agent left 1 consistency problem(s) unresolved,” and the session continues despite the unresolved issue. Real bug or at least incomplete validation handling.
- **Turn 65**: Validation claims “All classes now have meaning sentences,” but later acknowledges Regulator and Environment only got meanings at turn 64–65. Slight state/recap inaccuracy.
- **Turn 68**: Assistant stops with known open tool findings instead of resolving them, despite presenting the phase as a validation pass. Not necessarily wrong conversationally, but inconsistent with “full validation” framing.

## Noteworthy observations
- **Turn 2**: Good move splitting the initial 12 questions into atomic competency questions, but the first edit overshot and ignored domain phrasing; the persona had to consolidate several back together.
- **Turn 3**: Strong recovery: interviewer accepted the expert’s rewritten 10-question set rather than defending its own decomposition.
- **Turn 3–5**: Efficient follow-up on nearby roles/context surfaced important distinctions (incident commander, incident response team, cyber vs non-cyber, major vs ordinary incident).
- **Turn 8–16**: Good discipline in keeping class elicitation tied to confirmed questions and only adding new classes when a dangling role/object forced it (Application, Vendor, Release, Problem, Regulator, Environment).
- **Turn 14–17**: Nice catch that `ApplicationOwner` was dangling without an `Application` class. This is exactly the kind of structural consistency check the agent should do.
- **Turn 18–19**: The decision to model **MajorIncident** as a class instead of a status was driven by the persona, but it complicated the graph. The interviewer might have probed whether subclassing vs linked-record semantics mattered before committing.
- **Turn 20–24**: Good restraint around restoration modeling: the interviewer didn’t invent direct Workaround/Incident links and let the persona introduce KnownError and Problem only when needed.
- **Turn 24–25**: Efficiently surfaced **Release** as a missing governed intermediary instead of flattening change/deployment.
- **Turn 27–29**: Good elicitation of Communication as a first-class tracked object, but later rules still used vague “required communications are complete” language without immediately operationalizing it.
- **Turn 32–35**: Strong prompt hygiene: interviewer repeatedly challenged “plausible but not required” properties (`implementationPlan`, `backoutPlan`, `availabilityTarget`) and kept the slice tight.
- **Turn 38–45**: Language-layer pass was thorough, but somewhat mechanical and long. Could likely be compressed by batching more aggressively or deferring aliases unless needed.
- **Turn 41–43**: Excellent catch that the relationship meaning for `documentsWorkaround` didn’t match the stored graph. This is one of the clearest examples of the interviewer detecting a real ontology inconsistency.
- **Turn 42–43**: Also good that it asked whether both `KnownError → Workaround` and `Workaround → Runbook` should exist, rather than silently replacing one with the other.
- **Turn 45–49**: Constraints elicitation was productive, but the interviewer relied heavily on the persona to justify every bounded list. Good rigor, though somewhat repetitive.
- **Turn 49–55**: Rule elicitation generally stayed grounded, but the interviewer sometimes accepted “plain-language conditions” that referenced concepts not yet modeled, then had to backfill them later (Regulator, residual condition, Environment).
- **Turn 55–57**: Nice example of controlled scope management: added Environment because it was structurally real, but explicitly postponed approval/precondition objects.
- **Turn 58–64**: Action modeling exposed weaknesses in the ontology (declaration time, traversal direction, parser issue). Good diagnostic value, though the session ended with those issues still open.
- **Turn 65–68**: Validation recap was useful and skimmable, especially calling out partial coverage by competency question. This is a strong pattern worth keeping.
- **Overall**: Interview technique was strong on incrementalism, consistency checks, and resisting unnecessary scope. Main optimization opportunity is reducing repetitive “please answer keep/drop for each” / “one focused check before I record” cycles, which made the session long and tool-call heavy.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
