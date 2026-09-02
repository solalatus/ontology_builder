# Ontology-recovery eval report

Generated: 2026-09-02T19:27:35.150Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.5%** | **57.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 55.0% / 91.7% / 68.7% | 60.0% / 75.0% / 66.7% | 11/20 full · 9/15 scoped ground-truth classes matched; 12 recovered |
| Relationship recall / precision / F1 | 53.8% / 70.0% / 60.9% | 62.5% / 50.0% / 55.6% | 7/13 full · 5/8 scoped ground-truth relationships matched; 10 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 83.3% / 90.9% | 100.0% / 33.3% / 50.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 6 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.5%** | **57.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 55.0% / 91.7% / 68.7% | 60.0% / 75.0% / 66.7% | 11/20 full · 9/15 scoped ground-truth classes matched; 12 recovered |
| Relationship recall / precision / F1 | 53.8% / 70.0% / 60.9% | 62.5% / 50.0% / 55.6% | 7/13 full · 5/8 scoped ground-truth relationships matched; 10 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 83.3% / 90.9% | 100.0% / 33.3% / 50.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 6 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 100.0% / 60.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 51.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 53.3% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 100.0% / 60.0% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 34.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 51.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 53.3% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 64 turns, 540s wall-clock
- Real app-agent API calls: 100 (apply_ontology_yaml called 32× · get_graph_state called 3×)
- Tool outcomes seen in transcript: 32 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 2842505 total (2825269 prompt · 17236 completion) across 165 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 5 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**
  - Tool reports `✓ Applied: 8 added, 0 updated` after the user only requested rewording/collapsing of existing competency questions/actions. This looks like a misapplied edit or at least misleading tool accounting.
- **Turn 3**
  - Assistant says the actions were **not** recorded yet and asks for explicit confirmation, but the tool output immediately before implies substantial persistence already happened. State/reporting is inconsistent.
- **Turn 5**
  - Assistant says: “I tried to persist the actions too early ... and the tool rejected them because those classes do not exist in the model yet.” There is no visible rejection in the transcript; earlier tool outputs showed success. This is a contradiction between assistant narrative and tool history.
- **Turn 5**
  - System note says `The agent left 5 consistency problem(s) unresolved — see Check.` The assistant does not inspect or resolve them at that point and continues, which looks like dropped state / missed required remediation.
- **Turn 7**
  - Tool says `✓ Applied: 3 added, 0 updated` after the user only supplied a replacement label (“maintainable item”). The count does not match the apparent change and suggests the tool may have added extra artifacts silently.
- **Turns 22–23**
  - Tool reports `0 added, 1 updated` after multiple new properties are introduced/confirmed (first `stateCategory`, later four work-order properties). This suggests property persistence/accounting is unreliable or opaque.
- **Turn 58**
  - Assistant states “MaintenanceActivity now has a status property” immediately after a tool result of `0 added, 1 updated`, even though this property had not been previously established. Likely another add/update mismatch.
- **Overall**
  - Repeated mismatch between what the assistant says is persisted, what the tool claims was added/updated, and what the user actually changed. This is the most bug-like pattern in the session.

## Noteworthy observations
- **Turn 1**
  - Strong opening move: the interviewer correctly starts with competency questions/actions before classes.
- **Turn 2**
  - Efficient atomicization of competency questions, but it over-splits the user’s grouped state question and needed correction from the persona.
- **Turns 3–5**
  - Good discipline in asking for explicit confirmation batches, but the persistence workflow is confusing and undermines confidence because the tool/assistant narratives diverge.
- **Turn 4**
  - The “required narrow follow-up” about related roles/contexts is sensible, though a bit prompt-driven and somewhat detached from what was immediately needed to continue modeling.
- **Turns 8–19**
  - Relationship elicitation is generally strong: the interviewer repeatedly proposes a candidate edge, asks yes/no, and accepts corrections rather than forcing a graph shape.
- **Turn 11**
  - Good modeling checkpoint: explicitly asks whether to represent maintenance state as a class vs a property because of tool limitations. This is exactly the kind of ontology/tool alignment question that prevents downstream confusion.
- **Turns 17–19**
  - Good restraint: the interviewer accepts the expert’s choice not to add assignment/direct maintainable-item-to-process links just to make the graph denser.
- **Turns 31–38**
  - Nice recovery on rules: when the simplified rule for assignment is rejected, the interviewer does not force it and introduces supporting structure incrementally.
- **Turns 38–45**
  - Also good on failure classification: the interviewer recognizes the difference between **decision basis** and **recorded outcome** and leaves the rule open instead of faking formal completeness.
- **Turns 46–48**
  - Especially good behavior around navigation warnings: the interviewer explicitly surfaces implementation-vs-domain tension and lets the expert refuse reverse edges. This is valuable prompt behavior.
- **Turn 54**
  - Validation summary is useful, but it slightly overstates coverage in places (e.g., competency question 3 “partly covered” via shared state path is weak and may not really answer the question for a specific item).
- **Turns 56–63**
  - Good late-session focus on closing a concrete action gap (`closeMaintenanceWorkOrder`) instead of trying to solve everything.
- **Overall**
  - The interview is methodical and mostly stateful despite the tool inconsistencies.
  - Main prompt-optimization opportunity: reduce repetitive recap text. Nearly every turn includes a recap, which keeps context aligned but is verbose and likely costly.
  - Another opportunity: when the system flags consistency problems, the interviewer should pause and inspect them immediately rather than continuing and only mentioning tool issues later.


## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
