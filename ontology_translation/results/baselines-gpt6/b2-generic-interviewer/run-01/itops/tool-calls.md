# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-21T04:11:26.973Z

### Turn 1 — user

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### Turn 1 — assistant

Let’s start with the decisions your team makes during a major incident. I’ll model your terms and decision criteria, rather than assume a generic ITIL workflow.

For a recent *type* of incident—no sensitive details needed:

1. How do you decide whether an alert becomes an incident, and when an incident becomes a major incident?
2. What must you identify or assess first: the affected IT service, customer impact, severity, regulatory relevance, or something else?
3. What are the main handoffs from detection through recovery and closure?

I’ve understood that the scope includes IT service operations, observability, incident response, problem and change management, recovery, stakeholder communications, evidence, and regulatory reporting. Which of those handoffs is hardest to manage today?

### Turn 2 — user

Take a monitoring alert on an application that supports a customer-facing banking service. I would separate three decisions:

1. **Alert to incident:** An alert is a signal for triage, not automatically an incident. We check what it indicates, whether it concerns a service or configuration item, and whether there is an unplanned interruption, degradation, or security condition that needs a managed response. Several alerts and events may be correlated into one incident. A new alert can be acknowledged by an operator authorised for the responsible resolver group; acknowledgement alone does not establish customer impact.

2. **Incident to major incident:** We assess impact and severity against the bank’s approved criteria. For the declaration action, the incident must still be active, have critical or high severity, have at least one impacted IT service identified, and have an assigned incident commander. Declaring it starts the exceptional coordination and communication cadence. Regulatory relevance is assessed separately; “major” does not, by itself, mean “reportable.”

3. **What we establish first:** There is no universal sequence in which customer impact must be known before a service can be identified. Early on, we need the best verified picture of the affected IT service, its business-service and customer-channel dependencies, observed impact, and the underlying alerts or events. We mark uncertainty rather than treating missing information as no impact. That picture supports severity, resolver assignment, the major-incident decision, and a documented materiality assessment where reporting may be relevant.

The principal handoffs are **detection and recording** (monitoring, security operations, or the service desk) → **triage and assignment** to a resolver group that supports the affected service or component → **major-incident command**, if declared → **technical containment and recovery**, with changes or recovery plans checked before use → **verified service restoration and stakeholder updates** → **closure and post-incident review**. Evidence and the current verified incident state need to travel with those handoffs. For closure, we need restoration evidence, healthy services or an accepted residual condition, completed required communications, and a scheduled or completed review for major or cybersecurity incidents.

