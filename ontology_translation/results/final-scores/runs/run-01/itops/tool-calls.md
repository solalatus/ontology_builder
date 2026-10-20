# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-20T18:21:51.352Z

### Turn 1 — user

I lead IT operations and major-incident management for a regulated financial institution (IT Operations and Incident Response Ontology for a Medium-sized Hungarian Bank).  Day-to-day scope: IT service operations, observability, incident response, problem/change/recovery management, stakeholder communication, evidence, and regulatory reporting workflow. Where would you like to start?

### Turn 1 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 1 — tool

competency_questions: []
classes: {}
relationships: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 1 — assistant

The canvas is empty, so we can start with the agent’s requirements rather than a list of fields. We’ll work through roughly ten short phases: first what the agent must answer and do, then the concepts and connections it needs, and finally rules, actions, and validation.

To start, what are **five real questions** you would expect this agent to help answer across the operations and incident-response scope you described? Your wording is fine; we’ll refine the questions together.

### Turn 2 — user

I’d start with these five questions:

1. Which business services and customer channels are affected by this incident?
2. What alerts and events are associated with it, and which IT services and components are affected?
3. Who owns the affected service, and which resolver group and on-call engineer should respond?
4. Does it warrant major-incident coordination, and has its reporting significance been assessed?
5. Which runbook, workaround, backup, or recovery plan could restore service safely—and what evidence would we need before closing the incident?

Those take us from understanding impact through response, recovery, and accountability.

### Turn 2 — assistant

That gives us a useful path from impact through recovery. I’ll turn compound questions into separate requirements so we can check each one later.

For your first two items, should I record these **four questions** as written?

1. Which business services and customer channels are affected by an incident?
2. Which alerts and events are associated with an incident?
3. Which IT services are affected by an incident?
4. Which components are affected by an incident?

### Turn 3 — user

Yes, those are four useful separate questions. I’d make two small distinctions when we test them:

- For **alerts and events**, ask which are *correlated with* the incident; an alert alone does not necessarily establish an incident.
- For **components**, use *configuration items affected by* the incident. That is different from every component on an affected service’s dependency path.

The business services, customer channels, and IT services in the other questions are the right scope.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Which business services and customer channels are affected by an incident?\n  - text: Which alerts and events are correlated with an incident?\n  - text: Which IT services are affected by an incident?\n  - text: Which configuration items are affected by an incident?"
}
```

### Turn 3 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

I’ve recorded those four questions, including your distinctions: alerts and events are *correlated with* an incident, while configuration items are those *affected by* it—not everything on a service dependency path.

For ownership and escalation, should these be the next five questions?

1. Who owns an affected IT service?
2. Which resolver group should respond to an incident?
3. Which on-call engineer should respond to an incident?
4. Does an incident warrant major-incident coordination?
5. Has an incident’s reporting significance been assessed?

### Turn 4 — user

Yes, I’d keep those five as separate questions. Two refinements will make them easier to verify:

- For the resolver group, check that it supports an affected service or configuration item before assigning the incident. The on-call engineer is a separate question about who handles the response.
- For reporting significance, ask whether a **materiality assessment** has been completed and what it concluded. That does not, by itself, mean a regulatory notification has been submitted.

Major-incident coordination is also a distinct decision; it should not be inferred solely from the reporting assessment.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Who owns an affected IT service?\n  - text: Which resolver group should respond to an incident, based on support for an affected IT service or configuration item?\n  - text: Which on-call engineer should handle the incident response?\n  - text: Does an incident warrant major-incident coordination?\n  - text: Has a materiality assessment been completed for an incident, and what did it conclude?"
}
```

### Turn 4 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 4 — assistant

Those five are recorded. The model will need to distinguish a resolver group’s support responsibility from the incident assignment, and the on-call engineer from the group. It will also keep major-incident coordination separate from materiality assessment; an assessment is not a notification.

For your recovery-and-closure question, should I record these five separate questions?

1. Which runbook applies to restoring an affected service?
2. Which workaround could restore the affected service safely?
3. Which backup could be used for recovery?
4. Which recovery plan applies?
5. What evidence is needed before closing the incident?

### Turn 5 — user

Yes, with two wording changes:

1. **Which runbook can be used to handle the incident?** A runbook may cover diagnosis or verification as well as recovery; it need not itself restore the service.
2. **Which workaround could temporarily reduce or bypass the incident’s impact?** A workaround is not necessarily a full restoration.

I’d keep the backup and recovery-plan questions separate: check what the backup protects and which backup set the applicable recovery plan uses. For closure, retain resolution and restoration evidence, but also check service health or an accepted residual condition, required communications, and—where applicable—a scheduled or completed post-incident review.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Which runbook can be used to handle an incident?\n  - text: Which workaround could temporarily reduce or bypass an incident's impact?"
}
```

### Turn 5 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

I’ve recorded the revised runbook and workaround questions. Your backup distinction suggests two checks, and your closure criteria suggest several rather than one broad evidence question.

Should I add these six questions?

1. What does a candidate backup protect?
2. Which backup set does the applicable recovery plan use?
3. Which recovery plan applies to an incident?
4. What resolution and restoration evidence is required to close an incident?
5. Is the affected service healthy, or is its residual condition accepted for closure?
6. Have required communications and, where applicable, a post-incident review been scheduled or completed before closure?

### Turn 6 — user

Yes. I’d record them, with two qualifications:

- For **3**, a recovery plan restores an **IT service**; the incident is recovered *with* that plan. So identify the affected service first, then find the applicable plan.
- For **6**, required stakeholder communications must be **complete** before closure. For a major or cybersecurity incident, the post-incident review must be **scheduled or completed**; it need not already have been held.

For **5**, check the health of all impacted services, not just one affected service.

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What does a candidate backup protect?\n  - text: Which backup set does the recovery plan for an affected IT service use?\n  - text: Which recovery plan applies to an affected IT service?\n  - text: What resolution and restoration evidence is required to close an incident?\n  - text: Are all impacted services healthy, or is their residual condition accepted for incident closure?\n  - text: Have required stakeholder communications been completed before incident closure?\n  - text: For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
}
```

### Turn 6 — tool

Applied. Added 7, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 6 — assistant

I’ve recorded those as seven separate questions. The recovery plan is found through the affected IT service; closure checks **all** impacted services. Communications must be complete, while the applicable post-incident review may be scheduled or completed.

That brings us to 18 questions. Before we move from questions to the things the agent must **do**, what are five to ten concrete actions you want it to perform? Please name the action rather than just the information it should display—for example, an action you already mentioned is assigning an incident to a resolver group.

### Turn 7 — user

I’d start with these ten concrete actions:

1. Acknowledge an alert.
2. Assign an incident to a resolver group.
3. Declare a major incident.
4. Contain an incident.
5. Fail over an affected service to a recovery environment.
6. Restore data from a backup set.
7. Execute an emergency change.
8. Send a stakeholder communication.
9. Submit a regulatory notification.
10. Close an incident.

Each needs its own checks before execution; displaying a recommendation is different from performing the action.

### Turn 7 — assistant

Phase 1 now has 18 recorded questions and your ten proposed execution actions. I’m treating each action as distinct from displaying a recommendation; we’ll define its checks and verification before recording it as an executable action.

One narrow check before we identify the classes: for each of the **service owner, resolver group, and on-call engineer**, is there a closely related role that does day-to-day work under it, and does any of this depend on a specific operating context that changes how it is handled?

### Turn 8 — user

Not as a three-level reporting hierarchy. The **service owner** is accountable for the IT service across its lifecycle; the **IT operations team** operates it day to day, but I would not describe that team as working *under* the service owner in this model. A **resolver group** diagnoses and resolves incidents in its area, and an **on-call engineer** is a member of that group who can handle a time-critical response.

Operating context matters, but it does not redefine those roles. We need to know the affected service or configuration item to choose a suitable resolver group, and which environment is involved—especially if recovery would move the workload to a disaster-recovery environment. For a major incident, an incident commander takes responsibility for coordination; that is separate from the service owner and technical responders.

### Turn 8 — assistant

That settles the follow-up: the IT operations team operates the service day to day without being modeled as subordinate to its owner; the on-call engineer belongs to a resolver group; and the incident commander coordinates a major incident separately from the technical responders. Environment also matters for response and recovery.

To make those last two points testable, should I add these **two questions** to the 18 already recorded?

1. Which environment is involved in an incident or proposed failover?
2. Who is the incident commander coordinating a major incident?

Your ten actions are the proposed execution scope for the later action phase.

### Turn 9 — user

Yes, add both, with a qualification on the first:

1. **Which environment contains the affected IT service or configuration item, and which environment is proposed as the failover target?** I would establish the incident’s operating context through those affected objects, rather than assume the incident has its own environment field.
2. **Who is the incident commander for the major incident?** That person commands its coordination, separately from the resolver group and on-call engineer handling technical work.

The ten actions remain the proposed execution scope until we define their preconditions and verification.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Which environment contains an affected IT service or configuration item, and which environment is proposed as the failover target?\n  - text: Who is the incident commander for a major incident?"
}
```

### Turn 9 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 9 — assistant

Phase 1 is captured: 20 questions are on the canvas, and your ten actions remain proposed execution scope—not yet executable definitions. The questions distinguish incident coordination, technical response, materiality assessment, and notification.

Let’s start identifying the kinds of things the agent must handle. I propose this first small batch:

- **Incident** — needed to connect affected objects, response decisions, and closure evidence.
- **Alert** — needed to answer which alerts are correlated with an incident and to acknowledge one.
- **Event** — needed to answer which events are correlated with an incident.
- **IT service** — needed to establish impact, ownership, support, and the applicable recovery plan.

For **each**, does the agent need to identify or retrieve it as a distinct thing, rather than just read a value about something else? And are these the names you use, or would you name any of them differently?

### Turn 10 — user

Yes. I would keep **incident, alert, event, and IT service** as four distinct things the agent can identify and retrieve, and those are the names I’d use.

An **event** is an observed occurrence. An **alert** is a signal requiring triage or acknowledgement; it may indicate an event and may lead to an incident. An **incident** is the managed response to an unplanned interruption, degradation, or security condition, so it can draw on correlated events and alerts without being identical to them. An **IT service** is the managed technology capability whose impact, owner, and recovery arrangements we need to establish.

### Turn 10 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    meaning: A managed response to an unplanned interruption, degradation, or security condition.\n  Alert:\n    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.\n  Event:\n    meaning: An observed occurrence.\n  ITService:\n    meaning: A managed technology capability whose impact, owner, and recovery arrangements need to be established."
}
```

### Turn 10 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 10 — assistant

I’ve recorded those four distinct classes with your meanings. An alert is not automatically an incident, and correlated events are not the response itself.

Next, the impact and operating-context questions point to four more candidates: **business service** and **customer channel** (impact), **configuration item** (directly affected objects), and **environment** (where an affected object runs or a failover would go). For each, does the agent need to identify or retrieve it separately? Are those your names for them?

### Turn 11 — user

Yes—keep all four as separately identifiable, and those names work for me.

- A **business service** is the customer- or business-facing capability affected; it can be delivered through a **customer channel**, which is how customers access it. The channel is not another name for the service.
- A **configuration item** is a managed component in configuration-management scope. Record which items the incident directly affects; do not equate that list with every dependency of the affected service.
- An **environment** is the deployment context, such as production or disaster recovery. Identify both the context of the affected service or item and a proposed recovery target when failover is being considered.

### Turn 11 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  BusinessService:\n    meaning: A customer- or business-facing capability that may be affected by an incident.\n  CustomerChannel:\n    meaning: A way customers access a business service, distinct from the service itself.\n  ConfigurationItem:\n    meaning: A managed component in configuration-management scope that may be directly affected by an incident.\n  Environment:\n    meaning: A deployment context for an IT service or configuration item, including a possible failover target."
}
```

### Turn 11 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 11 — assistant

Those four are recorded separately. A customer channel is not a business service, and a directly affected configuration item is not simply every item on a dependency path.

For the response questions, I propose **service owner**, **resolver group**, **on-call engineer**, and **incident commander** as four distinct kinds of actor. The agent needs to identify the owner of an affected IT service, choose a supporting resolver group, find who handles the time-critical response, and identify who coordinates a major incident.

Does it need to identify **each actor separately** for those questions, and are these the names you use?

### Turn 12 — user

Yes. Keep all four as separately identifiable actors, and those are the names I use.

The **service owner** owns the IT service across its lifecycle. The **resolver group** is the team assigned to diagnose and restore the incident; the **on-call engineer** is a member of a resolver group and may handle the time-critical response. The **incident commander** commands a major incident’s coordination and decision cadence. Identifying a resolver group does not, by itself, identify the engineer or the commander.

### Turn 12 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceOwner:\n    meaning: The actor accountable for an IT service across its lifecycle.\n  ResolverGroup:\n    meaning: The team assigned to diagnose and restore an incident within its area of support.\n  OnCallEngineer:\n    meaning: A member of a resolver group who may handle a time-critical incident response.\n  IncidentCommander:\n    meaning: The actor who commands a major incident's coordination and decision cadence."
}
```

### Turn 12 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 12 — assistant

I’ve recorded those four actors separately. In particular, finding a resolver group does not by itself identify its on-call engineer or the incident commander.

The day-to-day **IT operations team** surfaced in our follow-up, but its existence alone is not a reason to add it as a class. Does the agent need to identify that team separately to answer one of the 20 recorded questions or carry out one of the ten proposed actions? If so, which one, and is “IT operations team” your name for it?

### Turn 13 — user

No—not for the 20 questions or ten proposed actions as they stand. **IT operations team** is the name I’d use for the team that operates an IT service day to day, but that is distinct from identifying its service owner or assigning a resolver group to an incident.

I’d add it as a separately identifiable actor if we want the agent to answer **“Which team operates this IT service?”** For the current scope, I would not make it a required class.

### Turn 13 — assistant

Agreed. I’ll leave **IT operations team** out of the current model; “which team operates this IT service?” is not one of the accepted requirements.

For the recovery questions and actions, four candidates are **runbook**, **workaround**, **recovery plan**, and **backup set**. Does the agent need to identify or retrieve each separately, and are those your names? One distinction to settle before adding them: when you say a **backup** protects something and a plan uses a **backup set**, is “backup” shorthand for a backup set here, or a different identifiable thing?

### Turn 14 — user

Yes, the agent needs to identify all four separately, and those names fit.

A **runbook** is a maintained procedure for diagnosis, response, recovery, or verification. A **workaround** is a temporary way to reduce or bypass impact; it may be documented in a runbook, but it is not the procedure itself. A **recovery plan** describes how to restore an IT service and its dependencies. A **backup set** is the defined collection of recoverable data that can protect configuration items and be used by a recovery plan.

Here, **“backup” is shorthand for “backup set”**, not a fifth identifiable thing. Before restoring one, we still need to establish that it protects the target and is suitable for the approved restore point and environment.

### Turn 14 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Runbook:\n    meaning: A maintained procedure for diagnosis, response, recovery, or verification.\n  Workaround:\n    meaning: A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it.\n  RecoveryPlan:\n    meaning: A plan describing how to restore an IT service and its dependencies.\n  BackupSet:\n    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.\n    aliases: [backup]"
}
```

### Turn 14 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 14 — assistant

I’ve recorded those four. **Backup** is an alias for **backup set**, not another class; suitability for the restore point and environment will need a check before restoration.

Next are the assessment and reporting records. To answer what a materiality assessment concluded and to distinguish that from actually submitting a notification, does the agent need to identify **materiality assessment** and **regulatory notification** as separate records? Are those your names for them?

### Turn 15 — user

Yes—keep **materiality assessment** and **regulatory notification** as separate identifiable records. Those are the names I’d use.

A materiality assessment records the incident’s significance, its rationale, and the reporting implication. A regulatory notification is the formal submission about an incident to a regulator. An assessment can conclude that reporting is required without a notification having been approved or submitted; submission has its own checks and evidence.

### Turn 15 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MaterialityAssessment:\n    meaning: A record of an incident's significance, rationale, and reporting implication.\n  RegulatoryNotification:\n    meaning: A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
}
```

### Turn 15 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 15 — assistant

Both records are now separate. A conclusion that reporting is required does not mean a notification has been approved or submitted.

For the remaining closure and communication requirements, I see **stakeholder communication** and **post-incident review** as candidate records: the agent must check completed communications, send one, and check whether a review is scheduled or completed when required. Does it need to identify each separately, and are those your terms?

### Turn 16 — user

Yes, both need to be identifiable records. I’d call the first a **communication** rather than “stakeholder communication”: its audience may be technical, business, customer, vendor, or regulatory, and the send action addresses the appropriate stakeholder. **Post-incident review** is the term I use for the structured review of causes, response, lessons, and follow-up work.

For closure, check that required communications are complete. For a major or cybersecurity incident, the post-incident review must be scheduled or completed; it need not already have taken place.

### Turn 16 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Communication:\n    meaning: A record of a message to an appropriate audience concerning an incident or its response.\n    aliases: [stakeholder communication]\n  PostIncidentReview:\n    meaning: A structured review of an incident's causes, response, lessons, and follow-up work."
}
```

### Turn 16 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 16 — assistant

I’ve recorded **communication** under your term, with “stakeholder communication” as an alternative name, and recorded **post-incident review** separately.

Two remaining candidates come from actions and closure: **emergency change** (the thing executed) and **incident evidence** (the resolution or restoration evidence checked before closure). Does the agent need to identify and retrieve each as a separate thing for those tasks? If so, what would you call each, and is closure evidence one kind of record or distinct records that matter differently?

### Turn 17 — user

Yes, both need to be separately identifiable. I’d use **emergency change** for the accelerated change being executed, and **evidence item** rather than “incident evidence” for a preserved record or artifact that documents the incident.

Resolution and restoration evidence matter differently when checking closure, but I would not make them separate kinds of record. They can be evidence items linked to the incident; the closure check needs to establish that both the resolution and the restoration are supported. Evidence integrity also matters, particularly in a cybersecurity incident.

### Turn 17 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  EmergencyChange:\n    meaning: An accelerated change executed as part of an incident response.\n  EvidenceItem:\n    meaning: A preserved record or artifact documenting an incident, including support for resolution or restoration.\n    aliases: [incident evidence]"
}
```

### Turn 17 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 17 — assistant

I’ve recorded **emergency change** and **evidence item** under your terms. Resolution and restoration are different things the closure check must substantiate, but they do not need separate evidence classes. We’ll also account for evidence integrity when defining checks.

That completes my proposed class list for the 20 questions and ten proposed actions. I have not added an IT operations team or separate classes for “backup,” resolution evidence, and restoration evidence, for the reasons you gave. **Does this set of kinds of things look right before we work through how they connect?**

### Turn 18 — user

It is a good starting set, but I would add a few distinct things before we map the connections:

- **Major incident**: declaring one changes the coordination and communication arrangements; it is not just a severity value on an ordinary incident.
- **Cybersecurity incident**: we need to recognize this kind of incident for evidence preservation, materiality assessment, and the post-incident review closure check.
- **Stakeholder**: a communication is addressed to someone, so the recipient must be identifiable.
- **Regulator**: a regulatory notification must be linked to its receiving authority before submission.

I would also retain **change** as the broader concept of which an emergency change is an accelerated form. We need not add the IT operations team or separate backup and evidence classes you ruled out.

### Turn 18 — assistant

You’ve identified two clear additions: **stakeholder** is needed to identify a communication’s recipient, and **regulator** to identify the receiving authority for a notification. I’ll check the other three before recording them, because this model cannot express “is a kind of” as a class connection.

For **major incident** and **cybersecurity incident**, are these separately identifiable records alongside an incident, or are they designations on the same incident record that change which coordination, evidence, assessment, and review checks apply?

### Turn 19 — user

They are **designations of an incident**, not separate incident cases sitting alongside it. The agent should retrieve the same incident and recognize whether it has been declared a **major incident**, is a **cybersecurity incident**, or both.

Keep the two designations distinct: major-incident status brings exceptional command and communication coordination; cybersecurity status brings security-event context, evidence-preservation and materiality checks. Both affect the post-incident review check at closure. If the model cannot express “is a kind of,” represent those distinctions on the incident without creating duplicate incident records.

### Turn 19 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Stakeholder:\n    meaning: An identifiable recipient of a communication about an incident or its response.\n  Regulator:\n    meaning: The receiving authority for a regulatory notification."
}
```

### Turn 19 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 19 — assistant

I’ve added **stakeholder** and **regulator**. I’ll keep **major incident** and **cybersecurity incident** as distinct designations on the same incident, rather than duplicate incident records; we’ll capture the decision-bearing values in the properties phase.

For **change** and **emergency change**, what must the agent identify, retrieve, connect, or pass to a tool about a *change in general* that it cannot do using the emergency change alone for the accepted questions and actions?

### Turn 20 — user

For the accepted questions and actions, **nothing requires the agent to identify a change in general separately**. The execution action takes an emergency change; the agent needs its incident link, affected configuration items, implementation and backout plans, and explicit risk acceptance. We can capture those on the emergency change without adding a separate general-change record to this scope.

I raised **change** because it becomes useful if we later ask whether a recent change caused an incident, or track a change used to resolve one. For now, I would leave it out rather than add a class without a requirement.

### Turn 20 — assistant

That keeps the scope tight. **Change** will stay out: the accepted tasks concern an emergency change, not changes in general. I’ve noted its incident link, affected configuration items, implementation and backout plans, and risk acceptance as needs to examine in later phases.

The class set now includes the distinct records and actors you identified, with major and cybersecurity treated as designations of **Incident**, not additional cases. **Does that complete the class set for the current 20 questions and ten proposed actions?**

### Turn 21 — user

Yes, that completes the class set for the current questions and proposed actions. We can now map the connections among them, while keeping major and cybersecurity as distinct incident designations rather than duplicate cases. If a later requirement calls for broader change history or monitoring-rule analysis, we can revisit the scope then.

### Turn 21 — assistant

The class set is confirmed. We’ll now map connections, starting with impact. I won’t assume that every pair named in a question has a direct link.

How does the agent get from an **Incident** to each of its **affected IT services, directly affected configuration items, affected business services, and customer channels**? Please describe any intermediate steps, and give the verb and direction you would use for each real connection.

### Turn 22 — user

I would use these paths:

- **Incident → IT service:** the incident **impacts** the IT service.
- **Incident → configuration item:** the incident **affects** the configuration item. That identifies a directly affected item, not every item on a dependency path.
- **Incident → business service:** the incident **impacts** the business service. To investigate possible wider impact, trace from an impacted IT service in the other direction: a **business service depends on an IT service**. A dependency alone does not establish that the business service is affected.
- **Business service → customer channel:** the business service **is delivered through** the customer channel. That gives us the channels to assess for customer impact; we should not mark every channel as disrupted merely because the service uses it.

So the channel path goes through the business service. I would not add a direct incident-to-channel connection.

### Turn 22 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: impacts\n    from: Incident\n    to: ITService\n    meaning: An IT service established as impacted by this incident.\n  - name: affects\n    from: Incident\n    to: ConfigurationItem\n    meaning: A configuration item directly affected by this incident, rather than merely on a dependency path.\n  - name: impacts\n    from: Incident\n    to: BusinessService\n    meaning: A business service established as impacted by this incident, not just dependent on an impacted IT service.\n  - name: dependsOn\n    from: BusinessService\n    to: ITService\n    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.\n  - name: isDeliveredThrough\n    from: BusinessService\n    to: CustomerChannel\n    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption."
}
```

### Turn 22 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 22 — assistant

I’ve recorded those impact paths in your direction and wording. The model distinguishes established incident impact from a service dependency, and channel delivery from confirmed channel disruption. There is no direct incident-to-channel link.

Next, for the alert and event questions and the **acknowledge alert** action: how do **alerts** and **events** connect to an **incident** and to each other? Please give the verb and direction you use, and distinguish a correlation from a signal that merely prompted investigation.

### Turn 23 — user

I’d record the connections this way:

- An **alert indicates an event**: the signal points to an observed occurrence.
- An **alert may open an incident**: triage can lead to a managed response, but not every alert does.
- An **incident is triggered by an alert** when that alert prompted the response.
- An **incident is correlated from events** when those observations have been associated with the case.

The last two answer different questions. A triggering alert tells us what prompted the incident; correlated events tell us what observations support the investigation. We should not treat every event indicated by an alert as automatically correlated with the incident. Acknowledging the alert changes the alert’s own state—it does not, by itself, open or acknowledge an incident.

### Turn 23 — assistant

I understand the distinctions: an alert indicates an event; acknowledging it changes only the alert; and an event indicated by an alert is not automatically correlated with the incident.

Before recording the **Alert–Incident** connection, I need to resolve an overlap. “Alert may open an incident” and “incident is triggered by an alert” describe the same pair in opposite directions, while the accepted question also asks for *correlated alerts*. Which connection should represent an alert that prompted the incident, and can an alert be correlated with an incident **without** having prompted it?

### Turn 24 — user

For an alert that **prompted** the incident, I’d record **incident → alert: “is triggered by.”** From the alert’s side, **“may open an incident”** describes the possible outcome of triage; it does not mean every alert opens one.

An alert can be relevant to an ongoing investigation without having prompted the incident, but I would **not** use “is triggered by” to record that. The connections we’ve identified do not provide a separate alert-to-incident correlation for that case. We can examine whether the alert indicates an event correlated with the incident, but that path must be established—not assumed from the alert alone. So the accepted “correlated alerts” question needs that qualification.

