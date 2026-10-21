classes:
  PurchaseOrder:
    meaning: "An agreement requesting or authorising the supply of goods or services."
    aliases: [order]
    properties: {}
  Shipment:
    meaning: "A traceable unit of goods being prepared, moved, or received."
    aliases: []
    properties: {}
  MaterialTradeItem:
    meaning: "A material item treated as tradable in supply-chain work."
    aliases: []
    properties: {}
  TraceableResourceUnit:
    meaning: "The broader category used for a traceable unit before its specific kind is identified."
    aliases: []
    properties: {}
  Lot:
    meaning: "A traceable production or supply batch used for batch-level control."
    aliases: []
    properties: {}
  Sublot:
    meaning: "A traceable subdivision of a lot, identified more specifically than its parent lot."
    aliases: []
    properties: {}
  LogisticUnit:
    meaning: "A traceable handling unit used in storage and transport."
    aliases: [handling unit]
    properties: {}
  Load:
    meaning: "A traceable load unit prepared for handling or transport."
    aliases: []
    properties: {}
  TrackingEvent:
    meaning: "A recorded event about the movement, handling, or state of an identified shipment, lot, logistic unit, or load."
    aliases: []
    properties:
      eventDate:
        type: date
      eventType:
        type: text
  ShipmentPreparationProcess:
    meaning: "The work that gets a shipment ready for dispatch."
    aliases: []
    properties: {}
  TransportProcess:
    meaning: "The actual movement of goods with a starting and ending supply-chain node."
    aliases: []
    properties: {}
  ReceivingProcess:
    meaning: "The work of receiving incoming goods or a shipment at a facility."
    aliases: []
    properties: {}
  Location:
    meaning: "A geographically identified place that can serve as a shipment's ship-from or ship-to location."
    aliases: []
    properties: {}
  Facility:
    meaning: "A physical site where supply-chain work such as preparation or receiving occurs."
    aliases: []
    properties: {}
  SupplyChainNode:
    meaning: "An origin, destination, or operating point used to describe a transport process."
    aliases: []
    properties: {}
  Supplier:
    meaning: "A trading partner that supplies goods or services to a customer."
    aliases: []
    properties: {}
  Customer:
    meaning: "A trading partner that receives supplied goods or services."
    aliases: []
    properties: {}
  SupplyRelationship:
    meaning: "A supply dependency involving a supplier, customer, and material trade item."
    aliases: []
    properties: {}
  Carrier:
    meaning: "A supplier that carries or transports shipments rather than merely arranging their movement."
    aliases: []
    properties: {}
  FreightForwarder:
    meaning: "An agent that arranges freight-forwarding activity and services without necessarily carrying the shipment."
    aliases: []
    properties: {}
  TransportationService:
    meaning: "A service providing the capability to move goods through the supply chain."
    aliases: []
    properties: {}
  FreightForwardingService:
    meaning: "A service providing freight-forwarding capability."
    aliases: []
    properties: {}
  Container:
    meaning: "A physical item used to hold or transport goods."
    aliases: []
    properties: {}
  FreightContainer:
    meaning: "A more specific kind of container used for freight transport."
    aliases: []
    properties: {}
  Cargo:
    meaning: "The goods a container contains."
    aliases: []
    properties: {}

