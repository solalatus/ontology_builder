# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-09-03T08:16:08.995Z

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

Great — we’ll start with the acceptance test for the ontology: the real questions the future agent must answer, and the actions it must perform.

Right now the model is empty.

First focused question:
Please list 8–12 real questions this agent must be able to answer in your domain, in plain business language.  
Examples of the shape I want: “Which X is responsible for Y?”, “Has Z been approved?”, “What evidence is required before A can happen?”

Please give only the questions for now, not classes, fields, or rules yet.

### Turn 2 — user

Here are the core questions I’d expect the agent to answer:

1. Which business services and customer channels are impacted by this incident?
2. Which configuration items and external dependencies sit on the dependency path of the affected IT service?
3. Which current alerts and events are correlated with this incident?
4. Who owns the affected service, and which resolver group and on-call engineer should handle it?
5. Does this incident meet the criteria to be treated as a major incident?
6. Which runbook, workaround, backup set, and recovery plan are available and safe to use for this case?
7. Was this incident caused by a recent change, release, or deployment?
8. Has a materiality assessment been completed, and does this case require regulatory notification?
9. What evidence, communications, and restoration proof are still missing before the incident can be closed?
10. Which stakeholders have been notified already, and who still needs an update?
11. Which vendor or third-party service needs to be engaged for this incident?
12. Which corrective actions from earlier post-incident reviews are still open for the affected service?

### Turn 2 — assistant

Good set — these are exactly the kind of competency questions we need.

Before I record them, I want to make them slightly more atomic where needed so the ontology can be tested cleanly. Please confirm this refined list as the accepted question set, or correct any wording that changes your meaning:

1. Which business services are impacted by this incident?
2. Which customer channels are impacted by this incident?
3. Which configuration items sit on the dependency path of the affected IT service?
4. Which external dependencies sit on the dependency path of the affected IT service?
5. Which current alerts are correlated with this incident?
6. Which current events are correlated with this incident?
7. Who owns the affected service?
8. Which resolver group should handle this incident?
9. Which on-call engineer should handle this incident?
10. Does this incident meet the criteria to be treated as a major incident?
11. Which runbook is available and safe to use for this case?
12. Which workaround is available and safe to use for this case?
13. Which backup set is available and safe to use for this case?
14. Which recovery plan is available and safe to use for this case?
15. Was this incident caused by a recent change?
16. Was this incident caused by a recent release?
17. Was this incident caused by a recent deployment?
18. Has a materiality assessment been completed?
19. Does this case require regulatory notification?
20. What evidence is still missing before the incident can be closed?
21. What communications are still missing before the incident can be closed?
22. What restoration proof is still missing before the incident can be closed?
23. Which stakeholders have already been notified?
24. Which stakeholders still need an update?
25. Which vendor needs to be engaged for this incident?
26. Which third-party service needs to be engaged for this incident?
27. Which corrective actions from earlier post-incident reviews are still open for the affected service?

Short recap: I captured your questions around impact, dependency path, correlation, ownership/routing, major-incident qualification, safe recovery options, change causation, materiality/regulatory handling, closure readiness, stakeholder communication, third-party engagement, and open follow-up actions.

Please confirm this batch, or tell me what to merge, split differently, or reword.

### Turn 3 — user

That’s very close, but I’d tighten a few of them so they stay faithful to how we actually work.

I’d accept the set with these adjustments in wording:

1. Which business services are impacted by this incident?
2. Which customer channels are impacted by this incident?
3. Which configuration items sit on the dependency path of the affected IT service?
4. Which third-party services sit on the dependency path of the affected IT service?
5. Which active alerts are correlated with this incident?
6. Which events are correlated with this incident?
7. Who owns the affected service?
8. Which resolver group should be assigned to this incident?
9. Which on-call engineer should handle this incident?
10. Does this incident meet the criteria to be treated as a major incident?
11. Which runbook can be used safely for this case?
12. Which workaround can be used safely for this case?
13. Which backup set can be used safely for this case?
14. Which recovery plan can be used safely for this case?
15. Was this incident caused by a recent change?
16. Is a materiality assessment complete?
17. Is a regulatory notification required, and when is it due?
18. Are evidence integrity, stakeholder communications, and closure conditions complete?
19. Which stakeholders have already been notified about this incident?
20. Which vendor should this incident be escalated to?
21. Which corrective actions from earlier post-incident reviews remain open for the affected service?

Why I’d change yours that way:

- I’d say “third-party services” rather than “external dependencies” because that’s more precise operationally.
- “Active alerts” matters; old closed alerts shouldn’t clutter the answer.
- For the resolver side, assignment and handling are not quite the same thing, so “should be assigned” is the cleaner phrasing for the group.
- I would not split change, release, and deployment into three separate acceptance questions unless you specifically want broader implementation coverage. In our operational model, the key question is whether a recent change or deployment is involved. Release is real, but it sits in that chain rather than standing as the main causation question on its own.
- On regulatory handling, the practical question is not only whether notification is required, but also whether it is due.
- For closure readiness, I would usually keep evidence, communications, and closure conditions together as one operational readiness question rather than splitting them into three separate ones.
- For third parties, I’d keep vendor escalation as the question. Asking which third-party service “needs to be engaged” is a bit off in wording; we typically engage or escalate to the vendor, while the affected service is something we identify as a dependency.

So yes, the recap themes are right, but I’d record the accepted set in the revised form above.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Which business services are impacted by this incident?\n  - text: Which customer channels are impacted by this incident?\n  - text: Which configuration items sit on the dependency path of the affected IT service?\n  - text: Which third-party services sit on the dependency path of the affected IT service?\n  - text: Which active alerts are correlated with this incident?\n  - text: Which events are correlated with this incident?\n  - text: Who owns the affected service?\n  - text: Which resolver group should be assigned to this incident?\n  - text: Which on-call engineer should handle this incident?\n  - text: Does this incident meet the criteria to be treated as a major incident?\n  - text: Which runbook can be used safely for this case?\n  - text: Which workaround can be used safely for this case?\n  - text: Which backup set can be used safely for this case?\n  - text: Which recovery plan can be used safely for this case?\n  - text: Was this incident caused by a recent change?\n  - text: Is a materiality assessment complete?\n  - text: Is a regulatory notification required, and when is it due?\n  - text: Are evidence integrity, stakeholder communications, and closure conditions complete?\n  - text: Which stakeholders have already been notified about this incident?\n  - text: Which vendor should this incident be escalated to?\n  - text: Which corrective actions from earlier post-incident reviews remain open for the affected service?"
}
```

### Turn 3 — tool

Applied. Added 21, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

Recorded — we now have 21 accepted competency questions in the live ontology.

Short recap: your accepted question set centers on incident impact, dependency path, correlation, service ownership and routing, major-incident qualification, safe recovery options, recent change involvement, materiality and regulatory timing, closure readiness, stakeholder notification, vendor escalation, and open corrective actions.

Next required step in this phase: actions.

Please list 5–10 real actions the agent must perform in this domain, in plain business language.  
For now, just the action names or short descriptions — not inputs, rules, or detailed workflow yet.

### Turn 4 — user

These are the operational actions I’d expect the agent to support:

1. Acknowledge an alert.
2. Assign an incident to a resolver group.
3. Declare a major incident.
4. Contain an incident.
5. Isolate an affected configuration item.
6. Fail over an affected service to its recovery environment.
7. Restore data from backup.
8. Execute an emergency change.
9. Send a stakeholder communication.
10. Submit a regulatory notification.
11. Close an incident.

### Turn 4 — assistant

Good — that gives us the action side of the acceptance test.

Before I record them, one focused check: should “contain an incident” and “isolate an affected configuration item” stay as two separate actions in your operating model, or is isolation just one containment method rather than its own action?

### Turn 5 — user

They should stay separate.

Containment is the broader response step: reduce spread, reduce impact, or stabilize the situation. Isolation is one specific technical action you might use as part of that, especially for a compromised or unstable component.

So in practice:

- containment answers, “Have we put the incident under control?”
- isolation answers, “Have we deliberately cut this specific component off from networks or dependencies?”

You can contain an incident without isolating anything, and you can isolate a configuration item as one concrete step within a wider containment strategy. Keeping them separate gives you cleaner operational tracking and cleaner precondition checks.

### Turn 5 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 5 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by this incident?
  - id: cq2
    text: Which customer channels are impacted by this incident?
  - id: cq3
    text: Which configuration items sit on the dependency path of the affected IT service?
  - id: cq4
    text: Which third-party services sit on the dependency path of the affected IT service?
  - id: cq5
    text: Which active alerts are correlated with this incident?
  - id: cq6
    text: Which events are correlated with this incident?
  - id: cq7
    text: Who owns the affected service?
  - id: cq8
    text: Which resolver group should be assigned to this incident?
  - id: cq9
    text: Which on-call engineer should handle this incident?
  - id: cq10
    text: Does this incident meet the criteria to be treated as a major incident?
  - id: cq11
    text: Which runbook can be used safely for this case?
  - id: cq12
    text: Which workaround can be used safely for this case?
  - id: cq13
    text: Which backup set can be used safely for this case?
  - id: cq14
    text: Which recovery plan can be used safely for this case?
  - id: cq15
    text: Was this incident caused by a recent change?
  - id: cq16
    text: Is a materiality assessment complete?
  - id: cq17
    text: "Is a regulatory notification required, and when is it due?"
  - id: cq18
    text: "Are evidence integrity, stakeholder communications, and closure conditions complete?"
  - id: cq19
    text: Which stakeholders have already been notified about this incident?
  - id: cq20
    text: Which vendor should this incident be escalated to?
  - id: cq21
    text: Which corrective actions from earlier post-incident reviews remain open for the affected service?
classes: {}
relationships: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  acknowledgeAlert:\n    input: Alert\n    effect: An alert is acknowledged so responders can see it has been taken up.\n    verification: Confirm the alert shows as acknowledged.\n  assignIncidentToResolverGroup:\n    input: Incident\n    effect: The incident is assigned to a resolver group.\n    verification: Confirm the incident shows the assigned resolver group.\n  declareMajorIncident:\n    input: Incident\n    effect: The incident is marked and handled as a major incident.\n    verification: Confirm the incident shows major-incident handling has been initiated.\n  containIncident:\n    input: Incident\n    effect: Containment actions are recorded and the incident is put under control.\n    verification: Confirm the incident record shows containment has been performed.\n  isolateAffectedConfigurationItem:\n    input: ConfigurationItem\n    effect: The affected configuration item is deliberately isolated from relevant networks or dependencies.\n    verification: Confirm the configuration item shows as isolated or disconnected as intended.\n  failOverAffectedServiceToRecoveryEnvironment:\n    input: ITService\n    effect: The affected service is failed over to its recovery environment.\n    verification: Confirm the service is operating from the recovery environment.\n  restoreDataFromBackup:\n    input: BackupSet\n    effect: Data is restored from the selected backup set.\n    verification: Confirm the restored data is available and matches the intended restore point.\n  executeEmergencyChange:\n    input: Change\n    effect: The emergency change is executed.\n    verification: Confirm the change record and affected target reflect the executed change.\n  sendStakeholderCommunication:\n    input: Incident\n    effect: A stakeholder communication is issued for the incident.\n    verification: Confirm the communication was sent and recorded against the incident.\n  submitRegulatoryNotification:\n    input: RegulatoryNotification\n    effect: A regulatory notification is submitted.\n    verification: Confirm the notification submission is recorded.\n  closeIncident:\n    input: Incident\n    effect: The incident is closed.\n    verification: Confirm the incident status shows closed."
}
```

### Turn 5 — tool

Applied. Added 11, updated 0 existing item(s).

CONSISTENCY CHECK — 11 new problem(s) from this edit:
  [error] action-input-missing — Action "acknowledgeAlert" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "closeIncident" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "containIncident" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "declareMajorIncident" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "executeEmergencyChange" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "failOverAffectedServiceToRecoveryEnvironment" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "isolateAffectedConfigurationItem" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "restoreDataFromBackup" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "sendStakeholderCommunication" has no input class. Give it the one class the action is fundamentally about.
  …and 1 more.

### Turn 5 — assistant

Captured your intent, and your separation between containment and isolation is clear.

Short recap: we now have an accepted action list including alert acknowledgment, assignment, major-incident declaration, containment, isolation, failover, restore, emergency change, communication, regulatory notification, and closure. I attempted to persist them, but the tool rejected them because their input classes do not exist yet in the ontology. So the action phase is not finished; the accepted action list is known, but structurally incomplete until we add the needed classes.

One required Phase 1 follow-up before moving to classes:
For each role you already named — service owner, resolver group, on-call engineer, stakeholder, and vendor — is there a closely related day-to-day role under it that the agent must distinguish separately, and does any of this depend on a specific operating context that changes how it is handled?  
Please answer just those two points: additional day-to-day roles, and operating context.

### Turn 6 — user

Yes, there are a few that matter operationally and should stay distinct.

Additional day-to-day roles to distinguish separately:
- Incident commander — separate from the resolver side; this is the coordination lead for a major incident.
- Incident response team — separate from a single resolver group; it is the cross-functional team coordinating a major incident.
- Service desk — separate from resolver groups; it records, triages, and routes user-reported issues.
- IT operations team — separate from ownership roles; it runs day-to-day service operations.
- Network operations centre — separate because it operates monitoring and infrastructure-facing operations.
- Security operations centre — separate because it monitors and investigates security-relevant activity.
- Application owner — separate from service owner; accountable for the application itself.
- Technical owner — separate from service owner; accountable for a specific configuration item.
- Business owner — separate from service owner; accountable on the business side for a business service.
- Regulator — not just another stakeholder; it has its own reporting and notification significance.

Operating context that changes handling:
- Yes. The biggest context shifts are whether the case is a major incident, a cybersecurity incident, or a standard incident.
- Environment also matters operationally — production, disaster recovery, test, development, and similar contexts change what response options are appropriate.
- Audience context matters for communications — technical, management, business, customer, vendor, regulator, or all staff.
- Detection source also changes handling in practice, because a case may come from monitoring, security tooling, service desk, user report, vendor report, automated control, regulator, or another source.
- Recovery context matters too: if you are restoring or failing over, the target recovery environment and backup state affect what can be done safely.

### Turn 6 — assistant

Helpful — that closes the Phase 1 follow-up.

Short recap: you confirmed additional distinct roles the agent may need to tell apart: incident commander, incident response team, service desk, IT operations team, network operations centre, security operations centre, application owner, technical owner, business owner, and regulator. You also confirmed important operating contexts: incident type/context, environment, communication audience, detection source, and recovery context.

Now we move to classes, but only those justified by your accepted questions and actions.

First class batch, directly tied to many of your questions/actions:
- Incident — needed for nearly all questions and most actions.
- ITService — needed for affected service, dependency path, ownership, and recovery questions.
- BusinessService — needed for “which business services are impacted?”
- CustomerChannel — needed for “which customer channels are impacted?”

For each of these, does the agent need to identify, retrieve, connect, or pass this to a tool separately?  
Please answer keep/remove for each, with a brief correction only if one should be named differently.

### Turn 7 — user

Keep all four.

- Incident — keep. It is the central operational record and the main thing most questions and actions are about.
- IT service — keep. I’d name it with a space in normal usage, but yes, it absolutely needs to be separate.
- Business service — keep. We need to distinguish business impact from technical service impact.
- Customer channel — keep. It matters separately from the business service because the same service can be delivered through different channels, and channel impact is a real reporting question.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident: {}\n  ITService: {}\n  BusinessService: {}\n  CustomerChannel: {}"
}
```

### Turn 7 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 7 — assistant

Recorded.

Short recap: we now have four confirmed core classes in the live ontology: Incident, ITService, BusinessService, and CustomerChannel.

Next class batch, tied to dependency path, correlation, and restoration/recovery questions/actions:
- ConfigurationItem
- ThirdPartyService
- Alert
- Event
- BackupSet
- RecoveryPlan
- Change

For each of these, does the agent need to identify, retrieve, connect, or pass this to a tool separately?  
Please answer keep/remove for each, and flag any naming adjustment if needed.

### Turn 8 — user

Keep all of those as well, with only normal-language naming adjustments.

- Configuration item — keep.
- Third-party service — keep.
- Alert — keep.
- Event — keep.
- Backup set — keep.
- Recovery plan — keep.
- Change — keep.

All seven need to stand on their own operationally. They are not just attributes hanging off the incident. For example, the agent may need to trace dependency path through configuration items and third-party services, correlate alerts and events, choose a usable backup set or recovery plan, or check whether a recent change is linked to the incident.

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ConfigurationItem:\n    aliases: [configuration item]\n  ThirdPartyService:\n    aliases: [third-party service]\n  Alert: {}\n  Event: {}\n  BackupSet:\n    aliases: [backup set]\n  RecoveryPlan:\n    aliases: [recovery plan]\n  Change: {}"
}
```

### Turn 8 — tool

Applied. Added 7, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 8 — assistant

Recorded.

Short recap: we now have seven more confirmed classes: ConfigurationItem, ThirdPartyService, Alert, Event, BackupSet, RecoveryPlan, and Change. I also captured the normal-language aliases where you phrased them with spaces.

Next class batch, tied to safe response options and closure/regulatory questions:
- Runbook
- Workaround
- MaterialityAssessment
- RegulatoryNotification
- Evidence
- StakeholderCommunication
- CorrectiveAction

For each of these, does the agent need to identify, retrieve, connect, or pass this to a tool separately?  
Please answer keep/remove for each, and rename any that should use a different business term.

### Turn 9 — user

Keep all of them, with a couple of naming tweaks.

- Runbook — keep.
- Workaround — keep.
- Materiality assessment — keep.
- Regulatory notification — keep.
- Evidence item — I’d keep this, but I would name it that way rather than just “evidence,” because we usually track preserved artifacts one by one.
- Communication — keep. I would usually say “communication” rather than “stakeholder communication” as the class name, because the audience is a property of the message.
- Corrective action — keep.

All of these are things the agent may need to locate, evaluate, relate to the incident, or hand off into a workflow.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Runbook: {}\n  Workaround: {}\n  MaterialityAssessment:\n    aliases: [materiality assessment]\n  RegulatoryNotification:\n    aliases: [regulatory notification]\n  EvidenceItem:\n    aliases: [evidence item]\n  Communication:\n    aliases: [communication, stakeholder communication]\n  CorrectiveAction:\n    aliases: [corrective action]"
}
```

### Turn 9 — tool

Applied. Added 7, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 9 — assistant

Recorded.

Short recap: we added Runbook, Workaround, MaterialityAssessment, RegulatoryNotification, EvidenceItem, Communication, and CorrectiveAction, with your naming adjustments for EvidenceItem and Communication.

Next class batch, tied to ownership, routing, notification, escalation, and the extra distinct roles you confirmed:
- ServiceOwner
- ResolverGroup
- OnCallEngineer
- IncidentCommander
- IncidentResponseTeam
- ServiceDesk
- ITOperationsTeam
- NetworkOperationsCentre
- SecurityOperationsCentre
- ApplicationOwner
- TechnicalOwner
- BusinessOwner
- Stakeholder
- Vendor
- Regulator

For each of these, does the agent need to identify, retrieve, connect, or pass this to a tool separately to answer or perform something on your accepted list?  
Please answer keep/remove for each. If any of these are really the same real-world thing under different names in your organization, say that explicitly rather than just “keep all.”

### Turn 10 — user

Keep all of them, and they are not the same thing operationally.

- Service owner — keep.
- Resolver group — keep.
- On-call engineer — keep.
- Incident commander — keep.
- Incident response team — keep.
- Service desk — keep.
- IT operations team — keep.
- Network operations centre — keep.
- Security operations centre — keep.
- Application owner — keep.
- Technical owner — keep.
- Business owner — keep.
- Stakeholder — keep.
- Vendor — keep.
- Regulator — keep.

A few of them work closely together, but I would not collapse them:

- Service owner, application owner, technical owner, and business owner are different accountability points.
- Resolver group and on-call engineer are not the same level; one is a team assignment, the other is an individual handling role.
- Incident commander is not just another resolver; that role exists for command and coordination in a major incident.
- Incident response team is broader than any one operational team.
- Service desk, IT operations, network operations centre, and security operations centre each have distinct day-to-day functions.
- Vendor, stakeholder, and regulator also should remain separate because escalation, communication, and formal reporting do not mean the same thing.

### Turn 10 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceOwner:\n    aliases: [service owner]\n  ResolverGroup:\n    aliases: [resolver group]\n  OnCallEngineer:\n    aliases: [on-call engineer]\n  IncidentCommander:\n    aliases: [incident commander]\n  IncidentResponseTeam:\n    aliases: [incident response team]\n  ServiceDesk:\n    aliases: [service desk]\n  ITOperationsTeam:\n    aliases: [IT operations team]\n  NetworkOperationsCentre:\n    aliases: [network operations centre]\n  SecurityOperationsCentre:\n    aliases: [security operations centre]\n  ApplicationOwner:\n    aliases: [application owner]\n  TechnicalOwner:\n    aliases: [technical owner]\n  BusinessOwner:\n    aliases: [business owner]\n  Stakeholder: {}\n  Vendor: {}\n  Regulator: {}"
}
```

### Turn 10 — tool

Applied. Added 15, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 10 — assistant

Recorded.

Short recap: we now have the distinct actor/role classes confirmed separately, including ownership roles, operational teams, command/coordination roles, and external parties. You explicitly confirmed these should not be collapsed.

One more class check before we leave Phase 2, because it came up in your operating contexts and could affect several accepted questions/actions:
- Environment
- DetectionSource
- RecoveryEnvironment
- ClosureCondition

For each of these, does the agent need to identify, retrieve, connect, or pass this to a tool separately for your accepted questions/actions, or are they better handled later as properties/value sets on other classes?  
Please answer keep as class / property instead of class / remove for each.

### Turn 11 — user

Here I would split them carefully:

- Environment — keep as class.
- Detection source — property instead of class.
- Recovery environment — property instead of class if you mean it as a special label; in practice I’d treat it as an environment used for recovery, not a separate kind of object.
- Closure condition — remove as a class.

Why:

- Environment stands on its own operationally. We need to distinguish production, disaster recovery, test, development, and similar contexts as things services or components are deployed in or belong to.
- Detection source is better treated as a controlled value on alerts, events, and incidents.
- Recovery environment is not a separate object from environment in the way we normally model it. It is usually just an environment, often a disaster recovery one, that becomes the target for failover or restore.
- Closure condition is something we check, not something I’d model as a standalone operational object for this scope.

### Turn 11 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Environment: {}"
}
```

### Turn 11 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 11 — assistant

Recorded.

Short recap of Phase 2: we now have confirmed classes for the central operational objects, recovery/support artifacts, distinct roles and teams, external parties, and Environment. You also decided that DetectionSource and RecoveryEnvironment should be modeled as properties later, not classes, and ClosureCondition should not be a class.

Now we start relationships.

First path-focused relationship question, grounded in your impact questions:
How do you get from an Incident to the impacted BusinessService and CustomerChannel in your real-world model?  
Please describe the path, not just the edge — for example, whether the Incident links directly to those, or through ITService first, or through some other concept already in the model.

### Turn 12 — user

For business impact, I would model a direct link from the incident to the impacted business service.

For customer channels, I would usually get there through the business service:

- incident impacts business service
- business service is delivered through customer channel

That gives you a clean path for “which customer channels are impacted by this incident?” even if the incident record does not point to the channel directly.

Operationally, that matches how we work: we assess the incident against affected business services, and the channel view follows from how those services are delivered.

### Turn 12 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: impactsBusinessService\n    from: Incident\n    to: BusinessService\n  - name: deliveredThrough\n    from: BusinessService\n    to: CustomerChannel"
}
```

### Turn 12 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 12 — assistant

Recorded.

Short recap: we now have a direct relationship Incident → BusinessService, and a path BusinessService → CustomerChannel. You explicitly said customer-channel impact is normally derived through business service, not assumed as a direct Incident → CustomerChannel fact.

Next path-focused relationship question:
How do you get from an Incident to the affected IT service, and from that IT service to the configuration items and third-party services on its dependency path?  
Please describe the path(s) you actually use, including whether the incident links directly to ITService, and whether dependency-path items are reached directly from ITService or through ConfigurationItem-to-ConfigurationItem / ConfigurationItem-to-ThirdPartyService links.

### Turn 13 — user

The starting point is a direct link from the incident to the affected IT service.

From there, the dependency paths I’d use in this scope are:

- incident impacts IT service
- IT service runs on infrastructure components
- IT service is implemented by application
- IT service depends on third-party service

And for deeper technical tracing from the application side:

- application uses database
- application runs on infrastructure components
- application consumes integration interface

So, yes, the incident links directly to the IT service.

For configuration items and third-party dependencies, I would reach them from the IT service and from the application or infrastructure underneath it, rather than relying on generic configuration-item-to-configuration-item dependency chains in this model.

If you’re asking specifically whether we need explicit configuration item to configuration item or configuration item to third-party service dependency edges for the accepted questions you have so far, I would say no, not as the primary path here. The model can answer the operational questions with service, application, infrastructure, and third-party dependency links without introducing a full low-level dependency graph between every technical component.

### Turn 13 — assistant

That gives us the path shape, but it introduces one new class we haven’t confirmed yet: Application. I shouldn’t add it silently.

Short recap: you confirmed a direct Incident → IT service link. You also described dependency tracing through IT service to infrastructure components, application, and third-party service, and from application to database, infrastructure components, and integration interface. You also explicitly said you do not want a generic low-level configuration-item-to-configuration-item dependency graph as the primary path in this scope.

Next required question before I can record those paths:
Does the agent need to identify, retrieve, connect, or pass Application separately for your accepted questions/actions?  
If yes, I’ll add it as a class; if no, we’ll need a different path using only already-confirmed classes.

### Turn 14 — user

Yes — keep application as a separate class.

Without it, you lose an important part of the dependency and restoration picture. In practice, many incidents affect an IT service through the application layer, and several other things hang off that cleanly: databases, interfaces, vendor support, deployment and release activity, and application ownership.

So for the accepted questions and actions, the agent does need to treat application as its own object, not just bury it inside the IT service.

### Turn 14 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 14 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by this incident?
  - id: cq2
    text: Which customer channels are impacted by this incident?
  - id: cq3
    text: Which configuration items sit on the dependency path of the affected IT service?
  - id: cq4
    text: Which third-party services sit on the dependency path of the affected IT service?
  - id: cq5
    text: Which active alerts are correlated with this incident?
  - id: cq6
    text: Which events are correlated with this incident?
  - id: cq7
    text: Who owns the affected service?
  - id: cq8
    text: Which resolver group should be assigned to this incident?
  - id: cq9
    text: Which on-call engineer should handle this incident?
  - id: cq10
    text: Does this incident meet the criteria to be treated as a major incident?
  - id: cq11
    text: Which runbook can be used safely for this case?
  - id: cq12
    text: Which workaround can be used safely for this case?
  - id: cq13
    text: Which backup set can be used safely for this case?
  - id: cq14
    text: Which recovery plan can be used safely for this case?
  - id: cq15
    text: Was this incident caused by a recent change?
  - id: cq16
    text: Is a materiality assessment complete?
  - id: cq17
    text: "Is a regulatory notification required, and when is it due?"
  - id: cq18
    text: "Are evidence integrity, stakeholder communications, and closure conditions complete?"
  - id: cq19
    text: Which stakeholders have already been notified about this incident?
  - id: cq20
    text: Which vendor should this incident be escalated to?
  - id: cq21
    text: Which corrective actions from earlier post-incident reviews remain open for the affected service?
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
    aliases:
      - configuration item
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases:
      - third-party service
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases:
      - backup set
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases:
      - recovery plan
    properties: {}
  Change:
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
  MaterialityAssessment:
    meaning: null
    aliases:
      - materiality assessment
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases:
      - regulatory notification
    properties: {}
  EvidenceItem:
    meaning: null
    aliases:
      - evidence item
    properties: {}
  Communication:
    meaning: null
    aliases:
      - communication
      - stakeholder communication
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases:
      - corrective action
    properties: {}
  ServiceOwner:
    meaning: null
    aliases:
      - service owner
    properties: {}
  ResolverGroup:
    meaning: null
    aliases:
      - resolver group
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases:
      - on-call engineer
    properties: {}
  IncidentCommander:
    meaning: null
    aliases:
      - incident commander
    properties: {}
  IncidentResponseTeam:
    meaning: null
    aliases:
      - incident response team
    properties: {}
  ServiceDesk:
    meaning: null
    aliases:
      - service desk
    properties: {}
  ITOperationsTeam:
    meaning: null
    aliases:
      - IT operations team
    properties: {}
  NetworkOperationsCentre:
    meaning: null
    aliases:
      - network operations centre
    properties: {}
  SecurityOperationsCentre:
    meaning: null
    aliases:
      - security operations centre
    properties: {}
  ApplicationOwner:
    meaning: null
    aliases:
      - application owner
    properties: {}
  TechnicalOwner:
    meaning: null
    aliases:
      - technical owner
    properties: {}
  BusinessOwner:
    meaning: null
    aliases:
      - business owner
    properties: {}
  Stakeholder:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: An alert is acknowledged so responders can see it has been taken up.
    verification: Confirm the alert shows as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: The incident is assigned to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: The incident is marked and handled as a major incident.
    verification: Confirm the incident shows major-incident handling has been initiated.
  containIncident:
    input: null
    preconditions: []
    effect: Containment actions are recorded and the incident is put under control.
    verification: Confirm the incident record shows containment has been performed.
  isolateAffectedConfigurationItem:
    input: null
    preconditions: []
    effect: The affected configuration item is deliberately isolated from relevant networks or dependencies.
    verification: Confirm the configuration item shows as isolated or disconnected as intended.
  failOverAffectedServiceToRecoveryEnvironment:
    input: null
    preconditions: []
    effect: The affected service is failed over to its recovery environment.
    verification: Confirm the service is operating from the recovery environment.
  restoreDataFromBackup:
    input: null
    preconditions: []
    effect: Data is restored from the selected backup set.
    verification: Confirm the restored data is available and matches the intended restore point.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: The emergency change is executed.
    verification: Confirm the change record and affected target reflect the executed change.
  sendStakeholderCommunication:
    input: null
    preconditions: []
    effect: A stakeholder communication is issued for the incident.
    verification: Confirm the communication was sent and recorded against the incident.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: A regulatory notification is submitted.
    verification: Confirm the notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: The incident is closed.
    verification: Confirm the incident status shows closed.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverAffectedServiceToRecoveryEnvironment" has no input class.
#   [error] action-input-missing — Action "isolateAffectedConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreDataFromBackup" has no input class.
#   [error] action-input-missing — Action "sendStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 14 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Application: {}\nrelationships:\n  - name: impactsITService\n    from: Incident\n    to: ITService\n  - name: implementedBy\n    from: ITService\n    to: Application\n  - name: dependsOnThirdPartyService\n    from: ITService\n    to: ThirdPartyService\n  - name: runsInEnvironment\n    from: ITService\n    to: Environment\n  - name: runsOnConfigurationItem\n    from: ITService\n    to: ConfigurationItem\n  - name: runsOnConfigurationItem\n    from: Application\n    to: ConfigurationItem\n  - name: usesConfigurationItem\n    from: Application\n    to: ConfigurationItem"
}
```

### Turn 14 — tool

Applied. Added 8, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 14 — assistant

Recorded, including the new Application class.

Short recap: we now have Incident → ITService as a direct fact, and service/application/dependency paths through Application, ConfigurationItem, ThirdPartyService, and Environment. I kept this at the level you asked for, without introducing a full low-level component-to-component dependency graph.

Next path-focused relationship question:
How do you get from the affected service or application to the people and groups responsible for it — specifically ServiceOwner, ApplicationOwner, TechnicalOwner, BusinessOwner, ResolverGroup, OnCallEngineer, and Vendor?  
Please describe the real path(s) you use, not just the endpoint. Also, where the question is “should be assigned/should handle,” I need both:
1. the relationship that records an assignment once made, and  
2. the ownership/support path the agent would use to derive the right target in the first place.

### Turn 15 — user

I’d separate accountability, assignment, and support very clearly.

For accountability and ownership paths:

- service owner owns IT service
- application owner owns application
- technical owner owns configuration item
- business owner is accountable for business service
- vendor supports application
- third-party service is provided by vendor

So if I’m finding who is responsible for what:

- from the affected IT service, go to the service owner
- from the impacted business service, go to the business owner
- from the supporting application, go to the application owner
- from the affected configuration item, go to the technical owner
- from the application or dependent third-party service, go to the vendor

For incident handling and routing:

Recorded assignment or handling facts:
- incident is assigned to resolver group
- incident is handled by on-call engineer
- incident is escalated to vendor

Deriving the right target in the first place:
- start from what the incident impacts or affects — IT service and configuration item primarily
- use the supporting service or technology area to find the resolver group that supports that affected area
- then identify the on-call engineer as a member of that resolver group

So the derivation logic is roughly:

- incident impacts IT service or affects configuration item
- resolver group supports that affected service or configuration item
- on-call engineer is a member of resolver group

One nuance: the incident record carries the actual assignment once made, but the suggested target comes from the support path around the affected service or configuration item. That distinction matters, because recommendation and recorded assignment are not the same thing.

### Turn 15 — assistant

Clear and very useful.

Short recap: you distinguished three different things:
- accountability/ownership links, like owners of services, applications, business services, and configuration items;
- support/derivation links, used to recommend the right resolver group and on-call engineer;
- recorded incident-routing links, such as assigned resolver group, handling engineer, and escalated vendor.

One required clarification before I record these relationships:
Do you want ResolverGroup to support both ITService and ConfigurationItem directly, or only one of them as the primary derivation path in this ontology?  
You mentioned both in the explanation, and that choice affects whether I add one support path or two.

### Turn 16 — user

Use both.

Operationally, either can be the right anchor depending on what is known early in the incident.

- If we already know the affected IT service, the resolver group can be derived from the service support path.
- If we only know the failing component at first, the resolver group can be derived from the affected configuration item.

That is also why assignment should not depend on only one route. Early triage often starts with whichever of those two is identified first.

### Turn 16 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: ownedByServiceOwner\n    from: ITService\n    to: ServiceOwner\n  - name: ownedByApplicationOwner\n    from: Application\n    to: ApplicationOwner\n  - name: ownedByTechnicalOwner\n    from: ConfigurationItem\n    to: TechnicalOwner\n  - name: accountableToBusinessOwner\n    from: BusinessService\n    to: BusinessOwner\n  - name: supportedByVendor\n    from: Application\n    to: Vendor\n  - name: providedByVendor\n    from: ThirdPartyService\n    to: Vendor\n  - name: assignedToResolverGroup\n    from: Incident\n    to: ResolverGroup\n  - name: handledByOnCallEngineer\n    from: Incident\n    to: OnCallEngineer\n  - name: escalatedToVendor\n    from: Incident\n    to: Vendor\n  - name: supportedByResolverGroup\n    from: ITService\n    to: ResolverGroup\n  - name: supportedByResolverGroup\n    from: ConfigurationItem\n    to: ResolverGroup\n  - name: memberOfResolverGroup\n    from: OnCallEngineer\n    to: ResolverGroup"
}
```

