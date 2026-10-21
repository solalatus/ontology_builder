### turn 0 — persona

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### turn 1 — app-user

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### turn 1 — app-assistant

We’ll start with the real questions the agent must answer, then capture the actions it must perform. From there, we’ll build and check the model in about ten short phases.

For a **newly approved loan or credit facility**, what questions would you ask to determine whether it has been set up correctly? Please list the ones you’d want the agent to answer.

### turn 1 — persona

For a newly approved loan or facility, I’d want the agent to answer these questions:

1. Who is the borrower, and who is the lender?
2. What amount is being lent or made available, when is funding expected to begin, and when does the agreement mature? For a facility, what are the credit limit, amount extended, and amount still available?
3. Is this closed-end credit or a facility the borrower can draw, repay, and draw again? Does the facility have any sub-facilities?
4. What interest rate applies—fixed or variable? If it’s variable, is a rate-reset schedule recorded, and do any cap or first-rate-change terms apply?
5. How is interest accrued and paid? Are the interest payment terms and day-count convention recorded separately from principal repayment terms?
6. How is principal to be repaid, and which payment schedules are on file—loan payment, amortization, principal payment, interest payment, or interest calculation schedules, as applicable?
7. Is it interest-only, capable of negative amortization, or structured with a balloon payment? If it’s amortizing, is its amortization schedule recorded?
8. Are there prepayment terms, including a recorded penalty period if a penalty applies?
9. Is the loan secured? If so, what collateral is linked to it, and what security agreement supports that collateral? If there’s credit enhancement, who benefits from it?
10. For a collateralized loan, what dated collateral value and loan-to-value measures are recorded?
11. What borrowing capacity has been assessed for the borrower before further credit is extended?
12. Who will service the loan, and how will its payment history and individual payments be tracked?

I’d distinguish **setup checks** from **ongoing servicing checks**. A newly approved loan may not have received a payment yet; I wouldn’t treat a missing actual payment as proof that setup was wrong. Once payments occur, though, the agent needs to be able to trace each one through the loan’s payment history.

### turn 2 — app-user

For a newly approved loan or facility, I’d want the agent to answer these questions:

1. Who is the borrower, and who is the lender?
2. What amount is being lent or made available, when is funding expected to begin, and when does the agreement mature? For a facility, what are the credit limit, amount extended, and amount still available?
3. Is this closed-end credit or a facility the borrower can draw, repay, and draw again? Does the facility have any sub-facilities?
4. What interest rate applies—fixed or variable? If it’s variable, is a rate-reset schedule recorded, and do any cap or first-rate-change terms apply?
5. How is interest accrued and paid? Are the interest payment terms and day-count convention recorded separately from principal repayment terms?
6. How is principal to be repaid, and which payment schedules are on file—loan payment, amortization, principal payment, interest payment, or interest calculation schedules, as applicable?
7. Is it interest-only, capable of negative amortization, or structured with a balloon payment? If it’s amortizing, is its amortization schedule recorded?
8. Are there prepayment terms, including a recorded penalty period if a penalty applies?
9. Is the loan secured? If so, what collateral is linked to it, and what security agreement supports that collateral? If there’s credit enhancement, who benefits from it?
10. For a collateralized loan, what dated collateral value and loan-to-value measures are recorded?
11. What borrowing capacity has been assessed for the borrower before further credit is extended?
12. Who will service the loan, and how will its payment history and individual payments be tracked?

I’d distinguish **setup checks** from **ongoing servicing checks**. A newly approved loan may not have received a payment yet; I wouldn’t treat a missing actual payment as proof that setup was wrong. Once payments occur, though, the agent needs to be able to trace each one through the loan’s payment history.

### turn 2 — app-assistant

You’ve given a useful starting list. I’m keeping **setup checks** separate from **ongoing servicing checks**: a newly approved loan need not have an actual payment yet, but later payments must be traceable.

I’ll turn your list into individual questions without changing its meaning. Do these five capture the first part correctly?

1. Who is the borrower?
2. Who is the lender?
3. What amount is being lent or made available?
4. When is funding expected to begin?
5. When does the agreement mature?

### turn 2 — persona

Yes, those five capture the first part. I’d keep **the loan’s principal amount** distinct from **a facility’s credit limit or available amount** under question 3. For question 4, record the initial funding or exchange date rather than treating an expected date as proof that funds have already gone out.

### turn 3 — app-user

Yes, those five capture the first part. I’d keep **the loan’s principal amount** distinct from **a facility’s credit limit or available amount** under question 3. For question 4, record the initial funding or exchange date rather than treating an expected date as proof that funds have already gone out.

### turn 3 — app-assistant

Confirmed: the loan’s **principal amount** is distinct from a facility’s credit limit and available amount. I’ll also treat the **initial funding or exchange date** as a date to record, not as evidence that funds have already been sent.

