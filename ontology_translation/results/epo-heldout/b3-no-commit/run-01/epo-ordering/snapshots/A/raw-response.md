classes:
  Order:
    meaning: "The buyer's formal request to a seller for goods, services or works to be delivered."
    aliases: []
    properties: {}
  OrderLine:
    meaning: "A line giving the detail for a particular unit of goods, services or works requested in an order."
    aliases: []
    properties:
      quantity:
        type: number
      price:
        type: number
  Seller:
    meaning: "The party specified on the order and committed under the contract to transfer what is being bought."
    aliases:
      - supplier
    properties: {}
  Invoicee:
    meaning: "The party specified on the order to receive and process the invoice."
    aliases:
      - invoice recipient
    properties: {}
  DeliveryInformation:
    meaning: "The order's details about where and when delivery was requested and who takes delivery."
    aliases:
      - delivery details
    properties:
      placeOfDelivery:
        type: text
      deliveryDeadline:
        type: date
      requestedDeliveryPeriod:
        type: text
  Consignee:
    meaning: "The party that physically takes delivery, possibly on someone else's behalf."
    aliases:
      - delivery recipient
      - receiver
    properties: {}
  OriginatorInformation:
    meaning: "The order's details identifying whose need prompted the purchase."
    aliases:
      - originator details
    properties: {}
  Originator:
    meaning: "The person or unit whose need prompted the order."
    aliases:
      - requesting person or unit
    properties: {}
  OrderResponse:
    meaning: "The seller's formal reply about its ability to fulfil a particular order."
    aliases:
      - seller's formal response
    properties:
      responseDescription:
        type: text
  OrderResponseLine:
    meaning: "The seller's detail about its ability to fulfil the particular order line addressed by an order response."
    aliases:
      - response line
    properties:
      backorderQuantity:
        type: number
  OrderChange:
    meaning: "A request sent to modify a particular order, not proof that it changed."
    aliases:
      - change request
    properties: {}
  OrderChangeLine:
    meaning: "A line in an order change describing part of the requested modification."
    aliases:
      - changed line
    properties: {}
  OrderCancellation:
    meaning: "A request sent to cancel a particular order, not proof that it was cancelled."
    aliases:
      - cancellation request
    properties: {}
  OrderChangeConfirmation:
    meaning: "The seller's confirmation acknowledging a particular order change request."
    aliases:
      - change confirmed
    properties: {}
  OrderChangeRejection:
    meaning: "The seller's rejection stating that a particular order change request was not accepted."
    aliases:
      - change rejected
    properties: {}
  OrderCancellationConfirmation:
    meaning: "The seller's confirmation acknowledging a particular order cancellation request."
    aliases:
      - cancellation confirmed
    properties: {}
  OrderCancellationRejection:
    meaning: "The seller's rejection stating that a particular order cancellation request was not accepted."
    aliases:
      - cancellation rejected
    properties: {}
  ContractInformation:
    meaning: "Details specified on an order about the contract it is placed under."
    aliases:
      - contract details
    properties: {}
  OrderAgreement:
    meaning: "A seller-side document sent to the buyer for a specific order stating what will be delivered."
    aliases: []
    properties: {}
  OrderAgreementLine:
    meaning: "A line in an order agreement representing part of what the seller says will be delivered."
    aliases:
      - agreement line
    properties: {}

relationships:
  - name: has
    from: Order
    to: OrderLine
    meaning: "Identifies the lines belonging to the order."
    aliases:
      - includes
  - name: specifies
    from: Order
    to: Seller
    meaning: "Identifies the seller specified on the order."
    aliases:
      - names
  - name: specifies
    from: Order
    to: Invoicee
    meaning: "Identifies the party specified to receive and process the invoice."
    aliases:
      - names
  - name: specifies
    from: Order
    to: DeliveryInformation
    meaning: "Identifies the delivery information specified on the order."
    aliases:
      - carries
  - name: specifies
    from: Order
    to: OriginatorInformation
    meaning: "Identifies the originator information specified on the order."
    aliases:
      - carries
  - name: specifies
    from: Order
    to: ContractInformation
    meaning: "Identifies the contract information recorded on the order."
    aliases: []
  - name: concerns
    from: DeliveryInformation
    to: Consignee
    meaning: "Identifies the party that physically takes delivery under those details."
    aliases:
      - identifies
  - name: concerns
    from: OriginatorInformation
    to: Originator
    meaning: "Identifies the person or unit whose need prompted the order."
    aliases:
      - identifies
  - name: is submitted for
    from: OrderResponse
    to: Order
    meaning: "Identifies the particular order answered by the formal response."
    aliases:
      - answers
  - name: has
    from: OrderResponse
    to: OrderResponseLine
    meaning: "Identifies the lines belonging to the response."
    aliases:
      - includes
  - name: is submitted for
    from: OrderResponseLine
    to: OrderLine
    meaning: "Identifies the particular original order line receiving the seller's line-level reply."
    aliases:
      - addresses
  - name: is submitted for
    from: OrderChange
    to: Order
    meaning: "Identifies the order the change requests to modify."
    aliases:
      - asks to modify
  - name: has
    from: OrderChange
    to: OrderChangeLine
    meaning: "Identifies the lines included in the change request."
    aliases:
      - includes
  - name: is submitted for
    from: OrderCancellation
    to: Order
    meaning: "Identifies the order the cancellation requests to cancel."
    aliases:
      - asks to cancel
  - name: responds to
    from: OrderChangeConfirmation
    to: OrderChange
    meaning: "Identifies the particular change request the seller acknowledged."
    aliases:
      - acknowledges
  - name: responds to
    from: OrderChangeRejection
    to: OrderChange
    meaning: "Identifies the particular change request the seller did not accept."
    aliases:
      - refuses
  - name: responds to
    from: OrderCancellationConfirmation
    to: OrderCancellation
    meaning: "Identifies the particular cancellation request the seller acknowledged."
    aliases:
      - acknowledges
  - name: responds to
    from: OrderCancellationRejection
    to: OrderCancellation
    meaning: "Identifies the particular cancellation request the seller did not accept."
    aliases:
      - refuses
  - name: has
    from: OrderAgreement
    to: OrderAgreementLine
    meaning: "Identifies the lines belonging to the seller's order agreement."
    aliases: []

