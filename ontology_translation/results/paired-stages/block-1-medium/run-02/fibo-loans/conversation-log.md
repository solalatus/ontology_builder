# Ontology-recovery eval — conversation log

Status: **stages_complete** — 151 turn(s) so far, 1734s elapsed.
Last updated: 2026-10-20T10:04:57.271Z

### Turn 0 — persona

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### Turn 1 — app-user

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### Turn 1 — app-tool

🔍 Checked the current ontology state.

### Turn 1 — app-assistant

We’ll start with the real questions the agent must answer, then capture its actions. From there, we’ll work through the relevant things, connections, decision fields, rules, and checks—about ten short phases in all. The ontology is currently empty.

What questions do you need the agent to answer when an approved loan or credit facility is handed over for setup? Give me the questions as you would ask them at work; a first batch of five or so is enough.

### Turn 1 — persona

At hand-off, I’d start with these:

1. Who’s the borrower, and which lender is providing the loan or facility?
2. What principal amount or credit limit was approved, when is funding expected, and when does the agreement mature?
3. Is the rate fixed or variable? If it’s variable, where is the rate-reset schedule?
4. What terms govern principal repayment and interest payments, and which payment schedules are on file?
5. Is the loan secured? If so, what collateral is linked to it, and what security agreement supports it?

Those tell us whether we have the basic parties, amounts, terms, and support needed to set up the record.

### Turn 2 — app-user

At hand-off, I’d start with these:

1. Who’s the borrower, and which lender is providing the loan or facility?
2. What principal amount or credit limit was approved, when is funding expected, and when does the agreement mature?
3. Is the rate fixed or variable? If it’s variable, where is the rate-reset schedule?
4. What terms govern principal repayment and interest payments, and which payment schedules are on file?
5. Is the loan secured? If so, what collateral is linked to it, and what security agreement supports it?

Those tell us whether we have the basic parties, amounts, terms, and support needed to set up the record.

### Turn 2 — app-assistant

I’ve split your five hand-off checks into separate questions so each can be tested later:

1. Who is the borrower for a loan or facility?
2. Which lender provides it?
3. What principal amount or credit limit was approved?
4. When is funding expected?
5. When does the agreement mature?
6. Is the rate fixed or variable?
7. If the rate is variable, where is its rate-reset schedule?
8. What terms govern principal repayment and interest payments?
9. Which payment schedules are on file?
10. Is the loan or facility secured?
11. If secured, what collateral is linked to it?
12. What security agreement supports that collateral?

Do these preserve the questions you need the agent to answer at hand-off?

### Turn 2 — persona

Yes, that preserves the core hand-off questions. I’d tighten three points before using them as checks:

- For **funding**, ask for the agreed initial funding or exchange date, rather than a general forecast of when funding is expected.
- Keep **loan principal** separate from a facility’s **credit limit**. For a facility, I may also need to see how much credit has been extended and how much remains available.
- Don’t make collateral and a security agreement the only possible support for every secured loan. A loan may instead be backed by a guarantee. Where collateral *is* pledged, check that it’s linked to the loan and that the security agreement covers that collateral.

With those distinctions, the questions work as a first hand-off set.

### Turn 3 — app-user

Yes, that preserves the core hand-off questions. I’d tighten three points before using them as checks:

- For **funding**, ask for the agreed initial funding or exchange date, rather than a general forecast of when funding is expected.
- Keep **loan principal** separate from a facility’s **credit limit**. For a facility, I may also need to see how much credit has been extended and how much remains available.
- Don’t make collateral and a security agreement the only possible support for every secured loan. A loan may instead be backed by a guarantee. Where collateral *is* pledged, check that it’s linked to the loan and that the security agreement covers that collateral.

With those distinctions, the questions work as a first hand-off set.

### Turn 3 — app-tool

✓ Applied: 16 added, 0 updated.

### Turn 3 — app-assistant

I’ve recorded the revised hand-off questions, including the separate loan principal and facility credit-limit checks, the agreed initial funding or exchange date, and the distinction between collateral and a guarantee.

Once the account is set up, what questions must the agent answer to tell whether it is tracking its agreed terms?

### Turn 3 — persona

Once it’s set up, I’d ask:

1. Who is servicing the loan and collecting payments on the lender’s behalf?
2. What principal, interest, and amortization schedules apply, and are the relevant repayment terms on file?
3. What payments have actually been made, and does the payment history contain the individual transactions behind it?
4. What principal remains outstanding, and what interest has accrued but not yet been paid, as of the date we’re checking?
5. If the rate varies, what reset schedule applies? Are there a rate cap or first-rate-change term to track?
6. Is the loan interest-only, capable of negative amortization, or structured with a balloon payment? Those change how we interpret a balance that isn’t falling steadily.
7. Do prepayment terms apply, and is there a recorded penalty period?
8. For a collateralized loan, what is the dated collateral value, and what are the loan-to-value and combined loan-to-value ratios?
9. For a facility, how much credit has been extended, how much is available, and are there sub-facilities to track separately?

These let us check both the agreed setup and the records of what has happened. They don’t, by themselves, establish that every payment was made on time; we’d need to compare the applicable schedule with the actual transactions to answer that.

### Turn 4 — app-user

Once it’s set up, I’d ask:

1. Who is servicing the loan and collecting payments on the lender’s behalf?
2. What principal, interest, and amortization schedules apply, and are the relevant repayment terms on file?
3. What payments have actually been made, and does the payment history contain the individual transactions behind it?
4. What principal remains outstanding, and what interest has accrued but not yet been paid, as of the date we’re checking?
5. If the rate varies, what reset schedule applies? Are there a rate cap or first-rate-change term to track?
6. Is the loan interest-only, capable of negative amortization, or structured with a balloon payment? Those change how we interpret a balance that isn’t falling steadily.
7. Do prepayment terms apply, and is there a recorded penalty period?
8. For a collateralized loan, what is the dated collateral value, and what are the loan-to-value and combined loan-to-value ratios?
9. For a facility, how much credit has been extended, how much is available, and are there sub-facilities to track separately?

These let us check both the agreed setup and the records of what has happened. They don’t, by themselves, establish that every payment was made on time; we’d need to compare the applicable schedule with the actual transactions to answer that.

### Turn 4 — app-assistant

That gives us an ongoing-servicing set. I would record these as separate checks where the answers differ:

- Who services the loan and collects payments for the lender?
- Which principal, interest, and amortization schedules apply, and are their governing repayment terms on file?
- Which payments were made, and which individual transactions make up the payment history?
- What principal remains outstanding and what interest is accrued but unpaid **as of a specified date**?
- For a variable rate, which reset schedule, rate cap, and first-rate-change term apply?
- Do interest-only, negative-amortization, or balloon-payment terms apply?
- Which prepayment terms and penalty period apply?
- For pledged collateral, what is its dated value, and what are the loan-to-value and combined loan-to-value ratios?
- For a facility, which sub-facilities must be tracked separately, alongside extended and available credit?
- Comparing the applicable schedule with actual transactions, were payments made on time?

Does that capture the ongoing questions accurately, including the final comparison as a question the agent must work out rather than a fact already on file?

### Turn 4 — persona

Mostly, yes. The first nine capture the ongoing questions, with two useful distinctions: accrued interest has an **as-of date** on its record, while outstanding principal is a recorded amount without a separate as-of-date field here; and the rate cap and first-rate-change term are features to check **if they apply**, not required for every variable-rate loan.

I would keep the final question as a **comparison to work out**, not a fact already on file—but I wouldn’t yet claim the agent can determine whether payments were on time. We can identify the applicable schedules and the individual payments in the history; we haven’t established the transaction dates and comparison checks needed to reach an on-time conclusion reliably.

### Turn 5 — app-user

Mostly, yes. The first nine capture the ongoing questions, with two useful distinctions: accrued interest has an **as-of date** on its record, while outstanding principal is a recorded amount without a separate as-of-date field here; and the rate cap and first-rate-change term are features to check **if they apply**, not required for every variable-rate loan.

I would keep the final question as a **comparison to work out**, not a fact already on file—but I wouldn’t yet claim the agent can determine whether payments were on time. We can identify the applicable schedules and the individual payments in the history; we haven’t established the transaction dates and comparison checks needed to reach an on-time conclusion reliably.

### Turn 5 — app-tool

✓ Applied: 14 added, 0 updated.

### Turn 5 — app-assistant

I’ve recorded the ongoing questions with those distinctions: accrued interest has an as-of date on its record; outstanding principal does not get a separate date field from this answer; and the rate cap and first-rate-change term are checked only when applicable. I’ve also kept payment timeliness as a question to work out, **not** a capability we’ve established yet. Transaction dates and a reliable comparison method remain open.

What actions must the agent actually perform during hand-off or ongoing servicing—not just answer questions about? A list of roughly five to ten, in your own terms, is enough.

### Turn 5 — persona

I’d give the agent five checks to perform. These **confirm what’s on file**; they don’t approve credit, collect a payment, or change the loan’s terms. None has a separate authorization requirement specified here.

1. **Check loan setup readiness.** Given a loan, confirm its borrower and lender are recorded and, if it bears interest, that the applicable rate and interest payment terms are linked. Mark the core setup check complete only after verifying those links.
2. **Verify support for a secured loan.** Given a secured loan, check that collateral is actually linked to it. Record the check as complete only when that link is present.
3. **Review a variable-rate setup.** Given a loan with a variable rate, check that it also has an interest rate reset schedule. Verify both the rate and schedule before confirming the setup.
4. **Check payment-record completeness.** Given a loan, check for a payment history containing individual payment transactions. Confirm tracking is complete only when both the history and its entries are present.
5. **Review prepayment-penalty timing.** Given a loan with a prepayment penalty, check that the penalty period is recorded in its prepayment terms. Verify the recorded period before confirming the review.

A missing item means the relevant check cannot be confirmed; it isn’t evidence that a payment was late or that the underlying loan was never approved.

### Turn 6 — app-user

I’d give the agent five checks to perform. These **confirm what’s on file**; they don’t approve credit, collect a payment, or change the loan’s terms. None has a separate authorization requirement specified here.

1. **Check loan setup readiness.** Given a loan, confirm its borrower and lender are recorded and, if it bears interest, that the applicable rate and interest payment terms are linked. Mark the core setup check complete only after verifying those links.
2. **Verify support for a secured loan.** Given a secured loan, check that collateral is actually linked to it. Record the check as complete only when that link is present.
3. **Review a variable-rate setup.** Given a loan with a variable rate, check that it also has an interest rate reset schedule. Verify both the rate and schedule before confirming the setup.
4. **Check payment-record completeness.** Given a loan, check for a payment history containing individual payment transactions. Confirm tracking is complete only when both the history and its entries are present.
5. **Review prepayment-penalty timing.** Given a loan with a prepayment penalty, check that the penalty period is recorded in its prepayment terms. Verify the recorded period before confirming the review.

A missing item means the relevant check cannot be confirmed; it isn’t evidence that a payment was late or that the underlying loan was never approved.

### Turn 6 — app-assistant

These are five **verification actions**, not authority to approve credit, collect payments, or change terms. Each would confirm its check only after the relevant records or links have been verified; a missing item leaves that check unconfirmed.

There’s one conflict to settle before I record them: you said a secured loan may be backed by a guarantee instead of collateral, but action 2 requires a collateral link for every secured loan. Should that action apply **only when collateral is pledged**, or should it check for **either collateral or a guarantee**, as applicable?

### Turn 6 — persona

Neither change would describe this particular check accurately. It takes a **secured loan** and confirms that collateral is linked to it; a guarantee does not substitute for that link in this check.

You’re right to flag the tension. A loan can be described as secured by a guarantee, but this action checks **recorded collateral support**, not every possible form of security. I would not treat a guarantee-only loan as having passed it, or treat a failed collateral check as proof that the guarantee is absent.

### Turn 7 — app-user

Neither change would describe this particular check accurately. It takes a **secured loan** and confirms that collateral is linked to it; a guarantee does not substitute for that link in this check.

You’re right to flag the tension. A loan can be described as secured by a guarantee, but this action checks **recorded collateral support**, not every possible form of security. I would not treat a guarantee-only loan as having passed it, or treat a failed collateral check as proof that the guarantee is absent.

### Turn 7 — app-assistant

Understood. I’ve captured the five checks as requirements, with the second specifically testing **recorded collateral support for a secured loan**. It does not test whether a guarantee exists or whether the loan is otherwise secured. I haven’t yet defined the model’s actions or rules.

Before we turn these requirements into kinds of records, one narrow scope check: for the **lender and the party servicing and collecting payments**, is there a closely related role that does the day-to-day work under either one, and does any of these checks depend on a specific operating context that changes how it is handled?

### Turn 7 — persona

We distinguish the **lender**, which provides the credit, from the **servicer**, which collects principal and interest payments on the lender’s behalf. The servicer need not be the lender, but I don’t have a further day-to-day role under either one for these checks.

Nor do these five checks depend on a separate operating context that changes their handling. Their applicability depends on the loan and the check—for example, the rate-reset check applies when the loan has a variable rate.

### Turn 8 — app-user

We distinguish the **lender**, which provides the credit, from the **servicer**, which collects principal and interest payments on the lender’s behalf. The servicer need not be the lender, but I don’t have a further day-to-day role under either one for these checks.

Nor do these five checks depend on a separate operating context that changes their handling. Their applicability depends on the loan and the check—for example, the rate-reset check applies when the loan has a variable rate.

### Turn 8 — app-assistant

Phase 1 now has 30 recorded questions and five check actions to define later. The lender and servicer are distinct; there’s no further day-to-day role or separate operating context for these checks. The checks confirm what is on file, and a failed check does not establish that a loan was unapproved or a payment late.

Is that an accurate requirements baseline before we identify the kinds of things the agent needs to work with?

### Turn 8 — persona

Yes—that’s an accurate baseline for moving on. Keep payment timeliness marked as **not yet established**, and keep the collateral-support check distinct from any question about guarantee-only support. The five actions verify records; they don’t make credit or payment decisions.

### Turn 9 — app-user

Yes—that’s an accurate baseline for moving on. Keep payment timeliness marked as **not yet established**, and keep the collateral-support check distinct from any question about guarantee-only support. The five actions verify records; they don’t make credit or payment decisions.

### Turn 9 — app-assistant

I’ll keep payment timeliness unresolved, the collateral check separate from guarantee-only support, and all five actions limited to verifying records.

For the first group of kinds of things:

- **Loan** — needed as the subject of the setup, servicing, and five verification checks.
- **Credit facility** — needed to identify its credit limit, extended and available credit, and sub-facilities separately from a loan’s principal.
- **Borrower** — needed to identify who owes under the loan or facility.
- **Lender** — needed to identify who provides the credit, separately from who services it.

Does the agent need to identify or retrieve **each of these four separately** to answer those questions and perform the checks?

### Turn 9 — persona

Yes. The agent needs to identify the **loan** being checked, the **facility** when the agreement allows repeated draws, and the **borrower** and **lender** as distinct parties. A facility’s limit, credit extended, and available amount are not substitutes for a loan’s principal amount.

One qualification: the five verification actions take a loan as their target; they don’t all require a separate facility record. The facility is needed for the facility-specific questions you’ve recorded.

### Turn 10 — app-user

Yes. The agent needs to identify the **loan** being checked, the **facility** when the agreement allows repeated draws, and the **borrower** and **lender** as distinct parties. A facility’s limit, credit extended, and available amount are not substitutes for a loan’s principal amount.

One qualification: the five verification actions take a loan as their target; they don’t all require a separate facility record. The facility is needed for the facility-specific questions you’ve recorded.

### Turn 10 — app-tool

✓ Applied: 4 added, 0 updated.

### Turn 10 — app-assistant

I’ve added **Loan, CreditFacility, Borrower, and Lender** as separate kinds of things. The five verification actions target a Loan; CreditFacility is needed for the facility-specific questions, not automatically as an input to those actions.

The next group comes from your servicing and support checks. Does the agent need to identify or retrieve each of these separately: **Servicer** (who collects for the lender), **Collateral** (what is pledged), **SecurityAgreement** (what covers pledged collateral), and **Guarantee** (support that is not a collateral link)?

### Turn 10 — persona

Yes for the first three, but not **guarantee** as a separate kind of record in what we’ve established here.

The agent needs to identify the **servicer** responsible for collecting payments, the **collateral** linked to a secured loan, and the **security agreement** that grants an interest in that collateral. Keep the last two distinct: a collateral link answers *what is pledged*; the security agreement answers *what secures that collateral legally*.

We can identify a **guaranteed loan** as a kind of secured loan, but we haven’t established a separate guarantee record for the agent to retrieve. I wouldn’t add one on that basis.

### Turn 11 — app-user

Yes for the first three, but not **guarantee** as a separate kind of record in what we’ve established here.

The agent needs to identify the **servicer** responsible for collecting payments, the **collateral** linked to a secured loan, and the **security agreement** that grants an interest in that collateral. Keep the last two distinct: a collateral link answers *what is pledged*; the security agreement answers *what secures that collateral legally*.

We can identify a **guaranteed loan** as a kind of secured loan, but we haven’t established a separate guarantee record for the agent to retrieve. I wouldn’t add one on that basis.

### Turn 11 — app-tool

✓ Applied: 3 added, 0 updated.

### Turn 11 — app-assistant

I’ve added **Servicer, Collateral, and SecurityAgreement**, but not a separate Guarantee record. A guaranteed loan can still be identified without assuming there is a guarantee record to retrieve.

For the payment checks, does the agent need to retrieve these as separate things: a **PaymentHistory**, its individual **PaymentTransactions**, and the applicable **PrincipalRepaymentSchedule**, **InterestPaymentSchedule**, and **AmortizationSchedule**? In particular, are those three schedules distinct records in your work, or different labels for the same schedule?

### Turn 11 — persona

Yes. The **payment history** is the record of payments made, and **individual payment transactions** are the actual entries that make it up. Neither is a schedule of what was due.

The three schedules are distinct, not different labels for one record: one tracks changes in the debt balance over time, one sets out when principal is due, and one sets out when interest is due. I’d phrase your “principal repayment schedule” a little differently to keep it clear that this is a **schedule of due payments**, not the principal repayment *terms* that govern them. A loan can also have a broader loan payment schedule.

### Turn 12 — app-user

Yes. The **payment history** is the record of payments made, and **individual payment transactions** are the actual entries that make it up. Neither is a schedule of what was due.

The three schedules are distinct, not different labels for one record: one tracks changes in the debt balance over time, one sets out when principal is due, and one sets out when interest is due. I’d phrase your “principal repayment schedule” a little differently to keep it clear that this is a **schedule of due payments**, not the principal repayment *terms* that govern them. A loan can also have a broader loan payment schedule.

### Turn 12 — app-tool

✓ Applied: 5 added, 0 updated.

### Turn 12 — app-assistant

I’ve added the payment history, individual transactions, and the three distinct schedules. I’ve called the due-principal record **PrincipalPaymentSchedule** to distinguish it from the terms governing repayment.

You also mentioned a broader **loan payment schedule**. Does the agent need to retrieve that separately to answer “which payment schedules are on file” or to perform one of the five checks, or is it a general name for the schedules we’ve already distinguished?

### Turn 12 — persona

Yes, retrieve a **loan payment schedule** separately when answering which schedules are on file. It’s the regular or explicit schedule tied to the loan’s account, not just an umbrella name for the amortization, principal-payment, and interest-payment schedules.

None of the five verification checks specifically requires that broader schedule. They check other links or records, so I wouldn’t make it a precondition for those actions.

### Turn 13 — app-user

Yes, retrieve a **loan payment schedule** separately when answering which schedules are on file. It’s the regular or explicit schedule tied to the loan’s account, not just an umbrella name for the amortization, principal-payment, and interest-payment schedules.

None of the five verification checks specifically requires that broader schedule. They check other links or records, so I wouldn’t make it a precondition for those actions.

### Turn 13 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 13 — app-assistant

**LoanPaymentSchedule** is now separate from the three more specific schedules. It supports the question about schedules on file, but is not a precondition for the five checks.

For the rate and terms questions, does the agent need to retrieve each of these separately: **InterestRate** (fixed or variable), **InterestRateResetSchedule** (for a variable rate), **PrincipalRepaymentTerms**, **InterestPaymentTerms**, and **PrepaymentTerms**? Or are any of the terms merely values on the loan rather than separately linked records?

### Turn 13 — persona

The agent needs the **rate**, **reset schedule**, and three sets of **terms**, but I wouldn’t make “interest rate” a single record with fixed and variable as mere values. A loan can have a **fixed interest rate** or a **variable interest rate**; the variable-rate setup check looks for the latter together with an **interest rate reset schedule**.

**Principal repayment terms**, **interest payment terms**, and **prepayment terms** are distinct from values on the loan. The first govern payment of principal, the second govern payment of interest, and prepayment terms cover repayment before maturity, including any recorded penalty period. Don’t merge those terms with the payment schedules: terms say what the agreement requires; schedules set out the applicable dates.

### Turn 14 — app-user

The agent needs the **rate**, **reset schedule**, and three sets of **terms**, but I wouldn’t make “interest rate” a single record with fixed and variable as mere values. A loan can have a **fixed interest rate** or a **variable interest rate**; the variable-rate setup check looks for the latter together with an **interest rate reset schedule**.

**Principal repayment terms**, **interest payment terms**, and **prepayment terms** are distinct from values on the loan. The first govern payment of principal, the second govern payment of interest, and prepayment terms cover repayment before maturity, including any recorded penalty period. Don’t merge those terms with the payment schedules: terms say what the agreement requires; schedules set out the applicable dates.

### Turn 14 — app-tool

✓ Applied: 6 added, 0 updated.

### Turn 14 — app-assistant

I’ve kept **FixedInterestRate** and **VariableInterestRate** separate, with the reset schedule relevant to the variable rate. I’ve also kept the three sets of terms distinct from schedules.

For the balance and collateral questions, does the agent need to identify or retrieve **OutstandingPrincipal**, **AccruedInterest** (including its recorded as-of date), **CollateralValuation** (a dated value), and **SubFacility** as separate records? Or are some of these values on an existing loan, collateral, or facility record?

### Turn 14 — persona

The agent needs separate records for **principal**, **accrued interest**, the **dated collateral value**, and any **sub-facility**. I’d put “outstanding principal” a little differently as a record name: it’s the outstanding amount **on the principal record**, rather than a separate kind of principal. The loan also carries a principal amount and a loan balance; those shouldn’t be silently treated as the same field.

Accrued interest has its own amount and as-of date. A collateral value is recorded against the collateral with its value and as-of date, so a later appraisal needn’t overwrite what an earlier valuation said. A sub-facility is a portion of a credit facility to track separately, not just an amount on the parent facility.

### Turn 15 — app-user

The agent needs separate records for **principal**, **accrued interest**, the **dated collateral value**, and any **sub-facility**. I’d put “outstanding principal” a little differently as a record name: it’s the outstanding amount **on the principal record**, rather than a separate kind of principal. The loan also carries a principal amount and a loan balance; those shouldn’t be silently treated as the same field.

Accrued interest has its own amount and as-of date. A collateral value is recorded against the collateral with its value and as-of date, so a later appraisal needn’t overwrite what an earlier valuation said. A sub-facility is a portion of a credit facility to track separately, not just an amount on the parent facility.

### Turn 15 — app-tool

✓ Applied: 4 added, 0 updated.

### Turn 15 — app-assistant

I’ve added **Principal**, **AccruedInterest**, **CollateralValuation**, and **SubFacility** as separate records. The outstanding amount belongs on Principal; the loan’s principal amount and loan balance remain distinct. AccruedInterest and CollateralValuation each carry their own dated value.

For the remaining facility and collateral measures, does the agent retrieve **credit extended, credit available, loan-to-value, or combined loan-to-value** as separate records, or read them as values on the facility or loan?

### Turn 15 — persona

**Credit extended** and **credit available** are amounts on the credit facility, not separate records. Keep them distinct from each other and from the facility’s credit limit.

For a **collateralized loan**, **loan-to-value** and **combined loan-to-value** are two distinct ratio records associated with that loan. The first compares that loan’s principal with the appraised collateral value; the combined measure takes account of the total debt secured by the asset or assets. Neither is simply the collateral’s appraised value.

### Turn 16 — app-user

**Credit extended** and **credit available** are amounts on the credit facility, not separate records. Keep them distinct from each other and from the facility’s credit limit.

For a **collateralized loan**, **loan-to-value** and **combined loan-to-value** are two distinct ratio records associated with that loan. The first compares that loan’s principal with the appraised collateral value; the combined measure takes account of the total debt secured by the asset or assets. Neither is simply the collateral’s appraised value.

### Turn 16 — app-tool

✓ Applied: 2 added, 0 updated.

### Turn 16 — app-assistant

I’ve added separate **LoanToValueRatio** and **CombinedLoanToValueRatio** records. Credit limit, credit extended, and credit available stay as distinct values on CreditFacility; I haven’t added them as separate records.

