# Ontology-recovery eval — conversation log

Status: **stages_complete** — 113 turn(s) so far, 1382s elapsed.
Last updated: 2026-10-20T09:16:00.211Z

### Turn 0 — persona

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### Turn 1 — app-user

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### Turn 1 — app-tool

🔍 Checked the current ontology state.

### Turn 1 — app-assistant

We’ll start with the real work the agent must support, then use it to build a small model of the loans, people, connections, decisions, and actions involved. We’ll check each part with you as we go.

You’ve already given a clear starting point: approved-loan setup and ongoing servicing. **What questions would you expect the agent to answer in that work?** A first batch of about 5–8, in your own words, is fine.

### Turn 1 — persona

I’d start with the questions we use when a loan comes over for setup and then starts being serviced:

- Who is the borrower, and who is the lender?
- What principal amount, interest rate, and maturity date are we working from?
- What do the terms say about paying back principal and paying interest?
- Which payment schedules are on file, and do they match those terms?
- Is the loan secured? If so, what collateral is recorded to support it?
- Who is servicing the loan and collecting payments for the lender?
- If the rate can change, when are resets scheduled?
- What payments have actually been made, and are the individual transactions captured in the payment history?

That gives us a useful first pass at both setup and ongoing tracking.

### Turn 2 — app-user

I’d start with the questions we use when a loan comes over for setup and then starts being serviced:

- Who is the borrower, and who is the lender?
- What principal amount, interest rate, and maturity date are we working from?
- What do the terms say about paying back principal and paying interest?
- Which payment schedules are on file, and do they match those terms?
- Is the loan secured? If so, what collateral is recorded to support it?
- Who is servicing the loan and collecting payments for the lender?
- If the rate can change, when are resets scheduled?
- What payments have actually been made, and are the individual transactions captured in the payment history?

That gives us a useful first pass at both setup and ongoing tracking.

### Turn 2 — app-assistant

That gives us a useful setup-and-servicing acceptance test. I’d split the first four points into these questions so each can be checked separately:

1. Who is the borrower on a loan?
2. Who is the lender on a loan?
3. What principal amount, interest rate, and maturity date govern the loan?
4. How do the terms require principal to be repaid?
5. How do the terms require interest to be paid?
6. Which payment schedules are on file for the loan?
7. Do those schedules match the repayment and interest terms?

Does this preserve what you meant by those first four points?

### Turn 2 — persona

Yes, that preserves what I meant. Splitting borrower from lender, and principal repayment from interest payment, makes each check clearer.

I’d keep one distinction in mind for questions 6 and 7: **what schedules are on file** is a record check; **whether they match the terms** is a comparison. For interest, that comparison includes when payment is due and how accrual is calculated, including the day-count convention. For principal, it depends on the repayment structure—for an amortizing loan, I’d expect an amortization schedule alongside the principal repayment terms. I wouldn’t treat every type of schedule as mandatory for every loan.

### Turn 3 — app-user

Yes, that preserves what I meant. Splitting borrower from lender, and principal repayment from interest payment, makes each check clearer.

I’d keep one distinction in mind for questions 6 and 7: **what schedules are on file** is a record check; **whether they match the terms** is a comparison. For interest, that comparison includes when payment is due and how accrual is calculated, including the day-count convention. For principal, it depends on the repayment structure—for an amortizing loan, I’d expect an amortization schedule alongside the principal repayment terms. I wouldn’t treat every type of schedule as mandatory for every loan.

### Turn 3 — app-tool

✓ Applied: 8 added, 0 updated.

### Turn 3 — app-assistant

I’ve recorded those eight questions. The distinction is explicit: finding schedules is one check; comparing them with the applicable terms is another. The comparison includes interest due dates, accrual and day-count convention, without assuming every loan needs every schedule.

For the remaining points, would these questions capture your intent?

1. Is the loan secured?
2. What collateral is recorded for a secured loan?
3. Who services the loan?
4. Who collects payments for the lender?
5. For a rate that can change, when are resets scheduled?
6. What payments have been made on the loan?
7. Are the individual payment transactions captured in its payment history?

### Turn 3 — persona

Yes, those capture the remaining checks. I’d keep two distinctions visible:

- **Secured status and collateral support are separate checks.** If a loan is recorded as secured, we need to see the collateral linked to it; a “secured” label alone isn’t enough for that check. A guarantee is a different form of support, so don’t silently treat it as pledged collateral.
- **The servicer questions may have the same answer.** The servicer is the party responsible for collecting payments on the lender’s behalf; that party need not be the lender.

For a changing rate, the reset schedule is the key setup check. A rate cap or first rate-change term may also be relevant, but I wouldn’t assume either applies to every variable-rate loan. And if payment history has no individual transactions recorded, we should say the record is incomplete for tracking—not conclude that no payments were made.

### Turn 4 — app-user

Yes, those capture the remaining checks. I’d keep two distinctions visible:

- **Secured status and collateral support are separate checks.** If a loan is recorded as secured, we need to see the collateral linked to it; a “secured” label alone isn’t enough for that check. A guarantee is a different form of support, so don’t silently treat it as pledged collateral.
- **The servicer questions may have the same answer.** The servicer is the party responsible for collecting payments on the lender’s behalf; that party need not be the lender.

For a changing rate, the reset schedule is the key setup check. A rate cap or first rate-change term may also be relevant, but I wouldn’t assume either applies to every variable-rate loan. And if payment history has no individual transactions recorded, we should say the record is incomplete for tracking—not conclude that no payments were made.

### Turn 4 — app-tool

✓ Applied: 6 added, 0 updated.

### Turn 4 — app-assistant

I’ve recorded the remaining six questions, giving us 14. The model will keep collateral distinct from other support, and it won’t infer “no payments” from an empty transaction history. I’ve kept servicing and collecting together because you’ve said the servicer is responsible for collection.

**What actions must the agent perform**, rather than just answer questions about? Please name roughly 5–10 concrete actions from setup or ongoing servicing, in your own words.

### Turn 4 — persona

I’d give the agent five concrete checks to perform:

1. **Assess loan setup readiness:** Check the loan has a borrower and lender, and that an interest-bearing loan has an applicable rate and interest payment terms. Confirm which links are present and flag what’s missing.
2. **Verify secured-loan support:** For a secured loan, check that collateral is actually linked to it. Record the result; don’t rely on the secured designation alone.
3. **Review variable-rate setup:** For a loan with a variable rate, confirm its rate-reset schedule is on file.
4. **Review payment-record completeness:** Check that the loan has a payment history and that the history contains individual payment transactions. An incomplete record is a tracking issue, not proof that no one paid.
5. **Review prepayment-penalty timing:** Where a prepayment penalty applies, check that its term in months is recorded.

These are checks and confirmations. I wouldn’t have the agent approve credit, change contract terms, or post a payment on the strength of these checks alone.

### Turn 5 — app-user

I’d give the agent five concrete checks to perform:

1. **Assess loan setup readiness:** Check the loan has a borrower and lender, and that an interest-bearing loan has an applicable rate and interest payment terms. Confirm which links are present and flag what’s missing.
2. **Verify secured-loan support:** For a secured loan, check that collateral is actually linked to it. Record the result; don’t rely on the secured designation alone.
3. **Review variable-rate setup:** For a loan with a variable rate, confirm its rate-reset schedule is on file.
4. **Review payment-record completeness:** Check that the loan has a payment history and that the history contains individual payment transactions. An incomplete record is a tracking issue, not proof that no one paid.
5. **Review prepayment-penalty timing:** Where a prepayment penalty applies, check that its term in months is recorded.

These are checks and confirmations. I wouldn’t have the agent approve credit, change contract terms, or post a payment on the strength of these checks alone.

### Turn 5 — app-assistant

Those five checks set a clear boundary: the agent reviews and records findings; it does not approve credit, change terms, or post payments. Together with the 14 recorded questions, they give us the starting requirements.

One narrow check before we choose the kinds of things to model: **for the borrower, lender, and servicer, is there a closely related role beneath any of them that does the day-to-day work the agent needs to identify separately; and does any of these questions or checks depend on a specific operating context that changes how it is handled?**

### Turn 5 — persona

No further day-to-day role beneath borrower, lender, or servicer is needed for these checks. We identify the borrower who owes the debt, the lender who provides the credit, and the servicer responsible for collecting payments on the lender’s behalf. The servicer may be a different party from the lender.

The checks do depend on **what kind of loan is being reviewed**, rather than a separate operating context: the reset-schedule check applies to a variable-rate loan, the collateral check to a secured loan, and the prepayment-timing check where a penalty applies. We shouldn’t impose those checks indiscriminately on every loan.

### Turn 6 — app-user

No further day-to-day role beneath borrower, lender, or servicer is needed for these checks. We identify the borrower who owes the debt, the lender who provides the credit, and the servicer responsible for collecting payments on the lender’s behalf. The servicer may be a different party from the lender.

The checks do depend on **what kind of loan is being reviewed**, rather than a separate operating context: the reset-schedule check applies to a variable-rate loan, the collateral check to a secured loan, and the prepayment-timing check where a penalty applies. We shouldn’t impose those checks indiscriminately on every loan.

### Turn 6 — app-assistant

That completes the starting requirements: 14 recorded questions and five review actions. No additional day-to-day role or separate operating context is needed. The checks depend on the loan’s applicable terms—variable rate, secured status, and whether a prepayment penalty applies—not on a blanket requirement for every loan.

Is that an accurate summary of the scope before we identify the kinds of things the agent must recognize and connect?

### Turn 6 — persona

Yes, that’s accurate for the starting scope. The agent answers setup and servicing questions and performs the five review checks; it doesn’t make credit decisions or change or post transactions. Each check applies only where the loan’s structure or terms call for it.

### Turn 7 — app-user

Yes, that’s accurate for the starting scope. The agent answers setup and servicing questions and performs the five review checks; it doesn’t make credit decisions or change or post transactions. Each check applies only where the loan’s structure or terms call for it.

### Turn 7 — app-assistant

Starting scope confirmed. I’ll now identify only the kinds of things the agent needs to work with, rather than every field that might exist in a system.

First batch: **Loan**, **Borrower**, and **Lender**. The agent needs a loan to anchor the recorded questions and reviews, and it needs to identify the borrower and lender separately to answer “Who is the borrower on a loan?” and “Who is the lender on a loan?” Does it need to identify, retrieve, or connect each of these three as a distinct thing?

### Turn 7 — persona

Yes. The loan is the record we’re checking. From that loan, the agent needs to identify **its borrower**—the party obliged to repay—and **its lender**—the party that extended the credit. Those are distinct roles and should be retrievable separately, even if a particular party appears in different roles on different loans.

### Turn 8 — app-user

Yes. The loan is the record we’re checking. From that loan, the agent needs to identify **its borrower**—the party obliged to repay—and **its lender**—the party that extended the credit. Those are distinct roles and should be retrievable separately, even if a particular party appears in different roles on different loans.

### Turn 8 — app-tool

✓ Applied: 3 added, 0 updated.

### Turn 8 — app-assistant

Recorded Loan, Borrower, and Lender as distinct kinds of things. A party can appear in different roles across loans; that does not make the borrower and lender roles interchangeable on a given loan.

Next, the schedule and terms questions suggest **Loan Terms** and **Payment Schedule** as candidates. Does the agent need to retrieve or connect each as a distinct record for the loan, or are the terms only values on the Loan and the schedules recorded another way?

### Turn 8 — persona

Yes, the agent needs to work with terms and schedules separately from the loan, but I wouldn’t put all the terms into one undifferentiated “Loan Terms” record.

Principal repayment terms say how principal is to be repaid; interest payment terms say how interest is paid and calculated. Prepayment terms are separate when they apply. Likewise, a general loan payment schedule can be on file, but the agent may also need to distinguish an amortization schedule from principal-payment and interest-payment schedules. That lets it find the relevant schedule and compare it with the right terms, rather than treating every schedule as interchangeable.

### Turn 9 — app-user

Yes, the agent needs to work with terms and schedules separately from the loan, but I wouldn’t put all the terms into one undifferentiated “Loan Terms” record.

Principal repayment terms say how principal is to be repaid; interest payment terms say how interest is paid and calculated. Prepayment terms are separate when they apply. Likewise, a general loan payment schedule can be on file, but the agent may also need to distinguish an amortization schedule from principal-payment and interest-payment schedules. That lets it find the relevant schedule and compare it with the right terms, rather than treating every schedule as interchangeable.

### Turn 9 — app-assistant

The comparison you described justifies distinguishing principal repayment terms from interest payment terms, with prepayment terms where they apply. You’ve also named different schedules because the agent compares each with the relevant terms.

Before recording the schedule classes, one distinction matters: **is a “general loan payment schedule” a separate record the agent retrieves alongside the amortization, principal-payment, and interest-payment schedules, or is “payment schedule” just your umbrella name for those schedules?**

### Turn 9 — persona

It’s a separate schedule the agent can retrieve for a loan, not just my umbrella name. The loan may also have an amortization schedule, a principal-payment schedule, or an interest-payment schedule. Keep those distinct: the general loan payment schedule gives the loan’s regular or explicitly scheduled payments, while the more specific schedules address how the balance changes or when principal or interest is due. Having one on file does not, by itself, tell us the others are there.

### Turn 10 — app-user

It’s a separate schedule the agent can retrieve for a loan, not just my umbrella name. The loan may also have an amortization schedule, a principal-payment schedule, or an interest-payment schedule. Keep those distinct: the general loan payment schedule gives the loan’s regular or explicitly scheduled payments, while the more specific schedules address how the balance changes or when principal or interest is due. Having one on file does not, by itself, tell us the others are there.

### Turn 10 — app-tool

✓ Applied: 7 added, 0 updated.

### Turn 10 — app-assistant

Recorded those terms and schedules separately. The general loan payment schedule is its own retrievable record; it does not stand in for the amortization, principal-payment, or interest-payment schedules.

For the secured-loan and servicing questions, does the agent need to identify or retrieve **Collateral** and **Servicer** as distinct things linked to a loan? I’m not treating a guarantee as collateral.

### Turn 10 — persona

Yes. The agent needs to identify the **servicer** from the loan: that’s the party responsible for collecting payments on the lender’s behalf.

It also needs to retrieve **collateral** linked to a secured loan to verify that collateral support is recorded. A secured designation alone doesn’t establish that link, and a guarantee shouldn’t be recorded as collateral. A security agreement is a separate record concerning rights over pledged collateral; it isn’t the collateral itself.

### Turn 11 — app-user

Yes. The agent needs to identify the **servicer** from the loan: that’s the party responsible for collecting payments on the lender’s behalf.

It also needs to retrieve **collateral** linked to a secured loan to verify that collateral support is recorded. A secured designation alone doesn’t establish that link, and a guarantee shouldn’t be recorded as collateral. A security agreement is a separate record concerning rights over pledged collateral; it isn’t the collateral itself.

### Turn 11 — app-tool

✓ Applied: 2 added, 0 updated.

### Turn 11 — app-assistant

Recorded Servicer and Collateral separately. I’ve left Security Agreement out for now: you’ve distinguished it from collateral, but none of the confirmed questions or checks yet requires the agent to retrieve it.

For “when are rate resets scheduled?” and the payment-history checks, does the agent need to retrieve **Rate Reset Schedule**, **Payment History**, and each **Payment Transaction** as three distinct things?

### Turn 11 — persona

Yes, three distinct things. The loan has a schedule for **interest-rate resets**; that tells us when the rate is due to be reconsidered, not what payments were made.

Separately, the loan has a **payment history**, and that history contains the **individual payment transactions**. The distinction matters: we check both that the history exists and that it contains transaction entries. Missing entries make the record incomplete for tracking; they don’t prove that no payment occurred.

### Turn 12 — app-user

Yes, three distinct things. The loan has a schedule for **interest-rate resets**; that tells us when the rate is due to be reconsidered, not what payments were made.

Separately, the loan has a **payment history**, and that history contains the **individual payment transactions**. The distinction matters: we check both that the history exists and that it contains transaction entries. Missing entries make the record incomplete for tracking; they don’t prove that no payment occurred.

### Turn 12 — app-tool

✓ Applied: 3 added, 0 updated.

### Turn 12 — app-assistant

That completes the class candidates tied to the starting requirements: Loan; Borrower, Lender, and Servicer; three kinds of terms; four distinct payment schedules; Collateral; Rate Reset Schedule; Payment History; and Payment Transaction. I’ve recorded each as a separate kind of thing, without adding a guarantee or security agreement just because they may exist.

Does that set preserve the distinctions the agent needs for the 14 questions and five checks?

### Turn 12 — persona

It preserves the distinctions we’ve discussed so far, but it isn’t quite sufficient for all the questions and checks.

The agent also needs to distinguish **principal from interest**, so it can tell which obligation each set of payment terms governs. It needs to distinguish a **fixed rate from a variable rate** to know whether the reset-schedule check applies. And it needs to recognize when a loan is **secured** before checking for linked collateral. The prepayment review also needs the penalty term in months recorded where a penalty applies; that can be a value on the applicable terms rather than another kind of record.

### Turn 13 — app-user

It preserves the distinctions we’ve discussed so far, but it isn’t quite sufficient for all the questions and checks.

The agent also needs to distinguish **principal from interest**, so it can tell which obligation each set of payment terms governs. It needs to distinguish a **fixed rate from a variable rate** to know whether the reset-schedule check applies. And it needs to recognize when a loan is **secured** before checking for linked collateral. The prepayment review also needs the penalty term in months recorded where a penalty applies; that can be a value on the applicable terms rather than another kind of record.

### Turn 13 — app-assistant

Agreed: fixed versus variable rate, secured status, and the penalty term can be decision-bearing values rather than separate records. We’ll specify those when we capture properties.

For **principal** and **interest**, does the agent need to identify either as a separate record linked to the loan, or is the distinction fully carried by Principal Repayment Terms and Interest Payment Terms, plus the loan values it checks?

### Turn 13 — persona

