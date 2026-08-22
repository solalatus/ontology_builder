# Ontology-recovery eval — conversation log

Status: **app_agent_appears_finished** — 45 turn(s) so far, 429s elapsed.
Last updated: 2026-08-22T17:13:56.254Z

### Turn 0 — persona

I lead maintenance and reliability for a mid-size plant -- a fleet of physical assets that have to keep running, a small crew of maintenance techs, and a work-order system that tracks everything from routine upkeep to emergency fixes.  I came up doing the hands-on work before moving into planning and reliability, so I think in terms of *what state is this asset in right now*, *what caused it to get there*, and *who's qualified to fix it* -- not abstractions. Where would you like to start?

### Turn 1 — app-user

I lead maintenance and reliability for a mid-size plant -- a fleet of physical assets that have to keep running, a small crew of maintenance techs, and a work-order system that tracks everything from routine upkeep to emergency fixes.  I came up doing the hands-on work before moving into planning and reliability, so I think in terms of *what state is this asset in right now*, *what caused it to get there*, and *who's qualified to fix it* -- not abstractions. Where would you like to start?

### Turn 1 — app-tool

🔍 Checked the current ontology state.

### Turn 1 — app-assistant

Great — we’ll start with the acceptance test for the model: the real questions this agent must answer, and the actions it must support. We won’t define classes or fields yet.

Please give me your first batch of:
- 5–10 real questions the future agent should be able to answer, and
- 3–5 actions it should be able to help perform.

Phrase them the way you’d naturally ask in your work. For example, things like “what state is this asset in right now?” are exactly the right kind of input.

Short recap: the ontology is currently empty, so we’re starting from scratch. First we capture real questions and actions; then we derive the domain structure from those. Once we confirm a small batch, I’ll record it before we move on.

### Turn 1 — persona

Sure. If we’re starting from the shop-floor questions I actually need answered, I’d begin with these.

### Questions the agent should answer
1. What maintenance state is this item in right now?
2. Which items are currently operating normally, which are degraded, and which are failed?
3. What failure event put this item into a failed state?
4. Which failed items came from that same failure event?
5. What maintenance process does this work order describe?
6. What maintenance strategy is this maintenance process being carried out under?
7. What maintenance activities are included in this maintenance process?
8. What qualification is required for this maintenance activity?
9. Which qualified maintenance person can perform this activity?
10. What failure effects came from this failure event?

### Actions the agent should help perform
1. Classify an item as failed after a failure event.
2. Create a maintenance work order for a needed maintenance process.
3. Assign a qualified maintenance person to a maintenance activity.
4. Start a maintenance process once the strategy and work order are in place.
5. Close a maintenance work order after the work is completed and updated.

That’s a solid first cut. If you want, next we can tighten these by separating state, failure, and maintenance-work questions into groups.

### Turn 2 — app-user

Sure. If we’re starting from the shop-floor questions I actually need answered, I’d begin with these.

### Questions the agent should answer
1. What maintenance state is this item in right now?
2. Which items are currently operating normally, which are degraded, and which are failed?
3. What failure event put this item into a failed state?
4. Which failed items came from that same failure event?
5. What maintenance process does this work order describe?
6. What maintenance strategy is this maintenance process being carried out under?
7. What maintenance activities are included in this maintenance process?
8. What qualification is required for this maintenance activity?
9. Which qualified maintenance person can perform this activity?
10. What failure effects came from this failure event?

### Actions the agent should help perform
1. Classify an item as failed after a failure event.
2. Create a maintenance work order for a needed maintenance process.
3. Assign a qualified maintenance person to a maintenance activity.
4. Start a maintenance process once the strategy and work order are in place.
5. Close a maintenance work order after the work is completed and updated.

That’s a solid first cut. If you want, next we can tighten these by separating state, failure, and maintenance-work questions into groups.

### Turn 2 — app-assistant

Good first cut. I want to confirm these as the accepted starting batch before I persist them.

A few of them look atomic already; a few may need slight normalization so the agent requirement is general rather than tied to one phrasing. Here is the batch as I’d record it:

Questions
1. What maintenance state is an item in right now?
2. Which items are currently in normal, degraded, or failed operating condition?
3. Which failure event caused an item to enter a failed state?
4. Which items were caused to fail by the same failure event?
5. What maintenance process does a work order describe?
6. Which maintenance strategy governs a maintenance process?
7. Which maintenance activities are included in a maintenance process?
8. What qualification is required for a maintenance activity?
9. Which maintenance person is qualified to perform a maintenance activity?
10. What failure effects resulted from a failure event?

Actions
1. Classify an item as failed after a failure event.
2. Create a maintenance work order for a needed maintenance process.
3. Assign a qualified maintenance person to a maintenance activity.
4. Start a maintenance process once the strategy and work order are in place.
5. Close a maintenance work order after the work is completed and updated.

Please confirm either:
- “yes, record them as written”, or
- give corrections to any specific line.

After that, I’ll record them and ask one narrow follow-up about day-to-day roles and any operating context that changes how these are handled.

### Turn 2 — persona

Mostly yes, but I’d correct two question lines.

- **Question 2:** I’d record **“Which items are currently in operating, degraded, or failed state?”**  
  Reason: I’d avoid “normal” and “operating condition” there. The distinction I use day to day is operating, degraded, or failed.

- **Question 4:** I’d record **“Which failed states were caused by the same failure event?”**  
  If you want to keep it item-centered for your own notes, I understand why, but the cleaner target question is about the failed states tied to that event.

Everything else, I’d record as written.

### Turn 3 — app-user

Mostly yes, but I’d correct two question lines.

- **Question 2:** I’d record **“Which items are currently in operating, degraded, or failed state?”**  
  Reason: I’d avoid “normal” and “operating condition” there. The distinction I use day to day is operating, degraded, or failed.

- **Question 4:** I’d record **“Which failed states were caused by the same failure event?”**  
  If you want to keep it item-centered for your own notes, I understand why, but the cleaner target question is about the failed states tied to that event.

Everything else, I’d record as written.

### Turn 3 — app-tool

✓ Applied: 15 added, 0 updated.

### Turn 3 — app-assistant

Confirmed and recorded your 10 questions.

One correction on my side: I recorded the competency questions, but I should not have tried to persist the actions yet because we have not established the classes those action inputs depend on. The tool flagged that correctly. I’ll treat the actions as captured in the conversation for now and formalize them later once the classes exist.

Short recap of what we’ve captured so far:
- State-focused questions about an item’s current maintenance state and which items are operating, degraded, or failed.
- Failure-focused questions about which failure event caused a failed state, which failed states came from the same event, and what effects resulted.
- Maintenance-work questions about work orders, maintenance processes, strategies, activities, qualifications, and qualified maintenance people.
- Intended actions include classifying failure, creating and closing work orders, assigning qualified people, and starting a maintenance process.

Before moving to classes, I need one narrow follow-up:

For each role you’ve already named — here, mainly the maintenance person — is there a closely related role that actually does the day-to-day work under it, and does any of this depend on a specific operating context that changes how it’s handled?

### Turn 3 — app-system

The agent left 5 consistency problem(s) unresolved — see Check.

### Turn 3 — persona

For the slice we’ve captured so far, the one person-role I’d keep in scope is **qualified maintenance person** — meaning someone cleared to perform a specified maintenance activity.

I wouldn’t split out a second day-to-day worker role under that from what we’ve covered so far. In practice, yes, crews have planners, supervisors, techs, specialists and so on, but that’s outside what we’ve established here unless you want to model workforce organization separately. For these questions and actions, what matters is whether the person is qualified for the activity.

On operating context: the handling here does **not** depend on a special plant mode or environment in what we’ve captured so far. The logic stays the same:
- an item is in an operating, degraded, or failed state;
- a failure event can initiate a failed state and have effects;
- a maintenance process runs under a maintenance strategy;
- activities can require qualifications;
- only a qualified maintenance person should be assigned where that qualification applies.

So my short answer is: **no additional subordinate role is needed yet, and no special operating context is required to make this batch work.**

### Turn 4 — app-user

For the slice we’ve captured so far, the one person-role I’d keep in scope is **qualified maintenance person** — meaning someone cleared to perform a specified maintenance activity.

I wouldn’t split out a second day-to-day worker role under that from what we’ve covered so far. In practice, yes, crews have planners, supervisors, techs, specialists and so on, but that’s outside what we’ve established here unless you want to model workforce organization separately. For these questions and actions, what matters is whether the person is qualified for the activity.

On operating context: the handling here does **not** depend on a special plant mode or environment in what we’ve captured so far. The logic stays the same:
- an item is in an operating, degraded, or failed state;
- a failure event can initiate a failed state and have effects;
- a maintenance process runs under a maintenance strategy;
- activities can require qualifications;
- only a qualified maintenance person should be assigned where that qualification applies.

So my short answer is: **no additional subordinate role is needed yet, and no special operating context is required to make this batch work.**

### Turn 4 — app-assistant

Good — that settles the Phase 1 follow-up.

Recap of what is now confirmed for the acceptance test:
- No additional day-to-day worker role needs to be added yet beyond qualified maintenance person.
- No special operating context changes how this batch is handled.
- So the current scope remains centered on item state, failure event/failure effect, maintenance process/strategy/activity, work order, qualification, and qualified maintenance person.

Next we move to classes, derived only from the questions and actions you confirmed.

First small batch of candidate classes, each justified by a specific question or action:

1. Item  
   Needed for questions about current maintenance state, operating/degraded/failed state, and the action to classify an item as failed.

