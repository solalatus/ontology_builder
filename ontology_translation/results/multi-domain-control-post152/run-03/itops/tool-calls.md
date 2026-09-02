# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-09-02T19:37:35.716Z

### Turn 1 — user

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### Turn 1 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 1 — tool

competency_questions: []
classes: {}
relationships: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 1 — assistant

Great — we’ll start by capturing the acceptance test for the ontology: the real questions the future agent must answer, and the actions it must perform.

Please give me:
- 8–12 real questions this agent should be able to answer, and
- 4–6 real actions it should be able to perform

Use plain business language from your world. Short bullet points are fine. For example, the shape I want is:
- “Which team should handle this incident?”
- “Has the regulator-notification deadline been triggered?”
- “Collect the evidence pack for this case”

I won’t turn them into classes or fields yet; this phase is just requirements.

### Turn 2 — user

Absolutely. From an operations and major-incident point of view, I’d want the agent to answer questions like these:

### Questions the agent should be able to answer
- Which business services are impacted by this incident?
- Which customer channels are affected right now?
- Which IT service is failing, and what does it depend on?
- Which configuration items are affected?
- Which third-party service or vendor sits on the dependency path?
- Which alerts and events are correlated with this incident?
- Who owns the affected service?
- Which resolver group and on-call engineer should be handling it?
- Does this meet the conditions to declare a major incident?
- Which runbook, workaround, backup set, and recovery plan are available for safe use?
- Was this likely caused by a recent change or deployment?
- Has a materiality assessment been completed, and is regulatory notification required or due?
- Are evidence, stakeholder communications, and closure conditions complete?
- Which follow-up corrective actions from earlier reviews are still open for this service?

### Actions the agent should be able to perform
- Acknowledge an alert.
- Assign an incident to the right resolver group.
- Declare a major incident.
- Send an approved stakeholder communication.
- Execute an emergency change for an active incident.
- Submit an approved regulatory notification.
- Close an incident once restoration, evidence, and review conditions are satisfied.

If you want, next I can group these into themes like impact assessment, command and coordination, recovery, reporting, and closure.

### Turn 2 — assistant

That’s a strong starting set. I don’t need themes yet; first I want to make these atomic and confirm them as competency questions and actions.

A few of your questions bundle multiple things together. Please confirm whether this split matches your intent.

Proposed competency questions:
1. Which business services are impacted by an incident?
2. Which customer channels are affected by an incident right now?
3. Which IT service is failing?
4. What does the failing IT service depend on?
5. Which configuration items are affected by an incident?
6. Which third-party service is on the dependency path of the failing service?
7. Which vendor is responsible for the third-party service on that dependency path?
8. Which alerts are correlated with an incident?
9. Which events are correlated with an incident?
10. Who owns the affected service?
11. Which resolver group should handle an incident?
12. Which on-call engineer should handle an incident?
13. Does an incident meet the conditions for major-incident declaration?
14. Which runbook is available for safe use in this situation?
15. Which workaround is available for safe use in this situation?
16. Which backup set is available for safe use in this situation?
17. Which recovery plan is available for safe use in this situation?
18. Was the incident likely caused by a recent change?
19. Was the incident likely caused by a recent deployment?
20. Has materiality assessment been completed for the incident?
21. Is regulatory notification required for the incident?
22. Is regulatory notification due for the incident?
23. Are required evidence items complete for the incident?
24. Are required stakeholder communications complete for the incident?
25. Are incident closure conditions complete?
26. Which corrective actions from earlier reviews are still open for the affected service?

Proposed actions:
1. Acknowledge an alert.
2. Assign an incident to a resolver group.
3. Declare a major incident.
4. Send an approved stakeholder communication.
5. Execute an emergency change for an active incident.
6. Submit an approved regulatory notification.
7. Close an incident once restoration, evidence, and review conditions are satisfied.

Please reply with one of these:
- “Yes, accept as written”
- or list the specific items you want merged, split differently, added, or reworded.

### Turn 3 — user

Mostly right, but I’d want a few adjustments.

### Competency questions
- **1 and 2**: yes, keep split.
- **3 and 4**: I’d keep the idea, but in practice I’d phrase 3 a bit more broadly as **which IT services are affected**, not only “the failing IT service.” Incidents often degrade several services, or the service isn’t fully down.
- **5**: yes.
- **6 and 7**: yes, keep split.
- **8 and 9**: yes, keep split.
- **10**: the concept is right, but I’d reword it to **who owns the affected IT service**. If you mean business accountability instead, that is a separate question from operational service ownership.
- **11 and 12**: yes, keep split.
- **13**: yes.
- **14–17**: yes, keep split.
- **18 and 19**: yes, keep split.
- **20**: I’d reword that slightly to **is a materiality assessment complete for the incident**.
- **21 and 22**: yes, keep split.
- **23**: I’d reword to **are evidence integrity and supporting evidence complete for the incident**. For us it’s not just count-complete; integrity matters.
- **24**: yes.
- **25**: yes.
- **26**: the intent is right, but I’d put it a little differently: **which corrective actions from prior post-incident reviews remain open for the affected service**.

### Additions I would include
You’re missing two questions I would definitely want in the acceptance test:
- **Which business services and customer channels are impacted by this incident?**  
  Even though you split those already, I would still keep the combined operational view because that is how major-incident command often asks for impact first.
- **Which configuration items and third-party services are on the dependency path of the affected IT service?**  
  Same reason: the combined dependency-path view is operationally important, even if you also keep the atomic questions.

### Actions
Your proposed action list is good in substance, but it’s missing a few response actions we actually use:
- **Contain an incident.**
- **Isolate a configuration item linked to an incident.**
- **Fail over a service using an applicable recovery path.**
- **Restore from backup to an approved target.**

So I would **not** accept as written. Keep your seven listed actions, and add those four.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Which business services are impacted by an incident?\n  - text: Which customer channels are affected by an incident right now?\n  - text: Which IT services are affected by an incident?\n  - text: What do the affected IT services depend on?\n  - text: Which configuration items are affected by an incident?\n  - text: Which third-party service is on the dependency path of an affected IT service?\n  - text: Which vendor is responsible for the third-party service on that dependency path?\n  - text: Which alerts are correlated with an incident?\n  - text: Which events are correlated with an incident?\n  - text: Who owns the affected IT service?\n  - text: Which resolver group should handle an incident?\n  - text: Which on-call engineer should handle an incident?\n  - text: Does an incident meet the conditions for major-incident declaration?\n  - text: Which runbook is available for safe use in this situation?\n  - text: Which workaround is available for safe use in this situation?\n  - text: Which backup set is available for safe use in this situation?\n  - text: Which recovery plan is available for safe use in this situation?\n  - text: Was the incident likely caused by a recent change?\n  - text: Was the incident likely caused by a recent deployment?\n  - text: Is a materiality assessment complete for the incident?\n  - text: Is regulatory notification required for the incident?\n  - text: Is regulatory notification due for the incident?\n  - text: Are evidence integrity and supporting evidence complete for the incident?\n  - text: Are required stakeholder communications complete for the incident?\n  - text: Are incident closure conditions complete?\n  - text: Which corrective actions from prior post-incident reviews remain open for the affected service?\n  - text: Which business services and customer channels are impacted by this incident?\n  - text: Which configuration items and third-party services are on the dependency path of the affected IT service?\nactions:\n  acknowledgeAlert:\n    input: Alert\n    effect: Acknowledges the alert.\n    verification: Confirm the alert is recorded as acknowledged.\n  assignIncidentToResolverGroup:\n    input: Incident\n    effect: Assigns the incident to a resolver group.\n    verification: Confirm the incident shows the assigned resolver group.\n  declareMajorIncident:\n    input: Incident\n    effect: Marks the incident as declared as a major incident.\n    verification: Confirm the incident shows major-incident declaration.\n  sendApprovedStakeholderCommunication:\n    input: StakeholderCommunication\n    effect: Sends an approved stakeholder communication.\n    verification: Confirm the communication was sent through the approved channel.\n  executeEmergencyChange:\n    input: Change\n    effect: Executes an emergency change for an active incident.\n    verification: Confirm the emergency change execution is recorded.\n  submitRegulatoryNotification:\n    input: RegulatoryNotification\n    effect: Submits an approved regulatory notification.\n    verification: Confirm the regulatory notification submission is recorded.\n  closeIncident:\n    input: Incident\n    effect: Closes the incident once restoration, evidence, and review conditions are satisfied.\n    verification: Confirm the incident status is closed.\n  containIncident:\n    input: Incident\n    effect: Applies a containment action to the incident.\n    verification: Confirm the incident record shows containment was performed.\n  isolateConfigurationItem:\n    input: ConfigurationItem\n    effect: Isolates a configuration item linked to an incident.\n    verification: Confirm the configuration item is recorded as isolated.\n  failOverService:\n    input: ITService\n    effect: Fails over the service using an applicable recovery path.\n    verification: Confirm the service is running on the designated recovery path.\n  restoreFromBackup:\n    input: BackupSet\n    effect: Restores from backup to an approved target.\n    verification: Confirm the restore to the approved target is recorded."
}
```

### Turn 3 — tool

Applied. Added 39, updated 0 existing item(s).

CONSISTENCY CHECK — 11 new problem(s) from this edit:
  [error] action-input-missing — Action "acknowledgeAlert" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "closeIncident" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "containIncident" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "declareMajorIncident" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "executeEmergencyChange" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "failOverService" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "isolateConfigurationItem" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "restoreFromBackup" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class. Give it the one class the action is fundamentally about.
  …and 1 more.

### Turn 3 — assistant

Captured and persisted: your confirmed competency questions plus the expanded action list.

Short recap of what we now have:
- Competency questions cover impact, dependency path, ownership, routing, declaration, safe recovery options, likely cause, materiality/regulatory workflow, evidence/communications completeness, closure, and open corrective actions.
- Actions now include not just command/reporting steps, but also containment, isolation, failover, and backup restore.

One important note: the tool flagged a structural issue with the actions because their input classes are not defined yet. That’s expected at this stage; we’ll resolve it once we confirm the relevant classes.

Before we move to classes, I need the required narrow follow-up for Phase 1:

For each role you’ve named so far — service owner, resolver group, on-call engineer — is there a closely related role that actually does the day-to-day work under it, and does any of this depend on a specific operating context that changes how it’s handled?

Please answer just those two things:
1. Any additional day-to-day roles under those named roles?
2. Any operating context that changes handling, such as a specific location, channel, time period, service tier, incident severity, or regulatory regime?

### Turn 4 — user

1. **Additional day-to-day roles under those named roles**
- Under **resolver group**, the practical day-to-day role already called out is the **on-call engineer**.
- For **major incidents**, there is also an **incident commander**, which is not “under” service owner or resolver group in a line-management sense, but is a distinct operational role for live coordination.
- I would not invent further sub-roles beyond those unless you want to model a more detailed staffing structure than the operating model actually needs.

2. **Operating context that changes handling**
Yes, several kinds of context change how we handle things:
- **Incident severity** changes escalation and whether major-incident handling is in scope.
- **Environment** matters — production, disaster recovery, pre-production, test, development, and management are handled differently.
- **Customer channel** matters when assessing business impact.
- **Service criticality tier** matters for prioritisation and recovery expectations.
- **Detection source** matters operationally because monitoring, service desk, user report, vendor report, security tooling, and other sources enter through different paths.
- **Cybersecurity versus non-cyber incident context** matters, especially for evidence preservation, assessment, and possible reporting.
- **Regulatory context** matters where materiality assessment and formal notification come into play.
- **Affected service and dependency path** also change routing and response choices, because the right resolver group, vendor escalation path, runbook, backup, or recovery plan depends on what is actually impacted.

### Turn 4 — assistant

Good — that settles the required Phase 1 follow-up.

Recap of what I’ve captured from your answer:
- Additional operational role: **incident commander**.
- I should **not** assume a deeper staffing hierarchy beyond what you named.
- Handling can vary by: **incident severity, environment, customer channel, service criticality tier, detection source, cybersecurity vs non-cyber context, regulatory context, and the affected service/dependency path**.

Before I start proposing classes, one clarification so I don’t silently merge two things that may differ in your organization:

When you say **service owner** and **incident commander**, are those two genuinely different roles the agent must identify separately, or can the same person/role sometimes cover both and you’d still want them modeled as distinct concepts?

### Turn 5 — user

They are genuinely different roles and I’d model them separately.

A **service owner** is accountable for the IT service across its lifecycle. An **incident commander** is the person running coordination and decision cadence during a major incident. In real life, the same individual might occasionally wear both hats in a small situation, but operationally they are different responsibilities, and for a serious incident I would not want the model to collapse them into one concept.

### Turn 5 — assistant

Understood. I’ll treat **Service Owner** and **Incident Commander** as separate role concepts.

Recap of Phase 1, now confirmed:
- We have a solid accepted set of competency questions and actions.
- Additional role surfaced: **Incident Commander**.
- Key operating contexts that affect handling are confirmed.
- **Service Owner** and **Incident Commander** are distinct and should not be merged.

Now we move to classes. I’ll do this in small, justified batches.

First batch, tied directly to many of your accepted questions/actions:
- **Incident** — needed for most questions and for actions like assign, declare, contain, and close.
- **IT Service** — needed for “which IT services are affected,” ownership, dependency path, failover, and open corrective actions by affected service.
- **Business Service** — needed for “which business services are impacted.”
- **Customer Channel** — needed for “which customer channels are affected.”

For each of these, does the agent need to identify, retrieve, connect, or pass this to a tool as a separate thing?
You can answer in a compact form like:
- Incident: yes
- IT Service: yes
- Business Service: yes
- Customer Channel: yes

And if any should not stay as a separate class, say which one and why.

### Turn 6 — user

- Incident: yes
- IT service: yes
- Business service: yes
- Customer channel: yes

I’d keep all four as separate things.

The important distinction is that an **incident** is the operational case we manage, an **IT service** is the technology capability affected, a **business service** is the customer- or business-facing capability impacted, and a **customer channel** is the route through which that business service is delivered. Those are connected, but not interchangeable.

### Turn 6 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 6 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes: {}
relationships: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident: {}\n  ITService: {}\n  BusinessService: {}\n  CustomerChannel: {}"
}
```

### Turn 6 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 6 — assistant

Captured those four classes.

Recap so far:
- **Incident** = the operational case being managed
- **IT Service** = the technology capability affected
- **Business Service** = the business/customer-facing capability impacted
- **Customer Channel** = the route through which the business service is delivered

And you confirmed they should remain separate.

Next batch, again directly justified by your accepted questions/actions:
- **Configuration Item** — for affected items, dependency path, and isolation
- **Third-Party Service** — for dependency-path questions
- **Vendor** — for who is responsible for a third-party service on the path
- **Alert** — for correlation and acknowledgment
- **Event** — for correlation

For each of these, does the agent need to identify, retrieve, connect, or pass this to a tool as a separate class?

### Turn 7 — user

- Configuration item: yes
- Third-party service: yes
- Vendor: yes
- Alert: yes
- Event: yes

I’d keep all of those separate as well.

A **configuration item** is the managed component we track and may isolate. A **third-party service** is an external service we depend on. A **vendor** is the external organization providing or supporting something. An **alert** is the signal that needs triage or acknowledgement. An **event** is the underlying observed occurrence we may correlate into the incident.

### Turn 7 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 7 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
relationships: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ConfigurationItem: {}\n  ThirdPartyService: {}\n  Vendor: {}\n  Alert: {}\n  Event: {}"
}
```

### Turn 7 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 7 — assistant

Captured those too.

Recap:
- **Configuration Item** stays separate from services because it is the managed component that can be tracked and isolated.
- **Third-Party Service** stays separate from **Vendor** because the external service and the organization behind it are not the same thing.
- **Alert** and **Event** also stay separate because one is the signal needing triage/acknowledgment, while the other is the observed occurrence being correlated.

Next class batch, covering ownership, routing, major-incident coordination, recovery guidance, and review follow-up:
- **Service Owner**
- **Resolver Group**
- **On-Call Engineer**
- **Incident Commander**
- **Runbook**
- **Workaround**
- **Backup Set**
- **Recovery Plan**
- **Corrective Action**

Does the agent need to identify, retrieve, connect, or pass each of those as a separate class?  
If any of these should be treated differently, say which one.

### Turn 8 — user

- Service owner: yes
- Resolver group: yes
- On-call engineer: yes
- Incident commander: yes
- Runbook: yes
- Workaround: yes
- Backup set: yes
- Recovery plan: yes
- Corrective action: yes

I’d keep them separate.

A couple of distinctions matter operationally:
- A **resolver group** is the team assigned to diagnose and restore; an **on-call engineer** is the person actually available for urgent hands-on response.
- A **runbook** is the maintained procedure; a **workaround** is the temporary method you may use, and that workaround may be documented in a runbook.
- A **backup set** is the recoverable data set; a **recovery plan** is the wider documented plan for restoring the service and dependencies.
- A **corrective action** is follow-up work after review, not the same thing as live incident handling.

### Turn 8 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 8 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
relationships: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceOwner: {}\n  ResolverGroup: {}\n  OnCallEngineer: {}\n  IncidentCommander: {}\n  Runbook: {}\n  Workaround: {}\n  BackupSet: {}\n  RecoveryPlan: {}\n  CorrectiveAction: {}"
}
```

### Turn 8 — tool

Applied. Added 9, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 8 — assistant

Captured.

Recap:
- Routing/coordination roles are now distinct: **Service Owner**, **Resolver Group**, **On-Call Engineer**, **Incident Commander**.
- Recovery guidance/resources are also distinct: **Runbook**, **Workaround**, **Backup Set**, **Recovery Plan**.
- **Corrective Action** remains separate from live incident work.

Next batch, covering likely cause, reporting, evidence, communications, and action inputs already implied by your accepted questions/actions:
- **Change**
- **Deployment**
- **Materiality Assessment**
- **Regulatory Notification**
- **Stakeholder Communication**
- **Evidence**

Does the agent need to identify, retrieve, connect, or pass each of those as a separate class?  
And one extra precision check in the same pattern: is **Evidence** one class in your model, or do you already know you need separate classes for different evidence types at this level?

### Turn 9 — user

- Change: yes
- Deployment: yes
- Materiality assessment: yes
- Regulatory notification: yes
- Stakeholder communication: yes, though I’d usually just call it **communication**
- Evidence: yes, as a single class at this level

And on your precision check: at this level I would keep **evidence** as one class, not split it into separate evidence types. What matters operationally is that the incident is supported by preserved evidence and, in the cyber case especially, that integrity is handled properly.