I cannot honestly name the *hardest handoff today* without looking at this bank’s actual cases. The one I would scrutinise first is the handoff from technical recovery to business-impact confirmation and communication: a component can look healthy before we have verified the service and critical business transactions, and an update must reflect the latest verified state.

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Monitoring Alert:\n    meaning: A monitoring signal requiring triage, not automatically an incident.\n    aliases: [alert]\n    properties:\n      status:\n        type: text\n  Event:\n    meaning: An observed occurrence that may be correlated with an incident.\n  Incident:\n    meaning: A managed response to an unplanned interruption, degradation, or security condition.\n    properties:\n      status:\n        type: text\n      severity:\n        type: text\n      observedImpact:\n        type: text\n      impactUncertainty:\n        type: text\n      majorIncidentDeclared:\n        type: boolean\n  IT Service:\n    meaning: An IT service whose operation and impact are assessed during an incident.\n  Configuration Item:\n    aliases: [component]\n    meaning: A managed component that may be implicated in an alert or incident.\n  Business Service:\n    meaning: A business service dependent on IT service operation.\n  Customer Channel:\n    meaning: A customer channel dependent on IT service operation.\n  Resolver Group:\n    meaning: A group responsible for resolving issues with a service or component.\n  Operator:\n    meaning: A person authorised to acknowledge alerts for a resolver group.\n  Incident Commander:\n    meaning: The person assigned to command a major incident.\nrelationships:\n  - name: concernsITService\n    from: Monitoring Alert\n    to: IT Service\n  - name: concernsConfigurationItem\n    from: Monitoring Alert\n    to: Configuration Item\n  - name: correlatedInto\n    from: Monitoring Alert\n    to: Incident\n    meaning: Multiple alerts can contribute to one incident.\n  - name: eventCorrelatedInto\n    from: Event\n    to: Incident\n    meaning: Multiple events can contribute to one incident.\n  - name: impacts\n    from: Incident\n    to: IT Service\n    meaning: An IT service identified as impacted by the incident.\n  - name: supportsITService\n    from: Configuration Item\n    to: IT Service\n  - name: supportsBusinessService\n    from: IT Service\n    to: Business Service\n  - name: supportsCustomerChannel\n    from: IT Service\n    to: Customer Channel\n  - name: assignedTo\n    from: Incident\n    to: Resolver Group\n  - name: resolverGroupSupportsITService\n    from: Resolver Group\n    to: IT Service\n  - name: resolverGroupSupportsConfigurationItem\n    from: Resolver Group\n    to: Configuration Item\n  - name: authorisedFor\n    from: Operator\n    to: Resolver Group\n  - name: commandedBy\n    from: Incident\n    to: Incident Commander\nrules:\n  alertAcknowledgementEligible:\n    conditions:\n      - The monitoring alert is new.\n      - The acknowledging operator is authorised for the resolver group responsible for the service or configuration item concerned by the alert.\n      - Acknowledgement alone does not establish customer impact or create an incident.\n  majorIncidentDeclarationEligible:\n    conditions:\n      - The incident is still active.\n      - Its severity is critical or high under the bank's approved criteria.\n      - At least one impacted IT service has been identified.\n      - An incident commander has been assigned.\nactions:\n  acknowledgeAlert:\n    input: Monitoring Alert\n    preconditions: [alertAcknowledgementEligible]\n  declareMajorIncident:\n    input: Incident\n    preconditions: [majorIncidentDeclarationEligible]"
}
```

I’ve captured the distinction between an alert, an incident, and a major incident. I’ll add the confirmed decision points first: alerts can be correlated into an incident; impact can remain uncertain; and a major-incident declaration requires an active, high- or critical-severity incident, an identified impacted IT service, and an assigned incident commander. I’ll keep regulatory relevance separate from that declaration.

### Turn 2 — tool

Applied. Added 27, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "acknowledgeAlert" has input class Monitoring Alert, and its precondition alertAcknowledgementEligible refers to Operator, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Monitoring Alert to Operator. Rewording the text does not create the path it assumes.

### Turn 2 — assistant

One distinction is worth preserving: a healthy component is not yet proof that the IT service or critical business transactions have been restored.

To model the next decisions accurately:

1. **Alert ownership:** How do you determine the responsible resolver group for a new alert, and where is the operator’s authority to acknowledge it recorded? Is the alert already routed to a group before acknowledgement?
2. **Recovery verification:** Who confirms that the IT service and critical business transactions work again, and what evidence is required before a restoration update can be sent?
3. **Reporting:** What triggers a documented materiality assessment, who decides whether an incident is reportable, and what approvals or evidence are needed before a regulatory report is submitted?
4. **Closure:** Who can accept a residual condition, and does that acceptance differ for major or cybersecurity incidents?

### Turn 3 — user

Yes—that distinction matters. I would model component checks, IT service health, and critical business transactions as different verification questions.

1. **Alert ownership.** We use what the alert concerns—the IT service or configuration item—and the monitoring rule and event behind it to find the appropriate technical responders. For an *incident* assignment, the resolver group must support an affected service or configuration item. For acknowledging a new alert, the operator must be authorised for the responsible resolver group. I would not assume that every alert already has a recorded group assignment before acknowledgement, or prescribe where that authority is stored; those details depend on the bank’s access and routing arrangements.

2. **Recovery verification.** The checks depend on the recovery action. After failover, we confirm IT service health **and critical business transactions in the recovery environment**. After backup restoration, we validate data integrity and application functionality. I would retain the check results and the incident’s restoration evidence. Before sending a restoration update, its audience, message, owner, and approval state must be recorded, and its content must match the latest *verified* incident state. The model does not designate one universal person who signs off every technical or business check.

3. **Reporting.** A materiality assessment documents an incident’s significance and reporting implications; a cybersecurity incident specifically requires one. Its result can remain undetermined or potentially reportable while facts are being established—neither is permission to submit a notification. I would involve the designated regulatory-reporting function, with Legal or Compliance as appropriate, for the actual reportability decision rather than claim that operations makes a legal determination. Submission requires a **reportable** assessment, a notification linked to the incident and regulator, complete required information and supporting evidence, approved notification status, and submission before its recorded due time. We retain the submission receipt and check whether it was accepted or needs remediation.

4. **Closure.** An incident can move to closure from resolved or monitoring only when affected services are healthy **or an accepted residual condition exists**; resolution and restoration evidence and required stakeholder communications must also be complete. I cannot name a universal role empowered to accept residual risk from the information we have—that authority needs the bank’s governing procedure. For major and cybersecurity incidents, closure additionally requires a post-incident review to be scheduled or completed; the residual-condition test itself is not stated differently for those incidents.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n      severity:\n        type: text\n      observedImpact:\n        type: text\n      impactUncertainty:\n        type: text\n      majorIncidentDeclared:\n        type: boolean\n      cybersecurityIncident:\n        type: boolean\n  Monitoring Rule:\n    meaning: The monitoring rule behind an alert used in technical responder identification.\n  Recovery Action:\n    meaning: A technical recovery action, including failover or backup restoration.\n    properties:\n      kind:\n        type: text\n  Recovery Environment:\n    meaning: The environment in which a failover recovery is verified.\n  Critical Business Transaction:\n    meaning: A critical business transaction whose operation is checked as part of restoration.\n  Verification Check:\n    meaning: A recorded check of component condition, IT service health, critical transactions, data integrity, or application functionality.\n    properties:\n      kind:\n        type: text\n      result:\n        type: text\n  Evidence:\n    meaning: Evidence retained in support of incident resolution, restoration, or regulatory reporting.\n    properties:\n      kind:\n        type: text\n  Stakeholder Communication:\n    meaning: A recorded incident communication, including a restoration update.\n    properties:\n      kind:\n        type: text\n      audience:\n        type: text\n      message:\n        type: text\n      owner:\n        type: text\n      approvalState:\n        type: text\n  Materiality Assessment:\n    meaning: A documented assessment of incident significance and reporting implications.\n    properties:\n      result:\n        type: text\n  Regulatory Reporting Function:\n    meaning: The designated function involved in the reportability decision.\n  Notification:\n    meaning: A regulatory notification prepared for submission concerning an incident.\n    properties:\n      status:\n        type: text\n      requiredInformationComplete:\n        type: boolean\n      dueTime:\n        type: date\n  Regulator:\n    meaning: The regulator to whom a notification is addressed.\n  Submission Receipt:\n    meaning: The retained receipt for a submitted notification, checked for acceptance or remediation.\n    properties:\n      outcome:\n        type: text\n  Residual Condition:\n    meaning: A condition accepted instead of fully healthy affected services at incident closure.\n    properties:\n      accepted:\n        type: boolean\n  Post-Incident Review:\n    meaning: A review required to be scheduled or completed for a major or cybersecurity incident before closure.\n    properties:\n      status:\n        type: text\nrelationships:\n  - name: triggeredByEvent\n    from: Monitoring Alert\n    to: Event\n  - name: basedOnMonitoringRule\n    from: Monitoring Alert\n    to: Monitoring Rule\n  - name: acknowledgedBy\n    from: Monitoring Alert\n    to: Operator\n    meaning: Identifies the operator making the alert acknowledgement; it does not imply a group was assigned to the alert in advance.\n  - name: hasRecoveryAction\n    from: Incident\n    to: Recovery Action\n  - name: checkedBy\n    from: Recovery Action\n    to: Verification Check\n  - name: checkConcernsConfigurationItem\n    from: Verification Check\n    to: Configuration Item\n  - name: checkConcernsITService\n    from: Verification Check\n    to: IT Service\n  - name: checkConcernsCriticalTransaction\n    from: Verification Check\n    to: Critical Business Transaction\n  - name: checkPerformedIn\n    from: Verification Check\n    to: Recovery Environment\n  - name: hasEvidence\n    from: Incident\n    to: Evidence\n    meaning: Retains resolution and restoration evidence for the incident.\n  - name: hasStakeholderCommunication\n    from: Incident\n    to: Stakeholder Communication\n  - name: hasMaterialityAssessment\n    from: Incident\n    to: Materiality Assessment\n  - name: involvesReportingFunction\n    from: Materiality Assessment\n    to: Regulatory Reporting Function\n  - name: notificationForIncident\n    from: Notification\n    to: Incident\n  - name: addressedTo\n    from: Notification\n    to: Regulator\n  - name: supportedByEvidence\n    from: Notification\n    to: Evidence\n  - name: hasSubmissionReceipt\n    from: Notification\n    to: Submission Receipt\n  - name: hasResidualCondition\n    from: Incident\n    to: Residual Condition\n  - name: hasPostIncidentReview\n    from: Incident\n    to: Post-Incident Review\nrules:\n  alertAcknowledgementEligible:\n    conditions:\n      - The monitoring alert is new.\n      - The acknowledging operator is authorised for the responsible resolver group, identified using what the alert concerns and the monitoring rule and event behind it; a pre-existing alert-to-group assignment is not assumed.\n      - Acknowledgement alone does not establish customer impact or create an incident.\n  restorationUpdateReady:\n    conditions:\n      - The restoration update has a recorded audience, message, owner, and approval state appropriate for sending.\n      - Its content matches the latest verified state of the incident to which it belongs; healthy components alone do not establish restored IT service and critical transactions.\n  notificationSubmissionEligible:\n    conditions:\n      - The notification is linked to an incident and a regulator.\n      - The incident's documented materiality assessment has a reportable result; undetermined or potentially reportable is insufficient.\n      - The notification has complete required information and supporting evidence.\n      - The notification status is approved.\n      - Submission occurs before the notification's recorded due time.\n  incidentClosureEligible:\n    conditions:\n      - The incident status is resolved or monitoring.\n      - Affected IT services are healthy, or a residual condition has been accepted under the bank's governing procedure.\n      - Resolution and restoration evidence and required stakeholder communications are complete.\n      - If this is a major or cybersecurity incident, its post-incident review is scheduled or completed.\nactions:\n  sendRestorationUpdate:\n    input: Stakeholder Communication\n    preconditions: [restorationUpdateReady]\n  submitNotification:\n    input: Notification\n    preconditions: [notificationSubmissionEligible]\n  closeIncident:\n    input: Incident\n    preconditions: [incidentClosureEligible]"
}
```

That answers the questions without requiring a fixed alert-routing arrangement or a universal recovery sign-off role. I’ll add the distinct recovery checks, the communication gate, the reporting workflow, and the closure conditions. I’ll also represent the acknowledging operator directly on the alert so the authorization rule does not depend on an assumed preassigned resolver group.