2. FailedState  
   Needed because you explicitly ask “Which failed states were caused by the same failure event?” That suggests failed state is something the agent must identify and connect, not just treat as a label on Item.

3. FailureEvent  
   Needed for questions about what event caused a failed state, which failed states came from the same event, what failure effects resulted, and the action of classifying an item as failed after a failure event.

4. FailureEffect  
   Needed for “What failure effects resulted from a failure event?”

For each of these, please tell me yes or no: does the agent need to identify, retrieve, connect, or pass this to a tool as its own thing? If any one should not stay as a separate class, say which one and why.

### Turn 4 — persona

Yes on **failed state**, **failure event**, and **failure effect**.

On **item**: the underlying idea is right, but I’d be a little more specific than just “item.” What matters here is the thing we maintain and whose state we track. So yes, the agent does need that as its own thing, but I wouldn’t leave it as a completely generic item if you’re naming it for the model.

Why these all stand on their own:

- **The maintained thing** needs to stand on its own because you need to ask what state it is in right now.
- **Failed state** needs to stand on its own because you’re not just storing a text flag; you need to connect a failed state back to the failure event that initiated it.
- **Failure event** stands on its own because it’s the cause point you trace from and to — what initiated the failed state, and what effects followed from it.
- **Failure effect** also stands on its own because it’s something you need to retrieve as a consequence of a specific failure event, not just a note field hanging off the event.

So I would keep all four ideas separate, with the one refinement that **“item” should be named more specifically as the kind of item that’s under maintenance responsibility.**

### Turn 5 — app-user

Yes on **failed state**, **failure event**, and **failure effect**.

On **item**: the underlying idea is right, but I’d be a little more specific than just “item.” What matters here is the thing we maintain and whose state we track. So yes, the agent does need that as its own thing, but I wouldn’t leave it as a completely generic item if you’re naming it for the model.

Why these all stand on their own:

- **The maintained thing** needs to stand on its own because you need to ask what state it is in right now.
- **Failed state** needs to stand on its own because you’re not just storing a text flag; you need to connect a failed state back to the failure event that initiated it.
- **Failure event** stands on its own because it’s the cause point you trace from and to — what initiated the failed state, and what effects followed from it.
- **Failure effect** also stands on its own because it’s something you need to retrieve as a consequence of a specific failure event, not just a note field hanging off the event.

So I would keep all four ideas separate, with the one refinement that **“item” should be named more specifically as the kind of item that’s under maintenance responsibility.**

### Turn 5 — app-assistant

Understood. I won’t keep the generic name “Item.”

One focused naming question before I record this batch:

What singular class name do you want for “the thing under maintenance responsibility whose state we track” — for example, would you call it Asset, EquipmentItem, MaintainedAsset, or something else in your own language?

### Turn 5 — persona

I’d call it a **maintainable item**. That’s the cleanest wording for this scope, because the point is that it’s the material thing whose function we retain or restore through maintenance.

### Turn 6 — app-user

I’d call it a **maintainable item**. That’s the cleanest wording for this scope, because the point is that it’s the material thing whose function we retain or restore through maintenance.

### Turn 6 — app-tool

🔍 Checked the current ontology state.

### Turn 6 — app-tool

✓ Applied: 4 added, 0 updated.

### Turn 6 — app-assistant

Recorded.

Recap of the first confirmed class batch:
- MaintainableItem — the material thing under maintenance responsibility whose function is retained or restored through maintenance.
- FailedState — kept separate because you need to connect a failed state to the failure event that initiated it.
- FailureEvent — the cause point you trace from.
- FailureEffect — a consequence you retrieve from a failure event, not just a note field.

Next small batch of candidate classes from the maintenance-work side:

1. WorkOrder  
   Needed for “What maintenance process does a work order describe?”, plus creating and closing a maintenance work order.

2. MaintenanceProcess  
   Needed for questions about what a work order describes, which strategy governs it, which activities it includes, and the action to start it.

3. MaintenanceStrategy  
   Needed for “Which maintenance strategy governs a maintenance process?”

4. MaintenanceActivity  
   Needed for questions about what activities are included in a maintenance process, what qualification is required, and who can perform it.

5. Qualification  
   Needed for “What qualification is required for a maintenance activity?”

Please confirm yes/no for each: does the agent need to identify, retrieve, connect, or pass it to a tool as its own thing? If any should not be a separate class, say which one.

### Turn 6 — persona

Yes on all five, with a little naming refinement on two of them.

- **Work order**: yes. It needs to stand on its own because you create it, close it, and use it to describe a maintenance process.
- **Maintenance process**: yes. That’s the piece governed by a strategy and made up of activities.
- **Maintenance strategy**: yes. It stands on its own because the process is carried out under it.
- **Maintenance activity**: yes. It stands on its own because qualifications and assignments attach at that level.
- **Qualification**: yes in substance, but I’d name it more precisely as a **qualification specification**. What the activity points to is the defined requirement, not just a loose idea of qualification.

One more naming note: for **work order**, I’d usually say **maintenance work order** if you want the class name to stay unambiguous in a broader model. But yes, it should absolutely be separate.

### Turn 7 — app-user

Yes on all five, with a little naming refinement on two of them.

- **Work order**: yes. It needs to stand on its own because you create it, close it, and use it to describe a maintenance process.
- **Maintenance process**: yes. That’s the piece governed by a strategy and made up of activities.
- **Maintenance strategy**: yes. It stands on its own because the process is carried out under it.
- **Maintenance activity**: yes. It stands on its own because qualifications and assignments attach at that level.
- **Qualification**: yes in substance, but I’d name it more precisely as a **qualification specification**. What the activity points to is the defined requirement, not just a loose idea of qualification.

One more naming note: for **work order**, I’d usually say **maintenance work order** if you want the class name to stay unambiguous in a broader model. But yes, it should absolutely be separate.

### Turn 7 — app-tool

🔍 Checked the current ontology state.

### Turn 7 — app-tool

✓ Applied: 5 added, 0 updated.

### Turn 7 — app-assistant

Recorded with your naming refinements.

Recap of the second confirmed class batch:
- MaintenanceWorkOrder
- MaintenanceProcess
- MaintenanceStrategy
- MaintenanceActivity
- QualificationSpecification

One more class question before we move to relationships:

You named “qualified maintenance person” in the competency questions. Should that be modeled as its own class named MaintenancePerson, with qualification handled through relationships/properties, or do you need a distinct class literally for QualifiedMaintenancePerson? In other words, does the agent need to identify the person as a separate thing, with “qualified” being something that can vary by activity/specification?

### Turn 7 — persona

For this scope, I’d keep **qualified maintenance person** as its own class.

Reason is practical: the question we need answered is not just “who is a maintenance person,” but **which qualified maintenance person can perform this maintenance activity**. Also, the assignment action depends on confirming that the person is qualified for that activity.

So yes, the person is a separate thing the agent needs to identify, and in the current scope I would keep the class specifically at the level of **qualified maintenance person**, not a broader maintenance person with the rest left implied.

### Turn 8 — app-user

For this scope, I’d keep **qualified maintenance person** as its own class.

Reason is practical: the question we need answered is not just “who is a maintenance person,” but **which qualified maintenance person can perform this maintenance activity**. Also, the assignment action depends on confirming that the person is qualified for that activity.

So yes, the person is a separate thing the agent needs to identify, and in the current scope I would keep the class specifically at the level of **qualified maintenance person**, not a broader maintenance person with the rest left implied.

### Turn 8 — app-tool

🔍 Checked the current ontology state.

### Turn 8 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 8 — app-assistant

Recorded.

Recap of the confirmed class set so far:
- MaintainableItem
- FailedState
- FailureEvent
- FailureEffect
- MaintenanceWorkOrder
- MaintenanceProcess
- MaintenanceStrategy
- MaintenanceActivity
- QualificationSpecification
- QualifiedMaintenancePerson

Now we start relationships. I’ll do this in a focused batch tied directly to your state and failure questions.

Please confirm the direction and wording for these candidate relationships:

1. MaintainableItem --hasMaintenanceState--> FailedState  
   For the questions about what state a maintainable item is in right now, and which failure event caused an item to enter a failed state.  
   Is this the right connection, or should the relationship point differently?

2. FailedState --wasCausedBy--> FailureEvent  
   For “Which failed states were caused by the same failure event?”  
   Is this the right direction and wording?

3. FailureEvent --resultsIn--> FailureEffect  
   For “What failure effects resulted from a failure event?”  
   Is this the right direction and wording?

Please answer line by line with keep/change, and if change, give the verb phrase you actually use.

### Turn 8 — persona

Line by line:

1. **Change.** The connection in substance is right, but I wouldn’t narrow it to **failed state** if the question is about the item’s current maintenance state in general. I’d put it as the maintainable item **has a maintenance state**. That covers operating, degraded, or failed.

2. **Change.** The direction you’ve chosen is fine in substance, but I’d usually phrase it from the event side: the **failure event initiates the failed state**. That wording matters because we’re talking about the event that begins that state.

3. **Change.** Same direction, but I’d use **has effect** rather than results in. For me, “results in” fits better when you’re talking about a process leading to a state. Here the cleaner wording is that the **failure event has effect** in the form of a failure effect.

### Turn 9 — app-user

Line by line:

1. **Change.** The connection in substance is right, but I wouldn’t narrow it to **failed state** if the question is about the item’s current maintenance state in general. I’d put it as the maintainable item **has a maintenance state**. That covers operating, degraded, or failed.

