# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-20T11:57:30.303Z

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

We’ll start with what the agent must actually help you do, then build the model around those needs. The canvas is empty, so there’s nothing to preserve yet. We’ll work through roughly ten short phases, confirming each part before I record it.

First, thinking about the approval hand-off and ongoing servicing, **what questions must the agent be able to answer?** Please give me the questions you’d ask in practice, in your own words; we’ll identify the actions separately.

### Turn 2 — user

At hand-off and during servicing, I’d want to be able to ask:

- Who’s the borrower, who’s the lender, and which servicer collects payments?
- What principal or debt amount was agreed, what’s outstanding, when was funding due to start, and when does it mature?
- What interest rate applies? If it varies, when can it reset, is there a cap, and when is the first change?
- Which terms govern principal repayment and interest payment? How is interest accrual calculated?
- What payment schedules are on file—overall payments, amortization, principal, interest, interest calculations, and rate resets?
- Is this interest-only, fully or partly amortizing, subject to negative amortization, or due for a balloon payment?
- Can the borrower prepay, and is a prepayment-penalty period recorded?
- Is the loan secured? If so, what collateral supports it, what security agreement covers that collateral, and is there any credit-enhancement beneficiary?
- For collateralized lending, what dated collateral value are we using, and what are the loan-to-value and combined loan-to-value ratios?
- What payments have actually been made, and which individual transactions make up the payment history?
- For a facility, how much credit is available or extended, what’s its limit, and are there sub-facilities? What borrowing capacity has been assessed for the borrower?

Those are questions about what’s on file and what the terms say. We can deal separately with which gaps should stop a readiness check or trigger a servicing review.

### Turn 2 — assistant

That gives us a practical starting set: the agent needs to distinguish what the terms require from what has actually happened. I’ll split bundled questions so we can test the model against each one. We’ll handle readiness checks and servicing-review decisions after we’ve established the questions and actions.

For the **parties and amounts**, are these five faithful to what you need?

1. Who is the borrower on a loan or credit facility?
2. Who is its lender?
3. Which servicer collects its payments?
4. What principal or debt amount was agreed?
5. What amount is currently outstanding?

### Turn 3 — user

Yes, with two small distinctions:

1. Borrower and lender apply to both a loan and a credit facility.
2. The servicer question is specifically about the **loan**: who collects its principal and interest payments on the lender’s behalf.
3. For the agreed amount, I’d ask for the loan’s **principal amount** or the credit agreement’s **debt amount**. For a facility, I’d also want its credit limit and amount of credit extended; those aren’t the same thing.
4. “Currently outstanding” needs a little precision. A loan has a balance, and we may separately track outstanding principal and outstanding interest. I wouldn’t roll those into one figure without saying which amount we mean.

So the five questions cover the need, provided the last two keep those distinctions.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Who is the borrower on a loan or credit facility?\n  - text: Who is the lender on a loan or credit facility?\n  - text: Which servicer collects a loan's principal and interest payments on the lender's behalf?\n  - text: What is a loan's agreed principal amount?\n  - text: What is the debt amount agreed in a credit agreement?\n  - text: What is a loan's current balance?\n  - text: What is a loan's outstanding principal?\n  - text: What is a loan's outstanding interest?\n  - text: What is a credit facility's credit limit?\n  - text: How much credit has been extended under a credit facility?"
}
```

### Turn 3 — tool

Applied. Added 10, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

I’ve recorded those distinctions: the loan’s balance, outstanding principal, and outstanding interest are separate questions; the facility’s limit and credit extended are separate too.

Next, for **dates and rates**, should the agent answer these questions as written?

1. When is funding due to start, and when does the loan mature?
2. What interest rate currently applies to the loan?
3. If the rate varies, when can it reset, is there a cap, and when is the first change?

### Turn 4 — user

Yes, with a couple of wording adjustments.

1. I’d ask for the **initial exchange date**—when the initial funding exchange is set to occur—and the maturity date. “Funding due to start” could sound like a draw period, which is a different question for a facility.
2. Ask which interest rate applies and whether it’s fixed or variable. If you mean the rate **as of today**, we’d need the applicable rate record or reset information; the rate type alone won’t tell us that.
3. For a variable rate, ask for its reset schedule, any interest rate cap, and the term until the first rate change. The first-change term is recorded in months, while the schedule covers reset dates.

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: When is a loan's initial exchange date?\n  - text: When does a loan mature?\n  - text: Which interest rate applies to a loan as of a specified date?\n  - text: Is a loan's interest rate fixed or variable?\n  - text: What is a variable-rate loan's reset schedule?\n  - text: What interest rate cap applies to a variable-rate loan?\n  - text: How many months until a variable-rate loan's first rate change?"
}
```

### Turn 4 — tool

Applied. Added 7, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 4 — assistant

I’ve recorded the initial exchange date separately from any facility draw period, and separated the rate type, applicable rate on a specified date, reset schedule, cap, and first-change term.

For **repayment terms and schedules**, does this capture the next part of your list: the agent must identify which terms govern principal repayment and interest payment, how interest accrues, and which schedules are on file for overall payments, amortization, principal, interest, interest calculations, and rate resets? Is any item in that group just another name for one of the others in your operation?

### Turn 5 — user

Yes. None of those is just another name for another.

The **terms** say what must be paid and how: principal repayment terms govern principal; interest payment terms govern interest and identify the day-count convention used to calculate accrual. The **schedules** put particular events or due dates on the calendar.

I’d keep the schedules distinct. An overall loan payment schedule is not necessarily an amortization schedule, which shows how the debt balance changes over time. Principal-payment dates and interest-payment dates can differ; an interest-calculation date need not be an interest-payment date; and a rate-reset date concerns a possible rate change, not a payment. I’d also keep an initial **rate-setting event** distinct from later rate resets.

Finally, accrued but unpaid interest is an amount we track, not a payment schedule or a payment that has already happened.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Which terms govern a loan's principal repayment?\n  - text: Which terms govern a loan's interest payments?\n  - text: Which day-count convention governs a loan's interest accrual?\n  - text: What overall loan payment schedule is on file?\n  - text: What amortization schedule is on file for a loan?\n  - text: What principal-payment schedule is on file for a loan?\n  - text: What interest-payment schedule is on file for a loan?\n  - text: What interest-calculation schedule is on file for a loan?\n  - text: What rate-reset schedule is on file for a loan?\n  - text: What initial rate-setting event is on file for a loan?"
}
```

### Turn 5 — tool

Applied. Added 10, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

I’ve recorded the terms and each schedule separately, including the initial rate-setting event. I’ve also kept accrued but unpaid interest distinct from a payment already made; I haven’t added a separate question for it yet.

For **repayment structure and prepayment**, should the agent answer: whether a loan is interest-only, fully or partly amortizing, permits negative amortization, or has a balloon payment; whether the borrower may prepay; and whether a prepayment-penalty period is recorded? Are those faithful to your questions?

### Turn 6 — user

Mostly, yes, but I’d tighten two points.

We can ask whether the loan is marked **interest-only**, allows **negative amortization**, or has a **balloon payment**. Full and partial amortization describe how the scheduled payments reduce the debt: with full amortization the last payment clears the remaining principal and interest; with partial amortization a substantial balance may remain for a final balloon payment. I wouldn’t infer the full-versus-partial answer from a balloon flag alone—check the repayment structure and schedule.

For prepayment, the sound question is **what prepayment terms apply**, including whether a penalty period is recorded and its length in months. I wouldn’t treat “may the borrower prepay?” as a separate yes/no field unless the governing terms actually establish that answer.

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Is a loan marked interest-only?\n  - text: Does a loan allow negative amortization?\n  - text: Does a loan have a balloon payment?\n  - text: Does a loan's repayment structure and schedule show full or partial amortization?\n  - text: What prepayment terms apply to a loan, including whether they permit prepayment?\n  - text: Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
}
```

### Turn 6 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 6 — assistant

I’ve recorded those distinctions. Full versus partial amortization needs the repayment structure and schedule, not just the balloon indicator; whether prepayment is permitted must come from the governing terms.

For **security and collateral**, should the agent answer these as separate questions: whether the loan is secured; which collateral supports it; which security agreement covers that collateral; whether a credit-enhancement beneficiary is involved; and, for collateralized lending, which dated collateral value is used and what the loan-to-value and combined loan-to-value ratios are?

### Turn 7 — user

Yes—keep them separate. A secured loan may be supported by pledged collateral or by a guarantee, so “secured” by itself doesn’t tell us what the support is. For a collateral-backed loan, ask which collateral is linked to the loan; the security agreement identifies the rights granted over that collateral. A credit-enhancement beneficiary is the party protected under a credit-enhancement agreement, not another name for the collateral or the lender.

For a collateralized loan, ask for the collateral’s appraised value **and its as-of date**, plus the loan-to-value ratio and the combined loan-to-value ratio. The combined measure takes account of total debt secured by the asset, rather than only this loan’s principal.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Is a loan secured?\n  - text: What pledged collateral or guarantee supports a secured loan?\n  - text: Which collateral is linked to a collateral-backed loan?\n  - text: Which security agreement identifies the rights granted over the collateral linked to a loan?\n  - text: Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?\n  - text: What is the appraised value of collateral linked to a loan, and what is its as-of date?\n  - text: What is the loan-to-value ratio for a collateralized loan?\n  - text: What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
}
```

### Turn 7 — tool

Applied. Added 8, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 7 — assistant

I’ve recorded “secured” separately from the support behind it: collateral or a guarantee. I’ve also kept the security agreement, credit-enhancement beneficiary, and the appraisal’s as-of date distinct.

For the **remaining payment-history and facility questions**, is this accurate: which payments were actually made on a loan; which individual transactions make up that history; which sub-facilities belong to a facility; and what borrowing capacity has been assessed for the borrower? Does “borrowing capacity” refer to an assessment distinct from the facility’s limit and credit already extended?

### Turn 8 — user

Yes. The loan has a payment history, and that history contains the individual payment transactions actually made. Those transactions can cover principal, interest, fees, or other amounts; they’re different from scheduled payments.

A credit facility can have sub-facilities, and I’d ask which ones form part of it. Borrowing capacity is a **separate assessment of the borrower’s ability to repay**, expressed as an amount at a point in time. It isn’t the facility’s contractual credit limit, the amount already extended, or the amount still available.

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What payment history is recorded for a loan?\n  - text: Which individual payment transactions actually made are contained in a loan's payment history?\n  - text: Which sub-facilities form part of a credit facility?\n  - text: What amount of borrowing capacity was assessed for the borrower as of a specified date?\n  - text: How much credit remains available under a credit facility?"
}
```

### Turn 8 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 8 — assistant

I’ve recorded actual payment transactions separately from scheduled payments, and borrowing capacity separately from the facility limit, credit extended, and credit still available.

That completes the questions from your first pass. Before we move to the kinds of things the agent must recognize, **what actions should it actually perform** at hand-off or during servicing? Please name the operational steps you’d expect it to take—not just questions it should answer.

### Turn 9 — user

I’d have it perform five focused checks, rather than make a general approval decision:

1. **Assess loan readiness.** Given a loan, check that its borrower and lender are identified and, if it bears interest, that the applicable rate and interest-payment terms are linked. Confirm those links are present and retain the check result.
2. **Verify secured-loan support.** Given a secured loan, check that supporting collateral is linked to it. Confirm the collateral link and retain that finding; a “secured” label alone isn’t enough for this check.
3. **Review variable-rate setup.** Given a loan with a variable rate, check for its interest-rate reset schedule. Confirm both the variable rate and schedule are on file.
4. **Review payment-record completeness.** Given a loan, check that it has a payment history containing individual payment transactions. Confirm the history and its entries, rather than treating a scheduled payment as evidence that payment occurred.
5. **Review prepayment terms.** Given a loan with a recorded prepayment-penalty period, check that its timing is recorded in months and retain what was checked.

These are record-verification steps. I wouldn’t have the agent disburse funds, change terms, or decide credit approval on the strength of them.

### Turn 9 — assistant

I’ve captured five proposed actions: loan-readiness assessment, secured-loan support verification, variable-rate setup review, payment-record completeness review, and prepayment-terms review. They verify records and retain findings; they do not disburse funds, change terms, or approve credit.

Before we turn to the model’s classes: for the borrower, lender, servicer, and credit-enhancement beneficiary you named, **is there a closely related role that does day-to-day work under any of them, and does any of these questions or checks depend on a specific operating context that changes how it is handled?**

### Turn 10 — user

Not as a separate role for these questions or checks. The **servicer** does the day-to-day collection of principal and interest on the lender’s behalf, but it isn’t a subordinate borrower or lender role, and it needn’t be the party that originated the loan. The **credit-enhancement beneficiary** is the party protected by that agreement, not a payment-collection role.

The context that changes a check is mainly the loan’s structure. Interest terms matter for an interest-bearing loan; a reset schedule matters when the rate is variable; collateral support is checked for a secured loan; and prepayment-penalty timing is reviewed when such a period applies. I wouldn’t add a separate operating-role hierarchy or an approval authority to those checks.

### Turn 10 — assistant

The starting requirements now distinguish the named parties, loan and facility amounts, terms and schedules, security, actual payment records, and assessed borrowing capacity. The five actions are record-verification checks, not credit decisions or changes to the loan. I won’t add a separate role hierarchy or approval authority.

One point needs correction before we move on: you said a secured loan may be supported by a **guarantee rather than collateral**, but the proposed secured-loan check looks specifically for a collateral link. For a secured loan supported only by a guarantee, should that check report the collateral link as missing, or should it check for the guarantee instead?

### Turn 11 — user

For that **specific check**, report the collateral link as missing. The check verifies a link from the secured loan to collateral; it does not check for a guarantee instead.

I’d make the finding precise: “Collateral support not verified by this check,” not “the loan is unsecured” or “the guarantee is invalid.” A guarantee-only loan may still be secured, but this particular verification cannot confirm its support.

### Turn 11 — assistant

Understood. For that check, a guarantee-only loan produces **“Collateral support not verified by this check.”** It does not imply the loan is unsecured or the guarantee is invalid. I’ll carry that distinction into the check’s conditions and finding.

We can now identify the kinds of things the agent needs to handle. First, do these five each need to be identifiable **separately**, so the agent can retrieve them or connect them to your questions and checks: **Loan** (readiness and servicing checks), **Credit Facility** (limits and sub-facilities), **Borrower** and **Lender** (parties to either), and **Servicer** (the party collecting loan payments for the lender)?

### Turn 12 — user

Yes. Keep all five identifiable separately.

A **loan** is the debt we set up and service; a **credit facility** is an arrangement under which the borrower can draw credit over time, potentially through sub-facilities. A **borrower** owes repayment, a **lender** provides the credit, and a **servicer** collects loan payments on the lender’s behalf. Identifying the lender doesn’t, by itself, identify the servicer.

### Turn 12 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    meaning: A debt set up and serviced under agreed terms.\n  CreditFacility:\n    meaning: An arrangement under which a borrower can draw credit over time, potentially through sub-facilities.\n  Borrower:\n    meaning: A party that owes repayment.\n  Lender:\n    meaning: A party that provides credit.\n  Servicer:\n    meaning: A party that collects loan payments on the lender's behalf."
}
```

### Turn 12 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 12 — assistant

I’ve recorded those five as separate kinds of things, including the distinction between lender and servicer.

For the **facility questions**, does the agent need to identify these separately: a **Credit Agreement** for the agreed debt amount, a **Sub-facility** for the parts of a facility, and a **Borrowing Capacity Assessment** for the borrower’s assessed amount at a point in time? Or is any of these just a value on another record that the agent would not need to retrieve or connect?

### Turn 13 — user

Yes, I’d keep all three separately identifiable, but I’d word the last one a little differently.

A **credit agreement** carries the agreed debt amount and dates. A **sub-facility** is a portion of a credit facility, so the agent needs to identify which facility it belongs to. The borrower’s assessed capacity is also more than a number on the facility: it belongs to the borrower and represents an upper bound on what the lender believes they can repay at a point in time. I’d name that for the **capacity being assessed**, rather than for the act of conducting an assessment. It mustn’t be confused with the facility’s limit or available amount.

### Turn 13 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CreditAgreement:\n    meaning: An agreement carrying the agreed debt amount and dates.\n  SubFacility:\n    meaning: A portion of a credit facility that can be identified within it.\n  BorrowingCapacity:\n    meaning: The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
}
```

### Turn 13 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 13 — assistant

I’ve added the credit agreement, sub-facility, and **Borrowing Capacity** as separate concepts. Borrowing Capacity describes the assessed capacity, not the assessment activity, and remains distinct from the facility’s contractual figures.

For the **loan’s governing terms and rate**, does the agent need to identify each of these as its own retrievable or connected thing: **Principal Repayment Terms**, **Interest Payment Terms**, **Interest Rate**, and **Prepayment Terms**? The questions distinguish what governs repayment, accrual, the applicable rate, and prepayment, but I don’t want to turn any of those into a separate class if you use it only as a value on the loan.

### Turn 14 — user

Yes, those are more than four values on the loan, with one distinction for **interest rate**.

Keep principal repayment terms and interest payment terms separate: one governs payment of principal; the other governs payment of interest and identifies the day-count convention for accrual. Prepayment terms are a particular kind of principal repayment terms, dealing with payment before maturity and any penalty period.

For the rate, distinguish a **fixed interest rate** from a **variable interest rate** rather than treating “interest rate” as a single text value. A variable rate can be floating—based on a benchmark—or managed, meaning the institution sets it from time to time. The loan also carries its applicable rate, while the reset schedule is a separate thing to check for a variable-rate loan.

### Turn 14 — assistant

I’ll keep **Principal Repayment Terms** and **Interest Payment Terms** separate. I’ll also keep prepayment terms distinguishable, but this tool cannot represent “a kind of” directly, so I won’t record that phrase as a relationship.

One class decision before I add the rate concepts: does the agent need to retrieve **Fixed Interest Rate** and **Variable Interest Rate** as separate rate records, or retrieve one **Interest Rate** record whose type is fixed or variable, with variable-rate details and a reset schedule where applicable? Which matches what is on file?

### Turn 15 — user

Use **fixed interest rate** and **variable interest rate** as separately identifiable rate types, rather than one generic rate record with a fixed-or-variable field. A loan links to whichever rate applies; I’m not saying it must have both.

Within variable rates, a **floating rate** is benchmark-based, while a **managed rate** is set by the institution from time to time. The reset schedule remains separate from the rate record. And don’t confuse the rate with **interest owed**—those are different things we track.

### Turn 15 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PrincipalRepaymentTerms:\n    meaning: Terms that govern payment of a loan's principal.\n  InterestPaymentTerms:\n    meaning: Terms that govern a loan's interest payments and identify the day-count convention for accrual.\n  PrepaymentTerms:\n    meaning: Terms governing principal repayment before maturity and any applicable penalty period.\n  FixedInterestRate:\n    meaning: An interest rate that is fixed rather than subject to variable-rate changes.\n  VariableInterestRate:\n    meaning: An interest rate that can vary, including floating benchmark-based or institution-managed rates."
}
```

### Turn 15 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 15 — assistant

I’ve added the two repayment-term concepts, prepayment terms, and separately identifiable fixed and variable rates. A loan links to whichever rate applies; a rate is not interest owed.

For **payment-related schedules**, should the agent identify each of these separately to answer your on-file questions: **Loan Payment Schedule**, **Amortization Schedule**, **Principal Payment Schedule**, and **Interest Payment Schedule**? You’ve distinguished their purposes; I’m checking whether each is a separate record the agent retrieves or connects.

### Turn 16 — user

Yes, keep each separately identifiable. A loan can be linked to an overall **loan payment schedule**, an **amortization schedule** showing how its balance changes, a **principal payment schedule** for principal due dates, and an **interest payment schedule** for interest due dates. Don’t collapse one into another merely because the dates sometimes coincide.

I’d also keep the **interest calculation schedule** and **interest rate reset schedule** separately identifiable when we get to them: calculation, payment, and reset are different events.

### Turn 16 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  LoanPaymentSchedule:\n    meaning: The overall schedule of payments due on a loan.\n  AmortizationSchedule:\n    meaning: The schedule showing how a loan's debt balance changes over time.\n  PrincipalPaymentSchedule:\n    meaning: The schedule of dates on which loan principal payments are due.\n  InterestPaymentSchedule:\n    meaning: The schedule of dates on which loan interest payments are due.\n  InterestCalculationSchedule:\n    meaning: The schedule of dates on which loan interest is calculated.\n  InterestRateResetSchedule:\n    meaning: The schedule of dates on which a variable loan rate may reset."
}
```

### Turn 16 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 16 — assistant

I’ve recorded all six schedules as separate, including interest calculation and rate reset. Matching dates won’t make them the same record.

For **rate events and actual payments**, does the agent need to identify an **Initial Rate-Setting Event**, a loan’s **Payment History**, and each **Payment Transaction** separately? That would let it find the initial rate-setting record and verify that recorded payments are actual transactions in the history, rather than scheduled amounts.

### Turn 17 — user

Yes, all three need to be identifiable separately. I’d put the names of the first and third a little differently: the rate event is **where the loan’s initial rate is established**, not necessarily an event whose date is the initial exchange date; and the payment record is **one actual transaction** within the loan’s payment history, not a scheduled amount.

The links matter: the loan has the rate-setting event and the payment history; the history contains the individual actual payments. A later rate reset is a different event from setting the initial rate.

### Turn 17 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InitialRateSettingEvent:\n    meaning: An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date.\n  PaymentHistory:\n    meaning: The record of actual payment transactions made on a loan.\n  PaymentTransaction:\n    meaning: One actual payment transaction within a loan's payment history, rather than a scheduled payment."
}
```

### Turn 17 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 17 — assistant

I’ve recorded the initial rate-setting event separately from later resets, and the payment history separately from each actual payment transaction.

For the **security questions**, which of these must be identifiable or connected as separate things: **Collateral**, **Security Agreement**, **Guarantee**, **Credit-Enhancement Agreement**, and **Credit-Enhancement Beneficiary**? Each appears in a different part of what you want the agent to explain; I want to check whether any is only wording on another record rather than something it must find.

### Turn 18 — user

Keep **collateral**, **security agreement**, **credit-enhancement agreement**, and **credit-enhancement beneficiary** separate. Collateral is the asset pledged; a security agreement grants rights over that collateral. A credit-enhancement agreement is a separate arrangement, and its beneficiary is the party it protects.

I wouldn’t add a standalone **guarantee** record on this basis. We do distinguish a **guaranteed loan**—a loan secured by a guaranty—but the information we’ve established here does not specify a separate guarantee record or a link from that record to the loan.

### Turn 18 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Collateral:\n    meaning: An asset pledged to support a loan.\n  SecurityAgreement:\n    meaning: An agreement granting rights over pledged collateral.\n  CreditEnhancementAgreement:\n    meaning: An arrangement protecting a credit-enhancement beneficiary.\n  CreditEnhancementBeneficiary:\n    meaning: A party protected under a credit-enhancement agreement."
}
```

### Turn 18 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 18 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 18 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan or credit facility?
  - id: cq2
    text: Who is the lender on a loan or credit facility?
  - id: cq3
    text: "Which servicer collects a loan's principal and interest payments on the lender's behalf?"
  - id: cq4
    text: "What is a loan's agreed principal amount?"
  - id: cq5
    text: What is the debt amount agreed in a credit agreement?
  - id: cq6
    text: "What is a loan's current balance?"
  - id: cq7
    text: "What is a loan's outstanding principal?"
  - id: cq8
    text: "What is a loan's outstanding interest?"
  - id: cq9
    text: "What is a credit facility's credit limit?"
  - id: cq10
    text: How much credit has been extended under a credit facility?
  - id: cq11
    text: "When is a loan's initial exchange date?"
  - id: cq12
    text: When does a loan mature?
  - id: cq13
    text: Which interest rate applies to a loan as of a specified date?
  - id: cq14
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq15
    text: "What is a variable-rate loan's reset schedule?"
  - id: cq16
    text: What interest rate cap applies to a variable-rate loan?
  - id: cq17
    text: "How many months until a variable-rate loan's first rate change?"
  - id: cq18
    text: "Which terms govern a loan's principal repayment?"
  - id: cq19
    text: "Which terms govern a loan's interest payments?"
  - id: cq20
    text: "Which day-count convention governs a loan's interest accrual?"
  - id: cq21
    text: What overall loan payment schedule is on file?
  - id: cq22
    text: What amortization schedule is on file for a loan?
  - id: cq23
    text: What principal-payment schedule is on file for a loan?
  - id: cq24
    text: What interest-payment schedule is on file for a loan?
  - id: cq25
    text: What interest-calculation schedule is on file for a loan?
  - id: cq26
    text: What rate-reset schedule is on file for a loan?
  - id: cq27
    text: What initial rate-setting event is on file for a loan?
  - id: cq28
    text: Is a loan marked interest-only?
  - id: cq29
    text: Does a loan allow negative amortization?
  - id: cq30
    text: Does a loan have a balloon payment?
  - id: cq31
    text: "Does a loan's repayment structure and schedule show full or partial amortization?"
  - id: cq32
    text: "What prepayment terms apply to a loan, including whether they permit prepayment?"
  - id: cq33
    text: "Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
  - id: cq34
    text: Is a loan secured?
  - id: cq35
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq36
    text: Which collateral is linked to a collateral-backed loan?
  - id: cq37
    text: Which security agreement identifies the rights granted over the collateral linked to a loan?
  - id: cq38
    text: "Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?"
  - id: cq39
    text: "What is the appraised value of collateral linked to a loan, and what is its as-of date?"
  - id: cq40
    text: What is the loan-to-value ratio for a collateralized loan?
  - id: cq41
    text: "What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
  - id: cq42
    text: What payment history is recorded for a loan?
  - id: cq43
    text: "Which individual payment transactions actually made are contained in a loan's payment history?"
  - id: cq44
    text: Which sub-facilities form part of a credit facility?
  - id: cq45
    text: What amount of borrowing capacity was assessed for the borrower as of a specified date?
  - id: cq46
    text: How much credit remains available under a credit facility?
classes:
  Loan:
    meaning: A debt set up and serviced under agreed terms.
    aliases: []
    properties: {}
  CreditFacility:
    meaning: "An arrangement under which a borrower can draw credit over time, potentially through sub-facilities."
    aliases: []
    properties: {}
  Borrower:
    meaning: A party that owes repayment.
    aliases: []
    properties: {}
  Lender:
    meaning: A party that provides credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "A party that collects loan payments on the lender's behalf."
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: An agreement carrying the agreed debt amount and dates.
    aliases: []
    properties: {}
  SubFacility:
    meaning: A portion of a credit facility that can be identified within it.
    aliases: []
    properties: {}
  BorrowingCapacity:
    meaning: "The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "Terms that govern payment of a loan's principal."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms that govern a loan's interest payments and identify the day-count convention for accrual."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms governing principal repayment before maturity and any applicable penalty period.
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: An interest rate that is fixed rather than subject to variable-rate changes.
    aliases: []
    properties: {}
  VariableInterestRate:
    meaning: "An interest rate that can vary, including floating benchmark-based or institution-managed rates."
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: The overall schedule of payments due on a loan.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "The schedule showing how a loan's debt balance changes over time."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The schedule of dates on which loan principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The schedule of dates on which loan interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: The schedule of dates on which loan interest is calculated.
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates on which a variable loan rate may reset.
    aliases: []
    properties: {}
  InitialRateSettingEvent:
    meaning: "An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: The record of actual payment transactions made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "One actual payment transaction within a loan's payment history, rather than a scheduled payment."
    aliases: []
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement granting rights over pledged collateral.
    aliases: []
    properties: {}
  CreditEnhancementAgreement:
    meaning: An arrangement protecting a credit-enhancement beneficiary.
    aliases: []
    properties: {}
  CreditEnhancementBeneficiary:
    meaning: A party protected under a credit-enhancement agreement.
    aliases: []
    properties: {}
relationships: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 18 — assistant

I’ve added collateral, the two agreements, and the beneficiary as separate concepts. I have **not** added a standalone guarantee record, because you said this work does not establish one.

You also distinguish a **guaranteed loan**. Does the agent need to identify a guaranteed loan as a separate kind of record for any of these questions or five checks, or is “guaranteed” a characteristic of a Loan? In particular, what on file would let it answer the question about guaranty support without a separate guarantee record?

### Turn 19 — user

I’d keep **guaranteed loan** as a distinct kind of loan, not just a “guaranteed” yes/no field. That identification lets the agent say the loan is classified as secured by a guaranty.

It does **not** let the agent identify the guarantor, find a guarantee document, or verify the guaranty’s terms—we haven’t established records or connections for those. And it does not satisfy the collateral-link check: if no collateral is linked, that check reports that collateral support was not verified, without deciding whether the guaranty is valid.

### Turn 19 — assistant

That distinction is clear: identifying a guaranteed loan tells the agent it is treated as secured by a guaranty, but supplies no guarantor, document, or guaranty terms. The collateral-link check remains independent.

This tool cannot record “Guaranteed Loan is a kind of Loan” as a class connection. To keep **Guaranteed Loan** separate, is there a real record or workflow connection between it and the **Loan** being serviced, beyond that classification? If not, I’ll need to represent the distinction on Loan rather than invent a connection.

### Turn 20 — user

No. A **guaranteed loan is the loan being serviced**, classified by how its repayment is secured; it isn’t a second record connected to a loan.

If the tool can’t represent that kind-of distinction, record “guaranteed loan” as a **loan classification** for this purpose, not as an invented connection or a claim that there’s a separate guarantee document on file. That classification alone won’t verify the guaranty’s details or satisfy the collateral-link check.

### Turn 20 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - id: cq35\n    text: Is a secured loan classified as a guaranteed loan?"
}
```

### Turn 20 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 20 — assistant

I’ve revised that requirement to ask whether a secured loan is **classified as a guaranteed loan**. It won’t imply a separate loan, guarantee document, or verified guaranty. The collateral question and collateral-link check remain separate.

One remaining class decision: for the collateral appraisal question, does the agent need to identify a **dated valuation record** separately, or does it read the appraised value and as-of date directly on **Collateral**?

### Turn 21 — user

Keep a **dated collateral value** as a separately identifiable record linked **from the collateral**. It carries both the appraised value and its as-of date. Don’t treat one current value on the collateral as enough: the date tells us which valuation we’re using, and collateral values can change.

### Turn 21 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CollateralValue:\n    meaning: A separately identifiable appraisal of collateral carrying a value and an as-of date."
}
```

### Turn 21 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 21 — assistant

The class list now covers the loan and facility, their parties and agreements, distinct terms and rates, six schedules, the initial rate-setting event, actual payment records, collateral, and dated collateral values. I’ve left guarantee documents and guarantors out because we have no established records for them; “guaranteed loan” will be a classification on Loan, not a second loan record.

**Does that class-level picture match what the agent needs to identify, or is a necessary kind of record missing before we connect them?**

### Turn 22 — user

It’s a good start, but a few things needed for the questions we agreed are still missing.

- Keep **principal**, **interest owed**, and **accrued but unpaid interest** distinguishable from the rate and from the loan balance. Accrued interest has an amount and an as-of date.
- Identify the **day-count convention** connected to interest payment terms; it tells us the basis for calculating accrual.
- For a collateralized loan, keep the **loan-to-value ratio** and **combined loan-to-value ratio** separately identifiable. The dated appraisal is the value used, not either ratio.
- Keep the relevant **loan and facility classifications** available: for example, secured, collateralized, guaranteed or unsecured loans, and open-end versus closed-end credit. Those distinctions affect how we answer the questions, but they shouldn’t become invented second records connected to the loan.