### Turn 3 — tool

Applied. Added 39, updated 2 existing item(s).

CONSISTENCY CHECK — 3 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "sendRestorationUpdate" has input class Stakeholder Communication, and its precondition restorationUpdateReady refers to Configuration Item, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Stakeholder Communication to Configuration Item. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "sendRestorationUpdate" has input class Stakeholder Communication, and its precondition restorationUpdateReady refers to Incident, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Stakeholder Communication to Incident. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "sendRestorationUpdate" has input class Stakeholder Communication, and its precondition restorationUpdateReady refers to IT Service, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Stakeholder Communication to IT Service. Rewording the text does not create the path it assumes.

### Turn 3 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "hasStakeholderCommunication",
      "to": "communicationForIncident",
      "className": "",
      "source": "Incident",
      "target": "Stakeholder Communication",
      "reverse": true
    }
  ]
}
```

### Turn 3 — tool

Renamed 1 of 1:
- relationship "hasStakeholderCommunication" (Incident → Stakeholder Communication) → "communicationForIncident" (Stakeholder Communication → Incident)

### Turn 3 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 3 — tool

competency_questions: []
classes:
  Monitoring Alert:
    meaning: "A monitoring signal requiring triage, not automatically an incident."
    aliases:
      - alert
    properties:
      status:
        type: text
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases: []
    properties: {}
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
    properties:
      status:
        type: text
      severity:
        type: text
      observedImpact:
        type: text
      impactUncertainty:
        type: text
      majorIncidentDeclared:
        type: boolean
      cybersecurityIncident:
        type: boolean
  IT Service:
    meaning: An IT service whose operation and impact are assessed during an incident.
    aliases: []
    properties: {}
  Configuration Item:
    meaning: A managed component that may be implicated in an alert or incident.
    aliases:
      - component
    properties: {}
  Business Service:
    meaning: A business service dependent on IT service operation.
    aliases: []
    properties: {}
  Customer Channel:
    meaning: A customer channel dependent on IT service operation.
    aliases: []
    properties: {}
  Resolver Group:
    meaning: A group responsible for resolving issues with a service or component.
    aliases: []
    properties: {}
  Operator:
    meaning: A person authorised to acknowledge alerts for a resolver group.
    aliases: []
    properties: {}
  Incident Commander:
    meaning: The person assigned to command a major incident.
    aliases: []
    properties: {}
  Monitoring Rule:
    meaning: The monitoring rule behind an alert used in technical responder identification.
    aliases: []
    properties: {}
  Recovery Action:
    meaning: "A technical recovery action, including failover or backup restoration."
    aliases: []
    properties:
      kind:
        type: text
  Recovery Environment:
    meaning: The environment in which a failover recovery is verified.
    aliases: []
    properties: {}
  Critical Business Transaction:
    meaning: A critical business transaction whose operation is checked as part of restoration.
    aliases: []
    properties: {}
  Verification Check:
    meaning: "A recorded check of component condition, IT service health, critical transactions, data integrity, or application functionality."
    aliases: []
    properties:
      kind:
        type: text
      result:
        type: text
  Evidence:
    meaning: "Evidence retained in support of incident resolution, restoration, or regulatory reporting."
    aliases: []
    properties:
      kind:
        type: text
  Stakeholder Communication:
    meaning: "A recorded incident communication, including a restoration update."
    aliases: []
    properties:
      kind:
        type: text
      audience:
        type: text
      message:
        type: text
      owner:
        type: text
      approvalState:
        type: text
  Materiality Assessment:
    meaning: A documented assessment of incident significance and reporting implications.
    aliases: []
    properties:
      result:
        type: text
  Regulatory Reporting Function:
    meaning: The designated function involved in the reportability decision.
    aliases: []
    properties: {}
  Notification:
    meaning: A regulatory notification prepared for submission concerning an incident.
    aliases: []
    properties:
      status:
        type: text
      requiredInformationComplete:
        type: boolean
      dueTime:
        type: date
  Regulator:
    meaning: The regulator to whom a notification is addressed.
    aliases: []
    properties: {}
  Submission Receipt:
    meaning: "The retained receipt for a submitted notification, checked for acceptance or remediation."
    aliases: []
    properties:
      outcome:
        type: text
  Residual Condition:
    meaning: A condition accepted instead of fully healthy affected services at incident closure.
    aliases: []
    properties:
      accepted:
        type: boolean
  Post-Incident Review:
    meaning: A review required to be scheduled or completed for a major or cybersecurity incident before closure.
    aliases: []
    properties:
      status:
        type: text
relationships:
  - name: concernsItservice
    from: Monitoring Alert
    to: IT Service
    meaning: null
    aliases: []
  - name: concernsConfigurationItem
    from: Monitoring Alert
    to: Configuration Item
    meaning: null
    aliases: []
  - name: correlatedInto
    from: Monitoring Alert
    to: Incident
    meaning: Multiple alerts can contribute to one incident.
    aliases: []
  - name: eventCorrelatedInto
    from: Event
    to: Incident
    meaning: Multiple events can contribute to one incident.
    aliases: []
  - name: impacts
    from: Incident
    to: IT Service
    meaning: An IT service identified as impacted by the incident.
    aliases: []
  - name: supportsItservice
    from: Configuration Item
    to: IT Service
    meaning: null
    aliases: []
  - name: supportsBusinessService
    from: IT Service
    to: Business Service
    meaning: null
    aliases: []
  - name: supportsCustomerChannel
    from: IT Service
    to: Customer Channel
    meaning: null
    aliases: []
  - name: assignedTo
    from: Incident
    to: Resolver Group
    meaning: null
    aliases: []
  - name: resolverGroupSupportsItservice
    from: Resolver Group
    to: IT Service
    meaning: null
    aliases: []
  - name: resolverGroupSupportsConfigurationItem
    from: Resolver Group
    to: Configuration Item
    meaning: null
    aliases: []
  - name: authorisedFor
    from: Operator
    to: Resolver Group
    meaning: null
    aliases: []
  - name: commandedBy
    from: Incident
    to: Incident Commander
    meaning: null
    aliases: []
  - name: triggeredByEvent
    from: Monitoring Alert
    to: Event
    meaning: null
    aliases: []
  - name: basedOnMonitoringRule
    from: Monitoring Alert
    to: Monitoring Rule
    meaning: null
    aliases: []
  - name: acknowledgedBy
    from: Monitoring Alert
    to: Operator
    meaning: Identifies the operator making the alert acknowledgement; it does not imply a group was assigned to the alert in advance.
    aliases: []
  - name: hasRecoveryAction
    from: Incident
    to: Recovery Action
    meaning: null
    aliases: []
  - name: checkedBy
    from: Recovery Action
    to: Verification Check
    meaning: null
    aliases: []
  - name: checkConcernsConfigurationItem
    from: Verification Check
    to: Configuration Item
    meaning: null
    aliases: []
  - name: checkConcernsItservice
    from: Verification Check
    to: IT Service
    meaning: null
    aliases: []
  - name: checkConcernsCriticalTransaction
    from: Verification Check
    to: Critical Business Transaction
    meaning: null
    aliases: []
  - name: checkPerformedIn
    from: Verification Check
    to: Recovery Environment
    meaning: null
    aliases: []
  - name: hasEvidence
    from: Incident
    to: Evidence
    meaning: Retains resolution and restoration evidence for the incident.
    aliases: []
  - name: communicationForIncident
    from: Stakeholder Communication
    to: Incident
    meaning: null
    aliases:
      - hasStakeholderCommunication
  - name: hasMaterialityAssessment
    from: Incident
    to: Materiality Assessment
    meaning: null
    aliases: []
  - name: involvesReportingFunction
    from: Materiality Assessment
    to: Regulatory Reporting Function
    meaning: null
    aliases: []
  - name: notificationForIncident
    from: Notification
    to: Incident
    meaning: null
    aliases: []
  - name: addressedTo
    from: Notification
    to: Regulator
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Notification
    to: Evidence
    meaning: null
    aliases: []
  - name: hasSubmissionReceipt
    from: Notification
    to: Submission Receipt
    meaning: null
    aliases: []
  - name: hasResidualCondition
    from: Incident
    to: Residual Condition
    meaning: null
    aliases: []
  - name: hasPostIncidentReview
    from: Incident
    to: Post-Incident Review
    meaning: null
    aliases: []
rules:
  alertAcknowledgementEligible:
    conditions:
      - The monitoring alert is new.
      - "The acknowledging operator is authorised for the responsible resolver group, identified using what the alert concerns and the monitoring rule and event behind it; a pre-existing alert-to-group assignment is not assumed."
      - Acknowledgement alone does not establish customer impact or create an incident.
  majorIncidentDeclarationEligible:
    conditions:
      - The incident is still active.
      - "Its severity is critical or high under the bank's approved criteria."
      - At least one impacted IT service has been identified.
      - An incident commander has been assigned.
  restorationUpdateReady:
    conditions:
      - "The restoration update has a recorded audience, message, owner, and approval state appropriate for sending."
      - Its content matches the latest verified state of the incident to which it belongs; healthy components alone do not establish restored IT service and critical transactions.
  notificationSubmissionEligible:
    conditions:
      - The notification is linked to an incident and a regulator.
      - "The incident's documented materiality assessment has a reportable result; undetermined or potentially reportable is insufficient."
      - The notification has complete required information and supporting evidence.
      - The notification status is approved.
      - "Submission occurs before the notification's recorded due time."
  incidentClosureEligible:
    conditions:
      - The incident status is resolved or monitoring.
      - "Affected IT services are healthy, or a residual condition has been accepted under the bank's governing procedure."
      - Resolution and restoration evidence and required stakeholder communications are complete.
      - "If this is a major or cybersecurity incident, its post-incident review is scheduled or completed."
actions:
  acknowledgeAlert:
    input: Monitoring Alert
    preconditions:
      - alertAcknowledgementEligible
    effect: ""
    verification: ""
  declareMajorIncident:
    input: Incident
    preconditions:
      - majorIncidentDeclarationEligible
    effect: ""
    verification: ""
  sendRestorationUpdate:
    input: Stakeholder Communication
    preconditions:
      - restorationUpdateReady
    effect: ""
    verification: ""
  submitNotification:
    input: Notification
    preconditions:
      - notificationSubmissionEligible
    effect: ""
    verification: ""
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureEligible
    effect: ""
    verification: ""


# CONSISTENCY CHECK — 1 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "closeIncident" has input class Incident, and its precondition incidentClosureEligible refers to Stakeholder Communication, which is only reachable against the direction of the relationships between them.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n      severity:\n        type: text\n      observedImpact:\n        type: text\n      impactUncertainty:\n        type: text\n      majorIncidentDeclared:\n        type: boolean\n      cybersecurityIncident:\n        type: boolean\n      requiredCommunicationsComplete:\n        type: boolean\n  IT Service:\n    properties:\n      health:\n        type: text\n  Stakeholder Communication:\n    properties:\n      kind:\n        type: text\n      audience:\n        type: text\n      message:\n        type: text\n      owner:\n        type: text\n      approvalState:\n        type: text\n      status:\n        type: text\nrelationships:\n  - name: concernsConfigurationItem\n    from: Incident\n    to: Configuration Item\n    meaning: A component affected or implicated in incident triage and resolver assignment.\nrules:\n  incidentAssignmentEligible:\n    conditions:\n      - The chosen resolver group supports an affected IT service or configuration item associated with the incident.\n  failoverVerificationReady:\n    conditions:\n      - Following failover, check results confirm IT service health and critical business transactions in the recovery environment.\n      - Check results and restoration evidence are retained with the incident.\n  backupRestorationVerificationReady:\n    conditions:\n      - Following backup restoration, check results validate data integrity and application functionality.\n      - Check results and restoration evidence are retained with the incident.\n  incidentClosureEligible:\n    conditions:\n      - The incident status is resolved or monitoring.\n      - Affected IT services are healthy, or a residual condition has been accepted under the bank's governing procedure.\n      - Resolution and restoration evidence is complete and the incident's requiredCommunicationsComplete is true.\n      - If this is a major or cybersecurity incident, its post-incident review is scheduled or completed.\nactions:\n  assignIncident:\n    input: Incident\n    preconditions: [incidentAssignmentEligible]"
}
```

