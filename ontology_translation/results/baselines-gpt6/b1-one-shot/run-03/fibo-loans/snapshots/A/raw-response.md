classes:
  Loan:
    meaning: "Money or credit extended to a borrower under terms requiring repayment."
    properties:
      principalAmount: {type: number}
      maturityDate: {type: date}
      initialExchangeDate: {type: date}
      interestOnly: {type: boolean}
      negativeAmortization: {type: boolean}
      balloonPayment: {type: boolean}
  SecuredLoan:
    meaning: "A loan whose repayment is secured, whether by pledged collateral or a guaranty."
  GuaranteedLoan:
    meaning: "A loan secured as to repayment by a guaranty, which need not have pledged collateral."
  CollateralizedLoan:
    meaning: "A loan backed by pledged collateral."
  AmortizingLoan:
    meaning: "A loan identified as amortizing, for which an amortization schedule and terms governing principal are expected."
  CreditAgreement:
    meaning: "The broader kind of credit arrangement whose maturity and initial exchange dates are recorded on the credit-agreement view."
    properties:
      maturityDate: {type: date}
      initialExchangeDate: {type: date}
  CreditFacility:
    meaning: "An arrangement that lets a borrower draw funds over time without applying for a new loan each time."
    aliases:
      - master commitment
    properties:
      creditLimit: {type: number}
      availableAmount: {type: number}
  Borrower:
    meaning: "The party obligated to repay what was borrowed, including applicable interest and fees."
  Lender:
    meaning: "The party extending money or credit with the expectation of repayment."
  Servicer:
    meaning: "The party collecting principal and interest payments on the lender's behalf."
  PaymentHistory:
    meaning: "A record of actual payments of principal, interest, and related amounts made toward a loan."
  IndividualPaymentTransaction:
    meaning: "One actual payment toward principal, interest, fees, or another related amount, rather than a scheduled payment."
  OverallLoanPaymentSchedule:
    meaning: "The regular or explicitly set-out payment schedule for a particular loan."
    aliases:
      - loan payment schedule
  AmortizationSchedule:
    meaning: "Periodic payments showing how a debt balance is expected to change over time."
  PrincipalPaymentSchedule:
    meaning: "The dates when some or all of a loan's principal is due to be repaid."
    aliases:
      - principal repayment schedule
  InterestPaymentSchedule:
    meaning: "The dates when interest is due to be paid."
  InterestRateResetSchedule:
    meaning: "The dates when an interest rate is reset and the resulting rate recalculated."
  InterestCalculationSchedule:
    meaning: "The dates when interest is calculated, which need not be payment dates."
  Principal:
    meaning: "The amount of an obligation to be repaid, separate from interest."
    properties:
      outstandingAmount: {type: number}
  Interest:
    meaning: "The cost of using credit, separate from principal."
  FixedInterestRate:
    meaning: "An interest rate that does not change over the life of the loan."
    properties:
      rate: {type: number}
  VariableInterestRate:
    meaning: "An interest rate that may change over the life of the loan."
    aliases:
      - adjustable rate
    properties:
      rate: {type: number}
  PrincipalRepaymentTerms:
    meaning: "The agreed requirements for repaying principal."
    properties:
      initialPrincipalPaymentDate: {type: date}
      principalRepaymentDate: {type: date}
      principalPaymentFrequency: {type: text}
      principalPaymentDay: {type: text}
  InterestPaymentTerms:
    meaning: "The agreed requirements for paying interest."
    properties:
      initialInterestAccrualDate: {type: date}
      initialInterestPaymentDate: {type: date}
      finalInterestPaymentDate: {type: date}
      interestPaymentFrequency: {type: text}
      interestPaymentDay: {type: text}
      compoundingFrequency: {type: text}
  PrepaymentTerms:
    meaning: "Terms for paying principal before a loan matures, including any recorded penalty period."
    properties:
      prepaymentPenaltyTermInMonths: {type: number}
  DayCountConvention:
    meaning: "The agreed method for counting days when calculating accrued interest."
  BorrowingCapacity:
    meaning: "The assessed upper bound on what a lender believes a borrower can repay when due."
    properties:
      amount: {type: number}
  Collateral:
    meaning: "An asset pledged to support repayment of an obligation."
  SecurityAgreement:
    meaning: "An agreement granting an interest in collateral and setting out rights and duties concerning it."
  CollateralValueAsOfADate:
    meaning: "A collateral asset's appraised value recorded for a particular date."
    properties:
      value: {type: number}
      asOfDate: {type: date}
  LoanToValueRatio:
    meaning: "This loan's principal amount compared with the appraised value of the asset securing it."
    properties:
      ratio: {type: number}
  CombinedLoanToValueRatio:
    meaning: "Total debt secured by the asset or assets compared with their appraised value."
    properties:
      ratio: {type: number}

