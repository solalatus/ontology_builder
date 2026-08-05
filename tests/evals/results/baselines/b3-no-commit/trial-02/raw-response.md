classes:
  Incident:
    meaning: "An operational disruption, degradation, or event requiring investigation, coordination, or restoration activity."
    aliases: []
    properties:
      incidentReference:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
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
      scenarioType:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - security
          - incident response
          - change management
          - recovery
          - compliance
      impactSummary:
        type: text
      detectedAt:
        type: date
      resolvedAt:
        type: date
      resolutionTarget:
        type: number
      majorIncidentCandidate:
        type: boolean
      regulatoryNotificationRequired:
        type: boolean
  "Major Incident":
    meaning: "A formally declared incident requiring enhanced coordination, dedicated command roles, structured communications, and post-incident governance."
    aliases:
      - MI
    properties:
      status:
        type: text
        allowed:
          - declared
          - in-progress
          - under-review
          - resolved
          - closed
      declaredAt:
        type: date
      declarationRationale:
        type: text
  "IT Service":
    meaning: "A technology service operated or governed by the bank that supports business services, customer channels, or operational processes."
    aliases: []
    properties:
      serviceName:
        type: text
      criticality:
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
      regulatedService:
        type: boolean
      residualConditionAccepted:
        type: boolean
  "Business Service":
    meaning: "A business capability or service outcome that may be affected by disruption to supporting technology services."
    aliases: []
    properties:
      businessServiceName:
        type: text
      criticality:
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
      regulatedService:
        type: boolean
      residualConditionAccepted:
        type: boolean
  "Customer Channel":
    meaning: "A customer-facing access route or interaction channel through which business services are delivered."
    aliases: []
    properties:
      channelName:
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
      residualConditionAccepted:
        type: boolean
  "Infrastructure Component":
    meaning: "A technical component or platform element that supports an IT service and has criticality and health state."
    aliases: []
    properties:
      componentName:
        type: text
      criticality:
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
  "Third-Party Service":
    meaning: "An external service provided by a third party that depends on or interacts with the bank’s IT services."
    aliases: []
    properties:
      serviceName:
        type: text
      criticality:
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
  "Configuration Item":
    meaning: "A managed item that must be identified for incident impact analysis or emergency change control."
    aliases: []
    properties:
      configurationItemName:
        type: text
      criticality:
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
  "Service Owner":
    meaning: "The accountable owner responsible for the overall governance, performance, and business alignment of an IT service."
    aliases: []
    properties:
      ownerName:
        type: text
  "Application Owner":
    meaning: "The role responsible for the operational fitness and business functionality of an application supporting an IT service."
    aliases: []
    properties:
      ownerName:
        type: text
  "Technical Owner":
    meaning: "The role responsible for the engineering, maintenance, and technical performance of an IT service or supporting application."
    aliases: []
    properties:
      ownerName:
        type: text
  "Resolver Group":
    meaning: "A support group responsible for investigating, resolving, or coordinating resolution of incidents within a defined support scope."
    aliases: []
    properties:
      groupName:
        type: text
      supportScope:
        type: text
      contactChannel:
        type: text
  "On-call Engineer":
    meaning: "The individual currently assigned to provide immediate hands-on technical response for a resolver group."
    aliases: []
    properties:
      engineerName:
        type: text
      onCallStatus:
        type: text
        allowed:
          - active
          - inactive
          - unavailable
      contactChannel:
        type: text
  "Incident Commander":
    meaning: "The role with overall command authority for coordinating a major incident response."
    aliases: []
    properties:
      commanderName:
        type: text
      contactChannel:
        type: text
  "Incident Response Team Lead":
    meaning: "The tactical coordination role responsible for managing response activities during an incident."
    aliases: []
    properties:
      leadName:
        type: text
      contactChannel:
        type: text
  Stakeholder:
    meaning: "A person or group that needs to receive information, provide input, or make decisions related to an incident."
    aliases: []
    properties:
      stakeholderName:
        type: text
      stakeholderType:
        type: text
        allowed:
          - internal
          - external
  "Business Service User":
    meaning: "A business-side user group or user population that relies on a business service and may be affected by incidents."
    aliases: []
    properties:
      userGroupName:
        type: text
  "Department Head":
    meaning: "A senior business representative responsible for priorities or decisions for a department affected by a service disruption."
    aliases: []
    properties:
      departmentHeadName:
        type: text
  "Regulatory-Reporting Owner":
    meaning: "The accountable owner responsible for coordinating the regulatory-notification workflow for an incident."
    aliases: []
    properties:
      ownerName:
        type: text
  "Compliance Officer":
    meaning: "The role responsible for reviewing incident handling or notification content against applicable compliance obligations."
    aliases: []
    properties:
      officerName:
        type: text
  "Risk Management Team Member":
    meaning: "A risk-management role contributing risk assessment input to incident materiality or regulatory-reporting decisions."
    aliases: []
    properties:
      memberName:
        type: text
  Alert:
    meaning: "A detected signal or notification indicating a condition that may relate to or contribute to an incident."
    aliases: []
    properties:
      alertReference:
        type: text
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      detectedAt:
        type: date
  "Materiality Assessment":
    meaning: "An assessment of an incident’s significance used to support major-incident and regulatory-reporting decisions."
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - draft
          - in-progress
          - completed
          - under-review
      outcome:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      completedAt:
        type: date
  "Regulatory Notification":
    meaning: "A formal notification record prepared or submitted to meet regulatory reporting obligations for an incident."
    aliases: []
    properties:
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
      submittedAt:
        type: date
      deadlineAt:
        type: date
  "Stakeholder Communication":
    meaning: "A message or communication record sent to stakeholders about an incident’s status, impact, response, or recovery."
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - draft
          - approved
          - sent
          - cancelled
      sentAt:
        type: date
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
      messageSummary:
        type: text
  Evidence:
    meaning: "Information or artefacts collected to support incident investigation, audit, regulatory reporting, or post-incident review."
    aliases: []
    properties:
      evidenceReference:
        type: text
      evidenceType:
        type: text
        allowed:
          - witness statement
          - system log
          - email correspondence
          - document
          - artifact
      collectedAt:
        type: date
      verificationStatus:
        type: text
        allowed:
          - recorded
          - verified
          - rejected
  "Post-Incident Review":
    meaning: "A structured review of an incident after response activities to identify causes, lessons, and follow-up actions."
    aliases:
      - PIR
    properties:
      status:
        type: text
        allowed:
          - new
          - in-progress
          - completed
          - reviewed
      completedAt:
        type: date
  "Corrective Action":
    meaning: "A follow-up action created to address findings or prevent recurrence after an incident or post-incident review."
    aliases: []
    properties:
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
  Workaround:
    meaning: "A temporary mitigation used to reduce incident impact before full restoration or permanent correction."
    aliases: []
    properties:
      workaroundName:
        type: text
      status:
        type: text
        allowed:
          - approved
          - in-development
          - deprecated
          - active
      effectSummary:
        type: text
  "Incident Management Procedure":
    meaning: "A governed procedure describing required steps or protocols for managing incidents of a given scenario."
    aliases: []
    properties:
      procedureName:
        type: text
      scenarioType:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - security
          - incident response
          - change management
          - recovery
          - compliance
  Runbook:
    meaning: "Detailed operational instructions or task steps used to execute a specific response or recovery activity."
    aliases: []
    properties:
      runbookName:
        type: text
      scenarioType:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - security
          - incident response
          - change management
          - recovery
          - compliance
  "Recovery Plan":
    meaning: "A planned set of recovery activities used to restore affected services or capabilities after an incident."
    aliases: []
    properties:
      planName:
        type: text
      status:
        type: text
        allowed:
          - draft
          - approved
          - in-progress
          - completed
      targetRecoveryEnvironment:
        type: text
  "Emergency Change Workflow":
    meaning: "The expedited change-management workflow used to assess, approve, implement, and track urgent changes during an incident."
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - initiated
          - in-progress
          - approved
          - implemented
          - completed
      startedAt:
        type: date
  Change:
    meaning: "A planned, implemented, emergency, failed, or rolled-back modification that may affect an IT service."
    aliases: []
    properties:
      changeReference:
        type: text
      status:
        type: text
        allowed:
          - planned
          - assessing
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
      implementedAt:
        type: date
  "Backup Data":
    meaning: "A recoverable copy or restore point of data used to support service restoration."
    aliases: []
    properties:
      backupReference:
        type: text
      backupTimestamp:
        type: date
      integrityStatus:
        type: text
        allowed:
          - verified
          - corrupted
          - expired
          - failed
          - pending
  "Escalation Path":
    meaning: "A defined route of escalation steps or roles used when an incident requires higher-level attention or faster resolution."
    aliases: []
    properties:
      pathName:
        type: text
      triggerCondition:
        type: text
