classes:
  Incident:
    meaning: "An unplanned operational issue that disrupts, degrades, or threatens an IT service or related business process."
    aliases:
      - ticket
      - incident ticket
      - issue
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - assigned
          - in progress
          - mitigated
          - resolved
          - closed
          - cancelled
      priority:
        type: text
        allowed:
          - P1
          - P2
          - P3
          - P4
          - P5
      impact:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      urgency:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      severity:
        type: text
        allowed:
          - minor
          - moderate
          - major
          - critical
      openedAt:
        type: date
      closedAt:
        type: date
      firstResponseAt:
        type: date
      estimatedRecoveryTime:
        type: date
      causeSummary:
        type: text
      resolutionConfirmed:
        type: boolean
      stakeholderCommunicationConfirmed:
        type: boolean
  ITService:
    meaning: "A technology service delivered or supported by IT that may be affected by incidents and has defined ownership, support, dependencies, and recovery arrangements."
    aliases:
      - IT Service
      - service
      - technology service
    properties:
      criticality:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      operationalEnvironment:
        type: text
        allowed:
          - production
          - pre-production
          - test
          - development
          - disaster recovery
      currentStatus:
        type: text
        allowed:
          - operational
          - degraded
          - disrupted
          - recovering
          - unavailable
          - retired
      estimatedRecoveryTime:
        type: date
  Alert:
    meaning: "A monitoring signal that requires attention and may be related to an incident."
    aliases:
      - monitoring alert
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - correlated
          - cleared
          - closed
      raisedAt:
        type: date
      acknowledgedAt:
        type: date
      signalSummary:
        type: text
  Event:
    meaning: "A noteworthy occurrence in the IT environment that may provide context for, contribute to, or lead to recognition of an incident."
    aliases:
      - operational event
      - noteworthy event
    properties:
      status:
        type: text
        allowed:
          - observed
          - correlated
          - under investigation
          - explained
          - closed
      occurredAt:
        type: date
      eventSummary:
        type: text
  ResolverGroup:
    meaning: "A support group responsible for investigating and resolving incidents for one or more IT services or technical areas."
    aliases:
      - support group
      - assignment group
      - resolver team
    properties:
      currentWorkload:
        type: number
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
      supportHours:
        type: text
  ServiceOwner:
    meaning: "The accountable owner responsible for the overall health, delivery, and governance of an IT service."
    aliases:
      - service accountable owner
      - service lead
      - IT service owner
    properties:
      contactRoute:
        type: text
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
  ApplicationOwner:
    meaning: "The role responsible for the functionality, performance, support, and business alignment of a specific application within or supporting an IT service."
    aliases:
      - app owner
      - application lead
    properties:
      contactRoute:
        type: text
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
  TechnicalOwner:
    meaning: "The role responsible for the engineering, development, maintenance, technical viability, security, and compliance of an application or technical component."
    aliases:
      - tech owner
      - engineering owner
      - technical lead
    properties:
      contactRoute:
        type: text
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
  OnCallEngineer:
    meaning: "The currently designated engineer responsible for hands-on technical response for a resolver group or supported service during a coverage window."
    aliases:
      - on-call
      - duty engineer
      - support engineer
    properties:
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
      onCallWindow:
        type: text
      contactRoute:
        type: text
  BusinessServiceOwner:
    meaning: "The accountable owner for a business process or business-facing service affected by IT service disruption."
    aliases:
      - business owner
      - business process owner
      - business service lead
    properties:
      contactRoute:
        type: text
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
  MajorIncidentDeclaration:
    meaning: "A formal record that an incident has met major-incident criteria and is being handled under heightened coordination and governance."
    aliases:
      - MI declaration
      - major incident record
      - major incident status
    properties:
      status:
        type: text
        allowed:
          - proposed
          - active
          - rejected
          - stood down
          - closed
          - cancelled
      declaredAt:
        type: date
      criteriaMet:
        type: boolean
      declarationRationale:
        type: text
  MaterialityAssessment:
    meaning: "An assessment that determines whether an incident is material for compliance or regulatory-reporting purposes."
    aliases:
      - materiality review
      - regulatory materiality assessment
      - reportability assessment
    properties:
      status:
        type: text
        allowed:
          - not started
          - in progress
          - completed
          - reopened
          - cancelled
      completedAt:
        type: date
      materialityOutcome:
        type: text
        allowed:
          - not material
          - potentially material
          - material
          - unknown
      assessmentRationale:
        type: text
  RegulatoryNotification:
    meaning: "A notification required or sent to meet a regulatory reporting obligation related to an incident."
    aliases:
      - regulatory report
      - regulatory filing
      - compliance notification
    properties:
      status:
        type: text
        allowed:
          - not required
          - required
          - drafting
          - sent
          - acknowledged
          - overdue
          - closed
          - cancelled
      dueAt:
        type: date
      sentAt:
        type: date
      notificationReason:
        type: text
  StakeholderCommunication:
    meaning: "A communication record describing incident-related information sent or prepared for stakeholders."
    aliases:
      - stakeholder update
      - incident communication
      - status communication
    properties:
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - sent
          - failed
          - superseded
          - cancelled
      sentAt:
        type: date
      messageSummary:
        type: text
      communicationChannel:
        type: text
        allowed:
          - email
          - phone
          - chat
          - conference call
          - status page
          - portal
          - other
  Stakeholder:
    meaning: "A person, group, or role that is affected by, involved in, or needs communication about an incident."
    aliases:
      - recipient
      - impacted party
      - interested party
    properties:
      stakeholderType:
        type: text
        allowed:
          - business
          - technical
          - governance
          - risk and compliance
          - executive
          - external
      contactRoute:
        type: text
      communicationPreference:
        type: text
        allowed:
          - email
          - phone
          - chat
          - conference call
          - status page
          - portal
  ConfigurationItem:
    meaning: "A managed technical component, system, application, or infrastructure element that may support an IT service or be linked to an incident."
    aliases:
      - CI
      - asset
      - managed component
    properties:
      ciType:
        type: text
        allowed:
          - application
          - database
          - server
          - network component
          - storage component
          - middleware
          - service component
          - other
      currentStatus:
        type: text
        allowed:
          - operational
          - degraded
          - disrupted
          - recovering
          - unavailable
          - retired
      criticality:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      operationalEnvironment:
        type: text
        allowed:
          - production
          - pre-production
          - test
          - development
          - disaster recovery
  KnownError:
    meaning: "A documented recurring or understood fault condition that may apply to an incident and may have associated guidance or workarounds."
    aliases:
      - known issue
      - documented error
      - known problem
    properties:
      status:
        type: text
        allowed:
          - active
          - under review
          - resolved
          - retired
      errorSummary:
        type: text
      applicabilityCriteria:
        type: text
      identifiedAt:
        type: date
  Workaround:
    meaning: "A temporary measure used to reduce incident impact or restore service functionality without necessarily resolving the underlying cause."
    aliases:
      - temporary fix
      - mitigation
      - interim solution
    properties:
      status:
        type: text
        allowed:
          - available
          - under review
          - retired
          - not recommended
      workaroundSummary:
        type: text
      applicabilityCriteria:
        type: text
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
  RecoveryPlan:
    meaning: "A documented plan describing how to restore an IT service or supported capability after disruption."
    aliases:
      - restoration plan
      - service recovery plan
      - recovery procedure
    properties:
      status:
        type: text
        allowed:
          - active
          - inactive
          - expired
          - under review
          - retired
      version:
        type: text
      lastValidatedAt:
        type: date
  RecoveryStep:
    meaning: "An individual ordered instruction or task within recovery guidance for restoring a service or capability."
    aliases:
      - recovery task
      - restoration step
      - recovery instruction
    properties:
      sequenceNumber:
        type: number
      instruction:
        type: text
      status:
        type: text
        allowed:
          - not started
          - in progress
          - completed
          - failed
          - skipped
          - blocked
      estimatedDurationMinutes:
        type: number
  Change:
    meaning: "A recorded modification to the IT environment that may affect service operation or contribute to an incident."
    aliases:
      - change record
      - change request
      - implementation
    properties:
      status:
        type: text
        allowed:
          - planned
          - approved
          - implemented
          - failed
          - backed out
          - cancelled
          - closed
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      implementedAt:
        type: date
      changeSummary:
        type: text
      implementationOutcome:
        type: text
        allowed:
          - successful
          - partially successful
          - failed
          - backed out
          - unknown
  EmergencyChange:
    meaning: "An urgent change executed under expedited governance to resolve or reduce the impact of an incident."
    aliases:
      - urgent change
      - emergency change request
      - expedited change
    properties:
      status:
        type: text
        allowed:
          - requested
          - under review
          - authorized
          - rejected
          - executing
          - completed
          - failed
          - closed
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      requestedAt:
        type: date
      executedAt:
        type: date
      changeRationale:
        type: text
      authorizationStatus:
        type: text
        allowed:
          - not requested
          - pending
          - authorized
          - rejected
          - expired
  EvidenceItem:
    meaning: "A collected record, artifact, or observation used to support incident investigation, governance, review, or reporting."
    aliases:
      - evidence
      - artifact
      - supporting record
    properties:
      status:
        type: text
        allowed:
          - collected
          - pending validation
          - validated
          - rejected
          - archived
      collectedAt:
        type: date
      evidenceSummary:
        type: text
      integrityStatus:
        type: text
        allowed:
          - not checked
          - pending
          - validated
          - failed
          - unknown
  EvidenceIntegrityCheck:
    meaning: "A validation record showing whether an evidence item’s integrity was checked and what the result was."
    aliases:
      - integrity validation
      - evidence validation
      - chain-of-custody check
    properties:
      status:
        type: text
        allowed:
          - pending
          - in progress
          - completed
          - failed
      checkedAt:
        type: date
      checkMethod:
        type: text
      checkResult:
        type: text
        allowed:
          - passed
          - failed
          - inconclusive
  PostIncidentReview:
    meaning: "A structured review after an incident that records findings, lessons, root cause information, and follow-up actions."
    aliases:
      - PIR
      - post-mortem
      - incident review
    properties:
      status:
        type: text
        allowed:
          - planned
          - in progress
          - completed
          - reopened
          - cancelled
      completedAt:
        type: date
      findingsSummary:
        type: text
      findingsValidated:
        type: boolean
  CorrectiveAction:
    meaning: "A follow-up action identified from a review or investigation to reduce recurrence, address gaps, or improve resilience."
    aliases:
      - remediation action
      - follow-up action
      - improvement action
    properties:
      status:
        type: text
        allowed:
          - open
          - in progress
          - completed
          - overdue
          - deferred
          - cancelled
      dueAt:
        type: date
      actionSummary:
        type: text
      applicabilityCriteria:
        type: text
  RootCause:
    meaning: "The underlying confirmed or suspected reason an incident occurred or persisted."
    aliases:
      - underlying cause
      - RCA cause
      - primary cause
    properties:
      status:
        type: text
        allowed:
          - suspected
          - identified
          - confirmed
          - rejected
          - unknown
      causeCategory:
        type: text
        allowed:
          - change related
          - configuration
          - capacity
          - software defect
          - infrastructure failure
          - external dependency
          - operational error
          - unknown
      rootCauseSummary:
        type: text
      identifiedAt:
        type: date
  Backup:
    meaning: "A recoverable copy of service-related data, configuration, or system state that may be used to restore service."
    aliases:
      - restore point
      - backup copy
      - snapshot
    properties:
      status:
        type: text
        allowed:
          - successful
          - failed
          - in progress
          - expired
          - unavailable
      completedAt:
        type: date
      backupScope:
        type: text
      integrityStatus:
        type: text
        allowed:
          - not checked
          - pending
          - validated
          - failed
          - unknown
  IncidentCommander:
    meaning: "The role responsible for coordinating major incident response and leading related governance activities such as declaration management and review."
    aliases:
      - IC
      - major incident manager
      - incident lead
    properties:
      contactRoute:
        type: text
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
  Vendor:
    meaning: "An external organization that may provide support or assistance for an incident under agreed terms."
    aliases:
      - supplier
      - third party
      - external provider
    properties:
      supportStatus:
        type: text
        allowed:
          - available
          - limited availability
          - unavailable
          - escalated
          - pending response
      escalationRoute:
        type: text
      supportHours:
        type: text
  VendorManagementRepresentative:
    meaning: "The internal role responsible for coordinating communication and relationship management between the bank and a vendor during support or escalation."
    aliases:
      - vendor manager
      - supplier manager
      - third-party relationship manager
    properties:
      contactRoute:
        type: text
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
  RiskAndComplianceTeam:
    meaning: "The team that assesses compliance, regulatory, and reporting implications of an incident."
    aliases:
      - compliance team
      - risk team
      - regulatory compliance team
    properties:
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
      contactRoute:
        type: text
  ChangeManager:
    meaning: "The role responsible for overseeing emergency change governance, process compliance, and coordination."
    aliases:
      - change coordinator
      - change approver
      - emergency change manager
    properties:
      contactRoute:
        type: text
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
  IncidentResponseTeam:
    meaning: "The team actively coordinating or contributing to incident response and post-incident review activities."
    aliases:
      - response team
      - incident team
      - major incident team
    properties:
      availabilityStatus:
        type: text
        allowed:
          - available
          - busy
          - unavailable
          - off hours
          - on call
          - escalation only
      contactRoute:
        type: text
  MonitoringTool:
    meaning: "A tool that observes the IT environment and produces alerts about conditions requiring attention."
    aliases:
      - monitoring system
      - observability tool
      - monitoring platform
    properties:
      currentStatus:
        type: text
        allowed:
          - operational
          - degraded
          - disrupted
          - recovering
          - unavailable
          - retired
      environmentCoverage:
        type: text
  Regulation:
    meaning: "A formal external obligation or requirement that may define thresholds, deadlines, or conditions for incident reporting."
    aliases:
      - regulatory requirement
      - regulatory obligation
      - rule
    properties:
      reportingThresholdSummary:
        type: text
      notificationTimeLimitHours:
        type: number
  Jurisdiction:
    meaning: "A legal or regulatory context in which incident materiality and notification requirements may apply."
    aliases:
      - region
      - legal jurisdiction
      - regulatory jurisdiction
    properties:
      regulatoryContextSummary:
        type: text
  VendorAgreement:
    meaning: "An agreement with a vendor that defines support terms, escalation rights, service coverage, and response expectations."
    aliases:
      - support agreement
      - vendor contract
      - service agreement
    properties:
      status:
        type: text
        allowed:
          - active
          - inactive
          - expired
          - under review
          - retired
      supportLevel:
        type: text
        allowed:
          - standard
          - enhanced
          - premium
          - critical support
          - best effort
      escalationAllowed:
        type: boolean
      responseTimeTargetMinutes:
        type: number
  BusinessProcess:
    meaning: "A business activity or process supported by IT services and potentially affected by service disruption."
    aliases:
      - business function
      - business activity
      - business capability
    properties:
      criticality:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      currentStatus:
        type: text
        allowed:
          - operational
          - degraded
          - disrupted
          - recovering
          - unavailable
          - retired
      impactSummary:
        type: text
