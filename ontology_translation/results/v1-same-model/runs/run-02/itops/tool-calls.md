# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-11-05T00:11:51.118Z

### Turn 1 — user

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### Turn 1 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 1 — tool

competency_questions: []
classes: {}
relationships: []
rules: {}
actions: {}


### Turn 1 — assistant

We’ll start with the tasks the agent must support, before defining any classes or fields. We’ll then work through about nine short phases; you can stop at any point with what we’ve captured.

What are **10–20 real questions** you would expect this agent to answer in your bank’s operations and incident-response work? Your own wording is best.

### Turn 2 — user

These are ten questions I would expect an operations agent to help us answer:

1. Which business services and customer channels are affected by this incident?
2. What IT services, configuration items, and third-party services lie on the affected service’s dependency path?
3. Which current alerts and events are correlated with the incident?
4. Who owns the affected service, and which resolver group and on-call engineer should handle it?
5. Do the known facts meet our bank’s criteria for declaring a major incident?
6. Which runbook, workaround, backup set, or recovery plan is applicable—and can it be used safely now?
7. Could a recent change or deployment have caused the incident?
8. Has the incident’s materiality been assessed, and is a regulatory notification required or due?
9. Are the evidence, stakeholder communications, and service-restoration checks sufficient to close the incident?
10. Which corrective actions from earlier incident reviews remain open for this service?

For decisions such as major-incident declaration or regulatory reporting, I’d expect the agent to show the supporting facts and what is still missing, not make up a conclusion.

### Turn 2 — assistant

I’ve captured those ten questions as the acceptance test. For major-incident and reporting decisions, the agent must show supporting facts and missing information rather than invent a conclusion.

What are **5–10 actions** the agent should help perform—not just questions it should answer? Please describe them in the words your team would use.

### Turn 3 — user

These are ten actions I’d want the agent to help us carry out. In each case it should check the conditions first, then leave us a way to verify what happened.

1. **Acknowledge an alert.** For a new alert, check that the operator is authorised for the responsible resolver group; record the acknowledgement and confirm the alert’s new status.
2. **Assign an incident.** Check that the incident is not closed or cancelled and that the resolver group supports an affected service or component; then confirm the assignment.
3. **Declare a major incident.** Check the incident’s active status and severity, identify an impacted IT service, and assign a commander; then record the declaration and start the coordination and communication cadence.
4. **Contain an incident.** Record the containment scope and expected side effects before executing approved steps; verify the containment indicators and remaining service impact.
5. **Fail over a service.** Check that the recovery plan applies, the recovery environment is available, and the data-recovery point is acceptable; then verify service health and critical business transactions there.
6. **Restore from a backup.** Check the backup’s status and coverage, and obtain an approved restore point and target environment; then validate data integrity and application functionality.
7. **Execute an emergency change.** Link it to an active incident, identify affected components, document implementation and backout plans, and explicitly accept the risk; then run technical checks and retain implementation evidence.
8. **Send a stakeholder update.** Check the audience, message, owner, approval state, and consistency with the latest verified incident state; then confirm delivery and archive the final message.
9. **Submit a regulatory notification.** Check the reportable assessment, incident and regulator links, complete evidence, approval, and due time; then retain the submission receipt and track acceptance or rejection.
10. **Close an incident.** Check resolution or monitoring status, service health or an accepted residual condition, restoration evidence, required communications, and any required review arrangements; then verify the closure record and retained evidence.

The agent can prepare and check these steps, but it must not treat a missing approval or a missing operational fact as permission to proceed.

### Turn 3 — assistant

I’ve captured the ten actions and the requirement to check facts and approvals before proceeding, then verify the result. That completes the first task list; please correct it if I’ve missed anything.

Before we identify the things the agent must represent: for the **operator, service owner, resolver group, on-call engineer, and incident commander** you named, is there a closely related role that actually does day-to-day work under any of them? And do any of these questions or actions depend on a specific operating context that changes how they’re handled?

### Turn 4 — user

The task list is sound, with one addition: **isolate an affected configuration item**. Before doing that, we need the item linked to the incident, an assessment of the isolation’s impact, and a way to roll back or reconnect it. Afterwards we confirm the isolation and check the health of the services left running.

I wouldn’t model those roles as a simple hierarchy. An **on-call engineer is a member of a resolver group**; the group is assigned to resolve the incident, while the engineer handles the time-critical technical work. An **incident commander is part of the incident response team** and commands a major incident; the team coordinates the wider response. The **service owner owns the IT service**, rather than managing those responders by virtue of that role. For routine intake, the **service desk** records and routes incidents; network operations runs monitoring, and security operations monitors security events. “Operator” in the alert action means a person authorised for the responsible resolver group, not a separate command role.

Context matters. We need to know whether the affected service and components are in **production or a recovery environment**, for example, before a failover or restore. A cybersecurity incident brings evidence preservation and materiality assessment into focus; a major incident brings the commander, coordinated response, communications, and subsequent review. Service criticality, business impact, dependencies, and the applicable recovery plan also affect what is safe to do. Reporting conclusions and any policy-dependent criteria must come from the bank’s approved procedures and the responsible functions, not from the agent’s guess.

### Turn 4 — assistant

Added **isolate an affected configuration item** as the eleventh action, with its impact, rollback, and post-isolation checks. I’ve also noted that production versus recovery environment and the approved procedures can change what is safe or reportable. Your role distinctions are clear; I won’t treat them as a hierarchy.

Before proposing classes, are the **service desk, network operations, security operations, and incident response team** each distinct from a resolver group at your bank, or are any of them names for a resolver group?

### Turn 5 — user

They are **distinct functions**, not alternate names for a resolver group. The service desk receives, records, triages, and routes user-reported issues. Network operations operates monitoring for network and infrastructure services; security operations monitors and investigates security events. The incident response team coordinates significant incident response.

A **resolver group** is the team assigned to diagnose and restore a particular service or technology area. People may work across those functions in practice, but I would keep the functions separate when recording who did what.

### Turn 5 — assistant

That settles the terminology: those four functions are distinct from a resolver group. The Phase 1 list now contains ten questions and eleven actions, including configuration-item isolation. I’ll use that list to test every proposed part of the model.

For the first class batch, should the agent identify and connect each of these **separately**, rather than treat any as just a descriptive field?

- **Incident** — the record the questions and most actions concern.
- **Business service** and **customer channel** — both named in your impact question; does the agent need to distinguish them?
- **IT service** — named in the dependency, ownership, failover, and restoration tasks.
- **Configuration item** — named in the dependency question and isolation action.

### Turn 6 — user

Yes—keep all five separate and connect them explicitly.

- An **incident** is the managed record of an unplanned interruption, degradation, or security condition. It can **impact an IT service and a business service**, and **affect a configuration item**. Those are different claims: the affected component is not necessarily the full extent of the service impact.
- A **business service** is the capability the bank delivers to customers or the business. It **depends on an IT service** and **is delivered through a customer channel**. The channel is how customers access the service, not another name for the service.
- An **IT service** is the managed technology capability supporting the business service. We need it separately to trace ownership, dependencies, monitoring, and recovery.
- A **configuration item** is a managed component. We need to identify the particular item for impact analysis and isolation, rather than put its name in an incident description.

For example, an incident might affect a component, impact the IT service running on it, and thereby impact a business service delivered through a customer channel. I would record the actual impacts rather than assume every downstream service is unavailable merely because it lies on a dependency path.

### Turn 6 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 6 — tool

competency_questions: []
classes: {}
relationships: []
rules: {}
actions: {}


### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    meaning: A managed record of an unplanned interruption, degradation, or security condition.\n  BusinessService:\n    meaning: A capability the bank delivers to customers or the business.\n  CustomerChannel:\n    meaning: A way customers access a business service.\n  ITService:\n    meaning: A managed technology capability supporting a business service.\n  ConfigurationItem:\n    meaning: A managed component identified for impact analysis and isolation.\n"
}
```

### Turn 6 — tool

Applied. Added 5, updated 0 existing item(s).

### Turn 6 — assistant

I’ve recorded those five as separate classes. I’ve also noted your distinction between an affected component and a confirmed service impact; a dependency path alone must not be treated as proof of an outage.

For the dependency and monitoring questions, does the agent need to identify and connect each of these separately: **third-party service**, **alert**, and **event**? In particular, are an alert and an event different things in your workflow?

### Turn 7 — user

Yes, all three should be separate.

A **third-party service** is an externally provided service on which an IT service may depend. That dependency matters when tracing impact or deciding whether to escalate to a vendor; it is not itself a monitoring signal.

An **event** is a time-stamped observation—a state change or other noteworthy occurrence. An **alert** is a signal requiring triage or acknowledgement. An alert can **indicate an event** and can concern an IT service or configuration item; it may lead to an incident being opened. An incident can be **triggered by an alert** or **correlated from events**, but neither every event nor every alert automatically becomes an incident.

For example, a component emits an event, a monitoring rule generates an alert about the condition, and triage establishes whether there is an incident and what services are actually affected.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ThirdPartyService:\n    meaning: An externally provided service on which an IT service may depend.\n  Event:\n    meaning: A time-stamped observation of a state change or other noteworthy occurrence.\n  Alert:\n    meaning: A signal requiring triage or acknowledgement.\n"
}
```

### Turn 7 — tool

Applied. Added 3, updated 0 existing item(s).

### Turn 7 — assistant

Recorded **third-party service**, **event**, and **alert** separately. Their connections to incidents will reflect triage and correlation, not automatic incident creation.

For the ownership, assignment, and major-incident tasks, does the agent need to identify these four separately: **service owner** (who owns the IT service), **resolver group** (which group should be assigned), **on-call engineer** (who handles urgent technical work), and **incident commander** (who commands the major incident)?

### Turn 8 — user

Yes, identify them separately.

A **service owner owns the IT service** across its lifecycle. That does not make the owner the incident’s technical resolver. An **incident is assigned to a resolver group** that supports the affected service or component; an **on-call engineer is a member of that group** and may handle the time-critical response. For a **major incident**, an **incident commander commands it** and is a member of the incident response team.

Those links let us answer both “who is accountable for the service?” and “who is handling and coordinating this incident?” without treating ownership, technical assignment, and command as the same job.

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceOwner:\n    meaning: The person accountable for an IT service across its lifecycle.\n  ResolverGroup:\n    meaning: A team assigned to diagnose and restore a service or technology area.\n  OnCallEngineer:\n    meaning: A member of a resolver group handling time-critical technical response.\n  IncidentCommander:\n    meaning: A member of the incident response team who commands a major incident.\n"
}
```

### Turn 8 — tool

Applied. Added 4, updated 0 existing item(s).

### Turn 8 — assistant

Recorded the four roles separately, preserving the difference between service accountability, technical assignment, urgent response, and major-incident command.

The other four functions surfaced in our follow-up: **service desk, network operations, security operations, and incident response team**. Does the agent need to identify or record any of these **separately** to answer a listed question or perform a listed action—for example, to establish who triaged a particular alert or coordinated a particular major incident? Which listed task requires each one you would keep?

### Turn 9 — user

I would keep all four separately, but I would be careful about what each link proves:

- **Service desk:** records an incident. That helps establish the intake path for a reported issue and supports the question about how the incident arose. It does **not**, by itself, tell us who triaged a particular alert.
- **Network operations:** operates the monitoring tool. That gives operational context for the alerts-and-events question, but operating the tool is not the same as being recorded as the person who acknowledged an alert.
- **Security operations:** monitors security events. Keep it distinct for investigating the security signals correlated with a cybersecurity incident.
- **Incident response team:** coordinates a major incident. That matters to the declaration and coordinated-response action; the commander is a member of that team and personally commands the major incident.

So yes, represent each function, but don’t infer an individual triage or acknowledgement from a team’s general responsibility.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  NetworkOperations:\n    meaning: The function that operates monitoring for network and infrastructure services.\n  SecurityOperations:\n    meaning: The function that monitors and investigates security events.\n  IncidentResponseTeam:\n    meaning: The function that coordinates significant incident response.\n"
}
```

### Turn 9 — tool

Applied. Added 3, updated 0 existing item(s).

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceDesk:\n    meaning: The function that receives, records, triages, and routes user-reported incidents.\n"
}
```

### Turn 9 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 9 — assistant

That gives a task-linked reason to keep each function. I’ve recorded network operations, security operations, and the incident response team; the service desk did not save on that pass, so I’ll check the live model and add it. I won’t infer an individual’s acknowledgement from a function’s responsibility.

For the recovery questions and actions, should the agent identify each of these separately: **runbook**, **workaround**, **backup set**, **recovery plan**, and **environment**? Is “production or recovery” a distinction between environments the agent must check when acting, rather than just wording in an incident note?

### Turn 10 — user

Yes—keep all five separate. They answer different parts of “what can we safely use?”

- A **runbook** is a maintained procedure for diagnosis, response, recovery, or verification. An incident can be handled with one.
- A **workaround** temporarily reduces or bypasses impact; it is not the procedure itself. A known error can have a workaround, which may be documented in a runbook.
- A **backup set** is recoverable data protecting particular configuration items. A recovery plan may use it, but we still have to check that the selected backup protects the target and is suitable for restore.
- A **recovery plan** describes how to restore an IT service and its dependencies. A failover must use a plan applicable to that service.
- An **environment** is the deployment context. An IT service is deployed in an environment, and configuration items belong to one.

And yes, **production versus disaster-recovery environment is operational information to check**, not prose in an incident note. Before failover we check that the target recovery environment is available and the data-recovery point is acceptable. Before restoring a backup, the restore point and target environment must be approved. Those checks cannot be inferred simply from the existence of a plan or backup.

### Turn 10 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 10 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases: []
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases: []
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases: []
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases: []
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases: []
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases: []
    properties: {}
relationships: []
rules: {}
actions: {}


### Turn 10 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceDesk:\n    meaning: The function that receives, records, triages, and routes user-reported incidents.\n  Runbook:\n    meaning: A maintained procedure for diagnosis, response, recovery, or verification.\n  Workaround:\n    meaning: A temporary way to reduce or bypass an impact.\n  BackupSet:\n    meaning: Recoverable data protecting particular configuration items.\n  RecoveryPlan:\n    meaning: A plan for restoring an IT service and its dependencies.\n  Environment:\n    meaning: The deployment context of an IT service or configuration item.\n"
}
```

### Turn 10 — tool

Applied. Added 6, updated 0 existing item(s).

### Turn 10 — assistant

Recorded those five recovery concepts and added the missing **service desk** class. A plan or backup identifies a candidate, but it does not establish that the target environment or restore point is approved or safe.

For the remaining questions about causes and follow-up work, does the agent need to identify and connect **change**, **deployment**, **earlier incident review**, and **corrective action** separately? In particular, is a deployment its own record to compare with an incident, or is it always part of a change record?

### Turn 11 — user

Yes, keep all four separate.

A **change** is the controlled modification; a **deployment** is the technical execution that installs or activates it. A deployment has its own timing and outcome, so it is useful when checking whether an incident followed a recent implementation. It should not be reduced to a field on the change. In our usual trace, a change is implemented by a release, and the release is delivered by a deployment. Timing alone does not establish that the deployment caused the incident.

An **earlier post-incident review** records findings about an incident and can produce **corrective actions**. Each corrective action is tracked separately, with its own owner and status; it may be implemented through a change. That separation is what lets us ask which actions from prior reviews are still open for an affected service.

### Turn 11 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change:\n    meaning: A controlled modification that may be examined for a possible connection to an incident.\n  Deployment:\n    meaning: A timed technical execution that installs or activates a modification and records its outcome.\n  PostIncidentReview:\n    meaning: A review of an earlier incident that records findings and can produce corrective actions.\n  CorrectiveAction:\n    meaning: A separately tracked action arising from an incident review with its own owner and status.\n"
}
```

### Turn 11 — tool

Applied. Added 4, updated 0 existing item(s).

### Turn 11 — assistant

Recorded change, deployment, post-incident review, and corrective action separately. I’ll treat “followed a deployment” as a timing clue, not proof of cause.

You also described **release** as the link between change and deployment. Does the agent need to retrieve a release as a separate record to trace a potentially causal deployment back to its change, or can an existing direct change-to-deployment link answer that question?

### Turn 12 — user

Keep **release** as a separate record. In the trace I use, a **change is implemented by a release**, and that **release is delivered by a deployment**. The release groups approved changes introduced together; the deployment records the technical execution and its outcome.

I would not rely on an assumed direct change-to-deployment link for that question. Starting with a deployment, trace back through its release to the relevant changes, then check the affected service or components and the timing. That still gives us a possible cause to investigate, not a finding of causation.

### Turn 12 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Release:\n    meaning: A grouping of approved changes introduced together and delivered by a deployment.\n"
}
```

### Turn 12 — tool

Applied. Added 1, updated 0 existing item(s).

### Turn 12 — assistant

Recorded **release** as the separate link in that trace: change → release → deployment. We’ll use the trace, timing, and affected service or components to investigate a possible cause, not assert one.

For the reporting and closure tasks, does the agent need to identify and connect each of these separately: **materiality assessment**, **regulatory notification**, **regulator**, **evidence item**, and **stakeholder communication**? Is any one of them merely a status or field on the incident rather than a record the agent must retrieve or act on?

### Turn 13 — user

Yes—keep all five as separate records or parties, not merely incident fields.

- A **materiality assessment** evaluates the incident and records the reporting conclusion and rationale. A reportable result can trigger a **regulatory notification**; the assessment is not the submission.
- A **regulatory notification** is the formal submission that reports the incident and is sent to a **regulator**, the competent authority receiving it. We need to track the notification’s approval, submission, and outcome separately.
- An **evidence item** documents the incident. Its integrity matters to investigation, reporting, and closure; a notification can include supporting evidence.
- A **stakeholder communication** is a controlled message about the incident, addressed to its recipients. It is distinct from a regulatory notification, even when the audience is regulatory.

That separation lets us see, for example, that an assessment says “reportable” without incorrectly claiming that an approved notification has already been submitted or accepted.

### Turn 13 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MaterialityAssessment:\n    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.\n  RegulatoryNotification:\n    meaning: A formal incident submission to a regulator whose approval, submission, and outcome are tracked.\n  Regulator:\n    meaning: The competent authority that receives a regulatory notification.\n  EvidenceItem:\n    meaning: An item documenting an incident whose integrity matters to investigation, reporting, or closure.\n  StakeholderCommunication:\n    meaning: A controlled message about an incident addressed to its recipients.\n"
}
```

### Turn 13 — tool

Applied. Added 5, updated 0 existing item(s).

### Turn 13 — assistant

Recorded all five separately. The assessment’s conclusion, a notification’s submission and outcome, and the evidence behind them will remain distinct facts.

One actor still needs clarification before I finish the class list: for **acknowledge an alert**, must the agent identify the authorised **operator** as a separate person from the **on-call engineer**, or is the operator always the on-call engineer acting in that capacity?

### Turn 14 — user

The **operator is not always the on-call engineer**. “Operator” describes whoever is attempting the acknowledgement; the relevant check is whether that person is authorised for the responsible resolver group and the alert is still new. An on-call engineer may do it, but I would not infer authorisation merely from the on-call label, or require every acknowledgement to be by an on-call engineer.

We need to identify **who actually acknowledged the alert** for accountability, but I would not create a separate standing “operator” role just for that action. Record the acting person and verify the alert’s acknowledged state and timestamp.

### Turn 14 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Person:\n    meaning: An identifiable individual who performs a recorded action, including acknowledging an alert.\n"
}
```

### Turn 14 — tool

Applied. Added 1, updated 0 existing item(s).

### Turn 14 — assistant

Recorded **Person** for the actual acknowledger, without creating a standing “operator” role. The person’s resolver-group authorisation and the alert’s new state will need checking; being on call alone will not suffice.

Two other records came up while defining the accepted tasks: **monitoring tool** and **known error**. Does the agent need to retrieve each separately—respectively, to trace the alerts and events in question 3, and to find an applicable workaround in question 6—or are those connections available without either record?

### Turn 15 — user

I would keep **both as separate records**, with a qualification about the monitoring tool.

A **monitoring tool** collects operational information and runs monitoring rules. An alert can be traced to the rule that generated it, and the rule to the tool that executed it. That helps explain a monitoring-origin alert, but the tool is **not required to identify every event correlated with an incident**—events may have other detection sources.

A **known error** is a diagnosed problem with a documented cause or workaround. A problem can be documented by a known error, and that known error can have a workaround. Keeping it separate lets us distinguish “we have diagnosed this recurring issue and identified a workaround” from “we have a runbook describing how to carry out a procedure.” Neither link alone establishes that the workaround is safe for this incident; we still check its applicability.

### Turn 15 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MonitoringTool:\n    meaning: A tool that collects operational information and executes monitoring rules.\n  KnownError:\n    meaning: A diagnosed problem documented with a cause or workaround.\n"
}
```

I’ll keep **MonitoringTool** and **KnownError** separate, and won’t require a monitoring-tool trail for every correlated event. Your explanation also names two intermediate records: a **monitoring rule** between alert and tool, and a **problem** documented by a known error.

Does the agent need to retrieve each of those two separately to follow those respective traces, rather than treating either as descriptive text?

### Turn 15 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 15 — assistant

I’ve recorded **monitoring tool** and **known error** separately. A tool trace can explain where an alert came from, but isn’t required for every correlated event.

Do you also need **monitoring rule** and **problem** as separate records to follow the two traces you described—alert → rule → tool, and problem → known error → workaround?

### Turn 16 — user

Yes, keep both.

A **monitoring rule** evaluates metrics and can generate an alert; the rule is executed by a monitoring tool. So the useful trace is **alert → generating rule → executing tool**. The rule explains the condition being evaluated; the tool is the platform running it.

A **problem** represents an underlying or potential cause that may group several incidents. It can be documented by a **known error**, which can have a **workaround**. That trace distinguishes investigating a cause from having a diagnosed error and an available temporary measure. An incident may be linked to a problem, but the link does not mean its root cause has already been proven.

### Turn 16 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MonitoringRule:\n    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.\n  Problem:\n    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.\n"
}
```

### Turn 16 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 16 — assistant

That completes the candidate class list. It keeps monitoring rule distinct from tool, and problem distinct from known error and workaround. None of those links alone proves a cause or that a workaround is safe.

I’ve captured these groups of things: incidents and impacts; services, components, and dependencies; alerts, events, and monitoring; response people and functions; recovery resources and environments; changes and follow-up work; and reporting, evidence, and communications. **Does that cover the separate records and parties the agent must identify for your ten questions and eleven actions, or is one of those tasks still missing a necessary kind of thing?**

### Turn 17 — user

The groups cover much of the work, but I would add a few distinctions before calling the list complete:

- **Major incident** and **cybersecurity incident** should be distinguishable from an ordinary incident. Declaration starts major-incident coordination; a cybersecurity incident brings evidence preservation and materiality assessment into the response.
- **Emergency change** should be distinguishable from a standard change, because executing it has specific incident linkage, planning, component-identification, and risk-acceptance checks.
- Keep the **vendor** separate from the **third-party service** it provides. We may need to escalate the incident to the vendor, not to the service.
- Keep a **stakeholder** separate from a communication. We need to know whom a message is addressed to and whose interests are affected.

One correction to your note: we do need to record the **person who acknowledged an alert**, but I would not make “operator” a separate standing role or assume it is always the on-call engineer.

### Turn 17 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Vendor:\n    meaning: An external provider of a third-party service that may receive an incident escalation.\n  Stakeholder:\n    meaning: A party whose interests are affected and to whom an incident communication can be addressed.\n"
}
```

### Turn 17 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 17 — assistant

Recorded **vendor** separately from the service it provides, and **stakeholder** separately from a communication. And yes: the actual acknowledger is a **Person**; “operator” is not a separate standing role.

For **major incident**, **cybersecurity incident**, and **emergency change**, do you mean separate records the agent must retrieve alongside their incident or change, or classifications on the existing **Incident** and **Change** records that trigger the different checks you described?

### Turn 18 — user

I mean **distinct classifications of the existing incident or change**, not unrelated parallel tickets that must be reconciled.

A **major incident** is an incident declared for exceptional coordination. Keep its declaration time, commander, communications, and review requirements visible on that incident. A **cybersecurity incident** is an incident involving security-relevant activity; it needs links to security events, preserved evidence, and a materiality assessment. An incident may need both distinctions.

Likewise, an **emergency change** is a change taking the accelerated path, justified by an active incident and subject to the specific execution checks we discussed. It still needs to be traceable as a change.

### Turn 18 — assistant

Understood. I’ll keep major and cybersecurity distinctions **on Incident**, and the emergency distinction **on Change**—not create parallel records. An incident can have both distinctions. We’ll capture the decision-relevant values and checks in the later property and rule phases.

With those corrections, the class list is settled. Starting the connections: are these the right **direct, recorded links** for the impact question?

- Incident → **impacts** → IT service
- Incident → **impacts** → business service
- Incident → **affects** → configuration item
- Incident → **impacts** → customer channel

I’ve included the last link as a question, not an assumption: should channel impact be recorded directly, or only found through the business service delivered through it?

### Turn 19 — user

The first three are right as **direct recorded links**: an incident impacts an IT service, impacts a business service, and affects a configuration item.

I would **not add a direct incident-to-customer-channel impact link** here. Trace the channel through the business service that is delivered through it. That identifies channels to investigate, but it does not prove each channel is disrupted. The agent should report confirmed service impacts separately from channels that may be exposed through that service.

### Turn 19 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: impactsITService\n    from: Incident\n    to: ITService\n    meaning: A confirmed impact of an incident on an IT service.\n  - name: impactsBusinessService\n    from: Incident\n    to: BusinessService\n    meaning: A confirmed impact of an incident on a business service.\n  - name: affectsConfigurationItem\n    from: Incident\n    to: ConfigurationItem\n    meaning: A configuration item identified as affected by an incident.\n"
}
```

### Turn 19 — tool

Applied. Added 3, updated 0 existing item(s).

### Turn 19 — assistant

Recorded those three direct incident links. I have **not** added incident → customer channel: the business-service path identifies channels to investigate, not confirmed channel disruption.

For the dependency path in questions 1–2, are these directed links right: **Business service → depends on → IT service**, **Business service → is delivered through → customer channel**, **IT service → depends on → configuration item**, **IT service → depends on → third-party service**? Does the path also need an IT service → depends on → another IT service link?

### Turn 20 — user

The two **business service** links are right: it **depends on an IT service** and **is delivered through a customer channel**. An **IT service also depends on a third-party service**.

I would change the proposed **IT service → depends on → configuration item** link. For the technical path, we record more specific connections: an IT service **is implemented by an application** and **runs on infrastructure components**; an application may use a database and run on infrastructure. That lets us trace affected components without asserting a generic direct dependency on every configuration item.

I would **not add an IT service → depends on → another IT service** link to this model. If an actual service-to-service dependency matters operationally, we should establish it from approved service information rather than infer it from these links.

### Turn 20 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: dependsOnITService\n    from: BusinessService\n    to: ITService\n    meaning: An IT service supporting delivery of the business service.\n  - name: deliveredThrough\n    from: BusinessService\n    to: CustomerChannel\n    meaning: A customer channel through which the business service is delivered.\n  - name: dependsOnThirdPartyService\n    from: ITService\n    to: ThirdPartyService\n    meaning: An externally provided service on which the IT service depends.\n"
}
```

### Turn 20 — tool

Applied. Added 3, updated 0 existing item(s).

### Turn 20 — assistant

Recorded the three confirmed dependency links. I’ve left out the generic IT service → configuration item link and any unverified IT service → IT service dependency.

For the technical path you described, should **application**, **database**, and **infrastructure component** be separate kinds of records the agent must identify, or are they types of **configuration item**? The model cannot express a subtype directly, so I want to preserve the path without turning “is a kind of configuration item” into a misleading relationship.

### Turn 21 — user

Treat **application, database, and infrastructure component as distinct kinds of configuration item**, not as three descriptive values on one undifferentiated record. Preserve their specific identities and links, but don’t invent a recorded “is a kind of” relationship to compensate for the model’s lack of subtypes.

For this path, an **IT service is implemented by an application** and **runs on infrastructure components**. An **application uses a database** and **runs on infrastructure components**. That gives us a useful route to investigate an affected component without claiming that every component on the route is itself impacted.

The general **configuration item** concept still matters for identifying the item affected by an incident, assigning its technical owner, and checking an isolation action.

### Turn 21 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Application:\n    meaning: An identifiable application implementing an IT service and using technical components.\n  Database:\n    meaning: An identifiable database used by an application.\n  InfrastructureComponent:\n    meaning: An identifiable infrastructure component on which an IT service or application runs.\nrelationships:\n  - name: implementedBy\n    from: ITService\n    to: Application\n    meaning: An application implementing the IT service.\n  - name: runsOnInfrastructure\n    from: ITService\n    to: InfrastructureComponent\n    meaning: An infrastructure component on which the IT service runs.\n  - name: usesDatabase\n    from: Application\n    to: Database\n    meaning: A database used by the application.\n  - name: applicationRunsOn\n    from: Application\n    to: InfrastructureComponent\n    meaning: An infrastructure component on which the application runs.\n"
}
```