For the facility-specific checks, do these five questions reflect what you need?

6. What is the facility’s credit limit?
7. How much credit has been extended under it?
8. How much remains available?
9. Is the credit closed-end, or can the borrower draw, repay, and draw again?
10. Does the facility have any sub-facilities?

### turn 3 — persona

Yes. Those cover the facility checks I’d use. For question 9, I’d keep two points distinct: **closed-end versus open-end credit** describes whether credit can be reused, while a **revolving line of credit** is a facility that lets the borrower draw, repay, and draw again. For question 10, record which sub-facilities belong to the facility; don’t assume every facility has one.

### turn 4 — app-user

Yes. Those cover the facility checks I’d use. For question 9, I’d keep two points distinct: **closed-end versus open-end credit** describes whether credit can be reused, while a **revolving line of credit** is a facility that lets the borrower draw, repay, and draw again. For question 10, record which sub-facilities belong to the facility; don’t assume every facility has one.

### turn 4 — app-assistant

Confirmed. I’ll keep **closed-end versus open-end credit** separate from whether a facility is a **revolving line of credit**. Sub-facilities will be a conditional check: which ones belong to the facility, if any.

Do these next five questions capture the interest-rate checks?

11. What interest rate applies?
12. Is that rate fixed or variable?
13. If variable, what rate-reset schedule is recorded?
14. Do any interest-rate cap terms apply, and what are they?
15. Do any first-rate-change terms apply, and what are they?

### turn 4 — persona

Yes. I’d record the rate itself as well as whether it’s fixed or variable. A **variable-rate loan needs a reset schedule** for us to confirm its setup; a cap and a first-rate-change term are separate features to check when they apply, not assumptions about every variable-rate loan. The first-rate-change term is recorded in months.

### turn 5 — app-user

Yes. I’d record the rate itself as well as whether it’s fixed or variable. A **variable-rate loan needs a reset schedule** for us to confirm its setup; a cap and a first-rate-change term are separate features to check when they apply, not assumptions about every variable-rate loan. The first-rate-change term is recorded in months.

### turn 5 — app-assistant

Confirmed: the rate and whether it is fixed or variable are separate checks. A variable-rate loan needs a reset schedule for setup confirmation; cap terms and first-rate-change terms are checked only when they apply. The first-rate-change term is measured in months.

Do these five questions capture the interest and repayment terms you need checked next?

16. How is interest accrued?
17. What day-count convention applies?
18. What are the interest payment terms?
19. How is principal to be repaid?
20. Which loan payment, amortization, principal payment, interest payment, or interest calculation schedules are on file, as applicable?

### turn 5 — persona

Yes. I’d make two distinctions while keeping those questions:

- **Interest payment terms** govern payment of interest and identify the day-count convention used as its accrual basis. Interest that has accrued but remains unpaid is tracked separately from principal.
- **Principal repayment terms** govern repayment of principal. An interest calculation schedule says when interest is calculated; it isn’t the same as an interest payment schedule, which says when interest is due.

Question 20 works as an “as applicable” check. If the loan is amortizing, I’d specifically check for an amortization schedule and principal repayment terms.

### turn 6 — app-user

Yes. I’d make two distinctions while keeping those questions:

- **Interest payment terms** govern payment of interest and identify the day-count convention used as its accrual basis. Interest that has accrued but remains unpaid is tracked separately from principal.
- **Principal repayment terms** govern repayment of principal. An interest calculation schedule says when interest is calculated; it isn’t the same as an interest payment schedule, which says when interest is due.

Question 20 works as an “as applicable” check. If the loan is amortizing, I’d specifically check for an amortization schedule and principal repayment terms.

### turn 6 — app-assistant

Confirmed. I’ll keep accrued-but-unpaid interest separate from principal, and distinguish **when interest is calculated** from **when it is due**. For an amortizing loan, the applicable-schedules check specifically includes its amortization schedule and principal repayment terms.

Do these three additional repayment checks match what the agent needs to answer?

21. Is the loan interest-only?
22. Can the loan negatively amortize?
23. Does the loan require a balloon payment?

### turn 6 — persona

Yes. I’d record each as a separate yes-or-no feature of the loan. **Interest-only** concerns what the scheduled payments cover; **negative amortization** means payments may not cover interest due, so the balance can grow; and a **balloon payment** means a larger amount remains due at the end. One doesn’t automatically imply either of the others.

### turn 7 — app-user

Yes. I’d record each as a separate yes-or-no feature of the loan. **Interest-only** concerns what the scheduled payments cover; **negative amortization** means payments may not cover interest due, so the balance can grow; and a **balloon payment** means a larger amount remains due at the end. One doesn’t automatically imply either of the others.

### turn 7 — app-assistant

