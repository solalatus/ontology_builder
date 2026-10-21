classes:
  Incident:
    meaning: "An incident is the managed response to an unplanned interruption, degradation, or security condition."
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
      majorIncidentDesignation:
        type: boolean
      cybersecurityIncidentDesignation:
        type: boolean
      majorIncidentDeclarationTime:
        type: date
      closedAt:
        type: date

  Alert:
    meaning: "An alert is a signal requiring triage or acknowledgement that may lead to an incident."
    aliases:
      - riasztás
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      acknowledgementTime:
        type: date

  Event:
    meaning: "An event is an observed occurrence."
    aliases:
      - esemény

  ITService:
    meaning: "An IT service is a managed technology capability whose impact, owner, and recovery arrangements can be established."
    aliases:
      - technology service
      - informatikai szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially unavailable
          - unavailable
          - recovering
          - unknown

  BusinessService:
    meaning: "A business service is a customer- or business-facing capability."
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially unavailable
          - unavailable
          - recovering
          - unknown

  CustomerChannel:
    meaning: "A customer channel is a way customers access a business service."
    aliases:
      - ügyfélcsatorna

  ConfigurationItem:
    meaning: "A configuration item is a managed component in configuration-management scope."
    aliases:
      - CI
      - konfigurációs elem

  Environment:
    meaning: "An environment is a deployment context, such as production or disaster recovery."
    aliases:
      - környezet

  ServiceOwner:
    meaning: "A service owner is accountable for an IT service across its lifecycle."
    aliases:
      - szolgáltatásgazda

  ResolverGroup:
    meaning: "A resolver group is a team assigned to diagnose and restore an incident."
    aliases:
      - support group
      - megoldócsoport

  OnCallEngineer:
    meaning: "An on-call engineer is a resolver-group member who may handle a time-critical response."
    aliases:
      - on-call
      - ügyeletes mérnök

  IncidentCommander:
    meaning: "An incident commander commands a major incident's coordination and decision cadence."
    aliases:
      - incident manager
      - major-incident lead
      - incidensparancsnok

  Runbook:
    meaning: "A runbook is a maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - playbook
      - üzemeltetési eljárás

  Workaround:
    meaning: "A workaround is a temporary way to reduce or bypass an incident's impact."
    aliases:
      - kerülőmegoldás

  RecoveryPlan:
    meaning: "A recovery plan describes how to restore an IT service and its dependencies."
    aliases:
      - DR plan
      - helyreállítási terv
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date

  BackupSet:
    meaning: "A backup set is a defined collection of recoverable data that can protect configuration items."
    aliases:
      - backup
      - mentéskészlet
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

  MaterialityAssessment:
    meaning: "A materiality assessment records an incident's significance, rationale, and reporting implication."
    aliases:
      - reportability assessment
      - lényegességi értékelés
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
      assessedAt:
        type: date

  RegulatoryNotification:
    meaning: "A regulatory notification is a formal submission about an incident to a regulator."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
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
      dueTime:
        type: date
      submittedTime:
        type: date

  Communication:
    meaning: "A communication is a message addressed to an appropriate stakeholder."
    aliases:
      - stakeholder communication
      - notification
      - értesítés
      - tájékoztatás
    properties:
      audience:
        type: text
      messageSummary:
        type: text
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
      sentTime:
        type: date

  PostIncidentReview:
    meaning: "A post-incident review is a structured review of causes, response, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date

  EmergencyChange:
    meaning: "An emergency change is an accelerated change executed to address an incident."
    aliases:
      - emergency fix
      - sürgősségi változás
    properties:
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
          - rolled back
          - closed
          - cancelled
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      implementationPlan:
        type: text
      backoutPlan:
        type: text

  EvidenceItem:
    meaning: "An evidence item is a preserved record or artifact documenting an incident."
    aliases:
      - incident evidence
      - evidence
      - bizonyíték
    properties:
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      collectedAt:
        type: date
      cryptographicHash:
        type: text

  Stakeholder:
    meaning: "A stakeholder is an identifiable recipient of a communication."
    aliases:
      - érintett

  Regulator:
    meaning: "A regulator is the authority receiving a regulatory notification."
    aliases:
      - supervisory authority
      - felügyeleti hatóság

  Problem:
    meaning: "A problem is the underlying or potential cause of one or more incidents."
    aliases:
      - probléma
    properties:
      status:
        type: text
        allowed:
          - new
          - investigating
          - root cause known
          - known error
          - resolved
          - closed

  KnownError:
    meaning: "A known error is a diagnosed problem with a documented cause or workaround."
    aliases:
      - ismert hiba

relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: "An incident impacts an IT service confirmed as affected."
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "An incident directly affects a configuration item, rather than every item on a dependency path."
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "An incident impacts a business service confirmed as affected."
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: "A business service depends on an IT service, although that dependency alone does not establish incident impact."
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: "A business service is delivered through a customer channel, although delivery alone does not establish disruption."
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: "An incident is triggered by the alert that prompted its managed response."
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: "An incident is correlated from events established as observations relevant to its investigation."
  - name: indicates
    from: Alert
    to: Event
    meaning: "An alert indicates an observed event."
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: "An on-call engineer is a member of a resolver group, although membership does not establish current duty or incident handling."
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "An incident is assigned to the resolver group recorded as taking responsibility for its response."
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "An incident is handled by the on-call engineer who actually takes the case."
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: "A service owner owns an IT service across its lifecycle."
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: "An incident is coordinated by its assigned incident commander."
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: "A recovery plan describes recovery of an IT service."
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "An incident is recovered with the recovery plan actually used for the case."
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: "A recovery plan uses a backup set in its recovery arrangements."
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: "A backup set protects a configuration item that may be a restore target."
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: "An IT service is deployed in an environment that establishes its operating context."
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: "A configuration item belongs to an environment that establishes its operating context."
  - name: isHandledWith
    from: Incident
    to: Runbook
    meaning: "An incident is handled with a runbook actually used for the case."
  - name: isDocumentedIn
    from: Workaround
    to: Runbook
    meaning: "A workaround is documented in a maintained runbook."
  - name: isLinkedTo
    from: Incident
    to: Problem
    meaning: "An incident is linked to a problem relevant to its underlying or potential cause."
  - name: isDocumentedBy
    from: Problem
    to: KnownError
    meaning: "A problem is documented by a known error when it has been diagnosed."
  - name: has
    from: KnownError
    to: Workaround
    meaning: "A known error has a documented workaround that may be considered for an incident."
  - name: affects
    from: KnownError
    to: ConfigurationItem
    meaning: "A known error affects a configuration item that can be checked against the incident's affected items."
  - name: isEvaluatedBy
    from: Incident
    to: MaterialityAssessment
    meaning: "An incident is evaluated by a materiality assessment that records its reporting conclusion."
  - name: triggers
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: "A materiality assessment triggers a regulatory notification when its conclusion calls for reporting."
  - name: isSentTo
    from: RegulatoryNotification
    to: Regulator
    meaning: "A regulatory notification identifies the regulator to which it is sent."
  - name: reports
    from: RegulatoryNotification
    to: Incident
    meaning: "A regulatory notification reports the incident identified in the formal submission."
  - name: isCommunicatedThrough
    from: Incident
    to: Communication
    meaning: "An incident is communicated through a communication whose completion must be checked separately."
  - name: isSupportedBy
    from: Incident
    to: EvidenceItem
    meaning: "An incident is supported by linked evidence items whose contents can substantiate resolution or restoration."
  - name: isReviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: "An incident is reviewed in a post-incident review that may be scheduled before it is held."
  - name: isAddressedTo
    from: Communication
    to: Stakeholder
    meaning: "A communication is addressed to its intended stakeholder recipient."
  - name: isJustifiedBy
    from: EmergencyChange
    to: Incident
    meaning: "An emergency change is justified by the incident it addresses."
  - name: modifies
    from: EmergencyChange
    to: ConfigurationItem
    meaning: "An emergency change modifies an identified configuration item."

