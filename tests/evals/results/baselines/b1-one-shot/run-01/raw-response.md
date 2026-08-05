classes:
  Incident:
    meaning: "An unplanned operational event requiring investigation, response, or recovery because it may affect an IT service or configuration item."
    aliases:
      - ticket
      - incident record
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
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      acknowledged:
        type: boolean
      impactLevel:
        type: text
        allowed:
          - enterprise-wide
          - multiple-services
          - single-service
          - limited-users
          - no-observed-impact
      incidentType:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      nextSteps:
        type: text
      commanderActionPlan:
        type: text
      expectedRestorationTime:
        type: date
      serviceLevelObjectiveDeadline:
        type: date
  ITService:
    meaning: "A business-recognized technology service whose availability or performance is governed and managed."
    aliases:
      - service
      - technology service
    properties:
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
      currentStatus:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      restorationTargetTime:
        type: date
  ConfigurationItem:
    meaning: "A managed technical component or system element that can support services, be affected by incidents, or be changed or isolated."
    aliases:
      - CI
      - component
    properties:
      currentStatus:
        type: text
        allowed:
          - operational
          - under-maintenance
          - in-repair
          - decommissioned
          - unknown
      isolationState:
        type: text
        allowed:
          - isolated
          - connected
          - pending-isolation
          - failed-isolation
          - unknown
  EventAlert:
    meaning: "A detected signal or notification that may indicate or relate to an incident."
    aliases:
      - alert
      - event
      - monitoring alert
    properties:
      alertTime:
        type: date
      signalType:
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
  Runbook:
    meaning: "A documented procedure used to guide response or recovery for a type of incident."
    aliases:
      - playbook
    properties:
      validForIncidentType:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
  Workaround:
    meaning: "A temporary mitigation used to reduce incident impact or contain an incident before full resolution."
    aliases:
      - mitigation
      - temporary fix
      - containment measure
    properties:
      effectivenessStatus:
        type: text
        allowed:
          - effective
          - partially effective
          - not effective
          - unknown
  MajorIncidentDeclaration:
    meaning: "A formal record that an incident has met the bank's criteria for major-incident handling."
    aliases:
      - MI declaration
    properties:
      declarationStatus:
        type: text
        allowed:
          - required
          - pending
          - complete
      declaredAt:
        type: date
  Evidence:
    meaning: "Information or documentation collected to support incident handling, review, audit, or regulatory obligations."
    aliases:
      - supporting evidence
      - audit evidence
    properties:
      evidenceType:
        type: text
        allowed:
          - operational
          - regulatory
          - audit
          - forensic
      collectionStatus:
        type: text
        allowed:
          - collected
          - not collected
          - in progress
      collectedAt:
        type: date
  MaterialityAssessment:
    meaning: "An assessment of an incident's significance used to determine governance and reporting obligations."
    aliases:
      - materiality review
      - reportability assessment
    properties:
      assessmentStatus:
        type: text
        allowed:
          - not started
          - in progress
          - complete
      materialityOutcome:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
  RegulatoryNotification:
    meaning: "A communication or filing made to an external regulator about a reportable incident."
    aliases:
      - regulatory filing
      - regulator notification
    properties:
      notificationStatus:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      reportingDeadline:
        type: date
  RecoveryPlan:
    meaning: "A documented plan for restoring an IT service after disruption."
    aliases:
      - service recovery plan
      - restoration plan
    properties:
      planStatus:
        type: text
        allowed:
          - draft
          - approved
          - active
          - outdated
  Backup:
    meaning: "A recoverable copy of a configuration item or service state used for restoration."
    aliases:
      - backup copy
      - restore point
    properties:
      completedAt:
        type: date
      successStatus:
        type: text
        allowed:
          - successful
          - failed
          - expired
          - corrupted
          - verified
  Change:
    meaning: "A controlled modification to a configuration item or IT service, including emergency changes."
    aliases:
      - change record
      - RFC
    properties:
      changeType:
        type: text
        allowed:
          - normal
          - emergency
          - standard
      approvalStatus:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implemented
          - failed
          - rolled-back
          - closed
      implementedAt:
        type: date
  StakeholderCommunication:
    meaning: "A message or update sent to stakeholders about an incident or major-incident response."
    aliases:
      - stakeholder update
      - incident communication
    properties:
      communicationStatus:
        type: text
        allowed:
          - draft
          - pending-approval
          - sent
          - archived
      messageType:
        type: text
        allowed:
          - incident update
          - major incident notice
          - status report
          - informational notice
  PostIncidentReview:
    meaning: "A review of an incident response used to identify lessons, findings, and corrective actions."
    aliases:
      - PIR
      - postmortem
    properties:
      reviewStatus:
        type: text
        allowed:
          - not started
          - in progress
          - complete
      completedAt:
        type: date
  CorrectiveAction:
    meaning: "A follow-up action intended to address a finding, weakness, or improvement identified from an incident or review."
    aliases:
      - remediation action
      - follow-up action
    properties:
      actionStatus:
        type: text
        allowed:
          - open
          - in progress
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  ITServiceOwner:
    meaning: "The accountable owner for an IT service's operational governance, ownership, and escalation."
    aliases:
      - service owner
      - service accountable owner
    properties: {}
  ApplicationOwner:
    meaning: "The accountable owner for an application's operational fitness and application-level escalation."
    aliases:
      - app owner
      - application accountable owner
    properties: {}
  TechnicalOwner:
    meaning: "The accountable owner for technical engineering, maintenance, or technical escalation of configuration items."
    aliases:
      - tech owner
      - engineering owner
    properties: {}
  ResolverGroup:
    meaning: "A team or group responsible for resolving incidents of a supported service, component, or incident type."
    aliases:
      - support group
      - resolver team
      - assignment group
    properties:
      supportedIncidentType:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      currentAvailabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - on-call
          - offline
          - unknown
  IncidentCommander:
    meaning: "The person or role responsible for leading the incident response and maintaining the response action plan."
    aliases:
      - IC
      - incident lead
    properties: {}
  CommunicationsLead:
    meaning: "The person or role responsible for coordinating incident or major-incident communications."
    aliases:
      - comms lead
      - communications coordinator
    properties: {}
  ComplianceOfficer:
    meaning: "An internal bank role responsible for materiality assessment support and regulatory-reporting preparation."
    aliases:
      - regulatory reporting contact
      - compliance contact
    properties:
      jurisdictionCoverage:
        type: text
  Regulator:
    meaning: "An external regulatory authority that may need to receive notifications about reportable incidents."
    aliases:
      - regulatory authority
      - supervisory authority
    properties:
      jurisdiction:
        type: text
  Stakeholder:
    meaning: "A person, group, or representative who needs to receive incident-related communications."
    aliases:
      - business stakeholder
      - customer representative
    properties:
      stakeholderType:
        type: text
        allowed:
          - business
          - customer
          - internal
      contactChannel:
        type: text
        allowed:
          - email
          - phone
          - internal portal
          - in-person
  ChangeApprover:
    meaning: "The role with authority to formally approve a change based on risk, impact, and necessity."
    aliases:
      - approver
      - change authority
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: "The incident affects the availability, performance, or operation of the IT service."
    aliases:
      - affects service
      - impacts service
      - service impacted by incident
  - name: ownedBy
    from: ITService
    to: ITServiceOwner
    meaning: "The IT Service Owner is accountable for the service's ownership and governance."
    aliases:
      - owned by service owner
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group is responsible for working the incident toward resolution."
    aliases:
      - routed to
  - name: supportedBy
    from: ITService
    to: ResolverGroup
    meaning: "The resolver group normally supports the service and can be used to derive incident routing."
    aliases:
      - supported by support group
      - service support group
  - name: commandedBy
    from: Incident
    to: IncidentCommander
    meaning: "The incident commander leads the response for the incident."
    aliases:
      - led by
      - incident lead is
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "The incident affects or involves the configuration item."
    aliases:
      - impacts CI
      - impacted component
  - name: supports
    from: ConfigurationItem
    to: ITService
    meaning: "The configuration item contributes to the operation of the IT service."
    aliases:
      - underpins service
      - service depends on CI
      - supports service
  - name: maintainedBy
    from: ConfigurationItem
    to: TechnicalOwner
    meaning: "The technical owner is responsible for engineering, maintenance, or escalation for the configuration item."
    aliases:
      - maintained by tech owner
  - name: relatesTo
    from: EventAlert
    to: Incident
    meaning: "The event or alert is correlated with or relevant to the incident."
    aliases:
      - correlated to
      - associated alert for incident
      - related alert
  - name: appliesTo
    from: Runbook
    to: Incident
    meaning: "The runbook is relevant guidance for responding to the incident."
    aliases:
      - runbook for incident
      - playbook applies to
  - name: mitigates
    from: Workaround
    to: Incident
    meaning: "The workaround can reduce the impact of the incident."
    aliases:
      - mitigates incident
      - temporary fix for
      - reduces impact of
  - name: containedBy
    from: Incident
    to: Workaround
    meaning: "The incident record identifies the workaround or containment measure applied to contain it."
    aliases:
      - containment measure applied
      - mitigated by
  - name: hasApplicationOwner
    from: ITService
    to: ApplicationOwner
    meaning: "The service has an application owner responsible for operational fitness and application-level escalation."
    aliases:
      - application owner for service
      - app owner for service
  - name: escalatedTo
    from: Incident
    to: ITServiceOwner
    meaning: "The incident has been directly escalated to the IT Service Owner for oversight."
    aliases: []
  - name: escalatedTo
    from: Incident
    to: ApplicationOwner
    meaning: "The incident has been directly escalated to the Application Owner for application-level input."
    aliases: []
  - name: escalatedTo
    from: Incident
    to: TechnicalOwner
    meaning: "The incident has been directly escalated to the Technical Owner for technical escalation."
    aliases: []
  - name: restores
    from: RecoveryPlan
    to: ITService
    meaning: "The recovery plan is intended to restore the IT service."
    aliases:
      - restoration plan for service
      - recovers service
      - service recovery plan for
  - name: hasRecoveryPlan
    from: Incident
    to: RecoveryPlan
    meaning: "The incident uses or selects the recovery plan for response or restoration."
    aliases:
      - selected recovery plan
      - uses recovery plan
  - name: protects
    from: Backup
    to: ConfigurationItem
    meaning: "The backup provides a recoverable copy for the configuration item."
    aliases:
      - backup for CI
      - protects component
  - name: supportsRestorationOf
    from: Backup
    to: ITService
    meaning: "The backup can support restoration of the IT service."
    aliases:
      - restore point for service
      - supports service restore
  - name: restoredFrom
    from: Incident
    to: Backup
    meaning: "The incident record identifies the specific backup used for restoration."
    aliases:
      - restored using backup
      - recovered from restore point
      - backup used for restoration
  - name: declares
    from: MajorIncidentDeclaration
    to: Incident
    meaning: "The declaration records that the incident is being handled as a major incident."
    aliases:
      - major incident declared for
      - MI declared for
  - name: authorizedBy
    from: MajorIncidentDeclaration
    to: IncidentCommander
    meaning: "The incident commander formally authorizes or owns the major-incident declaration decision."
    aliases:
      - authorized by IC
      - declaration approved by incident commander
  - name: communicatedBy
    from: MajorIncidentDeclaration
    to: CommunicationsLead
    meaning: "The communications lead coordinates communications resulting from the declaration."
    aliases:
      - communications coordinated by
      - comms lead for declaration
  - name: assesses
    from: MaterialityAssessment
    to: Incident
    meaning: "The assessment evaluates the incident's significance for governance and reporting."
    aliases:
      - assesses reportability of incident
      - materiality review for incident
  - name: performedBy
    from: MaterialityAssessment
    to: ComplianceOfficer
    meaning: "The compliance officer performs or owns the materiality assessment."
    aliases:
      - performed by compliance contact
      - owned by regulatory reporting contact
  - name: reports
    from: RegulatoryNotification
    to: Incident
    meaning: "The notification reports information about the incident to a regulator."
    aliases:
      - notification for incident
      - reports incident to regulator
  - name: submittedTo
    from: RegulatoryNotification
    to: Regulator
    meaning: "The notification is sent to the external regulator."
    aliases:
      - sent to regulator
      - filed with regulator
  - name: preparedBy
    from: RegulatoryNotification
    to: ComplianceOfficer
    meaning: "The compliance officer prepares the regulatory notification."
    aliases:
      - prepared by compliance contact
      - prepared by regulatory reporting contact
  - name: basedOn
    from: RegulatoryNotification
    to: MaterialityAssessment
    meaning: "The notification decision or content is derived from the materiality assessment."
    aliases:
      - based on materiality review
      - derived from reportability assessment
  - name: documents
    from: Evidence
    to: Incident
    meaning: "The evidence supports documentation, review, audit, or reporting for the incident."
    aliases:
      - evidence for incident
      - documents incident
  - name: concerns
    from: StakeholderCommunication
    to: Incident
    meaning: "The communication is about the incident or its response."
    aliases:
      - communication about incident
      - incident communication for
  - name: sentTo
    from: StakeholderCommunication
    to: Stakeholder
    meaning: "The communication is addressed to the stakeholder."
    aliases:
      - sent to stakeholder
  - name: coordinatedBy
    from: StakeholderCommunication
    to: CommunicationsLead
    meaning: "The communications lead coordinates the stakeholder communication."
    aliases:
      - coordinated by comms lead
  - name: relatesTo
    from: Change
    to: Incident
    meaning: "The change is associated with the incident, such as a prior related change or an emergency change."
    aliases:
      - related change
      - change associated with incident
      - emergency change for incident
  - name: approvedBy
    from: Change
    to: ChangeApprover
    meaning: "The change approver formally authorized the change."
    aliases:
      - authorized by change authority
  - name: changes
    from: Change
    to: ConfigurationItem
    meaning: "The change modifies the configuration item."
    aliases:
      - modifies CI
      - changes component
  - name: affects
    from: Change
    to: ITService
    meaning: "The change has impact on the IT service."
    aliases:
      - change impacts service
      - change affects service
  - name: reviews
    from: PostIncidentReview
    to: Incident
    meaning: "The review evaluates the incident and its response."
    aliases:
      - PIR for incident
      - postmortem reviews incident
  - name: identifies
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: "The review records corrective actions identified from its findings."
    aliases:
      - review identifies action
      - PIR action identified
  - name: relatesTo
    from: CorrectiveAction
    to: Incident
    meaning: "The corrective action is relevant to the incident, including past incidents used for comparison."
    aliases:
      - action related to incident
      - remediation for incident