### Turn 9 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 9 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
relationships: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change: {}\n  Deployment: {}\n  MaterialityAssessment: {}\n  RegulatoryNotification: {}\n  Communication:\n    aliases: [Stakeholder Communication]\n  Evidence: {}"
}
```

### Turn 9 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 9 — assistant

Captured.

Recap of the class phase so far:
- Cause/reporting/support classes added: **Change**, **Deployment**, **Materiality Assessment**, **Regulatory Notification**, **Communication** (with alias **Stakeholder Communication**), and **Evidence**.
- You explicitly want **Evidence** kept as one class at this level, not split by evidence type.

The core class set now looks well-grounded in your accepted questions and actions.

Before moving to relationships, one small class check tied to your operating contexts:
you named several contexts that change handling — **incident severity, environment, service criticality tier, detection source, cybersecurity vs non-cyber incident context, and regulatory context**.

Do you want each of those treated as:
- a property/value on an existing class, or
- a separate class the agent must identify and connect?

Please answer just for those six items, in compact form, for example:
- Incident severity: property
- Environment: property
- Detection source: class
...and so on.

### Turn 10 — user

- Incident severity: property
- Environment: separate class
- Service criticality tier: property
- Detection source: property
- Cybersecurity versus non-cyber incident context: separate class, in the sense that a cybersecurity incident should remain distinct from a general incident
- Regulatory context: separate class, because the regulator and the formal notification side need to be represented explicitly

### Turn 10 — assistant

Thanks — that’s useful, and I need one clarification before I record those as classes.

You said:
- **Cybersecurity versus non-cyber incident context** should be a separate class, because a cybersecurity incident should remain distinct from a general incident.
- **Regulatory context** should be a separate class, because the regulator and formal notification side need explicit representation.

Since this tool does not model subclassing, I want to avoid turning “cybersecurity incident” into a disguised subtype of Incident.

So please clarify just these two:

1. For the cybersecurity distinction, which separate class do you actually want?
- **Cybersecurity Context**
- **Cybersecurity Assessment**
- **Cybersecurity Incident** as a separate operational case connected to an Incident
- or something else in your own terms

2. For regulatory context, what is the explicit thing the agent must identify separately?
- **Regulator**
- **Regulatory Regime**
- **Regulatory Context**
- or more than one of those

Just name the class or classes you want kept separate.

### Turn 11 — user

1. For the cybersecurity distinction, keep **cybersecurity incident** separate.

2. For regulatory context, keep **regulator** separate.  
We already have **regulatory notification** and **materiality assessment** in scope as separate things as well, but for the point you’re asking about here, the additional separate class is **regulator**.

### Turn 11 — assistant

Understood. I won’t record that yet as “accepted structure,” because I need to test whether **Cybersecurity Incident** is genuinely a separate operational case the agent must identify separately, or whether what you really need is a way to mark an **Incident** as cyber-related.

So one focused question:

When a live case is cyber-related in your operation, does it exist as its own separate case object alongside the general **Incident** — something the agent would retrieve and connect separately — or is it the same incident, just with cyber-specific handling and reporting?

### Turn 12 — user

It’s the same operational case, with cyber-specific handling layered onto it.

So in day-to-day response, we are still dealing with the incident itself, but we distinguish the cyber-related case because it has different evidence, assessment, and possible reporting implications. If your tool cannot model subclassing, I would avoid creating a second independent case object unless you have a very deliberate way to link it back without confusing operators.

### Turn 12 — assistant

Perfect — that answers it.

Recap:
- **Cybersecurity Incident** should **not** be a separate class here.
- Instead, the cyber/non-cyber distinction should be modeled on **Incident**, since it is the same operational case with different handling implications.
- **Regulator** does stay as a separate class.

That means we have one more class to confirm before relationships:

- **Regulator** — needed because you said the regulator itself must be represented explicitly, separate from the notification and assessment.

Does the agent need to identify, retrieve, connect, or pass **Regulator** as a separate class?

### Turn 13 — user

- Regulator: yes

I’d keep it separate from both the notification and the assessment. The **regulator** is the authority receiving the submission; the **regulatory notification** is the submission itself; and the **materiality assessment** is the determination that may lead to that submission.

### Turn 13 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 13 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
relationships: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 13 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Regulator: {}"
}
```

### Turn 13 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 13 — assistant

Captured **Regulator** as a separate class.

Class-phase recap, now confirmed:
- Core operational objects: **Incident, ITService, BusinessService, CustomerChannel**
- Technical/dependency objects: **ConfigurationItem, ThirdPartyService, Vendor, Alert, Event**
- Roles: **ServiceOwner, ResolverGroup, OnCallEngineer, IncidentCommander**
- Recovery/support artifacts: **Runbook, Workaround, BackupSet, RecoveryPlan**
- Review/follow-up: **CorrectiveAction**
- Cause/reporting/evidence: **Change, Deployment, MaterialityAssessment, RegulatoryNotification, Communication, Evidence, Regulator**
- Context handling decision: **Environment** will be a separate class later if needed; **severity, criticality tier, detection source, cyber/non-cyber** are not separate classes at this stage

Now we begin relationships. I’ll ground them in the competency questions rather than free-associating.

First path-focused batch around impact:
To answer:
- which business services are impacted by an incident,
- which customer channels are affected,
- and which IT services are affected,

what is the real path?

Please describe the connections among these four classes:
- **Incident**
- **ITService**
- **BusinessService**
- **CustomerChannel**

I’m not asking you to invent labels yet. Just tell me the path in plain words, for example:
- an incident affects one or more IT services;
- an IT service supports one or more business services;
- a business service is delivered through one or more customer channels;

Use your own wording, and include whether any of those links should also exist directly from **Incident** to **BusinessService** or **CustomerChannel**, or only through the path.

### Turn 14 — user

The practical path is:

- an **incident impacts one or more IT services**;
- an **incident can also impact one or more business services** directly at the operational record level, because we often record business impact explicitly, not only by inference;
- a **business service depends on one or more IT services**;
- a **business service is delivered through one or more customer channels**.

I would **not** make incident-to-customer-channel the primary direct link here. In practice, you usually determine affected channels through the impacted business service. If you later derive or present channels directly for speed, fine, but conceptually I’d hang that off the business service side.

### Turn 14 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 14 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
relationships: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 14 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: impactsITService\n    from: Incident\n    to: ITService\n  - name: impactsBusinessService\n    from: Incident\n    to: BusinessService\n  - name: dependsOnITService\n    from: BusinessService\n    to: ITService\n  - name: deliveredThroughChannel\n    from: BusinessService\n    to: CustomerChannel"
}
```

### Turn 14 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 14 — assistant

Captured those impact-path relationships.

Recap:
- **Incident → ITService**: incident impacts IT service
- **Incident → BusinessService**: incident impacts business service directly at the operational record level
- **BusinessService → ITService**: business service depends on IT service
- **BusinessService → CustomerChannel**: business service is delivered through customer channel
- No primary direct **Incident → CustomerChannel** link for now

Next path batch: dependency path and external dependency.

To answer:
- what affected IT services depend on,
- which configuration items are affected,
- which configuration items and third-party services are on the dependency path,
- and which vendor is responsible for the third-party service,

what is the real path among:
- **ITService**
- **ConfigurationItem**
- **ThirdPartyService**
- **Vendor**
- and, if needed, **Incident**

Please describe the path in plain words, including whether:
- IT services depend directly on configuration items,
- IT services depend directly on third-party services,
- configuration items depend on third-party services,
- incidents link directly to affected configuration items,
- and third-party services link directly to vendors.

### Turn 15 — user

In plain operational terms:

- an **IT service runs on** infrastructure components, so if you are using the broader configuration-item concept, the dependency path to technical estate is through the components that support the service;
- an **incident affects configuration items** directly, because we often record the specific components involved in the case;
- an **IT service depends on third-party services** directly where external service dependency exists;
- a **third-party service is provided by a vendor** directly.

On your specific checks:
- **IT services depend directly on configuration items**: I would not put it that way in my own wording. I’d usually say the service is implemented by applications and runs on technical components. If your current model only has configuration item at this layer, be careful not to flatten every technical dependency into one vague link.
- **IT services depend directly on third-party services**: yes.
- **Configuration items depend on third-party services**: not as a general relationship I’d start with here.
- **Incidents link directly to affected configuration items**: yes.
- **Third-party services link directly to vendors**: yes.

### Turn 15 — assistant

That helps, and I want to avoid flattening the technical layer exactly as you warned.

One focused follow-up before I record these relationships:

Do you want a separate class for the thing between **IT Service** and **Configuration Item** — for example the application/service-component layer that implements the IT service — or, at this ontology level, should I connect **IT Service** to **Configuration Item** directly even though it is a simplification?

### Turn 16 — user

Yes — I’d want that intermediate layer kept separate, not collapsed away.

At this level, the important separate thing is the **application**. Operationally, an IT service is implemented by one or more applications, and those applications run on technical components. If you connect IT service straight to configuration item, you lose a lot of useful structure for ownership, deployment, change correlation, and diagnosis.

### Turn 16 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 16 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 16 — assistant

Good catch. That means a new class has surfaced and we need to confirm it properly before adding those relationships.

New candidate class:
- **Application** — justified by your dependency-path and diagnosis needs, and specifically by your point that IT services are implemented by applications, which in turn run on configuration items.

Does the agent need to identify, retrieve, connect, or pass **Application** as a separate class?

### Turn 17 — user

- Application: yes

I’d definitely keep it separate. It’s the right layer for implementation, ownership, deployment, vendor support, database use, and a lot of incident diagnosis.

### Turn 17 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 17 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 17 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Application: {}"
}
```

### Turn 17 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 17 — assistant

Captured **Application** as a separate class.

Recap:
- We avoided flattening the technical dependency path.
- The model now includes **Application** as the implementation layer between **ITService** and **ConfigurationItem**.

Now that **Application** is confirmed, please give me the dependency path in plain words among:
- **ITService**
- **Application**
- **ConfigurationItem**
- **ThirdPartyService**
- **Vendor**
- and **Incident**

Specifically, confirm or correct these candidate links:
- IT service is implemented by application
- application runs on configuration item
- incident affects configuration item
- IT service depends on third-party service
- third-party service is provided by vendor

If any of those should be reworded or replaced, give your wording.

### Turn 18 — user

Yes, that path is right in substance.

In plain words, I’d describe it like this:
- an **IT service is implemented by one or more applications**;
- an **application runs on technical components**, and if your current class at that layer is configuration item, that is acceptable as the represented target;
- an **incident affects configuration items** directly;
- an **IT service depends on third-party services** where relevant;
- a **third-party service is provided by a vendor**.

The only nuance I’d keep in mind is your second line: in my own language I’d normally say **application runs on infrastructure or technical components** rather than “runs on configuration item,” because configuration item is a wider bucket. But if configuration item is the class you have at this abstraction level, the connection is still useful.

### Turn 18 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 18 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 18 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: implementedByApplication\n    from: ITService\n    to: Application\n  - name: runsOnConfigurationItem\n    from: Application\n    to: ConfigurationItem\n  - name: affectsConfigurationItem\n    from: Incident\n    to: ConfigurationItem\n  - name: dependsOnThirdPartyService\n    from: ITService\n    to: ThirdPartyService\n  - name: providedByVendor\n    from: ThirdPartyService\n    to: Vendor"
}
```

### Turn 18 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 18 — assistant

Captured that dependency path.

Recap:
- **ITService → Application**
- **Application → ConfigurationItem**
- **Incident → ConfigurationItem**
- **ITService → ThirdPartyService**
- **ThirdPartyService → Vendor**

Next path batch: correlation and likely-cause links.

To answer:
- which alerts are correlated with an incident,
- which events are correlated with an incident,
- whether a recent change likely caused the incident,
- and whether a recent deployment likely caused the incident,

what are the real connections among:
- **Incident**
- **Alert**
- **Event**
- **Change**
- **Deployment**
- and, if needed, **Application** or **ITService**

Please describe the path in plain words. In particular, tell me:
- whether incidents link directly to alerts and directly to events,
- whether incidents link directly to changes and deployments as suspected cause candidates,
- and whether changes/deployments attach primarily to **Application**, **ITService**, or something else in your operating model.

### Turn 19 — user

In plain terms:

- an **incident is triggered by an alert** when the case starts from a monitoring or security signal;
- an **incident is correlated from events** when underlying occurrences are tied into the case;
- an **incident can be resolved by a change**, which is the clean operational link we track explicitly;
- for “likely caused by a recent change or deployment,” the practical reasoning usually comes from what changed in the affected service path, not from a guaranteed direct incident-to-deployment link in every case;
- a **change affects IT services** and **modifies configuration items**;
- a **change may be implemented through a release**, and the technical execution is the deployment;
- a **deployment deploys an application** and targets an environment.

On your specific checks:
- **incidents link directly to alerts**: yes.
- **incidents link directly to events**: yes.
- **incidents link directly to changes as suspected cause candidates**: I would not overstate that as a generic direct “caused by” link. The explicit tracked link I’d keep is that an incident may be resolved by a change.
- **incidents link directly to deployments as suspected cause candidates**: not as the primary explicit relationship I’d start with.
- **changes and deployments attach primarily to application, IT service, or something else**: change attaches to **IT service** and **configuration item**; deployment attaches most directly to **application**, and also to the **environment** it targets.

### Turn 19 — assistant

That’s clear, and it surfaced another class that needs proper confirmation before I add the path.

New candidate class:
- **Environment** — justified because you already said environment changes handling, and now you’ve confirmed deployments target an environment.

Does the agent need to identify, retrieve, connect, or pass **Environment** as a separate class?

### Turn 20 — user

- Environment: yes

I’d keep it separate. It matters both for operational handling and for understanding where a service, application, or deployment actually sits.

### Turn 20 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 20 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 20 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Environment: {}"
}
```

### Turn 20 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 20 — assistant

Captured **Environment** as a separate class.

Recap:
- **Environment** is now explicitly in scope for both operational handling and deployment context.

Now please confirm or correct this correlation/cause path:

- **Incident → Alert**: incident is triggered by alert
- **Incident → Event**: incident is correlated from event
- **Incident → Change**: incident is resolved by change
- **Change → ITService**: change affects IT service
- **Change → ConfigurationItem**: change modifies configuration item
- **Deployment → Application**: deployment deploys application
- **Deployment → Environment**: deployment targets environment

If that is right in substance, say “yes”; if any verb or direction should change, give the corrected wording.

### Turn 21 — user

Yes.

### Turn 21 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 21 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 21 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: triggeredByAlert\n    from: Incident\n    to: Alert\n  - name: correlatedFromEvent\n    from: Incident\n    to: Event\n  - name: resolvedByChange\n    from: Incident\n    to: Change\n  - name: affectsITService\n    from: Change\n    to: ITService\n  - name: modifiesConfigurationItem\n    from: Change\n    to: ConfigurationItem\n  - name: deploysApplication\n    from: Deployment\n    to: Application\n  - name: targetsEnvironment\n    from: Deployment\n    to: Environment"
}
```

### Turn 21 — tool

Applied. Added 7, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 21 — assistant

Captured.

Recap:
- **Incident → Alert**
- **Incident → Event**
- **Incident → Change**
- **Change → ITService**
- **Change → ConfigurationItem**
- **Deployment → Application**
- **Deployment → Environment**

Next path batch: ownership, routing, and major-incident coordination.

To answer:
- who owns the affected IT service,
- which resolver group should handle an incident,
- which on-call engineer should handle it,
- and major-incident coordination,

what is the real path among:
- **ITService**
- **ServiceOwner**
- **ResolverGroup**
- **OnCallEngineer**
- **Incident**
- **IncidentCommander**

Please describe the path in plain words, especially for the “should handle” question:
- what relationship lets the agent derive the right **resolver group** for an incident?
- is the **on-call engineer** reached through the resolver group, or does the incident also need a direct link to the engineer once assigned?
- and does a major incident have a direct link to **IncidentCommander**?

### Turn 22 — user

In plain operational terms:

- a **service owner owns the IT service**;
- an **incident is assigned to a resolver group**;
- the right resolver group is determined because that group supports the affected service or affected technical component in scope for the incident;
- an **on-call engineer is a member of a resolver group**, and for active handling the **incident may also be handled by a specific on-call engineer** once that person is engaged;
- for major-incident handling, the case should have a **direct coordination link to an incident commander**.

So on your specific points:
- the relationship that lets you derive the right **resolver group** is not just “incident to resolver group” in isolation; operationally it depends on whether that resolver group supports the affected service or component.
- the **on-call engineer** is reached both ways in practice: you can derive candidates through resolver-group membership, and you may also record the directly engaged engineer on the incident.
- for major-incident command, yes, I would keep a **direct incident-to-incident commander** link for the coordinated case.

### Turn 22 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 22 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 22 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: ownsITService\n    from: ServiceOwner\n    to: ITService\n  - name: assignedToResolverGroup\n    from: Incident\n    to: ResolverGroup\n  - name: supportsITService\n    from: ResolverGroup\n    to: ITService\n  - name: supportsConfigurationItem\n    from: ResolverGroup\n    to: ConfigurationItem\n  - name: hasMemberOnCallEngineer\n    from: ResolverGroup\n    to: OnCallEngineer\n  - name: handledByOnCallEngineer\n    from: Incident\n    to: OnCallEngineer\n  - name: coordinatedByIncidentCommander\n    from: Incident\n    to: IncidentCommander"
}
```

### Turn 22 — tool

Applied. Added 7, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 22 — assistant

Captured the routing and coordination path.

Recap:
- **ServiceOwner → ITService**
- **Incident → ResolverGroup**
- **ResolverGroup → ITService**
- **ResolverGroup → ConfigurationItem**
- **ResolverGroup → OnCallEngineer**
- **Incident → OnCallEngineer**
- **Incident → IncidentCommander**

That now supports both:
- recording who is assigned/engaged, and
- deriving who should handle the incident from the affected service/component path.

Next path batch: safe-use guidance and recovery resources.

To answer:
- which runbook, workaround, backup set, and recovery plan are available for safe use,
- and to support actions like failover and restore,

what is the real path among:
- **Incident**
- **ITService**
- **Application**
- **Runbook**
- **Workaround**
- **BackupSet**
- **RecoveryPlan**

Please describe in plain words:
- whether these resources attach primarily to the incident, the IT service, the application, or some mix;
- whether a workaround is linked directly to the incident, or mainly to the service/application/runbook;
- whether backup sets and recovery plans are tied mainly to IT service, application, or both.

### Turn 23 — user

In practical operations, it’s a mix, not one single anchor point.

- a **runbook may be used to handle an incident** directly, because responders need the procedure in the live case;
- a **workaround** is usually not just an ad hoc note on the incident in the abstract sense — it is normally tied to a diagnosed issue and may be documented in a runbook;
- a **recovery plan applies to an IT service**;
- a **backup set protects technical components**, and the recovery plan uses the relevant backup set.

So for your specific checks:
- **runbook**: direct incident link is useful and operationally right.
- **workaround**: I would not make incident-to-workaround the primary relationship at this level. I’d usually reach it through the diagnosed issue path and its documentation.
- **backup set**: tied mainly to the protected technical components, not directly to the incident or business-facing service in the first instance.
- **recovery plan**: tied mainly to the IT service.
- **application** can matter in real recovery work, but from the relationships you are asking about here, the strongest explicit anchors are incident-to-runbook, recovery-plan-to-IT-service, and backup-set-to-what-it-protects.

### Turn 23 — assistant

Helpful. One focused clarification before I add these, because you used a concept we have not modeled yet:

You said a **workaround** is usually tied to a **diagnosed issue** and may be documented in a runbook.

Do you want a separate class for that diagnosed issue at this ontology level — for example **Problem** or your preferred term — or should we leave **Workaround** unconnected for now and come back later if needed?

### Turn 24 — user

Yes — I’d want that separate class.

The right concept here is **problem**: the underlying cause or potential cause behind one or more incidents. That is the natural place to anchor a known issue, and from there you can represent a documented workaround properly instead of hanging it loosely off the incident.

### Turn 24 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 24 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 24 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Problem: {}"
}
```

### Turn 24 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 24 — assistant

Captured **Problem** as a separate class.

Recap:
- **Problem** is now the right anchor for underlying cause/potential cause and for documented workaround handling.
- That gives us a cleaner path than linking workarounds loosely to incidents.

Now please confirm or correct this recovery/guidance path:

- **Incident → Runbook**: incident may use runbook
- **Problem → Workaround**: problem has workaround
- **Runbook → Workaround**: runbook documents workaround
- **RecoveryPlan → ITService**: recovery plan applies to IT service
- **BackupSet → ConfigurationItem**: backup set protects configuration item
- **RecoveryPlan → BackupSet**: recovery plan uses backup set

If that is right in substance, say “yes”; if any link should change direction or wording, give the corrected wording.

### Turn 25 — user

Yes, with one wording nuance on the first line: I’d usually say the **incident is handled with a runbook** rather than “may use runbook.” The substance is right.

### Turn 25 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 25 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 25 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: handledWithRunbook\n    from: Incident\n    to: Runbook\n  - name: hasWorkaround\n    from: Problem\n    to: Workaround\n  - name: documentsWorkaround\n    from: Runbook\n    to: Workaround\n  - name: appliesToITService\n    from: RecoveryPlan\n    to: ITService\n  - name: protectsConfigurationItem\n    from: BackupSet\n    to: ConfigurationItem\n  - name: usesBackupSet\n    from: RecoveryPlan\n    to: BackupSet"
}
```

### Turn 25 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 25 — assistant

Captured those recovery/guidance relationships, with your wording nuance reflected in **Incident → Runbook**.

Recap:
- **Incident → Runbook**
- **Problem → Workaround**
- **Runbook → Workaround**
- **RecoveryPlan → ITService**
- **BackupSet → ConfigurationItem**
- **RecoveryPlan → BackupSet**

