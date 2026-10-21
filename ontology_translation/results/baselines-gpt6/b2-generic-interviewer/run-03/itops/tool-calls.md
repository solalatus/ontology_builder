# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-21T04:50:35.873Z

### Turn 1 — user

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### Turn 1 — assistant

Let’s start with a **major incident**, since it connects service operations, recovery, communications, evidence, and reporting.

Could you walk me through a recent or representative incident from the first alert to closure? In particular:

1. What do you call the main things you track—services, alerts, incidents, affected customers, changes, recovery actions, and so on?
2. Who decides that an incident is “major,” and what criteria do they use?
3. Which decisions must the model help answer—for example, “Which critical services are affected?” or “Does this incident require regulatory reporting?”

A representative scenario is enough; please omit sensitive details.

### Turn 2 — user

Take a representative, anonymised case: monitoring raises an alert about an IT service that supports a customer-facing business service. The alert needs triage; it is not automatically an incident. Once we establish an unplanned degradation requiring a managed response, the service desk records an incident, links the relevant alert or events, and routes it to a resolver group. We then trace the affected IT service, configuration items and any third-party dependency through to the business service and customer channel. That gives us a defensible picture of impact rather than just a technical symptom.

**The main things I track** are the alert and underlying events; the incident and its status, severity, impact and urgency; affected IT and business services, customer channels and configuration items; the service owner, resolver group and on-call engineer; and the response record. That record can include a runbook, a temporary workaround, a recovery plan and backup set, or a change if a controlled fix is needed. Communications, preserved evidence, a materiality assessment and—if warranted—a regulatory notification are separate records. A later problem record and post-incident review deal with cause and follow-up actions. For customer impact, I would identify the affected channel and stakeholder audience; I would not infer a list of individual customers from the incident alone.

**“Major” is a deliberate declaration, not a synonym for any severe alert.** Before declaring it, we need an active incident—not one already resolved, closed or cancelled—with critical or high severity, at least one identified impacted IT service, and an assigned incident commander. The bank’s approved criteria govern the significance judgment; I would not invent a numerical threshold. The incident commander is accountable for command and decision cadence once assigned, while the incident response team coordinates the major response. Declaration starts that coordination and the communication cadence.

In this example, the team might contain the fault, then use an applicable recovery plan to move the service to a recovery environment—but only after checking that the environment is available and the data-recovery point is acceptable. We verify service health and critical business transactions there. We send stakeholder updates based on the latest *verified* incident state, retaining the final messages and delivery status alongside technical evidence.

**The decisions the record must support** include:

- Which business services and customer channels are impacted, and what dependencies sit beneath the affected IT service?
- Which alerts and events belong to this incident, and who owns the service and should resolve it?
- Does it meet the bank’s major-incident criteria, and which runbook, workaround, backup or recovery plan is safe to use?
- Was a recent change or deployment involved?
- Is the materiality assessment complete, and does it call for a regulatory notification? The designated reporting function, with Legal or Compliance as appropriate, owns that determination—not an assumption made by operations.
- Are the evidence, required communications, restored service health and review arrangements sufficient for closure?

