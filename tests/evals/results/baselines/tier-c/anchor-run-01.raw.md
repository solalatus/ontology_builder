```json
[
  {
    "severity": "warning",
    "subject": "isolateConfigurationItem / configurationItemIsolationRequired",
    "message": "The action takes ConfigurationItem as input but its required rule is stated in terms of an Incident and the configuration item being the source of that incident, which the action input alone cannot satisfy."
  },
  {
    "severity": "warning",
    "subject": "sendStakeholderCommunication / stakeholderCommunicationRequired",
    "message": "The action input is StakeholderCommunication but its precondition rule is expressed on Incident conditions, so the required check is not usable from the action's input object alone."
  },
  {
    "severity": "warning",
    "subject": "submitRegulatoryNotification / regulatoryNotificationRequired",
    "message": "The action input is RegulatoryNotification but its precondition rule depends on MaterialityAssessment, Incident significance, jurisdictional requirements, and Evidence, which are not provided from the action input alone."
  },
  {
    "severity": "warning",
    "subject": "conductPostIncidentReview / postIncidentReviewRequired",
    "message": "The action input is PostIncidentReview but its required rule depends on lifecycle facts about an Incident, so the precondition cannot be evaluated from the action input alone."
  },
  {
    "severity": "warning",
    "subject": "restoreServiceFromBackup / canRestoreFromBackup",
    "message": "The action verifies impacted IT Service status changes, but the effect only links the Incident to a Backup and there is no relationship from Incident to Backup or Backup to Incident that identifies which impacted IT Service must have changed."
  },
  {
    "severity": "warning",
    "subject": "isolateConfigurationItem verification",
    "message": "The verification requires failure details in the incident record when isolation fails, but the effect only changes ConfigurationItem isolationState and records nothing on Incident."
  }
]
```