For the remaining term features—**rate cap, first-rate-change, interest-only, negative amortization, balloon payment, and prepayment-penalty period**—does the agent need to retrieve any as a separate record, or are they details of the rate or terms already identified?

### Turn 16 — persona

For these checks, they are recorded details, not six more records to retrieve:

- The **rate cap**, **first-rate-change term**, **interest-only flag**, **negative-amortization flag**, and **balloon-payment flag** are details on the loan. The first-rate-change term is recorded in months.
- The **prepayment-penalty period** is recorded in months in the prepayment terms, not on the rate.

Negative amortization is also a way to describe how a loan amortizes—payments do not cover the interest due—but the feature check reads the loan’s recorded flag.

### Turn 17 — app-user

For these checks, they are recorded details, not six more records to retrieve:

- The **rate cap**, **first-rate-change term**, **interest-only flag**, **negative-amortization flag**, and **balloon-payment flag** are details on the loan. The first-rate-change term is recorded in months.
- The **prepayment-penalty period** is recorded in months in the prepayment terms, not on the rate.

Negative amortization is also a way to describe how a loan amortizes—payments do not cover the interest due—but the feature check reads the loan’s recorded flag.

### Turn 17 — app-assistant

That completes the class candidates from the questions so far. I’ve kept those six features as details on Loan or PrepaymentTerms, rather than adding six records. The loan’s recorded negative-amortization flag is what the feature check reads.

The class set now distinguishes parties, loan and facility records, terms from schedules, payment history from transactions, and collateral from its dated valuations and ratios. Have we got the **kinds of records** right before we connect them, or is one of those distinctions incorrect?

### Turn 17 — persona

The distinctions you’ve made are right. I wouldn’t merge the terms with the schedules, the payment history with its transactions, or the collateral value with the collateral itself.

Before connecting them, I’d add a few kinds of records we’ve relied on but haven’t named separately: **interest** (the obligation, distinct from accrued-but-unpaid interest), the **day-count convention** used by interest payment terms, and a borrower’s **borrowing-capacity assessment**. A **credit agreement** is also worth keeping distinct from a credit facility: the facility is an arrangement that permits repeated draws.

That’s not a reason to undo any of the distinctions you’ve recorded; it just leaves those records to account for as we build the connections.

### Turn 18 — app-user

The distinctions you’ve made are right. I wouldn’t merge the terms with the schedules, the payment history with its transactions, or the collateral value with the collateral itself.

Before connecting them, I’d add a few kinds of records we’ve relied on but haven’t named separately: **interest** (the obligation, distinct from accrued-but-unpaid interest), the **day-count convention** used by interest payment terms, and a borrower’s **borrowing-capacity assessment**. A **credit agreement** is also worth keeping distinct from a credit facility: the facility is an arrangement that permits repeated draws.

That’s not a reason to undo any of the distinctions you’ve recorded; it just leaves those records to account for as we build the connections.

### Turn 18 — app-assistant

Those may be separate records, but I need to check their role against the questions and actions we agreed before adding them. **Interest** may help with the interest-payment checks, and **CreditAgreement** may identify where the agreed dates and terms come from. I don’t yet have a confirmed question or action that needs the day-count convention or borrowing-capacity assessment.

For each of those four, which agreed question or verification action requires the agent to identify, retrieve, or connect that record separately—and what would it use the record to establish?

### Turn 18 — persona

That’s a fair test. I wouldn’t add all four on the strength of the agreed checks alone.

- **Interest:** Yes. For “what terms govern interest payments?”, the agent needs to distinguish the loan’s interest obligation from accrued-but-unpaid interest. The interest payment terms govern payment of that obligation. The loan-readiness check also verifies that the applicable interest terms are present for an interest-bearing loan.
- **Credit agreement:** Useful for the hand-off questions about the borrower, lender, agreed initial exchange date, and maturity date **when the subject is the agreement**. A credit facility is a particular kind of credit agreement. But the five verification actions target a loan; they do not require a separate credit-agreement record as an input.
- **Day-count convention:** It tells us the accrual basis specified by the interest payment terms. None of the five checks requires the agent to verify it, and our agreed questions have not yet asked *how interest accrual is calculated*. Add it if that is a question we want the agent to answer, not as a mandatory hand-off check by inference.
- **Borrowing-capacity assessment:** It records the amount a lender assesses a borrower can repay. None of the five checks retrieves it, and it is not the facility’s available amount. We would need an explicit question about the borrower’s assessed capacity—or a separately defined credit-extension decision—before treating it as required for this scope.

So I’d keep **interest** and **credit agreement** for the questions already stated, and mark the other two as potential additions pending a question that uses them.

### Turn 19 — app-user

That’s a fair test. I wouldn’t add all four on the strength of the agreed checks alone.

- **Interest:** Yes. For “what terms govern interest payments?”, the agent needs to distinguish the loan’s interest obligation from accrued-but-unpaid interest. The interest payment terms govern payment of that obligation. The loan-readiness check also verifies that the applicable interest terms are present for an interest-bearing loan.
- **Credit agreement:** Useful for the hand-off questions about the borrower, lender, agreed initial exchange date, and maturity date **when the subject is the agreement**. A credit facility is a particular kind of credit agreement. But the five verification actions target a loan; they do not require a separate credit-agreement record as an input.
- **Day-count convention:** It tells us the accrual basis specified by the interest payment terms. None of the five checks requires the agent to verify it, and our agreed questions have not yet asked *how interest accrual is calculated*. Add it if that is a question we want the agent to answer, not as a mandatory hand-off check by inference.
- **Borrowing-capacity assessment:** It records the amount a lender assesses a borrower can repay. None of the five checks retrieves it, and it is not the facility’s available amount. We would need an explicit question about the borrower’s assessed capacity—or a separately defined credit-extension decision—before treating it as required for this scope.

So I’d keep **interest** and **credit agreement** for the questions already stated, and mark the other two as potential additions pending a question that uses them.

### Turn 19 — app-tool

✓ Applied: 2 added, 0 updated.

### Turn 19 — app-assistant

I’ve added **Interest** and **CreditAgreement**. The day-count convention and borrowing-capacity assessment remain outside the current model unless a question or action calls for them. That leaves the class set aligned with the agreed checks, without changing the earlier distinctions.

Before recording connections, one clarification: you described a credit facility as a kind of credit agreement. Does the agent also need a **separate, operational link** from a facility record to an agreement record—for example, to retrieve the agreed dates—or is that only another way of classifying the same record?

### Turn 19 — persona

It’s a way of classifying the **same arrangement**, not a separate link to another agreement record. A credit facility is a credit agreement that permits repeated draws. When the facility is the agreement being checked, its agreed dates are agreement details; I wouldn’t require the agent to find a second record just to retrieve them.

### Turn 20 — app-user

It’s a way of classifying the **same arrangement**, not a separate link to another agreement record. A credit facility is a credit agreement that permits repeated draws. When the facility is the agreement being checked, its agreed dates are agreement details; I wouldn’t require the agent to find a second record just to retrieve them.

### Turn 20 — app-assistant

Understood. I won’t add a facility-to-agreement link: when the facility is the agreement, there is no second record to navigate to. I’ll keep the agreed dates on the arrangement being checked.

Starting the relationship pass: for the borrower and lender questions, how does the agent get from a **Loan** to its **Borrower** and **Lender**, and from a **CreditFacility** to those parties? Are the parties recorded directly on each arrangement, or reached through another record?

### Turn 20 — persona

The parties are recorded directly against each arrangement. From a **loan**, the agent follows its borrower link to the party that owes the debt and its lender link to the party that financed it. From a **credit facility**, it follows separate borrower and lender links to the party allowed to draw and the party providing the facility.

It doesn’t have to go through a second agreement record to find them. The same direct party links apply when the subject is a credit agreement more generally.

### Turn 21 — app-user

The parties are recorded directly against each arrangement. From a **loan**, the agent follows its borrower link to the party that owes the debt and its lender link to the party that financed it. From a **credit facility**, it follows separate borrower and lender links to the party allowed to draw and the party providing the facility.

It doesn’t have to go through a second agreement record to find them. The same direct party links apply when the subject is a credit agreement more generally.

### Turn 21 — app-tool

✓ Applied: 6 added, 0 updated.

### Turn 21 — app-assistant

I’ve recorded direct borrower and lender links from Loan, CreditFacility, and CreditAgreement. No second agreement record is needed to find those parties.

For servicing, how does the agent get from a **Loan** to the **Servicer** collecting its payments? Is the servicer recorded directly on the loan, only through its lender, or both?

### Turn 21 — persona

The loan is **serviced by** a servicer recorded directly against it. The agent should follow that loan-to-servicer connection, not assume the lender is also the servicer or look for the servicer only through the lender. The servicer collects principal and interest payments on the lender’s behalf.

### Turn 22 — app-user

The loan is **serviced by** a servicer recorded directly against it. The agent should follow that loan-to-servicer connection, not assume the lender is also the servicer or look for the servicer only through the lender. The servicer collects principal and interest payments on the lender’s behalf.

### Turn 22 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 22 — app-assistant

I’ve recorded **Loan → serviced by → Servicer** as a direct link. The lender remains a separate party; the agent must not infer that it services the loan.

For the secured-loan questions, what path takes the agent from a **Loan** to pledged **Collateral**, and then to the **SecurityAgreement** that covers it? Is the security agreement also linked directly to the loan, or is its connection through the collateral?

### Turn 22 — persona

For a **secured loan with pledged collateral**, the agent follows the loan’s **collateralized by** link to the collateral. To find the legal support, it then looks for a **security agreement that secures that collateral**.

I wouldn’t add a direct loan-to-security-agreement link on that basis. The recorded connection here is from the security agreement to the collateral. And for a guarantee-only secured loan, don’t assume this collateral path exists.

### Turn 23 — app-user

For a **secured loan with pledged collateral**, the agent follows the loan’s **collateralized by** link to the collateral. To find the legal support, it then looks for a **security agreement that secures that collateral**.

I wouldn’t add a direct loan-to-security-agreement link on that basis. The recorded connection here is from the security agreement to the collateral. And for a guarantee-only secured loan, don’t assume this collateral path exists.

### Turn 23 — app-tool

✓ Applied: 2 added, 0 updated.

### Turn 23 — app-assistant

I’ve recorded the collateral path as **Loan → Collateral ← SecurityAgreement**. I have not added a direct loan-to-security-agreement link, and a guarantee-only secured loan does not inherit this path.

For the valuation and ratio questions, how does the agent navigate from the **Loan** and its **Collateral** to a dated **CollateralValuation**, **LoanToValueRatio**, and **CombinedLoanToValueRatio**? Please distinguish any direct links from values reached through collateral.

### Turn 23 — persona

For a **collateralized loan**, the two ratios are linked **directly to that loan**: one loan-to-value ratio and, separately, a combined loan-to-value ratio. They are not values you reach by following the collateral record.

The **dated collateral value** goes the other way: follow the loan’s collateral link to the pledged collateral, then follow that collateral’s value records to the appraisal value and its as-of date. Those dates matter when deciding which value is relevant; don’t treat a ratio record as a substitute for the valuation.

### Turn 24 — app-user

For a **collateralized loan**, the two ratios are linked **directly to that loan**: one loan-to-value ratio and, separately, a combined loan-to-value ratio. They are not values you reach by following the collateral record.

The **dated collateral value** goes the other way: follow the loan’s collateral link to the pledged collateral, then follow that collateral’s value records to the appraisal value and its as-of date. Those dates matter when deciding which value is relevant; don’t treat a ratio record as a substitute for the valuation.

### Turn 24 — app-tool

✓ Applied: 3 added, 0 updated.

### Turn 24 — app-assistant

I’ve recorded both ratio records directly on the loan, while dated valuations are reached through its collateral. They remain separate facts.

For the rate questions and variable-rate setup check, how does the agent reach a loan’s **FixedInterestRate** or **VariableInterestRate**, and then the **InterestRateResetSchedule**? Is the reset schedule linked directly to the loan, to the variable rate, or both?

### Turn 24 — persona

The loan has a direct link to whichever rate applies: a **fixed interest rate** or a **variable interest rate**. For the variable-rate setup check, the agent follows a **separate direct link from the loan to its interest rate reset schedule**. It doesn’t have to navigate through the variable-rate record to reach the schedule.

The check confirms both links are present. It doesn’t require a rate cap or first-rate-change term unless those features apply.

### Turn 25 — app-user

The loan has a direct link to whichever rate applies: a **fixed interest rate** or a **variable interest rate**. For the variable-rate setup check, the agent follows a **separate direct link from the loan to its interest rate reset schedule**. It doesn’t have to navigate through the variable-rate record to reach the schedule.

The check confirms both links are present. It doesn’t require a rate cap or first-rate-change term unless those features apply.

### Turn 25 — app-tool

✓ Applied: 3 added, 0 updated.

### Turn 25 — app-assistant

I’ve recorded direct links from Loan to the applicable rate and, separately, to its reset schedule. The variable-rate check will verify both links; optional rate features are not prerequisites.

For principal and interest obligations, what path connects a **Loan** to **Principal** and **Interest**, and from each obligation to its governing **PrincipalRepaymentTerms** or **InterestPaymentTerms**? Does the loan also link directly to either set of terms for the setup check?

### Turn 25 — persona

The loan links directly to its **principal** and **interest** obligations. The governing terms point toward those obligations: **principal repayment terms govern payment of the principal**, and **interest payment terms govern payment of the interest**. So the agent starts at the loan, finds the obligation, then finds the terms that govern it.

I wouldn’t add a direct loan-to-terms link for the setup check. For an interest-bearing loan, that check verifies the applicable rate and that interest payment terms govern its interest obligation.

### Turn 26 — app-user

The loan links directly to its **principal** and **interest** obligations. The governing terms point toward those obligations: **principal repayment terms govern payment of the principal**, and **interest payment terms govern payment of the interest**. So the agent starts at the loan, finds the obligation, then finds the terms that govern it.

I wouldn’t add a direct loan-to-terms link for the setup check. For an interest-bearing loan, that check verifies the applicable rate and that interest payment terms govern its interest obligation.

### Turn 26 — app-tool

✓ Applied: 4 added, 0 updated.

### Turn 26 — app-assistant

I’ve recorded the loan-to-obligation links and the terms-to-obligation links. The setup check can follow **Loan → Interest ← InterestPaymentTerms**; it does not need a direct loan-to-terms link.

How does the agent reach each of the four schedules—**LoanPaymentSchedule, PrincipalPaymentSchedule, InterestPaymentSchedule, and AmortizationSchedule**—from a loan? Are they each linked directly to the loan, or are any reached through its obligations or terms?

### Turn 26 — persona

Each is linked **directly to the loan** as its own schedule: the broader loan payment schedule, the principal payment schedule, the interest payment schedule, and the amortization schedule. The agent does not have to go through principal, interest, or their governing terms to retrieve them.

Keep the schedules distinct even when their dates line up. The terms govern what is owed; the schedules set out the relevant payment timing or balance changes.

### Turn 27 — app-user

Each is linked **directly to the loan** as its own schedule: the broader loan payment schedule, the principal payment schedule, the interest payment schedule, and the amortization schedule. The agent does not have to go through principal, interest, or their governing terms to retrieve them.

Keep the schedules distinct even when their dates line up. The terms govern what is owed; the schedules set out the relevant payment timing or balance changes.

### Turn 27 — app-tool

✓ Applied: 4 added, 0 updated.

### Turn 27 — app-assistant

I’ve recorded four separate direct schedule links from Loan. The schedules do not replace the governing terms, even if their dates coincide.

For the payment-record completeness check, how does the agent navigate from **Loan** to **PaymentHistory** and its **PaymentTransactions**? Are transactions linked only through the history, or does the loan also have direct links to individual transactions?

### Turn 27 — persona

The loan links to its **payment history**, and that history contains the **individual payment transactions**. That’s the path the completeness check follows: loan → payment history → individual payments.

I wouldn’t add a direct loan-to-transaction link from this. To confirm the check, the agent needs both the history and entries within it; merely having an empty history record isn’t enough.

### Turn 28 — app-user

The loan links to its **payment history**, and that history contains the **individual payment transactions**. That’s the path the completeness check follows: loan → payment history → individual payments.

I wouldn’t add a direct loan-to-transaction link from this. To confirm the check, the agent needs both the history and entries within it; merely having an empty history record isn’t enough.

### Turn 28 — app-tool

✓ Applied: 2 added, 0 updated.

### Turn 28 — app-assistant

I’ve recorded **Loan → PaymentHistory → PaymentTransaction**. There is no direct loan-to-transaction link, and an empty history cannot pass the completeness check.

For the remaining servicing records, how does the agent reach **PrepaymentTerms** and **AccruedInterest** from a loan? Are either linked through its Interest obligation, or are they direct loan links?

### Turn 28 — persona

I can’t confirm either proposed path from the connections we’ve established. **Prepayment terms** are a particular kind of principal repayment terms, and they hold the penalty period, but we haven’t established a direct loan link or a link through principal for retrieving them. **Accrued interest** is a separate amount with an as-of date; we haven’t established a direct loan link or a path through the interest obligation to it.

So I’d mark both navigation paths as **open**, rather than add links by inference. That matters for the prepayment review: we know what it must verify, but still need to establish how it retrieves the applicable terms for the loan.

### Turn 29 — app-user

I can’t confirm either proposed path from the connections we’ve established. **Prepayment terms** are a particular kind of principal repayment terms, and they hold the penalty period, but we haven’t established a direct loan link or a link through principal for retrieving them. **Accrued interest** is a separate amount with an as-of date; we haven’t established a direct loan link or a path through the interest obligation to it.

So I’d mark both navigation paths as **open**, rather than add links by inference. That matters for the prepayment review: we know what it must verify, but still need to establish how it retrieves the applicable terms for the loan.

### Turn 29 — app-assistant

I’ve left both paths open; no link has been added by inference. That means the prepayment review’s retrieval path is still incomplete.

Starting with **PrepaymentTerms**: when you review a loan’s penalty period, how do you find the applicable prepayment terms in practice? Is there a recorded connection through its Principal obligation, or another operational connection we haven’t named?

### Turn 29 — persona

I can’t confirm a recorded path from the loan through its principal obligation to the prepayment terms, or a different direct link. **Prepayment terms are a kind of principal repayment terms**, and the penalty period is recorded there in months. That tells us what to inspect, but not how to retrieve the applicable terms from a particular loan.

So the retrieval path remains open. I wouldn’t mark the prepayment review executable for a given loan until we can identify its applicable terms and verify the recorded period.

### Turn 30 — app-user

I can’t confirm a recorded path from the loan through its principal obligation to the prepayment terms, or a different direct link. **Prepayment terms are a kind of principal repayment terms**, and the penalty period is recorded there in months. That tells us what to inspect, but not how to retrieve the applicable terms from a particular loan.

So the retrieval path remains open. I wouldn’t mark the prepayment review executable for a given loan until we can identify its applicable terms and verify the recorded period.

### Turn 30 — app-assistant

Agreed. The prepayment review remains **not executable for a particular loan** until its applicable PrepaymentTerms can be found. I won’t use “a kind of principal repayment terms” as a substitute for a recorded connection.

For **AccruedInterest**, is there a recorded way to find the amount and its as-of date for a particular loan, or should that retrieval path remain open too?

### Turn 30 — persona

That retrieval path should remain open too. We know an **accrued interest** record carries an amount and an as-of date, and that it is distinct from principal and from interest already paid. But I can’t confirm a recorded link from a particular loan—or through its interest obligation—to that record.

So the agent can describe what an accrued-interest record means, but it cannot reliably answer “what is this loan’s accrued interest as of this date?” from the connections we’ve established.

### Turn 31 — app-user

That retrieval path should remain open too. We know an **accrued interest** record carries an amount and an as-of date, and that it is distinct from principal and from interest already paid. But I can’t confirm a recorded link from a particular loan—or through its interest obligation—to that record.

So the agent can describe what an accrued-interest record means, but it cannot reliably answer “what is this loan’s accrued interest as of this date?” from the connections we’ve established.

### Turn 31 — app-assistant

I’ll leave the AccruedInterest path open too. We know what the record contains, but the model cannot yet identify which accrued-interest record belongs to a particular loan. The question about that loan’s accrued interest remains only partly covered.

For facility tracking, how does the agent get from a **CreditFacility** to its **SubFacilities**? Is each sub-facility recorded directly under its parent facility?

### Turn 31 — persona

Yes. A credit facility links directly to its sub-facilities; each one is a portion of that parent facility. The agent can follow that link to identify which portions need separate tracking, while reading credit extended and available credit from the parent facility’s recorded amounts.

### Turn 32 — app-user

Yes. A credit facility links directly to its sub-facilities; each one is a portion of that parent facility. The agent can follow that link to identify which portions need separate tracking, while reading credit extended and available credit from the parent facility’s recorded amounts.

### Turn 32 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 32 — app-tool

🔍 Checked the current ontology state.

### Turn 32 — app-assistant

I’ve recorded **CreditFacility → SubFacility**. A canvas check shows two confirmed record types still have no established connection: PrepaymentTerms and AccruedInterest. Their loan-specific retrieval paths remain open, as you said; I won’t invent links for them.

There’s another path to check for the question “Are the repayment terms governing those schedules on file?” We can find the terms and schedules separately from a loan. How, in your records, does the agent determine **which terms govern a particular principal or interest payment schedule**—is that connection recorded, or is it another open comparison?

### Turn 32 — persona

That connection is **not recorded directly**. For a loan, the agent can find the principal or interest payment schedule, then separately find the terms governing the loan’s principal or interest obligation. That lets it answer which schedules and governing terms are on file.

It does **not** establish that a particular set of terms governs a particular schedule, or that the schedule’s dates match those terms. I’d leave that schedule-to-terms comparison open rather than infer a link.

### Turn 33 — app-user

That connection is **not recorded directly**. For a loan, the agent can find the principal or interest payment schedule, then separately find the terms governing the loan’s principal or interest obligation. That lets it answer which schedules and governing terms are on file.

It does **not** establish that a particular set of terms governs a particular schedule, or that the schedule’s dates match those terms. I’d leave that schedule-to-terms comparison open rather than infer a link.

### Turn 33 — app-assistant

Understood. The agent can find the schedules and the terms for the same loan through separate paths, but it cannot yet claim that particular terms govern a particular schedule or that the dates agree. I’ll leave that comparison open.

For the agreed initial funding or exchange date and maturity date, when the subject is a **Loan**, are those dates recorded on the loan itself, or does the agent need to reach a separate **CreditAgreement** record?

### Turn 33 — persona

They’re recorded **on the loan itself**: its initial exchange date and maturity date. The agent does not need to reach a separate credit-agreement record to answer those date questions for a loan.

### Turn 34 — app-user

They’re recorded **on the loan itself**: its initial exchange date and maturity date. The agent does not need to reach a separate credit-agreement record to answer those date questions for a loan.

### Turn 34 — app-assistant

For a **Loan**, I’ll treat the initial exchange date and maturity date as values on the loan itself, not as a reason to add a Loan-to-CreditAgreement link.

One servicing connection remains to check: beyond their separate links to the loan, is it recorded that a particular **Servicer collects payments on behalf of a particular Lender**, or is that relationship understood only in the context of the loan?

### Turn 34 — persona

It’s understood **in the context of the loan**. The loan identifies its lender and, separately, the servicer responsible for it; the servicer’s role is to collect principal and interest payments on the lender’s behalf.

I wouldn’t add a separate servicer-to-lender link on that basis. A servicer could handle loans for different lenders, so the particular lender in question comes from the loan being serviced.

### Turn 35 — app-user

It’s understood **in the context of the loan**. The loan identifies its lender and, separately, the servicer responsible for it; the servicer’s role is to collect principal and interest payments on the lender’s behalf.

I wouldn’t add a separate servicer-to-lender link on that basis. A servicer could handle loans for different lenders, so the particular lender in question comes from the loan being serviced.

### Turn 35 — app-assistant

I won’t add a Servicer-to-Lender link. For a particular loan, the agent identifies each party through that loan’s two direct links.

The relationship pass has also left two paths explicitly open: finding a loan’s applicable PrepaymentTerms and finding its AccruedInterest record. The schedules and governing terms can be found separately, but their agreement cannot yet be checked.

For the question **“Is the loan or facility secured?”**, how is secured status recorded for each arrangement, including one supported by a guarantee rather than pledged collateral?

### Turn 35 — persona

For a **loan**, secured status is a distinction in the kind of loan recorded: a secured loan may be **collateralized** or **guaranteed**, while an unsecured loan is distinct. A guarantee-backed loan can therefore be identified as guaranteed without assuming it has pledged collateral or a separate guarantee record.

For a **credit facility**, we haven’t established an equivalent secured-status designation or a facility-to-collateral link. A committed sub-facility may be associated with specific collateral, but that doesn’t establish whether the parent facility is secured. I’d leave the facility half of that question open rather than infer its status from a loan or sub-facility.

