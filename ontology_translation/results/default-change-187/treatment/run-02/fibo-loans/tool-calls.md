# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-20T16:16:12.317Z

### Turn 1 — user

I run loan servicing and credit operations for a lender -- I'm the person who makes sure a loan or credit facility is actually set up right once it's approved, and stays trackable for as long as it's outstanding.  I've worked both sides of the desk: origination hand-off, then ongoing servicing -- so I think in terms of *what does this loan actually need on file*, *who's on the hook for it*, and *is it tracking the way its terms say it should*, not abstract finance theory. Where would you like to start?

### Turn 1 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 1 — tool

competency_questions: []
classes: {}
relationships: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 1 — assistant

We’re modeling an agent for loan and credit-facility setup and ongoing servicing: what must be on file, who is responsible, and whether servicing follows the approved terms. We’ll build the model in short steps, starting with the real questions and actions the agent must handle, then the concepts and checks needed to support them.

Is that the right scope?

### Turn 2 — user

Yes, that’s the right scope. The agent should be able to identify the borrower, lender, and servicer; check the loan or facility terms and schedules; and see whether payments, interest, and any collateral are recorded in a way that lets us service the account.

I’d keep **what we know about an account** separate from **what must be present to pass a particular check**. A missing reset schedule, for example, matters when we’re reviewing a variable-rate loan; it isn’t a requirement for a fixed-rate loan. Starting with the questions and checks the agent needs to handle is the right way to draw that boundary.

### Turn 2 — assistant

That distinction is important: the model should describe what is known about an account, while a particular check determines what must be present. A reset schedule, for example, would matter to a variable-rate review, not every loan.

To start the acceptance-test questions, do these four reflect questions the agent must answer?

1. Who is the borrower for this loan or facility?
2. Who is the lender?
3. Who is responsible for servicing it?
4. Which terms and schedules govern its servicing?

Please correct any wording that would change the meaning in your operation.

### Turn 3 — user

Yes, with two refinements.

1. **Borrower and lender:** Those work for both a loan and a credit facility. We need to know who owes the money and who extends the credit.
2. **Servicer:** Ask this for a **loan**. The servicer collects principal and interest payments on the lender’s behalf; it need not be the lender or the party that originated the loan. I wouldn’t assume a separate servicer is recorded for every facility.
3. **Terms and schedules:** I’d make this a little more specific. For a loan, ask which terms govern **principal repayment** and **interest payment**, and which payment, amortization, principal, interest, or rate-reset schedules are associated with it. Those aren’t interchangeable, and the applicable ones depend on how the loan is structured.

For a facility, I’d separately ask what credit is available and whether it has sub-facilities, rather than assume it follows the same servicing-schedule pattern as a funded loan.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Who is the borrower for a loan or credit facility?\n  - text: Who is the lender for a loan or credit facility?\n  - text: Who services a loan on the lender's behalf?\n  - text: Which terms govern principal repayment for a loan?\n  - text: Which terms govern interest payment for a loan?\n  - text: Which payment, amortization, principal, interest, or rate-reset schedules are associated with a loan?\n  - text: What credit is available under a credit facility?\n  - text: Does a credit facility have sub-facilities?"
}
```

### Turn 3 — tool

Applied. Added 8, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

I’ve recorded eight questions covering borrower and lender for both loans and facilities; the servicer, repayment and interest terms, and applicable schedules for loans; and available credit and sub-facilities for facilities. I’ve kept the different schedule names distinct rather than treating them as interchangeable. Is that an accurate recap?

Next, what questions must the agent answer about **payments, interest, and collateral** while a loan is outstanding? One or two concrete questions for each that matters would help.

### Turn 4 — user

That’s an accurate recap. One nuance: for a facility, “available credit” is different from its credit limit or the amount already extended, so I’d keep those figures distinct.

While a loan is outstanding, I’d want the agent to answer:

- **Payments:** What actual payment history is recorded for this loan, and which individual payments make it up? How do the recorded principal and interest payments compare with the applicable payment schedules?
- **Interest:** What rate applies—is it fixed or variable—and, if variable, what reset schedule and any cap or first-rate-change term apply? How much interest has accrued but remains unpaid as of a given date?
- **Collateral:** Is the loan secured, and if so, what collateral is linked to it and what security agreement supports that collateral? For a collateralized loan, what dated collateral value and loan-to-value and combined loan-to-value measures are recorded?

I’d also distinguish a loan backed by a guarantee from one backed by pledged collateral; “secured” alone doesn’t tell us which support is in place.

### Turn 4 — assistant

Noted: a facility’s available credit, credit limit, and amount already extended are distinct figures. I’ll preserve that distinction when we work out what the agent must compare.

For payments, do these three separate questions capture your requirements?

1. What payment history is recorded for a loan?
2. Which individual payments make up that history?
3. How do recorded principal and interest payments compare with the applicable schedules?

Is any wording here too broad or too narrow?

### Turn 5 — user

Yes. The first two capture the record we need: a loan has a payment history, and that history contains the individual payment transactions. Keep “payments” broad enough to include fees and other related amounts, not just principal and interest.

The third is a sensible **servicing question**, but I’d phrase it as: “What principal and interest payments are recorded, and what do the applicable schedules say was due?” That gives the agent the facts to compare without implying that every loan has both separate schedules, or that the model itself supplies a pass/fail rule for whether payment was on time or sufficient.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What payment history is recorded for a loan?\n  - text: Which individual payment transactions, including fees and other related amounts, make up a loan's payment history?\n  - text: What principal and interest payments are recorded for a loan, and what do the applicable schedules say was due?"
}
```

### Turn 5 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

I’ve recorded the payment questions with that distinction: payment history includes individual transactions such as fees, while the servicing question asks what principal and interest were recorded and what the applicable schedules say was due. It does not assume separate schedules or a pass/fail rule.

For interest, do these two questions capture what you need?

1. What interest rate applies to a loan, and is it fixed or variable?
2. For a variable-rate loan, what reset schedule, cap, and first-rate-change term apply?

I’ll ask separately about accrued unpaid interest, since that is a dated amount rather than a rate term.

### Turn 6 — user

Yes. The first distinguishes a fixed rate from a variable rate. For the second, the **reset schedule** is the key item in a variable-rate setup review; the cap and first-rate-change term are features to report **if recorded**, not things to assume every variable-rate loan has.

It may also help to distinguish types of variable rate when that detail is available: a floating rate follows a specified index or benchmark, while a managed rate is set from time to time by the institution. And agreed interest payment terms tell us the accrual basis—the day-count convention—separately from the rate itself.

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What interest rate applies to a loan, and is it fixed or variable?\n  - text: For a variable-rate loan, what reset schedule applies, and what cap or first-rate-change term is recorded, if any?"
}
```

### Turn 6 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 6 — assistant

I’ve recorded the two rate questions. The reset schedule is the key variable-rate setup item; the cap and first-rate-change term are reported only if recorded. I haven’t added a rule requiring those optional terms.

Would these two further interest questions reflect work the agent needs to do?

1. For a variable-rate loan, is its rate floating against an index or benchmark, or managed by the institution, where that detail is available?
2. As of a given date, how much interest has accrued but remains unpaid, and which agreed day-count convention governs its accrual?

### Turn 7 — user

Yes, with those qualifications.

1. That’s useful **where the rate type is recorded**. A floating rate is based on an index or benchmark; a managed rate is set from time to time by the institution. Don’t require every variable-rate loan to have one of those more specific descriptions.
2. Yes. Record accrued but unpaid interest as an **amount as of a date**. Look to the applicable interest payment terms for the day-count convention used to calculate accrual; the convention is not the accrued amount itself.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: For a variable-rate loan, is its rate floating against an index or benchmark, or managed by the institution, where that rate type is recorded?\n  - text: How much interest has accrued but remains unpaid for a loan as of a given date?\n  - text: Which day-count convention in the applicable interest payment terms governs a loan's interest accrual?"
}
```

### Turn 7 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 7 — assistant

I’ve recorded the qualified rate-type question and kept accrued unpaid interest as an amount **as of a date**, separate from the day-count convention in the interest payment terms. Is that accurate?

For collateral and guarantees, are these four separate questions right?

1. Is a loan backed by pledged collateral?
2. What collateral is linked to the loan, and which security agreement supports it?
3. For a collateralized loan, what dated collateral value, loan-to-value, and combined loan-to-value measures are recorded?
4. Is a loan backed by a guarantee, separately from any pledged collateral?

### Turn 8 — user

Yes on the interest recap, and those are useful collateral questions. I’d tighten two points:

- **Questions 1 and 4 should stay separate.** A secured loan may be supported by pledged collateral or by a third-party guarantee; “secured” by itself doesn’t tell us which.
- **Question 2 shouldn’t imply a direct loan-to-security-agreement link.** Check which collateral is linked to the secured loan, then which security agreement secures that collateral. If it’s marked as secured by collateral but no collateral is linked, the secured-loan support check cannot pass.

Question 3 is right: the collateral value needs its **as-of date**, and loan-to-value and combined loan-to-value are distinct measures for a collateralized loan.

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Is a loan supported by pledged collateral?\n  - text: Which collateral is linked to a secured loan, and which security agreement secures that collateral?\n  - text: For a collateralized loan, what collateral value and as-of date are recorded?\n  - text: For a collateralized loan, what loan-to-value measure is recorded?\n  - text: For a collateralized loan, what combined loan-to-value measure is recorded?\n  - text: Is a loan supported by a third-party guarantee, separately from any pledged collateral?\n  - text: If a loan is marked as secured by collateral, is collateral linked so its support check can pass?"
}
```

### Turn 8 — tool

Applied. Added 7, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 8 — assistant

I’ve recorded collateral and guarantee support separately, with the path **loan → collateral → security agreement**. I’ve also recorded the check that a loan marked as backed by collateral cannot pass that support check if no collateral is linked. Collateral value has its as-of date, and the two loan-to-value measures remain distinct. Is that accurate?

One facility question remains from your earlier distinction: should the agent answer, separately, **“What is the credit limit, what amount has already been extended, and what credit remains available under a facility?”**

### Turn 9 — user

The facility question is right: **credit limit, amount of credit extended, and available amount** are separate figures to report. A facility may also have a maximum advance amount; don’t treat that as the same figure as its credit limit.

One correction to the collateral recap: the secured loan points to its collateral, and the **security agreement secures that collateral**. We can use those facts to ask what agreement supports the pledged asset, but I wouldn’t record a direct collateral-to-security-agreement link in the opposite direction. And the missing-collateral check is specifically about confirming recorded collateral support; keep the separate guarantee question.

### Turn 9 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 9 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit facility?
  - id: cq2
    text: Who is the lender for a loan or credit facility?
  - id: cq3
    text: "Who services a loan on the lender's behalf?"
  - id: cq4
    text: Which terms govern principal repayment for a loan?
  - id: cq5
    text: Which terms govern interest payment for a loan?
  - id: cq6
    text: "Which payment, amortization, principal, interest, or rate-reset schedules are associated with a loan?"
  - id: cq7
    text: What credit is available under a credit facility?
  - id: cq8
    text: Does a credit facility have sub-facilities?
  - id: cq9
    text: What payment history is recorded for a loan?
  - id: cq10
    text: "Which individual payment transactions, including fees and other related amounts, make up a loan's payment history?"
  - id: cq11
    text: "What principal and interest payments are recorded for a loan, and what do the applicable schedules say was due?"
  - id: cq12
    text: "What interest rate applies to a loan, and is it fixed or variable?"
  - id: cq13
    text: "For a variable-rate loan, what reset schedule applies, and what cap or first-rate-change term is recorded, if any?"
  - id: cq14
    text: "For a variable-rate loan, is its rate floating against an index or benchmark, or managed by the institution, where that rate type is recorded?"
  - id: cq15
    text: How much interest has accrued but remains unpaid for a loan as of a given date?
  - id: cq16
    text: "Which day-count convention in the applicable interest payment terms governs a loan's interest accrual?"
  - id: cq17
    text: Is a loan supported by pledged collateral?
  - id: cq18
    text: "Which collateral is linked to a secured loan, and which security agreement secures that collateral?"
  - id: cq19
    text: "For a collateralized loan, what collateral value and as-of date are recorded?"
  - id: cq20
    text: "For a collateralized loan, what loan-to-value measure is recorded?"
  - id: cq21
    text: "For a collateralized loan, what combined loan-to-value measure is recorded?"
  - id: cq22
    text: "Is a loan supported by a third-party guarantee, separately from any pledged collateral?"
  - id: cq23
    text: "If a loan is marked as secured by collateral, is collateral linked so its support check can pass?"
classes: {}
relationships: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - id: cq7\n    text: What is the credit limit of a credit facility?\n  - text: What amount of credit has already been extended under a credit facility?\n  - text: What amount of credit remains available under a credit facility?"
}
```

### Turn 9 — tool

Applied. Added 2, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 9 — assistant

I’ve recorded the facility’s credit limit, credit already extended, and credit still available as three separate questions. I also have your correction on direction: **the security agreement secures the collateral**. We haven’t recorded relationships yet, so there is no link to reverse.

Should the agent also answer **“What maximum advance amount is recorded for this facility, if any?”**, separately from its credit limit?

### Turn 10 — user

Yes. Ask for the **maximum advance amount, if recorded**, as its own facility figure. It is distinct from the credit limit, the amount already extended, and the available amount; don’t infer one from another without the facility’s governing terms.

### Turn 10 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What maximum advance amount is recorded for a credit facility, if any?"
}
```

### Turn 10 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 10 — assistant

Recorded: the maximum advance amount is a separate facility figure, reported if present. The agent should not derive it from the credit limit, extended credit, or available credit without the governing terms.

We have the questions the agent must answer. What **actions** must it actually perform—not just report on? Please name roughly five to ten, such as the setup or servicing steps you would expect it to carry out, in your own terms.

### Turn 11 — user

I’d give the agent five **review actions**, rather than have it post payments or change loan terms:

1. **Assess loan readiness.** Given a loan, check that its borrower and lender are recorded and, if it bears interest, that the applicable interest payment terms govern that interest. Confirm those links before marking the core setup reviewed.
2. **Verify secured-loan support.** Given a secured loan, confirm that collateral is linked to it. A “secured” description alone isn’t enough to pass this collateral-support check.
3. **Review variable-rate setup.** Given a loan with a variable rate, confirm that it also has an interest rate reset schedule.
4. **Review payment-record completeness.** Given a loan, confirm that it has a payment history containing individual payment transactions. This checks that payments are trackable; it doesn’t decide whether they were timely or sufficient.
5. **Review prepayment terms.** Where a prepayment penalty applies, confirm that its penalty period is recorded.

For each, the retained evidence is the terms, schedule, collateral, or payment-record links and values the agent checked. I wouldn’t give these reviews an invented approval authority or a general power to alter the account.

### Turn 11 — assistant

These are five review actions, not authority to post payments, change terms, or approve an account. I’ll carry forward the checked links and values as their evidence. The payment-record review checks trackability, not timeliness or sufficiency. Is that an accurate recap of the actions?

One detail affects how we model the first action: when you say **“mark the core setup reviewed,”** do you mean the agent records a review result on the loan, or only reports that it completed the check?

### Turn 12 — user

Yes, that’s an accurate recap.

By “mark the core setup reviewed,” I meant **report the outcome of the check**, not write a new status or review-result field onto the loan. For the readiness review, the agent confirms that the borrower and lender are recorded and that an interest-bearing loan has applicable interest payment terms. It retains the links it checked as evidence. If a required link is missing, it cannot confirm readiness; it should report what is missing instead.

### Turn 12 — assistant

Understood: the readiness review **reports** its outcome and the links checked; it does not change the loan. If a required link is missing, it reports that gap rather than confirming readiness.

Before we settle the requirements: for the **borrower, lender, or servicer** you named, is there a closely related role beneath any of them that actually does the day-to-day work the agent needs to identify for these questions or reviews? And does any question or review depend on a specific operating context that changes how it is handled?

### Turn 13 — user

No further role beneath borrower, lender, or servicer is needed for these questions and reviews. The **servicer** is the party to identify for payment collection on the lender’s behalf; we don’t need to identify an individual collector or team. The borrower remains the party obliged to repay, and the lender the party extending credit.

The checks do depend on the **kind of account and its terms**, rather than a separate operating context: borrower and lender questions cover loans and facilities, while the servicer and payment-history reviews concern loans. Interest terms matter for an interest-bearing loan; a reset schedule matters for a variable-rate loan; collateral support matters when reviewing a secured loan; and penalty timing matters when reviewing a prepayment penalty. Those conditions shouldn’t become requirements for every account.

### Turn 13 — assistant

That settles the role and context check: no additional day-to-day role is needed, and these reviews depend on the account and its terms—not a separate operating context. The five actions remain reporting reviews, with missing evidence reported rather than a loan status changed.

One boundary needs clarification before we use these requirements to build the model: **does the collateral-support review apply only when a loan is described as backed by pledged collateral, or also when it is described as secured solely by a guarantee?**

### Turn 14 — user

The **collateral-support review** checks whether a secured loan has collateral linked to it. So a loan described as secured solely by a guarantee would **not pass that particular review** without recorded collateral.

That does **not** mean the guarantee is invalid or that the loan is unsecured. Guarantee support is a separate question; this review does not verify it.

### Turn 14 — assistant

Understood. A loan backed solely by a guarantee does **not pass the collateral-support review** without linked collateral. That result says nothing about whether the guarantee is valid or whether the loan is otherwise secured; guarantee support is a separate question.

The questions and five review actions are now established. I’ll start identifying the kinds of things the agent must connect to answer them. For this first group, does the agent need to identify each separately, and are these the names you use?

- **Loan** — for the loan-specific servicing questions and reviews.
- **Credit Facility** — for available credit, limits, amounts extended, and sub-facilities.
- **Borrower** — to identify who owes the money on either kind of account.
- **Lender** — to identify who extends the credit on either kind of account.

### Turn 15 — user

Yes. I’d identify all four separately, and those are the names I use.

A **loan** is the account whose repayment, payments, interest, and servicing we track. A **credit facility** lets the borrower draw credit over time and may contain sub-facilities; its limit, amount extended, and available amount are distinct figures. The **borrower** is the party obliged to repay, and the **lender** is the party extending the money or credit. Both loans and facilities identify a borrower and a lender.

### Turn 15 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    meaning: An account whose repayment, payments, interest, and servicing are tracked.\n  Credit Facility:\n    meaning: An arrangement letting a borrower draw credit over time that may contain sub-facilities.\n  Borrower:\n    meaning: The party obliged to repay money or credit.\n  Lender:\n    meaning: The party extending money or credit."
}
```

### Turn 15 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 15 — assistant

I’ve recorded **Loan, Credit Facility, Borrower, and Lender** as separate concepts under your names and meanings. The model does not treat a facility’s figures as interchangeable. Is that an accurate recap?

For the next group, does the agent need to identify these separately, and are these your terms for them?

- **Servicer**, to answer who collects a loan’s payments on the lender’s behalf.
- **Interest Payment Terms**, to check what governs interest payment and its day-count convention.
- **Principal Repayment Terms**, to answer what governs principal repayment.

### Turn 16 — user

Yes, that recap is accurate, and I’d keep these three separate under those names.

- **Servicer** is the party that collects principal and interest payments on the lender’s behalf. It need not be the lender.
- **Interest payment terms** govern payment of interest and specify the accrual basis through a day-count convention.
- **Principal repayment terms** govern repayment of principal, separately from interest payment.

Having one set of terms on file doesn’t establish that the other is present.

### Turn 16 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Servicer:\n    meaning: The party collecting principal and interest payments on a lender's behalf.\n  Interest Payment Terms:\n    meaning: Terms governing interest payment and specifying the accrual basis through a day-count convention.\n  Principal Repayment Terms:\n    meaning: Terms governing repayment of principal separately from interest payment."
}
```

### Turn 16 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 16 — assistant

Recorded **Servicer**, **Interest Payment Terms**, and **Principal Repayment Terms** separately. Neither set of terms implies the other is on file. Is that accurate?

For the schedules named in your loan questions—**payment, amortization, principal, interest, and interest-rate reset schedules**—which does the agent need to identify as a separate kind of record, and which, if any, are just different names for the same thing in your operation?

### Turn 17 — user

Yes, the terms recap is accurate.

I’d identify **all five schedules separately**; none is just another name for another:

- A **loan payment schedule** gives the loan’s regular or explicit payment schedule.
- An **amortization schedule** shows how scheduled payments change the debt balance over time.
- A **principal payment schedule** gives dates when principal is due.
- An **interest payment schedule** gives dates when interest is due.
- An **interest rate reset schedule** gives dates when a variable rate is recalculated.

There is also a separate **interest calculation schedule**, for dates when interest is calculated rather than paid. A loan can have more than one applicable schedule, but we shouldn’t assume every loan has every kind.

### Turn 17 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan Payment Schedule:\n    meaning: The regular or explicit payment schedule for a loan.\n  Amortization Schedule:\n    meaning: A schedule showing how scheduled payments change a loan's debt balance over time.\n  Principal Payment Schedule:\n    meaning: A schedule giving the dates when loan principal is due.\n  Interest Payment Schedule:\n    meaning: A schedule giving the dates when loan interest is due.\n  Interest Rate Reset Schedule:\n    meaning: A schedule giving the dates when a loan's variable interest rate is recalculated."
}
```

### Turn 17 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 17 — assistant

I’ve recorded the five named schedules as distinct: loan payment, amortization, principal payment, interest payment, and interest-rate reset. A loan may have several applicable schedules, but none is assumed to be present on every loan. Is that accurate?

You also named an **Interest Calculation Schedule**. Does the agent need to identify it separately to answer the accrued-but-unpaid interest question or perform one of the five reviews? What would it use that schedule to determine?

### Turn 18 — user

Yes, your recap is accurate.

Keep the **interest calculation schedule** separate. It tells us the dates on which interest is calculated; that is different from the interest payment schedule’s due dates and the rate reset schedule’s recalculation dates.