We would close only after resolution or monitoring has reached the closure boundary, service health is restored or a residual condition is accepted, and the required evidence and communications are complete. For a major incident, the post-incident review must also be scheduled or completed; closing the incident does not erase the problem or corrective actions that may follow.

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - Which business services and customer channels are impacted by an incident, and what IT-service dependencies underlie that impact?\n  - Which alerts and events belong to an incident, and who owns the affected service and resolves the incident?\n  - Does an active incident meet the bank's criteria for a major-incident declaration?\n  - Which runbook, workaround, backup set or recovery plan is safe to use?\n  - Was a recent change or deployment involved in the incident?\n  - Is the materiality assessment complete, and does the designated reporting function call for a regulatory notification?\n  - Are restored service health, evidence, communications and review arrangements sufficient for closure?\nclasses:\n  Alert:\n    meaning: A monitoring signal requiring triage, not automatically an incident.\n  Event:\n    meaning: An underlying observed event that may be linked to an alert or incident.\n  Incident:\n    meaning: A recorded unplanned service degradation requiring a managed response.\n    properties:\n      status:\n        type: text\n      severity:\n        type: text\n      impact:\n        type: text\n      urgency:\n        type: text\n  ITService:\n    meaning: A technical service whose condition can affect a business service.\n    aliases: [IT service]\n  BusinessService:\n    aliases: [business service]\n  CustomerChannel:\n    aliases: [customer channel]\n  ConfigurationItem:\n    aliases: [configuration item, CI]\n  ThirdPartyDependency:\n    aliases: [third-party dependency]\n  ServiceOwner:\n    aliases: [service owner]\n  ResolverGroup:\n    aliases: [resolver group]\n  OnCallEngineer:\n    aliases: [on-call engineer]\n  IncidentCommander:\n    aliases: [incident commander]\n  IncidentResponseTeam:\n    aliases: [incident response team]\n  ResponseRecord:\n    aliases: [response record]\n  Runbook: {}\n  Workaround:\n    aliases: [temporary workaround]\n  RecoveryPlan:\n    aliases: [recovery plan]\n  BackupSet:\n    aliases: [backup set]\n  RecoveryEnvironment:\n    aliases: [recovery environment]\n    properties:\n      availability:\n        type: text\n  Change:\n    aliases: [change, deployment]\n  Communication:\n    meaning: A stakeholder update whose final message and delivery status are retained.\n    properties:\n      deliveryStatus:\n        type: text\n  Evidence:\n    meaning: Preserved technical or communications evidence supporting incident decisions and closure.\n  MaterialityAssessment:\n    aliases: [materiality assessment]\n    properties:\n      status:\n        type: text\n  RegulatoryNotification:\n    aliases: [regulatory notification]\n  ProblemRecord:\n    aliases: [problem record]\n  PostIncidentReview:\n    aliases: [post-incident review]\n    properties:\n      status:\n        type: text\nrelationships:\n  - name: arisesFrom\n    from: Alert\n    to: Event\n  - name: linkedToIncident\n    from: Alert\n    to: Incident\n  - name: linkedToIncident\n    from: Event\n    to: Incident\n  - name: impacts\n    from: Incident\n    to: ITService\n  - name: supports\n    from: ITService\n    to: BusinessService\n  - name: deliveredThrough\n    from: BusinessService\n    to: CustomerChannel\n  - name: dependsOn\n    from: ITService\n    to: ConfigurationItem\n  - name: dependsOn\n    from: ITService\n    to: ThirdPartyDependency\n  - name: ownedBy\n    from: ITService\n    to: ServiceOwner\n  - name: routedTo\n    from: Incident\n    to: ResolverGroup\n  - name: assignedTo\n    from: Incident\n    to: OnCallEngineer\n  - name: commandedBy\n    from: Incident\n    to: IncidentCommander\n  - name: coordinatedBy\n    from: Incident\n    to: IncidentResponseTeam\n  - name: hasResponseRecord\n    from: Incident\n    to: ResponseRecord\n  - name: usesRunbook\n    from: ResponseRecord\n    to: Runbook\n  - name: usesWorkaround\n    from: ResponseRecord\n    to: Workaround\n  - name: usesRecoveryPlan\n    from: ResponseRecord\n    to: RecoveryPlan\n  - name: usesBackupSet\n    from: ResponseRecord\n    to: BackupSet\n  - name: usesRecoveryEnvironment\n    from: RecoveryPlan\n    to: RecoveryEnvironment\n  - name: linkedToChange\n    from: Incident\n    to: Change\n  - name: hasCommunication\n    from: Incident\n    to: Communication\n  - name: preservesEvidence\n    from: Incident\n    to: Evidence\n  - name: hasMaterialityAssessment\n    from: Incident\n    to: MaterialityAssessment\n  - name: leadsToNotification\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n  - name: hasProblemRecord\n    from: Incident\n    to: ProblemRecord\n  - name: hasPostIncidentReview\n    from: Incident\n    to: PostIncidentReview\nrules:\n  majorIncidentDeclarationEligible:\n    conditions:\n      - The incident is active, not resolved, closed or cancelled.\n      - The incident has critical or high severity and at least one identified impacted IT service.\n      - An incident commander is assigned.\n      - The significance judgment follows the bank's approved major-incident criteria, without assuming a numerical threshold.\n  recoveryMoveEligible:\n    conditions:\n      - An applicable recovery plan is selected.\n      - The recovery environment is available and the data-recovery point is acceptable.\n  incidentClosureEligible:\n    conditions:\n      - Resolution or monitoring has reached the closure boundary.\n      - Service health is restored, or a residual condition is accepted.\n      - Required evidence and communications are complete.\n      - If the incident is major, the post-incident review is scheduled or completed.\n  stakeholderUpdateEligible:\n    conditions:\n      - The update is based on the latest verified incident state.\nactions:\n  declareMajorIncident:\n    input: Incident\n    preconditions: [majorIncidentDeclarationEligible]\n  moveToRecoveryEnvironment:\n    input: Incident\n    preconditions: [recoveryMoveEligible]\n  sendStakeholderUpdate:\n    input: Incident\n    preconditions: [stakeholderUpdateEligible]\n  closeIncident:\n    input: Incident\n    preconditions: [incidentClosureEligible]"
}
```

I understand the distinction between an alert, a managed incident, and a deliberately declared major incident. I’ll put that first set of confirmed concepts into the model now, then check the handoffs and closure details with you.

### Turn 2 — tool

Applied. Added 60, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 2 — assistant

I’ve represented the alert as something triaged before an incident is recorded, and “major” as a declaration gated by the bank’s criteria—not a severity value inferred from an alert. I’ve also kept the materiality assessment separate from the notification.

A few points would sharpen the decision rules:

1. What statuses do you actually use for an incident, and is “major” a separate declaration/flag or a status?
2. What makes an impact statement or stakeholder update **verified**? Who approves an update, and how do you identify its audience?
3. What inputs and outcomes does the materiality assessment record? What is the handoff to the designated reporting function, and when can a notification be issued?
4. For closure, who accepts a residual condition, and what marks the “monitoring has reached the closure boundary” decision?I’ve modeled the alert as something that needs triage before an incident is recorded, and “major” as a deliberate declaration governed by the bank’s criteria. I’ve kept the materiality assessment separate from any regulatory notification.

To make the decision rules accurate, could you clarify four points?

1. What incident statuses do you use? Is “major” a separate declaration or one of those statuses?
2. What makes an impact statement or stakeholder update **verified**, and who approves an update and selects its audience?
3. What outcomes can a materiality assessment reach, and how does the decision pass to the designated reporting function?
4. Who can accept a residual condition at closure, and what establishes that monitoring has reached the closure boundary?

### Turn 3 — user

Yes—those are the right separations.

1. **Incident status** can be: new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, or cancelled. **Major** is a separate declaration/classification, not another status. Declaration requires an incident that is not resolved, closed or cancelled; critical or high severity; at least one identified impacted IT service; and an assigned incident commander.

2. An update must reflect the **latest verified incident state**. We retain the observations and evidence supporting what we say about impact, rather than presenting a suspected dependency as a confirmed outage. For sending a stakeholder communication, its audience, message, owner and approval state must be recorded. The audience choices are technical, management, business, customer, vendor, regulator and all-staff; a communication is addressed to the relevant stakeholder. The model does **not** prescribe a particular approver or a universal test that makes every impact statement “verified”—those must follow the bank’s governing communications procedure.

3. A **materiality assessment** records when it was made, its rationale, a reporting due time where applicable, and one of four results: not reportable, potentially reportable, reportable, or undetermined. It assesses the incident and can trigger a separate regulatory notification. Operations supplies the incident facts and evidence; the designated reporting function, involving Legal or Compliance as appropriate, handles the reporting determination and submission workflow. Submission is permitted only with a **reportable** assessment, a notification linked to the incident and regulator, complete required information and supporting evidence, approved notification status, and submission before its due time. We retain the submission receipt and confirm acceptance, or record rejection and remediation.

4. Closure is allowed from **resolved or monitoring** status, provided impacted services are healthy **or** a residual condition has been accepted. Resolution and restoration evidence, required stakeholder communications, and—for a major incident—a scheduled or completed post-incident review must also be in place. The model does not name a universal person authorised to accept residual risk, or set a fixed monitoring duration or threshold. I would check the bank’s approved ownership and closure procedure rather than assign that authority or invent a timer.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n        allowed: [new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled]\n      majorDeclared:\n        type: boolean\n  ITService:\n    properties:\n      serviceHealth:\n        type: text\n  Communication:\n    properties:\n      audience:\n        type: text\n        allowed: [technical, management, business, customer, vendor, regulator, all-staff]\n      message:\n        type: text\n      owner:\n        type: text\n      approvalState:\n        type: text\n  Stakeholder: {}\n  MaterialityAssessment:\n    properties:\n      assessedAt:\n        type: date\n      rationale:\n        type: text\n      reportingDueTime:\n        type: date\n      result:\n        type: text\n        allowed: [not reportable, potentially reportable, reportable, undetermined]\n  DesignatedReportingFunction:\n    aliases: [designated reporting function]\n  Regulator: {}\n  RegulatoryNotification:\n    properties:\n      status:\n        type: text\n      requiredInformationComplete:\n        type: boolean\n      submissionOutcome:\n        type: text\n  SubmissionReceipt:\n    aliases: [submission receipt]\n  RemediationAction:\n    meaning: An action to remedy a rejected regulatory submission.\nrelationships:\n  - name: addressedTo\n    from: Communication\n    to: Stakeholder\n  - name: supportedBy\n    from: Communication\n    to: Evidence\n    meaning: Preserved observations or evidence substantiate verified statements about impact in a communication.\n  - name: handledBy\n    from: MaterialityAssessment\n    to: DesignatedReportingFunction\n  - name: hasRegulatoryNotification\n    from: Incident\n    to: RegulatoryNotification\n  - name: addressedTo\n    from: RegulatoryNotification\n    to: Regulator\n  - name: submittedBy\n    from: RegulatoryNotification\n    to: DesignatedReportingFunction\n  - name: supportedBy\n    from: RegulatoryNotification\n    to: Evidence\n  - name: hasSubmissionReceipt\n    from: RegulatoryNotification\n    to: SubmissionReceipt\n  - name: hasRemediationAction\n    from: RegulatoryNotification\n    to: RemediationAction\nrules:\n  majorIncidentDeclarationEligible:\n    conditions:\n      - The incident status is not resolved, closed or cancelled.\n      - The incident severity is critical or high and at least one impacted IT service is identified.\n      - An incident commander is assigned.\n      - The significance judgment follows the bank's approved major-incident criteria, without assuming a numerical threshold.\n  stakeholderUpdateEligible:\n    conditions:\n      - The communication records its relevant stakeholder audience, message, owner and approval state in accordance with the bank's governing communications procedure.\n      - The update reflects the latest verified incident state; supporting observations and evidence substantiate its statements about impact, without treating a suspected dependency as a confirmed outage.\n  regulatoryNotificationSubmissionEligible:\n    conditions:\n      - The incident has a materiality assessment with result reportable.\n      - The regulatory notification is linked to the incident and the regulator.\n      - Required information and supporting evidence are complete.\n      - The notification status is approved and submission is before its reporting due time.\n      - The designated reporting function owns the reporting determination and submission workflow, involving Legal or Compliance as appropriate.\n  incidentClosureEligible:\n    conditions:\n      - The incident status is resolved or monitoring.\n      - Impacted services are healthy, or a residual condition has been accepted under the bank's approved ownership and closure procedure.\n      - Resolution and restoration evidence and required stakeholder communications are in place.\n      - If major was declared, a post-incident review is scheduled or completed.\nactions:\n  submitRegulatoryNotification:\n    input: RegulatoryNotification\n    preconditions: [regulatoryNotificationSubmissionEligible]"
}
```

