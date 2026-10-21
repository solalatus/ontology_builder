# Ontology-recovery eval — conversation log

Status: **stages_complete** — 7 turn(s) so far, 220s elapsed.
Last updated: 2026-10-21T04:50:35.873Z

### Turn 0 — persona

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### Turn 1 — app-user

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### Turn 1 — app-assistant

Let’s start with a **major incident**, since it connects service operations, recovery, communications, evidence, and reporting.

Could you walk me through a recent or representative incident from the first alert to closure? In particular:

1. What do you call the main things you track—services, alerts, incidents, affected customers, changes, recovery actions, and so on?
2. Who decides that an incident is “major,” and what criteria do they use?
3. Which decisions must the model help answer—for example, “Which critical services are affected?” or “Does this incident require regulatory reporting?”

A representative scenario is enough; please omit sensitive details.

### Turn 1 — persona

Take a representative, anonymised case: monitoring raises an alert about an IT service that supports a customer-facing business service. The alert needs triage; it is not automatically an incident. Once we establish an unplanned degradation requiring a managed response, the service desk records an incident, links the relevant alert or events, and routes it to a resolver group. We then trace the affected IT service, configuration items and any third-party dependency through to the business service and customer channel. That gives us a defensible picture of impact rather than just a technical symptom.

**The main things I track** are the alert and underlying events; the incident and its status, severity, impact and urgency; affected IT and business services, customer channels and configuration items; the service owner, resolver group and on-call engineer; and the response record. That record can include a runbook, a temporary workaround, a recovery plan and backup set, or a change if a controlled fix is needed. Communications, preserved evidence, a materiality assessment and—if warranted—a regulatory notification are separate records. A later problem record and post-incident review deal with cause and follow-up actions. For customer impact, I would identify the affected channel and stakeholder audience; I would not infer a list of individual customers from the incident alone.

**“Major” is a deliberate declaration, not a synonym for any severe alert.** Before declaring it, we need an active incident—not one already resolved, closed or cancelled—with critical or high severity, at least one identified impacted IT service, and an assigned incident commander. The bank’s approved criteria govern the significance judgment; I would not invent a numerical threshold. The incident commander is accountable for command and decision cadence once assigned, while the incident response team coordinates the major response. Declaration starts that coordination and the communication cadence.

In this example, the team might contain the fault, then use an applicable recovery plan to move the service to a recovery environment—but only after checking that the environment is available and the data-recovery point is acceptable. We verify service health and critical business transactions there. We send stakeholder updates based on the latest *verified* incident state, retaining the final messages and delivery status alongside technical evidence.

**The decisions the record must support** include:

- Which business services and customer channels are impacted, and what dependencies sit beneath the affected IT service?
- Which alerts and events belong to this incident, and who owns the service and should resolve it?
- Does it meet the bank’s major-incident criteria, and which runbook, workaround, backup or recovery plan is safe to use?
- Was a recent change or deployment involved?
- Is the materiality assessment complete, and does it call for a regulatory notification? The designated reporting function, with Legal or Compliance as appropriate, owns that determination—not an assumption made by operations.
- Are the evidence, required communications, restored service health and review arrangements sufficient for closure?

We would close only after resolution or monitoring has reached the closure boundary, service health is restored or a residual condition is accepted, and the required evidence and communications are complete. For a major incident, the post-incident review must also be scheduled or completed; closing the incident does not erase the problem or corrective actions that may follow.

### Turn 2 — app-user

Take a representative, anonymised case: monitoring raises an alert about an IT service that supports a customer-facing business service. The alert needs triage; it is not automatically an incident. Once we establish an unplanned degradation requiring a managed response, the service desk records an incident, links the relevant alert or events, and routes it to a resolver group. We then trace the affected IT service, configuration items and any third-party dependency through to the business service and customer channel. That gives us a defensible picture of impact rather than just a technical symptom.

**The main things I track** are the alert and underlying events; the incident and its status, severity, impact and urgency; affected IT and business services, customer channels and configuration items; the service owner, resolver group and on-call engineer; and the response record. That record can include a runbook, a temporary workaround, a recovery plan and backup set, or a change if a controlled fix is needed. Communications, preserved evidence, a materiality assessment and—if warranted—a regulatory notification are separate records. A later problem record and post-incident review deal with cause and follow-up actions. For customer impact, I would identify the affected channel and stakeholder audience; I would not infer a list of individual customers from the incident alone.

