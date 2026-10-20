# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-20T19:33:57.877Z

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

We’ll start with what the agent must actually do, then build the concepts, connections, decisions, and actions needed to support it. The canvas is empty, and your scope is IT operations and major-incident management at your bank. We’ll work through roughly ten short phases and check the finished model against your requirements.

**First, what are 5–8 real questions the agent must be able to answer** during service operations or an incident? Use the wording your team would naturally use; we can add the remaining questions and the actions afterward.

### Turn 2 — user

The questions I’d put in front of an operations agent first are:

1. Which business services and customer channels are affected, and what is their current health?
2. What sits on the affected IT service’s dependency path—including configuration items and third-party services?
3. Which alerts and events are relevant to this incident, rather than just happening at the same time?
4. Who owns the affected service, and which resolver group and on-call engineer should take it?
5. Does this meet our bank’s criteria for declaring a major incident, and who will command the response?
6. Which runbook, workaround, backup set, or recovery plan can we safely use?
7. Could a recent change or deployment have caused the disruption?
8. Has materiality been assessed, and is a regulatory notification required and due?

I’d also want the agent to check evidence, communications, closure readiness, and outstanding corrective actions as we get to the later phases.

### Turn 2 — assistant

That gives us a strong starting set. I’ll turn compound questions into separate requirements so we can test each one later. Your first two points become these four questions:

1. Which business services and customer channels are affected by an incident?
2. What is the current health of each affected business service and customer channel?
3. Which IT services, configuration items, and third-party services are on an affected IT service’s dependency path?
4. Which alerts and events are relevant to an incident, rather than merely concurrent?

**Do these four preserve what you need, or should I change any wording or distinction?** I haven’t recorded them yet.

### Turn 3 — user

Mostly, but I’d change **question 2**. We track a health state for business services and IT services, not for customer channels. I’d ask: “What is the current health of each affected business service and supporting IT service, and which customer channels deliver those business services?” That keeps channel impact distinct from a channel health reading.

The other three work, with two useful clarifications:

- For **question 3**, the dependency path should include the IT service’s infrastructure and third-party dependencies; we also need to identify the relevant configuration items, not assume every item is directly linked to the service.
- For **question 4**, “relevant” means linked to the incident through its triggering alert or correlated events—not simply close in time.

### Turn 3 — assistant

Agreed: channel impact is not a channel health reading, and relevance needs an incident link rather than a time match. I’ve revised this first batch to:

1. Which business services and customer channels are affected by an incident?
2. What is the current health of each affected business service and supporting IT service?
3. Which customer channels deliver the affected business services?
4. Which infrastructure and third-party services are on an affected IT service’s dependency path?
5. Which configuration items are relevant along that dependency path?
6. Which alerts and events are linked to an incident through its triggering alert or correlated events?

**Is this revised batch accurate enough to record?**

### Turn 4 — user

Yes, that batch is accurate enough to record. I’d keep one distinction explicit when testing it: **a business service being delivered through a customer channel does not, by itself, prove the channel is disrupted**. Confirm the incident’s impact before calling the channel affected.

For question 5, identify configuration items from the documented technical dependencies and the items the incident affects; don’t infer a link merely because two items appear in the same environment.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Which business services and customer channels are affected by an incident?\n  - text: What is the current health of each affected business service and supporting IT service?\n  - text: Which customer channels deliver the affected business services?\n  - text: Which infrastructure and third-party services are on an affected IT service's dependency path?\n  - text: Which configuration items are relevant along that dependency path?\n  - text: Which alerts and events are linked to an incident through its triggering alert or correlated events?"
}
```

### Turn 4 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 4 — assistant

I’ve recorded those six questions, including your distinction that a channel delivering a business service is not necessarily disrupted. We’ll test channel impact against the incident itself, and identify configuration items through documented dependencies or incident impact—not shared environment alone.

Next, I’ve separated your ownership and response questions:

7. Who owns an affected IT service?
8. Which resolver group and on-call engineer should take an incident?
9. Does an incident meet the bank’s criteria for a major-incident declaration?
10. Who should command the response to a major incident?

**Do these four reflect your intended questions?**

### Turn 5 — user

Yes. Keep **service ownership** separate from **response assignment**: the service owner is accountable for the IT service, while the resolver group diagnoses and restores the incident, with an on-call engineer handling time-critical technical work.

For question 8, the resolver group needs to support an affected service or configuration item before we assign the incident to it. For questions 9 and 10, meeting the bank’s major-incident criteria is not the same as having declared one; declaration also needs an assigned incident commander.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Who owns an affected IT service?\n  - text: Which resolver group and on-call engineer should take an incident?\n  - text: Does an incident meet the bank's criteria for a major-incident declaration?\n  - text: Who should command the response to a major incident?"
}
```

### Turn 5 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

I’ve recorded questions 7–10. Service ownership, resolver assignment, and on-call work remain distinct; meeting major-incident criteria will not be treated as a declaration.

For your next three topics, I propose:

11. Which runbook, workaround, backup set, or recovery plan is applicable to an incident, and is it safe to use?
12. Could a recent change or deployment have caused an incident?
13. Has the incident’s materiality been assessed?
14. Is a regulatory notification required for the incident?
15. When is any required regulatory notification due?

**Are these the questions you want recorded, or should any be split or reworded?**

### Turn 6 — user

Yes, record them, with two qualifications.

For **11**, “applicable” and “safe to use” are separate checks. A runbook may guide the response, a workaround may bypass impact temporarily, a backup set protects particular components, and a recovery plan restores an IT service. We still have to check the conditions for the specific recovery action before executing it.

For **12**, keep “could have” rather than treating a recent change or deployment as a proven cause. Timing is a lead for investigation; the incident’s classification and evidence must support any conclusion.

Questions **13–15** work as separate decisions. Record the assessment and its rationale, then distinguish its reporting conclusion from the notification’s due time. The applicable reporting requirement comes from our approved procedure and the designated reporting function, not from an assumed deadline.

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Which runbook, workaround, backup set, or recovery plan is applicable to an incident?\n  - text: Are the conditions for using a proposed runbook, workaround, backup set, or recovery plan safely met for this incident?\n  - text: Could a recent change or deployment have caused an incident, based on its classification and evidence?\n  - text: Has the incident's materiality been assessed, and what rationale was recorded?\n  - text: Is a regulatory notification required for the incident under the approved procedure and designated reporting function's conclusion?\n  - text: When is any required regulatory notification due under the applicable reporting requirement?"
}
```

### Turn 6 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 6 — assistant

I’ve recorded six separate questions for applicability, safe use, possible change-related cause, materiality and rationale, reporting need, and the applicable notification deadline. None assumes that a recent change proves cause or that the agent can invent a reporting deadline.

You also flagged evidence, communications, closure, and corrective actions. I’d make those the final four questions in this phase:

17. What evidence supports the incident’s impact, classification, decisions, and recovery?
18. Which stakeholders need an update about the incident, and what has been communicated?
19. Is the incident ready to close?
20. Which corrective actions remain outstanding after the incident?

**Are these four real questions for the agent, and does any wording need changing?**

### Turn 7 — user

Yes, all four are real questions. I’d sharpen two of them before recording:

- **17:** “What evidence supports the incident’s impact, classification, decisions, and recovery, and is that evidence’s integrity preserved?” The record matters, but so does whether we can rely on it.
- **20:** “Which corrective actions from post-incident reviews remain outstanding for the affected service?” That includes actions from *prior* incidents, not just follow-up from the current one.

**18** works: distinguish who needs an update from what was actually sent, and check the message against the latest verified incident state. **19** works too, but “ready to close” must include restored service health or an accepted residual condition, restoration evidence, required communications, and—where applicable—a scheduled or completed post-incident review.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What evidence supports an incident's impact, classification, decisions, and recovery, and is its integrity preserved?\n  - text: Which stakeholders need an incident update, and what has actually been communicated against the latest verified incident state?\n  - text: Is an incident ready to close, including restored service health or an accepted residual condition, restoration evidence, required communications, and any applicable post-incident review?\n  - text: Which corrective actions from post-incident reviews remain outstanding for the affected service, including actions from prior incidents?"
}
```

### Turn 7 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 7 — assistant

I’ve recorded those four, bringing us to 20 questions. Evidence integrity, verified-state communications, closure conditions, and corrective actions from earlier incidents are explicit requirements.

Now for the **actions**: what are 5–10 things the agent must be able to carry out or initiate—not just answer questions about? Please name the actions in your team’s terms.

### Turn 8 — user

These are the actions I’d expect the agent to support. Some can be executed through an authorised workflow; others should be initiated for the responsible team rather than performed autonomously.

1. Acknowledge an alert.
2. Assign an incident to a resolver group.
3. Declare a major incident and start the coordination cadence.
4. Contain an incident.
5. Fail over an IT service to its recovery environment.
6. Restore data from a backup set.
7. Execute an emergency change.
8. Send a stakeholder update.
9. Submit an approved regulatory notification.
10. Close an incident.

For each, I’d want the agent to check the action’s prerequisites, confirm the result, and retain the relevant record. “Safe to use” cannot be decided from a runbook or plan title alone.

### Turn 8 — assistant

Those are ten distinct actions. I’ll treat “execute” versus “initiate for the responsible team” as an authorization/workflow distinction to establish when we define each action—not assume the agent may perform all ten autonomously. Each will need prerequisites, a result check, and a retained record.

**Is this list of ten actions accepted as the action requirements, with exactly the names you gave?**

### Turn 9 — user

The ten names are accurate, but I wouldn’t accept the list as **complete**. Add **“isolate a configuration item”** as a separate action. Containing an incident is the broader response; isolating a specific affected item has its own impact assessment and requires a way to roll back or reconnect it.

With that addition, the action requirements are ready to record.

### Turn 9 — assistant

The action requirements are now 11, with **isolate a configuration item** separate from broader incident containment. I’ll record each as an action when we establish its prerequisites, effect, and verification; for now, these are the agreed requirements. This completes the main questions-and-actions list, subject to one narrow scope check.

For the **service owner, resolver group, on-call engineer, incident commander, and designated reporting function**: is there a closely related role under any of them that actually does the day-to-day work, and does any of this depend on a specific operating context that changes how it’s handled?

### Turn 10 — user

Yes. Those roles sit alongside operational teams that do different day-to-day work:

- The **service desk** receives and records user-reported issues, then triages and routes them.
- The **IT operations team** operates IT services; the **network operations centre** operates monitoring for network and infrastructure; and the **security operations centre** monitors security events.
- A **resolver group** diagnoses and restores an assigned incident. An **on-call engineer** belongs to a resolver group and handles time-critical technical work.
- For a **major incident**, the incident response team coordinates the response, while the incident commander directs it. That is different from the service owner’s ongoing accountability for the IT service.

Context does matter: the affected service and configuration items, their environment, the incident’s impact and severity, and whether it involves cybersecurity or a major incident all affect the response path. For reporting, operations supplies verified facts and evidence; the materiality assessment and approved reporting procedure determine whether a notification proceeds. I wouldn’t model the “designated reporting function” as a subtype of any of those operational roles.

### Turn 10 — assistant

That clarifies the operating context: the affected service and configuration items, environment, impact, severity, and cybersecurity or major-incident status can change the response path. I’ll keep service ownership, technical response, major-incident coordination, and reporting distinct. The service desk, IT operations team, network operations centre, security operations centre, and incident response team are **candidates** for the model, not automatically included merely because they exist.

We now have 20 recorded questions and 11 agreed action requirements. **Does that capture the requirements phase accurately before we test which kinds of things the agent needs to identify or connect?**

### Turn 11 — user

Yes, that captures the requirements phase accurately. Keep the team concepts only where they help answer a recorded question or carry out an action, and keep reporting decisions tied to the documented assessment and approved procedure. We’re ready to identify the things the agent needs to distinguish and connect.

### Turn 11 — assistant

We’ll start with four central concepts. Each has a direct job in the recorded questions: **Incident** for impact and response decisions; **Business Service** and **IT Service** for affected-service health; and **Customer Channel** for delivery and confirmed channel impact.

Does the agent need to identify or connect **each of those four as a distinct thing** to answer those questions? For any you keep, are these your team’s names for them, or would you use a different term?

### Turn 12 — user

Yes—keep all four distinct, and those are terms I’d use.

An **incident** records the disruption or security condition and can impact an **IT service** or **business service**. A business service is the capability the bank delivers; it depends on supporting IT services and is delivered through a **customer channel**, which is how customers access it.

We track health for business and IT services, not for customer channels. A delivery link helps us investigate channel impact, but it does not by itself confirm that the channel is disrupted.

### Turn 12 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    meaning: A recorded disruption or security condition that may impact an IT service or business service.\n  Business Service:\n    meaning: A capability the bank delivers to its users.\n  IT Service:\n    meaning: A service supporting bank capabilities whose operational health is tracked.\n  Customer Channel:\n    meaning: A way customers access a business service."
}
```

### Turn 12 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 12 — assistant

I’ve added those four as separate concepts, using your names. Their meanings preserve the distinction between a channel delivering a business service and an incident actually disrupting that channel.

For the dependency and alert questions, the next candidates are **Configuration Item**, **Infrastructure Dependency**, **Third-Party Service**, **Alert**, and **Event**. Does the agent need to identify or connect each separately to trace technical dependencies and distinguish a triggering alert from correlated events? Are those the names your team uses, or would you call any of them something else?

### Turn 13 — user

Keep **configuration item**, **third-party service**, **alert**, and **event** as distinct concepts. Those names work for us. An alert can trigger an incident; events can be correlated with it. Neither should be treated as relevant just because it occurred nearby in time.

I’d put the fifth name a little differently. **“Infrastructure dependency”** describes a relationship, not the thing we manage: an IT service *runs on* an infrastructure component. A configuration item is a component recorded in configuration-management scope, so don’t automatically treat every infrastructure component as a recorded configuration item. Separately, an IT service can *depend on* a third-party service.

### Turn 13 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Configuration Item:\n    meaning: A component recorded in configuration-management scope.\n  Third-Party Service:\n    meaning: A service provided by an external party that an IT service can depend on.\n  Alert:\n    meaning: A monitoring signal that may trigger an incident.\n  Event:\n    meaning: An observed occurrence that may be correlated with an incident."
}
```

### Turn 13 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 13 — assistant

I’ve added **Configuration Item**, **Third-Party Service**, **Alert**, and **Event**. I did not add “Infrastructure Dependency” as a thing: you use it for a connection. I’m also keeping event correlation separate from mere timing.

For the dependency-path question, does the agent need to identify the **Infrastructure Component** an IT service runs on as a distinct thing, even when it is not a recorded Configuration Item? Is “Infrastructure Component” your term for it?

### Turn 14 — user

Yes. Keep **infrastructure component** distinct: an IT service runs on it, while a configuration item is a managed component recorded in configuration-management scope. An infrastructure component may be recorded as a configuration item, but don’t assume every one is.

“Infrastructure component” is a term I’d use. It lets us trace what supports a service without claiming that every dependency has a configuration record.

### Turn 14 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Infrastructure Component:\n    meaning: A component on which an IT service runs, whether or not it is recorded as a configuration item."
}
```

### Turn 14 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 14 — assistant

I’ve added **Infrastructure Component** separately from **Configuration Item**. That lets us trace service dependencies without assuming every component has a configuration record.

For ownership and assignment questions, the agent may need to distinguish **Service Owner**, **Resolver Group**, **On-Call Engineer**, and **Incident Commander**. Does it need to identify each separately to answer who owns a service, who should take an incident, and who commands a declared major incident? Are these your preferred terms?

### Turn 15 — user

Yes, identify all four separately; those terms are natural for us.

The **service owner** owns the IT service across its lifecycle. An incident is **assigned to a resolver group** for diagnosis and restoration; an **on-call engineer** is a member of that group and may handle time-critical work on the incident. The **incident commander** commands a major incident and sets the coordination and decision cadence. Ownership, assignment, hands-on response, and command are not interchangeable.

### Turn 15 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Service Owner:\n    meaning: The party accountable for an IT service across its lifecycle.\n  Resolver Group:\n    meaning: A group assigned to diagnose and restore an incident.\n  On-Call Engineer:\n    meaning: A member of a resolver group who may perform time-critical technical work on an incident.\n  Incident Commander:\n    meaning: The person who commands a major incident and directs its coordination and decision cadence."
}
```

### Turn 15 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 15 — assistant

I’ve added those four roles separately. The model will not treat owning a service, receiving an assignment, doing time-critical work, and commanding a major incident as the same responsibility.

The other teams you mentioned are still candidates. For each, does the agent need to **identify it separately** for a recorded question or action—not merely know it exists?

- **Service Desk**: receiving, recording, triaging, or routing an issue before incident assignment.
- **IT Operations Team**: operating an affected IT service or carrying out a response action.
- **Network Operations Centre**: determining or acting on relevant monitoring alerts.
- **Security Operations Centre**: determining or acting on security events.
- **Incident Response Team**: coordinating the declared major incident.

Please say which ones are necessary and which question or action needs them; I’ll leave out those without a task-specific use.

### Turn 16 — user

I’d keep all five, but I’d tighten the task-specific use in two places:

- **Service desk:** records incidents arising from user-reported issues, supporting the incident’s origin and routing before assignment. Recording is not the same as resolving it.
- **IT operations team:** operates the affected IT service, so it helps establish operational responsibility during response. That does not, by itself, authorise the team to execute every response action.
- **Network operations centre:** operates the monitoring tool, which helps trace the source of monitoring signals. I wouldn’t make it the automatic decision-maker for every alert.
- **Security operations centre:** monitors security events, which matters when assessing whether the incident has a security dimension.
- **Incident response team:** coordinates a major incident, distinct from the incident commander who commands it.

So each has a useful connection to the recorded questions or actions, provided we keep those boundaries.

### Turn 16 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Service Desk:\n    meaning: The team that records incidents arising from user-reported issues and triages and routes them before assignment.\n  IT Operations Team:\n    meaning: The team operating IT services during day-to-day operations and response without automatic authority for every response action.\n  Network Operations Centre:\n    meaning: The team operating monitoring for network and infrastructure signals.\n  Security Operations Centre:\n    meaning: The team monitoring security events relevant to assessing an incident's security dimension.\n  Incident Response Team:\n    meaning: The team coordinating a major incident under the incident command structure."
}
```

### Turn 16 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 16 — assistant

I’ve added the five teams with those boundaries. In particular, operating a monitoring tool does not make the Network Operations Centre the decision-maker for every alert, and operating an IT service does not authorize every response action.

For the recorded question about safe response options and the actions to fail over or restore, does the agent need to identify **Runbook**, **Workaround**, **Backup Set**, **Recovery Plan**, and **Recovery Environment** separately? Are those your terms, or would you rename any of them?

### Turn 17 — user

Keep **runbook**, **workaround**, **backup set**, and **recovery plan** separate; those are our terms. A runbook guides response, a workaround temporarily reduces impact, a backup set protects particular configuration items, and a recovery plan describes how to restore an IT service and may use a backup set.

I’d put **“recovery environment”** a little differently as a concept. It is an **environment** used as the recovery target, rather than a separate kind of record alongside production or test. For failover, we must establish that the target environment is available and the data-recovery point is acceptable; for a restore, the restore point and target environment need approval. Neither action is safe just because a plan or backup exists.

### Turn 17 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Runbook:\n    meaning: A guide for responding to an incident.\n  Workaround:\n    meaning: A temporary measure that reduces incident impact.\n  Backup Set:\n    meaning: A set of backup data protecting particular configuration items that may be used in restoration.\n  Recovery Plan:\n    meaning: A plan for restoring an IT service that may use a backup set.\n  Environment:\n    meaning: An operating environment that may serve as an approved target for failover or restoration."
}
```

### Turn 17 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 17 — assistant

I’ve added the four response resources separately, and **Environment** as the potential recovery target—not “Recovery Environment” as another record type. Existence of a plan or backup will not stand in for the action-specific safety checks.

For investigating a possible cause and supporting decisions, does the agent need to identify **Change**, **Deployment**, and **Evidence** as separate things? They would support the possible-cause question, the emergency-change action, and checks on incident decisions and recovery. Are those your terms?

### Turn 18 — user

Yes, keep all three separate. **Change** and **deployment** are terms we use: a change is the controlled modification; a deployment is the technical execution that installs or activates it. A recent deployment is worth investigating, but its timing alone does not establish cause. An **emergency change** is the accelerated change path used for an urgent operational need, with its own execution checks.

I’d call the third thing an **evidence item** when we need to identify a particular preserved record or artifact. “Evidence” is fine in conversation, but the agent must be able to check the item’s integrity and link it to the incident it supports.

### Turn 18 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change:\n    meaning: A controlled modification that may be executed through a deployment or an accelerated emergency path.\n  Deployment:\n    meaning: The technical execution that installs or activates a change.\n  Evidence Item:\n    meaning: A particular preserved record or artifact whose integrity can be checked and whose support for an incident can be traced.\n    aliases: [Evidence]"
}
```

### Turn 18 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 18 — assistant

I’ve added **Change**, **Deployment**, and your preferred **Evidence Item**, with “Evidence” as an alternative term. A recent deployment remains an investigation lead, not a finding of cause.

For materiality and reporting, does the agent need to identify **Materiality Assessment**, **Regulatory Notification**, **Approved Reporting Procedure**, and **Designated Reporting Function** separately? Each would help distinguish the recorded assessment and rationale, the applicable reporting requirement, the reporting decision, and an approved submission. Are these the terms you use?

### Turn 19 — user

Keep **materiality assessment** and **regulatory notification** as separate things; those are terms we use. The assessment records the conclusion, rationale, and applicable reporting due time. A notification is the formal submission about the incident to the regulator. An assessment that says an incident is reportable does not mean a notification has already been approved or submitted.

I would **not add “approved reporting procedure” or “designated reporting function” as separate things to identify in this model**. The approved procedure governs how the reporting requirement and deadline are determined, and the designated function owns the reporting decision outside my operational remit. The agent should use the recorded assessment and notification state, not invent a deadline or treat operations as the final reporting authority.

### Turn 19 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Materiality Assessment:\n    meaning: A recorded assessment of an incident's reporting conclusion, rationale, and applicable reporting due time determined under the approved procedure.\n  Regulatory Notification:\n    meaning: A formal submission about an incident to the regulator, distinct from the assessment that may require it."
}
```

### Turn 19 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 19 — assistant

I’ve added **Materiality Assessment** and **Regulatory Notification** separately. I’ve left the procedure and reporting function out as classes, as you requested; the agent will rely on the recorded assessment and notification state rather than claim reporting authority for operations.

For the stakeholder-update action and communication question, does the agent need to identify **Stakeholder** and each **Stakeholder Update** separately—one for who needs the message, the other for what was actually sent and checked against the verified incident state? Are those your terms?

### Turn 20 — user

Yes, keep **stakeholder** separate from the message record. A stakeholder is the person, group, or organisation with an interest in the outcome; the record captures what was addressed to them about an incident, including its audience, content, approval state, and whether it was sent.

I’d name the second concept **more broadly than “stakeholder update.”** That phrase sounds like a message already sent to one audience. We also need to track drafts and approvals, and messages to technical, management, business, customer, vendor, regulator, or all-staff audiences. A formal regulatory notification remains a separate record.

### Turn 20 — assistant

Agreed: **Stakeholder** is distinct from the message record, and “Stakeholder Update” is too narrow because the record can be a draft or approved message for different audiences. A formal **Regulatory Notification** stays separate.

**What name does your team use for that broader message record?**

### Turn 21 — user

We call it a **communication**. It records a message about an incident, addressed to a stakeholder or audience, through drafting, approval, and sending. A regulatory notification is a separate formal submission.

### Turn 21 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Stakeholder:\n    meaning: A person, group, or organisation with an interest in an incident's outcome who may need communication.\n  Communication:\n    meaning: A message about an incident addressed to a stakeholder or audience and tracked through drafting, approval, and sending."
}
```

### Turn 21 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 21 — assistant

I’ve added **Stakeholder** and **Communication**, including drafts and approvals. **Regulatory Notification** remains a separate formal submission.

For the closure and outstanding-actions questions, does the agent need to identify **Post-Incident Review** and **Corrective Action** separately—so it can check whether a review is scheduled or completed and find actions from reviews of earlier incidents affecting the service? Are those your terms?

### Turn 22 — user

Yes, keep them separate; **post-incident review** and **corrective action** are our terms.

The review examines the incident, response, causes, and lessons, and can produce tracked corrective actions. An action has its own owner, status, and due date, so an earlier review’s action can still be outstanding when the same service is affected again.

For closure, a major or cybersecurity incident needs a review **scheduled or completed**. That does not mean every corrective action must already be closed before the incident can close.

### Turn 22 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Post-Incident Review:\n    meaning: A review of an incident, its response, causes and lessons that can produce corrective actions.\n  Corrective Action:\n    meaning: A tracked follow-up from a post-incident review with its own owner, status and due date."
}
```

### Turn 22 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 22 — assistant

I’ve added **Post-Incident Review** and **Corrective Action** separately. Review scheduling matters for closing major or cybersecurity incidents; outstanding corrective actions need not all be finished first.

One candidate remains from the monitoring-source requirement: does the agent need to identify the **Monitoring Tool** that produced an alert or event, and connect it to the **Network Operations Centre** that operates it? Or is the source recorded adequately on the alert or event without a separate tool concept?

### Turn 23 — user

Keep **monitoring tool** as a separate concept. The network operations centre operates it, and it monitors IT services and configuration items. To trace a monitoring alert more precisely, the alert is generated by a **monitoring rule** executed by the tool.

An alert or event also records a detection source, but that category alone does not identify the particular tool or rule. I wouldn’t say the tool necessarily “produced” every linked event, especially one reported by a user or vendor.

### Turn 23 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Monitoring Tool:\n    meaning: A tool operated by the network operations centre that monitors IT services and configuration items and executes monitoring rules."
}
```

### Turn 23 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 23 — assistant

I’ve added **Monitoring Tool**. I won’t treat a detection-source category as identifying the particular tool, or assume the tool produced every event.

To trace which rule generated a monitoring alert, does the agent need to identify **Monitoring Rule** as a separate thing? Is that your term for it?

### Turn 24 — user

Yes—keep **monitoring rule** separate; that’s our term. It evaluates telemetry, is executed by a monitoring tool, and can generate an alert. The alert’s link to the rule is more specific than its detection-source category. Not every alert should be assumed to come from a monitoring rule; a report from a user or vendor may enter by another route.

### Turn 24 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Monitoring Rule:\n    meaning: A rule executed by a monitoring tool that evaluates telemetry and may generate an alert."
}
```

### Turn 24 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 24 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 24 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: What is the current health of each affected business service and supporting IT service?
  - id: cq3
    text: Which customer channels deliver the affected business services?
  - id: cq4
    text: "Which infrastructure and third-party services are on an affected IT service's dependency path?"
  - id: cq5
    text: Which configuration items are relevant along that dependency path?
  - id: cq6
    text: Which alerts and events are linked to an incident through its triggering alert or correlated events?
  - id: cq7
    text: Who owns an affected IT service?
  - id: cq8
    text: Which resolver group and on-call engineer should take an incident?
  - id: cq9
    text: "Does an incident meet the bank's criteria for a major-incident declaration?"
  - id: cq10
    text: Who should command the response to a major incident?
  - id: cq11
    text: "Which runbook, workaround, backup set, or recovery plan is applicable to an incident?"
  - id: cq12
    text: "Are the conditions for using a proposed runbook, workaround, backup set, or recovery plan safely met for this incident?"
  - id: cq13
    text: "Could a recent change or deployment have caused an incident, based on its classification and evidence?"
  - id: cq14
    text: "Has the incident's materiality been assessed, and what rationale was recorded?"
  - id: cq15
    text: "Is a regulatory notification required for the incident under the approved procedure and designated reporting function's conclusion?"
  - id: cq16
    text: When is any required regulatory notification due under the applicable reporting requirement?
  - id: cq17
    text: "What evidence supports an incident's impact, classification, decisions, and recovery, and is its integrity preserved?"
  - id: cq18
    text: "Which stakeholders need an incident update, and what has actually been communicated against the latest verified incident state?"
  - id: cq19
    text: "Is an incident ready to close, including restored service health or an accepted residual condition, restoration evidence, required communications, and any applicable post-incident review?"
  - id: cq20
    text: "Which corrective actions from post-incident reviews remain outstanding for the affected service, including actions from prior incidents?"
classes:
  Incident:
    meaning: A recorded disruption or security condition that may impact an IT service or business service.
    aliases: []
    properties: {}
  Business Service:
    meaning: A capability the bank delivers to its users.
    aliases: []
    properties: {}
  IT Service:
    meaning: A service supporting bank capabilities whose operational health is tracked.
    aliases: []
    properties: {}
  Customer Channel:
    meaning: A way customers access a business service.
    aliases: []
    properties: {}
  Configuration Item:
    meaning: A component recorded in configuration-management scope.
    aliases: []
    properties: {}
  Third-Party Service:
    meaning: A service provided by an external party that an IT service can depend on.
    aliases: []
    properties: {}
  Alert:
    meaning: A monitoring signal that may trigger an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases: []
    properties: {}
  Infrastructure Component:
    meaning: "A component on which an IT service runs, whether or not it is recorded as a configuration item."
    aliases: []
    properties: {}
  Service Owner:
    meaning: The party accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  Resolver Group:
    meaning: A group assigned to diagnose and restore an incident.
    aliases: []
    properties: {}
  On-Call Engineer:
    meaning: A member of a resolver group who may perform time-critical technical work on an incident.
    aliases: []
    properties: {}
  Incident Commander:
    meaning: The person who commands a major incident and directs its coordination and decision cadence.
    aliases: []
    properties: {}
  Service Desk:
    meaning: The team that records incidents arising from user-reported issues and triages and routes them before assignment.
    aliases: []
    properties: {}
  IT Operations Team:
    meaning: The team operating IT services during day-to-day operations and response without automatic authority for every response action.
    aliases: []
    properties: {}
  Network Operations Centre:
    meaning: The team operating monitoring for network and infrastructure signals.
    aliases: []
    properties: {}
  Security Operations Centre:
    meaning: "The team monitoring security events relevant to assessing an incident's security dimension."
    aliases: []
    properties: {}
  Incident Response Team:
    meaning: The team coordinating a major incident under the incident command structure.
    aliases: []
    properties: {}
  Runbook:
    meaning: A guide for responding to an incident.
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary measure that reduces incident impact.
    aliases: []
    properties: {}
  Backup Set:
    meaning: A set of backup data protecting particular configuration items that may be used in restoration.
    aliases: []
    properties: {}
  Recovery Plan:
    meaning: A plan for restoring an IT service that may use a backup set.
    aliases: []
    properties: {}
  Environment:
    meaning: An operating environment that may serve as an approved target for failover or restoration.
    aliases: []
    properties: {}
  Change:
    meaning: A controlled modification that may be executed through a deployment or an accelerated emergency path.
    aliases: []
    properties: {}
  Deployment:
    meaning: The technical execution that installs or activates a change.
    aliases: []
    properties: {}
  Evidence Item:
    meaning: A particular preserved record or artifact whose integrity can be checked and whose support for an incident can be traced.
    aliases:
      - Evidence
    properties: {}
  Materiality Assessment:
    meaning: "A recorded assessment of an incident's reporting conclusion, rationale, and applicable reporting due time determined under the approved procedure."
    aliases: []
    properties: {}
  Regulatory Notification:
    meaning: "A formal submission about an incident to the regulator, distinct from the assessment that may require it."
    aliases: []
    properties: {}
  Stakeholder:
    meaning: "A person, group, or organisation with an interest in an incident's outcome who may need communication."
    aliases: []
    properties: {}
  Communication:
    meaning: "A message about an incident addressed to a stakeholder or audience and tracked through drafting, approval, and sending."
    aliases: []
    properties: {}
  Post-Incident Review:
    meaning: "A review of an incident, its response, causes and lessons that can produce corrective actions."
    aliases: []
    properties: {}
  Corrective Action:
    meaning: "A tracked follow-up from a post-incident review with its own owner, status and due date."
    aliases: []
    properties: {}
  Monitoring Tool:
    meaning: A tool operated by the network operations centre that monitors IT services and configuration items and executes monitoring rules.
    aliases: []
    properties: {}
  Monitoring Rule:
    meaning: A rule executed by a monitoring tool that evaluates telemetry and may generate an alert.
    aliases: []
    properties: {}
relationships: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 24 — assistant

The class pass now includes the operational records, services and dependencies, distinct response roles, recovery resources, reporting and communication records, review follow-up, and monitoring tool and rule. All 34 have been recorded with the terms you approved. We have not yet recorded their connections, properties, rules, or action details.

**Does that capture the kinds of things the agent needs to distinguish, without treating a channel as automatically disrupted, every infrastructure component as a configuration item, or an assessment as a submitted notification?**

### Turn 24 — user

[System note] Your last reply said "all 34", but this turn's apply_ontology_yaml call(s) actually recorded 1 added and 0 updated item(s) — not 34. State the true numbers the next time you summarize what was recorded, and call get_graph_state first if you are not sure what actually persisted.

### Turn 25 — user

The distinctions you named are right, but I wouldn’t close the concept pass yet. Four things need to be identifiable separately for the agreed questions and actions:

- **Major incident:** a declared classification of an incident, needed to track command and the additional closure review condition. Meeting declaration criteria is not the same as declaring it.
- **Cybersecurity incident:** an incident involving security-relevant activity; it has evidence-preservation and materiality implications, as well as the review condition at closure.
- **Emergency change:** the accelerated kind of change we agreed the agent may execute, with checks specific to that action.
- **Regulator:** the authority a regulatory notification is sent to; submission requires the notification to be linked to both the incident and the regulator.

Keep your three cautions exactly as stated. Once these distinctions are included, we can move to connections and decision rules.

### Turn 25 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 25 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: What is the current health of each affected business service and supporting IT service?
  - id: cq3
    text: Which customer channels deliver the affected business services?
  - id: cq4
    text: "Which infrastructure and third-party services are on an affected IT service's dependency path?"
  - id: cq5
    text: Which configuration items are relevant along that dependency path?
  - id: cq6
    text: Which alerts and events are linked to an incident through its triggering alert or correlated events?
  - id: cq7
    text: Who owns an affected IT service?
  - id: cq8
    text: Which resolver group and on-call engineer should take an incident?
  - id: cq9
    text: "Does an incident meet the bank's criteria for a major-incident declaration?"
  - id: cq10
    text: Who should command the response to a major incident?
  - id: cq11
    text: "Which runbook, workaround, backup set, or recovery plan is applicable to an incident?"
  - id: cq12
    text: "Are the conditions for using a proposed runbook, workaround, backup set, or recovery plan safely met for this incident?"
  - id: cq13
    text: "Could a recent change or deployment have caused an incident, based on its classification and evidence?"
  - id: cq14
    text: "Has the incident's materiality been assessed, and what rationale was recorded?"
  - id: cq15
    text: "Is a regulatory notification required for the incident under the approved procedure and designated reporting function's conclusion?"
  - id: cq16
    text: When is any required regulatory notification due under the applicable reporting requirement?
  - id: cq17
    text: "What evidence supports an incident's impact, classification, decisions, and recovery, and is its integrity preserved?"
  - id: cq18
    text: "Which stakeholders need an incident update, and what has actually been communicated against the latest verified incident state?"
  - id: cq19
    text: "Is an incident ready to close, including restored service health or an accepted residual condition, restoration evidence, required communications, and any applicable post-incident review?"
  - id: cq20
    text: "Which corrective actions from post-incident reviews remain outstanding for the affected service, including actions from prior incidents?"
classes:
  Incident:
    meaning: A recorded disruption or security condition that may impact an IT service or business service.
    aliases: []
    properties: {}
  Business Service:
    meaning: A capability the bank delivers to its users.
    aliases: []
    properties: {}
  IT Service:
    meaning: A service supporting bank capabilities whose operational health is tracked.
    aliases: []
    properties: {}
  Customer Channel:
    meaning: A way customers access a business service.
    aliases: []
    properties: {}
  Configuration Item:
    meaning: A component recorded in configuration-management scope.
    aliases: []
    properties: {}
  Third-Party Service:
    meaning: A service provided by an external party that an IT service can depend on.
    aliases: []
    properties: {}
  Alert:
    meaning: A monitoring signal that may trigger an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases: []
    properties: {}
  Infrastructure Component:
    meaning: "A component on which an IT service runs, whether or not it is recorded as a configuration item."
    aliases: []
    properties: {}
  Service Owner:
    meaning: The party accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  Resolver Group:
    meaning: A group assigned to diagnose and restore an incident.
    aliases: []
    properties: {}
  On-Call Engineer:
    meaning: A member of a resolver group who may perform time-critical technical work on an incident.
    aliases: []
    properties: {}
  Incident Commander:
    meaning: The person who commands a major incident and directs its coordination and decision cadence.
    aliases: []
    properties: {}
  Service Desk:
    meaning: The team that records incidents arising from user-reported issues and triages and routes them before assignment.
    aliases: []
    properties: {}
  IT Operations Team:
    meaning: The team operating IT services during day-to-day operations and response without automatic authority for every response action.
    aliases: []
    properties: {}
  Network Operations Centre:
    meaning: The team operating monitoring for network and infrastructure signals.
    aliases: []
    properties: {}
  Security Operations Centre:
    meaning: "The team monitoring security events relevant to assessing an incident's security dimension."
    aliases: []
    properties: {}
  Incident Response Team:
    meaning: The team coordinating a major incident under the incident command structure.
    aliases: []
    properties: {}
  Runbook:
    meaning: A guide for responding to an incident.
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary measure that reduces incident impact.
    aliases: []
    properties: {}
  Backup Set:
    meaning: A set of backup data protecting particular configuration items that may be used in restoration.
    aliases: []
    properties: {}
  Recovery Plan:
    meaning: A plan for restoring an IT service that may use a backup set.
    aliases: []
    properties: {}
  Environment:
    meaning: An operating environment that may serve as an approved target for failover or restoration.
    aliases: []
    properties: {}
  Change:
    meaning: A controlled modification that may be executed through a deployment or an accelerated emergency path.
    aliases: []
    properties: {}
  Deployment:
    meaning: The technical execution that installs or activates a change.
    aliases: []
    properties: {}
  Evidence Item:
    meaning: A particular preserved record or artifact whose integrity can be checked and whose support for an incident can be traced.
    aliases:
      - Evidence
    properties: {}
  Materiality Assessment:
    meaning: "A recorded assessment of an incident's reporting conclusion, rationale, and applicable reporting due time determined under the approved procedure."
    aliases: []
    properties: {}
  Regulatory Notification:
    meaning: "A formal submission about an incident to the regulator, distinct from the assessment that may require it."
    aliases: []
    properties: {}
  Stakeholder:
    meaning: "A person, group, or organisation with an interest in an incident's outcome who may need communication."
    aliases: []
    properties: {}
  Communication:
    meaning: "A message about an incident addressed to a stakeholder or audience and tracked through drafting, approval, and sending."
    aliases: []
    properties: {}
  Post-Incident Review:
    meaning: "A review of an incident, its response, causes and lessons that can produce corrective actions."
    aliases: []
    properties: {}
  Corrective Action:
    meaning: "A tracked follow-up from a post-incident review with its own owner, status and due date."
    aliases: []
    properties: {}
  Monitoring Tool:
    meaning: A tool operated by the network operations centre that monitors IT services and configuration items and executes monitoring rules.
    aliases: []
    properties: {}
  Monitoring Rule:
    meaning: A rule executed by a monitoring tool that evaluates telemetry and may generate an alert.
    aliases: []
    properties: {}
