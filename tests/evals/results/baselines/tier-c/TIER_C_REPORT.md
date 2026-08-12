# Issue #89 — Tier C results and adjudication

Pre-registration: [`../../../TIER_C_EVAL.md`](../../../TIER_C_EVAL.md), committed
before the first call. Runner: [`../../../tier-c-eval.mjs`](../../../tier-c-eval.mjs).
Raw replies and provenance (model, prompt SHA-256, source SHA-256, usage) are in
the `*.json` / `*.raw.md` files beside this one.

**Recommendation: switch the Tier C default on — but by one finding, and the
margin is the story.** The pre-registered rule is met on both clauses. It is met
narrowly enough on the false-positive clause that the sensitivity analysis in §5
is not a footnote, and the final call is the maintainer's.

---

## 1. Headline numbers

59 findings over 9 finished ontologies, one call each, `gpt-5.4`.

| Category | Count | Share |
|---|---:|---:|
| `novel-true` | 34 | 58% |
| `duplicate` | 16 | 27% |
| `false` | 8 | 14% |
| `out-of-scope` | 1 | 2% |

Per model:

| Model | LLM | Det. | novel-true | duplicate | false | out-of-scope |
|---|---:|---:|---:|---:|---:|---:|
| anchor-run-01 | 6 | 6 | 1 | 3 | 2 | 0 |
| anchor-run-02 | 4 | 12 | 1 | 3 | 0 | 0 |
| anchor-run-03 | 3 | 9 | 1 | 2 | 0 | 0 |
| control-run-01 | 7 | 7 | 2 | 3 | 1 | 1 |
| control-run-02 | 13 | 11 | 10 | 2 | 1 | 0 |
| control-run-03 | 9 | 9 | 5 | 3 | 1 | 0 |
| treatment-run-01 | 5 | 1 | 4 | 0 | 1 | 0 |
| treatment-run-02 | 9 | 8 | 7 | 0 | 2 | 0 |
| treatment-run-03 | 3 | 2 | 3 | 0 | 0 | 0 |
| **total** | **59** | **65** | **34** | **16** | **8** | **1** |

Against the rule fixed in §4 of the pre-registration:

- *`novel-true` findings in a majority of models* — **9 of 9**. Not a majority, all of them.
- *`false` findings averaging below one per model* — **8 / 9 = 0.89**. Below one, by one finding.

Both clauses pass, so the rule says switch on. Note what "0.89" costs: reclassify
a single finding from `novel-true` to `false` and the average is 1.0 and the rule
fails. §5 names the findings where that is most likely.

## 2. The principle behind the adjudication

The Tier C prompt lists what counts, and its first item is broad:

> a rule that requires something the model cannot provide, an action whose
> verification cannot follow from its effect, two statements that cannot both
> hold, a relationship direction that makes a stated rule unusable

and then forbids reporting *missing content*. Most of the adjudication turns on
where that line falls, so it is stated once and applied uniformly:

> **`novel-true`** when the model cannot satisfy a demand it makes of itself —
> some rule condition, effect, or verification *states* a requirement the model
> has no way to represent.
> **`out-of-scope`** when the model merely lacks something no statement in it
> requires.

So "`MaterialityAssessment` has no timestamp" is out of scope on its own, and in
scope the moment a verification says *confirm the assessment record with the
result, timestamp and required documentation*. The model wrote the cheque; the
checker is pointing out there are no funds.

A reviewer who reads the prompt's first clause more narrowly — restricting
`novel-true` to contradictions between two positive statements, and calling
every unrepresentable-requirement finding a completeness gap — reaches a
different recommendation. §5 works that reading through.

## 3. What Tier C adds that Tier A/B structurally cannot

Four patterns account for nearly all 34, and none is reachable by the
deterministic checks as built:

**(a) Ungrounded status values (9 findings).** `value-not-allowed` compares a
required value against an `allowed` list. When a property has *no* `allowed`
list, there is nothing to compare and the check is silent by construction — yet
a rule requiring `RecoveryPlan status is approved` against a `status` with no
allowed values is exactly as broken. Tier C caught this in control-02 (L11),
control-03 (L2), treatment-01 (L5), treatment-02 (L4).

**(b) Prose values that never name their property (6 findings).** `canCloseIncident`
requiring *"an accepted residual condition"* or a post-incident review that is
*"scheduled"*, where the status enum has no such state. Tier A needs a
class-mention followed by a property-mention followed by a copula; these
conditions never name the property, so the span matcher never fires.
treatment-02 (L7), treatment-03 (L1, L3), control-02 (L2, L4).

