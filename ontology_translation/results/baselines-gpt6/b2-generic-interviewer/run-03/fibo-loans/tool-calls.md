# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-21T04:34:43.501Z

### Turn 1 — user

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### Turn 1 — assistant

Let’s start at the approval-to-servicing hand-off. For one approved loan or credit facility, what do you check before you consider it properly set up? In particular, what documents or terms must be on file, who must be identified as responsible, and what would make you hold up setup?

### Turn 2 — user

At hand-off, I first check that the record describes the deal we’re actually going to service: **who the borrower and lender are**, the principal or agreed credit amount, the initial funding date and maturity date, and the applicable repayment and interest terms. For a facility, I also check the credit limit and available amount so draws can be tracked against the agreement. A facility may have sub-facilities, which need to be distinguishable if they’re part of the deal.

The checks that would make me hold up a readiness review depend on the loan’s structure:

- **An interest-bearing loan:** its fixed or variable rate must be identified, and interest payment terms must govern the interest. Those terms tell us how interest accrues, including the day-count basis.
- **A variable-rate loan:** it needs a rate-reset schedule. A rate alone does not tell servicing when to recalculate it.
- **An amortizing loan:** it needs an amortization schedule and principal repayment terms, so we can track how the balance is meant to come down.
- **A secured loan:** it needs an actual link to supporting collateral, not just a “secured” label. I also check the security agreement that grants the interest in that collateral.
- **A loan with a prepayment penalty:** the penalty period needs to be recorded so we can apply the prepayment terms correctly.

I identify the **servicer** responsible for collecting payments on the lender’s behalf; that need not be the originator. I also make sure there is a way to retain payment history and its individual transactions. At initial hand-off there may be no payments yet, so I wouldn’t invent an entry—but once payments have occurred, I would not call the payment record complete without them.

If a required link or term for the particular review is missing, I hold that review rather than assume the document or schedule exists somewhere else. I’d flag any mismatch between the approved terms and the servicing setup for correction before relying on it.

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    meaning: An approved loan record whose terms and servicing setup must match the deal being serviced.\n    properties:\n      principal:\n        type: number\n      initialFundingDate:\n        type: date\n      maturityDate:\n        type: date\n      interestBearing:\n        type: boolean\n      rateType:\n        type: text\n        allowed: [fixed, variable]\n      interestRate:\n        type: text\n      amortizing:\n        type: boolean\n      secured:\n        type: boolean\n      hasPrepaymentPenalty:\n        type: boolean\n  Borrower:\n    meaning: The party on the hook for the loan.\n  Lender:\n    meaning: The party providing the loan or credit.\n  Servicer:\n    meaning: The party responsible for collecting payments on the lender's behalf, which need not be the originator.\n  InterestPaymentTerms:\n    meaning: Terms governing interest payments and how interest accrues, including the day-count basis.\n    properties:\n      dayCountBasis:\n        type: text\n  RateResetSchedule:\n    meaning: Schedule specifying when a variable rate is recalculated.\n  AmortizationSchedule:\n    meaning: Schedule showing how an amortizing loan's balance is meant to come down.\n  PrincipalRepaymentTerms:\n    meaning: Terms governing repayment of principal.\n  Collateral:\n    meaning: Property supporting a secured loan.\n  SecurityAgreement:\n    meaning: Agreement granting a security interest in supporting collateral.\n  PrepaymentTerms:\n    meaning: Terms for prepayment and any applicable penalty period.\n    properties:\n      penaltyPeriod:\n        type: text\n  PaymentHistory:\n    meaning: Record retaining the payments made on a loan.\n  PaymentTransaction:\n    meaning: An individual transaction in a loan's payment history.\nrelationships:\n  - name: hasBorrower\n    from: Loan\n    to: Borrower\n  - name: hasLender\n    from: Loan\n    to: Lender\n  - name: isServicedBy\n    from: Loan\n    to: Servicer\n  - name: governedByInterestPaymentTerms\n    from: Loan\n    to: InterestPaymentTerms\n  - name: hasRateResetSchedule\n    from: Loan\n    to: RateResetSchedule\n  - name: hasAmortizationSchedule\n    from: Loan\n    to: AmortizationSchedule\n  - name: governedByPrincipalRepaymentTerms\n    from: Loan\n    to: PrincipalRepaymentTerms\n  - name: supportedByCollateral\n    from: Loan\n    to: Collateral\n  - name: hasSecurityAgreement\n    from: Loan\n    to: SecurityAgreement\n  - name: grantsInterestIn\n    from: SecurityAgreement\n    to: Collateral\n  - name: governedByPrepaymentTerms\n    from: Loan\n    to: PrepaymentTerms\n  - name: hasPaymentHistory\n    from: Loan\n    to: PaymentHistory\n  - name: containsPaymentTransaction\n    from: PaymentHistory\n    to: PaymentTransaction\nrules:\n  loanReadyForServicing:\n    conditions:\n      - The borrower, lender, principal or agreed credit amount, initial funding date, maturity date, applicable repayment and interest terms, and responsible servicer are recorded and match the approved deal.\n      - If interest-bearing, the fixed or variable rate and interest payment terms including the day-count basis are recorded.\n      - If variable-rate, a rate-reset schedule is linked.\n      - If amortizing, an amortization schedule and principal repayment terms are linked.\n      - If secured, actual supporting collateral and the security agreement granting an interest in that collateral are linked; a secured label alone is insufficient.\n      - If subject to a prepayment penalty, the penalty period is recorded in the prepayment terms.\n      - Payment history can retain individual transactions; no payment transaction is required before a payment occurs, but all payments that have occurred must appear.\n      - Missing required links or terms or a mismatch with approved terms holds the review for correction rather than being assumed away.\nactions:\n  reviewServicingReadiness:\n    input: Loan\n    preconditions: [loanReadyForServicing]"
}
```

### Turn 2 — tool

Applied. Added 28, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  reviewServicingReadiness:\n    input: Loan\n    preconditions: []\n  passServicingReadinessReview:\n    input: Loan\n    preconditions: [loanReadyForServicing]"
}
```

