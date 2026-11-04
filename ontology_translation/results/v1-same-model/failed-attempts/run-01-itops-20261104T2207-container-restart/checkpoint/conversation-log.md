### turn 0 — persona

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### turn 1 — app-user

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### turn 1 — app-tool

🔍 Checked the current ontology state.

### turn 1 — app-assistant

The ontology is empty, so we can start with what the agent actually needs to do. We’ll capture real questions and actions first, then work through the relevant things, connections, decision facts, language, constraints, rules, and actions. We’ll validate the result against your original list; you can stop earlier and keep what we’ve captured.

**What are 10–20 real questions the agent must answer** in your IT operations and major-incident work? Please phrase them as people would actually ask them.

### turn 1 — persona

These are the questions I’d expect an operations or incident-response agent to help us answer:

1. Which business services are affected, and which customer channels deliver them?
2. What IT services, configuration items, and third-party services sit on the affected service’s dependency path?
3. Which active alerts and events belong with this incident, rather than being separate issues?
4. Who owns the affected service, and which resolver group and on-call engineer should take it?
5. Does this incident meet our bank’s criteria for declaring a major incident, and who will command the response?
6. Which runbook or documented workaround applies, and what should we check before using it?
7. If we need recovery, which backup set and recovery plan apply, and can we use them safely?
8. Could a recent change or deployment have caused or contributed to the incident?
9. Has the incident’s materiality been assessed, and is a regulatory notification required or due?
10. Are the evidence, stakeholder communications, service-restoration checks, and review arrangements sufficient to close the incident?
11. Which corrective actions from earlier incident reviews remain open for the affected service?

For questions about declaration and reporting, the agent should surface the facts and the applicable approved procedure—not invent a threshold or make a legal determination on its own.

### turn 2 — app-user

These are the questions I’d expect an operations or incident-response agent to help us answer:

1. Which business services are affected, and which customer channels deliver them?
2. What IT services, configuration items, and third-party services sit on the affected service’s dependency path?
3. Which active alerts and events belong with this incident, rather than being separate issues?
4. Who owns the affected service, and which resolver group and on-call engineer should take it?
5. Does this incident meet our bank’s criteria for declaring a major incident, and who will command the response?
6. Which runbook or documented workaround applies, and what should we check before using it?
7. If we need recovery, which backup set and recovery plan apply, and can we use them safely?
8. Could a recent change or deployment have caused or contributed to the incident?
9. Has the incident’s materiality been assessed, and is a regulatory notification required or due?
10. Are the evidence, stakeholder communications, service-restoration checks, and review arrangements sufficient to close the incident?
11. Which corrective actions from earlier incident reviews remain open for the affected service?

For questions about declaration and reporting, the agent should surface the facts and the applicable approved procedure—not invent a threshold or make a legal determination on its own.

### turn 2 — app-assistant

I’ve captured the 11 questions as the acceptance test. I’ll preserve your boundary on declaration and reporting: the agent surfaces facts and the approved procedure, rather than deciding thresholds or legal obligations itself.

**What 5–10 actions must the agent help perform?** Please name concrete actions, including any that require a person’s approval before the agent proceeds.

### turn 2 — persona

These are ten concrete actions I’d want the agent to support. “Support” matters: it should check the facts, route decisions to the authorised people, execute only where permitted, and retain the verification record.

1. **Acknowledge an alert.** Given a new alert, check that the operator is authorised for the responsible resolver group. Mark it acknowledged, record the time, and confirm the status.
2. **Assign an incident.** Given an incident that is neither closed nor cancelled, check that the proposed resolver group supports an affected service or configuration item. Record and confirm the assignment.
3. **Declare a major incident.** Check that the incident is active, has severity 1 or 2, has an identified impacted IT service, and has an assigned commander. Support the authorised declaration, start the coordination and communication cadence, then confirm the classification, commander, declaration time, and communication record.
4. **Contain an incident.** For an acknowledged or investigating incident, record the containment scope and expected side effects before approved steps are executed. Mark it contained only after checking the containment indicators and service impact.
5. **Fail over a service.** Check that its recovery plan applies, the recovery environment is available, and the data-recovery point is acceptable. Move the workload, then verify service health and critical business transactions there.
6. **Restore a backup.** Check that the backup is successful or verified and protects the target; obtain approval for the restore point and target environment. Restore the data, then validate its integrity and the application’s functionality.
7. **Execute an emergency change.** Check its link to an active incident, identified affected configuration items, implementation and backout plans, and explicit risk acceptance. Implement the approved change, update its status, and retain technical checks and service-health evidence.
8. **Send a stakeholder communication.** Check the audience, message, owner, and approval state, and reconcile the content with the latest verified incident state. Send and timestamp it, confirm delivery status, and archive the final message.
9. **Submit a regulatory notification.** Check for a *reportable* assessment, the incident and regulator links, complete required information and evidence, and approved notification status. The submission must be before its recorded due time. Keep the receipt and confirm acceptance—or record rejection and the remediation needed.
10. **Close an incident.** Check that it is resolved or being monitored, affected services are healthy or have an accepted residual condition, restoration evidence and required communications are complete, and any required post-incident review is scheduled or completed. Record closure, then verify the incident and linked service states and retain the evidence.

I would also support **isolating a configuration item** as a distinct response action, rather than treating it as automatically authorised by containment: its link to the incident, isolation impact, and a rollback or reconnection method need checking first.

### turn 3 — app-user

These are ten concrete actions I’d want the agent to support. “Support” matters: it should check the facts, route decisions to the authorised people, execute only where permitted, and retain the verification record.

1. **Acknowledge an alert.** Given a new alert, check that the operator is authorised for the responsible resolver group. Mark it acknowledged, record the time, and confirm the status.
2. **Assign an incident.** Given an incident that is neither closed nor cancelled, check that the proposed resolver group supports an affected service or configuration item. Record and confirm the assignment.
3. **Declare a major incident.** Check that the incident is active, has severity 1 or 2, has an identified impacted IT service, and has an assigned commander. Support the authorised declaration, start the coordination and communication cadence, then confirm the classification, commander, declaration time, and communication record.
4. **Contain an incident.** For an acknowledged or investigating incident, record the containment scope and expected side effects before approved steps are executed. Mark it contained only after checking the containment indicators and service impact.
5. **Fail over a service.** Check that its recovery plan applies, the recovery environment is available, and the data-recovery point is acceptable. Move the workload, then verify service health and critical business transactions there.
6. **Restore a backup.** Check that the backup is successful or verified and protects the target; obtain approval for the restore point and target environment. Restore the data, then validate its integrity and the application’s functionality.
7. **Execute an emergency change.** Check its link to an active incident, identified affected configuration items, implementation and backout plans, and explicit risk acceptance. Implement the approved change, update its status, and retain technical checks and service-health evidence.
8. **Send a stakeholder communication.** Check the audience, message, owner, and approval state, and reconcile the content with the latest verified incident state. Send and timestamp it, confirm delivery status, and archive the final message.
9. **Submit a regulatory notification.** Check for a *reportable* assessment, the incident and regulator links, complete required information and evidence, and approved notification status. The submission must be before its recorded due time. Keep the receipt and confirm acceptance—or record rejection and the remediation needed.
10. **Close an incident.** Check that it is resolved or being monitored, affected services are healthy or have an accepted residual condition, restoration evidence and required communications are complete, and any required post-incident review is scheduled or completed. Record closure, then verify the incident and linked service states and retain the evidence.

I would also support **isolating a configuration item** as a distinct response action, rather than treating it as automatically authorised by containment: its link to the incident, isolation impact, and a rollback or reconnection method need checking first.

### turn 3 — app-assistant

I’ve captured 11 questions and 11 actions, counting isolation of a configuration item separately. The actions include approval, execution, and verification boundaries; I won’t treat containment approval as automatic approval to isolate a configuration item. Please correct that recap if needed.

For the **service owner, resolver group, on-call engineer, incident commander, and communication owner** you named: is there a closely related role that does the day-to-day work under any of them, and does any listed question or action depend on a specific operating context that changes how it is handled?

### turn 3 — persona

Your recap is right: isolation is a separate action with its own checks.

I would not model all those people as working *under* one another. The **service owner** is accountable for the IT service across its lifecycle; the **IT operations team** operates it day to day. A **resolver group** diagnoses and restores an assigned technology or service area, and an **on-call engineer** is a member available for time-critical response. The **incident commander** commands a major incident and is part of the cross-functional incident response team; that is different from being the engineer doing the repair. The **Service Desk** records and routes reported issues, while network operations and security operations have their respective monitoring roles.

For a stakeholder message, **communication owner** is information we record before sending. I would not turn it into a separate, fixed job title or assume it is always the commander.

Context does change the handling. We need to know the affected service and configuration items, their environment, and whether this is an ordinary, major, or cybersecurity incident. A failover specifically depends on an available recovery environment and an acceptable data-recovery point; a restore needs an approved target environment. Major-incident declaration starts a command and communication cadence. Cybersecurity incidents bring evidence-preservation and materiality-assessment considerations. None of those contexts, by itself, waives the checks or approvals for an action.

### turn 4 — app-user

Your recap is right: isolation is a separate action with its own checks.

I would not model all those people as working *under* one another. The **service owner** is accountable for the IT service across its lifecycle; the **IT operations team** operates it day to day. A **resolver group** diagnoses and restores an assigned technology or service area, and an **on-call engineer** is a member available for time-critical response. The **incident commander** commands a major incident and is part of the cross-functional incident response team; that is different from being the engineer doing the repair. The **Service Desk** records and routes reported issues, while network operations and security operations have their respective monitoring roles.

For a stakeholder message, **communication owner** is information we record before sending. I would not turn it into a separate, fixed job title or assume it is always the commander.

Context does change the handling. We need to know the affected service and configuration items, their environment, and whether this is an ordinary, major, or cybersecurity incident. A failover specifically depends on an available recovery environment and an acceptable data-recovery point; a restore needs an approved target environment. Major-incident declaration starts a command and communication cadence. Cybersecurity incidents bring evidence-preservation and materiality-assessment considerations. None of those contexts, by itself, waives the checks or approvals for an action.

### turn 4 — app-assistant

That settles the context check: environment, incident type, recovery conditions, and approvals can change handling. I’ve also noted that the service owner, operations team, resolver group, on-call engineer, and commander have distinct responsibilities; “communication owner” is recorded for a message, not necessarily a fixed role.

Before proposing classes, I need to test the additional teams against your original list. **Does the agent need to identify the IT operations team, Service Desk, network operations, or security operations separately to answer or perform a specific question or action you listed?** A brief “which item, or none” for each is enough.

### turn 4 — persona

Yes, but as distinct operational functions—not as mandatory participants in every case.

- **IT operations team:** Question 4, when identifying who operates the affected IT service alongside its service owner. It is not automatically the assigned resolver group.
- **Service Desk:** Question 3, when a reported issue is the detection source; it records the incident and helps route it for the **assign incident** action.
- **Network operations:** Question 3, when tracing infrastructure alerts from the monitoring tool it operates.
- **Security operations:** Question 3 for security events, and question 9 when a cybersecurity incident calls for security-event investigation and evidence context.

Whether any of them is involved depends on the incident and its source; I would not make all four required fields on an incident.

### turn 5 — app-user

Yes, but as distinct operational functions—not as mandatory participants in every case.

- **IT operations team:** Question 4, when identifying who operates the affected IT service alongside its service owner. It is not automatically the assigned resolver group.
- **Service Desk:** Question 3, when a reported issue is the detection source; it records the incident and helps route it for the **assign incident** action.
- **Network operations:** Question 3, when tracing infrastructure alerts from the monitoring tool it operates.
- **Security operations:** Question 3 for security events, and question 9 when a cybersecurity incident calls for security-event investigation and evidence context.

Whether any of them is involved depends on the incident and its source; I would not make all four required fields on an incident.

### turn 5 — app-assistant

That ties each function to a listed question or action without making it mandatory for every incident. I’ll now test candidate kinds of things in small groups; I’ll add a class only if the agent must identify, retrieve, connect, or pass it to a tool.

For questions **1–2** and the recovery actions, should these be separate classes?

- **Business service** — to identify what customers or the bank experience.
- **Customer channel** — to identify how that business service is delivered.
- **IT service** — to trace supporting technology and service health.
- **Configuration item** — to trace dependencies and target an isolation or change.

Does the agent need to handle each separately, or are any two the same thing in your setting?

### turn 5 — persona

Yes—keep all four separate.

- A **business service** is the capability the bank provides; it is delivered through a **customer channel** and depends on an **IT service**. A channel tells us *how customers access* the service, not which technology supports it.
- An **IT service** is the managed technology capability. We track its health and use it as the target of service recovery; it is not the same thing as the business outcome.
- A **configuration item** is a managed component. An incident can affect it, and it can be the specific target of isolation or a change. It is not interchangeable with the IT service it helps support.

For example, a customer-facing service could be unavailable through a channel because a supporting IT service has degraded; investigation might then identify a particular configuration item to isolate. Keeping those levels distinct lets us answer both “who is affected?” and “what can we safely act on?”

### turn 6 — app-user

Yes—keep all four separate.

- A **business service** is the capability the bank provides; it is delivered through a **customer channel** and depends on an **IT service**. A channel tells us *how customers access* the service, not which technology supports it.
- An **IT service** is the managed technology capability. We track its health and use it as the target of service recovery; it is not the same thing as the business outcome.
- A **configuration item** is a managed component. An incident can affect it, and it can be the specific target of isolation or a change. It is not interchangeable with the IT service it helps support.

For example, a customer-facing service could be unavailable through a channel because a supporting IT service has degraded; investigation might then identify a particular configuration item to isolate. Keeping those levels distinct lets us answer both “who is affected?” and “what can we safely act on?”

### turn 6 — app-tool

✓ Applied: 4 added, 0 updated.

### turn 6 — app-assistant

I’ve recorded those four separately: business service, customer channel, IT service, and configuration item. That preserves the distinction between customer impact, supporting technology, and an actionable component.

For questions **3, 5, and 9** and the alert and incident actions, does the agent need to handle these separately: **Alert** (acknowledged), **Event** (correlated with an incident), and **Incident** (assigned, classified, responded to, and closed)? When the Service Desk records a *reported issue*, is that an Incident in this model, or a separate thing the agent must retrieve or connect?

### turn 6 — persona

Keep **alert**, **event**, and **incident** separate. An event is an observed occurrence; an alert is a signal that needs triage or acknowledgement; an incident is the managed interruption, degradation, or security condition we assign and respond to. An alert can indicate an event and may lead to an incident, but neither every event nor every alert is automatically an incident. We can also correlate events with an incident.

When the Service Desk records a reported issue that requires managed response, the record we work with here is an **incident**. The report can be its detection source; I would not introduce a separate “reported issue” class for this purpose.

### turn 7 — app-user

Keep **alert**, **event**, and **incident** separate. An event is an observed occurrence; an alert is a signal that needs triage or acknowledgement; an incident is the managed interruption, degradation, or security condition we assign and respond to. An alert can indicate an event and may lead to an incident, but neither every event nor every alert is automatically an incident. We can also correlate events with an incident.

When the Service Desk records a reported issue that requires managed response, the record we work with here is an **incident**. The report can be its detection source; I would not introduce a separate “reported issue” class for this purpose.

### turn 7 — app-tool

✓ Applied: 3 added, 0 updated.

### turn 7 — app-assistant

I’ve recorded Alert, Event, and Incident as distinct, with a reported issue represented by an Incident when it needs managed response.

For questions **4–5** and the assignment and declaration actions, does the agent need to identify these separately: **Service Owner**, **IT Operations Team**, **Resolver Group**, **On-call Engineer**, **Incident Commander**, and **Incident Response Team**? In particular, does the response team itself need to be retrieved or connected to the incident, or is identifying its commander enough for your listed tasks?

### turn 7 — persona

Yes, keep the six roles and functions distinct.

- The **service owner** owns the affected IT service; the **IT operations team** operates it day to day.
- The **resolver group** is the team to which we assign the incident; an **on-call engineer** is a member who may handle the time-critical technical work.
- The **incident commander** commands a major incident. The **incident response team** is the cross-functional team that coordinates its response, and the commander is a member of that team.

For assignment, identifying the resolver group matters directly. For major-incident declaration, an **assigned commander** is an explicit prerequisite. The response team is still worth identifying and connecting to the **major incident** because it coordinates the response; I would not treat naming the commander as a substitute for representing that team. I would not, however, make a separately identified team an additional declaration prerequisite.

### turn 8 — app-user

Yes, keep the six roles and functions distinct.

- The **service owner** owns the affected IT service; the **IT operations team** operates it day to day.
- The **resolver group** is the team to which we assign the incident; an **on-call engineer** is a member who may handle the time-critical technical work.
- The **incident commander** commands a major incident. The **incident response team** is the cross-functional team that coordinates its response, and the commander is a member of that team.

For assignment, identifying the resolver group matters directly. For major-incident declaration, an **assigned commander** is an explicit prerequisite. The response team is still worth identifying and connecting to the **major incident** because it coordinates the response; I would not treat naming the commander as a substitute for representing that team. I would not, however, make a separately identified team an additional declaration prerequisite.

### turn 8 — app-tool

✓ Applied: 6 added, 0 updated.

### turn 8 — app-assistant

I’ve recorded all six as distinct. The commander is required for declaration; the response team coordinates the major incident but is not an extra declaration prerequisite.

For the functions you tied to questions **3 and 9**, should **Service Desk**, **Network Operations**, and **Security Operations** each be separate classes that the agent can identify and connect to an incident, event, alert, or investigation as applicable? Or is any one only a label on a source, with no separately retrievable function?

### turn 8 — persona

Keep all three as separately identifiable functions, not just detection-source labels. But I would be precise about what each connects to:

- The **Service Desk records an incident**. “Service desk” can also be recorded as a detection source, but that label does not replace the function.
- The **Network Operations Centre operates a monitoring tool**. Follow the tool’s monitoring and alert information to investigate an issue; I would not assert a direct network-operations-to-alert link.
- The **Security Operations Centre monitors security events**. Those events can inform a cybersecurity-incident investigation, but I would not make a generic “investigates incident” link its defining connection here.

So yes to three separate classes; no to freely connecting each one to every incident, event, or alert.

### turn 9 — app-user

Keep all three as separately identifiable functions, not just detection-source labels. But I would be precise about what each connects to:

- The **Service Desk records an incident**. “Service desk” can also be recorded as a detection source, but that label does not replace the function.
- The **Network Operations Centre operates a monitoring tool**. Follow the tool’s monitoring and alert information to investigate an issue; I would not assert a direct network-operations-to-alert link.
- The **Security Operations Centre monitors security events**. Those events can inform a cybersecurity-incident investigation, but I would not make a generic “investigates incident” link its defining connection here.

So yes to three separate classes; no to freely connecting each one to every incident, event, or alert.

### turn 9 — app-assistant

I’ll keep the three functions separate and use only the connections you specified. The monitoring tool also appears necessary for tracing the alerts in question 3, so I’ll test it as a class rather than assume it belongs only in a description.

First, a naming check: **are “network operations” and “Network Operations Centre” the same function in your organisation, and likewise “security operations” and “Security Operations Centre”?**

### turn 9 — persona

Yes. In this context, “network operations” means the **Network Operations Centre**, and “security operations” means the **Security Operations Centre**. They are the same respective functions, not additional teams.

### turn 10 — app-user

Yes. In this context, “network operations” means the **Network Operations Centre**, and “security operations” means the **Security Operations Centre**. They are the same respective functions, not additional teams.

### turn 10 — app-tool

✓ Applied: 3 added, 0 updated.

### turn 10 — app-assistant

I’ve recorded the Service Desk and both centres as separate functions, with the shorter operations names as confirmed aliases.

