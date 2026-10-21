# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-21T04:30:02.070Z

### Turn 1 — user

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### Turn 1 — assistant

Let’s start with a **major incident**, since it connects operations, recovery, communication, evidence, and reporting.

Could you walk me through a typical case from the first alert to closure? In particular:

1. What do you call the things you track—alerts, incidents, affected services, and so on?
2. What makes an incident “major,” and who makes that decision?
3. What decisions must your team make during the incident that this model should help answer?

### Turn 2 — user

Imagine monitoring raises an alert for a degraded IT service that supports a customer-facing business service. We first **triage the alert**: what rule generated it, what event it indicates, and which service or configuration item it concerns. An alert is a signal to investigate, not automatically an incident. If there is an unplanned interruption, degradation, or security condition needing managed response, the service desk records an **incident**. We then establish its status, severity, impact and urgency; identify the affected IT and business services, customer channels, and technical components; and assign a resolver group and, where needed, an on-call engineer.

A **major incident** is still an incident, but one needing exceptional coordination because of high business or regulatory impact. For declaration, the incident must remain active, have critical or high severity, have at least one impacted IT service identified, and have an incident commander assigned. The bank’s approved criteria govern the judgment about impact; I would not treat a high-severity alert alone as a declaration. The incident commander leads command and decision cadence, while the incident response team coordinates the response.

During the response we track more than a ticket. There are correlated **events and alerts**, affected **services and configuration items**, their dependencies—including third-party services—and the current service health. We record the **communications** sent to stakeholders and preserve **evidence items** supporting what happened and what was done. If diagnosis reveals an underlying cause, that belongs in a **problem**; a temporary bypass is a **workaround**, whereas a **runbook** is the maintained procedure the team follows.

The model needs to help us answer operational decisions as facts change:

- **What is actually affected, and who should act?** Trace from the IT service to business services and customer channels, identify the service owner, and route work to a resolver group that supports the affected service or component.
- **How can we contain and restore safely?** Assess containment scope and side effects. Check whether a recovery plan applies, whether the recovery environment and data-recovery point are acceptable, or whether a suitable backup protects the target. An urgent fix may instead require an emergency change with identified components, implementation and backout plans, and explicit risk acceptance.
- **What can we say, and to whom?** Send stakeholder updates against the latest *verified* incident state, with the audience, message, owner and approval state recorded.
- **Does reporting follow?** Document a materiality assessment rather than assuming every major incident is reportable. A regulatory notification follows the applicable assessment and approval workflow; Legal, Compliance, or the designated reporting function owns the formal reporting judgment.

