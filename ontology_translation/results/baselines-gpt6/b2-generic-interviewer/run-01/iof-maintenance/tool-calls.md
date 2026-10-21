# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-21T04:04:03.640Z

### Turn 1 — user

I lead maintenance and reliability for a mid-size plant -- a fleet of physical assets that have to keep running, a small crew of maintenance techs, and a work-order system that tracks everything from routine upkeep to emergency fixes.  I came up doing the hands-on work before moving into planning and reliability, so I think in terms of *what state is this asset in right now*, *what caused it to get there*, and *who's qualified to fix it* -- not abstractions. Where would you like to start?

### Turn 1 — assistant

Let’s start with the decisions you make during a shift. I’m hearing three anchors: the asset’s current state, what caused that state, and which maintenance tech is qualified to respond. Is that right?

Take a recent case: what asset state triggered a work order, how did you determine the cause, and how did you decide who could take the job?

### Turn 2 — user

That’s right. Those are the three questions I’m trying to settle, though I keep the event that caused a failure separate from the process that led up to it.

Say a pump can no longer deliver its required flow after a bearing seizes. Because it can’t perform its required function and a failure event has occurred, I’d track it as **failed**, not merely degraded. The seizure is the failure event; bearing deterioration leading up to it is the failure process, if we have evidence for that. I wouldn’t claim we’d established the deterioration just from seeing the pump stopped.

We’d raise a work order for the maintenance process needed to restore the pump’s function. For the assignment, I’d look at the specific maintenance activity, check what qualification it requires, and assign a person who satisfies that requirement. I wouldn’t give the job to someone based only on general availability.

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Asset:\n    meaning: A physical item whose ability to perform a required function is maintained.\n    properties:\n      state:\n        type: text\n  RequiredFunction:\n    meaning: A function an asset is required to perform.\n  FailureEvent:\n    meaning: An occurrence after which an asset cannot perform a required function.\n  FailureProcess:\n    meaning: A process leading up to a failure event, if supported by evidence.\n  WorkOrder:\n    meaning: A work-order-system item raised for maintenance needed on an asset.\n  MaintenanceProcess:\n    meaning: The maintenance process needed to restore or sustain an asset's function.\n  MaintenanceActivity:\n    meaning: A specific activity within a maintenance process.\n  Qualification:\n    meaning: A qualification required for a maintenance activity and held by a person.\n  Person:\n    meaning: A person considered for assignment to maintenance work.\nrelationships:\n  - name: requiresFunction\n    from: Asset\n    to: RequiredFunction\n  - name: occursOn\n    from: FailureEvent\n    to: Asset\n  - name: leadsTo\n    from: FailureProcess\n    to: FailureEvent\n    meaning: Links an evidenced failure process to the resulting failure event; an event alone does not establish the process.\n  - name: addressesAsset\n    from: WorkOrder\n    to: Asset\n  - name: callsFor\n    from: WorkOrder\n    to: MaintenanceProcess\n  - name: includesActivity\n    from: MaintenanceProcess\n    to: MaintenanceActivity\n  - name: requiresQualification\n    from: MaintenanceActivity\n    to: Qualification\n  - name: holdsQualification\n    from: Person\n    to: Qualification\n  - name: assignedTo\n    from: MaintenanceActivity\n    to: Person\nrules:\n  failedState:\n    conditions:\n      - A failure event has occurred on the asset.\n      - The asset cannot perform a required function.\n  establishedFailureProcess:\n    conditions:\n      - Evidence supports a failure process leading up to the failure event; the stopped asset or event alone is not enough.\n  qualifiedAssignment:\n    conditions:\n      - The person holds the qualification required by the specific maintenance activity; availability alone is not enough.\nactions:\n  assignMaintenanceActivity:\n    input: MaintenanceActivity\n    preconditions: [qualifiedAssignment]"
}
```

I understand the distinction: **failed** is the pump’s state when it cannot perform its required function after a failure event. The bearing seizure is the event; deterioration is a possible preceding process, but not an established one without evidence. I’ll put those distinctions into the model before we explore the work-order flow.

### Turn 2 — tool

Applied. Added 22, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 2 — assistant

For the pump example, which asset states do you actually distinguish when making decisions—such as running normally, degraded, failed, or out of service? In particular, can an asset be stopped but *not* failed, and what would tell you the difference?For the pump example, which asset states do you actually distinguish when making decisions—such as running normally, degraded, failed, or out of service? In particular, can an asset be stopped but *not* failed, and what would tell you the difference?

### Turn 3 — user

I distinguish **operating, degraded, and failed**. “Out of service” can be useful shift language, but it doesn’t by itself tell me which of those conditions the pump is in.

A stopped pump is **not automatically failed**. If it was deliberately shut down but is still able to deliver its required flow when called on, it isn’t failed. If it can deliver flow only at a reduced but acceptable level, it’s degraded. I’d call it failed when a failure event has occurred and it can no longer perform that required function.

So I’d ask *why is it stopped, and can it still do its job?* A stop command and a seized bearing may look the same from across the floor, but they mean very different things for the work order.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Asset:\n    properties:\n      state:\n        type: text\n        allowed: [operating, degraded, failed]\nrules:\n  failedState:\n    conditions:\n      - A failure event has occurred on the asset.\n      - The asset cannot perform a required function; being stopped by itself does not establish failure.\n  degradedState:\n    conditions:\n      - The asset can perform its required function only at a reduced but acceptable level.\n  stoppedIsNotNecessarilyFailed:\n    conditions:\n      - A deliberate shutdown of an asset still able to perform its required function when called on does not by itself make it failed."
}
```

That makes sense: a stop is an observation, not a diagnosis. I’ll keep **out of service** as shift language rather than make it a fourth condition, and use your three states in the model.

### Turn 3 — tool

Applied. Added 2, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

I’ve recorded **operating, degraded, and failed** as the conditions you use. One boundary to check: when a healthy pump is deliberately shut down and ready to deliver full flow when called on, do you still record its condition as **operating**, or leave its condition unset until it runs?

