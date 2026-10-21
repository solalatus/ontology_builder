classes:
  MaintainableItem:
    meaning: "A physical item whose required function and maintenance state need to be assessed."
    aliases:
      - item
    properties: {}
  MaintenanceState:
    meaning: "A period during which an item's functions, capabilities, or performance remain unchanged."
    aliases: []
    properties:
      stateCategory:
        type: text
        allowed:
          - operating
          - degraded
          - failed
  RequiredFunction:
    meaning: "The job a maintainable item needs to perform."
    aliases:
      - primary function
    properties: {}
  FunctioningProcess:
    meaning: "An item actually performing its job."
    aliases: []
    properties: {}
  FailureEvent:
    meaning: "An occurrence that causes an item to lose the ability to perform its required function and begins a failed state."
    aliases:
      - failure
    properties: {}
  FailureProcess:
    meaning: "A change in some quality of an item that can result in a degraded or failed state."
    aliases:
      - functional failure
    properties: {}
  FailureEffect:
    meaning: "A consequential process following a failure event, within or beyond the failed item."
    aliases: []
    properties: {}
  MaintenanceProcess:
    meaning: "Work under a maintenance strategy to retain or restore a maintainable item's function."
    aliases: []
    properties: {}
  MaintenanceActivity:
    meaning: "A single maintenance task within a maintenance process, intended to retain or restore function."
    aliases: []
    properties: {}
  MaintenanceStrategy:
    meaning: "The approach under which a maintenance process is carried out."
    aliases: []
    properties: {}
  MaintenanceWorkOrderRecord:
    meaning: "A record describing a maintenance process rather than the work itself."
    aliases:
      - work order
      - MWO
    properties:
      cost:
        type: number
  MaintenancePerson:
    meaning: "A person involved in maintenance work whose job label alone does not qualify them for a particular activity."
    aliases:
      - maintenance tech
    properties: {}
  QualificationSpecification:
    meaning: "The assessed-skill requirement for a particular maintenance activity."
    aliases: []
    properties: {}

relationships:
  - name: begins
    from: FailureEvent
    to: MaintenanceState
    meaning: "A failure event begins the particular maintenance state categorized as failed."
    aliases: []
  - name: resultsIn
    from: FailureProcess
    to: MaintenanceState
    meaning: "A known failure process results in a particular degraded or failed maintenance state."
    aliases: []
  - name: realizes
    from: FunctioningProcess
    to: RequiredFunction
    meaning: "A functioning process realizes the required function through the item's actual operation."
    aliases: []
  - name: hasFailureEffect
    from: FailureEvent
    to: FailureEffect
    meaning: "A failure event has a failure effect as a consequence."
    aliases: []
  - name: hasMaintenanceActivity
    from: MaintenanceProcess
    to: MaintenanceActivity
    meaning: "A maintenance process has maintenance activities that make up its maintenance tasks."
    aliases: []
  - name: isGovernedBy
    from: MaintenanceProcess
    to: MaintenanceStrategy
    meaning: "A maintenance process is governed by the strategy setting its approach."
    aliases:
      - prescribed by
  - name: describes
    from: MaintenanceWorkOrderRecord
    to: MaintenanceProcess
    meaning: "A maintenance work order record describes the maintenance process it tracks."
    aliases: []
  - name: requires
    from: MaintenanceActivity
    to: QualificationSpecification
    meaning: "A maintenance activity requires a qualification specification for its assessed skill."
    aliases:
      - prescribed by
  - name: isQualifiedFor
    from: MaintenancePerson
    to: MaintenanceActivity
    meaning: "A maintenance person confirmed to satisfy an activity's required specification is qualified for that activity, which does not mean they are assigned."
    aliases: []

rules:
  - name: stateCategoryMeaning
    conditions:
      - "Operating means the item can perform its required function."
      - "Degraded means reduced but still-acceptable performance."
      - "Failed means the item cannot perform its required function because a failure event occurred."
  - name: categorySpecificAnswerRequiresValidCategory
    conditions:
      - "A missing state category or a value other than operating, degraded, or failed cannot support a category-specific answer or verify a failed classification."
  - name: currentStateRequiresConfirmation
    conditions:
      - "A state's category or its existence does not establish that it is the item's current state; no method for selecting the current state from earlier states has been established."
  - name: qualificationIsTaskSpecific
    conditions:
      - "A maintenance person is qualified for a specified activity only after they are confirmed to satisfy the qualification specification that activity requires."
      - "Being qualified for an activity does not establish that the person was assigned to it."
  - name: closureRequiresEveryMaintenanceActivity
    conditions:
      - "Every maintenance activity in the process described by the work order must be confirmed as actually performed before closure."
      - "Supporting actions are not counted as those maintenance activities."
  - name: finalCostNeedsConfirmation
    conditions:
      - "A recorded cost cannot be verified as final merely because it is present or the work order has been closed."
      - "Final-cost verification is not a precondition for closing the work order."

actions:
  - name: classifyItemAsFailed
    input: MaintainableItem
    preconditions:
      - "Confirm that the supplied required function is the affected item's required function."
      - "Confirm that the failure event occurred."
      - "Confirm that the item can no longer perform that required function."
    effect: "Record a particular maintenance state categorized as failed for the item, identifying the confirmed failure event as the event that began it."
    verification: "Confirm that the item is tracked in that particular failed state; how to identify it as current remains open."
  - name: createMaintenanceWorkOrder
    input: MaintenanceProcess
    preconditions:
      - "Confirm that the process is needed to retain or restore the affected item's function."
    effect: "Create a maintenance work order record describing the specified process."
    verification: "Confirm that the created record describes that same process."
  - name: assignQualifiedMaintenancePerson
    input: MaintenanceActivity
    preconditions:
      - "Confirm that the specified activity requires a qualification specification."
      - "Confirm that the proposed maintenance person satisfies that specification."
    effect: "Assign the qualified person to the specified activity."
    verification: "Confirm that the assigned person is qualified for that activity; how to verify the assignment itself remains open."
  - name: startMaintenanceProcess
    input: MaintenanceProcess
    preconditions:
      - "Confirm that a maintenance strategy is defined for the process."
      - "Confirm that a maintenance work order record describes the process."
    effect: "Begin the maintenance process under its governing strategy."
    verification: "Confirm an active work order and activities assigned for execution; neither follows merely from the existence of the work order or the process's activity list."
  - name: closeMaintenanceWorkOrder
    input: MaintenanceWorkOrderRecord
    preconditions:
      - "Confirm that every maintenance activity in the process it describes was actually performed."
      - "Confirm that the record has been updated with information about what was actually performed."
    effect: "Update the work order record to reflect completion of the maintenance process."
    verification: "Confirm that the record contains completed-task information and that its recorded cost is the final amount; the method for confirming finality remains open."