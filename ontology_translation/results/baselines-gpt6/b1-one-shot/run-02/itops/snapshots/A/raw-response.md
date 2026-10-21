classes:
  Incident:
    meaning: "An incident records a disruption or security condition and the bank's response to it."
    aliases: [incidens, hibajegy]
    properties:
      status:
        type: text
        allowed: [new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled]
      severity:
        type: text
        allowed: [sev1-critical, sev2-high, sev3-medium, sev4-low]
      category:
        type: text
        allowed: [availability, performance, capacity, network, application, database, infrastructure, data-integrity, cybersecurity, third-party, change-induced, other]
      detectedTime: {type: date}
      majorIncidentFlag: {type: boolean}
      declarationTime: {type: date}
      resolvedTime: {type: date}
      closedTime: {type: date}
  BusinessService:
    meaning: "A business service is a capability the bank delivers."
    aliases: [üzleti szolgáltatás]
    properties:
      healthState:
        type: text
        allowed: [healthy, degraded, partially-unavailable, unavailable, recovering, unknown]
  ITService:
    meaning: "An IT service supports a business service and has its own assessed health."
    aliases: [informatikai szolgáltatás, informatics service]
    properties:
      healthState:
        type: text
        allowed: [healthy, degraded, partially-unavailable, unavailable, recovering, unknown]
  CustomerChannel:
    meaning: "A customer channel is how customers access a business service."
    aliases: [ügyfélcsatorna]
  Application:
    meaning: "An application is a software system implementing an IT service."
    aliases: [alkalmazás, app]
  InfrastructureComponent:
    meaning: "An infrastructure component supports an IT service or application without necessarily being recorded as a configuration item."
    aliases: [infrastruktúra-elem]
  ConfigurationItem:
    meaning: "A configuration item is a managed component recorded within configuration-management scope."
    aliases: [CI, konfigurációs elem]
    properties:
      criticalityTier:
        type: text
        allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]
  ThirdPartyService:
    meaning: "A third-party service is an external service on which an IT service can depend."
    aliases: [külső szolgáltatás, outsourced service]
  Environment:
    meaning: "An environment is a deployment context that may be proposed as a recovery target."
    aliases: [környezet]
    properties:
      environmentType:
        type: text
        allowed: [production, disaster-recovery, pre-production, test, development, management]
  Alert:
    meaning: "An alert is a signal that can open an incident when a triggering link is established."
    aliases: [riasztás]
    properties:
      status:
        type: text
        allowed: [new, acknowledged, suppressed, escalated, closed]
      acknowledgementTime: {type: date}
      detectionSource:
        type: text
        allowed: [monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other]
  Event:
    meaning: "An event is an observed occurrence that can be correlated with an incident."
    aliases: [esemény]
    properties:
      observedTime: {type: date}
      detectionSource:
        type: text
        allowed: [monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other]
  MonitoringTool:
    meaning: "A monitoring tool monitors IT services and configuration items and executes monitoring rules."
    aliases: [monitoring platform, felügyeleti eszköz]
  MonitoringRule:
    meaning: "A monitoring rule evaluates telemetry and can generate an alert."
    aliases: [alert rule, riasztási szabály]
  ServiceOwner:
    meaning: "A service owner is accountable for an IT service across its lifecycle."
    aliases: [szolgáltatásgazda]
  ResolverGroup:
    meaning: "A resolver group diagnoses and restores an incident assigned to it."
    aliases: [support group, megoldócsoport]
  OnCallEngineer:
    meaning: "An on-call engineer is a resolver-group member who may handle time-critical incident work."
    aliases: [on-call, ügyeletes mérnök]
  IncidentCommander:
    meaning: "An incident commander commands a declared major-incident response and sets its coordination and decision cadence."
    aliases: [incident manager, MIM lead, incidensparancsnok]
  IncidentResponseTeam:
    meaning: "An incident response team coordinates a declared major incident."
    aliases: [IRT, incidenskezelő csapat]
  ServiceDesk:
    meaning: "The service desk records and routes incidents arising from user-reported issues."
    aliases: [help desk, ügyfélszolgálati IT pult, hibabejelentő]
  ITOperationsTeam:
    meaning: "The IT operations team operates IT services without thereby being authorised for every response action."
    aliases: [IT üzemeltetés, üzemeltetési csapat]
  NetworkOperationsCentre:
    meaning: "The network operations centre operates monitoring tools."
    aliases: [NOC, hálózatüzemeltetési központ]
  SecurityOperationsCentre:
    meaning: "The security operations centre monitors security events."
    aliases: [SOC, biztonsági műveleti központ]
  Runbook:
    meaning: "A runbook is a maintained procedure that guides incident response."
    aliases: [playbook, üzemeltetési eljárás]
  Workaround:
    meaning: "A workaround temporarily reduces incident impact without necessarily restoring the underlying service."
    aliases: [kerülőmegoldás]
  Problem:
    meaning: "A problem is an underlying or potential cause of one or more incidents that may still be under investigation."
    aliases: [probléma]
  KnownError:
    meaning: "A known error is a diagnosed problem with a documented cause or workaround."
    aliases: [ismert hiba]
  RecoveryPlan:
    meaning: "A recovery plan describes how to restore an IT service."
    aliases: [DR plan, helyreállítási terv]
    properties:
      recoveryTimeObjective: {type: number}
      recoveryPointObjective: {type: number}
      lastReviewDate: {type: date}
  BackupSet:
    meaning: "A backup set is a recoverable data resource protecting particular configuration items."
    aliases: [mentéskészlet, backup]
    properties:
      status:
        type: text
        allowed: [scheduled, running, successful, failed, expired, corrupted, verified]
      lastSuccessfulBackup: {type: date}
      lastVerification: {type: date}
  Change:
    meaning: "A change is a controlled modification, with an accelerated emergency path for an urgent operational need."
    aliases: [változás, módosítás]
    properties:
      status:
        type: text
        allowed: [draft, assessed, approved, scheduled, implementing, implemented, failed, rolled-back, closed, cancelled]
      riskLevel:
        type: text
        allowed: [low, medium, high, critical]
      implementationPlan: {type: text}
      backoutPlan: {type: text}
  Release:
    meaning: "A release is a governed package of approved changes introduced together."
    aliases: [kiadás]
  Deployment:
    meaning: "A deployment is the technical execution that delivers a release or installs or activates an application."
    aliases: [telepítés, élesítés]
    properties:
      startTime: {type: date}
      completionTime: {type: date}
      status:
        type: text
        allowed: [planned, running, succeeded, failed, rolled-back, cancelled]
  EvidenceItem:
    meaning: "An evidence item is a particular preserved record or artifact whose integrity and supporting claim must be checked."
    aliases: [evidence, bizonyíték]
    properties:
      collectedTime: {type: date}
      integrityStatus:
        type: text
        allowed: [collected, hashed, verified, sealed, compromised]
      cryptographicHash: {type: text}
  MaterialityAssessment:
    meaning: "A materiality assessment records an incident's reporting conclusion, rationale, and applicable reporting due time."
    aliases: [reportability assessment, lényegességi értékelés]
    properties:
      result:
        type: text
        allowed: [not-reportable, potentially-reportable, reportable, undetermined]
      rationale: {type: text}
      reportingDueTime: {type: date}
  RegulatoryNotification:
    meaning: "A regulatory notification is a formal submission about an incident to a regulator."
    aliases: [supervisory notification, felügyeleti bejelentés]
    properties:
      status:
        type: text
        allowed: [draft, pending-approval, approved, submitted, accepted, rejected, withdrawn]
      dueTime: {type: date}
      submissionTime: {type: date}
  Regulator:
    meaning: "A regulator is the authority to which a regulatory notification is sent."
    aliases: [supervisory authority, felügyeleti hatóság]
  Stakeholder:
    meaning: "A stakeholder is a person, group, or organisation with an interest in an incident's outcome."
    aliases: [érintett]
  Communication:
    meaning: "A communication records a message about an incident through drafting, approval, and sending."
    aliases: [értesítés, tájékoztatás]
    properties:
      audience: {type: text}
      messageSummary: {type: text}
      status:
        type: text
        allowed: [draft, pending-approval, approved, submitted, accepted, rejected, withdrawn]
      sentTime: {type: date}
  PostIncidentReview:
    meaning: "A post-incident review examines an incident, its response, causes, and lessons."
    aliases: [PIR, RCA review, incidens utóelemzés]
    properties:
      heldOnDate: {type: date}
      findings: {type: text}
  CorrectiveAction:
    meaning: "A corrective action is tracked follow-up work produced by a post-incident review."
    aliases: [remediation action, helyesbítő intézkedés]
    properties:
      status:
        type: text
        allowed: [open, in-progress, blocked, implemented, verified, closed, cancelled]
      dueDate: {type: date}
  OrganisationalUnit:
    meaning: "An organisational unit is accountable for a corrective action it owns."
    aliases: [szervezeti egység]

relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: "An incident impacts an IT service when that impact is established."
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "An incident impacts a business service when that impact is established."
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: "A business service depends on a supporting IT service."
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: "A business service is delivered through a customer channel, which does not itself establish channel disruption."
  - name: runsOn
    from: ITService
    to: InfrastructureComponent
    meaning: "An IT service runs on an infrastructure component."
  - name: dependsOn
    from: ITService
    to: ThirdPartyService
    meaning: "An IT service depends on a third-party service."
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "An incident affects a configuration item when its impact on that item is established."
  - name: isImplementedBy
    from: ITService
    to: Application
    meaning: "An IT service is implemented by an application."
  - name: runsOn
    from: Application
    to: InfrastructureComponent
    meaning: "An application runs on an infrastructure component."
  - name: isExecutedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "A monitoring rule is executed by a monitoring tool."
  - name: isGeneratedBy
    from: Alert
    to: MonitoringRule
    meaning: "An alert is generated by a monitoring rule when that origin is established."
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: "An incident is triggered by an alert when that alert actually opened it."
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: "An incident is correlated from an event when investigation establishes the correlation."
  - name: operates
    from: NetworkOperationsCentre
    to: MonitoringTool
    meaning: "The network operations centre operates a monitoring tool."
  - name: monitors
    from: MonitoringTool
    to: ITService
    meaning: "A monitoring tool monitors an IT service."
  - name: monitors
    from: MonitoringTool
    to: ConfigurationItem
    meaning: "A monitoring tool monitors a configuration item."
  - name: monitors
    from: SecurityOperationsCentre
    to: Event
    meaning: "The security operations centre monitors an event only when it is an identified security event actually monitored by the centre."
  - name: records
    from: ServiceDesk
    to: Incident
    meaning: "The service desk records an incident arising from a user-reported issue."
  - name: operates
    from: ITOperationsTeam
    to: ITService
    meaning: "The IT operations team operates an IT service."
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: "A service owner owns an IT service across its lifecycle."
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "An incident is assigned to a resolver group for diagnosis and restoration once the assignment is made."
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: "An on-call engineer is a member of a resolver group."
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "An incident is handled by an on-call engineer when that engineer takes its time-critical technical work."
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: "A declared major incident is coordinated by its assigned incident commander, who must be assigned before declaration."
  - name: coordinates
    from: IncidentResponseTeam
    to: Incident
    meaning: "The incident response team coordinates a declared major incident."
  - name: isMemberOf
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: "An incident commander is a member of the incident response team."
  - name: isHandledWith
    from: Incident
    to: Runbook
    meaning: "An incident is handled with a runbook selected to guide its response."
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "An incident is recovered with a selected recovery plan."
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: "A recovery plan describes recovery of an IT service."
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: "A recovery plan uses a backup set when that set forms part of the plan."
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: "A backup set protects a configuration item."
  - name: isLinkedTo
    from: Incident
    to: Problem
    meaning: "An incident is linked to a problem being investigated as an underlying or potential cause."
  - name: isDocumentedBy
    from: Problem
    to: KnownError
    meaning: "A diagnosed problem is documented by a known error."
  - name: has
    from: KnownError
    to: Workaround
    meaning: "A known error has a documented workaround."
  - name: isDocumentedIn
    from: Workaround
    to: Runbook
    meaning: "A workaround can be documented in a runbook."
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: "An IT service is deployed in an environment without thereby approving it as a recovery target."
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: "A configuration item belongs to an environment without thereby approving it as a restore target."
  - name: affects
    from: Change
    to: ITService
    meaning: "A change affects an IT service in its modification scope."
  - name: modifies
    from: Change
    to: ConfigurationItem
    meaning: "A change modifies an identified configuration item."
  - name: isImplementedBy
    from: Change
    to: Release
    meaning: "A change is implemented by a release that packages approved changes."
  - name: isDeliveredBy
    from: Release
    to: Deployment
    meaning: "A release is delivered by a deployment, whose success must be checked separately."
  - name: targets
    from: Deployment
    to: Environment
    meaning: "A deployment targets an environment."
  - name: deploys
    from: Deployment
    to: Application
    meaning: "A deployment deploys an application."
  - name: isResolvedBy
    from: Incident
    to: Change
    meaning: "An incident is resolved by a change only after the change has actually resolved it."
  - name: isSupportedBy
    from: Incident
    to: EvidenceItem
    meaning: "An incident is supported by a linked evidence item to the extent that the item substantiates a particular claim."
  - name: includes
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: "A regulatory notification includes an evidence item that forms part of its submission."
  - name: isEvaluatedBy
    from: Incident
    to: MaterialityAssessment
    meaning: "An incident is evaluated by a materiality assessment."
  - name: triggers
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: "A materiality assessment triggers a regulatory notification when its conclusion calls for one, without approving or submitting it."
  - name: reports
    from: RegulatoryNotification
    to: Incident
    meaning: "A regulatory notification formally reports an incident."
  - name: isSentTo
    from: RegulatoryNotification
    to: Regulator
    meaning: "A regulatory notification is sent to a regulator."
  - name: notifies
    from: Incident
    to: Stakeholder
    meaning: "An incident identifies a stakeholder for notification without proving a message was delivered."
  - name: isCommunicatedThrough
    from: Incident
    to: Communication
    meaning: "An incident is communicated through a message record that may still be a draft."
  - name: isAddressedTo
    from: Communication
    to: Stakeholder
    meaning: "A communication is addressed to a stakeholder."
  - name: isReviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: "An incident is reviewed in a post-incident review."
  - name: produces
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: "A post-incident review produces tracked corrective actions."
  - name: isOwnedBy
    from: CorrectiveAction
    to: OrganisationalUnit
    meaning: "A corrective action is owned by the organisational unit accountable for its follow-up."
  - name: concerns
    from: Alert
    to: ITService
    meaning: "An alert concerns an IT service when that target is identified."
  - name: concerns
    from: Alert
    to: ConfigurationItem
    meaning: "An alert concerns a configuration item when that target is identified."