rules:
  - name: majorIncidentDeclarationRequired
    conditions:
      - Incident severity is sev1-critical or sev2-high.
      - At least one impacted IT service is identified.
      - The incident is still in progress and has not been resolved or closed.
      - Incident impact level is enterprise-wide or multiple-services.
  - name: regulatoryNotificationRequired
    conditions:
      - The materiality assessment outcome is potentially-reportable or reportable.
      - Compliance with jurisdictional requirements indicates notification is necessary.
      - The incident is deemed significant enough to warrant regulatory oversight based on incident details or history.
      - Evidence supports that the incident meets the criteria for mandatory reporting under current regulations.
  - name: canAssignIncidentToResolverGroup
    conditions:
      - The incident status is new, acknowledged, or investigating.
      - The resolver group has been identified as having the necessary expertise or support for the affected IT service or configuration item.
      - The resolver group's current availability status is available or on-call.
      - The incident type aligns with the supported incident type of the resolver group.
  - name: emergencyChangeJustified
    conditions:
      - The incident is classified as sev1-critical or sev2-high.
      - A significant impact to business operations is identified or imminent.
      - The change is necessary to prevent further degradation of service or to restore a critical service immediately.
      - The approved implementation and backout plans for the emergency change are in place.
  - name: canRestoreFromBackup
    conditions:
      - The backup status is successful or verified.
      - The correct backup to restore has been identified and is available.
      - The restoration target environment is prepared and accessible.
      - The approved restoration process, including any necessary validation steps, is in place.
  - name: sloEscalationRequired
    conditions:
      - The incident is still unresolved as it approaches or exceeds the defined service-level objective timeline.
      - Current progress towards resolution is not meeting the expected milestones or indicators defined in the SLO.
      - Stakeholder communications indicate increased concern regarding the delay in incident resolution.
      - Internal assessment shows that the incident may impact overall service availability or customer satisfaction.
  - name: configurationItemIsolationRequired
    conditions:
      - The incident has a critical impact on business operations or service availability.
      - The configuration item is confirmed to be the source of the incident or degradation.
      - There is a risk of propagation to other services or configuration items due to the incident.
      - Established isolation procedures are readily available and defined for the impacted configuration item.
  - name: stakeholderCommunicationRequired
    conditions:
      - The incident severity is classified as sev1-critical or sev2-high.
      - There are significant changes to the status of the incident that stakeholders need to be aware of, such as escalation, mitigation steps, or expected resolution timelines.
      - Specific stakeholder requests for updates have been received.
      - Regulatory requirements dictate that stakeholders must be informed about particular incident details.
  - name: evidenceCollectionRequired
    conditions:
      - The incident has potential regulatory implications or is of a serious nature requiring formal documentation.
      - There is uncertainty regarding the cause of the incident, necessitating a thorough investigation.
      - The incident is classified as a cybersecurity incident, requiring preservation of evidence for forensic analysis.
      - Historical information or similar incidents suggest that evidence collection is critical for assessing impact or liability.
  - name: postIncidentReviewRequired
    conditions:
      - The incident was classified as a major incident during its lifecycle.
      - Significant findings or corrective actions are identified during incident resolution that warrant further review.
      - The incident involved multiple teams or impacted several IT services, necessitating a coordinated review.
      - Regulatory or compliance policies mandate that a review must occur following incidents of certain severities.
  - name: containmentReady
    conditions:
      - Configuration item isolation is required or allowed for the incident.
      - An effective Workaround or containment measure has been identified.
