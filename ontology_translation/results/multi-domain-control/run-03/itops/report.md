# Ontology-recovery eval report

Generated: 2026-08-23T16:40:37.796Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **61.9%** | **58.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.5% / 100.0% / 65.3% | 87.5% / 63.6% / 73.7% | 33/68 full · 21/24 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 35.2% / 90.5% / 50.7% | 61.1% / 52.4% / 56.4% | 38/108 full · 22/36 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 54.1% / 98.4% / 69.8% | 80.0% / 32.8% / 46.5% | 60/111 full · 20/25 scoped ground-truth properties matched; 61 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 86.4% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **61.9%** | **58.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.5% / 100.0% / 65.3% | 87.5% / 63.6% / 73.7% | 33/68 full · 21/24 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 35.2% / 90.5% / 50.7% | 61.1% / 52.4% / 56.4% | 38/108 full · 22/36 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 54.1% / 98.4% / 69.8% | 80.0% / 32.8% / 46.5% | 60/111 full · 20/25 scoped ground-truth properties matched; 61 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 86.4% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 36.4% / 80.0% / 50.0% | 4/11 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 27.3% / 100.0% / 42.9% | 3/11 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 87.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 91.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 84.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 36.4% / 80.0% / 50.0% | 4/11 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 27.3% / 100.0% / 42.9% | 3/11 ground-truth actions matched by name/meaning; 3 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 87.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 91.7% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 84.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 76 turns, 1309s wall-clock
- Real app-agent API calls: 165 (apply_ontology_yaml called 48× · get_graph_state called 41×)
- Tool outcomes seen in transcript: 48 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 14274147 total (14236485 prompt · 37662 completion) across 305 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3** — Tool reports `✓ Applied: 22 added, 0 updated` after the persona explicitly requested wording changes to the proposed 22 competency questions. This suggests the tool likely added new items rather than updating/rewording the existing proposed list.
- **Turn 12** — Tool reports `✓ Applied: 8 added, 0 updated` after the user only confirmed 2 new classes and 6 relationships. Count is plausible, but this is the first place the assistant silently adds classes not previously proposed in that batch; worth checking whether the tool actually added exactly what was intended.
- **Turn 23–24** — Real inverse-relationship duplication bug: both `Incident --reviewedIn--> PostIncidentReview` and `PostIncidentReview --reviews--> Incident` remain in the live model. Assistant correctly notices, but cannot clean it up.
- **Turn 32** — Tool says `✓ Applied: 0 added, 10 updated` while the assistant claims it recorded a large property batch spanning many classes (far more than 10 fields). Strong sign that many stated property edits were not actually persisted, or at least not all of them.
- **Turn 34** — Tool says `✓ Applied: 0 added, 4 updated` after recording RecoveryPlan, BackupSet, MajorIncident, and PostIncidentReview properties; likely only 4 updates persisted despite multiple properties per class. Again suggests mismatch between assistant recap and actual tool state.
- **Turn 36** — Tool says `✓ Applied: 0 added, 2 updated` after the assistant says it recorded `BusinessService.healthState` and `Problem.status` and explicitly excluded others; this one is fine, but highlights inconsistency with earlier much larger property batches that got surprisingly low update counts.
- **Turn 42** — Tool reports `✓ Applied: 0 added, 9 updated` for a batch of 6 relationship meanings. Count mismatch suggests over-application or inclusion of extra edges not mentioned.
- **Turn 55** — Tool reports `✓ Applied: 0 added, 4 updated` after a batch containing allowed-value lists for 10 properties. Clear mismatch between claimed and persisted changes.
- **Turn 57** — Tool reports `✓ Applied: 0 added, 8 updated` after 9 standardized value sets were supposedly recorded. Another persistence/count mismatch.
- **Turn 63** — Assistant says the closure rule is recorded even though, one turn earlier, it insisted additional modeling was needed to make it faithful. It then records the full plain-language rule after the user rejected adding properties. Not a contradiction with the user’s preference, but a reversal in the assistant’s stated method.
- **Turn 72** — Assistant records `submitRegulatoryNotification` action effect/verification first, then later admits the tool schema only allows preconditions as rule names and could not store the fuller preconditions. This exposes a prompt/tool-schema mismatch discovered late.
- **Turn 74–75** — Assistant identifies real reachability gaps from `RegulatoryNotification` only after already creating the action/rule depending on those paths. This is a sequencing bug: action validation should have happened before declaring the action complete.
- **Turn 76** — Final validation says “Every class users talk about is represented as a class,” but earlier the persona explicitly said not to model Application Owner / Technical Owner as classes. Wording is too broad and misleading in the final validation.