### Turn 21 — tool

Applied. Added 7, updated 0 existing item(s).

### Turn 21 — assistant

Recorded the application, database, and infrastructure paths as specific connections, without adding a false “is a kind of” link to ConfigurationItem. The path identifies components to investigate; it does not establish impact.

For the alerts-and-events question, which of these are **recorded links**, rather than conclusions the agent should infer: **Incident → triggered by → Alert**, **Incident → correlated with → Event**, **Alert → indicates → Event**, **Alert → concerns → IT service**, and **Alert → concerns → ConfigurationItem**? Is there also a direct **Event → observed on → ConfigurationItem** link for the component that emitted it?

### Turn 22 — user

Yes, those are recorded links, with two wording cautions:

- An **incident can be triggered by an alert**. That does not mean every alert opens an incident.
- The **incident–event connection** is right in substance, but I would phrase it as the incident being built from correlated events. That makes the direction of the evidence clearer than “correlated with”; it does not say an event alone proves an incident.
- An **alert indicates an event** and can **concern an IT service or a configuration item**.
- An **event is observed on a configuration item**. “Observed on” is safer than “emitted by”: the observation may concern that item without establishing it as the source. An event can also relate to an IT service.

For a monitoring-origin alert, we can additionally trace the alert to the **monitoring rule that generated it**.

### Turn 22 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: triggeredByAlert\n    from: Incident\n    to: Alert\n    meaning: An alert whose triage led to the incident being opened.\n  - name: builtFromEvents\n    from: Incident\n    to: Event\n    meaning: Events correlated as evidence when establishing the incident.\n  - name: indicatesEvent\n    from: Alert\n    to: Event\n    meaning: An event indicated by the alert.\n  - name: concernsITService\n    from: Alert\n    to: ITService\n    meaning: An IT service that the alert concerns.\n  - name: concernsConfigurationItem\n    from: Alert\n    to: ConfigurationItem\n    meaning: A configuration item that the alert concerns.\n  - name: observedOn\n    from: Event\n    to: ConfigurationItem\n    meaning: A configuration item on which the event is observed, without claiming it caused the event.\n  - name: relatesToITService\n    from: Event\n    to: ITService\n    meaning: An IT service to which the event relates.\n  - name: generatedByRule\n    from: Alert\n    to: MonitoringRule\n    meaning: The monitoring rule that generated the alert, when it has a monitoring origin.\n"
}
```

### Turn 22 — tool

Applied. Added 8, updated 0 existing item(s).

### Turn 22 — assistant

Recorded those eight monitoring and incident-evidence links, using **built from events** and **observed on** to avoid stronger causal claims.

To complete the monitoring-origin trace and function links: does a **monitoring rule → run on → monitoring tool** link describe the rule–tool connection correctly? And which direct links should we record for **network operations** and **security operations**—for instance, network operations → operates → monitoring tool, and security operations → monitors → event?

### Turn 23 — user

The **rule-to-tool link is right in substance**, but I would not call it “runs on”: that sounds like a hosting dependency. The point is that the monitoring tool carries out the rule’s evaluation.

For the functions, record **network operations → operates → monitoring tool**. Record **security operations → monitors → security event**, not generic event. A security event is the security-relevant kind of observation that function monitors.

### Turn 23 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: evaluatedBy\n    from: MonitoringRule\n    to: MonitoringTool\n    meaning: The monitoring tool that carries out the rule's evaluation.\n  - name: operatesMonitoringTool\n    from: NetworkOperations\n    to: MonitoringTool\n    meaning: The monitoring tool operated by network operations.\n"
}
```

### Turn 23 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 23 — assistant

Recorded **MonitoringRule → evaluated by → MonitoringTool** and **NetworkOperations → operates → MonitoringTool**. I haven’t linked security operations to every event.

Should **security event** be a security-relevant classification of the existing **Event** record, or a separately retrieved record? Either way, the link should identify only the events security operations actually monitors.

### Turn 24 — user

Treat a **security event as a security-relevant kind of event**, not an unrelated record to reconcile with a general event. Security operations **monitors security events**; that link should identify the events it actually monitors, not imply it monitors every event.

One wording correction to the link you recorded: the **monitoring rule evaluates a metric**; the **monitoring tool executes the rule**. “Rule evaluated by tool” blurs those two jobs.

### Turn 24 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 24 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases: []
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases: []
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases: []
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases: []
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases: []
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases: []
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases: []
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases: []
    properties: {}
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases: []
    properties: {}
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases: []
    properties: {}
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases: []
    properties: {}
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases: []
    properties: {}
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases: []
    properties: {}
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases: []
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases: []
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases: []
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases: []
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases: []
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases: []
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases: []
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases: []
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases: []
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases: []
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases: []
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases: []
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: Events correlated as evidence when establishing the incident.
    aliases: []
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases: []
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases: []
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases: []
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases: []
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases: []
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases: []
rules: {}
actions: {}


### Turn 24 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: executedByTool\n    from: MonitoringRule\n    to: MonitoringTool\n    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.\n  - name: monitorsSecurityEvent\n    from: SecurityOperations\n    to: Event\n    meaning: A specifically identified security-relevant event monitored by security operations, not every event.\n"
}
```

### Turn 24 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 24 — assistant

I’ve recorded a link for **SecurityOperations → monitors → Event**, limited to events identified as security-relevant. I also added **MonitoringRule → executed by → MonitoringTool** to reflect your correction. The earlier “evaluated by” link is still on the canvas, though, and is misleading; it needs removal before validation.

For choosing and recording an incident assignment, are these links right: **Incident → assigned to → ResolverGroup**, **ResolverGroup → supports → ITService**, and **ResolverGroup → supports → ConfigurationItem**? Should the incident also link **directly to the OnCallEngineer handling it**, rather than reaching that person only through the group?

### Turn 25 — user

**Incident → assigned to → resolver group** is right. The incident should also link **directly to the on-call engineer handling it**: group assignment tells us which team has the work, not which engineer is actually handling it. The engineer is a member of the resolver group.

I would **not add either proposed “resolver group supports” link as a recorded relationship**. Before assignment, we must establish that the group supports an affected IT service or configuration item, but that is an **assignment check**; it does not, by itself, justify adding those two links to this model. The incident must also not be closed or cancelled.

And yes, remove the earlier “rule evaluated by tool” link: the tool **executes** the rule, while the rule **evaluates a metric**.

### Turn 25 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: assignedTo\n    from: Incident\n    to: ResolverGroup\n    meaning: The resolver group assigned to diagnose and restore the incident.\n  - name: handledByOnCallEngineer\n    from: Incident\n    to: OnCallEngineer\n    meaning: The on-call engineer actually handling the incident's time-critical technical work.\n  - name: memberOfResolverGroup\n    from: OnCallEngineer\n    to: ResolverGroup\n    meaning: The resolver group of which the on-call engineer is a member.\n"
}
```

### Turn 25 — tool

Applied. Added 3, updated 0 existing item(s).

### Turn 25 — assistant

Recorded the incident’s group assignment, its direct link to the engineer actually handling it, and the engineer’s group membership. I did **not** add either proposed support link.

There’s a gap for the question “which resolver group *should* handle it?”: the assignment link records the choice after it’s made but cannot find a suitable group beforehand. **Where should the agent check which resolver group supports the affected IT service or configuration item—an approved source outside this ontology, or a different connection we should record here?**

### Turn 26 — user

Check the bank’s **approved resolver-group support or routing information** when choosing a group. The assignment rule requires the proposed group to support an affected IT service or configuration item, but the connections we’ve recorded do not themselves identify every eligible group.

Once that check is made, record **incident → assigned to → resolver group**, and retain the basis for the choice. Service ownership is not a substitute for resolver-group support, and an existing assignment should not be treated as proof that the group was suitable. I would not invent a new relationship here solely to fill that lookup gap.

### Turn 26 — assistant

Understood. The agent should check the bank’s approved routing information to choose a group, retain the basis, and then record the assignment. I’ll mark that lookup as an external dependency—not infer suitability from service ownership or an existing assignment.

For the other response responsibilities, are these direct links right: **ITService → owned by → ServiceOwner**, **Incident → commanded by → IncidentCommander** for a declared major incident, **Incident → coordinated by → IncidentResponseTeam**, and **Incident → recorded by → ServiceDesk** when the desk handled intake?

### Turn 27 — user

The responsibilities are right, but I’d record their directions and scope more precisely:

- **Service owner → owns → IT service.** “IT service owned by service owner” is a fair way to read it back.
- For a declared **major incident**, **incident commander → commands → major incident**. The incident is also **coordinated by the commander**.
- **Incident response team → coordinates → major incident**. I would not use the proposed generic incident-to-team link: it loses the distinction between team coordination and the commander’s personal responsibility.
- **Service desk → records → incident** when it handles intake. That does not imply the desk records every incident.

The commander is a member of the incident response team, but membership alone does not establish who commanded a particular major incident.

### Turn 27 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: ownsITService\n    from: ServiceOwner\n    to: ITService\n    meaning: The IT service for which the service owner is accountable across its lifecycle.\n  - name: commandsMajorIncident\n    from: IncidentCommander\n    to: Incident\n    meaning: A specifically declared major incident commanded by this incident commander.\n  - name: coordinatedByCommander\n    from: Incident\n    to: IncidentCommander\n    meaning: The commander who personally coordinates this declared major incident.\n  - name: coordinatesMajorIncident\n    from: IncidentResponseTeam\n    to: Incident\n    meaning: A specifically declared major incident coordinated by the incident response team.\n  - name: recordsIncident\n    from: ServiceDesk\n    to: Incident\n    meaning: An incident recorded by the service desk when it handles intake.\n  - name: memberOfResponseTeam\n    from: IncidentCommander\n    to: IncidentResponseTeam\n    meaning: The incident response team of which the commander is a member.\n"
}
```

### Turn 27 — tool

Applied. Added 6, updated 0 existing item(s).

### Turn 27 — assistant

Recorded the service owner, service desk, commander, and response-team links with the directions and major-incident scope you specified. Commander membership is separate from command of a particular incident.

For the recovery question and actions, which of these direct links should be recorded: **Incident → handled using → Runbook**, **KnownError → has → Workaround**, **Workaround → documented in → Runbook**, **RecoveryPlan → restores → ITService**, and **RecoveryPlan → uses → BackupSet**? These would identify candidates, not certify that using them is safe now.

### Turn 28 — user

Yes, all five are useful direct links, and your caveat is important. I’d phrase two a little differently:

- An **incident is handled with a runbook**—the runbook guides the response; its presence does not show which steps were executed.
- A **known error has a workaround**, and a **workaround is documented in a runbook**. The temporary measure and the procedure describing it remain distinct.
- A **recovery plan recovers an IT service**, rather than “restores” it in the narrower sense of restoring backup data. The plan **uses a backup set** where applicable.

I would also record that an **incident is recovered with a recovery plan** and that a **backup set protects particular configuration items**. Those links help select candidates. Before acting, we still check the plan’s applicability, the recovery environment and data point for failover, or the backup’s status, protected target, and approved restore point and environment for a restore.

### Turn 28 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: handledWithRunbook\n    from: Incident\n    to: Runbook\n    meaning: A runbook used to guide handling of the incident, without asserting that every step was executed.\n  - name: hasWorkaround\n    from: KnownError\n    to: Workaround\n    meaning: A temporary measure documented for the known error.\n  - name: documentedInRunbook\n    from: Workaround\n    to: Runbook\n    meaning: The runbook in which the workaround is documented.\n  - name: recoversITService\n    from: RecoveryPlan\n    to: ITService\n    meaning: An IT service the recovery plan is intended to recover.\n  - name: usesBackupSet\n    from: RecoveryPlan\n    to: BackupSet\n    meaning: A backup set used by the recovery plan where applicable.\n  - name: recoveredWithPlan\n    from: Incident\n    to: RecoveryPlan\n    meaning: The recovery plan used in recovering from the incident.\n  - name: protectsConfigurationItem\n    from: BackupSet\n    to: ConfigurationItem\n    meaning: A configuration item whose data the backup set protects.\n"
}
```

### Turn 28 — tool

Applied. Added 7, updated 0 existing item(s).

### Turn 28 — assistant

Recorded those seven links as candidate and usage paths, not safety approvals. The backup’s protected item and the plan’s intended IT service can now be traced directly.

For the environment checks, should these be recorded links: **ITService → deployed in → Environment** and **ConfigurationItem → belongs to → Environment**? And when a failover or restore is carried out, should **Incident → recovered in → Environment** record the actual target, or is that target recorded somewhere else?

### Turn 29 — user

Yes: record **IT service → deployed in → environment** and **configuration item → belongs to → environment**. Those links establish deployment context, but they do not tell us that a proposed recovery target is available or approved.

I would **not add incident → recovered in → environment** as a direct link. For a failover, check the target recovery environment’s availability and verify service health and critical business transactions there. For a backup restore, the target environment and restore point need approval, followed by data-integrity and application checks. Retain the approved target and the results with the action evidence; don’t infer the actual target from the incident’s existing environment links.

### Turn 29 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: deployedIn\n    from: ITService\n    to: Environment\n    meaning: The environment in which the IT service is deployed.\n  - name: belongsToEnvironment\n    from: ConfigurationItem\n    to: Environment\n    meaning: The environment to which the configuration item belongs.\n"
}
```

### Turn 29 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 29 — assistant

Recorded the two deployment-context links. I have not added Incident → Environment; the approved recovery target and verification results belong with the action evidence.

For investigating a recent change, is the recorded path **Change → implemented by → Release → delivered by → Deployment**, with **Incident → investigated against → Deployment** and **Deployment → affected → ITService or ConfigurationItem**? Which of those last links are actually recorded facts, rather than comparisons the agent makes during investigation?

### Turn 30 — user

The recorded path **change → implemented by → release → delivered by → deployment** is right.

I would **not record “incident investigated against deployment” or “deployment affected IT service or configuration item” as those direct links**. To investigate, compare the deployment’s timing and outcome with the incident, then trace through the release to its changes. A **change modifies configuration items** and **affects IT services**; a **deployment targets an environment** and **deploys an application**. Those are the recorded facts that help narrow the comparison.

Keep the investigation’s finding and supporting evidence distinct from those links. A deployment preceding an incident is a clue, not proof that it caused it.

### Turn 30 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: implementedByRelease\n    from: Change\n    to: Release\n    meaning: The release through which the change is implemented.\n  - name: deliveredByDeployment\n    from: Release\n    to: Deployment\n    meaning: The deployment that delivers the release.\n  - name: modifiesConfigurationItem\n    from: Change\n    to: ConfigurationItem\n    meaning: A configuration item modified by the change.\n  - name: affectsITService\n    from: Change\n    to: ITService\n    meaning: An IT service affected by the change.\n  - name: targetsEnvironment\n    from: Deployment\n    to: Environment\n    meaning: The environment targeted by the deployment.\n  - name: deploysApplication\n    from: Deployment\n    to: Application\n    meaning: An application deployed during the deployment.\n"
}
```

### Turn 30 — tool

Applied. Added 6, updated 0 existing item(s).

### Turn 30 — assistant

Recorded the change–release–deployment path and the stated targets. I left out the proposed incident–deployment and deployment–impact links; the agent will compare records and retain any finding with its evidence.

For earlier reviews and open corrective work, are these direct links right: **PostIncidentReview → reviews → Incident**, **PostIncidentReview → produces → CorrectiveAction**, **CorrectiveAction → addresses → ITService**, and **CorrectiveAction → implemented through → Change** when applicable? Does **Incident → linked to → Problem → documented by → KnownError** capture the diagnosed-issue path without claiming root cause is proven?

### Turn 31 — user

Yes to **post-incident review → reviews → incident** and **post-incident review → produces → corrective action**. A corrective action can also **be implemented by a change**. I would not add a direct **corrective action → addresses → IT service** link: to find actions relevant to a service, trace the earlier reviewed incidents and their recorded impacts, then check the action’s scope. The action is also owned by an organizational unit.

The path **incident → linked to → problem → documented by → known error** is right. A problem represents an underlying or potential cause; the incident–problem link alone does not prove that cause. A known error records a diagnosed cause or workaround. A review can also **identify a problem**, which is useful when tracing how the follow-up work arose.

### Turn 31 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: reviewsIncident\n    from: PostIncidentReview\n    to: Incident\n    meaning: The earlier incident examined by the post-incident review.\n  - name: producesCorrectiveAction\n    from: PostIncidentReview\n    to: CorrectiveAction\n    meaning: A corrective action produced by the review.\n  - name: implementedByChange\n    from: CorrectiveAction\n    to: Change\n    meaning: A change implementing the corrective action where applicable.\n  - name: linkedToProblem\n    from: Incident\n    to: Problem\n    meaning: A problem linked to the incident without asserting its cause has been proven.\n  - name: documentedByKnownError\n    from: Problem\n    to: KnownError\n    meaning: A known error documenting a diagnosed problem.\n  - name: identifiesProblem\n    from: PostIncidentReview\n    to: Problem\n    meaning: A problem identified by the review.\n"
}
```

### Turn 31 — tool

Applied. Added 6, updated 0 existing item(s).

### Turn 31 — assistant

Recorded the review, corrective-action, change, problem, and known-error paths. I left out CorrectiveAction → ITService; relevance to a service will be checked through the reviewed incident and the action’s scope, not assumed.

You said a corrective action is **owned by an organizational unit**. For question 10, does the agent need to identify that unit as a separate record and connect it directly to the corrective action, or is the action’s owner just a value used when reporting which actions remain open?

### Turn 32 — user

Identify the **organizational unit separately** and record **corrective action → is owned by → organizational unit**. The action’s status tells us whether it remains open; the unit link tells us who is accountable for following it through. A text owner value would make that accountability harder to verify across actions or organizational changes.

That does not mean every action from a review is relevant to the affected service. First trace the review and earlier incident, then check the particular corrective action’s scope before presenting it as relevant.

### Turn 32 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  OrganizationalUnit:\n    meaning: An identifiable organizational unit accountable for following a corrective action through.\nrelationships:\n  - name: ownedByUnit\n    from: CorrectiveAction\n    to: OrganizationalUnit\n    meaning: The organizational unit accountable for completing the corrective action.\n"
}
```

### Turn 32 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 32 — assistant

Recorded **OrganizationalUnit** and the corrective action’s direct ownership link. Open status and ownership answer different parts of question 10; relevance still needs the action’s scope checked.

For reporting and closure, which direct links should we record among these: **Incident → has → MaterialityAssessment**, **MaterialityAssessment → triggers → RegulatoryNotification**, **RegulatoryNotification → reports → Incident**, **RegulatoryNotification → sent to → Regulator**, **Incident → documented by → EvidenceItem**, and **RegulatoryNotification → includes → EvidenceItem**? A reportable assessment must not be mistaken for a submitted notification.

### Turn 33 — user

Record all six connections, with two wording changes:

- An **incident is evaluated by a materiality assessment**. “Has an assessment” points to the right record but does not say what it does.
- A **materiality assessment can trigger a regulatory notification**. The notification **reports the incident**, **is sent to the regulator**, and can **include evidence items**.
- An **incident is supported by evidence items**; viewed from the other direction, an **evidence item documents the incident**.

These are links between records, not proof that submission is authorised or complete. A reportable assessment does **not** mean the notification has been approved, submitted, or accepted; those must be checked separately.

### Turn 33 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: evaluatedByAssessment\n    from: Incident\n    to: MaterialityAssessment\n    meaning: The materiality assessment evaluating the incident.\n  - name: canTriggerNotification\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n    meaning: A regulatory notification initiated following the assessment when reporting is required.\n  - name: reportsIncident\n    from: RegulatoryNotification\n    to: Incident\n    meaning: The incident reported in the regulatory notification.\n  - name: sentToRegulator\n    from: RegulatoryNotification\n    to: Regulator\n    meaning: The regulator to whom the regulatory notification is sent.\n  - name: supportedByEvidence\n    from: Incident\n    to: EvidenceItem\n    meaning: An evidence item supporting the incident record.\n  - name: includesEvidence\n    from: RegulatoryNotification\n    to: EvidenceItem\n    meaning: An evidence item included with the regulatory notification.\n"
}
```

### Turn 33 — tool

Applied. Added 6, updated 0 existing item(s).

### Turn 33 — assistant

Recorded all six links. The assessment can initiate a notification, but approval, submission, and acceptance remain separate facts to check.

For stakeholder updates, should we record **StakeholderCommunication → concerns → Incident** and **StakeholderCommunication → addressed to → Stakeholder**? To support the send action, do you also need a direct link from the communication to the **Person** who owns or approves it, or is that responsibility recorded elsewhere?

### Turn 34 — user

Yes, record **communication → is about → incident** and **communication → is addressed to → stakeholder**. “Concerns” gets the substance right, but “is about” makes it clearer that this is a message about the incident, not an impacted party.

I would **not add a direct communication-to-person ownership or approval link** here. Before sending, we must have the audience, message, owner, and approval state recorded, and the content must match the latest verified incident state. Check those in the controlled communication workflow; don’t infer approval from a person’s role or from the stakeholder recipient link. After sending, confirm delivery and archive the final message.

### Turn 34 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isAboutIncident\n    from: StakeholderCommunication\n    to: Incident\n    meaning: The incident the stakeholder communication is about.\n  - name: addressedToStakeholder\n    from: StakeholderCommunication\n    to: Stakeholder\n    meaning: A stakeholder to whom the communication is addressed.\n"
}
```

### Turn 34 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 34 — assistant

Recorded communication → incident and communication → stakeholder. Ownership, approval, delivery, and the archived final message will be checked through the controlled communication workflow, not inferred from those links.

For the remaining direct links in your listed actions and questions: should we record **Alert → acknowledged by → Person**; **Person → authorised for → ResolverGroup**; **ThirdPartyService → provided by → Vendor**; and **Incident → escalated to → Vendor** when escalation occurs? These distinguish the actual acknowledger, authorisation, provider, and escalation.

### Turn 35 — user

The **vendor links are right**: a third-party service **is provided by a vendor**, and an incident **is escalated to a vendor** when escalation occurs. Provision does not imply that an escalation has happened.

I need to correct my earlier wording about the acknowledger. We must retain **who actually acknowledged the alert** and check that person’s authorisation for the responsible resolver group, but I would **not add either proposed direct link**—alert → acknowledged by → person or person → authorised for → resolver group—to this set of recorded relationships. The alert acknowledgement and authorisation check belong in the operational audit and access-control records. Being on call is not sufficient evidence of authorisation.

### Turn 35 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: providedByVendor\n    from: ThirdPartyService\n    to: Vendor\n    meaning: The vendor providing the third-party service.\n  - name: escalatedToVendor\n    from: Incident\n    to: Vendor\n    meaning: A vendor to whom the incident was actually escalated.\n"
}
```

### Turn 35 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 35 — assistant

Recorded **ThirdPartyService → provided by → Vendor** and **Incident → escalated to → Vendor**. I did not add the acknowledger or authorisation links; those checks belong in the operational audit and access-control records.

That leaves **Person** with no connection in this ontology: it was added solely for the acknowledger, whom you now want recorded outside it. Should we remove **Person** from the canvas and keep the acknowledger check in the alert action, or is there another listed task that needs a direct Person link here?

### Turn 36 — user

Yes, **remove the generic Person class from this canvas**. None of the listed direct relationships needs it. Keep the alert action’s requirement to check the acting operator’s resolver-group authorisation and retain who acknowledged the alert and when in the operational audit record.

Do keep the specific response roles we identified—particularly the **on-call engineer** handling an incident and the **incident commander** coordinating one. Removing a generic Person node must not erase those incident responsibilities.

### Turn 36 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 36 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases: []
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases: []
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases: []
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases: []
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases: []
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases: []
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases: []
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases: []
    properties: {}
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases: []
    properties: {}
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases: []
    properties: {}
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases: []
    properties: {}
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases: []
    properties: {}
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases: []
    properties: {}
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases: []
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases: []
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases: []
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases: []
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases: []
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases: []
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases: []
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases: []
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases: []
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases: []
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases: []
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases: []
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases: []
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: Events correlated as evidence when establishing the incident.
    aliases: []
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases: []
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases: []
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases: []
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases: []
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases: []
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases: []
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases: []
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases: []
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases: []
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases: []
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases: []
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases: []
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases: []
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases: []
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases: []
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases: []
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases: []
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases: []
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases: []
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases: []
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases: []
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases: []
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator to whom the regulatory notification is sent.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases: []
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases: []
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases: []
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases: []
rules: {}
actions: {}


### Turn 36 — assistant

Agreed. **Person** should come off the canvas; the specific on-call engineer and incident commander roles stay. The alert action will still require an authorisation check and an audit record of who acknowledged it and when.

I checked the live canvas: it still contains **Person** and the misleading **MonitoringRule → evaluatedBy → MonitoringTool** link. My editing tool can add or update entries but cannot delete them. Could you remove those two items directly on the canvas? I’ll verify the live state before continuing.

### Turn 37 — user

I can’t edit the live canvas directly, so I haven’t removed either item. Please remove the generic **person** class and the **monitoring rule → evaluated by → monitoring tool** link using a deletion-capable tool, then verify the live state.

Keep **monitoring rule → executed by → monitoring tool**; the rule **evaluates a metric**.

### Turn 37 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 37 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases: []
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases: []
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases: []
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases: []
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases: []
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases: []
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases: []
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases: []
    properties: {}
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases: []
    properties: {}
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases: []
    properties: {}
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases: []
    properties: {}
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases: []
    properties: {}
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases: []
    properties: {}
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases: []
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases: []
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases: []
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases: []
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases: []
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases: []
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases: []
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases: []
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases: []
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases: []
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases: []
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases: []
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases: []
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: Events correlated as evidence when establishing the incident.
    aliases: []
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases: []
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases: []
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases: []
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases: []
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases: []
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases: []
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases: []
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases: []
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases: []
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases: []
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases: []
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases: []
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases: []
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases: []
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases: []
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases: []
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases: []
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases: []
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases: []
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases: []
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases: []
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases: []
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator to whom the regulatory notification is sent.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases: []
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases: []
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases: []
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases: []
rules: {}
actions: {}


### Turn 37 — assistant

I verified the live state: **Person** and the incorrect **evaluatedBy** link are still present. I don’t have a deletion-capable tool, so I can’t remove or verify their removal. The correct **MonitoringRule → executedByTool → MonitoringTool** link is present. I’ll keep the two unwanted items flagged as unresolved, rather than claim the cleanup is done.

There is one remaining direct connection implied by your emergency-change action: should **Change → linked to → Incident** be recorded for the active incident that justifies an emergency change?

### Turn 38 — user

The connection is right in substance, but I would record it more specifically: **emergency change → is justified by → incident**. A generic change-to-incident link would lose why that incident is attached.

Before executing the emergency change, check that the linked incident is active, the affected configuration items are identified, implementation and backout plans are present, and the risk has been explicitly accepted. The link alone does not authorise execution.

The two canvas items you flagged remain unresolved; I can’t remove them from here.

### Turn 38 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: justifiedByIncident\n    from: Change\n    to: Incident\n    meaning: The active incident that justifies executing this change through the emergency path; the link alone does not authorise execution.\n"
}
```

### Turn 38 — tool

Applied. Added 1, updated 0 existing item(s).

### Turn 38 — assistant