For tracing and recovery in questions **2, 3, 6, and 7**, does the agent need to retrieve and connect each of these separately: **Third-party Service**, **Monitoring Tool**, **Runbook**, **Documented Workaround**, **Recovery Plan**, and **Backup Set**? In particular, is a documented workaround its own item, or something contained in a runbook?

### turn 10 — persona

Yes—keep all six separately retrievable. I’d call the fifth item a **workaround**, rather than make “documented workaround” a separate kind of thing.

- An **IT service depends on a third-party service**; that dependency matters when tracing impact.
- A **monitoring tool monitors IT services and configuration items**. It helps us trace observations and alerts, but is not itself the alert.
- An **incident can be handled with a runbook**, which is a maintained procedure for diagnosis, response, recovery, or verification.
- A **workaround** is a temporary way to reduce or bypass impact. It can be documented in a runbook, but it is not the runbook itself.
- A **recovery plan recovers an IT service** and can use a **backup set**.
- A **backup set protects configuration items** and is the item we check before a restore. Its status and suitability for the target matter; merely finding a backup does not authorise restoration.

That separation lets the agent find a procedure, a temporary mitigation, and recoverable data without treating them as interchangeable.

### turn 11 — app-user

Yes—keep all six separately retrievable. I’d call the fifth item a **workaround**, rather than make “documented workaround” a separate kind of thing.

- An **IT service depends on a third-party service**; that dependency matters when tracing impact.
- A **monitoring tool monitors IT services and configuration items**. It helps us trace observations and alerts, but is not itself the alert.
- An **incident can be handled with a runbook**, which is a maintained procedure for diagnosis, response, recovery, or verification.
- A **workaround** is a temporary way to reduce or bypass impact. It can be documented in a runbook, but it is not the runbook itself.
- A **recovery plan recovers an IT service** and can use a **backup set**.
- A **backup set protects configuration items** and is the item we check before a restore. Its status and suitability for the target matter; merely finding a backup does not authorise restoration.

That separation lets the agent find a procedure, a temporary mitigation, and recoverable data without treating them as interchangeable.

### turn 11 — app-tool

✓ Applied: 6 added, 0 updated.

### turn 11 — app-assistant

I’ve recorded those six separately, using **Workaround** as the preferred name. A backup’s existence will not stand in for restore approval.

For questions **8–9** and the emergency-change and notification actions, should these be separate retrievable items: **Change**, **Deployment**, **Materiality Assessment**, **Regulatory Notification**, and **Regulator**? Does “emergency change” need its own class, or is it a kind of Change whose handling is distinguished by a value and approval checks?

### turn 11 — persona

Yes, keep all five separate. They answer different questions:

- A **change** is the controlled modification; a **deployment** is the technical execution that installs or activates it. To trace what was introduced, we may also need the **release** that packages approved changes and is delivered by a deployment. A recent deployment is a lead to investigate, not proof that it caused the incident.
- A **materiality assessment** records the determination and rationale about an incident’s significance and reporting implications. A **regulatory notification** is the formal submission that may follow; the **regulator** is the authority it is sent to.

I would also keep **emergency change** as a distinct kind of change, not just a value on an ordinary change. Its accelerated handling is justified by an incident, and execution has specific checks—including plans, identified affected components, and explicit risk acceptance.

### turn 12 — app-user

Yes, keep all five separate. They answer different questions:

- A **change** is the controlled modification; a **deployment** is the technical execution that installs or activates it. To trace what was introduced, we may also need the **release** that packages approved changes and is delivered by a deployment. A recent deployment is a lead to investigate, not proof that it caused the incident.
- A **materiality assessment** records the determination and rationale about an incident’s significance and reporting implications. A **regulatory notification** is the formal submission that may follow; the **regulator** is the authority it is sent to.

I would also keep **emergency change** as a distinct kind of change, not just a value on an ordinary change. Its accelerated handling is justified by an incident, and execution has specific checks—including plans, identified affected components, and explicit risk acceptance.

### turn 12 — app-assistant

I’ll keep change, deployment, materiality assessment, regulatory notification, and regulator separate. I also hear two additional candidates: release, for tracing what a deployment introduced, and emergency change, for the incident-driven action with distinct checks.

**Does the agent need to retrieve a Release separately from a Change and a Deployment to answer question 8?** And when you say **Change** here, should it mean ordinary controlled changes only, with Emergency Change represented separately, or must the agent also use “change” to refer to both? This matters because the canvas cannot represent a formal “kind of Change” hierarchy.

### turn 12 — persona

Yes. To answer whether a recent deployment may have contributed, the agent needs to retrieve the **release** separately: a change can be implemented by a release, and the release is delivered by a deployment. Those are three different records, and their connection is an investigation lead—not proof of causation.

Use **change** as the broad term, covering emergency changes too. An **emergency change** is a change handled through an accelerated, incident-justified path, not a category outside change management. If the canvas cannot express “kind of,” keep the emergency-change item identifiable for its specific execution checks, but do not redefine the general Change class to mean ordinary changes only.

### turn 13 — app-user

Yes. To answer whether a recent deployment may have contributed, the agent needs to retrieve the **release** separately: a change can be implemented by a release, and the release is delivered by a deployment. Those are three different records, and their connection is an investigation lead—not proof of causation.

Use **change** as the broad term, covering emergency changes too. An **emergency change** is a change handled through an accelerated, incident-justified path, not a category outside change management. If the canvas cannot express “kind of,” keep the emergency-change item identifiable for its specific execution checks, but do not redefine the general Change class to mean ordinary changes only.

### turn 13 — app-tool

✓ Applied: 6 added, 0 updated.

### turn 13 — app-assistant

I’ve recorded Change as the broad term, plus Release and Deployment as distinct records. I have **not** yet added Emergency Change: I need to represent its incident-justified workflow without a misleading “is a Change” link.

For the **execute emergency change** action, is the identifiable emergency-change record itself linked directly to the active Incident, the affected Configuration Items, and the implementation/backout plans? Are those plans separately retrieved records, or information held on the emergency-change record?

### turn 13 — persona

The **emergency change is directly linked to the incident** that justifies it. Its affected configuration items are identified through the change’s modification scope; the **implementation plan and backout plan are information on the change record**, not separate plan records in this setting.

Before execution, check that the linked incident is active, those configuration items are identified, both plans are present, and the risk has been explicitly accepted. Those checks do not follow merely from calling the record an emergency change.

### turn 14 — app-user

The **emergency change is directly linked to the incident** that justifies it. Its affected configuration items are identified through the change’s modification scope; the **implementation plan and backout plan are information on the change record**, not separate plan records in this setting.

Before execution, check that the linked incident is active, those configuration items are identified, both plans are present, and the risk has been explicitly accepted. Those checks do not follow merely from calling the record an emergency change.

### turn 14 — app-assistant

That gives Emergency Change its own incident link and execution checks; the two plans belong on the change record. One connection remains unclear before I add it:

**Is an Emergency Change a separately retrievable record linked to a Change record, or is it the same change record viewed through its emergency workflow?** If it is the same record, I’ll avoid creating two classes for one item and keep the emergency-specific checks in the action and rule.

### turn 14 — persona

It is **the same change record handled through the emergency workflow**, not a second record linked to a general change record. The emergency designation matters because the incident must justify it and the execution checks differ.

If the canvas cannot represent a “kind of change,” avoid creating two records for one item. Keep the record identifiable as an emergency change so the agent applies the right checks, while retaining **Change** as the broad term.

### turn 15 — app-user

It is **the same change record handled through the emergency workflow**, not a second record linked to a general change record. The emergency designation matters because the incident must justify it and the execution checks differ.

If the canvas cannot represent a “kind of change,” avoid creating two records for one item. Keep the record identifiable as an emergency change so the agent applies the right checks, while retaining **Change** as the broad term.

### turn 15 — app-assistant

Understood. I’ll use one **Change** class, with an emergency designation and incident-specific checks—not a second record or a taxonomy link. I’ll capture the designation when we reach decision properties.

For questions **10–11** and the communication and closure actions, which of these must be separately retrieved or connected: **Stakeholder Communication**, **Evidence**, **Post-incident Review**, and **Corrective Action**? In particular, is a review arrangement a Review record, and is restoration evidence an Evidence item?

### turn 15 — persona

Keep all four separately retrievable, with slightly broader names for the first two: **communication** and **evidence item**.

- A **communication** is the message sent to a stakeholder audience about an incident. Its owner and approval state matter before sending; its final content and delivery status matter for closure.
- An **evidence item** is a preserved record or artifact supporting the incident. Restoration checks can be retained as evidence items; a statement that service is restored is not a substitute for the checks.
- A **post-incident review** is the structured review of the incident and its lessons. For a major or cybersecurity incident, closure requires a review to be **scheduled or completed**—not necessarily already held.
- A **corrective action** is tracked follow-up work produced by a review. Keep it separate from the review so the agent can find actions that remain open and who owns them.

These are related to the incident, but none is simply another name for the incident record.

### turn 16 — app-user

Keep all four separately retrievable, with slightly broader names for the first two: **communication** and **evidence item**.

- A **communication** is the message sent to a stakeholder audience about an incident. Its owner and approval state matter before sending; its final content and delivery status matter for closure.
- An **evidence item** is a preserved record or artifact supporting the incident. Restoration checks can be retained as evidence items; a statement that service is restored is not a substitute for the checks.
- A **post-incident review** is the structured review of the incident and its lessons. For a major or cybersecurity incident, closure requires a review to be **scheduled or completed**—not necessarily already held.
- A **corrective action** is tracked follow-up work produced by a review. Keep it separate from the review so the agent can find actions that remain open and who owns them.

These are related to the incident, but none is simply another name for the incident record.

### turn 16 — app-tool

✓ Applied: 4 added, 0 updated.

### turn 16 — app-assistant

I’ve recorded Communication, Evidence Item, Post-incident Review, and Corrective Action separately. A review can be scheduled or completed for closure; its corrective actions remain independently trackable.

For the **failover and restore** actions, must the agent identify an **Environment** as a separate target it can connect to a service, recovery plan, or restore, or is “recovery/target environment” only a value on those records? I’d use one Environment class only if the agent must retrieve or pass a specific environment to the action.

### turn 16 — persona

Yes, use a separate **environment** item. For failover, the agent must identify the specific recovery environment, check that it is available, and use it as the destination for the service workload. For restore, the specific **target environment** is part of what must be approved alongside the restore point; “recovery” alone is not enough to identify a safe target.

An IT service can be deployed in an environment, and a configuration item belongs to one. That lets us check what the proposed target actually is. I would not add a generic recovery-plan-to-environment connection just from these actions: the recovery plan applies to the service, while the selected target environment is checked for the particular operation.

### turn 17 — app-user

Yes, use a separate **environment** item. For failover, the agent must identify the specific recovery environment, check that it is available, and use it as the destination for the service workload. For restore, the specific **target environment** is part of what must be approved alongside the restore point; “recovery” alone is not enough to identify a safe target.

An IT service can be deployed in an environment, and a configuration item belongs to one. That lets us check what the proposed target actually is. I would not add a generic recovery-plan-to-environment connection just from these actions: the recovery plan applies to the service, while the selected target environment is checked for the particular operation.

### turn 17 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 17 — app-assistant

I’ve recorded Environment as a separate item because failover and restore need a specific target. The recovery plan applies to the service; I won’t add a generic plan-to-environment link.

One actor from the **acknowledge alert** action still needs checking: is the **operator** who acknowledges an alert a separately identifiable role the agent must check against a Resolver Group, or is “operator” your general term for an already identified person such as the On-call Engineer?

### turn 17 — persona

“Operator” is a general term for the person attempting the acknowledgement, not a separate role I’d add here. They might be the **on-call engineer**, but that title or membership in a resolver group does not by itself establish authorisation.

For the action, identify the responsible resolver group and check that the person is authorised to acknowledge its alert. If that cannot be established, do not acknowledge it.

### turn 18 — app-user

“Operator” is a general term for the person attempting the acknowledgement, not a separate role I’d add here. They might be the **on-call engineer**, but that title or membership in a resolver group does not by itself establish authorisation.

For the action, identify the responsible resolver group and check that the person is authorised to acknowledge its alert. If that cannot be established, do not acknowledge it.

### turn 18 — app-assistant

I won’t add an Operator class. The acknowledgement check must establish the person’s authorisation for the alert’s responsible Resolver Group; being an On-call Engineer or group member alone is insufficient.

That completes the candidate-class pass. We’ve kept separate records where the agent must retrieve or act on them, and avoided duplicate records for reported issues, emergency changes, and operators. **Does that class scope match your work, or is there a specific listed question or action that still needs a separately identifiable kind of thing?**

### turn 18 — persona

Mostly, but I would add a few separately identifiable things before calling the scope complete:

- **Major incident** and **cybersecurity incident** need to remain distinguishable from an incident generally. Declaration creates the former; the latter changes evidence-preservation and materiality-assessment handling. As with emergency changes, these need not mean duplicate incident records if the canvas cannot express kinds of incident.
- **Security event** is distinct from a general event. Security operations monitors security events, and they can be the source of a cybersecurity incident.
- **Problem** and **known error** matter to question 6: a problem groups related incidents, while a known error documents a diagnosed problem and can have a workaround. That helps us find a relevant workaround without mistaking it for a runbook.
- **Vendor** is useful alongside a third-party service. The vendor provides the service and may receive an incident escalation; the service and its provider are not the same item.
- **Organizational unit** lets us identify who owns a corrective action for question 11, rather than relying only on its status.

Those are the gaps I would resolve first. I would not add a new class merely because an action mentions an operator, a message owner, or a plan field.

### turn 19 — app-user

Mostly, but I would add a few separately identifiable things before calling the scope complete:

- **Major incident** and **cybersecurity incident** need to remain distinguishable from an incident generally. Declaration creates the former; the latter changes evidence-preservation and materiality-assessment handling. As with emergency changes, these need not mean duplicate incident records if the canvas cannot express kinds of incident.
- **Security event** is distinct from a general event. Security operations monitors security events, and they can be the source of a cybersecurity incident.
- **Problem** and **known error** matter to question 6: a problem groups related incidents, while a known error documents a diagnosed problem and can have a workaround. That helps us find a relevant workaround without mistaking it for a runbook.
- **Vendor** is useful alongside a third-party service. The vendor provides the service and may receive an incident escalation; the service and its provider are not the same item.
- **Organizational unit** lets us identify who owns a corrective action for question 11, rather than relying only on its status.

Those are the gaps I would resolve first. I would not add a new class merely because an action mentions an operator, a message owner, or a plan field.

### turn 19 — app-assistant

Those gaps trace to questions 6, 9, and 11, and to the declaration and escalation work. I’ll reopen the class pass rather than mark it complete.

First, to avoid duplicate records: are **Major Incident** and **Cybersecurity Incident** each the *same Incident record* identified by a classification or designation, and **Security Event** the *same Event record* identified as security-related? If so, I’ll keep Incident and Event as the classes and capture those distinctions as decision properties and rules.

### turn 19 — persona

Yes, for this canvas I would use **one incident record** and **one event record**, with the distinctions retained rather than creating duplicates.

A **major incident** is an incident that has been formally declared for exceptional coordination; that designation must be verifiable, along with its commander and declaration time. A **cybersecurity incident** is an incident involving malicious, unauthorised, or other security-relevant activity. A **security event** is an event with security significance, not a second copy of the event.

I would be careful not to reduce these to interchangeable labels. Major-incident declaration has specific preconditions and starts a coordination and communication cadence. Cybersecurity-incident handling calls for evidence preservation and a materiality assessment; a regulatory notification may follow, depending on the assessment. The record can be shared, but those operational distinctions must remain available to the agent.

### turn 20 — app-user

Yes, for this canvas I would use **one incident record** and **one event record**, with the distinctions retained rather than creating duplicates.

A **major incident** is an incident that has been formally declared for exceptional coordination; that designation must be verifiable, along with its commander and declaration time. A **cybersecurity incident** is an incident involving malicious, unauthorised, or other security-relevant activity. A **security event** is an event with security significance, not a second copy of the event.

I would be careful not to reduce these to interchangeable labels. Major-incident declaration has specific preconditions and starts a coordination and communication cadence. Cybersecurity-incident handling calls for evidence preservation and a materiality assessment; a regulatory notification may follow, depending on the assessment. The record can be shared, but those operational distinctions must remain available to the agent.

### turn 20 — app-assistant

I’ll keep one Incident record and one Event record, with verifiable designations and different handling rules—not duplicate classes. Major declaration and cybersecurity handling will remain distinct decisions.

For the remaining four candidates, does the agent need to retrieve and connect **Problem**, **Known Error**, **Vendor**, and **Organizational Unit** separately as you described: Problem groups incidents; Known Error documents a diagnosed problem and may point to a workaround; Vendor provides a third-party service; and Organizational Unit owns a corrective action? Is any of those a label rather than a separate item?

### turn 20 — persona

Yes, all four are separate items, not labels. Your connections are right in substance, with one wording refinement: **the problem is documented by a known error** once its cause or workaround has been diagnosed. The known error can have a workaround; it is not the workaround itself.

A **problem groups related incidents**. A **vendor provides a third-party service**, so we can distinguish the dependency from its provider. A **corrective action is owned by an organizational unit**, which lets us identify accountability for open follow-up work. None of these four needs to be duplicated on the incident record.

### turn 21 — app-user

Yes, all four are separate items, not labels. Your connections are right in substance, with one wording refinement: **the problem is documented by a known error** once its cause or workaround has been diagnosed. The known error can have a workaround; it is not the workaround itself.

A **problem groups related incidents**. A **vendor provides a third-party service**, so we can distinguish the dependency from its provider. A **corrective action is owned by an organizational unit**, which lets us identify accountability for open follow-up work. None of these four needs to be duplicated on the incident record.

### turn 21 — app-tool

✓ Applied: 4 added, 0 updated.

### turn 21 — app-assistant

I’ve added Problem, Known Error, Vendor, and Organizational Unit. The class scope now also preserves major/cybersecurity incident and security-event distinctions **within** Incident and Event, without duplicating records. Emergency Change remains one Change record with a distinct workflow.

**Does that complete the separately identifiable things needed for your 11 questions and 11 actions?** If so, I’ll move to the connections between them.

### turn 21 — persona

Almost. I would add **stakeholder** as a separately identifiable item: a communication is addressed to a stakeholder, and the send and closure checks need us to establish who the intended audience is and whether required communications are complete. The audience type on a message does not, by itself, identify its recipient.

With that addition, the separately identifiable items cover the questions and actions we’ve listed. We can move to their connections.

### turn 22 — app-user

Almost. I would add **stakeholder** as a separately identifiable item: a communication is addressed to a stakeholder, and the send and closure checks need us to establish who the intended audience is and whether required communications are complete. The audience type on a message does not, by itself, identify its recipient.

With that addition, the separately identifiable items cover the questions and actions we’ve listed. We can move to their connections.

### turn 22 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 22 — app-assistant

I’ve added Stakeholder. With your confirmation, the class pass is complete. I’ll now record directed connections, checking both links that record what happened and links the agent needs to work out what *should* happen.

Starting with service impact and dependencies, do these directions match how you trace questions **1–2**?

- Business Service → **delivered through** → Customer Channel
- Business Service → **depends on** → IT Service
- IT Service → **depends on** → Configuration Item
- IT Service → **depends on** → Third-party Service
- Configuration Item → **depends on** → Configuration Item

Please correct any direction or link that would misstate the real dependency path.

### turn 22 — persona

The first, second, and fourth directions match how I’d trace them:

- A **business service is delivered through a customer channel**.
- A **business service depends on an IT service**.
- An **IT service depends on a third-party service**.