**(c) Circular preconditions (3 findings).** A rule requires the very state its
action's effect produces: `declareMajorIncident` requiring an incident commander
already assigned while the effect assigns one (treatment-01 L1, anchor-02 L3
inverted), `canNotifyStakeholders` requiring the communication to have been sent
before the action that sends it (anchor-03 L1), `canConductPostIncidentReview`
requiring a review to be scheduled while the effect creates it (control-03 L3).
Nothing in the deterministic engine models temporal order, so this class is
invisible to it and always will be.

**(d) Unbound action inputs (2 findings).** `sendStakeholderCommunication` with
`input: Incident` whose effect sends *the* communication — no argument
determines which one (control-02 L5, control-03 L6). `unreachable-from-action-input`
checks whether the *class* is reachable; here it is, via `hasStakeholderCommunication`,
so the check passes while the action remains unexecutable as written.

One finding stands alone and is the best in the set: **treatment-02 L3** —
`requiresRegulatoryNotification` fires on outcome `reportable` *or*
`potentially-reportable`, while `canSubmitRegulatoryNotification` permits
submission only when `reportable`. A notification can therefore be mandatory in
a state where submitting it is forbidden. Two rules that cannot both be
satisfied, in different parts of the file, with no shared identifier to join on.
No deterministic check in this program's design space finds that.

Also worth recording: the 16 duplicates are all *correct*. Tier C never
contradicted a deterministic finding, it re-derived them — including
`value-not-allowed` on `canSendRegulatoryNotification` (anchor-02 L1), which is
the one Turn-43 defect the corpus documents by hand. That is the calibration
evidence §3 of the pre-registration hoped for.

## 4. Every finding, adjudicated

Deterministic findings are cited as `Dn`, LLM findings as `Ln`, numbered as they
appear in the run's JSON.

### anchor-run-01 — 1 novel-true, 3 duplicate, 2 false

| # | Verdict | Reasoning |
|---|---|---|
| L1 | `duplicate` | `isolateConfigurationItem` / `configurationItemIsolationRequired` unreachable from input — exactly D4. |
| L2 | `duplicate` | Same action/rule pair as D5 (`sendStakeholderCommunication` / `stakeholderCommunicationRequired`); D5 names `Change`, L2 names `Incident`, same defect. |
| L3 | `duplicate` | Same pair as D6 (`submitRegulatoryNotification` / `regulatoryNotificationRequired`). |
| L4 | **`false`** | Claims `postIncidentReviewRequired` is unevaluable from input `PostIncidentReview`. `PostIncidentReview --reviews--> Incident` is a forward edge; the incident is reachable. The deterministic check correctly stayed silent here. |
| L5 | **`false`** | Claims "no relationship from Incident to Backup". `Incident --restoredFrom--> Backup` exists, and `Incident --impacts--> ITService` reaches the impacted service. The premise is wrong. |
| L6 | `novel-true` | `isolateConfigurationItem` verification requires *"failure details in the incident record"*; the effect writes only `ConfigurationItem.isolationState`, and `Incident` has no such property. Verification cannot follow from effect. Tier B needs a named property on both halves and so cannot see it. |

### anchor-run-02 — 1 novel-true, 3 duplicate

| # | Verdict | Reasoning |
|---|---|---|
| L1 | `duplicate` | `canSendRegulatoryNotification` requires status `approved`, not in the allowed list — D1 verbatim, and the hand-documented Turn-43 defect. |
| L2 | `duplicate` | The same defect restated on the action that consumes the rule. |
| L3 | `novel-true` | `declareMajorIncident` verification requires an incident commander identified; the effect sets `majorIncidentDeclared` and nothing else. `managedBy` (Incident→IncidentCommander) exists but is never established by the effect. |
| L4 | `duplicate` | `executeEmergencyChange` verifies `executedAt`, effect never sets it — D4 verbatim. |

### anchor-run-03 — 1 novel-true, 2 duplicate

| # | Verdict | Reasoning |
|---|---|---|
| L1 | `novel-true` | `canNotifyStakeholders` condition 4 is *"Stakeholder Communication is sent to at least one Business Service Owner or Product Manager"* — a precondition of the action whose effect is to send it. Circular; no deterministic check models order. |
| L2 | `duplicate` | D5 verbatim. |
| L3 | `duplicate` | D9 verbatim. |