### Turn 16 — tool

Applied. Added 12, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 16 — assistant

Recorded.

Short recap: the model now distinguishes ownership/accountability paths, support paths for deriving assignment, and recorded routing facts on the incident itself. You also confirmed that resolver-group derivation must work from either ITService or ConfigurationItem.

Next path-focused relationship question:
How do you get from an Incident to the response artifacts and governance records around it — specifically Alert, Event, Runbook, Workaround, BackupSet, RecoveryPlan, MaterialityAssessment, RegulatoryNotification, EvidenceItem, Communication, and CorrectiveAction?  
Please describe the real paths you use, including which ones are direct links from the Incident and which are reached through ITService, Application, or BusinessService instead.

### Turn 17 — user

In our operating model, most of those are direct or near-direct links from the incident, with a few reached through problem, known error, recovery, or assessment paths.

Direct links from the incident:
- incident is triggered by alert
- incident is correlated from event
- incident is handled with runbook
- incident is supported by evidence item
- incident is communicated through communication
- incident is evaluated by materiality assessment
- incident is reviewed in post-incident review
- incident is recovered with recovery plan
- incident is linked to problem

Then the next-step paths:

For workaround:
- incident is linked to problem
- problem is documented by known error
- known error has workaround

For backup set:
- incident is recovered with recovery plan
- recovery plan uses backup set

For regulatory notification:
- incident is evaluated by materiality assessment
- materiality assessment triggers regulatory notification

For corrective action:
- incident is reviewed in post-incident review
- post-incident review produces corrective action

A couple of practical notes:

- I would not normally hang backup set directly off the incident if we want to preserve the logic of recovery choice; it is cleaner through the recovery plan.
- Workaround is also cleaner through the diagnosed problem and known error path than as a direct incident attachment.
- Communication is direct from the incident, even though the actual audience may be stakeholders, management, customers, vendors, or regulators.
- Regulatory notification is not just “another communication”; it is reached through the assessment and reporting path.

### Turn 17 — assistant

That path is clear, but it introduces three new classes we have not confirmed yet: Problem, KnownError, and PostIncidentReview. I should confirm them before recording those paths.

Short recap: you described direct incident links to alert, event, runbook, evidence item, communication, materiality assessment, recovery plan, and problem, plus derived paths to workaround via problem/known error, to backup set via recovery plan, to regulatory notification via materiality assessment, and to corrective action via post-incident review. You also explicitly distinguished regulatory notification from ordinary communication.

Next focused question:
Does the agent need to identify, retrieve, connect, or pass these three separately for your accepted questions/actions?
- Problem
- KnownError
- PostIncidentReview

Please answer keep/remove for each.

### Turn 18 — user

Keep all three.

- Problem — keep.
- Known error — keep.
- Post-incident review — keep.

They each do different work operationally:

- Problem is the underlying cause record that can group incidents.
- Known error is the diagnosed problem with documented cause or workaround.
- Post-incident review is the formal review that identifies lessons and produces follow-up actions.

If you collapse them, you lose important distinctions around diagnosis, workaround use, and follow-up governance.

### Turn 18 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Problem: {}\n  KnownError:\n    aliases: [known error]\n  PostIncidentReview:\n    aliases: [post-incident review]\nrelationships:\n  - name: triggeredByAlert\n    from: Incident\n    to: Alert\n  - name: correlatedFromEvent\n    from: Incident\n    to: Event\n  - name: handledWithRunbook\n    from: Incident\n    to: Runbook\n  - name: supportedByEvidenceItem\n    from: Incident\n    to: EvidenceItem\n  - name: communicatedThrough\n    from: Incident\n    to: Communication\n  - name: evaluatedByMaterialityAssessment\n    from: Incident\n    to: MaterialityAssessment\n  - name: recoveredWithRecoveryPlan\n    from: Incident\n    to: RecoveryPlan\n  - name: linkedToProblem\n    from: Incident\n    to: Problem\n  - name: documentedByKnownError\n    from: Problem\n    to: KnownError\n  - name: hasWorkaround\n    from: KnownError\n    to: Workaround\n  - name: usesBackupSet\n    from: RecoveryPlan\n    to: BackupSet\n  - name: triggersRegulatoryNotification\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n  - name: reviewedInPostIncidentReview\n    from: Incident\n    to: PostIncidentReview\n  - name: producesCorrectiveAction\n    from: PostIncidentReview\n    to: CorrectiveAction"
}
```

### Turn 18 — tool

Applied. Added 17, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 18 — assistant

Recorded.

Short recap: we added Problem, KnownError, and PostIncidentReview, and captured the direct and derived paths you described for alerts, events, runbooks, evidence, communications, assessments, recovery plans, problems, workarounds, backup sets, regulatory notifications, and corrective actions.

Next path-focused relationship question:
How do you get from an Incident or related records to the remaining operational actors and parties that are still unconnected in the model — specifically IncidentCommander, IncidentResponseTeam, ServiceDesk, ITOperationsTeam, NetworkOperationsCentre, SecurityOperationsCentre, Stakeholder, and Regulator?  
Please describe the real paths you use, and say explicitly if any of these need a direct Incident relationship rather than only being reachable through some team, communication, or notification chain.

### Turn 19 — user

Here’s how I’d connect those in practice.

Direct or near-direct incident paths:

- incident is coordinated by incident commander
- incident notifies stakeholder
- incident is communicated through communication

Major-incident command path:
- incident commander is a member of incident response team
- incident response team coordinates major incident
- incident commander commands major incident

So for a normal incident, you may have no commander at all. For a major incident, the incident gets a commander, and the wider coordination sits with the incident response team.

Service desk path:
- service desk records incident

That is important as a separate operational fact. It tells you who captured or opened the case, not who resolves it.

Stakeholder communication path:
- incident notifies stakeholder
- communication is about incident
- communication is addressed to stakeholder

Those are related but not identical. The incident-level link captures who must be notified or was notified in incident terms; the communication record captures the actual message sent to a stakeholder audience.

Regulator path:
- incident is evaluated by materiality assessment
- materiality assessment triggers regulatory notification
- regulatory notification is sent to regulator

I would not normally use a direct incident-to-regulator link in this scope, because the formal path is through assessment and notification.

For the operations centres and operations team:

- IT operations team operates IT service
- network operations centre operates monitoring tool
- security operations centre monitors security event

Those are not primarily direct incident links. They are reached through the service, monitoring, and security-event paths around the incident.

One practical nuance:
- Security operations centre becomes especially relevant through the cybersecurity path, for example where a cybersecurity incident is derived from a security event.
- Network operations centre is usually relevant through monitoring and infrastructure operations, not because every incident has a direct relationship to that team.
- IT operations team is relevant through service operation responsibility rather than as a mandatory direct incident endpoint.

### Turn 19 — assistant

This is useful, but your answer introduces three more candidate classes that I should confirm before recording those paths: MajorIncident, MonitoringTool, and SecurityEvent.

Short recap: you gave direct/near-direct paths for incident commander, stakeholder notification, service desk recording, and regulator via assessment/notification. You also explained that IT operations, network operations, and security operations are usually reached through service/monitoring/security-event paths rather than direct incident links. You also explicitly said Regulator should not be a direct Incident relationship in this scope.

Next focused question:
Does the agent need to identify, retrieve, connect, or pass these separately for your accepted questions/actions?
- MajorIncident
- MonitoringTool
- SecurityEvent

Please answer keep/remove for each.

### Turn 20 — user

Keep all three.

- Major incident — keep.
- Monitoring tool — keep.
- Security event — keep.

Why they matter separately:

- Major incident is not just a severity label on an incident; it changes coordination and communication handling.
- Monitoring tool matters because alerts, monitoring rules, logs, and operational visibility sit around it.
- Security event matters because cyber handling starts from security-relevant observations, and not every event is a security event.

### Turn 20 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MajorIncident:\n    aliases: [major incident]\n  MonitoringTool:\n    aliases: [monitoring tool]\n  SecurityEvent:\n    aliases: [security event]\nrelationships:\n  - name: coordinatedByIncidentCommander\n    from: Incident\n    to: IncidentCommander\n  - name: notifiesStakeholder\n    from: Incident\n    to: Stakeholder\n  - name: aboutIncident\n    from: Communication\n    to: Incident\n  - name: addressedToStakeholder\n    from: Communication\n    to: Stakeholder\n  - name: memberOfIncidentResponseTeam\n    from: IncidentCommander\n    to: IncidentResponseTeam\n  - name: coordinatesMajorIncident\n    from: IncidentResponseTeam\n    to: MajorIncident\n  - name: commandsMajorIncident\n    from: IncidentCommander\n    to: MajorIncident\n  - name: recordedByServiceDesk\n    from: Incident\n    to: ServiceDesk\n  - name: sentToRegulator\n    from: RegulatoryNotification\n    to: Regulator\n  - name: operatesITService\n    from: ITOperationsTeam\n    to: ITService\n  - name: operatesMonitoringTool\n    from: NetworkOperationsCentre\n    to: MonitoringTool\n  - name: monitorsSecurityEvent\n    from: SecurityOperationsCentre\n    to: SecurityEvent"
}
```

### Turn 20 — tool

Applied. Added 15, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] inverse-pair — Communication --aboutIncident--> Incident looks like the inverse of Incident --communicatedThrough--> Communication. The profile is one directed relationship per real-world connection, never also its inverse. Keep whichever direction the questions and actions actually navigate.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 20 — assistant

I recorded the new classes and relationships, but the tool flagged one likely contradiction that I should resolve before moving on:

- We now have both:
  - Incident --communicatedThrough--> Communication
  - Communication --aboutIncident--> Incident

This tool wants one directed relationship per real-world connection, not both directions.

Given your own wording, which direction do you actually want to keep as the canonical fact in this ontology?
1. Incident → Communication (“incident is communicated through communication”), or
2. Communication → Incident (“communication is about incident”)

Please choose one, and I’ll remove the other.

### Turn 21 — user

Keep **Communication → Incident** as the canonical fact.

That is the cleaner operational direction, because the communication record is the message artifact and it is about a particular incident. From there you can still answer the incident-side question by traversing back.

So I’d keep:
- communication is about incident

And drop the reverse as the stored canonical edge.

### Turn 21 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "relationships": [
    {
      "name": "communicatedThrough",
      "from": "Incident",
      "to": "Communication"
    }
  ]
}
```

### Turn 21 — tool

Removed 1 element(s) — relationships: communicatedThrough (Incident → Communication).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 21 — assistant

Resolved — I kept Communication → Incident and removed the reverse edge.

Short recap: we now have the incident-command, notification, service-desk, regulator, and operational-team paths recorded, and we cleaned up the Communication/Incident inverse-pair warning by keeping the direction you chose.

Next relationship question, to close an important gap from your accepted list:
How do you get from an Incident to a MajorIncident in your real model?  
You said major incident is not just a severity label and changes coordination/communication handling. So is it:
- a direct relationship from Incident to MajorIncident,
- or does Incident itself become the thing handled as a major incident without a separate connecting class/record?

Please describe the actual path you want stored.

### Turn 22 — user

I would treat it as the incident being classified as a major incident, not as two unrelated records connected by a separate ordinary link.

In practical modeling terms, major incident is a specialized form of incident. So the stored path is not really “incident points to major incident”; it is that some incidents are handled in the major-incident form and then participate in the major-incident-specific relationships.

That’s why the command and coordination links sit on the major-incident side:

- incident is classified as a major incident
- incident commander commands major incident
- incident response team coordinates major incident
- major incident requires communication
- major incident requires post-incident review

So if your tool needs a choice, I would not add a plain direct relationship from incident to major incident as if they were two peer objects connected by an ordinary edge. I’d model major incident as a subtype or specialized incident record.

### Turn 22 — assistant

Under this tool’s limits, I can’t represent subtype/subclassing, and I also shouldn’t fake it with a relationship like “is a type of” or “classified as,” because that would just be disguised subclassing.

So I need one focused decision from you:
For this ontology tool, which approach do you want?

1. Remove MajorIncident as a separate class, and later represent “major incident” as a property/value on Incident plus major-incident-specific relationships staying on Incident.

or

2. Keep MajorIncident as a separate class, but then we must name a real operational connector that is not subclassing — for example some distinct record or handling construct that links an Incident to the major-incident handling object.

Please choose 1 or 2.

### Turn 23 — user

Choose **1**.

For this tool, it is better to remove major incident as a separate class and represent it on the incident side, then keep the major-incident-specific handling logic attached to the incident record.

That is closer to reality than inventing a second operational object just to satisfy the modeling limitation. The important thing operationally is that an incident can be declared and then handled under major-incident conditions, not that there is always a separate standalone record.

### Turn 23 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [
    "MajorIncident"
  ],
  "relationships": [
    {
      "name": "coordinatesMajorIncident",
      "from": "IncidentResponseTeam",
      "to": "MajorIncident"
    },
    {
      "name": "commandsMajorIncident",
      "from": "IncidentCommander",
      "to": "MajorIncident"
    }
  ]
}
```

### Turn 23 — tool

Removed 1 element(s) — classes: MajorIncident.

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 23 — assistant

Recorded the decision: MajorIncident is out as a separate class. We’ll model “major incident” on Incident later as a property/value and keep the special handling logic attached to Incident.

Short recap: that avoids fake subclassing and keeps the ontology closer to how you actually operate.

Before we leave relationships, I need to close the remaining unconnected classes introduced during this phase. One focused batch:
How should these classes connect into the model, if at all?
- MonitoringTool ↔ Alert
- MonitoringTool ↔ Event
- SecurityEvent ↔ Incident
- SecurityEvent ↔ Event
- Application ↔ ThirdPartyService
- Application ↔ Vendor
- Application ↔ Change

Please give the real directed relationship(s) you use for each pair you want to keep, and say “no direct link” where the connection is only indirect.

### Turn 24 — user

Here’s how I’d handle each of those.

- Monitoring tool ↔ Alert: **no direct link**
  - The cleaner path is:
    - monitoring rule is executed by monitoring tool
    - alert is generated by monitoring rule

- Monitoring tool ↔ Event: **no direct link**
  - In this scope I would not force a direct tool-to-event edge.

- Security event ↔ Incident:
  - for the cyber path, the real link is:
    - cybersecurity incident is derived from security event
  - If you are not keeping a separate cybersecurity-incident class later, then this becomes an incident-side security classification question rather than a direct generic incident-to-security-event link.

- Security event ↔ Event:
  - Again, I would not force a generic direct edge just from the pair you listed.
  - Security event stands as its own security-relevant observation in the model.

- Application ↔ Third-party service: **no direct link**
  - The operational path is usually:
    - IT service is implemented by application
    - IT service depends on third-party service
  - That is cleaner than saying the application directly depends on the third-party service in this scope.

- Application ↔ Vendor:
  - vendor supports application

- Application ↔ Change:
  - There is no direct change-to-application link in the operating shape I’d keep here.
  - The cleaner path is through release and deployment on the delivery side, and through service or configuration-item impact on the operational side.
  - So for the specific pair you asked: **no direct link**.

### Turn 24 — assistant

Helpful. Your answer gives real connection choices, but it introduces another new class: MonitoringRule. I need to confirm that before I add the monitoring path.

Short recap: you said no direct MonitoringTool→Alert or MonitoringTool→Event edge; instead, alerts should be reached through MonitoringRule. You also said no direct Application→ThirdPartyService or Application→Change edge in this scope, while Application→Vendor should stay. For SecurityEvent, you said the real link is through a cybersecurity-incident path if we keep that separately; otherwise it becomes an incident-side classification matter rather than a direct generic Incident→SecurityEvent edge.

Next focused question:
Does the agent need to identify, retrieve, connect, or pass MonitoringRule separately for your accepted questions/actions?  
Please answer keep/remove.

### Turn 25 — user

Keep monitoring rule.

It matters separately because the agent may need to understand which rule generated an alert, what severity it would normally assign, and which monitored condition it evaluates. That is operationally useful for triage, suppression decisions, and tracing noisy or repeated alerts back to the rule behind them.

### Turn 25 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 25 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by this incident?
  - id: cq2
    text: Which customer channels are impacted by this incident?
  - id: cq3
    text: Which configuration items sit on the dependency path of the affected IT service?
  - id: cq4
    text: Which third-party services sit on the dependency path of the affected IT service?
  - id: cq5
    text: Which active alerts are correlated with this incident?
  - id: cq6
    text: Which events are correlated with this incident?
  - id: cq7
    text: Who owns the affected service?
  - id: cq8
    text: Which resolver group should be assigned to this incident?
  - id: cq9
    text: Which on-call engineer should handle this incident?
  - id: cq10
    text: Does this incident meet the criteria to be treated as a major incident?
  - id: cq11
    text: Which runbook can be used safely for this case?
  - id: cq12
    text: Which workaround can be used safely for this case?
  - id: cq13
    text: Which backup set can be used safely for this case?
  - id: cq14
    text: Which recovery plan can be used safely for this case?
  - id: cq15
    text: Was this incident caused by a recent change?
  - id: cq16
    text: Is a materiality assessment complete?
  - id: cq17
    text: "Is a regulatory notification required, and when is it due?"
  - id: cq18
    text: "Are evidence integrity, stakeholder communications, and closure conditions complete?"
  - id: cq19
    text: Which stakeholders have already been notified about this incident?
  - id: cq20
    text: Which vendor should this incident be escalated to?
  - id: cq21
    text: Which corrective actions from earlier post-incident reviews remain open for the affected service?
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
    aliases:
      - configuration item
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases:
      - third-party service
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases:
      - backup set
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases:
      - recovery plan
    properties: {}
  Change:
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
  MaterialityAssessment:
    meaning: null
    aliases:
      - materiality assessment
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases:
      - regulatory notification
    properties: {}
  EvidenceItem:
    meaning: null
    aliases:
      - evidence item
    properties: {}
  Communication:
    meaning: null
    aliases:
      - communication
      - stakeholder communication
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases:
      - corrective action
    properties: {}
  ServiceOwner:
    meaning: null
    aliases:
      - service owner
    properties: {}
  ResolverGroup:
    meaning: null
    aliases:
      - resolver group
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases:
      - on-call engineer
    properties: {}
  IncidentCommander:
    meaning: null
    aliases:
      - incident commander
    properties: {}
  IncidentResponseTeam:
    meaning: null
    aliases:
      - incident response team
    properties: {}
  ServiceDesk:
    meaning: null
    aliases:
      - service desk
    properties: {}
  ITOperationsTeam:
    meaning: null
    aliases:
      - IT operations team
    properties: {}
  NetworkOperationsCentre:
    meaning: null
    aliases:
      - network operations centre
    properties: {}
  SecurityOperationsCentre:
    meaning: null
    aliases:
      - security operations centre
    properties: {}
  ApplicationOwner:
    meaning: null
    aliases:
      - application owner
    properties: {}
  TechnicalOwner:
    meaning: null
    aliases:
      - technical owner
    properties: {}
  BusinessOwner:
    meaning: null
    aliases:
      - business owner
    properties: {}
  Stakeholder:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
  KnownError:
    meaning: null
    aliases:
      - known error
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases:
      - post-incident review
    properties: {}
  MonitoringTool:
    meaning: null
    aliases:
      - monitoring tool
    properties: {}
  SecurityEvent:
    meaning: null
    aliases:
      - security event
    properties: {}
relationships:
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: runsInEnvironment
    from: ITService
    to: Environment
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: ITService
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: ownedByServiceOwner
    from: ITService
    to: ServiceOwner
    meaning: null
    aliases: []
  - name: ownedByApplicationOwner
    from: Application
    to: ApplicationOwner
    meaning: null
    aliases: []
  - name: ownedByTechnicalOwner
    from: ConfigurationItem
    to: TechnicalOwner
    meaning: null
    aliases: []
  - name: accountableToBusinessOwner
    from: BusinessService
    to: BusinessOwner
    meaning: null
    aliases: []
  - name: supportedByVendor
    from: Application
    to: Vendor
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: null
    aliases: []
  - name: supportedByResolverGroup
    from: ITService
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportedByResolverGroup
    from: ConfigurationItem
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
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
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: supportedByEvidenceItem
    from: Incident
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: recoveredWithRecoveryPlan
    from: Incident
    to: RecoveryPlan
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reviewedInPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: notifiesStakeholder
    from: Incident
    to: Stakeholder
    meaning: null
    aliases: []
  - name: aboutIncident
    from: Communication
    to: Incident
    meaning: null
    aliases: []
  - name: addressedToStakeholder
    from: Communication
    to: Stakeholder
    meaning: null
    aliases: []
  - name: memberOfIncidentResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: null
    aliases: []
  - name: recordedByServiceDesk
    from: Incident
    to: ServiceDesk
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: operatesItservice
    from: ITOperationsTeam
    to: ITService
    meaning: null
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperationsCentre
    to: MonitoringTool
    meaning: null
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperationsCentre
    to: SecurityEvent
    meaning: null
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: An alert is acknowledged so responders can see it has been taken up.
    verification: Confirm the alert shows as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: The incident is assigned to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: The incident is marked and handled as a major incident.
    verification: Confirm the incident shows major-incident handling has been initiated.
  containIncident:
    input: null
    preconditions: []
    effect: Containment actions are recorded and the incident is put under control.
    verification: Confirm the incident record shows containment has been performed.
  isolateAffectedConfigurationItem:
    input: null
    preconditions: []
    effect: The affected configuration item is deliberately isolated from relevant networks or dependencies.
    verification: Confirm the configuration item shows as isolated or disconnected as intended.
  failOverAffectedServiceToRecoveryEnvironment:
    input: null
    preconditions: []
    effect: The affected service is failed over to its recovery environment.
    verification: Confirm the service is operating from the recovery environment.
  restoreDataFromBackup:
    input: null
    preconditions: []
    effect: Data is restored from the selected backup set.
    verification: Confirm the restored data is available and matches the intended restore point.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: The emergency change is executed.
    verification: Confirm the change record and affected target reflect the executed change.
  sendStakeholderCommunication:
    input: null
    preconditions: []
    effect: A stakeholder communication is issued for the incident.
    verification: Confirm the communication was sent and recorded against the incident.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: A regulatory notification is submitted.
    verification: Confirm the notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: The incident is closed.
    verification: Confirm the incident status shows closed.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverAffectedServiceToRecoveryEnvironment" has no input class.
#   [error] action-input-missing — Action "isolateAffectedConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreDataFromBackup" has no input class.
#   [error] action-input-missing — Action "sendStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 25 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MonitoringRule:\n    aliases: [monitoring rule]\nrelationships:\n  - name: executedByMonitoringTool\n    from: MonitoringRule\n    to: MonitoringTool\n  - name: generatedByMonitoringRule\n    from: Alert\n    to: MonitoringRule"
}
```

### Turn 25 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 25 — assistant

Recorded.

Short recap: we added MonitoringRule and captured the path Alert → MonitoringRule → MonitoringTool, which matches your preferred monitoring lineage without forcing direct tool-to-alert or tool-to-event edges.

Before moving on, I need to close the relationship phase systematically for classes that still look unconnected or only partly connected.

Focused batch: please give the real path or direct link for each of these remaining gaps:
1. How does Event connect to MonitoringTool, if at all in this scope?
2. How does SecurityEvent connect into the Incident/Event side, if at all in this scope?
3. How does Environment connect to Application or ConfigurationItem, if at all?
4. Does Incident need a direct link to IncidentResponseTeam, or is IncidentCommander → IncidentResponseTeam enough?
5. Does Incident need a direct link to Regulator, or does MaterialityAssessment → RegulatoryNotification → Regulator fully cover your accepted questions?

Please answer each one directly.

### Turn 26 — user

1. **Event to monitoring tool:** no direct link in this scope.

2. **Security event into the incident/event side:** keep it separate from the generic event path unless you are explicitly modeling a cybersecurity-incident track. Operationally, security event is monitored by the security operations centre and can be derived from a log source. I would not add a generic direct security event to incident link in this reduced scope.

3. **Environment to application or configuration item:** yes, both matter.
   - IT service is deployed in environment
   - configuration item belongs to environment
   - For application specifically, I would not force a separate direct application-to-environment link if the service and deployment paths already cover your accepted questions.

4. **Incident to incident response team:** no direct link needed here. Incident commander to incident response team is enough, together with the major-incident handling context on the incident.

5. **Incident to regulator:** no direct link. The assessment and notification path fully covers the accepted questions:
   - incident is evaluated by materiality assessment
   - materiality assessment triggers regulatory notification
   - regulatory notification is sent to regulator

### Turn 26 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: deployedInEnvironment\n    from: ITService\n    to: Environment\n  - name: belongsToEnvironment\n    from: ConfigurationItem\n    to: Environment"
}
```

### Turn 26 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 26 — assistant

Recorded.

Short recap of the remaining relationship decisions:
- No direct Event → MonitoringTool link in this scope.
- No generic SecurityEvent → Incident or SecurityEvent → Event link in this reduced scope.
- Environment connects directly to ITService and ConfigurationItem; not separately to Application here.
- No direct Incident → IncidentResponseTeam link.
- No direct Incident → Regulator link; the assessment/notification path is sufficient.

We’ve now covered most of the relationship structure, but before leaving this phase I need to make sure no confirmed class is left with zero relationships.

Next focused question:
For these currently weak or standalone-looking classes, what real connection should the ontology store?
- Communication ↔ Vendor
- Communication ↔ Regulator
- Runbook ↔ ITService or Application
- RecoveryPlan ↔ ITService
- BackupSet ↔ ITService or Application
- Change ↔ ITService or ConfigurationItem

Please give the directed relationship(s) you actually use, and say “no direct link” where the connection should stay indirect.

### Turn 27 — user

Here’s what I’d store.

- Communication ↔ Vendor: no direct link.
  - If a message goes to a vendor, that is better represented through the communication’s audience and the addressed stakeholder path, rather than a vendor-specific direct edge in this scope.

- Communication ↔ Regulator: no direct link.
  - Formal regulator-facing reporting should stay as regulatory notification to regulator, not ordinary communication to regulator.

- Runbook ↔ IT service or application: no direct link in this scope.
  - The operational link we use is incident is handled with runbook.

- Recovery plan ↔ IT service:
  - recovery plan recovers IT service

- Backup set ↔ IT service or application: no direct link.
  - The cleaner model is:
    - backup set protects configuration item
    - recovery plan uses backup set

- Change ↔ IT service or configuration item:
  - change affects IT service
  - change modifies configuration item

That gives you the real operational links without overconnecting things just because they are often discussed together.

### Turn 27 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: recoversITService\n    from: RecoveryPlan\n    to: ITService\n  - name: protectsConfigurationItem\n    from: BackupSet\n    to: ConfigurationItem\n  - name: affectsITService\n    from: Change\n    to: ITService\n  - name: modifiesConfigurationItem\n    from: Change\n    to: ConfigurationItem"
}
```

### Turn 27 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 27 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 27 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by this incident?
  - id: cq2
    text: Which customer channels are impacted by this incident?
  - id: cq3
    text: Which configuration items sit on the dependency path of the affected IT service?
  - id: cq4
    text: Which third-party services sit on the dependency path of the affected IT service?
  - id: cq5
    text: Which active alerts are correlated with this incident?
  - id: cq6
    text: Which events are correlated with this incident?
  - id: cq7
    text: Who owns the affected service?
  - id: cq8
    text: Which resolver group should be assigned to this incident?
  - id: cq9
    text: Which on-call engineer should handle this incident?
  - id: cq10
    text: Does this incident meet the criteria to be treated as a major incident?
  - id: cq11
    text: Which runbook can be used safely for this case?
  - id: cq12
    text: Which workaround can be used safely for this case?
  - id: cq13
    text: Which backup set can be used safely for this case?
  - id: cq14
    text: Which recovery plan can be used safely for this case?
  - id: cq15
    text: Was this incident caused by a recent change?
  - id: cq16
    text: Is a materiality assessment complete?
  - id: cq17
    text: "Is a regulatory notification required, and when is it due?"
  - id: cq18
    text: "Are evidence integrity, stakeholder communications, and closure conditions complete?"
  - id: cq19
    text: Which stakeholders have already been notified about this incident?
  - id: cq20
    text: Which vendor should this incident be escalated to?
  - id: cq21
    text: Which corrective actions from earlier post-incident reviews remain open for the affected service?
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
    aliases:
      - configuration item
    properties: {}
  ThirdPartyService:
    meaning: null
    aliases:
      - third-party service
    properties: {}
  Alert:
    meaning: null
    aliases: []
    properties: {}
  Event:
    meaning: null
    aliases: []
    properties: {}
  BackupSet:
    meaning: null
    aliases:
      - backup set
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases:
      - recovery plan
    properties: {}
  Change:
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
  MaterialityAssessment:
    meaning: null
    aliases:
      - materiality assessment
    properties: {}
  RegulatoryNotification:
    meaning: null
    aliases:
      - regulatory notification
    properties: {}
  EvidenceItem:
    meaning: null
    aliases:
      - evidence item
    properties: {}
  Communication:
    meaning: null
    aliases:
      - communication
      - stakeholder communication
    properties: {}
  CorrectiveAction:
    meaning: null
    aliases:
      - corrective action
    properties: {}
  ServiceOwner:
    meaning: null
    aliases:
      - service owner
    properties: {}
  ResolverGroup:
    meaning: null
    aliases:
      - resolver group
    properties: {}
  OnCallEngineer:
    meaning: null
    aliases:
      - on-call engineer
    properties: {}
  IncidentCommander:
    meaning: null
    aliases:
      - incident commander
    properties: {}
  IncidentResponseTeam:
    meaning: null
    aliases:
      - incident response team
    properties: {}
  ServiceDesk:
    meaning: null
    aliases:
      - service desk
    properties: {}
  ITOperationsTeam:
    meaning: null
    aliases:
      - IT operations team
    properties: {}
  NetworkOperationsCentre:
    meaning: null
    aliases:
      - network operations centre
    properties: {}
  SecurityOperationsCentre:
    meaning: null
    aliases:
      - security operations centre
    properties: {}
  ApplicationOwner:
    meaning: null
    aliases:
      - application owner
    properties: {}
  TechnicalOwner:
    meaning: null
    aliases:
      - technical owner
    properties: {}
  BusinessOwner:
    meaning: null
    aliases:
      - business owner
    properties: {}
  Stakeholder:
    meaning: null
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  Environment:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Problem:
    meaning: null
    aliases: []
    properties: {}
  KnownError:
    meaning: null
    aliases:
      - known error
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases:
      - post-incident review
    properties: {}
  MonitoringTool:
    meaning: null
    aliases:
      - monitoring tool
    properties: {}
  SecurityEvent:
    meaning: null
    aliases:
      - security event
    properties: {}
  MonitoringRule:
    meaning: null
    aliases:
      - monitoring rule
    properties: {}
relationships:
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: runsInEnvironment
    from: ITService
    to: Environment
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: ITService
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: ownedByServiceOwner
    from: ITService
    to: ServiceOwner
    meaning: null
    aliases: []
  - name: ownedByApplicationOwner
    from: Application
    to: ApplicationOwner
    meaning: null
    aliases: []
  - name: ownedByTechnicalOwner
    from: ConfigurationItem
    to: TechnicalOwner
    meaning: null
    aliases: []
  - name: accountableToBusinessOwner
    from: BusinessService
    to: BusinessOwner
    meaning: null
    aliases: []
  - name: supportedByVendor
    from: Application
    to: Vendor
    meaning: null
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: null
    aliases: []
  - name: supportedByResolverGroup
    from: ITService
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportedByResolverGroup
    from: ConfigurationItem
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
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
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: supportedByEvidenceItem
    from: Incident
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: recoveredWithRecoveryPlan
    from: Incident
    to: RecoveryPlan
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: null
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: reviewedInPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: null
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: notifiesStakeholder
    from: Incident
    to: Stakeholder
    meaning: null
    aliases: []
  - name: aboutIncident
    from: Communication
    to: Incident
    meaning: null
    aliases: []
  - name: addressedToStakeholder
    from: Communication
    to: Stakeholder
    meaning: null
    aliases: []
  - name: memberOfIncidentResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: null
    aliases: []
  - name: recordedByServiceDesk
    from: Incident
    to: ServiceDesk
    meaning: null
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: operatesItservice
    from: ITOperationsTeam
    to: ITService
    meaning: null
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperationsCentre
    to: MonitoringTool
    meaning: null
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperationsCentre
    to: SecurityEvent
    meaning: null
    aliases: []
  - name: executedByMonitoringTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: null
    aliases: []
  - name: generatedByMonitoringRule
    from: Alert
    to: MonitoringRule
    meaning: null
    aliases: []
  - name: deployedInEnvironment
    from: ITService
    to: Environment
    meaning: null
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: null
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
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
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: An alert is acknowledged so responders can see it has been taken up.
    verification: Confirm the alert shows as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: The incident is assigned to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: The incident is marked and handled as a major incident.
    verification: Confirm the incident shows major-incident handling has been initiated.
  containIncident:
    input: null
    preconditions: []
    effect: Containment actions are recorded and the incident is put under control.
    verification: Confirm the incident record shows containment has been performed.
  isolateAffectedConfigurationItem:
    input: null
    preconditions: []
    effect: The affected configuration item is deliberately isolated from relevant networks or dependencies.
    verification: Confirm the configuration item shows as isolated or disconnected as intended.
  failOverAffectedServiceToRecoveryEnvironment:
    input: null
    preconditions: []
    effect: The affected service is failed over to its recovery environment.
    verification: Confirm the service is operating from the recovery environment.
  restoreDataFromBackup:
    input: null
    preconditions: []
    effect: Data is restored from the selected backup set.
    verification: Confirm the restored data is available and matches the intended restore point.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: The emergency change is executed.
    verification: Confirm the change record and affected target reflect the executed change.
  sendStakeholderCommunication:
    input: null
    preconditions: []
    effect: A stakeholder communication is issued for the incident.
    verification: Confirm the communication was sent and recorded against the incident.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: A regulatory notification is submitted.
    verification: Confirm the notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: The incident is closed.
    verification: Confirm the incident status shows closed.


# CONSISTENCY CHECK — 11 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverAffectedServiceToRecoveryEnvironment" has no input class.
#   [error] action-input-missing — Action "isolateAffectedConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreDataFromBackup" has no input class.
#   [error] action-input-missing — Action "sendStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.

### Turn 27 — assistant

Good — that closes another set of relationship gaps.

Short recap of Phase 3 so far: we now have impact, dependency, ownership, routing, evidence/governance, command, notification, monitoring, environment, recovery, and change relationships captured. You also explicitly avoided several over-forced direct links where the real operational path is indirect.

One class-level gap still stands out from the live graph check:
**Event currently only connects from Incident, but nothing connects onward from Event.** Since you explicitly said not to force Event → MonitoringTool, I need the real connection you do want.

Focused question:
What real relationship should Event have in this ontology?  
For example, is an Event:
- produced by a ConfigurationItem,
- observed on an ITService,
- derived from a MonitoringRule,
- recorded by a MonitoringTool,
- or something else?

Please give the real directed relationship(s) you actually use, or tell me if Event should be removed as a separate class.

### Turn 28 — user

Keep event as a separate class.

The real connections I’d use are:

- event is observed on configuration item
- event relates to IT service

That is enough for the incident-correlation question without forcing a monitoring-tool lineage that we do not actually need in this scope.

### Turn 28 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: observedOnConfigurationItem\n    from: Event\n    to: ConfigurationItem\n  - name: relatesToITService\n    from: Event\n    to: ITService"
}
```

