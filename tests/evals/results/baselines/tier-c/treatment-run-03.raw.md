```json
[
  {
    "severity": "warning",
    "subject": "canCloseIncident",
    "message": "The rule requires all impacted services to have health state healthy or an accepted residual condition, but IT Service.healthState does not allow 'accepted residual condition'."
  },
  {
    "severity": "warning",
    "subject": "shouldStartRegulatoryNotificationWorkflow / startRegulatoryNotificationWorkflow",
    "message": "The rule depends on whether the incident is reportable to regulatory authorities, but no class, property, or relationship in the model can represent that reportable criterion while the action relies on the rule being satisfied."
  },
  {
    "severity": "warning",
    "subject": "canCloseIncident",
    "message": "The rule requires major incidents to have undergone a scheduled or completed post-incident review, but Post-Incident Review.status does not allow 'scheduled'."
  }
]
```