We may also need to distinguish actual principal payments, interest payments, interest calculations, and rate resets when examining events. None is interchangeable with its schedule. I’d add those distinctions before treating the class-level picture as complete.

### Turn 22 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  DayCountConvention:\n    meaning: The basis identified by interest payment terms for calculating interest accrual.\n  LoanToValueRatio:\n    meaning: A separately identifiable ratio comparing a collateralized loan to the collateral value used.\n  CombinedLoanToValueRatio:\n    meaning: A separately identifiable ratio accounting for total debt secured by an asset rather than only this loan's principal."
}
```

### Turn 22 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 22 — assistant

You’re right: the class picture was not complete. I’ve added the **Day-Count Convention** and the two separately identifiable ratios. I have not yet decided how to represent the three amounts or the actual events; their distinction from rates, balances, and schedules is important, but that alone doesn’t tell us whether they are separate records.

For **principal, interest owed, and accrued but unpaid interest**, which does the agent retrieve as a separately identifiable record, and which does it read as an amount on the loan? You’ve specified that accrued interest also has an as-of date.

### Turn 23 — user

Keep all three separately identifiable for this work.

The **loan’s principal amount** and **loan balance** are numeric figures on the loan. Separately, the loan is linked to **principal**, which has an outstanding amount, and to **interest owed**, which also has an outstanding amount. Those let us ask what remains owing in each category without treating the balance as a substitute for either one.

**Accrued but unpaid interest** needs its own amount and as-of date. It isn’t an actual interest payment or an interest rate. One caution: we’ve established its meaning and fields, but not a specific link from the loan to that accrued-interest record, so I wouldn’t invent one just to make it retrievable.

### Turn 23 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Principal:\n    meaning: Principal linked to a loan, with an outstanding amount distinct from its agreed principal amount and balance.\n  InterestOwed:\n    meaning: Interest owed on a loan, with an outstanding amount distinct from the interest rate and loan balance.\n  AccruedUnpaidInterest:\n    meaning: Interest accrued but not yet paid, carrying an amount and as-of date and distinct from a payment or interest rate."
}
```

### Turn 23 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 23 — assistant

I’ve added **Principal**, **Interest Owed**, and **Accrued but Unpaid Interest** as separate concepts. I’ll keep the loan’s agreed principal amount and balance as figures on Loan, and I won’t invent a loan-to-accrued-interest link.

Before adding the actual-event distinctions: **which agreed question or verification check needs the agent to identify an actual principal payment, interest payment, interest calculation, or rate reset as a separate event record?** That will tell us which need classes, rather than assuming every event has a record because its schedule does.

### Turn 24 — user

None of the agreed questions or five checks requires those four **specific event records**.

The payment-history check needs actual **individual payment transactions**, but it does not require each transaction to be identified separately as a principal-payment or interest-payment event. The variable-rate check needs the **reset schedule**, not evidence that a reset has occurred. Likewise, the interest questions need the accrual basis and calculation schedule, not an actual interest-calculation event.

Those events are meaningful distinctions if you later ask what happened on a particular date. For this agreed scope, I wouldn’t add them as required records or invent links from them to the schedules or payment history.

### Turn 24 — assistant

For this scope, I’ll keep the existing **Payment Transaction** record but won’t add separate principal-payment, interest-payment, interest-calculation, or rate-reset event classes. The agreed questions and checks need the transactions, accrual basis, and schedules—not those four event records.

That closes the class review, subject to the loan and facility classifications becoming decision-relevant properties rather than second records. **Does that match your intended class list before we work through how the records connect?**

### Turn 25 — user

Yes, for the questions and five checks we’ve agreed, that’s the right working set. Keep principal, interest owed, accrued but unpaid interest, the day-count convention, both collateral ratios, and the dated collateral value distinct as discussed.

One caution on classifications: they describe the **kind of loan, credit agreement, or facility**, not necessarily a set of independent decision fields on every loan. Your tool can represent them as classifications where it cannot represent kinds directly. Don’t infer a collateral link, guarantee document, or rate-reset event merely from a classification.

### Turn 25 — assistant

The working class set is confirmed. Classifications will describe the kind of loan, agreement, or facility; they won’t stand in for collateral links, guarantee documents, or events.

Now I’ll connect the records, starting with the parties. **How does the agent get from a Loan or Credit Facility to its Borrower and Lender, and from a Loan to the Servicer that collects payments?** Are those direct recorded links, or does any path run through the Credit Agreement or another record?

### Turn 26 — user

They’re **direct links**. From a loan, you can identify its borrower and lender, and the servicer responsible for collecting payments on the lender’s behalf. A credit facility also directly identifies its borrower and lender; you don’t have to traverse a separate credit agreement to find them.

The credit agreement can identify its own borrower and lender as well. Don’t infer that the loan’s servicer is its lender, or that a facility has the same servicer link we use for a loan.

### Turn 26 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasBorrower\n    from: Loan\n    to: Borrower\n    meaning: Identifies the borrower owing repayment on the loan.\n  - name: hasLender\n    from: Loan\n    to: Lender\n    meaning: Identifies the lender providing credit for the loan.\n  - name: servicedBy\n    from: Loan\n    to: Servicer\n    meaning: Identifies the party collecting the loan's principal and interest payments on the lender's behalf.\n  - name: hasBorrower\n    from: CreditFacility\n    to: Borrower\n    meaning: Identifies the borrower on the facility directly.\n  - name: hasLender\n    from: CreditFacility\n    to: Lender\n    meaning: Identifies the lender on the facility directly.\n  - name: hasBorrower\n    from: CreditAgreement\n    to: Borrower\n    meaning: Identifies the borrower on the credit agreement.\n  - name: hasLender\n    from: CreditAgreement\n    to: Lender\n    meaning: Identifies the lender on the credit agreement."
}
```

### Turn 26 — tool

Applied. Added 7, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 26 — assistant

I’ve recorded direct borrower and lender links from Loan, Credit Facility, and Credit Agreement, plus the direct Loan-to-Servicer link. I have not added a facility servicer link.

For the remaining **facility questions**, what is the recorded path to each of these: a facility’s sub-facilities, its governing credit agreement, and the borrower’s dated borrowing capacity? In particular, is borrowing capacity linked directly to the borrower, rather than to a facility?

### Turn 27 — user

A **credit facility directly identifies its sub-facilities**. The **borrower directly has borrowing capacity**, recorded as an assessed amount; it is not a figure linked to a particular facility.

I’d correct two parts of the proposed path. A credit facility is itself a form of credit agreement, so we haven’t established a separate link from the facility to a *governing credit agreement* record. Also, borrowing capacity is understood as an assessment at a point in time, but we haven’t established an as-of-date field for it. I wouldn’t add one on that basis.

### Turn 27 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasSubFacility\n    from: CreditFacility\n    to: SubFacility\n    meaning: Identifies a sub-facility forming part of the credit facility.\n  - name: hasBorrowingCapacity\n    from: Borrower\n    to: BorrowingCapacity\n    meaning: Identifies the borrower's separately assessed capacity to repay."
}
```

### Turn 27 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 27 — assistant

I’ve recorded the direct Facility-to-Sub-facility and Borrower-to-Borrowing-Capacity links. I have **not** added a facility-to-agreement link: you described a facility as a form of credit agreement, not a separate agreement it points to. The borrowing-capacity question currently asks for an amount “as of a specified date”; I’ll revisit that wording when we capture its properties, since you have not established a date field.

For the **loan’s terms and rates**, what paths are actually recorded from Loan to Principal Repayment Terms, Interest Payment Terms, Prepayment Terms, and the applicable Fixed or Variable Interest Rate? Does Prepayment Terms connect through Principal Repayment Terms, directly from Loan, or both?

### Turn 28 — user

The **rate** has a direct recorded path: the loan links to its applicable fixed or variable interest rate.

The repayment terms are different. We have a recorded direction from **principal repayment terms to the principal they govern**, and from **interest payment terms to the interest they govern**. The loan links to its principal and interest, so those give us a way to identify which obligation the terms concern. But I would **not** record a direct Loan-to-terms link as established here.

Prepayment terms are a particular form of principal repayment terms, not a separate agreement we’ve established as linked either directly to the loan or through another terms record. So the answer to “directly, through principal repayment terms, or both?” is **none of those as a recorded link**. We can still ask what prepayment terms apply, but should not invent a path for them.

### Turn 28 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasPrincipal\n    from: Loan\n    to: Principal\n    meaning: Identifies the principal obligation linked to the loan.\n  - name: governedByPrincipalTerms\n    from: PrincipalRepaymentTerms\n    to: Principal\n    meaning: Identifies the principal whose repayment these terms govern.\n  - name: hasInterestOwed\n    from: Loan\n    to: InterestOwed\n    meaning: Identifies the interest owed linked to the loan.\n  - name: hasFixedRate\n    from: Loan\n    to: FixedInterestRate\n    meaning: Identifies the fixed interest rate applicable to the loan when its rate is fixed.\n  - name: hasVariableRate\n    from: Loan\n    to: VariableInterestRate\n    meaning: Identifies the variable interest rate applicable to the loan when its rate is variable."
}
```

### Turn 28 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 28 — assistant

I’ve recorded the direct Loan-to-rate links and Loan-to-Principal and Loan-to-Interest-Owed links, plus the stated direction from Principal Repayment Terms to Principal. I have **not** added a direct Loan-to-terms link or an invented connection for Prepayment Terms; that path remains open.

For the other terms link, when you say **Interest Payment Terms point to “the interest they govern,”** do you mean the **Interest Owed** record we’ve identified, or a different interest record?

### Turn 29 — user

I mean the **interest obligation linked to the loan**—the same interest record we’ve been calling “interest owed,” with its outstanding amount. Interest payment terms govern payment of that interest.

That’s distinct from the **interest rate** applied to the loan, and from **accrued but unpaid interest** measured as of a date. The terms also identify the day-count convention used to calculate accrual.

### Turn 29 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: governsInterest\n    from: InterestPaymentTerms\n    to: InterestOwed\n    meaning: Identifies the interest obligation whose payment these terms govern.\n  - name: identifiesDayCountConvention\n    from: InterestPaymentTerms\n    to: DayCountConvention\n    meaning: Identifies the day-count basis for calculating interest accrual under the interest payment terms."
}
```

### Turn 29 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 29 — assistant

I’ve connected Interest Payment Terms to **Interest Owed** and to the **Day-Count Convention**. That keeps the interest obligation distinct from the rate and from accrued but unpaid interest.

For the six schedules, which direct links are actually on file? In particular, does **Loan** link separately to its overall payment, amortization, principal-payment, interest-payment, and interest-calculation schedules, while the **variable rate** links to its reset schedule—or are any reached by a different path?

### Turn 30 — user

The **loan links directly to each of those schedules**, including the **interest-rate reset schedule**. Don’t put the reset-schedule link on the variable-rate record.

So the recorded path is from the loan to its overall payment schedule, amortization schedule, principal-payment schedule, interest-payment schedule, interest-calculation schedule, and rate-reset schedule. For the variable-rate setup check, we verify that the **same loan** has both a variable interest rate and a reset schedule.

### Turn 30 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasLoanPaymentSchedule\n    from: Loan\n    to: LoanPaymentSchedule\n    meaning: Identifies the overall payment schedule linked to the loan.\n  - name: hasAmortizationSchedule\n    from: Loan\n    to: AmortizationSchedule\n    meaning: Identifies the schedule showing how the loan balance changes.\n  - name: hasPrincipalPaymentSchedule\n    from: Loan\n    to: PrincipalPaymentSchedule\n    meaning: Identifies the principal-payment dates scheduled for the loan.\n  - name: hasInterestPaymentSchedule\n    from: Loan\n    to: InterestPaymentSchedule\n    meaning: Identifies the interest-payment dates scheduled for the loan.\n  - name: hasInterestCalculationSchedule\n    from: Loan\n    to: InterestCalculationSchedule\n    meaning: Identifies the interest-calculation dates scheduled for the loan.\n  - name: hasInterestRateResetSchedule\n    from: Loan\n    to: InterestRateResetSchedule\n    meaning: Identifies the rate-reset dates scheduled for the loan."
}
```

### Turn 30 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 30 — assistant

I’ve recorded all six schedules as direct links **from Loan**, including the reset schedule. The variable-rate check will look for both a variable rate and a reset schedule on the same loan; it won’t infer a schedule from the rate.

For the **initial rate-setting event and payment records**, are these the recorded links: Loan to Initial Rate-Setting Event; Loan to Payment History; and Payment History to its individual Payment Transactions? Are there any other paths among those records needed for the agreed questions?

### Turn 31 — user

Yes. The loan links directly to the event at which its initial interest rate is set and to its payment history. The payment history, in turn, contains the individual payment transactions actually made.

Those are the paths needed for the agreed questions. I’d call the first one a **rate-setting event**, rather than imply it must occur on the initial funding date. We haven’t established another link among these records.

### Turn 31 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasInitialRateSettingEvent\n    from: Loan\n    to: InitialRateSettingEvent\n    meaning: Identifies the event where the loan's initial rate is established, without implying it occurs on the initial exchange date.\n  - name: hasPaymentHistory\n    from: Loan\n    to: PaymentHistory\n    meaning: Identifies the loan's record of payments actually made.\n  - name: containsPaymentTransaction\n    from: PaymentHistory\n    to: PaymentTransaction\n    meaning: Identifies an actual payment transaction contained in the loan's history."
}
```

### Turn 31 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 31 — assistant

I’ve recorded those three paths. The rate-setting event does not imply the initial exchange date, and a transaction in payment history is evidence of an actual payment rather than a scheduled one.

For the **collateral and enhancement questions**, how does the agent travel from Loan to Collateral, then to the Security Agreement and dated Collateral Value? How does it reach the Credit-Enhancement Agreement and its Beneficiary? Please distinguish direct links from paths through another record.

### Turn 32 — user

For a loan identified as **secured**, the recorded link runs from the secured loan **to its collateral**. The collateral, in turn, links **to each dated collateral value** recorded for it.

The security-agreement link runs the other way from the path you proposed: a **security agreement identifies the collateral it secures**. You can find an agreement covering particular collateral by looking for agreements that identify it, but we haven’t established a direct link from the loan to the security agreement.

A **credit-enhancement agreement identifies its beneficiary** directly. We haven’t established a link from the loan or its collateral to that agreement, so I wouldn’t claim the agent can travel from a particular loan to its beneficiary through a recorded path. For a collateralized loan, its loan-to-value and combined loan-to-value ratios are separately linked from the loan.

### Turn 32 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasCollateral\n    from: Loan\n    to: Collateral\n    meaning: Identifies collateral linked to a secured loan; its absence does not establish that the loan is unsecured.\n  - name: hasCollateralValue\n    from: Collateral\n    to: CollateralValue\n    meaning: Identifies a dated appraised value recorded for the collateral.\n  - name: identifiesSecuredCollateral\n    from: SecurityAgreement\n    to: Collateral\n    meaning: Identifies the collateral over which the security agreement grants rights.\n  - name: identifiesBeneficiary\n    from: CreditEnhancementAgreement\n    to: CreditEnhancementBeneficiary\n    meaning: Identifies the party protected by the credit-enhancement agreement.\n  - name: hasLoanToValueRatio\n    from: Loan\n    to: LoanToValueRatio\n    meaning: Identifies the loan-to-value ratio separately recorded for a collateralized loan.\n  - name: hasCombinedLoanToValueRatio\n    from: Loan\n    to: CombinedLoanToValueRatio\n    meaning: Identifies the combined loan-to-value ratio separately recorded for a collateralized loan."
}
```

### Turn 32 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 32 — assistant

I’ve recorded the directions you specified: Loan → Collateral → dated Collateral Value; Security Agreement → Collateral; Credit-Enhancement Agreement → Beneficiary; and Loan → each ratio. There is no recorded path from a particular loan to a credit-enhancement agreement, so I won’t claim its beneficiary can yet be identified for that loan.

**Prepayment Terms** still have no recorded connection. For the agreed prepayment question and review check, how does the agent find the terms that apply to a particular loan? If no path is on file, we should mark that requirement as not yet answerable rather than invent one.

### Turn 33 — user

There’s **no recorded path from a particular loan to its prepayment terms**. Prepayment terms carry the penalty period in months, but without an established way to associate those terms with the loan, the agent cannot reliably answer which terms apply to that loan.

So yes—mark the loan-specific question and review as **not yet fully answerable**, rather than inventing a link. If the applicable prepayment terms are supplied to a reviewer, the agent can check whether the penalty timing is recorded; it should not claim it found those terms through the loan record.

### Turn 33 — assistant

Understood. I’ll leave the loan-to-prepayment-terms path **open**. The loan-specific question and review cannot be fully completed from the recorded links; if a reviewer supplies the applicable terms, the agent can check whether their penalty period is recorded in months.

A similar connection remains open for **Accrued but Unpaid Interest**. You’ve said it is a separate dated amount, but not linked directly from Loan. Is there a recorded connection from **Interest Owed** or another identified record to that accrued-interest record, or is it also currently unlinked?

### Turn 34 — user

It’s currently **unlinked** in the connections we’ve established. Accrued but unpaid interest has an amount and an as-of date, but there’s no recorded link to the loan, its interest obligation, or another record that would let us retrieve it for a particular loan.

We can describe what such an amount means, but we shouldn’t claim the agent can identify a loan’s accrued interest through the present links.

### Turn 34 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 34 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan or credit facility?
  - id: cq2
    text: Who is the lender on a loan or credit facility?
  - id: cq3
    text: "Which servicer collects a loan's principal and interest payments on the lender's behalf?"
  - id: cq4
    text: "What is a loan's agreed principal amount?"
  - id: cq5
    text: What is the debt amount agreed in a credit agreement?
  - id: cq6
    text: "What is a loan's current balance?"
  - id: cq7
    text: "What is a loan's outstanding principal?"
  - id: cq8
    text: "What is a loan's outstanding interest?"
  - id: cq9
    text: "What is a credit facility's credit limit?"
  - id: cq10
    text: How much credit has been extended under a credit facility?
  - id: cq11
    text: "When is a loan's initial exchange date?"
  - id: cq12
    text: When does a loan mature?
  - id: cq13
    text: Which interest rate applies to a loan as of a specified date?
  - id: cq14
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq15
    text: "What is a variable-rate loan's reset schedule?"
  - id: cq16
    text: What interest rate cap applies to a variable-rate loan?
  - id: cq17
    text: "How many months until a variable-rate loan's first rate change?"
  - id: cq18
    text: "Which terms govern a loan's principal repayment?"
  - id: cq19
    text: "Which terms govern a loan's interest payments?"
  - id: cq20
    text: "Which day-count convention governs a loan's interest accrual?"
  - id: cq21
    text: What overall loan payment schedule is on file?
  - id: cq22
    text: What amortization schedule is on file for a loan?
  - id: cq23
    text: What principal-payment schedule is on file for a loan?
  - id: cq24
    text: What interest-payment schedule is on file for a loan?
  - id: cq25
    text: What interest-calculation schedule is on file for a loan?
  - id: cq26
    text: What rate-reset schedule is on file for a loan?
  - id: cq27
    text: What initial rate-setting event is on file for a loan?
  - id: cq28
    text: Is a loan marked interest-only?
  - id: cq29
    text: Does a loan allow negative amortization?
  - id: cq30
    text: Does a loan have a balloon payment?
  - id: cq31
    text: "Does a loan's repayment structure and schedule show full or partial amortization?"
  - id: cq32
    text: "What prepayment terms apply to a loan, including whether they permit prepayment?"
  - id: cq33
    text: "Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
  - id: cq34
    text: Is a loan secured?
  - id: cq35
    text: Is a secured loan classified as a guaranteed loan?
  - id: cq36
    text: Which collateral is linked to a collateral-backed loan?
  - id: cq37
    text: Which security agreement identifies the rights granted over the collateral linked to a loan?
  - id: cq38
    text: "Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?"
  - id: cq39
    text: "What is the appraised value of collateral linked to a loan, and what is its as-of date?"
  - id: cq40
    text: What is the loan-to-value ratio for a collateralized loan?
  - id: cq41
    text: "What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
  - id: cq42
    text: What payment history is recorded for a loan?
  - id: cq43
    text: "Which individual payment transactions actually made are contained in a loan's payment history?"
  - id: cq44
    text: Which sub-facilities form part of a credit facility?
  - id: cq45
    text: What amount of borrowing capacity was assessed for the borrower as of a specified date?
  - id: cq46
    text: How much credit remains available under a credit facility?
classes:
  Loan:
    meaning: A debt set up and serviced under agreed terms.
    aliases: []
    properties: {}
  CreditFacility:
    meaning: "An arrangement under which a borrower can draw credit over time, potentially through sub-facilities."
    aliases: []
    properties: {}
  Borrower:
    meaning: A party that owes repayment.
    aliases: []
    properties: {}
  Lender:
    meaning: A party that provides credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "A party that collects loan payments on the lender's behalf."
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: An agreement carrying the agreed debt amount and dates.
    aliases: []
    properties: {}
  SubFacility:
    meaning: A portion of a credit facility that can be identified within it.
    aliases: []
    properties: {}
  BorrowingCapacity:
    meaning: "The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "Terms that govern payment of a loan's principal."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms that govern a loan's interest payments and identify the day-count convention for accrual."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms governing principal repayment before maturity and any applicable penalty period.
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: An interest rate that is fixed rather than subject to variable-rate changes.
    aliases: []
    properties: {}
  VariableInterestRate:
    meaning: "An interest rate that can vary, including floating benchmark-based or institution-managed rates."
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: The overall schedule of payments due on a loan.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "The schedule showing how a loan's debt balance changes over time."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The schedule of dates on which loan principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The schedule of dates on which loan interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: The schedule of dates on which loan interest is calculated.
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates on which a variable loan rate may reset.
    aliases: []
    properties: {}
  InitialRateSettingEvent:
    meaning: "An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: The record of actual payment transactions made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "One actual payment transaction within a loan's payment history, rather than a scheduled payment."
    aliases: []
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement granting rights over pledged collateral.
    aliases: []
    properties: {}
  CreditEnhancementAgreement:
    meaning: An arrangement protecting a credit-enhancement beneficiary.
    aliases: []
    properties: {}
  CreditEnhancementBeneficiary:
    meaning: A party protected under a credit-enhancement agreement.
    aliases: []
    properties: {}
  CollateralValue:
    meaning: A separately identifiable appraisal of collateral carrying a value and an as-of date.
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: The basis identified by interest payment terms for calculating interest accrual.
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: A separately identifiable ratio comparing a collateralized loan to the collateral value used.
    aliases: []
    properties: {}
  CombinedLoanToValueRatio:
    meaning: "A separately identifiable ratio accounting for total debt secured by an asset rather than only this loan's principal."
    aliases: []
    properties: {}
  Principal:
    meaning: "Principal linked to a loan, with an outstanding amount distinct from its agreed principal amount and balance."
    aliases: []
    properties: {}
  InterestOwed:
    meaning: "Interest owed on a loan, with an outstanding amount distinct from the interest rate and loan balance."
    aliases: []
    properties: {}
  AccruedUnpaidInterest:
    meaning: "Interest accrued but not yet paid, carrying an amount and as-of date and distinct from a payment or interest rate."
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the borrower owing repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the lender providing credit for the loan.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting the loan's principal and interest payments on the lender's behalf."
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: Identifies the borrower on the facility directly.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: Identifies the lender on the facility directly.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: Identifies the borrower on the credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: Identifies the lender on the credit agreement.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: Identifies a sub-facility forming part of the credit facility.
    aliases: []
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "Identifies the borrower's separately assessed capacity to repay."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: Identifies the principal obligation linked to the loan.
    aliases: []
  - name: governedByPrincipalTerms
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: Identifies the principal whose repayment these terms govern.
    aliases: []
  - name: hasInterestOwed
    from: Loan
    to: InterestOwed
    meaning: Identifies the interest owed linked to the loan.
    aliases: []
  - name: hasFixedRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applicable to the loan when its rate is fixed.
    aliases: []
  - name: hasVariableRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applicable to the loan when its rate is variable.
    aliases: []
  - name: governsInterest
    from: InterestPaymentTerms
    to: InterestOwed
    meaning: Identifies the interest obligation whose payment these terms govern.
    aliases: []
  - name: identifiesDayCountConvention
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count basis for calculating interest accrual under the interest payment terms.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies the overall payment schedule linked to the loan.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies the schedule showing how the loan balance changes.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies the principal-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies the interest-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies the interest-calculation dates scheduled for the loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies the rate-reset dates scheduled for the loan.
    aliases: []
  - name: hasInitialRateSettingEvent
    from: Loan
    to: InitialRateSettingEvent
    meaning: "Identifies the event where the loan's initial rate is established, without implying it occurs on the initial exchange date."
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of payments actually made."
    aliases: []
  - name: containsPaymentTransaction
    from: PaymentHistory
    to: PaymentTransaction
    meaning: "Identifies an actual payment transaction contained in the loan's history."
    aliases: []
  - name: hasCollateral
    from: Loan
    to: Collateral
    meaning: Identifies collateral linked to a secured loan; its absence does not establish that the loan is unsecured.
    aliases: []
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValue
    meaning: Identifies a dated appraised value recorded for the collateral.
    aliases: []
  - name: identifiesSecuredCollateral
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the collateral over which the security agreement grants rights.
    aliases: []
  - name: identifiesBeneficiary
    from: CreditEnhancementAgreement
    to: CreditEnhancementBeneficiary
    meaning: Identifies the party protected by the credit-enhancement agreement.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: Identifies the loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: Identifies the combined loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 34 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - id: cq45\n    text: What amount of borrowing capacity has been assessed for the borrower?"
}
```

### Turn 34 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 34 — assistant

I’ve checked the live model: **Accrued but Unpaid Interest** is present, but it has no recorded relationship, and you’ve confirmed there is no path to it from a particular loan. I’ve also corrected the borrowing-capacity question so it no longer asks for an as-of date we haven’t established.

Since none of the agreed questions or five checks asks the agent to retrieve accrued interest, should I **remove that class from this working model for now**, while retaining the distinction in our notes, or is there an agreed task that needs it despite the missing link?

### Turn 35 — user

Yes—remove **Accrued but Unpaid Interest** from this working model for now. None of the agreed questions or five checks needs to retrieve that dated amount, and we have no recorded path to associate it with a particular loan.

Keep the distinction in the notes: accrued but unpaid interest is not the same as interest owed, the interest rate, or an actual payment. If a later task needs the loan-specific accrued amount, we’ll need to establish how it is associated with the loan before adding it back.

### Turn 35 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [
    "AccruedUnpaidInterest"
  ],
  "relationships": [],
  "properties": [],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

### Turn 35 — tool

Removed 1 element(s) — classes: AccruedUnpaidInterest.

CONSISTENCY CHECK — no new problems from this edit.

### Turn 35 — assistant

I’ve removed **Accrued but Unpaid Interest** from the working model. We’ll keep the distinction in view: it is neither Interest Owed, an interest rate, nor an actual payment, and a later loan-specific task would need a confirmed way to associate it with the loan.

Before we leave payment relationships: the recorded route to an actual payment is **Loan → Payment History → Payment Transaction**. Does a payment transaction also have its **own direct recorded link to the Loan**, or is the history the only established route?

### Turn 36 — user

The **payment history is the only established route**: Loan → Payment History → individual payment transaction. We haven’t established a separate direct link from a transaction back to the loan.

That’s enough for the payment-record check: confirm the loan has a history and that the history contains individual transactions.

### Turn 36 — assistant

Confirmed: **Loan → Payment History → Payment Transaction** is the only established route. I won’t add a direct transaction-to-loan link.

One relationship gap remains. You’ve ruled out a recorded link from **Loan** or **Principal Repayment Terms** to **Prepayment Terms**. Do the prepayment terms directly identify the specific **Principal** whose early repayment they govern, or is that connection also not recorded?

### Turn 37 — user

That connection is **not separately recorded** either. Prepayment terms are a form of principal repayment terms, but we haven’t established a distinct link from prepayment terms to a particular principal record.

I wouldn’t borrow the general principal-repayment-terms link to imply that we can identify a specific loan’s prepayment terms. The loan-specific path remains open.

### Turn 37 — assistant

Understood. **Prepayment Terms** has no recorded link to a particular Principal or Loan; the general repayment-terms link cannot stand in for one. That leaves the loan-specific prepayment question and review open, even though a reviewer could inspect terms supplied separately.

For the collateral ratios, we have **Loan → Collateral → Collateral Value** and separate **Loan → each ratio** links. Is there also a recorded link from either ratio to the **specific dated Collateral Value used**, or must the agent determine the value used another way?

### Turn 38 — user

There’s **no recorded link** from either ratio to a particular dated collateral value. The collateralized loan identifies its loan-to-value and combined loan-to-value ratios separately; its collateral has dated appraisals. Those connections let us see the ratios and available values, but not prove which appraisal was used to calculate a given ratio.

So the agent should not select a valuation and present it as the ratio’s basis without further evidence.

### Turn 38 — assistant

I’ve recorded that limitation: the agent can find the ratios and the collateral’s dated appraisals, but **cannot establish which appraisal was used for either ratio** from the current links.

The relationship review has found one class with no recorded connection—**Prepayment Terms**—and a separate missing path from a particular loan to its credit-enhancement agreement. Neither should be filled by inference. For Prepayment Terms, is there any **recorded workflow connection** to another class we’ve named that we haven’t discussed, or are they available only when someone supplies the terms for review?

### Turn 39 — user

There’s no other recorded connection to the classes we’ve discussed. Prepayment terms describe early principal repayment, but that description doesn’t give us a path to the terms for a particular loan.

For now, someone would need to supply the applicable terms for review. The agent can then check whether the penalty period is recorded in months, but it cannot find or verify that those terms apply to the loan from the current connections.

### Turn 39 — assistant

That confirms the gap: **Prepayment Terms** can be inspected when supplied, but the model has no recorded relationship connecting them to any other class. I won’t manufacture one. This part of the class-and-relationship model remains incomplete for the loan-specific prepayment question.

To keep the acceptance test honest, should **“What prepayment terms apply to a loan?”** remain an explicitly open requirement, or should we change it to **“Given prepayment terms supplied for review, what do they say about prepayment and the penalty period?”**? The second wording would no longer claim the agent can find the terms for a loan.

### Turn 40 — user

Keep **“What prepayment terms apply to this loan?”** as an explicitly open requirement. Changing it to the second question would hide the missing connection.

You can add the narrower, answerable task alongside it: **given prepayment terms supplied for review, what do they say about early repayment, and is a penalty period recorded in months?** The agent can inspect those terms, but it must not claim they apply to a particular loan unless that association is established.