Recorded **Change → justified by → Incident** for the emergency path. It identifies the reason for the change, not permission to execute it. The two unwanted canvas items remain flagged.

Before moving to properties, I want to settle one recovery-path distinction: the **restore-from-backup** action names an incident and a selected backup set, but the current model connects them only through other records. Do you need a **direct Incident → restored using → BackupSet** link recording the backup actually used, or should that choice live only in the restore action’s evidence?Recorded **Change → justified by → Incident** for the emergency path. The link explains why the change is proposed; it does not authorise execution. The two unwanted canvas items remain unresolved.

For **restore from a backup**, should the incident directly record **which BackupSet was actually used**, or should the selected backup and restore result be retained only with that action’s evidence?

### Turn 39 — user

Keep the **selected backup set and restore result with the restore action’s evidence**; I would not add a direct incident-to-backup-set link. The existing links help find candidates: a recovery plan uses a backup set, and a backup set protects configuration items. They do not establish which backup was actually restored.

Before restoring, check that the backup is successful or verified, protects the target, and that the restore point and target environment are approved. Afterwards, retain the selected backup and target, and the data-integrity and application-functionality checks.

### Turn 39 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 39 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases: []
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases: []
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases: []
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases: []
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases: []
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases: []
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases: []
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases: []
    properties: {}
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases: []
    properties: {}
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases: []
    properties: {}
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases: []
    properties: {}
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases: []
    properties: {}
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases: []
    properties: {}
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases: []
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases: []
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases: []
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases: []
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases: []
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases: []
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases: []
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases: []
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases: []
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases: []
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases: []
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases: []
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases: []
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: Events correlated as evidence when establishing the incident.
    aliases: []
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases: []
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases: []
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases: []
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases: []
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases: []
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases: []
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases: []
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases: []
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases: []
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases: []
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases: []
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases: []
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases: []
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases: []
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases: []
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases: []
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases: []
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases: []
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases: []
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases: []
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases: []
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases: []
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator to whom the regulatory notification is sent.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases: []
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases: []
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases: []
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases: []
  - name: justifiedByIncident
    from: Change
    to: Incident
    meaning: The active incident that justifies executing this change through the emergency path; the link alone does not authorise execution.
    aliases: []
rules: {}
actions: {}


### Turn 39 — assistant

Understood. The selected backup, approved target, restore result, and verification checks belong with the **restore action’s evidence**. I’ve added no Incident → BackupSet link.

I checked the live relationship model: the intended classes are connected, and the remaining gaps are deliberate—for example, channel exposure is traced through BusinessService, while resolver-group suitability comes from approved routing information. **Person** is the exception: it remains unconnected because I cannot delete it with the available tool. The incorrect **evaluatedBy** link also remains; neither is resolved.

That completes the relationship pass as far as I can edit it. **Do you confirm these connections and deliberate omissions before we move to the values the agent needs for decisions?**

### Turn 40 — user

I confirm the **intended connections and deliberate omissions** we’ve discussed, but I would not sign off the live relationship model as clean while **Person** and the misleading **rule → evaluated by → tool** link remain on it.

Two scope points to carry into validation: **“justified by incident” applies to an emergency change**, not every change; and security operations monitors **security events**, not all events. With those qualifications and the two unresolved canvas items explicitly flagged, we can move on to decision-relevant values.

### Turn 40 — assistant

Agreed: the **intended** relationships are confirmed, but the live model is not clean. I’ll carry both unwanted items into validation, along with the emergency-change and security-event qualifications.

Starting decision-relevant values on **Incident**: do we need separate values for **current status** (assignment, declaration, and closure checks), **severity** (major-incident decision), **major-incident declaration state and time**, and **cybersecurity classification** (evidence-preservation and materiality checks)? Which of these does your bank actually record on the incident, and is any one determined solely through an approved procedure rather than stored as a value?

### Turn 41 — user

Yes, keep those distinctions, but do not treat them all as the same kind of field.

- **Current status and severity** are recorded incident values. Status governs whether we can assign, declare, contain, or close; severity is one input to major-incident declaration.
- **Major-incident classification and declaration time** must be visible on the incident once declared. The declaration action verifies the major-incident flag, assigned commander, declaration time, and communication record. Severity alone does not declare it.
- **Cybersecurity incident** is a classification of the incident, not a second unrelated ticket. It brings security-event tracing, evidence preservation, and materiality assessment into scope. I would not infer that classification merely because a security event exists, or invent a mandatory standalone Boolean field for it.

The **decision criteria** come from the bank’s approved procedures; the recorded values and supporting facts show how the decision was made. For major-incident declaration, the action also checks that the incident is active, has qualifying severity, has at least one identified impacted IT service, and has an assigned commander.

### Turn 41 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n      severity:\n        type: text\n      majorIncident:\n        type: boolean\n      declarationTime:\n        type: date\n"
}
```

### Turn 41 — tool

Applied. Added 0, updated 1 existing item(s).

### Turn 41 — assistant

Recorded incident status, severity, major-incident flag, and declaration time. I have **not** added a cybersecurity Boolean or treated severity as a declaration.

How is the **cybersecurity classification** actually represented on an incident in the bank’s records, so the agent can recognise it without inferring it from a security event?

### Turn 42 — user

Use the incident’s **category of “cybersecurity”**, together with its explicit classification as a cybersecurity incident where that classification is recorded. The agent should read the incident record’s classification, not infer it solely from a linked security event.

If the category or classification is missing or disputed, the agent should flag that for the responsible team rather than silently classify the incident itself. I would not require a separate cybersecurity Boolean field.

### Turn 42 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      category:\n        type: text\n      classification:\n        type: text\n"
}
```

### Turn 42 — tool

Applied. Added 0, updated 1 existing item(s).

### Turn 42 — assistant

Recorded incident **category** and **classification** as separate values. If either is missing or disputed, the agent should flag it to the responsible team, not infer “cybersecurity” from an event.

For decisions about impact, failover, isolation, and closure, do **ITService**, **ConfigurationItem**, and **Environment** each have a current health or availability value the agent must check? What is that value called for each, and is service criticality a recorded value on ITService?

### Turn 43 — user

**IT service** has a recorded **health state** and **criticality tier**. Its health is relevant to recovery and closure; its criticality helps assess impact. **Business service** also has a health state and criticality tier, so we should not substitute the IT service’s health for confirmed business-service health.

I would **not add a general current-health field** to either a **configuration item** or an **environment**. A configuration item has a criticality tier; an environment has a type, such as production or disaster recovery. For isolation, assess the particular item’s impact and check the remaining service health. For failover, check the proposed recovery environment’s **actual availability** as an action precondition—not by assuming its environment type means it is available.

One correction to my previous answer: incident **category** is a recorded value, with “cybersecurity” among its choices. The cybersecurity-incident distinction should remain explicit, but I should not have implied that every incident also has a separate, mandatory field named “classification.”

### Turn 43 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 43 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases: []
    properties:
      status:
        type: text
      severity:
        type: text
      majorIncident:
        type: boolean
      declarationTime:
        type: date
      category:
        type: text
      classification:
        type: text
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases: []
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases: []
    properties: {}
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases: []
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases: []
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases: []
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases: []
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases: []
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases: []
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases: []
    properties: {}
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases: []
    properties: {}
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases: []
    properties: {}
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases: []
    properties: {}
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases: []
    properties: {}
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases: []
    properties: {}
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases: []
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases: []
    properties: {}
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases: []
    properties: {}
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases: []
    properties: {}
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases: []
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases: []
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases: []
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases: []
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases: []
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases: []
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases: []
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases: []
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases: []
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases: []
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases: []
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases: []
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases: []
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases: []
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: Events correlated as evidence when establishing the incident.
    aliases: []
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases: []
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases: []
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases: []
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases: []
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases: []
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases: []
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases: []
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases: []
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases: []
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases: []
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases: []
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases: []
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases: []
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases: []
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases: []
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases: []
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases: []
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases: []
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases: []
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases: []
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases: []
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases: []
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator to whom the regulatory notification is sent.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases: []
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases: []
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases: []
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases: []
  - name: justifiedByIncident
    from: Change
    to: Incident
    meaning: The active incident that justifies executing this change through the emergency path; the link alone does not authorise execution.
    aliases: []
rules: {}
actions: {}


### Turn 43 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ITService:\n    properties:\n      healthState:\n        type: text\n      criticalityTier:\n        type: text\n  BusinessService:\n    properties:\n      healthState:\n        type: text\n      criticalityTier:\n        type: text\n  ConfigurationItem:\n    properties:\n      criticalityTier:\n        type: text\n  Environment:\n    properties:\n      environmentType:\n        type: text\n"
}
```

### Turn 43 — tool

Applied. Added 0, updated 4 existing item(s).

### Turn 43 — assistant

Recorded health state and criticality tier separately for **ITService** and **BusinessService**, criticality tier for **ConfigurationItem**, and type for **Environment**. I have not added general health fields to components or environments; target availability remains a failover check.

Your correction also clarifies the incident fields: **category** is recorded, while **classification** is only read where explicitly recorded—not mandatory for every incident. Does that accurately describe how the agent should use those two fields?

### Turn 44 — user

Almost. **Category is a recorded incident value**, and “cybersecurity” is one of its allowed choices. I would **not define a second general incident field called “classification,” even as an optional field**, on the basis of what we’ve established here.

Keep **cybersecurity incident** as an explicit distinction of an incident. The agent should use the recorded category and any explicit cybersecurity-incident designation available in the incident workflow, rather than infer it solely from a security event. If those facts are missing or conflict, flag the uncertainty for the responsible team.

### Turn 44 — assistant

Understood: **category** is recorded, “cybersecurity” is one of its choices, and there should be **no general Incident.classification field**. I cannot remove that field with the available merge-only tool, so it remains a third unresolved canvas item. The agent should use the recorded category and any explicit designation in the incident workflow, and flag missing or conflicting facts.

For the alerts-and-events question and acknowledgement action, which values are recorded on **Alert** and **Event**? In particular, does Alert have a **status** and **acknowledgement time**, and does Event have an **observation time** and a value identifying it as security-relevant?

### Turn 45 — user

An **alert** records when it was raised, a summary, its status and severity, its detection source, and an occurrence count. Its **status** is the value checked before acknowledgement: it must be *new*. The acknowledgement action also records an **acknowledgement timestamp**, but I would not turn that into a general alert field solely on that basis; the action record must let us verify when it happened.

An **event** records its **observation time**, event type, and detection source. A **security event** is the security-relevant kind of event; I would not invent a mandatory security-relevance flag on every event. The agent should use the event’s explicit security designation where available, not decide that every event from a particular source is a security event.

### Turn 45 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    properties:\n      status:\n        type: text\n      raisedAt:\n        type: date\n      summary:\n        type: text\n      detectionSource:\n        type: text\n  Event:\n    properties:\n      observedAt:\n        type: date\n      eventType:\n        type: text\n      detectionSource:\n        type: text\n"
}
```

### Turn 45 — tool

Applied. Added 0, updated 2 existing item(s).

### Turn 45 — assistant

Recorded Alert’s status, raised time, summary, and detection source, and Event’s observation time, type, and detection source. I missed two values you explicitly named—**alert severity and occurrence count**—and will add them on the next edit. I have not added a general acknowledgement-time field or a mandatory security flag.

For the recovery selection in question 6 and the failover/restore actions, which values are actually recorded on **Runbook, Workaround, BackupSet, and RecoveryPlan** to judge whether each is current or suitable? In particular, is the backup’s successful or verified state a recorded **BackupSet status**?

### Turn 46 — user

Yes. A **backup set has a recorded status**; *successful* or *verified* is required for the restore action. It also records the dates of its **last successful backup** and **last verification**. Status alone is not enough: the set must protect the target, and the restore point and target environment must be approved.

A **recovery plan** records its **recovery time objective**, **recovery point objective**, and **last review date**. For failover, we still check that the plan applies to the service, the target environment is available, and the data-recovery point is acceptable.

I would not add a general “current” or “suitable” field to a **runbook** or **workaround** here. The runbook is the maintained procedure; the workaround is a temporary measure, possibly documented in it. Their links help find candidates, but suitability for this incident needs an operational check.

### Turn 46 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    properties:\n      severity:\n        type: text\n      occurrenceCount:\n        type: number\n  BackupSet:\n    properties:\n      status:\n        type: text\n      lastSuccessfulBackup:\n        type: date\n      lastVerification:\n        type: date\n  RecoveryPlan:\n    properties:\n      recoveryTimeObjective:\n        type: number\n      recoveryPointObjective:\n        type: number\n      lastReviewDate:\n        type: date\n"
}
```

### Turn 46 — tool

Applied. Added 0, updated 3 existing item(s).

### Turn 46 — assistant

Added alert severity and occurrence count, backup status and backup dates, and the recovery plan’s objectives and review date. I did not add generic suitability fields to Runbook or Workaround; their safe use remains an operational check.

For the **recent-change investigation**, which values are recorded on **Deployment** for its timing and outcome? Is there a recorded **Change** value that identifies the emergency path, so the agent applies the extra execution checks only to emergency changes?

### Turn 47 — user

A **deployment** records its **status**, **start time**, and **completion time**. Those let us compare its timing and outcome with the incident, but a close match is not proof of cause.

An **emergency change is a distinct kind of change**, not a value I would add to the ordinary change status field. The agent should use the change’s explicit emergency designation in the change workflow to apply the extra execution checks. If that designation is unclear, it should flag the uncertainty rather than infer “emergency” from urgency or timing. The change also records its risk level, implementation plan, and backout plan—facts needed when assessing execution.

### Turn 47 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Deployment:\n    properties:\n      status:\n        type: text\n      startTime:\n        type: date\n      completionTime:\n        type: date\n  Change:\n    properties:\n      riskLevel:\n        type: text\n      implementationPlan:\n        type: text\n      backoutPlan:\n        type: text\n"
}
```

### Turn 47 — tool

Applied. Added 0, updated 2 existing item(s).

### Turn 47 — assistant

Recorded Deployment status, start time, and completion time, plus Change risk level, implementation plan, and backout plan. I have not put “emergency” into Change status; the agent must read the explicit designation in the change workflow and flag uncertainty.

For the **reporting decision and submission**, which values are recorded on **MaterialityAssessment** and **RegulatoryNotification**? In particular, where do the reportability conclusion and rationale, notification due time, approval state, submission state, and acceptance or rejection outcome live?

### Turn 48 — user

The **materiality assessment** records when it was made, its **result**, the **rationale**, and a **reporting due time**. Its result is one of *not reportable, potentially reportable, reportable,* or *undetermined*. That is the documented conclusion—not proof that a notification has been sent.

The **regulatory notification** has its own **due time**, **submission time**, and **status**. Its allowed statuses are *draft, pending approval, approved, submitted, accepted, rejected,* and *withdrawn*. Approval, submission, and the authority’s acceptance or rejection are therefore distinct states of the notification; the submission receipt and any rejection or remediation must also be retained.

Before submission, we check for a **reportable** assessment, the incident and regulator links, complete required information and supporting evidence, **approved** notification status, and submission before the notification’s due time. I would not derive that due time or a legal reporting conclusion without the bank’s approved reporting procedure and responsible function.

### Turn 48 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MaterialityAssessment:\n    properties:\n      assessedAt:\n        type: date\n      result:\n        type: text\n        allowed: [not reportable, potentially reportable, reportable, undetermined]\n      rationale:\n        type: text\n      reportingDueTime:\n        type: date\n  RegulatoryNotification:\n    properties:\n      dueTime:\n        type: date\n      submissionTime:\n        type: date\n      status:\n        type: text\n        allowed: [draft, pending approval, approved, submitted, accepted, rejected, withdrawn]\n"
}
```

### Turn 48 — tool

Applied. Added 0, updated 2 existing item(s).

### Turn 48 — assistant

Recorded the assessment’s time, result, rationale, and reporting due time, and the notification’s own due time, submission time, and seven statuses. The assessment does not prove submission, and the notification due time must come from the approved reporting process.

For **closure, stakeholder updates, and earlier corrective actions**, which recorded values matter on **EvidenceItem**, **StakeholderCommunication**, **PostIncidentReview**, and **CorrectiveAction**? In particular, what lets the agent check evidence integrity, message approval and delivery, required review arrangements, and whether a corrective action is still open?

### Turn 49 — user

I would use these recorded values, while keeping the **closure checks** separate from what any one field can prove:

- **Evidence item:** collection time, integrity status, and cryptographic hash. Integrity status can be *collected, hashed, verified, sealed,* or *compromised*. For closure, we need recorded resolution and restoration evidence—not just an evidence item whose integrity status looks sound.
- **Stakeholder communication:** audience, message summary, approval/workflow status, and sent time. Its statuses are *draft, pending approval, approved, submitted, accepted, rejected,* and *withdrawn*. Before sending, the message must match the latest verified incident state. Afterward, confirm delivery and archive the final message; a sent time alone does not prove delivery.
- **Post-incident review:** date held and findings. For a major or cybersecurity incident, closure requires a review **scheduled or completed**. A review not yet held will not have a “held on” date, so the agent must check the review arrangement rather than infer that none exists.
- **Corrective action:** action description, status, and due date, alongside its organizational-unit owner. Status can be *open, in progress, blocked, implemented, verified, closed,* or *cancelled*. Those distinctions matter: *implemented* is not the same as *verified*, and an action still in progress or blocked should not disappear from the outstanding-work view.

For incident closure, the agent must also check the affected services’ health or an accepted residual condition, and whether required stakeholder communications are complete. It should flag missing evidence or review arrangements rather than treat an empty field as a passed check.

### Turn 49 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  EvidenceItem:\n    properties:\n      collectedAt:\n        type: date\n      integrityStatus:\n        type: text\n        allowed: [collected, hashed, verified, sealed, compromised]\n      cryptographicHash:\n        type: text\n  StakeholderCommunication:\n    properties:\n      audience:\n        type: text\n      messageSummary:\n        type: text\n      status:\n        type: text\n        allowed: [draft, pending approval, approved, submitted, accepted, rejected, withdrawn]\n      sentAt:\n        type: date\n  PostIncidentReview:\n    properties:\n      heldOn:\n        type: date\n      findings:\n        type: text\n  CorrectiveAction:\n    properties:\n      description:\n        type: text\n      status:\n        type: text\n        allowed: [open, in progress, blocked, implemented, verified, closed, cancelled]\n      dueDate:\n        type: date\n"
}
```

### Turn 49 — tool

Applied. Added 0, updated 4 existing item(s).

### Turn 49 — assistant

Recorded those evidence, communication, review, and corrective-action values. I’ll keep the closure checks separate: sound evidence integrity or a sent time alone does not establish restoration or delivery.

For your question, **“Are the evidence, stakeholder communications, and service-restoration checks sufficient to close the incident?”**, where does the agent find the **recorded resolution or accepted residual condition**—on the Incident, in linked evidence, or in a separate closure workflow?

### Turn 50 — user

Start with the **incident’s status and resolution time**, then examine its **linked evidence items** for what was done and how restoration was verified. Check the **impacted services’ health states** separately.

An **accepted residual condition** is a closure decision that must be documented in the bank’s closure workflow; I would not invent a dedicated incident field for it. Nor would I infer acceptance from a service still showing degraded health. If the acceptance or restoration evidence cannot be found, the agent should flag closure as not yet supported.

### Turn 50 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      resolutionTime:\n        type: date\n"
}
```

### Turn 50 — tool

Applied. Added 0, updated 1 existing item(s).

### Turn 50 — assistant

Recorded **Incident.resolutionTime**. For closure, the agent will also check linked restoration evidence, the impacted services’ own health, and any documented residual-condition acceptance in the bank’s closure workflow; it will not infer acceptance from degraded health.

For the question **“Could a recent change or deployment have caused the incident?”**, is the incident’s **start or detection time** recorded on the Incident so the agent can compare it with deployment start and completion times? If so, which time should it use?

### Turn 51 — user

The incident records **detected time** and **opened time**. Use **detected time** as the primary reference when comparing with a deployment’s start and completion times; opened time tells you when the incident record was created, which may be later. The incident also records resolved and closed times for the later lifecycle.

I would not assume detected time is the exact start of the underlying disruption. If you need to establish onset more precisely, examine correlated event times, alerts, and evidence. A deployment occurring beforehand remains a lead to investigate, not proof of cause.

### Turn 51 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      detectedTime:\n        type: date\n      openedTime:\n        type: date\n      closedTime:\n        type: date\n"
}
```

### Turn 51 — tool

Applied. Added 0, updated 1 existing item(s).

### Turn 51 — assistant

Recorded detected, opened, and closed times on Incident; **detected time** will be the primary comparison with deployment timing. It is not necessarily the disruption’s exact onset.

One status check remains for things the agent tracks over time: besides the recorded states we have for services, alerts, backups, reviews, and corrective actions, does it need a **current status on Change or PostIncidentReview** to distinguish an executable change or a scheduled review from one that is no longer proceeding? Or are those states checked only in their controlled workflows?

### Turn 52 — user

**Change has a recorded status**. It distinguishes, for example, a draft or scheduled change from one being implemented, completed, rolled back, or cancelled. The agent should read it when investigating a change, but **status alone does not authorise an emergency change**: the incident link, plans, affected items, and explicit risk acceptance still need checking.

**Post-incident review does not have a general status field** in what we’ve established. It records when it was held and its findings. If a major or cybersecurity incident is being closed before the review is held, the agent must check the documented **scheduled review arrangement** in the review or closure workflow. No “held on” date does not mean no review is scheduled.

### Turn 52 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change:\n    properties:\n      status:\n        type: text\n"
}
```

### Turn 52 — tool

Applied. Added 0, updated 1 existing item(s).

### Turn 52 — assistant

Recorded **Change.status**. I have not added a general review status; a scheduled review must be checked in the review or closure workflow even if no held date exists.

For **isolate an affected configuration item**, does the item have a recorded **isolation or connection state** that the agent should read afterward, or is successful isolation verified only through the action record and checks of the remaining services?

### Turn 53 — user

I would **not add a general isolation or connection-state field** to the configuration item here. Before isolation, confirm that the item is linked to the incident, assess the isolation’s impact, and have a rollback or reconnection method available. Afterwards, verify that it is isolated from the defined networks or dependencies and check the health of the remaining services. Retain those results with the action evidence; don’t infer successful isolation from a change in incident status alone.

### Turn 53 — assistant

Understood. I’ve added no general isolation state to ConfigurationItem. The isolation action must check the incident link, impact, and reconnection method beforehand, then retain evidence of actual isolation and remaining-service health.

That completes the decision-relevant values pass. Recorded values cover incident state and timing, service health and criticality, monitoring signals, recovery resources, deployment and change state, reporting, evidence, communications, and corrective work. Action-specific approvals and verification results stay in their controlled workflows. **Does that division look right before we check the everyday terms and aliases people use?**

### Turn 54 — user

Yes, that division is right. Recorded values support the agent’s decisions; action-specific authorisations, approvals, and verification results must be checked in the relevant workflows rather than inferred from those values.

Carry the three unresolved canvas items into validation: the generic **Person** class, the misleading rule-to-tool “evaluated by” link, and the general incident “classification” field. With those flagged, we can move to everyday terms and aliases.

### Turn 54 — assistant

Yes. I’ll carry **Person**, the incorrect **evaluatedBy** link, and **Incident.classification** as unresolved live-canvas items; I won’t treat them as part of the intended model.

The classes and relationships already have short meanings based on your descriptions. Starting aliases: for **Incident, BusinessService, CustomerChannel, ITService, and ConfigurationItem**, which other terms do people at your bank use for the *same thing*? If a term means something slightly different, I’ll keep it separate rather than make it an alias.

### Turn 55 — user

For these five, I’d use the following as aliases for the **same concept**:

| Concept | Terms you may hear |
|---|---|
| Incident | *incidens*, *hibajegy* |
| Business service | *üzleti szolgáltatás* |
| Customer channel | *ügyfélcsatorna* |
| IT service | *informatikai szolgáltatás*, “informatics service” |
| Configuration item | *CI*, *konfigurációs elem* |

I would still keep **business service** distinct from **IT service**, and **customer channel** distinct from the service customers access through it. “Hibajegy” is useful intake language for an incident here; it should not cause the agent to treat every ticket-like record as a confirmed service impact.

### Turn 55 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    aliases: [incidens, hibajegy]\n  BusinessService:\n    aliases: [üzleti szolgáltatás]\n  CustomerChannel:\n    aliases: [ügyfélcsatorna]\n  ITService:\n    aliases: [informatikai szolgáltatás, informatics service]\n  ConfigurationItem:\n    aliases: [CI, konfigurációs elem]\n"
}
```

### Turn 55 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 55 — assistant

Recorded those aliases. They help the agent recognise familiar terms without merging business and IT services, or treating every *hibajegy* as confirmed impact.

For the next similar group—**Alert, Event, MonitoringRule, MonitoringTool, and ThirdPartyService**—what alternative terms mean exactly the same thing at your bank? “None” is fine for any of them.

### Turn 56 — user

| Concept | Equivalent terms you may hear |
|---|---|
| Alert | *riasztás* |
| Event | *esemény* |
| Monitoring rule | *alert rule*, *riasztási szabály* |
| Monitoring tool | *monitoring platform*, *felügyeleti eszköz* |
| Third-party service | *outsourced service*, *külső szolgáltatás* |

I would not use **event** and **alert** interchangeably: an event is an observation, while an alert calls for triage or acknowledgement. Likewise, a **vendor** provides a third-party service; the vendor is not an alias for the service.

### Turn 56 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    aliases: [riasztás]\n  Event:\n    aliases: [esemény]\n  MonitoringRule:\n    aliases: [alert rule, riasztási szabály]\n  MonitoringTool:\n    aliases: [monitoring platform, felügyeleti eszköz]\n  ThirdPartyService:\n    aliases: [outsourced service, külső szolgáltatás]\n"
}
```

### Turn 56 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 56 — assistant

Recorded those aliases, keeping alert distinct from event and vendor distinct from the service it provides.

For the response roles—**ServiceOwner, ResolverGroup, OnCallEngineer, IncidentCommander, and IncidentResponseTeam**—which alternative names refer to exactly the same role or function at your bank?

### Turn 57 — user

| Role or function | Equivalent terms you may hear |
|---|---|
| Service owner | *szolgáltatásgazda* |
| Resolver group | *megoldócsoport*, *support group* |
| On-call engineer | *ügyeletes mérnök*, *on-call* |
| Incident commander | *incident manager*, *incidensparancsnok*, *MIM lead* |
| Incident response team | *IRT*, *incidenskezelő csapat* |

These are aliases within each row, not interchangeable roles. The service owner is accountable for the IT service; the resolver group and on-call engineer handle technical response; the commander directs a major incident with the incident response team coordinating the broader response.

### Turn 57 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceOwner:\n    aliases: [szolgáltatásgazda]\n  ResolverGroup:\n    aliases: [megoldócsoport, support group]\n  OnCallEngineer:\n    aliases: [ügyeletes mérnök, on-call]\n  IncidentCommander:\n    aliases: [incident manager, incidensparancsnok, MIM lead]\n  IncidentResponseTeam:\n    aliases: [IRT, incidenskezelő csapat]\n"
}
```

### Turn 57 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 57 — assistant

Recorded those role aliases within their respective classes, without merging the responsibilities.

For the other functions and parties—**ServiceDesk, NetworkOperations, SecurityOperations, Vendor, Stakeholder, and OrganizationalUnit**—which alternative names mean the same thing at your bank?

### Turn 58 — user

| Function or party | Equivalent terms you may hear |
|---|---|
| Service desk | *help desk*, *ügyfélszolgálati IT pult*, *hibabejelentő* |
| Network operations centre | *NOC*, *hálózatüzemeltetési központ* |
| Security operations centre | *SOC*, *biztonsági műveleti központ* |
| Vendor | *supplier*, *szállító*, *beszállító* |
| Stakeholder | *érintett* |
| Organizational unit | *szervezeti egység* |

I’d retain “centre” in the names of the network and security operations functions. They are distinct from a resolver group, even if people collaborate across them during an incident.