The distinction isn’t fully carried by the terms or by amounts on the loan. The agent needs to connect the loan to its **principal** and **interest** separately: principal repayment terms govern payment of the principal, while interest payment terms govern payment of the interest.

I’d also correct one point before we move on: fixed and variable interest rates are distinct rate arrangements linked to a loan, not merely a yes-or-no field. That distinction is what makes the reset-schedule review applicable. A secured loan is likewise a kind of loan, while the prepayment-penalty period is a value on the applicable prepayment terms.

### Turn 14 — app-user

The distinction isn’t fully carried by the terms or by amounts on the loan. The agent needs to connect the loan to its **principal** and **interest** separately: principal repayment terms govern payment of the principal, while interest payment terms govern payment of the interest.

I’d also correct one point before we move on: fixed and variable interest rates are distinct rate arrangements linked to a loan, not merely a yes-or-no field. That distinction is what makes the reset-schedule review applicable. A secured loan is likewise a kind of loan, while the prepayment-penalty period is a value on the applicable prepayment terms.

### Turn 14 — app-tool

✓ Applied: 4 added, 0 updated.

### Turn 14 — app-assistant

I’ve added Principal, Interest, Fixed Interest Rate, and Variable Interest Rate as distinct things the agent must connect to the loan. I also accept the correction: the rate arrangements are not merely a yes-or-no field. The prepayment-penalty period remains a value to capture on applicable terms.

One point needs resolving before relationships: this tool cannot represent “Secured Loan is a kind of Loan” as a subclass. **Does the agent retrieve a secured loan as a separate record with its own operational connections, or does it identify a Loan as secured from a value on that Loan, then check its collateral link?**

### Turn 14 — persona

It’s the **same loan record**, not a second loan record to retrieve. The agent needs to recognize that the loan is a secured loan, then check whether collateral is linked to it. If the tool can’t express “secured loan is a kind of loan,” a secured classification on the loan can support that check—but keep the collateral link explicit. Don’t infer collateral merely from the classification.

### Turn 15 — app-user

It’s the **same loan record**, not a second loan record to retrieve. The agent needs to recognize that the loan is a secured loan, then check whether collateral is linked to it. If the tool can’t express “secured loan is a kind of loan,” a secured classification on the loan can support that check—but keep the collateral link explicit. Don’t infer collateral merely from the classification.

### Turn 15 — app-assistant

That resolves the class boundary: **Secured Loan is not a second record**. The agent will use a secured classification on Loan to decide when to check an explicit collateral link. It will not infer collateral from the classification.

We now have the kinds of things needed for the agreed questions and checks, including separate principal and interest obligations and separate rate arrangements. Is that class set confirmed before we map how these things connect?

### Turn 15 — persona

Almost. The set covers the parties, obligations, rates, collateral, schedules, and payment records we’ve discussed. One thing is still missing for the agreed comparison check: the **day-count convention** used to calculate interest accrual. The interest payment terms need to point to it so the agent can check how interest is calculated, not just when it is due.

With that added, I’m comfortable mapping the connections.

### Turn 16 — app-user

Almost. The set covers the parties, obligations, rates, collateral, schedules, and payment records we’ve discussed. One thing is still missing for the agreed comparison check: the **day-count convention** used to calculate interest accrual. The interest payment terms need to point to it so the agent can check how interest is calculated, not just when it is due.

With that added, I’m comfortable mapping the connections.

### Turn 16 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 16 — app-assistant

Day Count Convention is now recorded as a distinct thing that interest payment terms can point to. That completes the class set you confirmed.

Let’s map the connections, starting with the parties. **From a Loan, how does the agent reach its Borrower, Lender, and Servicer?** Are these three direct links on the loan, or does any of them require going through another record?

### Turn 16 — persona

They’re three direct links from the loan. The loan identifies its **borrower** and its **lender** separately, and it identifies the **servicer** responsible for servicing it. The agent doesn’t need to go through the lender to find the servicer; the servicer may be a different party.

### Turn 17 — app-user

They’re three direct links from the loan. The loan identifies its **borrower** and its **lender** separately, and it identifies the **servicer** responsible for servicing it. The agent doesn’t need to go through the lender to find the servicer; the servicer may be a different party.

### Turn 17 — app-tool

✓ Applied: 3 added, 0 updated.

### Turn 17 — app-assistant

Recorded three direct links from Loan: to its Borrower, Lender, and Servicer. The servicer link does not depend on going through the lender.

For the principal and interest questions, **what path connects a Loan to each obligation and its governing terms?** In particular, do Principal Repayment Terms connect directly to Principal, and Interest Payment Terms directly to Interest, or do those connections work another way?

### Turn 17 — persona

The loan connects directly to its **principal** and, separately, to its **interest**. Then the **principal repayment terms govern payment of that principal**, and the **interest payment terms govern payment of that interest**. Those are direct term-to-obligation connections, not a single combined terms link standing in for both.

For interest calculations, the interest payment terms also point to the day-count convention used as their accrual basis.

### Turn 18 — app-user

The loan connects directly to its **principal** and, separately, to its **interest**. Then the **principal repayment terms govern payment of that principal**, and the **interest payment terms govern payment of that interest**. Those are direct term-to-obligation connections, not a single combined terms link standing in for both.

For interest calculations, the interest payment terms also point to the day-count convention used as their accrual basis.

### Turn 18 — app-tool

✓ Applied: 5 added, 0 updated.

### Turn 18 — app-assistant

Recorded the two paths: Loan links to Principal and Interest separately; each obligation has its own governing payment terms. Interest Payment Terms also point to the Day Count Convention used for accrual.

To retrieve the applicable terms for a particular loan, **how does the agent get from that Loan to its Principal Repayment Terms, Interest Payment Terms, and—where applicable—Prepayment Terms?** Are those direct loan-to-terms links?

### Turn 18 — persona

Not as direct loan-to-terms links in the connections we’ve described. The agent starts with the loan’s **principal** and **interest**, then finds the principal repayment terms that govern payment of that principal and the interest payment terms that govern payment of that interest.

**Prepayment terms** are a more specific kind of principal repayment terms, used where early repayment provisions apply. I wouldn’t invent a separate direct loan-to-prepayment-terms link. The prepayment review checks the applicable penalty period recorded with those terms.

### Turn 19 — app-user

Not as direct loan-to-terms links in the connections we’ve described. The agent starts with the loan’s **principal** and **interest**, then finds the principal repayment terms that govern payment of that principal and the interest payment terms that govern payment of that interest.

**Prepayment terms** are a more specific kind of principal repayment terms, used where early repayment provisions apply. I wouldn’t invent a separate direct loan-to-prepayment-terms link. The prepayment review checks the applicable penalty period recorded with those terms.

### Turn 19 — app-assistant

The agreed path to the main terms is clear: Loan → Principal → Principal Repayment Terms, and Loan → Interest → Interest Payment Terms. I won’t add direct loan-to-terms links.

“Prepayment Terms are a more specific kind of Principal Repayment Terms” is a type distinction this tool cannot record as a relationship. **When early-repayment provisions apply, what operational connection lets the agent find the applicable Prepayment Terms from the principal or its repayment terms?**

### Turn 19 — persona

There isn’t a separate operational link I can confirm from the principal or its repayment terms to a prepayment-terms record. Prepayment terms are the applicable principal repayment terms **when the provision concerns early repayment**.

If the tool can’t represent that distinction, we should mark this as a modeling gap rather than invent a link. The agent still needs to find the applicable prepayment terms and check whether the penalty period in months is recorded; the connections we’ve mapped so far don’t fully specify how it retrieves them.

### Turn 20 — app-user

There isn’t a separate operational link I can confirm from the principal or its repayment terms to a prepayment-terms record. Prepayment terms are the applicable principal repayment terms **when the provision concerns early repayment**.

If the tool can’t represent that distinction, we should mark this as a modeling gap rather than invent a link. The agent still needs to find the applicable prepayment terms and check whether the penalty period in months is recorded; the connections we’ve mapped so far don’t fully specify how it retrieves them.

### Turn 20 — app-assistant

Understood. **Prepayment-term retrieval remains an open modeling gap**: we know what the review must check, but not a confirmed connection for finding the applicable terms. I won’t invent one or treat “more specific kind of” as a relationship.

Next, for the rate setup check, **how does the agent get from a Loan to its Fixed Interest Rate or Variable Interest Rate, and from a variable rate to its Rate Reset Schedule?** Which of those links are direct facts?

### Turn 20 — persona

The loan links directly to whichever rate arrangement applies: a **fixed interest rate** or a **variable interest rate**. For the variable-rate setup check, the **loan also links directly to its interest-rate reset schedule**. We don’t reach that schedule through the variable-rate record.

So the agent checks both facts on the same loan: it has a variable rate, and it has a reset schedule. A fixed-rate loan doesn’t trigger that reset-schedule check.

### Turn 21 — app-user

The loan links directly to whichever rate arrangement applies: a **fixed interest rate** or a **variable interest rate**. For the variable-rate setup check, the **loan also links directly to its interest-rate reset schedule**. We don’t reach that schedule through the variable-rate record.

So the agent checks both facts on the same loan: it has a variable rate, and it has a reset schedule. A fixed-rate loan doesn’t trigger that reset-schedule check.

### Turn 21 — app-tool

✓ Applied: 3 added, 0 updated.

### Turn 21 — app-assistant

Recorded the rate links directly from Loan: to its applicable fixed or variable rate arrangement, and—where relevant—to its Rate Reset Schedule. The reset schedule is not reached through the variable-rate record.

For the schedule-comparison questions, **how does the agent get from a Loan to each schedule on file**—Loan Payment Schedule, Amortization Schedule, Principal Payment Schedule, and Interest Payment Schedule? Are they each linked directly to the loan, or are some reached through an obligation or its terms?

### Turn 21 — persona

Each is linked **directly from the loan**: the general loan payment schedule, amortization schedule, principal-payment schedule, and interest-payment schedule. The agent retrieves each schedule that is on file for that loan, then compares it with the applicable terms.

We shouldn’t infer one schedule from another, or assume all four must be present. For an amortizing loan, though, the amortization schedule is part of the specific completeness check.

### Turn 22 — app-user

Each is linked **directly from the loan**: the general loan payment schedule, amortization schedule, principal-payment schedule, and interest-payment schedule. The agent retrieves each schedule that is on file for that loan, then compares it with the applicable terms.

We shouldn’t infer one schedule from another, or assume all four must be present. For an amortizing loan, though, the amortization schedule is part of the specific completeness check.

### Turn 22 — app-tool

✓ Applied: 4 added, 0 updated.

### Turn 22 — app-assistant

Recorded four separate direct schedule links from Loan. Their presence is checked individually; none implies another, and the amortization requirement applies only when the loan is amortizing.

For the remaining record paths, **how does the agent get from a Loan to its Collateral and Payment History, and from that history to individual Payment Transactions?** Are those direct links at each step?

### Turn 22 — persona

Yes, with the secured-loan qualification:

- A **secured loan points directly to its collateral**. There’s no need to go through a security agreement to find the collateral for this check.
- A **loan points directly to its payment history**.
- The **payment history contains the individual payment transactions**; those are reached through the history, not assumed from a loan-level total.

If the history has no transaction entries, we flag the record as incomplete for tracking rather than conclude that no payments occurred.

### Turn 23 — app-user

Yes, with the secured-loan qualification:

- A **secured loan points directly to its collateral**. There’s no need to go through a security agreement to find the collateral for this check.
- A **loan points directly to its payment history**.
- The **payment history contains the individual payment transactions**; those are reached through the history, not assumed from a loan-level total.

If the history has no transaction entries, we flag the record as incomplete for tracking rather than conclude that no payments occurred.

### Turn 23 — app-tool

✓ Applied: 3 added, 0 updated.

### Turn 23 — app-tool

🔍 Checked the current ontology state.

### Turn 23 — app-assistant

Those links are recorded. I checked the live model: every class now has a connection except **Prepayment Terms**. Its retrieval path remains the gap you identified; I won’t fill it with an invented link.

Before leaving connections, I want to check the path behind the schedule comparisons. **When comparing a loan’s principal-payment or amortization schedule with its principal repayment terms, and its interest-payment schedule with its interest payment terms, does the agent bring them together through the Loan and its Principal or Interest, or is there a separate direct schedule-to-terms link?**

### Turn 23 — persona

Bring them together in the context of the **loan**. The loan identifies the schedules on file and its principal and interest obligations; the applicable terms govern payment of those respective obligations. There isn’t a separate direct schedule-to-terms link I’d add.

That gives the agent the records to compare. Whether the dates and payment pattern actually agree with the terms is a check it performs, not a connection to infer simply because both records belong to the loan.

### Turn 24 — app-user

Bring them together in the context of the **loan**. The loan identifies the schedules on file and its principal and interest obligations; the applicable terms govern payment of those respective obligations. There isn’t a separate direct schedule-to-terms link I’d add.

That gives the agent the records to compare. Whether the dates and payment pattern actually agree with the terms is a check it performs, not a connection to infer simply because both records belong to the loan.

### Turn 24 — app-assistant

The comparison path is confirmed: the agent brings each schedule and the governing terms together through the same Loan and its Principal or Interest. There is no direct schedule-to-terms link, and agreement must be checked rather than inferred.

One remaining path concerns the interest-rate question: **is the applicable fixed or variable rate connected to the loan’s Interest obligation or Interest Payment Terms as a separate direct fact, or does the agent bring them together through the Loan?**

### Turn 24 — persona

Bring them together through the **loan**. The loan links to its interest obligation and to its applicable fixed or variable rate. The interest payment terms govern payment of that interest; I wouldn’t add a separate rate-to-interest or rate-to-terms link.

### Turn 25 — app-user

Bring them together through the **loan**. The loan links to its interest obligation and to its applicable fixed or variable rate. The interest payment terms govern payment of that interest; I wouldn’t add a separate rate-to-interest or rate-to-terms link.

### Turn 25 — app-assistant

Confirmed: the loan is the common path to its Interest obligation and applicable rate. I won’t add a rate-to-interest or rate-to-terms link.

**Prepayment Terms is still the one unconnected class.** You’ve said it is the applicable Principal Repayment Terms when the provision concerns early repayment, with no separate link you can confirm. For this agent’s review, is Prepayment Terms actually a separate record it must retrieve, or can it check whether a prepayment penalty applies and its period in months on the applicable Principal Repayment Terms record?

### Turn 25 — persona

It needn’t be a second record alongside the applicable principal repayment terms. When those terms cover early repayment, they are **prepayment terms**, and that is where the penalty period in months belongs.

I wouldn’t put the penalty-period field on every principal repayment terms record. If the tool can’t represent that more specific kind of terms, it still needs a way to identify when the applicable terms are prepayment terms. The retrieval gap remains; I can’t confirm a separate link to fill it.

### Turn 26 — app-user

It needn’t be a second record alongside the applicable principal repayment terms. When those terms cover early repayment, they are **prepayment terms**, and that is where the penalty period in months belongs.

I wouldn’t put the penalty-period field on every principal repayment terms record. If the tool can’t represent that more specific kind of terms, it still needs a way to identify when the applicable terms are prepayment terms. The retrieval gap remains; I can’t confirm a separate link to fill it.

### Turn 26 — app-assistant

That clarifies the record itself: there is no second terms record to retrieve. The unresolved part is **how the agent recognizes that the applicable Principal Repayment Terms cover early repayment**. A value on those terms could express that without putting a penalty-period field on every record, but I won’t assume that is how your records work.

Should I remove **Prepayment Terms** as a separate class and use an early-repayment classification on **Principal Repayment Terms** to identify when the penalty-period check applies?

### Turn 26 — persona

Yes, **if the tool cannot represent a more specific kind of repayment terms**, that is a reasonable way to model it. You would not be removing a second record: the applicable principal repayment terms are treated as prepayment terms when they cover early repayment.

I’d label the early-repayment classification as a **modeling choice**, not a confirmed field in our records. Keep the penalty period in months applicable only to those terms, and leave open how the agent finds and identifies them in practice.

### Turn 27 — app-user

Yes, **if the tool cannot represent a more specific kind of repayment terms**, that is a reasonable way to model it. You would not be removing a second record: the applicable principal repayment terms are treated as prepayment terms when they cover early repayment.

I’d label the early-repayment classification as a **modeling choice**, not a confirmed field in our records. Keep the penalty period in months applicable only to those terms, and leave open how the agent finds and identifies them in practice.

### Turn 27 — app-tool

✓ Removed: 1 element(s).

### Turn 27 — app-assistant

I removed Prepayment Terms as a separate class, as agreed; it was not a second record. The loan-to-transaction path also remains through Payment History, not a direct loan-to-transaction link.

The connection pass is complete for the other classes. **Still open:** an early-repayment classification is a modeling choice, not a confirmed field in your records, and we have not established how the agent identifies the applicable terms in practice. I’ll keep that gap visible as we move to decision-bearing values.

Is this an accurate recap of the connections?

### Turn 27 — persona

Yes, with one direction worth keeping explicit: **principal repayment terms govern payment of the principal**, and **interest payment terms govern payment of the interest**. The agent can trace back from each loan obligation to find its applicable terms, but that does not make the governing connection run from the obligation to the terms.

The other paths are as recapped: parties, rates, and schedules are reached directly from the loan; payment transactions are reached through its payment history; and collateral is linked to a secured loan. The early-repayment identification gap remains open.

### Turn 28 — app-user

Yes, with one direction worth keeping explicit: **principal repayment terms govern payment of the principal**, and **interest payment terms govern payment of the interest**. The agent can trace back from each loan obligation to find its applicable terms, but that does not make the governing connection run from the obligation to the terms.

The other paths are as recapped: parties, rates, and schedules are reached directly from the loan; payment transactions are reached through its payment history; and collateral is linked to a secured loan. The early-repayment identification gap remains open.

### Turn 28 — app-assistant

Agreed. The governing links remain **Principal Repayment Terms → Principal** and **Interest Payment Terms → Interest**; tracing them back from an obligation does not reverse their meaning. The early-repayment identification gap is still open.

