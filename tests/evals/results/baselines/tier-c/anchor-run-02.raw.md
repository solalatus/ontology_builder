```json
[
  {
    "severity": "warning",
    "subject": "canSendRegulatoryNotification",
    "message": "The rule requires Regulatory Notification status to be approved, but the RegulatoryNotification class allowed statuses do not include approved."
  },
  {
    "severity": "warning",
    "subject": "sendRegulatoryNotification",
    "message": "The action depends on canSendRegulatoryNotification requiring Regulatory Notification status approved, but the effect can only start from statuses allowed on RegulatoryNotification, which never include approved."
  },
  {
    "severity": "warning",
    "subject": "declareMajorIncident",
    "message": "The verification requires an Incident Commander to be identified or assigned, but the action effect only sets majorIncidentDeclared to true and does not establish the managedBy relationship."
  },
  {
    "severity": "warning",
    "subject": "executeEmergencyChange",
    "message": "The verification requires executedAt to be present, but the action effect states only that status becomes executed and does not record executedAt."
  }
]
```