Finally, “service looks better” is not by itself closure. We verify restoration and retain the evidence, complete required communications, and arrange the post-incident review for a major incident. Closure is appropriate only when the incident is resolved or being monitored, affected services are healthy or an accepted residual condition is documented, and those closure conditions are met. The review can then identify a problem and tracked corrective actions so we do not just repeat the same response next time.

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    meaning: A monitoring signal that requires triage and does not by itself establish an incident.\n  Event:\n    meaning: An observed occurrence indicated by an alert or correlated during incident response.\n  MonitoringRule:\n    meaning: A rule that generates an alert.\n  Incident:\n    meaning: An unplanned interruption, degradation, or security condition needing managed response.\n    properties:\n      status:\n        type: text\n      severity:\n        type: text\n      impact:\n        type: text\n      urgency:\n        type: text\n      majorIncidentDeclared:\n        type: boolean\n  ITService:\n    meaning: An IT service whose health and impact are assessed during operations and response.\n    properties:\n      serviceHealth:\n        type: text\n  BusinessService:\n    meaning: A business service supported by an IT service.\n  CustomerChannel:\n    meaning: A customer-facing channel that may be affected by an incident.\n  ConfigurationItem:\n    meaning: A technical component or configuration item involved in service delivery or response.\n    aliases: [technical component]\n  ResolverGroup:\n    meaning: A group assigned to resolve incidents for the services or components it supports.\n  OnCallEngineer:\n    meaning: An engineer assigned to respond when needed.\n  IncidentCommander:\n    meaning: The person assigned to lead command and decision cadence during a major incident.\n  IncidentResponseTeam:\n    meaning: The team coordinating incident response.\n  ServiceOwner:\n    meaning: The owner accountable for an IT service.\nrelationships:\n  - name: generatedBy\n    from: Alert\n    to: MonitoringRule\n  - name: indicates\n    from: Alert\n    to: Event\n  - name: concerns\n    from: Alert\n    to: ITService\n  - name: concerns\n    from: Alert\n    to: ConfigurationItem\n  - name: correlatedWith\n    from: Incident\n    to: Event\n  - name: correlatedWith\n    from: Incident\n    to: Alert\n  - name: affects\n    from: Incident\n    to: ITService\n  - name: affects\n    from: Incident\n    to: BusinessService\n  - name: affects\n    from: Incident\n    to: CustomerChannel\n  - name: affects\n    from: Incident\n    to: ConfigurationItem\n  - name: supports\n    from: ITService\n    to: BusinessService\n  - name: supportedBy\n    from: ITService\n    to: ResolverGroup\n  - name: supportedBy\n    from: ConfigurationItem\n    to: ResolverGroup\n  - name: ownedBy\n    from: ITService\n    to: ServiceOwner\n  - name: assignedTo\n    from: Incident\n    to: ResolverGroup\n  - name: assignedTo\n    from: Incident\n    to: OnCallEngineer\n  - name: commandedBy\n    from: Incident\n    to: IncidentCommander\n  - name: coordinatedBy\n    from: Incident\n    to: IncidentResponseTeam\nrules:\n  majorIncidentDeclarationEligible:\n    conditions:\n      - Incident remains active.\n      - Incident severity is critical or high.\n      - At least one impacted IT service is identified.\n      - An incident commander is assigned.\n      - The bank's approved criteria support the judgment of high business or regulatory impact.\nactions:\n  triageAlert:\n    input: Alert\n  recordIncident:\n    input: Alert\n  declareMajorIncident:\n    input: Incident\n    preconditions: [majorIncidentDeclarationEligible]"
}
```

I’d model a **major incident as an incident with a declaration**, not as a separate kind of alert. I’ll capture the alert-to-incident distinction, the affected-service links, and the declaration prerequisites first. I’ll leave the bank’s impact criteria as an explicit check rather than inventing a threshold.

### Turn 2 — tool

Applied. Added 35, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ThirdPartyService:\n    meaning: An external service on which an IT service or configuration item depends.\n  Problem:\n    meaning: A tracked underlying cause identified through diagnosis or review.\n  Workaround:\n    meaning: A temporary bypass used while the underlying cause remains unresolved.\n  Runbook:\n    meaning: A maintained response procedure followed by the team.\n  ContainmentAction:\n    meaning: A proposed or executed action to limit an incident's effects.\n    properties:\n      scope:\n        type: text\n      sideEffects:\n        type: text\n  RecoveryPlan:\n    meaning: A plan assessed for applicability before recovery.\n  RecoveryEnvironment:\n    meaning: An environment whose acceptability is checked before recovery.\n  DataRecoveryPoint:\n    meaning: A recovery point whose acceptability is checked before data restoration.\n  Backup:\n    meaning: A backup assessed for suitability to protect the recovery target.\n  EmergencyChange:\n    meaning: An urgent change with an implementation plan, backout plan, and explicit risk acceptance.\n    properties:\n      implementationPlan:\n        type: text\n      backoutPlan:\n        type: text\n      riskAccepted:\n        type: boolean\n  Communication:\n    meaning: A stakeholder update or other incident communication whose content and approval are tracked.\n    properties:\n      audience:\n        type: text\n      message:\n        type: text\n      approvalState:\n        type: text\n  Stakeholder:\n    meaning: An audience or party receiving incident communications.\n  CommunicationOwner:\n    meaning: The owner responsible for an incident communication.\n  VerifiedIncidentState:\n    meaning: A verified state of an incident used to substantiate communications and restoration decisions.\n  EvidenceItem:\n    meaning: Preserved evidence supporting what happened and what was done.\n  MaterialityAssessment:\n    meaning: A documented assessment of whether the incident meets applicable reporting criteria.\n    properties:\n      outcome:\n        type: text\n  RegulatoryNotification:\n    meaning: A formal notification following the applicable materiality assessment and approval workflow.\n    properties:\n      approvalState:\n        type: text\n  ReportingFunction:\n    meaning: Legal, Compliance, or the designated function owning formal reporting judgment.\n  PostIncidentReview:\n    meaning: A review following a major incident to identify causes and improvements.\n  CorrectiveAction:\n    meaning: An action tracked to prevent repetition or improve response.\n  ResidualCondition:\n    meaning: An accepted remaining condition documented before incident closure.\nrelationships:\n  - name: dependsOn\n    from: ITService\n    to: ConfigurationItem\n  - name: dependsOn\n    from: ITService\n    to: ThirdPartyService\n  - name: dependsOn\n    from: ConfigurationItem\n    to: ThirdPartyService\n  - name: supports\n    from: BusinessService\n    to: CustomerChannel\n  - name: diagnoses\n    from: Problem\n    to: Incident\n  - name: usesWorkaround\n    from: Incident\n    to: Workaround\n  - name: followsRunbook\n    from: Incident\n    to: Runbook\n  - name: appliesContainment\n    from: Incident\n    to: ContainmentAction\n  - name: appliesRecoveryPlan\n    from: Incident\n    to: RecoveryPlan\n  - name: usesRecoveryEnvironment\n    from: RecoveryPlan\n    to: RecoveryEnvironment\n  - name: usesDataRecoveryPoint\n    from: RecoveryPlan\n    to: DataRecoveryPoint\n  - name: protects\n    from: Backup\n    to: ConfigurationItem\n  - name: protects\n    from: Backup\n    to: ITService\n  - name: requiresEmergencyChange\n    from: Incident\n    to: EmergencyChange\n  - name: changes\n    from: EmergencyChange\n    to: ConfigurationItem\n  - name: documents\n    from: Communication\n    to: Incident\n  - name: addressedTo\n    from: Communication\n    to: Stakeholder\n  - name: ownedBy\n    from: Communication\n    to: CommunicationOwner\n  - name: basedOn\n    from: Communication\n    to: VerifiedIncidentState\n  - name: verifies\n    from: VerifiedIncidentState\n    to: Incident\n  - name: supportedByEvidence\n    from: Incident\n    to: EvidenceItem\n  - name: supportedByEvidence\n    from: VerifiedIncidentState\n    to: EvidenceItem\n  - name: assessedBy\n    from: Incident\n    to: MaterialityAssessment\n  - name: ownedBy\n    from: MaterialityAssessment\n    to: ReportingFunction\n  - name: resultsIn\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n  - name: reviewedIn\n    from: Incident\n    to: PostIncidentReview\n  - name: identifies\n    from: PostIncidentReview\n    to: Problem\n  - name: tracks\n    from: PostIncidentReview\n    to: CorrectiveAction\n  - name: hasResidualCondition\n    from: Incident\n    to: ResidualCondition\nrules:\n  incidentRecordingRequired:\n    conditions:\n      - Triage finds an unplanned interruption, degradation, or security condition needing managed response; an alert alone does not suffice.\n  stakeholderUpdateReady:\n    conditions:\n      - The message reflects the latest verified incident state.\n      - The audience, message, owner, and approval state are recorded.\n      - The applicable approval has been obtained before sending.\n  emergencyChangeReady:\n    conditions:\n      - The affected components are identified.\n      - Implementation and backout plans are present.\n      - Risk acceptance is explicit.\n  regulatoryNotificationReady:\n    conditions:\n      - A materiality assessment has documented the reporting judgment under the applicable criteria.\n      - The applicable regulatory notification approval workflow has been completed.\n  incidentClosureReady:\n    conditions:\n      - The incident is resolved or being monitored.\n      - Affected services are healthy or an accepted residual condition is documented.\n      - Restoration is verified and supporting evidence retained.\n      - Required communications are complete.\n      - If it is a major incident, the post-incident review is arranged.\nactions:\n  recordIncident:\n    input: Alert\n    preconditions: [incidentRecordingRequired]\n  sendStakeholderUpdate:\n    input: Communication\n    preconditions: [stakeholderUpdateReady]\n  implementEmergencyChange:\n    input: EmergencyChange\n    preconditions: [emergencyChangeReady]\n  issueRegulatoryNotification:\n    input: RegulatoryNotification\n    preconditions: [regulatoryNotificationReady]\n  closeIncident:\n    input: Incident\n    preconditions: [incidentClosureReady]"
}
```

That captures the start of the response. I also heard several distinct decisions that should stay separate: diagnosing a problem versus using a workaround, choosing a recovery plan versus an emergency change, and declaring a major incident versus deciding whether it is reportable. I’ll add those as separate concepts and checks.

### Turn 2 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 2 — assistant

I’ve captured the first part of the workflow: an alert is triaged before an incident is recorded, and a major-incident declaration requires an active incident, high or critical severity, an identified impacted IT service, an assigned commander, and judgment against the bank’s approved criteria.

Before I model recovery and reporting in detail, could you clarify two points?

- For recovery, who decides that a recovery point, backup, or residual condition is acceptable? Is that the same person who accepts the risk of an emergency change?
- For regulatory reporting, what are the stages between documenting the materiality assessment and sending a notification, and which function owns each decision?

### Turn 3 — user

Those are separate acceptance decisions, and I would not assign all of them to the incident commander by default.

For **recovery**, the team checks that the recovery plan applies to the service, the target environment is available, and the data-recovery point is acceptable before failover. For a backup restore, the backup must be successful or verified, protect the target, and have an approved restore point and target environment. Before closure, service health must be healthy or the remaining condition must have been accepted. The incident commander coordinates these decisions, but the governing recovery and approval procedures determine who may accept each point; I would involve the relevant service and business owners where their service or business impact is at stake. The model does **not** establish that this is the same person who explicitly accepts the risk of an emergency change. That change also needs an active linked incident, identified affected components, and implementation and backout plans.

For **reporting**, the sequence is:

1. Document the materiality assessment, including its result and rationale. The result can be **not reportable, potentially reportable, reportable, or undetermined**. A major-incident declaration does not itself settle that result.
2. If the assessment concludes **reportable**, prepare a notification linked to the incident and the receiving regulator, with the required information and supporting evidence. Its workflow can move through draft, pending approval, and approved.
3. Submit only once it is **approved**, the required fields and evidence are complete, and submission is before the recorded due time. Retain the submission receipt, then confirm acceptance—or record rejection and the necessary remediation. Withdrawal is also a possible notification state.