### Turn 24 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: indicates\n    from: Alert\n    to: Event\n    meaning: The observed occurrence indicated by the alert, without automatically correlating it to an incident.\n  - name: isTriggeredBy\n    from: Incident\n    to: Alert\n    meaning: The alert that prompted the managed incident response after triage.\n  - name: isCorrelatedFrom\n    from: Incident\n    to: Event\n    meaning: An observed event established as correlated with the incident during investigation."
}
```

### Turn 24 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 24 — assistant

I’ve recorded **Incident → Alert: is triggered by**, **Incident → Event: is correlated from**, and **Alert → Event: indicates**. None of those makes every relevant alert a triggering alert, or automatically correlates an alert’s event with the incident.

The recorded question still asks which **alerts** are correlated with an incident. For a non-triggering alert, is an established path through its indicated, correlated event sufficient to answer that question, or does the investigation need to record alert–incident correlation as a fact in its own right?

### Turn 25 — user

For this model, an **established path through the event is sufficient**: the alert indicates an event, and that event is correlated with the incident. The agent can return the alert as associated *through that event*, making the path clear.

I would not record a separate, generic alert–incident correlation as a fact in its own right. Nor would I label that non-triggering alert as having triggered or opened the incident. If the event correlation has not been established, the alert’s relevance remains a lead for investigation, not a confirmed association.

### Turn 25 — assistant

Understood. A non-triggering alert can be returned as associated **through an event whose correlation has been established**, with that path shown. Without the event correlation, it remains an investigative lead. No extra alert–incident link is needed.

For ownership and routing, how does the agent get from an affected **IT service or configuration item** to the **resolver group that should respond**, and then to the **on-call engineer**? Also, once a group or engineer actually takes the incident, which connections record that assignment or handling? Please give the verbs and directions you use.

### Turn 26 — user

There are two steps here: **choosing a suitable responder** and **recording who actually took the incident**.

- Start with the **IT service the incident impacts** or the **configuration item it affects**. Before assignment, establish that the proposed resolver group supports that service or item. That support responsibility is a suitability check; I would not infer it just because the group handled a previous incident.
- An **on-call engineer is a member of a resolver group**. Membership helps identify a candidate, but does not mean that engineer has taken this incident.
- Once assigned, the **incident is assigned to the resolver group**. When an engineer handles it, the **incident is handled by the on-call engineer**.
- The **resolver group resolves the incident** describes its response role; it is not a substitute for the assignment record.

We have not established a separate direct connection from resolver group to service or configuration item in this scoped model. The support check still has to be made before the assignment action.

### Turn 26 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isMemberOf\n    from: OnCallEngineer\n    to: ResolverGroup\n    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.\n  - name: isAssignedTo\n    from: Incident\n    to: ResolverGroup\n    meaning: The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support.\n  - name: isHandledBy\n    from: Incident\n    to: OnCallEngineer\n    meaning: The on-call engineer who actually handles this incident, independent of group membership."
}
```

### Turn 26 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 26 — assistant

I’ve recorded the three facts you distinguished: engineer membership, the incident’s assigned resolver group, and the engineer actually handling it. I have **not** treated past handling or group membership as proof of support.

There is still a routing gap: without a recorded support path, the agent cannot work out which group *should* receive a newly affected service or item. **How is a resolver group’s support for an IT service or configuration item established in practice—through a direct support responsibility, or through another record or path?**

### Turn 27 — user

It is a **support responsibility that must be checked**, not something the agent can derive from engineer membership or past incident assignments. For a proposed group, we need confirmation that it supports the affected IT service or configuration item before assigning the incident.

In this scoped model, there is no recorded resolver-group-to-service or resolver-group-to-item connection, nor another defined path that identifies the right group automatically. So the agent can validate a **proposed** assignment against the bank’s authoritative support arrangements, but it cannot reliably select a group from these connections alone. That is a genuine gap if automatic routing is a requirement.

### Turn 27 — assistant

That is a real gap, not a reason to infer support from past assignments. The recorded question asks **“Which resolver group should respond to an incident, based on support for an affected IT service or configuration item?”** As the model stands, it can check a proposed group against the bank’s authoritative support arrangements, but it cannot identify a group to propose.

Should we represent those authoritative responsibilities as **Resolver group → supports → IT service** and **Resolver group → supports → configuration item**, with the agent retrieving or verifying those facts from the authoritative arrangements? Or is the intended requirement only to validate a group proposed elsewhere, in which case we should narrow the recorded question?

### Turn 28 — user

I’d **narrow the recorded question** rather than add those two support connections. The support check is required before assignment, but the connections we’ve established do not give the agent a way to retrieve candidate groups automatically.

A testable version is: **“Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?”** The agent should verify that responsibility against the bank’s authoritative support arrangements. If automatic group selection becomes a requirement, we would need to model that source explicitly rather than infer support from past assignments.

### Turn 28 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 28 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: Which alerts and events are correlated with an incident?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: Which configuration items are affected by an incident?
  - id: cq5
    text: Who owns an affected IT service?
  - id: cq6
    text: "Which resolver group should respond to an incident, based on support for an affected IT service or configuration item?"
  - id: cq7
    text: Which on-call engineer should handle the incident response?
  - id: cq8
    text: Does an incident warrant major-incident coordination?
  - id: cq9
    text: "Has a materiality assessment been completed for an incident, and what did it conclude?"
  - id: cq10
    text: Which runbook can be used to handle an incident?
  - id: cq11
    text: "Which workaround could temporarily reduce or bypass an incident's impact?"
  - id: cq12
    text: What does a candidate backup protect?
  - id: cq13
    text: Which backup set does the recovery plan for an affected IT service use?
  - id: cq14
    text: Which recovery plan applies to an affected IT service?
  - id: cq15
    text: What resolution and restoration evidence is required to close an incident?
  - id: cq16
    text: "Are all impacted services healthy, or is their residual condition accepted for incident closure?"
  - id: cq17
    text: Have required stakeholder communications been completed before incident closure?
  - id: cq18
    text: "For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
  - id: cq19
    text: "Which environment contains an affected IT service or configuration item, and which environment is proposed as the failover target?"
  - id: cq20
    text: Who is the incident commander for a major incident?
classes:
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence.
    aliases: []
    properties: {}
  ITService:
    meaning: "A managed technology capability whose impact, owner, and recovery arrangements need to be established."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A customer- or business-facing capability that may be affected by an incident.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: "A way customers access a business service, distinct from the service itself."
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component in configuration-management scope that may be directly affected by an incident.
    aliases: []
    properties: {}
  Environment:
    meaning: "A deployment context for an IT service or configuration item, including a possible failover target."
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The actor accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: The team assigned to diagnose and restore an incident within its area of support.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group who may handle a time-critical incident response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "The actor who commands a major incident's coordination and decision cadence."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: "A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it."
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan describing how to restore an IT service and its dependencies.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.
    aliases:
      - backup
    properties: {}
  MaterialityAssessment:
    meaning: "A record of an incident's significance, rationale, and reporting implication."
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
    aliases: []
    properties: {}
  Communication:
    meaning: A record of a message to an appropriate audience concerning an incident or its response.
    aliases:
      - stakeholder communication
    properties: {}
  PostIncidentReview:
    meaning: "A structured review of an incident's causes, response, lessons, and follow-up work."
    aliases: []
    properties: {}
  EmergencyChange:
    meaning: An accelerated change executed as part of an incident response.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "A preserved record or artifact documenting an incident, including support for resolution or restoration."
    aliases:
      - incident evidence
    properties: {}
  Stakeholder:
    meaning: An identifiable recipient of a communication about an incident or its response.
    aliases: []
    properties: {}
  Regulator:
    meaning: The receiving authority for a regulatory notification.
    aliases: []
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: An IT service established as impacted by this incident.
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "A configuration item directly affected by this incident, rather than merely on a dependency path."
    aliases: []
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "A business service established as impacted by this incident, not just dependent on an impacted IT service."
    aliases: []
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.
    aliases: []
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption.
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: "The observed occurrence indicated by the alert, without automatically correlating it to an incident."
    aliases: []
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: The alert that prompted the managed incident response after triage.
    aliases: []
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: An observed event established as correlated with the incident during investigation.
    aliases: []
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.
    aliases: []
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support."
    aliases: []
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer who actually handles this incident, independent of group membership."
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 28 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - id: cq6\n    text: Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?"
}
```

### Turn 28 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 28 — assistant

I’ve updated the recorded routing question. The agent will **validate a proposed group** against authoritative support arrangements before assignment; it will not claim to select a group automatically. That support source remains external to the connections recorded here.

For the remaining response actors, how do you get from an affected **IT service** to its **service owner**, and from a declared major **incident** to its **incident commander**? What verbs and directions would you use for those two connections?

### Turn 29 — user

I’d record them as:

- **Service owner → owns → IT service.** Starting from the affected service, retrieve the owner through that ownership connection.
- **Incident commander → commands → major incident.** Starting from the declared incident, retrieve the commander through that connection. For incident coordination more generally, **incident → is coordinated by → incident commander** also records the direction from the case.

The commander must be assigned before declaring a major incident; service ownership alone does not establish who commands it.

### Turn 29 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: owns\n    from: ServiceOwner\n    to: ITService\n    meaning: The IT service for which the service owner is accountable across its lifecycle."
}
```

### Turn 29 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 29 — assistant

I’ve recorded **Service owner → owns → IT service**. Ownership does not identify the incident commander.

Because a major incident is a **designation on Incident**, “commander commands major incident” and “incident is coordinated by commander” would connect the same two classes in opposite directions. Which **one verb and direction** should be the recorded connection? Also, when you say the commander must be assigned before declaration, should that connection be present on the incident before its major-incident designation is set?

### Turn 30 — user

For the scoped model, record **Incident → is coordinated by → incident commander**. That lets us identify the commander from the incident record; we do not need a second, reverse connection for the major-incident designation.

Yes—the commander must be assigned to the incident **before** declaration. The declaration check should confirm that assignment, then set the major-incident designation and record the declaration time. The commander’s assignment alone does not make the incident major.

### Turn 30 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isCoordinatedBy\n    from: Incident\n    to: IncidentCommander\n    meaning: The incident commander assigned to coordinate the incident; assignment precedes and does not itself constitute a major-incident declaration."
}
```

### Turn 30 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 30 — assistant

I’ve recorded **Incident → is coordinated by → incident commander**. The commander link must be present before declaration, but it does not itself declare the incident major; the designation and declaration time will be captured later.

For recovery, how does the agent get from an **affected IT service** to its **recovery plan**, from that plan to its **backup set**, and from a backup set to the **configuration items it protects**? Also, how does it establish the current and proposed target **environments**? Please give the verbs and directions you use, and distinguish a plan’s normal arrangements from a target proposed for this incident.

### Turn 31 — user

I’d use these connections:

- **Recovery plan → recovers → IT service.** Start with the service the incident impacts and find a plan that recovers it. If that plan is used for this case, **incident → is recovered with → recovery plan** records what was actually used.
- **Recovery plan → uses → backup set.**
- **Backup set → protects → configuration item.** That tells us whether a candidate backup covers the intended restore target; it does not, by itself, authorize a restore.
- **IT service → is deployed in → environment**, and **configuration item → belongs to → environment**. Those establish the affected objects’ operating context.

The **proposed failover target** is a decision for this incident, not necessarily the service’s current deployment environment or a target inferred merely from the plan. Before failover, we must confirm that the plan applies, the proposed recovery environment is available, and the data-recovery point is acceptable. I would not add a direct incident-to-environment connection just to represent that proposal.

### Turn 31 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: recovers\n    from: RecoveryPlan\n    to: ITService\n    meaning: The IT service that this recovery plan is designed to restore.\n  - name: isRecoveredWith\n    from: Incident\n    to: RecoveryPlan\n    meaning: The recovery plan actually used for the incident, distinct from plans merely applicable to affected services.\n  - name: uses\n    from: RecoveryPlan\n    to: BackupSet\n    meaning: The backup set specified for use by the recovery plan.\n  - name: protects\n    from: BackupSet\n    to: ConfigurationItem\n    meaning: A configuration item protected by this backup set; protection alone does not authorize a restore.\n  - name: isDeployedIn\n    from: ITService\n    to: Environment\n    meaning: The environment in which the IT service is currently deployed.\n  - name: belongsTo\n    from: ConfigurationItem\n    to: Environment\n    meaning: The deployment environment to which the configuration item belongs."
}
```

### Turn 31 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 31 — assistant

I’ve recorded the recovery and current-deployment paths. They let the agent find a plan for an affected service, see which backup set it uses and what that set protects, and distinguish a plan actually used for an incident from one merely applicable.

The proposed failover target is still unrepresented. Since you do **not** want an Incident → Environment link, where is the target proposal recorded so the agent can identify it for *this* incident—is it on a recovery plan used or selected for the case, or in another record we have already named?

### Turn 32 — user

Neither the recovery plan nor another record we’ve named has a defined field or connection for **this incident’s proposed target environment**. The plan establishes how the IT service can be recovered; it does not, by itself, record which target has been selected for this attempt.

For a proposed failover, the target environment must be supplied as part of the operational decision and checked for availability before execution. If the agent must **retrieve a previously recorded proposal** later, that is a gap in the current model. I would not imply that the proposal is stored on the recovery plan or infer it from the service’s current environment.

### Turn 32 — assistant

Understood: the current deployment environment is retrievable through the affected service or item, but a failover target is **supplied for a particular operational decision**. The recovery plan does not store that choice, and the model must not infer it.

For the recorded environment question, does the agent need to **retrieve a previously recorded target proposal**, or only assess a target supplied when failover is proposed?

### Turn 33 — user

Only **assess a target supplied when failover is proposed**. It should identify the affected service’s or configuration item’s current environment, then check the supplied recovery environment’s availability and whether the data-recovery point is acceptable under the applicable recovery plan.

I would phrase the question as: **“What environment is the affected service or item in, and is the supplied failover target suitable?”** We do not need a stored target proposal for the current scope.

### Turn 33 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 33 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: Which alerts and events are correlated with an incident?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: Which configuration items are affected by an incident?
  - id: cq5
    text: Who owns an affected IT service?
  - id: cq6
    text: "Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?"
  - id: cq7
    text: Which on-call engineer should handle the incident response?
  - id: cq8
    text: Does an incident warrant major-incident coordination?
  - id: cq9
    text: "Has a materiality assessment been completed for an incident, and what did it conclude?"
  - id: cq10
    text: Which runbook can be used to handle an incident?
  - id: cq11
    text: "Which workaround could temporarily reduce or bypass an incident's impact?"
  - id: cq12
    text: What does a candidate backup protect?
  - id: cq13
    text: Which backup set does the recovery plan for an affected IT service use?
  - id: cq14
    text: Which recovery plan applies to an affected IT service?
  - id: cq15
    text: What resolution and restoration evidence is required to close an incident?
  - id: cq16
    text: "Are all impacted services healthy, or is their residual condition accepted for incident closure?"
  - id: cq17
    text: Have required stakeholder communications been completed before incident closure?
  - id: cq18
    text: "For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
  - id: cq19
    text: "Which environment contains an affected IT service or configuration item, and which environment is proposed as the failover target?"
  - id: cq20
    text: Who is the incident commander for a major incident?
classes:
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence.
    aliases: []
    properties: {}
  ITService:
    meaning: "A managed technology capability whose impact, owner, and recovery arrangements need to be established."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A customer- or business-facing capability that may be affected by an incident.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: "A way customers access a business service, distinct from the service itself."
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component in configuration-management scope that may be directly affected by an incident.
    aliases: []
    properties: {}
  Environment:
    meaning: "A deployment context for an IT service or configuration item, including a possible failover target."
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The actor accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: The team assigned to diagnose and restore an incident within its area of support.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group who may handle a time-critical incident response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "The actor who commands a major incident's coordination and decision cadence."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: "A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it."
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan describing how to restore an IT service and its dependencies.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.
    aliases:
      - backup
    properties: {}
  MaterialityAssessment:
    meaning: "A record of an incident's significance, rationale, and reporting implication."
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
    aliases: []
    properties: {}
  Communication:
    meaning: A record of a message to an appropriate audience concerning an incident or its response.
    aliases:
      - stakeholder communication
    properties: {}
  PostIncidentReview:
    meaning: "A structured review of an incident's causes, response, lessons, and follow-up work."
    aliases: []
    properties: {}
  EmergencyChange:
    meaning: An accelerated change executed as part of an incident response.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "A preserved record or artifact documenting an incident, including support for resolution or restoration."
    aliases:
      - incident evidence
    properties: {}
  Stakeholder:
    meaning: An identifiable recipient of a communication about an incident or its response.
    aliases: []
    properties: {}
  Regulator:
    meaning: The receiving authority for a regulatory notification.
    aliases: []
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: An IT service established as impacted by this incident.
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "A configuration item directly affected by this incident, rather than merely on a dependency path."
    aliases: []
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "A business service established as impacted by this incident, not just dependent on an impacted IT service."
    aliases: []
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.
    aliases: []
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption.
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: "The observed occurrence indicated by the alert, without automatically correlating it to an incident."
    aliases: []
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: The alert that prompted the managed incident response after triage.
    aliases: []
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: An observed event established as correlated with the incident during investigation.
    aliases: []
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.
    aliases: []
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support."
    aliases: []
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer who actually handles this incident, independent of group membership."
    aliases: []
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: The incident commander assigned to coordinate the incident; assignment precedes and does not itself constitute a major-incident declaration.
    aliases: []
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: The IT service that this recovery plan is designed to restore.
    aliases: []
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "The recovery plan actually used for the incident, distinct from plans merely applicable to affected services."
    aliases: []
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set specified for use by the recovery plan.
    aliases: []
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item protected by this backup set; protection alone does not authorize a restore.
    aliases: []
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is currently deployed.
    aliases: []
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: The deployment environment to which the configuration item belongs.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 33 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - id: cq19\n    text: What environment is an affected IT service or configuration item in, and is the supplied failover target suitable?"
}
```

### Turn 33 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 33 — assistant

I’ve updated the recorded question: identify the affected object’s current environment, then assess the **supplied** failover target. No stored proposal or inferred target has been added.

How does the agent find a **runbook** that can handle an incident and a **workaround** that could reduce its impact? Please describe the paths through any affected service or item, plus any connections recording a runbook or workaround actually used for the incident. What verbs and directions would you use?

### Turn 34 — user

The clearest path to a **runbook actually used** is **incident → is handled with → runbook**. We do not have a defined connection from an affected IT service or configuration item directly to a runbook, so those affected objects alone cannot identify an applicable one.

For a **candidate workaround**, the path is **incident → is linked to → problem → is documented by → known error → has → workaround**. A **known error → affects → configuration item** connection can help check relevance to an item affected by the incident. A **workaround → is documented in → runbook** connection then points to the maintained procedure describing it.

Those paths identify candidates, not proof that a workaround is safe here or was actually applied. We have no separate incident-to-workaround connection recording its use. If the agent must answer *which workaround was used*, that would be a gap; the current question asks which one **could** reduce the impact.

### Turn 34 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isHandledWith\n    from: Incident\n    to: Runbook\n    meaning: The runbook actually used to handle the incident, not necessarily every runbook that might be suitable.\n  - name: isDocumentedIn\n    from: Workaround\n    to: Runbook\n    meaning: The maintained runbook documenting the workaround."
}
```

### Turn 34 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 34 — assistant

I’ve recorded **Incident → is handled with → Runbook** for a runbook actually used, and **Workaround → is documented in → Runbook**. Neither establishes that a runbook or workaround is safe or applicable merely because it exists.

Your candidate-workaround path introduces two things not yet in the class set: **problem** and **known error**. To answer the recorded question “Which workaround could temporarily reduce or bypass an incident’s impact?”, does the agent need to identify and retrieve **each** as a distinct record along that path? Are those your terms, and what does each mean in one sentence?

### Turn 35 — user

Yes—if we want that candidate-workaround path to be answerable, add **problem** and **known error** as distinct records. Those are the terms I use.

A **problem** is the underlying or potential cause of one or more incidents. A **known error** is a diagnosed problem with a documented cause or workaround. The incident can be linked to the problem; the known error documents that problem and can have a workaround. That gives the agent a traceable candidate, not permission to apply it without checking the incident’s circumstances.

### Turn 35 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Problem:\n    meaning: The underlying or potential cause of one or more incidents.\n  KnownError:\n    meaning: A diagnosed problem with a documented cause or workaround."
}
```

### Turn 35 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 35 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isLinkedTo\n    from: Incident\n    to: Problem\n    meaning: A problem linked to the incident as an underlying or potential cause.\n  - name: isDocumentedBy\n    from: Problem\n    to: KnownError\n    meaning: The known error documenting a diagnosed problem.\n  - name: has\n    from: KnownError\n    to: Workaround\n    meaning: A workaround documented for the known error, not an automatic authorization to apply it.\n  - name: affects\n    from: KnownError\n    to: ConfigurationItem\n    meaning: A configuration item affected by the known error, helping assess candidate workaround relevance."
}
```

### Turn 35 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 35 — assistant

I’ve added **Problem** and **KnownError** as distinct records. The workaround path you described is not yet on the canvas; I’ll add those confirmed connections in the next edit. It will identify a *candidate*, not authorize its use.

One remaining runbook distinction affects the recorded question: **Incident → is handled with → Runbook** tells us what was used, but not which runbook *can* be used before handling starts. Is candidate selection checked outside this model, or is there a specific connection you use to find an applicable runbook?

### Turn 36 — user

There is **no general connection from an IT service or configuration item to an applicable runbook** in this scope. Before handling starts, the agent can find a candidate through a known error’s workaround **documented in a runbook**, then check whether that procedure fits the incident. Otherwise, candidate selection depends on the bank’s maintained operational procedures outside the connections we’ve recorded.

**Incident → is handled with → runbook** records use; it should not be treated as the way to discover a runbook before one has been chosen. I’d qualify the question accordingly: the agent can identify a traceable candidate where that workaround path exists, but cannot promise a runbook for every incident.

### Turn 36 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 36 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: Which alerts and events are correlated with an incident?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: Which configuration items are affected by an incident?
  - id: cq5
    text: Who owns an affected IT service?
  - id: cq6
    text: "Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?"
  - id: cq7
    text: Which on-call engineer should handle the incident response?
  - id: cq8
    text: Does an incident warrant major-incident coordination?
  - id: cq9
    text: "Has a materiality assessment been completed for an incident, and what did it conclude?"
  - id: cq10
    text: Which runbook can be used to handle an incident?
  - id: cq11
    text: "Which workaround could temporarily reduce or bypass an incident's impact?"
  - id: cq12
    text: What does a candidate backup protect?
  - id: cq13
    text: Which backup set does the recovery plan for an affected IT service use?
  - id: cq14
    text: Which recovery plan applies to an affected IT service?
  - id: cq15
    text: What resolution and restoration evidence is required to close an incident?
  - id: cq16
    text: "Are all impacted services healthy, or is their residual condition accepted for incident closure?"
  - id: cq17
    text: Have required stakeholder communications been completed before incident closure?
  - id: cq18
    text: "For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
  - id: cq19
    text: "What environment is an affected IT service or configuration item in, and is the supplied failover target suitable?"
  - id: cq20
    text: Who is the incident commander for a major incident?
