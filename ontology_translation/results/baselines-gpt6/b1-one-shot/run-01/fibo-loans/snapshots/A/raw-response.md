classes:
  Loan:
    meaning: "Money or credit extended to a borrower to be repaid under the loan’s terms."
    properties:
      principalAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  CreditFacility:
    meaning: "An arrangement that lets a borrower draw funds over time without applying for a new loan each time."
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
  Borrower:
    meaning: "The party obligated to repay under the credit agreement and, for a facility, able to draw funds."
  Lender:
    meaning: "The party that provides a loan or credit facility."
  Servicer:
    meaning: "The party that collects principal and interest payments on the lender’s behalf."
  FixedInterestRate:
    meaning: "A rate record whose rate does not fluctuate over the life of the loan."
    properties:
      rate:
        type: number
  VariableInterestRate:
    meaning: "A rate record whose rate may change over the loan’s term."
    aliases:
      - adjustable rate
    properties:
      rate:
        type: number
  Interest:
    meaning: "The interest obligation associated with a loan, distinct from its rate record."
  InterestPaymentTerms:
    meaning: "Terms governing payment of a loan’s interest and using a day-count convention as their accrual basis."
    properties:
      initialInterestAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      interestPaymentFrequency:
        type: text
      interestPaymentDay:
        type: text
      compoundingFrequency:
        type: text
  InterestRateResetSchedule:
    meaning: "A schedule of dates on which a variable interest rate is reset and recalculated."
  DayCountConvention:
    meaning: "The accrual basis used under interest payment terms to calculate interest."
  Principal:
    meaning: "What must be repaid on a loan apart from interest, distinct from the loan’s recorded principal-amount field."
  PrincipalRepaymentTerms:
    meaning: "Terms governing payment of a loan’s principal."
    properties:
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      principalPaymentFrequency:
        type: text
      principalPaymentDay:
        type: text
  LoanPaymentSchedule:
    meaning: "The overall schedule of expected payments associated with a particular loan."
    properties:
      anticipatedNumberOfPayments:
        type: number
  AmortizationSchedule:
    meaning: "A schedule of periodic payments and projected changes in the debt balance over time."
    properties:
      anticipatedNumberOfPayments:
        type: number
  PrincipalPaymentSchedule:
    meaning: "A schedule giving the dates on which some or all loan principal is due."
    properties:
      anticipatedNumberOfPayments:
        type: number
  InterestPaymentSchedule:
    meaning: "A schedule giving the dates on which loan interest is due."
    properties:
      anticipatedNumberOfPayments:
        type: number
  SecuredLoan:
    meaning: "A loan identified as secured by pledged collateral under a security agreement or by a third-party guarantee."
  Collateral:
    meaning: "Something pledged as security for an obligation."
  SecurityAgreement:
    meaning: "An agreement granting a financial interest in collateral to a party that does not own it and setting out rights and duties concerning that collateral."
  PaymentHistory:
    meaning: "The loan’s record of actual individual payments."
  IndividualPaymentTransaction:
    meaning: "An actual payment entry in a loan’s payment history that can cover principal, interest, fees, or related amounts."
  PrepaymentTerms:
    meaning: "Terms concerning repayment of principal before maturity that record a penalty period when a penalty applies."
    properties:
      prepaymentPenaltyTermInMonths:
        type: number

relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: "Identifies the party obligated to repay the loan."
  - name: hasLender
    from: Loan
    to: Lender
    meaning: "Identifies the party financing the loan."
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting principal and interest payments for the lender."
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: "Identifies the party that may draw under the facility and owes repayment."
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: "Identifies the party providing the facility."
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "Identifies the interest obligation associated with the loan."
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: "Identifies the fixed interest rate applicable to the loan."
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: "Identifies the variable interest rate applicable to the loan."
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: "Identifies the interest whose payment these terms govern."
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: "Identifies the convention used to calculate interest accrual under these terms."
  - name: hasSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: "Identifies the schedule directly linked to the loan for resetting and recalculating a variable rate."
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: "Identifies the loan’s principal repayment obligation."
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "Identifies the principal whose payment these terms govern."
  - name: hasSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: "Identifies the loan’s overall expected-payment schedule when applicable."
  - name: hasSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: "Identifies the loan’s periodic-payment and projected-balance schedule when applicable."
  - name: hasSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: "Identifies the dates principal is due when this schedule applies."
  - name: hasSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: "Identifies the dates interest is due when this schedule applies."
  - name: isKindOf
    from: SecuredLoan
    to: Loan
    meaning: "A secured loan is the same loan record identified as secured, not a second loan record or a separate lookup path."
  - name: isCollateralizedBy
    from: SecuredLoan
    to: Collateral
    meaning: "Identifies collateral pledged for a loan already identified as secured."
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: "Identifies the collateral in which the agreement grants a financial interest."
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan’s record of actual payments."
  - name: hasIndividualPayments
    from: PaymentHistory
    to: IndividualPaymentTransaction
    meaning: "Identifies actual payment entries contained in the history."
  - name: isAFormOf
    from: PrepaymentTerms
    to: PrincipalRepaymentTerms
    meaning: "Prepayment terms are a form of principal repayment terms, but this distinction does not establish which loan they apply to."