### Turn 3 — tool

Applied. Added 5, updated 4 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

The model now treats alert acknowledgement, incident assignment, major-incident declaration, restoration updates, regulatory submission, and closure as separate decisions. It also keeps component checks distinct from service and transaction verification. I’ve left residual-risk authority and technical sign-off unspecified, as you advised.

To cover the remaining operational decisions:

1. **Change and recovery:** When containment or restoration requires an emergency change, failover, or backup restoration, what must be checked *before* execution? Who can authorize the action, if that is fixed by policy?
2. **Problem management:** What leads from an incident or post-incident review to a problem record? What must be known before a workaround or permanent fix is accepted?
3. **Communications:** Beyond restoration updates, which stakeholder updates have mandatory triggers, approvals, or cadence? Does declaring a major incident change those requirements in a specific way?
4. **Materiality:** Is a documented assessment required for incidents other than cybersecurity incidents under defined conditions, or is that a case-by-case reporting-function decision?

### Turn 4 — user

Those are the right distinctions to keep.

1. **Change and recovery.** For an emergency change, the target change must be linked to an active incident; its affected configuration items, implementation plan, and backout plan must be identified, and its risk explicitly accepted before execution. We then check the implementation, service health, and recorded evidence. For **failover**, the recovery plan must apply to the service, the recovery environment must be available, and the data-recovery point must be acceptable; verification covers service health and critical business transactions there. For **backup restoration**, the backup must be successful or verified, protect the target, and have an approved restore point and target environment; we then validate data integrity and application function. The governing procedure determines who has the relevant approval authority—I would not assign that authority to a role by assumption.

   Containment is related but distinct: its scope and expected side effects must be recorded while the incident is acknowledged or investigating. If it involves isolating a component, that component must be linked to the incident, the isolation impact assessed, and a rollback or reconnection method available.

2. **Problem management.** An incident can be linked to a problem, and a post-incident review can identify one—particularly when we are investigating an underlying or potential cause rather than simply restoring service. A diagnosed problem can be documented as a known error with a cause or workaround; a workaround is a temporary way to reduce impact, not proof that the cause has been removed. A permanent fix may be tracked as a corrective action and implemented through a change. I would not impose a universal “cause must be proven before any workaround is accepted” rule: the documented cause and workaround, their effects, and verification of a change are separate questions.

3. **Communications.** Before **any stakeholder communication is sent**, the audience, message, owner, and approval state must be recorded, and the message must reflect the latest verified incident state. We confirm delivery and archive the final message. A major-incident declaration starts a coordination and communication cadence and requires communications, but no fixed interval or universal list of update recipients is specified here; those come from the approved procedure and the incident’s circumstances. Regulatory submission has its own, stricter approval and evidence boundary—it is not merely another stakeholder update.