classes:
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence.
    aliases: []
    properties: {}
  ITService:
    meaning: "A managed technology capability whose impact, owner, and recovery arrangements need to be established."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A customer- or business-facing capability that may be affected by an incident.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: "A way customers access a business service, distinct from the service itself."
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component in configuration-management scope that may be directly affected by an incident.
    aliases: []
    properties: {}
  Environment:
    meaning: "A deployment context for an IT service or configuration item, including a possible failover target."
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The actor accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: The team assigned to diagnose and restore an incident within its area of support.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group who may handle a time-critical incident response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "The actor who commands a major incident's coordination and decision cadence."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: "A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it."
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan describing how to restore an IT service and its dependencies.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.
    aliases:
      - backup
    properties: {}
  MaterialityAssessment:
    meaning: "A record of an incident's significance, rationale, and reporting implication."
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
    aliases: []
    properties: {}
  Communication:
    meaning: A record of a message to an appropriate audience concerning an incident or its response.
    aliases:
      - stakeholder communication
    properties: {}
  PostIncidentReview:
    meaning: "A structured review of an incident's causes, response, lessons, and follow-up work."
    aliases: []
    properties: {}
  EmergencyChange:
    meaning: An accelerated change executed as part of an incident response.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "A preserved record or artifact documenting an incident, including support for resolution or restoration."
    aliases:
      - incident evidence
    properties: {}
  Stakeholder:
    meaning: An identifiable recipient of a communication about an incident or its response.
    aliases: []
    properties: {}
  Regulator:
    meaning: The receiving authority for a regulatory notification.
    aliases: []
    properties: {}
  Problem:
    meaning: The underlying or potential cause of one or more incidents.
    aliases: []
    properties: {}
  KnownError:
    meaning: A diagnosed problem with a documented cause or workaround.
    aliases: []
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: An IT service established as impacted by this incident.
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "A configuration item directly affected by this incident, rather than merely on a dependency path."
    aliases: []
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "A business service established as impacted by this incident, not just dependent on an impacted IT service."
    aliases: []
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.
    aliases: []
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption.
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: "The observed occurrence indicated by the alert, without automatically correlating it to an incident."
    aliases: []
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: The alert that prompted the managed incident response after triage.
    aliases: []
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: An observed event established as correlated with the incident during investigation.
    aliases: []
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.
    aliases: []
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support."
    aliases: []
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer who actually handles this incident, independent of group membership."
    aliases: []
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: The incident commander assigned to coordinate the incident; assignment precedes and does not itself constitute a major-incident declaration.
    aliases: []
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: The IT service that this recovery plan is designed to restore.
    aliases: []
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "The recovery plan actually used for the incident, distinct from plans merely applicable to affected services."
    aliases: []
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set specified for use by the recovery plan.
    aliases: []
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item protected by this backup set; protection alone does not authorize a restore.
    aliases: []
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is currently deployed.
    aliases: []
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: The deployment environment to which the configuration item belongs.
    aliases: []
  - name: isHandledWith
    from: Incident
    to: Runbook
    meaning: "The runbook actually used to handle the incident, not necessarily every runbook that might be suitable."
    aliases: []
  - name: isDocumentedIn
    from: Workaround
    to: Runbook
    meaning: The maintained runbook documenting the workaround.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 36 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - id: cq10\n    text: Which runbook is a traceable candidate for handling an incident, where an applicable known-error workaround documents one?\nrelationships:\n  - name: isLinkedTo\n    from: Incident\n    to: Problem\n    meaning: A problem linked to the incident as an underlying or potential cause.\n  - name: isDocumentedBy\n    from: Problem\n    to: KnownError\n    meaning: The known error documenting a diagnosed problem.\n  - name: has\n    from: KnownError\n    to: Workaround\n    meaning: A workaround documented for the known error, not an automatic authorization to apply it.\n  - name: affects\n    from: KnownError\n    to: ConfigurationItem\n    meaning: A configuration item affected by the known error, helping assess candidate workaround relevance."
}
```

### Turn 36 — tool

Applied. Added 4, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 36 — assistant

I’ve added the confirmed **Incident → Problem → KnownError → Workaround → Runbook** path, plus the known error’s affected configuration item. I also narrowed the recorded runbook question to finding a **traceable candidate where that path exists**. It does not promise a candidate for every incident or authorize use.

For assessment and reporting, how does an **Incident** connect to its **MaterialityAssessment**, how does an assessment leading to reporting connect to a **RegulatoryNotification**, and how does the notification identify its **Regulator**? Please give the verbs and directions you use; a reporting conclusion must remain distinct from a submitted notification.

### Turn 37 — user

I’d record these connections:

- **Incident → is evaluated by → materiality assessment.** The assessment records the conclusion and rationale.
- **Materiality assessment → triggers → regulatory notification** when the assessment calls for reporting. A reportable conclusion does not mean the notification has been submitted.
- **Regulatory notification → is sent to → regulator.** The notification also **reports → incident**, so the formal submission identifies the case it concerns.

Before submission, the assessment must conclude **reportable**, the notification must be linked to both the incident and regulator, its required information and supporting evidence must be complete, and it must be approved. Submission and its receipt are then recorded separately.

### Turn 37 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isEvaluatedBy\n    from: Incident\n    to: MaterialityAssessment\n    meaning: The materiality assessment recording the incident's significance, rationale, and reporting implication.\n  - name: triggers\n    from: MaterialityAssessment\n    to: RegulatoryNotification\n    meaning: The notification called for by a reportable assessment; triggering does not mean it was approved or submitted.\n  - name: isSentTo\n    from: RegulatoryNotification\n    to: Regulator\n    meaning: The receiving regulatory authority specified for this notification.\n  - name: reports\n    from: RegulatoryNotification\n    to: Incident\n    meaning: The incident that this formal regulatory notification concerns."
}
```

### Turn 37 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 37 — assistant

I’ve recorded those four connections. The assessment can trigger a notification without implying approval, submission, or receipt; the notification separately identifies both its incident and regulator.

For closure, how does an **Incident** connect to its **Communications**, **EvidenceItems**, and **PostIncidentReview**, and how does a **Communication** identify its **Stakeholder** recipient? Please give the verb and direction for each connection, including whether a review link can exist while the review is only scheduled.

### Turn 38 — user

I’d record four connections:

- **Incident → is communicated through → communication.** Check the communication’s status and delivery record to establish whether a required message is complete.
- **Incident → is supported by → evidence item.** The linked items must substantiate resolution and restoration for closure.
- **Incident → is reviewed in → post-incident review.**
- **Communication → is addressed to → stakeholder.**

The review link can exist while the review is **scheduled**; it does not mean the review has been held. For a major or cybersecurity incident, closure requires a review that is scheduled or completed. The review’s *held-on* date records when it actually took place, not a scheduled date.

### Turn 38 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isCommunicatedThrough\n    from: Incident\n    to: Communication\n    meaning: A communication about the incident whose completion must be checked separately.\n  - name: isSupportedBy\n    from: Incident\n    to: EvidenceItem\n    meaning: An evidence item documenting the incident, including its resolution or restoration.\n  - name: isReviewedIn\n    from: Incident\n    to: PostIncidentReview\n    meaning: A review linked to the incident, including one scheduled but not yet held.\n  - name: isAddressedTo\n    from: Communication\n    to: Stakeholder\n    meaning: The identifiable intended recipient of the communication."
}
```

### Turn 38 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 38 — assistant

I’ve recorded the four closure connections. A linked review may still be only scheduled; its held-on date will not stand in for its scheduled date.

For the **execute emergency change** action, how does an **EmergencyChange** connect to the **Incident** it addresses and the **ConfigurationItems** it will affect? Are its implementation plan, backout plan, and risk acceptance values on that change, or separate records the agent must identify? Please give your verbs and directions for any connections.

### Turn 39 — user

I’d record **emergency change → is justified by → incident**. The incident must be active before the emergency change is executed.

An emergency change is an accelerated change, so I would also record **emergency change → modifies → configuration item** for the affected items. That does not require a second, general-change record.

The **implementation plan** and **backout plan** are text on the change, not separate records here. Its **risk level** is recorded on the change, but a risk level is not the same as **explicit risk acceptance**. Acceptance must be verified before execution; I would not invent a dedicated acceptance field or approving role that we have not established.

### Turn 39 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isJustifiedBy\n    from: EmergencyChange\n    to: Incident\n    meaning: The active incident that justifies execution of the emergency change.\n  - name: modifies\n    from: EmergencyChange\n    to: ConfigurationItem\n    meaning: A configuration item intended to be modified by the emergency change."
}
```

### Turn 39 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 39 — assistant

I’ve recorded **EmergencyChange → is justified by → Incident** and **EmergencyChange → modifies → ConfigurationItem**. We’ll treat implementation and backout plans as text on the change, and keep risk level distinct from externally verified risk acceptance.

One relationship gap remains in the **contain incident** action: what real connection records *what was contained*? Does containment act on the incident as a whole, or on an affected configuration item or IT service, and is there a separate connection the agent must navigate?

### Turn 40 — user

**Contain incident** is an action on the **incident**. Its preconditions require the containment scope and expected side effects to be recorded; approved steps are then executed, and the incident moves to **contained** only after containment is verified.

The scope may concern an affected configuration item or IT service, but I would use the existing **incident → affects → configuration item** and **incident → impacts → IT service** connections to establish those objects. There is no separate “contains” or “was contained by” connection to add. If the intended step is specifically to disconnect a configuration item from networks or dependencies, that is the more specific **isolate configuration item** action, with its own checks.

### Turn 40 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 40 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: Which alerts and events are correlated with an incident?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: Which configuration items are affected by an incident?
  - id: cq5
    text: Who owns an affected IT service?
  - id: cq6
    text: "Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?"
  - id: cq7
    text: Which on-call engineer should handle the incident response?
  - id: cq8
    text: Does an incident warrant major-incident coordination?
  - id: cq9
    text: "Has a materiality assessment been completed for an incident, and what did it conclude?"
  - id: cq10
    text: "Which runbook is a traceable candidate for handling an incident, where an applicable known-error workaround documents one?"
  - id: cq11
    text: "Which workaround could temporarily reduce or bypass an incident's impact?"
  - id: cq12
    text: What does a candidate backup protect?
  - id: cq13
    text: Which backup set does the recovery plan for an affected IT service use?
  - id: cq14
    text: Which recovery plan applies to an affected IT service?
  - id: cq15
    text: What resolution and restoration evidence is required to close an incident?
  - id: cq16
    text: "Are all impacted services healthy, or is their residual condition accepted for incident closure?"
  - id: cq17
    text: Have required stakeholder communications been completed before incident closure?
  - id: cq18
    text: "For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
  - id: cq19
    text: "What environment is an affected IT service or configuration item in, and is the supplied failover target suitable?"
  - id: cq20
    text: Who is the incident commander for a major incident?
classes:
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence.
    aliases: []
    properties: {}
  ITService:
    meaning: "A managed technology capability whose impact, owner, and recovery arrangements need to be established."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A customer- or business-facing capability that may be affected by an incident.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: "A way customers access a business service, distinct from the service itself."
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component in configuration-management scope that may be directly affected by an incident.
    aliases: []
    properties: {}
  Environment:
    meaning: "A deployment context for an IT service or configuration item, including a possible failover target."
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The actor accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: The team assigned to diagnose and restore an incident within its area of support.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group who may handle a time-critical incident response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "The actor who commands a major incident's coordination and decision cadence."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: "A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it."
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan describing how to restore an IT service and its dependencies.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.
    aliases:
      - backup
    properties: {}
  MaterialityAssessment:
    meaning: "A record of an incident's significance, rationale, and reporting implication."
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
    aliases: []
    properties: {}
  Communication:
    meaning: A record of a message to an appropriate audience concerning an incident or its response.
    aliases:
      - stakeholder communication
    properties: {}
  PostIncidentReview:
    meaning: "A structured review of an incident's causes, response, lessons, and follow-up work."
    aliases: []
    properties: {}
  EmergencyChange:
    meaning: An accelerated change executed as part of an incident response.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "A preserved record or artifact documenting an incident, including support for resolution or restoration."
    aliases:
      - incident evidence
    properties: {}
  Stakeholder:
    meaning: An identifiable recipient of a communication about an incident or its response.
    aliases: []
    properties: {}
  Regulator:
    meaning: The receiving authority for a regulatory notification.
    aliases: []
    properties: {}
  Problem:
    meaning: The underlying or potential cause of one or more incidents.
    aliases: []
    properties: {}
  KnownError:
    meaning: A diagnosed problem with a documented cause or workaround.
    aliases: []
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: An IT service established as impacted by this incident.
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "A configuration item directly affected by this incident, rather than merely on a dependency path."
    aliases: []
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "A business service established as impacted by this incident, not just dependent on an impacted IT service."
    aliases: []
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.
    aliases: []
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption.
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: "The observed occurrence indicated by the alert, without automatically correlating it to an incident."
    aliases: []
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: The alert that prompted the managed incident response after triage.
    aliases: []
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: An observed event established as correlated with the incident during investigation.
    aliases: []
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.
    aliases: []
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support."
    aliases: []
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer who actually handles this incident, independent of group membership."
    aliases: []
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: The incident commander assigned to coordinate the incident; assignment precedes and does not itself constitute a major-incident declaration.
    aliases: []
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: The IT service that this recovery plan is designed to restore.
    aliases: []
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "The recovery plan actually used for the incident, distinct from plans merely applicable to affected services."
    aliases: []
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set specified for use by the recovery plan.
    aliases: []
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item protected by this backup set; protection alone does not authorize a restore.
    aliases: []
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is currently deployed.
    aliases: []
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: The deployment environment to which the configuration item belongs.
    aliases: []
  - name: isHandledWith
    from: Incident
    to: Runbook
    meaning: "The runbook actually used to handle the incident, not necessarily every runbook that might be suitable."
    aliases: []
  - name: isDocumentedIn
    from: Workaround
    to: Runbook
    meaning: The maintained runbook documenting the workaround.
    aliases: []
  - name: isLinkedTo
    from: Incident
    to: Problem
    meaning: A problem linked to the incident as an underlying or potential cause.
    aliases: []
  - name: isDocumentedBy
    from: Problem
    to: KnownError
    meaning: The known error documenting a diagnosed problem.
    aliases: []
  - name: has
    from: KnownError
    to: Workaround
    meaning: "A workaround documented for the known error, not an automatic authorization to apply it."
    aliases: []
  - name: affects
    from: KnownError
    to: ConfigurationItem
    meaning: "A configuration item affected by the known error, helping assess candidate workaround relevance."
    aliases: []
  - name: isEvaluatedBy
    from: Incident
    to: MaterialityAssessment
    meaning: "The materiality assessment recording the incident's significance, rationale, and reporting implication."
    aliases: []
  - name: triggers
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The notification called for by a reportable assessment; triggering does not mean it was approved or submitted.
    aliases: []
  - name: isSentTo
    from: RegulatoryNotification
    to: Regulator
    meaning: The receiving regulatory authority specified for this notification.
    aliases: []
  - name: reports
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that this formal regulatory notification concerns.
    aliases: []
  - name: isCommunicatedThrough
    from: Incident
    to: Communication
    meaning: A communication about the incident whose completion must be checked separately.
    aliases: []
  - name: isSupportedBy
    from: Incident
    to: EvidenceItem
    meaning: "An evidence item documenting the incident, including its resolution or restoration."
    aliases: []
  - name: isReviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: "A review linked to the incident, including one scheduled but not yet held."
    aliases: []
  - name: isAddressedTo
    from: Communication
    to: Stakeholder
    meaning: The identifiable intended recipient of the communication.
    aliases: []
  - name: isJustifiedBy
    from: EmergencyChange
    to: Incident
    meaning: The active incident that justifies execution of the emergency change.
    aliases: []
  - name: modifies
    from: EmergencyChange
    to: ConfigurationItem
    meaning: A configuration item intended to be modified by the emergency change.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 40 — assistant

Agreed. **Contain incident** acts on the incident; its scope can be checked through the affected service and configuration-item links already recorded. I won’t add a containment relationship. I’ll leave **isolate configuration item** outside the ten-action scope unless we explicitly take it up later.

One path still needs clarification: the recorded question asks which **customer channels are affected**, but **Business service → is delivered through → Customer channel** only shows which channels to assess, not which are disrupted. How is a channel’s actual impact established for an incident—by a separately confirmed fact, or by a check performed outside these recorded connections?

### Turn 41 — user

It takes a **separate impact check**; the recorded connections do not establish actual channel disruption. From an incident that impacts a business service, the agent can find the customer channels through which that service is delivered and identify them as **channels to assess**. It must not label them affected solely on that path.

I’d narrow the recorded question to: **“Which customer channels deliver an impacted business service, and which of those have confirmed disruption?”** The second part needs verified operational information supplied by the impact assessment; there is no direct incident-to-channel impact connection in our current scope.

### Turn 41 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - id: cq1\n    text: Which business services are impacted by an incident?\n  - text: Which customer channels deliver an impacted business service, and which of those have confirmed disruption?"
}
```

### Turn 41 — tool

Applied. Added 1, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 41 — assistant

I’ve split the question on the canvas: one asks which **business services are impacted**, and the other asks which of their **customer channels have confirmed disruption**. The delivery link identifies channels to assess; verified impact information decides which are actually disrupted.

Before leaving the connection phase, one similar distinction remains. **Incident → assigned resolver group → member engineer** finds group members, while **Incident → is handled by → on-call engineer** records who actually handled it. For the question “Which on-call engineer should handle the incident response?”, how is the engineer **currently on call** identified before handling begins—is that checked through a duty arrangement outside these connections?

### Turn 42 — user

Yes. **Group membership alone does not tell us who is currently on call.** Before assigning a time-critical response, check the current duty arrangement for the suitable resolver group; that arrangement is outside the connections we have recorded.

Once an engineer takes the case, **incident → is handled by → on-call engineer** records actual handling. I’d phrase the question as: **“For the proposed supporting resolver group, who is currently on call, and who actually handles the incident?”** The first answer needs the current duty arrangement; the second comes from the incident link.

### Turn 42 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 42 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which alerts and events are correlated with an incident?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: Which configuration items are affected by an incident?
  - id: cq5
    text: Who owns an affected IT service?
  - id: cq6
    text: "Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?"
  - id: cq7
    text: Which on-call engineer should handle the incident response?
  - id: cq8
    text: Does an incident warrant major-incident coordination?
  - id: cq9
    text: "Has a materiality assessment been completed for an incident, and what did it conclude?"
  - id: cq10
    text: "Which runbook is a traceable candidate for handling an incident, where an applicable known-error workaround documents one?"
  - id: cq11
    text: "Which workaround could temporarily reduce or bypass an incident's impact?"
  - id: cq12
    text: What does a candidate backup protect?
  - id: cq13
    text: Which backup set does the recovery plan for an affected IT service use?
  - id: cq14
    text: Which recovery plan applies to an affected IT service?
  - id: cq15
    text: What resolution and restoration evidence is required to close an incident?
  - id: cq16
    text: "Are all impacted services healthy, or is their residual condition accepted for incident closure?"
  - id: cq17
    text: Have required stakeholder communications been completed before incident closure?
  - id: cq18
    text: "For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
  - id: cq19
    text: "What environment is an affected IT service or configuration item in, and is the supplied failover target suitable?"
  - id: cq20
    text: Who is the incident commander for a major incident?
  - id: cq21
    text: "Which customer channels deliver an impacted business service, and which of those have confirmed disruption?"
classes:
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
    properties: {}
  Alert:
    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence.
    aliases: []
    properties: {}
  ITService:
    meaning: "A managed technology capability whose impact, owner, and recovery arrangements need to be established."
    aliases: []
    properties: {}
  BusinessService:
    meaning: A customer- or business-facing capability that may be affected by an incident.
    aliases: []
    properties: {}
  CustomerChannel:
    meaning: "A way customers access a business service, distinct from the service itself."
    aliases: []
    properties: {}
  ConfigurationItem:
    meaning: A managed component in configuration-management scope that may be directly affected by an incident.
    aliases: []
    properties: {}
  Environment:
    meaning: "A deployment context for an IT service or configuration item, including a possible failover target."
    aliases: []
    properties: {}
  ServiceOwner:
    meaning: The actor accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  ResolverGroup:
    meaning: The team assigned to diagnose and restore an incident within its area of support.
    aliases: []
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group who may handle a time-critical incident response.
    aliases: []
    properties: {}
  IncidentCommander:
    meaning: "The actor who commands a major incident's coordination and decision cadence."
    aliases: []
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases: []
    properties: {}
  Workaround:
    meaning: "A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it."
    aliases: []
    properties: {}
  RecoveryPlan:
    meaning: A plan describing how to restore an IT service and its dependencies.
    aliases: []
    properties: {}
  BackupSet:
    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.
    aliases:
      - backup
    properties: {}
  MaterialityAssessment:
    meaning: "A record of an incident's significance, rationale, and reporting implication."
    aliases: []
    properties: {}
  RegulatoryNotification:
    meaning: "A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
    aliases: []
    properties: {}
  Communication:
    meaning: A record of a message to an appropriate audience concerning an incident or its response.
    aliases:
      - stakeholder communication
    properties: {}
  PostIncidentReview:
    meaning: "A structured review of an incident's causes, response, lessons, and follow-up work."
    aliases: []
    properties: {}
  EmergencyChange:
    meaning: An accelerated change executed as part of an incident response.
    aliases: []
    properties: {}
  EvidenceItem:
    meaning: "A preserved record or artifact documenting an incident, including support for resolution or restoration."
    aliases:
      - incident evidence
    properties: {}
  Stakeholder:
    meaning: An identifiable recipient of a communication about an incident or its response.
    aliases: []
    properties: {}
  Regulator:
    meaning: The receiving authority for a regulatory notification.
    aliases: []
    properties: {}
  Problem:
    meaning: The underlying or potential cause of one or more incidents.
    aliases: []
    properties: {}
  KnownError:
    meaning: A diagnosed problem with a documented cause or workaround.
    aliases: []
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: An IT service established as impacted by this incident.
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "A configuration item directly affected by this incident, rather than merely on a dependency path."
    aliases: []
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "A business service established as impacted by this incident, not just dependent on an impacted IT service."
    aliases: []
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.
    aliases: []
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption.
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: "The observed occurrence indicated by the alert, without automatically correlating it to an incident."
    aliases: []
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: The alert that prompted the managed incident response after triage.
    aliases: []
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: An observed event established as correlated with the incident during investigation.
    aliases: []
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.
    aliases: []
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support."
    aliases: []
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer who actually handles this incident, independent of group membership."
    aliases: []
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: The incident commander assigned to coordinate the incident; assignment precedes and does not itself constitute a major-incident declaration.
    aliases: []
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: The IT service that this recovery plan is designed to restore.
    aliases: []
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "The recovery plan actually used for the incident, distinct from plans merely applicable to affected services."
    aliases: []
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set specified for use by the recovery plan.
    aliases: []
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item protected by this backup set; protection alone does not authorize a restore.
    aliases: []
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is currently deployed.
    aliases: []
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: The deployment environment to which the configuration item belongs.
    aliases: []
  - name: isHandledWith
    from: Incident
    to: Runbook
    meaning: "The runbook actually used to handle the incident, not necessarily every runbook that might be suitable."
    aliases: []
  - name: isDocumentedIn
    from: Workaround
    to: Runbook
    meaning: The maintained runbook documenting the workaround.
    aliases: []
  - name: isLinkedTo
    from: Incident
    to: Problem
    meaning: A problem linked to the incident as an underlying or potential cause.
    aliases: []
  - name: isDocumentedBy
    from: Problem
    to: KnownError
    meaning: The known error documenting a diagnosed problem.
    aliases: []
  - name: has
    from: KnownError
    to: Workaround
    meaning: "A workaround documented for the known error, not an automatic authorization to apply it."
    aliases: []
  - name: affects
    from: KnownError
    to: ConfigurationItem
    meaning: "A configuration item affected by the known error, helping assess candidate workaround relevance."
    aliases: []
  - name: isEvaluatedBy
    from: Incident
    to: MaterialityAssessment
    meaning: "The materiality assessment recording the incident's significance, rationale, and reporting implication."
    aliases: []
  - name: triggers
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The notification called for by a reportable assessment; triggering does not mean it was approved or submitted.
    aliases: []
  - name: isSentTo
    from: RegulatoryNotification
    to: Regulator
    meaning: The receiving regulatory authority specified for this notification.
    aliases: []
  - name: reports
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that this formal regulatory notification concerns.
    aliases: []
  - name: isCommunicatedThrough
    from: Incident
    to: Communication
    meaning: A communication about the incident whose completion must be checked separately.
    aliases: []
  - name: isSupportedBy
    from: Incident
    to: EvidenceItem
    meaning: "An evidence item documenting the incident, including its resolution or restoration."
    aliases: []
  - name: isReviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: "A review linked to the incident, including one scheduled but not yet held."
    aliases: []
  - name: isAddressedTo
    from: Communication
    to: Stakeholder
    meaning: The identifiable intended recipient of the communication.
    aliases: []
  - name: isJustifiedBy
    from: EmergencyChange
    to: Incident
    meaning: The active incident that justifies execution of the emergency change.
    aliases: []
  - name: modifies
    from: EmergencyChange
    to: ConfigurationItem
    meaning: A configuration item intended to be modified by the emergency change.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 42 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - id: cq7\n    text: For the proposed supporting resolver group, who is currently on call, and who actually handles the incident?"
}
```

### Turn 42 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 42 — assistant

I’ve updated the engineer question. The current duty arrangement identifies who is on call for a proposed supporting group; **Incident → is handled by → On-call engineer** records who actually handles the case. Group membership alone answers neither.

I’ve checked the live canvas: all confirmed classes, including the later-added **Problem** and **KnownError**, have connections. The paths also preserve the distinctions we discussed—candidate versus used runbook, suitable versus assigned responder, and delivered-through versus disrupted channel.

**Does that accurately capture the connections for the current scope before we move to decision-relevant properties?**

### Turn 43 — user

Yes, that captures the connections for the current scope. The important boundary is that a connection does not always establish the decision: channel disruption, resolver-group support, the current on-call engineer, runbook suitability, and a proposed failover target each need the separate checks or inputs we identified.

We can move to the properties that let the agent make and verify those decisions.

### Turn 43 — assistant

The connection phase is confirmed. We’ll add values only where a recorded question or action needs them, and keep the separate external checks you identified.

Starting with **Incident**, I propose these decision-bearing properties:

- **status** — to check whether it is active before an emergency change, verify containment, and prevent premature closure.
- **major-incident designation** and **declaration time** — to verify declaration and apply major-incident coordination and review checks.
- **cybersecurity-incident designation** — to apply the evidence-preservation, assessment, and review checks without creating another incident record.

Does each belong on the incident, and what names would you use for them?

### Turn 44 — user

Yes. **Status** belongs on the incident and governs checks such as whether it can be contained or closed.

For the other two, I’d call them the **major-incident designation** and **cybersecurity-incident designation**. In this scoped model they distinguish the same incident case, rather than creating duplicate cases. Record the **major-incident declaration time** when the designation is made; an assigned commander alone is not a declaration.

I would not assume a separate declaration time for the cybersecurity designation.

### Turn 44 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n      majorIncidentDesignation:\n        type: boolean\n      cybersecurityIncidentDesignation:\n        type: boolean\n      majorIncidentDeclarationTime:\n        type: date"
}
```

### Turn 44 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 44 — assistant

I’ve recorded those four incident properties under your terms. The commander link remains separate from the major-incident designation, and there is no cybersecurity declaration-time field.

For the **contain incident** action, you said its scope and expected side effects must be recorded before execution. Should **containment scope** and **expected containment side effects** be text properties on Incident, or are they supplied only when the action is proposed? What names would you use?

### Turn 45 — user

They must be **recorded before containment is executed**, but I would not add them as defined properties of every incident. I’d call them **containment scope** and **expected side effects**.

They can be supplied with the proposed containment action, then recorded with that decision before execution. The incident’s affected-service and affected-configuration-item links help define the scope, but do not replace an explicit account of what the containment step will do and what else it may affect.

### Turn 45 — assistant

Understood. **Containment scope** and **expected side effects** are required for a proposed containment decision, but they are not standing properties of every Incident. I won’t add them as incident fields. When we define the action, we’ll need a way to verify that the supplied decision was recorded before execution.

For the closure question **“Are all impacted services healthy, or is their residual condition accepted for incident closure?”**, does each **IT service** need a current **health status**, and where is acceptance of a residual condition recorded—on the incident, on the service, or as an external closure check? What names would you use?

### Turn 46 — user

Yes. Each impacted **IT service** needs a current **health state** so we can check whether it is healthy at closure.

An **accepted residual condition** is a closure decision about remaining impact, not the service’s normal health state. I would verify that acceptance as part of the closure check, rather than add a standing acceptance field to every incident or service. Do not treat a merely degraded health state as accepted without that explicit decision.

### Turn 46 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ITService:\n    properties:\n      healthState:\n        type: text"
}
```