rules:
  - name: loanReadinessConfirmed
    conditions:
      - The loan has a borrower and a lender.
      - If the loan is interest-bearing, it has an applicable fixed or variable interest rate.
      - If the loan is interest-bearing, interest payment terms govern the loan’s linked interest; finding those terms may require searching the governs payment of relationship in reverse.
      - If a required link cannot be verified, readiness remains unconfirmed.
  - name: collateralSupportConfirmed
    conditions:
      - The input loan is already identified as a secured loan.
      - The secured loan is collateralized by linked collateral.
      - Without a verifiable collateral link, this check remains unconfirmed and says nothing about whether a guarantee is sufficient.
  - name: variableRateSetupConfirmed
    conditions:
      - The loan has a link to a variable interest rate.
      - The loan directly has an interest rate reset schedule.
      - If either link cannot be verified, the review remains unconfirmed.
  - name: paymentRecordCompletenessConfirmed
    conditions:
      - Payment tracking is being reviewed.
      - The loan has a payment history containing at least one individual payment transaction.
      - If either link cannot be verified, completeness remains unconfirmed; this does not determine whether a payment was missed.
  - name: loanFocusedPrepaymentReviewUnconfirmed
    conditions:
      - Prepayment terms are supplied separately, with no defined evidence establishing that they apply to the particular loan.
      - A prepayment penalty term in months found only on those supplied terms does not confirm penalty timing for the loan.
  - name: scheduleMatchNotEstablished
    conditions:
      - An anticipated number of payments alone cannot establish that a schedule matches or mismatches its governing terms.
      - A definitive comparison needs actual scheduled dates, projected balance changes for amortization, and an agreed comparison procedure, which have not been specified.
  - name: securedStatusNotEstablished
    conditions:
      - No source or rule has been defined for classifying an arbitrary loan as secured or unsecured.
      - An absent collateral link does not establish that a loan is unsecured.

actions:
  - name: assessLoanReadiness
    input: Loan
    preconditions:
      - A loan is supplied for inspection; missing links do not prevent the check from running.
    effect: "Record readiness as confirmed with the verified links, or as unconfirmed with each required link that could not be verified."
    verification: "Recheck the borrower and lender links and, for an interest-bearing loan, the applicable rate link and terms whose governs payment of link points to that loan’s interest."
  - name: verifySecuredLoanSupport
    input: SecuredLoan
    preconditions:
      - The input has already been identified as a secured loan through the supplied record or check context.
    effect: "Record collateral support as confirmed with its verified link, or leave it unconfirmed and identify the missing or unverifiable link; make no finding about a security agreement or guarantee."
    verification: "Reinspect the secured loan’s collateralized by link against the recorded result."
  - name: reviewVariableRateSetup
    input: Loan
    preconditions:
      - A loan is supplied for the variable-rate setup review.
    effect: "Record setup as confirmed with evidence of both direct loan links, or as unconfirmed with the missing or unverifiable link identified."
    verification: "Recheck the loan’s variable-interest-rate link and its direct interest-rate-reset-schedule link."
  - name: reviewPaymentRecordCompleteness
    input: Loan
    preconditions:
      - Payment tracking is being reviewed.
    effect: "Record completeness as confirmed with the history and payment entries checked, or as unconfirmed with the failed link identified; make no missed-payment judgment."
    verification: "Recheck the loan-to-history link and inspect the history’s individual payment transactions."
  - name: reviewPrepaymentTerms
    input: Loan
    preconditions:
      - The review starts from a loan; any prepayment terms inspected are supplied separately.
    effect: "Report any prepayment penalty term in months found on supplied terms, but leave the loan-focused review unconfirmed because their applicability to that loan cannot be verified."
    verification: "Recheck the month value on the supplied terms and confirm the report does not claim penalty timing was verified for the loan."