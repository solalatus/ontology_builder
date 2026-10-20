# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-20T14:04:12.134Z

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

We’ll start with the real work the agent must support, then build a small model around it: questions, actions, the things involved, their connections, and the checks that govern decisions. The canvas is empty, so we’re starting fresh.

Thinking about approval hand-off and ongoing servicing, what are the first 5–7 questions you would expect the agent to answer? Please phrase them as questions you’d actually ask at work; we can fill out the list from there.

### Turn 2 — user

At hand-off, I’d start with these:

1. Who’s the borrower, and who’s the lender on this loan?
2. What principal amount, interest rate, and maturity date are we setting up?
3. What do the terms say about paying back principal and paying interest?
4. Which payment schedules need to be on file for this loan?
5. Is the loan secured? If so, what collateral supports it?
6. Who’s servicing the loan and collecting the payments?
7. What payments have actually come in, and are the individual transactions in the payment history?

Those would get us from the agreed terms to a loan we can track in servicing.

### Turn 2 — assistant

That gives us the hand-off core: parties, agreed terms, schedules, security, servicing responsibility, and payment history. I’ll keep the questions separate where they could have different answers.

For the first three items, should I record these as seven distinct requirements?

1. Who is the borrower on a loan?
2. Who is the lender on a loan?
3. What principal amount should be set up for a loan?
4. What interest rate should be set up for a loan?
5. What is the loan’s maturity date?
6. What do the terms require for repayment of principal?
7. What do the terms require for payment of interest?

### Turn 3 — user

Yes—those are seven distinct questions, and keeping principal repayment separate from interest payment is useful. I’d make two small wording adjustments:

- For **principal amount**, ask what the *agreed principal amount* is. The outstanding principal and current loan balance can change after funding.
- For **interest rate**, ask which rate applies and whether it’s fixed or variable. If it’s variable, we also need to check its reset schedule.

The last two should stay separate: principal repayment terms tell us when and how principal is due; interest payment terms tell us when interest is due and how its accrual is calculated.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Who is the borrower on a loan?\n  - text: Who is the lender on a loan?\n  - text: What is the agreed principal amount of a loan?\n  - text: Which interest rate applies to a loan?\n  - text: Is a loan's interest rate fixed or variable?\n  - text: If a loan's interest rate is variable, what is its reset schedule?\n  - text: What is a loan's maturity date?\n  - text: When and how is principal due under a loan's terms?\n  - text: When is interest due under a loan's terms?\n  - text: How is interest accrual calculated under a loan's terms?"
}
```

### Turn 3 — tool

Applied. Added 10, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

I’ve recorded those ten questions, including the distinction between agreed principal and a changing balance, and the separate questions about variable-rate resets and interest accrual.

For your remaining hand-off items, do these capture the questions the agent needs to answer?

1. Which payment schedules need to be on file for a loan?
2. Is the loan secured?
3. If it is secured, what collateral supports it?
4. Who services the loan?
5. Who collects its payments?
6. What payments have been received?
7. Which individual transactions make up the payment history?

### Turn 4 — user

Mostly, yes. I’d tighten three distinctions:

- **Schedules:** Ask which schedules *apply* to the loan and whether those are on file. A loan may have an amortization schedule, separate principal or interest payment schedules, or a rate-reset schedule; they aren’t all required for every loan.
- **Security:** Keep “Is it secured?” separate from “What supports it?” A secured loan may be backed by pledged collateral or by a guarantee, so the second question shouldn’t assume collateral in every case. Where collateral is pledged, we need to identify it.
- **Servicing:** Questions 4 and 5 usually have one answer in our work: the servicer collects principal and interest on the lender’s behalf. I’d ask, “Who services this loan and collects its payments?” That doesn’t assume the servicer is the lender.

Keep 6 and 7 distinct. The payment history tells us what was actually paid, and the individual transactions are the entries that make up that history.

### Turn 4 — assistant

That separates what *applies* from what is *on file*, and it avoids assuming every secured loan has collateral. For the schedules and security questions, should I record these four?

1. Which schedules apply to a loan under its terms?
2. Are the applicable schedules on file for the loan?
3. Is the loan secured?
4. What pledged collateral or guarantee supports a secured loan?

### Turn 5 — user

Yes, those four work. For schedules, keeping “which apply?” separate from “are they on file?” lets us spot a missing schedule without treating every schedule type as mandatory.

For security, I’d keep the fourth question but check the two forms of support separately in practice. If it’s **pledged collateral**, we identify the collateral linked to the loan and the security agreement covering it. If it’s **a guarantee**, we identify that as the basis of the security rather than assuming there’s pledged collateral.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Which schedules apply to a loan under its terms?\n  - text: Are the applicable schedules on file for the loan?\n  - text: Is the loan secured?\n  - text: What pledged collateral or guarantee supports a secured loan?\n  - text: Where collateral is pledged, which collateral is linked to the loan?\n  - text: Where collateral is pledged, which security agreement covers it?"
}
```

### Turn 5 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

I’ve recorded those six questions. They distinguish the schedules that apply from the schedules on file, and a guarantee from pledged collateral and its security agreement.

For the remaining items, should I record these three questions?

1. Who services the loan and collects its payments on the lender’s behalf?
2. What payments have actually been received on the loan?
3. Which individual transactions make up the loan’s payment history?

### Turn 6 — user

Yes. Those are three useful questions. The first identifies the servicer’s responsibility; the second asks what the payment record shows; and the third lets us trace that history back to the individual payment transactions.

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Who services the loan and collects its payments on the lender's behalf?\n  - text: What payments have actually been received on a loan?\n  - text: Which individual transactions make up a loan's payment history?"
}
```

### Turn 6 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 6 — assistant

The hand-off and payment-history questions are now recorded. Next are the things the agent must **do**, rather than answer.

What are 5–10 actions you would want it to perform during loan setup or ongoing servicing? Please name the work as you would describe it to a colleague; we’ll pin down conditions and success checks later.

### Turn 7 — user

I’d give it these five checks:

1. Assess whether the loan record is ready for servicing hand-off.
2. Verify the support recorded for a secured loan.
3. Review the setup of a variable-rate loan.
4. Check whether the loan’s payment record is complete enough to track.
5. Review the recorded prepayment penalty timing.

I’d call these checks rather than changes to the loan: they confirm what’s on file and flag what needs attention.

### Turn 7 — assistant

Those are five review actions, not changes to the loan. We’ll model them as checks that report what is confirmed and what needs attention; their detailed conditions can come later. The first four connect to questions already recorded.

The fifth introduces a new requirement. Should I add this question: **“When does a prepayment penalty apply under the loan’s recorded terms?”**

### Turn 8 — user

Yes, with a slight adjustment: I’d ask, **“What prepayment terms apply, and what is the recorded prepayment penalty period?”**

That keeps the focus on the penalty timing we can check. “When does a penalty apply?” could also mean deciding whether a particular early payment triggers a charge, which this check doesn’t establish on its own.

### Turn 8 — assistant

Agreed—the review checks the recorded penalty period, not whether a particular payment incurs a charge.

To keep the two answers distinct, may I record your requirement as:

1. What prepayment terms apply to a loan?
2. What prepayment penalty period is recorded for the loan?

### Turn 9 — user

Yes, keep those separate. The first identifies the terms governing early repayment; the second checks the recorded length of any prepayment penalty period. A loan can have prepayment terms without a penalty period, so its absence alone doesn’t mean a penalty detail is missing.

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What prepayment terms apply to a loan?\n  - text: What prepayment penalty period is recorded for a loan?"
}
```

### Turn 9 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 9 — assistant

I’ve recorded the two prepayment questions separately. We now have 21 questions and five review actions. None of the actions assumes the agent changes the loan record.

One final scope check before we identify the things the model needs: for the borrower, lender, and servicer you’ve named, is there a closely related role that actually does the day-to-day work under any of them, and does any of these questions or checks depend on a specific operating context that changes how it’s handled?

### Turn 10 — user

The **servicer** is the day-to-day collection role here: it collects principal and interest on the lender’s behalf. It may be a different party from the lender. I wouldn’t add another operating role beneath it for these questions or checks.

The checks do depend on the loan’s terms and type—not on a separate operating context. For example, a variable-rate loan needs reset scheduling information, while the collateral check applies when a secured loan is backed by pledged collateral. We shouldn’t apply either check indiscriminately to every loan.

### Turn 10 — assistant

Phase 1 is captured: 21 recorded questions and five agreed review checks. The servicer is the day-to-day collection party and may differ from the lender; no additional role or separate operating context is needed. The loan’s terms determine which checks apply.

Is that an accurate summary before we identify the kinds of things the agent needs to work with?

### Turn 11 — user

Yes, that’s accurate for this phase. One small refinement: **the loan’s type as well as its terms** determines which checks apply. The variable-rate setup check is for variable-rate loans, and the collateral check is for loans backed by pledged collateral—not a reason to assume a guaranteed loan has pledged collateral.

### Turn 11 — assistant

Confirmed: the loan’s **type and terms** determine which reviews apply. A guaranteed loan does not, by that fact alone, call for a collateral check.

For the first set of kinds of things, I propose **Loan**, **Borrower**, **Lender**, and **Servicer**. The agent needs the Loan for every recorded question and check; it needs to identify the Borrower and Lender to answer who the parties are, and the Servicer to answer who collects payments on the lender’s behalf. Does it need to identify and connect each of these four separately, including Lender and Servicer when they happen to be the same party?

### Turn 12 — user

Yes. Keep the loan, borrower, lender, and servicer distinct, and record each role’s connection to the loan. The loan has a borrower who owes repayment and a lender who provides the credit; it is serviced by the party responsible for collecting payments on the lender’s behalf.

Even if one party is both lender and servicer, we still need both roles recorded. Knowing who financed the loan doesn’t, by itself, establish who services it.

### Turn 12 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan: {}\n  Borrower: {}\n  Lender: {}\n  Servicer: {}"
}
```

### Turn 12 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 12 — assistant

I’ve added those four as separate kinds of things. Their connections will be recorded when we map relationships.

Next are **Loan Terms** and **Payment Schedule**. The agent needs to find the agreed repayment, interest, and prepayment terms, and to identify which schedules apply and whether they’re on file. Does it need to retrieve and connect each of these as a distinct item, rather than treating the terms and schedules only as values on the Loan?

### Turn 13 — user

Yes, but I wouldn’t use just one **Loan Terms** item and one **Payment Schedule** item. That would blur distinctions we need for the checks.

Principal repayment terms and interest payment terms are separate: the former govern payment of principal; the latter govern payment of interest and carry the basis for calculating accrual. Prepayment terms are a further, distinct part of principal repayment. Likewise, the loan can have a general payment schedule and more specific amortization, principal payment, interest payment, interest calculation, or rate-reset schedules.

So the agent should be able to identify the applicable terms and schedules separately, then check which schedules are actually associated with the loan. I wouldn’t treat all of those schedules as required on every loan, or assume the same term fields belong directly on the loan record.

### Turn 13 — assistant

The agent needs to distinguish the terms and schedules that apply, rather than treat every schedule as mandatory. I won’t add a generic “Loan Terms” or “Payment Schedule” class yet, because that could hide the distinctions you’ve described.

For the schedules specifically: does the agent handle the amortization, principal-payment, interest-payment, interest-calculation, and rate-reset schedules as separate kinds of records with different connections or checks, or as **Payment Schedule** records distinguished by a schedule type? What would it need to do differently with them?

### Turn 14 — user

I’d handle them as **separate kinds of schedules**, all associated with the loan, rather than as one payment-schedule record with a type label. They answer different servicing questions:

- An **amortization schedule** shows how the debt balance is expected to change across payments. For an amortizing loan, we check that it’s on file alongside terms governing principal repayment.
- A **principal payment schedule** identifies when principal is due; an **interest payment schedule** identifies when interest is due. Those need not be the same dates.
- An **interest calculation schedule** identifies when interest is calculated, which is different from when it’s paid.
- A **rate-reset schedule** identifies when a variable rate is recalculated. That’s the schedule we specifically check when reviewing variable-rate setup.

There can also be a general **loan payment schedule**. Keeping it distinct doesn’t mean every loan must have every specialized schedule.

### Turn 14 — assistant

I’ll keep those schedule kinds separate. The due-date schedules answer different payment questions; the calculation schedule answers when interest is calculated; amortization supports the balance-change check; and rate-reset supports the variable-rate review. None is automatically required for every loan.

I’ll first add **Amortization Schedule**, **Principal Payment Schedule**, and **Interest Payment Schedule** as distinct kinds the agent identifies and connects to the loan. Is that the right split for those three?

### Turn 15 — user

Yes. Keep all three distinct and associate each applicable one with the loan. The amortization schedule tracks expected changes in the debt balance; the principal payment schedule sets out when principal is due; and the interest payment schedule sets out when interest is due. They serve different purposes even when their dates overlap.

### Turn 15 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  AmortizationSchedule: {}\n  PrincipalPaymentSchedule: {}\n  InterestPaymentSchedule: {}"
}
```

### Turn 15 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 15 — assistant

Those three schedule kinds are recorded separately.

For the remaining schedules, should I add **Interest Calculation Schedule**, **Rate-Reset Schedule**, and **Loan Payment Schedule** as three distinct kinds? The first identifies when interest is calculated, the second when a variable rate is recalculated, and the third is the general schedule you mentioned. Does the agent need to retrieve each one separately for the recorded questions or checks?

### Turn 16 — user

Yes—add all three as distinct kinds, each associated with the loan when it applies. I’d call the second an **interest rate reset schedule**, just to make clear what is being reset.

The agent may need to retrieve each separately: the interest calculation schedule answers when interest is calculated, the interest rate reset schedule is checked for a variable-rate loan, and the general loan payment schedule shows the loan’s payment timetable. None of those connections means all three must be present on every loan.

### Turn 16 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InterestCalculationSchedule: {}\n  InterestRateResetSchedule: {}\n  LoanPaymentSchedule: {}"
}
```

### Turn 16 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 16 — assistant

Those three schedules are recorded with your preferred name, **Interest Rate Reset Schedule**. Their presence will depend on the loan, not on a blanket requirement.

Now for terms: should **Principal Repayment Terms**, **Interest Payment Terms**, and **Prepayment Terms** be three distinct kinds the agent can retrieve and connect to the loan? They would respectively support the principal-due question, the interest-due and accrual questions, and the two prepayment questions.

### Turn 17 — user

Yes, keep those as three distinct kinds of terms. I’d be careful, though, about recording all three as **direct connections from the loan**.

Principal repayment terms govern payment of the loan’s principal; interest payment terms govern payment of its interest. That gives the agent a way to find the relevant terms through the obligations they govern. Prepayment terms are the part of principal repayment terms dealing with payment before maturity, and can specify a penalty period when one applies.

That distinction matters for the checks: for an interest-bearing loan, we check that terms governing interest payment are present. We shouldn’t infer from this that every loan has a prepayment penalty.

### Turn 17 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PrincipalRepaymentTerms: {}\n  InterestPaymentTerms: {}\n  PrepaymentTerms: {}"
}
```

### Turn 17 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 17 — assistant

The three kinds of terms are recorded. I haven’t assumed they all connect directly to the loan; you’ve described a route through what they govern.

To make that route usable, does the agent need to identify **Loan Principal** and **Loan Interest** as distinct things it can connect to their respective terms and schedules? Or can it answer the recorded questions using values on the loan and the term and schedule records already named?

### Turn 18 — user

Yes, it needs to identify **principal** and **interest** separately, not rely only on values on the loan.

The loan has a principal obligation and an interest obligation. Principal repayment terms govern payment of the principal; interest payment terms govern payment of the interest. That’s the route for finding the right terms. The schedules we’ve discussed are associated with the loan, rather than needing to connect directly to those obligations.

The agreed principal amount can still be recorded on the loan. Keep that separate from outstanding principal, which changes as it’s repaid. Interest that has accrued but has not yet been paid is another amount we track separately.

### Turn 18 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  LoanPrincipal: {}\n  LoanInterest: {}"
}
```

### Turn 18 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 18 — assistant

I’ve added **Loan Principal** and **Loan Interest** separately. The agreed principal amount can remain a value on the Loan; outstanding principal and accrued-but-unpaid interest are different changing amounts. We’ll settle where those changing values belong when we reach properties.

For the security questions, does the agent need to identify **Pledged Collateral**, **Guarantee**, and **Security Agreement** as three distinct kinds of things? In particular, is a guarantee something it retrieves separately to establish the support for a secured loan, rather than just a yes/no value?

### Turn 19 — user

It needs to identify **collateral** and the **security agreement** separately. The secured loan is linked to the pledged collateral; the security agreement establishes the interest in that collateral. A “secured” flag alone doesn’t tell us what was pledged.

I wouldn’t add **Guarantee** as a separate thing to retrieve on that basis. We distinguish a **guaranteed loan** from a loan backed by pledged collateral, but the support we’ve described does not give the agent a separate guarantee record to follow. So it can identify the loan as guaranteed without claiming it has found a particular guarantee document or guarantor.

### Turn 19 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Collateral: {}\n  SecurityAgreement: {}"
}
```

### Turn 19 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 19 — assistant

I’ve added **Collateral** and **Security Agreement**, but not a Guarantee record. A loan can be identified as guaranteed without implying the agent can retrieve a particular guarantee document or guarantor.

For payment tracking, does the agent need **Payment History** and **Payment Transaction** as distinct things? The history would show payments received on the loan, while transactions would be its individual entries. Does it also need a separate **Payment** kind, or would that duplicate the transactions for these questions?

### Turn 20 — user

Yes, keep **payment history** and **individual payment transaction** distinct. The loan has a payment history, and that history contains the individual transactions recording actual payments.

I wouldn’t add a generic **payment** kind for these questions; it would duplicate what the individual transactions already let us inspect. We may distinguish an actual **principal payment** from an **interest payment** when examining what was paid, but neither replaces the history or its transaction entries.

### Turn 20 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PaymentHistory: {}\n  PaymentTransaction: {}"
}
```

### Turn 20 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 20 — assistant

**Payment History** and **Payment Transaction** are recorded; I haven’t added a generic Payment kind.

When the agent distinguishes an actual principal payment from an interest payment, does it need to retrieve them as separate kinds of records, or can it classify each payment transaction by what it paid? What would the agent do differently with separate records?

### Turn 21 — user

For the payment-history questions we’ve recorded, the **individual payment transactions** are enough: they let us inspect the entries that make up the history. I wouldn’t add a required transaction-type field or assume every transaction maps neatly to just one kind of payment.

**Principal payment** and **interest payment** are distinct kinds of actual payment events. They’re useful if the agent needs to ask specifically when principal was paid versus when interest was paid. But I wouldn’t make separate event records a prerequisite for checking that the loan has a payment history with individual transactions.

### Turn 21 — assistant

For the recorded payment-history questions, transactions are enough. I won’t add separate principal- or interest-payment events, or require each transaction to have a single payment type; a future question about when each was paid could justify revisiting that.

That completes the proposed kinds of things for this phase: the loan and its parties, six distinct schedules, three kinds of terms, principal and interest obligations, collateral and its security agreement, and payment history with its transactions. Is that the right set before we map how they connect?

### Turn 22 — user

It’s a good working set, but I’d add **fixed interest rate**, **variable interest rate**, and **day-count convention** before mapping connections. We already agreed the agent must identify which rate applies and, for interest accrual, the calculation basis in the interest payment terms. Those shouldn’t disappear into an undifferentiated loan value.

I’d also keep **secured loan** and **collateralized loan** distinct when we map security, so we don’t treat a guaranteed loan as though it must have pledged collateral. With those additions, we can map the connections.

### Turn 22 — assistant

Those distinctions matter. Before adding the rate kinds, I want to check whether they need separate records or a fixed/variable choice on an **Interest Rate** record. A variable rate needs a reset-schedule check; a fixed rate does not.

Does the agent need to retrieve or connect **Fixed Interest Rate** and **Variable Interest Rate** as separate kinds of things, or would one Interest Rate kind with a fixed/variable distinction preserve what it needs to do?

### Turn 23 — user

I’d keep **fixed interest rate** and **variable interest rate** as separate kinds connected to the loan, rather than only a fixed-or-variable choice on one rate record. The variable-rate connection tells us to check for an **interest rate reset schedule**; a fixed-rate loan doesn’t need that check.

Both carry a numeric rate. The distinction isn’t just how we display the rate—it changes which setup information we need to verify.

### Turn 23 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  FixedInterestRate: {}\n  VariableInterestRate: {}"
}
```

### Turn 23 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 23 — assistant

I’ve added **Fixed Interest Rate** and **Variable Interest Rate** separately. The variable-rate connection will matter to the reset-schedule check.

For **day-count convention**, does the agent need to identify a convention as a separate thing connected to the interest payment terms, or is its named value on those terms enough to answer how interest accrual is calculated? What would the agent retrieve or connect if it were separate?

### Turn 24 — user

Keep the **day-count convention** as a separate thing that the **interest payment terms** point to. That connection identifies the accrual basis used to calculate interest; it isn’t simply the interest payment date or frequency.

The agent would retrieve the applicable interest payment terms, follow their accrual-basis connection to the convention, and use that to explain how the day count for accrued interest is determined. I wouldn’t invent a list of allowable conventions here unless we have the governing terms to supply it.

### Turn 24 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  DayCountConvention: {}"
}
```

### Turn 24 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 24 — assistant

**Day Count Convention** is now recorded as a separate kind reached through **Interest Payment Terms**. I won’t invent its allowed conventions.

Before we map security, one distinction needs settling: does the agent need **Secured Loan** and **Collateralized Loan** as separately identifiable records with different connections, or are these descriptions of a **Loan**—where “secured” covers the broader category and “collateralized” identifies the pledged-collateral case? What would it do with separate records that it could not do with the Loan and its security connections?

### Turn 25 — user

They’re **descriptions of the loan**, not additional loan records to create. A collateralized loan is a narrower kind of secured loan: it’s the case backed by cash or other acceptable collateral provided under the collateral agreement. A guaranteed loan is another secured case, but that label alone doesn’t establish pledged collateral.

That distinction tells the agent which support to look for. For a loan backed by pledged collateral, it follows the loan’s link to the collateral and checks that support is recorded. It should not create a second “secured loan record,” or infer a collateral link merely because the loan is secured by a guarantee.

### Turn 25 — assistant

I’ll keep **secured** and **collateralized** as descriptions of the existing Loan, not new classes. Only the pledged-collateral case gives the agent a reason to follow a collateral link; a guarantee alone does not.

You called the document a **security agreement** earlier and a **collateral agreement** just now. In your work, are those two names for the same agreement, or are they different documents?

### Turn 26 — user

I’d use **collateral agreement** as the broader description, not assume it’s always another name for the same document. A **security agreement** is the specific agreement that grants a financial interest in the pledged collateral and sets out rights concerning it.

So when I said “under the collateral agreement,” I wasn’t introducing a second document that must always be on file alongside a security agreement. For the pledged-collateral case, we’d identify the collateral and the security agreement that secures it.

### Turn 26 — assistant

Phase 2 now includes the separate fixed and variable rates and the day-count convention. **Secured** and **collateralized** describe the Loan rather than separate records. I’ve kept **Security Agreement** as the specific document needed for pledged collateral; I won’t treat the broader phrase “collateral agreement” as its alias or create a second required document.

Does that complete the set of things the agent needs to identify before we map their connections?

### Turn 27 — user

Yes, that’s enough to map connections for the **questions and five reviews agreed so far**. We can add other things if we expand the questions later—for example, accrued but unpaid interest is tracked separately from principal and the interest rate.

One correction before we move on: identify the security agreement when examining pledged collateral, but don’t make finding that agreement a prerequisite for the **secured-loan support review**. That review confirms that the loan is linked to collateral.

### Turn 27 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 27 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: null
    aliases: []
    properties: {}
  Borrower:
    meaning: null
    aliases: []
    properties: {}
  Lender:
    meaning: null
    aliases: []
    properties: {}
  Servicer:
    meaning: null
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: null
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: null
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  LoanPrincipal:
    meaning: null
    aliases: []
    properties: {}
  LoanInterest:
    meaning: null
    aliases: []
    properties: {}
  Collateral:
    meaning: null
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: null
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: null
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: null
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: null
    aliases: []
    properties: {}
  VariableInterestRate:
    meaning: null
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: null
    aliases: []
    properties: {}
relationships: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 27 — assistant

Understood: the secured-loan support review checks whether a loan backed by pledged collateral is **linked to collateral**. Finding the security agreement is a separate question, not a prerequisite for that review.

Let’s map the first connections. Should I record these as direct facts, in these directions?

- Loan → **has borrower** → Borrower
- Loan → **has lender** → Lender
- Loan → **serviced by** → Servicer
- Loan → **has principal obligation** → Loan Principal
- Loan → **has interest obligation** → Loan Interest

### Turn 28 — user

Yes, those are direct connections in the directions shown. The loan identifies its borrower and lender, and it is serviced by the party that collects payments on the lender’s behalf.

The last two are right in substance too. I’d phrase them a little more simply than “has principal obligation” and “has interest obligation”: the loan has **principal** and **interest** as distinct things. That keeps them separate from the agreed principal amount on the loan, the changing outstanding amounts, and the interest rate.

### Turn 28 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasBorrower\n    from: Loan\n    to: Borrower\n  - name: hasLender\n    from: Loan\n    to: Lender\n  - name: servicedBy\n    from: Loan\n    to: Servicer\n  - name: hasPrincipal\n    from: Loan\n    to: LoanPrincipal\n  - name: hasInterest\n    from: Loan\n    to: LoanInterest"
}
```

### Turn 28 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 28 — assistant

Those five direct connections are recorded, using **has principal** and **has interest** as you suggested.

For the route from a loan to its governing terms and accrual basis, are these direct facts, with the arrows in the right direction?

- Loan Principal → **governed by** → Principal Repayment Terms
- Loan Interest → **governed by** → Interest Payment Terms
- Principal Repayment Terms → **includes prepayment terms** → Prepayment Terms
- Interest Payment Terms → **uses day-count convention** → Day Count Convention

### Turn 29 — user

Not quite. The route is useful, but I’d record it this way:

- **Principal repayment terms → principal:** the terms govern payment of the principal. The arrow you proposed runs the other way.
- **Interest payment terms → interest:** likewise, these terms govern payment of the interest.
- **Prepayment terms:** these are a particular kind of principal repayment terms for paying before maturity. I wouldn’t record “includes prepayment terms” as a direct connection between two term records.
- **Interest payment terms → day-count convention:** that direction is right. “Uses” gets the idea across, though I’d phrase it around the convention being the basis for interest accrual, rather than a general-purpose use.