Confirmed: **interest-only**, **negative amortization**, and **balloon payment** are three independent yes-or-no checks. None implies either of the others.

For prepayment, should the agent answer these two questions?

24. What prepayment terms apply?
25. If a prepayment penalty applies, what is its penalty period?

### turn 7 — persona

Yes. Prepayment terms cover repayment before maturity. If a penalty applies, the agent should check that its **penalty period is recorded in months**; it shouldn’t assume every loan has a prepayment penalty.

### turn 8 — app-user

Yes. Prepayment terms cover repayment before maturity. If a penalty applies, the agent should check that its **penalty period is recorded in months**; it shouldn’t assume every loan has a prepayment penalty.

### turn 8 — app-assistant

Confirmed: prepayment terms address repayment before maturity. A penalty period is checked **in months only if a penalty applies**.

Do these five questions capture the security and credit-enhancement checks?

26. Is the loan secured?
27. If secured, which collateral is linked to it?
28. Which security agreement supports that collateral?
29. Is there credit enhancement?
30. If so, who benefits from it?

### turn 8 — persona

Yes, with two distinctions. For a loan recorded as **secured**, I’d check that collateral is actually linked to the loan; the secured-loan support check isn’t satisfied by a “secured” label alone. A security agreement **secures the collateral** by granting rights over it, so question 28 should identify that agreement without treating it as the collateral itself.

Credit enhancement is a separate check. If a credit enhancement agreement is in place, the agent should identify its beneficiary. A loan may also be secured by a guaranty, so I wouldn’t use “collateralized” and “guaranteed” interchangeably.

### turn 9 — app-user

Yes, with two distinctions. For a loan recorded as **secured**, I’d check that collateral is actually linked to the loan; the secured-loan support check isn’t satisfied by a “secured” label alone. A security agreement **secures the collateral** by granting rights over it, so question 28 should identify that agreement without treating it as the collateral itself.

Credit enhancement is a separate check. If a credit enhancement agreement is in place, the agent should identify its beneficiary. A loan may also be secured by a guaranty, so I wouldn’t use “collateralized” and “guaranteed” interchangeably.

### turn 9 — app-assistant

Confirmed: a **secured** label alone does not establish that collateral is linked. Where collateral applies, the agent must identify both the collateral and the security agreement granting rights over it. Credit enhancement and its beneficiary are separate checks, and a guaranty must not be treated as collateral.

One clarification before the valuation questions: when a loan is recorded as secured, should the agent check **whether its support is collateral, a guaranty, or both**, and identify the linked guaranty when one applies?

### turn 9 — persona

It’s worth asking whether the loan is **collateralized or guaranteed**, because those are different forms of support. But I’d qualify the second part: I can identify a *guaranteed loan* as such; I wouldn’t claim we have a separate linked-guaranty check in this setup model.

For the **secured-loan support check** we’ve been discussing, the agent must find collateral linked to the loan. It should not mark that particular check complete merely because the loan is labeled secured or guaranteed.

### turn 10 — app-user

It’s worth asking whether the loan is **collateralized or guaranteed**, because those are different forms of support. But I’d qualify the second part: I can identify a *guaranteed loan* as such; I wouldn’t claim we have a separate linked-guaranty check in this setup model.

For the **secured-loan support check** we’ve been discussing, the agent must find collateral linked to the loan. It should not mark that particular check complete merely because the loan is labeled secured or guaranteed.

### turn 10 — app-assistant

Understood. The agent should distinguish a **collateralized loan** from a **guaranteed loan**, but this setup model does not call for a separately linked guaranty. For the secured-loan support check you described, it must find collateral linked to the loan; a secured or guaranteed label alone does not complete that check.

Do these next three questions capture the valuation and capacity checks?

31. For a collateralized loan, what dated value is recorded for its collateral?
32. What loan-to-value measures are recorded for that loan?
33. What borrowing capacity has been assessed for the borrower before further credit is extended?

### turn 10 — persona

Yes. For 31, capture both the **appraised collateral value and its as-of date**. For 32, check **loan-to-value** and **combined loan-to-value** separately: the first compares this loan’s principal with the appraised value; the second accounts for total debt secured by the asset or assets. For 33, record the borrower’s assessed borrowing-capacity amount. Whether more credit can actually be extended is a separate decision; I wouldn’t infer an approval threshold from that assessment alone.

### turn 11 — app-user

Yes. For 31, capture both the **appraised collateral value and its as-of date**. For 32, check **loan-to-value** and **combined loan-to-value** separately: the first compares this loan’s principal with the appraised value; the second accounts for total debt secured by the asset or assets. For 33, record the borrower’s assessed borrowing-capacity amount. Whether more credit can actually be extended is a separate decision; I wouldn’t infer an approval threshold from that assessment alone.

### turn 11 — app-assistant