### Turn 28 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 28 — assistant

Recorded.

Short recap: Event stays as its own class, connected by Event → ConfigurationItem and Event → ITService, which gives enough structure for your incident-correlation question without inventing an unnecessary monitoring-tool path.

Next phase is decision-bearing properties. We’ll add only values that help identify, filter, compare, decide, explain, or act.

First focused property batch on the most central tracked classes:
For these classes, which decision-relevant properties does the agent actually need?
- Incident
- Alert
- Change
- RegulatoryNotification
- MaterialityAssessment

Please list only properties that are used to answer one of your accepted questions or to perform one of your accepted actions. If a property has a small fixed set of values, you can mention that too, but the key thing right now is which properties are genuinely needed.

### Turn 29 — user

For those classes, these are the properties I’d keep because they actually drive operational decisions.

**Incident**
- summary
- description
- detected at
- opened at
- resolved at
- closed at
- status
- severity
- priority
- impact
- urgency
- category
- detection source
- recurring
- time to acknowledge
- time to restore

**Alert**
- raised at
- summary
- status
- severity
- detection source
- occurrence count

**Change**
- summary
- status
- risk level
- planned start
- planned end
- implementation plan
- backout plan

**Regulatory notification**
- due at
- submitted at
- status

**Materiality assessment**
- assessed at
- result
- rationale
- reporting due time

Those are the ones that matter for triage, assignment, major-incident handling, communication, emergency change, regulatory handling, and closure.

### Turn 29 — assistant

Good, and the justification is clear.

Before I record these, I need one focused check on a likely overreach:
For **Incident**, do you want both **impact** and **severity** and **priority** and **urgency** as separate properties in this ontology, with each used differently by the agent?  
These terms are often collapsed in practice, but you may mean distinct things. Please give a one-line distinction for each of the four, or tell me which should merge.

### Turn 30 — user

Keep all four separate.

- **Impact** — how broad or serious the business or service effect is.
- **Severity** — how operationally serious the incident is right now.
- **Priority** — the response precedence the organization gives it.
- **Urgency** — how quickly action is needed.

In practice they influence each other, but they are not the same decision. For example, a case can have limited current impact but very high urgency if it is likely to spread or trigger a hard deadline.

### Turn 30 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      summary:\n        type: text\n      description:\n        type: text\n      detectedAt:\n        type: date\n      openedAt:\n        type: date\n      resolvedAt:\n        type: date\n      closedAt:\n        type: date\n      status:\n        type: text\n      severity:\n        type: text\n      priority:\n        type: text\n      impact:\n        type: text\n      urgency:\n        type: text\n      category:\n        type: text\n      detectionSource:\n        type: text\n      recurring:\n        type: boolean\n      timeToAcknowledge:\n        type: number\n      timeToRestore:\n        type: number\n  Alert:\n    properties:\n      raisedAt:\n        type: date\n      summary:\n        type: text\n      status:\n        type: text\n      severity:\n        type: text\n      detectionSource:\n        type: text\n      occurrenceCount:\n        type: number\n  Change:\n    properties:\n      summary:\n        type: text\n      status:\n        type: text\n      riskLevel:\n        type: text\n      plannedStart:\n        type: date\n      plannedEnd:\n        type: date\n      implementationPlan:\n        type: text\n      backoutPlan:\n        type: text\n  RegulatoryNotification:\n    properties:\n      dueAt:\n        type: date\n      submittedAt:\n        type: date\n      status:\n        type: text\n  MaterialityAssessment:\n    properties:\n      assessedAt:\n        type: date\n      result:\n        type: text\n      rationale:\n        type: text\n      reportingDueTime:\n        type: date"
}
```

### Turn 30 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 30 — assistant

Recorded.

Short recap: we now have decision-bearing properties on Incident, Alert, Change, RegulatoryNotification, and MaterialityAssessment. You also explicitly confirmed that impact, severity, priority, and urgency are distinct operational concepts and should stay separate.

Next property batch, for classes used in routing, recovery, closure, and communications:
Which decision-relevant properties does the agent need on these classes?
- ITService
- ConfigurationItem
- RecoveryPlan
- BackupSet
- Communication
- EvidenceItem

Again, please include only properties that help answer an accepted question or perform an accepted action.

### Turn 31 — user

For this batch, I’d keep these.

**IT service**
- name
- description
- criticality tier
- health state
- availability target

**Configuration item**
- name
- version
- criticality tier

**Recovery plan**
- recovery time objective
- recovery point objective
- last review date

**Backup set**
- status
- last successful backup
- last verification

**Communication**
- sent at
- audience
- status
- message summary

**Evidence item**
- collected at
- integrity status
- cryptographic hash

Those are the properties that matter for service impact, recovery choice, backup suitability, communication handling, and evidence integrity.

### Turn 31 — assistant

Good. One focused check before I record them:

For **ITService health state**, **BackupSet status**, **Communication status**, and **EvidenceItem integrity status**, do these represent small fixed value sets in your operating model?  
If yes, please give the allowed values now for those four properties only.

### Turn 32 — user

Yes, those are controlled value sets.

**IT service health state**
- healthy
- degraded
- partially-unavailable
- unavailable
- recovering
- unknown

**Backup set status**
- scheduled
- running
- successful
- failed
- expired
- corrupted
- verified

**Communication status**
- draft
- pending-approval
- approved
- submitted
- accepted
- rejected
- withdrawn

**Evidence item integrity status**
- collected
- hashed
- verified
- sealed
- compromised

### Turn 32 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ITService:\n    properties:\n      name:\n        type: text\n      description:\n        type: text\n      criticalityTier:\n        type: text\n      healthState:\n        type: text\n        allowed: [healthy, degraded, partially-unavailable, unavailable, recovering, unknown]\n      availabilityTarget:\n        type: text\n  ConfigurationItem:\n    properties:\n      name:\n        type: text\n      version:\n        type: text\n      criticalityTier:\n        type: text\n  RecoveryPlan:\n    properties:\n      recoveryTimeObjective:\n        type: text\n      recoveryPointObjective:\n        type: text\n      lastReviewDate:\n        type: date\n  BackupSet:\n    properties:\n      status:\n        type: text\n        allowed: [scheduled, running, successful, failed, expired, corrupted, verified]\n      lastSuccessfulBackup:\n        type: date\n      lastVerification:\n        type: date\n  Communication:\n    properties:\n      sentAt:\n        type: date\n      audience:\n        type: text\n      status:\n        type: text\n        allowed: [draft, pending-approval, approved, submitted, accepted, rejected, withdrawn]\n      messageSummary:\n        type: text\n  EvidenceItem:\n    properties:\n      collectedAt:\n        type: date\n      integrityStatus:\n        type: text\n        allowed: [collected, hashed, verified, sealed, compromised]\n      cryptographicHash:\n        type: text"
}
```

### Turn 32 — tool

Applied. Added 0, updated 6 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 32 — assistant

Recorded.

Short recap: we added recovery, backup, communication, evidence, service, and configuration-item properties, and we captured fixed allowed values for ITService.healthState, BackupSet.status, Communication.status, and EvidenceItem.integrityStatus.

Next property batch, focused on classes used for routing, ownership, and follow-up:
Which decision-relevant properties does the agent need on these classes?
- ResolverGroup
- OnCallEngineer
- Vendor
- Stakeholder
- CorrectiveAction
- PostIncidentReview

Please include only properties that help the agent route, decide, explain, or act on your accepted questions/actions.

### Turn 33 — user

For this set, I’d keep only what actually helps operational decisions.

**Resolver group**
- no additional decision property I’d insist on in this scope

**On-call engineer**
- no additional decision property I’d insist on in this scope

**Vendor**
- legal name
- criticality tier
- critical provider

**Stakeholder**
- name
- audience type

**Corrective action**
- action description
- status
- due date

**Post-incident review**
- held on
- findings

For resolver group and on-call engineer, the key operational value in this scope is really in the relationships — what they support, who is a member, and who is assigned — rather than extra standalone properties.

### Turn 33 — assistant

That makes sense.

One focused check before I record them:
For **Vendor critical provider**, is that a true decision-bearing property needed by one of your accepted questions/actions here, or is it just generally important background?  
If it is needed here, tell me which accepted question or action it helps answer or perform.

### Turn 34 — user

It is generally important background, but I would not insist on it for the accepted question and action set you have captured so far.

So for this scope, you can leave **critical provider** out without losing the core operational capabilities we listed.

### Turn 34 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Vendor:\n    properties:\n      legalName:\n        type: text\n      criticalityTier:\n        type: text\n  Stakeholder:\n    properties:\n      name:\n        type: text\n      audienceType:\n        type: text\n  CorrectiveAction:\n    properties:\n      actionDescription:\n        type: text\n      status:\n        type: text\n      dueDate:\n        type: date\n  PostIncidentReview:\n    properties:\n      heldOn:\n        type: date\n      findings:\n        type: text"
}
```

### Turn 34 — tool

Applied. Added 0, updated 4 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 34 — assistant

Recorded, and I left out Vendor.criticalProvider as you directed.

Short recap: for routing classes, you chose to rely on relationships rather than extra properties; for Vendor, Stakeholder, CorrectiveAction, and PostIncidentReview, we added only the properties that directly support your accepted questions/actions.

Next property question, still within Phase 4:
Some of your central tracked classes represent things the agent monitors or reports on over time, so they may need their own current-state/status property if they don’t already have one.

For each of these, do you want a current-state/status-style property?
- ITService
- ConfigurationItem
- RecoveryPlan
- MaterialityAssessment
- CorrectiveAction
- PostIncidentReview
- RegulatoryNotification

Please answer keep/remove for a status/current-state property on each, and if kept, give the property name if it should differ from plain “status.”

### Turn 35 — user

Here’s how I’d handle them.

- **IT service** — keep, but the property should be **health state**, not plain status.
- **Configuration item** — remove for this scope.
- **Recovery plan** — remove for this scope.
- **Materiality assessment** — keep, but the property is better named **result** rather than status.
- **Corrective action** — keep as **status**.
- **Post-incident review** — remove for this scope.
- **Regulatory notification** — keep as **status**.

### Turn 35 — assistant

Confirmed.

Short recap: the live model already has the kept state-bearing properties where you want them — ITService.healthState, MaterialityAssessment.result, CorrectiveAction.status, and RegulatoryNotification.status. You explicitly do not want a separate current-state/status property for ConfigurationItem, RecoveryPlan, or PostIncidentReview in this scope.

Now we move to the language layer: plain meanings and aliases. This is important because right now the classes and relationships exist structurally, but most still have no meaning sentence.

First meanings batch for classes:
Please give a one-sentence plain-language meaning for these 8 classes:
- Incident
- ITService
- BusinessService
- CustomerChannel
- ConfigurationItem
- Application
- ThirdPartyService
- Environment

One short sentence each is enough.

### Turn 36 — user

- **Incident** — An incident is an unplanned interruption, degradation, or security condition that requires managed response.
- **IT service** — An IT service is a managed technology capability that supports one or more business services.
- **Business service** — A business service is a customer-facing or business-facing capability delivered by the bank.
- **Customer channel** — A customer channel is a route through which customers access banking services.
- **Configuration item** — A configuration item is a managed component within the bank’s configuration-management scope.
- **Application** — An application is a software system that delivers business or operational functionality.
- **Third-party service** — A third-party service is an externally provided service that the bank depends on.
- **Environment** — An environment is a deployment context such as production, test, development, or disaster recovery.

### Turn 36 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    meaning: An incident is an unplanned interruption, degradation, or security condition that requires managed response.\n  ITService:\n    meaning: An IT service is a managed technology capability that supports one or more business services.\n  BusinessService:\n    meaning: A business service is a customer-facing or business-facing capability delivered by the bank.\n  CustomerChannel:\n    meaning: A customer channel is a route through which customers access banking services.\n  ConfigurationItem:\n    meaning: A configuration item is a managed component within the bank’s configuration-management scope.\n  Application:\n    meaning: An application is a software system that delivers business or operational functionality.\n  ThirdPartyService:\n    meaning: A third-party service is an externally provided service that the bank depends on.\n  Environment:\n    meaning: An environment is a deployment context such as production, test, development, or disaster recovery."
}
```

### Turn 36 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 36 — assistant

Recorded.

Short recap: the core operational and impact classes now have plain-language meaning sentences.

Next meanings batch for classes:
Please give a one-sentence plain-language meaning for these 8 classes:
- Alert
- Event
- SecurityEvent
- MonitoringTool
- MonitoringRule
- Change
- Runbook
- Workaround

One short sentence each.

### Turn 37 — user

- **Alert** — An alert is a monitoring or security signal that requires triage or acknowledgement.
- **Event** — An event is a time-stamped observation of a state change or other noteworthy occurrence.
- **Security event** — A security event is an event relevant to confidentiality, integrity, availability, authenticity, or cyber threat activity.
- **Monitoring tool** — A monitoring tool is a platform that collects telemetry and evaluates operational conditions.
- **Monitoring rule** — A monitoring rule is a defined condition that evaluates telemetry and may generate an alert.
- **Change** — A change is a controlled addition, modification, or removal that may affect an IT service.
- **Runbook** — A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification.
- **Workaround** — A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.

### Turn 37 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    meaning: An alert is a monitoring or security signal that requires triage or acknowledgement.\n  Event:\n    meaning: An event is a time-stamped observation of a state change or other noteworthy occurrence.\n  SecurityEvent:\n    meaning: A security event is an event relevant to confidentiality, integrity, availability, authenticity, or cyber threat activity.\n  MonitoringTool:\n    meaning: A monitoring tool is a platform that collects telemetry and evaluates operational conditions.\n  MonitoringRule:\n    meaning: A monitoring rule is a defined condition that evaluates telemetry and may generate an alert.\n  Change:\n    meaning: A change is a controlled addition, modification, or removal that may affect an IT service.\n  Runbook:\n    meaning: A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification.\n  Workaround:\n    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem."
}
```

### Turn 37 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 37 — assistant

Recorded.

Short recap: the monitoring, event, change, and response-artifact classes now have meaning sentences.

Next meanings batch for classes:
Please give a one-sentence plain-language meaning for these 8 classes:
- RecoveryPlan
- BackupSet
- MaterialityAssessment
- RegulatoryNotification
- EvidenceItem
- Communication
- Problem
- KnownError

One short sentence each.

### Turn 38 — user

- **Recovery plan** — A recovery plan is a documented plan for restoring an IT service and its dependencies.
- **Backup set** — A backup set is a defined collection of recoverable backup data for protected components.
- **Materiality assessment** — A materiality assessment is a documented determination of incident significance and reporting implications.
- **Regulatory notification** — A regulatory notification is a formal incident-related submission to a competent authority.
- **Evidence item** — An evidence item is a preserved record, artifact, or observation that supports incident analysis and accountability.
- **Communication** — A communication is a controlled message sent to operational, business, customer, vendor, or regulatory audiences.
- **Problem** — A problem is the underlying cause or potential cause of one or more incidents.
- **Known error** — A known error is a diagnosed problem with a documented cause or workaround.

### Turn 38 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  RecoveryPlan:\n    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.\n  BackupSet:\n    meaning: A backup set is a defined collection of recoverable backup data for protected components.\n  MaterialityAssessment:\n    meaning: A materiality assessment is a documented determination of incident significance and reporting implications.\n  RegulatoryNotification:\n    meaning: A regulatory notification is a formal incident-related submission to a competent authority.\n  EvidenceItem:\n    meaning: An evidence item is a preserved record, artifact, or observation that supports incident analysis and accountability.\n  Communication:\n    meaning: A communication is a controlled message sent to operational, business, customer, vendor, or regulatory audiences.\n  Problem:\n    meaning: A problem is the underlying cause or potential cause of one or more incidents.\n  KnownError:\n    meaning: A known error is a diagnosed problem with a documented cause or workaround."
}
```

### Turn 38 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 38 — assistant

Recorded.

Short recap: the recovery, reporting, evidence, communication, and diagnosis classes now have meaning sentences.

Next meanings batch for classes:
Please give a one-sentence plain-language meaning for these 8 classes:
- CorrectiveAction
- PostIncidentReview
- ServiceOwner
- ApplicationOwner
- TechnicalOwner
- BusinessOwner
- ResolverGroup
- OnCallEngineer

One short sentence each.

### Turn 39 — user

- **Corrective action** — A corrective action is a tracked action intended to remove a cause, reduce risk, or improve response capability.
- **Post-incident review** — A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work.
- **Service owner** — A service owner is the role accountable for an IT service across its lifecycle.
- **Application owner** — An application owner is the role accountable for an application and its operational fitness.
- **Technical owner** — A technical owner is the role accountable for the engineering and maintenance of a configuration item.
- **Business owner** — A business owner is the business role accountable for a business service or process.
- **Resolver group** — A resolver group is the team assigned to diagnose and restore a specific technology or service area.
- **On-call engineer** — An on-call engineer is a technical specialist available for time-critical operational response.

### Turn 39 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CorrectiveAction:\n    meaning: A corrective action is a tracked action intended to remove a cause, reduce risk, or improve response capability.\n  PostIncidentReview:\n    meaning: A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work.\n  ServiceOwner:\n    meaning: A service owner is the role accountable for an IT service across its lifecycle.\n  ApplicationOwner:\n    meaning: An application owner is the role accountable for an application and its operational fitness.\n  TechnicalOwner:\n    meaning: A technical owner is the role accountable for the engineering and maintenance of a configuration item.\n  BusinessOwner:\n    meaning: A business owner is the business role accountable for a business service or process.\n  ResolverGroup:\n    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.\n  OnCallEngineer:\n    meaning: An on-call engineer is a technical specialist available for time-critical operational response."
}
```

### Turn 39 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 39 — assistant

Recorded.

Short recap: the ownership, routing, follow-up, and review classes now have meaning sentences.

Next meanings batch for classes:
Please give a one-sentence plain-language meaning for these 7 classes:
- IncidentCommander
- IncidentResponseTeam
- ServiceDesk
- ITOperationsTeam
- NetworkOperationsCentre
- SecurityOperationsCentre
- Stakeholder

One short sentence each.

### Turn 40 — user

- **Incident commander** — An incident commander is the person accountable for command, coordination, and decision cadence during a major incident.
- **Incident response team** — An incident response team is the cross-functional team responsible for coordinating significant incident response.
- **Service desk** — A service desk is the first-line function that receives, records, triages, and routes user-reported issues.
- **IT operations team** — An IT operations team is the team responsible for reliable day-to-day operation of IT services.
- **Network operations centre** — A network operations centre is the function that monitors and operates network and infrastructure services.
- **Security operations centre** — A security operations centre is the function that monitors, investigates, and coordinates response to cyber threats.
- **Stakeholder** — A stakeholder is a person, group, or organization affected by or responsible for an operational outcome.

### Turn 40 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  IncidentCommander:\n    meaning: An incident commander is the person accountable for command, coordination, and decision cadence during a major incident.\n  IncidentResponseTeam:\n    meaning: An incident response team is the cross-functional team responsible for coordinating significant incident response.\n  ServiceDesk:\n    meaning: A service desk is the first-line function that receives, records, triages, and routes user-reported issues.\n  ITOperationsTeam:\n    meaning: An IT operations team is the team responsible for reliable day-to-day operation of IT services.\n  NetworkOperationsCentre:\n    meaning: A network operations centre is the function that monitors and operates network and infrastructure services.\n  SecurityOperationsCentre:\n    meaning: A security operations centre is the function that monitors, investigates, and coordinates response to cyber threats.\n  Stakeholder:\n    meaning: A stakeholder is a person, group, or organization affected by or responsible for an operational outcome."
}
```

### Turn 40 — tool

Applied. Added 0, updated 7 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 40 — assistant

Recorded.

Short recap: the command, operations, and stakeholder classes now have meaning sentences.

Next meanings batch for the last 2 classes:
Please give a one-sentence plain-language meaning for:
- Vendor
- Regulator

And in the same reply, tell me whether either has any important alias you want captured beyond the exact names already in the model.

### Turn 41 — user

- **Vendor** — A vendor is an external organization that supplies or supports technology or services.
- **Regulator** — A regulator is a competent authority that supervises the bank or receives required notifications.

Useful aliases to capture:
- **Vendor** — supplier, external supplier, third-party provider
- **Regulator** — supervisory authority, competent authority

### Turn 41 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Vendor:\n    meaning: A vendor is an external organization that supplies or supports technology or services.\n    aliases: [supplier, external supplier, third-party provider]\n  Regulator:\n    meaning: A regulator is a competent authority that supervises the bank or receives required notifications.\n    aliases: [supervisory authority, competent authority]"
}
```

### Turn 41 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 41 — assistant

Recorded.

Short recap: every class should now either already have a meaning sentence or be very close; Vendor and Regulator now also have explicit aliases.

Next part of the language layer: relationship meanings.

Please give a one-sentence plain-language meaning for these 8 relationships:
- impactsBusinessService
- deliveredThrough
- impactsITService
- implementedBy
- dependsOnThirdPartyService
- runsOnConfigurationItem
- ownedByServiceOwner
- supportedByResolverGroup

One short sentence each is enough.

### Turn 42 — user

- **Impacts business service** — This links an incident to a business service whose operation is affected by the incident.
- **Delivered through** — This links a business service to the customer channel through which the service is provided.
- **Impacts IT service** — This links an incident to an IT service whose operation is affected by the incident.
- **Implemented by** — This links an IT service to the application that delivers that technical capability.
- **Depends on third-party service** — This links an IT service to an external service it relies on.
- **Runs on configuration item** — This links an IT service to the technical component it runs on.
- **Owned by service owner** — This links an IT service to the role accountable for it across its lifecycle.
- **Supported by resolver group** — This links an affected service or configuration item to the resolver group that supports it for operational handling.

### Turn 42 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: impactsBusinessService\n    from: Incident\n    to: BusinessService\n    meaning: This links an incident to a business service whose operation is affected by the incident.\n  - name: deliveredThrough\n    from: BusinessService\n    to: CustomerChannel\n    meaning: This links a business service to the customer channel through which the service is provided.\n  - name: impactsItservice\n    from: Incident\n    to: ITService\n    meaning: This links an incident to an IT service whose operation is affected by the incident.\n  - name: implementedBy\n    from: ITService\n    to: Application\n    meaning: This links an IT service to the application that delivers that technical capability.\n  - name: dependsOnThirdPartyService\n    from: ITService\n    to: ThirdPartyService\n    meaning: This links an IT service to an external service it relies on.\n  - name: runsOnConfigurationItem\n    from: ITService\n    to: ConfigurationItem\n    meaning: This links an IT service to the technical component it runs on.\n  - name: ownedByServiceOwner\n    from: ITService\n    to: ServiceOwner\n    meaning: This links an IT service to the role accountable for it across its lifecycle.\n  - name: supportedByResolverGroup\n    from: ITService\n    to: ResolverGroup\n    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling.\n  - name: supportedByResolverGroup\n    from: ConfigurationItem\n    to: ResolverGroup\n    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling."
}
```

### Turn 42 — tool

Applied. Added 0, updated 9 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 42 — assistant

Recorded.

Short recap: the first backbone relationships now have plain-language meanings, including both supportedByResolverGroup variants.

Next relationship-meaning batch:
Please give a one-sentence plain-language meaning for these 8 relationships:
- assignedToResolverGroup
- handledByOnCallEngineer
- memberOfResolverGroup
- triggeredByAlert
- correlatedFromEvent
- handledWithRunbook
- evaluatedByMaterialityAssessment
- recoveredWithRecoveryPlan

One short sentence each.

### Turn 43 — user

- **Assigned to resolver group** — This links an incident to the resolver group responsible for diagnosing and restoring it.
- **Handled by on-call engineer** — This links an incident to the on-call engineer currently handling the time-critical response.
- **Member of resolver group** — This links an on-call engineer to the resolver group they belong to.
- **Triggered by alert** — This links an incident to the alert that opened or initiated it.
- **Correlated from event** — This links an incident to an event that has been correlated into the incident record.
- **Handled with runbook** — This links an incident to the runbook used to diagnose, respond to, recover, or verify it.
- **Evaluated by materiality assessment** — This links an incident to the assessment that determines its significance and reporting implications.
- **Recovered with recovery plan** — This links an incident to the recovery plan used to restore the affected service.

### Turn 43 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: assignedToResolverGroup\n    from: Incident\n    to: ResolverGroup\n    meaning: This links an incident to the resolver group responsible for diagnosing and restoring it.\n  - name: handledByOnCallEngineer\n    from: Incident\n    to: OnCallEngineer\n    meaning: This links an incident to the on-call engineer currently handling the time-critical response.\n  - name: memberOfResolverGroup\n    from: OnCallEngineer\n    to: ResolverGroup\n    meaning: This links an on-call engineer to the resolver group they belong to.\n  - name: triggeredByAlert\n    from: Incident\n    to: Alert\n    meaning: This links an incident to the alert that opened or initiated it.\n  - name: correlatedFromEvent\n    from: Incident\n    to: Event\n    meaning: This links an incident to an event that has been correlated into the incident record.\n  - name: handledWithRunbook\n    from: Incident\n    to: Runbook\n    meaning: This links an incident to the runbook used to diagnose, respond to, recover, or verify it.\n  - name: evaluatedByMaterialityAssessment\n    from: Incident\n    to: MaterialityAssessment\n    meaning: This links an incident to the assessment that determines its significance and reporting implications.\n  - name: recoveredWithRecoveryPlan\n    from: Incident\n    to: RecoveryPlan\n    meaning: This links an incident to the recovery plan used to restore the affected service."
}
```

### Turn 43 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 43 — assistant

Recorded.

Short recap: the main incident-routing, correlation, and recovery relationships now have meaning sentences too.

Next relationship-meaning batch:
Please give a one-sentence plain-language meaning for these 8 relationships:
- linkedToProblem
- documentedByKnownError
- hasWorkaround
- usesBackupSet
- triggersRegulatoryNotification
- reviewedInPostIncidentReview
- producesCorrectiveAction
- sentToRegulator

One short sentence each.

### Turn 44 — user

- **Linked to problem** — This links an incident to the underlying cause record associated with it.
- **Documented by known error** — This links a problem to the known error record that captures its diagnosed cause or workaround.
- **Has workaround** — This links a known error to the workaround that can reduce or bypass its impact.
- **Uses backup set** — This links a recovery plan to the backup set used during restoration.
- **Triggers regulatory notification** — This links a materiality assessment to the regulatory notification required by its outcome.
- **Reviewed in post-incident review** — This links an incident to the formal review of its causes, response, lessons, and follow-up.
- **Produces corrective action** — This links a post-incident review to the corrective actions raised from it.
- **Sent to regulator** — This links a regulatory notification to the regulator that receives it.

### Turn 44 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: linkedToProblem\n    from: Incident\n    to: Problem\n    meaning: This links an incident to the underlying cause record associated with it.\n  - name: documentedByKnownError\n    from: Problem\n    to: KnownError\n    meaning: This links a problem to the known error record that captures its diagnosed cause or workaround.\n  - name: hasWorkaround\n    from: KnownError\n    to: Workaround\n    meaning: This links a known error to the workaround that can reduce or bypass its impact.\n  - name: usesBackupSet\n    from: RecoveryPlan\n    to: BackupSet\n    meaning: This links a recovery plan to the backup set used during restoration.\n  - name: triggersRegulatoryNotification\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n    meaning: This links a materiality assessment to the regulatory notification required by its outcome.\n  - name: reviewedInPostIncidentReview\n    from: Incident\n    to: PostIncidentReview\n    meaning: This links an incident to the formal review of its causes, response, lessons, and follow-up.\n  - name: producesCorrectiveAction\n    from: PostIncidentReview\n    to: CorrectiveAction\n    meaning: This links a post-incident review to the corrective actions raised from it.\n  - name: sentToRegulator\n    from: RegulatoryNotification\n    to: Regulator\n    meaning: This links a regulatory notification to the regulator that receives it."
}
```

### Turn 44 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 44 — assistant

Recorded.

Short recap: the diagnosis, workaround, backup, regulatory, review, and follow-up relationships now have meanings.

Next relationship-meaning batch:
Please give a one-sentence plain-language meaning for these 8 relationships:
- notifiesStakeholder
- aboutIncident
- addressedToStakeholder
- coordinatedByIncidentCommander
- memberOfIncidentResponseTeam
- recordedByServiceDesk
- escalatedToVendor
- supportedByVendor

One short sentence each.

### Turn 45 — user

- **Notifies stakeholder** — This links an incident to a stakeholder who must receive or has received incident-related notification.
- **About incident** — This links a communication to the incident the message concerns.
- **Addressed to stakeholder** — This links a communication to the stakeholder it is directed to.
- **Coordinated by incident commander** — This links an incident to the person responsible for command and coordination during major-incident handling.
- **Member of incident response team** — This links an incident commander to the incident response team they are part of.
- **Recorded by service desk** — This links an incident to the service desk that received and recorded it.
- **Escalated to vendor** — This links an incident to the vendor engaged for external support or resolution.
- **Supported by vendor** — This links an application to the vendor that supplies support for it.

### Turn 45 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: notifiesStakeholder\n    from: Incident\n    to: Stakeholder\n    meaning: This links an incident to a stakeholder who must receive or has received incident-related notification.\n  - name: aboutIncident\n    from: Communication\n    to: Incident\n    meaning: This links a communication to the incident the message concerns.\n  - name: addressedToStakeholder\n    from: Communication\n    to: Stakeholder\n    meaning: This links a communication to the stakeholder it is directed to.\n  - name: coordinatedByIncidentCommander\n    from: Incident\n    to: IncidentCommander\n    meaning: This links an incident to the person responsible for command and coordination during major-incident handling.\n  - name: memberOfIncidentResponseTeam\n    from: IncidentCommander\n    to: IncidentResponseTeam\n    meaning: This links an incident commander to the incident response team they are part of.\n  - name: recordedByServiceDesk\n    from: Incident\n    to: ServiceDesk\n    meaning: This links an incident to the service desk that received and recorded it.\n  - name: escalatedToVendor\n    from: Incident\n    to: Vendor\n    meaning: This links an incident to the vendor engaged for external support or resolution.\n  - name: supportedByVendor\n    from: Application\n    to: Vendor\n    meaning: This links an application to the vendor that supplies support for it."
}
```

### Turn 45 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 45 — assistant

Recorded.

Short recap: communication, command, recording, escalation, and application-support relationships now have meaning sentences.

Next relationship-meaning batch:
Please give a one-sentence plain-language meaning for these 8 relationships:
- providedByVendor
- accountableToBusinessOwner
- ownedByApplicationOwner
- ownedByTechnicalOwner
- operatesITService
- operatesMonitoringTool
- monitorsSecurityEvent
- generatedByMonitoringRule

One short sentence each.

### Turn 46 — user

- **Provided by vendor** — This links a third-party service to the vendor that provides it.
- **Accountable to business owner** — This links a business service to the business role accountable for it.
- **Owned by application owner** — This links an application to the role accountable for its operational fitness.
- **Owned by technical owner** — This links a configuration item to the role accountable for its engineering and maintenance.
- **Operates IT service** — This links the IT operations team to the IT services it runs day to day.
- **Operates monitoring tool** — This links the network operations centre to the monitoring tools it operates.
- **Monitors security event** — This links the security operations centre to the security events it monitors and investigates.
- **Generated by monitoring rule** — This links an alert to the monitoring rule that created it.

### Turn 46 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: providedByVendor\n    from: ThirdPartyService\n    to: Vendor\n    meaning: This links a third-party service to the vendor that provides it.\n  - name: accountableToBusinessOwner\n    from: BusinessService\n    to: BusinessOwner\n    meaning: This links a business service to the business role accountable for it.\n  - name: ownedByApplicationOwner\n    from: Application\n    to: ApplicationOwner\n    meaning: This links an application to the role accountable for its operational fitness.\n  - name: ownedByTechnicalOwner\n    from: ConfigurationItem\n    to: TechnicalOwner\n    meaning: This links a configuration item to the role accountable for its engineering and maintenance.\n  - name: operatesItservice\n    from: ITOperationsTeam\n    to: ITService\n    meaning: This links the IT operations team to the IT services it runs day to day.\n  - name: operatesMonitoringTool\n    from: NetworkOperationsCentre\n    to: MonitoringTool\n    meaning: This links the network operations centre to the monitoring tools it operates.\n  - name: monitorsSecurityEvent\n    from: SecurityOperationsCentre\n    to: SecurityEvent\n    meaning: This links the security operations centre to the security events it monitors and investigates.\n  - name: generatedByMonitoringRule\n    from: Alert\n    to: MonitoringRule\n    meaning: This links an alert to the monitoring rule that created it."
}
```

### Turn 46 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 46 — assistant

Recorded.