relationships: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 25 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Regulator:\n    meaning: The authority to which a regulatory notification about an incident is submitted."
}
```

### Turn 25 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 25 — assistant

You’re right to keep the concept pass open. I checked the canvas: my earlier “all 34” referred to the **total classes then present**, not the one class added in that turn. I should have made that distinction clear. This turn added **Regulator** as one new class; the other three distinctions are not recorded yet.

For **Major Incident**, you described a declared classification of an Incident. This tool cannot express “is a kind of” between classes, so I want to preserve the distinction without inventing a second record. **Does your team identify a major-incident declaration as its own record or workflow item, or is “major” a classification held on the Incident record after declaration?**

### Turn 25 — user

[System note] Your last reply said "all 34", but this turn's apply_ontology_yaml call(s) actually recorded 1 added and 0 updated item(s) — not 34. State the true numbers the next time you summarize what was recorded, and call get_graph_state first if you are not sure what actually persisted.

### Turn 26 — user

It’s a **classification of the incident after declaration**, not a second, independent incident record. We retain the declaration time and assigned incident commander, and verify that the major-incident classification and communication record are present. Before declaration, an incident may meet the criteria without yet being a major incident.

If the tool cannot express “is a kind of,” keep that distinction on the incident and its declaration workflow rather than inventing a separate declaration record.

### Turn 26 — assistant

Understood. **Major incident** is the Incident’s classification *after* declaration, not a second incident record. We’ll capture the declaration time and commander connection when we reach properties and relationships, and check the classification and communication record in the declaration workflow. No class or property was added in this turn.

The same distinction matters for the other two proposed concepts: **Is “cybersecurity incident” a classification on Incident, and “emergency change” an accelerated path or classification on Change—or does either have its own separately identifiable record?**

### Turn 27 — user

Both are specialised forms of their parent record, not independent parallel records.

A **cybersecurity incident** is an incident involving malicious, unauthorised, or otherwise security-relevant activity. Keep its security-event link, evidence-preservation requirement, materiality assessment, and closure review condition distinguishable even if your tool represents it as an incident classification.

An **emergency change** is a change handled through an accelerated path for an urgent operational need. Keep its link to the active incident and its execution prerequisites on the change workflow; don’t create a second change record for it.

### Turn 27 — assistant

That settles the concept pass: **Major Incident** and **Cybersecurity Incident** will be distinguishable classifications of Incident; **Emergency Change** will be an accelerated path on Change. None needs a second parallel record. Their specific links, checks, and workflow effects still need to be modeled. The canvas currently has **35 classes**, including Regulator, and no relationships or properties yet.

**Is this corrected concept set confirmed so we can begin mapping the connections between them?**

### Turn 28 — user

Yes, the concept set is ready for the connection pass. Keep those specialised incident and change paths distinguishable without creating duplicate records. We can now map how the services, dependencies, response roles, evidence, communications, and reporting records connect.

### Turn 28 — assistant

We’ll start with impact and service delivery. These connections would support the questions about affected services and channels:

- Incident → IT Service: **impacts**
- Incident → Business Service: **impacts**
- Business Service → IT Service: **depends on**
- Business Service → Customer Channel: **delivered through**

For **Incident and Customer Channel**, I won’t infer impact from “delivered through”: does your incident record also link **directly** to a channel when impact on that channel has been confirmed?

For each connection that holds, what verb phrase and direction would your team use?

### Turn 29 — user

The four proposed connections hold, in those directions:

- An **incident impacts an IT service**.
- An **incident impacts a business service**.
- A **business service depends on an IT service**.
- A **business service is delivered through a customer channel**.

We do **not** have a separate direct incident-to-customer-channel link in this model. To assess channel impact, start with the impacted business service and the channels through which it is delivered, then verify the actual disruption. Don’t turn the delivery relationship alone into a confirmed channel-impact claim.

### Turn 29 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: impacts\n    from: Incident\n    to: IT Service\n    meaning: The incident has a confirmed impact on this IT service.\n  - name: impacts\n    from: Incident\n    to: Business Service\n    meaning: The incident has a confirmed impact on this business service.\n  - name: dependsOn\n    from: Business Service\n    to: IT Service\n    meaning: The business service depends on this supporting IT service.\n  - name: deliveredThrough\n    from: Business Service\n    to: Customer Channel\n    meaning: The business service is delivered through this customer channel without implying the channel is disrupted."
}
```

### Turn 29 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 29 — assistant

I recorded **four directed connections**: Incident impacts each service type; Business Service depends on IT Service and is delivered through Customer Channel. I did **not** add an Incident–Customer Channel link. Channel disruption remains something to verify, not infer from delivery.

Next, for the dependency-path and configuration-item questions, do these connections hold, and are these your verb phrases and directions?

- **IT Service → Infrastructure Component:** runs on
- **IT Service → Third-Party Service:** depends on
- **Infrastructure Component → Configuration Item:** recorded as, **only when that component has a configuration record**
- **Incident → Configuration Item:** affects, **only when the item’s impact is established**

Is any further step needed to get from an IT service’s documented dependencies to its relevant configuration items?

### Turn 30 — user

The first, second, and fourth connections hold in those directions: an **IT service runs on an infrastructure component**, an **IT service depends on a third-party service**, and an **incident affects a configuration item** when that effect is established.

I would **not record “infrastructure component → configuration item: recorded as”** as a connection. “Configuration item” describes a managed component within configuration-management scope, not a separate configuration record that every infrastructure component points to. Confirm whether a component is in that scope rather than inferring it from the dependency path.

For the further step, trace the documented technical dependencies—including any application implementing the IT service and the infrastructure it runs on—then check which components are recorded as configuration items. Keep those findings separate from configuration items the incident is known to affect.

### Turn 30 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: runsOn\n    from: IT Service\n    to: Infrastructure Component\n    meaning: The IT service runs on this infrastructure component as a documented technical dependency.\n  - name: dependsOn\n    from: IT Service\n    to: Third-Party Service\n    meaning: The IT service depends on this third-party service.\n  - name: affects\n    from: Incident\n    to: Configuration Item\n    meaning: The incident has an established effect on this configuration item."
}
```

### Turn 30 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 30 — assistant

I recorded **three connections**: IT Service runs on Infrastructure Component, IT Service depends on Third-Party Service, and Incident affects Configuration Item when impact is established. I did not record “Infrastructure Component → Configuration Item: recorded as.” Whether a component is in configuration-management scope needs checking, not assuming.

You also mentioned an **application implementing the IT service** as a step on the documented path. Does the agent need to identify **Application** separately to answer the dependency-path and configuration-item questions, or is it handled as a component already represented in the model?

### Turn 31 — user

Yes, identify **application** separately. It is the software system implementing an IT service, and it may itself run on infrastructure. Without that step, you could miss the technical path between the affected service and the components underneath it.

I’d record **IT service → application: is implemented by**, and **application → infrastructure component: runs on**. Still check which of those components are actually in configuration-management scope; those connections alone do not establish a configuration-item record.

### Turn 31 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Application:\n    meaning: A software system implementing an IT service that may run on infrastructure components.\nrelationships:\n  - name: implementedBy\n    from: IT Service\n    to: Application\n    meaning: The IT service is implemented by this application.\n    aliases: [is implemented by]\n  - name: runsOn\n    from: Application\n    to: Infrastructure Component\n    meaning: The application runs on this infrastructure component."
}
```

### Turn 31 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 31 — assistant

I added **Application** as one class and recorded **two connections**: IT Service *is implemented by* Application, and Application *runs on* Infrastructure Component. Those connections trace the technical path; they do not establish that any component is a Configuration Item. We’ll revisit the new class’s paths during the connection check.

For the alert-and-event question, do these directed connections describe how your team establishes relevance?

- **Monitoring Tool → Monitoring Rule:** executes
- **Monitoring Rule → Alert:** generates
- **Alert → Incident:** triggers
- **Event → Incident:** is correlated with

For any that hold, are those your verb phrases and directions?

### Turn 32 — user

They describe the right paths, but I’d record them with the direction and qualification we use:

- A **monitoring rule is executed by a monitoring tool**. When it generates an alert, the **alert is generated by that rule**. Not every alert has a monitoring-rule origin.
- An **alert may open an incident**; where it actually did, the **incident is triggered by the alert**. “Alert triggers incident” sounds automatic, which it isn’t.
- An **incident is correlated from an event** when that correlation has been established. An event occurring at the same time is not enough.

So the first two of your arrows are reasonable inverse descriptions, but I’d store the rule-to-tool and alert-to-rule directions. For events, I’d store the incident-to-event link.

### Turn 32 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: executedBy\n    from: Monitoring Rule\n    to: Monitoring Tool\n    meaning: The monitoring tool executes this rule to evaluate telemetry.\n    aliases: [executes]\n  - name: generatedBy\n    from: Alert\n    to: Monitoring Rule\n    meaning: This alert was generated by the rule when it has a monitoring-rule origin.\n    aliases: [generates]\n  - name: triggeredBy\n    from: Incident\n    to: Alert\n    meaning: This incident was opened as a result of this alert, when that link is established.\n    aliases: [triggers]\n  - name: correlatedFrom\n    from: Incident\n    to: Event\n    meaning: This event has been established as correlated with the incident rather than merely concurrent.\n    aliases: [is correlated with]"
}
```

### Turn 32 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 32 — assistant

I recorded **four connections in your preferred directions**: Monitoring Rule *is executed by* Monitoring Tool; Alert *is generated by* Monitoring Rule where applicable; Incident *is triggered by* Alert when that opened it; and Incident *is correlated from* Event when correlation is established. None is inferred from timing alone.

For the operational teams and monitoring path, do these connections hold as direct facts, and are these your verb phrases and directions?

- **Network Operations Centre → Monitoring Tool:** operates
- **Monitoring Tool → IT Service / Configuration Item:** monitors
- **Security Operations Centre → Event:** monitors
- **Service Desk → Incident:** records
- **IT Operations Team → IT Service:** operates

In particular, does the Security Operations Centre link to individual events, or only to a source or stream not yet modeled?

### Turn 33 — user

Four of those hold as written: the **network operations centre operates a monitoring tool**; the **monitoring tool monitors IT services and configuration items**; the **service desk records incidents**; and the **IT operations team operates IT services**.

For the security operations centre, I’d put it more narrowly: it **monitors security events**, not every operational event. A security event is an event with a security relevance, so it needs to be distinguishable; this is a link to those events, not merely to an unmodelled source or stream. Don’t infer that the centre monitors a particular event without that link.

### Turn 33 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: operates\n    from: Network Operations Centre\n    to: Monitoring Tool\n    meaning: The network operations centre operates this monitoring tool.\n  - name: monitors\n    from: Monitoring Tool\n    to: IT Service\n    meaning: The monitoring tool monitors this IT service.\n  - name: monitors\n    from: Monitoring Tool\n    to: Configuration Item\n    meaning: The monitoring tool monitors this configuration item.\n  - name: records\n    from: Service Desk\n    to: Incident\n    meaning: The service desk records this incident arising from a user-reported issue.\n  - name: operates\n    from: IT Operations Team\n    to: IT Service\n    meaning: The IT operations team operates this IT service."
}
```

### Turn 33 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 33 — assistant

I recorded **five connections**: the Network Operations Centre operates the Monitoring Tool; the tool monitors IT Services and Configuration Items; the Service Desk records Incidents; and the IT Operations Team operates IT Services. I have **not** linked the Security Operations Centre to all Events.

Since a security event is an Event with security relevance, rather than a separate event record, would you represent that relevance on the **Event** and record **Security Operations Centre → Event: monitors** only for the security-relevant events it actually monitors? What verb and direction would your team use for that direct link?

### Turn 34 — user

Use **Security Operations Centre → security event: monitors**. If the tool represents a security event as a classification on an Event record, restrict that connection to events identified as security events and actually monitored by the centre. Don’t make it an unrestricted **Security Operations Centre → Event** connection, and don’t create a duplicate event record.

The model doesn’t specify a particular “security relevance” field on Event, so I wouldn’t invent one just to support that restriction.

### Turn 34 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: monitors\n    from: Security Operations Centre\n    to: Event\n    meaning: The centre actually monitors this event, which has been identified as a security event; this does not apply to all events.\n    aliases: [monitors security event]"
}
```

### Turn 34 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 34 — assistant

I recorded **one conditional connection**: Security Operations Centre *monitors* an Event only when that particular event is identified as a security event and actually monitored by the centre. I added no duplicate event class or unrequested security-relevance property. The classification check remains to be worked out when we address decision properties.

For ownership and assignment, can you confirm the direct facts and your preferred directions and verbs for this group?

- **IT Service → Service Owner:** owned by
- **Incident → Resolver Group:** assigned to, once assigned
- **Resolver Group → IT Service / Configuration Item:** supports, as the basis for *recommending* the group
- **On-Call Engineer → Resolver Group:** belongs to

Also, does the **Incident** have a direct link to the **On-Call Engineer** handling it, distinct from the path through its Resolver Group?

### Turn 35 — user

The connections are right in substance, with two adjustments to how I’d record them:

- The **service owner owns the IT service**. I’d store that direction rather than “IT service → service owner: owned by.”
- An **incident is assigned to a resolver group** once assigned.
- An **on-call engineer is a member of a resolver group**. “Belongs to” gets the idea across, but membership is the more precise relationship.
- Yes, an **incident is handled by an on-call engineer** directly, distinct from its resolver-group assignment.

The group’s support for an affected service or configuration item is a **check before assignment**. I wouldn’t add the proposed resolver-group-to-service or resolver-group-to-configuration-item connection as a recorded relationship on that basis alone; the support must be established for the particular assignment.

### Turn 35 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: owns\n    from: Service Owner\n    to: IT Service\n    meaning: The service owner is accountable for this IT service across its lifecycle.\n    aliases: [owned by]\n  - name: assignedTo\n    from: Incident\n    to: Resolver Group\n    meaning: The incident has been assigned to this resolver group for diagnosis and restoration.\n  - name: memberOf\n    from: On-Call Engineer\n    to: Resolver Group\n    meaning: The on-call engineer is a member of this resolver group.\n    aliases: [belongs to]\n  - name: handledBy\n    from: Incident\n    to: On-Call Engineer\n    meaning: This on-call engineer directly handles time-critical technical work on the incident."
}
```

### Turn 35 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 35 — assistant

I recorded **four direct connections**: Service Owner *owns* IT Service; Incident *is assigned to* Resolver Group; On-Call Engineer *is a member of* Resolver Group; and Incident *is handled by* On-Call Engineer. I did not add either proposed support connection.

The assignment link records the **result**, but the agent still needs a way to determine which group *should* receive an incident. When support for a particular IT Service or Configuration Item has been established, is it a navigable fact your team records—such as **Resolver Group supports IT Service** or **Resolver Group supports Configuration Item**—or does the agent consult another source or path to establish it before assignment?

### Turn 36 — user

It’s a fact we must **establish before assigning** the incident: the proposed resolver group supports an affected IT service or configuration item. I wouldn’t add either “supports” connection as a recorded relationship in this model just to make that check navigable.

The agent should check the bank’s current support-assignment information for the particular affected service or item, then make the assignment only if support is confirmed. This model does not prescribe a specific source system for that check.

### Turn 36 — assistant

Understood. The **assigned-to** link records the outcome; the recommendation requires a separate, current support check for the affected IT service or configuration item. I won’t add a “supports” relationship or invent a source system for that check.

For the major-incident response path, which of these are direct facts your team records, and what direction and verb would you use?

- **Incident → Incident Commander:** the commander assigned at declaration.
- **Incident Response Team → Incident:** coordination of the declared major incident.
- **Incident Commander → Incident Response Team:** direction of that team, if recorded separately.

These would apply only after declaration, not merely because the criteria are met.

### Turn 37 — user

For a **declared major incident**, I’d record these distinctions:

- The **incident is coordinated by the assigned incident commander**; the commander **commands the major-incident response**. The assignment is part of the declaration, not something inferred from severity alone.
- The **incident response team coordinates the major incident**. I wouldn’t extend that relationship to every incident.
- The **incident commander is a member of the incident response team**. I would not add a separate “commander directs team” relationship; command of the major incident and team membership express different facts.

We also retain the declaration time and verify the commander, classification, and communication record after declaration.

### Turn 37 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: coordinatedBy\n    from: Incident\n    to: Incident Commander\n    meaning: The declared major incident is coordinated by its assigned incident commander.\n    aliases: [commands major-incident response]\n  - name: coordinates\n    from: Incident Response Team\n    to: Incident\n    meaning: The incident response team coordinates this declared major incident, not every incident.\n  - name: memberOf\n    from: Incident Commander\n    to: Incident Response Team\n    meaning: The incident commander is a member of the incident response team."
}
```

### Turn 37 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 37 — assistant

I recorded **three connections** for declared major incidents: Incident *is coordinated by* its assigned Incident Commander; Incident Response Team *coordinates* the Incident; and Incident Commander *is a member of* that team. I did not add a separate “directs team” link. Declaration time, classification, and communication verification remain for later phases.

For the question “Which runbook, workaround, backup set, or recovery plan is applicable to an incident?”, **how does your team get from the Incident to each resource?** For example, is a resource linked directly to that Incident when selected, found through its affected IT Service or Configuration Item, or found another way? I’m asking for the paths first, not assuming four direct links.

### Turn 38 — user

We use different paths; I wouldn’t add four direct links from the incident.

- **Runbook:** an incident can be *handled with* a runbook. That records the procedure selected for response.
- **Workaround:** follow the incident’s link to a **problem**, then to a documented **known error** that has a workaround. A workaround may also be documented in a runbook. Finding one does not mean it has been approved for this incident.
- **Recovery plan:** an incident can be *recovered with* a recovery plan; the plan *recovers* an IT service. Check that it applies to the affected service before failover.
- **Backup set:** a backup set *protects* a configuration item, and a recovery plan may *use* that backup set. Check the target item and backup status before considering a restore; there is no direct incident-to-backup-set link here.

Those paths identify candidates. The safety checks for failover or restore still have to be made at the point of action.

### Turn 38 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: handledWith\n    from: Incident\n    to: Runbook\n    meaning: The runbook selected to guide response to this incident; selection does not establish safe execution.\n  - name: recoveredWith\n    from: Incident\n    to: Recovery Plan\n    meaning: The recovery plan selected for this incident, subject to checking its applicability and safety.\n  - name: recovers\n    from: Recovery Plan\n    to: IT Service\n    meaning: The IT service that this recovery plan describes restoring.\n  - name: protects\n    from: Backup Set\n    to: Configuration Item\n    meaning: The configuration item protected by this backup set.\n  - name: uses\n    from: Recovery Plan\n    to: Backup Set\n    meaning: The backup set that this recovery plan may use in restoration."
}
```

### Turn 38 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 38 — assistant

I recorded **five connections** you confirmed: Incident *handled with* Runbook; Incident *recovered with* Recovery Plan; Recovery Plan *recovers* IT Service and *uses* Backup Set; and Backup Set *protects* Configuration Item. These identify response candidates, not permission to execute them. I have not added a direct Incident–Backup Set link.

Your workaround path introduces two things not yet on the canvas: **Problem** and **Known Error**. Does the agent need to identify each separately to follow Incident → Problem → Known Error → Workaround? Are those your names for them?

### Turn 39 — user

Yes, keep **problem** and **known error** separate; those are our terms.

A **problem** is the underlying or potential cause of one or more incidents. A **known error** is a diagnosed problem with a documented cause or workaround. That distinction lets us investigate a problem without pretending its cause is already known.

The path is: an **incident is linked to a problem**; the **problem is documented by a known error**; and the **known error has a workaround**. A workaround can also be **documented in a runbook**. None of those links alone proves the workaround is safe for the current incident.

### Turn 39 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Problem:\n    meaning: The underlying or potential cause of one or more incidents, which may not yet be diagnosed.\n  Known Error:\n    meaning: Documentation of a diagnosed problem with a known cause or workaround.\nrelationships:\n  - name: linkedTo\n    from: Incident\n    to: Problem\n    meaning: The incident is linked to this underlying or potential problem.\n  - name: documentedBy\n    from: Problem\n    to: Known Error\n    meaning: The problem has been diagnosed and documented by this known error.\n  - name: has\n    from: Known Error\n    to: Workaround\n    meaning: The known error has this documented workaround.\n  - name: documentedIn\n    from: Workaround\n    to: Runbook\n    meaning: The workaround is documented in this runbook; documentation does not establish safety for a particular incident."
}
```

### Turn 39 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 39 — assistant

I added **two classes**, Problem and Known Error, and **four connections** along the workaround path you described. A Problem can remain undiagnosed; a Known Error documents the diagnosed problem. Finding a workaround through that path does not establish that it is safe to use.

For the failover and restore actions, how do you get from the affected **IT Service** or **Configuration Item** to the target **Environment**? Does a Recovery Plan name its target Environment, does an IT Service or Configuration Item have a direct environment link, or are these different facts your team records?

### Turn 40 — user

They are different facts. An **IT service is deployed in an environment**, and a **configuration item belongs to an environment**. Those links tell us where the service or item is represented; they do not, by themselves, designate an approved recovery target.

I would not add a direct recovery-plan-to-environment link here. Before **failover**, we check that the plan applies to the service, the proposed recovery environment is available, and the data-recovery point is acceptable. Before **restoring a backup**, the restore point and target environment must be approved, and the backup must protect the target item and be in a usable status.

### Turn 40 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: deployedIn\n    from: IT Service\n    to: Environment\n    meaning: The IT service is deployed in this environment; this does not designate an approved failover target.\n  - name: belongsTo\n    from: Configuration Item\n    to: Environment\n    meaning: The configuration item belongs to this environment; this does not designate an approved restore target."
}
```

### Turn 40 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 40 — assistant

I recorded **two environment connections**: IT Service *is deployed in* Environment, and Configuration Item *belongs to* Environment. Neither identifies an approved recovery target; failover and restore still require the checks you described.

For “could a recent change or deployment have caused an incident?”, **how does your team trace from the Incident to a candidate Change or Deployment and then to what was modified?** Which connections are recorded facts, and which are only leads to investigate?

### Turn 41 — user

There’s **no direct “caused by change” or “caused by deployment” link** I’d record from an incident on the basis of timing.

To investigate a candidate, we trace the affected IT service and configuration items, then compare them with what a **change affects** (IT service) or **modifies** (configuration item). A **change is implemented by a release**, and the **release is delivered by a deployment**. The deployment **targets an environment** and **deploys an application**. Its execution time gives us a lead to compare with when the incident was detected—not proof of causation.

Two incident-to-change connections mean something else and must not be mistaken for cause: an incident may be **resolved by a change**, and an **emergency change is justified by an active incident**. Establishing that an earlier change caused the incident requires investigation and supporting evidence.

### Turn 41 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: affects\n    from: Change\n    to: IT Service\n    meaning: The change affects this IT service; this does not establish that it caused an incident.\n  - name: modifies\n    from: Change\n    to: Configuration Item\n    meaning: The change modifies this configuration item; this does not establish incident causation.\n  - name: targets\n    from: Deployment\n    to: Environment\n    meaning: The deployment targets this environment.\n  - name: deploys\n    from: Deployment\n    to: Application\n    meaning: The deployment installs or activates this application.\n  - name: resolvedBy\n    from: Incident\n    to: Change\n    meaning: The incident was resolved by this change, not necessarily caused by it.\n  - name: justifiedBy\n    from: Change\n    to: Incident\n    meaning: This emergency change is justified by the active incident; it does not assert that the change caused the incident."
}
```

### Turn 41 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] inverse-pair — Change --justifiedBy--> Incident looks like the inverse of Incident --resolvedBy--> Change. The profile is one directed relationship per real-world connection, never also its inverse. Keep whichever direction the questions and actions actually navigate.

### Turn 41 — assistant

I recorded **six connections** for the change investigation and response paths. No “caused by” link was added: overlap in affected services or items, and deployment timing, are leads requiring evidence.

The canvas flagged the two opposite-direction Incident–Change links: **Incident resolved by Change** and **Change justified by Incident**. You’ve said they mean different things, but this tool treats opposite-direction links between the same pair as a conflict. I won’t silently discard either requirement.

**Which connection should remain as the navigable Incident–Change link, and how should the agent establish the other fact without treating it as the same connection?**

### Turn 42 — user

Keep **Incident → Change: is resolved by** as the navigable connection. It records an outcome once the change has actually resolved the incident; it must not be inferred merely because a change was implemented.

For an **emergency change**, establish the different fact in its execution workflow: identify the **active incident that justifies the emergency path** and verify that the change is linked to it before execution. Retain that justification with the change record. If this canvas cannot store both connections, don’t use the “resolved by” link as a substitute for the justification—or assume that a justified emergency change succeeded.

### Turn 42 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [],
  "relationships": [
    {
      "name": "justifiedBy",
      "from": "Change",
      "to": "Incident"
    }
  ],
  "properties": [],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

### Turn 42 — tool

Removed 1 element(s) — relationships: justifiedBy (Change → Incident).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 42 — assistant

I removed **one connection**, Change → Incident *justified by*, and kept Incident → Change *resolved by*. The emergency-change justification remains a separate execution check to capture later; “resolved by” cannot stand in for it.

Your investigation path also names a **Release** between Change and Deployment. Does the agent need to identify **Release** as its own thing to trace which deployment delivered a change, and is “Release” your term?

### Turn 43 — user

Yes, keep **release** as a separate thing; that’s our term. A release is the governed package of approved changes introduced together, while a deployment is the technical execution that delivers it.

For tracing, a **change is implemented by a release**, and a **release is delivered by a deployment**. Keep those as separate steps: a change being in a release does not, by itself, prove that a particular deployment succeeded or caused an incident.

### Turn 43 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Release:\n    meaning: A governed package of approved changes introduced together, separate from the technical execution that delivers it.\nrelationships:\n  - name: implementedBy\n    from: Change\n    to: Release\n    meaning: The change is included for implementation in this governed release; this does not prove a deployment succeeded.\n  - name: deliveredBy\n    from: Release\n    to: Deployment\n    meaning: The release is delivered by this deployment, whose execution must be checked separately."
}
```

### Turn 43 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 43 — assistant

I added **one class**, Release, and **two connections**: Change *is implemented by* Release, and Release *is delivered by* Deployment. That preserves the difference between a governed package and its technical delivery; neither link proves a deployment succeeded or caused an incident.

For the evidence question, how does the agent get from an **Incident** to the particular **Evidence Items** supporting its impact, classification, decisions, and recovery? Is there a direct incident-to-evidence link, or do some items sit only through another record? What verb and direction would your team use for any direct link?

### Turn 44 — user

There is a direct link: an **incident is supported by an evidence item**. From the item’s perspective, it **documents the incident**. That lets the agent retrieve particular records or artifacts and check their integrity, rather than relying on an unqualified note that “evidence exists.”

Some evidence can also be included in a **regulatory notification**. That is a separate use of the item; inclusion in a notification does not replace the incident link or establish that the evidence supports every decision. The agent should check what each item actually substantiates.

### Turn 44 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: supportedBy\n    from: Incident\n    to: Evidence Item\n    meaning: This evidence item documents the incident and may substantiate a particular impact, classification, decision or recovery claim after checking its integrity.\n    aliases: [documents]"
}
```

### Turn 44 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 44 — assistant

I recorded **one direct connection**: Incident *is supported by* Evidence Item. The item still needs an integrity check, and its presence does not show that it substantiates every incident decision.

For the separate reporting use you described, is **Regulatory Notification → Evidence Item: includes** a direct recorded fact? Is “includes” your preferred verb and direction?

### Turn 45 — user

Yes. A **regulatory notification includes an evidence item** when that item is part of the submission. That’s the direction and verb I’d use.

It’s separate from the incident being supported by evidence: a notification may include selected supporting items, and inclusion alone doesn’t verify their integrity or completeness. Those still need checking before submission.

### Turn 45 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: includes\n    from: Regulatory Notification\n    to: Evidence Item\n    meaning: This evidence item is included in the regulatory submission; inclusion alone does not verify integrity or completeness."
}
```

### Turn 45 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 45 — assistant

I recorded **one connection**: Regulatory Notification *includes* Evidence Item. It remains separate from the Incident–Evidence Item link, and inclusion alone does not verify the item.

For the reporting questions and submission action, **how do you get from an Incident to its Materiality Assessment, then to any Regulatory Notification and its Regulator?** Please give the recorded connections in the directions and verbs your team uses; I won’t assume that an assessment automatically creates or approves a notification.

### Turn 46 — user

I’d use these recorded paths:

- An **incident is evaluated by a materiality assessment**. The assessment records the reporting conclusion, rationale, and applicable due time.
- A **materiality assessment triggers a regulatory notification** when its conclusion calls for one. That does not mean the notification is approved or submitted.
- A **regulatory notification reports the incident** and **is sent to a regulator**.

Before submission, we check that the assessment concludes the incident is reportable, the notification is linked to both the incident and regulator, its required information and evidence are complete, and it is approved. The reporting function and approved procedure determine the reporting obligation and deadline; operations should not infer either from incident severity alone.

### Turn 46 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: evaluatedBy\n    from: Incident\n    to: Materiality Assessment\n    meaning: The incident is evaluated by this assessment recording its reporting conclusion, rationale and applicable due time.\n  - name: triggers\n    from: Materiality Assessment\n    to: Regulatory Notification\n    meaning: The assessment's reporting conclusion calls for this notification without asserting its approval or submission.\n  - name: reports\n    from: Regulatory Notification\n    to: Incident\n    meaning: The regulatory notification reports this incident.\n  - name: sentTo\n    from: Regulatory Notification\n    to: Regulator\n    meaning: The regulatory notification is addressed to this regulator; the link does not itself mean submission occurred."
}
```

### Turn 46 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 46 — assistant

I recorded **four reporting connections**: Incident *evaluated by* Materiality Assessment; a reportable assessment *triggers* a Regulatory Notification; the notification *reports* the Incident and *is sent to* a Regulator. None of those links means the notification has been approved or submitted.

For the stakeholder question and send-update action, **how do you get from an Incident to the Stakeholders who need an update, and to the Communications actually drafted or sent?** Which links are recorded directly, and what verbs and directions would your team use?

### Turn 47 — user

I’d distinguish the intended recipients from the message record:

- An **incident notifies a stakeholder** when that stakeholder is identified for notification. Don’t read that link alone as proof a message was delivered.
- An **incident is communicated through a communication**. The communication **is about the incident** and **is addressed to a stakeholder**.

To establish what was actually sent, check the communication’s status and sent time, then confirm delivery and retain the final message. Before sending, its audience, message, owner, and approval state must be recorded, and its content must match the latest verified incident state.

### Turn 47 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: notifies\n    from: Incident\n    to: Stakeholder\n    meaning: The stakeholder is identified to receive notification about this incident; this link does not mean a message was delivered.\n  - name: communicatedThrough\n    from: Incident\n    to: Communication\n    meaning: The communication is about this incident and records a message used for its communication, whether drafted, approved or sent.\n    aliases: [is about]\n  - name: addressedTo\n    from: Communication\n    to: Stakeholder\n    meaning: The communication is addressed to this stakeholder; delivery must be checked separately."
}
```

### Turn 47 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 47 — assistant

I recorded **three communication connections**: Incident *notifies* Stakeholder as an intended recipient; Incident *is communicated through* Communication; and Communication *is addressed to* Stakeholder. Delivery still needs the communication’s status, sent time, and delivery confirmation.

For closure and outstanding corrective actions—including actions from **prior** incidents—**how do you get from the affected IT Service to earlier reviews and their Corrective Actions?** Please describe the recorded path and your preferred verbs and directions, as well as the path from the current Incident to its own review.

### Turn 48 — user

There’s no direct IT service-to-review or IT service-to-corrective-action link. To find earlier work, start with **earlier incidents that impacted the IT service**. Each incident may **be reviewed in a post-incident review**, and that review **produces corrective actions**. Then check each action’s status to see whether it remains outstanding.

The current incident follows the same path: **Incident → is reviewed in → Post-Incident Review → produces → Corrective Action**. For closure of a major or cybersecurity incident, check that its review is scheduled or completed; the resulting actions do not all have to be finished before closure.