rules:
  - name: orderLineQuantityRequired
    conditions:
      - "Quantity must be recorded on each order line."
  - name: responseLineIdentifiesIntendedLine
    conditions:
      - "Each recorded order response line must identify the particular intended order line it answers."
      - "Checking response-line links is separate from the precondition for submitting the order response; no same-order consistency check was established."
  - name: requestsAndAnswersDoNotEstablishEffect
    conditions:
      - "Sending an order change or order cancellation records a request, not an effective change or cancellation."
      - "A confirmation or rejection does not establish an effective date or final order status."
  - name: unansweredRequestRemainsUnanswered
    conditions:
      - "If a change or cancellation request has no linked confirmation or rejection, report that no answer is recorded."
  - name: missingBackorderQuantityIsUnknown
    conditions:
      - "If a response line has no recorded backorder quantity, do not treat it as zero or as evidence of full fulfilment."
  - name: lineFulfilmentNotEstablished
    conditions:
      - "A backorder quantity alone does not establish whether the seller can fulfil an order line."
  - name: changeLineMatchNotEstablished
    conditions:
      - "Order change lines show what the request asked to change, but no reliable match from an individual change line to an original order line has been established."
  - name: agreementLookupAndContentNotEstablished
    conditions:
      - "No recorded path connects an order agreement to its order or seller."
      - "No recorded value describes what an order agreement line promises; given an agreement, its lines can be listed but not described from the established information."
  - name: requestedPeriodDoesNotSupplyDates
    conditions:
      - "The requested delivery period is text distinct from the delivery deadline; do not derive dates from it without another source."

actions:
  - name: submitOrderResponse
    input: OrderResponse
    preconditions:
      - "The order response identifies the intended order it answers."
    effect: "Records the formal response against that order without accepting a counterproposal or changing the order."
    verification: "Read back and retain the response and its link to the intended order; separately check any recorded response lines against their intended order lines."
  - name: sendOrderChange
    input: OrderChange
    preconditions:
      - "The order change refers to the intended order."
    effect: "Records the change request as submitted for that order, not as an effective change."
    verification: "Read back and retain the request and its link to the intended order; flag absent change lines rather than inventing what was requested."
  - name: sendOrderCancellation
    input: OrderCancellation
    preconditions:
      - "The order cancellation refers to the intended order."
    effect: "Records the cancellation request as submitted for that order, not as an effective cancellation."
    verification: "Read back and retain the request and its link to the intended order."
  - name: recordOrderChangeConfirmation
    input: OrderChangeConfirmation
    preconditions:
      - "The intended order change refers to an order."
      - "The confirmation identifies that particular order change, not merely the order."
    effect: "Records the seller's confirmation responding to that change request."
    verification: "Read back and retain the confirmation, its link to the specific change, and the change's link to its order."
  - name: recordOrderChangeRejection
    input: OrderChangeRejection
    preconditions:
      - "The intended order change refers to an order."
      - "The rejection identifies that particular order change, not merely the order."
    effect: "Records that the seller did not accept that change request."
    verification: "Read back and retain the rejection, its link to the specific change, and the change's link to its order."
  - name: recordOrderCancellationConfirmation
    input: OrderCancellationConfirmation
    preconditions:
      - "The intended order cancellation refers to an order."
      - "The confirmation identifies that particular order cancellation, not merely the order."
    effect: "Records the seller's confirmation responding to that cancellation request."
    verification: "Read back and retain the confirmation, its link to the specific cancellation, and the cancellation's link to its order."
  - name: recordOrderCancellationRejection
    input: OrderCancellationRejection
    preconditions:
      - "The intended order cancellation refers to an order."
      - "The rejection identifies that particular order cancellation, not merely the order."
    effect: "Records that the seller did not accept that cancellation request."
    verification: "Read back and retain the rejection, its link to the specific cancellation, and the cancellation's link to its order."