### Turn 40 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Given prepayment terms supplied for review, what do they say about early repayment?\n  - text: Given prepayment terms supplied for review, is a penalty period recorded, and what is its length in months?"
}
```

### Turn 40 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 40 — assistant

I’ve added the two narrower questions **alongside** the loan-specific requirement, not in place of it. The agent can inspect supplied terms but cannot establish that they apply to a particular loan.

The relationship pass is otherwise mapped, with known gaps: no link for Prepayment Terms, no loan-to-credit-enhancement-agreement path, and no link identifying which dated appraisal underlies a ratio. **Does that accurately summarize the confirmed connections and the unresolved paths before we specify the values the agent needs to read?**

### Turn 41 — user

Yes, that summarizes the **unresolved paths** accurately. Keep those gaps explicit rather than filling them by inference.

One qualification to “otherwise mapped”: the secured-loan-to-collateral link is the route checked for collateral support, but a **guaranteed loan** can be secured without that link. And the ratio links belong to a **collateralized loan**, not indiscriminately to every loan. With those scope points preserved, we can move on to the values.

### Turn 41 — assistant

Yes. I’ll preserve both qualifications: a guaranteed loan can be secured without collateral, and the ratio links are relevant to collateralized loans only. The unresolved paths remain open.

For the **Loan** values, I propose only fields tied to your questions: agreed principal amount, current balance, initial exchange date, maturity date, and indicators for interest-only, negative amortization, and a balloon payment. To distinguish secured, collateralized, guaranteed, or unsecured loans without inventing extra records, we also need a loan classification. **Are these values actually recorded on the Loan, and which, if any, are instead determined from its terms or schedule?**

### Turn 42 — user

Yes. The loan carries the **principal amount**, **loan balance**, **initial exchange date**, and **maturity date**. It also carries separate yes/no indicators for **interest-only**, **negative amortization**, and a **balloon payment**. Those indicators answer those specific questions; they do not, by themselves, establish whether the repayment schedule is fully or partly amortizing.

Two loan values from our earlier rate questions should be included as well: an **interest rate cap** and the **term until the first rate change**, recorded in months. The applicable fixed or variable rate and the reset schedule remain separate records linked to the loan.

I’d treat secured, collateralized, guaranteed, and unsecured as **loan classifications** in this tool, not claim there is an established classification field on the loan. Classification also isn’t a substitute for checking the collateral link.

### Turn 42 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      principalAmount: {type: number}\n      loanBalance: {type: number}\n      initialExchangeDate: {type: date}\n      maturityDate: {type: date}\n      interestOnly: {type: boolean}\n      allowsNegativeAmortization: {type: boolean}\n      hasBalloonPayment: {type: boolean}\n      interestRateCap: {type: number}\n      monthsUntilFirstRateChange: {type: number, unit: months}"
}
```

### Turn 42 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 42 — assistant

I’ve recorded those nine Loan values. I have **not** added a loan-classification property, since you distinguish the classifications but have not established a field that records them. The yes/no indicators also won’t be used to infer full versus partial amortization.

For the **facility and agreement amounts**, which values are actually recorded on each: the Credit Facility’s limit, credit extended, and credit available; the Credit Agreement’s agreed debt amount; and the Borrowing Capacity record’s assessed amount? Is available credit recorded, or must it be calculated from other figures?

### Turn 43 — user

Those are recorded values, not just calculations we infer:

- The **credit facility** carries its **credit limit**, **amount of credit extended**, and **available amount** separately. It can also carry a **maximum advance amount**, which is not necessarily the same as the overall limit.
- The **credit agreement** carries its **debt amount**. It also has an initial exchange date and maturity date.
- **Borrowing capacity** carries the assessed **amount**. We haven’t established a date field for that record, so don’t present it as a dated value from these fields.

I wouldn’t calculate “available amount” as limit minus credit extended and claim that calculation is the recorded figure; use the facility’s available amount.

### Turn 43 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CreditFacility:\n    properties:\n      creditLimit: {type: number}\n      creditExtended: {type: number}\n      availableAmount: {type: number}\n  CreditAgreement:\n    properties:\n      debtAmount: {type: number}\n      initialExchangeDate: {type: date}\n      maturityDate: {type: date}\n  BorrowingCapacity:\n    properties:\n      assessedAmount: {type: number}"
}
```

### Turn 43 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 43 — assistant

I’ve recorded the facility’s **limit, credit extended, and available amount** as separate values; the agreement’s debt amount and dates; and the undated borrowing-capacity amount. I won’t calculate the recorded available amount from the other two figures.

You also named a **maximum advance amount**, distinct from the overall limit. Which agreed question or one of the five checks needs the agent to read or compare that amount? If none does, I’ll leave it out of this working model rather than add it just in case.

### Turn 44 — user

None of the agreed questions or five checks needs the **maximum advance amount**. It’s a distinct facility figure, but we haven’t set a task that reads or compares it. Leave it out of this working model; we can add it if a later question concerns the size of an individual advance.

### Turn 44 — assistant

I’ve left **maximum advance amount** out. It is a real facility figure, but no agreed question or check uses it.

Next are amounts that must not be confused with the loan balance or rate. For the outstanding-principal question, outstanding-interest question, supplied-prepayment-terms review, and dated-appraisal question respectively, should I record: **Principal.outstandingAmount**, **Interest Owed.outstandingAmount**, **Prepayment Terms.penaltyPeriodMonths**, and **Collateral Value.appraisedValue** plus **asOfDate**? Does the prepayment record also need an explicit value stating whether early repayment is permitted, or must the reviewer interpret its terms?

### Turn 45 — user

Yes. Record **outstanding amount** separately on principal and on interest owed. For a dated collateral value, record the **appraised value** and its **as-of date**.

For prepayment terms, record the **prepayment-penalty period in months**. There is no established yes/no field saying early repayment is permitted, so the agent shouldn’t infer permission from the presence or absence of a penalty period. A reviewer would need the governing terms to answer that question—and, as we noted, the current connections don’t establish which terms apply to a particular loan.

### Turn 45 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Principal:\n    properties:\n      outstandingAmount: {type: number}\n  InterestOwed:\n    properties:\n      outstandingAmount: {type: number}\n  PrepaymentTerms:\n    properties:\n      penaltyPeriodMonths: {type: number, unit: months}\n  CollateralValue:\n    properties:\n      appraisedValue: {type: number}\n      asOfDate: {type: date}"
}
```

### Turn 45 — tool

Applied. Added 0, updated 4 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 45 — assistant

I’ve recorded the two outstanding amounts, the penalty period in months, and the dated appraised value. I have **not** added a prepayment-permitted flag: the governing terms, not the penalty-period field, must establish permission.

For the two separately identifiable ratios, are their **numeric ratio values** recorded on **Loan-to-Value Ratio** and **Combined Loan-to-Value Ratio** respectively? And is the loan’s **interest rate cap** already recorded on Loan the value you use for the cap question, rather than a value on Variable Interest Rate?

### Turn 46 — user

Yes. Each ratio has its own numeric value: one on the **loan-to-value ratio** record and one on the **combined loan-to-value ratio** record. They’re percentage ratios with different scopes—the combined figure reflects total debt secured by the asset or assets.

And yes, for the cap question use the **interest rate cap on the loan**. The applicable variable-rate record carries its rate, but we haven’t established a separate cap value on that record.

### Turn 46 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  LoanToValueRatio:\n    properties:\n      ratioValue: {type: number, unit: percent}\n  CombinedLoanToValueRatio:\n    properties:\n      ratioValue: {type: number, unit: percent}"
}
```

### Turn 46 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 46 — assistant

I’ve recorded each ratio as its own percentage value. The interest rate cap remains a value on Loan, not on the variable-rate record.

For **“Which interest rate applies to a loan as of a specified date?”**, what values on the Fixed Interest Rate or Variable Interest Rate records let the agent determine that? In particular, do they carry a rate value and an effective date or period, or would the agent need information not yet established?

### Turn 47 — user

Both the **fixed interest rate** and **variable interest rate** records carry a numeric rate. Neither has an established effective date or effective period.

So the agent can identify the rate linked to the loan and read its recorded value, but it **cannot reliably answer what rate applied on an arbitrary specified date** from those values alone. The reset schedule tells us when resets are scheduled; it isn’t, by itself, a dated history of rates that actually applied. We should keep the as-of-date question open until that evidence is established.

### Turn 47 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  FixedInterestRate:\n    properties:\n      rateValue: {type: number, unit: percent}\n  VariableInterestRate:\n    properties:\n      rateValue: {type: number, unit: percent}"
}
```

### Turn 47 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 47 — assistant

I’ve recorded a numeric value on each rate type. The linked record gives the agent a rate value, but neither record has dated applicability evidence, so the **as-of-date rate question remains open**; a reset schedule alone cannot answer it.

For the readiness and collateral checks, the agent must know whether a loan is **interest-bearing** or **secured**, and whether it is **collateralized** or **guaranteed** affects how findings are interpreted. Since we have no recorded classification field or subclass mechanism, **what on-file fact tells the agent each of those classifications for a particular loan?**

### Turn 48 — user

For **interest-bearing**, the recorded link to a fixed or variable interest rate is the on-file fact used by the readiness check. If that link is missing, I wouldn’t conclude the loan is interest-free; I’d say the rate information needed for the check is missing.

For **secured**, **collateralized**, and **guaranteed**, we’ve distinguished kinds of loan, but we have not established a classification field or another on-file test that reliably identifies each kind. The secured-loan check therefore needs to be given a loan already identified as secured. A collateral link can verify the collateral support it checks for; it cannot establish every aspect of the loan’s classification. Nor can a missing collateral link rule out a guaranteed loan.

So that is a real input gap for this tool: it needs a confirmed way to identify those loan classifications before it can select and interpret those checks on its own.

### Turn 48 — assistant

That leaves a real selection gap: a rate link is evidence used in the interest-bearing readiness check, but a missing link does **not** prove the loan is interest-free. Secured, collateralized, and guaranteed classifications have no confirmed on-file identifier here, so the relevant check must be given a loan already identified as secured; it cannot select such loans independently.

For the agreed **full-versus-partial amortization** question, what recorded value or schedule detail lets the agent make that determination? We have the Amortization Schedule link, but no confirmed repayment-structure value yet.

### Turn 49 — user

We don’t yet have a recorded value that reliably distinguishes **full** from **partial amortization** for a particular loan. The loan links to an amortization schedule, but the schedule value we’ve established is only the anticipated number of payments; that doesn’t show what remains after the last one.

If the detailed schedule is supplied, a reviewer can check whether the final payment clears the remaining principal and interest or leaves a balance for a balloon payment. From the links and values recorded so far, keep that question **open**. The balloon indicator alone isn’t enough to settle it.

### Turn 49 — assistant

Agreed. The amortization-schedule link and anticipated payment count do not show whether the final payment clears principal and interest. I’ll leave **full versus partial amortization** open; the balloon indicator won’t decide it.

For the five record-verification checks, does the Loan have its own **current servicing or setup status** that the agent must read or update, or are the check findings retained outside the Loan record?

### Turn 50 — user

We haven’t established a current setup or servicing status on the **loan**, and these checks do not update one. They verify whether the relevant records and links are present; they don’t change the loan’s terms or state.

We should retain what was checked and the finding, but we haven’t established a separate findings record or where it is stored. I wouldn’t add either a loan status field or an external findings record without confirming that workflow.

### Turn 50 — assistant

The checks do not update a Loan status, and we have not established where their findings are retained. I won’t add a status field or a findings record on that basis. The findings-retention part of the five actions remains open.

A **Credit Facility** has changing extended and available amounts. Does it also have a separately recorded **current status** that any agreed question or check needs, or are those amounts the only current-state values needed here?

### Turn 51 — user

For the agreed questions and checks, the **amount of credit extended** and **available amount** are the facility’s relevant changing figures, alongside its limit. We haven’t established a separate current-status field on the facility, and none of the five checks needs one.

We do distinguish **committed** from **uncommitted** facilities, but that’s a kind of facility, not a confirmed status field to add here.

### Turn 51 — assistant

I’ll use the facility’s **credit extended** and **available amount** as the changing values needed here, without adding a status field. I’ll also leave committed versus uncommitted as a distinction we have not established as a recorded field.

One property gap remains for the supplied-terms question: the penalty-period field gives its length, but not **what the terms say about early repayment**. When a reviewer is given Prepayment Terms, is their governing wording available on that record for the agent to read, or would that answer require a source we have not identified?

### Turn 52 — user

We haven’t established a readable wording field or source document for **Prepayment Terms**. From the values identified here, the agent can report whether a penalty period is recorded and its length in months. It cannot say what the terms permit or otherwise say about early repayment.

So the broader supplied-terms question remains open until we identify the governing wording the reviewer would provide.

### Turn 52 — assistant

I’ll keep the broader supplied-terms question open. With the fields established so far, the agent can report the **penalty period and its length in months**, but not what early repayment is permitted or otherwise governed by.

For the accrual question, the model can follow **Interest Payment Terms → Day-Count Convention**, but it does not yet say what the convention is. Does the Day-Count Convention record carry a name or code that the agent reads to answer which basis applies?

### Turn 53 — user

We have the link from **interest payment terms to the day-count convention** used for accrual, but we haven’t established a name or code field on that convention, or a list of permitted conventions.

So the agent can identify which convention record the terms point to. To report the specific calculation basis in business language, it would need a confirmed label or other readable description for that record; I wouldn’t invent a code.

### Turn 53 — assistant

The model can identify the **Day-Count Convention record** named by the interest payment terms, but it cannot yet report the specific calculation basis in business language. I won’t invent a convention code or permitted list.

Can you confirm that a **readable name or description** is available on each Day-Count Convention record for the agent to report, or should that part of the accrual question remain open?

### Turn 54 — user

I can’t confirm a readable name or description field from what we’ve established. Keep the **specific accrual-basis wording** open.

The agent can follow the terms’ link to the day-count convention record, but it should not claim to know the convention’s name or calculation method without a confirmed readable source.

### Turn 54 — assistant

I’ll leave the **specific accrual-basis wording** open. The agent can follow the link to the convention record, but cannot name its method without a confirmed readable source.

One value detail before we close the property pass: is the **interest rate cap recorded on Loan as a percentage**, like the rate values, or in another form?

### Turn 55 — user

The **interest rate cap is recorded on the loan as a numeric value**. We haven’t established its unit or whether it is stored as a percentage, so I wouldn’t specify a format yet.

### Turn 55 — assistant

The cap is already recorded as a **numeric Loan value**, with no unit or percentage format specified. I’ll leave its format open rather than assume one.

That completes this property pass: we have the agreed amounts, dates, indicators, rates, ratios, and penalty-period length. Several questions remain explicitly open because the needed evidence is not recorded—notably dated rate applicability, full versus partial amortization, readable accrual-basis wording, and what prepayment terms permit. **Does that accurately reflect the values we’ve confirmed before we review names and alternative wording?**

### Turn 56 — user

Yes, that accurately reflects the values confirmed in this pass. Keep those four questions open rather than inferring answers from a rate-reset schedule, balloon indicator, convention link, or penalty-period length.

Separately from the value gaps, we still lack a way to identify a particular loan’s prepayment terms, confirm its secured-loan classification from an on-file field, or tell which dated appraisal underlies a ratio. Those remain connection or identification gaps, not values we should fill in by assumption.

### Turn 56 — assistant

I’ll keep those as separate open gaps: locating a loan’s prepayment terms, identifying its secured classification on file, and identifying the appraisal behind a ratio. None will be filled by inference.

Every class and relationship currently has a plain-language meaning. For alternative wording, do users use any **truly interchangeable names** for these five central concepts: Loan, Credit Facility, Credit Agreement, Borrower, and Lender? Please give only terms that mean the same thing in your operation; “facility” and “agreement,” for example, need not be synonyms.

### Turn 57 — user

Of those five, **“master commitment”** is an alternative name for a **credit facility**. I don’t have another established interchangeable name for loan, credit agreement, borrower, or lender.

I wouldn’t use “facility” and “agreement” interchangeably: a credit facility is a particular form of credit agreement.

### Turn 57 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CreditFacility:\n    aliases: [master commitment]"
}
```

### Turn 57 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 57 — assistant

I’ve recorded **“master commitment”** as an alias for Credit Facility. I’ve kept Credit Facility and Credit Agreement distinct.

For the next group, are there established interchangeable names for **Servicer, Sub-facility, Borrowing Capacity, Principal Repayment Terms, Interest Payment Terms, or Prepayment Terms**? If not, “none” is enough.

### Turn 58 — user

None established for those six. I’d keep each distinct rather than introduce an alternative name that might blur its role.

### Turn 58 — assistant

No aliases added for those six; their names remain distinct. I’ve also checked that every class and relationship currently has a meaning sentence.

For the **relationship wording**, do users use established alternative phrases for any of these links: Loan **has Borrower**, Loan **has Lender**, Loan **is serviced by Servicer**, Credit Facility **has Sub-facility**, or Borrower **has Borrowing Capacity**? Only interchangeable phrasing, not a different fact.

### Turn 59 — user

No established alternative phrases for those links. In ordinary conversation I might say “the borrower on this loan” or “the servicer handling it,” but I wouldn’t record those as separate interchangeable relationship names.

### Turn 59 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 59 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan or credit facility?
  - id: cq2
    text: Who is the lender on a loan or credit facility?
  - id: cq3
    text: "Which servicer collects a loan's principal and interest payments on the lender's behalf?"
  - id: cq4
    text: "What is a loan's agreed principal amount?"
  - id: cq5
    text: What is the debt amount agreed in a credit agreement?
  - id: cq6
    text: "What is a loan's current balance?"
  - id: cq7
    text: "What is a loan's outstanding principal?"
  - id: cq8
    text: "What is a loan's outstanding interest?"
  - id: cq9
    text: "What is a credit facility's credit limit?"
  - id: cq10
    text: How much credit has been extended under a credit facility?
  - id: cq11
    text: "When is a loan's initial exchange date?"
  - id: cq12
    text: When does a loan mature?
  - id: cq13
    text: Which interest rate applies to a loan as of a specified date?
  - id: cq14
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq15
    text: "What is a variable-rate loan's reset schedule?"
  - id: cq16
    text: What interest rate cap applies to a variable-rate loan?
  - id: cq17
    text: "How many months until a variable-rate loan's first rate change?"
  - id: cq18
    text: "Which terms govern a loan's principal repayment?"
  - id: cq19
    text: "Which terms govern a loan's interest payments?"
  - id: cq20
    text: "Which day-count convention governs a loan's interest accrual?"
  - id: cq21
    text: What overall loan payment schedule is on file?
  - id: cq22
    text: What amortization schedule is on file for a loan?
  - id: cq23
    text: What principal-payment schedule is on file for a loan?
  - id: cq24
    text: What interest-payment schedule is on file for a loan?
  - id: cq25
    text: What interest-calculation schedule is on file for a loan?
  - id: cq26
    text: What rate-reset schedule is on file for a loan?
  - id: cq27
    text: What initial rate-setting event is on file for a loan?
  - id: cq28
    text: Is a loan marked interest-only?
  - id: cq29
    text: Does a loan allow negative amortization?
  - id: cq30
    text: Does a loan have a balloon payment?
  - id: cq31
    text: "Does a loan's repayment structure and schedule show full or partial amortization?"
  - id: cq32
    text: "What prepayment terms apply to a loan, including whether they permit prepayment?"
  - id: cq33
    text: "Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
  - id: cq34
    text: Is a loan secured?
  - id: cq35
    text: Is a secured loan classified as a guaranteed loan?
  - id: cq36
    text: Which collateral is linked to a collateral-backed loan?
  - id: cq37
    text: Which security agreement identifies the rights granted over the collateral linked to a loan?
  - id: cq38
    text: "Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?"
  - id: cq39
    text: "What is the appraised value of collateral linked to a loan, and what is its as-of date?"
  - id: cq40
    text: What is the loan-to-value ratio for a collateralized loan?
  - id: cq41
    text: "What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
  - id: cq42
    text: What payment history is recorded for a loan?
  - id: cq43
    text: "Which individual payment transactions actually made are contained in a loan's payment history?"
  - id: cq44
    text: Which sub-facilities form part of a credit facility?
  - id: cq45
    text: What amount of borrowing capacity has been assessed for the borrower?
  - id: cq46
    text: How much credit remains available under a credit facility?
  - id: cq47
    text: "Given prepayment terms supplied for review, what do they say about early repayment?"
  - id: cq48
    text: "Given prepayment terms supplied for review, is a penalty period recorded, and what is its length in months?"
classes:
  Loan:
    meaning: A debt set up and serviced under agreed terms.
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
      interestOnly:
        type: boolean
      allowsNegativeAmortization:
        type: boolean
      hasBalloonPayment:
        type: boolean
      interestRateCap:
        type: number
      monthsUntilFirstRateChange:
        type: number
        unit: months
  CreditFacility:
    meaning: "An arrangement under which a borrower can draw credit over time, potentially through sub-facilities."
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      creditExtended:
        type: number
      availableAmount:
        type: number
  Borrower:
    meaning: A party that owes repayment.
    aliases: []
    properties: {}
  Lender:
    meaning: A party that provides credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "A party that collects loan payments on the lender's behalf."
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: An agreement carrying the agreed debt amount and dates.
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  SubFacility:
    meaning: A portion of a credit facility that can be identified within it.
    aliases: []
    properties: {}
  BorrowingCapacity:
    meaning: "The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
    aliases: []
    properties:
      assessedAmount:
        type: number
  PrincipalRepaymentTerms:
    meaning: "Terms that govern payment of a loan's principal."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms that govern a loan's interest payments and identify the day-count convention for accrual."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms governing principal repayment before maturity and any applicable penalty period.
    aliases: []
    properties:
      penaltyPeriodMonths:
        type: number
        unit: months
  FixedInterestRate:
    meaning: An interest rate that is fixed rather than subject to variable-rate changes.
    aliases: []
    properties:
      rateValue:
        type: number
        unit: percent
  VariableInterestRate:
    meaning: "An interest rate that can vary, including floating benchmark-based or institution-managed rates."
    aliases: []
    properties:
      rateValue:
        type: number
        unit: percent
  LoanPaymentSchedule:
    meaning: The overall schedule of payments due on a loan.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "The schedule showing how a loan's debt balance changes over time."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The schedule of dates on which loan principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The schedule of dates on which loan interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: The schedule of dates on which loan interest is calculated.
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates on which a variable loan rate may reset.
    aliases: []
    properties: {}
  InitialRateSettingEvent:
    meaning: "An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: The record of actual payment transactions made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "One actual payment transaction within a loan's payment history, rather than a scheduled payment."
    aliases: []
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement granting rights over pledged collateral.
    aliases: []
    properties: {}
  CreditEnhancementAgreement:
    meaning: An arrangement protecting a credit-enhancement beneficiary.
    aliases: []
    properties: {}
  CreditEnhancementBeneficiary:
    meaning: A party protected under a credit-enhancement agreement.
    aliases: []
    properties: {}
  CollateralValue:
    meaning: A separately identifiable appraisal of collateral carrying a value and an as-of date.
    aliases: []
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  DayCountConvention:
    meaning: The basis identified by interest payment terms for calculating interest accrual.
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: A separately identifiable ratio comparing a collateralized loan to the collateral value used.
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  CombinedLoanToValueRatio:
    meaning: "A separately identifiable ratio accounting for total debt secured by an asset rather than only this loan's principal."
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  Principal:
    meaning: "Principal linked to a loan, with an outstanding amount distinct from its agreed principal amount and balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  InterestOwed:
    meaning: "Interest owed on a loan, with an outstanding amount distinct from the interest rate and loan balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the borrower owing repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the lender providing credit for the loan.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting the loan's principal and interest payments on the lender's behalf."
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: Identifies the borrower on the facility directly.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: Identifies the lender on the facility directly.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: Identifies the borrower on the credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: Identifies the lender on the credit agreement.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: Identifies a sub-facility forming part of the credit facility.
    aliases: []
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "Identifies the borrower's separately assessed capacity to repay."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: Identifies the principal obligation linked to the loan.
    aliases: []
  - name: governedByPrincipalTerms
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: Identifies the principal whose repayment these terms govern.
    aliases: []
  - name: hasInterestOwed
    from: Loan
    to: InterestOwed
    meaning: Identifies the interest owed linked to the loan.
    aliases: []
  - name: hasFixedRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applicable to the loan when its rate is fixed.
    aliases: []
  - name: hasVariableRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applicable to the loan when its rate is variable.
    aliases: []
  - name: governsInterest
    from: InterestPaymentTerms
    to: InterestOwed
    meaning: Identifies the interest obligation whose payment these terms govern.
    aliases: []
  - name: identifiesDayCountConvention
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count basis for calculating interest accrual under the interest payment terms.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies the overall payment schedule linked to the loan.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies the schedule showing how the loan balance changes.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies the principal-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies the interest-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies the interest-calculation dates scheduled for the loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies the rate-reset dates scheduled for the loan.
    aliases: []
  - name: hasInitialRateSettingEvent
    from: Loan
    to: InitialRateSettingEvent
    meaning: "Identifies the event where the loan's initial rate is established, without implying it occurs on the initial exchange date."
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of payments actually made."
    aliases: []
  - name: containsPaymentTransaction
    from: PaymentHistory
    to: PaymentTransaction
    meaning: "Identifies an actual payment transaction contained in the loan's history."
    aliases: []
  - name: hasCollateral
    from: Loan
    to: Collateral
    meaning: Identifies collateral linked to a secured loan; its absence does not establish that the loan is unsecured.
    aliases: []
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValue
    meaning: Identifies a dated appraised value recorded for the collateral.
    aliases: []
  - name: identifiesSecuredCollateral
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the collateral over which the security agreement grants rights.
    aliases: []
  - name: identifiesBeneficiary
    from: CreditEnhancementAgreement
    to: CreditEnhancementBeneficiary
    meaning: Identifies the party protected by the credit-enhancement agreement.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: Identifies the loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: Identifies the combined loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 59 — assistant

No alternative relationship names were confirmed. The terminology pass is complete: every recorded class and relationship has a meaning sentence, and **“master commitment”** is the one confirmed alias. I won’t turn casual phrasing into extra aliases.

Next I’ll check which values need strict presence or validity checks. For each of these **Loan** values—**principal amount, loan balance, initial exchange date, and maturity date**—what would break in an agreed question or check if that value were missing or wrong? A brief answer for each is enough.

### Turn 60 — user

- **Principal amount:** We couldn’t answer what principal amount was agreed. An incorrect figure would give the wrong answer, but its presence is not one of the stated preconditions for the loan-readiness check.
- **Loan balance:** We couldn’t report the loan’s recorded balance reliably. It must not be replaced with outstanding principal or interest.
- **Initial exchange date:** We couldn’t answer when the initial funding exchange was set to occur. It isn’t necessarily the start of a facility draw period.
- **Maturity date:** We couldn’t answer when the loan matures.

Those are important data-quality gaps for the respective questions; we haven’t established that any of the four, by itself, blocks one of the five checks.

### Turn 60 — assistant

Those four values support their respective questions, but you haven’t made any of them a blocker for the five checks. I’ll treat a missing or wrong value as a question-specific data gap, not a loan-readiness failure.

For the next Loan values, what would break if each were missing or wrong: **interest-only indicator, negative-amortization indicator, balloon-payment indicator, interest-rate cap, and months until the first rate change**? Please answer briefly for each; I won’t treat a missing indicator as “no.”

### Turn 61 — user

- **Interest-only indicator:** We couldn’t reliably answer whether the loan is interest-only.
- **Negative-amortization indicator:** We couldn’t reliably answer whether it permits negative amortization.
- **Balloon-payment indicator:** We couldn’t reliably answer whether it has a balloon payment; even a present “yes” wouldn’t settle full versus partial amortization by itself.
- **Interest-rate cap:** We couldn’t report a recorded cap or conclude that no cap applies. We haven’t made it a precondition of the variable-rate setup check.
- **Months until first rate change:** We couldn’t report the recorded first-change term. The reset schedule alone doesn’t supply that term, and this field isn’t a precondition of the variable-rate check.

An incorrect value could misstate the relevant answer; an absent one stays **unknown**, not “no” or zero.

### Turn 61 — assistant

I’ll treat each missing indicator or number as **unknown**, not “no” or zero. None of these five is an established precondition for the variable-rate setup check.

For the remaining recorded **amounts and dates**, what breaks if each is missing or wrong: Credit Facility **credit limit, credit extended, available amount**; Credit Agreement **debt amount, initial exchange date, maturity date**; and Borrowing Capacity **assessed amount**? A brief answer for each will let me distinguish an unanswerable question from a check that must stop.

### Turn 62 — user

Each missing value makes its corresponding question unanswerable from the record; a wrong value would give a misleading answer:

- **Facility credit limit:** We can’t report the agreed limit.
- **Amount of credit extended:** We can’t report how much credit has been extended.
- **Available amount:** We can’t report the facility’s recorded availability; don’t silently calculate a substitute from the limit and extended amount.
- **Agreement debt amount:** We can’t report its recorded debt amount.
- **Agreement initial exchange date:** We can’t report when its initial exchange is set.
- **Agreement maturity date:** We can’t report when it matures.
- **Borrowing-capacity amount:** We can’t report the assessed upper bound for that borrower.

None of these values is a stated precondition for the five loan record-verification checks. Missing data leaves the relevant answer open; it doesn’t, on its own, stop those checks.

### Turn 62 — assistant

For each of those seven fields, a missing value leaves its corresponding question unanswered; none blocks the five checks. I’ll also preserve that available credit is the **recorded** amount, not a calculation substituted for it.

For the remaining fields, what breaks if each is missing or wrong: **Principal.outstandingAmount**, **Interest Owed.outstandingAmount**, **Prepayment Terms.penaltyPeriodMonths**, **Collateral Value.appraisedValue and asOfDate**, each of the **two ratio values**, and each of the **fixed and variable rate values**? Please distinguish any field a check actually requires from one needed only to answer a question.

### Turn 63 — user

- **Outstanding principal and outstanding interest:** Each is needed to answer how much remains owing in that category. Neither amount is a stated precondition for the five checks.
- **Prepayment-penalty period in months:** This is needed to report the penalty timing. Its presence is also what the **prepayment-terms review** checks. Without it, that review cannot confirm the timing. It still cannot establish that the supplied terms apply to a particular loan.
- **Appraised collateral value and as-of date:** Both are needed to report a dated valuation reliably. Neither is required by the secured-loan support check, which checks the collateral **link**, not its appraisal.
- **The two ratio values:** A missing value prevents us from reporting that particular ratio. Neither ratio is required by the secured-loan support check.
- **Fixed or variable rate value:** A missing or wrong numeric rate prevents a reliable answer about the recorded rate. The **loan-to-rate link** matters to the relevant checks, and the variable-rate check also requires a reset schedule; we have not established the numeric rate value itself as a separate check precondition.

For all of these, a wrong value risks a wrong answer. Apart from the penalty-period presence check, don’t turn a question-specific missing value into a new blocker for one of the five checks.

### Turn 63 — assistant

The penalty-period field is the one value whose **presence** an agreed check tests. The other amounts, dates, ratios, and rate values support questions, but you haven’t made them separate blockers for the five checks. A missing rate value also differs from a missing rate **link**.

For the properties we’ve actually recorded, are there any with a small, fixed set of permitted values beyond the three Loan yes/no indicators? I won’t invent lists for loan classifications or the day-count convention when no such fields have been confirmed.

### Turn 64 — user

No other small, fixed value list has been established for the recorded properties. The three loan indicators—interest-only, negative amortization, and balloon payment—are **yes/no** values.

Fixed versus variable rate, and the various loan or facility kinds, are distinctions between types of thing here, not confirmed drop-down values on a property. We also haven’t established permitted lists for day-count conventions or payment frequencies.

### Turn 64 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      interestOnly: {type: boolean, allowed: [yes, no]}\n      allowsNegativeAmortization: {type: boolean, allowed: [yes, no]}\n      hasBalloonPayment: {type: boolean, allowed: [yes, no]}"
}
```