actions:
  - name: acknowledgeIncident
    input: Incident
    preconditions:
      - An identifiable Incident exists.
    effect: Incident.acknowledged becomes true and Incident.status becomes acknowledged.
    verification: Read the incident again and confirm acknowledged is true and status is acknowledged.
  - name: assignIncidentToResolverGroup
    input: Incident
    preconditions:
      - canAssignIncidentToResolverGroup is satisfied.
    effect: Incident is assigned to the appropriate Resolver Group through the assignedTo relationship.
    verification: Read the incident again and confirm the assigned resolver group is recorded.
  - name: declareMajorIncident
    input: Incident
    preconditions:
      - majorIncidentDeclarationRequired is satisfied.
    effect: A Major Incident Declaration is recorded for the Incident and declarationStatus becomes complete or pending depending on workflow state.
    verification: Confirm a Major Incident Declaration exists for the Incident and its declarationStatus is no longer absent.
  - name: sendStakeholderCommunication
    input: StakeholderCommunication
    preconditions:
      - stakeholderCommunicationRequired is satisfied.
    effect: StakeholderCommunication.communicationStatus becomes sent and the communication remains linked to the Incident and Stakeholder recipients.
    verification: Confirm communicationStatus is sent and the intended Stakeholder recipients are recorded.
  - name: containIncident
    input: Incident
    preconditions:
      - containmentReady is satisfied.
    effect: Incident.status becomes contained and the applied Workaround is recorded through the containedBy relationship.
    verification: Confirm Incident.status is contained and the containment Workaround is linked.
  - name: isolateConfigurationItem
    input: ConfigurationItem
    preconditions:
      - configurationItemIsolationRequired is satisfied.
    effect: ConfigurationItem.isolationState becomes isolated, or failed-isolation if the attempt fails.
    verification: Read the Configuration Item again and confirm isolationState is isolated, or confirm failed-isolation with failure details in the incident record.
  - name: executeEmergencyChange
    input: Change
    preconditions:
      - emergencyChangeJustified is satisfied.
    effect: Change.changeType is emergency and Change.approvalStatus moves to implemented if successful, or failed or rolled-back if unsuccessful.
    verification: Read the Change again and confirm changeType is emergency and approvalStatus reflects the execution outcome.
  - name: restoreServiceFromBackup
    input: Incident
    preconditions:
      - canRestoreFromBackup is satisfied.
    effect: Incident is linked to the Backup used through restoredFrom and impacted ITService.currentStatus moves to recovering or healthy depending on outcome.
    verification: Confirm the restoredFrom Backup is recorded for the Incident and the impacted ITService.currentStatus reflects restoration outcome.
  - name: submitRegulatoryNotification
    input: RegulatoryNotification
    preconditions:
      - regulatoryNotificationRequired is satisfied.
    effect: RegulatoryNotification.notificationStatus becomes submitted and remains linked to Incident, Regulator, Compliance Officer, and Materiality Assessment.
    verification: Confirm notificationStatus is submitted and submittedTo Regulator is recorded.
  - name: conductPostIncidentReview
    input: PostIncidentReview
    preconditions:
      - postIncidentReviewRequired is satisfied.
    effect: PostIncidentReview.reviewStatus moves to complete, findings are captured in the review record, and any Corrective Actions identified are linked.
    verification: Confirm reviewStatus is complete and any identified Corrective Actions are linked through identifies.