Short recap: ownership, provision, operations, and alert-generation relationships now have meanings.

Next relationship-meaning batch:
Please give a one-sentence plain-language meaning for these 8 relationships:
- executedByMonitoringTool
- observedOnConfigurationItem
- relatesToITService
- deployedInEnvironment
- belongsToEnvironment
- recoversITService
- protectsConfigurationItem
- affectsITService

One short sentence each.

### Turn 47 — user

- **Executed by monitoring tool** — This links a monitoring rule to the monitoring tool that runs it.
- **Observed on configuration item** — This links an event to the configuration item where the state change or occurrence was observed.
- **Relates to IT service** — This links an event to the IT service it is relevant to.
- **Deployed in environment** — This links an IT service to the environment where it is deployed.
- **Belongs to environment** — This links a configuration item to the environment it belongs to.
- **Recovers IT service** — This links a recovery plan to the IT service it is intended to restore.
- **Protects configuration item** — This links a backup set to the configuration item whose data or state it protects.
- **Affects IT service** — This links a change to the IT service that may be altered or impacted by the change.

### Turn 47 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: executedByMonitoringTool\n    from: MonitoringRule\n    to: MonitoringTool\n    meaning: This links a monitoring rule to the monitoring tool that runs it.\n  - name: observedOnConfigurationItem\n    from: Event\n    to: ConfigurationItem\n    meaning: This links an event to the configuration item where the state change or occurrence was observed.\n  - name: relatesToITService\n    from: Event\n    to: ITService\n    meaning: This links an event to the IT service it is relevant to.\n  - name: deployedInEnvironment\n    from: ITService\n    to: Environment\n    meaning: This links an IT service to the environment where it is deployed.\n  - name: belongsToEnvironment\n    from: ConfigurationItem\n    to: Environment\n    meaning: This links a configuration item to the environment it belongs to.\n  - name: recoversItservice\n    from: RecoveryPlan\n    to: ITService\n    meaning: This links a recovery plan to the IT service it is intended to restore.\n  - name: protectsConfigurationItem\n    from: BackupSet\n    to: ConfigurationItem\n    meaning: This links a backup set to the configuration item whose data or state it protects.\n  - name: affectsItservice\n    from: Change\n    to: ITService\n    meaning: This links a change to the IT service that may be altered or impacted by the change."
}
```

### Turn 47 — tool

Applied. Added 1, updated 7 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] duplicate-edge — Relationship Event --relatesToItservice--> ITService is recorded twice.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 47 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 47 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by this incident?
  - id: cq2
    text: Which customer channels are impacted by this incident?
  - id: cq3
    text: Which configuration items sit on the dependency path of the affected IT service?
  - id: cq4
    text: Which third-party services sit on the dependency path of the affected IT service?
  - id: cq5
    text: Which active alerts are correlated with this incident?
  - id: cq6
    text: Which events are correlated with this incident?
  - id: cq7
    text: Who owns the affected service?
  - id: cq8
    text: Which resolver group should be assigned to this incident?
  - id: cq9
    text: Which on-call engineer should handle this incident?
  - id: cq10
    text: Does this incident meet the criteria to be treated as a major incident?
  - id: cq11
    text: Which runbook can be used safely for this case?
  - id: cq12
    text: Which workaround can be used safely for this case?
  - id: cq13
    text: Which backup set can be used safely for this case?
  - id: cq14
    text: Which recovery plan can be used safely for this case?
  - id: cq15
    text: Was this incident caused by a recent change?
  - id: cq16
    text: Is a materiality assessment complete?
  - id: cq17
    text: "Is a regulatory notification required, and when is it due?"
  - id: cq18
    text: "Are evidence integrity, stakeholder communications, and closure conditions complete?"
  - id: cq19
    text: Which stakeholders have already been notified about this incident?
  - id: cq20
    text: Which vendor should this incident be escalated to?
  - id: cq21
    text: Which corrective actions from earlier post-incident reviews remain open for the affected service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security condition that requires managed response."
    aliases: []
    properties:
      summary:
        type: text
      description:
        type: text
      detectedAt:
        type: date
      openedAt:
        type: date
      resolvedAt:
        type: date
      closedAt:
        type: date
      status:
        type: text
      severity:
        type: text
      priority:
        type: text
      impact:
        type: text
      urgency:
        type: text
      category:
        type: text
      detectionSource:
        type: text
      recurring:
        type: boolean
      timeToAcknowledge:
        type: number
      timeToRestore:
        type: number
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
    meaning: A customer channel is a route through which customers access banking services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within the bank’s configuration-management scope.
    aliases:
      - configuration item
    properties:
      name:
        type: text
      version:
        type: text
      criticalityTier:
        type: text
  ThirdPartyService:
    meaning: A third-party service is an externally provided service that the bank depends on.
    aliases:
      - third-party service
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
      severity:
        type: text
      detectionSource:
        type: text
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - backup set
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - running
          - successful
          - failed
          - expired
          - corrupted
          - verified
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - recovery plan
    properties:
      recoveryTimeObjective:
        type: text
      recoveryPointObjective:
        type: text
      lastReviewDate:
        type: date
  Change:
    meaning: "A change is a controlled addition, modification, or removal that may affect an IT service."
    aliases: []
    properties:
      summary:
        type: text
      status:
        type: text
      riskLevel:
        type: text
      plannedStart:
        type: date
      plannedEnd:
        type: date
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of incident significance and reporting implications.
    aliases:
      - materiality assessment
    properties:
      assessedAt:
        type: date
      result:
        type: text
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: A regulatory notification is a formal incident-related submission to a competent authority.
    aliases:
      - regulatory notification
    properties:
      dueAt:
        type: date
      submittedAt:
        type: date
      status:
        type: text
  EvidenceItem:
    meaning: "An evidence item is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - evidence item
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
  Communication:
    meaning: "A communication is a controlled message sent to operational, business, customer, vendor, or regulatory audiences."
    aliases:
      - communication
      - stakeholder communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
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
  CorrectiveAction:
    meaning: "A corrective action is a tracked action intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - corrective action
    properties:
      actionDescription:
        type: text
      status:
        type: text
      dueDate:
        type: date
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases:
      - service owner
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - resolver group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for time-critical operational response.
    aliases:
      - on-call engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - incident commander
    properties: {}
  IncidentResponseTeam:
    meaning: An incident response team is the cross-functional team responsible for coordinating significant incident response.
    aliases:
      - incident response team
    properties: {}
  ServiceDesk:
    meaning: "A service desk is the first-line function that receives, records, triages, and routes user-reported issues."
    aliases:
      - service desk
    properties: {}
  ITOperationsTeam:
    meaning: An IT operations team is the team responsible for reliable day-to-day operation of IT services.
    aliases:
      - IT operations team
    properties: {}
  NetworkOperationsCentre:
    meaning: A network operations centre is the function that monitors and operates network and infrastructure services.
    aliases:
      - network operations centre
    properties: {}
  SecurityOperationsCentre:
    meaning: "A security operations centre is the function that monitors, investigates, and coordinates response to cyber threats."
    aliases:
      - security operations centre
    properties: {}
  ApplicationOwner:
    meaning: An application owner is the role accountable for an application and its operational fitness.
    aliases:
      - application owner
    properties: {}
  TechnicalOwner:
    meaning: A technical owner is the role accountable for the engineering and maintenance of a configuration item.
    aliases:
      - technical owner
    properties: {}
  BusinessOwner:
    meaning: A business owner is the business role accountable for a business service or process.
    aliases:
      - business owner
    properties: {}
  Stakeholder:
    meaning: "A stakeholder is a person, group, or organization affected by or responsible for an operational outcome."
    aliases: []
    properties:
      name:
        type: text
      audienceType:
        type: text
  Vendor:
    meaning: A vendor is an external organization that supplies or supports technology or services.
    aliases:
      - supplier
      - external supplier
      - third-party provider
    properties:
      legalName:
        type: text
      criticalityTier:
        type: text
  Regulator:
    meaning: A regulator is a competent authority that supervises the bank or receives required notifications.
    aliases:
      - supervisory authority
      - competent authority
    properties: {}
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties: {}
  Application:
    meaning: An application is a software system that delivers business or operational functionality.
    aliases: []
    properties: {}
  Problem:
    meaning: A problem is the underlying cause or potential cause of one or more incidents.
    aliases: []
    properties: {}
  KnownError:
    meaning: A known error is a diagnosed problem with a documented cause or workaround.
    aliases:
      - known error
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - post-incident review
    properties:
      heldOn:
        type: date
      findings:
        type: text
  MonitoringTool:
    meaning: A monitoring tool is a platform that collects telemetry and evaluates operational conditions.
    aliases:
      - monitoring tool
    properties: {}
  SecurityEvent:
    meaning: "A security event is an event relevant to confidentiality, integrity, availability, authenticity, or cyber threat activity."
    aliases:
      - security event
    properties: {}
  MonitoringRule:
    meaning: A monitoring rule is a defined condition that evaluates telemetry and may generate an alert.
    aliases:
      - monitoring rule
    properties: {}
relationships:
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: This links an incident to a business service whose operation is affected by the incident.
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: This links a business service to the customer channel through which the service is provided.
    aliases: []
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: This links an incident to an IT service whose operation is affected by the incident.
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: This links an IT service to the application that delivers that technical capability.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: This links an IT service to an external service it relies on.
    aliases: []
  - name: runsInEnvironment
    from: ITService
    to: Environment
    meaning: null
    aliases: []
  - name: runsOnConfigurationItem
    from: ITService
    to: ConfigurationItem
    meaning: This links an IT service to the technical component it runs on.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: usesConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: ownedByServiceOwner
    from: ITService
    to: ServiceOwner
    meaning: This links an IT service to the role accountable for it across its lifecycle.
    aliases: []
  - name: ownedByApplicationOwner
    from: Application
    to: ApplicationOwner
    meaning: This links an application to the role accountable for its operational fitness.
    aliases: []
  - name: ownedByTechnicalOwner
    from: ConfigurationItem
    to: TechnicalOwner
    meaning: This links a configuration item to the role accountable for its engineering and maintenance.
    aliases: []
  - name: accountableToBusinessOwner
    from: BusinessService
    to: BusinessOwner
    meaning: This links a business service to the business role accountable for it.
    aliases: []
  - name: supportedByVendor
    from: Application
    to: Vendor
    meaning: This links an application to the vendor that supplies support for it.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: This links a third-party service to the vendor that provides it.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: This links an incident to the resolver group responsible for diagnosing and restoring it.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: This links an incident to the on-call engineer currently handling the time-critical response.
    aliases: []
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: This links an incident to the vendor engaged for external support or resolution.
    aliases: []
  - name: supportedByResolverGroup
    from: ITService
    to: ResolverGroup
    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling.
    aliases: []
  - name: supportedByResolverGroup
    from: ConfigurationItem
    to: ResolverGroup
    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling.
    aliases: []
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: This links an on-call engineer to the resolver group they belong to.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: This links an incident to the alert that opened or initiated it.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: This links an incident to an event that has been correlated into the incident record.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "This links an incident to the runbook used to diagnose, respond to, recover, or verify it."
    aliases: []
  - name: supportedByEvidenceItem
    from: Incident
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: This links an incident to the assessment that determines its significance and reporting implications.
    aliases: []
  - name: recoveredWithRecoveryPlan
    from: Incident
    to: RecoveryPlan
    meaning: This links an incident to the recovery plan used to restore the affected service.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: This links an incident to the underlying cause record associated with it.
    aliases: []
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: This links a problem to the known error record that captures its diagnosed cause or workaround.
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: This links a known error to the workaround that can reduce or bypass its impact.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: This links a recovery plan to the backup set used during restoration.
    aliases: []
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: This links a materiality assessment to the regulatory notification required by its outcome.
    aliases: []
  - name: reviewedInPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: "This links an incident to the formal review of its causes, response, lessons, and follow-up."
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: This links a post-incident review to the corrective actions raised from it.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: This links an incident to the person responsible for command and coordination during major-incident handling.
    aliases: []
  - name: notifiesStakeholder
    from: Incident
    to: Stakeholder
    meaning: This links an incident to a stakeholder who must receive or has received incident-related notification.
    aliases: []
  - name: aboutIncident
    from: Communication
    to: Incident
    meaning: This links a communication to the incident the message concerns.
    aliases: []
  - name: addressedToStakeholder
    from: Communication
    to: Stakeholder
    meaning: This links a communication to the stakeholder it is directed to.
    aliases: []
  - name: memberOfIncidentResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: This links an incident commander to the incident response team they are part of.
    aliases: []
  - name: recordedByServiceDesk
    from: Incident
    to: ServiceDesk
    meaning: This links an incident to the service desk that received and recorded it.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: This links a regulatory notification to the regulator that receives it.
    aliases: []
  - name: operatesItservice
    from: ITOperationsTeam
    to: ITService
    meaning: This links the IT operations team to the IT services it runs day to day.
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperationsCentre
    to: MonitoringTool
    meaning: This links the network operations centre to the monitoring tools it operates.
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperationsCentre
    to: SecurityEvent
    meaning: This links the security operations centre to the security events it monitors and investigates.
    aliases: []
  - name: executedByMonitoringTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: This links a monitoring rule to the monitoring tool that runs it.
    aliases: []
  - name: generatedByMonitoringRule
    from: Alert
    to: MonitoringRule
    meaning: This links an alert to the monitoring rule that created it.
    aliases: []
  - name: deployedInEnvironment
    from: ITService
    to: Environment
    meaning: This links an IT service to the environment where it is deployed.
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: This links a configuration item to the environment it belongs to.
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: This links a recovery plan to the IT service it is intended to restore.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: This links a backup set to the configuration item whose data or state it protects.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: This links a change to the IT service that may be altered or impacted by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: observedOnConfigurationItem
    from: Event
    to: ConfigurationItem
    meaning: This links an event to the configuration item where the state change or occurrence was observed.
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: null
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: This links an event to the IT service it is relevant to.
    aliases: []
rules: {}
actions:
  acknowledgeAlert:
    input: null
    preconditions: []
    effect: An alert is acknowledged so responders can see it has been taken up.
    verification: Confirm the alert shows as acknowledged.
  assignIncidentToResolverGroup:
    input: null
    preconditions: []
    effect: The incident is assigned to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: null
    preconditions: []
    effect: The incident is marked and handled as a major incident.
    verification: Confirm the incident shows major-incident handling has been initiated.
  containIncident:
    input: null
    preconditions: []
    effect: Containment actions are recorded and the incident is put under control.
    verification: Confirm the incident record shows containment has been performed.
  isolateAffectedConfigurationItem:
    input: null
    preconditions: []
    effect: The affected configuration item is deliberately isolated from relevant networks or dependencies.
    verification: Confirm the configuration item shows as isolated or disconnected as intended.
  failOverAffectedServiceToRecoveryEnvironment:
    input: null
    preconditions: []
    effect: The affected service is failed over to its recovery environment.
    verification: Confirm the service is operating from the recovery environment.
  restoreDataFromBackup:
    input: null
    preconditions: []
    effect: Data is restored from the selected backup set.
    verification: Confirm the restored data is available and matches the intended restore point.
  executeEmergencyChange:
    input: null
    preconditions: []
    effect: The emergency change is executed.
    verification: Confirm the change record and affected target reflect the executed change.
  sendStakeholderCommunication:
    input: null
    preconditions: []
    effect: A stakeholder communication is issued for the incident.
    verification: Confirm the communication was sent and recorded against the incident.
  submitRegulatoryNotification:
    input: null
    preconditions: []
    effect: A regulatory notification is submitted.
    verification: Confirm the notification submission is recorded.
  closeIncident:
    input: null
    preconditions: []
    effect: The incident is closed.
    verification: Confirm the incident status shows closed.


# CONSISTENCY CHECK — 12 outstanding problem(s) in the whole model:
#   [error] action-input-missing — Action "acknowledgeAlert" has no input class.
#   [error] action-input-missing — Action "assignIncidentToResolverGroup" has no input class.
#   [error] action-input-missing — Action "closeIncident" has no input class.
#   [error] action-input-missing — Action "containIncident" has no input class.
#   [error] action-input-missing — Action "declareMajorIncident" has no input class.
#   [error] action-input-missing — Action "executeEmergencyChange" has no input class.
#   [error] action-input-missing — Action "failOverAffectedServiceToRecoveryEnvironment" has no input class.
#   [error] action-input-missing — Action "isolateAffectedConfigurationItem" has no input class.
#   [error] action-input-missing — Action "restoreDataFromBackup" has no input class.
#   [error] action-input-missing — Action "sendStakeholderCommunication" has no input class.
#   [error] action-input-missing — Action "submitRegulatoryNotification" has no input class.
#   [warning] duplicate-edge — Relationship Event --relatesToItservice--> ITService is recorded twice.

### Turn 47 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "relationships": [
    {
      "name": "relatesToItservice",
      "from": "Event",
      "to": "ITService"
    }
  ]
}
```

### Turn 47 — tool

Removed 1 element(s) — relationships: relatesToItservice (Event → ITService).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 47 — assistant

I fixed the duplicate-edge warning by removing the duplicate Event → ITService relationship. One Event → ITService link still remains in the model, so no intended content was lost.

Short recap: the relationship meanings are largely in place now, but a few relationships still have no meaning sentence and the action inputs are still unresolved from earlier.

Next relationship-meaning batch, to finish the remaining missing ones:
Please give a one-sentence plain-language meaning for these 5 relationships:
- runsInEnvironment
- usesConfigurationItem
- runsOnConfigurationItem (Application → ConfigurationItem)
- supportedByEvidenceItem
- modifiesConfigurationItem

One short sentence each.

### Turn 48 — user

- **Runs in environment** — This links an application to the environment where it is running.
- **Uses configuration item** — This links an IT service or application to a configuration item it relies on operationally.
- **Runs on configuration item** — This links an application to the configuration item that hosts or executes it.
- **Supported by evidence item** — This links an incident to the preserved evidence that supports analysis, accountability, or verification.
- **Modifies configuration item** — This links a change to the configuration item it alters.

### Turn 48 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: runsInEnvironment\n    from: ITService\n    to: Environment\n    meaning: This links an application to the environment where it is running.\n  - name: usesConfigurationItem\n    from: Application\n    to: ConfigurationItem\n    meaning: This links an IT service or application to a configuration item it relies on operationally.\n  - name: runsOnConfigurationItem\n    from: Application\n    to: ConfigurationItem\n    meaning: This links an application to the configuration item that hosts or executes it.\n  - name: supportedByEvidenceItem\n    from: Incident\n    to: EvidenceItem\n    meaning: This links an incident to the preserved evidence that supports analysis, accountability, or verification.\n  - name: modifiesConfigurationItem\n    from: Change\n    to: ConfigurationItem\n    meaning: This links a change to the configuration item it alters."
}
```

### Turn 48 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 48 — assistant

Recorded, but I need to flag one issue in what was just stored:

- The live relationship is **ITService → Environment** for `runsInEnvironment`
- But the meaning you gave says **“This links an application to the environment where it is running.”**

So the stored wording and the actual relationship direction/object do not match.

Focused correction question:
For the existing relationship **ITService → Environment (runsInEnvironment)**, what should the meaning sentence be?  
And separately: do you also want a distinct **Application → Environment** relationship, or not in this scope?

### Turn 49 — user

For **IT service → environment**, the meaning should be:

- **Runs in environment** — This links an IT service to the environment where it is deployed or operating.

And separately: **no**, I would not add a distinct **application → environment** relationship in this scope. The service-to-environment and configuration-item-to-environment paths are enough for the questions we accepted.

### Turn 49 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: runsInEnvironment\n    from: ITService\n    to: Environment\n    meaning: This links an IT service to the environment where it is deployed or operating."
}
```

### Turn 49 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 49 — assistant

Corrected.

Short recap of the language layer: class meanings are in place, most relationship meanings are in place, and you confirmed there is no separate Application → Environment relationship in this scope.

Next part of the language layer: aliases for relationships.

Please give any important alternative phrasings you want captured for these 8 relationships, or say “none” for each:
- assignedToResolverGroup
- handledByOnCallEngineer
- escalatedToVendor
- evaluatedByMaterialityAssessment
- triggersRegulatoryNotification
- reviewedInPostIncidentReview
- supportedByResolverGroup
- recordedByServiceDesk

Only include aliases that really mean the same thing in your organization.

### Turn 50 — user

- **Assigned to resolver group** — assigned to support group
- **Handled by on-call engineer** — owned by on-call, handled by duty engineer
- **Escalated to vendor** — escalated to supplier, handed off to vendor
- **Evaluated by materiality assessment** — assessed for reportability
- **Triggers regulatory notification** — leads to regulatory notification, requires regulatory notification
- **Reviewed in post-incident review** — reviewed in PIR, subject to post-incident review
- **Supported by resolver group** — covered by resolver group, supported by support group
- **Recorded by service desk** — logged by service desk, opened by service desk

### Turn 50 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: assignedToResolverGroup\n    from: Incident\n    to: ResolverGroup\n    aliases: [assigned to support group]\n  - name: handledByOnCallEngineer\n    from: Incident\n    to: OnCallEngineer\n    aliases: [owned by on-call, handled by duty engineer]\n  - name: escalatedToVendor\n    from: Incident\n    to: Vendor\n    aliases: [escalated to supplier, handed off to vendor]\n  - name: evaluatedByMaterialityAssessment\n    from: Incident\n    to: MaterialityAssessment\n    aliases: [assessed for reportability]\n  - name: triggersRegulatoryNotification\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n    aliases: [leads to regulatory notification, requires regulatory notification]\n  - name: reviewedInPostIncidentReview\n    from: Incident\n    to: PostIncidentReview\n    aliases: [reviewed in PIR, subject to post-incident review]\n  - name: supportedByResolverGroup\n    from: ITService\n    to: ResolverGroup\n    aliases: [covered by resolver group, supported by support group]\n  - name: supportedByResolverGroup\n    from: ConfigurationItem\n    to: ResolverGroup\n    aliases: [covered by resolver group, supported by support group]\n  - name: recordedByServiceDesk\n    from: Incident\n    to: ServiceDesk\n    aliases: [logged by service desk, opened by service desk]"
}
```

### Turn 50 — tool

Applied. Added 0, updated 9 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 50 — assistant

Recorded.

Short recap: we now have a useful first batch of relationship aliases, including support-group, on-call, supplier, reportability, PIR, and service-desk variants. Since this batch produced real aliases, I’ll ask one more alias batch before deciding whether to stop soliciting more.

Please give any important alternative phrasings you want captured for these 8 relationships, or say “none” for each:
- impactsBusinessService
- impactsITService
- dependsOnThirdPartyService
- linkedToProblem
- hasWorkaround
- usesBackupSet
- sentToRegulator
- aboutIncident

Only true synonyms in your organization.

### Turn 51 — user

- **Impacts business service** — affects business service
- **Impacts IT service** — affects IT service
- **Depends on third-party service** — relies on external service
- **Linked to problem** — associated with problem
- **Has workaround** — has temporary fix
- **Uses backup set** — restores from backup set
- **Sent to regulator** — submitted to regulator
- **About incident** — relates to incident

### Turn 51 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: impactsBusinessService\n    from: Incident\n    to: BusinessService\n    aliases: [affects business service]\n  - name: impactsItservice\n    from: Incident\n    to: ITService\n    aliases: [affects IT service]\n  - name: dependsOnThirdPartyService\n    from: ITService\n    to: ThirdPartyService\n    aliases: [relies on external service]\n  - name: linkedToProblem\n    from: Incident\n    to: Problem\n    aliases: [associated with problem]\n  - name: hasWorkaround\n    from: KnownError\n    to: Workaround\n    aliases: [has temporary fix]\n  - name: usesBackupSet\n    from: RecoveryPlan\n    to: BackupSet\n    aliases: [restores from backup set]\n  - name: sentToRegulator\n    from: RegulatoryNotification\n    to: Regulator\n    aliases: [submitted to regulator]\n  - name: aboutIncident\n    from: Communication\n    to: Incident\n    aliases: [relates to incident]"
}
```

### Turn 51 — tool

Applied. Added 0, updated 8 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 51 — assistant

Recorded.

Short recap: we now have a second strong batch of relationship aliases. That’s enough to stop actively soliciting more for now and move on.

Next phase: constraints and fixed choices. We already captured some allowed-value lists, and now we need to continue systematically for decision-bearing properties that naturally take a small set of values.

First allowed-values batch:
Please give the allowed values for these properties, where they are controlled in your operating model:
- Incident.status
- Incident.severity
- Incident.priority
- Incident.impact
- Incident.urgency
- Incident.category
- Incident.detectionSource
- Alert.status
- Alert.severity
- Change.status

If any one of these is not a fixed list in your organization, say “not fixed” for that property.

### Turn 52 — user

These are controlled in the operating model.

**Incident.status**
- new
- acknowledged
- investigating
- contained
- recovering
- monitoring
- resolved
- closed
- cancelled

**Incident.severity**
- sev1-critical
- sev2-high
- sev3-medium
- sev4-low

**Incident.priority**
- p1-critical
- p2-high
- p3-medium
- p4-low

**Incident.impact**
- enterprise-wide
- multiple-services
- single-service
- limited-users
- no-observed-impact

**Incident.urgency**
- immediate
- high
- normal
- low

**Incident.category**
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

**Incident.detection source**
- monitoring
- siem
- service-desk
- user-report
- vendor-report
- automated-control
- regulator
- other

**Alert.status**
- new
- acknowledged
- suppressed
- escalated
- closed

**Alert.severity**
- sev1-critical
- sev2-high
- sev3-medium
- sev4-low

**Change.status**
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

### Turn 52 — assistant

Good — these are exactly the kinds of bounded values we need.

Before I record them, I need the per-property “what breaks if missing or wrong?” check for this batch. Please answer briefly for each property:

- Incident.status
- Incident.severity
- Incident.priority
- Incident.impact
- Incident.urgency
- Incident.category
- Incident.detectionSource
- Alert.status
- Alert.severity
- Change.status

A short phrase is enough, such as “routing breaks,” “major-incident decision breaks,” “regulatory timing breaks,” “triage gets unreliable,” or “nothing critical.”

### Turn 53 — user

- **Incident.status** — lifecycle control breaks.
- **Incident.severity** — major-incident and escalation decisions break.
- **Incident.priority** — response precedence breaks.
- **Incident.impact** — business-impact assessment and stakeholder handling break.
- **Incident.urgency** — timing and response-speed decisions break.
- **Incident.category** — routing and specialist involvement become less reliable.
- **Incident.detection source** — triage context and source-specific handling become less reliable.
- **Alert.status** — alert workflow control breaks.
- **Alert.severity** — alert triage and escalation become less reliable.
- **Change.status** — change control and implementation readiness break.

### Turn 53 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n        allowed: [new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled]\n      severity:\n        type: text\n        allowed: [sev1-critical, sev2-high, sev3-medium, sev4-low]\n      priority:\n        type: text\n        allowed: [p1-critical, p2-high, p3-medium, p4-low]\n      impact:\n        type: text\n        allowed: [enterprise-wide, multiple-services, single-service, limited-users, no-observed-impact]\n      urgency:\n        type: text\n        allowed: [immediate, high, normal, low]\n      category:\n        type: text\n        allowed: [availability, performance, capacity, network, application, database, infrastructure, data-integrity, cybersecurity, third-party, change-induced, other]\n      detectionSource:\n        type: text\n        allowed: [monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other]\n  Alert:\n    properties:\n      status:\n        type: text\n        allowed: [new, acknowledged, suppressed, escalated, closed]\n      severity:\n        type: text\n        allowed: [sev1-critical, sev2-high, sev3-medium, sev4-low]\n  Change:\n    properties:\n      status:\n        type: text\n        allowed: [draft, assessed, approved, scheduled, implementing, implemented, failed, rolled-back, closed, cancelled]"
}
```

### Turn 53 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 53 — assistant

Recorded.

Short recap: Incident, Alert, and Change now have bounded value sets for the key lifecycle, routing, and escalation properties, and your “what breaks” check confirmed these are operationally significant rather than just nice-to-have labels.

Next allowed-values batch:
Please give the allowed values for these properties where controlled:
- Change.riskLevel
- MaterialityAssessment.result
- RegulatoryNotification.status
- Stakeholder.audienceType
- Vendor.criticalityTier
- ITService.criticalityTier
- ConfigurationItem.criticalityTier

And again, for each one, include a short “what breaks if missing or wrong?” note. If any are not fixed lists, say “not fixed.”

### Turn 54 — user

Here are the controlled values and why they matter.

**Change.risk level**
- low
- medium
- high
- critical  
What breaks if missing or wrong: risk approval and emergency-change handling become unreliable.

**Materiality assessment.result**
- not-reportable
- potentially-reportable
- reportable
- undetermined  
What breaks if missing or wrong: regulatory decision and reporting timing break.

**Regulatory notification.status**
- draft
- pending-approval
- approved
- submitted
- accepted
- rejected
- withdrawn  
What breaks if missing or wrong: submission control and auditability break.

**Stakeholder.audience type**
- technical
- management
- business
- customer
- vendor
- regulator
- all-staff  
What breaks if missing or wrong: communication targeting breaks.

**Vendor.criticality tier**
- tier-1-critical
- tier-2-important
- tier-3-standard
- tier-4-supporting  
What breaks if missing or wrong: supplier prioritization becomes less reliable.

**IT service.criticality tier**
- tier-1-critical
- tier-2-important
- tier-3-standard
- tier-4-supporting  
What breaks if missing or wrong: service-priority and recovery planning become less reliable.

**Configuration item.criticality tier**
- tier-1-critical
- tier-2-important
- tier-3-standard
- tier-4-supporting  
What breaks if missing or wrong: infrastructure prioritization and recovery choice become less reliable.

### Turn 54 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change:\n    properties:\n      riskLevel:\n        type: text\n        allowed: [low, medium, high, critical]\n  MaterialityAssessment:\n    properties:\n      result:\n        type: text\n        allowed: [not-reportable, potentially-reportable, reportable, undetermined]\n  RegulatoryNotification:\n    properties:\n      status:\n        type: text\n        allowed: [draft, pending-approval, approved, submitted, accepted, rejected, withdrawn]\n  Stakeholder:\n    properties:\n      audienceType:\n        type: text\n        allowed: [technical, management, business, customer, vendor, regulator, all-staff]\n  Vendor:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]\n  ITService:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]\n  ConfigurationItem:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]"
}
```

### Turn 54 — tool

Applied. Added 0, updated 7 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 54 — assistant

Recorded.

Short recap: we now have controlled values for change risk, materiality result, notification status, stakeholder audience, and the criticality tiers used across vendors, services, and configuration items.

Next phase: rules. We only add rules where a real decision depends on them.

First focused rule question:
For the accepted question **“Does this incident meet the criteria to be treated as a major incident?”**, what named plain-language rule should the agent use?  
Please give:
- a short rule name, and
- the condition list in plain language.

Use only concepts already in the model where possible. If you need a condition that depends on a property we have not captured yet, say so explicitly.

### Turn 55 — user

**Rule name:** Major-incident declaration preconditions

**Conditions in plain language:**
- the incident is not already resolved, closed, or cancelled
- the incident severity is critical or high
- at least one impacted IT service has been identified
- an incident commander has been assigned

That is enough to support the operational decision on whether the incident can be declared and handled as a major incident.

### Turn 55 — assistant

This is close, but I need one focused check before recording it.

Your accepted competency question is **“Does this incident meet the criteria to be treated as a major incident?”**  
The last condition you listed — **“an incident commander has been assigned”** — sounds more like a consequence or readiness step after declaration, not a criterion for deciding whether it qualifies.

So which do you want?

1. Keep this rule as the **declaration action precondition** rule, not the qualification rule, or  
2. Remove “an incident commander has been assigned” from this rule so it can stand as the actual **major-incident qualification** rule.

### Turn 56 — user

Choose **1**.

I would keep that as the **declaration action precondition** rule, not as the pure qualification test.

Operationally, “does it qualify?” and “can we formally declare it right now?” are close, but not identical. The commander assignment belongs to the declaration step, not to the underlying significance of the incident.

### Turn 56 — assistant

Understood.

Short recap: we have clarified that your proposed conditions are for the **declaration action precondition**, not the pure qualification test. So the major-incident question is still only partly covered: we do not yet have the separate rule for whether an incident **qualifies** as a major incident.

Next focused question:
What is the plain-language rule for the pure **major-incident qualification** decision?  
Please give:
- a short rule name, and
- the condition list.

Use only the actual qualification criteria, without declaration-readiness steps like assigning an incident commander.

### Turn 57 — user

**Rule name:** Major-incident qualification rule

**Conditions in plain language:**
- the incident is not already resolved, closed, or cancelled
- the incident severity is critical or high
- at least one impacted IT service has been identified

That is the cleaner qualification test for whether the incident should be treated as a major incident.

### Turn 57 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  majorIncidentQualificationRule:\n    conditions:\n      - the incident is not already resolved, closed, or cancelled\n      - the incident severity is critical or high\n      - at least one impacted IT service has been identified"
}
```

### Turn 57 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [error] value-not-allowed — Rule "majorIncidentQualificationRule" (condition 2) requires Incident.severity to be "critical", but that property allows only: sev1-critical, sev2-high, sev3-medium, sev4-low. Either add "critical" to the allowed values, or use one that is already there. Do not drop the condition to make this go away.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 57 — assistant

The tool found a real mismatch I need to resolve before moving on:

Your rule says:
- incident severity is **critical or high**

But the allowed values for `Incident.severity` are:
- `sev1-critical`
- `sev2-high`
- `sev3-medium`
- `sev4-low`

Focused correction question:
Should the rule condition be rewritten as:
- **the incident severity is sev1-critical or sev2-high**

? Or do you want to change the allowed values instead?

### Turn 58 — user

Yes — rewrite the rule condition as:

- **the incident severity is sev1-critical or sev2-high**

The allowed values are fine as they are.

### Turn 58 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  majorIncidentQualificationRule:\n    conditions:\n      - the incident is not already resolved, closed, or cancelled\n      - the incident severity is sev1-critical or sev2-high\n      - at least one impacted IT service has been identified"
}
```

### Turn 58 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 58 — assistant

Resolved.

Short recap: the **majorIncidentQualificationRule** is now recorded consistently against the allowed severity values.

Next rule question:
For the accepted question **“Is a regulatory notification required, and when is it due?”**, what named plain-language rule should the agent use?  
Please give:
- a short rule name, and
- the condition list in plain language.