Confirmed: for collateralized loans, the agent checks the **appraised collateral value and its as-of date**, plus **loan-to-value** and **combined loan-to-value** separately. It also records the borrower’s assessed borrowing-capacity amount, without treating that amount alone as approval to extend more credit.

Do these four questions capture the remaining servicing checks?

34. Who services the loan?
35. Which payment history belongs to the loan?
36. Which individual payments appear in that history once payments occur?
37. How much interest has accrued but remains unpaid?

### turn 11 — persona

Yes. The loan identifies its **servicer**, which may differ from the lender or originator. Its **payment history** is the record for that loan, and individual payment transactions belong in that history once payments have occurred. I wouldn’t expect an actual payment on a newly approved loan.

For question 37, capture the **unpaid accrued-interest amount and its as-of date**. Keep that amount separate from outstanding principal and from interest payments already made.

### turn 12 — app-user

Yes. The loan identifies its **servicer**, which may differ from the lender or originator. Its **payment history** is the record for that loan, and individual payment transactions belong in that history once payments have occurred. I wouldn’t expect an actual payment on a newly approved loan.

For question 37, capture the **unpaid accrued-interest amount and its as-of date**. Keep that amount separate from outstanding principal and from interest payments already made.

### turn 12 — app-assistant

Confirmed: the **servicer** may differ from the lender or originator. Each loan has its own payment history, and actual payments appear there only once they occur. Unpaid accrued interest needs an amount and as-of date, separate from principal and interest already paid.

That completes the first pass of questions. **What changes must the agent actually make or initiate**, rather than merely check or report? Please name the setup and ongoing-servicing actions you need it to perform.

### turn 12 — persona

For this scope, I’d have the agent **confirm or flag records**, not create loans, change terms, post payments, or approve more credit. The actions I need are:

**Setup reviews**
- **Assess loan readiness:** Given a loan, check that its borrower and lender are identified and, if it bears interest, that the applicable interest payment terms are linked. Confirm the setup only when those checks pass; retain which links were checked.
- **Verify secured-loan support:** Given a secured loan, check for collateral linked to it. Confirm support only when that link is present, and retain the link as evidence.
- **Review variable-rate setup:** Given a loan with a variable rate, check that its interest-rate reset schedule is recorded. Confirm the setup only when both are present.
- **Review prepayment terms:** Where a prepayment penalty applies, check that its penalty period in months is recorded. Confirm the timing check only when that information is present.

**Ongoing servicing review**
- **Review payment-record completeness:** Given a loan, check that it has a payment history containing individual payment transactions. Confirm that payments are traceable only when both the history and its entries are present. This is not a reason to reject a newly approved loan before any payment has occurred.

For each review, I’d retain the result and the records or links used to verify it. I don’t have a separate agent authorization or a record-changing action to specify for these checks.

### turn 13 — app-user

For this scope, I’d have the agent **confirm or flag records**, not create loans, change terms, post payments, or approve more credit. The actions I need are:

**Setup reviews**
- **Assess loan readiness:** Given a loan, check that its borrower and lender are identified and, if it bears interest, that the applicable interest payment terms are linked. Confirm the setup only when those checks pass; retain which links were checked.
- **Verify secured-loan support:** Given a secured loan, check for collateral linked to it. Confirm support only when that link is present, and retain the link as evidence.
- **Review variable-rate setup:** Given a loan with a variable rate, check that its interest-rate reset schedule is recorded. Confirm the setup only when both are present.
- **Review prepayment terms:** Where a prepayment penalty applies, check that its penalty period in months is recorded. Confirm the timing check only when that information is present.

**Ongoing servicing review**
- **Review payment-record completeness:** Given a loan, check that it has a payment history containing individual payment transactions. Confirm that payments are traceable only when both the history and its entries are present. This is not a reason to reject a newly approved loan before any payment has occurred.

For each review, I’d retain the result and the records or links used to verify it. I don’t have a separate agent authorization or a record-changing action to specify for these checks.

### turn 13 — app-assistant

That sets a clear boundary: the agent **reviews and records findings**; it does not create loans, change terms, post payments, or approve credit. Each review retains its result and the records or links checked.

I have five actions: assess loan readiness, verify secured-loan support, review variable-rate setup, review prepayment terms, and review payment-record completeness **once payments have occurred**. Are those the five actions you want in scope, with no record-changing action?

### turn 13 — persona

Yes. Those are the review actions in scope, with **no action that changes loan terms, posts payments, or extends credit**.

For payment-record completeness, “once payments have occurred” is the right operational boundary: the review confirms that a loan’s payment history contains individual payment transactions. An empty history on a newly approved loan is not, by itself, a failed setup check.

### turn 14 — app-user

Yes. Those are the review actions in scope, with **no action that changes loan terms, posts payments, or extends credit**.

