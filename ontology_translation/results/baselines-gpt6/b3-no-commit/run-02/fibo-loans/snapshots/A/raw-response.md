classes:
  Loan:
    meaning: "Money or credit extended with an obligation to repay under its terms."
    properties:
      principalAmount:
        type: number
      maturityDate:
        type: date
      interestOnly:
        type: boolean
        allowed:
          - "yes"
          - "no"
      negativeAmortization:
        type: boolean
        allowed:
          - "yes"
          - "no"
      balloonPayment:
        type: boolean
        allowed:
          - "yes"
          - "no"
      interestRateCap:
        type: number
      firstRateChangeTermMonths:
        type: number
  SecuredLoan:
    meaning: "A kind of loan identified as having security for repayment."
  CollateralizedLoan:
    meaning: "A kind of secured loan backed by collateral."
  GuaranteedLoan:
    meaning: "A kind of secured loan supported by a guaranty, which does not by itself establish collateral."
  CreditFacility:
    meaning: "An arrangement that lets a borrower draw over an extended period without applying for a new loan each time."
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      amountOfCreditExtended:
        type: number
      availableAmount:
        type: number
  Borrower:
    meaning: "The party responsible for repayment."
  Lender:
    meaning: "The party providing the credit."
  Servicer:
    meaning: "The party that collects a loan's payments on the lender's behalf."
  Principal:
    meaning: "The amount of debt to be repaid, separate from interest."
  Interest:
    meaning: "The cost of using credit that is payable to the lender, distinct from the rate used to calculate it."
  FixedInterestRate:
    meaning: "A rate that does not fluctuate over the loan's life."
    properties:
      rate:
        type: number
  VariableInterestRate:
    meaning: "A rate that can change over the loan's life."
    aliases:
      - adjustable rate
    properties:
      rate:
        type: number
  InterestPaymentTerms:
    meaning: "Terms governing payment of an interest obligation."
  PrincipalRepaymentTerms:
    meaning: "Terms governing how principal is due to be repaid."
  PrepaymentTerms:
    meaning: "Terms concerning repayment of principal before maturity, including a penalty period when applicable."
    properties:
      prepaymentPenaltyTermMonths:
        type: number
  LoanPaymentSchedule:
    meaning: "A schedule setting out regular payments or explicit payment events for a loan."
  AmortizationSchedule:
    meaning: "A schedule showing periodic payments and how the debt balance changes over time."
  PrincipalPaymentSchedule:
    meaning: "A schedule setting out when some or all of the principal is due."
  InterestPaymentSchedule:
    meaning: "A schedule setting out when interest payments are due."
  InterestCalculationSchedule:
    meaning: "A schedule setting out when interest is calculated."
  InterestRateResetSchedule:
    meaning: "A schedule setting out when a rate reset and its corresponding actual rate are recalculated."
  Collateral:
    meaning: "Something pledged to secure an obligation."
  SecurityAgreement:
    meaning: "An agreement granting an interest in collateral and setting out rights concerning it."
  CollateralValueAsOfDate:
    meaning: "A dated record pairing an appraised collateral value with the date it applies to."
    properties:
      value:
        type: number
      asOfDate:
        type: date
  LoanToValueRatio:
    meaning: "A measure comparing this loan's principal with the appraised value of its collateral."
    aliases:
      - LTV
    properties:
      ratio:
        type: number
  CombinedLoanToValueRatio:
    meaning: "A measure comparing total debt secured by the relevant asset or assets with their appraised value."
    properties:
      ratio:
        type: number
  PaymentHistory:
    meaning: "A loan's record containing individual payments actually made."
  IndividualPaymentTransaction:
    meaning: "A record of one actual payment, not a payment merely scheduled."
  BorrowingCapacity:
    meaning: "The lender's assessment, as of a point in time, of the upper bound a borrower can repay when due."
    properties:
      amount:
        type: number

relationships:
  - name: isKindOf
    from: SecuredLoan
    to: Loan
    meaning: "A secured loan is a kind of loan, not a second record alongside it."
  - name: isKindOf
    from: CollateralizedLoan
    to: SecuredLoan
    meaning: "A collateralized loan is a more specific kind of secured loan."
  - name: isKindOf
    from: GuaranteedLoan
    to: SecuredLoan
    meaning: "A guaranteed loan is a kind of secured loan, but is not necessarily collateralized."
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: "The link identifies the party obliged to repay the loan."
  - name: hasLender
    from: Loan
    to: Lender
    meaning: "The link identifies the party that extended the loan."
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "The link identifies who collects the loan's payments on the lender's behalf."
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: "The link identifies the party entitled to draw under the facility, without approving a particular draw."
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: "The link identifies the party providing the facility."
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: "The link identifies the loan's principal obligation."
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "The link identifies the loan's interest obligation."
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: "The link identifies an applicable fixed rate when the loan has one."
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: "The link identifies an applicable variable rate when the loan has one."
  - name: governPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: "The terms govern payment of the interest obligation, not payment of its rate."
  - name: governPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "The terms govern repayment of that principal."
  - name: hasSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: "The link identifies the schedule setting out payments for the loan."
  - name: hasSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: "The link identifies the schedule showing periodic payments and balance changes."
  - name: hasSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: "The link identifies the schedule setting out when principal is due."
  - name: hasSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: "The link identifies the schedule setting out when interest payments are due."
  - name: hasSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: "The link identifies the separate schedule setting out when interest is calculated."
  - name: hasSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: "The link identifies the schedule for recalculating a rate reset and corresponding actual rate."
  - name: isCollateralizedBy
    from: SecuredLoan
    to: Collateral
    meaning: "The link identifies collateral recorded for the secured loan and must be verified rather than inferred from its kind."
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: "The link identifies collateral covered by the agreement without establishing that the agreement applies to a particular loan."
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValueAsOfDate
    meaning: "The link identifies a dated appraised value for the collateral without selecting it as the basis for a ratio."
  - name: hasLoanToValueRatio
    from: CollateralizedLoan
    to: LoanToValueRatio
    meaning: "The link identifies the collateralized loan's loan-to-value measure."
  - name: hasCombinedLoanToValueRatio
    from: CollateralizedLoan
    to: CombinedLoanToValueRatio
    meaning: "The link identifies the collateralized loan's separate combined-debt measure."
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "The link identifies the loan's record of actual payments."
  - name: hasIndividualPayment
    from: PaymentHistory
    to: IndividualPaymentTransaction
    meaning: "The link identifies an actual payment recorded in the history."
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "The link identifies an assessment associated with the borrower, not a facility's available amount."