rules:
  - name: confirmChannelImpact
    conditions:
      - "Follow a confirmed incident impact on a business service to the channels through which it is delivered."
      - "Call a channel affected only when incident evidence verifies its actual disruption; otherwise say it may be affected."
  - name: identifyRelevantConfigurationItems
    conditions:
      - "Trace documented IT-service, application, and infrastructure dependencies to candidate components."
      - "Check current configuration-management records to establish which candidates are configuration items."
      - "Keep that finding separate from configuration items the incident is evidenced to affect."
  - name: establishSignalRelevance
    conditions:
      - "Treat an alert as triggering an incident or an event as correlated with it only when the respective incident link and investigation establish that fact."
      - "Do not infer relevance from matching times or detection sources."
  - name: assessPossibleChangeCause
    conditions:
      - "Compare affected services and configuration items with change scope, then follow the release and deployment path."
      - "Check deployment status and compare its execution window with incident detection as investigation leads."
      - "Require incident classification and supporting evidence before concluding cause; proximity or a deployment link is not proof."
  - name: relyOnEvidence
    conditions:
      - "Identify the particular evidence item linked to the incident and check what claim it substantiates."
      - "Verify its integrity before relying on it; a collected status or recorded hash alone is insufficient."
  - name: canAcknowledgeAlert
    conditions:
      - "The alert status is new and its concerned IT service or configuration item is established."
      - "Current alert-routing and support information establishes the responsible resolver group."
      - "The operator is verified as authorised for that group; otherwise do not acknowledge."
  - name: canAssignIncident
    conditions:
      - "The incident is neither closed nor cancelled."
      - "Current support-assignment information confirms the proposed resolver group supports an IT service or configuration item affected by this incident."
  - name: canDeclareMajorIncident
    conditions:
      - "The incident is not resolved, closed, or cancelled."
      - "Its severity is sev1-critical or sev2-high, and at least one impacted IT service is identified."
      - "An incident commander has been assigned before declaration."
      - "Check the business-impact criteria in the approved major-incident procedure; their thresholds are not specified here."
      - "Passing the criteria does not itself declare the incident or set its major-incident flag."
  - name: canContainIncident
    conditions:
      - "The incident status is acknowledged or investigating."
      - "The proposed containment scope and expected side effects are recorded, and the containment steps are approved for this incident."
  - name: canIsolateConfigurationItem
    conditions:
      - "The target configuration item is linked as affected by the incident."
      - "Assess the proposed isolation's actual dependencies and service impact, using the item's criticality tier as context."
      - "A rollback or reconnection method is available."
  - name: canFailOverITService
    conditions:
      - "Identify the IT service affected by the incident and verify that the selected recovery plan applies to it."
      - "Verify that the proposed recovery environment is currently available and the data-recovery point is acceptable."
      - "The plan's existence, objectives, or an incident status alone does not permit failover."
  - name: canRestoreBackupSet
    conditions:
      - "The backup set status is successful or verified and the set protects the target configuration item."
      - "The specific restore point and target environment are approved."
      - "If any check fails or cannot be verified, do not restore."
  - name: canExecuteEmergencyChange
    conditions:
      - "The emergency-change execution workflow verifies an active incident and the reason it justifies the accelerated path; the later is-resolved-by link cannot substitute for this."
      - "The implementation plan and backout plan are present, and affected configuration items are identified."
      - "Risk is explicitly accepted, separately from its recorded risk level, and the change being implemented is approved under the governed emergency path."
  - name: canSendCommunication
    conditions:
      - "The selected communication's audience, message, owner, and approval state are recorded under the applicable approval workflow."
      - "The addressed stakeholder is appropriate for the audience."
      - "Its content matches the latest verified incident state; if the required checks cannot be established, do not send."
  - name: canSubmitRegulatoryNotification
    conditions:
      - "The linked materiality assessment result is reportable, and the notification status is approved."
      - "The notification is linked to the incident and regulator, and its required information and supporting evidence are complete and checked."
      - "Confirm the applicable deadline and that submission can occur before the notification's due time."
      - "If assessment and notification due times differ, obtain reconciliation from the designated reporting function under the approved procedure rather than choosing one automatically."
  - name: canCloseIncident
    conditions:
      - "The incident status is resolved or monitoring."
      - "Impacted business and IT services have healthy health states, or a residual condition has been accepted."
      - "Resolution and restoration evidence is recorded, and required stakeholder communications are complete."
      - "For a declared major incident or an incident in the cybersecurity category, a post-incident review is scheduled or completed; confirm completion by its held-on date or scheduling through retained workflow evidence."
      - "Outstanding corrective actions do not by themselves block closure."