For payment-record completeness, “once payments have occurred” is the right operational boundary: the review confirms that a loan’s payment history contains individual payment transactions. An empty history on a newly approved loan is not, by itself, a failed setup check.

### turn 14 — app-assistant

Phase 1 is confirmed in our conversation: the 37 setup and servicing questions, and five review actions that record findings without changing loan records or extending credit. Payment-record completeness applies once payments have occurred, not as a newly approved loan’s setup test. I can’t verify or save these to the live ontology because the graph tools aren’t available in this session.

Before identifying the model’s classes: for the **borrower, lender, originator, or servicer**, is there a closely related role that does day-to-day work under any of them, and does any review depend on a specific operating context that changes how it is handled?

### turn 14 — persona

The day-to-day role I’d distinguish is the **servicer**: it collects principal and interest payments on behalf of the lender. It may be different from the lender or the party that originated the loan. I don’t have a further operating role under the borrower, lender, or servicer that these reviews depend on.

The reviews do depend on **which features the loan has**, rather than on a special operating context: interest-bearing loans need interest terms; secured loans are checked for linked collateral; variable-rate loans need a reset schedule; and penalty timing is checked when a prepayment penalty applies. Payment-record completeness becomes meaningful once payments have occurred. None of these reviews specifies a separate role-based authorization.

### turn 15 — app-user

The day-to-day role I’d distinguish is the **servicer**: it collects principal and interest payments on behalf of the lender. It may be different from the lender or the party that originated the loan. I don’t have a further operating role under the borrower, lender, or servicer that these reviews depend on.

The reviews do depend on **which features the loan has**, rather than on a special operating context: interest-bearing loans need interest terms; secured loans are checked for linked collateral; variable-rate loans need a reset schedule; and penalty timing is checked when a prepayment penalty applies. Payment-record completeness becomes meaningful once payments have occurred. None of these reviews specifies a separate role-based authorization.

### turn 15 — app-assistant

That closes the follow-up. **Servicer** is the day-to-day role needed for these reviews: it collects principal and interest payments on the lender’s behalf and may differ from the lender or originator. You identified no further operating role or separate context; the review conditions depend on the loan’s features and whether payments have occurred.

Is that an accurate recap of Phase 1 before we identify the kinds of records the agent needs to work with? The questions and actions are confirmed in this conversation, but I still can’t verify that they’re saved in the live ontology because graph tools aren’t available here.

### turn 15 — persona

Yes, that’s an accurate recap of Phase 1. We’ve confirmed the questions and review actions in this conversation, not in a live ontology. The reviews depend on the loan’s features and, for payment-record completeness, whether payments have occurred—not on another operating role or a separate authorization.

### turn 16 — app-user

Yes, that’s an accurate recap of Phase 1. We’ve confirmed the questions and review actions in this conversation, not in a live ontology. The reviews depend on the loan’s features and, for payment-record completeness, whether payments have occurred—not on another operating role or a separate authorization.

### turn 16 — app-assistant

Phase 1 is confirmed in conversation. I’ll now identify the kinds of records the agent must work with, using those questions and reviews as the test for including each one.

For the questions about principal amount versus a facility’s credit limit, amount extended, availability, and sub-facilities: does the agent need to identify and retrieve **Loan** and **Credit Facility** as separate records, or is a facility handled as a loan record with additional facility-specific information? What would you call each?

### turn 16 — persona

I’d call them a **loan** and a **credit facility**, and the agent needs to distinguish them. A loan is the debt being repaid, with a principal amount and balance. A credit facility is an agreement that lets the borrower draw credit over time; its limit, amount extended, and amount available answer different questions from a loan’s principal amount. A facility can also have sub-facilities.

That’s a distinction in what the agent must retrieve and understand, not a requirement that every system store them as two separate physical records. I wouldn’t model a facility merely as a loan with a few extra fields.

### turn 17 — app-user

I’d call them a **loan** and a **credit facility**, and the agent needs to distinguish them. A loan is the debt being repaid, with a principal amount and balance. A credit facility is an agreement that lets the borrower draw credit over time; its limit, amount extended, and amount available answer different questions from a loan’s principal amount. A facility can also have sub-facilities.

That’s a distinction in what the agent must retrieve and understand, not a requirement that every system store them as two separate physical records. I wouldn’t model a facility merely as a loan with a few extra fields.

### turn 17 — app-assistant

Confirmed: **loan** and **credit facility** are distinct concepts the agent must retrieve and understand, even if a system does not store them as separate physical records. A facility is not just a loan with extra fields.

To answer “which sub-facilities belong to a facility?”, must the agent identify each sub-facility separately? If so, is a sub-facility a **credit facility linked to a parent facility**, or a different kind of thing the agent handles differently?

### turn 17 — persona