For the question “What principal amount, interest rate, and maturity date govern the loan?”, where are those values recorded for the agent to use: **principal amount on Principal, rate value on the applicable rate arrangement, and maturity date on Loan**? Please correct any placement that doesn’t match your records.

### Turn 28 — persona

The rate value belongs on the applicable fixed or variable rate arrangement, and the maturity date is on the loan.

I’d correct the principal placement: the loan records the **principal amount** for that question. The separate principal obligation can carry an **outstanding amount**, which is useful for tracking what remains owed. I wouldn’t use that outstanding balance as a substitute for the loan’s principal amount.

### Turn 29 — app-user

The rate value belongs on the applicable fixed or variable rate arrangement, and the maturity date is on the loan.

I’d correct the principal placement: the loan records the **principal amount** for that question. The separate principal obligation can carry an **outstanding amount**, which is useful for tracking what remains owed. I wouldn’t use that outstanding balance as a substitute for the loan’s principal amount.

### Turn 29 — app-tool

✓ Applied: 0 added, 3 updated.

### Turn 29 — app-assistant

Recorded principal amount and maturity date on Loan, and the rate value on the applicable fixed or variable rate arrangement. I’ve kept those separate from an outstanding balance.

You mentioned **outstanding amount on Principal**. Which of the agreed questions or five reviews would use that amount, and what would the agent compare or decide with it? I want to avoid adding a tracking value that these tasks do not yet need.

### Turn 29 — persona

None of the agreed questions or five reviews requires the principal’s outstanding amount as an input. The principal-amount question uses the amount on the loan, and we haven’t defined a review that compares the outstanding amount with a schedule or uses it to make a decision.

I’d leave it out of this task-focused model for now. It’s a useful servicing value, but not one these checks currently need.

### Turn 30 — app-user

None of the agreed questions or five reviews requires the principal’s outstanding amount as an input. The principal-amount question uses the amount on the loan, and we haven’t defined a review that compares the outstanding amount with a schedule or uses it to make a decision.

I’d leave it out of this task-focused model for now. It’s a useful servicing value, but not one these checks currently need.

### Turn 30 — app-assistant

Agreed; I’ve left outstanding amount out. It is useful in servicing, but none of the accepted questions or reviews uses it yet.

For “Is the loan secured?” and the conditional collateral review, you confirmed that a secured classification can be a value on **Loan**, separate from its Collateral link. **What recorded value tells the agent whether the loan is secured, and what are its possible values?**

### Turn 30 — persona

I can’t confirm a recorded field with a defined list of allowed values. **“Secured” is a distinction about the kind of loan**, and using a classification value on the loan is the modeling choice we discussed—not a field whose vocabulary we’ve established.

For this check, the agent must be able to identify that a loan is secured, then check its **separate collateral link**. Don’t make “secured” mean “collateral is present,” or treat a guarantee as collateral. I wouldn’t invent a complete set of classification values without confirming how that distinction is recorded.

### Turn 31 — app-user

I can’t confirm a recorded field with a defined list of allowed values. **“Secured” is a distinction about the kind of loan**, and using a classification value on the loan is the modeling choice we discussed—not a field whose vocabulary we’ve established.

For this check, the agent must be able to identify that a loan is secured, then check its **separate collateral link**. Don’t make “secured” mean “collateral is present,” or treat a guarantee as collateral. I wouldn’t invent a complete set of classification values without confirming how that distinction is recorded.

### Turn 31 — app-assistant

I’ll leave the secured classification unrecorded for now. The collateral link is recorded, but its presence must not stand in for the secured distinction. The open item is how the agent identifies a secured loan before applying that check.

For the principal-schedule comparison, **what on the Principal Repayment Terms tells the agent how principal must be repaid, and whether an amortization schedule is expected?**

### Turn 31 — persona

The principal repayment terms give the **initial principal payment date, principal repayment date, payment frequency, and payment day**. Those are the values I’d use when comparing the principal-payment schedule with the terms.

They do **not**, by themselves, establish that the loan is amortizing. If we know a loan is amortizing, the completeness check looks for an amortization schedule and principal repayment terms governing its principal. We still need to establish how the agent recognizes that amortizing structure; I wouldn’t infer it just from a payment frequency.

### Turn 32 — app-user

The principal repayment terms give the **initial principal payment date, principal repayment date, payment frequency, and payment day**. Those are the values I’d use when comparing the principal-payment schedule with the terms.

They do **not**, by themselves, establish that the loan is amortizing. If we know a loan is amortizing, the completeness check looks for an amortization schedule and principal repayment terms governing its principal. We still need to establish how the agent recognizes that amortizing structure; I wouldn’t infer it just from a payment frequency.

### Turn 32 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 32 — app-assistant

Recorded those four values on Principal Repayment Terms for the principal-payment schedule comparison. I have **not** inferred an amortizing structure from payment frequency; how the agent identifies one remains open.

For the interest-schedule comparison, **which values on Interest Payment Terms specify when interest is due and how it accrues, apart from its link to Day Count Convention?**

### Turn 32 — persona

For timing, the interest payment terms record the **initial interest payment date, final interest payment date, payment frequency, and payment day**. For accrual, they record the **initial interest accrual date** and **compounding frequency**. The linked day-count convention supplies the accrual basis.

Those are the terms the agent can bring alongside the loan’s interest-payment schedule. An interest-calculation schedule is a separate schedule, if one is on file; it isn’t the same as the interest-payment schedule.

### Turn 33 — app-user

For timing, the interest payment terms record the **initial interest payment date, final interest payment date, payment frequency, and payment day**. For accrual, they record the **initial interest accrual date** and **compounding frequency**. The linked day-count convention supplies the accrual basis.

Those are the terms the agent can bring alongside the loan’s interest-payment schedule. An interest-calculation schedule is a separate schedule, if one is on file; it isn’t the same as the interest-payment schedule.

### Turn 33 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 33 — app-assistant

Recorded the interest timing and accrual values. The Day Count Convention remains a separate linked item.

You’ve distinguished an **interest-calculation schedule** from the interest-payment schedule. For the agreed question about whether schedules match interest payment and accrual terms, does the agent need to retrieve and compare an interest-calculation schedule when one is on file, or is it outside this review?

### Turn 33 — persona

If an interest-calculation schedule is on file, the agent should retrieve it separately and use it when checking calculation timing against the interest accrual terms. It should not treat it as an interest-payment schedule: one concerns when interest is calculated, the other when it is due to be paid.

I wouldn’t require an interest-calculation schedule for every loan. Its absence alone doesn’t establish that the interest payment terms are incomplete.

### Turn 34 — app-user

If an interest-calculation schedule is on file, the agent should retrieve it separately and use it when checking calculation timing against the interest accrual terms. It should not treat it as an interest-payment schedule: one concerns when interest is calculated, the other when it is due to be paid.

I wouldn’t require an interest-calculation schedule for every loan. Its absence alone doesn’t establish that the interest payment terms are incomplete.

### Turn 34 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 34 — app-assistant

Recorded Interest Calculation Schedule separately because the agreed accrual comparison uses it when one is on file. Its absence is not, by itself, a failed completeness check.

Before adding its connection: **how does the agent get from the Loan to an Interest Calculation Schedule on file?** Is it a direct loan-to-schedule link, as with the other schedules, or reached another way?

### Turn 34 — persona

It’s a **direct link from the loan** to its interest-calculation schedule, just like the other schedules we’ve discussed. If one is on file, the agent retrieves it from the loan and compares its calculation timing with the applicable interest accrual terms. It isn’t reached through the interest-payment schedule.

### Turn 35 — app-user

It’s a **direct link from the loan** to its interest-calculation schedule, just like the other schedules we’ve discussed. If one is on file, the agent retrieves it from the loan and compares its calculation timing with the applicable interest accrual terms. It isn’t reached through the interest-payment schedule.

### Turn 35 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 35 — app-assistant

Recorded a direct Loan → Interest Calculation Schedule link. For the comparison, the agent brings that schedule together with the Interest Payment Terms through the loan and its Interest obligation; it does not go through the Interest Payment Schedule. I won’t require the calculation schedule on every loan.

For the prepayment review, **what specifically records the penalty period in months on applicable Principal Repayment Terms?** Is it a numeric value there, with no value expected when no penalty applies? I’ll keep separate the unresolved question of how the agent identifies those terms in practice.

### Turn 35 — persona

It’s a **numeric penalty term in months on the applicable prepayment terms**. Since your tool represents those as principal repayment terms identified as covering early repayment, you can place that value there **only for those applicable terms**.

I wouldn’t say a blank value means no penalty applies. It could mean the penalty timing is missing from a provision that does apply. And, as you noted, we still haven’t established how the agent identifies those terms in practice.

### Turn 36 — app-user

It’s a **numeric penalty term in months on the applicable prepayment terms**. Since your tool represents those as principal repayment terms identified as covering early repayment, you can place that value there **only for those applicable terms**.

I wouldn’t say a blank value means no penalty applies. It could mean the penalty timing is missing from a provision that does apply. And, as you noted, we still haven’t established how the agent identifies those terms in practice.

### Turn 36 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 36 — app-assistant

Recorded the numeric prepayment-penalty term in months on applicable Principal Repayment Terms. A missing value does **not** mean no penalty applies; identification of the applicable early-repayment terms remains open.

For the question “For a loan whose rate can change, when are rate resets scheduled?”, **what value or values on the Rate Reset Schedule let the agent answer when the resets occur?**

### Turn 36 — persona

The interest-rate reset schedule is the record that tells the agent **which dates resets are scheduled for**. It covers when the rate is reconsidered and the corresponding rate recalculated.

I can’t confirm a separate frequency or “next reset date” value on that schedule from what we’ve established. I’d have the agent read the scheduled dates rather than add a field we haven’t confirmed.

### Turn 37 — app-user

The interest-rate reset schedule is the record that tells the agent **which dates resets are scheduled for**. It covers when the rate is reconsidered and the corresponding rate recalculated.

I can’t confirm a separate frequency or “next reset date” value on that schedule from what we’ve established. I’d have the agent read the scheduled dates rather than add a field we haven’t confirmed.

### Turn 37 — app-tool

✓ Applied: 0 added, 1 updated.

### Turn 37 — app-assistant

Recorded the scheduled reset dates on Rate Reset Schedule, without inventing a frequency or “next reset date” field.

For “What payments have been made?”, **which values on each Payment Transaction let the agent identify the payment and report what was paid?** I’ll keep the separate completeness check based on whether transaction entries exist in Payment History.

### Turn 37 — persona

Each individual payment transaction represents an actual payment toward the debt—whether of principal, interest, fees, or another related amount. The agent should report the transactions found in the loan’s payment history.

I can’t confirm a defined set of transaction fields, such as payment date, amount, or allocation, for this model. We’d need to establish those before promising a dated or itemized payment report. The completeness check only establishes whether the history contains transaction entries.

### Turn 38 — app-user

Each individual payment transaction represents an actual payment toward the debt—whether of principal, interest, fees, or another related amount. The agent should report the transactions found in the loan’s payment history.

I can’t confirm a defined set of transaction fields, such as payment date, amount, or allocation, for this model. We’d need to establish those before promising a dated or itemized payment report. The completeness check only establishes whether the history contains transaction entries.

### Turn 38 — app-assistant

Understood. The agent can report the Payment Transactions it finds through Payment History and flag a history with no entries as incomplete. Without confirmed transaction fields, it cannot promise a dated, amount-based, or allocation-based report; I won’t add those fields by assumption.

For the agreed schedule comparisons, **what information on the schedules themselves lets the agent compare them with the principal and interest terms**—for example, are scheduled dates recorded on each relevant schedule, or is their structure not yet established?

### Turn 38 — persona

The schedules give us some comparison points, but not a fully specified set of fields for every scheduled payment.

The **principal-payment schedule** includes when some or all principal is due, and the **interest-payment schedule** includes when interest is due. The **interest-calculation schedule** separately covers calculation dates. An **amortization schedule** shows periodic payments and how the debt balance changes over time. The general loan payment schedule records regular or explicitly scheduled payments. For the general, amortization, principal-payment, and interest-payment schedules, we can also record the anticipated number of payments.

That lets the agent compare the relevant timing and payment pattern with the terms. I wouldn’t yet promise a payment-by-payment reconciliation or prescribe fields for individual schedule entries; we haven’t established that structure.

### Turn 39 — app-user

The schedules give us some comparison points, but not a fully specified set of fields for every scheduled payment.

The **principal-payment schedule** includes when some or all principal is due, and the **interest-payment schedule** includes when interest is due. The **interest-calculation schedule** separately covers calculation dates. An **amortization schedule** shows periodic payments and how the debt balance changes over time. The general loan payment schedule records regular or explicitly scheduled payments. For the general, amortization, principal-payment, and interest-payment schedules, we can also record the anticipated number of payments.

That lets the agent compare the relevant timing and payment pattern with the terms. I wouldn’t yet promise a payment-by-payment reconciliation or prescribe fields for individual schedule entries; we haven’t established that structure.

### Turn 39 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 39 — app-assistant

Recorded the schedule-level information you confirmed: due timing or calculation dates, payment patterns where described, and anticipated payment counts on the four payment schedules. This supports a schedule-to-terms comparison, not payment-by-payment reconciliation.

For the **Day Count Convention** item, what value identifies the convention the interest terms use? Is its name sufficient for the agent to identify the applicable accrual basis, or does the check need another characteristic?

### Turn 39 — persona

For this check, the **interest payment terms’ link to the applicable day-count convention** identifies the accrual basis. The agent needs to know which convention applies so it can interpret the interest calculation; I can’t confirm a separate characteristic or a defined name field that it must check. I wouldn’t add one just for this review.

### Turn 40 — app-user

For this check, the **interest payment terms’ link to the applicable day-count convention** identifies the accrual basis. The agent needs to know which convention applies so it can interpret the interest calculation; I can’t confirm a separate characteristic or a defined name field that it must check. I wouldn’t add one just for this review.

### Turn 40 — app-assistant

The link from Interest Payment Terms to Day Count Convention is enough for this check. I won’t add an unconfirmed name or characteristic field.

Before closing the decision-bearing values, a tracking question: **do Payment History or any of the schedules need their own current status for these agreed reviews, or do the agent’s checks use their presence and the contents we’ve recorded?**

### Turn 40 — persona

For the agreed reviews, use **presence and contents**, not a separate current-status field. The payment-record check asks whether the loan has a payment history and whether that history contains individual transactions. The schedule checks use the applicable schedules and their timing or payment information.

I can’t confirm a status vocabulary for payment histories or schedules, so I wouldn’t add one. An empty history is a finding about record completeness, not a “no payments made” status.

### Turn 41 — app-user

For the agreed reviews, use **presence and contents**, not a separate current-status field. The payment-record check asks whether the loan has a payment history and whether that history contains individual transactions. The schedule checks use the applicable schedules and their timing or payment information.

I can’t confirm a status vocabulary for payment histories or schedules, so I wouldn’t add one. An empty history is a finding about record completeness, not a “no payments made” status.

### Turn 41 — app-assistant

That completes the decision-bearing values we can confirm for now. I’ve recorded amounts, dates, rate values, repayment and accrual terms, schedule contents, reset dates, and the applicable penalty period. I have not added an outstanding balance, transaction fields, or status fields for histories and schedules.

Three identification points remain open: how the agent recognizes a **secured** loan, an **amortizing** loan, and Principal Repayment Terms that cover **early repayment**. None should be inferred from collateral, payment frequency, or a blank penalty-period value.

Is that an accurate recap before we define the model’s terms in plain language?

### Turn 41 — persona

Yes, that’s accurate. Those three identification points remain open, and none should be inferred from the related link or value you named.

One qualification: the reset schedule tells us when resets are scheduled, but we haven’t established a particular date field or entry structure for it. With that distinction, I’m ready to define the terms in plain language.

### Turn 42 — app-user

Yes, that’s accurate. Those three identification points remain open, and none should be inferred from the related link or value you named.

One qualification: the reset schedule tells us when resets are scheduled, but we haven’t established a particular date field or entry structure for it. With that distinction, I’m ready to define the terms in plain language.

### Turn 42 — app-assistant

Agreed. The reset schedule tells the agent when resets are scheduled, but we have **not** established a particular date field or entry structure. I’ll treat the recorded `scheduledResetDates` value as provisional until we resolve whether it accurately represents your records.

Let’s define the central terms in plain language. What does each mean in one sentence in your operation: **Loan, Principal, Interest, Borrower, and Lender**?

### Turn 42 — persona

- **Loan:** Money or credit a lender extends to a borrower, to be repaid under agreed terms.
- **Principal:** The amount of the loan obligation to be repaid, separate from interest.
- **Interest:** The cost of using that credit, payable by the borrower under the loan’s terms.
- **Borrower:** The party obliged to repay what was borrowed, along with applicable interest and fees.
- **Lender:** The party that provides the money or credit and expects repayment.

### Turn 43 — app-user

- **Loan:** Money or credit a lender extends to a borrower, to be repaid under agreed terms.
- **Principal:** The amount of the loan obligation to be repaid, separate from interest.
- **Interest:** The cost of using that credit, payable by the borrower under the loan’s terms.
- **Borrower:** The party obliged to repay what was borrowed, along with applicable interest and fees.
- **Lender:** The party that provides the money or credit and expects repayment.

### Turn 43 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 43 — app-assistant

Those five meanings are recorded.

Next batch: in one sentence each, what do **Servicer, Collateral, Principal Repayment Terms, Interest Payment Terms, and Day Count Convention** mean in your operation?

### Turn 43 — persona

- **Servicer:** The party responsible for collecting principal and interest payments on the lender’s behalf.
- **Collateral:** An asset pledged as security for repayment or another obligation.
- **Principal repayment terms:** The agreed requirements for repaying the loan’s principal.
- **Interest payment terms:** The agreed requirements for paying interest on the debt.
- **Day-count convention:** The agreed method for counting days when calculating accrued interest.

### Turn 44 — app-user