actions:
  - name: acknowledge an alert
    input: Alert
    preconditions:
      - "Apply canAcknowledgeAlert."
    effect: "Acknowledge the alert, record its acknowledgement time, and update its status to acknowledged."
    verification: "Read back the alert and confirm acknowledged status and the recorded acknowledgement time."
  - name: assign an incident to a resolver group
    input: Incident
    preconditions:
      - "Apply canAssignIncident."
    effect: "Record the incident's assignment to the selected resolver group."
    verification: "Read back the incident's resolver-group assignment."
  - name: declare a major incident
    input: Incident
    preconditions:
      - "Apply canDeclareMajorIncident, including assignment of the commander before declaration."
    effect: "Set the major-incident classification or flag, record declaration time, and start coordination and the communication cadence."
    verification: "Confirm the classification, declaration time, assigned commander, and communication record."
  - name: contain an incident
    input: Incident
    preconditions:
      - "Apply canContainIncident."
    effect: "Execute approved containment steps and set status to contained only after containment indicators are verified."
    verification: "Check containment indicators and remaining service impact; retain the scope, expected side effects, and verification record without assuming restoration."
  - name: isolate a configuration item
    input: Incident
    preconditions:
      - "Apply canIsolateConfigurationItem to the specific affected configuration item."
    effect: "Isolate that item from the defined networks or dependencies."
    verification: "Confirm the defined separation and remaining service health; retain the impact assessment, rollback or reconnection method, and result."
  - name: fail over an IT service
    input: Incident
    preconditions:
      - "Apply canFailOverITService to the affected IT service and proposed target."
    effect: "Move the service workload to the recovery environment."
    verification: "Verify IT-service health and critical business transactions in that environment, and retain the checks and results."
  - name: restore data from a backup set
    input: BackupSet
    preconditions:
      - "Apply canRestoreBackupSet to its protected target item and the approved restore point and environment."
    effect: "Restore data from the selected backup set to the target."
    verification: "Validate restored data integrity and the functionality of the application identified by the restore workflow; retain approvals and results."
  - name: execute an emergency change
    input: Change
    preconditions:
      - "Apply canExecuteEmergencyChange to the approved change on its accelerated path."
    effect: "Implement the change and update its status to its actual outcome, whether implemented, failed, or rolled back."
    verification: "Read back change status, retrieve workflow-held implementation evidence, run planned technical checks, and verify affected IT-service health; do not infer incident resolution."
  - name: send a stakeholder update
    input: Incident
    preconditions:
      - "Apply canSendCommunication to the specific communication selected for this incident."
    effect: "Send the communication, record sent time, and update its status to reflect the actual messaging outcome."
    verification: "Confirm delivery status, archive the final message, and retain the send and delivery record; sending alone does not prove delivery."
  - name: submit an approved regulatory notification
    input: RegulatoryNotification
    preconditions:
      - "Apply canSubmitRegulatoryNotification."
    effect: "Submit the notification, set status to submitted, record submission time, and retain the submission receipt."
    verification: "Read back status and submission time and confirm receipt; subsequently confirm acceptance or record rejection and remediation without equating submitted with accepted."
  - name: close an incident
    input: Incident
    preconditions:
      - "Apply canCloseIncident."
    effect: "Set incident status to closed, record closed time, and retain the closure checks."
    verification: "Read back closure state and impacted-service health or accepted residual condition, resolution and restoration evidence, completed communications, and any required review scheduling or completion."