### Turn 48 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: reviewedIn\n    from: Incident\n    to: Post-Incident Review\n    meaning: The incident is reviewed in this post-incident review, which may be scheduled or completed.\n  - name: produces\n    from: Post-Incident Review\n    to: Corrective Action\n    meaning: The post-incident review produces this tracked corrective action."
}
```

### Turn 48 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 48 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 48 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: What is the current health of each affected business service and supporting IT service?
  - id: cq3
    text: Which customer channels deliver the affected business services?
  - id: cq4
    text: "Which infrastructure and third-party services are on an affected IT service's dependency path?"
  - id: cq5
    text: Which configuration items are relevant along that dependency path?
  - id: cq6
    text: Which alerts and events are linked to an incident through its triggering alert or correlated events?
  - id: cq7
    text: Who owns an affected IT service?
  - id: cq8
    text: Which resolver group and on-call engineer should take an incident?
  - id: cq9
    text: "Does an incident meet the bank's criteria for a major-incident declaration?"
  - id: cq10
    text: Who should command the response to a major incident?
  - id: cq11
    text: "Which runbook, workaround, backup set, or recovery plan is applicable to an incident?"
  - id: cq12
    text: "Are the conditions for using a proposed runbook, workaround, backup set, or recovery plan safely met for this incident?"
  - id: cq13
    text: "Could a recent change or deployment have caused an incident, based on its classification and evidence?"
  - id: cq14
    text: "Has the incident's materiality been assessed, and what rationale was recorded?"
  - id: cq15
    text: "Is a regulatory notification required for the incident under the approved procedure and designated reporting function's conclusion?"
  - id: cq16
    text: When is any required regulatory notification due under the applicable reporting requirement?
  - id: cq17
    text: "What evidence supports an incident's impact, classification, decisions, and recovery, and is its integrity preserved?"
  - id: cq18
    text: "Which stakeholders need an incident update, and what has actually been communicated against the latest verified incident state?"
  - id: cq19
    text: "Is an incident ready to close, including restored service health or an accepted residual condition, restoration evidence, required communications, and any applicable post-incident review?"
  - id: cq20
    text: "Which corrective actions from post-incident reviews remain outstanding for the affected service, including actions from prior incidents?"
classes:
  Incident:
    meaning: A recorded disruption or security condition that may impact an IT service or business service.
    aliases: []
    properties: {}
  Business Service:
    meaning: A capability the bank delivers to its users.
    aliases: []
    properties: {}
  IT Service:
    meaning: A service supporting bank capabilities whose operational health is tracked.
    aliases: []
    properties: {}
  Customer Channel:
    meaning: A way customers access a business service.
    aliases: []
    properties: {}
  Configuration Item:
    meaning: A component recorded in configuration-management scope.
    aliases: []
    properties: {}
  Third-Party Service:
    meaning: A service provided by an external party that an IT service can depend on.
    aliases: []
    properties: {}
  Alert:
    meaning: A monitoring signal that may trigger an incident.
    aliases: []
    properties: {}
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases: []
    properties: {}
  Infrastructure Component:
    meaning: "A component on which an IT service runs, whether or not it is recorded as a configuration item."
    aliases: []
    properties: {}
  Service Owner:
    meaning: The party accountable for an IT service across its lifecycle.
    aliases: []
    properties: {}
  Resolver Group:
    meaning: A group assigned to diagnose and restore an incident.
    aliases: []
    properties: {}
  On-Call Engineer:
    meaning: A member of a resolver group who may perform time-critical technical work on an incident.
    aliases: []
    properties: {}
  Incident Commander:
    meaning: The person who commands a major incident and directs its coordination and decision cadence.
    aliases: []
    properties: {}
  Service Desk:
    meaning: The team that records incidents arising from user-reported issues and triages and routes them before assignment.
    aliases: []
    properties: {}
  IT Operations Team:
    meaning: The team operating IT services during day-to-day operations and response without automatic authority for every response action.
    aliases: []
    properties: {}
  Network Operations Centre:
    meaning: The team operating monitoring for network and infrastructure signals.
    aliases: []
    properties: {}
  Security Operations Centre:
    meaning: "The team monitoring security events relevant to assessing an incident's security dimension."
    aliases: []
    properties: {}
  Incident Response Team:
    meaning: The team coordinating a major incident under the incident command structure.
    aliases: []
    properties: {}
  Runbook:
    meaning: A guide for responding to an incident.
    aliases: []
    properties: {}
  Workaround:
    meaning: A temporary measure that reduces incident impact.
    aliases: []
    properties: {}
  Backup Set:
    meaning: A set of backup data protecting particular configuration items that may be used in restoration.
    aliases: []
    properties: {}
  Recovery Plan:
    meaning: A plan for restoring an IT service that may use a backup set.
    aliases: []
    properties: {}
  Environment:
    meaning: An operating environment that may serve as an approved target for failover or restoration.
    aliases: []
    properties: {}
  Change:
    meaning: A controlled modification that may be executed through a deployment or an accelerated emergency path.
    aliases: []
    properties: {}
  Deployment:
    meaning: The technical execution that installs or activates a change.
    aliases: []
    properties: {}
  Evidence Item:
    meaning: A particular preserved record or artifact whose integrity can be checked and whose support for an incident can be traced.
    aliases:
      - Evidence
    properties: {}
  Materiality Assessment:
    meaning: "A recorded assessment of an incident's reporting conclusion, rationale, and applicable reporting due time determined under the approved procedure."
    aliases: []
    properties: {}
  Regulatory Notification:
    meaning: "A formal submission about an incident to the regulator, distinct from the assessment that may require it."
    aliases: []
    properties: {}
  Stakeholder:
    meaning: "A person, group, or organisation with an interest in an incident's outcome who may need communication."
    aliases: []
    properties: {}
  Communication:
    meaning: "A message about an incident addressed to a stakeholder or audience and tracked through drafting, approval, and sending."
    aliases: []
    properties: {}
  Post-Incident Review:
    meaning: "A review of an incident, its response, causes and lessons that can produce corrective actions."
    aliases: []
    properties: {}
  Corrective Action:
    meaning: "A tracked follow-up from a post-incident review with its own owner, status and due date."
    aliases: []
    properties: {}
  Monitoring Tool:
    meaning: A tool operated by the network operations centre that monitors IT services and configuration items and executes monitoring rules.
    aliases: []
    properties: {}
  Monitoring Rule:
    meaning: A rule executed by a monitoring tool that evaluates telemetry and may generate an alert.
    aliases: []
    properties: {}
  Regulator:
    meaning: The authority to which a regulatory notification about an incident is submitted.
    aliases: []
    properties: {}
  Application:
    meaning: A software system implementing an IT service that may run on infrastructure components.
    aliases: []
    properties: {}
  Problem:
    meaning: "The underlying or potential cause of one or more incidents, which may not yet be diagnosed."
    aliases: []
    properties: {}
  Known Error:
    meaning: Documentation of a diagnosed problem with a known cause or workaround.
    aliases: []
    properties: {}
  Release:
    meaning: "A governed package of approved changes introduced together, separate from the technical execution that delivers it."
    aliases: []
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: IT Service
    meaning: The incident has a confirmed impact on this IT service.
    aliases: []
  - name: impacts
    from: Incident
    to: Business Service
    meaning: The incident has a confirmed impact on this business service.
    aliases: []
  - name: dependsOn
    from: Business Service
    to: IT Service
    meaning: The business service depends on this supporting IT service.
    aliases: []
  - name: deliveredThrough
    from: Business Service
    to: Customer Channel
    meaning: The business service is delivered through this customer channel without implying the channel is disrupted.
    aliases: []
  - name: runsOn
    from: IT Service
    to: Infrastructure Component
    meaning: The IT service runs on this infrastructure component as a documented technical dependency.
    aliases: []
  - name: dependsOn
    from: IT Service
    to: Third-Party Service
    meaning: The IT service depends on this third-party service.
    aliases: []
  - name: affects
    from: Incident
    to: Configuration Item
    meaning: The incident has an established effect on this configuration item.
    aliases: []
  - name: implementedBy
    from: IT Service
    to: Application
    meaning: The IT service is implemented by this application.
    aliases:
      - is implemented by
  - name: runsOn
    from: Application
    to: Infrastructure Component
    meaning: The application runs on this infrastructure component.
    aliases: []
  - name: executedBy
    from: Monitoring Rule
    to: Monitoring Tool
    meaning: The monitoring tool executes this rule to evaluate telemetry.
    aliases:
      - executes
  - name: generatedBy
    from: Alert
    to: Monitoring Rule
    meaning: This alert was generated by the rule when it has a monitoring-rule origin.
    aliases:
      - generates
  - name: triggeredBy
    from: Incident
    to: Alert
    meaning: "This incident was opened as a result of this alert, when that link is established."
    aliases:
      - triggers
  - name: correlatedFrom
    from: Incident
    to: Event
    meaning: This event has been established as correlated with the incident rather than merely concurrent.
    aliases:
      - is correlated with
  - name: operates
    from: Network Operations Centre
    to: Monitoring Tool
    meaning: The network operations centre operates this monitoring tool.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: IT Service
    meaning: The monitoring tool monitors this IT service.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: Configuration Item
    meaning: The monitoring tool monitors this configuration item.
    aliases: []
  - name: records
    from: Service Desk
    to: Incident
    meaning: The service desk records this incident arising from a user-reported issue.
    aliases: []
  - name: operates
    from: IT Operations Team
    to: IT Service
    meaning: The IT operations team operates this IT service.
    aliases: []
  - name: monitors
    from: Security Operations Centre
    to: Event
    meaning: "The centre actually monitors this event, which has been identified as a security event; this does not apply to all events."
    aliases:
      - monitors security event
  - name: owns
    from: Service Owner
    to: IT Service
    meaning: The service owner is accountable for this IT service across its lifecycle.
    aliases:
      - owned by
  - name: assignedTo
    from: Incident
    to: Resolver Group
    meaning: The incident has been assigned to this resolver group for diagnosis and restoration.
    aliases: []
  - name: memberOf
    from: On-Call Engineer
    to: Resolver Group
    meaning: The on-call engineer is a member of this resolver group.
    aliases:
      - belongs to
  - name: handledBy
    from: Incident
    to: On-Call Engineer
    meaning: This on-call engineer directly handles time-critical technical work on the incident.
    aliases: []
  - name: coordinatedBy
    from: Incident
    to: Incident Commander
    meaning: The declared major incident is coordinated by its assigned incident commander.
    aliases:
      - commands major-incident response
  - name: coordinates
    from: Incident Response Team
    to: Incident
    meaning: "The incident response team coordinates this declared major incident, not every incident."
    aliases: []
  - name: memberOf
    from: Incident Commander
    to: Incident Response Team
    meaning: The incident commander is a member of the incident response team.
    aliases: []
  - name: handledWith
    from: Incident
    to: Runbook
    meaning: The runbook selected to guide response to this incident; selection does not establish safe execution.
    aliases: []
  - name: recoveredWith
    from: Incident
    to: Recovery Plan
    meaning: "The recovery plan selected for this incident, subject to checking its applicability and safety."
    aliases: []
  - name: recovers
    from: Recovery Plan
    to: IT Service
    meaning: The IT service that this recovery plan describes restoring.
    aliases: []
  - name: protects
    from: Backup Set
    to: Configuration Item
    meaning: The configuration item protected by this backup set.
    aliases: []
  - name: uses
    from: Recovery Plan
    to: Backup Set
    meaning: The backup set that this recovery plan may use in restoration.
    aliases: []
  - name: linkedTo
    from: Incident
    to: Problem
    meaning: The incident is linked to this underlying or potential problem.
    aliases: []
  - name: documentedBy
    from: Problem
    to: Known Error
    meaning: The problem has been diagnosed and documented by this known error.
    aliases: []
  - name: has
    from: Known Error
    to: Workaround
    meaning: The known error has this documented workaround.
    aliases: []
  - name: documentedIn
    from: Workaround
    to: Runbook
    meaning: The workaround is documented in this runbook; documentation does not establish safety for a particular incident.
    aliases: []
  - name: deployedIn
    from: IT Service
    to: Environment
    meaning: The IT service is deployed in this environment; this does not designate an approved failover target.
    aliases: []
  - name: belongsTo
    from: Configuration Item
    to: Environment
    meaning: The configuration item belongs to this environment; this does not designate an approved restore target.
    aliases: []
  - name: affects
    from: Change
    to: IT Service
    meaning: The change affects this IT service; this does not establish that it caused an incident.
    aliases: []
  - name: modifies
    from: Change
    to: Configuration Item
    meaning: The change modifies this configuration item; this does not establish incident causation.
    aliases: []
  - name: targets
    from: Deployment
    to: Environment
    meaning: The deployment targets this environment.
    aliases: []
  - name: deploys
    from: Deployment
    to: Application
    meaning: The deployment installs or activates this application.
    aliases: []
  - name: resolvedBy
    from: Incident
    to: Change
    meaning: "The incident was resolved by this change, not necessarily caused by it."
    aliases: []
  - name: implementedBy
    from: Change
    to: Release
    meaning: The change is included for implementation in this governed release; this does not prove a deployment succeeded.
    aliases: []
  - name: deliveredBy
    from: Release
    to: Deployment
    meaning: "The release is delivered by this deployment, whose execution must be checked separately."
    aliases: []
  - name: supportedBy
    from: Incident
    to: Evidence Item
    meaning: "This evidence item documents the incident and may substantiate a particular impact, classification, decision or recovery claim after checking its integrity."
    aliases:
      - documents
  - name: includes
    from: Regulatory Notification
    to: Evidence Item
    meaning: This evidence item is included in the regulatory submission; inclusion alone does not verify integrity or completeness.
    aliases: []
  - name: evaluatedBy
    from: Incident
    to: Materiality Assessment
    meaning: "The incident is evaluated by this assessment recording its reporting conclusion, rationale and applicable due time."
    aliases: []
  - name: triggers
    from: Materiality Assessment
    to: Regulatory Notification
    meaning: "The assessment's reporting conclusion calls for this notification without asserting its approval or submission."
    aliases: []
  - name: reports
    from: Regulatory Notification
    to: Incident
    meaning: The regulatory notification reports this incident.
    aliases: []
  - name: sentTo
    from: Regulatory Notification
    to: Regulator
    meaning: The regulatory notification is addressed to this regulator; the link does not itself mean submission occurred.
    aliases: []
  - name: notifies
    from: Incident
    to: Stakeholder
    meaning: The stakeholder is identified to receive notification about this incident; this link does not mean a message was delivered.
    aliases: []
  - name: communicatedThrough
    from: Incident
    to: Communication
    meaning: "The communication is about this incident and records a message used for its communication, whether drafted, approved or sent."
    aliases:
      - is about
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: The communication is addressed to this stakeholder; delivery must be checked separately.
    aliases: []
  - name: reviewedIn
    from: Incident
    to: Post-Incident Review
    meaning: "The incident is reviewed in this post-incident review, which may be scheduled or completed."
    aliases: []
  - name: produces
    from: Post-Incident Review
    to: Corrective Action
    meaning: The post-incident review produces this tracked corrective action.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 48 — assistant

I recorded **two review connections**: Incident *is reviewed in* Post-Incident Review, which *produces* Corrective Actions. For earlier actions, the path starts with earlier Incidents that impacted the same IT Service; no direct Service–Review or Service–Action link was added.

I’ve checked the live canvas: every class now has at least one connection. I also traced the classes added during this pass: **Application** sits between IT Service and Infrastructure Component; **Problem → Known Error → Workaround** extends the incident response path; and **Release** sits between Change and Deployment.

One part of the dependency path still needs a precise boundary. **When the agent reaches an Application or Infrastructure Component, is checking whether it is recorded in configuration-management scope an external lookup, rather than a further relationship between classes in this model?**

### Turn 49 — user

Yes. For this model, check the current configuration-management record to establish whether that application or infrastructure component is a **configuration item**. Don’t add a relationship implying every component has a separate configuration-item record.

That lookup is distinct from the incident’s **affects configuration item** link, which records an established impact. A documented dependency gets you to a candidate component; the configuration-management check tells you whether it is in scope, and the incident evidence tells you whether it was affected.

### Turn 49 — assistant

That closes the configuration-item path: documented service dependencies lead to candidate Applications and Infrastructure Components; a current configuration-management lookup establishes which are Configuration Items; incident evidence establishes which items were affected. I added no relationship in this turn.

The connection pass now covers impact and delivery, technical and monitoring paths, response roles, recovery resources, change investigation, evidence, reporting, communications, and review follow-up. The remaining checks—such as actual channel disruption, current resolver-group support, and recovery-target approval—are **checks to perform**, not facts inferred from those links.

**Does that accurately capture the connection pass before we identify the decision-relevant values the agent needs to check?**

### Turn 50 — user

Yes, that captures the connection pass and its important boundaries. The links let the agent find candidates and recorded outcomes; they do not, by themselves, prove channel disruption, change causation, resolver-group support, or approval of a recovery target.

We can move to decision-relevant values, keeping **recorded state**, **evidence**, and **action-specific checks** distinct.

### Turn 50 — assistant

We’ll keep recorded state separate from evidence and from checks made immediately before an action.

For **Incident**, I propose four values, each tied to a recorded question or action:

- **status** — to check whether the incident is active, contained, or ready to close.
- **classification** — to distinguish a declared major incident or cybersecurity incident from an ordinary incident; meeting major-incident criteria alone would not set it to “major.”
- **severity** — to help assess the response path and major-incident criteria.
- **detected time** — to compare with a deployment’s execution time as an investigation lead, not proof of cause.

Does the agent need each value for those purposes, and are these your names for them?

### Turn 51 — user

The agent needs **status**, **severity**, and **detected time** for those purposes. Those names work. Status tells us where the incident is in its lifecycle, but it cannot establish closure readiness on its own. Detected time helps compare the incident with a deployment; proximity is only an investigation lead.

I wouldn’t add a general **classification** field with “major” and “cybersecurity” as values. For a major incident, declaration sets a major-incident classification or flag, with a declaration time and assigned commander; severity alone does not set it. A cybersecurity incident must also remain distinguishable, but we haven’t established a specific field or controlled value for representing that distinction. We should model the distinction without inventing a shared classification vocabulary.

### Turn 51 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status: {type: text}\n      severity: {type: text}\n      detectedTime: {type: date}"
}
```

### Turn 51 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 51 — assistant

I recorded **three Incident properties**: status, severity, and detected time. I did not add a general classification field or assume controlled values for “major” and “cybersecurity.”

For the declared-major path, **what names does your team use on the Incident record for the declaration indicator and declaration time**? Is the indicator a yes/no flag, while the time records when declaration occurred? The commander is already represented by a connection.

### Turn 52 — user

We use a **major-incident flag or classification** to show that declaration has happened, and a **declaration time** to record when it happened. The flag is a yes/no indication in the declaration workflow; it must not be set merely because the incident meets the criteria.

I wouldn’t prescribe a more specific field name for the indicator. After declaration, we verify the classification, declaration time, assigned commander, and communication record together.

### Turn 52 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      majorIncidentFlag: {type: boolean}\n      declarationTime: {type: date}"
}
```

### Turn 52 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 52 — assistant

I recorded **two Incident properties** for the declaration workflow: a yes/no `majorIncidentFlag` and `declarationTime`. The field name is provisional because you did not prescribe one; the flag must be set by declaration, not inferred from severity or criteria. We’ll verify it alongside the commander connection and communication record.

For **cybersecurity incidents**, what recorded fact lets the agent distinguish them from other Incidents when applying the evidence-preservation, materiality, and closure-review checks? Is there a yes/no indication on the Incident record, or does your team establish it another way?

### Turn 53 — user

We do **not** have a specified yes/no cybersecurity flag. The incident has a **category**, for which *cybersecurity* is an allowed value, and a cybersecurity incident can be traced to a **security event**. Those are the recorded facts I’d use to identify the security response path, while checking the incident details and evidence rather than inferring it from a nearby event.

Once identified as a cybersecurity incident, apply its evidence-preservation and materiality checks and the post-incident-review condition at closure. I wouldn’t add an unsupported boolean field.

### Turn 53 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      category: {type: text}"
}
```

### Turn 53 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 53 — assistant

I recorded **Incident.category** for the cybersecurity response path; I did not add a cybersecurity flag. “Cybersecurity” is a confirmed category value, and we’ll capture the full allowed-value list later. The linked security event and incident evidence remain checks, not a conclusion drawn from timing.

For the health question, do **Business Service** and **IT Service** each have their own **current health** value? If so, what does your team call the value on each service?

### Turn 54 — user

Yes. Each **business service** and **IT service** has its own **health state**. We use the same term for both, but assess them separately: an unhealthy IT service can help explain business-service impact, not automatically establish the business service’s current state. Neither health state is a customer-channel health field.

### Turn 54 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Business Service:\n    properties:\n      healthState: {type: text}\n  IT Service:\n    properties:\n      healthState: {type: text}"
}
```

### Turn 54 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 54 — assistant

I recorded **healthState** on **Business Service** and **IT Service**, assessed separately. I added no Customer Channel health field.

For the confirmed-channel-impact question, you said the delivery link identifies channels to investigate but does not prove disruption, and you declined a direct Incident–Customer Channel link. **What recorded result or verification step lets the agent say that a particular channel was actually affected by an incident?**

### Turn 55 — user

The delivery link gives us a **channel to investigate**, not a recorded result that the channel was disrupted. We would verify the channel’s actual behaviour using incident evidence and the confirmed impact on the business service.

There is no separate channel-health value, direct incident-to-channel link, or specified channel-impact result in this model. So if that verification has not been recorded in the incident’s evidence, the agent should say the channel **may be affected**, not that its disruption is confirmed.

### Turn 55 — assistant

That gives the agent a clear limit: it can identify channels to investigate through the affected Business Service, but it may call a channel **confirmed affected** only when incident evidence verifies its actual behaviour. Otherwise it must say **may be affected**. I added no channel property or link.

For the evidence-integrity question and the actions that must retain records: **what values on an Evidence Item let your team identify the item and determine whether its integrity is preserved?** Please use your team’s field names, and distinguish recorded values from a verification that must be performed.

### Turn 56 — user

For an **evidence item**, we record **when it was collected**, its **integrity status**, and a **cryptographic hash** where one has been recorded. The allowed integrity statuses are **collected, hashed, verified, sealed, and compromised**.

Those are recorded values, not a substitute for verification. To rely on an item, the agent should confirm that it is the particular artifact linked to the incident, check what it substantiates, and verify its integrity rather than assuming that “collected” or a populated hash means it remains intact. I wouldn’t invent a separate identifier field here; the model does not prescribe one.

### Turn 56 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Evidence Item:\n    properties:\n      collectedTime: {type: date}\n      integrityStatus: {type: text, allowed: [collected, hashed, verified, sealed, compromised]}\n      cryptographicHash: {type: text}"
}
```

### Turn 56 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 56 — assistant

I recorded **three Evidence Item values**: collection time, integrity status with your five stated choices, and cryptographic hash where recorded. I did not add an identifier. A status or hash alone does not replace checking the particular artifact, what it substantiates, and its integrity.

For the **alert-acknowledgement action** and the **possible-change investigation**, which recorded values does your team use on **Alert**, **Event**, and **Deployment** to establish an alert’s acknowledgement, an event’s detection source, and a deployment’s execution time? Please give only values used for those specific tasks, using your names.

### Turn 57 — user

For those tasks, I’d use:

- **Alert:** its **status** to check whether it is *new* before acknowledgement and *acknowledged* afterward. Retain the acknowledgement timestamp produced by the action.
- **Event:** its **observed time** and **detection source**. The source describes how it was detected; it does not establish that the event is correlated with the incident.
- **Deployment:** its **start time**, **completion time**, and **status**. Compare that execution window with the incident’s detected time as an investigation lead, not proof of cause.

The deployment status also prevents us from treating a planned or failed deployment as if it necessarily delivered a change successfully.

### Turn 57 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    properties:\n      status: {type: text}\n      acknowledgementTime: {type: date}\n  Event:\n    properties:\n      observedTime: {type: date}\n      detectionSource: {type: text}\n  Deployment:\n    properties:\n      startTime: {type: date}\n      completionTime: {type: date}\n      status: {type: text}"
}
```

### Turn 57 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 57 — assistant

I recorded **seven values** across Alert, Event, and Deployment: alert status and acknowledgement time; event observed time and detection source; and deployment start time, completion time, and status. A detection source does not prove correlation, and a deployment window or status does not prove causation.

For the two recovery actions, which **recorded values** does your team check on **Backup Set** and **Environment**? In particular, is backup usability recorded as a status, and is recovery-target availability recorded as the Environment’s current state? I’ll keep approval of a specific restore point or target as an action-time check unless you say it is a recorded value.

### Turn 58 — user

**Backup set** has a recorded **status**. For a restore, it must be **successful** or **verified**; we also check that it protects the target configuration item. Its **last successful backup** and **last verification** dates help assess the available backup, but status alone does not approve a restore.

For **environment**, we record its **environment type**—for example, disaster recovery—not a current availability state. Availability of the proposed failover target is an action-time check. Likewise, approval of the specific restore point and target environment must be established before restoring; I wouldn’t add approval fields to Environment on that basis.

### Turn 58 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Backup Set:\n    properties:\n      status: {type: text}\n      lastSuccessfulBackup: {type: date}\n      lastVerification: {type: date}\n  Environment:\n    properties:\n      environmentType: {type: text}"
}
```

### Turn 58 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 58 — assistant

I recorded **four values**: Backup Set status, last successful backup, and last verification; plus Environment type. I did not add Environment availability or target-approval fields. Those must be checked for the proposed action. We’ll capture the complete allowed choices for backup status and environment type later.

For reporting, which recorded values on **Materiality Assessment** and **Regulatory Notification** let the agent answer the reporting conclusion, rationale, due time, approval, and submission questions? Please use your terms; the assessment’s conclusion must remain distinct from a notification’s state.

### Turn 59 — user

On the **materiality assessment**, use the **result**, **rationale**, and **reporting due time**. The result records the reporting conclusion; the rationale explains it, and the due time is the applicable deadline established through the approved reporting process.

On the **regulatory notification**, use its **status**, **due time**, and **submission time**. Status distinguishes a draft or pending approval from an approved or submitted notification. Before submission, the notification must be approved and linked to the incident and regulator, with required information and evidence complete; submission must occur before its due time. Record the submission receipt, then confirm acceptance or record rejection and remediation. An assessment result never substitutes for those notification checks.

### Turn 59 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Materiality Assessment:\n    properties:\n      result: {type: text}\n      rationale: {type: text}\n      reportingDueTime: {type: date}\n  Regulatory Notification:\n    properties:\n      status: {type: text}\n      dueTime: {type: date}\n      submissionTime: {type: date}"
}
```

### Turn 59 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 59 — assistant

I recorded **six values**: Materiality Assessment result, rationale, and reporting due time; Regulatory Notification status, due time, and submission time. Approval, submission, receipt, and acceptance remain distinct from the assessment’s conclusion. We still need to establish how receipt and rejection are recorded before defining submission verification.

For the **send stakeholder update** action, which values are recorded on **Communication** for its audience, message, owner, approval, sending, and delivery—and what names does your team use?

### Turn 60 — user

On a **communication**, we record its **audience**, **message summary**, **status**, and **sent time**. The status covers drafting and approval as well as submission; the sent time records when it went out. The addressed-to stakeholder link identifies the recipient.

The **message owner and approval state must be recorded before sending**, but I wouldn’t invent a separate owner field here. Likewise, we must **confirm delivery status and archive the final message** afterward, but this model does not specify a separate delivery-status field. The message also has to match the latest verified incident state before it is sent.

### Turn 60 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Communication:\n    properties:\n      audience: {type: text}\n      messageSummary: {type: text}\n      status: {type: text}\n      sentTime: {type: date}"
}
```

### Turn 60 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 60 — assistant

I recorded **four Communication values**: audience, message summary, status, and sent time. I did not add owner or delivery-status fields. Message ownership, approval, delivery confirmation, and archiving remain checks we must account for when defining the send action.

For the **closure and outstanding-action questions**, what recorded values do you use on **Post-Incident Review** and **Corrective Action** to tell whether a review is scheduled or completed and whether an earlier action remains outstanding? Are **review status**, **action status**, **action owner**, and **action due date** your terms?

### Turn 61 — user

For a **post-incident review**, we record **held-on date** and **findings**, but not a review-status field. A held-on date helps establish that a review occurred. If closure depends on a review being *scheduled* rather than completed, we must verify the scheduling separately; I wouldn’t invent a review status to represent it.

For a **corrective action**, **status** and **due date** are recorded values. Its **owner** is represented by a link to the responsible organisational unit, not by an action-owner field. To find outstanding work, follow earlier reviews to their corrective actions and check each action’s status; the due date tells us when it is expected, not whether it is complete.

### Turn 61 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Post-Incident Review:\n    properties:\n      heldOnDate: {type: date}\n      findings: {type: text}\n  Corrective Action:\n    properties:\n      status: {type: text}\n      dueDate: {type: date}"
}
```

### Turn 61 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 61 — assistant

I recorded **four values**: Post-Incident Review held-on date and findings, and Corrective Action status and due date. I did not add a review-status or owner field; scheduling still needs a separate check.

You said a Corrective Action’s owner is linked to a **responsible organisational unit**. For the recorded question about outstanding corrective actions, does the agent need to **identify that unit separately** to retrieve or act on the outstanding work, or is following the action and its status sufficient? If it needs a separate unit, is “Organisational Unit” your term?

### Turn 62 — user

Yes, keep the **organisational unit** separately. Finding an outstanding action by status answers *what remains open*; knowing which unit owns it tells us who is accountable for follow-up. A **corrective action is owned by an organisational unit**—that’s the connection I’d record, rather than an owner text field.

“Organisational unit” is fine as our working term. Don’t assume the unit’s ownership means the corrective action has been implemented or verified; those are separate status checks.

### Turn 62 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Organisational Unit:\n    meaning: A unit accountable for following up a corrective action.\nrelationships:\n  - name: ownedBy\n    from: Corrective Action\n    to: Organisational Unit\n    meaning: The organisational unit accountable for following up this corrective action; ownership does not prove completion or verification."
}
```

### Turn 62 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 62 — assistant

The new **Organisational Unit** has a direct link from Corrective Action. To revisit the path introduced by this late-added class: the agent can reach the accountable unit from an affected IT Service through an earlier impacted Incident → Post-Incident Review → Corrective Action → Organisational Unit.

**Does the affected Incident also have its own direct link to the Organisational Unit responsible for that corrective action, or is the link only through the action?**

### Turn 63 — user

Only through the **corrective action** for this purpose: an earlier incident is reviewed in a post-incident review, the review produces a corrective action, and that action is owned by an organisational unit.

I wouldn’t add a direct incident-to-unit link to represent corrective-action ownership. An incident can lead to several actions with different owners, so the ownership belongs on each action.

### Turn 63 — assistant

For corrective-action ownership, the path is **Incident → Post-Incident Review → Corrective Action → Organisational Unit**. I added no direct Incident–Organisational Unit link; each action can have a different owner.

Next, for the agreed **execute emergency change** action: what recorded values on **Change** distinguish the emergency path and show its execution state? Please use your team’s terms, and keep the active-incident justification and action-time prerequisites separate from any recorded value.

### Turn 64 — user

On the **change**, I’d check **status** for its execution state, **risk level** for the assessed risk, and the **implementation plan** and **backout plan**. We also identify the configuration items the change modifies through their links to it.

An **emergency change** follows an accelerated change path, but I would not invent an emergency flag or controlled field to distinguish it. Before execution, separately confirm the link to an **active incident**, that both plans are present, that affected configuration items are identified, and that the risk has been explicitly accepted. A recorded risk level is not the same as risk acceptance.

### Turn 64 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change:\n    properties:\n      status: {type: text}\n      riskLevel: {type: text}\n      implementationPlan: {type: text}\n      backoutPlan: {type: text}"
}
```

### Turn 64 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 64 — assistant

I recorded **four Change values**: status, risk level, implementation plan, and backout plan. I did not add an emergency flag or treat a recorded risk level as risk acceptance.

There is still a gap for the emergency-change action: you require a link to an **active Incident** before execution, but the canvas’s only Incident–Change link is *resolved by*, which records a later outcome. **Where does your team retain the emergency change’s incident justification so the agent can verify it without using “resolved by” as a substitute?**

### Turn 65 — user

We retain the **active incident reference and the reason it justifies the emergency path with the emergency-change execution record**. That is a pre-execution workflow check, not the later **Incident → Change: is resolved by** outcome.

I haven’t specified a separate named property for that justification. If the canvas cannot represent the emergency-change-to-incident link, the agent must verify it in the change workflow before execution. If it cannot verify the link, it must not execute the change.

### Turn 65 — assistant

The emergency-change execution record retains the active incident reference and justification, but you have not specified a named field for them. I won’t use *Incident resolved by Change* to represent that earlier justification. The action must be blocked if the workflow cannot verify the active-incident link and reason.

For **containment and closure**, which values on **Incident** does your team record to distinguish containment from restoration and to document an accepted residual condition? I won’t assume that changing incident status alone proves either.

### Turn 66 — user

We use the incident’s **status** to distinguish stages such as *contained*, *recovering*, *monitoring*, *resolved*, and *closed*. **Resolved time** and **closed time** record those later milestones. None of those values, on its own, proves that service has been restored.

For containment, we record the **scope and expected side effects** before acting, then verify the containment indicators and remaining service impact before setting the status to *contained*. For closure, check the impacted services’ **health states**, restoration and resolution evidence, and required communications. If a residual condition is accepted, that acceptance must be established and retained; I wouldn’t invent a dedicated incident field for it.

### Turn 66 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      resolvedTime: {type: date}\n      closedTime: {type: date}"
}
```

### Turn 66 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 66 — assistant

I recorded **two more Incident values**: resolved time and closed time. The existing status can mark containment, recovery, monitoring, resolution, and closure, but neither status nor those times prove restored service health. Containment scope, side effects, and residual acceptance remain checks with retained records, not fields I’ve invented.

For the separate **isolate a configuration item** action, what recorded value on the Configuration Item, if any, shows that it is isolated or reconnected? How does your team verify the isolation’s impact and the ability to roll it back?

### Turn 67 — user

There’s **no specified isolated/reconnected status on the configuration item**. Don’t add one just for this action.

Before isolation, confirm the item is linked to the incident, assess the isolation’s impact, and have a rollback or reconnection method available. After acting, verify that the item is isolated from the defined networks or dependencies and check the health of the remaining services. Retain the assessment, method, and verification with the response record; the incident’s status alone would not prove isolation.

### Turn 67 — assistant

I added **no Configuration Item status**. Before isolation, the agent must check the incident–item link, assess impact, and confirm a rollback or reconnection method. Afterward, it must verify the defined isolation and remaining service health, retaining the assessment and result as response evidence. Incident status alone cannot prove isolation.

For components the agent may track during an incident, does your team record a **current operational state** on any of **Application, Infrastructure Component, Configuration Item, or Third-Party Service**? Please distinguish recorded states from checks made against a live source; I won’t add a field merely because the agent can inspect one.

### Turn 68 — user

Not as a specified **current operational-state field** on any of those four. We record **health state** on the IT service and business service, not a general health or isolation state on every component or supplier service.

The agent can inspect monitoring and other current operational evidence to assess a particular application, infrastructure component, configuration item, or third-party service. That live check should not be turned into a new property unless there is a defined recorded value for it. A configuration item does have a **criticality tier**, but that is not its current operating state.

### Turn 68 — assistant

I won’t add a current-state field to those four classes. Service health remains on Business Service and IT Service; a component’s or supplier service’s current condition is checked from live evidence.

You mentioned **Configuration Item criticality tier**. Does the agent use that recorded tier when assessing the impact of **isolating the item**, and is “criticality tier” your name for the value? If not, I’ll leave it out rather than add it just in case.

### Turn 69 — user

Yes—**criticality tier** is our term, and it is useful context when assessing the impact of isolating a configuration item. It can flag that the item supports something important, but it does **not** replace checking its actual dependencies, the expected service impact, and the rollback or reconnection method.

Record it as an impact-assessment input, not as permission to isolate—or as a claim that a particular tier always blocks isolation.

### Turn 69 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Configuration Item:\n    properties:\n      criticalityTier: {type: text}"
}
```

### Turn 69 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 69 — assistant

I recorded **Configuration Item criticality tier** as an input to the isolation impact assessment—not as permission to isolate or an automatic blocker. Actual dependencies, expected service impact, and a rollback or reconnection method still need checking.

For **Runbook, Workaround, and Recovery Plan**, are applicability and safe-use conditions recorded as values on those resources, or does the agent establish them separately for the particular Incident and proposed action? I’ll add a property only if you identify a recorded value the agent uses.

### Turn 70 — user

Establish applicability and safe use **for the particular incident and action**; don’t add generic “safe to use” or “applicable” fields to a runbook or workaround. Their links help identify candidates, not authorise use.

A **recovery plan** does have recorded **recovery time objective**, **recovery point objective**, and **last review date**. Those help assess recovery expectations and currency, but they do not prove that a proposed failover target is available or that its data-recovery point is acceptable. I wouldn’t add a general safety flag to the plan.

### Turn 70 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Recovery Plan:\n    properties:\n      recoveryTimeObjective: {type: number}\n      recoveryPointObjective: {type: number}\n      lastReviewDate: {type: date}"
}
```

### Turn 70 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 70 — assistant

I recorded **three Recovery Plan values**: recovery time objective, recovery point objective, and last review date. I added no generic applicability or safety flag. The plan’s objectives and currency inform the action-specific check; they do not prove target availability or an acceptable recovery point.

**What unit does your team use for each objective**—recovery time objective and recovery point objective? I need that before treating the numeric values as fully specified.

### Turn 71 — user

They are **numeric time objectives**, but this model does not prescribe a unit for either one. The bank’s approved recovery documentation must specify the unit used so the values can be interpreted consistently; I wouldn’t assume minutes or hours.

### Turn 71 — assistant

I’ll leave both Recovery Plan objectives as numeric values **without a unit** for now. Their units remain an open item: the agent must obtain them from the bank’s approved recovery documentation before interpreting or comparing the objectives. I added nothing in this turn.

For the notification action, you said to retain a submission receipt and then confirm acceptance or record rejection and remediation. **Are receipt and acceptance or rejection recorded as values on the Regulatory Notification, or verified in the submission workflow without additional fields in this model?**

### Turn 72 — user

The **regulatory notification’s status** records the outcome states, including *submitted*, *accepted*, and *rejected*. Its **submission time** records when it was sent. The **submission receipt** must be stored as part of the workflow record, but there is no separate receipt field specified here.

After submission, confirm acceptance. If it is rejected, record the rejection and remediation in the workflow; don’t equate “submitted” with “accepted,” or invent another notification property to stand for the receipt.

### Turn 72 — assistant

I’ll use the **Regulatory Notification status** to distinguish submitted, accepted, and rejected, alongside its submission time. The receipt and any rejection or remediation belong in the workflow record; I won’t invent receipt fields or treat “submitted” as “accepted.” No new property was added in this turn.

One source value is still unresolved: you said an **Alert or Event** records a detection source, but so far I’ve recorded it only on Event. **Does Alert also have a recorded “detection source” value used to trace how it entered the incident response path?**

### Turn 73 — user

Yes. An **alert** also has a recorded **detection source**. It tells us how that alert entered the response path, but not which particular monitoring tool or rule generated it; use the specific links for those where they apply. It also does not, by itself, prove the alert triggered an incident.

### Turn 73 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    properties:\n      detectionSource: {type: text}"
}
```

### Turn 73 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 73 — assistant

I recorded **Alert.detectionSource**. It describes how the alert entered the response path; the specific Monitoring Rule and Tool links, and the Incident’s triggering-alert link, establish different facts.

One current-state check remains for the monitoring path: does the agent **track the Monitoring Tool’s own current operational state over time** when deciding whether its alerts can be relied on, or does it verify tool operation from live evidence without a recorded tool-state value?

### Turn 74 — user

There’s no specified **current operational-state value** on the monitoring tool. Verify that the tool is operating from current operational evidence when its alerts are in doubt; don’t treat the existence of an alert or a tool link as proof that monitoring is healthy now.

That check is separate from the alert’s own status and detection source.

### Turn 74 — assistant

Understood. I added **no Monitoring Tool state property**. If its alerts are in doubt, the agent must verify the tool’s operation from current evidence; neither an alert nor a tool link proves it is healthy.

That completes this pass over decision-relevant values. We’ve recorded service health, incident and action states, timing, evidence integrity, recovery objectives, reporting decisions, and follow-up status where you identified a use. We’ve left action-time checks—such as target availability, approval, and actual channel disruption—out of generic fields.

**Is that an accurate recap of the property pass before we check terminology and definitions?**

### Turn 75 — user

Yes, that’s an accurate recap. The recorded values support decisions, but they do not replace live verification, approval, or action-specific checks. In particular, keep the major-incident indicator distinct from meeting declaration criteria, and do not infer cybersecurity status from a nearby event.

We can move to terminology and definitions.

### Turn 75 — assistant

The recorded meanings are already in place for the classes and connections, so this terminology pass can focus on alternate names people actually use. I’ll check a small group at a time and won’t invent synonyms.

For **Incident, Business Service, IT Service, Customer Channel, and Configuration Item**: does your team use any other name for the *same thing* in each case? “None” is fine for any item.

### Turn 76 — user

Yes, these alternate names are in use:

- **Incident:** *incidens*; *hibajegy* is also used for the recorded incident ticket.
- **Business service:** *üzleti szolgáltatás*.
- **IT service:** *informatikai szolgáltatás*; sometimes “informatics service.”
- **Customer channel:** *ügyfélcsatorna*.
- **Configuration item:** **CI** or *konfigurációs elem*.

I’d still keep an incident distinct from an alert, and a customer channel distinct from the business service delivered through it.

### Turn 76 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    aliases: [incidens]\n  Business Service:\n    aliases: [üzleti szolgáltatás]\n  IT Service:\n    aliases: [informatikai szolgáltatás, informatics service]\n  Customer Channel:\n    aliases: [ügyfélcsatorna]\n  Configuration Item:\n    aliases: [CI, konfigurációs elem]"
}
```

### Turn 76 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 76 — assistant

I recorded alternate names for **five classes**. I left *hibajegy* out for now because you described it as the **recorded incident ticket**, which may not mean every incident in the same way as *incidens*.

**In your usage, can *hibajegy* safely be treated as another name for the Incident record, or does it also refer to other kinds of ticket?**

### Turn 77 — user

In this operational model, **hibajegy** can be treated as another name for the **incident record**. The service desk may use that everyday word for the ticket it records. It should not make an alert, problem, or change into an incident; I’m not making a claim about every ticket type in other systems.

### Turn 77 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    aliases: [incidens, hibajegy]"
}
```

### Turn 77 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 77 — assistant

I added **hibajegy** as an Incident alias in this operational model. It does not make an Alert, Problem, or Change an Incident.

For the next group—**Application, Infrastructure Component, Third-Party Service, Environment, and Backup Set**—are there other names your team uses for the *same thing*? “None” is fine for any item.

### Turn 78 — user

Yes:

- **Application:** *alkalmazás*; “app” is common shorthand.
- **Infrastructure component:** *infrastruktúra-elem*.
- **Third-party service:** *külső szolgáltatás* or “outsourced service.”
- **Environment:** *környezet*.
- **Backup set:** *mentéskészlet*; people also say “backup” for it in this context.

I’d avoid treating “backup” as the same thing as a completed restore: the backup set is the recoverable data resource, while a restore is an action whose result must be verified.

### Turn 78 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Application:\n    aliases: [alkalmazás, app]\n  Infrastructure Component:\n    aliases: [infrastruktúra-elem]\n  Third-Party Service:\n    aliases: [külső szolgáltatás, outsourced service]\n  Environment:\n    aliases: [környezet]\n  Backup Set:\n    aliases: [mentéskészlet, backup]"
}
```