- **Servicer:** The party responsible for collecting principal and interest payments on the lender’s behalf.
- **Collateral:** An asset pledged as security for repayment or another obligation.
- **Principal repayment terms:** The agreed requirements for repaying the loan’s principal.
- **Interest payment terms:** The agreed requirements for paying interest on the debt.
- **Day-count convention:** The agreed method for counting days when calculating accrued interest.

### Turn 44 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 44 — app-assistant

Recorded those meanings, including collateral as the pledged asset rather than a guarantee or agreement.

For the rate and record concepts, please give a one-sentence meaning for each: **Fixed Interest Rate, Variable Interest Rate, Rate Reset Schedule, Payment History, and Payment Transaction**.

### Turn 44 — persona

- **Fixed interest rate:** A rate that does not fluctuate over the life of the loan.
- **Variable interest rate:** A rate that may change during the life of the loan.
- **Interest-rate reset schedule:** The schedule of dates on which a variable rate and its corresponding actual rate are recalculated.
- **Payment history:** The record of actual payments made toward the loan’s repayment obligation.
- **Individual payment transaction:** One actual payment toward the debt, which may cover principal, interest, fees, or other related amounts.

### Turn 45 — app-user

- **Fixed interest rate:** A rate that does not fluctuate over the life of the loan.
- **Variable interest rate:** A rate that may change during the life of the loan.
- **Interest-rate reset schedule:** The schedule of dates on which a variable rate and its corresponding actual rate are recalculated.
- **Payment history:** The record of actual payments made toward the loan’s repayment obligation.
- **Individual payment transaction:** One actual payment toward the debt, which may cover principal, interest, fees, or other related amounts.

### Turn 45 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 45 — app-assistant

Those five meanings are recorded. The Payment Transaction meaning describes what an entry represents; it does not establish any transaction fields we have not confirmed.

Please give a one-sentence meaning for each of these schedules: **Loan Payment Schedule, Amortization Schedule, Principal Payment Schedule, Interest Payment Schedule, and Interest Calculation Schedule**.

### Turn 45 — persona

- **Loan payment schedule:** A loan-specific schedule of regular or explicitly scheduled payments.
- **Amortization schedule:** A schedule of periodic payments showing how the debt balance changes over time.
- **Principal payment schedule:** A schedule showing when some or all of the principal is due to be repaid.
- **Interest payment schedule:** A schedule showing when interest is due to be paid.
- **Interest calculation schedule:** A schedule showing when interest is calculated, which may differ from when it is paid.

### Turn 46 — app-user

- **Loan payment schedule:** A loan-specific schedule of regular or explicitly scheduled payments.
- **Amortization schedule:** A schedule of periodic payments showing how the debt balance changes over time.
- **Principal payment schedule:** A schedule showing when some or all of the principal is due to be repaid.
- **Interest payment schedule:** A schedule showing when interest is due to be paid.
- **Interest calculation schedule:** A schedule showing when interest is calculated, which may differ from when it is paid.

### Turn 46 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 46 — app-assistant

All class meanings are now recorded. Next are the meanings of the connections. Please confirm or correct these five sentences as a batch:

- **Loan → Borrower:** identifies the party obliged to repay this loan.
- **Loan → Lender:** identifies the party that extended this loan’s credit.
- **Loan → Servicer:** identifies the party servicing the loan and collecting payments for the lender.
- **Loan → Principal:** identifies this loan’s principal obligation.
- **Loan → Interest:** identifies this loan’s interest obligation.

### Turn 46 — persona

Yes, those five sentences capture the connections and their directions. One useful distinction to retain: the servicer collects payments **on the lender’s behalf**; the servicer and lender need not be the same party.

### Turn 47 — app-user

Yes, those five sentences capture the connections and their directions. One useful distinction to retain: the servicer collects payments **on the lender’s behalf**; the servicer and lender need not be the same party.

### Turn 47 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 47 — app-assistant

Recorded those five relationship meanings, with the servicer’s collection role explicitly on the lender’s behalf.

Please confirm or correct this next batch of connection meanings:

- **Principal Repayment Terms → Principal:** specifies how that principal must be repaid.
- **Interest Payment Terms → Interest:** specifies how that interest must be paid.
- **Interest Payment Terms → Day Count Convention:** identifies the convention used to calculate accrued interest.
- **Loan → Fixed Interest Rate:** identifies the loan’s applicable fixed-rate arrangement.
- **Loan → Variable Interest Rate:** identifies the loan’s applicable variable-rate arrangement.

### Turn 47 — persona

The directions and connections are right. I’d put the first two a little more strongly than “specifies how”: those terms set the applicable requirements for paying the principal or interest, rather than merely describing a method.

The day-count sentence is right too; it identifies the basis used to calculate accrued interest. And the loan links directly to whichever fixed- or variable-rate arrangement applies.

### Turn 48 — app-user

The directions and connections are right. I’d put the first two a little more strongly than “specifies how”: those terms set the applicable requirements for paying the principal or interest, rather than merely describing a method.

The day-count sentence is right too; it identifies the basis used to calculate accrued interest. And the loan links directly to whichever fixed- or variable-rate arrangement applies.

### Turn 48 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 48 — app-assistant

Recorded the stronger “sets the applicable requirements” wording, while keeping both governing links directed from the terms to the obligation.

Please confirm or correct these schedule-link meanings:

- **Loan → Rate Reset Schedule:** identifies this loan’s schedule of rate-reset dates, when applicable.
- **Loan → Loan Payment Schedule:** identifies its general schedule of regular or explicitly scheduled payments.
- **Loan → Amortization Schedule:** identifies its schedule showing periodic payments and changes in debt balance, when applicable.
- **Loan → Principal Payment Schedule:** identifies its schedule of when principal is due.
- **Loan → Interest Payment Schedule:** identifies its schedule of when interest is due.

### Turn 48 — persona

Yes, those five meanings and directions are right. The loan has each applicable schedule directly; having one does not imply the others are on file.

For the reset schedule, I’d add that it covers the dates when the rate **and its corresponding actual value are recalculated**, not just a list of dates.

### Turn 49 — app-user

Yes, those five meanings and directions are right. The loan has each applicable schedule directly; having one does not imply the others are on file.

For the reset schedule, I’d add that it covers the dates when the rate **and its corresponding actual value are recalculated**, not just a list of dates.

### Turn 49 — app-tool

✓ Applied: 0 added, 5 updated.

### Turn 49 — app-assistant

Recorded those five schedule-link meanings. Each link stands on its own; one schedule’s presence does not imply another’s.

Please confirm or correct the last four connection meanings:

- **Loan → Interest Calculation Schedule:** identifies when interest is calculated, if that schedule is on file.
- **Loan → Collateral:** identifies the pledged collateral linked to support a secured loan.
- **Loan → Payment History:** identifies the loan’s record of actual payments.
- **Payment History → Payment Transaction:** identifies the individual payment entries contained in that history.

### Turn 49 — persona

The directions and meanings are right, with one qualification: the collateral link applies to a **secured loan** and points to the pledged collateral itself. It isn’t a link that every loan must have, and the loan’s secured designation alone doesn’t establish that collateral is recorded.

The interest-calculation schedule, payment history, and individual-transaction meanings are right as stated.

### Turn 50 — app-user

The directions and meanings are right, with one qualification: the collateral link applies to a **secured loan** and points to the pledged collateral itself. It isn’t a link that every loan must have, and the loan’s secured designation alone doesn’t establish that collateral is recorded.

The interest-calculation schedule, payment history, and individual-transaction meanings are right as stated.

### Turn 50 — app-tool

✓ Applied: 0 added, 4 updated.

### Turn 50 — app-assistant

All relationship meanings are recorded, including the qualification that collateral is linked only where applicable and cannot be inferred from a secured designation.

For **class names**, are there alternate names your staff use that mean *exactly the same thing* as any of these: Loan, Principal, Interest, Borrower, Lender, Servicer, Collateral, Principal Repayment Terms, Interest Payment Terms, or Day Count Convention? A short list—or “none”—is enough.

### Turn 50 — persona

None that I’d treat as exact alternate names for those items. Staff may use looser shorthand, but I wouldn’t merge it into the model without checking what they mean.

### Turn 51 — app-user

None that I’d treat as exact alternate names for those items. Staff may use looser shorthand, but I wouldn’t merge it into the model without checking what they mean.

### Turn 51 — app-assistant

No exact aliases for that class group; I won’t turn loose shorthand into synonyms.

For the remaining classes—**Fixed Interest Rate, Variable Interest Rate, Rate Reset Schedule, Payment History, Payment Transaction, and the five schedules**—are there any exact alternate names staff use? “None” is fine.

### Turn 51 — persona

**Adjustable rate** is an alternate name for a variable interest rate.

For the others, I wouldn’t record an exact alternate name. I’d use **interest-rate reset schedule** and **individual payment transaction** as the fuller names for the two records you called Rate Reset Schedule and Payment Transaction.

### Turn 52 — app-user

**Adjustable rate** is an alternate name for a variable interest rate.

For the others, I wouldn’t record an exact alternate name. I’d use **interest-rate reset schedule** and **individual payment transaction** as the fuller names for the two records you called Rate Reset Schedule and Payment Transaction.

### Turn 52 — app-tool

✓ Applied: 0 added, 3 updated.

### Turn 52 — app-assistant

Recorded **adjustable rate** as an alias for Variable Interest Rate, and the fuller names for Rate Reset Schedule and Payment Transaction.

For the **relationship names**—such as “loan has borrower,” “terms govern principal,” “loan is secured by collateral,” and “history contains transactions”—are there alternate phrases staff use that mean exactly the same connections? A few examples or “none” is enough.

### Turn 52 — persona

I wouldn’t record exact alternate names for those connections. Staff use phrases such as “has a borrower” or “contains payments,” but those are ordinary descriptions, not a separate vocabulary we rely on.

One caution: **“secured by collateral”** is understandable, but I’d phrase that connection more narrowly because a loan can also be secured by a guarantee. This particular link identifies pledged collateral, not every form of security.

### Turn 53 — app-user

I wouldn’t record exact alternate names for those connections. Staff use phrases such as “has a borrower” or “contains payments,” but those are ordinary descriptions, not a separate vocabulary we rely on.

One caution: **“secured by collateral”** is understandable, but I’d phrase that connection more narrowly because a loan can also be secured by a guarantee. This particular link identifies pledged collateral, not every form of security.

### Turn 53 — app-assistant

No relationship aliases to add. Your caution is important: the current link name, `securedBy`, sounds broader than the fact it records. Its target and meaning specify pledged Collateral, but I’d rename the link **“has pledged collateral”** to avoid implying it covers guarantees too.

Does that narrower name match the connection you want recorded?

### Turn 53 — persona

It captures the right fact, but I’d put the connection a little differently. “Has pledged collateral” could sound as though the loan owns the asset; what matters is that the **secured loan is supported by collateral pledged against it**. The link should not cover a guarantee.

### Turn 54 — app-user

It captures the right fact, but I’d put the connection a little differently. “Has pledged collateral” could sound as though the loan owns the asset; what matters is that the **secured loan is supported by collateral pledged against it**. The link should not cover a guarantee.

### Turn 54 — app-assistant

That distinction makes sense: the loan does not own the asset, and this link must not stand for a guarantee. Would **“is supported by pledged collateral”** be the right name for the Loan → Collateral connection?

### Turn 54 — persona

That’s right in substance, but I’d name it a little more specifically. “Supported by” can cover a guarantee as well; this connection says the secured loan has **collateral pledged against it**. It does not describe every form of support for the loan.

### Turn 55 — app-user

That’s right in substance, but I’d name it a little more specifically. “Supported by” can cover a guarantee as well; this connection says the secured loan has **collateral pledged against it**. It does not describe every form of support for the loan.

### Turn 55 — app-tool

✓ Removed: 1 element(s).

### Turn 55 — app-assistant

I’ve removed the overly broad `securedBy` link; it could be read as covering guarantees. The intended fact is narrower and does not imply the loan owns the asset.

Should the replacement Loan → Collateral connection be named **“has collateral pledged against it”**?

### Turn 55 — persona

That names the right connection, but I’d phrase it as what the collateral **does for the secured loan**, rather than as something the loan has. The link runs from the secured loan to the pledged collateral; it does not imply ownership or include a guarantee.

### Turn 56 — app-user

That names the right connection, but I’d phrase it as what the collateral **does for the secured loan**, rather than as something the loan has. The link runs from the secured loan to the pledged collateral; it does not imply ownership or include a guarantee.

### Turn 56 — app-assistant

Would **“is backed by pledged collateral”** capture what the collateral does for the secured loan, without implying ownership or including a guarantee?

### Turn 56 — persona

Yes, that captures the intended fact: pledged collateral backs the secured loan, without implying ownership or including a guarantee. I’d still use a more specific term for this particular link, so it can’t be confused with other ways a loan may be backed.

### Turn 57 — app-user

Yes, that captures the intended fact: pledged collateral backs the secured loan, without implying ownership or including a guarantee. I’d still use a more specific term for this particular link, so it can’t be confused with other ways a loan may be backed.

### Turn 57 — app-assistant

We agree on the direction and meaning, but the **link name** is still unsettled. What exact verb phrase would your team use for **Loan → Collateral**, meaning that pledged collateral backs the secured loan—and not a guarantee?

### Turn 57 — persona

We’d say the secured loan **is collateralized by** the pledged collateral. That points to the collateral itself, not a guarantee or ownership of the asset.

### Turn 58 — app-user

We’d say the secured loan **is collateralized by** the pledged collateral. That points to the collateral itself, not a guarantee or ownership of the asset.

### Turn 58 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 58 — app-tool

🔍 Checked the current ontology state.

### Turn 58 — app-assistant

The language pass is complete: every class and connection has a plain meaning, and the confirmed alternate names are recorded. The collateral link now uses your precise wording, **“is collateralized by,”** rather than a phrase that could include a guarantee.

One earlier entry needs correction before we discuss constraints: I recorded `scheduledResetDates` as a property, but you’ve clarified that no particular date field or entry structure is established. **Should I remove that property and rely on the Rate Reset Schedule record itself to provide the scheduled dates?**

### Turn 58 — persona

Yes. Remove that proposed property. The **interest-rate reset schedule** is the record the agent consults for when resets are scheduled, but we haven’t established a particular date field or entry structure to model here.

### Turn 59 — app-user

Yes. Remove that proposed property. The **interest-rate reset schedule** is the record the agent consults for when resets are scheduled, but we haven’t established a particular date field or entry structure to model here.

### Turn 59 — app-tool

✓ Removed: 1 element(s).

### Turn 59 — app-assistant

Removed the unconfirmed `scheduledResetDates` property. The agent can consult the Rate Reset Schedule, but the model does not claim a particular field or entry structure for it.

For the small-choice values we *have* recorded, what are the allowed values, if they are fixed, for each of these: **Principal Repayment Terms.paymentFrequency**, **Interest Payment Terms.paymentFrequency**, and **Interest Payment Terms.compoundingFrequency**? If any has no confirmed fixed list, please say so for that property.

### Turn 59 — persona

There’s **no confirmed fixed list** for any of the three:

- Principal repayment payment frequency
- Interest payment frequency
- Interest compounding frequency

They’re recorded as text in the applicable terms. I wouldn’t impose a set of allowed choices without establishing the lender’s governing procedure.

### Turn 60 — app-user

There’s **no confirmed fixed list** for any of the three:

- Principal repayment payment frequency
- Interest payment frequency
- Interest compounding frequency

They’re recorded as text in the applicable terms. I wouldn’t impose a set of allowed choices without establishing the lender’s governing procedure.

### Turn 60 — app-assistant

I’ll leave all three frequencies as text, with no invented allowed-value lists.

To decide which values must be present for a check to work, let’s take four at a time. **What breaks if each of these is missing or wrong:** Loan’s principal amount; Loan’s maturity date; Fixed Interest Rate’s rate value; Variable Interest Rate’s rate value? A brief consequence for each is enough.

### Turn 60 — persona

- **Loan principal amount:** The agent can’t reliably answer what amount was lent or check that figure against the agreed loan terms.
- **Loan maturity date:** It can’t reliably say when the loan comes due.
- **Fixed-rate value:** It can identify the fixed-rate arrangement, but can’t report the rate that applies.
- **Variable-rate value:** It can identify the variable-rate arrangement, but can’t report its recorded rate. The reset-schedule review is a separate check; I wouldn’t call it failed solely because the rate value is missing.

A wrong value risks a misleading answer in each case. I’d flag missing or suspect values, rather than assume every one blocks all five reviews.

### Turn 61 — app-user

- **Loan principal amount:** The agent can’t reliably answer what amount was lent or check that figure against the agreed loan terms.
- **Loan maturity date:** It can’t reliably say when the loan comes due.
- **Fixed-rate value:** It can identify the fixed-rate arrangement, but can’t report the rate that applies.
- **Variable-rate value:** It can identify the variable-rate arrangement, but can’t report its recorded rate. The reset-schedule review is a separate check; I wouldn’t call it failed solely because the rate value is missing.

A wrong value risks a misleading answer in each case. I’d flag missing or suspect values, rather than assume every one blocks all five reviews.

### Turn 61 — app-assistant

That distinction is clear: missing or suspect amounts, dates, or rate values make the corresponding answer unreliable, but they do not automatically fail every review. In particular, a missing variable-rate value does not by itself fail the separate reset-schedule check.

For **Principal Repayment Terms**, what breaks in the principal-schedule comparison if each is missing or wrong: **initialPrincipalPaymentDate, principalRepaymentDate, paymentFrequency, and paymentDay**?

### Turn 61 — persona

Each missing or wrong value limits the part of the comparison it supports:

- **Initial principal payment date:** We can’t reliably check when scheduled principal payments begin.
- **Principal repayment date:** We can’t reliably check the repayment end point against the schedule.
- **Payment frequency:** We can’t check the spacing or recurrence of scheduled principal payments.
- **Payment day:** We can’t check the specified day against the scheduled due dates.

I’d flag the affected comparison as incomplete or unreliable; I wouldn’t conclude the schedule conflicts with the terms merely because a term is missing.

### Turn 62 — app-user