Next path batch: assessment, evidence, communication, notification, and closure-related reporting.

To answer:
- is a materiality assessment complete,
- is regulatory notification required or due,
- are evidence integrity and supporting evidence complete,
- are required communications complete,

what is the real path among:
- **Incident**
- **MaterialityAssessment**
- **RegulatoryNotification**
- **Evidence**
- **Communication**
- **Regulator**

Please describe the plain operational links, including whether:
- an incident has a materiality assessment,
- an incident has evidence,
- an incident has communications,
- an incident leads to a regulatory notification directly,
- and a regulatory notification goes to a regulator.

### Turn 26 — user

In plain operational terms:

- an **incident is evaluated by a materiality assessment**;
- an **incident is supported by evidence**;
- an **incident is communicated through communications**;
- a **materiality assessment may trigger a regulatory notification**;
- a **regulatory notification reports the incident**;
- a **regulatory notification is sent to a regulator**;
- and the **notification may include evidence** as supporting material.

On your specific checks:
- **incident has a materiality assessment**: yes.
- **incident has evidence**: yes.
- **incident has communications**: yes.
- **incident leads to a regulatory notification directly**: I would not make that the primary path. Operationally, the assessment is what leads to the notification.
- **regulatory notification goes to a regulator**: yes.

### Turn 26 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 26 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 26 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: evaluatedByMaterialityAssessment\n    from: Incident\n    to: MaterialityAssessment\n  - name: supportedByEvidence\n    from: Incident\n    to: Evidence\n  - name: communicatedThroughCommunication\n    from: Incident\n    to: Communication\n  - name: triggersRegulatoryNotification\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n  - name: reportsIncident\n    from: RegulatoryNotification\n    to: Incident\n  - name: sentToRegulator\n    from: RegulatoryNotification\n    to: Regulator\n  - name: includesEvidence\n    from: RegulatoryNotification\n    to: Evidence"
}
```

### Turn 26 — tool

Applied. Added 7, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 26 — assistant

Captured that assessment/reporting path.

Recap:
- **Incident → MaterialityAssessment**
- **Incident → Evidence**
- **Incident → Communication**
- **MaterialityAssessment → RegulatoryNotification**
- **RegulatoryNotification → Incident**
- **RegulatoryNotification → Regulator**
- **RegulatoryNotification → Evidence**

Next path batch: problem management and review follow-up.

To answer:
- which corrective actions from prior post-incident reviews remain open for the affected service,
- and to connect your new **Problem** class cleanly,

what is the real path among:
- **Incident**
- **Problem**
- **CorrectiveAction**
- **ITService**

Please describe in plain words:
- whether an incident is linked to a problem,
- whether corrective actions come from the problem, the post-incident review outcome, or directly from the incident in this model,
- and whether corrective actions link directly to the affected IT service.

### Turn 27 — user

In plain terms:

- an **incident may be linked to a problem** when we believe there is an underlying cause or recurring cause to manage;
- **corrective actions** come from the **post-incident review** outcome, not directly from the incident or from the problem alone;
- the review may also identify a problem;
- for the question about actions remaining open for the affected service, you usually answer that by following the incident’s affected service and then reviewing which prior review actions are relevant to that service context.

On your specific check: I would **not** make corrective action link directly to the affected IT service as the primary modeled relationship here, unless you explicitly need that shortcut. The cleaner operational chain is through the review and the incident context.

### Turn 27 — assistant

That surfaced another needed class, so I should confirm it before adding relationships.

New candidate class:
- **PostIncidentReview** — justified because you said corrective actions come from the post-incident review outcome, and the review may also identify a problem.

Does the agent need to identify, retrieve, connect, or pass **PostIncidentReview** as a separate class?

### Turn 28 — user

- Post-incident review: yes

I’d keep it separate. It’s the structured review point for findings, identified problems, and produced corrective actions, and it matters especially for major incidents and closure governance.

### Turn 28 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 28 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 28 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PostIncidentReview: {}"
}
```

### Turn 28 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 28 — assistant

Captured **PostIncidentReview** as a separate class.

Recap:
- **PostIncidentReview** is now explicitly in scope as the structured review point for findings, identified problems, corrective actions, and closure governance.

Now please confirm or correct this path:

- **PostIncidentReview → Incident**: post-incident review reviews incident
- **PostIncidentReview → CorrectiveAction**: post-incident review produces corrective action
- **PostIncidentReview → Problem**: post-incident review identifies problem
- **Incident → Problem**: incident may be linked to problem

If that is right in substance, say “yes”; if any direction or wording should change, give the corrected version.

### Turn 29 — user

Yes.

### Turn 29 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 29 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 29 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: reviewsIncident\n    from: PostIncidentReview\n    to: Incident\n  - name: producesCorrectiveAction\n    from: PostIncidentReview\n    to: CorrectiveAction\n  - name: identifiesProblem\n    from: PostIncidentReview\n    to: Problem\n  - name: linkedToProblem\n    from: Incident\n    to: Problem"
}
```

### Turn 29 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 29 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 29 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 29 — assistant

Good. That closes the main relationship backbone, including the late-added classes **Application**, **Environment**, **Problem**, and **PostIncidentReview**.

Short recap of what we’ve captured in the relationship phase:
- Impact path across **Incident**, **ITService**, **BusinessService**, **CustomerChannel**
- Technical dependency path through **Application**, **ConfigurationItem**, **ThirdPartyService**, **Vendor**
- Correlation/cause path via **Alert**, **Event**, **Change**, **Deployment**, **Environment**
- Routing and coordination via **ServiceOwner**, **ResolverGroup**, **OnCallEngineer**, **IncidentCommander**
- Safe-use and recovery resources via **Runbook**, **Workaround**, **RecoveryPlan**, **BackupSet**
- Assessment/reporting path via **MaterialityAssessment**, **RegulatoryNotification**, **Evidence**, **Communication**, **Regulator**
- Review/follow-up path via **Problem** and **PostIncidentReview**

Now we move to decision-bearing properties.

First property batch, all on **Incident**, because many of your questions and actions depend on them:
- **severity**
- **detection source**
- **cyber-related flag or equivalent**
- **major-incident declaration status**
- **closure status / current status**

For each of those, tell me:
1. should it be a property on **Incident**?
2. if yes, what is the plain property name you want?
3. if it has a small fixed value set, do you already know the allowed values?

You can answer in a compact list, for example:
- severity: yes, property name “severity”, values …
- detection source: yes, property name …
- cyber-related: yes/no …
… and so on.

### Turn 30 — user

- **Severity**: yes, property on **incident**. Plain name: **severity**. Allowed values: **sev1-critical, sev2-high, sev3-medium, sev4-low**.
- **Detection source**: yes, property on **incident**. Plain name: **detection source**. Allowed values: **monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other**.
- **Cyber-related flag or equivalent**: I would **not** model that as a simple flag based on what we already clarified. If your tool cannot represent a distinct cyber incident type cleanly, then use an **incident category** or similar classification on the incident rather than a bare yes/no flag.
- **Major-incident declaration status**: I would not use that exact phrasing as just a simple status field. Operationally, you need to know whether the incident has been **declared as a major incident**, and you also need the incident’s normal lifecycle status. If your structure allows only properties, this is effectively a **major-incident indicator** plus the declaration time, not a replacement for incident status.
- **Closure status / current status**: yes, property on **incident**. Plain name: **status**. Allowed values: **new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled**.

One important addition: if you are making the incident decision-bearing, I would also expect **category** on the incident, because that is where the cyber distinction is better carried if you are not representing it as a separate specialized incident type.

### Turn 30 — assistant

Good. I’ll keep this tight and only on the incident properties you just justified.

Please confirm this proposed **Incident** property set:

- **severity** — allowed: `sev1-critical, sev2-high, sev3-medium, sev4-low`
- **detectionSource** — allowed: `monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other`
- **category** — to carry distinctions like cyber-related vs other categories  
  What allowed values do you want here?
- **majorIncidentDeclared** — boolean
- **majorIncidentDeclaredAt** — date
- **status** — allowed: `new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled`

Please reply with:
1. confirm/correct those six properties, and
2. the allowed values for **category**.

### Turn 31 — user

1. Confirmed in substance, with one wording note:
- **severity**: yes — `sev1-critical, sev2-high, sev3-medium, sev4-low`
- **detection source**: yes — `monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other`
- **category**: yes
- **major incident declared**: yes, boolean is fine if your tool needs it
- **major incident declared at**: yes, date
- **status**: yes — `new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled`

2. Allowed values for **category**:
- `availability`
- `performance`
- `capacity`
- `network`
- `application`
- `database`
- `infrastructure`
- `data-integrity`
- `cybersecurity`
- `third-party`
- `change-induced`
- `other`

One nuance: if your model can represent **major incident** as its own connected concept later, that is cleaner than relying only on a boolean, but for the property set you proposed, this works.

### Turn 31 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 31 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties: {}
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 31 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      severity:\n        type: text\n        allowed: [sev1-critical, sev2-high, sev3-medium, sev4-low]\n      detectionSource:\n        type: text\n        allowed: [monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other]\n      category:\n        type: text\n        allowed: [availability, performance, capacity, network, application, database, infrastructure, data-integrity, cybersecurity, third-party, change-induced, other]\n      majorIncidentDeclared:\n        type: boolean\n      majorIncidentDeclaredAt:\n        type: date\n      status:\n        type: text\n        allowed: [new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled]"
}
```

### Turn 31 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 31 — assistant

Captured those **Incident** properties.

Recap:
- `severity`
- `detectionSource`
- `category`
- `majorIncidentDeclared`
- `majorIncidentDeclaredAt`
- `status`

Next property batch, grouped because these are all status/completeness properties directly tied to your accepted questions about assessment, evidence, communication, notification, corrective actions, and closure:

Please give me the decision-bearing properties for these six classes:
- **MaterialityAssessment**
- **RegulatoryNotification**
- **Evidence**
- **Communication**
- **CorrectiveAction**
- **PostIncidentReview**

For each class, tell me only the properties needed to answer or act on your accepted questions, especially things like:
- completion state / current status
- due date
- integrity result
- approval / send state
- open/closed state

A compact answer is perfect, for example:
- MaterialityAssessment: status ..., completedAt ...
- RegulatoryNotification: status ..., dueAt ...
- Evidence: integrityStatus ..., completenessStatus ...
... and so on.

### Turn 32 — user

- **Materiality assessment**:  
  - **assessed at**  
  - **result** = `not-reportable, potentially-reportable, reportable, undetermined`  
  - **rationale**  
  - **reporting due time`

- **Regulatory notification**:  
  - **due at**  
  - **submitted at**  
  - **status** = `draft, pending-approval, approved, submitted, accepted, rejected, withdrawn`

- **Evidence**:  
  - **collected at**  
  - **integrity status** = `collected, hashed, verified, sealed, compromised`  
  - **cryptographic hash`

- **Communication**:  
  - **sent at**  
  - **audience** = `technical, management, business, customer, vendor, regulator, all-staff`  
  - **status** = `draft, pending-approval, approved, submitted, accepted, rejected, withdrawn`  
  - **message summary`

- **Corrective action**:  
  - **action description**  
  - **status** = `open, in-progress, blocked, implemented, verified, closed, cancelled`  
  - **due date`

- **Post-incident review**:  
  - **held on**  
  - **findings**

One nuance on your wording: I would not add a separate invented **completeness status** for evidence or review unless your process specifically defines one. The operational checks come from the recorded evidence integrity, timestamps, and whether the required linked records exist.

### Turn 32 — assistant

Good set. One focused cleanup question before I record these, because I don’t want to store a misleading shared value list.

You gave **Communication.status** the same allowed values as **RegulatoryNotification.status**:
`draft, pending-approval, approved, submitted, accepted, rejected, withdrawn`

Is that really the communication lifecycle in your operation, including **accepted/rejected/withdrawn** for communications, or did you intend a different communication status list such as something more like drafting/approval/sent/cancelled?

### Turn 33 — user

Yes, keep that same communication status list here:

`draft, pending-approval, approved, submitted, accepted, rejected, withdrawn`

Operationally, that works for controlled communications where approval and recipient response matter, especially for vendor, regulator, or formal management communication.

### Turn 33 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 33 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties: {}
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties: {}
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties: {}
  Evidence:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 33 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MaterialityAssessment:\n    properties:\n      assessedAt:\n        type: date\n      result:\n        type: text\n        allowed: [not-reportable, potentially-reportable, reportable, undetermined]\n      rationale:\n        type: text\n      reportingDueTime:\n        type: date\n  RegulatoryNotification:\n    properties:\n      dueAt:\n        type: date\n      submittedAt:\n        type: date\n      status:\n        type: text\n        allowed: [draft, pending-approval, approved, submitted, accepted, rejected, withdrawn]\n  Evidence:\n    properties:\n      collectedAt:\n        type: date\n      integrityStatus:\n        type: text\n        allowed: [collected, hashed, verified, sealed, compromised]\n      cryptographicHash:\n        type: text\n  Communication:\n    properties:\n      sentAt:\n        type: date\n      audience:\n        type: text\n        allowed: [technical, management, business, customer, vendor, regulator, all-staff]\n      status:\n        type: text\n        allowed: [draft, pending-approval, approved, submitted, accepted, rejected, withdrawn]\n      messageSummary:\n        type: text\n  CorrectiveAction:\n    properties:\n      actionDescription:\n        type: text\n      status:\n        type: text\n        allowed: [open, in-progress, blocked, implemented, verified, closed, cancelled]\n      dueDate:\n        type: date\n  PostIncidentReview:\n    properties:\n      heldOn:\n        type: date\n      findings:\n        type: text"
}
```

### Turn 33 — tool

Applied. Added 0, updated 6 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 33 — assistant

Captured those properties.

Recap:
- **MaterialityAssessment**: `assessedAt`, `result`, `rationale`, `reportingDueTime`
- **RegulatoryNotification**: `dueAt`, `submittedAt`, `status`
- **Evidence**: `collectedAt`, `integrityStatus`, `cryptographicHash`
- **Communication**: `sentAt`, `audience`, `status`, `messageSummary`
- **CorrectiveAction**: `actionDescription`, `status`, `dueDate`
- **PostIncidentReview**: `heldOn`, `findings`

And I have respected your point not to invent generic “completeness” properties where the process can be checked from existing linked records and specific status/integrity fields.

Next property batch, focused on tracked objects and action support:

Please give me the decision-bearing properties for these seven classes:
- **ITService**
- **Application**
- **ConfigurationItem**
- **Alert**
- **Change**
- **Deployment**
- **Environment**

I’m looking only for properties needed to answer or act on your accepted questions, especially things like:
- current status / state
- criticality tier
- environment type
- alert state / acknowledged state
- change type / emergency approval state
- deployment time / outcome

A compact answer is fine.

### Turn 34 — user

- **IT service**:  
  - **name**  
  - **description**  
  - **criticality tier** = `tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting`  
  - **health state** = `healthy, degraded, partially-unavailable, unavailable, recovering, unknown`  
  - **availability target`

- **Application**:  
  - **externally accessible**  
  - **release version`

- **Configuration item**:  
  - **name**  
  - **version**  
  - **criticality tier** = `tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting`

- **Alert**:  
  - **raised at**  
  - **summary**  
  - **status** = `new, acknowledged, suppressed, escalated, closed`  
  - **severity** = `sev1-critical, sev2-high, sev3-medium, sev4-low`  
  - **detection source** = `monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other`  
  - **occurrence count`

- **Change**:  
  - **summary**  
  - **status** = `draft, assessed, approved, scheduled, implementing, implemented, failed, rolled-back, closed, cancelled`  
  - **risk level** = `low, medium, high, critical`  
  - **planned start**  
  - **planned end**  
  - **implementation plan**  
  - **backout plan`

- **Deployment**:  
  - **status** = `planned, running, succeeded, failed, rolled-back, cancelled`  
  - **started at**  
  - **completed at`

- **Environment**:  
  - **environment type** = `production, disaster-recovery, pre-production, test, development, management`

One important correction to your prompt wording: I would not add a separate **change type** here just because emergency handling exists. In our operating model, **emergency change** is handled as a distinct concept, not just a picklist value on the ordinary change record.

### Turn 34 — assistant

Good catch on **emergency change**. I should not silently turn that into a routine `change type` property.

One focused clarification before I record this batch:

Do you want **EmergencyChange** modeled as a separate class, distinct from **Change**, because the agent must identify and act on it separately for the action “execute an emergency change for an active incident”?

### Turn 35 — user

Yes.

I’d keep **emergency change** separate from ordinary **change**. It follows the accelerated path for urgent operational need, and the action you just cited is specifically about that case, not about generic change execution.

### Turn 35 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 35 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: null
    aliases: []
    properties: {}
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: null
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 35 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  EmergencyChange: {}\n  ITService:\n    properties:\n      name:\n        type: text\n      description:\n        type: text\n      criticalityTier:\n        type: text\n        allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]\n      healthState:\n        type: text\n        allowed: [healthy, degraded, partially-unavailable, unavailable, recovering, unknown]\n      availabilityTarget:\n        type: text\n  Application:\n    properties:\n      externallyAccessible:\n        type: boolean\n      releaseVersion:\n        type: text\n  ConfigurationItem:\n    properties:\n      name:\n        type: text\n      version:\n        type: text\n      criticalityTier:\n        type: text\n        allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]\n  Alert:\n    properties:\n      raisedAt:\n        type: date\n      summary:\n        type: text\n      status:\n        type: text\n        allowed: [new, acknowledged, suppressed, escalated, closed]\n      severity:\n        type: text\n        allowed: [sev1-critical, sev2-high, sev3-medium, sev4-low]\n      detectionSource:\n        type: text\n        allowed: [monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other]\n      occurrenceCount:\n        type: number\n  Change:\n    properties:\n      summary:\n        type: text\n      status:\n        type: text\n        allowed: [draft, assessed, approved, scheduled, implementing, implemented, failed, rolled-back, closed, cancelled]\n      riskLevel:\n        type: text\n        allowed: [low, medium, high, critical]\n      plannedStart:\n        type: date\n      plannedEnd:\n        type: date\n      implementationPlan:\n        type: text\n      backoutPlan:\n        type: text\n  Deployment:\n    properties:\n      status:\n        type: text\n        allowed: [planned, running, succeeded, failed, rolled-back, cancelled]\n      startedAt:\n        type: date\n      completedAt:\n        type: date\n  Environment:\n    properties:\n      environmentType:\n        type: text\n        allowed: [production, disaster-recovery, pre-production, test, development, management]"
}
```

### Turn 35 — tool

Applied. Added 1, updated 7 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 35 — assistant

Captured those properties, and **EmergencyChange** is now a separate class as you requested.

Recap:
- **ITService**: `name`, `description`, `criticalityTier`, `healthState`, `availabilityTarget`
- **Application**: `externallyAccessible`, `releaseVersion`
- **ConfigurationItem**: `name`, `version`, `criticalityTier`
- **Alert**: `raisedAt`, `summary`, `status`, `severity`, `detectionSource`, `occurrenceCount`
- **Change**: `summary`, `status`, `riskLevel`, `plannedStart`, `plannedEnd`, `implementationPlan`, `backoutPlan`
- **Deployment**: `status`, `startedAt`, `completedAt`
- **Environment**: `environmentType`
- New class added: **EmergencyChange**

Because **EmergencyChange** was introduced after the earlier relationship pass, I need to do the required relationship check for it now.

One focused question:
How does **EmergencyChange** connect in your operational model?

Please describe the path in plain words among:
- **EmergencyChange**
- **Incident**
- **ITService**
- **ConfigurationItem**
- and, if relevant, **Change**

For example, tell me whether:
- an emergency change is executed for an incident,
- an emergency change affects an IT service or configuration item,
- and whether emergency change is separate from change with its own direct links, or also connected back to a general change record somehow.

### Turn 36 — user

In operational terms:

- an **emergency change is justified by an active incident**;
- it is still a **change**, just on the accelerated path, so the same affected estate matters in practice;
- that means the emergency change will be tied to the **affected configuration items**, and it may affect the **IT service** being restored or stabilized.

If your tool cannot represent specialization cleanly, I would be careful here. The important explicit link to preserve is the one between **emergency change and incident**. The affected service and configuration items can follow the same pattern you already use for ordinary change, rather than inventing a completely separate duplicate structure unless you need it.

### Turn 36 — assistant

That’s exactly the kind of place where I want to avoid duplicating structure without need.

One focused decision:

Given your answer, should I model **EmergencyChange** as:
1. a separate class with its own direct links to **Incident**, **ITService**, and **ConfigurationItem**, or
2. a separate class with only the essential direct link to **Incident**, plus its own properties, while we avoid duplicating the ordinary change-to-service/item links unless a later question/action truly needs them?

Please answer **1** or **2**.

### Turn 37 — user

2

### Turn 37 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 37 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: null
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: null
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: null
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: null
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: null
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: null
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 37 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: justifiedByIncident\n    from: EmergencyChange\n    to: Incident"
}
```

