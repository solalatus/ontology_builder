classes:
  MaintainablePhysicalItem:
    meaning: "A physical item maintained in its own right whose required function and condition can be assessed."
    aliases:
      - item
      - asset
  RequiredFunction:
    meaning: "What an item needs to do to meet a process requirement."
    aliases:
      - primary function
  MaintenanceState:
    meaning: "The state of a particular item during a period when its ability or level of performance remains unchanged."
    aliases:
      - condition
    properties:
      stateCategory:
        type: text
        allowed:
          - operating
          - degraded
          - failed
  FunctioningProcess:
    meaning: "A particular item actually performing its required function."
  FailureEvent:
    meaning: "An occurrence that causes an item to lose its ability to perform its required function and initiates its failed state."
    aliases:
      - failure
  FailureProcess:
    meaning: "A change in an item that leaves it degraded or unable to perform its required function."
    aliases:
      - functional failure
  FailureEffect:
    meaning: "A consequence of a failure event within or beyond the failed item's boundary."
  UndesirableDisposition:
    meaning: "An item's tendency to undergo a process with an undesirable outcome."
    aliases:
      - failure mode
  DispositionToFail:
    meaning: "An item's tendency to undergo a failure process."
  DispositionToExhibitUndesirableBehavior:
    meaning: "An item's tendency toward behavior not expected under normal operating conditions, without necessarily losing its required function."
  FailureModeCode:
    meaning: "Recorded information that describes a particular undesirable disposition without establishing that a failure event occurred."
  MaintenanceProcess:
    meaning: "Work carried out under a maintenance strategy to retain or restore a particular item's required function."
  MaintenanceStrategy:
    meaning: "The approach under which a maintenance process is carried out."
  MaintenanceWorkOrderRecord:
    meaning: "A record describing a maintenance process, distinct from the work itself."
    aliases:
      - maintenance work order
      - work order
      - MWO
    properties:
      cost:
        type: number
      taskDescription:
        type: text
      taskCode:
        type: text
      workOrderDate:
        type: date
  MaintenanceActivity:
    meaning: "A single main task in a maintenance process that directly helps retain or restore an item's function."
  SupportingMaintenanceActivity:
    meaning: "A single action that helps execute a maintenance process without completing one of its main tasks."
  QualifiedMaintenancePerson:
    meaning: "A person qualified to perform a specified maintenance activity, without necessarily being available or assigned."
  QualificationSpecification:
    meaning: "The assessed skill required for a particular maintenance activity."

relationships:
  - name: isTheStateOf
    from: MaintenanceState
    to: MaintainablePhysicalItem
    meaning: "A maintenance state is the state of a particular item."
  - name: hasRequiredFunction
    from: MaintainablePhysicalItem
    to: RequiredFunction
    meaning: "The item needs to perform this function to meet a process requirement."
  - name: isPerformedBy
    from: FunctioningProcess
    to: MaintainablePhysicalItem
    meaning: "The functioning process is the particular item actually performing its function."
  - name: realizes
    from: FunctioningProcess
    to: RequiredFunction
    meaning: "The functioning process is the item actually performing its required function."
  - name: initiates
    from: FailureEvent
    to: MaintenanceState
    meaning: "A failure event initiates a failed maintenance state, not a degraded state."
  - name: resultsIn
    from: FailureProcess
    to: MaintenanceState
    meaning: "A failure process can leave the item in a degraded or failed state."
  - name: realizes
    from: FailureProcess
    to: DispositionToFail
    meaning: "When a disposition to fail has been identified, the failure process is how it shows itself."
  - name: hasAnEffect
    from: FailureEvent
    to: FailureEffect
    meaning: "A failure effect is a consequence of that failure event."
  - name: describes
    from: FailureModeCode
    to: UndesirableDisposition
    meaning: "A failure mode code describes a particular undesirable disposition."
  - name: canHave
    from: MaintainablePhysicalItem
    to: DispositionToExhibitUndesirableBehavior
    meaning: "A particular item can have a tendency toward behavior not expected under normal operating conditions."
  - name: isKindOf
    from: DispositionToFail
    to: UndesirableDisposition
    meaning: "A disposition to fail is a particular kind of undesirable disposition."
  - name: isKindOf
    from: DispositionToExhibitUndesirableBehavior
    to: UndesirableDisposition
    meaning: "A disposition to exhibit undesirable behavior is a particular kind of undesirable disposition."
  - name: describes
    from: MaintenanceWorkOrderRecord
    to: MaintenanceProcess
    meaning: "The work order record describes the maintenance process it covers, rather than being the work itself."
  - name: concerns
    from: MaintenanceProcess
    to: MaintainablePhysicalItem
    meaning: "The process concerns the particular item whose required function the work is meant to retain or restore."
  - name: isGovernedBy
    from: MaintenanceProcess
    to: MaintenanceStrategy
    meaning: "The strategy governs the approach under which the process is carried out."
  - name: hasMaintenanceActivities
    from: MaintenanceProcess
    to: MaintenanceActivity
    meaning: "The process has main maintenance activities whose completion matters when closing its work order."
  - name: hasSupportingMaintenanceActivities
    from: MaintenanceProcess
    to: SupportingMaintenanceActivity
    meaning: "The process has supporting actions that help execute it but do not complete its main tasks."
  - name: requires
    from: MaintenanceActivity
    to: QualificationSpecification
    meaning: "The activity requires the assessed skill identified by its qualification specification."
  - name: isQualifiedFor
    from: QualifiedMaintenancePerson
    to: MaintenanceActivity
    meaning: "The person satisfies the qualification requirement for this specific activity, whether or not they are assigned."
  - name: isAssignedTo
    from: MaintenanceActivity
    to: QualifiedMaintenancePerson
    meaning: "The person is designated to perform the activity, but assignment alone does not establish qualification."

