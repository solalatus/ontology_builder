classes:
  Loan:
    meaning: "Credit extended to a borrower that is to be repaid under its terms."
    aliases: []
    properties:
      principalAmount:
        type: number
      loanBalance:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  SecuredLoan:
    meaning: "A loan identified as backed by security."
    aliases: []
    properties: {}
  CollateralizedLoan:
    meaning: "A secured loan backed by pledged collateral."
    aliases: []
    properties: {}
  GuaranteedLoan:
    meaning: "A loan secured by a guarantee."
    aliases: []
    properties: {}
  CreditFacility:
    meaning: "A kind of credit agreement under which a borrower can draw funds over time without applying for a new loan each time."
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      availableAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  CreditAgreement:
    meaning: "An agreement under which a borrower receives value and typically agrees to repay the lender, generally with interest."
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  Borrower:
    meaning: "The party obliged to repay a loan or incur debt under a credit agreement."
    aliases: []
    properties: {}
  Lender:
    meaning: "The party financing a loan or extending credit under a credit agreement."
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party that collects principal and interest payments on the lender’s behalf."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of the loan obligation to be repaid, separate from interest."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  Interest:
    meaning: "The cost of using credit, owed to the lender under the loan’s terms."
    aliases: []
    properties: {}
  AccruedInterest:
    meaning: "Interest incurred as of a particular date but not yet paid."
    aliases: []
    properties:
      amount:
        type: number
      asOfDate:
        type: date
  PrincipalRepaymentTerms:
    meaning: "The terms that set out how principal must be repaid."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: "Principal repayment terms that address paying the loan before maturity."
    aliases: []
    properties:
      prepaymentPenaltyTermInMonths:
        type: number
  InterestPaymentTerms:
    meaning: "The terms governing when and how interest is paid."
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: "The convention used to count days when calculating accrued interest."
    aliases: []
    properties: {}
  InterestRate:
    meaning: "A rate record applicable to a loan that is either fixed or variable."
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: "An interest rate that does not change over the life of the loan."
    aliases: []
    properties:
      rate:
        type: number
  VariableInterestRate:
    meaning: "An interest rate that may change during the life of the loan."
    aliases:
      - adjustable rate
    properties:
      rate:
        type: number
  PrincipalPaymentSchedule:
    meaning: "A schedule recording when principal payments are due."
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "A schedule showing periodic payments and how the debt balance is expected to change over time."
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: "A schedule recording when interest payments are due."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: "A schedule setting out when a rate reset and its corresponding actual rate are to be recalculated."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The record of actual payments made toward a loan’s repayment obligation."
    aliases: []
    properties: {}
  IndividualPaymentTransaction:
    meaning: "An actual payment toward principal, interest, fees, or another amount owed."
    aliases: []
    properties: {}
  PrincipalPayment:
    meaning: "An event recording that some principal was actually paid."
    aliases: []
    properties: {}
  InterestPayment:
    meaning: "An event recording that interest was actually paid."
    aliases: []
    properties: {}
  InterestRateReset:
    meaning: "An event at which the interest rate may be adjusted under the contract."
    aliases: []
    properties: {}
  Collateral:
    meaning: "An asset pledged as security for an obligation."
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: "An agreement granting a party a financial interest in collateral it does not own and setting out rights and duties concerning that collateral."
    aliases: []
    properties: {}
  CollateralValueAsOfADate:
    meaning: "The appraised value recorded for collateral on a specified date."
    aliases: []
    properties:
      value:
        type: number
      asOfDate:
        type: date
  LoanToValueRatio:
    meaning: "This loan’s principal amount compared with the appraised value of the asset securing it, expressed as a percentage."
    aliases:
      - LTV
    properties:
      ratio:
        type: number
  CombinedLoanToValueRatio:
    meaning: "The total debt secured by the asset or assets compared with their appraised value."
    aliases: []
    properties:
      ratio:
        type: number