The loan’s separate links to principal and interest give the agent a route to the terms that govern each payment.

### Turn 29 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: governsPaymentOf\n    from: PrincipalRepaymentTerms\n    to: LoanPrincipal\n  - name: governsPaymentOf\n    from: InterestPaymentTerms\n    to: LoanInterest\n  - name: setsAccrualBasisBy\n    from: InterestPaymentTerms\n    to: DayCountConvention"
}
```

### Turn 29 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 29 — assistant

I’ve recorded the two **terms govern payment of obligation** connections and the interest-terms connection to the day-count convention. I did not add “includes prepayment terms,” because that would only restate that prepayment terms are a particular kind of principal repayment terms.

How does the agent find the applicable prepayment terms for a loan in practice? Is there a direct recorded connection from the loan or its principal to those terms, or another route?

### Turn 30 — user

It starts with the loan’s **principal**, then finds the **principal repayment terms that govern payment of it**. If those are prepayment terms—terms dealing with repayment before maturity—the agent can inspect them for a recorded penalty period.

I wouldn’t add a direct loan-to-prepayment-terms or principal-to-prepayment-terms connection just to make that search easier. And it shouldn’t assume every loan has prepayment terms or a penalty period.

### Turn 30 — assistant

So the path is Loan → Loan Principal ← Principal Repayment Terms. No direct link to Prepayment Terms has been confirmed, and neither those terms nor a penalty period is assumed for every loan.

There’s one modeling distinction to settle: **Prepayment Terms** currently has no operational connection of its own; “a kind of Principal Repayment Terms” alone isn’t a connection this model can represent. Should the agent identify a separate prepayment-terms record through some real workflow link, or should it recognize prepayment provisions and any penalty period within the applicable Principal Repayment Terms?

### Turn 31 — user

Keep **prepayment terms** separately identifiable when they apply. They’re the principal repayment terms dealing specifically with repayment before maturity, not just an unlabelled provision in any principal repayment terms.

The agent can find the terms that govern payment of the loan’s principal, then recognize whether the applicable terms include that prepayment-specific kind and inspect its recorded penalty period. I wouldn’t invent another workflow link to reach them. And no prepayment terms—or penalty period—should be assumed for every loan.

### Turn 31 — assistant

We can keep **Prepayment Terms** separately identifiable without adding a “kind of” link. To give that class its own operational connection, can I record this direct fact: **Prepayment Terms → govern early repayment of → Loan Principal**, when such terms apply? That would let the agent find them through the principal without assuming every loan has them.

### Turn 32 — user

The route is right, but I wouldn’t add **“govern early repayment of”** as a new direct connection. When prepayment terms apply, they are a particular kind of principal repayment terms: they govern payment of the loan’s principal, specifically payment before maturity.

So the agent can find them through the existing principal-payment connection and identify them as prepayment terms. That doesn’t imply every loan has them.

### Turn 32 — assistant

Understood—I won’t add a new **“govern early repayment of”** relationship. The distinction is in which terms they are, not a different verb.

To make **Prepayment Terms** reachable without a “kind of” link, should the existing **governs payment of** connection also run from a Prepayment Terms record to the Loan Principal, when those terms apply? That would reuse the same connection, not assume every loan has prepayment terms.

### Turn 33 — user

Yes—**when prepayment terms apply, they can be reached through the existing “governs payment of” connection to the loan’s principal**, because they are a kind of principal repayment terms. I wouldn’t define a second, prepayment-only connection.

That makes the terms reachable without implying that every loan has prepayment terms or a penalty period.

### Turn 33 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: governsPaymentOf\n    from: PrepaymentTerms\n    to: LoanPrincipal"
}
```

### Turn 33 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 33 — assistant

That connection is recorded. When Prepayment Terms apply, they use the same **governs payment of → Loan Principal** relationship; no prepayment-only relationship or universal requirement was added.

For the rate questions, does a Loan directly connect to its applicable **Fixed Interest Rate** or **Variable Interest Rate**, as you described? And is a rate also directly connected to **Loan Interest**, or does the agent reach the rate through the Loan and its separate Loan Interest link?

### Turn 34 — user

The **loan directly has its applicable interest rate**—fixed or variable. I wouldn’t add a direct connection from the rate to the loan’s interest obligation.

The agent reaches both from the loan: one link identifies the rate that applies, and a separate link identifies the interest obligation. If the applicable rate is variable, it then checks the loan for an interest rate reset schedule.

### Turn 34 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasApplicableInterestRate\n    from: Loan\n    to: FixedInterestRate\n  - name: hasApplicableInterestRate\n    from: Loan\n    to: VariableInterestRate"
}
```

### Turn 34 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 34 — assistant

The Loan now directly identifies its applicable fixed or variable interest rate. I haven’t linked either rate directly to Loan Interest.

For **Amortization Schedule**, **Principal Payment Schedule**, and **Interest Payment Schedule**, is each directly associated with the Loan when it is on file? And how does the agent determine that each *should* apply before checking whether it is on file—through the relevant terms, the loan’s type, or something else?

### Turn 35 — user

Yes. Each of those schedules is **directly associated with the loan** when it’s on file.

To decide what *should* be there, the agent looks at how the loan is structured and what its repayment terms call for; it shouldn’t infer that all three schedules are required just because the loan has principal and interest. There is one specific check we’ve agreed: **for an amortizing loan**, confirm an amortization schedule is associated with it and that principal repayment terms govern its principal. Principal and interest payment schedules remain distinct, but we haven’t set a blanket requirement for either one on every loan.

### Turn 35 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasAmortizationSchedule\n    from: Loan\n    to: AmortizationSchedule\n  - name: hasPrincipalPaymentSchedule\n    from: Loan\n    to: PrincipalPaymentSchedule\n  - name: hasInterestPaymentSchedule\n    from: Loan\n    to: InterestPaymentSchedule"
}
```

### Turn 35 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 35 — assistant

Those three **on-file** schedule links are recorded. I haven’t made any schedule universally required; the confirmed specific check is for an amortizing loan.

For the remaining three—**Interest Calculation Schedule**, **Interest Rate Reset Schedule**, and general **Loan Payment Schedule**—is each also directly associated with the Loan when on file? For the reset schedule, does the applicable **Variable Interest Rate** itself specify which reset schedule is needed, or does the agent determine that from the loan’s terms?

### Turn 36 — user

Yes. Each is directly associated with the **loan** when on file: the interest calculation schedule, interest rate reset schedule, and general loan payment schedule.

For the variable-rate check, the agent looks for two things **on the loan**: an applicable variable interest rate and an associated interest rate reset schedule. I wouldn’t add a direct link from the rate to the schedule. The governing terms explain the arrangement, but the check we’ve agreed verifies that loan-level schedule link.

### Turn 36 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasInterestCalculationSchedule\n    from: Loan\n    to: InterestCalculationSchedule\n  - name: hasInterestRateResetSchedule\n    from: Loan\n    to: InterestRateResetSchedule\n  - name: hasLoanPaymentSchedule\n    from: Loan\n    to: LoanPaymentSchedule"
}
```

### Turn 36 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 36 — assistant

Those three on-file links are recorded. The variable-rate review will look for a variable rate and a reset schedule on the Loan, without assuming a direct rate-to-schedule link.

For pledged collateral, how does the agent get from the Loan to the **Collateral** and then to the **Security Agreement** covering it? Are **Loan → linked to → Collateral** and **Collateral → covered by → Security Agreement** both direct recorded facts?

### Turn 37 — user

The first direction is right for a secured loan backed by pledged collateral: **the loan is collateralized by the collateral**. That link is what the secured-loan support review checks.

I’d reverse the second arrow. **The security agreement secures the collateral**—it grants the financial interest in it. The agent can find an agreement covering the identified collateral by looking for an agreement that secures it. The collateral link alone doesn’t establish that an agreement has been found, and finding the agreement isn’t a prerequisite for that support review.

### Turn 37 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: collateralizedBy\n    from: Loan\n    to: Collateral\n  - name: secures\n    from: SecurityAgreement\n    to: Collateral"
}
```

### Turn 37 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 37 — assistant

I’ve recorded **Loan → collateralized by → Collateral** and **Security Agreement → secures → Collateral**. The support review checks the first link; finding an agreement is a separate question.

For payment tracking, are these direct facts: **Loan → has payment history → Payment History** and **Payment History → contains transaction → Payment Transaction**? Or is there an additional connection the agent uses to establish which actual payments belong to the loan?

### Turn 38 — user

Yes, those are the direct facts, and no additional connection is needed for the payment-history check. The loan has a payment history, and that history has the individual payment transactions that make it up.

I’d say **“has individual payment”** rather than “contains transaction” for the second connection. It makes clear we mean actual payment entries, not any transaction associated with the loan.

### Turn 38 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasPaymentHistory\n    from: Loan\n    to: PaymentHistory\n  - name: hasIndividualPayment\n    from: PaymentHistory\n    to: PaymentTransaction"
}
```

### Turn 38 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 38 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 38 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: null
    aliases: []
    properties: {}
  Borrower:
    meaning: null
    aliases: []
    properties: {}
  Lender:
    meaning: null
    aliases: []
    properties: {}
  Servicer:
    meaning: null
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: null
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: null
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  PrepaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  LoanPrincipal:
    meaning: null
    aliases: []
    properties: {}
  LoanInterest:
    meaning: null
    aliases: []
    properties: {}
  Collateral:
    meaning: null
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: null
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: null
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: null
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: null
    aliases: []
    properties: {}
  VariableInterestRate:
    meaning: null
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: null
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: null
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: null
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: null
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: LoanPrincipal
    meaning: null
    aliases: []
  - name: hasInterest
    from: Loan
    to: LoanInterest
    meaning: null
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: LoanPrincipal
    meaning: null
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: LoanInterest
    meaning: null
    aliases: []
  - name: setsAccrualBasisBy
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: null
    aliases: []
  - name: governsPaymentOf
    from: PrepaymentTerms
    to: LoanPrincipal
    meaning: null
    aliases: []
  - name: hasApplicableInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: null
    aliases: []
  - name: hasApplicableInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: null
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: null
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: null
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: null
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: null
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: null
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: null
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: null
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: null
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: null
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: PaymentTransaction
    meaning: null
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 38 — assistant

The payment-history path is recorded as **Loan → Payment History → Payment Transaction**, using your phrase “has individual payment.” I checked the canvas: every class now has at least one connection.

There’s still a path to clarify for the schedule questions. When the agent asks which schedules *should* apply, how does it get from the loan’s structure and governing terms to that answer? Is the requirement stated in those terms, determined from the loan’s type, or established another way? I won’t infer a direct terms-to-schedule link from the fact that both concern the same loan.

### Turn 39 — user

It’s a combination of the **loan’s structure and its governing terms**, not a direct terms-to-schedule connection.

For the checks we’ve pinned down, an **amortizing loan** needs an amortization schedule on the loan and principal repayment terms governing its principal. A **variable-rate loan** needs an interest rate reset schedule on the loan. For the other schedules, the agent can identify what’s on file and compare it with the applicable terms, but we haven’t established a blanket rule that any one of them must be present.

So I’d keep the schedule connections on the loan and avoid adding a terms-to-schedule link just to express that reasoning.

### Turn 39 — assistant

That settles the schedule path: the agent checks the loan’s structure and governing terms to determine what applies, then checks the relevant schedule links on the Loan. We have specific requirements for amortizing and variable-rate loans, but no blanket requirement for the other schedules. I won’t add a terms-to-schedule link.

The other paths are now accounted for: the Loan connects directly to its parties, obligations, rates, schedules, collateral, and payment history; terms are found through principal or interest; an agreement is found through the collateral it secures; and individual payments are found through the history. No class is left disconnected.

Is that an accurate recap of the connections before we capture the values needed for the questions and reviews?

### Turn 40 — user

Yes, that’s an accurate recap. Two qualifications are worth keeping on the canvas:

- The loan-to-collateral link applies where collateral is pledged; a guaranteed loan does not automatically have that link.
- Interest payment terms also point to the day-count convention used as the accrual basis.

With those understood, we can move on to the values the questions and reviews need.

### Turn 40 — assistant

Both qualifications are noted: **collateralized by** applies only where collateral is pledged, and Interest Payment Terms point to the Day Count Convention for accrual. We’ll make those explicit in the connection descriptions.

For the Loan itself, the recorded questions and reviews appear to need its **agreed principal amount**, **maturity date**, and a way to tell whether it is **amortizing**, **backed by pledged collateral**, or **guaranteed**. Are these values recorded on the loan? In particular, can collateral and a guarantee both apply to one loan, or are they mutually exclusive descriptions?

### Turn 41 — user

The **agreed principal amount** and **maturity date** are values on the loan.

I wouldn’t put “backed by pledged collateral” on the loan as the sole evidence of support: identify the loan as collateralized and follow its link to the actual collateral. Likewise, **guaranteed loan** describes the loan, but we haven’t established a separate guarantee record to retrieve. For amortization, the loan’s structure matters, and its amortization schedule is a separate record—not just a yes/no field.

I wouldn’t make collateralized and guaranteed mutually exclusive choices. Nothing in what we’ve established rules out both applying to a loan; check each form of support on its own merits.

### Turn 41 — assistant

I’ll put **agreed principal amount** and **maturity date** on the Loan, and use the collateral link—not a flag alone—to verify pledged collateral. I won’t make collateralized and guaranteed mutually exclusive.

For the two remaining distinctions, does the loan record separately state **whether it is amortizing** and **whether it is guaranteed**? Those would guide the amortization check and let the agent identify guaranteed support without inventing a guarantee record.

### Turn 42 — user

I’d treat **amortizing** and **guaranteed** as descriptions of the loan, not add two yes/no fields. The loan’s amortization structure tells us whether the amortization check applies; if it does, we check for an amortization schedule and principal repayment terms governing its principal.

A **guaranteed loan** can likewise be identified as such without inventing a separate guarantee record. That identification doesn’t establish a collateral link, and it doesn’t prevent the loan from also being backed by pledged collateral.

### Turn 42 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      agreedPrincipalAmount:\n        type: number\n      maturityDate:\n        type: date"
}
```

### Turn 42 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 42 — assistant

I’ve recorded the two confirmed Loan values: **agreed principal amount** and **maturity date**. I haven’t added yes/no fields for “amortizing” or “guaranteed.”

One gap remains before the agent can use those descriptions. You asked it to assess an amortizing loan’s setup, and to identify whether a secured loan is supported by a guarantee. What recorded information tells the agent that a particular loan is **amortizing** or **guaranteed**? Is there a loan classification, a term it reads, or another source it follows?

### Turn 43 — user

The agent needs to **know how the loan is structured** to apply those descriptions, but we haven’t established a separate classification field or source record for either one.

For **amortizing**, the loan’s repayment structure tells us whether the check applies. The presence of an amortization schedule is what the check verifies, so the agent shouldn’t use that schedule alone to decide that the loan is amortizing.

For **guaranteed**, the loan can be identified as a guaranteed loan. That does not, by itself, give the agent a guarantee document or a guarantor to follow. If the loan’s structure hasn’t been established, the agent should leave the applicable check undecided rather than infer it from missing or present links.

### Turn 43 — assistant

Understood. The loan’s repayment structure determines whether the amortization check applies; the schedule cannot be used to decide that, because its presence is what the check tests. A loan can be identified as guaranteed without implying a guarantee document or guarantor. **How the agent obtains either description remains open**; if the structure is unknown, it must leave the applicable check undecided.

For the rate questions, should **Fixed Interest Rate** and **Variable Interest Rate** each carry a numeric rate value? If the variable rate changes, which value would the agent need to read for the agreed setup and the ongoing variable-rate review?

### Turn 44 — user

Yes. Both **fixed interest rate** and **variable interest rate** carry a numeric rate value.

For the agreed setup, the agent reads the rate recorded as applying to the loan. For the ongoing variable-rate review, it checks that the loan has a **variable interest rate** and an **interest rate reset schedule**. The schedule tells us when the rate is recalculated; it isn’t itself the rate value.

If you mean “what rate applied on a particular past date?” or “what will the next rate be?”, we’d need more information about the applicable reset and its resulting rate. I wouldn’t infer either answer from the rate value alone.

### Turn 44 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  FixedInterestRate:\n    properties:\n      rateValue:\n        type: number\n  VariableInterestRate:\n    properties:\n      rateValue:\n        type: number"
}
```

### Turn 44 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 44 — assistant

Both rate kinds now have a numeric rate value. I haven’t treated that value as enough to reconstruct a past rate or predict the next one.

For the terms already used in the questions, what recorded values tell the agent **when and how principal is due**, **when interest is due**, and **the length of any prepayment penalty period**? Are those values held on Principal Repayment Terms, Interest Payment Terms, and Prepayment Terms respectively?

### Turn 45 — user

Yes. I’d record them on the respective terms:

- **Principal repayment terms:** the initial principal payment date, the principal repayment date, the payment frequency, and the payment day.
- **Interest payment terms:** the initial interest accrual date, initial and final interest payment dates, the payment frequency and payment day, and the compounding frequency. Their link to the day-count convention supplies the accrual basis.
- **Prepayment terms:** the prepayment penalty period, expressed as a number of months, when one is recorded.

These describe what the terms say. A recorded penalty period alone doesn’t tell us whether a particular early payment incurs a charge.

### Turn 45 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PrincipalRepaymentTerms:\n    properties:\n      initialPrincipalPaymentDate: {type: date}\n      principalRepaymentDate: {type: date}\n      paymentFrequency: {type: text}\n  InterestPaymentTerms:\n    properties:\n      initialInterestAccrualDate: {type: date}\n      initialInterestPaymentDate: {type: date}\n      finalInterestPaymentDate: {type: date}\n      paymentFrequency: {type: text}\n      compoundingFrequency: {type: text}\n  PrepaymentTerms:\n    properties:\n      prepaymentPenaltyPeriod:\n        type: number\n        unit: months"
}
```

### Turn 45 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 45 — assistant

I’ve recorded the dates, frequencies, and penalty period you named. I held back **payment day** on both sets of terms because I need its format before recording it: is it a day of the month (a number), a weekday, or something else? Does the same format apply to principal and interest payment terms?

### Turn 46 — user

For both principal and interest payment terms, **payment day is recorded as text**. I wouldn’t restrict it in this model to a number for the day of the month or to a weekday. Use the wording in the governing terms, and keep the principal payment day separate from the interest payment day—they may differ.

### Turn 46 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PrincipalRepaymentTerms:\n    properties:\n      paymentDay: {type: text}\n  InterestPaymentTerms:\n    properties:\n      paymentDay: {type: text}"
}
```

### Turn 46 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 46 — assistant

Principal and interest payment days are now separate text values, using the wording of their governing terms.

For the question **“What payments have actually been received on a loan?”**, what values on an individual **Payment Transaction** let the agent answer it—for example, the date received and amount received? I won’t assume a transaction has a single principal-or-interest type.

### Turn 47 — user

The **individual payment transactions** are the entries the agent can retrieve through the loan’s payment history. We haven’t established a date-received or amount-received field on those entries, so I wouldn’t add either as a confirmed value—or require a single principal-or-interest type.

As it stands, the agent can identify **which individual payments are recorded** and check that the history contains entries. To answer *when* or *how much* was received, we’d need to establish what details the payment records actually supply.

### Turn 47 — assistant

Agreed. I won’t add a date, amount, or payment-type field without an established basis. The current payment path lets the agent identify which individual payments are recorded; it does not yet answer when or how much was received.

Because the Loan is tracked throughout servicing, does the agent need a **current loan status** value to answer any of our recorded questions or perform the five reviews? If so, which decision would that status change?

### Turn 48 — user

No current loan status value is needed for the questions or five reviews we’ve agreed. Their checks turn on the recorded parties, terms, loan type, applicable schedules, collateral link, and payment-history entries—not a status such as “active” or “closed.”

A servicing workflow might use status for other decisions, but we haven’t defined one here. I wouldn’t add a status field or a list of allowed statuses just for these checks.

### Turn 48 — assistant

I’ll leave out loan status; none of the agreed questions or reviews uses it. For this property pass, we’ve captured the agreed principal and maturity date, rate values, the payment and accrual details on their respective terms, and any recorded penalty period. We have **not** added unsupported payment-transaction details or yes/no fields for loan descriptions.

One gap remains explicit: we haven’t established where the agent reads whether a loan is **amortizing** or **guaranteed**. Is that an accurate recap before we define the recorded kinds of things and connections in plain language?

### Turn 49 — user

Yes, that’s an accurate recap for this property pass. We’ve kept the recorded values separate from the loan descriptions, and we haven’t invented transaction details or a loan status.

The open point is **where the agent obtains the loan’s amortizing or guaranteed description**. Until that’s established, it shouldn’t infer either from the presence or absence of a schedule, collateral link, or guarantee record.

### Turn 49 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: collateralizedBy\n    from: Loan\n    to: Collateral\n    meaning: Identifies pledged collateral supporting the loan when the loan is backed by pledged collateral; a guaranteed loan does not automatically have this connection.\n  - name: setsAccrualBasisBy\n    from: InterestPaymentTerms\n    to: DayCountConvention\n    meaning: Identifies the day-count convention that the interest payment terms use as the basis for interest accrual."
}
```

### Turn 49 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 49 — assistant

Those two qualifications are now explicit on the canvas. The source of the amortizing and guaranteed descriptions remains an open item; I won’t infer either from a schedule or support link.

For the first five plain-language class meanings, do these match your usage?

- **Loan:** The credit arrangement whose approved terms and servicing record the agent checks.
- **Borrower:** The party that owes repayment on the loan.
- **Lender:** The party that provides the credit.
- **Servicer:** The party responsible for collecting principal and interest on the lender’s behalf.
- **Loan Principal:** The loan’s principal obligation, distinct from the agreed amount recorded on the loan and from its changing outstanding amount.

### Turn 50 — user

Yes, broadly. I’d tighten two of them:

- **Loan:** The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms. “Credit arrangement” is a little broad, and “approved” isn’t needed for the meaning.
- **Loan principal:** The amount of the obligation to be repaid, separate from interest. Keep the agreed principal amount recorded on the loan distinct from the outstanding principal, which changes as it’s repaid.

Your meanings for **borrower**, **lender**, and **servicer** match how I use them.

### Turn 50 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    meaning: \"The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms.\"\n  Borrower:\n    meaning: The party that owes repayment on the loan.\n  Lender:\n    meaning: The party that provides the credit.\n  Servicer:\n    meaning: The party responsible for collecting principal and interest on the lender's behalf.\n  LoanPrincipal:\n    meaning: The amount of the obligation to be repaid, separate from interest; its agreed amount is recorded on the loan and its outstanding amount changes as it is repaid."
}
```

### Turn 50 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 50 — assistant

I’ve recorded those five meanings with your refinements.

For the next five, do these descriptions fit?

- **Loan Interest:** The interest obligation associated with the loan, distinct from principal and from the interest rate.
- **Principal Repayment Terms:** The terms stating when and how the loan’s principal is to be paid.
- **Interest Payment Terms:** The terms stating when interest is paid and how its accrual is calculated.
- **Prepayment Terms:** Terms governing repayment of principal before maturity, which may specify a penalty period.
- **Day Count Convention:** The convention used as the day-count basis for calculating accrued interest.

### Turn 51 — user

Yes, those fit. One nuance: **interest** is the cost of using the credit, while the **interest rate** expresses how that cost is charged over time. And the **interest payment terms** point to the day-count convention that supplies the accrual basis; the convention isn’t just another payment date or frequency.

Your prepayment wording correctly says a penalty period **may** be specified—it isn’t inherent in every set of prepayment terms.

### Turn 51 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  LoanInterest:\n    meaning: Interest is the cost of using the credit, distinct from the rate expressing how that cost is charged over time and from principal.\n  PrincipalRepaymentTerms:\n    meaning: The terms stating when and how the loan's principal is to be paid.\n  InterestPaymentTerms:\n    meaning: The terms stating when interest is paid and how it accrues, pointing to the day-count convention that supplies the accrual basis.\n  PrepaymentTerms:\n    meaning: Terms governing repayment of principal before maturity, which may specify a penalty period.\n  DayCountConvention:\n    meaning: The convention used as the day-count basis for calculating accrued interest."
}
```

### Turn 51 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 51 — assistant

Those five meanings are recorded, including the distinction between interest and its rate.

For five of the schedules, do these one-sentence meanings fit?

- **Amortization Schedule:** Shows how the loan’s debt balance is expected to change across payments.
- **Principal Payment Schedule:** Shows when principal payments are due.
- **Interest Payment Schedule:** Shows when interest payments are due.
- **Interest Calculation Schedule:** Shows when interest is calculated, separately from when it is paid.
- **Interest Rate Reset Schedule:** Shows when a variable interest rate is recalculated.

### Turn 52 — user

Yes, those fit. The amortization schedule is about **scheduled changes in the debt balance over time**, not a record of payments actually received. The principal and interest payment schedules show their respective due dates; the interest calculation schedule shows calculation dates; and the interest rate reset schedule shows when the rate and its resulting value are recalculated.

### Turn 52 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  AmortizationSchedule:\n    meaning: Shows scheduled changes in the loan's debt balance over time, not payments actually received.\n  PrincipalPaymentSchedule:\n    meaning: Shows when principal payments are due.\n  InterestPaymentSchedule:\n    meaning: Shows when interest payments are due.\n  InterestCalculationSchedule:\n    meaning: Shows when interest is calculated, separately from when it is paid.\n  InterestRateResetSchedule:\n    meaning: Shows when a variable interest rate and its resulting value are recalculated."
}
```

### Turn 52 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 52 — assistant

Those schedule meanings are recorded. The amortization schedule describes planned balance changes, not actual receipts.

For the remaining schedule, the two rate kinds, and the security items, do these meanings fit?

- **Loan Payment Schedule:** The loan’s general payment timetable.
- **Fixed Interest Rate:** An applicable numeric rate that does not reset as a variable rate does.
- **Variable Interest Rate:** An applicable numeric rate recalculated according to a rate-reset schedule.
- **Collateral:** Property pledged to support repayment of the loan.
- **Security Agreement:** The agreement granting a financial interest in pledged collateral and setting out rights concerning it.

### Turn 53 — user

Yes, with two refinements to the rate wording:

- A **fixed interest rate** does not fluctuate over the life of the loan.
- A **variable interest rate** is allowed to change over the life of the loan. The rate-reset schedule tells us when resets and resulting rates are recalculated; we check that it’s on file for a variable-rate loan.

The meanings for the general loan payment schedule, collateral, and security agreement fit. The security agreement is distinct from the collateral itself: it establishes the financial interest in what’s pledged.

### Turn 53 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  LoanPaymentSchedule:\n    meaning: The loan's general payment timetable.\n  FixedInterestRate:\n    meaning: An applicable numeric interest rate that does not fluctuate over the life of the loan.\n  VariableInterestRate:\n    meaning: An applicable numeric interest rate allowed to change over the life of the loan, with a reset schedule stating when it and its resulting value are recalculated.\n  Collateral:\n    meaning: Property pledged to support repayment of the loan.\n  SecurityAgreement:\n    meaning: The agreement granting a financial interest in pledged collateral and setting out rights concerning it."
}
```

