# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-10-20T10:56:53.520Z

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

We’ll start with the questions this agent must answer, then use them to decide what belongs in the model. We’ll work through roughly ten short phases, from questions and actions to connections, decision rules, and a final check. The canvas is currently empty.

At the **approval-to-servicing hand-off**, what are the first 3–5 questions you need answered to know a loan or credit facility is set up correctly? Please phrase them as questions you would actually ask.

### Turn 2 — user

At hand-off, I’d ask:

1. **Who’s borrowing, and who’s lending?**
2. **What amount are we setting up, when is it first funded, and when does it mature?** For a facility, I’d also check its credit limit and available amount.
3. **What interest rate applies, and how is interest calculated and paid?** If it’s variable, where’s the reset schedule?
4. **How is principal supposed to be repaid, and which payment schedules are on file?**
5. **If it’s secured, what collateral is linked to it—and who will service the loan and collect payments?**

Those give me the core setup picture. I’d then check the more specific terms that apply to that deal, rather than treating every possible feature as mandatory.

### Turn 2 — assistant

That gives us the hand-off core: parties, funding and facility availability, interest, repayment, security, and servicing. I’ll keep loan-specific and facility-specific questions distinct where the answer may differ.

For the **parties and funding** portion, are these the right questions for the agent to answer?

1. Who is the borrower?
2. Who is the lender?
3. What amount is being set up?
4. When is it first funded?
5. When does it mature?

Please correct any wording that would change what your team means at hand-off.

### Turn 3 — user

Yes, with two wording changes:

1. **Who is the borrower?** Keep that.
2. **Who is the lender?** Keep that.
3. **What amount is being set up?** Make this specific: for a loan, ask for the **principal amount**; for a credit agreement, the **debt amount**. For a facility, ask for its **credit limit, amount of credit extended, and available amount**—those aren’t interchangeable.
4. **When is it first funded?** I’d ask for the **initial exchange date**. That records the date in the terms; it shouldn’t, by itself, be treated as proof that funds actually went out.
5. **When does it mature?** Keep that for the loan or credit agreement.

So the questions are headed in the right direction. The main risk is collapsing the different amounts into one field, or mistaking a funding date on the agreement for evidence of an actual disbursement.

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Who is the borrower for a loan or credit agreement?\n  - text: Who is the lender for a loan or credit agreement?\n  - text: What is the principal amount of a loan?\n  - text: What is the debt amount of a credit agreement?\n  - text: What is a facility's credit limit?\n  - text: What is the amount of credit extended under a facility?\n  - text: What is the available amount under a facility?\n  - text: What initial exchange date is stated in the terms?\n  - text: When does a loan or credit agreement mature?"
}
```

### Turn 3 — tool

Applied. Added 9, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 3 — assistant

I’ve recorded those nine questions separately, including the three distinct facility amounts. The initial exchange date is recorded as a term, **not** as evidence that funds were disbursed.

For the **interest and repayment** portion, should the agent answer these questions as written?

1. What interest rate applies?
2. How is interest calculated?
3. When and how is interest paid?
4. If the rate is variable, what reset schedule applies?
5. How is principal to be repaid, and which payment schedules are on file?

Please correct any distinctions these questions blur.

### Turn 4 — user

They’re good questions. I’d keep them separate, with these clarifications:

1. **What interest rate applies?** Ask whether it’s fixed or variable, as well as the rate. A variable rate may be floating against a benchmark or set by the institution; a rate cap and first rate-change term are separate features to check if they apply.
2. **How is interest calculated?** Ask for the **day-count convention** in the interest payment terms. An interest calculation schedule tells us *when* calculations occur; it isn’t the calculation basis.
3. **When and how is interest paid?** Check the interest payment terms—accrual start, first and final payment dates, payment frequency and day, and compounding frequency—and distinguish those terms from the interest payment schedule showing due dates. Accrued but unpaid interest is tracked separately from principal.
4. **If the rate is variable, what reset schedule applies?** Yes. We need the reset schedule to consider the variable-rate setup complete. The event that sets the *initial* rate is a different matter from later resets.
5. **How is principal to be repaid, and which payment schedules are on file?** Keep the principal repayment terms separate from the schedules. Check the loan payment schedule and, where applicable, the amortization, principal payment, and interest payment schedules. For an amortizing loan, we specifically check for an amortization schedule and terms governing principal repayment.

### Turn 4 — assistant

The distinctions are clear: rate type and features, day-count basis versus calculation timing, payment terms versus due-date schedules, and principal terms versus the schedules on file.

For this **interest and repayment** batch, would you accept these as the agent’s questions?

1. What rate and rate type apply, and which variable-rate features apply?
2. What day-count convention governs interest calculation?
3. When are interest calculations scheduled?
4. What do the interest payment terms require, and what due dates appear on the interest payment schedule?
5. How much interest is accrued but unpaid?
6. For a variable rate, what governs the initial rate, and what schedule governs later resets?
7. What do the principal repayment terms require?
8. Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?

I’ve kept the last question conditional on the deal’s terms, rather than making every schedule mandatory.

### Turn 5 — user

Yes, I’d accept the batch, with three small wording adjustments:

- In **5**, ask **“How much interest is accrued but unpaid, as of what date?”** The date matters to the amount.
- In **6**, ask **“What event sets the initial rate, and what schedule covers later resets?”** That keeps the initial setting event distinct from the reset schedule.
- In **8**, keep **“required” conditional**, as you’ve done. We can report which schedules are on file, but shouldn’t assume every loan needs all four. For an amortizing loan, we specifically check for an amortization schedule and principal repayment terms.

The other questions preserve the distinctions we need.

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What interest rate and rate type apply, and which variable-rate features apply?\n  - text: What day-count convention governs interest calculation?\n  - text: When are interest calculations scheduled?\n  - text: What do the interest payment terms require, and what due dates appear on the interest payment schedule?\n  - text: How much interest is accrued but unpaid, as of what date?\n  - text: For a variable rate, what event sets the initial rate, and what schedule covers later resets?\n  - text: What do the principal repayment terms require?\n  - text: Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?"
}
```

### Turn 5 — tool

Applied. Added 8, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 5 — assistant

I’ve recorded the eight interest and repayment questions with those adjustments. The model now treats accrued interest as date-specific, initial rate setting as distinct from later resets, and schedule requirements as deal-dependent.

For the **security and servicing** part of hand-off, what questions should the agent answer about linked collateral, the party servicing the loan, and the party collecting payments?

### Turn 6 — user

I’d ask:

1. **Is the loan secured, and if so, how?** A loan backed by pledged collateral is different from one backed by a third-party guarantee.
2. **If collateral is pledged, what collateral is linked to the loan, and what security agreement secures it?** A “secured” label alone isn’t enough for our collateral check.
3. **Who services the loan?** That’s the party responsible for collecting principal and interest payments on the lender’s behalf. I wouldn’t create a separate collecting party unless the deal gives us one; the lender and servicer need not be the same party.

For a collateralized loan, I’d also want to ask what dated collateral value and loan-to-value measures are on file.

### Turn 6 — assistant

That adds an important distinction: pledged collateral and a third-party guarantee are different forms of security. I won’t introduce a separate payment collector unless the deal identifies one; the servicer is responsible for collection on the lender’s behalf.

Would you accept these questions for the agent?

1. Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?
2. If collateral is pledged, what collateral is linked to the loan?
3. What security agreement secures the pledged collateral?
4. Who services the loan and collects principal and interest payments on the lender’s behalf?
5. For a collateralized loan, what dated collateral value and loan-to-value measures are on file?

### Turn 7 — user

Yes. I’d keep all five, with two clarifications:

- In **3**, the security agreement grants an interest in the collateral; don’t treat it as the collateral itself or as a substitute for linking the pledged asset to the loan.
- In **5**, ask for the collateral’s **appraised value and its as-of date**, plus both the **loan-to-value ratio** and **combined loan-to-value ratio** where recorded. The combined measure accounts for total debt secured by the asset, not just this loan.

Question **4** is right: the servicer collects on the lender’s behalf, and may be a different party from the lender.

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?\n  - text: If collateral is pledged, what collateral is linked to the loan?\n  - text: What security agreement grants an interest in the pledged collateral linked to the loan?\n  - text: Who services the loan and collects principal and interest payments on the lender's behalf?\n  - text: For a collateralized loan, what are the collateral's appraised value and as-of date, and what loan-to-value and combined loan-to-value ratios are recorded?"
}
```

### Turn 7 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 7 — assistant

I’ve recorded those five questions. They distinguish the pledged asset from the security agreement granting an interest in it, and the loan-to-value ratio from the combined measure.

We have the hand-off questions. What are **5–10 things the agent must actually do** during setup or ongoing servicing—not just answer? Please name the actions in your usual operational language.

### Turn 8 — user

The five checks I’d have the agent carry out are:

1. **Check loan readiness.** Given a loan, confirm the borrower and lender are recorded and, if it bears interest, that the applicable rate and interest payment terms are in place. Record which links were checked.
2. **Verify secured-loan support.** Given a secured loan, confirm that collateral is actually linked to it. Retain the collateral link as evidence; a “secured” designation alone doesn’t pass the check.
3. **Review variable-rate setup.** Given a variable-rate loan, confirm its rate and reset schedule are on file, and record the result.
4. **Review payment-record completeness.** Given a loan, confirm it has a payment history containing individual payment transactions. Retain the history and transaction references checked.
5. **Review prepayment terms.** Where a prepayment penalty applies, confirm its penalty term in months is recorded and retain that term as evidence.

These are **verification actions**, not instructions for the agent to approve credit, move funds, or collect a payment. I don’t have a separate authorisation step to add to these checks.

### Turn 8 — assistant

These are five **verification actions**, not approvals or transactions. Each produces a check result and retains the evidence examined; none moves funds or collects a payment.

For the action list, should I keep these names and scopes: **check loan readiness; verify secured-loan support; review variable-rate setup; review payment-record completeness; review prepayment terms**? In particular, should payment-record completeness mean checking that a history contains individual transactions, without judging whether payments were made on time?

### Turn 9 — user

Yes. Those scopes match the work. I’d describe the first as a **readiness assessment** rather than a general check: it confirms the core parties and, for an interest-bearing loan, the applicable rate and interest payment terms. The other names work for me.

And yes—**payment-record completeness** means confirming that the loan has a payment history and that the history contains individual payment transactions. It does **not** decide whether payments were on time or whether the borrower is current. Keep the history and transactions examined as the evidence for that verification.

### Turn 9 — assistant

I’ll use **assess loan readiness** for the first action and keep the other four names. Payment-record completeness will check the presence of a history and individual transactions only—not timeliness or whether the borrower is current.

Before we move from requirements to the kinds of things the agent must recognize: for the **borrower, lender, and servicer** you named, is there a closely related role beneath any of them that actually does the day-to-day work and matters to one of these questions or checks? And does any question or check depend on a specific operating context that changes how it is handled?

### Turn 10 — user

No separate role beneath borrower, lender, or servicer is needed for these questions or checks. The servicer is the party responsible for collecting payments on the lender’s behalf; we’re not identifying an individual employee or team doing that work.

The checks **do depend on the deal’s features**: interest terms matter for an interest-bearing loan, a reset schedule for a variable-rate loan, linked collateral for a secured loan, and penalty timing where a prepayment penalty applies. I wouldn’t add a separate operating-context requirement beyond those conditions and the governing terms.

### Turn 10 — assistant

The requirements phase is set: 22 recorded questions and five agreed verification actions. No additional worker role or operating context is needed; the deal’s features and governing terms determine which checks apply. I’ll keep the five actions as agreed scopes until we capture their conditions and evidence in the action phase.

Starting with the core records: does the agent need to identify or retrieve **Loan, CreditAgreement, Facility, Borrower, and Lender** separately to answer the party, amount, and maturity questions? In particular, are *loan*, *credit agreement*, and *facility* distinct records in your work, rather than interchangeable names for one record?

### Turn 11 — user

Yes—the agent needs to distinguish **loan**, **credit agreement**, and **credit facility**, rather than use them as interchangeable names. I’d call the third a *credit facility*, not just a facility: it’s an agreement that lets the borrower draw funds over time, potentially through sub-facilities.

A loan has a principal amount; a credit agreement can state a debt amount; a credit facility has a credit limit, an amount of credit extended, and an available amount. Loans and credit agreements also carry maturity and initial exchange dates. Each can identify its borrower and lender.

That’s a distinction in what the agent must understand and retrieve—not a claim that every servicing system stores them as three separate physical records.

### Turn 11 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan: {}\n  CreditAgreement: {}\n  CreditFacility: {}\n  Borrower: {}\n  Lender: {}"
}
```

### Turn 11 — tool

Applied. Added 5, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 11 — assistant

I’ve recorded those as five distinct concepts, without assuming they are stored as five separate physical records.

For the interest and repayment questions, does the agent need to identify or retrieve these separately: **InterestPaymentTerms** (including day-count and payment requirements), **InterestCalculationSchedule**, **InterestPaymentSchedule**, **PrincipalRepaymentTerms**, and **LoanPaymentSchedule**? Each corresponds to a different term or schedule you distinguished; please flag anything that is only a value on another record rather than something the agent must connect or inspect separately.

### Turn 12 — user

Yes, those are distinct things to inspect, though not necessarily separate physical records in a servicing system.

- **Interest payment terms** set out the payment requirements and point to the **day-count convention** used as the accrual basis. The convention is distinct from the terms, not just another name for them.
- An **interest calculation schedule** says when interest is calculated; an **interest payment schedule** says when it is due. Neither replaces the interest payment terms.
- **Principal repayment terms** govern payment of principal. A **loan payment schedule** records the payments scheduled for that loan; it doesn’t replace those terms.

I’d also keep the **principal payment schedule** and **amortization schedule** distinguishable when the deal uses them. The question for the agent is which terms govern the obligation and which applicable schedules are actually on file.

### Turn 12 — assistant

The agent needs to distinguish governing terms from schedules on file. I’ll also keep the day-count convention distinct from the interest payment terms that point to it.

For the remaining repayment distinctions, does the agent need to identify or connect **DayCountConvention**, **PrincipalPaymentSchedule**, and **AmortizationSchedule** separately to answer the calculation-basis and applicable-schedules questions? And is the **interest rate** itself something the agent identifies as a distinct rate record, or a value on the loan or its terms?

### Turn 13 — user

Yes. Keep the **day-count convention**, **principal payment schedule**, and **amortization schedule** distinct. The convention is the accrual basis referenced by the interest payment terms; the principal payment schedule shows when principal is due; and the amortization schedule shows how the debt balance changes over periodic payments. They answer different questions.

Treat the **interest rate as something the loan is linked to**, not just an undifferentiated number on the loan. We need both its numeric rate and whether it is fixed or variable. A variable rate may be floating against a benchmark or set by the institution. That conceptual distinction doesn’t require a separate physical rate record in every system.

### Turn 13 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InterestPaymentTerms: {}\n  InterestCalculationSchedule: {}\n  InterestPaymentSchedule: {}\n  PrincipalRepaymentTerms: {}\n  LoanPaymentSchedule: {}\n  DayCountConvention: {}\n  PrincipalPaymentSchedule: {}\n  AmortizationSchedule: {}\n  InterestRate: {}"
}
```

### Turn 13 — tool

Applied. Added 9, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 13 — assistant

I’ve recorded those nine distinct concepts. The rate is linked to the loan conceptually, while its numeric value and fixed-or-variable type can be examined separately; this does not assume a separate physical record.

For the **variable-rate and accrued-interest questions**, does the agent need to identify or inspect an **InitialRateSettingEvent**, a **RateResetSchedule**, and an **AccruedInterest** amount tied to an as-of date as distinct concepts? Or is any one of those better represented as a value on an already named concept?

### Turn 14 — user

Yes—all three are distinct things for the agent to inspect, not merely values folded into an existing term.

I’d put the first two names a little more precisely: one is the **event that establishes the loan’s initial interest rate**; the other is the **schedule for later interest-rate resets**. Setting the initial rate and subsequently recalculating it are different events.

**Accrued interest** is also distinct from the rate and from principal. It records an unpaid interest **amount as of a particular date**, so the agent needs both the amount and that date to answer the question.

### Turn 14 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InitialInterestRateSettingEvent: {}\n  InterestRateResetSchedule: {}\n  AccruedInterest: {}"
}
```

### Turn 14 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 14 — assistant

I’ve recorded the initial-rate-setting event, later reset schedule, and dated accrued-interest amount separately.

For the security and servicing questions, does the agent need to identify or retrieve **Collateral**, **SecurityAgreement**, **ThirdPartyGuarantee**, and **Servicer** separately? For the dated appraisal and the two loan-to-value measures, does it need to inspect distinct records or measurements, rather than values attached to collateral or the loan?

### Turn 15 — user

Yes for **collateral**, **security agreement**, and **servicer**. The loan identifies its servicer; a secured loan links to pledged collateral; and the security agreement grants an interest in that collateral. Those are different things to inspect.

I wouldn’t add **third-party guarantee** as a separate record type on the strength of this question. We do distinguish a *guaranteed loan* from a *collateralized loan*, but I haven’t specified a guarantee record or a direct link to one for this check.

Keep the measurements distinct in meaning: collateral has an **appraised value with an as-of date**, while a collateralized loan has a **loan-to-value ratio** and a **combined loan-to-value ratio**. That doesn’t prescribe separate database rows for the measurements.

### Turn 15 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Collateral: {}\n  SecurityAgreement: {}\n  Servicer: {}"
}
```

### Turn 15 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 15 — assistant

I’ve recorded collateral, security agreement, and servicer as separate concepts. I’ve **not** added a guarantee record: the current requirement is to distinguish a guaranteed loan from a collateralized one. The appraisal and ratios remain candidate values on the relevant concepts, not assumed separate records.

For the remaining verification actions, does the agent need to identify **PaymentHistory** and individual **PaymentTransaction** entries separately to retain the evidence it checked? And for a prepayment penalty, is the penalty a distinct term to retrieve, or is its applicability and duration in months recorded on the loan’s terms?

### Turn 16 — user

Yes. The agent should distinguish the **payment history** for a loan from the **individual payment transactions** it contains. For the completeness review, it checks both links and retains references to the history and transactions examined; it does not assess whether those payments were on time.

For prepayment, keep **prepayment terms** distinct from the loan. The **penalty period in months** is a value recorded in those terms, not a separate penalty record. Where a penalty applies, the review checks that its timing is recorded.

### Turn 16 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PaymentHistory: {}\n  PaymentTransaction: {}\n  PrepaymentTerms: {}"
}
```

### Turn 16 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 16 — assistant

The candidate classes now cover the distinct records the agent must inspect: loan, credit agreement, credit facility and parties; interest and repayment terms and schedules; security and servicing; and payment and prepayment evidence. I’ve left out a separate guarantee record and a separate penalty record because your checks don’t require either.

Does that class set reflect the distinctions the agent actually needs, or is any named concept here only a value on another concept?

### Turn 17 — user

Broadly, yes. I wouldn’t collapse the terms, schedules, rate, accrued interest, collateral, security agreement, servicer, payment history, or individual payments into values on the loan just because a system might store them together.

One correction to the earlier note: the **dated collateral appraisal** and the **two loan-to-value measures** are distinct measurements in the business model, not merely interchangeable values on collateral or the loan. The appraisal belongs with the collateral; the two ratios relate to the collateralized loan.

The **penalty period in months**, by contrast, is a value in prepayment terms—not a separate penalty record. Likewise, maturity and initial exchange dates are values on the loan or credit agreement.

For the questions you’ve recorded, I’d also keep **borrowing capacity** distinct from a facility’s available amount, and recognize **sub-facilities** if the facility question needs to show how a facility is divided. Neither means every deal has a sub-facility.

### Turn 17 — assistant

Thanks. I’ll keep the appraisal, loan-to-value ratio, and combined loan-to-value ratio distinct; the penalty period and the two dates remain values on their terms or agreement.

Before adding classes, I need to check the scope of the two new facility concepts. To answer the recorded facility-amount questions, does the agent need to **identify and connect individual sub-facilities**, and does it need **borrowing capacity as a separate figure** from available amount? If so, what does borrowing capacity mean in your work?

### Turn 18 — user

To answer the **facility-amount questions alone**, the agent doesn’t need to identify individual sub-facilities. It does need to connect them to the credit facility **if the facility is divided into them** and we’re asking which portions make it up.

**Borrowing capacity is a separate figure from available amount.** It’s our assessment, at a point in time, of the upper amount the borrower can repay when due. The facility’s available amount is what remains available under that facility; it isn’t a substitute for the borrower’s assessed capacity.

### Turn 18 — assistant

I’ll keep borrowing capacity distinct from the facility’s available amount. Your answer also makes sub-facilities relevant only when the agent must show how a divided facility is made up—not for the three facility-amount questions alone.

Should I add these as **new agent questions**: “What is the borrower’s assessed borrowing capacity as of a given date?” and “If a credit facility is divided, which sub-facilities make it up?” Or were those distinctions background context rather than questions this agent must answer?

### Turn 19 — user

Add the **borrowing-capacity question**. I’d phrase it: “What borrowing capacity has been assessed for this borrower?” It’s distinct from the facility’s available amount. The assessment is understood at a point in time, but I wouldn’t make an as-of-date field mandatory for it on the basis of this model.

Add the **sub-facility question conditionally** if the agent needs to explain a divided facility: “Which sub-facilities make up this credit facility?” It isn’t needed to answer the three facility-amount questions, and not every facility has sub-facilities.

### Turn 19 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What borrowing capacity has been assessed for this borrower?\n  - text: If a credit facility is divided, which sub-facilities make up this credit facility?\nclasses:\n  SubFacility: {}"
}
```

### Turn 19 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 19 — assistant

I’ve added both questions and **SubFacility** as a conditional concept. Borrowing capacity remains a distinct assessed figure, but I have not made an as-of-date field mandatory.

One class-boundary point remains: when you call the appraisal and two ratios “distinct measurements,” does the agent need to retrieve or link each as its **own identifiable measurement**, or is it enough to capture three separately named values—appraised value and date on collateral, and the two ratios on the collateralized loan?

### Turn 20 — user

The agent should treat them as **three distinct measurements it can identify and inspect**, not just three interchangeable numeric fields. Collateral links to an appraised value **with its as-of date**; a collateralized loan links separately to its loan-to-value ratio and combined loan-to-value ratio.

That’s a conceptual distinction, not a requirement for three separate database rows. If one system stores them as fields, the agent still needs to preserve which measurement each value represents and, for the appraisal, its date.

### Turn 20 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CollateralAppraisal: {}\n  LoanToValueRatio: {}\n  CombinedLoanToValueRatio: {}"
}
```

### Turn 20 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 20 — assistant

I’ve recorded the appraisal and the two ratios as three identifiable measurements. That preserves what each represents without requiring separate database rows.

The class distinctions are now captured. Moving to connections: for **Loan, CreditAgreement, and CreditFacility**, what are the direct party links? You said each can identify its borrower and lender. Is it accurate to record each as “identifies borrower” and “identifies lender,” directed from the loan, agreement, or facility to that party?

### Turn 21 — user

The direction is right: the loan, credit agreement, or credit facility points to its borrower and lender. I’d phrase the connection as **“has a borrower”** and **“has a lender”** rather than “identifies” them. We’re recording who incurs the debt and who provides the credit, not just whose name appears on a record.

For the loan-readiness check specifically, both party links must be present. I wouldn’t turn that check into a blanket rule about every record at every stage.

### Turn 21 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasBorrower, from: Loan, to: Borrower}\n  - {name: hasLender, from: Loan, to: Lender}\n  - {name: hasBorrower, from: CreditAgreement, to: Borrower}\n  - {name: hasLender, from: CreditAgreement, to: Lender}\n  - {name: hasBorrower, from: CreditFacility, to: Borrower}\n  - {name: hasLender, from: CreditFacility, to: Lender}"
}
```

### Turn 21 — tool

Applied. Added 6, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 21 — assistant

I’ve recorded six directed party links: each loan, credit agreement, and credit facility **has a borrower** and **has a lender**. I’ll apply the requirement that both links be present specifically to the loan-readiness assessment, not to every record at every stage.

For the facility concepts, are these the direct connections you use: **CreditFacility → SubFacility** (“is divided into”) when applicable, and **Borrower → CreditFacility** as the path for finding which facility’s available amount to compare with a borrower’s assessed capacity? Or is that comparison reached another way?

### Turn 22 — user

The first connection is right in substance, though I’d usually say a **credit facility has sub-facilities**: they’re portions of that facility, when it is divided.

For the second, I’d follow the links the other way around. The **credit facility has a borrower**, and the **borrower has an assessed borrowing capacity**. That lets us find both figures, but it doesn’t establish a direct borrower-to-facility link or a rule that automatically compares capacity with available amount. Those figures mean different things; any decision about extending more credit would follow the lender’s governing procedure.

### Turn 22 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasSubFacility, from: CreditFacility, to: SubFacility}"
}
```

### Turn 22 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 22 — assistant

I’ve recorded **CreditFacility → SubFacility**. The existing facility-to-borrower link is the path to the borrower’s assessed capacity; I won’t add a reverse link or an automatic capacity-versus-availability decision.

For the **interest** questions and readiness assessment, which of these are direct connections? Please correct any that instead run through another concept:

- Loan → InterestRate (“has applicable rate”)
- Loan → InterestPaymentTerms (“has interest payment terms”)
- InterestPaymentTerms → DayCountConvention (“uses day-count convention”)
- Loan → InterestCalculationSchedule (“has calculation schedule”)
- Loan → InterestPaymentSchedule (“has interest payment schedule”)

### Turn 23 — user

Four of those are direct connections, with a wording distinction on the day-count one:

- The **loan has an interest rate**, fixed or variable, and has an **interest calculation schedule** and an **interest payment schedule** where those schedules apply.
- **Interest payment terms have a day-count convention as their accrual basis.** “Uses” gets the idea across, but “accrual basis” makes clear what the convention does.

I would **not** add a direct loan-to-interest-payment-terms connection here. The loan has an **interest obligation**, and the **interest payment terms govern payment of that interest**. The readiness assessment checks that the applicable rate and those governing terms are in place; that check doesn’t imply a separate direct link between the loan and the terms.

### Turn 23 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasInterestRate, from: Loan, to: InterestRate}\n  - {name: hasInterestCalculationSchedule, from: Loan, to: InterestCalculationSchedule}\n  - {name: hasInterestPaymentSchedule, from: Loan, to: InterestPaymentSchedule}\n  - {name: hasAccrualBasis, from: InterestPaymentTerms, to: DayCountConvention}"
}
```

### Turn 23 — tool

Applied. Added 4, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 23 — assistant

I’ve recorded the four direct links you confirmed. I did **not** add Loan → InterestPaymentTerms: the path you described goes through an **interest obligation**.

To represent the readiness check correctly, does the agent need to identify an **InterestObligation** separately, with **Loan → InterestObligation** (“has interest obligation”) and **InterestPaymentTerms → InterestObligation** (“govern payment of”)? Or is “interest obligation” your wording for a path through an existing concept?

### Turn 24 — user

“Interest obligation” was my plain-language description of **interest**, not a new thing to add. Use the existing interest concept: the **loan has interest**, and the **interest payment terms govern payment of that interest**.

That gives the readiness assessment a way to check for governing interest terms without inventing a direct loan-to-terms connection.

### Turn 24 — assistant

Understood: **interest obligation** is not a separate class, and the path must not become a direct loan-to-terms link. I don’t yet have a general **Interest** concept on the canvas—only InterestRate and AccruedInterest, which you’ve distinguished from interest itself.

Should I add **Interest** as the concept in “Loan has interest” and “InterestPaymentTerms govern payment of Interest”?

### Turn 25 — user

Yes, add **interest**. It’s the cost of the credit that the borrower owes, distinct from the **interest rate**, which expresses how that cost is charged, and from **accrued interest**, which is the amount incurred but still unpaid as of a date.

The direct connections are: **the loan has interest**, and **interest payment terms govern payment of that interest**.

### Turn 25 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Interest: {}\nrelationships:\n  - {name: hasInterest, from: Loan, to: Interest}\n  - {name: governsPaymentOf, from: InterestPaymentTerms, to: Interest}"
}
```

### Turn 25 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 25 — assistant

I’ve added **Interest** and the two direct links you confirmed. The readiness assessment can now follow Loan → Interest ← InterestPaymentTerms, without treating the rate, accrued amount, and interest owed as the same thing.

For the remaining interest concepts, how does the agent get from a loan to its **initial rate-setting event**, **later reset schedule**, and **dated accrued interest**? Which links in those paths are direct facts, rather than links through Interest or InterestRate?

### Turn 26 — user

The **loan directly has an initial interest-rate-setting event** and, where the rate is variable, directly has an **interest-rate reset schedule**. Neither path needs to run through the interest owed or the rate.

For **accrued interest**, we distinguish its unpaid amount and as-of date from principal and from the rate. But I haven’t established a direct loan-to-accrued-interest link in the connections we’re using. The agent needs the amount and date to answer the question; I wouldn’t invent a link to the loan without identifying how that amount is associated with the particular obligation.

