# Ontology-recovery eval report

Generated: 2026-08-03T19:12:47.361Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **36.6%** | **50.7%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 30.9% / 87.5% / 45.7% | 60.7% / 70.8% / 65.4% | 21/68 full · 17/28 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 8.3% / 22.5% / 12.2% | 17.1% / 17.5% / 17.3% | 9/108 full · 7/41 scoped ground-truth relationships matched; 40 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 26.1% | 50.0% | 29/111 full · 13/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 62.4% | 70.1% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **46.8%** | **61.1%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 32.4% / 91.7% / 47.8% | 64.3% / 75.0% / 69.2% | 22/68 full · 18/28 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 17.6% / 47.5% / 25.7% | 34.1% / 35.0% / 34.6% | 19/108 full · 14/41 scoped ground-truth relationships matched; 40 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 29.7% | 53.8% | 33/111 full · 14/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 83.8% | 86.7% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 51 turns, 961s wall-clock
- Real app-agent API calls: 133 (apply_ontology_yaml called 39× · get_graph_state called 43×)
- Tool outcomes seen in transcript: 39 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 18:** Tool result says “0 added, 3 updated” after adding properties for **Incident, Alert, and Event**. This is likely normal if properties are stored as class updates, but the assistant says it recorded all properties without verifying that all named properties were successfully applied. Same pattern repeats later; not necessarily a bug, but opaque.
- **Turn 36:** Fixed-choice values were provided for four properties (**Incident.severity**, **Incident.priority**, **Incident.status**, **Alert.status**), but tool result says only **2 updated**. The assistant still states all four were recorded. Possible tool granularity issue, but it looks like a potential missed/misapplied edit.
- **Turn 37:** Values were provided for six properties, but tool result says **4 updated**; assistant claims all recorded. Potential misapplied edit or misleading tool summary.
- **Turn 38:** Values were provided for eight properties, but tool result says **7 updated**; assistant claims all recorded. Potential missed property.
- **Turn 39:** Values were provided for ten properties, but tool result says **8 updated**; assistant claims all recorded. Potential missed properties.
- **Turn 40:** Constraint/action-blocking logic was elicited and confirmed, but no tool call recorded it. If constraints are intended ontology artifacts, this may be a missed persistence step.
- **Turn 42:** The user suggested adding a “verified resolution” clarification to **canUpdateIncidentStatus**, and the assistant says it recorded the rule “with your clarifications,” but the transcript does not show the exact stored rule. Possible overclaim if the rule did not include that added clarification.
- **Turn 43:** **canSendRegulatoryNotification** requires notification status `approved`, but earlier allowed values for **RegulatoryNotification.status** did **not** include `approved` (values were draft, pending-approval, submitted, accepted, rejected). This is a real contradiction that the interviewer missed.
- **Turn 46:** **declareMajorIncident** verification requires an Incident Commander identified or assigned, but **canDeclareMajorIncident** does not require one, and there is no action to assign an Incident Commander. This may make verification fail despite action preconditions passing.
- **Turn 46:** **acknowledgeAlert** effect says acknowledgement timestamp is recorded “where available,” but Alert properties only include **triggeredAt** and no **acknowledgedAt**. Either the property is missing or the effect is inconsistent.
- **Turn 48:** **executeEmergencyChange** verification requires **executedAt** present, but the effect only says status becomes `executed`; it does not explicitly say **executedAt** is recorded. Minor inconsistency.
- **Turn 48:** **restoreFromBackupSet** verification expects “restore/recovery completed,” but Backup Set allowed statuses are scheduled/running/successful/failed/expired/verified; the action effect does not define what property/relationship changes to mark completion. This is underspecified.
- **Turn 49:** **conductPostIncidentReview** effect says findings are documented, but no **findings** property was defined on Post-Incident Review; only **rootCause** exists. Inconsistency/missing property.
- **Turn 51:** Final validation claims all fixed allowed values are captured, despite earlier suspicious tool update counts and the explicit `approved` vs RegulatoryNotification.status contradiction.

## Noteworthy observations

- **Turn 1:** Good kickoff: the interviewer establishes acceptance-test questions/actions before modeling, which keeps later ontology decisions grounded.
- **Turn 2:** Good role-context probe; it uncovered related roles while explicitly avoiding automatic inclusion.
- **Turns 3–8:** Efficient batching of candidate classes and asking whether to keep/merge/property-model them. The interviewer correctly avoided adding **Root Cause** as a class after the persona chose it as a property.
- **Turn 6:** Good handling of **Emergency Change** vs **Change** despite no subclassing support; interviewer explicitly asked whether separate handling justifies a separate class.
- **Turns 9–16:** Relationship elicitation was systematic and often focused on “recommend/find” paths, not just post-action records. Strong technique.
- **Turn 15:** Good recognition that direct relationships may be needed even when multi-hop paths exist, but it also introduced potentially redundant edges without much cost/complexity discussion.
- **Turn 16:** Useful relationship recap grouped by function; helped validate coverage.
- **Turns 17–22:** Property elicitation was thorough and tied to decision/action needs, though the persona tended to rubber-stamp proposals. More challenge questions could have improved quality.
- **Turns 23–34:** Meanings and aliases phase was methodical and captured exclusions for near-synonyms, which is valuable for semantic precision.
- **Turn 35 onward:** Fixed-choice phase was useful, but the interviewer should have cross-checked proposed rule statuses against allowed values immediately.
- **Turn 39:** Good question about “what breaks if missing/wrong” to distinguish action-blocking constraints from ordinary metadata.
- **Turns 41–45:** Rules were sensibly organized around actual actions. However, the interviewer missed consistency checks between rules and allowed values.
- **Turns 46–49:** Action definitions were clear and consistently structured with input class, precondition, effect, and verification.
- **Turn 50:** Strong final validation caught the missing **Incident —correlates with→ Alert** relationship. This shows effective competency-question coverage checking.
- **Overall:** The interviewer maintained state well across a very long session and repeatedly summarized before moving phases. Main weakness is insufficient validation of stored tool updates and internal consistency among allowed values, rules, effects, and verification steps.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