4. **Materiality.** A cybersecurity incident expressly requires a materiality assessment. Other incidents can also be evaluated through one, but I would not turn that into an unsupported blanket requirement or invent a trigger threshold. The designated reporting function should apply the bank’s governing criteria to decide whether an assessment is needed and determine reportability. Only a **reportable** assessment permits the linked, complete, approved regulatory notification to be submitted.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n      severity:\n        type: text\n      observedImpact:\n        type: text\n      impactUncertainty:\n        type: text\n      majorIncidentDeclared:\n        type: boolean\n      cybersecurityIncident:\n        type: boolean\n      requiredCommunicationsComplete:\n        type: boolean\n      coordinationCadence:\n        type: text\n      communicationCadence:\n        type: text\n  Change:\n    meaning: A change used for an emergency incident response or to implement a corrective action.\n    properties:\n      kind:\n        type: text\n      implementationPlan:\n        type: text\n      backoutPlan:\n        type: text\n      riskAccepted:\n        type: boolean\n      implementationVerified:\n        type: boolean\n  Containment Action:\n    meaning: An incident containment action, potentially involving isolation of a component.\n    properties:\n      scope:\n        type: text\n      expectedSideEffects:\n        type: text\n      isolationImpactAssessed:\n        type: boolean\n      rollbackOrReconnectionAvailable:\n        type: boolean\n  Recovery Plan:\n    meaning: A recovery plan whose applicability to the service is checked before failover.\n  Recovery Environment:\n    meaning: The environment in which a failover is verified or a backup is restored.\n    properties:\n      available:\n        type: boolean\n      approvedForRestore:\n        type: boolean\n  Recovery Action:\n    properties:\n      kind:\n        type: text\n      dataRecoveryPointAcceptable:\n        type: boolean\n  Backup:\n    meaning: A backup checked before restoration for its successful or verified status and protection of the target.\n    properties:\n      status:\n        type: text\n  Restore Point:\n    meaning: A proposed restore point that must be approved before backup restoration.\n    properties:\n      approved:\n        type: boolean\n  Problem:\n    meaning: An investigation of an underlying or potential cause linked to an incident or identified by a review.\n  Known Error:\n    meaning: A documented diagnosed problem with a cause or workaround.\n    properties:\n      cause:\n        type: text\n  Workaround:\n    meaning: A temporary measure that reduces impact without establishing that the underlying cause has been removed.\n    properties:\n      effect:\n        type: text\n  Corrective Action:\n    meaning: A tracked permanent fix that may be implemented through a change.\n  Stakeholder Communication:\n    properties:\n      kind:\n        type: text\n      audience:\n        type: text\n      message:\n        type: text\n      owner:\n        type: text\n      approvalState:\n        type: text\n      status:\n        type: text\n      deliveryConfirmed:\n        type: boolean\n      finalMessageArchived:\n        type: boolean\nrelationships:\n  - name: changeForIncident\n    from: Change\n    to: Incident\n  - name: affectsConfigurationItem\n    from: Change\n    to: Configuration Item\n  - name: containmentForIncident\n    from: Containment Action\n    to: Incident\n  - name: isolatesConfigurationItem\n    from: Containment Action\n    to: Configuration Item\n  - name: usesRecoveryPlan\n    from: Recovery Action\n    to: Recovery Plan\n  - name: appliesToITService\n    from: Recovery Plan\n    to: IT Service\n  - name: usesRecoveryEnvironment\n    from: Recovery Action\n    to: Recovery Environment\n  - name: restoresFromBackup\n    from: Recovery Action\n    to: Backup\n  - name: backupProtectsConfigurationItem\n    from: Backup\n    to: Configuration Item\n  - name: usesRestorePoint\n    from: Recovery Action\n    to: Restore Point\n  - name: linkedToProblem\n    from: Incident\n    to: Problem\n  - name: identifiesProblem\n    from: Post-Incident Review\n    to: Problem\n  - name: documentedAsKnownError\n    from: Problem\n    to: Known Error\n  - name: hasWorkaround\n    from: Known Error\n    to: Workaround\n  - name: hasCorrectiveAction\n    from: Problem\n    to: Corrective Action\n  - name: implementedThroughChange\n    from: Corrective Action\n    to: Change\nrules:\n  majorIncidentDeclarationEligible:\n    conditions:\n      - The incident is still active.\n      - Its severity is critical or high under the bank's approved criteria.\n      - At least one impacted IT service has been identified.\n      - An incident commander has been assigned.\n      - Major-incident declaration starts exceptional coordination and communication cadence but does not itself establish regulatory reportability.\n  stakeholderCommunicationReady:\n    conditions:\n      - The stakeholder communication has a recorded audience, message, owner, and approval state appropriate for sending.\n      - The message matches the latest verified state of its incident.\n  restorationUpdateReady:\n    conditions:\n      - The restoration update has a recorded audience, message, owner, and approval state appropriate for sending.\n      - Its content matches the latest verified state of the incident to which it belongs; healthy components alone do not establish restored IT service and critical transactions.\n  emergencyChangeExecutionEligible:\n    conditions:\n      - The change is an emergency change linked to an active incident.\n      - Its affected configuration items, implementation plan, and backout plan are identified.\n      - The change risk is explicitly accepted under the governing procedure before execution.\n  failoverEligible:\n    conditions:\n      - The recovery action is failover and its recovery plan applies to the affected IT service.\n      - Its recovery environment is available.\n      - Its data-recovery point is acceptable.\n  backupRestorationEligible:\n    conditions:\n      - The recovery action is backup restoration and its backup is successful or verified and protects the target configuration item.\n      - Its restore point is approved and its target recovery environment is approved for restoration.\n  containmentEligible:\n    conditions:\n      - The linked incident is acknowledged or investigating.\n      - The containment scope and expected side effects are recorded.\n      - If a component is to be isolated, it is linked to the incident, its isolation impact is assessed, and a rollback or reconnection method is available.\n  materialityAssessmentRequired:\n    conditions:\n      - A cybersecurity incident requires a documented materiality assessment.\n      - For other incidents, the designated regulatory-reporting function applies the bank's governing criteria to determine whether an assessment is needed; no blanket threshold is assumed.\n  changePostImplementationCheck:\n    conditions:\n      - After the change, the implementation, affected service health, and evidence are checked and recorded.\nactions:\n  executeEmergencyChange:\n    input: Change\n    preconditions: [emergencyChangeExecutionEligible]\n  performFailover:\n    input: Recovery Action\n    preconditions: [failoverEligible]\n  restoreFromBackup:\n    input: Recovery Action\n    preconditions: [backupRestorationEligible]\n  performContainment:\n    input: Containment Action\n    preconditions: [containmentEligible]\n  sendStakeholderCommunication:\n    input: Stakeholder Communication\n    preconditions: [stakeholderCommunicationReady]"
}
```

I’ll add the pre-execution gates for emergency change, failover, backup restoration, and containment, and keep their post-action verification separate. I’ll also add the problem → known error/workaround → corrective action path, while making the send rule apply to every stakeholder communication. I won’t assign approval authority or invent a reporting threshold.

### Turn 4 — tool

Applied. Added 37, updated 6 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 4 — assistant

The change and recovery gates are in place. Two details would help make the rules navigable rather than merely descriptive:

1. Is each **recovery action** recorded against its target IT service or configuration item, as well as its incident? That would let the failover and backup-restoration checks identify the precise target.
2. What evidence is sufficient to mark **service health** and **critical business transactions** verified after failover? Are these recorded as separate check results, or is there a single restoration decision that refers to both?
3. Does the **post-incident review** itself track corrective actions, or are corrective actions tracked against the problem it identifies?

If those are case- or procedure-dependent, I can leave them open and finish with the boundaries already established.The change and recovery gates are in place. Three details would help me finish without assuming a workflow the bank does not use:

1. Is each **recovery action** recorded against its target IT service or configuration item, as well as its incident? That would make the failover and backup-restoration checks refer to a precise target.
2. After failover, are **service health** and **critical business transactions** recorded as separate verification results? Is any further restoration decision required, or do the checks provide the evidence for it?
3. Are **corrective actions** tracked against the problem, the post-incident review, or either?

If these vary by case or governing procedure, I’ll leave them open.

### Turn 5 — user

1. **Recovery targets:** I would not require a separate recovery-action record linked to both the incident and target. For failover, the incident is recovered with a recovery plan, and that plan identifies the IT service it recovers. For backup restoration, the backup set must protect the target configuration item; the restore point and target environment must be approved. Those links make the checks navigable without assuming an additional record.

2. **Failover verification:** Service health and critical business transactions are **distinct checks**, both to be confirmed in the recovery environment. Their results provide evidence for the restoration state; there is no specified requirement for two separate result records or an additional, universal restoration-decision record. A communication about restoration must still match the latest verified incident state.

3. **Corrective actions:** The post-incident review produces the corrective actions and can identify a problem. A corrective action has an owning organizational unit and may be implemented by a change. I would not model a direct corrective-action-to-problem link as required.

### Turn 5 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [
    "Recovery Action"
  ],
  "relationships": [
    {
      "name": "hasRecoveryAction",
      "from": "Incident",
      "to": "Recovery Action"
    },
    {
      "name": "checkedBy",
      "from": "Recovery Action",
      "to": "Verification Check"
    },
    {
      "name": "usesRecoveryPlan",
      "from": "Recovery Action",
      "to": "Recovery Plan"
    },
    {
      "name": "usesRecoveryEnvironment",
      "from": "Recovery Action",
      "to": "Recovery Environment"
    },
    {
      "name": "restoresFromBackup",
      "from": "Recovery Action",
      "to": "Backup"
    },
    {
      "name": "usesRestorePoint",
      "from": "Recovery Action",
      "to": "Restore Point"
    },
    {
      "name": "hasCorrectiveAction",
      "from": "Problem",
      "to": "Corrective Action"
    }
  ],
  "properties": [],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

Understood. I’ll remove the implied requirement for a separate recovery-action record and make the incident’s recovery plan, backup set, restore point, environment, and verification checks directly navigable. I’ll keep service and transaction verification as distinct checks without requiring separate records. I’ll also move corrective-action production from the problem to the post-incident review and add its owning organizational unit.

### Turn 5 — tool

Removed 2 element(s) — classes: Recovery Action; relationships: hasCorrectiveAction (Problem → Corrective Action).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [error] action-input-missing — Action "performFailover" has no input class. Give it the one class the action is fundamentally about.
  [error] action-input-missing — Action "restoreFromBackup" has no input class. Give it the one class the action is fundamentally about.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n      severity:\n        type: text\n      observedImpact:\n        type: text\n      impactUncertainty:\n        type: text\n      majorIncidentDeclared:\n        type: boolean\n      cybersecurityIncident:\n        type: boolean\n      requiredCommunicationsComplete:\n        type: boolean\n      coordinationCadence:\n        type: text\n      communicationCadence:\n        type: text\n      dataRecoveryPointAcceptable:\n        type: boolean\n  Organizational Unit:\n    meaning: The organizational unit owning a corrective action.\nrelationships:\n  - name: usesRecoveryPlan\n    from: Incident\n    to: Recovery Plan\n    meaning: The incident is recovered using a plan that identifies the IT service it recovers.\n  - name: usesRecoveryEnvironment\n    from: Incident\n    to: Recovery Environment\n  - name: restoresFromBackup\n    from: Incident\n    to: Backup\n    meaning: The backup set used to restore an incident target.\n  - name: usesRestorePoint\n    from: Incident\n    to: Restore Point\n  - name: hasVerificationCheck\n    from: Incident\n    to: Verification Check\n    meaning: Distinct service-health and critical-transaction questions can be recorded without mandating separate result records.\n  - name: producesCorrectiveAction\n    from: Post-Incident Review\n    to: Corrective Action\n  - name: ownedBy\n    from: Corrective Action\n    to: Organizational Unit\nrules:\n  failoverEligible:\n    conditions:\n      - The incident's recovery plan applies to the IT service being recovered.\n      - The recovery environment used for the incident is available.\n      - The incident's data-recovery point is acceptable.\n  backupRestorationEligible:\n    conditions:\n      - The incident's backup set is successful or verified and protects the target configuration item.\n      - The incident's restore point and target recovery environment are approved.\n  failoverVerificationReady:\n    conditions:\n      - Following failover, distinct checks confirm IT service health and critical business transactions in the recovery environment; separate result records and a universal restoration-decision record are not required.\n      - Check results supply evidence for the incident's restoration state.\n  backupRestorationVerificationReady:\n    conditions:\n      - Following backup restoration, checks validate data integrity and application functionality and support the incident's restoration evidence.\nactions:\n  performFailover:\n    input: Incident\n    preconditions: [failoverEligible]\n  restoreFromBackup:\n    input: Incident\n    preconditions: [backupRestorationEligible]"
}
```