### Turn 26 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasInitialInterestRateSettingEvent, from: Loan, to: InitialInterestRateSettingEvent}\n  - {name: hasInterestRateResetSchedule, from: Loan, to: InterestRateResetSchedule}"
}
```

### Turn 26 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 26 — assistant

I’ve recorded the loan’s direct links to its initial rate-setting event and, where applicable, its later reset schedule. I’ve left **AccruedInterest** unlinked rather than guessing.

How is an accrued-interest amount associated with the particular interest owed—for example, is **Interest → AccruedInterest** a direct “has accrued unpaid amount” fact in your work, or is there another path?

### Turn 27 — user

Conceptually, accrued interest is **interest incurred but not yet paid**, with an amount and as-of date. But I can’t confirm **Interest → AccruedInterest** as a direct connection for this model, and I wouldn’t add another path by guesswork.

For the agent’s question, keep the accrued-interest amount and date distinct. Before it can report that figure **for a particular loan**, it must have a reliable way to associate the dated amount with that loan or its obligation. If that association isn’t available, the honest answer is that it can’t attribute the figure to that loan—not that the amount is zero.

### Turn 27 — assistant

I’ll leave the accrued-interest association **open**. The agent may report an amount and as-of date only when it can reliably attribute them to the particular loan or obligation; no link must not be read as a zero balance.

For **principal repayment**, how does the agent get from a loan to its principal repayment terms and, where applicable, its loan payment, principal payment, and amortization schedules? Which of those are direct loan links?

### Turn 28 — user

The **loan directly has** its loan payment schedule, principal payment schedule, and amortization schedule where each applies. Those are separate schedules; the amortization schedule shows how the balance changes over time.

The principal repayment terms take a different path: the **loan has principal**, and the **principal repayment terms govern payment of that principal**. I wouldn’t add a direct loan-to-principal-repayment-terms link on that basis. For an amortizing-loan setup check, we look for both the amortization schedule and terms governing principal repayment.

### Turn 28 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasLoanPaymentSchedule, from: Loan, to: LoanPaymentSchedule}\n  - {name: hasPrincipalPaymentSchedule, from: Loan, to: PrincipalPaymentSchedule}\n  - {name: hasAmortizationSchedule, from: Loan, to: AmortizationSchedule}"
}
```

### Turn 28 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 28 — assistant

I’ve recorded the three applicable schedules as direct loan links. I have **not** added a direct link from the loan to principal repayment terms.

Is **Principal** a distinct concept the agent must identify so it can follow the path **Loan → Principal ← PrincipalRepaymentTerms**, with the terms governing payment of that principal?

### Turn 29 — user

Yes. **Principal** is the amount of the debt to be repaid, separate from interest. The **loan has principal**, and the **principal repayment terms govern payment of that principal**. That’s the path to use; don’t collapse principal into the loan’s principal-amount figure or add a direct loan-to-repayment-terms link.

### Turn 29 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Principal: {}\nrelationships:\n  - {name: hasPrincipal, from: Loan, to: Principal}\n  - {name: governsPaymentOf, from: PrincipalRepaymentTerms, to: Principal}"
}
```

### Turn 29 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 29 — assistant

I’ve added **Principal** and the two confirmed links. This keeps principal distinct from its numeric amount and from interest, and gives the agent a path to the governing repayment terms.

For the **security and servicing** questions, how does the agent get from a loan to pledged collateral, the security agreement, and the servicer? Please distinguish direct links from any path through another concept, especially between the loan and the security agreement.

### Turn 30 — user

The **loan is serviced by the servicer** directly. That identifies who collects principal and interest payments on the lender’s behalf.

For pledged security, a **secured loan is collateralized by collateral** directly. The **security agreement secures that collateral**—it grants the relevant financial interest in the asset. So you can find the security agreement through the collateral, but I wouldn’t draw a direct loan-to-security-agreement link from that. Nor would I treat a security agreement’s existence, without a linked asset, as passing the secured-loan collateral check.

### Turn 30 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: servicedBy, from: Loan, to: Servicer}\n  - {name: collateralizedBy, from: Loan, to: Collateral}\n  - {name: secures, from: SecurityAgreement, to: Collateral}"
}
```

### Turn 30 — tool

Applied. Added 3, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 30 — assistant

I’ve recorded the loan-to-servicer and loan-to-collateral links, plus the security agreement’s link to the collateral. There is no direct loan-to-security-agreement link, and the secured-loan check still requires the pledged asset itself.

For the **three measurements**, are these direct links: **Collateral → CollateralAppraisal**, **Loan → LoanToValueRatio**, and **Loan → CombinedLoanToValueRatio**? If a measurement is reached through another concept instead, what is that path?

### Turn 31 — user

The direction is right for the collateral measurement: **collateral has a dated appraised value**. I’d call it a *collateral value as of a date*, since both the value and the date matter.

The other two links need a narrower starting point. A **collateralized loan** has a loan-to-value ratio and a combined loan-to-value ratio. I wouldn’t attach those links to every loan. The first compares this loan’s principal with the appraised asset value; the combined ratio considers total debt secured by the asset or assets.

### Turn 31 — assistant

I can record **Collateral → CollateralAppraisal** as “has dated appraised value.” For the ratios, I won’t make them requirements for every loan.

When you say a *collateralized loan* has the two ratios, do you mean conditional links **Loan → LoanToValueRatio** and **Loan → CombinedLoanToValueRatio** that apply only when the loan is collateralized, or does the agent need to identify “collateralized loan” as a separate concept?

### Turn 32 — user

Identify **collateralized loan** as a distinct kind of secured loan: it is backed by collateral provided by the borrower. The direct connections to both ratios start from the **collateralized loan**, not from a general loan with a conditional field added.

That tells the agent where to look for the loan-to-value and combined loan-to-value measurements. It doesn’t mean both measurements must be present on every collateralized loan; the connection alone isn’t a completeness rule.

### Turn 32 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasDatedAppraisedValue, from: Collateral, to: CollateralAppraisal}"
}
```

### Turn 32 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 32 — assistant

I’ve recorded the collateral’s dated appraisal. I haven’t added **CollateralizedLoan** yet: in this tool, a separate class needs an operational connection to **Loan**, not just “is a kind of Loan.”

What would the agent use to connect a collateralized loan to the underlying loan—an independently identifiable record or workflow link—or are you using “collateralized loan” to mean a loan whose confirmed **collateralizedBy** link is present? This determines how we can attach the two ratio measurements without implying they belong to every loan.

### Turn 33 — user

I mean **the same loan classified as a collateralized loan**, not a second record connected to it by a workflow link. I wouldn’t add an “underlying loan” connection.

A confirmed link to pledged collateral is what the collateral check examines, but I wouldn’t use that link alone to define the classification: a collateralized loan specifically involves collateral provided by the borrower. The two ratio measurements belong to a loan **in that collateralized-loan capacity**, not to loans generally.

If the tool cannot represent that kind of loan without inventing another connection, record the limitation. Don’t create a second loan record or an unsupported link just to attach the ratios.

### Turn 33 — assistant

That is a modeling limitation here: the tool cannot make **CollateralizedLoan** a subtype of **Loan**. I won’t create a second loan concept or an unsupported link. I’ll keep the two ratio measurements unresolved for now, rather than attach them to loans generally; later we can check whether a loan classification value preserves the distinction you need.

For **payment-record completeness**, is the direct path **Loan → PaymentHistory → PaymentTransaction**—the loan has a history, and the history contains individual transactions?

### Turn 34 — user

Yes. The **loan has a payment history**, and that **history contains individual payment transactions**. Both connections matter for the completeness check: a history record with no individual payments doesn’t pass it.

I’d say “has individual payments” rather than use “contains” as a strict physical-storage claim. The transactions make up the history; they needn’t be stored inside one record. This check still says nothing about whether any payment was on time.

### Turn 34 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasPaymentHistory, from: Loan, to: PaymentHistory}\n  - {name: hasIndividualPayments, from: PaymentHistory, to: PaymentTransaction}"
}
```

### Turn 34 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 34 — assistant

I’ve recorded **Loan → PaymentHistory → PaymentTransaction**. “Has individual payments” describes the business link, not physical storage. The completeness review will require both links and won’t assess timeliness.

Because the agent reaches transactions through the history, one distinction to settle: does a **loan also directly link to each payment transaction**, or is the history the only confirmed path from the loan to those transactions?

### Turn 35 — user

The **payment history is the confirmed path**: loan → payment history → individual payment transaction. I wouldn’t add a direct loan-to-transaction link for this check. Retain the history and the individual transactions examined as its evidence.

### Turn 35 — assistant

I’ll use the history as the only confirmed path to individual payments; no direct loan-to-transaction link.

For the prepayment review, how does the agent reach **PrepaymentTerms** from a loan? Is there a direct loan-to-terms link, or does it follow another concept, as it does for interest and principal payment terms?

### Turn 36 — user

I wouldn’t add a direct **loan-to-prepayment-terms** link. Prepayment terms are a specific kind of principal repayment terms—those dealing with repayment before maturity. The confirmed route is that the **loan has principal**, and **principal repayment terms govern payment of that principal**.

To review a particular loan’s prepayment penalty, the agent still needs to identify which applicable governing terms are its prepayment terms, then check the penalty period in months. If it cannot establish that those terms apply to the loan, it shouldn’t attribute the penalty period to it.

### Turn 36 — assistant

I won’t add a “kind of” relationship between **PrepaymentTerms** and **PrincipalRepaymentTerms**. The confirmed route reaches terms governing the loan’s principal, but it does not yet identify which of those terms apply to prepayment. That association remains open; the agent must not attribute a penalty period to a loan without it.

What fact lets your team identify the **applicable prepayment terms** among the terms governing that loan’s principal?

### Turn 37 — user

We identify them by **what the terms cover**: prepayment terms are the principal repayment terms that deal with paying the loan before maturity. The connection to this loan is that the terms govern payment of **the principal the loan has**.

There isn’t a separate prepayment-specific link I can confirm. If the agent can’t establish that a particular set of prepayment terms governs this loan’s principal, it shouldn’t report that set’s penalty period as applying to the loan.

### Turn 37 — assistant

I understand the test: the terms must cover repayment before maturity **and** govern the principal of this loan. I won’t infer applicability from their name alone.

Can **PrepaymentTerms → Principal** be recorded as a direct “governs prepayment of” link when those terms apply to that principal? That would identify the applicable terms without treating them as a subtype link to PrincipalRepaymentTerms.

### Turn 38 — user

Not as a **new, prepayment-specific direct link**. The confirmed connection is that principal repayment terms govern payment of the loan’s principal; prepayment terms are those terms when they address repayment before maturity.

If the tool can’t preserve that distinction, leave the prepayment-term association open rather than invent “governs prepayment of.” The agent can report a penalty period for a loan only once it can establish that the applicable terms govern that loan’s principal.

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
    text: Who is the borrower for a loan or credit agreement?
  - id: cq2
    text: Who is the lender for a loan or credit agreement?
  - id: cq3
    text: What is the principal amount of a loan?
  - id: cq4
    text: What is the debt amount of a credit agreement?
  - id: cq5
    text: "What is a facility's credit limit?"
  - id: cq6
    text: What is the amount of credit extended under a facility?
  - id: cq7
    text: What is the available amount under a facility?
  - id: cq8
    text: What initial exchange date is stated in the terms?
  - id: cq9
    text: When does a loan or credit agreement mature?
  - id: cq10
    text: "What interest rate and rate type apply, and which variable-rate features apply?"
  - id: cq11
    text: What day-count convention governs interest calculation?
  - id: cq12
    text: When are interest calculations scheduled?
  - id: cq13
    text: "What do the interest payment terms require, and what due dates appear on the interest payment schedule?"
  - id: cq14
    text: "How much interest is accrued but unpaid, as of what date?"
  - id: cq15
    text: "For a variable rate, what event sets the initial rate, and what schedule covers later resets?"
  - id: cq16
    text: What do the principal repayment terms require?
  - id: cq17
    text: "Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?"
  - id: cq18
    text: "Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?"
  - id: cq19
    text: "If collateral is pledged, what collateral is linked to the loan?"
  - id: cq20
    text: What security agreement grants an interest in the pledged collateral linked to the loan?
  - id: cq21
    text: "Who services the loan and collects principal and interest payments on the lender's behalf?"
  - id: cq22
    text: "For a collateralized loan, what are the collateral's appraised value and as-of date, and what loan-to-value and combined loan-to-value ratios are recorded?"
  - id: cq23
    text: What borrowing capacity has been assessed for this borrower?
  - id: cq24
    text: "If a credit facility is divided, which sub-facilities make up this credit facility?"
classes:
  Loan:
    meaning: null
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: null
    aliases: []
    properties: {}
  CreditFacility:
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
  InterestPaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: null
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestRate:
    meaning: null
    aliases: []
    properties: {}
  InitialInterestRateSettingEvent:
    meaning: null
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: null
    aliases: []
    properties: {}
  AccruedInterest:
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
  Servicer:
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
  PrepaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  SubFacility:
    meaning: null
    aliases: []
    properties: {}
  CollateralAppraisal:
    meaning: null
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: null
    aliases: []
    properties: {}
  CombinedLoanToValueRatio:
    meaning: null
    aliases: []
    properties: {}
  Interest:
    meaning: null
    aliases: []
    properties: {}
  Principal:
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
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: null
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: null
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: null
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: null
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: null
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: InterestRate
    meaning: null
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: null
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: null
    aliases: []
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: null
    aliases: []
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: null
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: null
    aliases: []
  - name: hasInitialInterestRateSettingEvent
    from: Loan
    to: InitialInterestRateSettingEvent
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
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: null
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: null
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: null
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: null
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
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
  - name: hasDatedAppraisedValue
    from: Collateral
    to: CollateralAppraisal
    meaning: null
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: null
    aliases: []
  - name: hasIndividualPayments
    from: PaymentHistory
    to: PaymentTransaction
    meaning: null
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 38 — assistant

I won’t add a prepayment-specific link. The confirmed path is **Loan → Principal ← PrincipalRepaymentTerms**; the remaining issue is how to recognize which governing terms cover repayment before maturity.

Should **PrepaymentTerms** remain a separate concept the agent must retrieve, or should the agent identify them within **PrincipalRepaymentTerms** by whether those terms cover prepayment, with the penalty period in months recorded there?

### Turn 39 — user

Keep **prepayment terms** distinct in meaning, but don’t require a separate physical record. They are the principal repayment terms that address payment before maturity, and the **penalty period in months belongs to those prepayment terms**, not to principal repayment terms generally.

So if your tool can mark which governing principal repayment terms cover prepayment, that preserves the distinction. The agent must still establish that those terms govern **this loan’s principal** before reporting the penalty period for this loan.

### Turn 39 — assistant

I can represent that distinction without claiming there is a separate record: mark **PrincipalRepaymentTerms** as covering prepayment when they do, and record the **penalty period in months only for those terms**. The loan-specific path remains Loan → Principal ← PrincipalRepaymentTerms, so the agent must establish that the marked terms govern this loan’s principal before reporting the penalty period.

Would that representation preserve what you need, even though it would replace **PrepaymentTerms** as a separate class on the canvas?

### Turn 40 — user

Yes, for this canvas that preserves the distinction I need. Mark the **principal repayment terms that cover prepayment**, and record the penalty period in months only on those terms. You needn’t create a separate physical record or a separate canvas class to do that.

The agent must still confirm that the marked terms govern **this loan’s principal** before attributing the penalty period to the loan. A prepayment marker on unrelated terms wouldn’t be enough.

### Turn 40 — assistant

**Tool call: `remove_ontology_elements`**

```
{
  "classes": [
    "PrepaymentTerms"
  ],
  "relationships": [],
  "properties": [],
  "rules": [],
  "actions": [],
  "competencyQuestions": []
}
```

### Turn 40 — tool

Removed 1 element(s) — classes: PrepaymentTerms.

CONSISTENCY CHECK — no new problems from this edit.

### Turn 40 — assistant

I’ve removed **PrepaymentTerms** as a separate canvas class. The confirmed path remains Loan → Principal ← PrincipalRepaymentTerms; marking which governing terms cover prepayment, and recording the penalty period there, will be handled when we capture properties.

One servicing connection is still worth checking: you said the servicer collects payments **on the lender’s behalf**. Is **Servicer → Lender** (“collects payments on behalf of”) a direct fact the agent needs, alongside the existing **Loan → Servicer** and **Loan → Lender** links?

### Turn 41 — user

The servicer’s role is to collect principal and interest payments **on the lender’s behalf**, but I wouldn’t add a separate **servicer-to-lender** link for this model. For a given loan, follow its direct links to the **servicer** and the **lender**. That lets the agent identify both parties without asserting a general connection between them independent of the loan.

### Turn 41 — assistant

Understood. For a given loan, the agent follows its links to the servicer and lender; I won’t add a separate servicer-to-lender link.

Two connection gaps remain open: we have no confirmed way to attribute **AccruedInterest** to a particular loan, and this canvas cannot attach the two ratio measurements to a *collateralized loan* as a subtype without an unsupported link.

For the ratio question, would a **loan classification value** that distinguishes borrower-provided collateral from a third-party guarantee accurately identify when a loan is being treated as collateralized? This would address the classification, though we would still need to settle how the ratio measurements connect.

### Turn 42 — user

Yes, as a **canvas representation**, a classification could identify when the same loan is being treated as collateralized: it must mean the loan is secured by collateral **provided by the borrower**, not merely that it has some form of security. A third-party guarantee is a different case.

I wouldn’t make that a required loan field or assume those are the only possible classifications. It also doesn’t, by itself, connect either ratio measurement to a particular loan. Keep those connections open until the canvas can express them without implying that every secured—or every collateralized—loan has both ratios recorded.

### Turn 42 — assistant

That classification can distinguish borrower-provided collateral from a third-party guarantee without making the field mandatory or limiting the possible classifications. It does **not** resolve the measurement links, and the accrued-interest attribution is still open.

A relationship on this canvas can describe a link that exists **only when a measurement is recorded**; it need not require the measurement on every loan. On that basis, can I record optional direct links from **Loan → LoanToValueRatio** and **Loan → CombinedLoanToValueRatio**, each meaning “this measurement is recorded for this loan when it is treated as collateralized”? Or is even that direct association unconfirmed?

### Turn 43 — user

Yes, **if the canvas makes the condition part of each link’s meaning**. It’s the same loan, and an optional link can say that a loan **treated as collateralized by borrower-provided collateral** has a recorded loan-to-value ratio or combined loan-to-value ratio.

I wouldn’t record them as unrestricted links from loans generally. The classification determines which kind of loan the links describe; “optional” only means a ratio may not be recorded. It doesn’t make the ratio applicable to an unsecured or guarantee-backed loan.

### Turn 43 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - name: hasLoanToValueRatio\n    from: Loan\n    to: LoanToValueRatio\n    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.\n  - name: hasCombinedLoanToValueRatio\n    from: Loan\n    to: CombinedLoanToValueRatio\n    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded combined loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans."
}
```

### Turn 43 — tool

Applied. Added 2, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 43 — assistant

I’ve recorded both ratio links with the condition in their meanings: they apply only when the loan is treated as collateralized by borrower-provided collateral, and neither ratio is required merely because the loan is collateralized.

**AccruedInterest** remains the one concept without a confirmed connection. You’ve said the agent must not attribute a dated amount to a loan without reliable evidence. What evidence or lookup would establish that attribution in your work, if one is available?

### Turn 44 — user

I’d need a **dated accrual figure that the servicing evidence explicitly identifies as belonging to that loan or its interest obligation**. The amount and as-of date alone don’t establish whose interest it is.

I can’t specify a particular lookup or direct connection from what we’ve established. Until the agent has reliable loan-specific attribution, it should leave the answer unresolved—not report zero or attach an unattributed amount to the loan.

### Turn 44 — assistant

That sets a clear limit: a dated accrued-interest figure needs servicing evidence that explicitly attributes it to this loan or its interest obligation. We have **no confirmed lookup or relationship** for that attribution, so the accrued-interest question remains open; the agent must not report zero or assign an unattributed amount to the loan.

There is another path to settle before we finish connections. To answer what the **interest payment terms require** alongside the due dates on the **interest payment schedule**, does the agent follow two separate paths from the loan—through its Interest to the governing terms, and directly to its schedule—or is there also a direct connection between the terms and that schedule?

### Turn 45 — user

Follow **two separate paths**:

- The loan has **interest**, and the **interest payment terms govern payment of that interest**.
- The loan directly has its **interest payment schedule**, where one is on file.

I wouldn’t add a direct terms-to-schedule connection. The terms state the payment requirements; the schedule gives the contract-specific due dates. The agent should compare them for the same loan without treating one as a substitute for the other.

### Turn 45 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 45 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit agreement?
  - id: cq2
    text: Who is the lender for a loan or credit agreement?
  - id: cq3
    text: What is the principal amount of a loan?
  - id: cq4
    text: What is the debt amount of a credit agreement?
  - id: cq5
    text: "What is a facility's credit limit?"
  - id: cq6
    text: What is the amount of credit extended under a facility?
  - id: cq7
    text: What is the available amount under a facility?
  - id: cq8
    text: What initial exchange date is stated in the terms?
  - id: cq9
    text: When does a loan or credit agreement mature?
  - id: cq10
    text: "What interest rate and rate type apply, and which variable-rate features apply?"
  - id: cq11
    text: What day-count convention governs interest calculation?
  - id: cq12
    text: When are interest calculations scheduled?
  - id: cq13
    text: "What do the interest payment terms require, and what due dates appear on the interest payment schedule?"
  - id: cq14
    text: "How much interest is accrued but unpaid, as of what date?"
  - id: cq15
    text: "For a variable rate, what event sets the initial rate, and what schedule covers later resets?"
  - id: cq16
    text: What do the principal repayment terms require?
  - id: cq17
    text: "Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?"
  - id: cq18
    text: "Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?"
  - id: cq19
    text: "If collateral is pledged, what collateral is linked to the loan?"
  - id: cq20
    text: What security agreement grants an interest in the pledged collateral linked to the loan?
  - id: cq21
    text: "Who services the loan and collects principal and interest payments on the lender's behalf?"
  - id: cq22
    text: "For a collateralized loan, what are the collateral's appraised value and as-of date, and what loan-to-value and combined loan-to-value ratios are recorded?"
  - id: cq23
    text: What borrowing capacity has been assessed for this borrower?
  - id: cq24
    text: "If a credit facility is divided, which sub-facilities make up this credit facility?"
classes:
  Loan:
    meaning: null
    aliases: []
    properties: {}
  CreditAgreement:
    meaning: null
    aliases: []
    properties: {}
  CreditFacility:
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
  InterestPaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  InterestCalculationSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: null
    aliases: []
    properties: {}
  LoanPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: null
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: null
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: null
    aliases: []
    properties: {}
  InterestRate:
    meaning: null
    aliases: []
    properties: {}
  InitialInterestRateSettingEvent:
    meaning: null
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: null
    aliases: []
    properties: {}
  AccruedInterest:
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
  Servicer:
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
  SubFacility:
    meaning: null
    aliases: []
    properties: {}
  CollateralAppraisal:
    meaning: null
    aliases: []
    properties: {}
  LoanToValueRatio:
    meaning: null
    aliases: []
    properties: {}
  CombinedLoanToValueRatio:
    meaning: null
    aliases: []
    properties: {}
  Interest:
    meaning: null
    aliases: []
    properties: {}
  Principal:
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
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: null
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: null
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: null
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: null
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: null
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: InterestRate
    meaning: null
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: null
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: null
    aliases: []
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: null
    aliases: []
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: null
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: null
    aliases: []
  - name: hasInitialInterestRateSettingEvent
    from: Loan
    to: InitialInterestRateSettingEvent
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
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: null
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: null
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: null
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: null
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
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
  - name: hasDatedAppraisedValue
    from: Collateral
    to: CollateralAppraisal
    meaning: null
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: null
    aliases: []
  - name: hasIndividualPayments
    from: PaymentHistory
    to: PaymentTransaction
    meaning: null
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded combined loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 45 — assistant

I’ll use those two paths for the same loan and won’t add a terms-to-schedule link. The terms state the requirements; the schedule supplies due dates.

The relationship pass is not complete: **AccruedInterest** still has no confirmed path to a particular loan, so that question remains unresolved. For the variable-rate question, the loan already links separately to its rate, initial-setting event, and later reset schedule. Does the agent use those three links together for the same loan, or is there also a direct link from the rate to either the event or the schedule?

### Turn 46 — user

Use the **three links from the same loan**: its variable interest rate, its initial rate-setting event, and its later reset schedule. I wouldn’t add a direct rate-to-event or rate-to-schedule link.

For the variable-rate setup review, the rate and reset schedule are the check. The initial-setting event answers a separate question about how the first rate is established; it isn’t a substitute for the later reset schedule.

### Turn 46 — assistant

The variable-rate paths are confirmed: the agent uses the rate, initial-setting event, and reset schedule linked to the **same loan**. The setup review checks the rate and reset schedule; the initial event answers a separate question. I won’t add rate-to-event or rate-to-schedule links.

That completes the confirmed connections. **AccruedInterest remains an open exception**: we have no reliable attribution path, so the agent cannot yet answer its loan-specific question. Moving to values the agent must read, are these the right homes for the amount questions?

- **Loan:** principal amount (the loan-principal question)
- **CreditAgreement:** debt amount (the agreement-debt question)
- **CreditFacility:** credit limit, amount of credit extended, and available amount (the three facility questions)
- **Borrower:** assessed borrowing capacity (the borrowing-capacity question)

I’m asking about where the values belong, not whether each is mandatory on every record.

### Turn 47 — user

The first three are right as stated: **principal amount** on the loan, **debt amount** on the credit agreement, and **credit limit**, **amount of credit extended**, and **available amount** on the credit facility. Keep those facility figures separate.

I’d adjust the last one: the **borrower has an assessed borrowing capacity**, and the **amount is a value of that assessment**. It isn’t simply a number on the borrower. None of these placements, by itself, makes the value mandatory on every record.

### Turn 47 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      principalAmount: {type: number}\n  CreditAgreement:\n    properties:\n      debtAmount: {type: number}\n  CreditFacility:\n    properties:\n      creditLimit: {type: number}\n      amountOfCreditExtended: {type: number}\n      availableAmount: {type: number}\n  BorrowingCapacityAssessment:\n    properties:\n      assessedCapacityAmount: {type: number}\nrelationships:\n  - {name: hasBorrowingCapacityAssessment, from: Borrower, to: BorrowingCapacityAssessment}"
}
```

### Turn 47 — tool

Applied. Added 2, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 47 — assistant

I’ve recorded the loan, agreement, and facility amounts separately. I also added a **BorrowingCapacityAssessment** linked from the borrower, with the assessed amount on the assessment. None of these placements makes a value mandatory on every record.

Before moving on, I’m checking the path for that new concept: for “What borrowing capacity has been assessed for this borrower?”, is **Borrower → BorrowingCapacityAssessment → assessed amount** the complete path, with no other record needed to identify the assessment?

### Turn 48 — user

Yes. Follow the **borrower’s link to a borrowing capacity assessment**, then read the amount on that assessment. No facility record is needed to identify the assessment; a facility’s available amount is a different figure.

That path doesn’t imply there is only one assessment for a borrower or make an as-of-date field mandatory.

### Turn 48 — assistant

That confirms the path to assessed borrowing capacity. It does not assume one assessment per borrower, require an as-of date, or equate capacity with a facility’s available amount.

For the **date questions**, should **initialExchangeDate** and **maturityDate** be date values on both **Loan** and **CreditAgreement**? The initial exchange date would remain a date stated in the terms, not proof of disbursement.

### Turn 49 — user

Yes. The **initial exchange date** and **maturity date** are date values on both the loan and the credit agreement. The initial exchange date is what the terms state for the initial exchange; it does **not** by itself prove that funds were disbursed.

### Turn 49 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      initialExchangeDate: {type: date}\n      maturityDate: {type: date}\n  CreditAgreement:\n    properties:\n      initialExchangeDate: {type: date}\n      maturityDate: {type: date}"
}
```

### Turn 49 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 49 — assistant

I’ve added both dates to Loan and CreditAgreement. The initial exchange date remains a term, not evidence of actual disbursement.

For the **rate question** and variable-rate review, should **InterestRate** carry a numeric rate and a fixed-or-variable type? To identify applicable variable-rate features, which values, if any, belong on InterestRate: benchmark reference, institution-set basis, rate cap, or first rate-change term? Please distinguish what the agent needs to read from features that may merely exist in some agreements.

### Turn 50 — user

The agent needs the **numeric rate** and whether the loan’s linked rate is **fixed or variable**. I’d use the kind of rate to make that distinction, rather than assume a separate “rate type” field is required.

A variable rate may be **floating**, based on an index or benchmark, or **managed**, set from time to time by the institution. Those are meaningful distinctions, but I wouldn’t invent a benchmark-reference field or an institution-set-basis field here.

The **interest rate cap** and **first rate-change term in months** are values on the **loan**, not on the interest rate. Check them when applicable; neither replaces the reset schedule needed for the variable-rate setup review.

### Turn 50 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InterestRate:\n    properties:\n      numericRate: {type: number}\n  Loan:\n    properties:\n      interestRateCap: {type: number}\n      firstRateChangeTermMonths: {type: number, unit: months}"
}
```

### Turn 50 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 50 — assistant

I’ve recorded the numeric rate on **InterestRate**, and the applicable cap and first rate-change term on **Loan**. I haven’t added benchmark or institution-set-basis fields. The reset schedule remains a separate part of the variable-rate review.

For the **kind of rate**, would one value on InterestRate with choices **fixed, floating, managed** capture your distinction—where floating and managed are both variable—or do you use another set of choices?

### Turn 51 — user

I’d keep **variable** as a possible kind in its own right. **Floating** and **managed** are more specific kinds of variable rate, so “fixed, floating, managed” alone would leave out a variable rate that hasn’t been identified as either of those.

If the canvas needs one set of choices, use **fixed, variable, floating, and managed**, with floating and managed understood as variable. That’s a way to preserve the distinction, not a requirement for a particular stored field.

### Turn 51 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InterestRate:\n    properties:\n      rateKind:\n        type: text\n        allowed: [fixed, variable, floating, managed]"
}
```

### Turn 51 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 51 — assistant

I’ve recorded **fixed, variable, floating, and managed** as rate-kind choices. Floating and managed are understood as variable; the value does not require a particular storage field.

For the interest questions, which values should the agent read from these distinct concepts: **InterestPaymentTerms** (accrual start, first and final payment dates, payment frequency and day, compounding frequency), **InterestCalculationSchedule** (calculation dates), **InterestPaymentSchedule** (due dates), and **DayCountConvention** (the convention itself)? Are those the right placements, and is any listed value unnecessary to the questions we agreed?

### Turn 52 — user

Yes, those are the right places to look.

- **Interest payment terms** carry the initial accrual date, initial and final interest payment dates, payment frequency and day, and compounding frequency. All are relevant to what the terms require.
- The **interest calculation schedule** tells us when calculations are scheduled; the **interest payment schedule** tells us when interest is due. Those dates are schedule content, not extra fields I’d prescribe here.
- The **day-count convention** is a distinct convention referenced by the interest payment terms as their accrual basis. We need to identify which convention applies, but I wouldn’t invent a list of permitted conventions.

None of the values you listed is unnecessary to the agreed questions. Their placement does not, on its own, make every value mandatory for every deal.

### Turn 52 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InterestPaymentTerms:\n    properties:\n      initialAccrualDate: {type: date}\n      initialInterestPaymentDate: {type: date}\n      finalInterestPaymentDate: {type: date}\n      paymentFrequency: {type: text}\n      paymentDay: {type: text}\n      compoundingFrequency: {type: text}"
}
```