### Turn 64 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 64 — assistant

I’ve recorded **yes/no** as the allowed values for the three Loan indicators. I haven’t added fixed-choice lists for classifications, rates, conventions, or frequencies where no property or permitted list was established. Missing question-supporting values remain unknown rather than silently defaulting; the penalty-period presence is the one recorded-value check you specified.

Does that close the value-and-constraint pass accurately? If so, I’ll define the five checks’ conditions without adding new blockers.

### Turn 65 — user

Yes. That closes the value-and-constraint pass accurately. For the five checks, use only the conditions we’ve established: the relevant party and interest-term links, collateral link, variable-rate and reset-schedule links, payment history with individual transactions, and recorded prepayment-penalty timing. Don’t promote other missing answer fields into check blockers.

### Turn 65 — assistant

The constraint pass is closed. I’ll use only the confirmed conditions for the five checks and won’t turn other missing answer fields into blockers.

One decision is needed before I record the **loan-readiness rule**: you said an interest-bearing loan needs an applicable rate link and interest-payment terms, but a missing rate link does not prove the loan is interest-free. If neither a fixed nor variable rate link is present, should readiness report **“rate information missing; interest-bearing status cannot be determined”** rather than pass or fail the interest-bearing condition?

### Turn 66 — user

Yes. If neither rate link is present, report **“Rate information missing; interest-bearing status cannot be determined.”** Don’t treat the loan as interest-free, and don’t confirm readiness on that incomplete evidence.

If a fixed or variable rate is linked, the readiness check also needs the interest-payment terms governing the loan’s interest obligation.

### Turn 66 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  loanReadinessConfirmed:\n    conditions:\n      - Loan hasBorrower identifies a borrower.\n      - Loan hasLender identifies a lender.\n      - Loan hasFixedRate or hasVariableRate identifies its applicable interest rate; if neither link exists, report \"Rate information missing; interest-bearing status cannot be determined\" and do not confirm readiness.\n      - Where a fixed or variable rate is linked, Loan hasInterestOwed identifies the interest obligation and InterestPaymentTerms governsInterest identifies terms governing that same obligation."
}
```

### Turn 66 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 66 — assistant

I’ve recorded the readiness condition: borrower and lender links must be present; a linked rate requires terms governing the same interest obligation. If neither rate link exists, readiness is **not confirmed** and the finding says the interest-bearing status cannot be determined.

For **secured-loan support verification**, is the full pass condition simply: *given a Loan already identified as secured, confirm that Loan → Collateral is recorded*? If the link is absent, the finding would be **“Collateral support not verified by this check”**, without judging whether the loan is unsecured or a guaranty is valid.

### Turn 67 — user

Yes. Given a loan already identified as secured, this check passes when the **secured loan has a recorded link to collateral**. If that link is absent, report **“Collateral support not verified by this check.”**

That finding does not say the loan is unsecured, and this check does not assess whether a guaranty exists or is valid.

### Turn 67 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  collateralSupportVerified:\n    conditions:\n      - The Loan is supplied as already identified as secured; this model has no recorded property or path that independently establishes that classification.\n      - Loan hasCollateral identifies linked collateral; if absent, report \"Collateral support not verified by this check\" without concluding the loan is unsecured or judging any guaranty."
}
```

### Turn 67 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 67 — assistant

I’ve recorded the collateral-support condition for a loan **supplied as secured**. A missing collateral link produces the precise finding you specified; it does not decide the loan’s broader security status.

For the **variable-rate setup review**, is the pass condition simply that the same Loan has both a **Variable Interest Rate** link and an **Interest Rate Reset Schedule** link? If either is missing, should the finding name the missing link without treating the fixed-rate link, cap, or first-change term as a substitute?

### Turn 68 — user

Yes. Given the loan, confirm that **it has a variable interest rate and it has an interest-rate reset schedule**. Both links must be on that same loan for this review to confirm the setup.

If either link is missing, name what’s missing and leave the review unconfirmed. A fixed-rate link, interest rate cap, or first-change term does not substitute for either required link.

### Turn 68 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  variableRateSetupConfirmed:\n    conditions:\n      - The same Loan hasVariableRate identifies a VariableInterestRate.\n      - That Loan hasInterestRateResetSchedule identifies an InterestRateResetSchedule.\n      - If either link is absent, identify the missing link and leave setup unconfirmed; a fixed-rate link, interestRateCap, or monthsUntilFirstRateChange is not a substitute."
}
```

### Turn 68 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 68 — assistant

I’ve recorded the variable-rate setup rule against the **same loan**. Both links are required; the cap, first-change term, and fixed-rate link cannot substitute.

For the **payment-record completeness review**, should it confirm only when Loan → Payment History exists **and that history contains at least one Payment Transaction**? If a history exists but has no transactions, should the finding say the history has no recorded transactions rather than imply no payment was ever made?

### Turn 69 — user

Yes. Confirm the review only when the loan has a **payment history** and that history contains **at least one individual payment transaction**.

If the history exists but has no recorded transactions, say **“No individual payment transactions recorded in this history.”** That is a finding about the records, not proof that the borrower never made a payment.

### Turn 69 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  paymentRecordCompletenessConfirmed:\n    conditions:\n      - Loan hasPaymentHistory identifies a PaymentHistory.\n      - That PaymentHistory containsPaymentTransaction identifies at least one PaymentTransaction.\n      - If the history exists but has no recorded entries, report \"No individual payment transactions recorded in this history\" without asserting that no payment was ever made."
}
```

### Turn 69 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 69 — assistant

I’ve recorded the payment-record rule: a loan history must exist and contain at least one actual transaction. An empty recorded history is **not** proof that no payment occurred.

For the **prepayment-terms review**, should the rule take **Prepayment Terms supplied to the reviewer** and confirm timing only if **penaltyPeriodMonths** is recorded? Since there is no Loan-to-Prepayment-Terms path, it would make no claim that the supplied terms apply to a particular loan.

### Turn 70 — user

Yes—for the **narrower inspection of supplied prepayment terms**. If the penalty period in months is recorded, the reviewer can confirm its timing; if it is missing, the timing cannot be confirmed.

I wouldn’t call that a completed **loan-specific prepayment-terms review**. Without a recorded connection to the loan, the agent cannot verify that the supplied terms apply to it.

### Turn 70 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  suppliedPrepaymentTimingConfirmed:\n    conditions:\n      - PrepaymentTerms are supplied for inspection; no recorded relationship establishes that they apply to a particular Loan.\n      - PrepaymentTerms.penaltyPeriodMonths is recorded; if absent, the penalty timing cannot be confirmed.\n      - Confirmation of timing does not confirm what early repayment is permitted or that the terms apply to a particular Loan."
}
```

### Turn 70 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 70 — assistant

I’ve recorded the **supplied-terms timing** rule. It confirms a recorded month count only; it cannot complete the loan-specific prepayment review.

That closes the rule pass for the five checks, with the loan-specific prepayment association still unresolved. **Do those rules reflect your intended pass conditions and carefully limited findings?**

### Turn 71 — user

Yes. Those conditions and findings are correctly limited to what the records establish. In particular, an absent link or value leaves a check **unconfirmed**; it doesn’t prove the underlying loan event or support never existed. And the supplied prepayment-terms timing check must remain distinct from confirming which terms govern a particular loan.

### Turn 71 — assistant

The five rules are confirmed. An absent link or value leaves the relevant check **unconfirmed**, not disproven; inspecting a supplied penalty period does not establish which terms govern a loan.

Before I record the actions, I need to settle what **“retain the finding”** means. Is there a check-result record the agent creates or updates, or does it return the finding to a reviewer who retains it outside this model? What could the agent check afterward to verify the finding was retained?

### Turn 72 — user

We haven’t established a check-result record or a retention mechanism. The agent can **return the finding to the reviewer**, with what it checked and which links or value were present or missing. It should not claim to create or update a stored result.

It can verify the **basis of the finding** by checking the relevant records again. It cannot verify that the finding was retained afterward until we identify where and how that happens.

### Turn 72 — assistant

Understood. The agent can return each finding and the evidence checked, then re-read the records to verify the finding’s basis. It cannot claim the finding was stored or retained afterward.

One action-design point before I record them: the rules we just confirmed describe **when a check passes**. If I make a passing rule a prerequisite for running its action, the agent could not run the check to report a missing link. Should the actions run first and **evaluate those rules to produce either a confirmed or unconfirmed finding**, rather than require a passing result before they run?

### Turn 73 — user

That distinction is right for the **inspection**, but I’d keep it separate from the **confirmation action**.

The agent can inspect a loan and report that a required link or value is missing. It should not say it completed a readiness assessment or confirmed a setup when that action’s conditions are unmet. A passing condition permits the confirmation; a missing condition produces an **unconfirmed finding** explaining why confirmation could not be made.

### Turn 73 — assistant

I’ll keep **inspection** separate from **confirmation**: the agent may inspect records and return an unconfirmed finding when evidence is missing, but it may confirm a check only when its rule passes.

For the five confirmation actions, is the intended effect simply to **return a confirmation and the evidence checked to the reviewer**, with verification by **re-reading the relevant links or value**? That would make no claim that a stored result was created. The fifth action would confirm only the timing on **supplied Prepayment Terms**, not a loan-specific prepayment review.

### Turn 74 — user

Yes. For each passing check, the agent can return a **confirmation and the evidence it checked**. Re-reading the relevant links or penalty-period value verifies the basis for that confirmation; it does not verify that a finding was stored.

For the fifth action, limit the confirmation to **penalty timing on the supplied prepayment terms**. It cannot confirm a loan-specific prepayment review until the terms’ connection to that loan is established. We haven’t established a separate authorisation step for any of these checks.

### Turn 74 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  confirmLoanReadiness:\n    input: Loan\n    preconditions: [loanReadinessConfirmed]\n    effect: Return a readiness confirmation to the reviewer identifying the borrower, lender, applicable fixed or variable rate link, and interest obligation and terms links checked; do not claim a stored finding or alter Loan.\n    verification: Re-read Loan hasBorrower and hasLender, Loan hasFixedRate or hasVariableRate, Loan hasInterestOwed, and InterestPaymentTerms governsInterest for the same interest obligation; confirm the returned evidence matches those links.\n  confirmCollateralSupport:\n    input: Loan\n    preconditions: [collateralSupportVerified]\n    effect: Return confirmation of the Loan hasCollateral link for the loan supplied as secured, with the linked collateral as evidence; do not assert a guaranty finding or stored result.\n    verification: Re-read Loan hasCollateral and confirm the returned collateral matches the recorded link for that Loan.\n  confirmVariableRateSetup:\n    input: Loan\n    preconditions: [variableRateSetupConfirmed]\n    effect: Return confirmation that the same Loan hasVariableRate and hasInterestRateResetSchedule, identifying both links checked; do not claim a stored result.\n    verification: Re-read Loan hasVariableRate and Loan hasInterestRateResetSchedule for that same Loan and confirm both links match the returned evidence.\n  confirmPaymentRecordCompleteness:\n    input: Loan\n    preconditions: [paymentRecordCompletenessConfirmed]\n    effect: Return confirmation that Loan hasPaymentHistory and that the history containsPaymentTransaction for at least one actual transaction, identifying the links checked; do not claim a stored result.\n    verification: Re-read Loan hasPaymentHistory and that PaymentHistory containsPaymentTransaction and confirm the returned evidence matches the recorded links.\n  confirmSuppliedPrepaymentTiming:\n    input: PrepaymentTerms\n    preconditions: [suppliedPrepaymentTimingConfirmed]\n    effect: Return confirmation of the recorded PrepaymentTerms.penaltyPeriodMonths on the supplied terms, without claiming they apply to any Loan or that the finding was stored.\n    verification: Re-read PrepaymentTerms.penaltyPeriodMonths on the supplied terms and confirm it matches the returned value."
}
```

### Turn 74 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — 2 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "confirmLoanReadiness" has input class Loan, and its precondition loanReadinessConfirmed refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Loan to InterestPaymentTerms. Rewording the text does not create the path it assumes.
  [warning] unreachable-from-action-input — Action "confirmSuppliedPrepaymentTiming" has input class PrepaymentTerms, and its precondition suppliedPrepaymentTimingConfirmed refers to Loan, which is not connected to it at all. Add or redirect a relationship so the agent can navigate from PrepaymentTerms to Loan. Rewording the text does not create the path it assumes.

### Turn 74 — assistant

I’ve recorded five **confirmation actions**. Each returns the evidence checked and verifies it by re-reading the records; none claims to store a finding or change a loan.

The consistency check raised two warnings. The prepayment warning is a **false positive**: its rule mentions Loan only to say that supplied terms are *not* linked to one. The readiness warning is a **real navigation gap**: from Loan we reach Interest Owed, but the recorded link runs from Interest Payment Terms **to** Interest Owed.

**In practice, how does the agent find the Interest Payment Terms that govern a loan’s Interest Owed record?** Can it look up terms that point to that obligation, or is there another recorded path? I won’t reverse the link merely to clear the warning.

### Turn 75 — user

Yes. Start with the loan’s **interest obligation**, then look up **interest payment terms that point to that obligation**. That’s a reverse lookup over the recorded link, not a new link in the opposite direction.

If no such terms are found, the agent cannot confirm the interest-terms part of readiness. If more than one is found, it should report the terms found rather than assume one is uniquely applicable.

### Turn 75 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  loanReadinessConfirmed:\n    conditions:\n      - Loan hasBorrower identifies a borrower.\n      - Loan hasLender identifies a lender.\n      - Loan hasFixedRate or hasVariableRate identifies its applicable interest rate; if neither link exists, report \"Rate information missing; interest-bearing status cannot be determined\" and do not confirm readiness.\n      - Follow Loan hasInterestOwed to its InterestOwed obligation; use a reverse lookup for InterestPaymentTerms whose governsInterest link points to that same obligation. If none are found, do not confirm the terms check; if multiple are found, report all found rather than assuming one uniquely applies.\nactions:\n  confirmLoanReadiness:\n    input: Loan\n    preconditions: [loanReadinessConfirmed]\n    effect: Return a readiness confirmation to the reviewer identifying the borrower, lender, applicable fixed or variable rate link, and interest obligation and terms links checked; report all terms found by reverse lookup rather than assuming one unique set of terms; do not claim a stored finding or alter Loan.\n    verification: Re-read Loan hasBorrower and hasLender, Loan hasFixedRate or hasVariableRate, and Loan hasInterestOwed; use reverse lookup for InterestPaymentTerms governsInterest pointing to that same InterestOwed obligation, and confirm the returned evidence matches the recorded links."
}
```

### Turn 75 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 75 — assistant

I’ve updated readiness to use the path you described: **Loan → Interest Owed**, then a reverse lookup for Interest Payment Terms pointing to that obligation. If none are found, readiness is unconfirmed; if several are found, the agent reports them all rather than choosing one.

The automated warning still treats that reverse lookup as unreachable, but I won’t add an opposite-direction link you haven’t confirmed. Its warning about supplied Prepayment Terms is also not a missing path for that **narrow** action: the rule explicitly says it cannot establish a link to a loan.

Do the five recorded confirmation actions now match your intended checks and their verification limits?

### Turn 76 — user

Yes. The five confirmation actions match the checks we agreed, including the reverse lookup for interest payment terms and the loan-specific limits on the prepayment review.

### Turn 76 — assistant

The five confirmation actions are recorded and confirmed. Each verifies its finding against the underlying records; none claims that the finding was stored. The two automated navigation warnings remain noted, without inventing links to silence them.

Before the final validation, I’ll make one bounded check for neighboring concepts we may have missed. For **Loan**, we already have its parties, terms, schedules, payment history, and collateral connections. Are there any **hand-off or later servicing stages, or related paperwork**, that the agent needs to recognize and that this picture misses? “No” is fine.

### Turn 77 — user

No—not for the questions and checks we’ve agreed. Initial funding, rate setting, scheduled payments, and actual payment history are already distinguished. Security and credit-enhancement agreements cover the related paperwork we’ve identified.

I wouldn’t add a hand-off stage or another document record without a specific task and a confirmed way to associate it with the loan.

### Turn 77 — assistant

For **Loan**, no additional hand-off stage or paperwork is needed for the agreed scope. I won’t add one without a task and a confirmed connection to the loan.

For **Credit Facility**, we have its parties, sub-facilities, and recorded amounts. Are there any **other components or stages of drawing and tracking credit** that the agent needs for the agreed questions or checks, beyond those already captured?

### Turn 78 — user

No. For our agreed questions, the facility’s borrower and lender, its sub-facilities, credit limit, amount extended, and available amount are enough. We’ve distinguished a revolving line from a one-time funded loan, but no agreed question or check requires individual draw transactions or draw-stage records. I wouldn’t add those without a specific need.

### Turn 78 — assistant

For **Credit Facility**, no further component or draw-stage record is needed for the agreed scope. I’ll leave individual draws out.

For **Collateral and its dated values and ratios**, we have the pledged asset, its appraisals, and the loan’s two ratios. Is there a missing **measurement or related agreement connection** needed for the agreed collateral questions—or is the known inability to identify which appraisal underlies a ratio the only gap you can confirm?

### Turn 79 — user

The confirmed measurement gap is exactly that: we can retrieve the collateral’s dated appraisals and the collateralized loan’s two ratios, but we cannot identify **which appraisal was used for either ratio**.

On agreements, we can find a **security agreement that identifies the collateral it secures**, but we have no direct loan-to-security-agreement link. We also have no path from a particular loan to a credit-enhancement agreement or its beneficiary. I wouldn’t add either connection by inference.

### Turn 79 — assistant

That confirms no new connection for Collateral: the appraisal behind either ratio remains unidentified. A security agreement can be found by looking for one that identifies the collateral, but there is no direct loan-to-agreement link or loan-to-credit-enhancement path.

For **Payment History**, are any further **parts of an actual transaction or later handling stages** needed for the agreed payment questions and completeness check, beyond the individual transactions already recorded?

### Turn 80 — user

No. For this scope, the payment history and the individual actual transactions it contains are enough to answer what payments are recorded and to run the completeness check. We haven’t established transaction-level breakdown fields or later handling stages, so I wouldn’t add them.

### Turn 80 — assistant

For **Payment History**, the recorded transactions are enough for the agreed questions and completeness check. I won’t add transaction breakdowns or later stages.

One last neighboring group: for **interest rates and repayment terms**, are there any **rate-setting or repayment stages, or related records**, beyond the initial rate-setting event and the distinct terms and schedules already captured, that the agreed questions or checks require?

### Turn 81 — user

No further stage or record is needed for the agreed checks. Keep the **initial rate-setting event** separate from later **scheduled rate resets**, and keep principal and interest terms separate from their schedules.

There are still evidence gaps we’ve marked open—such as which rate applied on a specified past date, what the prepayment terms permit, and whether the final scheduled payment fully clears the debt. Adding a stage name wouldn’t resolve those without the underlying records.

### Turn 81 — assistant

The bounded expansion pass found **no further classes or connections to add** for Loan, Credit Facility, Collateral, Payment History, or rates and repayment terms. The gaps you named need evidence or confirmed paths, not extra stage names.

Does that capture the expansion pass accurately? Once confirmed, I’ll replay every recorded question and action against the live model, marking what it can answer and what remains open.

### Turn 82 — user

Yes, that captures the expansion pass accurately. The remaining gaps are about missing evidence or unconfirmed connections, not additional stages or records we need to add for this scope.

### Turn 82 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 82 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan or credit facility?
  - id: cq2
    text: Who is the lender on a loan or credit facility?
  - id: cq3
    text: "Which servicer collects a loan's principal and interest payments on the lender's behalf?"
  - id: cq4
    text: "What is a loan's agreed principal amount?"
  - id: cq5
    text: What is the debt amount agreed in a credit agreement?
  - id: cq6
    text: "What is a loan's current balance?"
  - id: cq7
    text: "What is a loan's outstanding principal?"
  - id: cq8
    text: "What is a loan's outstanding interest?"
  - id: cq9
    text: "What is a credit facility's credit limit?"
  - id: cq10
    text: How much credit has been extended under a credit facility?
  - id: cq11
    text: "When is a loan's initial exchange date?"
  - id: cq12
    text: When does a loan mature?
  - id: cq13
    text: Which interest rate applies to a loan as of a specified date?
  - id: cq14
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq15
    text: "What is a variable-rate loan's reset schedule?"
  - id: cq16
    text: What interest rate cap applies to a variable-rate loan?
  - id: cq17
    text: "How many months until a variable-rate loan's first rate change?"
  - id: cq18
    text: "Which terms govern a loan's principal repayment?"
  - id: cq19
    text: "Which terms govern a loan's interest payments?"
  - id: cq20
    text: "Which day-count convention governs a loan's interest accrual?"
  - id: cq21
    text: What overall loan payment schedule is on file?
  - id: cq22
    text: What amortization schedule is on file for a loan?
  - id: cq23
    text: What principal-payment schedule is on file for a loan?
  - id: cq24
    text: What interest-payment schedule is on file for a loan?
  - id: cq25
    text: What interest-calculation schedule is on file for a loan?
  - id: cq26
    text: What rate-reset schedule is on file for a loan?
  - id: cq27
    text: What initial rate-setting event is on file for a loan?
  - id: cq28
    text: Is a loan marked interest-only?
  - id: cq29
    text: Does a loan allow negative amortization?
  - id: cq30
    text: Does a loan have a balloon payment?
  - id: cq31
    text: "Does a loan's repayment structure and schedule show full or partial amortization?"
  - id: cq32
    text: "What prepayment terms apply to a loan, including whether they permit prepayment?"
  - id: cq33
    text: "Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
  - id: cq34
    text: Is a loan secured?
  - id: cq35
    text: Is a secured loan classified as a guaranteed loan?
  - id: cq36
    text: Which collateral is linked to a collateral-backed loan?
  - id: cq37
    text: Which security agreement identifies the rights granted over the collateral linked to a loan?
  - id: cq38
    text: "Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?"
  - id: cq39
    text: "What is the appraised value of collateral linked to a loan, and what is its as-of date?"
  - id: cq40
    text: What is the loan-to-value ratio for a collateralized loan?
  - id: cq41
    text: "What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
  - id: cq42
    text: What payment history is recorded for a loan?
  - id: cq43
    text: "Which individual payment transactions actually made are contained in a loan's payment history?"
  - id: cq44
    text: Which sub-facilities form part of a credit facility?
  - id: cq45
    text: What amount of borrowing capacity has been assessed for the borrower?
  - id: cq46
    text: How much credit remains available under a credit facility?
  - id: cq47
    text: "Given prepayment terms supplied for review, what do they say about early repayment?"
  - id: cq48
    text: "Given prepayment terms supplied for review, is a penalty period recorded, and what is its length in months?"
classes:
  Loan:
    meaning: A debt set up and serviced under agreed terms.
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
      interestOnly:
        type: boolean
        allowed:
          - "yes"
          - "no"
      allowsNegativeAmortization:
        type: boolean
        allowed:
          - "yes"
          - "no"
      hasBalloonPayment:
        type: boolean
        allowed:
          - "yes"
          - "no"
      interestRateCap:
        type: number
      monthsUntilFirstRateChange:
        type: number
        unit: months
  CreditFacility:
    meaning: "An arrangement under which a borrower can draw credit over time, potentially through sub-facilities."
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      creditExtended:
        type: number
      availableAmount:
        type: number
  Borrower:
    meaning: A party that owes repayment.
    aliases: []
    properties: {}
  Lender:
    meaning: A party that provides credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "A party that collects loan payments on the lender's behalf."
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: An agreement carrying the agreed debt amount and dates.
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  SubFacility:
    meaning: A portion of a credit facility that can be identified within it.
    aliases: []
    properties: {}
  BorrowingCapacity:
    meaning: "The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
    aliases: []
    properties:
      assessedAmount:
        type: number
  PrincipalRepaymentTerms:
    meaning: "Terms that govern payment of a loan's principal."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms that govern a loan's interest payments and identify the day-count convention for accrual."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms governing principal repayment before maturity and any applicable penalty period.
    aliases: []
    properties:
      penaltyPeriodMonths:
        type: number
        unit: months
  FixedInterestRate:
    meaning: An interest rate that is fixed rather than subject to variable-rate changes.
    aliases: []
    properties:
      rateValue:
        type: number
        unit: percent
  VariableInterestRate:
    meaning: "An interest rate that can vary, including floating benchmark-based or institution-managed rates."
    aliases: []
    properties:
      rateValue:
        type: number
        unit: percent
  LoanPaymentSchedule:
    meaning: The overall schedule of payments due on a loan.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "The schedule showing how a loan's debt balance changes over time."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The schedule of dates on which loan principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The schedule of dates on which loan interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: The schedule of dates on which loan interest is calculated.
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates on which a variable loan rate may reset.
    aliases: []
    properties: {}
  InitialRateSettingEvent:
    meaning: "An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: The record of actual payment transactions made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "One actual payment transaction within a loan's payment history, rather than a scheduled payment."
    aliases: []
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement granting rights over pledged collateral.
    aliases: []
    properties: {}
  CreditEnhancementAgreement:
    meaning: An arrangement protecting a credit-enhancement beneficiary.
    aliases: []
    properties: {}
  CreditEnhancementBeneficiary:
    meaning: A party protected under a credit-enhancement agreement.
    aliases: []
    properties: {}
  CollateralValue:
    meaning: A separately identifiable appraisal of collateral carrying a value and an as-of date.
    aliases: []
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  DayCountConvention:
    meaning: The basis identified by interest payment terms for calculating interest accrual.
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: A separately identifiable ratio comparing a collateralized loan to the collateral value used.
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  CombinedLoanToValueRatio:
    meaning: "A separately identifiable ratio accounting for total debt secured by an asset rather than only this loan's principal."
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  Principal:
    meaning: "Principal linked to a loan, with an outstanding amount distinct from its agreed principal amount and balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  InterestOwed:
    meaning: "Interest owed on a loan, with an outstanding amount distinct from the interest rate and loan balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the borrower owing repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the lender providing credit for the loan.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting the loan's principal and interest payments on the lender's behalf."
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: Identifies the borrower on the facility directly.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: Identifies the lender on the facility directly.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: Identifies the borrower on the credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: Identifies the lender on the credit agreement.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: Identifies a sub-facility forming part of the credit facility.
    aliases: []
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "Identifies the borrower's separately assessed capacity to repay."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: Identifies the principal obligation linked to the loan.
    aliases: []
  - name: governedByPrincipalTerms
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: Identifies the principal whose repayment these terms govern.
    aliases: []
  - name: hasInterestOwed
    from: Loan
    to: InterestOwed
    meaning: Identifies the interest owed linked to the loan.
    aliases: []
  - name: hasFixedRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applicable to the loan when its rate is fixed.
    aliases: []
  - name: hasVariableRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applicable to the loan when its rate is variable.
    aliases: []
  - name: governsInterest
    from: InterestPaymentTerms
    to: InterestOwed
    meaning: Identifies the interest obligation whose payment these terms govern.
    aliases: []
  - name: identifiesDayCountConvention
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count basis for calculating interest accrual under the interest payment terms.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies the overall payment schedule linked to the loan.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies the schedule showing how the loan balance changes.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies the principal-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies the interest-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies the interest-calculation dates scheduled for the loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies the rate-reset dates scheduled for the loan.
    aliases: []
  - name: hasInitialRateSettingEvent
    from: Loan
    to: InitialRateSettingEvent
    meaning: "Identifies the event where the loan's initial rate is established, without implying it occurs on the initial exchange date."
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of payments actually made."
    aliases: []
  - name: containsPaymentTransaction
    from: PaymentHistory
    to: PaymentTransaction
    meaning: "Identifies an actual payment transaction contained in the loan's history."
    aliases: []
  - name: hasCollateral
    from: Loan
    to: Collateral
    meaning: Identifies collateral linked to a secured loan; its absence does not establish that the loan is unsecured.
    aliases: []
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValue
    meaning: Identifies a dated appraised value recorded for the collateral.
    aliases: []
  - name: identifiesSecuredCollateral
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the collateral over which the security agreement grants rights.
    aliases: []
  - name: identifiesBeneficiary
    from: CreditEnhancementAgreement
    to: CreditEnhancementBeneficiary
    meaning: Identifies the party protected by the credit-enhancement agreement.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: Identifies the loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: Identifies the combined loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
rules:
  loanReadinessConfirmed:
    conditions:
      - Loan hasBorrower identifies a borrower.
      - Loan hasLender identifies a lender.
      - "Loan hasFixedRate or hasVariableRate identifies its applicable interest rate; if neither link exists, report \"Rate information missing; interest-bearing status cannot be determined\" and do not confirm readiness."
      - "Follow Loan hasInterestOwed to its InterestOwed obligation; use a reverse lookup for InterestPaymentTerms whose governsInterest link points to that same obligation. If none are found, do not confirm the terms check; if multiple are found, report all found rather than assuming one uniquely applies."
  collateralSupportVerified:
    conditions:
      - The Loan is supplied as already identified as secured; this model has no recorded property or path that independently establishes that classification.
      - "Loan hasCollateral identifies linked collateral; if absent, report \"Collateral support not verified by this check\" without concluding the loan is unsecured or judging any guaranty."
  variableRateSetupConfirmed:
    conditions:
      - The same Loan hasVariableRate identifies a VariableInterestRate.
      - That Loan hasInterestRateResetSchedule identifies an InterestRateResetSchedule.
      - "If either link is absent, identify the missing link and leave setup unconfirmed; a fixed-rate link, interestRateCap, or monthsUntilFirstRateChange is not a substitute."
  paymentRecordCompletenessConfirmed:
    conditions:
      - Loan hasPaymentHistory identifies a PaymentHistory.
      - That PaymentHistory containsPaymentTransaction identifies at least one PaymentTransaction.
      - "If the history exists but has no recorded entries, report \"No individual payment transactions recorded in this history\" without asserting that no payment was ever made."
  suppliedPrepaymentTimingConfirmed:
    conditions:
      - PrepaymentTerms are supplied for inspection; no recorded relationship establishes that they apply to a particular Loan.
      - "PrepaymentTerms.penaltyPeriodMonths is recorded; if absent, the penalty timing cannot be confirmed."
      - Confirmation of timing does not confirm what early repayment is permitted or that the terms apply to a particular Loan.
actions:
  confirmLoanReadiness:
    input: Loan
    preconditions:
      - loanReadinessConfirmed
    effect: "Return a readiness confirmation to the reviewer identifying the borrower, lender, applicable fixed or variable rate link, and interest obligation and terms links checked; report all terms found by reverse lookup rather than assuming one unique set of terms; do not claim a stored finding or alter Loan."
    verification: "Re-read Loan hasBorrower and hasLender, Loan hasFixedRate or hasVariableRate, and Loan hasInterestOwed; use reverse lookup for InterestPaymentTerms governsInterest pointing to that same InterestOwed obligation, and confirm the returned evidence matches the recorded links."
  confirmCollateralSupport:
    input: Loan
    preconditions:
      - collateralSupportVerified
    effect: "Return confirmation of the Loan hasCollateral link for the loan supplied as secured, with the linked collateral as evidence; do not assert a guaranty finding or stored result."
    verification: Re-read Loan hasCollateral and confirm the returned collateral matches the recorded link for that Loan.
  confirmVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupConfirmed
    effect: "Return confirmation that the same Loan hasVariableRate and hasInterestRateResetSchedule, identifying both links checked; do not claim a stored result."
    verification: Re-read Loan hasVariableRate and Loan hasInterestRateResetSchedule for that same Loan and confirm both links match the returned evidence.
  confirmPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompletenessConfirmed
    effect: "Return confirmation that Loan hasPaymentHistory and that the history containsPaymentTransaction for at least one actual transaction, identifying the links checked; do not claim a stored result."
    verification: Re-read Loan hasPaymentHistory and that PaymentHistory containsPaymentTransaction and confirm the returned evidence matches the recorded links.
  confirmSuppliedPrepaymentTiming:
    input: PrepaymentTerms
    preconditions:
      - suppliedPrepaymentTimingConfirmed
    effect: "Return confirmation of the recorded PrepaymentTerms.penaltyPeriodMonths on the supplied terms, without claiming they apply to any Loan or that the finding was stored."
    verification: Re-read PrepaymentTerms.penaltyPeriodMonths on the supplied terms and confirm it matches the returned value.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "confirmLoanReadiness" has input class Loan, and its precondition loanReadinessConfirmed refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "confirmSuppliedPrepaymentTiming" has input class PrepaymentTerms, and its precondition suppliedPrepaymentTimingConfirmed refers to Loan, which is not connected to it at all.

### Turn 82 — assistant

I’ve replayed all **48 recorded questions** and **five actions** against the live model. “Covered” means the model shows what the agent should inspect; it does not mean the underlying record always contains an answer.

| Questions | Result and route |
|---|---|
| **1–3** Parties and servicer | **Covered:** direct Loan or Facility → Borrower/Lender links; Loan → Servicer. |
| **4–12** Agreed amounts, outstanding amounts, facility figures, and loan dates | **Covered:** recorded Loan, Credit Agreement, Facility, Principal, and Interest Owed values. Facility availability is read, not calculated. |
| **13** Rate on a specified date | **Open:** linked rate values have no established effective dates or periods. |
| **14–17** Rate type, reset schedule, cap, first-change term | **Covered:** Loan → fixed or variable rate; Loan → reset schedule; cap and month count on Loan. |
| **18–19** Principal and interest terms | **Covered by reverse lookup:** Loan → Principal or Interest Owed, then find terms pointing to that obligation. |
| **20** Day-count convention | **Partial:** terms point to the convention record, but its readable calculation-basis wording is unconfirmed. |
| **21–27** Six schedules and initial rate-setting event | **Covered:** separate direct links from Loan. |
| **28–30** Interest-only, negative-amortization, and balloon indicators | **Covered:** separate yes/no values on Loan. |
| **31** Full versus partial amortization | **Open:** the recorded schedule information does not establish what remains after the final payment. |
| **32–33** Loan-specific prepayment terms and penalty period | **Open:** no path identifies which Prepayment Terms apply to a particular Loan. |
| **34–35** Secured and guaranteed classifications | **Open:** no confirmed on-file identifier for either classification. A collateral link is not a substitute. |
| **36–37** Collateral and security agreement | **Covered for identifying records:** Loan → Collateral; reverse lookup finds Security Agreements identifying that collateral. The model does not expose the agreement’s detailed rights wording. |
| **38** Loan’s credit-enhancement beneficiary | **Open:** the agreement → beneficiary link exists, but no path reaches that agreement from the particular loan. |
| **39–41** Dated appraisal and two ratios | **Covered as separately recorded values:** Loan → Collateral → dated appraisals; Loan → each ratio. **Not covered:** which appraisal was used for either ratio. |
| **42–46** Payment records, sub-facilities, borrowing capacity, available credit | **Covered:** Loan → History → Transactions; Facility → Sub-facilities; Borrower → Capacity; recorded Facility availability. |
| **47** What supplied prepayment terms say about early repayment | **Open:** no confirmed readable governing wording. |
| **48** Penalty timing on supplied terms | **Covered:** read `penaltyPeriodMonths`; this does not establish applicability to a loan. |

The **five confirmation actions** are present with one input class each, a passing rule, a returned evidence-based confirmation, and re-reading verification: readiness follows the loan’s party, rate, and interest-obligation links and reverse-looks up terms; collateral support checks the link on a loan supplied as secured; variable-rate setup checks both links on the same loan; payment completeness checks a history with at least one transaction; and supplied prepayment timing checks the month value without claiming loan-specific applicability. Missing evidence permits an **unconfirmed finding**, not a confirmation. None verifies storage of a finding.

Before the final checklist, I found one value-format assumption to check: the model currently marks both fixed and variable **rate values as percentages**, although you confirmed numeric rates but did not explicitly confirm their stored unit. **Are both rate values recorded as percentages, or should their unit remain unspecified?**

### Turn 83 — user

Leave the unit **unspecified** for both fixed and variable rate values. We’ve confirmed that each is numeric, but not that either is stored as a percentage. Remove the percentage-format assumption; the agent should not display a percent sign unless the unit is confirmed from another source.

### Turn 83 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  FixedInterestRate:\n    properties:\n      rateValue: {type: number}\n  VariableInterestRate:\n    properties:\n      rateValue: {type: number}"
}
```