### Turn 37 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 37 — assistant

Captured that as the essential relationship:

- **EmergencyChange → Incident**: emergency change is justified by incident

Recap:
- We added **EmergencyChange** without duplicating the full ordinary change structure.
- That preserves the action-relevant distinction you wanted, while avoiding unnecessary parallel links.

Next focused property question, just for **EmergencyChange**:

What decision-bearing properties does **EmergencyChange** need for the accepted action “execute an emergency change for an active incident”?

Please give only the properties needed to decide, execute, or verify that action — for example things like status, approval state, execution time, implementation plan, backout plan — but use your own terms and allowed values.

### Turn 38 — user

For **emergency change**, I’d use the same decision-bearing properties as for a normal change where they matter for execution control:

- **summary**
- **status** = `draft, assessed, approved, scheduled, implementing, implemented, failed, rolled-back, closed, cancelled`
- **risk level** = `low, medium, high, critical`
- **planned start**
- **planned end**
- **implementation plan**
- **backout plan`

And for the action itself, don’t rely only on properties on the emergency change record. The decision also depends on it being linked to an **active incident**, having the **affected configuration items identified**, and having **explicit risk acceptance** recorded.

### Turn 38 — assistant

Good. One focused follow-up before I record that, because **explicit risk acceptance** sounds decision-bearing and action-relevant:

Should **EmergencyChange** have an additional property for that, such as:
- **riskAcceptanceRecorded** — boolean

or do you want risk acceptance represented some other way?

### Turn 39 — user

Yes — if your tool needs an explicit field for action checking, **risk acceptance recorded** as a boolean is a sensible way to represent it.

### Turn 39 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 39 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: null
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: null
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: null
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: null
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: null
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: null
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 39 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  EmergencyChange:\n    properties:\n      summary:\n        type: text\n      status:\n        type: text\n        allowed: [draft, assessed, approved, scheduled, implementing, implemented, failed, rolled-back, closed, cancelled]\n      riskLevel:\n        type: text\n        allowed: [low, medium, high, critical]\n      plannedStart:\n        type: date\n      plannedEnd:\n        type: date\n      implementationPlan:\n        type: text\n      backoutPlan:\n        type: text\n      riskAcceptanceRecorded:\n        type: boolean"
}
```

### Turn 39 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 39 — assistant

Captured those **EmergencyChange** properties, including `riskAcceptanceRecorded`.

Recap:
- **EmergencyChange** now has the same execution-control fields as **Change** where needed, plus explicit risk acceptance for action checking.

Next we move to the language layer: plain meanings.

To keep this efficient, please give me a one-sentence plain meaning for this first batch of classes:
- Incident
- ITService
- BusinessService
- CustomerChannel
- Application
- ConfigurationItem
- ThirdPartyService
- Vendor

Short, plain business sentences are enough. For example:
- `Incident: ...`
- `ITService: ...`

Use your own wording.

### Turn 40 — user

- **Incident**: An incident is an unplanned interruption, degradation, or security-related condition that requires managed response.
- **IT service**: An IT service is a managed technology capability that supports one or more business services.
- **Business service**: A business service is a customer-facing or business-facing capability delivered by the bank.
- **Customer channel**: A customer channel is a route through which customers access the bank’s services.
- **Application**: An application is a software system that provides business or operational functionality.
- **Configuration item**: A configuration item is a managed component within configuration-management scope.
- **Third-party service**: A third-party service is an externally provided service that the bank depends on.
- **Vendor**: A vendor is an external organization that provides or supports technology or services.

### Turn 40 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 40 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: null
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: null
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: null
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: null
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: null
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: null
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: null
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: null
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: null
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: null
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 40 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    meaning: An incident is an unplanned interruption, degradation, or security-related condition that requires managed response.\n  ITService:\n    meaning: An IT service is a managed technology capability that supports one or more business services.\n  BusinessService:\n    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.\n  CustomerChannel:\n    meaning: A customer channel is a route through which customers access the bank’s services.\n  Application:\n    meaning: An application is a software system that provides business or operational functionality.\n  ConfigurationItem:\n    meaning: A configuration item is a managed component within configuration-management scope.\n  ThirdPartyService:\n    meaning: A third-party service is an externally provided service that the bank depends on.\n  Vendor:\n    meaning: A vendor is an external organization that provides or supports technology or services."
}
```

### Turn 40 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 40 — assistant

Captured those meanings.

Recap:
- The first eight core classes now have plain-language meanings on the model.

Next meaning batch for the remaining classes:
- Alert
- Event
- ServiceOwner
- ResolverGroup
- OnCallEngineer
- IncidentCommander
- Runbook
- Workaround
- BackupSet
- RecoveryPlan
- Problem
- PostIncidentReview

Please give one-sentence plain meanings for those. Short, practical definitions are perfect.

### Turn 41 — user

- **Alert**: An alert is a monitoring or security signal that requires triage or acknowledgement.
- **Event**: An event is a time-stamped observation of a state change or other notable occurrence.
- **Service owner**: A service owner is the role accountable for an IT service across its lifecycle.
- **Resolver group**: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
- **On-call engineer**: An on-call engineer is a technical specialist available for urgent operational response.
- **Incident commander**: An incident commander is the person accountable for command, coordination, and decision cadence during a major incident.
- **Runbook**: A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification.
- **Workaround**: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
- **Backup set**: A backup set is a defined collection of recoverable backup data for protected components.
- **Recovery plan**: A recovery plan is a documented plan for restoring an IT service and its dependencies.
- **Problem**: A problem is the underlying cause, or potential underlying cause, of one or more incidents.
- **Post-incident review**: A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work.

### Turn 41 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 41 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases: []
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases: []
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: null
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: null
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: null
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: null
    aliases: []
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: null
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: null
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: null
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: null
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: null
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: null
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 41 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.\n  Event:\n    meaning: An event is a time-stamped observation of a state change or other notable occurrence.\n  ServiceOwner:\n    meaning: A service owner is the role accountable for an IT service across its lifecycle.\n  ResolverGroup:\n    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.\n  OnCallEngineer:\n    meaning: An on-call engineer is a technical specialist available for urgent operational response.\n  IncidentCommander:\n    meaning: An incident commander is the person accountable for command, coordination, and decision cadence during a major incident.\n  Runbook:\n    meaning: A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification.\n  Workaround:\n    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.\n  BackupSet:\n    meaning: A backup set is a defined collection of recoverable backup data for protected components.\n  RecoveryPlan:\n    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.\n  Problem:\n    meaning: A problem is the underlying cause, or potential underlying cause, of one or more incidents.\n  PostIncidentReview:\n    meaning: A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
}
```

### Turn 41 — tool

Applied. Added 0, updated 12 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 41 — assistant

Captured those meanings too.

Recap:
- The operational role, signal, recovery, and review classes now all have plain-language meanings.

Next meaning batch for the remaining classes:
- Change
- EmergencyChange
- Deployment
- MaterialityAssessment
- RegulatoryNotification
- Communication
- Evidence
- Regulator
- CorrectiveAction
- Environment

Please give one-sentence meanings for those ten classes.

### Turn 42 — user

- **Change**: A change is a controlled addition, modification, or removal that may affect an IT service.
- **Emergency change**: An emergency change is a change handled through an accelerated path to address an urgent operational need.
- **Deployment**: A deployment is the technical execution that installs or activates an application change or release in an environment.
- **Materiality assessment**: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
- **Regulatory notification**: A regulatory notification is a formal incident-related submission to a competent authority.
- **Communication**: A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience.
- **Evidence**: Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability.
- **Regulator**: A regulator is the supervisory authority that oversees the bank or receives required notifications.
- **Corrective action**: A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability.
- **Environment**: An environment is a deployment context such as production, test, development, or disaster recovery.

### Turn 42 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 42 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases: []
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases: []
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: null
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: null
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: null
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: null
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: null
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: null
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: null
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: null
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 42 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change:\n    meaning: A change is a controlled addition, modification, or removal that may affect an IT service.\n  EmergencyChange:\n    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.\n  Deployment:\n    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.\n  MaterialityAssessment:\n    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.\n  RegulatoryNotification:\n    meaning: A regulatory notification is a formal incident-related submission to a competent authority.\n  Communication:\n    meaning: A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience.\n  Evidence:\n    meaning: Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability.\n  Regulator:\n    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.\n  CorrectiveAction:\n    meaning: A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability.\n  Environment:\n    meaning: An environment is a deployment context such as production, test, development, or disaster recovery."
}
```

### Turn 42 — tool

Applied. Added 0, updated 10 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 42 — assistant

Captured those meanings. The class meaning layer is now essentially complete.

Next, I need the same for relationships, in batches.

Please give one-sentence plain meanings for these first 10 relationships:
- impactsITService — Incident → ITService
- impactsBusinessService — Incident → BusinessService
- dependsOnITService — BusinessService → ITService
- deliveredThroughChannel — BusinessService → CustomerChannel
- implementedByApplication — ITService → Application
- runsOnConfigurationItem — Application → ConfigurationItem
- affectsConfigurationItem — Incident → ConfigurationItem
- dependsOnThirdPartyService — ITService → ThirdPartyService
- providedByVendor — ThirdPartyService → Vendor
- triggeredByAlert — Incident → Alert

Short plain explanations are enough, like:
- `impactsITService: The IT service affected by the incident.`

### Turn 43 — user

- **impacts IT service**: The IT service that is affected by the incident.
- **impacts business service**: The business service that is affected by the incident.
- **depends on IT service**: The IT service that a business service relies on to operate.
- **delivered through channel**: The customer channel through which a business service is provided.
- **implemented by application**: The application that delivers or implements the IT service.
- **runs on configuration item**: The managed technical component that the application runs on.
- **affects configuration item**: The configuration item involved in or affected by the incident.
- **depends on third-party service**: The external service that the IT service relies on.
- **provided by vendor**: The vendor that provides the third-party service.
- **triggered by alert**: The alert that opened or triggered the incident.

### Turn 43 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 43 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases: []
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases: []
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases: []
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: null
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 43 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: impactsItservice\n    from: Incident\n    to: ITService\n    meaning: The IT service that is affected by the incident.\n  - name: impactsBusinessService\n    from: Incident\n    to: BusinessService\n    meaning: The business service that is affected by the incident.\n  - name: dependsOnItservice\n    from: BusinessService\n    to: ITService\n    meaning: The IT service that a business service relies on to operate.\n  - name: deliveredThroughChannel\n    from: BusinessService\n    to: CustomerChannel\n    meaning: The customer channel through which a business service is provided.\n  - name: implementedByApplication\n    from: ITService\n    to: Application\n    meaning: The application that delivers or implements the IT service.\n  - name: runsOnConfigurationItem\n    from: Application\n    to: ConfigurationItem\n    meaning: The managed technical component that the application runs on.\n  - name: affectsConfigurationItem\n    from: Incident\n    to: ConfigurationItem\n    meaning: The configuration item involved in or affected by the incident.\n  - name: dependsOnThirdPartyService\n    from: ITService\n    to: ThirdPartyService\n    meaning: The external service that the IT service relies on.\n  - name: providedByVendor\n    from: ThirdPartyService\n    to: Vendor\n    meaning: The vendor that provides the third-party service.\n  - name: triggeredByAlert\n    from: Incident\n    to: Alert\n    meaning: The alert that opened or triggered the incident."
}
```

### Turn 43 — tool

Applied. Added 0, updated 10 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 43 — assistant

Captured those relationship meanings.

Next relationship meaning batch:
- correlatedFromEvent — Incident → Event
- resolvedByChange — Incident → Change
- affectsITService — Change → ITService
- modifiesConfigurationItem — Change → ConfigurationItem
- deploysApplication — Deployment → Application
- targetsEnvironment — Deployment → Environment
- ownsITService — ServiceOwner → ITService
- assignedToResolverGroup — Incident → ResolverGroup
- supportsITService — ResolverGroup → ITService
- supportsConfigurationItem — ResolverGroup → ConfigurationItem

Please give one-sentence meanings for those ten.

### Turn 44 — user

- **correlated from event**: The event data that has been correlated into the incident.
- **resolved by change**: The change used to resolve the incident.
- **affects IT service**: The IT service affected by the change.
- **modifies configuration item**: The configuration item modified by the change.
- **deploys application**: The application installed or activated by the deployment.
- **targets environment**: The environment where the deployment is executed.
- **owns IT service**: The IT service the service owner is accountable for.
- **assigned to resolver group**: The resolver group assigned to handle the incident.
- **supports IT service**: The IT service that the resolver group supports.
- **supports configuration item**: The configuration item or technical area that the resolver group supports.

### Turn 44 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 44 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases: []
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases: []
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases: []
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: null
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: null
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: null
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 44 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: correlatedFromEvent\n    from: Incident\n    to: Event\n    meaning: The event data that has been correlated into the incident.\n  - name: resolvedByChange\n    from: Incident\n    to: Change\n    meaning: The change used to resolve the incident.\n  - name: affectsItservice\n    from: Change\n    to: ITService\n    meaning: The IT service affected by the change.\n  - name: modifiesConfigurationItem\n    from: Change\n    to: ConfigurationItem\n    meaning: The configuration item modified by the change.\n  - name: deploysApplication\n    from: Deployment\n    to: Application\n    meaning: The application installed or activated by the deployment.\n  - name: targetsEnvironment\n    from: Deployment\n    to: Environment\n    meaning: The environment where the deployment is executed.\n  - name: ownsItservice\n    from: ServiceOwner\n    to: ITService\n    meaning: The IT service the service owner is accountable for.\n  - name: assignedToResolverGroup\n    from: Incident\n    to: ResolverGroup\n    meaning: The resolver group assigned to handle the incident.\n  - name: supportsItservice\n    from: ResolverGroup\n    to: ITService\n    meaning: The IT service that the resolver group supports.\n  - name: supportsConfigurationItem\n    from: ResolverGroup\n    to: ConfigurationItem\n    meaning: The configuration item or technical area that the resolver group supports."
}
```

### Turn 44 — tool

Applied. Added 0, updated 10 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 44 — assistant

Captured those too.

Next relationship meaning batch:
- hasMemberOnCallEngineer — ResolverGroup → OnCallEngineer
- handledByOnCallEngineer — Incident → OnCallEngineer
- coordinatedByIncidentCommander — Incident → IncidentCommander
- handledWithRunbook — Incident → Runbook
- hasWorkaround — Problem → Workaround
- documentsWorkaround — Runbook → Workaround
- appliesToITService — RecoveryPlan → ITService
- protectsConfigurationItem — BackupSet → ConfigurationItem
- usesBackupSet — RecoveryPlan → BackupSet
- evaluatedByMaterialityAssessment — Incident → MaterialityAssessment

Please give one-sentence meanings for those ten.

### Turn 45 — user

- **has member on-call engineer**: The on-call engineer who belongs to the resolver group.
- **handled by on-call engineer**: The on-call engineer actively handling the incident.
- **coordinated by incident commander**: The incident commander directing coordination of the incident.
- **handled with runbook**: The runbook used to diagnose, respond to, or recover the incident.
- **has workaround**: The workaround available for the diagnosed problem.
- **documents workaround**: The workaround that is documented in the runbook.
- **applies to IT service**: The IT service covered by the recovery plan.
- **protects configuration item**: The configuration item whose recoverable data is protected by the backup set.
- **uses backup set**: The backup set used by the recovery plan for restoration.
- **evaluated by materiality assessment**: The materiality assessment used to determine the incident’s significance and reporting implications.

### Turn 45 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 45 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases: []
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases: []
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases: []
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 45 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasMemberOnCallEngineer\n    from: ResolverGroup\n    to: OnCallEngineer\n    meaning: The on-call engineer who belongs to the resolver group.\n  - name: handledByOnCallEngineer\n    from: Incident\n    to: OnCallEngineer\n    meaning: The on-call engineer actively handling the incident.\n  - name: coordinatedByIncidentCommander\n    from: Incident\n    to: IncidentCommander\n    meaning: The incident commander directing coordination of the incident.\n  - name: handledWithRunbook\n    from: Incident\n    to: Runbook\n    meaning: The runbook used to diagnose, respond to, or recover the incident.\n  - name: hasWorkaround\n    from: Problem\n    to: Workaround\n    meaning: The workaround available for the diagnosed problem.\n  - name: documentsWorkaround\n    from: Runbook\n    to: Workaround\n    meaning: The workaround that is documented in the runbook.\n  - name: appliesToItservice\n    from: RecoveryPlan\n    to: ITService\n    meaning: The IT service covered by the recovery plan.\n  - name: protectsConfigurationItem\n    from: BackupSet\n    to: ConfigurationItem\n    meaning: The configuration item whose recoverable data is protected by the backup set.\n  - name: usesBackupSet\n    from: RecoveryPlan\n    to: BackupSet\n    meaning: The backup set used by the recovery plan for restoration.\n  - name: evaluatedByMaterialityAssessment\n    from: Incident\n    to: MaterialityAssessment\n    meaning: The materiality assessment used to determine the incident’s significance and reporting implications."
}
```

### Turn 45 — tool

Applied. Added 0, updated 10 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 45 — assistant

Captured those.

Final relationship meaning batch:
- supportedByEvidence — Incident → Evidence
- communicatedThroughCommunication — Incident → Communication
- triggersRegulatoryNotification — MaterialityAssessment → RegulatoryNotification
- reportsIncident — RegulatoryNotification → Incident
- sentToRegulator — RegulatoryNotification → Regulator
- includesEvidence — RegulatoryNotification → Evidence
- reviewsIncident — PostIncidentReview → Incident
- producesCorrectiveAction — PostIncidentReview → CorrectiveAction
- identifiesProblem — PostIncidentReview → Problem
- linkedToProblem — Incident → Problem
- justifiedByIncident — EmergencyChange → Incident

Please give one-sentence meanings for those eleven.

### Turn 46 — user

- **supported by evidence**: The evidence retained to support analysis, accountability, or verification for the incident.
- **communicated through communication**: The communication records used to inform stakeholders about the incident.
- **triggers regulatory notification**: The regulatory notification initiated by the materiality assessment result.
- **reports incident**: The incident that the regulatory notification formally reports.
- **sent to regulator**: The regulator that receives the regulatory notification.
- **includes evidence**: The supporting evidence included with the regulatory notification.
- **reviews incident**: The incident examined in the post-incident review.
- **produces corrective action**: The corrective action created as an outcome of the post-incident review.
- **identifies problem**: The problem identified during the post-incident review.
- **linked to problem**: The underlying or recurring problem associated with the incident.
- **justified by incident**: The incident that justifies the emergency change.

