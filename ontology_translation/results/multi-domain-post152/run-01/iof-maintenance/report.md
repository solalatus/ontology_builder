# Ontology-recovery eval report

Generated: 2026-09-02T17:30:19.174Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.6%** | **61.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 75.0% / 93.8% / 83.3% | 86.7% / 81.3% / 83.9% | 15/20 full · 13/15 scoped ground-truth classes matched; 16 recovered |
| Relationship recall / precision / F1 | 76.9% / 62.5% / 69.0% | 100.0% / 50.0% / 66.7% | 10/13 full · 8/8 scoped ground-truth relationships matched; 16 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.0% / 50.0% / 44.4% | 50.0% / 25.0% / 33.3% | 2/5 full · 1/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.0%** | **61.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 75.0% / 93.8% / 83.3% | 86.7% / 81.3% / 83.9% | 15/20 full · 13/15 scoped ground-truth classes matched; 16 recovered |
| Relationship recall / precision / F1 | 76.9% / 62.5% / 69.0% | 100.0% / 50.0% / 66.7% | 10/13 full · 8/8 scoped ground-truth relationships matched; 16 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 60.0% / 75.0% / 66.7% | 50.0% / 25.0% / 33.3% | 3/5 full · 1/2 scoped ground-truth properties matched; 4 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 55.6% / 71.4% | 5/5 ground-truth actions matched by name/meaning; 9 recovered |
| Action input-class accuracy | 60.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 46.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 49.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 46.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 100.0% / 72.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 55.6% / 71.4% | 5/5 ground-truth actions matched by name/meaning; 9 recovered |
| Action input-class accuracy | 60.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 46.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 49.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 46.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 68 turns, 985s wall-clock
- Real app-agent API calls: 139 (apply_ontology_yaml called 33× · get_graph_state called 36×)
- Tool outcomes seen in transcript: 33 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 7941053 total (7916068 prompt · 24985 completion) across 264 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 6**
  - Tool behavior looks buggy/incomplete: it **removed 2 elements** when the user only requested renaming **Item → Asset**, then said “only one edit is applied per message.” The assistant admits the live model still has **Item**, so the rename did not actually complete cleanly.
- **Turn 4**
  - Assistant says Phase 1 captured **14 competency questions**, but the persona provided **13**. Likely miscount.
- **Turn 33**
  - Tool reports **“0 added, 1 updated”** after adding two WorkOrder properties (`finalCost`, `performedTaskInformation`). That looks like a persistence/counting bug or a misapplied grouped edit.
- **Turn 35**
  - Same issue: adding `FailureModeCode.codeValue` yields **“0 added, 1 updated”**. If the property did not previously exist, this is suspicious.
- **Turn 60**
  - Tool runs **ontology state check twice** back-to-back with no intervening action. Looks redundant/tool-noise.
- **Turn 66**
  - Assistant says it updated and persisted both:
    - `assignedTo` meaning sentence
    - `closeMaintenanceWorkOrder` effect text  
    But no user input in that turn supplied the **meaning sentence** for `assignedTo`; the assistant appears to infer/persist it without explicit elicitation.
- **Turns 49–57**
  - Action modeling is only partially persisted, and the assistant keeps talking as if actions are now “tightened,” but the transcript mostly shows only **preconditions** being stored. Inputs/effects/verification for most actions remain unspecified, despite periodic recap language implying stronger completion.
- **Turns 67–68**
  - Final claim “ontology is in a good, usable state” is somewhat overstated given acknowledged unresolved action-directionality limitations and only partially tightened actions.

## Noteworthy observations
- **Turn 1**
  - Good technique: starts from competency questions/actions instead of jumping into classes.
- **Turns 3–4**
  - Good targeted follow-up on roles/context; keeps scope grounded and avoids over-modeling org-specific distinctions.
- **Throughout turns 4–22**
  - Strong interviewing discipline: asks in **small justified batches**, usually one focused clarification at a time.
- **Turns 6–8**
  - Good recovery on naming precision (`Item` vs `Asset`, `Qualification` vs `QualificationSpecification`, `MaintenancePerson` vs `QualifiedMaintenancePerson`).
- **Turns 10–12**
  - Good modeling judgment: distinguishes **state** from **event/cause** and explicitly checks path semantics instead of assuming.
- **Turns 17–19**
  - Nice catch that qualification logic and assignment logic are distinct. This led to a later useful validation question.
- **Turns 20–22**
  - Good adaptive follow-up: when `FailureModeCode` lacked a proper target, the assistant recognized a missing class (`UndesirableDisposition`) instead of forcing a bad relation.
- **Turns 24–27**
  - Strong moment: assistant explicitly surfaces a **real path gap** for “What failure event put an asset into a failed state?” rather than pretending current links are enough.
- **Turns 26–29**
  - Good handling of tooling constraints: clearly distinguishes between domain facts and reverse-navigation/tool limitations.
- **Turns 31–35**
  - Efficient property elicitation: pushes back on “common in practice” identifiers/statuses and keeps only decision-bearing properties.
- **Turns 45–47**
  - Good handling of fixed choices under tool constraints: instead of hand-waving, asks how to represent the maintenance-state value set given that `MaintenanceState` is a class.
- **Turns 47–57**
  - Rule elicitation is generally effective, but the assistant could have asked for **close/start/assign rule names and conditions earlier** when actions were first collected, reducing later backtracking.
- **Turns 57–67**
  - Validation pass is valuable and caught genuine gaps, but it also reveals inefficiency: several issues (assignment fact, asset-required-function link, close rule/effect mismatch) were only discovered late, though they were predictable from earlier accepted actions.
- **Throughout**
  - The assistant repeatedly frames some issues as “tooling limitations, not domain facts,” which is good prompt behavior and prevents ontology bloat.
- **Overall**
  - Interview quality is high, but there is some **state-management slippage** between “conceptually confirmed,” “persisted,” and “fully action-supported.” A reviewer optimizing the prompt should encourage the agent to keep those statuses more explicit and separate.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
