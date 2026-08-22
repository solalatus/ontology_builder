# Ontology-recovery eval report

Generated: 2026-08-22T16:54:27.702Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **51.2%** | **41.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 69.2% / 93.1% / 79.4% | 88.9% / 55.2% / 68.1% | 27/39 full · 16/18 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 17.1% / 24.0% / 20.0% | 15.8% / 12.0% / 13.6% | 6/35 full · 3/19 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 38.1% / 94.1% / 54.2% | 43.8% / 41.2% / 42.4% | 16/42 full · 7/16 scoped ground-truth properties matched; 17 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **72.2%** | **55.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 71.8% / 96.6% / 82.4% | 94.4% / 58.6% / 72.3% | 28/39 full · 17/18 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 65.7% / 92.0% / 76.7% | 52.6% / 40.0% / 45.5% | 23/35 full · 10/19 scoped ground-truth relationships matched; 25 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 40.5% / 100.0% / 57.6% | 50.0% / 47.1% / 48.5% | 17/42 full · 8/16 scoped ground-truth properties matched; 17 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 55.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 85.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 89.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 57.1% / 80.0% / 66.7% | 4/7 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 55.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 85.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 89.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 46 turns, 902s wall-clock
- Real app-agent API calls: 90 (apply_ontology_yaml called 23× · get_graph_state called 21×)
- Tool outcomes seen in transcript: 23 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4114632 total (4092781 prompt · 21851 completion) across 165 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 7 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**: Tool reports `✓ Applied: 28 added` immediately after the user only corrected wording and supplied 5 actions. That count looks inflated and inconsistent with the assistant’s recap of “23 competency questions” + 5 actions.
- **Turn 3**: Assistant says “the tool flagged a technical issue because actions refer to input classes we haven’t defined yet,” but no such tool output appears. Looks like invented/internal state leakage.
- **Turn 3**: System says “The agent left 5 consistency problem(s) unresolved,” but the assistant does not inspect or resolve them; it just proceeds.
- **Turn 7**: Tool says `✓ Applied: 10 added` after only Chiller, Boiler, Packaged Heat Pump were kept and two role classes were removed. Count appears wrong / likely misapplied edits.
- **Turn 9**: Tool says `✓ Applied: 5 added` after only two valve subclasses were newly confirmed, again suggesting over-adding.
- **Turn 12**: Assistant recap still lists generic classes `Temperature Sensor`, `Temperature Setpoint`, and `CO2 Sensor` alongside newly added specific classes, even though the user preferred separate concrete classes because subclassing is unsupported. This risks duplicated/overlapping modeling with no justification.
- **Turn 14**: Tool says `✓ Applied: 5 added` for confirming only 3 relationships (Thermostat→Zone, Building→Floor, Floor→Space); count mismatch suggests hidden additions.
- **Turn 18**: Tool says `✓ Applied: 20 added` after confirming mostly one relationship (`Zone includes Space`) plus prior recaps; again looks like the tool is adding more than requested.
- **Turn 26**: Tool says `✓ Applied: 0 added, 10 updated` for confirming 4 status properties, which seems inconsistent with the number of actual changes.
- **Turn 28**: Tool says `✓ Applied: 0 added, 7 updated` for adding 3 position properties; count mismatch.
- **Turn 39**: Tool applies the same update twice (`✓ Applied: 0 added, 9 updated` twice). Looks like duplicate execution.
- **Turn 43**: Assistant says it “tightened the economizer action so its verification now checks something the effect actually changes,” but no edited action text is shown back to the user, so the exact persisted change is opaque.
- **Turn 44**: Assistant identifies a navigation gap from `Zone` to `Thermostat`/`Terminal Unit`, but this is partly a tooling/query-direction issue rather than a domain-model inconsistency. The interview conflates ontology semantics with traversal implementation.

## Noteworthy observations
- **Turn 2**: Good move to atomize competency questions, but it over-split and introduced wording the user immediately corrected (`terminal unit`↔`plenum`, `zones served by terminal unit`, “heat pump path on the plant side”).
- **Turn 3**: Nice recovery: the assistant explicitly asks for actions after gathering competency questions.
- **Turn 4**: Strong technique: it separates “roles/context mentioned in Phase 1” from whether they deserve to be ontology classes in Phase 2.
- **Turn 5**: Good prompt design asking whether `HVAC Equipment` and `CO2 Reading` should be classes at all, instead of assuming.
- **Turn 6**: Efficiently tests whether roles belong in the core model; the user clearly says no. Good pruning.
- **Turn 8**: Solid follow-up on valves. The assistant notices “Valve” is too coarse for the accepted actions and gets the user to split into cooling/heating valve.
- **Turn 11**: Good explicit handling of the “no subclassing” tool limitation and asking the user to choose between separate classes vs type property.
- **Turn 12**: The relationship elicitation is generally careful about directionality, and the user corrects several direction assumptions. Good that the assistant accepts corrections rather than forcing symmetry.
- **Turn 13**: Missed an obvious follow-up: once `Thermostat serves Zone` was confirmed and `Zone includes Space` was initially rejected, the thermostat→space competency question was already endangered. The assistant eventually catches this at turn 17, but later than ideal.
- **Turn 15**: Good job asking plant-side relationships carefully and inviting correction; the user refines Chiller/Boiler to feed valves, not AHUs.
- **Turn 17**: Strong recovery. The assistant explicitly identifies a “coverage gap” and asks for the real Zone–Space relationship needed to answer thermostat→space questions.
- **Turn 18–20**: Sensible resistance to over-modeling location links. The user wants only explicit, justified location relationships; the assistant mostly honors that.
- **Turn 20**: Good modeling instinct to distinguish relationships from rules, but the proposed “guides/measures/affects” links were unnecessary and the user rejected them. This was a mildly inefficient detour.
- **Turn 22–24**: Good property elicitation pattern: the assistant proposes candidate properties, and the user consistently pushes values onto sensors/setpoints/components instead of duplicating them on AHU. This improves model quality.
- **Turn 24–25**: Nice catch that “verify conditioning available” may need current-state somewhere, but the assistant’s first instinct was to invent a special availability property; the user rightly steered it back to status on existing devices.
- **Turn 28–29**: Good discipline not to add outdoor-air condition points “just in case” for economizer logic. The assistant leaves that rule intentionally high-level.
- **Turn 40**: Good handling of incomplete rule support: the assistant notices the economizer rule references conditions not explicitly modeled and offers clear options instead of faking completeness.
- **Turn 41–44**: The occupied-zone action exposes a real tension between domain truth and one-direction traversal/tool constraints. The assistant does well not to silently add reverse links, but the issue emerges very late—this could have been detected earlier when defining actions/relationships.
- **Turn 46**: The assistant stops at a sensible point and clearly names open items instead of claiming full validation. Good restraint.
- **Overall**: Interview technique is generally strong—systematic, phased, and good at pruning abstractions—but the transcript shows repeated suspicious tool counts/updates and some late discovery of answerability gaps that should ideally be caught earlier in relation to competency questions.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