That clarifies several boundaries: “major” is separate from status; communication approval follows the bank’s procedure; and reporting is a distinct workflow owned by the designated reporting function. I’ll update the model with those constraints without inventing an approver, monitoring timer, or residual-risk authority.

### Turn 3 — tool

Applied. Added 16, updated 8 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "submitRegulatoryNotification" has input class RegulatoryNotification, and its precondition regulatoryNotificationSubmissionEligible refers to Incident, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from RegulatoryNotification to Incident. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "submitRegulatoryNotification" has input class RegulatoryNotification, and its precondition regulatoryNotificationSubmissionEligible refers to MaterialityAssessment, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from RegulatoryNotification to MaterialityAssessment. Rewording the text does not create the path it assumes.

### Turn 3 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "hasRegulatoryNotification",
      "to": "notifiesFor",
      "className": "",
      "source": "Incident",
      "target": "RegulatoryNotification",
      "reverse": true
    }
  ]
}
```

### Turn 3 — tool

Renamed 1 of 1:
- relationship "hasRegulatoryNotification" (Incident → RegulatoryNotification) → "notifiesFor" (RegulatoryNotification → Incident)

### Turn 3 — assistant

I’ve added the stated status and assessment-result lists and the submission prerequisites. I also adjusted the notification link so the submission decision can follow it back to the incident and its assessment.

One more pass would help with recovery and follow-up:

1. When tracing impact, do configuration items and third-party dependencies connect directly to the IT service, or are there important connections *between* them?
2. How do you decide that a runbook, workaround, backup set, or recovery plan is applicable and safe? What do you record to verify a move to the recovery environment?
3. How do you distinguish a change that *may have contributed* to an incident from a controlled change made *to fix* it?
4. After a notification is submitted, which states or outcomes do you use for acceptance, rejection, and remediation?I’ve added the incident statuses, the separate major declaration, communication requirements, and the reporting submission prerequisites. I haven’t assigned an approver, residual-risk owner, or monitoring threshold where your procedures must supply one.

To finish the recovery and follow-up parts accurately:

1. Do configuration items and third-party dependencies connect only to the IT service, or are there important dependencies between them?
2. What makes a runbook, workaround, backup set, or recovery plan applicable and safe? What evidence verifies recovery in the alternate environment?
3. How do you distinguish a change suspected of contributing to the incident from a controlled change made to fix it?
4. After regulatory submission, what states or outcomes do you record for acceptance, rejection, and remediation?

### Turn 4 — user

1. **The dependency paths are more specific than “everything connects to the IT service.”** An IT service depends on a third-party service, which a vendor provides. It can be implemented by an application and run on infrastructure; an application can in turn use a database, consume an interface and run on infrastructure. Configuration items are the managed components we identify as affected by an incident or modified by a change. I would not assume a general configuration-item-to-configuration-item dependency link where none has been established.

2. **Applicability and safety depend on the particular response.** An incident may be handled with a runbook; a workaround is a temporary reduction or bypass of impact, potentially documented in that runbook for a known error. A recovery plan must apply to the service before failover, the target recovery environment must be available, and the data-recovery point must be acceptable. A backup restore needs a successful or verified backup that protects the target, plus an approved restore point and target environment. After failover, we verify service health **and critical business transactions in the recovery environment**; after a restore, we validate data integrity and application functionality. We retain the observations and evidence behind those checks.

3. **Suspected cause and intended remedy are different claims.** To investigate a possible contributing change, I compare the incident timeline with the change and deployment records, the components modified, and the services affected; proximity alone does not prove causation. A controlled fix is represented separately: the incident may be resolved by a change. An emergency change must be justified by an active incident and, before execution, have identified affected components, implementation and backout plans, and explicitly accepted risk. Its technical checks, service-health verification and implementation evidence then show what the fix actually did.

4. A regulatory notification uses these workflow states: **draft, pending approval, approved, submitted, accepted, rejected, or withdrawn**. Submission records a receipt; we then confirm acceptance or record a rejection and the remediation needed. I would not treat “remediation” as another notification status. If rejection requires follow-up work, we track that work and its evidence separately while preserving the notification’s actual state and submission history.

### Turn 4 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 4 — tool

competency_questions: []
classes:
  Alert:
    meaning: "A monitoring signal requiring triage, not automatically an incident."
    aliases: []
    properties: {}
  Event:
    meaning: An underlying observed event that may be linked to an alert or incident.
    aliases: []
    properties: {}
  Incident:
    meaning: A recorded unplanned service degradation requiring a managed response.
    aliases: []
    properties:
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
      impact:
        type: text
      urgency:
        type: text
      majorDeclared:
        type: boolean
  ITService:
    meaning: A technical service whose condition can affect a business service.
    aliases:
      - IT service
    properties:
      serviceHealth:
        type: text
  BusinessService:
    meaning: null
    aliases:
      - business service
    properties: {}
  CustomerChannel:
    meaning: null
    aliases:
      - customer channel
    properties: {}
  ConfigurationItem:
    meaning: null
    aliases:
      - configuration item
      - CI
    properties: {}
  ThirdPartyDependency:
    meaning: null
    aliases:
      - third-party dependency
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
  ResponseRecord:
    meaning: null
    aliases:
      - response record
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases:
      - temporary workaround
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases:
      - recovery plan
    properties: {}
  BackupSet:
    meaning: null
    aliases:
      - backup set
    properties: {}
  RecoveryEnvironment:
    meaning: null
    aliases:
      - recovery environment
    properties:
      availability:
        type: text
  Change:
    meaning: null
    aliases:
      - change
      - deployment
    properties: {}
  Communication:
    meaning: A stakeholder update whose final message and delivery status are retained.
    aliases: []
    properties:
      deliveryStatus:
        type: text
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
      message:
        type: text
      owner:
        type: text
      approvalState:
        type: text
  Evidence:
    meaning: Preserved technical or communications evidence supporting incident decisions and closure.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases:
      - materiality assessment
    properties:
      status:
        type: text
      assessedAt:
        type: date
      rationale:
        type: text
      reportingDueTime:
        type: date
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
  RegulatoryNotification:
    meaning: null
    aliases:
      - regulatory notification
    properties:
      status:
        type: text
      requiredInformationComplete:
        type: boolean
      submissionOutcome:
        type: text
  ProblemRecord:
    meaning: null
    aliases:
      - problem record
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases:
      - post-incident review
    properties:
      status:
        type: text
  Stakeholder:
    meaning: null
    aliases: []
    properties: {}
  DesignatedReportingFunction:
    meaning: null
    aliases:
      - designated reporting function
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  SubmissionReceipt:
    meaning: null
    aliases:
      - submission receipt
    properties: {}
  RemediationAction:
    meaning: An action to remedy a rejected regulatory submission.
    aliases: []
    properties: {}
relationships:
  - name: arisesFrom
    from: Alert
    to: Event
    meaning: null
    aliases: []
  - name: linkedToIncident
    from: Alert
    to: Incident
    meaning: null
    aliases: []
  - name: linkedToIncident
    from: Event
    to: Incident
    meaning: null
    aliases: []
  - name: impacts
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: supports
    from: ITService
    to: BusinessService
    meaning: null
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: dependsOn
    from: ITService
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOn
    from: ITService
    to: ThirdPartyDependency
    meaning: null
    aliases: []
  - name: ownedBy
    from: ITService
    to: ServiceOwner
    meaning: null
    aliases: []
  - name: routedTo
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: assignedTo
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: commandedBy
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: coordinatedBy
    from: Incident
    to: IncidentResponseTeam
    meaning: null
    aliases: []
  - name: hasResponseRecord
    from: Incident
    to: ResponseRecord
    meaning: null
    aliases: []
  - name: usesRunbook
    from: ResponseRecord
    to: Runbook
    meaning: null
    aliases: []
  - name: usesWorkaround
    from: ResponseRecord
    to: Workaround
    meaning: null
    aliases: []
  - name: usesRecoveryPlan
    from: ResponseRecord
    to: RecoveryPlan
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: ResponseRecord
    to: BackupSet
    meaning: null
    aliases: []
  - name: usesRecoveryEnvironment
    from: RecoveryPlan
    to: RecoveryEnvironment
    meaning: null
    aliases: []
  - name: linkedToChange
    from: Incident
    to: Change
    meaning: null
    aliases: []
  - name: hasCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: preservesEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: hasMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: leadsToNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: hasProblemRecord
    from: Incident
    to: ProblemRecord
    meaning: null
    aliases: []
  - name: hasPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: null
    aliases: []
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: null
    aliases: []
  - name: supportedBy
    from: Communication
    to: Evidence
    meaning: Preserved observations or evidence substantiate verified statements about impact in a communication.
    aliases: []
  - name: handledBy
    from: MaterialityAssessment
    to: DesignatedReportingFunction
    meaning: null
    aliases: []
  - name: notifiesFor
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases:
      - hasRegulatoryNotification
  - name: addressedTo
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: submittedBy
    from: RegulatoryNotification
    to: DesignatedReportingFunction
    meaning: null
    aliases: []
  - name: supportedBy
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: hasSubmissionReceipt
    from: RegulatoryNotification
    to: SubmissionReceipt
    meaning: null
    aliases: []
  - name: hasRemediationAction
    from: RegulatoryNotification
    to: RemediationAction
    meaning: null
    aliases: []
rules:
  majorIncidentDeclarationEligible:
    conditions:
      - "The incident status is not resolved, closed or cancelled."
      - The incident severity is critical or high and at least one impacted IT service is identified.
      - An incident commander is assigned.
      - "The significance judgment follows the bank's approved major-incident criteria, without assuming a numerical threshold."
  recoveryMoveEligible:
    conditions:
      - An applicable recovery plan is selected.
      - The recovery environment is available and the data-recovery point is acceptable.
  incidentClosureEligible:
    conditions:
      - The incident status is resolved or monitoring.
      - "Impacted services are healthy, or a residual condition has been accepted under the bank's approved ownership and closure procedure."
      - Resolution and restoration evidence and required stakeholder communications are in place.
      - "If major was declared, a post-incident review is scheduled or completed."
  stakeholderUpdateEligible:
    conditions:
      - "The communication records its relevant stakeholder audience, message, owner and approval state in accordance with the bank's governing communications procedure."
      - "The update reflects the latest verified incident state; supporting observations and evidence substantiate its statements about impact, without treating a suspected dependency as a confirmed outage."
  regulatoryNotificationSubmissionEligible:
    conditions:
      - The incident has a materiality assessment with result reportable.
      - The regulatory notification is linked to the incident and the regulator.
      - Required information and supporting evidence are complete.
      - The notification status is approved and submission is before its reporting due time.
      - "The designated reporting function owns the reporting determination and submission workflow, involving Legal or Compliance as appropriate."
actions:
  declareMajorIncident:
    input: Incident
    preconditions:
      - majorIncidentDeclarationEligible
    effect: ""
    verification: ""
  moveToRecoveryEnvironment:
    input: Incident
    preconditions:
      - recoveryMoveEligible
    effect: ""
    verification: ""
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - stakeholderUpdateEligible
    effect: ""
    verification: ""
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureEligible
    effect: ""
    verification: ""
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - regulatoryNotificationSubmissionEligible
    effect: ""
    verification: ""


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 4 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "ThirdPartyDependency",
      "to": "ThirdPartyService",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

I hear two corrections to the current model: the service dependency should be a vendor-provided third-party service, not a generic dependency object; and a configuration item should not acquire a dependency link just because it is managed. I’ll make those corrections, then add separate paths for suspected causes, controlled fixes, failover, restore, and notification follow-up.

### Turn 4 — tool

Renamed 1 of 1:
- class "ThirdPartyDependency" → "ThirdPartyService" (previous name kept as an alias)

### Turn 4 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [],
  "relationships": [
    {
      "name": "dependsOn",
      "from": "ITService",
      "to": "ConfigurationItem"
    },
    {
      "name": "linkedToChange",
      "from": "Incident",
      "to": "Change"
    }
  ],
  "properties": [
    {
      "className": "MaterialityAssessment",
      "name": "status"
    },
    {
      "className": "RegulatoryNotification",
      "name": "submissionOutcome"
    }
  ],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

### Turn 4 — tool

Removed 4 element(s) — relationships: dependsOn (ITService → ConfigurationItem), linkedToChange (Incident → Change); properties: MaterialityAssessment.status, RegulatoryNotification.submissionOutcome.

CONSISTENCY CHECK — no new problems from this edit.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ThirdPartyService:\n    meaning: A vendor-provided service on which an IT service depends.\n    aliases: [third-party service, third-party dependency]\n  Vendor: {}\n  Application: {}\n  Infrastructure: {}\n  Database: {}\n  Interface: {}\n  ConfigurationItem:\n    meaning: A managed component identified as affected by an incident or modified by a change, without presuming dependencies between configuration items.\n  Change:\n    aliases: [change]\n    properties:\n      emergency:\n        type: boolean\n      riskAccepted:\n        type: boolean\n      implementationTime:\n        type: date\n  Deployment:\n    properties:\n      deploymentTime:\n        type: date\n  ImplementationPlan:\n    aliases: [implementation plan]\n  BackoutPlan:\n    aliases: [backout plan]\nrelationships:\n  - name: providedBy\n    from: ThirdPartyService\n    to: Vendor\n  - name: implementedBy\n    from: ITService\n    to: Application\n  - name: runsOn\n    from: ITService\n    to: Infrastructure\n  - name: uses\n    from: Application\n    to: Database\n  - name: consumes\n    from: Application\n    to: Interface\n  - name: runsOn\n    from: Application\n    to: Infrastructure\n  - name: affects\n    from: Incident\n    to: ConfigurationItem\n  - name: modifies\n    from: Change\n    to: ConfigurationItem\n  - name: affects\n    from: Change\n    to: ITService\n  - name: hasDeployment\n    from: Change\n    to: Deployment\n  - name: suspectedContributingChange\n    from: Incident\n    to: Change\n    meaning: A change investigated as a possible contributor, not proof of causation by timing alone.\n  - name: resolvedBy\n    from: Incident\n    to: Change\n    meaning: A controlled change intended to fix the incident, distinct from a suspected contributing change.\n  - name: justifiedBy\n    from: Change\n    to: Incident\n    meaning: An emergency change is justified by an active incident.\n  - name: hasImplementationPlan\n    from: Change\n    to: ImplementationPlan\n  - name: hasBackoutPlan\n    from: Change\n    to: BackoutPlan\n  - name: appliesTo\n    from: RecoveryPlan\n    to: ITService\nrules:\n  emergencyChangeExecutionEligible:\n    conditions:\n      - The emergency change is justified by an active incident.\n      - The affected configuration items are identified and implementation and backout plans are in place.\n      - The risk is explicitly accepted before execution.\n  recoveryMoveEligible:\n    conditions:\n      - The recovery plan applies to the affected IT service.\n      - The target recovery environment is available and the data-recovery point is acceptable.\nactions:\n  executeEmergencyChange:\n    input: Change\n    preconditions: [emergencyChangeExecutionEligible]"
}
```