Yes. The agent should be able to identify each **sub-facility** that forms part of a credit facility.

I’d treat a sub-facility as a **portion of the parent facility**, not simply another credit facility linked as its child. That matters because a portion may be committed or not yet confirmed as available, and a committed portion may be associated with particular collateral. The connection runs from the credit facility to the sub-facilities it contains.

### turn 18 — app-user

Yes. The agent should be able to identify each **sub-facility** that forms part of a credit facility.

I’d treat a sub-facility as a **portion of the parent facility**, not simply another credit facility linked as its child. That matters because a portion may be committed or not yet confirmed as available, and a committed portion may be associated with particular collateral. The connection runs from the credit facility to the sub-facilities it contains.

### turn 18 — app-assistant

Confirmed: **sub-facility** is a portion of a credit facility that the agent must identify separately, not merely another credit facility. A facility contains its sub-facilities. I’ll keep the committed and available distinctions in view when we reach decision-relevant properties, without assuming their exact fields yet.

For “who is the borrower and lender?” and “who services the loan?”, does the agent need to identify **borrower**, **lender**, and **servicer** separately? Are those the names you use for each?

### turn 18 — persona

Yes—**borrower**, **lender**, and **servicer** are the names I use, and the agent needs to distinguish them. The borrower owes repayment, the lender provides the credit, and the servicer collects principal and interest payments on the lender’s behalf. The servicer need not be the lender or the loan’s originator.

### turn 19 — app-user

Yes—**borrower**, **lender**, and **servicer** are the names I use, and the agent needs to distinguish them. The borrower owes repayment, the lender provides the credit, and the servicer collects principal and interest payments on the lender’s behalf. The servicer need not be the lender or the loan’s originator.

### turn 19 — app-assistant

Confirmed: **borrower**, **lender**, and **servicer** are distinct roles the agent needs to identify. The servicer collects payments on the lender’s behalf and may differ from the lender.

You also mentioned an **originator**. Does any question or review action we confirmed require the agent to identify the originator separately, or was that only to clarify that the servicer may be someone else?

### turn 19 — persona

That was only to clarify the servicer’s role. None of the questions or review actions we confirmed requires the agent to identify an originator separately.

### turn 20 — app-user

That was only to clarify the servicer’s role. None of the questions or review actions we confirmed requires the agent to identify an originator separately.

### turn 20 — app-assistant

Understood. **Originator** explains why servicer and lender should not be assumed to be the same party, but it is not a separate class needed for the confirmed questions or reviews.

For the interest and principal repayment questions—and the loan-readiness review, which checks for linked interest payment terms—does the agent need to identify **interest payment terms** and **principal repayment terms** as two separately linked things? Are those the names you use, or would you name either differently?

### turn 20 — persona

Yes—**interest payment terms** and **principal repayment terms** are the names I use, and the agent must keep them separate. Interest payment terms govern payment of interest, including its accrual basis; principal repayment terms govern repayment of principal.

For the loan-readiness review, the agent checks the applicable interest terms for an interest-bearing loan. I wouldn’t describe both sets of terms as necessarily having the same direct link to the loan: the important distinction is **which obligation each set of terms governs**.

### turn 21 — app-user

Yes—**interest payment terms** and **principal repayment terms** are the names I use, and the agent must keep them separate. Interest payment terms govern payment of interest, including its accrual basis; principal repayment terms govern repayment of principal.

For the loan-readiness review, the agent checks the applicable interest terms for an interest-bearing loan. I wouldn’t describe both sets of terms as necessarily having the same direct link to the loan: the important distinction is **which obligation each set of terms governs**.

### turn 21 — app-assistant

Confirmed: **interest payment terms** and **principal repayment terms** are distinct because they govern different obligations. I won’t assume they attach to the loan in the same way; we’ll establish the actual connections in the relationship phase.

For the checks on when interest is **calculated**, when it is **due**, and when the rate **resets**, must the agent identify three separate schedules—**interest calculation schedule**, **interest payment schedule**, and **interest-rate reset schedule**? Are those your names for them?

### turn 21 — persona

Yes, those are three separate schedules, and those names work. The **interest calculation schedule** gives the dates interest is calculated; the **interest payment schedule** gives the dates interest is due; and the **interest-rate reset schedule** gives the dates the rate is recalculated. A variable-rate setup review specifically checks for the reset schedule, not either of the other two.

### turn 22 — app-user

Yes, those are three separate schedules, and those names work. The **interest calculation schedule** gives the dates interest is calculated; the **interest payment schedule** gives the dates interest is due; and the **interest-rate reset schedule** gives the dates the rate is recalculated. A variable-rate setup review specifically checks for the reset schedule, not either of the other two.

### turn 22 — app-assistant

Confirmed: those are three distinct schedules, and the **variable-rate setup review** checks specifically for the interest-rate reset schedule. An interest calculation date is not an interest due date.