If the due time comes from MaterialityAssessment.reportingDueTime rather than a separate rule condition, that’s fine — say so explicitly.

### Turn 59 — user

**Rule name:** Regulatory-notification requirement rule

**Conditions in plain language:**
- the incident has a materiality assessment
- the materiality assessment result is reportable

And yes, the due time should come from the materiality assessment’s reporting due time, rather than from a separate rule condition.

### Turn 59 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  regulatoryNotificationRequirementRule:\n    conditions:\n      - the incident has a materiality assessment\n      - the materiality assessment result is reportable"
}
```

### Turn 59 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 59 — assistant

Recorded.

Short recap: the model now has a rule for when regulatory notification is required, and you explicitly anchored the due time to `MaterialityAssessment.reportingDueTime` rather than embedding time logic in the rule itself.

Next rule question:
For the accepted question **“Are evidence integrity, stakeholder communications, and closure conditions complete?”** and the action **close incident**, what named plain-language rule should the agent use?  
Please give:
- a short rule name, and
- the condition list in plain language.

Use only concepts already in the model if you can. If you need a missing property or relationship to express the closure check, say so explicitly.

### Turn 60 — user

**Rule name:** Incident-closure preconditions

**Conditions in plain language:**
- the incident status is resolved or monitoring
- impacted services have health state healthy or an accepted residual condition
- resolution and restoration evidence are recorded
- required stakeholder communications are complete
- incidents under major-incident handling have a scheduled or completed post-incident review

One gap to note: if you want to express **accepted residual condition** explicitly in the model, that is not a separate property you have captured yet. In this scope, it is better treated as part of the closure decision logic rather than as a standalone class.

### Turn 60 — assistant

This is useful, and you correctly flagged a modeling gap. I need to close that gap before I can record the rule cleanly.

You listed:
- “impacted services have health state healthy **or an accepted residual condition**”

But there is currently no captured property/value in the model that represents “accepted residual condition,” and the rule should only reference captured properties/values.

Focused question:
How do you want to express that in this ontology?

1. Add an **Incident** property for something like residualConditionAccepted (boolean), or  
2. Add another allowed value to **ITService.healthState**, or  
3. Remove that phrase from the rule and keep only “health state healthy.”

Please choose 1, 2, or 3.

### Turn 61 — user

Choose **1**.

Add an **incident-level boolean** for accepted residual condition.

That keeps the service health state clean and still lets closure logic reflect the real-world case where the service is not fully healthy but the remaining condition has been explicitly accepted for closure purposes.

### Turn 61 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      residualConditionAccepted:\n        type: boolean"
}
```

### Turn 61 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 61 — assistant

Recorded the missing property: `Incident.residualConditionAccepted` as a boolean.

Short recap: that gives the closure logic a clean way to express accepted residual condition without overloading ITService.healthState.

Now please restate the **Incident-closure preconditions** rule using only captured properties/relationships/values.  
You can keep the same rule name if you want. Please give the final plain-language condition list.

### Turn 62 — user

**Rule name:** Incident-closure preconditions

**Conditions in plain language:**
- the incident status is resolved or monitoring
- each impacted IT service has health state healthy, or the incident has residual condition accepted set to true
- resolution and restoration evidence are recorded
- required stakeholder communications are complete
- incidents under major-incident handling have a scheduled or completed post-incident review

### Turn 62 — assistant

This is nearly recordable, but one more focused consistency check is needed.

Two phrases still refer to things we have not yet captured explicitly as properties/values:
- **“required stakeholder communications are complete”**
- **“scheduled or completed post-incident review”**

We do have Communication.status, but we do **not** yet have:
- a captured way to mark which communications are required for an incident, or
- a status property on PostIncidentReview.

So for this rule, which do you want?

1. Add the missing properties first:
   - a way to express required communications on Incident or Communication, and
   - a status property on PostIncidentReview

or

2. Simplify the rule now so it uses only what is already in the model.

### Turn 63 — user

Choose **2**.

For this scope, simplify the rule so it uses only what is already in the model.

I would avoid adding extra modeling just to make the closure rule more expressive unless you know you need that level of workflow control right now.

### Turn 63 — assistant

Understood.

Short recap: we are keeping the ontology lean here. That means the closure rule will be simplified to use only what is already modeled, rather than adding extra workflow-control properties just for this one rule.

Next focused question:
Please give the final simplified **Incident-closure preconditions** rule using only already captured properties and relationships.

### Turn 64 — user

**Rule name:** Incident-closure preconditions

**Conditions in plain language:**
- the incident status is resolved or monitoring
- each impacted IT service has health state healthy, or the incident has residual condition accepted set to true
- the incident has at least one linked evidence item
- the incident has at least one linked communication
- if the incident is being handled as a major incident, it has at least one linked post-incident review

### Turn 64 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  incidentClosurePreconditions:\n    conditions:\n      - the incident status is resolved or monitoring\n      - each impacted IT service has health state healthy, or the incident has residual condition accepted set to true\n      - the incident has at least one linked evidence item\n      - the incident has at least one linked communication\n      - if the incident is being handled as a major incident, it has at least one linked post-incident review"
}
```

### Turn 64 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 64 — assistant

Recorded.

Short recap: the model now has a usable **incidentClosurePreconditions** rule expressed only in terms already present in the ontology.

Next rule question:
For the accepted questions **“Which runbook can be used safely for this case?”**, **“Which workaround can be used safely for this case?”**, **“Which backup set can be used safely for this case?”**, and **“Which recovery plan can be used safely for this case?”**, do you want one shared safety/selection rule family here, or are these operationally different enough that they need separate rules?

Please answer:
- one shared rule family, or
- separate rules

and give a brief reason.

### Turn 65 — user

**Separate rules.**

They are related, but operationally different enough that I would not collapse them into one safety rule.

- A **runbook** is about whether the procedure fits the incident and affected technology.
- A **workaround** depends on the diagnosed problem or known error path.
- A **backup set** depends on backup status, target coverage, and restore approval.
- A **recovery plan** depends on service applicability, recovery environment availability, and acceptable recovery point.

So they belong to the same recovery-and-response area, but the decision logic is different for each.

### Turn 65 — assistant

Good — separate rules it is.

Short recap: we’ll keep the safety/selection logic separate for runbook, workaround, backup set, and recovery plan, because each depends on a different decision path.

Next focused rule question:
Please give the rule for **which recovery plan can be used safely for this case**.

Please provide:
- a short rule name, and
- the plain-language conditions.

Use only currently captured model elements if possible. If a needed condition depends on something not yet captured, say so explicitly.

### Turn 66 — user

**Rule name:** Recovery-plan safe-use rule

**Conditions in plain language:**
- the recovery plan recovers an IT service impacted by the incident
- a usable backup set is available through the recovery plan
- the target recovery environment is available
- the required recovery point is acceptable for the incident

Two conditions depend on details not yet captured explicitly in your current model:
- whether the target recovery environment is available
- whether the required recovery point is acceptable for the incident

So if you want this rule to be fully machine-checkable, those would need additional modeled facts.

### Turn 66 — assistant

Thanks — that surfaces a real modeling gap, so I shouldn’t record the rule as fully captured yet.

Short recap: the recovery-plan rule concept is clear, but two of its conditions still refer to uncaptured facts:
- target recovery environment availability
- required recovery point acceptability for the incident

To keep this phase moving with the minimum needed addition, I’ll ask about just one of those first:

What modeled fact should represent **“the target recovery environment is available”**?  
Please choose the leanest option that fits your practice:
1. add a property on **Environment**
2. add a property on **RecoveryPlan**
3. add a property on **ITService**
4. some other already-existing class — specify which and the property name.

### Turn 67 — user

Choose **1**: add a property on **Environment**.

That is the leanest and cleanest fit, because availability belongs to the target environment itself, not to the recovery plan or the service.

I’d model it as something like **availability status** on environment.

### Turn 67 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Environment:\n    properties:\n      availabilityStatus:\n        type: text"
}
```

### Turn 67 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 67 — assistant

Recorded: `Environment.availabilityStatus`.

Short recap: that closes one of the two missing facts for the recovery-plan rule. The remaining open one is how to represent whether the required recovery point is acceptable for the incident.

Next focused question:
What modeled fact should represent **“the required recovery point is acceptable for the incident”**?  
Please choose the leanest fit:
1. add a property on **Incident**
2. add a property on **RecoveryPlan**
3. add a property on **BackupSet**
4. some other already-existing class — specify which and the property name.

### Turn 68 — user

Choose **1**: add a property on **Incident**.

That acceptability decision is case-specific, so it belongs on the incident side rather than on the recovery plan or backup set in general.

I’d model it as something like **recovery point accepted** on incident.

### Turn 68 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      recoveryPointAccepted:\n        type: boolean"
}
```

### Turn 68 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 68 — assistant

Recorded: `Incident.recoveryPointAccepted` as a boolean.

Short recap: the recovery-plan rule now has modeled hooks for environment availability and incident-specific recovery-point acceptability.

Now please restate the **Recovery-plan safe-use rule** using only captured model elements.  
Please give:
- the rule name, and
- the final plain-language conditions.

### Turn 69 — user

**Rule name:** Recovery-plan safe-use rule

**Conditions in plain language:**
- the recovery plan recovers an IT service impacted by the incident
- the recovery plan uses at least one backup set
- the target environment has availability status available
- the incident has recovery point accepted set to true

### Turn 69 — assistant

This is close, but one condition still points to something we haven’t fully captured:

- **“the target environment has availability status available”**

We do have `Environment.availabilityStatus`, but:
- there is no allowed value list yet for that property, and
- we do not yet have a path from **RecoveryPlan** to **Environment** to identify the target environment.

So one focused question first:
How should **RecoveryPlan** connect to **Environment** in this ontology?  
Please give the real directed relationship name and meaning in plain language.

### Turn 70 — user

I would use:

- **Recovery plan uses environment**

Meaning:
- This links a recovery plan to the environment it targets for service restoration or failover.

### Turn 70 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: usesEnvironment\n    from: RecoveryPlan\n    to: Environment\n    meaning: This links a recovery plan to the environment it targets for service restoration or failover."
}
```

### Turn 70 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 70 — assistant

Recorded.

Short recap: RecoveryPlan now connects directly to Environment through `usesEnvironment`, which gives the model a real path to the target recovery environment.

Next focused question:
What are the allowed values for **Environment.availabilityStatus**, and what breaks if that value is missing or wrong?

### Turn 71 — user

For **environment availability status**, I’d use this controlled set:

- available
- unavailable
- degraded
- unknown

What breaks if it is missing or wrong:
- failover and recovery-plan selection become unreliable.

### Turn 71 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Environment:\n    properties:\n      availabilityStatus:\n        type: text\n        allowed: [available, unavailable, degraded, unknown]"
}
```

### Turn 71 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 71 — assistant

Recorded.

Short recap: `Environment.availabilityStatus` now has a bounded value set, and you confirmed it matters because failover and recovery-plan selection become unreliable without it.

Now please restate the **Recovery-plan safe-use rule** one last time using only captured model elements and values.  
Please give:
- the rule name, and
- the final plain-language conditions.

### Turn 72 — user

**Rule name:** Recovery-plan safe-use rule

**Conditions in plain language:**
- the recovery plan recovers an IT service impacted by the incident
- the recovery plan uses at least one backup set
- the recovery plan uses an environment whose availability status is available
- the incident has recovery point accepted set to true

### Turn 72 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  recoveryPlanSafeUseRule:\n    conditions:\n      - the recovery plan recovers an IT service impacted by the incident\n      - the recovery plan uses at least one backup set\n      - the recovery plan uses an environment whose availability status is available\n      - the incident has recovery point accepted set to true"
}
```

### Turn 72 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 72 — assistant

Recorded.

Short recap: the **recoveryPlanSafeUseRule** is now fully captured and machine-checkable against the current model.

Next rule question:
Please give the rule for **which backup set can be used safely for this case**.

Please provide:
- a short rule name, and
- the plain-language conditions.

Use only currently captured model elements if possible; if something is still missing, say so explicitly.

### Turn 73 — user

**Rule name:** Backup-set safe-use rule

**Conditions in plain language:**
- the backup set status is successful or verified
- the backup set protects a configuration item affected by the incident
- the restore target environment is approved

One condition is still missing from the current model:
- whether the restore target environment is approved.

### Turn 73 — assistant

Good — that identifies one concrete remaining gap.

Short recap: the backup-set rule is mostly expressible already through BackupSet.status and BackupSet → ConfigurationItem, but it still needs a modeled way to represent whether the restore target environment is approved.

Focused question:
What modeled fact should represent **“the restore target environment is approved”**?  
Please choose the leanest fit:
1. add a property on **Environment**
2. add a property on **BackupSet**
3. add a property on **RecoveryPlan**
4. add a property on **Incident**
5. some other already-existing class — specify which and the property name.

### Turn 74 — user

Choose **1**: add a property on **Environment**.

Approval belongs to the target environment in the context of whether it may be used for restore.

I’d model it as **restore approved** on environment.

### Turn 74 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Environment:\n    properties:\n      restoreApproved:\n        type: boolean"
}
```

### Turn 74 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 74 — assistant

Recorded: `Environment.restoreApproved` as a boolean.

Short recap: that gives the model a direct way to represent whether an environment may be used as a restore target.

Now please restate the **Backup-set safe-use rule** using only captured model elements.  
Please give:
- the rule name, and
- the final plain-language conditions.

### Turn 75 — user

**Rule name:** Backup-set safe-use rule

**Conditions in plain language:**
- the backup set status is successful or verified
- the backup set protects a configuration item affected by the incident
- the recovery plan linked to the incident uses an environment with restore approved set to true

### Turn 75 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  backupSetSafeUseRule:\n    conditions:\n      - the backup set status is successful or verified\n      - the backup set protects a configuration item affected by the incident\n      - the recovery plan linked to the incident uses an environment with restore approved set to true"
}
```

### Turn 75 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 75 — assistant

Recorded.

Short recap: the **backupSetSafeUseRule** is now captured using only current model elements.

Next rule question:
Please give the rule for **which workaround can be used safely for this case**.

Please provide:
- a short rule name, and
- the plain-language conditions.

Use only currently captured model elements if possible; if a needed condition is still missing, say so explicitly.

### Turn 76 — user

**Rule name:** Workaround safe-use rule

**Conditions in plain language:**
- the incident is linked to a problem
- the problem is documented by a known error
- the known error has a workaround

In this reduced scope, that is enough to identify a workaround that is safe to use for the case.

### Turn 76 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  workaroundSafeUseRule:\n    conditions:\n      - the incident is linked to a problem\n      - the problem is documented by a known error\n      - the known error has a workaround"
}
```

### Turn 76 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 76 — assistant

Recorded.

Short recap: the **workaroundSafeUseRule** is now in place, grounded in the incident → problem → known error → workaround path.

Next rule question:
Please give the rule for **which runbook can be used safely for this case**.

Please provide:
- a short rule name, and
- the plain-language conditions.

Use only currently captured model elements if possible; if something needed is missing, say so explicitly.

### Turn 77 — user

**Rule name:** Runbook safe-use rule

**Conditions in plain language:**
- the incident is linked to the runbook
- the runbook applies to an impacted IT service or affected configuration item

One condition is still missing from the current model if you want this to be machine-checkable:
- a way to represent that a runbook applies to a specific IT service or configuration item.

### Turn 77 — assistant

Good — that identifies the exact missing fact.

Short recap: the runbook rule needs one additional modeled connection so the agent can tell whether a runbook applies to the affected service or configuration item.

Focused question:
How should **Runbook** connect in the ontology?  
Please choose the real directed relationship(s) you want:
- Runbook → ITService
- Runbook → ConfigurationItem
- both
- or a different path

And give the relationship name(s) in plain language.

### Turn 78 — user

Use **both**.

The real directed relationships I’d want are:

- **Runbook applies to IT service**
- **Runbook applies to configuration item**

That reflects day-to-day operations well. Some runbooks are service-level procedures, and others are specific to a component or platform.

### Turn 78 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: appliesToITService\n    from: Runbook\n    to: ITService\n    meaning: This links a runbook to the IT service it is intended to support.\n  - name: appliesToConfigurationItem\n    from: Runbook\n    to: ConfigurationItem\n    meaning: This links a runbook to the configuration item it is intended to support."
}
```

### Turn 78 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 78 — assistant

Recorded.

Short recap: Runbook now connects directly to both ITService and ConfigurationItem, which matches your service-level and component-level operating use.

Now please restate the **Runbook safe-use rule** using only captured model elements.  
Please give:
- the rule name, and
- the final plain-language conditions.

### Turn 79 — user

**Rule name:** Runbook safe-use rule

**Conditions in plain language:**
- the incident is handled with the runbook
- the runbook applies to an IT service impacted by the incident, or to a configuration item affected by the incident

### Turn 79 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  runbookSafeUseRule:\n    conditions:\n      - the incident is handled with the runbook\n      - the runbook applies to an IT service impacted by the incident, or to a configuration item affected by the incident"
}
```

### Turn 79 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
11 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 79 — assistant

Recorded.

Short recap: we now have separate safe-use rules for recovery plan, backup set, workaround, and runbook.

Next phase: actions. We already know the action list, but the live ontology still has 11 unresolved errors because the action inputs were created before the classes existed. We need to finish this phase properly.

First focused action question:
For these 5 actions, please confirm the single input class each action is fundamentally about:
- Acknowledge alert
- Assign incident to resolver group
- Declare major incident
- Contain incident
- Isolate affected configuration item

If you agree with the obvious input, you can answer in a compact list like:
- Acknowledge alert → Alert
- Assign incident to resolver group → Incident
… and so on.

### Turn 80 — user

- Acknowledge alert → Alert
- Assign incident to resolver group → Incident
- Declare major incident → Incident
- Contain incident → Incident
- Isolate affected configuration item → Incident

### Turn 80 — assistant

Thanks. One focused check on the last one before I record it:

You originally described **“isolate an affected configuration item”** as a specific technical action on the component itself. In this tool an action gets exactly one input class, and the best input is usually the thing fundamentally being changed.

So for **Isolate affected configuration item**, do you really want the input to be **Incident**, or should it be **ConfigurationItem**?

### Turn 81 — user

It should be **Incident** in this model.

Operationally, the isolation target is the configuration item, but the decision and authorization context comes from the incident. The preconditions depend on the item being linked to the incident, the isolation impact being assessed, and a rollback or reconnection method being available.

So the action is still performed on a configuration item, but it is initiated and governed as part of incident handling.

### Turn 81 — assistant

Understood.

Short recap: for this ontology tool, you want the input of **isolateAffectedConfigurationItem** to be **Incident**, with the configuration item represented through relationships and preconditions rather than as the action input itself.

Next action-input batch:
Please confirm the single input class for these 6 actions:
- Fail over affected service to recovery environment
- Restore data from backup
- Execute emergency change
- Send stakeholder communication
- Submit regulatory notification
- Close incident

Please answer as a compact mapping, for example:
- X → Y
- X → Y

### Turn 82 — user

- Fail over affected service to recovery environment → Incident
- Restore data from backup → Backup set
- Execute emergency change → Change
- Send stakeholder communication → Incident
- Submit regulatory notification → Regulatory notification
- Close incident → Incident

### Turn 82 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  acknowledgeAlert:\n    input: Alert\n  assignIncidentToResolverGroup:\n    input: Incident\n  declareMajorIncident:\n    input: Incident\n  containIncident:\n    input: Incident\n  isolateAffectedConfigurationItem:\n    input: Incident\n  failOverAffectedServiceToRecoveryEnvironment:\n    input: Incident\n  restoreDataFromBackup:\n    input: BackupSet\n  executeEmergencyChange:\n    input: Change\n  sendStakeholderCommunication:\n    input: Incident\n  submitRegulatoryNotification:\n    input: RegulatoryNotification\n  closeIncident:\n    input: Incident"
}
```

### Turn 82 — tool

Applied. Added 0, updated 11 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] effect-verification-mismatch — Action "closeIncident" verifies Incident.status, but its effect never says that property changes. Either say in the effect what sets it, or verify something the effect actually does.
  [warning] unreachable-from-action-input — Action "sendStakeholderCommunication" has input class Incident, and its effect refers to Communication, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Incident to Communication. Rewording the text does not create the path it assumes.

### Turn 82 — assistant

I’ve fixed the 11 missing action inputs. Two action-structure issues remain, and I need your direction on them before continuing:

1. **closeIncident**
   - current effect: “The incident is closed.”
   - current verification: “Confirm the incident status shows closed.”
   - warning: the effect should explicitly say that `Incident.status` changes, since that is what the verification checks.

2. **sendStakeholderCommunication**
   - input is `Incident`
   - current effect/verification talk about a `Communication`
   - warning: from Incident, the current canonical relationship direction is **Communication → Incident**, not **Incident → Communication**, so the model lacks a forward path from the action input to the communication record.

Focused question on the second one first:
For this ontology, which fix do you want for **sendStakeholderCommunication**?

1. Change the action input to **Communication**  
2. Keep input as **Incident**, but add a direct real relationship from **Incident → Communication**  
3. Keep input as **Incident**, and rewrite the action effect/verification so they do not require navigating from Incident to Communication

### Turn 83 — user

Choose **1**: change the action input to **Communication**.

That is the cleaner fit. The thing being created, approved, sent, and verified is the communication record itself. You can still relate that communication back to the incident through the existing communication-to-incident link.

### Turn 83 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  sendStakeholderCommunication:\n    input: Communication\n    effect: The communication status becomes submitted.\n    verification: Confirm the communication status is submitted.\n  closeIncident:\n    input: Incident\n    effect: The incident status becomes closed.\n    verification: Confirm the incident status is closed."
}
```

### Turn 83 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 83 — assistant

Resolved both warnings:
- **sendStakeholderCommunication** now uses **Communication** as its input and verifies Communication.status.
- **closeIncident** now explicitly says Incident.status becomes closed.

Short recap: the action inputs are now structurally valid, and the earlier action-input errors are resolved.

Next action-detail batch:
Please give the **preconditions** for these 4 actions, using rule names we already have where possible:
- declareMajorIncident
- closeIncident
- sendStakeholderCommunication
- submitRegulatoryNotification

If one of these needs a new rule rather than an existing one, say so explicitly.

### Turn 84 — user

Use these preconditions:

- **Declare major incident** → needs a **new rule**: **Major-incident declaration preconditions**
- **Close incident** → **Incident-closure preconditions**
- **Send stakeholder communication** → needs a **new rule**: **Stakeholder-communication send preconditions**
- **Submit regulatory notification** → needs a **new rule**: **Regulatory-notification submission preconditions**

### Turn 84 — assistant

Good — three new precondition rules are needed, and one existing rule can already be used.

Short recap:
- declareMajorIncident → new rule: Major-incident declaration preconditions
- closeIncident → existing rule: Incident-closure preconditions
- sendStakeholderCommunication → new rule: Stakeholder-communication send preconditions
- submitRegulatoryNotification → new rule: Regulatory-notification submission preconditions

Next focused question:
Please give the condition list for **Major-incident declaration preconditions**.  
This is the rule you earlier separated from pure qualification, so now we can record it in its proper place.

### Turn 85 — user

**Rule name:** Major-incident declaration preconditions

**Conditions in plain language:**
- the incident is not resolved, closed, or cancelled
- the incident severity is sev1-critical or sev2-high
- at least one impacted IT service has been identified
- an incident commander has been assigned

### Turn 85 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  majorIncidentDeclarationPreconditions:\n    conditions:\n      - the incident is not resolved, closed, or cancelled\n      - the incident severity is sev1-critical or sev2-high\n      - at least one impacted IT service has been identified\n      - an incident commander has been assigned"
}
```

### Turn 85 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 85 — assistant

Recorded.

Short recap: the distinction is now explicit in the ontology:
- **majorIncidentQualificationRule** answers whether the incident qualifies
- **majorIncidentDeclarationPreconditions** governs whether it can be formally declared

Next focused question:
Please give the condition list for **Stakeholder-communication send preconditions**.  
Use only captured properties/relationships/values if possible; if something is still missing, say so explicitly.

### Turn 86 — user

**Rule name:** Stakeholder-communication send preconditions

**Conditions in plain language:**
- the communication has an audience recorded
- the communication has a message summary recorded
- the communication is linked to an incident
- the communication is addressed to at least one stakeholder
- the communication status is approved

One thing we cannot express explicitly in the current model is whether the message content matches the latest verified incident state. That would still rely on process discipline rather than a captured field here.

### Turn 86 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  stakeholderCommunicationSendPreconditions:\n    conditions:\n      - the communication has an audience recorded\n      - the communication has a message summary recorded\n      - the communication is linked to an incident\n      - the communication is addressed to at least one stakeholder\n      - the communication status is approved"
}
```

### Turn 86 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 86 — assistant

Recorded.

Short recap: the communication-send rule is now captured using existing Communication properties and relationships, and you explicitly left message-content freshness as a process matter outside this model.

Next focused question:
Please give the condition list for **Regulatory-notification submission preconditions**.  
Use only captured properties/relationships/values if possible; if something is still missing, say so explicitly.

### Turn 87 — user

**Rule name:** Regulatory-notification submission preconditions

**Conditions in plain language:**
- the regulatory notification is linked to an incident
- the regulatory notification is sent to a regulator
- the incident has a materiality assessment whose result is reportable
- the regulatory notification status is approved
- the current time is before the regulatory notification due at time

One thing still simplified in this model is completeness of all required supporting evidence. We can link evidence to the incident, but we do not have a separate captured completeness flag on the notification itself.

### Turn 87 — assistant

This is almost recordable, but one condition exposes a real missing link:

- **“the regulatory notification is linked to an incident”**

Right now we have:
- Incident → MaterialityAssessment
- MaterialityAssessment → RegulatoryNotification
- RegulatoryNotification → Regulator

But we do **not** have a direct RegulatoryNotification ↔ Incident relationship. Since your rule names those two classes together, I need the real path decision rather than assuming a direct edge.

Focused question:
For regulatory notification and incident, which is true in your operating model?

1. No direct link — the path is only  
   Incident → MaterialityAssessment → RegulatoryNotification

2. There is also a direct link:  
   RegulatoryNotification → Incident  
   or  
   Incident → RegulatoryNotification

If 2, please give the direction and plain-language relationship name.

### Turn 88 — user

Choose **2**.

There is also a direct link:

- **Regulatory notification reports incident**

That is the cleaner operational fact. The notification is a formal submission about a specific incident, even though the assessment path is what leads to creating it.

### Turn 88 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: reportsIncident\n    from: RegulatoryNotification\n    to: Incident\n    meaning: This links a regulatory notification to the incident it formally reports."
}
```

### Turn 88 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 88 — assistant

Recorded.

Short recap: we now have both:
- the derivation path **Incident → MaterialityAssessment → RegulatoryNotification**, and
- the direct fact **RegulatoryNotification → Incident** for the formal reporting record itself.

Now please restate the **Regulatory-notification submission preconditions** rule using only captured model elements.  
Please give:
- the rule name, and
- the final plain-language conditions.

### Turn 89 — user

**Rule name:** Regulatory-notification submission preconditions

**Conditions in plain language:**
- the regulatory notification reports an incident
- the regulatory notification is sent to a regulator
- the incident reported by the regulatory notification has a materiality assessment whose result is reportable
- the regulatory notification status is approved
- the current time is before the regulatory notification due at time

### Turn 89 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  regulatoryNotificationSubmissionPreconditions:\n    conditions:\n      - the regulatory notification reports an incident\n      - the regulatory notification is sent to a regulator\n      - the incident reported by the regulatory notification has a materiality assessment whose result is reportable\n      - the regulatory notification status is approved\n      - the current time is before the regulatory notification due at time"
}
```

### Turn 89 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 89 — assistant

Recorded.

Short recap: the regulatory-notification submission rule is now captured cleanly against the current model.

Next action-detail batch:
Please give the **preconditions** for these 4 actions:
- acknowledgeAlert
- assignIncidentToResolverGroup
- failOverAffectedServiceToRecoveryEnvironment
- restoreDataFromBackup

Use existing rule names where possible. If a new rule is needed, name it explicitly.

### Turn 90 — user

- **Acknowledge alert** → needs a rule: **Alert-acknowledgement preconditions**
- **Assign incident to resolver group** → needs a rule: **Incident-assignment preconditions**
- **Fail over affected service to recovery environment** → needs a rule: **Service-failover preconditions**
- **Restore data from backup** → needs a rule: **Backup-restore preconditions**

### Turn 90 — assistant

Good.

Short recap: four more action precondition rules are needed:
- Alert-acknowledgement preconditions
- Incident-assignment preconditions
- Service-failover preconditions
- Backup-restore preconditions

Next focused question:
Please give the condition list for **Alert-acknowledgement preconditions**.  
Use only captured properties/relationships/values if possible.

### Turn 91 — user

**Rule name:** Alert-acknowledgement preconditions

**Conditions in plain language:**
- the alert status is new
- the operator is authorized for the responsible resolver group

One condition is not yet represented in the current ontology:
- operator authorization for the responsible resolver group.

### Turn 91 — assistant

That exposes a genuine missing fact, so I need to resolve it before recording the rule.

Focused question:
What is the leanest modeled fact for **“operator is authorized for the responsible resolver group”** in this ontology?

Please choose one:
1. add a property on **OnCallEngineer**
2. add a relationship between **OnCallEngineer** and **ResolverGroup** beyond membership
3. add a property on **ResolverGroup**
4. leave this outside the ontology and simplify the rule to use only captured facts

If you choose 1, 2, or 3, please give the exact property/relationship name.

### Turn 92 — user

Choose **4**.

Leave that authorization detail outside the ontology and simplify the rule to use only captured facts.

It is operationally real, but it belongs more to access control and tooling permissions than to the incident domain model itself.

### Turn 92 — assistant

Understood.

Short recap: we are explicitly leaving operator authorization outside the ontology and keeping the alert-acknowledgement rule domain-focused.

Now please restate the final simplified **Alert-acknowledgement preconditions** rule using only captured model elements.

### Turn 93 — user

**Rule name:** Alert-acknowledgement preconditions

**Conditions in plain language:**
- the alert status is new

### Turn 93 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  alertAcknowledgementPreconditions:\n    conditions:\n      - the alert status is new"
}
```

### Turn 93 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 93 — assistant

Recorded.

Short recap: `alertAcknowledgementPreconditions` is now in place, and authorization has been deliberately left outside the ontology.

Next focused question:
Please give the condition list for **Incident-assignment preconditions**.  
Use only captured model elements if possible; if something is still missing, say so explicitly.

### Turn 94 — user

**Rule name:** Incident-assignment preconditions

**Conditions in plain language:**
- the incident is not closed or cancelled
- the resolver group supports an IT service impacted by the incident, or a configuration item affected by the incident

That can be expressed with the model you already have.

### Turn 94 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  incidentAssignmentPreconditions:\n    conditions:\n      - the incident is not closed or cancelled\n      - the resolver group supports an IT service impacted by the incident, or a configuration item affected by the incident"
}
```

### Turn 94 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 94 — assistant

Recorded.

Short recap: `incidentAssignmentPreconditions` now uses the support-path logic you wanted, rather than treating assignment as an arbitrary direct choice.

Next focused question:
Please give the condition list for **Service-failover preconditions**.  
Use only captured model elements if possible; if something is still missing, say so explicitly.

### Turn 95 — user

**Rule name:** Service-failover preconditions

**Conditions in plain language:**
- the incident has a linked recovery plan
- the recovery plan recovers an IT service impacted by the incident
- the recovery plan uses an environment whose availability status is available
- the incident has recovery point accepted set to true

### Turn 95 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  serviceFailoverPreconditions:\n    conditions:\n      - the incident has a linked recovery plan\n      - the recovery plan recovers an IT service impacted by the incident\n      - the recovery plan uses an environment whose availability status is available\n      - the incident has recovery point accepted set to true"
}
```

### Turn 95 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 95 — assistant

Recorded.

Short recap: `serviceFailoverPreconditions` is now aligned with the recovery-plan path and the environment/recovery-point conditions already in the model.

Next focused question:
Please give the condition list for **Backup-restore preconditions**.  
Use only captured model elements if possible; if something is still missing, say so explicitly.

### Turn 96 — user

**Rule name:** Backup-restore preconditions

**Conditions in plain language:**
- the backup set status is successful or verified
- the backup set protects a configuration item affected by the incident
- the recovery plan linked to the incident uses an environment with restore approved set to true

### Turn 96 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  backupRestorePreconditions:\n    conditions:\n      - the backup set status is successful or verified\n      - the backup set protects a configuration item affected by the incident\n      - the recovery plan linked to the incident uses an environment with restore approved set to true"
}
```

### Turn 96 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 96 — assistant

Recorded.

Short recap: `backupRestorePreconditions` is now captured and consistent with the backup and recovery-path modeling already in place.

Next action-detail batch:
Please give the **preconditions** for these remaining 3 actions:
- containIncident
- isolateAffectedConfigurationItem
- executeEmergencyChange

Use existing rule names where possible; if a new rule is needed, name it explicitly.

### Turn 97 — user

- **Contain incident** → needs a rule: **Incident-containment preconditions**
- **Isolate affected configuration item** → needs a rule: **Configuration-item isolation preconditions**
- **Execute emergency change** → needs a rule: **Emergency-change execution preconditions**

### Turn 97 — assistant

Good.

Short recap: three final action precondition rules are needed:
- Incident-containment preconditions
- Configuration-item isolation preconditions
- Emergency-change execution preconditions

Next focused question:
Please give the condition list for **Incident-containment preconditions**.  
Use only captured model elements if possible; if something is still missing, say so explicitly.

### Turn 98 — user

**Rule name:** Incident-containment preconditions

**Conditions in plain language:**
- the incident status is acknowledged or investigating

One operational condition is still outside the current model:
- containment scope and expected side effects are recorded.

### Turn 98 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  incidentContainmentPreconditions:\n    conditions:\n      - the incident status is acknowledged or investigating"
}
```

### Turn 98 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 98 — assistant

Recorded.

Short recap: `incidentContainmentPreconditions` is now in place, and you explicitly left containment scope/side effects outside this ontology.

Next focused question:
Please give the condition list for **Configuration-item isolation preconditions**.  
Use only captured model elements if possible; if something is still missing, say so explicitly.

### Turn 99 — user

**Rule name:** Configuration-item isolation preconditions

**Conditions in plain language:**
- the incident affects at least one configuration item