relationships:
  - name: affects
    from: Incident
    to: ITService
    meaning: "The incident disrupts, degrades, threatens, or otherwise impacts the IT service."
    aliases:
      - impacts
      - disrupts
      - degrades
      - affects service
  - name: relatedToAlert
    from: Incident
    to: Alert
    meaning: "The incident is associated with an alert that may provide detection or diagnostic context."
    aliases:
      - associated with alert
      - linked to alert
      - correlated with alert
  - name: contributesTo
    from: Event
    to: Incident
    meaning: "The event provides context for, contributes to, or helps explain the recognition or occurrence of the incident."
    aliases:
      - contributes to incident
      - leads to incident
      - provides context for incident
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The incident is assigned to the resolver group responsible for investigation or resolution."
    aliases:
      - routed to resolver group
      - assigned to support group
      - owned by resolver group for resolution
  - name: assignedTo
    from: Incident
    to: OnCallEngineer
    meaning: "The incident is assigned to the on-call engineer responsible for hands-on technical response."
    aliases:
      - assigned to on-call
      - handled by on-call engineer
      - routed to duty engineer
  - name: ownedBy
    from: ITService
    to: ServiceOwner
    meaning: "The IT service is accountable to the service owner for health, delivery, and governance."
    aliases:
      - service owner is
      - accountable to service owner
      - owned by IT service owner
  - name: supportedBy
    from: ITService
    to: ResolverGroup
    meaning: "The IT service is supported by the resolver group used for incident routing or resolution."
    aliases:
      - supported by support group
      - resolved by resolver group
      - routed to resolver group
  - name: hasOnCallEngineer
    from: ResolverGroup
    to: OnCallEngineer
    meaning: "The resolver group has a designated on-call engineer available for incident handling."
    aliases:
      - has on-call
      - covered by on-call engineer
      - duty engineer for group
  - name: hasApplicationOwner
    from: ITService
    to: ApplicationOwner
    meaning: "The IT service has an application owner responsible for application-specific functionality, support, and alignment."
    aliases:
      - application owner is
      - has app owner
      - application lead for service
  - name: hasTechnicalOwner
    from: ITService
    to: TechnicalOwner
    meaning: "The IT service has a technical owner responsible for engineering, maintenance, technical viability, security, or compliance input."
    aliases:
      - technical owner is
      - has tech owner
      - engineering owner for service
  - name: hasMajorIncidentDeclaration
    from: Incident
    to: MajorIncidentDeclaration
    meaning: "The incident has an associated formal declaration showing whether it is being handled as a major incident."
    aliases:
      - has MI declaration
      - major incident declared for
      - has major incident status
  - name: declaredBy
    from: MajorIncidentDeclaration
    to: IncidentCommander
    meaning: "The major incident declaration was made by the incident commander."
    aliases:
      - declared by IC
      - declared by major incident manager
      - MI declared by
  - name: managedBy
    from: MajorIncidentDeclaration
    to: IncidentCommander
    meaning: "The major incident declaration and its lifecycle are managed by the incident commander."
    aliases:
      - managed by IC
      - coordinated by incident commander
      - owned by incident commander
  - name: informedBy
    from: MajorIncidentDeclaration
    to: TechnicalOwner
    meaning: "The major incident declaration is informed by technical input from the technical owner."
    aliases:
      - informed by technical input
      - technical owner input
      - technical owner advises declaration
  - name: hasMaterialityAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: "The incident has an associated assessment that determines materiality for compliance or regulatory reporting."
    aliases:
      - has materiality review
      - has reportability assessment
      - materiality assessed for incident
  - name: assessedBy
    from: MaterialityAssessment
    to: RiskAndComplianceTeam
    meaning: "The materiality assessment is performed or contributed to by the risk and compliance team."
    aliases:
      - reviewed by compliance team
      - assessed by risk team
      - performed by regulatory compliance team
  - name: determinesNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: "The materiality assessment determines whether a regulatory notification is required or should be created."
    aliases:
      - determines regulatory report
      - drives regulatory notification
      - determines reportability
  - name: hasRegulatoryNotification
    from: Incident
    to: RegulatoryNotification
    meaning: "The incident has an associated regulatory notification required, prepared, or sent in relation to the incident."
    aliases:
      - has regulatory report
      - has compliance notification
      - regulatory filing for incident
  - name: considersRegulation
    from: MaterialityAssessment
    to: Regulation
    meaning: "The materiality assessment considers the regulation when evaluating reporting obligations."
    aliases:
      - considers regulatory requirement
      - evaluates regulatory obligation
      - checks regulation
  - name: appliesInJurisdiction
    from: MaterialityAssessment
    to: Jurisdiction
    meaning: "The materiality assessment is evaluated within the context of a jurisdiction."
    aliases:
      - assessed in jurisdiction
      - applies in region
      - evaluated for regulatory jurisdiction
  - name: requiredByRegulation
    from: RegulatoryNotification
    to: Regulation
    meaning: "The regulatory notification is required by or based on a regulation."
    aliases:
      - required by regulatory obligation
      - mandated by regulation
      - required by rule
  - name: appliesInJurisdiction
    from: RegulatoryNotification
    to: Jurisdiction
    meaning: "The regulatory notification applies within the specified jurisdiction."
    aliases:
      - applies in region
      - required in jurisdiction
      - relevant to regulatory jurisdiction
  - name: linkedTo
    from: Incident
    to: ConfigurationItem
    meaning: "The incident is associated with a configuration item without necessarily implying the item caused or was directly affected by the incident."
    aliases:
      - associated with CI
      - linked to asset
      - connected to configuration item
  - name: dependsOn
    from: ITService
    to: ConfigurationItem
    meaning: "The IT service depends on the configuration item for operation or delivery."
    aliases:
      - depends on CI
      - relies on configuration item
      - uses managed component
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: "The known error has an associated workaround that may reduce impact or support service restoration."
    aliases:
      - has temporary fix
      - has mitigation
      - workaround available for known error
  - name: appliesToIncident
    from: KnownError
    to: Incident
    meaning: "The known error is relevant to or applicable to the incident."
    aliases:
      - known error applies
      - known issue relevant to incident
      - documented error matches incident
  - name: appliesToIncident
    from: Workaround
    to: Incident
    meaning: "The workaround is relevant to or applicable to the incident, whether or not it is tied to a known error."
    aliases:
      - workaround applies
      - mitigation applies to incident
      - temporary fix relevant to incident
  - name: hasRecoveryPlan
    from: ITService
    to: RecoveryPlan
    meaning: "The IT service has an associated recovery plan describing how it can be restored."
    aliases:
      - has restoration plan
      - has service recovery plan
      - recovery procedure for service
  - name: includesStep
    from: RecoveryPlan
    to: RecoveryStep
    meaning: "The recovery plan includes the recovery step as part of its ordered recovery guidance."
    aliases:
      - includes recovery task
      - contains restoration step
      - has recovery instruction
  - name: hasRecoveryStep
    from: ITService
    to: RecoveryStep
    meaning: "The IT service has a recovery step directly available for operational recovery guidance."
    aliases:
      - has recovery task
      - has restoration step
      - recovery instruction for service
  - name: contributesTo
    from: Change
    to: Incident
    meaning: "The change may have contributed to the occurrence, impact, or persistence of the incident."
    aliases:
      - change contributed to incident
      - change may have caused incident
      - change linked to incident
  - name: executedFor
    from: EmergencyChange
    to: Incident
    meaning: "The emergency change is executed in response to or in support of resolving the incident."
    aliases:
      - urgent change for incident
      - emergency change performed for incident
      - expedited change to resolve incident
  - name: recordedAs
    from: EmergencyChange
    to: Change
    meaning: "The emergency change is connected to a broader change record without treating emergency change as a subtype in the model."
    aliases:
      - recorded as change record
      - linked to change request
      - captured as change
  - name: overseenBy
    from: EmergencyChange
    to: ChangeManager
    meaning: "The emergency change process is overseen or coordinated by the change manager."
    aliases:
      - overseen by change coordinator
      - managed by change manager
      - coordinated by emergency change manager
  - name: hasBackup
    from: ITService
    to: Backup
    meaning: "The IT service has an associated backup that may be used for restoration."
    aliases:
      - has restore point
      - has backup copy
      - backup available for service
  - name: hasEvidenceItem
    from: Incident
    to: EvidenceItem
    meaning: "The incident has an associated evidence item collected or attached for investigation, governance, review, or reporting."
    aliases:
      - has evidence
      - evidence attached to incident
      - supporting record for incident
  - name: hasIntegrityCheck
    from: EvidenceItem
    to: EvidenceIntegrityCheck
    meaning: "The evidence item has an associated integrity check validating its reliability or integrity status."
    aliases:
      - has integrity validation
      - evidence validation record
      - chain-of-custody check for evidence
  - name: hasRootCause
    from: Incident
    to: RootCause
    meaning: "The incident has an associated root cause record describing the confirmed or suspected underlying cause."
    aliases:
      - root cause identified for incident
      - has underlying cause
      - RCA cause for incident
  - name: hasPostIncidentReview
    from: Incident
    to: PostIncidentReview
    meaning: "The incident has an associated post-incident review documenting findings, lessons, and follow-up actions."
    aliases:
      - has PIR
      - has post-mortem
      - incident review for incident
  - name: identifiesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: "The post-incident review identifies a corrective action to address gaps, reduce recurrence, or improve resilience."
    aliases:
      - identifies remediation action
      - raises follow-up action
      - creates improvement action
  - name: appliesToIncident
    from: CorrectiveAction
    to: Incident
    meaning: "The corrective action is relevant to or applicable to the incident, including actions identified from previous reviews."
    aliases:
      - corrective action applies
      - remediation relevant to incident
      - follow-up action applicable to incident
  - name: ledBy
    from: PostIncidentReview
    to: IncidentCommander
    meaning: "The post-incident review is led by the incident commander."
    aliases:
      - PIR led by IC
      - review led by incident commander
      - post-incident review owned by incident lead
  - name: involvesTeam
    from: PostIncidentReview
    to: IncidentResponseTeam
    meaning: "The post-incident review involves the incident response team as contributors or participants."
    aliases:
      - involves response team
      - incident team participates in review
      - major incident team contributes to PIR
  - name: handledByTeam
    from: Incident
    to: IncidentResponseTeam
    meaning: "The incident is actively handled by the incident response team during response."
    aliases:
      - handled by response team
      - managed by incident team
      - major incident team handling incident
  - name: hasStakeholderCommunication
    from: Incident
    to: StakeholderCommunication
    meaning: "The incident has an associated communication record sent or prepared for stakeholders."
    aliases:
      - has stakeholder update
      - has incident communication
      - status communication for incident
  - name: sentTo
    from: StakeholderCommunication
    to: Stakeholder
    meaning: "The stakeholder communication is sent to or intended for the stakeholder."
    aliases:
      - sent to recipient
      - communicated to stakeholder
      - update sent to impacted party
  - name: involvesStakeholder
    from: Incident
    to: Stakeholder
    meaning: "The incident directly involves a stakeholder who is affected, engaged, or needs awareness."
    aliases:
      - involves impacted party
      - stakeholder involved in incident
      - interested party for incident
  - name: supportsBusinessProcess
    from: ITService
    to: BusinessProcess
    meaning: "The IT service supports the business process and may affect it during service disruption."
    aliases:
      - supports business function
      - enables business activity
      - supports business capability
  - name: ownedBy
    from: BusinessProcess
    to: BusinessServiceOwner
    meaning: "The business process is accountable to the business service owner."
    aliases:
      - owned by business owner
      - accountable to business service owner
      - business process owner is
  - name: involvesBusinessServiceOwner
    from: Incident
    to: BusinessServiceOwner
    meaning: "The incident directly involves a business service owner when business impact or ownership input is needed."
    aliases:
      - involves business owner
      - business service owner engaged
      - business process owner involved in incident
  - name: producesAlert
    from: MonitoringTool
    to: Alert
    meaning: "The monitoring tool produces the alert from observations of the IT environment."
    aliases:
      - generates alert
      - raises monitoring alert
      - monitoring system produced alert
  - name: escalatedTo
    from: Incident
    to: Vendor
    meaning: "The incident is escalated to the vendor for external support or assistance."
    aliases:
      - escalated to supplier
      - sent to third party
      - vendor engaged for incident
  - name: coordinatedBy
    from: Vendor
    to: VendorManagementRepresentative
    meaning: "Vendor interactions are coordinated by the vendor management representative."
    aliases:
      - coordinated by vendor manager
      - managed by supplier manager
      - third-party relationship manager coordinates vendor
  - name: escalationCoordinatedBy
    from: Incident
    to: VendorManagementRepresentative
    meaning: "The incident’s vendor escalation is coordinated by the vendor management representative."
    aliases:
      - vendor escalation coordinated by
      - incident escalation managed by vendor manager
      - third-party escalation coordinated by representative
  - name: hasAgreement
    from: Vendor
    to: VendorAgreement
    meaning: "The vendor has an agreement defining support terms, escalation rights, or response expectations."
    aliases:
      - has support agreement
      - has vendor contract
      - has service agreement
  - name: coveredByAgreement
    from: ITService
    to: VendorAgreement
    meaning: "The IT service is covered by a vendor agreement that may affect escalation eligibility or support terms."
    aliases:
      - covered by support agreement
      - service covered by vendor contract
      - service agreement covers IT service