### Turn 52 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 52 — assistant

I’ve recorded the six values you placed on **InterestPaymentTerms**. I haven’t prescribed extra date fields for the schedules or an allowed list for day-count conventions.

To make the schedule questions answerable on this canvas, how should the agent read each schedule’s content: as dates recorded on the **InterestCalculationSchedule** and **InterestPaymentSchedule** concepts, or through individual dated entries that it must identify separately?

### Turn 53 — user

Read the calculation dates and payment due dates **from the respective schedules**. The agent needs to inspect the schedule content, but I wouldn’t require separately identifiable dated entries or prescribe a particular date field for each event.

If a schedule is on file but its dates aren’t available to the agent, it can report that the schedule exists—not answer what dates it contains.

### Turn 53 — assistant

The agent will read calculation dates and due dates from the respective schedules, without assuming separate dated-entry concepts or a particular field layout. If it can confirm only that a schedule exists, it cannot answer which dates it contains.

For the **measurement questions**, are these the right values to record: **AccruedInterest**—unpaid amount and as-of date; **CollateralAppraisal**—appraised value and as-of date; **LoanToValueRatio**—ratio value; and **CombinedLoanToValueRatio**—combined ratio value? Recording the accrued-interest values would still **not** resolve how to attribute them to a particular loan.

### Turn 54 — user

Yes. Those are the values the agent needs to read:

- **Accrued interest:** unpaid amount and as-of date.
- **Dated collateral appraisal:** appraised value and as-of date.
- **Loan-to-value ratio** and **combined loan-to-value ratio:** each its own ratio value.

I’d call the appraisal a **collateral value as of a date**, to keep the value and date together. And you’re right: recording accrued interest’s amount and date still does **not** establish that it belongs to a particular loan. That attribution remains open.

### Turn 54 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  AccruedInterest:\n    properties:\n      unpaidAmount: {type: number}\n      asOfDate: {type: date}\n  CollateralAppraisal:\n    properties:\n      appraisedValue: {type: number}\n      asOfDate: {type: date}\n  LoanToValueRatio:\n    properties:\n      ratioValue: {type: number}\n  CombinedLoanToValueRatio:\n    properties:\n      ratioValue: {type: number}"
}
```

### Turn 54 — tool

Applied. Added 0, updated 4 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 54 — assistant

I’ve recorded those measurement values separately. **AccruedInterest still has no confirmed loan-attribution path**; its amount and date alone cannot answer the loan-specific question.

For the security and prepayment decisions, would these values capture what the agent needs: a **Loan security classification** that can distinguish borrower-provided collateral, a third-party guarantee, and no security, without treating that list as exhaustive; and, on **PrincipalRepaymentTerms**, a marker for “covers prepayment” plus a **penalty period in months** when a penalty applies? What, if anything, should change?

### Turn 55 — user

That works as a **canvas representation**, with two cautions.

The security classification should distinguish **borrower-provided collateral**, **third-party guarantee**, and **unsecured** without treating those as an exhaustive list or a required field on every loan. A missing classification does not mean “unsecured.” And a collateral classification does not replace checking that the asset is actually linked to the secured loan.

For repayment terms, mark the terms that **cover prepayment** and record the **penalty period in months** there when a penalty applies. The agent must first establish that those terms govern *this loan’s principal*. Covering prepayment does not, by itself, mean there is a penalty.

### Turn 55 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    properties:\n      securityClassification: {type: text}\n  PrincipalRepaymentTerms:\n    properties:\n      coversPrepayment: {type: boolean}\n      penaltyPeriodMonths: {type: number, unit: months}"
}
```

### Turn 55 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 55 — assistant

I’ve recorded the security classification as open-ended and optional: a missing value does **not** mean unsecured, and a collateral classification does not replace checking the asset link. I’ve also recorded the prepayment marker and penalty period on **PrincipalRepaymentTerms**; covering prepayment does not itself mean a penalty applies.

For the question “What do the principal repayment terms require?”, what specific information must the agent read from those terms **besides** whether they cover prepayment and any penalty period?

### Turn 56 — user

Read the **initial principal payment date**, **principal repayment date**, **principal payment frequency**, and **principal payment day**. Those tell us when principal repayment starts, when it is due, and its recurring timing.

Keep those term values distinct from the **principal payment schedule**, which shows the contract-specific dates when some or all principal is due. These fields are relevant to answering what the terms require; I’m not saying each is mandatory for every deal.

### Turn 56 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PrincipalRepaymentTerms:\n    properties:\n      initialPrincipalPaymentDate: {type: date}\n      principalRepaymentDate: {type: date}\n      principalPaymentFrequency: {type: text}\n      principalPaymentDay: {type: text}"
}
```

### Turn 56 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 56 — assistant

I’ve recorded those four principal-repayment values on the terms, separate from the principal payment schedule’s contract-specific dates. None is automatically mandatory for every deal.

For **ongoing servicing**, which of the concepts we’ve named does the agent need to track in a *current state* over time, rather than merely look up its terms, dates, or links? In particular, does **Loan** need a current-state or status value for any of the agreed questions or verification actions?

### Turn 57 — user

No **loan status** or general current-state field is needed for the questions and verification checks we’ve agreed. I wouldn’t invent status choices for them.

Servicing does need to read **changing amounts and actual activity**, as distinct from the agreed terms: the loan balance and outstanding principal, accrued interest as of a date *if it can be attributed to the loan*, facility availability and credit extended, and the loan’s payment history with its individual transactions. Collateral values are also dated because an appraisal can change.

Those are figures or records to inspect over time, not a single “current status” that answers the questions for us.

### Turn 57 — assistant

No general **Loan status** is needed for the agreed questions or checks. The changing figures already in scope include facility availability and credit extended, dated collateral appraisals, payment activity, and accrued interest—though the accrued amount still cannot be attributed to a loan without reliable evidence.

You also named **loan balance** and **outstanding principal**. Which agreed question or verification action needs either figure, or should we add a specific agent question for them? I won’t add fields for them solely because they may be available in servicing.

### Turn 58 — user

None of the five agreed verification actions requires either figure, and the **original principal amount** question does not answer what remains outstanding.

If the agent is meant to cover ongoing balances, add a question: **“What are the loan balance and outstanding principal amount?”** Keep them distinct—the loan balance is a value on the loan, while outstanding principal is an amount associated with its principal. Don’t make either a prerequisite for the checks we’ve agreed.

### Turn 58 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "competency_questions:\n  - text: What are the loan balance and outstanding principal amount?\nclasses:\n  Loan:\n    properties:\n      loanBalance: {type: number}\n  Principal:\n    properties:\n      outstandingPrincipalAmount: {type: number}"
}
```

### Turn 58 — tool

Applied. Added 1, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 58 — assistant

I’ve added the ongoing-balance question and placed **loan balance** on Loan and **outstanding principal amount** on Principal. Neither is a prerequisite for the five verification checks. The property pass is captured for the questions discussed; the accrued-interest attribution remains open.

Next I’ll capture plain-language meanings, so the agent can distinguish similar concepts. In one sentence each, how would you define **Loan**, **CreditAgreement**, **CreditFacility**, **SubFacility**, and **BorrowingCapacityAssessment** as your team uses them?

### Turn 59 — user

- **Loan:** Money or credit extended to a borrower, to be repaid under the agreed terms.
- **Credit agreement:** The agreement under which a borrower receives value and generally agrees to repay it by a future date, usually with interest.
- **Credit facility:** A credit agreement that lets the borrower draw funds over time rather than apply for a new loan each time.
- **Sub-facility:** A portion of a credit facility made available for a particular purpose, sometimes under its own schedule.
- **Borrowing capacity assessment:** The lender’s assessment, at a point in time, of the upper amount the borrower can repay when due; it is not the facility’s available amount.

### Turn 59 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Loan:\n    meaning: Money or credit extended to a borrower, to be repaid under the agreed terms.\n  CreditAgreement:\n    meaning: An agreement under which a borrower receives value and generally agrees to repay it by a future date, usually with interest.\n  CreditFacility:\n    meaning: A credit agreement that lets the borrower draw funds over time rather than apply for a new loan each time.\n  SubFacility:\n    meaning: A portion of a credit facility made available for a particular purpose, sometimes under its own schedule.\n  BorrowingCapacityAssessment:\n    meaning: The lender's assessment, at a point in time, of the upper amount the borrower can repay when due; it is not the facility's available amount."
}
```

### Turn 59 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 59 — assistant

I’ve recorded those five meanings. They distinguish the draw-over-time facility from a loan, and assessed borrowing capacity from facility availability.

In one sentence each, how would your team define **Borrower**, **Lender**, **Servicer**, **Principal**, and **Interest**?

### Turn 60 — user

- **Borrower:** The party obliged to repay what was borrowed, with interest and applicable fees, under the agreement.
- **Lender:** The party that extends money or credit to the borrower expecting repayment, usually with interest.
- **Servicer:** The party that collects principal and interest payments on the lender’s behalf.
- **Principal:** The amount of the debt that must be repaid, separate from interest.
- **Interest:** The cost the borrower pays for using the credit, expressed as a rate over time and distinct from principal.

### Turn 60 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Borrower:\n    meaning: The party obliged to repay what was borrowed, with interest and applicable fees, under the agreement.\n  Lender:\n    meaning: The party that extends money or credit to the borrower expecting repayment, usually with interest.\n  Servicer:\n    meaning: The party that collects principal and interest payments on the lender's behalf.\n  Principal:\n    meaning: The amount of the debt that must be repaid, separate from interest.\n  Interest:\n    meaning: The cost the borrower pays for using the credit, expressed as a rate over time and distinct from principal."
}
```

### Turn 60 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 60 — assistant

I’ve recorded those party and obligation meanings. They keep the servicer’s collection role distinct from the lender, and principal distinct from interest.

Please give a one-sentence meaning for each of these related but different concepts: **InterestRate**, **InitialInterestRateSettingEvent**, **InterestRateResetSchedule**, **AccruedInterest**, and **DayCountConvention**.

### Turn 61 — user

- **Interest rate:** The rate used to charge interest on the loan; it may be fixed or variable.
- **Initial interest-rate-setting event:** The event at which the loan’s initial rate is established, distinct from a later reset.
- **Interest-rate reset schedule:** The schedule of dates when a rate reset and the resulting rate are recalculated.
- **Accrued interest:** Interest incurred but not yet paid, stated as an amount as of a particular date.
- **Day-count convention:** The convention used to count days when calculating accrued interest.

### Turn 61 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InterestRate:\n    meaning: The rate used to charge interest on the loan; it may be fixed or variable.\n  InitialInterestRateSettingEvent:\n    meaning: The event at which the loan's initial rate is established, distinct from a later reset.\n  InterestRateResetSchedule:\n    meaning: The schedule of dates when a rate reset and the resulting rate are recalculated.\n  AccruedInterest:\n    meaning: Interest incurred but not yet paid, stated as an amount as of a particular date.\n  DayCountConvention:\n    meaning: The convention used to count days when calculating accrued interest."
}
```

### Turn 61 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 61 — assistant

I’ve recorded those five meanings, including the distinction between setting the initial rate and later resets.

Please give a one-sentence meaning for each: **InterestPaymentTerms**, **InterestCalculationSchedule**, **InterestPaymentSchedule**, **PrincipalRepaymentTerms**, and **LoanPaymentSchedule**.

### Turn 62 — user

- **Interest payment terms:** The agreed requirements for paying interest, including the accrual basis and payment timing.
- **Interest calculation schedule:** The contract-specific schedule of dates on which interest is calculated.
- **Interest payment schedule:** The contract-specific schedule of dates on which interest is due.
- **Principal repayment terms:** The agreed requirements for repaying principal.
- **Loan payment schedule:** The regular or explicitly dated payment schedule associated with a particular loan.

### Turn 62 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InterestPaymentTerms:\n    meaning: The agreed requirements for paying interest, including the accrual basis and payment timing.\n  InterestCalculationSchedule:\n    meaning: The contract-specific schedule of dates on which interest is calculated.\n  InterestPaymentSchedule:\n    meaning: The contract-specific schedule of dates on which interest is due.\n  PrincipalRepaymentTerms:\n    meaning: The agreed requirements for repaying principal.\n  LoanPaymentSchedule:\n    meaning: The regular or explicitly dated payment schedule associated with a particular loan."
}
```

### Turn 62 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 62 — assistant

Those meanings are recorded. They keep payment requirements separate from the contract-specific dates shown on schedules.

Please define the remaining repayment and payment-record concepts in one sentence each: **PrincipalPaymentSchedule**, **AmortizationSchedule**, **PaymentHistory**, and **PaymentTransaction**.

### Turn 63 — user

- **Principal payment schedule:** The contract-specific schedule showing when some or all of the principal is due to be repaid.
- **Amortization schedule:** The schedule of periodic payments showing how the debt balance changes over time.
- **Payment history:** The record of payments actually made toward the borrower’s repayment obligation.
- **Individual payment transaction:** An actual payment toward the debt—of principal, interest, fees, or another related amount—that forms part of the payment history.

### Turn 63 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PrincipalPaymentSchedule:\n    meaning: The contract-specific schedule showing when some or all of the principal is due to be repaid.\n  AmortizationSchedule:\n    meaning: The schedule of periodic payments showing how the debt balance changes over time.\n  PaymentHistory:\n    meaning: The record of payments actually made toward the borrower's repayment obligation.\n  PaymentTransaction:\n    meaning: An actual payment toward the debt, of principal, interest, fees, or another related amount, that forms part of the payment history."
}
```

### Turn 63 — tool

Applied. Added 0, updated 4 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 63 — assistant

I’ve recorded those four meanings. The schedules describe amounts due or how the balance changes; payment history and transactions describe payments actually made.

Please give one sentence each for **Collateral**, **SecurityAgreement**, **CollateralAppraisal**, **LoanToValueRatio**, and **CombinedLoanToValueRatio**.

### Turn 64 — user

- **Collateral:** An asset pledged as security for repayment of an obligation.
- **Security agreement:** The agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning that asset.
- **Dated collateral value:** The collateral’s appraised value as of a specified date.
- **Loan-to-value ratio:** This loan’s principal as a percentage of the appraised value of the asset securing it.
- **Combined loan-to-value ratio:** Total debt secured by the asset or assets as a percentage of their appraised value.

### Turn 64 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Collateral:\n    meaning: An asset pledged as security for repayment of an obligation.\n  SecurityAgreement:\n    meaning: An agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning that asset.\n  CollateralAppraisal:\n    meaning: The collateral's appraised value as of a specified date.\n  LoanToValueRatio:\n    meaning: This loan's principal as a percentage of the appraised value of the asset securing it.\n  CombinedLoanToValueRatio:\n    meaning: Total debt secured by the asset or assets as a percentage of their appraised value."
}
```

### Turn 64 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 64 — assistant

I’ve recorded those five meanings. I’ll use **dated collateral value** as an alternate name for CollateralAppraisal if you confirm it means the same thing in your team’s language.

For the concepts defined so far, which of these are genuine alternate names—not just related concepts: **CollateralAppraisal → “dated collateral value”**, **PaymentTransaction → “individual payment”**, **InterestRateResetSchedule → “rate reset schedule”**, and **BorrowingCapacityAssessment → “borrowing capacity assessment”**? Are there other common names for this group?

### Turn 65 — user

Yes, with a couple of qualifications:

- **Collateral appraisal** and **dated collateral value** mean the same measurement here, provided the appraised value **and its as-of date** stay together. I’d usually say “collateral value as of a date.”
- **Payment transaction** and **individual payment** are interchangeable in the payment history, as long as “payment” means an actual transaction, not one scheduled to occur.
- **Interest-rate reset schedule** and **rate reset schedule** are interchangeable.
- **Borrowing capacity assessment** is fine for the assessed capacity we’ve discussed; I’d also simply call it **borrowing capacity**. It remains distinct from a facility’s available amount.

Other shorthand you’ll hear in this group is **LTV** for loan-to-value ratio and **adjustable rate** for variable interest rate. “Master commitment” is also used for a credit facility.

### Turn 65 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CollateralAppraisal:\n    aliases: [dated collateral value, collateral value as of a date]\n  PaymentTransaction:\n    aliases: [individual payment]\n  InterestRateResetSchedule:\n    aliases: [rate reset schedule]\n  BorrowingCapacityAssessment:\n    aliases: [borrowing capacity]\n  LoanToValueRatio:\n    aliases: [LTV]"
}
```

### Turn 65 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 65 — assistant

I’ve recorded the confirmed alternate names for the appraisal, individual payment, reset schedule, borrowing-capacity assessment, and LTV. I haven’t attached **“adjustable rate”** to the whole InterestRate class, because you used it for the *variable* kind.

Does **“master commitment”** mean the same thing as **CreditFacility** in your team’s usage, or can a master commitment exist separately from a facility?

### Turn 66 — user

**“Master commitment” is an alternate name for a credit facility** in this usage, not a separate thing the agent needs to identify. I wouldn’t create another concept for it.

### Turn 66 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  CreditFacility:\n    aliases: [master commitment]"
}
```

### Turn 66 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 66 — assistant

I’ve recorded **master commitment** as an alias for CreditFacility, not a separate concept. “Adjustable rate” remains wording for a variable rate kind, not for every InterestRate.

Next are plain meanings for the **relationships**. For the six party links, can we use these meanings for each of Loan, CreditAgreement, and CreditFacility: **“has borrower” identifies the party obliged to repay under that particular arrangement**, and **“has lender” identifies the party extending credit under it**? Please correct either meaning if it differs across the three.

### Turn 67 — user

That wording works for the **loan** and **credit agreement**. For a **credit facility**, I’d adjust it slightly: its borrower is the party **allowed to draw funds under the facility**, and its lender is the party **providing the facility**. Calling the facility borrower obliged to repay is too broad before any funds have been drawn. The links still run from each arrangement to its borrower and lender.

### Turn 67 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasBorrower, from: Loan, to: Borrower, meaning: The party obliged to repay under this loan.}\n  - {name: hasLender, from: Loan, to: Lender, meaning: The party extending credit under this loan.}\n  - {name: hasBorrower, from: CreditAgreement, to: Borrower, meaning: The party obliged to repay under this credit agreement.}\n  - {name: hasLender, from: CreditAgreement, to: Lender, meaning: The party extending credit under this credit agreement.}\n  - {name: hasBorrower, from: CreditFacility, to: Borrower, meaning: The party allowed to draw funds under this credit facility.}\n  - {name: hasLender, from: CreditFacility, to: Lender, meaning: The party providing this credit facility.}"
}
```

### Turn 67 — tool

Applied. Added 0, updated 6 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 67 — assistant

I’ve recorded the party-link meanings separately for the facility: being allowed to draw is not the same as already owing a drawn amount.

For these five links, are the following meanings accurate?

- **CreditFacility → SubFacility:** the portions into which the facility is divided, if any.
- **Borrower → BorrowingCapacityAssessment:** an assessment of that borrower’s capacity to repay when due.
- **Loan → Interest:** interest owed for using credit under that loan.
- **InterestPaymentTerms → Interest:** terms governing payment of that interest.
- **InterestPaymentTerms → DayCountConvention:** the convention used as the terms’ accrual basis.

### Turn 68 — user

Yes, those meanings are accurate. I’d make one small distinction in the first: a credit facility **has sub-facilities that form portions of it**; don’t infer every facility must be divided.

The other links run as you’ve written them: the borrower has the capacity assessment; the loan has interest; the interest payment terms govern payment of that interest; and those terms have the day-count convention as their accrual basis. None of those link meanings alone imposes a blanket requirement that every such record have a linked item.

### Turn 68 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasSubFacility, from: CreditFacility, to: SubFacility, meaning: A credit facility has sub-facilities that form portions of it when it is divided.}\n  - {name: hasBorrowingCapacityAssessment, from: Borrower, to: BorrowingCapacityAssessment, meaning: The borrower has an assessment of its capacity to repay when due.}\n  - {name: hasInterest, from: Loan, to: Interest, meaning: The loan has interest owed for using the credit.}\n  - {name: governsPaymentOf, from: InterestPaymentTerms, to: Interest, meaning: These terms govern payment of the interest owed under the loan.}\n  - {name: hasAccrualBasis, from: InterestPaymentTerms, to: DayCountConvention, meaning: These terms have the day-count convention used as their accrual basis.}"
}
```

### Turn 68 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 68 — assistant

I’ve recorded those five meanings, including that sub-facilities exist only where the facility is divided.

For the loan’s **interest rate and timing** links, can I describe them this way?

- **Loan → InterestRate:** the rate used to charge interest on this loan.
- **Loan → InitialInterestRateSettingEvent:** the event establishing this loan’s initial rate.
- **Loan → InterestRateResetSchedule:** the schedule for this loan’s later rate resets, when its rate is variable.
- **Loan → InterestCalculationSchedule:** dates when interest is calculated for this loan.
- **Loan → InterestPaymentSchedule:** dates when interest is due for this loan.

Please correct any meaning that overstates when a link must exist.

### Turn 69 — user

Those meanings work. I’d keep **“when applicable”** on the schedule links: a reset schedule is needed for the **variable-rate setup review**, but the link’s meaning alone doesn’t say every loan has one. Likewise, the calculation and payment schedules describe dates **when those schedules are associated with the loan**; don’t infer they’re present for every loan.

The initial rate-setting event identifies when the initial rate is established, not a later reset. Its link also shouldn’t be treated as mandatory for every loan just from the description.

### Turn 69 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasInterestRate, from: Loan, to: InterestRate, meaning: The rate used to charge interest on this loan when it bears interest.}\n  - {name: hasInitialInterestRateSettingEvent, from: Loan, to: InitialInterestRateSettingEvent, meaning: The event establishing this loan's initial interest rate when applicable, not a later reset.}\n  - {name: hasInterestRateResetSchedule, from: Loan, to: InterestRateResetSchedule, meaning: The schedule associated with this loan for later rate resets when applicable.}\n  - {name: hasInterestCalculationSchedule, from: Loan, to: InterestCalculationSchedule, meaning: The associated schedule specifying dates when interest is calculated for this loan, when applicable.}\n  - {name: hasInterestPaymentSchedule, from: Loan, to: InterestPaymentSchedule, meaning: The associated schedule specifying dates when interest is due for this loan, when applicable.}"
}
```

### Turn 69 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 69 — assistant

Those five link meanings are recorded with applicability kept separate from mere existence. In particular, the initial-rate event is not a later reset.

For the **principal and payment schedules**, are these five meanings right?

- Loan → Principal: principal owed under the loan, distinct from interest.
- PrincipalRepaymentTerms → Principal: terms governing payment of that principal.
- Loan → LoanPaymentSchedule: the loan’s associated overall payment schedule, when on file.
- Loan → PrincipalPaymentSchedule: dates principal is due under that loan, when on file.
- Loan → AmortizationSchedule: periodic payments and resulting balance changes for that loan, when on file.

### Turn 70 — user

Yes, those meanings are right. I’d only be careful with **“principal owed”**: the principal is the repayment obligation, while its **outstanding amount** tells you what remains unpaid. Don’t read the original principal amount or the outstanding balance into the link itself.

The terms govern payment of that principal; each schedule is linked from the loan when it applies and is on file. The links alone don’t make every schedule mandatory.

### Turn 70 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasPrincipal, from: Loan, to: Principal, meaning: The loan has a principal repayment obligation, distinct from its original amount or outstanding amount.}\n  - {name: governsPaymentOf, from: PrincipalRepaymentTerms, to: Principal, meaning: These terms govern payment of the loan's principal.}\n  - {name: hasLoanPaymentSchedule, from: Loan, to: LoanPaymentSchedule, meaning: The loan has an associated overall payment schedule when applicable and on file.}\n  - {name: hasPrincipalPaymentSchedule, from: Loan, to: PrincipalPaymentSchedule, meaning: The loan has a schedule of principal due dates when applicable and on file.}\n  - {name: hasAmortizationSchedule, from: Loan, to: AmortizationSchedule, meaning: The loan has an applicable schedule of periodic payments and resulting balance changes when on file.}"
}
```

### Turn 70 — tool

Applied. Added 0, updated 5 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 70 — assistant

I’ve recorded those meanings without equating the principal obligation with either the original amount or what remains unpaid.

For **security and collateral value**, are these four relationship meanings accurate?

- Loan → Servicer: the party servicing this loan and collecting principal and interest payments for its lender.
- Loan → Collateral: the pledged asset backing this loan when it is collateralized.
- SecurityAgreement → Collateral: the agreement grants an interest in that pledged asset.
- Collateral → CollateralAppraisal: a recorded appraised value of the asset together with its as-of date.

### Turn 71 — user

Yes, with one qualification on the second link:

- The **loan is serviced by** the servicer, which collects principal and interest payments on its lender’s behalf.
- A **secured loan is collateralized by** the pledged asset when collateral backs it. I wouldn’t describe this as an unrestricted link from every loan, or assume a guarantee-backed loan has a pledged asset.
- The **security agreement secures** the collateral by granting a financial interest in it.
- The **collateral has a dated appraised value**—the value and its as-of date belong together.

These describe the connections; they don’t make an appraisal mandatory whenever collateral is linked.

### Turn 71 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: servicedBy, from: Loan, to: Servicer, meaning: The loan is serviced by the party collecting principal and interest payments on its lender's behalf.}\n  - {name: collateralizedBy, from: Loan, to: Collateral, meaning: A secured loan is collateralized by this pledged asset when collateral backs it; this does not apply to a guarantee-backed loan without pledged collateral.}\n  - {name: secures, from: SecurityAgreement, to: Collateral, meaning: The security agreement secures this pledged collateral by granting a financial interest in it.}\n  - {name: hasDatedAppraisedValue, from: Collateral, to: CollateralAppraisal, meaning: The collateral has this recorded appraised value together with its as-of date when one is available.}"
}
```

### Turn 71 — tool

Applied. Added 0, updated 4 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 71 — assistant

Those four meanings are recorded. The collateral link applies when an asset backs the loan; a guarantee alone does not supply that asset. An appraisal link, when present, carries its value and date together.

For the payment-record path, do these meanings work: **Loan → PaymentHistory** is the history of actual payments toward that loan, and **PaymentHistory → PaymentTransaction** links each individual actual payment making up that history—not scheduled payments?

### Turn 72 — user

Yes. The **loan has a payment history** of payments actually made toward its obligation, and that **history has individual payment transactions** making it up. They are not scheduled payments.

For the completeness review, both links must be present: a history with no individual transactions doesn’t pass that check. That says nothing about whether a payment was timely.

### Turn 72 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasPaymentHistory, from: Loan, to: PaymentHistory, meaning: The loan has a history of payments actually made toward its repayment obligation.}\n  - {name: hasIndividualPayments, from: PaymentHistory, to: PaymentTransaction, meaning: The history has individual actual payment transactions making it up, not scheduled payments.}"
}
```

### Turn 72 — tool

Applied. Added 0, updated 2 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 72 — assistant

I’ve recorded both payment-link meanings. The completeness review will require a history and at least one individual transaction, without judging timeliness.

Are there common alternative phrases for these relationship groups: **has borrower / has lender; is serviced by; is collateralized by; has a payment history / has individual payments**? Please give only phrases your team actually uses for the same connection; “none” is fine for any group.

### Turn 73 — user

I’d keep the relationship wording we’ve settled on. I don’t have another established phrase for **has borrower**, **has lender**, **is serviced by**, **has a payment history**, or **has individual payments** that adds anything useful.

For **is collateralized by**, we might say **“backed by pledged collateral.”** That means an asset backs the loan—not merely that the loan has been marked secured, and not that it has a third-party guarantee.

### Turn 73 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: collateralizedBy, from: Loan, to: Collateral, aliases: [backed by pledged collateral]}"
}
```

### Turn 73 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 73 — assistant

I’ve recorded **“backed by pledged collateral”** as an alias for the loan-to-collateral link. You confirmed no additional phrases for the other links in that group.

For the remaining relationship groups—**governs payment of interest or principal; has an accrual basis; has a reset or payment schedule; has sub-facilities; has a borrowing-capacity assessment; and secures collateral**—are there established alternate phrases your team uses for the *same connections*? “None” is fine.

### Turn 74 — user

No established alternate relationship phrases I’d add for those groups. In conversation we may shorten “has an interest-rate reset schedule” to “has a reset schedule,” but that’s shorthand for the same schedule link, not a different connection. I’d keep the meanings and directions already recorded.

### Turn 74 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "relationships:\n  - {name: hasInterestRateResetSchedule, from: Loan, to: InterestRateResetSchedule, aliases: [has a reset schedule]}"
}
```

### Turn 74 — tool

Applied. Added 0, updated 1 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 74 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 74 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit agreement?
  - id: cq2
    text: Who is the lender for a loan or credit agreement?
  - id: cq3
    text: What is the principal amount of a loan?
  - id: cq4
    text: What is the debt amount of a credit agreement?
  - id: cq5
    text: "What is a facility's credit limit?"
  - id: cq6
    text: What is the amount of credit extended under a facility?
  - id: cq7
    text: What is the available amount under a facility?
  - id: cq8
    text: What initial exchange date is stated in the terms?
  - id: cq9
    text: When does a loan or credit agreement mature?
  - id: cq10
    text: "What interest rate and rate type apply, and which variable-rate features apply?"
  - id: cq11
    text: What day-count convention governs interest calculation?
  - id: cq12
    text: When are interest calculations scheduled?
  - id: cq13
    text: "What do the interest payment terms require, and what due dates appear on the interest payment schedule?"
  - id: cq14
    text: "How much interest is accrued but unpaid, as of what date?"
  - id: cq15
    text: "For a variable rate, what event sets the initial rate, and what schedule covers later resets?"
  - id: cq16
    text: What do the principal repayment terms require?
  - id: cq17
    text: "Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?"
  - id: cq18
    text: "Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?"
  - id: cq19
    text: "If collateral is pledged, what collateral is linked to the loan?"
  - id: cq20
    text: What security agreement grants an interest in the pledged collateral linked to the loan?
  - id: cq21
    text: "Who services the loan and collects principal and interest payments on the lender's behalf?"
  - id: cq22
    text: "For a collateralized loan, what are the collateral's appraised value and as-of date, and what loan-to-value and combined loan-to-value ratios are recorded?"
  - id: cq23
    text: What borrowing capacity has been assessed for this borrower?
  - id: cq24
    text: "If a credit facility is divided, which sub-facilities make up this credit facility?"
  - id: cq25
    text: What are the loan balance and outstanding principal amount?
