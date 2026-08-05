# Ontology-recovery eval report

Generated: 2026-08-05T10:06:02.126Z

> **Metric tables re-scored offline.** Properties were matched many-to-one when this run
> executed; `matchProperties()` (`lib/recoveryMetrics.mjs`) now assigns them one-to-one, which
> also gives the dimension a precision and an F1, and the composite averages property F1
> rather than property recall. The two tables below are the current scorer's numbers over this
> run's own persisted model and its own stored judge verdicts
> (`node tests/evals/rescore-saved-run.mjs <this directory>`); no interview was re-run and no
> judge was re-asked. Every other section is as this run wrote it.

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **25.3%** | **15.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 36.8% / 26.6% / 30.9% | 53.6% / 16.0% / 24.6% | 25/68 full · 15/28 scoped ground-truth classes matched; 94 recovered |
| Relationship recall / precision / F1 | 2.8% / 2.4% / 2.6% | 4.9% / 1.8% / 2.6% | 3/108 full · 2/41 scoped ground-truth relationships matched; 169 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 12.6% / 12.0% / 12.3% | 15.4% / 3.4% / 5.6% | 14/111 full · 4/26 scoped ground-truth properties matched; 117 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 55.6% | 30.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **31.7%** | **24.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 39.7% / 28.7% / 33.3% | 53.6% / 16.0% / 24.6% | 27/68 full · 15/28 scoped ground-truth classes matched; 94 recovered |
| Relationship recall / precision / F1 | 11.1% / 7.7% / 9.1% | 19.5% / 5.3% / 8.4% | 12/108 full · 8/41 scoped ground-truth relationships matched; 169 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 12.6% / 12.0% / 12.3% | 15.4% / 3.4% / 5.6% | 14/111 full · 4/26 scoped ground-truth properties matched; 117 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 71.9% | 60.0% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 12 turns, 470s wall-clock
- Real app-agent API calls: 23 (apply_ontology_yaml called 11× · get_graph_state called 0×)
- Tool outcomes seen in transcript: 11 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 10**: The assistant captured communication channels including **SMS** and **mobile app**, but the persona only mentioned examples of **social media** and **email** for channel-specific approval, plus earlier communication types like status page, branch, and contact centre. This looks like a hallucinated/misapplied model addition.
- **Turn 12**: The assistant states **RPO is linked to Business Services, IT Services, and Applications**. The persona only said RTO/RPO targets apply to **critical services**; extending this explicitly to applications may be an unsupported modeling assumption.
- **Turn 2**: The assistant inferred that **Service Owners are accountable for Business Services, IT Services, and Applications**. The persona said “Service Owner” is tracked but did not explicitly scope ownership across all three entity types.

## Noteworthy observations

- **Turn 1–3**: Strong opening technique: the interviewer starts with foundational service/dependency modeling, then validates relationship direction and controlled values before moving on.
- **Turn 4–5**: Good handling of modeling constraints. The interviewer explicitly asks whether **Major Incident** should be a separate class or a boolean/status on **Incident**, avoiding premature ontology structure.
- **Turn 5–7**: Efficient progression from command structure into recovery/emergency change because prior answers introduced emergency change, DR, and service-offline decisions.
- **Turn 6**: Good targeted clarification on whether “taking a service offline” applies only to Business Services or also Customer-facing Services, IT Services, and Applications.
- **Turn 7–10**: Evidence, communications, regulatory reporting, and PIR were covered in a logical governance sequence and repeatedly summarized, which helps state tracking.
- **Turn 8–10**: Good follow-up on regulatory reporting subtypes and reporting-clock start time; these are important ontology distinctions.
- **Turn 10–11**: The interviewer captured closure rules, corrective-action lifecycle, and problem-record triggers well; these are useful workflow constraints.
- **Throughout**: The interviewer often asked large multi-part questions. This was efficient for coverage, but it encouraged generic, checklist-style answers. More concrete examples could have improved ontology precision.
- **Missed follow-up**: No concrete sample incident was elicited to validate the model end-to-end, e.g., a payment outage flowing through detection, declaration, command roles, emergency change, communications, regulator notification, PIR, and corrective actions.
- **Missed follow-up**: The interviewer did not ask for exact cardinalities/relationship constraints, such as whether an Incident can affect multiple services, whether one Communication can cover multiple incidents, or whether a PIR always has exactly one Problem Record.
- **Missed follow-up**: Severity and priority were clarified conceptually, but the interviewer did not ask whether there is a formal mapping matrix or whether Sev/P values are modeled independently as controlled vocabularies.
- **Turn 12**: Good closing summary and explicit list of remaining refinements, especially exact regulatory deadlines, escalation thresholds, RTO/RPO values, and governance forum cadence.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