Each missing or wrong value limits the part of the comparison it supports:

- **Initial principal payment date:** We can’t reliably check when scheduled principal payments begin.
- **Principal repayment date:** We can’t reliably check the repayment end point against the schedule.
- **Payment frequency:** We can’t check the spacing or recurrence of scheduled principal payments.
- **Payment day:** We can’t check the specified day against the scheduled due dates.

I’d flag the affected comparison as incomplete or unreliable; I wouldn’t conclude the schedule conflicts with the terms merely because a term is missing.

### Turn 62 — app-assistant

For each of those four values, a missing or wrong entry limits the corresponding timing comparison. The agent should flag that comparison as incomplete or unreliable, not declare a mismatch solely because a term is absent.

For **Interest Payment Terms**, what breaks if each timing value is missing or wrong: **initialInterestPaymentDate, finalInterestPaymentDate, paymentFrequency, and paymentDay**?

### Turn 62 — persona

- **Initial interest payment date:** We can’t reliably check when interest payments are supposed to start.
- **Final interest payment date:** We can’t reliably check the last scheduled interest-payment date.
- **Payment frequency:** We can’t reliably check the spacing of interest due dates.
- **Payment day:** We can’t reliably check whether due dates fall on the specified day.

As with principal, I’d flag the affected comparison as incomplete or unreliable. A missing term alone isn’t evidence that the schedule disagrees with it.

### Turn 63 — app-user

- **Initial interest payment date:** We can’t reliably check when interest payments are supposed to start.
- **Final interest payment date:** We can’t reliably check the last scheduled interest-payment date.
- **Payment frequency:** We can’t reliably check the spacing of interest due dates.
- **Payment day:** We can’t reliably check whether due dates fall on the specified day.

As with principal, I’d flag the affected comparison as incomplete or unreliable. A missing term alone isn’t evidence that the schedule disagrees with it.

### Turn 63 — app-assistant

The same approach applies to interest-payment timing: missing or wrong terms make the affected comparison unreliable; absence alone is not a schedule mismatch.

What breaks if each of these is missing or wrong: **Interest Payment Terms.initialInterestAccrualDate**, **Interest Payment Terms.compoundingFrequency**, and the **link from Interest Payment Terms to Day Count Convention**?

### Turn 63 — persona

- **Initial interest accrual date:** We can’t reliably establish when interest starts accruing for the comparison.
- **Compounding frequency:** We can’t reliably check how often accrued interest is compounded.
- **Day-count convention link:** We can’t identify the agreed basis for counting days in the interest calculation.

I’d flag the affected accrual check as incomplete or unreliable. None of those gaps, by itself, proves the calculated interest is wrong.

### Turn 64 — app-user

- **Initial interest accrual date:** We can’t reliably establish when interest starts accruing for the comparison.
- **Compounding frequency:** We can’t reliably check how often accrued interest is compounded.
- **Day-count convention link:** We can’t identify the agreed basis for counting days in the interest calculation.

I’d flag the affected accrual check as incomplete or unreliable. None of those gaps, by itself, proves the calculated interest is wrong.

### Turn 64 — app-assistant

Those three gaps make the affected accrual check incomplete or unreliable; none alone proves that calculated interest is wrong.

For the schedule properties, what breaks if each is missing or wrong: **Loan Payment Schedule.scheduledPayments**, **Amortization Schedule.periodicPaymentsAndBalanceChanges**, **Principal Payment Schedule.principalDueTiming**, **Interest Payment Schedule.interestDueTiming**, and **Interest Calculation Schedule.calculationDates**?

### Turn 64 — persona

Those labels describe useful schedule contents, but I wouldn’t treat them as confirmed fields with those names.

- **General loan payment schedule:** Without its scheduled-payment information, we can’t tell what payments it calls for.
- **Amortization schedule:** Without the periodic payments and balance changes, we can’t check how the debt is expected to run down.
- **Principal payment schedule:** Without principal due timing, we can’t compare its dates with the principal repayment terms.
- **Interest payment schedule:** Without interest due timing, we can’t compare its dates with the interest payment terms.
- **Interest calculation schedule:** Without calculation dates, we can’t compare its timing with the interest accrual terms.

In each case, wrong information could produce a misleading comparison. Missing information makes the **affected comparison incomplete**, not automatically a mismatch—and we haven’t established a field-by-field structure for schedule entries.

### Turn 65 — app-user

Those labels describe useful schedule contents, but I wouldn’t treat them as confirmed fields with those names.

- **General loan payment schedule:** Without its scheduled-payment information, we can’t tell what payments it calls for.
- **Amortization schedule:** Without the periodic payments and balance changes, we can’t check how the debt is expected to run down.
- **Principal payment schedule:** Without principal due timing, we can’t compare its dates with the principal repayment terms.
- **Interest payment schedule:** Without interest due timing, we can’t compare its dates with the interest payment terms.
- **Interest calculation schedule:** Without calculation dates, we can’t compare its timing with the interest accrual terms.

In each case, wrong information could produce a misleading comparison. Missing information makes the **affected comparison incomplete**, not automatically a mismatch—and we haven’t established a field-by-field structure for schedule entries.

### Turn 65 — app-tool

✓ Removed: 5 element(s).

### Turn 65 — app-assistant

I removed those five proposed schedule properties. The schedule records remain, with the contents you described in their meanings, but the model no longer claims a field-by-field entry structure. Missing contents make the affected comparison incomplete, not automatically a mismatch.

For the remaining schedule values, **what breaks if `anticipatedPaymentCount` is missing or wrong on each of the four payment schedules**—general loan, amortization, principal-payment, and interest-payment? Does an agreed question or review actually use that count on each one?

### Turn 65 — persona

None of the agreed questions or five reviews requires the anticipated payment count on any of those four schedules. A missing count does not, by itself, fail a schedule check.

If a count is recorded, a wrong one could misstate how many payments are expected. But we haven’t agreed a count-based comparison or reconciliation, so I’d keep it as optional schedule information rather than make it decision-bearing for this agent.

### Turn 66 — app-user

None of the agreed questions or five reviews requires the anticipated payment count on any of those four schedules. A missing count does not, by itself, fail a schedule check.

If a count is recorded, a wrong one could misstate how many payments are expected. But we haven’t agreed a count-based comparison or reconciliation, so I’d keep it as optional schedule information rather than make it decision-bearing for this agent.

### Turn 66 — app-tool

✓ Removed: 4 element(s).

### Turn 66 — app-assistant

I removed all four anticipated-payment-count properties. None is used by an agreed question or review, and a missing count does not fail a schedule check.

For the remaining numeric term, **what breaks if `prepaymentPenaltyTermMonths` is missing or wrong when a prepayment penalty does apply?** Does a missing value make that timing review incomplete, rather than establish that no penalty applies?

### Turn 66 — persona

Yes. If a prepayment penalty applies and its **term in months** is missing, the agent cannot confirm the penalty timing, so that review is incomplete. It must not read the blank as “no penalty.”

If the recorded term is wrong, the agent could report or confirm the wrong penalty period. The review should flag a suspect value for verification rather than treating it as reliable.

### Turn 67 — app-user

Yes. If a prepayment penalty applies and its **term in months** is missing, the agent cannot confirm the penalty timing, so that review is incomplete. It must not read the blank as “no penalty.”

If the recorded term is wrong, the agent could report or confirm the wrong penalty period. The review should flag a suspect value for verification rather than treating it as reliable.

### Turn 67 — app-assistant

Confirmed: when a penalty applies, a missing term in months makes the timing review incomplete—not “no penalty”—and a suspect value needs verification. The constraint pass has not produced any confirmed fixed-choice lists or blanket rule that every field blocks every check. I also removed schedule fields and payment counts that your answers did not justify.

Is that an accurate recap of the value and missing-data handling before we define the review rules?

### Turn 67 — persona

Yes. Missing or suspect values make the **specific answer or comparison that uses them** incomplete or unreliable; they don’t automatically fail every review. There’s no confirmed fixed list for the frequencies, and we haven’t established fields for individual schedule entries or payment counts as inputs to these checks.

The prepayment-timing review applies only when a penalty provision applies. A blank penalty period then means we cannot confirm its timing—not that there is no penalty. We still need to establish how the agent identifies the applicable early-repayment terms.

### Turn 68 — app-user

Yes. Missing or suspect values make the **specific answer or comparison that uses them** incomplete or unreliable; they don’t automatically fail every review. There’s no confirmed fixed list for the frequencies, and we haven’t established fields for individual schedule entries or payment counts as inputs to these checks.

The prepayment-timing review applies only when a penalty provision applies. A blank penalty period then means we cannot confirm its timing—not that there is no penalty. We still need to establish how the agent identifies the applicable early-repayment terms.

### Turn 68 — app-assistant

Agreed. I’ll keep the rules check-specific: missing information makes the affected result incomplete or unreliable, rather than automatically failing unrelated reviews.

For **loan setup readiness**, how does the agent identify that a loan is *interest-bearing* before requiring an applicable rate and Interest Payment Terms? Is the Loan → Interest link sufficient for that decision, or is there another confirmed indicator?

### Turn 68 — persona

The Loan → Interest link tells the agent there is an interest obligation to account for, but I wouldn’t treat it as a confirmed, complete test for whether a loan is interest-bearing. We haven’t established a separate indicator for that.

For readiness, once a loan is known to be interest-bearing, the agent checks for an applicable fixed or variable rate and interest payment terms governing its interest. If the rate or terms are missing, it should flag the setup as incomplete—not infer that the loan bears no interest.

### Turn 69 — app-user

The Loan → Interest link tells the agent there is an interest obligation to account for, but I wouldn’t treat it as a confirmed, complete test for whether a loan is interest-bearing. We haven’t established a separate indicator for that.

For readiness, once a loan is known to be interest-bearing, the agent checks for an applicable fixed or variable rate and interest payment terms governing its interest. If the rate or terms are missing, it should flag the setup as incomplete—not infer that the loan bears no interest.

### Turn 69 — app-assistant

The Interest link is not a reliable test for whether the loan is interest-bearing, so I won’t use it as one. Once that applicability is known, missing rate or interest terms makes the relevant readiness check incomplete; it does not mean the loan bears no interest.

**What tells the agent that a particular loan is interest-bearing before it applies that check?** If that source is not yet known, I’ll keep it as an open prerequisite rather than invent an indicator.

### Turn 69 — persona

We haven’t established an independent source that tells the agent a particular loan is interest-bearing. A linked fixed or variable rate is evidence of an interest-bearing arrangement, but **no rate link does not prove the loan is interest-free**—it may be the missing setup information we’re trying to catch.

I’d keep applicability as an open prerequisite. Once established, readiness checks for the applicable rate and interest payment terms governing the loan’s interest.

### Turn 70 — app-user

We haven’t established an independent source that tells the agent a particular loan is interest-bearing. A linked fixed or variable rate is evidence of an interest-bearing arrangement, but **no rate link does not prove the loan is interest-free**—it may be the missing setup information we’re trying to catch.

I’d keep applicability as an open prerequisite. Once established, readiness checks for the applicable rate and interest payment terms governing the loan’s interest.

### Turn 70 — app-assistant

Interest-bearing applicability remains an open prerequisite. A rate link can be evidence, but its absence cannot establish that the loan is interest-free.

For the part of **setup readiness** we can define now, should the rule check that the Loan has a Borrower and a Lender, and—**only after interest-bearing applicability is established**—that it has an applicable fixed or variable rate and Interest Payment Terms governing its Interest? Any missing link would produce a specific “setup incomplete” finding, not a claim that the loan is interest-free.

### Turn 70 — persona

Yes. Check the loan’s borrower and lender links for every setup-readiness review. Once interest-bearing applicability has been established, also check that the loan has an applicable fixed or variable rate and that interest payment terms govern payment of its interest.

Report each missing link as a specific setup gap. In particular, a missing rate or terms link does **not** establish that the loan is interest-free. How the agent establishes interest-bearing applicability is still open.

### Turn 71 — app-user

Yes. Check the loan’s borrower and lender links for every setup-readiness review. Once interest-bearing applicability has been established, also check that the loan has an applicable fixed or variable rate and that interest payment terms govern payment of its interest.

Report each missing link as a specific setup gap. In particular, a missing rate or terms link does **not** establish that the loan is interest-free. How the agent establishes interest-bearing applicability is still open.

### Turn 71 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 71 — app-assistant

Recorded the setup-readiness rule with borrower and lender checks for every loan, and conditional rate and interest-terms checks only when interest-bearing applicability is independently established. That applicability source remains open.

For **secured-loan support**, once the agent independently knows a loan is secured, should the rule check for the direct **Loan → Collateral** link (`isCollateralizedBy`) and record “collateral link missing” if none is found—without treating a guarantee as collateral?

### Turn 71 — persona

Yes. Once the loan is identified as secured, this **collateral-support review** checks whether it is directly linked to pledged collateral. If no link is found, record “collateral link missing”; don’t count a guarantee as collateral.

We still need an independent way to identify secured loans. The collateral link itself can’t serve as that test.

### Turn 72 — app-user

Yes. Once the loan is identified as secured, this **collateral-support review** checks whether it is directly linked to pledged collateral. If no link is found, record “collateral link missing”; don’t count a guarantee as collateral.

We still need an independent way to identify secured loans. The collateral link itself can’t serve as that test.

### Turn 72 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 72 — app-assistant

Recorded that conditional collateral check. It requires independent identification of a secured loan; neither the collateral link nor a guarantee substitutes for that identification.

For **variable-rate setup**, is the rule simply: when Loan has a Variable Interest Rate link, check that the same Loan has a Rate Reset Schedule link; if missing, flag the reset schedule as missing, while a fixed-rate arrangement alone does not trigger this check?

### Turn 72 — persona

Yes. A loan linked to a variable interest rate triggers the check for a **direct link from that same loan to an interest-rate reset schedule**. If the schedule link is missing, flag the variable-rate setup as incomplete.

A fixed-rate arrangement alone does not trigger that check. But the absence of a variable-rate link, by itself, does not prove the loan is fixed-rate or that its rate setup is complete.

### Turn 73 — app-user

Yes. A loan linked to a variable interest rate triggers the check for a **direct link from that same loan to an interest-rate reset schedule**. If the schedule link is missing, flag the variable-rate setup as incomplete.

A fixed-rate arrangement alone does not trigger that check. But the absence of a variable-rate link, by itself, does not prove the loan is fixed-rate or that its rate setup is complete.

### Turn 73 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 73 — app-assistant

Recorded the variable-rate rule, including the distinction that **no variable-rate link** does not prove a loan is fixed-rate or fully set up.

For **payment-record completeness**, should the rule check first for a Loan → Payment History link, then for at least one Payment History → Payment Transaction entry, reporting the missing level specifically—and never interpreting missing entries as proof that no payment occurred?

### Turn 73 — persona

Yes. First check that the loan has a payment history. If it does, check whether that history contains at least one individual payment transaction.

Report the gap at the level where it occurs: **no history linked**, or **history linked but no individual entries recorded**. Neither finding proves that no payment occurred; it means the payment record isn’t complete enough for this tracking check.

### Turn 74 — app-user

Yes. First check that the loan has a payment history. If it does, check whether that history contains at least one individual payment transaction.

Report the gap at the level where it occurs: **no history linked**, or **history linked but no individual entries recorded**. Neither finding proves that no payment occurred; it means the payment record isn’t complete enough for this tracking check.

### Turn 74 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 74 — app-assistant

Recorded the two-level payment-record check: missing history versus linked history with no transaction entries. Neither finding means no payment occurred.

For **prepayment-penalty timing**, once it is independently established that a penalty provision applies, should the rule check `prepaymentPenaltyTermMonths` on the applicable Principal Repayment Terms, flagging a missing or suspect value without interpreting a blank as “no penalty”? The way the agent identifies those applicable terms would remain open.

### Turn 74 — persona

Yes. Once the penalty provision and the applicable early-repayment terms have been identified, check that the **penalty term in months** is recorded there. A missing term makes the timing review incomplete; a suspect term needs verification. A blank is not evidence that no penalty applies.

The unresolved part is still how the agent identifies the applicable terms and establishes that the penalty provision applies. I wouldn’t make the mere presence or absence of the month value decide that.

### Turn 75 — app-user

Yes. Once the penalty provision and the applicable early-repayment terms have been identified, check that the **penalty term in months** is recorded there. A missing term makes the timing review incomplete; a suspect term needs verification. A blank is not evidence that no penalty applies.

The unresolved part is still how the agent identifies the applicable terms and establishes that the penalty provision applies. I wouldn’t make the mere presence or absence of the month value decide that.

### Turn 75 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 75 — app-assistant

Recorded the conditional penalty-timing rule. It does not use the month value to decide whether a penalty applies; how to identify the provision and applicable terms remains open.

The five review rules are now captured. For the **schedule-to-terms comparison questions**, what should count as a mismatch, as opposed to an incomplete comparison, when a schedule and its applicable principal or interest terms are both available?

### Turn 75 — persona

A **mismatch** is a conflict we can actually see between recorded schedule contents and the applicable terms. For example, principal due dates falling on a different payment day or recurrence than the principal repayment terms specify, or interest due dates conflicting with the interest payment terms. If an interest-calculation schedule is on file, its calculation timing can also be compared with the recorded accrual terms.

An **incomplete comparison** means the agent lacks the applicable terms or enough schedule content to make that judgment. It should say which part it could not check, rather than call it a mismatch. We haven’t established a payment-by-payment reconciliation or a tolerance for discrepancies, so I wouldn’t add either to this check.

### Turn 76 — app-user

A **mismatch** is a conflict we can actually see between recorded schedule contents and the applicable terms. For example, principal due dates falling on a different payment day or recurrence than the principal repayment terms specify, or interest due dates conflicting with the interest payment terms. If an interest-calculation schedule is on file, its calculation timing can also be compared with the recorded accrual terms.

An **incomplete comparison** means the agent lacks the applicable terms or enough schedule content to make that judgment. It should say which part it could not check, rather than call it a mismatch. We haven’t established a payment-by-payment reconciliation or a tolerance for discrepancies, so I wouldn’t add either to this check.