### control-run-01 — 2 novel-true, 3 duplicate, 1 false, 1 out-of-scope

| # | Verdict | Reasoning |
|---|---|---|
| L1 | `novel-true` | `canSubmitRegulatoryNotification` requires the notification to be *approved by the designated regulatory-reporting authority*. `RegulatoryNotification.status` can hold `approved`, but the only authority link is `Incident --hasRegulatoryReportingAuthority--> RegulatoryReportingAuthority`; nothing binds an approval to an authority. Stated requirement, unrepresentable. |
| L2 | **`false`** | Claims the associated incident "cannot be reached" because the edge is `RegulatoryNotification --reports--> Incident`. That is the direction the rule needs. Backwards. |
| L3 | `duplicate` | `executeEmergencyChange` verification refers to `Incident`, unreachable from input `Change` — D6. |
| L4 | `novel-true` | `conductMaterialityAssessment` verification requires *"the assessment record with the result, timestamp and required documentation"*; `MaterialityAssessment` has `status` and `rationale` only — no date property anywhere on the class. |
| L5 | **`out-of-scope`** | Observes that the effect records `submissionReceipt` but not `submittedAt`. The property exists and no verification asks for it, so nothing in the model fails. This is the "missing content" the prompt forbids. |
| L6 | `duplicate` | Same action and same verification sentence as D1 (`sendStakeholderCommunication`); D1 names the `sentAt` half, L6 the delivery half. A reader is sent to the same two sentences. |
| L7 | `duplicate` | `canCloseIncident` and `Evidence` — D4. |

### control-run-02 — 10 novel-true, 2 duplicate, 1 false

| # | Verdict | Reasoning |
|---|---|---|
| L1 | `novel-true` | `canDeclareMajorIncident` requires a commander *assigned and authorized*; the model has only `Incident --declaredBy--> IncidentCommander` and no property or relationship for assignment or authorization. |
| L2 | `novel-true` | `canCloseIncident` allows *"an accepted residual condition"*; `Service.healthState` allows healthy/degraded/partially-unavailable/unavailable/recovering/unknown. No such state, and nowhere else to put it. |
| L3 | `novel-true` | `closeIncident` verification says *"record the closure timestamp"*; `Incident` has `incidentId`, `status`, `severityLevel`, `majorIncidentDeclared`, `materialityAssessmentNeeded`. No date property at all. |
| L4 | `novel-true` | `canCloseIncident` requires *"all required StakeholderCommunication items … are complete"*; that status enum runs draft→withdrawn with no `complete`, and nothing marks a communication as required. |
| L5 | `novel-true` | `sendStakeholderCommunication` has `input: Incident`, effect *"The communication message is sent and timestamped"*. Nothing selects which communication. `unreachable-from-action-input` passes because the class is forward-reachable; the action is still unexecutable as written. |
| L6 | `novel-true` | The effect sets the communication to sent; `StakeholderCommunication.status` allows draft/pending-approval/approved/submitted/accepted/rejected/withdrawn — no `sent`. Tier A missed it because the effect never names the property. |
| L7 | `novel-true` | `canSendStakeholderCommunication` requires content matching *"the latest verified state of the Incident"*; no verified-state concept exists on `Incident`. |
| L8 | **`false`** | Claims no allowed `Change` status represents "implemented". `Change.status` includes `implemented` explicitly. |
| L9 | `novel-true` | `documentIncidentFindings` effect and verification both require findings and lessons learned on the incident record; `Incident` has no such property. |
| L10 | `duplicate` | D11 verbatim. |
| L11 | `novel-true` | `canInitiateBackupRestore` requires `RecoveryPlan status is approved`; `RecoveryPlan.status` has **no `allowed` list**, so `value-not-allowed` cannot fire by construction. The clearest example of the Tier A blind spot. |
| L12 | `novel-true` | `acknowledgeAlert` effect records an acknowledgment timestamp; `Alert` has exactly one property, `status`. |
| L13 | `duplicate` | D10 verbatim. |

### control-run-03 — 5 novel-true, 3 duplicate, 1 false