### Turn 53 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 53 — assistant

Those meanings are recorded with your rate refinements.

For the last two class meanings, do these fit?

- **Payment History:** The loan’s record of payments actually received, made up of individual payment entries.
- **Payment Transaction:** An individual entry in that history recording an actual payment, without assuming it is solely a principal or interest payment.

### Turn 54 — user

Yes. The payment history records actual payments made toward the loan obligation, and the individual payment transactions are the entries that make up that history. A transaction may relate to principal, interest, fees, or other amounts; we shouldn’t assume it covers only one of those.

### Turn 54 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PaymentHistory:\n    meaning: The loan's record of actual payments made toward its obligation, comprising individual payment transactions.\n  PaymentTransaction:\n    meaning: An individual entry recording an actual payment in the loan's payment history, which need not cover only one kind of amount."
}
```

### Turn 54 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 54 — assistant

All class meanings are now recorded. Next, let’s capture alternate names without merging concepts that only sound similar.

For **Loan, Borrower, Lender, Servicer, and Loan Principal**, are there other names people use for the *same thing* in your work? “None” is fine for any of them.

### Turn 55 — user

For these five, I wouldn’t record any alternate names as exact equivalents.

People may say **“principal balance,”** but that usually means the *outstanding amount*, not the principal obligation or the agreed principal amount. I’d keep that distinction rather than add it as another name for loan principal.

### Turn 55 — assistant

No aliases for those five. I’ll keep **principal balance** separate: it usually means the outstanding amount, not Loan Principal or the agreed principal amount.

For **Loan Interest, Principal Repayment Terms, Interest Payment Terms, Prepayment Terms, and Day Count Convention**, are there any other names used for the *same* concept? “None” for the whole group is fine.

### Turn 56 — user

None for that group. I wouldn’t add informal shorthand as exact alternate names, especially where it might blur interest with the interest rate or prepayment terms with principal repayment terms generally.

### Turn 56 — assistant

No aliases for that group either. Since two groups have yielded no exact alternate names, I’ll stop prompting for more; we can add one later if it comes up.

Now for connection meanings. Do these five sentences correctly describe the recorded links?

- **Loan → has borrower → Borrower:** Identifies the party that owes repayment on the loan.
- **Loan → has lender → Lender:** Identifies the party that extended the credit.
- **Loan → serviced by → Servicer:** Identifies the party collecting principal and interest on the lender’s behalf.
- **Loan → has principal → Loan Principal:** Identifies the loan’s principal obligation, not its agreed or outstanding amount alone.
- **Loan → has interest → Loan Interest:** Identifies the loan’s interest obligation, not its interest rate.

### Turn 57 — user

Yes, those describe the five links accurately. In each case the connection starts at the **loan**: it identifies the borrower, lender, servicer, principal, or interest associated with that loan. Keeping the principal and interest links separate from their amounts and from the interest rate is important.

### Turn 57 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasBorrower\n    from: Loan\n    to: Borrower\n    meaning: Identifies the party that owes repayment on the loan.\n  - name: hasLender\n    from: Loan\n    to: Lender\n    meaning: Identifies the party that extended the credit.\n  - name: servicedBy\n    from: Loan\n    to: Servicer\n    meaning: Identifies the party collecting principal and interest on the lender's behalf.\n  - name: hasPrincipal\n    from: Loan\n    to: LoanPrincipal\n    meaning: Identifies the loan's principal obligation, not its agreed or outstanding amount alone.\n  - name: hasInterest\n    from: Loan\n    to: LoanInterest\n    meaning: Identifies the loan's interest obligation, not its interest rate."
}
```

### Turn 57 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 57 — assistant

Those five loan-level connection meanings are recorded.

Do these descriptions fit the terms and rate connections?

- **Principal Repayment Terms → governs payment of → Loan Principal:** Identifies terms governing when and how principal is paid.
- **Interest Payment Terms → governs payment of → Loan Interest:** Identifies terms governing payment of interest.
- **Prepayment Terms → governs payment of → Loan Principal:** Identifies applicable terms for paying principal before maturity.
- **Loan → has applicable interest rate → Fixed Interest Rate:** Identifies the fixed rate applying to the loan, when its rate is fixed.
- **Loan → has applicable interest rate → Variable Interest Rate:** Identifies the variable rate applying to the loan, when its rate is variable.

### Turn 58 — user

Yes, those meanings fit. I’d use **“has interest rate”** for both loan-to-rate links; “applicable” explains the meaning but doesn’t need to be a different connection name.

The prepayment link uses the same **“governs payment of”** wording as principal repayment terms. It applies when prepayment terms exist—it doesn’t imply that every loan has them. And the variable-rate link is what makes the reset-schedule check relevant.

### Turn 58 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [],
  "relationships": [
    {
      "name": "hasApplicableInterestRate",
      "from": "Loan",
      "to": "FixedInterestRate"
    },
    {
      "name": "hasApplicableInterestRate",
      "from": "Loan",
      "to": "VariableInterestRate"
    }
  ],
  "properties": [],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

### Turn 58 — tool

Removed 2 element(s) — relationships: hasApplicableInterestRate (Loan → FixedInterestRate), hasApplicableInterestRate (Loan → VariableInterestRate).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 58 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: governsPaymentOf\n    from: PrincipalRepaymentTerms\n    to: LoanPrincipal\n    meaning: Identifies terms governing when and how the loan's principal is paid.\n  - name: governsPaymentOf\n    from: InterestPaymentTerms\n    to: LoanInterest\n    meaning: Identifies terms governing payment of the loan's interest.\n  - name: governsPaymentOf\n    from: PrepaymentTerms\n    to: LoanPrincipal\n    meaning: Identifies applicable terms for paying the loan's principal before maturity, when such terms exist.\n  - name: hasInterestRate\n    from: Loan\n    to: FixedInterestRate\n    meaning: Identifies the fixed interest rate applying to the loan when its rate is fixed.\n  - name: hasInterestRate\n    from: Loan\n    to: VariableInterestRate\n    meaning: Identifies the variable interest rate applying to the loan when its rate is variable."
}
```

### Turn 58 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 58 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 58 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: "The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms."
    aliases: []
    properties:
      agreedPrincipalAmount:
        type: number
      maturityDate:
        type: date
  Borrower:
    meaning: The party that owes repayment on the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party that provides the credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting principal and interest on the lender's behalf."
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Shows scheduled changes in the loan's debt balance over time, not payments actually received."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: Shows when principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: Shows when interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: "Shows when interest is calculated, separately from when it is paid."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: Shows when a variable interest rate and its resulting value are recalculated.
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: "The loan's general payment timetable."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "The terms stating when and how the loan's principal is to be paid."
    aliases: []
    properties:
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
  InterestPaymentTerms:
    meaning: "The terms stating when interest is paid and how it accrues, pointing to the day-count convention that supplies the accrual basis."
    aliases: []
    properties:
      initialInterestAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      compoundingFrequency:
        type: text
      paymentDay:
        type: text
  PrepaymentTerms:
    meaning: "Terms governing repayment of principal before maturity, which may specify a penalty period."
    aliases: []
    properties:
      prepaymentPenaltyPeriod:
        type: number
        unit: months
  LoanPrincipal:
    meaning: "The amount of the obligation to be repaid, separate from interest; its agreed amount is recorded on the loan and its outstanding amount changes as it is repaid."
    aliases: []
    properties: {}
  LoanInterest:
    meaning: "Interest is the cost of using the credit, distinct from the rate expressing how that cost is charged over time and from principal."
    aliases: []
    properties: {}
  Collateral:
    meaning: Property pledged to support repayment of the loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: The agreement granting a financial interest in pledged collateral and setting out rights concerning it.
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The loan's record of actual payments made toward its obligation, comprising individual payment transactions."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An individual entry recording an actual payment in the loan's payment history, which need not cover only one kind of amount."
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: An applicable numeric interest rate that does not fluctuate over the life of the loan.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An applicable numeric interest rate allowed to change over the life of the loan, with a reset schedule stating when it and its resulting value are recalculated."
    aliases: []
    properties:
      rateValue:
        type: number
  DayCountConvention:
    meaning: The convention used as the day-count basis for calculating accrued interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the party that owes repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the party that extended the credit.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting principal and interest on the lender's behalf."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: LoanPrincipal
    meaning: "Identifies the loan's principal obligation, not its agreed or outstanding amount alone."
    aliases: []
  - name: hasInterest
    from: Loan
    to: LoanInterest
    meaning: "Identifies the loan's interest obligation, not its interest rate."
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: LoanPrincipal
    meaning: null
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: LoanInterest
    meaning: null
    aliases: []
  - name: setsAccrualBasisBy
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count convention that the interest payment terms use as the basis for interest accrual.
    aliases: []
  - name: governsPaymentOf
    from: PrepaymentTerms
    to: LoanPrincipal
    meaning: null
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: null
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: null
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: null
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: null
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: null
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: null
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: Identifies pledged collateral supporting the loan when the loan is backed by pledged collateral; a guaranteed loan does not automatically have this connection.
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: null
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: null
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: PaymentTransaction
    meaning: null
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 58 — assistant

Your wording is clear: both rate links should be named **“has interest rate.”** I need to correct the canvas status: I removed the old “has applicable interest rate” links, but the tool did not accept their replacements in this turn. The two rate connections are **temporarily missing**; I’ll restore them with your wording before relying on them. The three terms-connection meanings you confirmed are also not yet saved.

For the next group of connection meanings, does each Loan-to-schedule link mean that the named schedule is **associated with the loan when it is on file**, without implying it is required for every loan? That would cover the amortization, principal-payment, interest-payment, interest-calculation, interest-rate-reset, and general loan-payment schedules.

### Turn 59 — user

Yes. For each of those six schedules, the link means **that schedule is associated with the loan when it’s on file**. The link alone does not make the schedule mandatory for every loan.

The specific setup checks remain narrower: an amortizing loan needs its amortization schedule, and a variable-rate loan needs its interest rate reset schedule. Principal repayment terms also need to govern the amortizing loan’s principal.

### Turn 59 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasInterestRate\n    from: Loan\n    to: FixedInterestRate\n    meaning: Identifies the fixed interest rate applying to the loan when its rate is fixed.\n  - name: hasInterestRate\n    from: Loan\n    to: VariableInterestRate\n    meaning: Identifies the variable interest rate applying to the loan when its rate is variable.\n  - name: governsPaymentOf\n    from: PrincipalRepaymentTerms\n    to: LoanPrincipal\n    meaning: Identifies terms governing when and how the loan's principal is paid.\n  - name: governsPaymentOf\n    from: InterestPaymentTerms\n    to: LoanInterest\n    meaning: Identifies terms governing payment of the loan's interest.\n  - name: governsPaymentOf\n    from: PrepaymentTerms\n    to: LoanPrincipal\n    meaning: Identifies applicable terms for paying the loan's principal before maturity, when such terms exist.\n  - name: hasAmortizationSchedule\n    from: Loan\n    to: AmortizationSchedule\n    meaning: Identifies an amortization schedule associated with the loan when on file; it is not required for every loan.\n  - name: hasPrincipalPaymentSchedule\n    from: Loan\n    to: PrincipalPaymentSchedule\n    meaning: Identifies a principal payment schedule associated with the loan when on file; it is not required for every loan.\n  - name: hasInterestPaymentSchedule\n    from: Loan\n    to: InterestPaymentSchedule\n    meaning: Identifies an interest payment schedule associated with the loan when on file; it is not required for every loan.\n  - name: hasInterestCalculationSchedule\n    from: Loan\n    to: InterestCalculationSchedule\n    meaning: Identifies an interest calculation schedule associated with the loan when on file; it is not required for every loan.\n  - name: hasInterestRateResetSchedule\n    from: Loan\n    to: InterestRateResetSchedule\n    meaning: Identifies an interest rate reset schedule associated with the loan when on file; it is not required for every loan.\n  - name: hasLoanPaymentSchedule\n    from: Loan\n    to: LoanPaymentSchedule\n    meaning: Identifies a general payment schedule associated with the loan when on file; it is not required for every loan."
}
```

### Turn 59 — tool

Applied. Added 2, updated 9 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 59 — assistant

The rate links are restored as **has interest rate**, and the confirmed terms and six schedule-link meanings are now saved. Each schedule link means “on file when applicable,” not “always required.”

Do these meanings fit the three remaining connections?

- **Security Agreement → secures → Collateral:** Identifies the agreement granting a financial interest in the pledged collateral.
- **Loan → has payment history → Payment History:** Identifies the loan’s record of actual payments.
- **Payment History → has individual payment → Payment Transaction:** Identifies an actual payment entry in that history, without assuming it covers only one kind of amount.

### Turn 60 — user

Yes, those three meanings fit. The **security agreement secures the collateral**, not the other way around. The **loan has the payment history**, and that history has its **individual payment transactions**. The last connection doesn’t imply that a transaction covers only principal or only interest.

### Turn 60 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: secures\n    from: SecurityAgreement\n    to: Collateral\n    meaning: Identifies the agreement granting a financial interest in the pledged collateral.\n  - name: hasPaymentHistory\n    from: Loan\n    to: PaymentHistory\n    meaning: Identifies the loan's record of actual payments.\n  - name: hasIndividualPayment\n    from: PaymentHistory\n    to: PaymentTransaction\n    meaning: Identifies an actual payment entry in the history without assuming it covers only one kind of amount."
}
```

### Turn 60 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 60 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 60 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: "The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms."
    aliases: []
    properties:
      agreedPrincipalAmount:
        type: number
      maturityDate:
        type: date
  Borrower:
    meaning: The party that owes repayment on the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party that provides the credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting principal and interest on the lender's behalf."
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Shows scheduled changes in the loan's debt balance over time, not payments actually received."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: Shows when principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: Shows when interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: "Shows when interest is calculated, separately from when it is paid."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: Shows when a variable interest rate and its resulting value are recalculated.
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: "The loan's general payment timetable."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "The terms stating when and how the loan's principal is to be paid."
    aliases: []
    properties:
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
  InterestPaymentTerms:
    meaning: "The terms stating when interest is paid and how it accrues, pointing to the day-count convention that supplies the accrual basis."
    aliases: []
    properties:
      initialInterestAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      compoundingFrequency:
        type: text
      paymentDay:
        type: text
  PrepaymentTerms:
    meaning: "Terms governing repayment of principal before maturity, which may specify a penalty period."
    aliases: []
    properties:
      prepaymentPenaltyPeriod:
        type: number
        unit: months
  LoanPrincipal:
    meaning: "The amount of the obligation to be repaid, separate from interest; its agreed amount is recorded on the loan and its outstanding amount changes as it is repaid."
    aliases: []
    properties: {}
  LoanInterest:
    meaning: "Interest is the cost of using the credit, distinct from the rate expressing how that cost is charged over time and from principal."
    aliases: []
    properties: {}
  Collateral:
    meaning: Property pledged to support repayment of the loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: The agreement granting a financial interest in pledged collateral and setting out rights concerning it.
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The loan's record of actual payments made toward its obligation, comprising individual payment transactions."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An individual entry recording an actual payment in the loan's payment history, which need not cover only one kind of amount."
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: An applicable numeric interest rate that does not fluctuate over the life of the loan.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An applicable numeric interest rate allowed to change over the life of the loan, with a reset schedule stating when it and its resulting value are recalculated."
    aliases: []
    properties:
      rateValue:
        type: number
  DayCountConvention:
    meaning: The convention used as the day-count basis for calculating accrued interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the party that owes repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the party that extended the credit.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting principal and interest on the lender's behalf."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: LoanPrincipal
    meaning: "Identifies the loan's principal obligation, not its agreed or outstanding amount alone."
    aliases: []
  - name: hasInterest
    from: Loan
    to: LoanInterest
    meaning: "Identifies the loan's interest obligation, not its interest rate."
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: LoanPrincipal
    meaning: "Identifies terms governing when and how the loan's principal is paid."
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: LoanInterest
    meaning: "Identifies terms governing payment of the loan's interest."
    aliases: []
  - name: setsAccrualBasisBy
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count convention that the interest payment terms use as the basis for interest accrual.
    aliases: []
  - name: governsPaymentOf
    from: PrepaymentTerms
    to: LoanPrincipal
    meaning: "Identifies applicable terms for paying the loan's principal before maturity, when such terms exist."
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies an amortization schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies a principal payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies an interest payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies an interest calculation schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies an interest rate reset schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies a general payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: Identifies pledged collateral supporting the loan when the loan is backed by pledged collateral; a guaranteed loan does not automatically have this connection.
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the agreement granting a financial interest in the pledged collateral.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of actual payments."
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: PaymentTransaction
    meaning: Identifies an actual payment entry in the history without assuming it covers only one kind of amount.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applying to the loan when its rate is fixed.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applying to the loan when its rate is variable.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 60 — assistant

I checked the canvas: every class and relationship now has a plain-language meaning, including the restored rate links. No exact aliases were confirmed, so none were added.

Does that complete the language pass accurately? If so, the next step is to check which recorded values have fixed choices and what happens when a value is missing or wrong.

### Turn 61 — user

Yes, the language pass is accurate. We’ve kept the distinct schedules, terms, rates, and payment records separate, and the connection directions are right.

We can move on to fixed choices and missing or invalid values. We should distinguish a value that’s simply recorded from one whose absence blocks a particular review.

### Turn 61 — assistant

Agreed: a recorded value is not automatically a prerequisite for every review.

Do **principal payment frequency**, **interest payment frequency**, and **interest compounding frequency** each have a small, fixed set of allowed values in your work? If so, what are the allowed values for each? If the governing terms can use wording beyond a fixed list, we’ll leave that property unrestricted.

### Turn 62 — user

We haven’t established a fixed list for any of those three. **Principal payment frequency**, **interest payment frequency**, and **compounding frequency** are recorded as text from the governing terms, so I’d leave them unrestricted here rather than invent allowed values.

### Turn 62 — assistant

I’ll leave those three frequencies as unrestricted text from the governing terms.

For each of these four values, what would go wrong if it were **missing or wrong** during the agreed questions or reviews? Please answer separately for **agreed principal amount**, **maturity date**, **fixed rate value**, and **variable rate value**. I’ll use that to distinguish a value the agent can report from one that must block a review.

### Turn 63 — user

They each matter to an answer, but **none is an established blocking condition for the five reviews**. I’d handle them separately:

- **Agreed principal amount:** If missing, the agent can’t report the amount originally agreed; if wrong, it reports the wrong obligation. Don’t substitute the changing loan balance or outstanding principal.
- **Maturity date:** If missing, the agent can’t say when the loan matures; if wrong, it gives the wrong date.
- **Fixed rate value:** If missing or wrong, the agent can’t reliably state the fixed rate that applies. That’s distinct from confirming that the loan has a fixed-rate record.
- **Variable rate value:** The same issue applies to stating the recorded variable rate. The variable-rate setup review, specifically, checks for a variable rate **and a reset schedule** on the loan; we haven’t established a separate numeric-rate validation that blocks that review.

I’d flag missing or suspect values for correction, without turning that into a new review prerequisite.

### Turn 63 — assistant

I’ll treat those four values as necessary for reliable answers, but not as newly established blockers for the five reviews. A missing or suspect value should be flagged, without substituting another amount or rate.

For the **Principal Repayment Terms** values, what breaks if each is missing or wrong: **initial principal payment date**, **principal repayment date**, **payment frequency**, and **payment day**? Please distinguish an answer the agent cannot give from any review that must be left undecided.

### Turn 64 — user

For each, a missing value limits what the agent can say about **when principal is due**; a wrong value could give a misleading answer:

- **Initial principal payment date:** It can’t state when principal payments first begin.
- **Principal repayment date:** It can’t state the recorded repayment date.
- **Payment frequency:** It can’t describe how often principal payments are due.
- **Payment day:** It can’t give the payment-day wording specified in the terms.

None of those four fields is, by itself, an established blocker for one of our five reviews. For an **amortizing loan**, the specific check is whether an amortization schedule is on the loan and principal repayment terms govern its principal. If one of these values is missing or suspect, flag the incomplete terms and qualify the answer—but don’t silently turn the amortization check into field-by-field validation.

### Turn 64 — assistant

I’ll keep those four principal-term values as answer-quality checks, not blockers for the amortizing-loan review. Missing or suspect wording should be flagged, while that review still checks the schedule link and governing principal terms.

For **Interest Payment Terms**, what breaks if each value is missing or wrong: **initial interest accrual date**, **initial interest payment date**, **final interest payment date**, **payment frequency**, **payment day**, and **compounding frequency**? Please distinguish a limited answer from a review that must remain undecided.

### Turn 65 — user

Each missing value limits a specific answer; a wrong value could misstate the agreed terms:

- **Initial interest accrual date:** We can’t say when interest starts accruing.
- **Initial interest payment date:** We can’t say when interest payments first begin.
- **Final interest payment date:** We can’t say when the last interest payment is due.
- **Payment frequency:** We can’t say how often interest is due.
- **Payment day:** We can’t give the payment-day wording in the terms.
- **Compounding frequency:** We can’t say how often interest compounds.

None is individually an established blocker for the **loan-readiness review**. That review checks for the borrower and lender and, on an interest-bearing loan, terms governing payment of interest. Missing or suspect fields should be flagged and the answer qualified; they don’t turn that review into a field-by-field validation. The day-count convention is a separate connection used to explain the accrual basis.

### Turn 65 — assistant

I’ll treat those six interest-term values as limits on the answers, not individual blockers for the readiness review. The day-count convention remains a separate connection for explaining accrual.

For the last recorded property, **prepayment penalty period**: what breaks if its number of months is missing or wrong? In particular, when prepayment terms exist but specify no penalty period, should the timing review report “no penalty period recorded,” or leave the result undecided?

### Turn 66 — user

If the number of months is missing, the agent can report **“no prepayment penalty period recorded”** but cannot confirm penalty timing in the review. That is not the same as saying there is no penalty: prepayment terms can exist without a recorded penalty period.

If the number is wrong, the agent could report the wrong period. It should flag a suspected error rather than decide whether a particular early payment incurs a charge.

### Turn 66 — assistant

I’ll keep the penalty period as a number of months without inventing an allowed range. If no period is recorded, the timing review can say **“no prepayment penalty period recorded,”** but cannot confirm the penalty timing or conclude that no penalty exists. A suspect number should be flagged, not used to decide whether a particular payment incurs a charge.

That completes the fixed-choice and missing-value pass: no fixed lists were established, and missing term values limit answers without becoming new blockers for the other reviews. Is that accurate before we define the reviews’ decision conditions?

### Turn 67 — user

Yes, that’s accurate. We haven’t established fixed lists or numeric ranges for those values. Missing or suspect term values limit the answers and should be flagged, but they don’t create new blockers for the other reviews.

The prepayment timing review is the exception we discussed: it **cannot confirm a recorded penalty period** when the number of months is absent. That still doesn’t establish that a penalty does not apply.

### Turn 67 — assistant

Confirmed. The prepayment timing review cannot confirm a penalty period without a recorded number of months, and absence does not prove that no penalty applies.

For the **servicing hand-off readiness review**, you’ve identified a borrower, a lender, and—for an interest-bearing loan—interest payment terms governing its interest. Is that the complete condition list for a positive readiness result, or must this review also check another specific connection we’ve recorded?

### Turn 68 — user

For this **specific readiness review**, the core checks are the borrower and lender links and the interest setup: the loan has an applicable **fixed or variable interest rate**, and interest payment terms govern payment of its interest.

So I’d make the rate connection explicit in your condition list, rather than checking only the interest payment terms. This review does not also require a payment schedule, servicer, collateral, or payment-history entry; those are addressed separately.

### Turn 68 — assistant

I’ll include the **applicable fixed or variable rate** in readiness, alongside the borrower and lender links and the terms governing interest payment. I won’t add schedules, servicer, collateral, or payment history to this particular review.

One condition needs clarification before I record the rule: is the rate-and-interest-terms check required **only when the loan is known to be interest-bearing**, or for every loan in this review?

### Turn 69 — user

The rate-and-interest-terms check applies **when the loan is interest-bearing**. It is not a rule that every loan must have an interest rate.

For an interest-bearing loan, confirm both an applicable fixed or variable rate and terms governing payment of its interest. If we don’t know whether the loan is interest-bearing, leave that part of readiness undecided rather than treating missing links as proof that it isn’t. The borrower and lender checks still apply.

### Turn 69 — assistant

The readiness conditions are clear, but I haven’t recorded the rule yet: the model has no confirmed way to tell whether a loan is interest-bearing, so it cannot safely apply that conditional check.

Where would the agent establish that a particular loan **is interest-bearing**—from recorded loan terms, a loan description, or another source? If that information is unavailable, I’ll preserve your instruction to leave that part of readiness undecided.

### Turn 70 — user

We haven’t established a separate field or source that definitively says whether a loan is interest-bearing. An applicable fixed or variable rate is evidence of its interest setup, but **no rate link is not proof that the loan bears no interest**.

If the governing loan terms establish that interest is payable, apply the rate-and-interest-payment-terms check. If that fact can’t be established, leave that part of readiness undecided and report the missing basis; the borrower and lender checks can still be made.

### Turn 70 — assistant

I’ll keep “no rate link” from being interpreted as “no interest is payable.” The borrower and lender checks can proceed, while the interest portion remains undecided unless the governing terms establish that interest is payable.

To make that verification step usable, how does the agent access the **governing loan terms** independently of the interest-payment-terms link it is checking? Are they a record it can retrieve, or does a person or external source have to establish the fact?

### Turn 71 — user

We haven’t established a separate, retrievable **governing loan terms** record or a connection to one that would let the agent make that determination independently. My earlier wording suggested a route we haven’t actually mapped.

If the interest-bearing nature of the loan is established from the governing agreement by a person or another authoritative source, the agent can apply the interest-setup check. Otherwise, it can check the borrower and lender links, but should leave the interest portion undecided—not treat a missing rate or interest-payment-terms link as proof that no interest is payable.

### Turn 71 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  servicingHandoffReadiness:\n    conditions:\n      - Confirm the loan has a borrower through hasBorrower and a lender through hasLender.\n      - When an authoritative source outside this model establishes that interest is payable, confirm the loan has an applicable fixed or variable interest rate through hasInterestRate and interest payment terms govern its LoanInterest through governsPaymentOf.\n      - If whether interest is payable has not been independently established, leave the interest portion undecided; absence of an interest rate or interest payment terms does not prove that interest is not payable."
}
```