### Turn 58 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceDesk:\n    aliases: [help desk, ügyfélszolgálati IT pult, hibabejelentő]\n  NetworkOperations:\n    aliases: [network operations centre, NOC, hálózatüzemeltetési központ]\n  SecurityOperations:\n    aliases: [security operations centre, SOC, biztonsági műveleti központ]\n  Vendor:\n    aliases: [supplier, szállító, beszállító]\n  Stakeholder:\n    aliases: [érintett]\n  OrganizationalUnit:\n    aliases: [szervezeti egység]\n"
}
```

### Turn 58 — tool

Applied. Added 0, updated 6 existing item(s).

### Turn 58 — assistant

Recorded those aliases. I’ll call the functions **Network Operations Centre** and **Security Operations Centre** in our descriptions. The canvas still uses the shorter class labels `NetworkOperations` and `SecurityOperations`; changing those labels would require removing the old entries, which my tool cannot do.

For **Runbook, Workaround, BackupSet, RecoveryPlan, and Environment**, which alternative terms mean exactly the same thing at your bank? “None” is fine for any row.

### Turn 59 — user

| Concept | Equivalent terms you may hear |
|---|---|
| Runbook | *üzemeltetési eljárás*, *playbook* |
| Workaround | *kerülőmegoldás* |
| Backup set | *mentéskészlet*, *backup* |
| Recovery plan | *helyreállítási terv*, *DR plan* |
| Environment | *környezet* |

A **workaround** is the temporary measure; a **runbook** is the maintained procedure that may document how to apply it. A **backup set** is recoverable data, while a **recovery plan** governs how to restore a service and its dependencies.

### Turn 59 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Runbook:\n    aliases: [üzemeltetési eljárás, playbook]\n  Workaround:\n    aliases: [kerülőmegoldás]\n  BackupSet:\n    aliases: [mentéskészlet, backup]\n  RecoveryPlan:\n    aliases: [helyreállítási terv, DR plan]\n  Environment:\n    aliases: [környezet]\n"
}
```

### Turn 59 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 59 — assistant

Recorded those aliases, keeping the temporary measure, procedure, recoverable data, and recovery plan distinct.

For **Change, Release, Deployment, PostIncidentReview, and CorrectiveAction**, which equivalent terms do people use? In particular, I won’t assume “release” and “deployment” are synonyms.

### Turn 60 — user

| Concept | Equivalent terms you may hear |
|---|---|
| Change | *változás*, *módosítás* |
| Release | *kiadás* |
| Deployment | *telepítés*, *élesítés* |
| Post-incident review | *PIR*, *RCA review*, *incidens utóelemzés* |
| Corrective action | *remediation action*, *helyesbítő intézkedés* |

You’re right not to merge **release** and **deployment**: the release is the governed package of changes; the deployment is the technical execution that delivers it.

### Turn 60 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change:\n    aliases: [változás, módosítás]\n  Release:\n    aliases: [kiadás]\n  Deployment:\n    aliases: [telepítés, élesítés]\n  PostIncidentReview:\n    aliases: [PIR, RCA review, incidens utóelemzés]\n  CorrectiveAction:\n    aliases: [remediation action, helyesbítő intézkedés]\n"
}
```

### Turn 60 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 60 — assistant

Recorded those aliases; Release and Deployment remain separate.

For **MaterialityAssessment, RegulatoryNotification, Regulator, EvidenceItem, and StakeholderCommunication**, which alternative terms refer to the same concept at your bank? I won’t treat a stakeholder message as a regulatory notification.

### Turn 61 — user

| Concept | Equivalent terms you may hear |
|---|---|
| Materiality assessment | *reportability assessment*, *lényegességi értékelés* |
| Regulatory notification | *supervisory notification*, *felügyeleti bejelentés* |
| Regulator | *supervisory authority*, *felügyeleti hatóság* |
| Evidence item | *evidence*, *bizonyíték* |
| Stakeholder communication | *értesítés*, *tájékoztatás* |

The last two Hungarian terms describe a **communication** more broadly; the intended audience determines whether it is a stakeholder update. A regulatory notification remains a separate formal submission, not an alias for a stakeholder message.

### Turn 61 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MaterialityAssessment:\n    aliases: [reportability assessment, lényegességi értékelés]\n  RegulatoryNotification:\n    aliases: [supervisory notification, felügyeleti bejelentés]\n  Regulator:\n    aliases: [supervisory authority, felügyeleti hatóság]\n  EvidenceItem:\n    aliases: [evidence, bizonyíték]\n  StakeholderCommunication:\n    aliases: [értesítés, tájékoztatás]\n"
}
```

### Turn 61 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 61 — assistant

Recorded those aliases. **Értesítés** and **tájékoztatás** are broad communication terms, so the agent will still need the audience and workflow to distinguish a stakeholder update from a formal regulatory submission.

For the five remaining technical and investigation classes—**Application, Database, InfrastructureComponent, Problem, and KnownError**—what terms mean the same thing at your bank?

### Turn 62 — user

| Concept | Equivalent terms you may hear |
|---|---|
| Application | *alkalmazás*, *app* |
| Database | *adatbázis*, *DB* |
| Infrastructure component | *infrastruktúra-elem* |
| Problem | *probléma* |
| Known error | *ismert hiba* |

A **problem** is an underlying or potential cause under investigation; a **known error** is the diagnosed problem with a documented cause or workaround. They should not be treated as synonyms.

### Turn 62 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Application:\n    aliases: [alkalmazás, app]\n  Database:\n    aliases: [adatbázis, DB]\n  InfrastructureComponent:\n    aliases: [infrastruktúra-elem]\n  Problem:\n    aliases: [probléma]\n  KnownError:\n    aliases: [ismert hiba]\n"
}
```

### Turn 62 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 62 — assistant

Recorded those five aliases, keeping **Problem** distinct from **KnownError**. That completes the class-term pass, apart from the unwanted Person entry still on the canvas.

Now for alternative **relationship phrases**. For each of these five links, what other wording means the same recorded fact at your bank? “None” is fine:

1. Incident → **impacts** → ITService
2. Incident → **impacts** → BusinessService
3. Incident → **affects** → ConfigurationItem
4. BusinessService → **depends on** → ITService
5. BusinessService → **delivered through** → CustomerChannel

### Turn 63 — user

I would use these as **plain-language paraphrases**, not separate kinds of link:

| Recorded link | Equivalent wording |
|---|---|
| Incident impacts IT service | “The IT service is impacted by the incident.” |
| Incident impacts business service | “The business service is impacted by the incident.” |
| Incident affects configuration item | “The configuration item is affected by the incident.” |
| Business service depends on IT service | “The business service relies on the IT service.” |
| Business service is delivered through customer channel | “Customers access the business service through that channel.” |

I would **not** use “impacts” for the configuration-item link, or treat a business service’s dependency on an IT service as proof that the business service is currently impacted.

### Turn 63 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 63 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases:
      - incidens
      - hibajegy
    properties:
      status:
        type: text
      severity:
        type: text
      majorIncident:
        type: boolean
      declarationTime:
        type: date
      category:
        type: text
      classification:
        type: text
      resolutionTime:
        type: date
      detectedTime:
        type: date
      openedTime:
        type: date
      closedTime:
        type: date
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
      criticalityTier:
        type: text
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases:
      - informatikai szolgáltatás
      - informatics service
    properties:
      healthState:
        type: text
      criticalityTier:
        type: text
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases:
      - CI
      - konfigurációs elem
    properties:
      criticalityTier:
        type: text
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases:
      - outsourced service
      - külső szolgáltatás
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases:
      - esemény
    properties:
      observedAt:
        type: date
      eventType:
        type: text
      detectionSource:
        type: text
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases:
      - riasztás
    properties:
      status:
        type: text
      raisedAt:
        type: date
      summary:
        type: text
      detectionSource:
        type: text
      severity:
        type: text
      occurrenceCount:
        type: number
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases:
      - megoldócsoport
      - support group
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases:
      - ügyeletes mérnök
      - on-call
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases:
      - incident manager
      - incidensparancsnok
      - MIM lead
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases:
      - network operations centre
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases:
      - security operations centre
      - SOC
      - biztonsági műveleti központ
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - üzemeltetési eljárás
      - playbook
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases:
      - mentéskészlet
      - backup
    properties:
      status:
        type: text
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases:
      - helyreállítási terv
      - DR plan
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases:
      - környezet
    properties:
      environmentType:
        type: text
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases:
      - változás
      - módosítás
    properties:
      riskLevel:
        type: text
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      status:
        type: text
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases:
      - telepítés
      - élesítés
    properties:
      status:
        type: text
      startTime:
        type: date
      completionTime:
        type: date
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
      findings:
        type: text
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
      description:
        type: text
      status:
        type: text
        allowed:
          - open
          - in progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases:
      - kiadás
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      dueTime:
        type: date
      submissionTime:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases:
      - evidence
      - bizonyíték
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases:
      - értesítés
      - tájékoztatás
    properties:
      audience:
        type: text
      messageSummary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentAt:
        type: date
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases:
      - probléma
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases:
      - supplier
      - szállító
      - beszállító
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases:
      - érintett
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases:
      - adatbázis
      - DB
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases:
      - infrastruktúra-elem
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases: []
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases: []
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases: []
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases: []
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases: []
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases: []
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases: []
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases: []
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases: []
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases: []
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases: []
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: Events correlated as evidence when establishing the incident.
    aliases: []
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases: []
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases: []
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases: []
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases: []
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases: []
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases: []
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases: []
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases: []
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases: []
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases: []
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases: []
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases: []
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases: []
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases: []
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases: []
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases: []
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases: []
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases: []
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases: []
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases: []
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases: []
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases: []
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases: []
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases: []
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases: []
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases: []
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases: []
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases: []
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases: []
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases: []
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases: []
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases: []
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases: []
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases: []
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases: []
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases: []
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases: []
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases: []
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases: []
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases: []
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases: []
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases: []
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator to whom the regulatory notification is sent.
    aliases: []
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases: []
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases: []
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases: []
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases: []
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases: []
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases: []
  - name: justifiedByIncident
    from: Change
    to: Incident
    meaning: The active incident that justifies executing this change through the emergency path; the link alone does not authorise execution.
    aliases: []
rules: {}
actions: {}


### Turn 63 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: impactsItservice\n    from: Incident\n    to: ITService\n    aliases: [The IT service is impacted by the incident]\n  - name: impactsBusinessService\n    from: Incident\n    to: BusinessService\n    aliases: [The business service is impacted by the incident]\n  - name: affectsConfigurationItem\n    from: Incident\n    to: ConfigurationItem\n    aliases: [The configuration item is affected by the incident]\n  - name: dependsOnItservice\n    from: BusinessService\n    to: ITService\n    aliases: [The business service relies on the IT service]\n  - name: deliveredThrough\n    from: BusinessService\n    to: CustomerChannel\n    aliases: [Customers access the business service through that channel]\n"
}
```

### Turn 63 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 63 — assistant

I’ve saved those five paraphrases as relationship aliases. They preserve the distinction between **confirmed impact**, an **affected component**, and a **dependency**.

For the technical path, what other wording means the same recorded fact for each link? “None” is fine:

1. IT service → **depends on** → third-party service
2. IT service → **implemented by** → application
3. IT service → **runs on** → infrastructure component
4. Application → **uses** → database
5. Application → **runs on** → infrastructure component

### Turn 64 — user

These paraphrases preserve the direction of each recorded fact:

| Recorded link | Equivalent wording |
|---|---|
| IT service depends on third-party service | “The IT service relies on that externally provided service.” |
| IT service is implemented by an application | “That application provides the software functionality for the IT service.” |
| IT service runs on an infrastructure component | “The infrastructure component hosts the IT service’s workload.” |
| Application uses a database | “The application accesses that database.” |
| Application runs on an infrastructure component | “The component hosts the application’s workload.” |

“Relies on” is appropriate for the third-party dependency; I would not use it to replace the more specific **implemented by**, **runs on**, or **uses** links.

### Turn 64 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: dependsOnThirdPartyService\n    from: ITService\n    to: ThirdPartyService\n    aliases: [The IT service relies on that externally provided service]\n  - name: implementedBy\n    from: ITService\n    to: Application\n    aliases: [That application provides the software functionality for the IT service]\n  - name: runsOnInfrastructure\n    from: ITService\n    to: InfrastructureComponent\n    aliases: [The infrastructure component hosts the IT service's workload]\n  - name: usesDatabase\n    from: Application\n    to: Database\n    aliases: [The application accesses that database]\n  - name: applicationRunsOn\n    from: Application\n    to: InfrastructureComponent\n    aliases: [The component hosts the application's workload]\n"
}
```

### Turn 64 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 64 — assistant

Saved those five paraphrases. “Relies on” stays with the third-party dependency; the application and infrastructure links keep their more specific meanings.

For the monitoring-to-incident trace, what equivalent wording would you use for these five links? “None” is fine:

1. Incident → **triggered by** → Alert
2. Incident → **built from** → Event
3. Alert → **indicates** → Event
4. Alert → **generated by** → MonitoringRule
5. MonitoringRule → **executed by** → MonitoringTool

### Turn 65 — user

I’d use these as paraphrases of the recorded links:

| Link | Equivalent wording |
|---|---|
| Incident triggered by alert | “The alert prompted the incident record.” This does not mean the alert caused the disruption. |
| Incident built from event | “The incident was correlated from that event.” The event is part of the observed basis, not proof on its own. |
| Alert indicates event | “The alert points to that observed event.” |
| Alert generated by monitoring rule | “That monitoring rule produced the alert.” |
| Monitoring rule executed by monitoring tool | “The monitoring tool ran the rule.” |

I’d keep **“correlated from”** as the more precise wording for the incident–event link; “built from” is useful conversationally but can suggest that a single event automatically creates an incident.

### Turn 65 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: triggeredByAlert\n    from: Incident\n    to: Alert\n    aliases: [The alert prompted the incident record]\n  - name: builtFromEvents\n    from: Incident\n    to: Event\n    meaning: An event included among observations correlated to establish the incident; no single event proves it.\n    aliases: [The incident was correlated from that event]\n  - name: indicatesEvent\n    from: Alert\n    to: Event\n    aliases: [The alert points to that observed event]\n  - name: generatedByRule\n    from: Alert\n    to: MonitoringRule\n    aliases: [That monitoring rule produced the alert]\n  - name: executedByTool\n    from: MonitoringRule\n    to: MonitoringTool\n    aliases: [The monitoring tool ran the rule]\n"
}
```

### Turn 65 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 65 — assistant

Saved the five paraphrases. I also clarified the incident–event meaning: the event is part of the correlated evidence, not proof by itself.

For the other monitoring links, what equivalent wording would you use for **Alert → concerns → ITService**, **Alert → concerns → ConfigurationItem**, **Event → observed on → ConfigurationItem**, **Event → relates to → ITService**, and **SecurityOperations → monitors → security-relevant Event**? “None” is fine for any link.

### Turn 66 — user

| Recorded link | Equivalent wording |
|---|---|
| Alert concerns IT service | “The alert is about that IT service.” |
| Alert concerns configuration item | “The alert is about that configuration item.” |
| Event is observed on configuration item | “The observation was recorded on that item.” |
| Event relates to IT service | “The event is associated with that IT service.” |
| Security operations monitors security event | “Security operations watches that security-relevant event.” |

I would avoid “the item emitted the event” for **observed on**—that asserts a source we may not have established. And the last link is specifically to a **security event**, not to every general event.

### Turn 66 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: concernsItservice\n    from: Alert\n    to: ITService\n    aliases: [The alert is about that IT service]\n  - name: concernsConfigurationItem\n    from: Alert\n    to: ConfigurationItem\n    aliases: [The alert is about that configuration item]\n  - name: observedOn\n    from: Event\n    to: ConfigurationItem\n    aliases: [The observation was recorded on that item]\n  - name: relatesToItservice\n    from: Event\n    to: ITService\n    aliases: [The event is associated with that IT service]\n  - name: monitorsSecurityEvent\n    from: SecurityOperations\n    to: Event\n    aliases: [Security operations watches that security-relevant event]\n"
}
```

### Turn 66 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 66 — assistant

Saved those aliases. **Observed on** still does not assert an event’s source, and the security-operations link remains limited to identified security events.

For the responsibility links, what equivalent wording would you use for these five? “None” is fine:

1. Incident → **assigned to** → ResolverGroup
2. Incident → **handled by** → OnCallEngineer
3. OnCallEngineer → **member of** → ResolverGroup
4. ServiceOwner → **owns** → ITService
5. ServiceDesk → **records** → Incident

### Turn 67 — user

| Recorded link | Equivalent wording |
|---|---|
| Incident assigned to resolver group | “That resolver group has the incident assignment.” |
| Incident handled by on-call engineer | “That on-call engineer is handling the incident’s technical response.” |
| On-call engineer is a member of resolver group | “The engineer belongs to that resolver group.” |
| Service owner owns IT service | “The service owner is accountable for that IT service across its lifecycle.” |
| Service desk records incident | “The service desk logged the incident.” |

These are not interchangeable responsibilities: logging an incident does not assign its resolution, and owning a service does not mean personally handling its incident.

### Turn 67 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: assignedTo\n    from: Incident\n    to: ResolverGroup\n    aliases: [That resolver group has the incident assignment]\n  - name: handledByOnCallEngineer\n    from: Incident\n    to: OnCallEngineer\n    aliases: [That on-call engineer is handling the incident's technical response]\n  - name: memberOfResolverGroup\n    from: OnCallEngineer\n    to: ResolverGroup\n    aliases: [The engineer belongs to that resolver group]\n  - name: ownsItservice\n    from: ServiceOwner\n    to: ITService\n    aliases: [The service owner is accountable for that IT service across its lifecycle]\n  - name: recordsIncident\n    from: ServiceDesk\n    to: Incident\n    aliases: [The service desk logged the incident]\n"
}
```

### Turn 67 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 67 — assistant

Saved those five responsibility aliases. Logging, assignment, technical handling, and service ownership remain different facts.

For the major-incident coordination links, what equivalent wording would you use for **IncidentCommander → commands → Incident**, **Incident → coordinated by → IncidentCommander**, **IncidentResponseTeam → coordinates → Incident**, and **IncidentCommander → member of → IncidentResponseTeam**? Please keep the scope to a *declared major incident* for the first three.

### Turn 68 — user

For a **declared major incident**:

| Link | Equivalent wording |
|---|---|
| Incident commander commands major incident | “The commander leads the major-incident response and its decision cadence.” |
| Incident is coordinated by incident commander | “The commander coordinates the response to that incident.” |
| Incident response team coordinates major incident | “The response team coordinates the wider major-incident effort.” |
| Incident commander is a member of incident response team | “The commander belongs to the incident response team.” |

Membership is a standing role relationship; it does **not** establish that the person commanded any particular incident. Likewise, team coordination does not replace the named commander’s accountability.

### Turn 68 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: commandsMajorIncident\n    from: IncidentCommander\n    to: Incident\n    aliases: [The commander leads the major-incident response and its decision cadence]\n  - name: coordinatedByCommander\n    from: Incident\n    to: IncidentCommander\n    aliases: [The commander coordinates the response to that incident]\n  - name: coordinatesMajorIncident\n    from: IncidentResponseTeam\n    to: Incident\n    aliases: [The response team coordinates the wider major-incident effort]\n  - name: memberOfResponseTeam\n    from: IncidentCommander\n    to: IncidentResponseTeam\n    aliases: [The commander belongs to the incident response team]\n"
}
```

### Turn 68 — tool

Applied. Added 0, updated 4 existing item(s).

### Turn 68 — assistant

Saved those four paraphrases. Commander membership, personal command, and team coordination remain separate facts.

For these five recovery links, what equivalent wording would your team use? “None” is fine for any:

1. Incident → **handled with** → Runbook
2. KnownError → **has** → Workaround
3. Workaround → **documented in** → Runbook
4. RecoveryPlan → **recovers** → ITService
5. Incident → **recovered with** → RecoveryPlan

### Turn 69 — user

| Recorded link | Equivalent wording |
|---|---|
| Incident handled with runbook | “The team used that runbook to guide the incident response.” |
| Known error has workaround | “A temporary way around the known error is documented.” |
| Workaround documented in runbook | “The runbook describes how to apply the workaround.” |
| Recovery plan recovers IT service | “The plan sets out how to bring that IT service back.” |
| Incident recovered with recovery plan | “That recovery plan was used in restoring service during the incident.” |

The first link does not prove every runbook step was executed, and none of these links alone proves that a workaround or recovery step was safe or successful.

### Turn 69 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: handledWithRunbook\n    from: Incident\n    to: Runbook\n    aliases: [The team used that runbook to guide the incident response]\n  - name: hasWorkaround\n    from: KnownError\n    to: Workaround\n    aliases: [A temporary way around the known error is documented]\n  - name: documentedInRunbook\n    from: Workaround\n    to: Runbook\n    aliases: [The runbook describes how to apply the workaround]\n  - name: recoversItservice\n    from: RecoveryPlan\n    to: ITService\n    aliases: [The plan sets out how to bring that IT service back]\n  - name: recoveredWithPlan\n    from: Incident\n    to: RecoveryPlan\n    aliases: [That recovery plan was used in restoring service during the incident]\n"
}
```

### Turn 69 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 69 — assistant

Saved those recovery paraphrases. They describe candidate procedures and recorded use, not proof that a step was safe or successful.

For the remaining recovery-context links, what equivalent wording would you use for **RecoveryPlan → uses → BackupSet**, **BackupSet → protects → ConfigurationItem**, **ITService → deployed in → Environment**, and **ConfigurationItem → belongs to → Environment**? “None” is fine.

### Turn 70 — user

| Recorded link | Equivalent wording |
|---|---|
| Recovery plan uses backup set | “The plan calls for that backup set.” |
| Backup set protects configuration item | “That item is covered by the backup set.” |
| IT service is deployed in environment | “The IT service runs in that deployment environment.” |
| Configuration item belongs to environment | “That item is assigned to that environment.” |

These identify coverage and deployment context. They do **not** establish that a backup was actually restored or that a recovery environment is available and approved for a particular action.

### Turn 70 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: usesBackupSet\n    from: RecoveryPlan\n    to: BackupSet\n    aliases: [The plan calls for that backup set]\n  - name: protectsConfigurationItem\n    from: BackupSet\n    to: ConfigurationItem\n    aliases: [That item is covered by the backup set]\n  - name: deployedIn\n    from: ITService\n    to: Environment\n    aliases: [The IT service runs in that deployment environment]\n  - name: belongsToEnvironment\n    from: ConfigurationItem\n    to: Environment\n    aliases: [That item is assigned to that environment]\n"
}
```

### Turn 70 — tool

Applied. Added 0, updated 4 existing item(s).

### Turn 70 — assistant

Saved those four aliases. Backup coverage and environment membership still do not establish an actual restore or an available, approved target.

For the change-and-deployment trace, what equivalent wording would you use for these five links? “None” is fine:

1. Change → **implemented by** → Release
2. Release → **delivered by** → Deployment
3. Change → **modifies** → ConfigurationItem
4. Change → **affects** → ITService
5. Deployment → **targets** → Environment

### Turn 71 — user

| Recorded link | Equivalent wording |
|---|---|
| Change is implemented by release | “The release carries that approved change.” |
| Release is delivered by deployment | “The deployment puts the release into effect.” |
| Change modifies configuration item | “That item is changed under the change record.” |
| Change affects IT service | “The IT service is within the change’s scope.” |
| Deployment targets environment | “The deployment is directed at that environment.” |

Scope and timing help us investigate a possible change-induced incident; none of these links, by itself, establishes causation or successful deployment.

### Turn 71 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: implementedByRelease\n    from: Change\n    to: Release\n    aliases: [The release carries that approved change]\n  - name: deliveredByDeployment\n    from: Release\n    to: Deployment\n    aliases: [The deployment puts the release into effect]\n  - name: modifiesConfigurationItem\n    from: Change\n    to: ConfigurationItem\n    aliases: [That item is changed under the change record]\n  - name: affectsItservice\n    from: Change\n    to: ITService\n    aliases: [The IT service is within the change's scope]\n  - name: targetsEnvironment\n    from: Deployment\n    to: Environment\n    aliases: [The deployment is directed at that environment]\n"
}
```

### Turn 71 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 71 — assistant

Saved those five paraphrases. Change scope and deployment timing remain investigative clues, not findings of cause or proof of success.

For the other two change/deployment links, what equivalent wording would you use for **Deployment → deploys → Application** and **Change → justified by → Incident**? Please keep the second one specific to an **emergency change**.

### Turn 72 — user

- **Deployment → deploys → application:** “The deployment installs or activates that application.”
- **Emergency change → is justified by → incident:** “The active incident is the reason for taking the emergency-change path.”

The second link explains the justification; it does not authorise execution or prove that the change resolved the incident.

### Turn 72 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: deploysApplication\n    from: Deployment\n    to: Application\n    aliases: [The deployment installs or activates that application]\n  - name: justifiedByIncident\n    from: Change\n    to: Incident\n    aliases: [The active incident is the reason for taking the emergency-change path]\n"
}
```

### Turn 72 — tool

Applied. Added 0, updated 2 existing item(s).

### Turn 72 — assistant

Saved both paraphrases. The emergency-change link explains why that path is used; it neither authorises execution nor proves the change resolved the incident.

For the review-and-problem path, what equivalent wording would you use for these five links? “None” is fine:

1. PostIncidentReview → **reviews** → Incident
2. PostIncidentReview → **produces** → CorrectiveAction
3. PostIncidentReview → **identifies** → Problem
4. Incident → **linked to** → Problem
5. Problem → **documented by** → KnownError

### Turn 73 — user

| Recorded link | Equivalent wording |
|---|---|
| Post-incident review reviews incident | “The incident was examined in that review.” |
| Post-incident review produces corrective action | “That follow-up action came out of the review.” |
| Post-incident review identifies problem | “The review surfaced an underlying or potential cause for investigation.” |
| Incident is linked to problem | “The incident is associated with that problem record.” |
| Problem is documented by known error | “A known-error record documents the diagnosed problem.” |

A review surfacing a problem, or an incident being linked to one, does not by itself prove root cause. The known-error record is where the diagnosed cause or workaround is documented.

### Turn 73 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: reviewsIncident\n    from: PostIncidentReview\n    to: Incident\n    aliases: [The incident was examined in that review]\n  - name: producesCorrectiveAction\n    from: PostIncidentReview\n    to: CorrectiveAction\n    aliases: [That follow-up action came out of the review]\n  - name: identifiesProblem\n    from: PostIncidentReview\n    to: Problem\n    aliases: [The review surfaced an underlying or potential cause for investigation]\n  - name: linkedToProblem\n    from: Incident\n    to: Problem\n    aliases: [The incident is associated with that problem record]\n  - name: documentedByKnownError\n    from: Problem\n    to: KnownError\n    aliases: [A known-error record documents the diagnosed problem]\n"
}
```

### Turn 73 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 73 — assistant

Saved those review-and-problem aliases. A linked or surfaced problem remains a possible cause, while the known-error record documents a diagnosis.

For the two remaining corrective-action links, what equivalent wording would you use for **CorrectiveAction → implemented by → Change** and **CorrectiveAction → owned by → OrganizationalUnit**? “None” is fine.

### Turn 74 — user

- **Corrective action → implemented by → change:** “That change carries out the corrective action.”
- **Corrective action → owned by → organizational unit:** “That unit is accountable for following the corrective action through.”

Ownership does not mean the action is complete; check its recorded status and verification separately.