It can help explain **when a calculation is scheduled**, but it is not, by itself, the accrued-but-unpaid interest amount. For that question, we need the accrued interest **amount and its as-of date**. None of the five reviews requires an interest calculation schedule as a condition for passing.

### Turn 18 — assistant

That distinction is clear: the **Interest Calculation Schedule** gives calculation dates, not payment due dates, rate-reset dates, or the accrued unpaid amount. None of the five reviews requires it.

To give that separate record a specific question to serve, should the agent also answer: **“When is interest scheduled to be calculated for a loan?”**

### Turn 19 — user

Yes. “When is interest scheduled to be calculated for this loan?” is a useful separate question. The agent should answer it from the loan’s **interest calculation schedule, if one is recorded**—not infer the calculation dates from payment due dates or rate-reset dates.

### Turn 19 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: When is interest scheduled to be calculated for a loan, if an interest calculation schedule is recorded?\nclasses:\n  Interest Calculation Schedule:\n    meaning: A schedule giving the dates when interest is calculated for a loan, distinct from payment due dates and rate-reset dates."
}
```

### Turn 19 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 19 — assistant

I’ve recorded the question about scheduled interest-calculation dates and **Interest Calculation Schedule** as its own concept. The agent uses it only if recorded and does not infer its dates from other schedules.

For the payment-history questions and the payment-record review, does the agent need to identify **Payment History** and each **Payment Transaction** separately? Are those your terms, and what does each mean in your operation?

### Turn 20 — user

Yes, they’re separate. **Payment history** is the loan’s record of payments made toward the repayment obligation. Each **individual payment transaction** is an actual payment recorded within that history; it may cover principal, interest, fees, or other related amounts.

I’d say “individual payment transaction” rather than just “payment transaction” here, because the review checks both levels: the loan has a payment history, **and** that history contains individual payments.

### Turn 20 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Payment History:\n    meaning: A loan's record of payments made toward its repayment obligation.\n  Individual Payment Transaction:\n    meaning: An actual individual payment recorded within a payment history that may cover principal, interest, fees, or other related amounts.\n    aliases: [payment transaction]"
}
```

### Turn 20 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 20 — assistant

I’ve recorded **Payment History** and **Individual Payment Transaction** separately, using your preferred wording. The review will need evidence at both levels. Is that accurate?

For the interest questions, does the agent need a separate **Interest Rate** record to identify a loan’s rate and its variable-rate features, or are those values held directly on the loan in your operation? I’ll treat accrued unpaid interest and its as-of date as a separate question after we settle that.

### Turn 21 — user

Yes, the payment-history recap is accurate.

For the rate question, identify the **rate that applies to the loan** separately from the loan’s other figures. At minimum, distinguish a **fixed interest rate** from a **variable interest rate**; each has a numeric rate. Where recorded, a variable rate may be described more specifically as floating against a benchmark or managed by the institution.

The **interest rate cap** and **first rate change term** are recorded on the loan, while its **interest rate reset schedule** is a separate schedule linked to the loan. I wouldn’t put all of those into one rate record or treat them as values derived from the current rate.

### Turn 21 — assistant

I’ll keep the rate that applies to a loan separate from the loan’s cap, first-rate-change term, and reset schedule. The latter three should not be inferred from the current rate.

Do you call that separate rate record **Interest Rate**? And for the agent’s questions, is **fixed versus variable** a description of that rate, rather than two separate kinds of record it must retrieve?

### Turn 22 — user

I’d call it the **interest rate that applies to the loan**, but for these questions I’d identify **fixed interest rate** and **variable interest rate** as distinct kinds of rate, not just one record with a fixed-or-variable label. Each carries a numeric rate. Floating and managed rates are more specific kinds of variable rate when that detail is available.

The cap and first-rate-change term remain loan details, and the reset schedule remains a separate schedule.

### Turn 22 — assistant

I’ll model **Fixed Interest Rate** and **Variable Interest Rate** as separate concepts, using your terms. The variable-rate review then applies to the latter; the cap and first-rate-change term stay with the loan, and the reset schedule stays separate. Is that accurate?

For **floating** and **managed**, does the agent need to retrieve them as separate records, or is a description on a Variable Interest Rate enough to answer the question when that detail is recorded?

### Turn 23 — user

Yes, that recap is accurate.

Treat **floating interest rate** and **managed interest rate** as more specific kinds of variable interest rate, rather than merely free-text descriptions. A floating rate is based on a specified index or benchmark; a managed rate is set from time to time by the institution. Each has a numeric rate. The agent only needs that more specific kind when it’s recorded—it shouldn’t assume every variable rate is one or the other.

### Turn 23 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Fixed Interest Rate:\n    meaning: A fixed numeric interest rate that applies to a loan.\n  Variable Interest Rate:\n    meaning: A numeric interest rate that applies to a loan and can change over time."
}
```

### Turn 23 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 23 — assistant

I’ve recorded **Fixed Interest Rate** and **Variable Interest Rate** as separate concepts. Floating and managed are more specific *kinds* of variable rate, but this model cannot directly represent “is a kind of” between classes, so I haven’t recorded them as separate classes yet.

For the agent’s question, would a **floating-or-managed choice on Variable Interest Rate**, when recorded, preserve what it needs to know? Or must it identify a floating or managed rate as a separate record for a specific question or review?

### Turn 24 — user

For the agent’s **question**, a recorded floating-or-managed description on a variable rate would let it report the distinction. None of the five reviews requires it to retrieve a separate floating or managed rate record.

But it would be a **representation compromise**: I treat floating and managed rates as more specific kinds of variable rate, not as the only two allowed choices for every variable rate. If you use a choice field, leave room for a variable rate that has neither more specific kind recorded, and don’t infer floating or managed from the numeric rate.

### Turn 24 — assistant

For this agent’s question, an optional **floating-or-managed description on Variable Interest Rate** is enough. I’ll note that as a representation compromise: it must allow the more specific kind to be unrecorded, and the agent must not infer it from the numeric rate. I won’t add a “kind of” relationship the tool cannot express.

For the collateral questions and support review, does the agent need to identify **Collateral**, **Security Agreement**, and **Guarantee** separately? Are those the names you use, and what does each mean here?

### Turn 25 — user

**Collateral** and **security agreement** should be separate. Collateral is the pledged asset; the security agreement grants a financial interest in that collateral and sets out the relevant rights and duties. The secured-loan support review checks that collateral is linked to the loan—it does not verify the agreement.

I would **not add a separate “Guarantee” record just for these questions or reviews**. Identify a **guaranteed loan** separately from a loan backed by pledged collateral, so the agent can report which form of support is described. A collateral-support review cannot establish whether guarantee support is valid.

### Turn 25 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Collateral:\n    meaning: An asset pledged to support a loan.\n  Security Agreement:\n    meaning: An agreement granting a financial interest in collateral and setting out relevant rights and duties."
}
```

### Turn 25 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 25 — assistant

I’ve recorded **Collateral** and **Security Agreement** separately. I have not added a Guarantee record: the collateral-support review checks the loan’s collateral link, not the agreement or the validity of guarantee support. Is that accurate?

When you say **“guaranteed loan,”** does the agent need to retrieve a separate record for it, or would a recorded support description on **Loan** let the agent answer whether the loan is described as guarantee-backed, collateral-backed, or both?

### Turn 26 — user

Yes, your recap of the review is accurate.

A **guaranteed loan** is a kind of loan, not an additional record the agent must retrieve. If your tool cannot represent loan kinds directly, recorded support descriptions on the loan can answer the practical question—provided they distinguish **guarantee backing** from **pledged collateral**, and allow both to be recorded. That is a representation compromise, not a reason to treat the two forms of support as the same thing.

For the collateral-support review, the agent still needs the actual **loan-to-collateral link**. A description saying “collateral-backed” cannot substitute for it.

### Turn 26 — assistant

Yes. I’ll use separate loan support descriptions that can record guarantee backing and collateral backing together, while keeping the actual **Loan → Collateral** link necessary for the collateral-support review. “Guaranteed loan” will not be another record.

For the remaining facility and prepayment questions, does the agent need to identify **Sub-facility** and **Prepayment Penalty** separately? Are those your names, and what does each mean in your operation?

### Turn 27 — user

**Sub-facility** is a separate thing to identify: it’s a portion of a credit facility available for a particular purpose, potentially on its own schedule. The facility has the sub-facility; it isn’t another name for the whole facility.

I wouldn’t create a separate **prepayment penalty** record for this work. Use **prepayment terms**—the terms for repaying principal before maturity—and record the **prepayment penalty period in months** there when it applies. The review checks that the timing is recorded; it doesn’t calculate a penalty charge.

### Turn 27 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Sub-facility:\n    meaning: A portion of a credit facility available for a particular purpose, potentially on its own schedule.\n  Prepayment Terms:\n    meaning: Terms governing repayment of loan principal before maturity, including penalty timing when a penalty applies."
}
```

### Turn 27 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 27 — assistant

I’ve recorded **Sub-facility** as part of a facility, and **Prepayment Terms** rather than a separate penalty record. The penalty period in months will belong to those terms when applicable; the review does not calculate a charge. Is that accurate?

For **accrued but unpaid interest as of a date**, must the agent identify a separate dated record, or is an amount and as-of date held on the loan sufficient to answer that question?

### Turn 28 — user

Yes, that’s accurate about the sub-facility and prepayment terms.

For accrued but unpaid interest, identify a separate **accrued interest** record with an **amount** and an **as-of date**. Those two facts belong together: an amount without its date doesn’t answer “how much was unpaid as of then?” It’s distinct from the interest rate, the loan’s principal balance, and the schedule of when interest is calculated.

### Turn 28 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Accrued Interest:\n    meaning: A dated amount of interest accrued but unpaid on a loan, distinct from the rate, principal balance, and calculation schedule."
}
```

### Turn 28 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 28 — assistant

I’ve recorded **Accrued Interest** as a separate dated record; its amount and as-of date will stay together. Is that accurate?

For the collateralized-loan questions, are **Collateral Value**, **Loan-to-Value**, and **Combined Loan-to-Value** separate records the agent must retrieve, or are they recorded values on the collateral or loan? In particular, where is the collateral value’s as-of date kept?

### Turn 29 — user

Yes, that’s accurate about accrued interest.

I’d keep all three measures distinct rather than put them into one undifferentiated value on the loan:

- **Collateral value as of a date** is a dated valuation linked to the collateral. The **value and as-of date are kept together** in that record.
- **Loan-to-value ratio** is a numeric percentage relevant to the collateralized loan, comparing that loan’s principal with the appraised collateral value.
- **Combined loan-to-value ratio** is a separate numeric percentage relevant to the collateralized loan; it considers the total debt secured by the asset or assets.

The two ratios are linked to the **collateralized loan**, while the dated valuation is linked to the **collateral**. I wouldn’t treat either ratio as the collateral value itself.

### Turn 29 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Collateral Valuation:\n    meaning: A dated valuation of collateral with its value and as-of date kept together.\n  Loan-to-Value Ratio:\n    meaning: A percentage for a collateralized loan comparing its principal with appraised collateral value.\n  Combined Loan-to-Value Ratio:\n    meaning: A percentage for a collateralized loan considering total debt secured by the asset or assets."
}
```

### Turn 29 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 29 — assistant

I’ve recorded **Collateral Valuation**, **Loan-to-Value Ratio**, and **Combined Loan-to-Value Ratio** separately. The dated valuation belongs with collateral; the two ratios belong with the collateralized loan. Is that accurate?

I’ll now work through how the confirmed concepts connect. Starting with the parties: would you say **Loan → has borrower → Borrower**, **Loan → has lender → Lender**, **Credit Facility → has borrower → Borrower**, and **Credit Facility → has lender → Lender**? For each, what verb phrase and direction would you use?

### Turn 30 — user

The connections and directions are right. I’d say a **loan has a borrower**—the party obliged to repay it—and **has a lender**—the party financing it. Likewise, a **credit facility has a borrower** who may draw under it and **has a lender** who provides it.

One wording point on your recap: “collateral valuation” gets the idea across, but I’d name the record to make clear that it is a **collateral value as of a date**. The value and date stay together; the two ratios remain separate measures of the collateralized loan.

### Turn 30 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "Collateral Valuation",
      "to": "Collateral Value as of a Date",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 30 — tool

Renamed 1 of 1:
- class "Collateral Valuation" → "Collateral Value as of a Date" (previous name kept as an alias)

### Turn 30 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasBorrower\n    from: Loan\n    to: Borrower\n    meaning: The loan has the party obliged to repay it as its borrower.\n  - name: hasLender\n    from: Loan\n    to: Lender\n    meaning: The loan has the party financing it as its lender.\n  - name: hasBorrower\n    from: Credit Facility\n    to: Borrower\n    meaning: The facility has the party who may draw under it as its borrower.\n  - name: hasLender\n    from: Credit Facility\n    to: Lender\n    meaning: The facility has the party providing it as its lender."
}
```

### Turn 30 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 30 — assistant

I’ve renamed the dated valuation record **Collateral Value as of a Date**, keeping its earlier name as an alias. I’ve also recorded the four party connections in your direction: each loan and facility **has a borrower** and **has a lender**. Is that accurate?

For loan servicing and terms, how would you name and direct these connections: a loan to its **Servicer**, **Interest Payment Terms**, **Principal Repayment Terms**, and **Prepayment Terms**? Are all four direct loan connections?

### Turn 31 — user

Yes, the party connections and the dated collateral value are recorded accurately.

Of the four proposed servicing-and-terms connections, only the **servicer** is a direct connection I’d make here: a **loan is serviced by a servicer**.

I would not make the other three direct loan connections just to express what the terms govern. **Interest payment terms govern payment of interest**, and **principal repayment terms govern payment of principal**. The loan has its interest and principal obligations, which let us trace the applicable terms. **Prepayment terms** are terms for repaying principal before maturity, not a fourth direct servicing party or schedule link.

### Turn 31 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isServicedBy\n    from: Loan\n    to: Servicer\n    meaning: A loan is serviced by the party collecting principal and interest payments on the lender's behalf.\n    aliases: [has servicer]"
}
```

### Turn 31 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 31 — assistant

I’ve recorded **Loan → is serviced by → Servicer**. I have not added direct loan-to-terms links: you’ve described a path through the loan’s obligations instead.

To capture that path accurately, does the agent need to identify **Interest Obligation** and **Principal Obligation** as separate records for a loan? If so, what do you call each, and how do the respective payment terms connect to them?

### Turn 32 — user

Yes, keep them separate, but I’d call them **interest** and **principal**, rather than create records named “interest obligation” and “principal obligation.”

A **loan has interest**, and **interest payment terms govern payment of that interest**. Separately, a **loan has principal**, and **principal repayment terms govern payment of that principal**. Principal is what must be repaid apart from interest; interest is the cost of using the credit. Keeping those paths distinct lets the agent check interest terms without mistaking principal repayment terms for them.

### Turn 32 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Interest:\n    meaning: The cost of using credit on a loan, whose payment is governed by interest payment terms.\n    aliases: [interest obligation]\n  Principal:\n    meaning: The amount of a loan to be repaid apart from interest, whose repayment is governed by principal repayment terms.\n    aliases: [principal obligation]\nrelationships:\n  - name: hasInterest\n    from: Loan\n    to: Interest\n    meaning: A loan has interest, when it bears interest.\n  - name: hasPrincipal\n    from: Loan\n    to: Principal\n    meaning: A loan has principal that must be repaid apart from interest.\n  - name: governsPaymentOf\n    from: Interest Payment Terms\n    to: Interest\n    meaning: Interest payment terms govern payment of the loan's interest.\n  - name: governsPaymentOf\n    from: Principal Repayment Terms\n    to: Principal\n    meaning: Principal repayment terms govern repayment of the loan's principal."
}
```

### Turn 32 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 32 — assistant

I’ve recorded the two distinct paths: **Loan → Interest ← Interest Payment Terms** and **Loan → Principal ← Principal Repayment Terms**, using your names **Interest** and **Principal**. This lets the agent find the applicable terms without treating either set as a direct loan link. Is that accurate?

Where do **Prepayment Terms** fit into the principal path? What verb and direction would you use to connect them to Principal, if they connect directly?

### Turn 33 — user

Yes, those two paths are accurate.

**Prepayment terms are a more specific kind of principal repayment terms**: they address repayment before maturity. I wouldn’t add a separate direct connection from prepayment terms to principal with a new verb. When they govern principal payment, that is the same **“govern payment of”** connection used for principal repayment terms, directed **from the terms to principal**. The prepayment penalty period, when applicable, is recorded on the prepayment terms.

### Turn 33 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: governsPaymentOf\n    from: Prepayment Terms\n    to: Principal\n    meaning: Prepayment terms govern repayment of principal before maturity when they apply."
}
```

### Turn 33 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 33 — assistant

I’ve recorded **Prepayment Terms → governs payment of → Principal** when those terms apply. I have not added a “kind of” relationship or a second, differently named connection to Principal. The penalty period will sit on Prepayment Terms. Is that accurate?

For the five loan schedules already recorded—loan payment, amortization, principal payment, interest payment, and rate reset—which connect **directly to Loan**, and which are reached through Interest or Principal? Please give the verb and direction you use for each connection.

### Turn 34 — user

Yes, that’s accurate for prepayment terms when they apply.

**All five schedules connect directly from the loan**. I’d use **“the loan has a schedule”** for each: a loan payment schedule, an amortization schedule, a principal payment schedule, an interest payment schedule, or an interest rate reset schedule. None has to be reached through the interest or principal record.

That doesn’t mean every loan must have all five. Which schedules matter depends on its terms; for example, the variable-rate setup review needs a rate reset schedule.

### Turn 34 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasLoanPaymentSchedule\n    from: Loan\n    to: Loan Payment Schedule\n    meaning: A loan has an associated loan payment schedule when one applies.\n    aliases: [has schedule]\n  - name: hasAmortizationSchedule\n    from: Loan\n    to: Amortization Schedule\n    meaning: A loan has an associated amortization schedule when one applies.\n    aliases: [has schedule]\n  - name: hasPrincipalPaymentSchedule\n    from: Loan\n    to: Principal Payment Schedule\n    meaning: A loan has an associated principal payment schedule when one applies.\n    aliases: [has schedule]\n  - name: hasInterestPaymentSchedule\n    from: Loan\n    to: Interest Payment Schedule\n    meaning: A loan has an associated interest payment schedule when one applies.\n    aliases: [has schedule]\n  - name: hasInterestRateResetSchedule\n    from: Loan\n    to: Interest Rate Reset Schedule\n    meaning: A loan has an associated rate reset schedule when one applies.\n    aliases: [has schedule]"
}
```

### Turn 34 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 34 — assistant

I’ve recorded each of the five schedules as a direct **Loan → has [named schedule]** connection, only when that schedule applies. None is required merely because it is a loan. Is that accurate?

Does the **Interest Calculation Schedule** also connect directly from Loan? If so, would you call that connection “the loan has an interest calculation schedule,” in that direction?

### Turn 35 — user

Yes, your recap is accurate. The **interest calculation schedule** also connects directly **from the loan to the schedule**. I’d say **the loan has an interest calculation schedule**. It tells us when interest is scheduled to be calculated, not when interest is due for payment.

### Turn 35 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasInterestCalculationSchedule\n    from: Loan\n    to: Interest Calculation Schedule\n    meaning: A loan has an interest calculation schedule specifying when interest is scheduled to be calculated."
}
```

### Turn 35 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 35 — assistant

I’ve recorded **Loan → has interest calculation schedule → Interest Calculation Schedule**. It gives calculation dates, not interest-payment due dates. Is that accurate?

For the payment-record review, is the path **Loan → has payment history → Payment History → contains individual payment transaction → Individual Payment Transaction**? What verb and direction would you use for each step?

### Turn 36 — user

Yes on the interest calculation schedule.

For payments, the direction is right. I’d say a **loan has a payment history**, and that **payment history has individual payments**. Each individual payment transaction is an actual payment within that history, including payments toward principal, interest, fees, or other related amounts. “Contains” conveys the idea, but “has individual payments” is how I’d name that second connection.

### Turn 36 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasPaymentHistory\n    from: Loan\n    to: Payment History\n    meaning: A loan has a history recording payments made toward its repayment obligation.\n  - name: hasIndividualPayments\n    from: Payment History\n    to: Individual Payment Transaction\n    meaning: A payment history has individual payment transactions, including those toward principal, interest, fees, or related amounts.\n    aliases: [contains individual payment transaction]"
}
```

### Turn 36 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 36 — assistant

I’ve recorded **Loan → has payment history → Payment History → has individual payments → Individual Payment Transaction**, using your wording. This preserves both levels the review checks. Is that accurate?

For the rate questions, how does the loan connect to **Fixed Interest Rate** and **Variable Interest Rate**? Are these direct connections from Loan, and what verb and direction would you use?

### Turn 37 — user

Yes, the payment-history path is accurate.

The rate connections are direct **from the loan to the applicable rate**. I’d say a **loan has an interest rate**: either a fixed interest rate or a variable interest rate. The rate itself carries the numeric rate. For a variable-rate review, the agent checks both that variable-rate connection and the loan’s separate rate reset schedule.

### Turn 37 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasInterestRate\n    from: Loan\n    to: Fixed Interest Rate\n    meaning: A loan has an applicable fixed interest rate carrying its numeric rate.\n  - name: hasInterestRate\n    from: Loan\n    to: Variable Interest Rate\n    meaning: A loan has an applicable variable interest rate carrying its numeric rate."
}
```

### Turn 37 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 37 — assistant

I’ve recorded direct **Loan → has interest rate → Fixed Interest Rate** and **Loan → has interest rate → Variable Interest Rate** connections. The variable-rate review also checks the separate loan-to-reset-schedule connection. Is that accurate?

For collateral, is the path **Loan → has collateral → Collateral**, with **Security Agreement → secures → Collateral**? Please confirm your verb and direction for both.

### Turn 38 — user

Yes on the rate connections.

The collateral path is right in substance, but I’d put the first verb more precisely: a **secured loan is collateralized by collateral**. That says the asset is pledged as security, rather than merely associated with the loan. Separately, a **security agreement secures collateral**. Both connections point **toward the collateral**; there is no direct loan-to-security-agreement connection in this path.

### Turn 38 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: isCollateralizedBy\n    from: Loan\n    to: Collateral\n    meaning: A secured loan is collateralized by an asset pledged as its security.\n    aliases: [has collateral]\n  - name: secures\n    from: Security Agreement\n    to: Collateral\n    meaning: A security agreement secures the pledged collateral by granting a financial interest in it."
}
```