relationships:
  - name: isKindOf
    from: SecuredLoan
    to: Loan
    meaning: "A secured loan is a kind of loan; this connection does not identify which particular loans are secured."
  - name: isKindOf
    from: GuaranteedLoan
    to: SecuredLoan
    meaning: "A guaranteed loan is secured as to repayment by a guaranty, not necessarily by collateral."
  - name: isKindOf
    from: CollateralizedLoan
    to: SecuredLoan
    meaning: "A collateralized loan is a secured loan backed by pledged collateral."
  - name: isKindOf
    from: AmortizingLoan
    to: Loan
    meaning: "An amortizing loan is a kind of loan, but the recorded loan values do not establish whether a particular loan is amortizing."
  - name: isKindOf
    from: CreditFacility
    to: CreditAgreement
    meaning: "A credit facility is a kind of credit agreement, not a link to a separately established agreement record for that facility."
  - name: isKindOf
    from: PrepaymentTerms
    to: PrincipalRepaymentTerms
    meaning: "Prepayment terms are a kind of principal repayment terms; this does not identify the terms applicable to a particular loan."
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: "The loan has the borrower who incurs its repayment obligation."
  - name: hasLender
    from: Loan
    to: Lender
    meaning: "The loan has the lender financing it."
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: "The facility has the borrower who may draw funds under it."
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: "The facility has the lender providing it."
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "The loan is serviced by the party collecting its payments on the lender's behalf."
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "The loan has a history of payments actually made toward it."
  - name: hasIndividualPaymentTransactions
    from: PaymentHistory
    to: IndividualPaymentTransaction
    meaning: "The payment history contains actual payment transactions rather than planned payments."
  - name: hasOverallLoanPaymentSchedule
    from: Loan
    to: OverallLoanPaymentSchedule
    meaning: "The loan has its overall schedule of planned payments on file."
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: "The loan has a schedule of expected periodic payments and balance changes on file."
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: "The loan has a schedule of dates when principal is due."
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: "The loan has a schedule of dates when interest is due."
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: "The loan has a schedule of rate-reset and recalculation dates."
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: "The loan has a schedule of interest-calculation dates, distinct from interest payment dates."
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: "The loan has a principal obligation whose outstanding amount can change."
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "The loan has interest distinct from its principal obligation."
  - name: governPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "The agreed principal repayment terms govern payment of that principal."
  - name: governPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: "The agreed interest payment terms govern payment of that interest."
  - name: haveAnAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: "The interest payment terms use the day-count convention to calculate accrued interest."
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: "The loan has a fixed interest rate when that is its applicable rate arrangement."
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: "The loan has a variable interest rate when that is its applicable rate arrangement."
  - name: isCollateralizedBy
    from: Loan
    to: Collateral
    meaning: "The loan links to an asset actually pledged for it; a guarantee alone does not create this link."
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: "The security agreement grants an interest in the collateral."
  - name: hasCollateralValueAsOfADate
    from: Collateral
    to: CollateralValueAsOfADate
    meaning: "The collateral has an appraised-value record with an as-of date."
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: "A collateralized loan has its relevant loan-to-value ratio on file."
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: "A collateralized loan has its relevant combined loan-to-value ratio on file."
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "The borrower has an assessed borrowing capacity."