### Turn 46 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 46 — assistant

I’ve recorded **health state** on IT service. A degraded state alone will not count as an accepted residual condition; that acceptance remains an explicit closure check.

Two other current-state checks arise from the recorded questions and actions: whether a **customer channel** has confirmed disruption, and whether a proposed **environment** is available for failover. Should either be a current-state property on that class, or should both be verified from operational information when the decision is made? What names would you use if they are properties?

### Turn 47 — user

Verify **both from current operational information when needed**; I would not add standing properties for them in this scope.

For a channel, establish **confirmed disruption** for this incident. A general channel status could be misleading if it does not reflect the particular service and incident being assessed. For failover, establish **target-environment availability** at the time of the proposed move. Neither check follows just from the existing delivery or deployment connections.

### Turn 47 — assistant

I’ll leave both as decision-time checks: **confirmed channel disruption for this incident** and **availability of the supplied failover target at the time of the move**. Neither follows from the connections alone.

For three records with explicit state-dependent tasks, do these properties belong on them, and are these your names?

- **Alert — acknowledgement status**, to verify “acknowledge alert.”
- **Materiality assessment — completion status, conclusion, and rationale**, to answer what the assessment concluded and check a proposed notification.
- **Post-incident review — status, scheduled date, and held-on date**, to distinguish scheduled from completed at closure.

### Turn 48 — user

I’d adjust that list rather than record it as written:

- **Alert — status**, not “acknowledgement status.” Acknowledged is one possible status; after the action, check the status and recorded acknowledgement time.
- **Materiality assessment — result, rationale, and assessed-at time.** I would not add a separate completion-status field. Check the recorded assessment and its result; a result of *undetermined* is not a reporting conclusion.
- **Post-incident review — held-on date** records when the review actually took place. I would not add a review status or scheduled-date property in this scope. For closure, verify a scheduled review through the review arrangements; a link to the review alone does not prove it is scheduled, and a held-on date does not represent a future booking.

### Turn 48 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    properties:\n      status:\n        type: text\n      acknowledgementTime:\n        type: date\n  MaterialityAssessment:\n    properties:\n      result:\n        type: text\n      rationale:\n        type: text\n      assessedAt:\n        type: date\n  PostIncidentReview:\n    properties:\n      heldOn:\n        type: date"
}
```

### Turn 48 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 48 — assistant

I’ve recorded your revised fields. An alert’s status and acknowledgement time verify acknowledgement; an assessment’s result, rationale, and assessed-at time establish its conclusion; and a review’s held-on date records an actual meeting, not a booking. Scheduling will be checked through the review arrangements.

For **RegulatoryNotification** and **Communication**, which record-level values does the agent need to check before sending, and which values confirm submission or delivery afterward? In particular, should approval, completeness, submission/receipt, communication status, and delivery evidence be properties on those records or checks against external records—and what names do you use?

### Turn 49 — user

I’d put the **record’s state and timing** on the record, but keep supporting checks and artifacts distinct.

- **Regulatory notification:** use **status**, **due time**, and **submitted time**. Before submission, status must be *approved*; check separately that the linked assessment says *reportable*, the incident and regulator are identified, and required information and supporting evidence are complete. Afterward, record *submitted* status and the submission time, retain the receipt, and confirm acceptance—or record rejection and the work needed to remedy it. I would not invent a separate receipt or completeness field.
- **Communication:** use **audience**, **message summary**, **status**, and **sent time**. Before sending, the audience, message, owner, and approval state must be recorded, and the content must match the latest verified incident state. After sending, timestamp it, confirm delivery status, and archive the final message. The owner check, delivery evidence, and archived message need not become additional standing properties of the communication in this scope.

Approval is reflected in each record’s **status**; neither approval nor a sent or submitted timestamp alone proves successful delivery or acceptance.

### Turn 49 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  RegulatoryNotification:\n    properties:\n      status:\n        type: text\n      dueTime:\n        type: date\n      submittedTime:\n        type: date\n  Communication:\n    properties:\n      audience:\n        type: text\n      messageSummary:\n        type: text\n      status:\n        type: text\n      sentTime:\n        type: date"
}
```

### Turn 49 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 49 — assistant

I’ve recorded the notification’s **status, due time, and submitted time**, and the communication’s **audience, message summary, status, and sent time**. Receipt, acceptance, delivery, archived content, and supporting evidence remain separate checks; timestamps alone do not prove them.

For **EmergencyChange**, the execute action needs its **implementation plan**, **backout plan**, and **risk level**. Should it also have a current **status** to verify execution, and what names would you use for these properties? Explicit risk acceptance will remain a separate check, not a value inferred from risk level.

### Turn 50 — user

Yes. Record **status**, **risk level**, **implementation plan**, and **backout plan** on the emergency change. Status lets us distinguish a proposed change from one being implemented or already implemented, failed, or rolled back, and verify the update after execution.

The risk level describes the assessed risk; it does **not** establish explicit risk acceptance. Before execution, we still check that acceptance separately, along with the incident link and affected configuration items. Afterward, verify the technical result and service health, and retain implementation evidence.

### Turn 50 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  EmergencyChange:\n    properties:\n      status:\n        type: text\n      riskLevel:\n        type: text\n      implementationPlan:\n        type: text\n      backoutPlan:\n        type: text"
}
```

### Turn 50 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 50 — assistant

I’ve recorded those four emergency-change properties. Execution will still require separate risk acceptance, and verification must check the technical result, affected service health, and implementation evidence.

For the remaining recovery decisions, do these proposed properties belong on their respective records, and are these your names?

- **Backup set — recoverable point**, to check whether a proposed data restore meets the approved restore point.
- **Recovery plan — plan status**, to check that the plan proposed for failover is usable.
- **Evidence item — evidence purpose and integrity state**, to distinguish resolution from restoration support and check preservation, especially for a cybersecurity incident.

### Turn 51 — user

I would not add those three proposed fields as written.

- **Backup set:** record its **status**, **last successful backup**, and **last verification**. Whether it meets an *approved restore point* is a check for the proposed restore, not a standing “recoverable point” property. The backup must also protect the target.
- **Recovery plan:** there is no defined **plan status**. Its **recovery time objective**, **recovery point objective**, and **last review date** are useful context, but failover still requires a check that the plan applies, the supplied target environment is available, and the data-recovery point is acceptable.
- **Evidence item:** use **integrity status**, **collected-at time**, and, where relevant, a **cryptographic hash**. There is no defined “evidence purpose” field. To close the incident, examine what the linked items actually substantiate—resolution and restoration are distinct checks, not distinct evidence types.

### Turn 51 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  BackupSet:\n    properties:\n      status:\n        type: text\n      lastSuccessfulBackup:\n        type: date\n      lastVerification:\n        type: date\n  EvidenceItem:\n    properties:\n      integrityStatus:\n        type: text\n      collectedAt:\n        type: date\n      cryptographicHash:\n        type: text"
}
```

### Turn 51 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 51 — assistant

I’ve recorded the backup set’s status and backup/verification times, and the evidence item’s integrity and collection details, with a cryptographic hash where relevant. I have **not** added a recoverable-point, evidence-purpose, or plan-status field. Restore-point suitability and what evidence substantiates remain checks on the proposed action or closure.

You mentioned a recovery plan’s **recovery time objective, recovery point objective, and last review date** as useful context. Which of our accepted failover or restore decisions would use **each** value, and how? I’ll add only the ones that drive a check or explanation.

### Turn 52 — user

I’d retain all three as **decision context**, but not turn any of them into an automatic pass/fail rule:

- **Recovery time objective** helps explain whether the proposed failover is likely to restore the IT service within its planned recovery timeframe. The failover preconditions do not specify a numeric timing gate.
- **Recovery point objective** helps assess the proposed failover’s data-recovery point. For a backup restore, it also provides context, but the restore point and target environment must be approved for that restore; the objective alone is not approval.
- **Last review date** helps the operator judge how current the plan is. There is no defined maximum age that blocks failover.

The governing procedure supplies any policy-dependent limits or acceptance decisions; I would not infer them from these fields alone.

### Turn 52 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  RecoveryPlan:\n    properties:\n      recoveryTimeObjective:\n        type: number\n      recoveryPointObjective:\n        type: number\n      lastReviewDate:\n        type: date"
}
```

### Turn 52 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 52 — assistant

I’ve recorded the recovery plan’s three values as **decision context**, not automatic gates. The units for the two objectives are still open; we’ll establish those before using numeric comparisons.

For the records the agent may track over time—**Problem, KnownError, Runbook, Workaround, and ConfigurationItem**—does any need its own current **status or state** to answer a recorded question or check one of the ten proposed actions? If so, please name the record, the state you use, and the specific decision it affects.

### Turn 53 — user

Of those five, I would retain **problem status**. It helps explain whether the underlying cause is still being investigated or has reached a known-error stage when the agent presents a candidate workaround. It is **not**, by itself, permission to use that workaround; the documented known error and the incident’s circumstances still need checking.

I would not add a current status to **known error, runbook, workaround, or configuration item** for the accepted questions and actions. In particular, a runbook’s existence does not establish that it is suitable for this incident.

### Turn 53 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Problem:\n    properties:\n      status:\n        type: text"
}
```

### Turn 53 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 53 — assistant

I’ve recorded **Problem.status** to explain where cause investigation stands. It will not authorize a workaround. I’ve left status off KnownError, Runbook, Workaround, and ConfigurationItem for the current requirements.

For the **major-incident coordination** decision, what incident values—if any—does the agent need to compare or explain **before** declaration, beyond the affected-service and business-impact connections already recorded? Please name only values used in that decision, using your own terms.

### Turn 54 — user

The two incident values I would check before declaration are **status** and **severity**. The incident must not be resolved, closed, or cancelled, and its severity must be **critical (sev1)** or **high (sev2)**.

Separately, the agent must confirm at least one impacted IT service and an assigned incident commander. Those are connections we’ve already recorded, not additional incident values. I would not add a numeric business-impact threshold.

### Turn 54 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      severity:\n        type: text"
}
```

### Turn 54 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 54 — assistant

I’ve added **severity** to Incident. The declaration check can use status and severity, plus the already recorded impacted-IT-service and assigned-commander connections. I won’t add a numeric business-impact threshold.

One final current-state check for this properties pass: **BusinessService** is tracked for incident impact, but impact is currently recorded through **Incident → impacts → BusinessService**. Does the agent also need a current health or status value on the business service for any accepted question or action, or is the confirmed impact link plus the separate channel-disruption check sufficient?

### Turn 55 — user

I would add **health state** to business service. The **incident → impacts → business service** link establishes that the service is affected; its current health state tells us whether it has recovered. That matters when checking **all impacted services** before closure.

Neither the impact link nor a healthy business-service state establishes whether a particular customer channel had confirmed disruption. That remains a separate incident-specific check.

### Turn 55 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  BusinessService:\n    properties:\n      healthState:\n        type: text"
}
```

### Turn 55 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 55 — assistant

I’ve added **health state** to BusinessService. For closure, we’ll check both impacted IT services and business services; neither a healthy business service nor its impact link proves disruption of a particular customer channel.

That completes this properties pass: we’ve added values used for decisions or verification and left incident-specific checks, approvals, and operational availability outside standing fields where you asked us to. **Does that capture the property boundary correctly before we check terminology and fixed choices?**

### Turn 56 — user

Yes. The boundary is right: keep record values that support decisions or verification, but do not turn decision-time checks—such as risk acceptance, channel disruption, target availability, or an accepted residual condition—into standing fields without a defined need.

We can now check the names and complete allowed choices for the fields that have fixed values.

### Turn 56 — assistant

The property boundary is confirmed. Before fixed choices, there’s a short terminology check: every class and relationship already has a plain-language meaning, but we have only a few confirmed alternative names.

For these five central classes—**Incident, IT service, Business service, Configuration item, and Environment**—are there other terms people use for the *same thing* in your organization? Please give only true equivalents; a related but different concept should stay separate.

### Turn 57 — user

Yes, with some caution about context:

- **Incident:** “incident” is the preferred term; a **trouble ticket** may be used for its record, though not every ticket is an incident.
- **IT service:** “technology service” or, in Hungarian, *informatikai szolgáltatás*.
- **Business service:** *üzleti szolgáltatás*.
- **Configuration item:** **CI** or *konfigurációs elem*.
- **Environment:** *környezet*.

I would not treat an alert as an incident, a business service as an IT service, or an environment as a site.

### Turn 57 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ITService:\n    aliases: [technology service, informatikai szolgáltatás]\n  BusinessService:\n    aliases: [üzleti szolgáltatás]\n  ConfigurationItem:\n    aliases: [CI, konfigurációs elem]\n  Environment:\n    aliases: [környezet]"
}
```

### Turn 57 — tool

Applied. Added 0, updated 4 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 57 — assistant

I’ve added the confirmed equivalents for IT service, business service, configuration item, and environment. I did **not** add “trouble ticket” as an Incident alias because not every ticket is an incident; nor have I merged the distinct concepts you named.

For **Alert, Event, Resolver group, On-call engineer, and Incident commander**, are there any true alternative names used for each in your organization? “None” is fine for any of them.

### Turn 58 — user

Yes:

- **Alert:** *riasztás*.
- **Event:** *esemény*.
- **Resolver group:** “support group” or *megoldócsoport*.
- **On-call engineer:** “on-call” or *ügyeletes mérnök*.
- **Incident commander:** “incident manager,” “major-incident lead,” or *incidensparancsnok*.

“Incident manager” here means the person commanding and coordinating a major incident, not every person who works on an incident.

### Turn 58 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    aliases: [riasztás]\n  Event:\n    aliases: [esemény]\n  ResolverGroup:\n    aliases: [support group, megoldócsoport]\n  OnCallEngineer:\n    aliases: [on-call, ügyeletes mérnök]\n  IncidentCommander:\n    aliases: [incident manager, major-incident lead, incidensparancsnok]"
}
```

### Turn 58 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 58 — assistant

I’ve added those equivalents. In this model, “incident manager” means the **incident commander**, not any incident responder.

For the recovery terms **Runbook, Workaround, Recovery plan, Backup set, and Evidence item**, are there other names your staff use for exactly the same things? We already have “backup” for Backup set and “incident evidence” for Evidence item; please add only further true equivalents, if any.

### Turn 59 — user

The further equivalents I’d use are:

- **Runbook:** “playbook” or *üzemeltetési eljárás*.
- **Workaround:** *kerülőmegoldás*.
- **Recovery plan:** “DR plan” or *helyreállítási terv*.
- **Backup set:** *mentéskészlet*, in addition to “backup.”
- **Evidence item:** “evidence” or *bizonyíték*.

“Incident evidence” is understandable in context, but I’d keep **evidence item** as the record name; it can document an incident without being a separate kind of evidence.

### Turn 59 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Runbook:\n    aliases: [playbook, üzemeltetési eljárás]\n  Workaround:\n    aliases: [kerülőmegoldás]\n  RecoveryPlan:\n    aliases: [DR plan, helyreállítási terv]\n  BackupSet:\n    aliases: [backup, mentéskészlet]\n  EvidenceItem:\n    aliases: [incident evidence, evidence, bizonyíték]"
}
```

### Turn 59 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 59 — assistant

I’ve added those recovery and evidence equivalents, while keeping **Evidence item** as the preferred name.

For **Materiality assessment, Regulatory notification, Communication, Post-incident review, and Emergency change**, are there any other names staff use for the *same record*? “None” is fine for any item.

### Turn 60 — user

Yes:

- **Materiality assessment:** “reportability assessment” or *lényegességi értékelés*.
- **Regulatory notification:** “supervisory notification” or *felügyeleti bejelentés*.
- **Communication:** “notification” or *értesítés* or *tájékoztatás*—but an ordinary communication is not automatically a formal regulatory notification.
- **Post-incident review:** “PIR,” “RCA review,” or *incidens utóelemzés*.
- **Emergency change:** “emergency fix” or *sürgősségi változás*.

I’d use the preferred names when there is a risk of confusing a stakeholder message with a regulatory submission.

### Turn 60 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MaterialityAssessment:\n    aliases: [reportability assessment, lényegességi értékelés]\n  RegulatoryNotification:\n    aliases: [supervisory notification, felügyeleti bejelentés]\n  Communication:\n    aliases: [stakeholder communication, notification, értesítés, tájékoztatás]\n  PostIncidentReview:\n    aliases: [PIR, RCA review, incidens utóelemzés]\n  EmergencyChange:\n    aliases: [emergency fix, sürgősségi változás]"
}
```

### Turn 60 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 60 — assistant

Those equivalents are recorded. “Notification” can mean an ordinary communication here, so the preferred names will matter when distinguishing a stakeholder message from a formal regulatory submission.

For the remaining actor and investigation records—**Service owner, Customer channel, Stakeholder, Regulator, Problem, and Known error**—are there any true alternative names you use? “None” for any item is fine.

### Turn 61 — user

I’d use these equivalents:

- **Service owner:** *szolgáltatásgazda*.
- **Customer channel:** *ügyfélcsatorna*.
- **Stakeholder:** *érintett*.
- **Regulator:** “supervisory authority” or *felügyeleti hatóság*.
- **Problem:** *probléma*.
- **Known error:** *ismert hiba*.

I would not use “business owner” as an alias for service owner; those are different accountabilities.

### Turn 61 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ServiceOwner:\n    aliases: [szolgáltatásgazda]\n  CustomerChannel:\n    aliases: [ügyfélcsatorna]\n  Stakeholder:\n    aliases: [érintett]\n  Regulator:\n    aliases: [supervisory authority, felügyeleti hatóság]\n  Problem:\n    aliases: [probléma]\n  KnownError:\n    aliases: [ismert hiba]"
}
```

### Turn 61 — tool

Applied. Added 0, updated 6 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 61 — assistant

I’ve added those equivalents. **Business owner** is not an alias for Service owner.

The class terminology is covered. For the main **incident impact** connections, do staff use alternative verb phrases for any of these that mean the *same connection*, not a different level of impact?

- Incident **impacts** IT service
- Incident **affects** configuration item
- Incident **impacts** business service
- Business service **depends on** IT service
- Business service **is delivered through** customer channel

### Turn 62 — user

I’d keep those verbs as recorded; I don’t have separate established alternative phrases to add for them.

In particular, **“depends on”** is not an alternative to **“impacts”**: a business service can depend on an IT service without being confirmed as affected. Likewise, **“is delivered through”** identifies a customer channel to assess, not a confirmed channel disruption.

### Turn 62 — assistant

I’ll keep those verbs as recorded. Their distinctions matter: dependency is not confirmed impact, and delivery through a channel is not confirmed disruption.

For the **response** connections, are there established alternative verb phrases for any of these same facts: Incident **is assigned to** Resolver group; Incident **is handled by** On-call engineer; Incident **is coordinated by** Incident commander; Service owner **owns** IT service; On-call engineer **is member of** Resolver group? If not, “none” covers the batch.

### Turn 63 — user

None for that batch. I’d keep the recorded phrases. **Assigned to**, **handled by**, and **coordinated by** describe different responsibilities, so I would not use them interchangeably.

### Turn 63 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 63 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which alerts and events are correlated with an incident?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: Which configuration items are affected by an incident?
  - id: cq5
    text: Who owns an affected IT service?
  - id: cq6
    text: "Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?"
  - id: cq7
    text: "For the proposed supporting resolver group, who is currently on call, and who actually handles the incident?"
  - id: cq8
    text: Does an incident warrant major-incident coordination?
  - id: cq9
    text: "Has a materiality assessment been completed for an incident, and what did it conclude?"
  - id: cq10
    text: "Which runbook is a traceable candidate for handling an incident, where an applicable known-error workaround documents one?"
  - id: cq11
    text: "Which workaround could temporarily reduce or bypass an incident's impact?"
  - id: cq12
    text: What does a candidate backup protect?
  - id: cq13
    text: Which backup set does the recovery plan for an affected IT service use?
  - id: cq14
    text: Which recovery plan applies to an affected IT service?
  - id: cq15
    text: What resolution and restoration evidence is required to close an incident?
  - id: cq16
    text: "Are all impacted services healthy, or is their residual condition accepted for incident closure?"
  - id: cq17
    text: Have required stakeholder communications been completed before incident closure?
  - id: cq18
    text: "For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
  - id: cq19
    text: "What environment is an affected IT service or configuration item in, and is the supplied failover target suitable?"
  - id: cq20
    text: Who is the incident commander for a major incident?
  - id: cq21
    text: "Which customer channels deliver an impacted business service, and which of those have confirmed disruption?"
classes:
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
    properties:
      status:
        type: text
      majorIncidentDesignation:
        type: boolean
      cybersecurityIncidentDesignation:
        type: boolean
      majorIncidentDeclarationTime:
        type: date
      severity:
        type: text
  Alert:
    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.
    aliases:
      - riasztás
    properties:
      status:
        type: text
      acknowledgementTime:
        type: date
  Event:
    meaning: An observed occurrence.
    aliases:
      - esemény
    properties: {}
  ITService:
    meaning: "A managed technology capability whose impact, owner, and recovery arrangements need to be established."
    aliases:
      - technology service
      - informatikai szolgáltatás
    properties:
      healthState:
        type: text
  BusinessService:
    meaning: A customer- or business-facing capability that may be affected by an incident.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
  CustomerChannel:
    meaning: "A way customers access a business service, distinct from the service itself."
    aliases:
      - ügyfélcsatorna
    properties: {}
  ConfigurationItem:
    meaning: A managed component in configuration-management scope that may be directly affected by an incident.
    aliases:
      - CI
      - konfigurációs elem
    properties: {}
  Environment:
    meaning: "A deployment context for an IT service or configuration item, including a possible failover target."
    aliases:
      - környezet
    properties: {}
  ServiceOwner:
    meaning: The actor accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: The team assigned to diagnose and restore an incident within its area of support.
    aliases:
      - support group
      - megoldócsoport
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group who may handle a time-critical incident response.
    aliases:
      - on-call
      - ügyeletes mérnök
    properties: {}
  IncidentCommander:
    meaning: "The actor who commands a major incident's coordination and decision cadence."
    aliases:
      - incident manager
      - major-incident lead
      - incidensparancsnok
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - playbook
      - üzemeltetési eljárás
    properties: {}
  Workaround:
    meaning: "A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it."
    aliases:
      - kerülőmegoldás
    properties: {}
  RecoveryPlan:
    meaning: A plan describing how to restore an IT service and its dependencies.
    aliases:
      - DR plan
      - helyreállítási terv
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  BackupSet:
    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.
    aliases:
      - backup
      - mentéskészlet
    properties:
      status:
        type: text
      lastSuccessfulBackup:
        type: date
      lastVerification:
        type: date
  MaterialityAssessment:
    meaning: "A record of an incident's significance, rationale, and reporting implication."
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      result:
        type: text
      rationale:
        type: text
      assessedAt:
        type: date
  RegulatoryNotification:
    meaning: "A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      status:
        type: text
      dueTime:
        type: date
      submittedTime:
        type: date
  Communication:
    meaning: A record of a message to an appropriate audience concerning an incident or its response.
    aliases:
      - stakeholder communication
      - notification
      - értesítés
      - tájékoztatás
    properties:
      audience:
        type: text
      messageSummary:
        type: text
      status:
        type: text
      sentTime:
        type: date
  PostIncidentReview:
    meaning: "A structured review of an incident's causes, response, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
  EmergencyChange:
    meaning: An accelerated change executed as part of an incident response.
    aliases:
      - emergency fix
      - sürgősségi változás
    properties:
      status:
        type: text
      riskLevel:
        type: text
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  EvidenceItem:
    meaning: "A preserved record or artifact documenting an incident, including support for resolution or restoration."
    aliases:
      - incident evidence
      - evidence
      - bizonyíték
    properties:
      integrityStatus:
        type: text
      collectedAt:
        type: date
      cryptographicHash:
        type: text
  Stakeholder:
    meaning: An identifiable recipient of a communication about an incident or its response.
    aliases:
      - érintett
    properties: {}
  Regulator:
    meaning: The receiving authority for a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  Problem:
    meaning: The underlying or potential cause of one or more incidents.
    aliases:
      - probléma
    properties:
      status:
        type: text
  KnownError:
    meaning: A diagnosed problem with a documented cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: An IT service established as impacted by this incident.
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "A configuration item directly affected by this incident, rather than merely on a dependency path."
    aliases: []
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "A business service established as impacted by this incident, not just dependent on an impacted IT service."
    aliases: []
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.
    aliases: []
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption.
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: "The observed occurrence indicated by the alert, without automatically correlating it to an incident."
    aliases: []
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: The alert that prompted the managed incident response after triage.
    aliases: []
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: An observed event established as correlated with the incident during investigation.
    aliases: []
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.
    aliases: []
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support."
    aliases: []
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer who actually handles this incident, independent of group membership."
    aliases: []
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: The incident commander assigned to coordinate the incident; assignment precedes and does not itself constitute a major-incident declaration.
    aliases: []
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: The IT service that this recovery plan is designed to restore.
    aliases: []
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "The recovery plan actually used for the incident, distinct from plans merely applicable to affected services."
    aliases: []
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set specified for use by the recovery plan.
    aliases: []
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item protected by this backup set; protection alone does not authorize a restore.
    aliases: []
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is currently deployed.
    aliases: []
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: The deployment environment to which the configuration item belongs.
    aliases: []
  - name: isHandledWith
    from: Incident
    to: Runbook
    meaning: "The runbook actually used to handle the incident, not necessarily every runbook that might be suitable."
    aliases: []
  - name: isDocumentedIn
    from: Workaround
    to: Runbook
    meaning: The maintained runbook documenting the workaround.
    aliases: []
  - name: isLinkedTo
    from: Incident
    to: Problem
    meaning: A problem linked to the incident as an underlying or potential cause.
    aliases: []
  - name: isDocumentedBy
    from: Problem
    to: KnownError
    meaning: The known error documenting a diagnosed problem.
    aliases: []
  - name: has
    from: KnownError
    to: Workaround
    meaning: "A workaround documented for the known error, not an automatic authorization to apply it."
    aliases: []
  - name: affects
    from: KnownError
    to: ConfigurationItem
    meaning: "A configuration item affected by the known error, helping assess candidate workaround relevance."
    aliases: []
  - name: isEvaluatedBy
    from: Incident
    to: MaterialityAssessment
    meaning: "The materiality assessment recording the incident's significance, rationale, and reporting implication."
    aliases: []
  - name: triggers
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The notification called for by a reportable assessment; triggering does not mean it was approved or submitted.
    aliases: []
  - name: isSentTo
    from: RegulatoryNotification
    to: Regulator
    meaning: The receiving regulatory authority specified for this notification.
    aliases: []
  - name: reports
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that this formal regulatory notification concerns.
    aliases: []
  - name: isCommunicatedThrough
    from: Incident
    to: Communication
    meaning: A communication about the incident whose completion must be checked separately.
    aliases: []
  - name: isSupportedBy
    from: Incident
    to: EvidenceItem
    meaning: "An evidence item documenting the incident, including its resolution or restoration."
    aliases: []
  - name: isReviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: "A review linked to the incident, including one scheduled but not yet held."
    aliases: []
  - name: isAddressedTo
    from: Communication
    to: Stakeholder
    meaning: The identifiable intended recipient of the communication.
    aliases: []
  - name: isJustifiedBy
    from: EmergencyChange
    to: Incident
    meaning: The active incident that justifies execution of the emergency change.
    aliases: []
  - name: modifies
    from: EmergencyChange
    to: ConfigurationItem
    meaning: A configuration item intended to be modified by the emergency change.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 63 — assistant

I’ll keep those response verbs as recorded; **assigned to**, **handled by**, and **coordinated by** are not interchangeable.

The terminology pass is complete. I checked the live canvas: every class and relationship has a meaning sentence, and the confirmed alternative names are recorded. Neither of the two relationship batches produced additional aliases, so I won’t keep soliciting them. **Does that capture your terminology accurately before we define fixed choices and missing-or-wrong-value checks?**

### Turn 64 — user

Yes, that captures the terminology accurately. Keep the preferred terms and the distinctions between related concepts; we can move on to the fixed choices and the checks that apply when a required value is missing or invalid.

### Turn 64 — assistant

The terminology is confirmed. We’ll now define fixed choices, then check what should happen when each decision-bearing value is missing or wrong.

For this first batch, what are the complete allowed values for each property in your terms?

1. Incident **status**
2. Incident **severity**
3. Alert **status**
4. IT service **health state**
5. Business service **health state**
6. Materiality assessment **result**
7. Regulatory notification **status**
8. Communication **status**

If any list is governed by an external scheme that we have not defined, please say so rather than guessing its values.

### Turn 65 — user

These are the complete choices for those fields:

| Property | Allowed values |
|---|---|
| Incident status | new; acknowledged; investigating; contained; recovering; monitoring; resolved; closed; cancelled |
| Incident severity | sev1-critical; sev2-high; sev3-medium; sev4-low |
| Alert status | new; acknowledged; suppressed; escalated; closed |
| IT service health state | healthy; degraded; partially unavailable; unavailable; recovering; unknown |
| Business service health state | healthy; degraded; partially unavailable; unavailable; recovering; unknown |
| Materiality assessment result | not reportable; potentially reportable; reportable; undetermined |
| Regulatory notification status | draft; pending approval; approved; submitted; accepted; rejected; withdrawn |
| Communication status | draft; pending approval; approved; submitted; accepted; rejected; withdrawn |

These are controlled choices. They do not, on their own, authorize a transition or prove delivery—for example, an approved notification still needs the submission checks.

### Turn 65 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n        allowed: [new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled]\n      severity:\n        type: text\n        allowed: [sev1-critical, sev2-high, sev3-medium, sev4-low]\n  Alert:\n    properties:\n      status:\n        type: text\n        allowed: [new, acknowledged, suppressed, escalated, closed]\n  ITService:\n    properties:\n      healthState:\n        type: text\n        allowed: [healthy, degraded, partially unavailable, unavailable, recovering, unknown]\n  BusinessService:\n    properties:\n      healthState:\n        type: text\n        allowed: [healthy, degraded, partially unavailable, unavailable, recovering, unknown]\n  MaterialityAssessment:\n    properties:\n      result:\n        type: text\n        allowed: [not reportable, potentially reportable, reportable, undetermined]\n  RegulatoryNotification:\n    properties:\n      status:\n        type: text\n        allowed: [draft, pending approval, approved, submitted, accepted, rejected, withdrawn]\n  Communication:\n    properties:\n      status:\n        type: text\n        allowed: [draft, pending approval, approved, submitted, accepted, rejected, withdrawn]"
}
```