### Turn 38 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 38 — assistant

I’ve recorded **Loan → is collateralized by → Collateral** and **Security Agreement → secures → Collateral**. Both point toward Collateral; there is no direct loan-to-agreement link. Is that accurate?

For the dated value and two ratios, are these direct connections: **Collateral → has collateral value as of a date**, **Loan → has loan-to-value ratio**, and **Loan → has combined loan-to-value ratio**? What verb and direction would you use for each?

### Turn 39 — user

The directions are right, with a qualification about **which loans** those connections describe. The collateral link is from a **secured loan** to the collateral it is collateralized by; I wouldn’t make it a general connection from every loan.

For the values, I’d say:

- **Collateral has a collateral value as of a date**—from the collateral to its dated valuation.
- **A collateralized loan has a loan-to-value ratio**—from that loan to the ratio.
- **A collateralized loan has a combined loan-to-value ratio**—from that loan to the separate combined ratio.

So “Loan” is too broad for the last two. These connections describe a collateralized loan, not every loan.

### Turn 39 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasCollateralValueAsOfADate\n    from: Collateral\n    to: Collateral Value as of a Date\n    meaning: Collateral has a dated valuation recording its value as of a date."
}
```

### Turn 39 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 39 — assistant

I’ve recorded **Collateral → has collateral value as of a date → Collateral Value as of a Date**. I’ve left the two ratio connections open because you’ve said they apply to **collateralized loans**, not loans generally. I also hear your qualification that the existing collateral link applies only when collateral is pledged.

This tool can describe a Loan connection as **conditional on the loan being collateralized**, but it cannot express “Collateralized Loan is a kind of Loan.” Would those conditional Loan-to-ratio connections reflect your records accurately, or does the agent need to identify a distinct collateralized-loan record?

### Turn 40 — user

Conditional loan-to-ratio connections would serve the agent’s questions: **when the loan is collateralized**, it has a loan-to-value ratio and, separately, a combined loan-to-value ratio. The agent doesn’t need to retrieve a second loan record for the same account.

I would still preserve “collateralized loan” as a distinct **kind of loan** in your description, even if the tool represents that with a condition rather than a kind-of link. And don’t require either ratio simply because a loan is collateralized; the connections tell us where recorded ratios belong, not that they must always be present.

### Turn 40 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasLoanToValueRatio\n    from: Loan\n    to: Loan-to-Value Ratio\n    meaning: A collateralized loan has a loan-to-value ratio when that measure is recorded.\n  - name: hasCombinedLoanToValueRatio\n    from: Loan\n    to: Combined Loan-to-Value Ratio\n    meaning: A collateralized loan has a combined loan-to-value ratio when that measure is recorded."
}
```

### Turn 40 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 40 — assistant

I’ve recorded the two ratio connections as applying **when a loan is collateralized and the measure is recorded**. They do not make either ratio mandatory. The model will preserve “collateralized loan” through that condition and its support description, not by creating a second loan record. Is that accurate?

For **Accrued Interest**, does a loan have the dated accrued-interest record directly? What verb and direction would you use?

### Turn 41 — user

Yes, your recap of the ratios is accurate.

For **accrued interest**, I need the amount and as-of date to answer the question for a given loan, but I wouldn’t confirm a named direct **loan-to-accrued-interest** connection or a verb for one here. Keep the dated accrued-interest record distinct from the loan’s interest rate and principal balance; the connection to a particular loan still needs to be established in the records the agent uses.

### Turn 41 — assistant

Understood. **Accrued Interest** remains a distinct amount-and-date record, but its path to a particular loan is still open. I won’t add a direct Loan connection or invent a verb for it.

When answering the accrued-interest question, how would the agent find the record for the particular loan—through the loan’s **Interest**, or through another recorded link?

### Turn 42 — user

I wouldn’t say the agent finds it through the loan’s **Interest** record; we haven’t established that link, or another named link to accrued interest.

The accrued-interest record gives the **amount and as-of date**, but the agent also needs evidence identifying which loan it belongs to before answering for a particular loan. If that association isn’t available, it should report that it cannot attribute the amount to that loan—not infer it from the rate, balance, or schedules.

### Turn 42 — assistant

The accrued-interest amount and as-of date are not enough by themselves to answer for a particular loan. I’ll leave its association to a loan open; without evidence of that association, the agent must report that it cannot attribute the amount.

Is there an existing **loan identifier on the accrued-interest record** that the agent can use to establish which loan it belongs to, or is the association not yet defined in the records you use?

### Turn 43 — user

I can’t confirm a loan identifier on the accrued-interest record. What we’ve established for that record is its **amount** and **as-of date**, not an identifier or a defined link to a particular loan.

So leave the association unresolved rather than adding a field to make the question work. Until the agent has reliable evidence tying the dated amount to the loan, it cannot answer that loan-specific accrued-interest question.

### Turn 43 — assistant

I’ll leave the accrued-interest-to-loan association unresolved. I won’t add an identifier or link without evidence; until that association is established, the agent cannot answer the loan-specific amount question.

The remaining relationship work can continue. For a credit facility and its sub-facility, is the connection directly **Credit Facility → has sub-facility → Sub-facility**? Is “has sub-facility” your verb and direction?

### Turn 44 — user

Yes. A **credit facility has a sub-facility**; the direction is from the facility to the portion made available under it. A facility can have sub-facilities, but the connection doesn’t say every facility must have one.

### Turn 44 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasSubFacility\n    from: Credit Facility\n    to: Sub-facility\n    meaning: A credit facility has a portion available under it for a particular purpose when sub-facilities exist."
}
```

### Turn 44 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 44 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 44 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit facility?
  - id: cq2
    text: Who is the lender for a loan or credit facility?
  - id: cq3
    text: "Who services a loan on the lender's behalf?"
  - id: cq4
    text: Which terms govern principal repayment for a loan?
  - id: cq5
    text: Which terms govern interest payment for a loan?
  - id: cq6
    text: "Which payment, amortization, principal, interest, or rate-reset schedules are associated with a loan?"
  - id: cq7
    text: What is the credit limit of a credit facility?
  - id: cq8
    text: Does a credit facility have sub-facilities?
  - id: cq9
    text: What payment history is recorded for a loan?
  - id: cq10
    text: "Which individual payment transactions, including fees and other related amounts, make up a loan's payment history?"
  - id: cq11
    text: "What principal and interest payments are recorded for a loan, and what do the applicable schedules say was due?"
  - id: cq12
    text: "What interest rate applies to a loan, and is it fixed or variable?"
  - id: cq13
    text: "For a variable-rate loan, what reset schedule applies, and what cap or first-rate-change term is recorded, if any?"
  - id: cq14
    text: "For a variable-rate loan, is its rate floating against an index or benchmark, or managed by the institution, where that rate type is recorded?"
  - id: cq15
    text: How much interest has accrued but remains unpaid for a loan as of a given date?
  - id: cq16
    text: "Which day-count convention in the applicable interest payment terms governs a loan's interest accrual?"
  - id: cq17
    text: Is a loan supported by pledged collateral?
  - id: cq18
    text: "Which collateral is linked to a secured loan, and which security agreement secures that collateral?"
  - id: cq19
    text: "For a collateralized loan, what collateral value and as-of date are recorded?"
  - id: cq20
    text: "For a collateralized loan, what loan-to-value measure is recorded?"
  - id: cq21
    text: "For a collateralized loan, what combined loan-to-value measure is recorded?"
  - id: cq22
    text: "Is a loan supported by a third-party guarantee, separately from any pledged collateral?"
  - id: cq23
    text: "If a loan is marked as secured by collateral, is collateral linked so its support check can pass?"
  - id: cq24
    text: What amount of credit has already been extended under a credit facility?
  - id: cq25
    text: What amount of credit remains available under a credit facility?
  - id: cq26
    text: "What maximum advance amount is recorded for a credit facility, if any?"
  - id: cq27
    text: "When is interest scheduled to be calculated for a loan, if an interest calculation schedule is recorded?"
classes:
  Loan:
    meaning: "An account whose repayment, payments, interest, and servicing are tracked."
    aliases: []
    properties: {}
  Credit Facility:
    meaning: An arrangement letting a borrower draw credit over time that may contain sub-facilities.
    aliases: []
    properties: {}
  Borrower:
    meaning: The party obliged to repay money or credit.
    aliases: []
    properties: {}
  Lender:
    meaning: The party extending money or credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party collecting principal and interest payments on a lender's behalf."
    aliases: []
    properties: {}
  Interest Payment Terms:
    meaning: Terms governing interest payment and specifying the accrual basis through a day-count convention.
    aliases: []
    properties: {}
  Principal Repayment Terms:
    meaning: Terms governing repayment of principal separately from interest payment.
    aliases: []
    properties: {}
  Loan Payment Schedule:
    meaning: The regular or explicit payment schedule for a loan.
    aliases: []
    properties: {}
  Amortization Schedule:
    meaning: "A schedule showing how scheduled payments change a loan's debt balance over time."
    aliases: []
    properties: {}
  Principal Payment Schedule:
    meaning: A schedule giving the dates when loan principal is due.
    aliases: []
    properties: {}
  Interest Payment Schedule:
    meaning: A schedule giving the dates when loan interest is due.
    aliases: []
    properties: {}
  Interest Rate Reset Schedule:
    meaning: "A schedule giving the dates when a loan's variable interest rate is recalculated."
    aliases: []
    properties: {}
  Interest Calculation Schedule:
    meaning: "A schedule giving the dates when interest is calculated for a loan, distinct from payment due dates and rate-reset dates."
    aliases: []
    properties: {}
  Payment History:
    meaning: "A loan's record of payments made toward its repayment obligation."
    aliases: []
    properties: {}
  Individual Payment Transaction:
    meaning: "An actual individual payment recorded within a payment history that may cover principal, interest, fees, or other related amounts."
    aliases:
      - payment transaction
    properties: {}
  Fixed Interest Rate:
    meaning: A fixed numeric interest rate that applies to a loan.
    aliases: []
    properties: {}
  Variable Interest Rate:
    meaning: A numeric interest rate that applies to a loan and can change over time.
    aliases: []
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  Security Agreement:
    meaning: An agreement granting a financial interest in collateral and setting out relevant rights and duties.
    aliases: []
    properties: {}
  Sub-facility:
    meaning: "A portion of a credit facility available for a particular purpose, potentially on its own schedule."
    aliases: []
    properties: {}
  Prepayment Terms:
    meaning: "Terms governing repayment of loan principal before maturity, including penalty timing when a penalty applies."
    aliases: []
    properties: {}
  Accrued Interest:
    meaning: "A dated amount of interest accrued but unpaid on a loan, distinct from the rate, principal balance, and calculation schedule."
    aliases: []
    properties: {}
  Collateral Value as of a Date:
    meaning: A dated valuation of collateral with its value and as-of date kept together.
    aliases:
      - Collateral Valuation
    properties: {}
  Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan comparing its principal with appraised collateral value.
    aliases: []
    properties: {}
  Combined Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan considering total debt secured by the asset or assets.
    aliases: []
    properties: {}
  Interest:
    meaning: "The cost of using credit on a loan, whose payment is governed by interest payment terms."
    aliases:
      - interest obligation
    properties: {}
  Principal:
    meaning: "The amount of a loan to be repaid apart from interest, whose repayment is governed by principal repayment terms."
    aliases:
      - principal obligation
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The loan has the party obliged to repay it as its borrower.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The loan has the party financing it as its lender.
    aliases: []
  - name: hasBorrower
    from: Credit Facility
    to: Borrower
    meaning: The facility has the party who may draw under it as its borrower.
    aliases: []
  - name: hasLender
    from: Credit Facility
    to: Lender
    meaning: The facility has the party providing it as its lender.
    aliases: []
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "A loan is serviced by the party collecting principal and interest payments on the lender's behalf."
    aliases:
      - has servicer
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "A loan has interest, when it bears interest."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: A loan has principal that must be repaid apart from interest.
    aliases: []
  - name: governsPaymentOf
    from: Interest Payment Terms
    to: Interest
    meaning: "Interest payment terms govern payment of the loan's interest."
    aliases: []
  - name: governsPaymentOf
    from: Principal Repayment Terms
    to: Principal
    meaning: "Principal repayment terms govern repayment of the loan's principal."
    aliases: []
  - name: governsPaymentOf
    from: Prepayment Terms
    to: Principal
    meaning: Prepayment terms govern repayment of principal before maturity when they apply.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: Loan Payment Schedule
    meaning: A loan has an associated loan payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasAmortizationSchedule
    from: Loan
    to: Amortization Schedule
    meaning: A loan has an associated amortization schedule when one applies.
    aliases:
      - has schedule
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: Principal Payment Schedule
    meaning: A loan has an associated principal payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestPaymentSchedule
    from: Loan
    to: Interest Payment Schedule
    meaning: A loan has an associated interest payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestRateResetSchedule
    from: Loan
    to: Interest Rate Reset Schedule
    meaning: A loan has an associated rate reset schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestCalculationSchedule
    from: Loan
    to: Interest Calculation Schedule
    meaning: A loan has an interest calculation schedule specifying when interest is scheduled to be calculated.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: Payment History
    meaning: A loan has a history recording payments made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: Payment History
    to: Individual Payment Transaction
    meaning: "A payment history has individual payment transactions, including those toward principal, interest, fees, or related amounts."
    aliases:
      - contains individual payment transaction
  - name: hasInterestRate
    from: Loan
    to: Fixed Interest Rate
    meaning: A loan has an applicable fixed interest rate carrying its numeric rate.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: Variable Interest Rate
    meaning: A loan has an applicable variable interest rate carrying its numeric rate.
    aliases: []
  - name: isCollateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by an asset pledged as its security.
    aliases:
      - has collateral
  - name: secures
    from: Security Agreement
    to: Collateral
    meaning: A security agreement secures the pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasCollateralValueAsOfAdate
    from: Collateral
    to: Collateral Value as of a Date
    meaning: Collateral has a dated valuation recording its value as of a date.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: Loan-to-Value Ratio
    meaning: A collateralized loan has a loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: Combined Loan-to-Value Ratio
    meaning: A collateralized loan has a combined loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasSubFacility
    from: Credit Facility
    to: Sub-facility
    meaning: A credit facility has a portion available under it for a particular purpose when sub-facilities exist.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 44 — assistant

I’ve recorded **Credit Facility → has sub-facility → Sub-facility**; a facility need not have one. The relationship check also shows that **Accrued Interest** still has no established path to a particular loan, as you asked me to leave unresolved.

For the question about recorded principal and interest payments versus what was due: how does the agent tell which amounts in an **Individual Payment Transaction** went toward principal and interest, and how does it find the corresponding due amounts in the applicable schedules?

### Turn 45 — user

The records we’ve established don’t yet give the agent a reliable way to make that comparison. An **individual payment transaction** records an actual payment, which may be toward principal, interest, fees, or other amounts, but we haven’t established an allocation of that transaction among those amounts. The applicable schedules tell us what kind of payment is scheduled and when; we haven’t established a due-amount field or a link matching a transaction to a scheduled payment.

So the agent can identify the payment history and applicable schedules, but it should **not claim an amount-paid-versus-amount-due result** from those records alone. It would need evidence of the payment allocation and scheduled due amounts before answering that part of the question.

### Turn 45 — assistant

Agreed. The agent can find the payment history and applicable schedules, but it cannot compare **amount paid with amount due** without payment allocations and scheduled due amounts. I’ll leave that part of the question open rather than infer either figure or a transaction-to-schedule match.

One relationship distinction: does an **Individual Payment Transaction** also identify its loan directly, or is it associated with the loan only through **Loan → Payment History → Individual Payment Transaction**?

### Turn 46 — user

For the connections we’ve established, use **Loan → payment history → individual payment transaction**. I wouldn’t add a separate direct transaction-to-loan connection without evidence for it.

That path identifies the loan whose history contains the transaction. It still doesn’t tell us how the payment was split among principal, interest, and fees, or which scheduled amount it satisfied.

### Turn 46 — assistant

I’ll use only **Loan → Payment History → Individual Payment Transaction** to associate a payment with a loan. I won’t add a direct transaction-to-loan link. That path still does not establish its allocation or which scheduled amount it satisfied. Is that accurate?

Two relationship gaps remain explicit: the loan association for **Accrued Interest**, and the evidence needed for a paid-versus-due comparison. I’ll keep those open while we capture decision-relevant values.

For **Credit Facility**, are these four separately recorded numeric amounts, using these names: **credit limit**, **amount of credit extended**, **available amount**, and **maximum advance amount** (if recorded)? The agent needs each for its corresponding facility question; what names do you use for them?

### Turn 47 — user

Yes, your payment-path recap is accurate.

For a credit facility, I use those four names, and each is a separate **numeric amount**: **credit limit**, **amount of credit extended**, **available amount**, and **maximum advance amount**. Report the maximum advance amount if it’s recorded. Don’t calculate one of these from another unless the facility’s governing terms provide a basis for doing so.

### Turn 47 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Credit Facility:\n    properties:\n      creditLimit:\n        type: number\n      amountOfCreditExtended:\n        type: number\n      availableAmount:\n        type: number\n      maximumAdvanceAmount:\n        type: number"
}
```

### Turn 47 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 47 — assistant

I’ve recorded those four facility figures separately, under your names. The agent will report the maximum advance amount only if recorded and will not calculate one figure from another without a basis in the governing terms.

For the rate and accrued-interest questions, would you use these value names: **numeric rate** on both Fixed Interest Rate and Variable Interest Rate; **floating-or-managed kind**, if recorded, on Variable Interest Rate; and **amount** plus **as-of date** on Accrued Interest? Is “numeric rate” your own term, or would you name it differently?

### Turn 48 — user

I’d name the value **rate**, not “numeric rate”; it is a number on both a fixed interest rate and a variable interest rate.

**Floating or managed** can be an optional description on the variable rate for this agent, as we discussed, but that’s a representation compromise—not a required choice for every variable rate. For **accrued interest**, **amount** and **as-of date** are the right names and belong together. We still cannot attribute that dated amount to a particular loan without evidence of the association.