**“Major” is a deliberate declaration, not a synonym for any severe alert.** Before declaring it, we need an active incident—not one already resolved, closed or cancelled—with critical or high severity, at least one identified impacted IT service, and an assigned incident commander. The bank’s approved criteria govern the significance judgment; I would not invent a numerical threshold. The incident commander is accountable for command and decision cadence once assigned, while the incident response team coordinates the major response. Declaration starts that coordination and the communication cadence.

In this example, the team might contain the fault, then use an applicable recovery plan to move the service to a recovery environment—but only after checking that the environment is available and the data-recovery point is acceptable. We verify service health and critical business transactions there. We send stakeholder updates based on the latest *verified* incident state, retaining the final messages and delivery status alongside technical evidence.

**The decisions the record must support** include:

- Which business services and customer channels are impacted, and what dependencies sit beneath the affected IT service?
- Which alerts and events belong to this incident, and who owns the service and should resolve it?
- Does it meet the bank’s major-incident criteria, and which runbook, workaround, backup or recovery plan is safe to use?
- Was a recent change or deployment involved?
- Is the materiality assessment complete, and does it call for a regulatory notification? The designated reporting function, with Legal or Compliance as appropriate, owns that determination—not an assumption made by operations.
- Are the evidence, required communications, restored service health and review arrangements sufficient for closure?

We would close only after resolution or monitoring has reached the closure boundary, service health is restored or a residual condition is accepted, and the required evidence and communications are complete. For a major incident, the post-incident review must also be scheduled or completed; closing the incident does not erase the problem or corrective actions that may follow.

### Turn 2 — app-tool

✓ Applied: 60 added, 0 updated.

### Turn 2 — app-assistant

I’ve represented the alert as something triaged before an incident is recorded, and “major” as a declaration gated by the bank’s criteria—not a severity value inferred from an alert. I’ve also kept the materiality assessment separate from the notification.

A few points would sharpen the decision rules:

1. What statuses do you actually use for an incident, and is “major” a separate declaration/flag or a status?
2. What makes an impact statement or stakeholder update **verified**? Who approves an update, and how do you identify its audience?
3. What inputs and outcomes does the materiality assessment record? What is the handoff to the designated reporting function, and when can a notification be issued?
4. For closure, who accepts a residual condition, and what marks the “monitoring has reached the closure boundary” decision?I’ve modeled the alert as something that needs triage before an incident is recorded, and “major” as a deliberate declaration governed by the bank’s criteria. I’ve kept the materiality assessment separate from any regulatory notification.

To make the decision rules accurate, could you clarify four points?

1. What incident statuses do you use? Is “major” a separate declaration or one of those statuses?
2. What makes an impact statement or stakeholder update **verified**, and who approves an update and selects its audience?
3. What outcomes can a materiality assessment reach, and how does the decision pass to the designated reporting function?
4. Who can accept a residual condition at closure, and what establishes that monitoring has reached the closure boundary?

### Turn 2 — persona

Yes—those are the right separations.

1. **Incident status** can be: new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, or cancelled. **Major** is a separate declaration/classification, not another status. Declaration requires an incident that is not resolved, closed or cancelled; critical or high severity; at least one identified impacted IT service; and an assigned incident commander.

2. An update must reflect the **latest verified incident state**. We retain the observations and evidence supporting what we say about impact, rather than presenting a suspected dependency as a confirmed outage. For sending a stakeholder communication, its audience, message, owner and approval state must be recorded. The audience choices are technical, management, business, customer, vendor, regulator and all-staff; a communication is addressed to the relevant stakeholder. The model does **not** prescribe a particular approver or a universal test that makes every impact statement “verified”—those must follow the bank’s governing communications procedure.

3. A **materiality assessment** records when it was made, its rationale, a reporting due time where applicable, and one of four results: not reportable, potentially reportable, reportable, or undetermined. It assesses the incident and can trigger a separate regulatory notification. Operations supplies the incident facts and evidence; the designated reporting function, involving Legal or Compliance as appropriate, handles the reporting determination and submission workflow. Submission is permitted only with a **reportable** assessment, a notification linked to the incident and regulator, complete required information and supporting evidence, approved notification status, and submission before its due time. We retain the submission receipt and confirm acceptance, or record rejection and remediation.

