# Ontology-recovery eval report

Generated: 2026-07-30T17:13:11.723Z

## Headline metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **24.5%** | **33.7%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 29.4% / 86.4% / 43.9% | 50.0% / 63.6% / 56.0% | 20/68 full · 14/28 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 5.6% / 15.4% / 8.2% | 9.8% / 10.3% / 10.0% | 6/108 full · 4/41 scoped ground-truth relationships matched; 39 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 16.2% | 34.6% | 18/111 full · 9/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 29.8% | 34.3% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 61 turns, 941s wall-clock
- Real app-agent API calls: 112 (apply_ontology_yaml called 47× · get_graph_state called 4×)
- Tool outcomes seen in transcript: 47 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 59:** `submitMaterialityAssessment` uses `canDecideRegulatoryNotification` as its precondition. That rule requires the Materiality Assessment to be `Completed` and have an outcome, which is circular for an action whose effect is to submit/complete the assessment and populate the outcome. This should likely have a separate rule such as `canSubmitMaterialityAssessment`.
- **Turn 55–58:** `canCloseIncident` is reused as the precondition for `conductPostIncidentReview`. That may be too strong or semantically wrong: conducting a PIR is not the same as closing an incident, and PIRs may occur after closure or have different prerequisites.
- **Turn 50–54:** Severity values were captured as both `Critical/High/Medium/Low` and `Sev 1–4` without eliciting an explicit mapping. If both are allowed “interchangeably,” the ontology should encode equivalence/mapping, otherwise rules using severity may be ambiguous.

## Noteworthy observations

- **Turn 3:** The interviewer asked a useful but overloaded follow-up combining day-to-day roles and environment/deployment context in one question. It produced valuable data, but could have been split for cleaner elicitation.
- **Turns 5–11:** Strong class elicitation discipline: small batches, tied to acceptance questions/actions, and explicitly left out plausible-but-unneeded roles such as Application Owner, SOC, NOC, and Technical Expert.
- **Turns 12–20:** Relationship elicitation was systematic and generally well-grounded in competency questions. The interviewer also handled corrections well, e.g. weakening `Emergency Change Request —resolves→ Incident` to `related to`.
- **Turn 20:** The Phase 3 recap compressed many relationships into grouped bullets, which was skimmable but risked obscuring exact verb phrases and directions.
- **Turns 21–27:** Property elicitation stayed focused on decision/action-bearing fields rather than expanding into a full CMDB/ITSM schema — good prompt behavior.
- **Turns 32–49:** Alias elicitation was careful about rejecting broader or direction-sensitive terms, especially `event`, `snapshot`, `upstream/downstream dependency`, and `change environment`.
- **Turns 50–53:** Fixed-choice lists were mostly accepted without probing bank-specific conventions beyond severity. A real expert interview should ask whether these values match tooling exactly, including capitalization and lifecycle edge cases.
- **Turns 53–57:** Good transition from constraints to named rules, especially distinguishing warn vs block behavior.
- **Turns 58–60:** Action definitions were consistently structured with one input class, preconditions, effects, and verification. However, the interviewer should have challenged the questionable preconditions for materiality submission and PIR rather than accepting the persona’s confirmation.
- **Overall:** The interview was highly structured and efficient for building a broad ontology, but the simulated persona tended to rubber-stamp proposed content. The interviewer could improve by asking for concrete examples or counterexamples before finalizing rules and fixed lists.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