relationships:
  - name: affects
    from: Incident
    to: "IT Service"
    meaning: "Identifies the IT service involved in or disrupted by the incident."
    aliases: []
  - name: impacts
    from: Incident
    to: "Business Service"
    meaning: "Identifies the business service whose operation or outcome is affected by the incident."
    aliases: []
  - name: impacts
    from: Incident
    to: "Customer Channel"
    meaning: "Identifies the customer-facing channel affected by the incident."
    aliases: []
  - name: affects
    from: Incident
    to: "Infrastructure Component"
    meaning: "Identifies the infrastructure component directly affected by or contributing to the incident."
    aliases: []
  - name: affects
    from: Incident
    to: "Configuration Item"
    meaning: "Identifies the configuration item affected by the incident."
    aliases: []
  - name: supports
    from: "IT Service"
    to: "Business Service"
    meaning: "Shows that an IT service enables or underpins a business service."
    aliases: []
  - name: delivers
    from: "Customer Channel"
    to: "Business Service"
    meaning: "Shows that a customer channel is used to access or deliver a business service."
    aliases: []
  - name: depends on
    from: "IT Service"
    to: "Infrastructure Component"
    meaning: "Shows that an IT service relies on an infrastructure component to operate."
    aliases: []
  - name: depends on
    from: "Third-Party Service"
    to: "IT Service"
    meaning: "Shows that a third-party service relies on the bank’s IT service."
    aliases: []
  - name: owned by
    from: "IT Service"
    to: "Service Owner"
    meaning: "Identifies the accountable service owner for an IT service."
    aliases: []
  - name: has application owner
    from: "IT Service"
    to: "Application Owner"
    meaning: "Identifies the application-level owner associated with an IT service."
    aliases: []
  - name: has technical owner
    from: "IT Service"
    to: "Technical Owner"
    meaning: "Identifies the technical or engineering owner associated with an IT service."
    aliases: []
  - name: supported by
    from: "IT Service"
    to: "Resolver Group"
    meaning: "Identifies the resolver group normally responsible for supporting an IT service."
    aliases: []
  - name: supported by
    from: "Configuration Item"
    to: "Resolver Group"
    meaning: "Identifies the resolver group responsible for supporting or resolving issues with a configuration item."
    aliases: []
  - name: assigned to
    from: Incident
    to: "Resolver Group"
    meaning: "Identifies the resolver group actually assigned to handle the incident."
    aliases: []
  - name: has on-call engineer
    from: "Resolver Group"
    to: "On-call Engineer"
    meaning: "Identifies the engineer currently providing hands-on response for the resolver group."
    aliases: []
  - name: has major incident record
    from: Incident
    to: "Major Incident"
    meaning: "Links an incident to the distinct major-incident coordination record created after major-incident declaration."
    aliases: []
  - name: proposed commander
    from: Incident
    to: "Incident Commander"
    meaning: "Identifies the incident commander proposed or designated before formal major-incident declaration."
    aliases: []
  - name: commanded by
    from: "Major Incident"
    to: "Incident Commander"
    meaning: "Identifies the incident commander responsible for overall major-incident command."
    aliases: []
  - name: coordinated by
    from: "Major Incident"
    to: "Incident Response Team Lead"
    meaning: "Identifies the tactical response lead coordinating major-incident response activities."
    aliases: []
  - name: relates to
    from: Alert
    to: Incident
    meaning: "Links an alert to the incident it is associated with or may have contributed to."
    aliases: []
  - name: has materiality assessment
    from: Incident
    to: "Materiality Assessment"
    meaning: "Links an incident to the assessment of its materiality or significance."
    aliases: []
  - name: determines need for
    from: "Materiality Assessment"
    to: "Regulatory Notification"
    meaning: "Shows that the assessment outcome drives whether a regulatory notification is needed."
    aliases: []
  - name: has regulatory notification
    from: Incident
    to: "Regulatory Notification"
    meaning: "Links an incident to its associated regulatory notification record."
    aliases: []
  - name: owned by
    from: "Regulatory Notification"
    to: "Regulatory-Reporting Owner"
    meaning: "Identifies the owner accountable for coordinating the regulatory-notification workflow."
    aliases: []
  - name: reviewed by
    from: "Regulatory Notification"
    to: "Compliance Officer"
    meaning: "Identifies the compliance role responsible for reviewing the notification or related handling."
    aliases: []
  - name: informed by
    from: "Regulatory Notification"
    to: "Risk Management Team Member"
    meaning: "Identifies the risk role whose assessment input contributes to the notification decision or content."
    aliases: []
  - name: has stakeholder communication
    from: Incident
    to: "Stakeholder Communication"
    meaning: "Links an incident to communications sent about its status, impact, response, or recovery."
    aliases: []
  - name: sent to
    from: "Stakeholder Communication"
    to: Stakeholder
    meaning: "Identifies a stakeholder recipient or audience for the communication."
    aliases: []
  - name: sent to
    from: "Stakeholder Communication"
    to: "Business Service User"
    meaning: "Identifies an affected business-side user group as a recipient of incident communication."
    aliases: []
  - name: sent to
    from: "Stakeholder Communication"
    to: "Department Head"
    meaning: "Identifies a department head as a recipient of incident communication."
    aliases: []
  - name: has evidence
    from: Incident
    to: Evidence
    meaning: "Links an incident to evidence collected for investigation, audit, reporting, or review."
    aliases: []
  - name: has applicable workaround
    from: Incident
    to: Workaround
    meaning: "Links an incident to a workaround that can mitigate its impact."
    aliases: []
  - name: follows procedure
    from: Incident
    to: "Incident Management Procedure"
    meaning: "Links an incident to the governed incident-management procedure that applies to its scenario."
    aliases: []
  - name: uses runbook
    from: Incident
    to: Runbook
    meaning: "Links an incident to the operational runbook used for response or recovery tasks."
    aliases: []
  - name: has recovery plan
    from: Incident
    to: "Recovery Plan"
    meaning: "Links an incident to the recovery plan selected or in place for restoration."
    aliases: []
  - name: uses backup data
    from: "Recovery Plan"
    to: "Backup Data"
    meaning: "Identifies backup data required or used by a recovery plan."
    aliases: []
  - name: uses backup data
    from: Incident
    to: "Backup Data"
    meaning: "Identifies backup data used or planned for the incident’s recovery."
    aliases: []
  - name: has emergency change workflow
    from: Incident
    to: "Emergency Change Workflow"
    meaning: "Links an incident to the emergency change workflow initiated for it."
    aliases: []
  - name: requires identified configuration item
    from: "Emergency Change Workflow"
    to: "Configuration Item"
    meaning: "Identifies configuration items required for the emergency change workflow."
    aliases: []
  - name: creates change
    from: "Emergency Change Workflow"
    to: Change
    meaning: "Links an emergency change workflow to the change record or activity it creates."
    aliases: []
  - name: affects
    from: Change
    to: "IT Service"
    meaning: "Identifies the IT service affected by a change."
    aliases: []
  - name: has related change
    from: Incident
    to: Change
    meaning: "Links an incident to a recent or suspected relevant change considered in investigation or recovery."
    aliases: []
  - name: has escalation path
    from: Incident
    to: "Escalation Path"
    meaning: "Links an incident to the escalation route used when resolution conditions require escalation."
    aliases: []
  - name: has post-incident review
    from: Incident
    to: "Post-Incident Review"
    meaning: "Links an incident to a review conducted after response activities."
    aliases: []
  - name: has post-incident review
    from: "Major Incident"
    to: "Post-Incident Review"
    meaning: "Links a major incident to its mandatory or structured post-incident review."
    aliases: []
  - name: creates corrective action
    from: "Post-Incident Review"
    to: "Corrective Action"
    meaning: "Links a review to the corrective actions produced from its findings."
    aliases: []
  - name: applies to
    from: "Corrective Action"
    to: "IT Service"
    meaning: "Identifies the IT service the corrective action is intended to improve or protect."
    aliases: []
  - name: has business service user
    from: "Business Service"
    to: "Business Service User"
    meaning: "Identifies business-side users or user groups associated with a business service."
    aliases: []
  - name: has department head
    from: "Business Service"
    to: "Department Head"
    meaning: "Identifies the department head representing or accountable for a business area affected by the business service."
    aliases: []