For the remaining “which schedules are on file, as applicable?” check, must the agent identify **loan payment schedule**, **principal payment schedule**, and **amortization schedule** separately? Are those the names you use, and does each serve a distinct purpose?

### turn 22 — persona

Yes. I’d identify all three separately:

- A **loan payment schedule** is the overall payment schedule associated with the loan.
- A **principal payment schedule** gives the dates on which principal is due to be repaid.
- An **amortization schedule** shows how periodic payments change the debt balance over time.

Those names work. A loan can have more than one relevant schedule, so I wouldn’t collapse them into a single schedule record.

### turn 23 — app-user

Yes. I’d identify all three separately:

- A **loan payment schedule** is the overall payment schedule associated with the loan.
- A **principal payment schedule** gives the dates on which principal is due to be repaid.
- An **amortization schedule** shows how periodic payments change the debt balance over time.

Those names work. A loan can have more than one relevant schedule, so I wouldn’t collapse them into a single schedule record.

### turn 23 — app-assistant

Confirmed: the **loan payment schedule**, **principal payment schedule**, and **amortization schedule** are separate things the agent may need to identify. More than one may apply to a loan.

For the security checks, does the agent need to identify and retrieve **collateral**, the **security agreement** supporting it, and any **credit enhancement agreement** as three separate things? Are those the terms you use? I won’t assume this adds a separately linked guaranty.

### turn 23 — persona

Yes, keep those three separate. **Collateral** is the asset or other security pledged; a **security agreement** grants rights over that collateral; and a **credit enhancement agreement** governs support that mitigates counterparty credit risk. The agent should identify the applicable agreement rather than treating the agreement as the collateral.

Those terms work, and they don’t add a separately linked guaranty to the checks we’ve agreed.

### turn 24 — app-user

Yes, keep those three separate. **Collateral** is the asset or other security pledged; a **security agreement** grants rights over that collateral; and a **credit enhancement agreement** governs support that mitigates counterparty credit risk. The agent should identify the applicable agreement rather than treating the agreement as the collateral.

Those terms work, and they don’t add a separately linked guaranty to the checks we’ve agreed.

### turn 24 — app-assistant

Confirmed: **collateral**, **security agreement**, and **credit enhancement agreement** are three distinct things the agent must identify. An agreement is not the collateral, and this does not add a separately linked guaranty.

To answer “who benefits from a credit enhancement agreement?”, must the agent identify a **beneficiary** separately from the borrower, lender, and servicer, or is the beneficiary always one of those already-named roles? What term do you use?

### turn 24 — persona

Identify the **credit enhancement beneficiary** separately as a role. It’s the party protected by the collateral or guarantee under that agreement. The same party might also be a lender in a particular deal, but I wouldn’t assume that; the agent should follow the beneficiary named in the credit enhancement agreement.

### turn 25 — app-user

Identify the **credit enhancement beneficiary** separately as a role. It’s the party protected by the collateral or guarantee under that agreement. The same party might also be a lender in a particular deal, but I wouldn’t assume that; the agent should follow the beneficiary named in the credit enhancement agreement.

### turn 25 — app-assistant

Confirmed: **credit enhancement beneficiary** is a separate role. The agent follows the beneficiary named in the agreement rather than assuming it is the lender.

For the servicing questions and payment-record completeness review, does the agent need to identify **payment history** and each **payment transaction** as separate things—the history for a loan and the transactions recorded in it? Are those the names you use?

### turn 25 — persona

Yes. I’d call them the loan’s **payment history** and its **individual payment transactions**. The history belongs to the loan; each actual payment transaction is recorded in that history. The completeness review checks both links once payments have occurred, rather than treating the existence of an empty history as evidence of payments.

### turn 26 — app-user

Yes. I’d call them the loan’s **payment history** and its **individual payment transactions**. The history belongs to the loan; each actual payment transaction is recorded in that history. The completeness review checks both links once payments have occurred, rather than treating the existence of an empty history as evidence of payments.

### turn 26 — app-assistant

Confirmed: **payment history** belongs to the loan, and **individual payment transactions** are recorded in that history. The completeness review needs both connections; an empty history does not show that payments occurred.

For the question “what prepayment terms apply?” and the penalty-timing review, does the agent need to identify **prepayment terms** as a separate thing, or can it answer both from values recorded on the loan? Is “prepayment terms” the name you use?

### turn 26 — persona

Yes, **prepayment terms** are a distinct set of principal repayment terms, and that’s the name I’d use. They describe repayment before maturity; a penalty period, when applicable, is measured in months.

For the penalty-timing review, the agent checks that the period is recorded for the loan. I wouldn’t infer from that check alone that prepayment terms are directly linked to the loan in the same way as its schedules.

### turn 27 — app-user