relationships:
  - name: is a kind of
    from: CreditFacility
    to: CreditAgreement
    meaning: "A credit facility is a kind of credit agreement, not a second agreement record."
    aliases: []
  - name: is a kind of
    from: SecuredLoan
    to: Loan
    meaning: "A secured loan is a kind of loan."
    aliases: []
  - name: is a kind of
    from: CollateralizedLoan
    to: SecuredLoan
    meaning: "A collateralized loan is a secured loan backed by pledged collateral."
    aliases: []
  - name: is a kind of
    from: GuaranteedLoan
    to: SecuredLoan
    meaning: "A guaranteed loan is secured by a guarantee."
    aliases: []
  - name: is a kind of
    from: PrepaymentTerms
    to: PrincipalRepaymentTerms
    meaning: "Prepayment terms are a particular kind of principal repayment terms, not a second linked record."
    aliases: []
  - name: is a kind of
    from: FixedInterestRate
    to: InterestRate
    meaning: "A fixed interest rate is a kind of interest rate record."
    aliases: []
  - name: is a kind of
    from: VariableInterestRate
    to: InterestRate
    meaning: "A variable interest rate is a kind of interest rate record."
    aliases: []
  - name: has a borrower
    from: Loan
    to: Borrower
    meaning: "The borrower is the party obliged to repay that loan."
    aliases: []
  - name: has a lender
    from: Loan
    to: Lender
    meaning: "The lender is the party financing that loan."
    aliases: []
  - name: is serviced by a servicer
    from: Loan
    to: Servicer
    meaning: "The servicer collects principal and interest payments on the lender’s behalf for that loan."
    aliases: []
  - name: has a borrower
    from: CreditFacility
    to: Borrower
    meaning: "The borrower is the party that may draw under that facility."
    aliases: []
  - name: has a lender
    from: CreditFacility
    to: Lender
    meaning: "The lender is the party providing that facility."
    aliases: []
  - name: has a borrower
    from: CreditAgreement
    to: Borrower
    meaning: "The borrower is the party that incurs debt under that agreement."
    aliases: []
  - name: has a lender
    from: CreditAgreement
    to: Lender
    meaning: "The lender is the party extending credit under that agreement."
    aliases: []
  - name: has principal
    from: Loan
    to: Principal
    meaning: "The principal is the obligation to be repaid under that loan."
    aliases: []
  - name: has interest
    from: Loan
    to: Interest
    meaning: "The interest is that loan’s interest obligation, not its interest rate."
    aliases: []
  - name: has a principal payment schedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: "The schedule records when principal is due for that loan."
    aliases: []
  - name: has an amortization schedule
    from: Loan
    to: AmortizationSchedule
    meaning: "The schedule shows expected debt-balance changes for that loan."
    aliases: []
  - name: has an interest payment schedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: "The schedule records when interest is due for that loan."
    aliases: []
  - name: has an interest rate reset schedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: "The schedule covers rate resets and corresponding actual-rate recalculations for that loan."
    aliases: []
  - name: has a payment history
    from: Loan
    to: PaymentHistory
    meaning: "The history records actual payments associated with that loan."
    aliases: []
  - name: has an interest rate
    from: Loan
    to: FixedInterestRate
    meaning: "The fixed interest rate record is applicable to that loan."
    aliases: []
  - name: has an interest rate
    from: Loan
    to: VariableInterestRate
    meaning: "The variable interest rate record is applicable to that loan."
    aliases: []
  - name: is collateralized by
    from: SecuredLoan
    to: Collateral
    meaning: "Pledged collateral supports that secured loan when its collateral link is recorded."
    aliases: []
  - name: has individual payments
    from: PaymentHistory
    to: IndividualPaymentTransaction
    meaning: "Individual payment transactions are the entries contained in that payment history."
    aliases: []
  - name: has a collateral value
    from: Collateral
    to: CollateralValueAsOfADate
    meaning: "The dated record gives an appraised value for that collateral."
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: "The agreement grants a security interest in that collateral without itself establishing a link to a loan."
    aliases: []
  - name: has a loan-to-value ratio
    from: CollateralizedLoan
    to: LoanToValueRatio
    meaning: "The recorded loan-to-value ratio is associated with that collateralized loan."
    aliases: []
  - name: has a combined loan-to-value ratio
    from: CollateralizedLoan
    to: CombinedLoanToValueRatio
    meaning: "The recorded combined ratio is associated with that collateralized loan."
    aliases: []
  - name: govern payment of
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "The terms govern repayment of that particular principal obligation."
    aliases: []
  - name: govern payment of
    from: PrepaymentTerms
    to: Principal
    meaning: "Applicable prepayment terms govern early repayment of that particular principal obligation."
    aliases: []
  - name: govern payment of
    from: InterestPaymentTerms
    to: Interest
    meaning: "The terms govern payment of that particular interest obligation."
    aliases: []
  - name: have an accrual basis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: "The terms specify the day-count convention used for calculating accrued interest."
    aliases: []