rules:
  - name: canDeclareMajorIncident
    conditions:
      - Incident.status is acknowledged or investigating.
      - Incident.severity is sev1-critical or sev2-high.
      - At least one affected IT Service is identified.
      - An Incident Commander is proposed for the incident.
  - name: regulatoryNotificationRequired
    conditions:
      - Materiality Assessment.outcome is potentially-reportable or reportable.
      - The incident is linked to an IT Service or Business Service where regulatedService is true.
      - Incident.status is recovering or resolved.
  - name: canStartEmergencyChangeWorkflow
    conditions:
      - Incident.status is acknowledged or investigating.
      - The emergency change requires immediate action to address an active incident.
      - Affected Configuration Items are identified for the incident.
      - The Emergency Change Workflow requires identified Configuration Items.
  - name: canExecuteRecoveryPlan
    conditions:
      - Incident.status is recovering.
      - Recovery Plan.status is approved.
      - Backup Data.integrityStatus is verified.
      - Recovery Plan.targetRecoveryEnvironment is specified.
  - name: canAssignIncidentToResolverGroup
    conditions:
      - Incident.status is new or acknowledged.
      - The resolver group supports the affected IT Service or affected Configuration Items.
      - Affected Configuration Items are identified and documented.
  - name: canSubmitRegulatoryNotification
    conditions:
      - Materiality Assessment.status is completed.
      - Materiality Assessment.outcome is reportable.
      - Regulatory Notification.status is approved.
      - All required fields and supporting evidence for the notification are complete.
  - name: canSendStakeholderCommunication
    conditions:
      - Incident.status is resolved or recovering.
      - Stakeholder Communication.messageSummary is prepared.
      - Stakeholder Communication.status is approved.
      - Audience recipients are identified as Stakeholder, Business Service User, or Department Head.
  - name: canCloseIncident
    conditions:
      - Incident.status is resolved or recovering.
      - All impacted IT Services, Business Services, and Customer Channels are healthy or have residualConditionAccepted set to true.
      - Resolution Evidence is recorded and Evidence.verificationStatus is verified.
      - Relevant stakeholder communications regarding resolution have been sent.
  - name: canAcknowledgeAlert
    conditions:
      - Alert.status is new.
      - The incident related to the alert is active, meaning Incident.status is new, acknowledged, or investigating.
  - name: canInitiatePostIncidentReview
    conditions:
      - Incident.status is resolved or closed, or Major Incident.status is resolved or closed if the review is for a major incident.
      - No related Post-Incident Review exists with status completed or reviewed.
  - name: canRestoreBackupData
    conditions:
      - Backup Data.integrityStatus is verified.
      - Recovery Plan.targetRecoveryEnvironment is specified.
      - Recovery Plan.status is approved or in-progress.