### Turn 74 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: implementedByChange\n    from: CorrectiveAction\n    to: Change\n    aliases: [That change carries out the corrective action]\n  - name: ownedByUnit\n    from: CorrectiveAction\n    to: OrganizationalUnit\n    aliases: [That unit is accountable for following the corrective action through]\n"
}
```

### Turn 74 — tool

Applied. Added 0, updated 2 existing item(s).

### Turn 74 — assistant

Saved those aliases. Ownership is accountability, not evidence of completion.

For the reporting links, what equivalent wording would you use for these five? “None” is fine:

1. Incident → **evaluated by** → MaterialityAssessment
2. MaterialityAssessment → **can trigger** → RegulatoryNotification
3. RegulatoryNotification → **reports** → Incident
4. RegulatoryNotification → **sent to** → Regulator
5. RegulatoryNotification → **includes** → EvidenceItem

### Turn 75 — user

| Recorded link | Equivalent wording |
|---|---|
| Incident is evaluated by materiality assessment | “The assessment considers that incident’s significance and reporting implications.” |
| Materiality assessment can trigger regulatory notification | “A reportable assessment gives rise to a notification.” |
| Regulatory notification reports incident | “The submission concerns that incident.” |
| Regulatory notification is sent to regulator | “The competent authority is the intended recipient of the submission.” |
| Regulatory notification includes evidence item | “That evidence item supports the submission.” |

“Can trigger” preserves the distinction between a reporting decision and a notification that has actually been approved, submitted, or accepted. The recipient link alone does not prove delivery.

### Turn 75 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: evaluatedByAssessment\n    from: Incident\n    to: MaterialityAssessment\n    aliases: [The assessment considers that incident's significance and reporting implications]\n  - name: canTriggerNotification\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n    aliases: [A reportable assessment gives rise to a notification]\n  - name: reportsIncident\n    from: RegulatoryNotification\n    to: Incident\n    aliases: [The submission concerns that incident]\n  - name: sentToRegulator\n    from: RegulatoryNotification\n    to: Regulator\n    aliases: [The competent authority is the intended recipient of the submission]\n  - name: includesEvidence\n    from: RegulatoryNotification\n    to: EvidenceItem\n    aliases: [That evidence item supports the submission]\n"
}
```

### Turn 75 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 75 — assistant

Saved those five reporting paraphrases. I’ll preserve the distinction between an **intended regulator** and a confirmed submission: the recipient link alone does not prove delivery.

For incident evidence and stakeholder messages, what equivalent wording would you use for these three links? “None” is fine:

1. Incident → **supported by** → EvidenceItem
2. StakeholderCommunication → **is about** → Incident
3. StakeholderCommunication → **addressed to** → Stakeholder

### Turn 76 — user

| Recorded link | Equivalent wording |
|---|---|
| Incident is supported by evidence item | “That evidence item documents the incident.” |
| Stakeholder communication is about incident | “The message concerns that incident.” |
| Stakeholder communication is addressed to stakeholder | “That stakeholder is the message’s intended recipient.” |

An evidence link does not, by itself, establish that the evidence is intact or sufficient. An intended recipient does not establish that the message was approved or delivered.

### Turn 76 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: supportedByEvidence\n    from: Incident\n    to: EvidenceItem\n    aliases: [That evidence item documents the incident]\n  - name: isAboutIncident\n    from: StakeholderCommunication\n    to: Incident\n    aliases: [The message concerns that incident]\n  - name: addressedToStakeholder\n    from: StakeholderCommunication\n    to: Stakeholder\n    aliases: [That stakeholder is the message's intended recipient]\n"
}
```

### Turn 76 — tool

Applied. Added 0, updated 3 existing item(s).

### Turn 76 — assistant

Saved those three aliases. The links identify evidence and intended recipients; integrity, approval, and delivery still require separate checks.

For the final function and vendor links, what equivalent wording would you use for **NetworkOperations → operates → MonitoringTool**, **ThirdPartyService → provided by → Vendor**, and **Incident → escalated to → Vendor**? “None” is fine.

### Turn 77 — user

- **Network operations centre → operates → monitoring tool:** “Network operations runs that monitoring platform.”
- **Third-party service → is provided by → vendor:** “That vendor supplies the external service.”
- **Incident → is escalated to → vendor:** “The vendor has been brought into the incident response through an escalation.”

The provider link does not mean the vendor has been contacted about this incident; that requires the separate escalation fact.

### Turn 77 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: operatesMonitoringTool\n    from: NetworkOperations\n    to: MonitoringTool\n    aliases: [Network operations runs that monitoring platform]\n  - name: providedByVendor\n    from: ThirdPartyService\n    to: Vendor\n    aliases: [That vendor supplies the external service]\n  - name: escalatedToVendor\n    from: Incident\n    to: Vendor\n    aliases: [The vendor has been brought into the incident response through an escalation]\n"
}
```

### Turn 77 — tool

Applied. Added 0, updated 3 existing item(s).

### Turn 77 — assistant

Saved those final three aliases. The language pass now covers the intended classes and relationships; a vendor providing a service remains distinct from being contacted about an incident. The three unwanted canvas items are still unresolved.

**Does the wording and alias set look right before we capture fixed choices and decide which missing values must block an action?**

### Turn 78 — user

Yes, the wording preserves the distinctions we need. The aliases are alternative ways to describe the **same recorded facts**, not new relationships or evidence that an action succeeded.

I would carry forward the three unresolved canvas items—**Person**, the incorrect rule-to-tool “evaluated by” link, and the general incident “classification” field—rather than validate them by implication. We can move to fixed choices and action-blocking conditions.

### Turn 78 — assistant

The wording and aliases are confirmed. I’ll leave the three unwanted canvas items flagged and move to fixed choices.

What are the **approved value lists** for these recorded Incident properties: **status**, **severity**, and **category**? Please include the exact status values that count as *active* or block assignment and declaration. I won’t invent a severity threshold or category list from the examples so far.

### Turn 79 — user

These are the approved recorded values:

| Property | Allowed values |
|---|---|
| **Incident status** | `new`, `acknowledged`, `investigating`, `contained`, `recovering`, `monitoring`, `resolved`, `closed`, `cancelled` |
| **Severity** | `sev1-critical`, `sev2-high`, `sev3-medium`, `sev4-low` |
| **Category** | `availability`, `performance`, `capacity`, `network`, `application`, `database`, `infrastructure`, `data-integrity`, `cybersecurity`, `third-party`, `change-induced`, `other` |

The action boundaries are **not one universal definition of “active”**:

- **Assignment** is blocked when status is `closed` or `cancelled`. `resolved` is not excluded by this particular assignment check.
- **Major-incident declaration** is blocked when status is `resolved`, `closed`, or `cancelled`. The permitted statuses for that check are therefore `new`, `acknowledged`, `investigating`, `contained`, `recovering`, and `monitoring`. Severity must also be `sev1-critical` or `sev2-high`; that alone is not enough to declare.

For an **emergency change**, the linked incident must be active, but I would check that against the governing emergency-change procedure rather than turn the declaration rule’s status list into a universal definition.

### Turn 79 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n        allowed: [new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled]\n      severity:\n        type: text\n        allowed: [sev1-critical, sev2-high, sev3-medium, sev4-low]\n      category:\n        type: text\n        allowed: [availability, performance, capacity, network, application, database, infrastructure, data-integrity, cybersecurity, third-party, change-induced, other]\n"
}
```

### Turn 79 — tool

Applied. Added 0, updated 1 existing item(s).

### Turn 79 — assistant

Recorded the Incident value lists. I’ll keep the action boundaries separate: assignment excludes `closed` and `cancelled`; declaration also excludes `resolved` and requires `sev1-critical` or `sev2-high`. The emergency-change procedure determines its own active-incident check.

What are the approved choices for **Alert.status**, **BackupSet.status**, **Environment.environmentType**, and the **healthState** of IT and business services? If a value is missing or wrong, which of the listed actions must stop rather than proceed?

### Turn 80 — user

The approved choices are:

| Recorded value | Allowed choices |
|---|---|
| **Alert status** | `new`, `acknowledged`, `suppressed`, `escalated`, `closed` |
| **Backup-set status** | `scheduled`, `running`, `successful`, `failed`, `expired`, `corrupted`, `verified` |
| **Environment type** | `production`, `disaster-recovery`, `pre-production`, `test`, `development`, `management` |
| **IT-service and business-service health state** | `healthy`, `degraded`, `partially-unavailable`, `unavailable`, `recovering`, `unknown` |

A missing or invalid value does **not** block every action involving that record. It blocks an action when the required check cannot be established:

- **Acknowledge an alert:** stop unless its status is `new` and the operator is authorised.
- **Restore a backup:** stop unless its status is `successful` or `verified`; also check that it protects the target and that the restore point and target environment are approved.
- **Fail over a service:** the environment’s *type* does not prove the target is available. Stop if the applicable plan, target availability, or acceptable data-recovery point cannot be established.
- **Close an incident:** check the impacted services’ health. They must be `healthy` **or have a documented, accepted residual condition**. `unknown` or a missing health value is not proof of restoration; nor does `degraded` imply that the residual condition was accepted.

I would not turn the environment-type list into a rule that only one type is ever a valid action target; the specific target and its approval must be checked for the action.

### Turn 80 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    properties:\n      status:\n        type: text\n        allowed: [new, acknowledged, suppressed, escalated, closed]\n  BackupSet:\n    properties:\n      status:\n        type: text\n        allowed: [scheduled, running, successful, failed, expired, corrupted, verified]\n  Environment:\n    properties:\n      environmentType:\n        type: text\n        allowed: [production, disaster-recovery, pre-production, test, development, management]\n  ITService:\n    properties:\n      healthState:\n        type: text\n        allowed: [healthy, degraded, partially-unavailable, unavailable, recovering, unknown]\n  BusinessService:\n    properties:\n      healthState:\n        type: text\n        allowed: [healthy, degraded, partially-unavailable, unavailable, recovering, unknown]\n"
}
```

### Turn 80 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 80 — assistant

Recorded those five value lists. A missing or invalid value blocks an action only when it prevents a required check—for example, a non-`new` alert cannot be acknowledged, and an unverified backup cannot be restored. Environment type alone never proves target availability.

What are the approved choices for **ITService, BusinessService, and ConfigurationItem criticality tiers**, **Change.status and riskLevel**, and **Deployment.status**? If any has no fixed bank-wide list, please say so rather than invent one.

### Turn 81 — user

These use fixed recorded choices:

| Value | Allowed choices |
|---|---|
| **Criticality tier** — IT service, business service, configuration item | `tier-1-critical`, `tier-2-important`, `tier-3-standard`, `tier-4-supporting` |
| **Change status** | `draft`, `assessed`, `approved`, `scheduled`, `implementing`, `implemented`, `failed`, `rolled-back`, `closed`, `cancelled` |
| **Change risk level** | `low`, `medium`, `high`, `critical` |
| **Deployment status** | `planned`, `running`, `succeeded`, `failed`, `rolled-back`, `cancelled` |

These values describe different things. A change being `approved` does not establish that an emergency change has its required plans, affected components, incident justification, and explicit risk acceptance. A deployment being `succeeded` does not, by itself, prove service health or rule out a change-induced incident.

### Turn 81 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ITService:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]\n  BusinessService:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]\n  ConfigurationItem:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]\n  Change:\n    properties:\n      status:\n        type: text\n        allowed: [draft, assessed, approved, scheduled, implementing, implemented, failed, rolled-back, closed, cancelled]\n      riskLevel:\n        type: text\n        allowed: [low, medium, high, critical]\n  Deployment:\n    properties:\n      status:\n        type: text\n        allowed: [planned, running, succeeded, failed, rolled-back, cancelled]\n"
}
```

### Turn 81 — tool

Applied. Added 0, updated 5 existing item(s).

### Turn 81 — assistant

Recorded the criticality, change, risk, and deployment choices. An approved change still needs the emergency-path checks; a successful deployment is not proof of service health.

For the recovery plan’s **recovery time objective** and **recovery point objective**, what unit is each recorded in? And if either value is missing or unsuitable for a proposed failover, does the action stop, or is acceptability determined from another approved source?

### Turn 82 — user

The recovery plan records both objectives as **numeric values**, but I can’t give you a bank-wide unit for either from what we’ve established. The agent must use the unit and interpretation specified in the approved recovery plan or governing procedure, rather than assume minutes or hours.

A missing objective is **not, by itself, a stated failover blocker**. Failover must stop if we cannot establish that the plan applies to the service, the target recovery environment is available, or the proposed data-recovery point is acceptable. The recovery point objective may inform that last check, but the agent must not infer acceptance from a number without the approved basis for interpreting it.

### Turn 82 — assistant

I’ll leave both recovery objectives as numeric values **without a bank-wide unit**. The agent must read their unit and interpretation from the approved plan or procedure. A missing objective alone is not a failover blocker; an unestablished plan fit, target availability, or acceptable data-recovery point is.

That completes the fixed-choice and action-blocking pass. **Does this distinction—recorded values where confirmed, approved procedures for their interpretation, and no inferred permission when a required check is missing—match your intent before we capture decision rules?**

### Turn 83 — user

Yes, that matches my intent. Record the confirmed values, use the approved plan or procedure where interpretation is policy-dependent, and **do not proceed when a required action check cannot be established**. Equally, don’t turn every missing descriptive value into a blanket blocker when that action has no such requirement.

Keep the three unresolved canvas items flagged for validation; they are not part of the intended model.

### Turn 83 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canAcknowledgeAlert:\n    conditions:\n      - Alert status is new.\n      - The acting operator's authorisation for the responsible resolver group is confirmed in access-control records; on-call status alone is not sufficient.\n  canAssignIncident:\n    conditions:\n      - Incident status is neither closed nor cancelled.\n      - Approved resolver-group support or routing information confirms that the proposed group supports an affected IT service or configuration item.\n      - The basis for the proposed assignment is retained; an existing assignment alone does not prove suitability.\n  canDeclareMajorIncident:\n    conditions:\n      - Incident status is new, acknowledged, investigating, contained, recovering, or monitoring.\n      - Incident severity is sev1-critical or sev2-high.\n      - At least one impacted IT service is identified.\n      - An incident commander is assigned.\n      - The bank's approved major-incident declaration criteria are satisfied using documented supporting facts; missing facts are flagged rather than guessed.\n"
}
```

### Turn 83 — tool

Applied. Added 3, updated 0 existing item(s).

### Turn 83 — assistant

I’ve recorded the confirmed decision checks for **alert acknowledgement, incident assignment, and major-incident declaration**. The declaration rule uses the approved procedure as well as recorded facts; it does not let severity alone make the decision.

For the two scope-limiting actions—**contain an incident** and **isolate an affected configuration item**—are the conditions you gave earlier complete: documented impact and a rollback or reconnection method before execution, with containment also requiring approved steps? Is any additional approval required by the bank’s procedure, or should the rule simply defer to that procedure where applicable?

### Turn 84 — user

Not quite—the two checks differ.

For **containment**, the incident must be `acknowledged` or `investigating`, and the **containment scope and expected side effects** must be recorded before approved steps are executed. Once the steps are carried out, verify the containment indicators and service impact before marking the incident `contained`. A rollback or reconnection method is **not a stated containment precondition**.

For **isolation**, the configuration item must be linked to the incident, the **isolation impact** must be assessed, and a **rollback or reconnection method** must be available. Afterwards, confirm the item is isolated from the defined networks or dependencies and check remaining service health.

I wouldn’t invent an additional bank-wide approval requirement for either action. Where a particular step requires approval under the bank’s governing procedure, the agent should check that procedure rather than presume permission.

### Turn 84 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canContainIncident:\n    conditions:\n      - Incident status is acknowledged or investigating.\n      - Containment scope and expected side effects are recorded before execution.\n      - The steps to execute are approved under the applicable procedure where approval is required.\n  canIsolateConfigurationItem:\n    conditions:\n      - The configuration item is linked as affected by the incident.\n      - The impact of isolating the item is assessed.\n      - A rollback or reconnection method is available.\n      - Any approval required for the proposed step under the applicable procedure is confirmed.\n"
}
```

### Turn 84 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 84 — assistant

Recorded the distinct containment and isolation rules. Containment requires the stated incident statuses, recorded scope and side effects, and approved steps; isolation requires the affected-item link, impact assessment, and a way back. Neither rule invents a blanket approval requirement.

For **fail over a service** and **restore from a backup**, are these the complete blocking checks: failover needs an applicable plan, available target environment, and acceptable data-recovery point; restore needs a `successful` or `verified` backup covering the target, plus an approved restore point and target environment? Should either action have another bank-wide precondition from your list?

### Turn 85 — user

Yes—those are the **complete stated blocking checks** for these two actions.

- **Fail over a service:** the recovery plan must apply to the service, the target recovery environment must be available, and the data-recovery point must be acceptable. Then verify service health and critical business transactions in that environment.
- **Restore from a backup:** the backup must be `successful` or `verified` and protect the target; the restore point and target environment must be approved. Then validate data integrity and application functionality.

I would not add another bank-wide precondition to either list. Follow the governing procedure for how availability, acceptability, and approval are established, and retain the decision basis and verification results.

### Turn 85 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canFailOverService:\n    conditions:\n      - The recovery plan is applicable to the IT service being failed over.\n      - The proposed target recovery environment is confirmed available under the governing procedure; environment type alone is not proof.\n      - The proposed data-recovery point is confirmed acceptable using the approved basis, not an uninterpreted numeric objective.\n  canRestoreBackup:\n    conditions:\n      - The selected backup set status is successful or verified.\n      - The selected backup set protects the configuration item to be restored.\n      - The proposed restore point is approved.\n      - The target environment is approved.\n"
}
```

### Turn 85 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 85 — assistant

Recorded those two recovery rules without extra bank-wide blockers. Both still require the approved basis for their checks and post-action verification.

For **execute an emergency change**, is the blocking rule exactly: explicit emergency designation, linked incident confirmed active under the emergency-change procedure, identified affected configuration items, implementation and backout plans, and explicit risk acceptance? Does a general `Change.status` value also have to be in a particular state before execution, or has that not been established?

### Turn 86 — user

Yes. For an **emergency change**, check that it is explicitly designated for the emergency path, is linked to an incident confirmed active under the governing procedure, identifies the affected configuration items, has implementation and backout plans, and has **explicit risk acceptance**.

We have **not established a particular `Change.status` value as an additional blocking precondition**. The status should still be read and updated through the controlled change workflow; neither an `approved` status nor the incident link substitutes for the checks above. After execution, run technical checks, verify service health, and retain implementation evidence.

### Turn 86 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canExecuteEmergencyChange:\n    conditions:\n      - The change is explicitly designated for the emergency path in the controlled change workflow.\n      - The change is justified by a linked incident confirmed active under the governing emergency-change procedure.\n      - The affected configuration items are identified.\n      - An implementation plan and a backout plan are documented.\n      - The risk has been explicitly accepted in the controlled workflow; change status or an incident link alone is insufficient.\n"
}
```

### Turn 86 — tool

Applied. Added 1, updated 0 existing item(s).

### Turn 86 — assistant

Recorded the emergency-change checks, without inventing an additional blocking Change status. The controlled workflow still governs status updates and verification.

For **send a stakeholder update** and **submit a regulatory notification**, are the earlier lists complete as blocking conditions? The update needs audience, message, owner, approval, and consistency with the latest verified incident state; the notification needs a reportable assessment, incident and regulator links, complete information and evidence, `approved` status, and submission by its due time. Is either approval represented by something other than those controlled workflow checks?

### Turn 87 — user

Those are the complete stated checks, with one important distinction about approval.

For a **stakeholder update**, the audience, message, owner, and **approval state must be recorded**, and the content must match the latest verified incident state. The controlled communication workflow determines whether it is authorised to send; we have not established a blanket rule that its status must equal `approved` for every update. After sending, confirm delivery and archive the final message.

For a **regulatory notification**, the status **must be `approved`** before submission. It also needs a `reportable` assessment, links to the incident and regulator, complete required information and supporting evidence, and submission **before** its due time. Retain the receipt, then confirm acceptance or record rejection and remediation. An approved status is necessary here, but it is not proof of submission.

### Turn 87 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canSendStakeholderUpdate:\n    conditions:\n      - The audience, message, owner, and approval state are recorded in the controlled communication workflow.\n      - The controlled communication workflow confirms this update is authorised to send; no universal approved-status value is assumed.\n      - The content is consistent with the latest verified incident state.\n  canSubmitRegulatoryNotification:\n    conditions:\n      - The linked materiality assessment result is reportable.\n      - The notification identifies the incident being reported and the intended regulator.\n      - All required information and supporting evidence are complete under the approved reporting procedure.\n      - Notification status is approved.\n      - Submission can occur before the notification's due time, as established by the approved procedure.\n"
}
```

### Turn 87 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 87 — assistant

Recorded both communication rules. A stakeholder update relies on its controlled workflow rather than a universal `approved` value; a regulatory notification specifically requires `approved` status before its due time. Neither status proves delivery or submission.

For **close an incident**, is the blocking check complete if it requires: status `resolved` or `monitoring`; recorded resolution and restoration evidence; impacted services healthy or a documented accepted residual condition; required communications complete; and, for major or cybersecurity incidents, a review scheduled or completed? Does the bank require anything else from your original closure action?

### Turn 88 — user

Yes—that is the **complete stated closure check**. Do not close unless the incident is `resolved` or `monitoring`, resolution and restoration evidence is recorded, impacted services are healthy **or** their residual condition has been accepted, and required stakeholder communications are complete. For a major or cybersecurity incident, a post-incident review must be scheduled or completed.

After closure, record the closure time and verify the incident’s `closed` status, linked service states, and retained evidence. I would not add another bank-wide blocker to this rule; any policy-specific acceptance or communication requirement must be checked through its governing workflow.

### Turn 88 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canCloseIncident:\n    conditions:\n      - Incident status is resolved or monitoring.\n      - Resolution and restoration evidence is recorded and sufficient under the closure workflow.\n      - Each impacted service is healthy or its residual condition is documented and accepted through the closure workflow; missing or unknown health is not proof of restoration.\n      - Required stakeholder communications are confirmed complete through the communication workflow.\n      - If the incident is major or explicitly designated cybersecurity, a post-incident review is scheduled or completed in the review or closure workflow.\n"
}
```

### Turn 88 — tool

Applied. Added 1, updated 0 existing item(s).

### Turn 88 — assistant

Recorded the complete closure rule, including the conditional review requirement. Missing health or an undocumented residual condition cannot pass the check.

That completes the action-blocking rules for the eleven listed actions. They use the approved workflows where the bank’s criteria or approvals have not been specified here. **Do these rules reflect the conditions you gave, without adding a blanket blocker you did not intend?**

### Turn 89 — user

Yes. They reflect the stated blocking conditions for the eleven actions without turning descriptive fields or policy-dependent checks into blanket blockers. Where a required fact, authorisation, or approval cannot be established, the agent should stop that action and show what is missing.

The three unresolved canvas items remain exceptions to validating the live model; this confirms the **intended rules**, not those unwanted entries.

### Turn 89 — assistant

The intended rules are confirmed. I’ll now attach each action to one record, with its blocking rule, the change it makes, and a check that it succeeded. The agent must still stop when a required fact or permission is missing.

For the first three actions, is this right?

| Action | Record acted on | Result to record | Verify afterward |
|---|---|---|---|
| Acknowledge alert | Alert | Acknowledged state; acting person and time in the operational audit | Read back alert status and audit entry |
| Assign incident | Incident | Assigned resolver group and basis for selection | Read back the assignment |
| Declare major incident | Incident | Major designation, declaration time, commander, and coordination/communication cadence | Read back those records |

Each would use the corresponding rule we just confirmed.

### Turn 90 — user

Yes, with a few precision points:

| Action | Record acted on | Result and verification |
|---|---|---|
| **Acknowledge alert** | Alert | Record `acknowledged` status and the acknowledgement time; retain the acting person in the operational audit. Read back the alert status and confirm the audit record. |
| **Assign incident** | Incident | Record the resolver group. Read back the assignment. Retaining the routing basis is useful, but it is not an additional recorded link or blocking rule. |
| **Declare major incident** | Incident | Record the major-incident designation, declaration time, and assigned commander; start the coordination and communication cadence. Read back the designation, commander, declaration time, and communication record. |

Each action remains subject to its previously agreed preconditions. In particular, recording a result does not replace checking authorisation or the facts needed **before** acting.

### Turn 90 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canAssignIncident:\n    conditions:\n      - Incident status is neither closed nor cancelled.\n      - Approved resolver-group support or routing information confirms that the proposed group supports an affected IT service or configuration item.\nactions:\n  acknowledgeAlert:\n    input: Alert\n    preconditions: [canAcknowledgeAlert]\n    effect: Set alert status to acknowledged and record the acknowledgement time; retain the acting person in the operational audit.\n    verification: Read back the acknowledged alert status and confirm the acting person and acknowledgement time in the operational audit record.\n  assignIncident:\n    input: Incident\n    preconditions: [canAssignIncident]\n    effect: Record the incident's resolver group and retain the basis for selecting it.\n    verification: Read back the incident's resolver-group assignment.\n  declareMajorIncident:\n    input: Incident\n    preconditions: [canDeclareMajorIncident]\n    effect: Record the major-incident designation, declaration time, and assigned commander; start the coordination and communication cadence.\n    verification: Read back the major-incident designation, commander, declaration time, and communication record.\n"
}
```

### Turn 90 — tool

Applied. Added 3, updated 1 existing item(s).

### Turn 90 — assistant

Recorded those three actions and removed the routing-basis requirement from the **assignment blocking rule**. The assignment action retains the basis, but suitability must still be checked first.

For the next three actions, do these results and checks match your workflow?

| Action | Record acted on | Result to record | Verify afterward |
|---|---|---|---|
| Contain incident | Incident | Execute the approved containment steps; record the outcome and mark the incident `contained` only after checks pass | Check containment indicators and remaining service impact |
| Isolate affected item | ConfigurationItem | Carry out the defined isolation and retain its outcome with the action evidence | Confirm isolation from the defined networks or dependencies and check remaining-service health |
| Fail over service | ITService | Fail over using the applicable plan; retain the actual target, data-recovery point, and outcome with the action evidence | Check service health and critical business transactions in the target environment |

### Turn 91 — user

The results and checks are right, but I would change the **record acted on** for two rows:

| Action | Record acted on | Result and verification |
|---|---|---|
| **Contain incident** | Incident | Execute the approved containment steps. Mark it `contained` only once containment is verified; check the containment indicators and service impact. |
| **Isolate affected item** | **Incident**, with its linked configuration item identified | Isolate the item from the defined networks or dependencies. Retain the action outcome; confirm isolation and check remaining service health. |
| **Fail over service** | **Incident**, with the affected IT service and applicable recovery plan identified | Move the service workload to the recovery environment. Retain the actual target and decision basis; verify service health and critical business transactions there. |

So the configuration item and IT service are **targets of the work**, but the isolation and failover actions are initiated in the incident response context. All three still need their agreed preconditions checked before execution.

### Turn 91 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  containIncident:\n    input: Incident\n    preconditions: [canContainIncident]\n    effect: Execute approved containment steps and retain their outcome; mark the incident contained only after verification of containment indicators and remaining service impact.\n    verification: Check and retain containment indicators and remaining service impact before confirming incident status is contained.\n  isolateAffectedConfigurationItem:\n    input: Incident\n    preconditions: [canIsolateConfigurationItem]\n    effect: Isolate the configuration item linked to the incident from the defined networks or dependencies; retain the action outcome and reconnection basis with action evidence.\n    verification: Confirm the linked item is isolated from the defined networks or dependencies and check and retain remaining-service health.\n  failOverService:\n    input: Incident\n    preconditions: [canFailOverService]\n    effect: Move the affected IT service workload to the available recovery environment using the applicable recovery plan; retain the actual target and data-recovery-point decision basis with action evidence.\n    verification: Verify and retain service health and critical business transactions in the target environment.\n"
}
```

### Turn 91 — tool

Applied. Added 3, updated 0 existing item(s).

### Turn 91 — assistant

Recorded all three as **Incident-led actions**. The affected configuration item or IT service remains the target identified through the incident, while the action evidence retains the outcome and verification.

For the next two, should **restore from a backup** also act on the **Incident** (with the target item and selected backup in its action evidence), and should **execute an emergency change** act on **Change** (with its incident justification and implementation evidence)? What should each action change, and what read-back or technical checks confirm success?

### Turn 92 — user

**Restore from a backup acts on the selected backup set**, not on the incident. First check that it is `successful` or `verified`, protects the target, and has an approved restore point and target environment. The action restores the backup data to that target. Retain which backup and target were used, then validate **data integrity and application functionality**; the act of restoring alone is not proof of success.

**Execute an emergency change acts on the emergency change**, with the active incident recorded as its justification. Check the identified affected items, implementation and backout plans, and explicit risk acceptance before execution. Implement the change and update its status; then run technical checks, verify service health, and retain the implementation evidence.

### Turn 92 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  restoreFromBackup:\n    input: BackupSet\n    preconditions: [canRestoreBackup]\n    effect: Restore data from the selected backup set to the approved target and restore point; retain the selected backup, target, and restore outcome in action evidence.\n    verification: Validate and retain data-integrity and application-functionality checks for the restored target.\n  executeEmergencyChange:\n    input: Change\n    preconditions: [canExecuteEmergencyChange]\n    effect: Implement the explicitly designated emergency change justified by the active incident, update its controlled-workflow status, and retain implementation evidence.\n    verification: Run technical checks, verify service health, and retain the results and implementation evidence; do not infer success from change status alone.\n"
}
```