### Turn 36 — app-user

For a **loan**, secured status is a distinction in the kind of loan recorded: a secured loan may be **collateralized** or **guaranteed**, while an unsecured loan is distinct. A guarantee-backed loan can therefore be identified as guaranteed without assuming it has pledged collateral or a separate guarantee record.

For a **credit facility**, we haven’t established an equivalent secured-status designation or a facility-to-collateral link. A committed sub-facility may be associated with specific collateral, but that doesn’t establish whether the parent facility is secured. I’d leave the facility half of that question open rather than infer its status from a loan or sub-facility.

### Turn 36 — app-assistant

For a loan, I’ve captured the distinction you described: **secured** loans may be collateralized or guaranteed, while **unsecured** loans are distinct. That does not make a guarantee-only loan pass the collateral-link check. I have not inferred a secured status for a parent facility from a sub-facility’s collateral.

The relationship pass is still incomplete: there is no confirmed path from a particular loan to its PrepaymentTerms or AccruedInterest, and no established way to determine a facility’s secured status. Those gaps remain open.

One connection you mentioned may matter for separate sub-facility tracking: does the agent need to follow a recorded link from a **SubFacility** to its specific **Collateral** to answer an agreed question or perform one of the five checks, or was that context rather than a required navigation path?

### Turn 36 — persona

That was **context**, not a required navigation path for the questions and checks we agreed. A committed sub-facility may be associated with specific collateral, but we haven’t established a recorded sub-facility-to-collateral link.

For the facility-tracking question, the agent needs the parent facility’s link to its sub-facilities. None of the five loan-focused checks requires navigating from a sub-facility to collateral. I’d leave that extra connection out.

### Turn 37 — app-user

That was **context**, not a required navigation path for the questions and checks we agreed. A committed sub-facility may be associated with specific collateral, but we haven’t established a recorded sub-facility-to-collateral link.

For the facility-tracking question, the agent needs the parent facility’s link to its sub-facilities. None of the five loan-focused checks requires navigating from a sub-facility to collateral. I’d leave that extra connection out.

### Turn 37 — app-assistant

I’ll leave out the SubFacility-to-Collateral link. The confirmed facility path is **CreditFacility → SubFacility**; the possible collateral association is not part of the agreed checks.

The relationship pass still has known gaps, which I’m not treating as resolved. To narrow the facility-status gap: is a facility’s secured or unsecured status recorded **on the facility itself**, or is there no confirmed source for that status in this scope?

### Turn 37 — persona

There’s **no confirmed source for that status** in this scope. We have a secured-versus-unsecured distinction for loans, but not a secured-status field or equivalent distinction established for credit facilities. I wouldn’t put one on the facility or derive it from a sub-facility.

### Turn 38 — app-user

There’s **no confirmed source for that status** in this scope. We have a secured-versus-unsecured distinction for loans, but not a secured-status field or equivalent distinction established for credit facilities. I wouldn’t put one on the facility or derive it from a sub-facility.

### Turn 38 — app-assistant

There is no confirmed way to answer the **facility** half of “Is the loan or facility secured?” I won’t add a facility status field or infer one from a sub-facility.

Should we revise that recorded question to ask **only whether a loan is secured**, or keep the facility portion as an explicit unmet requirement?

### Turn 38 — persona

For the current scope, revise it to **“Is the loan secured?”** That is answerable from the recorded loan distinction.

Keep **“Is the facility secured?”** as an explicit unmet requirement if the business still needs that answer. We have no confirmed facility status or retrieval path, so the agent should not answer it by inference.

### Turn 39 — app-user

For the current scope, revise it to **“Is the loan secured?”** That is answerable from the recorded loan distinction.

Keep **“Is the facility secured?”** as an explicit unmet requirement if the business still needs that answer. We have no confirmed facility status or retrieval path, so the agent should not answer it by inference.

### Turn 39 — app-tool

✓ Applied: 1 added, 1 updated.

### Turn 39 — app-assistant

I’ve revised the recorded question to **“Is the loan secured?”** and added **“Is the facility secured?”** as a separate, unmet requirement. The agent must not infer the facility answer.

The relationship pass still cannot close: neither PrepaymentTerms nor AccruedInterest has a confirmed path to a particular loan. For **PrepaymentTerms**, what record or lookup does your team actually use to find the terms applicable to a given loan? If that isn’t known in this scope, please say so; I’ll keep the prepayment review explicitly incomplete.

### Turn 39 — persona

That lookup isn’t established in this scope. The penalty period is recorded in the prepayment terms, but I can’t identify a confirmed path from a particular loan to its applicable terms.

Keep the prepayment review **incomplete for a given loan**. We know what it must verify once the terms are found; we don’t yet know how the agent finds the right terms.

### Turn 40 — app-user

That lookup isn’t established in this scope. The penalty period is recorded in the prepayment terms, but I can’t identify a confirmed path from a particular loan to its applicable terms.

Keep the prepayment review **incomplete for a given loan**. We know what it must verify once the terms are found; we don’t yet know how the agent finds the right terms.

### Turn 40 — app-assistant

The lookup for a loan’s PrepaymentTerms is not established, so the prepayment review remains **incomplete for a given loan**. The AccruedInterest retrieval path and facility secured-status source are also still open. I won’t invent connections to make those checks appear complete.

I can capture a separate, known distinction without closing those gaps: for a **Loan**, what recorded value tells the agent whether it is unsecured, collateralized, or guaranteed? Does the record allow both collateralized and guaranteed to apply to the same loan?

### Turn 40 — persona

It isn’t a single status value on the loan. The agent identifies whether the loan is recorded as **unsecured**, **collateralized**, or **guaranteed**; collateralized and guaranteed are both ways a loan can be secured.

I don’t have a rule here making collateralized and guaranteed mutually exclusive, so I wouldn’t force the agent to choose just one. Nor would I infer either designation merely from a missing collateral link.

### Turn 41 — app-user

It isn’t a single status value on the loan. The agent identifies whether the loan is recorded as **unsecured**, **collateralized**, or **guaranteed**; collateralized and guaranteed are both ways a loan can be secured.

I don’t have a rule here making collateralized and guaranteed mutually exclusive, so I wouldn’t force the agent to choose just one. Nor would I infer either designation merely from a missing collateral link.

### Turn 41 — app-assistant

I won’t model those as one mutually exclusive status. I’ve captured that **collateralized** and **guaranteed** may both apply, and that a missing collateral link does not establish either designation.

To represent the recorded distinction accurately, are **unsecured**, **collateralized**, and **guaranteed** three separately recorded yes/no indicators on the Loan, or are those designations recorded in another way?

### Turn 41 — persona

They’re **loan designations**, not three separate yes/no fields. A collateralized loan and a guaranteed loan are both kinds of secured loan; an unsecured loan is a different kind. The record may carry more than one applicable designation—we haven’t established a rule that collateralized and guaranteed exclude each other.

So I’d represent the applicable kinds of loan, rather than invent three flags or one mutually exclusive status value.

### Turn 42 — app-user

They’re **loan designations**, not three separate yes/no fields. A collateralized loan and a guaranteed loan are both kinds of secured loan; an unsecured loan is a different kind. The record may carry more than one applicable designation—we haven’t established a rule that collateralized and guaranteed exclude each other.

So I’d represent the applicable kinds of loan, rather than invent three flags or one mutually exclusive status value.

### Turn 42 — app-assistant

That rules out both three yes/no fields and one exclusive status. This model also cannot represent “kind of loan” as a subclass, so I won’t disguise the designation as a relationship.

When the agent checks a particular loan, **where does it read its applicable designations**? For example, is there a field on the loan that can hold more than one designation, or is the source not yet established?

### Turn 42 — persona

The source of those designations isn’t established here. We know the distinctions—secured, collateralized, guaranteed, and unsecured—but I can’t point to a loan field or lookup that holds them, including whether it can hold more than one.

If your model can’t represent kinds of loan directly, leave the operational source open. Don’t turn the designations into an invented multi-value field.

### Turn 43 — app-user

The source of those designations isn’t established here. We know the distinctions—secured, collateralized, guaranteed, and unsecured—but I can’t point to a loan field or lookup that holds them, including whether it can hold more than one.

If your model can’t represent kinds of loan directly, leave the operational source open. Don’t turn the designations into an invented multi-value field.

### Turn 43 — app-assistant

I’ll leave the source of the loan designations open. I have **not** added a field, a subclass-like relationship, or a rule that treats a missing collateral link as evidence of a designation. This means the agent cannot yet reliably answer whether a particular loan is secured.

The relationship pass remains incomplete for that reason and for the loan-specific PrepaymentTerms and AccruedInterest paths. **Who could confirm where the applicable designations for a particular loan are recorded?**

### Turn 43 — persona

I can’t name a confirmed owner or source for those designations in this scope. The next step is to ask whoever maintains the loan record how they identify a particular loan as secured, collateralized, guaranteed, or unsecured. Until that’s confirmed, I wouldn’t have the agent answer the secured-status question for a particular loan.

### Turn 44 — app-user

I can’t name a confirmed owner or source for those designations in this scope. The next step is to ask whoever maintains the loan record how they identify a particular loan as secured, collateralized, guaranteed, or unsecured. Until that’s confirmed, I wouldn’t have the agent answer the secured-status question for a particular loan.

### Turn 44 — app-assistant

Understood. The loan-designation source has no confirmed owner or lookup in this scope. I’ll leave the secured-status question for a particular loan **unanswered**, rather than infer it from collateral or invent a field. The relationship work also remains incomplete for finding a loan’s PrepaymentTerms and AccruedInterest.

One remaining connection to check before we can account for the hand-off questions: when the subject is a **Loan**, is there a recorded link to a **CreditFacility**, or are these separate subjects that the agent handles without navigating from one to the other?

### Turn 44 — persona

They’re **separate subjects** for these questions. I don’t have a confirmed loan-to-credit-facility link, so the agent should use the loan record for loan-specific answers and the facility record for facility-specific answers. It shouldn’t navigate between them by inference.

### Turn 45 — app-user

They’re **separate subjects** for these questions. I don’t have a confirmed loan-to-credit-facility link, so the agent should use the loan record for loan-specific answers and the facility record for facility-specific answers. It shouldn’t navigate between them by inference.

### Turn 45 — app-assistant

I won’t add a Loan-to-CreditFacility link. They remain separate subjects for these questions.

The connection pass has confirmed the navigable paths we discussed, but it remains incomplete for loan designations, loan-specific PrepaymentTerms and AccruedInterest, and facility secured status. I’ll keep those gaps visible while we capture fields that *are* known, rather than treat the missing paths as solved.

For **Loan**, you’ve distinguished its approved principal amount, loan balance, initial exchange date, and maturity date. Are all four recorded values on the loan itself, and does each have that meaning in your records?

### Turn 45 — persona

Yes. All four are recorded on the **loan**: its principal amount and loan balance are numeric amounts, and its initial exchange date and maturity date are dates.

I’d be careful with **“approved principal amount”**: the field records the loan’s principal amount, but it does not itself establish an approval decision. The loan balance is a separate amount, and neither should be silently substituted for the outstanding amount on the principal record.

### Turn 46 — app-user

Yes. All four are recorded on the **loan**: its principal amount and loan balance are numeric amounts, and its initial exchange date and maturity date are dates.

I’d be careful with **“approved principal amount”**: the field records the loan’s principal amount, but it does not itself establish an approval decision. The loan balance is a separate amount, and neither should be silently substituted for the outstanding amount on the principal record.

### Turn 46 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 46 — app-assistant

I’ve recorded those four Loan fields. **Principal amount, loan balance, and the outstanding amount on Principal remain distinct.** The principal-amount field alone does not establish that the amount was approved, so that part of the hand-off question remains open.

For **CreditFacility**, are credit limit, credit extended, and credit available three separate numeric fields on the facility record? What does each mean in your records?

### Turn 46 — persona

Yes—three separate numeric amounts on the **credit facility**:

- **Credit limit:** the agreed ceiling on credit under the facility.
- **Amount of credit extended:** how much credit has been extended under it.
- **Available amount:** the amount recorded as available to draw.

Don’t assume available amount can always be calculated by subtracting credit extended from the limit; use the recorded amount. And as with a loan’s principal amount, the limit field alone doesn’t prove an approval decision.

### Turn 47 — app-user

Yes—three separate numeric amounts on the **credit facility**:

- **Credit limit:** the agreed ceiling on credit under the facility.
- **Amount of credit extended:** how much credit has been extended under it.
- **Available amount:** the amount recorded as available to draw.

Don’t assume available amount can always be calculated by subtracting credit extended from the limit; use the recorded amount. And as with a loan’s principal amount, the limit field alone doesn’t prove an approval decision.

### Turn 47 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 47 — app-assistant

I’ve recorded the facility’s **credit limit, credit extended, and available amount** as separate fields. The agent will read the recorded available amount, not calculate it by subtraction; the limit alone does not prove approval.

For the agreed-date questions, are **initial exchange date** and **maturity date** also recorded directly on a CreditFacility and on a CreditAgreement when either is the agreement being checked?

### Turn 47 — persona

Yes. A **credit agreement** records its initial exchange date and maturity date. A **credit facility** is a kind of credit agreement, so when the facility is the agreement being checked, those dates are available as its agreement details—not through a link to a second agreement record.

### Turn 48 — app-user

Yes. A **credit agreement** records its initial exchange date and maturity date. A **credit facility** is a kind of credit agreement, so when the facility is the agreement being checked, those dates are available as its agreement details—not through a link to a second agreement record.

### Turn 48 — app-tool

✓ Applied: 0 added, 2 updated.

### Turn 48 — app-assistant

I’ve recorded the two agreed dates on CreditAgreement and CreditFacility, as well as on Loan. A facility does not need a link to a second agreement record to provide its dates.

For the feature checks, are **rate cap, first-rate-change term (in months), interest-only, negative-amortization, and balloon-payment** recorded directly on Loan? For each, what value does the agent read—for example, an amount, a number of months, or a yes/no value?

### Turn 48 — persona

Yes, they’re recorded directly on the **loan**:

- **Interest rate cap:** a numeric rate-cap value.
- **First-rate-change term:** a number of months.
- **Interest-only, negative amortization, and balloon payment:** separate yes/no values.

The agent reads each as recorded. A blank cap or first-change term does not, by itself, prove the loan is fixed-rate; it should use the applicable rate record for that.

### Turn 49 — app-user

Yes, they’re recorded directly on the **loan**:

- **Interest rate cap:** a numeric rate-cap value.
- **First-rate-change term:** a number of months.
- **Interest-only, negative amortization, and balloon payment:** separate yes/no values.

The agent reads each as recorded. A blank cap or first-change term does not, by itself, prove the loan is fixed-rate; it should use the applicable rate record for that.

### Turn 49 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 49 — app-assistant

I’ve recorded those five Loan features with their stated types. A missing cap or first-rate-change term won’t be used to infer that the rate is fixed.

For the separate **Principal, AccruedInterest, CollateralValuation, and PrepaymentTerms** records, are these the values the agent reads: Principal’s outstanding amount; AccruedInterest’s amount and as-of date; CollateralValuation’s value and as-of date; and PrepaymentTerms’ penalty period in months?

### Turn 49 — persona

Yes:

- **Principal:** a numeric outstanding amount.
- **Accrued interest:** a numeric amount and an as-of date.
- **Dated collateral value:** a numeric appraised value and an as-of date.
- **Prepayment terms:** a numeric prepayment-penalty period, expressed in months.

Those fields tell the agent what to read **once it has the right record**. They don’t resolve the open paths for finding a particular loan’s accrued interest or applicable prepayment terms.

### Turn 50 — app-user

Yes:

- **Principal:** a numeric outstanding amount.
- **Accrued interest:** a numeric amount and an as-of date.
- **Dated collateral value:** a numeric appraised value and an as-of date.
- **Prepayment terms:** a numeric prepayment-penalty period, expressed in months.

Those fields tell the agent what to read **once it has the right record**. They don’t resolve the open paths for finding a particular loan’s accrued interest or applicable prepayment terms.

### Turn 50 — app-tool

✓ Applied: 0 added, 4 updated.

### Turn 50 — app-assistant

I’ve recorded those values on their respective records. They tell the agent what to read **once it has the right record**; they do not close the loan-specific lookup gaps for AccruedInterest or PrepaymentTerms.

For **LoanToValueRatio** and **CombinedLoanToValueRatio**, is each ratio stored as its own numeric value on its respective record? If so, what unit or scale does the recorded value use?

### Turn 50 — persona

Yes. Each has its own numeric ratio value. Both measures are described as percentages, but I can’t confirm whether the stored number uses, for example, `75` or `0.75` for 75%. The agent would need the source’s scale convention before interpreting a raw value.

### Turn 51 — app-user

Yes. Each has its own numeric ratio value. Both measures are described as percentages, but I can’t confirm whether the stored number uses, for example, `75` or `0.75` for 75%. The agent would need the source’s scale convention before interpreting a raw value.

### Turn 51 — app-tool

✓ Applied: 0 added, 2 updated.

### Turn 51 — app-assistant

I’ve recorded a numeric value on each ratio record, **without assuming its storage scale**. Interpreting a raw value as a percentage remains open until the source convention is confirmed.

For the payment-timeliness question, does each **PaymentTransaction** record include its actual transaction date? If so, what date does it represent, and is there a confirmed due-date value on the applicable schedule to compare it with?

### Turn 51 — persona

I can’t confirm an actual transaction-date field on an individual payment transaction, or a due-date value on the applicable schedule that the agent can compare with it. The history tells us which individual payments were recorded, but those links alone don’t establish when a payment was made or when it was due.

So payment timeliness remains an **unmet comparison**. I wouldn’t have the agent label a payment on time or late until both dates and the comparison method are confirmed.

### Turn 52 — app-user

I can’t confirm an actual transaction-date field on an individual payment transaction, or a due-date value on the applicable schedule that the agent can compare with it. The history tells us which individual payments were recorded, but those links alone don’t establish when a payment was made or when it was due.

So payment timeliness remains an **unmet comparison**. I wouldn’t have the agent label a payment on time or late until both dates and the comparison method are confirmed.

### Turn 52 — app-assistant

Payment timeliness remains unmet. I haven’t added a transaction date or schedule due date, and the agent must not label a payment on time or late without those dates and a confirmed comparison method.

Because the agent tracks both loans and facilities over time, does **Loan** or **CreditFacility** have its own recorded current-state value that the agent needs for one of our agreed questions or checks? If so, what decision does that value support?

### Turn 52 — persona

No current-state value is established on either the **loan** or the **credit facility** for the questions and five checks we’ve agreed. Their dates, amounts, terms, schedules, and payment records serve different purposes; I wouldn’t turn them into an invented lifecycle state such as “active” or “closed.”

If an operational decision needs a current state, we’d need to define that question and confirm its source first.

### Turn 53 — app-user

No current-state value is established on either the **loan** or the **credit facility** for the questions and five checks we’ve agreed. Their dates, amounts, terms, schedules, and payment records serve different purposes; I wouldn’t turn them into an invented lifecycle state such as “active” or “closed.”

If an operational decision needs a current state, we’d need to define that question and confirm its source first.

### Turn 53 — app-assistant

No current-state field is established for Loan or CreditFacility, so I won’t add one or derive a lifecycle state from their dates and amounts. If a later decision needs one, its source will have to be confirmed.

One hand-off question still needs scrutiny: **“What principal amount was approved for a loan?”** We have the loan’s principal amount, but you’ve said that field does not establish approval. What confirmed record or check would let the agent establish the *approved* amount, or should this question remain unmet?

### Turn 53 — persona

That question should remain **unmet as phrased**. The agent can report the loan’s recorded principal amount, but we haven’t established an approval record or check that verifies it as the approved amount.

For this scope, ask **“What principal amount is recorded for the loan?”** Keep confirmation of the approved amount as a separate requirement until its evidence source is identified.

### Turn 54 — app-user

That question should remain **unmet as phrased**. The agent can report the loan’s recorded principal amount, but we haven’t established an approval record or check that verifies it as the approved amount.

For this scope, ask **“What principal amount is recorded for the loan?”** Keep confirmation of the approved amount as a separate requirement until its evidence source is identified.

### Turn 54 — app-tool

✓ Applied: 1 added, 1 updated.

### Turn 54 — app-assistant

I’ve changed the recorded-amount question and kept **“What principal amount was approved for the loan?”** separately as unmet. The recorded field is not evidence of approval.

The facility question has the same issue: **“What credit limit was approved for a facility?”** Does the facility’s recorded credit limit establish approval, or should we likewise ask for its recorded limit and keep approved-limit confirmation unmet?

### Turn 54 — persona

Likewise, the facility’s **recorded credit limit** does not by itself establish that it was approved. Ask **“What credit limit is recorded for the facility?”** and keep **“What credit limit was approved?”** as a separate unmet requirement until we have a confirmed approval source.

### Turn 55 — app-user

Likewise, the facility’s **recorded credit limit** does not by itself establish that it was approved. Ask **“What credit limit is recorded for the facility?”** and keep **“What credit limit was approved?”** as a separate unmet requirement until we have a confirmed approval source.

### Turn 55 — app-tool

✓ Applied: 1 added, 1 updated.

### Turn 55 — app-assistant

I’ve changed the facility question to ask for its **recorded credit limit** and kept approval of that limit as a separate unmet requirement. The same distinction now applies to the loan’s principal amount.

The decision-bearing fields captured so far are the loan and facility amounts and dates, loan feature values, outstanding principal, accrued interest, collateral valuations, prepayment-penalty period, and the two ratio values. I have not added dates for payment-timeliness testing or a current-state field. The earlier retrieval and designation gaps remain open.

Is that an accurate recap of the fields we can currently justify before we move to plain-language meanings and terminology?

### Turn 55 — persona

Yes, that accurately recaps the fields we’ve **captured so far** and the gaps you’ve kept open. I wouldn’t treat it as the complete field set yet: we still need to cover the numeric rate on a fixed or variable rate record, and the payment dates and frequencies recorded in the principal and interest terms.

The missing loan-specific lookups, designation source, approval evidence, and payment-timeliness comparison remain unresolved.

### Turn 56 — app-user

Yes, that accurately recaps the fields we’ve **captured so far** and the gaps you’ve kept open. I wouldn’t treat it as the complete field set yet: we still need to cover the numeric rate on a fixed or variable rate record, and the payment dates and frequencies recorded in the principal and interest terms.

The missing loan-specific lookups, designation source, approval evidence, and payment-timeliness comparison remain unresolved.

### Turn 56 — app-assistant

Agreed—the field pass isn’t complete yet. The loan-specific lookups, designation source, approval evidence, and payment-timeliness comparison remain unresolved.

For **FixedInterestRate** and **VariableInterestRate**, does each rate record carry its own numeric rate value? If so, is its unit or storage scale confirmed?

### Turn 56 — persona

Yes. A **fixed interest rate** record and a **variable interest rate** record each carry a numeric **rate** value. The unit or storage scale isn’t confirmed here, so I wouldn’t assume how to interpret a raw number without the source convention.

### Turn 57 — app-user

Yes. A **fixed interest rate** record and a **variable interest rate** record each carry a numeric **rate** value. The unit or storage scale isn’t confirmed here, so I wouldn’t assume how to interpret a raw number without the source convention.

### Turn 57 — app-tool

✓ Applied: 0 added, 2 updated.

### Turn 57 — app-assistant

I’ve recorded a numeric rate on each rate record, without assuming its scale. That lets the agent identify the recorded value but not safely interpret a raw number until the source convention is known.

For **PrincipalRepaymentTerms** and **InterestPaymentTerms**, what payment-date and frequency values are recorded on each? Are the dates single dates or something else, and are the frequencies drawn from a known set of choices?

### Turn 57 — persona

**Principal repayment terms** record an initial principal payment date and a principal repayment date, both as dates. They also record principal payment frequency and principal payment day as text.

**Interest payment terms** record an initial interest accrual date, an initial interest payment date, and a final interest payment date, all as dates. Interest payment frequency, interest payment day, and compounding frequency are text.

These date fields hold individual dates, not a series of scheduled payments. I don’t have a confirmed set of allowed frequency or payment-day values, so the agent shouldn’t impose one.

### Turn 58 — app-user

**Principal repayment terms** record an initial principal payment date and a principal repayment date, both as dates. They also record principal payment frequency and principal payment day as text.

**Interest payment terms** record an initial interest accrual date, an initial interest payment date, and a final interest payment date, all as dates. Interest payment frequency, interest payment day, and compounding frequency are text.

These date fields hold individual dates, not a series of scheduled payments. I don’t have a confirmed set of allowed frequency or payment-day values, so the agent shouldn’t impose one.

### Turn 58 — app-tool

✓ Applied: 0 added, 2 updated.

### Turn 58 — app-assistant