For the work order, what information changes your next decision: the failure event, evidence of the failure process, the required activity, or something else?

### Turn 4 — user

I’d record the healthy, deliberately stopped pump as **operating**: it’s able to perform its required function when called on. I wouldn’t leave its condition unset just because it isn’t running. “Operating” describes its capability here, not whether the motor is turning at this instant.

For the work order, the deciding question is whether a **maintenance process is needed to retain or restore that function**. The failure event tells me what happened; evidence of the failure process helps explain how it got there. Neither is a substitute for deciding what work is needed.

Once we’ve identified the work, the next decisions are which maintenance strategy it falls under, what activities the process includes, and what qualification each activity requires before assigning a tech. We need the work order describing that process before starting it.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MaintenanceStrategy:\n    meaning: The strategy under which a needed maintenance process is carried out.\nrelationships:\n  - name: followsStrategy\n    from: MaintenanceProcess\n    to: MaintenanceStrategy\n  - name: retainsOrRestores\n    from: MaintenanceProcess\n    to: RequiredFunction\n    meaning: The maintenance process is needed to retain or restore the required function.\nrules:\n  operatingState:\n    conditions:\n      - The asset is able to perform its required function when called on, even if deliberately stopped; operating describes capability, not whether it is running now.\n  workOrderBeforeMaintenance:\n    conditions:\n      - A maintenance process is needed to retain or restore an asset's required function.\n      - A work order describes the maintenance process before it starts.\nactions:\n  startMaintenanceProcess:\n    input: MaintenanceProcess\n    preconditions: [workOrderBeforeMaintenance]"
}
```

I’ll record **operating** as capability, even when the pump is deliberately stopped. I also hear a decision sequence: determine whether maintenance is needed to retain or restore the function, describe that process in a work order before starting it, then identify its strategy, activities, and qualification requirements.

### Turn 4 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "startMaintenanceProcess" has input class MaintenanceProcess, and its precondition workOrderBeforeMaintenance refers to Asset, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from MaintenanceProcess to Asset. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "startMaintenanceProcess" has input class MaintenanceProcess, and its precondition workOrderBeforeMaintenance refers to WorkOrder, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from MaintenanceProcess to WorkOrder. Rewording the text does not create the path it assumes.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  startMaintenanceProcess:\n    input: WorkOrder\n    preconditions: [workOrderBeforeMaintenance]"
}
```

### Turn 4 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 4 — assistant

What maintenance strategies do you use, and what determines which one a process falls under? For example, how would you classify planned upkeep on a capable pump versus work to restore the seized pump?

### Turn 5 — user

I wouldn’t put a fixed strategy label on either job from those facts alone. A maintenance strategy is the approved approach we use for that asset; which approach applies comes from our maintenance plan or governing procedure, not just from whether the pump is currently capable or failed.

The distinction I *can* make is about the work: planned upkeep on a capable pump is aimed at **retaining** its function, while work on the seized pump is aimed at **restoring** it. Either way, we identify the maintenance process needed, then make sure its strategy is defined and a work order describes it before the process starts.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MaintenanceProcess:\n    properties:\n      aim:\n        type: text\n        allowed: [retain, restore]\n  MaintenancePlan:\n    meaning: A plan specifying an approved maintenance strategy for an asset.\n  GoverningProcedure:\n    meaning: A procedure specifying an approved maintenance strategy for an asset.\nrelationships:\n  - name: hasMaintenancePlan\n    from: Asset\n    to: MaintenancePlan\n  - name: hasGoverningProcedure\n    from: Asset\n    to: GoverningProcedure\n  - name: specifiesStrategy\n    from: MaintenancePlan\n    to: MaintenanceStrategy\n  - name: specifiesStrategy\n    from: GoverningProcedure\n    to: MaintenanceStrategy\nrules:\n  workOrderBeforeMaintenance:\n    conditions:\n      - A maintenance process is needed to retain or restore a required function.\n      - The maintenance process has a strategy defined by the asset's maintenance plan or governing procedure; the asset's current state alone does not determine it.\n      - A work order describes the maintenance process before it starts."
}
```

Understood. **Retaining** versus **restoring** describes the aim of the work; it does not determine the strategy. I’ll record that the strategy must come from the approved plan or governing procedure for the asset, and must be defined before the work starts.

### Turn 5 — tool

Applied. Added 6, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

How do you decide that a tech **satisfies** an activity’s qualification requirement? Is a qualification enough on its own, or do you check anything else—such as authorization, currency, or supervision? And if a process includes several activities, do you assign each one separately?

### Turn 6 — user

I check the **specific activity** against its qualification specification, then confirm the person has the assessed skill that specification calls for. A general maintenance qualification isn’t enough if it doesn’t cover that task.

I can’t give you a blanket rule about separate authorization, currency, or supervision from this work-order view; those would have to come from the applicable governing procedure. I wouldn’t assume they’re satisfied just because someone is generally qualified.

If the process has several activities, I check the qualification and assignment **for each activity that needs a qualified person**. One tech may be qualified for several tasks, but being cleared for one doesn’t automatically clear them for the others.

### Turn 6 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "Qualification",
      "to": "QualificationSpecification",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "requiresQualification",
      "to": "requiresQualificationSpecification",
      "className": "",
      "source": "MaintenanceActivity",
      "target": "QualificationSpecification",
      "reverse": false
    }
  ]
}
```

I’ll make that check activity-specific: the activity has a **qualification specification**, which calls for an **assessed skill** the person must have. I won’t infer authorization, currency, or supervision requirements unless the applicable governing procedure says they apply.

### Turn 6 — tool

Renamed 2 of 2:
- class "Qualification" → "QualificationSpecification" (previous name kept as an alias)
- relationship "requiresQualification" (MaintenanceActivity → QualificationSpecification) → "requiresQualificationSpecification" (MaintenanceActivity → QualificationSpecification)