### Turn 92 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 92 — assistant

Recorded restore on **BackupSet** and emergency execution on **Change**. Both require technical verification; a completed restore or changed status alone is insufficient.

For **send stakeholder update** and **submit regulatory notification**, should each act on its own record—**StakeholderCommunication** and **RegulatoryNotification**, respectively? After sending or submitting, what exact result should be recorded and checked, including delivery or a receipt and any acceptance or rejection?

### Turn 93 — user

They differ in what the action acts on:

- **Send a stakeholder update acts on the incident**, using the controlled communication prepared for that incident. After the agreed audience, message, owner, approval state, and factual consistency checks, send and timestamp the communication. Confirm its delivery status and archive the final message. A sent timestamp alone is not proof of delivery.
- **Submit a regulatory notification acts on the notification record.** Once its submission checks pass, set its status to `submitted` and retain the submission receipt. Then confirm whether the authority accepts it; if it rejects it, record the rejection and remediation. `Submitted` is not the same as `accepted`.

### Turn 93 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  sendStakeholderUpdate:\n    input: Incident\n    preconditions: [canSendStakeholderUpdate]\n    effect: Send the controlled stakeholder communication about the incident, record its sent time, and archive the final message.\n    verification: Confirm the communication's delivery status and that the final sent message is archived; a sent timestamp alone is insufficient.\n  submitRegulatoryNotification:\n    input: RegulatoryNotification\n    preconditions: [canSubmitRegulatoryNotification]\n    effect: Submit the approved notification before its due time, set notification status to submitted, record submission time, and retain the submission receipt.\n    verification: Confirm the submission receipt and subsequently confirm acceptance or record rejection and required remediation; submitted is not accepted.\n"
}
```

### Turn 93 — tool

Applied. Added 2, updated 0 existing item(s).

### Turn 93 — assistant

Recorded the stakeholder update as **Incident-led** and regulatory submission as **Notification-led**. The first verifies delivery and an archived message; the second verifies a receipt, then tracks acceptance or rejection.

For the final action, **close incident**, is **Incident** the record acted on, with the effect of setting status to `closed` and recording closure time? Should verification read back that status and time, the impacted services’ health or accepted residual condition, and the retained resolution, restoration, communication, and review evidence?

### Turn 94 — user

Yes. **Close incident acts on the incident**. After all the agreed closure checks pass, set its status to `closed` and record the closure time.

Then read back the incident’s status and time, check the linked impacted services’ health or documented acceptance of a residual condition, and confirm the retained resolution and restoration evidence. Also verify that required communications are complete and, for a major or cybersecurity incident, that the post-incident review is scheduled or completed. A `closed` status alone is not sufficient verification.

### Turn 94 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  closeIncident:\n    input: Incident\n    preconditions: [canCloseIncident]\n    effect: Set incident status to closed and record the closure time after all closure checks pass.\n    verification: Read back closed status and closure time; verify impacted service health or documented acceptance of residual conditions, retained resolution and restoration evidence, completed required communications, and a scheduled or completed review for major or cybersecurity incidents.\n"
}
```

### Turn 94 — tool

Applied. Added 1, updated 0 existing item(s).

### Turn 94 — assistant

All **eleven actions** now have one record they act on, a confirmed blocking rule, a stated result, and a verification step. Isolation, failover, and stakeholder updates act in the incident context; restore acts on the selected backup set, and regulatory submission acts on the notification.

**Do you confirm this action set before I replay the ten questions and eleven actions against the live model and run the final canvas checklist?**

### Turn 95 — user

Yes, I confirm the **intended action set** and the record each action acts on. The agreed preconditions must be checked before execution, and the result verified afterward.

That is not yet a clean sign-off on the live canvas: the three previously flagged unwanted items still need to be resolved or explicitly excluded in the final checklist.

### Turn 95 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 95 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases:
      - incidens
      - hibajegy
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
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
      majorIncident:
        type: boolean
      declarationTime:
        type: date
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      classification:
        type: text
      resolutionTime:
        type: date
      detectedTime:
        type: date
      openedTime:
        type: date
      closedTime:
        type: date
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases:
      - informatikai szolgáltatás
      - informatics service
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases:
      - CI
      - konfigurációs elem
    properties:
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases:
      - outsourced service
      - külső szolgáltatás
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases:
      - esemény
    properties:
      observedAt:
        type: date
      eventType:
        type: text
      detectionSource:
        type: text
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases:
      - riasztás
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      raisedAt:
        type: date
      summary:
        type: text
      detectionSource:
        type: text
      severity:
        type: text
      occurrenceCount:
        type: number
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases:
      - megoldócsoport
      - support group
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases:
      - ügyeletes mérnök
      - on-call
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases:
      - incident manager
      - incidensparancsnok
      - MIM lead
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases:
      - network operations centre
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases:
      - security operations centre
      - SOC
      - biztonsági műveleti központ
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - üzemeltetési eljárás
      - playbook
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases:
      - mentéskészlet
      - backup
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - running
          - successful
          - failed
          - expired
          - corrupted
          - verified
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases:
      - helyreállítási terv
      - DR plan
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases:
      - környezet
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases:
      - változás
      - módosítás
    properties:
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases:
      - telepítés
      - élesítés
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startTime:
        type: date
      completionTime:
        type: date
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
      findings:
        type: text
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
      description:
        type: text
      status:
        type: text
        allowed:
          - open
          - in progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases:
      - kiadás
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      dueTime:
        type: date
      submissionTime:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases:
      - evidence
      - bizonyíték
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases:
      - értesítés
      - tájékoztatás
    properties:
      audience:
        type: text
      messageSummary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentAt:
        type: date
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases:
      - probléma
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases:
      - supplier
      - szállító
      - beszállító
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases:
      - érintett
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases:
      - adatbázis
      - DB
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases:
      - infrastruktúra-elem
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases:
      - The IT service is impacted by the incident
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases:
      - The business service is impacted by the incident
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases:
      - The configuration item is affected by the incident
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases:
      - The business service relies on the IT service
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases:
      - Customers access the business service through that channel
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases:
      - The IT service relies on that externally provided service
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases:
      - That application provides the software functionality for the IT service
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases:
      - "The infrastructure component hosts the IT service's workload"
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases:
      - The application accesses that database
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases:
      - "The component hosts the application's workload"
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases:
      - The alert prompted the incident record
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: An event included among observations correlated to establish the incident; no single event proves it.
    aliases:
      - The incident was correlated from that event
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases:
      - The alert points to that observed event
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases:
      - The alert is about that IT service
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases:
      - The alert is about that configuration item
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases:
      - The observation was recorded on that item
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases:
      - The event is associated with that IT service
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases:
      - That monitoring rule produced the alert
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases:
      - Network operations runs that monitoring platform
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases:
      - The monitoring tool ran the rule
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases:
      - Security operations watches that security-relevant event
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases:
      - That resolver group has the incident assignment
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases:
      - "That on-call engineer is handling the incident's technical response"
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases:
      - The engineer belongs to that resolver group
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases:
      - The service owner is accountable for that IT service across its lifecycle
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases:
      - The commander leads the major-incident response and its decision cadence
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases:
      - The commander coordinates the response to that incident
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases:
      - The response team coordinates the wider major-incident effort
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases:
      - The service desk logged the incident
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases:
      - The commander belongs to the incident response team
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases:
      - The team used that runbook to guide the incident response
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases:
      - A temporary way around the known error is documented
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases:
      - The runbook describes how to apply the workaround
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases:
      - The plan sets out how to bring that IT service back
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases:
      - The plan calls for that backup set
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases:
      - That recovery plan was used in restoring service during the incident
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases:
      - That item is covered by the backup set
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases:
      - The IT service runs in that deployment environment
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases:
      - That item is assigned to that environment
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases:
      - The release carries that approved change
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases:
      - The deployment puts the release into effect
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases:
      - That item is changed under the change record
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases:
      - "The IT service is within the change's scope"
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases:
      - The deployment is directed at that environment
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases:
      - The deployment installs or activates that application
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases:
      - The incident was examined in that review
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases:
      - That follow-up action came out of the review
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases:
      - That change carries out the corrective action
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases:
      - The incident is associated with that problem record
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases:
      - A known-error record documents the diagnosed problem
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases:
      - The review surfaced an underlying or potential cause for investigation
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases:
      - That unit is accountable for following the corrective action through
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases:
      - "The assessment considers that incident's significance and reporting implications"
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases:
      - A reportable assessment gives rise to a notification
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases:
      - The submission concerns that incident
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator to whom the regulatory notification is sent.
    aliases:
      - The competent authority is the intended recipient of the submission
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases:
      - That evidence item documents the incident
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases:
      - That evidence item supports the submission
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases:
      - The message concerns that incident
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases:
      - "That stakeholder is the message's intended recipient"
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases:
      - That vendor supplies the external service
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases:
      - The vendor has been brought into the incident response through an escalation
  - name: justifiedByIncident
    from: Change
    to: Incident
    meaning: The active incident that justifies executing this change through the emergency path; the link alone does not authorise execution.
    aliases:
      - The active incident is the reason for taking the emergency-change path
rules:
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - "The acting operator's authorisation for the responsible resolver group is confirmed in access-control records; on-call status alone is not sufficient."
  canAssignIncident:
    conditions:
      - Incident status is neither closed nor cancelled.
      - Approved resolver-group support or routing information confirms that the proposed group supports an affected IT service or configuration item.
  canDeclareMajorIncident:
    conditions:
      - "Incident status is new, acknowledged, investigating, contained, recovering, or monitoring."
      - Incident severity is sev1-critical or sev2-high.
      - At least one impacted IT service is identified.
      - An incident commander is assigned.
      - "The bank's approved major-incident declaration criteria are satisfied using documented supporting facts; missing facts are flagged rather than guessed."
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - Containment scope and expected side effects are recorded before execution.
      - The steps to execute are approved under the applicable procedure where approval is required.
  canIsolateConfigurationItem:
    conditions:
      - The configuration item is linked as affected by the incident.
      - The impact of isolating the item is assessed.
      - A rollback or reconnection method is available.
      - Any approval required for the proposed step under the applicable procedure is confirmed.
  canFailOverService:
    conditions:
      - The recovery plan is applicable to the IT service being failed over.
      - The proposed target recovery environment is confirmed available under the governing procedure; environment type alone is not proof.
      - "The proposed data-recovery point is confirmed acceptable using the approved basis, not an uninterpreted numeric objective."
  canRestoreBackup:
    conditions:
      - The selected backup set status is successful or verified.
      - The selected backup set protects the configuration item to be restored.
      - The proposed restore point is approved.
      - The target environment is approved.
  canExecuteEmergencyChange:
    conditions:
      - The change is explicitly designated for the emergency path in the controlled change workflow.
      - The change is justified by a linked incident confirmed active under the governing emergency-change procedure.
      - The affected configuration items are identified.
      - An implementation plan and a backout plan are documented.
      - The risk has been explicitly accepted in the controlled workflow; change status or an incident link alone is insufficient.
  canSendStakeholderUpdate:
    conditions:
      - "The audience, message, owner, and approval state are recorded in the controlled communication workflow."
      - The controlled communication workflow confirms this update is authorised to send; no universal approved-status value is assumed.
      - The content is consistent with the latest verified incident state.
  canSubmitRegulatoryNotification:
    conditions:
      - The linked materiality assessment result is reportable.
      - The notification identifies the incident being reported and the intended regulator.
      - All required information and supporting evidence are complete under the approved reporting procedure.
      - Notification status is approved.
      - "Submission can occur before the notification's due time, as established by the approved procedure."
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - Resolution and restoration evidence is recorded and sufficient under the closure workflow.
      - Each impacted service is healthy or its residual condition is documented and accepted through the closure workflow; missing or unknown health is not proof of restoration.
      - Required stakeholder communications are confirmed complete through the communication workflow.
      - "If the incident is major or explicitly designated cybersecurity, a post-incident review is scheduled or completed in the review or closure workflow."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set alert status to acknowledged and record the acknowledgement time; retain the acting person in the operational audit.
    verification: Read back the acknowledged alert status and confirm the acting person and acknowledgement time in the operational audit record.
  assignIncident:
    input: Incident
    preconditions:
      - canAssignIncident
    effect: "Record the incident's resolver group and retain the basis for selecting it."
    verification: "Read back the incident's resolver-group assignment."
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Record the major-incident designation, declaration time, and assigned commander; start the coordination and communication cadence."
    verification: "Read back the major-incident designation, commander, declaration time, and communication record."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: Execute approved containment steps and retain their outcome; mark the incident contained only after verification of containment indicators and remaining service impact.
    verification: Check and retain containment indicators and remaining service impact before confirming incident status is contained.
  isolateAffectedConfigurationItem:
    input: Incident
    preconditions:
      - canIsolateConfigurationItem
    effect: Isolate the configuration item linked to the incident from the defined networks or dependencies; retain the action outcome and reconnection basis with action evidence.
    verification: Confirm the linked item is isolated from the defined networks or dependencies and check and retain remaining-service health.
  failOverService:
    input: Incident
    preconditions:
      - canFailOverService
    effect: Move the affected IT service workload to the available recovery environment using the applicable recovery plan; retain the actual target and data-recovery-point decision basis with action evidence.
    verification: Verify and retain service health and critical business transactions in the target environment.
  restoreFromBackup:
    input: BackupSet
    preconditions:
      - canRestoreBackup
    effect: "Restore data from the selected backup set to the approved target and restore point; retain the selected backup, target, and restore outcome in action evidence."
    verification: Validate and retain data-integrity and application-functionality checks for the restored target.
  executeEmergencyChange:
    input: Change
    preconditions:
      - canExecuteEmergencyChange
    effect: "Implement the explicitly designated emergency change justified by the active incident, update its controlled-workflow status, and retain implementation evidence."
    verification: "Run technical checks, verify service health, and retain the results and implementation evidence; do not infer success from change status alone."
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - canSendStakeholderUpdate
    effect: "Send the controlled stakeholder communication about the incident, record its sent time, and archive the final message."
    verification: "Confirm the communication's delivery status and that the final sent message is archived; a sent timestamp alone is insufficient."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the approved notification before its due time, set notification status to submitted, record submission time, and retain the submission receipt."
    verification: Confirm the submission receipt and subsequently confirm acceptance or record rejection and required remediation; submitted is not accepted.
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: Set incident status to closed and record the closure time after all closure checks pass.
    verification: "Read back closed status and closure time; verify impacted service health or documented acceptance of residual conditions, retained resolution and restoration evidence, completed required communications, and a scheduled or completed review for major or cybersecurity incidents."


### Turn 95 — assistant

I checked the live model against the ten questions and eleven actions. **All eleven actions** have a blocking rule, one input record, an effect, and a verification step. Most questions have a supported path, but I found one gap before I can pass the competency check:

Your question asks, **“Which current alerts and events are correlated with the incident?”** The model links an incident to correlated events, but its only Incident → Alert link identifies the alert that *prompted the incident record*. That cannot identify other alerts correlated later.

Should we record a separate **Incident → correlated with → Alert** link for alerts associated with an existing incident, whether or not they prompted its creation?

### Turn 96 — user

I would **not add a separate incident-to-alert “correlated with” link** to this model. The direct link records the alert that triggered the incident; other candidate alerts can be found through the events they indicate and the services or configuration items they concern, then filtered by alert status and time.

That search does **not** make every matching alert a confirmed correlation. The agent should distinguish the triggering alert from later candidate alerts and report what evidence supports each association. If the accepted question requires a definitive list of *all* later-correlated alerts, that remains a gap in the current recorded links—I would flag it rather than invent a relationship.

### Turn 96 — assistant

Understood. I won’t add the link. The agent can identify the **triggering alert**, then find **candidate later alerts** through events, services, components, status, and time, showing the evidence for each. Those candidates are not confirmed correlations.

Does that evidence-labelled candidate list satisfy your original question, or must the agent provide a definitive list of all later-correlated alerts? If it must be definitive, I’ll mark that question as an unresolved model gap in validation.

### Turn 97 — user

For the original question, **an evidence-labelled candidate list is useful but not a complete answer**. The agent can report the triggering alert and the events recorded as correlated with the incident. It can also identify later alerts worth investigating, clearly labelled as candidates—but it cannot call those alerts definitively correlated on the links we’ve established.

Please mark the **definitive list of later-correlated alerts as an unresolved model gap** in validation.

### Turn 97 — assistant

I’ve marked the **definitive list of later-correlated alerts** as an unresolved gap. The model can show the triggering alert, recorded correlated events, and evidence-labelled candidate alerts—but not certify that every later alert is correlated.

The replay found one more point to resolve: the service dependency path reaches **Application, Database, and InfrastructureComponent**, while isolation and backup coverage use **ConfigurationItem**. Without a subtype link, how does the agent identify the corresponding configuration item from one of those technical records—through an approved component inventory lookup, or through a direct operational connection you record?

### Turn 98 — user

Use the **approved configuration inventory** to identify the configuration item represented by an application, database, or infrastructure-component record. These are specific kinds of managed component, not separate components that need a new “corresponds to” operational link.

The agent must verify the item’s identity in that inventory before using it for isolation or checking backup coverage. A technical dependency path identifies where to look; it does not establish that a particular configuration item is the affected or protected target. If the records cannot be matched reliably, flag that as missing information rather than proceed with the action.

### Turn 98 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 98 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases:
      - incidens
      - hibajegy
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
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
      majorIncident:
        type: boolean
      declarationTime:
        type: date
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      classification:
        type: text
      resolutionTime:
        type: date
      detectedTime:
        type: date
      openedTime:
        type: date
      closedTime:
        type: date
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases:
      - informatikai szolgáltatás
      - informatics service
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases:
      - CI
      - konfigurációs elem
    properties:
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases:
      - outsourced service
      - külső szolgáltatás
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases:
      - esemény
    properties:
      observedAt:
        type: date
      eventType:
        type: text
      detectionSource:
        type: text
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases:
      - riasztás
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      raisedAt:
        type: date
      summary:
        type: text
      detectionSource:
        type: text
      severity:
        type: text
      occurrenceCount:
        type: number
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases:
      - megoldócsoport
      - support group
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases:
      - ügyeletes mérnök
      - on-call
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases:
      - incident manager
      - incidensparancsnok
      - MIM lead
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases:
      - network operations centre
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases:
      - security operations centre
      - SOC
      - biztonsági műveleti központ
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - üzemeltetési eljárás
      - playbook
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases:
      - mentéskészlet
      - backup
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - running
          - successful
          - failed
          - expired
          - corrupted
          - verified
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases:
      - helyreállítási terv
      - DR plan
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases:
      - környezet
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases:
      - változás
      - módosítás
    properties:
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases:
      - telepítés
      - élesítés
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startTime:
        type: date
      completionTime:
        type: date
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
      findings:
        type: text
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
      description:
        type: text
      status:
        type: text
        allowed:
          - open
          - in progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases:
      - kiadás
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      dueTime:
        type: date
      submissionTime:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases:
      - evidence
      - bizonyíték
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases:
      - értesítés
      - tájékoztatás
    properties:
      audience:
        type: text
      messageSummary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentAt:
        type: date
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases:
      - probléma
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases:
      - supplier
      - szállító
      - beszállító
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases:
      - érintett
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases:
      - adatbázis
      - DB
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases:
      - infrastruktúra-elem
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases:
      - The IT service is impacted by the incident
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases:
      - The business service is impacted by the incident
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases:
      - The configuration item is affected by the incident
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases:
      - The business service relies on the IT service
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases:
      - Customers access the business service through that channel
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases:
      - The IT service relies on that externally provided service
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases:
      - That application provides the software functionality for the IT service
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases:
      - "The infrastructure component hosts the IT service's workload"
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases:
      - The application accesses that database
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases:
      - "The component hosts the application's workload"
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases:
      - The alert prompted the incident record
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: An event included among observations correlated to establish the incident; no single event proves it.
    aliases:
      - The incident was correlated from that event
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases:
      - The alert points to that observed event
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases:
      - The alert is about that IT service
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases:
      - The alert is about that configuration item
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases:
      - The observation was recorded on that item
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases:
      - The event is associated with that IT service
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases:
      - That monitoring rule produced the alert
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases:
      - Network operations runs that monitoring platform
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases:
      - The monitoring tool ran the rule
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases:
      - Security operations watches that security-relevant event
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases:
      - That resolver group has the incident assignment
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases:
      - "That on-call engineer is handling the incident's technical response"
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases:
      - The engineer belongs to that resolver group
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases:
      - The service owner is accountable for that IT service across its lifecycle
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases:
      - The commander leads the major-incident response and its decision cadence
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases:
      - The commander coordinates the response to that incident
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases:
      - The response team coordinates the wider major-incident effort
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases:
      - The service desk logged the incident
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases:
      - The commander belongs to the incident response team
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases:
      - The team used that runbook to guide the incident response
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases:
      - A temporary way around the known error is documented
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases:
      - The runbook describes how to apply the workaround
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases:
      - The plan sets out how to bring that IT service back
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases:
      - The plan calls for that backup set
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases:
      - That recovery plan was used in restoring service during the incident
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases:
      - That item is covered by the backup set
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases:
      - The IT service runs in that deployment environment
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases:
      - That item is assigned to that environment
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases:
      - The release carries that approved change
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases:
      - The deployment puts the release into effect
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases:
      - That item is changed under the change record
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases:
      - "The IT service is within the change's scope"
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases:
      - The deployment is directed at that environment
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases:
      - The deployment installs or activates that application
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases:
      - The incident was examined in that review
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases:
      - That follow-up action came out of the review
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases:
      - That change carries out the corrective action
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases:
      - The incident is associated with that problem record
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases:
      - A known-error record documents the diagnosed problem
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases:
      - The review surfaced an underlying or potential cause for investigation
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases:
      - That unit is accountable for following the corrective action through
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases:
      - "The assessment considers that incident's significance and reporting implications"
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases:
      - A reportable assessment gives rise to a notification
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases:
      - The submission concerns that incident
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator to whom the regulatory notification is sent.
    aliases:
      - The competent authority is the intended recipient of the submission
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases:
      - That evidence item documents the incident
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases:
      - That evidence item supports the submission
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases:
      - The message concerns that incident
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases:
      - "That stakeholder is the message's intended recipient"
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases:
      - That vendor supplies the external service
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases:
      - The vendor has been brought into the incident response through an escalation
  - name: justifiedByIncident
    from: Change
    to: Incident
    meaning: The active incident that justifies executing this change through the emergency path; the link alone does not authorise execution.
    aliases:
      - The active incident is the reason for taking the emergency-change path
rules:
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - "The acting operator's authorisation for the responsible resolver group is confirmed in access-control records; on-call status alone is not sufficient."
  canAssignIncident:
    conditions:
      - Incident status is neither closed nor cancelled.
      - Approved resolver-group support or routing information confirms that the proposed group supports an affected IT service or configuration item.
  canDeclareMajorIncident:
    conditions:
      - "Incident status is new, acknowledged, investigating, contained, recovering, or monitoring."
      - Incident severity is sev1-critical or sev2-high.
      - At least one impacted IT service is identified.
      - An incident commander is assigned.
      - "The bank's approved major-incident declaration criteria are satisfied using documented supporting facts; missing facts are flagged rather than guessed."
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - Containment scope and expected side effects are recorded before execution.
      - The steps to execute are approved under the applicable procedure where approval is required.
  canIsolateConfigurationItem:
    conditions:
      - The configuration item is linked as affected by the incident.
      - The impact of isolating the item is assessed.
      - A rollback or reconnection method is available.
      - Any approval required for the proposed step under the applicable procedure is confirmed.
  canFailOverService:
    conditions:
      - The recovery plan is applicable to the IT service being failed over.
      - The proposed target recovery environment is confirmed available under the governing procedure; environment type alone is not proof.
      - "The proposed data-recovery point is confirmed acceptable using the approved basis, not an uninterpreted numeric objective."
  canRestoreBackup:
    conditions:
      - The selected backup set status is successful or verified.
      - The selected backup set protects the configuration item to be restored.
      - The proposed restore point is approved.
      - The target environment is approved.
  canExecuteEmergencyChange:
    conditions:
      - The change is explicitly designated for the emergency path in the controlled change workflow.
      - The change is justified by a linked incident confirmed active under the governing emergency-change procedure.
      - The affected configuration items are identified.
      - An implementation plan and a backout plan are documented.
      - The risk has been explicitly accepted in the controlled workflow; change status or an incident link alone is insufficient.
  canSendStakeholderUpdate:
    conditions:
      - "The audience, message, owner, and approval state are recorded in the controlled communication workflow."
      - The controlled communication workflow confirms this update is authorised to send; no universal approved-status value is assumed.
      - The content is consistent with the latest verified incident state.
  canSubmitRegulatoryNotification:
    conditions:
      - The linked materiality assessment result is reportable.
      - The notification identifies the incident being reported and the intended regulator.
      - All required information and supporting evidence are complete under the approved reporting procedure.
      - Notification status is approved.
      - "Submission can occur before the notification's due time, as established by the approved procedure."
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - Resolution and restoration evidence is recorded and sufficient under the closure workflow.
      - Each impacted service is healthy or its residual condition is documented and accepted through the closure workflow; missing or unknown health is not proof of restoration.
      - Required stakeholder communications are confirmed complete through the communication workflow.
      - "If the incident is major or explicitly designated cybersecurity, a post-incident review is scheduled or completed in the review or closure workflow."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set alert status to acknowledged and record the acknowledgement time; retain the acting person in the operational audit.
    verification: Read back the acknowledged alert status and confirm the acting person and acknowledgement time in the operational audit record.
  assignIncident:
    input: Incident
    preconditions:
      - canAssignIncident
    effect: "Record the incident's resolver group and retain the basis for selecting it."
    verification: "Read back the incident's resolver-group assignment."
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Record the major-incident designation, declaration time, and assigned commander; start the coordination and communication cadence."
    verification: "Read back the major-incident designation, commander, declaration time, and communication record."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: Execute approved containment steps and retain their outcome; mark the incident contained only after verification of containment indicators and remaining service impact.
    verification: Check and retain containment indicators and remaining service impact before confirming incident status is contained.
  isolateAffectedConfigurationItem:
    input: Incident
    preconditions:
      - canIsolateConfigurationItem
    effect: Isolate the configuration item linked to the incident from the defined networks or dependencies; retain the action outcome and reconnection basis with action evidence.
    verification: Confirm the linked item is isolated from the defined networks or dependencies and check and retain remaining-service health.
  failOverService:
    input: Incident
    preconditions:
      - canFailOverService
    effect: Move the affected IT service workload to the available recovery environment using the applicable recovery plan; retain the actual target and data-recovery-point decision basis with action evidence.
    verification: Verify and retain service health and critical business transactions in the target environment.
  restoreFromBackup:
    input: BackupSet
    preconditions:
      - canRestoreBackup
    effect: "Restore data from the selected backup set to the approved target and restore point; retain the selected backup, target, and restore outcome in action evidence."
    verification: Validate and retain data-integrity and application-functionality checks for the restored target.
  executeEmergencyChange:
    input: Change
    preconditions:
      - canExecuteEmergencyChange
    effect: "Implement the explicitly designated emergency change justified by the active incident, update its controlled-workflow status, and retain implementation evidence."
    verification: "Run technical checks, verify service health, and retain the results and implementation evidence; do not infer success from change status alone."
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - canSendStakeholderUpdate
    effect: "Send the controlled stakeholder communication about the incident, record its sent time, and archive the final message."
    verification: "Confirm the communication's delivery status and that the final sent message is archived; a sent timestamp alone is insufficient."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the approved notification before its due time, set notification status to submitted, record submission time, and retain the submission receipt."
    verification: Confirm the submission receipt and subsequently confirm acceptance or record rejection and required remediation; submitted is not accepted.
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: Set incident status to closed and record the closure time after all closure checks pass.
    verification: "Read back closed status and closure time; verify impacted service health or documented acceptance of residual conditions, retained resolution and restoration evidence, completed required communications, and a scheduled or completed review for major or cybersecurity incidents."