Two operational conditions are still outside the current model:
- isolation impact is assessed
- a rollback or reconnection method is available.

### Turn 99 — assistant

This exposes one more actual modeling gap before I can record the rule as written:

We currently have paths from Incident to ITService and Event to ConfigurationItem, and from ITService/Application to ConfigurationItem, but we do **not** yet have a direct modeled fact that an **Incident affects a ConfigurationItem**.

Focused question:
Which real relationship do you want here?

1. Add a direct relationship  
   **Incident → ConfigurationItem**  
   with a name like “affectsConfigurationItem” or your preferred wording

2. Do **not** add a direct link, and instead rewrite the rule to use an existing path through ITService/Event/etc.

### Turn 100 — user

Choose **1**.

Add the direct relationship:

- **Incident affects configuration item**

That is a real and useful operational fact in its own right. We often know the affected component directly during diagnosis, and isolation decisions are cleaner if that connection is explicit rather than inferred indirectly.

### Turn 100 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: affectsConfigurationItem\n    from: Incident\n    to: ConfigurationItem\n    meaning: This links an incident to a configuration item directly affected by it."
}
```

### Turn 100 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 100 — assistant

Recorded.

Short recap: we now have a direct `Incident → ConfigurationItem` relationship, which you confirmed is a real operational fact and not just an inferred path.

Now please restate the final **Configuration-item isolation preconditions** rule using only captured model elements.

### Turn 101 — user

**Rule name:** Configuration-item isolation preconditions

**Conditions in plain language:**
- the incident affects at least one configuration item

### Turn 101 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  configurationItemIsolationPreconditions:\n    conditions:\n      - the incident affects at least one configuration item"
}
```

### Turn 101 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 101 — assistant

Recorded.

Short recap: `configurationItemIsolationPreconditions` is now in place, using the direct Incident → ConfigurationItem relationship you just added.

Next focused question:
Please give the condition list for **Emergency-change execution preconditions**.  
Use only captured model elements if possible; if something is still missing, say so explicitly.

### Turn 102 — user

**Rule name:** Emergency-change execution preconditions

**Conditions in plain language:**
- the change is linked to an incident that is not resolved, closed, or cancelled
- the change has an implementation plan
- the change has a backout plan
- the change affects at least one IT service, or modifies at least one configuration item
- the change risk level is explicitly set

One thing still outside the current model is explicit risk acceptance as a separate captured fact.

### Turn 102 — assistant

This is almost recordable, but one condition needs a real link we do not yet have:

- **“the change is linked to an incident”**

At the moment we have:
- Change → ITService
- Change → ConfigurationItem
- Incident → ITService
- Incident → ConfigurationItem
- and the CQ “Was this incident caused by a recent change?”

So we do need a path between Incident and Change. I should not assume it is direct without your confirmation.

Focused question:
Do you want a direct relationship between **Incident** and **Change** here?  
If yes, please give the direction and name. For example, something like:
- Incident → Change
- Change → Incident

with your actual wording for the relationship.

### Turn 103 — user

Yes, I want a direct relationship here.

Use:

- **Incident is resolved by change**

That is the operational link I’d keep. It ties the change record directly to the incident it addresses, which is important both for emergency change handling and for the question about whether change activity was involved in resolution.

### Turn 103 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: resolvedByChange\n    from: Incident\n    to: Change\n    meaning: This links an incident to the change used to address or resolve it."
}
```

### Turn 103 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 103 — assistant

Recorded.

Short recap: we now have a direct `Incident → Change` relationship for the change used to address or resolve the incident. That gives the emergency-change action and the change-involvement question a clean operational link.

Now please restate the final **Emergency-change execution preconditions** rule using only captured model elements.

### Turn 104 — user

**Rule name:** Emergency-change execution preconditions

**Conditions in plain language:**
- the change is linked from at least one incident that is not resolved, closed, or cancelled
- the change has an implementation plan
- the change has a backout plan
- the change affects at least one IT service, or modifies at least one configuration item
- the change risk level is set to low, medium, high, or critical

### Turn 104 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  emergencyChangeExecutionPreconditions:\n    conditions:\n      - the change is linked from at least one incident that is not resolved, closed, or cancelled\n      - the change has an implementation plan\n      - the change has a backout plan\n      - the change affects at least one IT service, or modifies at least one configuration item\n      - the change risk level is set to low, medium, high, or critical"
}
```

### Turn 104 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 104 — assistant

Recorded.

Short recap: all three remaining operational-action rule families are now captured, including the direct incident-to-change link needed for emergency change.

Before moving on, I need to finish the action definitions themselves by attaching these precondition rules.

Focused action batch:
Please confirm the rule mapping for these 11 actions:

- acknowledgeAlert → alertAcknowledgementPreconditions
- assignIncidentToResolverGroup → incidentAssignmentPreconditions
- declareMajorIncident → majorIncidentDeclarationPreconditions
- containIncident → incidentContainmentPreconditions
- isolateAffectedConfigurationItem → configurationItemIsolationPreconditions
- failOverAffectedServiceToRecoveryEnvironment → serviceFailoverPreconditions
- restoreDataFromBackup → backupRestorePreconditions
- executeEmergencyChange → emergencyChangeExecutionPreconditions
- sendStakeholderCommunication → stakeholderCommunicationSendPreconditions
- submitRegulatoryNotification → regulatoryNotificationSubmissionPreconditions
- closeIncident → incidentClosurePreconditions

Please confirm or correct any of them.

### Turn 105 — user

That mapping is correct.

### Turn 105 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  acknowledgeAlert:\n    preconditions: [alertAcknowledgementPreconditions]\n  assignIncidentToResolverGroup:\n    preconditions: [incidentAssignmentPreconditions]\n  declareMajorIncident:\n    preconditions: [majorIncidentDeclarationPreconditions]\n  containIncident:\n    preconditions: [incidentContainmentPreconditions]\n  isolateAffectedConfigurationItem:\n    preconditions: [configurationItemIsolationPreconditions]\n  failOverAffectedServiceToRecoveryEnvironment:\n    preconditions: [serviceFailoverPreconditions]\n  restoreDataFromBackup:\n    preconditions: [backupRestorePreconditions]\n  executeEmergencyChange:\n    preconditions: [emergencyChangeExecutionPreconditions]\n  sendStakeholderCommunication:\n    preconditions: [stakeholderCommunicationSendPreconditions]\n  submitRegulatoryNotification:\n    preconditions: [regulatoryNotificationSubmissionPreconditions]\n  closeIncident:\n    preconditions: [incidentClosurePreconditions]"
}
```

### Turn 105 — tool

Applied. Added 0, updated 11 existing item(s).

CONSISTENCY CHECK — 4 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "closeIncident" has input class Incident, and its precondition incidentClosurePreconditions refers to Communication, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Incident to Communication. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its precondition emergencyChangeExecutionPreconditions refers to Incident, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Change to Incident. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "restoreDataFromBackup" has input class BackupSet, and its precondition backupRestorePreconditions refers to Incident, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from BackupSet to Incident. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "restoreDataFromBackup" has input class BackupSet, and its precondition backupRestorePreconditions refers to RecoveryPlan, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from BackupSet to RecoveryPlan. Rewording the text does not create the path it assumes.

### Turn 105 — assistant

I attached the precondition rules, and the model is structurally much stronger now. The tool surfaced 4 remaining path issues in action execution, all real enough to address:

1. **closeIncident**  
   Input = Incident, but its precondition refers to **Communication**, and the current canonical link is only **Communication → Incident**.

2. **executeEmergencyChange**  
   Input = Change, but its precondition refers to **Incident**, and the current direct link is only **Incident → Change**.

3. **restoreDataFromBackup**  
   Input = BackupSet, but its precondition refers to **Incident**, and there is no navigable path from BackupSet to Incident in the stored directions.

4. **restoreDataFromBackup**  
   Input = BackupSet, but its precondition refers to **RecoveryPlan**, and the current link is only **RecoveryPlan → BackupSet**.

I should handle these one at a time.

Focused question on the first one:
For **closeIncident**, do you want to fix the Communication path by:

1. adding a direct real relationship **Incident → Communication**,  
2. changing the action input from **Incident** to **Communication**, or  
3. simplifying `incidentClosurePreconditions` so it no longer refers to Communication?

### Turn 106 — user

Choose **3**.

Keep the action input as **Incident** and simplify the closure preconditions so they no longer depend on navigating to communication records.

That is the better tradeoff here. Closure is fundamentally an incident action, and I would not distort the model just to force a forward path to communications.

### Turn 106 — assistant

Understood.

Short recap: we are keeping **closeIncident** centered on Incident and simplifying the closure rule rather than adding a reverse Incident → Communication edge.

Now please restate the simplified **incidentClosurePreconditions** rule without any reference to Communication.

### Turn 107 — user

**Rule name:** Incident-closure preconditions

**Conditions in plain language:**
- the incident status is resolved or monitoring
- each impacted IT service has health state healthy, or the incident has residual condition accepted set to true
- the incident has at least one linked evidence item
- if the incident is being handled as a major incident, it has at least one linked post-incident review

### Turn 107 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  incidentClosurePreconditions:\n    conditions:\n      - the incident status is resolved or monitoring\n      - each impacted IT service has health state healthy, or the incident has residual condition accepted set to true\n      - the incident has at least one linked evidence item\n      - if the incident is being handled as a major incident, it has at least one linked post-incident review"
}
```

### Turn 107 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 107 — assistant

Resolved the `closeIncident` path issue.

Short recap: `incidentClosurePreconditions` no longer depends on Communication, so **closeIncident** now fits its Incident input cleanly.

Next focused issue:
For **executeEmergencyChange**, the input is **Change**, but the precondition currently refers to Incident through a relationship stored only as **Incident → Change**.

Which fix do you want?

1. Add a direct real relationship **Change → Incident** as well  
2. Change the action input from **Change** to **Incident**  
3. Simplify `emergencyChangeExecutionPreconditions` so it no longer refers to Incident

### Turn 108 — user

Choose **2**.

Change the action input from **Change** to **Incident**.

Operationally, the emergency change exists because of the active incident, and the decision to execute it is governed in the incident context. The change record still matters, but the action is best anchored on the incident in this constrained tool.

### Turn 108 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  executeEmergencyChange:\n    input: Incident\n    effect: The linked change is executed.\n    verification: Confirm the linked change record reflects the executed change."
}
```

### Turn 108 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 108 — assistant

Resolved that one too: **executeEmergencyChange** now uses **Incident** as its input, with the linked Change handled through relationships.

Short recap: that keeps the action aligned with your operational governance context.

Next focused issue:
For **restoreDataFromBackup**, the input is **BackupSet**, but the precondition depends on both **Incident** and **RecoveryPlan**, which are only reachable in the opposite direction from the current links.

Which fix do you want?

1. Add reverse/direct links from BackupSet to RecoveryPlan and/or Incident  
2. Change the action input from **BackupSet** to **Incident**  
3. Change the action input from **BackupSet** to **RecoveryPlan**  
4. Simplify `backupRestorePreconditions` so it no longer refers to Incident/RecoveryPlan

### Turn 109 — user

Choose **2**.

Change the action input from **Backup set** to **Incident**.

In real operations, restoring from backup is not just a property of the backup artifact. It is an incident-driven recovery action, chosen in the context of the affected service, configuration item, recovery plan, and target environment. So incident is the better anchor in this tool.

### Turn 109 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  restoreDataFromBackup:\n    input: Incident\n    effect: Data is restored from a selected backup set through the linked recovery plan.\n    verification: Confirm the intended data has been restored and the selected backup set and recovery path are recorded against the incident."
}
```

### Turn 109 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 109 — assistant

Resolved — **restoreDataFromBackup** now uses **Incident** as its input, which fits the recovery context you described.

Short recap: all previously flagged action-path issues are now closed, and the action layer is structurally coherent again.

Next required step is the bounded domain-expansion pass. This is not open-ended brainstorming; I’ll ask narrowly by major concept and only where there are plausible neighboring structures not yet covered.

First bounded expansion check:
We have the operational core for **ITService**, **Application**, and **ConfigurationItem**. Are we missing any of these that matter for your accepted questions/actions:
- subordinate parts/components,
- inputs/outputs,
- related agreements/documents,
- measurements/characteristic values,
- earlier/later workflow stages

Only mention items that the agent would actually need for the accepted question/action set, not general nice-to-have modeling.

### Turn 110 — user

Yes — a few nearby things still matter for the accepted set.

- **Measurements / characteristic values:** metric matters, because alerts come from monitored conditions and incident triage often depends on service or component measurements.
- **Related documents / agreements:** service level objective matters, because service importance and restoration expectations are interpreted against defined targets.
- **Inputs / outputs:** integration interface matters, because application and service dependencies often sit on interfaces and that affects diagnosis and recovery choices.
- **Earlier / later workflow stages:** deployment matters, because one accepted question is whether the incident was caused by a recent deployment.

I would not add a generic subordinate-parts structure here beyond what you already have. For this scope, that would add complexity faster than value.

### Turn 110 — assistant

Helpful — that bounded pass found four plausible additions tied back to accepted questions/actions.

Short recap: you identified four adjacent items that do matter here:
- Metric
- ServiceLevelObjective
- IntegrationInterface
- Deployment

Before adding any of them, I need to test them as classes, one small batch at a time.

First follow-up batch:
Does the agent need to identify, retrieve, connect, or pass these separately?
- Metric
- IntegrationInterface
- Deployment

Please answer keep/remove for each, with a brief correction only if one should be named differently.

### Turn 111 — user

- **Metric** — keep.
- **Integration interface** — keep.
- **Deployment** — keep.

### Turn 111 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Metric: {}\n  IntegrationInterface:\n    aliases: [integration interface]\n  Deployment: {}"
}
```

### Turn 111 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 111 — assistant

Recorded.

Short recap: Metric, IntegrationInterface, and Deployment are now confirmed as classes justified by triage, dependency diagnosis, and the “recent deployment” causation question.

Next follow-up question:
For **ServiceLevelObjective**, does the agent need to identify, retrieve, connect, or pass it separately as a class, or is it better modeled as a property/value on ITService in this ontology?  
Please answer:
- keep as class
- property instead of class
- remove

### Turn 112 — user

Keep as class.

### Turn 112 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceLevelObjective: {}"
}
```

### Turn 112 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 112 — assistant

Recorded.

Short recap: ServiceLevelObjective is now confirmed as its own class rather than being reduced to a simple ITService property.

Because these classes were introduced after the earlier relationship pass, I now need the required path check for them.

Focused relationship question:
How should these new classes connect into the existing model?
- Alert ↔ Metric
- ITService ↔ Metric
- ConfigurationItem ↔ Metric
- Application ↔ IntegrationInterface
- ITService ↔ ServiceLevelObjective
- Incident ↔ Deployment
- Application ↔ Deployment

Please give the real directed relationship(s) you want for each pair you keep, and say “no direct link” where the connection should stay indirect.

### Turn 113 — user

Here’s how I’d connect them.

- **Alert ↔ Metric** — no direct link
  - The cleaner path is through the monitoring rule.

- **IT service ↔ Metric**
  - **Metric measures IT service**

- **Configuration item ↔ Metric**
  - **Metric measures configuration item**

- **Application ↔ Integration interface**
  - **Application consumes integration interface**
  - and, separately in the broader service path, an IT service may expose an integration interface

- **IT service ↔ Service level objective**
  - **IT service is governed by service level objective**

- **Incident ↔ Deployment** — no direct link in this scope

- **Application ↔ Deployment**
  - **Deployment deploys application**

### Turn 113 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: measuresITService\n    from: Metric\n    to: ITService\n    meaning: This links a metric to the IT service it measures.\n  - name: measuresConfigurationItem\n    from: Metric\n    to: ConfigurationItem\n    meaning: This links a metric to the configuration item it measures.\n  - name: consumesIntegrationInterface\n    from: Application\n    to: IntegrationInterface\n    meaning: This links an application to the integration interface it consumes.\n  - name: governedByServiceLevelObjective\n    from: ITService\n    to: ServiceLevelObjective\n    meaning: This links an IT service to the service level objective that governs it.\n  - name: deploysApplication\n    from: Deployment\n    to: Application\n    meaning: This links a deployment to the application it deploys."
}
```

### Turn 113 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 113 — assistant

Recorded.

Short recap: the new expansion classes are now connected through measurement, interface consumption, service-level governance, and deployment paths. You explicitly kept Alert↔Metric and Incident↔Deployment indirect in this scope.

One relationship remains explicitly mentioned but not yet captured:
You said **“an IT service may expose an integration interface.”**

Focused question:
Do you want that stored as a real relationship in this ontology?  
If yes, please confirm the direction and name:
- ITService → IntegrationInterface with something like **exposesIntegrationInterface**
or give your preferred wording.  
If no, I’ll leave it out.

### Turn 114 — user

Yes, keep it.

Use:

- **IT service exposes integration interface**

### Turn 114 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: exposesIntegrationInterface\n    from: ITService\n    to: IntegrationInterface\n    meaning: This links an IT service to an integration interface it exposes."
}
```

### Turn 114 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 114 — assistant

Recorded.

Short recap: `ITService → IntegrationInterface` is now captured as a real relationship, which completes the interface side of the bounded expansion you raised.

Next bounded expansion check:
We have the operational core for **Incident**, **Communication**, **RegulatoryNotification**, and **EvidenceItem**. Are we missing any of these that matter for your accepted questions/actions:
- states or lifecycle events,
- responsible parties,
- related documents/agreements,
- measurements/characteristic values,
- earlier/later workflow stages

Only mention items that the agent actually needs for the accepted question/action set.

### Turn 115 — user

For that area, I would say you are mostly covered already.

The one adjacent thing that still matters for the accepted set is:

- **Cybersecurity incident** — because some incidents follow a security-specific handling path, especially around evidence preservation, materiality assessment, and possible regulatory notification.

I would not add more around generic lifecycle events or extra document types for this scope. The current model already covers the core operational needs there.

### Turn 115 — assistant

That is a good bounded addition candidate, but I need to test it against the accepted scope before adding it.

Focused question:
Does the agent need to identify, retrieve, connect, or pass **CybersecurityIncident** separately for your accepted questions/actions, or is “cybersecurity” already sufficiently handled as an Incident.category value in this ontology?

Please answer:
- keep as class
- category value is enough
- remove

### Turn 116 — user

Keep as class.

### Turn 116 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CybersecurityIncident:\n    aliases: [cybersecurity incident]"
}
```

### Turn 116 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 116 — assistant

Recorded.

Short recap: CybersecurityIncident is now confirmed as a separate class, meaning your model will distinguish the security-specific incident path rather than relying only on Incident.category.

Because this class was introduced late, it needs its own relationship pass now.

Focused relationship question:
How should **CybersecurityIncident** connect into the current model?  
Please describe the real path(s) you want, especially among these:
- CybersecurityIncident ↔ Incident
- CybersecurityIncident ↔ SecurityEvent
- CybersecurityIncident ↔ EvidenceItem
- CybersecurityIncident ↔ RegulatoryNotification
- CybersecurityIncident ↔ MaterialityAssessment
- CybersecurityIncident ↔ SecurityOperationsCentre

Please give the directed relationship(s) you actually want, and avoid subclass-style wording if possible.

### Turn 117 — user

In practical terms, cybersecurity incident is still an incident under a security-specific handling path. Since your tool cannot do subtype modeling cleanly, I’d connect it through the security workflow rather than trying to fake inheritance.

The relationships I’d want are:

- **Cybersecurity incident is derived from security event**
- **Cybersecurity incident requires preservation of evidence item**
- **Cybersecurity incident requires materiality assessment**
- **Cybersecurity incident may require regulatory notification**
- **Security operations centre monitors security event**

For **cybersecurity incident ↔ incident**, I would **not** add a separate ordinary connector in this tool if the purpose is just to simulate subtype behavior. That would be more misleading than helpful.

So the security-specific path stands on its own around security event, evidence, assessment, and possible notification.

### Turn 117 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: derivedFromSecurityEvent\n    from: CybersecurityIncident\n    to: SecurityEvent\n    meaning: This links a cybersecurity incident to the security event it is derived from.\n  - name: requiresPreservationOfEvidenceItem\n    from: CybersecurityIncident\n    to: EvidenceItem\n    meaning: This links a cybersecurity incident to an evidence item whose preservation is required.\n  - name: requiresMaterialityAssessment\n    from: CybersecurityIncident\n    to: MaterialityAssessment\n    meaning: This links a cybersecurity incident to the materiality assessment required for it.\n  - name: mayRequireRegulatoryNotification\n    from: CybersecurityIncident\n    to: RegulatoryNotification\n    meaning: This links a cybersecurity incident to a regulatory notification that may be required for it."
}
```

### Turn 117 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 117 — assistant

Recorded.

Short recap: CybersecurityIncident is now connected through the security-specific workflow you described: security event, evidence preservation, materiality assessment, and possible regulatory notification. I did **not** add a fake ordinary Incident↔CybersecurityIncident link, per your instruction.

We have now completed the bounded expansion pass with real, justified additions only.

Next is the validation pass. I need to run the competency check against the persisted ontology and then the final checklist against the live graph state.

### Turn 118 — user

All right — that sounds like the right point for your validation pass.

### Turn 118 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 118 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by this incident?
  - id: cq2
    text: Which customer channels are impacted by this incident?
  - id: cq3
    text: Which configuration items sit on the dependency path of the affected IT service?
  - id: cq4
    text: Which third-party services sit on the dependency path of the affected IT service?
  - id: cq5
    text: Which active alerts are correlated with this incident?
  - id: cq6
    text: Which events are correlated with this incident?
  - id: cq7
    text: Who owns the affected service?
  - id: cq8
    text: Which resolver group should be assigned to this incident?
  - id: cq9
    text: Which on-call engineer should handle this incident?
  - id: cq10
    text: Does this incident meet the criteria to be treated as a major incident?
  - id: cq11
    text: Which runbook can be used safely for this case?
  - id: cq12
    text: Which workaround can be used safely for this case?
  - id: cq13
    text: Which backup set can be used safely for this case?
  - id: cq14
    text: Which recovery plan can be used safely for this case?
  - id: cq15
    text: Was this incident caused by a recent change?
  - id: cq16
    text: Is a materiality assessment complete?
  - id: cq17
    text: "Is a regulatory notification required, and when is it due?"
  - id: cq18
    text: "Are evidence integrity, stakeholder communications, and closure conditions complete?"
  - id: cq19
    text: Which stakeholders have already been notified about this incident?
  - id: cq20
    text: Which vendor should this incident be escalated to?
  - id: cq21
    text: Which corrective actions from earlier post-incident reviews remain open for the affected service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security condition that requires managed response."
    aliases: []
    properties:
      summary:
        type: text
      description:
        type: text
      detectedAt:
        type: date
      openedAt:
        type: date
      resolvedAt:
        type: date
      closedAt:
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
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      priority:
        type: text
        allowed:
          - p1-critical
          - p2-high
          - p3-medium
          - p4-low
      impact:
        type: text
        allowed:
          - enterprise-wide
          - multiple-services
          - single-service
          - limited-users
          - no-observed-impact
      urgency:
        type: text
        allowed:
          - immediate
          - high
          - normal
          - low
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
      recurring:
        type: boolean
      timeToAcknowledge:
        type: number
      timeToRestore:
        type: number
      residualConditionAccepted:
        type: boolean
      recoveryPointAccepted:
        type: boolean
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
    meaning: A customer channel is a route through which customers access banking services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within the bank’s configuration-management scope.
    aliases:
      - configuration item
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
      - third-party service
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
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - backup set
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - running
          - successful
          - failed
          - expired
          - corrupted
          - verified
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - recovery plan
    properties:
      recoveryTimeObjective:
        type: text
      recoveryPointObjective:
        type: text
      lastReviewDate:
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
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of incident significance and reporting implications.
    aliases:
      - materiality assessment
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
      - regulatory notification
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
  EvidenceItem:
    meaning: "An evidence item is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - evidence item
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
  Communication:
    meaning: "A communication is a controlled message sent to operational, business, customer, vendor, or regulatory audiences."
    aliases:
      - communication
      - stakeholder communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
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
  CorrectiveAction:
    meaning: "A corrective action is a tracked action intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - corrective action
    properties:
      actionDescription:
        type: text
      status:
        type: text
      dueDate:
        type: date
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases:
      - service owner
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - resolver group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for time-critical operational response.
    aliases:
      - on-call engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - incident commander
    properties: {}
  IncidentResponseTeam:
    meaning: An incident response team is the cross-functional team responsible for coordinating significant incident response.
    aliases:
      - incident response team
    properties: {}
  ServiceDesk:
    meaning: "A service desk is the first-line function that receives, records, triages, and routes user-reported issues."
    aliases:
      - service desk
    properties: {}
  ITOperationsTeam:
    meaning: An IT operations team is the team responsible for reliable day-to-day operation of IT services.
    aliases:
      - IT operations team
    properties: {}
  NetworkOperationsCentre:
    meaning: A network operations centre is the function that monitors and operates network and infrastructure services.
    aliases:
      - network operations centre
    properties: {}
  SecurityOperationsCentre:
    meaning: "A security operations centre is the function that monitors, investigates, and coordinates response to cyber threats."
    aliases:
      - security operations centre
    properties: {}
  ApplicationOwner:
    meaning: An application owner is the role accountable for an application and its operational fitness.
    aliases:
      - application owner
    properties: {}
  TechnicalOwner:
    meaning: A technical owner is the role accountable for the engineering and maintenance of a configuration item.
    aliases:
      - technical owner
    properties: {}
  BusinessOwner:
    meaning: A business owner is the business role accountable for a business service or process.
    aliases:
      - business owner
    properties: {}
  Stakeholder:
    meaning: "A stakeholder is a person, group, or organization affected by or responsible for an operational outcome."
    aliases: []
    properties:
      name:
        type: text
      audienceType:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
  Vendor:
    meaning: A vendor is an external organization that supplies or supports technology or services.
    aliases:
      - supplier
      - external supplier
      - third-party provider
    properties:
      legalName:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  Regulator:
    meaning: A regulator is a competent authority that supervises the bank or receives required notifications.
    aliases:
      - supervisory authority
      - competent authority
    properties: {}
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      availabilityStatus:
        type: text
        allowed:
          - available
          - unavailable
          - degraded
          - unknown
      restoreApproved:
        type: boolean
  Application:
    meaning: An application is a software system that delivers business or operational functionality.
    aliases: []
    properties: {}
  Problem:
    meaning: A problem is the underlying cause or potential cause of one or more incidents.
    aliases: []
    properties: {}
  KnownError:
    meaning: A known error is a diagnosed problem with a documented cause or workaround.
    aliases:
      - known error
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - post-incident review
    properties:
      heldOn:
        type: date
      findings:
        type: text
  MonitoringTool:
    meaning: A monitoring tool is a platform that collects telemetry and evaluates operational conditions.
    aliases:
      - monitoring tool
    properties: {}
  SecurityEvent:
    meaning: "A security event is an event relevant to confidentiality, integrity, availability, authenticity, or cyber threat activity."
    aliases:
      - security event
    properties: {}
  MonitoringRule:
    meaning: A monitoring rule is a defined condition that evaluates telemetry and may generate an alert.
    aliases:
      - monitoring rule
    properties: {}
  Metric:
    meaning: null
    aliases: []
    properties: {}
  IntegrationInterface:
    meaning: null
    aliases:
      - integration interface
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  ServiceLevelObjective:
    meaning: null
    aliases: []
    properties: {}
  CybersecurityIncident:
    meaning: null
    aliases:
      - cybersecurity incident
    properties: {}
relationships:
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: This links an incident to a business service whose operation is affected by the incident.
    aliases:
      - affects business service
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: This links a business service to the customer channel through which the service is provided.
    aliases: []
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: This links an incident to an IT service whose operation is affected by the incident.
    aliases:
      - affects IT service
  - name: implementedBy
    from: ITService
    to: Application
    meaning: This links an IT service to the application that delivers that technical capability.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: This links an IT service to an external service it relies on.
    aliases:
      - relies on external service
  - name: runsInEnvironment
    from: ITService
    to: Environment
    meaning: This links an IT service to the environment where it is deployed or operating.
    aliases: []
  - name: runsOnConfigurationItem
    from: ITService
    to: ConfigurationItem
    meaning: This links an IT service to the technical component it runs on.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: This links an application to the configuration item that hosts or executes it.
    aliases: []
  - name: usesConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: This links an IT service or application to a configuration item it relies on operationally.
    aliases: []
  - name: ownedByServiceOwner
    from: ITService
    to: ServiceOwner
    meaning: This links an IT service to the role accountable for it across its lifecycle.
    aliases: []
  - name: ownedByApplicationOwner
    from: Application
    to: ApplicationOwner
    meaning: This links an application to the role accountable for its operational fitness.
    aliases: []
  - name: ownedByTechnicalOwner
    from: ConfigurationItem
    to: TechnicalOwner
    meaning: This links a configuration item to the role accountable for its engineering and maintenance.
    aliases: []
  - name: accountableToBusinessOwner
    from: BusinessService
    to: BusinessOwner
    meaning: This links a business service to the business role accountable for it.
    aliases: []
  - name: supportedByVendor
    from: Application
    to: Vendor
    meaning: This links an application to the vendor that supplies support for it.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: This links a third-party service to the vendor that provides it.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: This links an incident to the resolver group responsible for diagnosing and restoring it.
    aliases:
      - assigned to support group
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: This links an incident to the on-call engineer currently handling the time-critical response.
    aliases:
      - owned by on-call
      - handled by duty engineer
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: This links an incident to the vendor engaged for external support or resolution.
    aliases:
      - escalated to supplier
      - handed off to vendor
  - name: supportedByResolverGroup
    from: ITService
    to: ResolverGroup
    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling.
    aliases:
      - covered by resolver group
      - supported by support group
  - name: supportedByResolverGroup
    from: ConfigurationItem
    to: ResolverGroup
    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling.
    aliases:
      - covered by resolver group
      - supported by support group
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: This links an on-call engineer to the resolver group they belong to.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: This links an incident to the alert that opened or initiated it.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: This links an incident to an event that has been correlated into the incident record.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "This links an incident to the runbook used to diagnose, respond to, recover, or verify it."
    aliases: []
  - name: supportedByEvidenceItem
    from: Incident
    to: EvidenceItem
    meaning: "This links an incident to the preserved evidence that supports analysis, accountability, or verification."
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: This links an incident to the assessment that determines its significance and reporting implications.
    aliases:
      - assessed for reportability
  - name: recoveredWithRecoveryPlan
    from: Incident
    to: RecoveryPlan
    meaning: This links an incident to the recovery plan used to restore the affected service.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: This links an incident to the underlying cause record associated with it.
    aliases:
      - associated with problem
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: This links a problem to the known error record that captures its diagnosed cause or workaround.
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: This links a known error to the workaround that can reduce or bypass its impact.
    aliases:
      - has temporary fix
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: This links a recovery plan to the backup set used during restoration.
    aliases:
      - restores from backup set
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: This links a materiality assessment to the regulatory notification required by its outcome.
    aliases:
      - leads to regulatory notification
      - requires regulatory notification
  - name: reviewedInPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: "This links an incident to the formal review of its causes, response, lessons, and follow-up."
    aliases:
      - reviewed in PIR
      - subject to post-incident review
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: This links a post-incident review to the corrective actions raised from it.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: This links an incident to the person responsible for command and coordination during major-incident handling.
    aliases: []
  - name: notifiesStakeholder
    from: Incident
    to: Stakeholder
    meaning: This links an incident to a stakeholder who must receive or has received incident-related notification.
    aliases: []
  - name: aboutIncident
    from: Communication
    to: Incident
    meaning: This links a communication to the incident the message concerns.
    aliases:
      - relates to incident
  - name: addressedToStakeholder
    from: Communication
    to: Stakeholder
    meaning: This links a communication to the stakeholder it is directed to.
    aliases: []
  - name: memberOfIncidentResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: This links an incident commander to the incident response team they are part of.
    aliases: []
  - name: recordedByServiceDesk
    from: Incident
    to: ServiceDesk
    meaning: This links an incident to the service desk that received and recorded it.
    aliases:
      - logged by service desk
      - opened by service desk
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: This links a regulatory notification to the regulator that receives it.
    aliases:
      - submitted to regulator
  - name: operatesItservice
    from: ITOperationsTeam
    to: ITService
    meaning: This links the IT operations team to the IT services it runs day to day.
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperationsCentre
    to: MonitoringTool
    meaning: This links the network operations centre to the monitoring tools it operates.
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperationsCentre
    to: SecurityEvent
    meaning: This links the security operations centre to the security events it monitors and investigates.
    aliases: []
  - name: executedByMonitoringTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: This links a monitoring rule to the monitoring tool that runs it.
    aliases: []
  - name: generatedByMonitoringRule
    from: Alert
    to: MonitoringRule
    meaning: This links an alert to the monitoring rule that created it.
    aliases: []
  - name: deployedInEnvironment
    from: ITService
    to: Environment
    meaning: This links an IT service to the environment where it is deployed.
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: This links a configuration item to the environment it belongs to.
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: This links a recovery plan to the IT service it is intended to restore.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: This links a backup set to the configuration item whose data or state it protects.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: This links a change to the IT service that may be altered or impacted by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: This links a change to the configuration item it alters.
    aliases: []
  - name: observedOnConfigurationItem
    from: Event
    to: ConfigurationItem
    meaning: This links an event to the configuration item where the state change or occurrence was observed.
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: This links an event to the IT service it is relevant to.
    aliases: []
  - name: usesEnvironment
    from: RecoveryPlan
    to: Environment
    meaning: This links a recovery plan to the environment it targets for service restoration or failover.
    aliases: []
  - name: appliesToItservice
    from: Runbook
    to: ITService
    meaning: This links a runbook to the IT service it is intended to support.
    aliases: []
  - name: appliesToConfigurationItem
    from: Runbook
    to: ConfigurationItem
    meaning: This links a runbook to the configuration item it is intended to support.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: This links a regulatory notification to the incident it formally reports.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: This links an incident to a configuration item directly affected by it.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: This links an incident to the change used to address or resolve it.
    aliases: []
  - name: measuresItservice
    from: Metric
    to: ITService
    meaning: This links a metric to the IT service it measures.
    aliases: []
  - name: measuresConfigurationItem
    from: Metric
    to: ConfigurationItem
    meaning: This links a metric to the configuration item it measures.
    aliases: []
  - name: consumesIntegrationInterface
    from: Application
    to: IntegrationInterface
    meaning: This links an application to the integration interface it consumes.
    aliases: []
  - name: governedByServiceLevelObjective
    from: ITService
    to: ServiceLevelObjective
    meaning: This links an IT service to the service level objective that governs it.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: This links a deployment to the application it deploys.
    aliases: []
  - name: exposesIntegrationInterface
    from: ITService
    to: IntegrationInterface
    meaning: This links an IT service to an integration interface it exposes.
    aliases: []
  - name: derivedFromSecurityEvent
    from: CybersecurityIncident
    to: SecurityEvent
    meaning: This links a cybersecurity incident to the security event it is derived from.
    aliases: []
  - name: requiresPreservationOfEvidenceItem
    from: CybersecurityIncident
    to: EvidenceItem
    meaning: This links a cybersecurity incident to an evidence item whose preservation is required.
    aliases: []
  - name: requiresMaterialityAssessment
    from: CybersecurityIncident
    to: MaterialityAssessment
    meaning: This links a cybersecurity incident to the materiality assessment required for it.
    aliases: []
  - name: mayRequireRegulatoryNotification
    from: CybersecurityIncident
    to: RegulatoryNotification
    meaning: This links a cybersecurity incident to a regulatory notification that may be required for it.
    aliases: []