4. Closure is allowed from **resolved or monitoring** status, provided impacted services are healthy **or** a residual condition has been accepted. Resolution and restoration evidence, required stakeholder communications, and—for a major incident—a scheduled or completed post-incident review must also be in place. The model does not name a universal person authorised to accept residual risk, or set a fixed monitoring duration or threshold. I would check the bank’s approved ownership and closure procedure rather than assign that authority or invent a timer.

### Turn 3 — app-user

Yes—those are the right separations.

1. **Incident status** can be: new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, or cancelled. **Major** is a separate declaration/classification, not another status. Declaration requires an incident that is not resolved, closed or cancelled; critical or high severity; at least one identified impacted IT service; and an assigned incident commander.

2. An update must reflect the **latest verified incident state**. We retain the observations and evidence supporting what we say about impact, rather than presenting a suspected dependency as a confirmed outage. For sending a stakeholder communication, its audience, message, owner and approval state must be recorded. The audience choices are technical, management, business, customer, vendor, regulator and all-staff; a communication is addressed to the relevant stakeholder. The model does **not** prescribe a particular approver or a universal test that makes every impact statement “verified”—those must follow the bank’s governing communications procedure.

3. A **materiality assessment** records when it was made, its rationale, a reporting due time where applicable, and one of four results: not reportable, potentially reportable, reportable, or undetermined. It assesses the incident and can trigger a separate regulatory notification. Operations supplies the incident facts and evidence; the designated reporting function, involving Legal or Compliance as appropriate, handles the reporting determination and submission workflow. Submission is permitted only with a **reportable** assessment, a notification linked to the incident and regulator, complete required information and supporting evidence, approved notification status, and submission before its due time. We retain the submission receipt and confirm acceptance, or record rejection and remediation.

4. Closure is allowed from **resolved or monitoring** status, provided impacted services are healthy **or** a residual condition has been accepted. Resolution and restoration evidence, required stakeholder communications, and—for a major incident—a scheduled or completed post-incident review must also be in place. The model does not name a universal person authorised to accept residual risk, or set a fixed monitoring duration or threshold. I would check the bank’s approved ownership and closure procedure rather than assign that authority or invent a timer.

### Turn 3 — app-tool

✓ Applied: 16 added, 8 updated.

### Turn 3 — app-tool

✓ Renamed: 1 element(s).

### Turn 3 — app-assistant

I’ve added the stated status and assessment-result lists and the submission prerequisites. I also adjusted the notification link so the submission decision can follow it back to the incident and its assessment.

One more pass would help with recovery and follow-up:

1. When tracing impact, do configuration items and third-party dependencies connect directly to the IT service, or are there important connections *between* them?
2. How do you decide that a runbook, workaround, backup set, or recovery plan is applicable and safe? What do you record to verify a move to the recovery environment?
3. How do you distinguish a change that *may have contributed* to an incident from a controlled change made *to fix* it?
4. After a notification is submitted, which states or outcomes do you use for acceptance, rejection, and remediation?I’ve added the incident statuses, the separate major declaration, communication requirements, and the reporting submission prerequisites. I haven’t assigned an approver, residual-risk owner, or monitoring threshold where your procedures must supply one.

To finish the recovery and follow-up parts accurately:

1. Do configuration items and third-party dependencies connect only to the IT service, or are there important dependencies between them?
2. What makes a runbook, workaround, backup set, or recovery plan applicable and safe? What evidence verifies recovery in the alternate environment?
3. How do you distinguish a change suspected of contributing to the incident from a controlled change made to fix it?
4. After regulatory submission, what states or outcomes do you record for acceptance, rejection, and remediation?

### Turn 3 — persona

1. **The dependency paths are more specific than “everything connects to the IT service.”** An IT service depends on a third-party service, which a vendor provides. It can be implemented by an application and run on infrastructure; an application can in turn use a database, consume an interface and run on infrastructure. Configuration items are the managed components we identify as affected by an incident or modified by a change. I would not assume a general configuration-item-to-configuration-item dependency link where none has been established.

2. **Applicability and safety depend on the particular response.** An incident may be handled with a runbook; a workaround is a temporary reduction or bypass of impact, potentially documented in that runbook for a known error. A recovery plan must apply to the service before failover, the target recovery environment must be available, and the data-recovery point must be acceptable. A backup restore needs a successful or verified backup that protects the target, plus an approved restore point and target environment. After failover, we verify service health **and critical business transactions in the recovery environment**; after a restore, we validate data integrity and application functionality. We retain the observations and evidence behind those checks.