2. **Change.** The direction you’ve chosen is fine in substance, but I’d usually phrase it from the event side: the **failure event initiates the failed state**. That wording matters because we’re talking about the event that begins that state.

3. **Change.** Same direction, but I’d use **has effect** rather than results in. For me, “results in” fits better when you’re talking about a process leading to a state. Here the cleaner wording is that the **failure event has effect** in the form of a failure effect.

### Turn 9 — app-assistant

Good corrections. One important modeling point before I record them:

Your answer to line 1 implies a broader class that we do not yet have. If a maintainable item “has a maintenance state” covering operating, degraded, or failed, then the target class should be something like MaintenanceState, not FailedState alone. FailedState can still remain as its own class only if it captures something operationally distinct beyond just being one value in that broader state set.

So one focused question:

Do you want both of these as separate classes?
- MaintenanceState — the general state of a maintainable item, covering operating, degraded, or failed
- FailedState — a distinct thing that can be initiated by a failure event

Or should FailedState instead stop being a separate class and become one allowed value of MaintenanceState?

### Turn 9 — persona

I want **both** kept.

A **maintenance state** is the broader thing you use to ask, “what state is this item in right now?” across operating, degraded, or failed.

A **failed state** is still worth keeping separately because it has a specific connection to a **failure event** — the event initiates that failed state. You don’t have that same failure-event tie for every maintenance state in general.

So yes:
- keep **maintenance state** as the general state class, and
- keep **failed state** as a distinct kind of maintenance state with that operationally important link to a failure event.

### Turn 10 — app-user

I want **both** kept.

A **maintenance state** is the broader thing you use to ask, “what state is this item in right now?” across operating, degraded, or failed.

A **failed state** is still worth keeping separately because it has a specific connection to a **failure event** — the event initiates that failed state. You don’t have that same failure-event tie for every maintenance state in general.

So yes:
- keep **maintenance state** as the general state class, and
- keep **failed state** as a distinct kind of maintenance state with that operationally important link to a failure event.

### Turn 10 — app-tool

🔍 Checked the current ontology state.

### Turn 10 — app-tool

✓ Applied: 4 added, 0 updated.

### Turn 10 — app-assistant

Recorded.

Recap of the state/failure structure now captured:
- MaintainableItem --hasMaintenanceState--> MaintenanceState
- FailureEvent --initiates--> FailedState
- FailureEvent --hasEffect--> FailureEffect
- MaintenanceState is the general state concept.
- FailedState remains separate because it is specifically tied to a failure event.

Next relationship batch, tied to your maintenance-work questions and actions. Please confirm or correct these directions and verb phrases:

1. MaintenanceWorkOrder --describes--> MaintenanceProcess  
   For “What maintenance process does a work order describe?”

2. MaintenanceProcess --governedBy--> MaintenanceStrategy  
   For “Which maintenance strategy governs a maintenance process?”

3. MaintenanceProcess --includes--> MaintenanceActivity  
   For “Which maintenance activities are included in a maintenance process?”

4. MaintenanceActivity --requires--> QualificationSpecification  
   For “What qualification is required for a maintenance activity?”

5. QualifiedMaintenancePerson --isQualifiedFor--> MaintenanceActivity  
   This would support “Which qualified maintenance person can perform this activity?” as a direct, answerable connection.

6. MaintenanceActivity --assignedTo--> QualifiedMaintenancePerson  
   This is the separate recorded assignment fact needed for the action “Assign a qualified maintenance person to a maintenance activity.”

Please reply keep/change line by line.

### Turn 10 — persona

Line by line:

1. **Keep.** Maintenance work order **describes** maintenance process.

2. **Keep, with a wording tweak.** I’d say maintenance process is **governed by strategy**. That’s the phrasing I use.

3. **Change.** The idea is right, but I’d say maintenance process **has activity** rather than includes.

4. **Change.** I’d say maintenance activity **requires qualification**. Same idea, just tighter wording.

5. **Keep, with a wording tweak.** I’d say qualified maintenance person is **qualified for** maintenance activity.

6. **Change.** I would not record that from what we’ve established so far. We do need the action of assigning a qualified maintenance person to a maintenance activity, but this specific standing relationship hasn’t been part of the confirmed structure yet. At this stage I’d keep the action requirement and not force that exact relationship wording into the model unless you want to handle assignment facts explicitly in the next pass.

### Turn 11 — app-user

Line by line:

1. **Keep.** Maintenance work order **describes** maintenance process.

2. **Keep, with a wording tweak.** I’d say maintenance process is **governed by strategy**. That’s the phrasing I use.

3. **Change.** The idea is right, but I’d say maintenance process **has activity** rather than includes.

4. **Change.** I’d say maintenance activity **requires qualification**. Same idea, just tighter wording.

5. **Keep, with a wording tweak.** I’d say qualified maintenance person is **qualified for** maintenance activity.

6. **Change.** I would not record that from what we’ve established so far. We do need the action of assigning a qualified maintenance person to a maintenance activity, but this specific standing relationship hasn’t been part of the confirmed structure yet. At this stage I’d keep the action requirement and not force that exact relationship wording into the model unless you want to handle assignment facts explicitly in the next pass.

### Turn 11 — app-assistant

That’s clear.

I can record lines 1–5 now. For line 6, I agree not to force it just because the action exists; we should ask it explicitly as an assignment fact rather than smuggling it in.

One focused follow-up before I record this batch:

For the action “assign a qualified maintenance person to a maintenance activity,” once the assignment is made, does the model need an explicit relationship that records that fact between MaintenanceActivity and QualifiedMaintenancePerson? If yes, what verb phrase do you want for that recorded assignment?

### Turn 11 — persona

Yes — if you want the system to remember the outcome of the assignment action, then you do need an explicit recorded link.

I’d phrase it as the **maintenance activity is assigned to qualified maintenance person**, or from the other side, the **qualified maintenance person is assigned to maintenance activity**.

If you want a single verb phrase to record, I’d use **assigned to**.

### Turn 12 — app-user

Yes — if you want the system to remember the outcome of the assignment action, then you do need an explicit recorded link.

I’d phrase it as the **maintenance activity is assigned to qualified maintenance person**, or from the other side, the **qualified maintenance person is assigned to maintenance activity**.

If you want a single verb phrase to record, I’d use **assigned to**.

### Turn 12 — app-tool

🔍 Checked the current ontology state.

### Turn 12 — app-tool

✓ Applied: 6 added, 0 updated.

### Turn 12 — app-assistant

Recorded most of that batch, and the tool raised one warning I do want to check rather than ignore.

Short recap of what is now captured:
- MaintenanceWorkOrder --describes--> MaintenanceProcess
- MaintenanceProcess --governedByStrategy--> MaintenanceStrategy
- MaintenanceProcess --hasActivity--> MaintenanceActivity
- MaintenanceActivity --requiresQualification--> QualificationSpecification
- QualifiedMaintenancePerson --qualifiedFor--> MaintenanceActivity
- MaintenanceActivity --assignedTo--> QualifiedMaintenancePerson

The warning says the last two may look like inverse forms of the same connection. In your meaning, I think they are actually different facts:
- qualifiedFor = capability/eligibility
- assignedTo = actual assignment outcome

If that’s right, the warning is not a real contradiction.

Please confirm this explicitly:
Are these two genuinely different relationships in your domain — one for being qualified to do an activity, and one for being assigned to do it?

### Turn 12 — persona

Yes, they’re genuinely different.

- **Qualified for** is about **capability or authorization** — the person is cleared to perform that kind of maintenance activity.
- **Assigned to** is about the **actual work allocation** — this person has been put on this specific activity.

A person can be **qualified for** an activity and not be **assigned to** it.
And once you assign someone, you still want to know separately that they were actually **qualified for** that activity.

So the warning is just noticing they connect the same two kinds of things, but in the work we do those are not the same fact.

### Turn 13 — app-user

Yes, they’re genuinely different.

- **Qualified for** is about **capability or authorization** — the person is cleared to perform that kind of maintenance activity.
- **Assigned to** is about the **actual work allocation** — this person has been put on this specific activity.

A person can be **qualified for** an activity and not be **assigned to** it.
And once you assign someone, you still want to know separately that they were actually **qualified for** that activity.

So the warning is just noticing they connect the same two kinds of things, but in the work we do those are not the same fact.

### Turn 13 — app-assistant

Confirmed — I’ll treat that warning as not a real contradiction.

Recap of the relationship picture so far:
- State/failure:
  - MaintainableItem --hasMaintenanceState--> MaintenanceState
  - FailureEvent --initiates--> FailedState
  - FailureEvent --hasEffect--> FailureEffect
- Maintenance-work:
  - MaintenanceWorkOrder --describes--> MaintenanceProcess
  - MaintenanceProcess --governedByStrategy--> MaintenanceStrategy
  - MaintenanceProcess --hasActivity--> MaintenanceActivity
  - MaintenanceActivity --requiresQualification--> QualificationSpecification
  - QualifiedMaintenancePerson --qualifiedFor--> MaintenanceActivity
  - MaintenanceActivity --assignedTo--> QualifiedMaintenancePerson

There is still one obvious gap in the failure side, based on your confirmed questions: cq3 asks which failure event caused an item to enter a failed state. Right now we have:
- MaintainableItem -> MaintenanceState
- FailureEvent -> FailedState

But we do not yet have a direct relationship between FailedState and MaintainableItem, which is needed to connect the item’s failed state to the initiating event.

One focused question:
How do you want to relate FailedState to MaintainableItem?