actions:
  - name: assignIncidentToResolverGroup
    input: Incident
    preconditions:
      - canAssignIncidentToResolverGroup rule is satisfied.
    effect: Incident is assigned to the designated Resolver Group.
    verification: Re-read the Incident and confirm it has an assigned to relationship to the intended Resolver Group.
  - name: acknowledgeAlert
    input: Alert
    preconditions:
      - canAcknowledgeAlert rule is satisfied.
    effect: Alert.status becomes acknowledged.
    verification: Re-read the Alert and confirm Alert.status is acknowledged.
  - name: declareMajorIncident
    input: Incident
    preconditions:
      - canDeclareMajorIncident rule is satisfied.
    effect: A Major Incident record is created or linked for the Incident, and the proposed Incident Commander is carried into major-incident command.
    verification: Confirm the Incident has a has major incident record relationship to a Major Incident, and the Major Incident has a commanded by relationship to the Incident Commander.
  - name: startEmergencyChangeWorkflow
    input: Incident
    preconditions:
      - canStartEmergencyChangeWorkflow rule is satisfied.
    effect: An Emergency Change Workflow is initiated for the Incident.
    verification: Confirm the Incident has a has emergency change workflow relationship to an Emergency Change Workflow with status initiated.
  - name: sendStakeholderCommunication
    input: "Stakeholder Communication"
    preconditions:
      - canSendStakeholderCommunication rule is satisfied.
    effect: Stakeholder Communication.status becomes sent, and sentAt is populated.
    verification: Re-read the Stakeholder Communication and confirm status is sent and sentAt is present.
  - name: submitRegulatoryNotification
    input: "Regulatory Notification"
    preconditions:
      - canSubmitRegulatoryNotification rule is satisfied.
    effect: Regulatory Notification.status becomes submitted, and submittedAt is populated.
    verification: Re-read the Regulatory Notification and confirm status is submitted and submittedAt is present.
  - name: executeRecoveryPlan
    input: "Recovery Plan"
    preconditions:
      - canExecuteRecoveryPlan rule is satisfied.
    effect: Recovery Plan.status becomes in-progress, and recovery activities are initiated for the related Incident.
    verification: Confirm Recovery Plan.status is in-progress and the related Incident remains connected to that Recovery Plan.
  - name: restoreBackupData
    input: "Backup Data"
    preconditions:
      - canRestoreBackupData rule is satisfied.
    effect: Verified Backup Data is restored into the specified target recovery environment as part of the related Recovery Plan.
    verification: Confirm Backup Data.integrityStatus is verified, Recovery Plan.targetRecoveryEnvironment is present, and the related Recovery Plan is approved or in-progress.
  - name: closeIncident
    input: Incident
    preconditions:
      - canCloseIncident rule is satisfied.
    effect: Incident.status becomes closed.
    verification: Re-read the Incident and confirm Incident.status is closed.
  - name: initiatePostIncidentReview
    input: Incident
    preconditions:
      - canInitiatePostIncidentReview rule is satisfied.
    effect: A Post-Incident Review is created or linked for the Incident with Post-Incident Review.status set to new, and if the incident has a Major Incident record the review is also linked to the Major Incident.
    verification: Confirm the Incident has a has post-incident review relationship to a Post-Incident Review with status new, and if a Major Incident record exists confirm it also has a has post-incident review relationship to that review.