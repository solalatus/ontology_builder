classes:
  Asset:
    meaning: "A physical item being maintained."
    aliases:
      - maintainable item
    properties: {}
  RequiredFunction:
    meaning: "What an asset needs to do."
    aliases:
      - primary function
    properties: {}
  FunctioningProcess:
    meaning: "An asset actually performing its required function."
    aliases: []
    properties: {}
  MaintenanceState:
    meaning: "A period during which an asset’s functions, capabilities, or level of performance remain unchanged."
    aliases: []
    properties:
      stateCategory:
        type: text
        allowed:
          - operating
          - degraded
          - failed
  OperatingState:
    meaning: "A kind of maintenance state in which an asset can perform its required function."
    aliases: []
    properties: {}
  DegradedState:
    meaning: "A kind of maintenance state in which an asset performs its required function with reduced ability that remains acceptable."
    aliases: []
    properties: {}
  FailedState:
    meaning: "A particular maintenance state begun by a failure event in which an asset cannot perform a required function."
    aliases: []
    properties: {}
  FailureProcess:
    meaning: "A change in some quality of an asset that can leave it degraded or failed."
    aliases:
      - functional failure
    properties: {}
  FailureEvent:
    meaning: "An occurrence that causes an asset to lose its ability to perform a required function and begins a failed state."
    aliases:
      - failure
    properties: {}
  FailureEffect:
    meaning: "A downstream consequence of a failure event within or beyond the asset’s boundary."
    aliases: []
    properties: {}
  UndesirableDisposition:
    meaning: "A tendency toward an unwanted outcome rather than an occurrence that has already happened."
    aliases:
      - failure mode
    properties: {}
  DispositionToFail:
    meaning: "A particular failure-related tendency that a failure process realizes."
    aliases: []
    properties: {}
  FailureModeCode:
    meaning: "A separate piece of recorded information that describes an undesirable disposition rather than a particular event or effect."
    aliases: []
    properties: {}
  MaintenanceWorkOrderRecord:
    meaning: "A record describing a maintenance process rather than the work itself."
    aliases:
      - work order
      - MWO
    properties:
      workOrderDate:
        type: date
      taskDescription:
        type: text
      taskCode:
        type: text
      cost:
        type: number
  MaintenanceProcess:
    meaning: "Work carried out under a maintenance strategy to retain or restore function."
    aliases: []
    properties: {}
  MaintenanceActivity:
    meaning: "One main maintenance task within a maintenance process."
    aliases:
      - task
    properties: {}
  MaintenanceStrategy:
    meaning: "The approach governing a maintenance process and intended to help an asset meet its objectives."
    aliases: []
    properties: {}
  QualificationSpecification:
    meaning: "A specification of the assessed skill required for a particular maintenance activity."
    aliases: []
    properties: {}
  QualifiedMaintenancePerson:
    meaning: "A person qualified to perform a particular maintenance activity, whether or not they have been assigned to it."
    aliases: []
    properties: {}

relationships:
  - name: isKindOf
    from: OperatingState
    to: MaintenanceState
    meaning: "An operating state is a kind of maintenance state."
    aliases: []
  - name: isKindOf
    from: DegradedState
    to: MaintenanceState
    meaning: "A degraded state is a kind of maintenance state."
    aliases: []
  - name: isKindOf
    from: FailedState
    to: MaintenanceState
    meaning: "A failed state is a kind of maintenance state."
    aliases: []
  - name: isKindOf
    from: DispositionToFail
    to: UndesirableDisposition
    meaning: "A disposition to fail is a failure-related kind of undesirable disposition, without establishing that it is the particular tendency described by a given code."
    aliases: []
  - name: realizes
    from: FunctioningProcess
    to: RequiredFunction
    meaning: "The asset’s actual functioning realizes what it is required to do."
    aliases: []
  - name: initiates
    from: FailureEvent
    to: FailedState
    meaning: "A failure event begins a particular failed state."
    aliases: []
  - name: resultsIn
    from: FailureProcess
    to: FailedState
    meaning: "A failure process can result in a failed state."
    aliases: []
  - name: resultsIn
    from: FailureProcess
    to: DegradedState
    meaning: "A failure process can result in a degraded state."
    aliases: []
  - name: realizes
    from: FailureProcess
    to: DispositionToFail
    meaning: "A failure process realizes a particular disposition to fail."
    aliases: []
  - name: hasEffect
    from: FailureEvent
    to: FailureEffect
    meaning: "A failure event has a downstream consequence within or beyond the asset."
    aliases: []
  - name: describes
    from: FailureModeCode
    to: UndesirableDisposition
    meaning: "A failure mode code describes a known tendency, not a particular event or effect."
    aliases: []
  - name: describes
    from: MaintenanceWorkOrderRecord
    to: MaintenanceProcess
    meaning: "A work order record describes the maintenance process it covers, not its activities directly."
    aliases: []
  - name: includes
    from: MaintenanceProcess
    to: MaintenanceActivity
    meaning: "A maintenance process includes its main maintenance tasks."
    aliases: []
  - name: governedBy
    from: MaintenanceProcess
    to: MaintenanceStrategy
    meaning: "A maintenance process is carried out under its governing maintenance strategy."
    aliases:
      - the maintenance strategy governs the maintenance process
      - prescribed by
  - name: requires
    from: MaintenanceActivity
    to: QualificationSpecification
    meaning: "A maintenance activity requires the assessed skill stated by its qualification specification."
    aliases:
      - prescribed by
  - name: qualifiedFor
    from: QualifiedMaintenancePerson
    to: MaintenanceActivity
    meaning: "A person meets an activity’s qualification requirement, which does not mean they were assigned to it."
    aliases: []