| # | Verdict | Reasoning |
|---|---|---|
| L1 | **`false`** | Claims the model "only provides IncidentCommander" for *"an incident commander or designated duty manager"*. The model has an `IncidentManager` class and a `hasIncidentManager` relationship. Whether that is the same role is a naming question, which the prompt puts out of bounds. |
| L2 | `novel-true` | `canCloseIncident` requires health state `healthy`; `ITService.healthState` has no `allowed` list. Same blind spot as control-02 L11. |
| L3 | `novel-true` | `canConductPostIncidentReview` requires a review already *scheduled* while the effect is what documents it — circular — and `PostIncidentReview.status` has no allowed values to express `scheduled`. |
| L4 | `novel-true` | `declareMajorIncident` verification requires communication records present; the effect says only that *"enhanced coordination and communication processes are initiated"* and creates nothing. |
| L5 | `duplicate` | D2 verbatim (`acknowledgeAlert` / `acknowledgementTime`). |
| L6 | `novel-true` | `sendStakeholderCommunication` has `input: Incident` while the rule is stated wholly over `Communication` properties and the effect updates a communication. Same unbound-input defect as control-02 L5. |
| L7 | `novel-true` | The same action's verification requires `deliveryStatus` to confirm delivery; the effect writes sent + `sentTime` only. `deliveryStatus` exists on `Communication` and is never written. D4 flags a different property (`Incident.status`) on this action, so this is an additional instance, not a restatement. |
| L8 | `duplicate` | Same action and verification sentence as D3 (`assignIncident` / `incidentType`). |
| L9 | `duplicate` | D7 verbatim. |

### treatment-run-01 — 4 novel-true, 1 false