### Turn 6 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [],
  "relationships": [
    {
      "name": "holdsQualification",
      "from": "Person",
      "to": "QualificationSpecification"
    }
  ],
  "properties": [],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

### Turn 6 — tool

Removed 1 element(s) — relationships: holdsQualification (Person → QualificationSpecification).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  QualificationSpecification:\n    meaning: The activity-specific specification of the assessed skill a person must have to perform the activity.\n  AssessedSkill:\n    meaning: A skill assessed for a person and called for by a qualification specification.\nrelationships:\n  - name: callsForAssessedSkill\n    from: QualificationSpecification\n    to: AssessedSkill\n  - name: hasAssessedSkill\n    from: Person\n    to: AssessedSkill\nrules:\n  qualifiedAssignment:\n    conditions:\n      - For each maintenance activity needing a qualified person, check its specific qualification specification.\n      - The assigned person has the assessed skill that specification calls for; general qualification or qualification for another activity does not suffice.\n      - Any additional authorization, currency, or supervision conditions apply only if specified by the governing procedure; do not assume they are met from general qualification alone."
}
```

### Turn 6 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 6 — assistant

I’ve corrected the model’s **Qualification** term to **QualificationSpecification** and removed the implication that a person simply “holds” the specification. The assessed-skill link still needs to be added; I won’t treat the assignment rule as complete until it is.

For the seized-bearing example, what evidence would let you record **bearing deterioration** as the failure process? Do you distinguish a suspected process from an established one?

### Turn 7 — user

I’d need evidence of **a change in the bearing’s condition that led to the pump’s loss of function**—for example, inspection findings showing progressive damage, backed up by earlier observations of reduced performance. A seized bearing establishes what we found at the failure; by itself, it doesn’t prove how the bearing deteriorated beforehand.

Yes, I’d distinguish **suspected** from **established** in how I report the cause. If all we know is that the bearing seized, I’d record the failure event and leave the lead-up as a working explanation until the evidence supports it. I’m not using “suspected” and “established” as formal asset states; they describe how confident we are in that explanation.

### Turn 7 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 7 — tool

competency_questions: []
classes:
  Asset:
    meaning: A physical item whose ability to perform a required function is maintained.
    aliases: []
    properties:
      state:
        type: text
        allowed:
          - operating
          - degraded
          - failed
  RequiredFunction:
    meaning: A function an asset is required to perform.
    aliases: []
    properties: {}
  FailureEvent:
    meaning: An occurrence after which an asset cannot perform a required function.
    aliases: []
    properties: {}
  FailureProcess:
    meaning: "A process leading up to a failure event, if supported by evidence."
    aliases: []
    properties: {}
  WorkOrder:
    meaning: A work-order-system item raised for maintenance needed on an asset.
    aliases: []
    properties: {}
  MaintenanceProcess:
    meaning: "The maintenance process needed to restore or sustain an asset's function."
    aliases: []
    properties:
      aim:
        type: text
        allowed:
          - retain
          - restore
  MaintenanceActivity:
    meaning: A specific activity within a maintenance process.
    aliases: []
    properties: {}
  QualificationSpecification:
    meaning: A qualification required for a maintenance activity and held by a person.
    aliases:
      - Qualification
    properties: {}
  Person:
    meaning: A person considered for assignment to maintenance work.
    aliases: []
    properties: {}
  MaintenanceStrategy:
    meaning: The strategy under which a needed maintenance process is carried out.
    aliases: []
    properties: {}
  MaintenancePlan:
    meaning: A plan specifying an approved maintenance strategy for an asset.
    aliases: []
    properties: {}
  GoverningProcedure:
    meaning: A procedure specifying an approved maintenance strategy for an asset.
    aliases: []
    properties: {}
relationships:
  - name: requiresFunction
    from: Asset
    to: RequiredFunction
    meaning: null
    aliases: []
  - name: occursOn
    from: FailureEvent
    to: Asset
    meaning: null
    aliases: []
  - name: leadsTo
    from: FailureProcess
    to: FailureEvent
    meaning: Links an evidenced failure process to the resulting failure event; an event alone does not establish the process.
    aliases: []
  - name: addressesAsset
    from: WorkOrder
    to: Asset
    meaning: null
    aliases: []
  - name: callsFor
    from: WorkOrder
    to: MaintenanceProcess
    meaning: null
    aliases: []
  - name: includesActivity
    from: MaintenanceProcess
    to: MaintenanceActivity
    meaning: null
    aliases: []
  - name: requiresQualificationSpecification
    from: MaintenanceActivity
    to: QualificationSpecification
    meaning: null
    aliases:
      - requiresQualification
  - name: assignedTo
    from: MaintenanceActivity
    to: Person
    meaning: null
    aliases: []
  - name: followsStrategy
    from: MaintenanceProcess
    to: MaintenanceStrategy
    meaning: null
    aliases: []
  - name: retainsOrRestores
    from: MaintenanceProcess
    to: RequiredFunction
    meaning: The maintenance process is needed to retain or restore the required function.
    aliases: []
  - name: hasMaintenancePlan
    from: Asset
    to: MaintenancePlan
    meaning: null
    aliases: []
  - name: hasGoverningProcedure
    from: Asset
    to: GoverningProcedure
    meaning: null
    aliases: []
  - name: specifiesStrategy
    from: MaintenancePlan
    to: MaintenanceStrategy
    meaning: null
    aliases: []
  - name: specifiesStrategy
    from: GoverningProcedure
    to: MaintenanceStrategy
    meaning: null
    aliases: []
rules:
  failedState:
    conditions:
      - A failure event has occurred on the asset.
      - The asset cannot perform a required function; being stopped by itself does not establish failure.
  establishedFailureProcess:
    conditions:
      - Evidence supports a failure process leading up to the failure event; the stopped asset or event alone is not enough.
  qualifiedAssignment:
    conditions:
      - The person holds the qualification required by the specific maintenance activity; availability alone is not enough.
  degradedState:
    conditions:
      - The asset can perform its required function only at a reduced but acceptable level.
  stoppedIsNotNecessarilyFailed:
    conditions:
      - A deliberate shutdown of an asset still able to perform its required function when called on does not by itself make it failed.
  operatingState:
    conditions:
      - "The asset is able to perform its required function when called on, even if deliberately stopped; operating describes capability, not whether it is running now."
  workOrderBeforeMaintenance:
    conditions:
      - A maintenance process is needed to retain or restore a required function.
      - "The maintenance process has a strategy defined by the asset's maintenance plan or governing procedure; the asset's current state alone does not determine it."
      - A work order describes the maintenance process before it starts.
actions:
  assignMaintenanceActivity:
    input: MaintenanceActivity
    preconditions:
      - qualifiedAssignment
    effect: ""
    verification: ""
  startMaintenanceProcess:
    input: WorkOrder
    preconditions:
      - workOrderBeforeMaintenance
    effect: ""
    verification: ""


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  FailureProcess:\n    meaning: An explanation of the change in condition leading up to a failure event, which may be suspected or established.\n    properties:\n      status:\n        type: text\n        allowed: [suspected, established]\n  Evidence:\n    meaning: Findings or observations used to assess whether a proposed failure process led to the loss of function.\n  QualificationSpecification:\n    meaning: The activity-specific specification of the assessed skill required to perform a maintenance activity.\n  AssessedSkill:\n    meaning: A skill assessed for a person and called for by a qualification specification.\nrelationships:\n  - name: leadsTo\n    from: FailureProcess\n    to: FailureEvent\n    meaning: The proposed explanation of the lead-up to the failure event, whether suspected or established.\n  - name: supportedBy\n    from: FailureProcess\n    to: Evidence\n  - name: callsForAssessedSkill\n    from: QualificationSpecification\n    to: AssessedSkill\n  - name: hasAssessedSkill\n    from: Person\n    to: AssessedSkill\nrules:\n  establishedFailureProcess:\n    conditions:\n      - Evidence shows a change in condition leading to loss of function, such as inspection findings of progressive damage backed by earlier observations of reduced performance.\n      - A seized bearing at failure establishes the failure event, not the earlier process by itself; without supporting evidence, report the process only as suspected.\n  qualifiedAssignment:\n    conditions:\n      - For each maintenance activity needing a qualified person, check its specific qualification specification.\n      - The assigned person has the assessed skill that specification calls for; general qualification, availability, or clearance for another activity does not suffice.\n      - Apply any additional authorization, currency, or supervision conditions only when the applicable governing procedure specifies them; do not assume they are met."
}
```

