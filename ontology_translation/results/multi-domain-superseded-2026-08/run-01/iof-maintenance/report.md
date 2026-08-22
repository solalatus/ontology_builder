# Ontology-recovery eval report

Generated: 2026-08-21T14:07:39.261Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.3%** | **65.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 72.7% / 66.7% | 87.5% / 63.6% / 73.7% | 8/13 full · 7/8 scoped ground-truth relationships matched; 11 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.0% / 66.7% / 50.0% | 50.0% / 33.3% / 40.0% | 2/5 full · 1/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.3%** | **65.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 72.7% / 66.7% | 87.5% / 63.6% / 73.7% | 8/13 full · 7/8 scoped ground-truth relationships matched; 11 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.0% / 66.7% / 50.0% | 50.0% / 33.3% / 40.0% | 2/5 full · 1/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 72.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 41.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 59.6% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 72.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 41.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 59.6% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 62 turns, 714s wall-clock
- Real app-agent API calls: 115 (apply_ontology_yaml called 37× · get_graph_state called 16×)
- Tool outcomes seen in transcript: 37 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4434355 total (4412145 prompt · 22210 completion) across 229 API calls

## LLM review of the conversation

## Errors
- **Turn 3** — Assistant claims “the tool flagged an expected issue” that action records can’t be completed because input classes aren’t defined, but the tool output just said `✓ Applied: 5 added, 0 updated.` This looks like hallucinated tool feedback.
- **Turn 3** — System notes “The agent left 5 consistency problem(s) unresolved — see Check.” The assistant does not inspect or address them, and proceeds as if Phase 1 is complete.
- **Turn 14–15** — After correctly pausing to ask whether `FunctioningProcess` is a separate class, the tool at turn 15 reports `✓ Applied: 4 added, 0 updated.` That implies the assistant added not just the class but also two relationships (`FailureEvent --hasEffect--> FailureEffect`, `FailureModeCode --describes--> UndesirableDisposition`) and `FunctioningProcess --realizes--> RequiredFunction` before explicitly confirming that last relationship with the user in a dedicated step. Premature application.
- **Turn 16** — Assistant asserts it “can’t treat that as finished yet” and pressures for a `MaintainableItem ↔ FunctioningProcess` relationship because the class “cannot be left permanently standalone.” That is contradicted later when it accepts leaving the class only connected to `RequiredFunction`. This looks like the interviewer inventing a constraint.
- **Turn 20** — Assistant’s recap about “two confirmed classes still have zero relationships” is internally confused and self-contradictory (`QualifiedMaintenancePerson? no...`), indicating loss of graph state.
- **Turn 27–28** — Assistant asks permission to remove `MaintenanceProcess --describedBy--> MaintenanceWorkOrder`; user says yes; tool says `✓ Applied: 0 added, 1 updated.` Assistant then says the tool cannot delete and the inverse remains. Either the update was misapplied or the assistant failed to verify whether the edit actually removed/deactivated it.
- **Turn 37** — Assistant asks for a meaning for `describedBy` even though it had already identified that relationship as conceptually unwanted and pending cleanup. It reinforces stale state instead of isolating/removing the bad edge.
- **Turn 50** — User gives `taskDescription`; assistant responds as if the user had resisted adding structure (“I can’t accept excluding structure here”), which misreads the answer.
- **Throughout late turns (55 onward)** — Assistant repeatedly references “tool warnings” and “live graph checks” without corresponding tool outputs in several places, making it unclear which warnings are real versus inferred.

## Noteworthy observations
- **Turn 1** — Good opening structure: starts with competency questions before ontology artifacts.
- **Turns 4–8** — Generally strong elicitation on class naming and scope; the assistant accepts domain-specific renames and lets the persona tighten terms.
- **Turns 8–13** — Good relationship discipline overall: proposes small batches, asks for direction/verb confirmation, and accepts drops/changes instead of forcing generic links.
- **Turn 9** — Nice recovery when the persona mentioned operating/degraded/failed distinctions: assistant explicitly tested whether they should be subclasses vs values.
- **Turns 12–13** — Good distinction between structural qualification facts and assignment facts; assistant followed the expert’s caution not to conflate them.
- **Turns 16–17** — The interviewer became overly rigid, trying to force a direct `MaintainableItem ↔ FunctioningProcess` link from wording in a competency question instead of accepting indirect/partial coverage. This is likely prompt-tunable.
- **Turns 18–21** — Some inefficient “systematic closure” behavior: the assistant keeps hunting for every possible connection even when the expert is clearly signaling “not needed yet.” This creates friction and verbosity without much gain.
- **Turn 21–26** — Strong handling of action grounding: assistant asks for action input classes and then rewords effects/verifications to avoid inventing unsupported relationships.
- **Turns 42–47** — Good transition into rules and preconditions, especially catching that “satisfies qualification” was not actually modeled and asking to reword the rule.
- **Turns 47–51** — Useful pattern: when a rule depends on a property, assistant drills down to property name plus “what breaks if missing/wrong.” That seems productive.
- **Turns 55–62** — Validation pass is helpful in principle, but it’s somewhat muddied by unresolved live-state confusion and by surfacing open items that the expert had already intentionally deferred. A cleaner “accepted partial coverage” mode would reduce churn.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