Candidate wording:
- FailedState --appliesTo--> MaintainableItem
or
- MaintainableItem --hasFailedState--> FailedState

Which direction and verb phrase fits your real-world language better?

### Turn 13 — persona

I’d put it from the item side:

**Maintainable item — has maintenance state — maintenance state**

and then, where that state is specifically a failed state, that gives you the connection you need.

If you want the more specific link stated explicitly as well, then **maintainable item — has failed state — failed state** is the more natural phrasing for me, not “failed state applies to item.” I think from the asset side first.

### Turn 14 — app-user

I’d put it from the item side:

**Maintainable item — has maintenance state — maintenance state**

and then, where that state is specifically a failed state, that gives you the connection you need.

If you want the more specific link stated explicitly as well, then **maintainable item — has failed state — failed state** is the more natural phrasing for me, not “failed state applies to item.” I think from the asset side first.

### Turn 14 — app-assistant

Good — that means the direct item-to-failed-state link is needed as its own fact, not just inferred from the broader maintenance-state relationship.

Please confirm this specific relationship so I can record it:

- MaintainableItem --hasFailedState--> FailedState

If confirmed, that will let the model directly support:
- which failure event caused an item to enter a failed state, via  
  MaintainableItem --hasFailedState--> FailedState and  
  FailureEvent --initiates--> FailedState.

### Turn 14 — persona

Yes, record that. The maintainable item **has failed state** failed state, and that gives you the direct path back to the failure event that **initiates** it.

### Turn 15 — app-user

Yes, record that. The maintainable item **has failed state** failed state, and that gives you the direct path back to the failure event that **initiates** it.

### Turn 15 — app-tool

🔍 Checked the current ontology state.

### Turn 15 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 15 — app-assistant

Recorded.

Recap of the failure-side structure now:
- MaintainableItem --hasMaintenanceState--> MaintenanceState
- MaintainableItem --hasFailedState--> FailedState
- FailureEvent --initiates--> FailedState
- FailureEvent --hasEffect--> FailureEffect

That closes the direct path needed for the question about which failure event caused an item to enter a failed state.

Before moving on to properties, there is still a relationship gap tied to your action “create a maintenance work order for a needed maintenance process.” Right now we have a work order that describes a maintenance process, but not the direct connection that supports creating the work order for that process as the process needing work.

One focused question:
Do you want to use the same existing relationship for that action — MaintenanceWorkOrder --describes--> MaintenanceProcess — as the recorded link created by the action, or is there a second, distinct relationship you use, such as:
- MaintenanceWorkOrder --isFor--> MaintenanceProcess

Which wording reflects the real fact you want recorded when the work order is created?

### Turn 15 — persona

Use the existing one: **maintenance work order describes maintenance process**.

That’s the recorded fact I care about when the work order is created. I wouldn’t add a second “is for” link unless you have some separate business need for it.

### Turn 16 — app-user

Use the existing one: **maintenance work order describes maintenance process**.

That’s the recorded fact I care about when the work order is created. I wouldn’t add a second “is for” link unless you have some separate business need for it.

### Turn 16 — app-assistant

Good — we’ll keep just the one relationship there.

Recap before Phase 4:
- We have a confirmed class set and a connected relationship backbone.
- We are not adding a second work-order/process relationship “just in case.”
- The remaining known tool errors are from actions being formalized too early; we’ll repair those once we capture enough structure to set their inputs properly.

Now we move to decision-bearing properties only — values the agent needs to identify, filter, compare, explain, or act on.

First property batch, tied directly to your confirmed questions about state:

1. MaintenanceState needs some way to represent which kind of state it is, since you ask which items are in operating, degraded, or failed state.  
   Candidate property: stateType on MaintenanceState with allowed values [operating, degraded, failed]

2. Do you need any additional property beyond that to answer “What maintenance state is this item in right now?”, or is the relationship to a MaintenanceState plus its stateType enough for the current scope?

Please answer:
- keep/change for property 1, and
- yes/no for whether any other state property is needed right now.

### Turn 16 — persona

1. **Change slightly.** Keep the property, but I’d call it **state category** rather than state type. And yes, the allowed values should be **operating, degraded, failed**.

2. **No**, nothing else is needed right now for this scope. The item’s link to a maintenance state, plus that state category, is enough to answer the current state questions we’ve captured.

### Turn 17 — app-user

1. **Change slightly.** Keep the property, but I’d call it **state category** rather than state type. And yes, the allowed values should be **operating, degraded, failed**.

2. **No**, nothing else is needed right now for this scope. The item’s link to a maintenance state, plus that state category, is enough to answer the current state questions we’ve captured.

### Turn 17 — app-tool

🔍 Checked the current ontology state.

### Turn 17 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 17 — app-assistant

Recorded.

Recap of the first property decision:
- MaintenanceState.stateCategory with allowed values:
  - operating
  - degraded
  - failed
- No other state property is needed right now for the confirmed questions.

Next property batch, focused on classes the agent tracks over time rather than just looks up.

For each of these, do you need a current-state/status property to support monitoring, acting, or closing work?
1. MaintenanceWorkOrder — likely some current status such as open/closed or similar
2. MaintenanceProcess — likely some current status such as not started/in progress/completed or similar
3. MaintenanceActivity — do you need its own current status in this scope, or not yet?

Please answer each one separately with:
- yes/no
- and if yes, the property name you’d use and the allowed values if you already know them.

### Turn 17 — persona

For the scope we’ve established so far:

1. **Maintenance work order — no**, not as a required modeled property yet.  
   We do have the action to close a maintenance work order, but from what we’ve captured, the important recorded facts are that the work order describes the maintenance process and that it gets updated with performed task information and final cost when closed. I wouldn’t invent an open/closed status list unless you want to extend the scope.

2. **Maintenance process — no**, not yet.  
   We do start the process, but the confirmed structure so far doesn’t require a separate process-status property to answer the questions we already have.

3. **Maintenance activity — no**, not yet.  
   We need the activity itself, its required qualification, and who is qualified or assigned. We have not yet established a separate activity status as something the agent must track.

So for all three: **no additional current-status property should be added yet on the evidence we have.**

### Turn 18 — app-user

For the scope we’ve established so far:

1. **Maintenance work order — no**, not as a required modeled property yet.  
   We do have the action to close a maintenance work order, but from what we’ve captured, the important recorded facts are that the work order describes the maintenance process and that it gets updated with performed task information and final cost when closed. I wouldn’t invent an open/closed status list unless you want to extend the scope.

2. **Maintenance process — no**, not yet.  
   We do start the process, but the confirmed structure so far doesn’t require a separate process-status property to answer the questions we already have.

3. **Maintenance activity — no**, not yet.  
   We need the activity itself, its required qualification, and who is qualified or assigned. We have not yet established a separate activity status as something the agent must track.

So for all three: **no additional current-status property should be added yet on the evidence we have.**

### Turn 18 — app-assistant

Understood. I won’t add status properties just by habit.

One check before I accept the work-order exclusion as settled: you confirmed the action “Close a maintenance work order after the work is completed and updated.” Without some modeled way to tell whether the work order is closed, what will let the agent verify that action succeeded?

What existing or intended property or relationship should support that verification, instead of a work-order status?

### Turn 18 — persona

For that action, the verification I care about is not “does a status flag now say closed?” but whether the **maintenance work order record has been updated to reflect completion of the maintenance process**.

The evidence for that, in the scope we’ve got, is:
- the work order contains the **completed task information**, and
- the work order contains the **final cost**.

So I would support verification through the work-order record content, not through a separate status field we haven’t otherwise needed.

### Turn 19 — app-user

For that action, the verification I care about is not “does a status flag now say closed?” but whether the **maintenance work order record has been updated to reflect completion of the maintenance process**.

The evidence for that, in the scope we’ve got, is:
- the work order contains the **completed task information**, and
- the work order contains the **final cost**.

So I would support verification through the work-order record content, not through a separate status field we haven’t otherwise needed.

### Turn 19 — app-assistant

That’s a solid alternative, and it’s justified by the action.

Next focused property question, then:

On MaintenanceWorkOrder, do you want these two properties recorded for the close-work-order action verification?
1. completedTaskInformation
2. finalCost

Please confirm yes/no for each. If yes to finalCost, tell me whether it should be a number and what unit/currency label you want to use in the model.

### Turn 19 — persona

1. **Completed task information** — I wouldn’t record it under that exact property name yet. The underlying need is right, but the work order already needs to carry what was done, and I’d want to anchor that in the task details we’ve already been using rather than add a new loosely named field.

2. **Final cost** — **no** as a separate property name for now. We do need the work order to contain the final cost at close, but for the current scope I’d keep that under a general **cost** property rather than split out a second dedicated cost field.

So the need is real, but I’d handle it with existing work-order detail fields rather than introduce those two exact new property names.

### Turn 20 — app-user

1. **Completed task information** — I wouldn’t record it under that exact property name yet. The underlying need is right, but the work order already needs to carry what was done, and I’d want to anchor that in the task details we’ve already been using rather than add a new loosely named field.

2. **Final cost** — **no** as a separate property name for now. We do need the work order to contain the final cost at close, but for the current scope I’d keep that under a general **cost** property rather than split out a second dedicated cost field.

So the need is real, but I’d handle it with existing work-order detail fields rather than introduce those two exact new property names.

### Turn 20 — app-assistant

Understood. That means we should first pin down the actual work-order properties you want, rather than accept or reject my placeholder names.

Please give me the property names you do want on MaintenanceWorkOrder, limited to what is needed for the confirmed actions and questions so far.