### Turn 71 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 71 — assistant

I’ve recorded the readiness rule with that limit: it checks borrower and lender, and checks the rate and interest payment terms only when an authoritative source has established that interest is payable. Otherwise, the interest portion stays undecided.

For the **secured-loan support review**, is this the exact condition: once the loan is independently known to be backed by pledged collateral, confirm its **collateralized by → Collateral** link; if that backing is not established, do not infer it from a missing link? A guaranteed loan alone would not trigger this collateral check.

### Turn 72 — user

Yes—that’s the safe way to apply this **collateral-link check**. Once it’s established that the loan is backed by pledged collateral, confirm that the loan is linked to the collateral. A missing link then means the recorded support is incomplete.

Don’t infer from a missing link that the loan isn’t collateral-backed. And a loan identified only as guaranteed doesn’t, for that reason alone, trigger this collateral check. The security agreement is a separate matter, not a prerequisite for this review.

### Turn 72 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  collateralSupportRecorded:\n    conditions:\n      - When an authoritative source independently establishes that the loan is backed by pledged collateral, confirm that Loan collateralizedBy Collateral is recorded.\n      - If collateral backing has not been independently established, leave applicability of the collateral-link check undecided; a missing collateralizedBy link does not prove the loan is not collateral-backed.\n      - Identification as guaranteed alone does not trigger this check; finding a SecurityAgreement that secures the Collateral is not a precondition of this check."
}
```

### Turn 72 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 72 — assistant

The collateral-link rule is recorded. It applies when pledged-collateral backing is independently established; a guarantee alone does not trigger it, and the security agreement is not a prerequisite.

For the **variable-rate setup review**, is a Loan’s **hasInterestRate → VariableInterestRate** link enough to establish that this review applies, with a positive result requiring the Loan’s **hasInterestRateResetSchedule** link? If neither rate link is found, should the rate type remain undecided rather than treating the loan as fixed-rate?

### Turn 73 — user

Yes. A recorded **variable interest rate** on the loan establishes that this review applies. To confirm the setup, also find the loan’s **interest rate reset schedule**. If the variable rate is present but that schedule is missing, the setup cannot be confirmed.

If neither a fixed nor a variable rate is found, leave the rate type undecided. Don’t treat a missing variable-rate link as evidence that the loan is fixed-rate.

### Turn 73 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  variableRateSetupRecorded:\n    conditions:\n      - When Loan hasInterestRate VariableInterestRate is recorded, confirm Loan hasInterestRateResetSchedule InterestRateResetSchedule is also recorded.\n      - If a variable interest rate is recorded but no interest rate reset schedule is linked to the loan, variable-rate setup cannot be confirmed.\n      - If neither a fixed nor a variable hasInterestRate link is recorded, leave the rate type undecided rather than inferring fixed-rate status."
}
```

### Turn 73 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 73 — assistant

The variable-rate rule is recorded: a variable-rate link triggers the reset-schedule check; no rate link leaves the rate type undecided.

For the **payment-record completeness review**, is a positive result exactly that the Loan has a **Payment History** and that history has at least one **individual Payment Transaction**? What should the review report if the history exists but has no recorded transactions?

### Turn 74 — user

Yes. To confirm payment-record completeness for this review, the loan needs a **payment history** with at least one **individual payment transaction** recorded in it.

If the history exists but has no recorded transactions, report that the payment history is present but has **no individual payments recorded**, so the review cannot confirm completeness. That doesn’t, by itself, prove the borrower has never made a payment; it tells us what the record contains.

### Turn 74 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  paymentRecordComplete:\n    conditions:\n      - Confirm Loan hasPaymentHistory PaymentHistory and that PaymentHistory hasIndividualPayment at least one PaymentTransaction.\n      - If a history is present but has no individual payment transactions recorded, report no individual payments recorded and do not confirm completeness; do not infer that no payment was ever made."
}
```

### Turn 74 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 74 — assistant

The payment-record rule is recorded: it requires a history with at least one individual transaction. An empty recorded history does not prove no payment was ever made.

For the **prepayment penalty timing review**, should the rule first find applicable Prepayment Terms through the loan’s principal, then confirm a penalty period **only if** `prepaymentPenaltyPeriod` is recorded in months? If the terms or period are absent, what distinct result should it report for each case?

### Turn 75 — user

Yes. Start with the loan’s principal and look for applicable **prepayment terms** governing its payment. If those terms have a penalty period recorded as a number of months, the review can confirm the recorded timing.

Keep the two missing cases distinct:

- **No applicable prepayment terms found:** The agent cannot establish what prepayment terms apply, so it cannot confirm penalty timing. It should not conclude that prepayment is prohibited or that there is no penalty.
- **Prepayment terms found, but no penalty period recorded:** Report that the terms are present but **no prepayment penalty period is recorded**. The timing review still cannot confirm a period; absence does not prove that no penalty applies.

### Turn 75 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  prepaymentPenaltyTimingRecorded:\n    conditions:\n      - Find Loan hasPrincipal LoanPrincipal and applicable PrepaymentTerms governsPaymentOf that LoanPrincipal; if prepaymentPenaltyPeriod is recorded in months, confirm the recorded penalty timing.\n      - If no applicable PrepaymentTerms are found, leave what prepayment terms apply and penalty timing unconfirmed; do not infer that prepayment is prohibited or penalty-free.\n      - If PrepaymentTerms are found but prepaymentPenaltyPeriod is absent, report no prepayment penalty period recorded and do not confirm penalty timing or infer that no penalty applies."
}
```

### Turn 75 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 75 — assistant

The prepayment rule is recorded with those two distinct missing cases. We now have conditions for all five agreed reviews.

One narrower setup check also came up in the schedule questions: **for an amortizing loan**, confirm both its amortization schedule and principal repayment terms governing its principal. Since we have no recorded source for the loan’s amortizing description, should that check run only when a person or other authoritative source has established that structure, and otherwise remain undecided?

### Turn 76 — user

Yes. Run that check only once the loan’s **amortizing structure** has been established independently. Then confirm both that the loan has an amortization schedule and that principal repayment terms govern its principal.

If the structure hasn’t been established, leave the check undecided. Don’t use the presence of an amortization schedule to decide that the loan is amortizing—it’s one of the things the check is meant to verify.

### Turn 76 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  amortizingSetupRecorded:\n    conditions:\n      - When an authoritative source independently establishes that the loan is amortizing, confirm Loan hasAmortizationSchedule AmortizationSchedule and that PrincipalRepaymentTerms governsPaymentOf its LoanPrincipal reached by hasPrincipal.\n      - If amortizing structure has not been independently established, leave the check undecided; the presence or absence of an amortization schedule alone does not establish that structure."
}
```

### Turn 76 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 76 — assistant

The amortizing-loan check is recorded with independent confirmation of the loan’s structure as its trigger. It then checks both the amortization-schedule link and principal repayment terms governing the loan’s principal; the schedule cannot establish its own applicability.

That completes the decision rules for the five reviews, plus this specific amortizing setup check. Is that accurate before I record each review action’s input, reported result, and verification step?

### Turn 77 — user

Yes. We have conditions for the five agreed review actions and a separate amortizing-loan setup check. I wouldn’t silently turn that additional check into a sixth review action.

For each action, we can now state what loan it takes, what must be established before it runs, what it can confirm or leave undecided, and which recorded links or values verify the result.

### Turn 77 — assistant

Agreed: the amortizing setup check remains a rule, not a sixth action. Each of the five review actions takes a **Loan** and reports a finding; none changes the loan record.

For **assess servicing hand-off readiness**, should I record this action?

- **Input:** Loan
- **Condition:** `servicingHandoffReadiness`
- **Result:** Report whether the borrower and lender are identified and, when an authoritative source establishes that interest is payable, whether an applicable rate and interest payment terms are recorded. Leave the interest portion undecided when that basis is unavailable.
- **Verification:** Recheck the Loan’s borrower, lender, and applicable rate links, and the interest payment terms governing its Loan Interest; confirm the finding matches what those links and the independently established interest-bearing fact support.

### Turn 78 — user

Yes, that captures the action. It takes a loan and reports a finding; it doesn’t change the record.

For a positive finding, verify the borrower and lender links. If interest is independently established as payable, also verify a fixed or variable interest rate on the loan and interest payment terms governing its interest. If that independent basis is unavailable, report the party checks separately and leave the interest portion undecided. Don’t let a missing rate link stand in for a finding that no interest is payable.

### Turn 78 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  assessServicingHandoffReadiness:\n    input: Loan\n    preconditions: [servicingHandoffReadiness]\n    effect: Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record.\n    verification: Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate and InterestPaymentTerms governsPaymentOf the LoanInterest reached through hasInterest. Confirm the report reflects the links and leaves unsupported interest conclusions undecided."
}
```

### Turn 78 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "assessServicingHandoffReadiness" has input class Loan, and its precondition servicingHandoffReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Loan to InterestPaymentTerms. Rewording the text does not create the path it assumes.

### Turn 78 — assistant

The hand-off action is recorded. The canvas raised a navigation warning: from **Loan → Loan Interest**, the link to **Interest Payment Terms** points back toward Loan Interest. Our conversation established finding terms by looking for those that govern the identified interest, but the canvas cannot currently follow that search as a directed path. I won’t reverse the confirmed connection just to clear the warning.

In practice, can the agent **search Interest Payment Terms for records whose “governs payment of” link targets this loan’s interest**, or is there another recorded route it should follow?

### Turn 79 — user

Yes. Identify the loan’s interest first, then **search the interest payment terms for those whose “governs payment of” link points to that interest**. That is a reverse lookup over the recorded connection, not a new connection or a reversal of its direction.

If the agent cannot perform that reverse lookup, it cannot verify the terms portion of the hand-off check from the connections we’ve established. It should report that limitation rather than assume terms are present.

### Turn 79 — assistant

Understood. The hand-off action must use a **reverse lookup**: find Interest Payment Terms whose `governsPaymentOf` link targets the Loan Interest identified from the Loan. That does not change the link’s direction. The canvas warning remains a genuine limitation of its directed-path check; if the agent cannot perform the reverse lookup, it must report that it cannot verify the terms portion.

For **verify secured-loan support**, should I record an action taking a Loan, using `collateralSupportRecorded`, reporting whether a pledged-collateral loan has a `collateralizedBy` link, and verifying the finding by rereading that link? It would leave applicability undecided without independent evidence of pledged backing and would **not** require a Security Agreement for this review.

### Turn 80 — user

Yes. Take the loan, first establish independently that this is a **pledged-collateral case**, then check whether the loan is linked to the collateral. The result reports whether that support is recorded, and verification rereads the loan-to-collateral link.

If pledged backing hasn’t been established, leave applicability undecided rather than infer it from the link’s absence. Don’t require the security agreement for this particular review.

### Turn 80 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  verifySecuredLoanSupport:\n    input: Loan\n    preconditions: [collateralSupportRecorded]\n    effect: Report whether pledged-collateral support is recorded when pledged backing has been independently established; otherwise report applicability undecided. Do not change the loan record or require a security agreement for this review.\n    verification: When pledged backing is independently established, reread Loan collateralizedBy Collateral and confirm the reported finding matches the recorded link; if backing is unestablished, confirm no conclusion is inferred from an absent link."
}
```

### Turn 80 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "verifySecuredLoanSupport" has input class Loan, and its precondition collateralSupportRecorded refers to SecurityAgreement, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Loan to SecurityAgreement. Rewording the text does not create the path it assumes.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 80 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  collateralSupportRecorded:\n    conditions:\n      - When an authoritative source independently establishes that the loan is backed by pledged collateral, confirm that Loan collateralizedBy Collateral is recorded.\n      - If collateral backing has not been independently established, leave applicability of the collateral-link check undecided; a missing collateralizedBy link does not prove the loan is not collateral-backed.\n      - Identification as guaranteed alone does not trigger this check; this rule checks only the Loan collateralizedBy Collateral link."
}
```

### Turn 80 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "verifySecuredLoanSupport" has input class Loan, and its effect refers to SecurityAgreement, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Loan to SecurityAgreement. Rewording the text does not create the path it assumes.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 80 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  verifySecuredLoanSupport:\n    input: Loan\n    preconditions: [collateralSupportRecorded]\n    effect: Report whether pledged-collateral support is recorded when pledged backing has been independently established; otherwise report applicability undecided. Do not change the loan record.\n    verification: When pledged backing is independently established, reread Loan collateralizedBy Collateral and confirm the finding matches the recorded link; when backing is unestablished, confirm no conclusion is inferred from an absent link."
}
```

### Turn 80 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 80 — assistant

The secured-support action is recorded. It checks the Loan-to-Collateral link only when pledged backing has been independently established; otherwise it leaves applicability undecided. I also removed an incidental Security Agreement reference from this action because that agreement is not part of this review. The separate directed-path warning for the hand-off action remains; your confirmed reverse lookup explains how its terms check works.

For **review variable-rate setup**, should the action take a Loan, use `variableRateSetupRecorded`, report whether a recorded Variable Interest Rate is accompanied by an Interest Rate Reset Schedule, and verify the finding by rereading those two loan links? If neither rate kind is recorded, it would leave the rate type undecided.

### Turn 81 — user

Yes. The input is the loan. A **variable interest rate recorded on it** makes this review applicable; confirm that the loan also has an **interest rate reset schedule**. Verify the finding by rereading those two loan links.

If neither rate kind is recorded, report that the rate type is undecided rather than treating the loan as fixed-rate. This review doesn’t calculate the next rate or reconstruct past resets.

### Turn 81 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  reviewVariableRateSetup:\n    input: Loan\n    preconditions: [variableRateSetupRecorded]\n    effect: Report whether a recorded variable interest rate is accompanied by an interest rate reset schedule; if neither rate kind is recorded, report rate type undecided. Do not calculate future or past rate values or change the loan record.\n    verification: Reread Loan hasInterestRate VariableInterestRate and Loan hasInterestRateResetSchedule InterestRateResetSchedule; if neither Loan hasInterestRate VariableInterestRate nor Loan hasInterestRate FixedInterestRate is recorded, confirm the report leaves rate type undecided."
}
```

### Turn 81 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 81 — assistant

The variable-rate action is recorded. It reports the rate-and-reset-schedule finding without attempting to calculate a past or future rate.

For **check payment-record completeness**, should the action take a Loan, use `paymentRecordComplete`, report whether its Payment History has at least one individual Payment Transaction, and verify by rereading those two links? If the history is present but empty, it would report **“no individual payments recorded”** without concluding that no payment was ever made.

### Turn 82 — user

Yes. Take the loan, find its **payment history**, then check that the history has at least one **individual payment transaction**. Verify the finding by rereading both links.

If the history is present but has no entries, report **“no individual payments recorded”** and don’t infer that no payment was ever made. If there’s no payment history linked at all, report that separately—the agent can’t confirm payment-record completeness in either case.

### Turn 82 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  paymentRecordComplete:\n    conditions:\n      - Confirm Loan hasPaymentHistory PaymentHistory and that PaymentHistory hasIndividualPayment at least one PaymentTransaction.\n      - If a history is present but has no individual payment transactions recorded, report no individual payments recorded and do not confirm completeness; do not infer that no payment was ever made.\n      - If the Loan hasPaymentHistory link is absent, report no linked payment history separately and do not confirm completeness."
}
```

### Turn 82 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 82 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  checkPaymentRecordCompleteness:\n    input: Loan\n    preconditions: [paymentRecordComplete]\n    effect: Report whether a linked PaymentHistory has at least one individual PaymentTransaction; distinguish no linked history from linked history with no individual payments recorded. Do not infer from either absence that no payment was ever made or change the loan record.\n    verification: Reread Loan hasPaymentHistory PaymentHistory and PaymentHistory hasIndividualPayment PaymentTransaction and confirm the report distinguishes no history, an empty linked history, and a history with at least one entry."
}
```

### Turn 82 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 82 — assistant

I’ve updated the payment-record rule to distinguish **no linked history** from **a linked history with no individual payments**. The action you confirmed has **not yet been saved**; I’ll include it in the next update.

For the final action, **review recorded prepayment penalty timing**: should it take a Loan, use `prepaymentPenaltyTimingRecorded`, report a penalty period only when applicable Prepayment Terms record one in months, and verify by finding those terms through the Loan Principal and rereading the period? It would report “no applicable prepayment terms found” separately from “terms found, but no penalty period recorded,” without deciding whether a particular payment incurs a charge.

### Turn 83 — user

Yes. Take the loan, identify its principal, then find any applicable **prepayment terms that govern payment of that principal**. If they record a penalty period in months, report and verify that recorded period.

Keep the two other findings separate: **no applicable prepayment terms found**, and **terms found but no penalty period recorded**. Neither finding decides whether a particular early payment incurs a charge. Verification should check both that the terms govern this loan’s principal and that the period reported matches what those terms record.

### Turn 83 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  checkPaymentRecordCompleteness:\n    input: Loan\n    preconditions: [paymentRecordComplete]\n    effect: Report whether a linked PaymentHistory has at least one individual PaymentTransaction; distinguish no linked history from linked history with no individual payments recorded. Neither absence establishes that no payment was ever made. Do not change the loan record.\n    verification: Reread Loan hasPaymentHistory PaymentHistory and PaymentHistory hasIndividualPayment PaymentTransaction; confirm the report distinguishes no history, an empty linked history, and a history with at least one entry.\n  reviewRecordedPrepaymentPenaltyTiming:\n    input: Loan\n    preconditions: [prepaymentPenaltyTimingRecorded]\n    effect: Report the recorded prepayment penalty period in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded period. Do not decide whether a particular early payment incurs a charge or change the loan record.\n    verification: Identify the LoanPrincipal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm that any reported period matches its prepaymentPenaltyPeriod; distinguish absent terms from a missing period."
}
```

### Turn 83 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "reviewRecordedPrepaymentPenaltyTiming" has input class Loan, and its precondition prepaymentPenaltyTimingRecorded refers to PrepaymentTerms, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Loan to PrepaymentTerms. Rewording the text does not create the path it assumes.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 83 — assistant

All five review actions are now saved, including the payment-record action that was pending. Each takes a Loan, reports a finding without changing the record, and has a verification step. The amortizing setup check remains a separate rule, not a sixth action.

The canvas reports a directed-path warning for the prepayment action, as it did for hand-off: from the Loan, the agent must search for terms whose `governsPaymentOf` link points to its principal. That reverse lookup matches the route you confirmed; I won’t reverse the relationship or invent a direct one to silence the warning. If reverse lookup is unavailable, that part of the review cannot be verified.

Is this an accurate recap of the five actions and their remaining navigation limitation?

### Turn 84 — user

Yes, that’s accurate. All five actions report and verify findings without changing the loan, and the amortizing setup check remains a separate rule.

The hand-off and prepayment actions need reverse lookups for terms governing the loan’s interest or principal. The recorded links still point **from the terms to the obligation**. If the agent cannot search them in reverse, it must report that it cannot verify those portions—not treat the missing directed path as evidence that the terms are absent.

### Turn 84 — assistant

Confirmed. The two warnings reflect reverse lookups the agent must perform, not missing terms or a reason to change the link directions. The five actions are recorded as read-only reviews.

Before validation, I want to make one bounded check for nearby information the original questions may have missed. For **Loan**, beyond the parties, obligations, terms, rates, schedules, collateral, and payment history already modeled, is there a **related agreement, responsible party, or measured amount** the agent must use for one of the agreed questions or reviews? “No, those are covered” is sufficient.

### Turn 85 — user

No—those are covered for the agreed questions and five reviews. We haven’t identified another agreement, responsible party, or measured amount that any of those checks needs.

### Turn 85 — assistant

The Loan’s nearby agreements, parties, and measured amounts are covered for this scope; I won’t add anything from that check.

For the **governing terms and schedules** as a group, are we missing any related timing stages, inputs, or outputs that the agent must use for the agreed questions or reviews, beyond the dates, frequencies, convention, and on-file schedule links already captured? “No” is sufficient.

### Turn 86 — user

No. For the agreed questions and reviews, the dates, frequencies, day-count convention, and applicable schedule links cover the timing information we’ve identified. I wouldn’t add another timing stage, input, or output as a requirement for these checks.

### Turn 86 — assistant

No additional timing stage, input, or output is needed for the agreed terms and schedule questions.

For **Collateral and Security Agreement**, are we missing a related agreement, responsible party, or supporting part that the agent must follow to answer which collateral is pledged and which agreement secures it? “No, the two recorded links are enough” is fine.

### Turn 87 — user

No, the two recorded links are enough for those questions. The loan’s **collateralized-by** link identifies the pledged collateral; the **security agreement’s secures** link identifies which collateral it covers. Finding the agreement may require searching for agreements that secure the identified collateral. It isn’t a prerequisite for the collateral-link review.

### Turn 87 — assistant

The security links are enough for this scope. Finding the agreement may require a reverse lookup from the identified Collateral, but it remains separate from the collateral-link review.

For **Payment History and Payment Transaction**, are we missing any related entries, responsible parties, or measurements needed for the agreed payment questions and completeness review? We have the history and its individual entries, but have not established transaction dates or amounts. “No” is sufficient.

### Turn 88 — user

No additional entries, parties, or measurements are established for this scope. The loan’s payment history and its individual transactions support identifying **which payments are recorded** and checking whether the history has entries.

They do not yet support saying **when or how much** was received. We’d need confirmed transaction details to answer those questions reliably.

### Turn 88 — assistant

The bounded expansion pass found no additional items to add. For the agreed scope, the history and its entries support identifying **which payments are recorded** and checking whether entries exist—not saying when or how much was received.

Is that an accurate recap before I replay all 21 recorded questions and five actions against the live model?

### Turn 89 — user

Yes, that’s accurate. The payment history supports identifying recorded entries and checking that entries exist, but not when or how much was received. You can proceed with the replay.

### Turn 89 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 89 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: "The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms."
    aliases: []
    properties:
      agreedPrincipalAmount:
        type: number
      maturityDate:
        type: date
  Borrower:
    meaning: The party that owes repayment on the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party that provides the credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting principal and interest on the lender's behalf."
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Shows scheduled changes in the loan's debt balance over time, not payments actually received."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: Shows when principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: Shows when interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: "Shows when interest is calculated, separately from when it is paid."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: Shows when a variable interest rate and its resulting value are recalculated.
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: "The loan's general payment timetable."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "The terms stating when and how the loan's principal is to be paid."
    aliases: []
    properties:
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
  InterestPaymentTerms:
    meaning: "The terms stating when interest is paid and how it accrues, pointing to the day-count convention that supplies the accrual basis."
    aliases: []
    properties:
      initialInterestAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      compoundingFrequency:
        type: text
      paymentDay:
        type: text
  PrepaymentTerms:
    meaning: "Terms governing repayment of principal before maturity, which may specify a penalty period."
    aliases: []
    properties:
      prepaymentPenaltyPeriod:
        type: number
        unit: months
  LoanPrincipal:
    meaning: "The amount of the obligation to be repaid, separate from interest; its agreed amount is recorded on the loan and its outstanding amount changes as it is repaid."
    aliases: []
    properties: {}
  LoanInterest:
    meaning: "Interest is the cost of using the credit, distinct from the rate expressing how that cost is charged over time and from principal."
    aliases: []
    properties: {}
  Collateral:
    meaning: Property pledged to support repayment of the loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: The agreement granting a financial interest in pledged collateral and setting out rights concerning it.
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The loan's record of actual payments made toward its obligation, comprising individual payment transactions."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An individual entry recording an actual payment in the loan's payment history, which need not cover only one kind of amount."
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: An applicable numeric interest rate that does not fluctuate over the life of the loan.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An applicable numeric interest rate allowed to change over the life of the loan, with a reset schedule stating when it and its resulting value are recalculated."
    aliases: []
    properties:
      rateValue:
        type: number
  DayCountConvention:
    meaning: The convention used as the day-count basis for calculating accrued interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the party that owes repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the party that extended the credit.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting principal and interest on the lender's behalf."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: LoanPrincipal
    meaning: "Identifies the loan's principal obligation, not its agreed or outstanding amount alone."
    aliases: []
  - name: hasInterest
    from: Loan
    to: LoanInterest
    meaning: "Identifies the loan's interest obligation, not its interest rate."
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: LoanPrincipal
    meaning: "Identifies terms governing when and how the loan's principal is paid."
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: LoanInterest
    meaning: "Identifies terms governing payment of the loan's interest."
    aliases: []
  - name: setsAccrualBasisBy
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count convention that the interest payment terms use as the basis for interest accrual.
    aliases: []
  - name: governsPaymentOf
    from: PrepaymentTerms
    to: LoanPrincipal
    meaning: "Identifies applicable terms for paying the loan's principal before maturity, when such terms exist."
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies an amortization schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies a principal payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies an interest payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies an interest calculation schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies an interest rate reset schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies a general payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: Identifies pledged collateral supporting the loan when the loan is backed by pledged collateral; a guaranteed loan does not automatically have this connection.
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the agreement granting a financial interest in the pledged collateral.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of actual payments."
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: PaymentTransaction
    meaning: Identifies an actual payment entry in the history without assuming it covers only one kind of amount.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applying to the loan when its rate is fixed.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applying to the loan when its rate is variable.
    aliases: []
rules:
  servicingHandoffReadiness:
    conditions:
      - Confirm the loan has a borrower through hasBorrower and a lender through hasLender.
      - "When an authoritative source outside this model establishes that interest is payable, confirm the loan has an applicable fixed or variable interest rate through hasInterestRate and interest payment terms govern its LoanInterest through governsPaymentOf."
      - "If whether interest is payable has not been independently established, leave the interest portion undecided; absence of an interest rate or interest payment terms does not prove that interest is not payable."
  collateralSupportRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is backed by pledged collateral, confirm that Loan collateralizedBy Collateral is recorded."
      - "If collateral backing has not been independently established, leave applicability of the collateral-link check undecided; a missing collateralizedBy link does not prove the loan is not collateral-backed."
      - Identification as guaranteed alone does not trigger this check; this rule checks only the Loan collateralizedBy Collateral link.
  variableRateSetupRecorded:
    conditions:
      - "When Loan hasInterestRate VariableInterestRate is recorded, confirm Loan hasInterestRateResetSchedule InterestRateResetSchedule is also recorded."
      - "If a variable interest rate is recorded but no interest rate reset schedule is linked to the loan, variable-rate setup cannot be confirmed."
      - "If neither a fixed nor a variable hasInterestRate link is recorded, leave the rate type undecided rather than inferring fixed-rate status."
  paymentRecordComplete:
    conditions:
      - Confirm Loan hasPaymentHistory PaymentHistory and that PaymentHistory hasIndividualPayment at least one PaymentTransaction.
      - "If a history is present but has no individual payment transactions recorded, report no individual payments recorded and do not confirm completeness; do not infer that no payment was ever made."
      - "If the Loan hasPaymentHistory link is absent, report no linked payment history separately and do not confirm completeness."
  prepaymentPenaltyTimingRecorded:
    conditions:
      - "Find Loan hasPrincipal LoanPrincipal and applicable PrepaymentTerms governsPaymentOf that LoanPrincipal; if prepaymentPenaltyPeriod is recorded in months, confirm the recorded penalty timing."
      - "If no applicable PrepaymentTerms are found, leave what prepayment terms apply and penalty timing unconfirmed; do not infer that prepayment is prohibited or penalty-free."
      - "If PrepaymentTerms are found but prepaymentPenaltyPeriod is absent, report no prepayment penalty period recorded and do not confirm penalty timing or infer that no penalty applies."
  amortizingSetupRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is amortizing, confirm Loan hasAmortizationSchedule AmortizationSchedule and that PrincipalRepaymentTerms governsPaymentOf its LoanPrincipal reached by hasPrincipal."
      - "If amortizing structure has not been independently established, leave the check undecided; the presence or absence of an amortization schedule alone does not establish that structure."
actions:
  assessServicingHandoffReadiness:
    input: Loan
    preconditions:
      - servicingHandoffReadiness
    effect: "Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record."
    verification: "Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate and InterestPaymentTerms governsPaymentOf the LoanInterest reached through hasInterest. Confirm the report reflects the links and leaves unsupported interest conclusions undecided."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - collateralSupportRecorded
    effect: Report whether pledged-collateral support is recorded when pledged backing has been independently established; otherwise report applicability undecided. Do not change the loan record.
    verification: "When pledged backing is independently established, reread Loan collateralizedBy Collateral and confirm the finding matches the recorded link; when backing is unestablished, confirm no conclusion is inferred from an absent link."
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupRecorded
    effect: "Report whether a recorded variable interest rate is accompanied by an interest rate reset schedule; if neither rate kind is recorded, report rate type undecided. Do not calculate future or past rate values or change the loan record."
    verification: "Reread Loan hasInterestRate VariableInterestRate and Loan hasInterestRateResetSchedule InterestRateResetSchedule; if neither Loan hasInterestRate VariableInterestRate nor Loan hasInterestRate FixedInterestRate is recorded, confirm the report leaves rate type undecided."
  checkPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordComplete
    effect: Report whether a linked PaymentHistory has at least one individual PaymentTransaction; distinguish no linked history from linked history with no individual payments recorded. Neither absence establishes that no payment was ever made. Do not change the loan record.
    verification: "Reread Loan hasPaymentHistory PaymentHistory and PaymentHistory hasIndividualPayment PaymentTransaction; confirm the report distinguishes no history, an empty linked history, and a history with at least one entry."
  reviewRecordedPrepaymentPenaltyTiming:
    input: Loan
    preconditions:
      - prepaymentPenaltyTimingRecorded
    effect: "Report the recorded prepayment penalty period in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded period. Do not decide whether a particular early payment incurs a charge or change the loan record."
    verification: "Identify the LoanPrincipal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm that any reported period matches its prepaymentPenaltyPeriod; distinguish absent terms from a missing period."


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "assessServicingHandoffReadiness" has input class Loan, and its precondition servicingHandoffReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewRecordedPrepaymentPenaltyTiming" has input class Loan, and its precondition prepaymentPenaltyTimingRecorded refers to PrepaymentTerms, which is only reachable against the direction of the relationships between them.

### Turn 89 — assistant

I’ve replayed the **21 questions and five actions against the saved canvas**. This checks whether the model tells the agent where to look and when to leave an answer undecided—not whether a particular loan’s records are correct.

| Recorded questions | Coverage |
|---|---|
| **1–2 Borrower and lender** | Covered by the Loan’s `hasBorrower` and `hasLender` links. |
| **3 Agreed principal amount** | Covered by `Loan.agreedPrincipalAmount`; it must not be replaced with an outstanding balance. |
| **4–5 Applicable rate and fixed/variable distinction** | Covered by the Loan’s `hasInterestRate` link to a Fixed Interest Rate or Variable Interest Rate and that rate’s `rateValue`. No link leaves the type undecided. |
| **6 Variable-rate reset schedule** | Covered by the Loan’s `hasInterestRateResetSchedule` link and the variable-rate setup rule. |
| **7 Maturity date** | Covered by `Loan.maturityDate`. |
| **8 Principal due under the terms** | Covered by Loan → Loan Principal, then a **reverse lookup** for Principal Repayment Terms that `governsPaymentOf` that principal; the recorded dates, frequency, and payment day supply the answer. |
| **9–10 Interest due and accrual calculation** | Covered by Loan → Loan Interest, a reverse lookup for governing Interest Payment Terms, their recorded dates and frequencies, and their link to Day Count Convention. |
| **11–12 Which schedules apply and whether they’re on file** | **Partly covered.** The six Loan-to-schedule links show what is on file. The rules establish when amortization and rate-reset schedules are required, but no complete test for which of the other schedules applies has been established. |
| **13–15 Whether secured, what supports it, and which collateral is linked** | **Partly covered.** `collateralizedBy` identifies recorded pledged collateral, and the collateral rule checks it once pledged backing is independently established. Guaranteed status and other security descriptions still require an independently established basis; an absent collateral link proves neither “unsecured” nor “guaranteed.” |
| **16 Security agreement covering pledged collateral** | Covered by identifying Collateral from the Loan, then **searching Security Agreements** whose `secures` link targets it. This is not a prerequisite for the collateral-support review. |
| **17 Servicer** | Covered by Loan → `servicedBy` → Servicer; lender and servicer remain distinct roles. |
| **18–19 Payments received and individual history entries** | Covered **as recorded payments** by Loan → Payment History → Payment Transaction. The model cannot say when or how much was received, or prove the history captures every payment made. |
| **20–21 Prepayment terms and recorded penalty period** | Covered by a reverse lookup for Prepayment Terms governing the Loan Principal, then `prepaymentPenaltyPeriod` in months when present. Missing terms and missing period produce different findings. |

The five saved actions also have their input, rule, reported finding, and verification step: **hand-off readiness** checks party links and, conditionally, rate and interest terms; **secured-support review** checks the collateral link only when pledged backing is established; **variable-rate review** checks rate and reset-schedule links; **payment-record review** checks the history and its entries; and **prepayment-timing review** checks applicable terms and their recorded period. All five report findings without changing the Loan. The separate amortizing setup rule is not a sixth action.

Two canvas warnings remain: hand-off and prepayment timing require **reverse searches** over `governsPaymentOf`. You confirmed those searches as the intended route. If an agent cannot perform them, it must report that verification limit—not treat the terms as absent.

The main coverage gap to settle next is question 11. **For the principal-payment, interest-payment, interest-calculation, and general loan-payment schedules, what tells the agent which ones apply to a particular loan?** If the governing terms must be interpreted by a person or another authoritative source, we can state that limit rather than invent a requirement for each schedule.

### Turn 90 — user

For those four schedules, we **haven’t established a complete recorded test** that tells the agent which must exist for a particular loan. The governing terms and the loan’s structure are the basis for that decision, but a payment date or frequency in the terms does not, by itself, establish that a separate schedule must be on file.

The agent can report which of the four schedules are linked to the loan. If a person or other authoritative source establishes which ones the terms call for, it can compare that expectation with what’s on file. Without that determination, it should leave **“which should apply”** undecided—not turn a missing schedule link into a failed requirement. The specific amortization and variable-rate reset checks remain as already agreed.

### Turn 90 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  compareApplicableSchedules:\n    conditions:\n      - Report which AmortizationSchedule, PrincipalPaymentSchedule, InterestPaymentSchedule, InterestCalculationSchedule, InterestRateResetSchedule, and LoanPaymentSchedule are linked to the Loan through their respective loan-to-schedule relationships.\n      - For principal payment, interest payment, interest calculation, and general loan payment schedules, compare recorded loan-to-schedule links against schedules independently determined from governing terms and loan structure to be required; a payment date or frequency alone does not establish that a separate schedule is required.\n      - Without that independent determination, leave which of those four schedules should apply undecided; an absent link alone is not a failed requirement.\n      - Apply the separately recorded amortizing and variable-rate setup rules when their applicability is established."
}
```