### Turn 78 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 78 — assistant

I recorded alternate names for **five classes**. In this model, “backup” names the Backup Set resource, not a completed restore.

For **Alert, Event, Monitoring Tool, Monitoring Rule, and Security Operations Centre**, what other names, if any, does your team use for the *same thing*?

### Turn 79 — user

- **Alert:** *riasztás*.
- **Event:** *esemény*.
- **Monitoring tool:** “monitoring platform” or *felügyeleti eszköz*.
- **Monitoring rule:** “alert rule” or *riasztási szabály*.
- **Security operations centre:** **SOC** or *biztonsági műveleti központ*.

A security event is a particular kind of event; I wouldn’t make “security event” an alias for every event.

### Turn 79 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    aliases: [riasztás]\n  Event:\n    aliases: [esemény]\n  Monitoring Tool:\n    aliases: [monitoring platform, felügyeleti eszköz]\n  Monitoring Rule:\n    aliases: [alert rule, riasztási szabály]\n  Security Operations Centre:\n    aliases: [SOC, biztonsági műveleti központ]"
}
```

### Turn 79 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 79 — assistant

I recorded alternate names for **five classes**. I did not make “security event” an alias for Event generally.

For **Service Owner, Resolver Group, On-Call Engineer, Incident Commander, and Incident Response Team**, what other names, if any, does your team use for the *same role or team*?

### Turn 80 — user

- **Service owner:** *szolgáltatásgazda*.
- **Resolver group:** “support group” or *megoldócsoport*.
- **On-call engineer:** “on-call” or *ügyeletes mérnök*.
- **Incident commander:** “incident manager,” “MIM lead,” or *incidensparancsnok*.
- **Incident response team:** **IRT** or *incidenskezelő csapat*.

“Incident manager” here means the person commanding a major incident, not the resolver group doing the technical repair.

### Turn 80 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Service Owner:\n    aliases: [szolgáltatásgazda]\n  Resolver Group:\n    aliases: [support group, megoldócsoport]\n  On-Call Engineer:\n    aliases: [on-call, ügyeletes mérnök]\n  Incident Commander:\n    aliases: [incident manager, MIM lead, incidensparancsnok]\n  Incident Response Team:\n    aliases: [IRT, incidenskezelő csapat]"
}
```

### Turn 80 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 80 — assistant

I recorded alternate names for **five roles or teams**. Here, “incident manager” names the Incident Commander, not the Resolver Group.

For **Service Desk, IT Operations Team, Network Operations Centre, Organisational Unit, and Regulator**, what other names, if any, mean the *same thing* in your setting?

### Turn 81 — user

- **Service desk:** “help desk,” *ügyfélszolgálati IT pult*, or *hibabejelentő*.
- **IT operations team:** *IT üzemeltetés* or *üzemeltetési csapat*.
- **Network operations centre:** **NOC** or *hálózatüzemeltetési központ*.
- **Organisational unit:** *szervezeti egység*.
- **Regulator:** “supervisory authority” or *felügyeleti hatóság*.

The service desk records and routes an incident; it isn’t interchangeable with the resolver group that restores it.

### Turn 81 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Service Desk:\n    aliases: [help desk, ügyfélszolgálati IT pult, hibabejelentő]\n  IT Operations Team:\n    aliases: [IT üzemeltetés, üzemeltetési csapat]\n  Network Operations Centre:\n    aliases: [NOC, hálózatüzemeltetési központ]\n  Organisational Unit:\n    aliases: [szervezeti egység]\n  Regulator:\n    aliases: [supervisory authority, felügyeleti hatóság]"
}
```

### Turn 81 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 81 — assistant

I recorded alternate names for **five classes**. Service Desk remains distinct from the Resolver Group that restores the incident.

For **Runbook, Workaround, Recovery Plan, Problem, and Known Error**, are there other names your team uses for each *same concept*? “None” is fine.

### Turn 82 — user

- **Runbook:** “playbook” or *üzemeltetési eljárás*.
- **Workaround:** *kerülőmegoldás*.
- **Recovery plan:** “DR plan” or *helyreállítási terv*.
- **Problem:** *probléma*.
- **Known error:** *ismert hiba*.

A workaround is a temporary way to reduce impact; a runbook is the maintained procedure that may document it. A known error is diagnosed, whereas a problem can still be under investigation.

### Turn 82 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Runbook:\n    aliases: [playbook, üzemeltetési eljárás]\n  Workaround:\n    aliases: [kerülőmegoldás]\n  Recovery Plan:\n    aliases: [DR plan, helyreállítási terv]\n  Problem:\n    aliases: [probléma]\n  Known Error:\n    aliases: [ismert hiba]"
}
```

### Turn 82 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 82 — assistant

I recorded alternate names for **five concepts**. Workaround, Runbook, Known Error, and Problem remain separate despite their related use.

For **Change, Release, Deployment, Materiality Assessment, and Regulatory Notification**, what other names, if any, mean the *same thing* in your setting? In particular, I won’t treat “release” and “deployment” as synonyms unless you say they are.

### Turn 83 — user

- **Change:** *változás* or *módosítás*.
- **Release:** *kiadás*.
- **Deployment:** *telepítés* or *élesítés*.
- **Materiality assessment:** “reportability assessment” or *lényegességi értékelés*.
- **Regulatory notification:** “supervisory notification” or *felügyeleti bejelentés*.

And no—**release and deployment are not synonyms**. The release is the governed package; deployment is the technical execution that delivers it. Likewise, a materiality assessment is a decision record, not the notification submitted to the regulator.

### Turn 83 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Change:\n    aliases: [változás, módosítás]\n  Release:\n    aliases: [kiadás]\n  Deployment:\n    aliases: [telepítés, élesítés]\n  Materiality Assessment:\n    aliases: [reportability assessment, lényegességi értékelés]\n  Regulatory Notification:\n    aliases: [supervisory notification, felügyeleti bejelentés]"
}
```

### Turn 83 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 83 — assistant

I recorded alternate names for **five classes**. Release remains distinct from Deployment, and Materiality Assessment from Regulatory Notification.

For the remaining five—**Evidence Item, Stakeholder, Communication, Post-Incident Review, and Corrective Action**—what alternate names, if any, mean the *same thing* in your setting? I already have “Evidence” as an alias for Evidence Item.

### Turn 84 — user

- **Evidence item:** “evidence” or *bizonyíték*.
- **Stakeholder:** *érintett*.
- **Communication:** *értesítés* or *tájékoztatás*.
- **Post-incident review:** **PIR**, “RCA review,” or *incidens utóelemzés*.
- **Corrective action:** “remediation action” or *helyesbítő intézkedés*.

“RCA review” is an everyday name for the review, not a reason to collapse the review into the separate problem or corrective-action records.

### Turn 84 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Evidence Item:\n    aliases: [Evidence, bizonyíték]\n  Stakeholder:\n    aliases: [érintett]\n  Communication:\n    aliases: [értesítés, tájékoztatás]\n  Post-Incident Review:\n    aliases: [PIR, RCA review, incidens utóelemzés]\n  Corrective Action:\n    aliases: [remediation action, helyesbítő intézkedés]"
}
```

### Turn 84 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 84 — assistant

I recorded the alternate names for those **five classes**. “RCA review” remains a name for the Post-Incident Review, not for a Problem or Corrective Action.

Now I’ll check names people use for **connections**. For these five, are there other verb phrases your team uses for the *same directed fact*? “None” is fine:

- Incident **impacts** IT Service
- Incident **impacts** Business Service
- Business Service **depends on** IT Service
- Business Service **is delivered through** Customer Channel
- IT Service **runs on** Infrastructure Component

### Turn 85 — user

No alternate verb phrases I’d record for those five. The stated verbs and directions are the ones I’d use. In particular, **“is delivered through”** identifies a channel for investigation; it does not establish that the incident disrupted it.

### Turn 85 — assistant

No aliases were added for those five connections. Their stated verbs and directions stand, including the limit on what *delivered through* proves.

For the next dependency-path group, does your team use any other verb phrase for the **same directed fact**? “None” is fine for each:

- IT Service **depends on** Third-Party Service
- IT Service **is implemented by** Application
- Application **runs on** Infrastructure Component
- Incident **affects** Configuration Item
- Configuration Item **belongs to** Environment

### Turn 86 — user

None I’d record as separate aliases. Those verb phrases and directions work.

Keep **“incident affects a configuration item”** as an established impact, not a deduction from the IT service’s dependency path. And **“belongs to an environment”** locates the item’s deployment context; it doesn’t approve that environment as a recovery target.

### Turn 86 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 86 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: What is the current health of each affected business service and supporting IT service?
  - id: cq3
    text: Which customer channels deliver the affected business services?
  - id: cq4
    text: "Which infrastructure and third-party services are on an affected IT service's dependency path?"
  - id: cq5
    text: Which configuration items are relevant along that dependency path?
  - id: cq6
    text: Which alerts and events are linked to an incident through its triggering alert or correlated events?
  - id: cq7
    text: Who owns an affected IT service?
  - id: cq8
    text: Which resolver group and on-call engineer should take an incident?
  - id: cq9
    text: "Does an incident meet the bank's criteria for a major-incident declaration?"
  - id: cq10
    text: Who should command the response to a major incident?
  - id: cq11
    text: "Which runbook, workaround, backup set, or recovery plan is applicable to an incident?"
  - id: cq12
    text: "Are the conditions for using a proposed runbook, workaround, backup set, or recovery plan safely met for this incident?"
  - id: cq13
    text: "Could a recent change or deployment have caused an incident, based on its classification and evidence?"
  - id: cq14
    text: "Has the incident's materiality been assessed, and what rationale was recorded?"
  - id: cq15
    text: "Is a regulatory notification required for the incident under the approved procedure and designated reporting function's conclusion?"
  - id: cq16
    text: When is any required regulatory notification due under the applicable reporting requirement?
  - id: cq17
    text: "What evidence supports an incident's impact, classification, decisions, and recovery, and is its integrity preserved?"
  - id: cq18
    text: "Which stakeholders need an incident update, and what has actually been communicated against the latest verified incident state?"
  - id: cq19
    text: "Is an incident ready to close, including restored service health or an accepted residual condition, restoration evidence, required communications, and any applicable post-incident review?"
  - id: cq20
    text: "Which corrective actions from post-incident reviews remain outstanding for the affected service, including actions from prior incidents?"
classes:
  Incident:
    meaning: A recorded disruption or security condition that may impact an IT service or business service.
    aliases:
      - incidens
      - hibajegy
    properties:
      status:
        type: text
      severity:
        type: text
      detectedTime:
        type: date
      majorIncidentFlag:
        type: boolean
      declarationTime:
        type: date
      category:
        type: text
      resolvedTime:
        type: date
      closedTime:
        type: date
  Business Service:
    meaning: A capability the bank delivers to its users.
    aliases:
      - üzleti szolgáltatás
    properties:
      healthState:
        type: text
  IT Service:
    meaning: A service supporting bank capabilities whose operational health is tracked.
    aliases:
      - informatikai szolgáltatás
      - informatics service
    properties:
      healthState:
        type: text
  Customer Channel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  Configuration Item:
    meaning: A component recorded in configuration-management scope.
    aliases:
      - CI
      - konfigurációs elem
    properties:
      criticalityTier:
        type: text
  Third-Party Service:
    meaning: A service provided by an external party that an IT service can depend on.
    aliases:
      - külső szolgáltatás
      - outsourced service
    properties: {}
  Alert:
    meaning: A monitoring signal that may trigger an incident.
    aliases:
      - riasztás
    properties:
      status:
        type: text
      acknowledgementTime:
        type: date
      detectionSource:
        type: text
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases:
      - esemény
    properties:
      observedTime:
        type: date
      detectionSource:
        type: text
  Infrastructure Component:
    meaning: "A component on which an IT service runs, whether or not it is recorded as a configuration item."
    aliases:
      - infrastruktúra-elem
    properties: {}
  Service Owner:
    meaning: The party accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  Resolver Group:
    meaning: A group assigned to diagnose and restore an incident.
    aliases:
      - support group
      - megoldócsoport
    properties: {}
  On-Call Engineer:
    meaning: A member of a resolver group who may perform time-critical technical work on an incident.
    aliases:
      - on-call
      - ügyeletes mérnök
    properties: {}
  Incident Commander:
    meaning: The person who commands a major incident and directs its coordination and decision cadence.
    aliases:
      - incident manager
      - MIM lead
      - incidensparancsnok
    properties: {}
  Service Desk:
    meaning: The team that records incidents arising from user-reported issues and triages and routes them before assignment.
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  IT Operations Team:
    meaning: The team operating IT services during day-to-day operations and response without automatic authority for every response action.
    aliases:
      - IT üzemeltetés
      - üzemeltetési csapat
    properties: {}
  Network Operations Centre:
    meaning: The team operating monitoring for network and infrastructure signals.
    aliases:
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  Security Operations Centre:
    meaning: "The team monitoring security events relevant to assessing an incident's security dimension."
    aliases:
      - SOC
      - biztonsági műveleti központ
    properties: {}
  Incident Response Team:
    meaning: The team coordinating a major incident under the incident command structure.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  Runbook:
    meaning: A guide for responding to an incident.
    aliases:
      - playbook
      - üzemeltetési eljárás
    properties: {}
  Workaround:
    meaning: A temporary measure that reduces incident impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  Backup Set:
    meaning: A set of backup data protecting particular configuration items that may be used in restoration.
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
  Recovery Plan:
    meaning: A plan for restoring an IT service that may use a backup set.
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
  Environment:
    meaning: An operating environment that may serve as an approved target for failover or restoration.
    aliases:
      - környezet
    properties:
      environmentType:
        type: text
  Change:
    meaning: A controlled modification that may be executed through a deployment or an accelerated emergency path.
    aliases:
      - változás
      - módosítás
    properties:
      status:
        type: text
      riskLevel:
        type: text
      implementationPlan:
        type: text
      backoutPlan:
        type: text
  Deployment:
    meaning: The technical execution that installs or activates a change.
    aliases:
      - telepítés
      - élesítés
    properties:
      startTime:
        type: date
      completionTime:
        type: date
      status:
        type: text
  Evidence Item:
    meaning: A particular preserved record or artifact whose integrity can be checked and whose support for an incident can be traced.
    aliases:
      - Evidence
      - bizonyíték
    properties:
      collectedTime:
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
  Materiality Assessment:
    meaning: "A recorded assessment of an incident's reporting conclusion, rationale, and applicable reporting due time determined under the approved procedure."
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      result:
        type: text
      rationale:
        type: text
      reportingDueTime:
        type: date
  Regulatory Notification:
    meaning: "A formal submission about an incident to the regulator, distinct from the assessment that may require it."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      status:
        type: text
      dueTime:
        type: date
      submissionTime:
        type: date
  Stakeholder:
    meaning: "A person, group, or organisation with an interest in an incident's outcome who may need communication."
    aliases:
      - érintett
    properties: {}
  Communication:
    meaning: "A message about an incident addressed to a stakeholder or audience and tracked through drafting, approval, and sending."
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
      sentTime:
        type: date
  Post-Incident Review:
    meaning: "A review of an incident, its response, causes and lessons that can produce corrective actions."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOnDate:
        type: date
      findings:
        type: text
  Corrective Action:
    meaning: "A tracked follow-up from a post-incident review with its own owner, status and due date."
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
      status:
        type: text
      dueDate:
        type: date
  Monitoring Tool:
    meaning: A tool operated by the network operations centre that monitors IT services and configuration items and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  Monitoring Rule:
    meaning: A rule executed by a monitoring tool that evaluates telemetry and may generate an alert.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Regulator:
    meaning: The authority to which a regulatory notification about an incident is submitted.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  Application:
    meaning: A software system implementing an IT service that may run on infrastructure components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Problem:
    meaning: "The underlying or potential cause of one or more incidents, which may not yet be diagnosed."
    aliases:
      - probléma
    properties: {}
  Known Error:
    meaning: Documentation of a diagnosed problem with a known cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  Release:
    meaning: "A governed package of approved changes introduced together, separate from the technical execution that delivers it."
    aliases:
      - kiadás
    properties: {}
  Organisational Unit:
    meaning: A unit accountable for following up a corrective action.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: IT Service
    meaning: The incident has a confirmed impact on this IT service.
    aliases: []
  - name: impacts
    from: Incident
    to: Business Service
    meaning: The incident has a confirmed impact on this business service.
    aliases: []
  - name: dependsOn
    from: Business Service
    to: IT Service
    meaning: The business service depends on this supporting IT service.
    aliases: []
  - name: deliveredThrough
    from: Business Service
    to: Customer Channel
    meaning: The business service is delivered through this customer channel without implying the channel is disrupted.
    aliases: []
  - name: runsOn
    from: IT Service
    to: Infrastructure Component
    meaning: The IT service runs on this infrastructure component as a documented technical dependency.
    aliases: []
  - name: dependsOn
    from: IT Service
    to: Third-Party Service
    meaning: The IT service depends on this third-party service.
    aliases: []
  - name: affects
    from: Incident
    to: Configuration Item
    meaning: The incident has an established effect on this configuration item.
    aliases: []
  - name: implementedBy
    from: IT Service
    to: Application
    meaning: The IT service is implemented by this application.
    aliases:
      - is implemented by
  - name: runsOn
    from: Application
    to: Infrastructure Component
    meaning: The application runs on this infrastructure component.
    aliases: []
  - name: executedBy
    from: Monitoring Rule
    to: Monitoring Tool
    meaning: The monitoring tool executes this rule to evaluate telemetry.
    aliases:
      - executes
  - name: generatedBy
    from: Alert
    to: Monitoring Rule
    meaning: This alert was generated by the rule when it has a monitoring-rule origin.
    aliases:
      - generates
  - name: triggeredBy
    from: Incident
    to: Alert
    meaning: "This incident was opened as a result of this alert, when that link is established."
    aliases:
      - triggers
  - name: correlatedFrom
    from: Incident
    to: Event
    meaning: This event has been established as correlated with the incident rather than merely concurrent.
    aliases:
      - is correlated with
  - name: operates
    from: Network Operations Centre
    to: Monitoring Tool
    meaning: The network operations centre operates this monitoring tool.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: IT Service
    meaning: The monitoring tool monitors this IT service.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: Configuration Item
    meaning: The monitoring tool monitors this configuration item.
    aliases: []
  - name: records
    from: Service Desk
    to: Incident
    meaning: The service desk records this incident arising from a user-reported issue.
    aliases: []
  - name: operates
    from: IT Operations Team
    to: IT Service
    meaning: The IT operations team operates this IT service.
    aliases: []
  - name: monitors
    from: Security Operations Centre
    to: Event
    meaning: "The centre actually monitors this event, which has been identified as a security event; this does not apply to all events."
    aliases:
      - monitors security event
  - name: owns
    from: Service Owner
    to: IT Service
    meaning: The service owner is accountable for this IT service across its lifecycle.
    aliases:
      - owned by
  - name: assignedTo
    from: Incident
    to: Resolver Group
    meaning: The incident has been assigned to this resolver group for diagnosis and restoration.
    aliases: []
  - name: memberOf
    from: On-Call Engineer
    to: Resolver Group
    meaning: The on-call engineer is a member of this resolver group.
    aliases:
      - belongs to
  - name: handledBy
    from: Incident
    to: On-Call Engineer
    meaning: This on-call engineer directly handles time-critical technical work on the incident.
    aliases: []
  - name: coordinatedBy
    from: Incident
    to: Incident Commander
    meaning: The declared major incident is coordinated by its assigned incident commander.
    aliases:
      - commands major-incident response
  - name: coordinates
    from: Incident Response Team
    to: Incident
    meaning: "The incident response team coordinates this declared major incident, not every incident."
    aliases: []
  - name: memberOf
    from: Incident Commander
    to: Incident Response Team
    meaning: The incident commander is a member of the incident response team.
    aliases: []
  - name: handledWith
    from: Incident
    to: Runbook
    meaning: The runbook selected to guide response to this incident; selection does not establish safe execution.
    aliases: []
  - name: recoveredWith
    from: Incident
    to: Recovery Plan
    meaning: "The recovery plan selected for this incident, subject to checking its applicability and safety."
    aliases: []
  - name: recovers
    from: Recovery Plan
    to: IT Service
    meaning: The IT service that this recovery plan describes restoring.
    aliases: []
  - name: protects
    from: Backup Set
    to: Configuration Item
    meaning: The configuration item protected by this backup set.
    aliases: []
  - name: uses
    from: Recovery Plan
    to: Backup Set
    meaning: The backup set that this recovery plan may use in restoration.
    aliases: []
  - name: linkedTo
    from: Incident
    to: Problem
    meaning: The incident is linked to this underlying or potential problem.
    aliases: []
  - name: documentedBy
    from: Problem
    to: Known Error
    meaning: The problem has been diagnosed and documented by this known error.
    aliases: []
  - name: has
    from: Known Error
    to: Workaround
    meaning: The known error has this documented workaround.
    aliases: []
  - name: documentedIn
    from: Workaround
    to: Runbook
    meaning: The workaround is documented in this runbook; documentation does not establish safety for a particular incident.
    aliases: []
  - name: deployedIn
    from: IT Service
    to: Environment
    meaning: The IT service is deployed in this environment; this does not designate an approved failover target.
    aliases: []
  - name: belongsTo
    from: Configuration Item
    to: Environment
    meaning: The configuration item belongs to this environment; this does not designate an approved restore target.
    aliases: []
  - name: affects
    from: Change
    to: IT Service
    meaning: The change affects this IT service; this does not establish that it caused an incident.
    aliases: []
  - name: modifies
    from: Change
    to: Configuration Item
    meaning: The change modifies this configuration item; this does not establish incident causation.
    aliases: []
  - name: targets
    from: Deployment
    to: Environment
    meaning: The deployment targets this environment.
    aliases: []
  - name: deploys
    from: Deployment
    to: Application
    meaning: The deployment installs or activates this application.
    aliases: []
  - name: resolvedBy
    from: Incident
    to: Change
    meaning: "The incident was resolved by this change, not necessarily caused by it."
    aliases: []
  - name: implementedBy
    from: Change
    to: Release
    meaning: The change is included for implementation in this governed release; this does not prove a deployment succeeded.
    aliases: []
  - name: deliveredBy
    from: Release
    to: Deployment
    meaning: "The release is delivered by this deployment, whose execution must be checked separately."
    aliases: []
  - name: supportedBy
    from: Incident
    to: Evidence Item
    meaning: "This evidence item documents the incident and may substantiate a particular impact, classification, decision or recovery claim after checking its integrity."
    aliases:
      - documents
  - name: includes
    from: Regulatory Notification
    to: Evidence Item
    meaning: This evidence item is included in the regulatory submission; inclusion alone does not verify integrity or completeness.
    aliases: []
  - name: evaluatedBy
    from: Incident
    to: Materiality Assessment
    meaning: "The incident is evaluated by this assessment recording its reporting conclusion, rationale and applicable due time."
    aliases: []
  - name: triggers
    from: Materiality Assessment
    to: Regulatory Notification
    meaning: "The assessment's reporting conclusion calls for this notification without asserting its approval or submission."
    aliases: []
  - name: reports
    from: Regulatory Notification
    to: Incident
    meaning: The regulatory notification reports this incident.
    aliases: []
  - name: sentTo
    from: Regulatory Notification
    to: Regulator
    meaning: The regulatory notification is addressed to this regulator; the link does not itself mean submission occurred.
    aliases: []
  - name: notifies
    from: Incident
    to: Stakeholder
    meaning: The stakeholder is identified to receive notification about this incident; this link does not mean a message was delivered.
    aliases: []
  - name: communicatedThrough
    from: Incident
    to: Communication
    meaning: "The communication is about this incident and records a message used for its communication, whether drafted, approved or sent."
    aliases:
      - is about
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: The communication is addressed to this stakeholder; delivery must be checked separately.
    aliases: []
  - name: reviewedIn
    from: Incident
    to: Post-Incident Review
    meaning: "The incident is reviewed in this post-incident review, which may be scheduled or completed."
    aliases: []
  - name: produces
    from: Post-Incident Review
    to: Corrective Action
    meaning: The post-incident review produces this tracked corrective action.
    aliases: []
  - name: ownedBy
    from: Corrective Action
    to: Organisational Unit
    meaning: The organisational unit accountable for following up this corrective action; ownership does not prove completion or verification.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 86 — assistant

No aliases were added for that second connection batch. I checked the live canvas: **every class and relationship has a meaning sentence**, and the class aliases you confirmed are recorded. Since two connection batches produced no further aliases, I’ll stop soliciting them.

The terminology pass preserves the distinctions you flagged: an Incident affecting a Configuration Item is an established impact, and an item belonging to an Environment does not approve it as a recovery target.

**Is this terminology pass accurate before we define fixed choices and what happens when decision-relevant values are missing or wrong?**

### Turn 87 — user

Yes, the terminology pass is accurate. The names and meanings preserve the operational distinctions, and I wouldn’t add connection aliases just for their own sake. We can move on to controlled choices and the checks that apply when a decision-relevant value is missing or invalid.

### Turn 87 — assistant

We’ll start with the small-choice values that drive incident response and recovery. Please give the **complete allowed list** for each, or say “not fixed here” if the bank does not use a controlled list:

1. Incident **status**
2. Incident **severity**
3. Incident **category** (you’ve confirmed *cybersecurity* is one value)
4. Business Service **health state**
5. IT Service **health state**
6. Alert **status** (including *new* and *acknowledged*)
7. Backup Set **status** (including *successful* and *verified*)
8. Change **status**
9. Deployment **status**

I’ll ask separately what breaks when each value is missing or wrong.

### Turn 88 — user

These are the complete allowed choices for the values you listed:

| Value | Allowed choices |
|---|---|
| **Incident status** | new; acknowledged; investigating; contained; recovering; monitoring; resolved; closed; cancelled |
| **Incident severity** | sev1-critical; sev2-high; sev3-medium; sev4-low |
| **Incident category** | availability; performance; capacity; network; application; database; infrastructure; data-integrity; cybersecurity; third-party; change-induced; other |
| **Business service health state** | healthy; degraded; partially-unavailable; unavailable; recovering; unknown |
| **IT service health state** | healthy; degraded; partially-unavailable; unavailable; recovering; unknown |
| **Alert status** | new; acknowledged; suppressed; escalated; closed |
| **Backup set status** | scheduled; running; successful; failed; expired; corrupted; verified |
| **Change status** | draft; assessed; approved; scheduled; implementing; implemented; failed; rolled-back; closed; cancelled |
| **Deployment status** | planned; running; succeeded; failed; rolled-back; cancelled |

These lists define valid recorded values; they don’t mean every record must have every value at every stage, or that a valid value alone permits an action.

### Turn 88 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      status: {type: text, allowed: [new, acknowledged, investigating, contained, recovering, monitoring, resolved, closed, cancelled]}\n      severity: {type: text, allowed: [sev1-critical, sev2-high, sev3-medium, sev4-low]}\n      category: {type: text, allowed: [availability, performance, capacity, network, application, database, infrastructure, data-integrity, cybersecurity, third-party, change-induced, other]}\n  Business Service:\n    properties:\n      healthState: {type: text, allowed: [healthy, degraded, partially-unavailable, unavailable, recovering, unknown]}\n  IT Service:\n    properties:\n      healthState: {type: text, allowed: [healthy, degraded, partially-unavailable, unavailable, recovering, unknown]}\n  Alert:\n    properties:\n      status: {type: text, allowed: [new, acknowledged, suppressed, escalated, closed]}\n  Backup Set:\n    properties:\n      status: {type: text, allowed: [scheduled, running, successful, failed, expired, corrupted, verified]}\n  Change:\n    properties:\n      status: {type: text, allowed: [draft, assessed, approved, scheduled, implementing, implemented, failed, rolled-back, closed, cancelled]}\n  Deployment:\n    properties:\n      status: {type: text, allowed: [planned, running, succeeded, failed, rolled-back, cancelled]}"
}
```

### Turn 88 — tool

Applied. Added 0, updated 7 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 88 — assistant

I recorded the nine allowed-value lists you supplied. They define valid recorded values; none, by itself, authorizes an action.

For the remaining values that may have small controlled lists, please give the **complete allowed choices**, or say “not fixed here” for each:

1. Configuration Item **criticality tier**
2. Environment **type**
3. Change **risk level**
4. Materiality Assessment **result**
5. Regulatory Notification **status**
6. Communication **status**
7. Corrective Action **status**
8. Alert **detection source**
9. Event **detection source**

### Turn 89 — user

| Value | Complete allowed choices |
|---|---|
| **Configuration item criticality tier** | tier-1-critical; tier-2-important; tier-3-standard; tier-4-supporting |
| **Environment type** | production; disaster-recovery; pre-production; test; development; management |
| **Change risk level** | low; medium; high; critical |
| **Materiality assessment result** | not-reportable; potentially-reportable; reportable; undetermined |
| **Regulatory notification status** | draft; pending-approval; approved; submitted; accepted; rejected; withdrawn |
| **Communication status** | draft; pending-approval; approved; submitted; accepted; rejected; withdrawn |
| **Corrective action status** | open; in-progress; blocked; implemented; verified; closed; cancelled |
| **Alert detection source** | monitoring; siem; service-desk; user-report; vendor-report; automated-control; regulator; other |
| **Event detection source** | monitoring; siem; service-desk; user-report; vendor-report; automated-control; regulator; other |

As before, a valid choice records a state or category; it doesn’t stand in for verifying the conditions of a particular action.

### Turn 89 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Configuration Item:\n    properties:\n      criticalityTier: {type: text, allowed: [tier-1-critical, tier-2-important, tier-3-standard, tier-4-supporting]}\n  Environment:\n    properties:\n      environmentType: {type: text, allowed: [production, disaster-recovery, pre-production, test, development, management]}\n  Change:\n    properties:\n      riskLevel: {type: text, allowed: [low, medium, high, critical]}\n  Materiality Assessment:\n    properties:\n      result: {type: text, allowed: [not-reportable, potentially-reportable, reportable, undetermined]}\n  Regulatory Notification:\n    properties:\n      status: {type: text, allowed: [draft, pending-approval, approved, submitted, accepted, rejected, withdrawn]}\n  Communication:\n    properties:\n      status: {type: text, allowed: [draft, pending-approval, approved, submitted, accepted, rejected, withdrawn]}\n  Corrective Action:\n    properties:\n      status: {type: text, allowed: [open, in-progress, blocked, implemented, verified, closed, cancelled]}\n  Alert:\n    properties:\n      detectionSource: {type: text, allowed: [monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other]}\n  Event:\n    properties:\n      detectionSource: {type: text, allowed: [monitoring, siem, service-desk, user-report, vendor-report, automated-control, regulator, other]}"
}
```

### Turn 89 — tool

Applied. Added 0, updated 9 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 89 — assistant

I recorded the nine additional allowed-value lists. The remaining checks are about when a missing or wrong value must change the agent’s decision; a valid choice alone is not permission to act.

For these **five Incident values**, what would break if each were missing or wrong? A short consequence for **each** is enough:

1. **Status**
2. **Severity**
3. **Category**
4. **Major-incident flag**
5. **Declaration time**

### Turn 90 — user

The consequence depends on the decision being made; I wouldn’t require all five values on every incident at every stage.

1. **Status:** If missing or wrong, we cannot reliably check whether an action’s permitted incident state is met—for example, whether it can be declared major, contained, assigned, or closed.
2. **Severity:** Without a reliable value, we cannot verify the severity condition for major-incident declaration. Severity alone does not trigger declaration.
3. **Category:** A wrong category could send a cybersecurity incident down the wrong response path. If it is unclear, check the incident details and linked security evidence before applying that path.
4. **Major-incident flag:** If it is set from criteria alone, we would falsely treat an undeclared incident as declared. After declaration, it must be confirmed alongside the commander and communication record.
5. **Declaration time:** If absent or wrong after declaration, we cannot verify when the major-incident workflow began. It is a declaration record to check, not a prerequisite that must exist before declaring.

### Turn 90 — assistant

I’ve captured the consequence for each of those five Incident values. They are **decision-specific checks**, not fields that must all be present at every stage. In particular, declaration time is verified *after* declaration, and severity or criteria alone must not set the major-incident flag.

For the next five values, what breaks if each is missing or wrong?

1. Incident **detected time**
2. Incident **resolved time**
3. Incident **closed time**
4. Business Service **health state**
5. IT Service **health state**

### Turn 91 — user

Again, these matter at particular boundaries, not necessarily from the moment a record opens:

1. **Detected time:** We lose a reliable point for comparing the incident with a deployment’s execution window. That weakens the investigation; even a correct time would not prove causation.
2. **Resolved time:** We cannot reliably tell when resolution was recorded or assess restoration timing. Its absence early in an incident is normal.
3. **Closed time:** We cannot verify when closure was recorded after the close action. It should not be expected while the incident is still open.
4. **Business service health state:** We cannot reliably describe current business-service impact or confirm its condition for closure.
5. **IT service health state:** We cannot reliably describe the supporting service’s condition or verify recovery, failover results, and closure readiness.

A recorded *healthy* state should still be checked against current evidence when making a recovery or closure decision.

### Turn 91 — assistant

I’ve captured the consequences for those five values. Detected time supports investigation, while resolved and closed times are checked at their respective milestones. Each service’s health state matters to impact and closure, but “healthy” still needs current evidence.

For **Alert.status**, **Alert.acknowledgementTime**, **Alert.detectionSource**, **Event.observedTime**, and **Event.detectionSource**: what breaks if each is missing or wrong? A brief answer for each is enough; they need not all be present at every stage.

### Turn 92 — user

These have different consequences at different points in the response:

1. **Alert status:** We cannot confirm that the alert is *new* before acknowledging it, or *acknowledged* afterward. That blocks a reliable acknowledgement check.
2. **Alert acknowledgement time:** After acknowledgement, we cannot verify when it occurred. It is an action record, not something expected before acknowledgement.
3. **Alert detection source:** We lose the recorded route by which the alert entered response. It does not identify a particular tool or rule.
4. **Event observed time:** We lose a reliable event time for investigation and correlation. A time match alone would still not establish a link to the incident.
5. **Event detection source:** We cannot reliably say how the event was detected. The source does not, by itself, prove that the event is relevant to the incident.

### Turn 92 — assistant

I’ve captured those five consequences. Alert status and acknowledgement time support the acknowledgement boundary; detection sources and event time support tracing and investigation, but do not establish incident relevance.

For these five recovery values, what breaks if each is missing or wrong?

1. Backup Set **status**
2. Backup Set **last successful backup**
3. Backup Set **last verification**
4. Environment **type**
5. Configuration Item **criticality tier**

### Turn 93 — user

1. **Backup set status:** We cannot establish the restore precondition that the backup is *successful* or *verified*. An unknown or unusable status blocks the restore action.
2. **Last successful backup:** We cannot reliably assess the age of the available recovery data or the proposed restore point. Its absence calls for verification; the date alone does not approve a restore.
3. **Last verification:** We cannot tell when the backup was last checked, so confidence in using it is weaker. The restore still needs its own integrity and functionality checks.
4. **Environment type:** We cannot reliably distinguish the intended deployment context—for example, a disaster-recovery environment from production. The type does not establish that a proposed target is available or approved.
5. **Configuration item criticality tier:** The isolation impact assessment loses an important risk input. Missing tier does not automatically forbid isolation, but we must still establish the actual impact and a rollback or reconnection method.

### Turn 93 — assistant

I’ve captured the consequence for each: an unusable or unknown Backup Set status blocks restoration; the dates, Environment type, and Configuration Item tier inform checks but do not themselves approve an action.

For these **Recovery Plan and Deployment** values, what breaks if each is missing or wrong?

1. Recovery Plan **recovery time objective**
2. Recovery Plan **recovery point objective**
3. Recovery Plan **last review date**
4. Deployment **start time**
5. Deployment **completion time**

### Turn 94 — user

1. **Recovery time objective:** We cannot compare a proposed recovery against the plan’s time objective. Its numeric value needs the unit from approved recovery documentation; I wouldn’t invent one.
2. **Recovery point objective:** We cannot assess the expected data-loss tolerance against the proposed recovery point. Again, the unit must come from approved documentation; the objective alone does not make a point acceptable.
3. **Last review date:** We cannot judge how recently the plan was reviewed. That weakens confidence in its currency, but is not, by itself, a stated failover blocker.
4. **Deployment start time:** We cannot establish when deployment execution began for comparison with incident detection.
5. **Deployment completion time:** We cannot establish when execution ended or reliably compare the whole deployment window with the incident. Neither timestamp alone proves the deployment caused it.

### Turn 94 — assistant

I’ve captured those consequences. The recovery objectives need units from approved documentation before comparison; plan currency and deployment timing inform decisions but do not alone block failover or prove causation.

For the **change and deployment** values, what breaks if each is missing or wrong?

1. Deployment **status**
2. Change **status**
3. Change **risk level**
4. Change **implementation plan**
5. Change **backout plan**

### Turn 95 — user

1. **Deployment status:** We cannot tell whether execution was planned, running, succeeded, failed, rolled back, or cancelled. We must not treat a deployment link as proof that it succeeded.
2. **Change status:** We cannot reliably tell where the change is in its lifecycle or verify its state after emergency execution. Status alone does not establish that it resolved the incident.
3. **Risk level:** We lose the recorded risk assessment for deciding how to handle the change. Even a valid risk level is **not** explicit risk acceptance.
4. **Implementation plan:** If absent, the emergency change fails a stated execution precondition; we should not execute it.
5. **Backout plan:** If absent, the emergency change likewise fails a stated execution precondition; we should not execute it.

### Turn 95 — assistant

I’ve captured all five consequences. Deployment and Change status must be checked rather than inferred from their links. For an emergency change, **both plans are execution prerequisites**, and a risk level does not replace explicit risk acceptance.

For these **Evidence Item and Materiality Assessment** values, what breaks if each is missing or wrong?

1. Evidence Item **collected time**
2. Evidence Item **integrity status**
3. Evidence Item **cryptographic hash**
4. Materiality Assessment **result**
5. Materiality Assessment **rationale**

### Turn 96 — user