Yes, **prepayment terms** are a distinct set of principal repayment terms, and that’s the name I’d use. They describe repayment before maturity; a penalty period, when applicable, is measured in months.

For the penalty-timing review, the agent checks that the period is recorded for the loan. I wouldn’t infer from that check alone that prepayment terms are directly linked to the loan in the same way as its schedules.

### turn 27 — app-assistant

Confirmed: **prepayment terms** need to be identifiable separately because they govern repayment before maturity and support the penalty-timing review. I won’t assume they have the same direct link to the loan as a schedule.

Each of the five reviews must retain its result and the records or links checked. Does the agent need to **retrieve each review finding later as a distinct thing**—for example, to show which links supported a readiness confirmation—or is retaining that information within the review process enough for this model? What would you call it?

### turn 27 — persona

Retaining the result and what was checked within the review process is enough for this model. I’d call that the **review finding and supporting evidence**, but I wouldn’t add a separately retrievable review-finding record as a requirement.

For example, a readiness finding should let us verify that the borrower, lender, and applicable interest terms were checked. The model doesn’t specify a separate record type or storage method for that finding.

### turn 28 — app-user

Retaining the result and what was checked within the review process is enough for this model. I’d call that the **review finding and supporting evidence**, but I wouldn’t add a separately retrievable review-finding record as a requirement.

For example, a readiness finding should let us verify that the borrower, lender, and applicable interest terms were checked. The model doesn’t specify a separate record type or storage method for that finding.

### turn 28 — app-assistant

Understood. The **review finding and supporting evidence** must be retained and verifiable, but the agent does not need a separately retrievable review-finding record. I won’t add one as a class.

For the borrower’s assessed borrowing capacity, does the agent need to identify a separate **assessment**, or is the assessed amount recorded on the borrower enough to answer the confirmed question?

### turn 28 — persona

The assessed amount alone on the borrower isn’t quite enough for how I’d handle it. The agent should identify the borrower’s **borrowing capacity** separately and read the amount from it. That represents the lender’s assessment of what the borrower can repay at a point in time; it is not, by itself, approval to extend more credit. I wouldn’t add a separate assessment-process record.

### turn 29 — app-user

The assessed amount alone on the borrower isn’t quite enough for how I’d handle it. The agent should identify the borrower’s **borrowing capacity** separately and read the amount from it. That represents the lender’s assessment of what the borrower can repay at a point in time; it is not, by itself, approval to extend more credit. I wouldn’t add a separate assessment-process record.

### turn 29 — app-assistant

Confirmed: **borrowing capacity** is a separately identifiable assessment for a borrower, with an assessed amount. It is not an approval to extend credit, and we don’t need a separate assessment-process record.

For the collateral-value question, does the agent need to identify a separate **collateral valuation** record, or is the appraised value and its as-of date on the collateral enough? What would you call it if it is separate?

### turn 29 — persona

The agent should identify a **dated collateral value** associated with the collateral, rather than rely on an undated value on the collateral itself. It carries both the appraised value and its as-of date, so we can tell which valuation was used. I wouldn’t assume that means a separate physical valuation document or database record in every system.

### turn 30 — app-user

The agent should identify a **dated collateral value** associated with the collateral, rather than rely on an undated value on the collateral itself. It carries both the appraised value and its as-of date, so we can tell which valuation was used. I wouldn’t assume that means a separate physical valuation document or database record in every system.

### turn 30 — app-assistant

Confirmed: **dated collateral value** is something the agent identifies for collateral; it carries the appraised amount and as-of date. That does not require a separate document or physical record in every system.

For **loan-to-value** and **combined loan-to-value**, does the agent need to identify separate assessments, or are two values recorded for the loan enough to answer those questions?

### turn 30 — persona

The agent should identify **loan-to-value ratio** and **combined loan-to-value ratio** separately for a collateralized loan, and read each ratio’s numeric value. They measure different things: one compares this loan’s principal with the appraised collateral value; the other considers the total debt secured by the asset or assets.

That doesn’t mean we need two separate assessment-process records—or that every system must store the ratios as separate physical records.

### turn 31 — app-user

The agent should identify **loan-to-value ratio** and **combined loan-to-value ratio** separately for a collateralized loan, and read each ratio’s numeric value. They measure different things: one compares this loan’s principal with the appraised collateral value; the other considers the total debt secured by the asset or assets.

That doesn’t mean we need two separate assessment-process records—or that every system must store the ratios as separate physical records.

### turn 31 — app-assistant

Confirmed: **loan-to-value ratio** and **combined loan-to-value ratio** are different measures, and the agent must read each numeric value. They need not be separate physical records.

For this model, does the agent need to identify either ratio as a distinct item **linked to a particular dated collateral value**, or is it enough to keep two clearly named numeric values for the collateralized loan?