rules:
  - name: canAcknowledgeAlert
    conditions:
      - "The alert's status is new."
      - "The proposed responsible resolver group and the operator's authorization for it have been verified against the bank's responsible-group arrangements."
  - name: canAssignIncidentToResolverGroup
    conditions:
      - "The incident has a valid status other than closed or cancelled."
      - "The incident impacts an IT service or directly affects a configuration item."
      - "The proposed resolver group is confirmed through authoritative support arrangements to support at least one of those affected objects."
  - name: canDeclareMajorIncident
    conditions:
      - "The incident has a valid status other than resolved, closed, or cancelled."
      - "The incident's severity is sev1-critical or sev2-high."
      - "The incident impacts at least one IT service."
      - "An incident commander is assigned to coordinate the incident."
  - name: canContainIncident
    conditions:
      - "The incident's status is acknowledged or investigating."
      - "The proposed containment scope and expected side effects have been recorded."
      - "The containment steps to be executed have been approved."
  - name: canFailOverITService
    conditions:
      - "The recovery plan applies to an IT service impacted by the incident."
      - "The supplied recovery environment is available for the proposed move."
      - "The data-recovery point is acceptable under the bank's approved recovery procedure."
  - name: canRestoreBackupSet
    conditions:
      - "The backup set's status is successful or verified."
      - "The backup set protects the specific configuration item approved as the restore target."
      - "The restore point and target environment are approved for this restore."
  - name: canExecuteEmergencyChange
    conditions:
      - "The emergency change is linked to an incident confirmed as active."
      - "Its implementation plan and backout plan are present."
      - "The configuration items it will affect are identified."
      - "Its status and assessed risk level have been established."
      - "Its risk has been explicitly accepted; neither its risk level nor an approved status establishes that acceptance."
  - name: canSendCommunication
    conditions:
      - "The communication's audience, message, owner, and approval state have been recorded."
      - "The full message matches the latest verified incident state."
  - name: canSubmitRegulatoryNotification
    conditions:
      - "The linked materiality assessment's result is reportable."
      - "The notification identifies both the incident it reports and its receiving regulator."
      - "Required information and supporting evidence are complete."
      - "The notification's status is approved."
      - "Submission will occur before the notification's due time."
  - name: canCloseIncident
    conditions:
      - "The incident's status is resolved or monitoring."
      - "Recorded evidence supports both resolution and restoration."
      - "Every impacted IT service and business service is healthy, or its remaining condition has been explicitly accepted for closure."
      - "Required stakeholder communications are complete."
      - "If the incident is designated major or cybersecurity, its post-incident review is verified as scheduled or completed through the review arrangements; a review link alone is insufficient."

actions:
  - name: acknowledgeAlert
    input: Alert
    preconditions:
      - "canAcknowledgeAlert passes."
    effect: "Set the alert's status to acknowledged and record its acknowledgement time."
    verification: "Read the alert back and confirm its acknowledged status and recorded acknowledgement time."

  - name: assignIncidentToResolverGroup
    input: Incident
    preconditions:
      - "canAssignIncidentToResolverGroup passes."
    effect: "Record the incident as assigned to the proposed resolver group without implying that an on-call engineer has been assigned."
    verification: "Read the incident back and confirm that the proposed resolver group is recorded as its assigned group."

  - name: declareMajorIncident
    input: Incident
    preconditions:
      - "canDeclareMajorIncident passes."
    effect: "Set the major-incident designation, record the declaration time, and start major-incident coordination and communication cadence."
    verification: "Read back the designation, declaration time, and commander, and confirm that coordination and communication cadence has started without treating a communication link as proof of a sent message."

  - name: containIncident
    input: Incident
    preconditions:
      - "canContainIncident passes."
    effect: "Execute the approved containment steps and set the incident's status to contained only after containment has been verified."
    verification: "Check containment indicators and remaining service impact, including affected configuration items in the recorded scope, then read back the contained status."

  - name: failOverAffectedITService
    input: Incident
    preconditions:
      - "canFailOverITService passes for the impacted IT service, applicable recovery plan, and supplied target environment."
    effect: "Move the impacted IT service's workload to the checked recovery environment and record the recovery plan actually used."
    verification: "Confirm the service's health, critical business transactions, and actual deployment environment after the move, and retain the verification results."

  - name: restoreDataFromBackupSet
    input: BackupSet
    preconditions:
      - "canRestoreBackupSet passes for the specific approved target, restore point, and environment."
      - "The incident prompting this restore is supplied with the restore decision rather than inferred from the backup set."
    effect: "Restore data to the specific approved configuration item and retain restoration results as evidence supporting the supplied incident."
    verification: "Validate data integrity and application functionality at that target and confirm the restoration evidence has been retained."

  - name: executeEmergencyChange
    input: EmergencyChange
    preconditions:
      - "canExecuteEmergencyChange passes."
    effect: "Execute the implementation plan and update the change's status to its actual outcome, such as implemented, failed, or rolled back."
    verification: "Check the technical result and affected service health, read back the actual change status, and retain implementation evidence."

  - name: sendCommunication
    input: Incident
    preconditions:
      - "canSendCommunication passes for the communication identified for this incident."
    effect: "Send the checked message to its intended stakeholder and record the communication's sent time."
    verification: "Confirm delivery and archive the final message; a sent time alone does not prove delivery."

  - name: submitRegulatoryNotification
    input: RegulatoryNotification
    preconditions:
      - "canSubmitRegulatoryNotification passes."
    effect: "Submit the notification, set its status to submitted, record its submitted time, and retain the submission receipt."
    verification: "Confirm the submitted status, time, and receipt, then separately confirm the authority's acceptance or record rejection and the required follow-up."

  - name: closeIncident
    input: Incident
    preconditions:
      - "canCloseIncident passes."
    effect: "Set the incident's status to closed and record its closed-at time."
    verification: "Read back the closed status and closed-at time, and check the linked services and retained evidence supporting both resolution and restoration."