rules:
  - name: classifyOperatingState
    conditions:
      - The asset can perform its required function.
      - If it performs at an acceptable reduced level, classify it more specifically as degraded.
  - name: classifyDegradedState
    conditions:
      - The asset performs its required function with reduced ability.
      - The reduced performance remains acceptable under an applicable operating requirement or approved procedure; no threshold was established in this interview.
  - name: classifyFailedState
    conditions:
      - A failure event occurred.
      - The affected asset can no longer perform its required function.
      - A state category alone does not establish these facts or identify the affected asset.
  - name: createMaintenanceWorkOrderCheck
    conditions:
      - A maintenance process is needed to retain or restore function.
  - name: assignQualifiedMaintenancePersonCheck
    conditions:
      - The maintenance activity’s required qualification specification is established.
      - The proposed person satisfies that requirement for this particular activity; job title or qualification for another activity is insufficient.
  - name: startMaintenanceProcessCheck
    conditions:
      - A maintenance strategy is defined for the process.
      - A maintenance work order record describes the process.
  - name: closeMaintenanceWorkOrderCheck
    conditions:
      - The process’s main maintenance activities are complete.
      - The work order record has been updated with information about what was performed.
      - Task description and cost alone do not establish either pre-close condition.

actions:
  - name: recordAssetAsFailed
    input: FailureEvent
    preconditions:
      - Identify the affected asset and establish that the failure event occurred.
      - Establish that the asset can no longer perform its required function; the evidence source and asset-to-state path remain unresolved.
    effect: "Record a failed state for the affected asset."
    verification: "Confirm that the named asset is tracked as failed; the confirmed relationships do not yet support this read-back."
  - name: createMaintenanceWorkOrder
    input: MaintenanceProcess
    preconditions:
      - The process is needed to retain or restore function.
    effect: "Create a maintenance work order record describing the process."
    verification: "Confirm that the new record describes the intended process."
  - name: assignQualifiedMaintenancePerson
    input: MaintenanceActivity
    preconditions:
      - Establish the activity’s required qualification specification.
      - Establish that the proposed person satisfies it for this activity.
    effect: "Assign that qualified maintenance person to the activity."
    verification: "Confirm who was actually assigned and that they are qualified for the activity; how to read back the assignment remains unresolved."
  - name: startMaintenanceProcess
    input: MaintenanceProcess
    preconditions:
      - A maintenance strategy is defined for the process.
      - A maintenance work order record describes the process.
    effect: "Begin the process under its maintenance strategy."
    verification: "Confirm an active work order and assigned activities; neither read-back path has been established."
  - name: closeMaintenanceWorkOrder
    input: MaintenanceWorkOrderRecord
    preconditions:
      - The process’s main maintenance activities are complete.
      - The record has been updated with what was performed; the sources for completion and performed-work evidence remain unresolved.
    effect: "Update the work order record to reflect completion of the maintenance process."
    verification: "Confirm that the record contains completed task information and a reliable final cost; task description and cost alone do not prove the pre-close checks."