I’ve added the individual dates and text values on the principal and interest payment terms. They describe the terms, not a series of scheduled payments; I haven’t imposed allowed frequency or payment-day values.

The field pass now includes the rate values and payment-term details you flagged. It still does **not** resolve the missing loan-specific lookups, designation source, approval evidence, or payment-timeliness comparison. Is that an accurate field-pass recap before we work through plain-language meanings?

### Turn 58 — persona

Yes, that’s accurate for the fields we’ve covered. The rate values and payment-term dates and text are now included, and none of them closes the open lookup, designation, approval, or timeliness gaps.

I wouldn’t call it a complete field inventory: a facility can also record a maximum advance amount, for example. But you can move to plain-language meanings without treating the outstanding gaps as solved.

### Turn 59 — app-user

Yes, that’s accurate for the fields we’ve covered. The rate values and payment-term dates and text are now included, and none of them closes the open lookup, designation, approval, or timeliness gaps.

I wouldn’t call it a complete field inventory: a facility can also record a maximum advance amount, for example. But you can move to plain-language meanings without treating the outstanding gaps as solved.

### Turn 59 — app-assistant

Yes. I won’t add **maximum advance amount** just because it may be recorded; none of the agreed questions or checks yet uses it. The unresolved paths and evidence sources remain open, not solved by moving to terminology.

Let’s establish meanings in small groups. In one sentence each, what do **Loan, CreditFacility, CreditAgreement, Borrower, and Lender** mean in your operations?

### Turn 59 — persona

- **Loan:** Money or credit extended to a borrower, to be repaid under the loan’s terms.
- **Credit facility:** A credit agreement that lets a borrower draw funds over time rather than apply for a new loan each time.
- **Credit agreement:** The agreement under which a borrower receives value and undertakes to repay the lender, generally with interest.
- **Borrower:** The party obligated to repay what was borrowed, including interest and applicable fees, under the agreement.
- **Lender:** The party that provides the money or credit and expects repayment.

### Turn 60 — app-user

- **Loan:** Money or credit extended to a borrower, to be repaid under the loan’s terms.
- **Credit facility:** A credit agreement that lets a borrower draw funds over time rather than apply for a new loan each time.
- **Credit agreement:** The agreement under which a borrower receives value and undertakes to repay the lender, generally with interest.
- **Borrower:** The party obligated to repay what was borrowed, including interest and applicable fees, under the agreement.
- **Lender:** The party that provides the money or credit and expects repayment.

### Turn 60 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 60 — app-assistant

I’ve recorded those five meanings. The facility’s description as a credit agreement does not create a link to a second agreement record.

In one sentence each, how would you define **Servicer, Collateral, SecurityAgreement, CollateralValuation, and SubFacility** for someone reading this model?

### Turn 60 — persona

- **Servicer:** The party that collects principal and interest payments on the lender’s behalf.
- **Collateral:** Something pledged to support repayment of an obligation.
- **Security agreement:** The agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning it.
- **Dated collateral value:** An appraised value of collateral recorded as of a particular date.
- **Sub-facility:** A portion of a credit facility made available to the borrower for a purpose, possibly on a schedule.

### Turn 61 — app-user

- **Servicer:** The party that collects principal and interest payments on the lender’s behalf.
- **Collateral:** Something pledged to support repayment of an obligation.
- **Security agreement:** The agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning it.
- **Dated collateral value:** An appraised value of collateral recorded as of a particular date.
- **Sub-facility:** A portion of a credit facility made available to the borrower for a purpose, possibly on a schedule.

### Turn 61 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 61 — app-assistant

I’ve recorded those five meanings, keeping pledged collateral separate from its dated appraisal and the agreement that secures it.

In one sentence each, what do **Principal, Interest, AccruedInterest, PrincipalRepaymentTerms, and InterestPaymentTerms** mean here?

### Turn 61 — persona

- **Principal:** The amount of the loan obligation to be repaid, separate from interest.
- **Interest:** The cost of using the credit, payable under the agreement and distinct from principal.
- **Accrued interest:** Interest incurred as of a particular date but not yet paid.
- **Principal repayment terms:** The agreement’s requirements for repaying principal.
- **Interest payment terms:** The agreement’s requirements for paying interest.

### Turn 62 — app-user

- **Principal:** The amount of the loan obligation to be repaid, separate from interest.
- **Interest:** The cost of using the credit, payable under the agreement and distinct from principal.
- **Accrued interest:** Interest incurred as of a particular date but not yet paid.
- **Principal repayment terms:** The agreement’s requirements for repaying principal.
- **Interest payment terms:** The agreement’s requirements for paying interest.

### Turn 62 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 62 — app-assistant

I’ve recorded those meanings. **Interest** is the obligation; **AccruedInterest** is an incurred but unpaid amount as of a date, and its loan-specific lookup remains open.

In one sentence each, what do **PrepaymentTerms, PaymentHistory, PaymentTransaction, LoanPaymentSchedule, and AmortizationSchedule** mean?

### Turn 62 — persona

- **Prepayment terms:** The part of principal repayment terms dealing with paying the loan before maturity, including any penalty period.
- **Payment history:** The record of actual payments made toward the borrower’s repayment obligation.
- **Individual payment transaction:** One actual payment toward the debt, whether for principal, interest, fees, or another related amount.
- **Loan payment schedule:** The regular or explicit payment schedule associated with the loan’s account.
- **Amortization schedule:** A schedule of periodic payments showing how the debt balance changes over time.

### Turn 63 — app-user

- **Prepayment terms:** The part of principal repayment terms dealing with paying the loan before maturity, including any penalty period.
- **Payment history:** The record of actual payments made toward the borrower’s repayment obligation.
- **Individual payment transaction:** One actual payment toward the debt, whether for principal, interest, fees, or another related amount.
- **Loan payment schedule:** The regular or explicit payment schedule associated with the loan’s account.
- **Amortization schedule:** A schedule of periodic payments showing how the debt balance changes over time.

### Turn 63 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 63 — app-assistant

I’ve recorded those five meanings. Describing PrepaymentTerms as part of principal repayment terms still does **not** establish how to retrieve them for a particular loan.

In one sentence each, what do **PrincipalPaymentSchedule, InterestPaymentSchedule, FixedInterestRate, VariableInterestRate, and InterestRateResetSchedule** mean?

### Turn 63 — persona

- **Principal payment schedule:** The agreed schedule showing when some or all of the principal is due for repayment.
- **Interest payment schedule:** The agreed schedule showing when interest is due to be paid.
- **Fixed interest rate:** A rate that does not fluctuate over the life of the loan.
- **Variable interest rate:** A rate that can change during the life of the loan.
- **Interest rate reset schedule:** The schedule of dates when a rate reset and the resulting actual rate are recalculated.

### Turn 64 — app-user

- **Principal payment schedule:** The agreed schedule showing when some or all of the principal is due for repayment.
- **Interest payment schedule:** The agreed schedule showing when interest is due to be paid.
- **Fixed interest rate:** A rate that does not fluctuate over the life of the loan.
- **Variable interest rate:** A rate that can change during the life of the loan.
- **Interest rate reset schedule:** The schedule of dates when a rate reset and the resulting actual rate are recalculated.

### Turn 64 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 64 — app-assistant

I’ve recorded the due-principal and due-interest schedules separately, and distinguished a variable-rate record from the schedule of its resets.

The last two class meanings are the ratios. In one sentence each, how would you define **LoanToValueRatio** and **CombinedLoanToValueRatio**?

### Turn 64 — persona

- **Loan-to-value ratio:** That loan’s principal compared with the appraised value of the asset securing it, expressed as a percentage.
- **Combined loan-to-value ratio:** The total debt secured by the asset or assets compared with their appraised value, expressed as a percentage.

The second includes other debt secured by the same collateral; it isn’t just a second name for the first ratio.

### Turn 65 — app-user

- **Loan-to-value ratio:** That loan’s principal compared with the appraised value of the asset securing it, expressed as a percentage.
- **Combined loan-to-value ratio:** The total debt secured by the asset or assets compared with their appraised value, expressed as a percentage.

The second includes other debt secured by the same collateral; it isn’t just a second name for the first ratio.

### Turn 65 — app-tool

✓ Applied: 0 added, 2 updated.

### Turn 65 — app-assistant

I’ve recorded both ratio meanings. Combined loan-to-value includes other debt secured by the same collateral, so it is not an alias for loan-to-value. The raw numeric scale is still unconfirmed.

Now the connection meanings. In one sentence each, what does each **Loan** link assert: **hasBorrower, hasLender, servicedBy, collateralizedBy, and hasPrincipal**?

### Turn 65 — persona

- A loan’s **borrower** link identifies the party that incurs the debt.
- A loan’s **lender** link identifies the party financing it.
- A loan **is serviced by** the party responsible for collecting its principal and interest payments on the lender’s behalf.
- A **secured loan is collateralized by** the collateral pledged to support it; that link does not apply to a guarantee-only loan without pledged collateral.
- A loan’s **principal** link identifies its principal obligation, whose outstanding amount is tracked separately from interest.

### Turn 66 — app-user

- A loan’s **borrower** link identifies the party that incurs the debt.
- A loan’s **lender** link identifies the party financing it.
- A loan **is serviced by** the party responsible for collecting its principal and interest payments on the lender’s behalf.
- A **secured loan is collateralized by** the collateral pledged to support it; that link does not apply to a guarantee-only loan without pledged collateral.
- A loan’s **principal** link identifies its principal obligation, whose outstanding amount is tracked separately from interest.

### Turn 66 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 66 — app-assistant

I’ve recorded those five loan-link meanings, including the limit on the collateral link for a guarantee-only loan.

In one sentence each, what do the **CreditFacility → Borrower**, **CreditFacility → Lender**, **CreditAgreement → Borrower**, **CreditAgreement → Lender**, and **CreditFacility → SubFacility** links assert?

### Turn 66 — persona

- **Facility to borrower:** Identifies the party entitled to draw funds under the facility and obligated to repay them under its terms.
- **Facility to lender:** Identifies the party providing the credit facility.
- **Credit agreement to borrower:** Identifies the party that incurs the debt under the agreement.
- **Credit agreement to lender:** Identifies the party financing the agreement.
- **Facility to sub-facility:** Identifies a portion of that facility made available to the borrower for a particular purpose.

### Turn 67 — app-user

- **Facility to borrower:** Identifies the party entitled to draw funds under the facility and obligated to repay them under its terms.
- **Facility to lender:** Identifies the party providing the credit facility.
- **Credit agreement to borrower:** Identifies the party that incurs the debt under the agreement.
- **Credit agreement to lender:** Identifies the party financing the agreement.
- **Facility to sub-facility:** Identifies a portion of that facility made available to the borrower for a particular purpose.

### Turn 67 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 67 — app-assistant

I’ve recorded those five meanings. The sub-facility is a portion tracked under its parent facility, not evidence of the parent facility’s secured status.

In one sentence each, what do these support and measure links assert: **SecurityAgreement → secures → Collateral**, **Collateral → hasValuation → CollateralValuation**, and **Loan → hasLoanToValueRatio / hasCombinedLoanToValueRatio → the respective ratio records**?

### Turn 67 — persona

- A **security agreement secures collateral** by granting a financial interest in it and setting out rights and duties concerning it.
- A **collateral value record** gives the collateral’s appraised value as of a specified date. I’d be more specific than “has valuation,” because the date is part of what makes the value usable.
- A **collateralized loan’s loan-to-value ratio** compares that loan’s principal with the appraised value of the collateral.
- Its **combined loan-to-value ratio** compares all debt secured by the asset or assets with their appraised value.

### Turn 68 — app-user

- A **security agreement secures collateral** by granting a financial interest in it and setting out rights and duties concerning it.
- A **collateral value record** gives the collateral’s appraised value as of a specified date. I’d be more specific than “has valuation,” because the date is part of what makes the value usable.
- A **collateralized loan’s loan-to-value ratio** compares that loan’s principal with the appraised value of the collateral.
- Its **combined loan-to-value ratio** compares all debt secured by the asset or assets with their appraised value.

### Turn 68 — app-tool

✓ Applied: 0 added, 3 updated.

### Turn 68 — app-assistant

I’ve recorded the security-agreement and ratio-link meanings. I agree **hasValuation** is too vague for the dated-value connection, so I’ve left that link’s wording unchanged for now rather than guess at a replacement.

What verb phrase would you use for **Collateral → CollateralValuation** to make clear it points to an appraised value recorded as of a particular date?

### Turn 68 — persona

I’d say **“has collateral value.”** Read it as: the collateral has a recorded appraised value **as of the date on that value record**. The date belongs to the value record, so the link can lead to different dated appraisals without implying one timeless value.

### Turn 69 — app-user

I’d say **“has collateral value.”** Read it as: the collateral has a recorded appraised value **as of the date on that value record**. The date belongs to the value record, so the link can lead to different dated appraisals without implying one timeless value.

### Turn 69 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 69 — app-assistant

I’ve added **Collateral → has collateral value → CollateralValuation**, with the date on each value record. The older **hasValuation** link is still on the canvas, so I need to remove that duplicate before treating the wording as settled. I’ll do that next; the dated appraisals themselves remain distinct.

### Turn 69 — persona

Yes—remove the duplicate link. Keep **has collateral value** pointing to each dated appraisal record.

### Turn 70 — app-user

Yes—remove the duplicate link. Keep **has collateral value** pointing to each dated appraisal record.

### Turn 70 — app-tool

✓ Removed: 1 element(s).

### Turn 70 — app-assistant

I’ve removed the duplicate **hasValuation** link. **Collateral → hasCollateralValue → CollateralValuation** is now the one recorded connection to each dated appraisal.

In one sentence each, what do these loan links assert: **hasFixedInterestRate, hasVariableInterestRate, hasInterestRateResetSchedule, hasInterest**, and **hasPaymentHistory**?

### Turn 70 — persona

Those connections are right in substance, but I’d name the two rate links the same way: the loan **has an interest rate**, which may be fixed or variable. A fixed rate stays unchanged over the loan’s life; a variable rate can change. The loan also **has a schedule** for rate resets—separate from the variable-rate record itself.

The loan’s **interest** link identifies its interest obligation, while its **payment history** link identifies the record of payments actually made.

### Turn 71 — app-user

Those connections are right in substance, but I’d name the two rate links the same way: the loan **has an interest rate**, which may be fixed or variable. A fixed rate stays unchanged over the loan’s life; a variable rate can change. The loan also **has a schedule** for rate resets—separate from the variable-rate record itself.

The loan’s **interest** link identifies its interest obligation, while its **payment history** link identifies the record of payments actually made.

### Turn 71 — app-tool

✓ Applied: 2 added, 3 updated.

### Turn 71 — app-tool

An additional ontology edit in this message was skipped — only one edit is applied per message.

### Turn 71 — app-assistant

I’ve recorded the shared **hasInterestRate** wording for the fixed and variable rate links, and the meanings of the reset-schedule, interest-obligation, and payment-history links. The two old rate-link names are **still on the canvas**; I couldn’t remove them in this turn, so those pairs are temporarily duplicated. I’ll remove the old names before treating this part as finished.

In one sentence each, what do the loan’s four schedule links assert: **hasLoanPaymentSchedule, hasPrincipalPaymentSchedule, hasInterestPaymentSchedule, and hasAmortizationSchedule**?

### Turn 71 — persona

Each link says the **loan has a schedule** of a particular kind:

- A **loan payment schedule** sets out regular or explicit payments for the loan’s account.
- A **principal payment schedule** sets out when principal is due.
- An **interest payment schedule** sets out when interest is due.
- An **amortization schedule** shows how periodic payments change the debt balance over time.

I’d use the same connection wording for all four, rather than make each schedule type a different verb.

### Turn 72 — app-user

Each link says the **loan has a schedule** of a particular kind:

- A **loan payment schedule** sets out regular or explicit payments for the loan’s account.
- A **principal payment schedule** sets out when principal is due.
- An **interest payment schedule** sets out when interest is due.
- An **amortization schedule** shows how periodic payments change the debt balance over time.

I’d use the same connection wording for all four, rather than make each schedule type a different verb.

### Turn 72 — app-tool

✓ Removed: 2 element(s).

### Turn 72 — app-assistant

I’ve removed the two old rate-link names. The fixed and variable rate records now use the shared **hasInterestRate** wording without duplicate links.

I’ll use the same **hasSchedule** wording for the four schedule links, while retaining each schedule’s distinct meaning. Before I change them: does **Loan → InterestRateResetSchedule** also use “has schedule,” or do you want **hasInterestRateResetSchedule** kept as a distinct connection name?

### Turn 72 — persona

Use **“has schedule”** for the loan-to-interest-rate-reset-schedule connection too. The schedule’s type tells us it covers rate resets; it doesn’t need a separate connection name. The variable-rate setup check still verifies that the loan has both a variable interest rate and that reset schedule.

### Turn 73 — app-user

Use **“has schedule”** for the loan-to-interest-rate-reset-schedule connection too. The schedule’s type tells us it covers rate resets; it doesn’t need a separate connection name. The variable-rate setup check still verifies that the loan has both a variable interest rate and that reset schedule.

### Turn 73 — app-tool

✓ Applied: 5 added, 0 updated.

### Turn 73 — app-assistant

I’ve added **hasSchedule** for all five schedule types. The old schedule-link names are still present for now, so the canvas temporarily has duplicate connections; I’ll remove those old names next. The variable-rate check still needs both the variable-rate link and the reset-schedule link.

In one sentence each, what do these remaining connections assert: **PrincipalRepaymentTerms → Principal**, **InterestPaymentTerms → Interest**, and **PaymentHistory → PaymentTransaction**?

### Turn 73 — persona

- **Principal repayment terms govern payment of principal**: they state the requirements for repaying that obligation.
- **Interest payment terms govern payment of interest**: they state the requirements for paying that obligation.
- A **payment history has individual payments**: the actual payment transactions are entries in that history, not scheduled amounts due.

### Turn 74 — app-user

- **Principal repayment terms govern payment of principal**: they state the requirements for repaying that obligation.
- **Interest payment terms govern payment of interest**: they state the requirements for paying that obligation.
- A **payment history has individual payments**: the actual payment transactions are entries in that history, not scheduled amounts due.

### Turn 74 — app-tool

✓ Removed: 5 element(s).

### Turn 74 — app-assistant

I’ve removed the five old schedule-link names; **hasSchedule** is now the only connection name for each of those pairs. Your definitions also confirm that the two sets of terms govern their respective obligations, while payment-history entries are actual transactions, not amounts due. I’ll record those meanings next.

For class terminology, are there common alternative names that mean **exactly the same thing** as any of these five in your organization: Loan, CreditFacility, CreditAgreement, Borrower, or Lender? “None” for any of them is fine.

### Turn 74 — persona

**Master commitment** is an alternative name for a credit facility. I don’t have an exact alternative name for **loan, credit agreement, borrower, or lender** in this terminology.

### Turn 75 — app-user

**Master commitment** is an alternative name for a credit facility. I don’t have an exact alternative name for **loan, credit agreement, borrower, or lender** in this terminology.

### Turn 75 — app-tool

✓ Applied: 0 added, 4 updated.

### Turn 75 — app-assistant

I’ve recorded **master commitment** as an alias for CreditFacility, and the three remaining relationship meanings. I haven’t added aliases for the other four classes.

Are there exact alternative names for **Servicer, Collateral, SecurityAgreement, CollateralValuation, or SubFacility** in your organization?

### Turn 75 — persona

No exact alternative names are established for those five. I would keep “dated collateral value” as the description of the appraisal record, not add a separate alias just because we’ve called it a “valuation” in conversation.

### Turn 76 — app-user

No exact alternative names are established for those five. I would keep “dated collateral value” as the description of the appraisal record, not add a separate alias just because we’ve called it a “valuation” in conversation.

### Turn 76 — app-assistant

I’ve left those five without aliases. “Dated collateral value” remains a description of CollateralValuation, not an assumed alternate name.

Are there exact alternative names for **Principal, Interest, AccruedInterest, PrincipalRepaymentTerms, or InterestPaymentTerms**?

### Turn 76 — persona

No exact alternative names are established for those five. I’d keep **accrued interest** distinct from interest generally: it is the incurred, unpaid amount as of a date, not another name for the interest obligation.

### Turn 77 — app-user

No exact alternative names are established for those five. I’d keep **accrued interest** distinct from interest generally: it is the incurred, unpaid amount as of a date, not another name for the interest obligation.

### Turn 77 — app-tool

🔍 Checked the current ontology state.

### Turn 77 — app-assistant

I’ve kept **Interest** and **AccruedInterest** distinct, and added no aliases for that group. The canvas check also confirms that every recorded class and relationship now has a meaning sentence.

One terminology check for the connections: do your colleagues use any exact alternate phrasing for **hasBorrower**, **hasLender**, **servicedBy**, **collateralizedBy**, or **secures**? Please give only phrases that mean the same connection in your records; “none” is fine.

### Turn 77 — persona

None established as exact alternatives for those connections. In ordinary speech we might say “the borrower on the loan” or “the lender funding it,” but I wouldn’t record those as equivalent connection names.

### Turn 78 — app-user

None established as exact alternatives for those connections. In ordinary speech we might say “the borrower on the loan” or “the lender funding it,” but I wouldn’t record those as equivalent connection names.

### Turn 78 — app-assistant

I’ve recorded no aliases for those connections. “Borrower on the loan” and “lender funding it” are ordinary descriptions here, not confirmed alternate relationship names. Every class and relationship on the canvas has a meaning sentence; **master commitment** is the one confirmed alias so far. The loan-specific lookup and evidence gaps remain open.

Does that accurately capture the terminology before we check which recorded values have fixed choices or must be present for a check to pass?

### Turn 78 — persona

Yes, for the records and connections captured so far. **Master commitment** is the confirmed alias in that set; the other phrases we discussed are descriptions, not established aliases. The open lookup and evidence gaps remain open as we move to allowed values and check requirements.

### Turn 79 — app-user

Yes, for the records and connections captured so far. **Master commitment** is the confirmed alias in that set; the other phrases we discussed are descriptions, not established aliases. The open lookup and evidence gaps remain open as we move to allowed values and check requirements.

### Turn 79 — app-assistant

I’ll keep the terminology as confirmed and leave the lookup and evidence gaps open.

For the five text fields on payment terms—**principal payment frequency, principal payment day, interest payment frequency, interest payment day, and compounding frequency**—is there a confirmed allowed-value list for each, or are the allowed choices still unknown?

### Turn 79 — persona

The allowed choices are **not confirmed** for any of those five text fields. We know what each field describes, but I wouldn’t impose a list of frequencies or payment-day values without an approved source for it.

### Turn 80 — app-user

The allowed choices are **not confirmed** for any of those five text fields. We know what each field describes, but I wouldn’t impose a list of frequencies or payment-day values without an approved source for it.

### Turn 80 — app-assistant

I’ll leave the allowed-value lists open for all five; the model won’t impose choices without a confirmed source.

For each field separately—**principal payment frequency, principal payment day, interest payment frequency, interest payment day, and compounding frequency**—what happens if its value is missing or wrong when the agent answers the agreed questions or performs one of the five checks? A short answer for each will help distinguish a check-blocking requirement from an unknown or unused value.

### Turn 80 — persona

For each field, a missing value means the agent cannot report that detail. None is an established **blocking condition** for the five verification checks, and without confirmed allowed choices the agent cannot judge whether a recorded text value is valid.

- **Principal payment frequency:** Missing leaves the repayment frequency unanswered.
- **Principal payment day:** Missing leaves the payment-day detail unanswered.
- **Interest payment frequency:** Missing leaves the interest-payment frequency unanswered.
- **Interest payment day:** Missing leaves the interest-payment-day detail unanswered.
- **Compounding frequency:** Missing leaves the compounding frequency unanswered.

The loan-readiness check requires applicable interest payment terms to be linked; it does not, as currently defined, require every field within those terms to be populated.

### Turn 81 — app-user

For each field, a missing value means the agent cannot report that detail. None is an established **blocking condition** for the five verification checks, and without confirmed allowed choices the agent cannot judge whether a recorded text value is valid.

- **Principal payment frequency:** Missing leaves the repayment frequency unanswered.
- **Principal payment day:** Missing leaves the payment-day detail unanswered.
- **Interest payment frequency:** Missing leaves the interest-payment frequency unanswered.
- **Interest payment day:** Missing leaves the interest-payment-day detail unanswered.
- **Compounding frequency:** Missing leaves the compounding frequency unanswered.

The loan-readiness check requires applicable interest payment terms to be linked; it does not, as currently defined, require every field within those terms to be populated.

### Turn 81 — app-assistant

For each of those five fields, a missing value leaves that detail unanswered, but does **not** block any of the five verification checks. Without a confirmed choice list, the agent also cannot judge whether a recorded text value is valid. The loan-readiness check requires linked interest payment terms, not every field within them.

