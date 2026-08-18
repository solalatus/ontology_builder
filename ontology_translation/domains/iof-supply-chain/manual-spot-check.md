# Manual spot-check — IOF Supply Chain translation

Human evidence supplementing the automated QA suite (issue #103), done
in-session. Full structured data is in `manual-spot-check.json`; this file
is the readable summary.

## Round 1 (2026-08-18) — 9/10 accept, 1/10 reject (fixed), pipeline hardened

**Reviewer:** repo owner (szablevi@gmail.com), in-session with the coding agent
**Artefact definition:** every individually source-mapped element in
`translation.json`'s `mappings` list — classes, class properties,
relationships, rules, actions (96 total at sampling time). Competency
questions excluded, same convention as Brick.

## Sampling method

Stratified by artefact type, proportional allocation, seed fixed at `109`
(matching this issue's number, same convention as Brick's seed `106`).

| Type | Population | Sampled |
|---|---|---|
| classes | 53 | 4 |
| properties | 3 | 1 |
| relationships | 30 | 3 |
| rules | 5 | 1 |
| actions | 5 | 1 |
| **Total** | **96** | **10 (10.4%)** |

## Result: 9 accept, 1 reject (fixed)

The agent presented all 10 with source vs. result, proactively flagging 3
as worth a closer look before the reviewer rated anything.

**S1 — `classes.Load` — accepted.** Flagged: bare source label "load", no
definition; meaning text ("traceable load unit prepared for handling or
transport") adds detail beyond the literal label. Reviewer accepted as
consistent with the same bare-label-plus-context pattern already accepted
on Brick (S5/S7 precedent).

**S4 — `classes.Retailer` — accepted.** Minor note only: bare label,
meaning ("sells goods to end customers") is common-word-sense grounding,
not source text. Same accepted pattern.

**S8 — `relationships[16]` (Shipment usesContainer FreightContainer) —
accepted.** Flagged: generic "standard domain practice" evidence, no
specific restriction connecting the two classes directly (unlike the
unflagged S6/S7 relationships in the same sample, which cite real
restrictions). Reviewer accepted as a legitimate, disclosed specialization
of the already-real `Shipment usesContainer Container` relationship
(`relationships[15]`) — the same class of reasonable standard-practice
inference `compiler-prompt.md` explicitly sanctions for relationship
endpoint pairs, not a fabrication.

**S5 — `classes.TrackingEvent.properties.eventType` — rejected, real
defect found and fixed.** Flagged: `allowed: [packed, shipped, arrived,
received, stored]`, justified only by generic "standard domain practice"
evidence citing 4 classes with zero real definitions among them — no
source text names any of these 5 specific words. Same defect family as
this domain's earlier-found and already-dropped `status` properties
(Carrier, Customer, Supplier, MaterialTradeItem, PurchaseOrder), which
independent judging had already found genuinely unsupported. This one
had passed automated judging in the final official run (0 unsupported)
— reviewer correctly identified this as LLM judge sampling variance
rather than genuine grounding, a pattern repeatedly observed and
documented this session (see `ontology_translation/TODO.md`).

## Made the fix principled, not another one-off patch

Reviewer's direction: *"fix S5, but in a principled way. the pipeline
should get better than before."* Rather than hand-dropping the one
flagged item, added a new elevated-evidence-bar rule to both
`compiler-prompt.md` and `repair-prompt.md`, modeled directly on the
existing composition-claims (`hasPart`) rule: **an `allowed` list's
specific value *strings* need their own source grounding (an `owl:oneOf`
enumeration, or values literally named in source text) — a property's
existence being standard practice does not, by itself, justify any
particular set of values.** When only the property's existence is
grounded, the correct shape is plain `type: text` with no `allowed` list,
not invented-but-plausible-sounding values.

The strengthened prompt was then used, via the real `repair.py` tool (not
a hand-edit), to fix `classes.TrackingEvent.properties.eventType` for
real: the model correctly kept the property (its existence is genuinely
supported — TrackingEvent legitimately needs *some* event-type field) and
dropped the invented `allowed` list, narrowing to plain `type: text`.
Re-verified with a full, real `evaluate.py` run: `hard_gates_ok: True`,
0 unsupported, 0 unjustified, all hard gates clean. Full test suite:
227/227 passing.

This is a general, domain-agnostic pipeline improvement — every future
domain's compiler and repair runs now carry this rule, not just IOF.
Broader robustness follow-up work (referential-consistency gate,
judge-stability improvements) tracked separately in #117.

### Cost

$0 sample review + ~$0.009 (targeted repair) + ~$1.57 (one full official
re-evaluate to confirm convergence).