3. **Suspected cause and intended remedy are different claims.** To investigate a possible contributing change, I compare the incident timeline with the change and deployment records, the components modified, and the services affected; proximity alone does not prove causation. A controlled fix is represented separately: the incident may be resolved by a change. An emergency change must be justified by an active incident and, before execution, have identified affected components, implementation and backout plans, and explicitly accepted risk. Its technical checks, service-health verification and implementation evidence then show what the fix actually did.

4. A regulatory notification uses these workflow states: **draft, pending approval, approved, submitted, accepted, rejected, or withdrawn**. Submission records a receipt; we then confirm acceptance or record a rejection and the remediation needed. I would not treat “remediation” as another notification status. If rejection requires follow-up work, we track that work and its evidence separately while preserving the notification’s actual state and submission history.

### Turn 4 — app-user

1. **The dependency paths are more specific than “everything connects to the IT service.”** An IT service depends on a third-party service, which a vendor provides. It can be implemented by an application and run on infrastructure; an application can in turn use a database, consume an interface and run on infrastructure. Configuration items are the managed components we identify as affected by an incident or modified by a change. I would not assume a general configuration-item-to-configuration-item dependency link where none has been established.

2. **Applicability and safety depend on the particular response.** An incident may be handled with a runbook; a workaround is a temporary reduction or bypass of impact, potentially documented in that runbook for a known error. A recovery plan must apply to the service before failover, the target recovery environment must be available, and the data-recovery point must be acceptable. A backup restore needs a successful or verified backup that protects the target, plus an approved restore point and target environment. After failover, we verify service health **and critical business transactions in the recovery environment**; after a restore, we validate data integrity and application functionality. We retain the observations and evidence behind those checks.

3. **Suspected cause and intended remedy are different claims.** To investigate a possible contributing change, I compare the incident timeline with the change and deployment records, the components modified, and the services affected; proximity alone does not prove causation. A controlled fix is represented separately: the incident may be resolved by a change. An emergency change must be justified by an active incident and, before execution, have identified affected components, implementation and backout plans, and explicitly accepted risk. Its technical checks, service-health verification and implementation evidence then show what the fix actually did.

4. A regulatory notification uses these workflow states: **draft, pending approval, approved, submitted, accepted, rejected, or withdrawn**. Submission records a receipt; we then confirm acceptance or record a rejection and the remediation needed. I would not treat “remediation” as another notification status. If rejection requires follow-up work, we track that work and its evidence separately while preserving the notification’s actual state and submission history.

### Turn 4 — app-tool

🔍 Checked the current ontology state.

### Turn 4 — app-tool

✓ Renamed: 1 element(s).

### Turn 4 — app-tool

✓ Removed: 4 element(s).

### Turn 4 — app-tool

An additional ontology edit in this message was skipped — only one edit is applied per message.

### Turn 4 — app-assistant

Your distinction is clear: a suspected contributing change is not the same claim as a change made to resolve the incident, and notification remediation is not a notification status. I’ve corrected the earlier generic third-party and configuration-item links; the more detailed recovery and change additions are still pending, so I won’t treat them as modeled yet.

One point before I add them: are **application, infrastructure, database, and interface** always managed as configuration items in your records, or only sometimes? That determines whether the model should explicitly connect those component types to “configuration item” without assuming dependencies between them.

### Turn 4 — persona

**Not automatically.** “Configuration item” means a component managed within our configuration-management scope. An application, database, interface or infrastructure component may be recorded in that scope, but I would not assert that every instance of each type is always a configuration item.

Keep the specific connections we know: an IT service is implemented by an application and runs on infrastructure; an application uses a database, consumes an interface and runs on infrastructure. Separately, an incident can affect a configuration item, and a change can modify one. Don’t add a blanket type-to-configuration-item rule—or infer dependencies between components—without confirmation from the bank’s configuration-management practice.

### Turn 5 — app-user

**Not automatically.** “Configuration item” means a component managed within our configuration-management scope. An application, database, interface or infrastructure component may be recorded in that scope, but I would not assert that every instance of each type is always a configuration item.

Keep the specific connections we know: an IT service is implemented by an application and runs on infrastructure; an application uses a database, consumes an interface and runs on infrastructure. Separately, an incident can affect a configuration item, and a change can modify one. Don’t add a blanket type-to-configuration-item rule—or infer dependencies between components—without confirmation from the bank’s configuration-management practice.

