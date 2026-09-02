# Ontology-recovery eval — conversation log

Status: **app_agent_appears_finished** — 2 turn(s) so far, 29s elapsed.
Last updated: 2026-09-02T16:59:30.331Z

### Turn 0 — persona

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### Turn 1 — app-user

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### Turn 1 — app-tool

🔍 Checked the current ontology state.

### Turn 1 — app-assistant

Great — we’re starting from a blank model.

We’ll build this in short phases: first the real questions the agent must answer and the actions it must perform, then the domain objects, connections, decision fields, rules, and actions. You can stop at any point and keep whatever we’ve captured so far.

First question: what are 8–12 real questions you’d want this future agent to be able to answer in your loan servicing / credit operations domain? Please phrase them as the kinds of operational questions your team actually asks.

### Turn 1 — persona

Sure. In day-to-day servicing and setup, I’d want the agent to answer questions like these:

1. Who is the borrower and who is the lender on this loan?
2. What principal amount, interest rate, and maturity date apply to this loan or credit agreement?
3. What repayment terms apply here — specifically, what governs principal repayment and what governs interest payment?
4. What payment schedules are on file for this loan — amortization, principal payment, interest payment, or other payment scheduling?
5. Is this loan secured, and if it is, what collateral is tied to it and is there a supporting security agreement behind that setup?
6. Who is servicing this loan — in other words, who is responsible for collecting payments?
7. If this is a variable-rate loan, do we have the rate reset schedule and any related variable-rate features such as a cap or first rate change timing?
8. What prepayment terms apply, including whether there is a prepayment penalty period?
9. What payment history do we have for this loan, and which individual payment transactions make up that history?
10. Is the loan interest-only, does it allow negative amortization, or does it include a balloon payment?
11. What borrowing capacity has been assessed for this borrower, or what amount is still available under a credit facility?
12. For a collateralized loan, what collateral value are we using, as of what date, and what loan-to-value measures apply?

### Turn 2 — app-user

Sure. In day-to-day servicing and setup, I’d want the agent to answer questions like these:

1. Who is the borrower and who is the lender on this loan?
2. What principal amount, interest rate, and maturity date apply to this loan or credit agreement?
3. What repayment terms apply here — specifically, what governs principal repayment and what governs interest payment?
4. What payment schedules are on file for this loan — amortization, principal payment, interest payment, or other payment scheduling?
5. Is this loan secured, and if it is, what collateral is tied to it and is there a supporting security agreement behind that setup?
6. Who is servicing this loan — in other words, who is responsible for collecting payments?
7. If this is a variable-rate loan, do we have the rate reset schedule and any related variable-rate features such as a cap or first rate change timing?
8. What prepayment terms apply, including whether there is a prepayment penalty period?
9. What payment history do we have for this loan, and which individual payment transactions make up that history?
10. Is the loan interest-only, does it allow negative amortization, or does it include a balloon payment?
11. What borrowing capacity has been assessed for this borrower, or what amount is still available under a credit facility?
12. For a collateralized loan, what collateral value are we using, as of what date, and what loan-to-value measures apply?

### Turn 2 — app-assistant

Good set — these are exactly the kind of operational questions we should anchor on.

I’m going to split and normalize them slightly so the ontology requirements are atomic rather than bundled. Here’s the proposed first batch of competency questions:

1. Who is the borrower on a loan or credit facility?
2. Who is the lender on a loan or credit facility?
3. What principal amount applies to a loan or credit facility?
4. What interest rate applies to a loan or credit facility?
5. What maturity date applies to a loan or credit facility?
6. What principal repayment terms apply to a loan or credit facility?
7. What interest payment terms apply to a loan or credit facility?
8. What payment schedules are on file for a loan or credit facility?
9. Is a loan or credit facility secured?
10. What collateral is tied to a loan or credit facility?
11. What security agreement supports the collateral setup for a loan or credit facility?
12. Who is responsible for servicing a loan or credit facility?
13. If a loan is variable-rate, what rate reset schedule applies?
14. If a loan is variable-rate, what cap features apply?
15. If a loan is variable-rate, when does the first rate change occur?
16. What prepayment terms apply to a loan or credit facility?
17. Is there a prepayment penalty period on a loan or credit facility?
18. What payment history exists for a loan or credit facility?
19. Which payment transactions make up the payment history of a loan or credit facility?
20. Is a loan or credit facility interest-only?
21. Does a loan or credit facility allow negative amortization?
22. Does a loan or credit facility include a balloon payment?
23. What borrowing capacity has been assessed for a borrower?
24. What amount is still available under a credit facility?
25. For a collateralized loan, what collateral value is being used?
26. As of what date is the collateral value effective?
27. What loan-to-value measures apply to a collateralized loan?

Please confirm or correct this batch before I record it.