classes:
  Loan:
    meaning: "Money or credit extended to a borrower, to be repaid under the agreed terms."
    aliases: []
    properties:
      principalAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
      interestRateCap:
        type: number
      firstRateChangeTermMonths:
        type: number
        unit: months
      securityClassification:
        type: text
      loanBalance:
        type: number
  CreditAgreement:
    meaning: "An agreement under which a borrower receives value and generally agrees to repay it by a future date, usually with interest."
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  CreditFacility:
    meaning: A credit agreement that lets the borrower draw funds over time rather than apply for a new loan each time.
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
    meaning: "The party obliged to repay what was borrowed, with interest and applicable fees, under the agreement."
    aliases: []
    properties: {}
  Lender:
    meaning: "The party that extends money or credit to the borrower expecting repayment, usually with interest."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "The agreed requirements for paying interest, including the accrual basis and payment timing."
    aliases: []
    properties:
      initialAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
      compoundingFrequency:
        type: text
  InterestCalculationSchedule:
    meaning: The contract-specific schedule of dates on which interest is calculated.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The contract-specific schedule of dates on which interest is due.
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: The agreed requirements for repaying principal.
    aliases: []
    properties:
      coversPrepayment:
        type: boolean
      penaltyPeriodMonths:
        type: number
        unit: months
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      principalPaymentFrequency:
        type: text
      principalPaymentDay:
        type: text
  LoanPaymentSchedule:
    meaning: The regular or explicitly dated payment schedule associated with a particular loan.
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: The convention used to count days when calculating accrued interest.
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The contract-specific schedule showing when some or all of the principal is due to be repaid.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: The schedule of periodic payments showing how the debt balance changes over time.
    aliases: []
    properties: {}
  InterestRate:
    meaning: The rate used to charge interest on the loan; it may be fixed or variable.
    aliases: []
    properties:
      numericRate:
        type: number
      rateKind:
        type: text
        allowed:
          - fixed
          - variable
          - floating
          - managed
  InitialInterestRateSettingEvent:
    meaning: "The event at which the loan's initial rate is established, distinct from a later reset."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates when a rate reset and the resulting rate are recalculated.
    aliases:
      - rate reset schedule
    properties: {}
  AccruedInterest:
    meaning: "Interest incurred but not yet paid, stated as an amount as of a particular date."
    aliases: []
    properties:
      unpaidAmount:
        type: number
      asOfDate:
        type: date
  Collateral:
    meaning: An asset pledged as security for repayment of an obligation.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning that asset.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party that collects principal and interest payments on the lender's behalf."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The record of payments actually made toward the borrower's repayment obligation."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An actual payment toward the debt, of principal, interest, fees, or another related amount, that forms part of the payment history."
    aliases:
      - individual payment
    properties: {}
  SubFacility:
    meaning: "A portion of a credit facility made available for a particular purpose, sometimes under its own schedule."
    aliases: []
    properties: {}
  CollateralAppraisal:
    meaning: "The collateral's appraised value as of a specified date."
    aliases:
      - dated collateral value
      - collateral value as of a date
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  LoanToValueRatio:
    meaning: "This loan's principal as a percentage of the appraised value of the asset securing it."
    aliases:
      - LTV
    properties:
      ratioValue:
        type: number
  CombinedLoanToValueRatio:
    meaning: Total debt secured by the asset or assets as a percentage of their appraised value.
    aliases: []
    properties:
      ratioValue:
        type: number
  Interest:
    meaning: "The cost the borrower pays for using the credit, expressed as a rate over time and distinct from principal."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of the debt that must be repaid, separate from interest."
    aliases: []
    properties:
      outstandingPrincipalAmount:
        type: number
  BorrowingCapacityAssessment:
    meaning: "The lender's assessment, at a point in time, of the upper amount the borrower can repay when due; it is not the facility's available amount."
    aliases:
      - borrowing capacity
    properties:
      assessedCapacityAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The party obliged to repay under this loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The party extending credit under this loan.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: The party obliged to repay under this credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: The party extending credit under this credit agreement.
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: The party allowed to draw funds under this credit facility.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: The party providing this credit facility.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: A credit facility has sub-facilities that form portions of it when it is divided.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: InterestRate
    meaning: The rate used to charge interest on this loan when it bears interest.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: The associated schedule specifying dates when interest is calculated for this loan
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: The associated schedule specifying dates when interest is due for this loan
    aliases: []
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: These terms have the day-count convention used as their accrual basis.
    aliases: []
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: The loan has interest owed for using the credit.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: These terms govern payment of the interest owed under the loan.
    aliases: []
  - name: hasInitialInterestRateSettingEvent
    from: Loan
    to: InitialInterestRateSettingEvent
    meaning: "The event establishing this loan's initial interest rate when applicable"
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: The schedule associated with this loan for later rate resets when applicable.
    aliases:
      - has a reset schedule
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: The loan has an associated overall payment schedule when applicable and on file.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: The loan has a schedule of principal due dates when applicable and on file.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: The loan has an applicable schedule of periodic payments and resulting balance changes when on file.
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: The loan has a principal repayment obligation
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "These terms govern payment of the loan's principal."
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "The loan is serviced by the party collecting principal and interest payments on its lender's behalf."
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by this pledged asset when collateral backs it; this does not apply to a guarantee-backed loan without pledged collateral.
    aliases:
      - backed by pledged collateral
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement secures this pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasDatedAppraisedValue
    from: Collateral
    to: CollateralAppraisal
    meaning: The collateral has this recorded appraised value together with its as-of date when one is available.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: The loan has a history of payments actually made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: PaymentHistory
    to: PaymentTransaction
    meaning: The history has individual actual payment transactions making it up
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded combined loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasBorrowingCapacityAssessment
    from: Borrower
    to: BorrowingCapacityAssessment
    meaning: The borrower has an assessment of its capacity to repay when due.
    aliases: []
rules: {}
actions: {}


# CONSISTENCY CHECK — no outstanding problems in the model.

### Turn 74 — assistant

The meaning and language pass is recorded. Every class and relationship has a meaning sentence, and I’ve added the alternate names you confirmed. **AccruedInterest still has no confirmed loan-attribution path**; a definition cannot resolve that gap.

Next are fixed choices. Do your **interest payment frequency**, **compounding frequency**, and **principal payment frequency** values each use a small, established list? If so, what are the allowed choices for each? If a list varies by agreement, please say so rather than guessing one.

### Turn 75 — user

I don’t have a fixed allowed list for any of those three frequencies. **Interest payment frequency**, **compounding frequency**, and **principal payment frequency** are recorded in the applicable terms, but the choices depend on the agreement and the organization’s governing procedure. I wouldn’t impose a made-up list on the agent.

### Turn 75 — assistant

I won’t impose allowed lists on those three frequencies. The agent will read the applicable terms rather than reject a value based on an invented set.

For **securityClassification**, do you have a complete allowed-value list, or should it remain open-ended while recognizing “borrower-provided collateral,” “third-party guarantee,” and “unsecured” when stated?

### Turn 76 — user

Keep it **open-ended**. Those three are useful distinctions, not a complete allowed-value list for a loan. The agent should recognize them when supported by the deal record, and it must not interpret a missing classification as “unsecured.” For the secured-loan collateral check, it still needs the actual link to pledged collateral.

### Turn 76 — assistant

Security classification will stay open-ended. A missing value means **unknown**, not unsecured, and a collateral designation does not pass the collateral-link check.

To determine whether any amount needs a boundary check, what would go wrong if each of these were **missing or wrong**: Loan **principalAmount**, CreditAgreement **debtAmount**, and CreditFacility **creditLimit**, **amountOfCreditExtended**, and **availableAmount**? A short consequence for each is enough; I won’t infer that all five must be present on every record.

### Turn 77 — user

- **Loan principal amount:** We couldn’t reliably state the original amount being lent; a wrong figure would misstate it.
- **Credit agreement debt amount:** We couldn’t reliably state the debt amount under the agreement.
- **Facility credit limit:** We couldn’t reliably state the agreed ceiling for credit.
- **Amount of credit extended:** We’d misstate how much credit has been extended under the facility.
- **Available amount:** We’d misstate what remains available to the borrower under the facility.

Those are reasons to flag or correct the figures when answering the relevant questions—not, by themselves, rules that all five must be present or that a particular action is blocked.

### Turn 77 — assistant

I’ll treat missing or suspect figures as limits on the corresponding answers, not as blanket requirements or action blockers. Each of the five figures serves a different question.

For the **four dates**—initial exchange and maturity dates on Loan and on CreditAgreement—what would be wrong if each were missing or incorrect? Please distinguish an incorrect initial exchange date from missing proof that funds actually went out.

### Turn 78 — user

- **Loan initial exchange date:** If missing or wrong, we can’t reliably state the date specified for the loan’s initial exchange. Even a correct date is **not proof that funds went out**; disbursement evidence is a separate matter.
- **Loan maturity date:** If missing or wrong, we can’t reliably state when the loan is due to mature.
- **Credit agreement initial exchange date:** The same issue for the date specified in that agreement; it isn’t disbursement proof.
- **Credit agreement maturity date:** We can’t reliably state when that agreement matures.

I’d flag the affected answer for correction, not infer from these questions alone that every missing date blocks one of our five verification actions.

### Turn 78 — assistant

I’ve captured the consequence for each date: a missing or wrong value makes its answer unreliable, but none of these dates is automatically a blocker for the five checks. A correct initial exchange date still does not prove disbursement.

For **InterestRate.numericRate**, **InterestRate.rateKind**, **Loan.interestRateCap**, and **Loan.firstRateChangeTermMonths**, what breaks if each is missing or wrong? In particular, which missing values would cause the **variable-rate setup review** to fail, rather than simply leave a feature question unanswered?

### Turn 79 — user

- **Numeric rate:** Missing or wrong means we can’t reliably state the rate charged. The variable-rate setup review does not separately require a numeric-rate value; it checks the variable-rate link and reset schedule.
- **Rate kind:** If we can’t establish that the linked rate is variable, we can’t confirm the variable-rate review applies or passes. We shouldn’t assume an unknown kind is fixed.
- **Interest rate cap:** If it applies but is missing or wrong, we can’t reliably answer what cap applies. It is not a precondition for the reset-schedule review.
- **First rate-change term in months:** The same applies to the timing of the first change. It is distinct from, and does not replace, the reset schedule.

For a loan confirmed to have a **variable rate**, a missing **interest-rate reset schedule** is what prevents that setup review from passing.

### Turn 79 — assistant

For the variable-rate review, the agent must establish that the loan has a variable rate and a linked reset schedule. It need not require a numeric-rate value, cap, or first-change term to pass that specific review. An unknown rate kind is not treated as fixed.

For the **readiness assessment**, what breaks if the Loan → Borrower link, Loan → Lender link, Loan → InterestRate link, or governing **InterestPaymentTerms** path is missing or wrong? Please give the consequence for each, noting that the interest checks apply only to an interest-bearing loan.

### Turn 80 — user

For the **loan-readiness assessment**:

- **Borrower link missing or wrong:** We can’t confirm who owes the debt, so the assessment does not pass.
- **Lender link missing or wrong:** We can’t confirm who finances the loan, so it does not pass.
- **Interest-rate link missing or wrong:** For an interest-bearing loan, we can’t confirm its applicable fixed or variable rate, so it does not pass. An unknown rate must not be treated as evidence that the loan bears no interest.
- **Governing interest payment terms missing or wrong:** For an interest-bearing loan, we can’t confirm which terms govern payment of *this loan’s interest*, so it does not pass. Terms found elsewhere, without that governing path, aren’t enough.

These are conditions for this assessment, not blanket requirements for every loan record at every stage.

### Turn 80 — assistant

For **loan readiness**, both party links must be correct. If the loan bears interest, its applicable rate and the terms governing **that loan’s interest** must also be established; unrelated terms do not count. These are assessment conditions, not universal record requirements.

For the **secured-loan support review**, what breaks if either the loan’s security classification or its direct **Loan → Collateral** link is missing or wrong? Does the review require the security agreement or appraisal too, or only the pledged-asset link?

### Turn 81 — user

First, we need to establish that the loan is **secured** to apply this review. A missing classification alone doesn’t prove it’s unsecured; if we have no other reliable basis for identifying it as secured, we can’t determine whether this review applies. A wrong classification could send us down the wrong check.

For a loan confirmed as secured, a missing or incorrect **link to pledged collateral** means the secured-loan support review cannot pass. This particular review checks the asset link—not the security agreement or a dated appraisal. Those matter to other security questions, but they aren’t preconditions for this check.

### Turn 81 — assistant

That makes the review’s scope important: it checks the pledged-asset link, not the security agreement or appraisal. But you’ve also distinguished a loan secured by a **third-party guarantee**, which may have no pledged asset.

Should **verify secured-loan support** apply only to loans confirmed as **collateral-backed**, rather than to every loan described as secured?

### Turn 82 — user

I wouldn’t silently narrow the agreed review to collateral-backed loans. **As defined, it takes a secured loan and checks for a linked pledged asset.** A loan known to be backed only by a third-party guarantee may be secured, but it has no collateral link to satisfy this particular check.

So the agent should report that the **collateral-link check cannot pass**, while making clear that this does **not** mean the guarantee is invalid or the loan is unsecured. Verifying guarantee support would be a different check; we haven’t defined one here.

### Turn 82 — assistant

I’ll keep the review as defined for a **secured loan**. If it is backed only by a third-party guarantee, the collateral-link check cannot pass; that result says nothing about the guarantee’s validity or whether the loan is secured. We have not defined a guarantee-support review.

For the **dated and ratio measurements**, what breaks if each of these is missing or wrong: **AccruedInterest.unpaidAmount**, **AccruedInterest.asOfDate**, **CollateralAppraisal.appraisedValue**, **CollateralAppraisal.asOfDate**, **LoanToValueRatio.ratioValue**, and **CombinedLoanToValueRatio.ratioValue**? A brief consequence for each is enough; this does not assume every measurement must be on file.

### Turn 83 — user

- **Accrued interest amount:** We can’t reliably say how much interest is unpaid. Even a correct amount needs evidence tying it to the loan.
- **Accrued interest as-of date:** We can’t say when the unpaid amount applied; it isn’t a usable dated figure without that date.
- **Appraised collateral value:** We can’t reliably state the collateral’s value for the recorded appraisal.
- **Appraisal as-of date:** We can’t tell when that value applied, which matters because collateral values change.
- **Loan-to-value ratio:** We can’t reliably state the measure for this loan against its collateral.
- **Combined loan-to-value ratio:** We can’t reliably state the measure that accounts for total debt secured by the asset or assets.

I’d flag the affected answer, not treat a missing measurement as zero or as an automatic failure of one of the five verification checks.

### Turn 83 — assistant

Each missing or wrong measurement makes its corresponding answer unreliable; a missing measurement is not zero and does not automatically fail a verification action. An accrued-interest figure also needs loan-specific attribution, which remains unresolved.

For **PrincipalRepaymentTerms.coversPrepayment** and **penaltyPeriodMonths**, what breaks if either value is missing or wrong during the prepayment review? Please distinguish “the terms cover prepayment” from “a penalty applies.”

### Turn 84 — user

First the agent must establish that these terms govern **this loan’s principal**.

- If **“covers prepayment”** is missing or wrong, it can’t reliably identify these as the applicable prepayment terms. A “yes” only means they address early repayment; it does **not** mean a penalty applies.
- If a **penalty applies** but its **period in months** is missing, the prepayment review cannot confirm that the penalty timing is recorded. A wrong period would give an unreliable result and needs correction.

A missing penalty period must not be read as either “no penalty” or a zero-month period.

### Turn 84 — assistant

The agent must first establish that the terms govern **this loan’s principal**. “Covers prepayment” does not establish that a penalty applies, and a missing penalty period means neither “no penalty” nor zero months.

What recorded fact tells the agent **whether a prepayment penalty applies** to those governing terms, independently of the penalty-period value?

### Turn 85 — user

We haven’t established a separate **“penalty applies”** value. The agent would need the governing terms or other reliable deal evidence to say that a penalty applies; **“covers prepayment”** alone doesn’t say it, and a missing period doesn’t say it doesn’t.

If applicability is established, the review checks whether the **penalty period in months** is recorded. If applicability cannot be established, the agent should leave the review unresolved rather than infer a yes or no.

### Turn 85 — assistant

The prepayment review has a gap: it needs reliable evidence that a penalty applies **before** it can check the period. Neither `coversPrepayment` nor a missing period establishes that.

Can the governing **PrincipalRepaymentTerms** carry a separately established **“penalty applies”** value for this review, or can you only confirm applicability by inspecting evidence that we have not yet represented on the canvas?

### Turn 86 — user

I can’t confirm a separate **“penalty applies”** value on the principal repayment terms. The agent can inspect the terms governing this loan’s principal for evidence of a penalty, but we haven’t established a distinct field for that finding.

If that evidence shows a penalty applies, the review checks that its **period in months** is recorded. If the agent cannot establish applicability, it should leave the review unresolved—not infer it from “covers prepayment” or from a missing period.

### Turn 86 — assistant

I won’t add a “penalty applies” field. The agent must inspect the terms governing **this loan’s principal** for penalty evidence; if it cannot establish applicability, the review stays unresolved. It must not infer applicability from `coversPrepayment` or from an absent period.

For **payment-record completeness**, what breaks if either **Loan → PaymentHistory** or **PaymentHistory → PaymentTransaction** is missing or wrong? Does a history with no individual transactions fail the check even if the history record itself exists?

### Turn 87 — user

Yes. For **payment-record completeness**:

- If the loan’s **payment history link** is missing or points to the wrong history, the agent cannot verify the payment record for that loan.
- If the history has **no linked individual payment transactions**, or the links point to the wrong transactions, the check does not pass. A history record alone is not enough.

This checks that actual payment entries make up the history; it does not judge whether payments were on time or whether the borrower is current.

### Turn 87 — assistant

Payment-record completeness requires both the loan’s correct history link and that history’s links to individual actual payments. A history record alone does not pass; the check says nothing about timeliness or whether the borrower is current.

For the remaining **term-timing values**, what goes wrong if each is missing or wrong: the six values on **InterestPaymentTerms** (accrual start, first and final payment dates, payment frequency and day, compounding frequency)? A brief consequence for each will help separate an unanswered terms question from a condition that blocks one of the five checks.

### Turn 88 — user

For the **interest payment terms** question:

- **Initial accrual date:** We can’t reliably say when interest begins accruing.
- **Initial interest payment date:** We can’t reliably say when the first interest payment is due.
- **Final interest payment date:** We can’t reliably say when the last interest payment is due.
- **Payment frequency:** We can’t reliably describe how often interest is due.
- **Payment day:** We can’t reliably describe its recurring payment day.
- **Compounding frequency:** We can’t reliably describe how often interest compounds.

A wrong value could misstate the corresponding term. For **loan readiness**, we check that the applicable rate and terms governing this loan’s interest are established; none of these six values is an individually specified blocker for that assessment.

### Turn 88 — assistant

Each of those six values supports a specific answer about the interest terms. If one is missing or wrong, that part of the answer is unreliable; none is an individually specified blocker for loan readiness.

For the four values on **PrincipalRepaymentTerms**—initial principal payment date, principal repayment date, principal payment frequency, and principal payment day—what goes wrong if each is missing or wrong? Is any one a required condition for an agreed verification action?

### Turn 89 — user

- **Initial principal payment date:** We can’t reliably say when principal payments start.
- **Principal repayment date:** We can’t reliably say when principal is due to be repaid.
- **Principal payment frequency:** We can’t reliably describe how often principal is payable.
- **Principal payment day:** We can’t reliably describe the recurring due day.

A wrong value misstates that part of the repayment terms. None of these four values is an individually required condition for the five agreed verification actions. The amortizing-loan check we discussed looks for **terms governing principal repayment** and an **amortization schedule**, not a particular one of these fields.

### Turn 89 — assistant

Those four values each support a specific repayment-terms answer, but none is an individual blocker for the five actions. The amortizing-loan check looks for governing terms and an amortization schedule, not one particular timing field.

For the remaining changing figures—**Loan.loanBalance**, **Principal.outstandingPrincipalAmount**, **BorrowingCapacityAssessment.assessedCapacityAmount**, and **InterestRate.numericRate**—is the consequence of a missing or wrong value simply that the corresponding question cannot be answered reliably, with no automatic failure of the five checks? You’ve already confirmed the numeric rate is not itself required for the variable-rate review.

### Turn 90 — user

Yes. A missing or wrong **loan balance**, **outstanding principal amount**, or **assessed borrowing-capacity amount** makes that figure unreliable; it does not automatically fail any of the five agreed checks. Borrowing capacity may matter to a decision about extending more credit, but that decision is outside these checks.

The same is true of the **numeric rate**: we couldn’t reliably state the rate, but its numeric value is not an individually specified blocker for the five checks. Loan readiness checks for the applicable rate link and governing interest terms; the variable-rate review checks for a variable rate and reset schedule.

### Turn 90 — assistant

That completes the boundary pass: missing or wrong figures make their answers unreliable, but none of these four numeric values is an automatic blocker for the five checks. I haven’t added blanket required-field rules or invented value lists.

Before I record the **loan-readiness rule**, how does the agent establish that a loan is *interest-bearing*? Is the confirmed **Loan → Interest** link sufficient, or must it inspect another fact? An absent link must not silently mean “interest-free.”

### Turn 91 — user

A confirmed **loan-to-interest link** is sufficient to establish that an interest obligation is recorded for the loan, so the interest part of readiness applies. A linked fixed or variable interest rate is also evidence that the loan bears interest.

An **absent interest link is not proof that the loan is interest-free**. If the agent cannot establish whether interest applies from the loan’s recorded obligations and governing terms, it should leave that part of readiness unresolved rather than skip the interest checks. I wouldn’t add a new “interest-bearing” field solely for this rule.

### Turn 91 — assistant

I’ll use a confirmed Loan → Interest link or linked rate as evidence that the interest checks apply. An absent interest link is **not** proof the loan is interest-free; if applicability is unclear, readiness remains unresolved.

What evidence would let the agent confidently **skip** the interest checks for a loan that does not bear interest, if that situation occurs? Or should the model leave readiness unresolved whenever it cannot establish whether interest applies?

### Turn 92 — user

We haven’t established a recorded fact that positively identifies a loan as interest-free. So the agent should **not skip the interest checks just because no interest or rate link is present**.

If it cannot establish whether interest applies, leave the interest portion of readiness unresolved. A confirmed interest obligation or applicable rate makes the checks applicable; absence of those links does not establish the opposite.

### Turn 92 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  loanReadiness:\n    conditions:\n      - The loan has a confirmed hasBorrower link to its borrower and a confirmed hasLender link to its lender.\n      - If the loan has a confirmed hasInterest link or hasInterestRate link, establish its applicable hasInterestRate link and the InterestPaymentTerms whose governsPaymentOf link reaches the Interest linked by this loan's hasInterest link.\n      - If whether interest applies cannot be established, leave the interest portion of readiness unresolved; missing interest or rate links do not prove an interest-free loan."
}
```

### Turn 92 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 92 — assistant

I’ve recorded the loan-readiness rule: both party links are needed, interest-bearing evidence triggers the rate and governing-terms checks, and unknown interest applicability stays unresolved rather than being treated as interest-free.

For the **secured-loan collateral-link rule**, what reliable evidence besides `Loan.securityClassification` can establish that the loan is secured when that classification is missing? I’ll use only evidence you confirm; otherwise applicability remains unresolved.

### Turn 93 — user

A **verified link from the loan to pledged collateral** can establish that it has collateral backing, even if the classification value is missing. That lets the agent apply the collateral-link check without treating a blank classification as “unsecured.”

For a **guarantee-backed loan with no pledged asset**, we haven’t established another lookup or link that would independently confirm its secured status. If the classification is missing and the available evidence doesn’t establish security, the review’s applicability remains unresolved.

### Turn 93 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  securedLoanCollateralSupport:\n    conditions:\n      - Establish that the loan is secured from its securityClassification when supported by the deal record, or from a verified collateralizedBy link to pledged Collateral; missing classification does not mean unsecured.\n      - For a loan established as secured, the collateral-link check passes only if its collateralizedBy link to the correct pledged Collateral is verified.\n      - A guarantee-only secured loan without a pledged Collateral link does not pass this collateral-link check; this does not invalidate its guarantee or imply it is unsecured.\n      - If secured status cannot be established, leave applicability unresolved rather than treating the loan as unsecured."
}
```

### Turn 93 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 93 — assistant

I’ve recorded the collateral-link rule. A verified pledged-asset link can establish collateral backing even without a classification; a guarantee-only loan cannot pass this particular link check, but that result does not invalidate its guarantee.

For the **variable-rate setup rule**, should `floating` and `managed` both count as variable alongside `variable`, with the review passing only when that loan also has its **InterestRateResetSchedule** link? What should the result be if the rate kind is unknown?

### Turn 94 — user

Yes. **Floating** and **managed** both count as variable, as does a rate identified simply as **variable**. For a loan confirmed to have one of those rates, the setup review passes only when that **same loan** has an interest-rate reset schedule linked.

If the rate kind is unknown, the agent can’t establish that the variable-rate review applies or passes. It should report the setup as **unresolved**, not treat the rate as fixed or declare the review passed.

### Turn 94 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  variableRateSetup:\n    conditions:\n      - The loan's hasInterestRate link identifies an InterestRate with rateKind variable, floating, or managed.\n      - The same loan has a confirmed hasInterestRateResetSchedule link to its later InterestRateResetSchedule; its initial interest-rate-setting event is not a substitute.\n      - If rateKind is unknown, applicability and the result remain unresolved rather than assuming a fixed rate."
}
```

### Turn 94 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 94 — assistant

I’ve recorded floating, managed, and variable as triggering the same-loan reset-schedule check. An unknown rate kind leaves the review unresolved, and the initial-setting event cannot substitute for a reset schedule.

For the **payment-record completeness rule**, should it pass only when the loan has a verified **PaymentHistory** link and that same history has at least one verified **PaymentTransaction** link? If a link exists but points to the wrong history or transaction, should that fail rather than count as evidence?

### Turn 95 — user

Yes. The check passes only when the loan has the **correct payment history** and that history has **at least one verified individual payment transaction**. A link to the wrong history or a transaction that doesn’t belong in it is not evidence of completeness and must not count.

The result is about the presence and attribution of actual payment entries, not their timeliness or whether the loan is current.

### Turn 95 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  paymentRecordCompleteness:\n    conditions:\n      - Verify the loan's hasPaymentHistory link points to the correct PaymentHistory for that loan.\n      - Verify that same PaymentHistory has at least one correctly attributed PaymentTransaction through hasIndividualPayments.\n      - A missing or incorrectly attributed history or individual payment does not pass; do not assess timeliness or whether the borrower is current."
}
```

### Turn 95 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 95 — assistant

I’ve recorded the completeness rule: the correct history and at least one correctly attributed individual payment are required. It does not assess timeliness or currentness.

For the **prepayment review rule**, is this the right sequence: follow **Loan → Principal ← PrincipalRepaymentTerms** for the same principal; establish that those terms cover prepayment; inspect those governing terms for evidence that a penalty applies; and **only then** check that `penaltyPeriodMonths` is recorded? If penalty applicability cannot be established, the result stays unresolved.

### Turn 96 — user

Yes, that’s the right sequence for this canvas. First establish that the terms govern **this loan’s principal** and cover repayment before maturity. Then inspect those terms for evidence that a penalty applies. **Only if it does** should the review check that the penalty period in months is recorded.

If applicability cannot be established, leave the review unresolved. Don’t infer a penalty from the prepayment marker, or infer no penalty from a missing period.

### Turn 96 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  prepaymentPenaltyTiming:\n    conditions:\n      - Identify the Principal linked by this loan's hasPrincipal and PrincipalRepaymentTerms whose governsPaymentOf link reaches that same Principal.\n      - Confirm those governing PrincipalRepaymentTerms have coversPrepayment true.\n      - Inspect those terms for reliable evidence that a penalty applies; coversPrepayment alone does not establish a penalty.\n      - Only when penalty applicability is established, confirm penaltyPeriodMonths is recorded on those same terms; missing is not zero or proof of no penalty.\n      - If penalty applicability cannot be established, leave the review unresolved."
}
```

### Turn 96 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.

### Turn 96 — assistant

The five decision rules are now recorded. For the prepayment rule, the agent must first find terms governing **this loan’s principal**, then establish penalty applicability from those terms; an absent period cannot settle applicability.

Before I record the five verification actions, you said they should **record a result and retain what was checked**. Does the agent need to create a separately retrievable verification record for each check, or is returning the result with references to the inspected links and terms sufficient?

### Turn 97 — user

Returning each check’s result with references to the links, terms, or payment entries examined is sufficient. I wouldn’t require a separate, retrievable verification record for each check; we haven’t established one.

If the required evidence is missing or applicability cannot be determined, the result should say so rather than present the check as passed.

### Turn 97 — assistant

I’ll return each check’s result with references to the evidence examined, without creating a separate verification-record class. Missing evidence or uncertain applicability must be reported, not marked as a pass.

For **assess loan readiness**, is this action description right: take a **Loan**; apply the `loanReadiness` rule; return a pass, failure, or unresolved result with references to the borrower and lender links and, where interest applies, the rate link and terms governing that loan’s interest; then verify the result by checking those same links and governing path again?

### Turn 98 — user

Yes, with one adjustment: **checking the links and governing path is the verification**, not a second check performed after the result.

The action takes a **loan**. It confirms the borrower and lender links, then—where interest is established—checks the applicable rate and the terms governing payment of **that loan’s interest**. There’s no separate authorisation step for this verification. It returns the result with references to the evidence checked. Missing or incorrect required links prevent a pass; if whether interest applies is unclear, report that portion as unresolved rather than skipping it.

### Turn 98 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  assessLoanReadiness:\n    input: Loan\n    preconditions: [loanReadiness]\n    effect: Return a pass, non-pass, or unresolved readiness result with references to the checked hasBorrower and hasLender links and, when interest applies, the hasInterestRate link and the hasInterest and governsPaymentOf path to the governing InterestPaymentTerms; do not change the loan.\n    verification: Confirm the reported result agrees with the inspected party links and, when applicable, the rate link and terms governing the same loan's Interest; report uncertainty about interest applicability as unresolved."
}
```