### Turn 65 — tool

Applied. Added 0, updated 7 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 65 — assistant

I’ve recorded all eight controlled lists. They define valid values, not permission to change state or proof that a message was delivered.

What are the complete allowed values for these remaining fixed-choice properties: **Backup set status, Evidence item integrity status, Emergency change status, Emergency change risk level, and Problem status**?

### Turn 66 — user

| Property | Allowed values |
|---|---|
| Backup set status | scheduled; running; successful; failed; expired; corrupted; verified |
| Evidence item integrity status | collected; hashed; verified; sealed; compromised |
| Emergency change status | draft; assessed; approved; scheduled; implementing; implemented; failed; rolled back; closed; cancelled |
| Emergency change risk level | low; medium; high; critical |
| Problem status | new; investigating; root cause known; known error; resolved; closed |

For an emergency change, **approved** status does not replace the separate check for explicit risk acceptance before execution.

### Turn 66 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  BackupSet:\n    properties:\n      status:\n        type: text\n        allowed: [scheduled, running, successful, failed, expired, corrupted, verified]\n  EvidenceItem:\n    properties:\n      integrityStatus:\n        type: text\n        allowed: [collected, hashed, verified, sealed, compromised]\n  EmergencyChange:\n    properties:\n      status:\n        type: text\n        allowed: [draft, assessed, approved, scheduled, implementing, implemented, failed, rolled back, closed, cancelled]\n      riskLevel:\n        type: text\n        allowed: [low, medium, high, critical]\n  Problem:\n    properties:\n      status:\n        type: text\n        allowed: [new, investigating, root cause known, known error, resolved, closed]"
}
```

### Turn 66 — tool

Applied. Added 0, updated 4 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 66 — assistant

I’ve recorded those five lists. **Emergency change: approved** will remain separate from explicit risk acceptance.

Before we check missing or invalid values, what **unit** do you use for each numeric recovery-plan objective—**recovery time objective** and **recovery point objective**? Are they both stored in the same unit?

### Turn 67 — user

Both are **time durations**, but this model does not prescribe a storage unit for either one or require them to use the same unit. Record the unit with each value, or normalize both to an agreed unit before comparing them.

I would not assume minutes or hours without the bank’s approved recovery procedure defining that convention.

### Turn 67 — assistant

I won’t assign minutes or hours to either objective. This canvas can specify a unit for a numeric property, but it cannot attach a different unit to each individual value. The two objectives are currently recorded as numbers **without** a prescribed unit, so a raw numeric comparison would be unsafe.

Should we keep them as numbers and require the bank’s recovery procedure to establish or normalize units before any comparison, or record each as text containing both duration and unit?

### Turn 68 — user

Keep both as **numbers**, and require the bank’s approved recovery procedure to establish their units or normalize them before any comparison. Do not compare the raw numbers when their units are unknown.

I would not change them to text: that would make consistent comparison harder without resolving the underlying unit convention.

### Turn 68 — assistant

I’ll keep both objectives numeric and leave their units unspecified. Any comparison must first use the bank’s approved procedure to establish or normalize the units; raw numbers must not be compared.

For these **Incident** properties, what should the agent do if each value is **missing or invalid**? A short answer for each is enough: **status, severity, major-incident designation, cybersecurity-incident designation, and major-incident declaration time**. In particular, should a missing designation mean “no,” or “not yet established”?

### Turn 69 — user

A missing designation means **not yet established**, not “no.” I’d handle the fields as follows:

- **Status:** If missing or invalid, establish the current state before any action whose preconditions depend on it—particularly containment, major-incident declaration, emergency-change execution, or closure.
- **Severity:** If missing or invalid, do not declare a major incident until a valid severity is established. Do not apply that declaration check as a blanket requirement for every incident record.
- **Major-incident designation:** If missing, do not assume the incident is or is not major. Confirm its classification; after declaration, verify the designation and declaration time.
- **Cybersecurity-incident designation:** If missing, establish whether the cybersecurity-specific evidence, assessment, and review checks apply. Do not skip them by treating missing as “no.”
- **Major-incident declaration time:** It is not expected before declaration. After declaration, a missing or invalid time means the declaration record needs correction; the assigned commander or designation alone does not verify when declaration occurred.

### Turn 69 — assistant

For Incident, missing designations mean **not yet established**, not “no.” Status and severity must be valid for decisions that use them; declaration time is required **after** declaration, not before. I’ll carry those conditions into the rules rather than invent a blanket requirement that every incident field must always be present.

For the next batch, what breaks or must be checked if each is missing or invalid: **Alert status and acknowledgement time; IT service health state; Business service health state; Materiality assessment result, rationale, and assessed-at time**? A brief answer per property is enough.

### Turn 70 — user

- **Alert status:** If missing or invalid, establish it before acknowledging; the action requires the alert to be **new**. **Acknowledgement time:** It is not expected beforehand, but must be recorded and checked after acknowledgement.
- **IT service health state:** If missing, invalid, or unknown, do not assume the service is healthy for closure. Verify its current condition or an explicitly accepted residual condition.
- **Business service health state:** Treat it the same way when checking impacted services at closure; the impact link alone does not establish recovery.
- **Materiality assessment result:** If missing or invalid, the reporting conclusion is not established. **Undetermined** is valid, but it does not permit notification submission; submission requires **reportable**.
- **Rationale:** If absent, seek the reasoning needed to explain and substantiate the assessment. I would not turn that into an automatic submission block beyond the check that required notification information is complete.
- **Assessed-at time:** If absent or invalid, verify when the assessment occurred before presenting it as a completed, current assessment. Neither a timestamp alone nor a result without context proves that notification was submitted.

### Turn 70 — assistant

That gives us the alert acknowledgement and closure checks, and keeps an **undetermined** materiality result distinct from a reportable one. A missing rationale calls for substantiation; you have not made it an automatic submission block on its own.

For **Regulatory notification**, what breaks or must be checked if each of these is missing or invalid: **status, due time, and submitted time**? And for **Communication**: **audience, message summary, status, and sent time**? A brief answer for each property is enough.

### Turn 71 — user

**Regulatory notification**
- **Status:** It must be valid and **approved** before submission. Afterward, verify the recorded submission state; a receipt or rejection still needs separate follow-up.
- **Due time:** If missing or invalid, establish it before submission—the agent cannot verify that submission will occur before it is due.
- **Submitted time:** Not expected before submission. Afterward, a missing or invalid time leaves the submission record incomplete; check the retained receipt as well.

**Communication**
- **Audience:** If missing or invalid, establish who the message is for before sending it.
- **Message summary:** If missing, establish the message being sent and check its content against the latest verified incident state. A summary alone is not the final archived message.
- **Status:** If missing or invalid, establish its approval state before sending; do not infer approval from a draft or a timestamp.
- **Sent time:** Not expected before sending. Afterward, record it and separately confirm delivery and archive the final message.

### Turn 71 — assistant

For regulatory notifications, **status and due time** must be established before submission; **submitted time** is checked afterward alongside the receipt. For communications, audience, content, and approval state come before sending; sent time, delivery, and archiving are checked afterward.

For **Backup set**, what breaks or must be checked if each is missing or invalid: **status, last successful backup, and last verification**?

### Turn 72 — user

- **Status:** Establish a valid status before restoring. The restore action accepts only **successful** or **verified**; missing, invalid, failed, expired, or corrupted does not meet that precondition.
- **Last successful backup:** If missing or invalid, we cannot use it to establish how recent the recoverable data is. Check the actual restore point against what has been approved; do not infer suitability from status alone.
- **Last verification:** If missing or invalid, we cannot claim when the backup was last verified. Check its integrity and fitness for this restore; do not assume that a recorded **successful** status means verification occurred.

The backup must also protect the target, and the restore point and target environment require approval. Those are separate checks.

### Turn 72 — assistant

A restore will require backup status **successful** or **verified**, plus a protection link to the target and separate checks of integrity, the approved restore point, and the target environment. Neither “successful” nor a timestamp alone proves fitness.

For **Recovery plan**, what breaks or must be checked if each is missing or invalid: **recovery time objective, recovery point objective, and last review date**? Please address each separately; we’ll keep unknown units from being compared as raw numbers.

### Turn 73 — user

- **Recovery time objective:** If missing or invalid, we cannot compare the proposed recovery timing with the plan’s objective. Establish it through the approved recovery procedure if that comparison is needed; its absence is not, by itself, a defined failover block.
- **Recovery point objective:** If missing or invalid, we cannot use the plan’s objective to assess potential data loss. We still need a separately acceptable data-recovery point before failover, or an approved restore point for a backup restore. Do not compare values until units are established or normalized.
- **Last review date:** If missing or invalid, we cannot tell from that field how recently the plan was reviewed. Confirm its currency through the governing recovery arrangements; there is no specified maximum age that automatically blocks failover.

### Turn 73 — assistant

Those three plan values support comparison or judgment when available, but none creates an automatic failover block by itself. Recovery-point acceptance remains a separate decision, and numeric comparisons require established or normalized units.

For **Evidence item**, what breaks or must be checked if each is missing or invalid: **integrity status, collected-at time, and cryptographic hash**? Please distinguish what is required for closure generally from what is required for cybersecurity evidence.

### Turn 74 — user

- **Integrity status:** If missing or invalid, we cannot establish the item’s integrity from that field. Check whether it can reliably support the claimed resolution or restoration. For a cybersecurity incident, verify that relevant evidence has been preserved; do not treat an item marked **compromised** as intact.
- **Collected-at time:** If missing or invalid, establish when the item was collected before relying on its timing in the incident account, especially for cybersecurity evidence.
- **Cryptographic hash:** If missing or invalid, do not claim the item was hash-verified. Check the preservation method used. A hash is not a blanket requirement for every closure evidence item.

Closure requires evidence supporting **resolution and restoration**. Cybersecurity incidents additionally require **evidence preservation**; the model does not make all three properties mandatory on every evidence item.

### Turn 74 — assistant

For closure, evidence must substantiate **both resolution and restoration**. Cybersecurity incidents additionally require preservation checks; a compromised item is not intact, and a missing hash cannot be described as hash verification. None of those makes every evidence property mandatory on every item.

For **Emergency change**, what breaks or must be checked if each is missing or invalid: **status, risk level, implementation plan, and backout plan**? Please address each separately; explicit risk acceptance remains its own check.

### Turn 75 — user

- **Status:** If missing or invalid, establish where the change stands before execution; do not treat it as approved or ready by default. After execution, verify that its status reflects the actual outcome.
- **Risk level:** If missing or invalid, establish the assessed risk so it can be understood and explicitly accepted. A valid level alone is **not** acceptance.
- **Implementation plan:** If missing, do not execute—the planned technical steps must be present.
- **Backout plan:** If missing, do not execute—the means to reverse the change must be present.

The active incident link, affected configuration items, and explicit risk acceptance are separate preconditions, regardless of whether those four values are populated.

### Turn 75 — assistant

For emergency changes, missing implementation or backout plans block execution. Status and risk level must be established, but even an approved status or valid risk level does not replace **explicit risk acceptance** or the checks on the linked incident and configuration items.

For **Problem status**, what breaks or must be checked if it is missing or invalid when the agent presents a candidate workaround? Also, for **Post-incident review held-on date**, what can the agent conclude if it is missing, given that a review may instead be scheduled?

### Turn 76 — user

- **Problem status:** If missing or invalid, don’t claim that the cause has reached a particular investigation stage. The agent can still present a workaround as a **candidate** if the incident–problem–known-error–workaround path is established; status alone neither establishes nor authorizes that workaround.
- **Post-incident review held-on date:** If missing, don’t claim the review has been held. Check the review arrangements to see whether it is **scheduled**. For a major or cybersecurity incident, a verified booking or a completed review can satisfy the closure review check; the link alone cannot.

### Turn 76 — assistant

That completes the fixed-choice and missing-value pass. A missing Problem status limits what we can say about investigation stage, but does not erase a verified candidate-workaround path. A missing review held-on date means we must check the review arrangements for a booking; the link alone proves neither scheduling nor completion.

**Does this capture the value and missing-data checks accurately before we turn the decisions into named rules?**

### Turn 77 — user

Yes. The checks are accurately bounded to the decisions that use each value; they do not make every property mandatory on every record. We can now turn the action boundaries into named rules.

### Turn 77 — assistant

The value checks are confirmed. We’ll define named rules only for decisions the agent must make, without turning external approvals or live checks into invented fields.

Starting with **acknowledge alert**: is this the complete precondition—**Alert.status is `new`**—or must another check pass before acknowledgement? The acknowledgement time would be recorded and verified *after* the action.

### Turn 78 — user

There is one more precondition: the operator must be **authorized for the responsible resolver group**. So acknowledgement requires both a **new** alert and that authorization.

The action then sets the alert to **acknowledged** and records the acknowledgement time. Read the alert back to verify its status; the timestamp is retained as part of the acknowledgement record. I would not infer authorization merely from access to the alert.

### Turn 78 — assistant

Acknowledgement requires both **Alert.status = `new`** and an authorization check for the responsible resolver group. Afterward, the alert should be read back as `acknowledged` with its acknowledgement time recorded. Access to the alert does not prove authorization.

Before I record that rule, how is the **responsible resolver group for an alert** identified? Is it supplied and verified through arrangements outside these connections, or is there a path we should record?

### Turn 79 — user

It is **identified and verified through the bank’s responsible-group arrangements**, not through a defined alert-to-resolver-group path in the connections we’ve recorded. The alert may concern an IT service or configuration item, but that alone does not establish which group is responsible.

For acknowledgement, the proposed responsible group and the operator’s authorization for it must be checked against those arrangements. We should not infer the group from a previous incident assignment or add an unsupported alert-to-group connection.

### Turn 79 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canAcknowledgeAlert:\n    conditions:\n      - Alert status is new.\n      - The proposed responsible resolver group is verified against the bank's responsible-group arrangements and the operator is authorized for that group."
}
```

### Turn 79 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 79 — assistant

I’ve recorded **canAcknowledgeAlert** with both checks. The group and operator authorization are verified against the bank’s arrangements; no unsupported alert-to-group link was added.

For **assign incident to resolver group**, should the named rule require (1) an assignable Incident status, (2) at least one affected IT service or configuration item, and (3) confirmation from authoritative support arrangements that the proposed group supports one of those affected objects? If status matters, which of the recorded Incident statuses allow assignment?

### Turn 80 — user

Yes, with a narrower status check: **any valid incident status except closed or cancelled** allows assignment under this rule. It does not require a separate list of “assignable” states.

The proposed resolver group must be confirmed, through the bank’s authoritative support arrangements, as supporting an IT service the incident impacts **or** a configuration item it affects. If neither affected object nor that support responsibility can be established, do not assign it. After assignment, read the incident back and confirm the resolver group recorded on it.

### Turn 80 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canAssignIncidentToResolverGroup:\n    conditions:\n      - Incident status is a valid recorded value other than closed or cancelled.\n      - The incident impacts an IT service or affects a configuration item.\n      - The proposed resolver group is verified against the bank's authoritative support arrangements as supporting at least one of those affected IT services or configuration items."
}
```

### Turn 80 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 80 — assistant

I’ve recorded **canAssignIncidentToResolverGroup**. It requires a valid incident status other than `closed` or `cancelled`, an affected service or item, and verified support responsibility for the proposed group. Assignment will be verified by reading the incident’s recorded group back.

For **declare major incident**, I have these conditions from your earlier answers: valid Incident status other than `resolved`, `closed`, or `cancelled`; severity `sev1-critical` or `sev2-high`; at least one impacted IT service; and an assigned incident commander. Is that the complete declaration rule, or does a separate approval or decision check also apply?

### Turn 81 — user

That is the complete **defined declaration precondition**. I would not add a separate approval gate that we have not established.

Confirm all four conditions, then declare the incident major, record the declaration time, and start major-incident coordination and communication cadence. Verify the designation, commander, declaration time, and communication record afterward. Severity alone does not declare it major.

### Turn 81 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canDeclareMajorIncident:\n    conditions:\n      - Incident status is a valid recorded value other than resolved, closed or cancelled.\n      - Incident severity is sev1-critical or sev2-high.\n      - Incident impacts at least one IT service.\n      - Incident is coordinated by an assigned incident commander."
}
```

### Turn 81 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 81 — assistant

I’ve recorded **canDeclareMajorIncident** with exactly those four conditions and no additional approval gate. The action will set the designation and declaration time, then verify the commander and communication record; severity alone is insufficient.

For **contain incident**, what Incident statuses permit containment, and what must be checked about the recorded **containment scope, expected side effects, approved steps, and verification method** before execution? I’ll keep those decision-time inputs out of standing Incident properties, as agreed.

### Turn 82 — user

Containment is permitted when the incident status is **acknowledged** or **investigating**, and the **containment scope and expected side effects have been recorded**. Those are the defined preconditions.

The team then executes the approved containment steps. I would check that the steps are approved before carrying them out, but I would not add a separate mandatory “verification method” field or approval rule that we have not defined. Verify the containment indicators and remaining service impact afterward; set the incident to **contained** only when containment is verified.

### Turn 82 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canContainIncident:\n    conditions:\n      - Incident status is acknowledged or investigating.\n      - Containment scope and expected side effects are recorded with the proposed containment decision.\n      - The containment steps to be executed are approved."
}
```

### Turn 82 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 82 — assistant

I’ve recorded **canContainIncident**: status `acknowledged` or `investigating`, recorded scope and expected side effects, and approved steps. There is no invented verification-method field. The incident becomes `contained` only after containment indicators and remaining service impact have been checked.

For **fail over an affected IT service**, which Incident statuses permit the move, and what must be confirmed about the applicable recovery plan, supplied target environment, data-recovery point, and authorization before execution?

### Turn 83 — user

There is **no defined incident-status list** for failover, and I would not invent a separate authorization gate. Before moving the workload, confirm that the recovery plan applies to the affected IT service, the **supplied** recovery environment is available, and the data-recovery point is acceptable under the bank’s approved recovery procedure. Do not infer the target from the plan or compare recovery-point numbers without established units.

After the move, confirm the service’s health and critical business transactions in the recovery environment, and retain the checks supporting that verification.

### Turn 83 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canFailOverITService:\n    conditions:\n      - The IT service is impacted by the incident and the proposed recovery plan recovers that IT service.\n      - The supplied target environment is confirmed available at the time of failover.\n      - The proposed data-recovery point is confirmed acceptable under the bank's approved recovery procedure; establish or normalize units before comparing recovery-point values."
}
```

### Turn 83 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 83 — assistant

I’ve recorded **canFailOverITService** without an invented incident-status list or authorization gate. It requires the plan to recover an impacted service, the supplied target to be available, and the data-recovery point to be acceptable under the approved procedure. Verification will check service health and critical business transactions in the recovery environment.

For **restore data from a backup set**, is the complete precondition: backup status `successful` or `verified`; the backup set protects the target configuration item; its integrity and fitness are checked; and the restore point and target environment are approved for this restore? Does a recovery-plan link have to be present, or is it contextual rather than mandatory?

### Turn 84 — user

A **recovery-plan link is contextual, not a mandatory restore precondition**.

The defined preconditions are that the backup set’s status is **successful or verified**, it **protects the target configuration item**, and the **restore point and target environment are approved** for this restore. Checking the backup’s integrity and fitness is prudent, especially if verification information is missing, but I would not turn it into an additional named precondition.

After restoration, validate **data integrity and application functionality** and retain the restoration evidence.