### Turn 83 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 83 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 83 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan or credit facility?
  - id: cq2
    text: Who is the lender on a loan or credit facility?
  - id: cq3
    text: "Which servicer collects a loan's principal and interest payments on the lender's behalf?"
  - id: cq4
    text: "What is a loan's agreed principal amount?"
  - id: cq5
    text: What is the debt amount agreed in a credit agreement?
  - id: cq6
    text: "What is a loan's current balance?"
  - id: cq7
    text: "What is a loan's outstanding principal?"
  - id: cq8
    text: "What is a loan's outstanding interest?"
  - id: cq9
    text: "What is a credit facility's credit limit?"
  - id: cq10
    text: How much credit has been extended under a credit facility?
  - id: cq11
    text: "When is a loan's initial exchange date?"
  - id: cq12
    text: When does a loan mature?
  - id: cq13
    text: Which interest rate applies to a loan as of a specified date?
  - id: cq14
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq15
    text: "What is a variable-rate loan's reset schedule?"
  - id: cq16
    text: What interest rate cap applies to a variable-rate loan?
  - id: cq17
    text: "How many months until a variable-rate loan's first rate change?"
  - id: cq18
    text: "Which terms govern a loan's principal repayment?"
  - id: cq19
    text: "Which terms govern a loan's interest payments?"
  - id: cq20
    text: "Which day-count convention governs a loan's interest accrual?"
  - id: cq21
    text: What overall loan payment schedule is on file?
  - id: cq22
    text: What amortization schedule is on file for a loan?
  - id: cq23
    text: What principal-payment schedule is on file for a loan?
  - id: cq24
    text: What interest-payment schedule is on file for a loan?
  - id: cq25
    text: What interest-calculation schedule is on file for a loan?
  - id: cq26
    text: What rate-reset schedule is on file for a loan?
  - id: cq27
    text: What initial rate-setting event is on file for a loan?
  - id: cq28
    text: Is a loan marked interest-only?
  - id: cq29
    text: Does a loan allow negative amortization?
  - id: cq30
    text: Does a loan have a balloon payment?
  - id: cq31
    text: "Does a loan's repayment structure and schedule show full or partial amortization?"
  - id: cq32
    text: "What prepayment terms apply to a loan, including whether they permit prepayment?"
  - id: cq33
    text: "Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
  - id: cq34
    text: Is a loan secured?
  - id: cq35
    text: Is a secured loan classified as a guaranteed loan?
  - id: cq36
    text: Which collateral is linked to a collateral-backed loan?
  - id: cq37
    text: Which security agreement identifies the rights granted over the collateral linked to a loan?
  - id: cq38
    text: "Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?"
  - id: cq39
    text: "What is the appraised value of collateral linked to a loan, and what is its as-of date?"
  - id: cq40
    text: What is the loan-to-value ratio for a collateralized loan?
  - id: cq41
    text: "What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
  - id: cq42
    text: What payment history is recorded for a loan?
  - id: cq43
    text: "Which individual payment transactions actually made are contained in a loan's payment history?"
  - id: cq44
    text: Which sub-facilities form part of a credit facility?
  - id: cq45
    text: What amount of borrowing capacity has been assessed for the borrower?
  - id: cq46
    text: How much credit remains available under a credit facility?
  - id: cq47
    text: "Given prepayment terms supplied for review, what do they say about early repayment?"
  - id: cq48
    text: "Given prepayment terms supplied for review, is a penalty period recorded, and what is its length in months?"
classes:
  Loan:
    meaning: A debt set up and serviced under agreed terms.
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
      interestOnly:
        type: boolean
        allowed:
          - "yes"
          - "no"
      allowsNegativeAmortization:
        type: boolean
        allowed:
          - "yes"
          - "no"
      hasBalloonPayment:
        type: boolean
        allowed:
          - "yes"
          - "no"
      interestRateCap:
        type: number
      monthsUntilFirstRateChange:
        type: number
        unit: months
  CreditFacility:
    meaning: "An arrangement under which a borrower can draw credit over time, potentially through sub-facilities."
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      creditExtended:
        type: number
      availableAmount:
        type: number
  Borrower:
    meaning: A party that owes repayment.
    aliases: []
    properties: {}
  Lender:
    meaning: A party that provides credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "A party that collects loan payments on the lender's behalf."
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: An agreement carrying the agreed debt amount and dates.
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  SubFacility:
    meaning: A portion of a credit facility that can be identified within it.
    aliases: []
    properties: {}
  BorrowingCapacity:
    meaning: "The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
    aliases: []
    properties:
      assessedAmount:
        type: number
  PrincipalRepaymentTerms:
    meaning: "Terms that govern payment of a loan's principal."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms that govern a loan's interest payments and identify the day-count convention for accrual."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms governing principal repayment before maturity and any applicable penalty period.
    aliases: []
    properties:
      penaltyPeriodMonths:
        type: number
        unit: months
  FixedInterestRate:
    meaning: An interest rate that is fixed rather than subject to variable-rate changes.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An interest rate that can vary, including floating benchmark-based or institution-managed rates."
    aliases: []
    properties:
      rateValue:
        type: number
  LoanPaymentSchedule:
    meaning: The overall schedule of payments due on a loan.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "The schedule showing how a loan's debt balance changes over time."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The schedule of dates on which loan principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The schedule of dates on which loan interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: The schedule of dates on which loan interest is calculated.
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates on which a variable loan rate may reset.
    aliases: []
    properties: {}
  InitialRateSettingEvent:
    meaning: "An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: The record of actual payment transactions made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "One actual payment transaction within a loan's payment history, rather than a scheduled payment."
    aliases: []
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement granting rights over pledged collateral.
    aliases: []
    properties: {}
  CreditEnhancementAgreement:
    meaning: An arrangement protecting a credit-enhancement beneficiary.
    aliases: []
    properties: {}
  CreditEnhancementBeneficiary:
    meaning: A party protected under a credit-enhancement agreement.
    aliases: []
    properties: {}
  CollateralValue:
    meaning: A separately identifiable appraisal of collateral carrying a value and an as-of date.
    aliases: []
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  DayCountConvention:
    meaning: The basis identified by interest payment terms for calculating interest accrual.
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: A separately identifiable ratio comparing a collateralized loan to the collateral value used.
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  CombinedLoanToValueRatio:
    meaning: "A separately identifiable ratio accounting for total debt secured by an asset rather than only this loan's principal."
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  Principal:
    meaning: "Principal linked to a loan, with an outstanding amount distinct from its agreed principal amount and balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  InterestOwed:
    meaning: "Interest owed on a loan, with an outstanding amount distinct from the interest rate and loan balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the borrower owing repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the lender providing credit for the loan.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting the loan's principal and interest payments on the lender's behalf."
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: Identifies the borrower on the facility directly.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: Identifies the lender on the facility directly.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: Identifies the borrower on the credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: Identifies the lender on the credit agreement.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: Identifies a sub-facility forming part of the credit facility.
    aliases: []
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "Identifies the borrower's separately assessed capacity to repay."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: Identifies the principal obligation linked to the loan.
    aliases: []
  - name: governedByPrincipalTerms
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: Identifies the principal whose repayment these terms govern.
    aliases: []
  - name: hasInterestOwed
    from: Loan
    to: InterestOwed
    meaning: Identifies the interest owed linked to the loan.
    aliases: []
  - name: hasFixedRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applicable to the loan when its rate is fixed.
    aliases: []
  - name: hasVariableRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applicable to the loan when its rate is variable.
    aliases: []
  - name: governsInterest
    from: InterestPaymentTerms
    to: InterestOwed
    meaning: Identifies the interest obligation whose payment these terms govern.
    aliases: []
  - name: identifiesDayCountConvention
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count basis for calculating interest accrual under the interest payment terms.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies the overall payment schedule linked to the loan.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies the schedule showing how the loan balance changes.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies the principal-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies the interest-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies the interest-calculation dates scheduled for the loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies the rate-reset dates scheduled for the loan.
    aliases: []
  - name: hasInitialRateSettingEvent
    from: Loan
    to: InitialRateSettingEvent
    meaning: "Identifies the event where the loan's initial rate is established, without implying it occurs on the initial exchange date."
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of payments actually made."
    aliases: []
  - name: containsPaymentTransaction
    from: PaymentHistory
    to: PaymentTransaction
    meaning: "Identifies an actual payment transaction contained in the loan's history."
    aliases: []
  - name: hasCollateral
    from: Loan
    to: Collateral
    meaning: Identifies collateral linked to a secured loan; its absence does not establish that the loan is unsecured.
    aliases: []
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValue
    meaning: Identifies a dated appraised value recorded for the collateral.
    aliases: []
  - name: identifiesSecuredCollateral
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the collateral over which the security agreement grants rights.
    aliases: []
  - name: identifiesBeneficiary
    from: CreditEnhancementAgreement
    to: CreditEnhancementBeneficiary
    meaning: Identifies the party protected by the credit-enhancement agreement.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: Identifies the loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: Identifies the combined loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
rules:
  loanReadinessConfirmed:
    conditions:
      - Loan hasBorrower identifies a borrower.
      - Loan hasLender identifies a lender.
      - "Loan hasFixedRate or hasVariableRate identifies its applicable interest rate; if neither link exists, report \"Rate information missing; interest-bearing status cannot be determined\" and do not confirm readiness."
      - "Follow Loan hasInterestOwed to its InterestOwed obligation; use a reverse lookup for InterestPaymentTerms whose governsInterest link points to that same obligation. If none are found, do not confirm the terms check; if multiple are found, report all found rather than assuming one uniquely applies."
  collateralSupportVerified:
    conditions:
      - The Loan is supplied as already identified as secured; this model has no recorded property or path that independently establishes that classification.
      - "Loan hasCollateral identifies linked collateral; if absent, report \"Collateral support not verified by this check\" without concluding the loan is unsecured or judging any guaranty."
  variableRateSetupConfirmed:
    conditions:
      - The same Loan hasVariableRate identifies a VariableInterestRate.
      - That Loan hasInterestRateResetSchedule identifies an InterestRateResetSchedule.
      - "If either link is absent, identify the missing link and leave setup unconfirmed; a fixed-rate link, interestRateCap, or monthsUntilFirstRateChange is not a substitute."
  paymentRecordCompletenessConfirmed:
    conditions:
      - Loan hasPaymentHistory identifies a PaymentHistory.
      - That PaymentHistory containsPaymentTransaction identifies at least one PaymentTransaction.
      - "If the history exists but has no recorded entries, report \"No individual payment transactions recorded in this history\" without asserting that no payment was ever made."
  suppliedPrepaymentTimingConfirmed:
    conditions:
      - PrepaymentTerms are supplied for inspection; no recorded relationship establishes that they apply to a particular Loan.
      - "PrepaymentTerms.penaltyPeriodMonths is recorded; if absent, the penalty timing cannot be confirmed."
      - Confirmation of timing does not confirm what early repayment is permitted or that the terms apply to a particular Loan.
actions:
  confirmLoanReadiness:
    input: Loan
    preconditions:
      - loanReadinessConfirmed
    effect: "Return a readiness confirmation to the reviewer identifying the borrower, lender, applicable fixed or variable rate link, and interest obligation and terms links checked; report all terms found by reverse lookup rather than assuming one unique set of terms; do not claim a stored finding or alter Loan."
    verification: "Re-read Loan hasBorrower and hasLender, Loan hasFixedRate or hasVariableRate, and Loan hasInterestOwed; use reverse lookup for InterestPaymentTerms governsInterest pointing to that same InterestOwed obligation, and confirm the returned evidence matches the recorded links."
  confirmCollateralSupport:
    input: Loan
    preconditions:
      - collateralSupportVerified
    effect: "Return confirmation of the Loan hasCollateral link for the loan supplied as secured, with the linked collateral as evidence; do not assert a guaranty finding or stored result."
    verification: Re-read Loan hasCollateral and confirm the returned collateral matches the recorded link for that Loan.
  confirmVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupConfirmed
    effect: "Return confirmation that the same Loan hasVariableRate and hasInterestRateResetSchedule, identifying both links checked; do not claim a stored result."
    verification: Re-read Loan hasVariableRate and Loan hasInterestRateResetSchedule for that same Loan and confirm both links match the returned evidence.
  confirmPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompletenessConfirmed
    effect: "Return confirmation that Loan hasPaymentHistory and that the history containsPaymentTransaction for at least one actual transaction, identifying the links checked; do not claim a stored result."
    verification: Re-read Loan hasPaymentHistory and that PaymentHistory containsPaymentTransaction and confirm the returned evidence matches the recorded links.
  confirmSuppliedPrepaymentTiming:
    input: PrepaymentTerms
    preconditions:
      - suppliedPrepaymentTimingConfirmed
    effect: "Return confirmation of the recorded PrepaymentTerms.penaltyPeriodMonths on the supplied terms, without claiming they apply to any Loan or that the finding was stored."
    verification: Re-read PrepaymentTerms.penaltyPeriodMonths on the supplied terms and confirm it matches the returned value.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "confirmLoanReadiness" has input class Loan, and its precondition loanReadinessConfirmed refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "confirmSuppliedPrepaymentTiming" has input class PrepaymentTerms, and its precondition suppliedPrepaymentTimingConfirmed refers to Loan, which is not connected to it at all.

# SECOND-OPINION MODEL CHECK — 3 observation(s) from a separate automated review (report these to the expert, marked as model-derived, the same as the deterministic findings above; not authoritative on their own, but not to be dismissed without checking):
#   [model-review] The property is typed as boolean, but its allowed values are the strings "yes" and "no".
#   [model-review] The property is typed as boolean, but its allowed values are the strings "yes" and "no".
#   [model-review] The property is typed as boolean, but its allowed values are the strings "yes" and "no".

### Turn 83 — assistant

I’ve removed the percentage unit from both rate values. The final checklist also confirms that the meanings, relationship directions, and five action conditions are recorded. It **does not** clear every gap: Prepayment Terms still has no relationship to another class, so the loan-specific prepayment requirement remains incomplete.

The consistency checker repeats two navigation warnings. One concerns the confirmed reverse lookup from a loan’s Interest Owed record to terms pointing at it; I will not invent an opposite-direction link. The other treats a rule’s statement that supplied Prepayment Terms are **not** linked to Loan as though the action required that link. Neither warning changes what those checks can legitimately confirm.

An **automated second-opinion review** raised a separate representation issue on each of the three Loan indicators: they are typed as `boolean`, but their allowed values are recorded as the words `yes` and `no`. **Are those fields stored as true/false boolean values, with “yes/no” merely how users say them, or are the stored values literally the text “yes” and “no”?**

### Turn 84 — user

Treat all three as **true/false boolean values**. “Yes” and “no” are how we’d put the answer to a user, not literal stored text values. If an indicator is missing, the answer is unknown—not false.

