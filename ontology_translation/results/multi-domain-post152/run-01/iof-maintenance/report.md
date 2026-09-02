# Ontology-recovery eval report

Generated: 2026-09-02T18:06:24.818Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **74.5%** | **66.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 70.0% / 93.3% / 80.0% | 86.7% / 86.7% / 86.7% | 14/20 full · 13/15 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 69.2% / 64.3% / 66.7% | 100.0% / 57.1% / 72.7% | 9/13 full · 8/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 62.5% / 76.9% | 100.0% / 25.0% / 40.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 8 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **74.5%** | **66.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 70.0% / 93.3% / 80.0% | 86.7% / 86.7% / 86.7% | 14/20 full · 13/15 scoped ground-truth classes matched; 15 recovered |
| Relationship recall / precision / F1 | 69.2% / 64.3% / 66.7% | 100.0% / 57.1% / 72.7% | 9/13 full · 8/8 scoped ground-truth relationships matched; 14 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 62.5% / 76.9% | 100.0% / 25.0% / 40.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 8 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 95.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 91.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 88.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 71.4% / 100.0% / 83.3% | 5/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 95.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 91.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 88.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 60 turns, 726s wall-clock
- Real app-agent API calls: 100 (apply_ontology_yaml called 31× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 31 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3304869 total (3283388 prompt · 21481 completion) across 173 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**
  - Tool says **“15 added, 0 updated”** after persona requested wording corrections to the normalized competency questions. That likely misreports updates vs adds, and the assistant never explicitly confirmed the corrected wording was what got stored.
- **Turn 8**
  - Tool reports **“6 added, 0 updated”** even though the user asked to **rename** two proposed classes (`WorkOrder` → `MaintenanceWorkOrderRecord`, `Qualification` → `QualificationSpecification`). Looks like potential misapplied add-vs-update behavior.
- **Turn 19**
  - Tool reports **“0 added, 2 updated”** after the assistant says it recorded four work-order properties (`workOrderDate`, `taskDescription`, `taskCode`, `cost`). Count does not match what was claimed.
- **Turn 24 / 25**
  - Assistant incorrectly says **“All 15 classes now have meaning sentences”** immediately after only updating 5 meanings; system correctly flags this. Real counting/state-tracking bug in summary generation.
- **Turn 29 / 30**
  - Assistant incorrectly says **“We now have meanings for all 12 relationships”** on a turn that updated only 4; system again flags it. Another state/counting bug.
- **Turn 40**
  - Assistant says **“MaintenanceActivity.activityCompletionState with allowed values…”** but tool output says **“1 added, 2 updated”** while the assistant frames this as one property + one property + one rule. Unclear whether the property/model edits were actually applied as described.
- **Turn 41–44**
  - The interviewer records `classifyItemAsFailed`, then discovers the chosen action input/pathing doesn’t work, adds a relationship, then removes it, then changes the action input to `FailureEvent`. This is recoverable, but it shows the agent is recording actions before validating that their input/effect/precondition graph is traversable.
- **Turn 48**
  - Assistant writes **“0 added? No — to be precise, this step recorded 1 added…”** This self-correction inside the response looks like prompt/tool-integration leakage and poor polish.
- **Turn 55**
  - Validation says **“closeMaintenanceWorkOrderRecord: structurally present, but there is a related path concern noted below for reaching the process and its activities from the input.”** This issue had not been fully surfaced earlier during action capture; the assistant only notices it in final validation, suggesting incomplete consistency checks during editing.
- **Turn 60**
  - Assistant declares the ontology **“substantively complete”** despite still acknowledging unresolved action-path/tool-navigation warnings. Not fatal, but arguably contradictory with the stronger **“not complete yet”** statement from turn 55.

## Noteworthy observations
- **Turn 2**
  - Good normalization move: splitting compound competency questions into atomic ones was useful and domain-faithful.
- **Turn 4**
  - The “related role / operating context” follow-up feels generic and somewhat prompt-driven rather than obviously motivated by the user’s content. It added little here.
- **Turn 6**
  - Good catch: the agent noticed the persona’s attempt to de-emphasize `Item` conflicted with already-accepted item-centric questions/actions, and it pushed appropriately.
- **Turn 10–12**
  - Strong interviewing on relationship directionality. The assistant repeatedly asked about direction and path semantics rather than assuming inverses.
- **Turn 10–12**
  - Good restraint on assignment modeling: the assistant did not force an assignment relationship until later when action support required it.
- **Turn 13–14**
  - Nice precision on not overcommitting the `FailureEvent` ↔ `RequiredFunction` verb; it asked for the weakest acceptable relation label instead of inventing a stronger causal one.
- **Turn 16–18**
  - Good skepticism about adding status fields just because actions exist. The interviewer appropriately pressed once, then accepted the domain expert’s alternative closure-verification mechanism.
- **Turn 18–20**
  - Efficient property elicitation overall, but the assistant sometimes proposed overly implementation-specific properties and then had to retract based on user pushback.
- **Turn 21–24**
  - Meaning-sentence collection was systematic but somewhat mechanical/tedious. Could likely be batched more efficiently or inferred when the persona has already implicitly defined terms.
- **Turn 25–30**
  - Alias probing became low-yield; to the assistant’s credit, it recognized this and stopped after consecutive “none” responses.
- **Turn 35–40**
  - Good pattern: when a rule referenced unmapped semantics (“item cannot perform its required function”, “performed task information”), the assistant paused and either added minimal support or asked to restate the rule. This is one of the stronger parts of the interview.
- **Turn 41–50**
  - Action modeling exposed a recurring weakness: the assistant waits until after recording an action to discover directional/path problems. It would be more efficient to preflight action input → precondition/effect/verification reachability before writing.
- **Turn 45–46, 49–50, 58–60**
  - The assistant usefully distinguished **domain-faithful direction choices** from **tool-navigation limitations**, and it explicitly let the user choose fidelity over tool convenience. That’s a strong design/interview behavior.
- **Turn 47–48**
  - Good recovery from earlier hesitation: when the action truly needed a distinct assignment fact, the assistant revisited and cleanly separated **eligibility** from **assignment outcome**.
- **Turn 55 onward**
  - Final validation was valuable and surfaced real gaps, but it came a bit late. Several warnings could have been discovered earlier if validation checks were run incrementally after each action/rule.
- **Overall**
  - The interviewer was generally disciplined about not inventing extra ontology structure, but the session was somewhat inefficient because it repeatedly recorded edits before ensuring they fit the tool’s one-direction / one-input constraints.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