1. **Evidence item collected time:** We lose a reliable record of when the artifact was preserved, weakening the incident timeline and accountability.
2. **Integrity status:** We cannot reliably tell whether the item is merely collected, verified, sealed, or compromised. That weakens reliance on it for incident decisions or a notification; verify integrity before using it.
3. **Cryptographic hash:** We lose one means of checking that the particular artifact has not changed. I would not claim every evidence item must have a hash; its absence calls for an appropriate integrity check, not an automatic conclusion that the item is invalid.
4. **Materiality assessment result:** We cannot determine from the assessment whether reporting is required. In particular, we must not submit a notification unless the recorded result is **reportable**.
5. **Materiality assessment rationale:** We lose the documented basis for the conclusion, making the decision difficult to explain or audit. A result value alone does not supply that reasoning.

### Turn 96 — assistant

I’ve captured those five consequences. Evidence integrity must be verified for the particular item; a missing hash calls for another appropriate check, not automatic rejection. A notification cannot be submitted unless the assessment result is **reportable**, with its rationale retained.

For the remaining **reporting values**, what breaks if each is missing or wrong?

1. Materiality Assessment **reporting due time**
2. Regulatory Notification **status**
3. Regulatory Notification **due time**
4. Regulatory Notification **submission time**

### Turn 97 — user

1. **Assessment reporting due time:** We cannot reliably answer when reporting is due from the documented assessment. The deadline must come from the approved reporting process, not from an assumption.
2. **Notification status:** We cannot verify that it is **approved** before submission, or distinguish submission from later acceptance or rejection. Without confirmed approval, do not submit.
3. **Notification due time:** We cannot verify the submission will occur before the applicable deadline. If it is missing or unreliable, resolve it through the reporting process before submitting.
4. **Notification submission time:** After submission, we cannot verify when it was sent or compare the actual submission with the deadline. Its absence before submission is normal; retain the submission receipt as well.

### Turn 97 — assistant

I’ve captured those four reporting boundaries. The approved process supplies the deadline; notification status must show approval before submission; and submission time and receipt are verified afterward. “Submitted” remains distinct from “accepted.”

For the **Communication** values, what breaks if each is missing or wrong?

1. **Audience**
2. **Message summary**
3. **Status**
4. **Sent time**

### Turn 98 — user

1. **Audience:** We cannot verify who the message is intended for, so the send precondition is unmet. The addressed-to stakeholder link should also agree with that audience.
2. **Message summary:** We cannot check what is being communicated against the latest verified incident state. The message must be recorded before sending.
3. **Status:** We cannot establish the approval state required before sending or distinguish a draft from a message that has progressed through the workflow. A recorded state alone still does not prove delivery.
4. **Sent time:** After sending, we cannot verify when it went out. Its absence is normal while the communication is still a draft; afterward, confirm delivery and archive the final message.

### Turn 98 — assistant

I’ve captured those four consequences. Audience and message must be established before sending, status must support the approval check, and sent time is verified afterward. Delivery and archiving still need their own checks.

For the **review and corrective-action** values, what breaks if each is missing or wrong?

1. Post-Incident Review **held-on date**
2. Post-Incident Review **findings**
3. Corrective Action **status**
4. Corrective Action **due date**

### Turn 99 — user

1. **Review held-on date:** We cannot use the record to confirm that the review took place. A review scheduled for the future may still satisfy the closure condition, but its scheduling must be verified separately.
2. **Review findings:** We lose the documented conclusions and lessons needed to explain the review and follow-up work. Findings are not a prerequisite to scheduling a review.
3. **Corrective action status:** We cannot reliably tell whether an earlier action remains outstanding or has progressed to implementation, verification, or closure.
4. **Corrective action due date:** We cannot tell when follow-up is expected or assess whether it is late. A missing due date does not, by itself, make the incident unclosable.

### Turn 99 — assistant

That completes the fixed-choice and missing-value pass. I’ve captured the consequence for each recorded property at the decision where it matters, without treating every value as required from the moment a record opens. In particular, a scheduled review needs separate verification; a held-on date confirms a review occurred, and outstanding corrective actions do not by themselves block incident closure.

**Is that an accurate recap before we define the named decision rules for declaration, assignment, recovery, reporting, communication, and closure?**

### Turn 100 — user

Yes, that’s accurate. Keep each check at its decision boundary: a missing value may block one action, weaken an investigation, or simply be normal at that stage. We can define the action rules without turning all recorded properties into universal mandatory fields.

### Turn 100 — assistant

We’ll define rules at the point of each decision, rather than make properties universally mandatory.

First, for **declaring a major incident**: what are the bank’s actual criteria for deciding that an Incident qualifies, and which checks must pass **before** declaration? Please distinguish eligibility from the declaration action, which then sets the major-incident flag and time and assigns the Incident Commander. If the criteria live in an approved procedure you cannot specify here, say so; I’ll leave that part open rather than invent thresholds.

### Turn 101 — user

The bank’s broader **business-impact criteria** come from its approved major-incident procedure; I wouldn’t invent a numerical threshold for them. For the declaration action itself, we check that:

- the incident is not **resolved, closed, or cancelled**;
- its severity is **sev1-critical** or **sev2-high**;
- at least one impacted **IT service** is identified; and
- an **incident commander has been assigned**.

Passing those checks makes declaration possible; it does not declare the incident automatically. Declaration then sets the major-incident classification, records the declaration time, and starts the coordination and communication cadence. We verify the classification, commander, time, and communication record afterward. The commander must therefore be assigned **before** the declaration action, even though the assignment is verified as part of its result.

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
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: What is the current health of each affected business service and supporting IT service?
  - id: cq3
    text: Which customer channels deliver the affected business services?
  - id: cq4
    text: "Which infrastructure and third-party services are on an affected IT service's dependency path?"
  - id: cq5
    text: Which configuration items are relevant along that dependency path?
  - id: cq6
    text: Which alerts and events are linked to an incident through its triggering alert or correlated events?
  - id: cq7
    text: Who owns an affected IT service?
  - id: cq8
    text: Which resolver group and on-call engineer should take an incident?
  - id: cq9
    text: "Does an incident meet the bank's criteria for a major-incident declaration?"
  - id: cq10
    text: Who should command the response to a major incident?
  - id: cq11
    text: "Which runbook, workaround, backup set, or recovery plan is applicable to an incident?"
  - id: cq12
    text: "Are the conditions for using a proposed runbook, workaround, backup set, or recovery plan safely met for this incident?"
  - id: cq13
    text: "Could a recent change or deployment have caused an incident, based on its classification and evidence?"
  - id: cq14
    text: "Has the incident's materiality been assessed, and what rationale was recorded?"
  - id: cq15
    text: "Is a regulatory notification required for the incident under the approved procedure and designated reporting function's conclusion?"
  - id: cq16
    text: When is any required regulatory notification due under the applicable reporting requirement?
  - id: cq17
    text: "What evidence supports an incident's impact, classification, decisions, and recovery, and is its integrity preserved?"
  - id: cq18
    text: "Which stakeholders need an incident update, and what has actually been communicated against the latest verified incident state?"
  - id: cq19
    text: "Is an incident ready to close, including restored service health or an accepted residual condition, restoration evidence, required communications, and any applicable post-incident review?"
  - id: cq20
    text: "Which corrective actions from post-incident reviews remain outstanding for the affected service, including actions from prior incidents?"
classes:
  Incident:
    meaning: A recorded disruption or security condition that may impact an IT service or business service.
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
      detectedTime:
        type: date
      majorIncidentFlag:
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
      resolvedTime:
        type: date
      closedTime:
        type: date
  Business Service:
    meaning: A capability the bank delivers to its users.
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
  IT Service:
    meaning: A service supporting bank capabilities whose operational health is tracked.
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
  Customer Channel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  Configuration Item:
    meaning: A component recorded in configuration-management scope.
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
  Third-Party Service:
    meaning: A service provided by an external party that an IT service can depend on.
    aliases:
      - külső szolgáltatás
      - outsourced service
    properties: {}
  Alert:
    meaning: A monitoring signal that may trigger an incident.
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
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases:
      - esemény
    properties:
      observedTime:
        type: date
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
  Infrastructure Component:
    meaning: "A component on which an IT service runs, whether or not it is recorded as a configuration item."
    aliases:
      - infrastruktúra-elem
    properties: {}
  Service Owner:
    meaning: The party accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  Resolver Group:
    meaning: A group assigned to diagnose and restore an incident.
    aliases:
      - support group
      - megoldócsoport
    properties: {}
  On-Call Engineer:
    meaning: A member of a resolver group who may perform time-critical technical work on an incident.
    aliases:
      - on-call
      - ügyeletes mérnök
    properties: {}
  Incident Commander:
    meaning: The person who commands a major incident and directs its coordination and decision cadence.
    aliases:
      - incident manager
      - MIM lead
      - incidensparancsnok
    properties: {}
  Service Desk:
    meaning: The team that records incidents arising from user-reported issues and triages and routes them before assignment.
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  IT Operations Team:
    meaning: The team operating IT services during day-to-day operations and response without automatic authority for every response action.
    aliases:
      - IT üzemeltetés
      - üzemeltetési csapat
    properties: {}
  Network Operations Centre:
    meaning: The team operating monitoring for network and infrastructure signals.
    aliases:
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  Security Operations Centre:
    meaning: "The team monitoring security events relevant to assessing an incident's security dimension."
    aliases:
      - SOC
      - biztonsági műveleti központ
    properties: {}
  Incident Response Team:
    meaning: The team coordinating a major incident under the incident command structure.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  Runbook:
    meaning: A guide for responding to an incident.
    aliases:
      - playbook
      - üzemeltetési eljárás
    properties: {}
  Workaround:
    meaning: A temporary measure that reduces incident impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  Backup Set:
    meaning: A set of backup data protecting particular configuration items that may be used in restoration.
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
  Recovery Plan:
    meaning: A plan for restoring an IT service that may use a backup set.
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
  Environment:
    meaning: An operating environment that may serve as an approved target for failover or restoration.
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
    meaning: A controlled modification that may be executed through a deployment or an accelerated emergency path.
    aliases:
      - változás
      - módosítás
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
          - rolled-back
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
  Deployment:
    meaning: The technical execution that installs or activates a change.
    aliases:
      - telepítés
      - élesítés
    properties:
      startTime:
        type: date
      completionTime:
        type: date
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
  Evidence Item:
    meaning: A particular preserved record or artifact whose integrity can be checked and whose support for an incident can be traced.
    aliases:
      - Evidence
      - bizonyíték
    properties:
      collectedTime:
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
  Materiality Assessment:
    meaning: "A recorded assessment of an incident's reporting conclusion, rationale, and applicable reporting due time determined under the approved procedure."
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  Regulatory Notification:
    meaning: "A formal submission about an incident to the regulator, distinct from the assessment that may require it."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      dueTime:
        type: date
      submissionTime:
        type: date
  Stakeholder:
    meaning: "A person, group, or organisation with an interest in an incident's outcome who may need communication."
    aliases:
      - érintett
    properties: {}
  Communication:
    meaning: "A message about an incident addressed to a stakeholder or audience and tracked through drafting, approval, and sending."
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
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentTime:
        type: date
  Post-Incident Review:
    meaning: "A review of an incident, its response, causes and lessons that can produce corrective actions."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOnDate:
        type: date
      findings:
        type: text
  Corrective Action:
    meaning: "A tracked follow-up from a post-incident review with its own owner, status and due date."
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
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
  Monitoring Tool:
    meaning: A tool operated by the network operations centre that monitors IT services and configuration items and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  Monitoring Rule:
    meaning: A rule executed by a monitoring tool that evaluates telemetry and may generate an alert.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Regulator:
    meaning: The authority to which a regulatory notification about an incident is submitted.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  Application:
    meaning: A software system implementing an IT service that may run on infrastructure components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Problem:
    meaning: "The underlying or potential cause of one or more incidents, which may not yet be diagnosed."
    aliases:
      - probléma
    properties: {}
  Known Error:
    meaning: Documentation of a diagnosed problem with a known cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  Release:
    meaning: "A governed package of approved changes introduced together, separate from the technical execution that delivers it."
    aliases:
      - kiadás
    properties: {}
  Organisational Unit:
    meaning: A unit accountable for following up a corrective action.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: IT Service
    meaning: The incident has a confirmed impact on this IT service.
    aliases: []
  - name: impacts
    from: Incident
    to: Business Service
    meaning: The incident has a confirmed impact on this business service.
    aliases: []
  - name: dependsOn
    from: Business Service
    to: IT Service
    meaning: The business service depends on this supporting IT service.
    aliases: []
  - name: deliveredThrough
    from: Business Service
    to: Customer Channel
    meaning: The business service is delivered through this customer channel without implying the channel is disrupted.
    aliases: []
  - name: runsOn
    from: IT Service
    to: Infrastructure Component
    meaning: The IT service runs on this infrastructure component as a documented technical dependency.
    aliases: []
  - name: dependsOn
    from: IT Service
    to: Third-Party Service
    meaning: The IT service depends on this third-party service.
    aliases: []
  - name: affects
    from: Incident
    to: Configuration Item
    meaning: The incident has an established effect on this configuration item.
    aliases: []
  - name: implementedBy
    from: IT Service
    to: Application
    meaning: The IT service is implemented by this application.
    aliases:
      - is implemented by
  - name: runsOn
    from: Application
    to: Infrastructure Component
    meaning: The application runs on this infrastructure component.
    aliases: []
  - name: executedBy
    from: Monitoring Rule
    to: Monitoring Tool
    meaning: The monitoring tool executes this rule to evaluate telemetry.
    aliases:
      - executes
  - name: generatedBy
    from: Alert
    to: Monitoring Rule
    meaning: This alert was generated by the rule when it has a monitoring-rule origin.
    aliases:
      - generates
  - name: triggeredBy
    from: Incident
    to: Alert
    meaning: "This incident was opened as a result of this alert, when that link is established."
    aliases:
      - triggers
  - name: correlatedFrom
    from: Incident
    to: Event
    meaning: This event has been established as correlated with the incident rather than merely concurrent.
    aliases:
      - is correlated with
  - name: operates
    from: Network Operations Centre
    to: Monitoring Tool
    meaning: The network operations centre operates this monitoring tool.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: IT Service
    meaning: The monitoring tool monitors this IT service.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: Configuration Item
    meaning: The monitoring tool monitors this configuration item.
    aliases: []
  - name: records
    from: Service Desk
    to: Incident
    meaning: The service desk records this incident arising from a user-reported issue.
    aliases: []
  - name: operates
    from: IT Operations Team
    to: IT Service
    meaning: The IT operations team operates this IT service.
    aliases: []
  - name: monitors
    from: Security Operations Centre
    to: Event
    meaning: "The centre actually monitors this event, which has been identified as a security event; this does not apply to all events."
    aliases:
      - monitors security event
  - name: owns
    from: Service Owner
    to: IT Service
    meaning: The service owner is accountable for this IT service across its lifecycle.
    aliases:
      - owned by
  - name: assignedTo
    from: Incident
    to: Resolver Group
    meaning: The incident has been assigned to this resolver group for diagnosis and restoration.
    aliases: []
  - name: memberOf
    from: On-Call Engineer
    to: Resolver Group
    meaning: The on-call engineer is a member of this resolver group.
    aliases:
      - belongs to
  - name: handledBy
    from: Incident
    to: On-Call Engineer
    meaning: This on-call engineer directly handles time-critical technical work on the incident.
    aliases: []
  - name: coordinatedBy
    from: Incident
    to: Incident Commander
    meaning: The declared major incident is coordinated by its assigned incident commander.
    aliases:
      - commands major-incident response
  - name: coordinates
    from: Incident Response Team
    to: Incident
    meaning: "The incident response team coordinates this declared major incident, not every incident."
    aliases: []
  - name: memberOf
    from: Incident Commander
    to: Incident Response Team
    meaning: The incident commander is a member of the incident response team.
    aliases: []
  - name: handledWith
    from: Incident
    to: Runbook
    meaning: The runbook selected to guide response to this incident; selection does not establish safe execution.
    aliases: []
  - name: recoveredWith
    from: Incident
    to: Recovery Plan
    meaning: "The recovery plan selected for this incident, subject to checking its applicability and safety."
    aliases: []
  - name: recovers
    from: Recovery Plan
    to: IT Service
    meaning: The IT service that this recovery plan describes restoring.
    aliases: []
  - name: protects
    from: Backup Set
    to: Configuration Item
    meaning: The configuration item protected by this backup set.
    aliases: []
  - name: uses
    from: Recovery Plan
    to: Backup Set
    meaning: The backup set that this recovery plan may use in restoration.
    aliases: []
  - name: linkedTo
    from: Incident
    to: Problem
    meaning: The incident is linked to this underlying or potential problem.
    aliases: []
  - name: documentedBy
    from: Problem
    to: Known Error
    meaning: The problem has been diagnosed and documented by this known error.
    aliases: []
  - name: has
    from: Known Error
    to: Workaround
    meaning: The known error has this documented workaround.
    aliases: []
  - name: documentedIn
    from: Workaround
    to: Runbook
    meaning: The workaround is documented in this runbook; documentation does not establish safety for a particular incident.
    aliases: []
  - name: deployedIn
    from: IT Service
    to: Environment
    meaning: The IT service is deployed in this environment; this does not designate an approved failover target.
    aliases: []
  - name: belongsTo
    from: Configuration Item
    to: Environment
    meaning: The configuration item belongs to this environment; this does not designate an approved restore target.
    aliases: []
  - name: affects
    from: Change
    to: IT Service
    meaning: The change affects this IT service; this does not establish that it caused an incident.
    aliases: []
  - name: modifies
    from: Change
    to: Configuration Item
    meaning: The change modifies this configuration item; this does not establish incident causation.
    aliases: []
  - name: targets
    from: Deployment
    to: Environment
    meaning: The deployment targets this environment.
    aliases: []
  - name: deploys
    from: Deployment
    to: Application
    meaning: The deployment installs or activates this application.
    aliases: []
  - name: resolvedBy
    from: Incident
    to: Change
    meaning: "The incident was resolved by this change, not necessarily caused by it."
    aliases: []
  - name: implementedBy
    from: Change
    to: Release
    meaning: The change is included for implementation in this governed release; this does not prove a deployment succeeded.
    aliases: []
  - name: deliveredBy
    from: Release
    to: Deployment
    meaning: "The release is delivered by this deployment, whose execution must be checked separately."
    aliases: []
  - name: supportedBy
    from: Incident
    to: Evidence Item
    meaning: "This evidence item documents the incident and may substantiate a particular impact, classification, decision or recovery claim after checking its integrity."
    aliases:
      - documents
  - name: includes
    from: Regulatory Notification
    to: Evidence Item
    meaning: This evidence item is included in the regulatory submission; inclusion alone does not verify integrity or completeness.
    aliases: []
  - name: evaluatedBy
    from: Incident
    to: Materiality Assessment
    meaning: "The incident is evaluated by this assessment recording its reporting conclusion, rationale and applicable due time."
    aliases: []
  - name: triggers
    from: Materiality Assessment
    to: Regulatory Notification
    meaning: "The assessment's reporting conclusion calls for this notification without asserting its approval or submission."
    aliases: []
  - name: reports
    from: Regulatory Notification
    to: Incident
    meaning: The regulatory notification reports this incident.
    aliases: []
  - name: sentTo
    from: Regulatory Notification
    to: Regulator
    meaning: The regulatory notification is addressed to this regulator; the link does not itself mean submission occurred.
    aliases: []
  - name: notifies
    from: Incident
    to: Stakeholder
    meaning: The stakeholder is identified to receive notification about this incident; this link does not mean a message was delivered.
    aliases: []
  - name: communicatedThrough
    from: Incident
    to: Communication
    meaning: "The communication is about this incident and records a message used for its communication, whether drafted, approved or sent."
    aliases:
      - is about
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: The communication is addressed to this stakeholder; delivery must be checked separately.
    aliases: []
  - name: reviewedIn
    from: Incident
    to: Post-Incident Review
    meaning: "The incident is reviewed in this post-incident review, which may be scheduled or completed."
    aliases: []
  - name: produces
    from: Post-Incident Review
    to: Corrective Action
    meaning: The post-incident review produces this tracked corrective action.
    aliases: []
  - name: ownedBy
    from: Corrective Action
    to: Organisational Unit
    meaning: The organisational unit accountable for following up this corrective action; ownership does not prove completion or verification.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 101 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: coordinatedBy\n    from: Incident\n    to: Incident Commander\n    meaning: The incident has an assigned commander before major-incident declaration; once declared, that commander coordinates the major-incident response.\n    aliases: [commands major-incident response]\nrules:\n  canDeclareMajorIncident:\n    conditions:\n      - The approved major-incident procedure's business-impact criteria have been checked and met; this model does not prescribe their thresholds.\n      - Incident status is not resolved, closed, or cancelled.\n      - Incident severity is sev1-critical or sev2-high.\n      - Incident impacts at least one identified IT Service.\n      - Incident coordinatedBy an assigned Incident Commander has been established before declaration; this link alone does not mean declaration occurred."
}
```

### Turn 101 — tool

Applied. Added 1, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 101 — assistant

I recorded **one declaration rule** and clarified the existing Incident–Incident Commander connection: the commander is assigned **before** declaration; the link alone does not mean declaration occurred. The rule checks incident state, severity, an impacted IT Service, the assigned commander, and the approved procedure’s business-impact criteria. Those broader criteria have **no thresholds specified in this model**, so the agent must check the procedure rather than invent them.

For **assigning an Incident to a Resolver Group**, which Incident statuses permit assignment, and what must the agent verify about the proposed group’s current support for the affected IT Service or Configuration Item before recording the assignment?

### Turn 102 — user

The incident must **not be closed or cancelled**. There isn’t a narrower allowed-status list for assignment here.

Before assigning it, verify from current support-assignment information that the proposed **resolver group supports an IT service or configuration item affected by this incident**. Don’t infer that from the group’s name or from a past assignment. If support is unverified, do not assign; once it is confirmed, record the incident’s assignment to the group and read it back to verify the result.

### Turn 102 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canAssignIncident:\n    conditions:\n      - Incident status is not closed or cancelled.\n      - The proposed Resolver Group's current support for an IT Service impacted by this Incident or a Configuration Item affected by this Incident has been confirmed from current support-assignment information; do not infer support from its name or past assignments."
}
```

### Turn 102 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 102 — assistant

I recorded **one assignment rule**: the Incident must not be closed or cancelled, and current support-assignment information must confirm that the proposed Resolver Group supports an IT Service or Configuration Item affected by it. A group name or past assignment is insufficient.

For **acknowledging an Alert**, is `status = new` the complete precondition, or must the agent check anything else before acknowledging it?

### Turn 103 — user

There’s one more check: the operator must be **authorised for the responsible resolver group**. The alert must be **new**, but status alone is not sufficient.

If both checks pass, acknowledge it, record the acknowledgement time, then read the alert back to confirm its status is **acknowledged**. If authorisation cannot be verified, don’t perform the action.

### Turn 103 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canAcknowledgeAlert:\n    conditions:\n      - Alert status is new.\n      - The operator's authorisation for the responsible Resolver Group has been verified in the authorised workflow; the alert's detection source alone does not establish the responsible group."
}
```

### Turn 103 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 103 — assistant

I recorded **one alert-acknowledgement rule**: Alert status must be `new`, and the operator’s authorization for the responsible Resolver Group must be verified. Detection source alone does not identify that group. The action will later record acknowledgement time and read back the Alert status.

For **containing an Incident**, which Incident states permit the action, and what must be checked about the proposed containment scope, expected side effects, and remaining service impact before acting?

### Turn 104 — user

Containment may start when the incident is **acknowledged** or **investigating**. Before acting, record the **scope of the proposed containment** and its **expected side effects**. Don’t proceed on an unspecified “contain it” instruction.

The approved containment steps are then executed. Set the incident status to **contained** only when containment indicators have been verified, and check the **remaining service impact** afterward. That impact check is part of verifying the result, not a claim that containment necessarily restored the service. Retain the scope, side-effect assessment, and verification record.

### Turn 104 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canContainIncident:\n    conditions:\n      - Incident status is acknowledged or investigating.\n      - The proposed containment scope and expected side effects have been recorded with the incident response.\n      - The proposed containment steps have been approved for this incident; an unspecified instruction to contain it is not sufficient."
}
```

### Turn 104 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 104 — assistant

I recorded **one containment rule**: Incident status must be `acknowledged` or `investigating`; the proposed scope and side effects must be recorded; and the steps must be approved for that Incident. The Incident becomes `contained` only after containment indicators are verified. Remaining service impact is checked afterward, not assumed restored.

For **isolating a Configuration Item**, must the Incident be in a particular status, or is the action permitted whenever its impact on the item is established and the isolation assessment, authorization, and rollback or reconnection method have been verified?

### Turn 105 — user

There is **no specified incident-status precondition** for isolating a configuration item. Before acting, confirm that the item is **linked to the incident**, assess the isolation’s impact, and have a **rollback or reconnection method** available. An established impact is relevant, but it does not replace those checks.

I would not add a separate, specified authorisation test for this action unless the bank’s governing procedure requires one. After isolation, confirm that the item is separated from the defined networks or dependencies and check the remaining service health. Retain the assessment, method, and verification.

### Turn 105 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canIsolateConfigurationItem:\n    conditions:\n      - Incident affects the proposed Configuration Item has been confirmed.\n      - The proposed isolation's impact has been assessed using the item's criticalityTier, actual dependencies and expected service impact; the tier alone is not permission or an automatic blocker.\n      - A rollback or reconnection method is available and retained with the response record."
}
```

### Turn 105 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 105 — assistant

I recorded **one isolation rule**: confirm the Incident affects the Configuration Item, assess the proposed isolation’s impact, and have a rollback or reconnection method available. I added no incident-status or blanket authorization test. After isolation, the agent must verify separation from the defined dependencies and check remaining service health.

For **failing over an IT Service**, which Incident states permit the action, and what must be checked before acting besides the plan’s applicability, target Environment availability, and acceptable data-recovery point?

### Turn 106 — user

There is **no specified Incident-status precondition** for failover, and no additional fixed precondition beyond the three you named. For the affected IT Service, verify that the Recovery Plan applies, the proposed recovery Environment is available, and the data-recovery point is acceptable. If any of those cannot be established, do not fail over.

After moving the workload, confirm the service’s health **and critical business transactions** in the recovery Environment, and retain the checks and results. I wouldn’t infer permission to fail over merely from the plan’s existence or an Incident status.

### Turn 106 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canFailOverITService:\n    conditions:\n      - The IT Service to be failed over is impacted by the Incident.\n      - Incident recoveredWith a Recovery Plan and that plan recovers this IT Service; verify the plan applies to the particular service.\n      - The proposed recovery Environment's current availability has been verified; IT Service deployedIn Environment alone does not designate or approve it as a recovery target.\n      - The proposed data-recovery point has been checked and found acceptable for this failover; interpret the Recovery Plan recoveryPointObjective only with its unit from approved recovery documentation."
}
```

### Turn 106 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 106 — assistant

I recorded **one failover rule** with no Incident-status condition: the IT Service must be affected, the selected Recovery Plan must apply to it, the proposed Environment must be currently available, and the data-recovery point must be acceptable. A plan link or deployment-context link alone is not permission. After failover, we’ll verify service health and critical business transactions in the recovery Environment.

For **restoring data from a Backup Set**, is there any Incident-status condition? And are these the complete pre-action checks: the set **protects** the target Configuration Item; its status is `successful` or `verified`; the restore point and target Environment are approved; and backup integrity is checked?

### Turn 107 — user

There is **no specified Incident-status condition**. Before restoring, confirm that the Backup Set is **successful** or **verified**, that it **protects the target**, and that both the **restore point and target Environment are approved**. If any of those checks fails or cannot be verified, do not restore.

I’d place the explicit **data-integrity check after the restore**, alongside validation that the application functions. Assessing the backup’s integrity beforehand is sensible, but I would not add it as a separate fixed precondition in this rule. Retain the approvals and the restore-verification results.

### Turn 107 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canRestoreBackupSet:\n    conditions:\n      - Backup Set status is successful or verified.\n      - Backup Set protects the target Configuration Item.\n      - The proposed restore point has been approved for this restore.\n      - The target Environment has been approved for this restore; Configuration Item belongsTo Environment alone does not confer approval."
}
```

### Turn 107 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 107 — assistant

I recorded **one restore rule** with no Incident-status condition: Backup Set status must be `successful` or `verified`, it must protect the target Configuration Item, and the specific restore point and Environment must be approved. Data integrity and application function are **post-restore verifications**, not additional fixed preconditions in this rule.

For **executing an emergency Change**, which Change statuses permit execution, and are these the complete checks before acting: a verified active-Incident justification in the change workflow, implementation and backout plans, identified affected Configuration Items, and explicit risk acceptance? Does the bank require a separate approval check for this accelerated path?

### Turn 108 — user

There is **no specified list of Change statuses that permits emergency execution**. Before acting, verify all four checks you listed: the change is linked to an **active Incident** that justifies the emergency path; the implementation and backout plans are present; affected Configuration Items are identified; and the risk has been **explicitly accepted**. A recorded risk level is not risk acceptance.

The emergency path is governed and the change implemented must be approved, but I cannot specify a **separate approval test or approval limit** beyond those stated execution checks. After execution, update the Change status, run technical checks, verify service health, and retain implementation evidence.

### Turn 108 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canExecuteEmergencyChange:\n    conditions:\n      - The emergency-change workflow record verifies the Change's link to an active Incident and records why that Incident justifies the accelerated path; Incident resolvedBy Change is not a substitute.\n      - Change implementationPlan and backoutPlan are present.\n      - The Configuration Items modified by this Change have been identified.\n      - The assessed Change riskLevel has been explicitly accepted; a risk level alone does not constitute acceptance.\n      - The change to be implemented is approved under the governed emergency path; no separate approval limit or test is specified in this model."
}
```

### Turn 108 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [error] value-not-allowed — Rule "canExecuteEmergencyChange" (condition 4) requires Change.riskLevel to be "explicitly accepted", but that property allows only: low, medium, high, critical. Either add "explicitly accepted" to the allowed values, or use one that is already there. Do not drop the condition to make this go away.

### Turn 108 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canExecuteEmergencyChange:\n    conditions:\n      - The emergency-change workflow record verifies the Change's link to an active Incident and records why that Incident justifies the accelerated path; Incident resolvedBy Change is not a substitute.\n      - Change implementationPlan and backoutPlan are present.\n      - The Configuration Items modified by this Change have been identified.\n      - Verify explicit acceptance of the assessed risk in the emergency-change workflow; Change riskLevel (low, medium, high, or critical) alone does not establish acceptance.\n      - The change to be implemented is approved under the governed emergency path; no separate approval limit or test is specified in this model."
}
```

### Turn 108 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 108 — assistant

I recorded the **emergency-change rule**. The canvas initially flagged wording that could be read as making “explicitly accepted” a Change risk-level value. I corrected it: risk level remains `low`, `medium`, `high`, or `critical`; **risk acceptance is a separate workflow verification**.

The rule also requires the active-Incident justification, both plans, identified modified Configuration Items, and approval under the governed emergency path. The specific approval test or limit remains unspecified.

For **sending a Communication**, are the complete pre-send checks: recorded audience and message, identified owner, `approved` status, content matching the latest verified Incident state, and agreement between the audience and its addressed-to Stakeholder? Is there any additional check you require before sending?

### Turn 109 — user

The required pre-send checks are that the **audience, message, owner, and approval state are recorded**, and that the content matches the **latest verified incident state**. Do not send if any of those cannot be established.

I would check that the addressed stakeholder is appropriate for the intended audience, but I wouldn’t add “audience agrees with the stakeholder” as a separate fixed rule. Nor would I prescribe `approved` as the only permitted status from this rule: it requires the approval state to be recorded, with sending governed by the applicable approval workflow.

After sending, record the sent time, confirm delivery status, and archive the final message.

### Turn 109 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canSendCommunication:\n    conditions:\n      - Communication audience and messageSummary are recorded, and its addressedTo Stakeholder is appropriate for the intended audience.\n      - The communication's message owner and approval state have been recorded and the applicable approval workflow permits sending; Communication status alone does not replace that check.\n      - The message content has been checked against the latest verified Incident state reached through Incident communicatedThrough Communication."
}
```

### Turn 109 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 109 — assistant

I recorded **one communication rule**. It requires the audience and message, a recorded owner and approval state under the applicable workflow, an appropriate addressed Stakeholder, and content checked against the latest verified Incident state. I did not make `approved` the only permissible status or invent an owner field.

For **submitting a Regulatory Notification**, are the complete pre-submission checks: assessment result `reportable`; Notification status `approved`; links to the Incident and Regulator; required information and included Evidence Items complete and checked; and submission before the Notification due time established through the reporting process? What must be checked if the assessment and notification due times differ?

### Turn 110 — user

Yes, those are the pre-submission checks. The supporting evidence must be complete, not merely linked, and the notification must be submitted **before its due time**. If approval, completeness, the links, or the deadline cannot be verified, do not submit.

If the assessment’s reporting due time and the notification’s due time differ, **do not choose one automatically**. Have the designated reporting function reconcile them against the approved reporting procedure and confirm the applicable deadline before submission. After submitting, retain the receipt and submission time, then confirm acceptance or record rejection and remediation.

### Turn 110 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canSubmitRegulatoryNotification:\n    conditions:\n      - The Incident evaluatedBy Materiality Assessment has result reportable, and that assessment triggers this Regulatory Notification.\n      - Regulatory Notification status is approved.\n      - Regulatory Notification reports the Incident and sentTo a Regulator have been verified.\n      - Required notification information and Evidence Items included in the Regulatory Notification are complete; each relied-on item's integrity has been checked rather than assumed from inclusion.\n      - Submission can occur before Regulatory Notification dueTime established under the approved reporting procedure; if it differs from Materiality Assessment reportingDueTime, the designated reporting function must reconcile and confirm the applicable deadline before submission."
}
```

### Turn 110 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 110 — assistant

I recorded **one notification-submission rule**. It requires a `reportable` assessment, an `approved` notification linked to the Incident and Regulator, complete information and checked evidence, and a confirmed deadline that can still be met. If the two recorded due times differ, the designated reporting function must reconcile them; the agent must not choose one automatically.

For **closing an Incident**, which Incident statuses permit closure? You’ve also named restored Business Service and IT Service health **or** accepted residual condition, restoration evidence, required Communications, and—for major or cybersecurity incidents—a review scheduled or completed. Are there any further closure checks, and how is “review scheduled” verified without a review-status field?

### Turn 111 — user

Closure is permitted from **resolved** or **monitoring** status, subject to these checks:

- Impacted services have **healthy** health state, or a **residual condition has been accepted**.
- **Resolution and restoration evidence** is recorded.
- Required **stakeholder communications** are complete.
- If it is a **major or cybersecurity incident**, a post-incident review is **scheduled or completed**.

I wouldn’t add another fixed closure check. For a completed review, check its **held-on date**. For a scheduled one, verify the scheduling in the review workflow or retained scheduling record; there is no review-status field to infer it from. Then close the incident, record the closure time, and read back the incident, linked service health, and retained evidence. Outstanding corrective actions do not, by themselves, block closure.

### Turn 111 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canCloseIncident:\n    conditions:\n      - Incident status is resolved or monitoring.\n      - Each impacted IT Service and Business Service has healthState healthy, or acceptance of its residual condition has been verified and retained; health is checked against current evidence.\n      - Incident supportedBy Evidence Items substantiate resolution and restoration and their integrity has been verified.\n      - Required Stakeholders identified through Incident notifies Stakeholder have their required Communications completed and delivery checked through Incident communicatedThrough Communication and Communication addressedTo Stakeholder.\n      - If Incident majorIncidentFlag is true or Incident category is cybersecurity, its Post-Incident Review linked through Incident reviewedIn Post-Incident Review is scheduled in a verified review workflow or retained scheduling record, or has a heldOnDate confirming completion; outstanding Corrective Actions need not be closed."
}
```

### Turn 111 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 111 — assistant

I recorded **one closure rule**: Incident status must be `resolved` or `monitoring`; affected service health must be healthy or a residual condition accepted; restoration evidence and required communications must be verified; and a major or cybersecurity incident must have a review scheduled or completed. A held-on date confirms completion; scheduling must be verified separately. Outstanding Corrective Actions do not automatically block closure.

That completes the decision-rule pass for the agreed actions. The rules keep external checks—such as business-impact criteria, support assignments, approval workflows, and recovery-target availability—explicit without inventing fields or thresholds.

**Is this an accurate recap of the rules before we define each action’s effect and result check?**

### Turn 112 — user

Yes. The rules are tied to the point of action, and they distinguish recorded values from checks the agent must make at that point. They do not turn every field into a universal requirement or let a valid status stand in for approval, evidence, or verification.

We can now define each action’s effect, result check, and retained record.

### Turn 112 — assistant

We can now turn the agreed requirements into action records. Each action will have one main input, its precondition rule, what changes, and how the agent checks the result.

For the first three, do these effects and checks match your workflow?

- **Acknowledge an alert** — input **Alert**; use `canAcknowledgeAlert`; set status to `acknowledged` and record acknowledgement time; read the Alert back to verify both.
- **Assign an incident to a resolver group** — input **Incident**; use `canAssignIncident`; record its `assignedTo` Resolver Group link; read that assignment back.
- **Declare a major incident and start the coordination cadence** — input **Incident**; use `canDeclareMajorIncident`; set the major-incident flag, record declaration time, and link the coordination Communication; verify the flag, time, assigned Incident Commander, and Communication record.

Would any of those effects or result checks need changing before I record them?

### Turn 113 — user

They are substantively right, with two refinements before recording:

- **Acknowledge an alert:** Record the acknowledgement time, then read back the alert to confirm its status is **acknowledged**. Checking the recorded time too is useful, though the specified result check is the status.
- **Assign an incident:** Record the incident’s link to the selected resolver group, then read it back. The pre-action check must already have established that the group supports an affected service or configuration item.
- **Declare a major incident:** The commander must be **assigned before** declaration. Declaration sets the major-incident classification, records the declaration time, and starts coordination and the communication cadence. Verify the classification, time, commander, and communication record afterward. I wouldn’t make linking one particular “coordination communication” the entire effect of starting that cadence.

I’d use **“declare a major incident”** as the action name; starting the cadence is part of its effect.