I would **not** record either proposed configuration-item dependency as a general connection. For the IT service’s technical path, the more precise connections are that it **is implemented by an application** and **runs on infrastructure components**. A configuration item can be identified as affected by an incident, targeted by a change, or protected by a backup set, but that does not establish a general “IT service depends on configuration item” link here.

Likewise, I would not assert a general **configuration item depends on configuration item** link. Trace the specific technical connections that are known, rather than assume every pair of components has a dependency relationship.

### turn 23 — app-user

The first, second, and fourth directions match how I’d trace them:

- A **business service is delivered through a customer channel**.
- A **business service depends on an IT service**.
- An **IT service depends on a third-party service**.

I would **not** record either proposed configuration-item dependency as a general connection. For the IT service’s technical path, the more precise connections are that it **is implemented by an application** and **runs on infrastructure components**. A configuration item can be identified as affected by an incident, targeted by a change, or protected by a backup set, but that does not establish a general “IT service depends on configuration item” link here.

Likewise, I would not assert a general **configuration item depends on configuration item** link. Trace the specific technical connections that are known, rather than assume every pair of components has a dependency relationship.

### turn 23 — app-tool

✓ Applied: 3 added, 0 updated.

### turn 23 — app-assistant

I’ve recorded the three confirmed paths and left out both proposed Configuration Item dependency links. Your correction makes **Application** and **Infrastructure Component** potential new classes for the technical path.

Does the agent need to retrieve applications and infrastructure components as distinct items to answer question 2, or are both already represented as Configuration Items in your records?

### turn 23 — persona

Yes—identify **applications** and **infrastructure components** distinctly to trace question 2. An IT service is implemented by an application and runs on infrastructure components; an application can also run on infrastructure components. Those connections tell us more than a generic configuration-item link would.

They may be managed within configuration-management scope, but I would not create duplicate records for the same component. Keep their specific identity and technical connections available, while using **configuration item** where an action or record refers to a managed component generally—for example, an isolation target.

### turn 24 — app-user

Yes—identify **applications** and **infrastructure components** distinctly to trace question 2. An IT service is implemented by an application and runs on infrastructure components; an application can also run on infrastructure components. Those connections tell us more than a generic configuration-item link would.

They may be managed within configuration-management scope, but I would not create duplicate records for the same component. Keep their specific identity and technical connections available, while using **configuration item** where an action or record refers to a managed component generally—for example, an isolation target.

### turn 24 — app-tool

✓ Applied: 5 added, 0 updated.

### turn 24 — app-assistant

I’ve recorded Application and Infrastructure Component as distinct technical items, with the three specific paths you confirmed. I’ll avoid duplicate component records.

Because the canvas has no “kind of Configuration Item” link, **how should the agent connect an affected Application or Infrastructure Component to the Configuration Item record used for isolation, change scope, and backup protection?** Is there a real operational link between those records, or are they the same record identified as a specific technical kind?

### turn 24 — persona

They are **the same managed component record**, identified by its specific technical kind—not an application record linked to a second, generic configuration-item record. The same principle applies to an infrastructure component.

If the canvas cannot express that kind-of relationship, use a shared component identity when joining the technical path to incident impact, isolation, change scope, or backup protection. Do not invent an application-to-configuration-item or infrastructure-component-to-configuration-item link between duplicate records. If that shared identity cannot be represented reliably, flag the trace as incomplete rather than treating two similarly named records as a verified match.

### turn 25 — app-user

They are **the same managed component record**, identified by its specific technical kind—not an application record linked to a second, generic configuration-item record. The same principle applies to an infrastructure component.

If the canvas cannot express that kind-of relationship, use a shared component identity when joining the technical path to incident impact, isolation, change scope, or backup protection. Do not invent an application-to-configuration-item or infrastructure-component-to-configuration-item link between duplicate records. If that shared identity cannot be represented reliably, flag the trace as incomplete rather than treating two similarly named records as a verified match.

### turn 25 — app-assistant

Understood: Application and Infrastructure Component are specific identities of managed components, not records linked to duplicate Configuration Item records. I won’t add such links. We’ll check in the property phase whether a reliable shared component identifier is available; without one, the agent must flag an unverified trace.

For questions **1–3**, which of these direct connections are recorded, and in which direction if different?

- Incident → **affects** → Business Service
- Incident → **impacts** → IT Service
- Incident → **affects** → Configuration Item
- Alert → **indicates** → Event
- Event → **correlated with** → Incident

A connection to a service need not imply that every incident affects every level.

### turn 25 — persona

All five connections are useful, with two wording or direction corrections:

- An **incident impacts a business service** and **impacts an IT service**. I’d use “impacts” for both service levels, while **an incident affects a configuration item**.
- An **alert indicates an event**.
- For the correlation record, I’d state the direction as **an incident is correlated from an event**. That does not mean the event automatically becomes an incident.

These are recorded connections, not claims that every incident has an identified business service, IT service, configuration item, alert, and event at every stage. An incident can also be triggered by an alert, but an alert may lead to an incident rather than always doing so.

### turn 26 — app-user

All five connections are useful, with two wording or direction corrections:

- An **incident impacts a business service** and **impacts an IT service**. I’d use “impacts” for both service levels, while **an incident affects a configuration item**.
- An **alert indicates an event**.
- For the correlation record, I’d state the direction as **an incident is correlated from an event**. That does not mean the event automatically becomes an incident.

These are recorded connections, not claims that every incident has an identified business service, IT service, configuration item, alert, and event at every stage. An incident can also be triggered by an alert, but an alert may lead to an incident rather than always doing so.

### turn 26 — app-tool

✓ Applied: 6 added, 0 updated.

### turn 26 — app-assistant

I’ve recorded those incident-impact and signal connections, including the optional Incident → triggered by → Alert link. Correlation and triggering do not make every event or alert an incident.

For question **4** and **assign incident**, I need both the *recorded assignment* and a way to find a suitable group. Are these the right directed connections?

- Incident → **assigned to** → Resolver Group
- Resolver Group → **supports** → IT Service
- Resolver Group → **supports** → Configuration Item
- Alert → **responsible group** → Resolver Group

If support is recorded differently for services versus components, please correct it.

### turn 26 — persona

**Incident → assigned to → Resolver Group** is the recorded assignment.

For choosing that group, we must establish that it **supports an affected IT service or configuration item**. That is an assignment check; I would not assume the two proposed “supports” links are separately recorded relationships in this scope. Likewise, alert acknowledgement requires authorisation for the **responsible resolver group**, but I would not assert a recorded Alert → Resolver Group link just from that requirement.

So the agent needs evidence of suitability and authorisation before acting. If it cannot establish either, it should not infer it from the existing incident assignment or from the alert alone.

### turn 27 — app-user

**Incident → assigned to → Resolver Group** is the recorded assignment.

For choosing that group, we must establish that it **supports an affected IT service or configuration item**. That is an assignment check; I would not assume the two proposed “supports” links are separately recorded relationships in this scope. Likewise, alert acknowledgement requires authorisation for the **responsible resolver group**, but I would not assert a recorded Alert → Resolver Group link just from that requirement.

So the agent needs evidence of suitability and authorisation before acting. If it cannot establish either, it should not infer it from the existing incident assignment or from the alert alone.

### turn 27 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 27 — app-assistant

I’ve recorded only Incident → assigned to → Resolver Group. The suitability and authorisation checks are still unresolved; an existing assignment cannot prove either.

**What recorded source lets the agent establish that a proposed Resolver Group supports an affected IT Service or Configuration Item?** If that support is not recorded anywhere the agent can use, I’ll mark “which group should take it?” as an open gap rather than claim the model can answer it.

### turn 27 — persona

I can’t point you to a specified recorded source for that support check. The assignment rule requires the proposed resolver group to support an affected IT service **or** configuration item, but the connections we’ve established do not themselves prove that support.

Mark “which group should take it?” as an **open source-mapping gap**. Until the agent can obtain reliable support information, it can show the affected service or component and a proposed group, but it should not present the group as verified or execute the assignment.

### turn 28 — app-user

I can’t point you to a specified recorded source for that support check. The assignment rule requires the proposed resolver group to support an affected IT service **or** configuration item, but the connections we’ve established do not themselves prove that support.

Mark “which group should take it?” as an **open source-mapping gap**. Until the agent can obtain reliable support information, it can show the affected service or component and a proposed group, but it should not present the group as verified or execute the assignment.

### turn 28 — app-assistant

I’ll keep the support source as an open gap. Until it is mapped, the agent can show a proposed group but cannot verify or execute the assignment. The same caution applies to alert acknowledgement until its authorisation source is established.

For service ownership and response staffing, are these recorded connections?

- IT Service → **owned by** → Service Owner
- IT Service → **operated by** → IT Operations Team
- On-call Engineer → **member of** → Resolver Group
- Incident → **assigned commander** → Incident Commander
- Incident → **coordinated by** → Incident Response Team
- Incident Commander → **member of** → Incident Response Team

Please correct any that apply only after a particular response step.

### turn 28 — persona

The connections are right in substance, but I’d record several in the opposite direction or at a more specific incident level:

- **Service Owner → owns → IT Service**; **IT Operations Team → operates → IT Service**.
- **On-call Engineer → is a member of → Resolver Group**.
- **Incident → is coordinated by → Incident Commander** is the recorded person-level connection. An assigned commander must be established before **major-incident declaration**.
- **Incident Response Team → coordinates → Major Incident**, not every incident. Declaration starts that exceptional coordination; I would not put a general Incident → response team link on all incidents.
- **Incident Commander → is a member of → Incident Response Team**.

The staffing links describe roles and membership. They do not, on their own, establish that a particular engineer is handling an incident or that a commander has been assigned to one.

### turn 29 — app-user

The connections are right in substance, but I’d record several in the opposite direction or at a more specific incident level:

- **Service Owner → owns → IT Service**; **IT Operations Team → operates → IT Service**.
- **On-call Engineer → is a member of → Resolver Group**.
- **Incident → is coordinated by → Incident Commander** is the recorded person-level connection. An assigned commander must be established before **major-incident declaration**.
- **Incident Response Team → coordinates → Major Incident**, not every incident. Declaration starts that exceptional coordination; I would not put a general Incident → response team link on all incidents.
- **Incident Commander → is a member of → Incident Response Team**.

The staffing links describe roles and membership. They do not, on their own, establish that a particular engineer is handling an incident or that a commander has been assigned to one.

### turn 29 — app-tool

✓ Applied: 6 added, 0 updated.

### turn 29 — app-assistant

I’ve recorded the ownership, membership, commander, and conditional response-team links. The team-to-incident link applies only after the incident is declared major; membership does not identify who is actually handling a particular incident.

For question **4**, does the Incident also have a **direct link to the On-call Engineer handling it**, or should the agent identify that engineer only through the assigned Resolver Group and its on-call membership? Those are different facts, so I won’t infer the direct link from the chain.

### turn 29 — persona

Yes, there is a **direct Incident → handled by → On-call Engineer** connection. Use that to identify who is actually handling the incident.

The assigned resolver group and an engineer’s membership help explain staffing, but they do **not** prove that a particular member is handling this incident. If the direct handling assignment has not been recorded, report the on-call handler as unconfirmed rather than selecting one from group membership.

### turn 30 — app-user

Yes, there is a **direct Incident → handled by → On-call Engineer** connection. Use that to identify who is actually handling the incident.

The assigned resolver group and an engineer’s membership help explain staffing, but they do **not** prove that a particular member is handling this incident. If the direct handling assignment has not been recorded, report the on-call handler as unconfirmed rather than selecting one from group membership.

### turn 30 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 30 — app-assistant

I’ve recorded the direct Incident → handled by → On-call Engineer link. Without that assignment, the handler remains unconfirmed even if the group’s on-call membership is known.

For question **3** and the detection paths, do these directions match your records?

- Service Desk → **records** → Incident
- Network Operations Centre → **operates** → Monitoring Tool
- Monitoring Tool → **monitors** → IT Service
- Monitoring Tool → **monitors** → Configuration Item
- Monitoring Tool → **produces** → Alert
- Security Operations Centre → **monitors** → Event, limited to events marked security-relevant

Please correct any link that the records cannot actually establish.

### turn 30 — persona

The first four directions match what we record:

- The **Service Desk records an incident**.
- The **Network Operations Centre operates a monitoring tool**.
- A **monitoring tool monitors IT services and configuration items**.

I would correct the last two:

- Do not record a direct **monitoring tool → produces → alert** link. An **alert is generated by a monitoring rule**, and that rule is executed by a monitoring tool. The rule is a separate item we need for tracing why an alert was raised.
- The **Security Operations Centre monitors security events**, not events generally. If you use one Event class, retain the security-event distinction so the agent does not treat every event as security-monitored.

### turn 31 — app-user

The first four directions match what we record:

- The **Service Desk records an incident**.
- The **Network Operations Centre operates a monitoring tool**.
- A **monitoring tool monitors IT services and configuration items**.

I would correct the last two:

- Do not record a direct **monitoring tool → produces → alert** link. An **alert is generated by a monitoring rule**, and that rule is executed by a monitoring tool. The rule is a separate item we need for tracing why an alert was raised.
- The **Security Operations Centre monitors security events**, not events generally. If you use one Event class, retain the security-event distinction so the agent does not treat every event as security-monitored.

### turn 31 — app-tool

✓ Applied: 8 added, 0 updated.

### turn 31 — app-assistant

I’ve recorded the confirmed detection paths and added Monitoring Rule between Alert and Monitoring Tool. The Security Operations Centre link applies only to security-relevant events.

For question **6**, are these the recorded paths for finding an applicable procedure or workaround?

- Incident → **handled with** → Runbook
- Runbook → **documents** → Workaround
- Problem → **groups** → Incident
- Problem → **documented by** → Known Error
- Known Error → **has** → Workaround
- Incident → **mitigated by** → Workaround

Please distinguish a link that records actual use from one that only identifies a possible option.

### turn 31 — persona

Most of that path is right:

- **Incident → handled with → Runbook** records the procedure used in handling that incident; it is not a claim that every incident has a runbook.
- **Workaround → documented in → Runbook** is the direction I’d record. The workaround remains a separate temporary method, not part of the runbook record.
- **Problem → groups → Incident**, **Problem → documented by → Known Error**, and **Known Error → has → Workaround** are right. Following those links can identify a *candidate* workaround for a related incident.

I would **not** add **Incident → mitigated by → Workaround** as a recorded link here. Finding a workaround through a known error does not prove it was applied to this incident, that it worked, or that it is safe to use now.

### turn 32 — app-user

Most of that path is right:

- **Incident → handled with → Runbook** records the procedure used in handling that incident; it is not a claim that every incident has a runbook.
- **Workaround → documented in → Runbook** is the direction I’d record. The workaround remains a separate temporary method, not part of the runbook record.
- **Problem → groups → Incident**, **Problem → documented by → Known Error**, and **Known Error → has → Workaround** are right. Following those links can identify a *candidate* workaround for a related incident.

I would **not** add **Incident → mitigated by → Workaround** as a recorded link here. Finding a workaround through a known error does not prove it was applied to this incident, that it worked, or that it is safe to use now.

### turn 32 — app-tool

✓ Applied: 5 added, 0 updated.

### turn 32 — app-assistant

I’ve recorded the known-error path as a way to find a **candidate** workaround, not proof it was used or safe. I also left out the proposed Incident → mitigated by → Workaround link.

For question **7** and the recovery actions, which of these are recorded connections?

- Recovery Plan → **recovers** → IT Service
- Recovery Plan → **uses** → Backup Set
- Backup Set → **protects** → Configuration Item
- IT Service → **deployed in** → Environment
- Configuration Item → **belongs to** → Environment

For failover and restore, is the *selected target* linked to the IT Service or Backup Set after the operation, or recorded as part of the operation’s evidence instead?

### turn 32 — persona

All five are recorded connections, in the directions you’ve given. I’d phrase the fourth as **IT Service → is deployed in → Environment**. A plan’s link to a backup set identifies what it uses; it does not by itself establish that the backup is suitable for a particular restore.

For the selected target, distinguish the **existing deployment context** from the **choice made for this operation**. Failover moves the service workload to the selected recovery environment, and verification checks service health and critical business transactions there. Restore requires approval of the restore point and target environment, followed by data-integrity and application-functionality checks.

I would retain the selected target, approval, and results in the operation’s evidence. I would **not** invent a Backup Set → target Environment link, or assume that the existing service-deployment link alone records which target was selected for this failover.

### turn 33 — app-user

All five are recorded connections, in the directions you’ve given. I’d phrase the fourth as **IT Service → is deployed in → Environment**. A plan’s link to a backup set identifies what it uses; it does not by itself establish that the backup is suitable for a particular restore.

For the selected target, distinguish the **existing deployment context** from the **choice made for this operation**. Failover moves the service workload to the selected recovery environment, and verification checks service health and critical business transactions there. Restore requires approval of the restore point and target environment, followed by data-integrity and application-functionality checks.

I would retain the selected target, approval, and results in the operation’s evidence. I would **not** invent a Backup Set → target Environment link, or assume that the existing service-deployment link alone records which target was selected for this failover.

### turn 33 — app-tool

✓ Applied: 5 added, 0 updated.

### turn 33 — app-assistant

I’ve recorded the five recovery and environment links. I’ll treat the selected target, approval, and verification results as operation evidence—not infer the chosen destination from an existing deployment link.

For question **8** and emergency-change execution, are these the right recorded connections?

- Change → **implemented by** → Release
- Release → **delivered by** → Deployment
- Change → **modifies** → Configuration Item
- Change → **justified by** → Incident, **only for an emergency change**
- Incident → **investigated against** → Change or Deployment, if the investigation records potential contributors

Which of the last two investigation links, if any, are actually recorded rather than merely considered?

### turn 33 — persona

The first three are recorded as stated: a **change is implemented by a release**, a **release is delivered by a deployment**, and a **change modifies a configuration item**.

The fourth applies specifically to the emergency workflow: an **emergency change is justified by an incident**. For execution, that incident must still be active. I would not apply a “justified by” link to changes generally.

Neither proposed **Incident → investigated against → Change** nor **Incident → investigated against → Deployment** is a recorded connection here. The agent can compare the change and deployment history with the incident timeline, but that is an investigation step, not a recorded finding of causation. There is a different recorded connection—**an incident is resolved by a change**—when that is what actually happened; it should not be used to label a change as the cause.

### turn 34 — app-user

The first three are recorded as stated: a **change is implemented by a release**, a **release is delivered by a deployment**, and a **change modifies a configuration item**.

The fourth applies specifically to the emergency workflow: an **emergency change is justified by an incident**. For execution, that incident must still be active. I would not apply a “justified by” link to changes generally.

Neither proposed **Incident → investigated against → Change** nor **Incident → investigated against → Deployment** is a recorded connection here. The agent can compare the change and deployment history with the incident timeline, but that is an investigation step, not a recorded finding of causation. There is a different recorded connection—**an incident is resolved by a change**—when that is what actually happened; it should not be used to label a change as the cause.

### turn 34 — app-tool

✓ Applied: 5 added, 0 updated.

### turn 34 — app-assistant

I’ve recorded the change–release–deployment path, modification scope, emergency-only justification, and the separate “resolved by change” fact. None of these labels a recent change as the *cause* of an incident.

For questions **2 and 9** and the notification action, are these recorded connections?

- Vendor → **provides** → Third-party Service
- Incident → **assessed by** → Materiality Assessment
- Materiality Assessment → **leads to** → Regulatory Notification, only if one is required
- Regulatory Notification → **concerns** → Incident
- Regulatory Notification → **submitted to** → Regulator

Is an incident escalation to a Vendor a recorded link in scope, or only a possible contact step?

### turn 34 — persona

Yes, those connections are in scope, with a few distinctions:

- A **vendor provides a third-party service**.
- An **incident is evaluated through a materiality assessment**; the assessment concerns that incident.
- A materiality assessment can **trigger a regulatory notification**. I would not treat every assessment as requiring one: its result determines whether the submission path applies.
- A **regulatory notification reports an incident**. “Concerns” is a little too loose for a formal submission.
- A **regulatory notification is sent to a regulator**. “Submitted to” is right in substance; the wording I use separates the intended recipient from whether submission has actually succeeded.

And yes, **Incident → escalated to → Vendor** is a recorded connection when an escalation occurs, not merely an available contact step. It does not follow automatically from the affected IT service depending on that vendor’s service.

### turn 35 — app-user

Yes, those connections are in scope, with a few distinctions:

- A **vendor provides a third-party service**.
- An **incident is evaluated through a materiality assessment**; the assessment concerns that incident.
- A materiality assessment can **trigger a regulatory notification**. I would not treat every assessment as requiring one: its result determines whether the submission path applies.
- A **regulatory notification reports an incident**. “Concerns” is a little too loose for a formal submission.
- A **regulatory notification is sent to a regulator**. “Submitted to” is right in substance; the wording I use separates the intended recipient from whether submission has actually succeeded.

And yes, **Incident → escalated to → Vendor** is a recorded connection when an escalation occurs, not merely an available contact step. It does not follow automatically from the affected IT service depending on that vendor’s service.

### turn 35 — app-tool

✓ Applied: 6 added, 0 updated.

### turn 35 — app-assistant

I’ve recorded assessment and notification links without implying every assessment triggers a filing. The regulator link identifies the intended recipient; submission success needs separate verification. Vendor escalation is recorded only when it occurs.

For questions **10–11** and the send and closure actions, do these directions match your records?

- Communication → **about** → Incident
- Communication → **addressed to** → Stakeholder
- Incident → **supported by** → Evidence Item
- Incident → **reviewed in** → Post-incident Review
- Post-incident Review → **produces** → Corrective Action
- Corrective Action → **owned by** → Organizational Unit
- Corrective Action → **concerns** → IT Service

Please correct any link that would imply a communication was sent or a review completed before that happened.

### turn 35 — persona

The first six are connections I would keep, with care about what they prove:

- A **communication is about an incident** and **is addressed to a stakeholder**. Neither link proves it was sent; check its status, sent time, and delivery record.
- An **incident is supported by an evidence item**. Check the evidence itself and its integrity; the link alone does not verify restoration.
- An **incident is reviewed in a post-incident review**. That link does not prove the review has been held; for closure, a required review may be scheduled or completed.
- A **post-incident review produces a corrective action**, and the **corrective action is owned by an organizational unit**. Check the action’s status to see whether it remains open.

I would **leave out Corrective Action → concerns → IT Service** as a direct recorded link. To investigate question 11, trace the action through its review and the reviewed incident to the impacted service. That gives the agent a candidate set to examine, not licence to assume every action from that review applies to every service the incident impacted.

### turn 36 — app-user

The first six are connections I would keep, with care about what they prove:

- A **communication is about an incident** and **is addressed to a stakeholder**. Neither link proves it was sent; check its status, sent time, and delivery record.
- An **incident is supported by an evidence item**. Check the evidence itself and its integrity; the link alone does not verify restoration.
- An **incident is reviewed in a post-incident review**. That link does not prove the review has been held; for closure, a required review may be scheduled or completed.
- A **post-incident review produces a corrective action**, and the **corrective action is owned by an organizational unit**. Check the action’s status to see whether it remains open.

I would **leave out Corrective Action → concerns → IT Service** as a direct recorded link. To investigate question 11, trace the action through its review and the reviewed incident to the impacted service. That gives the agent a candidate set to examine, not licence to assume every action from that review applies to every service the incident impacted.

### turn 36 — app-tool

✓ Applied: 6 added, 0 updated.

### turn 36 — app-tool

🔍 Checked the current ontology state.

### turn 36 — app-assistant

I checked the live connections: every class now has at least one, and the main paths from your original questions are represented. I’ve kept out links you rejected—for example, a monitoring tool directly producing an alert, or a corrective action automatically applying to every service impacted by its review’s incident.

One gap matters for question **11**: the review path finds *candidate* corrective actions, but does not establish which ones are **for the affected IT service**. **What recorded fact or source lets the agent verify that applicability?** If there is none in scope, I’ll leave question 11 partly open rather than present the candidates as confirmed.

### turn 36 — persona

There is no separately specified recorded link or authoritative source here that verifies a corrective action applies to a particular IT service.

The agent can find **candidates** by following the affected service to its incident, then to the post-incident review and its corrective actions. It can show each action’s description, status, and owning organizational unit for a person to examine. But it should leave “for this service” **unconfirmed** unless that applicability is established from reliable review or action evidence; the path alone is not enough. So yes, leave that part of question 11 open.

### turn 37 — app-user

There is no separately specified recorded link or authoritative source here that verifies a corrective action applies to a particular IT service.

The agent can find **candidates** by following the affected service to its incident, then to the post-incident review and its corrective actions. It can show each action’s description, status, and owning organizational unit for a person to examine. But it should leave “for this service” **unconfirmed** unless that applicability is established from reliable review or action evidence; the path alone is not enough. So yes, leave that part of question 11 open.

### turn 37 — app-assistant

I’ll leave “for this service” unconfirmed in question 11. The review path supplies candidate corrective actions, not verified applicability.

**Relationship recap:** the model connects service impact and technical paths, incident detection and staffing, procedures and recovery, change history, reporting, communications, evidence, and reviews. It does not claim that a candidate group supports a service, a candidate workaround is safe, a recent deployment caused an incident, or a review action applies to every impacted service. Those unresolved checks remain open.

**Does that accurately capture the connections and their limits?** If so, I’ll move to the values the agent needs to make decisions and verify actions.

### turn 37 — persona

Yes, that captures the connections and their limits. I’d carry forward one more unresolved check: the agent must establish a person’s authorisation for the responsible resolver group before acknowledging an alert; group membership alone does not prove it.

We can move to the decision and verification values.

### turn 38 — app-user

Yes, that captures the connections and their limits. I’d carry forward one more unresolved check: the agent must establish a person’s authorisation for the responsible resolver group before acknowledging an alert; group membership alone does not prove it.

We can move to the decision and verification values.

### turn 38 — app-assistant

I’ll carry forward alert-acknowledger authorisation as a separate open check; resolver-group membership does not establish it. The relationship recap is confirmed.

Starting with live state for the records the agent acts on: do **Incident**, **Alert**, and **Event** each need their own current-state value? I propose Incident status for assignment, containment, declaration, and closure checks; Alert status for acknowledgement; and Event status only if your correlation work tracks an event through changing states. Which of those are actually needed? We can establish their allowed values later.

### turn 38 — persona

**Incident** and **alert** each need their own status. Incident status gates assignment, containment, declaration, and closure; alert status gates acknowledgement.

I would **not** add an event status for this work. An event is an observation with an observed time, type, and detection source. We correlate it with an incident, but do not manage it through the incident or alert lifecycle.

### turn 39 — app-user

**Incident** and **alert** each need their own status. Incident status gates assignment, containment, declaration, and closure; alert status gates acknowledgement.

I would **not** add an event status for this work. An event is an observation with an observed time, type, and detection source. We correlate it with an incident, but do not manage it through the incident or alert lifecycle.

### turn 39 — app-tool

✓ Applied: 0 added, 3 updated.

### turn 39 — app-assistant

I’ve recorded Incident and Alert status. For Event, I recorded observed time, event type, and detection source; I did not add an Event status.

For the **Incident** record, which of these values are needed to support your listed decisions and checks: **severity**, **major-declaration status and time**, **cybersecurity designation**, **containment scope and expected side effects**, and **containment verification result**? Please flag anything that belongs in a linked evidence item instead of on the Incident.

### turn 39 — persona

All of those facts matter, but I would not put them all in the same set of incident fields.

- **Severity** is an incident value used in the declaration check.
- **Major-incident designation and declaration time** must be verifiable on the incident record after declaration; the assigned commander must be verifiable too.
- **Cybersecurity designation** must remain identifiable on the incident so the evidence-preservation and materiality-assessment handling is applied.
- **Containment scope and expected side effects** must be recorded before containment. The model does not prescribe that they must be fields on the incident rather than in its linked response record.
- **Containment verification results** should be retained as evidence: check the containment indicators and remaining service impact before marking the incident contained. An incident status of “contained” alone is not that evidence.

### turn 40 — app-user

All of those facts matter, but I would not put them all in the same set of incident fields.

- **Severity** is an incident value used in the declaration check.
- **Major-incident designation and declaration time** must be verifiable on the incident record after declaration; the assigned commander must be verifiable too.
- **Cybersecurity designation** must remain identifiable on the incident so the evidence-preservation and materiality-assessment handling is applied.
- **Containment scope and expected side effects** must be recorded before containment. The model does not prescribe that they must be fields on the incident rather than in its linked response record.
- **Containment verification results** should be retained as evidence: check the containment indicators and remaining service impact before marking the incident contained. An incident status of “contained” alone is not that evidence.

### turn 40 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 40 — app-assistant

I’ve recorded severity, major declaration and time, and cybersecurity designation on Incident. The commander is already a direct Incident link; containment verification belongs in Evidence Item, not in status alone. I’ve left containment scope and side effects unplaced for now.

For the things whose **current condition** affects recovery or closure—**IT Service, Configuration Item, Environment, and Backup Set**—does each need its own status on its record? For example, the agent must check service health, component isolation, target availability, and whether a backup succeeded or was verified. Please say which are recorded there and which are available only in operation evidence.

### turn 40 — persona

Not all four have a recorded status in this scope:

- **IT service:** yes, it has a **health state**. Closure checks whether impacted services are healthy or have an accepted residual condition; failover verification also checks service health and critical business transactions.
- **Backup set:** yes, it has a **status**. A restore requires it to be successful or verified, as well as protecting the target.
- **Configuration item:** no general current-status field is specified here. For isolation, retain evidence that the item was isolated and check the remaining service health; do not infer isolation from an incident status.
- **Environment:** it has a type, but no recorded availability status is specified here. Failover still requires the selected recovery environment to be available. We need a reliable way to check that at execution time; I would leave the source open rather than invent a status field.

The selected target, approvals, and post-operation verification belong in the operation evidence.

### turn 41 — app-user

Not all four have a recorded status in this scope:

- **IT service:** yes, it has a **health state**. Closure checks whether impacted services are healthy or have an accepted residual condition; failover verification also checks service health and critical business transactions.
- **Backup set:** yes, it has a **status**. A restore requires it to be successful or verified, as well as protecting the target.
- **Configuration item:** no general current-status field is specified here. For isolation, retain evidence that the item was isolated and check the remaining service health; do not infer isolation from an incident status.
- **Environment:** it has a type, but no recorded availability status is specified here. Failover still requires the selected recovery environment to be available. We need a reliable way to check that at execution time; I would leave the source open rather than invent a status field.

The selected target, approvals, and post-operation verification belong in the operation evidence.

### turn 41 — app-tool

✓ Applied: 0 added, 3 updated.

### turn 41 — app-assistant

I’ve recorded IT Service health, Backup Set status, and Environment type. I have not invented Configuration Item or Environment status fields. Environment availability remains an execution-time source gap.

For the technical trace you said must use **shared component identity**: is there a reliable recorded identifier that lets the agent recognise an Application or Infrastructure Component as the *same managed component* referenced as a Configuration Item in incident impact, isolation, change scope, or backup protection? If so, what is it called, and is it present on all three views?

### turn 41 — persona

I can’t confirm a reliable shared identifier, or that one is present across all three views. The recorded component name is not enough to prove that an application or infrastructure component is the same managed item referenced as a configuration item.

Treat that join as an **open source-mapping gap**. Until a reliable identity match is established, the agent should flag the technical trace as unverified and must not use a name match alone to select an isolation, change, or restore target.

### turn 42 — app-user

I can’t confirm a reliable shared identifier, or that one is present across all three views. The recorded component name is not enough to prove that an application or infrastructure component is the same managed item referenced as a configuration item.

Treat that join as an **open source-mapping gap**. Until a reliable identity match is established, the agent should flag the technical trace as unverified and must not use a name match alone to select an isolation, change, or restore target.

### turn 42 — app-assistant

I’ll leave the shared component identifier unresolved. A name match alone cannot verify the technical path or select an isolation, change, or restore target.

For question **8**, which recorded **time values** let the agent compare the incident with a recent change or deployment? In particular, do you have an incident onset time, a change implementation time, and deployment start or completion times? I’ll use only the timestamps you confirm and treat timing as an investigation lead, not proof of cause.

### turn 42 — persona

We record when the **incident was detected** and **opened**, but not a separate verified onset time. For a **change**, we have planned start and end times, not a confirmed implementation timestamp in this scope. A **deployment** has actual start and completion times; the release also has a release date.

So the agent can compare deployment timing with incident detection and opening, and compare the change’s planned window as context. It must not call detection time the outage’s onset, treat a planned change time as actual execution, or infer causation from proximity alone.

### turn 43 — app-user

We record when the **incident was detected** and **opened**, but not a separate verified onset time. For a **change**, we have planned start and end times, not a confirmed implementation timestamp in this scope. A **deployment** has actual start and completion times; the release also has a release date.

So the agent can compare deployment timing with incident detection and opening, and compare the change’s planned window as context. It must not call detection time the outage’s onset, treat a planned change time as actual execution, or infer causation from proximity alone.

### turn 43 — app-tool

✓ Applied: 0 added, 4 updated.

### turn 43 — app-assistant

I’ve recorded the confirmed times: incident detection and opening, the change’s planned window, deployment’s actual start and completion, and the release date. I won’t treat detection as onset, a planned window as actual execution, or timing as proof of cause.

For the **emergency-change execution** check, should the Change record carry these decision values: **emergency designation**, **implementation plan**, **backout plan**, **explicit risk-acceptance state**, and **execution status**? If risk acceptance or technical verification is recorded elsewhere, please say where.

### turn 43 — persona

The **change record** carries the implementation plan, backout plan, risk level, and change status. Its emergency handling must also be identifiable so the agent applies the incident-justified workflow, but I cannot confirm a specified field for that designation.

**Explicit risk acceptance is required before execution**, but risk level is not proof of acceptance. I cannot confirm a recorded acceptance-state field or its authoritative source, so leave that mapping open and do not execute if acceptance cannot be established.

After implementation, update the change status and retain the technical checks, service-health results, and implementation evidence. Those verification results should not be inferred from the status alone.

### turn 44 — app-user

The **change record** carries the implementation plan, backout plan, risk level, and change status. Its emergency handling must also be identifiable so the agent applies the incident-justified workflow, but I cannot confirm a specified field for that designation.

**Explicit risk acceptance is required before execution**, but risk level is not proof of acceptance. I cannot confirm a recorded acceptance-state field or its authoritative source, so leave that mapping open and do not execute if acceptance cannot be established.

After implementation, update the change status and retain the technical checks, service-health results, and implementation evidence. Those verification results should not be inferred from the status alone.

### turn 44 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 44 — app-assistant

I’ve recorded the plans, risk level, and status on Change. I have **not** treated risk level as risk acceptance. The emergency designation’s recorded source and the authoritative risk-acceptance source remain open; execution must stop if acceptance cannot be established. Technical checks and service-health results need evidence beyond status.

For the records the agent **tracks after they are created**—Materiality Assessment, Regulatory Notification, Communication, Post-incident Review, and Corrective Action—does each have its own current status or state? A brief “yes/no” for each is enough; we can capture the precise values next.

### turn 44 — persona

- **Materiality assessment:** No status field; it has an **assessment result**.
- **Regulatory notification:** Yes, a status.
- **Communication:** Yes, a status.
- **Post-incident review:** No specified status field. Whether a required review is scheduled or completed must still be established for closure.
- **Corrective action:** Yes, a status.

### turn 45 — app-user

- **Materiality assessment:** No status field; it has an **assessment result**.
- **Regulatory notification:** Yes, a status.
- **Communication:** Yes, a status.
- **Post-incident review:** No specified status field. Whether a required review is scheduled or completed must still be established for closure.
- **Corrective action:** Yes, a status.

### turn 45 — app-tool

✓ Applied: 0 added, 4 updated.

### turn 45 — app-assistant

I’ve recorded the assessment result and the three confirmed statuses. I have not added a status field to Materiality Assessment or Post-incident Review.

For the closure check, **what recorded fact lets the agent establish that a required Post-incident Review is scheduled or completed?** Is that recorded on the review itself, in linked evidence, or is its source still open?

### turn 45 — persona

A linked post-incident review has a **held-on date**, which can establish that it took place if the record is reliable. The link alone does not establish completion.

There is no specified review status or scheduled-date field here, and I cannot identify an authoritative source for a scheduled review. Leave **scheduled** as an open source-mapping gap. For a major or cybersecurity incident, do not close it on the assumption that a linked review has been scheduled; verify that arrangement or a completed review first.

### turn 46 — app-user

A linked post-incident review has a **held-on date**, which can establish that it took place if the record is reliable. The link alone does not establish completion.

There is no specified review status or scheduled-date field here, and I cannot identify an authoritative source for a scheduled review. Leave **scheduled** as an open source-mapping gap. For a major or cybersecurity incident, do not close it on the assumption that a linked review has been scheduled; verify that arrangement or a completed review first.

### turn 46 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 46 — app-assistant

I’ve recorded the review’s held-on date as evidence that it took place. Scheduling remains an open source gap; a link to a review alone cannot satisfy closure for a major or cybersecurity incident.

For the **regulatory notification** action, which decision and verification values are recorded on the notification itself: **due time**, **required information completeness**, **approval**, **submission time**, **receipt or rejection**, and **remediation needed after rejection**? Please separate any of these that belong instead in linked Evidence Items.

### turn 46 — persona

On the **regulatory notification** itself, we record its **due time**, **submission time**, and **status**. Status distinguishes approval, submission, acceptance, and rejection; an approved status is required before submission.

**Completeness** is a pre-submission check, not a specified notification field: the required information and supporting evidence must be complete. Supporting evidence can be linked as **evidence items**. The submission receipt must be stored, but I would retain the receipt as evidence rather than infer success from a submission timestamp or “submitted” status. Verification then confirms acceptance or records the rejection and the remediation needed.

I cannot point to a specified field or source for the **remediation needed after rejection**, so leave its placement open rather than invent one. The submission must also occur before the notification’s recorded due time.

### turn 47 — app-user

On the **regulatory notification** itself, we record its **due time**, **submission time**, and **status**. Status distinguishes approval, submission, acceptance, and rejection; an approved status is required before submission.

**Completeness** is a pre-submission check, not a specified notification field: the required information and supporting evidence must be complete. Supporting evidence can be linked as **evidence items**. The submission receipt must be stored, but I would retain the receipt as evidence rather than infer success from a submission timestamp or “submitted” status. Verification then confirms acceptance or records the rejection and the remediation needed.

I cannot point to a specified field or source for the **remediation needed after rejection**, so leave its placement open rather than invent one. The submission must also occur before the notification’s recorded due time.

### turn 47 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 47 — app-tool

An additional ontology edit in this message was skipped — only one edit is applied per message.

### turn 47 — app-assistant

I’ve recorded due time and submission time on Regulatory Notification. Approval, acceptance, and rejection are distinguished by its status; completeness is a check, not a field. The receipt must be retained as evidence, and the placement of rejection remediation remains open.

For the **Communication** action, are **audience type, message content, communication owner, approval state, sent time, and delivery result** recorded on the Communication record? The Stakeholder link identifies the recipient; I won’t treat that link as proof of sending or delivery.

### turn 47 — persona

The **communication** record has an audience type, message summary, status, and sent time. Its status captures the approval state, but a status of “approved” does not prove the message was sent.