rules:
  majorIncidentQualificationRule:
    conditions:
      - "the incident is not already resolved, closed, or cancelled"
      - the incident severity is sev1-critical or sev2-high
      - at least one impacted IT service has been identified
  regulatoryNotificationRequirementRule:
    conditions:
      - the incident has a materiality assessment
      - the materiality assessment result is reportable
  incidentClosurePreconditions:
    conditions:
      - the incident status is resolved or monitoring
      - "each impacted IT service has health state healthy, or the incident has residual condition accepted set to true"
      - the incident has at least one linked evidence item
      - "if the incident is being handled as a major incident, it has at least one linked post-incident review"
  recoveryPlanSafeUseRule:
    conditions:
      - the recovery plan recovers an IT service impacted by the incident
      - the recovery plan uses at least one backup set
      - the recovery plan uses an environment whose availability status is available
      - the incident has recovery point accepted set to true
  backupSetSafeUseRule:
    conditions:
      - the backup set status is successful or verified
      - the backup set protects a configuration item affected by the incident
      - the recovery plan linked to the incident uses an environment with restore approved set to true
  workaroundSafeUseRule:
    conditions:
      - the incident is linked to a problem
      - the problem is documented by a known error
      - the known error has a workaround
  runbookSafeUseRule:
    conditions:
      - the incident is handled with the runbook
      - "the runbook applies to an IT service impacted by the incident, or to a configuration item affected by the incident"
  majorIncidentDeclarationPreconditions:
    conditions:
      - "the incident is not resolved, closed, or cancelled"
      - the incident severity is sev1-critical or sev2-high
      - at least one impacted IT service has been identified
      - an incident commander has been assigned
  stakeholderCommunicationSendPreconditions:
    conditions:
      - the communication has an audience recorded
      - the communication has a message summary recorded
      - the communication is linked to an incident
      - the communication is addressed to at least one stakeholder
      - the communication status is approved
  regulatoryNotificationSubmissionPreconditions:
    conditions:
      - the regulatory notification reports an incident
      - the regulatory notification is sent to a regulator
      - the incident reported by the regulatory notification has a materiality assessment whose result is reportable
      - the regulatory notification status is approved
      - the current time is before the regulatory notification due at time
  alertAcknowledgementPreconditions:
    conditions:
      - the alert status is new
  incidentAssignmentPreconditions:
    conditions:
      - the incident is not closed or cancelled
      - "the resolver group supports an IT service impacted by the incident, or a configuration item affected by the incident"
  serviceFailoverPreconditions:
    conditions:
      - the incident has a linked recovery plan
      - the recovery plan recovers an IT service impacted by the incident
      - the recovery plan uses an environment whose availability status is available
      - the incident has recovery point accepted set to true
  backupRestorePreconditions:
    conditions:
      - the backup set status is successful or verified
      - the backup set protects a configuration item affected by the incident
      - the recovery plan linked to the incident uses an environment with restore approved set to true
  incidentContainmentPreconditions:
    conditions:
      - the incident status is acknowledged or investigating
  configurationItemIsolationPreconditions:
    conditions:
      - the incident affects at least one configuration item
  emergencyChangeExecutionPreconditions:
    conditions:
      - "the change is linked from at least one incident that is not resolved, closed, or cancelled"
      - the change has an implementation plan
      - the change has a backout plan
      - "the change affects at least one IT service, or modifies at least one configuration item"
      - "the change risk level is set to low, medium, high, or critical"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - alertAcknowledgementPreconditions
    effect: An alert is acknowledged so responders can see it has been taken up.
    verification: Confirm the alert shows as acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions:
      - incidentAssignmentPreconditions
    effect: The incident is assigned to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: Incident
    preconditions:
      - majorIncidentDeclarationPreconditions
    effect: The incident is marked and handled as a major incident.
    verification: Confirm the incident shows major-incident handling has been initiated.
  containIncident:
    input: Incident
    preconditions:
      - incidentContainmentPreconditions
    effect: Containment actions are recorded and the incident is put under control.
    verification: Confirm the incident record shows containment has been performed.
  isolateAffectedConfigurationItem:
    input: Incident
    preconditions:
      - configurationItemIsolationPreconditions
    effect: The affected configuration item is deliberately isolated from relevant networks or dependencies.
    verification: Confirm the configuration item shows as isolated or disconnected as intended.
  failOverAffectedServiceToRecoveryEnvironment:
    input: Incident
    preconditions:
      - serviceFailoverPreconditions
    effect: The affected service is failed over to its recovery environment.
    verification: Confirm the service is operating from the recovery environment.
  restoreDataFromBackup:
    input: Incident
    preconditions:
      - backupRestorePreconditions
    effect: Data is restored from a selected backup set through the linked recovery plan.
    verification: Confirm the intended data has been restored and the selected backup set and recovery path are recorded against the incident.
  executeEmergencyChange:
    input: Incident
    preconditions:
      - emergencyChangeExecutionPreconditions
    effect: The linked change is executed.
    verification: Confirm the linked change record reflects the executed change.
  sendStakeholderCommunication:
    input: Communication
    preconditions:
      - stakeholderCommunicationSendPreconditions
    effect: The communication status becomes submitted.
    verification: Confirm the communication status is submitted.
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - regulatoryNotificationSubmissionPreconditions
    effect: A regulatory notification is submitted.
    verification: Confirm the notification submission is recorded.
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosurePreconditions
    effect: The incident status becomes closed.
    verification: Confirm the incident status is closed.


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 118 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 118 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by this incident?
  - id: cq2
    text: Which customer channels are impacted by this incident?
  - id: cq3
    text: Which configuration items sit on the dependency path of the affected IT service?
  - id: cq4
    text: Which third-party services sit on the dependency path of the affected IT service?
  - id: cq5
    text: Which active alerts are correlated with this incident?
  - id: cq6
    text: Which events are correlated with this incident?
  - id: cq7
    text: Who owns the affected service?
  - id: cq8
    text: Which resolver group should be assigned to this incident?
  - id: cq9
    text: Which on-call engineer should handle this incident?
  - id: cq10
    text: Does this incident meet the criteria to be treated as a major incident?
  - id: cq11
    text: Which runbook can be used safely for this case?
  - id: cq12
    text: Which workaround can be used safely for this case?
  - id: cq13
    text: Which backup set can be used safely for this case?
  - id: cq14
    text: Which recovery plan can be used safely for this case?
  - id: cq15
    text: Was this incident caused by a recent change?
  - id: cq16
    text: Is a materiality assessment complete?
  - id: cq17
    text: "Is a regulatory notification required, and when is it due?"
  - id: cq18
    text: "Are evidence integrity, stakeholder communications, and closure conditions complete?"
  - id: cq19
    text: Which stakeholders have already been notified about this incident?
  - id: cq20
    text: Which vendor should this incident be escalated to?
  - id: cq21
    text: Which corrective actions from earlier post-incident reviews remain open for the affected service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security condition that requires managed response."
    aliases: []
    properties:
      summary:
        type: text
      description:
        type: text
      detectedAt:
        type: date
      openedAt:
        type: date
      resolvedAt:
        type: date
      closedAt:
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
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      priority:
        type: text
        allowed:
          - p1-critical
          - p2-high
          - p3-medium
          - p4-low
      impact:
        type: text
        allowed:
          - enterprise-wide
          - multiple-services
          - single-service
          - limited-users
          - no-observed-impact
      urgency:
        type: text
        allowed:
          - immediate
          - high
          - normal
          - low
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
      recurring:
        type: boolean
      timeToAcknowledge:
        type: number
      timeToRestore:
        type: number
      residualConditionAccepted:
        type: boolean
      recoveryPointAccepted:
        type: boolean
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
    meaning: A customer channel is a route through which customers access banking services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within the bank’s configuration-management scope.
    aliases:
      - configuration item
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
      - third-party service
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
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - backup set
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - running
          - successful
          - failed
          - expired
          - corrupted
          - verified
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - recovery plan
    properties:
      recoveryTimeObjective:
        type: text
      recoveryPointObjective:
        type: text
      lastReviewDate:
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
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of incident significance and reporting implications.
    aliases:
      - materiality assessment
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
      - regulatory notification
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
  EvidenceItem:
    meaning: "An evidence item is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - evidence item
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
  Communication:
    meaning: "A communication is a controlled message sent to operational, business, customer, vendor, or regulatory audiences."
    aliases:
      - communication
      - stakeholder communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
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
  CorrectiveAction:
    meaning: "A corrective action is a tracked action intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - corrective action
    properties:
      actionDescription:
        type: text
      status:
        type: text
      dueDate:
        type: date
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases:
      - service owner
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - resolver group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for time-critical operational response.
    aliases:
      - on-call engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - incident commander
    properties: {}
  IncidentResponseTeam:
    meaning: An incident response team is the cross-functional team responsible for coordinating significant incident response.
    aliases:
      - incident response team
    properties: {}
  ServiceDesk:
    meaning: "A service desk is the first-line function that receives, records, triages, and routes user-reported issues."
    aliases:
      - service desk
    properties: {}
  ITOperationsTeam:
    meaning: An IT operations team is the team responsible for reliable day-to-day operation of IT services.
    aliases:
      - IT operations team
    properties: {}
  NetworkOperationsCentre:
    meaning: A network operations centre is the function that monitors and operates network and infrastructure services.
    aliases:
      - network operations centre
    properties: {}
  SecurityOperationsCentre:
    meaning: "A security operations centre is the function that monitors, investigates, and coordinates response to cyber threats."
    aliases:
      - security operations centre
    properties: {}
  ApplicationOwner:
    meaning: An application owner is the role accountable for an application and its operational fitness.
    aliases:
      - application owner
    properties: {}
  TechnicalOwner:
    meaning: A technical owner is the role accountable for the engineering and maintenance of a configuration item.
    aliases:
      - technical owner
    properties: {}
  BusinessOwner:
    meaning: A business owner is the business role accountable for a business service or process.
    aliases:
      - business owner
    properties: {}
  Stakeholder:
    meaning: "A stakeholder is a person, group, or organization affected by or responsible for an operational outcome."
    aliases: []
    properties:
      name:
        type: text
      audienceType:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
  Vendor:
    meaning: A vendor is an external organization that supplies or supports technology or services.
    aliases:
      - supplier
      - external supplier
      - third-party provider
    properties:
      legalName:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  Regulator:
    meaning: A regulator is a competent authority that supervises the bank or receives required notifications.
    aliases:
      - supervisory authority
      - competent authority
    properties: {}
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      availabilityStatus:
        type: text
        allowed:
          - available
          - unavailable
          - degraded
          - unknown
      restoreApproved:
        type: boolean
  Application:
    meaning: An application is a software system that delivers business or operational functionality.
    aliases: []
    properties: {}
  Problem:
    meaning: A problem is the underlying cause or potential cause of one or more incidents.
    aliases: []
    properties: {}
  KnownError:
    meaning: A known error is a diagnosed problem with a documented cause or workaround.
    aliases:
      - known error
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - post-incident review
    properties:
      heldOn:
        type: date
      findings:
        type: text
  MonitoringTool:
    meaning: A monitoring tool is a platform that collects telemetry and evaluates operational conditions.
    aliases:
      - monitoring tool
    properties: {}
  SecurityEvent:
    meaning: "A security event is an event relevant to confidentiality, integrity, availability, authenticity, or cyber threat activity."
    aliases:
      - security event
    properties: {}
  MonitoringRule:
    meaning: A monitoring rule is a defined condition that evaluates telemetry and may generate an alert.
    aliases:
      - monitoring rule
    properties: {}
  Metric:
    meaning: null
    aliases: []
    properties: {}
  IntegrationInterface:
    meaning: null
    aliases:
      - integration interface
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties: {}
  ServiceLevelObjective:
    meaning: null
    aliases: []
    properties: {}
  CybersecurityIncident:
    meaning: null
    aliases:
      - cybersecurity incident
    properties: {}
relationships:
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: This links an incident to a business service whose operation is affected by the incident.
    aliases:
      - affects business service
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: This links a business service to the customer channel through which the service is provided.
    aliases: []
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: This links an incident to an IT service whose operation is affected by the incident.
    aliases:
      - affects IT service
  - name: implementedBy
    from: ITService
    to: Application
    meaning: This links an IT service to the application that delivers that technical capability.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: This links an IT service to an external service it relies on.
    aliases:
      - relies on external service
  - name: runsInEnvironment
    from: ITService
    to: Environment
    meaning: This links an IT service to the environment where it is deployed or operating.
    aliases: []
  - name: runsOnConfigurationItem
    from: ITService
    to: ConfigurationItem
    meaning: This links an IT service to the technical component it runs on.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: This links an application to the configuration item that hosts or executes it.
    aliases: []
  - name: usesConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: This links an IT service or application to a configuration item it relies on operationally.
    aliases: []
  - name: ownedByServiceOwner
    from: ITService
    to: ServiceOwner
    meaning: This links an IT service to the role accountable for it across its lifecycle.
    aliases: []
  - name: ownedByApplicationOwner
    from: Application
    to: ApplicationOwner
    meaning: This links an application to the role accountable for its operational fitness.
    aliases: []
  - name: ownedByTechnicalOwner
    from: ConfigurationItem
    to: TechnicalOwner
    meaning: This links a configuration item to the role accountable for its engineering and maintenance.
    aliases: []
  - name: accountableToBusinessOwner
    from: BusinessService
    to: BusinessOwner
    meaning: This links a business service to the business role accountable for it.
    aliases: []
  - name: supportedByVendor
    from: Application
    to: Vendor
    meaning: This links an application to the vendor that supplies support for it.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: This links a third-party service to the vendor that provides it.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: This links an incident to the resolver group responsible for diagnosing and restoring it.
    aliases:
      - assigned to support group
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: This links an incident to the on-call engineer currently handling the time-critical response.
    aliases:
      - owned by on-call
      - handled by duty engineer
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: This links an incident to the vendor engaged for external support or resolution.
    aliases:
      - escalated to supplier
      - handed off to vendor
  - name: supportedByResolverGroup
    from: ITService
    to: ResolverGroup
    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling.
    aliases:
      - covered by resolver group
      - supported by support group
  - name: supportedByResolverGroup
    from: ConfigurationItem
    to: ResolverGroup
    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling.
    aliases:
      - covered by resolver group
      - supported by support group
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: This links an on-call engineer to the resolver group they belong to.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: This links an incident to the alert that opened or initiated it.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: This links an incident to an event that has been correlated into the incident record.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "This links an incident to the runbook used to diagnose, respond to, recover, or verify it."
    aliases: []
  - name: supportedByEvidenceItem
    from: Incident
    to: EvidenceItem
    meaning: "This links an incident to the preserved evidence that supports analysis, accountability, or verification."
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: This links an incident to the assessment that determines its significance and reporting implications.
    aliases:
      - assessed for reportability
  - name: recoveredWithRecoveryPlan
    from: Incident
    to: RecoveryPlan
    meaning: This links an incident to the recovery plan used to restore the affected service.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: This links an incident to the underlying cause record associated with it.
    aliases:
      - associated with problem
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: This links a problem to the known error record that captures its diagnosed cause or workaround.
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: This links a known error to the workaround that can reduce or bypass its impact.
    aliases:
      - has temporary fix
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: This links a recovery plan to the backup set used during restoration.
    aliases:
      - restores from backup set
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: This links a materiality assessment to the regulatory notification required by its outcome.
    aliases:
      - leads to regulatory notification
      - requires regulatory notification
  - name: reviewedInPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: "This links an incident to the formal review of its causes, response, lessons, and follow-up."
    aliases:
      - reviewed in PIR
      - subject to post-incident review
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: This links a post-incident review to the corrective actions raised from it.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: This links an incident to the person responsible for command and coordination during major-incident handling.
    aliases: []
  - name: notifiesStakeholder
    from: Incident
    to: Stakeholder
    meaning: This links an incident to a stakeholder who must receive or has received incident-related notification.
    aliases: []
  - name: aboutIncident
    from: Communication
    to: Incident
    meaning: This links a communication to the incident the message concerns.
    aliases:
      - relates to incident
  - name: addressedToStakeholder
    from: Communication
    to: Stakeholder
    meaning: This links a communication to the stakeholder it is directed to.
    aliases: []
  - name: memberOfIncidentResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: This links an incident commander to the incident response team they are part of.
    aliases: []
  - name: recordedByServiceDesk
    from: Incident
    to: ServiceDesk
    meaning: This links an incident to the service desk that received and recorded it.
    aliases:
      - logged by service desk
      - opened by service desk
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: This links a regulatory notification to the regulator that receives it.
    aliases:
      - submitted to regulator
  - name: operatesItservice
    from: ITOperationsTeam
    to: ITService
    meaning: This links the IT operations team to the IT services it runs day to day.
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperationsCentre
    to: MonitoringTool
    meaning: This links the network operations centre to the monitoring tools it operates.
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperationsCentre
    to: SecurityEvent
    meaning: This links the security operations centre to the security events it monitors and investigates.
    aliases: []
  - name: executedByMonitoringTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: This links a monitoring rule to the monitoring tool that runs it.
    aliases: []
  - name: generatedByMonitoringRule
    from: Alert
    to: MonitoringRule
    meaning: This links an alert to the monitoring rule that created it.
    aliases: []
  - name: deployedInEnvironment
    from: ITService
    to: Environment
    meaning: This links an IT service to the environment where it is deployed.
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: This links a configuration item to the environment it belongs to.
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: This links a recovery plan to the IT service it is intended to restore.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: This links a backup set to the configuration item whose data or state it protects.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: This links a change to the IT service that may be altered or impacted by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: This links a change to the configuration item it alters.
    aliases: []
  - name: observedOnConfigurationItem
    from: Event
    to: ConfigurationItem
    meaning: This links an event to the configuration item where the state change or occurrence was observed.
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: This links an event to the IT service it is relevant to.
    aliases: []
  - name: usesEnvironment
    from: RecoveryPlan
    to: Environment
    meaning: This links a recovery plan to the environment it targets for service restoration or failover.
    aliases: []
  - name: appliesToItservice
    from: Runbook
    to: ITService
    meaning: This links a runbook to the IT service it is intended to support.
    aliases: []
  - name: appliesToConfigurationItem
    from: Runbook
    to: ConfigurationItem
    meaning: This links a runbook to the configuration item it is intended to support.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: This links a regulatory notification to the incident it formally reports.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: This links an incident to a configuration item directly affected by it.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: This links an incident to the change used to address or resolve it.
    aliases: []
  - name: measuresItservice
    from: Metric
    to: ITService
    meaning: This links a metric to the IT service it measures.
    aliases: []
  - name: measuresConfigurationItem
    from: Metric
    to: ConfigurationItem
    meaning: This links a metric to the configuration item it measures.
    aliases: []
  - name: consumesIntegrationInterface
    from: Application
    to: IntegrationInterface
    meaning: This links an application to the integration interface it consumes.
    aliases: []
  - name: governedByServiceLevelObjective
    from: ITService
    to: ServiceLevelObjective
    meaning: This links an IT service to the service level objective that governs it.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: This links a deployment to the application it deploys.
    aliases: []
  - name: exposesIntegrationInterface
    from: ITService
    to: IntegrationInterface
    meaning: This links an IT service to an integration interface it exposes.
    aliases: []
  - name: derivedFromSecurityEvent
    from: CybersecurityIncident
    to: SecurityEvent
    meaning: This links a cybersecurity incident to the security event it is derived from.
    aliases: []
  - name: requiresPreservationOfEvidenceItem
    from: CybersecurityIncident
    to: EvidenceItem
    meaning: This links a cybersecurity incident to an evidence item whose preservation is required.
    aliases: []
  - name: requiresMaterialityAssessment
    from: CybersecurityIncident
    to: MaterialityAssessment
    meaning: This links a cybersecurity incident to the materiality assessment required for it.
    aliases: []
  - name: mayRequireRegulatoryNotification
    from: CybersecurityIncident
    to: RegulatoryNotification
    meaning: This links a cybersecurity incident to a regulatory notification that may be required for it.
    aliases: []
rules:
  majorIncidentQualificationRule:
    conditions:
      - "the incident is not already resolved, closed, or cancelled"
      - the incident severity is sev1-critical or sev2-high
      - at least one impacted IT service has been identified
  regulatoryNotificationRequirementRule:
    conditions:
      - the incident has a materiality assessment
      - the materiality assessment result is reportable
  incidentClosurePreconditions:
    conditions:
      - the incident status is resolved or monitoring
      - "each impacted IT service has health state healthy, or the incident has residual condition accepted set to true"
      - the incident has at least one linked evidence item
      - "if the incident is being handled as a major incident, it has at least one linked post-incident review"
  recoveryPlanSafeUseRule:
    conditions:
      - the recovery plan recovers an IT service impacted by the incident
      - the recovery plan uses at least one backup set
      - the recovery plan uses an environment whose availability status is available
      - the incident has recovery point accepted set to true
  backupSetSafeUseRule:
    conditions:
      - the backup set status is successful or verified
      - the backup set protects a configuration item affected by the incident
      - the recovery plan linked to the incident uses an environment with restore approved set to true
  workaroundSafeUseRule:
    conditions:
      - the incident is linked to a problem
      - the problem is documented by a known error
      - the known error has a workaround
  runbookSafeUseRule:
    conditions:
      - the incident is handled with the runbook
      - "the runbook applies to an IT service impacted by the incident, or to a configuration item affected by the incident"
  majorIncidentDeclarationPreconditions:
    conditions:
      - "the incident is not resolved, closed, or cancelled"
      - the incident severity is sev1-critical or sev2-high
      - at least one impacted IT service has been identified
      - an incident commander has been assigned
  stakeholderCommunicationSendPreconditions:
    conditions:
      - the communication has an audience recorded
      - the communication has a message summary recorded
      - the communication is linked to an incident
      - the communication is addressed to at least one stakeholder
      - the communication status is approved
  regulatoryNotificationSubmissionPreconditions:
    conditions:
      - the regulatory notification reports an incident
      - the regulatory notification is sent to a regulator
      - the incident reported by the regulatory notification has a materiality assessment whose result is reportable
      - the regulatory notification status is approved
      - the current time is before the regulatory notification due at time
  alertAcknowledgementPreconditions:
    conditions:
      - the alert status is new
  incidentAssignmentPreconditions:
    conditions:
      - the incident is not closed or cancelled
      - "the resolver group supports an IT service impacted by the incident, or a configuration item affected by the incident"
  serviceFailoverPreconditions:
    conditions:
      - the incident has a linked recovery plan
      - the recovery plan recovers an IT service impacted by the incident
      - the recovery plan uses an environment whose availability status is available
      - the incident has recovery point accepted set to true
  backupRestorePreconditions:
    conditions:
      - the backup set status is successful or verified
      - the backup set protects a configuration item affected by the incident
      - the recovery plan linked to the incident uses an environment with restore approved set to true
  incidentContainmentPreconditions:
    conditions:
      - the incident status is acknowledged or investigating
  configurationItemIsolationPreconditions:
    conditions:
      - the incident affects at least one configuration item
  emergencyChangeExecutionPreconditions:
    conditions:
      - "the change is linked from at least one incident that is not resolved, closed, or cancelled"
      - the change has an implementation plan
      - the change has a backout plan
      - "the change affects at least one IT service, or modifies at least one configuration item"
      - "the change risk level is set to low, medium, high, or critical"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - alertAcknowledgementPreconditions
    effect: An alert is acknowledged so responders can see it has been taken up.
    verification: Confirm the alert shows as acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions:
      - incidentAssignmentPreconditions
    effect: The incident is assigned to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: Incident
    preconditions:
      - majorIncidentDeclarationPreconditions
    effect: The incident is marked and handled as a major incident.
    verification: Confirm the incident shows major-incident handling has been initiated.
  containIncident:
    input: Incident
    preconditions:
      - incidentContainmentPreconditions
    effect: Containment actions are recorded and the incident is put under control.
    verification: Confirm the incident record shows containment has been performed.
  isolateAffectedConfigurationItem:
    input: Incident
    preconditions:
      - configurationItemIsolationPreconditions
    effect: The affected configuration item is deliberately isolated from relevant networks or dependencies.
    verification: Confirm the configuration item shows as isolated or disconnected as intended.
  failOverAffectedServiceToRecoveryEnvironment:
    input: Incident
    preconditions:
      - serviceFailoverPreconditions
    effect: The affected service is failed over to its recovery environment.
    verification: Confirm the service is operating from the recovery environment.
  restoreDataFromBackup:
    input: Incident
    preconditions:
      - backupRestorePreconditions
    effect: Data is restored from a selected backup set through the linked recovery plan.
    verification: Confirm the intended data has been restored and the selected backup set and recovery path are recorded against the incident.
  executeEmergencyChange:
    input: Incident
    preconditions:
      - emergencyChangeExecutionPreconditions
    effect: The linked change is executed.
    verification: Confirm the linked change record reflects the executed change.
  sendStakeholderCommunication:
    input: Communication
    preconditions:
      - stakeholderCommunicationSendPreconditions
    effect: The communication status becomes submitted.
    verification: Confirm the communication status is submitted.
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - regulatoryNotificationSubmissionPreconditions
    effect: A regulatory notification is submitted.
    verification: Confirm the notification submission is recorded.
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosurePreconditions
    effect: The incident status becomes closed.
    verification: Confirm the incident status is closed.


# CONSISTENCY CHECK — no outstanding problems in the model.

# SECOND-OPINION MODEL CHECK — 3 observation(s) from a separate automated review (report these to the expert, marked as model-derived, the same as the deterministic findings above; not authoritative on their own, but not to be dismissed without checking):
#   [model-review] The action input is Incident but its preconditions are expressed about a Change ('the change is linked from at least one incident', 'the change has an implementation plan', etc.), so the action cannot directly satisfy or evaluate its own stated preconditions from its input class.
#   [model-review] The effect only says data is restored from a selected backup set through the linked recovery plan, but the verification additionally requires that the selected backup set and recovery path are recorded against the incident, which does not follow from the stated effect.
#   [model-review] The effect says the affected service is failed over to its recovery environment, but the verification requires confirming the service is operating from the recovery environment, which is a stronger operational state not guaranteed by the effect as written.

### Turn 118 — assistant

Validation results:

Competency check:
1. Impacted business services: covered by Incident → BusinessService.
2. Impacted customer channels: covered by Incident → BusinessService → CustomerChannel.
3. Configuration items on dependency path: covered by Incident → ITService, ITService/Application → ConfigurationItem, plus Incident → ConfigurationItem for directly affected items.
4. Third-party services on dependency path: covered by Incident → ITService → ThirdPartyService.
5. Active alerts correlated with incident: covered by Incident → Alert plus Alert.status.
6. Events correlated with incident: covered by Incident → Event, Event → ConfigurationItem / ITService.
7. Who owns affected service: covered by Incident → ITService → ServiceOwner.
8. Which resolver group should be assigned: covered by support path Incident → ITService / ConfigurationItem → ResolverGroup, plus recorded Incident → ResolverGroup and assignment rule.
9. Which on-call engineer should handle: partly covered by Incident → OnCallEngineer and OnCallEngineer → ResolverGroup. This supports recording/identifying a handler, but the derivation path from affected service/configuration item to the specific on-call engineer is still thin; the model gets to the resolver group cleanly, then only to engineer membership, not a more explicit “current on-call for group” fact.
10. Major-incident criteria: covered by majorIncidentQualificationRule.
11. Safe runbook: covered by Incident → Runbook, Runbook → ITService / ConfigurationItem, and runbookSafeUseRule.
12. Safe workaround: covered by Incident → Problem → KnownError → Workaround and workaroundSafeUseRule.
13. Safe backup set: covered by Incident → RecoveryPlan → BackupSet / Environment, BackupSet → ConfigurationItem, and backupSetSafeUseRule.
14. Safe recovery plan: covered by Incident → RecoveryPlan → ITService / Environment / BackupSet and recoveryPlanSafeUseRule.
15. Was incident caused by a recent change: partly covered by Incident → Change and Change properties, but “recent” is not yet modeled because there is no actual-occurrence timestamp on Change beyond plannedStart/plannedEnd. Also your bounded expansion added Deployment, but there is still no incident/deployment causation path.
16. Is materiality assessment complete: partly covered by Incident → MaterialityAssessment and MaterialityAssessment.result/assessedAt, but there is no explicit completion/status-style fact beyond inferring from existence/result.
17. Is regulatory notification required, and when due: covered by Incident → MaterialityAssessment, regulatoryNotificationRequirementRule, MaterialityAssessment.reportingDueTime, plus RegulatoryNotification if one exists.
18. Are evidence integrity, stakeholder communications, and closure conditions complete: partly covered. Evidence integrity and closure conditions are covered; stakeholder communications were intentionally simplified out of the closure rule, so that part of the accepted question is no longer directly answered.
19. Which stakeholders have already been notified: only partly covered. We have Incident → Stakeholder and Communication → Stakeholder / Incident, but no explicit “already notified” state tied to stakeholder notification beyond general Communication.status.
20. Which vendor should incident be escalated to: covered by Incident → Vendor, ITService/Application/ThirdPartyService → Vendor, and routing/escalation relationships.
21. Which corrective actions remain open: partly covered by Incident → PostIncidentReview → CorrectiveAction and CorrectiveAction.status, but CorrectiveAction.status has no allowed values yet, so “open” is not formally bounded.

Action coverage:
- acknowledgeAlert: covered by Alert input, alertAcknowledgementPreconditions, effect, verification.
- assignIncidentToResolverGroup: covered by Incident input, incidentAssignmentPreconditions, effect, verification.
- declareMajorIncident: covered by Incident input, majorIncidentDeclarationPreconditions, effect, verification.
- containIncident: covered by Incident input, incidentContainmentPreconditions, effect, verification.
- isolateAffectedConfigurationItem: covered by Incident input, Incident → ConfigurationItem, isolation preconditions, effect, verification.
- failOverAffectedServiceToRecoveryEnvironment: mostly covered by Incident input, serviceFailoverPreconditions, effect, verification.
- restoreDataFromBackup: mostly covered by Incident input, backupRestorePreconditions, effect, verification.
- executeEmergencyChange: partly covered structurally, but see gap below.
- sendStakeholderCommunication: covered by Communication input, stakeholderCommunicationSendPreconditions, effect, verification.
- submitRegulatoryNotification: covered by RegulatoryNotification input, regulatoryNotificationSubmissionPreconditions, effect, verification.
- closeIncident: covered by Incident input, incidentClosurePreconditions, effect, verification.

Final checklist:
- Deterministic check: no outstanding consistency problems in the live model.
- Every class has at least one relationship: not fully true yet. The live graph still shows zero relationships for some late-added classes as stored endpoints only or with no connecting use-path on their own acceptance-test role: Metric, IntegrationInterface, Deployment, ServiceLevelObjective, and CybersecurityIncident have relationships, but several of them still lack meaning sentences; that part is definitely unfinished.
- Every class and relationship has a meaning sentence: not yet true. Missing class meanings remain for:
  - Metric
  - IntegrationInterface
  - Deployment
  - ServiceLevelObjective
  - CybersecurityIncident
- Common synonyms: reasonably covered for many core items.
- Fixed small value sets: mostly covered, but not yet for some state-like properties such as CorrectiveAction.status and possibly Alert.detectionSource if you want it aligned to Incident.detectionSource.
- Important tracked classes with current state: mostly covered where needed.
- Phase 9 bounded expansion offer: completed.
- Automated second opinion reported 3 observations:
  1. executeEmergencyChange has input Incident, but its preconditions are written about a Change. I agree this is a real structural gap.
  2. restoreDataFromBackup verification requires the selected backup set and recovery path to be recorded against the incident, but the effect does not explicitly say they are recorded. I agree this is a real gap in effect/verification alignment.
  3. failOverAffectedServiceToRecoveryEnvironment verification says the service is operating from the recovery environment, which is stronger than the current effect wording. I agree this is also a real gap in effect/verification alignment.

So the model is strong but not yet complete. The remaining open items are:

1. Missing meaning sentences for 5 classes:
   - Metric
   - IntegrationInterface
   - Deployment
   - ServiceLevelObjective
   - CybersecurityIncident

2. executeEmergencyChange action structure:
   - either its preconditions need to be incident-centered, or the action needs a different input/effect shape.

3. restoreDataFromBackup action alignment:
   - its effect should explicitly include recording the selected backup set and recovery path, or verification should be weakened to match the current effect.

4. failOverAffectedServiceToRecoveryEnvironment action alignment:
   - its effect should explicitly say the service is operating from the recovery environment, or verification should be weakened to match the effect.

5. Competency-question coverage gaps still needing a decision:
   - CQ9 on deriving the on-call engineer, not just recording one
   - CQ15 on recent change/deployment causation
   - CQ16 on assessment completion as distinct from existence/result
   - CQ18 on stakeholder communications complete
   - CQ19 on already-notified stakeholders
   - CQ21 on formally bounded “open” corrective actions

Next required step is to close these gaps, starting with the unfinished language layer.

Please give one-sentence meanings for these 5 classes:
- Metric
- IntegrationInterface
- Deployment
- ServiceLevelObjective
- CybersecurityIncident

### Turn 119 — user