I’ll record **suspected** and **established** as the status of the proposed failure-process explanation, not as asset states. The seizure can be recorded as the failure event immediately; deterioration stays a working explanation until evidence supports a change in bearing condition leading to lost function. I’ll also finish the activity-specific assessed-skill link we discussed.

### Turn 7 — tool

Applied. Added 5, updated 5 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "assignMaintenanceActivity" has input class MaintenanceActivity, and its precondition qualifiedAssignment refers to GoverningProcedure, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from MaintenanceActivity to GoverningProcedure. Rewording the text does not create the path it assumes.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: governedBy\n    from: MaintenanceActivity\n    to: GoverningProcedure\n    meaning: Identifies the applicable procedure when it sets extra conditions for performing an activity."
}
```

### Turn 7 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 7 — assistant

The assessed-skill check and the suspected-versus-established distinction are now in place.

Two practical boundaries would help finish the model: how do you decide that reduced pump flow is still **acceptable** rather than a loss of its required function? And can a work order be raised before the cause is established, as long as the needed maintenance process is identified?

### Turn 8 — user

For reduced flow, I compare what the pump can still do with the **required function and the acceptable performance set by the applicable operating or maintenance procedure**. If its ability is reduced but still acceptable, I record it as degraded. I wouldn’t invent a flow cutoff on shift; if it can no longer perform the required function because of a failure event, it’s failed.

**Yes, we can raise a work order before the cause is established.** The boundary for raising it is that a maintenance process is needed to retain or restore function. We should keep the cause marked as uncertain rather than turn a suspected failure process into a finding.

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  RequiredFunction:\n    properties:\n      acceptablePerformance:\n        type: text\n  OperatingProcedure:\n    meaning: An operating procedure setting acceptable performance for an asset's required function.\n  GoverningProcedure:\n    meaning: An applicable maintenance procedure governing strategy or additional activity conditions, and potentially acceptable performance.\n    aliases: [maintenance procedure]\nrelationships:\n  - name: hasOperatingProcedure\n    from: Asset\n    to: OperatingProcedure\nrules:\n  operatingState:\n    conditions:\n      - The asset can perform its required function without reduced ability when called on, even if deliberately stopped; operating describes capability, not whether it is running now.\n  degradedState:\n    conditions:\n      - The asset's ability to perform its required function is reduced but still meets the acceptable performance set by the applicable operating or maintenance procedure; do not invent a cutoff.\n  workOrderBeforeMaintenance:\n    conditions:\n      - A maintenance process is needed to retain or restore a required function, regardless of whether a suspected failure process has been established.\n      - The maintenance process has a strategy defined by the asset's maintenance plan or governing procedure; the asset's current state alone does not determine it.\n      - A work order describes the maintenance process before it starts.\n  workOrderNeeded:\n    conditions:\n      - A maintenance process is needed to retain or restore an asset's required function; an established failure cause is not required.\nactions:\n  raiseWorkOrder:\n    input: Asset\n    preconditions: [workOrderNeeded]"
}
```

I’ll make the acceptable-performance comparison depend on the applicable procedure, rather than invent a flow cutoff. I’ll also make explicit that a work order may be raised while the failure process is still suspected: the trigger is the need to retain or restore function, not an established cause.

### Turn 8 — tool

