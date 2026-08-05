# Ontology-recovery eval report

Generated: 2026-08-05T10:23:38.981Z

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
| **Recovery effectiveness (composite)** | **16.1%** | **16.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 26.5% / 78.3% / 39.6% | 46.4% / 56.5% / 51.0% | 18/68 full · 13/28 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 6.5% / 13.5% / 8.8% | 7.3% / 5.8% / 6.5% | 7/108 full · 3/41 scoped ground-truth relationships matched; 52 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 11.7% / 16.3% / 13.6% | 19.2% / 6.3% / 9.4% | 13/111 full · 5/26 scoped ground-truth properties matched; 80 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 2.5% | 0.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **30.5%** | **32.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 27.9% / 82.6% / 41.8% | 50.0% / 60.9% / 54.9% | 19/68 full · 14/28 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 11.1% / 23.1% / 15.0% | 14.6% / 11.5% / 12.9% | 12/108 full · 6/41 scoped ground-truth relationships matched; 52 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 11.7% / 16.3% / 13.6% | 23.1% / 7.5% / 11.3% | 13/111 full · 6/26 scoped ground-truth properties matched; 80 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 51.7% | 50.0% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 9 turns, 266s wall-clock
- Real app-agent API calls: 17 (apply_ontology_yaml called 8× · get_graph_state called 0×)
- Tool outcomes seen in transcript: 8 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 1**: The assistant’s opening question block is duplicated verbatim in the same response.
- **Turn 9**: The assistant notes that `promoteToIncident` only has **Alert** as input, even though the elicited model clearly includes promotion from **Alert, Event, and Ticket**. This looks like an incomplete/misapplied ontology edit or a limitation not resolved during the interview.
- **Turn 8/9**: Potential modeling ambiguity between **Regulator Notification** as an incident communication type and **Regulatory Submission / Initial Notification** as part of regulatory reporting. The interviewer did not clarify whether these are the same concept, related concepts, or separate artifacts.

## Noteworthy observations

- **Turn 1–9**: Strong interview structure: the assistant progressively built from service dependencies to incidents, recovery, communications, evidence, PIRs, regulatory reporting, and finally detection/intake.
- **Turn 2–8**: Good use of short summaries after each tool application; this helped maintain state and confirm what had been captured.
- **Turn 3–8**: Questions were often leading with many examples. Efficient for coverage, but may have encouraged the persona to affirm generic banking/ITIL concepts rather than provide bank-specific distinctions.
- **Turn 5–6**: Evidence management was well elicited, including categories, quality requirements, accountability, retention, evidence packs, and heightened-evidence triggers.
- **Turn 7–8**: Regulatory reporting was covered well at workflow level, but the interviewer missed obvious follow-ups on jurisdiction-specific regulators, exact statutory thresholds, and whether “24 hours from determining reportability” differs from “24 hours from detection.”
- **Turn 8**: Good recovery of a missing area: the assistant noticed detection/intake had not yet been modeled and added a focused final section.
- **Turn 9**: The assistant should probably have immediately asked permission to add `promoteTicketToIncident` and `promoteEventToIncident`, or generalized the action input, rather than ending with a note.
- **Throughout**: The interviewer captured many classes and enums but did not probe much for cardinalities, mandatory vs optional relationships, lifecycle states, or disjointness/subclass distinctions.
- **Throughout**: No concrete incident example was used to validate the model end-to-end; a walkthrough would likely have exposed ambiguities around roles, approvals, evidence, and regulatory notification artifacts.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