### Turn 4 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 4 — assistant

Your distinction is clear: a suspected contributing change is not the same claim as a change made to resolve the incident, and notification remediation is not a notification status. I’ve corrected the earlier generic third-party and configuration-item links; the more detailed recovery and change additions are still pending, so I won’t treat them as modeled yet.

One point before I add them: are **application, infrastructure, database, and interface** always managed as configuration items in your records, or only sometimes? That determines whether the model should explicitly connect those component types to “configuration item” without assuming dependencies between them.

### Turn 5 — user

**Not automatically.** “Configuration item” means a component managed within our configuration-management scope. An application, database, interface or infrastructure component may be recorded in that scope, but I would not assert that every instance of each type is always a configuration item.

Keep the specific connections we know: an IT service is implemented by an application and runs on infrastructure; an application uses a database, consumes an interface and runs on infrastructure. Separately, an incident can affect a configuration item, and a change can modify one. Don’t add a blanket type-to-configuration-item rule—or infer dependencies between components—without confirmation from the bank’s configuration-management practice.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - Which business services and customer channels are impacted by an incident, and what service and component dependencies support that assessment?\n  - Which alerts and events belong to an incident, and who owns the affected service and resolves the incident?\n  - Does an incident satisfy the bank's criteria for declaring a major incident?\n  - Which response, failover or backup restore is safe, and what checks demonstrate that it worked?\n  - Is a change a suspected contributor or an intended fix, and is an emergency change safe to execute?\n  - Does the materiality assessment call for notification, and is the notification eligible for submission and subsequently accepted?\n  - Are service health, evidence, communications and review arrangements sufficient for incident closure?\nclasses:\n  ThirdPartyService:\n    meaning: A vendor-provided service on which an IT service depends.\n    aliases: [third-party service, third-party dependency]\n  Vendor: {}\n  Application: {}\n  Infrastructure: {}\n  Database: {}\n  Interface: {}\n  ConfigurationItem:\n    meaning: A component managed within the bank's configuration-management scope, which may be identified as affected by an incident or modified by a change; component type alone does not establish membership.\n  Change:\n    aliases: [change]\n    properties:\n      emergency:\n        type: boolean\n      riskAccepted:\n        type: boolean\n      implementationTime:\n        type: date\n  Deployment:\n    properties:\n      deploymentTime:\n        type: date\n  ImplementationPlan:\n    aliases: [implementation plan]\n  BackoutPlan:\n    aliases: [backout plan]\n  BackupSet:\n    properties:\n      verificationStatus:\n        type: text\n  RestorePoint:\n    aliases: [restore point]\n    properties:\n      approvalState:\n        type: text\n  RecoveryEnvironment:\n    properties:\n      dataRecoveryPointAcceptable:\n        type: boolean\n  RegulatoryNotification:\n    properties:\n      status:\n        type: text\n        allowed: [draft, pending approval, approved, submitted, accepted, rejected, withdrawn]\n  RemediationAction:\n    meaning: Follow-up work after rejection of a regulatory notification, tracked separately from notification status.\nrelationships:\n  - name: providedBy\n    from: ThirdPartyService\n    to: Vendor\n  - name: implementedBy\n    from: ITService\n    to: Application\n  - name: runsOn\n    from: ITService\n    to: Infrastructure\n  - name: uses\n    from: Application\n    to: Database\n  - name: consumes\n    from: Application\n    to: Interface\n  - name: runsOn\n    from: Application\n    to: Infrastructure\n  - name: affects\n    from: Incident\n    to: ConfigurationItem\n  - name: modifies\n    from: Change\n    to: ConfigurationItem\n  - name: affects\n    from: Change\n    to: ITService\n  - name: hasDeployment\n    from: Change\n    to: Deployment\n  - name: suspectedContributingChange\n    from: Incident\n    to: Change\n    meaning: A change investigated as a possible contributor; proximity in time is not proof of causation.\n  - name: resolvedBy\n    from: Incident\n    to: Change\n    meaning: A controlled change intended to fix the incident, distinct from a suspected contributing change.\n  - name: justifiedBy\n    from: Change\n    to: Incident\n    meaning: An emergency change is justified by an active incident, not necessarily already a confirmed fix.\n  - name: hasImplementationPlan\n    from: Change\n    to: ImplementationPlan\n  - name: hasBackoutPlan\n    from: Change\n    to: BackoutPlan\n  - name: preservesEvidence\n    from: Change\n    to: Evidence\n  - name: appliesTo\n    from: RecoveryPlan\n    to: ITService\n  - name: protects\n    from: BackupSet\n    to: ITService\n    meaning: A backup set protects the target service for a proposed restore when confirmed applicable.\n  - name: usesRestorePoint\n    from: ResponseRecord\n    to: RestorePoint\n  - name: usesRecoveryEnvironment\n    from: ResponseRecord\n    to: RecoveryEnvironment\n    meaning: The response records the target environment for failover or restore.\n  - name: preservesEvidence\n    from: ResponseRecord\n    to: Evidence\n  - name: supportedBy\n    from: RemediationAction\n    to: Evidence\nrules:\n  emergencyChangeExecutionEligible:\n    conditions:\n      - The change is an emergency change justified by an active incident.\n      - Affected configuration items are identified, and implementation and backout plans are in place.\n      - Risk is explicitly accepted before execution.\n  recoveryMoveEligible:\n    conditions:\n      - The selected recovery plan applies to the affected IT service.\n      - The target recovery environment is available and its data-recovery point is acceptable.\n  backupRestoreEligible:\n    conditions:\n      - The backup set protecting the target has succeeded or been verified.\n      - The restore point is approved and the target recovery environment is available.\n  failoverVerificationComplete:\n    conditions:\n      - Service health and critical business transactions are verified in the recovery environment, with supporting observations and evidence retained.\n  restoreVerificationComplete:\n    conditions:\n      - Data integrity and application functionality are validated after restore, with supporting observations and evidence retained.\n  incidentClosureEligible:\n    conditions:\n      - The incident status is resolved or monitoring.\n      - Impacted services are healthy, or a residual condition has been accepted under the bank's approved ownership and closure procedure.\n      - Resolution and restoration evidence and required stakeholder communications are in place, including applicable failover or restore verification.\n      - If major was declared, a post-incident review is scheduled or completed.\n  regulatoryNotificationSubmissionEligible:\n    conditions:\n      - The incident has a materiality assessment with result reportable.\n      - The regulatory notification is linked to the incident and the regulator.\n      - Required information and supporting evidence are complete.\n      - The notification status is approved and submission is before its reporting due time.\n      - The designated reporting function owns the reporting determination and submission workflow, involving Legal or Compliance as appropriate.\n  notificationFollowUpComplete:\n    conditions:\n      - Submission receipt is retained and regulator acceptance is confirmed, or a rejection and its separately tracked remediation and evidence are recorded.\nactions:\n  executeEmergencyChange:\n    input: Change\n    preconditions: [emergencyChangeExecutionEligible]\n  restoreFromBackup:\n    input: Incident\n    preconditions: [backupRestoreEligible]"
}
```

Understood. I’ll keep those as specific service/component relationships and leave configuration-item membership conditional on the bank’s records. I’ll now add the confirmed recovery, change, and notification details.

### Turn 5 — tool

Applied. Added 38, updated 10 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] inverse-pair — Change --justifiedBy--> Incident looks like the inverse of Incident --suspectedContributingChange--> Change. The profile is one directed relationship per real-world connection, never also its inverse. Keep whichever direction the questions and actions actually navigate.

### Turn 5 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [],
  "relationships": [
    {
      "name": "justifiedBy",
      "from": "Change",
      "to": "Incident"
    }
  ],
  "properties": [],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

### Turn 5 — tool

Removed 1 element(s) — relationships: justifiedBy (Change → Incident).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its precondition emergencyChangeExecutionEligible refers to Incident, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Change to Incident. Rewording the text does not create the path it assumes.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: proposesEmergencyChange\n    from: Incident\n    to: Change\n    meaning: An active incident provides the justification for a proposed emergency change before its execution, distinct from a change later confirmed as a remedy.\nrules:\n  emergencyChangeExecutionEligible:\n    conditions:\n      - The active incident proposes the emergency change for execution.\n      - Affected configuration items are identified, and implementation and backout plans are in place for that change.\n      - Risk is explicitly accepted before execution.\nactions:\n  executeEmergencyChange:\n    input: Incident\n    preconditions: [emergencyChangeExecutionEligible]"
}
```