### Turn 98 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "assessLoanReadiness" has input class Loan, and its precondition loanReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Loan to InterestPaymentTerms. Rewording the text does not create the path it assumes.

### Turn 98 — assistant

I’ve recorded **assess loan readiness** as a Loan-based verification that returns a result and evidence references; it does not change the loan.

The canvas raised a navigation warning: it cannot follow **Loan → Interest ← InterestPaymentTerms** forward from the loan to find the governing terms. I won’t reverse the confirmed “terms govern interest” link or invent a direct loan-to-terms link.

How would the agent look up the **InterestPaymentTerms that govern the Interest linked to this loan**—can it search terms by their `governsPaymentOf` target, or is that lookup not available?

### Turn 99 — user

Yes—if the agent can search interest payment terms by the **interest whose payment they govern**, it can first follow the loan’s link to its interest, then find terms that point to that same interest. That’s a lookup against the existing connection, not a new connection in the opposite direction.

If the canvas cannot make that lookup, it cannot verify the governing terms for loan readiness from the links currently recorded. Report that part as unresolved rather than substituting unrelated terms or adding a direct loan-to-terms link.

### Turn 99 — assistant

The intended lookup is clear: follow **Loan → Interest**, then search InterestPaymentTerms whose `governsPaymentOf` link points to that same Interest. That is a reverse lookup over an existing link, not a new relationship. The canvas still warns that it cannot verify this navigation from the Loan input, so I’m leaving the readiness check’s governing-terms portion flagged rather than claiming the warning is resolved.

For **verify secured-loan support**, should the action take a **Loan**, apply `securedLoanCollateralSupport`, and return a result with the security evidence and the specific `collateralizedBy` link checked—without requiring a security agreement or appraisal?

### Turn 100 — user

Almost. The action should take a **loan established as secured**, rather than an unrestricted loan. It checks whether that secured loan is linked to the correct pledged collateral, then returns the result with the evidence used to establish the loan’s security and the collateral link examined. There’s no separate authorisation step.

A **security agreement or appraisal is not required for this check**. If the loan is known to be guarantee-backed only, the collateral-link check cannot pass; that says nothing about whether the guarantee is valid. If we cannot establish that the loan is secured, report applicability as unresolved.

### Turn 100 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  verifySecuredLoanSupport:\n    input: Loan\n    preconditions: [securedLoanCollateralSupport]\n    effect: Return a collateral-link check result with references to securityClassification or the verified collateralizedBy evidence establishing security and the pledged Collateral link inspected; report unknown applicability as unresolved and do not change the loan.\n    verification: Confirm the inspected collateralizedBy link identifies the correct pledged Collateral for a loan established as secured; a guarantee-only loan without that link does not pass this particular check."
}
```

### Turn 100 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 100 — assistant

I’ve recorded **verify secured-loan support** with **Loan** as its input and “established as secured” as its applicability condition. It checks the correct pledged-collateral link and retains the security and link evidence; it does not require an agreement or appraisal. The earlier readiness-navigation warning remains open.

For **review variable-rate setup**, should the Loan-based action apply `variableRateSetup`, return its result with references to the linked variable rate and the **same loan’s** reset schedule, and verify against those links—without treating the initial-rate event, cap, first-change term, or numeric rate as substitutes?

### Turn 101 — user

Yes. It takes a **loan**, establishes that its linked rate is variable—including floating or managed—and checks that the **same loan** has an interest-rate reset schedule. There’s no separate authorisation step; the intended effect is to confirm whether the variable-rate setup has that scheduling information.

Return the result with references to the rate-kind evidence and reset-schedule link checked. The initial-rate event, cap, first-change term, and numeric rate do **not** substitute for the reset schedule. If the rate kind cannot be established, report the review as unresolved.

### Turn 101 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  reviewVariableRateSetup:\n    input: Loan\n    preconditions: [variableRateSetup]\n    effect: Return the variable-rate setup result with references to the linked InterestRate rateKind and the same loan's hasInterestRateResetSchedule link; do not change the loan.\n    verification: Confirm rateKind is variable, floating, or managed and that this same Loan links to its later InterestRateResetSchedule; if rate kind is unknown report unresolved, and do not substitute the initial event, cap, first-change term, or numericRate."
}
```

### Turn 101 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 101 — assistant

I’ve recorded **review variable-rate setup**. It uses the linked rate kind and the same loan’s reset schedule, retains those references, and treats unknown rate kind as unresolved. The readiness-navigation warning is still open.

For **review payment-record completeness**, should the Loan-based action apply `paymentRecordCompleteness`, return a result with references to the correct **PaymentHistory** and its verified individual **PaymentTransaction** links, and verify that at least one actual transaction belongs to that history—without assessing payment timeliness?

### Turn 102 — user

Yes. It takes a **loan**, checks that the loan links to its correct **payment history**, then that the history links to at least one **individual payment transaction** that belongs there. There’s no separate authorisation step; the effect is to confirm whether actual payment entries are represented.

Return the result with references to the history and transaction links examined. The link checks **are** the verification—there’s no second verification pass. This action does not assess timeliness or whether the borrower is current.

### Turn 102 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  reviewPaymentRecordCompleteness:\n    input: Loan\n    preconditions: [paymentRecordCompleteness]\n    effect: Return payment-record completeness result with references to the inspected hasPaymentHistory and hasIndividualPayments links and the history and individual transactions examined; do not change the loan.\n    verification: Check the loan links to its correct PaymentHistory and that history links to at least one correctly attributed actual PaymentTransaction; the link checks themselves verify the result, without judging timeliness or currentness."
}
```

### Turn 102 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 102 — assistant

I’ve recorded **review payment-record completeness**. The link checks themselves verify the result; the action retains the history and transaction references and makes no judgment about timeliness or whether the borrower is current.

For **review prepayment terms**, should the action take a **Loan**, apply `prepaymentPenaltyTiming`, and return a result with references to the loan’s Principal and the terms governing that same Principal? It would inspect those terms for penalty evidence and, only if a penalty applies, verify that `penaltyPeriodMonths` is recorded. Is that the right scope?

### Turn 103 — user

Yes, that’s the right scope, **provided the agent can find the terms that govern this loan’s principal**. It takes the loan, follows its link to principal, and looks up the principal repayment terms governing that same principal. It then identifies which of those terms cover prepayment and inspects them for evidence that a penalty applies.

If a penalty is established, the check verifies that its period in months is recorded. There’s no separate authorisation step or second verification pass. Return the result with references to the principal, applicable terms, penalty evidence, and period examined. If the governing terms cannot be found or penalty applicability is unclear, report the review as unresolved rather than passing it.

### Turn 103 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "actions:\n  reviewPrepaymentTerms:\n    input: Loan\n    preconditions: [prepaymentPenaltyTiming]\n    effect: Return the prepayment penalty timing review result with references to the loan's hasPrincipal link, PrincipalRepaymentTerms whose governsPaymentOf link targets that same Principal, and the penalty evidence and penaltyPeriodMonths inspected; leave unresolved if governing terms or applicability cannot be established; do not change the loan.\n    verification: Inspect the governing terms for coversPrepayment and evidence that a penalty applies, and only then check penaltyPeriodMonths on those same terms; these evidence checks themselves verify the result."
}
```

### Turn 103 — tool

Applied. Added 1, updated 0 existing item(s).

CONSISTENCY CHECK — 1 new problem(s) from this edit:
  [warning] unreachable-from-action-input — Action "reviewPrepaymentTerms" has input class Loan, and its precondition prepaymentPenaltyTiming refers to PrincipalRepaymentTerms, which is only reachable against the direction of the relationships between them. Add or redirect a relationship so the agent can navigate from Loan to PrincipalRepaymentTerms. Rewording the text does not create the path it assumes.
1 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 103 — assistant

I’ve recorded **review prepayment terms** with the same-loan principal, applicable terms, penalty evidence, and period as its evidence. The canvas now raises a second navigation warning: from a Loan input, it cannot follow **Loan → Principal ← PrincipalRepaymentTerms** forward to find the governing terms. The earlier interest-terms warning also remains open.

Can the agent search **PrincipalRepaymentTerms** by the Principal targeted by `governsPaymentOf`, as a reverse lookup over the existing link, or is that lookup unavailable? I won’t add an unconfirmed direct loan-to-terms link.

### Turn 104 — user

Yes—the intended lookup is to follow the loan’s link to **principal**, then search for principal repayment terms that govern payment of that **same principal**. That uses the existing connection in reverse; it doesn’t add a direct loan-to-terms link.

I can confirm the business lookup, but not that this canvas can perform it. If it cannot, the prepayment review cannot verify which terms apply from a loan input and must remain unresolved. The same limitation remains for finding the interest payment terms in the readiness assessment.

### Turn 104 — assistant

The five verification actions are recorded. You’ve confirmed the business lookup for both governing-term checks: follow the loan to its Interest or Principal, then search for terms whose `governsPaymentOf` link points to that same obligation. **The canvas still flags both lookups as unreachable from a Loan input.** I can’t confirm that it supports those reverse searches, so the readiness and prepayment results must remain unresolved if the governing terms cannot be found. I won’t add direct loan-to-terms links.

Before the model can answer which schedules are **required** for a deal, how does the agent establish that a loan is **amortizing**? We know that, once established, it should check for an amortization schedule and terms governing principal repayment.

### Turn 105 — user

An amortizing loan is one whose repayment structure reduces the debt balance through periodic payments. But we haven’t established a specific **amortizing-loan indicator or lookup** that lets the agent determine that from a loan input.

I wouldn’t use the presence of an amortization schedule alone to decide that the schedule is required—that would make the check circular. The agent needs reliable evidence in the deal’s repayment structure that amortization applies. Once established, it checks for the amortization schedule and terms governing that loan’s principal. If it cannot establish the repayment structure, whether that schedule is required remains unresolved.

### Turn 105 — assistant

I’ll leave the **amortizing-loan test open**. The agent must not infer that amortization applies merely because an amortization schedule exists. If reliable repayment-structure evidence establishes it, the agent checks for that schedule and terms governing the loan’s principal; otherwise, whether the schedule is required remains unresolved.

We’ve covered the specified questions and checks as far as the confirmed paths allow. For **Loan**, are we missing any connected parts, lifecycle events, responsible parties, inputs or outputs, agreements, or measurements that the agent needs for these tasks? Please name only something the agent would need to answer an agreed question or perform an agreed check.

### Turn 106 — user

I don’t see another **loan connection** needed for the questions and five checks we’ve agreed. The remaining issues are evidence and navigation, not missing loan parts:

- We need a reliable way to attribute dated accrued interest to this loan.
- The agent needs to find the terms governing this loan’s interest and principal; the business lookup is clear, but the canvas may not support it.
- To say an amortization schedule is **required**, the agent needs evidence that this loan’s repayment structure is amortizing.

I wouldn’t add a lifecycle event, party, or agreement just to work around those gaps.

### Turn 106 — assistant

No further Loan neighbor is needed. I’ve kept the three gaps you named open rather than adding a workaround concept.

For the other central concepts—**CreditFacility, Collateral, Interest, and Principal**—are we missing any portions, dated measurements, governing terms, agreements, or related actors needed for the agreed questions and checks? “No, those are covered” is a complete answer.

### Turn 107 — user

No, those are covered for the agreed questions and checks. The facility’s amounts and any sub-facilities, the collateral’s dated value and security agreement, and the terms governing interest and principal are accounted for.

The outstanding issues remain the ones we identified: attributing accrued interest, navigating to the governing terms, and establishing when amortization applies. None calls for another connection to these four concepts.

### Turn 107 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 107 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit agreement?
  - id: cq2
    text: Who is the lender for a loan or credit agreement?
  - id: cq3
    text: What is the principal amount of a loan?
  - id: cq4
    text: What is the debt amount of a credit agreement?
  - id: cq5
    text: "What is a facility's credit limit?"
  - id: cq6
    text: What is the amount of credit extended under a facility?
  - id: cq7
    text: What is the available amount under a facility?
  - id: cq8
    text: What initial exchange date is stated in the terms?
  - id: cq9
    text: When does a loan or credit agreement mature?
  - id: cq10
    text: "What interest rate and rate type apply, and which variable-rate features apply?"
  - id: cq11
    text: What day-count convention governs interest calculation?
  - id: cq12
    text: When are interest calculations scheduled?
  - id: cq13
    text: "What do the interest payment terms require, and what due dates appear on the interest payment schedule?"
  - id: cq14
    text: "How much interest is accrued but unpaid, as of what date?"
  - id: cq15
    text: "For a variable rate, what event sets the initial rate, and what schedule covers later resets?"
  - id: cq16
    text: What do the principal repayment terms require?
  - id: cq17
    text: "Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?"
  - id: cq18
    text: "Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?"
  - id: cq19
    text: "If collateral is pledged, what collateral is linked to the loan?"
  - id: cq20
    text: What security agreement grants an interest in the pledged collateral linked to the loan?
  - id: cq21
    text: "Who services the loan and collects principal and interest payments on the lender's behalf?"
  - id: cq22
    text: "For a collateralized loan, what are the collateral's appraised value and as-of date, and what loan-to-value and combined loan-to-value ratios are recorded?"
  - id: cq23
    text: What borrowing capacity has been assessed for this borrower?
  - id: cq24
    text: "If a credit facility is divided, which sub-facilities make up this credit facility?"
  - id: cq25
    text: What are the loan balance and outstanding principal amount?
classes:
  Loan:
    meaning: "Money or credit extended to a borrower, to be repaid under the agreed terms."
    aliases: []
    properties:
      principalAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
      interestRateCap:
        type: number
      firstRateChangeTermMonths:
        type: number
        unit: months
      securityClassification:
        type: text
      loanBalance:
        type: number
  CreditAgreement:
    meaning: "An agreement under which a borrower receives value and generally agrees to repay it by a future date, usually with interest."
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  CreditFacility:
    meaning: A credit agreement that lets the borrower draw funds over time rather than apply for a new loan each time.
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
    meaning: "The party obliged to repay what was borrowed, with interest and applicable fees, under the agreement."
    aliases: []
    properties: {}
  Lender:
    meaning: "The party that extends money or credit to the borrower expecting repayment, usually with interest."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "The agreed requirements for paying interest, including the accrual basis and payment timing."
    aliases: []
    properties:
      initialAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
      compoundingFrequency:
        type: text
  InterestCalculationSchedule:
    meaning: The contract-specific schedule of dates on which interest is calculated.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The contract-specific schedule of dates on which interest is due.
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: The agreed requirements for repaying principal.
    aliases: []
    properties:
      coversPrepayment:
        type: boolean
      penaltyPeriodMonths:
        type: number
        unit: months
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      principalPaymentFrequency:
        type: text
      principalPaymentDay:
        type: text
  LoanPaymentSchedule:
    meaning: The regular or explicitly dated payment schedule associated with a particular loan.
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: The convention used to count days when calculating accrued interest.
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The contract-specific schedule showing when some or all of the principal is due to be repaid.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: The schedule of periodic payments showing how the debt balance changes over time.
    aliases: []
    properties: {}
  InterestRate:
    meaning: The rate used to charge interest on the loan; it may be fixed or variable.
    aliases: []
    properties:
      numericRate:
        type: number
      rateKind:
        type: text
        allowed:
          - fixed
          - variable
          - floating
          - managed
  InitialInterestRateSettingEvent:
    meaning: "The event at which the loan's initial rate is established, distinct from a later reset."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates when a rate reset and the resulting rate are recalculated.
    aliases:
      - rate reset schedule
    properties: {}
  AccruedInterest:
    meaning: "Interest incurred but not yet paid, stated as an amount as of a particular date."
    aliases: []
    properties:
      unpaidAmount:
        type: number
      asOfDate:
        type: date
  Collateral:
    meaning: An asset pledged as security for repayment of an obligation.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning that asset.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party that collects principal and interest payments on the lender's behalf."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The record of payments actually made toward the borrower's repayment obligation."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An actual payment toward the debt, of principal, interest, fees, or another related amount, that forms part of the payment history."
    aliases:
      - individual payment
    properties: {}
  SubFacility:
    meaning: "A portion of a credit facility made available for a particular purpose, sometimes under its own schedule."
    aliases: []
    properties: {}
  CollateralAppraisal:
    meaning: "The collateral's appraised value as of a specified date."
    aliases:
      - dated collateral value
      - collateral value as of a date
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  LoanToValueRatio:
    meaning: "This loan's principal as a percentage of the appraised value of the asset securing it."
    aliases:
      - LTV
    properties:
      ratioValue:
        type: number
  CombinedLoanToValueRatio:
    meaning: Total debt secured by the asset or assets as a percentage of their appraised value.
    aliases: []
    properties:
      ratioValue:
        type: number
  Interest:
    meaning: "The cost the borrower pays for using the credit, expressed as a rate over time and distinct from principal."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of the debt that must be repaid, separate from interest."
    aliases: []
    properties:
      outstandingPrincipalAmount:
        type: number
  BorrowingCapacityAssessment:
    meaning: "The lender's assessment, at a point in time, of the upper amount the borrower can repay when due; it is not the facility's available amount."
    aliases:
      - borrowing capacity
    properties:
      assessedCapacityAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The party obliged to repay under this loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The party extending credit under this loan.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: The party obliged to repay under this credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: The party extending credit under this credit agreement.
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: The party allowed to draw funds under this credit facility.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: The party providing this credit facility.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: A credit facility has sub-facilities that form portions of it when it is divided.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: InterestRate
    meaning: The rate used to charge interest on this loan when it bears interest.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: The associated schedule specifying dates when interest is calculated for this loan
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: The associated schedule specifying dates when interest is due for this loan
    aliases: []
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: These terms have the day-count convention used as their accrual basis.
    aliases: []
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: The loan has interest owed for using the credit.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: These terms govern payment of the interest owed under the loan.
    aliases: []
  - name: hasInitialInterestRateSettingEvent
    from: Loan
    to: InitialInterestRateSettingEvent
    meaning: "The event establishing this loan's initial interest rate when applicable"
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: The schedule associated with this loan for later rate resets when applicable.
    aliases:
      - has a reset schedule
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: The loan has an associated overall payment schedule when applicable and on file.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: The loan has a schedule of principal due dates when applicable and on file.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: The loan has an applicable schedule of periodic payments and resulting balance changes when on file.
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: The loan has a principal repayment obligation
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "These terms govern payment of the loan's principal."
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "The loan is serviced by the party collecting principal and interest payments on its lender's behalf."
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by this pledged asset when collateral backs it; this does not apply to a guarantee-backed loan without pledged collateral.
    aliases:
      - backed by pledged collateral
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement secures this pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasDatedAppraisedValue
    from: Collateral
    to: CollateralAppraisal
    meaning: The collateral has this recorded appraised value together with its as-of date when one is available.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: The loan has a history of payments actually made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: PaymentHistory
    to: PaymentTransaction
    meaning: The history has individual actual payment transactions making it up
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded combined loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasBorrowingCapacityAssessment
    from: Borrower
    to: BorrowingCapacityAssessment
    meaning: The borrower has an assessment of its capacity to repay when due.
    aliases: []
rules:
  loanReadiness:
    conditions:
      - The loan has a confirmed hasBorrower link to its borrower and a confirmed hasLender link to its lender.
      - "If the loan has a confirmed hasInterest link or hasInterestRate link, establish its applicable hasInterestRate link and the InterestPaymentTerms whose governsPaymentOf link reaches the Interest linked by this loan's hasInterest link."
      - "If whether interest applies cannot be established, leave the interest portion of readiness unresolved; missing interest or rate links do not prove an interest-free loan."
  securedLoanCollateralSupport:
    conditions:
      - "Establish that the loan is secured from its securityClassification when supported by the deal record, or from a verified collateralizedBy link to pledged Collateral; missing classification does not mean unsecured."
      - "For a loan established as secured, the collateral-link check passes only if its collateralizedBy link to the correct pledged Collateral is verified."
      - A guarantee-only secured loan without a pledged Collateral link does not pass this collateral-link check; this does not invalidate its guarantee or imply it is unsecured.
      - "If secured status cannot be established, leave applicability unresolved rather than treating the loan as unsecured."
  variableRateSetup:
    conditions:
      - "The loan's hasInterestRate link identifies an InterestRate with rateKind variable, floating, or managed."
      - The same loan has a confirmed hasInterestRateResetSchedule link to its later InterestRateResetSchedule; its initial interest-rate-setting event is not a substitute.
      - "If rateKind is unknown, applicability and the result remain unresolved rather than assuming a fixed rate."
  paymentRecordCompleteness:
    conditions:
      - "Verify the loan's hasPaymentHistory link points to the correct PaymentHistory for that loan."
      - Verify that same PaymentHistory has at least one correctly attributed PaymentTransaction through hasIndividualPayments.
      - A missing or incorrectly attributed history or individual payment does not pass; do not assess timeliness or whether the borrower is current.
  prepaymentPenaltyTiming:
    conditions:
      - "Identify the Principal linked by this loan's hasPrincipal and PrincipalRepaymentTerms whose governsPaymentOf link reaches that same Principal."
      - Confirm those governing PrincipalRepaymentTerms have coversPrepayment true.
      - Inspect those terms for reliable evidence that a penalty applies; coversPrepayment alone does not establish a penalty.
      - "Only when penalty applicability is established, confirm penaltyPeriodMonths is recorded on those same terms; missing is not zero or proof of no penalty."
      - "If penalty applicability cannot be established, leave the review unresolved."
actions:
  assessLoanReadiness:
    input: Loan
    preconditions:
      - loanReadiness
    effect: "Return a pass, non-pass, or unresolved readiness result with references to the checked hasBorrower and hasLender links and, when interest applies, the hasInterestRate link and the hasInterest and governsPaymentOf path to the governing InterestPaymentTerms; do not change the loan."
    verification: "Confirm the reported result agrees with the inspected party links and, when applicable, the rate link and terms governing the same loan's Interest; report uncertainty about interest applicability as unresolved."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - securedLoanCollateralSupport
    effect: Return a collateral-link check result with references to securityClassification or the verified collateralizedBy evidence establishing security and the pledged Collateral link inspected; report unknown applicability as unresolved and do not change the loan.
    verification: Confirm the inspected collateralizedBy link identifies the correct pledged Collateral for a loan established as secured; a guarantee-only loan without that link does not pass this particular check.
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetup
    effect: "Return the variable-rate setup result with references to the linked InterestRate rateKind and the same loan's hasInterestRateResetSchedule link; do not change the loan."
    verification: "Confirm rateKind is variable, floating, or managed and that this same Loan links to its later InterestRateResetSchedule; if rate kind is unknown report unresolved, and do not substitute the initial event, cap, first-change term, or numericRate."
  reviewPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompleteness
    effect: Return payment-record completeness result with references to the inspected hasPaymentHistory and hasIndividualPayments links and the history and individual transactions examined; do not change the loan.
    verification: "Check the loan links to its correct PaymentHistory and that history links to at least one correctly attributed actual PaymentTransaction; the link checks themselves verify the result, without judging timeliness or currentness."
  reviewPrepaymentTerms:
    input: Loan
    preconditions:
      - prepaymentPenaltyTiming
    effect: "Return the prepayment penalty timing review result with references to the loan's hasPrincipal link, PrincipalRepaymentTerms whose governsPaymentOf link targets that same Principal, and the penalty evidence and penaltyPeriodMonths inspected; leave unresolved if governing terms or applicability cannot be established; do not change the loan."
    verification: "Inspect the governing terms for coversPrepayment and evidence that a penalty applies, and only then check penaltyPeriodMonths on those same terms; these evidence checks themselves verify the result."


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "assessLoanReadiness" has input class Loan, and its precondition loanReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewPrepaymentTerms" has input class Loan, and its precondition prepaymentPenaltyTiming refers to PrincipalRepaymentTerms, which is only reachable against the direction of the relationships between them.

