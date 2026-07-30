# Ontology-recovery eval report

Generated: 2026-07-30T18:59:47.755Z

## Headline metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **31.8%** | **45.2%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 33.8% / 85.2% / 48.4% | 71.4% / 74.1% / 72.7% | 23/68 full · 20/28 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 9.3% / 22.2% / 13.1% | 19.5% / 17.8% / 18.6% | 10/108 full · 8/41 scoped ground-truth relationships matched; 45 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 31.5% | 57.7% | 35/111 full · 15/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 34.2% | 31.8% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 40 turns, 624s wall-clock
- Real app-agent API calls: 76 (apply_ontology_yaml called 33× · get_graph_state called 3×)
- Tool outcomes seen in transcript: 33 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 36–37:** `requiresRegulatoryNotification` includes “Regulatory notification status is not submitted/accepted/withdrawn,” but `createRegulatoryNotificationDraft` creates the notification. If no notification exists yet, this precondition may be impossible to evaluate or could block draft creation.
- **Turn 36–37:** `canDeclareMajorIncident` requires the “major-incident declaration initiator is identified,” but `declareMajorIncident` creates/updates the `MajorIncidentDeclaration`. The initiator is not an input to the action, so the rule may require data on a record that does not exist yet.
- **Turn 38–40:** `canSendStakeholderUpdate` was created with a “message content is provided” precondition before `Communication.messageContent` existed. The agent caught and fixed this at validation, but it indicates the action/rule/property consistency check happened late.
- **Turn 40:** Validation claims the question “What are the criteria for service health state?” is covered by allowed values on `healthState`. Allowed values like `healthy/degraded/unavailable/unknown` do not define criteria or thresholds, so this competency question is not truly satisfied.
- **Turn 28–32:** `Authorization → authorizes → EmergencyChange` is defined as permitting or denying execution, while aliases include `approves`/`permits` and `Authorization.decision` can be `rejected` or `revoked`. This conflates an authorization record with a positive approval.

## Noteworthy observations

- **Turns 5–14:** The interviewer did a good job batching relationships and checking distinctions such as Alert vs Event, Change vs EmergencyChange, and Stakeholder vs IncidentCommander.
- **Turns 15–20:** Property elicitation was systematic and tied back to the Phase 1 questions/actions, which kept the ontology from becoming purely speculative.
- **Turns 23–33:** Alias collection was thorough, but many aliases were accepted by broad confirmation. The interviewer rarely challenged potentially ambiguous terms like `owner`, `managed by`, `rolls back`, or `CAPA`.
- **Turns 34–35:** Controlled vocabularies were useful, but the interviewer accepted “all listed values are blockers” very broadly. Some missing values, e.g. `expectedRecoveryTime`, may block certain decisions but not all stakeholder communication.
- **Turns 37–39:** Action modeling followed a clear pattern: input, preconditions, effect, verification. However, actions like `assignResolverGroup` refer to a “selected ResolverGroup” without making that selected group an input or explicit linked object.
- **Turns 39–40:** The validation pass was valuable and caught a real missing property. This suggests an earlier automated consistency check between preconditions and available properties would improve the flow.
- **Overall:** The interviewer was efficient but highly leading. The persona mostly rubber-stamped proposed structures, so bank-specific nuances such as exact major-incident thresholds, materiality criteria, regulatory reporting deadlines, and health-state criteria were under-elicited.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