### Turn 84 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      interestOnly: {type: boolean, allowed: [true, false]}\n      allowsNegativeAmortization: {type: boolean, allowed: [true, false]}\n      hasBalloonPayment: {type: boolean, allowed: [true, false]}"
}
```

### Turn 84 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 84 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 84 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan or credit facility?
  - id: cq2
    text: Who is the lender on a loan or credit facility?
  - id: cq3
    text: "Which servicer collects a loan's principal and interest payments on the lender's behalf?"
  - id: cq4
    text: "What is a loan's agreed principal amount?"
  - id: cq5
    text: What is the debt amount agreed in a credit agreement?
  - id: cq6
    text: "What is a loan's current balance?"
  - id: cq7
    text: "What is a loan's outstanding principal?"
  - id: cq8
    text: "What is a loan's outstanding interest?"
  - id: cq9
    text: "What is a credit facility's credit limit?"
  - id: cq10
    text: How much credit has been extended under a credit facility?
  - id: cq11
    text: "When is a loan's initial exchange date?"
  - id: cq12
    text: When does a loan mature?
  - id: cq13
    text: Which interest rate applies to a loan as of a specified date?
  - id: cq14
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq15
    text: "What is a variable-rate loan's reset schedule?"
  - id: cq16
    text: What interest rate cap applies to a variable-rate loan?
  - id: cq17
    text: "How many months until a variable-rate loan's first rate change?"
  - id: cq18
    text: "Which terms govern a loan's principal repayment?"
  - id: cq19
    text: "Which terms govern a loan's interest payments?"
  - id: cq20
    text: "Which day-count convention governs a loan's interest accrual?"
  - id: cq21
    text: What overall loan payment schedule is on file?
  - id: cq22
    text: What amortization schedule is on file for a loan?
  - id: cq23
    text: What principal-payment schedule is on file for a loan?
  - id: cq24
    text: What interest-payment schedule is on file for a loan?
  - id: cq25
    text: What interest-calculation schedule is on file for a loan?
  - id: cq26
    text: What rate-reset schedule is on file for a loan?
  - id: cq27
    text: What initial rate-setting event is on file for a loan?
  - id: cq28
    text: Is a loan marked interest-only?
  - id: cq29
    text: Does a loan allow negative amortization?
  - id: cq30
    text: Does a loan have a balloon payment?
  - id: cq31
    text: "Does a loan's repayment structure and schedule show full or partial amortization?"
  - id: cq32
    text: "What prepayment terms apply to a loan, including whether they permit prepayment?"
  - id: cq33
    text: "Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
  - id: cq34
    text: Is a loan secured?
  - id: cq35
    text: Is a secured loan classified as a guaranteed loan?
  - id: cq36
    text: Which collateral is linked to a collateral-backed loan?
  - id: cq37
    text: Which security agreement identifies the rights granted over the collateral linked to a loan?
  - id: cq38
    text: "Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?"
  - id: cq39
    text: "What is the appraised value of collateral linked to a loan, and what is its as-of date?"
  - id: cq40
    text: What is the loan-to-value ratio for a collateralized loan?
  - id: cq41
    text: "What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
  - id: cq42
    text: What payment history is recorded for a loan?
  - id: cq43
    text: "Which individual payment transactions actually made are contained in a loan's payment history?"
  - id: cq44
    text: Which sub-facilities form part of a credit facility?
  - id: cq45
    text: What amount of borrowing capacity has been assessed for the borrower?
  - id: cq46
    text: How much credit remains available under a credit facility?
  - id: cq47
    text: "Given prepayment terms supplied for review, what do they say about early repayment?"
  - id: cq48
    text: "Given prepayment terms supplied for review, is a penalty period recorded, and what is its length in months?"
classes:
  Loan:
    meaning: A debt set up and serviced under agreed terms.
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
      interestOnly:
        type: boolean
        allowed:
          - "true"
          - "false"
      allowsNegativeAmortization:
        type: boolean
        allowed:
          - "true"
          - "false"
      hasBalloonPayment:
        type: boolean
        allowed:
          - "true"
          - "false"
      interestRateCap:
        type: number
      monthsUntilFirstRateChange:
        type: number
        unit: months
  CreditFacility:
    meaning: "An arrangement under which a borrower can draw credit over time, potentially through sub-facilities."
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      creditExtended:
        type: number
      availableAmount:
        type: number
  Borrower:
    meaning: A party that owes repayment.
    aliases: []
    properties: {}
  Lender:
    meaning: A party that provides credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "A party that collects loan payments on the lender's behalf."
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: An agreement carrying the agreed debt amount and dates.
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  SubFacility:
    meaning: A portion of a credit facility that can be identified within it.
    aliases: []
    properties: {}
  BorrowingCapacity:
    meaning: "The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
    aliases: []
    properties:
      assessedAmount:
        type: number
  PrincipalRepaymentTerms:
    meaning: "Terms that govern payment of a loan's principal."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms that govern a loan's interest payments and identify the day-count convention for accrual."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms governing principal repayment before maturity and any applicable penalty period.
    aliases: []
    properties:
      penaltyPeriodMonths:
        type: number
        unit: months
  FixedInterestRate:
    meaning: An interest rate that is fixed rather than subject to variable-rate changes.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An interest rate that can vary, including floating benchmark-based or institution-managed rates."
    aliases: []
    properties:
      rateValue:
        type: number
  LoanPaymentSchedule:
    meaning: The overall schedule of payments due on a loan.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "The schedule showing how a loan's debt balance changes over time."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The schedule of dates on which loan principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The schedule of dates on which loan interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: The schedule of dates on which loan interest is calculated.
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates on which a variable loan rate may reset.
    aliases: []
    properties: {}
  InitialRateSettingEvent:
    meaning: "An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: The record of actual payment transactions made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "One actual payment transaction within a loan's payment history, rather than a scheduled payment."
    aliases: []
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement granting rights over pledged collateral.
    aliases: []
    properties: {}
  CreditEnhancementAgreement:
    meaning: An arrangement protecting a credit-enhancement beneficiary.
    aliases: []
    properties: {}
  CreditEnhancementBeneficiary:
    meaning: A party protected under a credit-enhancement agreement.
    aliases: []
    properties: {}
  CollateralValue:
    meaning: A separately identifiable appraisal of collateral carrying a value and an as-of date.
    aliases: []
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  DayCountConvention:
    meaning: The basis identified by interest payment terms for calculating interest accrual.
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: A separately identifiable ratio comparing a collateralized loan to the collateral value used.
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  CombinedLoanToValueRatio:
    meaning: "A separately identifiable ratio accounting for total debt secured by an asset rather than only this loan's principal."
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  Principal:
    meaning: "Principal linked to a loan, with an outstanding amount distinct from its agreed principal amount and balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  InterestOwed:
    meaning: "Interest owed on a loan, with an outstanding amount distinct from the interest rate and loan balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the borrower owing repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the lender providing credit for the loan.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting the loan's principal and interest payments on the lender's behalf."
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: Identifies the borrower on the facility directly.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: Identifies the lender on the facility directly.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: Identifies the borrower on the credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: Identifies the lender on the credit agreement.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: Identifies a sub-facility forming part of the credit facility.
    aliases: []
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "Identifies the borrower's separately assessed capacity to repay."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: Identifies the principal obligation linked to the loan.
    aliases: []
  - name: governedByPrincipalTerms
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: Identifies the principal whose repayment these terms govern.
    aliases: []
  - name: hasInterestOwed
    from: Loan
    to: InterestOwed
    meaning: Identifies the interest owed linked to the loan.
    aliases: []
  - name: hasFixedRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applicable to the loan when its rate is fixed.
    aliases: []
  - name: hasVariableRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applicable to the loan when its rate is variable.
    aliases: []
  - name: governsInterest
    from: InterestPaymentTerms
    to: InterestOwed
    meaning: Identifies the interest obligation whose payment these terms govern.
    aliases: []
  - name: identifiesDayCountConvention
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count basis for calculating interest accrual under the interest payment terms.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies the overall payment schedule linked to the loan.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies the schedule showing how the loan balance changes.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies the principal-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies the interest-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies the interest-calculation dates scheduled for the loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies the rate-reset dates scheduled for the loan.
    aliases: []
  - name: hasInitialRateSettingEvent
    from: Loan
    to: InitialRateSettingEvent
    meaning: "Identifies the event where the loan's initial rate is established, without implying it occurs on the initial exchange date."
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of payments actually made."
    aliases: []
  - name: containsPaymentTransaction
    from: PaymentHistory
    to: PaymentTransaction
    meaning: "Identifies an actual payment transaction contained in the loan's history."
    aliases: []
  - name: hasCollateral
    from: Loan
    to: Collateral
    meaning: Identifies collateral linked to a secured loan; its absence does not establish that the loan is unsecured.
    aliases: []
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValue
    meaning: Identifies a dated appraised value recorded for the collateral.
    aliases: []
  - name: identifiesSecuredCollateral
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the collateral over which the security agreement grants rights.
    aliases: []
  - name: identifiesBeneficiary
    from: CreditEnhancementAgreement
    to: CreditEnhancementBeneficiary
    meaning: Identifies the party protected by the credit-enhancement agreement.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: Identifies the loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: Identifies the combined loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
rules:
  loanReadinessConfirmed:
    conditions:
      - Loan hasBorrower identifies a borrower.
      - Loan hasLender identifies a lender.
      - "Loan hasFixedRate or hasVariableRate identifies its applicable interest rate; if neither link exists, report \"Rate information missing; interest-bearing status cannot be determined\" and do not confirm readiness."
      - "Follow Loan hasInterestOwed to its InterestOwed obligation; use a reverse lookup for InterestPaymentTerms whose governsInterest link points to that same obligation. If none are found, do not confirm the terms check; if multiple are found, report all found rather than assuming one uniquely applies."
  collateralSupportVerified:
    conditions:
      - The Loan is supplied as already identified as secured; this model has no recorded property or path that independently establishes that classification.
      - "Loan hasCollateral identifies linked collateral; if absent, report \"Collateral support not verified by this check\" without concluding the loan is unsecured or judging any guaranty."
  variableRateSetupConfirmed:
    conditions:
      - The same Loan hasVariableRate identifies a VariableInterestRate.
      - That Loan hasInterestRateResetSchedule identifies an InterestRateResetSchedule.
      - "If either link is absent, identify the missing link and leave setup unconfirmed; a fixed-rate link, interestRateCap, or monthsUntilFirstRateChange is not a substitute."
  paymentRecordCompletenessConfirmed:
    conditions:
      - Loan hasPaymentHistory identifies a PaymentHistory.
      - That PaymentHistory containsPaymentTransaction identifies at least one PaymentTransaction.
      - "If the history exists but has no recorded entries, report \"No individual payment transactions recorded in this history\" without asserting that no payment was ever made."
  suppliedPrepaymentTimingConfirmed:
    conditions:
      - PrepaymentTerms are supplied for inspection; no recorded relationship establishes that they apply to a particular Loan.
      - "PrepaymentTerms.penaltyPeriodMonths is recorded; if absent, the penalty timing cannot be confirmed."
      - Confirmation of timing does not confirm what early repayment is permitted or that the terms apply to a particular Loan.
actions:
  confirmLoanReadiness:
    input: Loan
    preconditions:
      - loanReadinessConfirmed
    effect: "Return a readiness confirmation to the reviewer identifying the borrower, lender, applicable fixed or variable rate link, and interest obligation and terms links checked; report all terms found by reverse lookup rather than assuming one unique set of terms; do not claim a stored finding or alter Loan."
    verification: "Re-read Loan hasBorrower and hasLender, Loan hasFixedRate or hasVariableRate, and Loan hasInterestOwed; use reverse lookup for InterestPaymentTerms governsInterest pointing to that same InterestOwed obligation, and confirm the returned evidence matches the recorded links."
  confirmCollateralSupport:
    input: Loan
    preconditions:
      - collateralSupportVerified
    effect: "Return confirmation of the Loan hasCollateral link for the loan supplied as secured, with the linked collateral as evidence; do not assert a guaranty finding or stored result."
    verification: Re-read Loan hasCollateral and confirm the returned collateral matches the recorded link for that Loan.
  confirmVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupConfirmed
    effect: "Return confirmation that the same Loan hasVariableRate and hasInterestRateResetSchedule, identifying both links checked; do not claim a stored result."
    verification: Re-read Loan hasVariableRate and Loan hasInterestRateResetSchedule for that same Loan and confirm both links match the returned evidence.
  confirmPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompletenessConfirmed
    effect: "Return confirmation that Loan hasPaymentHistory and that the history containsPaymentTransaction for at least one actual transaction, identifying the links checked; do not claim a stored result."
    verification: Re-read Loan hasPaymentHistory and that PaymentHistory containsPaymentTransaction and confirm the returned evidence matches the recorded links.
  confirmSuppliedPrepaymentTiming:
    input: PrepaymentTerms
    preconditions:
      - suppliedPrepaymentTimingConfirmed
    effect: "Return confirmation of the recorded PrepaymentTerms.penaltyPeriodMonths on the supplied terms, without claiming they apply to any Loan or that the finding was stored."
    verification: Re-read PrepaymentTerms.penaltyPeriodMonths on the supplied terms and confirm it matches the returned value.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "confirmLoanReadiness" has input class Loan, and its precondition loanReadinessConfirmed refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "confirmSuppliedPrepaymentTiming" has input class PrepaymentTerms, and its precondition suppliedPrepaymentTimingConfirmed refers to Loan, which is not connected to it at all.

### Turn 84 — assistant

I’ve changed the three Loan indicators to **true/false** in the live model. A missing indicator remains **unknown**, not false. The live export still displays their allowed values as quoted `"true"` and `"false"`; because the automated second opinion flagged a boolean-versus-string mismatch, that serialization needs a tool-level type check. I won’t claim the warning is fully cleared.

**Final validation:** I replayed all 48 recorded questions and five actions against the live model. The confirmed relationship directions, meanings, and action conditions are present. The path checks were also revisited for classes added later; no direct link was invented to replace a reverse lookup or a missing path. The bounded expansion questions were asked and confirmed.

The model is being left **known-incomplete** on these named items:

- **Loan-specific prepayment:** Prepayment Terms has no recorded relationship to a Loan or another class. Supplied terms can be checked for penalty months, but not established as governing a particular loan; their readable early-repayment wording is also unconfirmed.
- **Rate and repayment evidence:** There is no dated rate-applicability history for an as-of-date answer, or sufficient final-payment detail to decide full versus partial amortization. The day-count convention lacks confirmed readable basis wording.
- **Security and enhancement:** There is no on-file identifier for secured or guaranteed loan classification, or path from a particular loan to its credit-enhancement agreement and beneficiary. The collateral-support action therefore requires a loan supplied as secured.
- **Valuation basis:** The model does not identify which dated appraisal was used for either collateral ratio.
- **Finding retention:** Actions return and re-check findings, but no storage or retention mechanism has been established.
- **Tool representation:** Prepayment Terms remains the sole class with zero relationships. The live export’s quoted boolean allowed values need type checking.

Two automated navigation warnings remain: one does not recognize the **confirmed reverse lookup** for interest-payment terms, and the other treats the supplied-terms rule’s explicit *absence* of a loan link as a required path. I have not added unsupported links to silence either warning.

### Turn 84 — user

[System note] Your last reply said "all 48", but this turn's apply_ontology_yaml call(s) actually recorded 0 added and 1 updated item(s) — not 48. State the true numbers the next time you summarize what was recorded, and call get_graph_state first if you are not sure what actually persisted.

### Turn 85 — user

Before we close, one more systematic pass, to catch what we have not talked about yet.

Call get_graph_state first and treat it as the source of truth for what is already on the canvas. Then go through every class on the canvas, three to five classes per question, and ask me, for each one, what exists around it in our work: its subordinate parts or components; its states or lifecycle events; the actors or parties responsible for it; its inputs and outputs; related documents or agreements; measurements or characteristic values it carries; earlier or later stages of a workflow it belongs to; more specific or sibling kinds of the same thing; and which of the properties already confirmed on a sibling class also apply to it. Skip the categories that plainly do not fit a class.

Ask these as open questions about what exists, not about what the agent needs: do not limit a question to what the recorded competency questions or actions require, and do not ask me to mention only what is needed. Only once I have answered, check each thing I named against the competency questions and actions, exactly as you would any other candidate, and add only what passes; nothing is added only because it was mentioned. Keep a running list of the candidates and close each one as added, declined (with the reason) or left open; none may silently disappear.

When every class in this pass has been asked about and every candidate is closed, end that message with one line in exactly this form, and ask nothing further in it:
COVERAGE LEDGER: surfaced=<number>; added=<number>; declined=<number>; open=<number>

### Turn 85 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 85 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan or credit facility?
  - id: cq2
    text: Who is the lender on a loan or credit facility?
  - id: cq3
    text: "Which servicer collects a loan's principal and interest payments on the lender's behalf?"
  - id: cq4
    text: "What is a loan's agreed principal amount?"
  - id: cq5
    text: What is the debt amount agreed in a credit agreement?
  - id: cq6
    text: "What is a loan's current balance?"
  - id: cq7
    text: "What is a loan's outstanding principal?"
  - id: cq8
    text: "What is a loan's outstanding interest?"
  - id: cq9
    text: "What is a credit facility's credit limit?"
  - id: cq10
    text: How much credit has been extended under a credit facility?
  - id: cq11
    text: "When is a loan's initial exchange date?"
  - id: cq12
    text: When does a loan mature?
  - id: cq13
    text: Which interest rate applies to a loan as of a specified date?
  - id: cq14
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq15
    text: "What is a variable-rate loan's reset schedule?"
  - id: cq16
    text: What interest rate cap applies to a variable-rate loan?
  - id: cq17
    text: "How many months until a variable-rate loan's first rate change?"
  - id: cq18
    text: "Which terms govern a loan's principal repayment?"
  - id: cq19
    text: "Which terms govern a loan's interest payments?"
  - id: cq20
    text: "Which day-count convention governs a loan's interest accrual?"
  - id: cq21
    text: What overall loan payment schedule is on file?
  - id: cq22
    text: What amortization schedule is on file for a loan?
  - id: cq23
    text: What principal-payment schedule is on file for a loan?
  - id: cq24
    text: What interest-payment schedule is on file for a loan?
  - id: cq25
    text: What interest-calculation schedule is on file for a loan?
  - id: cq26
    text: What rate-reset schedule is on file for a loan?
  - id: cq27
    text: What initial rate-setting event is on file for a loan?
  - id: cq28
    text: Is a loan marked interest-only?
  - id: cq29
    text: Does a loan allow negative amortization?
  - id: cq30
    text: Does a loan have a balloon payment?
  - id: cq31
    text: "Does a loan's repayment structure and schedule show full or partial amortization?"
  - id: cq32
    text: "What prepayment terms apply to a loan, including whether they permit prepayment?"
  - id: cq33
    text: "Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
  - id: cq34
    text: Is a loan secured?
  - id: cq35
    text: Is a secured loan classified as a guaranteed loan?
  - id: cq36
    text: Which collateral is linked to a collateral-backed loan?
  - id: cq37
    text: Which security agreement identifies the rights granted over the collateral linked to a loan?
  - id: cq38
    text: "Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?"
  - id: cq39
    text: "What is the appraised value of collateral linked to a loan, and what is its as-of date?"
  - id: cq40
    text: What is the loan-to-value ratio for a collateralized loan?
  - id: cq41
    text: "What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
  - id: cq42
    text: What payment history is recorded for a loan?
  - id: cq43
    text: "Which individual payment transactions actually made are contained in a loan's payment history?"
  - id: cq44
    text: Which sub-facilities form part of a credit facility?
  - id: cq45
    text: What amount of borrowing capacity has been assessed for the borrower?
  - id: cq46
    text: How much credit remains available under a credit facility?
  - id: cq47
    text: "Given prepayment terms supplied for review, what do they say about early repayment?"
  - id: cq48
    text: "Given prepayment terms supplied for review, is a penalty period recorded, and what is its length in months?"
classes:
  Loan:
    meaning: A debt set up and serviced under agreed terms.
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
      interestOnly:
        type: boolean
        allowed:
          - "true"
          - "false"
      allowsNegativeAmortization:
        type: boolean
        allowed:
          - "true"
          - "false"
      hasBalloonPayment:
        type: boolean
        allowed:
          - "true"
          - "false"
      interestRateCap:
        type: number
      monthsUntilFirstRateChange:
        type: number
        unit: months
  CreditFacility:
    meaning: "An arrangement under which a borrower can draw credit over time, potentially through sub-facilities."
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      creditExtended:
        type: number
      availableAmount:
        type: number
  Borrower:
    meaning: A party that owes repayment.
    aliases: []
    properties: {}
  Lender:
    meaning: A party that provides credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "A party that collects loan payments on the lender's behalf."
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: An agreement carrying the agreed debt amount and dates.
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  SubFacility:
    meaning: A portion of a credit facility that can be identified within it.
    aliases: []
    properties: {}
  BorrowingCapacity:
    meaning: "The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
    aliases: []
    properties:
      assessedAmount:
        type: number
  PrincipalRepaymentTerms:
    meaning: "Terms that govern payment of a loan's principal."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms that govern a loan's interest payments and identify the day-count convention for accrual."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms governing principal repayment before maturity and any applicable penalty period.
    aliases: []
    properties:
      penaltyPeriodMonths:
        type: number
        unit: months
  FixedInterestRate:
    meaning: An interest rate that is fixed rather than subject to variable-rate changes.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An interest rate that can vary, including floating benchmark-based or institution-managed rates."
    aliases: []
    properties:
      rateValue:
        type: number
  LoanPaymentSchedule:
    meaning: The overall schedule of payments due on a loan.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "The schedule showing how a loan's debt balance changes over time."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The schedule of dates on which loan principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The schedule of dates on which loan interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: The schedule of dates on which loan interest is calculated.
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates on which a variable loan rate may reset.
    aliases: []
    properties: {}
  InitialRateSettingEvent:
    meaning: "An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: The record of actual payment transactions made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "One actual payment transaction within a loan's payment history, rather than a scheduled payment."
    aliases: []
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement granting rights over pledged collateral.
    aliases: []
    properties: {}
  CreditEnhancementAgreement:
    meaning: An arrangement protecting a credit-enhancement beneficiary.
    aliases: []
    properties: {}
  CreditEnhancementBeneficiary:
    meaning: A party protected under a credit-enhancement agreement.
    aliases: []
    properties: {}
  CollateralValue:
    meaning: A separately identifiable appraisal of collateral carrying a value and an as-of date.
    aliases: []
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  DayCountConvention:
    meaning: The basis identified by interest payment terms for calculating interest accrual.
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: A separately identifiable ratio comparing a collateralized loan to the collateral value used.
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  CombinedLoanToValueRatio:
    meaning: "A separately identifiable ratio accounting for total debt secured by an asset rather than only this loan's principal."
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  Principal:
    meaning: "Principal linked to a loan, with an outstanding amount distinct from its agreed principal amount and balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  InterestOwed:
    meaning: "Interest owed on a loan, with an outstanding amount distinct from the interest rate and loan balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the borrower owing repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the lender providing credit for the loan.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting the loan's principal and interest payments on the lender's behalf."
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: Identifies the borrower on the facility directly.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: Identifies the lender on the facility directly.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: Identifies the borrower on the credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: Identifies the lender on the credit agreement.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: Identifies a sub-facility forming part of the credit facility.
    aliases: []
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "Identifies the borrower's separately assessed capacity to repay."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: Identifies the principal obligation linked to the loan.
    aliases: []
  - name: governedByPrincipalTerms
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: Identifies the principal whose repayment these terms govern.
    aliases: []
  - name: hasInterestOwed
    from: Loan
    to: InterestOwed
    meaning: Identifies the interest owed linked to the loan.
    aliases: []
  - name: hasFixedRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applicable to the loan when its rate is fixed.
    aliases: []
  - name: hasVariableRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applicable to the loan when its rate is variable.
    aliases: []
  - name: governsInterest
    from: InterestPaymentTerms
    to: InterestOwed
    meaning: Identifies the interest obligation whose payment these terms govern.
    aliases: []
  - name: identifiesDayCountConvention
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count basis for calculating interest accrual under the interest payment terms.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies the overall payment schedule linked to the loan.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies the schedule showing how the loan balance changes.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies the principal-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies the interest-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies the interest-calculation dates scheduled for the loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies the rate-reset dates scheduled for the loan.
    aliases: []
  - name: hasInitialRateSettingEvent
    from: Loan
    to: InitialRateSettingEvent
    meaning: "Identifies the event where the loan's initial rate is established, without implying it occurs on the initial exchange date."
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of payments actually made."
    aliases: []
  - name: containsPaymentTransaction
    from: PaymentHistory
    to: PaymentTransaction
    meaning: "Identifies an actual payment transaction contained in the loan's history."
    aliases: []
  - name: hasCollateral
    from: Loan
    to: Collateral
    meaning: Identifies collateral linked to a secured loan; its absence does not establish that the loan is unsecured.
    aliases: []
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValue
    meaning: Identifies a dated appraised value recorded for the collateral.
    aliases: []
  - name: identifiesSecuredCollateral
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the collateral over which the security agreement grants rights.
    aliases: []
  - name: identifiesBeneficiary
    from: CreditEnhancementAgreement
    to: CreditEnhancementBeneficiary
    meaning: Identifies the party protected by the credit-enhancement agreement.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: Identifies the loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: Identifies the combined loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
rules:
  loanReadinessConfirmed:
    conditions:
      - Loan hasBorrower identifies a borrower.
      - Loan hasLender identifies a lender.
      - "Loan hasFixedRate or hasVariableRate identifies its applicable interest rate; if neither link exists, report \"Rate information missing; interest-bearing status cannot be determined\" and do not confirm readiness."
      - "Follow Loan hasInterestOwed to its InterestOwed obligation; use a reverse lookup for InterestPaymentTerms whose governsInterest link points to that same obligation. If none are found, do not confirm the terms check; if multiple are found, report all found rather than assuming one uniquely applies."
  collateralSupportVerified:
    conditions:
      - The Loan is supplied as already identified as secured; this model has no recorded property or path that independently establishes that classification.
      - "Loan hasCollateral identifies linked collateral; if absent, report \"Collateral support not verified by this check\" without concluding the loan is unsecured or judging any guaranty."
  variableRateSetupConfirmed:
    conditions:
      - The same Loan hasVariableRate identifies a VariableInterestRate.
      - That Loan hasInterestRateResetSchedule identifies an InterestRateResetSchedule.
      - "If either link is absent, identify the missing link and leave setup unconfirmed; a fixed-rate link, interestRateCap, or monthsUntilFirstRateChange is not a substitute."
  paymentRecordCompletenessConfirmed:
    conditions:
      - Loan hasPaymentHistory identifies a PaymentHistory.
      - That PaymentHistory containsPaymentTransaction identifies at least one PaymentTransaction.
      - "If the history exists but has no recorded entries, report \"No individual payment transactions recorded in this history\" without asserting that no payment was ever made."
  suppliedPrepaymentTimingConfirmed:
    conditions:
      - PrepaymentTerms are supplied for inspection; no recorded relationship establishes that they apply to a particular Loan.
      - "PrepaymentTerms.penaltyPeriodMonths is recorded; if absent, the penalty timing cannot be confirmed."
      - Confirmation of timing does not confirm what early repayment is permitted or that the terms apply to a particular Loan.
actions:
  confirmLoanReadiness:
    input: Loan
    preconditions:
      - loanReadinessConfirmed
    effect: "Return a readiness confirmation to the reviewer identifying the borrower, lender, applicable fixed or variable rate link, and interest obligation and terms links checked; report all terms found by reverse lookup rather than assuming one unique set of terms; do not claim a stored finding or alter Loan."
    verification: "Re-read Loan hasBorrower and hasLender, Loan hasFixedRate or hasVariableRate, and Loan hasInterestOwed; use reverse lookup for InterestPaymentTerms governsInterest pointing to that same InterestOwed obligation, and confirm the returned evidence matches the recorded links."
  confirmCollateralSupport:
    input: Loan
    preconditions:
      - collateralSupportVerified
    effect: "Return confirmation of the Loan hasCollateral link for the loan supplied as secured, with the linked collateral as evidence; do not assert a guaranty finding or stored result."
    verification: Re-read Loan hasCollateral and confirm the returned collateral matches the recorded link for that Loan.
  confirmVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupConfirmed
    effect: "Return confirmation that the same Loan hasVariableRate and hasInterestRateResetSchedule, identifying both links checked; do not claim a stored result."
    verification: Re-read Loan hasVariableRate and Loan hasInterestRateResetSchedule for that same Loan and confirm both links match the returned evidence.
  confirmPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompletenessConfirmed
    effect: "Return confirmation that Loan hasPaymentHistory and that the history containsPaymentTransaction for at least one actual transaction, identifying the links checked; do not claim a stored result."
    verification: Re-read Loan hasPaymentHistory and that PaymentHistory containsPaymentTransaction and confirm the returned evidence matches the recorded links.
  confirmSuppliedPrepaymentTiming:
    input: PrepaymentTerms
    preconditions:
      - suppliedPrepaymentTimingConfirmed
    effect: "Return confirmation of the recorded PrepaymentTerms.penaltyPeriodMonths on the supplied terms, without claiming they apply to any Loan or that the finding was stored."
    verification: Re-read PrepaymentTerms.penaltyPeriodMonths on the supplied terms and confirm it matches the returned value.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "confirmLoanReadiness" has input class Loan, and its precondition loanReadinessConfirmed refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "confirmSuppliedPrepaymentTiming" has input class PrepaymentTerms, and its precondition suppliedPrepaymentTimingConfirmed refers to Loan, which is not connected to it at all.

### Turn 85 — assistant

I checked the canvas first. It contains **48 recorded questions and 32 classes**. My earlier “all 48” meant that I *reviewed* the existing questions, not that I added 48 in that turn. The last edit added **0** items and updated **1** class. Thanks for catching the ambiguity.

I’ll keep a ledger for this pass. I won’t re-probe the major concepts you already answered “no” for in the earlier expansion pass, but I’ll work through the other classes in groups and test every new candidate against the recorded questions and actions before adding it.

First group: **Borrower, Lender, Servicer, and Credit-Enhancement Beneficiary**. For each, what exists around that party in your work—for example, other connected parties, an agreement establishing its role, relevant stages, or characteristic values? “Nothing further” for any one of them is a useful answer.

### Turn 86 — user

For this scope, I wouldn’t add anything further around those parties:

- **Borrower:** Identified on a loan, credit agreement, or facility, and linked to an assessed borrowing capacity. We haven’t established other party links or characteristic values for the borrower.
- **Lender:** Identified on a loan, credit agreement, or facility as the party providing credit. We haven’t established further lender-specific values or stages.
- **Servicer:** The loan identifies the party collecting principal and interest payments on the lender’s behalf. We haven’t established a separate servicing agreement or a link from the servicer to the lender.
- **Credit-enhancement beneficiary:** Identified by the credit-enhancement agreement as the party it protects. We have no confirmed route from a particular loan to that agreement or beneficiary.

Those are the connections I’d use for the agreed questions and checks; I wouldn’t add paperwork or stages around the parties just to complete the picture.

### Turn 86 — assistant

For those four parties, you identified **no new candidates** beyond the recorded connections. The ledger remains at zero surfaced, added, declined, and open.

I need to correct my plan: you asked about **every** class, so I’ll include Loan and Credit Facility too, while taking your earlier “no further stages or records for this scope” answers into account.

Next group: **Loan, Credit Facility, Credit Agreement, and Sub-facility**. What exists around each in your work—parts, states or stages, responsible parties, inputs or outputs, agreements, measurements, or more specific or sibling kinds? For Credit Facility and Credit Agreement, which already-confirmed values on one, if any, also apply to the other? Please distinguish anything new from what we’ve already recorded.

### Turn 87 — user

For the **agreed questions and checks**, I don’t see a new part, stage, or connection to add around these four. There are some distinctions worth keeping in the ledger:

- **Loan:** Its borrower, lender, servicer, obligations, rate, schedules, payment history, and—where applicable—collateral are already covered. Secured, collateralized, guaranteed, and unsecured are more specific kinds of loan, not additional loans connected to it. We still lack a confirmed on-file way for this tool to identify those classifications.
- **Credit facility:** The facility has its own borrower and lender, recorded limit, credit extended and available amount, and any sub-facilities. A **revolving line of credit** lets the borrower draw, repay, and draw again. **Committed** and **uncommitted** distinguish whether the facility is a confirmed source of financing under its conditions; they are kinds of facility, not a status field we’ve established.
- **Credit agreement:** A facility is a form of credit agreement, not a separate agreement connected to one. **Open-end credit** permits use and repayment within an agreed limit; **closed-end credit** does not permit the principal to increase after full disbursement at closing. Those distinctions don’t establish new links.
- **Sub-facility:** It is a portion of a facility. A portion may itself be committed or uncommitted; a committed portion may be associated with particular collateral, but we have not established a recorded sub-facility-to-collateral link for this work.

On **values shared between facility and agreement**: the credit agreement’s debt amount and initial-exchange and maturity dates describe agreement-level terms, while the facility’s limit, credit extended, and available amount describe its credit arrangement. Being a form of credit agreement does **not** establish that those agreement values are populated on every facility record, or that its debt amount equals its limit. I wouldn’t copy values between records or add fields on that assumption.

### Turn 87 — assistant

For those four classes, I’ve logged six candidate **distinctions or connections**, not six additions. Loan classification identification remains **open** because it matters to recorded questions and the secured-loan check, but has no confirmed on-file source. I’ve **declined five** for this model: revolving-facility kind, facility commitment kind, open-/closed-end agreement kind, sub-facility commitment kind, and a sub-facility-to-collateral link. None has a task requiring a new field or link, and the collateral link has not been established. I won’t copy agreement values onto facilities.

**Running ledger: surfaced 6; added 0; declined 5; open 1.**

Next group: **Borrowing Capacity, Principal Repayment Terms, Interest Payment Terms, and Prepayment Terms**. For each, what exists around it in your work—related obligations or parties, component terms, stages, documents, characteristic values, or more specific and sibling kinds? Where the term records are comparable, which values already confirmed on one also apply to another? Please include what exists even if we have not yet established a use for it.

### Turn 88 — user

Here’s what exists around each, including details we haven’t needed as fields in the working model:

- **Borrowing capacity:** The borrower has an assessed capacity amount—the upper bound the lender believes the borrower can repay. It is distinct from a facility limit or available credit. We have not established an as-of-date field, a link to a particular facility, or an assessment-workflow record.

- **Principal repayment terms:** These govern payment of a principal obligation. They can specify an initial principal payment date, a principal repayment date, a payment frequency, and a payment day. The established connection runs **from the terms to the principal they govern**; we haven’t established a direct link from the loan to those terms.

- **Interest payment terms:** These govern payment of the interest obligation and identify the **day-count convention** used for accrual. They can specify an initial interest-accrual date, initial and final interest-payment dates, interest-payment frequency and day, and compounding frequency. The connections run **from the terms to interest** and **from the terms to the day-count convention**.

- **Prepayment terms:** These concern paying principal before maturity and can carry a penalty period in months. They are a particular form of principal repayment terms, but we still have **no recorded connection** identifying which prepayment terms apply to a particular loan or principal obligation. No separate permission flag or readable governing wording has been established.

Principal and interest terms are comparable as payment terms, but their **dates, frequencies, and payment days are distinct**—I wouldn’t copy a value from one to the other. The broader debt terms describe the borrower’s and lender’s rights and obligations, but we haven’t established a new recorded path through them.

### Turn 88 — assistant

I’ve logged the new dates and frequencies you described—four on Principal Repayment Terms and six on Interest Payment Terms—but **declined all ten as fields for this working model**: none is needed to answer the recorded questions or perform the five checks. I’ve also declined broader debt terms as a new record because no confirmed task or path uses them. The existing terms-to-obligation links and the unresolved Prepayment Terms path stay as they are.

**Running ledger: surfaced 17; added 0; declined 16; open 1** (the previously noted on-file loan-classification source).

Next group: **Fixed Interest Rate, Variable Interest Rate, Day-Count Convention, and Initial Rate-Setting Event**. What exists around each—more specific rate kinds, dates or events, calculation-basis descriptions, related records, or characteristic values? For the two rate records, which properties confirmed on one also apply to the other? Please distinguish recorded facts from details whose source we have not established.

### Turn 89 — user

- **Fixed interest rate:** It has a numeric rate that does not fluctuate over the loan’s life. The loan links to the rate. We have not established an effective-date field or a stored unit for its numeric value.
- **Variable interest rate:** It also has a numeric rate and a direct link from the loan. **Floating rates** are based on a benchmark; **managed rates** are set by the institution from time to time. Those are more specific kinds of variable rate. We have not established a benchmark field, an effective-date field, or a stored unit here. The **loan**, not the rate record, links to the reset schedule and carries the cap and first-change term.
- **Day-count convention:** Interest payment terms point to the convention used as the basis for calculating accrual. We have not established a readable name, code, method description, or permitted-value list on its record.
- **Initial rate-setting event:** The loan links to the event at which its initial rate is established. It is distinct from a later rate reset and need not coincide with the initial funding exchange. We have not established a date field or another characteristic value on the event.

The confirmed property shared by the fixed and variable rate records is the **numeric rate**. Neither record, as established here, supplies dated rate history for the as-of-date question.

### Turn 89 — assistant

The **numeric rate value** is already recorded on both rate classes, so I’ve made no change. From this group, I’ve logged six candidates: floating and managed rate kinds, a benchmark field, dated rate-applicability evidence, readable day-count wording, and a date on the initial rate-setting event. I’ve **declined** the two rate-kind additions, benchmark field, and event date because no recorded question or check uses those additions. **Dated rate evidence and readable day-count wording remain open** because recorded questions need them, but their sources are unconfirmed.

**Running ledger: surfaced 23; added 0; declined 20; open 3.** The third open item is the on-file loan-classification source.

Next group: **Loan Payment Schedule, Amortization Schedule, Principal Payment Schedule, and Interest Payment Schedule**. What exists around each in your work—scheduled entries, dates or amounts, stages, related terms, or more specific kinds? Which characteristics, if any, genuinely apply to more than one of these schedules?

### Turn 90 — user

Each is a distinct schedule linked **from the loan**:

- The **loan payment schedule** lays out the loan’s regular or explicit payments.
- The **amortization schedule** shows how periodic payments change the debt balance over time.
- The **principal payment schedule** sets out dates on which some or all principal is due.
- The **interest payment schedule** sets out dates on which interest is due.

All four can carry an **anticipated number of payments**. That count does not give us individual dated entries or payment amounts. We haven’t established separate scheduled-entry records, dates or amounts on those entries, or direct links from these schedules to the repayment terms. In particular, without the final-payment and remaining-balance detail, the amortization schedule as recorded cannot settle full versus partial amortization.

So the genuinely shared confirmed characteristic is the anticipated payment count; matching dates in practice wouldn’t make the four schedules interchangeable.

### Turn 90 — assistant

All four schedules are confirmed as separate Loan-linked records. I’ve logged four candidates from this group: **anticipated payment count** (shared across the four), **individual scheduled entries and their dates or amounts**, **direct schedule-to-terms links**, and **final-payment and remaining-balance detail**. I’ve declined the first three for this working model: the count does not answer an agreed question, and neither entries nor direct terms links have an established record or required use. Final-payment detail remains **open** because the full-versus-partial amortization question needs evidence we do not yet have.

**Running ledger: surfaced 27; added 0; declined 23; open 4.**

Next group: **Interest Calculation Schedule, Interest Rate Reset Schedule, Payment History, and Payment Transaction**. What exists around each in your work—scheduled calculation or reset details, actual transaction contents, stages, related records, or characteristic values? Please distinguish a scheduled event from an event that actually occurred.

### Turn 91 — user

The **interest calculation schedule** and **interest rate reset schedule** are both linked from the loan. One identifies when interest is scheduled to be calculated; the other identifies when a rate and its corresponding actual rate are scheduled to be recalculated. We haven’t established individual dated entries or values on either schedule in this working model. A scheduled calculation or reset is **not evidence that the event occurred**.

The **payment history** is the loan’s record of actual payments and contains **individual payment transactions**. A transaction represents a payment made toward principal, interest, fees, or another related amount. We haven’t established transaction-level amount fields, a breakdown among those categories, or later handling stages. Nor do we need a direct transaction-to-loan link: the established route is through the history.

Actual interest calculations and rate resets are meaningful events, distinct from their schedules, just as actual principal and interest payments are distinct from amounts due. None of the agreed questions or five checks requires those event records separately; the payment-completeness check looks for transactions in the history, not for scheduled events.

### Turn 91 — assistant

The two schedules remain distinct from events that actually occurred, and Payment History → Payment Transaction remains the only established route to an actual payment. I’ve logged eight candidates from this group: dated entries on each schedule; transaction amount, category breakdown, and later handling; actual calculation and reset events; and separate principal- or interest-payment event records. I’ve **declined all eight for this working model**: the relevant records or fields have not been established, and none is needed separately by the recorded questions or checks.

**Running ledger: surfaced 35; added 0; declined 31; open 4.**

Next group: **Collateral, Security Agreement, Credit-Enhancement Agreement, and Collateral Value**. What else exists around each in your work—parts or kinds, parties, agreements, dated measurements, or earlier and later stages? In particular, which characteristics of Collateral Value, if any, belong on Collateral itself? Please distinguish a connection that is recorded from one that merely seems plausible.

### Turn 92 — user

- **Collateral:** A secured loan can link to the collateral pledged for it. Collateral in turn links to its **dated appraised values**. We haven’t established a collateral-type field, a lifecycle stage, or a value stored directly on the collateral.
- **Security agreement:** It identifies the collateral over which it grants a financial interest. That link runs **from the agreement to the collateral**; there is no established direct link from the loan to the agreement.
- **Credit-enhancement agreement:** It identifies the beneficiary protected by the arrangement. We have no established path from a particular loan or its collateral to that agreement.
- **Collateral value:** The **appraised value and as-of date belong together on the dated value record**, not on collateral itself. That lets us distinguish appraisals taken at different times.

For a collateralized loan, the two ratios are linked to the loan, but neither ratio identifies which dated appraisal was used. I wouldn’t add that connection, or any further parties or stages, merely because they might be plausible.

### Turn 92 — assistant

The appraisal amount and as-of date belong on **Collateral Value**, not on Collateral; that is already how they are recorded. I’ve logged six candidates from this group. I’ve **declined four** for this working model: a collateral-type field, a collateral lifecycle field, a duplicate value on Collateral, and a direct Loan-to-Security-Agreement link that has not been established. Two remain **open** because recorded questions depend on evidence we lack: a path from a particular loan to its credit-enhancement agreement, and a link identifying which dated appraisal underlies a ratio.

**Running ledger: surfaced 41; added 0; declined 35; open 6.**

The final four classes on the canvas are **Loan-to-Value Ratio, Combined Loan-to-Value Ratio, Principal, and Interest Owed**. What exists around each in your work—measurements and their basis, changes over time, connected terms, or more specific or sibling kinds? For the two ratios and the two obligations respectively, which already-confirmed properties genuinely apply to both, and what must remain distinct?

### Turn 93 — user

For the **two ratios**, each has its own numeric ratio value and is linked from a collateralized loan. Loan-to-value compares that loan’s principal with the appraised value of the securing asset; combined loan-to-value uses the total debt secured by the asset or assets. They must remain separate measurements. We have no recorded ratio-to-appraisal link, so we cannot establish which dated value underlies either figure. We also haven’t established dated ratio records or a history of changes.

For **principal and interest owed**, both are obligations linked directly from the loan, and both have a numeric **outstanding amount**. Their governing terms remain distinct: principal repayment terms point to the principal they govern; interest payment terms point to the interest they govern and identify its day-count convention. Neither outstanding amount is a substitute for the loan balance, and interest owed is not the interest rate. We haven’t established a dated history of changes to either outstanding amount.

### Turn 93 — assistant

The pass has now covered **all 32 classes** on the canvas. For the final four, both ratios already have distinct numeric values, and Principal and Interest Owed already have distinct outstanding amounts and governing-term links. I’ve declined two further candidates—dated histories of ratio values and of outstanding amounts—because no recorded question or action uses either history. No ontology elements were added or updated in this pass.

I also corrected the running ledger: I had failed to count two candidates raised earlier, even though we discussed them. Both remain **open**, not declined: the path identifying which Prepayment Terms apply to a loan, and readable wording saying what those terms permit. The other six open candidates are an on-file loan-classification source, dated rate-applicability evidence, readable day-count wording, final-payment evidence for amortization, a path to a particular loan’s credit-enhancement agreement, and the appraisal used for each ratio.

Every surfaced candidate has therefore been assigned a disposition; **open** means the recorded requirement remains unresolved, not that a connection or value was inferred.

COVERAGE LEDGER: surfaced=45; added=0; declined=37; open=8

### Turn 94 — user

One last pass, on wording: I would like the model to use our own words.

Call get_graph_state first. Then go through what is on the canvas, three to five items per question, relationships first, then properties, then classes:
- for each relationship, ask me what we call this connection ourselves, in one verb phrase, and which way round we would say it;
- for each property and each class, ask me whether that is what we would call it, or whether we have our own term for it.

Record each answer with the rename_ontology_elements tool: a relationship takes my verb phrase, and if I state it the other way round it is turned round (reverse: true); a property or a class takes my term. Previous names of classes and relationships are kept as aliases automatically. Where I say the current name is already right, leave it as it is. Do not add or remove anything in this pass.

When every relationship, property and class has been asked about, end that message with one line in exactly this form, and ask nothing further in it:
NAMING LEDGER: relationships_renamed=<number>; relationships_redirected=<number>; properties_renamed=<number>; classes_renamed=<number>

### Turn 94 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 94 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan or credit facility?
  - id: cq2
    text: Who is the lender on a loan or credit facility?
  - id: cq3
    text: "Which servicer collects a loan's principal and interest payments on the lender's behalf?"
  - id: cq4
    text: "What is a loan's agreed principal amount?"
  - id: cq5
    text: What is the debt amount agreed in a credit agreement?
  - id: cq6
    text: "What is a loan's current balance?"
  - id: cq7
    text: "What is a loan's outstanding principal?"
  - id: cq8
    text: "What is a loan's outstanding interest?"
  - id: cq9
    text: "What is a credit facility's credit limit?"
  - id: cq10
    text: How much credit has been extended under a credit facility?
  - id: cq11
    text: "When is a loan's initial exchange date?"
  - id: cq12
    text: When does a loan mature?
  - id: cq13
    text: Which interest rate applies to a loan as of a specified date?
  - id: cq14
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq15
    text: "What is a variable-rate loan's reset schedule?"
  - id: cq16
    text: What interest rate cap applies to a variable-rate loan?
  - id: cq17
    text: "How many months until a variable-rate loan's first rate change?"
  - id: cq18
    text: "Which terms govern a loan's principal repayment?"
  - id: cq19
    text: "Which terms govern a loan's interest payments?"
  - id: cq20
    text: "Which day-count convention governs a loan's interest accrual?"
  - id: cq21
    text: What overall loan payment schedule is on file?
  - id: cq22
    text: What amortization schedule is on file for a loan?
  - id: cq23
    text: What principal-payment schedule is on file for a loan?
  - id: cq24
    text: What interest-payment schedule is on file for a loan?
  - id: cq25
    text: What interest-calculation schedule is on file for a loan?
  - id: cq26
    text: What rate-reset schedule is on file for a loan?
  - id: cq27
    text: What initial rate-setting event is on file for a loan?
  - id: cq28
    text: Is a loan marked interest-only?
  - id: cq29
    text: Does a loan allow negative amortization?
  - id: cq30
    text: Does a loan have a balloon payment?
  - id: cq31
    text: "Does a loan's repayment structure and schedule show full or partial amortization?"
  - id: cq32
    text: "What prepayment terms apply to a loan, including whether they permit prepayment?"
  - id: cq33
    text: "Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
  - id: cq34
    text: Is a loan secured?
  - id: cq35
    text: Is a secured loan classified as a guaranteed loan?
  - id: cq36
    text: Which collateral is linked to a collateral-backed loan?
  - id: cq37
    text: Which security agreement identifies the rights granted over the collateral linked to a loan?
  - id: cq38
    text: "Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?"
  - id: cq39
    text: "What is the appraised value of collateral linked to a loan, and what is its as-of date?"
  - id: cq40
    text: What is the loan-to-value ratio for a collateralized loan?
  - id: cq41
    text: "What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
  - id: cq42
    text: What payment history is recorded for a loan?
  - id: cq43
    text: "Which individual payment transactions actually made are contained in a loan's payment history?"
  - id: cq44
    text: Which sub-facilities form part of a credit facility?
  - id: cq45
    text: What amount of borrowing capacity has been assessed for the borrower?
  - id: cq46
    text: How much credit remains available under a credit facility?
  - id: cq47
    text: "Given prepayment terms supplied for review, what do they say about early repayment?"
  - id: cq48
    text: "Given prepayment terms supplied for review, is a penalty period recorded, and what is its length in months?"
classes:
  Loan:
    meaning: A debt set up and serviced under agreed terms.
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
      interestOnly:
        type: boolean
        allowed:
          - "true"
          - "false"
      allowsNegativeAmortization:
        type: boolean
        allowed:
          - "true"
          - "false"
      hasBalloonPayment:
        type: boolean
        allowed:
          - "true"
          - "false"
      interestRateCap:
        type: number
      monthsUntilFirstRateChange:
        type: number
        unit: months
  CreditFacility:
    meaning: "An arrangement under which a borrower can draw credit over time, potentially through sub-facilities."
    aliases:
      - master commitment
    properties:
      creditLimit:
        type: number
      creditExtended:
        type: number
      availableAmount:
        type: number
  Borrower:
    meaning: A party that owes repayment.
    aliases: []
    properties: {}
  Lender:
    meaning: A party that provides credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "A party that collects loan payments on the lender's behalf."
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: An agreement carrying the agreed debt amount and dates.
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  SubFacility:
    meaning: A portion of a credit facility that can be identified within it.
    aliases: []
    properties: {}
  BorrowingCapacity:
    meaning: "The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
    aliases: []
    properties:
      assessedAmount:
        type: number
  PrincipalRepaymentTerms:
    meaning: "Terms that govern payment of a loan's principal."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms that govern a loan's interest payments and identify the day-count convention for accrual."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms governing principal repayment before maturity and any applicable penalty period.
    aliases: []
    properties:
      penaltyPeriodMonths:
        type: number
        unit: months
  FixedInterestRate:
    meaning: An interest rate that is fixed rather than subject to variable-rate changes.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An interest rate that can vary, including floating benchmark-based or institution-managed rates."
    aliases: []
    properties:
      rateValue:
        type: number
  LoanPaymentSchedule:
    meaning: The overall schedule of payments due on a loan.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "The schedule showing how a loan's debt balance changes over time."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The schedule of dates on which loan principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The schedule of dates on which loan interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: The schedule of dates on which loan interest is calculated.
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates on which a variable loan rate may reset.
    aliases: []
    properties: {}
  InitialRateSettingEvent:
    meaning: "An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: The record of actual payment transactions made on a loan.
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "One actual payment transaction within a loan's payment history, rather than a scheduled payment."
    aliases: []
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement granting rights over pledged collateral.
    aliases: []
    properties: {}
  CreditEnhancementAgreement:
    meaning: An arrangement protecting a credit-enhancement beneficiary.
    aliases: []
    properties: {}
  CreditEnhancementBeneficiary:
    meaning: A party protected under a credit-enhancement agreement.
    aliases: []
    properties: {}
  CollateralValue:
    meaning: A separately identifiable appraisal of collateral carrying a value and an as-of date.
    aliases: []
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  DayCountConvention:
    meaning: The basis identified by interest payment terms for calculating interest accrual.
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: A separately identifiable ratio comparing a collateralized loan to the collateral value used.
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  CombinedLoanToValueRatio:
    meaning: "A separately identifiable ratio accounting for total debt secured by an asset rather than only this loan's principal."
    aliases: []
    properties:
      ratioValue:
        type: number
        unit: percent
  Principal:
    meaning: "Principal linked to a loan, with an outstanding amount distinct from its agreed principal amount and balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  InterestOwed:
    meaning: "Interest owed on a loan, with an outstanding amount distinct from the interest rate and loan balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the borrower owing repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the lender providing credit for the loan.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting the loan's principal and interest payments on the lender's behalf."
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: Identifies the borrower on the facility directly.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: Identifies the lender on the facility directly.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: Identifies the borrower on the credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: Identifies the lender on the credit agreement.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: Identifies a sub-facility forming part of the credit facility.
    aliases: []
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "Identifies the borrower's separately assessed capacity to repay."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: Identifies the principal obligation linked to the loan.
    aliases: []
  - name: governedByPrincipalTerms
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: Identifies the principal whose repayment these terms govern.
    aliases: []
  - name: hasInterestOwed
    from: Loan
    to: InterestOwed
    meaning: Identifies the interest owed linked to the loan.
    aliases: []
  - name: hasFixedRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applicable to the loan when its rate is fixed.
    aliases: []
  - name: hasVariableRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applicable to the loan when its rate is variable.
    aliases: []
  - name: governsInterest
    from: InterestPaymentTerms
    to: InterestOwed
    meaning: Identifies the interest obligation whose payment these terms govern.
    aliases: []
  - name: identifiesDayCountConvention
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count basis for calculating interest accrual under the interest payment terms.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies the overall payment schedule linked to the loan.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies the schedule showing how the loan balance changes.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies the principal-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies the interest-payment dates scheduled for the loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies the interest-calculation dates scheduled for the loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies the rate-reset dates scheduled for the loan.
    aliases: []
  - name: hasInitialRateSettingEvent
    from: Loan
    to: InitialRateSettingEvent
    meaning: "Identifies the event where the loan's initial rate is established, without implying it occurs on the initial exchange date."
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of payments actually made."
    aliases: []
  - name: containsPaymentTransaction
    from: PaymentHistory
    to: PaymentTransaction
    meaning: "Identifies an actual payment transaction contained in the loan's history."
    aliases: []
  - name: hasCollateral
    from: Loan
    to: Collateral
    meaning: Identifies collateral linked to a secured loan; its absence does not establish that the loan is unsecured.
    aliases: []
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValue
    meaning: Identifies a dated appraised value recorded for the collateral.
    aliases: []
  - name: identifiesSecuredCollateral
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the collateral over which the security agreement grants rights.
    aliases: []
  - name: identifiesBeneficiary
    from: CreditEnhancementAgreement
    to: CreditEnhancementBeneficiary
    meaning: Identifies the party protected by the credit-enhancement agreement.
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: Identifies the loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: Identifies the combined loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
rules:
  loanReadinessConfirmed:
    conditions:
      - Loan hasBorrower identifies a borrower.
      - Loan hasLender identifies a lender.
      - "Loan hasFixedRate or hasVariableRate identifies its applicable interest rate; if neither link exists, report \"Rate information missing; interest-bearing status cannot be determined\" and do not confirm readiness."
      - "Follow Loan hasInterestOwed to its InterestOwed obligation; use a reverse lookup for InterestPaymentTerms whose governsInterest link points to that same obligation. If none are found, do not confirm the terms check; if multiple are found, report all found rather than assuming one uniquely applies."
  collateralSupportVerified:
    conditions:
      - The Loan is supplied as already identified as secured; this model has no recorded property or path that independently establishes that classification.
      - "Loan hasCollateral identifies linked collateral; if absent, report \"Collateral support not verified by this check\" without concluding the loan is unsecured or judging any guaranty."
  variableRateSetupConfirmed:
    conditions:
      - The same Loan hasVariableRate identifies a VariableInterestRate.
      - That Loan hasInterestRateResetSchedule identifies an InterestRateResetSchedule.
      - "If either link is absent, identify the missing link and leave setup unconfirmed; a fixed-rate link, interestRateCap, or monthsUntilFirstRateChange is not a substitute."
  paymentRecordCompletenessConfirmed:
    conditions:
      - Loan hasPaymentHistory identifies a PaymentHistory.
      - That PaymentHistory containsPaymentTransaction identifies at least one PaymentTransaction.
      - "If the history exists but has no recorded entries, report \"No individual payment transactions recorded in this history\" without asserting that no payment was ever made."
  suppliedPrepaymentTimingConfirmed:
    conditions:
      - PrepaymentTerms are supplied for inspection; no recorded relationship establishes that they apply to a particular Loan.
      - "PrepaymentTerms.penaltyPeriodMonths is recorded; if absent, the penalty timing cannot be confirmed."
      - Confirmation of timing does not confirm what early repayment is permitted or that the terms apply to a particular Loan.
actions:
  confirmLoanReadiness:
    input: Loan
    preconditions:
      - loanReadinessConfirmed
    effect: "Return a readiness confirmation to the reviewer identifying the borrower, lender, applicable fixed or variable rate link, and interest obligation and terms links checked; report all terms found by reverse lookup rather than assuming one unique set of terms; do not claim a stored finding or alter Loan."
    verification: "Re-read Loan hasBorrower and hasLender, Loan hasFixedRate or hasVariableRate, and Loan hasInterestOwed; use reverse lookup for InterestPaymentTerms governsInterest pointing to that same InterestOwed obligation, and confirm the returned evidence matches the recorded links."
  confirmCollateralSupport:
    input: Loan
    preconditions:
      - collateralSupportVerified
    effect: "Return confirmation of the Loan hasCollateral link for the loan supplied as secured, with the linked collateral as evidence; do not assert a guaranty finding or stored result."
    verification: Re-read Loan hasCollateral and confirm the returned collateral matches the recorded link for that Loan.
  confirmVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupConfirmed
    effect: "Return confirmation that the same Loan hasVariableRate and hasInterestRateResetSchedule, identifying both links checked; do not claim a stored result."
    verification: Re-read Loan hasVariableRate and Loan hasInterestRateResetSchedule for that same Loan and confirm both links match the returned evidence.
  confirmPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompletenessConfirmed
    effect: "Return confirmation that Loan hasPaymentHistory and that the history containsPaymentTransaction for at least one actual transaction, identifying the links checked; do not claim a stored result."
    verification: Re-read Loan hasPaymentHistory and that PaymentHistory containsPaymentTransaction and confirm the returned evidence matches the recorded links.
  confirmSuppliedPrepaymentTiming:
    input: PrepaymentTerms
    preconditions:
      - suppliedPrepaymentTimingConfirmed
    effect: "Return confirmation of the recorded PrepaymentTerms.penaltyPeriodMonths on the supplied terms, without claiming they apply to any Loan or that the finding was stored."
    verification: Re-read PrepaymentTerms.penaltyPeriodMonths on the supplied terms and confirm it matches the returned value.


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "confirmLoanReadiness" has input class Loan, and its precondition loanReadinessConfirmed refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "confirmSuppliedPrepaymentTiming" has input class PrepaymentTerms, and its precondition suppliedPrepaymentTimingConfirmed refers to Loan, which is not connected to it at all.

### Turn 94 — assistant

I checked the live canvas first. It has **31 relationships, 25 properties, and 32 classes**. I’ll review them in that order, three to five at a time. For each relationship, please give your preferred **verb phrase and direction**, or say “as shown.” I’ll rename in place where needed, without adding or removing anything.

First five:

1. **Loan → Borrower:** `hasBorrower`
2. **Loan → Lender:** `hasLender`
3. **Loan → Servicer:** `servicedBy`
4. **Credit Facility → Borrower:** `hasBorrower`
5. **Credit Facility → Lender:** `hasLender`

What would you call each connection, and which way round would you say it?

### Turn 95 — user

I’d keep all five directions:

1. **Loan → Borrower:** the loan **has a borrower**.
2. **Loan → Lender:** the loan **has a lender**.
3. **Loan → Servicer:** the loan **is serviced by** the servicer. I’d include “is” in the phrasing; it makes clear the servicer performs the work for the loan.
4. **Credit facility → Borrower:** the facility **has a borrower**.
5. **Credit facility → Lender:** the facility **has a lender**.

### Turn 95 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "servicedBy",
      "to": "isServicedBy",
      "className": "",
      "source": "Loan",
      "target": "Servicer",
      "reverse": false
    }
  ]
}
```

