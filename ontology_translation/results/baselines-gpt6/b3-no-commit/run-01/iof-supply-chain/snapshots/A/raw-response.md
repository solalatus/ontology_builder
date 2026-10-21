classes:
  PurchaseOrder:
    meaning: "An agreement that requests or authorizes the supply of goods or services."
    aliases:
      - order
  Shipment:
    meaning: "A traceable unit of goods being prepared, moved, or received."
  MaterialTradeItem:
    meaning: "A material item represented as tradable in this work."
  ShipFromLocation:
    meaning: "The location from which a shipment is intended to be sent."
  ShipToLocation:
    meaning: "The location to which a shipment is addressed."
  Facility:
    meaning: "A physical place used in supply-chain operations."
  SupplyChainNode:
    meaning: "An operating point that can be where a transport process starts or ends."
  ShipmentPreparationProcess:
    meaning: "A process that gets a particular shipment ready for dispatch."
  TransportProcess:
    meaning: "A process that moves goods by changing their location."
  ReceivingProcess:
    meaning: "A process that handles receipt of a shipment at a facility."
  TransportationService:
    meaning: "A service that provides transport capability through a carrier."
  FreightForwardingService:
    meaning: "A service that provides forwarding capability with a freight forwarder involved."
  TrackingEvent:
    meaning: "A record of movement, handling, or a state change for the specific thing it tracks."
    properties:
      eventTime:
        type: date
      eventType:
        type: text
  Lot:
    meaning: "A traceable production or supply batch."
  LogisticUnit:
    meaning: "A traceable handling unit used in storage and transport."
    aliases:
      - handling unit
  Load:
    meaning: "A traceable load unit prepared for handling or transport."
  Supplier:
    meaning: "A party that supplies goods or services in the supply chain."
  Customer:
    meaning: "A party that receives goods or services in the supply chain."
  Carrier:
    meaning: "A supplier that carries or transports shipments."
  FreightForwarder:
    meaning: "A party that arranges forwarding activities and services without necessarily carrying the goods."
  SupplyRelationship:
    meaning: "A supply dependency considered in the context of a supplier, customer, and material trade item."

relationships:
  - name: fulfills
    from: Shipment
    to: PurchaseOrder
    meaning: "The shipment fulfills the purchase order as a whole."
  - name: concerns
    from: PurchaseOrder
    to: MaterialTradeItem
    meaning: "The purchase order concerns this material trade item."
  - name: concerns
    from: Shipment
    to: MaterialTradeItem
    meaning: "The shipment concerns this material trade item independently of the order's item."
  - name: shipsFrom
    from: Shipment
    to: ShipFromLocation
    meaning: "The location is the shipment's intended shipping origin."
  - name: shipsTo
    from: Shipment
    to: ShipToLocation
    meaning: "The location is the shipment's intended shipping destination."
  - name: associatedWith
    from: Shipment
    to: ShipmentPreparationProcess
    meaning: "The process is identified for preparing this particular shipment."
  - name: occursAt
    from: ShipmentPreparationProcess
    to: Facility
    meaning: "The shipment preparation process occurs at the facility."
  - name: involves
    from: ShipmentPreparationProcess
    to: Carrier
    meaning: "The carrier is involved in the shipment preparation process."
  - name: associatedWith
    from: Shipment
    to: FreightForwardingService
    meaning: "The freight forwarding service is established as arranged for this particular shipment."
  - name: involves
    from: FreightForwardingService
    to: FreightForwarder
    meaning: "The freight forwarder is involved in the freight forwarding service."
  - name: associatedWith
    from: Shipment
    to: TransportationService
    meaning: "The transportation service is established as applicable to this shipment's movement."
  - name: involves
    from: TransportationService
    to: Carrier
    meaning: "The carrier is involved in the transportation service."
  - name: associatedWith
    from: Shipment
    to: TransportProcess
    meaning: "The transport process is established as associated with this particular shipment."
  - name: startsAt
    from: TransportProcess
    to: SupplyChainNode
    meaning: "The node is where the transport process starts."
  - name: endsAt
    from: TransportProcess
    to: SupplyChainNode
    meaning: "The node is the transport process's endpoint, which alone does not prove it was reached."
  - name: associatedWith
    from: Shipment
    to: ReceivingProcess
    meaning: "The receiving process is identified for this particular shipment's receipt."
  - name: occursAt
    from: ReceivingProcess
    to: Facility
    meaning: "The receiving process occurs at the facility, which alone does not prove receipt was completed."
  - name: tracks
    from: TrackingEvent
    to: Shipment
    meaning: "The event records information about the specific shipment it tracks."
  - name: tracks
    from: TrackingEvent
    to: Lot
    meaning: "The event records information about the specific lot it tracks."
  - name: tracks
    from: TrackingEvent
    to: LogisticUnit
    meaning: "The event records information about the specific logistic unit it tracks."
  - name: tracks
    from: TrackingEvent
    to: Load
    meaning: "The event records information about the specific load it tracks."
  - name: dependsOn
    from: SupplyRelationship
    to: Supplier
    meaning: "The supplier is one dependency of the supply relationship being reviewed."
  - name: dependsOn
    from: SupplyRelationship
    to: Customer
    meaning: "The customer is one dependency of the supply relationship being reviewed."
  - name: dependsOn
    from: SupplyRelationship
    to: MaterialTradeItem
    meaning: "The material trade item is one dependency of the supply relationship being reviewed."
  - name: supplies
    from: Supplier
    to: Customer
    meaning: "The supplier supplies the customer, without this connection identifying a particular item."
  - name: isASupplier
    from: Carrier
    to: Supplier
    meaning: "A carrier is a supplier whose job is to carry or transport shipments."

