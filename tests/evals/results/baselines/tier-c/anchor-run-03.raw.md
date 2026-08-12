```json
[
  {
    "severity": "warning",
    "subject": "canNotifyStakeholders / notifyStakeholders",
    "message": "The rule requires Stakeholder Communication to already be sent to at least one Business Service Owner or Product Manager before sending, but the action's effect is what sends the communication and records recipients."
  },
  {
    "severity": "warning",
    "subject": "canGeneratePostIncidentReview / generatePostIncidentReviewReport",
    "message": "The rule is written against Incident state and Incident-to-PostIncidentReview relationship, but the action input is PostIncidentReview, so the precondition cannot be evaluated from the action input class alone."
  },
  {
    "severity": "warning",
    "subject": "regulatoryNotificationRequired / submitRegulatoryNotification",
    "message": "The rule is defined from Materiality Assessment status and outcome, but the action input is RegulatoryNotification and no relationship from RegulatoryNotification back to MaterialityAssessment exists to make that precondition usable on the action input."
  }
]
```