### Turn 5 — tool

Applied. Added 1, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

Understood: an application, database, interface, or infrastructure component is a **configuration item only when it is managed in that scope**. I’ve added the specific service and application connections you described, without a blanket type rule or inferred component-to-component dependencies.

The model now also distinguishes a suspected contributing change from an intended fix, and records separate eligibility and verification checks for failover, backup restore, emergency changes, and notification follow-up.

Two final details would prevent overgeneralising:

1. For a backup restore, what can the **target** be in your practice—an IT service, application, database, managed configuration item, or something else?
2. Do a **known error** and the corrective actions from a post-incident review need their own records, or are they tracked within the problem record and review?

### Turn 6 — user

1. For the restore check, the **backup set must protect the target**. We explicitly track which managed configuration item a backup set protects; the restore action also needs an approved restore point and target environment. I would not generalise that into “any IT service, application or database can be a restore target” without checking what is actually protected and how that target is recorded. After restoration, we validate data integrity and application functionality.

2. **Keep them as distinct records.** A problem can be documented by a known error: that is the diagnosed cause or documented workaround, not just a new status on the problem. A post-incident review can produce separately tracked corrective actions, with their own description, status and due date. An action can be owned by an organisational unit and implemented through a change. Keeping those records separate lets us follow whether the proposed improvement was actually implemented and verified.