### Turn 90 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 90 — assistant

I’ve recorded that distinction. For the four schedules, the agent can report what is linked to the Loan and compare it with an independently established expectation; otherwise, “which should apply” remains undecided. The amortization and rate-reset checks remain separate.

The remaining question-coverage gap concerns **whether a loan is secured by a guarantee**. We have no guarantee record or confirmed source for that description. Should the agent report guaranteed support **only when a person or another authoritative source establishes it**, while leaving guarantee status undecided otherwise—even if no collateral link is present?

### Turn 91 — user

Yes. Report the loan as **guaranteed** only when that description has been established by a person or another authoritative source. If it hasn’t, leave guarantee status undecided—even if no collateral is linked.

No collateral link is not evidence of a guarantee, and it does not prove the loan is unsecured. A loan may also be both guaranteed and backed by pledged collateral, so check those descriptions independently.

### Turn 91 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  identifySecuredLoanSupport:\n    conditions:\n      - Report guaranteed support only when a person or another authoritative source has independently established that the loan is guaranteed; otherwise leave guarantee status undecided.\n      - Check whether the loan is backed by pledged collateral independently of guarantee status; where pledged backing is independently established, use Loan collateralizedBy Collateral to identify recorded pledged support.\n      - An absent Loan collateralizedBy Collateral link alone proves neither that the loan is unsecured nor that it is guaranteed; guarantee and pledged collateral may both apply to the same loan.\n      - If the basis for classifying the loan as secured has not been independently established, leave the overall secured determination undecided."
}
```

### Turn 91 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 91 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

### Turn 91 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: "The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms."
    aliases: []
    properties:
      agreedPrincipalAmount:
        type: number
      maturityDate:
        type: date
  Borrower:
    meaning: The party that owes repayment on the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party that provides the credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting principal and interest on the lender's behalf."
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Shows scheduled changes in the loan's debt balance over time, not payments actually received."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: Shows when principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: Shows when interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: "Shows when interest is calculated, separately from when it is paid."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: Shows when a variable interest rate and its resulting value are recalculated.
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: "The loan's general payment timetable."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "The terms stating when and how the loan's principal is to be paid."
    aliases: []
    properties:
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
  InterestPaymentTerms:
    meaning: "The terms stating when interest is paid and how it accrues, pointing to the day-count convention that supplies the accrual basis."
    aliases: []
    properties:
      initialInterestAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      compoundingFrequency:
        type: text
      paymentDay:
        type: text
  PrepaymentTerms:
    meaning: "Terms governing repayment of principal before maturity, which may specify a penalty period."
    aliases: []
    properties:
      prepaymentPenaltyPeriod:
        type: number
        unit: months
  LoanPrincipal:
    meaning: "The amount of the obligation to be repaid, separate from interest; its agreed amount is recorded on the loan and its outstanding amount changes as it is repaid."
    aliases: []
    properties: {}
  LoanInterest:
    meaning: "Interest is the cost of using the credit, distinct from the rate expressing how that cost is charged over time and from principal."
    aliases: []
    properties: {}
  Collateral:
    meaning: Property pledged to support repayment of the loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: The agreement granting a financial interest in pledged collateral and setting out rights concerning it.
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The loan's record of actual payments made toward its obligation, comprising individual payment transactions."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An individual entry recording an actual payment in the loan's payment history, which need not cover only one kind of amount."
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: An applicable numeric interest rate that does not fluctuate over the life of the loan.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An applicable numeric interest rate allowed to change over the life of the loan, with a reset schedule stating when it and its resulting value are recalculated."
    aliases: []
    properties:
      rateValue:
        type: number
  DayCountConvention:
    meaning: The convention used as the day-count basis for calculating accrued interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the party that owes repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the party that extended the credit.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting principal and interest on the lender's behalf."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: LoanPrincipal
    meaning: "Identifies the loan's principal obligation, not its agreed or outstanding amount alone."
    aliases: []
  - name: hasInterest
    from: Loan
    to: LoanInterest
    meaning: "Identifies the loan's interest obligation, not its interest rate."
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: LoanPrincipal
    meaning: "Identifies terms governing when and how the loan's principal is paid."
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: LoanInterest
    meaning: "Identifies terms governing payment of the loan's interest."
    aliases: []
  - name: setsAccrualBasisBy
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count convention that the interest payment terms use as the basis for interest accrual.
    aliases: []
  - name: governsPaymentOf
    from: PrepaymentTerms
    to: LoanPrincipal
    meaning: "Identifies applicable terms for paying the loan's principal before maturity, when such terms exist."
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies an amortization schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies a principal payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies an interest payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies an interest calculation schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies an interest rate reset schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies a general payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: Identifies pledged collateral supporting the loan when the loan is backed by pledged collateral; a guaranteed loan does not automatically have this connection.
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: Identifies the agreement granting a financial interest in the pledged collateral.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of actual payments."
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: PaymentTransaction
    meaning: Identifies an actual payment entry in the history without assuming it covers only one kind of amount.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applying to the loan when its rate is fixed.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applying to the loan when its rate is variable.
    aliases: []
rules:
  servicingHandoffReadiness:
    conditions:
      - Confirm the loan has a borrower through hasBorrower and a lender through hasLender.
      - "When an authoritative source outside this model establishes that interest is payable, confirm the loan has an applicable fixed or variable interest rate through hasInterestRate and interest payment terms govern its LoanInterest through governsPaymentOf."
      - "If whether interest is payable has not been independently established, leave the interest portion undecided; absence of an interest rate or interest payment terms does not prove that interest is not payable."
  collateralSupportRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is backed by pledged collateral, confirm that Loan collateralizedBy Collateral is recorded."
      - "If collateral backing has not been independently established, leave applicability of the collateral-link check undecided; a missing collateralizedBy link does not prove the loan is not collateral-backed."
      - Identification as guaranteed alone does not trigger this check; this rule checks only the Loan collateralizedBy Collateral link.
  variableRateSetupRecorded:
    conditions:
      - "When Loan hasInterestRate VariableInterestRate is recorded, confirm Loan hasInterestRateResetSchedule InterestRateResetSchedule is also recorded."
      - "If a variable interest rate is recorded but no interest rate reset schedule is linked to the loan, variable-rate setup cannot be confirmed."
      - "If neither a fixed nor a variable hasInterestRate link is recorded, leave the rate type undecided rather than inferring fixed-rate status."
  paymentRecordComplete:
    conditions:
      - Confirm Loan hasPaymentHistory PaymentHistory and that PaymentHistory hasIndividualPayment at least one PaymentTransaction.
      - "If a history is present but has no individual payment transactions recorded, report no individual payments recorded and do not confirm completeness; do not infer that no payment was ever made."
      - "If the Loan hasPaymentHistory link is absent, report no linked payment history separately and do not confirm completeness."
  prepaymentPenaltyTimingRecorded:
    conditions:
      - "Find Loan hasPrincipal LoanPrincipal and applicable PrepaymentTerms governsPaymentOf that LoanPrincipal; if prepaymentPenaltyPeriod is recorded in months, confirm the recorded penalty timing."
      - "If no applicable PrepaymentTerms are found, leave what prepayment terms apply and penalty timing unconfirmed; do not infer that prepayment is prohibited or penalty-free."
      - "If PrepaymentTerms are found but prepaymentPenaltyPeriod is absent, report no prepayment penalty period recorded and do not confirm penalty timing or infer that no penalty applies."
  amortizingSetupRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is amortizing, confirm Loan hasAmortizationSchedule AmortizationSchedule and that PrincipalRepaymentTerms governsPaymentOf its LoanPrincipal reached by hasPrincipal."
      - "If amortizing structure has not been independently established, leave the check undecided; the presence or absence of an amortization schedule alone does not establish that structure."
  compareApplicableSchedules:
    conditions:
      - "Report which AmortizationSchedule, PrincipalPaymentSchedule, InterestPaymentSchedule, InterestCalculationSchedule, InterestRateResetSchedule, and LoanPaymentSchedule are linked to the Loan through their respective loan-to-schedule relationships."
      - "For principal payment, interest payment, interest calculation, and general loan payment schedules, compare recorded loan-to-schedule links against schedules independently determined from governing terms and loan structure to be required; a payment date or frequency alone does not establish that a separate schedule is required."
      - "Without that independent determination, leave which of those four schedules should apply undecided; an absent link alone is not a failed requirement."
      - Apply the separately recorded amortizing and variable-rate setup rules when their applicability is established.
  identifySecuredLoanSupport:
    conditions:
      - Report guaranteed support only when a person or another authoritative source has independently established that the loan is guaranteed; otherwise leave guarantee status undecided.
      - "Check whether the loan is backed by pledged collateral independently of guarantee status; where pledged backing is independently established, use Loan collateralizedBy Collateral to identify recorded pledged support."
      - An absent Loan collateralizedBy Collateral link alone proves neither that the loan is unsecured nor that it is guaranteed; guarantee and pledged collateral may both apply to the same loan.
      - "If the basis for classifying the loan as secured has not been independently established, leave the overall secured determination undecided."
actions:
  assessServicingHandoffReadiness:
    input: Loan
    preconditions:
      - servicingHandoffReadiness
    effect: "Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record."
    verification: "Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate and InterestPaymentTerms governsPaymentOf the LoanInterest reached through hasInterest. Confirm the report reflects the links and leaves unsupported interest conclusions undecided."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - collateralSupportRecorded
    effect: Report whether pledged-collateral support is recorded when pledged backing has been independently established; otherwise report applicability undecided. Do not change the loan record.
    verification: "When pledged backing is independently established, reread Loan collateralizedBy Collateral and confirm the finding matches the recorded link; when backing is unestablished, confirm no conclusion is inferred from an absent link."
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupRecorded
    effect: "Report whether a recorded variable interest rate is accompanied by an interest rate reset schedule; if neither rate kind is recorded, report rate type undecided. Do not calculate future or past rate values or change the loan record."
    verification: "Reread Loan hasInterestRate VariableInterestRate and Loan hasInterestRateResetSchedule InterestRateResetSchedule; if neither Loan hasInterestRate VariableInterestRate nor Loan hasInterestRate FixedInterestRate is recorded, confirm the report leaves rate type undecided."
  checkPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordComplete
    effect: Report whether a linked PaymentHistory has at least one individual PaymentTransaction; distinguish no linked history from linked history with no individual payments recorded. Neither absence establishes that no payment was ever made. Do not change the loan record.
    verification: "Reread Loan hasPaymentHistory PaymentHistory and PaymentHistory hasIndividualPayment PaymentTransaction; confirm the report distinguishes no history, an empty linked history, and a history with at least one entry."
  reviewRecordedPrepaymentPenaltyTiming:
    input: Loan
    preconditions:
      - prepaymentPenaltyTimingRecorded
    effect: "Report the recorded prepayment penalty period in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded period. Do not decide whether a particular early payment incurs a charge or change the loan record."
    verification: "Identify the LoanPrincipal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm that any reported period matches its prepaymentPenaltyPeriod; distinguish absent terms from a missing period."


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "assessServicingHandoffReadiness" has input class Loan, and its precondition servicingHandoffReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewRecordedPrepaymentPenaltyTiming" has input class Loan, and its precondition prepaymentPenaltyTimingRecorded refers to PrepaymentTerms, which is only reachable against the direction of the relationships between them.

# SECOND-OPINION MODEL CHECK — 4 observation(s) from a separate automated review (report these to the expert, marked as model-derived, the same as the deterministic findings above; not authoritative on their own, but not to be dismissed without checking):
#   [relation-direction] The relationship points from repayment terms to principal, but its meaning says it identifies the terms governing principal payment.
#   [relation-direction] The relationship points from interest payment terms to interest, but its meaning says it identifies the terms governing interest payment.
#   [relation-direction] The relationship points from prepayment terms to principal, but its meaning says it identifies the applicable terms for paying principal early.
#   [relation-direction] The relationship points from a security agreement to collateral, but its meaning says it identifies the agreement granting an interest in that collateral.

### Turn 91 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: governsPaymentOf\n    from: PrincipalRepaymentTerms\n    to: LoanPrincipal\n    meaning: Principal repayment terms govern when and how the linked loan principal is paid.\n  - name: governsPaymentOf\n    from: InterestPaymentTerms\n    to: LoanInterest\n    meaning: Interest payment terms govern payment of the linked loan interest.\n  - name: governsPaymentOf\n    from: PrepaymentTerms\n    to: LoanPrincipal\n    meaning: Applicable prepayment terms govern payment of the linked loan principal before maturity.\n  - name: secures\n    from: SecurityAgreement\n    to: Collateral\n    meaning: The security agreement grants a financial interest in the linked pledged collateral.\nactions:\n  assessServicingHandoffReadiness:\n    input: Loan\n    preconditions: [servicingHandoffReadiness]\n    effect: Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record.\n    verification: Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate, then search InterestPaymentTerms whose governsPaymentOf link targets the LoanInterest reached through hasInterest. If reverse lookup is unavailable, report that the terms portion cannot be verified; do not infer terms are absent.\n  reviewRecordedPrepaymentPenaltyTiming:\n    input: Loan\n    preconditions: [prepaymentPenaltyTimingRecorded]\n    effect: Report the recorded prepayment penalty period in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded period. Do not decide whether a particular early payment incurs a charge or change the loan record.\n    verification: Identify the LoanPrincipal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm any reported period matches its prepaymentPenaltyPeriod; distinguish absent terms from a missing period. If reverse lookup is unavailable, report that terms cannot be verified, not that they are absent."
}
```

### Turn 91 — tool

Skipped: no further apply_ontology_yaml or remove_ontology_elements call is available this turn. The extra calls in a turn are for resolving consistency problems your own edit introduced, not for further edits. Reply to the expert instead.

### Turn 91 — assistant

The final canvas check found two directed-path warnings for the hand-off and prepayment actions. Both depend on searching *backward* from the loan’s interest or principal to terms whose `governsPaymentOf` link points to it. The recorded arrows match your description; the checker cannot recognize that search route.

An **automated second opinion** also flagged four relationship meanings as sounding backward: the three terms-to-obligation links and Security Agreement → Collateral. I checked them against your confirmed directions. The directions are right, but the meaning sentences should start with the terms or agreement to make that clear. My attempt to save those wording corrections was not accepted in this turn, so they remain pending.

**Will the deployed agent be able to search relationships by their target**—finding terms that govern a given principal or interest, and agreements that secure given collateral?

### Turn 92 — user

I can confirm the **search the agent needs**, not whether the deployed system supports it. It must be able to find records whose existing links point to a given principal, interest, or collateral. The links should remain directed from the terms to the obligation, and from the security agreement to the collateral.

That capability needs a deployment test. If it isn’t available, the agent must report that it **cannot verify** the governing terms or covering security agreement through these paths; it must not report that those records are absent.

