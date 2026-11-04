classes:
  Order:
    meaning: "A formal request from the buyer to the seller for goods, services or works to be delivered."
    aliases: []
    properties:
      totalLineAmount:
        type: number
      totalAllowanceAmount:
        type: number
      totalChargeAmount:
        type: number
      totalTaxExclusiveAmount:
        type: number
      totalTaxInclusiveAmount:
        type: number
      prepaidAmount:
        type: number
      roundingAmount:
        type: number
      amountDueForPayment:
        type: number
      paymentTerm:
        type: text
      accountingCost:
        type: text
      sellerOrderID:
        type: text
      validityPeriod:
        type: text
  OrderLine:
    meaning: "A part of an order representing particular goods, services or works requested."
    aliases: []
    properties:
      quantity:
        type: number
      price:
        type: number
      accountingCost:
        type: text
  Seller:
    meaning: "The party supplying the procurement results to the buyer and legally bound by the contract."
    aliases: []
    properties: {}
  OrderResponse:
    meaning: "The seller's overall reply about its ability to fulfil a specific order."
    aliases: []
    properties:
      responseDescription:
        type: text
  OrderResponseLine:
    meaning: "A part of an order response submitted for a specific order line that may record a backorder quantity."
    aliases: []
    properties:
      backorderQuantity:
        type: number
  OrderChange:
    meaning: "A formal buyer document requesting an alteration to goods, services or works in a previous order."
    aliases: []
    properties: {}
  OrderChangeLine:
    meaning: "A line within an order change representing part of the requested alteration."
    aliases: []
    properties: {}
  OrderCancellation:
    meaning: "A formal buyer document calling off a previous order or order change."
    aliases: []
    properties: {}
  OrderChangeConfirmation:
    meaning: "A document acknowledging a specific order change."
    aliases: []
    properties: {}
  OrderChangeRejection:
    meaning: "A document stating that a specific order change is not accepted."
    aliases: []
    properties: {}
  OrderCancellationConfirmation:
    meaning: "A document acknowledging a specific order cancellation."
    aliases: []
    properties: {}
  OrderCancellationRejection:
    meaning: "A document stating that a specific order cancellation is not accepted."
    aliases: []
    properties: {}
  OrderAgreement:
    meaning: "The seller's document to the buyer setting out what will be delivered for a specific order."
    aliases: []
    properties: {}
  OrderAgreementLine:
    meaning: "A line within an order agreement setting out part of what will be delivered."
    aliases: []
    properties: {}
  DeliveryInformation:
    meaning: "Information specified by an order about requested delivery, the recipient and other delivery details, which can include an actual delivery date."
    aliases: []
    properties:
      placeOfDelivery:
        type: text
      deliveryDeadline:
        type: date
      requestedDeliveryPeriod:
        type: text
      deliveryPeriod:
        type: text
      actualDeliveryDate:
        type: date
      trackingID:
        type: text
      shippingMark:
        type: text
      deliveryEmail:
        type: text
      accessURL:
        type: text
      downloadURL:
        type: text
  DeliveryAgreement:
    meaning: "The delivery terms specified by the order's delivery information."
    aliases: []
    properties:
      generalDeliveryTerm:
        type: text
      requestedShippingPriority:
        type: text
      partialDeliveryAllowed:
        type: boolean
        allowed:
          - "yes"
          - "no"
  Invoicee:
    meaning: "The party specified on an order to receive and process invoices."
    aliases: []
    properties: {}
  Consignee:
    meaning: "The party identified in delivery information to receive and take possession of the shipment."
    aliases: []
    properties: {}
  Originator:
    meaning: "The party whose need prompted the purchase."
    aliases: []
    properties: {}
  OriginatorInformation:
    meaning: "Information on an order concerning the originator that need not identify a named person or unit."
    aliases: []
    properties: {}
  ContractInformation:
    meaning: "Information an order can specify about a contract without establishing that the desk verified the award."
    aliases: []
    properties: {}
  AllowanceInformation:
    meaning: "Information describing a discount that an order can specify or an order line can carry as price-discount information."
    aliases: []
    properties:
      percentage:
        type: number
  AllowanceAndChargeInformation:
    meaning: "Separate information about discounts, taxes, duties and fees that can include reason, VAT-exemption and tax details."
    aliases: []
    properties:
      allowanceOrChargeReasonDescription:
        type: text
      percentage:
        type: number
      VATExemptionReason:
        type: text
      VATExemptionReasonDescription:
        type: text
  TaxInformation:
    meaning: "Information describing mandatory levies required by law."
    aliases: []
    properties:
      taxCategory:
        type: text
      taxScheme:
        type: text
      percentage:
        type: number