### Turn 6 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [],
  "relationships": [
    {
      "name": "protects",
      "from": "BackupSet",
      "to": "ITService"
    }
  ],
  "properties": [],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

That resolves the restore-target ambiguity: the backup set protects a specifically managed configuration item, not an arbitrary service or component type. I’ll correct that link and add known errors and corrective actions as separate records.

### Turn 6 — tool

Removed 1 element(s) — relationships: protects (BackupSet → ITService).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  KnownError:\n    meaning: A separately documented diagnosed cause or workaround for a problem.\n    aliases: [known error]\n  CorrectiveAction:\n    meaning: A separately tracked improvement from a post-incident review whose implementation and verification can be followed.\n    aliases: [corrective action]\n    properties:\n      description:\n        type: text\n      status:\n        type: text\n      dueDate:\n        type: date\n  OrganisationalUnit:\n    aliases: [organisational unit]\nrelationships:\n  - name: protects\n    from: BackupSet\n    to: ConfigurationItem\n    meaning: Identifies the managed configuration item protected by a backup set and eligible as a restore target.\n  - name: documentedBy\n    from: ProblemRecord\n    to: KnownError\n  - name: documentsWorkaround\n    from: KnownError\n    to: Workaround\n  - name: produces\n    from: PostIncidentReview\n    to: CorrectiveAction\n  - name: ownedBy\n    from: CorrectiveAction\n    to: OrganisationalUnit\n  - name: implementedThrough\n    from: CorrectiveAction\n    to: Change\n  - name: supportedBy\n    from: CorrectiveAction\n    to: Evidence\nrules:\n  backupRestoreEligible:\n    conditions:\n      - The backup set protects the specifically identified managed configuration item to be restored and the backup has succeeded or been verified.\n      - The restore point is approved and the target recovery environment is available.\n  restoreVerificationComplete:\n    conditions:\n      - After restoring the protected configuration item, data integrity and application functionality are validated with supporting observations and evidence retained."
}
```

### Turn 6 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 6 — assistant

I’ve removed the overbroad link that said a backup set protects an IT service. The replacement—protection of a specifically managed configuration item—and the distinct known-error and corrective-action records are **not yet on the model**, so I won’t claim they are.

One last question before I add them: for a known error, should the link to its documented workaround be optional? And is verification of a corrective action recorded on the action itself, or evidenced through the implementing change?

### Turn 7 — user

Yes. A known error **can have a linked workaround**, but I would not make that link mandatory in every case. It may document a diagnosed cause even when no workable temporary bypass is available.

Verification is recorded on the **corrective action itself**: its status can move to *verified*. The action may also be implemented through a change, whose implementation checks and evidence help substantiate that result. A linked change is not, by itself, proof that the corrective action has been verified.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - Which business services and customer channels are impacted by an incident, and what service and component dependencies support that assessment?\n  - Which alerts and events belong to an incident, and who owns the affected service and resolves the incident?\n  - Does an incident satisfy the bank's criteria for declaring a major incident?\n  - Which response, failover or backup restore is safe, and what checks demonstrate that it worked?\n  - Is a change a suspected contributor or an intended fix, and is an emergency change safe to execute?\n  - Does the materiality assessment call for notification, and is the notification eligible for submission and subsequently accepted?\n  - Are service health, evidence, communications and review arrangements sufficient for incident closure?\n  - Which known errors and corrective actions follow an incident, and has each corrective action actually been verified?\nclasses:\n  KnownError:\n    meaning: A separately documented diagnosed cause or workaround for a problem, even if no workaround is available.\n    aliases: [known error]\n  CorrectiveAction:\n    meaning: A separately tracked improvement produced by a post-incident review, verified on the action itself rather than inferred from a linked change.\n    aliases: [corrective action]\n    properties:\n      description:\n        type: text\n      status:\n        type: text\n      dueDate:\n        type: date\n  OrganisationalUnit:\n    aliases: [organisational unit]\nrelationships:\n  - name: protects\n    from: BackupSet\n    to: ConfigurationItem\n    meaning: The backup set protects this specifically managed configuration item as the restore target.\n  - name: documentedBy\n    from: ProblemRecord\n    to: KnownError\n  - name: documentsWorkaround\n    from: KnownError\n    to: Workaround\n    meaning: An optional documented temporary bypass; a known error need not have a workable bypass.\n  - name: produces\n    from: PostIncidentReview\n    to: CorrectiveAction\n  - name: ownedBy\n    from: CorrectiveAction\n    to: OrganisationalUnit\n  - name: implementedThrough\n    from: CorrectiveAction\n    to: Change\n    meaning: A linked implementing change alone does not prove that the action is verified.\n  - name: supportedBy\n    from: CorrectiveAction\n    to: Evidence\nrules:\n  backupRestoreEligible:\n    conditions:\n      - The backup set protects the specifically identified managed configuration item to be restored and the backup has succeeded or been verified.\n      - The restore point is approved and the target recovery environment is available.\n  restoreVerificationComplete:\n    conditions:\n      - After restoring the protected configuration item, data integrity and application functionality are validated with supporting observations and evidence retained.\n  correctiveActionVerificationComplete:\n    conditions:\n      - The corrective action's own status is verified based on implementation checks and supporting evidence.\n      - A linked implementing change, if any, does not by itself prove verification."
}
```