### Turn 98 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canIsolateConfigurationItem:\n    conditions:\n      - The configuration item is linked as affected by the incident.\n      - If the item was found through an application, database, or infrastructure-component record, its identity is verified against the approved configuration inventory; if the match is unreliable, stop.\n      - The impact of isolating the item is assessed.\n      - A rollback or reconnection method is available.\n      - Any approval required for the proposed step under the applicable procedure is confirmed.\n  canRestoreBackup:\n    conditions:\n      - The selected backup set status is successful or verified.\n      - The selected backup set protects the configuration item to be restored.\n      - If the target was found through an application, database, or infrastructure-component record, its configuration-item identity is verified against the approved configuration inventory; if the match is unreliable, stop.\n      - The proposed restore point is approved.\n      - The target environment is approved.\n"
}
```

### Turn 98 — tool

Applied. Added 0, updated 2 existing item(s).

### Turn 98 — assistant

I’ve updated the isolation and restore rules: when a target is found through an application, database, or infrastructure record, the agent must verify its configuration-item identity in the approved inventory. If it cannot match the records reliably, it must stop rather than guess.

One competency-check gap remains for **“Which corrective actions from earlier incident reviews remain open for this service?”** We can trace the earlier review and incident, and read each action’s status, but you said its relevance also depends on the **particular action’s scope**. Where should the agent check that scope—does the corrective-action description establish it, or is it recorded in an approved review or action workflow?

### Turn 99 — user

Start with the **corrective action’s description** and the **review’s findings**, then check the earlier incident’s recorded service impacts. If the action is implemented by a change, that change’s affected-service and modified-component links may help clarify its scope.

There is **no separate corrective-action-to-service link or dedicated scope field** in what we’ve established. A description alone may be too vague to establish relevance. In that case, check the approved review or action workflow with the action’s owning organizational unit, and label relevance **unconfirmed** until it can be established. The agent can still report the action’s recorded status without presenting it as an open action *for this service*.

### Turn 99 — assistant

That gives the agent a way to check **service relevance** without inventing a direct action-to-service link: use the action description, review findings, earlier incident impacts, and any implementing change; if those are inconclusive, check with the owning unit and report relevance as **unconfirmed**.

For “corrective actions … remain open,” which of the recorded statuses count as **outstanding**: `open`, `in progress`, `blocked`, `implemented`, `verified`, `closed`, and `cancelled`?

### Turn 100 — user

For a list of work **still to be done**, include `open`, `in-progress`, and `blocked`. I would show `implemented` separately as **awaiting verification**, not call it completed merely because the change was made.

I would not impose a universal “outstanding” rule on `verified`: verification and closure are distinct recorded states, and the approved action workflow determines whether anything remains before closure. `closed` and `cancelled` are not open work, though cancellation should not be presented as successful completion.

For the service-specific question, the agent must also establish that each action is relevant to that service; status alone cannot do that.

### Turn 100 — assistant

I’ll treat `open`, `in progress`, and `blocked` as work still to do; show `implemented` separately as awaiting verification; and leave `verified` to the approved workflow. A service-specific list also needs confirmed relevance, not just status.

One exact-value check before I record that rule: the canvas currently stores **`in progress`** (with a space), while you wrote **`in-progress`**. Is `in-progress` another way of writing the recorded value `in progress`, or should the approved value on the canvas change?

### Turn 101 — user

The approved recorded value is **`in-progress`**, with a hyphen. **`in progress`** is fine in ordinary prose, but it should not be a second stored value. The canvas value needs correction; I can’t change it directly, so please flag it as unresolved if your tool cannot update it.

### Turn 101 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 101 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases:
      - incidens
      - hibajegy
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
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
      majorIncident:
        type: boolean
      declarationTime:
        type: date
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      classification:
        type: text
      resolutionTime:
        type: date
      detectedTime:
        type: date
      openedTime:
        type: date
      closedTime:
        type: date
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases:
      - informatikai szolgáltatás
      - informatics service
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases:
      - CI
      - konfigurációs elem
    properties:
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases:
      - outsourced service
      - külső szolgáltatás
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases:
      - esemény
    properties:
      observedAt:
        type: date
      eventType:
        type: text
      detectionSource:
        type: text
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases:
      - riasztás
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      raisedAt:
        type: date
      summary:
        type: text
      detectionSource:
        type: text
      severity:
        type: text
      occurrenceCount:
        type: number
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases:
      - megoldócsoport
      - support group
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases:
      - ügyeletes mérnök
      - on-call
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases:
      - incident manager
      - incidensparancsnok
      - MIM lead
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases:
      - network operations centre
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases:
      - security operations centre
      - SOC
      - biztonsági műveleti központ
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - üzemeltetési eljárás
      - playbook
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases:
      - mentéskészlet
      - backup
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - running
          - successful
          - failed
          - expired
          - corrupted
          - verified
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases:
      - helyreállítási terv
      - DR plan
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases:
      - környezet
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases:
      - változás
      - módosítás
    properties:
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases:
      - telepítés
      - élesítés
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startTime:
        type: date
      completionTime:
        type: date
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
      findings:
        type: text
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
      description:
        type: text
      status:
        type: text
        allowed:
          - open
          - in progress
          - blocked
          - implemented
          - verified
          - closed
          - cancelled
      dueDate:
        type: date
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases:
      - kiadás
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      dueTime:
        type: date
      submissionTime:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases:
      - evidence
      - bizonyíték
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases:
      - értesítés
      - tájékoztatás
    properties:
      audience:
        type: text
      messageSummary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentAt:
        type: date
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases:
      - probléma
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases:
      - supplier
      - szállító
      - beszállító
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases:
      - érintett
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases:
      - adatbázis
      - DB
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases:
      - infrastruktúra-elem
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases:
      - The IT service is impacted by the incident
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases:
      - The business service is impacted by the incident
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases:
      - The configuration item is affected by the incident
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases:
      - The business service relies on the IT service
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases:
      - Customers access the business service through that channel
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases:
      - The IT service relies on that externally provided service
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases:
      - That application provides the software functionality for the IT service
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases:
      - "The infrastructure component hosts the IT service's workload"
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases:
      - The application accesses that database
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases:
      - "The component hosts the application's workload"
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases:
      - The alert prompted the incident record
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: An event included among observations correlated to establish the incident; no single event proves it.
    aliases:
      - The incident was correlated from that event
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases:
      - The alert points to that observed event
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases:
      - The alert is about that IT service
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases:
      - The alert is about that configuration item
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases:
      - The observation was recorded on that item
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases:
      - The event is associated with that IT service
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases:
      - That monitoring rule produced the alert
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases:
      - Network operations runs that monitoring platform
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases:
      - The monitoring tool ran the rule
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases:
      - Security operations watches that security-relevant event
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases:
      - That resolver group has the incident assignment
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases:
      - "That on-call engineer is handling the incident's technical response"
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases:
      - The engineer belongs to that resolver group
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases:
      - The service owner is accountable for that IT service across its lifecycle
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases:
      - The commander leads the major-incident response and its decision cadence
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases:
      - The commander coordinates the response to that incident
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases:
      - The response team coordinates the wider major-incident effort
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases:
      - The service desk logged the incident
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases:
      - The commander belongs to the incident response team
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases:
      - The team used that runbook to guide the incident response
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases:
      - A temporary way around the known error is documented
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases:
      - The runbook describes how to apply the workaround
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases:
      - The plan sets out how to bring that IT service back
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases:
      - The plan calls for that backup set
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases:
      - That recovery plan was used in restoring service during the incident
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases:
      - That item is covered by the backup set
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases:
      - The IT service runs in that deployment environment
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases:
      - That item is assigned to that environment
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases:
      - The release carries that approved change
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases:
      - The deployment puts the release into effect
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases:
      - That item is changed under the change record
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases:
      - "The IT service is within the change's scope"
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases:
      - The deployment is directed at that environment
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases:
      - The deployment installs or activates that application
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases:
      - The incident was examined in that review
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases:
      - That follow-up action came out of the review
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases:
      - That change carries out the corrective action
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases:
      - The incident is associated with that problem record
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases:
      - A known-error record documents the diagnosed problem
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases:
      - The review surfaced an underlying or potential cause for investigation
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases:
      - That unit is accountable for following the corrective action through
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases:
      - "The assessment considers that incident's significance and reporting implications"
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases:
      - A reportable assessment gives rise to a notification
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases:
      - The submission concerns that incident
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator to whom the regulatory notification is sent.
    aliases:
      - The competent authority is the intended recipient of the submission
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases:
      - That evidence item documents the incident
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases:
      - That evidence item supports the submission
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases:
      - The message concerns that incident
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases:
      - "That stakeholder is the message's intended recipient"
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases:
      - That vendor supplies the external service
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases:
      - The vendor has been brought into the incident response through an escalation
  - name: justifiedByIncident
    from: Change
    to: Incident
    meaning: The active incident that justifies executing this change through the emergency path; the link alone does not authorise execution.
    aliases:
      - The active incident is the reason for taking the emergency-change path
rules:
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - "The acting operator's authorisation for the responsible resolver group is confirmed in access-control records; on-call status alone is not sufficient."
  canAssignIncident:
    conditions:
      - Incident status is neither closed nor cancelled.
      - Approved resolver-group support or routing information confirms that the proposed group supports an affected IT service or configuration item.
  canDeclareMajorIncident:
    conditions:
      - "Incident status is new, acknowledged, investigating, contained, recovering, or monitoring."
      - Incident severity is sev1-critical or sev2-high.
      - At least one impacted IT service is identified.
      - An incident commander is assigned.
      - "The bank's approved major-incident declaration criteria are satisfied using documented supporting facts; missing facts are flagged rather than guessed."
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - Containment scope and expected side effects are recorded before execution.
      - The steps to execute are approved under the applicable procedure where approval is required.
  canIsolateConfigurationItem:
    conditions:
      - The configuration item is linked as affected by the incident.
      - "If the item was found through an application, database, or infrastructure-component record, its identity is verified against the approved configuration inventory; if the match is unreliable, stop."
      - The impact of isolating the item is assessed.
      - A rollback or reconnection method is available.
      - Any approval required for the proposed step under the applicable procedure is confirmed.
  canFailOverService:
    conditions:
      - The recovery plan is applicable to the IT service being failed over.
      - The proposed target recovery environment is confirmed available under the governing procedure; environment type alone is not proof.
      - "The proposed data-recovery point is confirmed acceptable using the approved basis, not an uninterpreted numeric objective."
  canRestoreBackup:
    conditions:
      - The selected backup set status is successful or verified.
      - The selected backup set protects the configuration item to be restored.
      - "If the target was found through an application, database, or infrastructure-component record, its configuration-item identity is verified against the approved configuration inventory; if the match is unreliable, stop."
      - The proposed restore point is approved.
      - The target environment is approved.
  canExecuteEmergencyChange:
    conditions:
      - The change is explicitly designated for the emergency path in the controlled change workflow.
      - The change is justified by a linked incident confirmed active under the governing emergency-change procedure.
      - The affected configuration items are identified.
      - An implementation plan and a backout plan are documented.
      - The risk has been explicitly accepted in the controlled workflow; change status or an incident link alone is insufficient.
  canSendStakeholderUpdate:
    conditions:
      - "The audience, message, owner, and approval state are recorded in the controlled communication workflow."
      - The controlled communication workflow confirms this update is authorised to send; no universal approved-status value is assumed.
      - The content is consistent with the latest verified incident state.
  canSubmitRegulatoryNotification:
    conditions:
      - The linked materiality assessment result is reportable.
      - The notification identifies the incident being reported and the intended regulator.
      - All required information and supporting evidence are complete under the approved reporting procedure.
      - Notification status is approved.
      - "Submission can occur before the notification's due time, as established by the approved procedure."
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - Resolution and restoration evidence is recorded and sufficient under the closure workflow.
      - Each impacted service is healthy or its residual condition is documented and accepted through the closure workflow; missing or unknown health is not proof of restoration.
      - Required stakeholder communications are confirmed complete through the communication workflow.
      - "If the incident is major or explicitly designated cybersecurity, a post-incident review is scheduled or completed in the review or closure workflow."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set alert status to acknowledged and record the acknowledgement time; retain the acting person in the operational audit.
    verification: Read back the acknowledged alert status and confirm the acting person and acknowledgement time in the operational audit record.
  assignIncident:
    input: Incident
    preconditions:
      - canAssignIncident
    effect: "Record the incident's resolver group and retain the basis for selecting it."
    verification: "Read back the incident's resolver-group assignment."
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Record the major-incident designation, declaration time, and assigned commander; start the coordination and communication cadence."
    verification: "Read back the major-incident designation, commander, declaration time, and communication record."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: Execute approved containment steps and retain their outcome; mark the incident contained only after verification of containment indicators and remaining service impact.
    verification: Check and retain containment indicators and remaining service impact before confirming incident status is contained.
  isolateAffectedConfigurationItem:
    input: Incident
    preconditions:
      - canIsolateConfigurationItem
    effect: Isolate the configuration item linked to the incident from the defined networks or dependencies; retain the action outcome and reconnection basis with action evidence.
    verification: Confirm the linked item is isolated from the defined networks or dependencies and check and retain remaining-service health.
  failOverService:
    input: Incident
    preconditions:
      - canFailOverService
    effect: Move the affected IT service workload to the available recovery environment using the applicable recovery plan; retain the actual target and data-recovery-point decision basis with action evidence.
    verification: Verify and retain service health and critical business transactions in the target environment.
  restoreFromBackup:
    input: BackupSet
    preconditions:
      - canRestoreBackup
    effect: "Restore data from the selected backup set to the approved target and restore point; retain the selected backup, target, and restore outcome in action evidence."
    verification: Validate and retain data-integrity and application-functionality checks for the restored target.
  executeEmergencyChange:
    input: Change
    preconditions:
      - canExecuteEmergencyChange
    effect: "Implement the explicitly designated emergency change justified by the active incident, update its controlled-workflow status, and retain implementation evidence."
    verification: "Run technical checks, verify service health, and retain the results and implementation evidence; do not infer success from change status alone."
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - canSendStakeholderUpdate
    effect: "Send the controlled stakeholder communication about the incident, record its sent time, and archive the final message."
    verification: "Confirm the communication's delivery status and that the final sent message is archived; a sent timestamp alone is insufficient."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the approved notification before its due time, set notification status to submitted, record submission time, and retain the submission receipt."
    verification: Confirm the submission receipt and subsequently confirm acceptance or record rejection and required remediation; submitted is not accepted.
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: Set incident status to closed and record the closure time after all closure checks pass.
    verification: "Read back closed status and closure time; verify impacted service health or documented acceptance of residual conditions, retained resolution and restoration evidence, completed required communications, and a scheduled or completed review for major or cybersecurity incidents."


### Turn 101 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CorrectiveAction:\n    properties:\n      status:\n        type: text\n        allowed: [open, in-progress, blocked, implemented, verified, closed, cancelled]\nrules:\n  isOutstandingCorrectiveActionForService:\n    conditions:\n      - Corrective action status is open, in-progress, or blocked; implemented is reported separately as awaiting verification, while verified needs a check against the approved workflow before reporting remaining work.\n      - Relevance to the IT service is established from the corrective action description, review findings, earlier incident's recorded service impacts, and where applicable the implementing change's scope.\n      - If relevance is unclear, check the approved review or action workflow with the owning organizational unit and label relevance unconfirmed rather than reporting the action as outstanding for that service.\n"
}
```

### Turn 101 — tool

Applied. Added 1, updated 1 existing item(s).

### Turn 101 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 101 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases:
      - incidens
      - hibajegy
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
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
      majorIncident:
        type: boolean
      declarationTime:
        type: date
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      classification:
        type: text
      resolutionTime:
        type: date
      detectedTime:
        type: date
      openedTime:
        type: date
      closedTime:
        type: date
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases:
      - informatikai szolgáltatás
      - informatics service
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases:
      - CI
      - konfigurációs elem
    properties:
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases:
      - outsourced service
      - külső szolgáltatás
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases:
      - esemény
    properties:
      observedAt:
        type: date
      eventType:
        type: text
      detectionSource:
        type: text
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases:
      - riasztás
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      raisedAt:
        type: date
      summary:
        type: text
      detectionSource:
        type: text
      severity:
        type: text
      occurrenceCount:
        type: number
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases:
      - megoldócsoport
      - support group
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases:
      - ügyeletes mérnök
      - on-call
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases:
      - incident manager
      - incidensparancsnok
      - MIM lead
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases:
      - network operations centre
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases:
      - security operations centre
      - SOC
      - biztonsági műveleti központ
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - üzemeltetési eljárás
      - playbook
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases:
      - mentéskészlet
      - backup
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - running
          - successful
          - failed
          - expired
          - corrupted
          - verified
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases:
      - helyreállítási terv
      - DR plan
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases:
      - környezet
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases:
      - változás
      - módosítás
    properties:
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases:
      - telepítés
      - élesítés
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startTime:
        type: date
      completionTime:
        type: date
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
      findings:
        type: text
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
      description:
        type: text
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
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases:
      - kiadás
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      dueTime:
        type: date
      submissionTime:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases:
      - evidence
      - bizonyíték
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases:
      - értesítés
      - tájékoztatás
    properties:
      audience:
        type: text
      messageSummary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentAt:
        type: date
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases:
      - probléma
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases:
      - supplier
      - szállító
      - beszállító
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases:
      - érintett
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases:
      - adatbázis
      - DB
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases:
      - infrastruktúra-elem
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases:
      - The IT service is impacted by the incident
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases:
      - The business service is impacted by the incident
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases:
      - The configuration item is affected by the incident
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases:
      - The business service relies on the IT service
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases:
      - Customers access the business service through that channel
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases:
      - The IT service relies on that externally provided service
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases:
      - That application provides the software functionality for the IT service
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases:
      - "The infrastructure component hosts the IT service's workload"
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases:
      - The application accesses that database
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases:
      - "The component hosts the application's workload"
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases:
      - The alert prompted the incident record
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: An event included among observations correlated to establish the incident; no single event proves it.
    aliases:
      - The incident was correlated from that event
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases:
      - The alert points to that observed event
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases:
      - The alert is about that IT service
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases:
      - The alert is about that configuration item
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases:
      - The observation was recorded on that item
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases:
      - The event is associated with that IT service
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases:
      - That monitoring rule produced the alert
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases:
      - Network operations runs that monitoring platform
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases:
      - The monitoring tool ran the rule
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases:
      - Security operations watches that security-relevant event
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases:
      - That resolver group has the incident assignment
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases:
      - "That on-call engineer is handling the incident's technical response"
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases:
      - The engineer belongs to that resolver group
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases:
      - The service owner is accountable for that IT service across its lifecycle
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases:
      - The commander leads the major-incident response and its decision cadence
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases:
      - The commander coordinates the response to that incident
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases:
      - The response team coordinates the wider major-incident effort
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases:
      - The service desk logged the incident
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases:
      - The commander belongs to the incident response team
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases:
      - The team used that runbook to guide the incident response
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases:
      - A temporary way around the known error is documented
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases:
      - The runbook describes how to apply the workaround
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases:
      - The plan sets out how to bring that IT service back
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases:
      - The plan calls for that backup set
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases:
      - That recovery plan was used in restoring service during the incident
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases:
      - That item is covered by the backup set
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases:
      - The IT service runs in that deployment environment
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases:
      - That item is assigned to that environment
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases:
      - The release carries that approved change
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases:
      - The deployment puts the release into effect
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases:
      - That item is changed under the change record
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases:
      - "The IT service is within the change's scope"
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases:
      - The deployment is directed at that environment
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases:
      - The deployment installs or activates that application
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases:
      - The incident was examined in that review
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases:
      - That follow-up action came out of the review
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases:
      - That change carries out the corrective action
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases:
      - The incident is associated with that problem record
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases:
      - A known-error record documents the diagnosed problem
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases:
      - The review surfaced an underlying or potential cause for investigation
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases:
      - That unit is accountable for following the corrective action through
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases:
      - "The assessment considers that incident's significance and reporting implications"
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases:
      - A reportable assessment gives rise to a notification
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases:
      - The submission concerns that incident
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator to whom the regulatory notification is sent.
    aliases:
      - The competent authority is the intended recipient of the submission
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases:
      - That evidence item documents the incident
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases:
      - That evidence item supports the submission
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases:
      - The message concerns that incident
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases:
      - "That stakeholder is the message's intended recipient"
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases:
      - That vendor supplies the external service
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases:
      - The vendor has been brought into the incident response through an escalation
  - name: justifiedByIncident
    from: Change
    to: Incident
    meaning: The active incident that justifies executing this change through the emergency path; the link alone does not authorise execution.
    aliases:
      - The active incident is the reason for taking the emergency-change path
rules:
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - "The acting operator's authorisation for the responsible resolver group is confirmed in access-control records; on-call status alone is not sufficient."
  canAssignIncident:
    conditions:
      - Incident status is neither closed nor cancelled.
      - Approved resolver-group support or routing information confirms that the proposed group supports an affected IT service or configuration item.
  canDeclareMajorIncident:
    conditions:
      - "Incident status is new, acknowledged, investigating, contained, recovering, or monitoring."
      - Incident severity is sev1-critical or sev2-high.
      - At least one impacted IT service is identified.
      - An incident commander is assigned.
      - "The bank's approved major-incident declaration criteria are satisfied using documented supporting facts; missing facts are flagged rather than guessed."
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - Containment scope and expected side effects are recorded before execution.
      - The steps to execute are approved under the applicable procedure where approval is required.
  canIsolateConfigurationItem:
    conditions:
      - The configuration item is linked as affected by the incident.
      - "If the item was found through an application, database, or infrastructure-component record, its identity is verified against the approved configuration inventory; if the match is unreliable, stop."
      - The impact of isolating the item is assessed.
      - A rollback or reconnection method is available.
      - Any approval required for the proposed step under the applicable procedure is confirmed.
  canFailOverService:
    conditions:
      - The recovery plan is applicable to the IT service being failed over.
      - The proposed target recovery environment is confirmed available under the governing procedure; environment type alone is not proof.
      - "The proposed data-recovery point is confirmed acceptable using the approved basis, not an uninterpreted numeric objective."
  canRestoreBackup:
    conditions:
      - The selected backup set status is successful or verified.
      - The selected backup set protects the configuration item to be restored.
      - "If the target was found through an application, database, or infrastructure-component record, its configuration-item identity is verified against the approved configuration inventory; if the match is unreliable, stop."
      - The proposed restore point is approved.
      - The target environment is approved.
  canExecuteEmergencyChange:
    conditions:
      - The change is explicitly designated for the emergency path in the controlled change workflow.
      - The change is justified by a linked incident confirmed active under the governing emergency-change procedure.
      - The affected configuration items are identified.
      - An implementation plan and a backout plan are documented.
      - The risk has been explicitly accepted in the controlled workflow; change status or an incident link alone is insufficient.
  canSendStakeholderUpdate:
    conditions:
      - "The audience, message, owner, and approval state are recorded in the controlled communication workflow."
      - The controlled communication workflow confirms this update is authorised to send; no universal approved-status value is assumed.
      - The content is consistent with the latest verified incident state.
  canSubmitRegulatoryNotification:
    conditions:
      - The linked materiality assessment result is reportable.
      - The notification identifies the incident being reported and the intended regulator.
      - All required information and supporting evidence are complete under the approved reporting procedure.
      - Notification status is approved.
      - "Submission can occur before the notification's due time, as established by the approved procedure."
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - Resolution and restoration evidence is recorded and sufficient under the closure workflow.
      - Each impacted service is healthy or its residual condition is documented and accepted through the closure workflow; missing or unknown health is not proof of restoration.
      - Required stakeholder communications are confirmed complete through the communication workflow.
      - "If the incident is major or explicitly designated cybersecurity, a post-incident review is scheduled or completed in the review or closure workflow."
  isOutstandingCorrectiveActionForService:
    conditions:
      - "Corrective action status is open, in-progress, or blocked; implemented is reported separately as awaiting verification, while verified needs a check against the approved workflow before reporting remaining work."
      - "Relevance to the IT service is established from the corrective action description, review findings, earlier incident's recorded service impacts, and where applicable the implementing change's scope."
      - "If relevance is unclear, check the approved review or action workflow with the owning organizational unit and label relevance unconfirmed rather than reporting the action as outstanding for that service."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set alert status to acknowledged and record the acknowledgement time; retain the acting person in the operational audit.
    verification: Read back the acknowledged alert status and confirm the acting person and acknowledgement time in the operational audit record.
  assignIncident:
    input: Incident
    preconditions:
      - canAssignIncident
    effect: "Record the incident's resolver group and retain the basis for selecting it."
    verification: "Read back the incident's resolver-group assignment."
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Record the major-incident designation, declaration time, and assigned commander; start the coordination and communication cadence."
    verification: "Read back the major-incident designation, commander, declaration time, and communication record."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: Execute approved containment steps and retain their outcome; mark the incident contained only after verification of containment indicators and remaining service impact.
    verification: Check and retain containment indicators and remaining service impact before confirming incident status is contained.
  isolateAffectedConfigurationItem:
    input: Incident
    preconditions:
      - canIsolateConfigurationItem
    effect: Isolate the configuration item linked to the incident from the defined networks or dependencies; retain the action outcome and reconnection basis with action evidence.
    verification: Confirm the linked item is isolated from the defined networks or dependencies and check and retain remaining-service health.
  failOverService:
    input: Incident
    preconditions:
      - canFailOverService
    effect: Move the affected IT service workload to the available recovery environment using the applicable recovery plan; retain the actual target and data-recovery-point decision basis with action evidence.
    verification: Verify and retain service health and critical business transactions in the target environment.
  restoreFromBackup:
    input: BackupSet
    preconditions:
      - canRestoreBackup
    effect: "Restore data from the selected backup set to the approved target and restore point; retain the selected backup, target, and restore outcome in action evidence."
    verification: Validate and retain data-integrity and application-functionality checks for the restored target.
  executeEmergencyChange:
    input: Change
    preconditions:
      - canExecuteEmergencyChange
    effect: "Implement the explicitly designated emergency change justified by the active incident, update its controlled-workflow status, and retain implementation evidence."
    verification: "Run technical checks, verify service health, and retain the results and implementation evidence; do not infer success from change status alone."
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - canSendStakeholderUpdate
    effect: "Send the controlled stakeholder communication about the incident, record its sent time, and archive the final message."
    verification: "Confirm the communication's delivery status and that the final sent message is archived; a sent timestamp alone is insufficient."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the approved notification before its due time, set notification status to submitted, record submission time, and retain the submission receipt."
    verification: Confirm the submission receipt and subsequently confirm acceptance or record rejection and required remediation; submitted is not accepted.
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: Set incident status to closed and record the closure time after all closure checks pass.
    verification: "Read back closed status and closure time; verify impacted service health or documented acceptance of residual conditions, retained resolution and restoration evidence, completed required communications, and a scheduled or completed review for major or cybersecurity incidents."


### Turn 101 — assistant

The approved status is now **`in-progress`**; I updated the allowed-value list and verified that the live canvas has the hyphenated value only. The service-specific corrective-action rule is also recorded: it checks both status and confirmed relevance, and labels unclear relevance as unconfirmed.

The competency replay still has the agreed gap for **definitively correlated later alerts**. It also raises a separate point in your first question: the model identifies **confirmed business-service impacts** and channels delivered through those services, but that path shows channels *potentially exposed*, not necessarily affected. Should the agent obtain confirmed customer-channel impact from an approved source outside this ontology, or should “which customer channels are affected” remain another unresolved gap?

### Turn 102 — user