- **Metric** — A metric is a time-stamped quantitative observation about a service or technical component.
- **Integration interface** — An integration interface is a defined technical interface through which systems exchange data or commands.
- **Deployment** — A deployment is the technical execution that installs or activates a release or change.
- **Service level objective** — A service level objective is a measurable target for availability, response, or restoration of an IT service.
- **Cybersecurity incident** — A cybersecurity incident is an incident caused by or involving malicious, unauthorized, or other security-relevant activity.

### Turn 119 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Metric:\n    meaning: A metric is a time-stamped quantitative observation about a service or technical component.\n  IntegrationInterface:\n    meaning: An integration interface is a defined technical interface through which systems exchange data or commands.\n  Deployment:\n    meaning: A deployment is the technical execution that installs or activates a release or change.\n  ServiceLevelObjective:\n    meaning: A service level objective is a measurable target for availability, response, or restoration of an IT service.\n  CybersecurityIncident:\n    meaning: A cybersecurity incident is an incident caused by or involving malicious, unauthorized, or other security-relevant activity."
}
```

### Turn 119 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 119 — assistant

Recorded.

Short recap: the previously missing class meanings are now complete.

Next open item to close is the structural action gap the automated review found.

Focused question:
For **executeEmergencyChange**, do you want to fix it by:

1. keeping input **Incident** and rewriting the preconditions so they are incident-centered, while still referring to the linked change through the incident path, or  
2. changing the input back to **Change** and adding the relationships needed so the preconditions are navigable from Change?

Please choose 1 or 2.

### Turn 120 — user

Choose **1**.

### Turn 120 — assistant

Good.

Short recap: we’ll keep **executeEmergencyChange** anchored on **Incident** and rewrite its preconditions in incident-centered terms, using the linked change through the existing Incident → Change path.

Now please restate the final **Emergency-change execution preconditions** rule in incident-centered wording.

### Turn 121 — user

**Rule name:** Emergency-change execution preconditions

**Conditions in plain language:**
- the incident is not resolved, closed, or cancelled
- the incident is resolved by at least one change
- that change has an implementation plan
- that change has a backout plan
- that change affects at least one IT service, or modifies at least one configuration item
- that change has a risk level set to low, medium, high, or critical

### Turn 121 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  emergencyChangeExecutionPreconditions:\n    conditions:\n      - the incident is not resolved, closed, or cancelled\n      - the incident is resolved by at least one change\n      - that change has an implementation plan\n      - that change has a backout plan\n      - that change affects at least one IT service, or modifies at least one configuration item\n      - that change has a risk level set to low, medium, high, or critical"
}
```

### Turn 121 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 121 — assistant

Resolved.

Short recap: **executeEmergencyChange** is now structurally consistent with its Incident input.

Next open item:
For **restoreDataFromBackup**, the second-opinion check said the verification is stronger than the effect.

Which fix do you want?
1. strengthen the effect so it explicitly says the selected backup set and recovery path are recorded against the incident, or
2. weaken the verification so it only checks that data was restored.

### Turn 122 — user

Choose **1**.

### Turn 122 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  restoreDataFromBackup:\n    effect: Data is restored from a selected backup set through the linked recovery plan, and the selected backup set and recovery path are recorded against the incident.\n    verification: Confirm the intended data has been restored and the selected backup set and recovery path are recorded against the incident."
}
```

### Turn 122 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 122 — assistant

Resolved.

Short recap: **restoreDataFromBackup** now has matching effect and verification.

Next open item:
For **failOverAffectedServiceToRecoveryEnvironment**, the effect is weaker than the verification.

Which fix do you want?
1. strengthen the effect so it explicitly says the service is operating from the recovery environment, or
2. weaken the verification to only check that failover was initiated or recorded.

### Turn 123 — user

Choose **1**.

### Turn 123 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  failOverAffectedServiceToRecoveryEnvironment:\n    effect: The affected service is failed over and is operating from its recovery environment.\n    verification: Confirm the service is operating from the recovery environment."
}
```

### Turn 123 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 123 — assistant

Resolved.

Short recap: **failOverAffectedServiceToRecoveryEnvironment** now has aligned effect and verification.

The remaining open items are competency-coverage gaps, not structural errors. I need to close them one by one, starting with the most concrete:

Focused question:
For **CQ21: “Which corrective actions from earlier post-incident reviews remain open for the affected service?”**, do you want to formalize **CorrectiveAction.status** as a fixed allowed-value list so “open” is explicit in the model?  
Please answer yes/no. If yes, give the allowed values.

### Turn 124 — user

Yes.

**Corrective action.status**
- open
- in-progress
- blocked
- implemented
- verified
- closed
- cancelled

### Turn 124 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CorrectiveAction:\n    properties:\n      status:\n        type: text\n        allowed: [open, in-progress, blocked, implemented, verified, closed, cancelled]"
}
```

### Turn 124 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 124 — assistant

Recorded.

Short recap: CQ21 is now formally supported with a bounded CorrectiveAction.status, including an explicit `open` value.

Next competency-coverage gap:
For **CQ16: “Is a materiality assessment complete?”**, do you want to make completion explicit in the model with a bounded property on **MaterialityAssessment**, or is the presence of a result enough in your practice?

Please choose one:
1. add an explicit completion property
2. result/presence is enough

### Turn 125 — user

Choose **2** — result and presence are enough.

### Turn 125 — assistant

Recorded as a modeling decision.

Short recap: for this ontology, **MaterialityAssessment completion is inferred from the presence of the assessment and its result**, rather than a separate completion property.

Next competency-coverage gap:
For **CQ19: “Which stakeholders have already been notified about this incident?”**, do you want to make “already notified” explicit through a bounded property on the **Incident → Stakeholder** notification fact, or should the agent infer it from **Communication.status** plus **Communication → Incident** and **Communication → Stakeholder**?

Because this tool cannot put properties on relationships, the practical choices here are:

1. add a property on **Communication** that explicitly marks notification outcome for the addressed stakeholder, or  
2. rely on existing Communication.status to infer “already notified.”

### Turn 126 — user

Choose **2**.

Rely on the existing communication status together with the communication-to-incident and communication-to-stakeholder links.

### Turn 126 — assistant

Recorded as a modeling decision.

Short recap: for this ontology, **already notified** will be inferred from Communication.status plus the Communication → Incident and Communication → Stakeholder paths, rather than adding a separate notification-outcome field.

Next competency-coverage gap:
For **CQ18: “Are evidence integrity, stakeholder communications, and closure conditions complete?”**, we intentionally simplified stakeholder-communication completeness out of the closure rule earlier.

Do you want to leave CQ18 only **partly covered** in this session, or do you want to add the minimum extra fact needed now to represent communication completeness?

Please choose:
1. leave CQ18 partly covered
2. add the minimum extra fact now

### Turn 127 — user

Choose **1**.

### Turn 127 — assistant

Recorded as an open limitation.

Short recap: **CQ18 remains partly covered in this session**. Evidence integrity and closure conditions are modeled, but communication completeness is not represented as an explicit completeness fact.

Next competency-coverage gap:
For **CQ15: “Was this incident caused by a recent change?”** — and your earlier note that deployment also matters — what is the minimum addition you want now?

Please choose one:
1. keep only **Incident → Change** and infer “recent” from existing Change planned dates
2. add a direct **Incident ↔ Deployment** relationship
3. add an actual-occurrence time property needed to judge “recent”
4. add both 2 and 3

### Turn 128 — user

Choose **4**.

### Turn 128 — assistant

Good — that will close a real coverage gap rather than leaving it fuzzy.

Short recap: to support recent change/deployment causation properly, we will add both:
- a direct Incident–Deployment relationship, and
- an actual-occurrence time property for judging recency.

Focused question:
Please specify the direct Incident–Deployment relationship:
- direction
- relationship name
- one-sentence meaning

After that I’ll ask the property question separately.

### Turn 129 — user

- **Direction:** Incident → Deployment
- **Relationship name:** **is caused by deployment**
- **Meaning:** This links an incident to the deployment that caused or materially contributed to it.

### Turn 129 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: causedByDeployment\n    from: Incident\n    to: Deployment\n    meaning: This links an incident to the deployment that caused or materially contributed to it."
}
```

### Turn 129 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 129 — assistant

Recorded.

Short recap: Incident now has a direct causation path to Deployment, parallel to the existing Incident → Change path.

Next focused question:
Which class should carry the actual-occurrence time needed for “recent,” and what should the property be called?

Please choose the leanest fit:
1. **Change** property
2. **Deployment** property
3. both Change and Deployment
4. another existing class — specify

And give the property name(s).

### Turn 130 — user

Choose **3**.

Use:
- **Change:** implemented at
- **Deployment:** completed at

### Turn 130 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change:\n    properties:\n      implementedAt:\n        type: date\n  Deployment:\n    properties:\n      completedAt:\n        type: date"
}
```

### Turn 130 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 130 — assistant

Recorded.

Short recap: the model now has actual-occurrence timestamps for both change and deployment, which closes the “recent” part of your change/deployment causation question.

One last remaining competency-coverage gap from the earlier validation:
For **CQ9: “Which on-call engineer should handle this incident?”**, the model currently gets cleanly to the resolver group, and from engineer to group membership, but not explicitly to the **current on-call** engineer for that group.

Do you want to add the minimum fact needed now?

Please choose:
1. add a bounded/current-state property on **OnCallEngineer**
2. add a direct relationship from **ResolverGroup → OnCallEngineer** for current on-call coverage
3. leave CQ9 only partly covered in this session

### Turn 131 — user

Choose **3**.

### Turn 131 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 131 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by this incident?
  - id: cq2
    text: Which customer channels are impacted by this incident?
  - id: cq3
    text: Which configuration items sit on the dependency path of the affected IT service?
  - id: cq4
    text: Which third-party services sit on the dependency path of the affected IT service?
  - id: cq5
    text: Which active alerts are correlated with this incident?
  - id: cq6
    text: Which events are correlated with this incident?
  - id: cq7
    text: Who owns the affected service?
  - id: cq8
    text: Which resolver group should be assigned to this incident?
  - id: cq9
    text: Which on-call engineer should handle this incident?
  - id: cq10
    text: Does this incident meet the criteria to be treated as a major incident?
  - id: cq11
    text: Which runbook can be used safely for this case?
  - id: cq12
    text: Which workaround can be used safely for this case?
  - id: cq13
    text: Which backup set can be used safely for this case?
  - id: cq14
    text: Which recovery plan can be used safely for this case?
  - id: cq15
    text: Was this incident caused by a recent change?
  - id: cq16
    text: Is a materiality assessment complete?
  - id: cq17
    text: "Is a regulatory notification required, and when is it due?"
  - id: cq18
    text: "Are evidence integrity, stakeholder communications, and closure conditions complete?"
  - id: cq19
    text: Which stakeholders have already been notified about this incident?
  - id: cq20
    text: Which vendor should this incident be escalated to?
  - id: cq21
    text: Which corrective actions from earlier post-incident reviews remain open for the affected service?
classes:
  Incident:
    meaning: "An incident is an unplanned interruption, degradation, or security condition that requires managed response."
    aliases: []
    properties:
      summary:
        type: text
      description:
        type: text
      detectedAt:
        type: date
      openedAt:
        type: date
      resolvedAt:
        type: date
      closedAt:
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
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      priority:
        type: text
        allowed:
          - p1-critical
          - p2-high
          - p3-medium
          - p4-low
      impact:
        type: text
        allowed:
          - enterprise-wide
          - multiple-services
          - single-service
          - limited-users
          - no-observed-impact
      urgency:
        type: text
        allowed:
          - immediate
          - high
          - normal
          - low
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
      recurring:
        type: boolean
      timeToAcknowledge:
        type: number
      timeToRestore:
        type: number
      residualConditionAccepted:
        type: boolean
      recoveryPointAccepted:
        type: boolean
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
    meaning: A customer channel is a route through which customers access banking services.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A configuration item is a managed component within the bank’s configuration-management scope.
    aliases:
      - configuration item
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
      - third-party service
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
      occurrenceCount:
        type: number
  Event:
    meaning: An event is a time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A backup set is a defined collection of recoverable backup data for protected components.
    aliases:
      - backup set
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - running
          - successful
          - failed
          - expired
          - corrupted
          - verified
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A recovery plan is a documented plan for restoring an IT service and its dependencies.
    aliases:
      - recovery plan
    properties:
      recoveryTimeObjective:
        type: text
      recoveryPointObjective:
        type: text
      lastReviewDate:
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
      implementedAt:
        type: date
  Runbook:
    meaning: "A runbook is a maintained operational procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A workaround is a temporary method that reduces or bypasses the impact of an incident or problem.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: A materiality assessment is a documented determination of incident significance and reporting implications.
    aliases:
      - materiality assessment
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
      - regulatory notification
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
  EvidenceItem:
    meaning: "An evidence item is a preserved record, artifact, or observation that supports incident analysis and accountability."
    aliases:
      - evidence item
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
  Communication:
    meaning: "A communication is a controlled message sent to operational, business, customer, vendor, or regulatory audiences."
    aliases:
      - communication
      - stakeholder communication
    properties:
      sentAt:
        type: date
      audience:
        type: text
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
  CorrectiveAction:
    meaning: "A corrective action is a tracked action intended to remove a cause, reduce risk, or improve response capability."
    aliases:
      - corrective action
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
  ServiceOwner:
    meaning: A service owner is the role accountable for an IT service across its lifecycle.
    aliases:
      - service owner
    properties: {}
  ResolverGroup:
    meaning: A resolver group is the team assigned to diagnose and restore a specific technology or service area.
    aliases:
      - resolver group
    properties: {}
  OnCallEngineer:
    meaning: An on-call engineer is a technical specialist available for time-critical operational response.
    aliases:
      - on-call engineer
    properties: {}
  IncidentCommander:
    meaning: "An incident commander is the person accountable for command, coordination, and decision cadence during a major incident."
    aliases:
      - incident commander
    properties: {}
  IncidentResponseTeam:
    meaning: An incident response team is the cross-functional team responsible for coordinating significant incident response.
    aliases:
      - incident response team
    properties: {}
  ServiceDesk:
    meaning: "A service desk is the first-line function that receives, records, triages, and routes user-reported issues."
    aliases:
      - service desk
    properties: {}
  ITOperationsTeam:
    meaning: An IT operations team is the team responsible for reliable day-to-day operation of IT services.
    aliases:
      - IT operations team
    properties: {}
  NetworkOperationsCentre:
    meaning: A network operations centre is the function that monitors and operates network and infrastructure services.
    aliases:
      - network operations centre
    properties: {}
  SecurityOperationsCentre:
    meaning: "A security operations centre is the function that monitors, investigates, and coordinates response to cyber threats."
    aliases:
      - security operations centre
    properties: {}
  ApplicationOwner:
    meaning: An application owner is the role accountable for an application and its operational fitness.
    aliases:
      - application owner
    properties: {}
  TechnicalOwner:
    meaning: A technical owner is the role accountable for the engineering and maintenance of a configuration item.
    aliases:
      - technical owner
    properties: {}
  BusinessOwner:
    meaning: A business owner is the business role accountable for a business service or process.
    aliases:
      - business owner
    properties: {}
  Stakeholder:
    meaning: "A stakeholder is a person, group, or organization affected by or responsible for an operational outcome."
    aliases: []
    properties:
      name:
        type: text
      audienceType:
        type: text
        allowed:
          - technical
          - management
          - business
          - customer
          - vendor
          - regulator
          - all-staff
  Vendor:
    meaning: A vendor is an external organization that supplies or supports technology or services.
    aliases:
      - supplier
      - external supplier
      - third-party provider
    properties:
      legalName:
        type: text
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  Regulator:
    meaning: A regulator is a competent authority that supervises the bank or receives required notifications.
    aliases:
      - supervisory authority
      - competent authority
    properties: {}
  Environment:
    meaning: "An environment is a deployment context such as production, test, development, or disaster recovery."
    aliases: []
    properties:
      availabilityStatus:
        type: text
        allowed:
          - available
          - unavailable
          - degraded
          - unknown
      restoreApproved:
        type: boolean
  Application:
    meaning: An application is a software system that delivers business or operational functionality.
    aliases: []
    properties: {}
  Problem:
    meaning: A problem is the underlying cause or potential cause of one or more incidents.
    aliases: []
    properties: {}
  KnownError:
    meaning: A known error is a diagnosed problem with a documented cause or workaround.
    aliases:
      - known error
    properties: {}
  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response effectiveness, lessons, and follow-up work."
    aliases:
      - post-incident review
    properties:
      heldOn:
        type: date
      findings:
        type: text
  MonitoringTool:
    meaning: A monitoring tool is a platform that collects telemetry and evaluates operational conditions.
    aliases:
      - monitoring tool
    properties: {}
  SecurityEvent:
    meaning: "A security event is an event relevant to confidentiality, integrity, availability, authenticity, or cyber threat activity."
    aliases:
      - security event
    properties: {}
  MonitoringRule:
    meaning: A monitoring rule is a defined condition that evaluates telemetry and may generate an alert.
    aliases:
      - monitoring rule
    properties: {}
  Metric:
    meaning: A metric is a time-stamped quantitative observation about a service or technical component.
    aliases: []
    properties: {}
  IntegrationInterface:
    meaning: An integration interface is a defined technical interface through which systems exchange data or commands.
    aliases:
      - integration interface
    properties: {}
  Deployment:
    meaning: A deployment is the technical execution that installs or activates a release or change.
    aliases: []
    properties:
      completedAt:
        type: date
  ServiceLevelObjective:
    meaning: "A service level objective is a measurable target for availability, response, or restoration of an IT service."
    aliases: []
    properties: {}
  CybersecurityIncident:
    meaning: "A cybersecurity incident is an incident caused by or involving malicious, unauthorized, or other security-relevant activity."
    aliases:
      - cybersecurity incident
    properties: {}
relationships:
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: This links an incident to a business service whose operation is affected by the incident.
    aliases:
      - affects business service
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: This links a business service to the customer channel through which the service is provided.
    aliases: []
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: This links an incident to an IT service whose operation is affected by the incident.
    aliases:
      - affects IT service
  - name: implementedBy
    from: ITService
    to: Application
    meaning: This links an IT service to the application that delivers that technical capability.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: This links an IT service to an external service it relies on.
    aliases:
      - relies on external service
  - name: runsInEnvironment
    from: ITService
    to: Environment
    meaning: This links an IT service to the environment where it is deployed or operating.
    aliases: []
  - name: runsOnConfigurationItem
    from: ITService
    to: ConfigurationItem
    meaning: This links an IT service to the technical component it runs on.
    aliases: []
  - name: runsOnConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: This links an application to the configuration item that hosts or executes it.
    aliases: []
  - name: usesConfigurationItem
    from: Application
    to: ConfigurationItem
    meaning: This links an IT service or application to a configuration item it relies on operationally.
    aliases: []
  - name: ownedByServiceOwner
    from: ITService
    to: ServiceOwner
    meaning: This links an IT service to the role accountable for it across its lifecycle.
    aliases: []
  - name: ownedByApplicationOwner
    from: Application
    to: ApplicationOwner
    meaning: This links an application to the role accountable for its operational fitness.
    aliases: []
  - name: ownedByTechnicalOwner
    from: ConfigurationItem
    to: TechnicalOwner
    meaning: This links a configuration item to the role accountable for its engineering and maintenance.
    aliases: []
  - name: accountableToBusinessOwner
    from: BusinessService
    to: BusinessOwner
    meaning: This links a business service to the business role accountable for it.
    aliases: []
  - name: supportedByVendor
    from: Application
    to: Vendor
    meaning: This links an application to the vendor that supplies support for it.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: This links a third-party service to the vendor that provides it.
    aliases: []
  - name: assignedToResolverGroup
    from: Incident
    to: ResolverGroup
    meaning: This links an incident to the resolver group responsible for diagnosing and restoring it.
    aliases:
      - assigned to support group
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: This links an incident to the on-call engineer currently handling the time-critical response.
    aliases:
      - owned by on-call
      - handled by duty engineer
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: This links an incident to the vendor engaged for external support or resolution.
    aliases:
      - escalated to supplier
      - handed off to vendor
  - name: supportedByResolverGroup
    from: ITService
    to: ResolverGroup
    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling.
    aliases:
      - covered by resolver group
      - supported by support group
  - name: supportedByResolverGroup
    from: ConfigurationItem
    to: ResolverGroup
    meaning: This links an affected service or configuration item to the resolver group that supports it for operational handling.
    aliases:
      - covered by resolver group
      - supported by support group
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: This links an on-call engineer to the resolver group they belong to.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: This links an incident to the alert that opened or initiated it.
    aliases: []
  - name: correlatedFromEvent
    from: Incident
    to: Event
    meaning: This links an incident to an event that has been correlated into the incident record.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "This links an incident to the runbook used to diagnose, respond to, recover, or verify it."
    aliases: []
  - name: supportedByEvidenceItem
    from: Incident
    to: EvidenceItem
    meaning: "This links an incident to the preserved evidence that supports analysis, accountability, or verification."
    aliases: []
  - name: evaluatedByMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: This links an incident to the assessment that determines its significance and reporting implications.
    aliases:
      - assessed for reportability
  - name: recoveredWithRecoveryPlan
    from: Incident
    to: RecoveryPlan
    meaning: This links an incident to the recovery plan used to restore the affected service.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: This links an incident to the underlying cause record associated with it.
    aliases:
      - associated with problem
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: This links a problem to the known error record that captures its diagnosed cause or workaround.
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: This links a known error to the workaround that can reduce or bypass its impact.
    aliases:
      - has temporary fix
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: This links a recovery plan to the backup set used during restoration.
    aliases:
      - restores from backup set
  - name: triggersRegulatoryNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: This links a materiality assessment to the regulatory notification required by its outcome.
    aliases:
      - leads to regulatory notification
      - requires regulatory notification
  - name: reviewedInPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: "This links an incident to the formal review of its causes, response, lessons, and follow-up."
    aliases:
      - reviewed in PIR
      - subject to post-incident review
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: This links a post-incident review to the corrective actions raised from it.
    aliases: []
  - name: coordinatedByIncidentCommander
    from: Incident
    to: IncidentCommander
    meaning: This links an incident to the person responsible for command and coordination during major-incident handling.
    aliases: []
  - name: notifiesStakeholder
    from: Incident
    to: Stakeholder
    meaning: This links an incident to a stakeholder who must receive or has received incident-related notification.
    aliases: []
  - name: aboutIncident
    from: Communication
    to: Incident
    meaning: This links a communication to the incident the message concerns.
    aliases:
      - relates to incident
  - name: addressedToStakeholder
    from: Communication
    to: Stakeholder
    meaning: This links a communication to the stakeholder it is directed to.
    aliases: []
  - name: memberOfIncidentResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: This links an incident commander to the incident response team they are part of.
    aliases: []
  - name: recordedByServiceDesk
    from: Incident
    to: ServiceDesk
    meaning: This links an incident to the service desk that received and recorded it.
    aliases:
      - logged by service desk
      - opened by service desk
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: This links a regulatory notification to the regulator that receives it.
    aliases:
      - submitted to regulator
  - name: operatesItservice
    from: ITOperationsTeam
    to: ITService
    meaning: This links the IT operations team to the IT services it runs day to day.
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperationsCentre
    to: MonitoringTool
    meaning: This links the network operations centre to the monitoring tools it operates.
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperationsCentre
    to: SecurityEvent
    meaning: This links the security operations centre to the security events it monitors and investigates.
    aliases: []
  - name: executedByMonitoringTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: This links a monitoring rule to the monitoring tool that runs it.
    aliases: []
  - name: generatedByMonitoringRule
    from: Alert
    to: MonitoringRule
    meaning: This links an alert to the monitoring rule that created it.
    aliases: []
  - name: deployedInEnvironment
    from: ITService
    to: Environment
    meaning: This links an IT service to the environment where it is deployed.
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: This links a configuration item to the environment it belongs to.
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: This links a recovery plan to the IT service it is intended to restore.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: This links a backup set to the configuration item whose data or state it protects.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: This links a change to the IT service that may be altered or impacted by the change.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: This links a change to the configuration item it alters.
    aliases: []
  - name: observedOnConfigurationItem
    from: Event
    to: ConfigurationItem
    meaning: This links an event to the configuration item where the state change or occurrence was observed.
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: This links an event to the IT service it is relevant to.
    aliases: []
  - name: usesEnvironment
    from: RecoveryPlan
    to: Environment
    meaning: This links a recovery plan to the environment it targets for service restoration or failover.
    aliases: []
  - name: appliesToItservice
    from: Runbook
    to: ITService
    meaning: This links a runbook to the IT service it is intended to support.
    aliases: []
  - name: appliesToConfigurationItem
    from: Runbook
    to: ConfigurationItem
    meaning: This links a runbook to the configuration item it is intended to support.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: This links a regulatory notification to the incident it formally reports.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: This links an incident to a configuration item directly affected by it.
    aliases: []
  - name: resolvedByChange
    from: Incident
    to: Change
    meaning: This links an incident to the change used to address or resolve it.
    aliases: []
  - name: measuresItservice
    from: Metric
    to: ITService
    meaning: This links a metric to the IT service it measures.
    aliases: []
  - name: measuresConfigurationItem
    from: Metric
    to: ConfigurationItem
    meaning: This links a metric to the configuration item it measures.
    aliases: []
  - name: consumesIntegrationInterface
    from: Application
    to: IntegrationInterface
    meaning: This links an application to the integration interface it consumes.
    aliases: []
  - name: governedByServiceLevelObjective
    from: ITService
    to: ServiceLevelObjective
    meaning: This links an IT service to the service level objective that governs it.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: This links a deployment to the application it deploys.
    aliases: []
  - name: exposesIntegrationInterface
    from: ITService
    to: IntegrationInterface
    meaning: This links an IT service to an integration interface it exposes.
    aliases: []
  - name: derivedFromSecurityEvent
    from: CybersecurityIncident
    to: SecurityEvent
    meaning: This links a cybersecurity incident to the security event it is derived from.
    aliases: []
  - name: requiresPreservationOfEvidenceItem
    from: CybersecurityIncident
    to: EvidenceItem
    meaning: This links a cybersecurity incident to an evidence item whose preservation is required.
    aliases: []
  - name: requiresMaterialityAssessment
    from: CybersecurityIncident
    to: MaterialityAssessment
    meaning: This links a cybersecurity incident to the materiality assessment required for it.
    aliases: []
  - name: mayRequireRegulatoryNotification
    from: CybersecurityIncident
    to: RegulatoryNotification
    meaning: This links a cybersecurity incident to a regulatory notification that may be required for it.
    aliases: []
  - name: causedByDeployment
    from: Incident
    to: Deployment
    meaning: This links an incident to the deployment that caused or materially contributed to it.
    aliases: []
rules:
  majorIncidentQualificationRule:
    conditions:
      - "the incident is not already resolved, closed, or cancelled"
      - the incident severity is sev1-critical or sev2-high
      - at least one impacted IT service has been identified
  regulatoryNotificationRequirementRule:
    conditions:
      - the incident has a materiality assessment
      - the materiality assessment result is reportable
  incidentClosurePreconditions:
    conditions:
      - the incident status is resolved or monitoring
      - "each impacted IT service has health state healthy, or the incident has residual condition accepted set to true"
      - the incident has at least one linked evidence item
      - "if the incident is being handled as a major incident, it has at least one linked post-incident review"
  recoveryPlanSafeUseRule:
    conditions:
      - the recovery plan recovers an IT service impacted by the incident
      - the recovery plan uses at least one backup set
      - the recovery plan uses an environment whose availability status is available
      - the incident has recovery point accepted set to true
  backupSetSafeUseRule:
    conditions:
      - the backup set status is successful or verified
      - the backup set protects a configuration item affected by the incident
      - the recovery plan linked to the incident uses an environment with restore approved set to true
  workaroundSafeUseRule:
    conditions:
      - the incident is linked to a problem
      - the problem is documented by a known error
      - the known error has a workaround
  runbookSafeUseRule:
    conditions:
      - the incident is handled with the runbook
      - "the runbook applies to an IT service impacted by the incident, or to a configuration item affected by the incident"
  majorIncidentDeclarationPreconditions:
    conditions:
      - "the incident is not resolved, closed, or cancelled"
      - the incident severity is sev1-critical or sev2-high
      - at least one impacted IT service has been identified
      - an incident commander has been assigned
  stakeholderCommunicationSendPreconditions:
    conditions:
      - the communication has an audience recorded
      - the communication has a message summary recorded
      - the communication is linked to an incident
      - the communication is addressed to at least one stakeholder
      - the communication status is approved
  regulatoryNotificationSubmissionPreconditions:
    conditions:
      - the regulatory notification reports an incident
      - the regulatory notification is sent to a regulator
      - the incident reported by the regulatory notification has a materiality assessment whose result is reportable
      - the regulatory notification status is approved
      - the current time is before the regulatory notification due at time
  alertAcknowledgementPreconditions:
    conditions:
      - the alert status is new
  incidentAssignmentPreconditions:
    conditions:
      - the incident is not closed or cancelled
      - "the resolver group supports an IT service impacted by the incident, or a configuration item affected by the incident"
  serviceFailoverPreconditions:
    conditions:
      - the incident has a linked recovery plan
      - the recovery plan recovers an IT service impacted by the incident
      - the recovery plan uses an environment whose availability status is available
      - the incident has recovery point accepted set to true
  backupRestorePreconditions:
    conditions:
      - the backup set status is successful or verified
      - the backup set protects a configuration item affected by the incident
      - the recovery plan linked to the incident uses an environment with restore approved set to true
  incidentContainmentPreconditions:
    conditions:
      - the incident status is acknowledged or investigating
  configurationItemIsolationPreconditions:
    conditions:
      - the incident affects at least one configuration item
  emergencyChangeExecutionPreconditions:
    conditions:
      - "the incident is not resolved, closed, or cancelled"
      - the incident is resolved by at least one change
      - that change has an implementation plan
      - that change has a backout plan
      - "that change affects at least one IT service, or modifies at least one configuration item"
      - "that change has a risk level set to low, medium, high, or critical"
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - alertAcknowledgementPreconditions
    effect: An alert is acknowledged so responders can see it has been taken up.
    verification: Confirm the alert shows as acknowledged.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions:
      - incidentAssignmentPreconditions
    effect: The incident is assigned to a resolver group.
    verification: Confirm the incident shows the assigned resolver group.
  declareMajorIncident:
    input: Incident
    preconditions:
      - majorIncidentDeclarationPreconditions
    effect: The incident is marked and handled as a major incident.
    verification: Confirm the incident shows major-incident handling has been initiated.
  containIncident:
    input: Incident
    preconditions:
      - incidentContainmentPreconditions
    effect: Containment actions are recorded and the incident is put under control.
    verification: Confirm the incident record shows containment has been performed.
  isolateAffectedConfigurationItem:
    input: Incident
    preconditions:
      - configurationItemIsolationPreconditions
    effect: The affected configuration item is deliberately isolated from relevant networks or dependencies.
    verification: Confirm the configuration item shows as isolated or disconnected as intended.
  failOverAffectedServiceToRecoveryEnvironment:
    input: Incident
    preconditions:
      - serviceFailoverPreconditions
    effect: The affected service is failed over and is operating from its recovery environment.
    verification: Confirm the service is operating from the recovery environment.
  restoreDataFromBackup:
    input: Incident
    preconditions:
      - backupRestorePreconditions
    effect: "Data is restored from a selected backup set through the linked recovery plan, and the selected backup set and recovery path are recorded against the incident."
    verification: Confirm the intended data has been restored and the selected backup set and recovery path are recorded against the incident.
  executeEmergencyChange:
    input: Incident
    preconditions:
      - emergencyChangeExecutionPreconditions
    effect: The linked change is executed.
    verification: Confirm the linked change record reflects the executed change.
  sendStakeholderCommunication:
    input: Communication
    preconditions:
      - stakeholderCommunicationSendPreconditions
    effect: The communication status becomes submitted.
    verification: Confirm the communication status is submitted.
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - regulatoryNotificationSubmissionPreconditions
    effect: A regulatory notification is submitted.
    verification: Confirm the notification submission is recorded.
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosurePreconditions
    effect: The incident status becomes closed.
    verification: Confirm the incident status is closed.


# CONSISTENCY CHECK — no outstanding problems in the model.

# SECOND-OPINION MODEL CHECK — already attempted once this conversation, not repeated.

### Turn 131 — assistant

Final validation recap:

What is now covered well
- Impact analysis: business services, customer channels, IT services, configuration items, and third-party services.
- Correlation and routing: alerts, events, resolver groups, ownership paths, vendor escalation.
- Major-incident handling: qualification rule, declaration preconditions, incident commander path.
- Recovery and restoration: runbook, workaround, backup set, recovery plan, recovery environment conditions.
- Regulatory flow: materiality assessment, notification requirement, direct reporting link to incident, regulator.
- Closure and follow-up: evidence, post-incident review, corrective actions with explicit open/closed states.
- Language layer: classes and relationships now have meanings, with a substantial alias layer.
- Structural checks: the live model has no outstanding consistency problems.

Remaining known limitations, by your explicit choice
1. **CQ9 on-call engineer derivation** is only partly covered.
   - The model supports resolver-group derivation and recorded handling by an on-call engineer.
   - It does not explicitly model the “current on-call for group” fact.

2. **CQ18 communication completeness** is only partly covered.
   - Evidence integrity and closure conditions are modeled.
   - Communication completeness is not represented as its own explicit completeness fact.

3. **CQ19 already-notified stakeholders** is covered by inference, not by an explicit notification outcome field.
   - The agent would use Communication.status plus Communication → Incident and Communication → Stakeholder.

4. **CQ16 materiality assessment complete** is covered by inference, not by an explicit completion property.
   - The agent would use existence of the assessment plus its result.

5. **CybersecurityIncident** is modeled as a parallel security-specific path, not as a subtype of Incident.
   - That was a deliberate fit to the tool’s limits.

Overall result
- The ontology is now in a strong, usable state and passes the tool’s deterministic validation checks.
- It is not “perfectly exhaustive,” but the remaining gaps are named, deliberate scope choices rather than hidden inconsistencies.

Named open items left by choice
- No explicit current-on-call fact for resolver groups.
- No explicit communication-completeness fact for incident closure/readiness.
- No explicit materiality-assessment completion flag beyond presence/result.
- No subtype mechanism between Incident and CybersecurityIncident; security-specific handling is represented through separate workflow relationships instead.

If you want, the next step would be a short final export-oriented summary of the ontology’s core shape and the known intentional limits.