I’ve captured your hand-off checks, including the structure-specific holds and the distinction between an empty payment history and missing payments that have already occurred. One correction to check: the **readiness review can happen when requirements are missing**; it’s passing the review that requires them. Is that right?

For a credit facility, how do you distinguish the facility from a loan and any sub-facilities in servicing? What do you record for a draw, and how do draws change the available amount?

### Turn 2 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 2 — assistant

Is that distinction right: you can conduct a readiness review even when requirements are missing, but you cannot **pass** it until they’re resolved?

And for a credit facility, what distinguishes the facility from a loan and its sub-facilities in servicing? What do you record for each draw, and how does a draw affect the available amount?

### Turn 3 — user

Yes, with one wording distinction: I can **inspect** an incomplete record and identify what is missing, but I cannot **confirm loan readiness** until the borrower and lender are identified and, for an interest-bearing loan, the applicable interest rate and interest payment terms are in place. Other checks—such as collateral or a variable-rate reset schedule—apply to their respective loan types.

A **loan** is the particular debt we track for principal, interest, repayment and payment history. A **credit facility** is an agreement under which the borrower can take funds over time without reapplying each time. A revolving line also lets the borrower repay and draw again. A **sub-facility** is a portion of the facility for a particular purpose; it may have its own commitment status or collateral arrangement. I keep that portion distinct from the overall facility.

For the facility, I track its credit limit, available amount, amount of credit extended and, where applicable, maximum advance amount. A draw uses some of the available credit, and a repayment can restore availability under revolving terms. I would not treat that as a universal calculation from the figures alone: I’d need the agreement’s terms and the current facility position to establish what is actually available. The servicing picture we’ve discussed does **not** specify a separate set of mandatory fields for each draw or a draw-posting procedure, so I wouldn’t claim a particular draw record or posting rule is required on that basis.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CreditFacility:\n    meaning: An agreement under which a borrower can take funds over time without reapplying each time.\n    properties:\n      creditLimit:\n        type: number\n      availableAmount:\n        type: number\n      amountOfCreditExtended:\n        type: number\n      maximumAdvanceAmount:\n        type: number\n      revolving:\n        type: boolean\n  SubFacility:\n    meaning: A distinguishable portion of a credit facility for a particular purpose.\n    properties:\n      purpose:\n        type: text\n      commitmentStatus:\n        type: text\nrelationships:\n  - name: hasBorrower\n    from: CreditFacility\n    to: Borrower\n  - name: hasSubFacility\n    from: CreditFacility\n    to: SubFacility\n  - name: hasCollateralArrangement\n    from: SubFacility\n    to: Collateral\n    meaning: The sub-facility has its own collateral arrangement where applicable.\nrules:\n  facilityAvailabilityAssessment:\n    conditions:\n      - A draw uses available credit; a repayment can restore availability if the facility is revolving and its terms allow it.\n      - Actual availability must be established from the agreement's terms and the current facility position, not from a universal calculation based only on the tracked figures.\nactions:\n  reviewServicingReadiness:\n    input: Loan\n    preconditions: []\n  confirmLoanReadiness:\n    input: Loan\n    preconditions: [loanReadyForServicing]"
}
```

### Turn 3 — tool

Applied. Added 7, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

That clarifies the distinction: a loan is the debt being serviced; a facility is the agreement allowing funds to be taken over time; and a sub-facility is a distinct portion of that agreement. I’ve recorded availability as something assessed under the agreement and current position, not as a universal formula or an assumed draw-posting procedure.

How do these connect in your records: can a loan sit under a facility or a particular sub-facility, and can one facility have multiple loans? Also, when you confirm a facility’s setup, do you separately identify its borrower, lender, and servicer and check its repayment and interest terms, or are those checks made only on each resulting loan?That clarifies the distinction: a loan is the debt being serviced; a facility is the agreement allowing funds to be taken over time; and a sub-facility is a distinct portion of that agreement. I’ve recorded availability as something assessed under the agreement and current position, not as a universal formula or an assumed draw-posting procedure.

How do these connect in your records: can a loan sit under a facility or a particular sub-facility, and can one facility have multiple loans? Also, when you confirm a facility’s setup, do you separately identify its borrower, lender, and servicer and check its repayment and interest terms, or are those checks made only on each resulting loan?

### Turn 4 — user

Your distinction is right. In the servicing picture I’m describing, a **facility has sub-facilities**, and the facility has its own identified borrower and lender. I don’t have a defined record link here saying that a particular loan sits under a facility or sub-facility, or that one facility contains multiple loans. Those arrangements may occur in practice, but I wouldn’t build that relationship into this setup check without the governing records specifying it.

For a facility, I identify its **borrower and lender** and track its credit amounts and any sub-facilities. I would not describe the loan-readiness check as a separate facility-readiness test: the explicit readiness confirmation applies to a **loan**, checking its borrower and lender and, if it bears interest, its rate and interest payment terms.

Likewise, the **servicer** is identified for a loan in these records; I’m not assuming a separate facility-level servicer designation. Principal repayment terms, interest payment terms, and the relevant schedules need to be checked against the obligation they govern, but I wouldn’t say this record structure requires all of them to be attached separately to both the facility and every resulting loan.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasLender\n    from: CreditFacility\n    to: Lender\nrules:\n  loanReadyForServicing:\n    conditions:\n      - A loan cannot be confirmed ready without its identified borrower and lender.\n      - If the loan bears interest, its applicable fixed or variable rate and interest payment terms governing accrual, including day-count basis, must be in place.\n      - If the loan has a variable rate, its rate-reset schedule must be linked.\n      - If the loan is amortizing, its amortization schedule and principal repayment terms must be linked.\n      - If the loan is secured, actual supporting collateral and the security agreement granting an interest in that collateral must be linked; a secured label alone is insufficient.\n      - If the loan carries a prepayment penalty, its penalty period must be recorded in the prepayment terms.\n      - Principal or agreed credit amount, initial funding date, maturity date, and applicable repayment terms must match the approved deal; mismatches or missing requirements are held for correction.\n      - The loan's servicer must be identified and payment history must be capable of retaining individual transactions; no transaction is needed until a payment occurs, but any payments that have occurred must be represented."
}
```