## Noteworthy observations
- **Turn 1** — Good start: the assistant anchors on competency questions first rather than jumping into classes.
- **Turn 2** — Strong elicitation move: atomizing compound competency questions improved testability and exposed wording nuances.
- **Turn 3–4** — Good focused follow-up on subordinate roles and operating context; efficient and relevant to future routing/action logic.
- **Turn 8–10** — The “tool does not support subclassing” constraint was handled explicitly and repeatedly, which helped avoid accidental taxonomic modeling.
- **Turn 10–15** — Good discipline in challenging direct edges the expert didn’t support. Assistant often avoided forcing “diagram-neatening” relationships.
- **Turn 11–14** — Efficient recovery when the expert rejected `ITService -> ConfigurationItem`; assistant pursued the intermediate structure instead of arguing.
- **Turn 13–14** — Nice restraint: when the persona refused a generic ConfigurationItem bridge verb, the assistant accepted it rather than overfitting.
- **Turn 15–18** — Good follow-up to close the routing derivation gap; assistant noticed that recorded assignment links were insufficient for answering “who should take it now?”
- **Turn 17–19** — Good catch that the confirmed “caused by change/deployment” questions had no relationship path yet. Assistant correctly forced explicit derivation logic.
- **Turn 19–21** — Strong modeling hygiene around workaround selection: assistant didn’t accept a vague direct Workaround edge and elicited the Problem/KnownError path.
- **Turn 23–25** — Good that the assistant explicitly surfaced the inverse-edge warning rather than pretending the model was clean.
- **Turn 25–27** — Smart handling of cybersecurity incident without subclassing, but somewhat inefficient: it took several turns to arrive at `SecurityEvent` after first recognizing a missing Incident/CybersecurityIncident connection.
- **Turn 28–35** — Property elicitation was thorough but became somewhat over-batchy; multiple later tool count mismatches suggest the assistant should validate persistence after each property batch instead of giving broad recaps.
- **Turn 31–35** — Good pushback when the persona answered a “state/status” question with non-state properties. This was one of the better moments of interviewer discipline.
- **Turn 41–47** — Language-layer work was systematic but long. Useful for completeness, though likely inefficient relative to higher-value remaining structural gaps.
- **Turn 47–53** — Alias elicitation was handled well; assistant stopped soliciting relationship aliases after consecutive “none” responses, which is efficient behavior.
- **Turn 54–57** — Requiring “what breaks if missing or wrong?” after each allowed-value batch is a strong prompt pattern for distinguishing true decision-bearing enumerations from arbitrary vocabularies.
- **Turn 58–60** — Good rule elicitation: assistant proposed candidate logic, then accepted substantial correction from the expert rather than defending initial heuristics.
- **Turn 61–63** — The closure-rule exchange is important prompt feedback: the expert strongly preferred faithful plain-language rules over shortcut booleans. The agent should likely anticipate this modeling style earlier.
- **Turn 64–67** — Assistant moved into actions even though explicit Phase 1 action gathering had not happened. It justified this reasonably, but this is a process deviation worth noting.
- **Turn 67–69** — Good that `declareMajorIncident` verification was expanded to operational artifacts, not just existence of a record.
- **Turn 70–75** — `submitRegulatoryNotification` was the weakest action sequence: the assistant proposed under-modeled preconditions, then discovered schema/tool limitations, then discovered missing graph reachability. This exposed several layers of incompleteness late.
- **Overall** — Interview technique was generally strong: focused, corrective, and willing to reject unsupported edges. Main optimization opportunity is tighter synchronization with actual tool persistence/state to avoid recapping edits that the tool may not have stored.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