### Turn 5 — tool

Applied. Added 8, updated 7 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 5 — tool

competency_questions: []
classes:
  Monitoring Alert:
    meaning: "A monitoring signal requiring triage, not automatically an incident."
    aliases:
      - alert
    properties:
      status:
        type: text
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases: []
    properties: {}
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
    properties:
      status:
        type: text
      severity:
        type: text
      observedImpact:
        type: text
      impactUncertainty:
        type: text
      majorIncidentDeclared:
        type: boolean
      cybersecurityIncident:
        type: boolean
      requiredCommunicationsComplete:
        type: boolean
      coordinationCadence:
        type: text
      communicationCadence:
        type: text
      dataRecoveryPointAcceptable:
        type: boolean
  IT Service:
    meaning: An IT service whose operation and impact are assessed during an incident.
    aliases: []
    properties:
      health:
        type: text
  Configuration Item:
    meaning: A managed component that may be implicated in an alert or incident.
    aliases:
      - component
    properties: {}
  Business Service:
    meaning: A business service dependent on IT service operation.
    aliases: []
    properties: {}
  Customer Channel:
    meaning: A customer channel dependent on IT service operation.
    aliases: []
    properties: {}
  Resolver Group:
    meaning: A group responsible for resolving issues with a service or component.
    aliases: []
    properties: {}
  Operator:
    meaning: A person authorised to acknowledge alerts for a resolver group.
    aliases: []
    properties: {}
  Incident Commander:
    meaning: The person assigned to command a major incident.
    aliases: []
    properties: {}
  Monitoring Rule:
    meaning: The monitoring rule behind an alert used in technical responder identification.
    aliases: []
    properties: {}
  Recovery Environment:
    meaning: The environment in which a failover is verified or a backup is restored.
    aliases: []
    properties:
      available:
        type: boolean
      approvedForRestore:
        type: boolean
  Critical Business Transaction:
    meaning: A critical business transaction whose operation is checked as part of restoration.
    aliases: []
    properties: {}
  Verification Check:
    meaning: "A recorded check of component condition, IT service health, critical transactions, data integrity, or application functionality."
    aliases: []
    properties:
      kind:
        type: text
      result:
        type: text
  Evidence:
    meaning: "Evidence retained in support of incident resolution, restoration, or regulatory reporting."
    aliases: []
    properties:
      kind:
        type: text
  Stakeholder Communication:
    meaning: "A recorded incident communication, including a restoration update."
    aliases: []
    properties:
      kind:
        type: text
      audience:
        type: text
      message:
        type: text
      owner:
        type: text
      approvalState:
        type: text
      status:
        type: text
      deliveryConfirmed:
        type: boolean
      finalMessageArchived:
        type: boolean
  Materiality Assessment:
    meaning: A documented assessment of incident significance and reporting implications.
    aliases: []
    properties:
      result:
        type: text
  Regulatory Reporting Function:
    meaning: The designated function involved in the reportability decision.
    aliases: []
    properties: {}
  Notification:
    meaning: A regulatory notification prepared for submission concerning an incident.
    aliases: []
    properties:
      status:
        type: text
      requiredInformationComplete:
        type: boolean
      dueTime:
        type: date
  Regulator:
    meaning: The regulator to whom a notification is addressed.
    aliases: []
    properties: {}
  Submission Receipt:
    meaning: "The retained receipt for a submitted notification, checked for acceptance or remediation."
    aliases: []
    properties:
      outcome:
        type: text
  Residual Condition:
    meaning: A condition accepted instead of fully healthy affected services at incident closure.
    aliases: []
    properties:
      accepted:
        type: boolean
  Post-Incident Review:
    meaning: A review required to be scheduled or completed for a major or cybersecurity incident before closure.
    aliases: []
    properties:
      status:
        type: text
  Change:
    meaning: A change used for an emergency incident response or to implement a corrective action.
    aliases: []
    properties:
      kind:
        type: text
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      riskAccepted:
        type: boolean
      implementationVerified:
        type: boolean
  Containment Action:
    meaning: "An incident containment action, potentially involving isolation of a component."
    aliases: []
    properties:
      scope:
        type: text
      expectedSideEffects:
        type: text
      isolationImpactAssessed:
        type: boolean
      rollbackOrReconnectionAvailable:
        type: boolean
  Recovery Plan:
    meaning: A recovery plan whose applicability to the service is checked before failover.
    aliases: []
    properties: {}
  Backup:
    meaning: A backup checked before restoration for its successful or verified status and protection of the target.
    aliases: []
    properties:
      status:
        type: text
  Restore Point:
    meaning: A proposed restore point that must be approved before backup restoration.
    aliases: []
    properties:
      approved:
        type: boolean
  Problem:
    meaning: An investigation of an underlying or potential cause linked to an incident or identified by a review.
    aliases: []
    properties: {}
  Known Error:
    meaning: A documented diagnosed problem with a cause or workaround.
    aliases: []
    properties:
      cause:
        type: text
  Workaround:
    meaning: A temporary measure that reduces impact without establishing that the underlying cause has been removed.
    aliases: []
    properties:
      effect:
        type: text
  Corrective Action:
    meaning: A tracked permanent fix that may be implemented through a change.
    aliases: []
    properties: {}
  Organizational Unit:
    meaning: The organizational unit owning a corrective action.
    aliases: []
    properties: {}