### Turn 4 — tool

Applied. Added 1, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 4 — assistant

Understood. I’ve kept the facility’s borrower and lender separate from the loan’s, and I have **not** added a loan-to-facility link or a facility-level servicer or readiness test.

Turning to ongoing servicing: after setup, what events or changes do you track against a loan, and what would make you flag that it is no longer tracking according to its terms? For payments already made, which details of each transaction matter to your review?

### Turn 5 — user

I compare what **actually happened** with what the loan’s terms and schedules say should happen. That means tracking principal and interest payments, interest calculations and accruals, and—on a variable-rate loan—rate-reset events against the reset schedule. I also keep the loan balance and unpaid accrued interest distinct: a payment toward interest is not a reduction of principal. Where applicable, I check scheduled principal, interest and amortization payments, and any dated contract events.

I’d flag a mismatch between an actual event and its governing terms—for example, a principal payment not reflected in the balance, interest calculated on the wrong day-count basis, or a variable rate not reviewed against its reset schedule. If collateral is relevant, I’d also look at the **date** of the value being used rather than treat an old appraisal as current.

For payments already made, the key record is the loan’s **payment history**, made up of individual payment transactions. In reviewing a transaction, I need to know what obligation it was applied toward—principal, interest, fees or another related amount—and whether the resulting history supports the balance and interest we’re reporting. This model identifies those payment types, but it does not prescribe a complete mandatory field set for each transaction, so I wouldn’t claim, for instance, that a particular transaction identifier or posting timestamp is required by this check.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      balance:\n        type: number\n      unpaidAccruedInterest:\n        type: number\n  PaymentTransaction:\n    properties:\n      appliedToward:\n        type: text\n        meaning: The obligation the payment is applied toward, such as principal, interest, fees, or another related amount.\n  InterestCalculation:\n    meaning: A calculation of loan interest reviewed against the governing interest payment terms, including day-count basis.\n  InterestAccrual:\n    meaning: Interest accrued on a loan, tracked separately from its principal balance.\n  RateResetEvent:\n    meaning: An actual variable-rate reset reviewed against the rate-reset schedule.\n  ContractEvent:\n    meaning: A dated event called for by the loan's terms.\n    properties:\n      date:\n        type: date\n  CollateralValue:\n    meaning: A dated value of collateral, whose valuation date matters when judging whether it is current.\n    properties:\n      value:\n        type: number\n      valuationDate:\n        type: date\nrelationships:\n  - name: hasInterestCalculation\n    from: Loan\n    to: InterestCalculation\n  - name: hasInterestAccrual\n    from: Loan\n    to: InterestAccrual\n  - name: hasRateResetEvent\n    from: Loan\n    to: RateResetEvent\n  - name: hasContractEvent\n    from: Loan\n    to: ContractEvent\n  - name: hasCollateralValue\n    from: Collateral\n    to: CollateralValue\nrules:\n  loanTrackingMismatch:\n    conditions:\n      - Actual principal and interest payments, calculations, accruals, variable-rate resets, scheduled principal, interest and amortization payments where applicable, and dated contract events are compared with their governing terms and schedules.\n      - Flag an actual event inconsistent with its governing terms, including a principal payment not reflected in balance, interest using the wrong day-count basis, or a variable rate not reviewed against its reset schedule.\n      - Keep loan principal balance distinct from unpaid accrued interest; paying interest does not reduce principal.\n      - Where collateral value is relevant, consider its valuation date rather than treating an old appraisal as current.\n      - For payments already made, the payment history's individual transactions must show what obligations payments were applied toward and support reported balance and interest; no specific transaction identifier or posting timestamp is implied.\nactions:\n  reviewLoanTracking:\n    input: Loan\n    preconditions: []\n  flagLoanTrackingMismatch:\n    input: Loan\n    preconditions: [loanTrackingMismatch]"
}
```

### Turn 5 — tool

Applied. Added 13, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

I’ve captured the servicing comparison: principal balance and unpaid accrued interest stay separate; payments must be traceable to what they satisfied; and rate resets, accruals, scheduled payments, and dated events are checked against their governing terms. I’ve also recorded the date of a collateral valuation as relevant to judging its currency.

Two points to pin down: when you say “scheduled principal, interest and amortization payments,” do you use a separate payment schedule, or are those expectations contained in the repayment terms and amortization schedule already discussed? And are there particular dated contract events you routinely track that should be named, rather than leaving “contract event” general?I’ve captured the ongoing check as a comparison of actual activity with the governing terms, with principal balance kept separate from unpaid accrued interest.

Do you use a separate **payment schedule** for expected principal and interest payments, or are those expectations contained in the repayment terms and amortization schedule we’ve discussed? And are there particular **dated contract events** you routinely track that should be named in the model?

### Turn 6 — user

We can use **separate schedules**; I wouldn’t fold them all into the repayment terms or the amortization schedule. A loan may have an overall loan payment schedule, a principal payment schedule, an interest payment schedule, and an amortization schedule. The terms say *how repayment is governed*—for example, the principal payment dates and frequency or the interest payment dates and frequency—while the schedules lay out the expected payment pattern. An amortization schedule also shows how the debt balance is expected to change over time. Which schedules I expect depends on the loan: an amortizing loan specifically needs an amortization schedule alongside principal repayment terms.

For dated events, I’d name **principal payments, interest payments, interest calculations and interest-rate resets** rather than leave them all as “contract events.” We also track the event at which the loan’s **initial interest rate is set**. An explicit contract-event schedule can set out actual dates for payment and reset events, while the more specific calculation and reset schedules tell us when those activities are due. I wouldn’t assume every loan has every schedule—rate resets, for example, matter when the loan has a variable rate.

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  LoanPaymentSchedule:\n    meaning: An overall schedule laying out the loan's expected payment pattern.\n  PrincipalPaymentSchedule:\n    meaning: A separate schedule of expected principal payments.\n  InterestPaymentSchedule:\n    meaning: A separate schedule of expected interest payments.\n  InterestCalculationSchedule:\n    meaning: Schedule specifying when interest calculations are due.\n  ContractEventSchedule:\n    meaning: A schedule setting out actual dates for payment and interest-rate reset events.\n  InitialInterestRateSetEvent:\n    meaning: The event at which the loan's initial interest rate is set.\n  PrincipalRepaymentTerms:\n    properties:\n      principalPaymentDates:\n        type: text\n      principalPaymentFrequency:\n        type: text\n  InterestPaymentTerms:\n    properties:\n      interestPaymentDates:\n        type: text\n      interestPaymentFrequency:\n        type: text\nrelationships:\n  - name: hasLoanPaymentSchedule\n    from: Loan\n    to: LoanPaymentSchedule\n  - name: hasPrincipalPaymentSchedule\n    from: Loan\n    to: PrincipalPaymentSchedule\n  - name: hasInterestPaymentSchedule\n    from: Loan\n    to: InterestPaymentSchedule\n  - name: hasInterestCalculationSchedule\n    from: Loan\n    to: InterestCalculationSchedule\n  - name: hasContractEventSchedule\n    from: Loan\n    to: ContractEventSchedule\n  - name: hasInitialInterestRateSetEvent\n    from: Loan\n    to: InitialInterestRateSetEvent\nrules:\n  loanTrackingMismatch:\n    conditions:\n      - Compare actual principal and interest payments in payment history with the applicable loan, principal, or interest payment schedules and their repayment terms; the terms govern how repayment works while schedules give the expected pattern.\n      - Compare interest calculations and accruals with interest payment terms and any interest calculation schedule, and variable-rate resets with the rate-reset schedule and any dated contract-event schedule.\n      - Track the event setting the initial interest rate and check dated payment and reset events against an explicit contract-event schedule where one applies.\n      - An amortization schedule tracks the expected change in debt balance over time; an amortizing loan needs both this schedule and principal repayment terms.\n      - Flag actual activity inconsistent with governing terms or schedules, such as a principal payment not reflected in balance, a wrong day-count basis, or a variable rate not reviewed against its reset schedule.\n      - Keep principal balance separate from unpaid accrued interest; a payment applied to interest does not reduce principal.\n      - Where collateral value matters, consider its valuation date rather than treating an old appraisal as current.\n      - Payment history must contain the individual payments that occurred, identify whether applied to principal, interest, fees or another related amount, and support reported balance and interest; do not infer mandatory transaction identifiers or posting timestamps."
}
```