Yes: the workaround link is optional, and a linked implementing change does not itself establish verification. I’ll record “verified” on the corrective action and use the change’s checks and evidence only as support.

### Turn 7 — tool

Applied. Added 11, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 7 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

I believe the model now covers the decisions you set out: impact tracing, major-incident declaration, response safety and verification, communications, reporting, closure, and follow-up. I’ll run a final consistency check before calling the interview complete.

### Turn 7 — tool

competency_questions: []
classes:
  Alert:
    meaning: "A monitoring signal requiring triage, not automatically an incident."
    aliases: []
    properties: {}
  Event:
    meaning: An underlying observed event that may be linked to an alert or incident.
    aliases: []
    properties: {}
  Incident:
    meaning: A recorded unplanned service degradation requiring a managed response.
    aliases: []
    properties:
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
      impact:
        type: text
      urgency:
        type: text
      majorDeclared:
        type: boolean
  ITService:
    meaning: A technical service whose condition can affect a business service.
    aliases:
      - IT service
    properties:
      serviceHealth:
        type: text
  BusinessService:
    meaning: null
    aliases:
      - business service
    properties: {}
  CustomerChannel:
    meaning: null
    aliases:
      - customer channel
    properties: {}
  ConfigurationItem:
    meaning: "A component managed within the bank's configuration-management scope, which may be identified as affected by an incident or modified by a change; component type alone does not establish membership."
    aliases:
      - configuration item
      - CI
    properties: {}
  ThirdPartyService:
    meaning: A vendor-provided service on which an IT service depends.
    aliases:
      - third-party service
      - third-party dependency
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
  ResponseRecord:
    meaning: null
    aliases:
      - response record
    properties: {}
  Runbook:
    meaning: null
    aliases: []
    properties: {}
  Workaround:
    meaning: null
    aliases:
      - temporary workaround
    properties: {}
  RecoveryPlan:
    meaning: null
    aliases:
      - recovery plan
    properties: {}
  BackupSet:
    meaning: null
    aliases:
      - backup set
    properties:
      verificationStatus:
        type: text
  RecoveryEnvironment:
    meaning: null
    aliases:
      - recovery environment
    properties:
      availability:
        type: text
      dataRecoveryPointAcceptable:
        type: boolean
  Change:
    meaning: null
    aliases:
      - change
    properties:
      emergency:
        type: boolean
      riskAccepted:
        type: boolean
      implementationTime:
        type: date
  Communication:
    meaning: A stakeholder update whose final message and delivery status are retained.
    aliases: []
    properties:
      deliveryStatus:
        type: text
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
      message:
        type: text
      owner:
        type: text
      approvalState:
        type: text
  Evidence:
    meaning: Preserved technical or communications evidence supporting incident decisions and closure.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: null
    aliases:
      - materiality assessment
    properties:
      assessedAt:
        type: date
      rationale:
        type: text
      reportingDueTime:
        type: date
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
  RegulatoryNotification:
    meaning: null
    aliases:
      - regulatory notification
    properties:
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      requiredInformationComplete:
        type: boolean
  ProblemRecord:
    meaning: null
    aliases:
      - problem record
    properties: {}
  PostIncidentReview:
    meaning: null
    aliases:
      - post-incident review
    properties:
      status:
        type: text
  Stakeholder:
    meaning: null
    aliases: []
    properties: {}
  DesignatedReportingFunction:
    meaning: null
    aliases:
      - designated reporting function
    properties: {}
  Regulator:
    meaning: null
    aliases: []
    properties: {}
  SubmissionReceipt:
    meaning: null
    aliases:
      - submission receipt
    properties: {}
  RemediationAction:
    meaning: "Follow-up work after rejection of a regulatory notification, tracked separately from notification status."
    aliases: []
    properties: {}
  Vendor:
    meaning: null
    aliases: []
    properties: {}
  Application:
    meaning: null
    aliases: []
    properties: {}
  Infrastructure:
    meaning: null
    aliases: []
    properties: {}
  Database:
    meaning: null
    aliases: []
    properties: {}
  Interface:
    meaning: null
    aliases: []
    properties: {}
  Deployment:
    meaning: null
    aliases: []
    properties:
      deploymentTime:
        type: date
  ImplementationPlan:
    meaning: null
    aliases:
      - implementation plan
    properties: {}
  BackoutPlan:
    meaning: null
    aliases:
      - backout plan
    properties: {}
  RestorePoint:
    meaning: null
    aliases:
      - restore point
    properties:
      approvalState:
        type: text
  KnownError:
    meaning: "A separately documented diagnosed cause or workaround for a problem, even if no workaround is available."
    aliases:
      - known error
    properties: {}
  CorrectiveAction:
    meaning: "A separately tracked improvement produced by a post-incident review, verified on the action itself rather than inferred from a linked change."
    aliases:
      - corrective action
    properties:
      description:
        type: text
      status:
        type: text
      dueDate:
        type: date
  OrganisationalUnit:
    meaning: null
    aliases:
      - organisational unit
    properties: {}