Operations supplies verified incident facts and evidence. Legal, Compliance, or the designated regulatory-reporting function owns the formal reporting judgment and approval under the bank’s governing procedure; I would not infer a more specific named approver or deadline from the incident record alone.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ThirdPartyService:\n    meaning: An external service on which an IT service or technical component depends.\n  Problem:\n    meaning: An underlying cause tracked after diagnosis or review.\n  Workaround:\n    meaning: A temporary bypass rather than the maintained response procedure.\n  Runbook:\n    meaning: A maintained procedure followed during response.\n  ContainmentAction:\n    meaning: An action considered or taken to limit an incident's effects.\n    properties:\n      scope:\n        type: text\n      sideEffects:\n        type: text\n  RecoveryPlan:\n    meaning: A plan whose applicability to the affected service is checked before failover.\n  RecoveryEnvironment:\n    meaning: A target environment checked for availability and acceptability before recovery.\n    properties:\n      available:\n        type: boolean\n  DataRecoveryPoint:\n    meaning: A data-recovery point assessed for acceptability before failover.\n  Backup:\n    meaning: A backup checked for success or verification and protection of the restore target.\n    properties:\n      successfulOrVerified:\n        type: boolean\n  RestorePoint:\n    meaning: A restore point requiring approval before restoring a backup.\n  RecoveryAcceptance:\n    meaning: A recorded acceptance under the governing recovery and approval procedures.\n    properties:\n      decision:\n        type: text\n      accepted:\n        type: boolean\n  AuthorizedApprover:\n    meaning: A person authorized by the applicable procedure to make the specific acceptance decision.\n  BusinessOwner:\n    meaning: The owner of a business service involved when business impact is at stake.\n  ResidualCondition:\n    meaning: A remaining service condition that must be accepted before incident closure.\n  EmergencyChange:\n    meaning: An urgent change linked to an active incident, with affected components, implementation and backout plans, and separate risk acceptance.\n    properties:\n      implementationPlan:\n        type: text\n      backoutPlan:\n        type: text\n  RiskAcceptance:\n    meaning: Explicit acceptance of the risk of an emergency change under its governing procedure.\n  Communication:\n    meaning: An incident stakeholder update with an audience, message, owner, and approval state.\n    properties:\n      audience:\n        type: text\n      message:\n        type: text\n      approvalState:\n        type: text\n  Stakeholder:\n    meaning: A recipient of incident communications.\n  CommunicationOwner:\n    meaning: The owner responsible for a communication.\n  VerifiedIncidentState:\n    meaning: The latest verified incident facts used for communications and response decisions.\n  EvidenceItem:\n    meaning: Preserved evidence supporting what happened, what was done, or what is being reported.\n  MaterialityAssessment:\n    meaning: A documented assessment of reportability, distinct from major-incident declaration.\n    properties:\n      result:\n        type: text\n        allowed: [not reportable, potentially reportable, reportable, undetermined]\n      rationale:\n        type: text\n  RegulatoryNotification:\n    meaning: A notification prepared for a regulator after a reportable assessment and submitted under the approval workflow.\n    properties:\n      status:\n        type: text\n        allowed: [draft, pending approval, approved, submitted, accepted, rejected, withdrawn]\n      requiredInformationComplete:\n        type: boolean\n      supportingEvidenceComplete:\n        type: boolean\n      submissionDueTime:\n        type: date\n  Regulator:\n    meaning: The regulator receiving a formal notification.\n  SubmissionReceipt:\n    meaning: The retained receipt evidencing submission of a regulatory notification.\n  NotificationRemediation:\n    meaning: The remediation required after a regulatory notification is rejected.\n  ReportingFunction:\n    meaning: Legal, Compliance, or the designated regulatory-reporting function owning formal reporting judgment and approval under governing procedure.\n  PostIncidentReview:\n    meaning: A review arranged for a major incident to identify problems and improvements.\n  CorrectiveAction:\n    meaning: A tracked action arising from review to prevent recurrence or improve response.\nrelationships:\n  - name: dependsOn\n    from: ITService\n    to: ConfigurationItem\n  - name: dependsOn\n    from: ITService\n    to: ThirdPartyService\n  - name: dependsOn\n    from: ConfigurationItem\n    to: ThirdPartyService\n  - name: supports\n    from: BusinessService\n    to: CustomerChannel\n  - name: ownedBy\n    from: BusinessService\n    to: BusinessOwner\n  - name: diagnoses\n    from: Problem\n    to: Incident\n  - name: usesWorkaround\n    from: Incident\n    to: Workaround\n  - name: followsRunbook\n    from: Incident\n    to: Runbook\n  - name: appliesContainment\n    from: Incident\n    to: ContainmentAction\n  - name: appliesRecoveryPlan\n    from: Incident\n    to: RecoveryPlan\n  - name: appliesTo\n    from: RecoveryPlan\n    to: ITService\n  - name: usesRecoveryEnvironment\n    from: RecoveryPlan\n    to: RecoveryEnvironment\n  - name: usesDataRecoveryPoint\n    from: RecoveryPlan\n    to: DataRecoveryPoint\n  - name: protects\n    from: Backup\n    to: ConfigurationItem\n  - name: protects\n    from: Backup\n    to: ITService\n  - name: usesRestorePoint\n    from: Backup\n    to: RestorePoint\n  - name: targets\n    from: Backup\n    to: RecoveryEnvironment\n  - name: accepts\n    from: RecoveryAcceptance\n    to: DataRecoveryPoint\n  - name: accepts\n    from: RecoveryAcceptance\n    to: RestorePoint\n  - name: accepts\n    from: RecoveryAcceptance\n    to: RecoveryEnvironment\n  - name: accepts\n    from: RecoveryAcceptance\n    to: ResidualCondition\n  - name: decidedBy\n    from: RecoveryAcceptance\n    to: AuthorizedApprover\n  - name: hasResidualCondition\n    from: Incident\n    to: ResidualCondition\n  - name: requiresEmergencyChange\n    from: Incident\n    to: EmergencyChange\n  - name: changes\n    from: EmergencyChange\n    to: ConfigurationItem\n  - name: hasRiskAcceptance\n    from: EmergencyChange\n    to: RiskAcceptance\n  - name: decidedBy\n    from: RiskAcceptance\n    to: AuthorizedApprover\n  - name: documents\n    from: Communication\n    to: Incident\n  - name: addressedTo\n    from: Communication\n    to: Stakeholder\n  - name: ownedBy\n    from: Communication\n    to: CommunicationOwner\n  - name: basedOn\n    from: Communication\n    to: VerifiedIncidentState\n  - name: verifies\n    from: VerifiedIncidentState\n    to: Incident\n  - name: supportedByEvidence\n    from: Incident\n    to: EvidenceItem\n  - name: supportedByEvidence\n    from: VerifiedIncidentState\n    to: EvidenceItem\n  - name: assessedBy\n    from: Incident\n    to: MaterialityAssessment\n  - name: ownedBy\n    from: MaterialityAssessment\n    to: ReportingFunction\n  - name: resultsIn\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n  - name: notifiesAbout\n    from: RegulatoryNotification\n    to: Incident\n  - name: addressedTo\n    from: RegulatoryNotification\n    to: Regulator\n  - name: approvedBy\n    from: RegulatoryNotification\n    to: ReportingFunction\n  - name: supportedByEvidence\n    from: RegulatoryNotification\n    to: EvidenceItem\n  - name: basedOn\n    from: RegulatoryNotification\n    to: VerifiedIncidentState\n  - name: hasSubmissionReceipt\n    from: RegulatoryNotification\n    to: SubmissionReceipt\n  - name: needsRemediation\n    from: RegulatoryNotification\n    to: NotificationRemediation\n  - name: reviewedIn\n    from: Incident\n    to: PostIncidentReview\n  - name: identifies\n    from: PostIncidentReview\n    to: Problem\n  - name: tracks\n    from: PostIncidentReview\n    to: CorrectiveAction\nrules:\n  incidentRecordingRequired:\n    conditions:\n      - Triage finds an unplanned interruption, degradation, or security condition needing managed response; an alert alone does not suffice.\n  failoverReady:\n    conditions:\n      - A recovery plan applies to the affected service.\n      - The target recovery environment is available.\n      - The data-recovery point is acceptable under the governing recovery and approval procedures.\n  backupRestoreReady:\n    conditions:\n      - The backup is successful or verified and protects the restore target.\n      - The restore point and target environment are approved under the governing recovery and approval procedures.\n  emergencyChangeReady:\n    conditions:\n      - An active incident is linked to the emergency change.\n      - Affected components are identified.\n      - Implementation and backout plans are present.\n      - The emergency-change risk has been explicitly accepted under the governing procedure, separately from recovery acceptance.\n  stakeholderUpdateReady:\n    conditions:\n      - The message is based on the latest verified incident state.\n      - The audience, message, owner and approval state are recorded, and applicable approval is obtained before sending.\n  notificationPreparationReady:\n    conditions:\n      - The linked materiality assessment has a documented result of reportable and a rationale.\n      - The notification is linked to the incident and receiving regulator.\n      - Required information and supporting evidence are prepared.\n  notificationSubmissionReady:\n    conditions:\n      - The linked materiality assessment concluded reportable.\n      - The notification is approved under the applicable reporting workflow.\n      - Required information and supporting evidence are complete.\n      - Submission occurs before the recorded due time.\n  incidentClosureReady:\n    conditions:\n      - The incident is resolved or being monitored.\n      - Affected services are healthy or a remaining condition has been accepted under the governing procedure.\n      - Restoration is verified and supporting evidence retained.\n      - Required communications are complete.\n      - If it is a major incident, the post-incident review is arranged.\nactions:\n  recordIncident:\n    input: Alert\n    preconditions: [incidentRecordingRequired]\n  executeFailover:\n    input: RecoveryPlan\n    preconditions: [failoverReady]\n  restoreBackup:\n    input: Backup\n    preconditions: [backupRestoreReady]\n  implementEmergencyChange:\n    input: EmergencyChange\n    preconditions: [emergencyChangeReady]\n  sendStakeholderUpdate:\n    input: Communication\n    preconditions: [stakeholderUpdateReady]\n  prepareRegulatoryNotification:\n    input: RegulatoryNotification\n    preconditions: [notificationPreparationReady]\n  submitRegulatoryNotification:\n    input: RegulatoryNotification\n    preconditions: [notificationSubmissionReady]\n  closeIncident:\n    input: Incident\n    preconditions: [incidentClosureReady]"
}
```

That makes the acceptance decisions distinct: recovery checks follow the governing procedure, emergency-change risk acceptance is separate, and Legal, Compliance, or the designated reporting function owns the formal reporting judgment. I’ll add the recovery gates and the assessment-to-notification workflow without assigning an approver or deadline the incident record cannot establish.

### Turn 3 — tool

Applied. Added 91, updated 1 existing item(s).

CONSISTENCY CHECK — 3 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "closeIncident" has input class Incident, and its precondition incidentClosureReady refers to Communication, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Incident to Communication. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "implementEmergencyChange" has input class EmergencyChange, and its precondition emergencyChangeReady refers to Incident, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from EmergencyChange to Incident. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "implementEmergencyChange" has input class EmergencyChange, and its precondition emergencyChangeReady refers to RecoveryAcceptance, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from EmergencyChange to RecoveryAcceptance. Rewording the text does not create the path it assumes.

### Turn 3 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "documents",
      "to": "hasCommunication",
      "className": "",
      "source": "Communication",
      "target": "Incident",
      "reverse": true
    },
    {
      "kind": "relationship",
      "from": "requiresEmergencyChange",
      "to": "linkedToIncident",
      "className": "",
      "source": "Incident",
      "target": "EmergencyChange",
      "reverse": true
    }
  ]
}
```