### Turn 107 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": true
}
```

The expansion pass found no further concepts to add. I’ve now reread the **25 questions persisted on the canvas**. Here is the competency check against the current model:

- **1–2, parties:** Loan or CreditAgreement → Borrower/Lender answers each question.
- **3–7, amounts:** Loan.principalAmount, CreditAgreement.debtAmount, and the facility’s three separate amount properties answer these questions when the values are available.
- **8–9, dates:** initialExchangeDate and maturityDate on Loan or CreditAgreement answer the stated-term questions; the exchange date is not disbursement evidence.
- **10, rate:** Loan → InterestRate supplies numericRate and rateKind; the loan supplies an applicable cap and first-change term. Floating and managed count as variable.
- **11–13, interest terms and schedules:** InterestPaymentTerms → DayCountConvention supplies the basis; the loan’s calculation and payment schedules supply their dates when their contents are available. Finding terms that govern *this loan’s* Interest requires the confirmed reverse lookup, which the canvas warns it cannot navigate from a Loan input.
- **14, accrued interest:** AccruedInterest holds amount and as-of date, but has **no confirmed loan-attribution path**. The loan-specific answer is uncovered.
- **15, initial rate and resets:** The loan has separate links to its initial-setting event and later reset schedule.
- **16–17, principal terms and schedules:** Loan → Principal identifies the obligation; governing terms require the same reverse lookup flagged by the canvas. The loan’s schedule links show what is on file. Whether an amortization schedule is *required* remains unresolved without evidence of an amortizing repayment structure.
- **18–20, security:** securityClassification distinguishes known forms without treating a missing value as unsecured; Loan → Collateral identifies a pledged asset, and SecurityAgreement → Collateral identifies the agreement granting an interest in it. No guarantee-support record or check has been established.
- **21, servicing:** Loan → Servicer and Loan → Lender identify both parties for this loan.
- **22, measurements:** Collateral → CollateralAppraisal supplies value and date; the two conditional loan-to-ratio links supply separately recorded ratios when available.
- **23–25, capacity, sub-facilities, balances:** Borrower → BorrowingCapacityAssessment supplies assessedCapacityAmount; CreditFacility → SubFacility identifies its portions when divided; Loan.loanBalance and Loan → Principal.outstandingPrincipalAmount supply the two balances.

The **five actions** also have inputs, named rules, results, evidence references, and verification steps: readiness checks parties and applicable interest terms; secured support checks the pledged-asset link; variable-rate setup checks rate kind and the same loan’s reset schedule; payment completeness checks the correct history and an individual transaction; prepayment review checks governing terms, penalty evidence, then its period. **Readiness and prepayment remain limited by the two governing-terms navigation warnings**; neither may report a pass when it cannot find the applicable terms.

I’ll run the final canvas check now.

### Turn 107 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit agreement?
  - id: cq2
    text: Who is the lender for a loan or credit agreement?
  - id: cq3
    text: What is the principal amount of a loan?
  - id: cq4
    text: What is the debt amount of a credit agreement?
  - id: cq5
    text: "What is a facility's credit limit?"
  - id: cq6
    text: What is the amount of credit extended under a facility?
  - id: cq7
    text: What is the available amount under a facility?
  - id: cq8
    text: What initial exchange date is stated in the terms?
  - id: cq9
    text: When does a loan or credit agreement mature?
  - id: cq10
    text: "What interest rate and rate type apply, and which variable-rate features apply?"
  - id: cq11
    text: What day-count convention governs interest calculation?
  - id: cq12
    text: When are interest calculations scheduled?
  - id: cq13
    text: "What do the interest payment terms require, and what due dates appear on the interest payment schedule?"
  - id: cq14
    text: "How much interest is accrued but unpaid, as of what date?"
  - id: cq15
    text: "For a variable rate, what event sets the initial rate, and what schedule covers later resets?"
  - id: cq16
    text: What do the principal repayment terms require?
  - id: cq17
    text: "Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?"
  - id: cq18
    text: "Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?"
  - id: cq19
    text: "If collateral is pledged, what collateral is linked to the loan?"
  - id: cq20
    text: What security agreement grants an interest in the pledged collateral linked to the loan?
  - id: cq21
    text: "Who services the loan and collects principal and interest payments on the lender's behalf?"
  - id: cq22
    text: "For a collateralized loan, what are the collateral's appraised value and as-of date, and what loan-to-value and combined loan-to-value ratios are recorded?"
  - id: cq23
    text: What borrowing capacity has been assessed for this borrower?
  - id: cq24
    text: "If a credit facility is divided, which sub-facilities make up this credit facility?"
  - id: cq25
    text: What are the loan balance and outstanding principal amount?
classes:
  Loan:
    meaning: "Money or credit extended to a borrower, to be repaid under the agreed terms."
    aliases: []
    properties:
      principalAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
      interestRateCap:
        type: number
      firstRateChangeTermMonths:
        type: number
        unit: months
      securityClassification:
        type: text
      loanBalance:
        type: number
  CreditAgreement:
    meaning: "An agreement under which a borrower receives value and generally agrees to repay it by a future date, usually with interest."
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  CreditFacility:
    meaning: A credit agreement that lets the borrower draw funds over time rather than apply for a new loan each time.
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
    meaning: "The party obliged to repay what was borrowed, with interest and applicable fees, under the agreement."
    aliases: []
    properties: {}
  Lender:
    meaning: "The party that extends money or credit to the borrower expecting repayment, usually with interest."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "The agreed requirements for paying interest, including the accrual basis and payment timing."
    aliases: []
    properties:
      initialAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
      compoundingFrequency:
        type: text
  InterestCalculationSchedule:
    meaning: The contract-specific schedule of dates on which interest is calculated.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The contract-specific schedule of dates on which interest is due.
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: The agreed requirements for repaying principal.
    aliases: []
    properties:
      coversPrepayment:
        type: boolean
      penaltyPeriodMonths:
        type: number
        unit: months
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      principalPaymentFrequency:
        type: text
      principalPaymentDay:
        type: text
  LoanPaymentSchedule:
    meaning: The regular or explicitly dated payment schedule associated with a particular loan.
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: The convention used to count days when calculating accrued interest.
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The contract-specific schedule showing when some or all of the principal is due to be repaid.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: The schedule of periodic payments showing how the debt balance changes over time.
    aliases: []
    properties: {}
  InterestRate:
    meaning: The rate used to charge interest on the loan; it may be fixed or variable.
    aliases: []
    properties:
      numericRate:
        type: number
      rateKind:
        type: text
        allowed:
          - fixed
          - variable
          - floating
          - managed
  InitialInterestRateSettingEvent:
    meaning: "The event at which the loan's initial rate is established, distinct from a later reset."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates when a rate reset and the resulting rate are recalculated.
    aliases:
      - rate reset schedule
    properties: {}
  AccruedInterest:
    meaning: "Interest incurred but not yet paid, stated as an amount as of a particular date."
    aliases: []
    properties:
      unpaidAmount:
        type: number
      asOfDate:
        type: date
  Collateral:
    meaning: An asset pledged as security for repayment of an obligation.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning that asset.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party that collects principal and interest payments on the lender's behalf."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The record of payments actually made toward the borrower's repayment obligation."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An actual payment toward the debt, of principal, interest, fees, or another related amount, that forms part of the payment history."
    aliases:
      - individual payment
    properties: {}
  SubFacility:
    meaning: "A portion of a credit facility made available for a particular purpose, sometimes under its own schedule."
    aliases: []
    properties: {}
  CollateralAppraisal:
    meaning: "The collateral's appraised value as of a specified date."
    aliases:
      - dated collateral value
      - collateral value as of a date
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  LoanToValueRatio:
    meaning: "This loan's principal as a percentage of the appraised value of the asset securing it."
    aliases:
      - LTV
    properties:
      ratioValue:
        type: number
  CombinedLoanToValueRatio:
    meaning: Total debt secured by the asset or assets as a percentage of their appraised value.
    aliases: []
    properties:
      ratioValue:
        type: number
  Interest:
    meaning: "The cost the borrower pays for using the credit, expressed as a rate over time and distinct from principal."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of the debt that must be repaid, separate from interest."
    aliases: []
    properties:
      outstandingPrincipalAmount:
        type: number
  BorrowingCapacityAssessment:
    meaning: "The lender's assessment, at a point in time, of the upper amount the borrower can repay when due; it is not the facility's available amount."
    aliases:
      - borrowing capacity
    properties:
      assessedCapacityAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The party obliged to repay under this loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The party extending credit under this loan.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: The party obliged to repay under this credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: The party extending credit under this credit agreement.
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: The party allowed to draw funds under this credit facility.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: The party providing this credit facility.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: A credit facility has sub-facilities that form portions of it when it is divided.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: InterestRate
    meaning: The rate used to charge interest on this loan when it bears interest.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: The associated schedule specifying dates when interest is calculated for this loan
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: The associated schedule specifying dates when interest is due for this loan
    aliases: []
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: These terms have the day-count convention used as their accrual basis.
    aliases: []
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: The loan has interest owed for using the credit.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: These terms govern payment of the interest owed under the loan.
    aliases: []
  - name: hasInitialInterestRateSettingEvent
    from: Loan
    to: InitialInterestRateSettingEvent
    meaning: "The event establishing this loan's initial interest rate when applicable"
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: The schedule associated with this loan for later rate resets when applicable.
    aliases:
      - has a reset schedule
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: The loan has an associated overall payment schedule when applicable and on file.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: The loan has a schedule of principal due dates when applicable and on file.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: The loan has an applicable schedule of periodic payments and resulting balance changes when on file.
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: The loan has a principal repayment obligation
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "These terms govern payment of the loan's principal."
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "The loan is serviced by the party collecting principal and interest payments on its lender's behalf."
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by this pledged asset when collateral backs it; this does not apply to a guarantee-backed loan without pledged collateral.
    aliases:
      - backed by pledged collateral
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement secures this pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasDatedAppraisedValue
    from: Collateral
    to: CollateralAppraisal
    meaning: The collateral has this recorded appraised value together with its as-of date when one is available.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: The loan has a history of payments actually made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: PaymentHistory
    to: PaymentTransaction
    meaning: The history has individual actual payment transactions making it up
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded combined loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasBorrowingCapacityAssessment
    from: Borrower
    to: BorrowingCapacityAssessment
    meaning: The borrower has an assessment of its capacity to repay when due.
    aliases: []
rules:
  loanReadiness:
    conditions:
      - The loan has a confirmed hasBorrower link to its borrower and a confirmed hasLender link to its lender.
      - "If the loan has a confirmed hasInterest link or hasInterestRate link, establish its applicable hasInterestRate link and the InterestPaymentTerms whose governsPaymentOf link reaches the Interest linked by this loan's hasInterest link."
      - "If whether interest applies cannot be established, leave the interest portion of readiness unresolved; missing interest or rate links do not prove an interest-free loan."
  securedLoanCollateralSupport:
    conditions:
      - "Establish that the loan is secured from its securityClassification when supported by the deal record, or from a verified collateralizedBy link to pledged Collateral; missing classification does not mean unsecured."
      - "For a loan established as secured, the collateral-link check passes only if its collateralizedBy link to the correct pledged Collateral is verified."
      - A guarantee-only secured loan without a pledged Collateral link does not pass this collateral-link check; this does not invalidate its guarantee or imply it is unsecured.
      - "If secured status cannot be established, leave applicability unresolved rather than treating the loan as unsecured."
  variableRateSetup:
    conditions:
      - "The loan's hasInterestRate link identifies an InterestRate with rateKind variable, floating, or managed."
      - The same loan has a confirmed hasInterestRateResetSchedule link to its later InterestRateResetSchedule; its initial interest-rate-setting event is not a substitute.
      - "If rateKind is unknown, applicability and the result remain unresolved rather than assuming a fixed rate."
  paymentRecordCompleteness:
    conditions:
      - "Verify the loan's hasPaymentHistory link points to the correct PaymentHistory for that loan."
      - Verify that same PaymentHistory has at least one correctly attributed PaymentTransaction through hasIndividualPayments.
      - A missing or incorrectly attributed history or individual payment does not pass; do not assess timeliness or whether the borrower is current.
  prepaymentPenaltyTiming:
    conditions:
      - "Identify the Principal linked by this loan's hasPrincipal and PrincipalRepaymentTerms whose governsPaymentOf link reaches that same Principal."
      - Confirm those governing PrincipalRepaymentTerms have coversPrepayment true.
      - Inspect those terms for reliable evidence that a penalty applies; coversPrepayment alone does not establish a penalty.
      - "Only when penalty applicability is established, confirm penaltyPeriodMonths is recorded on those same terms; missing is not zero or proof of no penalty."
      - "If penalty applicability cannot be established, leave the review unresolved."
actions:
  assessLoanReadiness:
    input: Loan
    preconditions:
      - loanReadiness
    effect: "Return a pass, non-pass, or unresolved readiness result with references to the checked hasBorrower and hasLender links and, when interest applies, the hasInterestRate link and the hasInterest and governsPaymentOf path to the governing InterestPaymentTerms; do not change the loan."
    verification: "Confirm the reported result agrees with the inspected party links and, when applicable, the rate link and terms governing the same loan's Interest; report uncertainty about interest applicability as unresolved."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - securedLoanCollateralSupport
    effect: Return a collateral-link check result with references to securityClassification or the verified collateralizedBy evidence establishing security and the pledged Collateral link inspected; report unknown applicability as unresolved and do not change the loan.
    verification: Confirm the inspected collateralizedBy link identifies the correct pledged Collateral for a loan established as secured; a guarantee-only loan without that link does not pass this particular check.
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetup
    effect: "Return the variable-rate setup result with references to the linked InterestRate rateKind and the same loan's hasInterestRateResetSchedule link; do not change the loan."
    verification: "Confirm rateKind is variable, floating, or managed and that this same Loan links to its later InterestRateResetSchedule; if rate kind is unknown report unresolved, and do not substitute the initial event, cap, first-change term, or numericRate."
  reviewPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompleteness
    effect: Return payment-record completeness result with references to the inspected hasPaymentHistory and hasIndividualPayments links and the history and individual transactions examined; do not change the loan.
    verification: "Check the loan links to its correct PaymentHistory and that history links to at least one correctly attributed actual PaymentTransaction; the link checks themselves verify the result, without judging timeliness or currentness."
  reviewPrepaymentTerms:
    input: Loan
    preconditions:
      - prepaymentPenaltyTiming
    effect: "Return the prepayment penalty timing review result with references to the loan's hasPrincipal link, PrincipalRepaymentTerms whose governsPaymentOf link targets that same Principal, and the penalty evidence and penaltyPeriodMonths inspected; leave unresolved if governing terms or applicability cannot be established; do not change the loan."
    verification: "Inspect the governing terms for coversPrepayment and evidence that a penalty applies, and only then check penaltyPeriodMonths on those same terms; these evidence checks themselves verify the result."


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "assessLoanReadiness" has input class Loan, and its precondition loanReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewPrepaymentTerms" has input class Loan, and its precondition prepaymentPenaltyTiming refers to PrincipalRepaymentTerms, which is only reachable against the direction of the relationships between them.

# SECOND-OPINION MODEL CHECK — no additional observations.

### Turn 107 — assistant

The final canvas check found no missing meanings or isolated classes **except AccruedInterest**, which has no confirmed relationship. It also retained two navigation warnings: from a Loan input, the canvas cannot follow the recorded links forward to find the terms governing its Interest or Principal. Your business lookup uses a reverse search, but we have not established that the canvas supports it. An automated second opinion reported **no additional observations**.

The model is therefore **known-incomplete** in four respects:

1. Dated accrued interest cannot yet be attributed to a particular loan.
2. Loan readiness cannot confirm governing interest terms unless the reverse lookup is available.
3. Prepayment review cannot confirm governing principal terms unless the reverse lookup is available.
4. The agent cannot decide whether an amortization schedule is *required* without evidence that the loan’s repayment structure is amortizing.

I won’t add links to make the warnings disappear when you have not confirmed those facts. To address the fourth gap: **can the agent determine from the PrincipalRepaymentTerms governing this loan that periodic payments reduce its debt balance, or is the source of that evidence not yet specified?**

### Turn 108 — user

The source of that evidence is **not yet specified**. Principal repayment terms tell us when principal is payable, but the timing fields we’ve identified do not establish that periodic payments reduce the debt balance.

If the governing deal terms provide reliable repayment-structure evidence, the agent can use it to determine whether the loan is amortizing. We haven’t identified a particular field or lookup for that evidence, so until it’s available, the agent should leave **whether an amortization schedule is required** unresolved.

### Turn 108 — assistant

Understood. The principal-repayment timing fields do **not** establish that a loan is amortizing, and no source for repayment-structure evidence has been specified. I won’t add an indicator or infer the requirement from an amortization schedule already being on file.

The canvas remains **known-incomplete** on four items:

1. No confirmed link attributes dated accrued interest to a particular loan.
2. The canvas flags the lookup for interest terms governing a loan’s Interest as unreachable from a Loan input.
3. It flags the equivalent lookup for principal terms governing a loan’s Principal.
4. No specified evidence or lookup establishes when a loan’s repayment structure is amortizing, so whether its amortization schedule is required remains unresolved.

The business meaning of the two governing-terms lookups is confirmed; their canvas navigation is not. The automated second opinion found no additional issues. None of these open items will be treated as a zero amount, an absent obligation, or a passed check.

### Turn 109 — user

Before we close, one more systematic pass, to catch what we have not talked about yet.

Call get_graph_state first and treat it as the source of truth for what is already on the canvas. Then go through every class on the canvas, three to five classes per question, and ask me, for each one, what exists around it in our work: its subordinate parts or components; its states or lifecycle events; the actors or parties responsible for it; its inputs and outputs; related documents or agreements; measurements or characteristic values it carries; earlier or later stages of a workflow it belongs to; more specific or sibling kinds of the same thing; and which of the properties already confirmed on a sibling class also apply to it. Skip the categories that plainly do not fit a class.

Ask these as open questions about what exists, not about what the agent needs: do not limit a question to what the recorded competency questions or actions require, and do not ask me to mention only what is needed. Only once I have answered, check each thing I named against the competency questions and actions, exactly as you would any other candidate, and add only what passes; nothing is added only because it was mentioned. Keep a running list of the candidates and close each one as added, declined (with the reason) or left open; none may silently disappear.

When every class in this pass has been asked about and every candidate is closed, end that message with one line in exactly this form, and ask nothing further in it:
COVERAGE LEDGER: surfaced=<number>; added=<number>; declined=<number>; open=<number>

### Turn 109 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 109 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit agreement?
  - id: cq2
    text: Who is the lender for a loan or credit agreement?
  - id: cq3
    text: What is the principal amount of a loan?
  - id: cq4
    text: What is the debt amount of a credit agreement?
  - id: cq5
    text: "What is a facility's credit limit?"
  - id: cq6
    text: What is the amount of credit extended under a facility?
  - id: cq7
    text: What is the available amount under a facility?
  - id: cq8
    text: What initial exchange date is stated in the terms?
  - id: cq9
    text: When does a loan or credit agreement mature?
  - id: cq10
    text: "What interest rate and rate type apply, and which variable-rate features apply?"
  - id: cq11
    text: What day-count convention governs interest calculation?
  - id: cq12
    text: When are interest calculations scheduled?
  - id: cq13
    text: "What do the interest payment terms require, and what due dates appear on the interest payment schedule?"
  - id: cq14
    text: "How much interest is accrued but unpaid, as of what date?"
  - id: cq15
    text: "For a variable rate, what event sets the initial rate, and what schedule covers later resets?"
  - id: cq16
    text: What do the principal repayment terms require?
  - id: cq17
    text: "Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?"
  - id: cq18
    text: "Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?"
  - id: cq19
    text: "If collateral is pledged, what collateral is linked to the loan?"
  - id: cq20
    text: What security agreement grants an interest in the pledged collateral linked to the loan?
  - id: cq21
    text: "Who services the loan and collects principal and interest payments on the lender's behalf?"
  - id: cq22
    text: "For a collateralized loan, what are the collateral's appraised value and as-of date, and what loan-to-value and combined loan-to-value ratios are recorded?"
  - id: cq23
    text: What borrowing capacity has been assessed for this borrower?
  - id: cq24
    text: "If a credit facility is divided, which sub-facilities make up this credit facility?"
  - id: cq25
    text: What are the loan balance and outstanding principal amount?
classes:
  Loan:
    meaning: "Money or credit extended to a borrower, to be repaid under the agreed terms."
    aliases: []
    properties:
      principalAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
      interestRateCap:
        type: number
      firstRateChangeTermMonths:
        type: number
        unit: months
      securityClassification:
        type: text
      loanBalance:
        type: number
  CreditAgreement:
    meaning: "An agreement under which a borrower receives value and generally agrees to repay it by a future date, usually with interest."
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  CreditFacility:
    meaning: A credit agreement that lets the borrower draw funds over time rather than apply for a new loan each time.
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
    meaning: "The party obliged to repay what was borrowed, with interest and applicable fees, under the agreement."
    aliases: []
    properties: {}
  Lender:
    meaning: "The party that extends money or credit to the borrower expecting repayment, usually with interest."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "The agreed requirements for paying interest, including the accrual basis and payment timing."
    aliases: []
    properties:
      initialAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
      compoundingFrequency:
        type: text
  InterestCalculationSchedule:
    meaning: The contract-specific schedule of dates on which interest is calculated.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The contract-specific schedule of dates on which interest is due.
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: The agreed requirements for repaying principal.
    aliases: []
    properties:
      coversPrepayment:
        type: boolean
      penaltyPeriodMonths:
        type: number
        unit: months
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      principalPaymentFrequency:
        type: text
      principalPaymentDay:
        type: text
  LoanPaymentSchedule:
    meaning: The regular or explicitly dated payment schedule associated with a particular loan.
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: The convention used to count days when calculating accrued interest.
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The contract-specific schedule showing when some or all of the principal is due to be repaid.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: The schedule of periodic payments showing how the debt balance changes over time.
    aliases: []
    properties: {}
  InterestRate:
    meaning: The rate used to charge interest on the loan; it may be fixed or variable.
    aliases: []
    properties:
      numericRate:
        type: number
      rateKind:
        type: text
        allowed:
          - fixed
          - variable
          - floating
          - managed
  InitialInterestRateSettingEvent:
    meaning: "The event at which the loan's initial rate is established, distinct from a later reset."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates when a rate reset and the resulting rate are recalculated.
    aliases:
      - rate reset schedule
    properties: {}
  AccruedInterest:
    meaning: "Interest incurred but not yet paid, stated as an amount as of a particular date."
    aliases: []
    properties:
      unpaidAmount:
        type: number
      asOfDate:
        type: date
  Collateral:
    meaning: An asset pledged as security for repayment of an obligation.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning that asset.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party that collects principal and interest payments on the lender's behalf."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The record of payments actually made toward the borrower's repayment obligation."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An actual payment toward the debt, of principal, interest, fees, or another related amount, that forms part of the payment history."
    aliases:
      - individual payment
    properties: {}
  SubFacility:
    meaning: "A portion of a credit facility made available for a particular purpose, sometimes under its own schedule."
    aliases: []
    properties: {}
  CollateralAppraisal:
    meaning: "The collateral's appraised value as of a specified date."
    aliases:
      - dated collateral value
      - collateral value as of a date
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  LoanToValueRatio:
    meaning: "This loan's principal as a percentage of the appraised value of the asset securing it."
    aliases:
      - LTV
    properties:
      ratioValue:
        type: number
  CombinedLoanToValueRatio:
    meaning: Total debt secured by the asset or assets as a percentage of their appraised value.
    aliases: []
    properties:
      ratioValue:
        type: number
  Interest:
    meaning: "The cost the borrower pays for using the credit, expressed as a rate over time and distinct from principal."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of the debt that must be repaid, separate from interest."
    aliases: []
    properties:
      outstandingPrincipalAmount:
        type: number
  BorrowingCapacityAssessment:
    meaning: "The lender's assessment, at a point in time, of the upper amount the borrower can repay when due; it is not the facility's available amount."
    aliases:
      - borrowing capacity
    properties:
      assessedCapacityAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The party obliged to repay under this loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The party extending credit under this loan.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: The party obliged to repay under this credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: The party extending credit under this credit agreement.
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: The party allowed to draw funds under this credit facility.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: The party providing this credit facility.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: A credit facility has sub-facilities that form portions of it when it is divided.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: InterestRate
    meaning: The rate used to charge interest on this loan when it bears interest.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: The associated schedule specifying dates when interest is calculated for this loan
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: The associated schedule specifying dates when interest is due for this loan
    aliases: []
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: These terms have the day-count convention used as their accrual basis.
    aliases: []
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: The loan has interest owed for using the credit.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: These terms govern payment of the interest owed under the loan.
    aliases: []
  - name: hasInitialInterestRateSettingEvent
    from: Loan
    to: InitialInterestRateSettingEvent
    meaning: "The event establishing this loan's initial interest rate when applicable"
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: The schedule associated with this loan for later rate resets when applicable.
    aliases:
      - has a reset schedule
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: The loan has an associated overall payment schedule when applicable and on file.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: The loan has a schedule of principal due dates when applicable and on file.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: The loan has an applicable schedule of periodic payments and resulting balance changes when on file.
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: The loan has a principal repayment obligation
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "These terms govern payment of the loan's principal."
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "The loan is serviced by the party collecting principal and interest payments on its lender's behalf."
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by this pledged asset when collateral backs it; this does not apply to a guarantee-backed loan without pledged collateral.
    aliases:
      - backed by pledged collateral
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement secures this pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasDatedAppraisedValue
    from: Collateral
    to: CollateralAppraisal
    meaning: The collateral has this recorded appraised value together with its as-of date when one is available.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: The loan has a history of payments actually made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: PaymentHistory
    to: PaymentTransaction
    meaning: The history has individual actual payment transactions making it up
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded combined loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasBorrowingCapacityAssessment
    from: Borrower
    to: BorrowingCapacityAssessment
    meaning: The borrower has an assessment of its capacity to repay when due.
    aliases: []
rules:
  loanReadiness:
    conditions:
      - The loan has a confirmed hasBorrower link to its borrower and a confirmed hasLender link to its lender.
      - "If the loan has a confirmed hasInterest link or hasInterestRate link, establish its applicable hasInterestRate link and the InterestPaymentTerms whose governsPaymentOf link reaches the Interest linked by this loan's hasInterest link."
      - "If whether interest applies cannot be established, leave the interest portion of readiness unresolved; missing interest or rate links do not prove an interest-free loan."
  securedLoanCollateralSupport:
    conditions:
      - "Establish that the loan is secured from its securityClassification when supported by the deal record, or from a verified collateralizedBy link to pledged Collateral; missing classification does not mean unsecured."
      - "For a loan established as secured, the collateral-link check passes only if its collateralizedBy link to the correct pledged Collateral is verified."
      - A guarantee-only secured loan without a pledged Collateral link does not pass this collateral-link check; this does not invalidate its guarantee or imply it is unsecured.
      - "If secured status cannot be established, leave applicability unresolved rather than treating the loan as unsecured."
  variableRateSetup:
    conditions:
      - "The loan's hasInterestRate link identifies an InterestRate with rateKind variable, floating, or managed."
      - The same loan has a confirmed hasInterestRateResetSchedule link to its later InterestRateResetSchedule; its initial interest-rate-setting event is not a substitute.
      - "If rateKind is unknown, applicability and the result remain unresolved rather than assuming a fixed rate."
  paymentRecordCompleteness:
    conditions:
      - "Verify the loan's hasPaymentHistory link points to the correct PaymentHistory for that loan."
      - Verify that same PaymentHistory has at least one correctly attributed PaymentTransaction through hasIndividualPayments.
      - A missing or incorrectly attributed history or individual payment does not pass; do not assess timeliness or whether the borrower is current.
  prepaymentPenaltyTiming:
    conditions:
      - "Identify the Principal linked by this loan's hasPrincipal and PrincipalRepaymentTerms whose governsPaymentOf link reaches that same Principal."
      - Confirm those governing PrincipalRepaymentTerms have coversPrepayment true.
      - Inspect those terms for reliable evidence that a penalty applies; coversPrepayment alone does not establish a penalty.
      - "Only when penalty applicability is established, confirm penaltyPeriodMonths is recorded on those same terms; missing is not zero or proof of no penalty."
      - "If penalty applicability cannot be established, leave the review unresolved."
actions:
  assessLoanReadiness:
    input: Loan
    preconditions:
      - loanReadiness
    effect: "Return a pass, non-pass, or unresolved readiness result with references to the checked hasBorrower and hasLender links and, when interest applies, the hasInterestRate link and the hasInterest and governsPaymentOf path to the governing InterestPaymentTerms; do not change the loan."
    verification: "Confirm the reported result agrees with the inspected party links and, when applicable, the rate link and terms governing the same loan's Interest; report uncertainty about interest applicability as unresolved."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - securedLoanCollateralSupport
    effect: Return a collateral-link check result with references to securityClassification or the verified collateralizedBy evidence establishing security and the pledged Collateral link inspected; report unknown applicability as unresolved and do not change the loan.
    verification: Confirm the inspected collateralizedBy link identifies the correct pledged Collateral for a loan established as secured; a guarantee-only loan without that link does not pass this particular check.
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetup
    effect: "Return the variable-rate setup result with references to the linked InterestRate rateKind and the same loan's hasInterestRateResetSchedule link; do not change the loan."
    verification: "Confirm rateKind is variable, floating, or managed and that this same Loan links to its later InterestRateResetSchedule; if rate kind is unknown report unresolved, and do not substitute the initial event, cap, first-change term, or numericRate."
  reviewPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompleteness
    effect: Return payment-record completeness result with references to the inspected hasPaymentHistory and hasIndividualPayments links and the history and individual transactions examined; do not change the loan.
    verification: "Check the loan links to its correct PaymentHistory and that history links to at least one correctly attributed actual PaymentTransaction; the link checks themselves verify the result, without judging timeliness or currentness."
  reviewPrepaymentTerms:
    input: Loan
    preconditions:
      - prepaymentPenaltyTiming
    effect: "Return the prepayment penalty timing review result with references to the loan's hasPrincipal link, PrincipalRepaymentTerms whose governsPaymentOf link targets that same Principal, and the penalty evidence and penaltyPeriodMonths inspected; leave unresolved if governing terms or applicability cannot be established; do not change the loan."
    verification: "Inspect the governing terms for coversPrepayment and evidence that a penalty applies, and only then check penaltyPeriodMonths on those same terms; these evidence checks themselves verify the result."


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "assessLoanReadiness" has input class Loan, and its precondition loanReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewPrepaymentTerms" has input class Loan, and its precondition prepaymentPenaltyTiming refers to PrincipalRepaymentTerms, which is only reachable against the direction of the relationships between them.

### Turn 109 — assistant

I’ve checked the live canvas and will use its classes as the list for this pass. I’ll ask about 3–5 related classes at a time. After each answer, I’ll track each new candidate as **added**, **declined with a reason**, or **open**; mentioning something will not add it automatically. The four previously identified gaps remain open.

Starting with **Loan, CreditAgreement, CreditFacility, Borrower, and Lender**: what exists around each in your work that we have not described yet? For the three credit arrangements, consider parts, stages, parties, documents, and measurements. For Borrower and Lender, consider related roles, assessments, and more specific kinds. Are there values confirmed on one of these classes that also apply to a sibling? Please answer by class; “nothing further” is fine for any of them.

### Turn 110 — user

For the agreed questions and checks, I don’t see a missing part or party around these five. If you’re widening the canvas, I’d distinguish these adjacent concepts:

- **Loan:** We also distinguish secured, collateralized, guaranteed, and unsecured loans. Loan features we may need to answer a broader terms question include interest-only payments, a balloon payment, negative amortization, assumability, and whether the loan is initially payable. These are features to read when relevant, not new prerequisites for the five checks.
- **Credit agreement:** The useful distinction is **open-end credit**, which can be drawn and paid down within an agreed limit, versus **closed-end credit**, whose principal cannot increase after it is fully funded at closing. Its maturity and initial exchange dates are also values used on a loan; that does not make the two arrangements interchangeable.
- **Credit facility:** Beyond its amounts and possible sub-facilities, a facility may be **revolving**, **committed**, or **uncommitted**. Those describe how the facility works or whether financing is confirmed, not additional parties.
- **Borrower:** The borrowing capacity assessment we recorded is the relevant adjacent concept. I don’t have a further borrower role or subtype needed here.
- **Lender:** Nothing further needed for these tasks. The servicer remains a separate party that collects on the lender’s behalf.

One shared value worth noting is the **credit limit**: it can describe an open-end credit agreement as well as a credit facility. I wouldn’t copy every facility amount onto open-end credit.

### Turn 110 — assistant

For this first group, the borrower–assessment and loan–servicer connections, the loan and agreement dates, and the facility limit are **already represented**. I’m tracking the newly surfaced candidates separately:

- **Loan:** secured, collateralized, guaranteed, and unsecured kinds; and interest-only, balloon, negative-amortization, assumability, and initially-payable features.
- **CreditAgreement:** open-end and closed-end kinds, plus a credit limit for open-end credit.
- **CreditFacility:** revolving, committed, and uncommitted kinds.

None of those new distinctions is needed to answer a **currently recorded** question or perform one of the five checks, so I’m **declining them for this model, not disputing that they exist**. In particular, the recorded credit-limit question is about a *facility*, not every open-end agreement. I’ll keep them in the pass ledger with that reason.

Next, for **InterestPaymentTerms, InterestCalculationSchedule, InterestPaymentSchedule, PrincipalRepaymentTerms, and LoanPaymentSchedule**: what else exists around each in your work—such as parts of the terms, stages in producing or applying a schedule, related agreements, characteristic values, or more specific kinds? Do any values already recorded on one of these also apply to another? “Nothing further” for a class is fine.

### Turn 111 — user

For these five, most of what we use is already captured:

- **Interest payment terms:** The six timing and compounding values, the day-count accrual basis, and the interest they govern cover what we’ve discussed. Nothing further needed here.
- **Interest calculation schedule:** It gives the dates interest is calculated. An actual interest calculation is an event, distinct from the schedule, but we haven’t established a direct schedule-to-event link or needed one for the agreed question.
- **Interest payment schedule:** It gives interest due dates. It can also state an **anticipated number of payments**; that is not a count of payments actually made.
- **Principal repayment terms:** The timing values and the distinction for terms covering prepayment are covered. I wouldn’t add another agreement or stage to reach them.
- **Loan payment schedule:** It too can state an **anticipated number of payments**, separate from the actual payment history.

That anticipated count also applies to **principal payment** and **amortization schedules**. I wouldn’t put it on the interest calculation schedule on the evidence we have. None of these additional counts is a prerequisite for the five checks.

### Turn 111 — assistant

For this group, **InterestPaymentTerms** and **PrincipalRepaymentTerms** have no new candidates. I’m tracking these additions as **declined for the current model**:

- **Actual interest-calculation event:** distinct from its schedule, but no recorded question or check needs the event, and no schedule-to-event link is confirmed.
- **Anticipated payment count** on InterestPaymentSchedule and LoanPaymentSchedule: distinct from actual payments, but not needed to answer the recorded due-date or schedule-presence questions. I’ve also noted your correction that it can apply to PrincipalPaymentSchedule and AmortizationSchedule, but **not** InterestCalculationSchedule.

Nothing has been added solely because it exists in the work.

Next, for **DayCountConvention, PrincipalPaymentSchedule, AmortizationSchedule, InterestRate, and InitialInterestRateSettingEvent**: what else exists around each—such as applicable variants, related events, inputs to a calculation, characteristic values, or earlier and later steps? Do any properties already confirmed on a related class apply to one of these too? “Nothing further” is fine.

### Turn 112 — user

By those five:

- **Day-count convention:** It is the basis the interest payment terms use to calculate accrual. I don’t have a fixed list of conventions or another value to add here.
- **Principal payment schedule:** It shows when principal is due, not when it was actually paid. As noted in the ledger, it may state an anticipated number of payments; an actual principal payment is a different event, with no additional link established for these tasks.
- **Amortization schedule:** It shows how periodic payments change the debt balance. Amortization itself can be full, partial, or negative, but we haven’t established a way to determine which applies from this schedule or a new connection needed for the agreed questions. It too may state an anticipated payment count.
- **Interest rate:** We’ve captured its numeric rate and the fixed, variable, floating, and managed distinctions. Floating refers to a benchmark-based variable rate; managed means the institution sets the variable rate from time to time. I wouldn’t add a benchmark-reference field on that basis. The cap and first-change term remain loan values, not rate values.
- **Initial interest-rate-setting event:** It establishes the first rate, potentially relative to another contract event. It is not a later rate reset; we haven’t established an extra event link or value the agent needs to follow for the agreed question.

### Turn 112 — assistant

For this group, **DayCountConvention** and **InterestRate** add no new candidates; the rate meanings and the loan’s cap and first-change term are already captured. The anticipated counts were already logged in the previous group.

I’m tracking three further candidates as **declined for the current model**: an actual principal-payment event separate from its schedule (no additional link or agreed task requiring it); full, partial, and negative amortization kinds (no confirmed way to determine them or agreed question requiring the distinction); and another contract event used to time initial rate setting (no confirmed link or value the agent needs to follow). These do not resolve the open question of how to establish that a loan is amortizing.

Next, for **InterestRateResetSchedule, AccruedInterest, Collateral, SecurityAgreement, and Servicer**: what else exists around each in your work—such as related events, dated values, responsible parties, agreements, or more specific kinds? Do any already-confirmed properties on a related class also apply to one of these? “Nothing further” is fine for each.

### Turn 113 — user

By those five:

- **Interest-rate reset schedule:** It sets out when later rate resets and resulting rates are recalculated. An actual rate-reset event is distinct from the schedule, but we haven’t established a schedule-to-event link needed for the agreed question or review.
- **Accrued interest:** Its unpaid amount and as-of date are covered. We still have no confirmed path attributing a particular figure to a loan; nothing in this group resolves that gap.
- **Collateral:** Its dated appraised value and its link to a collateral-backed loan are covered. I have no additional collateral property needed for these tasks.
- **Security agreement:** It grants an interest in the collateral and sets out rights and duties concerning that asset. A credit enhancement agreement is another kind of collateral-related agreement, with a beneficiary, but it is not a substitute for this agreement or for the loan’s pledged-asset link. No additional connection is needed for the agreed checks.
- **Servicer:** Nothing further. It collects principal and interest payments on the lender’s behalf; we haven’t identified a separate collector role or a new servicer link.

### Turn 113 — assistant

For this group, **AccruedInterest, Collateral, and Servicer** add no new candidates. The accrued-interest attribution gap remains open. I’m tracking two candidates as **declined for this model**: an actual rate-reset event, because no agreed question or check needs a schedule-to-event link; and a credit enhancement agreement with a beneficiary, because it is not the security agreement or pledged-asset link needed by the recorded questions and checks. Neither has been added to the canvas.

Next, for **PaymentHistory, PaymentTransaction, SubFacility, CollateralAppraisal, and LoanToValueRatio**: what else exists around each in your work—such as constituent entries, dated changes, related parties or documents, measurements, or more specific kinds? Do values already confirmed on a related class also apply to any of these? “Nothing further” is fine.

### Turn 114 — user

By those five:

- **Payment history:** It has the individual actual payments we’ve linked to it. Nothing further is needed for the completeness check.
- **Individual payment transaction:** It can be a payment toward principal, interest, fees, or another related amount. Actual principal and interest payments can be distinguished as events, but we haven’t established a further link or value needed for the agreed check.
- **Sub-facility:** It is a portion of its credit facility. A sub-facility may be committed or uncommitted; that distinction isn’t needed to identify which portions make up the facility.
- **Dated collateral value:** The appraised value and its as-of date are the values to keep together. Nothing further needed here.
- **Loan-to-value ratio:** Its ratio value is covered. Keep it distinct from the **combined loan-to-value ratio**, which accounts for total debt secured by the asset or assets; the latter is already represented.

### Turn 114 — assistant

For this group, **PaymentHistory, CollateralAppraisal, and LoanToValueRatio** have no new candidates; the distinction from CombinedLoanToValueRatio is already represented. I’m tracking two candidates as **declined for this model**: separate actual principal- and interest-payment events, because the completeness check uses individual transactions without that further distinction; and committed versus uncommitted sub-facilities, because the recorded question asks which portions make up the facility, not their commitment type.

That leaves four classes in this pass: **CombinedLoanToValueRatio, Interest, Principal, and BorrowingCapacityAssessment**. What else exists around each in your work—such as inputs to the measure, dated changes, governing terms, responsible parties, or more specific kinds? Do properties already confirmed on a related class also apply to one of these? “Nothing further” is fine.

### Turn 115 — user

- **Combined loan-to-value ratio:** It compares total debt secured by the asset or assets with their appraised value. Its ratio value is already covered; I wouldn’t add separate input links just to represent that calculation.
- **Interest:** Besides the governing payment terms already linked, interest can have an **outstanding amount**. That is distinct from a dated **accrued-interest** amount, so it would not resolve the loan-attribution gap or answer that question by itself.
- **Principal:** Its outstanding amount is already captured. Keep that separate from the loan’s original principal amount.
- **Borrowing capacity assessment:** The assessed amount and its link to the borrower are covered. I wouldn’t add a mandatory as-of-date value or a link to a facility.

The outstanding interest amount is the only new value I’d put in your candidate ledger from this group; it isn’t needed for the agreed checks.

### Turn 115 — assistant

The pass has now covered **every class on the live canvas**. In this last group, the combined ratio, Principal, and BorrowingCapacityAssessment have nothing further to add. I’ve **declined Interest.outstandingAmount** for this model: it is a real figure, but no recorded question or agreed check needs it. It is distinct from dated AccruedInterest and would not fix that figure’s loan-attribution gap.

I’ve closed every candidate surfaced in this pass. None was added: the new distinctions and values were not needed for the recorded questions or actions, and several proposed connections were explicitly unconfirmed. I counted a candidate once when it came up in more than one group—for example, anticipated payment count and an actual principal-payment event. The **four pre-existing gaps** remain open separately: accrued-interest attribution, the two governing-terms reverse lookups, and evidence that amortization applies.

COVERAGE LEDGER: surfaced=32; added=0; declined=32; open=0

### Turn 116 — user

One last pass, on wording: I would like the model to use our own words.

Call get_graph_state first. Then go through what is on the canvas, three to five items per question, relationships first, then properties, then classes:
- for each relationship, ask me what we call this connection ourselves, in one verb phrase, and which way round we would say it;
- for each property and each class, ask me whether that is what we would call it, or whether we have our own term for it.

Record each answer with the rename_ontology_elements tool: a relationship takes my verb phrase, and if I state it the other way round it is turned round (reverse: true); a property or a class takes my term. Previous names of classes and relationships are kept as aliases automatically. Where I say the current name is already right, leave it as it is. Do not add or remove anything in this pass.

When every relationship, property and class has been asked about, end that message with one line in exactly this form, and ask nothing further in it:
NAMING LEDGER: relationships_renamed=<number>; relationships_redirected=<number>; properties_renamed=<number>; classes_renamed=<number>

### Turn 116 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 116 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit agreement?
  - id: cq2
    text: Who is the lender for a loan or credit agreement?
  - id: cq3
    text: What is the principal amount of a loan?
  - id: cq4
    text: What is the debt amount of a credit agreement?
  - id: cq5
    text: "What is a facility's credit limit?"
  - id: cq6
    text: What is the amount of credit extended under a facility?
  - id: cq7
    text: What is the available amount under a facility?
  - id: cq8
    text: What initial exchange date is stated in the terms?
  - id: cq9
    text: When does a loan or credit agreement mature?
  - id: cq10
    text: "What interest rate and rate type apply, and which variable-rate features apply?"
  - id: cq11
    text: What day-count convention governs interest calculation?
  - id: cq12
    text: When are interest calculations scheduled?
  - id: cq13
    text: "What do the interest payment terms require, and what due dates appear on the interest payment schedule?"
  - id: cq14
    text: "How much interest is accrued but unpaid, as of what date?"
  - id: cq15
    text: "For a variable rate, what event sets the initial rate, and what schedule covers later resets?"
  - id: cq16
    text: What do the principal repayment terms require?
  - id: cq17
    text: "Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?"
  - id: cq18
    text: "Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?"
  - id: cq19
    text: "If collateral is pledged, what collateral is linked to the loan?"
  - id: cq20
    text: What security agreement grants an interest in the pledged collateral linked to the loan?
  - id: cq21
    text: "Who services the loan and collects principal and interest payments on the lender's behalf?"
  - id: cq22
    text: "For a collateralized loan, what are the collateral's appraised value and as-of date, and what loan-to-value and combined loan-to-value ratios are recorded?"
  - id: cq23
    text: What borrowing capacity has been assessed for this borrower?
  - id: cq24
    text: "If a credit facility is divided, which sub-facilities make up this credit facility?"
  - id: cq25
    text: What are the loan balance and outstanding principal amount?
classes:
  Loan:
    meaning: "Money or credit extended to a borrower, to be repaid under the agreed terms."
    aliases: []
    properties:
      principalAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
      interestRateCap:
        type: number
      firstRateChangeTermMonths:
        type: number
        unit: months
      securityClassification:
        type: text
      loanBalance:
        type: number
  CreditAgreement:
    meaning: "An agreement under which a borrower receives value and generally agrees to repay it by a future date, usually with interest."
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  CreditFacility:
    meaning: A credit agreement that lets the borrower draw funds over time rather than apply for a new loan each time.
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
    meaning: "The party obliged to repay what was borrowed, with interest and applicable fees, under the agreement."
    aliases: []
    properties: {}
  Lender:
    meaning: "The party that extends money or credit to the borrower expecting repayment, usually with interest."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "The agreed requirements for paying interest, including the accrual basis and payment timing."
    aliases: []
    properties:
      initialAccrualDate:
        type: date
      initialInterestPaymentDate:
        type: date
      finalInterestPaymentDate:
        type: date
      paymentFrequency:
        type: text
      paymentDay:
        type: text
      compoundingFrequency:
        type: text
  InterestCalculationSchedule:
    meaning: The contract-specific schedule of dates on which interest is calculated.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The contract-specific schedule of dates on which interest is due.
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: The agreed requirements for repaying principal.
    aliases: []
    properties:
      coversPrepayment:
        type: boolean
      penaltyPeriodMonths:
        type: number
        unit: months
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      principalPaymentFrequency:
        type: text
      principalPaymentDay:
        type: text
  LoanPaymentSchedule:
    meaning: The regular or explicitly dated payment schedule associated with a particular loan.
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: The convention used to count days when calculating accrued interest.
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The contract-specific schedule showing when some or all of the principal is due to be repaid.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: The schedule of periodic payments showing how the debt balance changes over time.
    aliases: []
    properties: {}
  InterestRate:
    meaning: The rate used to charge interest on the loan; it may be fixed or variable.
    aliases: []
    properties:
      numericRate:
        type: number
      rateKind:
        type: text
        allowed:
          - fixed
          - variable
          - floating
          - managed
  InitialInterestRateSettingEvent:
    meaning: "The event at which the loan's initial rate is established, distinct from a later reset."
    aliases: []
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates when a rate reset and the resulting rate are recalculated.
    aliases:
      - rate reset schedule
    properties: {}
  AccruedInterest:
    meaning: "Interest incurred but not yet paid, stated as an amount as of a particular date."
    aliases: []
    properties:
      unpaidAmount:
        type: number
      asOfDate:
        type: date
  Collateral:
    meaning: An asset pledged as security for repayment of an obligation.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning that asset.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party that collects principal and interest payments on the lender's behalf."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The record of payments actually made toward the borrower's repayment obligation."
    aliases: []
    properties: {}
  PaymentTransaction:
    meaning: "An actual payment toward the debt, of principal, interest, fees, or another related amount, that forms part of the payment history."
    aliases:
      - individual payment
    properties: {}
  SubFacility:
    meaning: "A portion of a credit facility made available for a particular purpose, sometimes under its own schedule."
    aliases: []
    properties: {}
  CollateralAppraisal:
    meaning: "The collateral's appraised value as of a specified date."
    aliases:
      - dated collateral value
      - collateral value as of a date
    properties:
      appraisedValue:
        type: number
      asOfDate:
        type: date
  LoanToValueRatio:
    meaning: "This loan's principal as a percentage of the appraised value of the asset securing it."
    aliases:
      - LTV
    properties:
      ratioValue:
        type: number
  CombinedLoanToValueRatio:
    meaning: Total debt secured by the asset or assets as a percentage of their appraised value.
    aliases: []
    properties:
      ratioValue:
        type: number
  Interest:
    meaning: "The cost the borrower pays for using the credit, expressed as a rate over time and distinct from principal."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of the debt that must be repaid, separate from interest."
    aliases: []
    properties:
      outstandingPrincipalAmount:
        type: number
  BorrowingCapacityAssessment:
    meaning: "The lender's assessment, at a point in time, of the upper amount the borrower can repay when due; it is not the facility's available amount."
    aliases:
      - borrowing capacity
    properties:
      assessedCapacityAmount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The party obliged to repay under this loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The party extending credit under this loan.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: The party obliged to repay under this credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: The party extending credit under this credit agreement.
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: The party allowed to draw funds under this credit facility.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: The party providing this credit facility.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: A credit facility has sub-facilities that form portions of it when it is divided.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: InterestRate
    meaning: The rate used to charge interest on this loan when it bears interest.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: The associated schedule specifying dates when interest is calculated for this loan
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: The associated schedule specifying dates when interest is due for this loan
    aliases: []
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: These terms have the day-count convention used as their accrual basis.
    aliases: []
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: The loan has interest owed for using the credit.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: These terms govern payment of the interest owed under the loan.
    aliases: []
  - name: hasInitialInterestRateSettingEvent
    from: Loan
    to: InitialInterestRateSettingEvent
    meaning: "The event establishing this loan's initial interest rate when applicable"
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: The schedule associated with this loan for later rate resets when applicable.
    aliases:
      - has a reset schedule
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: The loan has an associated overall payment schedule when applicable and on file.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: The loan has a schedule of principal due dates when applicable and on file.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: The loan has an applicable schedule of periodic payments and resulting balance changes when on file.
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: The loan has a principal repayment obligation
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "These terms govern payment of the loan's principal."
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "The loan is serviced by the party collecting principal and interest payments on its lender's behalf."
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by this pledged asset when collateral backs it; this does not apply to a guarantee-backed loan without pledged collateral.
    aliases:
      - backed by pledged collateral
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement secures this pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasDatedAppraisedValue
    from: Collateral
    to: CollateralAppraisal
    meaning: The collateral has this recorded appraised value together with its as-of date when one is available.
    aliases: []
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: The loan has a history of payments actually made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: PaymentHistory
    to: PaymentTransaction
    meaning: The history has individual actual payment transactions making it up
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded combined loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasBorrowingCapacityAssessment
    from: Borrower
    to: BorrowingCapacityAssessment
    meaning: The borrower has an assessment of its capacity to repay when due.
    aliases: []
rules:
  loanReadiness:
    conditions:
      - The loan has a confirmed hasBorrower link to its borrower and a confirmed hasLender link to its lender.
      - "If the loan has a confirmed hasInterest link or hasInterestRate link, establish its applicable hasInterestRate link and the InterestPaymentTerms whose governsPaymentOf link reaches the Interest linked by this loan's hasInterest link."
      - "If whether interest applies cannot be established, leave the interest portion of readiness unresolved; missing interest or rate links do not prove an interest-free loan."
  securedLoanCollateralSupport:
    conditions:
      - "Establish that the loan is secured from its securityClassification when supported by the deal record, or from a verified collateralizedBy link to pledged Collateral; missing classification does not mean unsecured."
      - "For a loan established as secured, the collateral-link check passes only if its collateralizedBy link to the correct pledged Collateral is verified."
      - A guarantee-only secured loan without a pledged Collateral link does not pass this collateral-link check; this does not invalidate its guarantee or imply it is unsecured.
      - "If secured status cannot be established, leave applicability unresolved rather than treating the loan as unsecured."
  variableRateSetup:
    conditions:
      - "The loan's hasInterestRate link identifies an InterestRate with rateKind variable, floating, or managed."
      - The same loan has a confirmed hasInterestRateResetSchedule link to its later InterestRateResetSchedule; its initial interest-rate-setting event is not a substitute.
      - "If rateKind is unknown, applicability and the result remain unresolved rather than assuming a fixed rate."
  paymentRecordCompleteness:
    conditions:
      - "Verify the loan's hasPaymentHistory link points to the correct PaymentHistory for that loan."
      - Verify that same PaymentHistory has at least one correctly attributed PaymentTransaction through hasIndividualPayments.
      - A missing or incorrectly attributed history or individual payment does not pass; do not assess timeliness or whether the borrower is current.
  prepaymentPenaltyTiming:
    conditions:
      - "Identify the Principal linked by this loan's hasPrincipal and PrincipalRepaymentTerms whose governsPaymentOf link reaches that same Principal."
      - Confirm those governing PrincipalRepaymentTerms have coversPrepayment true.
      - Inspect those terms for reliable evidence that a penalty applies; coversPrepayment alone does not establish a penalty.
      - "Only when penalty applicability is established, confirm penaltyPeriodMonths is recorded on those same terms; missing is not zero or proof of no penalty."
      - "If penalty applicability cannot be established, leave the review unresolved."
actions:
  assessLoanReadiness:
    input: Loan
    preconditions:
      - loanReadiness
    effect: "Return a pass, non-pass, or unresolved readiness result with references to the checked hasBorrower and hasLender links and, when interest applies, the hasInterestRate link and the hasInterest and governsPaymentOf path to the governing InterestPaymentTerms; do not change the loan."
    verification: "Confirm the reported result agrees with the inspected party links and, when applicable, the rate link and terms governing the same loan's Interest; report uncertainty about interest applicability as unresolved."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - securedLoanCollateralSupport
    effect: Return a collateral-link check result with references to securityClassification or the verified collateralizedBy evidence establishing security and the pledged Collateral link inspected; report unknown applicability as unresolved and do not change the loan.
    verification: Confirm the inspected collateralizedBy link identifies the correct pledged Collateral for a loan established as secured; a guarantee-only loan without that link does not pass this particular check.
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetup
    effect: "Return the variable-rate setup result with references to the linked InterestRate rateKind and the same loan's hasInterestRateResetSchedule link; do not change the loan."
    verification: "Confirm rateKind is variable, floating, or managed and that this same Loan links to its later InterestRateResetSchedule; if rate kind is unknown report unresolved, and do not substitute the initial event, cap, first-change term, or numericRate."
  reviewPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompleteness
    effect: Return payment-record completeness result with references to the inspected hasPaymentHistory and hasIndividualPayments links and the history and individual transactions examined; do not change the loan.
    verification: "Check the loan links to its correct PaymentHistory and that history links to at least one correctly attributed actual PaymentTransaction; the link checks themselves verify the result, without judging timeliness or currentness."
  reviewPrepaymentTerms:
    input: Loan
    preconditions:
      - prepaymentPenaltyTiming
    effect: "Return the prepayment penalty timing review result with references to the loan's hasPrincipal link, PrincipalRepaymentTerms whose governsPaymentOf link targets that same Principal, and the penalty evidence and penaltyPeriodMonths inspected; leave unresolved if governing terms or applicability cannot be established; do not change the loan."
    verification: "Inspect the governing terms for coversPrepayment and evidence that a penalty applies, and only then check penaltyPeriodMonths on those same terms; these evidence checks themselves verify the result."


# CONSISTENCY CHECK — 2 outstanding problem(s) in the whole model:
#   [warning] unreachable-from-action-input — Action "assessLoanReadiness" has input class Loan, and its precondition loanReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewPrepaymentTerms" has input class Loan, and its precondition prepaymentPenaltyTiming refers to PrincipalRepaymentTerms, which is only reachable against the direction of the relationships between them.

### Turn 116 — assistant

I’ve checked the live canvas. I’ll use it as the list for this naming pass: **relationships first, then properties, then classes**, in groups of three to five. I’ll rename only where you give a different term; existing class and relationship names will remain as aliases. I won’t add or remove anything.

Starting with these four party connections, what **one verb phrase** would your team use for each, and which way round would you say it? “Current name and direction” is fine for any item.

1. **Loan → Borrower:** `hasBorrower`
2. **Loan → Lender:** `hasLender`
3. **CreditAgreement → Borrower:** `hasBorrower`
4. **CreditAgreement → Lender:** `hasLender`

### Turn 117 — user

Current names and directions for all four:

1. **Loan has borrower** — the party obliged to repay under that loan.
2. **Loan has lender** — the party financing that loan.
3. **Credit agreement has borrower** — the party obliged to repay under that agreement.
4. **Credit agreement has lender** — the party extending credit under that agreement.

### Turn 117 — assistant

Those four party connections keep their current names and directions. No renames were needed.

For the next five, what one verb phrase would your team use, and which way round would you say it? “Current name and direction” is fine.

1. **CreditFacility → Borrower:** `hasBorrower`
2. **CreditFacility → Lender:** `hasLender`
3. **CreditFacility → SubFacility:** `hasSubFacility`
4. **Loan → InterestRate:** `hasInterestRate`
5. **Loan → InterestCalculationSchedule:** `hasInterestCalculationSchedule`

### Turn 118 — user

I’d keep the current direction and phrasing for all five:

1. **Credit facility has borrower** — the party who may draw under it.
2. **Credit facility has lender** — the party providing it.
3. **Credit facility has sub-facility** — a portion of the facility, where one exists.
4. **Loan has interest rate** — the rate applying to that loan.
5. **Loan has interest calculation schedule** — the schedule of its calculation dates, when one is on file.

### Turn 118 — assistant

Those five connections also keep their current names and directions. No renames were needed.

For these four interest connections, what one verb phrase would your team use, and which way round would you say it?

1. **Loan → InterestPaymentSchedule:** `hasInterestPaymentSchedule`
2. **InterestPaymentTerms → DayCountConvention:** `hasAccrualBasis`
3. **Loan → Interest:** `hasInterest`
4. **InterestPaymentTerms → Interest:** `governsPaymentOf`

“Current name and direction” is fine for any of them.

### Turn 119 — user

Current names and directions for all four:

1. **Loan has interest payment schedule** — when one is associated with the loan.
2. **Interest payment terms have accrual basis** — the day-count convention used to calculate accrual.
3. **Loan has interest** — the interest obligation under that loan.
4. **Interest payment terms govern payment of interest** — specifically the interest they govern.

### Turn 119 — assistant

Those four interest connections keep their current names and directions. No renames were needed.

For these five loan-to-schedule or event connections, what one verb phrase would your team use, and which way round would you say it?

1. **Loan → InitialInterestRateSettingEvent:** `hasInitialInterestRateSettingEvent`
2. **Loan → InterestRateResetSchedule:** `hasInterestRateResetSchedule`
3. **Loan → LoanPaymentSchedule:** `hasLoanPaymentSchedule`
4. **Loan → PrincipalPaymentSchedule:** `hasPrincipalPaymentSchedule`
5. **Loan → AmortizationSchedule:** `hasAmortizationSchedule`

“Current name and direction” is fine for any.

### Turn 120 — user

I’d keep the **direction** for all five: each runs from the loan to the event or schedule. I’d phrase them this way:

1. **Loan has an initial interest-rate-setting event.**
2. **Loan has an interest-rate reset schedule.**
3. **Loan has a loan payment schedule.**
4. **Loan has a principal payment schedule.**
5. **Loan has an amortization schedule.**

So I wouldn’t change the business meaning of the current names. The first is an **event** establishing the initial rate; the second is a **schedule** for later resets.

### Turn 120 — assistant

Those five keep their current names and Loan-to-event-or-schedule directions. The initial-setting event remains distinct from the later reset schedule.

For the next five connections, what one verb phrase would your team use, and which way round would you say it?

1. **Loan → Principal:** `hasPrincipal`
2. **PrincipalRepaymentTerms → Principal:** `governsPaymentOf`
3. **Loan → Servicer:** `servicedBy`
4. **Loan → Collateral:** `collateralizedBy`
5. **SecurityAgreement → Collateral:** `secures`

“Current name and direction” is fine for any.

### Turn 121 — user

I’d keep the current names and directions, with the collateral link understood to apply to a **secured loan backed by pledged collateral**, not every loan:

1. **Loan has principal.**
2. **Principal repayment terms govern payment of principal.**
3. **Loan is serviced by a servicer.**
4. **Secured loan is collateralized by pledged collateral.**
5. **Security agreement secures that collateral.**

### Turn 121 — assistant

Those five keep their current names and directions. The collateral link’s existing meaning already limits it to a loan backed by pledged collateral; I won’t broaden it to every loan.

For these three connections, what one verb phrase would your team use, and which way round would you say it? “Current name and direction” is fine.

1. **Collateral → CollateralAppraisal:** `hasDatedAppraisedValue`
2. **Loan → PaymentHistory:** `hasPaymentHistory`
3. **PaymentHistory → PaymentTransaction:** `hasIndividualPayments`

### Turn 122 — user

The directions are right for all three. I’d phrase them as:

1. **Collateral has a collateral value as of a date.** That keeps the appraisal date with the value.
2. **Loan has a payment history.** Current name and direction.
3. **Payment history has individual payments.** Current name and direction; these are actual transactions, not scheduled payments.

### Turn 122 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "hasDatedAppraisedValue",
      "to": "hasCollateralValueAsOfDate",
      "className": "",
      "source": "Collateral",
      "target": "CollateralAppraisal",
      "reverse": false
    }
  ]
}
```