### Turn 5 — app-tool

✓ Applied: 38 added, 10 updated.

### Turn 5 — app-tool

✓ Removed: 1 element(s).

### Turn 5 — app-tool

✓ Applied: 1 added, 2 updated.

### Turn 5 — app-assistant

Understood: an application, database, interface, or infrastructure component is a **configuration item only when it is managed in that scope**. I’ve added the specific service and application connections you described, without a blanket type rule or inferred component-to-component dependencies.

The model now also distinguishes a suspected contributing change from an intended fix, and records separate eligibility and verification checks for failover, backup restore, emergency changes, and notification follow-up.

Two final details would prevent overgeneralising:

1. For a backup restore, what can the **target** be in your practice—an IT service, application, database, managed configuration item, or something else?
2. Do a **known error** and the corrective actions from a post-incident review need their own records, or are they tracked within the problem record and review?

### Turn 5 — persona

1. For the restore check, the **backup set must protect the target**. We explicitly track which managed configuration item a backup set protects; the restore action also needs an approved restore point and target environment. I would not generalise that into “any IT service, application or database can be a restore target” without checking what is actually protected and how that target is recorded. After restoration, we validate data integrity and application functionality.

2. **Keep them as distinct records.** A problem can be documented by a known error: that is the diagnosed cause or documented workaround, not just a new status on the problem. A post-incident review can produce separately tracked corrective actions, with their own description, status and due date. An action can be owned by an organisational unit and implemented through a change. Keeping those records separate lets us follow whether the proposed improvement was actually implemented and verified.

### Turn 6 — app-user

1. For the restore check, the **backup set must protect the target**. We explicitly track which managed configuration item a backup set protects; the restore action also needs an approved restore point and target environment. I would not generalise that into “any IT service, application or database can be a restore target” without checking what is actually protected and how that target is recorded. After restoration, we validate data integrity and application functionality.

2. **Keep them as distinct records.** A problem can be documented by a known error: that is the diagnosed cause or documented workaround, not just a new status on the problem. A post-incident review can produce separately tracked corrective actions, with their own description, status and due date. An action can be owned by an organisational unit and implemented through a change. Keeping those records separate lets us follow whether the proposed improvement was actually implemented and verified.

### Turn 6 — app-tool

✓ Removed: 1 element(s).

### Turn 6 — app-tool

An additional ontology edit in this message was skipped — only one edit is applied per message.

### Turn 6 — app-assistant

I’ve removed the overbroad link that said a backup set protects an IT service. The replacement—protection of a specifically managed configuration item—and the distinct known-error and corrective-action records are **not yet on the model**, so I won’t claim they are.

One last question before I add them: for a known error, should the link to its documented workaround be optional? And is verification of a corrective action recorded on the action itself, or evidenced through the implementing change?

### Turn 6 — persona

Yes. A known error **can have a linked workaround**, but I would not make that link mandatory in every case. It may document a diagnosed cause even when no workable temporary bypass is available.

Verification is recorded on the **corrective action itself**: its status can move to *verified*. The action may also be implemented through a change, whose implementation checks and evidence help substantiate that result. A linked change is not, by itself, proof that the corrective action has been verified.

### Turn 7 — app-user

Yes. A known error **can have a linked workaround**, but I would not make that link mandatory in every case. It may document a diagnosed cause even when no workable temporary bypass is available.

Verification is recorded on the **corrective action itself**: its status can move to *verified*. The action may also be implemented through a change, whose implementation checks and evidence help substantiate that result. A linked change is not, by itself, proof that the corrective action has been verified.

### Turn 7 — app-tool

✓ Applied: 11 added, 2 updated.

### Turn 7 — app-tool

🔍 Checked the current ontology state.

### Turn 7 — app-assistant

The interview has covered the decisions you identified, and the domain model is complete for this scope. The final consistency check found no outstanding problems.

It distinguishes alerts from incidents, and major-incident declaration from incident status; traces impact through the confirmed service dependencies; separates suspected contributing changes from controlled fixes; and keeps recovery, communications, regulatory reporting, closure, known errors, and corrective actions as distinct decisions and records. A corrective action is verified on its own record—not merely because an implementing change exists.

The model deliberately leaves bank-specific authorities and thresholds to the approved procedures, including communications approval, residual-condition acceptance, and monitoring duration.