relationships:
  - name: specifiesSeller
    from: Order
    to: Seller
    meaning: "The order identifies the seller supplying what was ordered."
    aliases:
      - names
  - name: hasOrderLines
    from: Order
    to: OrderLine
    meaning: "The lines are the parts of the order representing what was requested."
    aliases:
      - contains
  - name: maySpecifyContractInformation
    from: Order
    to: ContractInformation
    meaning: "The order can identify contract information when recorded, without verifying an award."
    aliases: []
  - name: specifiesDeliveryInformation
    from: Order
    to: DeliveryInformation
    meaning: "The order identifies its associated delivery information."
    aliases: []
  - name: specifiesInvoicee
    from: Order
    to: Invoicee
    meaning: "The order identifies the party designated to receive and process invoices."
    aliases: []
  - name: specifiesOriginatorInformation
    from: Order
    to: OriginatorInformation
    meaning: "The order identifies originator information when it is recorded."
    aliases: []
  - name: specifiesAllowanceInformation
    from: Order
    to: AllowanceInformation
    meaning: "The order identifies discount information associated with it."
    aliases: []
  - name: concernsOriginator
    from: OriginatorInformation
    to: Originator
    meaning: "The information concerns the party whose need prompted the purchase, without necessarily recording a name."
    aliases: []
  - name: isParticularToOrderLine
    from: AllowanceInformation
    to: OrderLine
    meaning: "When this association is recorded, it identifies the order line to which the allowance applies."
    aliases: []
  - name: hasPriceDiscountInformation
    from: OrderLine
    to: AllowanceInformation
    meaning: "The line can carry allowance information associated with its price, separately from the price amount."
    aliases: []
  - name: concernsConsignee
    from: DeliveryInformation
    to: Consignee
    meaning: "Delivery information identifies the party who receives and takes possession of the shipment."
    aliases: []
  - name: specifiesDeliveryAgreement
    from: DeliveryInformation
    to: DeliveryAgreement
    meaning: "Delivery information identifies the terms applying to delivery."
    aliases: []
  - name: isSubmittedForOrder
    from: OrderResponse
    to: Order
    meaning: "The response identifies the specific order the seller's overall reply answers."
    aliases: []
  - name: hasResponseLines
    from: OrderResponse
    to: OrderResponseLine
    meaning: "The response lines are the line-level parts of the order response."
    aliases: []
  - name: isSubmittedForOrderLine
    from: OrderResponseLine
    to: OrderLine
    meaning: "The response line identifies the specific requested line it answers."
    aliases: []
  - name: isSubmittedForOriginalOrder
    from: OrderChange
    to: Order
    meaning: "The change identifies the original order it was sent to alter."
    aliases: []
  - name: hasChangedLines
    from: OrderChange
    to: OrderChangeLine
    meaning: "The changed lines are parts of that order change."
    aliases:
      - contains
  - name: isSubmittedForOrderBeingCalledOff
    from: OrderCancellation
    to: Order
    meaning: "The cancellation identifies the order it was sent for, without identifying a particular change it might call off."
    aliases: []
  - name: respondsToOrderChange
    from: OrderChangeConfirmation
    to: OrderChange
    meaning: "The confirmation acknowledges the specific change it answers."
    aliases: []
  - name: respondsToOrderChange
    from: OrderChangeRejection
    to: OrderChange
    meaning: "The rejection states that the specific change it answers is not accepted."
    aliases: []
  - name: respondsToOrderCancellation
    from: OrderCancellationConfirmation
    to: OrderCancellation
    meaning: "The confirmation acknowledges the specific cancellation it answers."
    aliases: []
  - name: respondsToOrderCancellation
    from: OrderCancellationRejection
    to: OrderCancellation
    meaning: "The rejection states that the specific cancellation it answers is not accepted."
    aliases: []
  - name: hasAgreementLines
    from: OrderAgreement
    to: OrderAgreementLine
    meaning: "The agreement lines belong to that agreement and set out line-by-line delivery details."
    aliases: []
  - name: hasTaxInformation
    from: AllowanceAndChargeInformation
    to: TaxInformation
    meaning: "Associated tax information, when recorded, holds the category, scheme and percentage."
    aliases:
      - includes