### Turn 76 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 76 — app-assistant

Recorded the comparison rule: a mismatch requires an observable conflict; missing terms or schedule content makes the affected comparison incomplete. It does not claim payment-by-payment reconciliation or a discrepancy tolerance.

You also said an **amortizing loan** should have an Amortization Schedule. Once that structure is independently established, should a missing direct Loan → Amortization Schedule link be reported as a schedule-completeness gap, without inferring amortization from payment frequency?

### Turn 76 — persona

Yes. Once the loan is independently identified as amortizing, check for a **direct link to its amortization schedule**. If it’s missing, report a schedule-completeness gap. Don’t infer that structure from payment frequency alone.

For the fuller amortizing-loan check, also confirm that principal repayment terms govern payment of the loan’s principal. How the agent identifies an amortizing loan remains open.

### Turn 77 — app-user

Yes. Once the loan is independently identified as amortizing, check for a **direct link to its amortization schedule**. If it’s missing, report a schedule-completeness gap. Don’t infer that structure from payment frequency alone.

For the fuller amortizing-loan check, also confirm that principal repayment terms govern payment of the loan’s principal. How the agent identifies an amortizing loan remains open.

### Turn 77 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 77 — app-assistant

Recorded the amortizing-loan rule: when that structure is independently known, check separately for its Amortization Schedule and Principal Repayment Terms governing its Principal. How the agent identifies an amortizing loan remains open.

The rule pass now covers the five reviews, schedule comparisons, and the conditional amortization check. Is that an accurate summary of the decisions and their limits before we specify each review action’s result and verification?

### Turn 77 — persona

Yes. The rules distinguish a confirmed gap from an incomplete comparison, and each conditional check applies only after its loan type or provision is established. We still have open questions about how the agent identifies interest-bearing, secured, and amortizing loans, and applicable prepayment provisions. We shouldn’t infer any of those from a missing link or blank value.

We can specify each review’s result and verification on that basis.

### Turn 78 — app-user

Yes. The rules distinguish a confirmed gap from an incomplete comparison, and each conditional check applies only after its loan type or provision is established. We still have open questions about how the agent identifies interest-bearing, secured, and amortizing loans, and applicable prepayment provisions. We shouldn’t infer any of those from a missing link or blank value.

We can specify each review’s result and verification on that basis.

### Turn 78 — app-assistant

That matches the recorded rules. The four applicability questions remain open; I won’t turn missing links or blank values into evidence about loan type or provisions.

For **assess loan setup readiness**, the action would take a **Loan** as input and use `loanSetupReadinessChecks`. What result should it record for each check, and how should the agent verify that result against the loan and its linked records?

### Turn 78 — persona

The input is the **loan**. The agent checks its borrower and lender links; once interest-bearing applicability is established, it also checks for an applicable fixed or variable rate and interest payment terms governing the loan’s interest. We haven’t established a separate authorisation requirement for this review.

It should record **which checks were confirmed and which specific links are missing or could not be assessed**—not collapse everything into an unexplained pass or fail. The intended result is confirmation that the core parties and applicable interest terms are on file, or a clear account of what prevents that confirmation.

To verify it, the agent should inspect the loan’s borrower, lender, and applicable rate links, then confirm that the interest payment terms govern its interest. Retain the linked records checked and the findings as evidence. If interest-bearing applicability is still unknown, mark that part as unassessed rather than treating it as satisfied or failed.

### Turn 79 — app-user

The input is the **loan**. The agent checks its borrower and lender links; once interest-bearing applicability is established, it also checks for an applicable fixed or variable rate and interest payment terms governing the loan’s interest. We haven’t established a separate authorisation requirement for this review.

It should record **which checks were confirmed and which specific links are missing or could not be assessed**—not collapse everything into an unexplained pass or fail. The intended result is confirmation that the core parties and applicable interest terms are on file, or a clear account of what prevents that confirmation.

To verify it, the agent should inspect the loan’s borrower, lender, and applicable rate links, then confirm that the interest payment terms govern its interest. Retain the linked records checked and the findings as evidence. If interest-bearing applicability is still unknown, mark that part as unassessed rather than treating it as satisfied or failed.

### Turn 79 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 79 — app-assistant

Recorded the setup-readiness action with a Loan input, specific findings, an unassessed result when interest-bearing applicability is unknown, and verification against the linked records.

The tool raised an **automated navigation warning**: the governing link points from Interest Payment Terms to Interest, while this action starts at Loan. You explicitly confirmed that the agent traces back from the loan’s Interest to the terms, without reversing the meaning of `governsInterest` or adding a direct loan-to-terms link. I’ve therefore left the confirmed direction intact; the warning reflects that reverse lookup.

For **verify secured-loan support**, what result should the agent record, and how should it verify the collateral link it checked?

### Turn 79 — persona

The input is the **loan**, once it has been independently identified as secured. The agent checks for a direct link from that loan to pledged collateral; we haven’t established a separate authorisation requirement for this review.

It should record either **collateral link confirmed** or **collateral link missing**. If secured status has not been established, record the review as unassessed rather than inferring status from the presence or absence of collateral. The intended result is a clear finding about recorded collateral support—not a conclusion about every possible form of security.

To verify the finding, inspect the loan’s direct collateral link and retain the loan, any linked collateral record, and the finding as evidence. A guarantee must not be counted as collateral for this check.

### Turn 80 — app-user

The input is the **loan**, once it has been independently identified as secured. The agent checks for a direct link from that loan to pledged collateral; we haven’t established a separate authorisation requirement for this review.

It should record either **collateral link confirmed** or **collateral link missing**. If secured status has not been established, record the review as unassessed rather than inferring status from the presence or absence of collateral. The intended result is a clear finding about recorded collateral support—not a conclusion about every possible form of security.

To verify the finding, inspect the loan’s direct collateral link and retain the loan, any linked collateral record, and the finding as evidence. A guarantee must not be counted as collateral for this check.

### Turn 80 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 80 — app-assistant

Recorded the secured-support action. It verifies the direct collateral link, records confirmed, missing, or unassessed as appropriate, and does not count a guarantee. The earlier reverse-lookup navigation warning remains; this action introduced no new warning.

For **review variable-rate setup**, what finding should the agent record when the variable-rate link and reset-schedule link are present or missing, and how should it verify that finding?

### Turn 80 — persona

The input is the **loan**. If it has a variable interest rate link, the agent checks for a direct link from that same loan to an interest-rate reset schedule. We haven’t established a separate authorisation requirement.

Record **variable-rate setup confirmed** when both links are present, or **reset schedule missing** when the variable-rate link is present but the schedule link is not. If variable-rate applicability cannot be established, mark the review **unassessed**; a missing variable-rate link does not prove the loan is fixed-rate.

Verify the finding by inspecting both links on the loan, and retain the loan, the linked rate and schedule where present, and the finding as evidence.

### Turn 81 — app-user

The input is the **loan**. If it has a variable interest rate link, the agent checks for a direct link from that same loan to an interest-rate reset schedule. We haven’t established a separate authorisation requirement.

Record **variable-rate setup confirmed** when both links are present, or **reset schedule missing** when the variable-rate link is present but the schedule link is not. If variable-rate applicability cannot be established, mark the review **unassessed**; a missing variable-rate link does not prove the loan is fixed-rate.

Verify the finding by inspecting both links on the loan, and retain the loan, the linked rate and schedule where present, and the finding as evidence.

### Turn 81 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 81 — app-assistant

Recorded the variable-rate review with confirmed, missing-schedule, and unassessed findings, verified against both direct loan links. No new warning arose.

For **review payment-record completeness**, what findings should it record for a missing history, a history with no transaction entries, or a history with entries—and how should it verify each finding?

### Turn 81 — persona

The input is the **loan**. The agent first checks for a linked payment history, then checks that history for individual payment transactions. We haven’t established a separate authorisation requirement.

It should record the specific finding:

- **Payment history missing** if none is linked to the loan.
- **History has no individual entries recorded** if a history is linked but contains no transactions.
- **Payment record completeness confirmed** if the history contains individual transactions.

The intended effect is to confirm whether the loan’s payment record is trackable at those two levels. To verify and retain the finding, inspect the loan-to-history link and, where a history exists, its transaction entries; keep the loan, the history and entries found, and the finding as evidence. Neither missing finding means that no payment occurred.

### Turn 82 — app-user

The input is the **loan**. The agent first checks for a linked payment history, then checks that history for individual payment transactions. We haven’t established a separate authorisation requirement.

It should record the specific finding:

- **Payment history missing** if none is linked to the loan.
- **History has no individual entries recorded** if a history is linked but contains no transactions.
- **Payment record completeness confirmed** if the history contains individual transactions.

The intended effect is to confirm whether the loan’s payment record is trackable at those two levels. To verify and retain the finding, inspect the loan-to-history link and, where a history exists, its transaction entries; keep the loan, the history and entries found, and the finding as evidence. Neither missing finding means that no payment occurred.

### Turn 82 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 82 — app-assistant

Recorded the payment-record review with the three specific findings and verification at both link levels. Neither missing-record finding is interpreted as proof that no payment occurred.

For **review prepayment-penalty timing**, what result should it record when the applicable provision and terms are known but the month value is present, missing, or suspect? How should it verify the result, and what should it record if applicability cannot yet be established?

### Turn 82 — persona

The input is the **loan and its applicable early-repayment terms**, once the agent has established that a prepayment penalty applies. We haven’t established a separate authorisation requirement for this review.

It should record **penalty timing recorded** when the term in months is present and not in doubt, **penalty timing missing** when it is absent, or **penalty timing needs verification** when the value is suspect. If applicability or the applicable terms cannot be identified, record that part as **unassessed**—a blank month value does not mean there is no penalty.

The review’s purpose is to establish whether the penalty timing is recorded reliably. To verify its finding, the agent checks the month value on the identified terms and retains those terms, the value checked, and its finding. How it identifies the applicable terms in practice remains open.

### Turn 83 — app-user

The input is the **loan and its applicable early-repayment terms**, once the agent has established that a prepayment penalty applies. We haven’t established a separate authorisation requirement for this review.

It should record **penalty timing recorded** when the term in months is present and not in doubt, **penalty timing missing** when it is absent, or **penalty timing needs verification** when the value is suspect. If applicability or the applicable terms cannot be identified, record that part as **unassessed**—a blank month value does not mean there is no penalty.

The review’s purpose is to establish whether the penalty timing is recorded reliably. To verify its finding, the agent checks the month value on the identified terms and retains those terms, the value checked, and its finding. How it identifies the applicable terms in practice remains open.

### Turn 83 — app-tool

✓ Applied: 1 added, 0 updated.

### Turn 83 — app-assistant

Recorded the fifth review with **Loan as its single input**; the applicable terms are records it must locate and inspect. The action records timing as present, missing, suspect, or unassessed, and verifies the month value on the identified terms.

The tool raised a second **automated navigation warning**: from Loan, the link to Principal Repayment Terms can only be followed backward through Principal. You confirmed that backward tracing is how the agent finds repayment terms, so I won’t reverse the governing link. But this warning also exposes the unresolved practical question: **how does the agent distinguish the terms covering early repayment from other Principal Repayment Terms it finds for that principal?**

### Turn 83 — persona

That remains unresolved. Tracing back from the loan’s principal can find terms that govern repayment, but it does **not** tell the agent which of those terms cover early repayment or whether a penalty applies.

The early-repayment classification we discussed is a possible modeling choice, not a confirmed recorded field. Until there’s an authoritative way to identify the applicable provision and terms, the agent should leave the penalty-timing review **unassessed**. It must not use a present or blank month value to decide applicability.

### Turn 84 — app-user

That remains unresolved. Tracing back from the loan’s principal can find terms that govern repayment, but it does **not** tell the agent which of those terms cover early repayment or whether a penalty applies.

The early-repayment classification we discussed is a possible modeling choice, not a confirmed recorded field. Until there’s an authoritative way to identify the applicable provision and terms, the agent should leave the penalty-timing review **unassessed**. It must not use a present or blank month value to decide applicability.

### Turn 84 — app-assistant

Confirmed. Tracing from Loan through Principal can find governing repayment terms, but it cannot establish which terms cover early repayment or whether a penalty applies. Until an authoritative way to identify both is known, the penalty-timing review remains **unassessed**; the month value cannot decide applicability. The tool’s navigation warnings remain visible, and I have not reversed the governing links to silence them.

All five review actions now have an input, a rule, a recorded finding, and a verification step. Before validation, I want to make one bounded check for missing neighboring information. **For Loan itself, are there any responsible parties, lifecycle states, or related records essential to these agreed questions and reviews that we have not covered?** “No, those are covered” is a complete answer.

### Turn 84 — persona

No. For the agreed questions and reviews, the responsible parties and related records we need are covered. I wouldn’t add a lifecycle state or another loan-level record as essential to these checks. The unresolved items are how the agent establishes the loan types and provisions that trigger the conditional reviews.

### Turn 85 — app-user

No. For the agreed questions and reviews, the responsible parties and related records we need are covered. I wouldn’t add a lifecycle state or another loan-level record as essential to these checks. The unresolved items are how the agent establishes the loan types and provisions that trigger the conditional reviews.

### Turn 85 — app-assistant

For Loan, the neighboring parties and records are covered; no loan lifecycle state or additional loan-level record is needed for these tasks. The conditional applicability questions remain open.

For **Principal, Interest, and their repayment and payment terms**, are there any connected obligations, calculation inputs, or term records essential to the agreed comparisons that we have missed? “No” is fine.

### Turn 85 — persona

No additional obligation, calculation input, or term record is essential to the agreed comparisons. We’ve covered principal and interest separately, their governing terms, and the day-count convention for interest accrual.

The open issue is still how the agent identifies terms covering early repayment and establishes that a penalty applies.

### Turn 86 — app-user

No additional obligation, calculation input, or term record is essential to the agreed comparisons. We’ve covered principal and interest separately, their governing terms, and the day-count convention for interest accrual.

The open issue is still how the agent identifies terms covering early repayment and establishes that a penalty applies.

### Turn 86 — app-assistant

For Principal, Interest, and their terms, no additional neighboring record is needed. Identifying early-repayment terms and penalty applicability remains open.

For the **schedules and Payment History**, are there any component records, earlier or later stages, or responsible parties essential to the agreed comparisons and tracking check that we have missed? “No” is fine.

### Turn 86 — persona

No. For the agreed comparisons, the schedules themselves are enough; we haven’t established a need to model their individual entries. For the tracking check, the loan’s payment history and the individual transactions it contains are covered. No additional stage or responsible party is essential to those checks.

### Turn 87 — app-user

No. For the agreed comparisons, the schedules themselves are enough; we haven’t established a need to model their individual entries. For the tracking check, the loan’s payment history and the individual transactions it contains are covered. No additional stage or responsible party is essential to those checks.

### Turn 87 — app-assistant

The schedule and payment-history neighbors are covered; no schedule-entry class, extra stage, or responsible party is needed for the agreed checks.

For **rate arrangements and pledged collateral**, are there any connected records or responsible parties essential to the variable-rate and collateral reviews that we have missed? “No” is fine.

### Turn 87 — persona

No. The loan’s rate arrangement and direct reset-schedule link cover the variable-rate review; its direct link to pledged collateral covers the collateral review. We still need an independent way to identify when a loan is secured, but that doesn’t call for another connected record in these agreed checks.

### Turn 88 — app-user

No. The loan’s rate arrangement and direct reset-schedule link cover the variable-rate review; its direct link to pledged collateral covers the collateral review. We still need an independent way to identify when a loan is secured, but that doesn’t call for another connected record in these agreed checks.

### Turn 88 — app-assistant

That completes the bounded check for missing neighboring information. You confirmed no additional essential records or roles for the loan, its obligations and terms, schedules and payment history, rate arrangements, or collateral. I’ve added nothing from this pass.

The unresolved items are still **how the agent establishes interest-bearing, secured, and amortizing applicability, and how it identifies an applicable prepayment-penalty provision and terms**. Is that an accurate recap before I replay the recorded questions and actions against the live model?

### Turn 88 — persona

Yes. Those are the open applicability questions. Until each is established from an authoritative source, the agent should leave the affected conditional check unassessed rather than infer an answer from a missing link or blank value.

### Turn 89 — app-user

Yes. Those are the open applicability questions. Until each is established from an authoritative source, the agent should leave the affected conditional check unassessed rather than infer an answer from a missing link or blank value.

### Turn 89 — app-tool

🔍 Checked the current ontology state.

### Turn 89 — app-assistant

I replayed the **14 questions and five actions recorded on the live model**. Here is the coverage check:

| Recorded question | What the agent can use |
|---|---|
| 1–2. Borrower and lender | The two separate direct links from Loan. **Covered.** |
| 3. Principal amount, rate, maturity | Loan’s principal amount and maturity date, plus the applicable rate arrangement’s value. **Covered when those values are present; missing values must be flagged.** |
| 4–5. Principal and interest payment requirements | Trace each loan obligation back to its governing terms; interest terms also link to Day Count Convention. **Covered conceptually, subject to the reverse-lookup issue below.** |
| 6. Schedules on file | The separate direct schedule links from Loan. **Covered.** |
| 7–8. Schedules versus principal, interest, and accrual terms | Bring schedules and governing terms together for the same loan; the comparison rule distinguishes observable conflict from insufficient information. **Covered at the agreed schedule level, not as entry-by-entry reconciliation.** |
| 9. Is the loan secured? | **Not yet covered:** no authoritative way to identify secured status is established. |
| 10. Collateral supporting a secured loan | `isCollateralizedBy` identifies pledged collateral, not a guarantee. **Covered once secured status is independently known.** |
| 11. Servicer collecting for the lender | The direct Loan → Servicer link and its meaning. **Covered.** |
| 12. When resets are scheduled | Loan’s variable-rate and Rate Reset Schedule links; the agent consults the schedule record. **Covered without a claimed date-field structure.** |
| 13–14. Payments made and individual entries | Loan → Payment History → Payment Transaction. **Covered for finding and reporting entries and checking their presence; not for a dated or amount-based report.** |