### Turn 6 — tool

Applied. Added 12, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 6 — assistant

I’ve kept repayment terms separate from the schedules that lay out expected payments. The loan, principal, and interest payment schedules can each exist separately; an amortizing loan specifically needs an amortization schedule and principal repayment terms.

For the named events, should a principal or interest payment be represented by a payment transaction marked by what it was applied toward, rather than by a separate event record? And when checking payment, calculation, reset, and initial-rate-setting events against schedules, do you need each event’s **effective date**, or is that date established elsewhere in your records?

### Turn 7 — user

I’d keep those concepts distinct. An **individual payment transaction** is the actual payment recorded in the loan’s payment history; it may go toward principal, interest, fees or other amounts. A **principal payment** or **interest payment** is the event of paying that part of the obligation. They describe related activity, but I wouldn’t impose a rule that every such event must be represented solely as a transaction marked with an application type, or require a second event record for every transaction. That record design isn’t specified here.

The timing matters when we compare activity with the schedules, but I can’t point to a universally required **effective-date field on each event** in this record structure. The schedules provide the expected dates; an explicit contract-event schedule can set out dated events under the contract. For the initial rate, we identify a rate-setting event, but I wouldn’t claim its date is always established by some other particular field. If the actual event date isn’t available in the records being reviewed, I can’t verify that event’s timing against its schedule—I’d flag that as missing evidence rather than assume a date.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PrincipalPayment:\n    meaning: An event of paying the principal portion of a loan obligation, related to but not necessarily identical to a payment-history transaction.\n  InterestPayment:\n    meaning: An event of paying the interest portion of a loan obligation, related to but not necessarily identical to a payment-history transaction.\nrelationships:\n  - name: hasPrincipalPayment\n    from: Loan\n    to: PrincipalPayment\n  - name: hasInterestPayment\n    from: Loan\n    to: InterestPayment\nrules:\n  loanTrackingMismatch:\n    conditions:\n      - Compare actual principal and interest payment events with the governing repayment terms and applicable loan, principal or interest payment schedules; payment transactions in the payment history are related activity but neither a sole required representation of those events nor a mandatory second record for each event.\n      - Compare actual interest calculations and accruals with interest payment terms and any interest calculation schedule, and rate resets with the rate-reset schedule and any applicable dated contract-event schedule.\n      - Track the initial-interest-rate-setting event and compare the timing of actual events with the expected dates on applicable schedules when evidence of actual timing is available.\n      - If an actual event date is unavailable, flag missing evidence for a timing check rather than assume a date; do not require a universal effective-date field on each event or assume where the initial rate-set date resides.\n      - The amortization schedule shows expected changes in debt balance; an amortizing loan needs it alongside principal repayment terms.\n      - Flag actual activity inconsistent with governing terms or schedules, such as principal payment not reflected in balance, interest on the wrong day-count basis, or a variable rate not reviewed against its reset schedule.\n      - Keep principal balance separate from unpaid accrued interest; paying interest does not reduce principal.\n      - Where collateral value is relevant, assess its valuation date instead of treating an old appraisal as current.\n      - Payment history must contain individual transactions for payments already made, show whether applied to principal, interest, fees or another related amount, and support the reported balance and interest; do not infer mandatory transaction identifiers or posting timestamps."
}
```

### Turn 7 — tool

Applied. Added 4, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

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
  Loan:
    meaning: An approved loan record whose terms and servicing setup must match the deal being serviced.
    aliases: []
    properties:
      principal:
        type: number
      initialFundingDate:
        type: date
      maturityDate:
        type: date
      interestBearing:
        type: boolean
      rateType:
        type: text
        allowed:
          - fixed
          - variable
      interestRate:
        type: text
      amortizing:
        type: boolean
      secured:
        type: boolean
      hasPrepaymentPenalty:
        type: boolean
      balance:
        type: number
      unpaidAccruedInterest:
        type: number
  Borrower:
    meaning: The party on the hook for the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party providing the loan or credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting payments on the lender's behalf, which need not be the originator."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms governing interest payments and how interest accrues, including the day-count basis."
    aliases: []
    properties:
      dayCountBasis:
        type: text
      interestPaymentDates:
        type: text
      interestPaymentFrequency:
        type: text
  RateResetSchedule:
    meaning: Schedule specifying when a variable rate is recalculated.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Schedule showing how an amortizing loan's balance is meant to come down."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: Terms governing repayment of principal.
    aliases: []
    properties:
      principalPaymentDates:
        type: text
      principalPaymentFrequency:
        type: text
  Collateral:
    meaning: Property supporting a secured loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: Agreement granting a security interest in supporting collateral.
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms for prepayment and any applicable penalty period.
    aliases: []
    properties:
      penaltyPeriod:
        type: text
  PaymentHistory:
    meaning: Record retaining the payments made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An individual transaction in a loan's payment history."
    aliases: []
    properties:
      appliedToward:
        type: text
  CreditFacility:
    meaning: An agreement under which a borrower can take funds over time without reapplying each time.
    aliases: []
    properties:
      creditLimit:
        type: number
      availableAmount:
        type: number
      amountOfCreditExtended:
        type: number
      maximumAdvanceAmount:
        type: number
      revolving:
        type: boolean
  SubFacility:
    meaning: A distinguishable portion of a credit facility for a particular purpose.
    aliases: []
    properties:
      purpose:
        type: text
      commitmentStatus:
        type: text
  InterestCalculation:
    meaning: "A calculation of loan interest reviewed against the governing interest payment terms, including day-count basis."
    aliases: []
    properties: {}
  InterestAccrual:
    meaning: "Interest accrued on a loan, tracked separately from its principal balance."
    aliases: []
    properties: {}
  RateResetEvent:
    meaning: An actual variable-rate reset reviewed against the rate-reset schedule.
    aliases: []
    properties: {}
  ContractEvent:
    meaning: "A dated event called for by the loan's terms."
    aliases: []
    properties:
      date:
        type: date
  CollateralValue:
    meaning: "A dated value of collateral, whose valuation date matters when judging whether it is current."
    aliases: []
    properties:
      value:
        type: number
      valuationDate:
        type: date
  LoanPaymentSchedule:
    meaning: "An overall schedule laying out the loan's expected payment pattern."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: A separate schedule of expected principal payments.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: A separate schedule of expected interest payments.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: Schedule specifying when interest calculations are due.
    aliases: []
    properties: {}
  ContractEventSchedule:
    meaning: A schedule setting out actual dates for payment and interest-rate reset events.
    aliases: []
    properties: {}
  InitialInterestRateSetEvent:
    meaning: "The event at which the loan's initial interest rate is set."
    aliases: []
    properties: {}
  PrincipalPayment:
    meaning: "An event of paying the principal portion of a loan obligation, related to but not necessarily identical to a payment-history transaction."
    aliases: []
    properties: {}
  InterestPayment:
    meaning: "An event of paying the interest portion of a loan obligation, related to but not necessarily identical to a payment-history transaction."
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: null
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: null
    aliases: []
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: null
    aliases: []
  - name: governedByInterestPaymentTerms
    from: Loan
    to: InterestPaymentTerms
    meaning: null
    aliases: []
  - name: hasRateResetSchedule
    from: Loan
    to: RateResetSchedule
    meaning: null
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: null
    aliases: []
  - name: governedByPrincipalRepaymentTerms
    from: Loan
    to: PrincipalRepaymentTerms
    meaning: null
    aliases: []
  - name: supportedByCollateral
    from: Loan
    to: Collateral
    meaning: null
    aliases: []
  - name: hasSecurityAgreement
    from: Loan
    to: SecurityAgreement
    meaning: null
    aliases: []
  - name: grantsInterestIn
    from: SecurityAgreement
    to: Collateral
    meaning: null
    aliases: []
  - name: governedByPrepaymentTerms
    from: Loan
    to: PrepaymentTerms
    meaning: null
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: null
    aliases: []
  - name: containsPaymentTransaction
    from: PaymentHistory
    to: PaymentTransaction
    meaning: null
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: null
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: null
    aliases: []
  - name: hasCollateralArrangement
    from: SubFacility
    to: Collateral
    meaning: The sub-facility has its own collateral arrangement where applicable.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: null
    aliases: []
  - name: hasInterestCalculation
    from: Loan
    to: InterestCalculation
    meaning: null
    aliases: []
  - name: hasInterestAccrual
    from: Loan
    to: InterestAccrual
    meaning: null
    aliases: []
  - name: hasRateResetEvent
    from: Loan
    to: RateResetEvent
    meaning: null
    aliases: []
  - name: hasContractEvent
    from: Loan
    to: ContractEvent
    meaning: null
    aliases: []
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValue
    meaning: null
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: null
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: null
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: null
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: null
    aliases: []
  - name: hasContractEventSchedule
    from: Loan
    to: ContractEventSchedule
    meaning: null
    aliases: []
  - name: hasInitialInterestRateSetEvent
    from: Loan
    to: InitialInterestRateSetEvent
    meaning: null
    aliases: []
  - name: hasPrincipalPayment
    from: Loan
    to: PrincipalPayment
    meaning: null
    aliases: []
  - name: hasInterestPayment
    from: Loan
    to: InterestPayment
    meaning: null
    aliases: []
rules:
  loanReadyForServicing:
    conditions:
      - A loan cannot be confirmed ready without its identified borrower and lender.
      - "If the loan bears interest, its applicable fixed or variable rate and interest payment terms governing accrual, including day-count basis, must be in place."
      - "If the loan has a variable rate, its rate-reset schedule must be linked."
      - "If the loan is amortizing, its amortization schedule and principal repayment terms must be linked."
      - "If the loan is secured, actual supporting collateral and the security agreement granting an interest in that collateral must be linked; a secured label alone is insufficient."
      - "If the loan carries a prepayment penalty, its penalty period must be recorded in the prepayment terms."
      - "Principal or agreed credit amount, initial funding date, maturity date, and applicable repayment terms must match the approved deal; mismatches or missing requirements are held for correction."
      - "The loan's servicer must be identified and payment history must be capable of retaining individual transactions; no transaction is needed until a payment occurs, but any payments that have occurred must be represented."
  facilityAvailabilityAssessment:
    conditions:
      - A draw uses available credit; a repayment can restore availability if the facility is revolving and its terms allow it.
      - "Actual availability must be established from the agreement's terms and the current facility position, not from a universal calculation based only on the tracked figures."
  loanTrackingMismatch:
    conditions:
      - "Compare actual principal and interest payment events with the governing repayment terms and applicable loan, principal or interest payment schedules; payment transactions in the payment history are related activity but neither a sole required representation of those events nor a mandatory second record for each event."
      - "Compare actual interest calculations and accruals with interest payment terms and any interest calculation schedule, and rate resets with the rate-reset schedule and any applicable dated contract-event schedule."
      - Track the initial-interest-rate-setting event and compare the timing of actual events with the expected dates on applicable schedules when evidence of actual timing is available.
      - "If an actual event date is unavailable, flag missing evidence for a timing check rather than assume a date; do not require a universal effective-date field on each event or assume where the initial rate-set date resides."
      - The amortization schedule shows expected changes in debt balance; an amortizing loan needs it alongside principal repayment terms.
      - "Flag actual activity inconsistent with governing terms or schedules, such as principal payment not reflected in balance, interest on the wrong day-count basis, or a variable rate not reviewed against its reset schedule."
      - Keep principal balance separate from unpaid accrued interest; paying interest does not reduce principal.
      - "Where collateral value is relevant, assess its valuation date instead of treating an old appraisal as current."
      - "Payment history must contain individual transactions for payments already made, show whether applied to principal, interest, fees or another related amount, and support the reported balance and interest; do not infer mandatory transaction identifiers or posting timestamps."
actions:
  reviewServicingReadiness:
    input: Loan
    preconditions: []
    effect: ""
    verification: ""
  confirmLoanReadiness:
    input: Loan
    preconditions:
      - loanReadyForServicing
    effect: ""
    verification: ""
  reviewLoanTracking:
    input: Loan
    preconditions: []
    effect: ""
    verification: ""
  flagLoanTrackingMismatch:
    input: Loan
    preconditions:
      - loanTrackingMismatch
    effect: ""
    verification: ""


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 7 — assistant

I’ve kept **payment transactions** distinct from principal- and interest-payment events, without requiring one record to stand in for the other. I’ve also recorded that missing evidence of an actual event’s date prevents a timing check; it doesn’t justify assuming a date.

When you find a mismatch or missing evidence during ongoing servicing, what do you do next—correct the servicing record, seek supporting information, hold a calculation or payment, or escalate it? Does the response depend on the type of issue?

### Turn 8 — user

It depends on **what I’m trying to confirm**. I first identify the specific mismatch or missing evidence and check it against the agreement, schedule, or payment history. I would not silently change a balance, rate, or payment application to make the records agree.

If a required item is missing, I leave that **review unconfirmed** until the supporting information is available. For example, I can’t confirm a variable-rate setup without its reset schedule, or payment-record completeness without individual payments in the history. If an actual event date is missing, I can’t complete the timing comparison.

A correction, a hold on a calculation or payment, or an escalation may be appropriate in an operating process, but this servicing picture does not prescribe **which of those actions to take for each issue**, who authorizes them, or a universal escalation threshold. I’d avoid treating a failed check as automatic authority to alter a record or stop a payment; I’d follow the organization’s approved procedure for that decision.

### Turn 8 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [
    "ContractEvent"
  ],
  "relationships": [
    {
      "name": "hasContractEvent",
      "from": "Loan",
      "to": "ContractEvent"
    }
  ],
  "properties": [],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

### Turn 8 — tool

Removed 1 element(s) — classes: ContractEvent.

CONSISTENCY CHECK — no new problems from this edit.

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ContractEventSchedule:\n    meaning: Schedule setting out the contractual dates for payment and interest-rate reset events where applicable.\nrules:\n  loanTrackingMismatch:\n    conditions:\n      - Compare actual principal and interest payment events with their governing repayment terms and applicable loan, principal, or interest payment schedules; payment transactions are related but are not necessarily the only representation of these events or mandatory duplicate event records.\n      - Compare interest calculations and accruals with interest payment terms and any interest calculation schedule; compare variable-rate resets with the reset schedule and applicable contract-event schedule.\n      - Track the initial-interest-rate-setting event; compare the timing of actual events with contractual dates when evidence of actual dates exists.\n      - If actual event timing is unavailable, leave the timing review unconfirmed and identify the missing evidence rather than assume a date or require a particular date field.\n      - Compare actual changes in principal balance with payments and, where applicable, the amortization schedule; do not reduce principal balance for a payment of interest.\n      - Flag discrepancies such as a principal payment not reflected in balance, interest using the wrong day-count basis, or a variable rate not reviewed against its reset schedule.\n      - Where collateral value matters, assess its valuation date rather than treating an old appraisal as current.\n      - For payments already made, check that payment history contains the individual transactions, identifies what obligations they satisfied, and supports reported balance and interest; do not infer a mandatory transaction identifier or posting timestamp.\n  reviewEvidenceBeforeConfirmation:\n    conditions:\n      - Identify the specific mismatch or missing evidence against the applicable agreement, schedule, or payment history.\n      - Leave the particular review unconfirmed when required supporting information is missing; missing actual event timing prevents confirmation of a timing comparison.\n      - Do not silently change balances, rates, or payment applications to make records agree.\n      - A failed check is not by itself authority to alter a record or hold a calculation or payment; any correction, hold, or escalation follows the organization's approved procedure, with no universal trigger or authorizer assumed.\nactions:\n  inspectLoanRecord:\n    input: Loan\n    preconditions: []"
}
```