### Turn 84 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canRestoreBackupSet:\n    conditions:\n      - Backup set status is successful or verified.\n      - Backup set protects the target configuration item.\n      - The restore point and target environment are approved for this restore."
}
```

### Turn 84 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 84 — assistant

I’ve recorded **canRestoreBackupSet** with those three defined conditions. A recovery-plan link is contextual, not mandatory. We’ll still verify data integrity and application functionality after restoration and retain evidence; missing verification information warrants a fitness check without silently adding a new named gate.

For **execute emergency change**, should the rule require **EmergencyChange.status = `approved`**, a valid risk level, nonempty implementation and backout plans, an active linked incident, affected configuration items, and separately verified explicit risk acceptance? If “active” has a narrower meaning here, which Incident statuses qualify?

### Turn 85 — user

Not quite. The defined execution checks are: the emergency change is linked to an **active incident**, its **implementation and backout plans** are present, the affected configuration items are identified, and its risk has been **explicitly accepted**.

I would establish the change’s status and risk level, but I would not make **status = approved** or a particular risk-level value an additional execution gate. Nor is “active” given a precise list of incident statuses for this action; confirm that the linked incident is active rather than inventing one.

After execution, update the change’s status, run technical checks, verify service health, and retain implementation evidence.

### Turn 85 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canExecuteEmergencyChange:\n    conditions:\n      - Emergency change is justified by an incident confirmed active for this action; no specific incident-status list is defined.\n      - Emergency change implementation plan and backout plan are present.\n      - Emergency change modifies identified configuration items.\n      - Emergency change status and risk level have been established, without treating approved status or a risk level as risk acceptance.\n      - Explicit risk acceptance for this emergency change is verified separately."
}
```

### Turn 85 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 85 — assistant

I’ve recorded the emergency-change rule without imposing `approved` status or inventing an “active” status list. It requires the linked incident to be confirmed active, plans and affected items to be present, status and risk level to be established, and **explicit risk acceptance** to be verified separately.

For **send a stakeholder communication**, is `Communication.status = approved` the sending state? Alongside that, should the rule check its audience, message summary/content, identified stakeholder recipient, recorded owner, and consistency with the latest verified incident state—or is any of that merely an after-send check?

### Turn 86 — user

I would **not** make `status = approved` the defined sending gate. The rule requires the communication’s **audience, message, owner, and approval state to be recorded**, and its content to match the **latest verified incident state**.

The identified stakeholder is the intended recipient through the communication’s **is addressed to** connection, so check that you know whom you are sending it to. But I would not turn that connection—or a specific `approved` status—into an additional named precondition beyond the defined rule.

**Sent time, delivery confirmation, and archiving the final message** are after-send checks. A message summary alone is not enough to check the full content for accuracy.

### Turn 86 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canSendCommunication:\n    conditions:\n      - Communication audience, message, owner and approval state are recorded for the proposed send; do not infer approval from a particular status alone.\n      - The full communication content matches the latest verified state of its linked incident; a message summary alone does not prove this."
}
```

### Turn 86 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 86 — assistant

I’ve recorded the defined communication rule without making `status = approved` an automatic gate. The recipient is identified through **is addressed to**, while the rule checks the recorded audience, full message, owner, approval state, and consistency with the latest verified incident state. Sent time, delivery, and archiving are after-send checks.

For **submit a regulatory notification**, is the complete precondition: a linked materiality assessment with result `reportable`; a notification linked to both its incident and regulator; notification status `approved`; a valid due time; and separately confirmed completeness of required information and supporting evidence? Is there any other defined submission check?

### Turn 87 — user

Almost. Add the **timing check**: submission must occur **before the notification’s due time**. A valid due time alone is not enough.

The complete defined check is: the assessment result is `reportable`; the notification is linked to the incident and regulator; required information and supporting evidence are complete; the notification status is `approved`; and submission is before the due time. I would not add another approval or threshold.

After submission, record the submitted status and time, retain the receipt, and confirm acceptance—or record rejection and the required follow-up.

### Turn 87 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canSubmitRegulatoryNotification:\n    conditions:\n      - The notification's linked materiality assessment has result reportable.\n      - Regulatory notification reports the incident and is sent to the identified regulator.\n      - Required notification information and supporting evidence are confirmed complete.\n      - Regulatory notification status is approved.\n      - Submission occurs before the valid regulatory notification due time."
}
```

### Turn 87 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 87 — assistant

I’ve recorded the submission rule, including **submission before the due time**. An approved notification or reportable assessment alone is not enough. After submission, the agent must check the recorded time and receipt, then acceptance or rejection and follow-up.

For **close incident**, what Incident statuses permit closure, and what exact checks are required for resolution/restoration evidence, all impacted IT and business services, required communications, and a post-incident review when the major or cybersecurity designation applies?

### Turn 88 — user

Closure is permitted when the incident is **resolved** or **monitoring**, provided all of these checks pass:

- Resolution **and** restoration are supported by recorded evidence.
- Every impacted IT and business service is **healthy**, or its remaining condition has been **explicitly accepted** for closure. A degraded or unknown health state is not acceptance by itself.
- Required stakeholder communications are **complete**.
- If the incident is designated **major** or **cybersecurity**, its post-incident review is **scheduled or completed**. A review link alone does not prove either.

Only then should the incident be marked **closed** and its closure time recorded. Read back the incident and linked services, and confirm the closure state and retained evidence.

### Turn 88 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      closureTime:\n        type: date\nrules:\n  canCloseIncident:\n    conditions:\n      - Incident status is resolved or monitoring.\n      - Linked evidence items substantiate both resolution and restoration; check their reliability and preserve relevant cybersecurity evidence.\n      - Every IT service and business service impacted by the incident has health state healthy, or its residual condition has been explicitly accepted for closure; degraded or unknown alone does not establish acceptance.\n      - Required communications linked to the incident are confirmed complete through delivery checks, not merely by a sent time or status.\n      - Major-incident and cybersecurity-incident designations are established rather than assumed false when missing.\n      - If either designation is true, a linked post-incident review is confirmed scheduled through review arrangements or completed, rather than inferred from the link alone."
}
```

### Turn 88 — tool

Applied. Added 1, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 88 — assistant

I’ve recorded **canCloseIncident** and added **Incident.closureTime** to verify the action. The rule requires `resolved` or `monitoring`, evidence for both resolution and restoration, a healthy or explicitly accepted condition for **every** impacted IT and business service, completed required communications, and a verified scheduled or completed review when either designation applies. A review link alone is insufficient.

That completes the ten action-boundary rules. **Do these rules reflect the decisions you defined before we record each action’s effect and verification?**

### Turn 89 — user

Yes, the ten rules capture the decision boundaries we discussed. Keep **defined preconditions** distinct from checks that support a decision or verify its result: for example, backup fitness does not add a new restore gate, and an emergency change does not acquire an `approved`-status gate.

For closure, record the **closed-at time** after the action. A scheduled review must be verified through the review arrangements; its link alone is not enough. We can now record each action’s effect and verification.

### Turn 89 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "closureTime",
      "to": "closedAt",
      "className": "Incident",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 89 — tool

Renamed 1 of 1:
- property "Incident.closureTime" → "closedAt"

### Turn 89 — assistant

The ten rules are confirmed, and I’ve renamed the incident’s closure timestamp to your term, **closed-at time**. I’ll now record actions with one primary input each and checks of their results.

For the first three, are these effects and verification steps accurate?

- **Acknowledge alert** — input: Alert; set status to `acknowledged` and record acknowledgement time; read the alert back to confirm both.
- **Assign incident to resolver group** — input: Incident; record **Incident → is assigned to → ResolverGroup**; read the incident back to confirm the proposed group.
- **Declare major incident** — input: Incident; set the major-incident designation and declaration time, then begin coordination and communications; read back the designation, time, assigned commander, and linked communication record.

Each would use its corresponding rule as a precondition.

### Turn 90 — user

Yes. Those effects and verification steps are accurate, with one nuance on declaration: the read-back should confirm that the **major-incident coordination and communication cadence has started**, using the commander and communication record; a linked communication record alone should not be mistaken for proof that a message was sent.

Each action should run only after its corresponding preconditions pass. Assigning a resolver group does not, by itself, assign an on-call engineer.

### Turn 90 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  acknowledgeAlert:\n    input: Alert\n    preconditions: [canAcknowledgeAlert]\n    effect: Set Alert status to acknowledged and record its acknowledgementTime.\n    verification: Read back Alert status as acknowledged and confirm acknowledgementTime is recorded.\n  assignIncidentToResolverGroup:\n    input: Incident\n    preconditions: [canAssignIncidentToResolverGroup]\n    effect: Record Incident isAssignedTo the proposed ResolverGroup; do not infer assignment of an OnCallEngineer.\n    verification: Read back the Incident isAssignedTo link and confirm it identifies the proposed ResolverGroup.\n  declareMajorIncident:\n    input: Incident\n    preconditions: [canDeclareMajorIncident]\n    effect: Set majorIncidentDesignation to true, record majorIncidentDeclarationTime, and start coordination and communication cadence with the assigned IncidentCommander.\n    verification: Read back the Incident designation and declaration time; confirm its isCoordinatedBy link and verify that coordination and communication cadence started through the commander and linked Communication records, without treating a link alone as proof of sending."
}
```

### Turn 90 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "acknowledgeAlert" has input class Alert, and its precondition canAcknowledgeAlert refers to ResolverGroup, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Alert to ResolverGroup. Rewording the text does not create the path it assumes.

### Turn 90 — assistant

I’ve recorded the first three actions, including your distinctions: assigning a group does not assign an engineer, and a communication link alone does not prove a message was sent.

The canvas warns that **acknowledgeAlert** cannot navigate from Alert to ResolverGroup. That is expected under the boundary you set: the proposed responsible group and operator authorization are checked against the bank’s external arrangements, not derived through an alert-to-group relationship. I’ve left that relationship out rather than invent one.

For **contain incident** and **fail over an affected IT service**, are these effects and verification steps accurate?

- **Contain incident** — input: Incident; execute the approved containment steps, then set status to `contained` **only after** containment is verified. Check containment indicators and remaining impact on linked services and configuration items.
- **Fail over affected IT service** — input: IT service; move it to the supplied, checked recovery environment using the applicable Recovery plan. Check its health and critical business transactions in that environment, retaining the verification checks.

Each would use its corresponding rule.

### Turn 91 — user

**Contain incident** is accurate. The input is the incident; execute the approved steps, check containment indicators and remaining service impact, and set status to `contained` only once containment is verified. Check affected configuration items where they form part of the recorded scope.

For **fail over service**, I’d change the **primary input to Incident**. From that incident, identify the impacted IT service and applicable recovery plan, then use the supplied, checked recovery environment. The effect is to move the service workload there. Verify service health and critical business transactions in the recovery environment, and retain the results. Its corresponding rule remains the precondition.

### Turn 91 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  containIncident:\n    input: Incident\n    preconditions: [canContainIncident]\n    effect: Execute approved containment steps within the recorded scope; set Incident status to contained only after containment has been verified.\n    verification: Check containment indicators and remaining impact on the Incident's impacted IT services and affected ConfigurationItems where within scope; read back Incident status as contained only if verification passed.\n  failOverAffectedITService:\n    input: Incident\n    preconditions: [canFailOverITService]\n    effect: Move the workload of the ITService impacted by the Incident to the supplied and checked recovery Environment using the applicable RecoveryPlan; record the Incident isRecoveredWith link when that plan is actually used and update the ITService isDeployedIn link to the actual environment.\n    verification: Check ITService healthState and critical business transactions in the recovery Environment and retain the results; confirm the service's actual isDeployedIn link and the Incident isRecoveredWith link after the move."
}
```

### Turn 91 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 91 — assistant

I’ve recorded both actions with **Incident** as the primary input for failover. Containment sets `contained` only after verification; failover checks service health and critical business transactions in the recovery environment and retains the results.

The earlier canvas warning about alert acknowledgement remains: its responsible group is verified externally, not reached through a recorded Alert relationship.

For the next two actions, are these effects and verification steps accurate?

- **Restore data from backup set** — input: **Backup set**; restore data to the configuration item it protects, using the approved restore point and target environment. Verify data integrity and application functionality, and retain restoration evidence.
- **Execute emergency change** — input: **Emergency change**; execute its implementation plan and update its status to reflect the actual outcome. Verify the technical result and affected service health, and retain implementation evidence.

Each would use its corresponding rule; neither verification step adds a new precondition.

### Turn 92 — user

Yes, with one precision on the restore: the backup set may protect more than one configuration item, so use the **specific approved target** identified for this restore, not just any item it protects.

For the emergency change, update status to the **actual outcome**—implemented, failed, or rolled back as appropriate—rather than assuming success. Verify the technical checks and affected service health, and retain implementation evidence. Those verification steps do not add preconditions to either action.

### Turn 92 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  restoreDataFromBackupSet:\n    input: BackupSet\n    preconditions: [canRestoreBackupSet]\n    effect: Restore data from the BackupSet to the specific approved ConfigurationItem it protects, at the approved restore point and target Environment; retain restoration EvidenceItems linked to the relevant Incident where applicable.\n    verification: Check data integrity and application functionality for the specific restored ConfigurationItem in the approved Environment and confirm restoration EvidenceItems are retained where the restore concerns an Incident.\n  executeEmergencyChange:\n    input: EmergencyChange\n    preconditions: [canExecuteEmergencyChange]\n    effect: Execute the EmergencyChange implementationPlan and update its status to implemented, failed or rolled back according to the actual outcome; retain EvidenceItems for the linked Incident where applicable.\n    verification: Check the technical result on modified ConfigurationItems and healthState of affected ITServices, read back the actual EmergencyChange status and confirm implementation EvidenceItems were retained for the Incident."
}
```

### Turn 92 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "restoreDataFromBackupSet" has input class BackupSet, and its effect refers to EvidenceItem, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from BackupSet to EvidenceItem. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "restoreDataFromBackupSet" has input class BackupSet, and its effect refers to Incident, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from BackupSet to Incident. Rewording the text does not create the path it assumes.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 92 — assistant

I’ve recorded both actions with those distinctions: a restore uses the **specific approved target**, and an emergency change records its **actual** outcome rather than assuming success.

The canvas found a navigation gap in the restore action: starting from **Backup set**, the model has no confirmed path to the relevant **Incident** or its **Evidence items**. I won’t invent a direct link. When a restore is performed for an incident, how is that incident identified for retaining the restoration evidence—is it supplied with the restore decision, or reached through another record?

### Turn 93 — user

The **incident is supplied with the restore decision**. The backup set and its protection link establish what can be restored; they do not identify which incident prompted this particular restore.

After restoration, retain the results as **evidence items supporting that supplied incident**. We should not infer an incident from the backup set or add a direct backup-to-incident connection. The restore action still takes the backup set as its primary input, with the incident as decision context.

### Turn 93 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  restoreDataFromBackupSet:\n    input: BackupSet\n    preconditions: [canRestoreBackupSet]\n    effect: Restore from the BackupSet to the specific approved ConfigurationItem it protects at the approved restore point and target Environment; when an Incident is supplied with the restore decision, retain the restoration results as EvidenceItems supporting that supplied Incident through its isSupportedBy link, without inferring the Incident from the BackupSet.\n    verification: Verify data integrity and application functionality for the specific restored ConfigurationItem in the approved Environment; when an Incident was supplied, confirm its isSupportedBy link to retained restoration EvidenceItems."
}
```

### Turn 93 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 93 — assistant

I’ve updated the restore action to say explicitly that the **incident is supplied with the restore decision**, not inferred from the backup set. Restoration evidence supports that supplied incident through its existing evidence link. The canvas still flags the lack of a navigable Backup set → Incident path; that warning reflects the deliberate external decision context, not a missing direct relationship.

For the final three actions, are these effects and verification steps accurate?

- **Send communication** — input: Communication; send the checked message, record sent time, then verify delivery and archive the final message.
- **Submit regulatory notification** — input: Regulatory notification; submit it, set status to `submitted` and record submitted time; retain the receipt and confirm acceptance or record rejection and follow-up.
- **Close incident** — input: Incident; set status to `closed` and record **closed-at time**; read back the incident, linked services, and retained closure evidence.

### Turn 94 — user

The **notification** and **closure** actions are accurate. For **send communication**, I’d change the primary input to **Incident**. Identify the communication about that incident and its intended stakeholder, run the sending checks, then send it and record the sent time. Verify delivery and archive the final message; a timestamp alone does not prove delivery.

For **submit regulatory notification**, retain the submission receipt and then confirm acceptance or record rejection and follow-up. For **close incident**, read back the closed status and closed-at time, and check the linked services and retained resolution and restoration evidence.

### Turn 94 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  sendCommunication:\n    input: Incident\n    preconditions: [canSendCommunication]\n    effect: Send the checked Communication linked through Incident isCommunicatedThrough and addressed to its intended Stakeholder; record Communication sentTime and update its status to the actual recorded sending state.\n    verification: Read back Communication sentTime and status; confirm delivery through delivery evidence and archive the final message, without treating a timestamp as proof of delivery.\n  submitRegulatoryNotification:\n    input: RegulatoryNotification\n    preconditions: [canSubmitRegulatoryNotification]\n    effect: Submit the RegulatoryNotification to its linked Regulator about the Incident it reports; set its status to submitted and record submittedTime, retaining the submission receipt.\n    verification: Read back RegulatoryNotification status and submittedTime, check the retained receipt, then confirm acceptance or record rejected status and the required follow-up according to the actual outcome.\n  closeIncident:\n    input: Incident\n    preconditions: [canCloseIncident]\n    effect: Set Incident status to closed and record its closedAt time after the closure checks pass.\n    verification: Read back Incident status as closed and closedAt; check healthState of linked impacted ITServices and BusinessServices and retained EvidenceItems substantiating both resolution and restoration."
}
```

### Turn 94 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 94 — assistant

All ten proposed actions are now recorded with one primary input, a named precondition rule, an effect, and a verification step. **Send communication** starts from Incident, as you specified; submitting a notification and closing an incident also check their recorded outcomes rather than relying on a timestamp alone.

The canvas still reports three navigation warnings: alert acknowledgement relies on an externally verified responsible group, and backup restoration receives the incident as supplied decision context. I have not added relationships that would falsely imply those can be derived from the action inputs.

**Does this capture the ten actions accurately before we make one bounded check for neighboring concepts we may have missed?**

### Turn 95 — user

Yes. The ten actions are captured accurately, and those navigation warnings reflect deliberate decision inputs or external checks—not relationships to invent.

Keep the action results distinct from their verification: a sent time does not prove delivery, a submitted status does not prove regulatory acceptance, and restored data still needs integrity and application checks. We can make the bounded neighboring-concept check.

### Turn 95 — assistant

The ten actions are confirmed. Their effects remain separate from the checks that establish success.

For this bounded neighboring-concept pass, let’s start with **Incident** and **IT service**. Beyond what we’ve already captured, are we missing any **incident lifecycle event or responsible party**, or any **IT-service dependency, recovery stage, or measurement** that the agent needs for one of the accepted questions or actions? Please name only a gap that would change how the agent answers or acts; “covered” is a useful answer.

### Turn 96 — user

**Covered for the accepted scope.** We have the incident states needed for the ten actions, the distinct owner, responder, and commander roles, and the affected service’s health and recovery-plan path.

IT services can have further technical dependencies and service-level measurements, but none is needed to change an answer or action we’ve accepted here. I would not add them just for completeness.

### Turn 96 — assistant

**Incident** and **IT service** are covered for the accepted scope. I won’t add technical dependencies or measurements just for completeness.

For **Recovery plan** and **Backup set**, are we missing any plan stage, protected part, responsible party, or recovery measurement that would change the accepted failover or restore decisions? Or are their current paths, values, and decision-time checks sufficient?

### Turn 97 — user

Their current paths, values, and decision-time checks are **sufficient for the accepted failover and restore actions**. The plan identifies the IT service it recovers and the backup set it uses; the backup set identifies the configuration items it protects.

The remaining decisions are made for the particular operation: target-environment availability and an acceptable data-recovery point for failover, or an approved restore point and target for restoration. The recovery objectives and last review date provide context, but we have not defined another plan stage, responsible party, or numeric gate that would change these actions.

### Turn 97 — assistant

**Recovery plan** and **Backup set** are covered. I won’t add a plan stage, owner, or numeric gate that your accepted actions do not use.

For **Materiality assessment**, **Regulatory notification**, and **Communication**, are we missing any related agreement or paperwork, recipient, submission stage, or delivery record that the agent must identify as a separate class or connection for the accepted assessment, submission, or sending checks? Or are the existing records and external receipt/delivery checks sufficient?

### Turn 98 — user

The existing records and checks are sufficient for this scope. The **materiality assessment** records the reporting conclusion; the **regulatory notification** identifies the incident and receiving regulator; the **communication** identifies its stakeholder recipient.

Submission receipts, acceptance or rejection, delivery confirmation, and the archived final message must be retained or checked, but we have not made them separate classes or connections. I would not introduce another agreement or paperwork record solely to satisfy these actions.

### Turn 98 — assistant

Those three are covered. Receipts, acceptance or rejection, delivery confirmation, and the archived message remain checks or retained artifacts, not additional classes invented for this scope.

For the remaining major workflow records—**Emergency change** and **Evidence item**—are we missing any implementation or backout stage, affected object, preservation step, or characteristic value that would change execution or incident closure? Or do the existing connections, values, and checks cover them?

### Turn 99 — user

**Covered for the accepted actions.** The emergency change identifies its justifying incident and affected configuration items; execution checks its plans and explicit risk acceptance, then verifies the actual outcome. There is no additional implementation or backout stage to model here.

Evidence items support the incident’s resolution and restoration checks. For a cybersecurity incident, preservation and integrity also need attention, but the existing integrity status and retained evidence checks cover that without inventing another evidence type or mandatory hash for every item.

### Turn 99 — assistant

That completes the bounded neighboring-concept pass. You confirmed that **Incident, IT service, Recovery plan, Backup set, Materiality assessment, Regulatory notification, Communication, Emergency change, and Evidence item** need no further neighboring structures for the accepted scope. I’ve added nothing from this pass.

**Is that an accurate recap before I replay every recorded question and action against the live model?**

### Turn 100 — user

Yes, that is an accurate recap for the accepted scope. Replay the questions and actions against the recorded paths, decision-time checks, and verification steps; do not fill a missing path by assuming a relationship we have not established.

### Turn 100 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 100 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which alerts and events are correlated with an incident?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: Which configuration items are affected by an incident?
  - id: cq5
    text: Who owns an affected IT service?
  - id: cq6
    text: "Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?"
  - id: cq7
    text: "For the proposed supporting resolver group, who is currently on call, and who actually handles the incident?"
  - id: cq8
    text: Does an incident warrant major-incident coordination?
  - id: cq9
    text: "Has a materiality assessment been completed for an incident, and what did it conclude?"
  - id: cq10
    text: "Which runbook is a traceable candidate for handling an incident, where an applicable known-error workaround documents one?"
  - id: cq11
    text: "Which workaround could temporarily reduce or bypass an incident's impact?"
  - id: cq12
    text: What does a candidate backup protect?
  - id: cq13
    text: Which backup set does the recovery plan for an affected IT service use?
  - id: cq14
    text: Which recovery plan applies to an affected IT service?
  - id: cq15
    text: What resolution and restoration evidence is required to close an incident?
  - id: cq16
    text: "Are all impacted services healthy, or is their residual condition accepted for incident closure?"
  - id: cq17
    text: Have required stakeholder communications been completed before incident closure?
  - id: cq18
    text: "For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
  - id: cq19
    text: "What environment is an affected IT service or configuration item in, and is the supplied failover target suitable?"
  - id: cq20
    text: Who is the incident commander for a major incident?
  - id: cq21
    text: "Which customer channels deliver an impacted business service, and which of those have confirmed disruption?"