All **five review actions** have a Loan input, a named rule, specific findings, and a verification step. Payment-record and variable-rate reviews can use their recorded links. Setup readiness, secured support, and prepayment timing correctly return **unassessed** where their applicability cannot be established. The amortizing-loan schedule check likewise remains conditional on identifying that structure.

Two automated warnings remain: the tool cannot navigate *forward* from Loan to the governing interest or principal terms, although you confirmed that the agent should trace **backward** from the loan’s obligation. I will not reverse those governing links or invent direct loan-to-terms links to clear a warning. The more substantive open prerequisites are authoritative identification of **interest-bearing**, **secured**, and **amortizing** loans, and of **applicable early-repayment terms and penalty provisions**.

To address the navigation issue first: **in practice, can the agent search governing terms by the loan’s linked Principal or Interest obligation, following `governsPrincipal` or `governsInterest` backward, or is that lookup capability not yet established?**

### Turn 89 — persona

The **conceptual lookup is sound**: start with the loan’s principal or interest obligation, then find the terms that govern payment of that obligation. That does not reverse the meaning of the governing link.

I can’t confirm that the agent’s operating system supports that backward search. Until it does, mark the lookup capability as an implementation prerequisite—not as a reason to change the connections. And even if the search works, it won’t by itself identify which principal repayment terms cover early repayment.

### Turn 90 — app-user

The **conceptual lookup is sound**: start with the loan’s principal or interest obligation, then find the terms that govern payment of that obligation. That does not reverse the meaning of the governing link.

I can’t confirm that the agent’s operating system supports that backward search. Until it does, mark the lookup capability as an implementation prerequisite—not as a reason to change the connections. And even if the search works, it won’t by itself identify which principal repayment terms cover early repayment.

### Turn 90 — app-assistant

That separates the two issues. The **model’s direction is correct**: terms govern the Principal or Interest obligation, and the agent would search backward from that obligation. Whether its operating system supports that search is an **implementation prerequisite**, not a reason to change the links. Even with that search, identifying early-repayment terms remains unresolved.

I’ll work through the applicability gaps one at a time. **What authoritative record or determination tells the agent that a particular loan is secured, independently of whether collateral is linked?** If that source has not been established, please say so.

### Turn 90 — persona

We haven’t established an authoritative record or determination for that in this scope. The loan may be recognized as a **secured loan**, but I can’t confirm where the agent would read that designation.

Keep secured status as an open prerequisite. The agent shouldn’t infer it from a collateral link, or decide a loan is unsecured because no collateral is linked.

### Turn 91 — app-user

We haven’t established an authoritative record or determination for that in this scope. The loan may be recognized as a **secured loan**, but I can’t confirm where the agent would read that designation.

Keep secured status as an open prerequisite. The agent shouldn’t infer it from a collateral link, or decide a loan is unsecured because no collateral is linked.

### Turn 91 — app-assistant

Secured status remains an open prerequisite. The collateral link can verify pledged support **after** secured status is known; it cannot establish secured status, and an absent link cannot establish that a loan is unsecured.

**What authoritative record or determination tells the agent that a particular loan is interest-bearing, independently of whether a rate or interest-terms link is present?** If that source is not established, please say so.

### Turn 91 — persona

We haven’t established an independent authoritative record or determination for interest-bearing status either. A rate or interest-terms link may be relevant evidence, but its absence could be the setup gap we’re looking for.

Keep that applicability question open. Until it’s resolved, the agent can check borrower and lender for readiness, but should mark the conditional interest portion **unassessed** rather than call it complete or interest-free.

### Turn 92 — app-user

We haven’t established an independent authoritative record or determination for interest-bearing status either. A rate or interest-terms link may be relevant evidence, but its absence could be the setup gap we’re looking for.

Keep that applicability question open. Until it’s resolved, the agent can check borrower and lender for readiness, but should mark the conditional interest portion **unassessed** rather than call it complete or interest-free.

### Turn 92 — app-assistant

Interest-bearing status also remains open. Until it is established independently, setup readiness can check Borrower and Lender, but must mark the interest-specific checks **unassessed**—not complete or interest-free.

**What authoritative record or determination tells the agent that a particular loan is amortizing, independently of its payment frequency or whether an Amortization Schedule is linked?** If no source is established, please say so.

### Turn 92 — persona

We haven’t established an authoritative source for identifying a particular loan as amortizing. Payment frequency doesn’t establish it, and the presence or absence of an amortization schedule shouldn’t be used to decide whether the check applies.

Keep that identification as an open prerequisite. Once it is established, the agent can check for the loan’s amortization schedule and principal repayment terms governing its principal; until then, leave that conditional check unassessed.

### Turn 93 — app-user

We haven’t established an authoritative source for identifying a particular loan as amortizing. Payment frequency doesn’t establish it, and the presence or absence of an amortization schedule shouldn’t be used to decide whether the check applies.

Keep that identification as an open prerequisite. Once it is established, the agent can check for the loan’s amortization schedule and principal repayment terms governing its principal; until then, leave that conditional check unassessed.

### Turn 93 — app-assistant

Amortizing status remains an open prerequisite too. The agent cannot derive it from payment frequency or from whether an amortization schedule is present; until it is independently established, that check stays unassessed.

For the last applicability gap: **has an authoritative source been established for identifying both an applicable prepayment-penalty provision and the Principal Repayment Terms that cover early repayment?**Amortizing status remains an open prerequisite too. The agent cannot derive it from payment frequency or from whether an amortization schedule is present; until it is independently established, that check stays unassessed.

For the last applicability gap: **has an authoritative source been established for identifying both an applicable prepayment-penalty provision and the Principal Repayment Terms that cover early repayment?**

### Turn 93 — persona

No. We haven’t established an authoritative source for either the applicable prepayment-penalty provision or which principal repayment terms cover early repayment. Until both are identified, the agent should leave the penalty-timing review **unassessed**. It must not use a present or blank penalty-period value to decide whether the provision applies.

### Turn 94 — app-user

No. We haven’t established an authoritative source for either the applicable prepayment-penalty provision or which principal repayment terms cover early repayment. Until both are identified, the agent should leave the penalty-timing review **unassessed**. It must not use a present or blank penalty-period value to decide whether the provision applies.

### Turn 94 — app-tool

🔍 Checked the current ontology state.

### Turn 94 — app-assistant

The final check leaves the model **known-incomplete**, rather than ready for unconditional use. The five review actions and their verification steps are recorded, but the agent must mark a conditional check **unassessed** when it cannot establish that the check applies.

The remaining open items are:

1. An authoritative way to identify whether a loan is **interest-bearing**, **secured**, or **amortizing**.
2. An authoritative way to identify both an applicable **prepayment-penalty provision** and the Principal Repayment Terms covering early repayment.
3. Confirmation that the agent’s operating system can search **backward** from a loan’s Principal or Interest to the terms that govern it.

The automated consistency check still reports two navigation warnings for the setup-readiness and prepayment actions: their Loan input cannot reach the governing terms by following links only in their recorded direction. Those links have the direction you confirmed, so I have not reversed them or invented direct links.

An **automated second opinion** also noted that the prepayment action describes a result *if* the provision and terms are identified, while its verification says their identification remains unresolved. That is a real operational limitation, not a claim that identification has already succeeded: until both are established, the recorded result is **unassessed**.

The other final checks found no unconnected classes or missing meanings. The later-added Interest Calculation Schedule received its own connection check; no unconfirmed direct links or aliases were added. The bounded check for missing neighboring information was completed with you, and it yielded no additions.

### Turn 94 — harness

Before we close, one more systematic pass, to catch what we have not talked about yet.

Call get_graph_state first and treat it as the source of truth for what is already on the canvas. Then go through every class on the canvas, three to five classes per question, and ask me, for each one, what exists around it in our work: its subordinate parts or components; its states or lifecycle events; the actors or parties responsible for it; its inputs and outputs; related documents or agreements; measurements or characteristic values it carries; earlier or later stages of a workflow it belongs to; more specific or sibling kinds of the same thing; and which of the properties already confirmed on a sibling class also apply to it. Skip the categories that plainly do not fit a class.

Ask these as open questions about what exists, not about what the agent needs: do not limit a question to what the recorded competency questions or actions require, and do not ask me to mention only what is needed. Only once I have answered, check each thing I named against the competency questions and actions, exactly as you would any other candidate, and add only what passes; nothing is added only because it was mentioned. Keep a running list of the candidates and close each one as added, declined (with the reason) or left open; none may silently disappear.

When every class in this pass has been asked about and every candidate is closed, end that message with one line in exactly this form, and ask nothing further in it:
COVERAGE LEDGER: surfaced=<number>; added=<number>; declined=<number>; open=<number>

### Turn 95 — app-user

Before we close, one more systematic pass, to catch what we have not talked about yet.

Call get_graph_state first and treat it as the source of truth for what is already on the canvas. Then go through every class on the canvas, three to five classes per question, and ask me, for each one, what exists around it in our work: its subordinate parts or components; its states or lifecycle events; the actors or parties responsible for it; its inputs and outputs; related documents or agreements; measurements or characteristic values it carries; earlier or later stages of a workflow it belongs to; more specific or sibling kinds of the same thing; and which of the properties already confirmed on a sibling class also apply to it. Skip the categories that plainly do not fit a class.

Ask these as open questions about what exists, not about what the agent needs: do not limit a question to what the recorded competency questions or actions require, and do not ask me to mention only what is needed. Only once I have answered, check each thing I named against the competency questions and actions, exactly as you would any other candidate, and add only what passes; nothing is added only because it was mentioned. Keep a running list of the candidates and close each one as added, declined (with the reason) or left open; none may silently disappear.

When every class in this pass has been asked about and every candidate is closed, end that message with one line in exactly this form, and ask nothing further in it:
COVERAGE LEDGER: surfaced=<number>; added=<number>; declined=<number>; open=<number>

### Turn 95 — app-tool

🔍 Checked the current ontology state.

### Turn 95 — app-assistant

I checked the live canvas first. It has 20 classes, 14 recorded questions, and five review actions. I’ll keep a candidate ledger and test anything new against those requirements before adding it.

We already asked about neighboring structures for Loan, the obligations and terms, schedules and payment history, rates, and collateral; you answered that nothing further was essential to the agreed work, so I won’t re-probe those groups. I can examine the roles more specifically, without treating anything you mention as automatically in scope.

For **Borrower, Lender, and Servicer**, what closely related parties, responsibilities, or agreements exist around each in your work that we have not distinguished? “Nothing further for these three” is fine.

### Turn 95 — persona

For the agreed checks, nothing further is needed beneath those three roles. The borrower owes repayment, the lender provides the credit, and the servicer collects principal and interest on the lender’s behalf.

In the wider work, a borrower and lender are also parties to a **credit agreement or credit facility**, and we may track an assessed **borrowing capacity** for the borrower. A **credit enhancement beneficiary** is a distinct party when a credit enhancement agreement is involved; it is not another name for the lender or servicer. None of those additions is necessary just to answer the agreed loan-party and servicing questions.

### Turn 96 — app-user

For the agreed checks, nothing further is needed beneath those three roles. The borrower owes repayment, the lender provides the credit, and the servicer collects principal and interest on the lender’s behalf.

In the wider work, a borrower and lender are also parties to a **credit agreement or credit facility**, and we may track an assessed **borrowing capacity** for the borrower. A **credit enhancement beneficiary** is a distinct party when a credit enhancement agreement is involved; it is not another name for the lender or servicer. None of those additions is necessary just to answer the agreed loan-party and servicing questions.

### Turn 96 — app-assistant

I’ve noted four wider-work candidates: **credit agreement or credit facility** (I’m not assuming those are the same thing), **borrower borrowing capacity**, **credit enhancement agreement**, and **credit enhancement beneficiary**. I’ll leave all four **out of the model for now**: you said none is needed for the agreed questions or reviews. The beneficiary will not be merged with Lender or Servicer.

For **Fixed Interest Rate, Variable Interest Rate, Principal Repayment Terms, and Interest Payment Terms**, do any properties already recorded on one also apply to a closely related one, or do the recorded differences reflect how your work treats them?

### Turn 96 — persona

The **rate value** applies to both fixed and variable interest rates; the difference is whether it stays fixed or can change. A variable-rate loan also needs a reset schedule linked to the loan, not a reset field copied onto the rate arrangement.

Both sets of payment terms can specify a **payment frequency and payment day**, but they govern different obligations. Principal repayment terms carry principal payment and repayment dates. Interest payment terms carry interest payment dates, plus accrual and compounding information and the link to the day-count convention. I wouldn’t copy those interest-calculation details onto principal repayment terms.

### Turn 97 — app-user

The **rate value** applies to both fixed and variable interest rates; the difference is whether it stays fixed or can change. A variable-rate loan also needs a reset schedule linked to the loan, not a reset field copied onto the rate arrangement.

Both sets of payment terms can specify a **payment frequency and payment day**, but they govern different obligations. Principal repayment terms carry principal payment and repayment dates. Interest payment terms carry interest payment dates, plus accrual and compounding information and the link to the day-count convention. I wouldn’t copy those interest-calculation details onto principal repayment terms.

### Turn 97 — app-assistant

That confirms the properties already on the canvas: both rate arrangements have `rateValue`, and both sets of payment terms have payment frequency and payment day. The reset schedule belongs to the loan; interest accrual and day-count details do not belong on principal repayment terms. **No new candidate arose from this batch.**

For the running ledger, the four wider-work candidates from your previous answer are **declined for this task-focused model**: the credit agreement or facility, assessed borrowing capacity, credit enhancement agreement, and credit enhancement beneficiary. None has a stated use in a recorded question or review. I’m not treating “credit agreement” and “credit facility” as confirmed synonyms, or the beneficiary as another name for a recorded role.

For the five schedule classes—**Loan Payment Schedule, Amortization Schedule, Principal Payment Schedule, Interest Payment Schedule, and Interest Calculation Schedule**—what subordinate records, stages, or characteristic values exist around each in your work, and do any characteristics of one also apply to another? We have not established individual schedule-entry fields, so descriptions in your own terms are fine.

### Turn 97 — persona

The four payment schedules—the general loan, amortization, principal-payment, and interest-payment schedules—can each carry an **anticipated number of payments**. We left that out of the task-focused model because none of the agreed checks uses the count. I wouldn’t carry it over to the interest-calculation schedule.

Their contents differ: the general schedule sets out loan-specific payments; the amortization schedule shows periodic payments and changes in the debt balance; the principal and interest schedules show when each is due. The interest-calculation schedule shows when interest is calculated, which need not be when it is paid.

Those schedules concern what is planned under the loan. **Actual payments** belong in payment history. We haven’t established subordinate schedule-entry records or fields for the agreed comparisons, so I wouldn’t add them on the strength of these descriptions.

### Turn 98 — app-user

The four payment schedules—the general loan, amortization, principal-payment, and interest-payment schedules—can each carry an **anticipated number of payments**. We left that out of the task-focused model because none of the agreed checks uses the count. I wouldn’t carry it over to the interest-calculation schedule.

Their contents differ: the general schedule sets out loan-specific payments; the amortization schedule shows periodic payments and changes in the debt balance; the principal and interest schedules show when each is due. The interest-calculation schedule shows when interest is calculated, which need not be when it is paid.

Those schedules concern what is planned under the loan. **Actual payments** belong in payment history. We haven’t established subordinate schedule-entry records or fields for the agreed comparisons, so I wouldn’t add them on the strength of these descriptions.

### Turn 98 — app-assistant

The schedules remain distinct: planned payments and calculations belong to their respective schedules; actual payments belong in Payment History. I’ll **decline four anticipated-payment-count properties**—one for each payment schedule—because none supports an agreed question or review. I’ll also **decline a schedule-entry class for now** because its structure has not been established. Neither is being added.

For **Loan, Principal, Interest, and Day Count Convention**, what parts, states, characteristic values, related records, or earlier or later stages exist around each in your work that we have not distinguished? Please skip anything that does not apply.

### Turn 98 — persona

A few neighboring items exist, but I wouldn’t add them automatically to the agreed model:

- **Loan:** We can track the initial funding date, current balance, and features such as interest-only payments, a balloon payment, or negative amortization. A rate cap and first rate-change term may matter for a variable-rate loan. The agreed questions do not currently call for those values.
- **Principal:** It can have an **outstanding amount**—what remains owed—distinct from the loan’s original principal amount. We already agreed not to add it for these checks.
- **Interest:** We can track an outstanding amount and, separately, **accrued interest**: interest incurred as of a date but not yet paid. Accrual is the process; accrued interest is the dated amount.
- **Day-count convention:** Nothing further needs distinguishing for the agreed work. The interest payment terms’ link to the applicable convention identifies the calculation basis.

None of those additions changes the open applicability questions or the five reviews we’ve defined.

### Turn 99 — app-user

A few neighboring items exist, but I wouldn’t add them automatically to the agreed model:

- **Loan:** We can track the initial funding date, current balance, and features such as interest-only payments, a balloon payment, or negative amortization. A rate cap and first rate-change term may matter for a variable-rate loan. The agreed questions do not currently call for those values.
- **Principal:** It can have an **outstanding amount**—what remains owed—distinct from the loan’s original principal amount. We already agreed not to add it for these checks.
- **Interest:** We can track an outstanding amount and, separately, **accrued interest**: interest incurred as of a date but not yet paid. Accrual is the process; accrued interest is the dated amount.
- **Day-count convention:** Nothing further needs distinguishing for the agreed work. The interest payment terms’ link to the applicable convention identifies the calculation basis.

None of those additions changes the open applicability questions or the five reviews we’ve defined.

### Turn 99 — app-assistant

I’ve noted the additional loan values and features, Principal’s outstanding amount, and Interest’s outstanding and accrued amounts. I’ll **decline them for this task-focused model**: you’ve confirmed that none is used by the 14 recorded questions or five reviews. I’ll keep the distinction between accrual as a process and accrued interest as a dated amount; I won’t merge them. Nothing new was identified around Day Count Convention.