### Turn 48 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Fixed Interest Rate:\n    properties:\n      rate:\n        type: number\n  Variable Interest Rate:\n    properties:\n      rate:\n        type: number\n      variableRateKind:\n        type: text\n        allowed: [floating, managed]\n  Accrued Interest:\n    properties:\n      amount:\n        type: number\n      asOfDate:\n        type: date"
}
```

### Turn 48 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 48 — assistant

I’ve recorded **rate** on both rate types, and **amount** and **as-of date** on Accrued Interest. I also recorded an optional floating/managed choice on Variable Interest Rate; its absence does not mean either kind applies, and the loan association remains unresolved.

I used **variableRateKind** as a provisional field name. What would you call that optional floating-or-managed detail in your records?

### Turn 49 — user

I’d call it the **more specific rate type**. When recorded, it tells us whether the variable rate is **floating** or **managed**. Leaving it blank means that detail hasn’t been recorded—not that the rate is a third type or that the agent should infer one.

### Turn 49 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "variableRateKind",
      "to": "moreSpecificRateType",
      "className": "Variable Interest Rate",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 49 — tool

Renamed 1 of 1:
- property "Variable Interest Rate.variableRateKind" → "moreSpecificRateType"

### Turn 49 — assistant

I’ve renamed the field **more specific rate type**. It may say floating or managed when recorded; blank means the detail is unknown, not a third type. Is that accurate?

For the loan and its terms, which of these proposed values are actually recorded and used for the questions or reviews—and what names do you use?

- On **Loan**: whether it is described as collateral-backed, whether it is described as guarantee-backed, and any interest-rate cap or first-rate-change term.
- On **Interest Payment Terms**: the day-count convention.
- On **Prepayment Terms**: whether a penalty applies and its penalty period in months.

### Turn 50 — user

The rate-type recap is accurate. I’d adjust your proposed values as follows:

- **Loan:** **Interest rate cap** and **first rate change term in months** are loan values, when recorded. Collateral-backed and guarantee-backed are useful descriptions for your tool, but they represent different **kinds of loan**, not established yes/no fields on every loan. A collateral-backed description never replaces the actual collateral link.
- **Interest payment terms:** The terms **have an accrual basis**, which is a **day-count convention**. I’d connect the terms to that convention rather than put the convention in a text field.
- **Prepayment terms:** Record the **prepayment penalty term in months** when applicable. I wouldn’t add a separate “penalty applies” field on those terms based on what we’ve established. The review checks for the recorded timing; it does not calculate a charge.

### Turn 50 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 50 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit facility?
  - id: cq2
    text: Who is the lender for a loan or credit facility?
  - id: cq3
    text: "Who services a loan on the lender's behalf?"
  - id: cq4
    text: Which terms govern principal repayment for a loan?
  - id: cq5
    text: Which terms govern interest payment for a loan?
  - id: cq6
    text: "Which payment, amortization, principal, interest, or rate-reset schedules are associated with a loan?"
  - id: cq7
    text: What is the credit limit of a credit facility?
  - id: cq8
    text: Does a credit facility have sub-facilities?
  - id: cq9
    text: What payment history is recorded for a loan?
  - id: cq10
    text: "Which individual payment transactions, including fees and other related amounts, make up a loan's payment history?"
  - id: cq11
    text: "What principal and interest payments are recorded for a loan, and what do the applicable schedules say was due?"
  - id: cq12
    text: "What interest rate applies to a loan, and is it fixed or variable?"
  - id: cq13
    text: "For a variable-rate loan, what reset schedule applies, and what cap or first-rate-change term is recorded, if any?"
  - id: cq14
    text: "For a variable-rate loan, is its rate floating against an index or benchmark, or managed by the institution, where that rate type is recorded?"
  - id: cq15
    text: How much interest has accrued but remains unpaid for a loan as of a given date?
  - id: cq16
    text: "Which day-count convention in the applicable interest payment terms governs a loan's interest accrual?"
  - id: cq17
    text: Is a loan supported by pledged collateral?
  - id: cq18
    text: "Which collateral is linked to a secured loan, and which security agreement secures that collateral?"
  - id: cq19
    text: "For a collateralized loan, what collateral value and as-of date are recorded?"
  - id: cq20
    text: "For a collateralized loan, what loan-to-value measure is recorded?"
  - id: cq21
    text: "For a collateralized loan, what combined loan-to-value measure is recorded?"
  - id: cq22
    text: "Is a loan supported by a third-party guarantee, separately from any pledged collateral?"
  - id: cq23
    text: "If a loan is marked as secured by collateral, is collateral linked so its support check can pass?"
  - id: cq24
    text: What amount of credit has already been extended under a credit facility?
  - id: cq25
    text: What amount of credit remains available under a credit facility?
  - id: cq26
    text: "What maximum advance amount is recorded for a credit facility, if any?"
  - id: cq27
    text: "When is interest scheduled to be calculated for a loan, if an interest calculation schedule is recorded?"
classes:
  Loan:
    meaning: "An account whose repayment, payments, interest, and servicing are tracked."
    aliases: []
    properties: {}
  Credit Facility:
    meaning: An arrangement letting a borrower draw credit over time that may contain sub-facilities.
    aliases: []
    properties:
      creditLimit:
        type: number
      amountOfCreditExtended:
        type: number
      availableAmount:
        type: number
      maximumAdvanceAmount:
        type: number
  Borrower:
    meaning: The party obliged to repay money or credit.
    aliases: []
    properties: {}
  Lender:
    meaning: The party extending money or credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party collecting principal and interest payments on a lender's behalf."
    aliases: []
    properties: {}
  Interest Payment Terms:
    meaning: Terms governing interest payment and specifying the accrual basis through a day-count convention.
    aliases: []
    properties: {}
  Principal Repayment Terms:
    meaning: Terms governing repayment of principal separately from interest payment.
    aliases: []
    properties: {}
  Loan Payment Schedule:
    meaning: The regular or explicit payment schedule for a loan.
    aliases: []
    properties: {}
  Amortization Schedule:
    meaning: "A schedule showing how scheduled payments change a loan's debt balance over time."
    aliases: []
    properties: {}
  Principal Payment Schedule:
    meaning: A schedule giving the dates when loan principal is due.
    aliases: []
    properties: {}
  Interest Payment Schedule:
    meaning: A schedule giving the dates when loan interest is due.
    aliases: []
    properties: {}
  Interest Rate Reset Schedule:
    meaning: "A schedule giving the dates when a loan's variable interest rate is recalculated."
    aliases: []
    properties: {}
  Interest Calculation Schedule:
    meaning: "A schedule giving the dates when interest is calculated for a loan, distinct from payment due dates and rate-reset dates."
    aliases: []
    properties: {}
  Payment History:
    meaning: "A loan's record of payments made toward its repayment obligation."
    aliases: []
    properties: {}
  Individual Payment Transaction:
    meaning: "An actual individual payment recorded within a payment history that may cover principal, interest, fees, or other related amounts."
    aliases:
      - payment transaction
    properties: {}
  Fixed Interest Rate:
    meaning: A fixed numeric interest rate that applies to a loan.
    aliases: []
    properties:
      rate:
        type: number
  Variable Interest Rate:
    meaning: A numeric interest rate that applies to a loan and can change over time.
    aliases: []
    properties:
      rate:
        type: number
      moreSpecificRateType:
        type: text
        allowed:
          - floating
          - managed
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  Security Agreement:
    meaning: An agreement granting a financial interest in collateral and setting out relevant rights and duties.
    aliases: []
    properties: {}
  Sub-facility:
    meaning: "A portion of a credit facility available for a particular purpose, potentially on its own schedule."
    aliases: []
    properties: {}
  Prepayment Terms:
    meaning: "Terms governing repayment of loan principal before maturity, including penalty timing when a penalty applies."
    aliases: []
    properties: {}
  Accrued Interest:
    meaning: "A dated amount of interest accrued but unpaid on a loan, distinct from the rate, principal balance, and calculation schedule."
    aliases: []
    properties:
      amount:
        type: number
      asOfDate:
        type: date
  Collateral Value as of a Date:
    meaning: A dated valuation of collateral with its value and as-of date kept together.
    aliases:
      - Collateral Valuation
    properties: {}
  Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan comparing its principal with appraised collateral value.
    aliases: []
    properties: {}
  Combined Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan considering total debt secured by the asset or assets.
    aliases: []
    properties: {}
  Interest:
    meaning: "The cost of using credit on a loan, whose payment is governed by interest payment terms."
    aliases:
      - interest obligation
    properties: {}
  Principal:
    meaning: "The amount of a loan to be repaid apart from interest, whose repayment is governed by principal repayment terms."
    aliases:
      - principal obligation
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The loan has the party obliged to repay it as its borrower.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The loan has the party financing it as its lender.
    aliases: []
  - name: hasBorrower
    from: Credit Facility
    to: Borrower
    meaning: The facility has the party who may draw under it as its borrower.
    aliases: []
  - name: hasLender
    from: Credit Facility
    to: Lender
    meaning: The facility has the party providing it as its lender.
    aliases: []
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "A loan is serviced by the party collecting principal and interest payments on the lender's behalf."
    aliases:
      - has servicer
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "A loan has interest, when it bears interest."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: A loan has principal that must be repaid apart from interest.
    aliases: []
  - name: governsPaymentOf
    from: Interest Payment Terms
    to: Interest
    meaning: "Interest payment terms govern payment of the loan's interest."
    aliases: []
  - name: governsPaymentOf
    from: Principal Repayment Terms
    to: Principal
    meaning: "Principal repayment terms govern repayment of the loan's principal."
    aliases: []
  - name: governsPaymentOf
    from: Prepayment Terms
    to: Principal
    meaning: Prepayment terms govern repayment of principal before maturity when they apply.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: Loan Payment Schedule
    meaning: A loan has an associated loan payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasAmortizationSchedule
    from: Loan
    to: Amortization Schedule
    meaning: A loan has an associated amortization schedule when one applies.
    aliases:
      - has schedule
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: Principal Payment Schedule
    meaning: A loan has an associated principal payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestPaymentSchedule
    from: Loan
    to: Interest Payment Schedule
    meaning: A loan has an associated interest payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestRateResetSchedule
    from: Loan
    to: Interest Rate Reset Schedule
    meaning: A loan has an associated rate reset schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestCalculationSchedule
    from: Loan
    to: Interest Calculation Schedule
    meaning: A loan has an interest calculation schedule specifying when interest is scheduled to be calculated.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: Payment History
    meaning: A loan has a history recording payments made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: Payment History
    to: Individual Payment Transaction
    meaning: "A payment history has individual payment transactions, including those toward principal, interest, fees, or related amounts."
    aliases:
      - contains individual payment transaction
  - name: hasInterestRate
    from: Loan
    to: Fixed Interest Rate
    meaning: A loan has an applicable fixed interest rate carrying its numeric rate.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: Variable Interest Rate
    meaning: A loan has an applicable variable interest rate carrying its numeric rate.
    aliases: []
  - name: isCollateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by an asset pledged as its security.
    aliases:
      - has collateral
  - name: secures
    from: Security Agreement
    to: Collateral
    meaning: A security agreement secures the pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasCollateralValueAsOfAdate
    from: Collateral
    to: Collateral Value as of a Date
    meaning: Collateral has a dated valuation recording its value as of a date.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: Loan-to-Value Ratio
    meaning: A collateralized loan has a loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: Combined Loan-to-Value Ratio
    meaning: A collateralized loan has a combined loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasSubFacility
    from: Credit Facility
    to: Sub-facility
    meaning: A credit facility has a portion available under it for a particular purpose when sub-facilities exist.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 50 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      firstRateChangeTermInMonths:\n        type: number\n        unit: months\n  Prepayment Terms:\n    properties:\n      prepaymentPenaltyTermInMonths:\n        type: number\n        unit: months\n  Day-count Convention:\n    meaning: The accrual basis specified by interest payment terms for calculating interest.\nrelationships:\n  - name: hasAccrualBasis\n    from: Interest Payment Terms\n    to: Day-count Convention\n    meaning: Interest payment terms have an accrual basis expressed by a day-count convention."
}
```

### Turn 50 — tool

Applied. Added 2, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 50 — assistant

I’ve recorded the **first rate change term in months** on Loan, the **prepayment penalty term in months** on Prepayment Terms, and **Interest Payment Terms → has accrual basis → Day-count Convention**. I have not added a “penalty applies” field or treated the day-count convention as free text. Is that accurate?

The **interest rate cap** is still open. What value is actually recorded for it—such as a rate ceiling—and what name and unit do you use?

### Turn 51 — user

Yes, that recap is accurate.

The loan records an **interest rate cap** as a **number**—the ceiling on the rate, when a cap applies. I wouldn’t specify a particular unit or scale, such as percentage points versus a decimal fraction, from what we’ve established. That would need to come from the governing terms or an agreed data convention.

### Turn 51 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      interestRateCap:\n        type: number"
}
```

### Turn 51 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 51 — assistant

I’ve recorded **interest rate cap** as a numeric Loan value, only when a cap applies. Its unit or scale remains unspecified; the agent must not assume one.

For the loan-support question and collateral review, would two independently recorded descriptions on **Loan**—“collateral-backed” and “guarantee-backed,” allowing both—faithfully represent the kinds of support you described? What names do you use for those descriptions?

### Turn 52 — user

Yes, as a **representation compromise**, two independent descriptions would let the agent report collateral backing, guarantee backing, or both. I’d use **collateralized loan** for the pledged-collateral description and **guaranteed loan** for the guarantee-backed description. Both sit under the broader idea of a **secured loan**; they are not established yes/no fields that every loan must carry.

For the collateral-support review, the description is not evidence enough. The agent must still find collateral linked to the secured loan. And neither description, on its own, verifies a guarantee or a security agreement.

### Turn 52 — assistant

I’ll preserve **collateralized loan** and **guaranteed loan** as distinct, potentially coexisting descriptions—not as proof of collateral, a valid guarantee, or a security agreement. The collateral review still needs the actual Loan-to-Collateral link.

For this tool’s property format, would **two optional true/false values on Loan**, named **collateralized loan** and **guaranteed loan**, reflect what is recorded? Or are those descriptions recorded in another form? I won’t interpret a missing value as “no.”

### Turn 53 — user

Two optional true/false values can work **for this tool**, but they would be a representation of loan kinds, not fields I can confirm are recorded on every loan. A recorded “true” can describe a **collateralized loan** or a **guaranteed loan**, and both can be true. Leave an unrecorded value unknown, as you propose; don’t turn it into “false.”

Keep the **secured loan** distinction as well. And for the collateral-support review, “collateralized loan = true” still does not replace the actual link from the secured loan to its collateral.

### Turn 53 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      collateralizedLoan:\n        type: boolean\n      guaranteedLoan:\n        type: boolean"
}
```

### Turn 53 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 53 — assistant

I’ve recorded **collateralized loan** and **guaranteed loan** as independent, optional true/false descriptions on Loan. Both may be true; an unrecorded value remains unknown. Neither replaces the collateral link required by the review.

You also asked to retain the broader **secured loan** distinction. Is “secured loan” separately recorded as a description of a loan, or is it only an umbrella term you use when discussing collateral-backed and guarantee-backed loans?

### Turn 54 — user

**Secured loan** is a distinct, broader kind of loan, not just a conversational umbrella term. A loan may be secured through pledged collateral or through a third-party guarantee.

I can’t confirm a separately recorded true/false **secured loan** field. If your tool represents loan kinds as optional descriptions, preserve “secured loan” as the broader description, but don’t treat an absent description as proof the loan is unsecured. The collateral-support review takes a secured loan and checks for an actual collateral link; it does not verify guarantee support.

### Turn 54 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      securedLoan:\n        type: boolean"
}
```

### Turn 54 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 54 — assistant

I’ve preserved **secured loan** as an optional, broader description alongside **collateralized loan** and **guaranteed loan**. Its absence will not mean “unsecured.” I’m using it as a modeling description, not claiming you confirmed a separately recorded field. Is that distinction accurate?

For the three collateral measures, are these the values and names you use: **value** and **as-of date** on Collateral Value as of a Date; **ratio** on Loan-to-Value Ratio; and **ratio** on Combined Loan-to-Value Ratio? I would keep the ratios separate and record both as numeric percentages.

### Turn 55 — user

Yes. That secured-loan description is a modeling choice, not a confirmed separate field.

Those collateral measure names are right:

- **Collateral value as of a date:** a numeric **value** and its **as-of date**, kept together.
- **Loan-to-value ratio:** a numeric **ratio**, expressed as a percentage.
- **Combined loan-to-value ratio:** its own numeric **ratio**, also expressed as a percentage.

Keep the ratios separate: the first compares the loan’s principal with the appraised collateral value; the second considers the total debt secured by the asset or assets.

### Turn 55 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Collateral Value as of a Date:\n    properties:\n      value:\n        type: number\n      asOfDate:\n        type: date\n  Loan-to-Value Ratio:\n    properties:\n      ratio:\n        type: number\n        unit: percent\n  Combined Loan-to-Value Ratio:\n    properties:\n      ratio:\n        type: number\n        unit: percent"
}
```

### Turn 55 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 55 — assistant

I’ve recorded the dated collateral value and the two separate percentage ratios. Their values are not interchangeable. Is that accurate?

For the six schedules, should the agent read **scheduled dates** from each record under these meanings: payment dates from Loan Payment Schedule, balance-changing payment dates from Amortization Schedule, principal due dates from Principal Payment Schedule, interest due dates from Interest Payment Schedule, rate recalculation dates from Interest Rate Reset Schedule, and calculation dates from Interest Calculation Schedule? What names would you use for those date values?

### Turn 56 — user

Yes, those are the right **business meanings**, with one caution: I haven’t established a separately named date field on each schedule.

The agent can use the applicable schedule to answer when payments are scheduled, when principal or interest is due, when interest is calculated, and when a rate is reset. An **amortization schedule** also shows how periodic payments change the balance; I wouldn’t reduce it to a list of “balance-changing payment dates.”

For now, I’d describe the dates in the question by their purpose—**principal due dates**, **interest due dates**, **interest calculation dates**, and **rate reset dates**—rather than invent field names. These schedules also don’t, by themselves, establish the due amounts or a match to an actual payment.

### Turn 56 — assistant

I’ll use each schedule’s stated purpose without inventing date-field names. In particular, the amortization schedule retains its balance-change information, and none of these schedules alone establishes a due amount or a match to an actual payment.

For an **Individual Payment Transaction**, are an actual **payment amount** and **payment date** recorded, and what do you call those values? I won’t assume a principal/interest/fee allocation from the total amount.

### Turn 57 — user

I can’t confirm separately named **payment amount** or **payment date** values on the individual payment transaction from what we’ve established. It represents an actual payment toward the debt, but we haven’t specified those fields or an allocation among principal, interest, and fees.

So don’t add field names—or make an amount-versus-due comparison—on that basis alone. The agent can still confirm that individual payments appear in the loan’s payment history.

### Turn 57 — assistant

I won’t add payment amount, payment date, or allocation fields. The confirmed payment-record review can check that individual transactions appear in the loan’s history, but the paid-versus-due comparison remains unsupported.

One remaining property question for this phase: because the agent tracks loans and facilities over time, does it need a **current state or status** for either one to answer any of your questions or carry out the five reviews? If so, what decision would that status change?

### Turn 58 — user

No **current state or status** field has been established as necessary for these questions or the five reviews. The reviews use the recorded parties, interest terms, collateral link, reset schedule, payment history, and prepayment timing as applicable—not a loan or facility status.

A real servicing operation may track lifecycle status, but I wouldn’t add one here or invent a decision it changes. Missing evidence should be reported by the relevant review, not translated into an unsupported account status.

### Turn 58 — assistant

I’ll leave loan and facility status out. For these reviews, missing evidence produces a reported gap, not a new account state.

That completes the proposed decision-bearing values for now: facility figures, rates and their optional details, dated accrued interest, loan-support descriptions, prepayment timing, and collateral measures. We’ve left payment amounts, allocations, due amounts, and the accrued-interest-to-loan association unresolved rather than inventing them. Is that an accurate recap before we check terminology?

### Turn 59 — user

Yes, that’s an accurate recap for this phase. We’ve kept the recorded values separate from the checks that use them, and left those payment-comparison and accrued-interest association gaps open rather than filling them by assumption. We can check the terminology next.

### Turn 59 — assistant

The model already has a plain meaning sentence for each class and relationship. I’ll check those against your terminology as we go, and ask explicitly about alternate names rather than assume that similar words mean the same thing.

For **Loan, Credit Facility, Borrower, Lender, and Servicer**, are there other names your users use for the *same* thing? If not, “none” is fine.

### Turn 60 — user

For this group, **credit facility** is also called a **master commitment**. I don’t have another name for **loan, borrower, lender, or servicer** that means precisely the same thing here.

I wouldn’t use “revolving credit” as a blanket alternate name for every credit facility; it describes a particular form of credit.