Before sending, we must also establish the **message and its owner** and check the content against the latest verified incident state. I cannot confirm a specified owner field or a field containing the full message. After sending, confirm delivery status and archive the final message; I cannot confirm a specified delivery-result field, so retain that verification rather than infer delivery from the sent time. The stakeholder link identifies the intended recipient, not proof of receipt.

### turn 48 — app-user

The **communication** record has an audience type, message summary, status, and sent time. Its status captures the approval state, but a status of “approved” does not prove the message was sent.

Before sending, we must also establish the **message and its owner** and check the content against the latest verified incident state. I cannot confirm a specified owner field or a field containing the full message. After sending, confirm delivery status and archive the final message; I cannot confirm a specified delivery-result field, so retain that verification rather than infer delivery from the sent time. The stakeholder link identifies the intended recipient, not proof of receipt.

### turn 48 — app-tool

✓ Applied: 1 added, 1 updated.

### turn 48 — app-assistant

I’ve recorded audience type, message summary, and sent time on Communication; its existing status covers approval state. I also linked notification evidence so a receipt can be retained without treating “submitted” as “accepted.” Communication owner, full message, and delivery result have no confirmed field or source yet, so sending or closure must not infer them from status or sent time.

For **Evidence Item**, what recorded values let the agent check that an item is the right artifact and that its integrity has been preserved? In particular, are its **description or type, recorded time, source, and integrity check** available, or should any remain open?

### turn 48 — persona

An **evidence item** records when it was **collected**, its **integrity status**, and a **cryptographic hash**. Those support an integrity check, but they do not, by themselves, establish that it is the *right* artifact for a particular restoration or submission. Its link to the incident—or inclusion in a regulatory notification—provides context, which still needs checking against the verification being claimed.

I cannot confirm a specified **description or type**, **source**, or separate **recorded-at time** beyond the collection time. Leave those as open identification and provenance gaps rather than assuming the hash or integrity status supplies them.

### turn 49 — app-user

An **evidence item** records when it was **collected**, its **integrity status**, and a **cryptographic hash**. Those support an integrity check, but they do not, by themselves, establish that it is the *right* artifact for a particular restoration or submission. Its link to the incident—or inclusion in a regulatory notification—provides context, which still needs checking against the verification being claimed.

I cannot confirm a specified **description or type**, **source**, or separate **recorded-at time** beyond the collection time. Leave those as open identification and provenance gaps rather than assuming the hash or integrity status supplies them.

### turn 49 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 49 — app-assistant

I’ve recorded collection time, integrity status, and cryptographic hash. They support an integrity check but do not identify the artifact’s purpose or prove it satisfies a particular restoration or submission check. Description, type, and source remain open.

For **Alert** and **Backup Set**, which action-critical values are recorded on each record? Specifically: does Alert record its **acknowledgement time** and **responsible resolver group**, and does Backup Set record a **recovery point** and **successful/verified status**? Please distinguish a recorded value from a check whose source is still unknown.

### turn 49 — persona

For an **alert**, status is recorded. Acknowledgement also records a timestamp, but I cannot confirm a specified timestamp field. There is no confirmed alert-to-resolver-group field or link; the responsible group and the acknowledger’s authorisation still need a reliable source before the action proceeds.

For a **backup set**, status is recorded, including whether it is **successful** or **verified**. It also records the dates of the last successful backup and last verification. It does **not** have a specified recovery-point field. The restore point must be identified and approved for the particular restore; the backup’s dates and status do not supply that approval.

### turn 50 — app-user

For an **alert**, status is recorded. Acknowledgement also records a timestamp, but I cannot confirm a specified timestamp field. There is no confirmed alert-to-resolver-group field or link; the responsible group and the acknowledger’s authorisation still need a reliable source before the action proceeds.

For a **backup set**, status is recorded, including whether it is **successful** or **verified**. It also records the dates of the last successful backup and last verification. It does **not** have a specified recovery-point field. The restore point must be identified and approved for the particular restore; the backup’s dates and status do not supply that approval.

### turn 50 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 50 — app-assistant

I’ve recorded the backup’s last successful and last verification dates. Alert acknowledgement needs a timestamp, but its field is unconfirmed; the responsible group and authorisation source also remain open. Backup status and dates do not identify or approve a restore point.

For question **9**, what is recorded on a **Materiality Assessment** besides its result? In particular, does it carry the **rationale**, an explicit **reportable/not-reportable outcome**, and the **approved procedure used**? I’ll keep any unconfirmed source open rather than turn the agent’s interpretation into a reporting determination.

### turn 50 — persona

The assessment records **when it was made**, its **result**, the **rationale**, and a **reporting due time** where applicable. The result explicitly distinguishes *reportable* from *not reportable*; it also allows an unresolved outcome, so the agent must not treat “not yet decided” as “not reportable.”

There is no specified field linking the assessment to the **approved procedure used**, nor a specified source for that procedure here. Leave that mapping open. The agent can present the recorded result and rationale, but should not manufacture the determination or its governing criteria.

### turn 51 — app-user

The assessment records **when it was made**, its **result**, the **rationale**, and a **reporting due time** where applicable. The result explicitly distinguishes *reportable* from *not reportable*; it also allows an unresolved outcome, so the agent must not treat “not yet decided” as “not reportable.”

There is no specified field linking the assessment to the **approved procedure used**, nor a specified source for that procedure here. Leave that mapping open. The agent can present the recorded result and rationale, but should not manufacture the determination or its governing criteria.

### turn 51 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 51 — app-assistant

I’ve recorded the assessment time, rationale, and reporting due time where applicable. Its result will distinguish reportable, not reportable, and unresolved; an unresolved result cannot be treated as a decision not to report. The approved procedure’s source remains open.

For question **11**, does each **Corrective Action** record its **description** and **owning Organizational Unit** through the link we captured, with its existing status showing whether it remains open? Is there a separately recorded due date or other value the agent needs for that question?

### turn 51 — persona

Yes. A **corrective action** has a description, a status, and a **due date**; its link to an **organizational unit** identifies the owner. Status tells us where the action stands, so the agent should show the actual value rather than assume every action short of “closed” is simply “open”—for example, one may be blocked, implemented, or awaiting verification.

The due date helps prioritise follow-up. It does not resolve the separate applicability gap: the review path alone still does not prove the action is for the affected IT service.

### turn 52 — app-user

Yes. A **corrective action** has a description, a status, and a **due date**; its link to an **organizational unit** identifies the owner. Status tells us where the action stands, so the agent should show the actual value rather than assume every action short of “closed” is simply “open”—for example, one may be blocked, implemented, or awaiting verification.

The due date helps prioritise follow-up. It does not resolve the separate applicability gap: the review path alone still does not prove the action is for the affected IT service.

### turn 52 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 52 — app-assistant

I’ve recorded the corrective action’s description and due date. Its status and owning unit are already represented; neither its due date nor the review path proves applicability to the affected service.

For question **6**, what recorded facts let the agent check whether a **Runbook** or **Workaround** is applicable and safe *now*? Are there decision values on either record—such as applicability conditions or pre-use checks—or is that information only in the procedure text or an as-yet-unmapped source?

### turn 52 — persona

There are **no specified decision fields** on the runbook or workaround that establish applicability or safety at the time of use. A known error can record a diagnosed cause and workaround summary, and a workaround can be documented in a runbook. Those help the agent find a candidate—not authorise its use.

The agent should check the candidate against the affected service or component and the latest verified incident state, then have the relevant procedure and pre-use checks confirmed before acting. I cannot point to a specified structured field or authoritative source for those applicability conditions, so leave that mapping open. The fact that a runbook was used on an incident also does not prove it is safe for this one.

### turn 53 — app-user

There are **no specified decision fields** on the runbook or workaround that establish applicability or safety at the time of use. A known error can record a diagnosed cause and workaround summary, and a workaround can be documented in a runbook. Those help the agent find a candidate—not authorise its use.

The agent should check the candidate against the affected service or component and the latest verified incident state, then have the relevant procedure and pre-use checks confirmed before acting. I cannot point to a specified structured field or authoritative source for those applicability conditions, so leave that mapping open. The fact that a runbook was used on an incident also does not prove it is safe for this one.

### turn 53 — app-assistant

I’ll leave Runbook and Workaround applicability and pre-use checks as an open source gap. Their links help find candidates, but neither a known error nor prior runbook use authorises use in the current incident.

For **failover**, does the Recovery Plan record anything the agent can use to check that it applies to the affected IT Service and that the proposed data-recovery point is acceptable? Or must those checks be established from another source that has not yet been mapped?

### turn 53 — persona

The **Recovery Plan → recovers → IT Service** link lets the agent check whether the plan is associated with the affected service. The plan also records a **recovery time objective**, **recovery point objective**, and **last review date**.

Those values do **not** by themselves establish that the proposed data-recovery point is acceptable for this failover. The agent must check the proposed point against the applicable recovery requirements; I cannot identify a specified source for that acceptance decision. If it cannot establish acceptance—or that the target recovery environment is available—it must not proceed.

### turn 54 — app-user

The **Recovery Plan → recovers → IT Service** link lets the agent check whether the plan is associated with the affected service. The plan also records a **recovery time objective**, **recovery point objective**, and **last review date**.

Those values do **not** by themselves establish that the proposed data-recovery point is acceptable for this failover. The agent must check the proposed point against the applicable recovery requirements; I cannot identify a specified source for that acceptance decision. If it cannot establish acceptance—or that the target recovery environment is available—it must not proceed.

### turn 54 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 54 — app-assistant

I’ve recorded the plan’s recovery time objective, recovery point objective, and last review date. Its service link establishes association, but not acceptance of a proposed recovery point; that acceptance and target availability remain open checks.

**What units are used for the recovery time objective and recovery point objective**—for example, are both stored as a number of minutes, or are they recorded differently? I won’t assume a unit for either.

### turn 54 — persona

I can confirm only that both are recorded as **numeric values**. I cannot confirm their units or that the two use the same unit. Leave the units open, and do not compare either value with an observed or proposed time until its unit is established.

### turn 55 — app-user

I can confirm only that both are recorded as **numeric values**. I cannot confirm their units or that the two use the same unit. Leave the units open, and do not compare either value with an observed or proposed time until its unit is established.

### turn 55 — app-assistant

I’ll leave both recovery-objective units open. Until each unit is established, the agent must not compare those numbers with a proposed or observed time.

For question **6**, does **Known Error** record the **diagnosed cause** and a **workaround summary** on its own record, as distinct from the linked Workaround and Runbook?

### turn 55 — persona

Yes. The **known error** records a diagnosed cause and a workaround summary. The summary is descriptive; the linked **workaround** is the separately identifiable temporary method, which may be documented in a **runbook**. Neither the summary nor those links establishes that the method is safe for this incident without the applicability checks we discussed.

### turn 56 — app-user

Yes. The **known error** records a diagnosed cause and a workaround summary. The summary is descriptive; the linked **workaround** is the separately identifiable temporary method, which may be documented in a **runbook**. Neither the summary nor those links establishes that the method is safe for this incident without the applicability checks we discussed.

### turn 56 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 56 — app-assistant

I’ve recorded the Known Error’s diagnosed cause and workaround summary. They help explain a candidate workaround but do not establish that it is safe to use.

For **containment and closure**, where can the agent verify the recorded containment scope and expected side effects, the accepted residual service condition, and the completed restoration checks? Are these available in linked Evidence Items, on the Incident or IT Service, or is any placement still unspecified?

### turn 56 — persona

These are three different checks:

- **Containment scope and expected side effects** must be recorded before containment, but I cannot confirm a specified field or record where they live. Their placement remains open. After the steps, retain evidence of the containment indicators and remaining service impact; “contained” status alone is not verification.
- **Accepted residual service condition:** the IT service has a health state, but no specified field or source records acceptance of a residual condition. If a service is not healthy, the agent must establish that acceptance rather than infer it from the health state.
- **Completed restoration checks:** retain the results as evidence items linked to the incident, and check the impacted services’ health states. The evidence link alone is not enough—the agent must verify that the artifacts actually document restoration.

Without the required restoration evidence or a reliably established residual-condition acceptance, the agent should not close the incident.

### turn 57 — app-user

These are three different checks:

- **Containment scope and expected side effects** must be recorded before containment, but I cannot confirm a specified field or record where they live. Their placement remains open. After the steps, retain evidence of the containment indicators and remaining service impact; “contained” status alone is not verification.
- **Accepted residual service condition:** the IT service has a health state, but no specified field or source records acceptance of a residual condition. If a service is not healthy, the agent must establish that acceptance rather than infer it from the health state.
- **Completed restoration checks:** retain the results as evidence items linked to the incident, and check the impacted services’ health states. The evidence link alone is not enough—the agent must verify that the artifacts actually document restoration.

Without the required restoration evidence or a reliably established residual-condition acceptance, the agent should not close the incident.

### turn 57 — app-assistant

I’ll leave containment scope and side effects, and acceptance of a residual service condition, as open source mappings. Restoration checks belong in linked Evidence Items, but the agent must inspect what they actually verify and check service health. A “contained” status or evidence link alone cannot justify closure.

One remaining classification check: **does Event’s recorded `eventType` reliably identify whether an event is security-relevant**, so the Security Operations Centre link and cybersecurity investigation use the right events? Or is that distinction’s source still open?

### turn 57 — persona

I cannot confirm that the event’s type reliably identifies security relevance. It is a text value, with no specified controlled choices or rule that makes a particular value a security-event designation.

The **security-event distinction must be established from a reliable source** before treating the event as one monitored by the Security Operations Centre or as the source of a cybersecurity incident. Leave that source mapping open; do not infer it from an arbitrary event-type string.

### turn 58 — app-user

I cannot confirm that the event’s type reliably identifies security relevance. It is a text value, with no specified controlled choices or rule that makes a particular value a security-event designation.

The **security-event distinction must be established from a reliable source** before treating the event as one monitored by the Security Operations Centre or as the source of a cybersecurity incident. Leave that source mapping open; do not infer it from an arbitrary event-type string.

### turn 58 — app-assistant

I’ll leave security-event designation as an open source mapping. An arbitrary Event type string is not enough to establish that Security Operations Centre monitors it or that it sourced a cybersecurity incident.

For question **3**, when the Service Desk records a reported issue, **is its detection source recorded on the Incident itself**? If so, is that a value the agent can use to distinguish a reported issue from alert- or event-led detection, without treating the source as proof of correlation?

### turn 58 — persona

Yes. The **incident has a detection-source value**, so the agent can distinguish a Service Desk or user-reported route from monitoring-led detection. It describes how the issue came to attention; it does **not** prove that a particular alert or event is correlated with the incident. Use the recorded incident-to-alert and incident-to-event links for that.

### turn 59 — app-user

Yes. The **incident has a detection-source value**, so the agent can distinguish a Service Desk or user-reported route from monitoring-led detection. It describes how the issue came to attention; it does **not** prove that a particular alert or event is correlated with the incident. Use the recorded incident-to-alert and incident-to-event links for that.

### turn 59 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 59 — app-assistant

I’ve recorded Incident detection source. It identifies how the issue came to attention, not which alert or event belongs with it; correlation still requires the direct links.

**Decision-value recap:** the model now holds incident and alert state, incident severity and designations, service health, backup and recovery-plan values, change and deployment timing, assessment and notification facts, communication status and timing, evidence integrity, and corrective-action follow-up. We’ve also kept the unresolved sources explicit—especially group suitability and authorisation, component identity, recovery acceptance, review scheduling, and evidence applicability.

**Does that accurately cover the decision and verification values needed for your listed questions and actions?** If so, I’ll check the everyday meanings and alternative names next.

### turn 59 — persona

Yes, that’s an accurate recap of the decision and verification values we’ve covered. Keep the open checks visible rather than turning them into assumed fields or approvals.

I’d add **isolation impact and a rollback or reconnection method** to the action checks, and **approval of the restore point and target environment** to the restore checks. Neither is established merely by identifying the component or backup. With those carried forward, we can move to everyday terms and alternative names.

### turn 60 — app-user

Yes, that’s an accurate recap of the decision and verification values we’ve covered. Keep the open checks visible rather than turning them into assumed fields or approvals.

I’d add **isolation impact and a rollback or reconnection method** to the action checks, and **approval of the restore point and target environment** to the restore checks. Neither is established merely by identifying the component or backup. With those carried forward, we can move to everyday terms and alternative names.

### turn 60 — app-assistant

I’ll carry forward isolation impact and a rollback or reconnection method as separate isolation checks, plus explicit approval of both the restore point and target environment. Identifying the component or backup does not satisfy them.

Before aliases, two recorded meanings need a wording check: **Communication** currently says “a message … sent,” and **Regulatory Notification** says “a formal submission.” Both records exist before sending. Should their meanings instead say **a message prepared for or sent to a stakeholder** and **a formal notification prepared for or submitted to a regulator**?

### turn 60 — persona

Yes, that wording is more precise for the record’s full lifecycle. A **communication** can be drafted and approved before it is sent; a **regulatory notification** can likewise be prepared and approved before submission.

Keep the action boundary clear: a drafted or approved record is **not** evidence of delivery or submission. Check the sent or submitted state and time, then verify delivery or the authority’s acceptance separately.

### turn 61 — app-user

Yes, that wording is more precise for the record’s full lifecycle. A **communication** can be drafted and approved before it is sent; a **regulatory notification** can likewise be prepared and approved before submission.

Keep the action boundary clear: a drafted or approved record is **not** evidence of delivery or submission. Check the sent or submitted state and time, then verify delivery or the authority’s acceptance separately.

### turn 61 — app-tool

✓ Applied: 0 added, 2 updated.

### turn 61 — app-assistant

I’ve updated both meanings so they cover preparation as well as sending or submission. Approval alone still proves neither delivery nor acceptance.

I’ve drafted plain meanings for the classes from your descriptions. To check the distinctions most likely to be confused, are these five meanings right, or would you change any?

- **Event:** an observed occurrence, not necessarily requiring response.
- **Alert:** a signal requiring triage or acknowledgement, not automatically an incident.
- **Incident:** a managed interruption, degradation, or security condition.
- **Problem:** a record grouping related incidents for underlying-cause investigation.
- **Known Error:** a record documenting a diagnosed problem and potentially identifying a workaround.

### turn 61 — persona

Those are right in substance. I’d tighten two:

- **Incident:** an **unplanned** interruption, degradation, or security condition **requiring managed response**. That separates it from a noteworthy event that needs no incident response.
- **Problem:** the **underlying cause or potential cause** of one or more incidents. It can group related incidents, but grouping is what the problem record *does*, not its whole meaning.

A **known error** is a diagnosed problem with a documented cause or workaround. It can help identify a candidate workaround; it does not certify that workaround for the current incident. Your event and alert meanings work as written.

### turn 62 — app-user

Those are right in substance. I’d tighten two:

- **Incident:** an **unplanned** interruption, degradation, or security condition **requiring managed response**. That separates it from a noteworthy event that needs no incident response.
- **Problem:** the **underlying cause or potential cause** of one or more incidents. It can group related incidents, but grouping is what the problem record *does*, not its whole meaning.

A **known error** is a diagnosed problem with a documented cause or workaround. It can help identify a candidate workaround; it does not certify that workaround for the current incident. Your event and alert meanings work as written.

### turn 62 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 62 — app-assistant

I’ve tightened those five meanings, especially the distinction between an Event and an Incident, and between a Problem and its Known Error.

Next I’ll check plain-language meanings for a small group of **recovery connections**. Are these accurate?

- **Recovery Plan → recovers → IT Service:** the plan applies to recovering that service.
- **Recovery Plan → uses → Backup Set:** the plan identifies a backup set it may use, not approval to restore it.
- **Backup Set → protects → Configuration Item:** the set contains recoverable data for that managed component.
- **IT Service → deployed in → Environment:** the service has a recorded deployment there, not necessarily the target chosen for this failover.
- **Configuration Item → belongs to → Environment:** the component is recorded in that environment.