### Turn 3 — tool

Renamed 2 of 2:
- relationship "documents" (Communication → Incident) → "hasCommunication" (Incident → Communication)
- relationship "requiresEmergencyChange" (Incident → EmergencyChange) → "linkedToIncident" (EmergencyChange → Incident)

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
  Alert:
    meaning: A monitoring signal that requires triage and does not by itself establish an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence indicated by an alert or correlated during incident response.
    aliases: []
    properties: {}
  MonitoringRule:
    meaning: A rule that generates an alert.
    aliases: []
    properties: {}
  Incident:
    meaning: "An unplanned interruption, degradation, or security condition needing managed response."
    aliases: []
    properties:
      status:
        type: text
      severity:
        type: text
      impact:
        type: text
      urgency:
        type: text
      majorIncidentDeclared:
        type: boolean
  ITService:
    meaning: An IT service whose health and impact are assessed during operations and response.
    aliases: []
    properties:
      serviceHealth:
        type: text
  BusinessService:
    meaning: A business service supported by an IT service.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer-facing channel that may be affected by an incident.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A technical component or configuration item involved in service delivery or response.
    aliases:
      - technical component
    properties: {}
  ResolverGroup:
    meaning: A group assigned to resolve incidents for the services or components it supports.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: An engineer assigned to respond when needed.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: The person assigned to lead command and decision cadence during a major incident.
    aliases: []
    properties: {}
  IncidentResponseTeam:
    meaning: The team coordinating incident response.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The owner accountable for an IT service.
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: An external service on which an IT service or technical component depends.
    aliases: []
    properties: {}
  Problem:
    meaning: An underlying cause tracked after diagnosis or review.
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary bypass rather than the maintained response procedure.
    aliases: []
    properties: {}
  Runbook:
    meaning: A maintained procedure followed during response.
    aliases: []
    properties: {}
  ContainmentAction:
    meaning: "An action considered or taken to limit an incident's effects."
    aliases: []
    properties:
      scope:
        type: text
      sideEffects:
        type: text
  RecoveryPlan:
    meaning: A plan whose applicability to the affected service is checked before failover.
    aliases: []
    properties: {}
  RecoveryEnvironment:
    meaning: A target environment checked for availability and acceptability before recovery.
    aliases: []
    properties:
      available:
        type: boolean
  DataRecoveryPoint:
    meaning: A data-recovery point assessed for acceptability before failover.
    aliases: []
    properties: {}
  Backup:
    meaning: A backup checked for success or verification and protection of the restore target.
    aliases: []
    properties:
      successfulOrVerified:
        type: boolean
  RestorePoint:
    meaning: A restore point requiring approval before restoring a backup.
    aliases: []
    properties: {}
  RecoveryAcceptance:
    meaning: A recorded acceptance under the governing recovery and approval procedures.
    aliases: []
    properties:
      decision:
        type: text
      accepted:
        type: boolean
  AuthorizedApprover:
    meaning: A person authorized by the applicable procedure to make the specific acceptance decision.
    aliases: []
    properties: {}
  BusinessOwner:
    meaning: The owner of a business service involved when business impact is at stake.
    aliases: []
    properties: {}
  ResidualCondition:
    meaning: A remaining service condition that must be accepted before incident closure.
    aliases: []
    properties: {}
  EmergencyChange:
    meaning: "An urgent change linked to an active incident, with affected components, implementation and backout plans, and separate risk acceptance."
    aliases: []
    properties:
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  RiskAcceptance:
    meaning: Explicit acceptance of the risk of an emergency change under its governing procedure.
    aliases: []
    properties: {}
  Communication:
    meaning: "An incident stakeholder update with an audience, message, owner, and approval state."
    aliases: []
    properties:
      audience:
        type: text
      message:
        type: text
      approvalState:
        type: text
  Stakeholder:
    meaning: A recipient of incident communications.
    aliases: []
    properties: {}
  CommunicationOwner:
    meaning: The owner responsible for a communication.
    aliases: []
    properties: {}
  VerifiedIncidentState:
    meaning: The latest verified incident facts used for communications and response decisions.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "Preserved evidence supporting what happened, what was done, or what is being reported."
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: "A documented assessment of reportability, distinct from major-incident declaration."
    aliases: []
    properties:
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
  RegulatoryNotification:
    meaning: A notification prepared for a regulator after a reportable assessment and submitted under the approval workflow.
    aliases: []
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
      supportingEvidenceComplete:
        type: boolean
      submissionDueTime:
        type: date
  Regulator:
    meaning: The regulator receiving a formal notification.
    aliases: []
    properties: {}
  SubmissionReceipt:
    meaning: The retained receipt evidencing submission of a regulatory notification.
    aliases: []
    properties: {}
  NotificationRemediation:
    meaning: The remediation required after a regulatory notification is rejected.
    aliases: []
    properties: {}
  ReportingFunction:
    meaning: "Legal, Compliance, or the designated regulatory-reporting function owning formal reporting judgment and approval under governing procedure."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: A review arranged for a major incident to identify problems and improvements.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: A tracked action arising from review to prevent recurrence or improve response.
    aliases: []
    properties: {}