### Turn 60 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Credit Facility:\n    aliases: [master commitment]"
}
```

### Turn 60 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 60 — assistant

I’ve added **master commitment** as an alternate name for Credit Facility. I have not added “revolving credit,” since it names a particular form rather than every facility. No aliases were added for the other four.

For **Interest, Principal, Interest Payment Terms, Principal Repayment Terms, and Prepayment Terms**, are there other names users use that mean precisely the same thing in your operation?

### Turn 61 — user

No precise alternate names for those five in this scope. **Interest** and **principal** must stay distinct, and **prepayment terms** are a more specific form of principal repayment terms, not an alternate name for all principal repayment terms.

### Turn 61 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 61 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit facility?
  - id: cq2
    text: Who is the lender for a loan or credit facility?
  - id: cq3
    text: "Who services a loan on the lender's behalf?"
  - id: cq4
    text: Which terms govern principal repayment for a loan?
  - id: cq5
    text: Which terms govern interest payment for a loan?
  - id: cq6
    text: "Which payment, amortization, principal, interest, or rate-reset schedules are associated with a loan?"
  - id: cq7
    text: What is the credit limit of a credit facility?
  - id: cq8
    text: Does a credit facility have sub-facilities?
  - id: cq9
    text: What payment history is recorded for a loan?
  - id: cq10
    text: "Which individual payment transactions, including fees and other related amounts, make up a loan's payment history?"
  - id: cq11
    text: "What principal and interest payments are recorded for a loan, and what do the applicable schedules say was due?"
  - id: cq12
    text: "What interest rate applies to a loan, and is it fixed or variable?"
  - id: cq13
    text: "For a variable-rate loan, what reset schedule applies, and what cap or first-rate-change term is recorded, if any?"
  - id: cq14
    text: "For a variable-rate loan, is its rate floating against an index or benchmark, or managed by the institution, where that rate type is recorded?"
  - id: cq15
    text: How much interest has accrued but remains unpaid for a loan as of a given date?
  - id: cq16
    text: "Which day-count convention in the applicable interest payment terms governs a loan's interest accrual?"
  - id: cq17
    text: Is a loan supported by pledged collateral?
  - id: cq18
    text: "Which collateral is linked to a secured loan, and which security agreement secures that collateral?"
  - id: cq19
    text: "For a collateralized loan, what collateral value and as-of date are recorded?"
  - id: cq20
    text: "For a collateralized loan, what loan-to-value measure is recorded?"
  - id: cq21
    text: "For a collateralized loan, what combined loan-to-value measure is recorded?"
  - id: cq22
    text: "Is a loan supported by a third-party guarantee, separately from any pledged collateral?"
  - id: cq23
    text: "If a loan is marked as secured by collateral, is collateral linked so its support check can pass?"
  - id: cq24
    text: What amount of credit has already been extended under a credit facility?
  - id: cq25
    text: What amount of credit remains available under a credit facility?
  - id: cq26
    text: "What maximum advance amount is recorded for a credit facility, if any?"
  - id: cq27
    text: "When is interest scheduled to be calculated for a loan, if an interest calculation schedule is recorded?"
classes:
  Loan:
    meaning: "An account whose repayment, payments, interest, and servicing are tracked."
    aliases: []
    properties:
      firstRateChangeTermInMonths:
        type: number
        unit: months
      interestRateCap:
        type: number
      collateralizedLoan:
        type: boolean
      guaranteedLoan:
        type: boolean
      securedLoan:
        type: boolean
  Credit Facility:
    meaning: An arrangement letting a borrower draw credit over time that may contain sub-facilities.
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      amountOfCreditExtended:
        type: number
      availableAmount:
        type: number
      maximumAdvanceAmount:
        type: number
  Borrower:
    meaning: The party obliged to repay money or credit.
    aliases: []
    properties: {}
  Lender:
    meaning: The party extending money or credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party collecting principal and interest payments on a lender's behalf."
    aliases: []
    properties: {}
  Interest Payment Terms:
    meaning: Terms governing interest payment and specifying the accrual basis through a day-count convention.
    aliases: []
    properties: {}
  Principal Repayment Terms:
    meaning: Terms governing repayment of principal separately from interest payment.
    aliases: []
    properties: {}
  Loan Payment Schedule:
    meaning: The regular or explicit payment schedule for a loan.
    aliases: []
    properties: {}
  Amortization Schedule:
    meaning: "A schedule showing how scheduled payments change a loan's debt balance over time."
    aliases: []
    properties: {}
  Principal Payment Schedule:
    meaning: A schedule giving the dates when loan principal is due.
    aliases: []
    properties: {}
  Interest Payment Schedule:
    meaning: A schedule giving the dates when loan interest is due.
    aliases: []
    properties: {}
  Interest Rate Reset Schedule:
    meaning: "A schedule giving the dates when a loan's variable interest rate is recalculated."
    aliases: []
    properties: {}
  Interest Calculation Schedule:
    meaning: "A schedule giving the dates when interest is calculated for a loan, distinct from payment due dates and rate-reset dates."
    aliases: []
    properties: {}
  Payment History:
    meaning: "A loan's record of payments made toward its repayment obligation."
    aliases: []
    properties: {}
  Individual Payment Transaction:
    meaning: "An actual individual payment recorded within a payment history that may cover principal, interest, fees, or other related amounts."
    aliases:
      - payment transaction
    properties: {}
  Fixed Interest Rate:
    meaning: A fixed numeric interest rate that applies to a loan.
    aliases: []
    properties:
      rate:
        type: number
  Variable Interest Rate:
    meaning: A numeric interest rate that applies to a loan and can change over time.
    aliases: []
    properties:
      rate:
        type: number
      moreSpecificRateType:
        type: text
        allowed:
          - floating
          - managed
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  Security Agreement:
    meaning: An agreement granting a financial interest in collateral and setting out relevant rights and duties.
    aliases: []
    properties: {}
  Sub-facility:
    meaning: "A portion of a credit facility available for a particular purpose, potentially on its own schedule."
    aliases: []
    properties: {}
  Prepayment Terms:
    meaning: "Terms governing repayment of loan principal before maturity, including penalty timing when a penalty applies."
    aliases: []
    properties:
      prepaymentPenaltyTermInMonths:
        type: number
        unit: months
  Accrued Interest:
    meaning: "A dated amount of interest accrued but unpaid on a loan, distinct from the rate, principal balance, and calculation schedule."
    aliases: []
    properties:
      amount:
        type: number
      asOfDate:
        type: date
  Collateral Value as of a Date:
    meaning: A dated valuation of collateral with its value and as-of date kept together.
    aliases:
      - Collateral Valuation
    properties:
      value:
        type: number
      asOfDate:
        type: date
  Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan comparing its principal with appraised collateral value.
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  Combined Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan considering total debt secured by the asset or assets.
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  Interest:
    meaning: "The cost of using credit on a loan, whose payment is governed by interest payment terms."
    aliases:
      - interest obligation
    properties: {}
  Principal:
    meaning: "The amount of a loan to be repaid apart from interest, whose repayment is governed by principal repayment terms."
    aliases:
      - principal obligation
    properties: {}
  Day-count Convention:
    meaning: The accrual basis specified by interest payment terms for calculating interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The loan has the party obliged to repay it as its borrower.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The loan has the party financing it as its lender.
    aliases: []
  - name: hasBorrower
    from: Credit Facility
    to: Borrower
    meaning: The facility has the party who may draw under it as its borrower.
    aliases: []
  - name: hasLender
    from: Credit Facility
    to: Lender
    meaning: The facility has the party providing it as its lender.
    aliases: []
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "A loan is serviced by the party collecting principal and interest payments on the lender's behalf."
    aliases:
      - has servicer
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "A loan has interest, when it bears interest."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: A loan has principal that must be repaid apart from interest.
    aliases: []
  - name: governsPaymentOf
    from: Interest Payment Terms
    to: Interest
    meaning: "Interest payment terms govern payment of the loan's interest."
    aliases: []
  - name: governsPaymentOf
    from: Principal Repayment Terms
    to: Principal
    meaning: "Principal repayment terms govern repayment of the loan's principal."
    aliases: []
  - name: governsPaymentOf
    from: Prepayment Terms
    to: Principal
    meaning: Prepayment terms govern repayment of principal before maturity when they apply.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: Loan Payment Schedule
    meaning: A loan has an associated loan payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasAmortizationSchedule
    from: Loan
    to: Amortization Schedule
    meaning: A loan has an associated amortization schedule when one applies.
    aliases:
      - has schedule
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: Principal Payment Schedule
    meaning: A loan has an associated principal payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestPaymentSchedule
    from: Loan
    to: Interest Payment Schedule
    meaning: A loan has an associated interest payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestRateResetSchedule
    from: Loan
    to: Interest Rate Reset Schedule
    meaning: A loan has an associated rate reset schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestCalculationSchedule
    from: Loan
    to: Interest Calculation Schedule
    meaning: A loan has an interest calculation schedule specifying when interest is scheduled to be calculated.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: Payment History
    meaning: A loan has a history recording payments made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: Payment History
    to: Individual Payment Transaction
    meaning: "A payment history has individual payment transactions, including those toward principal, interest, fees, or related amounts."
    aliases:
      - contains individual payment transaction
  - name: hasInterestRate
    from: Loan
    to: Fixed Interest Rate
    meaning: A loan has an applicable fixed interest rate carrying its numeric rate.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: Variable Interest Rate
    meaning: A loan has an applicable variable interest rate carrying its numeric rate.
    aliases: []
  - name: isCollateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by an asset pledged as its security.
    aliases:
      - has collateral
  - name: secures
    from: Security Agreement
    to: Collateral
    meaning: A security agreement secures the pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasCollateralValueAsOfAdate
    from: Collateral
    to: Collateral Value as of a Date
    meaning: Collateral has a dated valuation recording its value as of a date.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: Loan-to-Value Ratio
    meaning: A collateralized loan has a loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: Combined Loan-to-Value Ratio
    meaning: A collateralized loan has a combined loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasSubFacility
    from: Credit Facility
    to: Sub-facility
    meaning: A credit facility has a portion available under it for a particular purpose when sub-facilities exist.
    aliases: []
  - name: hasAccrualBasis
    from: Interest Payment Terms
    to: Day-count Convention
    meaning: Interest payment terms have an accrual basis expressed by a day-count convention.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 61 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Interest:\n    aliases: []\n  Principal:\n    aliases: []"
}
```

### Turn 61 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 61 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 61 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit facility?
  - id: cq2
    text: Who is the lender for a loan or credit facility?
  - id: cq3
    text: "Who services a loan on the lender's behalf?"
  - id: cq4
    text: Which terms govern principal repayment for a loan?
  - id: cq5
    text: Which terms govern interest payment for a loan?
  - id: cq6
    text: "Which payment, amortization, principal, interest, or rate-reset schedules are associated with a loan?"
  - id: cq7
    text: What is the credit limit of a credit facility?
  - id: cq8
    text: Does a credit facility have sub-facilities?
  - id: cq9
    text: What payment history is recorded for a loan?
  - id: cq10
    text: "Which individual payment transactions, including fees and other related amounts, make up a loan's payment history?"
  - id: cq11
    text: "What principal and interest payments are recorded for a loan, and what do the applicable schedules say was due?"
  - id: cq12
    text: "What interest rate applies to a loan, and is it fixed or variable?"
  - id: cq13
    text: "For a variable-rate loan, what reset schedule applies, and what cap or first-rate-change term is recorded, if any?"
  - id: cq14
    text: "For a variable-rate loan, is its rate floating against an index or benchmark, or managed by the institution, where that rate type is recorded?"
  - id: cq15
    text: How much interest has accrued but remains unpaid for a loan as of a given date?
  - id: cq16
    text: "Which day-count convention in the applicable interest payment terms governs a loan's interest accrual?"
  - id: cq17
    text: Is a loan supported by pledged collateral?
  - id: cq18
    text: "Which collateral is linked to a secured loan, and which security agreement secures that collateral?"
  - id: cq19
    text: "For a collateralized loan, what collateral value and as-of date are recorded?"
  - id: cq20
    text: "For a collateralized loan, what loan-to-value measure is recorded?"
  - id: cq21
    text: "For a collateralized loan, what combined loan-to-value measure is recorded?"
  - id: cq22
    text: "Is a loan supported by a third-party guarantee, separately from any pledged collateral?"
  - id: cq23
    text: "If a loan is marked as secured by collateral, is collateral linked so its support check can pass?"
  - id: cq24
    text: What amount of credit has already been extended under a credit facility?
  - id: cq25
    text: What amount of credit remains available under a credit facility?
  - id: cq26
    text: "What maximum advance amount is recorded for a credit facility, if any?"
  - id: cq27
    text: "When is interest scheduled to be calculated for a loan, if an interest calculation schedule is recorded?"
classes:
  Loan:
    meaning: "An account whose repayment, payments, interest, and servicing are tracked."
    aliases: []
    properties:
      firstRateChangeTermInMonths:
        type: number
        unit: months
      interestRateCap:
        type: number
      collateralizedLoan:
        type: boolean
      guaranteedLoan:
        type: boolean
      securedLoan:
        type: boolean
  Credit Facility:
    meaning: An arrangement letting a borrower draw credit over time that may contain sub-facilities.
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      amountOfCreditExtended:
        type: number
      availableAmount:
        type: number
      maximumAdvanceAmount:
        type: number
  Borrower:
    meaning: The party obliged to repay money or credit.
    aliases: []
    properties: {}
  Lender:
    meaning: The party extending money or credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party collecting principal and interest payments on a lender's behalf."
    aliases: []
    properties: {}
  Interest Payment Terms:
    meaning: Terms governing interest payment and specifying the accrual basis through a day-count convention.
    aliases: []
    properties: {}
  Principal Repayment Terms:
    meaning: Terms governing repayment of principal separately from interest payment.
    aliases: []
    properties: {}
  Loan Payment Schedule:
    meaning: The regular or explicit payment schedule for a loan.
    aliases: []
    properties: {}
  Amortization Schedule:
    meaning: "A schedule showing how scheduled payments change a loan's debt balance over time."
    aliases: []
    properties: {}
  Principal Payment Schedule:
    meaning: A schedule giving the dates when loan principal is due.
    aliases: []
    properties: {}
  Interest Payment Schedule:
    meaning: A schedule giving the dates when loan interest is due.
    aliases: []
    properties: {}
  Interest Rate Reset Schedule:
    meaning: "A schedule giving the dates when a loan's variable interest rate is recalculated."
    aliases: []
    properties: {}
  Interest Calculation Schedule:
    meaning: "A schedule giving the dates when interest is calculated for a loan, distinct from payment due dates and rate-reset dates."
    aliases: []
    properties: {}
  Payment History:
    meaning: "A loan's record of payments made toward its repayment obligation."
    aliases: []
    properties: {}
  Individual Payment Transaction:
    meaning: "An actual individual payment recorded within a payment history that may cover principal, interest, fees, or other related amounts."
    aliases:
      - payment transaction
    properties: {}
  Fixed Interest Rate:
    meaning: A fixed numeric interest rate that applies to a loan.
    aliases: []
    properties:
      rate:
        type: number
  Variable Interest Rate:
    meaning: A numeric interest rate that applies to a loan and can change over time.
    aliases: []
    properties:
      rate:
        type: number
      moreSpecificRateType:
        type: text
        allowed:
          - floating
          - managed
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  Security Agreement:
    meaning: An agreement granting a financial interest in collateral and setting out relevant rights and duties.
    aliases: []
    properties: {}
  Sub-facility:
    meaning: "A portion of a credit facility available for a particular purpose, potentially on its own schedule."
    aliases: []
    properties: {}
  Prepayment Terms:
    meaning: "Terms governing repayment of loan principal before maturity, including penalty timing when a penalty applies."
    aliases: []
    properties:
      prepaymentPenaltyTermInMonths:
        type: number
        unit: months
  Accrued Interest:
    meaning: "A dated amount of interest accrued but unpaid on a loan, distinct from the rate, principal balance, and calculation schedule."
    aliases: []
    properties:
      amount:
        type: number
      asOfDate:
        type: date
  Collateral Value as of a Date:
    meaning: A dated valuation of collateral with its value and as-of date kept together.
    aliases:
      - Collateral Valuation
    properties:
      value:
        type: number
      asOfDate:
        type: date
  Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan comparing its principal with appraised collateral value.
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  Combined Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan considering total debt secured by the asset or assets.
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  Interest:
    meaning: "The cost of using credit on a loan, whose payment is governed by interest payment terms."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of a loan to be repaid apart from interest, whose repayment is governed by principal repayment terms."
    aliases: []
    properties: {}
  Day-count Convention:
    meaning: The accrual basis specified by interest payment terms for calculating interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The loan has the party obliged to repay it as its borrower.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The loan has the party financing it as its lender.
    aliases: []
  - name: hasBorrower
    from: Credit Facility
    to: Borrower
    meaning: The facility has the party who may draw under it as its borrower.
    aliases: []
  - name: hasLender
    from: Credit Facility
    to: Lender
    meaning: The facility has the party providing it as its lender.
    aliases: []
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "A loan is serviced by the party collecting principal and interest payments on the lender's behalf."
    aliases:
      - has servicer
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "A loan has interest, when it bears interest."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: A loan has principal that must be repaid apart from interest.
    aliases: []
  - name: governsPaymentOf
    from: Interest Payment Terms
    to: Interest
    meaning: "Interest payment terms govern payment of the loan's interest."
    aliases: []
  - name: governsPaymentOf
    from: Principal Repayment Terms
    to: Principal
    meaning: "Principal repayment terms govern repayment of the loan's principal."
    aliases: []
  - name: governsPaymentOf
    from: Prepayment Terms
    to: Principal
    meaning: Prepayment terms govern repayment of principal before maturity when they apply.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: Loan Payment Schedule
    meaning: A loan has an associated loan payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasAmortizationSchedule
    from: Loan
    to: Amortization Schedule
    meaning: A loan has an associated amortization schedule when one applies.
    aliases:
      - has schedule
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: Principal Payment Schedule
    meaning: A loan has an associated principal payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestPaymentSchedule
    from: Loan
    to: Interest Payment Schedule
    meaning: A loan has an associated interest payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestRateResetSchedule
    from: Loan
    to: Interest Rate Reset Schedule
    meaning: A loan has an associated rate reset schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestCalculationSchedule
    from: Loan
    to: Interest Calculation Schedule
    meaning: A loan has an interest calculation schedule specifying when interest is scheduled to be calculated.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: Payment History
    meaning: A loan has a history recording payments made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: Payment History
    to: Individual Payment Transaction
    meaning: "A payment history has individual payment transactions, including those toward principal, interest, fees, or related amounts."
    aliases:
      - contains individual payment transaction
  - name: hasInterestRate
    from: Loan
    to: Fixed Interest Rate
    meaning: A loan has an applicable fixed interest rate carrying its numeric rate.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: Variable Interest Rate
    meaning: A loan has an applicable variable interest rate carrying its numeric rate.
    aliases: []
  - name: isCollateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by an asset pledged as its security.
    aliases:
      - has collateral
  - name: secures
    from: Security Agreement
    to: Collateral
    meaning: A security agreement secures the pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasCollateralValueAsOfAdate
    from: Collateral
    to: Collateral Value as of a Date
    meaning: Collateral has a dated valuation recording its value as of a date.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: Loan-to-Value Ratio
    meaning: A collateralized loan has a loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: Combined Loan-to-Value Ratio
    meaning: A collateralized loan has a combined loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasSubFacility
    from: Credit Facility
    to: Sub-facility
    meaning: A credit facility has a portion available under it for a particular purpose when sub-facilities exist.
    aliases: []
  - name: hasAccrualBasis
    from: Interest Payment Terms
    to: Day-count Convention
    meaning: Interest payment terms have an accrual basis expressed by a day-count convention.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 61 — assistant

Agreed: there are no precise alternate names for those five. I’ve also removed the provisional “interest obligation” and “principal obligation” aliases, since those were my wording, not names you confirmed. Interest, principal, and prepayment terms remain distinct.

For the **six loan schedules**—loan payment, amortization, principal payment, interest payment, interest-rate reset, and interest calculation—are there any alternate names your users use for the *same* schedule? “None” for the group is fine.

### Turn 62 — user

None that I’d treat as precise alternate names for those six schedules. In particular, an **interest calculation schedule** isn’t an interest payment schedule, and a **rate reset schedule** isn’t either of them.

### Turn 62 — assistant

No aliases for those schedules. The meanings and directions recorded for every class and relationship are present, and your answers have kept the three interest-related schedules distinct. Is that an accurate terminology recap?

One path check is needed because **Day-count Convention** was added after we first mapped relationships: to find a loan’s convention, does the agent follow **Loan → Interest ← Interest Payment Terms → Day-count Convention**, without assuming a direct link from the loan to the convention?

### Turn 63 — user

Yes, the terminology recap is accurate.

That path is right: the **loan has interest**; the applicable **interest payment terms govern payment of that interest**; and those terms **have a day-count convention as their accrual basis**. I wouldn’t add a direct loan-to-convention link. The convention tells the agent the basis for calculating accrual, not the accrued unpaid amount.

### Turn 63 — assistant

Confirmed: the agent reaches the day-count convention through **Loan → Interest ← Interest Payment Terms → Day-count Convention**. There is no direct loan-to-convention link, and the convention does not supply the accrued unpaid amount. That closes the path check for the newly added concept.

Next I’ll check when recorded values are necessary, rather than make every value mandatory. For each facility figure—**credit limit**, **amount of credit extended**, **available amount**, and **maximum advance amount**—what should the agent do if that particular figure is missing or appears wrong when asked to report it? A brief answer for each is enough.

### Turn 64 — user

For each figure, the agent should report the **recorded value**, not substitute another facility figure for it:

- **Credit limit:** If missing, report that the limit isn’t recorded. If it appears inconsistent with the governing terms, flag it for review.
- **Amount of credit extended:** If missing, report that gap; don’t derive it from the limit and available amount.
- **Available amount:** If missing, don’t calculate it from the other figures without a basis in the governing terms.
- **Maximum advance amount:** Report it if recorded; otherwise say it isn’t recorded, rather than treating the credit limit as its value.

An apparently wrong value should be flagged with the evidence for the concern. We haven’t established a numeric tolerance or an automatic correction rule for any of the four.

### Turn 64 — assistant

For each facility figure, I’ll report the recorded value or say it is missing—not substitute or calculate another figure. An apparent inconsistency with governing terms is flagged with its evidence; no tolerance or automatic correction rule has been established. Is that accurate?

Before continuing the value checks, one terminology item remains: do your users have other verb phrases for **“loan is serviced by servicer,” “loan is collateralized by collateral,” “security agreement secures collateral,”** or **“interest payment terms have an accrual basis”** that mean precisely the same connection in the same direction? “None” is fine.

### Turn 65 — user

Yes, your recap of the facility figures is accurate.

I wouldn’t add any precise alternate verb phrases for those four connections. The existing wording keeps their roles clear: the **loan is serviced by** the servicer; the **secured loan is collateralized by** collateral; the **security agreement secures** collateral; and the **interest payment terms have an accrual basis** in the day-count convention.

### Turn 65 — assistant

I’ve added no alternate phrases for those four relationships. The terminology check is complete: the recorded classes and relationships have meanings, and the confirmed alternate name is **master commitment** for Credit Facility. Where no precise synonym was confirmed, I’ve left aliases out.

For the loan’s **interest rate cap** and **first rate change term in months**, what should the agent report if either is missing or appears wrong? Does missing mean “not applicable,” or simply “not recorded” unless the governing terms establish otherwise?

### Turn 66 — user

Yes—treat a missing value as **not recorded**, not automatically “not applicable.”

For the **interest rate cap**, report the recorded numeric cap if present. If it’s missing, don’t infer that the loan has no cap; check the governing terms before calling it inapplicable. For the **first rate change term in months**, do the same: report the recorded term or say it isn’t recorded, without deriving it from the reset schedule.

If either appears inconsistent with the governing terms, flag the discrepancy and the evidence. Neither value is a condition of the variable-rate setup review; that review checks the variable rate and its reset schedule.

### Turn 66 — assistant

I’ll treat a missing cap or first-rate-change term as **not recorded**, not “not applicable.” Neither blocks the variable-rate setup review; that review checks for the variable rate and its reset schedule. An apparent conflict with governing terms should be flagged with its evidence. Is that accurate?

For the **rate** on Fixed Interest Rate and Variable Interest Rate, and the optional **more specific rate type** on Variable Interest Rate, what should the agent do if each value is missing or appears wrong?

### Turn 67 — user

Your recap of the cap and first-rate-change term is accurate.

- **Rate on a fixed or variable interest rate:** Report the recorded numeric rate. If the value is missing, say the rate value is not recorded; don’t infer it from payments or other terms. If it appears to conflict with the governing terms, flag the discrepancy with the evidence rather than correcting it automatically.
- **More specific rate type on a variable rate:** If recorded, report **floating** or **managed**. If missing, say that the more specific type is not recorded—not that the rate is neither. If the description appears wrong, flag it against the available terms; don’t infer the type from the numeric rate.

The variable-rate setup review checks that the loan has a variable rate and a reset schedule. We haven’t made the numeric rate value or the more specific type an additional condition for passing that particular review.

### Turn 67 — assistant

Recorded for the constraint check: missing numeric rates and missing more-specific rate types are reported as gaps, not inferred. A conflicting value is flagged against the available terms, not corrected. Neither the numeric rate nor floating/managed detail is an additional pass condition for the variable-rate setup review.

For **Accrued Interest**, what should the agent do if its **amount** is missing, and separately if its **as-of date** is missing or wrong? The association with a particular loan remains a separate unresolved requirement.

### Turn 68 — user

To answer an **accrued-but-unpaid interest as-of-date question**, the agent needs both the **amount** and the **as-of date** on the accrued-interest record.

- If the **amount** is missing, it cannot report how much has accrued; report the missing amount.
- If the **as-of date** is missing, it cannot say what date the amount represents. If the date appears wrong, flag the discrepancy with its evidence rather than silently changing it.

Even with both values present, the agent must not attribute the record to a particular loan until that association is established. This is a limit on answering that question, not an extra condition in one of the five reviews.

### Turn 68 — assistant

For that accrued-interest question, both **amount** and **as-of date** are necessary. If either is missing, the agent reports the specific gap; it flags a suspect date rather than changing it. Even a complete dated record cannot be attributed to a loan until that association is established. Is that accurate?