### Turn 92 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: governsPaymentOf\n    from: PrincipalRepaymentTerms\n    to: LoanPrincipal\n    meaning: Principal repayment terms govern when and how the linked loan principal is paid.\n  - name: governsPaymentOf\n    from: InterestPaymentTerms\n    to: LoanInterest\n    meaning: Interest payment terms govern payment of the linked loan interest.\n  - name: governsPaymentOf\n    from: PrepaymentTerms\n    to: LoanPrincipal\n    meaning: Applicable prepayment terms govern payment of the linked loan principal before maturity.\n  - name: secures\n    from: SecurityAgreement\n    to: Collateral\n    meaning: The security agreement grants a financial interest in the linked pledged collateral.\nrules:\n  findGoverningTermsAndAgreement:\n    conditions:\n      - For a loan's principal reached by hasPrincipal, find PrincipalRepaymentTerms or PrepaymentTerms whose governsPaymentOf link targets that LoanPrincipal; for interest reached by hasInterest, find InterestPaymentTerms whose governsPaymentOf link targets that LoanInterest.\n      - For collateral reached through Loan collateralizedBy Collateral, find SecurityAgreement whose secures link targets that Collateral.\n      - These searches require lookup by relationship target without reversing the stored links. If a target-based lookup is unavailable, report that the relevant terms or security agreement cannot be verified through these paths; do not report that records are absent.\nactions:\n  assessServicingHandoffReadiness:\n    input: Loan\n    preconditions: [servicingHandoffReadiness]\n    effect: Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record.\n    verification: Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate, then search InterestPaymentTerms whose governsPaymentOf link targets the LoanInterest reached through hasInterest. If target-based lookup is unavailable, report that the terms portion cannot be verified, not that terms are absent.\n  reviewRecordedPrepaymentPenaltyTiming:\n    input: Loan\n    preconditions: [prepaymentPenaltyTimingRecorded]\n    effect: Report the recorded prepayment penalty period in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded period. Do not decide whether a particular early payment incurs a charge or change the loan record.\n    verification: Identify the LoanPrincipal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm any reported period matches its prepaymentPenaltyPeriod; distinguish absent terms from a missing period. If target-based lookup is unavailable, report that terms cannot be verified, not that they are absent."
}
```

### Turn 92 — tool

Applied. Added 1, updated 6 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 92 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 92 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: "The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms."
    aliases: []
    properties:
      agreedPrincipalAmount:
        type: number
      maturityDate:
        type: date
  Borrower:
    meaning: The party that owes repayment on the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party that provides the credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting principal and interest on the lender's behalf."
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Shows scheduled changes in the loan's debt balance over time, not payments actually received."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: Shows when principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: Shows when interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: "Shows when interest is calculated, separately from when it is paid."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: Shows when a variable interest rate and its resulting value are recalculated.
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: "The loan's general payment timetable."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "The terms stating when and how the loan's principal is to be paid."
    aliases: []
    properties:
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
  InterestPaymentTerms:
    meaning: "The terms stating when interest is paid and how it accrues, pointing to the day-count convention that supplies the accrual basis."
    aliases: []
    properties:
      initialInterestAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      compoundingFrequency:
        type: text
      paymentDay:
        type: text
  PrepaymentTerms:
    meaning: "Terms governing repayment of principal before maturity, which may specify a penalty period."
    aliases: []
    properties:
      prepaymentPenaltyPeriod:
        type: number
        unit: months
  LoanPrincipal:
    meaning: "The amount of the obligation to be repaid, separate from interest; its agreed amount is recorded on the loan and its outstanding amount changes as it is repaid."
    aliases: []
    properties: {}
  LoanInterest:
    meaning: "Interest is the cost of using the credit, distinct from the rate expressing how that cost is charged over time and from principal."
    aliases: []
    properties: {}
  Collateral:
    meaning: Property pledged to support repayment of the loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: The agreement granting a financial interest in pledged collateral and setting out rights concerning it.
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The loan's record of actual payments made toward its obligation, comprising individual payment transactions."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An individual entry recording an actual payment in the loan's payment history, which need not cover only one kind of amount."
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: An applicable numeric interest rate that does not fluctuate over the life of the loan.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An applicable numeric interest rate allowed to change over the life of the loan, with a reset schedule stating when it and its resulting value are recalculated."
    aliases: []
    properties:
      rateValue:
        type: number
  DayCountConvention:
    meaning: The convention used as the day-count basis for calculating accrued interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the party that owes repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the party that extended the credit.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting principal and interest on the lender's behalf."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: LoanPrincipal
    meaning: "Identifies the loan's principal obligation, not its agreed or outstanding amount alone."
    aliases: []
  - name: hasInterest
    from: Loan
    to: LoanInterest
    meaning: "Identifies the loan's interest obligation, not its interest rate."
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: LoanPrincipal
    meaning: Principal repayment terms govern when and how the linked loan principal is paid.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: LoanInterest
    meaning: Interest payment terms govern payment of the linked loan interest.
    aliases: []
  - name: setsAccrualBasisBy
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count convention that the interest payment terms use as the basis for interest accrual.
    aliases: []
  - name: governsPaymentOf
    from: PrepaymentTerms
    to: LoanPrincipal
    meaning: Applicable prepayment terms govern payment of the linked loan principal before maturity.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies an amortization schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies a principal payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies an interest payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies an interest calculation schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies an interest rate reset schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies a general payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: Identifies pledged collateral supporting the loan when the loan is backed by pledged collateral; a guaranteed loan does not automatically have this connection.
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement grants a financial interest in the linked pledged collateral.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of actual payments."
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: PaymentTransaction
    meaning: Identifies an actual payment entry in the history without assuming it covers only one kind of amount.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applying to the loan when its rate is fixed.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applying to the loan when its rate is variable.
    aliases: []
rules:
  servicingHandoffReadiness:
    conditions:
      - Confirm the loan has a borrower through hasBorrower and a lender through hasLender.
      - "When an authoritative source outside this model establishes that interest is payable, confirm the loan has an applicable fixed or variable interest rate through hasInterestRate and interest payment terms govern its LoanInterest through governsPaymentOf."
      - "If whether interest is payable has not been independently established, leave the interest portion undecided; absence of an interest rate or interest payment terms does not prove that interest is not payable."
  collateralSupportRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is backed by pledged collateral, confirm that Loan collateralizedBy Collateral is recorded."
      - "If collateral backing has not been independently established, leave applicability of the collateral-link check undecided; a missing collateralizedBy link does not prove the loan is not collateral-backed."
      - Identification as guaranteed alone does not trigger this check; this rule checks only the Loan collateralizedBy Collateral link.
  variableRateSetupRecorded:
    conditions:
      - "When Loan hasInterestRate VariableInterestRate is recorded, confirm Loan hasInterestRateResetSchedule InterestRateResetSchedule is also recorded."
      - "If a variable interest rate is recorded but no interest rate reset schedule is linked to the loan, variable-rate setup cannot be confirmed."
      - "If neither a fixed nor a variable hasInterestRate link is recorded, leave the rate type undecided rather than inferring fixed-rate status."
  paymentRecordComplete:
    conditions:
      - Confirm Loan hasPaymentHistory PaymentHistory and that PaymentHistory hasIndividualPayment at least one PaymentTransaction.
      - "If a history is present but has no individual payment transactions recorded, report no individual payments recorded and do not confirm completeness; do not infer that no payment was ever made."
      - "If the Loan hasPaymentHistory link is absent, report no linked payment history separately and do not confirm completeness."
  prepaymentPenaltyTimingRecorded:
    conditions:
      - "Find Loan hasPrincipal LoanPrincipal and applicable PrepaymentTerms governsPaymentOf that LoanPrincipal; if prepaymentPenaltyPeriod is recorded in months, confirm the recorded penalty timing."
      - "If no applicable PrepaymentTerms are found, leave what prepayment terms apply and penalty timing unconfirmed; do not infer that prepayment is prohibited or penalty-free."
      - "If PrepaymentTerms are found but prepaymentPenaltyPeriod is absent, report no prepayment penalty period recorded and do not confirm penalty timing or infer that no penalty applies."
  amortizingSetupRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is amortizing, confirm Loan hasAmortizationSchedule AmortizationSchedule and that PrincipalRepaymentTerms governsPaymentOf its LoanPrincipal reached by hasPrincipal."
      - "If amortizing structure has not been independently established, leave the check undecided; the presence or absence of an amortization schedule alone does not establish that structure."
  compareApplicableSchedules:
    conditions:
      - "Report which AmortizationSchedule, PrincipalPaymentSchedule, InterestPaymentSchedule, InterestCalculationSchedule, InterestRateResetSchedule, and LoanPaymentSchedule are linked to the Loan through their respective loan-to-schedule relationships."
      - "For principal payment, interest payment, interest calculation, and general loan payment schedules, compare recorded loan-to-schedule links against schedules independently determined from governing terms and loan structure to be required; a payment date or frequency alone does not establish that a separate schedule is required."
      - "Without that independent determination, leave which of those four schedules should apply undecided; an absent link alone is not a failed requirement."
      - Apply the separately recorded amortizing and variable-rate setup rules when their applicability is established.
  identifySecuredLoanSupport:
    conditions:
      - Report guaranteed support only when a person or another authoritative source has independently established that the loan is guaranteed; otherwise leave guarantee status undecided.
      - "Check whether the loan is backed by pledged collateral independently of guarantee status; where pledged backing is independently established, use Loan collateralizedBy Collateral to identify recorded pledged support."
      - An absent Loan collateralizedBy Collateral link alone proves neither that the loan is unsecured nor that it is guaranteed; guarantee and pledged collateral may both apply to the same loan.
      - "If the basis for classifying the loan as secured has not been independently established, leave the overall secured determination undecided."
  findGoverningTermsAndAgreement:
    conditions:
      - "For a loan's principal reached by hasPrincipal, find PrincipalRepaymentTerms or PrepaymentTerms whose governsPaymentOf link targets that LoanPrincipal; for interest reached by hasInterest, find InterestPaymentTerms whose governsPaymentOf link targets that LoanInterest."
      - "For collateral reached through Loan collateralizedBy Collateral, find SecurityAgreement whose secures link targets that Collateral."
      - "These searches require lookup by relationship target without reversing the stored links. If a target-based lookup is unavailable, report that the relevant terms or security agreement cannot be verified through these paths; do not report that records are absent."
actions:
  assessServicingHandoffReadiness:
    input: Loan
    preconditions:
      - servicingHandoffReadiness
    effect: "Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record."
    verification: "Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate, then search InterestPaymentTerms whose governsPaymentOf link targets the LoanInterest reached through hasInterest. If target-based lookup is unavailable, report that the terms portion cannot be verified, not that terms are absent."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - collateralSupportRecorded
    effect: Report whether pledged-collateral support is recorded when pledged backing has been independently established; otherwise report applicability undecided. Do not change the loan record.
    verification: "When pledged backing is independently established, reread Loan collateralizedBy Collateral and confirm the finding matches the recorded link; when backing is unestablished, confirm no conclusion is inferred from an absent link."
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupRecorded
    effect: "Report whether a recorded variable interest rate is accompanied by an interest rate reset schedule; if neither rate kind is recorded, report rate type undecided. Do not calculate future or past rate values or change the loan record."
    verification: "Reread Loan hasInterestRate VariableInterestRate and Loan hasInterestRateResetSchedule InterestRateResetSchedule; if neither Loan hasInterestRate VariableInterestRate nor Loan hasInterestRate FixedInterestRate is recorded, confirm the report leaves rate type undecided."
  checkPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordComplete
    effect: Report whether a linked PaymentHistory has at least one individual PaymentTransaction; distinguish no linked history from linked history with no individual payments recorded. Neither absence establishes that no payment was ever made. Do not change the loan record.
    verification: "Reread Loan hasPaymentHistory PaymentHistory and PaymentHistory hasIndividualPayment PaymentTransaction; confirm the report distinguishes no history, an empty linked history, and a history with at least one entry."
  reviewRecordedPrepaymentPenaltyTiming:
    input: Loan
    preconditions:
      - prepaymentPenaltyTimingRecorded
    effect: "Report the recorded prepayment penalty period in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded period. Do not decide whether a particular early payment incurs a charge or change the loan record."
    verification: "Identify the LoanPrincipal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm any reported period matches its prepaymentPenaltyPeriod; distinguish absent terms from a missing period. If target-based lookup is unavailable, report that terms cannot be verified, not that they are absent."


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "assessServicingHandoffReadiness" has input class Loan, and its precondition servicingHandoffReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewRecordedPrepaymentPenaltyTiming" has input class Loan, and its precondition prepaymentPenaltyTimingRecorded refers to PrepaymentTerms, which is only reachable against the direction of the relationships between them.

### Turn 92 — assistant

I’ve recorded the required **target-based searches** without changing any link direction. I also corrected the four relationship descriptions flagged by the automated second opinion so they now read in the confirmed direction: terms govern obligations, and the security agreement secures collateral.

The final checklist found that all **22 classes** have connections and meanings; the five review actions have conditions and verification steps; and no unsupported fixed-value lists or transaction details were added. The bounded expansion pass was completed.

**The model remains known-incomplete for deployment in these specific respects:**

1. **Search capability is untested.** The agent must be able to find terms or security agreements by the *target* of their recorded links. The canvas still shows two directed-path warnings for the hand-off and prepayment actions because it does not recognize that reverse lookup. If deployment cannot perform it, the agent must report “cannot verify,” not “record absent.” The security-agreement question has the same search dependency.
2. **Some applicability decisions require an external authoritative determination:** whether the loan is interest-bearing, amortizing, guaranteed, or backed by pledged collateral, and which of four other schedules its terms require. No source for those determinations has been established in this model.
3. **Payment entries lack confirmed dates and amounts.** The agent can identify recorded payments, but cannot reliably report when or how much was received.

The next concrete validation step is a deployment test of target-based lookup for `governsPaymentOf` and `secures`.

### Turn 93 — user

Before we close, one more systematic pass, to catch what we have not talked about yet.

Call get_graph_state first and treat it as the source of truth for what is already on the canvas. Then go through every class on the canvas, three to five classes per question, and ask me, for each one, what exists around it in our work: its subordinate parts or components; its states or lifecycle events; the actors or parties responsible for it; its inputs and outputs; related documents or agreements; measurements or characteristic values it carries; earlier or later stages of a workflow it belongs to; more specific or sibling kinds of the same thing; and which of the properties already confirmed on a sibling class also apply to it. Skip the categories that plainly do not fit a class.

Ask these as open questions about what exists, not about what the agent needs: do not limit a question to what the recorded competency questions or actions require, and do not ask me to mention only what is needed. Only once I have answered, check each thing I named against the competency questions and actions, exactly as you would any other candidate, and add only what passes; nothing is added only because it was mentioned. Keep a running list of the candidates and close each one as added, declined (with the reason) or left open; none may silently disappear.

When every class in this pass has been asked about and every candidate is closed, end that message with one line in exactly this form, and ask nothing further in it:
COVERAGE LEDGER: surfaced=<number>; added=<number>; declined=<number>; open=<number>

### Turn 93 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 93 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: "The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms."
    aliases: []
    properties:
      agreedPrincipalAmount:
        type: number
      maturityDate:
        type: date
  Borrower:
    meaning: The party that owes repayment on the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party that provides the credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting principal and interest on the lender's behalf."
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Shows scheduled changes in the loan's debt balance over time, not payments actually received."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: Shows when principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: Shows when interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: "Shows when interest is calculated, separately from when it is paid."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: Shows when a variable interest rate and its resulting value are recalculated.
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: "The loan's general payment timetable."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "The terms stating when and how the loan's principal is to be paid."
    aliases: []
    properties:
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
  InterestPaymentTerms:
    meaning: "The terms stating when interest is paid and how it accrues, pointing to the day-count convention that supplies the accrual basis."
    aliases: []
    properties:
      initialInterestAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      compoundingFrequency:
        type: text
      paymentDay:
        type: text
  PrepaymentTerms:
    meaning: "Terms governing repayment of principal before maturity, which may specify a penalty period."
    aliases: []
    properties:
      prepaymentPenaltyPeriod:
        type: number
        unit: months
  LoanPrincipal:
    meaning: "The amount of the obligation to be repaid, separate from interest; its agreed amount is recorded on the loan and its outstanding amount changes as it is repaid."
    aliases: []
    properties: {}
  LoanInterest:
    meaning: "Interest is the cost of using the credit, distinct from the rate expressing how that cost is charged over time and from principal."
    aliases: []
    properties: {}
  Collateral:
    meaning: Property pledged to support repayment of the loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: The agreement granting a financial interest in pledged collateral and setting out rights concerning it.
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The loan's record of actual payments made toward its obligation, comprising individual payment transactions."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An individual entry recording an actual payment in the loan's payment history, which need not cover only one kind of amount."
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: An applicable numeric interest rate that does not fluctuate over the life of the loan.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An applicable numeric interest rate allowed to change over the life of the loan, with a reset schedule stating when it and its resulting value are recalculated."
    aliases: []
    properties:
      rateValue:
        type: number
  DayCountConvention:
    meaning: The convention used as the day-count basis for calculating accrued interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the party that owes repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the party that extended the credit.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting principal and interest on the lender's behalf."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: LoanPrincipal
    meaning: "Identifies the loan's principal obligation, not its agreed or outstanding amount alone."
    aliases: []
  - name: hasInterest
    from: Loan
    to: LoanInterest
    meaning: "Identifies the loan's interest obligation, not its interest rate."
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: LoanPrincipal
    meaning: Principal repayment terms govern when and how the linked loan principal is paid.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: LoanInterest
    meaning: Interest payment terms govern payment of the linked loan interest.
    aliases: []
  - name: setsAccrualBasisBy
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count convention that the interest payment terms use as the basis for interest accrual.
    aliases: []
  - name: governsPaymentOf
    from: PrepaymentTerms
    to: LoanPrincipal
    meaning: Applicable prepayment terms govern payment of the linked loan principal before maturity.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies an amortization schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies a principal payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies an interest payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies an interest calculation schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies an interest rate reset schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies a general payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: Identifies pledged collateral supporting the loan when the loan is backed by pledged collateral; a guaranteed loan does not automatically have this connection.
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement grants a financial interest in the linked pledged collateral.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of actual payments."
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: PaymentTransaction
    meaning: Identifies an actual payment entry in the history without assuming it covers only one kind of amount.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applying to the loan when its rate is fixed.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applying to the loan when its rate is variable.
    aliases: []
rules:
  servicingHandoffReadiness:
    conditions:
      - Confirm the loan has a borrower through hasBorrower and a lender through hasLender.
      - "When an authoritative source outside this model establishes that interest is payable, confirm the loan has an applicable fixed or variable interest rate through hasInterestRate and interest payment terms govern its LoanInterest through governsPaymentOf."
      - "If whether interest is payable has not been independently established, leave the interest portion undecided; absence of an interest rate or interest payment terms does not prove that interest is not payable."
  collateralSupportRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is backed by pledged collateral, confirm that Loan collateralizedBy Collateral is recorded."
      - "If collateral backing has not been independently established, leave applicability of the collateral-link check undecided; a missing collateralizedBy link does not prove the loan is not collateral-backed."
      - Identification as guaranteed alone does not trigger this check; this rule checks only the Loan collateralizedBy Collateral link.
  variableRateSetupRecorded:
    conditions:
      - "When Loan hasInterestRate VariableInterestRate is recorded, confirm Loan hasInterestRateResetSchedule InterestRateResetSchedule is also recorded."
      - "If a variable interest rate is recorded but no interest rate reset schedule is linked to the loan, variable-rate setup cannot be confirmed."
      - "If neither a fixed nor a variable hasInterestRate link is recorded, leave the rate type undecided rather than inferring fixed-rate status."
  paymentRecordComplete:
    conditions:
      - Confirm Loan hasPaymentHistory PaymentHistory and that PaymentHistory hasIndividualPayment at least one PaymentTransaction.
      - "If a history is present but has no individual payment transactions recorded, report no individual payments recorded and do not confirm completeness; do not infer that no payment was ever made."
      - "If the Loan hasPaymentHistory link is absent, report no linked payment history separately and do not confirm completeness."
  prepaymentPenaltyTimingRecorded:
    conditions:
      - "Find Loan hasPrincipal LoanPrincipal and applicable PrepaymentTerms governsPaymentOf that LoanPrincipal; if prepaymentPenaltyPeriod is recorded in months, confirm the recorded penalty timing."
      - "If no applicable PrepaymentTerms are found, leave what prepayment terms apply and penalty timing unconfirmed; do not infer that prepayment is prohibited or penalty-free."
      - "If PrepaymentTerms are found but prepaymentPenaltyPeriod is absent, report no prepayment penalty period recorded and do not confirm penalty timing or infer that no penalty applies."
  amortizingSetupRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is amortizing, confirm Loan hasAmortizationSchedule AmortizationSchedule and that PrincipalRepaymentTerms governsPaymentOf its LoanPrincipal reached by hasPrincipal."
      - "If amortizing structure has not been independently established, leave the check undecided; the presence or absence of an amortization schedule alone does not establish that structure."
  compareApplicableSchedules:
    conditions:
      - "Report which AmortizationSchedule, PrincipalPaymentSchedule, InterestPaymentSchedule, InterestCalculationSchedule, InterestRateResetSchedule, and LoanPaymentSchedule are linked to the Loan through their respective loan-to-schedule relationships."
      - "For principal payment, interest payment, interest calculation, and general loan payment schedules, compare recorded loan-to-schedule links against schedules independently determined from governing terms and loan structure to be required; a payment date or frequency alone does not establish that a separate schedule is required."
      - "Without that independent determination, leave which of those four schedules should apply undecided; an absent link alone is not a failed requirement."
      - Apply the separately recorded amortizing and variable-rate setup rules when their applicability is established.
  identifySecuredLoanSupport:
    conditions:
      - Report guaranteed support only when a person or another authoritative source has independently established that the loan is guaranteed; otherwise leave guarantee status undecided.
      - "Check whether the loan is backed by pledged collateral independently of guarantee status; where pledged backing is independently established, use Loan collateralizedBy Collateral to identify recorded pledged support."
      - An absent Loan collateralizedBy Collateral link alone proves neither that the loan is unsecured nor that it is guaranteed; guarantee and pledged collateral may both apply to the same loan.
      - "If the basis for classifying the loan as secured has not been independently established, leave the overall secured determination undecided."
  findGoverningTermsAndAgreement:
    conditions:
      - "For a loan's principal reached by hasPrincipal, find PrincipalRepaymentTerms or PrepaymentTerms whose governsPaymentOf link targets that LoanPrincipal; for interest reached by hasInterest, find InterestPaymentTerms whose governsPaymentOf link targets that LoanInterest."
      - "For collateral reached through Loan collateralizedBy Collateral, find SecurityAgreement whose secures link targets that Collateral."
      - "These searches require lookup by relationship target without reversing the stored links. If a target-based lookup is unavailable, report that the relevant terms or security agreement cannot be verified through these paths; do not report that records are absent."
actions:
  assessServicingHandoffReadiness:
    input: Loan
    preconditions:
      - servicingHandoffReadiness
    effect: "Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record."
    verification: "Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate, then search InterestPaymentTerms whose governsPaymentOf link targets the LoanInterest reached through hasInterest. If target-based lookup is unavailable, report that the terms portion cannot be verified, not that terms are absent."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - collateralSupportRecorded
    effect: Report whether pledged-collateral support is recorded when pledged backing has been independently established; otherwise report applicability undecided. Do not change the loan record.
    verification: "When pledged backing is independently established, reread Loan collateralizedBy Collateral and confirm the finding matches the recorded link; when backing is unestablished, confirm no conclusion is inferred from an absent link."
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupRecorded
    effect: "Report whether a recorded variable interest rate is accompanied by an interest rate reset schedule; if neither rate kind is recorded, report rate type undecided. Do not calculate future or past rate values or change the loan record."
    verification: "Reread Loan hasInterestRate VariableInterestRate and Loan hasInterestRateResetSchedule InterestRateResetSchedule; if neither Loan hasInterestRate VariableInterestRate nor Loan hasInterestRate FixedInterestRate is recorded, confirm the report leaves rate type undecided."
  checkPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordComplete
    effect: Report whether a linked PaymentHistory has at least one individual PaymentTransaction; distinguish no linked history from linked history with no individual payments recorded. Neither absence establishes that no payment was ever made. Do not change the loan record.
    verification: "Reread Loan hasPaymentHistory PaymentHistory and PaymentHistory hasIndividualPayment PaymentTransaction; confirm the report distinguishes no history, an empty linked history, and a history with at least one entry."
  reviewRecordedPrepaymentPenaltyTiming:
    input: Loan
    preconditions:
      - prepaymentPenaltyTimingRecorded
    effect: "Report the recorded prepayment penalty period in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded period. Do not decide whether a particular early payment incurs a charge or change the loan record."
    verification: "Identify the LoanPrincipal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm any reported period matches its prepaymentPenaltyPeriod; distinguish absent terms from a missing period. If target-based lookup is unavailable, report that terms cannot be verified, not that they are absent."


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "assessServicingHandoffReadiness" has input class Loan, and its precondition servicingHandoffReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewRecordedPrepaymentPenaltyTiming" has input class Loan, and its precondition prepaymentPenaltyTimingRecorded refers to PrepaymentTerms, which is only reachable against the direction of the relationships between them.

### Turn 93 — assistant

I checked the live canvas first: it has **22 classes**, 21 recorded questions, and five review actions. I’ll cover every class in groups of three to five, keep a running candidate ledger, and test anything you name against those recorded questions and actions before adding it. The ledger starts with **0 candidates**.

First group: **Loan, Borrower, Lender, and Servicer**. In your work, what exists around each of these four—such as parts, changing states, connected parties, documents, characteristic values, workflow stages, or more specific kinds? Please skip anything that does not fit a particular class; at this stage, describe what exists rather than deciding what belongs in the model.

### Turn 94 — user

Here’s what I’d expect to encounter around each one, without deciding yet what to add to the canvas:

- **Loan:** It has agreed terms such as principal amount, maturity and initial funding date, as well as a balance that changes during servicing. Some loans are fixed-rate and others variable-rate; a variable-rate loan may also have a rate cap and a first-rate-change term. Loans can be described by their repayment structure—interest-only, amortizing, balloon, or permitting negative amortization—and by their security: collateralized, guaranteed, or unsecured. The schedules, terms, collateral, and payment records we’ve discussed sit around those distinctions.
- **Borrower:** The borrower is the party obliged to repay. We may also have an **assessed borrowing capacity** for that borrower, which matters when considering further credit. It isn’t the same thing as the amount already borrowed.
- **Lender:** The lender provides the credit and is owed repayment. I wouldn’t infer from that role that it collects the payments itself.
- **Servicer:** The servicer collects principal and interest on the lender’s behalf. It may be the lender or a different party; the loan’s payment history records the actual payments.

I haven’t identified a general loan-status progression or an additional party beneath those roles that these records require.

### Turn 94 — assistant

The first four classes surfaced **12 candidate details** to assess. I’m tracking them as follows; nothing has been added from this pass.

| Candidate details | Ledger status against the 21 questions and five actions |
|---|---|
| Initial funding date; changing loan balance; rate cap | **Declined for this scope:** no recorded question or action uses these values. |
| First-rate-change term | **Open:** it may affect how the agent answers the reset-schedule question; I need to check that rather than assume. |
| Interest-only, balloon, and negative-amortization structures | **Open:** loan structure can affect schedule applicability, but no recorded test says what these descriptions require. |
| Amortizing structure | **Open:** the existing amortization rule uses it, but its authoritative source remains unestablished. |
| Collateralized, guaranteed, and unsecured descriptions | **Declined as new fields:** the existing security rules already handle these conditionally; their source limitations remain explicit. |
| Assessed borrowing capacity | **Declined for this scope:** considering further credit is outside the recorded questions and actions. |

Fixed and variable rates, agreed principal, maturity, the party roles, schedules, terms, collateral, and payment history are already on the canvas, so I have not counted them as new candidates.

For the **first-rate-change term** specifically: does the agent need it to answer the recorded question “If a loan’s interest rate is variable, what is its reset schedule?”, or does the associated Interest Rate Reset Schedule already supply what that question asks?

### Turn 95 — user

The associated **interest rate reset schedule** supplies what that recorded question asks: when resets are scheduled. The **first-rate-change term**, expressed in months, is a separate loan term that may matter if you ask when the first change is due. It isn’t an additional prerequisite for the variable-rate setup review, which checks for the variable rate and the loan’s reset-schedule link.

### Turn 95 — assistant

The **first-rate-change term** is declined for this scope: the reset schedule answers the recorded question, and the variable-rate review does not require that term. Nothing was added to the canvas.

For **interest-only, balloon, and negative-amortization** structures, does any one of them change which schedule the agent should expect under a recorded question or review? If so, which structure changes which expectation? If that has not been established, I’ll close them as out of scope rather than invent a schedule rule.

### Turn 96 — user

We haven’t established a schedule requirement for any of those three descriptions. An **interest-only** loan distinguishes interest payments from principal repayment; a **balloon** loan has a substantial amount due at the end; and with **negative amortization**, payments don’t cover the interest due. Those are meaningful descriptions, but I wouldn’t infer a specific required schedule from any of them for the recorded questions or five reviews.

So you can close them as **out of scope for this pass** rather than add a schedule rule. That leaves the separately agreed amortizing-loan check unchanged.

### Turn 96 — assistant

I’ve closed **interest-only, balloon, and negative-amortization structures** as declined for this model: they are meaningful descriptions, but none has an established schedule requirement for the recorded questions or reviews. The **amortizing structure** remains open only as to where its independent determination comes from; its existing check is unchanged.

**Running ledger:** 12 surfaced; 0 added; 11 declined; 1 open.

Next group: **Amortization Schedule, Principal Payment Schedule, Interest Payment Schedule, and Interest Calculation Schedule**. What exists around each in your work—for example, its entries or stages, values it carries, inputs or outputs, or more specific kinds? Do any values already recorded on one of these schedules’ sibling classes also apply to another? Please describe what exists even if we may later leave it out of the model.

### Turn 97 — user

The shared value is an **anticipated number of payments**. It can be recorded on the amortization, principal payment, and interest payment schedules as a number. I wouldn’t carry it over to the interest calculation schedule: that schedule concerns calculation dates, not a count of payments.

In day-to-day terms:

- **Amortization schedule:** sets out periodic payments and the expected changes in the debt balance.
- **Principal payment schedule:** sets out when some or all principal is due.
- **Interest payment schedule:** sets out when interest is due.
- **Interest calculation schedule:** sets out when interest is calculated, which may differ from when it is paid.

Actual principal and interest payments, and an actual interest calculation, are **events**, not entries I’d treat as interchangeable with these schedules. We haven’t established separate schedule-entry records or additional schedule values for this group.

### Turn 97 — assistant

I’ve noted six new candidates from this group: an **anticipated number of payments** on each of the three payment schedules, plus **actual principal payment**, **actual interest payment**, and **actual interest calculation** as distinct events. The schedules’ existing meanings already capture the distinctions you described; no schedule-entry records were established.

Before I close the three count properties: does the anticipated number of payments on **each** of the amortization, principal-payment, and interest-payment schedules help answer one of the 21 recorded questions or verify one of the five reviews? If so, which question or review uses each count, and how?

### Turn 98 — user

No. For the recorded questions, the agent needs to identify the schedules and whether they’re on file; for the agreed reviews, the amortizing check tests the **amortization schedule link**, not its anticipated payment count. The five actions likewise don’t verify any of these counts.

The count can be useful when discussing a schedule in more detail, but there’s no established use for it in this scope. You can close all three count properties without changing the schedule questions or checks.

### Turn 98 — assistant

The three **anticipated-payment-count** properties are declined for this scope: none is used by a recorded question or review. No properties were added.

For the remaining three candidates—**actual principal payment**, **actual interest payment**, and **actual interest calculation**—does the agent need separate event records for any of the recorded questions or five reviews, beyond the Payment Transactions already used for payment history? What would it need to identify or verify separately for each?

### Turn 99 — user

No separate event records are needed for the recorded questions or five reviews.

- **Actual principal payment** and **actual interest payment** distinguish what was paid, but the payment-history questions and completeness review use the **individual payment transactions** in the history. We haven’t required those transactions to be split into separate event records.
- **Actual interest calculation** is different from an interest calculation *schedule*, but none of the agreed questions or reviews asks the agent to identify a calculation that actually occurred.

You can close all three as out of scope for this pass.

### Turn 99 — assistant

Those three event candidates are declined for this scope. Payment Transactions support the agreed payment-history questions; none of the questions or reviews calls for a separate actual-interest-calculation event.

**Running ledger:** 18 surfaced; 0 added; 17 declined; 1 open—the source of the loan’s amortizing description.

Next group: **Interest Rate Reset Schedule, Loan Payment Schedule, Principal Repayment Terms, and Interest Payment Terms**. What exists around each in your work—its timing or lifecycle, associated parties or documents, inputs and outputs, characteristic values, or more specific kinds? Are there values already recorded on one of these terms or schedules that also occur on a sibling? Describe what exists; I’ll test anything new against the recorded questions and actions afterward.

### Turn 100 — user

A few distinctions are worth keeping in view:

- **Interest rate reset schedule:** It sets out when a variable rate is due to be recalculated. An actual **interest rate reset** is an event, not the schedule itself. Setting the *initial* rate is also distinct from a later reset.
- **Loan payment schedule:** This is the loan’s general payment timetable. It can carry an anticipated number of payments, as the other payment schedules can; that count is not used by our agreed questions or reviews.
- **Principal repayment terms:** These carry the initial principal payment date, repayment date, frequency, and payment day. **Prepayment terms** are the more specific case dealing with principal paid before maturity.
- **Interest payment terms:** These carry the initial accrual date, first and final interest payment dates, payment frequency and day, and compounding frequency. They point to the day-count convention used as the accrual basis.

Both sets of payment terms have a **frequency and payment day**, but keep the principal and interest values separate. I haven’t established a direct terms-to-schedule link or another required timing value for the agreed checks.

### Turn 100 — assistant

This group surfaced three new candidates: an **actual interest rate reset event**, **initial rate-setting event**, and **anticipated payment count** on the general Loan Payment Schedule. I’m declining them for this scope: the recorded questions ask for the applicable rate and its *reset schedule*, not individual reset or initial-setting events; none of the reviews uses the count. Prepayment Terms and the separate principal and interest payment values are already on the canvas.

**Running ledger:** 21 surfaced; 0 added; 20 declined; 1 open—the source of the amortizing description.

Next group: **Prepayment Terms, Loan Principal, Loan Interest, and Collateral**. What exists around each in your work—parts, changing states, related events or parties, documents, measured amounts, workflow stages, or more specific kinds? Are there values on a sibling class that also apply to one of these? Describe what exists; I’ll assess new candidates afterward.

### Turn 101 — user

Here’s what sits around those four in servicing, without deciding what to add for the current scope:

- **Prepayment terms:** They deal with principal paid before maturity and may record a prepayment penalty period in months. I haven’t identified another value on them for our agreed questions.
- **Loan principal:** Its **outstanding amount** can change as principal is repaid. That is separate from the agreed principal amount recorded on the loan and from an actual principal-payment event.
- **Loan interest:** Interest also has an **outstanding amount**. More specifically, **accrued interest** is interest incurred but not yet paid, recorded as an amount **as of a date**. That date matters when someone asks what was owed at a particular point.
- **Collateral:** An appraised collateral value needs both the **value and its as-of date**; an undated value can be misleading. For a collateralized loan, we may also track **loan-to-value** and **combined loan-to-value** ratios. Those measures describe the financing against the collateral value; I wouldn’t put the ratios on the collateral itself. The security agreement remains distinct from the asset it secures.

### Turn 101 — assistant

This group surfaced **nine candidates**: outstanding principal amount; outstanding interest amount; accrued interest as a separately tracked amount with its as-of date; appraised collateral value with its as-of date; and loan-to-value and combined loan-to-value ratios. I’ve closed all nine as **declined for this scope**. They matter to balance, point-in-time amount, or valuation questions, but none of the 21 recorded questions or five reviews asks for those answers. The accrual question asks *how interest is calculated under the terms*, not how much has accrued. No canvas changes were made.

**Running ledger:** 30 surfaced; 0 added; 29 declined; 1 open—the authoritative source of the loan’s amortizing description.

Next group: **Security Agreement, Payment History, and Payment Transaction**. What exists around each in your work—such as provisions or entries, changes over time, responsible parties, related documents, values, or workflow stages? Are there values on one payment-record class that also belong on another? Describe what exists; I’ll test anything new against the recorded questions and reviews afterward.

### Turn 102 — user

- **Security agreement:** It grants the financial interest in the collateral and sets out rights and duties concerning that asset’s disposition. It’s the agreement that **secures the collateral**; it isn’t itself a payment record or a valuation.
- **Payment history:** It’s the loan’s record of actual payments made toward the obligation. Its individual payment transactions are the entries; I wouldn’t copy transaction-level details onto the history as though they described the whole record.
- **Individual payment transaction:** It records an actual payment toward principal, interest, fees, or other related amounts. We haven’t established particular transaction fields—such as a received date or amount—for this model, or a rule that each transaction covers only one kind of amount.

I haven’t identified another agreement, responsible party, workflow stage, or payment-record value from this group that the agreed questions or reviews need.

### Turn 102 — assistant

For these three classes, you’ve confirmed the existing distinctions: the Security Agreement secures collateral and sets out rights and duties concerning it; Payment History holds individual transactions; and a transaction may cover more than one kind of amount. You did not establish a new field or separate record here, so the ledger is unchanged. I won’t copy transaction-level details onto the history.

**Running ledger:** 30 surfaced; 0 added; 29 declined; 1 open—the source of the Loan’s amortizing description.

Final class group: **Fixed Interest Rate, Variable Interest Rate, and Day Count Convention**. What exists around each in your work—its characteristic values, changes or events, inputs to a calculation, related terms, or more specific kinds? Does a value recorded on one of the two rate classes also belong on the other? Describe what exists; I’ll check any new candidates against the recorded questions and actions afterward.

### Turn 103 — user

Both **fixed** and **variable interest rates** carry a numeric rate. A fixed rate does not fluctuate over the loan’s life; a variable rate can change, so the loan’s reset schedule matters. An actual reset is an event, distinct from that schedule or from setting the initial rate.

There are more specific ways a variable rate can work. A **floating rate** is based on an index or benchmark. A **managed rate** is set from time to time by the institution, rather than being prescribed as a margin over a base rate. We haven’t used either distinction in the agreed questions or reviews.

The **day-count convention** is reached through the interest payment terms. It supplies the basis for counting days when calculating accrued interest; it isn’t itself the rate or a payment frequency. We haven’t established a fixed list of conventions for this model.

### Turn 103 — assistant

The final three classes surfaced **two new candidates**: floating and managed variable rates. Both are **declined for this scope**: they are meaningful distinctions, but none of the 21 recorded questions or five reviews requires the agent to handle them differently. The numeric rate on both rate classes, the reset schedule, and the day-count connection are already recorded; the actual reset event was assessed and declined earlier.

All **22 classes** have now been covered. Nothing from this pass was added to the canvas. One candidate is **left open**: where the authoritative determination that a loan is amortizing comes from. The existing rule therefore remains conditional on that determination being supplied independently.

COVERAGE LEDGER: surfaced=32; added=0; declined=31; open=1

### Turn 104 — user

One last pass, on wording: I would like the model to use our own words.

Call get_graph_state first. Then go through what is on the canvas, three to five items per question, relationships first, then properties, then classes:
- for each relationship, ask me what we call this connection ourselves, in one verb phrase, and which way round we would say it;
- for each property and each class, ask me whether that is what we would call it, or whether we have our own term for it.

Record each answer with the rename_ontology_elements tool: a relationship takes my verb phrase, and if I state it the other way round it is turned round (reverse: true); a property or a class takes my term. Previous names of classes and relationships are kept as aliases automatically. Where I say the current name is already right, leave it as it is. Do not add or remove anything in this pass.

When every relationship, property and class has been asked about, end that message with one line in exactly this form, and ask nothing further in it:
NAMING LEDGER: relationships_renamed=<number>; relationships_redirected=<number>; properties_renamed=<number>; classes_renamed=<number>

### Turn 104 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 104 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: "The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms."
    aliases: []
    properties:
      agreedPrincipalAmount:
        type: number
      maturityDate:
        type: date
  Borrower:
    meaning: The party that owes repayment on the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party that provides the credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting principal and interest on the lender's behalf."
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Shows scheduled changes in the loan's debt balance over time, not payments actually received."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: Shows when principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: Shows when interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: "Shows when interest is calculated, separately from when it is paid."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: Shows when a variable interest rate and its resulting value are recalculated.
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: "The loan's general payment timetable."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "The terms stating when and how the loan's principal is to be paid."
    aliases: []
    properties:
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
  InterestPaymentTerms:
    meaning: "The terms stating when interest is paid and how it accrues, pointing to the day-count convention that supplies the accrual basis."
    aliases: []
    properties:
      initialInterestAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      compoundingFrequency:
        type: text
      paymentDay:
        type: text
  PrepaymentTerms:
    meaning: "Terms governing repayment of principal before maturity, which may specify a penalty period."
    aliases: []
    properties:
      prepaymentPenaltyPeriod:
        type: number
        unit: months
  LoanPrincipal:
    meaning: "The amount of the obligation to be repaid, separate from interest; its agreed amount is recorded on the loan and its outstanding amount changes as it is repaid."
    aliases: []
    properties: {}
  LoanInterest:
    meaning: "Interest is the cost of using the credit, distinct from the rate expressing how that cost is charged over time and from principal."
    aliases: []
    properties: {}
  Collateral:
    meaning: Property pledged to support repayment of the loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: The agreement granting a financial interest in pledged collateral and setting out rights concerning it.
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The loan's record of actual payments made toward its obligation, comprising individual payment transactions."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An individual entry recording an actual payment in the loan's payment history, which need not cover only one kind of amount."
    aliases: []
    properties: {}
  FixedInterestRate:
    meaning: An applicable numeric interest rate that does not fluctuate over the life of the loan.
    aliases: []
    properties:
      rateValue:
        type: number
  VariableInterestRate:
    meaning: "An applicable numeric interest rate allowed to change over the life of the loan, with a reset schedule stating when it and its resulting value are recalculated."
    aliases: []
    properties:
      rateValue:
        type: number
  DayCountConvention:
    meaning: The convention used as the day-count basis for calculating accrued interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the party that owes repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the party that extended the credit.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting principal and interest on the lender's behalf."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: LoanPrincipal
    meaning: "Identifies the loan's principal obligation, not its agreed or outstanding amount alone."
    aliases: []
  - name: hasInterest
    from: Loan
    to: LoanInterest
    meaning: "Identifies the loan's interest obligation, not its interest rate."
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: LoanPrincipal
    meaning: Principal repayment terms govern when and how the linked loan principal is paid.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: LoanInterest
    meaning: Interest payment terms govern payment of the linked loan interest.
    aliases: []
  - name: setsAccrualBasisBy
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count convention that the interest payment terms use as the basis for interest accrual.
    aliases: []
  - name: governsPaymentOf
    from: PrepaymentTerms
    to: LoanPrincipal
    meaning: Applicable prepayment terms govern payment of the linked loan principal before maturity.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies an amortization schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies a principal payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies an interest payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies an interest calculation schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies an interest rate reset schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies a general payment schedule associated with the loan when on file; it is not required for every loan.
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: Identifies pledged collateral supporting the loan when the loan is backed by pledged collateral; a guaranteed loan does not automatically have this connection.
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement grants a financial interest in the linked pledged collateral.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of actual payments."
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: PaymentTransaction
    meaning: Identifies an actual payment entry in the history without assuming it covers only one kind of amount.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applying to the loan when its rate is fixed.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applying to the loan when its rate is variable.
    aliases: []
rules:
  servicingHandoffReadiness:
    conditions:
      - Confirm the loan has a borrower through hasBorrower and a lender through hasLender.
      - "When an authoritative source outside this model establishes that interest is payable, confirm the loan has an applicable fixed or variable interest rate through hasInterestRate and interest payment terms govern its LoanInterest through governsPaymentOf."
      - "If whether interest is payable has not been independently established, leave the interest portion undecided; absence of an interest rate or interest payment terms does not prove that interest is not payable."
  collateralSupportRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is backed by pledged collateral, confirm that Loan collateralizedBy Collateral is recorded."
      - "If collateral backing has not been independently established, leave applicability of the collateral-link check undecided; a missing collateralizedBy link does not prove the loan is not collateral-backed."
      - Identification as guaranteed alone does not trigger this check; this rule checks only the Loan collateralizedBy Collateral link.
  variableRateSetupRecorded:
    conditions:
      - "When Loan hasInterestRate VariableInterestRate is recorded, confirm Loan hasInterestRateResetSchedule InterestRateResetSchedule is also recorded."
      - "If a variable interest rate is recorded but no interest rate reset schedule is linked to the loan, variable-rate setup cannot be confirmed."
      - "If neither a fixed nor a variable hasInterestRate link is recorded, leave the rate type undecided rather than inferring fixed-rate status."
  paymentRecordComplete:
    conditions:
      - Confirm Loan hasPaymentHistory PaymentHistory and that PaymentHistory hasIndividualPayment at least one PaymentTransaction.
      - "If a history is present but has no individual payment transactions recorded, report no individual payments recorded and do not confirm completeness; do not infer that no payment was ever made."
      - "If the Loan hasPaymentHistory link is absent, report no linked payment history separately and do not confirm completeness."
  prepaymentPenaltyTimingRecorded:
    conditions:
      - "Find Loan hasPrincipal LoanPrincipal and applicable PrepaymentTerms governsPaymentOf that LoanPrincipal; if prepaymentPenaltyPeriod is recorded in months, confirm the recorded penalty timing."
      - "If no applicable PrepaymentTerms are found, leave what prepayment terms apply and penalty timing unconfirmed; do not infer that prepayment is prohibited or penalty-free."
      - "If PrepaymentTerms are found but prepaymentPenaltyPeriod is absent, report no prepayment penalty period recorded and do not confirm penalty timing or infer that no penalty applies."
  amortizingSetupRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is amortizing, confirm Loan hasAmortizationSchedule AmortizationSchedule and that PrincipalRepaymentTerms governsPaymentOf its LoanPrincipal reached by hasPrincipal."
      - "If amortizing structure has not been independently established, leave the check undecided; the presence or absence of an amortization schedule alone does not establish that structure."
  compareApplicableSchedules:
    conditions:
      - "Report which AmortizationSchedule, PrincipalPaymentSchedule, InterestPaymentSchedule, InterestCalculationSchedule, InterestRateResetSchedule, and LoanPaymentSchedule are linked to the Loan through their respective loan-to-schedule relationships."
      - "For principal payment, interest payment, interest calculation, and general loan payment schedules, compare recorded loan-to-schedule links against schedules independently determined from governing terms and loan structure to be required; a payment date or frequency alone does not establish that a separate schedule is required."
      - "Without that independent determination, leave which of those four schedules should apply undecided; an absent link alone is not a failed requirement."
      - Apply the separately recorded amortizing and variable-rate setup rules when their applicability is established.
  identifySecuredLoanSupport:
    conditions:
      - Report guaranteed support only when a person or another authoritative source has independently established that the loan is guaranteed; otherwise leave guarantee status undecided.
      - "Check whether the loan is backed by pledged collateral independently of guarantee status; where pledged backing is independently established, use Loan collateralizedBy Collateral to identify recorded pledged support."
      - An absent Loan collateralizedBy Collateral link alone proves neither that the loan is unsecured nor that it is guaranteed; guarantee and pledged collateral may both apply to the same loan.
      - "If the basis for classifying the loan as secured has not been independently established, leave the overall secured determination undecided."
  findGoverningTermsAndAgreement:
    conditions:
      - "For a loan's principal reached by hasPrincipal, find PrincipalRepaymentTerms or PrepaymentTerms whose governsPaymentOf link targets that LoanPrincipal; for interest reached by hasInterest, find InterestPaymentTerms whose governsPaymentOf link targets that LoanInterest."
      - "For collateral reached through Loan collateralizedBy Collateral, find SecurityAgreement whose secures link targets that Collateral."
      - "These searches require lookup by relationship target without reversing the stored links. If a target-based lookup is unavailable, report that the relevant terms or security agreement cannot be verified through these paths; do not report that records are absent."
actions:
  assessServicingHandoffReadiness:
    input: Loan
    preconditions:
      - servicingHandoffReadiness
    effect: "Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record."
    verification: "Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate, then search InterestPaymentTerms whose governsPaymentOf link targets the LoanInterest reached through hasInterest. If target-based lookup is unavailable, report that the terms portion cannot be verified, not that terms are absent."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - collateralSupportRecorded
    effect: Report whether pledged-collateral support is recorded when pledged backing has been independently established; otherwise report applicability undecided. Do not change the loan record.
    verification: "When pledged backing is independently established, reread Loan collateralizedBy Collateral and confirm the finding matches the recorded link; when backing is unestablished, confirm no conclusion is inferred from an absent link."
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupRecorded
    effect: "Report whether a recorded variable interest rate is accompanied by an interest rate reset schedule; if neither rate kind is recorded, report rate type undecided. Do not calculate future or past rate values or change the loan record."
    verification: "Reread Loan hasInterestRate VariableInterestRate and Loan hasInterestRateResetSchedule InterestRateResetSchedule; if neither Loan hasInterestRate VariableInterestRate nor Loan hasInterestRate FixedInterestRate is recorded, confirm the report leaves rate type undecided."
  checkPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordComplete
    effect: Report whether a linked PaymentHistory has at least one individual PaymentTransaction; distinguish no linked history from linked history with no individual payments recorded. Neither absence establishes that no payment was ever made. Do not change the loan record.
    verification: "Reread Loan hasPaymentHistory PaymentHistory and PaymentHistory hasIndividualPayment PaymentTransaction; confirm the report distinguishes no history, an empty linked history, and a history with at least one entry."
  reviewRecordedPrepaymentPenaltyTiming:
    input: Loan
    preconditions:
      - prepaymentPenaltyTimingRecorded
    effect: "Report the recorded prepayment penalty period in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded period. Do not decide whether a particular early payment incurs a charge or change the loan record."
    verification: "Identify the LoanPrincipal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm any reported period matches its prepaymentPenaltyPeriod; distinguish absent terms from a missing period. If target-based lookup is unavailable, report that terms cannot be verified, not that they are absent."


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "assessServicingHandoffReadiness" has input class Loan, and its precondition servicingHandoffReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewRecordedPrepaymentPenaltyTiming" has input class Loan, and its precondition prepaymentPenaltyTimingRecorded refers to PrepaymentTerms, which is only reachable against the direction of the relationships between them.

### Turn 104 — assistant

I checked the live canvas first. I’ll review its **21 relationships**, then its properties, then its **22 classes**, in groups of three to five. I’ll rename only what you change; a relationship can also be turned around if that is how you state it.

For these first five connections, what **one verb phrase** would you use for each, and which direction would you say it? If a name and direction are already right, say “keep.”

1. Loan → **has borrower** → Borrower
2. Loan → **has lender** → Lender
3. Loan → **serviced by** → Servicer
4. Loan → **has principal** → Loan Principal
5. Loan → **has interest** → Loan Interest

### Turn 105 — user

Keep all five, in the directions shown. The loan has a borrower, has a lender, is serviced by a servicer, has principal, and has interest.

### Turn 105 — assistant

Those five names and directions stay as they are; no rename was needed.

For the next five, what verb phrase and direction would you use? “Keep” is fine for any that already sound right.

1. Principal Repayment Terms → **governs payment of** → Loan Principal
2. Interest Payment Terms → **governs payment of** → Loan Interest
3. Interest Payment Terms → **sets accrual basis by** → Day Count Convention
4. Prepayment Terms → **governs payment of** → Loan Principal
5. Loan → **has amortization schedule** → Amortization Schedule

### Turn 106 — user

Keep 1, 2, and 4 in the directions shown.

For 3, keep the direction, but I’d say **interest payment terms have an accrual basis**: the day-count convention. “Sets accrual basis by” sounds like the terms create the convention.

For 5, keep the direction, but I’d say the loan **has a schedule**—in this case, an amortization schedule. That uses the same phrasing as its links to the other schedules.

### Turn 106 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "setsAccrualBasisBy",
      "to": "hasAccrualBasis",
      "className": "",
      "source": "InterestPaymentTerms",
      "target": "DayCountConvention",
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
    }
  ]
}
```