For the five Loan feature fields—**interest rate cap, first-rate-change term, interest-only, negative amortization, and balloon payment**—what would a missing or wrong value prevent the agent from answering or checking for each one?

### Turn 81 — persona

A missing value leaves the corresponding feature unanswered; it does **not** block any of the five verification checks. A recorded value of the wrong type should not be treated as a reliable answer, but we have no further validity limits or comparison rules for these fields.

| Loan field | If missing or unusable |
|---|---|
| **Interest rate cap** | The agent cannot report whether a cap value applies or what it is. It does not block the variable-rate setup check. |
| **First-rate-change term** | The agent cannot report the recorded number of months to the first rate change. It does not block that check. |
| **Interest-only** | The agent cannot answer whether that feature applies. |
| **Negative amortization** | The agent cannot answer whether the loan is marked as permitting it. |
| **Balloon payment** | The agent cannot answer whether that feature applies. |

For the three yes/no fields, **missing means unknown**, not “no.”

### Turn 82 — app-user

A missing value leaves the corresponding feature unanswered; it does **not** block any of the five verification checks. A recorded value of the wrong type should not be treated as a reliable answer, but we have no further validity limits or comparison rules for these fields.

| Loan field | If missing or unusable |
|---|---|
| **Interest rate cap** | The agent cannot report whether a cap value applies or what it is. It does not block the variable-rate setup check. |
| **First-rate-change term** | The agent cannot report the recorded number of months to the first rate change. It does not block that check. |
| **Interest-only** | The agent cannot answer whether that feature applies. |
| **Negative amortization** | The agent cannot answer whether the loan is marked as permitting it. |
| **Balloon payment** | The agent cannot answer whether that feature applies. |

For the three yes/no fields, **missing means unknown**, not “no.”

### Turn 82 — app-assistant

I’ll treat a missing feature value as **unknown**, not “no”; none of these five fields blocks a verification action. A value of the wrong type is not a reliable answer.

For the **prepayment-penalty period**, what happens if the period is missing or unusable when the prepayment review is attempted? Does that prevent confirmation once the applicable PrepaymentTerms have been found?

### Turn 82 — persona

Yes. **Once the applicable prepayment terms have been found**, the review cannot be confirmed unless a usable penalty period in months is recorded. A missing or unusable value leaves the penalty timing unverified.

The earlier problem still comes first: we have no confirmed way to find those terms for a particular loan. Neither a missing period nor a missing lookup proves that no prepayment penalty applies.

### Turn 83 — app-user

Yes. **Once the applicable prepayment terms have been found**, the review cannot be confirmed unless a usable penalty period in months is recorded. A missing or unusable value leaves the penalty timing unverified.

The earlier problem still comes first: we have no confirmed way to find those terms for a particular loan. Neither a missing period nor a missing lookup proves that no prepayment penalty applies.

### Turn 83 — app-assistant

Once the applicable PrepaymentTerms are found, the prepayment review can pass only if a usable penalty period in months is recorded. The lookup is still unresolved, and neither gap proves that no penalty applies.

For the **loan setup readiness** check, what happens if each of these is missing or wrong: the Loan’s borrower link, lender link, applicable interest-rate link, and—for an interest-bearing loan—the Interest obligation or the terms governing its payment? Please distinguish the consequence for each.

### Turn 83 — persona

For a **particular loan**, I’d handle each item this way:

- **Borrower link missing or pointing to the wrong party:** Don’t confirm readiness; we cannot verify who owes the debt.
- **Lender link missing or pointing to the wrong party:** Don’t confirm readiness; we cannot verify who finances it.
- **Applicable interest-rate link missing or wrong:** We cannot verify the rate setup. If the loan is known to be interest-bearing, don’t confirm readiness. If that status itself is unknown, don’t infer from the missing link that the loan bears no interest.
- **Interest obligation missing or wrong, on an interest-bearing loan:** Don’t confirm readiness; we cannot establish which interest obligation the payment terms govern.
- **Terms governing that interest missing or pointing to the wrong obligation:** Don’t confirm readiness; having terms somewhere on file is not enough—they must govern the loan’s interest.

This check verifies the links, not every date or frequency field inside the terms.

### Turn 84 — app-user

For a **particular loan**, I’d handle each item this way:

- **Borrower link missing or pointing to the wrong party:** Don’t confirm readiness; we cannot verify who owes the debt.
- **Lender link missing or pointing to the wrong party:** Don’t confirm readiness; we cannot verify who finances it.
- **Applicable interest-rate link missing or wrong:** We cannot verify the rate setup. If the loan is known to be interest-bearing, don’t confirm readiness. If that status itself is unknown, don’t infer from the missing link that the loan bears no interest.
- **Interest obligation missing or wrong, on an interest-bearing loan:** Don’t confirm readiness; we cannot establish which interest obligation the payment terms govern.
- **Terms governing that interest missing or pointing to the wrong obligation:** Don’t confirm readiness; having terms somewhere on file is not enough—they must govern the loan’s interest.

This check verifies the links, not every date or frequency field inside the terms.

### Turn 84 — app-assistant

The readiness check must verify the **correct** borrower and lender, not just the presence of links. For a loan known to bear interest, it must also verify the applicable rate, the loan’s interest obligation, and terms governing that obligation. Missing or incorrect links leave readiness unconfirmed; fields inside the terms are not part of this check.

How does the agent establish **whether a particular loan is interest-bearing** before applying those interest-related checks? Is there a confirmed source, or is that applicability test still open?

### Turn 84 — persona

The confirmed evidence is the loan’s **fixed or variable interest-rate link**. If one applies, the agent treats the loan as interest-bearing and checks that interest payment terms govern its interest obligation.

There’s no separate interest-bearing field established here. If the rate link is missing, the agent cannot conclude the loan is interest-free; it should leave applicability—and therefore readiness—unconfirmed until the rate setup is clarified.

### Turn 85 — app-user

The confirmed evidence is the loan’s **fixed or variable interest-rate link**. If one applies, the agent treats the loan as interest-bearing and checks that interest payment terms govern its interest obligation.

There’s no separate interest-bearing field established here. If the rate link is missing, the agent cannot conclude the loan is interest-free; it should leave applicability—and therefore readiness—unconfirmed until the rate setup is clarified.

### Turn 85 — app-assistant

The fixed- or variable-rate link is the confirmed evidence that a loan bears interest. If neither link can be verified, the agent must not treat the loan as interest-free or confirm setup readiness.

For the **variable-rate setup check**, what happens if either the loan’s variable-rate link or its separate reset-schedule link is missing or points to the wrong record?

### Turn 85 — persona

Given a **loan being reviewed as variable-rate**, the agent verifies two separate links: the loan’s **variable interest rate** and its **interest rate reset schedule**. If either is missing or points to the wrong record, it cannot confirm the variable-rate setup.

A missing variable-rate link does not prove the loan is fixed-rate; a reset schedule by itself does not establish that a variable rate applies. The check records only that the setup was verified or could not be confirmed.

### Turn 86 — app-user

Given a **loan being reviewed as variable-rate**, the agent verifies two separate links: the loan’s **variable interest rate** and its **interest rate reset schedule**. If either is missing or points to the wrong record, it cannot confirm the variable-rate setup.

A missing variable-rate link does not prove the loan is fixed-rate; a reset schedule by itself does not establish that a variable rate applies. The check records only that the setup was verified or could not be confirmed.

### Turn 86 — app-assistant

The variable-rate check requires both correct links. If either is missing or wrong, the setup cannot be confirmed; neither link alone establishes the other.

For the **collateral-support check**, what happens if the Loan → Collateral link is missing or points to the wrong collateral? Is there any other field or link this particular check must verify before it can pass?

### Turn 86 — persona

For a **secured loan** undergoing this collateral-support check, a missing link to collateral—or one pointing to the wrong collateral—means the check cannot be confirmed. This particular check verifies the **secured loan’s collateral link**; it does not also require a security-agreement link, a valuation, or a loan-to-value ratio.

Failure of this check does not establish that a guarantee is absent. And until the source of a particular loan’s secured designation is confirmed, the agent cannot reliably decide on its own which loans to submit to this check.

### Turn 87 — app-user

For a **secured loan** undergoing this collateral-support check, a missing link to collateral—or one pointing to the wrong collateral—means the check cannot be confirmed. This particular check verifies the **secured loan’s collateral link**; it does not also require a security-agreement link, a valuation, or a loan-to-value ratio.

Failure of this check does not establish that a guarantee is absent. And until the source of a particular loan’s secured designation is confirmed, the agent cannot reliably decide on its own which loans to submit to this check.

### Turn 87 — app-assistant

The collateral-support check verifies only the **correct Loan → Collateral link**. A missing or wrong link prevents confirmation, but says nothing about a guarantee. The agent still lacks a confirmed source for deciding which particular loans meet this check’s “secured loan” input condition.

For the **payment-record completeness check**, what happens if the loan has no PaymentHistory, or has a history with no individual PaymentTransactions? Does either case prevent confirmation?

### Turn 87 — persona

Yes. **Either case prevents confirmation**: the loan needs a payment history, and that history must contain individual payment transactions. An empty history record is not enough.

This checks whether actual-payment entries are trackable. It does not determine whether a payment was due, made on time, or missing from the borrower’s obligation.

### Turn 88 — app-user

Yes. **Either case prevents confirmation**: the loan needs a payment history, and that history must contain individual payment transactions. An empty history record is not enough.

This checks whether actual-payment entries are trackable. It does not determine whether a payment was due, made on time, or missing from the borrower’s obligation.

### Turn 88 — app-assistant

The payment-record check can pass only when the loan has a PaymentHistory **and** that history contains individual PaymentTransactions. It does not assess whether payments were due or timely.

For each of these recorded amounts, what does a missing or unusable value prevent the agent from answering: **Loan principal amount, Loan balance, Principal outstanding amount, CreditFacility credit limit, credit extended, and available amount**? Please distinguish them rather than treating one as a substitute for another.

### Turn 88 — persona

A missing or unusable value leaves **that amount** unanswered; none of these amount fields is a precondition for the five verification checks we’ve defined.

| Recorded amount | What the agent cannot answer |
|---|---|
| **Loan principal amount** | The loan’s recorded principal amount—not whether it was approved. |
| **Loan balance** | The loan’s recorded balance. |
| **Principal outstanding amount** | The outstanding amount on the loan’s linked principal obligation. |
| **Facility credit limit** | The facility’s recorded credit limit—not whether it was approved. |
| **Facility credit extended** | How much credit is recorded as extended under the facility. |
| **Facility available amount** | How much is recorded as available to draw. |

The agent shouldn’t substitute one for another or calculate a missing available amount from the other facility values.

### Turn 89 — app-user

A missing or unusable value leaves **that amount** unanswered; none of these amount fields is a precondition for the five verification checks we’ve defined.

| Recorded amount | What the agent cannot answer |
|---|---|
| **Loan principal amount** | The loan’s recorded principal amount—not whether it was approved. |
| **Loan balance** | The loan’s recorded balance. |
| **Principal outstanding amount** | The outstanding amount on the loan’s linked principal obligation. |
| **Facility credit limit** | The facility’s recorded credit limit—not whether it was approved. |
| **Facility credit extended** | How much credit is recorded as extended under the facility. |
| **Facility available amount** | How much is recorded as available to draw. |

The agent shouldn’t substitute one for another or calculate a missing available amount from the other facility values.

### Turn 89 — app-assistant

Each missing or unusable amount leaves only its own answer unavailable. None blocks the five checks, and the agent must not substitute another amount or infer approval from a recorded value.

For the **initial exchange and maturity dates** on Loan, CreditFacility, and CreditAgreement, what does a missing or wrong date prevent the agent from answering for each subject? Do any of those dates block one of the five checks?

### Turn 89 — persona

For each subject, a missing or unusable **initial exchange date** leaves its agreed initial funding or exchange date unanswered; a missing or unusable **maturity date** leaves its maturity date unanswered. A date on one subject should not be substituted for the date on another.

| Subject | Initial exchange date missing or wrong | Maturity date missing or wrong |
|---|---|---|
| **Loan** | Cannot reliably report the loan’s initial exchange date. | Cannot reliably report the loan’s maturity date. |
| **Credit facility** | Cannot reliably report the facility’s agreed initial exchange date. | Cannot reliably report its maturity date. |
| **Credit agreement** | Cannot reliably report the agreement’s initial exchange date. | Cannot reliably report its maturity date. |

Neither date is an established precondition for any of the five verification checks.

### Turn 90 — app-user

For each subject, a missing or unusable **initial exchange date** leaves its agreed initial funding or exchange date unanswered; a missing or unusable **maturity date** leaves its maturity date unanswered. A date on one subject should not be substituted for the date on another.

| Subject | Initial exchange date missing or wrong | Maturity date missing or wrong |
|---|---|---|
| **Loan** | Cannot reliably report the loan’s initial exchange date. | Cannot reliably report the loan’s maturity date. |
| **Credit facility** | Cannot reliably report the facility’s agreed initial exchange date. | Cannot reliably report its maturity date. |
| **Credit agreement** | Cannot reliably report the agreement’s initial exchange date. | Cannot reliably report its maturity date. |

Neither date is an established precondition for any of the five verification checks.

### Turn 90 — app-assistant

A missing or wrong date leaves that date unanswered **for that subject**; dates cannot be borrowed from another record. Neither date blocks the five checks.

For the remaining dated records, what does a missing or unusable value prevent the agent from answering **for each field**: AccruedInterest amount and as-of date, and CollateralValuation appraised value and as-of date?

### Turn 90 — persona

- **Accrued interest amount:** If missing or unusable, the agent cannot report how much interest has accrued but remains unpaid.
- **Accrued interest as-of date:** If missing or unusable, it cannot say when that amount was measured, so it should not present it as the amount for a specified date.
- **Collateral appraised value:** If missing or unusable, the agent cannot report that appraisal amount.
- **Collateral value as-of date:** If missing or unusable, it cannot establish when the appraisal applied or select it reliably for a date-specific question.

None of those fields blocks the five verification checks. The loan-to-accrued-interest lookup is still open; having valid fields on an accrued-interest record would not, by itself, identify it as belonging to a particular loan.

### Turn 91 — app-user

- **Accrued interest amount:** If missing or unusable, the agent cannot report how much interest has accrued but remains unpaid.
- **Accrued interest as-of date:** If missing or unusable, it cannot say when that amount was measured, so it should not present it as the amount for a specified date.
- **Collateral appraised value:** If missing or unusable, the agent cannot report that appraisal amount.
- **Collateral value as-of date:** If missing or unusable, it cannot establish when the appraisal applied or select it reliably for a date-specific question.

None of those fields blocks the five verification checks. The loan-to-accrued-interest lookup is still open; having valid fields on an accrued-interest record would not, by itself, identify it as belonging to a particular loan.

### Turn 91 — app-assistant

A dated amount needs both its value and its as-of date to answer a date-specific question reliably. None of these four fields blocks the five checks, and valid AccruedInterest fields still do not connect that record to a particular loan.

For each **numeric rate** on FixedInterestRate and VariableInterestRate, and each **ratioValue** on LoanToValueRatio and CombinedLoanToValueRatio, what would a missing value—or a value whose storage scale is unknown—prevent the agent from reporting?

### Turn 91 — persona

- **Fixed or variable interest rate:** If its numeric value is missing or unusable, the agent cannot report the rate. If the value is present but its storage scale is unknown, it can identify the recorded number but should not present it as an interpreted rate. The setup checks verify the applicable **rate link**, not the numeric value.
- **Loan-to-value or combined loan-to-value ratio:** If either value is missing or unusable, the agent cannot report that measure. If its scale is unknown, it can identify the recorded number but should not interpret it as a percentage.

The two ratios must be reported separately; one cannot fill in for the other. None of these numeric values is a stated precondition for the five verification checks.

### Turn 92 — app-user

- **Fixed or variable interest rate:** If its numeric value is missing or unusable, the agent cannot report the rate. If the value is present but its storage scale is unknown, it can identify the recorded number but should not present it as an interpreted rate. The setup checks verify the applicable **rate link**, not the numeric value.
- **Loan-to-value or combined loan-to-value ratio:** If either value is missing or unusable, the agent cannot report that measure. If its scale is unknown, it can identify the recorded number but should not interpret it as a percentage.

The two ratios must be reported separately; one cannot fill in for the other. None of these numeric values is a stated precondition for the five verification checks.

### Turn 92 — app-assistant

I’ll distinguish **a present link** from an interpretable numeric value. The setup checks verify rate links, not rate numbers; neither ratio substitutes for the other. Until each source’s scale is known, the agent may report a raw number but must not interpret it as a rate or percentage.

For the individual dates on **PrincipalRepaymentTerms** and **InterestPaymentTerms**, what happens if any date is missing or wrong? Do those dates block a verification check, or only prevent the agent from reporting the corresponding term?

### Turn 92 — persona

A missing or unusable date prevents the agent from reliably reporting **that particular term**:

- **Principal repayment terms:** the initial principal payment date or the principal repayment date.
- **Interest payment terms:** the initial interest accrual date, initial interest payment date, or final interest payment date.

None of those dates is a precondition for the five verification checks. In particular, loan setup readiness checks that the applicable interest payment terms govern the loan’s interest obligation; it does not verify every date within those terms.

### Turn 93 — app-user

A missing or unusable date prevents the agent from reliably reporting **that particular term**:

- **Principal repayment terms:** the initial principal payment date or the principal repayment date.
- **Interest payment terms:** the initial interest accrual date, initial interest payment date, or final interest payment date.

None of those dates is a precondition for the five verification checks. In particular, loan setup readiness checks that the applicable interest payment terms govern the loan’s interest obligation; it does not verify every date within those terms.

### Turn 93 — app-assistant

Each missing or unusable term date leaves that particular date unanswered; none blocks a verification check. Loan setup readiness verifies the applicable interest-terms connection, not every date inside those terms.

For the three Loan yes/no fields—**interestOnly, negativeAmortization, and balloonPayment**—are their valid recorded choices simply **yes and no**, with a missing value treated as unknown?

### Turn 93 — persona

Yes. Each is a **yes/no** value; if it’s missing, the answer is **unknown**, not “no.” That applies separately to interest-only, negative amortization, and balloon payment.

### Turn 94 — app-user

Yes. Each is a **yes/no** value; if it’s missing, the answer is **unknown**, not “no.” That applies separately to interest-only, negative amortization, and balloon payment.

### Turn 94 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 94 — app-assistant

I’ve recorded **true/false** as the allowed choices for each of the three loan features. A missing value remains unknown, not false.

That completes the fixed-choice and missing-value pass for the fields captured so far: no allowed lists were confirmed for the five payment-term text fields; the numeric rate and ratio scales remain unknown; and only the prepayment-penalty period was identified as a field that must be usable for its review to pass, **once the right terms are found**. The loan-specific lookup, designation, approval, and timeliness gaps remain open.

Is that an accurate recap before we define the verification rules?

### Turn 94 — persona

Yes, that’s accurate **for the fields we’ve examined**. The prepayment-penalty period is the only field in that pass whose usable value is required to confirm its review, once the applicable terms can be found. The other checks have required **links and records**, which we should address in the verification rules.

The loan-specific lookups, designation source, approval evidence, rate and ratio scales, and payment-timeliness comparison remain open.

### Turn 95 — app-user

Yes, that’s accurate **for the fields we’ve examined**. The prepayment-penalty period is the only field in that pass whose usable value is required to confirm its review, once the applicable terms can be found. The other checks have required **links and records**, which we should address in the verification rules.

The loan-specific lookups, designation source, approval evidence, rate and ratio scales, and payment-timeliness comparison remain open.

### Turn 95 — app-assistant

The field requirements are confirmed for the fields examined. Next I’ll define rules for the required **links and records**, without treating the open sources as resolved.

For **loan setup readiness**, is this the complete pass condition: the loan links to the correct Borrower and Lender; it has a confirmed applicable fixed- or variable-rate link; and, when that link shows it bears interest, the loan links to its Interest obligation and InterestPaymentTerms governs that same obligation? Is any part of that condition misstated?

### Turn 95 — persona

That’s the pass condition we’ve been using. Confirm the loan’s borrower and lender, verify its applicable fixed or variable interest-rate link, then verify that interest payment terms govern the **interest obligation linked to that same loan**. Terms governing a different interest obligation would not pass.

If the rate link cannot be verified, don’t infer the loan is interest-free or confirm readiness. This check does not require every date, frequency, or numeric rate value to be populated.

### Turn 96 — app-user

That’s the pass condition we’ve been using. Confirm the loan’s borrower and lender, verify its applicable fixed or variable interest-rate link, then verify that interest payment terms govern the **interest obligation linked to that same loan**. Terms governing a different interest obligation would not pass.

If the rate link cannot be verified, don’t infer the loan is interest-free or confirm readiness. This check does not require every date, frequency, or numeric rate value to be populated.

### Turn 96 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 96 — app-assistant

I’ve recorded the readiness rule against those links. It requires terms governing the **same loan’s** interest obligation; it does not require every term field or the numeric rate value to be populated.

For **collateral-support verification**, should the rule require both (1) independent confirmation that the particular loan is designated secured and (2) verification that its **collateralizedBy** link points to the correct Collateral? The designation source is still unknown, so this would define the condition without claiming the agent can yet select eligible loans.

### Turn 96 — persona

Yes, with that distinction. The check takes a loan **already identified as secured**; it then verifies that the loan’s collateral link points to the correct pledged collateral. The secured designation determines whether this check applies, while the collateral link is what the check verifies.

Because the source of a particular loan’s designation is still unknown, you can define the condition, but you cannot yet have the agent select secured loans independently. A guarantee does not substitute for the collateral link in this check.

### Turn 97 — app-user

Yes, with that distinction. The check takes a loan **already identified as secured**; it then verifies that the loan’s collateral link points to the correct pledged collateral. The secured designation determines whether this check applies, while the collateral link is what the check verifies.

Because the source of a particular loan’s designation is still unknown, you can define the condition, but you cannot yet have the agent select secured loans independently. A guarantee does not substitute for the collateral link in this check.

### Turn 97 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 97 — app-assistant

I’ve recorded the collateral-link condition, but **not** a rule claiming the agent can identify secured loans: that designation has no confirmed source. For a loan supplied as secured, the check can test its link to the correct Collateral; a guarantee cannot substitute.

For the **variable-rate setup** rule, should passing require a loan supplied for variable-rate review to have both a verified **hasInterestRate → VariableInterestRate** link and a verified **hasSchedule → InterestRateResetSchedule** link, with neither link alone sufficient?

### Turn 97 — persona

Yes. For a loan supplied for **variable-rate review**, confirm both its link to the applicable **variable interest rate** and its separate link to an **interest rate reset schedule**. Neither link alone passes the check, and a missing variable-rate link must not be taken as proof that the loan is fixed-rate.

### Turn 98 — app-user

Yes. For a loan supplied for **variable-rate review**, confirm both its link to the applicable **variable interest rate** and its separate link to an **interest rate reset schedule**. Neither link alone passes the check, and a missing variable-rate link must not be taken as proof that the loan is fixed-rate.

### Turn 98 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 98 — app-assistant

I’ve recorded both required links for variable-rate setup. Neither alone passes, and a missing variable-rate link does not establish a fixed rate.

For **payment-record completeness**, should the rule require a verified **Loan → PaymentHistory** link and at least one **PaymentHistory → PaymentTransaction** entry, without making any claim about whether a payment was due or timely?

### Turn 98 — persona

Yes. Confirm that the loan has a payment history and that the history contains **at least one individual payment transaction**. An empty history does not pass. This is a record-completeness check only; it says nothing about whether a payment was due or made on time.

### Turn 99 — app-user

Yes. Confirm that the loan has a payment history and that the history contains **at least one individual payment transaction**. An empty history does not pass. This is a record-completeness check only; it says nothing about whether a payment was due or made on time.

### Turn 99 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 99 — app-assistant

I’ve recorded the completeness rule: the history must exist **and contain at least one transaction**. It makes no timeliness claim.

For **prepayment-penalty review**, we know a usable PrepaymentTerms.prepaymentPenaltyPeriod is required, but the loan-to-terms lookup is open. Should the rule be written as a condition **only after the applicable PrepaymentTerms for the loan has been independently supplied**, with no claim that the model can find it?

### Turn 99 — persona

Yes. Write it as a **conditional check**: once the applicable prepayment terms for that loan have been independently identified, confirm that they contain a usable penalty period in months.

That defines what the review verifies, but not how the agent finds the terms. Until that lookup is established, the review is **not executable end to end for a particular loan**. A missing period also does not prove that no penalty applies.

### Turn 100 — app-user

Yes. Write it as a **conditional check**: once the applicable prepayment terms for that loan have been independently identified, confirm that they contain a usable penalty period in months.

That defines what the review verifies, but not how the agent finds the terms. Until that lookup is established, the review is **not executable end to end for a particular loan**. A missing period also does not prove that no penalty applies.