From what you just said, I expect at least:
- a property for the task details / what was done
- a property for cost

What exact names would you use for those two? And for cost, should it be a number with a unit/currency label?

### Turn 20 — persona

Yes — for the maintenance work order, the two property names I’d use are:

- **task description** for the task details / what was done
- **cost** for the cost

For **cost**, yes, treat it as a **number**. I would not hard-code a currency label into this scope unless your organization’s governing data standard requires one. The currency handling is policy or implementation dependent, not something I’d invent here.

### Turn 21 — app-user

Yes — for the maintenance work order, the two property names I’d use are:

- **task description** for the task details / what was done
- **cost** for the cost

For **cost**, yes, treat it as a **number**. I would not hard-code a currency label into this scope unless your organization’s governing data standard requires one. The currency handling is policy or implementation dependent, not something I’d invent here.

### Turn 21 — app-tool

🔍 Checked the current ontology state.

### Turn 21 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 21 — app-assistant

Recorded.

Recap of the work-order properties now captured:
- MaintenanceWorkOrder.taskDescription : text
- MaintenanceWorkOrder.cost : number
- No separate status field, completed-task-information field, or final-cost field added beyond what the confirmed actions actually require.

Next property batch, still kept tight to your confirmed requirements:

1. QualificationSpecification  
   Do you need a property on this class to identify which qualification it is, such as a qualification name/code/label, or is the class itself enough for this scope?

2. FailureEffect  
   Do you need a property on this class to describe the effect, or is the class as a connected object enough for now?

3. FailureEvent  
   Do you need any property on this class yet to identify or compare events for the confirmed questions, or not yet?

Please answer 1–3 separately with yes/no, and if yes, the property name(s) you’d use.

### Turn 21 — persona

1. **Qualification specification — no**, not yet.  
   For the current scope, the important fact is that a maintenance activity requires a qualification specification. We haven’t yet established a separate identifier or label property as necessary to answer the confirmed questions.

2. **Failure effect — no**, not yet.  
   Right now, what matters is the connection from the failure event to its failure effects.

3. **Failure event — no**, not yet.  
   For the questions we’ve confirmed, the event mainly serves as the thing that initiates a failed state and has effects. We haven’t yet needed extra event properties to answer those questions.

So for all three: **no additional properties should be added yet on the evidence we have.**

### Turn 22 — app-user

1. **Qualification specification — no**, not yet.  
   For the current scope, the important fact is that a maintenance activity requires a qualification specification. We haven’t yet established a separate identifier or label property as necessary to answer the confirmed questions.

2. **Failure effect — no**, not yet.  
   Right now, what matters is the connection from the failure event to its failure effects.

3. **Failure event — no**, not yet.  
   For the questions we’ve confirmed, the event mainly serves as the thing that initiates a failed state and has effects. We haven’t yet needed extra event properties to answer those questions.

So for all three: **no additional properties should be added yet on the evidence we have.**

### Turn 22 — app-assistant

Understood. I won’t add identifier/label properties “just in case.”

Short recap of Phase 4 so far:
- Added:
  - MaintenanceState.stateCategory = operating | degraded | failed
  - MaintenanceWorkOrder.taskDescription
  - MaintenanceWorkOrder.cost
- Explicitly not added yet:
  - status properties on work order, process, or activity
  - identifier/label properties on qualification specification, failure effect, or failure event

Next we should do the language layer: short plain meanings for classes and relationships, then aliases separately. This is a repeating pattern, so I’ll batch the first few class meanings.

Please give a one-sentence plain meaning for these five classes:
1. MaintainableItem
2. MaintenanceState
3. FailedState
4. FailureEvent
5. FailureEffect

One sentence each, in your own working language.

### Turn 22 — persona

1. **Maintainable item** — a material item whose function is retained or restored through maintenance.

2. **Maintenance state** — a state during which an item’s functions and capabilities, or the level at which they are carried out, stay unchanged.

3. **Failed state** — a state in which an item cannot perform a required function because of a failure event.

4. **Failure event** — an event that causes an item to lose its ability to perform a required function.

5. **Failure effect** — a process that happens as a consequence of a failure, either within the failed item or beyond it.

### Turn 23 — app-user

1. **Maintainable item** — a material item whose function is retained or restored through maintenance.

2. **Maintenance state** — a state during which an item’s functions and capabilities, or the level at which they are carried out, stay unchanged.

3. **Failed state** — a state in which an item cannot perform a required function because of a failure event.

4. **Failure event** — an event that causes an item to lose its ability to perform a required function.

5. **Failure effect** — a process that happens as a consequence of a failure, either within the failed item or beyond it.

### Turn 23 — app-tool

🔍 Checked the current ontology state.

### Turn 23 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 23 — app-assistant

Recorded.

Recap of the first class-meaning batch:
- MaintainableItem, MaintenanceState, FailedState, FailureEvent, and FailureEffect now all have plain meanings.

Next class-meaning batch — please give one sentence each for:
1. MaintenanceWorkOrder
2. MaintenanceProcess
3. MaintenanceStrategy
4. MaintenanceActivity
5. QualificationSpecification
6. QualifiedMaintenancePerson

### Turn 23 — persona

1. **Maintenance work order** — a record that describes a maintenance process.

2. **Maintenance process** — a process concerned with retaining or restoring the function of a maintainable item under a maintenance strategy.

3. **Maintenance strategy** — a maintenance approach intended to help an asset achieve the desired objectives.

4. **Maintenance activity** — a maintenance process that is a single task to retain or restore the function of a maintainable item.

5. **Qualification specification** — a requirement specification that says a person must have an assessed skill for a specific task.

6. **Qualified maintenance person** — a person who is qualified to perform a specified maintenance activity.

### Turn 24 — app-user

1. **Maintenance work order** — a record that describes a maintenance process.

2. **Maintenance process** — a process concerned with retaining or restoring the function of a maintainable item under a maintenance strategy.

3. **Maintenance strategy** — a maintenance approach intended to help an asset achieve the desired objectives.

4. **Maintenance activity** — a maintenance process that is a single task to retain or restore the function of a maintainable item.

5. **Qualification specification** — a requirement specification that says a person must have an assessed skill for a specific task.

6. **Qualified maintenance person** — a person who is qualified to perform a specified maintenance activity.

### Turn 24 — app-tool

🔍 Checked the current ontology state.

### Turn 24 — app-tool

✓ Applied: 0 added, 6 updated.

### Turn 24 — app-assistant

Recorded.

Recap:
- All classes now have plain-language meanings.

Next, relationship meanings. Please give one sentence each for these five relationships:
1. hasMaintenanceState
2. hasFailedState
3. initiates
4. hasEffect
5. describes

Just one plain meaning sentence per relationship.

### Turn 24 — persona

1. **Has maintenance state** — the maintainable item is in that maintenance state.

2. **Has failed state** — the maintainable item is in that failed state.

3. **Initiates** — the failure event begins the failed state.

4. **Has effect** — the failure event has that failure effect as a consequence.

5. **Describes** — the maintenance work order describes the maintenance process.

### Turn 25 — app-user

1. **Has maintenance state** — the maintainable item is in that maintenance state.

2. **Has failed state** — the maintainable item is in that failed state.

3. **Initiates** — the failure event begins the failed state.

4. **Has effect** — the failure event has that failure effect as a consequence.

5. **Describes** — the maintenance work order describes the maintenance process.

### Turn 25 — app-tool

🔍 Checked the current ontology state.

### Turn 25 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 25 — app-assistant

Recorded.

Next relationship-meaning batch — one sentence each for:
1. governedByStrategy
2. hasActivity
3. requiresQualification
4. qualifiedFor
5. assignedTo

Please give the plain meanings in your own wording.

### Turn 25 — persona

1. **Governed by strategy** — the maintenance process is carried out under that maintenance strategy.

2. **Has activity** — the maintenance process includes that maintenance activity as one of its tasks.

3. **Requires qualification** — the maintenance activity requires that qualification specification to be satisfied.

4. **Qualified for** — the qualified maintenance person is qualified to perform that maintenance activity.

5. **Assigned to** — the maintenance activity is assigned to that qualified maintenance person.

### Turn 26 — app-user

1. **Governed by strategy** — the maintenance process is carried out under that maintenance strategy.

2. **Has activity** — the maintenance process includes that maintenance activity as one of its tasks.

3. **Requires qualification** — the maintenance activity requires that qualification specification to be satisfied.

4. **Qualified for** — the qualified maintenance person is qualified to perform that maintenance activity.

5. **Assigned to** — the maintenance activity is assigned to that qualified maintenance person.

### Turn 26 — app-tool

🔍 Checked the current ontology state.

### Turn 26 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 26 — app-assistant

Recorded.

Recap:
- All classes and all current relationships now have meaning sentences.

Now aliases/synonyms, asked separately as required. Please tell me any aliases that are actually used in your setting for this class batch, or say “none” for any that don’t have one:

1. MaintainableItem
2. MaintenanceWorkOrder
3. MaintenanceProcess
4. MaintenanceActivity
5. QualifiedMaintenancePerson

Only include words that really mean the same thing in your operation.

### Turn 26 — persona

1. **Maintainable item** — none.
2. **Maintenance work order** — **maintenance work order**, **work order**, **MWO**.
3. **Maintenance process** — none.
4. **Maintenance activity** — none.
5. **Qualified maintenance person** — none.

### Turn 27 — app-user

