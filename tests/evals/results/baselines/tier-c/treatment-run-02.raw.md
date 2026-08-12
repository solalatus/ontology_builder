```json
[
  {
    "severity": "warning",
    "subject": "declareMajorIncident action",
    "message": "The verification requires an incident commander to be recorded, but the effect only sets majorIncidentDeclared/majorIncidentDeclaredAt and does not create or assign any hasIncidentCommander relationship."
  },
  {
    "severity": "warning",
    "subject": "sendStakeholderCommunication action",
    "message": "The verification requires the final message to be archived, but the effect only sets status to sent, records sentAt, and updates deliveryStatus without archiving the message."
  },
  {
    "severity": "warning",
    "subject": "requiresRegulatoryNotification rule vs canSubmitRegulatoryNotification rule",
    "message": "One rule is triggered when materiality outcome is reportable or potentially-reportable, while the submission rule only allows submission when the outcome is reportable, so a notification can be required in a state where submission is disallowed."
  },
  {
    "severity": "warning",
    "subject": "canCloseIncident rule",
    "message": "The rule requires all impacted business services to have healthy healthState or an accepted residual condition, but BusinessService.healthState has no allowed value or property structure that can express either 'healthy' or 'accepted residual condition' consistently."
  },
  {
    "severity": "warning",
    "subject": "canRestoreBackup rule",
    "message": "The rule requires that the backup set protects the target configuration item, but the model only provides restoresConfigurationItem from BackupSet to ConfigurationItem and no 'protects' relation, so the stated condition cannot be evaluated from the model."
  },
  {
    "severity": "warning",
    "subject": "canRestoreBackup rule",
    "message": "The rule requires the restore point to be approved for restoration, but BackupSet.restorePoint is only a text field and the model contains no approval state for restore points."
  },
  {
    "severity": "warning",
    "subject": "canCloseIncident rule",
    "message": "The rule requires a post-incident review to be scheduled or completed for certain incidents, but the only modeled PostIncidentReview status values are planned, in-progress, and completed, so 'scheduled' is not representable."
  },
  {
    "severity": "warning",
    "subject": "executeEmergencyChange action",
    "message": "The verification requires implementation evidence to be recorded, but the effect only updates the emergency change as implemented and does not create any evidence or evidence link."
  },
  {
    "severity": "warning",
    "subject": "isolateConfigurationItem action",
    "message": "The verification requires confirming the configuration item is isolated, but the effect describes isolation without setting ConfigurationItem.isIsolated or ConfigurationItem.status to isolated."
  }
]
```