| # | Verdict | Reasoning |
|---|---|---|
| L1 | `novel-true` | `canDeclareMajorIncident` requires *"An incident commander is assigned"*; `declareMajorIncident`'s effect ends *"and an incident commander is assigned"*. The precondition is the postcondition. |
| L2 | `novel-true` | `closeIncident` verification requires the closure timestamp *"recorded accurately"*; `Incident.closedAt` exists and the effect never writes it. |
| L3 | `novel-true` | `communicateIncidentStatus` verification requires the update *archived*; the effect says logged. `Communication.status` has `archived` and nothing reaches it. |
| L4 | **`false`** | Claims the effect fails to establish the Incident→MaterialityAssessment link. The effect reads *"A materiality assessment is conducted and documented **for the incident**"*, which states the association, and both directions of the relationship exist (that is D1's inverse-pair complaint). |
| L5 | `novel-true` | `canCloseIncident` requires all impacted IT services to have *"an acceptable status"*; `ITService.status` has no `allowed` list, so no status is defined as acceptable or otherwise. |

### treatment-run-02 — 7 novel-true, 2 false

| # | Verdict | Reasoning |
|---|---|---|
| L1 | `novel-true` | `declareMajorIncident` verification requires the incident commander recorded; the effect enumerates what it sets (`majorIncidentDeclared`, `majorIncidentDeclaredAt`, coordination cadence) and no commander link is among them. |
| L2 | `novel-true` | `sendStakeholderCommunication` verification requires *"the final message is archived"*; the effect enumerates status/sentAt/deliveryStatus. `archivedMessage` and status `archived` both exist and are never reached. |
| L3 | `novel-true` | **The strongest finding in the set.** `requiresRegulatoryNotification` triggers on outcome `reportable` *or* `potentially-reportable`; `canSubmitRegulatoryNotification` permits submission only when `reportable`. A notification is then mandatory and unsubmittable in the same state. Two rules, no shared identifier, no deterministic check can join them. |
| L4 | `novel-true` | `canCloseIncident` requires `healthy` healthState on `BusinessService`; that property has no `allowed` list. |
| L5 | **`false`** | Claims the model has no way to express *"the backup set protects the target configuration item"* because the relationship is called `restoresConfigurationItem`. The link exists; this is a naming objection, which the prompt excludes. |
| L6 | `novel-true` | `canRestoreBackup` requires *"the restore point is approved for restoration"*; `BackupSet.restorePoint` is free text with no approval state anywhere. |
| L7 | `novel-true` | `canCloseIncident` requires a review *scheduled or completed*; `PostIncidentReview.status` allows planned/in-progress/completed. `scheduled` is not representable. |
| L8 | `novel-true` | `executeEmergencyChange` verification requires implementation evidence recorded; the effect updates status only and creates no `Evidence`. |
| L9 | **`false`** | Claims the effect does not establish isolation. The effect's own sentence is *"The configuration item is isolated from defined networks or dependencies"*. Unlike L2, where the effect enumerated its writes and archiving was absent, here the effect asserts the state the verification checks. |

### treatment-run-03 — 3 novel-true

| # | Verdict | Reasoning |
|---|---|---|
| L1 | `novel-true` | `canCloseIncident` requires *"healthy or an accepted residual condition"*; `IT Service.healthState` has six allowed values and no residual-condition state. Tier A missed it because the condition says "services", which does not match the class name `IT Service`. |
| L2 | `novel-true` | `shouldStartRegulatoryNotificationWorkflow` requires the incident to *"meet the criteria for being reportable"*; `Materiality Assessment` has a single `completed` property and no outcome, so reportability is unrepresentable. |
| L3 | `novel-true` | The same rule requires a *scheduled* post-incident review; `Post-Incident Review.status` allows open/in-progress/completed/validated/closed. |

## 5. Sensitivity — where this could be wrong

The pre-registration says the adjudication is mine and not blind, and that a
`false` judgement is a judgement. Three places where a reasonable reviewer
lands elsewhere, and what each does to the recommendation:

**The narrow reading of the prompt.** If `novel-true` is restricted to
contradictions between two *positive* statements — excluding every
"rule requires what the model cannot represent" finding as a completeness gap —
then patterns (a) and (b) above, 15 findings, become `out-of-scope`. `novel-true`
drops to 19, still present in 8 of 9 models, and the rule still passes. The
recommendation survives this reading; the *size* of the win does not.

**The three near-misses.** `control-01 L1` (approval exists as a status but not
as an act by an authority), `control-03 L7` (a second property on an action Tier B
already flagged), and `control-01 L6` (called `duplicate`, defensibly `novel-true`).
The first two moving to `false` puts the false rate at 1.0 and 1.11 — **the rule
fails**. This is the single fragile point in the result and the reason §1 leads
with the margin rather than the verdict.

**Clustering.** Ten of the 34 come from one model, and three of those ten are
three different conditions of one rule (control-02 `canCloseIncident`). Counting
per rule rather than per condition gives 32, which changes nothing, but a reader
should know the findings are not independent draws.

**What is *not* in doubt:** the 8 `false` findings are all checkable against the
YAML in seconds, and every one is a wrong premise about a relationship direction
or an allowed-value list rather than a hallucinated entity. Tier C did not invent
classes, properties, or rules in any of the nine runs. That is the failure mode
#75 found when an LLM was given authority to rewrite, and it did not appear when
the same family of model was asked only to report.

## 6. What "switch on" means — and what it turned out not to mean

**Done.** `consistencyLlmEnabled()` (index.html) now reads
`localStorage.getItem(CONSISTENCY_LLM_STORAGE_KEY) !== "0"`: on unless the user
has explicitly turned it off, instead of off unless they have explicitly turned
it on. An explicit "off" persists across reloads, so the new default only
applies to a profile that has never chosen.

One correction to how this section originally read. It closed by weighing a
counter-argument — that switching on makes an outbound model call the default in
an app whose premise is a single offline file. Reading the code to make the
change shows that argument does not apply: this flag only decides whether the
**Run button is shown**. Nothing is sent until a connected user clicks it, and
one click is one call. An unconnected user sees a disabled button, not a
request. So "default on" here means "the second opinion is offered by default",
not "the app phones home by default", and the offline premise is untouched.
`consistency-checker.spec.mjs` now pins that directly: with the pass enabled,
opening and reopening the panel must produce zero requests.

Three constraints that this evaluation supports and that the change carries:

1. **Findings panel only, never the agent.** The #84 self-correction loop feeds
   the agent deterministic findings. Nothing here justifies extending that to
   Tier C: an LLM-generated finding sent to an LLM to fix, inside one turn, with
   a three-apply budget, is a failure mode this evaluation did not test.
2. **Marked as LLM-derived in the panel**, so a reader can weigh a `false` at the
   rate §1 measures. 14% is low enough to be useful and much too high to present
   as an equal to `value-not-allowed`.
3. **Still off when no key is connected**, and still one call per invocation —
   not per edit. Nothing here measured what Tier C costs when run continuously.

The counter-argument to switching on at all: it makes an outbound model call the
default in an app whose whole design premise is that it is a single offline file.
That is a product decision, not a measurement, and the measurement cannot settle
it. The evidence says the findings are worth reading. Whether they are worth a
default-on network call is the maintainer's call.