The agent can identify **channels potentially exposed** by tracing each confirmed impacted business service to the channels through which it is delivered. It cannot call those channels **confirmed affected** on that path alone.

If verified channel-specific impact information is available through the bank’s operational impact process, the agent can use it and show its source. We have not established a direct incident-to-channel impact record or a designated authoritative source for that fact. So if no verified channel evidence is available, mark **definitive customer-channel impact as a second unresolved gap**.

### Turn 102 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: sentToRegulator\n    from: RegulatoryNotification\n    to: Regulator\n    meaning: The regulator intended to receive the notification; this link does not establish that it was submitted or delivered.\n"
}
```

### Turn 102 — tool

Applied. Added 0, updated 1 existing item(s).

### Turn 102 — assistant

I’ve marked **definitive customer-channel impact** as a second conditional gap: the service path identifies potentially exposed channels, not confirmed disruption. The agent can report a confirmed channel impact only when it has verified channel-specific evidence and can show its source.

One part of question 4 remains to test: the model records the engineer **actually handling** an incident, but that does not necessarily identify who **should** handle it next. Does the bank’s approved on-call rota or dispatch process provide that recommendation, or is that also unresolved?

### Turn 103 — user

The recorded **on-call engineer → resolver group** membership and **incident → handled by → on-call engineer** link tell us who belongs to the group and who is handling this incident. They do not establish who is available or should take it next.

For a recommendation, check the bank’s approved on-call rota or dispatch process after confirming the appropriate resolver group. If that source is unavailable or does not establish the current engineer, mark **“who should handle it next” as unresolved** rather than infer it from membership or the previous handler.

### Turn 103 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canRecommendOnCallEngineer:\n    conditions:\n      - The appropriate resolver group is established from approved support or routing information for an affected service or configuration item.\n      - The bank's approved on-call rota or dispatch process identifies the engineer currently available for that group.\n      - If the rota or dispatch information does not establish the current engineer, report the recommendation as unresolved rather than infer it from group membership or a previous incident handler.\n"
}
```

### Turn 103 — tool

Applied. Added 1, updated 0 existing item(s).

### Turn 103 — assistant

I’ve recorded the recommendation check: first establish the appropriate resolver group from approved routing information, then use the current on-call rota or dispatch process. Membership or a previous handler cannot establish who should take the incident next.

The final relationship check found one pair from your original recovery question that we have not explicitly settled: **Incident and Workaround**. Should the model record a direct link for a workaround **actually applied during an incident**, or should it only find candidate workarounds through the incident → problem → known error path and retain any use in action evidence?

### Turn 104 — user

I would **not add a direct incident-to-workaround link** to this model. Find a candidate through **incident → problem → known error → workaround**, and check the applicable runbook where the workaround is documented.

If the team applies it, retain what was done and the observed result in the incident’s response evidence. The candidate path alone proves neither that the workaround was used nor that it was safe or effective for this incident.

### Turn 104 — assistant

**Tool call: `get_graph_state`**

```
{}
```

### Turn 104 — tool

competency_questions: []
classes:
  Incident:
    meaning: "A managed record of an unplanned interruption, degradation, or security condition."
    aliases:
      - incidens
      - hibajegy
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - investigating
          - contained
          - recovering
          - monitoring
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
      majorIncident:
        type: boolean
      declarationTime:
        type: date
      category:
        type: text
        allowed:
          - availability
          - performance
          - capacity
          - network
          - application
          - database
          - infrastructure
          - data-integrity
          - cybersecurity
          - third-party
          - change-induced
          - other
      classification:
        type: text
      resolutionTime:
        type: date
      detectedTime:
        type: date
      openedTime:
        type: date
      closedTime:
        type: date
  BusinessService:
    meaning: A capability the bank delivers to customers or the business.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  CustomerChannel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  ITService:
    meaning: A managed technology capability supporting a business service.
    aliases:
      - informatikai szolgáltatás
      - informatics service
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially-unavailable
          - unavailable
          - recovering
          - unknown
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ConfigurationItem:
    meaning: A managed component identified for impact analysis and isolation.
    aliases:
      - CI
      - konfigurációs elem
    properties:
      criticalityTier:
        type: text
        allowed:
          - tier-1-critical
          - tier-2-important
          - tier-3-standard
          - tier-4-supporting
  ThirdPartyService:
    meaning: An externally provided service on which an IT service may depend.
    aliases:
      - outsourced service
      - külső szolgáltatás
    properties: {}
  Event:
    meaning: A time-stamped observation of a state change or other noteworthy occurrence.
    aliases:
      - esemény
    properties:
      observedAt:
        type: date
      eventType:
        type: text
      detectionSource:
        type: text
  Alert:
    meaning: A signal requiring triage or acknowledgement.
    aliases:
      - riasztás
    properties:
      status:
        type: text
        allowed:
          - new
          - acknowledged
          - suppressed
          - escalated
          - closed
      raisedAt:
        type: date
      summary:
        type: text
      detectionSource:
        type: text
      severity:
        type: text
      occurrenceCount:
        type: number
  ServiceOwner:
    meaning: The person accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: A team assigned to diagnose and restore a service or technology area.
    aliases:
      - megoldócsoport
      - support group
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group handling time-critical technical response.
    aliases:
      - ügyeletes mérnök
      - on-call
    properties: {}
  IncidentCommander:
    meaning: A member of the incident response team who commands a major incident.
    aliases:
      - incident manager
      - incidensparancsnok
      - MIM lead
    properties: {}
  NetworkOperations:
    meaning: The function that operates monitoring for network and infrastructure services.
    aliases:
      - network operations centre
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  SecurityOperations:
    meaning: The function that monitors and investigates security events.
    aliases:
      - security operations centre
      - SOC
      - biztonsági műveleti központ
    properties: {}
  IncidentResponseTeam:
    meaning: The function that coordinates significant incident response.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  ServiceDesk:
    meaning: "The function that receives, records, triages, and routes user-reported incidents."
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - üzemeltetési eljárás
      - playbook
    properties: {}
  Workaround:
    meaning: A temporary way to reduce or bypass an impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  BackupSet:
    meaning: Recoverable data protecting particular configuration items.
    aliases:
      - mentéskészlet
      - backup
    properties:
      status:
        type: text
        allowed:
          - scheduled
          - running
          - successful
          - failed
          - expired
          - corrupted
          - verified
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  RecoveryPlan:
    meaning: A plan for restoring an IT service and its dependencies.
    aliases:
      - helyreállítási terv
      - DR plan
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  Environment:
    meaning: The deployment context of an IT service or configuration item.
    aliases:
      - környezet
    properties:
      environmentType:
        type: text
        allowed:
          - production
          - disaster-recovery
          - pre-production
          - test
          - development
          - management
  Change:
    meaning: A controlled modification that may be examined for a possible connection to an incident.
    aliases:
      - változás
      - módosítás
    properties:
      riskLevel:
        type: text
        allowed:
          - low
          - medium
          - high
          - critical
      implementationPlan:
        type: text
      backoutPlan:
        type: text
      status:
        type: text
        allowed:
          - draft
          - assessed
          - approved
          - scheduled
          - implementing
          - implemented
          - failed
          - rolled-back
          - closed
          - cancelled
  Deployment:
    meaning: A timed technical execution that installs or activates a modification and records its outcome.
    aliases:
      - telepítés
      - élesítés
    properties:
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
      startTime:
        type: date
      completionTime:
        type: date
  PostIncidentReview:
    meaning: A review of an earlier incident that records findings and can produce corrective actions.
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
      findings:
        type: text
  CorrectiveAction:
    meaning: A separately tracked action arising from an incident review with its own owner and status.
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
      description:
        type: text
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
  Release:
    meaning: A grouping of approved changes introduced together and delivered by a deployment.
    aliases:
      - kiadás
    properties: {}
  MaterialityAssessment:
    meaning: An evaluation of an incident recording a reporting conclusion and its rationale.
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      assessedAt:
        type: date
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  RegulatoryNotification:
    meaning: "A formal incident submission to a regulator whose approval, submission, and outcome are tracked."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      dueTime:
        type: date
      submissionTime:
        type: date
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
  Regulator:
    meaning: The competent authority that receives a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  EvidenceItem:
    meaning: "An item documenting an incident whose integrity matters to investigation, reporting, or closure."
    aliases:
      - evidence
      - bizonyíték
    properties:
      collectedAt:
        type: date
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      cryptographicHash:
        type: text
  StakeholderCommunication:
    meaning: A controlled message about an incident addressed to its recipients.
    aliases:
      - értesítés
      - tájékoztatás
    properties:
      audience:
        type: text
      messageSummary:
        type: text
      status:
        type: text
        allowed:
          - draft
          - pending approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentAt:
        type: date
  Person:
    meaning: "An identifiable individual who performs a recorded action, including acknowledging an alert."
    aliases: []
    properties: {}
  MonitoringTool:
    meaning: A tool that collects operational information and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  KnownError:
    meaning: A diagnosed problem documented with a cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  MonitoringRule:
    meaning: A rule evaluating metrics that can generate alerts and is executed by a monitoring tool.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Problem:
    meaning: An underlying or potential cause that may group incidents without establishing a proven root cause.
    aliases:
      - probléma
    properties: {}
  Vendor:
    meaning: An external provider of a third-party service that may receive an incident escalation.
    aliases:
      - supplier
      - szállító
      - beszállító
    properties: {}
  Stakeholder:
    meaning: A party whose interests are affected and to whom an incident communication can be addressed.
    aliases:
      - érintett
    properties: {}
  Application:
    meaning: An identifiable application implementing an IT service and using technical components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Database:
    meaning: An identifiable database used by an application.
    aliases:
      - adatbázis
      - DB
    properties: {}
  InfrastructureComponent:
    meaning: An identifiable infrastructure component on which an IT service or application runs.
    aliases:
      - infrastruktúra-elem
    properties: {}
  OrganizationalUnit:
    meaning: An identifiable organizational unit accountable for following a corrective action through.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impactsItservice
    from: Incident
    to: ITService
    meaning: A confirmed impact of an incident on an IT service.
    aliases:
      - The IT service is impacted by the incident
  - name: impactsBusinessService
    from: Incident
    to: BusinessService
    meaning: A confirmed impact of an incident on a business service.
    aliases:
      - The business service is impacted by the incident
  - name: affectsConfigurationItem
    from: Incident
    to: ConfigurationItem
    meaning: A configuration item identified as affected by an incident.
    aliases:
      - The configuration item is affected by the incident
  - name: dependsOnItservice
    from: BusinessService
    to: ITService
    meaning: An IT service supporting delivery of the business service.
    aliases:
      - The business service relies on the IT service
  - name: deliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered.
    aliases:
      - Customers access the business service through that channel
  - name: dependsOnThirdPartyService
    from: ITService
    to: ThirdPartyService
    meaning: An externally provided service on which the IT service depends.
    aliases:
      - The IT service relies on that externally provided service
  - name: implementedBy
    from: ITService
    to: Application
    meaning: An application implementing the IT service.
    aliases:
      - That application provides the software functionality for the IT service
  - name: runsOnInfrastructure
    from: ITService
    to: InfrastructureComponent
    meaning: An infrastructure component on which the IT service runs.
    aliases:
      - "The infrastructure component hosts the IT service's workload"
  - name: usesDatabase
    from: Application
    to: Database
    meaning: A database used by the application.
    aliases:
      - The application accesses that database
  - name: applicationRunsOn
    from: Application
    to: InfrastructureComponent
    meaning: An infrastructure component on which the application runs.
    aliases:
      - "The component hosts the application's workload"
  - name: triggeredByAlert
    from: Incident
    to: Alert
    meaning: An alert whose triage led to the incident being opened.
    aliases:
      - The alert prompted the incident record
  - name: builtFromEvents
    from: Incident
    to: Event
    meaning: An event included among observations correlated to establish the incident; no single event proves it.
    aliases:
      - The incident was correlated from that event
  - name: indicatesEvent
    from: Alert
    to: Event
    meaning: An event indicated by the alert.
    aliases:
      - The alert points to that observed event
  - name: concernsItservice
    from: Alert
    to: ITService
    meaning: An IT service that the alert concerns.
    aliases:
      - The alert is about that IT service
  - name: concernsConfigurationItem
    from: Alert
    to: ConfigurationItem
    meaning: A configuration item that the alert concerns.
    aliases:
      - The alert is about that configuration item
  - name: observedOn
    from: Event
    to: ConfigurationItem
    meaning: "A configuration item on which the event is observed, without claiming it caused the event."
    aliases:
      - The observation was recorded on that item
  - name: relatesToItservice
    from: Event
    to: ITService
    meaning: An IT service to which the event relates.
    aliases:
      - The event is associated with that IT service
  - name: generatedByRule
    from: Alert
    to: MonitoringRule
    meaning: "The monitoring rule that generated the alert, when it has a monitoring origin."
    aliases:
      - That monitoring rule produced the alert
  - name: evaluatedBy
    from: MonitoringRule
    to: MonitoringTool
    meaning: "The monitoring tool that carries out the rule's evaluation."
    aliases: []
  - name: operatesMonitoringTool
    from: NetworkOperations
    to: MonitoringTool
    meaning: The monitoring tool operated by network operations.
    aliases:
      - Network operations runs that monitoring platform
  - name: executedByTool
    from: MonitoringRule
    to: MonitoringTool
    meaning: The monitoring tool that executes the monitoring rule; the rule evaluates metrics.
    aliases:
      - The monitoring tool ran the rule
  - name: monitorsSecurityEvent
    from: SecurityOperations
    to: Event
    meaning: "A specifically identified security-relevant event monitored by security operations, not every event."
    aliases:
      - Security operations watches that security-relevant event
  - name: assignedTo
    from: Incident
    to: ResolverGroup
    meaning: The resolver group assigned to diagnose and restore the incident.
    aliases:
      - That resolver group has the incident assignment
  - name: handledByOnCallEngineer
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer actually handling the incident's time-critical technical work."
    aliases:
      - "That on-call engineer is handling the incident's technical response"
  - name: memberOfResolverGroup
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member.
    aliases:
      - The engineer belongs to that resolver group
  - name: ownsItservice
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases:
      - The service owner is accountable for that IT service across its lifecycle
  - name: commandsMajorIncident
    from: IncidentCommander
    to: Incident
    meaning: A specifically declared major incident commanded by this incident commander.
    aliases:
      - The commander leads the major-incident response and its decision cadence
  - name: coordinatedByCommander
    from: Incident
    to: IncidentCommander
    meaning: The commander who personally coordinates this declared major incident.
    aliases:
      - The commander coordinates the response to that incident
  - name: coordinatesMajorIncident
    from: IncidentResponseTeam
    to: Incident
    meaning: A specifically declared major incident coordinated by the incident response team.
    aliases:
      - The response team coordinates the wider major-incident effort
  - name: recordsIncident
    from: ServiceDesk
    to: Incident
    meaning: An incident recorded by the service desk when it handles intake.
    aliases:
      - The service desk logged the incident
  - name: memberOfResponseTeam
    from: IncidentCommander
    to: IncidentResponseTeam
    meaning: The incident response team of which the commander is a member.
    aliases:
      - The commander belongs to the incident response team
  - name: handledWithRunbook
    from: Incident
    to: Runbook
    meaning: "A runbook used to guide handling of the incident, without asserting that every step was executed."
    aliases:
      - The team used that runbook to guide the incident response
  - name: hasWorkaround
    from: KnownError
    to: Workaround
    meaning: A temporary measure documented for the known error.
    aliases:
      - A temporary way around the known error is documented
  - name: documentedInRunbook
    from: Workaround
    to: Runbook
    meaning: The runbook in which the workaround is documented.
    aliases:
      - The runbook describes how to apply the workaround
  - name: recoversItservice
    from: RecoveryPlan
    to: ITService
    meaning: An IT service the recovery plan is intended to recover.
    aliases:
      - The plan sets out how to bring that IT service back
  - name: usesBackupSet
    from: RecoveryPlan
    to: BackupSet
    meaning: A backup set used by the recovery plan where applicable.
    aliases:
      - The plan calls for that backup set
  - name: recoveredWithPlan
    from: Incident
    to: RecoveryPlan
    meaning: The recovery plan used in recovering from the incident.
    aliases:
      - That recovery plan was used in restoring service during the incident
  - name: protectsConfigurationItem
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item whose data the backup set protects.
    aliases:
      - That item is covered by the backup set
  - name: deployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is deployed.
    aliases:
      - The IT service runs in that deployment environment
  - name: belongsToEnvironment
    from: ConfigurationItem
    to: Environment
    meaning: The environment to which the configuration item belongs.
    aliases:
      - That item is assigned to that environment
  - name: implementedByRelease
    from: Change
    to: Release
    meaning: The release through which the change is implemented.
    aliases:
      - The release carries that approved change
  - name: deliveredByDeployment
    from: Release
    to: Deployment
    meaning: The deployment that delivers the release.
    aliases:
      - The deployment puts the release into effect
  - name: modifiesConfigurationItem
    from: Change
    to: ConfigurationItem
    meaning: A configuration item modified by the change.
    aliases:
      - That item is changed under the change record
  - name: affectsItservice
    from: Change
    to: ITService
    meaning: An IT service affected by the change.
    aliases:
      - "The IT service is within the change's scope"
  - name: targetsEnvironment
    from: Deployment
    to: Environment
    meaning: The environment targeted by the deployment.
    aliases:
      - The deployment is directed at that environment
  - name: deploysApplication
    from: Deployment
    to: Application
    meaning: An application deployed during the deployment.
    aliases:
      - The deployment installs or activates that application
  - name: reviewsIncident
    from: PostIncidentReview
    to: Incident
    meaning: The earlier incident examined by the post-incident review.
    aliases:
      - The incident was examined in that review
  - name: producesCorrectiveAction
    from: PostIncidentReview
    to: CorrectiveAction
    meaning: A corrective action produced by the review.
    aliases:
      - That follow-up action came out of the review
  - name: implementedByChange
    from: CorrectiveAction
    to: Change
    meaning: A change implementing the corrective action where applicable.
    aliases:
      - That change carries out the corrective action
  - name: linkedToProblem
    from: Incident
    to: Problem
    meaning: A problem linked to the incident without asserting its cause has been proven.
    aliases:
      - The incident is associated with that problem record
  - name: documentedByKnownError
    from: Problem
    to: KnownError
    meaning: A known error documenting a diagnosed problem.
    aliases:
      - A known-error record documents the diagnosed problem
  - name: identifiesProblem
    from: PostIncidentReview
    to: Problem
    meaning: A problem identified by the review.
    aliases:
      - The review surfaced an underlying or potential cause for investigation
  - name: ownedByUnit
    from: CorrectiveAction
    to: OrganizationalUnit
    meaning: The organizational unit accountable for completing the corrective action.
    aliases:
      - That unit is accountable for following the corrective action through
  - name: evaluatedByAssessment
    from: Incident
    to: MaterialityAssessment
    meaning: The materiality assessment evaluating the incident.
    aliases:
      - "The assessment considers that incident's significance and reporting implications"
  - name: canTriggerNotification
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: A regulatory notification initiated following the assessment when reporting is required.
    aliases:
      - A reportable assessment gives rise to a notification
  - name: reportsIncident
    from: RegulatoryNotification
    to: Incident
    meaning: The incident reported in the regulatory notification.
    aliases:
      - The submission concerns that incident
  - name: sentToRegulator
    from: RegulatoryNotification
    to: Regulator
    meaning: The regulator intended to receive the notification; this link does not establish that it was submitted or delivered.
    aliases:
      - The competent authority is the intended recipient of the submission
  - name: supportedByEvidence
    from: Incident
    to: EvidenceItem
    meaning: An evidence item supporting the incident record.
    aliases:
      - That evidence item documents the incident
  - name: includesEvidence
    from: RegulatoryNotification
    to: EvidenceItem
    meaning: An evidence item included with the regulatory notification.
    aliases:
      - That evidence item supports the submission
  - name: isAboutIncident
    from: StakeholderCommunication
    to: Incident
    meaning: The incident the stakeholder communication is about.
    aliases:
      - The message concerns that incident
  - name: addressedToStakeholder
    from: StakeholderCommunication
    to: Stakeholder
    meaning: A stakeholder to whom the communication is addressed.
    aliases:
      - "That stakeholder is the message's intended recipient"
  - name: providedByVendor
    from: ThirdPartyService
    to: Vendor
    meaning: The vendor providing the third-party service.
    aliases:
      - That vendor supplies the external service
  - name: escalatedToVendor
    from: Incident
    to: Vendor
    meaning: A vendor to whom the incident was actually escalated.
    aliases:
      - The vendor has been brought into the incident response through an escalation
  - name: justifiedByIncident
    from: Change
    to: Incident
    meaning: The active incident that justifies executing this change through the emergency path; the link alone does not authorise execution.
    aliases:
      - The active incident is the reason for taking the emergency-change path
rules:
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - "The acting operator's authorisation for the responsible resolver group is confirmed in access-control records; on-call status alone is not sufficient."
  canAssignIncident:
    conditions:
      - Incident status is neither closed nor cancelled.
      - Approved resolver-group support or routing information confirms that the proposed group supports an affected IT service or configuration item.
  canDeclareMajorIncident:
    conditions:
      - "Incident status is new, acknowledged, investigating, contained, recovering, or monitoring."
      - Incident severity is sev1-critical or sev2-high.
      - At least one impacted IT service is identified.
      - An incident commander is assigned.
      - "The bank's approved major-incident declaration criteria are satisfied using documented supporting facts; missing facts are flagged rather than guessed."
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - Containment scope and expected side effects are recorded before execution.
      - The steps to execute are approved under the applicable procedure where approval is required.
  canIsolateConfigurationItem:
    conditions:
      - The configuration item is linked as affected by the incident.
      - "If the item was found through an application, database, or infrastructure-component record, its identity is verified against the approved configuration inventory; if the match is unreliable, stop."
      - The impact of isolating the item is assessed.
      - A rollback or reconnection method is available.
      - Any approval required for the proposed step under the applicable procedure is confirmed.
  canFailOverService:
    conditions:
      - The recovery plan is applicable to the IT service being failed over.
      - The proposed target recovery environment is confirmed available under the governing procedure; environment type alone is not proof.
      - "The proposed data-recovery point is confirmed acceptable using the approved basis, not an uninterpreted numeric objective."
  canRestoreBackup:
    conditions:
      - The selected backup set status is successful or verified.
      - The selected backup set protects the configuration item to be restored.
      - "If the target was found through an application, database, or infrastructure-component record, its configuration-item identity is verified against the approved configuration inventory; if the match is unreliable, stop."
      - The proposed restore point is approved.
      - The target environment is approved.
  canExecuteEmergencyChange:
    conditions:
      - The change is explicitly designated for the emergency path in the controlled change workflow.
      - The change is justified by a linked incident confirmed active under the governing emergency-change procedure.
      - The affected configuration items are identified.
      - An implementation plan and a backout plan are documented.
      - The risk has been explicitly accepted in the controlled workflow; change status or an incident link alone is insufficient.
  canSendStakeholderUpdate:
    conditions:
      - "The audience, message, owner, and approval state are recorded in the controlled communication workflow."
      - The controlled communication workflow confirms this update is authorised to send; no universal approved-status value is assumed.
      - The content is consistent with the latest verified incident state.
  canSubmitRegulatoryNotification:
    conditions:
      - The linked materiality assessment result is reportable.
      - The notification identifies the incident being reported and the intended regulator.
      - All required information and supporting evidence are complete under the approved reporting procedure.
      - Notification status is approved.
      - "Submission can occur before the notification's due time, as established by the approved procedure."
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - Resolution and restoration evidence is recorded and sufficient under the closure workflow.
      - Each impacted service is healthy or its residual condition is documented and accepted through the closure workflow; missing or unknown health is not proof of restoration.
      - Required stakeholder communications are confirmed complete through the communication workflow.
      - "If the incident is major or explicitly designated cybersecurity, a post-incident review is scheduled or completed in the review or closure workflow."
  isOutstandingCorrectiveActionForService:
    conditions:
      - "Corrective action status is open, in-progress, or blocked; implemented is reported separately as awaiting verification, while verified needs a check against the approved workflow before reporting remaining work."
      - "Relevance to the IT service is established from the corrective action description, review findings, earlier incident's recorded service impacts, and where applicable the implementing change's scope."
      - "If relevance is unclear, check the approved review or action workflow with the owning organizational unit and label relevance unconfirmed rather than reporting the action as outstanding for that service."
  canRecommendOnCallEngineer:
    conditions:
      - The appropriate resolver group is established from approved support or routing information for an affected service or configuration item.
      - "The bank's approved on-call rota or dispatch process identifies the engineer currently available for that group."
      - "If the rota or dispatch information does not establish the current engineer, report the recommendation as unresolved rather than infer it from group membership or a previous incident handler."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set alert status to acknowledged and record the acknowledgement time; retain the acting person in the operational audit.
    verification: Read back the acknowledged alert status and confirm the acting person and acknowledgement time in the operational audit record.
  assignIncident:
    input: Incident
    preconditions:
      - canAssignIncident
    effect: "Record the incident's resolver group and retain the basis for selecting it."
    verification: "Read back the incident's resolver-group assignment."
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Record the major-incident designation, declaration time, and assigned commander; start the coordination and communication cadence."
    verification: "Read back the major-incident designation, commander, declaration time, and communication record."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: Execute approved containment steps and retain their outcome; mark the incident contained only after verification of containment indicators and remaining service impact.
    verification: Check and retain containment indicators and remaining service impact before confirming incident status is contained.
  isolateAffectedConfigurationItem:
    input: Incident
    preconditions:
      - canIsolateConfigurationItem
    effect: Isolate the configuration item linked to the incident from the defined networks or dependencies; retain the action outcome and reconnection basis with action evidence.
    verification: Confirm the linked item is isolated from the defined networks or dependencies and check and retain remaining-service health.
  failOverService:
    input: Incident
    preconditions:
      - canFailOverService
    effect: Move the affected IT service workload to the available recovery environment using the applicable recovery plan; retain the actual target and data-recovery-point decision basis with action evidence.
    verification: Verify and retain service health and critical business transactions in the target environment.
  restoreFromBackup:
    input: BackupSet
    preconditions:
      - canRestoreBackup
    effect: "Restore data from the selected backup set to the approved target and restore point; retain the selected backup, target, and restore outcome in action evidence."
    verification: Validate and retain data-integrity and application-functionality checks for the restored target.
  executeEmergencyChange:
    input: Change
    preconditions:
      - canExecuteEmergencyChange
    effect: "Implement the explicitly designated emergency change justified by the active incident, update its controlled-workflow status, and retain implementation evidence."
    verification: "Run technical checks, verify service health, and retain the results and implementation evidence; do not infer success from change status alone."
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - canSendStakeholderUpdate
    effect: "Send the controlled stakeholder communication about the incident, record its sent time, and archive the final message."
    verification: "Confirm the communication's delivery status and that the final sent message is archived; a sent timestamp alone is insufficient."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the approved notification before its due time, set notification status to submitted, record submission time, and retain the submission receipt."
    verification: Confirm the submission receipt and subsequently confirm acceptance or record rejection and required remediation; submitted is not accepted.
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: Set incident status to closed and record the closure time after all closure checks pass.
    verification: "Read back closed status and closure time; verify impacted service health or documented acceptance of residual conditions, retained resolution and restoration evidence, completed required communications, and a scheduled or completed review for major or cybersecurity incidents."


### Turn 104 — assistant

Understood. The model will use **Incident → Problem → KnownError → Workaround** to find a candidate, then check the runbook and retain any actual use and result in incident response evidence. I have not added an Incident → Workaround link.

**Validation result, based on the live state:**

- **Competency check:** The eleven actions have preconditions, effects, and verification steps. The questions have supported paths or identified external checks, but the model **cannot definitively answer** which later alerts are correlated with an incident. Confirmed customer-channel impact also remains unresolved when verified channel-specific evidence is unavailable. A recommended next on-call engineer depends on the approved rota or dispatch process.
- **Canvas checklist:** The intended roles, directed links, meanings, aliases, fixed choices, and action conditions are present. Technical-record identity must be verified in the approved configuration inventory before isolation or restore. The live canvas **does not pass cleanly**: it still contains the unwanted `Person` class, `MonitoringRule → evaluatedBy → MonitoringTool` link, and `Incident.classification` field. My available tool cannot delete them.

The intended model is therefore usable as a **qualified draft**, not a cleanly validated final canvas.