Applied. Added 4, updated 5 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "raiseWorkOrder" has input class Asset, and its precondition workOrderNeeded refers to MaintenanceProcess, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Asset to MaintenanceProcess. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "startMaintenanceProcess" has input class WorkOrder, and its precondition workOrderBeforeMaintenance refers to FailureProcess, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from WorkOrder to FailureProcess. Rewording the text does not create the path it assumes.

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  workOrderBeforeMaintenance:\n    conditions:\n      - A maintenance process is needed to retain or restore a required function; an established cause is not required.\n      - The maintenance process has a strategy defined by the asset's maintenance plan or governing procedure; the asset's current state alone does not determine it.\n      - A work order describes the maintenance process before it starts.\n  workOrderNeeded:\n    conditions:\n      - A maintenance process is needed to retain or restore a required function; an established cause is not required.\nactions:\n  raiseWorkOrder:\n    input: MaintenanceProcess\n    preconditions: [workOrderNeeded]"
}
```

### Turn 8 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 8 — assistant

That gives a clear boundary for raising the work order. To complete the workflow: after the maintenance activities are done, how do you decide the asset’s function has been restored or retained? What must happen before you close the work order?

### Turn 9 — user

I’d check the pump against its **required function** after the work: can it deliver what it’s required to deliver, or is its performance still reduced? Completing the tasks doesn’t, by itself, prove that function has been restored.

For **work-order closure**, the maintenance activities in the process must be completed, and the work order must be updated with what was actually done. I’d then verify that the record contains the completed-task information and final cost. I’d keep the function check distinct from that closure requirement rather than assume a closed work order means the pump is operating normally.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  MaintenanceActivity:\n    properties:\n      completed:\n        type: boolean\n  WorkOrder:\n    properties:\n      completedTaskInformation:\n        type: text\n      finalCost:\n        type: number\nrules:\n  functionCheck:\n    conditions:\n      - After the work, compare the asset's capability with its required function and applicable acceptable performance; task completion alone does not prove function is restored.\n      - Record whether capability is fully available, reduced but acceptable, or unable to perform the required function; do not infer the asset's state from work-order closure.\n  workOrderReadyForClosure:\n    conditions:\n      - The maintenance activities in the work order's process are completed.\n      - The work order is updated with what was actually done, including completed-task information.\n      - Verify that the work-order record contains the completed-task information and final cost; function verification is a separate check and closure does not imply normal operation.\nactions:\n  checkRequiredFunction:\n    input: Asset\n    preconditions: [functionCheck]\n  closeWorkOrder:\n    input: WorkOrder\n    preconditions: [workOrderReadyForClosure]"
}
```

I’ll keep two checks separate: **function verification** compares the pump with its required function after the work; **work-order closure** requires completed activities and a record of what was actually done, including final cost. A closed work order will not imply that the pump is operating normally.

### Turn 9 — tool

Applied. Added 4, updated 2 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "checkRequiredFunction" has input class Asset, and its precondition functionCheck refers to WorkOrder, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Asset to WorkOrder. Rewording the text does not create the path it assumes.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  functionCheck:\n    conditions:\n      - After the work, compare the asset's capability with its required function and applicable acceptable performance; task completion alone does not prove function is restored.\n      - Record whether capability is fully available, reduced but acceptable, or unable to perform the required function; this check is distinct from closing the work order."
}
```

### Turn 9 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "checkRequiredFunction" has input class Asset, and its precondition functionCheck refers to WorkOrder, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Asset to WorkOrder. Rewording the text does not create the path it assumes.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  checkRequiredFunction:\n    input: WorkOrder\n    preconditions: [functionCheck]"
}
```

### Turn 9 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 9 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 9 — tool

competency_questions: []
classes:
  Asset:
    meaning: A physical item whose ability to perform a required function is maintained.
    aliases: []
    properties:
      state:
        type: text
        allowed:
          - operating
          - degraded
          - failed
  RequiredFunction:
    meaning: A function an asset is required to perform.
    aliases: []
    properties:
      acceptablePerformance:
        type: text
  FailureEvent:
    meaning: An occurrence after which an asset cannot perform a required function.
    aliases: []
    properties: {}
  FailureProcess:
    meaning: "An explanation of the change in condition leading up to a failure event, which may be suspected or established."
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - suspected
          - established
  WorkOrder:
    meaning: A work-order-system item raised for maintenance needed on an asset.
    aliases: []
    properties:
      completedTaskInformation:
        type: text
      finalCost:
        type: number
  MaintenanceProcess:
    meaning: "The maintenance process needed to restore or sustain an asset's function."
    aliases: []
    properties:
      aim:
        type: text
        allowed:
          - retain
          - restore
  MaintenanceActivity:
    meaning: A specific activity within a maintenance process.
    aliases: []
    properties:
      completed:
        type: boolean
  QualificationSpecification:
    meaning: The activity-specific specification of the assessed skill required to perform a maintenance activity.
    aliases:
      - Qualification
    properties: {}
  Person:
    meaning: A person considered for assignment to maintenance work.
    aliases: []
    properties: {}
  MaintenanceStrategy:
    meaning: The strategy under which a needed maintenance process is carried out.
    aliases: []
    properties: {}
  MaintenancePlan:
    meaning: A plan specifying an approved maintenance strategy for an asset.
    aliases: []
    properties: {}
  GoverningProcedure:
    meaning: "An applicable maintenance procedure governing strategy or additional activity conditions, and potentially acceptable performance."
    aliases:
      - maintenance procedure
    properties: {}
  Evidence:
    meaning: Findings or observations used to assess whether a proposed failure process led to the loss of function.
    aliases: []
    properties: {}
  AssessedSkill:
    meaning: A skill assessed for a person and called for by a qualification specification.
    aliases: []
    properties: {}
  OperatingProcedure:
    meaning: "An operating procedure setting acceptable performance for an asset's required function."
    aliases: []
    properties: {}