### Turn 46 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 46 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases: []
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases: []
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases: []
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 46 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: supportedByEvidence\n    from: Incident\n    to: Evidence\n    meaning: The evidence retained to support analysis, accountability, or verification for the incident.\n  - name: communicatedThroughCommunication\n    from: Incident\n    to: Communication\n    meaning: The communication records used to inform stakeholders about the incident.\n  - name: triggersRegulatoryNotification\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n    meaning: The regulatory notification initiated by the materiality assessment result.\n  - name: reportsIncident\n    from: RegulatoryNotification\n    to: Incident\n    meaning: The incident that the regulatory notification formally reports.\n  - name: sentToRegulator\n    from: RegulatoryNotification\n    to: Regulator\n    meaning: The regulator that receives the regulatory notification.\n  - name: includesEvidence\n    from: RegulatoryNotification\n    to: Evidence\n    meaning: The supporting evidence included with the regulatory notification.\n  - name: reviewsIncident\n    from: PostIncidentReview\n    to: Incident\n    meaning: The incident examined in the post-incident review.\n  - name: producesCorrectiveAction\n    from: PostIncidentReview\n    to: CorrectiveAction\n    meaning: The corrective action created as an outcome of the post-incident review.\n  - name: identifiesProblem\n    from: PostIncidentReview\n    to: Problem\n    meaning: The problem identified during the post-incident review.\n  - name: linkedToProblem\n    from: Incident\n    to: Problem\n    meaning: The underlying or recurring problem associated with the incident.\n  - name: justifiedByIncident\n    from: EmergencyChange\n    to: Incident\n    meaning: The incident that justifies the emergency change."
}
```

### Turn 46 — tool

Applied. Added 0, updated 11 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 46 — assistant

Captured. That completes the meaning layer for the current class and relationship set.

Recap:
- Every current class now has a plain meaning.
- Every current relationship now has a plain meaning.

Next, aliases/synonyms for classes. I’ll do this in one coherent batch.

For these classes, do you want any common aliases captured beyond what we already have for **Communication / Stakeholder Communication**?
- Incident
- ITService
- BusinessService
- CustomerChannel
- Application
- ConfigurationItem
- ThirdPartyService
- Vendor
- Alert
- Event
- ServiceOwner
- ResolverGroup
- OnCallEngineer
- IncidentCommander
- Runbook
- Workaround
- BackupSet
- RecoveryPlan
- Change
- EmergencyChange
- Deployment
- MaterialityAssessment
- RegulatoryNotification
- Evidence
- Regulator
- Problem
- PostIncidentReview
- CorrectiveAction
- Environment

Please list only real synonyms you actually use, and only where they truly mean the same thing in your organization. If most have none, “no more class aliases” is a perfectly good answer.

### Turn 47 — user

There are a few I’d capture because people do use them interchangeably in practice:

- **Incident**: *ticket* can come up informally, though I’d be careful because not every ticket is an incident.
- **IT service**: *technology service* or *informatics service* may be heard depending on the audience.
- **Application**: *app* informally.
- **Configuration item**: *CI*.
- **Third-party service**: *outsourced service* is a useful near-equivalent in some contexts.
- **Vendor**: *supplier*.
- **Alert**: *alarm* or *monitoring alert* depending on the tooling culture.
- **Service owner**: *service manager* sometimes gets used loosely, though I’d avoid treating them as automatically identical unless your organization really does.
- **Resolver group**: *support group*.
- **On-call engineer**: *on-call* or *duty engineer*.
- **Incident commander**: *incident manager* or *major-incident lead*.
- **Runbook**: *playbook* or *operational procedure*.
- **Workaround**: *temporary fix* in day-to-day speech, though that can blur with change if people are sloppy.
- **Backup set**: *backup* in shorthand.
- **Recovery plan**: *disaster recovery plan* or *DR plan* when that is the actual scope.
- **Emergency change**: *emergency fix* comes up informally.
- **Deployment**: *release deployment* or *go-live* in some teams, though go-live can be narrower.
- **Materiality assessment**: *reportability assessment*.
- **Regulatory notification**: *supervisory notification*.
- **Evidence**: *evidence item* or *artifact*.
- **Regulator**: *supervisory authority*.
- **Post-incident review**: *PIR* or *RCA review*.
- **Corrective action**: *remediation action*.

For the rest, I wouldn’t force extra aliases unless you have a local vocabulary you want to preserve.

### Turn 47 — assistant

A few of those sound potentially unsafe to merge as true aliases without one more check, because you yourself flagged some as only loose or context-dependent.

Please sort just these borderline ones into **yes = treat as true alias** or **no = do not store as alias**:

- Incident → **ticket**
- ServiceOwner → **service manager**
- Workaround → **temporary fix**
- RecoveryPlan → **disaster recovery plan**
- Deployment → **go-live**
- PostIncidentReview → **RCA review**

You can reply like:
- ticket: no
- service manager: yes
- ...

### Turn 48 — user

- ticket: no
- service manager: no
- temporary fix: no
- disaster recovery plan: yes
- go-live: no
- RCA review: yes

### Turn 48 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 48 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases: []
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases: []
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases: []
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases: []
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases: []
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases: []
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases: []
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases: []
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases: []
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases: []
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases: []
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases: []
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The incident examined in the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 48 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ITService:\n    aliases: [Technology Service, Informatics Service]\n  Application:\n    aliases: [App]\n  ConfigurationItem:\n    aliases: [CI]\n  ThirdPartyService:\n    aliases: [Outsourced Service]\n  Vendor:\n    aliases: [Supplier]\n  Alert:\n    aliases: [Alarm, Monitoring Alert]\n  ResolverGroup:\n    aliases: [Support Group]\n  OnCallEngineer:\n    aliases: [On-Call, Duty Engineer]\n  IncidentCommander:\n    aliases: [Incident Manager, Major-Incident Lead]\n  Runbook:\n    aliases: [Playbook, Operational Procedure]\n  BackupSet:\n    aliases: [Backup]\n  RecoveryPlan:\n    aliases: [Disaster Recovery Plan, DR Plan]\n  EmergencyChange:\n    aliases: [Emergency Fix]\n  Deployment:\n    aliases: [Release Deployment]\n  MaterialityAssessment:\n    aliases: [Reportability Assessment]\n  RegulatoryNotification:\n    aliases: [Supervisory Notification]\n  Evidence:\n    aliases: [Evidence Item, Artifact]\n  Regulator:\n    aliases: [Supervisory Authority]\n  PostIncidentReview:\n    aliases: [PIR, RCA Review]\n  CorrectiveAction:\n    aliases: [Remediation Action]"
}
```

### Turn 48 — tool

Applied. Added 0, updated 20 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 48 — assistant

Captured the confirmed class aliases and left out the borderline ones you rejected.

Recap:
- Added real aliases such as **CI**, **App**, **Support Group**, **PIR**, **DR Plan**, **Supervisory Notification**, and others.
- Did **not** store risky non-equivalents like **ticket**, **service manager**, **temporary fix**, or **go-live** as aliases.

Next, relationship aliases. If you use alternate phrasings for any of these in your organization, I can store them; otherwise we can move on.

Please give aliases, if any, for this small batch:
- assignedToResolverGroup
- handledByOnCallEngineer
- coordinatedByIncidentCommander
- handledWithRunbook
- triggersRegulatoryNotification
- sentToRegulator

If there are no useful aliases for these, just say “no relationship aliases for this batch.”

### Turn 49 — user

No relationship aliases for this batch.

### Turn 49 — assistant

Got it.

Recap:
- No relationship aliases to add for that batch.

One final alias check batch, then I’ll stop actively soliciting them unless there are real ones:

Any useful aliases for these relationships?
- impactsITService
- impactsBusinessService
- dependsOnThirdPartyService
- resolvedByChange
- linkedToProblem
- justifiedByIncident

If none, just say “none for this batch” and we’ll move on.

### Turn 50 — user

None for this batch.

### Turn 50 — assistant

Understood.

Recap of the language phase:
- Meanings are captured for all current classes and relationships.
- A solid set of class aliases is captured.
- Two alias batches in a row produced no further relationship aliases, so I’ll stop probing for more.

Next is constraints and fixed choices. We already have many allowed-value lists. For this phase I need to check which properties are required/bounded based on what breaks if they are missing or wrong.

I’ll do one focused batch first, on the most action-critical **Incident** properties:
- `severity`
- `category`
- `status`
- `majorIncidentDeclared`
- `majorIncidentDeclaredAt`

For each one, what breaks if it is missing or wrong?
Please answer property by property, briefly. For example:
- severity: routing and escalation break
- status: closure and action gating break

That will let me determine which of these are genuinely required for action checks.

### Turn 51 — user

- **severity**: escalation and major-incident decision-making break, because you cannot judge the seriousness of the case properly.
- **category**: diagnosis, routing, and the right handling path can break, especially where cyber-related handling or specialist involvement matters.
- **status**: action gating breaks across the lifecycle, because assignment, containment, declaration, recovery progression, and closure all depend on the current incident state.
- **major incident declared**: major-incident coordination can break or become ambiguous, because people cannot tell whether the exceptional command and communication path has formally started.
- **major incident declared at**: auditability and verification of the declaration break, and time-based review of the major-incident response becomes weak. It matters once the case has actually been declared.

### Turn 51 — assistant

Good — that gives me the action-boundary rationale.

Recap:
- `severity`, `category`, and `status` are clearly decision-critical.
- `majorIncidentDeclared` is needed to know whether the exceptional major-incident path is in force.
- `majorIncidentDeclaredAt` matters once a declaration has occurred, mainly for auditability and verification.

Next fixed-choice/requiredness batch on reporting and communication:
- `MaterialityAssessment.result`
- `MaterialityAssessment.reportingDueTime`
- `RegulatoryNotification.status`
- `RegulatoryNotification.dueAt`
- `Communication.status`
- `Evidence.integrityStatus`
- `CorrectiveAction.status`

For each one, what breaks if it is missing or wrong? Short property-by-property answers are enough.

### Turn 52 — user

- **Materiality assessment result**: regulatory decision-making breaks, because you cannot tell whether notification is not needed, still unclear, or reportable.
- **Materiality assessment reporting due time**: deadline management breaks once reporting is in scope, because you cannot judge urgency against the required submission window.
- **Regulatory notification status**: submission control and verification break, because you cannot tell whether the notification is still being drafted, approved, submitted, accepted, or needs remediation.
- **Regulatory notification due at**: deadline control breaks, because you cannot confirm whether submission is still on time.
- **Communication status**: approval and send control break, because you cannot tell whether a message is only drafted, approved, submitted, or otherwise finalized.
- **Evidence integrity status**: trust in the evidence breaks, especially for cyber-related cases, because you cannot judge whether the evidence is merely collected, verified, sealed, or compromised.
- **Corrective action status**: follow-up tracking breaks, because you cannot tell what remains open, blocked, implemented, or closed.

### Turn 52 — assistant

Good. That confirms those value-set properties are not just descriptive; they are action- and decision-bearing.

Recap:
- Reporting control depends on `MaterialityAssessment.result`, `reportingDueTime`, `RegulatoryNotification.status`, and `dueAt`.
- Communication control depends on `Communication.status`.
- Evidence trust depends on `Evidence.integrityStatus`.
- Follow-up tracking depends on `CorrectiveAction.status`.

Now we move to rules.

First rule batch, grounded directly in your accepted questions and actions:
- **major-incident declaration**
- **regulatory notification required**
- **incident closure complete**

For each of those three, please give me a plain-language condition list.

Use only conditions we have already captured in the model. For example, say things like:
- incident severity is ...
- incident majorIncidentDeclared is ...
- materiality assessment result is ...
- incident status is ...
- corrective action status is ...

Start with:
1. conditions to declare a major incident
2. conditions that make regulatory notification required
3. conditions for incident closure to be complete

### Turn 53 — user

Here’s how I’d state those three in operational terms.

### 1. Conditions to declare a major incident
- The incident is **not already resolved, closed, or cancelled**.
- The incident **severity is critical or high**.
- At least one **impacted IT service** is identified.
- An **incident commander** is assigned.

### 2. Conditions that make regulatory notification required
I’d be careful with the wording here. Operationally, I would not let the agent make a legal conclusion from scratch. The clean condition in the process is:
- The **materiality assessment result is reportable**.

And for actually submitting it, further conditions apply, but that is a separate action boundary.

### 3. Conditions for incident closure to be complete
- The incident **status is resolved or monitoring**.
- Impacted services have **healthy** state, or there is an **accepted residual condition**.
- **Resolution and restoration evidence** are recorded.
- Required **stakeholder communications** are complete.
- If it is a **major incident** or a **cyber-related incident**, a **post-incident review** is scheduled or completed.

### Turn 53 — assistant

That’s strong, but two of your closure conditions name things we have not yet modeled directly enough to check without ambiguity:

- **accepted residual condition**
- **resolution and restoration evidence**
- and “communications are complete” is close, but we currently have communication records and statuses, not yet an explicit rule for what counts as complete

I don’t want to record a rule the model can’t actually support yet.

So one focused question:
For the closure rule, which of these should we add as explicit properties versus check through existing linked records?

Please answer for these three items only:
1. **accepted residual condition** — property on Incident, or not modeled explicitly?
2. **resolution/restoration evidence recorded** — property on Incident, or derived from linked Evidence records?
3. **communications complete** — property on Incident, or derived from linked Communication records?

### Turn 54 — user

1. **Accepted residual condition** — not modeled as its own explicit property in what we’ve captured so far. I would treat that as part of the closure decision logic tied to service health and accepted operational state, rather than force a new field unless you specifically need it.

2. **Resolution/restoration evidence recorded** — derive it from linked **evidence** records, not from a separate property on the incident.

3. **Communications complete** — derive it from linked **communication** records, not from a separate property on the incident.

### Turn 54 — assistant

Understood. I’ll keep the rule grounded in existing links and avoid inventing extra fields.

Recap:
- No new explicit property for residual condition.
- Closure checks should derive evidence completeness from linked **Evidence**.
- Closure checks should derive communications completeness from linked **Communication**.

One more focused closure clarification before I record these rules:

You said closure requires a post-incident review to be **scheduled or completed** for major or cyber-related incidents.  
We currently have `PostIncidentReview.heldOn`, but no explicit review status.

Do you want:
- an explicit `status` property on **PostIncidentReview**, or
- should “scheduled or completed” be inferred only from whether a review record exists and whether `heldOn` is populated?

### Turn 55 — user

I’d want an explicit **status** on **post-incident review** if you need to check “scheduled or completed” cleanly.

Without that, you can tell a review happened from **held on**, but you cannot reliably tell that it is already scheduled but not yet held.

### Turn 55 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 55 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The incident examined in the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 55 — assistant

Good. That means we need one small addition before the closure rule is fully recordable.

Please give the allowed values for **PostIncidentReview.status**.

If useful, a shape like this is enough:
- `scheduled, in-progress, completed, cancelled`

Use your own actual lifecycle terms.

### Turn 56 — user

For **post-incident review status**, I’d use:

- `scheduled`
- `completed`

That is enough for the closure check you’re trying to support.

### Turn 56 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 56 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The incident examined in the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 56 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PostIncidentReview:\n    properties:\n      status:\n        type: text\n        allowed: [scheduled, completed]"
}
```

### Turn 56 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 56 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canDeclareMajorIncident:\n    conditions:\n      - incident status is not resolved\n      - incident status is not closed\n      - incident status is not cancelled\n      - incident severity is sev1-critical or sev2-high\n      - incident impacts at least one IT service\n      - incident is coordinated by an incident commander\n  regulatoryNotificationRequired:\n    conditions:\n      - incident is evaluated by a materiality assessment\n      - materiality assessment result is reportable\n  incidentClosureComplete:\n    conditions:\n      - incident status is resolved or monitoring\n      - each impacted IT service health state is healthy\n      - incident is supported by evidence\n      - incident is communicated through communication\n      - if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed\n      - if incident category is cybersecurity, post-incident review status is scheduled or completed"
}
```

### Turn 56 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 56 — assistant

Captured one needed addition:
- **PostIncidentReview.status** with allowed values `scheduled, completed`

Recap:
- We now have an explicit way to check your “scheduled or completed” closure condition.

I could not persist the rules in this same turn because the tool only allows one normal commit call per message; the extra calls are reserved for fixing contradictions introduced by that edit. So I need to confirm the rule wording with you now, and then I’ll record them on the next turn.

Please confirm or correct this rule set:

**canDeclareMajorIncident**
- incident status is not `resolved`
- incident status is not `closed`
- incident status is not `cancelled`
- incident severity is `sev1-critical` or `sev2-high`
- incident impacts at least one IT service
- incident is coordinated by an incident commander

**regulatoryNotificationRequired**
- incident is evaluated by a materiality assessment
- materiality assessment result is `reportable`

**incidentClosureComplete**
- incident status is `resolved` or `monitoring`
- each impacted IT service health state is `healthy`
- incident is supported by evidence
- incident is communicated through communication
- if incident `majorIncidentDeclared` is true, post-incident review status is `scheduled` or `completed`
- if incident category is `cybersecurity`, post-incident review status is `scheduled` or `completed`

If that matches your intent, reply:
- **“confirm rules”**

Or give any corrections line by line.

### Turn 57 — user

confirm rules

### Turn 57 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 57 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The incident examined in the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 57 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canDeclareMajorIncident:\n    conditions:\n      - incident status is not resolved\n      - incident status is not closed\n      - incident status is not cancelled\n      - incident severity is sev1-critical or sev2-high\n      - incident impacts at least one IT service\n      - incident is coordinated by an incident commander\n  regulatoryNotificationRequired:\n    conditions:\n      - incident is evaluated by a materiality assessment\n      - materiality assessment result is reportable\n  incidentClosureComplete:\n    conditions:\n      - incident status is resolved or monitoring\n      - each impacted IT service health state is healthy\n      - incident is supported by evidence\n      - incident is communicated through communication\n      - if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed\n      - if incident category is cybersecurity, post-incident review status is scheduled or completed"
}
```

### Turn 57 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 57 — assistant

Rules captured.

Recap:
- **canDeclareMajorIncident**
- **regulatoryNotificationRequired**
- **incidentClosureComplete**

Now we move to actions, and this will also let us clear the action-input errors still in the model.

First action batch:
- acknowledge alert
- assign incident to resolver group
- declare major incident
- send approved stakeholder communication

Please confirm the input class for each, and then give:
1. precondition rule(s), if any
2. effect
3. verification

I’ll propose the obvious input classes to make this easy:
- **acknowledgeAlert** → `Alert`
- **assignIncidentToResolverGroup** → `Incident`
- **declareMajorIncident** → `Incident`
- **sendApprovedStakeholderCommunication** → `Communication`

Please confirm/correct those four inputs, then give the preconditions/effect/verification for each in compact form.

### Turn 58 — user

Mostly right, with one correction:

- **acknowledge alert** → **Alert**: confirmed
- **assign incident to resolver group** → **Incident**: confirmed
- **declare major incident** → **Incident**: confirmed
- **send approved stakeholder communication** → I would put the input as **Incident**, not communication, because the action is to send communication for the incident under the required communication controls

Now the compact action details.

### Acknowledge alert
- **Input**: Alert
- **Preconditions**: alert status is `new`; operator is authorized for the responsible resolver group
- **Effect**: alert status becomes `acknowledged`; acknowledgement timestamp is recorded
- **Verification**: read the alert and confirm status is `acknowledged`

### Assign incident to resolver group
- **Input**: Incident
- **Preconditions**: incident status is not `closed` or `cancelled`; the resolver group supports an affected IT service or configuration item
- **Effect**: the incident is assigned to the resolver group
- **Verification**: read the incident and confirm the resolver group assignment

### Declare major incident
- **Input**: Incident
- **Preconditions**: incident status is not `resolved`, `closed`, or `cancelled`; severity is `sev1-critical` or `sev2-high`; at least one impacted IT service is identified; incident commander is assigned
- **Effect**: the incident is declared as a major incident; major-incident coordination and communication cadence begin
- **Verification**: read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record

### Send stakeholder communication
- **Input**: Incident
- **Preconditions**: audience, message, owner, and approval state are recorded; message content matches the latest verified incident state
- **Effect**: the communication is sent and timestamped
- **Verification**: confirm delivery status and archive the final message

### Turn 58 — assistant

Good correction on **sendApprovedStakeholderCommunication**. I agree the action is fundamentally about the **Incident**.

One focused clarification before I record this batch, because two preconditions/effects mention things we have not yet modeled explicitly enough to check:

For these items, should we add explicit properties, or leave them out of the modeled preconditions?

1. **Alert acknowledgement timestamp** — property on `Alert`, yes or no?
2. **Communication owner** — property on `Communication`, yes or no?
3. **Communication delivery status** — property on `Communication`, yes or no?

Please answer just:
- acknowledgement timestamp: yes/no
- communication owner: yes/no
- communication delivery status: yes/no

### Turn 59 — user

- acknowledgement timestamp: yes
- communication owner: no
- communication delivery status: no

### Turn 59 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 59 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The incident examined in the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - incident status is not resolved
      - incident status is not closed
      - incident status is not cancelled
      - incident severity is sev1-critical or sev2-high
      - incident impacts at least one IT service
      - incident is coordinated by an incident commander
  regulatoryNotificationRequired:
    conditions:
      - incident is evaluated by a materiality assessment
      - materiality assessment result is reportable
  incidentClosureComplete:
    conditions:
      - incident status is resolved or monitoring
      - each impacted IT service health state is healthy
      - incident is supported by evidence
      - incident is communicated through communication
      - "if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed"
      - "if incident category is cybersecurity, post-incident review status is scheduled or completed"
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: Acknowledges the alert.
    verification: Confirm the alert is recorded as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: Assigns the incident to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: Marks the incident as declared as a major incident.
    verification: Confirm the incident shows major-incident declaration.
  sendApprovedStakeholderCommunication:
    input: null
    preconditions: []
    effect: Sends an approved stakeholder communication.
    verification: Confirm the communication was sent through the approved channel.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "sendApprovedStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 59 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    properties:\n      acknowledgedAt:\n        type: date\n\nactions:\n  acknowledgeAlert:\n    input: Alert\n    effect: Alert status becomes acknowledged and acknowledgement time is recorded.\n    verification: Read the alert and confirm status is acknowledged.\n  assignIncidentToResolverGroup:\n    input: Incident\n    effect: The incident is assigned to the resolver group.\n    verification: Read the incident and confirm the resolver group assignment.\n  declareMajorIncident:\n    input: Incident\n    preconditions: [canDeclareMajorIncident]\n    effect: The incident is declared as a major incident, and major-incident coordination and communication cadence begin.\n    verification: Read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record.\n  sendApprovedStakeholderCommunication:\n    input: Incident\n    effect: The communication is sent and timestamped.\n    verification: Confirm the final message is archived.\n"
}
```