For **Collateral Value as of a Date**, what should the agent do if the **value** is missing, and separately if its **as-of date** is missing or appears wrong?

### Turn 69 — user

Yes, the accrued-interest recap is accurate.

For a **collateral value as of a date**, the agent needs both pieces to report a dated appraisal:

- If the **value** is missing, report that no value is recorded for that dated valuation; don’t substitute a loan-to-value ratio for it.
- If the **as-of date** is missing, report that the valuation cannot be placed at a date. If the date appears inconsistent with the appraisal evidence, flag it rather than changing it.

Those gaps limit what the agent can answer about collateral value. They are **not additional pass conditions** for the secured-loan collateral-support review, which checks whether collateral is linked to the loan.

### Turn 69 — assistant

A dated collateral valuation needs both **value** and **as-of date** to answer the value question. Missing pieces are reported, and an apparently wrong date is flagged against appraisal evidence—not changed. Neither piece is an extra pass condition for the collateral-link review. Is that accurate?

For the **loan-to-value ratio** and **combined loan-to-value ratio**, what should the agent do if each ratio is missing or appears wrong? Is either required for the collateral-support review?

### Turn 70 — user

Yes, the dated-valuation recap is accurate.

For **either ratio**, report its recorded numeric percentage if present. If one is missing, report that specific ratio as not recorded; don’t substitute the other or calculate it without the necessary supporting values. If a ratio appears inconsistent with the relevant debt and appraisal evidence, flag it for review rather than changing it.

**Neither ratio is required for the collateral-support review.** That review checks the secured loan’s link to collateral, not its valuation or loan-to-value measures.

### Turn 70 — assistant

I’ll report each ratio independently, flag apparent conflicts with debt or appraisal evidence, and neither will block the collateral-support review. Is that accurate?

For **Prepayment Terms**, what should the agent do if the **prepayment penalty term in months** is missing or appears wrong when a penalty applies? What evidence tells it that the penalty applies without adding an unconfirmed yes/no field?

### Turn 71 — user

Yes, the ratio recap is accurate.

When the governing **prepayment terms** establish that a penalty applies, the agent should check whether the **prepayment penalty term in months** is recorded. If it is missing, the prepayment-terms review cannot confirm the penalty timing; report that gap. If the recorded period appears inconsistent with the governing terms, flag the discrepancy with that evidence rather than changing it.

The evidence that a penalty applies must come from the **governing terms**. We haven’t established a separate yes/no field, so the agent should not infer that a missing period means no penalty applies.

### Turn 71 — assistant

When the governing **Prepayment Terms** establish that a penalty applies, a missing **prepayment penalty term in months** prevents the timing review from confirming that item. The agent reports the gap or flags a conflict with the terms; it does not infer “no penalty” from a missing period. Is that accurate?

For the three optional Loan descriptions—**secured loan**, **collateralized loan**, and **guaranteed loan**—what should the agent do if each is absent or conflicts with the recorded support? In particular, which description, if any, determines that the collateral-support review is applicable?

### Turn 72 — user

Yes, your prepayment recap is accurate.

These three optional descriptions represent **kinds of loan**, not confirmed yes/no fields in the underlying records. If one is absent, report it as **not recorded**, not false or inapplicable. If a description conflicts with the recorded support or governing terms, flag the conflict with that evidence rather than silently changing the description.

For applicability, the collateral-support review takes a **secured loan**. So a recorded **secured loan** description can identify a loan for that review—even if it is described as secured solely by a guarantee. Without linked collateral, it cannot pass this *collateral* check; that result does not judge the guarantee. A **collateralized loan** description also points to pledged-collateral support, but the description alone never proves the collateral link. A **guaranteed loan** description identifies guarantee backing; it neither proves a guarantee valid nor supplies collateral.

If the descriptions are absent or conflicting and the governing evidence does not establish whether the loan is secured, the agent should report that it **cannot determine applicability**, rather than assume the loan is unsecured.

### Turn 72 — assistant

I’ll treat absent support descriptions as **unknown**, not false. A recorded **secured loan** description can make the collateral-support review applicable, including for a guarantee-only loan; without linked collateral, that particular check cannot pass. If the descriptions conflict or the governing evidence cannot establish whether the loan is secured, the agent reports that applicability is undetermined. It does not judge the guarantee.

That completes the missing-or-wrong-value checks: the reported gap depends on the question or review, rather than making every recorded value mandatory. Is that an accurate recap before we define the review rules?

### Turn 73 — user

Yes, that’s accurate. A missing or suspect value should be reported against the **particular question or review** that uses it; it doesn’t make every value mandatory for every loan.

For the review rules, we should keep each check’s applicability and required evidence separate from values the agent can simply report if recorded.

### Turn 73 — assistant

Agreed. I’ll keep **when a review applies** separate from **what evidence lets it confirm the check**; missing evidence should still allow the agent to run the review and report the gap.

For **assess loan readiness**, is the confirmation rule exactly this: the Loan has a Borrower and a Lender, and **if** it has Interest, applicable Interest Payment Terms govern payment of that Interest? Is anything else required to confirm this particular check?

### Turn 74 — user

The borrower and lender are required for that check. I’d change the interest condition slightly: **if the loan has a fixed or variable interest rate**, the applicable interest payment terms must govern payment of its interest. I wouldn’t use the mere presence of an Interest record as the trigger.

Nothing else we’ve discussed is a condition for confirming this particular readiness review. If one of those required links is missing, the agent can run the review but must report the gap rather than confirm readiness.

### Turn 74 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  loanReadinessConfirmed:\n    conditions:\n      - Loan has a Borrower.\n      - Loan has a Lender.\n      - If Loan has a Fixed Interest Rate or Variable Interest Rate, Loan has Interest and applicable Interest Payment Terms govern payment of that Interest."
}
```

### Turn 74 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 74 — assistant

I’ve recorded the readiness confirmation rule with your trigger: a **fixed or variable interest rate**, not merely an Interest record. Borrower and lender links are required; for a rate-bearing loan, the path through Interest to applicable Interest Payment Terms must also be present. No other condition was added. Is that accurate?

For **verify secured-loan support**, is the confirmation rule: first establish that the loan is secured, then confirm an actual **Loan → is collateralized by → Collateral** link? A guarantee-only secured loan could be reviewed but would not pass this collateral check.

### Turn 75 — user

Yes, that’s accurate for this **collateral-support** review. The input is a loan established as **secured**; confirmation requires an actual link showing that the secured loan **is collateralized by collateral**. A support description alone is not enough.

A guarantee-only secured loan can be assessed under this check but cannot pass it without linked collateral. Report the missing collateral link without drawing a conclusion about the guarantee’s validity.

### Turn 75 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  collateralSupportConfirmed:\n    conditions:\n      - Loan is established as secured through its recorded securedLoan description or governing evidence; if that cannot be established, applicability is undetermined.\n      - Secured Loan isCollateralizedBy Collateral through an actual recorded link; a support description alone does not satisfy this condition."
}
```

### Turn 75 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 75 — assistant

I’ve recorded the collateral-support rule: establish that the loan is secured, then require the actual collateral link. Missing collateral is reported without a conclusion about guarantee validity; if secured status cannot be established, applicability is undetermined. Is that accurate?

For **review variable-rate setup**, is the confirmation rule limited to **Loan → has interest rate → Variable Interest Rate** and **Loan → has interest rate reset schedule → Interest Rate Reset Schedule**? No numeric rate, cap, first-change term, or floating/managed detail required for this review?

### Turn 76 — user

Yes. To confirm the **variable-rate setup review**, the agent checks that the loan has a **variable interest rate** and an **interest rate reset schedule**. The numeric rate, cap, first-rate-change term, and floating-or-managed detail are not additional conditions for this review.

If the loan is known to be variable-rate but the reset schedule is missing, report that gap rather than confirm the setup. If the rate type itself cannot be established, don’t assume the review applies.

### Turn 76 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  variableRateSetupConfirmed:\n    conditions:\n      - Loan hasInterestRate Variable Interest Rate; if variable-rate status cannot be established, applicability is undetermined.\n      - Loan hasInterestRateResetSchedule Interest Rate Reset Schedule through a recorded link."
}
```

### Turn 76 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 76 — assistant

I’ve recorded that rule using only the **variable-rate link** and **rate-reset-schedule link**. A known variable-rate loan missing the schedule gets a reported gap; an unknown rate type does not make the review applicable by assumption. Is that accurate?

For **review payment-record completeness**, is confirmation limited to **Loan → Payment History → at least one Individual Payment Transaction**? Does “contains individual payments” require one or more transactions, rather than merely an empty history record?

### Turn 77 — user

Yes. For this review, the loan needs a **payment history**, and that history needs **at least one individual payment transaction**. An empty history record does not confirm that payment entries are present.

If either level is missing, report which one is absent. This is a trackability check; it doesn’t establish whether payments were due, timely, correctly allocated, or sufficient.

### Turn 77 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  paymentRecordCompletenessConfirmed:\n    conditions:\n      - Loan hasPaymentHistory Payment History through a recorded link.\n      - That Payment History hasIndividualPayments at least one Individual Payment Transaction."
}
```

### Turn 77 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 77 — assistant

I’ve recorded the payment-record rule with **both** levels required: a linked history and at least one individual transaction in it. It says nothing about timeliness, allocation, or sufficiency. Is that accurate?

For **review prepayment terms**, is confirmation: the governing **Prepayment Terms** establish that a penalty applies, and those terms have a recorded **prepayment penalty term in months**? If penalty applicability cannot be established from the terms, should the review report that as undetermined rather than pass or fail?

### Turn 78 — user

Yes, the payment-record recap is accurate.

For the **prepayment-terms review**, first use the governing prepayment terms to establish whether a penalty applies. If it does, confirm that the **prepayment penalty term in months** is recorded. If that timing is missing, report the gap rather than confirm it. If the terms don’t establish whether a penalty applies, report applicability as **undetermined**—don’t treat a missing period as evidence that there is no penalty.

### Turn 78 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  prepaymentTimingConfirmed:\n    conditions:\n      - The governing Prepayment Terms establish that a prepayment penalty applies; if they do not establish applicability, report it as undetermined rather than infer it from a missing value.\n      - Those Prepayment Terms have a recorded prepaymentPenaltyTermInMonths."
}
```

### Turn 78 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 78 — assistant

I’ve recorded the five review rules. Each separates applicability from the evidence needed to confirm the check; a missing link or value is reported, not silently treated as a different account state. The prepayment rule, in particular, does not infer “no penalty” from a missing period. Is that an accurate recap of the rules?

Next I’ll specify each review action’s input, reported outcome, and how the agent verifies the evidence it checked—without giving it authority to change the loan.

### Turn 79 — user

Yes, that’s an accurate recap. The five reviews report whether the applicable evidence supports confirmation, what is missing, or whether applicability cannot be determined. They do not change the loan or create an account status.

For each action, we can specify the loan it takes as input, the evidence it checks, and the outcome it reports and retains.

### Turn 79 — assistant

For **assess loan readiness**, I propose **Loan** as the input and **loanReadinessConfirmed** as the confirmation rule. The action would report either “confirmed” with the borrower, lender, and applicable interest-terms links it checked, or the specific missing links. It would then recheck those links to verify the report, without changing the loan.

Is that the outcome and verification you want for this action?

### Turn 80 — user

Yes, in substance. I’d describe the result as **core loan setup confirmed**, rather than as a new status on the loan.

The input is the loan. The action checks its borrower and lender links and, if it has a fixed or variable interest rate, that applicable interest payment terms govern its interest. It reports confirmation or identifies the missing links. Verification means confirming those same links in the records and retaining them as evidence; it needn’t perform a second, separate review or change the loan.

### Turn 80 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  assessLoanReadiness:\n    input: Loan\n    preconditions: [loanReadinessConfirmed]\n    effect: Report core loan setup confirmed when the rule holds, or identify the missing borrower, lender, interest, or applicable interest-payment-terms links; do not change the loan.\n    verification: Confirm the checked Loan hasBorrower Borrower and hasLender Lender links and, when Loan hasInterestRate Fixed Interest Rate or Variable Interest Rate, confirm Loan hasInterest Interest governed by applicable Interest Payment Terms; retain those links as evidence."
}
```

### Turn 80 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "assessLoanReadiness" has input class Loan, and its precondition loanReadinessConfirmed refers to Interest Payment Terms, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Loan to Interest Payment Terms. Rewording the text does not create the path it assumes.

### Turn 80 — assistant

I’ve recorded **assess loan readiness** as a reporting action on Loan: it confirms core setup or names missing links, and retains the links it checked as evidence. It does not change the loan. Is that accurate?

The canvas flagged one navigation warning: its check needs to find **Interest Payment Terms** from a Loan, but the confirmed path runs through Interest and then follows the **“governs payment of”** link backwards. I won’t add a direct loan-to-terms link you ruled out. In the records the agent uses, can it look up the terms that **govern a given loan’s Interest** by following that incoming link?

### Turn 81 — user

Yes. Given the loan’s **interest**, the agent can look for **interest payment terms that govern payment of that interest**—following the confirmed connection in reverse. It does not need a direct loan-to-terms connection.

Whether a particular system supports that lookup is an implementation question. For this review, if the agent cannot find and verify the applicable terms, it should report that gap rather than confirm the interest-terms part of readiness.

### Turn 81 — assistant

Yes—the agent can look up **Interest Payment Terms** that govern the loan’s Interest by following the confirmed link in reverse. I won’t add a direct loan-to-terms link. The canvas warning assumes only forward navigation; your clarification establishes the intended lookup, while an implementation that cannot perform it must report the terms as unverified.

I need to correct one action detail before the next review: I set **loanReadinessConfirmed** as a precondition, which could prevent the action from running precisely when a link is missing. Should the action instead require only a supplied Loan to run, then evaluate **loanReadinessConfirmed** and report either confirmation or the gaps?

### Turn 82 — user

Yes—for **running the diagnostic review**, a supplied loan is enough. It must be able to run when a link is missing so it can report the gap.

Keep the confirmation condition separate: **core loan setup is confirmed only when** the borrower and lender links are present and, for a loan with a fixed or variable rate, applicable interest payment terms govern its interest. If that condition fails, the action reports what it could not verify; it does not produce a confirmation or change the loan.

### Turn 82 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  assessLoanReadiness:\n    input: Loan\n    preconditions: []\n    effect: Evaluate loanReadinessConfirmed for the supplied Loan; report core loan setup confirmed only when it holds, otherwise report the missing or unverified required links; do not change the loan.\n    verification: Confirm the checked Loan hasBorrower Borrower and hasLender Lender links and, when Loan hasInterestRate Fixed Interest Rate or Variable Interest Rate, confirm Loan hasInterest Interest governed by applicable Interest Payment Terms using an incoming governsPaymentOf link; retain the verified links as evidence."
}
```

### Turn 82 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 82 — assistant

I’ve corrected **assess loan readiness**: it can run with a supplied Loan even when evidence is missing. It evaluates the separate confirmation rule and reports either **core loan setup confirmed** or the specific unverified links, retaining the checked evidence. It does not change the loan.

The earlier navigation warning remains because the tool does not recognize the reverse lookup you confirmed; I have not added a direct link to silence it.

For the other four reviews, should each likewise run with a **Loan** as input, evaluate its existing confirmation rule, report confirmation or the specific gap or undetermined applicability, and verify by retaining the exact links or term values checked—without changing the loan?

### Turn 83 — user

Yes, that’s the right **diagnostic pattern**, with one input distinction: the collateral-support review takes a loan established as a **secured loan**. The variable-rate, payment-record, and prepayment reviews take a loan, then determine whether their particular check applies.

Each can run to find missing evidence. It reports confirmation only when its check is met; otherwise it identifies the missing link or term value, or says applicability is undetermined where the facts don’t establish it. Verification is by checking and retaining the exact rate and schedule links, collateral link, payment-history entries, or prepayment timing used for the result. None of the reviews changes the loan.

### Turn 83 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  verifySecuredLoanSupport:\n    input: Loan\n    preconditions: []\n    effect: For a Loan established as secured, evaluate collateralSupportConfirmed and report collateral support confirmed only when an actual isCollateralizedBy link is verified; otherwise report the missing collateral link or undetermined applicability without judging guarantee support or changing the loan.\n    verification: Check and retain the evidence establishing securedLoan applicability and the actual Loan isCollateralizedBy Collateral link, if present.\n  reviewVariableRateSetup:\n    input: Loan\n    preconditions: []\n    effect: Evaluate variableRateSetupConfirmed and report variable-rate setup confirmed only when both links are verified; otherwise report the missing reset schedule or undetermined applicability without changing the loan.\n    verification: Check and retain the Loan hasInterestRate Variable Interest Rate and Loan hasInterestRateResetSchedule Interest Rate Reset Schedule links used for the result.\n  reviewPaymentRecordCompleteness:\n    input: Loan\n    preconditions: []\n    effect: Evaluate paymentRecordCompletenessConfirmed and report payment-record completeness confirmed only when the history and at least one individual transaction are linked; otherwise report which level is missing without changing the loan or judging payment timeliness or sufficiency.\n    verification: Check and retain the Loan hasPaymentHistory Payment History link and that history's hasIndividualPayments Individual Payment Transaction links used for the result.\n  reviewPrepaymentTerms:\n    input: Loan\n    preconditions: []\n    effect: Evaluate prepaymentTimingConfirmed using the Prepayment Terms governing the Loan's Principal; confirm penalty timing only when a penalty applies and prepaymentPenaltyTermInMonths is recorded, otherwise report the missing value or undetermined applicability without changing the loan.\n    verification: Check and retain Loan hasPrincipal Principal, the applicable Prepayment Terms governsPaymentOf Principal link, the governing terms' evidence of penalty applicability, and their prepaymentPenaltyTermInMonths value when present."
}
```

### Turn 83 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] effect-verification-mismatch — Action "verifySecuredLoanSupport" verifies Loan.securedLoan, but its effect never says that property changes. Either say in the effect what sets it, or verify something the effect actually does.
  [warning] unreachable-from-action-input — Action "reviewPrepaymentTerms" has input class Loan, and its effect refers to Prepayment Terms, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Loan to Prepayment Terms. Rewording the text does not create the path it assumes.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 83 — assistant

I’ve recorded the other four reviews as **diagnostic actions**. Each takes a Loan as its one input; the collateral review proceeds when that loan is established as secured. Each reports confirmation only when its separate rule is met, retains the evidence checked, and leaves the loan unchanged. Is that accurate?

The canvas raised two warnings. One expects the collateral review to *change* the secured-loan description because it checks it; that does not fit a read-only review, so I’m leaving that warning noted. The other concerns finding **Prepayment Terms** from a Loan when the confirmed “governs payment of” link points from the terms to Principal. As with interest payment terms, can the agent look up applicable **Prepayment Terms** through the Loan’s Principal by following that link in reverse?

### Turn 84 — user

Yes, your action recap is accurate, including the secured-loan qualification for the collateral review. Checking a support description does not change it.

For prepayment, the agent can follow **Loan → Principal**, then look in reverse for the **prepayment terms that govern payment of that principal**. It needn’t add a direct loan-to-prepayment-terms link. If it cannot find and verify the applicable terms, it should report that gap rather than infer whether a penalty applies.

### Turn 84 — assistant

Confirmed: the prepayment review reaches the terms through **Loan → Principal**, then looks up the applicable Prepayment Terms through the incoming **governs payment of** link. It does not need a direct loan-to-terms link. If the terms cannot be verified, the review reports that gap. The canvas’s forward-navigation warning remains, but it does not justify changing the relationship you confirmed.

The five diagnostic actions are recorded. Before validation, I need to make one bounded check for nearby structures we may have missed. For **Loan**, beyond the parties, terms, schedules, rates, payment history, and support already covered, are there any **lifecycle stages, related agreements, or measurements** the agent needs for one of these questions or reviews? “No, that’s covered” is fine.

### Turn 85 — user

No additional **lifecycle stage** is needed for the five reviews. There are a few loan details worth keeping alongside the questions already captured: the **maturity date**, **initial funding date**, **principal amount**, and **loan balance**. They help answer what was agreed and what remains outstanding, but they are not extra conditions for those reviews.

If the agent is also to describe the loan’s repayment structure, it should be able to report whether the loan is **interest-only**, permits **negative amortization**, or has a **balloon payment**. Those are distinct features, not substitutes for the applicable terms and schedules. I wouldn’t add another related agreement or measurement as a requirement for confirming any of the five reviews.

### Turn 85 — assistant

For **Loan**, there’s no additional lifecycle stage or agreement needed for the five reviews. You’ve raised four loan figures and three repayment-structure features as possible *reporting* requirements; I haven’t added them, since none is an extra review condition.

Should the agent answer these four separate questions: **When did the loan first fund? When does it mature? What is its principal amount? What is its current loan balance?**

### Turn 86 — user

Yes, as four separate reporting questions. I’d word the first and last a little carefully:

- **What is the loan’s initial exchange date?** That is the recorded date for initial funding; I wouldn’t use it as proof that funds actually moved.
- **What is its maturity date?**
- **What is its principal amount?**
- **What loan balance is recorded?** Without a balance as-of date established here, I wouldn’t promise that the figure is current.

None is an additional condition for the five reviews.

### Turn 86 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What is a loan's initial exchange date?\n  - text: What is a loan's maturity date?\n  - text: What is a loan's principal amount?\n  - text: What loan balance is recorded?"
}
```

### Turn 86 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 86 — assistant

I’ve recorded those four reporting questions. **Initial exchange date** is a recorded date, not proof that funds moved; **loan balance** is the recorded figure, not necessarily a current balance. None changes the five review conditions.

Should the agent also answer, as three separate questions, whether a loan is **interest-only**, permits **negative amortization**, and has a **balloon payment**?

### Turn 87 — user

Yes, keep them as three separate questions. They describe different repayment features: **interest-only** payments do not pay down principal during the interest-only period; **negative amortization** allows the amount owed to grow when payments don’t cover interest; and a **balloon payment** leaves a larger amount due at the end. Report each feature as recorded, without inferring one from another or making any of them an extra condition for the five reviews.

### Turn 87 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Is a loan recorded as interest-only?\n  - text: Is a loan recorded as permitting negative amortization?\n  - text: Is a loan recorded as having a balloon payment?"
}
```