classes:
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
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
      majorIncidentDesignation:
        type: boolean
      cybersecurityIncidentDesignation:
        type: boolean
      majorIncidentDeclarationTime:
        type: date
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      closedAt:
        type: date
  Alert:
    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.
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
      acknowledgementTime:
        type: date
  Event:
    meaning: An observed occurrence.
    aliases:
      - esemény
    properties: {}
  ITService:
    meaning: "A managed technology capability whose impact, owner, and recovery arrangements need to be established."
    aliases:
      - technology service
      - informatikai szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially unavailable
          - unavailable
          - recovering
          - unknown
  BusinessService:
    meaning: A customer- or business-facing capability that may be affected by an incident.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially unavailable
          - unavailable
          - recovering
          - unknown
  CustomerChannel:
    meaning: "A way customers access a business service, distinct from the service itself."
    aliases:
      - ügyfélcsatorna
    properties: {}
  ConfigurationItem:
    meaning: A managed component in configuration-management scope that may be directly affected by an incident.
    aliases:
      - CI
      - konfigurációs elem
    properties: {}
  Environment:
    meaning: "A deployment context for an IT service or configuration item, including a possible failover target."
    aliases:
      - környezet
    properties: {}
  ServiceOwner:
    meaning: The actor accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: The team assigned to diagnose and restore an incident within its area of support.
    aliases:
      - support group
      - megoldócsoport
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group who may handle a time-critical incident response.
    aliases:
      - on-call
      - ügyeletes mérnök
    properties: {}
  IncidentCommander:
    meaning: "The actor who commands a major incident's coordination and decision cadence."
    aliases:
      - incident manager
      - major-incident lead
      - incidensparancsnok
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - playbook
      - üzemeltetési eljárás
    properties: {}
  Workaround:
    meaning: "A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it."
    aliases:
      - kerülőmegoldás
    properties: {}
  RecoveryPlan:
    meaning: A plan describing how to restore an IT service and its dependencies.
    aliases:
      - DR plan
      - helyreállítási terv
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  BackupSet:
    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.
    aliases:
      - backup
      - mentéskészlet
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
  MaterialityAssessment:
    meaning: "A record of an incident's significance, rationale, and reporting implication."
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
      assessedAt:
        type: date
  RegulatoryNotification:
    meaning: "A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
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
      dueTime:
        type: date
      submittedTime:
        type: date
  Communication:
    meaning: A record of a message to an appropriate audience concerning an incident or its response.
    aliases:
      - stakeholder communication
      - notification
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
      sentTime:
        type: date
  PostIncidentReview:
    meaning: "A structured review of an incident's causes, response, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
  EmergencyChange:
    meaning: An accelerated change executed as part of an incident response.
    aliases:
      - emergency fix
      - sürgősségi változás
    properties:
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
          - rolled back
          - closed
          - cancelled
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
  EvidenceItem:
    meaning: "A preserved record or artifact documenting an incident, including support for resolution or restoration."
    aliases:
      - incident evidence
      - evidence
      - bizonyíték
    properties:
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      collectedAt:
        type: date
      cryptographicHash:
        type: text
  Stakeholder:
    meaning: An identifiable recipient of a communication about an incident or its response.
    aliases:
      - érintett
    properties: {}
  Regulator:
    meaning: The receiving authority for a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  Problem:
    meaning: The underlying or potential cause of one or more incidents.
    aliases:
      - probléma
    properties:
      status:
        type: text
        allowed:
          - new
          - investigating
          - root cause known
          - known error
          - resolved
          - closed
  KnownError:
    meaning: A diagnosed problem with a documented cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: An IT service established as impacted by this incident.
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "A configuration item directly affected by this incident, rather than merely on a dependency path."
    aliases: []
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "A business service established as impacted by this incident, not just dependent on an impacted IT service."
    aliases: []
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.
    aliases: []
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption.
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: "The observed occurrence indicated by the alert, without automatically correlating it to an incident."
    aliases: []
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: The alert that prompted the managed incident response after triage.
    aliases: []
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: An observed event established as correlated with the incident during investigation.
    aliases: []
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.
    aliases: []
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support."
    aliases: []
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer who actually handles this incident, independent of group membership."
    aliases: []
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: The incident commander assigned to coordinate the incident; assignment precedes and does not itself constitute a major-incident declaration.
    aliases: []
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: The IT service that this recovery plan is designed to restore.
    aliases: []
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "The recovery plan actually used for the incident, distinct from plans merely applicable to affected services."
    aliases: []
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set specified for use by the recovery plan.
    aliases: []
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item protected by this backup set; protection alone does not authorize a restore.
    aliases: []
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is currently deployed.
    aliases: []
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: The deployment environment to which the configuration item belongs.
    aliases: []
  - name: isHandledWith
    from: Incident
    to: Runbook
    meaning: "The runbook actually used to handle the incident, not necessarily every runbook that might be suitable."
    aliases: []
  - name: isDocumentedIn
    from: Workaround
    to: Runbook
    meaning: The maintained runbook documenting the workaround.
    aliases: []
  - name: isLinkedTo
    from: Incident
    to: Problem
    meaning: A problem linked to the incident as an underlying or potential cause.
    aliases: []
  - name: isDocumentedBy
    from: Problem
    to: KnownError
    meaning: The known error documenting a diagnosed problem.
    aliases: []
  - name: has
    from: KnownError
    to: Workaround
    meaning: "A workaround documented for the known error, not an automatic authorization to apply it."
    aliases: []
  - name: affects
    from: KnownError
    to: ConfigurationItem
    meaning: "A configuration item affected by the known error, helping assess candidate workaround relevance."
    aliases: []
  - name: isEvaluatedBy
    from: Incident
    to: MaterialityAssessment
    meaning: "The materiality assessment recording the incident's significance, rationale, and reporting implication."
    aliases: []
  - name: triggers
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The notification called for by a reportable assessment; triggering does not mean it was approved or submitted.
    aliases: []
  - name: isSentTo
    from: RegulatoryNotification
    to: Regulator
    meaning: The receiving regulatory authority specified for this notification.
    aliases: []
  - name: reports
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that this formal regulatory notification concerns.
    aliases: []
  - name: isCommunicatedThrough
    from: Incident
    to: Communication
    meaning: A communication about the incident whose completion must be checked separately.
    aliases: []
  - name: isSupportedBy
    from: Incident
    to: EvidenceItem
    meaning: "An evidence item documenting the incident, including its resolution or restoration."
    aliases: []
  - name: isReviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: "A review linked to the incident, including one scheduled but not yet held."
    aliases: []
  - name: isAddressedTo
    from: Communication
    to: Stakeholder
    meaning: The identifiable intended recipient of the communication.
    aliases: []
  - name: isJustifiedBy
    from: EmergencyChange
    to: Incident
    meaning: The active incident that justifies execution of the emergency change.
    aliases: []
  - name: modifies
    from: EmergencyChange
    to: ConfigurationItem
    meaning: A configuration item intended to be modified by the emergency change.
    aliases: []
rules:
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - "The proposed responsible resolver group is verified against the bank's responsible-group arrangements and the operator is authorized for that group."
  canAssignIncidentToResolverGroup:
    conditions:
      - Incident status is a valid recorded value other than closed or cancelled.
      - The incident impacts an IT service or affects a configuration item.
      - "The proposed resolver group is verified against the bank's authoritative support arrangements as supporting at least one of those affected IT services or configuration items."
  canDeclareMajorIncident:
    conditions:
      - "Incident status is a valid recorded value other than resolved, closed or cancelled."
      - Incident severity is sev1-critical or sev2-high.
      - Incident impacts at least one IT service.
      - Incident is coordinated by an assigned incident commander.
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - Containment scope and expected side effects are recorded with the proposed containment decision.
      - The containment steps to be executed are approved.
  canFailOverITService:
    conditions:
      - The IT service is impacted by the incident and the proposed recovery plan recovers that IT service.
      - The supplied target environment is confirmed available at the time of failover.
      - "The proposed data-recovery point is confirmed acceptable under the bank's approved recovery procedure; establish or normalize units before comparing recovery-point values."
  canRestoreBackupSet:
    conditions:
      - Backup set status is successful or verified.
      - Backup set protects the target configuration item.
      - The restore point and target environment are approved for this restore.
  canExecuteEmergencyChange:
    conditions:
      - Emergency change is justified by an incident confirmed active for this action; no specific incident-status list is defined.
      - Emergency change implementation plan and backout plan are present.
      - Emergency change modifies identified configuration items.
      - "Emergency change status and risk level have been established, without treating approved status or a risk level as risk acceptance."
      - Explicit risk acceptance for this emergency change is verified separately.
  canSendCommunication:
    conditions:
      - "Communication audience, message, owner and approval state are recorded for the proposed send; do not infer approval from a particular status alone."
      - The full communication content matches the latest verified state of its linked incident; a message summary alone does not prove this.
  canSubmitRegulatoryNotification:
    conditions:
      - "The notification's linked materiality assessment has result reportable."
      - Regulatory notification reports the incident and is sent to the identified regulator.
      - Required notification information and supporting evidence are confirmed complete.
      - Regulatory notification status is approved.
      - Submission occurs before the valid regulatory notification due time.
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - Linked evidence items substantiate both resolution and restoration; check their reliability and preserve relevant cybersecurity evidence.
      - "Every IT service and business service impacted by the incident has health state healthy, or its residual condition has been explicitly accepted for closure; degraded or unknown alone does not establish acceptance."
      - "Required communications linked to the incident are confirmed complete through delivery checks, not merely by a sent time or status."
      - Major-incident and cybersecurity-incident designations are established rather than assumed false when missing.
      - "If either designation is true, a linked post-incident review is confirmed scheduled through review arrangements or completed, rather than inferred from the link alone."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set Alert status to acknowledged and record its acknowledgementTime.
    verification: Read back Alert status as acknowledged and confirm acknowledgementTime is recorded.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions:
      - canAssignIncidentToResolverGroup
    effect: Record Incident isAssignedTo the proposed ResolverGroup; do not infer assignment of an OnCallEngineer.
    verification: Read back the Incident isAssignedTo link and confirm it identifies the proposed ResolverGroup.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Set majorIncidentDesignation to true, record majorIncidentDeclarationTime, and start coordination and communication cadence with the assigned IncidentCommander."
    verification: "Read back the Incident designation and declaration time; confirm its isCoordinatedBy link and verify that coordination and communication cadence started through the commander and linked Communication records, without treating a link alone as proof of sending."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: Execute approved containment steps within the recorded scope; set Incident status to contained only after containment has been verified.
    verification: "Check containment indicators and remaining impact on the Incident's impacted IT services and affected ConfigurationItems where within scope; read back Incident status as contained only if verification passed."
  failOverAffectedITService:
    input: Incident
    preconditions:
      - canFailOverITService
    effect: Move the workload of the ITService impacted by the Incident to the supplied and checked recovery Environment using the applicable RecoveryPlan; record the Incident isRecoveredWith link when that plan is actually used and update the ITService isDeployedIn link to the actual environment.
    verification: "Check ITService healthState and critical business transactions in the recovery Environment and retain the results; confirm the service's actual isDeployedIn link and the Incident isRecoveredWith link after the move."
  restoreDataFromBackupSet:
    input: BackupSet
    preconditions:
      - canRestoreBackupSet
    effect: "Restore from the BackupSet to the specific approved ConfigurationItem it protects at the approved restore point and target Environment; when an Incident is supplied with the restore decision, retain the restoration results as EvidenceItems supporting that supplied Incident through its isSupportedBy link, without inferring the Incident from the BackupSet."
    verification: "Verify data integrity and application functionality for the specific restored ConfigurationItem in the approved Environment; when an Incident was supplied, confirm its isSupportedBy link to retained restoration EvidenceItems."
  executeEmergencyChange:
    input: EmergencyChange
    preconditions:
      - canExecuteEmergencyChange
    effect: "Execute the EmergencyChange implementationPlan and update its status to implemented, failed or rolled back according to the actual outcome; retain EvidenceItems for the linked Incident where applicable."
    verification: "Check the technical result on modified ConfigurationItems and healthState of affected ITServices, read back the actual EmergencyChange status and confirm implementation EvidenceItems were retained for the Incident."
  sendCommunication:
    input: Incident
    preconditions:
      - canSendCommunication
    effect: Send the checked Communication linked through Incident isCommunicatedThrough and addressed to its intended Stakeholder; record Communication sentTime and update its status to the actual recorded sending state.
    verification: "Read back Communication sentTime and status; confirm delivery through delivery evidence and archive the final message, without treating a timestamp as proof of delivery."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the RegulatoryNotification to its linked Regulator about the Incident it reports; set its status to submitted and record submittedTime, retaining the submission receipt."
    verification: "Read back RegulatoryNotification status and submittedTime, check the retained receipt, then confirm acceptance or record rejected status and the required follow-up according to the actual outcome."
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: Set Incident status to closed and record its closedAt time after the closure checks pass.
    verification: Read back Incident status as closed and closedAt; check healthState of linked impacted ITServices and BusinessServices and retained EvidenceItems substantiating both resolution and restoration.


# CONSISTENCY CHECK — 3 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "acknowledgeAlert" has input class Alert, and its precondition canAcknowledgeAlert refers to ResolverGroup, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreDataFromBackupSet" has input class BackupSet, and its effect refers to EvidenceItem, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreDataFromBackupSet" has input class BackupSet, and its effect refers to Incident, which is only reachable against the direction of the relationships between them.

### Turn 100 — assistant

I’ve replayed the **21 questions persisted on the canvas**, rather than relying on our earlier wording. The model gives the agent a path or a defined check for each, with these limits:

| Questions | How the agent addresses them |
|---|---|
| **1, 3–4 — impacted business services, IT services, and configuration items** | Follow the Incident’s `impacts` links to each service and its `affects` link to **directly** affected configuration items. A dependency is not proof of impact. |
| **2 — correlated alerts and events** | Follow Incident → correlated Event; return non-triggering Alerts only through their `indicates` link to an event whose correlation was established. Report the triggering Alert separately. |
| **5 — service owner** | From an impacted IT service, find the Service owner through `owns`. |
| **6–7 — group and engineer** | Validate a *proposed* group against authoritative support arrangements, then check `isAssignedTo`. Check the current duty arrangement for who is on call; `isHandledBy` records who actually handled the incident. Neither can be inferred from membership or past assignment. |
| **8–9 — major coordination and materiality** | Use Incident status, severity, impacted service, and assigned commander with `canDeclareMajorIncident`. For materiality, follow `isEvaluatedBy` and check the assessment’s result, rationale, and assessed-at time; this does not prove notification submission. |
| **10–11 — candidate runbook and workaround** | Follow Incident → Problem → KnownError → Workaround → Runbook, checking the known error’s affected item and applicability. `isHandledWith` records a runbook *used*, not one automatically suitable. |
| **12–14 — backup and plan** | Use BackupSet `protects` ConfigurationItem; RecoveryPlan `uses` BackupSet and `recovers` an impacted IT service. Protection and applicability do not authorize a restore. |
| **15–18 — closure** | Follow the incident’s EvidenceItems, impacted IT and business services, Communications, and PostIncidentReview. `canCloseIncident` requires distinct resolution and restoration support, healthy or explicitly accepted residual conditions, completed required communications, and a verified booking or completed review when a designation requires one. |
| **19 — environments** | Follow the affected service’s `isDeployedIn` or item’s `belongsTo`; assess the **supplied** target’s availability and recovery point under `canFailOverITService`. No stored target is inferred. |
| **20 — commander** | Follow Incident `isCoordinatedBy` IncidentCommander and check the major designation separately. |
| **21 — channels** | Follow impacted BusinessService `isDeliveredThrough` CustomerChannel to find channels **to assess**; confirmed disruption needs the incident-specific operational impact check. |

I also replayed all **ten recorded actions**:

1. **Acknowledge alert:** `canAcknowledgeAlert`; read back `acknowledged` status and acknowledgement time.
2. **Assign incident to resolver group:** `canAssignIncidentToResolverGroup`; read back `isAssignedTo`, without assigning an engineer by implication.
3. **Declare major incident:** `canDeclareMajorIncident`; verify designation, declaration time, commander, and that coordination and communication cadence started.
4. **Contain incident:** `canContainIncident`; check containment indicators and remaining impact before reading back `contained`.
5. **Fail over affected IT service:** `canFailOverITService`; verify health, critical transactions, actual deployment environment, and plan used.
6. **Restore data from backup set:** `canRestoreBackupSet`; verify the specific target’s data integrity and application functionality, retaining evidence for the incident **supplied with the decision**.
7. **Execute emergency change:** `canExecuteEmergencyChange`; verify technical outcome, service health, actual change status, and evidence.
8. **Send communication:** `canSendCommunication`; verify delivery and archive the final message—sent time alone is insufficient.
9. **Submit regulatory notification:** `canSubmitRegulatoryNotification`; verify submitted time and receipt, then acceptance or rejection and follow-up.
10. **Close incident:** `canCloseIncident`; read back `closed` and `closedAt`, and check linked services and both kinds of supporting evidence.

**Competency-check result:** all 21 questions and ten actions have orientation in the recorded model, provided the specified external arrangements and decision-time checks are available. The canvas retains three navigation warnings: one for the alert’s externally verified responsible group and two for the incident supplied with a backup restore. Those are declared input boundaries, not facts to infer from missing relationships.

Does this replay accurately state what the agent can—and cannot—establish before I run the final checklist and automated second opinion?

### Turn 101 — user

Yes—that replay accurately states what the agent can establish and where it needs external arrangements or decision-time evidence; the navigation warnings should remain explicit boundaries, not inferred links.

### Turn 101 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 101 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which alerts and events are correlated with an incident?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: Which configuration items are affected by an incident?
  - id: cq5
    text: Who owns an affected IT service?
  - id: cq6
    text: "Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?"
  - id: cq7
    text: "For the proposed supporting resolver group, who is currently on call, and who actually handles the incident?"
  - id: cq8
    text: Does an incident warrant major-incident coordination?
  - id: cq9
    text: "Has a materiality assessment been completed for an incident, and what did it conclude?"
  - id: cq10
    text: "Which runbook is a traceable candidate for handling an incident, where an applicable known-error workaround documents one?"
  - id: cq11
    text: "Which workaround could temporarily reduce or bypass an incident's impact?"
  - id: cq12
    text: What does a candidate backup protect?
  - id: cq13
    text: Which backup set does the recovery plan for an affected IT service use?
  - id: cq14
    text: Which recovery plan applies to an affected IT service?
  - id: cq15
    text: What resolution and restoration evidence is required to close an incident?
  - id: cq16
    text: "Are all impacted services healthy, or is their residual condition accepted for incident closure?"
  - id: cq17
    text: Have required stakeholder communications been completed before incident closure?
  - id: cq18
    text: "For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
  - id: cq19
    text: "What environment is an affected IT service or configuration item in, and is the supplied failover target suitable?"
  - id: cq20
    text: Who is the incident commander for a major incident?
  - id: cq21
    text: "Which customer channels deliver an impacted business service, and which of those have confirmed disruption?"
classes:
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
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
      majorIncidentDesignation:
        type: boolean
      cybersecurityIncidentDesignation:
        type: boolean
      majorIncidentDeclarationTime:
        type: date
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      closedAt:
        type: date
  Alert:
    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.
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
      acknowledgementTime:
        type: date
  Event:
    meaning: An observed occurrence.
    aliases:
      - esemény
    properties: {}
  ITService:
    meaning: "A managed technology capability whose impact, owner, and recovery arrangements need to be established."
    aliases:
      - technology service
      - informatikai szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially unavailable
          - unavailable
          - recovering
          - unknown
  BusinessService:
    meaning: A customer- or business-facing capability that may be affected by an incident.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially unavailable
          - unavailable
          - recovering
          - unknown
  CustomerChannel:
    meaning: "A way customers access a business service, distinct from the service itself."
    aliases:
      - ügyfélcsatorna
    properties: {}
  ConfigurationItem:
    meaning: A managed component in configuration-management scope that may be directly affected by an incident.
    aliases:
      - CI
      - konfigurációs elem
    properties: {}
  Environment:
    meaning: "A deployment context for an IT service or configuration item, including a possible failover target."
    aliases:
      - környezet
    properties: {}
  ServiceOwner:
    meaning: The actor accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: The team assigned to diagnose and restore an incident within its area of support.
    aliases:
      - support group
      - megoldócsoport
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group who may handle a time-critical incident response.
    aliases:
      - on-call
      - ügyeletes mérnök
    properties: {}
  IncidentCommander:
    meaning: "The actor who commands a major incident's coordination and decision cadence."
    aliases:
      - incident manager
      - major-incident lead
      - incidensparancsnok
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - playbook
      - üzemeltetési eljárás
    properties: {}
  Workaround:
    meaning: "A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it."
    aliases:
      - kerülőmegoldás
    properties: {}
  RecoveryPlan:
    meaning: A plan describing how to restore an IT service and its dependencies.
    aliases:
      - DR plan
      - helyreállítási terv
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  BackupSet:
    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.
    aliases:
      - backup
      - mentéskészlet
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
  MaterialityAssessment:
    meaning: "A record of an incident's significance, rationale, and reporting implication."
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
      assessedAt:
        type: date
  RegulatoryNotification:
    meaning: "A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
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
      dueTime:
        type: date
      submittedTime:
        type: date
  Communication:
    meaning: A record of a message to an appropriate audience concerning an incident or its response.
    aliases:
      - stakeholder communication
      - notification
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
      sentTime:
        type: date
  PostIncidentReview:
    meaning: "A structured review of an incident's causes, response, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
  EmergencyChange:
    meaning: An accelerated change executed as part of an incident response.
    aliases:
      - emergency fix
      - sürgősségi változás
    properties:
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
          - rolled back
          - closed
          - cancelled
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
  EvidenceItem:
    meaning: "A preserved record or artifact documenting an incident, including support for resolution or restoration."
    aliases:
      - incident evidence
      - evidence
      - bizonyíték
    properties:
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      collectedAt:
        type: date
      cryptographicHash:
        type: text
  Stakeholder:
    meaning: An identifiable recipient of a communication about an incident or its response.
    aliases:
      - érintett
    properties: {}
  Regulator:
    meaning: The receiving authority for a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  Problem:
    meaning: The underlying or potential cause of one or more incidents.
    aliases:
      - probléma
    properties:
      status:
        type: text
        allowed:
          - new
          - investigating
          - root cause known
          - known error
          - resolved
          - closed
  KnownError:
    meaning: A diagnosed problem with a documented cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: An IT service established as impacted by this incident.
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "A configuration item directly affected by this incident, rather than merely on a dependency path."
    aliases: []
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "A business service established as impacted by this incident, not just dependent on an impacted IT service."
    aliases: []
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.
    aliases: []
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption.
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: "The observed occurrence indicated by the alert, without automatically correlating it to an incident."
    aliases: []
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: The alert that prompted the managed incident response after triage.
    aliases: []
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: An observed event established as correlated with the incident during investigation.
    aliases: []
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.
    aliases: []
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support."
    aliases: []
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer who actually handles this incident, independent of group membership."
    aliases: []
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: The incident commander assigned to coordinate the incident; assignment precedes and does not itself constitute a major-incident declaration.
    aliases: []
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: The IT service that this recovery plan is designed to restore.
    aliases: []
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "The recovery plan actually used for the incident, distinct from plans merely applicable to affected services."
    aliases: []
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set specified for use by the recovery plan.
    aliases: []
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item protected by this backup set; protection alone does not authorize a restore.
    aliases: []
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is currently deployed.
    aliases: []
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: The deployment environment to which the configuration item belongs.
    aliases: []
  - name: isHandledWith
    from: Incident
    to: Runbook
    meaning: "The runbook actually used to handle the incident, not necessarily every runbook that might be suitable."
    aliases: []
  - name: isDocumentedIn
    from: Workaround
    to: Runbook
    meaning: The maintained runbook documenting the workaround.
    aliases: []
  - name: isLinkedTo
    from: Incident
    to: Problem
    meaning: A problem linked to the incident as an underlying or potential cause.
    aliases: []
  - name: isDocumentedBy
    from: Problem
    to: KnownError
    meaning: The known error documenting a diagnosed problem.
    aliases: []
  - name: has
    from: KnownError
    to: Workaround
    meaning: "A workaround documented for the known error, not an automatic authorization to apply it."
    aliases: []
  - name: affects
    from: KnownError
    to: ConfigurationItem
    meaning: "A configuration item affected by the known error, helping assess candidate workaround relevance."
    aliases: []
  - name: isEvaluatedBy
    from: Incident
    to: MaterialityAssessment
    meaning: "The materiality assessment recording the incident's significance, rationale, and reporting implication."
    aliases: []
  - name: triggers
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The notification called for by a reportable assessment; triggering does not mean it was approved or submitted.
    aliases: []
  - name: isSentTo
    from: RegulatoryNotification
    to: Regulator
    meaning: The receiving regulatory authority specified for this notification.
    aliases: []
  - name: reports
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that this formal regulatory notification concerns.
    aliases: []
  - name: isCommunicatedThrough
    from: Incident
    to: Communication
    meaning: A communication about the incident whose completion must be checked separately.
    aliases: []
  - name: isSupportedBy
    from: Incident
    to: EvidenceItem
    meaning: "An evidence item documenting the incident, including its resolution or restoration."
    aliases: []
  - name: isReviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: "A review linked to the incident, including one scheduled but not yet held."
    aliases: []
  - name: isAddressedTo
    from: Communication
    to: Stakeholder
    meaning: The identifiable intended recipient of the communication.
    aliases: []
  - name: isJustifiedBy
    from: EmergencyChange
    to: Incident
    meaning: The active incident that justifies execution of the emergency change.
    aliases: []
  - name: modifies
    from: EmergencyChange
    to: ConfigurationItem
    meaning: A configuration item intended to be modified by the emergency change.
    aliases: []
