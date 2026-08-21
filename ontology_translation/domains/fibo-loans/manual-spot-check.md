# Manual spot-check — FIBO Loans translation

Human evidence supplementing the automated QA suite (issue #103), done
in-session. Full structured data is in `manual-spot-check.json`; this file
is the readable summary.

## Round 1 (2026-08-21) — 15/15 accept, 0/15 reject

**Reviewer:** repo owner (szablevi@gmail.com), in-session with the coding agent
**Artefact definition:** every individually source-mapped element in
`translation.json`'s `mappings` list — classes, class properties,
relationships, rules, actions (149 total at sampling time, across the two
source files). Competency questions excluded, same convention as every
prior domain.

## Sampling method

Stratified by artefact type, proportional allocation (largest remainder),
seed fixed at `110` (matching this issue's number).

| Type | Population | Sampled |
|---|---|---|
| classes | 57 | 6 |
| properties | 49 | 5 |
| relationships | 31 | 3 |
| rules | 7 | 1 |
| actions | 5 | 0 |
| **Total** | **149** | **15 (10.1%)** |

## Result: 15 accept, 0 reject

All 15 sampled items checked out cleanly against a freshly regenerated
`source_ir.json` (parsed straight from the two real, checksum-pinned
source files). Most are direct, near-verbatim source-text grounding. Two
patterns worth calling out explicitly, both already-accepted risk
categories from Brick/IOF, not new fabrication:

- **`classes.AmortizationSchedule.properties.anticipatedNumberOfPayments`**
  (medium confidence) — the real datatype property
  `hasAnticipatedNumberOfPayments` exists and is genuinely defined, but
  carries no `rdfs:domain` (common in FIBO) and no `owl:Restriction`
  directly ties it to `AmortizationSchedule`. Honestly labeled medium
  confidence rather than claimed as a direct citation — the same
  standard-practice-pairing pattern already accepted repeatedly.
- **`relationships[17]`** (`SecurityAgreement secures Collateral`) — the
  real source property (`isCollateralizationOf`) runs the *opposite*
  direction (`Collateral -> SecurityAgreement`); the domain relationship
  is the same fact under a more natural name and direction, disclosed
  honestly in the mapping's own rationale rather than hidden. Same
  direction-flip-for-readability pattern already accepted on IOF Supply
  Chain.

## Known non-blocking findings, investigated on request

Before this round, the reviewer asked what the report's non-hard-gate
findings actually were and whether anything needed fixing. All three were
checked by hand against the real domain content:

1. **`referential_consistency`: 5 flagged issues, all confirmed false
   positives.** Every one is `actions.reviewVariableRateSetup`'s text
   ("...variable interest **rate**... interest **rate** reset
   schedule...") tripping the gate because `.rate` is a real property
   elsewhere in the domain (on `FixedInterestRate`/`VariableInterestRate`/
   `FloatingInterestRate`), even though it's ordinary English here, not a
   dangling reference. This is a documented, pre-existing limitation of
   the report-only heuristic (see `evaluate.py`'s own module comment on
   `referential_consistency_gate`): no purely mechanical check can fully
   separate "property name used as a reference" from "the same word used
   as ordinary English" without an LLM judge. Across all 3 domains done
   so far this gate has never once caught a real defect that the
   compiler/repair prompts' own now-hardened dropping-check didn't
   already prevent — left as-is rather than invest in an LLM-judged
   version of a diagnostic with a 0-for-3 real-finding record.
2. **`translation_stability` F1 (relationships=0.64, properties=0.67)** —
   measures cross-run agreement between 3 *independent* compiler runs,
   not correctness against source. FIBO's 3 runs picked meaningfully
   different class-set sizes (55/31/30 classes), which is expected on a
   larger, more open-ended source than IOF Maintenance's single small
   module — report-only by design, not actionable.
3. **4 contested `semantic_judging` items / 3 contested
   `disposition_judging` exclusions** — pulled every raw per-judge vote:
   all are majority `supported`/`justified`, with one or two judges
   landing on `partially_supported`/`partially_justified` instead.
   Ordinary judge-sampling variance already documented across Brick and
   IOF; no majority verdict was ever at risk.

## This domain's pipeline generalization work

Per this round's standing policy (fix the pipeline generally, never
overfit to one ontology, "we tomorrow ANY ontology can come, in ANY
form"): FIBO's own LOAN module declares `Loan`/`CreditFacility`/etc. in
one file but leaves `Borrower`/`Lender`/`Principal`/`Interest`/
`Collateral` declared only in a separate FBC file it imports — a real gap
in a pipeline that only ever supported one source file. Generalized
rather than special-cased: `source-manifest.yaml` gained optional
`extra_source_urls`/`extra_source_sha256` (any number of files, not just
two), `fetch.py` downloads and checksums each independently, `extract.py`
merges them into a single graph before extraction/scope-selection. Not
FIBO-specific — any ontology split across `owl:imports`-linked files
benefits. 20 new regression tests; full offline suite 291/291. This is
the first domain to actually exercise this new code path.

Also validated for free: `extract.py`'s naming-convention annotation-
predicate discovery (added for IOF Maintenance's `iof-av:` vocabulary)
picked up FIBO's own `cmns-av:explanatoryNote` predicate with zero
FIBO-specific code — direct evidence the earlier generalization actually
generalizes.

## Domain conversion itself

3 independent compiler runs; run-1 chosen (55 classes, 0 structural
errors/warnings, richest and squarely in the issue's 30-60 class target).
Two real fix passes via `reinstate.py`/`repair.py`: 2 of 3
judge-flagged unjustified exclusions reinstated (`Accrual`,
`InterestRateSettingEvent`); the third
(`CreditAgreementRepaidPeriodically`) correctly reground and kept
excluded (already represented via existing schedule/terms classes). A
fresh judging round then caught `reinstate.py`'s own new relationship
(`InterestPaymentTerms governsPaymentOf Accrual`) as unsupported;
`repair.py` correctly dropped it. Final: 57 classes / 31 relationships /
7 rules / 5 actions / 12 CQs, `hard_gates_ok: True`, 0 unsupported (4
contested), 0 unjustified exclusions, 100% provenance, 100% reverse
coverage, 100% CQ support, round-trip 0.906.

### Cost

~$1.49 (3 compiler runs) + ~$0.02 (reinstate) + ~$0.01 (repair) +
~$1.50 (two full official `evaluate.py` re-runs to confirm convergence
after each fix round) + $0 sample review (reused a freshly regenerated
`source_ir.json`).