### Turn 100 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 100 — app-assistant

I’ve recorded the prepayment rule as **conditional**: independently identify the applicable PrepaymentTerms, then verify a usable penalty period in months. It does not supply the missing lookup, so the review is not executable end to end for a particular loan.

The five verification rules are now captured: readiness, collateral link, variable-rate setup, payment-record completeness, and conditional prepayment timing. None establishes approval, payment timeliness, or a missing designation source. Is that an accurate rule-pass recap before we specify what each action changes and how its result is checked?

### Turn 100 — persona

Yes. Those five rules define what each check must verify, while keeping the unresolved inputs visible—particularly the secured-loan designation and the lookup for applicable prepayment terms. They do not establish approval or payment timeliness.

We can now specify each action’s confirmation result and the evidence retained for it without implying that the action changes the loan’s terms or payments.

### Turn 101 — app-user

Yes. Those five rules define what each check must verify, while keeping the unresolved inputs visible—particularly the secured-loan designation and the lookup for applicable prepayment terms. They do not establish approval or payment timeliness.

We can now specify each action’s confirmation result and the evidence retained for it without implying that the action changes the loan’s terms or payments.

### Turn 101 — app-assistant

The rules are confirmed. To specify the actions without implying that they change loan terms or payments, I need to establish where their results live.

For **loan setup readiness**, is its “confirmed” result recorded on the Loan, or is it a result returned by the check without a stored Loan field? How is that result verified afterward?

### Turn 101 — persona

There’s no specified **readiness field on the loan**. The action confirms the check’s result; we shouldn’t invent a stored loan status for it.

To verify the result afterward, inspect the loan’s borrower and lender links, its applicable interest-rate link, and the interest payment terms governing that same loan’s interest obligation. How a system retains the check result itself hasn’t been established.

### Turn 102 — app-user

There’s no specified **readiness field on the loan**. The action confirms the check’s result; we shouldn’t invent a stored loan status for it.

To verify the result afterward, inspect the loan’s borrower and lender links, its applicable interest-rate link, and the interest payment terms governing that same loan’s interest obligation. How a system retains the check result itself hasn’t been established.

### Turn 102 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 102 — app-assistant

I’ve recorded **checkLoanSetupReadiness** as a Loan-targeted confirmation that changes no loan terms and assumes no stored readiness field. Its result can be checked by reinspecting the links you named; how a system retains the confirmation remains open.

An automated consistency check flagged one navigation gap: from Loan, the recorded link reaches Interest, but **InterestPaymentTerms → governsPaymentOf → Interest** points toward that obligation. It cannot tell whether the agent can search that link in reverse. How does the agent find the terms governing the loan’s identified Interest obligation in practice?

### Turn 102 — persona

Start with the **interest obligation linked to the loan**, then find interest payment terms whose “governs payment of” connection points to **that same obligation**. The connection runs from the terms to the interest; I would not add a second link in the opposite direction.

Whether the agent’s source can search that connection by its target is an implementation question we haven’t confirmed. If it cannot, loan setup readiness cannot be verified end to end from the loan alone until that lookup is provided.

### Turn 103 — app-user

Start with the **interest obligation linked to the loan**, then find interest payment terms whose “governs payment of” connection points to **that same obligation**. The connection runs from the terms to the interest; I would not add a second link in the opposite direction.

Whether the agent’s source can search that connection by its target is an implementation question we haven’t confirmed. If it cannot, loan setup readiness cannot be verified end to end from the loan alone until that lookup is provided.

### Turn 103 — app-assistant

The intended path is clear: start at the loan’s Interest obligation, then find InterestPaymentTerms whose **governsPaymentOf** link points to that same obligation. I won’t add a reverse link. The automated warning remains a real operational gap: until target-based lookup is confirmed, readiness cannot be verified end to end from a Loan alone.

For **collateral-support verification**, is its confirmation stored anywhere, or only returned by the check? What recorded link would someone reinspect to verify the result?

### Turn 103 — persona

There’s no specified field storing a **collateral-support confirmation** on the loan. The check can return a confirmation, but how that result is retained hasn’t been established.

To verify it afterward, reinspect the **secured loan’s link to the correct pledged collateral**. That does not by itself resolve how the loan was identified as secured, and this check does not verify a security agreement or guarantee.

### Turn 104 — app-user

There’s no specified field storing a **collateral-support confirmation** on the loan. The check can return a confirmation, but how that result is retained hasn’t been established.

To verify it afterward, reinspect the **secured loan’s link to the correct pledged collateral**. That does not by itself resolve how the loan was identified as secured, and this check does not verify a security agreement or guarantee.

### Turn 104 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 104 — app-assistant

I’ve recorded **verifyCollateralSupport** as a Loan-targeted check with no assumed stored result. Verification rechecks the correct collateral link; the source of the loan’s secured designation remains open.

For **variable-rate setup review**, is its confirmation likewise returned without a specified stored field, and should verification reinspect both the loan’s variable-rate link and its separate reset-schedule link?

### Turn 104 — persona

Yes. There’s no specified stored **variable-rate setup** field on the loan; the check confirms its result without changing the loan’s terms. To verify it afterward, reinspect **both** the loan’s link to the applicable variable interest rate and its separate link to the interest rate reset schedule. Either link alone is insufficient.

### Turn 105 — app-user

Yes. There’s no specified stored **variable-rate setup** field on the loan; the check confirms its result without changing the loan’s terms. To verify it afterward, reinspect **both** the loan’s link to the applicable variable interest rate and its separate link to the interest rate reset schedule. Either link alone is insufficient.

### Turn 105 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 105 — app-assistant

I’ve recorded **reviewVariableRateSetup** with both links required for confirmation and verification; it changes no terms and assumes no stored result.

For **payment-record completeness**, is its confirmation also returned without a specified stored field, with verification following Loan → PaymentHistory → at least one PaymentTransaction?

### Turn 105 — persona

Yes. There’s no specified completeness field on the loan. Confirm the check only after following the loan to its payment history and finding **at least one individual payment transaction** in that history. The same path verifies the result afterward.

It confirms that payment entries are recorded, not that payments were due or timely. How the confirmation itself is retained remains unspecified.

### Turn 106 — app-user

Yes. There’s no specified completeness field on the loan. Confirm the check only after following the loan to its payment history and finding **at least one individual payment transaction** in that history. The same path verifies the result afterward.

It confirms that payment entries are recorded, not that payments were due or timely. How the confirmation itself is retained remains unspecified.

### Turn 106 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 106 — app-assistant

I’ve recorded **checkPaymentRecordCompleteness** against the history and at least one transaction. It asserts neither that a payment was due nor that it was timely.

For **prepayment-penalty timing**, once someone independently supplies the applicable PrepaymentTerms for a Loan, is the result returned without a specified stored field? Should verification reread that terms record’s **prepaymentPenaltyPeriod** in months, while marking the loan-to-terms lookup unresolved?

### Turn 106 — persona

Yes. Given the **loan** and independently identified **applicable prepayment terms**, the check can confirm that those terms contain a usable penalty period in months. Verification rereads that period on the supplied terms record.

There’s no specified stored confirmation field, and we still lack a confirmed way to find the terms from the loan. Until that lookup is established, don’t present the review as executable end to end from a loan alone.

### Turn 107 — app-user

Yes. Given the **loan** and independently identified **applicable prepayment terms**, the check can confirm that those terms contain a usable penalty period in months. Verification rereads that period on the supplied terms record.

There’s no specified stored confirmation field, and we still lack a confirmed way to find the terms from the loan. Until that lookup is established, don’t present the review as executable end to end from a loan alone.

### Turn 107 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 107 — app-assistant

I’ve recorded the prepayment review as **conditional**: given a Loan and independently identified applicable PrepaymentTerms, it verifies the period in months. It does not change the loan or assume a stored confirmation.

The automated check flags that **Loan has no path to PrepaymentTerms**, so this action is not executable end to end from its Loan input. The earlier readiness warning also remains: we have not confirmed whether terms can be found by searching for their link to the loan’s Interest obligation. Neither warning is resolved by the conditional wording.

We can’t yet treat the actions as fully covered or move to the expansion and final checks. For the readiness gap, can the source used by the agent search **InterestPaymentTerms.governsPaymentOf** by a specified Interest obligation, or is that capability still unconfirmed?

### Turn 107 — persona

That search capability is **still unconfirmed**. The terms-to-interest connection tells us which obligation the terms govern, but it does not establish that the agent’s source can look up terms by supplying an interest obligation.

So I would keep readiness **not executable end to end from a loan alone** until that target-based lookup is confirmed. I wouldn’t add a reverse connection just to make the check appear complete.

### Turn 108 — app-user

That search capability is **still unconfirmed**. The terms-to-interest connection tells us which obligation the terms govern, but it does not establish that the agent’s source can look up terms by supplying an interest obligation.

So I would keep readiness **not executable end to end from a loan alone** until that target-based lookup is confirmed. I wouldn’t add a reverse connection just to make the check appear complete.

### Turn 108 — app-assistant

That confirms the readiness lookup is **unresolved**. I won’t add a reverse connection or present the check as executable from a Loan alone. The prepayment review also remains conditional because its loan-to-terms lookup is missing. The action pass is therefore not complete.

There’s a similar question for collateral support: starting with the Collateral linked to a Loan, can the agent find **SecurityAgreements whose `secures` link points to that Collateral**, or is searching that connection by its target also unconfirmed?

### Turn 108 — persona

Searching **security agreements by the collateral they secure is also unconfirmed**. The recorded connection points from a security agreement to collateral; it does not establish that the agent can look up agreements by supplying the collateral as the target. I wouldn’t add a reverse link by inference.

That gap affects the question **“What security agreement supports this collateral?”** It does **not** block the defined collateral-support check, which only reinspects the secured loan’s link to the correct collateral.

### Turn 109 — app-user

Searching **security agreements by the collateral they secure is also unconfirmed**. The recorded connection points from a security agreement to collateral; it does not establish that the agent can look up agreements by supplying the collateral as the target. I wouldn’t add a reverse link by inference.

That gap affects the question **“What security agreement supports this collateral?”** It does **not** block the defined collateral-support check, which only reinspects the secured loan’s link to the correct collateral.

### Turn 109 — app-assistant

The SecurityAgreement-to-Collateral link tells us what an agreement secures, but it does not establish that the agent can find agreements by starting with collateral. I’ll keep that question partly covered. This does **not** block the collateral-support action, which checks only the Loan-to-Collateral link.

For the separate question about **principal repayment terms**, is searching `PrincipalRepaymentTerms.governsPaymentOf` by the Loan’s linked Principal obligation confirmed, or is that target-based lookup also unknown?

### Turn 109 — persona

That target-based lookup is **also unconfirmed**. We know principal repayment terms point to the principal obligation they govern, but we haven’t established that the agent can search for those terms starting from the loan’s linked principal.

So the agent can identify the loan’s principal and inspect terms once supplied, but it cannot yet reliably retrieve the applicable principal repayment terms from the loan alone. I wouldn’t add an inverse link to paper over that gap.

### Turn 110 — app-user

That target-based lookup is **also unconfirmed**. We know principal repayment terms point to the principal obligation they govern, but we haven’t established that the agent can search for those terms starting from the loan’s linked principal.

So the agent can identify the loan’s principal and inspect terms once supplied, but it cannot yet reliably retrieve the applicable principal repayment terms from the loan alone. I wouldn’t add an inverse link to paper over that gap.

### Turn 110 — app-assistant

The principal-terms lookup is unconfirmed too. From a Loan, the agent can find its Principal obligation, but it cannot yet reliably find the terms that govern it; I won’t add an inverse link. The relationship and action passes remain incomplete, alongside the readiness, prepayment, and security-agreement lookup gaps.

For the **conditional prepayment review**, when applicable PrepaymentTerms are independently supplied, is there a confirmed way to verify that they belong to the **particular Loan** being checked, or is that matching step also unresolved?

### Turn 110 — persona

That matching step is **unresolved**. The supplied prepayment terms contain the penalty period, but we have no confirmed connection or lookup that proves they apply to the particular loan.

The agent can check the period on the supplied terms; it cannot independently confirm the **loan-specific prepayment review** until their applicability to that loan is established.

### Turn 111 — app-user

That matching step is **unresolved**. The supplied prepayment terms contain the penalty period, but we have no confirmed connection or lookup that proves they apply to the particular loan.

The agent can check the period on the supplied terms; it cannot independently confirm the **loan-specific prepayment review** until their applicability to that loan is established.

### Turn 111 — app-tool

✓ Applied: 0 added, 2 updated.

### Turn 111 — app-assistant

I’ve corrected the prepayment rule and action: they can verify the **period on supplied PrepaymentTerms**, but they cannot confirm a **loan-specific** review because there is no established way to prove those terms apply to that Loan.

The model is being left **known-incomplete**, not ready for end-to-end validation. The unresolved items are:

- Finding and matching PrepaymentTerms and AccruedInterest for a particular Loan.
- Finding interest and principal repayment terms by the obligation they govern, and finding a SecurityAgreement by its Collateral; target-based search is unconfirmed.
- Identifying a particular loan’s secured designations and a facility’s secured status.
- Establishing evidence of approved principal and approved credit limit.
- Establishing transaction dates, due dates, and a method for deciding payment timeliness.
- Confirming how check results are retained, and the storage scales of rates and ratios.

The five check actions do not change terms or payments. In particular, **setup readiness and the loan-specific prepayment review cannot yet be verified end to end**. I have not treated any of these open items as solved by adding an inferred link.

### Turn 111 — persona

That’s a fair account of where we stand. Keep the open items visible and don’t mark the model ready for end-to-end use.

### Turn 112 — app-user

That’s a fair account of where we stand. Keep the open items visible and don’t mark the model ready for end-to-end use.

### Turn 112 — app-assistant

The model remains **known-incomplete and not ready for end-to-end use**. The open items remain: loan-specific terms and accrued-interest lookups; target-based searches for governing terms and security agreements; loan and facility secured-status sources; approval evidence; payment dates and timeliness method; check-result retention; and rate and ratio scales. I won’t infer missing links or mark the affected checks as executable.

### Turn 112 — harness

Before we close, one more systematic pass, to catch what we have not talked about yet.

Call get_graph_state first and treat it as the source of truth for what is already on the canvas. Then go through every class on the canvas, three to five classes per question, and ask me, for each one, what exists around it in our work: its subordinate parts or components; its states or lifecycle events; the actors or parties responsible for it; its inputs and outputs; related documents or agreements; measurements or characteristic values it carries; earlier or later stages of a workflow it belongs to; more specific or sibling kinds of the same thing; and which of the properties already confirmed on a sibling class also apply to it. Skip the categories that plainly do not fit a class.

Ask these as open questions about what exists, not about what the agent needs: do not limit a question to what the recorded competency questions or actions require, and do not ask me to mention only what is needed. Only once I have answered, check each thing I named against the competency questions and actions, exactly as you would any other candidate, and add only what passes; nothing is added only because it was mentioned. Keep a running list of the candidates and close each one as added, declined (with the reason) or left open; none may silently disappear.

When every class in this pass has been asked about and every candidate is closed, end that message with one line in exactly this form, and ask nothing further in it:
COVERAGE LEDGER: surfaced=<number>; added=<number>; declined=<number>; open=<number>

### Turn 113 — app-user

Before we close, one more systematic pass, to catch what we have not talked about yet.

Call get_graph_state first and treat it as the source of truth for what is already on the canvas. Then go through every class on the canvas, three to five classes per question, and ask me, for each one, what exists around it in our work: its subordinate parts or components; its states or lifecycle events; the actors or parties responsible for it; its inputs and outputs; related documents or agreements; measurements or characteristic values it carries; earlier or later stages of a workflow it belongs to; more specific or sibling kinds of the same thing; and which of the properties already confirmed on a sibling class also apply to it. Skip the categories that plainly do not fit a class.

Ask these as open questions about what exists, not about what the agent needs: do not limit a question to what the recorded competency questions or actions require, and do not ask me to mention only what is needed. Only once I have answered, check each thing I named against the competency questions and actions, exactly as you would any other candidate, and add only what passes; nothing is added only because it was mentioned. Keep a running list of the candidates and close each one as added, declined (with the reason) or left open; none may silently disappear.

When every class in this pass has been asked about and every candidate is closed, end that message with one line in exactly this form, and ask nothing further in it:
COVERAGE LEDGER: surfaced=<number>; added=<number>; declined=<number>; open=<number>

### Turn 113 — app-tool

🔍 Checked the current ontology state.

### Turn 113 — app-assistant

I checked the live canvas first. It has **27 classes, 33 recorded questions, and five actions**. Two action-navigation warnings remain: finding InterestPaymentTerms from a Loan, and matching PrepaymentTerms to a Loan. I’ll keep those and the other known gaps open.

I’ll work through every class in small groups, keep a running ledger of anything new you name, and test each candidate against the agreed questions and actions **after** you answer. Nothing will be added just because it exists.

Starting with **Loan, CreditFacility, CreditAgreement, and SubFacility**: for each, what else exists around it in your work—relevant parts, changes over time, responsible parties, inputs or outputs, related agreements, characteristic values, workflow stages, or more specific or sibling kinds? Which fields already recorded on one of these arrangements also occur on another? Mention what exists even if we have not established a need for the agent to use it.

### Turn 113 — persona

Here’s what I’d add to the ledger for those four, without treating any of it as a new agent requirement yet:

- **Loan:** We distinguish secured and unsecured loans; a secured loan may be collateralized or guaranteed. A loan can also record whether it is assumable or initially payable, plus total closing costs and total points and fees. Beyond the payment and reset schedules already discussed, it can have an **interest calculation schedule** and an **initial interest-rate setting event**. Neither creates a new workflow stage by itself.
- **Credit facility:** A **revolving line of credit** permits repeated draws and repayments. Facilities can also be **committed**—a confirmed source of financing subject to the agreement’s conditions—or **uncommitted**. A facility can record a **maximum advance amount** in addition to its limit, extended amount, and available amount.
- **Credit agreement:** **Open-end credit** permits borrowing up to an agreed limit and paying down during the line’s period; **closed-end credit** does not permit the principal to increase after full funding at closing. A credit agreement can record a **debt amount**. Those are distinctions about the agreement, not extra workflow stages.
- **Sub-facility:** A portion of a facility can itself be **committed** or **uncommitted**. A committed portion may be associated with specific collateral, but we have not established a link the agent can follow from it to that collateral.

For shared values, **initial exchange date** and **maturity date** occur on both a loan and a credit agreement; a facility has them as a kind of credit agreement. **Credit limit** occurs on a facility and on open-end credit. Loans, credit agreements, and facilities each identify their borrower and lender directly.

I don’t have a recorded sequence of workflow stages for these arrangements, or a confirmed loan-to-facility link to add.

### Turn 114 — app-user

Here’s what I’d add to the ledger for those four, without treating any of it as a new agent requirement yet:

- **Loan:** We distinguish secured and unsecured loans; a secured loan may be collateralized or guaranteed. A loan can also record whether it is assumable or initially payable, plus total closing costs and total points and fees. Beyond the payment and reset schedules already discussed, it can have an **interest calculation schedule** and an **initial interest-rate setting event**. Neither creates a new workflow stage by itself.
- **Credit facility:** A **revolving line of credit** permits repeated draws and repayments. Facilities can also be **committed**—a confirmed source of financing subject to the agreement’s conditions—or **uncommitted**. A facility can record a **maximum advance amount** in addition to its limit, extended amount, and available amount.
- **Credit agreement:** **Open-end credit** permits borrowing up to an agreed limit and paying down during the line’s period; **closed-end credit** does not permit the principal to increase after full funding at closing. A credit agreement can record a **debt amount**. Those are distinctions about the agreement, not extra workflow stages.
- **Sub-facility:** A portion of a facility can itself be **committed** or **uncommitted**. A committed portion may be associated with specific collateral, but we have not established a link the agent can follow from it to that collateral.

For shared values, **initial exchange date** and **maturity date** occur on both a loan and a credit agreement; a facility has them as a kind of credit agreement. **Credit limit** occurs on a facility and on open-end credit. Loans, credit agreements, and facilities each identify their borrower and lender directly.

I don’t have a recorded sequence of workflow stages for these arrangements, or a confirmed loan-to-facility link to add.

### Turn 114 — app-assistant

For these four, I’ve noted the existing distinctions and links separately from the new candidates. The new candidates are Loan’s assumable and initially-payable details, closing costs, points and fees, interest-calculation schedule, and initial rate-setting event; the facility’s revolving, commitment, and maximum-advance details; the agreement’s open-/closed-end distinction and debt amount; and the sub-facility’s commitment distinction. The possible sub-facility–collateral connection remains **open, not recorded**. No workflow stages or Loan-to-CreditFacility link were confirmed.

None of those candidates has been added. I’ll test each against the recorded questions and actions after the coverage pass, and keep it on the ledger until it is added, declined with a reason, or left open.

Next, for **Borrower, Lender, Servicer, and Collateral**: what exists around each in your work—relevant responsibilities or parties, related records or agreements, changes over time, measurements, or more specific kinds? Are there fields confirmed on a related class that also occur on any of these four?

### Turn 114 — persona

Here’s what belongs on the ledger for this group:

- **Borrower:** The borrower owes repayment under the loan or agreement. A **borrowing-capacity assessment** can record the amount the lender believes that borrower can repay; it is distinct from a facility’s available amount.
- **Lender:** The lender provides the credit and expects repayment. The loan identifies its lender directly, even when a separate servicer collects payments.
- **Servicer:** The servicer collects principal and interest payments on the lender’s behalf. The loan identifies its servicer directly; we have not established a separate servicer-to-lender link.
- **Collateral:** Pledged collateral can have multiple **dated appraised values** as values change. A security agreement secures the collateral. A **credit enhancement agreement** is another related agreement: it governs an exchange of collateral to mitigate counterparty credit risk and identifies a **beneficiary** of that support. I would not treat that as a newly confirmed path from a particular loan to a credit enhancement agreement.

I don’t have another confirmed field shared between these four and the related records. In particular, the dated value is on the collateral-value record, while the two loan-to-value measures belong to a collateralized loan—not to the collateral itself.

### Turn 115 — app-user

Here’s what belongs on the ledger for this group:

- **Borrower:** The borrower owes repayment under the loan or agreement. A **borrowing-capacity assessment** can record the amount the lender believes that borrower can repay; it is distinct from a facility’s available amount.
- **Lender:** The lender provides the credit and expects repayment. The loan identifies its lender directly, even when a separate servicer collects payments.
- **Servicer:** The servicer collects principal and interest payments on the lender’s behalf. The loan identifies its servicer directly; we have not established a separate servicer-to-lender link.
- **Collateral:** Pledged collateral can have multiple **dated appraised values** as values change. A security agreement secures the collateral. A **credit enhancement agreement** is another related agreement: it governs an exchange of collateral to mitigate counterparty credit risk and identifies a **beneficiary** of that support. I would not treat that as a newly confirmed path from a particular loan to a credit enhancement agreement.

I don’t have another confirmed field shared between these four and the related records. In particular, the dated value is on the collateral-value record, while the two loan-to-value measures belong to a collateralized loan—not to the collateral itself.

### Turn 115 — app-assistant

I’ve added **borrowing-capacity assessment**, **credit enhancement agreement**, and its **beneficiary** to the candidate ledger—not the ontology. The direct Loan-to-Lender and Loan-to-Servicer links, multiple dated collateral values, and SecurityAgreement-to-Collateral link are already captured. I have not inferred a Servicer-to-Lender or Loan-to-credit-enhancement link.

Next, for **SecurityAgreement, PaymentHistory, PaymentTransaction, and AmortizationSchedule**: what else exists around each in your work—relevant parties or supporting records, entries or component parts, changes over time, characteristic values, or related schedule kinds? Are any fields already confirmed elsewhere also recorded on one of these four?

### Turn 115 — persona

Here’s what I’d note for this group, without adding it to the agent’s scope yet:

- **Security agreement:** It grants an interest in the collateral it secures and sets out rights and duties concerning that collateral. We have not established a direct link from the agreement to a particular loan.
- **Payment history:** It contains actual individual payments, rather than payments scheduled to be made. We haven’t established another component record or a timeliness field on the history.
- **Individual payment transaction:** An entry can be a payment toward principal, interest, fees, or another related amount. We also distinguish actual **principal-payment** and **interest-payment events**, but have not established an extra link from a transaction to either event—or a transaction-date field.
- **Amortization schedule:** It shows how periodic payments change the debt balance. It can record an **anticipated number of payments**; that same kind of numeric field also occurs on the loan payment, principal payment, and interest payment schedules. Full, partial, and negative amortization are related ways a debt can amortize, not three new fields on this schedule.

An **explicit contract-event schedule** is another related schedule kind: it records actual contractual dates and events, which can include payment and rate-reset events. We haven’t established that a particular loan links to one.

### Turn 116 — app-user