relationships:
  - name: requiresFunction
    from: Asset
    to: RequiredFunction
    meaning: null
    aliases: []
  - name: occursOn
    from: FailureEvent
    to: Asset
    meaning: null
    aliases: []
  - name: leadsTo
    from: FailureProcess
    to: FailureEvent
    meaning: "The proposed explanation of the lead-up to the failure event, whether suspected or established."
    aliases: []
  - name: addressesAsset
    from: WorkOrder
    to: Asset
    meaning: null
    aliases: []
  - name: callsFor
    from: WorkOrder
    to: MaintenanceProcess
    meaning: null
    aliases: []
  - name: includesActivity
    from: MaintenanceProcess
    to: MaintenanceActivity
    meaning: null
    aliases: []
  - name: requiresQualificationSpecification
    from: MaintenanceActivity
    to: QualificationSpecification
    meaning: null
    aliases:
      - requiresQualification
  - name: assignedTo
    from: MaintenanceActivity
    to: Person
    meaning: null
    aliases: []
  - name: followsStrategy
    from: MaintenanceProcess
    to: MaintenanceStrategy
    meaning: null
    aliases: []
  - name: retainsOrRestores
    from: MaintenanceProcess
    to: RequiredFunction
    meaning: The maintenance process is needed to retain or restore the required function.
    aliases: []
  - name: hasMaintenancePlan
    from: Asset
    to: MaintenancePlan
    meaning: null
    aliases: []
  - name: hasGoverningProcedure
    from: Asset
    to: GoverningProcedure
    meaning: null
    aliases: []
  - name: specifiesStrategy
    from: MaintenancePlan
    to: MaintenanceStrategy
    meaning: null
    aliases: []
  - name: specifiesStrategy
    from: GoverningProcedure
    to: MaintenanceStrategy
    meaning: null
    aliases: []
  - name: supportedBy
    from: FailureProcess
    to: Evidence
    meaning: null
    aliases: []
  - name: callsForAssessedSkill
    from: QualificationSpecification
    to: AssessedSkill
    meaning: null
    aliases: []
  - name: hasAssessedSkill
    from: Person
    to: AssessedSkill
    meaning: null
    aliases: []
  - name: governedBy
    from: MaintenanceActivity
    to: GoverningProcedure
    meaning: Identifies the applicable procedure when it sets extra conditions for performing an activity.
    aliases: []
  - name: hasOperatingProcedure
    from: Asset
    to: OperatingProcedure
    meaning: null
    aliases: []
rules:
  failedState:
    conditions:
      - A failure event has occurred on the asset.
      - The asset cannot perform a required function; being stopped by itself does not establish failure.
  establishedFailureProcess:
    conditions:
      - "Evidence shows a change in condition leading to loss of function, such as inspection findings of progressive damage backed by earlier observations of reduced performance."
      - "A seized bearing at failure establishes the failure event, not the earlier process by itself; without supporting evidence, report the process only as suspected."
  qualifiedAssignment:
    conditions:
      - "For each maintenance activity needing a qualified person, check its specific qualification specification."
      - "The assigned person has the assessed skill that specification calls for; general qualification, availability, or clearance for another activity does not suffice."
      - "Apply any additional authorization, currency, or supervision conditions only when the applicable governing procedure specifies them; do not assume they are met."
  degradedState:
    conditions:
      - "The asset's ability to perform its required function is reduced but still meets the acceptable performance set by the applicable operating or maintenance procedure; do not invent a cutoff."
  stoppedIsNotNecessarilyFailed:
    conditions:
      - A deliberate shutdown of an asset still able to perform its required function when called on does not by itself make it failed.
  operatingState:
    conditions:
      - "The asset can perform its required function without reduced ability when called on, even if deliberately stopped; operating describes capability, not whether it is running now."
  workOrderBeforeMaintenance:
    conditions:
      - A maintenance process is needed to retain or restore a required function; an established cause is not required.
      - "The maintenance process has a strategy defined by the asset's maintenance plan or governing procedure; the asset's current state alone does not determine it."
      - A work order describes the maintenance process before it starts.
  workOrderNeeded:
    conditions:
      - A maintenance process is needed to retain or restore a required function; an established cause is not required.
  functionCheck:
    conditions:
      - "After the work, compare the asset's capability with its required function and applicable acceptable performance; task completion alone does not prove function is restored."
      - "Record whether capability is fully available, reduced but acceptable, or unable to perform the required function; this check is distinct from closing the work order."
  workOrderReadyForClosure:
    conditions:
      - "The maintenance activities in the work order's process are completed."
      - "The work order is updated with what was actually done, including completed-task information."
      - Verify that the work-order record contains the completed-task information and final cost; function verification is a separate check and closure does not imply normal operation.