### Turn 59 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
7 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 59 — assistant

Captured that batch and cleared several of the action-input errors.

Recap:
- Added `Alert.acknowledgedAt`
- Set action inputs for:
  - **acknowledgeAlert** → `Alert`
  - **assignIncidentToResolverGroup** → `Incident`
  - **declareMajorIncident** → `Incident`
  - **sendApprovedStakeholderCommunication** → `Incident`
- Recorded the declared-major-incident action against the rule **canDeclareMajorIncident**

I did **not** yet encode all the informal preconditions for the first, second, and fourth actions, because some of them still rely on concepts we have not modeled explicitly enough:
- operator authorization
- “message content matches the latest verified incident state”
- explicit communication approval-state linkage from the incident-side action step

So those remain partly open, rather than me pretending they’re fully checkable already.

Next action batch:
- contain incident
- isolate configuration item linked to incident
- execute emergency change for an active incident
- submit approved regulatory notification

Please give, for each:
1. confirmed input class
2. precondition rule(s) or plain-language preconditions
3. effect
4. verification

I’ll suggest the likely inputs to confirm or correct:
- **containIncident** → `Incident`
- **isolateConfigurationItem** → `ConfigurationItem`
- **executeEmergencyChange** → `EmergencyChange`
- **submitRegulatoryNotification** → `RegulatoryNotification`

### Turn 60 — user

Three of those inputs are right, and one I’d correct:

- **contain incident** → **Incident**: confirmed
- **isolate configuration item linked to incident** → I would use **Incident** as the input, not configuration item alone, because the action depends on the incident context and the linked affected item
- **execute emergency change** → **Emergency change**: confirmed
- **submit regulatory notification** → **Regulatory notification**: confirmed

Now the compact action details.

### Contain incident
- **Input**: Incident
- **Preconditions**: incident status is `acknowledged` or `investigating`; containment scope and expected side effects are recorded
- **Effect**: approved containment steps are executed; incident status becomes `contained` when containment is verified
- **Verification**: verify containment indicators and resulting service impact

### Isolate configuration item
- **Input**: Incident
- **Preconditions**: the configuration item is linked to the incident; isolation impact is assessed; rollback or reconnection method is available
- **Effect**: the configuration item is isolated from the defined networks or dependencies
- **Verification**: confirm isolation and check remaining service health

### Execute emergency change
- **Input**: Emergency change
- **Preconditions**: the change is linked to an active incident; implementation plan and backout plan are present; affected configuration items are identified; risk acceptance is explicitly recorded
- **Effect**: the approved emergency change is implemented and its status is updated
- **Verification**: run technical checks, verify service health, and record implementation evidence

### Submit regulatory notification
- **Input**: Regulatory notification
- **Preconditions**: materiality assessment result is `reportable`; the notification is linked to the incident and regulator; required fields and supporting evidence are complete; notification status is `approved`; submission occurs before `due at`
- **Effect**: notification status becomes `submitted`; submission receipt is stored
- **Verification**: confirm accepted submission, or record rejection and remediation if it is not accepted

### Turn 60 — assistant

Good. Two of those mention checkable things we do not yet have as explicit properties, so I need one focused cleanup before recording them.

Please answer yes/no for whether to add these explicit properties:

1. **Incident containment scope recorded** — property on `Incident`
2. **Incident containment side effects recorded** — property on `Incident`
3. **Configuration item isolation impact assessed** — property on `ConfigurationItem` or on `Incident`?  
   Reply with one of: `ConfigurationItem`, `Incident`, or `no explicit property`
4. **Configuration item rollback/reconnection method available** — property on `ConfigurationItem`, or derived another way?
5. **Regulatory notification submission receipt stored** — property on `RegulatoryNotification`

Please answer in a compact list.

### Turn 61 — user

- Incident containment scope recorded: no explicit property
- Incident containment side effects recorded: no explicit property
- Configuration item isolation impact assessed: no explicit property
- Configuration item rollback/reconnection method available: derived another way
- Regulatory notification submission receipt stored: no explicit property

### Turn 61 — assistant

Understood. I won’t invent those fields.

Recap:
- For containment, isolation, and notification receipt, you prefer those checks to remain operational/derived rather than modeled as new explicit properties.
- That means I can record these actions, but some verification text must stay at a slightly higher plain-language level rather than pretending every detail is fully field-checkable.

One more focused clarification before I persist this batch:

For **submitRegulatoryNotification**, you said verification is:
- confirm accepted submission, **or**
- record rejection and remediation if it is not accepted

Should the action’s verification step be written narrowly as:
- **confirm the notification status is submitted or accepted and the submittedAt time is recorded**

or do you want me to keep the broader plain-language verification:
- **confirm accepted submission, or record rejection and remediation if not accepted**

The first is stricter about only referencing modeled fields; the second matches your process wording more closely. Which do you want?

### Turn 62 — user

Keep the broader plain-language verification. That is closer to how we actually manage it operationally.

### Turn 62 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 62 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
      acknowledgedAt:
        type: date
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The incident examined in the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - incident status is not resolved
      - incident status is not closed
      - incident status is not cancelled
      - incident severity is sev1-critical or sev2-high
      - incident impacts at least one IT service
      - incident is coordinated by an incident commander
  regulatoryNotificationRequired:
    conditions:
      - incident is evaluated by a materiality assessment
      - materiality assessment result is reportable
  incidentClosureComplete:
    conditions:
      - incident status is resolved or monitoring
      - each impacted IT service health state is healthy
      - incident is supported by evidence
      - incident is communicated through communication
      - "if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed"
      - "if incident category is cybersecurity, post-incident review status is scheduled or completed"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions: []
    effect: Alert status becomes acknowledged and acknowledgement time is recorded.
    verification: Read the alert and confirm status is acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions: []
    effect: The incident is assigned to the resolver group.
    verification: Read the incident and confirm the resolver group assignment.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "The incident is declared as a major incident, and major-incident coordination and communication cadence begin."
    verification: "Read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record."
  sendApprovedStakeholderCommunication:
    input: Incident
    preconditions: []
    effect: The communication is sent and timestamped.
    verification: Confirm the final message is archived.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: Executes an emergency change for an active incident.
    verification: Confirm the emergency change execution is recorded.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: Submits an approved regulatory notification.
    verification: Confirm the regulatory notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: null
    preconditions: []
    effect: Applies a containment action to the incident.
    verification: Confirm the incident record shows containment was performed.
  isolateConfigurationItem:
    input: null
    preconditions: []
    effect: Isolates a configuration item linked to an incident.
    verification: Confirm the configuration item is recorded as isolated.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 7 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "isolateConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 62 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  containIncident:\n    input: Incident\n    effect: Approved containment steps are executed, and incident status becomes contained when containment is verified.\n    verification: Verify containment indicators and resulting service impact.\n  isolateConfigurationItem:\n    input: Incident\n    effect: The configuration item linked to the incident is isolated from the defined networks or dependencies.\n    verification: Confirm isolation and check remaining service health.\n  executeEmergencyChange:\n    input: EmergencyChange\n    effect: The approved emergency change is implemented and its status is updated.\n    verification: Run technical checks, verify service health, and record implementation evidence.\n  submitRegulatoryNotification:\n    input: RegulatoryNotification\n    effect: Notification status becomes submitted.\n    verification: Confirm accepted submission, or record rejection and remediation if it is not accepted.\n"
}
```

### Turn 62 — tool

Applied. Added 0, updated 4 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 62 — assistant

Captured that action batch and cleared more input errors.

Recap:
- **containIncident** → `Incident`
- **isolateConfigurationItem** → `Incident`
- **executeEmergencyChange** → `EmergencyChange`
- **submitRegulatoryNotification** → `RegulatoryNotification`

I kept the verification for regulatory notification in the broader operational wording, as you requested.

There are now **3 action-input issues left** to resolve:
- **closeIncident**
- **failOverService**
- **restoreFromBackup**

So next batch:
Please confirm the input class for each, and then give preconditions, effect, and verification.

Likely inputs to confirm or correct:
- **closeIncident** → `Incident`
- **failOverService** → `ITService`
- **restoreFromBackup** → `BackupSet`

Please reply in the same compact style.

### Turn 63 — user

Two of those I’d correct slightly in favor of the incident-led operational context:

- **close incident** → **Incident**: confirmed
- **fail over service** → **Incident**, not IT service alone
- **restore from backup** → **Backup set**: confirmed

Now the compact details.

### Close incident
- **Input**: Incident
- **Preconditions**: incident status is `resolved` or `monitoring`; impacted services have health state `healthy` or an accepted residual condition; resolution and restoration evidence are recorded; required stakeholder communications are complete; major and cyber-related incidents have a scheduled or completed post-incident review
- **Effect**: incident status becomes `closed`; closure timestamp is recorded
- **Verification**: read the incident and linked services; confirm closure state and retained evidence

### Fail over service
- **Input**: Incident
- **Preconditions**: the recovery plan applies to the affected service; the target recovery environment is available; the data recovery point is acceptable
- **Effect**: the service workload is moved to the recovery environment
- **Verification**: confirm service health and critical business transactions in the recovery environment

### Restore from backup
- **Input**: Backup set
- **Preconditions**: backup status is `successful` or `verified`; the backup protects the target; the restore point and target environment are approved
- **Effect**: backup data is restored to the target
- **Verification**: validate data integrity and application functionality after restore

### Turn 63 — assistant

Good. This surfaced three checkability gaps I should resolve before recording the last actions:

1. **closure timestamp** — do you want this as an explicit property on `Incident`?
2. **Backup set status** — do you want an explicit `status` property on `BackupSet` with values including `successful` and `verified`?
3. **target recovery environment is available / restore target environment approved** — do you want an explicit property on `Environment`, or should that remain outside the modeled checks?

Please answer in compact form:
- closure timestamp: yes/no
- backup set status: yes/no
- environment readiness/approval property: yes/no

### Turn 64 — user

- closure timestamp: yes
- backup set status: yes
- environment readiness/approval property: no

### Turn 64 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 64 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
      acknowledgedAt:
        type: date
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties: {}
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The incident examined in the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - incident status is not resolved
      - incident status is not closed
      - incident status is not cancelled
      - incident severity is sev1-critical or sev2-high
      - incident impacts at least one IT service
      - incident is coordinated by an incident commander
  regulatoryNotificationRequired:
    conditions:
      - incident is evaluated by a materiality assessment
      - materiality assessment result is reportable
  incidentClosureComplete:
    conditions:
      - incident status is resolved or monitoring
      - each impacted IT service health state is healthy
      - incident is supported by evidence
      - incident is communicated through communication
      - "if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed"
      - "if incident category is cybersecurity, post-incident review status is scheduled or completed"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions: []
    effect: Alert status becomes acknowledged and acknowledgement time is recorded.
    verification: Read the alert and confirm status is acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions: []
    effect: The incident is assigned to the resolver group.
    verification: Read the incident and confirm the resolver group assignment.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "The incident is declared as a major incident, and major-incident coordination and communication cadence begin."
    verification: "Read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record."
  sendApprovedStakeholderCommunication:
    input: Incident
    preconditions: []
    effect: The communication is sent and timestamped.
    verification: Confirm the final message is archived.
  executeEmergencyChange:
    input: EmergencyChange
    preconditions: []
    effect: The approved emergency change is implemented and its status is updated.
    verification: "Run technical checks, verify service health, and record implementation evidence."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions: []
    effect: Notification status becomes submitted.
    verification: "Confirm accepted submission, or record rejection and remediation if it is not accepted."
  closeIncident:
    input: null
    preconditions: []
    effect: "Closes the incident once restoration, evidence, and review conditions are satisfied."
    verification: Confirm the incident status is closed.
  containIncident:
    input: Incident
    preconditions: []
    effect: "Approved containment steps are executed, and incident status becomes contained when containment is verified."
    verification: Verify containment indicators and resulting service impact.
  isolateConfigurationItem:
    input: Incident
    preconditions: []
    effect: The configuration item linked to the incident is isolated from the defined networks or dependencies.
    verification: Confirm isolation and check remaining service health.
  failOverService:
    input: null
    preconditions: []
    effect: Fails over the service using an applicable recovery path.
    verification: Confirm the service is running on the designated recovery path.
  restoreFromBackup:
    input: null
    preconditions: []
    effect: Restores from backup to an approved target.
    verification: Confirm the restore to the approved target is recorded.


# CONSISTENCY CHECK — 3 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "failOverService" has no input class.
#   [error] action-input-missing — Action "restoreFromBackup" has no input class.

### Turn 64 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      closedAt:\n        type: date\n  BackupSet:\n    properties:\n      status:\n        type: text\n        allowed: [successful, verified, failed, expired]\n\nactions:\n  closeIncident:\n    input: Incident\n    preconditions: [incidentClosureComplete]\n    effect: Incident status becomes closed and closure time is recorded.\n    verification: Read the incident and linked services, and confirm closure state and retained evidence.\n  failOverService:\n    input: Incident\n    effect: The service workload is moved to the recovery environment.\n    verification: Confirm service health and critical business transactions in the recovery environment.\n  restoreFromBackup:\n    input: BackupSet\n    effect: Backup data is restored to the target.\n    verification: Validate data integrity and application functionality after restore.\n"
}
```

### Turn 64 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — 3 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "closeIncident" has input class Incident, and its precondition incidentClosureComplete refers to PostIncidentReview, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Incident to PostIncidentReview. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "failOverService" has input class Incident, and its effect refers to Environment, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Incident to Environment. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "restoreFromBackup" has input class BackupSet, and its verification refers to Application, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from BackupSet to Application. Rewording the text does not create the path it assumes.

### Turn 64 — assistant

Captured the final three action inputs and supporting properties:

- `Incident.closedAt`
- `BackupSet.status`
- **closeIncident** → `Incident`
- **failOverService** → `Incident`
- **restoreFromBackup** → `BackupSet`

The tool also gave us three useful path warnings from this edit. These are not contradictions, but they show places where the current graph does not yet let an agent navigate from the action input to something the action text assumes:

1. **closeIncident** needs a navigable path from **Incident** to **PostIncidentReview**
2. **failOverService** needs a navigable path from **Incident** to **Environment**
3. **restoreFromBackup** needs a navigable path from **BackupSet** to **Application**

I need to resolve those before moving to the final validation pass.

So one focused path question covering exactly those three:

Please tell me the real path, in plain words, for each:

1. From **Incident** to **PostIncidentReview**  
   We currently have `PostIncidentReview → Incident`.  
   Do you also want a direct `Incident → PostIncidentReview` fact, or should the action/rule be reworded to avoid needing that direction?

2. From **Incident** to **Environment** for failover  
   What is the actual path? For example, is it:
   - Incident → impacted IT service
   - IT service → recovery plan
   - recovery plan → target environment  
   or something else?

3. From **BackupSet** to **Application** for restore verification  
   What is the actual path? For example, is it:
   - Backup set → configuration item
   - configuration item → application  
   and if so, do you want that direct reverse/application-facing link modeled, or should we keep the verification wording at the backup/data level instead of application functionality?

Please answer those three only.

### Turn 65 — user

1. **Incident to post-incident review**  
   Yes, I would keep a direct **incident to post-incident review** link as well. Operationally, we ask both ways: which review covers this incident, and which incident is this review about.

2. **Incident to environment for failover**  
   The practical path is:  
   - **incident impacts IT service**  
   - **recovery plan applies to IT service**  
   - the failover then uses the target recovery environment from that recovery context

   I would not force a generic direct incident-to-environment relationship just for this.

3. **Backup set to application for restore verification**  
   I would **not** add structure just to force a backup-to-application path here. Keep the verification wording at the level we actually captured: **validate data integrity and application functionality after restore**.  
   In practice the restore affects protected components and then you verify the dependent application works, but I would not model a new direct path solely for that verification sentence unless you later decide to expand the technical dependency layer further.

### Turn 65 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 65 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
      closedAt:
        type: date
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
      acknowledgedAt:
        type: date
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties:
      status:
        type: text
        allowed:
          - successful
          - verified
          - failed
          - expired
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The incident examined in the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - incident status is not resolved
      - incident status is not closed
      - incident status is not cancelled
      - incident severity is sev1-critical or sev2-high
      - incident impacts at least one IT service
      - incident is coordinated by an incident commander
  regulatoryNotificationRequired:
    conditions:
      - incident is evaluated by a materiality assessment
      - materiality assessment result is reportable
  incidentClosureComplete:
    conditions:
      - incident status is resolved or monitoring
      - each impacted IT service health state is healthy
      - incident is supported by evidence
      - incident is communicated through communication
      - "if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed"
      - "if incident category is cybersecurity, post-incident review status is scheduled or completed"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions: []
    effect: Alert status becomes acknowledged and acknowledgement time is recorded.
    verification: Read the alert and confirm status is acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions: []
    effect: The incident is assigned to the resolver group.
    verification: Read the incident and confirm the resolver group assignment.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "The incident is declared as a major incident, and major-incident coordination and communication cadence begin."
    verification: "Read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record."
  sendApprovedStakeholderCommunication:
    input: Incident
    preconditions: []
    effect: The communication is sent and timestamped.
    verification: Confirm the final message is archived.
  executeEmergencyChange:
    input: EmergencyChange
    preconditions: []
    effect: The approved emergency change is implemented and its status is updated.
    verification: "Run technical checks, verify service health, and record implementation evidence."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions: []
    effect: Notification status becomes submitted.
    verification: "Confirm accepted submission, or record rejection and remediation if it is not accepted."
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureComplete
    effect: Incident status becomes closed and closure time is recorded.
    verification: "Read the incident and linked services, and confirm closure state and retained evidence."
  containIncident:
    input: Incident
    preconditions: []
    effect: "Approved containment steps are executed, and incident status becomes contained when containment is verified."
    verification: Verify containment indicators and resulting service impact.
  isolateConfigurationItem:
    input: Incident
    preconditions: []
    effect: The configuration item linked to the incident is isolated from the defined networks or dependencies.
    verification: Confirm isolation and check remaining service health.
  failOverService:
    input: Incident
    preconditions: []
    effect: The service workload is moved to the recovery environment.
    verification: Confirm service health and critical business transactions in the recovery environment.
  restoreFromBackup:
    input: BackupSet
    preconditions: []
    effect: Backup data is restored to the target.
    verification: Validate data integrity and application functionality after restore.