rules:
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - "The proposed responsible resolver group is verified against the bank's responsible-group arrangements and the operator is authorized for that group."
  canAssignIncidentToResolverGroup:
    conditions:
      - Incident status is a valid recorded value other than closed or cancelled.
      - The incident impacts an IT service or affects a configuration item.
      - "The proposed resolver group is verified against the bank's authoritative support arrangements as supporting at least one of those affected IT services or configuration items."
  canDeclareMajorIncident:
    conditions:
      - "Incident status is a valid recorded value other than resolved, closed or cancelled."
      - Incident severity is sev1-critical or sev2-high.
      - Incident impacts at least one IT service.
      - Incident is coordinated by an assigned incident commander.
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - Containment scope and expected side effects are recorded with the proposed containment decision.
      - The containment steps to be executed are approved.
  canFailOverITService:
    conditions:
      - The IT service is impacted by the incident and the proposed recovery plan recovers that IT service.
      - The supplied target environment is confirmed available at the time of failover.
      - "The proposed data-recovery point is confirmed acceptable under the bank's approved recovery procedure; establish or normalize units before comparing recovery-point values."
  canRestoreBackupSet:
    conditions:
      - Backup set status is successful or verified.
      - Backup set protects the target configuration item.
      - The restore point and target environment are approved for this restore.
  canExecuteEmergencyChange:
    conditions:
      - Emergency change is justified by an incident confirmed active for this action; no specific incident-status list is defined.
      - Emergency change implementation plan and backout plan are present.
      - Emergency change modifies identified configuration items.
      - "Emergency change status and risk level have been established, without treating approved status or a risk level as risk acceptance."
      - Explicit risk acceptance for this emergency change is verified separately.
  canSendCommunication:
    conditions:
      - "Communication audience, message, owner and approval state are recorded for the proposed send; do not infer approval from a particular status alone."
      - The full communication content matches the latest verified state of its linked incident; a message summary alone does not prove this.
  canSubmitRegulatoryNotification:
    conditions:
      - "The notification's linked materiality assessment has result reportable."
      - Regulatory notification reports the incident and is sent to the identified regulator.
      - Required notification information and supporting evidence are confirmed complete.
      - Regulatory notification status is approved.
      - Submission occurs before the valid regulatory notification due time.
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - Linked evidence items substantiate both resolution and restoration; check their reliability and preserve relevant cybersecurity evidence.
      - "Every IT service and business service impacted by the incident has health state healthy, or its residual condition has been explicitly accepted for closure; degraded or unknown alone does not establish acceptance."
      - "Required communications linked to the incident are confirmed complete through delivery checks, not merely by a sent time or status."
      - Major-incident and cybersecurity-incident designations are established rather than assumed false when missing.
      - "If either designation is true, a linked post-incident review is confirmed scheduled through review arrangements or completed, rather than inferred from the link alone."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set Alert status to acknowledged and record its acknowledgementTime.
    verification: Read back Alert status as acknowledged and confirm acknowledgementTime is recorded.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions:
      - canAssignIncidentToResolverGroup
    effect: Record Incident isAssignedTo the proposed ResolverGroup; do not infer assignment of an OnCallEngineer.
    verification: Read back the Incident isAssignedTo link and confirm it identifies the proposed ResolverGroup.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Set majorIncidentDesignation to true, record majorIncidentDeclarationTime, and start coordination and communication cadence with the assigned IncidentCommander."
    verification: "Read back the Incident designation and declaration time; confirm its isCoordinatedBy link and verify that coordination and communication cadence started through the commander and linked Communication records, without treating a link alone as proof of sending."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: Execute approved containment steps within the recorded scope; set Incident status to contained only after containment has been verified.
    verification: "Check containment indicators and remaining impact on the Incident's impacted IT services and affected ConfigurationItems where within scope; read back Incident status as contained only if verification passed."
  failOverAffectedITService:
    input: Incident
    preconditions:
      - canFailOverITService
    effect: Move the workload of the ITService impacted by the Incident to the supplied and checked recovery Environment using the applicable RecoveryPlan; record the Incident isRecoveredWith link when that plan is actually used and update the ITService isDeployedIn link to the actual environment.
    verification: "Check ITService healthState and critical business transactions in the recovery Environment and retain the results; confirm the service's actual isDeployedIn link and the Incident isRecoveredWith link after the move."
  restoreDataFromBackupSet:
    input: BackupSet
    preconditions:
      - canRestoreBackupSet
    effect: "Restore from the BackupSet to the specific approved ConfigurationItem it protects at the approved restore point and target Environment; when an Incident is supplied with the restore decision, retain the restoration results as EvidenceItems supporting that supplied Incident through its isSupportedBy link, without inferring the Incident from the BackupSet."
    verification: "Verify data integrity and application functionality for the specific restored ConfigurationItem in the approved Environment; when an Incident was supplied, confirm its isSupportedBy link to retained restoration EvidenceItems."
  executeEmergencyChange:
    input: EmergencyChange
    preconditions:
      - canExecuteEmergencyChange
    effect: "Execute the EmergencyChange implementationPlan and update its status to implemented, failed or rolled back according to the actual outcome; retain EvidenceItems for the linked Incident where applicable."
    verification: "Check the technical result on modified ConfigurationItems and healthState of affected ITServices, read back the actual EmergencyChange status and confirm implementation EvidenceItems were retained for the Incident."
  sendCommunication:
    input: Incident
    preconditions:
      - canSendCommunication
    effect: Send the checked Communication linked through Incident isCommunicatedThrough and addressed to its intended Stakeholder; record Communication sentTime and update its status to the actual recorded sending state.
    verification: "Read back Communication sentTime and status; confirm delivery through delivery evidence and archive the final message, without treating a timestamp as proof of delivery."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the RegulatoryNotification to its linked Regulator about the Incident it reports; set its status to submitted and record submittedTime, retaining the submission receipt."
    verification: "Read back RegulatoryNotification status and submittedTime, check the retained receipt, then confirm acceptance or record rejected status and the required follow-up according to the actual outcome."
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: Set Incident status to closed and record its closedAt time after the closure checks pass.
    verification: Read back Incident status as closed and closedAt; check healthState of linked impacted ITServices and BusinessServices and retained EvidenceItems substantiating both resolution and restoration.


# CONSISTENCY CHECK — 3 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "acknowledgeAlert" has input class Alert, and its precondition canAcknowledgeAlert refers to ResolverGroup, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreDataFromBackupSet" has input class BackupSet, and its effect refers to EvidenceItem, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreDataFromBackupSet" has input class BackupSet, and its effect refers to Incident, which is only reachable against the direction of the relationships between them.

# SECOND-OPINION MODEL CHECK — 2 observation(s) from a separate automated review (report these to the expert, marked as model-derived, the same as the deterministic findings above; not authoritative on their own, but not to be dismissed without checking):
#   [model-review] The effect retains EvidenceItems for the linked Incident only where applicable, but verification unconditionally requires implementation EvidenceItems to have been retained.
#   [model-review] The effect establishes submission and a receipt, but verification requires an acceptance or rejection outcome that submission alone cannot establish.

### Turn 101 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  executeEmergencyChange:\n    input: EmergencyChange\n    preconditions: [canExecuteEmergencyChange]\n    effect: Execute the EmergencyChange implementationPlan, update its status to implemented, failed or rolled back according to the actual outcome, and retain implementation EvidenceItems supporting the Incident linked through isJustifiedBy.\n    verification: Check the technical result on modified ConfigurationItems and healthState of impacted ITServices; read back the actual EmergencyChange status and confirm the linked Incident isSupportedBy the retained implementation EvidenceItems.\n  submitRegulatoryNotification:\n    input: RegulatoryNotification\n    preconditions: [canSubmitRegulatoryNotification]\n    effect: Submit the RegulatoryNotification to its linked Regulator about the Incident it reports; set its status to submitted and record submittedTime, retaining the submission receipt.\n    verification: Read back RegulatoryNotification status and submittedTime and check the retained receipt; subsequently check the authority's response and confirm accepted status or record rejected status and required follow-up when that outcome is available. A submitted status or receipt alone does not establish acceptance."
}
```

### Turn 101 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 101 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 101 — tool

competency_questions:
  - id: cq1
    text: Which business services are impacted by an incident?
  - id: cq2
    text: Which alerts and events are correlated with an incident?
  - id: cq3
    text: Which IT services are affected by an incident?
  - id: cq4
    text: Which configuration items are affected by an incident?
  - id: cq5
    text: Who owns an affected IT service?
  - id: cq6
    text: "Does the proposed resolver group support an IT service or configuration item affected by this incident, and can the incident be assigned to it?"
  - id: cq7
    text: "For the proposed supporting resolver group, who is currently on call, and who actually handles the incident?"
  - id: cq8
    text: Does an incident warrant major-incident coordination?
  - id: cq9
    text: "Has a materiality assessment been completed for an incident, and what did it conclude?"
  - id: cq10
    text: "Which runbook is a traceable candidate for handling an incident, where an applicable known-error workaround documents one?"
  - id: cq11
    text: "Which workaround could temporarily reduce or bypass an incident's impact?"
  - id: cq12
    text: What does a candidate backup protect?
  - id: cq13
    text: Which backup set does the recovery plan for an affected IT service use?
  - id: cq14
    text: Which recovery plan applies to an affected IT service?
  - id: cq15
    text: What resolution and restoration evidence is required to close an incident?
  - id: cq16
    text: "Are all impacted services healthy, or is their residual condition accepted for incident closure?"
  - id: cq17
    text: Have required stakeholder communications been completed before incident closure?
  - id: cq18
    text: "For a major or cybersecurity incident, has a post-incident review been scheduled or completed before closure?"
  - id: cq19
    text: "What environment is an affected IT service or configuration item in, and is the supplied failover target suitable?"
  - id: cq20
    text: Who is the incident commander for a major incident?
  - id: cq21
    text: "Which customer channels deliver an impacted business service, and which of those have confirmed disruption?"
classes:
  Incident:
    meaning: "A managed response to an unplanned interruption, degradation, or security condition."
    aliases: []
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
      majorIncidentDesignation:
        type: boolean
      cybersecurityIncidentDesignation:
        type: boolean
      majorIncidentDeclarationTime:
        type: date
      severity:
        type: text
        allowed:
          - sev1-critical
          - sev2-high
          - sev3-medium
          - sev4-low
      closedAt:
        type: date
  Alert:
    meaning: A signal requiring triage or acknowledgement that may indicate an event or lead to an incident.
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
      acknowledgementTime:
        type: date
  Event:
    meaning: An observed occurrence.
    aliases:
      - esemény
    properties: {}
  ITService:
    meaning: "A managed technology capability whose impact, owner, and recovery arrangements need to be established."
    aliases:
      - technology service
      - informatikai szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially unavailable
          - unavailable
          - recovering
          - unknown
  BusinessService:
    meaning: A customer- or business-facing capability that may be affected by an incident.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
        allowed:
          - healthy
          - degraded
          - partially unavailable
          - unavailable
          - recovering
          - unknown
  CustomerChannel:
    meaning: "A way customers access a business service, distinct from the service itself."
    aliases:
      - ügyfélcsatorna
    properties: {}
  ConfigurationItem:
    meaning: A managed component in configuration-management scope that may be directly affected by an incident.
    aliases:
      - CI
      - konfigurációs elem
    properties: {}
  Environment:
    meaning: "A deployment context for an IT service or configuration item, including a possible failover target."
    aliases:
      - környezet
    properties: {}
  ServiceOwner:
    meaning: The actor accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  ResolverGroup:
    meaning: The team assigned to diagnose and restore an incident within its area of support.
    aliases:
      - support group
      - megoldócsoport
    properties: {}
  OnCallEngineer:
    meaning: A member of a resolver group who may handle a time-critical incident response.
    aliases:
      - on-call
      - ügyeletes mérnök
    properties: {}
  IncidentCommander:
    meaning: "The actor who commands a major incident's coordination and decision cadence."
    aliases:
      - incident manager
      - major-incident lead
      - incidensparancsnok
    properties: {}
  Runbook:
    meaning: "A maintained procedure for diagnosis, response, recovery, or verification."
    aliases:
      - playbook
      - üzemeltetési eljárás
    properties: {}
  Workaround:
    meaning: "A temporary way to reduce or bypass an incident's impact, distinct from the procedure that may document it."
    aliases:
      - kerülőmegoldás
    properties: {}
  RecoveryPlan:
    meaning: A plan describing how to restore an IT service and its dependencies.
    aliases:
      - DR plan
      - helyreállítási terv
    properties:
      recoveryTimeObjective:
        type: number
      recoveryPointObjective:
        type: number
      lastReviewDate:
        type: date
  BackupSet:
    meaning: A defined collection of recoverable data that can protect configuration items and be used by a recovery plan.
    aliases:
      - backup
      - mentéskészlet
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
  MaterialityAssessment:
    meaning: "A record of an incident's significance, rationale, and reporting implication."
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      result:
        type: text
        allowed:
          - not reportable
          - potentially reportable
          - reportable
          - undetermined
      rationale:
        type: text
      assessedAt:
        type: date
  RegulatoryNotification:
    meaning: "A formal submission about an incident to a regulator, distinct from the assessment that may call for it."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
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
      dueTime:
        type: date
      submittedTime:
        type: date
  Communication:
    meaning: A record of a message to an appropriate audience concerning an incident or its response.
    aliases:
      - stakeholder communication
      - notification
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
      sentTime:
        type: date
  PostIncidentReview:
    meaning: "A structured review of an incident's causes, response, lessons, and follow-up work."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOn:
        type: date
  EmergencyChange:
    meaning: An accelerated change executed as part of an incident response.
    aliases:
      - emergency fix
      - sürgősségi változás
    properties:
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
          - rolled back
          - closed
          - cancelled
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
  EvidenceItem:
    meaning: "A preserved record or artifact documenting an incident, including support for resolution or restoration."
    aliases:
      - incident evidence
      - evidence
      - bizonyíték
    properties:
      integrityStatus:
        type: text
        allowed:
          - collected
          - hashed
          - verified
          - sealed
          - compromised
      collectedAt:
        type: date
      cryptographicHash:
        type: text
  Stakeholder:
    meaning: An identifiable recipient of a communication about an incident or its response.
    aliases:
      - érintett
    properties: {}
  Regulator:
    meaning: The receiving authority for a regulatory notification.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  Problem:
    meaning: The underlying or potential cause of one or more incidents.
    aliases:
      - probléma
    properties:
      status:
        type: text
        allowed:
          - new
          - investigating
          - root cause known
          - known error
          - resolved
          - closed
  KnownError:
    meaning: A diagnosed problem with a documented cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: ITService
    meaning: An IT service established as impacted by this incident.
    aliases: []
  - name: affects
    from: Incident
    to: ConfigurationItem
    meaning: "A configuration item directly affected by this incident, rather than merely on a dependency path."
    aliases: []
  - name: impacts
    from: Incident
    to: BusinessService
    meaning: "A business service established as impacted by this incident, not just dependent on an impacted IT service."
    aliases: []
  - name: dependsOn
    from: BusinessService
    to: ITService
    meaning: An IT service on which the business service depends; dependency alone does not establish incident impact.
    aliases: []
  - name: isDeliveredThrough
    from: BusinessService
    to: CustomerChannel
    meaning: A customer channel through which the business service is delivered; use does not by itself establish channel disruption.
    aliases: []
  - name: indicates
    from: Alert
    to: Event
    meaning: "The observed occurrence indicated by the alert, without automatically correlating it to an incident."
    aliases: []
  - name: isTriggeredBy
    from: Incident
    to: Alert
    meaning: The alert that prompted the managed incident response after triage.
    aliases: []
  - name: isCorrelatedFrom
    from: Incident
    to: Event
    meaning: An observed event established as correlated with the incident during investigation.
    aliases: []
  - name: isMemberOf
    from: OnCallEngineer
    to: ResolverGroup
    meaning: The resolver group of which the on-call engineer is a member; membership alone does not establish incident handling.
    aliases: []
  - name: isAssignedTo
    from: Incident
    to: ResolverGroup
    meaning: "The resolver group actually assigned to diagnose and resolve the incident, distinct from suitability based on support."
    aliases: []
  - name: isHandledBy
    from: Incident
    to: OnCallEngineer
    meaning: "The on-call engineer who actually handles this incident, independent of group membership."
    aliases: []
  - name: owns
    from: ServiceOwner
    to: ITService
    meaning: The IT service for which the service owner is accountable across its lifecycle.
    aliases: []
  - name: isCoordinatedBy
    from: Incident
    to: IncidentCommander
    meaning: The incident commander assigned to coordinate the incident; assignment precedes and does not itself constitute a major-incident declaration.
    aliases: []
  - name: recovers
    from: RecoveryPlan
    to: ITService
    meaning: The IT service that this recovery plan is designed to restore.
    aliases: []
  - name: isRecoveredWith
    from: Incident
    to: RecoveryPlan
    meaning: "The recovery plan actually used for the incident, distinct from plans merely applicable to affected services."
    aliases: []
  - name: uses
    from: RecoveryPlan
    to: BackupSet
    meaning: The backup set specified for use by the recovery plan.
    aliases: []
  - name: protects
    from: BackupSet
    to: ConfigurationItem
    meaning: A configuration item protected by this backup set; protection alone does not authorize a restore.
    aliases: []
  - name: isDeployedIn
    from: ITService
    to: Environment
    meaning: The environment in which the IT service is currently deployed.
    aliases: []
  - name: belongsTo
    from: ConfigurationItem
    to: Environment
    meaning: The deployment environment to which the configuration item belongs.
    aliases: []
  - name: isHandledWith
    from: Incident
    to: Runbook
    meaning: "The runbook actually used to handle the incident, not necessarily every runbook that might be suitable."
    aliases: []
  - name: isDocumentedIn
    from: Workaround
    to: Runbook
    meaning: The maintained runbook documenting the workaround.
    aliases: []
  - name: isLinkedTo
    from: Incident
    to: Problem
    meaning: A problem linked to the incident as an underlying or potential cause.
    aliases: []
  - name: isDocumentedBy
    from: Problem
    to: KnownError
    meaning: The known error documenting a diagnosed problem.
    aliases: []
  - name: has
    from: KnownError
    to: Workaround
    meaning: "A workaround documented for the known error, not an automatic authorization to apply it."
    aliases: []
  - name: affects
    from: KnownError
    to: ConfigurationItem
    meaning: "A configuration item affected by the known error, helping assess candidate workaround relevance."
    aliases: []
  - name: isEvaluatedBy
    from: Incident
    to: MaterialityAssessment
    meaning: "The materiality assessment recording the incident's significance, rationale, and reporting implication."
    aliases: []
  - name: triggers
    from: MaterialityAssessment
    to: RegulatoryNotification
    meaning: The notification called for by a reportable assessment; triggering does not mean it was approved or submitted.
    aliases: []
  - name: isSentTo
    from: RegulatoryNotification
    to: Regulator
    meaning: The receiving regulatory authority specified for this notification.
    aliases: []
  - name: reports
    from: RegulatoryNotification
    to: Incident
    meaning: The incident that this formal regulatory notification concerns.
    aliases: []
  - name: isCommunicatedThrough
    from: Incident
    to: Communication
    meaning: A communication about the incident whose completion must be checked separately.
    aliases: []
  - name: isSupportedBy
    from: Incident
    to: EvidenceItem
    meaning: "An evidence item documenting the incident, including its resolution or restoration."
    aliases: []
  - name: isReviewedIn
    from: Incident
    to: PostIncidentReview
    meaning: "A review linked to the incident, including one scheduled but not yet held."
    aliases: []
  - name: isAddressedTo
    from: Communication
    to: Stakeholder
    meaning: The identifiable intended recipient of the communication.
    aliases: []
  - name: isJustifiedBy
    from: EmergencyChange
    to: Incident
    meaning: The active incident that justifies execution of the emergency change.
    aliases: []
  - name: modifies
    from: EmergencyChange
    to: ConfigurationItem
    meaning: A configuration item intended to be modified by the emergency change.
    aliases: []
rules:
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - "The proposed responsible resolver group is verified against the bank's responsible-group arrangements and the operator is authorized for that group."
  canAssignIncidentToResolverGroup:
    conditions:
      - Incident status is a valid recorded value other than closed or cancelled.
      - The incident impacts an IT service or affects a configuration item.
      - "The proposed resolver group is verified against the bank's authoritative support arrangements as supporting at least one of those affected IT services or configuration items."
  canDeclareMajorIncident:
    conditions:
      - "Incident status is a valid recorded value other than resolved, closed or cancelled."
      - Incident severity is sev1-critical or sev2-high.
      - Incident impacts at least one IT service.
      - Incident is coordinated by an assigned incident commander.
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - Containment scope and expected side effects are recorded with the proposed containment decision.
      - The containment steps to be executed are approved.
  canFailOverITService:
    conditions:
      - The IT service is impacted by the incident and the proposed recovery plan recovers that IT service.
      - The supplied target environment is confirmed available at the time of failover.
      - "The proposed data-recovery point is confirmed acceptable under the bank's approved recovery procedure; establish or normalize units before comparing recovery-point values."
  canRestoreBackupSet:
    conditions:
      - Backup set status is successful or verified.
      - Backup set protects the target configuration item.
      - The restore point and target environment are approved for this restore.
  canExecuteEmergencyChange:
    conditions:
      - Emergency change is justified by an incident confirmed active for this action; no specific incident-status list is defined.
      - Emergency change implementation plan and backout plan are present.
      - Emergency change modifies identified configuration items.
      - "Emergency change status and risk level have been established, without treating approved status or a risk level as risk acceptance."
      - Explicit risk acceptance for this emergency change is verified separately.
  canSendCommunication:
    conditions:
      - "Communication audience, message, owner and approval state are recorded for the proposed send; do not infer approval from a particular status alone."
      - The full communication content matches the latest verified state of its linked incident; a message summary alone does not prove this.
  canSubmitRegulatoryNotification:
    conditions:
      - "The notification's linked materiality assessment has result reportable."
      - Regulatory notification reports the incident and is sent to the identified regulator.
      - Required notification information and supporting evidence are confirmed complete.
      - Regulatory notification status is approved.
      - Submission occurs before the valid regulatory notification due time.
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - Linked evidence items substantiate both resolution and restoration; check their reliability and preserve relevant cybersecurity evidence.
      - "Every IT service and business service impacted by the incident has health state healthy, or its residual condition has been explicitly accepted for closure; degraded or unknown alone does not establish acceptance."
      - "Required communications linked to the incident are confirmed complete through delivery checks, not merely by a sent time or status."
      - Major-incident and cybersecurity-incident designations are established rather than assumed false when missing.
      - "If either designation is true, a linked post-incident review is confirmed scheduled through review arrangements or completed, rather than inferred from the link alone."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set Alert status to acknowledged and record its acknowledgementTime.
    verification: Read back Alert status as acknowledged and confirm acknowledgementTime is recorded.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions:
      - canAssignIncidentToResolverGroup
    effect: Record Incident isAssignedTo the proposed ResolverGroup; do not infer assignment of an OnCallEngineer.
    verification: Read back the Incident isAssignedTo link and confirm it identifies the proposed ResolverGroup.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Set majorIncidentDesignation to true, record majorIncidentDeclarationTime, and start coordination and communication cadence with the assigned IncidentCommander."
    verification: "Read back the Incident designation and declaration time; confirm its isCoordinatedBy link and verify that coordination and communication cadence started through the commander and linked Communication records, without treating a link alone as proof of sending."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: Execute approved containment steps within the recorded scope; set Incident status to contained only after containment has been verified.
    verification: "Check containment indicators and remaining impact on the Incident's impacted IT services and affected ConfigurationItems where within scope; read back Incident status as contained only if verification passed."
  failOverAffectedITService:
    input: Incident
    preconditions:
      - canFailOverITService
    effect: Move the workload of the ITService impacted by the Incident to the supplied and checked recovery Environment using the applicable RecoveryPlan; record the Incident isRecoveredWith link when that plan is actually used and update the ITService isDeployedIn link to the actual environment.
    verification: "Check ITService healthState and critical business transactions in the recovery Environment and retain the results; confirm the service's actual isDeployedIn link and the Incident isRecoveredWith link after the move."
  restoreDataFromBackupSet:
    input: BackupSet
    preconditions:
      - canRestoreBackupSet
    effect: "Restore from the BackupSet to the specific approved ConfigurationItem it protects at the approved restore point and target Environment; when an Incident is supplied with the restore decision, retain the restoration results as EvidenceItems supporting that supplied Incident through its isSupportedBy link, without inferring the Incident from the BackupSet."
    verification: "Verify data integrity and application functionality for the specific restored ConfigurationItem in the approved Environment; when an Incident was supplied, confirm its isSupportedBy link to retained restoration EvidenceItems."
  executeEmergencyChange:
    input: EmergencyChange
    preconditions:
      - canExecuteEmergencyChange
    effect: "Execute the EmergencyChange implementationPlan, update its status to implemented, failed or rolled back according to the actual outcome, and retain implementation EvidenceItems supporting the Incident linked through isJustifiedBy."
    verification: Check the technical result on modified ConfigurationItems and healthState of impacted ITServices; read back the actual EmergencyChange status and confirm the linked Incident isSupportedBy the retained implementation EvidenceItems.
  sendCommunication:
    input: Incident
    preconditions:
      - canSendCommunication
    effect: Send the checked Communication linked through Incident isCommunicatedThrough and addressed to its intended Stakeholder; record Communication sentTime and update its status to the actual recorded sending state.
    verification: "Read back Communication sentTime and status; confirm delivery through delivery evidence and archive the final message, without treating a timestamp as proof of delivery."
  submitRegulatoryNotification:
    input: RegulatoryNotification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the RegulatoryNotification to its linked Regulator about the Incident it reports; set its status to submitted and record submittedTime, retaining the submission receipt."
    verification: "Read back RegulatoryNotification status and submittedTime and check the retained receipt; subsequently check the authority's response and confirm accepted status or record rejected status and required follow-up when that outcome is available. A submitted status or receipt alone does not establish acceptance."
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: Set Incident status to closed and record its closedAt time after the closure checks pass.
    verification: Read back Incident status as closed and closedAt; check healthState of linked impacted ITServices and BusinessServices and retained EvidenceItems substantiating both resolution and restoration.


# CONSISTENCY CHECK — 3 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "acknowledgeAlert" has input class Alert, and its precondition canAcknowledgeAlert refers to ResolverGroup, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreDataFromBackupSet" has input class BackupSet, and its effect refers to EvidenceItem, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreDataFromBackupSet" has input class BackupSet, and its effect refers to Incident, which is only reachable against the direction of the relationships between them.

### Turn 101 — assistant

The final checklist is complete. The live model has **21 recorded questions, 26 connected classes, 35 directed relationships, ten decision rules, and ten actions**. Every class and relationship has a meaning; the relevant fixed-choice fields have allowed values; and the later-added Problem and KnownError records have been checked against the incident-to-workaround path. The ten actions have explicit preconditions, effects, and verification steps. No unconfirmed direct relationship was added to fill a path.

The canvas still reports **three navigation warnings**. They remain explicit boundaries: alert acknowledgement checks a proposed responsible group against the bank’s arrangements; a backup restore receives its incident as decision context and attaches evidence to that incident. The agent must not derive either from a relationship that was never established.

An **automated second opinion** raised two further observations. I checked and corrected both: emergency-change execution now retains the implementation evidence its verification requires, and regulatory-notification verification now treats acceptance or rejection as a **subsequent authority response**, not something proved by submission or a receipt.

The model is complete **for the accepted scope**, subject to the external arrangements and decision-time checks we explicitly identified. It does not claim automatic resolver-group selection, infer channel disruption, or treat a sent or submitted state as proof of delivery or acceptance.