rules:
  - name: canClassifyFailedState
    conditions:
      - The failure event is established to have occurred.
      - The particular item is established to be unable to perform its required function.
  - name: canClassifyDegradedState
    conditions:
      - The item is performing its required function with reduced ability.
      - The reduced performance is established as acceptable under the applicable requirement or governing procedure.
  - name: canClassifyOperatingState
    conditions:
      - The item is established to be able to perform its required function.
  - name: canAnswerCurrentState
    conditions:
      - Assess the particular item's present condition rather than assuming an older state or its parent item's state applies.
      - Account for evidence of reduced performance before answering operating rather than degraded; ability to perform alone does not settle that distinction.
      - If reduction or its acceptability cannot be established, leave the current-state category unconfirmed rather than forcing an answer.
  - name: canAssignQualifiedPerson
    conditions:
      - The specific maintenance activity requires an identified qualification specification.
      - The proposed person is established to satisfy that requirement for this activity.
  - name: canIssueMaintenanceWorkOrder
    conditions:
      - The target item and its required function are identified.
      - The proposed maintenance process is needed to retain or restore that item's required function.
  - name: canStartMaintenanceProcess
    conditions:
      - A maintenance strategy is defined for and governs the process.
      - An existing maintenance work order record describes the process.
  - name: canCloseMaintenanceWorkOrder
    conditions:
      - Every main maintenance activity in the process described by the work order is reliably confirmed complete.
      - The work order record contains information about what was actually performed.
  - name: codeAndFailureProcessReferToSameTendency
    conditions:
      - The disposition described by the code is established to be the very disposition to fail realized by the failure process.
      - Both references concern the same identified tendency of the same item; a shared kind or failure account alone is insufficient.

actions:
  - name: recordItemAsFailed
    input: FailureEvent
    preconditions:
      - Establish that the failure event occurred.
      - Establish that the affected item can no longer perform its required function.
    effect: "Record the affected item's failed maintenance state as initiated by the event."
    verification: "Confirm that the particular item is tracked as failed."
  - name: createMaintenanceWorkOrder
    input: MaintenanceProcess
    preconditions:
      - Establish that the process is needed to retain or restore the identified item's required function.
    effect: "Create a maintenance work order record describing the proposed process without starting the work."
    verification: "Confirm that the new record describes the intended process for the identified item, not merely that a record exists."
  - name: assignQualifiedMaintenancePerson
    input: MaintenanceActivity
    preconditions:
      - Establish the qualification specification required by this activity.
      - Establish that the proposed person satisfies it for this specific activity.
    effect: "Designate the proposed person as assigned to the activity."
    verification: "Confirm both that the assignment was made and that the assigned person is qualified for this activity."
  - name: startMaintenanceProcess
    input: MaintenanceProcess
    preconditions:
      - A maintenance strategy is defined for the process.
      - An existing maintenance work order record describes the process.
    effect: "Begin carrying out the process under its defined strategy."
    verification: "Reliably confirm that its describing work order is active and its main maintenance activities are assigned."
  - name: closeMaintenanceWorkOrder
    input: MaintenanceWorkOrderRecord
    preconditions:
      - Reliably confirm completion of every main maintenance activity in the process the record describes.
      - Confirm that the record has been updated with information about what was actually performed.
    effect: "Update the work order record to reflect completion."
    verification: "Confirm that the record contains completed task information and a recorded cost independently confirmed as final."