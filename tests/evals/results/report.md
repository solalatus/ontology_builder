# Ontology-recovery eval report

Generated: 2026-07-30T14:45:10.048Z

## Headline metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **28.2%** | **39.4%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 35.3% / 65.8% / 45.9% | 67.9% / 55.3% / 60.9% | 24/68 full · 19/28 scoped ground-truth classes matched; 38 recovered |
| Relationship recall / precision / F1 | 9.3% / 9.7% / 9.5% | 17.1% / 9.7% / 12.4% | 10/108 full · 7/41 scoped ground-truth relationships matched; 72 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 22.5% | 46.2% | 25/111 full · 12/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 34.9% | 38.2% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 46 turns, 1089s wall-clock
- Real app-agent API calls: 87 (apply_ontology_yaml called 34× · get_graph_state called 7×)
- Tool outcomes seen in transcript: 34 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 11:** The interviewer/tool could not actually rename/delete `AffectedSystem`; it added `System` and left the obsolete class/edge in place. The assistant correctly noticed this, but the ontology remained polluted for the rest of the session.
- **Turn 14:** Tool reported “11 added” for a batch where one proposed relationship (`updatedTo`) was explicitly corrected to `isReviewedBy`. Without state details, possible risk that both the rejected and corrected regulatory committee relationships were added; assistant says only corrected one was recorded.
- **Turn 17:** Tool reported “8 added” after adding only two classes plus unspecified relationships. The assistant did not enumerate exactly which relationships were added for `ResponseAction`/`DecisionRecord`, making later validation dependent on assumptions.
- **Turn 19 and onward:** Property updates show small counts like “1 updated,” “6 updated,” etc. for many proposed properties. This may be normal if the tool updates classes in bulk, but if counts represent individual properties, many properties may not have been recorded. The assistant did not verify property-level persistence.
- **Turn 32:** Persona’s “Remove” summary included `emergency change for incident`, which was not part of that batch and had been accepted in turn 31. The assistant did not challenge this contradiction; unclear whether it accidentally removed/overrode a previously accepted alias.
- **Turn 41:** Assistant says it “added the supporting rule `canNotifyTechnicalOwner`,” though this rule was not explicitly proposed back to the persona before recording. The persona suggested a precondition, not a named rule.
- **Turn 42:** Assistant added direct relationships from `DecisionRecord` to `TechnicalChange` and `EmergencyChangeRequest` based on verification needs, but did so without explicitly asking before applying.
- **Turn 45–46:** Final validation still had unresolved obsolete `AffectedSystem`/`Incident —affects→ AffectedSystem`; assistant declared “Final validation is complete” despite a known live-canvas issue.

## Noteworthy observations

- **Turn 1:** Strong start: interviewer anchors ontology to real competency questions/actions and explains phased process clearly.
- **Turns 3–4:** Good gap-checking prompt for roles, environments, and governance forums before modeling classes.
- **Turn 5:** Candidate class list was comprehensive, but the persona simply rubber-stamped “keep all.” Interviewer could have pushed harder on whether separate role classes vs a shared `Person/Team` pattern would scale.
- **Turn 7–9:** Good handling of executive sponsor modeling ambiguity; interviewer paused and asked whether sponsorship belongs on `Service`, `Incident`, or both.
- **Turn 9–11:** Good follow-up on `AffectedSystem` naming; interviewer correctly avoided deciding for the expert and elicited broader `System`.
- **Turns 11–17:** Relationship elicitation was systematic and acceptance-test driven. However, many inverse/redundant relationships were accepted, potentially making the ontology dense and harder to maintain.
- **Turn 16:** Excellent recognition that “current actions” and “decisions” were not covered by `CorrectiveAction`; adding `ResponseAction` and `DecisionRecord` fixed a real modeling gap.
- **Turns 18–23:** Property elicitation stayed mostly decision-bearing and avoided low-value audit fields, which is good technique.
- **Turns 27–32:** Alias elicitation was careful about only true synonyms. However, the simulated persona often rejected common operational phrases as “informal,” which may reduce natural-language coverage; interviewer did not challenge questionable rejections like “on-call,” “comms,” or “environment.”
- **Turns 33–36:** Fixed-value elicitation was efficient and included “what breaks if missing/wrong,” a useful prompt for later rules.
- **Turns 37–39:** Rules were clear and action-oriented, but many conditions reference concepts not explicitly modeled as properties/classes, e.g. “customer-facing service,” “regulated business process,” or “approved execution according to governance process.”
- **Turns 40–43:** Action definitions followed the requested one-input-class structure and included verification steps, which is strong. Some actions with input class `MajorIncidentBridge`/`CrisisManagementTeam` still require an incident context, relying on relationships rather than input arguments.
- **Turn 44:** Validation pass was useful and found meaningful missing relationships, especially `DecisionRecord —recordsDecisionFor→ RecoveryPlan`.
- **Overall:** Interviewer was thorough and state-aware, but heavily confirmation-driven; the persona mostly agreed with proposals. More open-ended elicitation or challenge questions could have surfaced bank-specific nuance instead of accepting generic ITIL-like defaults.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