rules:
  - name: orderNeedsSeller
    conditions:
      - "An order without a specified seller is incomplete; report that no seller is recorded rather than guessing one."
  - name: orderLineNeedsQuantity
    conditions:
      - "An order line without a recorded quantity is incomplete."
  - name: responseLineNeedsOrderLine
    conditions:
      - "A response line without a reference to the order line it answers is incomplete; this has not been established as a blocker for submitting the overall response."
  - name: deliveryInformationShouldIdentifyConsignee
    conditions:
      - "Delivery information without an identified consignee is incomplete; do not infer the consignee from the delivery place or another party."
  - name: submittedDocumentsNeedOrderReference
    conditions:
      - "An order response, order change or order cancellation cannot be submitted without a reference to its intended order."
  - name: answersNeedSpecificRequest
    conditions:
      - "Before recording a confirmation or rejection, identify the specific change or cancellation it answers and check that the request identifies its original order."
  - name: unansweredRequestIsNotAcceptedOrRejected
    conditions:
      - "If no confirmation or rejection is recorded for a change or cancellation, report no answer recorded rather than inferring acceptance, rejection or a current order status."
  - name: missingBackorderQuantityIsNotZero
    conditions:
      - "If a response line has no backorder quantity, report that none is recorded rather than treating it as zero or concluding there is no backorder."
  - name: missingPartialDeliveryChoiceIsNotNo
    conditions:
      - "If partial delivery allowed is missing, report not recorded and get the delivery terms checked rather than assuming no."
  - name: reportRecordedAmountsOnly
    conditions:
      - "Report the amounts recorded on the order without calculating replacements, treating amount due for payment as a live outstanding balance, or treating prepaid amount as proof of payment."
  - name: doNotInferDelivery
    conditions:
      - "A missing actual delivery date, tracking detail or digital-delivery detail does not establish that delivery did not occur, and an access or download link does not prove delivery."
  - name: keepDeliveryPeriodsDistinct
    conditions:
      - "Report requested delivery period and delivery period separately; the records do not establish whether delivery period is agreed, planned or actual."
  - name: doNotJoinUnestablishedDetails
    conditions:
      - "Do not select allowance and charge information for an order, or an order agreement starting from an order, without an independently established connection."

actions:
  - name: submitOrderResponse
    input: OrderResponse
    preconditions:
      - "The response identifies the intended order."
    effect: "Submit and retain the response linked to that order."
    verification: "Retrieve or check the retained response and confirm that it points to the intended order, not merely to some order."
  - name: submitOrderChange
    input: OrderChange
    preconditions:
      - "The change identifies the intended original order."
    effect: "Submit and retain the change linked to that order."
    verification: "Retrieve or check the retained change and confirm that it points to the intended original order."
  - name: submitOrderCancellation
    input: OrderCancellation
    preconditions:
      - "The cancellation identifies the intended order."
    effect: "Submit and retain the cancellation linked to that order."
    verification: "Retrieve or check the retained cancellation and confirm that it points to the intended order."
  - name: recordOrderChangeConfirmation
    input: OrderChangeConfirmation
    preconditions:
      - "The specific order change being answered is known."
      - "That change identifies its original order."
    effect: "Record and retain the confirmation linked to that specific change."
    verification: "Check that the retained confirmation responds to that specific change, not another request concerning the same order."
  - name: recordOrderChangeRejection
    input: OrderChangeRejection
    preconditions:
      - "The specific order change being answered is known."
      - "That change identifies its original order."
    effect: "Record and retain the rejection linked to that specific change."
    verification: "Check that the retained rejection responds to that specific change, not another request concerning the same order."
  - name: recordOrderCancellationConfirmation
    input: OrderCancellationConfirmation
    preconditions:
      - "The specific order cancellation being answered is known."
      - "That cancellation identifies its original order."
    effect: "Record and retain the confirmation linked to that specific cancellation."
    verification: "Check that the retained confirmation responds to that specific cancellation, not another request concerning the same order."
  - name: recordOrderCancellationRejection
    input: OrderCancellationRejection
    preconditions:
      - "The specific order cancellation being answered is known."
      - "That cancellation identifies its original order."
    effect: "Record and retain the rejection linked to that specific cancellation."
    verification: "Check that the retained rejection responds to that specific cancellation, not another request concerning the same order."