```json
[
  {
    "severity": "warning",
    "subject": "rule canDeclareMajorIncident",
    "message": "The rule requires 'an incident commander or designated duty manager' to be assigned, but the model only provides IncidentCommander and has no Duty Manager class or relationship to satisfy the alternative."
  },
  {
    "severity": "warning",
    "subject": "rule canCloseIncident",
    "message": "The rule requires all impacted services to have health state 'healthy' or an accepted residual condition, but ITService.healthState has no allowed values and nowhere defines either 'healthy' or residual-condition states."
  },
  {
    "severity": "warning",
    "subject": "rule canConductPostIncidentReview and action conductPostIncidentReview",
    "message": "The rule requires a post-incident review to be scheduled before it can be conducted, but PostIncidentReview has no scheduling property or status model and the action effect only documents a review after the fact."
  },
  {
    "severity": "warning",
    "subject": "action declareMajorIncident",
    "message": "The verification checks that communication records are present, but the effect only says enhanced communication processes are initiated and does not create or link any Communication records."
  },
  {
    "severity": "warning",
    "subject": "action acknowledgeAlert",
    "message": "The verification requires acknowledgementTime to be recorded, but the effect only updates the alert status to acknowledged."
  },
  {
    "severity": "warning",
    "subject": "action sendStakeholderCommunication",
    "message": "The action input is Incident and the effect updates a communication, but the precondition rule canSendStakeholderCommunication is stated over Communication properties and recipients, making the action's required object inconsistent with its rule and effect."
  },
  {
    "severity": "warning",
    "subject": "action sendStakeholderCommunication",
    "message": "The verification requires delivery status to confirm successful delivery, but the effect only says the communication is sent and sent time is recorded."
  },
  {
    "severity": "warning",
    "subject": "action assignIncident",
    "message": "The verification requires assignment routing to align with incident type and service environment, but incident type is just a property on Incident and service environment is only reachable from ITService while the effect only assigns a resolver group without establishing those routing facts."
  },
  {
    "severity": "warning",
    "subject": "action restoreBackup",
    "message": "The effect restores backup data to a target configuration item, but BackupSet has no relationship to any target beyond its source ConfigurationItem and the verification depends on a target configuration item the model cannot represent."
  }
]
```