relationships:
  - name: generatedBy
    from: Alert
    to: MonitoringRule
    meaning: null
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: null
    aliases: []
  - name: concerns
    from: Alert
    to: ITService
    meaning: null
    aliases: []
  - name: concerns
    from: Alert
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: correlatedWith
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: correlatedWith
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: affects
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: affects
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: affects
    from: Incident
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: supports
    from: ITService
    to: BusinessService
    meaning: null
    aliases: []
  - name: supportedBy
    from: ITService
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportedBy
    from: ConfigurationItem
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: ownedBy
    from: ITService
    to: ServiceOwner
    meaning: null
    aliases: []
  - name: assignedTo
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
  - name: dependsOn
    from: ITService
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOn
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: dependsOn
    from: ConfigurationItem
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: supports
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: ownedBy
    from: BusinessService
    to: BusinessOwner
    meaning: null
    aliases: []
  - name: diagnoses
    from: Problem
    to: Incident
    meaning: null
    aliases: []
  - name: usesWorkaround
    from: Incident
    to: Workaround
    meaning: null
    aliases: []
  - name: followsRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: appliesContainment
    from: Incident
    to: ContainmentAction
    meaning: null
    aliases: []
  - name: appliesRecoveryPlan
    from: Incident
    to: RecoveryPlan
    meaning: null
    aliases: []
  - name: appliesTo
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: usesRecoveryEnvironment
    from: RecoveryPlan
    to: RecoveryEnvironment
    meaning: null
    aliases: []
  - name: usesDataRecoveryPoint
    from: RecoveryPlan
    to: DataRecoveryPoint
    meaning: null
    aliases: []
  - name: protects
    from: Backup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: protects
    from: Backup
    to: ITService
    meaning: null
    aliases: []
  - name: usesRestorePoint
    from: Backup
    to: RestorePoint
    meaning: null
    aliases: []
  - name: targets
    from: Backup
    to: RecoveryEnvironment
    meaning: null
    aliases: []
  - name: accepts
    from: RecoveryAcceptance
    to: DataRecoveryPoint
    meaning: null
    aliases: []
  - name: accepts
    from: RecoveryAcceptance
    to: RestorePoint
    meaning: null
    aliases: []
  - name: accepts
    from: RecoveryAcceptance
    to: RecoveryEnvironment
    meaning: null
    aliases: []
  - name: accepts
    from: RecoveryAcceptance
    to: ResidualCondition
    meaning: null
    aliases: []
  - name: decidedBy
    from: RecoveryAcceptance
    to: AuthorizedApprover
    meaning: null
    aliases: []
  - name: hasResidualCondition
    from: Incident
    to: ResidualCondition
    meaning: null
    aliases: []
  - name: linkedToIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases:
      - requiresEmergencyChange
  - name: changes
    from: EmergencyChange
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasRiskAcceptance
    from: EmergencyChange
    to: RiskAcceptance
    meaning: null
    aliases: []
  - name: decidedBy
    from: RiskAcceptance
    to: AuthorizedApprover
    meaning: null
    aliases: []
  - name: hasCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases:
      - documents
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: null
    aliases: []
  - name: ownedBy
    from: Communication
    to: CommunicationOwner
    meaning: null
    aliases: []
  - name: basedOn
    from: Communication
    to: VerifiedIncidentState
    meaning: null
    aliases: []
  - name: verifies
    from: VerifiedIncidentState
    to: Incident
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: VerifiedIncidentState
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: assessedBy
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: ownedBy
    from: MaterialityAssessment
    to: ReportingFunction
    meaning: null
    aliases: []
  - name: resultsIn
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: notifiesAbout
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: addressedTo
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: approvedBy
    from: RegulatoryNotification
    to: ReportingFunction
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: basedOn
    from: RegulatoryNotification
    to: VerifiedIncidentState
    meaning: null
    aliases: []
  - name: hasSubmissionReceipt
    from: RegulatoryNotification
    to: SubmissionReceipt
    meaning: null
    aliases: []
  - name: needsRemediation
    from: RegulatoryNotification
    to: NotificationRemediation
    meaning: null
    aliases: []
  - name: reviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: null
    aliases: []
  - name: identifies
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: tracks
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
rules:
  majorIncidentDeclarationEligible:
    conditions:
      - Incident remains active.
      - Incident severity is critical or high.
      - At least one impacted IT service is identified.
      - An incident commander is assigned.
      - "The bank's approved criteria support the judgment of high business or regulatory impact."
  incidentRecordingRequired:
    conditions:
      - "Triage finds an unplanned interruption, degradation, or security condition needing managed response; an alert alone does not suffice."
  failoverReady:
    conditions:
      - A recovery plan applies to the affected service.
      - The target recovery environment is available.
      - The data-recovery point is acceptable under the governing recovery and approval procedures.
  backupRestoreReady:
    conditions:
      - The backup is successful or verified and protects the restore target.
      - The restore point and target environment are approved under the governing recovery and approval procedures.
  emergencyChangeReady:
    conditions:
      - An active incident is linked to the emergency change.
      - Affected components are identified.
      - Implementation and backout plans are present.
      - "The emergency-change risk has been explicitly accepted under the governing procedure, separately from recovery acceptance."
  stakeholderUpdateReady:
    conditions:
      - The message is based on the latest verified incident state.
      - "The audience, message, owner and approval state are recorded, and applicable approval is obtained before sending."
  notificationPreparationReady:
    conditions:
      - The linked materiality assessment has a documented result of reportable and a rationale.
      - The notification is linked to the incident and receiving regulator.
      - Required information and supporting evidence are prepared.
  notificationSubmissionReady:
    conditions:
      - The linked materiality assessment concluded reportable.
      - The notification is approved under the applicable reporting workflow.
      - Required information and supporting evidence are complete.
      - Submission occurs before the recorded due time.
  incidentClosureReady:
    conditions:
      - The incident is resolved or being monitored.
      - Affected services are healthy or a remaining condition has been accepted under the governing procedure.
      - Restoration is verified and supporting evidence retained.
      - Required communications are complete.
      - "If it is a major incident, the post-incident review is arranged."