### Turn 113 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  acknowledgeAlert:\n    input: Alert\n    preconditions: [canAcknowledgeAlert]\n    effect: Set Alert status to acknowledged and record Alert acknowledgementTime; retain the acknowledgement record.\n    verification: Read the Alert back to confirm status is acknowledged and check its recorded acknowledgementTime.\n  assignIncidentToResolverGroup:\n    input: Incident\n    preconditions: [canAssignIncident]\n    effect: Record the Incident assignedTo the selected Resolver Group after confirming its support for an impacted IT Service or affected Configuration Item; retain the assignment record.\n    verification: Read the Incident back and confirm its assignedTo Resolver Group link identifies the selected group.\n  declareMajorIncident:\n    input: Incident\n    preconditions: [canDeclareMajorIncident]\n    effect: Set Incident majorIncidentFlag to true, record declarationTime, and initiate coordination and the communication cadence through Incident Response Team coordinates Incident and Incident communicatedThrough Communication; retain the declaration record. The Incident coordinatedBy Incident Commander link must be assigned before this action.\n    verification: Read the Incident back and confirm majorIncidentFlag is true, declarationTime is recorded, its coordinatedBy Incident Commander link remains assigned, and a related Communication record for the cadence exists."
}
```

### Turn 113 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "acknowledgeAlert" has input class Alert, and its precondition canAcknowledgeAlert refers to Resolver Group, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Alert to Resolver Group. Rewording the text does not create the path it assumes.

### Turn 113 — assistant

I recorded **three actions**: acknowledge Alert, assign Incident to Resolver Group, and declare Major Incident. The declaration action treats commander assignment as a precondition and starting the coordination and communication cadence as part of the effect.

The canvas flagged a real navigation gap: the Alert action requires authorization for the **responsible Resolver Group**, but the model does not show how to find that group from an Alert. I won’t hide the gap by rewording the rule.

**How does your team determine the responsible Resolver Group for an Alert before acknowledging it—is there a direct recorded Alert-to-group assignment, or is it established through an external routing check?**

### Turn 114 — user

It is established through the **current alert-routing and support information**, not a direct Alert-to-Resolver Group connection specified here. Use the alert’s concerned IT service or configuration item, where identified, to find the responsible group, then verify the operator is authorised for that group.

If the affected service or item, responsible group, or authorisation cannot be established, the agent should not acknowledge the alert. The alert’s detection source alone is not enough to identify the group.

### Turn 114 — assistant

The responsible group comes from **current alert-routing and support information**, not from Alert detection source or a direct Alert–Resolver Group link. The acknowledgement must be blocked if the concerned service or item, responsible group, or operator authorization cannot be established. The canvas warning remains open until we clarify the navigation path.

**When an Alert concerns an IT Service or Configuration Item, are those direct, recorded links on the Alert? If so, what verbs and directions does your team use for them?**

### Turn 115 — user

Yes. An **alert concerns an IT service** or **concerns a configuration item** when that target is identified. Those are direct Alert-to-target links, and **“concerns”** is the verb I’d use for both.

They identify what the alert is about; they do not identify or authorise the responsible resolver group. Use current routing and support information for that separate check.

### Turn 115 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: concerns\n    from: Alert\n    to: IT Service\n    meaning: The alert concerns this identified IT service; the link does not identify the responsible resolver group.\n  - name: concerns\n    from: Alert\n    to: Configuration Item\n    meaning: The alert concerns this identified configuration item; the link does not establish support assignment or operator authorisation.\nrules:\n  canAcknowledgeAlert:\n    conditions:\n      - Alert status is new.\n      - Alert concerns an identified IT Service or Configuration Item.\n      - Current alert-routing and support information identifies the responsible Resolver Group for that concerned service or item and verifies the operator's authorisation for the group; detectionSource alone is insufficient. If the target, group or authorisation cannot be established, do not acknowledge."
}
```

### Turn 115 — tool

Applied. Added 2, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 115 — assistant

I added **two Alert links**—it *concerns* an IT Service or Configuration Item—and updated the acknowledgement rule to require a current routing, support, and authorization check. I added no Alert–Resolver Group link.

The canvas still reports a navigation warning because that group is found through **external routing information**, not a relationship stored here. I’ll keep that limitation explicit rather than invent a connection.

For the next two response actions, do these effects and result checks match what you require?

- **Contain an incident** — input Incident; use `canContainIncident`; execute the approved steps, then set status to `contained` **only after** containment indicators are verified. Check remaining service impact and retain the scope, side-effect assessment, and verification.
- **Isolate a configuration item** — input Configuration Item; use `canIsolateConfigurationItem`; isolate it from the defined networks or dependencies. Verify that separation and the remaining service health, retaining the impact assessment, rollback or reconnection method, and result.

### Turn 116 — user

**Contain an incident** matches. The input is the incident; execute the approved steps, and set its status to **contained only after** verifying the containment indicators. Check remaining service impact and retain the scope, expected side effects, and verification record. Containment does not itself prove restoration.

For **isolate a configuration item**, change the **main action input to the incident**. Identify the specific configuration item linked to that incident as the isolation target. The effect and result checks you propose are right: isolate it from the defined networks or dependencies, verify the separation and remaining service health, and retain the impact assessment, rollback or reconnection method, and result.

### Turn 116 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  containIncident:\n    input: Incident\n    preconditions: [canContainIncident]\n    effect: Execute approved containment steps for the Incident; set Incident status to contained only after verifying containment indicators, retaining scope and expected side-effect assessment with the response record.\n    verification: Confirm containment indicators before reading Incident status as contained; check remaining impacted IT Service and Business Service healthState against current evidence and retain verification; containment does not imply restoration.\n  isolateConfigurationItem:\n    input: Incident\n    preconditions: [canIsolateConfigurationItem]\n    effect: Isolate the specific Configuration Item reached through Incident affects Configuration Item from the defined networks or dependencies; retain the impact assessment and rollback or reconnection method with the response record, without inventing a Configuration Item state property.\n    verification: Verify separation of that Configuration Item from the defined networks or dependencies and check remaining impacted IT Service and Business Service healthState against current evidence; retain the result."
}
```

### Turn 116 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 116 — assistant

I recorded **two actions**, both with **Incident** as their input. Containment sets status to `contained` only after indicators are verified; isolation targets the specific Configuration Item linked to the Incident and does not invent an item-state field. Both require checking remaining service health and retaining the relevant response record.

For the two recovery actions, should **Incident** be the main input for each? Here are the proposed effects and checks:

- **Fail over an IT Service** — use `canFailOverITService`; move the affected service to the proposed recovery Environment; verify its IT Service health state and critical business transactions there, retaining the checks and result.
- **Restore data from a Backup Set** — use `canRestoreBackupSet`; restore the selected Backup Set to the target Configuration Item in the approved Environment; verify restored data integrity and Application function, retaining approvals and results.

Would you change either action’s main input, effect, or verification?

### Turn 117 — user

**Fail over an IT service:** yes, use the **incident** as the main input. After the plan, target availability, and data-recovery point checks pass, move the service workload to the recovery environment. Verify service health and critical business transactions there, and retain the checks and results.

**Restore a backup:** use the **backup set** as the main input, not the incident. Identify the configuration item it protects and the approved restore point and target environment before acting. Restore the data, then validate data integrity and application functionality. Retain the approvals and verification results.

### Turn 117 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  failOverITService:\n    input: Incident\n    preconditions: [canFailOverITService]\n    effect: Move the Incident-impacted IT Service covered by its Recovery Plan to the proposed Environment after verifying target availability and acceptable data-recovery point; retain the action checks and result without assuming the deployedIn link designates an approved target.\n    verification: Check the affected IT Service healthState against current evidence and verify critical business transactions in the recovery Environment; retain both results.\n  restoreBackupSet:\n    input: Backup Set\n    preconditions: [canRestoreBackupSet]\n    effect: Restore data from the Backup Set protecting the selected Configuration Item at the approved restore point in the approved Environment; retain approvals and execution record.\n    verification: Validate restored data integrity and Application functionality and retain the verification results; Backup Set status alone does not prove restoration."
}
```

### Turn 117 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] effect-verification-mismatch — Action "restoreBackupSet" verifies Backup Set.status, but its effect never says that property changes. Either say in the effect what sets it, or verify something the effect actually does.
  [warning] unreachable-from-action-input — Action "restoreBackupSet" has input class Backup Set, and its verification refers to Application, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Backup Set to Application. Rewording the text does not create the path it assumes.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 117 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  restoreBackupSet:\n    input: Backup Set\n    preconditions: [canRestoreBackupSet]\n    effect: Restore data from the Backup Set protecting the selected Configuration Item at the approved restore point in the approved Environment; retain approvals and execution record.\n    verification: Validate the restored data's integrity and the affected Application's functionality after restoration; retain the verification results."
}
```

### Turn 117 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "restoreBackupSet" has input class Backup Set, and its verification refers to Application, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Backup Set to Application. Rewording the text does not create the path it assumes.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 117 — assistant

I recorded **two recovery actions**: failover takes **Incident** as input; restore takes **Backup Set** as input. Failover checks service health and critical business transactions afterward. Restore checks restored data integrity and application functionality.

The canvas flags a real path gap for restore: it can reach the protected Configuration Item from the Backup Set, but it cannot yet navigate from that item to the **affected Application** whose function must be tested. I’ve left that verification requirement in place.

**How does your team get from the Configuration Item being restored to the Application whose functionality must be validated—is there a recorded connection, or is that application identified through the restore workflow?**

### Turn 118 — user

There is **no direct Configuration Item-to-Application connection specified here**. The restore workflow must identify which application uses the restored data or depends on the restored component. The documented service and application dependencies can guide that check, but they do not make every configuration item an application.

If the affected application cannot be identified, the agent cannot complete the required post-restore functionality verification. Keep that gap visible rather than adding an unsupported link.

### Turn 118 — assistant

The restore workflow must identify the Application that uses the restored data or depends on the restored component. There is **no confirmed direct Configuration Item–Application link**, so I won’t add one. If the workflow cannot identify the Application, post-restore functionality verification remains incomplete. The canvas warning correctly exposes that limit.

Next, for **execute an emergency change**, should **Change** be the main input? After `canExecuteEmergencyChange` passes, what Change status should execution record, and what exactly should the agent read back or test to confirm the result?

### Turn 119 — user

Use the **emergency change** as the main input—the accelerated form of a change, not a separate parallel record. Once its active-incident justification, plans, affected configuration items, and explicit risk acceptance are verified, implement the **approved** emergency change and update its status to reflect the actual outcome. There is no single status I’d set regardless of result: the recorded status must distinguish, for example, implementation from failure or rollback.

Then read back the change’s status, run the planned technical checks, verify the affected IT service’s health, and retain implementation evidence. Do not mark the incident resolved merely because the change ran; verify restoration separately.

### Turn 119 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  executeEmergencyChange:\n    input: Change\n    preconditions: [canExecuteEmergencyChange]\n    effect: Implement the approved Change through its emergency workflow and set Change status to the actual outcome among implemented, failed, or rolled-back as appropriate; retain implementation Evidence Items through the justified Incident supportedBy Evidence Item link, without treating Incident resolvedBy Change as emergency justification.\n    verification: Read back Change status, run the implementationPlan technical checks, and verify the affected IT Service healthState against current evidence; retain implementation evidence. Do not add Incident resolvedBy Change or mark the Incident resolved unless restoration has been separately established."
}
```

### Turn 119 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 3 new problem(s) from this edit:
  [warning] effect-verification-mismatch — Action "executeEmergencyChange" verifies Change.implementationPlan, but its effect never says that property changes. Either say in the effect what sets it, or verify something the effect actually does.
  [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its effect refers to Evidence Item, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Change to Evidence Item. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its precondition canExecuteEmergencyChange refers to Incident, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Change to Incident. Rewording the text does not create the path it assumes.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 119 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  executeEmergencyChange:\n    input: Change\n    preconditions: [canExecuteEmergencyChange]\n    effect: Implement the approved emergency Change and set Change status to the actual outcome, such as implemented, failed, or rolled-back; retain the execution record and implementation evidence in the emergency-change workflow, without treating Incident resolvedBy Change as emergency justification.\n    verification: Read back Change status, run the technical checks specified in Change implementationPlan, check the affected IT Service healthState against current evidence and retain the outcomes. Do not mark the Incident resolved or record Incident resolvedBy Change unless restoration has been separately established."
}
```

### Turn 119 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — 3 new problem(s) from this edit:
  [warning] effect-verification-mismatch — Action "executeEmergencyChange" verifies Change.implementationPlan, but its effect never says that property changes. Either say in the effect what sets it, or verify something the effect actually does.
  [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its effect refers to Evidence Item, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Change to Evidence Item. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its precondition canExecuteEmergencyChange refers to Incident, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Change to Incident. Rewording the text does not create the path it assumes.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 119 — assistant

I recorded **executeEmergencyChange** with **Change** as its one input. Its effect records the actual outcome—implemented, failed, or rolled back as appropriate—and its verification reads back that status, runs the planned technical checks, and checks affected IT Service health. It does not mark the Incident resolved merely because the Change ran.

The canvas still flags that the model has no navigable path from **Change** to its active-Incident justification or implementation evidence. The justification is a workflow check you’ve already specified, not the later *resolved by* link. It also flags the reference to the implementation plan in verification; that plan is **used for checks**, not changed by execution.

**How does your team retrieve the implementation evidence for a particular Change: through a direct recorded Change–Evidence Item link, through the Incident, or solely through the emergency-change workflow?**

### Turn 120 — user

Through the **emergency-change execution workflow**. It retains the implementation evidence with the particular change and its outcome; there is no specified direct Change–Evidence Item link here.

Evidence that supports the incident can also be linked to the **Incident**, but that link alone does not identify it as evidence of this change’s implementation. The agent should read the change’s recorded outcome, retrieve the workflow’s implementation evidence, run the technical checks, and verify service health. If it cannot retrieve that evidence, it cannot complete the execution verification.

### Turn 120 — assistant

Implementation evidence is retrieved from the **emergency-change execution workflow**, tied to that Change and its outcome—not inferred from the Incident’s evidence link. If the evidence cannot be retrieved, execution verification is incomplete. I won’t add a direct Change–Evidence Item link. The canvas warning remains an explicit limit of this model.

For **sending a stakeholder update**, should **Communication** be the main input? After `canSendCommunication` passes, what status should it record when sent, and what should the agent check afterward besides sent time, delivery confirmation, and archiving the final message?

### Turn 121 — user

Use the **Incident** as the main input, with the specific **Communication** selected for sending. The pre-send check covers its audience, message, owner and approval state, and confirms that the content matches the latest verified incident state.

After sending, record the **sent time** and update the communication’s status to reflect what actually happened. I wouldn’t prescribe one status regardless of the sending workflow or treat “sent” as proof of delivery. Confirm delivery status and archive the final message; retain the send and delivery record.

### Turn 121 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  sendStakeholderUpdate:\n    input: Incident\n    preconditions: [canSendCommunication]\n    effect: Send the selected Communication reached through Incident communicatedThrough Communication under its approval workflow; record Communication sentTime and set Communication status to its actual outcome among the recorded choices, retaining the send record rather than assuming delivery.\n    verification: Read back Communication sentTime and status, confirm delivery through the communication workflow and archive the final message; retain the delivery record. Incident notifies Stakeholder identifies intended recipients but is not proof of delivery."
}
```

### Turn 121 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
5 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 121 — assistant

I recorded **one send-update action** with **Incident** as input and a selected linked Communication. It records the actual Communication status and sent time, then requires delivery confirmation and archiving; “sent” is not assumed to mean delivered.

For **submitting an approved regulatory notification**, should **Regulatory Notification** be the main input? After `canSubmitRegulatoryNotification` passes, should the immediate effect set its status to `submitted` and record submission time, with acceptance or rejection checked as a **later** outcome? What else must the agent verify or retain immediately after submission?

### Turn 122 — user

Yes. Use the **regulatory notification** as the main input. Once the reportable assessment, approval, incident and regulator links, complete information and evidence, and deadline checks pass, submit it; set its status to **submitted**, record the **submission time**, and retain the **submission receipt**.

Read back the notification’s status and submission time and confirm that the submission was received. **Accepted** or **rejected** is a subsequent outcome: confirm acceptance when available, or record rejection and the remediation needed. Do not treat the immediate *submitted* state as acceptance.

### Turn 122 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  submitRegulatoryNotification:\n    input: Regulatory Notification\n    preconditions: [canSubmitRegulatoryNotification]\n    effect: Submit the approved Regulatory Notification that reports the Incident and is sentTo the Regulator; set its status to submitted, record submissionTime and retain the submission receipt in the reporting workflow.\n    verification: Read back Regulatory Notification status submitted and submissionTime, confirm receipt of the submission and retain it; subsequently confirm status accepted or record status rejected and remediation in the reporting workflow. Submitted is not accepted."
}
```

### Turn 122 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
5 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 122 — assistant

I recorded **one notification-submission action** with **Regulatory Notification** as input. It sets status to `submitted`, records submission time, and retains the receipt. The immediate check confirms the submission was received; acceptance or rejection is tracked afterward.

For **closing an Incident**, should the action use **Incident** as input, `canCloseIncident` as its precondition, then set status to `closed` and record closed time? You also asked to read back the Incident, linked service health, and retained evidence. Is there any other result check or record to retain after closure?

### Turn 123 — user

Yes. Use the **incident** as input and apply the closure checks first. If they pass, set its status to **closed** and record the **closed time**. Read back the incident’s closure state, the health or accepted residual condition of impacted services, and the resolution and restoration evidence.

Also retain confirmation that required stakeholder communications were completed and, for a major or cybersecurity incident, that its post-incident review was scheduled or completed. Those are closure records to preserve, not new fields or an additional post-closure action.

### Turn 123 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  closeIncident:\n    input: Incident\n    preconditions: [canCloseIncident]\n    effect: Set Incident status to closed and record closedTime; retain closure checks for impacted service health or accepted residual conditions, Incident supportedBy Evidence Items, required Communications, and any applicable Post-Incident Review scheduling or completion.\n    verification: Read back Incident status closed and closedTime; recheck impacted IT Service and Business Service healthState or accepted residual conditions, integrity-checked resolution and restoration Evidence Items, completed required Communications, and where majorIncidentFlag is true or category is cybersecurity, verified Post-Incident Review scheduling or heldOnDate."
}
```

### Turn 123 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] effect-verification-mismatch — Action "closeIncident" verifies Incident.category, but its effect never says that property changes. Either say in the effect what sets it, or verify something the effect actually does.
  [warning] effect-verification-mismatch — Action "closeIncident" verifies Incident.majorIncidentFlag, but its effect never says that property changes. Either say in the effect what sets it, or verify something the effect actually does.