### Turn 95 — tool

Renamed 1 of 1:
- relationship "servicedBy" (Loan → Servicer) → "isServicedBy" (Loan → Servicer)

### Turn 95 — assistant

I kept all five directions and renamed **Loan → Servicer** to `isServicedBy`. The other four names were already right.

For the next five, what verb phrase and direction would you use? “As shown” is fine.

1. **Credit Agreement → Borrower:** `hasBorrower`
2. **Credit Agreement → Lender:** `hasLender`
3. **Credit Facility → Sub-facility:** `hasSubFacility`
4. **Borrower → Borrowing Capacity:** `hasBorrowingCapacity`
5. **Loan → Principal:** `hasPrincipal`

### Turn 96 — user

All five are **as shown**, in the stated direction:

1. Credit agreement **has a borrower**.
2. Credit agreement **has a lender**.
3. Credit facility **has a sub-facility**.
4. Borrower **has borrowing capacity**.
5. Loan **has principal**.

### Turn 96 — assistant

Those five relationship names and directions stay as shown. So far, **one relationship has been renamed and none redirected**.

For the next five, what verb phrase and direction would you use? Please say “as shown” where the current wording is right.

1. **Principal Repayment Terms → Principal:** `governedByPrincipalTerms`
2. **Loan → Interest Owed:** `hasInterestOwed`
3. **Loan → Fixed Interest Rate:** `hasFixedRate`
4. **Loan → Variable Interest Rate:** `hasVariableRate`
5. **Interest Payment Terms → Interest Owed:** `governsInterest`

### Turn 97 — user

All five directions are right, but I’d change the wording:

1. **Principal repayment terms → Principal:** **govern payment of** the principal. “Governed by principal terms” reads the other way round.
2. **Loan → Interest owed:** **has interest**. Here, that means the interest obligation with an outstanding amount.
3. **Loan → Fixed interest rate:** **has an interest rate**—a fixed one.
4. **Loan → Variable interest rate:** **has an interest rate**—a variable one. I’d use the same connection phrase for both rate types.
5. **Interest payment terms → Interest owed:** **govern payment of** that interest.

### Turn 97 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "governedByPrincipalTerms",
      "to": "governPaymentOf",
      "className": "",
      "source": "PrincipalRepaymentTerms",
      "target": "Principal",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "hasInterestOwed",
      "to": "hasInterest",
      "className": "",
      "source": "Loan",
      "target": "InterestOwed",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "hasFixedRate",
      "to": "hasInterestRate",
      "className": "",
      "source": "Loan",
      "target": "FixedInterestRate",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "hasVariableRate",
      "to": "hasInterestRate",
      "className": "",
      "source": "Loan",
      "target": "VariableInterestRate",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "governsInterest",
      "to": "governPaymentOf",
      "className": "",
      "source": "InterestPaymentTerms",
      "target": "InterestOwed",
      "reverse": false
    }
  ]
}
```

### Turn 97 — tool

Renamed 5 of 5:
- relationship "governedByPrincipalTerms" (PrincipalRepaymentTerms → Principal) → "governPaymentOf" (PrincipalRepaymentTerms → Principal)
- relationship "hasInterestOwed" (Loan → InterestOwed) → "hasInterest" (Loan → InterestOwed)
- relationship "hasFixedRate" (Loan → FixedInterestRate) → "hasInterestRate" (Loan → FixedInterestRate)
- relationship "hasVariableRate" (Loan → VariableInterestRate) → "hasInterestRate" (Loan → VariableInterestRate)
- relationship "governsInterest" (InterestPaymentTerms → InterestOwed) → "governPaymentOf" (InterestPaymentTerms → InterestOwed)

### Turn 97 — assistant

I renamed those five connections in place, keeping their directions. Both terms-to-obligation links now use `governPaymentOf`, and both loan-to-rate links use `hasInterestRate`; their endpoint classes keep the facts distinct. **Six relationships renamed, none redirected** so far.

For the next five, what verb phrase and direction would you use? “As shown” is fine.

1. **Interest Payment Terms → Day-Count Convention:** `identifiesDayCountConvention`
2. **Loan → Loan Payment Schedule:** `hasLoanPaymentSchedule`
3. **Loan → Amortization Schedule:** `hasAmortizationSchedule`
4. **Loan → Principal Payment Schedule:** `hasPrincipalPaymentSchedule`
5. **Loan → Interest Payment Schedule:** `hasInterestPaymentSchedule`

### Turn 98 — user

The directions are right. I’d rename the connections:

1. **Interest payment terms → Day-count convention:** **has accrual basis**. That convention defines how interest accrues, rather than merely being identified by the terms.
2–5. **Loan → each of the four schedules:** **has schedule**. Keep the overall loan payment, amortization, principal payment, and interest payment schedules distinct by what each link points to, not by using a different verb for each.

### Turn 98 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "identifiesDayCountConvention",
      "to": "hasAccrualBasis",
      "className": "",
      "source": "InterestPaymentTerms",
      "target": "DayCountConvention",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "hasLoanPaymentSchedule",
      "to": "hasSchedule",
      "className": "",
      "source": "Loan",
      "target": "LoanPaymentSchedule",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "hasAmortizationSchedule",
      "to": "hasSchedule",
      "className": "",
      "source": "Loan",
      "target": "AmortizationSchedule",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "hasPrincipalPaymentSchedule",
      "to": "hasSchedule",
      "className": "",
      "source": "Loan",
      "target": "PrincipalPaymentSchedule",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "hasInterestPaymentSchedule",
      "to": "hasSchedule",
      "className": "",
      "source": "Loan",
      "target": "InterestPaymentSchedule",
      "reverse": false
    }
  ]
}
```

### Turn 98 — tool

Renamed 5 of 5:
- relationship "identifiesDayCountConvention" (InterestPaymentTerms → DayCountConvention) → "hasAccrualBasis" (InterestPaymentTerms → DayCountConvention)
- relationship "hasLoanPaymentSchedule" (Loan → LoanPaymentSchedule) → "hasSchedule" (Loan → LoanPaymentSchedule)
- relationship "hasAmortizationSchedule" (Loan → AmortizationSchedule) → "hasSchedule" (Loan → AmortizationSchedule)
- relationship "hasPrincipalPaymentSchedule" (Loan → PrincipalPaymentSchedule) → "hasSchedule" (Loan → PrincipalPaymentSchedule)
- relationship "hasInterestPaymentSchedule" (Loan → InterestPaymentSchedule) → "hasSchedule" (Loan → InterestPaymentSchedule)

### Turn 98 — assistant

I renamed those five connections in place. The four schedules remain distinct by their target classes, even though the links share `hasSchedule`. **Eleven relationships renamed, none redirected** so far.

For the next five, what verb phrase and direction would you use? “As shown” is fine.

1. **Loan → Interest Calculation Schedule:** `hasInterestCalculationSchedule`
2. **Loan → Interest Rate Reset Schedule:** `hasInterestRateResetSchedule`
3. **Loan → Initial Rate-Setting Event:** `hasInitialRateSettingEvent`
4. **Loan → Payment History:** `hasPaymentHistory`
5. **Payment History → Payment Transaction:** `containsPaymentTransaction`

### Turn 99 — user

All five directions are right. I’d use:

1. **Loan → Interest calculation schedule:** **has schedule**.
2. **Loan → Interest rate reset schedule:** **has schedule**.
3. **Loan → initial rate-setting event:** **has schedule** in this set of connections, though the target is an event, not a payment schedule.
4. **Loan → Payment history:** **as shown**—has payment history.
5. **Payment history → Payment transaction:** **has an individual payment**. That emphasizes that each transaction is an actual payment recorded in the history.

### Turn 99 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "hasInterestCalculationSchedule",
      "to": "hasSchedule",
      "className": "",
      "source": "Loan",
      "target": "InterestCalculationSchedule",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "hasInterestRateResetSchedule",
      "to": "hasSchedule",
      "className": "",
      "source": "Loan",
      "target": "InterestRateResetSchedule",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "containsPaymentTransaction",
      "to": "hasIndividualPayment",
      "className": "",
      "source": "PaymentHistory",
      "target": "PaymentTransaction",
      "reverse": false
    }
  ]
}
```

### Turn 99 — tool

Renamed 3 of 3:
- relationship "hasInterestCalculationSchedule" (Loan → InterestCalculationSchedule) → "hasSchedule" (Loan → InterestCalculationSchedule)
- relationship "hasInterestRateResetSchedule" (Loan → InterestRateResetSchedule) → "hasSchedule" (Loan → InterestRateResetSchedule)
- relationship "containsPaymentTransaction" (PaymentHistory → PaymentTransaction) → "hasIndividualPayment" (PaymentHistory → PaymentTransaction)

### Turn 99 — assistant

I renamed the two remaining schedule links to `hasSchedule` and the history-to-transaction link to `hasIndividualPayment`. I left `hasPaymentHistory` unchanged.

One wording needs clarification before I rename it: **Loan → Initial Rate-Setting Event** points to an event, while `hasSchedule` has so far meant a link to a schedule. Do you use **“has schedule”** for the event record itself, or did you mean the loan **has a rate-setting event**? The direction will stay Loan → Initial Rate-Setting Event either way.

### Turn 100 — user

I do mean **“has schedule”** for that recorded connection, even though it points to a rate-setting **event**, not a schedule record. Keep the direction from the loan to the event. “Has a rate-setting event” is a clearer description in conversation, but I wouldn’t use it to rename this particular connection.

### Turn 100 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "hasInitialRateSettingEvent",
      "to": "hasSchedule",
      "className": "",
      "source": "Loan",
      "target": "InitialRateSettingEvent",
      "reverse": false
    }
  ]
}
```

### Turn 100 — tool

Renamed 1 of 1:
- relationship "hasInitialRateSettingEvent" (Loan → InitialRateSettingEvent) → "hasSchedule" (Loan → InitialRateSettingEvent)

### Turn 100 — assistant

I renamed **Loan → Initial Rate-Setting Event** to `hasSchedule` as you specified, despite the event target. Its direction and event meaning remain unchanged. **Fifteen relationships renamed, none redirected** so far.

For the next four connections, what verb phrase and direction would you use? “As shown” is fine.

1. **Loan → Collateral:** `hasCollateral`
2. **Collateral → Collateral Value:** `hasCollateralValue`
3. **Security Agreement → Collateral:** `identifiesSecuredCollateral`
4. **Credit-Enhancement Agreement → Credit-Enhancement Beneficiary:** `identifiesBeneficiary`

### Turn 101 — user

Keep the directions, but I’d phrase the links this way:

1. **Secured loan → Collateral:** **is collateralized by** the collateral. This link applies to a secured loan, not indiscriminately to every loan.
2. **Collateral → Collateral value:** **has collateral value**—the separately recorded, dated appraisal.
3. **Security agreement → Collateral:** **secures** the collateral.
4. **Credit-enhancement agreement → Beneficiary:** **has a beneficiary**.