relationships:
  - name: arisesFrom
    from: Alert
    to: Event
    meaning: null
    aliases: []
  - name: linkedToIncident
    from: Alert
    to: Incident
    meaning: null
    aliases: []
  - name: linkedToIncident
    from: Event
    to: Incident
    meaning: null
    aliases: []
  - name: impacts
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: supports
    from: ITService
    to: BusinessService
    meaning: null
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: dependsOn
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: ownedBy
    from: ITService
    to: ServiceOwner
    meaning: null
    aliases: []
  - name: routedTo
    from: Incident
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: assignedTo
    from: Incident
    to: OnCallEngineer
    meaning: null
    aliases: []
  - name: commandedBy
    from: Incident
    to: IncidentCommander
    meaning: null
    aliases: []
  - name: coordinatedBy
    from: Incident
    to: IncidentResponseTeam
    meaning: null
    aliases: []
  - name: hasResponseRecord
    from: Incident
    to: ResponseRecord
    meaning: null
    aliases: []
  - name: usesRunbook
    from: ResponseRecord
    to: Runbook
    meaning: null
    aliases: []
  - name: usesWorkaround
    from: ResponseRecord
    to: Workaround
    meaning: null
    aliases: []
  - name: usesRecoveryPlan
    from: ResponseRecord
    to: RecoveryPlan
    meaning: null
    aliases: []
  - name: usesBackupSet
    from: ResponseRecord
    to: BackupSet
    meaning: null
    aliases: []
  - name: usesRecoveryEnvironment
    from: RecoveryPlan
    to: RecoveryEnvironment
    meaning: null
    aliases: []
  - name: hasCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases: []
  - name: preservesEvidence
    from: Incident
    to: Evidence
    meaning: null
    aliases: []
  - name: hasMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: leadsToNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: hasProblemRecord
    from: Incident
    to: ProblemRecord
    meaning: null
    aliases: []
  - name: hasPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: null
    aliases: []
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: null
    aliases: []
  - name: supportedBy
    from: Communication
    to: Evidence
    meaning: Preserved observations or evidence substantiate verified statements about impact in a communication.
    aliases: []
  - name: handledBy
    from: MaterialityAssessment
    to: DesignatedReportingFunction
    meaning: null
    aliases: []
  - name: notifiesFor
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases:
      - hasRegulatoryNotification
  - name: addressedTo
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: submittedBy
    from: RegulatoryNotification
    to: DesignatedReportingFunction
    meaning: null
    aliases: []
  - name: supportedBy
    from: RegulatoryNotification
    to: Evidence
    meaning: null
    aliases: []
  - name: hasSubmissionReceipt
    from: RegulatoryNotification
    to: SubmissionReceipt
    meaning: null
    aliases: []
  - name: hasRemediationAction
    from: RegulatoryNotification
    to: RemediationAction
    meaning: null
    aliases: []
  - name: providedBy
    from: ThirdPartyService
    to: Vendor
    meaning: null
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: null
    aliases: []
  - name: runsOn
    from: ITService
    to: Infrastructure
    meaning: null
    aliases: []
  - name: uses
    from: Application
    to: Database
    meaning: null
    aliases: []
  - name: consumes
    from: Application
    to: Interface
    meaning: null
    aliases: []
  - name: runsOn
    from: Application
    to: Infrastructure
    meaning: null
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: modifies
    from: Change
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: affects
    from: Change
    to: ITService
    meaning: null
    aliases: []
  - name: hasDeployment
    from: Change
    to: Deployment
    meaning: null
    aliases: []
  - name: suspectedContributingChange
    from: Incident
    to: Change
    meaning: A change investigated as a possible contributor; proximity in time is not proof of causation.
    aliases: []
  - name: resolvedBy
    from: Incident
    to: Change
    meaning: "A controlled change intended to fix the incident, distinct from a suspected contributing change."
    aliases: []
  - name: hasImplementationPlan
    from: Change
    to: ImplementationPlan
    meaning: null
    aliases: []
  - name: hasBackoutPlan
    from: Change
    to: BackoutPlan
    meaning: null
    aliases: []
  - name: preservesEvidence
    from: Change
    to: Evidence
    meaning: null
    aliases: []
  - name: appliesTo
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: usesRestorePoint
    from: ResponseRecord
    to: RestorePoint
    meaning: null
    aliases: []
  - name: usesRecoveryEnvironment
    from: ResponseRecord
    to: RecoveryEnvironment
    meaning: The response records the target environment for failover or restore.
    aliases: []
  - name: preservesEvidence
    from: ResponseRecord
    to: Evidence
    meaning: null
    aliases: []
  - name: supportedBy
    from: RemediationAction
    to: Evidence
    meaning: null
    aliases: []
  - name: proposesEmergencyChange
    from: Incident
    to: Change
    meaning: "An active incident provides the justification for a proposed emergency change before its execution, distinct from a change later confirmed as a remedy."
    aliases: []
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: The backup set protects this specifically managed configuration item as the restore target.
    aliases: []
  - name: documentedBy
    from: ProblemRecord
    to: KnownError
    meaning: null
    aliases: []
  - name: documentsWorkaround
    from: KnownError
    to: Workaround
    meaning: An optional documented temporary bypass; a known error need not have a workable bypass.
    aliases: []
  - name: produces
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: ownedBy
    from: CorrectiveAction
    to: OrganisationalUnit
    meaning: null
    aliases: []
  - name: implementedThrough
    from: CorrectiveAction
    to: Change
    meaning: A linked implementing change alone does not prove that the action is verified.
    aliases: []
  - name: supportedBy
    from: CorrectiveAction
    to: Evidence
    meaning: null
    aliases: []
rules:
  majorIncidentDeclarationEligible:
    conditions:
      - "The incident status is not resolved, closed or cancelled."
      - The incident severity is critical or high and at least one impacted IT service is identified.
      - An incident commander is assigned.
      - "The significance judgment follows the bank's approved major-incident criteria, without assuming a numerical threshold."
  recoveryMoveEligible:
    conditions:
      - The selected recovery plan applies to the affected IT service.
      - The target recovery environment is available and its data-recovery point is acceptable.
  incidentClosureEligible:
    conditions:
      - The incident status is resolved or monitoring.
      - "Impacted services are healthy, or a residual condition has been accepted under the bank's approved ownership and closure procedure."
      - "Resolution and restoration evidence and required stakeholder communications are in place, including applicable failover or restore verification."
      - "If major was declared, a post-incident review is scheduled or completed."
  stakeholderUpdateEligible:
    conditions:
      - "The communication records its relevant stakeholder audience, message, owner and approval state in accordance with the bank's governing communications procedure."
      - "The update reflects the latest verified incident state; supporting observations and evidence substantiate its statements about impact, without treating a suspected dependency as a confirmed outage."
  regulatoryNotificationSubmissionEligible:
    conditions:
      - The incident has a materiality assessment with result reportable.
      - The regulatory notification is linked to the incident and the regulator.
      - Required information and supporting evidence are complete.
      - The notification status is approved and submission is before its reporting due time.
      - "The designated reporting function owns the reporting determination and submission workflow, involving Legal or Compliance as appropriate."
  emergencyChangeExecutionEligible:
    conditions:
      - The active incident proposes the emergency change for execution.
      - "Affected configuration items are identified, and implementation and backout plans are in place for that change."
      - Risk is explicitly accepted before execution.
  backupRestoreEligible:
    conditions:
      - The backup set protects the specifically identified managed configuration item to be restored and the backup has succeeded or been verified.
      - The restore point is approved and the target recovery environment is available.
  failoverVerificationComplete:
    conditions:
      - "Service health and critical business transactions are verified in the recovery environment, with supporting observations and evidence retained."
  restoreVerificationComplete:
    conditions:
      - "After restoring the protected configuration item, data integrity and application functionality are validated with supporting observations and evidence retained."
  notificationFollowUpComplete:
    conditions:
      - "Submission receipt is retained and regulator acceptance is confirmed, or a rejection and its separately tracked remediation and evidence are recorded."
  correctiveActionVerificationComplete:
    conditions:
      - "The corrective action's own status is verified based on implementation checks and supporting evidence."
      - "A linked implementing change, if any, does not by itself prove verification."
actions:
  declareMajorIncident:
    input: Incident
    preconditions:
      - majorIncidentDeclarationEligible
    effect: ""
    verification: ""
  moveToRecoveryEnvironment:
    input: Incident
    preconditions:
      - recoveryMoveEligible
    effect: ""
    verification: ""
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - stakeholderUpdateEligible
    effect: ""
    verification: ""
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureEligible
    effect: ""
    verification: ""
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - regulatoryNotificationSubmissionEligible
    effect: ""
    verification: ""
  executeEmergencyChange:
    input: Incident
    preconditions:
      - emergencyChangeExecutionEligible
    effect: ""
    verification: ""
  restoreFromBackup:
    input: Incident
    preconditions:
      - backupRestoreEligible
    effect: ""
    verification: ""


# CONSISTENCY CHECK — no outstanding problems in the model.

# SECOND-OPINION MODEL CHECK — no additional observations.

### Turn 7 — assistant

The interview has covered the decisions you identified, and the domain model is complete for this scope. The final consistency check found no outstanding problems.

It distinguishes alerts from incidents, and major-incident declaration from incident status; traces impact through the confirmed service dependencies; separates suspected contributing changes from controlled fixes; and keeps recovery, communications, regulatory reporting, closure, known errors, and corrective actions as distinct decisions and records. A corrective action is verified on its own record—not merely because an implementing change exists.

The model deliberately leaves bank-specific authorities and thresholds to the approved procedures, including communications approval, residual-condition acceptance, and monitoring duration.