### Turn 87 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 87 — assistant

I’ve recorded the three repayment-feature questions separately. They are reporting questions, not review conditions, and one feature must not be inferred from another.

For these seven new Loan questions, are the values recorded **on Loan** under these names: **initial exchange date**, **maturity date**, **principal amount**, **loan balance**, **interest-only**, **negative amortization**, and **balloon payment**? For the last three, would an optional true/false description preserve what is recorded, with an absent value left unknown?

### Turn 88 — user

Yes. Those seven values belong **on the loan** under those names. **Initial exchange date** and **maturity date** are dates; **principal amount** and **loan balance** are numeric amounts. **Interest-only**, **negative amortization**, and **balloon payment** are true/false features. If one of those feature values is absent, leave it **unknown** rather than treating it as false.

The initial exchange date is not, by itself, evidence that funding occurred, and a loan balance without a stated as-of date shouldn’t be presented as necessarily current. None of these seven values is an added pass condition for the five reviews.

### Turn 88 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      initialExchangeDate:\n        type: date\n      maturityDate:\n        type: date\n      principalAmount:\n        type: number\n      loanBalance:\n        type: number\n      interestOnly:\n        type: boolean\n      negativeAmortization:\n        type: boolean\n      balloonPayment:\n        type: boolean"
}
```

### Turn 88 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 88 — assistant

I’ve recorded the seven values on Loan under your names. Absent true/false features remain unknown; initial exchange date does not prove funding, and loan balance is not labeled current without an as-of date. None is a review condition.

For the new values, what should the agent do when a **date or amount** is missing or appears wrong? Please address **initial exchange date, maturity date, principal amount, and loan balance** briefly, one by one.

### Turn 89 — user

For each, report the recorded value or the specific gap; don’t fill it from another loan figure or date.

- **Initial exchange date:** If missing, say it isn’t recorded. If it conflicts with the governing terms, flag it; even a recorded date doesn’t prove funds moved.
- **Maturity date:** If missing, say it isn’t recorded. Flag an apparent conflict with the agreed maturity terms.
- **Principal amount:** If missing, report that gap; don’t substitute the loan balance. Flag a conflict with the agreed principal.
- **Loan balance:** If missing, report that gap; don’t substitute principal amount. Flag an apparent conflict with the available balance evidence, and don’t call the figure *current* without evidence of when it applies.

None of these gaps changes the five review conditions.

### Turn 89 — assistant

For each of those four values, the agent reports the recorded value or its specific absence and flags an apparent conflict with the relevant evidence. It does not substitute principal amount for loan balance, infer funding from initial exchange date, or call an undated balance current. None affects the five reviews. Is that accurate?

For **interest-only**, **negative amortization**, and **balloon payment**, what should it report if each is missing or conflicts with the agreed terms? A short answer for each will settle their boundaries.

### Turn 90 — user

Yes, that recap is accurate.

- **Interest-only:** If unrecorded, say the feature is unknown. If its recorded value conflicts with the agreed repayment terms, flag the conflict.
- **Negative amortization:** If unrecorded, say whether it’s permitted is unknown. If the value conflicts with the agreed terms, flag it; don’t infer permission merely from a rising balance.
- **Balloon payment:** If unrecorded, say whether one is included is unknown. If it conflicts with the agreed terms, flag it; don’t infer one solely from a remaining balance.

None is an additional condition for the five reviews.

### Turn 90 — assistant

Yes. For each repayment feature, an unrecorded value remains unknown; a recorded value that conflicts with the agreed terms is flagged. A rising balance alone does not establish negative-amortization permission, and a remaining balance alone does not establish a balloon payment. None changes the five reviews.

Continuing the bounded check: for **Credit Facility**, beyond its borrower, lender, sub-facilities, and four separate credit figures, are there any **related terms or stages of drawing credit** the agent needs for the facility questions already captured? “No, that’s covered” is fine.

### Turn 91 — user

For the facility questions we’ve captured, **no additional drawing stage or set of terms is needed**. The agent can report the borrower, lender, sub-facilities, and four credit figures without treating a draw as a separate required stage.

If you later want to ask what *kind* of facility it is, I’d distinguish a **revolving line of credit**, where funds can be repaid and drawn again, from whether the facility is **committed or uncommitted**. Those descriptions don’t add a condition to the current questions.

### Turn 91 — assistant

For the current facility questions, I’ll add no draw stage or governing-terms record. I’ll also leave revolving and committed/uncommitted descriptions out for now: you’ve identified them as possible **later questions**, not requirements of the questions or five reviews we’re modeling. Is that accurate?

For **Payment History**, beyond its individual transactions, is there any related record or measurement the agent needs to answer the captured payment questions or run the payment-record review? An allocation or due amount would matter to the still-open comparison question, but I won’t add either without evidence that it is available.

### Turn 92 — user

Yes, that’s accurate for the current facility questions.

For **payment history**, no additional record or measurement is needed to answer what history exists, identify its individual payments, or run the payment-record completeness review. That review checks for a linked history with individual payment entries.

The paid-versus-due comparison remains open. We haven’t established payment allocations, scheduled due amounts, or a match between a transaction and a scheduled payment, so the agent should not claim that comparison from the history alone.

### Turn 92 — assistant

For **Payment History**, the recorded history and individual entries are enough for the completeness review. The paid-versus-due comparison stays open because allocation, due amounts, and a match to scheduled payments have not been established.

For **Collateral**, beyond its loan link, security agreement, dated value, and the loan’s two ratios, are there any **responsible parties, related agreements, or measurements** the agent needs for the captured collateral questions? “No, that’s covered” is fine.

### Turn 93 — user

For the captured **pledged-collateral** questions, no further responsible party or measurement is needed. The agent can use the loan’s collateral link, the security agreement that secures the collateral, its dated value, and the two distinct ratios where recorded.

If you extend the **third-party support** question to credit enhancement agreements, there is a separate **beneficiary**—the party protected by that agreement. That is worth identifying for that question, but it is not an extra condition for the collateral-link review, and it does not establish that a guarantee is valid.

### Turn 93 — assistant

For the pledged-collateral questions, I’ll add no further party or measurement. You’ve raised **beneficiary** as a possible extension to the separate third-party-support question, not as part of the collateral-link review.

Does the existing question **“Is a loan supported by a third-party guarantee, separately from any pledged collateral?”** require the agent to identify a **credit enhancement agreement and its beneficiary**, or would that be a different question outside the current scope?

### Turn 94 — user

No. The existing question asks whether the loan is **described as guarantee-backed**, separately from pledged collateral. It does not, by itself, require the agent to identify a credit enhancement agreement or its beneficiary—and that description does not verify the guarantee.

Identifying **which credit enhancement agreement applies and who benefits from it** would be a separate question if you extend the scope. It is not part of the five reviews we’ve defined.

### Turn 94 — assistant

Understood. The existing guarantee question only asks whether the loan is **described** as guarantee-backed; it does not require an agreement or beneficiary, and it cannot verify the guarantee. I’ll leave that possible extension out.

For **Interest and Interest Payment Terms**, beyond the rate, day-count convention, accrued-interest record, and schedules already discussed, are there any **related stages or characteristic values** needed for the captured interest questions? “No, that’s covered” is fine.

### Turn 95 — user

For the **captured interest questions**, no further stage or characteristic value is needed. The rate and any recorded variable-rate features answer the rate questions; the interest payment terms provide the day-count convention; and the applicable schedules answer when interest is due, calculated, or reset.

The **accrued-interest-to-loan association remains unresolved**. An amount and as-of date still cannot answer the question for a particular loan without evidence tying that record to it.

### Turn 95 — assistant

No additional interest stage or value is needed. The accrued-interest question remains **partly unsupported**: amount and as-of date are recorded, but no association to a particular loan has been established.

For **Principal and Prepayment Terms**, beyond the repayment-terms path and the penalty period when applicable, are there any **related stages or characteristic values** needed for the captured questions or the prepayment review? “No, that’s covered” is fine.

### Turn 96 — user

No additional stage or value is needed for the captured principal questions or the prepayment review. The agent can follow the loan’s **principal** to the terms that govern its repayment, then check the penalty period in the applicable prepayment terms when a penalty applies.

Principal can also have an **outstanding amount**, distinct from the loan’s principal amount and recorded loan balance. That could support a separate reporting question, but it is not an extra condition for this review.

### Turn 96 — assistant

No additional principal stage or value is needed for the captured questions or prepayment review. **Outstanding principal** would be a distinct figure, not another name for the loan’s principal amount or recorded balance.

Should **“What outstanding principal amount is recorded for a loan?”** be added as a question the agent must answer now, or is it only a possible later extension?

### Turn 97 — user

I’d add it now as a separate **reporting question**, since tracking what remains outstanding is part of this scope. The agent would follow the loan to its **principal** and report that principal’s **outstanding amount**, if recorded.

Keep it distinct from the loan’s **principal amount** and **loan balance**. A missing outstanding amount is a reporting gap, not a failure of any of the five reviews; without an as-of date, don’t present it as necessarily current.

### Turn 97 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What outstanding principal amount is recorded for a loan, if any?\nclasses:\n  Principal:\n    properties:\n      outstandingAmount:\n        type: number"
}
```

### Turn 97 — tool

Applied. Added 1, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 97 — assistant

I’ve added the reporting question and **outstanding amount** on Principal. The agent follows **Loan → Principal** to report it if recorded; it remains distinct from the loan’s principal amount and loan balance. Without an as-of date, it must not call the figure current, and a missing value does not affect the five reviews.

If the recorded outstanding amount appears wrong, what evidence should the agent check or cite before flagging it?

### Turn 98 — user

Check the **governing principal repayment terms** and the available **payment history**, including individual payment entries, for evidence that the recorded outstanding amount may be inconsistent. Cite the specific records behind the concern.

But don’t recompute or “correct” outstanding principal from those entries alone: we haven’t established payment allocations, dates, or a complete balance reconciliation. If the evidence is insufficient, report that the amount cannot be verified rather than calling it wrong.

### Turn 98 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

That gives the outstanding-principal question a careful boundary: the agent can cite the governing principal repayment terms and payment history when checking a suspect amount, but cannot recalculate it from payment entries whose allocations and dates are not established. If the evidence is insufficient, it reports the amount as unverified, not wrong.

The bounded expansion pass has added the confirmed loan reporting questions and outstanding principal; no other neighboring records were needed for the major concepts we checked. Is that an accurate recap? I’ll now replay every recorded question and action against the live model and identify what is still unsupported.

### Turn 98 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit facility?
  - id: cq2
    text: Who is the lender for a loan or credit facility?
  - id: cq3
    text: "Who services a loan on the lender's behalf?"
  - id: cq4
    text: Which terms govern principal repayment for a loan?
  - id: cq5
    text: Which terms govern interest payment for a loan?
  - id: cq6
    text: "Which payment, amortization, principal, interest, or rate-reset schedules are associated with a loan?"
  - id: cq7
    text: What is the credit limit of a credit facility?
  - id: cq8
    text: Does a credit facility have sub-facilities?
  - id: cq9
    text: What payment history is recorded for a loan?
  - id: cq10
    text: "Which individual payment transactions, including fees and other related amounts, make up a loan's payment history?"
  - id: cq11
    text: "What principal and interest payments are recorded for a loan, and what do the applicable schedules say was due?"
  - id: cq12
    text: "What interest rate applies to a loan, and is it fixed or variable?"
  - id: cq13
    text: "For a variable-rate loan, what reset schedule applies, and what cap or first-rate-change term is recorded, if any?"
  - id: cq14
    text: "For a variable-rate loan, is its rate floating against an index or benchmark, or managed by the institution, where that rate type is recorded?"
  - id: cq15
    text: How much interest has accrued but remains unpaid for a loan as of a given date?
  - id: cq16
    text: "Which day-count convention in the applicable interest payment terms governs a loan's interest accrual?"
  - id: cq17
    text: Is a loan supported by pledged collateral?
  - id: cq18
    text: "Which collateral is linked to a secured loan, and which security agreement secures that collateral?"
  - id: cq19
    text: "For a collateralized loan, what collateral value and as-of date are recorded?"
  - id: cq20
    text: "For a collateralized loan, what loan-to-value measure is recorded?"
  - id: cq21
    text: "For a collateralized loan, what combined loan-to-value measure is recorded?"
  - id: cq22
    text: "Is a loan supported by a third-party guarantee, separately from any pledged collateral?"
  - id: cq23
    text: "If a loan is marked as secured by collateral, is collateral linked so its support check can pass?"
  - id: cq24
    text: What amount of credit has already been extended under a credit facility?
  - id: cq25
    text: What amount of credit remains available under a credit facility?
  - id: cq26
    text: "What maximum advance amount is recorded for a credit facility, if any?"
  - id: cq27
    text: "When is interest scheduled to be calculated for a loan, if an interest calculation schedule is recorded?"
  - id: cq28
    text: "What is a loan's initial exchange date?"
  - id: cq29
    text: "What is a loan's maturity date?"
  - id: cq30
    text: "What is a loan's principal amount?"
  - id: cq31
    text: What loan balance is recorded?
  - id: cq32
    text: Is a loan recorded as interest-only?
  - id: cq33
    text: Is a loan recorded as permitting negative amortization?
  - id: cq34
    text: Is a loan recorded as having a balloon payment?
  - id: cq35
    text: "What outstanding principal amount is recorded for a loan, if any?"
classes:
  Loan:
    meaning: "An account whose repayment, payments, interest, and servicing are tracked."
    aliases: []
    properties:
      firstRateChangeTermInMonths:
        type: number
        unit: months
      interestRateCap:
        type: number
      collateralizedLoan:
        type: boolean
      guaranteedLoan:
        type: boolean
      securedLoan:
        type: boolean
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
      principalAmount:
        type: number
      loanBalance:
        type: number
      interestOnly:
        type: boolean
      negativeAmortization:
        type: boolean
      balloonPayment:
        type: boolean
  Credit Facility:
    meaning: An arrangement letting a borrower draw credit over time that may contain sub-facilities.
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      amountOfCreditExtended:
        type: number
      availableAmount:
        type: number
      maximumAdvanceAmount:
        type: number
  Borrower:
    meaning: The party obliged to repay money or credit.
    aliases: []
    properties: {}
  Lender:
    meaning: The party extending money or credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party collecting principal and interest payments on a lender's behalf."
    aliases: []
    properties: {}
  Interest Payment Terms:
    meaning: Terms governing interest payment and specifying the accrual basis through a day-count convention.
    aliases: []
    properties: {}
  Principal Repayment Terms:
    meaning: Terms governing repayment of principal separately from interest payment.
    aliases: []
    properties: {}
  Loan Payment Schedule:
    meaning: The regular or explicit payment schedule for a loan.
    aliases: []
    properties: {}
  Amortization Schedule:
    meaning: "A schedule showing how scheduled payments change a loan's debt balance over time."
    aliases: []
    properties: {}
  Principal Payment Schedule:
    meaning: A schedule giving the dates when loan principal is due.
    aliases: []
    properties: {}
  Interest Payment Schedule:
    meaning: A schedule giving the dates when loan interest is due.
    aliases: []
    properties: {}
  Interest Rate Reset Schedule:
    meaning: "A schedule giving the dates when a loan's variable interest rate is recalculated."
    aliases: []
    properties: {}
  Interest Calculation Schedule:
    meaning: "A schedule giving the dates when interest is calculated for a loan, distinct from payment due dates and rate-reset dates."
    aliases: []
    properties: {}
  Payment History:
    meaning: "A loan's record of payments made toward its repayment obligation."
    aliases: []
    properties: {}
  Individual Payment Transaction:
    meaning: "An actual individual payment recorded within a payment history that may cover principal, interest, fees, or other related amounts."
    aliases:
      - payment transaction
    properties: {}
  Fixed Interest Rate:
    meaning: A fixed numeric interest rate that applies to a loan.
    aliases: []
    properties:
      rate:
        type: number
  Variable Interest Rate:
    meaning: A numeric interest rate that applies to a loan and can change over time.
    aliases: []
    properties:
      rate:
        type: number
      moreSpecificRateType:
        type: text
        allowed:
          - floating
          - managed
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  Security Agreement:
    meaning: An agreement granting a financial interest in collateral and setting out relevant rights and duties.
    aliases: []
    properties: {}
  Sub-facility:
    meaning: "A portion of a credit facility available for a particular purpose, potentially on its own schedule."
    aliases: []
    properties: {}
  Prepayment Terms:
    meaning: "Terms governing repayment of loan principal before maturity, including penalty timing when a penalty applies."
    aliases: []
    properties:
      prepaymentPenaltyTermInMonths:
        type: number
        unit: months
  Accrued Interest:
    meaning: "A dated amount of interest accrued but unpaid on a loan, distinct from the rate, principal balance, and calculation schedule."
    aliases: []
    properties:
      amount:
        type: number
      asOfDate:
        type: date
  Collateral Value as of a Date:
    meaning: A dated valuation of collateral with its value and as-of date kept together.
    aliases:
      - Collateral Valuation
    properties:
      value:
        type: number
      asOfDate:
        type: date
  Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan comparing its principal with appraised collateral value.
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  Combined Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan considering total debt secured by the asset or assets.
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  Interest:
    meaning: "The cost of using credit on a loan, whose payment is governed by interest payment terms."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of a loan to be repaid apart from interest, whose repayment is governed by principal repayment terms."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  Day-count Convention:
    meaning: The accrual basis specified by interest payment terms for calculating interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The loan has the party obliged to repay it as its borrower.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The loan has the party financing it as its lender.
    aliases: []
  - name: hasBorrower
    from: Credit Facility
    to: Borrower
    meaning: The facility has the party who may draw under it as its borrower.
    aliases: []
  - name: hasLender
    from: Credit Facility
    to: Lender
    meaning: The facility has the party providing it as its lender.
    aliases: []
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "A loan is serviced by the party collecting principal and interest payments on the lender's behalf."
    aliases:
      - has servicer
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "A loan has interest, when it bears interest."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: A loan has principal that must be repaid apart from interest.
    aliases: []
  - name: governsPaymentOf
    from: Interest Payment Terms
    to: Interest
    meaning: "Interest payment terms govern payment of the loan's interest."
    aliases: []
  - name: governsPaymentOf
    from: Principal Repayment Terms
    to: Principal
    meaning: "Principal repayment terms govern repayment of the loan's principal."
    aliases: []
  - name: governsPaymentOf
    from: Prepayment Terms
    to: Principal
    meaning: Prepayment terms govern repayment of principal before maturity when they apply.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: Loan Payment Schedule
    meaning: A loan has an associated loan payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasAmortizationSchedule
    from: Loan
    to: Amortization Schedule
    meaning: A loan has an associated amortization schedule when one applies.
    aliases:
      - has schedule
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: Principal Payment Schedule
    meaning: A loan has an associated principal payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestPaymentSchedule
    from: Loan
    to: Interest Payment Schedule
    meaning: A loan has an associated interest payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestRateResetSchedule
    from: Loan
    to: Interest Rate Reset Schedule
    meaning: A loan has an associated rate reset schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestCalculationSchedule
    from: Loan
    to: Interest Calculation Schedule
    meaning: A loan has an interest calculation schedule specifying when interest is scheduled to be calculated.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: Payment History
    meaning: A loan has a history recording payments made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: Payment History
    to: Individual Payment Transaction
    meaning: "A payment history has individual payment transactions, including those toward principal, interest, fees, or related amounts."
    aliases:
      - contains individual payment transaction
  - name: hasInterestRate
    from: Loan
    to: Fixed Interest Rate
    meaning: A loan has an applicable fixed interest rate carrying its numeric rate.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: Variable Interest Rate
    meaning: A loan has an applicable variable interest rate carrying its numeric rate.
    aliases: []
  - name: isCollateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by an asset pledged as its security.
    aliases:
      - has collateral
  - name: secures
    from: Security Agreement
    to: Collateral
    meaning: A security agreement secures the pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasCollateralValueAsOfAdate
    from: Collateral
    to: Collateral Value as of a Date
    meaning: Collateral has a dated valuation recording its value as of a date.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: Loan-to-Value Ratio
    meaning: A collateralized loan has a loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: Combined Loan-to-Value Ratio
    meaning: A collateralized loan has a combined loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasSubFacility
    from: Credit Facility
    to: Sub-facility
    meaning: A credit facility has a portion available under it for a particular purpose when sub-facilities exist.
    aliases: []
  - name: hasAccrualBasis
    from: Interest Payment Terms
    to: Day-count Convention
    meaning: Interest payment terms have an accrual basis expressed by a day-count convention.
    aliases: []
rules:
  loanReadinessConfirmed:
    conditions:
      - Loan has a Borrower.
      - Loan has a Lender.
      - "If Loan has a Fixed Interest Rate or Variable Interest Rate, Loan has Interest and applicable Interest Payment Terms govern payment of that Interest."
  collateralSupportConfirmed:
    conditions:
      - "Loan is established as secured through its recorded securedLoan description or governing evidence; if that cannot be established, applicability is undetermined."
      - Secured Loan isCollateralizedBy Collateral through an actual recorded link; a support description alone does not satisfy this condition.
  variableRateSetupConfirmed:
    conditions:
      - "Loan hasInterestRate Variable Interest Rate; if variable-rate status cannot be established, applicability is undetermined."
      - Loan hasInterestRateResetSchedule Interest Rate Reset Schedule through a recorded link.
  paymentRecordCompletenessConfirmed:
    conditions:
      - Loan hasPaymentHistory Payment History through a recorded link.
      - That Payment History hasIndividualPayments at least one Individual Payment Transaction.
  prepaymentTimingConfirmed:
    conditions:
      - "The governing Prepayment Terms establish that a prepayment penalty applies; if they do not establish applicability, report it as undetermined rather than infer it from a missing value."
      - Those Prepayment Terms have a recorded prepaymentPenaltyTermInMonths.