5 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 123 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  closeIncident:\n    input: Incident\n    preconditions: [canCloseIncident]\n    effect: Set Incident status to closed and record closedTime; retain the pre-closure determination about affected service health or accepted residual conditions, resolution and restoration Evidence Items, required Communications, and whether a Post-Incident Review was required and scheduled or completed.\n    verification: Read back Incident status closed and closedTime; recheck impacted IT Service and Business Service healthState or retained residual acceptance, integrity-checked resolution and restoration Evidence Items and completed required Communications; where a review was required under canCloseIncident, confirm verified scheduling or Post-Incident Review heldOnDate is retained."
}
```

### Turn 123 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
5 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 123 — assistant

I recorded the **close Incident** action: after `canCloseIncident` passes, it sets status to `closed`, records closed time, and retains the closure checks. Its verification reads back closure state and the supporting health, evidence, communication, and—where required—review records.

The canvas initially flagged category and major-incident flag as though closure changed them. I corrected the action wording: those values determine whether a review is required **before** closure; closure does not change them. Five earlier navigation and verification warnings still need checking, and I won’t treat them as resolved.

**Does the action pass now capture all 11 agreed actions and their intended effects and checks accurately before we do the bounded “what might be missing” pass?**

### Turn 123 — user

[System note] Your last reply said "all 11", but this turn's apply_ontology_yaml call(s) actually recorded 1 added and 1 updated item(s) — not 11. State the true numbers the next time you summarize what was recorded, and call get_graph_state first if you are not sure what actually persisted.

### Turn 124 — user

Yes. All 11 agreed actions are covered, with their inputs, preconditions, effects, and result checks kept distinct. The remaining warnings reflect real boundaries—particularly external routing, workflow-held justification and evidence, and identifying the application to test after a restore. Keep those visible rather than inventing links to make the canvas look complete.

We can do the bounded missing-items check.

### Turn 124 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 124 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: What is the current health of each affected business service and supporting IT service?
  - id: cq3
    text: Which customer channels deliver the affected business services?
  - id: cq4
    text: "Which infrastructure and third-party services are on an affected IT service's dependency path?"
  - id: cq5
    text: Which configuration items are relevant along that dependency path?
  - id: cq6
    text: Which alerts and events are linked to an incident through its triggering alert or correlated events?
  - id: cq7
    text: Who owns an affected IT service?
  - id: cq8
    text: Which resolver group and on-call engineer should take an incident?
  - id: cq9
    text: "Does an incident meet the bank's criteria for a major-incident declaration?"
  - id: cq10
    text: Who should command the response to a major incident?
  - id: cq11
    text: "Which runbook, workaround, backup set, or recovery plan is applicable to an incident?"
  - id: cq12
    text: "Are the conditions for using a proposed runbook, workaround, backup set, or recovery plan safely met for this incident?"
  - id: cq13
    text: "Could a recent change or deployment have caused an incident, based on its classification and evidence?"
  - id: cq14
    text: "Has the incident's materiality been assessed, and what rationale was recorded?"
  - id: cq15
    text: "Is a regulatory notification required for the incident under the approved procedure and designated reporting function's conclusion?"
  - id: cq16
    text: When is any required regulatory notification due under the applicable reporting requirement?
  - id: cq17
    text: "What evidence supports an incident's impact, classification, decisions, and recovery, and is its integrity preserved?"
  - id: cq18
    text: "Which stakeholders need an incident update, and what has actually been communicated against the latest verified incident state?"
  - id: cq19
    text: "Is an incident ready to close, including restored service health or an accepted residual condition, restoration evidence, required communications, and any applicable post-incident review?"
  - id: cq20
    text: "Which corrective actions from post-incident reviews remain outstanding for the affected service, including actions from prior incidents?"
classes:
  Incident:
    meaning: A recorded disruption or security condition that may impact an IT service or business service.
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
      detectedTime:
        type: date
      majorIncidentFlag:
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
      resolvedTime:
        type: date
      closedTime:
        type: date
  Business Service:
    meaning: A capability the bank delivers to its users.
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
  IT Service:
    meaning: A service supporting bank capabilities whose operational health is tracked.
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
  Customer Channel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  Configuration Item:
    meaning: A component recorded in configuration-management scope.
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
  Third-Party Service:
    meaning: A service provided by an external party that an IT service can depend on.
    aliases:
      - külső szolgáltatás
      - outsourced service
    properties: {}
  Alert:
    meaning: A monitoring signal that may trigger an incident.
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
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases:
      - esemény
    properties:
      observedTime:
        type: date
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
  Infrastructure Component:
    meaning: "A component on which an IT service runs, whether or not it is recorded as a configuration item."
    aliases:
      - infrastruktúra-elem
    properties: {}
  Service Owner:
    meaning: The party accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  Resolver Group:
    meaning: A group assigned to diagnose and restore an incident.
    aliases:
      - support group
      - megoldócsoport
    properties: {}
  On-Call Engineer:
    meaning: A member of a resolver group who may perform time-critical technical work on an incident.
    aliases:
      - on-call
      - ügyeletes mérnök
    properties: {}
  Incident Commander:
    meaning: The person who commands a major incident and directs its coordination and decision cadence.
    aliases:
      - incident manager
      - MIM lead
      - incidensparancsnok
    properties: {}
  Service Desk:
    meaning: The team that records incidents arising from user-reported issues and triages and routes them before assignment.
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  IT Operations Team:
    meaning: The team operating IT services during day-to-day operations and response without automatic authority for every response action.
    aliases:
      - IT üzemeltetés
      - üzemeltetési csapat
    properties: {}
  Network Operations Centre:
    meaning: The team operating monitoring for network and infrastructure signals.
    aliases:
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  Security Operations Centre:
    meaning: "The team monitoring security events relevant to assessing an incident's security dimension."
    aliases:
      - SOC
      - biztonsági műveleti központ
    properties: {}
  Incident Response Team:
    meaning: The team coordinating a major incident under the incident command structure.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  Runbook:
    meaning: A guide for responding to an incident.
    aliases:
      - playbook
      - üzemeltetési eljárás
    properties: {}
  Workaround:
    meaning: A temporary measure that reduces incident impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  Backup Set:
    meaning: A set of backup data protecting particular configuration items that may be used in restoration.
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
  Recovery Plan:
    meaning: A plan for restoring an IT service that may use a backup set.
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
  Environment:
    meaning: An operating environment that may serve as an approved target for failover or restoration.
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
    meaning: A controlled modification that may be executed through a deployment or an accelerated emergency path.
    aliases:
      - változás
      - módosítás
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
          - rolled-back
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
  Deployment:
    meaning: The technical execution that installs or activates a change.
    aliases:
      - telepítés
      - élesítés
    properties:
      startTime:
        type: date
      completionTime:
        type: date
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
  Evidence Item:
    meaning: A particular preserved record or artifact whose integrity can be checked and whose support for an incident can be traced.
    aliases:
      - Evidence
      - bizonyíték
    properties:
      collectedTime:
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
  Materiality Assessment:
    meaning: "A recorded assessment of an incident's reporting conclusion, rationale, and applicable reporting due time determined under the approved procedure."
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  Regulatory Notification:
    meaning: "A formal submission about an incident to the regulator, distinct from the assessment that may require it."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      dueTime:
        type: date
      submissionTime:
        type: date
  Stakeholder:
    meaning: "A person, group, or organisation with an interest in an incident's outcome who may need communication."
    aliases:
      - érintett
    properties: {}
  Communication:
    meaning: "A message about an incident addressed to a stakeholder or audience and tracked through drafting, approval, and sending."
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
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentTime:
        type: date
  Post-Incident Review:
    meaning: "A review of an incident, its response, causes and lessons that can produce corrective actions."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOnDate:
        type: date
      findings:
        type: text
  Corrective Action:
    meaning: "A tracked follow-up from a post-incident review with its own owner, status and due date."
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
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
  Monitoring Tool:
    meaning: A tool operated by the network operations centre that monitors IT services and configuration items and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  Monitoring Rule:
    meaning: A rule executed by a monitoring tool that evaluates telemetry and may generate an alert.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Regulator:
    meaning: The authority to which a regulatory notification about an incident is submitted.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  Application:
    meaning: A software system implementing an IT service that may run on infrastructure components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Problem:
    meaning: "The underlying or potential cause of one or more incidents, which may not yet be diagnosed."
    aliases:
      - probléma
    properties: {}
  Known Error:
    meaning: Documentation of a diagnosed problem with a known cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  Release:
    meaning: "A governed package of approved changes introduced together, separate from the technical execution that delivers it."
    aliases:
      - kiadás
    properties: {}
  Organisational Unit:
    meaning: A unit accountable for following up a corrective action.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: IT Service
    meaning: The incident has a confirmed impact on this IT service.
    aliases: []
  - name: impacts
    from: Incident
    to: Business Service
    meaning: The incident has a confirmed impact on this business service.
    aliases: []
  - name: dependsOn
    from: Business Service
    to: IT Service
    meaning: The business service depends on this supporting IT service.
    aliases: []
  - name: deliveredThrough
    from: Business Service
    to: Customer Channel
    meaning: The business service is delivered through this customer channel without implying the channel is disrupted.
    aliases: []
  - name: runsOn
    from: IT Service
    to: Infrastructure Component
    meaning: The IT service runs on this infrastructure component as a documented technical dependency.
    aliases: []
  - name: dependsOn
    from: IT Service
    to: Third-Party Service
    meaning: The IT service depends on this third-party service.
    aliases: []
  - name: affects
    from: Incident
    to: Configuration Item
    meaning: The incident has an established effect on this configuration item.
    aliases: []
  - name: implementedBy
    from: IT Service
    to: Application
    meaning: The IT service is implemented by this application.
    aliases:
      - is implemented by
  - name: runsOn
    from: Application
    to: Infrastructure Component
    meaning: The application runs on this infrastructure component.
    aliases: []
  - name: executedBy
    from: Monitoring Rule
    to: Monitoring Tool
    meaning: The monitoring tool executes this rule to evaluate telemetry.
    aliases:
      - executes
  - name: generatedBy
    from: Alert
    to: Monitoring Rule
    meaning: This alert was generated by the rule when it has a monitoring-rule origin.
    aliases:
      - generates
  - name: triggeredBy
    from: Incident
    to: Alert
    meaning: "This incident was opened as a result of this alert, when that link is established."
    aliases:
      - triggers
  - name: correlatedFrom
    from: Incident
    to: Event
    meaning: This event has been established as correlated with the incident rather than merely concurrent.
    aliases:
      - is correlated with
  - name: operates
    from: Network Operations Centre
    to: Monitoring Tool
    meaning: The network operations centre operates this monitoring tool.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: IT Service
    meaning: The monitoring tool monitors this IT service.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: Configuration Item
    meaning: The monitoring tool monitors this configuration item.
    aliases: []
  - name: records
    from: Service Desk
    to: Incident
    meaning: The service desk records this incident arising from a user-reported issue.
    aliases: []
  - name: operates
    from: IT Operations Team
    to: IT Service
    meaning: The IT operations team operates this IT service.
    aliases: []
  - name: monitors
    from: Security Operations Centre
    to: Event
    meaning: "The centre actually monitors this event, which has been identified as a security event; this does not apply to all events."
    aliases:
      - monitors security event
  - name: owns
    from: Service Owner
    to: IT Service
    meaning: The service owner is accountable for this IT service across its lifecycle.
    aliases:
      - owned by
  - name: assignedTo
    from: Incident
    to: Resolver Group
    meaning: The incident has been assigned to this resolver group for diagnosis and restoration.
    aliases: []
  - name: memberOf
    from: On-Call Engineer
    to: Resolver Group
    meaning: The on-call engineer is a member of this resolver group.
    aliases:
      - belongs to
  - name: handledBy
    from: Incident
    to: On-Call Engineer
    meaning: This on-call engineer directly handles time-critical technical work on the incident.
    aliases: []
  - name: coordinatedBy
    from: Incident
    to: Incident Commander
    meaning: "The incident has an assigned commander before major-incident declaration; once declared, that commander coordinates the major-incident response."
    aliases:
      - commands major-incident response
  - name: coordinates
    from: Incident Response Team
    to: Incident
    meaning: "The incident response team coordinates this declared major incident, not every incident."
    aliases: []
  - name: memberOf
    from: Incident Commander
    to: Incident Response Team
    meaning: The incident commander is a member of the incident response team.
    aliases: []
  - name: handledWith
    from: Incident
    to: Runbook
    meaning: The runbook selected to guide response to this incident; selection does not establish safe execution.
    aliases: []
  - name: recoveredWith
    from: Incident
    to: Recovery Plan
    meaning: "The recovery plan selected for this incident, subject to checking its applicability and safety."
    aliases: []
  - name: recovers
    from: Recovery Plan
    to: IT Service
    meaning: The IT service that this recovery plan describes restoring.
    aliases: []
  - name: protects
    from: Backup Set
    to: Configuration Item
    meaning: The configuration item protected by this backup set.
    aliases: []
  - name: uses
    from: Recovery Plan
    to: Backup Set
    meaning: The backup set that this recovery plan may use in restoration.
    aliases: []
  - name: linkedTo
    from: Incident
    to: Problem
    meaning: The incident is linked to this underlying or potential problem.
    aliases: []
  - name: documentedBy
    from: Problem
    to: Known Error
    meaning: The problem has been diagnosed and documented by this known error.
    aliases: []
  - name: has
    from: Known Error
    to: Workaround
    meaning: The known error has this documented workaround.
    aliases: []
  - name: documentedIn
    from: Workaround
    to: Runbook
    meaning: The workaround is documented in this runbook; documentation does not establish safety for a particular incident.
    aliases: []
  - name: deployedIn
    from: IT Service
    to: Environment
    meaning: The IT service is deployed in this environment; this does not designate an approved failover target.
    aliases: []
  - name: belongsTo
    from: Configuration Item
    to: Environment
    meaning: The configuration item belongs to this environment; this does not designate an approved restore target.
    aliases: []
  - name: affects
    from: Change
    to: IT Service
    meaning: The change affects this IT service; this does not establish that it caused an incident.
    aliases: []
  - name: modifies
    from: Change
    to: Configuration Item
    meaning: The change modifies this configuration item; this does not establish incident causation.
    aliases: []
  - name: targets
    from: Deployment
    to: Environment
    meaning: The deployment targets this environment.
    aliases: []
  - name: deploys
    from: Deployment
    to: Application
    meaning: The deployment installs or activates this application.
    aliases: []
  - name: resolvedBy
    from: Incident
    to: Change
    meaning: "The incident was resolved by this change, not necessarily caused by it."
    aliases: []
  - name: implementedBy
    from: Change
    to: Release
    meaning: The change is included for implementation in this governed release; this does not prove a deployment succeeded.
    aliases: []
  - name: deliveredBy
    from: Release
    to: Deployment
    meaning: "The release is delivered by this deployment, whose execution must be checked separately."
    aliases: []
  - name: supportedBy
    from: Incident
    to: Evidence Item
    meaning: "This evidence item documents the incident and may substantiate a particular impact, classification, decision or recovery claim after checking its integrity."
    aliases:
      - documents
  - name: includes
    from: Regulatory Notification
    to: Evidence Item
    meaning: This evidence item is included in the regulatory submission; inclusion alone does not verify integrity or completeness.
    aliases: []
  - name: evaluatedBy
    from: Incident
    to: Materiality Assessment
    meaning: "The incident is evaluated by this assessment recording its reporting conclusion, rationale and applicable due time."
    aliases: []
  - name: triggers
    from: Materiality Assessment
    to: Regulatory Notification
    meaning: "The assessment's reporting conclusion calls for this notification without asserting its approval or submission."
    aliases: []
  - name: reports
    from: Regulatory Notification
    to: Incident
    meaning: The regulatory notification reports this incident.
    aliases: []
  - name: sentTo
    from: Regulatory Notification
    to: Regulator
    meaning: The regulatory notification is addressed to this regulator; the link does not itself mean submission occurred.
    aliases: []
  - name: notifies
    from: Incident
    to: Stakeholder
    meaning: The stakeholder is identified to receive notification about this incident; this link does not mean a message was delivered.
    aliases: []
  - name: communicatedThrough
    from: Incident
    to: Communication
    meaning: "The communication is about this incident and records a message used for its communication, whether drafted, approved or sent."
    aliases:
      - is about
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: The communication is addressed to this stakeholder; delivery must be checked separately.
    aliases: []
  - name: reviewedIn
    from: Incident
    to: Post-Incident Review
    meaning: "The incident is reviewed in this post-incident review, which may be scheduled or completed."
    aliases: []
  - name: produces
    from: Post-Incident Review
    to: Corrective Action
    meaning: The post-incident review produces this tracked corrective action.
    aliases: []
  - name: ownedBy
    from: Corrective Action
    to: Organisational Unit
    meaning: The organisational unit accountable for following up this corrective action; ownership does not prove completion or verification.
    aliases: []
  - name: concerns
    from: Alert
    to: IT Service
    meaning: The alert concerns this identified IT service; the link does not identify the responsible resolver group.
    aliases: []
  - name: concerns
    from: Alert
    to: Configuration Item
    meaning: The alert concerns this identified configuration item; the link does not establish support assignment or operator authorisation.
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - "The approved major-incident procedure's business-impact criteria have been checked and met; this model does not prescribe their thresholds."
      - "Incident status is not resolved, closed, or cancelled."
      - Incident severity is sev1-critical or sev2-high.
      - Incident impacts at least one identified IT Service.
      - Incident coordinatedBy an assigned Incident Commander has been established before declaration; this link alone does not mean declaration occurred.
  canAssignIncident:
    conditions:
      - Incident status is not closed or cancelled.
      - "The proposed Resolver Group's current support for an IT Service impacted by this Incident or a Configuration Item affected by this Incident has been confirmed from current support-assignment information; do not infer support from its name or past assignments."
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - Alert concerns an identified IT Service or Configuration Item.
      - "Current alert-routing and support information identifies the responsible Resolver Group for that concerned service or item and verifies the operator's authorisation for the group; detectionSource alone is insufficient. If the target, group or authorisation cannot be established, do not acknowledge."
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - The proposed containment scope and expected side effects have been recorded with the incident response.
      - The proposed containment steps have been approved for this incident; an unspecified instruction to contain it is not sufficient.
  canIsolateConfigurationItem:
    conditions:
      - Incident affects the proposed Configuration Item has been confirmed.
      - "The proposed isolation's impact has been assessed using the item's criticalityTier, actual dependencies and expected service impact; the tier alone is not permission or an automatic blocker."
      - A rollback or reconnection method is available and retained with the response record.
  canFailOverITService:
    conditions:
      - The IT Service to be failed over is impacted by the Incident.
      - Incident recoveredWith a Recovery Plan and that plan recovers this IT Service; verify the plan applies to the particular service.
      - "The proposed recovery Environment's current availability has been verified; IT Service deployedIn Environment alone does not designate or approve it as a recovery target."
      - The proposed data-recovery point has been checked and found acceptable for this failover; interpret the Recovery Plan recoveryPointObjective only with its unit from approved recovery documentation.
  canRestoreBackupSet:
    conditions:
      - Backup Set status is successful or verified.
      - Backup Set protects the target Configuration Item.
      - The proposed restore point has been approved for this restore.
      - The target Environment has been approved for this restore; Configuration Item belongsTo Environment alone does not confer approval.
  canExecuteEmergencyChange:
    conditions:
      - "The emergency-change workflow record verifies the Change's link to an active Incident and records why that Incident justifies the accelerated path; Incident resolvedBy Change is not a substitute."
      - Change implementationPlan and backoutPlan are present.
      - The Configuration Items modified by this Change have been identified.
      - "Verify explicit acceptance of the assessed risk in the emergency-change workflow; Change riskLevel (low, medium, high, or critical) alone does not establish acceptance."
      - The change to be implemented is approved under the governed emergency path; no separate approval limit or test is specified in this model.
  canSendCommunication:
    conditions:
      - "Communication audience and messageSummary are recorded, and its addressedTo Stakeholder is appropriate for the intended audience."
      - "The communication's message owner and approval state have been recorded and the applicable approval workflow permits sending; Communication status alone does not replace that check."
      - The message content has been checked against the latest verified Incident state reached through Incident communicatedThrough Communication.
  canSubmitRegulatoryNotification:
    conditions:
      - "The Incident evaluatedBy Materiality Assessment has result reportable, and that assessment triggers this Regulatory Notification."
      - Regulatory Notification status is approved.
      - Regulatory Notification reports the Incident and sentTo a Regulator have been verified.
      - "Required notification information and Evidence Items included in the Regulatory Notification are complete; each relied-on item's integrity has been checked rather than assumed from inclusion."
      - "Submission can occur before Regulatory Notification dueTime established under the approved reporting procedure; if it differs from Materiality Assessment reportingDueTime, the designated reporting function must reconcile and confirm the applicable deadline before submission."
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - "Each impacted IT Service and Business Service has healthState healthy, or acceptance of its residual condition has been verified and retained; health is checked against current evidence."
      - Incident supportedBy Evidence Items substantiate resolution and restoration and their integrity has been verified.
      - Required Stakeholders identified through Incident notifies Stakeholder have their required Communications completed and delivery checked through Incident communicatedThrough Communication and Communication addressedTo Stakeholder.
      - "If Incident majorIncidentFlag is true or Incident category is cybersecurity, its Post-Incident Review linked through Incident reviewedIn Post-Incident Review is scheduled in a verified review workflow or retained scheduling record, or has a heldOnDate confirming completion; outstanding Corrective Actions need not be closed."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set Alert status to acknowledged and record Alert acknowledgementTime; retain the acknowledgement record.
    verification: Read the Alert back to confirm status is acknowledged and check its recorded acknowledgementTime.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions:
      - canAssignIncident
    effect: Record the Incident assignedTo the selected Resolver Group after confirming its support for an impacted IT Service or affected Configuration Item; retain the assignment record.
    verification: Read the Incident back and confirm its assignedTo Resolver Group link identifies the selected group.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Set Incident majorIncidentFlag to true, record declarationTime, and initiate coordination and the communication cadence through Incident Response Team coordinates Incident and Incident communicatedThrough Communication; retain the declaration record. The Incident coordinatedBy Incident Commander link must be assigned before this action."
    verification: "Read the Incident back and confirm majorIncidentFlag is true, declarationTime is recorded, its coordinatedBy Incident Commander link remains assigned, and a related Communication record for the cadence exists."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: "Execute approved containment steps for the Incident; set Incident status to contained only after verifying containment indicators, retaining scope and expected side-effect assessment with the response record."
    verification: Confirm containment indicators before reading Incident status as contained; check remaining impacted IT Service and Business Service healthState against current evidence and retain verification; containment does not imply restoration.
  isolateConfigurationItem:
    input: Incident
    preconditions:
      - canIsolateConfigurationItem
    effect: "Isolate the specific Configuration Item reached through Incident affects Configuration Item from the defined networks or dependencies; retain the impact assessment and rollback or reconnection method with the response record, without inventing a Configuration Item state property."
    verification: Verify separation of that Configuration Item from the defined networks or dependencies and check remaining impacted IT Service and Business Service healthState against current evidence; retain the result.
  failOverITService:
    input: Incident
    preconditions:
      - canFailOverITService
    effect: Move the Incident-impacted IT Service covered by its Recovery Plan to the proposed Environment after verifying target availability and acceptable data-recovery point; retain the action checks and result without assuming the deployedIn link designates an approved target.
    verification: Check the affected IT Service healthState against current evidence and verify critical business transactions in the recovery Environment; retain both results.
  restoreBackupSet:
    input: Backup Set
    preconditions:
      - canRestoreBackupSet
    effect: Restore data from the Backup Set protecting the selected Configuration Item at the approved restore point in the approved Environment; retain approvals and execution record.
    verification: "Validate the restored data's integrity and the affected Application's functionality after restoration; retain the verification results."
  executeEmergencyChange:
    input: Change
    preconditions:
      - canExecuteEmergencyChange
    effect: "Implement the approved emergency Change and set Change status to the actual outcome, such as implemented, failed, or rolled-back; retain the execution record and implementation evidence in the emergency-change workflow, without treating Incident resolvedBy Change as emergency justification."
    verification: "Read back Change status, run the technical checks specified in Change implementationPlan, check the affected IT Service healthState against current evidence and retain the outcomes. Do not mark the Incident resolved or record Incident resolvedBy Change unless restoration has been separately established."
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - canSendCommunication
    effect: "Send the selected Communication reached through Incident communicatedThrough Communication under its approval workflow; record Communication sentTime and set Communication status to its actual outcome among the recorded choices, retaining the send record rather than assuming delivery."
    verification: "Read back Communication sentTime and status, confirm delivery through the communication workflow and archive the final message; retain the delivery record. Incident notifies Stakeholder identifies intended recipients but is not proof of delivery."
  submitRegulatoryNotification:
    input: Regulatory Notification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the approved Regulatory Notification that reports the Incident and is sentTo the Regulator; set its status to submitted, record submissionTime and retain the submission receipt in the reporting workflow."
    verification: "Read back Regulatory Notification status submitted and submissionTime, confirm receipt of the submission and retain it; subsequently confirm status accepted or record status rejected and remediation in the reporting workflow. Submitted is not accepted."
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: "Set Incident status to closed and record closedTime; retain the pre-closure determination about affected service health or accepted residual conditions, resolution and restoration Evidence Items, required Communications, and whether a Post-Incident Review was required and scheduled or completed."
    verification: "Read back Incident status closed and closedTime; recheck impacted IT Service and Business Service healthState or retained residual acceptance, integrity-checked resolution and restoration Evidence Items and completed required Communications; where a review was required under canCloseIncident, confirm verified scheduling or Post-Incident Review heldOnDate is retained."


# CONSISTENCY CHECK — 5 outstanding problem(s) in the whole model:
#   [warning] effect-verification-mismatch — Action "executeEmergencyChange" verifies Change.implementationPlan, but its effect never says that property changes.
#   [warning] unreachable-from-action-input — Action "acknowledgeAlert" has input class Alert, and its precondition canAcknowledgeAlert refers to Resolver Group, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its effect refers to Evidence Item, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its precondition canExecuteEmergencyChange refers to Incident, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreBackupSet" has input class Backup Set, and its verification refers to Application, which is only reachable against the direction of the relationships between them.

### Turn 124 — assistant

I checked the live canvas: **11 actions are recorded in total**. My previous turn added the close action and then updated that same action; it did not add 11 actions. The five outstanding warnings remain visible, including the external-routing and workflow paths you chose not to invent as relationships.

Now for the bounded missing-items pass. For **Incident**, we have its response stages, assigned and coordinating roles, evidence, communications, and review path. **Is there a subordinate part, lifecycle event, or input/output record of an Incident that we’ve missed and that the agent needs for one of the agreed questions or actions?** “No, those are covered” is a complete answer.

### Turn 125 — user

No additional subordinate record or lifecycle event is needed for the agreed questions and actions. The incident’s links to affected services and items, alerts and events, response roles, evidence, communications, and review cover those paths. The declared-major and cybersecurity distinctions remain on the incident response path, not in duplicate incident records.

### Turn 125 — assistant

For **Incident**, no additional part or lifecycle record is needed. Its major-incident and cybersecurity paths remain distinctions on the Incident, not duplicate records.

For **Business Service and IT Service**, we have health, delivery and dependency paths, and ownership. **Are we missing any responsible party, input/output, or measurement connected to either service that the agent needs for the agreed questions or actions?** “No, covered” is fine.

### Turn 126 — user

For the **agreed questions and actions**, no further service-level party, input/output record, or measurement is needed. We have the service owner for IT service accountability, separate health states for both services, and the delivery and dependency paths needed to assess impact and recovery.

I wouldn’t add a measurement merely because it could be useful: the failover and closure actions still require **current health and transaction verification**, not just a recorded target.

### Turn 126 — assistant

No additional service-level concept or measurement is needed. Current health and critical business-transaction verification remain action-time checks, not assumed from a target value.

For **Change, Release, and Deployment**, we have the governed package, technical execution path, affected services and items, deployment timing, and emergency-change checks. **Is there an earlier or later workflow stage, approval record, or output connected to these three that the agent needs for the agreed investigation or emergency-change action but we haven’t captured?** “No, covered” is fine.

### Turn 127 — user

No additional **class or direct connection** is needed for those agreed tasks. The change, release, and deployment path supports investigation; the emergency-change workflow must separately retain approval under its governing path, active-incident justification, explicit risk acceptance, and implementation evidence.

Those workflow records are essential to executing and verifying the emergency change, but their precise fields or separate approval-record type are not specified here. Don’t infer approval or causation from the release or deployment links.

### Turn 127 — assistant

For Change, Release, and Deployment, no additional class or direct connection is needed. The emergency-change workflow must still retain approval, active-Incident justification, risk acceptance, and implementation evidence; the current model does not specify separate fields or record types for them.

For **Alert, Event, and the monitoring path**, we have detection sources, concerned targets, the tool-and-rule path where applicable, and established Incident links. **Is there a missing input, responsible party, or output that the agent needs for alert acknowledgement or deciding which signals are relevant to an Incident?** “No, covered” is fine.

### Turn 128 — user

No further class or direct connection is needed for those tasks. Before acknowledging an alert, the agent still needs current routing information to identify the responsible resolver group and verify the operator’s authorisation; the alert’s concerned service or item does not supply that authorisation.

For relevance, use the incident’s triggering-alert and correlated-event links, supported by investigation—not matching timestamps or detection sources alone. If a monitoring signal is in doubt, verify the tool’s operation from current evidence.

### Turn 128 — assistant

No additional monitoring concept or connection is needed. Routing and operator authorization remain current external checks; Incident links and investigation establish signal relevance, not matching times or detection sources.

For **Recovery Plan, Backup Set, and Environment**, we have the plan-to-service and plan-to-backup paths, protected items, and deployment context. **Is there a missing input, output record, or measurement needed for the agreed failover and restore actions beyond the action-time approvals, target availability, recovery-point check, and post-action tests already named?** “No, covered” is fine.

### Turn 129 — user

No additional class or connection is needed for those actions. The recovery plan’s time and point objectives and review date, the backup set’s status and backup dates, and the environment type provide context. They do not replace the proposed target’s availability, the acceptable recovery point, or restore-point and target approvals.

After failover, verify service health and critical business transactions. After restore, verify data integrity and the affected application’s functionality; the restore workflow must identify that application. Retain the checks and results.

### Turn 129 — assistant

No further recovery class or connection is needed. The restore workflow still must identify the Application to test, and the plan objectives still need units from approved documentation before comparison.

For **Materiality Assessment and Regulatory Notification**, we have the Incident, assessment, notification, Regulator, and selected Evidence Item paths. **Is any related decision record, responsible party, or output missing that the agent needs to determine reportability, submit an approved notification, or verify its result?** “No, covered” is fine.

### Turn 130 — user

No additional class or direct connection is needed for those tasks. The **materiality assessment** holds the reporting conclusion, rationale, and due time; the **regulatory notification** holds its approval and submission state, due time, and submission time, and links to the incident, regulator, and included evidence.

The designated reporting function must reconcile any conflicting deadlines under the approved procedure. Submission also produces a **receipt**, which must be retained in the submission workflow; acceptance or rejection is then verified as a later notification outcome. Don’t infer either from the assessment alone.

### Turn 130 — assistant

No further reporting class or direct link is needed. The submission receipt stays in the workflow; acceptance or rejection remains a later notification outcome. Conflicting due times require the designated reporting function to reconcile them.

For **Communication and Stakeholder**, we have intended recipients, addressed messages, approval and sending state, and delivery checks. **Is there a missing responsible party, message-stage record, or output the agent needs for the agreed send-update action or closure check?** “No, covered” is fine.

### Turn 131 — user

No additional class or direct connection is needed. The communication record covers the message and its stage; the stakeholder link identifies whom it is addressed to. Before sending, identify the message owner, establish its approval state, and check the content against the latest verified incident state.

After sending, retain the sent time, delivery confirmation, and final archived message. For closure, verify that the communications required for that incident are complete; an intended-recipient link alone is not proof of delivery.

### Turn 131 — assistant

No further communication class or connection is needed. Sending and closure still depend on the workflow-held owner, approval, delivery confirmation, and archived final message.

For **Post-Incident Review and Corrective Action**, we have the Incident-to-review-to-action path, the action’s Organisational Unit owner, status, and due date. **Is a missing lifecycle stage, responsible party, or output needed to check closure readiness or find outstanding work from earlier incidents affecting the same IT Service?** “No, covered” is fine.

### Turn 132 — user

No further class or direct connection is needed. For closure, verify that the review required for a major or cybersecurity incident is **scheduled or completed**; a held-on date confirms completion, while scheduling needs its own retained workflow evidence.

For earlier outstanding work, follow prior incidents affecting the IT service through their reviews to corrective actions, then check each action’s status and owning organisational unit. An open action does not automatically block closure of the current incident.

### Turn 132 — assistant

The review-and-corrective-action path needs no additional class or direct connection. Scheduling evidence remains separate from the review’s held-on date, and an open action does not automatically block the current Incident’s closure.

One last bounded check covers two other central concepts: **Configuration Item** and **Evidence Item**. For isolating or restoring an item, and for relying on preserved evidence, are we missing any **component or dependency, responsible party, or characteristic value** that the agent needs beyond the recorded links, criticality tier, integrity details, and action-time checks? “No, covered” is fine.

### Turn 133 — user

No additional class, direct connection, or characteristic value is needed for those agreed tasks. For a **configuration item**, use its established incident link and criticality tier, then assess actual isolation impact and the rollback or reconnection method; for restore, confirm the backup protects the target and the proposed restore is approved.

For an **evidence item**, use its incident link, collection time, integrity status, and any recorded hash, then verify the particular artifact and what it substantiates. A recorded hash or status alone is not proof that it can be relied on.

### Turn 133 — assistant

The bounded missing-items pass found **no additional classes, connections, or values** needed for the agreed work. The action-time and workflow checks remain essential: they must not be replaced by a recorded status, link, or hash. I added nothing to the canvas in this pass.

**Is that an accurate recap of the missing-items pass before I test the recorded questions and actions against the live model?**

### Turn 134 — user

Yes, that accurately captures the bounded pass. No further modelled thing or link is needed for the agreed work; the remaining external and workflow checks are real requirements, not gaps to fill with invented fields. We can test the recorded questions and actions against those limits.

### Turn 134 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 134 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: What is the current health of each affected business service and supporting IT service?
  - id: cq3
    text: Which customer channels deliver the affected business services?
  - id: cq4
    text: "Which infrastructure and third-party services are on an affected IT service's dependency path?"
  - id: cq5
    text: Which configuration items are relevant along that dependency path?
  - id: cq6
    text: Which alerts and events are linked to an incident through its triggering alert or correlated events?
  - id: cq7
    text: Who owns an affected IT service?
  - id: cq8
    text: Which resolver group and on-call engineer should take an incident?
  - id: cq9
    text: "Does an incident meet the bank's criteria for a major-incident declaration?"
  - id: cq10
    text: Who should command the response to a major incident?
  - id: cq11
    text: "Which runbook, workaround, backup set, or recovery plan is applicable to an incident?"
  - id: cq12
    text: "Are the conditions for using a proposed runbook, workaround, backup set, or recovery plan safely met for this incident?"
  - id: cq13
    text: "Could a recent change or deployment have caused an incident, based on its classification and evidence?"
  - id: cq14
    text: "Has the incident's materiality been assessed, and what rationale was recorded?"
  - id: cq15
    text: "Is a regulatory notification required for the incident under the approved procedure and designated reporting function's conclusion?"
  - id: cq16
    text: When is any required regulatory notification due under the applicable reporting requirement?
  - id: cq17
    text: "What evidence supports an incident's impact, classification, decisions, and recovery, and is its integrity preserved?"
  - id: cq18
    text: "Which stakeholders need an incident update, and what has actually been communicated against the latest verified incident state?"
  - id: cq19
    text: "Is an incident ready to close, including restored service health or an accepted residual condition, restoration evidence, required communications, and any applicable post-incident review?"
  - id: cq20
    text: "Which corrective actions from post-incident reviews remain outstanding for the affected service, including actions from prior incidents?"
classes:
  Incident:
    meaning: A recorded disruption or security condition that may impact an IT service or business service.
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
      detectedTime:
        type: date
      majorIncidentFlag:
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
      resolvedTime:
        type: date
      closedTime:
        type: date
  Business Service:
    meaning: A capability the bank delivers to its users.
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
  IT Service:
    meaning: A service supporting bank capabilities whose operational health is tracked.
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
  Customer Channel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  Configuration Item:
    meaning: A component recorded in configuration-management scope.
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
  Third-Party Service:
    meaning: A service provided by an external party that an IT service can depend on.
    aliases:
      - külső szolgáltatás
      - outsourced service
    properties: {}
  Alert:
    meaning: A monitoring signal that may trigger an incident.
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
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases:
      - esemény
    properties:
      observedTime:
        type: date
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
  Infrastructure Component:
    meaning: "A component on which an IT service runs, whether or not it is recorded as a configuration item."
    aliases:
      - infrastruktúra-elem
    properties: {}
  Service Owner:
    meaning: The party accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  Resolver Group:
    meaning: A group assigned to diagnose and restore an incident.
    aliases:
      - support group
      - megoldócsoport
    properties: {}
  On-Call Engineer:
    meaning: A member of a resolver group who may perform time-critical technical work on an incident.
    aliases:
      - on-call
      - ügyeletes mérnök
    properties: {}
  Incident Commander:
    meaning: The person who commands a major incident and directs its coordination and decision cadence.
    aliases:
      - incident manager
      - MIM lead
      - incidensparancsnok
    properties: {}
  Service Desk:
    meaning: The team that records incidents arising from user-reported issues and triages and routes them before assignment.
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  IT Operations Team:
    meaning: The team operating IT services during day-to-day operations and response without automatic authority for every response action.
    aliases:
      - IT üzemeltetés
      - üzemeltetési csapat
    properties: {}
  Network Operations Centre:
    meaning: The team operating monitoring for network and infrastructure signals.
    aliases:
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  Security Operations Centre:
    meaning: "The team monitoring security events relevant to assessing an incident's security dimension."
    aliases:
      - SOC
      - biztonsági műveleti központ
    properties: {}
  Incident Response Team:
    meaning: The team coordinating a major incident under the incident command structure.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  Runbook:
    meaning: A guide for responding to an incident.
    aliases:
      - playbook
      - üzemeltetési eljárás
    properties: {}
  Workaround:
    meaning: A temporary measure that reduces incident impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  Backup Set:
    meaning: A set of backup data protecting particular configuration items that may be used in restoration.
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
  Recovery Plan:
    meaning: A plan for restoring an IT service that may use a backup set.
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
  Environment:
    meaning: An operating environment that may serve as an approved target for failover or restoration.
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
    meaning: A controlled modification that may be executed through a deployment or an accelerated emergency path.
    aliases:
      - változás
      - módosítás
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
          - rolled-back
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
  Deployment:
    meaning: The technical execution that installs or activates a change.
    aliases:
      - telepítés
      - élesítés
    properties:
      startTime:
        type: date
      completionTime:
        type: date
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
  Evidence Item:
    meaning: A particular preserved record or artifact whose integrity can be checked and whose support for an incident can be traced.
    aliases:
      - Evidence
      - bizonyíték
    properties:
      collectedTime:
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
  Materiality Assessment:
    meaning: "A recorded assessment of an incident's reporting conclusion, rationale, and applicable reporting due time determined under the approved procedure."
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  Regulatory Notification:
    meaning: "A formal submission about an incident to the regulator, distinct from the assessment that may require it."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      dueTime:
        type: date
      submissionTime:
        type: date
  Stakeholder:
    meaning: "A person, group, or organisation with an interest in an incident's outcome who may need communication."
    aliases:
      - érintett
    properties: {}
  Communication:
    meaning: "A message about an incident addressed to a stakeholder or audience and tracked through drafting, approval, and sending."
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
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentTime:
        type: date
  Post-Incident Review:
    meaning: "A review of an incident, its response, causes and lessons that can produce corrective actions."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOnDate:
        type: date
      findings:
        type: text
  Corrective Action:
    meaning: "A tracked follow-up from a post-incident review with its own owner, status and due date."
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
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
  Monitoring Tool:
    meaning: A tool operated by the network operations centre that monitors IT services and configuration items and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  Monitoring Rule:
    meaning: A rule executed by a monitoring tool that evaluates telemetry and may generate an alert.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Regulator:
    meaning: The authority to which a regulatory notification about an incident is submitted.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  Application:
    meaning: A software system implementing an IT service that may run on infrastructure components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Problem:
    meaning: "The underlying or potential cause of one or more incidents, which may not yet be diagnosed."
    aliases:
      - probléma
    properties: {}
  Known Error:
    meaning: Documentation of a diagnosed problem with a known cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  Release:
    meaning: "A governed package of approved changes introduced together, separate from the technical execution that delivers it."
    aliases:
      - kiadás
    properties: {}
  Organisational Unit:
    meaning: A unit accountable for following up a corrective action.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: IT Service
    meaning: The incident has a confirmed impact on this IT service.
    aliases: []
  - name: impacts
    from: Incident
    to: Business Service
    meaning: The incident has a confirmed impact on this business service.
    aliases: []
  - name: dependsOn
    from: Business Service
    to: IT Service
    meaning: The business service depends on this supporting IT service.
    aliases: []
  - name: deliveredThrough
    from: Business Service
    to: Customer Channel
    meaning: The business service is delivered through this customer channel without implying the channel is disrupted.
    aliases: []
  - name: runsOn
    from: IT Service
    to: Infrastructure Component
    meaning: The IT service runs on this infrastructure component as a documented technical dependency.
    aliases: []
  - name: dependsOn
    from: IT Service
    to: Third-Party Service
    meaning: The IT service depends on this third-party service.
    aliases: []
  - name: affects
    from: Incident
    to: Configuration Item
    meaning: The incident has an established effect on this configuration item.
    aliases: []
  - name: implementedBy
    from: IT Service
    to: Application
    meaning: The IT service is implemented by this application.
    aliases:
      - is implemented by
  - name: runsOn
    from: Application
    to: Infrastructure Component
    meaning: The application runs on this infrastructure component.
    aliases: []
  - name: executedBy
    from: Monitoring Rule
    to: Monitoring Tool
    meaning: The monitoring tool executes this rule to evaluate telemetry.
    aliases:
      - executes
  - name: generatedBy
    from: Alert
    to: Monitoring Rule
    meaning: This alert was generated by the rule when it has a monitoring-rule origin.
    aliases:
      - generates
  - name: triggeredBy
    from: Incident
    to: Alert
    meaning: "This incident was opened as a result of this alert, when that link is established."
    aliases:
      - triggers
  - name: correlatedFrom
    from: Incident
    to: Event
    meaning: This event has been established as correlated with the incident rather than merely concurrent.
    aliases:
      - is correlated with
  - name: operates
    from: Network Operations Centre
    to: Monitoring Tool
    meaning: The network operations centre operates this monitoring tool.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: IT Service
    meaning: The monitoring tool monitors this IT service.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: Configuration Item
    meaning: The monitoring tool monitors this configuration item.
    aliases: []
  - name: records
    from: Service Desk
    to: Incident
    meaning: The service desk records this incident arising from a user-reported issue.
    aliases: []
  - name: operates
    from: IT Operations Team
    to: IT Service
    meaning: The IT operations team operates this IT service.
    aliases: []
  - name: monitors
    from: Security Operations Centre
    to: Event
    meaning: "The centre actually monitors this event, which has been identified as a security event; this does not apply to all events."
    aliases:
      - monitors security event
  - name: owns
    from: Service Owner
    to: IT Service
    meaning: The service owner is accountable for this IT service across its lifecycle.
    aliases:
      - owned by
  - name: assignedTo
    from: Incident
    to: Resolver Group
    meaning: The incident has been assigned to this resolver group for diagnosis and restoration.
    aliases: []
  - name: memberOf
    from: On-Call Engineer
    to: Resolver Group
    meaning: The on-call engineer is a member of this resolver group.
    aliases:
      - belongs to
  - name: handledBy
    from: Incident
    to: On-Call Engineer
    meaning: This on-call engineer directly handles time-critical technical work on the incident.
    aliases: []
  - name: coordinatedBy
    from: Incident
    to: Incident Commander
    meaning: "The incident has an assigned commander before major-incident declaration; once declared, that commander coordinates the major-incident response."
    aliases:
      - commands major-incident response
  - name: coordinates
    from: Incident Response Team
    to: Incident
    meaning: "The incident response team coordinates this declared major incident, not every incident."
    aliases: []
  - name: memberOf
    from: Incident Commander
    to: Incident Response Team
    meaning: The incident commander is a member of the incident response team.
    aliases: []
  - name: handledWith
    from: Incident
    to: Runbook
    meaning: The runbook selected to guide response to this incident; selection does not establish safe execution.
    aliases: []
  - name: recoveredWith
    from: Incident
    to: Recovery Plan
    meaning: "The recovery plan selected for this incident, subject to checking its applicability and safety."
    aliases: []
  - name: recovers
    from: Recovery Plan
    to: IT Service
    meaning: The IT service that this recovery plan describes restoring.
    aliases: []
  - name: protects
    from: Backup Set
    to: Configuration Item
    meaning: The configuration item protected by this backup set.
    aliases: []
  - name: uses
    from: Recovery Plan
    to: Backup Set
    meaning: The backup set that this recovery plan may use in restoration.
    aliases: []
  - name: linkedTo
    from: Incident
    to: Problem
    meaning: The incident is linked to this underlying or potential problem.
    aliases: []
  - name: documentedBy
    from: Problem
    to: Known Error
    meaning: The problem has been diagnosed and documented by this known error.
    aliases: []
  - name: has
    from: Known Error
    to: Workaround
    meaning: The known error has this documented workaround.
    aliases: []
  - name: documentedIn
    from: Workaround
    to: Runbook
    meaning: The workaround is documented in this runbook; documentation does not establish safety for a particular incident.
    aliases: []
  - name: deployedIn
    from: IT Service
    to: Environment
    meaning: The IT service is deployed in this environment; this does not designate an approved failover target.
    aliases: []
  - name: belongsTo
    from: Configuration Item
    to: Environment
    meaning: The configuration item belongs to this environment; this does not designate an approved restore target.
    aliases: []
  - name: affects
    from: Change
    to: IT Service
    meaning: The change affects this IT service; this does not establish that it caused an incident.
    aliases: []
  - name: modifies
    from: Change
    to: Configuration Item
    meaning: The change modifies this configuration item; this does not establish incident causation.
    aliases: []
  - name: targets
    from: Deployment
    to: Environment
    meaning: The deployment targets this environment.
    aliases: []
  - name: deploys
    from: Deployment
    to: Application
    meaning: The deployment installs or activates this application.
    aliases: []
  - name: resolvedBy
    from: Incident
    to: Change
    meaning: "The incident was resolved by this change, not necessarily caused by it."
    aliases: []
  - name: implementedBy
    from: Change
    to: Release
    meaning: The change is included for implementation in this governed release; this does not prove a deployment succeeded.
    aliases: []
  - name: deliveredBy
    from: Release
    to: Deployment
    meaning: "The release is delivered by this deployment, whose execution must be checked separately."
    aliases: []
  - name: supportedBy
    from: Incident
    to: Evidence Item
    meaning: "This evidence item documents the incident and may substantiate a particular impact, classification, decision or recovery claim after checking its integrity."
    aliases:
      - documents
  - name: includes
    from: Regulatory Notification
    to: Evidence Item
    meaning: This evidence item is included in the regulatory submission; inclusion alone does not verify integrity or completeness.
    aliases: []
  - name: evaluatedBy
    from: Incident
    to: Materiality Assessment
    meaning: "The incident is evaluated by this assessment recording its reporting conclusion, rationale and applicable due time."
    aliases: []
  - name: triggers
    from: Materiality Assessment
    to: Regulatory Notification
    meaning: "The assessment's reporting conclusion calls for this notification without asserting its approval or submission."
    aliases: []
  - name: reports
    from: Regulatory Notification
    to: Incident
    meaning: The regulatory notification reports this incident.
    aliases: []
  - name: sentTo
    from: Regulatory Notification
    to: Regulator
    meaning: The regulatory notification is addressed to this regulator; the link does not itself mean submission occurred.
    aliases: []
  - name: notifies
    from: Incident
    to: Stakeholder
    meaning: The stakeholder is identified to receive notification about this incident; this link does not mean a message was delivered.
    aliases: []
  - name: communicatedThrough
    from: Incident
    to: Communication
    meaning: "The communication is about this incident and records a message used for its communication, whether drafted, approved or sent."
    aliases:
      - is about
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: The communication is addressed to this stakeholder; delivery must be checked separately.
    aliases: []
  - name: reviewedIn
    from: Incident
    to: Post-Incident Review
    meaning: "The incident is reviewed in this post-incident review, which may be scheduled or completed."
    aliases: []
  - name: produces
    from: Post-Incident Review
    to: Corrective Action
    meaning: The post-incident review produces this tracked corrective action.
    aliases: []
  - name: ownedBy
    from: Corrective Action
    to: Organisational Unit
    meaning: The organisational unit accountable for following up this corrective action; ownership does not prove completion or verification.
    aliases: []
  - name: concerns
    from: Alert
    to: IT Service
    meaning: The alert concerns this identified IT service; the link does not identify the responsible resolver group.
    aliases: []
  - name: concerns
    from: Alert
    to: Configuration Item
    meaning: The alert concerns this identified configuration item; the link does not establish support assignment or operator authorisation.
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - "The approved major-incident procedure's business-impact criteria have been checked and met; this model does not prescribe their thresholds."
      - "Incident status is not resolved, closed, or cancelled."
      - Incident severity is sev1-critical or sev2-high.
      - Incident impacts at least one identified IT Service.
      - Incident coordinatedBy an assigned Incident Commander has been established before declaration; this link alone does not mean declaration occurred.
  canAssignIncident:
    conditions:
      - Incident status is not closed or cancelled.
      - "The proposed Resolver Group's current support for an IT Service impacted by this Incident or a Configuration Item affected by this Incident has been confirmed from current support-assignment information; do not infer support from its name or past assignments."
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - Alert concerns an identified IT Service or Configuration Item.
      - "Current alert-routing and support information identifies the responsible Resolver Group for that concerned service or item and verifies the operator's authorisation for the group; detectionSource alone is insufficient. If the target, group or authorisation cannot be established, do not acknowledge."
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - The proposed containment scope and expected side effects have been recorded with the incident response.
      - The proposed containment steps have been approved for this incident; an unspecified instruction to contain it is not sufficient.
  canIsolateConfigurationItem:
    conditions:
      - Incident affects the proposed Configuration Item has been confirmed.
      - "The proposed isolation's impact has been assessed using the item's criticalityTier, actual dependencies and expected service impact; the tier alone is not permission or an automatic blocker."
      - A rollback or reconnection method is available and retained with the response record.
  canFailOverITService:
    conditions:
      - The IT Service to be failed over is impacted by the Incident.
      - Incident recoveredWith a Recovery Plan and that plan recovers this IT Service; verify the plan applies to the particular service.
      - "The proposed recovery Environment's current availability has been verified; IT Service deployedIn Environment alone does not designate or approve it as a recovery target."
      - The proposed data-recovery point has been checked and found acceptable for this failover; interpret the Recovery Plan recoveryPointObjective only with its unit from approved recovery documentation.
  canRestoreBackupSet:
    conditions:
      - Backup Set status is successful or verified.
      - Backup Set protects the target Configuration Item.
      - The proposed restore point has been approved for this restore.
      - The target Environment has been approved for this restore; Configuration Item belongsTo Environment alone does not confer approval.
  canExecuteEmergencyChange:
    conditions:
      - "The emergency-change workflow record verifies the Change's link to an active Incident and records why that Incident justifies the accelerated path; Incident resolvedBy Change is not a substitute."
      - Change implementationPlan and backoutPlan are present.
      - The Configuration Items modified by this Change have been identified.
      - "Verify explicit acceptance of the assessed risk in the emergency-change workflow; Change riskLevel (low, medium, high, or critical) alone does not establish acceptance."
      - The change to be implemented is approved under the governed emergency path; no separate approval limit or test is specified in this model.
  canSendCommunication:
    conditions:
      - "Communication audience and messageSummary are recorded, and its addressedTo Stakeholder is appropriate for the intended audience."
      - "The communication's message owner and approval state have been recorded and the applicable approval workflow permits sending; Communication status alone does not replace that check."
      - The message content has been checked against the latest verified Incident state reached through Incident communicatedThrough Communication.
  canSubmitRegulatoryNotification:
    conditions:
      - "The Incident evaluatedBy Materiality Assessment has result reportable, and that assessment triggers this Regulatory Notification."
      - Regulatory Notification status is approved.
      - Regulatory Notification reports the Incident and sentTo a Regulator have been verified.
      - "Required notification information and Evidence Items included in the Regulatory Notification are complete; each relied-on item's integrity has been checked rather than assumed from inclusion."
      - "Submission can occur before Regulatory Notification dueTime established under the approved reporting procedure; if it differs from Materiality Assessment reportingDueTime, the designated reporting function must reconcile and confirm the applicable deadline before submission."
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - "Each impacted IT Service and Business Service has healthState healthy, or acceptance of its residual condition has been verified and retained; health is checked against current evidence."
      - Incident supportedBy Evidence Items substantiate resolution and restoration and their integrity has been verified.
      - Required Stakeholders identified through Incident notifies Stakeholder have their required Communications completed and delivery checked through Incident communicatedThrough Communication and Communication addressedTo Stakeholder.
      - "If Incident majorIncidentFlag is true or Incident category is cybersecurity, its Post-Incident Review linked through Incident reviewedIn Post-Incident Review is scheduled in a verified review workflow or retained scheduling record, or has a heldOnDate confirming completion; outstanding Corrective Actions need not be closed."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set Alert status to acknowledged and record Alert acknowledgementTime; retain the acknowledgement record.
    verification: Read the Alert back to confirm status is acknowledged and check its recorded acknowledgementTime.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions:
      - canAssignIncident
    effect: Record the Incident assignedTo the selected Resolver Group after confirming its support for an impacted IT Service or affected Configuration Item; retain the assignment record.
    verification: Read the Incident back and confirm its assignedTo Resolver Group link identifies the selected group.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Set Incident majorIncidentFlag to true, record declarationTime, and initiate coordination and the communication cadence through Incident Response Team coordinates Incident and Incident communicatedThrough Communication; retain the declaration record. The Incident coordinatedBy Incident Commander link must be assigned before this action."
    verification: "Read the Incident back and confirm majorIncidentFlag is true, declarationTime is recorded, its coordinatedBy Incident Commander link remains assigned, and a related Communication record for the cadence exists."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: "Execute approved containment steps for the Incident; set Incident status to contained only after verifying containment indicators, retaining scope and expected side-effect assessment with the response record."
    verification: Confirm containment indicators before reading Incident status as contained; check remaining impacted IT Service and Business Service healthState against current evidence and retain verification; containment does not imply restoration.
  isolateConfigurationItem:
    input: Incident
    preconditions:
      - canIsolateConfigurationItem
    effect: "Isolate the specific Configuration Item reached through Incident affects Configuration Item from the defined networks or dependencies; retain the impact assessment and rollback or reconnection method with the response record, without inventing a Configuration Item state property."
    verification: Verify separation of that Configuration Item from the defined networks or dependencies and check remaining impacted IT Service and Business Service healthState against current evidence; retain the result.
  failOverITService:
    input: Incident
    preconditions:
      - canFailOverITService
    effect: Move the Incident-impacted IT Service covered by its Recovery Plan to the proposed Environment after verifying target availability and acceptable data-recovery point; retain the action checks and result without assuming the deployedIn link designates an approved target.
    verification: Check the affected IT Service healthState against current evidence and verify critical business transactions in the recovery Environment; retain both results.
  restoreBackupSet:
    input: Backup Set
    preconditions:
      - canRestoreBackupSet
    effect: Restore data from the Backup Set protecting the selected Configuration Item at the approved restore point in the approved Environment; retain approvals and execution record.
    verification: "Validate the restored data's integrity and the affected Application's functionality after restoration; retain the verification results."
  executeEmergencyChange:
    input: Change
    preconditions:
      - canExecuteEmergencyChange
    effect: "Implement the approved emergency Change and set Change status to the actual outcome, such as implemented, failed, or rolled-back; retain the execution record and implementation evidence in the emergency-change workflow, without treating Incident resolvedBy Change as emergency justification."
    verification: "Read back Change status, run the technical checks specified in Change implementationPlan, check the affected IT Service healthState against current evidence and retain the outcomes. Do not mark the Incident resolved or record Incident resolvedBy Change unless restoration has been separately established."
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - canSendCommunication
    effect: "Send the selected Communication reached through Incident communicatedThrough Communication under its approval workflow; record Communication sentTime and set Communication status to its actual outcome among the recorded choices, retaining the send record rather than assuming delivery."
    verification: "Read back Communication sentTime and status, confirm delivery through the communication workflow and archive the final message; retain the delivery record. Incident notifies Stakeholder identifies intended recipients but is not proof of delivery."
  submitRegulatoryNotification:
    input: Regulatory Notification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the approved Regulatory Notification that reports the Incident and is sentTo the Regulator; set its status to submitted, record submissionTime and retain the submission receipt in the reporting workflow."
    verification: "Read back Regulatory Notification status submitted and submissionTime, confirm receipt of the submission and retain it; subsequently confirm status accepted or record status rejected and remediation in the reporting workflow. Submitted is not accepted."
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: "Set Incident status to closed and record closedTime; retain the pre-closure determination about affected service health or accepted residual conditions, resolution and restoration Evidence Items, required Communications, and whether a Post-Incident Review was required and scheduled or completed."
    verification: "Read back Incident status closed and closedTime; recheck impacted IT Service and Business Service healthState or retained residual acceptance, integrity-checked resolution and restoration Evidence Items and completed required Communications; where a review was required under canCloseIncident, confirm verified scheduling or Post-Incident Review heldOnDate is retained."


# CONSISTENCY CHECK — 5 outstanding problem(s) in the whole model:
#   [warning] effect-verification-mismatch — Action "executeEmergencyChange" verifies Change.implementationPlan, but its effect never says that property changes.
#   [warning] unreachable-from-action-input — Action "acknowledgeAlert" has input class Alert, and its precondition canAcknowledgeAlert refers to Resolver Group, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its effect refers to Evidence Item, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its precondition canExecuteEmergencyChange refers to Incident, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreBackupSet" has input class Backup Set, and its verification refers to Application, which is only reachable against the direction of the relationships between them.

### Turn 134 — assistant

I checked the **20 questions and 11 actions persisted on the live canvas**. Here is the competency check. “Covered” means the model tells the agent what to follow and what to verify—not that it stores the answer for a particular incident.

| Question | Coverage |
|---|---|
| 1. Affected business services and channels | **Qualified:** follow confirmed Incident impact to Business Service, then its delivery channels; call a channel *confirmed affected* only if incident evidence verifies its disruption. |
| 2. Current service health | **Covered:** read each affected Business Service and IT Service’s separate `healthState`, checking current evidence. |
| 3. Channels delivering a service | **Covered:** Business Service → *delivered through* → Customer Channel. |
| 4. Infrastructure and third-party dependency path | **Covered:** follow IT Service → Application → Infrastructure Component, direct *runs on* links, and IT Service → Third-Party Service. |
| 5. Relevant configuration items | **Qualified:** check candidate components against current configuration-management scope; separately use Incident → *affects* → Configuration Item for established impact. |
| 6. Relevant alerts and events | **Covered:** use Incident → *triggered by* → Alert and Incident → *correlated from* → Event, not timing alone. |
| 7. Service owner | **Covered:** Service Owner → *owns* → IT Service. |
| 8. Group and engineer who should take an incident | **Qualified:** use affected service/item and current support information to choose the group; record *assigned to*. Check current on-call membership and handling separately; the recorded group assignment alone does not select an engineer. |
| 9. Major-incident criteria | **Qualified:** `canDeclareMajorIncident` checks state, severity, impacted IT Service, commander, and the approved procedure. Its business-impact thresholds are intentionally **not specified here**. |
| 10. Incident commander | **Covered:** verify the Incident’s assigned Commander link before declaration; declaration then records its flag and time. |
| 11. Applicable response resources | **Covered as candidate paths:** selected Runbook and Recovery Plan; Problem → Known Error → Workaround; Plan → Backup Set → protected item. |
| 12. Safe use | **Qualified:** candidate links do not confer safety. The failover and restore rules provide action-specific checks; runbook or workaround use still needs a check for the particular incident and proposed step. |
| 13. Possible change/deployment cause | **Covered as investigation, not proof:** compare affected services/items with Change scope, follow Change → Release → Deployment, and compare execution times with detected time and evidence. |
| 14. Materiality and rationale | **Covered:** Incident → Materiality Assessment, then its result and rationale. |
| 15. Reporting required | **Covered with external authority:** use the assessment’s result under the approved procedure and designated reporting function’s conclusion; do not infer it from severity. |
| 16. Notification due | **Covered with reconciliation:** use recorded assessment and notification due times; if they differ, obtain the reporting function’s confirmed deadline. |
| 17. Supporting evidence and integrity | **Covered:** follow Incident → Evidence Item, check the particular claim substantiated and verify artifact integrity; status or hash alone is insufficient. |
| 18. Stakeholders and actual communications | **Covered:** distinguish intended Stakeholders from linked Communications; check content against verified Incident state, sending, and delivery. |
| 19. Closure readiness | **Covered:** `canCloseIncident` checks state, current service health or accepted residual condition, integrity-checked restoration evidence, required communications, and review scheduling or completion where applicable. |
| 20. Earlier outstanding corrective actions | **Covered:** follow earlier Incidents impacting the same IT Service → Review → Corrective Action; check status and owning Organisational Unit. |

Each agreed action also has a recorded input, rule, effect, and verification:

| Action | What the agent uses and checks |
|---|---|
| Acknowledge Alert | `canAcknowledgeAlert`; set `acknowledged` and time; read back the Alert. Responsible-group routing and operator authorization require current external information. |
| Assign Incident | `canAssignIncident`; record and read back *assigned to* Resolver Group after current support is confirmed. |
| Declare major Incident | `canDeclareMajorIncident`; set flag and time, start cadence; verify commander and Communication record. |
| Contain Incident | `canContainIncident`; execute approved steps; set `contained` only after indicators are verified, then check remaining impact. |
| Isolate Configuration Item | `canIsolateConfigurationItem` on Incident; target its affected item; verify separation and remaining service health, retaining rollback details. |
| Fail over IT Service | `canFailOverITService` on Incident; verify plan, available target and recovery point; afterward check health and critical business transactions. |
| Restore Backup Set | `canRestoreBackupSet`; restore the protected item at approved point and target; verify data integrity and the Application identified by the restore workflow. |
| Execute emergency Change | `canExecuteEmergencyChange`; verify workflow-held justification, approval and risk acceptance; record actual Change outcome and check technical results and service health. |
| Send stakeholder update | `canSendCommunication` on Incident; send the selected Communication; check sent time, actual status and delivery, and archive the final message. |
| Submit Regulatory Notification | `canSubmitRegulatoryNotification`; set `submitted` and time, retain and confirm receipt; check later acceptance or rejection separately. |
| Close Incident | `canCloseIncident`; set `closed` and time; read back closure and the retained health, evidence, communication and applicable review checks. |

**Result:** all recorded requirements have an orientation and verification path, but several deliberately depend on current bank information or workflow records not represented as graph links. The canvas still reports **five warnings**: Alert-to-responsible-group routing; Change-to-active-Incident justification; Change implementation evidence; Backup Set-to-Application identification; and a likely text-matching warning because emergency-change verification *uses* `implementationPlan` rather than changing it. I have not converted any of those external checks into an unsupported direct link.

**Does this replay accurately distinguish what the model covers from what the agent must verify outside it?** After your correction or confirmation, I’ll run the separate final checklist and automated second opinion.

### Turn 135 — user

Yes. The replay distinguishes what the recorded paths can establish from what needs current bank information, workflow records, or live verification.

One wording adjustment: closure requires **recorded resolution and restoration evidence**. Verify the integrity of evidence you rely on, but don’t turn “integrity-checked restoration evidence” into a separate fixed closure rule. Otherwise, the replay is ready for your final checklist.

### Turn 135 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  canCloseIncident:\n    conditions:\n      - Incident status is resolved or monitoring.\n      - Each impacted IT Service and Business Service has healthState healthy, or acceptance of its residual condition has been verified and retained; health is checked against current evidence.\n      - Resolution and restoration Evidence Items are recorded through Incident supportedBy Evidence Item; check what each item substantiates and verify the integrity of any evidence relied on for closure.\n      - Required Stakeholders identified through Incident notifies Stakeholder have their required Communications completed and delivery checked through Incident communicatedThrough Communication and Communication addressedTo Stakeholder.\n      - If Incident majorIncidentFlag is true or Incident category is cybersecurity, its Post-Incident Review linked through Incident reviewedIn Post-Incident Review is scheduled in a verified review workflow or retained scheduling record, or has a heldOnDate confirming completion; outstanding Corrective Actions need not be closed.\nactions:\n  closeIncident:\n    input: Incident\n    preconditions: [canCloseIncident]\n    effect: Set Incident status to closed and record closedTime; retain the pre-closure determination about affected service health or accepted residual conditions, recorded resolution and restoration Evidence Items, required Communications, and whether a Post-Incident Review was required and scheduled or completed.\n    verification: Read back Incident status closed and closedTime; recheck impacted IT Service and Business Service healthState or retained residual acceptance, recorded resolution and restoration Evidence Items and completed required Communications; verify integrity of any evidence relied on, and where a review was required under canCloseIncident, confirm verified scheduling or Post-Incident Review heldOnDate is retained."
}
```