rules:
  - name: loanReadiness
    conditions:
      - "Confirm only when the loan has borrower and lender links and an applicable fixed- or variable-interest-rate link."
      - "When an applicable rate link is present, also confirm the loan's interest obligation and interest payment terms governing that interest."
      - "A missing rate link leaves readiness unconfirmed; it does not establish that the loan is interest-free."
  - name: securedLoanSupport
    conditions:
      - "For a loan identified as secured, confirm collateral support only when its recorded link to collateral is found."
      - "Neither its secured description nor a guaranty supplies a missing collateral link; a security agreement is not a precondition for this review."
  - name: variableRateSetup
    conditions:
      - "Confirm only when the loan has both a variable interest rate link and an interest rate reset schedule link."
      - "An interest rate cap and first rate change term are not preconditions for this review."
  - name: paymentRecordCompleteness
    conditions:
      - "Confirm only when the loan links to a payment history containing at least one individual payment transaction."
      - "This establishes the presence of actual payment records, not their details or that every payment was captured."
  - name: prepaymentPenaltyTiming
    conditions:
      - "For a particular loan with a prepayment penalty to review, the applicable prepayment terms and their prepayment penalty term in months must be established before timing can be confirmed."
      - "No supported path identifies a particular loan's applicable prepayment terms or establishes that its penalty applies, so a term found on an unlinked record cannot confirm this review."
  - name: loanKindIdentification
    conditions:
      - "Use a source's identification of a loan as secured, collateralized, or guaranteed to choose kind-specific questions."
      - "If that identification is absent, leave the kind unknown rather than infer it solely from collateral or a guaranty."
  - name: ambiguousSupportingRecords
    conditions:
      - "If several security agreements cover linked collateral, do not select one as the loan's agreement without further evidence."
      - "If collateral has several dated values, do not claim one supports a particular ratio without further evidence."
      - "If several borrowing-capacity assessments are linked to a borrower, report the ambiguity rather than select one as current."
  - name: missingRecordedValues
    conditions:
      - "Report an absent or untrustworthy interest only, negative amortization, or balloon payment value as unknown, not as no or a third recorded choice."
      - "Do not report an individual payment's date, amount, or allocation from the payment-history links, because those details were not established."

actions:
  - name: assessLoanReadiness
    input: Loan
    preconditions:
      - "A loan is supplied for an evidence review, not for approval or modification."
    effect: "Report confirmed only when its borrower, lender, applicable rate, interest obligation, and governing interest-payment-terms links are present; otherwise report unconfirmed and name the missing evidence."
    verification: "Recheck and retain the links used to support the result."
  - name: verifySecuredLoanSupport
    input: Loan
    preconditions:
      - "The supplied loan is identified as secured."
    effect: "Report confirmed only when its link to recorded collateral is present; otherwise report unconfirmed and identify the missing link, without claiming to have reviewed a security agreement."
    verification: "Recheck and retain the loan-to-collateral link as evidence."
  - name: reviewVariableRateSetup
    input: Loan
    preconditions:
      - "A loan is supplied for review of its variable-rate setup."
    effect: "Report confirmed only when both its variable-interest-rate and interest-rate-reset-schedule links are present; otherwise report unconfirmed and identify the missing evidence."
    verification: "Recheck and retain both links; neither a cap nor a first-change term is required for this review."
  - name: reviewPaymentRecordCompleteness
    input: Loan
    preconditions:
      - "A loan is supplied for review of its payment records."
    effect: "Report confirmed only when the loan has a payment history containing at least one individual payment transaction; otherwise report unconfirmed and identify what is missing."
    verification: "Recheck and retain the loan-to-history and history-to-transaction links without claiming to verify payment details or exhaustiveness."
  - name: reviewPrepaymentPenaltyTiming
    input: Loan
    preconditions:
      - "A particular loan has a prepayment penalty to review, but its applicable prepayment terms must be identified by evidence before the check can be confirmed."
    effect: "Report unconfirmed because the applicable prepayment terms cannot currently be identified; if they are established later, check whether their prepayment penalty term in months is recorded."
    verification: "Retain evidence identifying the loan's applicable terms and recheck their recorded penalty term if that evidence becomes available; an unlinked term is insufficient."