rules:
  - name: canDeclareMajorIncident
    conditions:
      - Incident severity is major or critical.
      - Incident impact is high or critical.
      - Affected IT Service criticality is high or critical, or affected Business Process criticality is high or critical.
      - Major Incident Declaration criteriaMet is true.
      - Incident Commander is available, on call, or escalation only.
      - Technical Owner input is available or has been requested.
  - name: canAssignIncidentToResolverGroup
    conditions:
      - Incident affects at least one IT Service.
      - The affected IT Service is supported by a Resolver Group.
      - Resolver Group availabilityStatus is not unavailable.
      - Resolver Group currentWorkload is within an acceptable threshold for taking new work.
      - Incident status is new, acknowledged, or assigned.
  - name: canExecuteEmergencyChange
    conditions:
      - Emergency Change is executed for an Incident.
      - Emergency Change authorizationStatus is authorized.
      - Emergency Change status is authorized or executing.
      - Emergency Change riskLevel has been assessed.
      - Change Manager is available, on call, or escalation only.
      - Incident status is not closed or cancelled.
  - name: canAcknowledgeAlert
    conditions:
      - Alert status is new.
      - Alert is produced by a Monitoring Tool.
      - Monitoring Tool currentStatus is not retired or unavailable.
      - Alert has an alertId.
      - Alert has not already been acknowledged or closed.
  - name: requiresMaterialityAssessment
    conditions:
      - Incident severity is major or critical, or Incident impact is high or critical.
      - Affected IT Service criticality is high or critical, or affected Business Process criticality is high or critical.
      - Incident applies in, or is relevant to, at least one Jurisdiction.
      - At least one applicable Regulation is known or must be considered.
      - Materiality Assessment status is not started, in progress, or reopened.
  - name: requiresRegulatoryNotification
    conditions:
      - Materiality Assessment status is completed.
      - Materiality Assessment materialityOutcome is material or potentially material.
      - Regulatory Notification is determined by the Materiality Assessment.
      - Regulatory Notification status is required, drafting, overdue, or not yet created.
      - Applicable Regulation and Jurisdiction are identified.
  - name: canSendStakeholderCommunication
    conditions:
      - Incident has at least one involved Stakeholder or Business Service Owner.
      - Stakeholder Communication status is approved.
      - Stakeholder Communication has a communication channel.
      - Stakeholder Communication has a message summary or prepared message content.
      - Incident status is not cancelled, unless the communication is specifically a cancellation or stand-down update.
  - name: canRestoreServiceFromBackup
    conditions:
      - Incident affects an IT Service.
      - IT Service has at least one Backup.
      - Selected Backup status is successful.
      - Selected Backup integrityStatus is validated.
      - Selected Backup is the latest successful backup for the affected IT Service.
      - Incident status is not closed or cancelled.
      - Recovery Plan status is active, or approved recovery guidance is available.
  - name: canValidateEvidenceIntegrity
    conditions:
      - Incident has at least one Evidence Item.
      - Evidence Item status is collected or pending validation.
      - Evidence Integrity Check has a check method.
      - Evidence Integrity Check status is pending or in progress.
      - Evidence Item integrityStatus is not already validated or failed.
  - name: canDocumentPostIncidentReviewFindings
    conditions:
      - Incident has a Post-Incident Review.
      - Post-Incident Review status is in progress or reopened.
      - Post-Incident Review has a findings summary.
      - Incident Commander is available, on call, or escalation only.
      - Incident Response Team is available or has contributed input.
      - Post-Incident Review findingsValidated is true before marking the review completed.
  - name: canCloseIncident
    conditions:
      - Incident status is resolved or mitigated.
      - Incident resolutionConfirmed is true.
      - Incident stakeholderCommunicationConfirmed is true.
      - No required Regulatory Notification is still required, drafting, or overdue.
      - Any required Materiality Assessment is completed or cancelled.
      - Any active Major Incident Declaration is stood down, closed, or cancelled.
      - No recovery-critical Recovery Step is failed or blocked.
      - Closure communication has been sent or stakeholder communication confirmation is true.