That leaves four classes in this pass. For **Collateral, Rate Reset Schedule, Payment History, and Payment Transaction**, what parts, states, responsible parties, related records, characteristic values, or workflow stages exist around each in your work that we have not distinguished? Please skip categories that do not fit.

### Turn 99 — persona

A few related items are worth noting, but none needs to be added for the agreed checks:

- **Collateral:** A security agreement sets out rights over pledged collateral, and an appraised collateral value is recorded as of a date. For collateralized loans, we may also track loan-to-value measures. The current review only checks the loan’s direct collateral link.
- **Interest-rate reset schedule:** It sets out when resets are scheduled. An actual interest-rate reset is an event, distinct from the schedule. We haven’t established fields for either schedule entries or events here.
- **Payment history:** It contains actual individual payment transactions, not planned payments. There’s no confirmed history-status field for these reviews.
- **Individual payment transaction:** A transaction may be toward principal, interest, fees, or another related amount. We haven’t established transaction date, amount, or allocation fields for this model.

I wouldn’t add those neighboring records or fields without a question or review that uses them.

### Turn 100 — app-user

A few related items are worth noting, but none needs to be added for the agreed checks:

- **Collateral:** A security agreement sets out rights over pledged collateral, and an appraised collateral value is recorded as of a date. For collateralized loans, we may also track loan-to-value measures. The current review only checks the loan’s direct collateral link.
- **Interest-rate reset schedule:** It sets out when resets are scheduled. An actual interest-rate reset is an event, distinct from the schedule. We haven’t established fields for either schedule entries or events here.
- **Payment history:** It contains actual individual payment transactions, not planned payments. There’s no confirmed history-status field for these reviews.
- **Individual payment transaction:** A transaction may be toward principal, interest, fees, or another related amount. We haven’t established transaction date, amount, or allocation fields for this model.

I wouldn’t add those neighboring records or fields without a question or review that uses them.

### Turn 100 — app-assistant

That completes the pass across all **20 classes** on the canvas. The final four classes surfaced eight candidates: a security agreement, dated collateral appraisal value, loan-to-value measure, actual rate-reset event, payment-history status, and transaction date, amount, and allocation fields. I’ve **declined all eight for this task-focused model**: none is used by a recorded question or review, and the proposed entry or event fields have not been established. I’ve added nothing on the strength of this pass alone.

The running ledger is closed: 4 wider-work candidates around the parties, 5 around schedules, 10 around Loan/Principal/Interest, and these 8—**27 surfaced, 27 declined, none added or left open from this pass**. The previously identified applicability sources and backward-search capability remain unresolved implementation prerequisites; this pass has not resolved them, so the model remains known-incomplete for the affected conditional checks.

COVERAGE LEDGER: surfaced=27; added=0; declined=27; open=0

### Turn 100 — harness

One last pass, on wording: I would like the model to use our own words.

Call get_graph_state first. Then go through what is on the canvas, three to five items per question, relationships first, then properties, then classes:
- for each relationship, ask me what we call this connection ourselves, in one verb phrase, and which way round we would say it;
- for each property and each class, ask me whether that is what we would call it, or whether we have our own term for it.

Record each answer with the rename_ontology_elements tool: a relationship takes my verb phrase, and if I state it the other way round it is turned round (reverse: true); a property or a class takes my term. Previous names of classes and relationships are kept as aliases automatically. Where I say the current name is already right, leave it as it is. Do not add or remove anything in this pass.

When every relationship, property and class has been asked about, end that message with one line in exactly this form, and ask nothing further in it:
NAMING LEDGER: relationships_renamed=<number>; relationships_redirected=<number>; properties_renamed=<number>; classes_renamed=<number>

### Turn 101 — app-user

One last pass, on wording: I would like the model to use our own words.

Call get_graph_state first. Then go through what is on the canvas, three to five items per question, relationships first, then properties, then classes:
- for each relationship, ask me what we call this connection ourselves, in one verb phrase, and which way round we would say it;
- for each property and each class, ask me whether that is what we would call it, or whether we have our own term for it.

Record each answer with the rename_ontology_elements tool: a relationship takes my verb phrase, and if I state it the other way round it is turned round (reverse: true); a property or a class takes my term. Previous names of classes and relationships are kept as aliases automatically. Where I say the current name is already right, leave it as it is. Do not add or remove anything in this pass.

When every relationship, property and class has been asked about, end that message with one line in exactly this form, and ask nothing further in it:
NAMING LEDGER: relationships_renamed=<number>; relationships_redirected=<number>; properties_renamed=<number>; classes_renamed=<number>

### Turn 101 — app-tool

🔍 Checked the current ontology state.

### Turn 101 — app-assistant

I checked the live canvas. I’ll use its current names as the starting point, ask about **relationships first**, then properties, then classes, in batches of three to five. I’ll rename only where you give a different term; otherwise I’ll leave the name and direction unchanged. I won’t add or remove anything in this pass.

For these five connections, what verb phrase would your team use, and which way round would you say it? “Current name and direction are right” is fine for any item.

1. Loan → Borrower: `hasBorrower`
2. Loan → Lender: `hasLender`
3. Loan → Servicer: `servicedBy`
4. Loan → Principal: `hasPrincipal`
5. Loan → Interest: `hasInterest`

### Turn 101 — persona

I’d keep all five directions and names. In ordinary speech:

1. A loan **has a borrower**.
2. A loan **has a lender**.
3. A loan **is serviced by** a servicer.
4. A loan **has principal**.
5. A loan **has interest**.

The servicer collects payments on the lender’s behalf; it need not be the lender.

### Turn 102 — app-user

I’d keep all five directions and names. In ordinary speech:

1. A loan **has a borrower**.
2. A loan **has a lender**.
3. A loan **is serviced by** a servicer.
4. A loan **has principal**.
5. A loan **has interest**.

The servicer collects payments on the lender’s behalf; it need not be the lender.

### Turn 102 — app-assistant

Those five relationship names and directions stay as recorded. No rename is needed.

For the next five, what verb phrase would your team use, and which way round would you say it?

1. Principal Repayment Terms → Principal: `governsPrincipal`
2. Interest Payment Terms → Interest: `governsInterest`
3. Interest Payment Terms → Day Count Convention: `usesDayCountConvention`
4. Loan → Fixed Interest Rate: `hasFixedInterestRate`
5. Loan → Variable Interest Rate: `hasVariableInterestRate`

### Turn 102 — persona

All five directions are right. I’d use slightly different verbs for the connections:

1. **Principal repayment terms govern payment of the principal.**
2. **Interest payment terms govern payment of the interest.** That wording keeps the focus on payment, rather than suggesting the terms govern everything about either obligation.
3. **Interest payment terms have the day-count convention as their accrual basis.**
4. **A loan has an interest rate**—in this case, a fixed rate.
5. **A loan has an interest rate**—in this case, a variable rate.

The last two are distinct rate arrangements, even though I’d use the same verb for each link.

### Turn 103 — app-user

All five directions are right. I’d use slightly different verbs for the connections:

1. **Principal repayment terms govern payment of the principal.**
2. **Interest payment terms govern payment of the interest.** That wording keeps the focus on payment, rather than suggesting the terms govern everything about either obligation.
3. **Interest payment terms have the day-count convention as their accrual basis.**
4. **A loan has an interest rate**—in this case, a fixed rate.
5. **A loan has an interest rate**—in this case, a variable rate.

The last two are distinct rate arrangements, even though I’d use the same verb for each link.

### Turn 103 — app-tool

✓ Renamed: 3 element(s).

### Turn 103 — app-assistant

I renamed the first three connections to your wording, keeping their directions. The two rate links need one clarification before I rename them: you say **“has an interest rate”** for both, while the current names distinguish fixed from variable.

Should **both** links be named `hasInterestRate`, with the target class carrying the fixed/variable distinction, or should the link names keep that distinction too?

### Turn 103 — persona

Use **“has interest rate”** for both links; the linked rate arrangement tells you whether it’s fixed or variable. Keep the two target types distinct, but don’t make the verb itself carry that distinction.

### Turn 104 — app-user

Use **“has interest rate”** for both links; the linked rate arrangement tells you whether it’s fixed or variable. Keep the two target types distinct, but don’t make the verb itself carry that distinction.

### Turn 104 — app-tool

✓ Renamed: 2 element(s).

### Turn 104 — app-assistant

Both rate links now use `hasInterestRate`, with Fixed Interest Rate and Variable Interest Rate still distinct targets. No directions changed.

For the next five connections, what verb phrase would your team use, and which way round would you say it? “Current name and direction are right” is fine.

1. Loan → Rate Reset Schedule: `hasRateResetSchedule`
2. Loan → Loan Payment Schedule: `hasLoanPaymentSchedule`
3. Loan → Amortization Schedule: `hasAmortizationSchedule`
4. Loan → Principal Payment Schedule: `hasPrincipalPaymentSchedule`
5. Loan → Interest Payment Schedule: `hasInterestPaymentSchedule`

### Turn 104 — persona

All five directions are right: each schedule is linked directly from the loan. I’d use **“has a schedule”** for each connection and let the schedule type say whether it’s for rate resets, general payments, amortization, principal payments, or interest payments. One schedule being on file doesn’t imply that any of the others is.

### Turn 105 — app-user

All five directions are right: each schedule is linked directly from the loan. I’d use **“has a schedule”** for each connection and let the schedule type say whether it’s for rate resets, general payments, amortization, principal payments, or interest payments. One schedule being on file doesn’t imply that any of the others is.

### Turn 105 — app-tool

✓ Renamed: 5 element(s).

### Turn 105 — app-assistant

Those five links now use `hasSchedule`; their distinct schedule targets and direct Loan → Schedule directions remain unchanged.

For the last four connections, what verb phrase would your team use, and which way round would you say it?

1. Loan → Payment History: `hasPaymentHistory`
2. Payment History → Payment Transaction: `containsPaymentTransaction`
3. Loan → Interest Calculation Schedule: `hasInterestCalculationSchedule`
4. Loan → Collateral: `isCollateralizedBy`

### Turn 105 — persona

I’d keep the directions and put them this way:

1. A loan **has payment history**.
2. A payment history **has individual payments**. I’d use that rather than “contains payment transactions”; each entry is an individual actual payment.
3. A loan **has a schedule**—here, an interest-calculation schedule, consistent with the other schedule links.
4. A **secured loan is collateralized by** pledged collateral. That link identifies collateral, not a guarantee, and does not imply the loan owns the asset.

### Turn 106 — app-user

I’d keep the directions and put them this way:

1. A loan **has payment history**.
2. A payment history **has individual payments**. I’d use that rather than “contains payment transactions”; each entry is an individual actual payment.
3. A loan **has a schedule**—here, an interest-calculation schedule, consistent with the other schedule links.
4. A **secured loan is collateralized by** pledged collateral. That link identifies collateral, not a guarantee, and does not imply the loan owns the asset.

### Turn 106 — app-tool

✓ Renamed: 2 element(s).

### Turn 106 — app-assistant

The relationship wording pass is complete. I renamed the Payment History link to `hasIndividualPayments` and the Interest Calculation Schedule link to `hasSchedule`. `hasPaymentHistory` and `isCollateralizedBy` stay as they are. **No relationship directions changed.**

Now, for these five **property names**, are the current names what your team would use? If not, give your term for each:

1. Loan: `principalAmount`
2. Loan: `maturityDate`
3. Principal Repayment Terms: `initialPrincipalPaymentDate`
4. Principal Repayment Terms: `principalRepaymentDate`
5. Principal Repayment Terms: `paymentFrequency`

### Turn 106 — persona

The first four names are what I’d use: **principal amount**, **maturity date**, **initial principal payment date**, and **principal repayment date**.

For the fifth, I’d say **principal payment frequency**. That makes clear it describes principal payments, not interest payments.

### Turn 107 — app-user

The first four names are what I’d use: **principal amount**, **maturity date**, **initial principal payment date**, and **principal repayment date**.

For the fifth, I’d say **principal payment frequency**. That makes clear it describes principal payments, not interest payments.

### Turn 107 — app-tool

✓ Renamed: 1 element(s).

### Turn 107 — app-assistant

Renamed that property to `principalPaymentFrequency`. The other four names stay as they are.

For the next five property names, would your team keep these, or use another term?

1. Principal Repayment Terms: `paymentDay`
2. Principal Repayment Terms: `prepaymentPenaltyTermMonths`
3. Interest Payment Terms: `initialInterestPaymentDate`
4. Interest Payment Terms: `finalInterestPaymentDate`
5. Interest Payment Terms: `paymentFrequency`

### Turn 107 — persona

I’d keep **initial interest payment date** and **final interest payment date**. I’d make the other three more specific:

1. **Principal payment day**—so it isn’t confused with the interest payment day.
2. **Prepayment penalty term in months**—on the applicable early-repayment terms, not on every principal repayment terms record.
5. **Interest payment frequency**—to distinguish it from principal payment frequency.

### Turn 108 — app-user

I’d keep **initial interest payment date** and **final interest payment date**. I’d make the other three more specific:

1. **Principal payment day**—so it isn’t confused with the interest payment day.
2. **Prepayment penalty term in months**—on the applicable early-repayment terms, not on every principal repayment terms record.
5. **Interest payment frequency**—to distinguish it from principal payment frequency.

### Turn 108 — app-tool

✓ Renamed: 3 element(s).

### Turn 108 — app-assistant

Renamed the three properties you specified. The two interest-payment date names stay unchanged. The prepayment-penalty value still applies only to the identified early-repayment terms.

For the next five property names, would your team keep these or use another term?

1. Interest Payment Terms: `paymentDay`
2. Interest Payment Terms: `initialInterestAccrualDate`
3. Interest Payment Terms: `compoundingFrequency`
4. Fixed Interest Rate: `rateValue`
5. Variable Interest Rate: `rateValue`

### Turn 108 — persona

I’d use **interest payment day** for the first, to distinguish it from principal payment day. The other names work in ordinary terms: **initial interest accrual date**, **compounding frequency**, and **rate** for either the fixed or variable rate arrangement. I’d call the last two simply “rate,” rather than “rate value.”

### Turn 109 — app-user

I’d use **interest payment day** for the first, to distinguish it from principal payment day. The other names work in ordinary terms: **initial interest accrual date**, **compounding frequency**, and **rate** for either the fixed or variable rate arrangement. I’d call the last two simply “rate,” rather than “rate value.”

### Turn 109 — app-tool

✓ Renamed: 3 element(s).

### Turn 109 — app-assistant

Renamed those three properties. `initialInterestAccrualDate` and `compoundingFrequency` stay unchanged. That completes the property-name pass.

For the first five **class names**, would your team keep these, or use a different term for any of them? These are names for kinds of things, not individual records:

1. Loan
2. Borrower
3. Lender
4. Principal Repayment Terms
5. Interest Payment Terms

### Turn 109 — persona

I’d keep all five. **Principal repayment terms** and **interest payment terms** name different requirements, so I wouldn’t merge them into a single undifferentiated terms category.

### Turn 110 — app-user

I’d keep all five. **Principal repayment terms** and **interest payment terms** name different requirements, so I wouldn’t merge them into a single undifferentiated terms category.

### Turn 110 — app-assistant

Those five class names stay unchanged, with the two sets of terms kept distinct.

For the next five class names, would your team keep these or use a different term?

1. Loan Payment Schedule
2. Amortization Schedule
3. Principal Payment Schedule
4. Interest Payment Schedule
5. Servicer

### Turn 110 — persona

I’d keep all five. The general **loan payment schedule** is distinct from the amortization, principal-payment, and interest-payment schedules; **servicer** is the party collecting payments for the lender, not another name for the lender.

### Turn 111 — app-user

I’d keep all five. The general **loan payment schedule** is distinct from the amortization, principal-payment, and interest-payment schedules; **servicer** is the party collecting payments for the lender, not another name for the lender.

### Turn 111 — app-assistant

Those five class names stay unchanged.

For the next five, would your team keep these names or use your own term?

1. Collateral
2. Rate Reset Schedule
3. Payment History
4. Payment Transaction
5. Principal

### Turn 111 — persona

I’d keep **Collateral**, **Payment History**, and **Principal**.

For the other two, I’d use the fuller names **Interest Rate Reset Schedule** and **Individual Payment Transaction**. The first makes clear what is being reset; the second makes clear that each entry is one actual payment.

### Turn 112 — app-user

I’d keep **Collateral**, **Payment History**, and **Principal**.

For the other two, I’d use the fuller names **Interest Rate Reset Schedule** and **Individual Payment Transaction**. The first makes clear what is being reset; the second makes clear that each entry is one actual payment.

### Turn 112 — app-tool

✓ Renamed: 2 element(s).

### Turn 112 — app-assistant

Renamed those two classes to **Interest Rate Reset Schedule** and **Individual Payment Transaction**. Collateral, Payment History, and Principal stay unchanged.

For the last five class names, would your team keep these or use another term?

1. Interest
2. Fixed Interest Rate
3. Variable Interest Rate
4. Day Count Convention
5. Interest Calculation Schedule

### Turn 112 — persona

I’d keep all five. **Fixed** and **variable interest rate** remain distinct arrangements, and the **interest calculation schedule** is distinct from the schedule for paying interest.

### Turn 113 — app-user

I’d keep all five. **Fixed** and **variable interest rate** remain distinct arrangements, and the **interest calculation schedule** is distinct from the schedule for paying interest.

### Turn 113 — app-tool

🔍 Checked the current ontology state.

### Turn 113 — app-tool

✓ Applied: 0 added, 2 updated.

### Turn 113 — app-assistant

The wording pass is complete. Your five final class names remain unchanged. I also updated the prepayment rule and action to use the renamed property `prepaymentPenaltyTermInMonths`, so they no longer refer to its old name.

No connections were turned around. The two previously identified backward-lookup warnings remain; this naming pass did not change those paths or resolve their implementation prerequisite.

NAMING LEDGER: relationships_renamed=12; relationships_redirected=0; properties_renamed=7; classes_renamed=2