### Turn 106 — tool

Renamed 2 of 2:
- relationship "setsAccrualBasisBy" (InterestPaymentTerms → DayCountConvention) → "hasAccrualBasis" (InterestPaymentTerms → DayCountConvention)
- relationship "hasAmortizationSchedule" (Loan → AmortizationSchedule) → "hasSchedule" (Loan → AmortizationSchedule)

### Turn 106 — assistant

I’ve renamed the two connections you changed, without turning either arrow around: **Interest Payment Terms → has accrual basis → Day Count Convention** and **Loan → has schedule → Amortization Schedule**. The other three stay as they were.

For the next five Loan-to-schedule links, would you also say **“has a schedule”** in each direction shown, or use a different phrase for any one?

1. Loan → Principal Payment Schedule — currently **has principal payment schedule**
2. Loan → Interest Payment Schedule — currently **has interest payment schedule**
3. Loan → Interest Calculation Schedule — currently **has interest calculation schedule**
4. Loan → Interest Rate Reset Schedule — currently **has interest rate reset schedule**
5. Loan → Loan Payment Schedule — currently **has loan payment schedule**

### Turn 107 — user

I’d use **“has a schedule”** for all five, with each arrow still running from the loan to the named schedule. The schedule’s kind tells you whether it covers principal due dates, interest due dates, calculations, resets, or the general payment timetable. Same wording applies to the amortization schedule.