relationships:
  - name: fulfills
    from: Shipment
    to: PurchaseOrder
    meaning: "The shipment is recorded as fulfilling the purchase order, which does not establish that their items match."
    aliases: []
  - name: concerns
    from: PurchaseOrder
    to: MaterialTradeItem
    meaning: "The material trade item is identified for the purchase order."
    aliases: []
  - name: concerns
    from: Shipment
    to: MaterialTradeItem
    meaning: "The material trade item is identified for the shipment."
    aliases: []
  - name: shipsFrom
    from: Shipment
    to: Location
    meaning: "The location serves as this shipment's ship-from location."
    aliases: []
  - name: shipsTo
    from: Shipment
    to: Location
    meaning: "The location serves as this shipment's ship-to location."
    aliases: []
  - name: tracks
    from: TrackingEvent
    to: Shipment
    meaning: "The event records information about this identified shipment."
    aliases: []
  - name: tracks
    from: TrackingEvent
    to: Lot
    meaning: "The event records information about this identified lot, without establishing its association with a shipment."
    aliases: []
  - name: tracks
    from: TrackingEvent
    to: LogisticUnit
    meaning: "The event records information about this identified logistic unit, without establishing its association with a shipment."
    aliases: []
  - name: tracks
    from: TrackingEvent
    to: Load
    meaning: "The event records information about this identified load, without establishing its association with a shipment."
    aliases: []
  - name: occursAt
    from: ShipmentPreparationProcess
    to: Facility
    meaning: "The preparation work takes place at this facility."
    aliases: []
  - name: occursAt
    from: ReceivingProcess
    to: Facility
    meaning: "The receiving work takes place at this facility."
    aliases: []
  - name: startsAt
    from: TransportProcess
    to: SupplyChainNode
    meaning: "The transport process starts at this node."
    aliases: []
  - name: endsAt
    from: TransportProcess
    to: SupplyChainNode
    meaning: "This is the transport process's destination node, not proof that it arrived there."
    aliases: []
  - name: hasAsItsAgent
    from: ShipmentPreparationProcess
    to: Carrier
    meaning: "The carrier is involved in the preparation process, without thereby being assigned to a particular shipment."
    aliases: [involves]
  - name: hasAsItsAgent
    from: TransportationService
    to: Carrier
    meaning: "The carrier is involved in providing the transportation service."
    aliases: [involves]
  - name: hasAsItsAgent
    from: FreightForwardingService
    to: FreightForwarder
    meaning: "The freight forwarder is involved in providing the freight-forwarding service."
    aliases: [involves]
  - name: dependsOn
    from: SupplyRelationship
    to: Supplier
    meaning: "The supplier is identified as part of this supply relationship."
    aliases: []
  - name: dependsOn
    from: SupplyRelationship
    to: Customer
    meaning: "The customer is identified as part of this supply relationship."
    aliases: []
  - name: dependsOn
    from: SupplyRelationship
    to: MaterialTradeItem
    meaning: "The material trade item is identified as part of this supply relationship."
    aliases: []
  - name: uses
    from: Shipment
    to: Container
    meaning: "The container is identified for handling or transporting this shipment."
    aliases: []
  - name: contains
    from: Container
    to: Cargo
    meaning: "The cargo is identified as held by this container."
    aliases: [holds, stores, carries]
  - name: isKindOf
    from: FreightContainer
    to: Container
    meaning: "A freight container is a more specific kind of container, not a second unrelated container."
    aliases: []
  - name: isKindOf
    from: Carrier
    to: Supplier
    meaning: "A carrier is a kind of supplier; the terms are not interchangeable."
    aliases: []
  - name: isKindOf
    from: Lot
    to: TraceableResourceUnit
    meaning: "A lot is a specific kind of traceable resource unit."
    aliases: []
  - name: isKindOf
    from: Sublot
    to: TraceableResourceUnit
    meaning: "A sublot is a specific kind of traceable resource unit."
    aliases: []
  - name: isKindOf
    from: LogisticUnit
    to: TraceableResourceUnit
    meaning: "A logistic unit is a specific kind of traceable resource unit."
    aliases: []
  - name: isKindOf
    from: Load
    to: TraceableResourceUnit
    meaning: "A load is a specific kind of traceable resource unit."
    aliases: []