Here’s what I’d note for this group, without adding it to the agent’s scope yet:

- **Security agreement:** It grants an interest in the collateral it secures and sets out rights and duties concerning that collateral. We have not established a direct link from the agreement to a particular loan.
- **Payment history:** It contains actual individual payments, rather than payments scheduled to be made. We haven’t established another component record or a timeliness field on the history.
- **Individual payment transaction:** An entry can be a payment toward principal, interest, fees, or another related amount. We also distinguish actual **principal-payment** and **interest-payment events**, but have not established an extra link from a transaction to either event—or a transaction-date field.
- **Amortization schedule:** It shows how periodic payments change the debt balance. It can record an **anticipated number of payments**; that same kind of numeric field also occurs on the loan payment, principal payment, and interest payment schedules. Full, partial, and negative amortization are related ways a debt can amortize, not three new fields on this schedule.

An **explicit contract-event schedule** is another related schedule kind: it records actual contractual dates and events, which can include payment and rate-reset events. We haven’t established that a particular loan links to one.

### Turn 116 — app-assistant

I’ve noted these candidates for later testing: principal- and interest-payment events, anticipated payment count on four schedule types, full/partial/negative amortization distinctions, and an explicit contract-event schedule. They are **not added**. The proposed transaction-to-event and loan-to-contract-event-schedule paths remain unconfirmed; transaction dates and payment timeliness remain open.

Next, for **PrincipalPaymentSchedule, InterestPaymentSchedule, LoanPaymentSchedule, and InterestRateResetSchedule**: what other parts, dated events, characteristic values, or related schedule kinds exist around each? Besides the anticipated payment count you just mentioned, which fields confirmed on a sibling schedule also occur on any of these four?

### Turn 116 — persona

- **Principal payment schedule:** It sets out when some or all principal is due. Actual principal-payment events are different from scheduled dues; we haven’t established a link from this schedule to those events.
- **Interest payment schedule:** It sets out when interest is due. Actual interest-payment events are separate, with no confirmed schedule-to-event link.
- **Loan payment schedule:** It’s the broader regular or explicit schedule for the loan’s account. It does not replace either of the more specific payment schedules.
- **Interest rate reset schedule:** It sets out when resets and the resulting rates are recalculated. An actual interest-rate reset is a related event, but we haven’t established a link from the schedule to individual reset events.

The **anticipated number of payments** is recorded on the first three schedules here, as well as on the amortization schedule. I don’t have that field confirmed on the reset schedule, or another field shared across these four. An interest calculation schedule is another loan-linked schedule; it concerns when interest is calculated, rather than when interest is paid.

### Turn 117 — app-user

- **Principal payment schedule:** It sets out when some or all principal is due. Actual principal-payment events are different from scheduled dues; we haven’t established a link from this schedule to those events.
- **Interest payment schedule:** It sets out when interest is due. Actual interest-payment events are separate, with no confirmed schedule-to-event link.
- **Loan payment schedule:** It’s the broader regular or explicit schedule for the loan’s account. It does not replace either of the more specific payment schedules.
- **Interest rate reset schedule:** It sets out when resets and the resulting rates are recalculated. An actual interest-rate reset is a related event, but we haven’t established a link from the schedule to individual reset events.

The **anticipated number of payments** is recorded on the first three schedules here, as well as on the amortization schedule. I don’t have that field confirmed on the reset schedule, or another field shared across these four. An interest calculation schedule is another loan-linked schedule; it concerns when interest is calculated, rather than when interest is paid.

### Turn 117 — app-assistant

I’ve noted the **actual rate-reset event** as another candidate. You confirmed the anticipated payment count for the four payment and amortization schedules, but **not** for the reset schedule. The interest-calculation schedule remains a candidate; no Loan-to-schedule link has been added. The actual payment events are still distinct from scheduled dues, with no confirmed links between them.

Next, for **FixedInterestRate, VariableInterestRate, PrincipalRepaymentTerms, and InterestPaymentTerms**: what else exists around each in your work—rate-setting events, components of the terms, changes over time, related records, or characteristic values? Do any fields already confirmed on one of these four also occur on another?

### Turn 117 — persona

Here’s what I’d keep on the candidate ledger for these four:

- **Fixed interest rate:** Its numeric rate stays unchanged over the loan’s life. An initial interest-rate setting event may establish the loan’s starting rate, but we have not established a link from that event to the fixed-rate record.
- **Variable interest rate:** Its numeric rate can change. A **floating rate** is based on an index or benchmark; a **managed rate** is set from time to time by the institution rather than by a prescribed margin over a base rate. The loan’s reset schedule is linked to the loan separately, not through the rate record.
- **Principal repayment terms:** These govern payment of principal. **Prepayment terms** are a more specific kind concerning repayment before maturity, with a penalty period in months when recorded. That distinction still does not give us a confirmed way to find the prepayment terms for a particular loan.
- **Interest payment terms:** These govern payment of interest and can specify a **day-count convention** as the basis for calculating accrual. They record the initial accrual date, initial and final interest payment dates, payment frequency and day, and compounding frequency. Interest being calculated is distinct from interest being paid.

**Fixed and variable interest-rate records both carry a numeric rate.** The principal and interest terms both have payment-date, frequency, and payment-day details, but they are separate fields for their respective obligations; compounding frequency belongs to the interest terms. I wouldn’t infer a direct terms-to-schedule or event-to-rate link from these related concepts.

### Turn 118 — app-user

Here’s what I’d keep on the candidate ledger for these four:

- **Fixed interest rate:** Its numeric rate stays unchanged over the loan’s life. An initial interest-rate setting event may establish the loan’s starting rate, but we have not established a link from that event to the fixed-rate record.
- **Variable interest rate:** Its numeric rate can change. A **floating rate** is based on an index or benchmark; a **managed rate** is set from time to time by the institution rather than by a prescribed margin over a base rate. The loan’s reset schedule is linked to the loan separately, not through the rate record.
- **Principal repayment terms:** These govern payment of principal. **Prepayment terms** are a more specific kind concerning repayment before maturity, with a penalty period in months when recorded. That distinction still does not give us a confirmed way to find the prepayment terms for a particular loan.
- **Interest payment terms:** These govern payment of interest and can specify a **day-count convention** as the basis for calculating accrual. They record the initial accrual date, initial and final interest payment dates, payment frequency and day, and compounding frequency. Interest being calculated is distinct from interest being paid.

**Fixed and variable interest-rate records both carry a numeric rate.** The principal and interest terms both have payment-date, frequency, and payment-day details, but they are separate fields for their respective obligations; compounding frequency belongs to the interest terms. I wouldn’t infer a direct terms-to-schedule or event-to-rate link from these related concepts.

### Turn 118 — app-assistant

I’ve added **floating rate**, **managed rate**, and **day-count convention** to the candidate ledger. The initial rate-setting event and prepayment-terms lookup were already on it; neither has gained a confirmed link. The numeric rate is already captured on both rate records, and the separate date, frequency, and payment-day fields are already captured on the respective terms. I won’t infer a terms-to-schedule link.

Next, for **PrepaymentTerms, Principal, Interest, and AccruedInterest**: what else exists around each in your work—related obligations or amounts, changes or events over time, governing records, or characteristic values? Are any already-confirmed fields on a related class also recorded on one of these four?

### Turn 118 — persona

For this group, I’d note:

- **Prepayment terms:** These deal with principal paid before maturity. The penalty period in months is already captured. We still have no confirmed way to match the terms to a particular loan.
- **Principal:** The loan links to its principal obligation, and principal repayment terms govern its payment. Its **outstanding amount** is already captured; an actual principal-payment event is distinct from the obligation and from a scheduled payment.
- **Interest:** The loan links to its interest obligation, and interest payment terms govern its payment. **Interest also has an outstanding amount**, which we haven’t captured as a field yet. Actual interest-payment and interest-calculation events are separate from that obligation.
- **Accrued interest:** This is interest incurred but not yet paid, recorded with an amount and as-of date. **Accrual** is the process of accumulating earned but unpaid interest; it is not another name for the dated accrued-interest amount.

Principal and Interest both have an **outstanding amount** field. Accrued Interest has an amount too, but it is a dated measure, not a field to substitute for Interest’s outstanding amount. None of these distinctions establishes a missing loan-to-accrued-interest or loan-to-prepayment-terms path.

### Turn 119 — app-user

For this group, I’d note:

- **Prepayment terms:** These deal with principal paid before maturity. The penalty period in months is already captured. We still have no confirmed way to match the terms to a particular loan.
- **Principal:** The loan links to its principal obligation, and principal repayment terms govern its payment. Its **outstanding amount** is already captured; an actual principal-payment event is distinct from the obligation and from a scheduled payment.
- **Interest:** The loan links to its interest obligation, and interest payment terms govern its payment. **Interest also has an outstanding amount**, which we haven’t captured as a field yet. Actual interest-payment and interest-calculation events are separate from that obligation.
- **Accrued interest:** This is interest incurred but not yet paid, recorded with an amount and as-of date. **Accrual** is the process of accumulating earned but unpaid interest; it is not another name for the dated accrued-interest amount.

Principal and Interest both have an **outstanding amount** field. Accrued Interest has an amount too, but it is a dated measure, not a field to substitute for Interest’s outstanding amount. None of these distinctions establishes a missing loan-to-accrued-interest or loan-to-prepayment-terms path.

### Turn 119 — app-assistant

I’ve added **Interest’s outstanding amount**, actual interest-calculation events, and **accrual as a process** to the candidate ledger. Principal’s outstanding amount and AccruedInterest’s dated amount are already captured; they must not substitute for Interest’s outstanding amount. The loan-specific AccruedInterest and PrepaymentTerms paths remain open.

That leaves three classes from the canvas: **CollateralValuation, LoanToValueRatio, and CombinedLoanToValueRatio**. For each, what else exists around it in your work—related measurements or dated records, responsible parties, changes over time, or more specific kinds? Do any fields already confirmed on one of these three also occur on another?

### Turn 119 — persona

- **Dated collateral value:** It records an appraised value and the date it applies to. Collateral can have more than one such record as valuations change; we haven’t established an appraiser record or party link.
- **Loan-to-value ratio:** It records a numeric comparison of the collateralized loan’s principal with the collateral’s appraised value.
- **Combined loan-to-value ratio:** It records a separate numeric comparison using all debt secured by the asset or assets, not just that loan’s principal.

The two ratio records each have a numeric **ratio** field. The dated collateral-value record instead has a numeric **value** and an **as-of date**. We haven’t established an as-of-date field on either ratio record, a link from a ratio to a particular appraisal, or a method for recalculating either ratio from the records we have.

### Turn 120 — app-user

- **Dated collateral value:** It records an appraised value and the date it applies to. Collateral can have more than one such record as valuations change; we haven’t established an appraiser record or party link.
- **Loan-to-value ratio:** It records a numeric comparison of the collateralized loan’s principal with the collateral’s appraised value.
- **Combined loan-to-value ratio:** It records a separate numeric comparison using all debt secured by the asset or assets, not just that loan’s principal.

The two ratio records each have a numeric **ratio** field. The dated collateral-value record instead has a numeric **value** and an **as-of date**. We haven’t established an as-of-date field on either ratio record, a link from a ratio to a particular appraisal, or a method for recalculating either ratio from the records we have.

### Turn 120 — app-assistant

That completes the **questioning pass across all 27 classes**. For the last three, the dated appraisal and both ratio values are already captured. I’ve noted—but not added—an appraiser party, ratio as-of dates, ratio-to-appraisal links, and a recalculation method. None has a confirmed source or role in an agreed check yet.

I’ll now close the candidate ledger against the recorded questions and five actions, in small groups. Starting with four **proposed fields**: Loan’s maximum-advance amount, Interest’s outstanding amount, the anticipated payment count on the four schedules, and the day-count convention on InterestPaymentTerms. For each, which **specific agreed question or action** would use it, and what would it let the agent answer or verify? If none uses it, please say so.

### Turn 120 — persona

- **Maximum advance amount:** That belongs to a **credit facility**, not a loan. None of the agreed questions or five checks uses it; the facility question asks for its limit, credit extended, and available amount.
- **Interest’s outstanding amount:** None of the agreed questions asks for it specifically. The question about **accrued but unpaid interest as of a date** concerns the separate accrued-interest record, so this amount cannot fill that gap.
- **Anticipated number of payments:** None of the agreed questions or checks uses the count. Asking *which schedules are on file* does not require reporting how many payments each anticipates.
- **Day-count convention:** This is a **separate record linked from interest payment terms**, not a text field on those terms. It explains the basis for calculating interest accrual, but no agreed question or check asks the agent to verify that basis.

I’d leave all four off the current agent requirements unless you add a question that calls for one.

### Turn 121 — app-user

- **Maximum advance amount:** That belongs to a **credit facility**, not a loan. None of the agreed questions or five checks uses it; the facility question asks for its limit, credit extended, and available amount.
- **Interest’s outstanding amount:** None of the agreed questions asks for it specifically. The question about **accrued but unpaid interest as of a date** concerns the separate accrued-interest record, so this amount cannot fill that gap.
- **Anticipated number of payments:** None of the agreed questions or checks uses the count. Asking *which schedules are on file* does not require reporting how many payments each anticipates.
- **Day-count convention:** This is a **separate record linked from interest payment terms**, not a text field on those terms. It explains the basis for calculating interest accrual, but no agreed question or check asks the agent to verify that basis.

I’d leave all four off the current agent requirements unless you add a question that calls for one.

### Turn 121 — app-assistant

I’ve marked those four candidates **declined for this scope**: CreditFacility maximum advance amount (not a Loan field), Interest’s outstanding amount, anticipated payment count, and a separately linked day-count convention. Each exists in your work, but none serves an agreed question or check. The accrued-interest question cannot be answered using Interest’s outstanding amount. Nothing was added.

Next, for the **Loan** candidates—assumable, initially payable, total closing costs, total points and fees, and an interest-calculation schedule—which agreed question or verification action would use each? If none does, please say so.

### Turn 121 — persona

None of those five is used by an agreed question or by the five verification checks:

- **Assumable** and **initially payable** describe loan features we haven’t asked the agent to report or verify.
- **Total closing costs** and **total points and fees** are recorded amounts, but none of our questions asks for them.
- An **interest calculation schedule** shows when interest is calculated; our schedule question has so far covered loan payments, principal payments, interest payments, amortization, and rate resets. It hasn’t asked for calculation dates.

I’d leave them off the current requirements. The interest calculation schedule remains distinct from the interest payment schedule; declining it doesn’t make them the same thing.

### Turn 122 — app-user

None of those five is used by an agreed question or by the five verification checks:

- **Assumable** and **initially payable** describe loan features we haven’t asked the agent to report or verify.
- **Total closing costs** and **total points and fees** are recorded amounts, but none of our questions asks for them.
- An **interest calculation schedule** shows when interest is calculated; our schedule question has so far covered loan payments, principal payments, interest payments, amortization, and rate resets. It hasn’t asked for calculation dates.

I’d leave them off the current requirements. The interest calculation schedule remains distinct from the interest payment schedule; declining it doesn’t make them the same thing.

### Turn 122 — app-assistant

I’ve marked those five Loan candidates **declined for this scope**, for the reasons you gave. In particular, the interest-calculation schedule stays distinct from the interest-payment schedule even though it is not needed here. Nothing was added.

For the **initial interest-rate setting event**, **actual principal-payment event**, **actual interest-payment event**, and **actual interest-rate reset event**: does any agreed question or check need the agent to identify these as separate records, rather than use the rate, schedules, payment history, and transactions already captured?

### Turn 122 — persona

No. None of the agreed questions or five checks requires the agent to retrieve those four events as separate records.

The **initial rate-setting event** concerns when the starting rate is set, which is different from the rate and its reset schedule. Actual **principal-payment** and **interest-payment events** are distinct from the individual transactions in payment history, but we haven’t established links between them. An actual **rate-reset event** is likewise distinct from the reset schedule; we haven’t established a schedule-to-event link.

I’d leave all four off the current requirements. Doing so does not resolve the open payment-timeliness question or provide evidence that a scheduled reset occurred.

### Turn 123 — app-user

No. None of the agreed questions or five checks requires the agent to retrieve those four events as separate records.

The **initial rate-setting event** concerns when the starting rate is set, which is different from the rate and its reset schedule. Actual **principal-payment** and **interest-payment events** are distinct from the individual transactions in payment history, but we haven’t established links between them. An actual **rate-reset event** is likewise distinct from the reset schedule; we haven’t established a schedule-to-event link.

I’d leave all four off the current requirements. Doing so does not resolve the open payment-timeliness question or provide evidence that a scheduled reset occurred.

### Turn 123 — app-assistant

I’ve marked those four events **declined for this scope**. They remain distinct from the rate, schedules, and payment transactions already modeled; leaving them out does not settle timeliness or prove a reset occurred.

For the arrangement distinctions you surfaced—**revolving line of credit; committed or uncommitted CreditFacility and SubFacility; and open-end or closed-end CreditAgreement**—does any agreed question or check require the agent to identify one of these distinctions separately? For each that does, which question uses it?

### Turn 123 — persona

None of the agreed questions or five checks requires those distinctions to be identified **separately**.

- A **revolving line of credit** is a more specific kind of facility, but the facility questions ask for its recorded amounts and sub-facilities, not whether it has that designation.
- **Committed or uncommitted** status is not needed to list a facility’s sub-facilities or answer the recorded-amount questions.
- **Open-end or closed-end** credit is a distinction about the credit agreement, but no agreed check asks the agent to determine which applies.

I’d leave these as known business distinctions, not add them to the current agent requirements.

### Turn 124 — app-user

None of the agreed questions or five checks requires those distinctions to be identified **separately**.

- A **revolving line of credit** is a more specific kind of facility, but the facility questions ask for its recorded amounts and sub-facilities, not whether it has that designation.
- **Committed or uncommitted** status is not needed to list a facility’s sub-facilities or answer the recorded-amount questions.
- **Open-end or closed-end** credit is a distinction about the credit agreement, but no agreed check asks the agent to determine which applies.

I’d leave these as known business distinctions, not add them to the current agent requirements.

### Turn 124 — app-assistant

I’ve marked those arrangement distinctions **declined for this scope**: revolving line of credit, facility and sub-facility commitment status, and open-/closed-end credit. They do not serve a recorded question or check. This does **not** close the existing secured-loan designation gap, which *does* affect agreed questions and the collateral check.

For four other proposed records or values—**borrowing-capacity assessment, CreditAgreement debt amount, credit enhancement agreement, and its beneficiary**—does any recorded question or verification action require the agent to identify or use each one? If so, which one and how?

### Turn 124 — persona

None of those four is needed for the questions and five checks we’ve agreed:

- A **borrowing-capacity assessment** concerns what the lender believes a borrower can repay; it is not the facility’s available amount.
- A credit agreement’s **debt amount** is not needed to answer its agreed dates or identify its parties.
- A **credit enhancement agreement** and its **beneficiary** concern third-party support, but we have not agreed a question or check that retrieves them.

I’d leave them off the current agent requirements. That does not establish a source for identifying a guaranteed loan.

### Turn 125 — app-user

None of those four is needed for the questions and five checks we’ve agreed:

- A **borrowing-capacity assessment** concerns what the lender believes a borrower can repay; it is not the facility’s available amount.
- A credit agreement’s **debt amount** is not needed to answer its agreed dates or identify its parties.
- A **credit enhancement agreement** and its **beneficiary** concern third-party support, but we have not agreed a question or check that retrieves them.

I’d leave them off the current agent requirements. That does not establish a source for identifying a guaranteed loan.

### Turn 125 — app-assistant

I’ve marked all four **declined for this scope**. They do not answer an agreed question or support a verification check, and leaving out the credit enhancement agreement does not establish how to identify a guaranteed loan. Nothing was added.

For the **explicit contract-event schedule** you mentioned, does the agreed question “Which payment schedules are on file?” require the agent to retrieve it separately, or is it outside the schedules that question covers?

### Turn 125 — persona

It’s **outside the schedules that agreed question covers**. That question calls for the loan payment, principal payment, interest payment, amortization, and rate-reset schedules we’ve discussed; it does not ask for a separate schedule of contractual events.

I’d leave the explicit contract-event schedule off the current requirements. Its existence doesn’t supply the missing payment dates or timeliness comparison.

### Turn 126 — app-user

It’s **outside the schedules that agreed question covers**. That question calls for the loan payment, principal payment, interest payment, amortization, and rate-reset schedules we’ve discussed; it does not ask for a separate schedule of contractual events.

I’d leave the explicit contract-event schedule off the current requirements. Its existence doesn’t supply the missing payment dates or timeliness comparison.

### Turn 126 — app-assistant

I’ve marked the **explicit contract-event schedule** declined for this scope. It is separate from the five schedules covered by the agreed question and does not supply the missing dates for payment timeliness.

For the remaining **kind and process distinctions**—floating versus managed variable rates; full, partial, or negative amortization; and accrual as a process—does any agreed question or check require the agent to identify one of these separately? If so, which one and what would it establish?

### Turn 126 — persona

None needs to be identified as a **separate record or kind** for the agreed questions and checks.

- **Floating versus managed rate:** We need to know whether the loan’s rate is variable and whether it has a reset schedule, not which of these variable-rate kinds applies.
- **Full, partial, or negative amortization:** The agreed feature question uses the loan’s **negative-amortization yes/no value**. It does not require a separate amortization-kind record; nor does it ask us to classify the loan as fully or partially amortizing.
- **Accrual as a process:** The agreed question concerns the **amount of accrued, unpaid interest as of a date**, not the accrual process itself.

Leaving these out does not resolve the open lookup for a particular loan’s accrued-interest record.

### Turn 127 — app-user

None needs to be identified as a **separate record or kind** for the agreed questions and checks.

- **Floating versus managed rate:** We need to know whether the loan’s rate is variable and whether it has a reset schedule, not which of these variable-rate kinds applies.
- **Full, partial, or negative amortization:** The agreed feature question uses the loan’s **negative-amortization yes/no value**. It does not require a separate amortization-kind record; nor does it ask us to classify the loan as fully or partially amortizing.
- **Accrual as a process:** The agreed question concerns the **amount of accrued, unpaid interest as of a date**, not the accrual process itself.

Leaving these out does not resolve the open lookup for a particular loan’s accrued-interest record.

### Turn 127 — app-assistant

I’ve marked floating and managed rates, full and partial amortization, and accrual as a process **declined for this scope**. The agreed negative-amortization question uses the Loan’s existing yes/no field; none of these distinctions closes the accrued-interest lookup gap.

For the collateral-measure candidates—an **appraiser party**, an **as-of date on either ratio**, a **ratio-to-appraisal link**, and a **method for recalculating either ratio**—does an agreed question or check need any of them to report the recorded dated valuation and the two recorded ratios? If so, which one and how?

### Turn 127 — persona

No. To report what’s **recorded**, the agent needs the collateral’s appraised value and its as-of date, plus the two separate ratio values linked to the collateralized loan.

The agreed question does not require an appraiser party, dates on the ratio records, links from ratios to a particular appraisal, or a recalculation method. Without those, the agent should **report the recorded measures**, not claim it has independently recalculated them or confirmed which appraisal was used. The ratios’ numeric storage scale also remains unconfirmed.

### Turn 128 — app-user

No. To report what’s **recorded**, the agent needs the collateral’s appraised value and its as-of date, plus the two separate ratio values linked to the collateralized loan.

The agreed question does not require an appraiser party, dates on the ratio records, links from ratios to a particular appraisal, or a recalculation method. Without those, the agent should **report the recorded measures**, not claim it has independently recalculated them or confirmed which appraisal was used. The ratios’ numeric storage scale also remains unconfirmed.

### Turn 128 — app-assistant

The coverage pass reached **all 27 classes on the live canvas**. I’ve closed the new candidates in the ledger below; none was added merely because it exists in your work.

- **Loan (6):** assumable, initially payable, closing costs, points and fees, interest-calculation schedule, and initial rate-setting event — declined because no agreed question or check uses them.
- **Facility (3):** revolving-line distinction, commitment distinction, and maximum advance amount — declined for the same reason.
- **Agreement (2):** open-/closed-end distinction and debt amount — declined; neither is needed for the agreed agreement questions.
- **Sub-facility (2):** commitment distinction and possible collateral link — declined; listing sub-facilities needs neither, and the link is unconfirmed.
- **Borrower and collateral support (3):** borrowing-capacity assessment, credit enhancement agreement, and beneficiary — declined; none supplies the agreed answers or a source for a guaranteed-loan designation.
- **Payments and schedules (5):** separate principal-payment events, interest-payment events, anticipated payment count, amortization-kind distinctions, and explicit contract-event schedule — declined; the agreed checks use the existing records, schedules, transactions, and Loan feature field.
- **Rate reset (1):** separate actual reset event — declined; no agreed check retrieves it.
- **Rates and terms (2):** floating-/managed-rate distinction and day-count convention — declined; neither is required to answer or verify the agreed rate questions.
- **Interest (3):** Interest’s outstanding amount, separate interest-calculation event, and accrual process — declined; none substitutes for the dated AccruedInterest record.
- **Collateral measures (4):** appraiser party, ratio as-of dates, ratio-to-appraisal links, and ratio recalculation method — declined; the agreed question asks for recorded measures, not an independent recalculation.