rules:
  - name: loanReadinessConfirmation
    conditions:
      - "The loan has a borrower and a lender."
      - "The loan links to an applicable fixed or variable interest rate record."
      - "Identifiable interest payment terms govern that loan’s interest obligation without unresolved ambiguity."
      - "A numeric rate value is not required for this structural confirmation."
  - name: securedLoanCollateralLinkConfirmation
    conditions:
      - "The loan being reviewed is identified as secured."
      - "That loan has a recorded link to pledged collateral; a separate collateralized designation is not required."
  - name: variableRateSetupConfirmation
    conditions:
      - "The loan links to a variable interest rate record and has an interest rate reset schedule."
      - "Neither a numeric rate value nor an actual interest rate reset event is required for this setup confirmation."
  - name: paymentRecordCompletenessConfirmation
    conditions:
      - "The loan has a payment history containing at least one individual payment transaction."
      - "This does not establish that every payment due was made."
  - name: prepaymentPenaltyTimingConfirmation
    conditions:
      - "Evidence establishes that identifiable prepayment terms govern this loan’s principal without unresolved ambiguity."
      - "Those terms have a reliable prepayment penalty term recorded in months."
  - name: unresolvedGoverningTerms
    conditions:
      - "If no terms governing a particular obligation are identified, or several are found without a way to resolve applicability, report the gap or ambiguity rather than choose terms."
  - name: unattributedAmountsAndEvents
    conditions:
      - "Do not attribute accrued interest, principal payments, interest payments, or interest rate resets to a loan unless available evidence identifies the applicable records; no attribution path was established for them."
      - "A scheduled payment or reset is not evidence that the event occurred."
  - name: paymentHistoryDoesNotAllocatePayments
    conditions:
      - "Individual payment transactions in a loan’s history have no established allocation to principal payment or interest payment events."
      - "Compare actual principal or interest payments with their separate schedules only when additional evidence identifies the relevant events for that loan."
  - name: recordedFiguresRemainSeparate
    conditions:
      - "Report the loan’s principal amount, loan balance, and outstanding principal as separate recorded figures."
      - "Report a facility’s credit limit and available amount side by side without deriving either from the other."
      - "Report dated collateral values and the two recorded loan-to-value ratios without deriving a missing ratio or applying an unstated threshold."
  - name: securityDesignationRequiresEvidence
    conditions:
      - "Establish that a loan is identified as secured, collateralized, or guaranteed from available evidence, not solely from the presence or absence of a collateral link."
      - "No separate guarantee record or source field for those designations was established."

actions:
  - name: assessLoanReadiness
    input: Loan
    preconditions:
      - "For a successful confirmation, the loan must have borrower and lender links, an applicable fixed or variable interest rate link, and identifiable interest payment terms governing its interest obligation."
    effect: "Reports core-record readiness or the specific missing or ambiguous prerequisite; no record changes."
    verification: "Recheck and cite the borrower, lender, and rate links and the terms’ governing connection to that loan’s interest."
  - name: verifySecuredLoanCollateralLink
    input: SecuredLoan
    preconditions:
      - "For a successful confirmation, the target must be identified as a secured loan and linked to identified pledged collateral."
    effect: "Reports recorded collateral support or the missing identification or link; no record changes."
    verification: "Recheck and cite the secured-loan identification and its link to the pledged collateral."
  - name: reviewVariableRateSetup
    input: Loan
    preconditions:
      - "For a successful confirmation, the loan must link to a variable interest rate record and have an interest rate reset schedule."
    effect: "Reports that the variable-rate setup includes both records, or identifies the missing link; no record changes."
    verification: "Recheck and cite the linked variable interest rate record, reset schedule, and supporting links."
  - name: reviewPaymentRecordCompleteness
    input: Loan
    preconditions:
      - "For a successful confirmation, the loan must have a payment history containing individual payment transactions."
    effect: "Reports that individual payment entries are recorded, or identifies the missing history or entries; no record changes."
    verification: "Recheck and cite the loan’s payment-history link, the history’s individual entries, and the links used to reach them."
  - name: reviewPrepaymentPenaltyTiming
    input: Loan
    preconditions:
      - "For a successful confirmation, applicable prepayment terms must govern the loan’s principal and contain a reliable prepayment penalty term in months."
    effect: "Reports the recorded term in months or why timing cannot be confirmed; no record changes."
    verification: "Recheck and cite the loan’s principal, applicable prepayment terms, their governing connection, and the recorded term in months."