### Turn 107 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
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
    },
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
      "from": "hasLoanPaymentSchedule",
      "to": "hasSchedule",
      "className": "",
      "source": "Loan",
      "target": "LoanPaymentSchedule",
      "reverse": false
    }
  ]
}
```

### Turn 107 — tool

Renamed 5 of 5:
- relationship "hasPrincipalPaymentSchedule" (Loan → PrincipalPaymentSchedule) → "hasSchedule" (Loan → PrincipalPaymentSchedule)
- relationship "hasInterestPaymentSchedule" (Loan → InterestPaymentSchedule) → "hasSchedule" (Loan → InterestPaymentSchedule)
- relationship "hasInterestCalculationSchedule" (Loan → InterestCalculationSchedule) → "hasSchedule" (Loan → InterestCalculationSchedule)
- relationship "hasInterestRateResetSchedule" (Loan → InterestRateResetSchedule) → "hasSchedule" (Loan → InterestRateResetSchedule)
- relationship "hasLoanPaymentSchedule" (Loan → LoanPaymentSchedule) → "hasSchedule" (Loan → LoanPaymentSchedule)

### Turn 107 — assistant

Those five Loan-to-schedule connections now all use **has schedule**, with their directions unchanged. That makes seven relationship renames so far and no redirects.

For the next five, what one verb phrase and direction would you use? Say “keep” where the current wording is right.

1. Loan → **collateralized by** → Collateral
2. Security Agreement → **secures** → Collateral
3. Loan → **has payment history** → Payment History
4. Payment History → **has individual payment** → Payment Transaction
5. Loan → **has interest rate** → Fixed Interest Rate

### Turn 108 — user

Keep all five names and directions. For the first, read it as applying to a loan **backed by pledged collateral**; it doesn’t imply every secured or guaranteed loan has a collateral link.

### Turn 108 — assistant

Those five connection names and directions stay as they are. **Collateralized by** remains conditional on pledged collateral; it does not apply to every secured or guaranteed loan.

One relationship remains: Loan → **has interest rate** → Variable Interest Rate. Would you keep that verb phrase and direction, as you did for the fixed-rate link?

### Turn 109 — user

Keep it. The loan **has an interest rate**, whether the applicable rate is fixed or variable. The variable-rate case also calls for checking the loan’s interest rate reset schedule.

### Turn 109 — assistant

The variable-rate link also stays **Loan → has interest rate → Variable Interest Rate**. That completes the relationship naming pass: **7 renamed, 0 redirected**.

Now properties. For each of these five, is the current name what you would use, or do you have another term? “Keep” is fine.

1. Loan: **agreed principal amount**
2. Loan: **maturity date**
3. Principal Repayment Terms: **initial principal payment date**
4. Principal Repayment Terms: **principal repayment date**
5. Principal Repayment Terms: **payment frequency**

### Turn 110 — user

Keep 1–4. For 5, I’d call it **principal payment frequency** so it stays distinct from interest payment frequency. It records how often principal payments are due under those terms.

### Turn 110 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "paymentFrequency",
      "to": "principalPaymentFrequency",
      "className": "PrincipalRepaymentTerms",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 110 — tool

Renamed 1 of 1:
- property "PrincipalRepaymentTerms.paymentFrequency" → "principalPaymentFrequency"

### Turn 110 — assistant

I’ve renamed that property to **principal payment frequency**. The other four names in that group stay unchanged.

For the next five properties, would you keep these names or use your own term for any of them?

1. Principal Repayment Terms: **payment day**
2. Interest Payment Terms: **initial interest accrual date**
3. Interest Payment Terms: **initial interest payment date**
4. Interest Payment Terms: **final interest payment date**
5. Interest Payment Terms: **payment frequency**

### Turn 111 — user

Keep 2–4. I’d distinguish the two generic names:

1. On principal repayment terms, use **principal payment day**.
5. On interest payment terms, use **interest payment frequency**.

That makes it clear which obligation each value describes.

### Turn 111 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "paymentDay",
      "to": "principalPaymentDay",
      "className": "PrincipalRepaymentTerms",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "paymentFrequency",
      "to": "interestPaymentFrequency",
      "className": "InterestPaymentTerms",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 111 — tool

Renamed 2 of 2:
- property "PrincipalRepaymentTerms.paymentDay" → "principalPaymentDay"
- property "InterestPaymentTerms.paymentFrequency" → "interestPaymentFrequency"

### Turn 111 — assistant

I’ve renamed those two properties to **principal payment day** and **interest payment frequency**. The three date names stay unchanged. So far, **3 properties** have been renamed.

For the five remaining properties, are these your terms, or would you rename any of them?

1. Interest Payment Terms: **compounding frequency**
2. Interest Payment Terms: **payment day**
3. Prepayment Terms: **prepayment penalty period**
4. Fixed Interest Rate: **rate value**
5. Variable Interest Rate: **rate value**

### Turn 112 — user

Keep **compounding frequency**. I’d adjust the other names slightly:

- On interest payment terms, **interest payment day**.
- On prepayment terms, **prepayment penalty term, in months**—that makes the recorded unit explicit.
- On both fixed and variable interest rates, simply **rate**. The record’s kind already tells us whether it’s fixed or variable.

### Turn 112 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "paymentDay",
      "to": "interestPaymentDay",
      "className": "InterestPaymentTerms",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "prepaymentPenaltyPeriod",
      "to": "prepaymentPenaltyTermInMonths",
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
    }
  ]
}
```

### Turn 112 — tool

Renamed 4 of 4:
- property "InterestPaymentTerms.paymentDay" → "interestPaymentDay"
- property "PrepaymentTerms.prepaymentPenaltyPeriod" → "prepaymentPenaltyTermInMonths"
- property "FixedInterestRate.rateValue" → "rate"
- property "VariableInterestRate.rateValue" → "rate"

### Turn 112 — assistant

I’ve renamed those four properties: **interest payment day**, **prepayment penalty term in months**, and **rate** on each of the fixed and variable rate classes. **Compounding frequency** stays. That completes the property pass: **7 renamed**.

Now classes. For each of these five, is the current name what you use, or do you have another term for the same thing?

1. Loan
2. Borrower
3. Lender
4. Servicer
5. Amortization Schedule

### Turn 113 — user

Keep all five. Those names are what I’d use for the same things in servicing.

### Turn 113 — assistant

Those five class names stay unchanged.

For the next five schedule classes, would you keep each name or use another term for the same thing?

1. Principal Payment Schedule
2. Interest Payment Schedule
3. Interest Calculation Schedule
4. Interest Rate Reset Schedule
5. Loan Payment Schedule

### Turn 114 — user

Keep all five. Each names a different schedule we may need to identify on the loan.

### Turn 114 — assistant

Those five schedule class names stay unchanged.

For the next five classes, would you keep each name or use another term for the same thing?

1. Principal Repayment Terms
2. Interest Payment Terms
3. Prepayment Terms
4. Loan Principal
5. Loan Interest

### Turn 115 — user

Keep **Principal Repayment Terms**, **Interest Payment Terms**, and **Prepayment Terms**.

For the last two, I’d use **Principal** and **Interest**. They’re the distinct obligations associated with the loan; “loan” in each name isn’t needed to identify them. Principal remains separate from the agreed principal amount and the changing outstanding amount, and interest remains separate from the interest rate.

### Turn 115 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "LoanPrincipal",
      "to": "Principal",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "class",
      "from": "LoanInterest",
      "to": "Interest",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 115 — tool

Renamed 2 of 2:
- class "LoanPrincipal" → "Principal" (previous name kept as an alias)
- class "LoanInterest" → "Interest" (previous name kept as an alias)

### Turn 115 — assistant

I’ve renamed **Loan Principal** to **Principal** and **Loan Interest** to **Interest**. Their former names remain aliases, and the distinctions from amounts and rates remain intact. The other three class names stay unchanged.

For the next four classes, would you keep each name or use another term for the same thing?

1. Collateral
2. Security Agreement
3. Payment History
4. Payment Transaction

### Turn 116 — user

Keep **Collateral**, **Security Agreement**, and **Payment History**.

I’d call the fourth **Individual Payment Transaction**. That makes clear it’s an actual payment entry in the history, rather than any transaction connected with the loan.

### Turn 116 — assistant

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

### Turn 116 — tool

Renamed 1 of 1:
- class "PaymentTransaction" → "IndividualPaymentTransaction" (previous name kept as an alias)

### Turn 116 — assistant

I’ve renamed **Payment Transaction** to **Individual Payment Transaction**; its former name remains an alias. Collateral, Security Agreement, and Payment History stay unchanged.

For the last three classes, would you keep each name or use another term for the same thing?

1. Fixed Interest Rate
2. Variable Interest Rate
3. Day Count Convention

### Turn 117 — user

Keep all three. The fixed-versus-variable distinction matters to the reset-schedule check, and the day-count convention remains the accrual basis identified through interest payment terms.

### Turn 117 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 117 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower on a loan?
  - id: cq2
    text: Who is the lender on a loan?
  - id: cq3
    text: What is the agreed principal amount of a loan?
  - id: cq4
    text: Which interest rate applies to a loan?
  - id: cq5
    text: "Is a loan's interest rate fixed or variable?"
  - id: cq6
    text: "If a loan's interest rate is variable, what is its reset schedule?"
  - id: cq7
    text: "What is a loan's maturity date?"
  - id: cq8
    text: "When and how is principal due under a loan's terms?"
  - id: cq9
    text: "When is interest due under a loan's terms?"
  - id: cq10
    text: "How is interest accrual calculated under a loan's terms?"
  - id: cq11
    text: Which schedules apply to a loan under its terms?
  - id: cq12
    text: Are the applicable schedules on file for the loan?
  - id: cq13
    text: Is the loan secured?
  - id: cq14
    text: What pledged collateral or guarantee supports a secured loan?
  - id: cq15
    text: "Where collateral is pledged, which collateral is linked to the loan?"
  - id: cq16
    text: "Where collateral is pledged, which security agreement covers it?"
  - id: cq17
    text: "Who services the loan and collects its payments on the lender's behalf?"
  - id: cq18
    text: What payments have actually been received on a loan?
  - id: cq19
    text: "Which individual transactions make up a loan's payment history?"
  - id: cq20
    text: What prepayment terms apply to a loan?
  - id: cq21
    text: What prepayment penalty period is recorded for a loan?
classes:
  Loan:
    meaning: "The debt being serviced: money or credit extended to a borrower, to be repaid under its agreed terms."
    aliases: []
    properties:
      agreedPrincipalAmount:
        type: number
      maturityDate:
        type: date
  Borrower:
    meaning: The party that owes repayment on the loan.
    aliases: []
    properties: {}
  Lender:
    meaning: The party that provides the credit.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party responsible for collecting principal and interest on the lender's behalf."
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: "Shows scheduled changes in the loan's debt balance over time, not payments actually received."
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: Shows when principal payments are due.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: Shows when interest payments are due.
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: "Shows when interest is calculated, separately from when it is paid."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: Shows when a variable interest rate and its resulting value are recalculated.
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: "The loan's general payment timetable."
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: "The terms stating when and how the loan's principal is to be paid."
    aliases: []
    properties:
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      principalPaymentFrequency:
        type: text
      principalPaymentDay:
        type: text
  InterestPaymentTerms:
    meaning: "The terms stating when interest is paid and how it accrues, pointing to the day-count convention that supplies the accrual basis."
    aliases: []
    properties:
      initialInterestAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      interestPaymentFrequency:
        type: text
      compoundingFrequency:
        type: text
      interestPaymentDay:
        type: text
  PrepaymentTerms:
    meaning: "Terms governing repayment of principal before maturity, which may specify a penalty period."
    aliases: []
    properties:
      prepaymentPenaltyTermInMonths:
        type: number
        unit: months
  Principal:
    meaning: "The amount of the obligation to be repaid, separate from interest; its agreed amount is recorded on the loan and its outstanding amount changes as it is repaid."
    aliases:
      - LoanPrincipal
    properties: {}
  Interest:
    meaning: "Interest is the cost of using the credit, distinct from the rate expressing how that cost is charged over time and from principal."
    aliases:
      - LoanInterest
    properties: {}
  Collateral:
    meaning: Property pledged to support repayment of the loan.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: The agreement granting a financial interest in pledged collateral and setting out rights concerning it.
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The loan's record of actual payments made toward its obligation, comprising individual payment transactions."
    aliases: []
    properties: {}
  IndividualPaymentTransaction:
    meaning: "An individual entry recording an actual payment in the loan's payment history, which need not cover only one kind of amount."
    aliases:
      - PaymentTransaction
    properties: {}
  FixedInterestRate:
    meaning: An applicable numeric interest rate that does not fluctuate over the life of the loan.
    aliases: []
    properties:
      rate:
        type: number
  VariableInterestRate:
    meaning: "An applicable numeric interest rate allowed to change over the life of the loan, with a reset schedule stating when it and its resulting value are recalculated."
    aliases: []
    properties:
      rate:
        type: number
  DayCountConvention:
    meaning: The convention used as the day-count basis for calculating accrued interest.
    aliases: []
    properties: {}
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: Identifies the party that owes repayment on the loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: Identifies the party that extended the credit.
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "Identifies the party collecting principal and interest on the lender's behalf."
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: "Identifies the loan's principal obligation, not its agreed or outstanding amount alone."
    aliases: []
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: "Identifies the loan's interest obligation, not its interest rate."
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: Principal repayment terms govern when and how the linked loan principal is paid.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: Interest payment terms govern payment of the linked loan interest.
    aliases: []
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: Identifies the day-count convention that the interest payment terms use as the basis for interest accrual.
    aliases:
      - setsAccrualBasisBy
  - name: governsPaymentOf
    from: PrepaymentTerms
    to: Principal
    meaning: Applicable prepayment terms govern payment of the linked loan principal before maturity.
    aliases: []
  - name: hasSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: Identifies an amortization schedule associated with the loan when on file; it is not required for every loan.
    aliases:
      - hasAmortizationSchedule
  - name: hasSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: Identifies a principal payment schedule associated with the loan when on file; it is not required for every loan.
    aliases:
      - hasPrincipalPaymentSchedule
  - name: hasSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: Identifies an interest payment schedule associated with the loan when on file; it is not required for every loan.
    aliases:
      - hasInterestPaymentSchedule
  - name: hasSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: Identifies an interest calculation schedule associated with the loan when on file; it is not required for every loan.
    aliases:
      - hasInterestCalculationSchedule
  - name: hasSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: Identifies an interest rate reset schedule associated with the loan when on file; it is not required for every loan.
    aliases:
      - hasInterestRateResetSchedule
  - name: hasSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: Identifies a general payment schedule associated with the loan when on file; it is not required for every loan.
    aliases:
      - hasLoanPaymentSchedule
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: Identifies pledged collateral supporting the loan when the loan is backed by pledged collateral; a guaranteed loan does not automatically have this connection.
    aliases: []
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement grants a financial interest in the linked pledged collateral.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: "Identifies the loan's record of actual payments."
    aliases: []
  - name: hasIndividualPayment
    from: PaymentHistory
    to: IndividualPaymentTransaction
    meaning: Identifies an actual payment entry in the history without assuming it covers only one kind of amount.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: FixedInterestRate
    meaning: Identifies the fixed interest rate applying to the loan when its rate is fixed.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: VariableInterestRate
    meaning: Identifies the variable interest rate applying to the loan when its rate is variable.
    aliases: []
rules:
  servicingHandoffReadiness:
    conditions:
      - Confirm the loan has a borrower through hasBorrower and a lender through hasLender.
      - "When an authoritative source outside this model establishes that interest is payable, confirm the loan has an applicable fixed or variable interest rate through hasInterestRate and interest payment terms govern its LoanInterest through governsPaymentOf."
      - "If whether interest is payable has not been independently established, leave the interest portion undecided; absence of an interest rate or interest payment terms does not prove that interest is not payable."
  collateralSupportRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is backed by pledged collateral, confirm that Loan collateralizedBy Collateral is recorded."
      - "If collateral backing has not been independently established, leave applicability of the collateral-link check undecided; a missing collateralizedBy link does not prove the loan is not collateral-backed."
      - Identification as guaranteed alone does not trigger this check; this rule checks only the Loan collateralizedBy Collateral link.
  variableRateSetupRecorded:
    conditions:
      - "When Loan hasInterestRate VariableInterestRate is recorded, confirm Loan hasInterestRateResetSchedule InterestRateResetSchedule is also recorded."
      - "If a variable interest rate is recorded but no interest rate reset schedule is linked to the loan, variable-rate setup cannot be confirmed."
      - "If neither a fixed nor a variable hasInterestRate link is recorded, leave the rate type undecided rather than inferring fixed-rate status."
  paymentRecordComplete:
    conditions:
      - Confirm Loan hasPaymentHistory PaymentHistory and that PaymentHistory hasIndividualPayment at least one PaymentTransaction.
      - "If a history is present but has no individual payment transactions recorded, report no individual payments recorded and do not confirm completeness; do not infer that no payment was ever made."
      - "If the Loan hasPaymentHistory link is absent, report no linked payment history separately and do not confirm completeness."
  prepaymentPenaltyTimingRecorded:
    conditions:
      - "Find Loan hasPrincipal LoanPrincipal and applicable PrepaymentTerms governsPaymentOf that LoanPrincipal; if prepaymentPenaltyPeriod is recorded in months, confirm the recorded penalty timing."
      - "If no applicable PrepaymentTerms are found, leave what prepayment terms apply and penalty timing unconfirmed; do not infer that prepayment is prohibited or penalty-free."
      - "If PrepaymentTerms are found but prepaymentPenaltyPeriod is absent, report no prepayment penalty period recorded and do not confirm penalty timing or infer that no penalty applies."
  amortizingSetupRecorded:
    conditions:
      - "When an authoritative source independently establishes that the loan is amortizing, confirm Loan hasAmortizationSchedule AmortizationSchedule and that PrincipalRepaymentTerms governsPaymentOf its LoanPrincipal reached by hasPrincipal."
      - "If amortizing structure has not been independently established, leave the check undecided; the presence or absence of an amortization schedule alone does not establish that structure."
  compareApplicableSchedules:
    conditions:
      - "Report which AmortizationSchedule, PrincipalPaymentSchedule, InterestPaymentSchedule, InterestCalculationSchedule, InterestRateResetSchedule, and LoanPaymentSchedule are linked to the Loan through their respective loan-to-schedule relationships."
      - "For principal payment, interest payment, interest calculation, and general loan payment schedules, compare recorded loan-to-schedule links against schedules independently determined from governing terms and loan structure to be required; a payment date or frequency alone does not establish that a separate schedule is required."
      - "Without that independent determination, leave which of those four schedules should apply undecided; an absent link alone is not a failed requirement."
      - Apply the separately recorded amortizing and variable-rate setup rules when their applicability is established.
  identifySecuredLoanSupport:
    conditions:
      - Report guaranteed support only when a person or another authoritative source has independently established that the loan is guaranteed; otherwise leave guarantee status undecided.
      - "Check whether the loan is backed by pledged collateral independently of guarantee status; where pledged backing is independently established, use Loan collateralizedBy Collateral to identify recorded pledged support."
      - An absent Loan collateralizedBy Collateral link alone proves neither that the loan is unsecured nor that it is guaranteed; guarantee and pledged collateral may both apply to the same loan.
      - "If the basis for classifying the loan as secured has not been independently established, leave the overall secured determination undecided."
  findGoverningTermsAndAgreement:
    conditions:
      - "For a loan's principal reached by hasPrincipal, find PrincipalRepaymentTerms or PrepaymentTerms whose governsPaymentOf link targets that LoanPrincipal; for interest reached by hasInterest, find InterestPaymentTerms whose governsPaymentOf link targets that LoanInterest."
      - "For collateral reached through Loan collateralizedBy Collateral, find SecurityAgreement whose secures link targets that Collateral."
      - "These searches require lookup by relationship target without reversing the stored links. If a target-based lookup is unavailable, report that the relevant terms or security agreement cannot be verified through these paths; do not report that records are absent."
actions:
  assessServicingHandoffReadiness:
    input: Loan
    preconditions:
      - servicingHandoffReadiness
    effect: "Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record."
    verification: "Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate, then search InterestPaymentTerms whose governsPaymentOf link targets the LoanInterest reached through hasInterest. If target-based lookup is unavailable, report that the terms portion cannot be verified, not that terms are absent."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - collateralSupportRecorded
    effect: Report whether pledged-collateral support is recorded when pledged backing has been independently established; otherwise report applicability undecided. Do not change the loan record.
    verification: "When pledged backing is independently established, reread Loan collateralizedBy Collateral and confirm the finding matches the recorded link; when backing is unestablished, confirm no conclusion is inferred from an absent link."
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetupRecorded
    effect: "Report whether a recorded variable interest rate is accompanied by an interest rate reset schedule; if neither rate kind is recorded, report rate type undecided. Do not calculate future or past rate values or change the loan record."
    verification: "Reread Loan hasInterestRate VariableInterestRate and Loan hasInterestRateResetSchedule InterestRateResetSchedule; if neither Loan hasInterestRate VariableInterestRate nor Loan hasInterestRate FixedInterestRate is recorded, confirm the report leaves rate type undecided."
  checkPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordComplete
    effect: Report whether a linked PaymentHistory has at least one individual PaymentTransaction; distinguish no linked history from linked history with no individual payments recorded. Neither absence establishes that no payment was ever made. Do not change the loan record.
    verification: "Reread Loan hasPaymentHistory PaymentHistory and PaymentHistory hasIndividualPayment PaymentTransaction; confirm the report distinguishes no history, an empty linked history, and a history with at least one entry."
  reviewRecordedPrepaymentPenaltyTiming:
    input: Loan
    preconditions:
      - prepaymentPenaltyTimingRecorded
    effect: "Report the recorded prepayment penalty period in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded period. Do not decide whether a particular early payment incurs a charge or change the loan record."
    verification: "Identify the LoanPrincipal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm any reported period matches its prepaymentPenaltyPeriod; distinguish absent terms from a missing period. If target-based lookup is unavailable, report that terms cannot be verified, not that they are absent."


# CONSISTENCY CHECK — 8 outstanding problem(s) in the whole model:
#   [warning] unknown-property-reference — Rule "amortizingSetupRecorded" (condition 1) refers to "hasAmortizationSchedule", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "prepaymentPenaltyTimingRecorded" (condition 1) refers to "prepaymentPenaltyPeriod", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "prepaymentPenaltyTimingRecorded" (condition 3) refers to "prepaymentPenaltyPeriod", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "reviewRecordedPrepaymentPenaltyTiming" (verification) refers to "prepaymentPenaltyPeriod", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "reviewVariableRateSetup" (verification) refers to "hasInterestRateResetSchedule", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Rule "variableRateSetupRecorded" (condition 1) refers to "hasInterestRateResetSchedule", which is not a property, relationship, class, rule or action in this model.
#   [warning] unreachable-from-action-input — Action "assessServicingHandoffReadiness" has input class Loan, and its precondition servicingHandoffReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewRecordedPrepaymentPenaltyTiming" has input class Loan, and its precondition prepaymentPenaltyTimingRecorded refers to PrepaymentTerms, which is only reachable against the direction of the relationships between them.

### Turn 117 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  servicingHandoffReadiness:\n    conditions:\n      - Confirm the loan has a borrower through hasBorrower and a lender through hasLender.\n      - When an authoritative source outside this model establishes that interest is payable, confirm the loan has an applicable fixed or variable interest rate through hasInterestRate and interest payment terms govern its Interest through governsPaymentOf.\n      - If whether interest is payable has not been independently established, leave the interest portion undecided; absence of an interest rate or interest payment terms does not prove that interest is not payable.\n  variableRateSetupRecorded:\n    conditions:\n      - When Loan hasInterestRate VariableInterestRate is recorded, confirm Loan hasSchedule InterestRateResetSchedule is also recorded.\n      - If a variable interest rate is recorded but no interest rate reset schedule is linked to the loan, variable-rate setup cannot be confirmed.\n      - If neither a fixed nor a variable hasInterestRate link is recorded, leave the rate type undecided rather than inferring fixed-rate status.\n  paymentRecordComplete:\n    conditions:\n      - Confirm Loan hasPaymentHistory PaymentHistory and that PaymentHistory hasIndividualPayment at least one IndividualPaymentTransaction.\n      - If a history is present but has no individual payment transactions recorded, report no individual payments recorded and do not confirm completeness; do not infer that no payment was ever made.\n      - If the Loan hasPaymentHistory link is absent, report no linked payment history separately and do not confirm completeness.\n  prepaymentPenaltyTimingRecorded:\n    conditions:\n      - Find Loan hasPrincipal Principal and applicable PrepaymentTerms governsPaymentOf that Principal; if prepaymentPenaltyTermInMonths is recorded in months, confirm the recorded penalty timing.\n      - If no applicable PrepaymentTerms are found, leave what prepayment terms apply and penalty timing unconfirmed; do not infer that prepayment is prohibited or penalty-free.\n      - If PrepaymentTerms are found but prepaymentPenaltyTermInMonths is absent, report no prepayment penalty term recorded and do not confirm penalty timing or infer that no penalty applies.\n  amortizingSetupRecorded:\n    conditions:\n      - When an authoritative source independently establishes that the loan is amortizing, confirm Loan hasSchedule AmortizationSchedule and that PrincipalRepaymentTerms governsPaymentOf its Principal reached by hasPrincipal.\n      - If amortizing structure has not been independently established, leave the check undecided; the presence or absence of an amortization schedule alone does not establish that structure.\n  findGoverningTermsAndAgreement:\n    conditions:\n      - For a loan's principal reached by hasPrincipal, find PrincipalRepaymentTerms or PrepaymentTerms whose governsPaymentOf link targets that Principal; for interest reached by hasInterest, find InterestPaymentTerms whose governsPaymentOf link targets that Interest.\n      - For collateral reached through Loan collateralizedBy Collateral, find SecurityAgreement whose secures link targets that Collateral.\n      - These searches require lookup by relationship target without reversing the stored links. If a target-based lookup is unavailable, report that the relevant terms or security agreement cannot be verified through these paths; do not report that records are absent.\nactions:\n  assessServicingHandoffReadiness:\n    input: Loan\n    preconditions: [servicingHandoffReadiness]\n    effect: Report borrower and lender findings and, only when interest is independently established as payable, the applicable rate and interest-payment-terms findings; otherwise leave the interest portion undecided. Do not change the loan record.\n    verification: Recheck Loan hasBorrower Borrower and hasLender Lender; when interest payable is independently established, recheck Loan hasInterestRate FixedInterestRate or VariableInterestRate, then search InterestPaymentTerms whose governsPaymentOf link targets the Interest reached through hasInterest. If target-based lookup is unavailable, report that the terms portion cannot be verified, not that terms are absent.\n  reviewVariableRateSetup:\n    input: Loan\n    preconditions: [variableRateSetupRecorded]\n    effect: Report whether a recorded variable interest rate is accompanied by an interest rate reset schedule; if neither rate kind is recorded, report rate type undecided. Do not calculate future or past rate values or change the loan record.\n    verification: Reread Loan hasInterestRate VariableInterestRate and Loan hasSchedule InterestRateResetSchedule; if neither Loan hasInterestRate VariableInterestRate nor Loan hasInterestRate FixedInterestRate is recorded, confirm the report leaves rate type undecided.\n  checkPaymentRecordCompleteness:\n    input: Loan\n    preconditions: [paymentRecordComplete]\n    effect: Report whether a linked PaymentHistory has at least one IndividualPaymentTransaction; distinguish no linked history from linked history with no individual payments recorded. Neither absence establishes that no payment was ever made. Do not change the loan record.\n    verification: Reread Loan hasPaymentHistory PaymentHistory and PaymentHistory hasIndividualPayment IndividualPaymentTransaction; confirm the report distinguishes no history, an empty linked history, and a history with at least one entry.\n  reviewRecordedPrepaymentPenaltyTiming:\n    input: Loan\n    preconditions: [prepaymentPenaltyTimingRecorded]\n    effect: Report the recorded prepayment penalty term in months if applicable PrepaymentTerms governing the loan's principal record one; otherwise distinguish no applicable terms found from terms found without a recorded term. Do not decide whether a particular early payment incurs a charge or change the loan record.\n    verification: Identify the Principal through Loan hasPrincipal, search for applicable PrepaymentTerms whose governsPaymentOf link targets that principal, and confirm any reported term matches its prepaymentPenaltyTermInMonths; distinguish absent terms from a missing term. If target-based lookup is unavailable, report that terms cannot be verified, not that they are absent."
}
```

### Turn 117 — tool

Applied. Added 0, updated 10 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 117 — assistant

All relationships, properties, and classes have now been reviewed for naming. The requested names and directions are on the canvas; I also updated rule and action wording to use the renamed items. No classes, properties, or relationships were added or removed.

Two existing navigation warnings remain: the hand-off and prepayment reviews need target-based searches for governing terms. Those searches still require a deployment test.

NAMING LEDGER: relationships_renamed=7; relationships_redirected=0; properties_renamed=7; classes_renamed=3