actions:
  - name: recordNewIncident
    input: Incident
    preconditions:
      - Basic required incident details are present.
    effect: A new Incident record is created with initial status, priority, impact, urgency if known, opened time, and any linked alert, event, IT service, or configuration item available at creation.
    verification: Retrieve the Incident and confirm it exists with status new or acknowledged.
  - name: acknowledgeAlert
    input: Alert
    preconditions:
      - canAcknowledgeAlert rule is satisfied.
    effect: Alert status becomes acknowledged, and acknowledgedAt is recorded.
    verification: Retrieve the Alert and confirm status is acknowledged and acknowledgedAt is populated.
  - name: assignIncidentToResolverGroup
    input: Incident
    preconditions:
      - canAssignIncidentToResolverGroup rule is satisfied.
    effect: Incident is assigned to the selected Resolver Group, and where applicable the On-Call Engineer is identified or assigned.
    verification: Retrieve the Incident and confirm it has an assignedTo Resolver Group relationship; if on-call assignment is required, confirm it also has an assignedTo On-Call Engineer relationship.
  - name: declareMajorIncident
    input: Incident
    preconditions:
      - canDeclareMajorIncident rule is satisfied.
    effect: Major Incident Declaration status becomes active, declaredAt is recorded, the declaration is linked to the Incident, and declaration responsibility is linked to the Incident Commander.
    verification: Retrieve the Major Incident Declaration and confirm status is active, declaredAt is populated, and it is linked to the relevant Incident and Incident Commander.
  - name: sendStakeholderCommunication
    input: StakeholderCommunication
    preconditions:
      - canSendStakeholderCommunication rule is satisfied.
    effect: Stakeholder Communication status becomes sent, sentAt is recorded, and communication is delivered through the selected communicationChannel to linked Stakeholders.
    verification: Retrieve the Stakeholder Communication and confirm status is sent, sentAt is populated, and intended Stakeholders are linked through sentTo.
  - name: conductMaterialityAssessment
    input: MaterialityAssessment
    preconditions:
      - requiresMaterialityAssessment rule is satisfied.
    effect: Materiality Assessment status is updated, materialityOutcome and assessmentRationale are recorded, and any determined Regulatory Notification is linked.
    verification: Retrieve the Materiality Assessment and confirm status is completed or in progress, outcome and rationale are populated as appropriate, and any determined Regulatory Notification is linked.
  - name: executeEmergencyChange
    input: EmergencyChange
    preconditions:
      - canExecuteEmergencyChange rule is satisfied.
    effect: Emergency Change status becomes executing or completed, executedAt is recorded when executed, and the Emergency Change remains linked to the Incident and broader Change record.
    verification: Retrieve the Emergency Change and confirm status is executing or completed, executedAt is populated when completed, and it remains linked to the relevant Incident and Change record.
  - name: restoreServiceFromLatestSuccessfulBackup
    input: ITService
    preconditions:
      - canRestoreServiceFromBackup rule is satisfied.
    effect: The affected IT Service is restored using the latest successful validated Backup, recovery progress is reflected in service and incident status, and relevant Recovery Steps are updated as completed, failed, skipped, or blocked.
    verification: Retrieve the IT Service and confirm currentStatus is operational or recovering; retrieve the selected Backup and confirm it was the latest successful validated backup; retrieve relevant Recovery Steps and confirm statuses reflect execution.
  - name: validateAndDocumentPostIncidentReviewFindings
    input: PostIncidentReview
    preconditions:
      - canDocumentPostIncidentReviewFindings rule is satisfied.
    effect: Post-Incident Review findings are documented, findingsValidated becomes true, review status is updated, and any identified Corrective Actions are linked.
    verification: Retrieve the Post-Incident Review and confirm findingsSummary is populated, findingsValidated is true, status is updated appropriately, and any Corrective Actions are linked.
  - name: closeIncident
    input: Incident
    preconditions:
      - canCloseIncident rule is satisfied.
    effect: Incident status becomes closed, closedAt is recorded, and closure is retained with confirmation that resolution and stakeholder communication were completed.
    verification: Retrieve the Incident and confirm status is closed, closedAt is populated, resolutionConfirmed is true, and stakeholderCommunicationConfirmed is true.