rules:
  - name: compareOrderAndShipmentItems
    conditions:
      - "Compare the separately identified material trade items of a purchase order and the shipment fulfilling it; fulfillment alone does not prove the items match."
  - name: findShipmentBeingPreparedForRoute
    conditions:
      - "Find shipments with the given ship-from and ship-to locations and a shipment preparation process identified for each."
      - "If several shipments match, report them and ask which particular shipment is meant."
  - name: intendedLocationsAreNotMovementEvidence
    conditions:
      - "A shipment's ship-from and ship-to locations do not prove that transport started, arrived, or was received."
  - name: reportOnlyExplicitTrackingEvents
    conditions:
      - "Include a tracking event in a shipment, lot, logistic unit, or load history only if the event explicitly tracks that thing."
      - "Report each recorded event's event time and event type without assuming the history is complete or establishes current status."
  - name: shipmentContentsRequireSeparateEvidence
    conditions:
      - "Do not claim that a lot or logistic unit belongs to a shipment without shipment-specific evidence of that association; no such connection or record type has been defined here."
  - name: processEndpointsAreNotArrivalEvidence
    conditions:
      - "A transport process ending at a supply chain node identifies its endpoint but does not by itself confirm that the process reached it."

actions:
  - name: prepareShipment
    input: Shipment
    preconditions:
      - "The shipment has identified ship-from and ship-to locations."
      - "A shipment preparation process is identified for this particular shipment."
      - "Either a carrier is identified for this shipment or a freight forwarding service is established as arranged for it."
    effect: "The shipment is documented with its shipping locations, preparation process, and carrier or forwarding arrangement."
    verification: "Check that those facts are recorded for the particular shipment; this does not independently prove physical preparation was completed."
  - name: dispatchShipment
    input: Shipment
    preconditions:
      - "Identify the shipment to dispatch."
    effect: "The identified shipment is dispatched for movement."
    verification: "Independent evidence that the shipment was sent, and how to record it, have not been defined; identification alone is not proof of dispatch."
  - name: receiveShipment
    input: Shipment
    preconditions:
      - "Identify the shipment and its ship-to location."
      - "Establish that the receiving process for this shipment occurs at a facility."
      - "Establish that this shipment's associated transport process reached its destination supply chain node; its endpoint alone is insufficient."
    effect: "Receipt of the shipment is recorded through its receiving process at the facility."
    verification: "Confirm afterward that this shipment was received and its receiving process completed; the evidence source has not been defined."
  - name: recordTrackingEvent
    input: TrackingEvent
    preconditions:
      - "Identify the specific shipment, lot, logistic unit, or load the event tracks."
      - "Have an event time and event type."
      - "Check either value against available evidence if it appears incorrect."
    effect: "The event records what happened, when, and what it tracks."
    verification: "Check that the event tracks the intended thing and that its event time and event type were recorded."
  - name: evaluateSupplyRelationship
    input: SupplyRelationship
    preconditions:
      - "Identify the relationship's separate dependencies on a supplier, a customer, and a material trade item."
    effect: "The supply relationship is reviewed in the context of those three dependencies."
    verification: "Check that all three dependency connections are present; no approval or rating is established."