These are **31 candidate groups**, counted consistently across the ledger. The previously identified gaps—including secured designations, loan-specific lookups, approval evidence, payment timeliness, and numeric scales—remain open. Closing a *new* candidate as out of scope has not closed any of those gaps, and the model is still not ready for end-to-end use.

COVERAGE LEDGER: surfaced=31; added=0; declined=31; open=0

### Turn 128 — harness

One last pass, on wording: I would like the model to use our own words.

Call get_graph_state first. Then go through what is on the canvas, three to five items per question, relationships first, then properties, then classes:
- for each relationship, ask me what we call this connection ourselves, in one verb phrase, and which way round we would say it;
- for each property and each class, ask me whether that is what we would call it, or whether we have our own term for it.

Record each answer with the rename_ontology_elements tool: a relationship takes my verb phrase, and if I state it the other way round it is turned round (reverse: true); a property or a class takes my term. Previous names of classes and relationships are kept as aliases automatically. Where I say the current name is already right, leave it as it is. Do not add or remove anything in this pass.

When every relationship, property and class has been asked about, end that message with one line in exactly this form, and ask nothing further in it:
NAMING LEDGER: relationships_renamed=<number>; relationships_redirected=<number>; properties_renamed=<number>; classes_renamed=<number>

### Turn 129 — app-user

One last pass, on wording: I would like the model to use our own words.

Call get_graph_state first. Then go through what is on the canvas, three to five items per question, relationships first, then properties, then classes:
- for each relationship, ask me what we call this connection ourselves, in one verb phrase, and which way round we would say it;
- for each property and each class, ask me whether that is what we would call it, or whether we have our own term for it.

Record each answer with the rename_ontology_elements tool: a relationship takes my verb phrase, and if I state it the other way round it is turned round (reverse: true); a property or a class takes my term. Previous names of classes and relationships are kept as aliases automatically. Where I say the current name is already right, leave it as it is. Do not add or remove anything in this pass.

When every relationship, property and class has been asked about, end that message with one line in exactly this form, and ask nothing further in it:
NAMING LEDGER: relationships_renamed=<number>; relationships_redirected=<number>; properties_renamed=<number>; classes_renamed=<number>

### Turn 129 — app-tool

🔍 Checked the current ontology state.

### Turn 129 — app-assistant

I’ve checked the live canvas. I’ll use its **26 relationships** as the starting list, then work through properties and classes in that order. This pass will change names and directions only; it won’t add or remove anything. The two existing action-navigation warnings remain open.

For each of these four connections, what **one verb phrase** would you use, and which way round would you say it? “Current name and direction” is fine for any that already sounds right.

1. Loan → **hasBorrower** → Borrower
2. Loan → **hasLender** → Lender
3. CreditFacility → **hasBorrower** → Borrower
4. CreditFacility → **hasLender** → Lender

### Turn 129 — persona

Current name and direction are right for all four:

1. **Loan has borrower → Borrower**
2. **Loan has lender → Lender**
3. **Credit facility has borrower → Borrower**
4. **Credit facility has lender → Lender**

The borrower and lender are identified directly on each arrangement; neither connection needs to run through a separate agreement record.

### Turn 130 — app-user

Current name and direction are right for all four:

1. **Loan has borrower → Borrower**
2. **Loan has lender → Lender**
3. **Credit facility has borrower → Borrower**
4. **Credit facility has lender → Lender**

The borrower and lender are identified directly on each arrangement; neither connection needs to run through a separate agreement record.

### Turn 130 — app-assistant

I’ll leave those four relationship names and directions unchanged. They remain direct links from each arrangement to its parties.

For these next four, what one verb phrase would you use for each, and which way round would you say it?

1. CreditAgreement → **hasBorrower** → Borrower
2. CreditAgreement → **hasLender** → Lender
3. Loan → **servicedBy** → Servicer
4. Loan → **collateralizedBy** → Collateral

### Turn 130 — persona

I’d keep the direction on all four:

1. **Credit agreement has borrower → Borrower** — current wording.
2. **Credit agreement has lender → Lender** — current wording.
3. **Loan is serviced by → Servicer** — current wording.
4. **Secured loan is collateralized by → Collateral** — current wording, but name the source as a **secured loan**. The link records pledged collateral; it doesn’t apply to a guarantee-only loan without collateral.

### Turn 131 — app-user

I’d keep the direction on all four:

1. **Credit agreement has borrower → Borrower** — current wording.
2. **Credit agreement has lender → Lender** — current wording.
3. **Loan is serviced by → Servicer** — current wording.
4. **Secured loan is collateralized by → Collateral** — current wording, but name the source as a **secured loan**. The link records pledged collateral; it doesn’t apply to a guarantee-only loan without collateral.

### Turn 131 — app-assistant

I’ll leave the first three names and directions unchanged. For the fourth, the wording **“is collateralized by”** and its Loan-to-Collateral direction are already recorded; its meaning already limits the link to loans with pledged collateral.

When you say “name the source as a **secured loan**,” do you mean only how we describe this link when it applies, or do you want to rename the **Loan** class itself? Renaming Loan would affect unsecured loans too.

### Turn 131 — persona

Only how we describe the **source of that link when it applies**. Don’t rename the Loan class: unsecured loans are still loans. The collateral link applies to a secured loan with pledged collateral, not to every loan.

### Turn 132 — app-user

Only how we describe the **source of that link when it applies**. Don’t rename the Loan class: unsecured loans are still loans. The collateral link applies to a secured loan with pledged collateral, not to every loan.

### Turn 132 — app-assistant

Understood. **Loan** stays named Loan; the collateral link’s existing meaning already says it applies only where collateral is pledged. No rename is needed for those four.

For the next four connections, what one verb phrase would you use, and which way round would you say it?

1. SecurityAgreement → **secures** → Collateral
2. Loan → **hasLoanToValueRatio** → LoanToValueRatio
3. Loan → **hasCombinedLoanToValueRatio** → CombinedLoanToValueRatio
4. Loan → **hasPrincipal** → Principal

### Turn 132 — persona

I’d keep the direction on all four:

1. **Security agreement secures → Collateral**
2. **Collateralized loan has loan-to-value ratio → Loan-to-value ratio**
3. **Collateralized loan has combined loan-to-value ratio → Combined loan-to-value ratio**
4. **Loan has principal → Principal**

For the two ratios, “collateralized” describes when the loan link applies; it does not rename the Loan record.

### Turn 133 — app-user

I’d keep the direction on all four:

1. **Security agreement secures → Collateral**
2. **Collateralized loan has loan-to-value ratio → Loan-to-value ratio**
3. **Collateralized loan has combined loan-to-value ratio → Combined loan-to-value ratio**
4. **Loan has principal → Principal**

For the two ratios, “collateralized” describes when the loan link applies; it does not rename the Loan record.

### Turn 133 — app-assistant

I’ll leave those four names and directions unchanged. “Collateralized” describes when the two ratio links apply; it does not rename Loan.

For these next four, what one verb phrase would you use, and which way round would you say it?

1. Loan → **hasInterest** → Interest
2. PrincipalRepaymentTerms → **governsPaymentOf** → Principal
3. InterestPaymentTerms → **governsPaymentOf** → Interest
4. Loan → **hasPaymentHistory** → PaymentHistory

### Turn 133 — persona

All four have the right wording and direction:

1. **Loan has interest → Interest** — the loan’s interest obligation.
2. **Principal repayment terms govern payment of → Principal** — the principal obligation those terms cover.
3. **Interest payment terms govern payment of → Interest** — the interest obligation those terms cover.
4. **Loan has payment history → Payment history** — the record of actual payments for that loan.

### Turn 134 — app-user

All four have the right wording and direction:

1. **Loan has interest → Interest** — the loan’s interest obligation.
2. **Principal repayment terms govern payment of → Principal** — the principal obligation those terms cover.
3. **Interest payment terms govern payment of → Interest** — the interest obligation those terms cover.
4. **Loan has payment history → Payment history** — the record of actual payments for that loan.

### Turn 134 — app-assistant

I’ll leave those four unchanged. The terms still point **toward** the obligations they govern; this naming pass does not create reverse lookup paths.

For these next four connections, what one verb phrase would you use, and which way round would you say it?

1. PaymentHistory → **containsPaymentTransaction** → PaymentTransaction
2. CreditFacility → **hasSubFacility** → SubFacility
3. Collateral → **hasCollateralValue** → CollateralValuation
4. Loan → **hasInterestRate** → FixedInterestRate

### Turn 134 — persona

I’d keep all four directions. I’d change the first verb phrase; the other three are right as recorded:

1. **Payment history has individual payment → Payment transaction.** It identifies an actual entry in the history.
2. **Credit facility has sub-facility → Sub-facility.**
3. **Collateral has collateral value → Dated collateral value.** The as-of date is on the value record.
4. **Loan has interest rate → Fixed interest rate.** The rate type is fixed; the connection wording is shared with variable rates.

### Turn 135 — app-user

I’d keep all four directions. I’d change the first verb phrase; the other three are right as recorded:

1. **Payment history has individual payment → Payment transaction.** It identifies an actual entry in the history.
2. **Credit facility has sub-facility → Sub-facility.**
3. **Collateral has collateral value → Dated collateral value.** The as-of date is on the value record.
4. **Loan has interest rate → Fixed interest rate.** The rate type is fixed; the connection wording is shared with variable rates.

### Turn 135 — app-tool

✓ Renamed: 1 element(s).

### Turn 135 — app-assistant

I’ve renamed **PaymentHistory → PaymentTransaction** to **hasIndividualPayment**. Its direction is unchanged, and the previous name is retained as an alias. The other three connections stay as they are.

For these four Loan connections, what one verb phrase would you use, and which way round would you say it?

1. Loan → **hasInterestRate** → VariableInterestRate
2. Loan → **hasSchedule** → LoanPaymentSchedule
3. Loan → **hasSchedule** → PrincipalPaymentSchedule
4. Loan → **hasSchedule** → InterestPaymentSchedule

### Turn 135 — persona

I’d keep the current phrase and direction for all four:

1. **Loan has interest rate → Variable interest rate.**
2. **Loan has schedule → Loan payment schedule.**
3. **Loan has schedule → Principal payment schedule.**
4. **Loan has schedule → Interest payment schedule.**

The schedule type tells us what it covers; the connection itself needn’t have a different verb for each type.

### Turn 136 — app-user

I’d keep the current phrase and direction for all four:

1. **Loan has interest rate → Variable interest rate.**
2. **Loan has schedule → Loan payment schedule.**
3. **Loan has schedule → Principal payment schedule.**
4. **Loan has schedule → Interest payment schedule.**

The schedule type tells us what it covers; the connection itself needn’t have a different verb for each type.

### Turn 136 — app-assistant

I’ll leave those four unchanged. **hasInterestRate** stays shared across fixed and variable rates, and **hasSchedule** stays shared across the schedule types.

For the last two relationships on the canvas, what one verb phrase would you use, and which way round would you say it?

1. Loan → **hasSchedule** → AmortizationSchedule
2. Loan → **hasSchedule** → InterestRateResetSchedule

### Turn 136 — persona

Current phrase and direction for both:

1. **Loan has schedule → Amortization schedule.**
2. **Loan has schedule → Interest rate reset schedule.**

They remain distinct schedules even though the loan uses the same connection wording for each.

### Turn 137 — app-user

Current phrase and direction for both:

1. **Loan has schedule → Amortization schedule.**
2. **Loan has schedule → Interest rate reset schedule.**

They remain distinct schedules even though the loan uses the same connection wording for each.

### Turn 137 — app-assistant

That completes the relationship wording pass. Both remaining links stay **Loan → hasSchedule → their respective schedule**. Of the 26 relationships, only the payment-history link was renamed; none was reversed.

Now properties, starting with five on **Loan**. Are these the names your team uses, or what would you call each instead?

1. `principalAmount`
2. `loanBalance`
3. `initialExchangeDate`
4. `maturityDate`
5. `interestRateCap`

### Turn 137 — persona

Those names work for all five: **principal amount, loan balance, initial exchange date, maturity date,** and **interest rate cap**.

Keep principal amount and loan balance separate. “Initial exchange date” is the agreed initial funding or exchange date, rather than a general funding forecast.

### Turn 138 — app-user

Those names work for all five: **principal amount, loan balance, initial exchange date, maturity date,** and **interest rate cap**.

Keep principal amount and loan balance separate. “Initial exchange date” is the agreed initial funding or exchange date, rather than a general funding forecast.

### Turn 138 — app-assistant

I’ll leave those five Loan property names unchanged, with principal amount distinct from loan balance and initial exchange date distinct from a funding forecast.

For the remaining four **Loan** properties, are these your terms, or what would you call each instead?

1. `firstRateChangeTerm`
2. `interestOnly`
3. `negativeAmortization`
4. `balloonPayment`

### Turn 138 — persona

I’d call the first **first rate change term in months**—the unit is worth keeping in the name. The other three work as they are: **interest-only**, **negative amortization**, and **balloon payment**. Each of those three is a separate yes/no value on the loan.

### Turn 139 — app-user

I’d call the first **first rate change term in months**—the unit is worth keeping in the name. The other three work as they are: **interest-only**, **negative amortization**, and **balloon payment**. Each of those three is a separate yes/no value on the loan.

### Turn 139 — app-tool

✓ Renamed: 1 element(s).

### Turn 139 — app-assistant

I’ve renamed the Loan property to **`firstRateChangeTermInMonths`**; its months unit remains recorded. The three yes/no property names stay unchanged.

For the five **CreditFacility** properties, are these your terms, or what would you call each instead?

1. `creditLimit`
2. `creditExtended`
3. `availableAmount`
4. `initialExchangeDate`
5. `maturityDate`

### Turn 139 — persona

Four names work: **credit limit, available amount, initial exchange date,** and **maturity date**.

I’d call **credit extended** **amount of credit extended**. That makes clear it’s the recorded amount, distinct from both the credit limit and the available amount.

### Turn 140 — app-user

Four names work: **credit limit, available amount, initial exchange date,** and **maturity date**.

I’d call **credit extended** **amount of credit extended**. That makes clear it’s the recorded amount, distinct from both the credit limit and the available amount.

### Turn 140 — app-tool

✓ Renamed: 1 element(s).

### Turn 140 — app-assistant

I’ve renamed the facility property to **`amountOfCreditExtended`**. The other four names stay unchanged.

For the next five numeric properties, are these the terms you use, or what would you call each instead?

1. FixedInterestRate.`rate`
2. VariableInterestRate.`rate`
3. Principal.`outstandingAmount`
4. AccruedInterest.`amount`
5. CollateralValuation.`appraisedValue`

### Turn 140 — persona

The first four names work: **rate** on each rate record, **outstanding amount** on Principal, and **amount** on Accrued Interest.

For the dated collateral record, I’d use **value** rather than **appraised value** as the field name. It is an appraised value, and its separate as-of date tells us when it applies.

### Turn 141 — app-user

The first four names work: **rate** on each rate record, **outstanding amount** on Principal, and **amount** on Accrued Interest.

For the dated collateral record, I’d use **value** rather than **appraised value** as the field name. It is an appraised value, and its separate as-of date tells us when it applies.

### Turn 141 — app-tool

✓ Renamed: 1 element(s).

### Turn 141 — app-assistant

I’ve renamed CollateralValuation.`appraisedValue` to **`value`**; the record’s meaning still says it is appraised. The other four names stay unchanged.

For these five dated or ratio properties, are the current names yours, or what would you call each instead?

1. AccruedInterest.`asOfDate`
2. CollateralValuation.`asOfDate`
3. LoanToValueRatio.`ratioValue`
4. CombinedLoanToValueRatio.`ratioValue`
5. PrepaymentTerms.`prepaymentPenaltyPeriod`

### Turn 141 — persona

The two **as-of date** names work.

For each ratio record, I’d call the numeric field **ratio**, rather than “ratio value.” For the prepayment terms, I’d call the field **prepayment penalty term in months** so the unit is explicit. None of those names settles the still-unknown storage scale of the ratios or the lookup for a particular loan’s prepayment terms.

### Turn 142 — app-user

The two **as-of date** names work.

For each ratio record, I’d call the numeric field **ratio**, rather than “ratio value.” For the prepayment terms, I’d call the field **prepayment penalty term in months** so the unit is explicit. None of those names settles the still-unknown storage scale of the ratios or the lookup for a particular loan’s prepayment terms.

### Turn 142 — app-tool

✓ Renamed: 3 element(s).

### Turn 142 — app-assistant

I’ve renamed both ratio fields to **`ratio`** and the prepayment field to **`prepaymentPenaltyTermInMonths`**. The two as-of-date names stay unchanged. These naming changes do not resolve the ratio scales or the loan-to-prepayment-terms lookup.

For the four **PrincipalRepaymentTerms** properties, are these your names, or what would you call each instead?

1. `initialPrincipalPaymentDate`
2. `principalRepaymentDate`
3. `principalPaymentFrequency`
4. `principalPaymentDay`

### Turn 142 — persona

I’d keep all four: **initial principal payment date, principal repayment date, principal payment frequency,** and **principal payment day**. The first two are individual dates; the frequency and payment-day fields are text with no confirmed allowed-value lists.

### Turn 143 — app-user

I’d keep all four: **initial principal payment date, principal repayment date, principal payment frequency,** and **principal payment day**. The first two are individual dates; the frequency and payment-day fields are text with no confirmed allowed-value lists.

### Turn 143 — app-assistant

I’ll leave those four PrincipalRepaymentTerms property names unchanged. Their two dates remain individual dates, and the text fields still have no confirmed allowed-value lists.

For these five **InterestPaymentTerms** properties, are the current names yours, or what would you call each instead?

1. `initialInterestAccrualDate`
2. `initialInterestPaymentDate`
3. `finalInterestPaymentDate`
4. `interestPaymentFrequency`
5. `interestPaymentDay`

### Turn 143 — persona

I’d keep all five: **initial interest accrual date, initial interest payment date, final interest payment date, interest payment frequency,** and **interest payment day**. The first three are individual dates; the last two are text without confirmed allowed-value lists.

### Turn 144 — app-user

I’d keep all five: **initial interest accrual date, initial interest payment date, final interest payment date, interest payment frequency,** and **interest payment day**. The first three are individual dates; the last two are text without confirmed allowed-value lists.

### Turn 144 — app-assistant

I’ll leave those five names unchanged. The three dates remain individual dates, and the two text fields have no confirmed allowed-value lists.

That leaves three properties on the canvas. Are these your terms, or what would you call each instead?

1. InterestPaymentTerms.`compoundingFrequency`
2. CreditAgreement.`initialExchangeDate`
3. CreditAgreement.`maturityDate`

### Turn 144 — persona

I’d keep all three: **compounding frequency**, **initial exchange date**, and **maturity date**. Compounding frequency is text with no confirmed allowed-value list; the other two are dates on the credit agreement.

### Turn 145 — app-user

I’d keep all three: **compounding frequency**, **initial exchange date**, and **maturity date**. Compounding frequency is text with no confirmed allowed-value list; the other two are dates on the credit agreement.

### Turn 145 — app-assistant

I’ll leave those three property names unchanged. That completes the property naming pass: **six properties renamed**.

Now classes. Are these the names your team uses, or what would you call each instead?

1. Loan
2. CreditFacility
3. Borrower
4. Lender
5. Servicer

### Turn 145 — persona

I’d keep all five: **loan, credit facility, borrower, lender,** and **servicer**. We also use **master commitment** for a credit facility, but I’d retain **credit facility** as its main name.

### Turn 146 — app-user

I’d keep all five: **loan, credit facility, borrower, lender,** and **servicer**. We also use **master commitment** for a credit facility, but I’d retain **credit facility** as its main name.

### Turn 146 — app-assistant

I’ll keep those five class names. **Master commitment** is already recorded as an alias for CreditFacility, so no rename is needed.

For the next five classes, are these your names, or what would you call each instead?

1. Collateral
2. SecurityAgreement
3. PaymentHistory
4. PaymentTransaction
5. AmortizationSchedule

### Turn 146 — persona

I’d keep **collateral**, **security agreement**, **payment history**, and **amortization schedule**.

For **payment transaction**, I’d use **individual payment transaction** as the main name. It makes clear this is one actual entry in the payment history, not the history as a whole or a scheduled payment.

### Turn 147 — app-user

I’d keep **collateral**, **security agreement**, **payment history**, and **amortization schedule**.

For **payment transaction**, I’d use **individual payment transaction** as the main name. It makes clear this is one actual entry in the payment history, not the history as a whole or a scheduled payment.

### Turn 147 — app-tool

✓ Renamed: 1 element(s).

### Turn 147 — app-assistant

I’ve renamed the class to **IndividualPaymentTransaction**; **PaymentTransaction** remains an alias. The other four names stay unchanged.

For the next five classes, are these the names your team uses, or what would you call each instead?

1. PrincipalPaymentSchedule
2. InterestPaymentSchedule
3. LoanPaymentSchedule
4. FixedInterestRate
5. VariableInterestRate

### Turn 147 — persona

I’d keep all five: **principal payment schedule, interest payment schedule, loan payment schedule, fixed interest rate,** and **variable interest rate**. The three schedules are distinct records; fixed and variable describe different kinds of rate record.

### Turn 148 — app-user

I’d keep all five: **principal payment schedule, interest payment schedule, loan payment schedule, fixed interest rate,** and **variable interest rate**. The three schedules are distinct records; fixed and variable describe different kinds of rate record.

### Turn 148 — app-assistant

I’ll leave those five class names unchanged, preserving the distinctions between the three schedules and the two rate records.

For the next five classes, are these your names, or what would you call each instead?

1. InterestRateResetSchedule
2. PrincipalRepaymentTerms
3. InterestPaymentTerms
4. PrepaymentTerms
5. Principal

### Turn 148 — persona

I’d keep all five: **interest rate reset schedule, principal repayment terms, interest payment terms, prepayment terms,** and **principal**. Prepayment terms are a more specific kind of principal repayment terms, but that still does not establish how to find the terms applicable to a particular loan.

### Turn 149 — app-user

I’d keep all five: **interest rate reset schedule, principal repayment terms, interest payment terms, prepayment terms,** and **principal**. Prepayment terms are a more specific kind of principal repayment terms, but that still does not establish how to find the terms applicable to a particular loan.

### Turn 149 — app-assistant

I’ll leave those five names unchanged. The more-specific nature of PrepaymentTerms still does not establish a loan-specific lookup.

For the next five classes, are these your names, or what would you call each instead?

1. AccruedInterest
2. CollateralValuation
3. SubFacility
4. LoanToValueRatio
5. CombinedLoanToValueRatio

### Turn 149 — persona

I’d keep **accrued interest, sub-facility, loan-to-value ratio,** and **combined loan-to-value ratio**.

For **collateral valuation**, I’d use **collateral value as of date** as the main name. It makes the appraisal’s date central to the record, rather than sounding like a timeless value.

### Turn 150 — app-user

I’d keep **accrued interest, sub-facility, loan-to-value ratio,** and **combined loan-to-value ratio**.

For **collateral valuation**, I’d use **collateral value as of date** as the main name. It makes the appraisal’s date central to the record, rather than sounding like a timeless value.

### Turn 150 — app-tool

✓ Renamed: 1 element(s).

### Turn 150 — app-assistant

I’ve renamed **CollateralValuation** to **CollateralValueAsOfDate**; the previous name remains an alias. The other four names stay unchanged, and the record still carries its separate value and as-of date.

For the last two classes on the canvas, are these your names, or what would you call each instead?

1. Interest
2. CreditAgreement

### Turn 150 — persona

I’d keep **interest** and **credit agreement**. Interest is the loan’s interest obligation, not the dated accrued-interest amount; a credit facility is a kind of credit agreement, not a second agreement the agent must navigate to.

### Turn 151 — app-user

I’d keep **interest** and **credit agreement**. Interest is the loan’s interest obligation, not the dated accrued-interest amount; a credit facility is a kind of credit agreement, not a second agreement the agent must navigate to.

### Turn 151 — app-tool

🔍 Checked the current ontology state.

### Turn 151 — app-tool

✓ Applied: 0 added, 4 updated.

### Turn 151 — app-assistant

The naming pass is complete. **Interest** and **CreditAgreement** stay as named. I checked the canvas and updated the rule and action text that still used names changed during this pass; the two previously identified navigation gaps remain unresolved. No relationship was reversed, and these wording changes do not make the model ready for end-to-end use.

NAMING LEDGER: relationships_renamed=1; relationships_redirected=0; properties_renamed=6; classes_renamed=2
