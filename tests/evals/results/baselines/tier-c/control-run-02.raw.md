```json
[
  {
    "severity": "warning",
    "subject": "canDeclareMajorIncident / declaredBy relationship",
    "message": "The rule requires an IncidentCommander to be assigned and authorized, but the model only provides Incident declaredBy IncidentCommander for declaration and no way to represent assignment or authorization."
  },
  {
    "severity": "warning",
    "subject": "canCloseIncident",
    "message": "The rule allows closure when incident status is monitoring, resolved or monitoring, but also requires all affected services to be healthy or have an accepted residual condition, and 'accepted residual condition' cannot be represented anywhere in the model."
  },
  {
    "severity": "warning",
    "subject": "canCloseIncident / closeIncident",
    "message": "The rule and action verification require recording resolution evidence and a closure timestamp, but the Incident class has neither a closure timestamp property nor any property for recorded resolution/restoration state beyond generic linked Evidence."
  },
  {
    "severity": "warning",
    "subject": "canCloseIncident",
    "message": "The rule requires all required StakeholderCommunication items for the incident to be complete, but the model has no notion of which communications are required or any 'complete' state for StakeholderCommunication."
  },
  {
    "severity": "warning",
    "subject": "canSendStakeholderCommunication / sendStakeholderCommunication",
    "message": "The rule depends on a StakeholderCommunication being prepared and matched to an Incident, but the action input is only Incident and there is no way in the action to identify which StakeholderCommunication is being sent."
  },
  {
    "severity": "warning",
    "subject": "canSendStakeholderCommunication / StakeholderCommunication status",
    "message": "The action says the communication is sent and timestamped, but StakeholderCommunication.status allowed values do not include any sent state while verification asks to confirm delivery status."
  },
  {
    "severity": "warning",
    "subject": "canSendStakeholderCommunication",
    "message": "The rule requires the StakeholderCommunication content to match the latest verified state of the Incident, but the model has no concept of a verified incident state to compare against."
  },
  {
    "severity": "warning",
    "subject": "canExecuteEmergencyChange / executeEmergencyChange",
    "message": "The rule requires a Change to be for an Incident, but the action effect only says the change status is updated without any allowed Change status that specifically represents 'implemented' unless chosen externally, so the verification cannot follow directly from the effect."
  },
  {
    "severity": "warning",
    "subject": "canDocumentIncidentFindings / documentIncidentFindings",
    "message": "The action effect and verification require findings and lessons learned to be recorded in the Incident, but the Incident class has no property for findings, lessons learned, or documentation content."
  },
  {
    "severity": "warning",
    "subject": "canInitiateBackupRestore",
    "message": "The rule is expressed against both a RecoveryPlan and an Incident ('appliesTo at least one Service affected by the Incident'), but the action input is only RecoveryPlan and there is no relationship from RecoveryPlan to Incident to bind which incident is being evaluated."
  },
  {
    "severity": "warning",
    "subject": "canInitiateBackupRestore / initiateBackupRestore",
    "message": "The rule requires RecoveryPlan status to be approved, but RecoveryPlan.status has no allowed values defined, so the required approved state is not grounded in the model."
  },
  {
    "severity": "warning",
    "subject": "acknowledgeAlert",
    "message": "The action effect records an acknowledgment timestamp, but the Alert class has no timestamp property to hold that recorded value."
  },
  {
    "severity": "warning",
    "subject": "canContainIncident",
    "message": "The rule requires approved ContainmentSteps defined for the Incident, but the model only has ContainmentSteps relatesToIncident Incident and no inverse/navigation from Incident to its containment steps, making the rule unusable from the Incident input."
  }
]
```