rules:
  - name: loanSetupReadiness
    conditions:
      - "Confirm the loan has borrower and lender links."
      - "When the loan has a fixed- or variable-rate link, confirm it has an interest record and find interest payment terms governing that interest by reverse lookup."
      - "If the rate arrangement is unknown, report the interest-terms portion as unresolved, not passed or interest-free."
  - name: collateralOnlySupport
    conditions:
      - "Apply the collateral-only check when the particular loan is independently identified as secured; the collateral link alone cannot establish its security kind."
      - "Linked collateral confirms collateral support; without the link, collateral support is not confirmed."
      - "For a known guarantee-only loan, report no collateral support established by this check, not missing collateral; if security kind is unknown, report unresolved."
  - name: variableRateSetup
    conditions:
      - "When a loan has a variable interest rate link, confirm the same loan has an interest rate reset schedule; a missing schedule prevents the check from passing."
      - "If the rate arrangement is unknown, report unresolved; the numeric rate is not tested."
  - name: paymentRecordCompleteness
    conditions:
      - "Confirm the loan has a payment history containing at least one individual payment transaction."
      - "If either part is absent, report completeness not confirmed and name the missing part without inferring that a payment was due or missed."
  - name: prepaymentPenaltyTiming
    conditions:
      - "Only when penalty applicability and the prepayment terms applicable to the particular loan are supplied externally, check whether the penalty term in months is recorded."
      - "A missing period then prevents the check from passing; if either prerequisite is unknown, report unresolved rather than inferring no penalty."
  - name: amortizingLoanSetup
    conditions:
      - "Only when a particular loan is independently known to be amortizing, expect its amortization schedule and principal repayment terms governing its principal."
      - "If either is missing, flag setup as incomplete; if whether the loan is amortizing is unknown, leave the condition unresolved."
      - "Do not infer that a loan is amortizing from its interest-only or negative-amortization value or from the presence of a schedule."

actions:
  - name: checkLoanSetupReadiness
    input: Loan
    preconditions:
      - "A particular loan is available for inspection; a known fixed or variable rate triggers inspection of its interest and governing terms."
      - "Finding terms governing that interest requires reverse lookup of the govern-payment-of connection."
    effect: "Reports confirmed, missing, and unresolved setup links without changing a record or granting approval or funding authority."
    verification: "Re-read the same loan's borrower, lender, applicable rate, and interest links and the governing-terms connection, and retain the findings."
  - name: checkSecuredLoanSupport
    input: Loan
    preconditions:
      - "The loan's security kind must be established externally for a conclusive interpretation; a guarantee does not count as collateral."
    effect: "Reports whether linked collateral confirms support, whether support is not confirmed, or whether security kind leaves the result unresolved; changes no record."
    verification: "Re-read the same loan's collateral link and retain the finding with the established security-kind context."
  - name: checkVariableRateSetup
    input: Loan
    preconditions:
      - "Inspect the loan's rate arrangement; require a reset schedule when a variable-rate link is established."
    effect: "Reports whether variable-rate setup is confirmed, not confirmed for a missing schedule, or unresolved for an unknown rate arrangement; changes no record."
    verification: "Re-read the applicable rate and reset-schedule links on the same loan and retain the findings."
  - name: checkPaymentRecordCompleteness
    input: Loan
    preconditions:
      - "Inspect the loan's payment-history link and any individual payment transactions in that history."
    effect: "Reports completeness confirmed or not confirmed, naming any missing part without inferring a missed payment; changes no record."
    verification: "Re-read the loan-to-history and history-to-transaction links and retain the findings."
  - name: reviewPrepaymentPenaltyTiming
    input: Loan
    preconditions:
      - "External context must identify the applicable prepayment terms and confirm that a penalty applies to this loan for a conclusive check."
    effect: "Reports whether the penalty term in months is recorded, or reports unresolved when either prerequisite is unknown; changes no record and grants no authority to charge a penalty."
    verification: "Re-read the period on the externally identified terms and retain that finding with both external prerequisites."