relationships:
  - name: concernsItservice
    from: Monitoring Alert
    to: IT Service
    meaning: null
    aliases: []
  - name: concernsConfigurationItem
    from: Monitoring Alert
    to: Configuration Item
    meaning: null
    aliases: []
  - name: correlatedInto
    from: Monitoring Alert
    to: Incident
    meaning: Multiple alerts can contribute to one incident.
    aliases: []
  - name: eventCorrelatedInto
    from: Event
    to: Incident
    meaning: Multiple events can contribute to one incident.
    aliases: []
  - name: impacts
    from: Incident
    to: IT Service
    meaning: An IT service identified as impacted by the incident.
    aliases: []
  - name: supportsItservice
    from: Configuration Item
    to: IT Service
    meaning: null
    aliases: []
  - name: supportsBusinessService
    from: IT Service
    to: Business Service
    meaning: null
    aliases: []
  - name: supportsCustomerChannel
    from: IT Service
    to: Customer Channel
    meaning: null
    aliases: []
  - name: assignedTo
    from: Incident
    to: Resolver Group
    meaning: null
    aliases: []
  - name: resolverGroupSupportsItservice
    from: Resolver Group
    to: IT Service
    meaning: null
    aliases: []
  - name: resolverGroupSupportsConfigurationItem
    from: Resolver Group
    to: Configuration Item
    meaning: null
    aliases: []
  - name: authorisedFor
    from: Operator
    to: Resolver Group
    meaning: null
    aliases: []
  - name: commandedBy
    from: Incident
    to: Incident Commander
    meaning: null
    aliases: []
  - name: triggeredByEvent
    from: Monitoring Alert
    to: Event
    meaning: null
    aliases: []
  - name: basedOnMonitoringRule
    from: Monitoring Alert
    to: Monitoring Rule
    meaning: null
    aliases: []
  - name: acknowledgedBy
    from: Monitoring Alert
    to: Operator
    meaning: Identifies the operator making the alert acknowledgement; it does not imply a group was assigned to the alert in advance.
    aliases: []
  - name: checkConcernsConfigurationItem
    from: Verification Check
    to: Configuration Item
    meaning: null
    aliases: []
  - name: checkConcernsItservice
    from: Verification Check
    to: IT Service
    meaning: null
    aliases: []
  - name: checkConcernsCriticalTransaction
    from: Verification Check
    to: Critical Business Transaction
    meaning: null
    aliases: []
  - name: checkPerformedIn
    from: Verification Check
    to: Recovery Environment
    meaning: null
    aliases: []
  - name: hasEvidence
    from: Incident
    to: Evidence
    meaning: Retains resolution and restoration evidence for the incident.
    aliases: []
  - name: communicationForIncident
    from: Stakeholder Communication
    to: Incident
    meaning: null
    aliases:
      - hasStakeholderCommunication
  - name: hasMaterialityAssessment
    from: Incident
    to: Materiality Assessment
    meaning: null
    aliases: []
  - name: involvesReportingFunction
    from: Materiality Assessment
    to: Regulatory Reporting Function
    meaning: null
    aliases: []
  - name: notificationForIncident
    from: Notification
    to: Incident
    meaning: null
    aliases: []
  - name: addressedTo
    from: Notification
    to: Regulator
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Notification
    to: Evidence
    meaning: null
    aliases: []
  - name: hasSubmissionReceipt
    from: Notification
    to: Submission Receipt
    meaning: null
    aliases: []
  - name: hasResidualCondition
    from: Incident
    to: Residual Condition
    meaning: null
    aliases: []
  - name: hasPostIncidentReview
    from: Incident
    to: Post-Incident Review
    meaning: null
    aliases: []
  - name: concernsConfigurationItem
    from: Incident
    to: Configuration Item
    meaning: A component affected or implicated in incident triage and resolver assignment.
    aliases: []
  - name: changeForIncident
    from: Change
    to: Incident
    meaning: null
    aliases: []
  - name: affectsConfigurationItem
    from: Change
    to: Configuration Item
    meaning: null
    aliases: []
  - name: containmentForIncident
    from: Containment Action
    to: Incident
    meaning: null
    aliases: []
  - name: isolatesConfigurationItem
    from: Containment Action
    to: Configuration Item
    meaning: null
    aliases: []
  - name: appliesToItservice
    from: Recovery Plan
    to: IT Service
    meaning: null
    aliases: []
  - name: backupProtectsConfigurationItem
    from: Backup
    to: Configuration Item
    meaning: null
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: null
    aliases: []
  - name: identifiesProblem
    from: Post-Incident Review
    to: Problem
    meaning: null
    aliases: []
  - name: documentedAsKnownError
    from: Problem
    to: Known Error
    meaning: null
    aliases: []
  - name: hasWorkaround
    from: Known Error
    to: Workaround
    meaning: null
    aliases: []
  - name: implementedThroughChange
    from: Corrective Action
    to: Change
    meaning: null
    aliases: []
  - name: usesRecoveryPlan
    from: Incident
    to: Recovery Plan
    meaning: The incident is recovered using a plan that identifies the IT service it recovers.
    aliases: []
  - name: usesRecoveryEnvironment
    from: Incident
    to: Recovery Environment
    meaning: null
    aliases: []
  - name: restoresFromBackup
    from: Incident
    to: Backup
    meaning: The backup set used to restore an incident target.
    aliases: []
  - name: usesRestorePoint
    from: Incident
    to: Restore Point
    meaning: null
    aliases: []
  - name: hasVerificationCheck
    from: Incident
    to: Verification Check
    meaning: Distinct service-health and critical-transaction questions can be recorded without mandating separate result records.
    aliases: []
  - name: producesCorrectiveAction
    from: Post-Incident Review
    to: Corrective Action
    meaning: null
    aliases: []
  - name: ownedBy
    from: Corrective Action
    to: Organizational Unit
    meaning: null
    aliases: []