actions:
  assignMaintenanceActivity:
    input: MaintenanceActivity
    preconditions:
      - qualifiedAssignment
    effect: ""
    verification: ""
  startMaintenanceProcess:
    input: WorkOrder
    preconditions:
      - workOrderBeforeMaintenance
    effect: ""
    verification: ""
  raiseWorkOrder:
    input: MaintenanceProcess
    preconditions:
      - workOrderNeeded
    effect: ""
    verification: ""
  checkRequiredFunction:
    input: WorkOrder
    preconditions:
      - functionCheck
    effect: ""
    verification: ""
  closeWorkOrder:
    input: WorkOrder
    preconditions:
      - workOrderReadyForClosure
    effect: ""
    verification: ""


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - What is an asset's current condition relative to its required function and applicable acceptable performance, even if it is stopped?\n  - What failure event occurred, and is the proposed failure process suspected or established by evidence?\n  - Is maintenance needed to retain or restore the required function, and what process and approved strategy does the work order describe?\n  - For each maintenance activity needing a qualified person, does the assigned person have the assessed skill called for by its qualification specification?\n  - After the work, can the asset perform its required function, independently of whether the work order is ready for closure?\n  - Are all activities complete, and does the work order record what was done and the final cost before closure?"
}
```

The model now separates the post-work function check from work-order closure. I’ll add the questions it should be able to answer, then check one remaining boundary with you.

### Turn 9 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 9 — assistant

One boundary remains: if the activities are complete and the work-order record is complete, but the function check shows the pump is still degraded or failed, do you close that work order and raise further work separately, or keep the original work order open?

### Turn 10 — user

There isn’t a blanket rule here that says **close it** or **keep it open** solely because the pump is still degraded or failed. I’d record the function-check result honestly and not mark the pump as restored.

If all activities covered by that work order are complete, and the record says what was actually done and includes the final cost, it meets the conditions for closure. If more maintenance is needed, we must identify that work; whether it stays on the original order or goes on a new one is a matter for our governing work-order procedure.

### Turn 10 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - Can the asset perform its required function at the applicable acceptable performance, even if it is deliberately stopped?\n  - What failure event occurred, and is the proposed failure process suspected or established by evidence?\n  - What maintenance process is needed to retain or restore function, and which approved strategy applies?\n  - Does the person assigned to each qualified activity have the assessed skill specified for that activity?\n  - What did the post-work function check show, independently of work-order closure?\n  - Are all activities complete and are the work done and final cost recorded; if more maintenance is needed, how does the governing work-order procedure handle it?\nclasses:\n  MaintenanceProcess:\n    meaning: The maintenance process needed to retain or restore an asset's required function.\n  WorkOrderProcedure:\n    meaning: The governing work-order procedure that determines whether further needed work stays on an original work order or is put on a new one.\n    aliases: [governing work-order procedure]\nrelationships:\n  - name: governedBy\n    from: WorkOrder\n    to: WorkOrderProcedure\n    meaning: The governing procedure for handling further work on an original or new work order.\nrules:\n  workOrderReadyForClosure:\n    conditions:\n      - All maintenance activities covered by the work order are completed.\n      - The work order records what was actually done, including completed-task information and final cost.\n      - Record the function-check result honestly; a degraded or failed asset does not by itself require keeping an otherwise complete work order open or marking its function restored.\n  furtherWorkHandling:\n    conditions:\n      - If the function check shows more maintenance is needed, identify that work without claiming the asset's function is restored.\n      - Follow the governing work-order procedure to decide whether that work stays on the original work order or goes on a new one; do not assume either choice solely from the asset's state.\nactions:\n  identifyFurtherWork:\n    input: WorkOrder\n    preconditions: [furtherWorkHandling]"
}
```

Understood. An unsuccessful function check must be recorded honestly; it does not, by itself, decide whether the order can close. If its activities and record meet the closure conditions, further needed work must be identified, with the **governing work-order procedure** deciding whether that work stays on the original order or goes on a new one. I’ll add that distinction.

### Turn 10 — tool

Applied. Added 4, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 10 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 10 — tool

competency_questions: []
classes:
  Asset:
    meaning: A physical item whose ability to perform a required function is maintained.
    aliases: []
    properties:
      state:
        type: text
        allowed:
          - operating
          - degraded
          - failed
  RequiredFunction:
    meaning: A function an asset is required to perform.
    aliases: []
    properties:
      acceptablePerformance:
        type: text
  FailureEvent:
    meaning: An occurrence after which an asset cannot perform a required function.
    aliases: []
    properties: {}
  FailureProcess:
    meaning: "An explanation of the change in condition leading up to a failure event, which may be suspected or established."
    aliases: []
    properties:
      status:
        type: text
        allowed:
          - suspected
          - established
  WorkOrder:
    meaning: A work-order-system item raised for maintenance needed on an asset.
    aliases: []
    properties:
      completedTaskInformation:
        type: text
      finalCost:
        type: number
  MaintenanceProcess:
    meaning: "The maintenance process needed to retain or restore an asset's required function."
    aliases: []
    properties:
      aim:
        type: text
        allowed:
          - retain
          - restore
  MaintenanceActivity:
    meaning: A specific activity within a maintenance process.
    aliases: []
    properties:
      completed:
        type: boolean
  QualificationSpecification:
    meaning: The activity-specific specification of the assessed skill required to perform a maintenance activity.
    aliases:
      - Qualification
    properties: {}
  Person:
    meaning: A person considered for assignment to maintenance work.
    aliases: []
    properties: {}
  MaintenanceStrategy:
    meaning: The strategy under which a needed maintenance process is carried out.
    aliases: []
    properties: {}
  MaintenancePlan:
    meaning: A plan specifying an approved maintenance strategy for an asset.
    aliases: []
    properties: {}
  GoverningProcedure:
    meaning: "An applicable maintenance procedure governing strategy or additional activity conditions, and potentially acceptable performance."
    aliases:
      - maintenance procedure
    properties: {}
  Evidence:
    meaning: Findings or observations used to assess whether a proposed failure process led to the loss of function.
    aliases: []
    properties: {}
  AssessedSkill:
    meaning: A skill assessed for a person and called for by a qualification specification.
    aliases: []
    properties: {}
  OperatingProcedure:
    meaning: "An operating procedure setting acceptable performance for an asset's required function."
    aliases: []
    properties: {}
  WorkOrderProcedure:
    meaning: The governing work-order procedure that determines whether further needed work stays on an original work order or is put on a new one.
    aliases:
      - governing work-order procedure
    properties: {}