Please correct any meaning that claims more than the link establishes.

### turn 62 — persona

Yes, those meanings are accurate. I’d keep two limits explicit:

- **Recovery Plan → uses → Backup Set** identifies a backup the plan uses; it does not establish that a particular restore point is suitable or approved.
- **IT Service → is deployed in → Environment** identifies a deployment context; it does not identify the environment selected for this failover or prove that target is available.

The other three descriptions do not claim more than their links establish.

### turn 63 — app-user

Yes, those meanings are accurate. I’d keep two limits explicit:

- **Recovery Plan → uses → Backup Set** identifies a backup the plan uses; it does not establish that a particular restore point is suitable or approved.
- **IT Service → is deployed in → Environment** identifies a deployment context; it does not identify the environment selected for this failover or prove that target is available.

The other three descriptions do not claim more than their links establish.

### turn 63 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 63 — app-assistant

I’ve saved those five recovery-connection meanings, including the two limits you highlighted.

For **incident detection and correlation**, are these five connection meanings accurate?

- **Alert → indicates → Event:** the alert signals an observed event, without itself proving an incident.
- **Incident → correlated from → Event:** the event has been associated with this incident, not automatically converted into one.
- **Incident → triggered by → Alert:** the alert prompted this incident record; other alerts need not.
- **Alert → generated by → Monitoring Rule:** the rule generated this alert.
- **Monitoring Rule → executed by → Monitoring Tool:** that tool executed the rule.

Please correct any that overstates the recorded fact.

### turn 63 — persona

Yes, those five meanings are accurate. They keep **observation**, **signal**, and **managed incident** separate.

For the last two, the rule-to-tool link tells us which monitoring tool executes the rule; it does not, by itself, establish that the alert was acknowledged or that anyone acted on it. Those require the alert’s own state and action record.

### turn 64 — app-user

Yes, those five meanings are accurate. They keep **observation**, **signal**, and **managed incident** separate.

For the last two, the rule-to-tool link tells us which monitoring tool executes the rule; it does not, by itself, establish that the alert was acknowledged or that anyone acted on it. Those require the alert’s own state and action record.

### turn 64 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 64 — app-assistant

I’ve saved those five meanings. They distinguish observation, alerting, and incident response; the monitoring links say nothing about acknowledgement.

For the **service-impact and technical-path** connections, are these meanings accurate as a group?

- Business Service → **delivered through** → Customer Channel: how customers access the capability.
- Business Service → **depends on** → IT Service: a supporting managed technology capability.
- IT Service → **depends on** → Third-party Service: an externally provided dependency.
- IT Service → **implemented by** → Application: an application implementing the service.
- IT Service → **runs on** → Infrastructure Component, and Application → **runs on** → Infrastructure Component: the recorded hosting paths, not proof that similarly named Configuration Item records are identical.

### turn 64 — persona

Yes, those meanings are accurate. Keep the last qualification: the technical-path links tell us which infrastructure components the service or application runs on, but a similar name does not verify that a component is the same managed item referenced for isolation, change, or backup protection. That match still needs reliable shared identity.

### turn 65 — app-user

Yes, those meanings are accurate. Keep the last qualification: the technical-path links tell us which infrastructure components the service or application runs on, but a similar name does not verify that a component is the same managed item referenced for isolation, change, or backup protection. That match still needs reliable shared identity.

### turn 65 — app-tool

✓ Applied: 0 added, 6 updated.

### turn 65 — app-assistant

I’ve saved those technical-path meanings and the shared-identity caution.

For **incident impact and staffing**, do these grouped meanings match what is recorded?

- Incident → **impacts** → Business Service / IT Service: a recorded service impact, not proof of the current health state.
- Incident → **affects** → Configuration Item: a recorded affected component, not authorisation to isolate it.
- Incident → **assigned to** → Resolver Group: the assignment made, not proof the group was suitable.
- Incident → **handled by** → On-call Engineer: the engineer actually recorded as handling it.
- Incident → **coordinated by** → Incident Commander: the assigned commander, not a declaration by itself.

### turn 65 — persona

Yes, those meanings match. In particular, keep **recorded impact or assignment** separate from **current state and action authority**. A commander link identifies who coordinates the incident; major-incident declaration still has its own eligibility checks, declaration time, and coordination steps.

### turn 66 — app-user

Yes, those meanings match. In particular, keep **recorded impact or assignment** separate from **current state and action authority**. A commander link identifies who coordinates the incident; major-incident declaration still has its own eligibility checks, declaration time, and coordination steps.

### turn 66 — app-tool

✓ Applied: 0 added, 6 updated.

### turn 66 — app-assistant

I’ve saved those impact and staffing meanings, keeping recorded facts separate from current state and authority.

For the **roles and operating functions**, are these plain meanings right?

- **Service Owner** is accountable for the IT Service; **IT Operations Team** operates it day to day.
- **Resolver Group** is assigned technical diagnosis and restoration; **On-call Engineer** is an available member, not automatically the incident handler.
- **Incident Commander** coordinates a major-incident response; **Incident Response Team** is the cross-functional team coordinating it.
- **Service Desk** records and routes reported incidents; **Network Operations Centre** operates monitoring tools; **Security Operations Centre** monitors security-relevant events.

Please correct only distinctions these descriptions miss.

### turn 66 — persona

Those distinctions are right. I’d sharpen one: during a major incident, the **incident commander is accountable for command, coordination, and the decision cadence**—not just a participant who coordinates. The **incident response team** coordinates the cross-functional response, while the resolver group and assigned engineer do the relevant technical diagnosis and restoration.

### turn 67 — app-user

Those distinctions are right. I’d sharpen one: during a major incident, the **incident commander is accountable for command, coordination, and the decision cadence**—not just a participant who coordinates. The **incident response team** coordinates the cross-functional response, while the resolver group and assigned engineer do the relevant technical diagnosis and restoration.

### turn 67 — app-tool

✓ Applied: 0 added, 4 updated.

### turn 67 — app-assistant

I’ve sharpened the commander, response-team, resolver-group, and engineer meanings. The commander owns the command and decision cadence; technical repair remains with the assigned technical responders.

For **ownership and staffing connections**, are these five meanings accurate?

- Service Owner → **owns** → IT Service: lifecycle accountability.
- IT Operations Team → **operates** → IT Service: day-to-day operation.
- On-call Engineer → **member of** → Resolver Group: membership, not authorisation or incident assignment.
- Incident Commander → **member of** → Incident Response Team: team membership, not proof of declaration.
- Incident Response Team → **coordinates** → Incident: applies only once that incident is declared major.

### turn 67 — persona

The first four meanings are accurate. For the fifth, I would make the target **Major Incident**, not Incident generally: **Incident Response Team → coordinates → Major Incident**. In a canvas with one incident record, apply that connection only when its major-incident designation has been established. Team membership or a commander assignment alone does not establish that designation.

### turn 68 — app-user

The first four meanings are accurate. For the fifth, I would make the target **Major Incident**, not Incident generally: **Incident Response Team → coordinates → Major Incident**. In a canvas with one incident record, apply that connection only when its major-incident designation has been established. Team membership or a commander assignment alone does not establish that designation.

### turn 68 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 68 — app-assistant

I’ve saved those five meanings. Since Major Incident uses the same Incident record, the team-to-incident connection explicitly applies **only after the major designation is established**; it is not a link to every incident.

For the **procedure and problem-investigation connections**, are these five meanings accurate?

- Incident → **handled with** → Runbook: a procedure used for this incident, not automatic suitability for another.
- Workaround → **documented in** → Runbook: where the temporary method is described, not approval to use it.
- Problem → **groups** → Incident: an incident associated with the underlying-cause investigation.
- Problem → **documented by** → Known Error: the diagnosed problem has a known-error record.
- Known Error → **has** → Workaround: a candidate temporary method, not proof it was applied or worked.

### turn 68 — persona

Yes, those five meanings are accurate. One nuance: a **known error** documents a diagnosed problem with a cause **or** workaround, so do not require every known-error record to have a separate linked workaround. When that link exists, it identifies a candidate method—not its approval, use, or success in the current incident.

### turn 69 — app-user

Yes, those five meanings are accurate. One nuance: a **known error** documents a diagnosed problem with a cause **or** workaround, so do not require every known-error record to have a separate linked workaround. When that link exists, it identifies a candidate method—not its approval, use, or success in the current incident.

### turn 69 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 69 — app-assistant

I’ve saved those five meanings. The Known Error → Workaround link is optional; its presence identifies a candidate, not approval or success.

For **change-history connections**, are these meanings accurate?

- Change → **implemented by** → Release: the release carries that approved change.
- Release → **delivered by** → Deployment: the deployment technically delivers the release.
- Change → **modifies** → Configuration Item: the managed component in its modification scope.
- Change → **justified by** → Incident: only for a change handled through the emergency workflow.
- Incident → **resolved by** → Change: a change that actually resolved it, not a cause of it.

### turn 69 — persona

Yes, with one wording refinement: **an emergency change is justified by an incident**. I would not read “Change → justified by → Incident” as a connection available for changes generally.

The other four meanings are accurate. In particular, **resolved by a change** records what helped resolve the incident; it does not say that change caused it.

### turn 70 — app-user

Yes, with one wording refinement: **an emergency change is justified by an incident**. I would not read “Change → justified by → Incident” as a connection available for changes generally.

The other four meanings are accurate. In particular, **resolved by a change** records what helped resolve the incident; it does not say that change caused it.

### turn 70 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 70 — app-assistant

I’ve saved those change-history meanings, including the emergency-only condition on “justified by.”

For **reporting and vendor connections**, are these meanings accurate?

- Vendor → **provides** → Third-party Service: the provider of that external service.
- Incident → **escalated to** → Vendor: an escalation that actually occurred, not one inferred from a dependency.
- Incident → **evaluated through** → Materiality Assessment: a recorded assessment of that incident.
- Materiality Assessment → **triggers** → Regulatory Notification: only when the result requires notification.
- Regulatory Notification → **reports** → Incident and → **sent to** → Regulator: what the submission is about and its intended authority, without either link proving submission or acceptance.

### turn 70 — persona

Yes, those meanings are accurate. I’d phrase the third as **Incident → is evaluated by → Materiality Assessment**: the assessment records the determination about that incident.

Keep the reporting boundary explicit: an assessment does not automatically trigger a notification. **Reportable** is the result required before submission, and the notification’s incident and regulator links identify what it reports and where it is intended to go. Neither link proves submission or acceptance. Likewise, a vendor dependency does not prove an escalation occurred.

### turn 71 — app-user

Yes, those meanings are accurate. I’d phrase the third as **Incident → is evaluated by → Materiality Assessment**: the assessment records the determination about that incident.

Keep the reporting boundary explicit: an assessment does not automatically trigger a notification. **Reportable** is the result required before submission, and the notification’s incident and regulator links identify what it reports and where it is intended to go. Neither link proves submission or acceptance. Likewise, a vendor dependency does not prove an escalation occurred.

### turn 71 — app-tool

✓ Applied: 0 added, 6 updated.

### turn 71 — app-assistant

I’ve saved those reporting and vendor meanings. The recorded assessment result—not the existence of an assessment—governs whether the notification path applies.

For **communications, evidence, and review**, are these meanings accurate as a group?

- Communication → **about** → Incident and → **addressed to** → Stakeholder: its subject and intended recipient, not proof of delivery.
- Incident → **supported by** → Evidence Item: an associated artifact, whose relevance and integrity still need checking.
- Regulatory Notification → **supported by** → Evidence Item: supporting material or receipt, not proof of acceptance by itself.
- Incident → **reviewed in** → Post-incident Review: the review concerns the incident, not proof it was held.
- Post-incident Review → **produces** → Corrective Action, and Corrective Action → **owned by** → Organizational Unit: follow-up work and its accountable unit, not proof it applies to every impacted service.

### turn 71 — persona

Mostly yes. I’d refine the **regulatory notification–evidence** connection: it identifies evidence **included with the notification**, rather than any artifact that generally supports it. A submission receipt should also be retained, but an included evidence item does not, by itself, prove acceptance.

The other meanings hold. The communication links identify its subject and intended recipient, not delivery. An evidence link still needs relevance and integrity checks. A review link does not prove the review was held or scheduled, and its corrective actions are not automatically applicable to every service the incident impacted.

### turn 72 — app-user

Mostly yes. I’d refine the **regulatory notification–evidence** connection: it identifies evidence **included with the notification**, rather than any artifact that generally supports it. A submission receipt should also be retained, but an included evidence item does not, by itself, prove acceptance.

The other meanings hold. The communication links identify its subject and intended recipient, not delivery. An evidence link still needs relevance and integrity checks. A review link does not prove the review was held or scheduled, and its corrective actions are not automatically applicable to every service the incident impacted.

### turn 72 — app-tool

✓ Applied: 0 added, 7 updated.

### turn 72 — app-tool

🔍 Checked the current ontology state.

### turn 72 — app-assistant

I checked the live canvas. Most connections now have a plain meaning; five detection-path connections still need one. Are these accurate?

- **Service Desk → records → Incident:** the desk created the managed incident record, not necessarily that it resolved it.
- **Network Operations Centre → operates → Monitoring Tool:** the centre operates that tool.
- **Monitoring Tool → monitors → IT Service / Configuration Item:** the tool observes each recorded target, not necessarily its complete health.
- **Security Operations Centre → monitors → Event:** this applies only once the event’s security relevance is reliably established.

### turn 72 — persona

Yes, with two small refinements:

- **Service Desk → records → Incident** means it receives and records the issue as an incident; it does not imply the desk resolved it.
- **Monitoring Tool → monitors → IT Service / Configuration Item** identifies what the tool monitors, not complete coverage or proof of the target’s current health.

The network-operations meaning is right. The security-operations connection applies to a **security event**, not events generally; if using one Event class, establish its security relevance reliably before applying that link.

### turn 73 — app-user

Yes, with two small refinements:

- **Service Desk → records → Incident** means it receives and records the issue as an incident; it does not imply the desk resolved it.
- **Monitoring Tool → monitors → IT Service / Configuration Item** identifies what the tool monitors, not complete coverage or proof of the target’s current health.

The network-operations meaning is right. The security-operations connection applies to a **security event**, not events generally; if using one Event class, establish its security relevance reliably before applying that link.

### turn 73 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 73 — app-assistant

I’ve saved those five meanings. Every recorded connection now has a plain description.

Next are **alternative names**. For these service and component classes, which other terms do your colleagues use for the *same thing*—not a related but different item: **Business Service, Customer Channel, IT Service, Configuration Item, and Infrastructure Component**? “None” is fine for any of them.

### turn 73 — persona

For the same items, colleagues may use:

- **Business service:** *üzleti szolgáltatás*.
- **Customer channel:** no other established term I’d add here.
- **IT service:** *informatics service* or *informatikai szolgáltatás*.
- **Configuration item:** *CI* or *konfigurációs elem*.
- **Infrastructure component:** *infrastruktúra-elem*.

I would not use “configuration item” as an alternative name for every infrastructure component, even where the component is managed in configuration scope. It is the broader managed-component concept, not a synonym.

### turn 74 — app-user

For the same items, colleagues may use:

- **Business service:** *üzleti szolgáltatás*.
- **Customer channel:** no other established term I’d add here.
- **IT service:** *informatics service* or *informatikai szolgáltatás*.
- **Configuration item:** *CI* or *konfigurációs elem*.
- **Infrastructure component:** *infrastruktúra-elem*.

I would not use “configuration item” as an alternative name for every infrastructure component, even where the component is managed in configuration scope. It is the broader managed-component concept, not a synonym.

### turn 74 — app-tool

✓ Applied: 0 added, 4 updated.

### turn 74 — app-assistant

I’ve saved those confirmed aliases and kept Configuration Item distinct from Infrastructure Component.

For the next group, what established alternative names mean exactly the same thing in your setting as **Event, Alert, Incident, Problem, and Known Error**? Please give only genuine synonyms; “none” is fine.

### turn 74 — persona

The established alternatives I’d use are:

- **Event:** *esemény*.
- **Alert:** *riasztás*.
- **Incident:** *incidens* or *hibajegy*.
- **Problem:** *probléma*.
- **Known error:** *ismert hiba*.

“Alert,” “event,” and “incident” are not synonyms for one another, even when they arise in the same sequence.

### turn 75 — app-user

The established alternatives I’d use are:

- **Event:** *esemény*.
- **Alert:** *riasztás*.
- **Incident:** *incidens* or *hibajegy*.
- **Problem:** *probléma*.
- **Known error:** *ismert hiba*.

“Alert,” “event,” and “incident” are not synonyms for one another, even when they arise in the same sequence.

### turn 75 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 75 — app-assistant

I’ve saved those alternatives and kept Event, Alert, and Incident distinct.

What established synonyms, if any, do you use for **Service Owner, IT Operations Team, Resolver Group, On-call Engineer, and Incident Commander**? Please list only terms that identify the same role or function, not a broader team or someone who sometimes fills the role.

### turn 75 — persona

- **Service owner:** *szolgáltatásgazda*.
- **IT operations team:** *IT üzemeltetés* or *üzemeltetési csapat*.
- **Resolver group:** *megoldócsoport* or *support group*.
- **On-call engineer:** *ügyeletes mérnök* or *on-call*.
- **Incident commander:** *incident manager*, *incidensparancsnok*, or *MIM lead*.

Those are alternative names for the respective roles or functions; they do not make a service owner the incident commander or an on-call engineer the whole resolver group.

### turn 76 — app-user

- **Service owner:** *szolgáltatásgazda*.
- **IT operations team:** *IT üzemeltetés* or *üzemeltetési csapat*.
- **Resolver group:** *megoldócsoport* or *support group*.
- **On-call engineer:** *ügyeletes mérnök* or *on-call*.
- **Incident commander:** *incident manager*, *incidensparancsnok*, or *MIM lead*.

Those are alternative names for the respective roles or functions; they do not make a service owner the incident commander or an on-call engineer the whole resolver group.

### turn 76 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 76 — app-assistant

I’ve saved those role aliases without merging the roles.

For **Incident Response Team, Service Desk, Network Operations Centre, and Security Operations Centre**, what established alternative names refer to each same function? I already have “network operations” and “security operations” for the two centres; please give any additional terms or say none.

### turn 76 — persona

- **Incident response team:** *IRT* or *incidenskezelő csapat*.
- **Service Desk:** *help desk*, *ügyfélszolgálati IT pult*, or *hibabejelentő*.
- **Network Operations Centre:** *NOC* or *hálózatüzemeltetési központ*, in addition to “network operations.”
- **Security Operations Centre:** *SOC* or *biztonsági műveleti központ*, in addition to “security operations.”

### turn 77 — app-user

- **Incident response team:** *IRT* or *incidenskezelő csapat*.
- **Service Desk:** *help desk*, *ügyfélszolgálati IT pult*, or *hibabejelentő*.
- **Network Operations Centre:** *NOC* or *hálózatüzemeltetési központ*, in addition to “network operations.”
- **Security Operations Centre:** *SOC* or *biztonsági műveleti központ*, in addition to “security operations.”

### turn 77 — app-tool

✓ Applied: 0 added, 4 updated.

### turn 77 — app-assistant

I’ve saved those team and desk aliases, retaining the two centre aliases already confirmed.

For the monitoring and third-party group, what established alternative names mean the same thing as **Monitoring Tool, Monitoring Rule, Third-party Service, and Vendor**? Please keep the service distinct from its provider.

### turn 77 — persona