actions:
  assessLoanReadiness:
    input: Loan
    preconditions: []
    effect: "Evaluate loanReadinessConfirmed for the supplied Loan; report core loan setup confirmed only when it holds, otherwise report the missing or unverified required links; do not change the loan."
    verification: "Confirm the checked Loan hasBorrower Borrower and hasLender Lender links and, when Loan hasInterestRate Fixed Interest Rate or Variable Interest Rate, confirm Loan hasInterest Interest governed by applicable Interest Payment Terms using an incoming governsPaymentOf link; retain the verified links as evidence."
  verifySecuredLoanSupport:
    input: Loan
    preconditions: []
    effect: "For a Loan established as secured, evaluate collateralSupportConfirmed and report collateral support confirmed only when an actual isCollateralizedBy link is verified; otherwise report the missing collateral link or undetermined applicability without judging guarantee support or changing the loan."
    verification: "Check and retain the evidence establishing securedLoan applicability and the actual Loan isCollateralizedBy Collateral link, if present."
  reviewVariableRateSetup:
    input: Loan
    preconditions: []
    effect: Evaluate variableRateSetupConfirmed and report variable-rate setup confirmed only when both links are verified; otherwise report the missing reset schedule or undetermined applicability without changing the loan.
    verification: Check and retain the Loan hasInterestRate Variable Interest Rate and Loan hasInterestRateResetSchedule Interest Rate Reset Schedule links used for the result.
  reviewPaymentRecordCompleteness:
    input: Loan
    preconditions: []
    effect: Evaluate paymentRecordCompletenessConfirmed and report payment-record completeness confirmed only when the history and at least one individual transaction are linked; otherwise report which level is missing without changing the loan or judging payment timeliness or sufficiency.
    verification: "Check and retain the Loan hasPaymentHistory Payment History link and that history's hasIndividualPayments Individual Payment Transaction links used for the result."
  reviewPrepaymentTerms:
    input: Loan
    preconditions: []
    effect: "Evaluate prepaymentTimingConfirmed using the Prepayment Terms governing the Loan's Principal; confirm penalty timing only when a penalty applies and prepaymentPenaltyTermInMonths is recorded, otherwise report the missing value or undetermined applicability without changing the loan."
    verification: "Check and retain Loan hasPrincipal Principal, the applicable Prepayment Terms governsPaymentOf Principal link, the governing terms' evidence of penalty applicability, and their prepaymentPenaltyTermInMonths value when present."


# CONSISTENCY CHECK — 3 outstanding problem(s) in the whole model:
#   [warning] effect-verification-mismatch — Action "verifySecuredLoanSupport" verifies Loan.securedLoan, but its effect never says that property changes.
#   [warning] unreachable-from-action-input — Action "assessLoanReadiness" has input class Loan, and its verification refers to Interest Payment Terms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewPrepaymentTerms" has input class Loan, and its effect refers to Prepayment Terms, which is only reachable against the direction of the relationships between them.

### Turn 98 — assistant

I’ve replayed all **35 recorded questions** against the live model. Here is the competency check; “covered” means the model tells the agent what to use, not that every account will have the data.

- **CQ1–3, each covered:** Loan or Credit Facility has a Borrower and Lender; Loan is serviced by a Servicer.
- **CQ4–5, each covered:** follow Loan → Principal or Interest, then look up the terms that govern payment of it. These lookups follow an incoming relationship; no direct loan-to-terms link is assumed.
- **CQ6–10, each covered:** the five named schedules link directly to Loan; a facility has Sub-facilities; a Loan has a Payment History, which has Individual Payment Transactions. The facility’s credit limit is recorded separately.
- **CQ11, partly covered:** the agent can find the payment history and applicable schedules, but cannot say what principal and interest amounts were paid versus due. Payment allocations, scheduled due amounts, and a transaction-to-scheduled-payment match are not established.
- **CQ12–14, each covered:** Loan links to a Fixed or Variable Interest Rate; a variable-rate loan’s reset schedule is separate. Loan holds any recorded cap and first-rate-change term; Variable Interest Rate holds the optional floating/managed detail.
- **CQ15, partly covered:** Accrued Interest holds an amount and as-of date, but has no established association with a particular Loan. The agent cannot attribute that amount to a loan.
- **CQ16–23, each covered for their stated reporting or check:** the day-count convention is reached through Interest Payment Terms; Loan links to pledged Collateral; Security Agreement secures Collateral; Collateral has a dated value; Loan has the two distinct ratios when recorded. The separate guarantee description reports backing, not validity. The collateral-support rule requires an actual collateral link.
- **CQ24–27, each covered:** the facility’s extended, available, and optional maximum-advance amounts are separate values; Loan links to its Interest Calculation Schedule when one is recorded.
- **CQ28–35, each covered:** Loan holds the four added dates and figures and three distinct repayment features; Loan → Principal reaches the optional outstanding amount. An undated balance or outstanding amount is not presented as necessarily current.

All **five actions** have Loan as their single input and report findings without changing it: readiness checks parties and the applicable interest-terms path; collateral support checks secured applicability and the actual collateral link; variable-rate setup checks the rate and reset-schedule links; payment-record completeness checks both history and individual entries; and prepayment review follows Principal to applicable terms and checks penalty timing. Each retains the evidence used for its report. The confirmation rules are evaluated *during* these diagnostic actions, not used to prevent an action from running when evidence is missing.

**Two acceptance-test gaps remain open:** CQ11’s paid-versus-due amounts and CQ15’s accrued-interest-to-loan association. You’ve explicitly declined to infer or invent the missing evidence, so I have not marked either question covered. Is this an accurate competency-check recap?

### Turn 99 — user

Yes, that accurately captures what the agent can confirm and what remains open. That’s a sound basis for the model.

### Turn 99 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 99 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit facility?
  - id: cq2
    text: Who is the lender for a loan or credit facility?
  - id: cq3
    text: "Who services a loan on the lender's behalf?"
  - id: cq4
    text: Which terms govern principal repayment for a loan?
  - id: cq5
    text: Which terms govern interest payment for a loan?
  - id: cq6
    text: "Which payment, amortization, principal, interest, or rate-reset schedules are associated with a loan?"
  - id: cq7
    text: What is the credit limit of a credit facility?
  - id: cq8
    text: Does a credit facility have sub-facilities?
  - id: cq9
    text: What payment history is recorded for a loan?
  - id: cq10
    text: "Which individual payment transactions, including fees and other related amounts, make up a loan's payment history?"
  - id: cq11
    text: "What principal and interest payments are recorded for a loan, and what do the applicable schedules say was due?"
  - id: cq12
    text: "What interest rate applies to a loan, and is it fixed or variable?"
  - id: cq13
    text: "For a variable-rate loan, what reset schedule applies, and what cap or first-rate-change term is recorded, if any?"
  - id: cq14
    text: "For a variable-rate loan, is its rate floating against an index or benchmark, or managed by the institution, where that rate type is recorded?"
  - id: cq15
    text: How much interest has accrued but remains unpaid for a loan as of a given date?
  - id: cq16
    text: "Which day-count convention in the applicable interest payment terms governs a loan's interest accrual?"
  - id: cq17
    text: Is a loan supported by pledged collateral?
  - id: cq18
    text: "Which collateral is linked to a secured loan, and which security agreement secures that collateral?"
  - id: cq19
    text: "For a collateralized loan, what collateral value and as-of date are recorded?"
  - id: cq20
    text: "For a collateralized loan, what loan-to-value measure is recorded?"
  - id: cq21
    text: "For a collateralized loan, what combined loan-to-value measure is recorded?"
  - id: cq22
    text: "Is a loan supported by a third-party guarantee, separately from any pledged collateral?"
  - id: cq23
    text: "If a loan is marked as secured by collateral, is collateral linked so its support check can pass?"
  - id: cq24
    text: What amount of credit has already been extended under a credit facility?
  - id: cq25
    text: What amount of credit remains available under a credit facility?
  - id: cq26
    text: "What maximum advance amount is recorded for a credit facility, if any?"
  - id: cq27
    text: "When is interest scheduled to be calculated for a loan, if an interest calculation schedule is recorded?"
  - id: cq28
    text: "What is a loan's initial exchange date?"
  - id: cq29
    text: "What is a loan's maturity date?"
  - id: cq30
    text: "What is a loan's principal amount?"
  - id: cq31
    text: What loan balance is recorded?
  - id: cq32
    text: Is a loan recorded as interest-only?
  - id: cq33
    text: Is a loan recorded as permitting negative amortization?
  - id: cq34
    text: Is a loan recorded as having a balloon payment?
  - id: cq35
    text: "What outstanding principal amount is recorded for a loan, if any?"
classes:
  Loan:
    meaning: "An account whose repayment, payments, interest, and servicing are tracked."
    aliases: []
    properties:
      firstRateChangeTermInMonths:
        type: number
        unit: months
      interestRateCap:
        type: number
      collateralizedLoan:
        type: boolean
      guaranteedLoan:
        type: boolean
      securedLoan:
        type: boolean
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
      principalAmount:
        type: number
      loanBalance:
        type: number
      interestOnly:
        type: boolean
      negativeAmortization:
        type: boolean
      balloonPayment:
        type: boolean
  Credit Facility:
    meaning: An arrangement letting a borrower draw credit over time that may contain sub-facilities.
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      amountOfCreditExtended:
        type: number
      availableAmount:
        type: number
      maximumAdvanceAmount:
        type: number
  Borrower:
    meaning: The party obliged to repay money or credit.
    aliases: []
    properties: {}
  Lender:
    meaning: The party extending money or credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party collecting principal and interest payments on a lender's behalf."
    aliases: []
    properties: {}
  Interest Payment Terms:
    meaning: Terms governing interest payment and specifying the accrual basis through a day-count convention.
    aliases: []
    properties: {}
  Principal Repayment Terms:
    meaning: Terms governing repayment of principal separately from interest payment.
    aliases: []
    properties: {}
  Loan Payment Schedule:
    meaning: The regular or explicit payment schedule for a loan.
    aliases: []
    properties: {}
  Amortization Schedule:
    meaning: "A schedule showing how scheduled payments change a loan's debt balance over time."
    aliases: []
    properties: {}
  Principal Payment Schedule:
    meaning: A schedule giving the dates when loan principal is due.
    aliases: []
    properties: {}
  Interest Payment Schedule:
    meaning: A schedule giving the dates when loan interest is due.
    aliases: []
    properties: {}
  Interest Rate Reset Schedule:
    meaning: "A schedule giving the dates when a loan's variable interest rate is recalculated."
    aliases: []
    properties: {}
  Interest Calculation Schedule:
    meaning: "A schedule giving the dates when interest is calculated for a loan, distinct from payment due dates and rate-reset dates."
    aliases: []
    properties: {}
  Payment History:
    meaning: "A loan's record of payments made toward its repayment obligation."
    aliases: []
    properties: {}
  Individual Payment Transaction:
    meaning: "An actual individual payment recorded within a payment history that may cover principal, interest, fees, or other related amounts."
    aliases:
      - payment transaction
    properties: {}
  Fixed Interest Rate:
    meaning: A fixed numeric interest rate that applies to a loan.
    aliases: []
    properties:
      rate:
        type: number
  Variable Interest Rate:
    meaning: A numeric interest rate that applies to a loan and can change over time.
    aliases: []
    properties:
      rate:
        type: number
      moreSpecificRateType:
        type: text
        allowed:
          - floating
          - managed
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  Security Agreement:
    meaning: An agreement granting a financial interest in collateral and setting out relevant rights and duties.
    aliases: []
    properties: {}
  Sub-facility:
    meaning: "A portion of a credit facility available for a particular purpose, potentially on its own schedule."
    aliases: []
    properties: {}
  Prepayment Terms:
    meaning: "Terms governing repayment of loan principal before maturity, including penalty timing when a penalty applies."
    aliases: []
    properties:
      prepaymentPenaltyTermInMonths:
        type: number
        unit: months
  Accrued Interest:
    meaning: "A dated amount of interest accrued but unpaid on a loan, distinct from the rate, principal balance, and calculation schedule."
    aliases: []
    properties:
      amount:
        type: number
      asOfDate:
        type: date
  Collateral Value as of a Date:
    meaning: A dated valuation of collateral with its value and as-of date kept together.
    aliases:
      - Collateral Valuation
    properties:
      value:
        type: number
      asOfDate:
        type: date
  Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan comparing its principal with appraised collateral value.
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  Combined Loan-to-Value Ratio:
    meaning: A percentage for a collateralized loan considering total debt secured by the asset or assets.
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  Interest:
    meaning: "The cost of using credit on a loan, whose payment is governed by interest payment terms."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of a loan to be repaid apart from interest, whose repayment is governed by principal repayment terms."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  Day-count Convention:
    meaning: The accrual basis specified by interest payment terms for calculating interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The loan has the party obliged to repay it as its borrower.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The loan has the party financing it as its lender.
    aliases: []
  - name: hasBorrower
    from: Credit Facility
    to: Borrower
    meaning: The facility has the party who may draw under it as its borrower.
    aliases: []
  - name: hasLender
    from: Credit Facility
    to: Lender
    meaning: The facility has the party providing it as its lender.
    aliases: []
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "A loan is serviced by the party collecting principal and interest payments on the lender's behalf."
    aliases:
      - has servicer
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "A loan has interest, when it bears interest."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: A loan has principal that must be repaid apart from interest.
    aliases: []
  - name: governsPaymentOf
    from: Interest Payment Terms
    to: Interest
    meaning: "Interest payment terms govern payment of the loan's interest."
    aliases: []
  - name: governsPaymentOf
    from: Principal Repayment Terms
    to: Principal
    meaning: "Principal repayment terms govern repayment of the loan's principal."
    aliases: []
  - name: governsPaymentOf
    from: Prepayment Terms
    to: Principal
    meaning: Prepayment terms govern repayment of principal before maturity when they apply.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: Loan Payment Schedule
    meaning: A loan has an associated loan payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasAmortizationSchedule
    from: Loan
    to: Amortization Schedule
    meaning: A loan has an associated amortization schedule when one applies.
    aliases:
      - has schedule
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: Principal Payment Schedule
    meaning: A loan has an associated principal payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestPaymentSchedule
    from: Loan
    to: Interest Payment Schedule
    meaning: A loan has an associated interest payment schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestRateResetSchedule
    from: Loan
    to: Interest Rate Reset Schedule
    meaning: A loan has an associated rate reset schedule when one applies.
    aliases:
      - has schedule
  - name: hasInterestCalculationSchedule
    from: Loan
    to: Interest Calculation Schedule
    meaning: A loan has an interest calculation schedule specifying when interest is scheduled to be calculated.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: Payment History
    meaning: A loan has a history recording payments made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: Payment History
    to: Individual Payment Transaction
    meaning: "A payment history has individual payment transactions, including those toward principal, interest, fees, or related amounts."
    aliases:
      - contains individual payment transaction
  - name: hasInterestRate
    from: Loan
    to: Fixed Interest Rate
    meaning: A loan has an applicable fixed interest rate carrying its numeric rate.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: Variable Interest Rate
    meaning: A loan has an applicable variable interest rate carrying its numeric rate.
    aliases: []
  - name: isCollateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by an asset pledged as its security.
    aliases:
      - has collateral
  - name: secures
    from: Security Agreement
    to: Collateral
    meaning: A security agreement secures the pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasCollateralValueAsOfAdate
    from: Collateral
    to: Collateral Value as of a Date
    meaning: Collateral has a dated valuation recording its value as of a date.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: Loan-to-Value Ratio
    meaning: A collateralized loan has a loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: Combined Loan-to-Value Ratio
    meaning: A collateralized loan has a combined loan-to-value ratio when that measure is recorded.
    aliases: []
  - name: hasSubFacility
    from: Credit Facility
    to: Sub-facility
    meaning: A credit facility has a portion available under it for a particular purpose when sub-facilities exist.
    aliases: []
  - name: hasAccrualBasis
    from: Interest Payment Terms
    to: Day-count Convention
    meaning: Interest payment terms have an accrual basis expressed by a day-count convention.
    aliases: []
rules:
  loanReadinessConfirmed:
    conditions:
      - Loan has a Borrower.
      - Loan has a Lender.
      - "If Loan has a Fixed Interest Rate or Variable Interest Rate, Loan has Interest and applicable Interest Payment Terms govern payment of that Interest."
  collateralSupportConfirmed:
    conditions:
      - "Loan is established as secured through its recorded securedLoan description or governing evidence; if that cannot be established, applicability is undetermined."
      - Secured Loan isCollateralizedBy Collateral through an actual recorded link; a support description alone does not satisfy this condition.
  variableRateSetupConfirmed:
    conditions:
      - "Loan hasInterestRate Variable Interest Rate; if variable-rate status cannot be established, applicability is undetermined."
      - Loan hasInterestRateResetSchedule Interest Rate Reset Schedule through a recorded link.
  paymentRecordCompletenessConfirmed:
    conditions:
      - Loan hasPaymentHistory Payment History through a recorded link.
      - That Payment History hasIndividualPayments at least one Individual Payment Transaction.
  prepaymentTimingConfirmed:
    conditions:
      - "The governing Prepayment Terms establish that a prepayment penalty applies; if they do not establish applicability, report it as undetermined rather than infer it from a missing value."
      - Those Prepayment Terms have a recorded prepaymentPenaltyTermInMonths.
actions:
  assessLoanReadiness:
    input: Loan
    preconditions: []
    effect: "Evaluate loanReadinessConfirmed for the supplied Loan; report core loan setup confirmed only when it holds, otherwise report the missing or unverified required links; do not change the loan."
    verification: "Confirm the checked Loan hasBorrower Borrower and hasLender Lender links and, when Loan hasInterestRate Fixed Interest Rate or Variable Interest Rate, confirm Loan hasInterest Interest governed by applicable Interest Payment Terms using an incoming governsPaymentOf link; retain the verified links as evidence."
  verifySecuredLoanSupport:
    input: Loan
    preconditions: []
    effect: "For a Loan established as secured, evaluate collateralSupportConfirmed and report collateral support confirmed only when an actual isCollateralizedBy link is verified; otherwise report the missing collateral link or undetermined applicability without judging guarantee support or changing the loan."
    verification: "Check and retain the evidence establishing securedLoan applicability and the actual Loan isCollateralizedBy Collateral link, if present."
  reviewVariableRateSetup:
    input: Loan
    preconditions: []
    effect: Evaluate variableRateSetupConfirmed and report variable-rate setup confirmed only when both links are verified; otherwise report the missing reset schedule or undetermined applicability without changing the loan.
    verification: Check and retain the Loan hasInterestRate Variable Interest Rate and Loan hasInterestRateResetSchedule Interest Rate Reset Schedule links used for the result.
  reviewPaymentRecordCompleteness:
    input: Loan
    preconditions: []
    effect: Evaluate paymentRecordCompletenessConfirmed and report payment-record completeness confirmed only when the history and at least one individual transaction are linked; otherwise report which level is missing without changing the loan or judging payment timeliness or sufficiency.
    verification: "Check and retain the Loan hasPaymentHistory Payment History link and that history's hasIndividualPayments Individual Payment Transaction links used for the result."
  reviewPrepaymentTerms:
    input: Loan
    preconditions: []
    effect: "Evaluate prepaymentTimingConfirmed using the Prepayment Terms governing the Loan's Principal; confirm penalty timing only when a penalty applies and prepaymentPenaltyTermInMonths is recorded, otherwise report the missing value or undetermined applicability without changing the loan."
    verification: "Check and retain Loan hasPrincipal Principal, the applicable Prepayment Terms governsPaymentOf Principal link, the governing terms' evidence of penalty applicability, and their prepaymentPenaltyTermInMonths value when present."


# CONSISTENCY CHECK — 3 outstanding problem(s) in the whole model:
#   [warning] effect-verification-mismatch — Action "verifySecuredLoanSupport" verifies Loan.securedLoan, but its effect never says that property changes.
#   [warning] unreachable-from-action-input — Action "assessLoanReadiness" has input class Loan, and its verification refers to Interest Payment Terms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewPrepaymentTerms" has input class Loan, and its effect refers to Prepayment Terms, which is only reachable against the direction of the relationships between them.

# SECOND-OPINION MODEL CHECK — no additional observations.

### Turn 99 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - id: cq22\n    text: Is a loan described as guarantee-backed, separately from pledged collateral?\nrelationships:\n  - name: isServicedBy\n    from: Loan\n    to: Servicer\n    aliases: []\n  - name: isCollateralizedBy\n    from: Loan\n    to: Collateral\n    aliases: []"
}
```

### Turn 99 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
3 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 99 — assistant

The final checklist is complete. The live model has **35 recorded questions and five read-only review actions**. Every class and relationship has a meaning, the confirmed relationships have directions, and the later-added Day-count Convention has its checked path through Interest Payment Terms. The bounded expansion pass was made for the major concepts. The five reviews use named confirmation rules and retain the evidence they check; they do not change loan status.

The canvas still reports **three warnings**. Two assume the agent can follow relationships only forward, whereas you confirmed reverse lookups from a loan’s Interest or Principal to its governing terms. The third assumes that verifying the *secured loan* description must change it; this is a read-only review, so that warning does not hold. I have not added contrary links or a state change to silence them. The **automated second opinion reported no additional observations**.

The model is being left in a **known-incomplete state** on two acceptance-test questions:

1. **Recorded principal and interest paid versus scheduled amounts due:** payment allocations, due amounts, and a transaction-to-scheduled-payment match have not been established.
2. **Accrued unpaid interest for a particular loan:** the dated amount has no established association with that loan. Accrued Interest therefore also fails the checklist requirement that every class have a relationship.

The agent must report those limits rather than infer an answer. Everything else in the recorded question-and-review check has the orientation described in the preceding recap; these two items remain open, not confirmed.