### Turn 101 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "hasCollateral",
      "to": "isCollateralizedBy",
      "className": "",
      "source": "Loan",
      "target": "Collateral",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "identifiesSecuredCollateral",
      "to": "secures",
      "className": "",
      "source": "SecurityAgreement",
      "target": "Collateral",
      "reverse": false
    },
    {
      "kind": "relationship",
      "from": "identifiesBeneficiary",
      "to": "hasBeneficiary",
      "className": "",
      "source": "CreditEnhancementAgreement",
      "target": "CreditEnhancementBeneficiary",
      "reverse": false
    }
  ]
}
```

### Turn 101 — tool

Renamed 3 of 3:
- relationship "hasCollateral" (Loan → Collateral) → "isCollateralizedBy" (Loan → Collateral)
- relationship "identifiesSecuredCollateral" (SecurityAgreement → Collateral) → "secures" (SecurityAgreement → Collateral)
- relationship "identifiesBeneficiary" (CreditEnhancementAgreement → CreditEnhancementBeneficiary) → "hasBeneficiary" (CreditEnhancementAgreement → CreditEnhancementBeneficiary)

### Turn 101 — assistant

I kept all four directions. I renamed three links to `isCollateralizedBy`, `secures`, and `hasBeneficiary`; **Collateral → Collateral Value** remains `hasCollateralValue`. That brings the count to **18 relationships renamed, none redirected**.

The last two relationships are:

1. **Loan → Loan-to-Value Ratio:** `hasLoanToValueRatio`
2. **Loan → Combined Loan-to-Value Ratio:** `hasCombinedLoanToValueRatio`

What verb phrase would you use for each, and would you keep those directions?

### Turn 102 — user

Keep both directions **from the collateralized loan to the ratio**. The wording is **as shown**: it **has a loan-to-value ratio** and **has a combined loan-to-value ratio**. They remain separate measures.

### Turn 102 — assistant

Both ratio links stay as shown and remain separate. The relationship review is complete: **18 renamed, 0 redirected**. No relationships were added or removed.

Now for properties. Are these five **Loan** property names what you call them, or would you use another term for any of them? Please give a replacement only where needed:

1. `principalAmount` — agreed principal amount
2. `loanBalance` — current loan balance
3. `initialExchangeDate` — initial funding exchange date
4. `maturityDate` — maturity date
5. `interestOnly` — interest-only indicator

### Turn 103 — user

All five names are **as shown**. One qualification: `loanBalance` names the recorded loan balance; “current” depends on how up to date that figure is. I wouldn’t add an as-of date that we haven’t established.

### Turn 103 — assistant

I’ll keep those five names. `loanBalance` means the recorded balance; without an established as-of date, the model cannot assert how current it is. **No properties renamed** so far.

For the next five property names, would you use the names shown or your own terms?

1. **Loan:** `allowsNegativeAmortization`
2. **Loan:** `hasBalloonPayment`
3. **Loan:** `interestRateCap`
4. **Loan:** `monthsUntilFirstRateChange`
5. **Credit Facility:** `creditLimit`

### Turn 104 — user

I’d keep **interest rate cap** and **credit limit** as shown. I’d adjust the other three:

1. **Negative amortization** — a yes/no indicator; “allows” adds an interpretation to the field name.
2. **Balloon payment** — also a yes/no indicator; “has” is unnecessary in the property name.
3. **First rate change term, in months** — this names the recorded term, rather than calculating “months until” a change from today.

### Turn 104 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "allowsNegativeAmortization",
      "to": "negativeAmortization",
      "className": "Loan",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "hasBalloonPayment",
      "to": "balloonPayment",
      "className": "Loan",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "monthsUntilFirstRateChange",
      "to": "firstRateChangeTermMonths",
      "className": "Loan",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 104 — tool

Renamed 3 of 3:
- property "Loan.allowsNegativeAmortization" → "negativeAmortization"
- property "Loan.hasBalloonPayment" → "balloonPayment"
- property "Loan.monthsUntilFirstRateChange" → "firstRateChangeTermMonths"

### Turn 104 — assistant

I’ve renamed the three Loan properties to `negativeAmortization`, `balloonPayment`, and `firstRateChangeTermMonths`. I left `interestRateCap` and `creditLimit` unchanged. **Three properties renamed** so far.

For the next five, are these your terms, or would you name any differently?

1. **Credit Facility:** `creditExtended`
2. **Credit Facility:** `availableAmount`
3. **Credit Agreement:** `debtAmount`
4. **Credit Agreement:** `initialExchangeDate`
5. **Credit Agreement:** `maturityDate`

### Turn 105 — user

I’d rename **credit extended** to **amount of credit extended**; it makes clear we mean the recorded amount, not an action or status. The other four names are as shown.

### Turn 105 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "creditExtended",
      "to": "amountOfCreditExtended",
      "className": "CreditFacility",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 105 — tool

Renamed 1 of 1:
- property "CreditFacility.creditExtended" → "amountOfCreditExtended"

### Turn 105 — assistant

I renamed **Credit Facility.`creditExtended`** to `amountOfCreditExtended`; the other four names stay as shown. **Four properties renamed** so far.

For the next five properties, are these the names you use, or would you name any differently?

1. **Borrowing Capacity:** `assessedAmount`
2. **Prepayment Terms:** `penaltyPeriodMonths`
3. **Fixed Interest Rate:** `rateValue`
4. **Variable Interest Rate:** `rateValue`
5. **Collateral Value:** `appraisedValue`

### Turn 106 — user

I’d name all five a little differently:

1. **Borrowing capacity:** **amount**. It’s the assessed capacity; “assessed” doesn’t need to be repeated in the field name.
2. **Prepayment terms:** **prepayment penalty term in months**. That identifies the recorded duration more precisely than “penalty period.”
3. **Fixed interest rate:** **rate**.
4. **Variable interest rate:** **rate**. Use the same property name on both rate types.
5. **Dated collateral value:** **value**. The record already establishes that this is an appraised collateral value, paired with its as-of date.

### Turn 106 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "assessedAmount",
      "to": "amount",
      "className": "BorrowingCapacity",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "penaltyPeriodMonths",
      "to": "prepaymentPenaltyTermMonths",
      "className": "PrepaymentTerms",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "rateValue",
      "to": "rate",
      "className": "FixedInterestRate",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "rateValue",
      "to": "rate",
      "className": "VariableInterestRate",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "appraisedValue",
      "to": "value",
      "className": "CollateralValue",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 106 — tool

Renamed 5 of 5:
- property "BorrowingCapacity.assessedAmount" → "amount"
- property "PrepaymentTerms.penaltyPeriodMonths" → "prepaymentPenaltyTermMonths"
- property "FixedInterestRate.rateValue" → "rate"
- property "VariableInterestRate.rateValue" → "rate"
- property "CollateralValue.appraisedValue" → "value"

### Turn 106 — assistant

I’ve renamed all five properties as requested, including `rate` on both rate types. That brings the property count to **nine renamed** so far.

These are the last five properties. Are their names right, or would you use a different term for any of them?

1. **Collateral Value:** `asOfDate`
2. **Loan-to-Value Ratio:** `ratioValue`
3. **Combined Loan-to-Value Ratio:** `ratioValue`
4. **Principal:** `outstandingAmount`
5. **Interest Owed:** `outstandingAmount`

### Turn 107 — user

I’d keep **as-of date** and **outstanding amount** as shown. For both ratio records, I’d use simply **ratio** rather than “ratio value.” The two records stay distinct because one measures this loan against the collateral value and the other measures total debt secured by it.

### Turn 107 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "ratioValue",
      "to": "ratio",
      "className": "LoanToValueRatio",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "ratioValue",
      "to": "ratio",
      "className": "CombinedLoanToValueRatio",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 107 — tool

Renamed 2 of 2:
- property "LoanToValueRatio.ratioValue" → "ratio"
- property "CombinedLoanToValueRatio.ratioValue" → "ratio"

### Turn 107 — assistant

I’ve renamed `ratioValue` to `ratio` on both ratio classes. `asOfDate` and both `outstandingAmount` properties stay as shown. The property review is complete: **11 properties renamed**.

Now for class names. Are these what you call the concepts, or do you use a different term for any of them? Please give only replacements that mean the **same thing**:

1. Loan
2. Credit Facility
3. Borrower
4. Lender
5. Servicer

### Turn 108 — user

All five names are as shown. **Master commitment** can also mean a credit facility, as we established, but it doesn’t replace the preferred name here.

### Turn 108 — assistant

Those five class names stay as shown. **Master commitment** remains an alias for Credit Facility, not its preferred name. No classes have been renamed so far.

For the next five classes, is each name what you use, or do you have a different term for the **same** concept?

1. Credit Agreement
2. Sub-facility
3. Borrowing Capacity
4. Principal Repayment Terms
5. Interest Payment Terms

### Turn 109 — user

All five are as shown. I’d keep principal repayment terms and interest payment terms distinct; neither is another name for the other.

### Turn 109 — assistant

Those five class names stay as shown, with Principal Repayment Terms and Interest Payment Terms distinct. **No class renames** so far.

For the next five, is each name right, or do you use a different term for the **same** concept?

1. Prepayment Terms
2. Fixed Interest Rate
3. Variable Interest Rate
4. Loan Payment Schedule
5. Amortization Schedule

### Turn 110 — user

All five are as shown. None needs a replacement.

### Turn 110 — assistant

Those five class names stay as shown. **No classes have been renamed** so far.

For the next five, are these the names you use, or would you use a different term for the **same** concept?

1. Principal Payment Schedule
2. Interest Payment Schedule
3. Interest Calculation Schedule
4. Interest Rate Reset Schedule
5. Initial Rate-Setting Event

### Turn 111 — user

The first four are as shown. I’d name the fifth a little less narrowly: it’s the **rate-setting event** at which the loan’s initial rate is established. “Initial” describes what happens there, but the name shouldn’t imply that the event coincides with initial funding.

### Turn 111 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "InitialRateSettingEvent",
      "to": "RateSettingEvent",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 111 — tool

Renamed 1 of 1:
- class "InitialRateSettingEvent" → "RateSettingEvent" (previous name kept as an alias)

### Turn 111 — assistant

I’ve renamed **Initial Rate-Setting Event** to **Rate-Setting Event** in place. The former name remains an alias; the class still means the event where the loan’s initial rate is established, not necessarily at initial funding. The other four names stay as shown. **One class renamed** so far.

For the next five classes, are these the names you use, or would you use a different term for the **same** concept?

1. Payment History
2. Payment Transaction
3. Collateral
4. Security Agreement
5. Credit-Enhancement Agreement

### Turn 112 — user

**Payment history, collateral, security agreement,** and **credit-enhancement agreement** are as shown. I’d call the second an **individual payment transaction**, to make clear it’s one actual payment within the history, not the history as a whole.

### Turn 112 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "PaymentTransaction",
      "to": "IndividualPaymentTransaction",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 112 — tool

Renamed 1 of 1:
- class "PaymentTransaction" → "IndividualPaymentTransaction" (previous name kept as an alias)

### Turn 112 — assistant

I’ve renamed **Payment Transaction** to **Individual Payment Transaction** in place. Its prior name remains an alias; the other four names stay as shown. **Two classes renamed** so far.

For the next five, is each name right, or would you use another term for the **same** concept?

1. Credit-Enhancement Beneficiary
2. Collateral Value
3. Day-Count Convention
4. Loan-to-Value Ratio
5. Combined Loan-to-Value Ratio

### Turn 113 — user

Four are as shown: **credit-enhancement beneficiary**, **day-count convention**, **loan-to-value ratio**, and **combined loan-to-value ratio**.

I’d call **collateral value** a **collateral value as of a date**. That makes clear it’s a particular appraised value paired with its as-of date, not an undated value held directly on the collateral.

### Turn 113 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "CollateralValue",
      "to": "CollateralValueAsOfDate",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 113 — tool

Renamed 1 of 1:
- class "CollateralValue" → "CollateralValueAsOfDate" (previous name kept as an alias)

### Turn 113 — assistant

I’ve renamed **Collateral Value** to **Collateral Value as of a Date** in place. Its previous name remains an alias; the other four names stay as shown. **Three classes renamed** so far.

The final two class names are **Principal** and **Interest Owed**. Are those the terms you use, or would you use a different term for either same concept?

### Turn 114 — user

**Principal** is as shown. I’d call the other concept **interest** rather than “interest owed.” Its outstanding amount tells us what remains owed; the concept itself is the loan’s interest obligation, distinct from the interest rate.

### Turn 114 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "InterestOwed",
      "to": "Interest",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 114 — tool

Renamed 1 of 1:
- class "InterestOwed" → "Interest" (previous name kept as an alias)

### Turn 114 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 114 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan or credit facility?
  - id: cq2
    text: Who is the lender on a loan or credit facility?
  - id: cq3
    text: "Which servicer collects a loan's principal and interest payments on the lender's behalf?"
  - id: cq4
    text: "What is a loan's agreed principal amount?"
  - id: cq5
    text: What is the debt amount agreed in a credit agreement?
  - id: cq6
    text: "What is a loan's current balance?"
  - id: cq7
    text: "What is a loan's outstanding principal?"
  - id: cq8
    text: "What is a loan's outstanding interest?"
  - id: cq9
    text: "What is a credit facility's credit limit?"
  - id: cq10
    text: How much credit has been extended under a credit facility?
  - id: cq11
    text: "When is a loan's initial exchange date?"
  - id: cq12
    text: When does a loan mature?
  - id: cq13
    text: Which interest rate applies to a loan as of a specified date?
  - id: cq14
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq15
    text: "What is a variable-rate loan's reset schedule?"
  - id: cq16
    text: What interest rate cap applies to a variable-rate loan?
  - id: cq17
    text: "How many months until a variable-rate loan's first rate change?"
  - id: cq18
    text: "Which terms govern a loan's principal repayment?"
  - id: cq19
    text: "Which terms govern a loan's interest payments?"
  - id: cq20
    text: "Which day-count convention governs a loan's interest accrual?"
  - id: cq21
    text: What overall loan payment schedule is on file?
  - id: cq22
    text: What amortization schedule is on file for a loan?
  - id: cq23
    text: What principal-payment schedule is on file for a loan?
  - id: cq24
    text: What interest-payment schedule is on file for a loan?
  - id: cq25
    text: What interest-calculation schedule is on file for a loan?
  - id: cq26
    text: What rate-reset schedule is on file for a loan?
  - id: cq27
    text: What initial rate-setting event is on file for a loan?
  - id: cq28
    text: Is a loan marked interest-only?
  - id: cq29
    text: Does a loan allow negative amortization?
  - id: cq30
    text: Does a loan have a balloon payment?
  - id: cq31
    text: "Does a loan's repayment structure and schedule show full or partial amortization?"
  - id: cq32
    text: "What prepayment terms apply to a loan, including whether they permit prepayment?"
  - id: cq33
    text: "Is a prepayment-penalty period recorded for a loan, and how many months does it last?"
  - id: cq34
    text: Is a loan secured?
  - id: cq35
    text: Is a secured loan classified as a guaranteed loan?
  - id: cq36
    text: Which collateral is linked to a collateral-backed loan?
  - id: cq37
    text: Which security agreement identifies the rights granted over the collateral linked to a loan?
  - id: cq38
    text: "Who is protected as a credit-enhancement beneficiary under a loan's credit-enhancement agreement?"
  - id: cq39
    text: "What is the appraised value of collateral linked to a loan, and what is its as-of date?"
  - id: cq40
    text: What is the loan-to-value ratio for a collateralized loan?
  - id: cq41
    text: "What is the combined loan-to-value ratio, accounting for total debt secured by the asset, for a collateralized loan?"
  - id: cq42
    text: What payment history is recorded for a loan?
  - id: cq43
    text: "Which individual payment transactions actually made are contained in a loan's payment history?"
  - id: cq44
    text: Which sub-facilities form part of a credit facility?
  - id: cq45
    text: What amount of borrowing capacity has been assessed for the borrower?
  - id: cq46
    text: How much credit remains available under a credit facility?
  - id: cq47
    text: "Given prepayment terms supplied for review, what do they say about early repayment?"
  - id: cq48
    text: "Given prepayment terms supplied for review, is a penalty period recorded, and what is its length in months?"
classes:
  Loan:
    meaning: A debt set up and serviced under agreed terms.
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
      interestOnly:
        type: boolean
        allowed:
          - "true"
          - "false"
      negativeAmortization:
        type: boolean
        allowed:
          - "true"
          - "false"
      balloonPayment:
        type: boolean
        allowed:
          - "true"
          - "false"
      interestRateCap:
        type: number
      firstRateChangeTermMonths:
        type: number
        unit: months
  CreditFacility:
    meaning: "An arrangement under which a borrower can draw credit over time, potentially through sub-facilities."
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
    meaning: A party that owes repayment.
    aliases: []
    properties: {}
  Lender:
    meaning: A party that provides credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "A party that collects loan payments on the lender's behalf."
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: An agreement carrying the agreed debt amount and dates.
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  SubFacility:
    meaning: A portion of a credit facility that can be identified within it.
    aliases: []
    properties: {}
  BorrowingCapacity:
    meaning: "The borrower's assessed upper bound on what the lender believes they can repay at a point in time."
    aliases: []
    properties:
      amount:
        type: number
  PrincipalRepaymentTerms:
    meaning: "Terms that govern payment of a loan's principal."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "Terms that govern a loan's interest payments and identify the day-count convention for accrual."
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: Terms governing principal repayment before maturity and any applicable penalty period.
    aliases: []
    properties:
      prepaymentPenaltyTermMonths:
        type: number
        unit: months
  FixedInterestRate:
    meaning: An interest rate that is fixed rather than subject to variable-rate changes.
    aliases: []
    properties:
      rate:
        type: number
  VariableInterestRate:
    meaning: "An interest rate that can vary, including floating benchmark-based or institution-managed rates."
    aliases: []
    properties:
      rate:
        type: number
  LoanPaymentSchedule:
    meaning: The overall schedule of payments due on a loan.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "The schedule showing how a loan's debt balance changes over time."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The schedule of dates on which loan principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The schedule of dates on which loan interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: The schedule of dates on which loan interest is calculated.
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates on which a variable loan rate may reset.
    aliases: []
    properties: {}
  RateSettingEvent:
    meaning: "An event at which a loan's initial interest rate is established, not necessarily on its initial exchange date."
    aliases:
      - InitialRateSettingEvent
    properties: {}
  PaymentHistory:
    meaning: The record of actual payment transactions made on a loan.
    aliases: []
    properties: {}
  IndividualPaymentTransaction:
    meaning: "One actual payment transaction within a loan's payment history, rather than a scheduled payment."
    aliases:
      - PaymentTransaction
    properties: {}
  Collateral:
    meaning: An asset pledged to support a loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement granting rights over pledged collateral.
    aliases: []
    properties: {}
  CreditEnhancementAgreement:
    meaning: An arrangement protecting a credit-enhancement beneficiary.
    aliases: []
    properties: {}
  CreditEnhancementBeneficiary:
    meaning: A party protected under a credit-enhancement agreement.
    aliases: []
    properties: {}
  CollateralValueAsOfDate:
    meaning: A separately identifiable appraisal of collateral carrying a value and an as-of date.
    aliases:
      - CollateralValue
    properties:
      value:
        type: number
      asOfDate:
        type: date
  DayCountConvention:
    meaning: The basis identified by interest payment terms for calculating interest accrual.
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: A separately identifiable ratio comparing a collateralized loan to the collateral value used.
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  CombinedLoanToValueRatio:
    meaning: "A separately identifiable ratio accounting for total debt secured by an asset rather than only this loan's principal."
    aliases: []
    properties:
      ratio:
        type: number
        unit: percent
  Principal:
    meaning: "Principal linked to a loan, with an outstanding amount distinct from its agreed principal amount and balance."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  Interest:
    meaning: "Interest owed on a loan, with an outstanding amount distinct from the interest rate and loan balance."
    aliases:
      - InterestOwed
    properties:
      outstandingAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the borrower owing repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the lender providing credit for the loan.
    aliases: []
  - name: isServicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting the loan's principal and interest payments on the lender's behalf."
    aliases:
      - servicedBy
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: Identifies the borrower on the facility directly.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: Identifies the lender on the facility directly.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: Identifies the borrower on the credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: Identifies the lender on the credit agreement.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: Identifies a sub-facility forming part of the credit facility.
    aliases: []
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: "Identifies the borrower's separately assessed capacity to repay."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: Identifies the principal obligation linked to the loan.
    aliases: []
  - name: governPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: Identifies the principal whose repayment these terms govern.
    aliases:
      - governedByPrincipalTerms
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: Identifies the interest owed linked to the loan.
    aliases:
      - hasInterestOwed
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applicable to the loan when its rate is fixed.
    aliases:
      - hasFixedRate
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applicable to the loan when its rate is variable.
    aliases:
      - hasVariableRate
  - name: governPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: Identifies the interest obligation whose payment these terms govern.
    aliases:
      - governsInterest
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count basis for calculating interest accrual under the interest payment terms.
    aliases:
      - identifiesDayCountConvention
  - name: hasSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies the overall payment schedule linked to the loan.
    aliases:
      - hasLoanPaymentSchedule
  - name: hasSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies the schedule showing how the loan balance changes.
    aliases:
      - hasAmortizationSchedule
  - name: hasSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies the principal-payment dates scheduled for the loan.
    aliases:
      - hasPrincipalPaymentSchedule
  - name: hasSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies the interest-payment dates scheduled for the loan.
    aliases:
      - hasInterestPaymentSchedule
  - name: hasSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies the interest-calculation dates scheduled for the loan.
    aliases:
      - hasInterestCalculationSchedule
  - name: hasSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies the rate-reset dates scheduled for the loan.
    aliases:
      - hasInterestRateResetSchedule
  - name: hasSchedule
    from: Loan
    to: RateSettingEvent
    meaning: "Identifies the event where the loan's initial rate is established, without implying it occurs on the initial exchange date."
    aliases:
      - hasInitialRateSettingEvent
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of payments actually made."
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: IndividualPaymentTransaction
    meaning: "Identifies an actual payment transaction contained in the loan's history."
    aliases:
      - containsPaymentTransaction
  - name: isCollateralizedBy
    from: Loan
    to: Collateral
    meaning: Identifies collateral linked to a secured loan; its absence does not establish that the loan is unsecured.
    aliases:
      - hasCollateral
  - name: hasCollateralValue
    from: Collateral
    to: CollateralValueAsOfDate
    meaning: Identifies a dated appraised value recorded for the collateral.
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the collateral over which the security agreement grants rights.
    aliases:
      - identifiesSecuredCollateral
  - name: hasBeneficiary
    from: CreditEnhancementAgreement
    to: CreditEnhancementBeneficiary
    meaning: Identifies the party protected by the credit-enhancement agreement.
    aliases:
      - identifiesBeneficiary
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: Identifies the loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: Identifies the combined loan-to-value ratio separately recorded for a collateralized loan.
    aliases: []
rules:
  loanReadinessConfirmed:
    conditions:
      - Loan hasBorrower identifies a borrower.
      - Loan hasLender identifies a lender.
      - "Loan hasFixedRate or hasVariableRate identifies its applicable interest rate; if neither link exists, report \"Rate information missing; interest-bearing status cannot be determined\" and do not confirm readiness."
      - "Follow Loan hasInterestOwed to its InterestOwed obligation; use a reverse lookup for InterestPaymentTerms whose governsInterest link points to that same obligation. If none are found, do not confirm the terms check; if multiple are found, report all found rather than assuming one uniquely applies."
  collateralSupportVerified:
    conditions:
      - The Loan is supplied as already identified as secured; this model has no recorded property or path that independently establishes that classification.
      - "Loan hasCollateral identifies linked collateral; if absent, report \"Collateral support not verified by this check\" without concluding the loan is unsecured or judging any guaranty."
  variableRateSetupConfirmed:
    conditions:
      - The same Loan hasVariableRate identifies a VariableInterestRate.
      - That Loan hasInterestRateResetSchedule identifies an InterestRateResetSchedule.
      - "If either link is absent, identify the missing link and leave setup unconfirmed; a fixed-rate link, interestRateCap, or monthsUntilFirstRateChange is not a substitute."
  paymentRecordCompletenessConfirmed:
    conditions:
      - Loan hasPaymentHistory identifies a PaymentHistory.
      - That PaymentHistory containsPaymentTransaction identifies at least one PaymentTransaction.
      - "If the history exists but has no recorded entries, report \"No individual payment transactions recorded in this history\" without asserting that no payment was ever made."
  suppliedPrepaymentTimingConfirmed:
    conditions:
      - PrepaymentTerms are supplied for inspection; no recorded relationship establishes that they apply to a particular Loan.
      - "PrepaymentTerms.penaltyPeriodMonths is recorded; if absent, the penalty timing cannot be confirmed."
      - Confirmation of timing does not confirm what early repayment is permitted or that the terms apply to a particular Loan.
actions:
  confirmLoanReadiness:
    input: Loan
    preconditions:
      - loanReadinessConfirmed
    effect: "Return a readiness confirmation to the reviewer identifying the borrower, lender, applicable fixed or variable rate link, and interest obligation and terms links checked; report all terms found by reverse lookup rather than assuming one unique set of terms; do not claim a stored finding or alter Loan."
    verification: "Re-read Loan hasBorrower and hasLender, Loan hasFixedRate or hasVariableRate, and Loan hasInterestOwed; use reverse lookup for InterestPaymentTerms governsInterest pointing to that same InterestOwed obligation, and confirm the returned evidence matches the recorded links."
  confirmCollateralSupport:
    input: Loan
    preconditions:
      - collateralSupportVerified
    effect: "Return confirmation of the Loan hasCollateral link for the loan supplied as secured, with the linked collateral as evidence; do not assert a guaranty finding or stored result."
    verification: Re-read Loan hasCollateral and confirm the returned collateral matches the recorded link for that Loan.
  confirmVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupConfirmed
    effect: "Return confirmation that the same Loan hasVariableRate and hasInterestRateResetSchedule, identifying both links checked; do not claim a stored result."
    verification: Re-read Loan hasVariableRate and Loan hasInterestRateResetSchedule for that same Loan and confirm both links match the returned evidence.
  confirmPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompletenessConfirmed
    effect: "Return confirmation that Loan hasPaymentHistory and that the history containsPaymentTransaction for at least one actual transaction, identifying the links checked; do not claim a stored result."
    verification: Re-read Loan hasPaymentHistory and that PaymentHistory containsPaymentTransaction and confirm the returned evidence matches the recorded links.
  confirmSuppliedPrepaymentTiming:
    input: PrepaymentTerms
    preconditions:
      - suppliedPrepaymentTimingConfirmed
    effect: "Return confirmation of the recorded PrepaymentTerms.penaltyPeriodMonths on the supplied terms, without claiming they apply to any Loan or that the finding was stored."
    verification: Re-read PrepaymentTerms.penaltyPeriodMonths on the supplied terms and confirm it matches the returned value.


# CONSISTENCY CHECK — 26 outstanding problem(s) in the whole model:
#   [warning] unknown-property-reference — Rule "collateralSupportVerified" (condition 2) refers to "hasCollateral", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmCollateralSupport" (effect) refers to "hasCollateral", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmCollateralSupport" (verification) refers to "hasCollateral", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmLoanReadiness" (verification) refers to "governsInterest", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmLoanReadiness" (verification) refers to "hasFixedRate", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmLoanReadiness" (verification) refers to "hasInterestOwed", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmLoanReadiness" (verification) refers to "hasVariableRate", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmPaymentRecordCompleteness" (effect) refers to "containsPaymentTransaction", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmPaymentRecordCompleteness" (verification) refers to "containsPaymentTransaction", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmSuppliedPrepaymentTiming" (effect) refers to "penaltyPeriodMonths", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmSuppliedPrepaymentTiming" (verification) refers to "penaltyPeriodMonths", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmVariableRateSetup" (effect) refers to "hasInterestRateResetSchedule", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmVariableRateSetup" (effect) refers to "hasVariableRate", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmVariableRateSetup" (verification) refers to "hasInterestRateResetSchedule", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "confirmVariableRateSetup" (verification) refers to "hasVariableRate", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "loanReadinessConfirmed" (condition 3) refers to "hasFixedRate", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "loanReadinessConfirmed" (condition 3) refers to "hasVariableRate", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "loanReadinessConfirmed" (condition 4) refers to "governsInterest", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "loanReadinessConfirmed" (condition 4) refers to "hasInterestOwed", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "paymentRecordCompletenessConfirmed" (condition 2) refers to "containsPaymentTransaction", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "suppliedPrepaymentTimingConfirmed" (condition 2) refers to "penaltyPeriodMonths", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "variableRateSetupConfirmed" (condition 1) refers to "hasVariableRate", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "variableRateSetupConfirmed" (condition 2) refers to "hasInterestRateResetSchedule", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "variableRateSetupConfirmed" (condition 3) refers to "monthsUntilFirstRateChange", which is not a property, relationship, class, rule or action in this model.
#   [warning] unreachable-from-action-input — Action "confirmLoanReadiness" has input class Loan, and its precondition loanReadinessConfirmed refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   …and 1 more.

### Turn 114 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  loanReadinessConfirmed:\n    conditions:\n      - Loan hasBorrower identifies a borrower.\n      - Loan hasLender identifies a lender.\n      - Loan hasInterestRate to FixedInterestRate or VariableInterestRate identifies its applicable interest rate; if neither link exists, report \"Rate information missing; interest-bearing status cannot be determined\" and do not confirm readiness.\n      - Follow Loan hasInterest to its Interest obligation; use a reverse lookup for InterestPaymentTerms whose governPaymentOf link points to that same obligation. If none are found, do not confirm the terms check; if multiple are found, report all found rather than assuming one uniquely applies.\n  collateralSupportVerified:\n    conditions:\n      - The Loan is supplied as already identified as secured; this model has no recorded property or path that independently establishes that classification.\n      - Loan isCollateralizedBy identifies linked collateral; if absent, report \"Collateral support not verified by this check\" without concluding the loan is unsecured or judging any guaranty.\n  variableRateSetupConfirmed:\n    conditions:\n      - The same Loan hasInterestRate to VariableInterestRate identifies its variable rate.\n      - That Loan hasSchedule to InterestRateResetSchedule identifies its rate-reset schedule.\n      - If either link is absent, identify the missing link and leave setup unconfirmed; a Loan hasInterestRate to FixedInterestRate link, interestRateCap, or firstRateChangeTermMonths is not a substitute.\n  paymentRecordCompletenessConfirmed:\n    conditions:\n      - Loan hasPaymentHistory identifies a PaymentHistory.\n      - That PaymentHistory hasIndividualPayment identifies at least one IndividualPaymentTransaction.\n      - If the history exists but has no recorded entries, report \"No individual payment transactions recorded in this history\" without asserting that no payment was ever made.\n  suppliedPrepaymentTimingConfirmed:\n    conditions:\n      - PrepaymentTerms are supplied for inspection; no recorded relationship establishes that they apply to a particular Loan.\n      - PrepaymentTerms.prepaymentPenaltyTermMonths is recorded; if absent, the penalty timing cannot be confirmed.\n      - Confirmation of timing does not confirm what early repayment is permitted or that the terms apply to a particular Loan.\nactions:\n  confirmLoanReadiness:\n    input: Loan\n    preconditions: [loanReadinessConfirmed]\n    effect: Return a readiness confirmation to the reviewer identifying the borrower, lender, Loan hasInterestRate to FixedInterestRate or VariableInterestRate, and Loan hasInterest and InterestPaymentTerms governPaymentOf links checked; report all terms found by reverse lookup rather than assuming one unique set of terms; do not claim a stored finding or alter Loan.\n    verification: Re-read Loan hasBorrower and hasLender, Loan hasInterestRate to FixedInterestRate or VariableInterestRate, and Loan hasInterest to Interest; use reverse lookup for InterestPaymentTerms governPaymentOf pointing to that same Interest obligation, and confirm the returned evidence matches the recorded links.\n  confirmCollateralSupport:\n    input: Loan\n    preconditions: [collateralSupportVerified]\n    effect: Return confirmation of the Loan isCollateralizedBy link for the loan supplied as secured, with the linked collateral as evidence; do not assert a guaranty finding or stored result.\n    verification: Re-read Loan isCollateralizedBy and confirm the returned collateral matches the recorded link for that Loan.\n  confirmVariableRateSetup:\n    input: Loan\n    preconditions: [variableRateSetupConfirmed]\n    effect: Return confirmation that the same Loan hasInterestRate to VariableInterestRate and hasSchedule to InterestRateResetSchedule, identifying both links checked; do not claim a stored result.\n    verification: Re-read Loan hasInterestRate to VariableInterestRate and Loan hasSchedule to InterestRateResetSchedule for that same Loan and confirm both links match the returned evidence.\n  confirmPaymentRecordCompleteness:\n    input: Loan\n    preconditions: [paymentRecordCompletenessConfirmed]\n    effect: Return confirmation that Loan hasPaymentHistory and that the history hasIndividualPayment to at least one IndividualPaymentTransaction, identifying the links checked; do not claim a stored result.\n    verification: Re-read Loan hasPaymentHistory and that PaymentHistory hasIndividualPayment to IndividualPaymentTransaction and confirm the returned evidence matches the recorded links.\n  confirmSuppliedPrepaymentTiming:\n    input: PrepaymentTerms\n    preconditions: [suppliedPrepaymentTimingConfirmed]\n    effect: Return confirmation of the recorded PrepaymentTerms.prepaymentPenaltyTermMonths on the supplied terms, without claiming they apply to any Loan or that the finding was stored.\n    verification: Re-read PrepaymentTerms.prepaymentPenaltyTermMonths on the supplied terms and confirm it matches the returned value."
}
```

### Turn 114 — tool

Applied. Added 0, updated 10 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 114 — assistant

**Interest Owed** is now **Interest**; **Principal** stays as shown. The wording pass covered every relationship, property, and class on the canvas. No relationships were redirected, and nothing was added or removed.

I also updated the five existing rules and five existing actions to use the renamed terms. The two previously noted navigation warnings remain; these name changes do not resolve the underlying path questions.

NAMING LEDGER: relationships_renamed=18; relationships_redirected=0; properties_renamed=11; classes_renamed=4