# CONSISTENCY CHECK — 3 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "closeIncident" has input class Incident, and its precondition incidentClosureComplete refers to PostIncidentReview, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "failOverService" has input class Incident, and its effect refers to Environment, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreFromBackup" has input class BackupSet, and its verification refers to Application, which is only reachable against the direction of the relationships between them.

### Turn 65 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasPostIncidentReview\n    from: Incident\n    to: PostIncidentReview\n    meaning: The post-incident review that covers the incident."
}
```

### Turn 65 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] inverse-pair — Incident --hasPostIncidentReview--> PostIncidentReview looks like the inverse of PostIncidentReview --reviewsIncident--> Incident. The profile is one directed relationship per real-world connection, never also its inverse. Keep whichever direction the questions and actions actually navigate.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 65 — assistant

I added the direct **Incident → PostIncidentReview** link you explicitly asked for, but the tool then raised an automated warning: it sees that as the inverse of **PostIncidentReview → Incident** and prefers one directed relationship per connection.

I’m reporting that warning rather than silently discarding it.

So I need one direct decision from you:

Which direction do you want to keep as the modeled fact?

1. **Incident → PostIncidentReview**  
   useful for closure/action navigation from the incident

2. **PostIncidentReview → Incident**  
   useful for review-centric navigation

You previously said you operationally ask both ways, but this tool wants one direction only.  
Please choose **1** or **2**, and I’ll remove the other.

### Turn 66 — user

1

### Turn 66 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "relationships": [
    {
      "from": "PostIncidentReview",
      "to": "Incident",
      "name": "reviewsIncident"
    }
  ]
}
```

### Turn 66 — tool

Removed 1 element(s) — relationships: reviewsIncident (PostIncidentReview → Incident).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 66 — assistant

Resolved: we are keeping **Incident → PostIncidentReview** and removing the reverse direction.

Recap:
- Kept **hasPostIncidentReview** from incident to review
- Removed **reviewsIncident** in the reverse direction to satisfy the tool’s one-direction rule

Two path issues remain before final validation:
1. **failOverService** mentions the recovery environment, but we do not yet have a navigable path from **Incident** to **Environment**
2. **restoreFromBackup** verification mentions application functionality, but you explicitly said not to add structure just to force a backup-to-application path

So one focused cleanup question covering exactly those two:

Which fix do you want?

**A. Failover path**
Do you want me to add a real relationship:
- **RecoveryPlan → Environment**  
for the target recovery environment?

**B. Restore verification wording**
Should I reword **restoreFromBackup** verification to stay fully within the modeled path, for example:
- “Validate restored data integrity and confirm the protected configuration item is restored”
instead of mentioning application functionality?

Please answer:
- Failover path: yes/no
- Reword restore verification: yes/no

### Turn 67 — user

- Failover path: no
- Reword restore verification: no

### Turn 67 — assistant

Understood. I won’t invent either fix.

Recap:
- No new **RecoveryPlan → Environment** relationship
- No rewording of restore verification away from the broader operational wording

That means these remain as known, explicit open modeling limits rather than something I should silently “solve” by adding facts you did not confirm.

Before I run the formal validation pass, I still need the required bounded domain-expansion pass.

We already have the operational core for **Incident**, **ITService**, **ConfigurationItem**, and **RegulatoryNotification**. For those major concepts, are we missing any of these neighboring structures that you think matter here:
- for **Incident**: lifecycle events or additional responsible parties
- for **ITService**: inputs/outputs or related agreements
- for **ConfigurationItem**: subordinate parts/components or measurements/characteristic values
- for **RegulatoryNotification**: related paperwork or later workflow stages

Please answer only for those categories I named. “No, that’s covered” is a perfectly valid answer.

### Turn 68 — user

A few neighboring structures do matter.

- **Incident**: yes, there is still one important neighboring structure around additional responsible parties and stakeholders. We already have service owner, resolver group, on-call engineer, incident commander, communication, and regulator-side reporting, but **stakeholder** itself matters explicitly because incidents notify stakeholders and communications are addressed to them.

- **IT service**: yes, one related agreement structure matters — the **service level objective**. That is the measurable target the IT service is governed by and it matters for restoration and service expectations.

- **Configuration item**: yes, measurements matter. The neighboring structure here is **metric**, because metrics measure configuration items and services and are part of monitoring and diagnosis.

- **Regulatory notification**: no major extra paperwork structure is missing beyond what we already have with materiality assessment, evidence, regulator, and notification status. That’s covered well enough at this level.

### Turn 68 — assistant

Good — that completes the required domain-expansion offer, and it surfaced three candidates that are plausibly justified:

- **Stakeholder**
- **ServiceLevelObjective**
- **Metric**

Recap of the expansion pass:
- You do want one more explicit party concept: **Stakeholder**
- You do want one more agreement/target concept around **ITService**: **ServiceLevelObjective**
- You do want one more measurement concept around **ConfigurationItem** and services: **Metric**
- Nothing further needs to be added around **RegulatoryNotification** at this level

Before I can validate the model, I need to route these through the normal phases rather than dropping them in directly.

First batch:
- **Stakeholder** — justified because incidents notify stakeholders and communications are addressed to them
- **ServiceLevelObjective** — justified because IT service restoration and expectations depend on measurable service targets
- **Metric** — justified because metrics measure services/configuration items for monitoring and diagnosis

For each of these, does the agent need to identify, retrieve, connect, or pass it as a separate class?  
Please answer:
- Stakeholder: yes/no
- ServiceLevelObjective: yes/no
- Metric: yes/no

### Turn 69 — user

- Stakeholder: yes
- Service level objective: yes
- Metric: yes

### Turn 69 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 69 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
      closedAt:
        type: date
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
      acknowledgedAt:
        type: date
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties:
      status:
        type: text
        allowed:
          - successful
          - verified
          - failed
          - expired
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
  - name: hasPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: The post-incident review that covers the incident.
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - incident status is not resolved
      - incident status is not closed
      - incident status is not cancelled
      - incident severity is sev1-critical or sev2-high
      - incident impacts at least one IT service
      - incident is coordinated by an incident commander
  regulatoryNotificationRequired:
    conditions:
      - incident is evaluated by a materiality assessment
      - materiality assessment result is reportable
  incidentClosureComplete:
    conditions:
      - incident status is resolved or monitoring
      - each impacted IT service health state is healthy
      - incident is supported by evidence
      - incident is communicated through communication
      - "if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed"
      - "if incident category is cybersecurity, post-incident review status is scheduled or completed"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions: []
    effect: Alert status becomes acknowledged and acknowledgement time is recorded.
    verification: Read the alert and confirm status is acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions: []
    effect: The incident is assigned to the resolver group.
    verification: Read the incident and confirm the resolver group assignment.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "The incident is declared as a major incident, and major-incident coordination and communication cadence begin."
    verification: "Read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record."
  sendApprovedStakeholderCommunication:
    input: Incident
    preconditions: []
    effect: The communication is sent and timestamped.
    verification: Confirm the final message is archived.
  executeEmergencyChange:
    input: EmergencyChange
    preconditions: []
    effect: The approved emergency change is implemented and its status is updated.
    verification: "Run technical checks, verify service health, and record implementation evidence."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions: []
    effect: Notification status becomes submitted.
    verification: "Confirm accepted submission, or record rejection and remediation if it is not accepted."
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureComplete
    effect: Incident status becomes closed and closure time is recorded.
    verification: "Read the incident and linked services, and confirm closure state and retained evidence."
  containIncident:
    input: Incident
    preconditions: []
    effect: "Approved containment steps are executed, and incident status becomes contained when containment is verified."
    verification: Verify containment indicators and resulting service impact.
  isolateConfigurationItem:
    input: Incident
    preconditions: []
    effect: The configuration item linked to the incident is isolated from the defined networks or dependencies.
    verification: Confirm isolation and check remaining service health.
  failOverService:
    input: Incident
    preconditions: []
    effect: The service workload is moved to the recovery environment.
    verification: Confirm service health and critical business transactions in the recovery environment.
  restoreFromBackup:
    input: BackupSet
    preconditions: []
    effect: Backup data is restored to the target.
    verification: Validate data integrity and application functionality after restore.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "failOverService" has input class Incident, and its effect refers to Environment, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreFromBackup" has input class BackupSet, and its verification refers to Application, which is only reachable against the direction of the relationships between them.

### Turn 69 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Stakeholder: {}\n  ServiceLevelObjective: {}\n  Metric: {}"
}
```

### Turn 69 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 69 — assistant

Captured the three expansion-pass classes:

- **Stakeholder**
- **ServiceLevelObjective**
- **Metric**

Recap:
- These are now in scope and must be connected before final validation.
- We still also have two explicit open warnings from the action layer:
  1. **failOverService** mentions environment without a navigable modeled path from `Incident`
  2. **restoreFromBackup** mentions application functionality without a navigable modeled path from `BackupSet`

Now I need the relationship pass for the three new classes.

Please give the real path in plain words for these:

1. **Stakeholder**  
   How does it connect? Likely around:
   - Incident → Communication
   - Communication → Stakeholder  
   but please confirm or correct.

2. **ServiceLevelObjective**  
   Is the core relationship:
   - ServiceLevelObjective → ITService  
   or the reverse, or something else?

3. **Metric**  
   You said metrics measure services and configuration items.  
   Please confirm whether you want:
   - Metric → ITService
   - Metric → ConfigurationItem  
   and whether both are real modeled facts at this level.

### Turn 70 — user

1. **Stakeholder**  
   Yes, that path is right in substance. In plain words:
   - an **incident notifies stakeholders** directly in the operational sense;
   - a **communication is addressed to stakeholders**;
   - and the incident is communicated through those communications.

2. **Service level objective**  
   The core direction is:
   - an **IT service is governed by a service level objective**.

3. **Metric**  
   Yes, both are real at this level:
   - a **metric measures an IT service**
   - a **metric measures a configuration item**

### Turn 70 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 70 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
      closedAt:
        type: date
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
      acknowledgedAt:
        type: date
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties:
      status:
        type: text
        allowed:
          - successful
          - verified
          - failed
          - expired
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
  Stakeholder:
    meaning: null
    aliases: []
    properties: {}
  ServiceLevelObjective:
    meaning: null
    aliases: []
    properties: {}
  Metric:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
  - name: hasPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: The post-incident review that covers the incident.
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - incident status is not resolved
      - incident status is not closed
      - incident status is not cancelled
      - incident severity is sev1-critical or sev2-high
      - incident impacts at least one IT service
      - incident is coordinated by an incident commander
  regulatoryNotificationRequired:
    conditions:
      - incident is evaluated by a materiality assessment
      - materiality assessment result is reportable
  incidentClosureComplete:
    conditions:
      - incident status is resolved or monitoring
      - each impacted IT service health state is healthy
      - incident is supported by evidence
      - incident is communicated through communication
      - "if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed"
      - "if incident category is cybersecurity, post-incident review status is scheduled or completed"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions: []
    effect: Alert status becomes acknowledged and acknowledgement time is recorded.
    verification: Read the alert and confirm status is acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions: []
    effect: The incident is assigned to the resolver group.
    verification: Read the incident and confirm the resolver group assignment.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "The incident is declared as a major incident, and major-incident coordination and communication cadence begin."
    verification: "Read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record."
  sendApprovedStakeholderCommunication:
    input: Incident
    preconditions: []
    effect: The communication is sent and timestamped.
    verification: Confirm the final message is archived.
  executeEmergencyChange:
    input: EmergencyChange
    preconditions: []
    effect: The approved emergency change is implemented and its status is updated.
    verification: "Run technical checks, verify service health, and record implementation evidence."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions: []
    effect: Notification status becomes submitted.
    verification: "Confirm accepted submission, or record rejection and remediation if it is not accepted."
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureComplete
    effect: Incident status becomes closed and closure time is recorded.
    verification: "Read the incident and linked services, and confirm closure state and retained evidence."
  containIncident:
    input: Incident
    preconditions: []
    effect: "Approved containment steps are executed, and incident status becomes contained when containment is verified."
    verification: Verify containment indicators and resulting service impact.
  isolateConfigurationItem:
    input: Incident
    preconditions: []
    effect: The configuration item linked to the incident is isolated from the defined networks or dependencies.
    verification: Confirm isolation and check remaining service health.
  failOverService:
    input: Incident
    preconditions: []
    effect: The service workload is moved to the recovery environment.
    verification: Confirm service health and critical business transactions in the recovery environment.
  restoreFromBackup:
    input: BackupSet
    preconditions: []
    effect: Backup data is restored to the target.
    verification: Validate data integrity and application functionality after restore.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "failOverService" has input class Incident, and its effect refers to Environment, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreFromBackup" has input class BackupSet, and its verification refers to Application, which is only reachable against the direction of the relationships between them.

### Turn 70 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: notifiesStakeholder\n    from: Incident\n    to: Stakeholder\n  - name: addressedToStakeholder\n    from: Communication\n    to: Stakeholder\n  - name: governedByServiceLevelObjective\n    from: ITService\n    to: ServiceLevelObjective\n  - name: measuresITService\n    from: Metric\n    to: ITService\n  - name: measuresConfigurationItem\n    from: Metric\n    to: ConfigurationItem"
}
```

### Turn 70 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 70 — assistant

Captured the new relationships.

Recap:
- **Incident → Stakeholder**
- **Communication → Stakeholder**
- **ITService → ServiceLevelObjective**
- **Metric → ITService**
- **Metric → ConfigurationItem**

That closes the relationship pass for the expansion-pass classes.

Before formal validation, I need the minimum language layer for these three new classes.

Please give one-sentence meanings for:
- Stakeholder
- ServiceLevelObjective
- Metric

Short practical definitions are enough.

### Turn 71 — user

- **Stakeholder**: A stakeholder is a person, group, or organization affected by or responsible for an operational outcome.
- **Service level objective**: A service level objective is a measurable target for availability, acknowledgement, or restoration of an IT service.
- **Metric**: A metric is a time-stamped quantitative observation about a service or technical component.

### Turn 71 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 71 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
      closedAt:
        type: date
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
      acknowledgedAt:
        type: date
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties:
      status:
        type: text
        allowed:
          - successful
          - verified
          - failed
          - expired
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
  Stakeholder:
    meaning: null
    aliases: []
    properties: {}
  ServiceLevelObjective:
    meaning: null
    aliases: []
    properties: {}
  Metric:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
  - name: hasPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: The post-incident review that covers the incident.
    aliases: []
  - name: notifiesStakeholder
    from: Incident
    to: Stakeholder
    meaning: null
    aliases: []
  - name: addressedToStakeholder
    from: Communication
    to: Stakeholder
    meaning: null
    aliases: []
  - name: governedByServiceLevelObjective
    from: ITService
    to: ServiceLevelObjective
    meaning: null
    aliases: []
  - name: measuresItservice
    from: Metric
    to: ITService
    meaning: null
    aliases: []
  - name: measuresConfigurationItem
    from: Metric
    to: ConfigurationItem
    meaning: null
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - incident status is not resolved
      - incident status is not closed
      - incident status is not cancelled
      - incident severity is sev1-critical or sev2-high
      - incident impacts at least one IT service
      - incident is coordinated by an incident commander
  regulatoryNotificationRequired:
    conditions:
      - incident is evaluated by a materiality assessment
      - materiality assessment result is reportable
  incidentClosureComplete:
    conditions:
      - incident status is resolved or monitoring
      - each impacted IT service health state is healthy
      - incident is supported by evidence
      - incident is communicated through communication
      - "if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed"
      - "if incident category is cybersecurity, post-incident review status is scheduled or completed"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions: []
    effect: Alert status becomes acknowledged and acknowledgement time is recorded.
    verification: Read the alert and confirm status is acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions: []
    effect: The incident is assigned to the resolver group.
    verification: Read the incident and confirm the resolver group assignment.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "The incident is declared as a major incident, and major-incident coordination and communication cadence begin."
    verification: "Read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record."
  sendApprovedStakeholderCommunication:
    input: Incident
    preconditions: []
    effect: The communication is sent and timestamped.
    verification: Confirm the final message is archived.
  executeEmergencyChange:
    input: EmergencyChange
    preconditions: []
    effect: The approved emergency change is implemented and its status is updated.
    verification: "Run technical checks, verify service health, and record implementation evidence."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions: []
    effect: Notification status becomes submitted.
    verification: "Confirm accepted submission, or record rejection and remediation if it is not accepted."
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureComplete
    effect: Incident status becomes closed and closure time is recorded.
    verification: "Read the incident and linked services, and confirm closure state and retained evidence."
  containIncident:
    input: Incident
    preconditions: []
    effect: "Approved containment steps are executed, and incident status becomes contained when containment is verified."
    verification: Verify containment indicators and resulting service impact.
  isolateConfigurationItem:
    input: Incident
    preconditions: []
    effect: The configuration item linked to the incident is isolated from the defined networks or dependencies.
    verification: Confirm isolation and check remaining service health.
  failOverService:
    input: Incident
    preconditions: []
    effect: The service workload is moved to the recovery environment.
    verification: Confirm service health and critical business transactions in the recovery environment.
  restoreFromBackup:
    input: BackupSet
    preconditions: []
    effect: Backup data is restored to the target.
    verification: Validate data integrity and application functionality after restore.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "failOverService" has input class Incident, and its effect refers to Environment, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreFromBackup" has input class BackupSet, and its verification refers to Application, which is only reachable against the direction of the relationships between them.