1. **Maintainable item** — none.
2. **Maintenance work order** — **maintenance work order**, **work order**, **MWO**.
3. **Maintenance process** — none.
4. **Maintenance activity** — none.
5. **Qualified maintenance person** — none.

### Turn 27 — app-tool

🔍 Checked the current ontology state.

### Turn 27 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 27 — app-assistant

Recorded:
- MaintenanceWorkOrder aliases: work order, MWO

Recap:
- In this batch, only MaintenanceWorkOrder had real aliases.
- I did not record “maintenance work order” as an alias because it is already the class’s main label.

Next alias batch for relationships. Tell me any real alternate phrasings you use for these relationships, or “none”:
1. hasMaintenanceState
2. initiates
3. describes
4. requiresQualification
5. assignedTo

Only actual synonyms used in your setting.

### Turn 27 — persona

1. **Has maintenance state** — none.
2. **Initiates** — none.
3. **Describes** — none.
4. **Requires qualification** — I do also hear this put as **prescribed by**, though I’d only use that where the qualification requirement is being referenced from the activity side.
5. **Assigned to** — none.

### Turn 28 — app-user

1. **Has maintenance state** — none.
2. **Initiates** — none.
3. **Describes** — none.
4. **Requires qualification** — I do also hear this put as **prescribed by**, though I’d only use that where the qualification requirement is being referenced from the activity side.
5. **Assigned to** — none.

### Turn 28 — app-tool

🔍 Checked the current ontology state.

### Turn 28 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 28 — app-assistant

Recorded:
- requiresQualification alias: prescribed by

Recap of the language layer:
- All classes have meanings.
- All relationships have meanings.
- Aliases captured so far:
  - MaintenanceWorkOrder: work order, MWO
  - requiresQualification: prescribed by
- Two alias batches in a row have been sparse, so I’ll stop actively fishing for more unless they come up naturally later.

Next is constraints/fixed choices. We already have one fixed list:
- MaintenanceState.stateCategory = operating | degraded | failed

For this property, what breaks if the value is missing or wrong? I’m asking this specifically to determine whether the property should be treated as required/bounded at action/query boundaries.

### Turn 28 — persona

If **state category** is missing or wrong, you lose the ability to reliably answer the basic state questions:

- what maintenance state the item is in right now, and
- which items are operating, degraded, or failed.

So at the point where you’re trying to classify or query by state, that value needs to be valid and from the allowed set **operating, degraded, failed**.

I would be careful not to overstate that beyond the boundary, though. The issue is not “every state record everywhere is always invalid unless that field is filled in immediately.” The operational point is that **you can’t correctly classify or filter by maintenance state without it**.

### Turn 29 — app-user

If **state category** is missing or wrong, you lose the ability to reliably answer the basic state questions:

- what maintenance state the item is in right now, and
- which items are operating, degraded, or failed.

So at the point where you’re trying to classify or query by state, that value needs to be valid and from the allowed set **operating, degraded, failed**.

I would be careful not to overstate that beyond the boundary, though. The issue is not “every state record everywhere is always invalid unless that field is filled in immediately.” The operational point is that **you can’t correctly classify or filter by maintenance state without it**.

### Turn 29 — app-assistant

Good — that’s enough to treat stateCategory as bounded and operationally required when classifying or querying state.

Recap of constraints so far:
- MaintenanceState.stateCategory has a fixed allowed list:
  - operating
  - degraded
  - failed
- If it is missing or wrong, the agent cannot correctly classify or filter by maintenance state.

Next we move to rules, but only where a real decision depends on them.

The clearest one from your confirmed material is the assignment decision.

One focused rule question:
For the action “assign a qualified maintenance person to a maintenance activity,” is this rule correct as a starting point?

assignQualifiedMaintenancePersonRule
- the maintenance activity requires a qualification specification
- the qualified maintenance person is qualified for the maintenance activity

If that is incomplete or wrong, tell me the exact conditions that must be true before assignment is allowed in this scope.

### Turn 29 — persona

Yes, that’s the right starting rule for this scope.

Before assignment is allowed:
- **the maintenance activity requires a qualification specification**, and
- **the person satisfies that required qualification**, which in the model we’ve been using is reflected by the person being **qualified for** that maintenance activity.

I’d just be careful with the wording of the second line. Operationally, the real condition is that the person **satisfies the required qualification**. The direct person-to-activity qualification link is how we represent that here.

### Turn 30 — app-user

Yes, that’s the right starting rule for this scope.

Before assignment is allowed:
- **the maintenance activity requires a qualification specification**, and
- **the person satisfies that required qualification**, which in the model we’ve been using is reflected by the person being **qualified for** that maintenance activity.

I’d just be careful with the wording of the second line. Operationally, the real condition is that the person **satisfies the required qualification**. The direct person-to-activity qualification link is how we represent that here.

### Turn 30 — app-tool

🔍 Checked the current ontology state.

### Turn 30 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 30 — app-assistant

Recorded.

Recap of rules so far:
- canAssignQualifiedMaintenancePerson
  - maintenance activity requires a qualification specification
  - assigned person satisfies the required qualification, represented here by being qualified for the maintenance activity

Next action formalization, starting with the one we now have enough structure for.

Please confirm this action definition:

Action: assignQualifiedMaintenancePerson
- input: MaintenanceActivity
- preconditions: canAssignQualifiedMaintenancePerson
- effect: the maintenance activity is assigned to a qualified maintenance person
- verification: confirm the maintenance activity is assigned to that qualified maintenance person

Keep/change on each line if needed.

### Turn 30 — persona

Line by line:

- **Input: keep.** Maintenance activity is the right input.
- **Preconditions: keep.** That rule is the right gate for this scope.
- **Effect: keep.** The maintenance activity is assigned to a qualified maintenance person.
- **Verification: change slightly.** I’d say **confirm that the assigned person is qualified for the maintenance activity**.

Reason: just seeing an assignment link tells you the assignment was recorded; the verification for the action should confirm the assignment was made **and** that it meets the qualification condition we care about.

### Turn 31 — app-user

Line by line:

- **Input: keep.** Maintenance activity is the right input.
- **Preconditions: keep.** That rule is the right gate for this scope.
- **Effect: keep.** The maintenance activity is assigned to a qualified maintenance person.
- **Verification: change slightly.** I’d say **confirm that the assigned person is qualified for the maintenance activity**.

Reason: just seeing an assignment link tells you the assignment was recorded; the verification for the action should confirm the assignment was made **and** that it meets the qualification condition we care about.

### Turn 31 — app-tool

🔍 Checked the current ontology state.

### Turn 31 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 31 — app-assistant

Recorded, and one of the action-input errors is now fixed.

Recap:
- assignQualifiedMaintenancePerson is now fully formalized:
  - input: MaintenanceActivity
  - precondition: canAssignQualifiedMaintenancePerson
  - effect: activity assigned to qualified maintenance person
  - verification: confirm the assigned person is qualified for the activity

Next action, one at a time.

For “create a maintenance work order for a needed maintenance process,” please confirm this draft:

Action: createMaintenanceWorkOrder
- input: MaintenanceWorkOrder
- preconditions: none yet captured
- effect: a maintenance work order is created and describes the needed maintenance process
- verification: confirm the maintenance work order exists and describes the maintenance process

Keep/change on each line.

### Turn 31 — persona

Line by line:

- **Input: change.** The input should be **maintenance process**, not maintenance work order. You create the work order **for** the process that needs to be carried out.
- **Preconditions: change.** We do have one: **a maintenance process is needed to retain or restore function**.
- **Effect: keep with a wording tweak.** I’d say **a maintenance work order record is created for the maintenance process**.
- **Verification: keep with a wording tweak.** **Confirm that a maintenance work order record describes the maintenance process.**

### Turn 32 — app-user

Line by line:

- **Input: change.** The input should be **maintenance process**, not maintenance work order. You create the work order **for** the process that needs to be carried out.
- **Preconditions: change.** We do have one: **a maintenance process is needed to retain or restore function**.
- **Effect: keep with a wording tweak.** I’d say **a maintenance work order record is created for the maintenance process**.
- **Verification: keep with a wording tweak.** **Confirm that a maintenance work order record describes the maintenance process.**

### Turn 32 — app-assistant

Good correction. One thing we need to resolve before I can record that precondition as a rule:

Your proposed precondition says “a maintenance process is needed to retain or restore function,” but the model does not yet have any property or relationship that represents “needed.” I shouldn’t record a rule that refers to something we haven’t captured.

So one focused question:
How do you want to represent that precondition in the model?

Options are roughly:
- a property on MaintenanceProcess such as neededForMaintenance / processNeedStatus
- a relationship from MaintainableItem to MaintenanceProcess expressing that the process is needed for that item
- or a simpler rule with no explicit modeled “needed” condition for now

Which way matches your intent best?

### Turn 32 — persona

For now, I’d go with the **simpler rule with no extra modeled “needed” field or relationship**.

The operational intent is just that you don’t create a maintenance work order unless there is a maintenance process to be carried out to retain or restore function. Since we haven’t captured a separate way to model “need,” I wouldn’t force one in just to support that line.

So in the current scope, keep the action tied to a **maintenance process** as input, and don’t add a new need-status construct unless you want to expand the planning side later.

### Turn 33 — app-user

For now, I’d go with the **simpler rule with no extra modeled “needed” field or relationship**.

The operational intent is just that you don’t create a maintenance work order unless there is a maintenance process to be carried out to retain or restore function. Since we haven’t captured a separate way to model “need,” I wouldn’t force one in just to support that line.

