# Ontology-recovery eval report

Generated: 2026-09-03T08:17:14.333Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **64.9%** | **48.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 66.2% / 97.8% / 78.9% | 83.3% / 43.5% / 57.1% | 45/68 full · 20/24 scoped ground-truth classes matched; 46 recovered |
| Relationship recall / precision / F1 | 39.8% / 60.6% / 48.0% | 61.1% / 31.0% / 41.1% | 43/108 full · 22/36 scoped ground-truth relationships matched; 71 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 55.9% / 86.1% / 67.8% | 92.0% / 31.9% / 47.4% | 62/111 full · 23/25 scoped ground-truth properties matched; 72 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 90.9% | 91.7% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **67.7%** | **49.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 67.6% / 100.0% / 80.7% | 87.5% / 45.7% / 60.0% | 46/68 full · 21/24 scoped ground-truth classes matched; 46 recovered |
| Relationship recall / precision / F1 | 45.4% / 69.0% / 54.7% | 61.1% / 31.0% / 41.1% | 49/108 full · 22/36 scoped ground-truth relationships matched; 71 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 55.9% / 86.1% / 67.8% | 92.0% / 31.9% / 47.4% | 62/111 full · 23/25 scoped ground-truth properties matched; 72 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 90.9% | 91.7% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 64.7% / 78.6% | 11/11 ground-truth rules matched (core condition equivalence, not name alone); 17 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 80.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 39.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 34.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.5% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 100.0% / 64.7% / 78.6% | 11/11 ground-truth rules matched (core condition equivalence, not name alone); 17 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 80.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 39.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 34.3% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 24.5% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 131 turns, 1899s wall-clock
- Real app-agent API calls: 228 (apply_ontology_yaml called 84× · get_graph_state called 9×)
- Tool outcomes seen in transcript: 84 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 15741187 total (15695816 prompt · 45371 completion) across 369 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 5** — Contradiction between tool and assistant: tool says `✓ Applied: 11 added, 0 updated`, but the assistant says the tool *rejected* the actions because input classes do not exist yet and that the action phase is not finished.
- **Turn 5** — The assistant proceeds after a claimed failed persistence without reconciling state; then a system message reports **11 unresolved consistency problems**, confirming state confusion.
- **Turn 14** — Tool reports `✓ Applied: 8 added, 0 updated` after only confirming **Application** as a new class. Assistant claims it recorded both the new class and relationship paths, but no user confirmation for those 7 extra additions appears in the transcript.
- **Turn 18** — Tool reports `✓ Applied: 17 added, 0 updated` after the user only confirmed 3 new classes (Problem, KnownError, PostIncidentReview). This suggests silent persistence of many inferred relationships/classes without explicit confirmation.
- **Turn 20** — Assistant says it “recorded the new classes and relationships” before resolving a contradiction about canonical direction for Communication↔Incident; likely persisted conflicting edges first, then repaired later.
- **Turn 22** — Assistant claims tool limits prevent subtype/subclass modeling, but earlier it had already added `MajorIncident` as a class and relationships around it. This reveals late discovery of a modeling/tool constraint after state had already been shaped around it.
- **Turn 47** — Tool removes a duplicate `Event → ITService` edge, indicating the assistant/tool added the same relationship twice and only caught it later.
- **Turn 48** — Assistant correctly catches that the stored meaning for `runsInEnvironment` mismatches the actual relationship, showing a real misapplied edit to relationship meaning.
- **Turn 53** — Tool reports only `3 updated` even though the user provided allowed values/impact notes for 10 properties. This looks like partial application or misleading tool feedback.
- **Turn 82** — Assistant says it “resolved both warnings” after the user only answered the second issue (sendStakeholderCommunication). The first (`closeIncident` effect/verification alignment) was not directly answered in that turn.
- **Turn 87** — Assistant initially treats missing `RegulatoryNotification ↔ Incident` as blocking, despite the user previously being comfortable with indirect derivation paths; this is not fatal, but it shows inconsistent standards for when direct links are required.
- **Turn 99** — Assistant claims there is no direct modeled fact that an incident affects a configuration item, but earlier validation/paths already leaned on incident-to-CI notions. The model’s tracked state around that concept seems muddled until the direct edge is finally added.
- **Turn 118** — Validation says several late-added classes “still lack meaning sentences,” then immediately asks for them; fine. But it also says “Every class has at least one relationship: not fully true yet” while naming classes that actually *do* have relationships, suggesting a confused or templated validation report.
- **Turn 118** — Validation identifies CQ19 as only partly covered because there is no explicit “already notified” state, but later accepts inference from Communication.status without checking whether the status value set actually distinguishes sent/notified cleanly for stakeholder-specific notification.
- **Turn 131** — Final validation says the ontology “passes deterministic validation checks” despite acknowledged partial CQ coverage and several deliberate omissions; not necessarily wrong, but phrased as stronger completion than the preceding limitations suggest.