### Turn 122 — tool

Renamed 1 of 1:
- relationship "hasDatedAppraisedValue" (Collateral → CollateralAppraisal) → "hasCollateralValueAsOfDate" (Collateral → CollateralAppraisal)

### Turn 122 — assistant

I’ve renamed the first connection to **Collateral → CollateralAppraisal: `hasCollateralValueAsOfDate`**; its previous name remains an alias. The payment-history connections keep their names and directions.

For the three remaining relationships, what one verb phrase would your team use, and which way round would you say it?

1. **Loan → LoanToValueRatio:** `hasLoanToValueRatio`
2. **Loan → CombinedLoanToValueRatio:** `hasCombinedLoanToValueRatio`
3. **Borrower → BorrowingCapacityAssessment:** `hasBorrowingCapacityAssessment`

“Current name and direction” is fine for any.

### Turn 123 — user

The directions are right for all three. I’d keep **has loan-to-value ratio** and **has combined loan-to-value ratio** for the first two, with both links limited to a loan treated as collateralized by borrower-provided collateral.

For the third, I’d say **borrower has borrowing capacity**. The assessment and its amount are what we inspect; the link runs from the borrower to that assessed capacity.

### Turn 123 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "relationship",
      "from": "hasBorrowingCapacityAssessment",
      "to": "hasBorrowingCapacity",
      "className": "",
      "source": "Borrower",
      "target": "BorrowingCapacityAssessment",
      "reverse": false
    }
  ]
}
```

### Turn 123 — tool

Renamed 1 of 1:
- relationship "hasBorrowingCapacityAssessment" (Borrower → BorrowingCapacityAssessment) → "hasBorrowingCapacity" (Borrower → BorrowingCapacityAssessment)

### Turn 123 — assistant

All relationships have now been asked about. Two were renamed—**`hasCollateralValueAsOfDate`** and **`hasBorrowingCapacity`**—with no directions changed. The other names and directions stay as confirmed.

Now the properties. For these five **Loan** properties, are the current names what your team uses, or should any take another term? Please give only the replacements needed.

1. `principalAmount`
2. `initialExchangeDate`
3. `maturityDate`
4. `interestRateCap`
5. `firstRateChangeTermMonths`

### Turn 124 — user

No replacements needed. We’d say **principal amount**, **initial exchange date**, **maturity date**, **interest rate cap**, and **first rate-change term in months**.

### Turn 124 — assistant

Those five Loan property names stay as they are.

For the remaining two **Loan** properties and the three **CreditAgreement** properties, are these your terms, or should any be renamed?

1. Loan: `securityClassification`
2. Loan: `loanBalance`
3. CreditAgreement: `debtAmount`
4. CreditAgreement: `initialExchangeDate`
5. CreditAgreement: `maturityDate`

### Turn 125 — user

No replacements needed. We’d say **security classification**, **loan balance**, **debt amount**, **initial exchange date**, and **maturity date**. “Security classification” remains an optional, open-ended description; a blank value doesn’t mean the loan is unsecured.

### Turn 125 — assistant

Those five property names stay. **Security classification** remains optional and open-ended; blank does not mean unsecured.

For these three **CreditFacility** properties, are the current names what you use, or should any be renamed?

1. `creditLimit`
2. `amountOfCreditExtended`
3. `availableAmount`

### Turn 126 — user

No replacements needed. We use **credit limit**, **amount of credit extended**, and **available amount** as three different figures.

### Turn 126 — assistant

The three CreditFacility property names stay distinct and unchanged.

For these five **InterestPaymentTerms** properties, are the current names your terms, or should any be renamed?

1. `initialAccrualDate`
2. `initialInterestPaymentDate`
3. `finalInterestPaymentDate`
4. `paymentFrequency`
5. `paymentDay`

### Turn 127 — user

I’d change three:

1. `initialAccrualDate` → **initial interest accrual date**
4. `paymentFrequency` → **interest payment frequency**
5. `paymentDay` → **interest payment day**

The **initial interest payment date** and **final interest payment date** names can stay. The extra words make clear which accrual and payments these terms describe.

### Turn 127 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "initialAccrualDate",
      "to": "initialInterestAccrualDate",
      "className": "InterestPaymentTerms",
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
    },
    {
      "kind": "property",
      "from": "paymentDay",
      "to": "interestPaymentDay",
      "className": "InterestPaymentTerms",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 127 — tool

Renamed 3 of 3:
- property "InterestPaymentTerms.initialAccrualDate" → "initialInterestAccrualDate"
- property "InterestPaymentTerms.paymentFrequency" → "interestPaymentFrequency"
- property "InterestPaymentTerms.paymentDay" → "interestPaymentDay"

### Turn 127 — assistant

I’ve renamed those three interest-term properties. The initial and final interest payment date names stay unchanged.

For the next five properties, are these your terms, or should any be renamed?

1. InterestPaymentTerms: `compoundingFrequency`
2. PrincipalRepaymentTerms: `coversPrepayment`
3. PrincipalRepaymentTerms: `penaltyPeriodMonths`
4. PrincipalRepaymentTerms: `initialPrincipalPaymentDate`
5. PrincipalRepaymentTerms: `principalRepaymentDate`

### Turn 128 — user

I’d rename only **`penaltyPeriodMonths`** to **prepayment penalty term in months**. That makes clear it is the period associated with a prepayment penalty, not a general repayment period.

The other four names can stay.

### Turn 128 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "penaltyPeriodMonths",
      "to": "prepaymentPenaltyTermMonths",
      "className": "PrincipalRepaymentTerms",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 128 — tool

Renamed 1 of 1:
- property "PrincipalRepaymentTerms.penaltyPeriodMonths" → "prepaymentPenaltyTermMonths"

### Turn 128 — assistant

I’ve renamed that property to **`prepaymentPenaltyTermMonths`**. The other four names stay. I’ll check the rule and action wording against the renamed property after the naming pass; renaming a property may not update free-text references automatically.

For these five properties, are the current names your terms, or should any be renamed?

1. PrincipalRepaymentTerms: `principalPaymentFrequency`
2. PrincipalRepaymentTerms: `principalPaymentDay`
3. InterestRate: `numericRate`
4. InterestRate: `rateKind`
5. AccruedInterest: `unpaidAmount`

### Turn 129 — user

The first two can stay: **principal payment frequency** and **principal payment day**. **Rate kind** can stay as the canvas’s way of distinguishing fixed, variable, floating, and managed rates.

I’d shorten **numeric rate** to **rate**—the linked rate’s number—and **unpaid amount** to **amount**. On accrued interest, that amount is still understood to be unpaid interest **as of the recorded date**; the shorter name doesn’t remove either qualification.

### Turn 129 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "numericRate",
      "to": "rate",
      "className": "InterestRate",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "unpaidAmount",
      "to": "amount",
      "className": "AccruedInterest",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 129 — tool

Renamed 2 of 2:
- property "InterestRate.numericRate" → "rate"
- property "AccruedInterest.unpaidAmount" → "amount"

### Turn 129 — assistant

I’ve renamed **InterestRate.numericRate → rate** and **AccruedInterest.unpaidAmount → amount**. The accrued-interest amount still means unpaid interest as of its recorded date. The other three names stay.

For these five measurement properties, are the current names your terms, or should any be renamed?

1. AccruedInterest: `asOfDate`
2. CollateralAppraisal: `appraisedValue`
3. CollateralAppraisal: `asOfDate`
4. LoanToValueRatio: `ratioValue`
5. CombinedLoanToValueRatio: `ratioValue`

### Turn 130 — user

Keep **as-of date** on both accrued interest and the collateral appraisal. I’d rename the other three:

- Collateral appraisal: `appraisedValue` → **value**
- Loan-to-value ratio: `ratioValue` → **ratio**
- Combined loan-to-value ratio: `ratioValue` → **ratio**

The measurement each value belongs to keeps the shorter names unambiguous.

### Turn 130 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "appraisedValue",
      "to": "value",
      "className": "CollateralAppraisal",
      "source": "",
      "target": "",
      "reverse": false
    },
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

### Turn 130 — tool

Renamed 3 of 3:
- property "CollateralAppraisal.appraisedValue" → "value"
- property "LoanToValueRatio.ratioValue" → "ratio"
- property "CombinedLoanToValueRatio.ratioValue" → "ratio"

### Turn 130 — assistant

I’ve renamed the appraisal’s property to **`value`** and each ratio measurement’s property to **`ratio`**. Their classes keep those shorter names unambiguous; both as-of-date properties stay unchanged.

For the last two properties, are these the terms your team uses, or should either be renamed?

1. Principal: `outstandingPrincipalAmount`
2. BorrowingCapacityAssessment: `assessedCapacityAmount`

### Turn 131 — user

I’d rename both:

1. Principal: `outstandingPrincipalAmount` → **outstanding amount**. The principal context makes clear what remains unpaid.
2. Borrowing capacity assessment: `assessedCapacityAmount` → **amount**. The assessment identifies what the figure represents.

### Turn 131 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "property",
      "from": "outstandingPrincipalAmount",
      "to": "outstandingAmount",
      "className": "Principal",
      "source": "",
      "target": "",
      "reverse": false
    },
    {
      "kind": "property",
      "from": "assessedCapacityAmount",
      "to": "amount",
      "className": "BorrowingCapacityAssessment",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 131 — tool

Renamed 2 of 2:
- property "Principal.outstandingPrincipalAmount" → "outstandingAmount"
- property "BorrowingCapacityAssessment.assessedCapacityAmount" → "amount"

### Turn 131 — assistant

All properties have now been asked about. I’ve made the confirmed renames; no property was added or removed.

Now the classes. For these five, are the current canvas names what your team uses, or should any take a different name?

1. `Loan`
2. `CreditAgreement`
3. `CreditFacility`
4. `Borrower`
5. `Lender`

### Turn 132 — user

No renames needed: **loan**, **credit agreement**, **credit facility**, **borrower**, and **lender** are the terms we use.

### Turn 132 — assistant

Those five class names stay unchanged.

For the next five, are the current names your terms, or should any be renamed?

1. `InterestPaymentTerms`
2. `InterestCalculationSchedule`
3. `InterestPaymentSchedule`
4. `PrincipalRepaymentTerms`
5. `LoanPaymentSchedule`

### Turn 133 — user

No renames needed. We use **interest payment terms**, **interest calculation schedule**, **interest payment schedule**, **principal repayment terms**, and **loan payment schedule**.

### Turn 133 — assistant

Those five class names stay unchanged.

For these five classes, are the current names your terms, or should any be renamed?

1. `DayCountConvention`
2. `PrincipalPaymentSchedule`
3. `AmortizationSchedule`
4. `InterestRate`
5. `InitialInterestRateSettingEvent`

### Turn 134 — user

The first four can stay: **day-count convention**, **principal payment schedule**, **amortization schedule**, and **interest rate**.

I’d shorten **initial interest-rate-setting event** to **interest rate setting event**. Its meaning still needs to say that it establishes the loan’s *initial* rate, not a later reset.

### Turn 134 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "InitialInterestRateSettingEvent",
      "to": "InterestRateSettingEvent",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 134 — tool

Renamed 1 of 1:
- class "InitialInterestRateSettingEvent" → "InterestRateSettingEvent" (previous name kept as an alias)

### Turn 134 — assistant

I’ve renamed the class to **InterestRateSettingEvent**; its previous name remains an alias, and its meaning still specifies the **initial** rate rather than a later reset. The other four class names stay unchanged.

For these five classes, are the current names your terms, or should any be renamed?

1. `InterestRateResetSchedule`
2. `AccruedInterest`
3. `Collateral`
4. `SecurityAgreement`
5. `Servicer`

### Turn 135 — user

No renames needed. We’d use **interest-rate reset schedule**, **accrued interest**, **collateral**, **security agreement**, and **servicer**.

### Turn 135 — assistant

Those five class names stay unchanged.

For the next five, are the current names your terms, or should any be renamed?

1. `PaymentHistory`
2. `PaymentTransaction`
3. `SubFacility`
4. `CollateralAppraisal`
5. `LoanToValueRatio`

### Turn 136 — user

I’d rename two:

- **Payment transaction** → **individual payment transaction**. That makes clear it’s one actual payment making up the history.
- **Collateral appraisal** → **collateral value as of a date**. The value and appraisal date belong together.

**Payment history**, **sub-facility**, and **loan-to-value ratio** can stay.

### Turn 136 — assistant

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
    },
    {
      "kind": "class",
      "from": "CollateralAppraisal",
      "to": "CollateralValueAsOfDate",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 136 — tool

Renamed 2 of 2:
- class "PaymentTransaction" → "IndividualPaymentTransaction" (previous name kept as an alias)
- class "CollateralAppraisal" → "CollateralValueAsOfDate" (previous name kept as an alias)

### Turn 136 — assistant

I’ve renamed **PaymentTransaction → IndividualPaymentTransaction** and **CollateralAppraisal → CollateralValueAsOfDate**. Their previous names remain aliases; the other three names stay.

For the final four classes, are these your terms, or should any be renamed?

1. `CombinedLoanToValueRatio`
2. `Interest`
3. `Principal`
4. `BorrowingCapacityAssessment`

### Turn 137 — user

The first three can stay: **combined loan-to-value ratio**, **interest**, and **principal**.

I’d shorten **borrowing capacity assessment** to **borrowing capacity**. It still means the borrower’s assessed ability to repay, not the available amount under a facility.

### Turn 137 — assistant

**Tool call: `rename_ontology_elements`**

```
{
  "renames": [
    {
      "kind": "class",
      "from": "BorrowingCapacityAssessment",
      "to": "BorrowingCapacity",
      "className": "",
      "source": "",
      "target": "",
      "reverse": false
    }
  ]
}
```

### Turn 137 — tool

Renamed 1 of 1:
- class "BorrowingCapacityAssessment" → "BorrowingCapacity" (previous name kept as an alias)

### Turn 137 — assistant

**Tool call: `get_graph_state`**

```
{
  "finalValidation": false
}
```

### Turn 137 — tool

competency_questions:
  - id: cq1
    text: Who is the borrower for a loan or credit agreement?
  - id: cq2
    text: Who is the lender for a loan or credit agreement?
  - id: cq3
    text: What is the principal amount of a loan?
  - id: cq4
    text: What is the debt amount of a credit agreement?
  - id: cq5
    text: "What is a facility's credit limit?"
  - id: cq6
    text: What is the amount of credit extended under a facility?
  - id: cq7
    text: What is the available amount under a facility?
  - id: cq8
    text: What initial exchange date is stated in the terms?
  - id: cq9
    text: When does a loan or credit agreement mature?
  - id: cq10
    text: "What interest rate and rate type apply, and which variable-rate features apply?"
  - id: cq11
    text: What day-count convention governs interest calculation?
  - id: cq12
    text: When are interest calculations scheduled?
  - id: cq13
    text: "What do the interest payment terms require, and what due dates appear on the interest payment schedule?"
  - id: cq14
    text: "How much interest is accrued but unpaid, as of what date?"
  - id: cq15
    text: "For a variable rate, what event sets the initial rate, and what schedule covers later resets?"
  - id: cq16
    text: What do the principal repayment terms require?
  - id: cq17
    text: "Which loan payment, amortization, principal payment, and interest payment schedules are required and on file for this deal?"
  - id: cq18
    text: "Is the loan secured, and is it backed by pledged collateral or a third-party guarantee?"
  - id: cq19
    text: "If collateral is pledged, what collateral is linked to the loan?"
  - id: cq20
    text: What security agreement grants an interest in the pledged collateral linked to the loan?
  - id: cq21
    text: "Who services the loan and collects principal and interest payments on the lender's behalf?"
  - id: cq22
    text: "For a collateralized loan, what are the collateral's appraised value and as-of date, and what loan-to-value and combined loan-to-value ratios are recorded?"
  - id: cq23
    text: What borrowing capacity has been assessed for this borrower?
  - id: cq24
    text: "If a credit facility is divided, which sub-facilities make up this credit facility?"
  - id: cq25
    text: What are the loan balance and outstanding principal amount?
classes:
  Loan:
    meaning: "Money or credit extended to a borrower, to be repaid under the agreed terms."
    aliases: []
    properties:
      principalAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
      interestRateCap:
        type: number
      firstRateChangeTermMonths:
        type: number
        unit: months
      securityClassification:
        type: text
      loanBalance:
        type: number
  CreditAgreement:
    meaning: "An agreement under which a borrower receives value and generally agrees to repay it by a future date, usually with interest."
    aliases: []
    properties:
      debtAmount:
        type: number
      initialExchangeDate:
        type: date
      maturityDate:
        type: date
  CreditFacility:
    meaning: A credit agreement that lets the borrower draw funds over time rather than apply for a new loan each time.
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
    meaning: "The party obliged to repay what was borrowed, with interest and applicable fees, under the agreement."
    aliases: []
    properties: {}
  Lender:
    meaning: "The party that extends money or credit to the borrower expecting repayment, usually with interest."
    aliases: []
    properties: {}
  InterestPaymentTerms:
    meaning: "The agreed requirements for paying interest, including the accrual basis and payment timing."
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
      interestPaymentDay:
        type: text
      compoundingFrequency:
        type: text
  InterestCalculationSchedule:
    meaning: The contract-specific schedule of dates on which interest is calculated.
    aliases: []
    properties: {}
  InterestPaymentSchedule:
    meaning: The contract-specific schedule of dates on which interest is due.
    aliases: []
    properties: {}
  PrincipalRepaymentTerms:
    meaning: The agreed requirements for repaying principal.
    aliases: []
    properties:
      coversPrepayment:
        type: boolean
      prepaymentPenaltyTermMonths:
        type: number
        unit: months
      initialPrincipalPaymentDate:
        type: date
      principalRepaymentDate:
        type: date
      principalPaymentFrequency:
        type: text
      principalPaymentDay:
        type: text
  LoanPaymentSchedule:
    meaning: The regular or explicitly dated payment schedule associated with a particular loan.
    aliases: []
    properties: {}
  DayCountConvention:
    meaning: The convention used to count days when calculating accrued interest.
    aliases: []
    properties: {}
  PrincipalPaymentSchedule:
    meaning: The contract-specific schedule showing when some or all of the principal is due to be repaid.
    aliases: []
    properties: {}
  AmortizationSchedule:
    meaning: The schedule of periodic payments showing how the debt balance changes over time.
    aliases: []
    properties: {}
  InterestRate:
    meaning: The rate used to charge interest on the loan; it may be fixed or variable.
    aliases: []
    properties:
      rate:
        type: number
      rateKind:
        type: text
        allowed:
          - fixed
          - variable
          - floating
          - managed
  InterestRateSettingEvent:
    meaning: "The event at which the loan's initial rate is established, distinct from a later reset."
    aliases:
      - InitialInterestRateSettingEvent
    properties: {}
  InterestRateResetSchedule:
    meaning: The schedule of dates when a rate reset and the resulting rate are recalculated.
    aliases:
      - rate reset schedule
    properties: {}
  AccruedInterest:
    meaning: "Interest incurred but not yet paid, stated as an amount as of a particular date."
    aliases: []
    properties:
      amount:
        type: number
      asOfDate:
        type: date
  Collateral:
    meaning: An asset pledged as security for repayment of an obligation.
    aliases: []
    properties: {}
  SecurityAgreement:
    meaning: An agreement that grants a financial interest in pledged collateral and sets out rights and duties concerning that asset.
    aliases: []
    properties: {}
  Servicer:
    meaning: "The party that collects principal and interest payments on the lender's behalf."
    aliases: []
    properties: {}
  PaymentHistory:
    meaning: "The record of payments actually made toward the borrower's repayment obligation."
    aliases: []
    properties: {}
  IndividualPaymentTransaction:
    meaning: "An actual payment toward the debt, of principal, interest, fees, or another related amount, that forms part of the payment history."
    aliases:
      - individual payment
      - PaymentTransaction
    properties: {}
  SubFacility:
    meaning: "A portion of a credit facility made available for a particular purpose, sometimes under its own schedule."
    aliases: []
    properties: {}
  CollateralValueAsOfDate:
    meaning: "The collateral's appraised value as of a specified date."
    aliases:
      - dated collateral value
      - collateral value as of a date
      - CollateralAppraisal
    properties:
      value:
        type: number
      asOfDate:
        type: date
  LoanToValueRatio:
    meaning: "This loan's principal as a percentage of the appraised value of the asset securing it."
    aliases:
      - LTV
    properties:
      ratio:
        type: number
  CombinedLoanToValueRatio:
    meaning: Total debt secured by the asset or assets as a percentage of their appraised value.
    aliases: []
    properties:
      ratio:
        type: number
  Interest:
    meaning: "The cost the borrower pays for using the credit, expressed as a rate over time and distinct from principal."
    aliases: []
    properties: {}
  Principal:
    meaning: "The amount of the debt that must be repaid, separate from interest."
    aliases: []
    properties:
      outstandingAmount:
        type: number
  BorrowingCapacity:
    meaning: "The lender's assessment, at a point in time, of the upper amount the borrower can repay when due; it is not the facility's available amount."
    aliases:
      - borrowing capacity
      - BorrowingCapacityAssessment
    properties:
      amount:
        type: number
relationships:
  - name: hasBorrower
    from: Loan
    to: Borrower
    meaning: The party obliged to repay under this loan.
    aliases: []
  - name: hasLender
    from: Loan
    to: Lender
    meaning: The party extending credit under this loan.
    aliases: []
  - name: hasBorrower
    from: CreditAgreement
    to: Borrower
    meaning: The party obliged to repay under this credit agreement.
    aliases: []
  - name: hasLender
    from: CreditAgreement
    to: Lender
    meaning: The party extending credit under this credit agreement.
    aliases: []
  - name: hasBorrower
    from: CreditFacility
    to: Borrower
    meaning: The party allowed to draw funds under this credit facility.
    aliases: []
  - name: hasLender
    from: CreditFacility
    to: Lender
    meaning: The party providing this credit facility.
    aliases: []
  - name: hasSubFacility
    from: CreditFacility
    to: SubFacility
    meaning: A credit facility has sub-facilities that form portions of it when it is divided.
    aliases: []
  - name: hasInterestRate
    from: Loan
    to: InterestRate
    meaning: The rate used to charge interest on this loan when it bears interest.
    aliases: []
  - name: hasInterestCalculationSchedule
    from: Loan
    to: InterestCalculationSchedule
    meaning: The associated schedule specifying dates when interest is calculated for this loan
    aliases: []
  - name: hasInterestPaymentSchedule
    from: Loan
    to: InterestPaymentSchedule
    meaning: The associated schedule specifying dates when interest is due for this loan
    aliases: []
  - name: hasAccrualBasis
    from: InterestPaymentTerms
    to: DayCountConvention
    meaning: These terms have the day-count convention used as their accrual basis.
    aliases: []
  - name: hasInterest
    from: Loan
    to: Interest
    meaning: The loan has interest owed for using the credit.
    aliases: []
  - name: governsPaymentOf
    from: InterestPaymentTerms
    to: Interest
    meaning: These terms govern payment of the interest owed under the loan.
    aliases: []
  - name: hasInitialInterestRateSettingEvent
    from: Loan
    to: InterestRateSettingEvent
    meaning: "The event establishing this loan's initial interest rate when applicable"
    aliases: []
  - name: hasInterestRateResetSchedule
    from: Loan
    to: InterestRateResetSchedule
    meaning: The schedule associated with this loan for later rate resets when applicable.
    aliases:
      - has a reset schedule
  - name: hasLoanPaymentSchedule
    from: Loan
    to: LoanPaymentSchedule
    meaning: The loan has an associated overall payment schedule when applicable and on file.
    aliases: []
  - name: hasPrincipalPaymentSchedule
    from: Loan
    to: PrincipalPaymentSchedule
    meaning: The loan has a schedule of principal due dates when applicable and on file.
    aliases: []
  - name: hasAmortizationSchedule
    from: Loan
    to: AmortizationSchedule
    meaning: The loan has an applicable schedule of periodic payments and resulting balance changes when on file.
    aliases: []
  - name: hasPrincipal
    from: Loan
    to: Principal
    meaning: The loan has a principal repayment obligation
    aliases: []
  - name: governsPaymentOf
    from: PrincipalRepaymentTerms
    to: Principal
    meaning: "These terms govern payment of the loan's principal."
    aliases: []
  - name: servicedBy
    from: Loan
    to: Servicer
    meaning: "The loan is serviced by the party collecting principal and interest payments on its lender's behalf."
    aliases: []
  - name: collateralizedBy
    from: Loan
    to: Collateral
    meaning: A secured loan is collateralized by this pledged asset when collateral backs it; this does not apply to a guarantee-backed loan without pledged collateral.
    aliases:
      - backed by pledged collateral
  - name: secures
    from: SecurityAgreement
    to: Collateral
    meaning: The security agreement secures this pledged collateral by granting a financial interest in it.
    aliases: []
  - name: hasCollateralValueAsOfDate
    from: Collateral
    to: CollateralValueAsOfDate
    meaning: The collateral has this recorded appraised value together with its as-of date when one is available.
    aliases:
      - hasDatedAppraisedValue
  - name: hasPaymentHistory
    from: Loan
    to: PaymentHistory
    meaning: The loan has a history of payments actually made toward its repayment obligation.
    aliases: []
  - name: hasIndividualPayments
    from: PaymentHistory
    to: IndividualPaymentTransaction
    meaning: The history has individual actual payment transactions making it up
    aliases: []
  - name: hasLoanToValueRatio
    from: Loan
    to: LoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasCombinedLoanToValueRatio
    from: Loan
    to: CombinedLoanToValueRatio
    meaning: A loan treated as collateralized by borrower-provided collateral has this recorded combined loan-to-value ratio when one is available; this link does not apply to unsecured or guarantee-backed loans.
    aliases: []
  - name: hasBorrowingCapacity
    from: Borrower
    to: BorrowingCapacity
    meaning: The borrower has an assessment of its capacity to repay when due.
    aliases:
      - hasBorrowingCapacityAssessment
rules:
  loanReadiness:
    conditions:
      - The loan has a confirmed hasBorrower link to its borrower and a confirmed hasLender link to its lender.
      - "If the loan has a confirmed hasInterest link or hasInterestRate link, establish its applicable hasInterestRate link and the InterestPaymentTerms whose governsPaymentOf link reaches the Interest linked by this loan's hasInterest link."
      - "If whether interest applies cannot be established, leave the interest portion of readiness unresolved; missing interest or rate links do not prove an interest-free loan."
  securedLoanCollateralSupport:
    conditions:
      - "Establish that the loan is secured from its securityClassification when supported by the deal record, or from a verified collateralizedBy link to pledged Collateral; missing classification does not mean unsecured."
      - "For a loan established as secured, the collateral-link check passes only if its collateralizedBy link to the correct pledged Collateral is verified."
      - A guarantee-only secured loan without a pledged Collateral link does not pass this collateral-link check; this does not invalidate its guarantee or imply it is unsecured.
      - "If secured status cannot be established, leave applicability unresolved rather than treating the loan as unsecured."
  variableRateSetup:
    conditions:
      - "The loan's hasInterestRate link identifies an InterestRate with rateKind variable, floating, or managed."
      - The same loan has a confirmed hasInterestRateResetSchedule link to its later InterestRateResetSchedule; its initial interest-rate-setting event is not a substitute.
      - "If rateKind is unknown, applicability and the result remain unresolved rather than assuming a fixed rate."
  paymentRecordCompleteness:
    conditions:
      - "Verify the loan's hasPaymentHistory link points to the correct PaymentHistory for that loan."
      - Verify that same PaymentHistory has at least one correctly attributed PaymentTransaction through hasIndividualPayments.
      - A missing or incorrectly attributed history or individual payment does not pass; do not assess timeliness or whether the borrower is current.
  prepaymentPenaltyTiming:
    conditions:
      - "Identify the Principal linked by this loan's hasPrincipal and PrincipalRepaymentTerms whose governsPaymentOf link reaches that same Principal."
      - Confirm those governing PrincipalRepaymentTerms have coversPrepayment true.
      - Inspect those terms for reliable evidence that a penalty applies; coversPrepayment alone does not establish a penalty.
      - "Only when penalty applicability is established, confirm penaltyPeriodMonths is recorded on those same terms; missing is not zero or proof of no penalty."
      - "If penalty applicability cannot be established, leave the review unresolved."
actions:
  assessLoanReadiness:
    input: Loan
    preconditions:
      - loanReadiness
    effect: "Return a pass, non-pass, or unresolved readiness result with references to the checked hasBorrower and hasLender links and, when interest applies, the hasInterestRate link and the hasInterest and governsPaymentOf path to the governing InterestPaymentTerms; do not change the loan."
    verification: "Confirm the reported result agrees with the inspected party links and, when applicable, the rate link and terms governing the same loan's Interest; report uncertainty about interest applicability as unresolved."
  verifySecuredLoanSupport:
    input: Loan
    preconditions:
      - securedLoanCollateralSupport
    effect: Return a collateral-link check result with references to securityClassification or the verified collateralizedBy evidence establishing security and the pledged Collateral link inspected; report unknown applicability as unresolved and do not change the loan.
    verification: Confirm the inspected collateralizedBy link identifies the correct pledged Collateral for a loan established as secured; a guarantee-only loan without that link does not pass this particular check.
  reviewVariableRateSetup:
    input: Loan
    preconditions:
      - variableRateSetup
    effect: "Return the variable-rate setup result with references to the linked InterestRate rateKind and the same loan's hasInterestRateResetSchedule link; do not change the loan."
    verification: "Confirm rateKind is variable, floating, or managed and that this same Loan links to its later InterestRateResetSchedule; if rate kind is unknown report unresolved, and do not substitute the initial event, cap, first-change term, or numericRate."
  reviewPaymentRecordCompleteness:
    input: Loan
    preconditions:
      - paymentRecordCompleteness
    effect: Return payment-record completeness result with references to the inspected hasPaymentHistory and hasIndividualPayments links and the history and individual transactions examined; do not change the loan.
    verification: "Check the loan links to its correct PaymentHistory and that history links to at least one correctly attributed actual PaymentTransaction; the link checks themselves verify the result, without judging timeliness or currentness."
  reviewPrepaymentTerms:
    input: Loan
    preconditions:
      - prepaymentPenaltyTiming
    effect: "Return the prepayment penalty timing review result with references to the loan's hasPrincipal link, PrincipalRepaymentTerms whose governsPaymentOf link targets that same Principal, and the penalty evidence and penaltyPeriodMonths inspected; leave unresolved if governing terms or applicability cannot be established; do not change the loan."
    verification: "Inspect the governing terms for coversPrepayment and evidence that a penalty applies, and only then check penaltyPeriodMonths on those same terms; these evidence checks themselves verify the result."


# CONSISTENCY CHECK — 6 outstanding problem(s) in the whole model:
#   [warning] unknown-property-reference — Rule "prepaymentPenaltyTiming" (condition 4) refers to "penaltyPeriodMonths", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "reviewPrepaymentTerms" (effect) refers to "penaltyPeriodMonths", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "reviewPrepaymentTerms" (verification) refers to "penaltyPeriodMonths", which is not a property, relationship, class, rule or action in this model.
#   [warning] unknown-property-reference — Action "reviewVariableRateSetup" (verification) refers to "numericRate", which is not a property, relationship, class, rule or action in this model.
#   [warning] unreachable-from-action-input — Action "assessLoanReadiness" has input class Loan, and its precondition loanReadiness refers to InterestPaymentTerms, which is only reachable against the direction of the relationships between them.
#   [warning] unreachable-from-action-input — Action "reviewPrepaymentTerms" has input class Loan, and its precondition prepaymentPenaltyTiming refers to PrincipalRepaymentTerms, which is only reachable against the direction of the relationships between them.

### Turn 137 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "rules:\n  prepaymentPenaltyTiming:\n    conditions:\n      - Identify the Principal linked by this loan's hasPrincipal and PrincipalRepaymentTerms whose governsPaymentOf link reaches that same Principal.\n      - Confirm those governing PrincipalRepaymentTerms have coversPrepayment true.\n      - Inspect those terms for reliable evidence that a penalty applies; coversPrepayment alone does not establish a penalty.\n      - Only when penalty applicability is established, confirm prepaymentPenaltyTermMonths is recorded on those same terms; missing is not zero or proof of no penalty.\n      - If penalty applicability cannot be established, leave the review unresolved.\nactions:\n  reviewVariableRateSetup:\n    input: Loan\n    preconditions: [variableRateSetup]\n    effect: Return the variable-rate setup result with references to the linked InterestRate rateKind and the same loan's hasInterestRateResetSchedule link; do not change the loan.\n    verification: Confirm rateKind is variable, floating, or managed and that this same Loan links to its later InterestRateResetSchedule; if rate kind is unknown report unresolved, and do not substitute the initial event, cap, first-change term, or rate.\n  reviewPrepaymentTerms:\n    input: Loan\n    preconditions: [prepaymentPenaltyTiming]\n    effect: Return the prepayment penalty timing review result with references to the loan's hasPrincipal link, PrincipalRepaymentTerms whose governsPaymentOf link targets that same Principal, and the penalty evidence and prepaymentPenaltyTermMonths inspected; leave unresolved if governing terms or applicability cannot be established; do not change the loan.\n    verification: Inspect the governing terms for coversPrepayment and evidence that a penalty applies, and only then check prepaymentPenaltyTermMonths on those same terms; these evidence checks themselves verify the result."
}
```

### Turn 137 — tool

Applied. Added 0, updated 3 existing item(s).

CONSISTENCY CHECK — no new problems from this edit.
2 pre-existing problem(s) remain unresolved (not from this edit).

### Turn 137 — assistant

The naming pass is complete. I updated the rule and action text that still used old property names; the two previously identified governing-terms navigation warnings remain unresolved. No elements were added or removed.

NAMING LEDGER: relationships_renamed=2; relationships_redirected=0; properties_renamed=11; classes_renamed=4
