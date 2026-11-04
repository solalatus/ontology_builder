# Manual spot-check — ePO eOrdering translation

Human-style evidence supplementing the automated QA suite (issue #103).
Full structured data is in `manual-spot-check.json`; this file is the
readable summary.

## Round 1 (2026-11-04) — 9/10 accept, 1/10 reject (corrected)

**Reviewer:** coding agent (Claude subagent), in-session. **Not yet
reviewed by the repo owner.** Every earlier domain's round was reviewed by
the owner with the agent; this one still needs that review before it
counts as accepted on the same terms.
**Artefact definition:** every individually source-mapped element in
`translation.json`'s `mappings` list — classes, class properties,
relationships, rules, actions (104 total at sampling time, across the two
source files). Competency questions excluded, same convention as every
prior domain.

## Sampling method

Stratified by artefact type, proportional allocation (largest remainder),
seed fixed at `6` (the sixth benchmark domain; unlike #106-#110 this domain
has no GitHub issue number to use as the seed).

| Type | Population | Sampled |
|---|---|---|
| classes | 25 | 2 |
| properties | 38 | 4 |
| relationships | 26 | 2 |
| rules | 8 | 1 |
| actions | 7 | 1 |
| **Total** | **104** | **10 (9.6%)** |

## Result: 9 accept, 1 reject (corrected 2026-11-04)

All 10 sampled items were checked against a freshly regenerated
`source_ir.json` (parsed straight from the two checksum-pinned files in
`source/`). Eight are direct: the meaning restates the source definition,
or the property/relationship has a real `rdfs:domain`/`rdfs:range` in
`eOrdering_restrictions.ttl` that matches the model.

- **`classes.OrderResponse`**, **`classes.Consignee`** — accepted.
  Meanings are near-verbatim condensations of the source definitions.
- **`classes.OrderLine.properties.price`** — accepted. `hasPrice` has
  domain OrderLine and range Price (an ePO-core class outside this
  module), flattened to a number with unit "monetary value". This is the
  same accepted simplification of a structured value as in fibo-loans and
  iof-supply-chain.
- **`classes.DeliveryInformation.properties.shippingMark`**,
  **`classes.AllowanceChargeInformation.properties.vatExemptionReason`**,
  **`classes.AllowanceChargeInformation.properties.allowanceChargeReasonDescription`**
  — accepted. Each is a real datatype property whose domain is the host
  class, typed as text to match its plain-literal range.
- **`relationships[13]`** (`OrderResponseInformation isSpecificToOrderResponseLine OrderResponseLine`)
  and **`relationships[5]`** (`Order specifiesInvoicee Invoicee`) —
  accepted. Direct object properties with both endpoints in the model.
- **`actions.submitOrderResponse`** — accepted. Effect and verification
  restate `isSubmittedForOrder` (range Order).
- **`rules.taxInformationShouldBePresentWhenResponsePricingIsQualified`**
  — **rejected (corrected; first recorded as "accepted, flagged").** The
  original note below said both conditions use links the source has on
  OrderResponseInformation. That is false: `hasTaxInformation`'s domain is
  an `owl:unionOf` without OrderResponseInformation, and no source property
  links OrderResponseInformation to AllowanceInformation. Repair round 2
  dropped the rule and replaced both links (see Round 2). Original note, kept
  for the record: "Both conditions use links the source really
  has on OrderResponseInformation (`hasTaxInformation`,
  `hasAllowanceInformation`, restriction-grounded). The normative part
  (tax details expected when allowances qualify the pricing) is cited as
  "standard domain practice" at medium confidence, not source text. This
  is the same disclosed standard-practice category accepted in
  iof-supply-chain round 2 (S8). Judges: 4/5 supported in the first
  evaluation; not contested in the final one.

## Defects found and fixed before sampling (not in the sample)

One `repair.py` round on run-1 (3 items, 0.0158 USD):

1. **`classes.Order.properties.totalLineAmount`** — majority-unsupported
   (3/3) in the first official evaluation. The judges read only the
   definition text ("overall Monetary Value of the Line"), but the
   property's `rdfs:domain` is Order. The repair batch's source context
   was given each cited property's real domain and range from
   `source_ir.json`; `repair.py` **regrounded** it (kept, evidence now
   cites the domain).
2. **`classes.OrderResponse.properties.submittedForOrder`** and
3. **`classes.OrderResponseLine.properties.submittedForOrderLine`** —
   found by manual reading (judged partially_supported, so no gate
   flagged them). Text properties that encode the same link as the
   relationships `isSubmittedForOrder`/`isSubmittedForOrderLine` already
   in the model. Added to the same hand-built repair batch (the #108
   round-2 precedent); `repair.py` **dropped** both.

## Non-hard-gate findings

- `referential_consistency` (report-only): 1 issue, the known
  false-positive shape (the word "quantity" in
  `rules.orderLineRequiresQuantity` is matched against Order, which has no
  `quantity` property; the rule is about OrderLine, which does).
- `translation_stability` (report-only): relationships F1 = 0.39. Run-2
  produced only 12 relationships against run-1's 26 (run-3: 24); class F1
  is 1.00 and property F1 0.96. This reflects how differently the three
  runs chose to spell relationships, not a correctness signal.
- Final evaluation: 3 contested semantic items
  (`DeliveryInformation.deliveryPeriod`, `Order.validityPeriod`,
  `OrderLine.accountingCost`), all majority-supported. 0 contested
  exclusions.

## Round 2 (2026-11-04) — 9/9 accept, 0/9 reject

**Reviewer:** coding agent (Claude subagent), in-session. **Not yet reviewed by the repo owner.**
**Candidate:** the round-2 gold, `reference.domain.yaml` sha256 `ecd6fe08…`, which every run was scored against.
**Why round 2:** expanding the source's `owl:unionOf` domains showed four round-1 defects that neither the compiler nor the judges could see: two links with a wrong or missing source, the rule above built on them, and two correct items cited only as "standard practice". Repair round 2 fixed them: [9] and `AllowanceInformation.percentage` regrounded; the OrderResponseInformation→AllowanceInformation link replaced by `Order specifiesAllowanceInformation AllowanceInformation`; the OrderResponseInformation→TaxInformation link replaced by `AllowanceChargeInformation hasTaxInformation TaxInformation`; the rule dropped.

**Sampling:** stratified, largest remainder, seed 7, round-1 paths excluded. 9 of 94: 2 classes, 3 properties, 2 relationships, 1 rule, 1 action.

All 9 accepted. Each restates the source definition or matches a real domain/range once unions are expanded:
- `classes.OrderCancellationConfirmation`, `classes.DeliveryInformation`;
- `Order.totalTaxInclusiveAmount`, `DeliveryAgreement.generalDeliveryTerm`, `DeliveryAgreement.partialDeliveryAllowed`;
- `relationships[2]` (OrderChange hasLine OrderChangeLine), `relationships[12]` (OrderResponse specifiesOrderResponseInformation);
- `rules.orderChangeMustReferenceOrder`;
- `actions.submitOrderCancellation` (`isSubmittedForOrder`'s union domain includes OrderChange and OrderCancellation).

Drawn and reviewed before the runs. Written here after the runs, because the folder was frozen for them; the gold itself was not changed.

**Known, kept:** `relationships[17]` OrderLine hasPriceDiscountInformation AllowanceInformation is a disclosed two-step shortcut through the out-of-module Price class. Three properties (`hasStatus`, `hasAmount`, `isCalculatedOn`) stay excluded with an inaccurate "unnamed domain" reason. That comes from the `extract.py` unionOf limitation, fixed after the runs; see `translation-report.md`.