actions:
  triageAlert:
    input: Alert
    preconditions: []
    effect: ""
    verification: ""
  recordIncident:
    input: Alert
    preconditions:
      - incidentRecordingRequired
    effect: ""
    verification: ""
  declareMajorIncident:
    input: Incident
    preconditions:
      - majorIncidentDeclarationEligible
    effect: ""
    verification: ""
  executeFailover:
    input: RecoveryPlan
    preconditions:
      - failoverReady
    effect: ""
    verification: ""
  restoreBackup:
    input: Backup
    preconditions:
      - backupRestoreReady
    effect: ""
    verification: ""
  implementEmergencyChange:
    input: EmergencyChange
    preconditions:
      - emergencyChangeReady
    effect: ""
    verification: ""
  sendStakeholderUpdate:
    input: Communication
    preconditions:
      - stakeholderUpdateReady
    effect: ""
    verification: ""
  prepareRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - notificationPreparationReady
    effect: ""
    verification: ""
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - notificationSubmissionReady
    effect: ""
    verification: ""
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureReady
    effect: ""
    verification: ""


# CONSISTENCY CHECK — 1 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "implementEmergencyChange" has input class EmergencyChange, and its precondition emergencyChangeReady refers to RecoveryAcceptance, which is only reachable against the direction of the relationships between them.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  emergencyChangeReady:\n    conditions:\n      - An active incident is linked to the emergency change.\n      - Affected components are identified.\n      - Implementation and backout plans are present.\n      - The emergency-change risk has been explicitly accepted under the governing change procedure."
}
```

### Turn 3 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

I’ve added separate checks for failover, backup restore, emergency change, and notification submission. The model does not assume that a major incident is reportable or that the same person approves recovery and change risk.

Two final checks before I finish:

1. How do you verify restoration for closure—service-health checks, business-owner confirmation, monitoring over a period, or a combination determined by procedure?
2. When a notification is rejected, is remediation a correction to the same notification, a new submission, or does that depend on the regulator’s response?

### Turn 4 — user

1. **Closure needs verified restoration, not just a reassuring status update.** Check the affected services’ health and retain resolution and restoration evidence. Depending on the recovery method, that includes critical business transactions after failover, data integrity and application functionality after a backup restore, or technical checks and service health after an emergency change. The incident must be resolved or in monitoring, and each impacted service must be healthy or have an accepted residual condition. Required communications must be complete, and a major incident must have a post-incident review scheduled or completed. The model does not prescribe a fixed monitoring period or make business-owner confirmation universally mandatory; the bank’s governing procedure determines any additional sign-off.

2. **Record the rejection and the remediation needed.** The model does not specify whether that means correcting the same notification or making a new submission. Follow the regulator’s response and the bank’s reporting procedure, with the designated reporting function coordinating that decision.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  RestorationVerification:\n    meaning: Checks confirming restoration of an affected service by the recovery method used, supported by retained evidence.\n    properties:\n      recoveryMethod:\n        type: text\n        allowed: [failover, backup restore, emergency change, other]\n      criticalBusinessTransactionsVerified:\n        type: boolean\n      dataIntegrityVerified:\n        type: boolean\n      applicationFunctionalityVerified:\n        type: boolean\n      technicalChecksPassed:\n        type: boolean\n  PostIncidentReview:\n    meaning: A review scheduled or completed for a major incident to identify problems and improvements.\n    properties:\n      status:\n        type: text\n        allowed: [scheduled, completed]\n  NotificationRemediation:\n    meaning: The remediation recorded after a notification rejection, coordinated by the reporting function according to the regulator's response and the bank's reporting procedure.\n    properties:\n      remediationNeeded:\n        type: text\nrelationships:\n  - name: hasRestorationVerification\n    from: Incident\n    to: RestorationVerification\n  - name: verifiesService\n    from: RestorationVerification\n    to: ITService\n  - name: supportedByEvidence\n    from: RestorationVerification\n    to: EvidenceItem\n  - name: appliesTo\n    from: ResidualCondition\n    to: ITService\n  - name: coordinatedBy\n    from: NotificationRemediation\n    to: ReportingFunction\nrules:\n  incidentClosureReady:\n    conditions:\n      - The incident is resolved or in monitoring.\n      - Each impacted IT service is healthy or has an accepted residual condition documented for that service.\n      - Restoration of affected services is verified and resolution and restoration evidence is retained.\n      - After failover, critical business transactions are verified.\n      - After a backup restore, data integrity and application functionality are verified.\n      - After an emergency change, technical checks and service health are verified.\n      - Required communications are complete.\n      - For a major incident, the post-incident review is scheduled or completed.\n      - Any additional sign-off follows the bank's governing procedure; no fixed monitoring period or universal business-owner confirmation is assumed."
}
```

Understood. I’ll make restoration verification method-specific: failover, backup restore, and emergency change each require different checks. I’ll also keep the regulator’s rejection response procedural, rather than assuming whether remediation uses the same notification or a new one.

### Turn 4 — tool

