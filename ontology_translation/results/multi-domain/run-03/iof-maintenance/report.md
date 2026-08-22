# Ontology-recovery eval report

Generated: 2026-08-22T17:14:22.248Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.2%** | **69.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.0% / 90.9% / 64.5% | 60.0% / 81.8% / 69.2% | 10/20 full · 9/15 scoped ground-truth classes matched; 11 recovered |
| Relationship recall / precision / F1 | 53.8% / 58.3% / 56.0% | 75.0% / 50.0% / 60.0% | 7/13 full · 6/8 scoped ground-truth relationships matched; 12 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 60.0% / 100.0% / 75.0% | 100.0% / 66.7% / 80.0% | 3/5 full · 2/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.2%** | **69.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.0% / 90.9% / 64.5% | 60.0% / 81.8% / 69.2% | 10/20 full · 9/15 scoped ground-truth classes matched; 11 recovered |
| Relationship recall / precision / F1 | 53.8% / 58.3% / 56.0% | 75.0% / 50.0% / 60.0% | 7/13 full · 6/8 scoped ground-truth relationships matched; 12 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 60.0% / 100.0% / 75.0% | 100.0% / 66.7% / 80.0% | 3/5 full · 2/2 scoped ground-truth properties matched; 3 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 100.0% / 44.4% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 71.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 80.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 100.0% / 44.4% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.5% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 71.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 80.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 45 turns, 429s wall-clock
- Real app-agent API calls: 92 (apply_ontology_yaml called 23× · get_graph_state called 24×)
- Tool outcomes seen in transcript: 23 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3251947 total (3235732 prompt · 16215 completion) across 178 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**
  - Assistant claims actions were *not* persisted because the tool “flagged that correctly,” but the tool output says **“✓ Applied: 15 added, 0 updated.”** That’s a contradiction and looks like loss of tool-state awareness.
- **Turn 3**
  - System reports **“The agent left 5 consistency problem(s) unresolved — see Check.”** The assistant does not inspect or resolve them, and instead proceeds as if things are fine.
- **Turn 10**
  - Tool says **“✓ Applied: 4 added”** after the user only confirmed adding **MaintenanceState** plus the three corrected relationships. The assistant recap omits any mention of what the 4th addition was; likely a hidden/model-state change not surfaced clearly.
- **Turn 21**
  - Tool says **“0 added, 1 updated”** after the user supplied **two** new properties (`taskDescription`, `cost`). Either one property was silently missed or both were packed into one opaque update. Assistant recap says both were captured, which may not match tool behavior.
- **Turn 31**
  - Assistant says an action-input error is fixed, but the recorded verification for `assignQualifiedMaintenancePerson` appears to only check qualification, not explicitly that the assignment link exists, despite the persona saying verification should confirm assignment **and** qualification. The assistant’s recap overstates completeness.
- **Turn 36**
  - Assistant explicitly notes `startMaintenanceProcess` verification does **not** verify that the process was started, only that preconditions hold, yet later validation says the action is “covered” and formalized. That’s not wrong as a caveat, but it’s a real mismatch between action semantics and modeled verification.
- **Turn 44**
  - Validation summary says “Rules and actions only reference captured model elements: yes,” but `startMaintenanceProcess` still has an effect (“process is started”) with no modeled started-state/property. That’s at least partially inconsistent with the stated validation criterion.

## Noteworthy observations
- **Turn 1**
  - Strong opening move: the assistant correctly starts from competency questions/actions rather than classes.
- **Turns 2–3**
  - Good normalization discipline: assistant paraphrases proposed questions/actions and asks for explicit confirmation before persisting.
- **Turn 3**
  - Follow-up on “day-to-day roles and operating context” feels somewhat generic and not tightly motivated by the accepted questions/actions; moderate inefficiency.
- **Turns 4–8**
  - Class elicitation is generally well-scaffolded and incremental. Good use of “does this need to be its own thing?” instead of forcing ontology jargon.
- **Turn 9**
  - Nice catch on `MaintenanceState` vs `FailedState`; the assistant correctly notices that the user’s change implies a broader superclass and asks to disambiguate.
- **Turns 10–12**
  - Relationship elicitation is mostly efficient and tied back to competency questions. Good line-by-line keep/change prompting.
- **Turn 11**
  - Good restraint: assistant does not force an assignment relationship merely because an action exists; asks explicitly whether assignment facts should be recorded.
- **Turns 15–16**
  - Good behavior in reusing `describes` rather than inventing a second `isFor` relationship “just in case.”
- **Turns 18–20**
  - Assistant pushes back appropriately on adding routine status fields. This is one of the better moments: it avoids schema bloat and asks what evidence would actually verify closure.
- **Turns 19–20**
  - The “completed task information/final cost” exchange is handled well; assistant lets the persona reject placeholder names and supply domain-preferred property labels.
- **Turns 22–26**
  - Language-layer pass is systematic but somewhat long. Useful for ontology quality, though a bit mechanical.
- **Turn 27**
  - Good alias hygiene: assistant avoids recording the primary label as an alias.
- **Turn 28**
  - Sensible decision to stop “fishing” for aliases after sparse returns.
- **Turns 29–31**
  - Rule/action elicitation is careful, especially around assignment. Good distinction between capability (`qualifiedFor`) and allocation (`assignedTo`).
- **Turn 31**
  - Missed obvious follow-up: if action input is only `MaintenanceActivity`, how is the specific person supplied for assignment? The assistant never cleanly resolves whether actions can have one input plus an implicitly chosen related entity, or whether the action signature is underspecified.
- **Turns 32–34**
  - Good prompt discipline: assistant refuses to formalize a precondition using “needed” until that concept is modeled. Nice example of not smuggling in unmodeled semantics.
- **Turns 33–34**
  - Assistant starts adapting the ontology to tool navigation limitations by adding inverse/operational relationships. Pragmatic, but this risks polluting conceptual modeling with implementation workarounds; worth considering a clearer separation in prompt/policy.
- **Turns 36–41**
  - Similar tool-driven workaround happens with `FailureEvent --affects--> MaintainableItem`. Pragmatic and explicitly labeled “operational,” which is good; still indicates the tool/action framework has directional-navigation constraints the interviewer must constantly compensate for.
- **Turns 38–40**
  - Good restraint again: assistant refuses to record preconditions about occurrence/function loss without modeled support.
- **Turn 43**
  - Final validation pass is useful and readable, but a bit too generous; it marks several things as “covered enough” that are really only partially formalized.
- **Overall**
  - The interviewer is generally disciplined, incremental, and good at preventing premature overmodeling.
  - Main optimization opportunity: better synchronization with tool outputs/check results and clearer distinction between **conceptual ontology content** vs **operational/tool-workaround relationships**.


## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