So in the current scope, keep the action tied to a **maintenance process** as input, and don’t add a new need-status construct unless you want to expand the planning side later.

### Turn 33 — app-tool

🔍 Checked the current ontology state.

### Turn 33 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 33 — app-assistant

I recorded the action, and the tool surfaced a real modeling gap.

Right now we have:
- MaintenanceWorkOrder --describes--> MaintenanceProcess

But the action input is MaintenanceProcess, and the effect/verification need the agent to get from that process to the created work order. A one-way link in the opposite direction is not enough for that action in this tool.

So we need one focused decision:

Do you want to add a direct relationship from MaintenanceProcess to MaintenanceWorkOrder for navigation from the action input side?

Candidate wording:
- MaintenanceProcess --describedBy--> MaintenanceWorkOrder

If yes, I’ll record it as an additional operational relationship. If no, we’ll need to rethink the action input instead.

### Turn 33 — persona

Yes, add it.

**Maintenance process — described by — maintenance work order** is a fair operational counterpart to the existing direction, and it makes sense if the tool needs to navigate from the process side for that action.

### Turn 34 — app-user

Yes, add it.

**Maintenance process — described by — maintenance work order** is a fair operational counterpart to the existing direction, and it makes sense if the tool needs to navigate from the process side for that action.

### Turn 34 — app-tool

🔍 Checked the current ontology state.

### Turn 34 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 34 — app-assistant

I added it, and the tool raised the expected inverse-pair warning.

Here this is not just wording duplication — it reflects a real limitation of the current tool: your action input is MaintenanceProcess, and the action needs navigation from process to work order. So we have a tradeoff between:
- keeping a single relationship direction for conceptual cleanliness, or
- keeping both operational directions so the current action can be checked from its input class.

Given what you just confirmed, I recommend we keep both for now and treat this warning as a tool limitation rather than a domain contradiction.

Short recap:
- createMaintenanceWorkOrder now has:
  - input: MaintenanceProcess
  - no preconditions yet
  - effect: a maintenance work order record is created for the maintenance process
  - verification: confirm that a maintenance work order record describes the maintenance process
- Added relationship:
  - MaintenanceProcess --describedBy--> MaintenanceWorkOrder

Next action, one focused question:
For “start a maintenance process once the strategy and work order are in place,” what should the single input class be:
- MaintenanceProcess
or
- MaintenanceWorkOrder

Which one is the action fundamentally about in your scope?

### Turn 34 — persona

**Maintenance process**.

The action is fundamentally about starting the process. The work order and the strategy are things that need to be in place around it, but the thing being started is the maintenance process.

### Turn 35 — app-user

**Maintenance process**.

The action is fundamentally about starting the process. The work order and the strategy are things that need to be in place around it, but the thing being started is the maintenance process.

### Turn 35 — app-assistant

Good. One more focused step to formalize that action correctly:

What are the preconditions for starting the maintenance process, stated only using facts already in the model if possible?

From what we have now, I can see at least:
- the maintenance process is governed by a maintenance strategy
- the maintenance process is described by a maintenance work order

Are those the right preconditions for this scope, or is either one wrong/incomplete?

### Turn 35 — persona

Those are the right preconditions for this scope.

Before you start the maintenance process:
- **the maintenance process is governed by a maintenance strategy**, and
- **the maintenance process is described by a maintenance work order**.

I wouldn’t add more at this stage unless you want to model planning and execution detail more deeply.

### Turn 36 — app-user

Those are the right preconditions for this scope.

Before you start the maintenance process:
- **the maintenance process is governed by a maintenance strategy**, and
- **the maintenance process is described by a maintenance work order**.

I wouldn’t add more at this stage unless you want to model planning and execution detail more deeply.

### Turn 36 — app-tool

🔍 Checked the current ontology state.

### Turn 36 — app-tool

✓ Applied: 1 added, 1 updated.

### Turn 36 — app-assistant

Recorded.

Recap:
- canStartMaintenanceProcess
  - maintenance process is governed by a maintenance strategy
  - maintenance process is described by a maintenance work order
- startMaintenanceProcess
  - input: MaintenanceProcess
  - precondition: canStartMaintenanceProcess
  - effect: the maintenance process is started
  - verification: confirm the process is governed by a strategy and described by a work order

One caution: that verification currently confirms the preconditions are still true, not that “started” itself was recorded, because we do not yet have a process-status property. I’m not changing that without your say-so, but it is a real limitation.

Next action:
For “classify an item as failed after a failure event,” what should the single input class be:
- MaintainableItem
or
- FailedState

Which one is the action fundamentally about in your scope?

### Turn 36 — persona

**Failure event**.

The action is fundamentally triggered by the failure event. That’s the thing that lets you classify the affected item as being in a failed state.

### Turn 37 — app-user

**Failure event**.

The action is fundamentally triggered by the failure event. That’s the thing that lets you classify the affected item as being in a failed state.

### Turn 37 — app-assistant

Then we need to make sure the model can get from the FailureEvent input to the affected MaintainableItem, not just to FailedState.

Right now we have:
- FailureEvent --initiates--> FailedState
- MaintainableItem --hasFailedState--> FailedState

That may be enough as a chain, but for an action driven from FailureEvent, I need to ask explicitly:

Does the model also need a direct relationship from FailureEvent to MaintainableItem, or is the path through FailedState sufficient for your intended action and questions?

### Turn 37 — persona

The path through **failed state** is sufficient for what we’ve established.

We know:
- the **failure event initiates** the failed state, and
- the **maintainable item has failed state** that failed state.

That gives you the connection from the event to the affected item without adding a second direct event-to-item link.

### Turn 38 — app-user

The path through **failed state** is sufficient for what we’ve established.

We know:
- the **failure event initiates** the failed state, and
- the **maintainable item has failed state** that failed state.

That gives you the connection from the event to the affected item without adding a second direct event-to-item link.

### Turn 38 — app-assistant

Good. Then one focused step to formalize the action without inventing extra links:

What are the preconditions, effect, and verification for classifyItemAsFailed, using only the facts already in the model if possible?

A likely starting draft would be:
- input: FailureEvent
- preconditions: none yet captured
- effect: a maintainable item has a failed state initiated by the failure event
- verification: confirm the failure event initiates the failed state and the maintainable item has that failed state

Keep/change those lines as needed.

### Turn 38 — persona

That’s close, but I’d tighten it.

- **Input: keep.** Failure event is right.
- **Preconditions: change.** We do have preconditions for this scope:
  - **a failure event has occurred**, and
  - **the item cannot perform its required function**.
- **Effect: keep in substance.** A failed state is recorded for the affected maintainable item.
- **Verification: change slightly.** Confirm that the item is now tracked in a failed state.

### Turn 39 — app-user

That’s close, but I’d tighten it.

- **Input: keep.** Failure event is right.
- **Preconditions: change.** We do have preconditions for this scope:
  - **a failure event has occurred**, and
  - **the item cannot perform its required function**.
- **Effect: keep in substance.** A failed state is recorded for the affected maintainable item.
- **Verification: change slightly.** Confirm that the item is now tracked in a failed state.

### Turn 39 — app-assistant

We need one clarification before I can record those preconditions.

“a failure event has occurred” and “the item cannot perform its required function” are meaningful, but the model does not yet contain any property or relationship for:
- occurrence/occurred on FailureEvent, or
- ability to perform required function on MaintainableItem or FailedState.

I shouldn’t record a rule that refers to facts we haven’t captured.

So one focused question:
For the current scope, do you want to:
1. add properties/relationships to represent those preconditions explicitly, or
2. keep classifyItemAsFailed with no formal precondition rule yet, and only record the effect/verification?

### Turn 39 — persona

For the current scope, choose **2**.

Keep **classify item as failed** without a formal precondition rule for now, and record the **effect** and **verification** only.

Those preconditions are real in operational terms, but since we haven’t yet modeled the supporting function facts explicitly, I wouldn’t pretend we have.

### Turn 40 — app-user

For the current scope, choose **2**.

Keep **classify item as failed** without a formal precondition rule for now, and record the **effect** and **verification** only.

Those preconditions are real in operational terms, but since we haven’t yet modeled the supporting function facts explicitly, I wouldn’t pretend we have.

### Turn 40 — app-tool

🔍 Checked the current ontology state.

### Turn 40 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 40 — app-assistant

I recorded it, and the tool surfaced another real navigation issue.

Conceptually, your chain is valid:
- FailureEvent --initiates--> FailedState
- MaintainableItem --hasFailedState--> FailedState

But for an action starting from FailureEvent, this tool does not treat “meeting in the middle” as enough for navigation. It wants a forward path from the input to the affected item.

So we need one focused decision:

Do you want to add a direct operational relationship:
- FailureEvent --affects--> MaintainableItem

This would not replace the failed-state chain; it would just let the action navigate from its input class. If you do not want that, then we’ll need to rethink the action input again.

### Turn 40 — persona

Yes, add it as an **operational relationship**.

**Failure event — affects — maintainable item** is reasonable if the tool needs that forward navigation from the action input. It doesn’t replace the more precise failed-state path, but it’s fine to carry both for execution support.

### Turn 41 — app-user

Yes, add it as an **operational relationship**.

**Failure event — affects — maintainable item** is reasonable if the tool needs that forward navigation from the action input. It doesn’t replace the more precise failed-state path, but it’s fine to carry both for execution support.

### Turn 41 — app-tool

🔍 Checked the current ontology state.

### Turn 41 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 41 — app-assistant

Recorded.