Applied. Added 6, updated 3 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "closeIncident" has input class Incident, and its precondition incidentClosureReady refers to Backup, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Incident to Backup. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "closeIncident" has input class Incident, and its precondition incidentClosureReady refers to EmergencyChange, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Incident to EmergencyChange. Rewording the text does not create the path it assumes.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: verifiesRestoreFrom\n    from: RestorationVerification\n    to: Backup\n    meaning: Connects restoration checks to the backup used for a restore.\n  - name: verifiesChange\n    from: RestorationVerification\n    to: EmergencyChange\n    meaning: Connects technical and service-health checks to the emergency change being verified."
}
```

### Turn 4 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 4 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 4 — tool

competency_questions: []
classes:
  Alert:
    meaning: A monitoring signal that requires triage and does not by itself establish an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence indicated by an alert or correlated during incident response.
    aliases: []
    properties: {}
  MonitoringRule:
    meaning: A rule that generates an alert.
    aliases: []
    properties: {}
  Incident:
    meaning: "An unplanned interruption, degradation, or security condition needing managed response."
    aliases: []
    properties:
      status:
        type: text
      severity:
        type: text
      impact:
        type: text
      urgency:
        type: text
      majorIncidentDeclared:
        type: boolean
  ITService:
    meaning: An IT service whose health and impact are assessed during operations and response.
    aliases: []
    properties:
      serviceHealth:
        type: text
  BusinessService:
    meaning: A business service supported by an IT service.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A customer-facing channel that may be affected by an incident.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A technical component or configuration item involved in service delivery or response.
    aliases:
      - technical component
    properties: {}
  ResolverGroup:
    meaning: A group assigned to resolve incidents for the services or components it supports.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: An engineer assigned to respond when needed.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: The person assigned to lead command and decision cadence during a major incident.
    aliases: []
    properties: {}
  IncidentResponseTeam:
    meaning: The team coordinating incident response.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The owner accountable for an IT service.
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: An external service on which an IT service or technical component depends.
    aliases: []
    properties: {}
  Problem:
    meaning: An underlying cause tracked after diagnosis or review.
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary bypass rather than the maintained response procedure.
    aliases: []
    properties: {}
  Runbook:
    meaning: A maintained procedure followed during response.
    aliases: []
    properties: {}
  ContainmentAction:
    meaning: "An action considered or taken to limit an incident's effects."
    aliases: []
    properties:
      scope:
        type: text
      sideEffects:
        type: text
  RecoveryPlan:
    meaning: A plan whose applicability to the affected service is checked before failover.
    aliases: []
    properties: {}
  RecoveryEnvironment:
    meaning: A target environment checked for availability and acceptability before recovery.
    aliases: []
    properties:
      available:
        type: boolean
  DataRecoveryPoint:
    meaning: A data-recovery point assessed for acceptability before failover.
    aliases: []
    properties: {}
  Backup:
    meaning: A backup checked for success or verification and protection of the restore target.
    aliases: []
    properties:
      successfulOrVerified:
        type: boolean
  RestorePoint:
    meaning: A restore point requiring approval before restoring a backup.
    aliases: []
    properties: {}
  RecoveryAcceptance:
    meaning: A recorded acceptance under the governing recovery and approval procedures.
    aliases: []
    properties:
      decision:
        type: text
      accepted:
        type: boolean
  AuthorizedApprover:
    meaning: A person authorized by the applicable procedure to make the specific acceptance decision.
    aliases: []
    properties: {}
  BusinessOwner:
    meaning: The owner of a business service involved when business impact is at stake.
    aliases: []
    properties: {}
  ResidualCondition:
    meaning: A remaining service condition that must be accepted before incident closure.
    aliases: []
    properties: {}
  EmergencyChange:
    meaning: "An urgent change linked to an active incident, with affected components, implementation and backout plans, and separate risk acceptance."
    aliases: []
    properties:
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  RiskAcceptance:
    meaning: Explicit acceptance of the risk of an emergency change under its governing procedure.
    aliases: []
    properties: {}
  Communication:
    meaning: "An incident stakeholder update with an audience, message, owner, and approval state."
    aliases: []
    properties:
      audience:
        type: text
      message:
        type: text
      approvalState:
        type: text
  Stakeholder:
    meaning: A recipient of incident communications.
    aliases: []
    properties: {}
  CommunicationOwner:
    meaning: The owner responsible for a communication.
    aliases: []
    properties: {}
  VerifiedIncidentState:
    meaning: The latest verified incident facts used for communications and response decisions.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "Preserved evidence supporting what happened, what was done, or what is being reported."
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: "A documented assessment of reportability, distinct from major-incident declaration."
    aliases: []
    properties:
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
  RegulatoryNotification:
    meaning: A notification prepared for a regulator after a reportable assessment and submitted under the approval workflow.
    aliases: []
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
      supportingEvidenceComplete:
        type: boolean
      submissionDueTime:
        type: date
  Regulator:
    meaning: The regulator receiving a formal notification.
    aliases: []
    properties: {}
  SubmissionReceipt:
    meaning: The retained receipt evidencing submission of a regulatory notification.
    aliases: []
    properties: {}
  NotificationRemediation:
    meaning: "The remediation recorded after a notification rejection, coordinated by the reporting function according to the regulator's response and the bank's reporting procedure."
    aliases: []
    properties:
      remediationNeeded:
        type: text
  ReportingFunction:
    meaning: "Legal, Compliance, or the designated regulatory-reporting function owning formal reporting judgment and approval under governing procedure."
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: A review scheduled or completed for a major incident to identify problems and improvements.
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - completed
  CorrectiveAction:
    meaning: A tracked action arising from review to prevent recurrence or improve response.
    aliases: []
    properties: {}
  RestorationVerification:
    meaning: "Checks confirming restoration of an affected service by the recovery method used, supported by retained evidence."
    aliases: []
    properties:
      recoveryMethod:
        type: text
        allowed:
          - failover
          - backup restore
          - emergency change
          - other
      criticalBusinessTransactionsVerified:
        type: boolean
      dataIntegrityVerified:
        type: boolean
      applicationFunctionalityVerified:
        type: boolean
      technicalChecksPassed:
        type: boolean
relationships:
  - name: generatedBy
    from: Alert
    to: MonitoringRule
    meaning: null
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: null
    aliases: []
  - name: concerns
    from: Alert
    to: ITService
    meaning: null
    aliases: []
  - name: concerns
    from: Alert
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: correlatedWith
    from: Incident
    to: Event
    meaning: null
    aliases: []
  - name: correlatedWith
    from: Incident
    to: Alert
    meaning: null
    aliases: []
  - name: affects
    from: Incident
    to: ITService
    meaning: null
    aliases: []
  - name: affects
    from: Incident
    to: BusinessService
    meaning: null
    aliases: []
  - name: affects
    from: Incident
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: supports
    from: ITService
    to: BusinessService
    meaning: null
    aliases: []
  - name: supportedBy
    from: ITService
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: supportedBy
    from: ConfigurationItem
    to: ResolverGroup
    meaning: null
    aliases: []
  - name: ownedBy
    from: ITService
    to: ServiceOwner
    meaning: null
    aliases: []
  - name: assignedTo
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
  - name: dependsOn
    from: ITService
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: dependsOn
    from: ITService
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: dependsOn
    from: ConfigurationItem
    to: ThirdPartyService
    meaning: null
    aliases: []
  - name: supports
    from: BusinessService
    to: CustomerChannel
    meaning: null
    aliases: []
  - name: ownedBy
    from: BusinessService
    to: BusinessOwner
    meaning: null
    aliases: []
  - name: diagnoses
    from: Problem
    to: Incident
    meaning: null
    aliases: []
  - name: usesWorkaround
    from: Incident
    to: Workaround
    meaning: null
    aliases: []
  - name: followsRunbook
    from: Incident
    to: Runbook
    meaning: null
    aliases: []
  - name: appliesContainment
    from: Incident
    to: ContainmentAction
    meaning: null
    aliases: []
  - name: appliesRecoveryPlan
    from: Incident
    to: RecoveryPlan
    meaning: null
    aliases: []
  - name: appliesTo
    from: RecoveryPlan
    to: ITService
    meaning: null
    aliases: []
  - name: usesRecoveryEnvironment
    from: RecoveryPlan
    to: RecoveryEnvironment
    meaning: null
    aliases: []
  - name: usesDataRecoveryPoint
    from: RecoveryPlan
    to: DataRecoveryPoint
    meaning: null
    aliases: []
  - name: protects
    from: Backup
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: protects
    from: Backup
    to: ITService
    meaning: null
    aliases: []
  - name: usesRestorePoint
    from: Backup
    to: RestorePoint
    meaning: null
    aliases: []
  - name: targets
    from: Backup
    to: RecoveryEnvironment
    meaning: null
    aliases: []
  - name: accepts
    from: RecoveryAcceptance
    to: DataRecoveryPoint
    meaning: null
    aliases: []
  - name: accepts
    from: RecoveryAcceptance
    to: RestorePoint
    meaning: null
    aliases: []
  - name: accepts
    from: RecoveryAcceptance
    to: RecoveryEnvironment
    meaning: null
    aliases: []
  - name: accepts
    from: RecoveryAcceptance
    to: ResidualCondition
    meaning: null
    aliases: []
  - name: decidedBy
    from: RecoveryAcceptance
    to: AuthorizedApprover
    meaning: null
    aliases: []
  - name: hasResidualCondition
    from: Incident
    to: ResidualCondition
    meaning: null
    aliases: []
  - name: linkedToIncident
    from: EmergencyChange
    to: Incident
    meaning: null
    aliases:
      - requiresEmergencyChange
  - name: changes
    from: EmergencyChange
    to: ConfigurationItem
    meaning: null
    aliases: []
  - name: hasRiskAcceptance
    from: EmergencyChange
    to: RiskAcceptance
    meaning: null
    aliases: []
  - name: decidedBy
    from: RiskAcceptance
    to: AuthorizedApprover
    meaning: null
    aliases: []
  - name: hasCommunication
    from: Incident
    to: Communication
    meaning: null
    aliases:
      - documents
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: null
    aliases: []
  - name: ownedBy
    from: Communication
    to: CommunicationOwner
    meaning: null
    aliases: []
  - name: basedOn
    from: Communication
    to: VerifiedIncidentState
    meaning: null
    aliases: []
  - name: verifies
    from: VerifiedIncidentState
    to: Incident
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: VerifiedIncidentState
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: assessedBy
    from: Incident
    to: MaterialityAssessment
    meaning: null
    aliases: []
  - name: ownedBy
    from: MaterialityAssessment
    to: ReportingFunction
    meaning: null
    aliases: []
  - name: resultsIn
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: null
    aliases: []
  - name: notifiesAbout
    from: RegulatoryNotification
    to: Incident
    meaning: null
    aliases: []
  - name: addressedTo
    from: RegulatoryNotification
    to: Regulator
    meaning: null
    aliases: []
  - name: approvedBy
    from: RegulatoryNotification
    to: ReportingFunction
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: basedOn
    from: RegulatoryNotification
    to: VerifiedIncidentState
    meaning: null
    aliases: []
  - name: hasSubmissionReceipt
    from: RegulatoryNotification
    to: SubmissionReceipt
    meaning: null
    aliases: []
  - name: needsRemediation
    from: RegulatoryNotification
    to: NotificationRemediation
    meaning: null
    aliases: []
  - name: reviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: null
    aliases: []
  - name: identifies
    from: PostIncidentReview
    to: Problem
    meaning: null
    aliases: []
  - name: tracks
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: null
    aliases: []
  - name: hasRestorationVerification
    from: Incident
    to: RestorationVerification
    meaning: null
    aliases: []
  - name: verifiesService
    from: RestorationVerification
    to: ITService
    meaning: null
    aliases: []
  - name: supportedByEvidence
    from: RestorationVerification
    to: EvidenceItem
    meaning: null
    aliases: []
  - name: appliesTo
    from: ResidualCondition
    to: ITService
    meaning: null
    aliases: []
  - name: coordinatedBy
    from: NotificationRemediation
    to: ReportingFunction
    meaning: null
    aliases: []
  - name: verifiesRestoreFrom
    from: RestorationVerification
    to: Backup
    meaning: Connects restoration checks to the backup used for a restore.
    aliases: []
  - name: verifiesChange
    from: RestorationVerification
    to: EmergencyChange
    meaning: Connects technical and service-health checks to the emergency change being verified.
    aliases: []
rules:
  majorIncidentDeclarationEligible:
    conditions:
      - Incident remains active.
      - Incident severity is critical or high.
      - At least one impacted IT service is identified.
      - An incident commander is assigned.
      - "The bank's approved criteria support the judgment of high business or regulatory impact."
  incidentRecordingRequired:
    conditions:
      - "Triage finds an unplanned interruption, degradation, or security condition needing managed response; an alert alone does not suffice."
  failoverReady:
    conditions:
      - A recovery plan applies to the affected service.
      - The target recovery environment is available.
      - The data-recovery point is acceptable under the governing recovery and approval procedures.
  backupRestoreReady:
    conditions:
      - The backup is successful or verified and protects the restore target.
      - The restore point and target environment are approved under the governing recovery and approval procedures.
  emergencyChangeReady:
    conditions:
      - An active incident is linked to the emergency change.
      - Affected components are identified.
      - Implementation and backout plans are present.
      - The emergency-change risk has been explicitly accepted under the governing change procedure.
  stakeholderUpdateReady:
    conditions:
      - The message is based on the latest verified incident state.
      - "The audience, message, owner and approval state are recorded, and applicable approval is obtained before sending."
  notificationPreparationReady:
    conditions:
      - The linked materiality assessment has a documented result of reportable and a rationale.
      - The notification is linked to the incident and receiving regulator.
      - Required information and supporting evidence are prepared.
  notificationSubmissionReady:
    conditions:
      - The linked materiality assessment concluded reportable.
      - The notification is approved under the applicable reporting workflow.
      - Required information and supporting evidence are complete.
      - Submission occurs before the recorded due time.
  incidentClosureReady:
    conditions:
      - The incident is resolved or in monitoring.
      - Each impacted IT service is healthy or has an accepted residual condition documented for that service.
      - Restoration of affected services is verified and resolution and restoration evidence is retained.
      - "After failover, critical business transactions are verified."
      - "After a backup restore, data integrity and application functionality are verified."
      - "After an emergency change, technical checks and service health are verified."
      - Required communications are complete.
      - "For a major incident, the post-incident review is scheduled or completed."
      - "Any additional sign-off follows the bank's governing procedure; no fixed monitoring period or universal business-owner confirmation is assumed."
actions:
  triageAlert:
    input: Alert
    preconditions: []
    effect: ""
    verification: ""
  recordIncident:
    input: Alert
    preconditions:
      - incidentRecordingRequired
    effect: ""
    verification: ""
  declareMajorIncident:
    input: Incident
    preconditions:
      - majorIncidentDeclarationEligible
    effect: ""
    verification: ""
  executeFailover:
    input: RecoveryPlan
    preconditions:
      - failoverReady
    effect: ""
    verification: ""
  restoreBackup:
    input: Backup
    preconditions:
      - backupRestoreReady
    effect: ""
    verification: ""
  implementEmergencyChange:
    input: EmergencyChange
    preconditions:
      - emergencyChangeReady
    effect: ""
    verification: ""
  sendStakeholderUpdate:
    input: Communication
    preconditions:
      - stakeholderUpdateReady
    effect: ""
    verification: ""
  prepareRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - notificationPreparationReady
    effect: ""
    verification: ""
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - notificationSubmissionReady
    effect: ""
    verification: ""
  closeIncident:
    input: Incident
    preconditions:
      - incidentClosureReady
    effect: ""
    verification: ""


# CONSISTENCY CHECK — no outstanding problems in the model.

# SECOND-OPINION MODEL CHECK — 1 observation(s) from a separate automated review (report these to the expert, marked as model-derived, the same as the deterministic findings above; not authoritative on their own, but not to be dismissed without checking):
#   [model-review] The action requires notificationSubmissionReady before submission, but that rule requires submission to have already occurred before the due time.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  notificationSubmissionReady:\n    conditions:\n      - The linked materiality assessment concluded reportable.\n      - The notification is approved under the applicable reporting workflow.\n      - Required information and supporting evidence are complete.\n      - The current time is before the recorded submission due time."
}
```

A model-derived review caught one circular rule: it currently says submission must have occurred before a notification can be submitted. That is a modeling error, not a bank requirement. I’ll correct it to check that the planned submission is still before the recorded due time.

### Turn 4 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 4 — assistant

The interview has covered the decisions you described, and the model now connects alert triage, incident response, recovery, communications, reporting, and evidence-based closure. It keeps major-incident declaration separate from reportability, and recovery acceptance separate from emergency-change risk acceptance.

**One model-derived issue remains:** the notification-submission rule is circular—it says submission must already have occurred before submission is allowed. I identified the correction (“the current time is before the recorded due time”), but it has **not yet been applied to the live model**. I would not treat that rule as ready for use until it is corrected.