### Turn 135 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
5 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 135 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 135 — tool

competency_questions:
  - id: cq1
    text: Which business services and customer channels are affected by an incident?
  - id: cq2
    text: What is the current health of each affected business service and supporting IT service?
  - id: cq3
    text: Which customer channels deliver the affected business services?
  - id: cq4
    text: "Which infrastructure and third-party services are on an affected IT service's dependency path?"
  - id: cq5
    text: Which configuration items are relevant along that dependency path?
  - id: cq6
    text: Which alerts and events are linked to an incident through its triggering alert or correlated events?
  - id: cq7
    text: Who owns an affected IT service?
  - id: cq8
    text: Which resolver group and on-call engineer should take an incident?
  - id: cq9
    text: "Does an incident meet the bank's criteria for a major-incident declaration?"
  - id: cq10
    text: Who should command the response to a major incident?
  - id: cq11
    text: "Which runbook, workaround, backup set, or recovery plan is applicable to an incident?"
  - id: cq12
    text: "Are the conditions for using a proposed runbook, workaround, backup set, or recovery plan safely met for this incident?"
  - id: cq13
    text: "Could a recent change or deployment have caused an incident, based on its classification and evidence?"
  - id: cq14
    text: "Has the incident's materiality been assessed, and what rationale was recorded?"
  - id: cq15
    text: "Is a regulatory notification required for the incident under the approved procedure and designated reporting function's conclusion?"
  - id: cq16
    text: When is any required regulatory notification due under the applicable reporting requirement?
  - id: cq17
    text: "What evidence supports an incident's impact, classification, decisions, and recovery, and is its integrity preserved?"
  - id: cq18
    text: "Which stakeholders need an incident update, and what has actually been communicated against the latest verified incident state?"
  - id: cq19
    text: "Is an incident ready to close, including restored service health or an accepted residual condition, restoration evidence, required communications, and any applicable post-incident review?"
  - id: cq20
    text: "Which corrective actions from post-incident reviews remain outstanding for the affected service, including actions from prior incidents?"
classes:
  Incident:
    meaning: A recorded disruption or security condition that may impact an IT service or business service.
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
      detectedTime:
        type: date
      majorIncidentFlag:
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
      resolvedTime:
        type: date
      closedTime:
        type: date
  Business Service:
    meaning: A capability the bank delivers to its users.
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
  IT Service:
    meaning: A service supporting bank capabilities whose operational health is tracked.
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
  Customer Channel:
    meaning: A way customers access a business service.
    aliases:
      - ügyfélcsatorna
    properties: {}
  Configuration Item:
    meaning: A component recorded in configuration-management scope.
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
  Third-Party Service:
    meaning: A service provided by an external party that an IT service can depend on.
    aliases:
      - külső szolgáltatás
      - outsourced service
    properties: {}
  Alert:
    meaning: A monitoring signal that may trigger an incident.
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
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
  Event:
    meaning: An observed occurrence that may be correlated with an incident.
    aliases:
      - esemény
    properties:
      observedTime:
        type: date
      detectionSource:
        type: text
        allowed:
          - monitoring
          - siem
          - service-desk
          - user-report
          - vendor-report
          - automated-control
          - regulator
          - other
  Infrastructure Component:
    meaning: "A component on which an IT service runs, whether or not it is recorded as a configuration item."
    aliases:
      - infrastruktúra-elem
    properties: {}
  Service Owner:
    meaning: The party accountable for an IT service across its lifecycle.
    aliases:
      - szolgáltatásgazda
    properties: {}
  Resolver Group:
    meaning: A group assigned to diagnose and restore an incident.
    aliases:
      - support group
      - megoldócsoport
    properties: {}
  On-Call Engineer:
    meaning: A member of a resolver group who may perform time-critical technical work on an incident.
    aliases:
      - on-call
      - ügyeletes mérnök
    properties: {}
  Incident Commander:
    meaning: The person who commands a major incident and directs its coordination and decision cadence.
    aliases:
      - incident manager
      - MIM lead
      - incidensparancsnok
    properties: {}
  Service Desk:
    meaning: The team that records incidents arising from user-reported issues and triages and routes them before assignment.
    aliases:
      - help desk
      - ügyfélszolgálati IT pult
      - hibabejelentő
    properties: {}
  IT Operations Team:
    meaning: The team operating IT services during day-to-day operations and response without automatic authority for every response action.
    aliases:
      - IT üzemeltetés
      - üzemeltetési csapat
    properties: {}
  Network Operations Centre:
    meaning: The team operating monitoring for network and infrastructure signals.
    aliases:
      - NOC
      - hálózatüzemeltetési központ
    properties: {}
  Security Operations Centre:
    meaning: "The team monitoring security events relevant to assessing an incident's security dimension."
    aliases:
      - SOC
      - biztonsági műveleti központ
    properties: {}
  Incident Response Team:
    meaning: The team coordinating a major incident under the incident command structure.
    aliases:
      - IRT
      - incidenskezelő csapat
    properties: {}
  Runbook:
    meaning: A guide for responding to an incident.
    aliases:
      - playbook
      - üzemeltetési eljárás
    properties: {}
  Workaround:
    meaning: A temporary measure that reduces incident impact.
    aliases:
      - kerülőmegoldás
    properties: {}
  Backup Set:
    meaning: A set of backup data protecting particular configuration items that may be used in restoration.
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
  Recovery Plan:
    meaning: A plan for restoring an IT service that may use a backup set.
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
  Environment:
    meaning: An operating environment that may serve as an approved target for failover or restoration.
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
    meaning: A controlled modification that may be executed through a deployment or an accelerated emergency path.
    aliases:
      - változás
      - módosítás
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
          - rolled-back
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
  Deployment:
    meaning: The technical execution that installs or activates a change.
    aliases:
      - telepítés
      - élesítés
    properties:
      startTime:
        type: date
      completionTime:
        type: date
      status:
        type: text
        allowed:
          - planned
          - running
          - succeeded
          - failed
          - rolled-back
          - cancelled
  Evidence Item:
    meaning: A particular preserved record or artifact whose integrity can be checked and whose support for an incident can be traced.
    aliases:
      - Evidence
      - bizonyíték
    properties:
      collectedTime:
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
  Materiality Assessment:
    meaning: "A recorded assessment of an incident's reporting conclusion, rationale, and applicable reporting due time determined under the approved procedure."
    aliases:
      - reportability assessment
      - lényegességi értékelés
    properties:
      result:
        type: text
        allowed:
          - not-reportable
          - potentially-reportable
          - reportable
          - undetermined
      rationale:
        type: text
      reportingDueTime:
        type: date
  Regulatory Notification:
    meaning: "A formal submission about an incident to the regulator, distinct from the assessment that may require it."
    aliases:
      - supervisory notification
      - felügyeleti bejelentés
    properties:
      status:
        type: text
        allowed:
          - draft
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      dueTime:
        type: date
      submissionTime:
        type: date
  Stakeholder:
    meaning: "A person, group, or organisation with an interest in an incident's outcome who may need communication."
    aliases:
      - érintett
    properties: {}
  Communication:
    meaning: "A message about an incident addressed to a stakeholder or audience and tracked through drafting, approval, and sending."
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
          - pending-approval
          - approved
          - submitted
          - accepted
          - rejected
          - withdrawn
      sentTime:
        type: date
  Post-Incident Review:
    meaning: "A review of an incident, its response, causes and lessons that can produce corrective actions."
    aliases:
      - PIR
      - RCA review
      - incidens utóelemzés
    properties:
      heldOnDate:
        type: date
      findings:
        type: text
  Corrective Action:
    meaning: "A tracked follow-up from a post-incident review with its own owner, status and due date."
    aliases:
      - remediation action
      - helyesbítő intézkedés
    properties:
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
  Monitoring Tool:
    meaning: A tool operated by the network operations centre that monitors IT services and configuration items and executes monitoring rules.
    aliases:
      - monitoring platform
      - felügyeleti eszköz
    properties: {}
  Monitoring Rule:
    meaning: A rule executed by a monitoring tool that evaluates telemetry and may generate an alert.
    aliases:
      - alert rule
      - riasztási szabály
    properties: {}
  Regulator:
    meaning: The authority to which a regulatory notification about an incident is submitted.
    aliases:
      - supervisory authority
      - felügyeleti hatóság
    properties: {}
  Application:
    meaning: A software system implementing an IT service that may run on infrastructure components.
    aliases:
      - alkalmazás
      - app
    properties: {}
  Problem:
    meaning: "The underlying or potential cause of one or more incidents, which may not yet be diagnosed."
    aliases:
      - probléma
    properties: {}
  Known Error:
    meaning: Documentation of a diagnosed problem with a known cause or workaround.
    aliases:
      - ismert hiba
    properties: {}
  Release:
    meaning: "A governed package of approved changes introduced together, separate from the technical execution that delivers it."
    aliases:
      - kiadás
    properties: {}
  Organisational Unit:
    meaning: A unit accountable for following up a corrective action.
    aliases:
      - szervezeti egység
    properties: {}
relationships:
  - name: impacts
    from: Incident
    to: IT Service
    meaning: The incident has a confirmed impact on this IT service.
    aliases: []
  - name: impacts
    from: Incident
    to: Business Service
    meaning: The incident has a confirmed impact on this business service.
    aliases: []
  - name: dependsOn
    from: Business Service
    to: IT Service
    meaning: The business service depends on this supporting IT service.
    aliases: []
  - name: deliveredThrough
    from: Business Service
    to: Customer Channel
    meaning: The business service is delivered through this customer channel without implying the channel is disrupted.
    aliases: []
  - name: runsOn
    from: IT Service
    to: Infrastructure Component
    meaning: The IT service runs on this infrastructure component as a documented technical dependency.
    aliases: []
  - name: dependsOn
    from: IT Service
    to: Third-Party Service
    meaning: The IT service depends on this third-party service.
    aliases: []
  - name: affects
    from: Incident
    to: Configuration Item
    meaning: The incident has an established effect on this configuration item.
    aliases: []
  - name: implementedBy
    from: IT Service
    to: Application
    meaning: The IT service is implemented by this application.
    aliases:
      - is implemented by
  - name: runsOn
    from: Application
    to: Infrastructure Component
    meaning: The application runs on this infrastructure component.
    aliases: []
  - name: executedBy
    from: Monitoring Rule
    to: Monitoring Tool
    meaning: The monitoring tool executes this rule to evaluate telemetry.
    aliases:
      - executes
  - name: generatedBy
    from: Alert
    to: Monitoring Rule
    meaning: This alert was generated by the rule when it has a monitoring-rule origin.
    aliases:
      - generates
  - name: triggeredBy
    from: Incident
    to: Alert
    meaning: "This incident was opened as a result of this alert, when that link is established."
    aliases:
      - triggers
  - name: correlatedFrom
    from: Incident
    to: Event
    meaning: This event has been established as correlated with the incident rather than merely concurrent.
    aliases:
      - is correlated with
  - name: operates
    from: Network Operations Centre
    to: Monitoring Tool
    meaning: The network operations centre operates this monitoring tool.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: IT Service
    meaning: The monitoring tool monitors this IT service.
    aliases: []
  - name: monitors
    from: Monitoring Tool
    to: Configuration Item
    meaning: The monitoring tool monitors this configuration item.
    aliases: []
  - name: records
    from: Service Desk
    to: Incident
    meaning: The service desk records this incident arising from a user-reported issue.
    aliases: []
  - name: operates
    from: IT Operations Team
    to: IT Service
    meaning: The IT operations team operates this IT service.
    aliases: []
  - name: monitors
    from: Security Operations Centre
    to: Event
    meaning: "The centre actually monitors this event, which has been identified as a security event; this does not apply to all events."
    aliases:
      - monitors security event
  - name: owns
    from: Service Owner
    to: IT Service
    meaning: The service owner is accountable for this IT service across its lifecycle.
    aliases:
      - owned by
  - name: assignedTo
    from: Incident
    to: Resolver Group
    meaning: The incident has been assigned to this resolver group for diagnosis and restoration.
    aliases: []
  - name: memberOf
    from: On-Call Engineer
    to: Resolver Group
    meaning: The on-call engineer is a member of this resolver group.
    aliases:
      - belongs to
  - name: handledBy
    from: Incident
    to: On-Call Engineer
    meaning: This on-call engineer directly handles time-critical technical work on the incident.
    aliases: []
  - name: coordinatedBy
    from: Incident
    to: Incident Commander
    meaning: "The incident has an assigned commander before major-incident declaration; once declared, that commander coordinates the major-incident response."
    aliases:
      - commands major-incident response
  - name: coordinates
    from: Incident Response Team
    to: Incident
    meaning: "The incident response team coordinates this declared major incident, not every incident."
    aliases: []
  - name: memberOf
    from: Incident Commander
    to: Incident Response Team
    meaning: The incident commander is a member of the incident response team.
    aliases: []
  - name: handledWith
    from: Incident
    to: Runbook
    meaning: The runbook selected to guide response to this incident; selection does not establish safe execution.
    aliases: []
  - name: recoveredWith
    from: Incident
    to: Recovery Plan
    meaning: "The recovery plan selected for this incident, subject to checking its applicability and safety."
    aliases: []
  - name: recovers
    from: Recovery Plan
    to: IT Service
    meaning: The IT service that this recovery plan describes restoring.
    aliases: []
  - name: protects
    from: Backup Set
    to: Configuration Item
    meaning: The configuration item protected by this backup set.
    aliases: []
  - name: uses
    from: Recovery Plan
    to: Backup Set
    meaning: The backup set that this recovery plan may use in restoration.
    aliases: []
  - name: linkedTo
    from: Incident
    to: Problem
    meaning: The incident is linked to this underlying or potential problem.
    aliases: []
  - name: documentedBy
    from: Problem
    to: Known Error
    meaning: The problem has been diagnosed and documented by this known error.
    aliases: []
  - name: has
    from: Known Error
    to: Workaround
    meaning: The known error has this documented workaround.
    aliases: []
  - name: documentedIn
    from: Workaround
    to: Runbook
    meaning: The workaround is documented in this runbook; documentation does not establish safety for a particular incident.
    aliases: []
  - name: deployedIn
    from: IT Service
    to: Environment
    meaning: The IT service is deployed in this environment; this does not designate an approved failover target.
    aliases: []
  - name: belongsTo
    from: Configuration Item
    to: Environment
    meaning: The configuration item belongs to this environment; this does not designate an approved restore target.
    aliases: []
  - name: affects
    from: Change
    to: IT Service
    meaning: The change affects this IT service; this does not establish that it caused an incident.
    aliases: []
  - name: modifies
    from: Change
    to: Configuration Item
    meaning: The change modifies this configuration item; this does not establish incident causation.
    aliases: []
  - name: targets
    from: Deployment
    to: Environment
    meaning: The deployment targets this environment.
    aliases: []
  - name: deploys
    from: Deployment
    to: Application
    meaning: The deployment installs or activates this application.
    aliases: []
  - name: resolvedBy
    from: Incident
    to: Change
    meaning: "The incident was resolved by this change, not necessarily caused by it."
    aliases: []
  - name: implementedBy
    from: Change
    to: Release
    meaning: The change is included for implementation in this governed release; this does not prove a deployment succeeded.
    aliases: []
  - name: deliveredBy
    from: Release
    to: Deployment
    meaning: "The release is delivered by this deployment, whose execution must be checked separately."
    aliases: []
  - name: supportedBy
    from: Incident
    to: Evidence Item
    meaning: "This evidence item documents the incident and may substantiate a particular impact, classification, decision or recovery claim after checking its integrity."
    aliases:
      - documents
  - name: includes
    from: Regulatory Notification
    to: Evidence Item
    meaning: This evidence item is included in the regulatory submission; inclusion alone does not verify integrity or completeness.
    aliases: []
  - name: evaluatedBy
    from: Incident
    to: Materiality Assessment
    meaning: "The incident is evaluated by this assessment recording its reporting conclusion, rationale and applicable due time."
    aliases: []
  - name: triggers
    from: Materiality Assessment
    to: Regulatory Notification
    meaning: "The assessment's reporting conclusion calls for this notification without asserting its approval or submission."
    aliases: []
  - name: reports
    from: Regulatory Notification
    to: Incident
    meaning: The regulatory notification reports this incident.
    aliases: []
  - name: sentTo
    from: Regulatory Notification
    to: Regulator
    meaning: The regulatory notification is addressed to this regulator; the link does not itself mean submission occurred.
    aliases: []
  - name: notifies
    from: Incident
    to: Stakeholder
    meaning: The stakeholder is identified to receive notification about this incident; this link does not mean a message was delivered.
    aliases: []
  - name: communicatedThrough
    from: Incident
    to: Communication
    meaning: "The communication is about this incident and records a message used for its communication, whether drafted, approved or sent."
    aliases:
      - is about
  - name: addressedTo
    from: Communication
    to: Stakeholder
    meaning: The communication is addressed to this stakeholder; delivery must be checked separately.
    aliases: []
  - name: reviewedIn
    from: Incident
    to: Post-Incident Review
    meaning: "The incident is reviewed in this post-incident review, which may be scheduled or completed."
    aliases: []
  - name: produces
    from: Post-Incident Review
    to: Corrective Action
    meaning: The post-incident review produces this tracked corrective action.
    aliases: []
  - name: ownedBy
    from: Corrective Action
    to: Organisational Unit
    meaning: The organisational unit accountable for following up this corrective action; ownership does not prove completion or verification.
    aliases: []
  - name: concerns
    from: Alert
    to: IT Service
    meaning: The alert concerns this identified IT service; the link does not identify the responsible resolver group.
    aliases: []
  - name: concerns
    from: Alert
    to: Configuration Item
    meaning: The alert concerns this identified configuration item; the link does not establish support assignment or operator authorisation.
    aliases: []
rules:
  canDeclareMajorIncident:
    conditions:
      - "The approved major-incident procedure's business-impact criteria have been checked and met; this model does not prescribe their thresholds."
      - "Incident status is not resolved, closed, or cancelled."
      - Incident severity is sev1-critical or sev2-high.
      - Incident impacts at least one identified IT Service.
      - Incident coordinatedBy an assigned Incident Commander has been established before declaration; this link alone does not mean declaration occurred.
  canAssignIncident:
    conditions:
      - Incident status is not closed or cancelled.
      - "The proposed Resolver Group's current support for an IT Service impacted by this Incident or a Configuration Item affected by this Incident has been confirmed from current support-assignment information; do not infer support from its name or past assignments."
  canAcknowledgeAlert:
    conditions:
      - Alert status is new.
      - Alert concerns an identified IT Service or Configuration Item.
      - "Current alert-routing and support information identifies the responsible Resolver Group for that concerned service or item and verifies the operator's authorisation for the group; detectionSource alone is insufficient. If the target, group or authorisation cannot be established, do not acknowledge."
  canContainIncident:
    conditions:
      - Incident status is acknowledged or investigating.
      - The proposed containment scope and expected side effects have been recorded with the incident response.
      - The proposed containment steps have been approved for this incident; an unspecified instruction to contain it is not sufficient.
  canIsolateConfigurationItem:
    conditions:
      - Incident affects the proposed Configuration Item has been confirmed.
      - "The proposed isolation's impact has been assessed using the item's criticalityTier, actual dependencies and expected service impact; the tier alone is not permission or an automatic blocker."
      - A rollback or reconnection method is available and retained with the response record.
  canFailOverITService:
    conditions:
      - The IT Service to be failed over is impacted by the Incident.
      - Incident recoveredWith a Recovery Plan and that plan recovers this IT Service; verify the plan applies to the particular service.
      - "The proposed recovery Environment's current availability has been verified; IT Service deployedIn Environment alone does not designate or approve it as a recovery target."
      - The proposed data-recovery point has been checked and found acceptable for this failover; interpret the Recovery Plan recoveryPointObjective only with its unit from approved recovery documentation.
  canRestoreBackupSet:
    conditions:
      - Backup Set status is successful or verified.
      - Backup Set protects the target Configuration Item.
      - The proposed restore point has been approved for this restore.
      - The target Environment has been approved for this restore; Configuration Item belongsTo Environment alone does not confer approval.
  canExecuteEmergencyChange:
    conditions:
      - "The emergency-change workflow record verifies the Change's link to an active Incident and records why that Incident justifies the accelerated path; Incident resolvedBy Change is not a substitute."
      - Change implementationPlan and backoutPlan are present.
      - The Configuration Items modified by this Change have been identified.
      - "Verify explicit acceptance of the assessed risk in the emergency-change workflow; Change riskLevel (low, medium, high, or critical) alone does not establish acceptance."
      - The change to be implemented is approved under the governed emergency path; no separate approval limit or test is specified in this model.
  canSendCommunication:
    conditions:
      - "Communication audience and messageSummary are recorded, and its addressedTo Stakeholder is appropriate for the intended audience."
      - "The communication's message owner and approval state have been recorded and the applicable approval workflow permits sending; Communication status alone does not replace that check."
      - The message content has been checked against the latest verified Incident state reached through Incident communicatedThrough Communication.
  canSubmitRegulatoryNotification:
    conditions:
      - "The Incident evaluatedBy Materiality Assessment has result reportable, and that assessment triggers this Regulatory Notification."
      - Regulatory Notification status is approved.
      - Regulatory Notification reports the Incident and sentTo a Regulator have been verified.
      - "Required notification information and Evidence Items included in the Regulatory Notification are complete; each relied-on item's integrity has been checked rather than assumed from inclusion."
      - "Submission can occur before Regulatory Notification dueTime established under the approved reporting procedure; if it differs from Materiality Assessment reportingDueTime, the designated reporting function must reconcile and confirm the applicable deadline before submission."
  canCloseIncident:
    conditions:
      - Incident status is resolved or monitoring.
      - "Each impacted IT Service and Business Service has healthState healthy, or acceptance of its residual condition has been verified and retained; health is checked against current evidence."
      - Resolution and restoration Evidence Items are recorded through Incident supportedBy Evidence Item; check what each item substantiates and verify the integrity of any evidence relied on for closure.
      - Required Stakeholders identified through Incident notifies Stakeholder have their required Communications completed and delivery checked through Incident communicatedThrough Communication and Communication addressedTo Stakeholder.
      - "If Incident majorIncidentFlag is true or Incident category is cybersecurity, its Post-Incident Review linked through Incident reviewedIn Post-Incident Review is scheduled in a verified review workflow or retained scheduling record, or has a heldOnDate confirming completion; outstanding Corrective Actions need not be closed."
actions:
  acknowledgeAlert:
    input: Alert
    preconditions:
      - canAcknowledgeAlert
    effect: Set Alert status to acknowledged and record Alert acknowledgementTime; retain the acknowledgement record.
    verification: Read the Alert back to confirm status is acknowledged and check its recorded acknowledgementTime.
  assignIncidentToResolverGroup:
    input: Incident
    preconditions:
      - canAssignIncident
    effect: Record the Incident assignedTo the selected Resolver Group after confirming its support for an impacted IT Service or affected Configuration Item; retain the assignment record.
    verification: Read the Incident back and confirm its assignedTo Resolver Group link identifies the selected group.
  declareMajorIncident:
    input: Incident
    preconditions:
      - canDeclareMajorIncident
    effect: "Set Incident majorIncidentFlag to true, record declarationTime, and initiate coordination and the communication cadence through Incident Response Team coordinates Incident and Incident communicatedThrough Communication; retain the declaration record. The Incident coordinatedBy Incident Commander link must be assigned before this action."
    verification: "Read the Incident back and confirm majorIncidentFlag is true, declarationTime is recorded, its coordinatedBy Incident Commander link remains assigned, and a related Communication record for the cadence exists."
  containIncident:
    input: Incident
    preconditions:
      - canContainIncident
    effect: "Execute approved containment steps for the Incident; set Incident status to contained only after verifying containment indicators, retaining scope and expected side-effect assessment with the response record."
    verification: Confirm containment indicators before reading Incident status as contained; check remaining impacted IT Service and Business Service healthState against current evidence and retain verification; containment does not imply restoration.
  isolateConfigurationItem:
    input: Incident
    preconditions:
      - canIsolateConfigurationItem
    effect: "Isolate the specific Configuration Item reached through Incident affects Configuration Item from the defined networks or dependencies; retain the impact assessment and rollback or reconnection method with the response record, without inventing a Configuration Item state property."
    verification: Verify separation of that Configuration Item from the defined networks or dependencies and check remaining impacted IT Service and Business Service healthState against current evidence; retain the result.
  failOverITService:
    input: Incident
    preconditions:
      - canFailOverITService
    effect: Move the Incident-impacted IT Service covered by its Recovery Plan to the proposed Environment after verifying target availability and acceptable data-recovery point; retain the action checks and result without assuming the deployedIn link designates an approved target.
    verification: Check the affected IT Service healthState against current evidence and verify critical business transactions in the recovery Environment; retain both results.
  restoreBackupSet:
    input: Backup Set
    preconditions:
      - canRestoreBackupSet
    effect: Restore data from the Backup Set protecting the selected Configuration Item at the approved restore point in the approved Environment; retain approvals and execution record.
    verification: "Validate the restored data's integrity and the affected Application's functionality after restoration; retain the verification results."
  executeEmergencyChange:
    input: Change
    preconditions:
      - canExecuteEmergencyChange
    effect: "Implement the approved emergency Change and set Change status to the actual outcome, such as implemented, failed, or rolled-back; retain the execution record and implementation evidence in the emergency-change workflow, without treating Incident resolvedBy Change as emergency justification."
    verification: "Read back Change status, run the technical checks specified in Change implementationPlan, check the affected IT Service healthState against current evidence and retain the outcomes. Do not mark the Incident resolved or record Incident resolvedBy Change unless restoration has been separately established."
  sendStakeholderUpdate:
    input: Incident
    preconditions:
      - canSendCommunication
    effect: "Send the selected Communication reached through Incident communicatedThrough Communication under its approval workflow; record Communication sentTime and set Communication status to its actual outcome among the recorded choices, retaining the send record rather than assuming delivery."
    verification: "Read back Communication sentTime and status, confirm delivery through the communication workflow and archive the final message; retain the delivery record. Incident notifies Stakeholder identifies intended recipients but is not proof of delivery."
  submitRegulatoryNotification:
    input: Regulatory Notification
    preconditions:
      - canSubmitRegulatoryNotification
    effect: "Submit the approved Regulatory Notification that reports the Incident and is sentTo the Regulator; set its status to submitted, record submissionTime and retain the submission receipt in the reporting workflow."
    verification: "Read back Regulatory Notification status submitted and submissionTime, confirm receipt of the submission and retain it; subsequently confirm status accepted or record status rejected and remediation in the reporting workflow. Submitted is not accepted."
  closeIncident:
    input: Incident
    preconditions:
      - canCloseIncident
    effect: "Set Incident status to closed and record closedTime; retain the pre-closure determination about affected service health or accepted residual conditions, recorded resolution and restoration Evidence Items, required Communications, and whether a Post-Incident Review was required and scheduled or completed."
    verification: "Read back Incident status closed and closedTime; recheck impacted IT Service and Business Service healthState or retained residual acceptance, recorded resolution and restoration Evidence Items and completed required Communications; verify integrity of any evidence relied on, and where a review was required under canCloseIncident, confirm verified scheduling or Post-Incident Review heldOnDate is retained."


# CONSISTENCY CHECK — 5 outstanding problem(s) in the whole model:
#   [warning] effect-verification-mismatch — Action "executeEmergencyChange" verifies Change.implementationPlan, but its effect never says that property changes.
#   [warning] unreachable-from-action-input — Action "acknowledgeAlert" has input class Alert, and its precondition canAcknowledgeAlert refers to Resolver Group, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its effect refers to Evidence Item, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "executeEmergencyChange" has input class Change, and its precondition canExecuteEmergencyChange refers to Incident, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "restoreBackupSet" has input class Backup Set, and its verification refers to Application, which is only reachable against the direction of the relationships between them.

# SECOND-OPINION MODEL CHECK — 2 observation(s) from a separate automated review (report these to the expert, marked as model-derived, the same as the deterministic findings above; not authoritative on their own, but not to be dismissed without checking):
#   [property-enum-coherence] A Backup Set is defined as a set of backup data, but the allowed values scheduled and running describe the backup process rather than a state of that data set.
#   [property-enum-coherence] Communication is a message tracked through approval and sending, but the allowed values submitted and accepted describe the formal submission workflow of a Regulatory Notification rather than the message's sending state.

### Turn 135 — assistant

I updated **one closure rule and one closure action** to require recorded resolution and restoration evidence, while verifying the integrity of any evidence relied on. Integrity is not a separate new closure condition.

The final canvas check found that every class has a connection and every class and relationship has a meaning. The later-added classes had their paths checked; the named roles remain distinct; the controlled-choice properties have allowed lists; and the bounded missing-items pass was completed. The five existing warnings remain: four concern routing or workflow checks deliberately held outside graph links, and one appears to mistake **using** Change’s implementation plan for **changing** it.

A separate **automated second opinion** raised two points that need your review, not silent edits:

- `scheduled` and `running` may describe a backup process rather than the **Backup Set** itself.
- `submitted` and `accepted` may describe a formal notification workflow rather than a **Communication**.

**For Backup Set, does your team genuinely use `scheduled` and `running` as statuses of the set, or are they statuses of a backup execution tracked separately?** I’ll check the Communication observation next.

### Turn 136 — user

In this model, **scheduled** and **running** are valid statuses recorded on the **backup set**. They describe its backup lifecycle; we have not introduced a separate backup-execution record to carry them.

They are **not usable restore statuses**. For the restore action, the backup set must be **successful** or **verified**, and the other target and approval checks still apply.

### Turn 136 — assistant

That resolves the first automated observation: **`scheduled` and `running` are valid Backup Set statuses in your model**, but neither permits a restore. The existing restore rule still requires `successful` or `verified`, so no canvas change is needed.

For the second automated observation, **are `submitted` and `accepted` genuinely statuses of a Communication in your workflow, or were those choices intended only for Regulatory Notification?**

### Turn 137 — user

They are genuinely allowed **Communication** statuses as well, not just regulatory-notification statuses. A communication can move through **draft, pending-approval, approved, submitted, accepted, rejected, or withdrawn** in its applicable messaging workflow.

That does **not** make it a formal regulatory notification, and **submitted** alone does not prove delivery or acceptance. Keep the separate notification record and the post-send delivery check.

### Turn 137 — assistant

That resolves the second automated observation too. You confirmed that `submitted` and `accepted` are valid **Communication** statuses in the bank’s messaging workflow. A Communication remains distinct from a Regulatory Notification, and `submitted` does not prove delivery or acceptance. **Neither second-opinion observation calls for a canvas change.**

The final check is complete. The recorded model has **20 competency questions and 11 actions**. Every class has a connection; classes and relationships have meanings; the later-added classes’ paths were checked; and the agreed roles, fixed choices, rules, and action checks remain distinct. The bounded missing-items pass found nothing further to add.

**Known limits remain visible rather than being filled with invented links or fields:**

- Current routing and support information must identify the responsible Resolver Group before Alert acknowledgement or Incident assignment.
- The emergency-change workflow must supply the active-Incident justification and implementation evidence.
- The restore workflow must identify the Application to test afterward.
- The approved procedures must supply major-incident business-impact criteria and the units for recovery objectives; the reporting function must reconcile conflicting deadlines.

The canvas’s five warnings reflect those external paths, except for one text-matching warning: emergency-change verification **uses** the implementation plan for technical checks; execution does not change the plan. Where a required external check cannot be verified, the relevant action or its result verification remains blocked or incomplete.