rules:
  alertAcknowledgementEligible:
    conditions:
      - The monitoring alert is new.
      - "The acknowledging operator is authorised for the responsible resolver group, identified using what the alert concerns and the monitoring rule and event behind it; a pre-existing alert-to-group assignment is not assumed."
      - Acknowledgement alone does not establish customer impact or create an incident.
  majorIncidentDeclarationEligible:
    conditions:
      - The incident is still active.
      - "Its severity is critical or high under the bank's approved criteria."
      - At least one impacted IT service has been identified.
      - An incident commander has been assigned.
      - Major-incident declaration starts exceptional coordination and communication cadence but does not itself establish regulatory reportability.
  restorationUpdateReady:
    conditions:
      - "The restoration update has a recorded audience, message, owner, and approval state appropriate for sending."
      - Its content matches the latest verified state of the incident to which it belongs; healthy components alone do not establish restored IT service and critical transactions.
  notificationSubmissionEligible:
    conditions:
      - The notification is linked to an incident and a regulator.
      - "The incident's documented materiality assessment has a reportable result; undetermined or potentially reportable is insufficient."
      - The notification has complete required information and supporting evidence.
      - The notification status is approved.
      - "Submission occurs before the notification's recorded due time."
  incidentClosureEligible:
    conditions:
      - The incident status is resolved or monitoring.
      - "Affected IT services are healthy, or a residual condition has been accepted under the bank's governing procedure."
      - "Resolution and restoration evidence is complete and the incident's requiredCommunicationsComplete is true."
      - "If this is a major or cybersecurity incident, its post-incident review is scheduled or completed."
  incidentAssignmentEligible:
    conditions:
      - The chosen resolver group supports an affected IT service or configuration item associated with the incident.
  failoverVerificationReady:
    conditions:
      - "Following failover, distinct checks confirm IT service health and critical business transactions in the recovery environment; separate result records and a universal restoration-decision record are not required."
      - "Check results supply evidence for the incident's restoration state."
  backupRestorationVerificationReady:
    conditions:
      - "Following backup restoration, checks validate data integrity and application functionality and support the incident's restoration evidence."
  stakeholderCommunicationReady:
    conditions:
      - "The stakeholder communication has a recorded audience, message, owner, and approval state appropriate for sending."
      - The message matches the latest verified state of its incident.
  emergencyChangeExecutionEligible:
    conditions:
      - The change is an emergency change linked to an active incident.
      - "Its affected configuration items, implementation plan, and backout plan are identified."
      - The change risk is explicitly accepted under the governing procedure before execution.
  failoverEligible:
    conditions:
      - "The incident's recovery plan applies to the IT service being recovered."
      - The recovery environment used for the incident is available.
      - "The incident's data-recovery point is acceptable."
  backupRestorationEligible:
    conditions:
      - "The incident's backup set is successful or verified and protects the target configuration item."
      - "The incident's restore point and target recovery environment are approved."
  containmentEligible:
    conditions:
      - The linked incident is acknowledged or investigating.
      - The containment scope and expected side effects are recorded.
      - "If a component is to be isolated, it is linked to the incident, its isolation impact is assessed, and a rollback or reconnection method is available."
  materialityAssessmentRequired:
    conditions:
      - A cybersecurity incident requires a documented materiality assessment.
      - "For other incidents, the designated regulatory-reporting function applies the bank's governing criteria to determine whether an assessment is needed; no blanket threshold is assumed."
  changePostImplementationCheck:
    conditions:
      - "After the change, the implementation, affected service health, and evidence are checked and recorded."
actions:
  acknowledgeAlert:
    input: Monitoring Alert
    preconditions:
      - alertAcknowledgementEligible
    effect: ""
    verification: ""
  declareMajorIncident:
    input: Incident
    preconditions:
      - majorIncidentDeclarationEligible
    effect: ""
    verification: ""
  sendRestorationUpdate:
    input: Stakeholder Communication
    preconditions:
      - restorationUpdateReady
    effect: ""
    verification: ""
  submitNotification:
    input: Notification
    preconditions:
      - notificationSubmissionEligible
    effect: ""
    verification: ""
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureEligible
    effect: ""
    verification: ""
  assignIncident:
    input: Incident
    preconditions:
      - incidentAssignmentEligible
    effect: ""
    verification: ""
  executeEmergencyChange:
    input: Change
    preconditions:
      - emergencyChangeExecutionEligible
    effect: ""
    verification: ""
  performFailover:
    input: Incident
    preconditions:
      - failoverEligible
    effect: ""
    verification: ""
  restoreFromBackup:
    input: Incident
    preconditions:
      - backupRestorationEligible
    effect: ""
    verification: ""
  performContainment:
    input: Containment Action
    preconditions:
      - containmentEligible
    effect: ""
    verification: ""
  sendStakeholderCommunication:
    input: Stakeholder Communication
    preconditions:
      - stakeholderCommunicationReady
    effect: ""
    verification: ""


# CONSISTENCY CHECK — no outstanding problems in the model.

# SECOND-OPINION MODEL CHECK — no additional observations.

### Turn 5 — assistant

The interview has covered the decisions needed for a compact domain model, and the model is complete for the scope described. Its consistency check found no outstanding problems.

The model keeps alert acknowledgement, incident assignment, major-incident declaration, recovery, communication, regulatory submission, and closure as separate decisions. It also distinguishes component condition, IT service health, and critical-business-transaction verification. Recovery checks use the incident’s plan or backup, restore point, and environment without requiring a separate recovery-action record; post-incident reviews produce corrective actions owned by an organizational unit.

It deliberately leaves approval authority, residual-condition acceptance authority, communication intervals, and non-cybersecurity materiality thresholds to the bank’s governing procedures rather than assuming them.