### Turn 71 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Stakeholder:\n    meaning: A stakeholder is a person, group, or organization affected by or responsible for an operational outcome.\n  ServiceLevelObjective:\n    meaning: A service level objective is a measurable target for availability, acknowledgement, or restoration of an IT service.\n  Metric:\n    meaning: A metric is a time-stamped quantitative observation about a service or technical component."
}
```

### Turn 71 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 71 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 71 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
      closedAt:
        type: date
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
      acknowledgedAt:
        type: date
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties:
      status:
        type: text
        allowed:
          - successful
          - verified
          - failed
          - expired
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
  Stakeholder:
    meaning: "A stakeholder is a person, group, or organization affected by or responsible for an operational outcome."
    aliases: []
    properties: {}
  ServiceLevelObjective:
    meaning: "A service level objective is a measurable target for availability, acknowledgement, or restoration of an IT service."
    aliases: []
    properties: {}
  Metric:
    meaning: A metric is a time-stamped quantitative observation about a service or technical component.
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
  - name: hasPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: The post-incident review that covers the incident.
    aliases: []
  - name: notifiesStakeholder
    from: Incident
    to: Stakeholder
    meaning: null
    aliases: []
  - name: addressedToStakeholder
    from: Communication
    to: Stakeholder
    meaning: null
    aliases: []
  - name: governedByServiceLevelObjective
    from: ITService
    to: ServiceLevelObjective
    meaning: null
    aliases: []
  - name: measuresItservice
    from: Metric
    to: ITService
    meaning: null
    aliases: []
  - name: measuresConfigurationItem
    from: Metric
    to: ConfigurationItem
    meaning: null
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - incident status is not resolved
      - incident status is not closed
      - incident status is not cancelled
      - incident severity is sev1-critical or sev2-high
      - incident impacts at least one IT service
      - incident is coordinated by an incident commander
  regulatoryNotificationRequired:
    conditions:
      - incident is evaluated by a materiality assessment
      - materiality assessment result is reportable
  incidentClosureComplete:
    conditions:
      - incident status is resolved or monitoring
      - each impacted IT service health state is healthy
      - incident is supported by evidence
      - incident is communicated through communication
      - "if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed"
      - "if incident category is cybersecurity, post-incident review status is scheduled or completed"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions: []
    effect: Alert status becomes acknowledged and acknowledgement time is recorded.
    verification: Read the alert and confirm status is acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions: []
    effect: The incident is assigned to the resolver group.
    verification: Read the incident and confirm the resolver group assignment.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "The incident is declared as a major incident, and major-incident coordination and communication cadence begin."
    verification: "Read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record."
  sendApprovedStakeholderCommunication:
    input: Incident
    preconditions: []
    effect: The communication is sent and timestamped.
    verification: Confirm the final message is archived.
  executeEmergencyChange:
    input: EmergencyChange
    preconditions: []
    effect: The approved emergency change is implemented and its status is updated.
    verification: "Run technical checks, verify service health, and record implementation evidence."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions: []
    effect: Notification status becomes submitted.
    verification: "Confirm accepted submission, or record rejection and remediation if it is not accepted."
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureComplete
    effect: Incident status becomes closed and closure time is recorded.
    verification: "Read the incident and linked services, and confirm closure state and retained evidence."
  containIncident:
    input: Incident
    preconditions: []
    effect: "Approved containment steps are executed, and incident status becomes contained when containment is verified."
    verification: Verify containment indicators and resulting service impact.
  isolateConfigurationItem:
    input: Incident
    preconditions: []
    effect: The configuration item linked to the incident is isolated from the defined networks or dependencies.
    verification: Confirm isolation and check remaining service health.
  failOverService:
    input: Incident
    preconditions: []
    effect: The service workload is moved to the recovery environment.
    verification: Confirm service health and critical business transactions in the recovery environment.
  restoreFromBackup:
    input: BackupSet
    preconditions: []
    effect: Backup data is restored to the target.
    verification: Validate data integrity and application functionality after restore.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "failOverService" has input class Incident, and its effect refers to Environment, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreFromBackup" has input class BackupSet, and its verification refers to Application, which is only reachable against the direction of the relationships between them.

# SECOND-OPINION MODEL CHECK — 8 observation(s) from a separate automated review (report these to the expert, marked as model-derived, the same as the deterministic findings above; not authoritative on their own, but not to be dismissed without checking):
#   [model-review] The verification requires a communication record, but the effect only says communication cadence begins and does not state that any Communication record is created or linked to the incident.
#   [model-review] The effect says the communication is sent and timestamped, but the input is Incident and the model provides no stated effect that identifies or updates any Communication record for the verification to archive.
#   [model-review] The effect says the emergency change is implemented and status updated, but the verification requires implementation evidence and service-health verification that are not entailed by that effect.
#   [model-review] The effect only sets notification status to submitted, but the verification requires either accepted submission or recorded rejection and remediation, which cannot follow from submission alone.
#   [model-review] The effect only makes incident status contained when containment is verified, but the verification also requires resulting service impact, which the effect does not establish or update.
#   [model-review] The effect isolates a configuration item linked to the incident, but the verification also requires remaining service health even though no service-health state is changed or identified by the effect.
#   [model-review] The effect moves workload to the recovery environment, but the verification requires confirmed service health and critical business transactions in that environment, which are not guaranteed by the effect.
#   [model-review] The effect only says backup data is restored to the target, but the verification requires validated data integrity and application functionality, which do not follow from restore alone.

### Turn 71 — assistant

Here is the plain validation result.

## What is covered well
The model now gives good structural coverage for your accepted questions:
- impact across **Incident / ITService / BusinessService / CustomerChannel**
- dependency path across **Application / ConfigurationItem / ThirdPartyService / Vendor**
- routing and coordination across **ResolverGroup / OnCallEngineer / IncidentCommander / ServiceOwner**
- recovery resources across **Runbook / Workaround / BackupSet / RecoveryPlan**
- reporting and evidence across **MaterialityAssessment / RegulatoryNotification / Evidence / Communication / Regulator**
- review and follow-up across **Problem / PostIncidentReview / CorrectiveAction**
- added expansion-pass concepts **Stakeholder / ServiceLevelObjective / Metric**

It also now has:
- meanings for all current classes and relationships
- aliases for the main real synonyms you confirmed
- fixed value sets for the key decision-bearing properties
- initial rules and actions persisted

## Competency check summary
Against the persisted competency questions:

Covered or substantially covered:
- impacted business services
- affected customer channels
- affected IT services
- dependency path to third-party service and vendor
- affected configuration items
- correlated alerts and events
- service ownership
- resolver-group routing path
- on-call engineer routing/engagement path
- major-incident declaration conditions
- available runbook / workaround / backup set / recovery plan
- likely recent change / deployment context
- materiality assessment completion / notification required / due
- evidence and communications support
- post-incident review corrective actions

Partly covered rather than fully operationalized:
- some “complete” questions still rely on linked-record existence and operational interpretation rather than fully explicit completeness logic
- some actions have broad operational verification text that goes beyond what the graph itself can strictly entail

## Deterministic validation findings still open
Two warnings remain in the model:

1. **failOverService**
   - Input is `Incident`
   - Action text refers to the recovery environment
   - The current graph does not provide a forward navigable path from `Incident` to `Environment`

2. **restoreFromBackup**
   - Input is `BackupSet`
   - Verification mentions application functionality
   - The current graph does not provide a forward navigable path from `BackupSet` to `Application`

You explicitly chose not to add structure to close those paths, so I am leaving them as intentional open limits rather than inventing facts.

## Automated second-opinion review
The tool also produced a separate automated review. I’m reporting it as model-derived, not as authoritative fact. Its observations were:

- **declareMajorIncident** verification mentions a communication record, but the effect only says communication cadence begins
- **sendApprovedStakeholderCommunication** effect says communication is sent/timestamped, but with input `Incident` the effect does not identify which `Communication` record is updated
- **executeEmergencyChange** verification mentions implementation evidence and service-health verification beyond what the effect itself states
- **submitRegulatoryNotification** effect sets status to submitted, but verification mentions accepted/rejected outcomes beyond that effect
- **containIncident** verification mentions resulting service impact beyond the effect text
- **isolateConfigurationItem** verification mentions remaining service health beyond the effect text
- **failOverService** verification mentions confirmed health and business transactions beyond the effect text
- **restoreFromBackup** verification mentions data-integrity and application-function validation beyond the effect text

These are reasonable warnings: they do not necessarily mean the ontology is wrong, but they do show that several action verification steps are more operational than strictly model-entailing.

## Clear open items
So the session is not fully closed yet. The remaining named open items are:

1. **Action-path limit kept by choice**
   - `failOverService` still has no modeled forward path from `Incident` to `Environment`

2. **Action-path limit kept by choice**
   - `restoreFromBackup` still has no modeled forward path from `BackupSet` to `Application`

3. **Action effect/verification precision**
   - Several actions use broader operational verification wording than the model can strictly prove from their recorded effects

4. **New expansion-pass classes still need relationship meanings**
   - `notifiesStakeholder`
   - `addressedToStakeholder`
   - `governedByServiceLevelObjective`
   - `measuresITService`
   - `measuresConfigurationItem`

One focused next step to keep moving:
please give one-sentence meanings for those five relationships.

### Turn 72 — user

- **notifies stakeholder**: The stakeholder the incident informs about its impact, status, or required response.
- **addressed to stakeholder**: The stakeholder who is the intended recipient of the communication.
- **governed by service level objective**: The service level objective that defines the target service performance or restoration expectations for the IT service.
- **measures IT service**: The IT service whose condition or performance is measured by the metric.
- **measures configuration item**: The configuration item whose condition or performance is measured by the metric.

### Turn 72 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 72 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which customer channels are affected by an incident right now?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: What do the affected IT services depend on?
  - id: cq5
    text: Which configuration items are affected by an incident?
  - id: cq6
    text: Which third-party service is on the dependency path of an affected IT service?
  - id: cq7
    text: Which vendor is responsible for the third-party service on that dependency path?
  - id: cq8
    text: Which alerts are correlated with an incident?
  - id: cq9
    text: Which events are correlated with an incident?
  - id: cq10
    text: Who owns the affected IT service?
  - id: cq11
    text: Which resolver group should handle an incident?
  - id: cq12
    text: Which on-call engineer should handle an incident?
  - id: cq13
    text: Does an incident meet the conditions for major-incident declaration?
  - id: cq14
    text: Which runbook is available for safe use in this situation?
  - id: cq15
    text: Which workaround is available for safe use in this situation?
  - id: cq16
    text: Which backup set is available for safe use in this situation?
  - id: cq17
    text: Which recovery plan is available for safe use in this situation?
  - id: cq18
    text: Was the incident likely caused by a recent change?
  - id: cq19
    text: Was the incident likely caused by a recent deployment?
  - id: cq20
    text: Is a materiality assessment complete for the incident?
  - id: cq21
    text: Is regulatory notification required for the incident?
  - id: cq22
    text: Is regulatory notification due for the incident?
  - id: cq23
    text: Are evidence integrity and supporting evidence complete for the incident?
  - id: cq24
    text: Are required stakeholder communications complete for the incident?
  - id: cq25
    text: Are incident closure conditions complete?
  - id: cq26
    text: Which corrective actions from prior post-incident reviews remain open for the affected service?
  - id: cq27
    text: Which business services and customer channels are impacted by this incident?
  - id: cq28
    text: Which configuration items and third-party services are on the dependency path of the affected IT service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security-related condition that requires managed response."
    aliases: []
    properties:
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      majorIncidentDeclared:
        type: boolean
      majorIncidentDeclaredAt:
        type: date
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
          - resolved
          - closed
          - cancelled
      closedAt:
        type: date
  ITService:
    meaning: An IT service is a managed technology capability that supports one or more business services.
    aliases:
      - Technology Service
      - Informatics Service
    properties:
      name:
        type: text
      description:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      availabilityTarget:
        type: text
  BusinessService:
    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer channel is a route through which customers access the bank’s services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within configuration-management scope.
    aliases:
      - CI
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - Outsourced Service
    properties: {}
  Vendor:
    meaning: A vendor is an external organization that provides or supports technology or services.
    aliases:
      - Supplier
    properties: {}
  Alert:
    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.
    aliases:
      - Alarm
      - Monitoring Alert
    properties:
      raisedAt:
        type: date
      summary:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
      occurrenceCount:
        type: number
      acknowledgedAt:
        type: date
  Event:
    meaning: An event is a time-stamped observation of a state change or other notable occurrence.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - Support Group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for urgent operational response.
    aliases:
      - On-Call
      - Duty Engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - Incident Manager
      - Major-Incident Lead
    properties: {}
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases:
      - Playbook
      - Operational Procedure
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - Backup
    properties:
      status:
        type: text
        allowed:
          - successful
          - verified
          - failed
          - expired
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - Disaster Recovery Plan
      - DR Plan
    properties: {}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - Remediation Action
    properties:
      actionDescription:
        type: text
      status:
        type: text
        allowed:
          - open
          - in-progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: A deployment is the technical execution that installs or activates an application change or release in an environment.
    aliases:
      - Release Deployment
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startedAt:
        type: date
      completedAt:
        type: date
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of an incident’s significance and possible reporting implications.
    aliases:
      - Reportability Assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - Supervisory Notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Communication:
    meaning: "A communication is a controlled message sent to an operational, business, customer, vendor, or regulatory audience."
    aliases:
      - Stakeholder Communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      messageSummary:
        type: text
  Evidence:
    meaning: "Evidence is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - Evidence Item
      - Artifact
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  Regulator:
    meaning: A regulator is the supervisory authority that oversees the bank or receives required notifications.
    aliases:
      - Supervisory Authority
    properties: {}
  Application:
    meaning: An application is a software system that provides business or operational functionality.
    aliases:
      - App
    properties:
      externallyAccessible:
        type: boolean
      releaseVersion:
        type: text
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Problem:
    meaning: "A problem is the underlying cause, or potential underlying cause, of one or more incidents."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA Review
    properties:
      heldOn:
        type: date
      findings:
        type: text
      status:
        type: text
        allowed:
          - scheduled
          - completed
  EmergencyChange:
    meaning: An emergency change is a change handled through an accelerated path to address an urgent operational need.
    aliases:
      - Emergency Fix
    properties:
      summary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAcceptanceRecorded:
        type: boolean
  Stakeholder:
    meaning: "A stakeholder is a person, group, or organization affected by or responsible for an operational outcome."
    aliases: []
    properties: {}
  ServiceLevelObjective:
    meaning: "A service level objective is a measurable target for availability, acknowledgement, or restoration of an IT service."
    aliases: []
    properties: {}
  Metric:
    meaning: A metric is a time-stamped quantitative observation about a service or technical component.
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: The IT service that is affected by the incident.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: The business service that is affected by the incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: The IT service that a business service relies on to operate.
    aliases: []
  - name: deliveredThroughChannel
    from: BusinessService
    to: CustomerChannel
    meaning: The customer channel through which a business service is provided.
    aliases: []
  - name: implementedByApplication
    from: ITService
    to: Application
    meaning: The application that delivers or implements the IT service.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: The managed technical component that the application runs on.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: The configuration item involved in or affected by the incident.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: The external service that the IT service relies on.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor that provides the third-party service.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: The alert that opened or triggered the incident.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: The event data that has been correlated into the incident.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: The change used to resolve the incident.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: The IT service affected by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: The configuration item modified by the change.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: The application installed or activated by the deployment.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment where the deployment is executed.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service the service owner is accountable for.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to handle the incident.
    aliases: []
  - name: supportsItservice
    from: ResolverGroup
    to: ITService
    meaning: The IT service that the resolver group supports.
    aliases: []
  - name: supportsConfigurationItem
    from: ResolverGroup
    to: ConfigurationItem
    meaning: The configuration item or technical area that the resolver group supports.
    aliases: []
  - name: hasMemberOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: The on-call engineer who belongs to the resolver group.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: The on-call engineer actively handling the incident.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: The incident commander directing coordination of the incident.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "The runbook used to diagnose, respond to, or recover the incident."
    aliases: []
  - name: hasWorkaround
    from: Problem
    to: Workaround
    meaning: The workaround available for the diagnosed problem.
    aliases: []
  - name: documentsWorkaround
    from: Runbook
    to: Workaround
    meaning: The workaround that is documented in the runbook.
    aliases: []
  - name: appliesToItservice
    from: RecoveryPlan
    to: ITService
    meaning: The IT service covered by the recovery plan.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: The configuration item whose recoverable data is protected by the backup set.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set used by the recovery plan for restoration.
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment used to determine the incident’s significance and reporting implications.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: Evidence
    meaning: "The evidence retained to support analysis, accountability, or verification for the incident."
    aliases: []
  - name: communicatedThroughCommunication
    from: Incident
    to: Communication
    meaning: The communication records used to inform stakeholders about the incident.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The regulatory notification initiated by the materiality assessment result.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that the regulatory notification formally reports.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator that receives the regulatory notification.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: Evidence
    meaning: The supporting evidence included with the regulatory notification.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: The corrective action created as an outcome of the post-incident review.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: The problem identified during the post-incident review.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: The underlying or recurring problem associated with the incident.
    aliases: []
  - name: justifiedByIncident
    from: EmergencyChange
    to: Incident
    meaning: The incident that justifies the emergency change.
    aliases: []
  - name: hasPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: The post-incident review that covers the incident.
    aliases: []
  - name: notifiesStakeholder
    from: Incident
    to: Stakeholder
    meaning: null
    aliases: []
  - name: addressedToStakeholder
    from: Communication
    to: Stakeholder
    meaning: null
    aliases: []
  - name: governedByServiceLevelObjective
    from: ITService
    to: ServiceLevelObjective
    meaning: null
    aliases: []
  - name: measuresItservice
    from: Metric
    to: ITService
    meaning: null
    aliases: []
  - name: measuresConfigurationItem
    from: Metric
    to: ConfigurationItem
    meaning: null
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - incident status is not resolved
      - incident status is not closed
      - incident status is not cancelled
      - incident severity is sev1-critical or sev2-high
      - incident impacts at least one IT service
      - incident is coordinated by an incident commander
  regulatoryNotificationRequired:
    conditions:
      - incident is evaluated by a materiality assessment
      - materiality assessment result is reportable
  incidentClosureComplete:
    conditions:
      - incident status is resolved or monitoring
      - each impacted IT service health state is healthy
      - incident is supported by evidence
      - incident is communicated through communication
      - "if incident majorIncidentDeclared is true, post-incident review status is scheduled or completed"
      - "if incident category is cybersecurity, post-incident review status is scheduled or completed"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions: []
    effect: Alert status becomes acknowledged and acknowledgement time is recorded.
    verification: Read the alert and confirm status is acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions: []
    effect: The incident is assigned to the resolver group.
    verification: Read the incident and confirm the resolver group assignment.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "The incident is declared as a major incident, and major-incident coordination and communication cadence begin."
    verification: "Read the incident and confirm the major-incident indicator, declaration time, incident commander, and communication record."
  sendApprovedStakeholderCommunication:
    input: Incident
    preconditions: []
    effect: The communication is sent and timestamped.
    verification: Confirm the final message is archived.
  executeEmergencyChange:
    input: EmergencyChange
    preconditions: []
    effect: The approved emergency change is implemented and its status is updated.
    verification: "Run technical checks, verify service health, and record implementation evidence."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions: []
    effect: Notification status becomes submitted.
    verification: "Confirm accepted submission, or record rejection and remediation if it is not accepted."
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureComplete
    effect: Incident status becomes closed and closure time is recorded.
    verification: "Read the incident and linked services, and confirm closure state and retained evidence."
  containIncident:
    input: Incident
    preconditions: []
    effect: "Approved containment steps are executed, and incident status becomes contained when containment is verified."
    verification: Verify containment indicators and resulting service impact.
  isolateConfigurationItem:
    input: Incident
    preconditions: []
    effect: The configuration item linked to the incident is isolated from the defined networks or dependencies.
    verification: Confirm isolation and check remaining service health.
  failOverService:
    input: Incident
    preconditions: []
    effect: The service workload is moved to the recovery environment.
    verification: Confirm service health and critical business transactions in the recovery environment.
  restoreFromBackup:
    input: BackupSet
    preconditions: []
    effect: Backup data is restored to the target.
    verification: Validate data integrity and application functionality after restore.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "failOverService" has input class Incident, and its effect refers to Environment, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreFromBackup" has input class BackupSet, and its verification refers to Application, which is only reachable against the direction of the relationships between them.

### Turn 72 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: notifiesStakeholder\n    from: Incident\n    to: Stakeholder\n    meaning: The stakeholder the incident informs about its impact, status, or required response.\n  - name: addressedToStakeholder\n    from: Communication\n    to: Stakeholder\n    meaning: The stakeholder who is the intended recipient of the communication.\n  - name: governedByServiceLevelObjective\n    from: ITService\n    to: ServiceLevelObjective\n    meaning: The service level objective that defines the target service performance or restoration expectations for the IT service.\n  - name: measuresItservice\n    from: Metric\n    to: ITService\n    meaning: The IT service whose condition or performance is measured by the metric.\n  - name: measuresConfigurationItem\n    from: Metric\n    to: ConfigurationItem\n    meaning: The configuration item whose condition or performance is measured by the metric."
}
```

### Turn 72 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 72 — assistant

Great — those last missing meanings are now captured.

## Final recap
What is now in the ontology:
- confirmed competency questions and actions
- classes, relationships, properties, allowed values, meanings, aliases, rules
- action inputs are set
- expansion-pass additions are included: **Stakeholder**, **ServiceLevelObjective**, **Metric**

## What remains open
There are **2 explicit unresolved warnings** left, both ones you consciously chose not to solve by adding more structure:

1. **failOverService path warning**
   - Input: `Incident`
   - Action text refers to `Environment`
   - No forward modeled path from `Incident` to `Environment`

2. **restoreFromBackup path warning**
   - Input: `BackupSet`
   - Verification mentions `Application`
   - No forward modeled path from `BackupSet` to `Application`

## Plain conclusion
The ontology is in strong shape and is usable, but it is **not fully clean under the tool’s strict final checklist** because of those two remaining action-path warnings.

## Itemized open items
If you want to stop here, the session can end with these recorded open items:

1. Decide whether to add a modeled path for **Incident → … → Environment** to support `failOverService`, or accept that action as partly operational beyond the graph.
2. Decide whether to add a modeled path for **BackupSet → … → Application** to support `restoreFromBackup`, or accept that verification as partly operational beyond the graph.

If you want, next I can help you close those two remaining items with the smallest possible modeling change.