- **Monitoring tool:** *monitoring platform* or *felügyeleti eszköz*.
- **Monitoring rule:** *alert rule* or *riasztási szabály*.
- **Third-party service:** *outsourced service* or *külső szolgáltatás*.
- **Vendor:** *supplier*, *szállító*, or *beszállító*.

The vendor supplies the third-party service; those names do not make the supplier and its service the same item.

### turn 78 — app-user

- **Monitoring tool:** *monitoring platform* or *felügyeleti eszköz*.
- **Monitoring rule:** *alert rule* or *riasztási szabály*.
- **Third-party service:** *outsourced service* or *külső szolgáltatás*.
- **Vendor:** *supplier*, *szállító*, or *beszállító*.

The vendor supplies the third-party service; those names do not make the supplier and its service the same item.

### turn 78 — app-tool

✓ Applied: 0 added, 4 updated.

### turn 78 — app-assistant

I’ve saved those aliases, with Vendor and Third-party Service still separate.

For **Runbook, Workaround, Recovery Plan, Backup Set, and Environment**, what established alternatives refer to the same item in your setting? “None” is fine; a procedure, mitigation, plan, backup, and target environment should not become synonyms for one another.

### turn 78 — persona

- **Runbook:** *üzemeltetési eljárás* or *playbook*.
- **Workaround:** *kerülőmegoldás*.
- **Recovery plan:** *helyreállítási terv* or *DR plan*.
- **Backup set:** *mentéskészlet* or *backup*.
- **Environment:** *környezet*.

Those are alternatives within each item type; none makes a backup, a recovery plan, or a workaround interchangeable.

### turn 79 — app-user

- **Runbook:** *üzemeltetési eljárás* or *playbook*.
- **Workaround:** *kerülőmegoldás*.
- **Recovery plan:** *helyreállítási terv* or *DR plan*.
- **Backup set:** *mentéskészlet* or *backup*.
- **Environment:** *környezet*.

Those are alternatives within each item type; none makes a backup, a recovery plan, or a workaround interchangeable.

### turn 79 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 79 — app-assistant

I’ve saved those recovery and procedure aliases, keeping the items distinct.

What established alternative names do you use for **Change, Release, Deployment, Application, and Organizational Unit**? Please distinguish a change record from the release packaging it and the deployment delivering it.

### turn 79 — persona

- **Change:** *változás* or *módosítás*.
- **Release:** *kiadás*.
- **Deployment:** *telepítés* or *élesítés*.
- **Application:** *alkalmazás* or *app*.
- **Organizational unit:** *szervezeti egység*.

A change is the controlled modification, a release packages approved changes, and a deployment is the technical execution. Those alternatives do not collapse the three records.

### turn 80 — app-user

- **Change:** *változás* or *módosítás*.
- **Release:** *kiadás*.
- **Deployment:** *telepítés* or *élesítés*.
- **Application:** *alkalmazás* or *app*.
- **Organizational unit:** *szervezeti egység*.

A change is the controlled modification, a release packages approved changes, and a deployment is the technical execution. Those alternatives do not collapse the three records.

### turn 80 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 80 — app-assistant

I’ve saved those aliases without collapsing Change, Release, and Deployment.

For the reporting and follow-up group, what established alternatives mean the same thing as **Materiality Assessment, Regulatory Notification, Regulator, Post-incident Review, and Corrective Action**? Please keep the assessment, submission, authority, review, and follow-up work distinct.

### turn 80 — persona

- **Materiality assessment:** *reportability assessment* or *lényegességi értékelés*.
- **Regulatory notification:** *supervisory notification* or *felügyeleti bejelentés*.
- **Regulator:** *supervisory authority* or *felügyeleti hatóság*.
- **Post-incident review:** *PIR*, *RCA review*, or *incidens utóelemzés*.
- **Corrective action:** *remediation action* or *helyesbítő intézkedés*.

The assessment records a determination; the notification is the formal submission; the regulator receives it. The review examines the incident, while a corrective action tracks resulting work.

### turn 81 — app-user

- **Materiality assessment:** *reportability assessment* or *lényegességi értékelés*.
- **Regulatory notification:** *supervisory notification* or *felügyeleti bejelentés*.
- **Regulator:** *supervisory authority* or *felügyeleti hatóság*.
- **Post-incident review:** *PIR*, *RCA review*, or *incidens utóelemzés*.
- **Corrective action:** *remediation action* or *helyesbítő intézkedés*.

The assessment records a determination; the notification is the formal submission; the regulator receives it. The review examines the incident, while a corrective action tracks resulting work.

### turn 81 — app-tool

✓ Applied: 0 added, 5 updated.

### turn 81 — app-assistant

I’ve saved those reporting and follow-up aliases.

For the remaining three classes, what established synonyms, if any, do you use for **Communication, Evidence Item, and Stakeholder**? Please distinguish an intended stakeholder from a message actually delivered to them.

### turn 81 — persona

- **Communication:** *értesítés* or *tájékoztatás*.
- **Evidence item:** *evidence* or *bizonyíték*.
- **Stakeholder:** *érintett*.

A stakeholder is the intended recipient when a communication is addressed to them. That connection does not show the message was sent or delivered; those need separate checks.

### turn 82 — app-user

- **Communication:** *értesítés* or *tájékoztatás*.
- **Evidence item:** *evidence* or *bizonyíték*.
- **Stakeholder:** *érintett*.

A stakeholder is the intended recipient when a communication is addressed to them. That connection does not show the message was sent or delivered; those need separate checks.

### turn 82 — app-tool

✓ Applied: 0 added, 3 updated.

### turn 82 — app-assistant

I’ve saved those three aliases. The Stakeholder link still identifies an intended recipient, not delivery.

Now for **relationship wording**: do colleagues use other verb phrases for any of these same connections—**Business Service delivered through Customer Channel**, **Business Service depends on IT Service**, **IT Service depends on Third-party Service**, **IT Service implemented by Application**, or **Application runs on Infrastructure Component**? “No other phrasing” is fine for any of them.

### turn 82 — persona

No other established phrasing I’d add for those five. I’d keep **“delivered through,” “depends on,” “implemented by,”** and **“runs on”** distinct: access channel, dependency, implementation, and hosting are different connections.

### turn 83 — app-user

No other established phrasing I’d add for those five. I’d keep **“delivered through,” “depends on,” “implemented by,”** and **“runs on”** distinct: access channel, dependency, implementation, and hosting are different connections.

### turn 83 — app-assistant

I’ll leave those five relationship alias lists empty and keep access, dependency, implementation, and hosting distinct.

Are there established alternative phrasings for these **incident-impact and assignment** connections: Incident **impacts Business Service**, **impacts IT Service**, **affects Configuration Item**, **assigned to Resolver Group**, and **handled by On-call Engineer**? Only phrases that mean the same recorded fact, please; “none” is fine.

### turn 83 — persona

No additional established verb phrases I’d record for those five. In particular, **“affects a configuration item”** is not an alternative way of saying **“impacts an IT service,”** and **“assigned to a resolver group”** is not proof that a particular on-call engineer is handling the incident.

### turn 84 — app-user

No additional established verb phrases I’d record for those five. In particular, **“affects a configuration item”** is not an alternative way of saying **“impacts an IT service,”** and **“assigned to a resolver group”** is not proof that a particular on-call engineer is handling the incident.

### turn 84 — app-assistant

I’ll leave those five alias lists empty. The service/component impact and group/individual handling links remain distinct.

For the **detection links**, are there established alternative phrasings for Alert **indicates Event**, Incident **correlated from Event**, Incident **triggered by Alert**, Alert **generated by Monitoring Rule**, or Monitoring Rule **executed by Monitoring Tool**? “None” is fine for the whole group.

### turn 84 — persona

None I’d add as established alternatives for that group. I’d keep the wording distinct so an event’s correlation, an alert prompting an incident, and a rule generating an alert do not get mistaken for the same fact.

### turn 85 — app-user

None I’d add as established alternatives for that group. I’d keep the wording distinct so an event’s correlation, an alert prompting an incident, and a rule generating an alert do not get mistaken for the same fact.

### turn 85 — app-assistant

I’ll leave those detection-link alias lists empty; each names a different recorded fact.

For **ownership and response coordination**, are there alternative phrasings for Service Owner **owns IT Service**, IT Operations Team **operates IT Service**, On-call Engineer **member of Resolver Group**, Incident **coordinated by Incident Commander**, or Incident Response Team **coordinates a declared major Incident**? “None” is fine for the group.

### turn 85 — persona

None I’d add as established alternative verb phrases. Those connections already distinguish service accountability, day-to-day operation, team membership, the incident commander’s role, and coordination of a **declared major incident**.

### turn 86 — app-user

None I’d add as established alternative verb phrases. Those connections already distinguish service accountability, day-to-day operation, team membership, the incident commander’s role, and coordination of a **declared major incident**.

### turn 86 — app-assistant

I’ll leave those relationship alias lists empty and preserve the declared-major condition on response-team coordination.

For **procedures and recovery**, are there alternative phrasings for Incident **handled with Runbook**, Workaround **documented in Runbook**, Known Error **has Workaround**, Recovery Plan **recovers IT Service**, or Backup Set **protects Configuration Item**? “None” is fine.

### turn 86 — persona

None I’d add as established alternative verb phrases. I’d retain those distinct connections: a runbook used in incident handling, a workaround documented in a runbook, a known error pointing to a candidate workaround, a plan for recovering a service, and a backup set protecting a component.

### turn 87 — app-user

None I’d add as established alternative verb phrases. I’d retain those distinct connections: a runbook used in incident handling, a workaround documented in a runbook, a known error pointing to a candidate workaround, a plan for recovering a service, and a backup set protecting a component.

### turn 87 — app-assistant

I’ll leave those five alias lists empty; they describe different procedure and recovery facts.

For the **change path**, are there established alternative phrasings for Change **implemented by Release**, Release **delivered by Deployment**, Change **modifies Configuration Item**, emergency Change **justified by Incident**, or Incident **resolved by Change**? “None” is fine.

### turn 87 — persona

None I’d add as established relationship aliases. Keep **justified by an incident** restricted to an emergency change, and **resolved by a change** separate from any claim that a change caused the incident.

### turn 88 — app-user

None I’d add as established relationship aliases. Keep **justified by an incident** restricted to an emergency change, and **resolved by a change** separate from any claim that a change caused the incident.

### turn 88 — app-assistant

I’ll leave those change-link alias lists empty and keep emergency justification and actual resolution distinct from causation.

For **reporting and follow-up**, are there established alternative phrasings for Incident **evaluated through Materiality Assessment**, assessment **triggers Regulatory Notification**, notification **reports Incident**, notification **sent to Regulator**, or Review **produces Corrective Action**? “None” is fine; if you use “evaluated by,” I can store that as an alias without changing the connection’s direction.

### turn 88 — persona

I would use **“incident is evaluated by a materiality assessment”** as the primary phrasing, in that direction—not treat it merely as an alias for “evaluated through.” The assessment records the determination about the incident.

For the other four, I have no established alternative phrasing to add. “Triggers” remains conditional on the assessment outcome; “sent to” identifies the regulator for the notification record, not proof of successful submission.

### turn 89 — app-user

I would use **“incident is evaluated by a materiality assessment”** as the primary phrasing, in that direction—not treat it merely as an alias for “evaluated through.” The assessment records the determination about the incident.

For the other four, I have no established alternative phrasing to add. “Triggers” remains conditional on the assessment outcome; “sent to” identifies the regulator for the notification record, not proof of successful submission.

### turn 89 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 89 — app-assistant

I’ve made **“Incident is evaluated by Materiality Assessment”** the plain-language meaning in the canvas. I’ll leave the other four relationship alias lists empty.

One final relationship-alias check: do you use established alternative phrases for **Service Desk records Incident**, **Network Operations Centre operates Monitoring Tool**, **Security Operations Centre monitors a security-relevant Event**, **Communication addressed to Stakeholder**, or **Incident reviewed in Post-incident Review**? “None for all” is fine.

### turn 89 — persona

None for all five. I’d keep the security-operations link conditional on the event being reliably identified as security-relevant, and the review link separate from proof that the review has been scheduled or held.

### turn 90 — app-user

None for all five. I’d keep the security-operations link conditional on the event being reliably identified as security-relevant, and the review link separate from proof that the review has been scheduled or held.

### turn 90 — app-assistant

I’ll leave those five alias lists empty. The security-event condition and the distinction between a review link and a scheduled or held review remain explicit.

For the remaining **recovery and environment** connections, do you use other established phrases for Recovery Plan **uses Backup Set**, IT Service **deployed in Environment**, Configuration Item **belongs to Environment**, Monitoring Tool **monitors IT Service**, or Monitoring Tool **monitors Configuration Item**? “None for all” is fine.

### turn 90 — persona

None for all five. I’d retain their current wording, without reading **“uses a backup set”** as restore approval or **“deployed in an environment”** as proof that the environment is the selected, available failover target.

### turn 91 — app-user

None for all five. I’d retain their current wording, without reading **“uses a backup set”** as restore approval or **“deployed in an environment”** as proof that the environment is the selected, available failover target.

### turn 91 — app-assistant

I’ll leave those five alias lists empty and retain the restore-approval and failover-target limits.

For the **remaining investigation connections**, do you use other established phrases for **IT Service runs on Infrastructure Component**, **Problem groups Incident**, **Problem documented by Known Error**, **Vendor provides Third-party Service**, or **Incident escalated to Vendor**? “None for all” is fine.

### turn 91 — persona

None for all five. Keep the distinctions as they stand: a vendor providing a dependency does not mean an incident was escalated to it, and a problem grouping incidents does not mean its known-error record or workaround applies safely to each one.

### turn 92 — app-user

None for all five. Keep the distinctions as they stand: a vendor providing a dependency does not mean an incident was escalated to it, and a problem grouping incidents does not mean its known-error record or workaround applies safely to each one.

### turn 92 — app-assistant

I’ll leave those five alias lists empty. A vendor dependency does not imply escalation, and a known error does not automatically apply safely to every grouped incident.

For **communication, evidence, and ownership links**, are there established alternative phrases for Communication **about Incident**, Incident **supported by Evidence Item**, Regulatory Notification **includes Evidence Item**, Corrective Action **owned by Organizational Unit**, or Communication **addressed to Stakeholder**? “None for all” is fine.

### turn 92 — persona

None for all five. Keep **“includes evidence”** for material included with a regulatory notification; a retained submission receipt and the authority’s acceptance are separate verification facts. Likewise, a communication’s subject and intended recipient do not establish that it was delivered.

### turn 93 — app-user

None for all five. Keep **“includes evidence”** for material included with a regulatory notification; a retained submission receipt and the authority’s acceptance are separate verification facts. Likewise, a communication’s subject and intended recipient do not establish that it was delivered.

### turn 93 — app-tool

✓ Applied: 0 added, 1 updated.

### turn 93 — app-assistant

I’ve updated the notification–evidence meaning to say the notification **includes** that material; a receipt and the authority’s acceptance remain separate verification facts. I’ll leave the five alias lists empty.

**Language-layer recap:** the classes and connections now have plain meanings, confirmed class aliases are saved, and you identified no established relationship aliases to add. Similar-sounding terms remain distinct where they represent different records or facts. **Is that accurate before we move to fixed choices and action boundaries?**

### turn 93 — persona

Yes, that’s accurate. We can move to the fixed choices and action boundaries, keeping the unresolved sources visible rather than filling them with assumed values.

### turn 94 — app-user

Yes, that’s accurate. We can move to the fixed choices and action boundaries, keeping the unresolved sources visible rather than filling them with assumed values.

### turn 94 — app-assistant

The language layer is confirmed. I’ll now capture only fixed choices you actually use; I won’t invent missing sources or approvals.

What are the allowed values for these four action-relevant fields: **Incident status, Alert status, Backup Set status, and Change status**? Please give the recorded values as used in your setting, or say if any list is not fixed.

### turn 94 — persona

All four have fixed lists:

- **Incident status:** new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled.
- **Alert status:** new, acknowledged, suppressed, escalated, closed.
- **Backup set status:** scheduled, running, successful, failed, expired, corrupted, verified.
- **Change status:** draft, assessed, approved, scheduled, implementing, implemented, failed, rolled back, closed, cancelled.

These are separate lifecycles: for example, a **verified backup** is not an incident status, and an **approved change** is not proof that it was implemented.

### turn 95 — app-user

All four have fixed lists:

- **Incident status:** new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled.
- **Alert status:** new, acknowledged, suppressed, escalated, closed.
- **Backup set status:** scheduled, running, successful, failed, expired, corrupted, verified.
- **Change status:** draft, assessed, approved, scheduled, implementing, implemented, failed, rolled back, closed, cancelled.

These are separate lifecycles: for example, a **verified backup** is not an incident status, and an **approved change** is not proof that it was implemented.

### turn 95 — app-tool

✓ Applied: 0 added, 4 updated.

### turn 95 — app-assistant

I’ve saved those four fixed status lists. Each belongs to its own lifecycle; approval or verification in one record does not imply an action completed in another.

What are the allowed recorded values for **Incident severity**, **IT Service health state**, **Materiality Assessment result**, and **Environment type**? If any is free text or the approved list is unavailable, please say so rather than estimating it.

### turn 95 — persona

Each has a fixed list:

- **Incident severity:** sev1-critical, sev2-high, sev3-medium, sev4-low.
- **IT service health state:** healthy, degraded, partially-unavailable, unavailable, recovering, unknown.
- **Materiality assessment result:** not-reportable, potentially-reportable, reportable, undetermined.
- **Environment type:** production, disaster-recovery, pre-production, test, development, management.

“Potentially reportable” and “undetermined” are not the same as a final **reportable** result for submission. An environment’s type also does not establish that it is available for failover.

### turn 96 — app-user

Each has a fixed list:

- **Incident severity:** sev1-critical, sev2-high, sev3-medium, sev4-low.
- **IT service health state:** healthy, degraded, partially-unavailable, unavailable, recovering, unknown.
- **Materiality assessment result:** not-reportable, potentially-reportable, reportable, undetermined.
- **Environment type:** production, disaster-recovery, pre-production, test, development, management.

“Potentially reportable” and “undetermined” are not the same as a final **reportable** result for submission. An environment’s type also does not establish that it is available for failover.

### turn 96 — app-tool

✓ Applied: 0 added, 4 updated.

### turn 96 — app-assistant

I’ve saved those lists. Only **reportable** can satisfy the notification-submission result check; environment type alone cannot prove availability.

What are the fixed values for **Regulatory Notification status**, **Communication status**, **Corrective Action status**, and **Evidence Item integrity status**? Please give the recorded labels, including any rejection or verification states you use.

### turn 96 — persona

- **Regulatory notification status:** draft, pending-approval, approved, submitted, accepted, rejected, withdrawn.
- **Communication status:** draft, pending-approval, approved, submitted, accepted, rejected, withdrawn.
- **Corrective action status:** open, in-progress, blocked, implemented, verified, closed, cancelled.
- **Evidence item integrity status:** collected, hashed, verified, sealed, compromised.

A notification marked **submitted** is not yet **accepted**. Likewise, an evidence item marked **collected** has not thereby passed an integrity verification.

### turn 97 — app-user

- **Regulatory notification status:** draft, pending-approval, approved, submitted, accepted, rejected, withdrawn.
- **Communication status:** draft, pending-approval, approved, submitted, accepted, rejected, withdrawn.
- **Corrective action status:** open, in-progress, blocked, implemented, verified, closed, cancelled.
- **Evidence item integrity status:** collected, hashed, verified, sealed, compromised.

A notification marked **submitted** is not yet **accepted**. Likewise, an evidence item marked **collected** has not thereby passed an integrity verification.

### turn 97 — app-tool

✓ Applied: 0 added, 4 updated.

### turn 97 — app-assistant