rules:
  - name: latestRecordedTrackingEvents
    conditions:
      - "Use only events that directly track the shipment, not events that track an associated unit."
      - "Return every event sharing the latest usable event date; their order within that date is unknown."
      - "Flag undated events and do not claim the latest dated event is necessarily the latest event overall."
      - "Verify or correct a date or type known to be wrong before relying on it."
  - name: compareRecordedItems
    conditions:
      - "Compare the purchase order's recorded material trade item set separately with each fulfilling shipment's recorded set; fulfillment alone does not prove a match."
      - "If either item connection is missing, report that the comparison cannot be verified, not a mismatch."
      - "If the recorded sets are identical, report that the recorded items match without claiming either record is complete."
      - "If the sets have no items in common, report an item mismatch."
      - "If the sets partially overlap, report common items and items on only one side without an overall match-or-mismatch verdict."
      - "Leave the recorded fulfills connection intact for review regardless of the comparison."
  - name: identifyShipmentBeingPrepared
    conditions:
      - "Ship-from and ship-to locations identify candidate shipments, but saying one is being prepared requires a record identifying its preparation process for that particular shipment."
      - "The shipment-to-preparation record path is unspecified; matching locations or a preparation facility do not establish it."
  - name: identifyMovementResponsibility
    conditions:
      - "A preparation process or transportation service can identify its carrier, and a freight-forwarding service can identify its freight forwarder."
      - "Do not name either party as responsible for a particular shipment without evidence that the process or service, or a carrier arrangement, applies to that shipment; those shipment-specific record paths are unspecified."
  - name: identifyRelevantTraceableUnit
    conditions:
      - "Identify the particular lot, sublot, logistic unit, or load only when a recorded association establishes its relevance to the shipment."
      - "A tracking event about each thing does not establish their association; the shipment-to-unit paths remain unspecified."
      - "If the relevant unit is a sublot, naming only a lot does not identify it; the particular sublot's recorded paths are also unspecified."
      - "Without the needed association, report that the relevant unit cannot be determined."
  - name: reportSuppliers
    conditions:
      - "For a customer and material trade item, report the supplier identified by every matching supply relationship."
      - "Do not choose a preferred supplier; no preference or ranking has been established."
  - name: reportContainersAndCargo
    conditions:
      - "Report every container a shipment is recorded as using and every cargo item each container is recorded as containing."
      - "Report a container as a freight container only when its more specific kind is recorded; otherwise say that classification is unverified."
  - name: canPrepareAShipment
    conditions:
      - "The shipment's ship-from and ship-to locations are identified."
      - "A preparation process is identified for that particular shipment."
      - "Either a carrier is identified for that particular shipment or a freight-forwarding service is confirmed as arranged for it."
      - "The shipment-specific process and arrangement records remain unspecified; a process's or service's agent alone cannot verify the arrangement."
  - name: canReceiveAShipment
    conditions:
      - "A receiving process occurs at a facility, and the shipment has an identified ship-to location."
      - "Evidence establishes that the transport process associated with this shipment reached its destination node; the destination node alone is insufficient."
      - "The shipment-to-transport path and arrival-evidence source remain unspecified, so neither can be assumed from matching places."
  - name: confirmReceiptAtDestinationFacility
    conditions:
      - "Before recording or confirming receipt at this shipment's destination facility, verify that the receiving facility corresponds to this shipment's destination."
      - "Also verify receipt for this shipment and completion of its receiving process."
      - "The correspondence, shipment-to-receiving path, receipt evidence, and completion evidence remain unspecified; matching names or addresses do not verify them."
  - name: canRecordATrackingEvent
    conditions:
      - "At least one particular shipment, lot, logistic unit, or load that the event tracks is identified."
      - "The event date and event type are available; without either, do not record the event."
      - "There is no agreed exhaustive list of event types or exactly-one tracked-unit limit."
  - name: canEvaluateASupplyRelationship
    conditions:
      - "Identify the supply relationship's supplier, customer, and material trade item before evaluating their combination."
      - "A missing link blocks this evaluation, not the existence of the incomplete record."
  - name: assessTraceability
    conditions:
      - "A verified yes requires tracking events covering relevant shipment movements and the resource-unit associations needed to follow the units."
      - "Which events cover a movement and where to verify the unit associations remain unspecified; a few events or separate events for a shipment and unit do not suffice."
      - "If no relevant event is found, say traceability cannot be verified from available records; say it is not maintained for a movement only if an authoritative check establishes that no relevant event exists."

actions:
  - name: prepareAShipment
    input: Shipment
    preconditions:
      - "Identify its ship-from and ship-to locations and its preparation process."
      - "Establish either a carrier for this particular shipment or a freight-forwarding service arranged for it; the supporting shipment-specific paths are unspecified."
    effect: "Document the shipment's identified locations and its preparation and transport arrangements; whether this creates or updates records is unspecified."
    verification: "Check that all those details are recorded for this particular shipment; location records alone cannot verify the unresolved process and arrangement associations."
  - name: dispatchAShipment
    input: Shipment
    preconditions:
      - "Identify the shipment to send; no dispatch-readiness precondition has been stated."
    effect: "Send the identified shipment for movement."
    verification: "Confirm which shipment was targeted, without treating target identification as proof that dispatch occurred."
  - name: receiveAShipment
    input: Shipment
    preconditions:
      - "Check that receiving occurs at a facility, the shipment has an identified ship-to location, and evidence shows its associated transport reached the destination node."
      - "To record receipt at this shipment's destination facility, verify that the receiving facility corresponds to that destination; the supporting record is unspecified."
    effect: "Record the shipment as having arrived at the destination facility through a receiving process; the field, event, or link representing receipt is unspecified."
    verification: "Confirm receipt for this shipment at the destination facility and completion of its receiving process; the shipment-specific and completion evidence paths remain unspecified."
  - name: recordATrackingEvent
    input: TrackingEvent
    preconditions:
      - "Identify at least one shipment, lot, logistic unit, or load the event tracks."
      - "Have its event date and event type available; verify or correct either value if known to be wrong."
    effect: "Record the event date, event type, and tracks link to the intended identified thing."
    verification: "Read the event back and confirm its date, type, and tracks link match what was intended."
  - name: evaluateASupplyRelationship
    input: SupplyRelationship
    preconditions:
      - "Identify the relationship's supplier, customer, and material trade item."
    effect: "Review that combination without requiring a recorded rating, result, or decision value."
    verification: "Confirm that all three dependency links are present."