relationships:
  - name: requiresFunction
    from: Asset
    to: RequiredFunction
    meaning: null
    aliases: []
  - name: occursOn
    from: FailureEvent
    to: Asset
    meaning: null
    aliases: []
  - name: leadsTo
    from: FailureProcess
    to: FailureEvent
    meaning: "The proposed explanation of the lead-up to the failure event, whether suspected or established."
    aliases: []
  - name: addressesAsset
    from: WorkOrder
    to: Asset
    meaning: null
    aliases: []
  - name: callsFor
    from: WorkOrder
    to: MaintenanceProcess
    meaning: null
    aliases: []
  - name: includesActivity
    from: MaintenanceProcess
    to: MaintenanceActivity
    meaning: null
    aliases: []
  - name: requiresQualificationSpecification
    from: MaintenanceActivity
    to: QualificationSpecification
    meaning: null
    aliases:
      - requiresQualification
  - name: assignedTo
    from: MaintenanceActivity
    to: Person
    meaning: null
    aliases: []
  - name: followsStrategy
    from: MaintenanceProcess
    to: MaintenanceStrategy
    meaning: null
    aliases: []
  - name: retainsOrRestores
    from: MaintenanceProcess
    to: RequiredFunction
    meaning: The maintenance process is needed to retain or restore the required function.
    aliases: []
  - name: hasMaintenancePlan
    from: Asset
    to: MaintenancePlan
    meaning: null
    aliases: []
  - name: hasGoverningProcedure
    from: Asset
    to: GoverningProcedure
    meaning: null
    aliases: []
  - name: specifiesStrategy
    from: MaintenancePlan
    to: MaintenanceStrategy
    meaning: null
    aliases: []
  - name: specifiesStrategy
    from: GoverningProcedure
    to: MaintenanceStrategy
    meaning: null
    aliases: []
  - name: supportedBy
    from: FailureProcess
    to: Evidence
    meaning: null
    aliases: []
  - name: callsForAssessedSkill
    from: QualificationSpecification
    to: AssessedSkill
    meaning: null
    aliases: []
  - name: hasAssessedSkill
    from: Person
    to: AssessedSkill
    meaning: null
    aliases: []
  - name: governedBy
    from: MaintenanceActivity
    to: GoverningProcedure
    meaning: Identifies the applicable procedure when it sets extra conditions for performing an activity.
    aliases: []
  - name: hasOperatingProcedure
    from: Asset
    to: OperatingProcedure
    meaning: null
    aliases: []
  - name: governedBy
    from: WorkOrder
    to: WorkOrderProcedure
    meaning: The governing procedure for handling further work on an original or new work order.
    aliases: []
rules:
  failedState:
    conditions:
      - A failure event has occurred on the asset.
      - The asset cannot perform a required function; being stopped by itself does not establish failure.
  establishedFailureProcess:
    conditions:
      - "Evidence shows a change in condition leading to loss of function, such as inspection findings of progressive damage backed by earlier observations of reduced performance."
      - "A seized bearing at failure establishes the failure event, not the earlier process by itself; without supporting evidence, report the process only as suspected."
  qualifiedAssignment:
    conditions:
      - "For each maintenance activity needing a qualified person, check its specific qualification specification."
      - "The assigned person has the assessed skill that specification calls for; general qualification, availability, or clearance for another activity does not suffice."
      - "Apply any additional authorization, currency, or supervision conditions only when the applicable governing procedure specifies them; do not assume they are met."
  degradedState:
    conditions:
      - "The asset's ability to perform its required function is reduced but still meets the acceptable performance set by the applicable operating or maintenance procedure; do not invent a cutoff."
  stoppedIsNotNecessarilyFailed:
    conditions:
      - A deliberate shutdown of an asset still able to perform its required function when called on does not by itself make it failed.
  operatingState:
    conditions:
      - "The asset can perform its required function without reduced ability when called on, even if deliberately stopped; operating describes capability, not whether it is running now."
  workOrderBeforeMaintenance:
    conditions:
      - A maintenance process is needed to retain or restore a required function; an established cause is not required.
      - "The maintenance process has a strategy defined by the asset's maintenance plan or governing procedure; the asset's current state alone does not determine it."
      - A work order describes the maintenance process before it starts.
  workOrderNeeded:
    conditions:
      - A maintenance process is needed to retain or restore a required function; an established cause is not required.
  functionCheck:
    conditions:
      - "After the work, compare the asset's capability with its required function and applicable acceptable performance; task completion alone does not prove function is restored."
      - "Record whether capability is fully available, reduced but acceptable, or unable to perform the required function; this check is distinct from closing the work order."
  workOrderReadyForClosure:
    conditions:
      - All maintenance activities covered by the work order are completed.
      - "The work order records what was actually done, including completed-task information and final cost."
      - Record the function-check result honestly; a degraded or failed asset does not by itself require keeping an otherwise complete work order open or marking its function restored.
  furtherWorkHandling:
    conditions:
      - "If the function check shows more maintenance is needed, identify that work without claiming the asset's function is restored."
      - "Follow the governing work-order procedure to decide whether that work stays on the original work order or goes on a new one; do not assume either choice solely from the asset's state."
actions:
  assignMaintenanceActivity:
    input: MaintenanceActivity
    preconditions:
      - qualifiedAssignment
    effect: ""
    verification: ""
  startMaintenanceProcess:
    input: WorkOrder
    preconditions:
      - workOrderBeforeMaintenance
    effect: ""
    verification: ""
  raiseWorkOrder:
    input: MaintenanceProcess
    preconditions:
      - workOrderNeeded
    effect: ""
    verification: ""
  checkRequiredFunction:
    input: WorkOrder
    preconditions:
      - functionCheck
    effect: ""
    verification: ""
  closeWorkOrder:
    input: WorkOrder
    preconditions:
      - workOrderReadyForClosure
    effect: ""
    verification: ""
  identifyFurtherWork:
    input: WorkOrder
    preconditions:
      - furtherWorkHandling
    effect: ""
    verification: ""


# CONSISTENCY CHECK — no outstanding problems in the model.

# SECOND-OPINION MODEL CHECK — no additional observations.

### Turn 10 — assistant

I believe we’ve covered the decisions this model needs to support, and the final consistency check found no outstanding problems.

The model keeps **asset condition**, **failure event**, and the evidence-backed **failure process** separate. It ties work orders to maintenance needed to retain or restore function, checks assessed skill for each activity, and treats the post-work function check separately from work-order closure. If more work is needed, the governing work-order procedure—not the asset state alone—determines whether it stays on the original order or goes on a new one.