I’ve saved those four lists. “Submitted” is not “accepted,” and “collected” is not an integrity verification.

For these **action-gating values**—Incident status and severity, Alert status, Backup Set status, Change status, and Materiality Assessment result—what must happen if a value is **missing, outside its allowed list, or contradicted by other evidence**? Should the relevant action stop pending verification in each case, or are any allowed to proceed without that value?

### turn 97 — persona

Do not apply one blanket rule to every action. **Stop an action when the missing, invalid, or contradicted value is needed for that action’s precondition**, and resolve the discrepancy against reliable evidence before proceeding.

- **Incident status** gates assignment, containment, major-incident declaration, and closure. **Incident severity** additionally gates declaration.
- **Alert status** must be *new* for acknowledgement.
- **Backup set status** must be *successful* or *verified* for restoration.
- **Materiality assessment result** must be *reportable* for regulatory submission. An unresolved or potentially reportable result does not qualify.
- **Change status** has a fixed vocabulary and must be recorded accurately, but I would **not** invent a particular status as an emergency-change execution precondition. That action has its own checks, including an active linked incident, plans, identified components, and explicit risk acceptance.

An unrelated missing value need not block every action. But where a required fact is disputed, the agent should not choose the convenient version or execute on an unverified assumption.

### turn 98 — app-user

Do not apply one blanket rule to every action. **Stop an action when the missing, invalid, or contradicted value is needed for that action’s precondition**, and resolve the discrepancy against reliable evidence before proceeding.

- **Incident status** gates assignment, containment, major-incident declaration, and closure. **Incident severity** additionally gates declaration.
- **Alert status** must be *new* for acknowledgement.
- **Backup set status** must be *successful* or *verified* for restoration.
- **Materiality assessment result** must be *reportable* for regulatory submission. An unresolved or potentially reportable result does not qualify.
- **Change status** has a fixed vocabulary and must be recorded accurately, but I would **not** invent a particular status as an emergency-change execution precondition. That action has its own checks, including an active linked incident, plans, identified components, and explicit risk acceptance.

An unrelated missing value need not block every action. But where a required fact is disputed, the agent should not choose the convenient version or execute on an unverified assumption.

### turn 98 — app-assistant

I’ll apply those boundaries per action, not as a blanket requirement. A missing or disputed value blocks an action only when that action needs it; I won’t invent an emergency-change status gate.

For the remaining fixed-list fields—**IT Service health state, Environment type, Regulatory Notification status, Communication status, Corrective Action status, and Evidence Item integrity status**—which missing or invalid values would block a listed action or closure check, and which would only limit what the agent can report? You can answer by action rather than repeating each list.

### turn 98 — persona

I’d apply them at the point of use, rather than require every field on every record:

- **Close an incident:** establish that each impacted service is **healthy or has an accepted residual condition**. A missing or invalid health state cannot be treated as “healthy,” and an unhealthy state does not itself prove residual-condition acceptance. Required communications and restoration evidence must also be verified.
- **Fail over or restore:** the **environment type** helps identify the target, but type alone neither proves availability for failover nor approves a restore target. An invalid or missing type limits confidence in identifying the environment; the action must stop if the specific target or its required availability or approval cannot be established.
- **Submit a regulatory notification:** its status must be **approved** before submission. Missing, invalid, or contradictory status blocks submission.
- **Send a communication:** its audience, message, owner, and **approval state** must be established, and the content must match the latest verified incident state. An unknown or invalid approval state blocks sending. For closure, do not count a message as complete merely because a recipient is linked or a sent time exists; verify the required communication.
- **Use evidence:** check the item’s relevance and integrity for the claim being made. A missing or invalid integrity status cannot be treated as verified integrity. This matters particularly for cybersecurity evidence preservation, restoration checks, and notification support; I would not impose one integrity-status value on every evidence item regardless of purpose.
- **Report on corrective actions:** a missing or invalid status prevents the agent from reliably saying which actions remain open or where follow-up stands. It is not, by itself, a gate on the incident-response actions we listed.

### turn 99 — app-user

I’d apply them at the point of use, rather than require every field on every record:

- **Close an incident:** establish that each impacted service is **healthy or has an accepted residual condition**. A missing or invalid health state cannot be treated as “healthy,” and an unhealthy state does not itself prove residual-condition acceptance. Required communications and restoration evidence must also be verified.
- **Fail over or restore:** the **environment type** helps identify the target, but type alone neither proves availability for failover nor approves a restore target. An invalid or missing type limits confidence in identifying the environment; the action must stop if the specific target or its required availability or approval cannot be established.
- **Submit a regulatory notification:** its status must be **approved** before submission. Missing, invalid, or contradictory status blocks submission.
- **Send a communication:** its audience, message, owner, and **approval state** must be established, and the content must match the latest verified incident state. An unknown or invalid approval state blocks sending. For closure, do not count a message as complete merely because a recipient is linked or a sent time exists; verify the required communication.
- **Use evidence:** check the item’s relevance and integrity for the claim being made. A missing or invalid integrity status cannot be treated as verified integrity. This matters particularly for cybersecurity evidence preservation, restoration checks, and notification support; I would not impose one integrity-status value on every evidence item regardless of purpose.
- **Report on corrective actions:** a missing or invalid status prevents the agent from reliably saying which actions remain open or where follow-up stands. It is not, by itself, a gate on the incident-response actions we listed.

### turn 99 — app-assistant

I’ve captured these as **point-of-use checks**, not blanket requirements. Missing or disputed service health, target identity, approval state, or evidence integrity blocks the action or claim that depends on it. An unknown corrective-action status prevents a reliable follow-up report, but does not automatically block incident response.

I haven’t added new fields or assumed sources for these checks. **Is that an accurate recap of the fixed-choice and action-boundary phase?** If so, I’ll turn the confirmed decision checks into named rules.

### turn 99 — persona

Yes, that’s accurate. Keep the rules tied to their specific actions and verified inputs; don’t promote an open source gap into an assumed field or a universal requirement.

### turn 100 — app-user

Yes, that’s accurate. Keep the rules tied to their specific actions and verified inputs; don’t promote an open source gap into an assumed field or a universal requirement.

### turn 100 — app-assistant

The fixed-choice and action-boundary phase is confirmed. I’ll write rules only for decisions on your action list, and an unresolved source will remain a stop condition—not become an assumed field.

Starting with **acknowledge alert**: is this the complete rule? The alert is **new**; its responsible Resolver Group is reliably established; the person attempting acknowledgement is verified as authorised for that group. If either group or authorisation cannot be established, the action stops.

### turn 100 — persona

Yes. For **acknowledge alert**, start with the alert: its status must be **new**, and the person acting must be authorised for the responsible resolver group. Since the sources for the group and authorisation are not yet mapped, failure to establish either stops the action; on-call membership alone is not authorisation.

When it proceeds, record the acknowledgement and timestamp, then read the alert back to confirm its status is **acknowledged**.

### turn 101 — app-user

Yes. For **acknowledge alert**, start with the alert: its status must be **new**, and the person acting must be authorised for the responsible resolver group. Since the sources for the group and authorisation are not yet mapped, failure to establish either stops the action; on-call membership alone is not authorisation.

When it proceeds, record the acknowledgement and timestamp, then read the alert back to confirm its status is **acknowledged**.

### turn 101 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 101 — app-assistant

I’ve saved the acknowledgement rule. It stops if the responsible group or the person’s authorisation cannot be verified; membership alone does not pass it.

For **assign incident**, is the complete rule: the Incident is neither **closed** nor **cancelled**; an affected IT Service or Configuration Item is identified; and reliable support information verifies that the proposed Resolver Group supports at least one of those affected targets? Without that support source, assignment stops.

### turn 101 — persona

Yes, for the **assign incident** action. The incident must be neither **closed** nor **cancelled**, and the proposed resolver group must be verified as supporting an affected IT service **or** configuration item. Establishing the affected target is part of making that check meaningful.

The support source remains unmapped, so a plausible group is not enough: stop if suitability cannot be verified. If assignment proceeds, record the group on the incident and read it back to confirm the assignment.

### turn 102 — app-user

Yes, for the **assign incident** action. The incident must be neither **closed** nor **cancelled**, and the proposed resolver group must be verified as supporting an affected IT service **or** configuration item. Establishing the affected target is part of making that check meaningful.

The support source remains unmapped, so a plausible group is not enough: stop if suitability cannot be verified. If assignment proceeds, record the group on the incident and read it back to confirm the assignment.

### turn 102 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 102 — app-assistant

I’ve saved the assignment rule. It requires a verified match between the proposed group and an affected service or component; the unresolved support source blocks execution until that match is established.

For **declare major incident**, is this the complete eligibility check: Incident status is active, severity is **sev1-critical** or **sev2-high**, an impacted IT Service is identified, an Incident Commander is directly assigned, and an authorised person approves or performs the declaration? I won’t make the response team’s separate identification an extra eligibility condition. What counts as **active** here?

### turn 102 — persona

“Active” here means the incident status is **not resolved, closed, or cancelled**. The other eligibility checks are as you stated: severity is **sev1-critical** or **sev2-high**, at least one impacted IT service is identified, and a commander is assigned. Separately identifying the response team is not a declaration prerequisite.

I would **not add a specific approval or authorised-declarer check** to this rule: we have not established one for declaration. Apply the bank’s approved declaration procedure without inventing an approval requirement. After declaration, verify the major-incident designation, commander, declaration time, and communication record.

### turn 103 — app-user

“Active” here means the incident status is **not resolved, closed, or cancelled**. The other eligibility checks are as you stated: severity is **sev1-critical** or **sev2-high**, at least one impacted IT service is identified, and a commander is assigned. Separately identifying the response team is not a declaration prerequisite.

I would **not add a specific approval or authorised-declarer check** to this rule: we have not established one for declaration. Apply the bank’s approved declaration procedure without inventing an approval requirement. After declaration, verify the major-incident designation, commander, declaration time, and communication record.

### turn 103 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 103 — app-assistant

I’ve saved the declaration rule using your definition of active, without adding an unsupported approval requirement or making response-team identification a prerequisite. The approved procedure’s source remains open.

For **contain incident**, is the rule: Incident status is **acknowledged** or **investigating**; containment scope and expected side effects are recorded and checked before the approved steps; and the incident is marked **contained** only after the containment indicators and remaining service impact have been verified? If approval is required for the steps, is its source specified or still open?

### turn 103 — persona

Yes. Start with an incident in **acknowledged** or **investigating** status, and record the containment scope and expected side effects before executing the steps. The steps must be approved, but I cannot identify a specified approval source or approval-state field here; if approval cannot be established, do not execute them.

Mark the incident **contained** only after verifying the containment indicators and remaining service impact, and retain those results as evidence. That approval does not automatically authorise isolating a configuration item, which has separate checks.

### turn 104 — app-user

Yes. Start with an incident in **acknowledged** or **investigating** status, and record the containment scope and expected side effects before executing the steps. The steps must be approved, but I cannot identify a specified approval source or approval-state field here; if approval cannot be established, do not execute them.

Mark the incident **contained** only after verifying the containment indicators and remaining service impact, and retain those results as evidence. That approval does not automatically authorise isolating a configuration item, which has separate checks.

### turn 104 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 104 — app-assistant

I’ve saved the containment rule. Scope, side effects, and approval must be established before execution; verified indicators, remaining impact, and evidence are required before marking the incident contained. This does not authorise isolation.

For **isolate configuration item**, is the separate pre-action rule: the target Configuration Item is reliably identified as affected by the Incident; its isolation impact is assessed; a rollback or reconnection method is established; and the isolation itself is approved? Please confirm whether isolation-specific approval is required, rather than relying on containment approval.

### turn 104 — persona

The first three checks are right: the specific configuration item must be reliably linked to the incident, the impact of isolating it must be assessed, and a rollback or reconnection method must be available. If the component identity is unverified, do not isolate it.

I cannot confirm a **separate isolation-specific approval** as an explicit precondition, so I would not add one to this rule. Equally, containment approval is not blanket authorisation to isolate. Follow the applicable operational authorisation procedure, then confirm the item is isolated and check the remaining service health.

### turn 105 — app-user

The first three checks are right: the specific configuration item must be reliably linked to the incident, the impact of isolating it must be assessed, and a rollback or reconnection method must be available. If the component identity is unverified, do not isolate it.

I cannot confirm a **separate isolation-specific approval** as an explicit precondition, so I would not add one to this rule. Equally, containment approval is not blanket authorisation to isolate. Follow the applicable operational authorisation procedure, then confirm the item is isolated and check the remaining service health.

### turn 105 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 105 — app-assistant

I’ve saved the isolation rule without inventing a separate approval field. It requires verified component identity, impact assessment, a reconnection method, and the applicable operational authorisation procedure; containment approval alone is insufficient.

For **fail over service**, is the rule: a Recovery Plan is linked to the affected IT Service; the specific recovery Environment is reliably identified and verified available; and the proposed data-recovery point is established as acceptable under the applicable recovery requirements? If target availability or recovery-point acceptance cannot be verified from their still-unmapped sources, failover stops.

### turn 105 — persona

Yes. For the affected IT service, confirm that the **recovery plan applies**, the **specific target recovery environment is available**, and the **proposed data-recovery point is acceptable**. A plan link or environment type alone does not settle the latter two checks. If either cannot be established, do not fail over.

When those checks pass, move the service workload to the recovery environment. Then verify service health and critical business transactions **in that environment**, retaining the selected target, decision basis, and results as evidence.

### turn 106 — app-user

Yes. For the affected IT service, confirm that the **recovery plan applies**, the **specific target recovery environment is available**, and the **proposed data-recovery point is acceptable**. A plan link or environment type alone does not settle the latter two checks. If either cannot be established, do not fail over.

When those checks pass, move the service workload to the recovery environment. Then verify service health and critical business transactions **in that environment**, retaining the selected target, decision basis, and results as evidence.

### turn 106 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 106 — app-assistant

I’ve saved the failover rule. Availability and recovery-point acceptance must be verified; the plan link and environment type do not substitute for either. Post-move health and critical transaction checks will be part of the action verification.

For **restore backup**, is the rule: Backup Set status is **successful** or **verified**; it is reliably linked as protecting the target Configuration Item; the proposed restore point is identified and approved; and the specific target Environment is identified and approved? A shared-name match or backup date alone would not satisfy target identity or restore-point approval.

### turn 106 — persona

Yes. The backup must be **successful** or **verified** and must protect the reliably identified target. The **restore point** and **target environment** must each be identified and approved for this restore. A similar component name, backup date, or environment type cannot substitute for those checks.

If any required identity or approval is unverified, do not restore. Afterward, validate data integrity and application functionality, and retain the approved choices and verification results as evidence.

### turn 107 — app-user

Yes. The backup must be **successful** or **verified** and must protect the reliably identified target. The **restore point** and **target environment** must each be identified and approved for this restore. A similar component name, backup date, or environment type cannot substitute for those checks.

If any required identity or approval is unverified, do not restore. Afterward, validate data integrity and application functionality, and retain the approved choices and verification results as evidence.

### turn 107 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 107 — app-assistant

I’ve saved the restore rule. It blocks on unverified component identity, restore point, or target-environment approval; the backup’s dates and the environment’s type cannot supply those approvals.

For **execute emergency change**, is the rule: the Change is reliably identified as using the emergency workflow; its directly linked Incident is active (**not resolved, closed, or cancelled**); affected Configuration Items are reliably identified; implementation and backout plans are present; and explicit risk acceptance is verified? I won’t add a Change-status prerequisite you did not specify.

### turn 107 — persona

Yes. Those are the execution checks, and I would not add a particular **Change status** as a prerequisite. The emergency workflow designation, affected component identities, and explicit risk acceptance must be reliably established; their current source gaps cannot be filled by inference. Both plans must be present, and the linked incident must be active—not resolved, closed, or cancelled.

If any check fails, do not execute. If they pass, implement the approved emergency change, update its status, then run technical checks, verify service health, and retain the implementation evidence.

### turn 108 — app-user

Yes. Those are the execution checks, and I would not add a particular **Change status** as a prerequisite. The emergency workflow designation, affected component identities, and explicit risk acceptance must be reliably established; their current source gaps cannot be filled by inference. Both plans must be present, and the linked incident must be active—not resolved, closed, or cancelled.

If any check fails, do not execute. If they pass, implement the approved emergency change, update its status, then run technical checks, verify service health, and retain the implementation evidence.

### turn 108 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 108 — app-assistant

I’ve saved the emergency-change rule without inventing a Change-status gate. Unmapped workflow designation, component identity, or risk acceptance cannot be inferred; if any required check fails, execution stops.

For **send communication**, is the rule: its Incident and intended Stakeholder are identified; audience, actual message, and owner are established; Communication status is **approved**; and the message agrees with the latest verified incident state? If the owner or full message cannot be reliably established from their unmapped sources, sending stops.

### turn 108 — persona

The incident, intended recipient, audience, actual message, and owner must be established, and the content must match the latest verified incident state. If the owner or message cannot be reliably established, **do not send**.

I would adjust the status check: the rule requires the **approval state to be recorded and appropriate for sending**, but does not specify `approved` as an exact status precondition. Do not infer permission to send merely from a recipient link or a message summary. Once sent, record the time, confirm delivery status, and archive the final message.

### turn 109 — app-user

The incident, intended recipient, audience, actual message, and owner must be established, and the content must match the latest verified incident state. If the owner or message cannot be reliably established, **do not send**.

I would adjust the status check: the rule requires the **approval state to be recorded and appropriate for sending**, but does not specify `approved` as an exact status precondition. Do not infer permission to send merely from a recipient link or a message summary. Once sent, record the time, confirm delivery status, and archive the final message.

### turn 109 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 109 — app-assistant

I’ve saved the communication rule using **verified approval appropriate for sending**, rather than assuming an exact status label alone grants permission. A recipient link or message summary cannot replace the actual message and owner.

For **submit regulatory notification**, is the rule: the linked Materiality Assessment result is exactly **reportable**; the Notification reports an identified Incident and identifies the intended Regulator; required information and included evidence are complete and checked; Notification status is **approved**; and submission is still before its recorded due time? Please correct anything that would turn an assessment result into an automatic legal decision.

### turn 109 — persona

Yes. For submission, the recorded assessment result must be **reportable**; the notification must be linked to the incident and intended regulator; required information and supporting evidence must be complete; its status must be **approved**; and submission must occur before its recorded due time. If any of those facts cannot be verified, do not submit.

That uses the **recorded assessment**, not an agent-made legal determination. The designated reporting function, with Legal or Compliance as appropriate, owns that determination under the approved procedure. After submission, retain the receipt and confirm acceptance—or record rejection and the remediation needed.

### turn 110 — app-user

Yes. For submission, the recorded assessment result must be **reportable**; the notification must be linked to the incident and intended regulator; required information and supporting evidence must be complete; its status must be **approved**; and submission must occur before its recorded due time. If any of those facts cannot be verified, do not submit.

That uses the **recorded assessment**, not an agent-made legal determination. The designated reporting function, with Legal or Compliance as appropriate, owns that determination under the approved procedure. After submission, retain the receipt and confirm acceptance—or record rejection and the remediation needed.

### turn 110 — app-tool

✓ Applied: 1 added, 0 updated.

### turn 110 — app-assistant

I’ve saved the submission rule. It uses the **recorded reportable assessment**, not an agent-made legal determination. The designated reporting function, with Legal or Compliance as appropriate, owns that determination under the approved procedure.

For **close incident**, is the rule: Incident status is **resolved** or **monitoring**; each impacted IT Service is healthy or has reliably accepted residual conditions; restoration evidence and required communications are verified complete; and, for a major or cybersecurity incident, a Post-incident Review is reliably established as **scheduled or completed**? Unverified residual acceptance or review scheduling would block closure.