## Noteworthy observations
- **Turn 1–3** — Good interview control at the start: the assistant pushes for competency questions first and gets a strong acceptance-test basis before modeling.
- **Turn 2** — Splitting the user’s questions into a more atomic test set was useful, but the first pass over-split some operationally unified concepts (release vs deployment vs change; closure readiness), and the persona had to correct it.
- **Turn 4** — Good micro-clarification on “contain” vs “isolate”; this was an efficient, domain-relevant follow-up that improved action precision.
- **Turn 5** — Poor recovery from tool/state issues: instead of reconciling the 11 unresolved action problems immediately, the assistant moved into a different follow-up about roles/context.
- **Turn 6–11** — Strong phased elicitation style: classes were introduced in justified batches tied to accepted questions/actions, which kept the ontology fairly grounded.
- **Turn 12–17** — Good insistence on path descriptions rather than just endpoints. This elicited richer operational structure and surfaced missing classes like Application, Problem, KnownError, and PostIncidentReview.
- **Turn 13–26** — The assistant repeatedly let the persona introduce new classes mid-relationship discussion, then had to interrupt to confirm them. Functional, but somewhat inefficient; a prompt could explicitly warn earlier that introducing unnamed intermediary concepts will trigger confirmation pauses.
- **Turn 19–23** — Good handling of a tool limitation around subclasses once it was noticed; the assistant explicitly forced a decision rather than faking ontology structure.
- **Turn 24–26** — Nice restraint in not overconnecting everything directly; the interviewer repeatedly accepted “no direct link” and kept the model operational rather than maximalist.
- **Turn 28 onward** — Property elicitation was generally disciplined: “only decision-relevant properties” is a good prompt pattern and kept the ontology from ballooning.
- **Turn 31–35** — Strong tactic asking for allowed values only where obviously controlled. This made later rule-writing more machine-checkable.
- **Turn 52–54** — Asking “what breaks if missing or wrong?” was excellent. It distinguishes essential controlled vocabularies from merely descriptive fields.
- **Turn 54–57** — Very good catch separating **qualification** from **declaration preconditions** for major incidents. This is exactly the kind of operational nuance ontology interviews often miss.
- **Turn 59–64** — Closure-rule elicitation was handled carefully, but the assistant had to simplify twice because earlier modeling omitted communication completeness and PIR status. This shows the value of checking rule expressibility against the current ontology before accepting rich procedural language.
- **Turn 65–79** — Good decision to keep separate safety rules for runbooks/workarounds/backup sets/recovery plans. The assistant resisted collapsing superficially similar decisions.
- **Turn 79–109** — The action phase was somewhat inefficient because action inputs were effectively settled twice: first tentatively too early, then revisited after relationships/rules, then revised again when path-direction issues emerged.
- **Turn 82–109** — Repeated path-direction problems for actions (`Incident ↔ Communication`, `Incident ↔ Change`, `BackupSet ↔ Incident/RecoveryPlan`) suggest the agent should anticipate action navigability earlier, not only at the validation tail end.
- **Turn 105–109** — Good prompt optimization insight: when the tool only supports one input class and directed links matter, actions should be anchored on governance context (often Incident) rather than the manipulated artifact. The persona repeatedly preferred that.
- **Turn 109–117** — The bounded expansion pass was well done: narrow categories, explicit scope check, and only a few justified additions.
- **Turn 115–117** — CybersecurityIncident addition is a mixed bag: useful domain-wise, but because subtype modeling is unsupported, it creates a parallel track that may be awkward in querying. Good that the assistant explicitly noted the tradeoff.
- **Turn 118** — Validation summary was helpful and skimmable, but it arrived very late. A lighter-weight interim validation pass earlier might have caught the action/path issues sooner.
- **Overall** — The interviewer was strong at incremental ontology elicitation and catching semantic mismatches, but weaker at maintaining exact state fidelity with the tool. The biggest prompt-improvement opportunity is to force earlier reconciliation whenever the tool output and assistant narrative disagree, rather than continuing and repairing later.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