### Turn 8 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 8 — assistant

Understood. A failed check identifies what cannot yet be confirmed; it does **not** authorize me to change a balance, rate, or payment application, or to hold a payment. Corrections, holds, and escalations follow your organization’s approved procedure, which this model does not specify.

We’ve covered hand-off readiness, facility tracking, payment history, schedules, and ongoing comparisons. Is there another servicing decision this model needs to support, or does that cover the scope you had in mind?

### Turn 9 — user

Yes, that covers the servicing decisions I had in mind.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  ContractEventSchedule:\n    meaning: A schedule setting out dated payment and interest-rate reset events under the contract where applicable.\nrules:\n  loanTrackingMismatch:\n    conditions:\n      - Flag an actual event or reported position that does not match its governing agreement, terms, payment history, or applicable schedule, such as a principal payment not reflected in balance, interest calculated on the wrong day-count basis, or a variable rate not reviewed against its reset schedule.\n      - Compare actual principal and interest payments, interest calculations and accruals, and rate resets with their applicable terms and separate payment, calculation, reset, amortization, or contract-event schedules; not every schedule applies to every loan.\n      - Keep principal balance distinct from unpaid accrued interest; paying interest does not reduce principal.\n      - Where collateral value is used, consider the date of that value rather than treating an old appraisal as current.\n      - Payment history must include individual transactions for payments already made and their application to principal, interest, fees, or other related amounts, supporting reported balance and interest; a payment transaction need not be either the sole representation of a payment event or duplicated by a second event record.\n  loanReviewUnconfirmed:\n    conditions:\n      - Leave the particular review unconfirmed if a required term, schedule, individual payment in the history, or other supporting evidence is missing; missing evidence of an actual event date prevents confirmation of a timing comparison rather than establishing an assumed date.\n      - Identify the specific missing evidence or mismatch by checking the agreement, applicable schedules, and payment history.\n      - Do not silently change a balance, rate, or payment application to force agreement between records.\n      - A failed check alone does not authorize a record correction, a hold on a calculation or payment, or an escalation; follow the organization's approved procedure for those decisions, without assuming a universal threshold or authorizer.\nactions:\n  leaveLoanReviewUnconfirmed:\n    input: Loan\n    preconditions: [loanReviewUnconfirmed]"
}
```

### Turn 9 — tool

Applied. Added 2, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 9 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 9 — tool

competency_questions: []
classes:
  Loan:
    meaning: An approved loan record whose terms and servicing setup must match the deal being serviced.
    aliases: []
    properties:
      principal:
        type: number
      initialFundingDate:
        type: date
      maturityDate:
        type: date
      interestBearing:
        type: boolean
      rateType:
        type: text
        allowed:
          - fixed
          - variable
      interestRate:
        type: text
      amortizing:
        type: boolean
      secured:
        type: boolean
      hasPrepaymentPenalty:
        type: boolean
      balance:
        type: number
      unpaidAccruedInterest:
        type: number
  Borrower:
    meaning: The party on the hook for the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party providing the loan or credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting payments on the lender's behalf, which need not be the originator."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms governing interest payments and how interest accrues, including the day-count basis."
    aliases: []
    properties:
      dayCountBasis:
        type: text
      interestPaymentDates:
        type: text
      interestPaymentFrequency:
        type: text
  RateResetSchedule:
    meaning: Schedule specifying when a variable rate is recalculated.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Schedule showing how an amortizing loan's balance is meant to come down."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: Terms governing repayment of principal.
    aliases: []
    properties:
      principalPaymentDates:
        type: text
      principalPaymentFrequency:
        type: text
  Collateral:
    meaning: Property supporting a secured loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: Agreement granting a security interest in supporting collateral.
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms for prepayment and any applicable penalty period.
    aliases: []
    properties:
      penaltyPeriod:
        type: text
  PaymentHistory:
    meaning: Record retaining the payments made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An individual transaction in a loan's payment history."
    aliases: []
    properties:
      appliedToward:
        type: text
  CreditFacility:
    meaning: An agreement under which a borrower can take funds over time without reapplying each time.
    aliases: []
    properties:
      creditLimit:
        type: number
      availableAmount:
        type: number
      amountOfCreditExtended:
        type: number
      maximumAdvanceAmount:
        type: number
      revolving:
        type: boolean
  SubFacility:
    meaning: A distinguishable portion of a credit facility for a particular purpose.
    aliases: []
    properties:
      purpose:
        type: text
      commitmentStatus:
        type: text
  InterestCalculation:
    meaning: "A calculation of loan interest reviewed against the governing interest payment terms, including day-count basis."
    aliases: []
    properties: {}
  InterestAccrual:
    meaning: "Interest accrued on a loan, tracked separately from its principal balance."
    aliases: []
    properties: {}
  RateResetEvent:
    meaning: An actual variable-rate reset reviewed against the rate-reset schedule.
    aliases: []
    properties: {}
  CollateralValue:
    meaning: "A dated value of collateral, whose valuation date matters when judging whether it is current."
    aliases: []
    properties:
      value:
        type: number
      valuationDate:
        type: date
  LoanPaymentSchedule:
    meaning: "An overall schedule laying out the loan's expected payment pattern."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: A separate schedule of expected principal payments.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: A separate schedule of expected interest payments.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: Schedule specifying when interest calculations are due.
    aliases: []
    properties: {}
  ContractEventSchedule:
    meaning: A schedule setting out dated payment and interest-rate reset events under the contract where applicable.
    aliases: []
    properties: {}
  InitialInterestRateSetEvent:
    meaning: "The event at which the loan's initial interest rate is set."
    aliases: []
    properties: {}
  PrincipalPayment:
    meaning: "An event of paying the principal portion of a loan obligation, related to but not necessarily identical to a payment-history transaction."
    aliases: []
    properties: {}
  InterestPayment:
    meaning: "An event of paying the interest portion of a loan obligation, related to but not necessarily identical to a payment-history transaction."
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: null
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: null
    aliases: []
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: null
    aliases: []
  - name: governedByInterestPaymentTerms
    from: Loan
    to: InterestPaymentTerms
    meaning: null
    aliases: []
  - name: hasRateResetSchedule
    from: Loan
    to: RateResetSchedule
    meaning: null
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: null
    aliases: []
  - name: governedByPrincipalRepaymentTerms
    from: Loan
    to: PrincipalRepaymentTerms
    meaning: null
    aliases: []
  - name: supportedByCollateral
    from: Loan
    to: Collateral
    meaning: null
    aliases: []
  - name: hasSecurityAgreement
    from: Loan
    to: SecurityAgreement
    meaning: null
    aliases: []
  - name: grantsInterestIn
    from: SecurityAgreement
    to: Collateral
    meaning: null
    aliases: []
  - name: governedByPrepaymentTerms
    from: Loan
    to: PrepaymentTerms
    meaning: null
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: null
    aliases: []
  - name: containsPaymentTransaction
    from: PaymentHistory
    to: PaymentTransaction
    meaning: null
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: null
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: null
    aliases: []
  - name: hasCollateralArrangement
    from: SubFacility
    to: Collateral
    meaning: The sub-facility has its own collateral arrangement where applicable.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: null
    aliases: []
  - name: hasInterestCalculation
    from: Loan
    to: InterestCalculation
    meaning: null
    aliases: []
  - name: hasInterestAccrual
    from: Loan
    to: InterestAccrual
    meaning: null
    aliases: []
  - name: hasRateResetEvent
    from: Loan
    to: RateResetEvent
    meaning: null
    aliases: []
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValue
    meaning: null
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: null
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: null
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: null
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: null
    aliases: []
  - name: hasContractEventSchedule
    from: Loan
    to: ContractEventSchedule
    meaning: null
    aliases: []
  - name: hasInitialInterestRateSetEvent
    from: Loan
    to: InitialInterestRateSetEvent
    meaning: null
    aliases: []
  - name: hasPrincipalPayment
    from: Loan
    to: PrincipalPayment
    meaning: null
    aliases: []
  - name: hasInterestPayment
    from: Loan
    to: InterestPayment
    meaning: null
    aliases: []
rules:
  loanReadyForServicing:
    conditions:
      - A loan cannot be confirmed ready without its identified borrower and lender.
      - "If the loan bears interest, its applicable fixed or variable rate and interest payment terms governing accrual, including day-count basis, must be in place."
      - "If the loan has a variable rate, its rate-reset schedule must be linked."
      - "If the loan is amortizing, its amortization schedule and principal repayment terms must be linked."
      - "If the loan is secured, actual supporting collateral and the security agreement granting an interest in that collateral must be linked; a secured label alone is insufficient."
      - "If the loan carries a prepayment penalty, its penalty period must be recorded in the prepayment terms."
      - "Principal or agreed credit amount, initial funding date, maturity date, and applicable repayment terms must match the approved deal; mismatches or missing requirements are held for correction."
      - "The loan's servicer must be identified and payment history must be capable of retaining individual transactions; no transaction is needed until a payment occurs, but any payments that have occurred must be represented."
  facilityAvailabilityAssessment:
    conditions:
      - A draw uses available credit; a repayment can restore availability if the facility is revolving and its terms allow it.
      - "Actual availability must be established from the agreement's terms and the current facility position, not from a universal calculation based only on the tracked figures."
  loanTrackingMismatch:
    conditions:
      - "Flag an actual event or reported position that does not match its governing agreement, terms, payment history, or applicable schedule, such as a principal payment not reflected in balance, interest calculated on the wrong day-count basis, or a variable rate not reviewed against its reset schedule."
      - "Compare actual principal and interest payments, interest calculations and accruals, and rate resets with their applicable terms and separate payment, calculation, reset, amortization, or contract-event schedules; not every schedule applies to every loan."
      - Keep principal balance distinct from unpaid accrued interest; paying interest does not reduce principal.
      - "Where collateral value is used, consider the date of that value rather than treating an old appraisal as current."
      - "Payment history must include individual transactions for payments already made and their application to principal, interest, fees, or other related amounts, supporting reported balance and interest; a payment transaction need not be either the sole representation of a payment event or duplicated by a second event record."
  loanReviewUnconfirmed:
    conditions:
      - "Leave the particular review unconfirmed if a required term, schedule, individual payment in the history, or other supporting evidence is missing; missing evidence of an actual event date prevents confirmation of a timing comparison rather than establishing an assumed date."
      - "Identify the specific missing evidence or mismatch by checking the agreement, applicable schedules, and payment history."
      - "Do not silently change a balance, rate, or payment application to force agreement between records."
      - "A failed check alone does not authorize a record correction, a hold on a calculation or payment, or an escalation; follow the organization's approved procedure for those decisions, without assuming a universal threshold or authorizer."
actions:
  reviewServicingReadiness:
    input: Loan
    preconditions: []
    effect: ""
    verification: ""
  confirmLoanReadiness:
    input: Loan
    preconditions:
      - loanReadyForServicing
    effect: ""
    verification: ""
  reviewLoanTracking:
    input: Loan
    preconditions: []
    effect: ""
    verification: ""
  flagLoanTrackingMismatch:
    input: Loan
    preconditions:
      - loanTrackingMismatch
    effect: ""
    verification: ""
  leaveLoanReviewUnconfirmed:
    input: Loan
    preconditions:
      - loanReviewUnconfirmed
    effect: ""
    verification: ""


# CONSISTENCY CHECK — no outstanding problems in the model.

# SECOND-OPINION MODEL CHECK — no additional observations.

### Turn 9 — assistant

That covers the servicing decisions you described, and the domain model is complete. It distinguishes loan readiness from facility tracking, keeps terms separate from schedules and actual activity, and leaves a review unconfirmed when required evidence is missing. It does not assume a loan-to-facility link, a draw-posting procedure, or authority to correct or hold activity after a failed check.