Recap:
- classifyItemAsFailed is now operationally supported by:
  - FailureEvent --affects--> MaintainableItem
  - plus the more precise failed-state chain already in the model
- Remaining unresolved action formalization is mainly closeMaintenanceWorkOrder
- The remaining warnings are the two operational inverse-style pairs we knowingly kept:
  - describes / describedBy
  - qualifiedFor / assignedTo (not a real inverse in meaning, but the tool flags it)

Next action:
For “close a maintenance work order after the work is completed and updated,” what should the single input class be?

I assume MaintenanceWorkOrder, but please confirm.

### Turn 41 — persona

Yes — **maintenance work order** is the right input.

### Turn 42 — app-user

Yes — **maintenance work order** is the right input.

### Turn 42 — app-assistant

Good.

One focused step to formalize it:

What are the preconditions, effect, and verification for closeMaintenanceWorkOrder, using only facts already in the model if possible?

From what you’ve said earlier, I can see this as a candidate:
- preconditions: none formally captured yet
- effect: the maintenance work order record is updated with task description and cost
- verification: confirm the maintenance work order contains task description and cost

Keep/change those lines as needed.

### Turn 42 — persona

For the current scope, that’s the right practical version.

- **Preconditions:** none formally captured yet.
- **Effect:** the maintenance work order record is updated with **task description** and **cost**.
- **Verification:** confirm that the maintenance work order contains **task description** and **cost**.

If you later expand the model, you could add the stronger operational condition that the maintenance activities are completed before closure, but we haven’t modeled enough activity-completion detail yet to make that a formal rule now.

### Turn 43 — app-user

For the current scope, that’s the right practical version.

- **Preconditions:** none formally captured yet.
- **Effect:** the maintenance work order record is updated with **task description** and **cost**.
- **Verification:** confirm that the maintenance work order contains **task description** and **cost**.

If you later expand the model, you could add the stronger operational condition that the maintenance activities are completed before closure, but we haven’t modeled enough activity-completion detail yet to make that a formal rule now.

### Turn 43 — app-tool

🔍 Checked the current ontology state.

### Turn 43 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 43 — app-assistant

Recorded. All action input errors are now resolved.

Short recap of the actions now formalized:
- classifyItemAsFailed
  - input: FailureEvent
  - no formal precondition rule yet
  - effect: failed state recorded for affected maintainable item
  - verification: item is now tracked in a failed state
- createMaintenanceWorkOrder
  - input: MaintenanceProcess
  - no formal precondition rule yet
  - effect: maintenance work order record created for the process
  - verification: a maintenance work order record describes the process
- assignQualifiedMaintenancePerson
  - input: MaintenanceActivity
  - precondition: canAssignQualifiedMaintenancePerson
  - effect: activity assigned to qualified maintenance person
  - verification: assigned person is qualified for the activity
- startMaintenanceProcess
  - input: MaintenanceProcess
  - precondition: canStartMaintenanceProcess
  - effect: process is started
  - verification: process is governed by strategy and described by work order
- closeMaintenanceWorkOrder
  - input: MaintenanceWorkOrder
  - no formal precondition rule yet
  - effect: work order updated with task description and cost
  - verification: work order contains task description and cost

We now need the validation pass. I’ll summarize plainly first, because there are still two outstanding tool warnings:
1. MaintenanceProcess --describedBy--> MaintenanceWorkOrder looks like the inverse of MaintenanceWorkOrder --describes--> MaintenanceProcess.
2. MaintenanceActivity --assignedTo--> QualifiedMaintenancePerson looks like the inverse of QualifiedMaintenancePerson --qualifiedFor--> MaintenanceActivity.

The second one we already established is not a real inverse; they are different facts.
The first one is a deliberate operational counterpart kept so the create-work-order action can navigate from its input.

Before I do the final coverage recap against the competency questions, please confirm this summary:
- keep both warnings as intentional, not contradictions.

### Turn 43 — persona

Yes — keep both as intentional, not contradictions.

- **Describes / described by** is a deliberate operational pair so the process-side action can work from its input.
- **Qualified for / assigned to** are different facts altogether: one is eligibility, the other is actual assignment.

### Turn 44 — app-user

Yes — keep both as intentional, not contradictions.

- **Describes / described by** is a deliberate operational pair so the process-side action can work from its input.
- **Qualified for / assigned to** are different facts altogether: one is eligibility, the other is actual assignment.

### Turn 44 — app-tool

🔍 Checked the current ontology state.

### Turn 44 — app-assistant

Validation recap against the persisted acceptance test:

Competency questions
1. What maintenance state is an item in right now?  
   Covered by MaintainableItem --hasMaintenanceState--> MaintenanceState and MaintenanceState.stateCategory.

2. Which items are currently in operating, degraded, or failed state?  
   Covered by the same relationship plus MaintenanceState.stateCategory allowed values.

3. Which failure event caused an item to enter a failed state?  
   Covered by MaintainableItem --hasFailedState--> FailedState and FailureEvent --initiates--> FailedState.

4. Which failed states were caused by the same failure event?  
   Covered by FailureEvent --initiates--> FailedState.

5. What maintenance process does a work order describe?  
   Covered by MaintenanceWorkOrder --describes--> MaintenanceProcess.

6. Which maintenance strategy governs a maintenance process?  
   Covered by MaintenanceProcess --governedByStrategy--> MaintenanceStrategy.

7. Which maintenance activities are included in a maintenance process?  
   Covered by MaintenanceProcess --hasActivity--> MaintenanceActivity.

8. What qualification is required for a maintenance activity?  
   Covered by MaintenanceActivity --requiresQualification--> QualificationSpecification.

9. Which maintenance person is qualified to perform a maintenance activity?  
   Covered by QualifiedMaintenancePerson --qualifiedFor--> MaintenanceActivity.

10. What failure effects resulted from a failure event?  
   Covered by FailureEvent --hasEffect--> FailureEffect.

Actions
1. classifyItemAsFailed  
   Covered enough to represent the action: input FailureEvent, operational path via affects plus failed-state structure, effect and verification recorded. No formal precondition rule yet.

2. createMaintenanceWorkOrder  
   Covered enough to represent the action: input MaintenanceProcess, effect/verification supported by describedBy/describes. No formal precondition rule yet.

3. assignQualifiedMaintenancePerson  
   Covered with explicit rule, assignment relationship, and verification.

4. startMaintenanceProcess  
   Partly covered. It has input and preconditions, but its verification is weak because we do not yet model a “started” state/property on MaintenanceProcess.

5. closeMaintenanceWorkOrder  
   Covered for the current scope through taskDescription and cost rather than a closed-status field.

Final checklist result from the current graph state:
- Every class has at least one relationship: yes.
- Every persisted competency question has the needed class pairs directly connected: yes, for the confirmed questions.
- Every class has a meaning sentence: yes.
- Every relationship has a meaning sentence: yes.
- Common synonyms captured where actually confirmed: yes, sparse but present.
- Fixed-choice property lists captured where established: yes for MaintenanceState.stateCategory.
- Rules and actions only reference captured model elements: yes, with one practical limitation noted below.

Remaining open items — these are real gaps or cautions, not hidden:
1. startMaintenanceProcess verification is weaker than ideal because there is no modeled process-started/status fact yet.
2. classifyItemAsFailed has no formal precondition rule, by your choice, because the needed function/occurrence facts are not yet modeled.
3. createMaintenanceWorkOrder has no formal precondition rule, by your choice, because “needed” is not yet modeled.
4. Two tool warnings remain intentionally:
   - describes / describedBy kept as an operational pair
   - qualifiedFor / assignedTo kept because they are different facts in your domain

Plain-language summary of what we captured:
You now have a working ontology core for maintainable items, their maintenance and failed states, failure events and effects, and the maintenance-work structure around work orders, processes, strategies, activities, qualifications, and qualified people. It is sufficient for the ten confirmed questions and five actions at a practical first-pass level, with the main incompleteness being richer execution-state modeling.

If you want to continue, the next best improvement would be to close one of the open items above — most likely adding the minimum fact needed to verify that a maintenance process has actually been started.

### Turn 44 — persona

That’s a fair wrap-up — you’ve got the core in place, and the open points you flagged are the right ones.

### Turn 45 — app-user

That’s a fair wrap-up — you’ve got the core in place, and the open points you flagged are the right ones.

### Turn 45 — app-assistant

Good — then this session ends with a clear captured core and a short open-items list, not an unresolved question.

Final recap:
- Core domain captured for:
  - maintainable items
  - maintenance state / failed state
  - failure event / failure effect
  - maintenance work order / process / strategy / activity
  - qualification specification / qualified maintenance person
- Key properties captured:
  - MaintenanceState.stateCategory = operating | degraded | failed
  - MaintenanceWorkOrder.taskDescription
  - MaintenanceWorkOrder.cost
- Rules captured:
  - canAssignQualifiedMaintenancePerson
  - canStartMaintenanceProcess
- Actions captured:
  - classifyItemAsFailed
  - createMaintenanceWorkOrder
  - assignQualifiedMaintenancePerson
  - startMaintenanceProcess
  - closeMaintenanceWorkOrder
- Intentional operational pairs retained:
  - describes / describedBy
  - qualifiedFor / assignedTo

Open items for a later pass:
1. Add the minimum modeled fact needed to verify that a maintenance process has actually been started.
2. Add explicit precondition modeling for classifyItemAsFailed if you want occurrence/function-loss checks formalized.
3. Add explicit “needed” modeling for createMaintenanceWorkOrder if you want planning-side gating formalized.

If you come back, I’d recommend starting with open item 1.
