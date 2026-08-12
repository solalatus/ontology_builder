# `post-normalization-v2` — results and the final recommendation

Second and final condition of the post-interview structural normalization
experiment (issue #75). Pre-registration: `../../../POST_NORMALIZATION.md`
Part II, committed before the v2 normalizer was ever called. v1's result:
`../post-normalization-v1/REPORT.md`.

All tables regenerate offline with
`node tests/evals/analyze-post-normalization.mjs --condition=post-normalization-v2 run-01 run-02 run-03`.

---

## 0. Headline

**Recommendation: REJECT. Do not integrate post-interview structural
normalization.**

v2 added exactly two constraints to v1, each written against one of the two
causes v1's failure was traced to. The result was not a partial improvement. It
was a reversal:

| | v1 | v2 |
|---|---|---|
| Runs where the judge panel preferred the normalized model | **2 of 3** | **0 of 3** |
| Runs materially worse | 1 of 3 | **3 of 3** |
| Verdicts preferring the original | 8 of 24 | **20 of 24** |
| Aggregate relationship F1 vs. original | +0.0 | **−0.0** |
| Pre-registered criteria failed | 3, 5, 6 | **3, 5, 6, 7, 8** |

Both v1's wins disappeared and its main loss did not. Of the two constraints,
the one that was obeyed made things worse and the one that mattered was ignored.
Under the pre-registered rule (POST_NORMALIZATION.md §10) this is a REJECT, and
it is not the ambiguous kind.

---

## 1. Invariants

Unchanged from v1 and still enforced by the default test suite: production
interviewer prompt byte-identical in both languages, tool surface unchanged, no
normalization tool reachable from an interview, `index.html` untouched, no frozen
anchor artifact modified. v1 stays frozen at `a0f52cb0…`; v2 is `d0e35420…`.

The single-factor guarantee is mechanical: `lib/normalizerPromptV2.mjs`
constructs v2 by inserting its two constraints into v1's own string, and
`tests/post-normalization.spec.mjs` asserts that deleting the inserted block
reproduces v1 byte for byte. Same normalizer model (`gpt-5.4-2026-03-05`), same
three frozen runs, same judge prompt, same blinding salt — so a given
(run, judge) pair saw the same A/B assignment for both conditions.

---

## 2. The judge panel, widened to four

v1's outcome was decided by one run on a two-model panel. The panel is now
`gpt-5.6-sol`, `gpt-5.1`, `gpt-4.1-internal`, `o4-mini` — none of them the
normalizer's model — judged in both orderings: 24 verdicts per condition.

**Widening it did not change v1's result.** On all three runs the four-judge
outcome equals the pre-registered two-judge outcome:

| Run | v1, pre-registered panel | v1, full panel | v2, full panel |
|---|---|---|---|
| run-01 | normalized | **normalized** | **original** |
| run-02 | normalized | **normalized** | **original** |
| run-03 | original | **original** | **original** |

That is worth stating plainly: the endpoint held up. v1's result was not an
artefact of a thin panel, and v2's reversal is therefore a real difference
between the two prompts rather than panel noise.

Order-bias, v2: `gpt-4.1-internal` flipped on 3 of 3 runs, `o4-mini` 1 of 3,
`gpt-5.1` 1 of 3, `gpt-5.6-sol` 0 of 3. The two added judges are visibly noisier
than the original pair — worth knowing, and it does not rescue v2: the two
*stable* judges preferred the original in every single run.

Adverse findings across all 8 verdicts per run:

| Run | Material regressions (v2 / orig) | Unsupported additions (v2 / orig) | Competency loss (v2 / orig) |
|---|---|---|---|
| run-01 | 6/8 vs 3/8 | 0/8 vs 1/8 | 4/8 vs 2/8 |
| run-02 | 7/8 vs 3/8 | **7/8** vs 0/8 | 5/8 vs 3/8 |
| run-03 | 6/8 vs 2/8 | 2/8 vs 1/8 | **7/8** vs 0/8 |

---

## 3. What v2 actually did, run by run

Two changes or fewer per run — v2 is *more* conservative than v1 by volume, and
worse by outcome.

### run-01 — it pasted its own template placeholder over elicited content

v2's only change: `acknowledgeIncident`'s verification step became

```diff
- verification: Read the incident again and confirm acknowledged is true and status is acknowledged.
+ verification: how to confirm it worked
```

`how to confirm it worked` is the literal placeholder from the output-grammar
block in the normalizer's own prompt. Its manifest describes this as *"Removed
unsupported non-verification text from acknowledgeIncident"*.

This is not a modelling judgement anyone can disagree with. It is elicited
content destroyed and replaced with template boilerplate, and it passed the
grammar validator (still a legal string) and registered in the deterministic
diff only as `verification reworded`. Four of the eight verdicts named it
unprompted.

It also deleted, by omission, the one v1 change all four v1 verdicts had endorsed
— the split of the overloaded `escalatedTo` predicate.

### run-02 — constraint (a) obeyed, and the result was an invented, load-bearing edge

Constraint (a) told the reviewer to repair reachability by changing the graph
rather than by rewording a rule. It did exactly that: it added
`PostIncidentReview --about--> ITService` and made it a condition of
`canConductPostIncidentReview`.

Three of the four judges called the relationship an unsupported addition, and one
spelled out why the model did not need it:

> `PostIncidentReview —about→ ITService` was never established; the transcript
> explicitly supported finding service-related reviews through
> `PostIncidentReview —reviews→ Incident` and `Incident —affects→ ITService`.
> — gpt-5.6-sol

> Model B adds an unsupported Post-Incident Review→ITService relationship **and
> rule condition that would prevent valid reviews**.
> — o4-mini

So the invented edge is not inert: it is wired into a precondition, where it can
block a legitimate action. v1's failure was a rule asserting a path the graph did
not have; v2's is a graph asserting an edge the evidence did not have, load-bearing
in a rule. The second is worse.

**And v2 dropped v1's one verified hit.** v1 added `approved` to
`RegulatoryNotification.status`, because `canSendRegulatoryNotification` requires
that value — the exact contradiction this repository's own review of run-02
recorded at Turn 43. v2's candidate still has the rule requiring `approved` and
still has an allowed-value list without it. Its edits to that rule were cosmetic
("Regulatory Notification is about **the** Incident" → "**an** Incident").

### run-03 — constraint (b) ignored, verbatim, on the one case it was written for

Constraint (b), in the prompt v2 ran under:

> Where the one-directed-relationship-per-connection rule conflicts with a
> relationship the expert explicitly confirmed, keep the expert's relationship
> and change nothing. A relationship the expert confirmed is not an inverse
> duplicate to be removed.

v2 removed `MonitoringSystem → generates → Alert` anyway, and its manifest names
the reason the constraint prohibits: *"Removed MonitoringSystem -> generates ->
Alert **inverse duplicate**"*. It then also deleted a rule condition
(`canGeneratePostIncidentReview`'s "Incident has a Post-Incident Review record"),
which o4-mini flagged as breaking the action's precondition.

An explicit, single-purpose, one-sentence prohibition failed to take effect on
the single case in the corpus it was written for.

---

## 4. Deterministic metrics

Still almost nothing to see, and what there is now points the wrong way:

| Scope | Dimension | Original | v2 | Δ |
|---|---|---|---|---|
| Full domain | classes | 43.4 | 43.4 | +0.0 |
| Full domain | relationships | 9.9 | 9.8 | **−0.0** |
| Full domain | properties | 20.5 | 20.5 | +0.0 |
| Practical | relationships | 15.5 | 15.4 | **−0.0** |

Criteria 7 and 8 now fail, on a movement far too small to be a finding by itself.
The point stands from v1: recovery F1 cannot see this class of change. It saw
neither v1's genuine repair nor v2's destroyed verification step nor v2's
invented edge. **A structural review pass is not measurable by this scorer in
either direction**, which is exactly why the blind judge was pre-registered as
the primary endpoint.

---

## 5. What the pair of conditions shows

The two runs together are more informative than either alone, and they point one
way.

**1. The treatment is not robust to a minimal, principled prompt change.** Two
sentences — each written against a specific, diagnosed, unanimously-confirmed
defect — moved the result from 2-of-3 preferred to 0-of-3, and from one bad run
to three. A component whose output quality swings that far on that small an
edit is not ready to modify a model a user has already confirmed, whatever the
best version of it scores.

**2. Instructing the reviewer more precisely redirected the failure rather than
removing it.** Told not to fake a path in rule text, it invented an edge in the
graph instead and made it blocking. That is the same underlying failure —
asserting structure the evidence does not carry — expressed through whichever
channel remains open. The reviewer's evidence boundary is closed by construction:
it cannot ask the expert whether `PostIncidentReview` is really *about* a service.
When it meets a case the transcript does not settle, its instructions determine
*where* it guesses, not *whether*.

**3. The two constraints displaced v1's wins.** v2 lost both the verified
`approved` repair and the endorsed `escalatedTo` split, while gaining a template
placeholder pasted over elicited text. Prompt capacity spent on prohibitions
came out of the audit that was finding real defects. This is a general hazard for
"add a rule to fix the last failure" tuning, and it is visible here in one step.

**4. What survives is a real but narrow finding.** v1's run-02 hit is still the
best evidence in the whole experiment: a rule/value-set contradiction that
survived a 51-turn staged interview *and* its own Phase-9 validation, caught from
the transcript alone in one call. A **detector** for this class of defect is
worth something. What is not supported is a **rewriter** with authority to change
the model.

---

## 6. Cost

| | Calls | Tokens |
|---|---|---|
| v2 normalizer (`gpt-5.4-2026-03-05`) | 3 | 215,706 |
| v2 judge, four models × two orderings | 24 | 1,723,769 |
| v1 judge, twelve added cells for the widened panel | 12 | ~862,000 (est.) |
| **This phase** | **39** | **≈2.8M** |
| Whole experiment, v1 + v2, incl. discarded batches | **58** | **≈4.2M** |

No interview was ever re-run; the persona was never invoked. For scale, one
anchor interview alone is ~135 API calls.

---

## 7. Recommendation: **REJECT**

**Do not integrate post-interview structural normalization.** Neither as A1, A2
nor A3. Issue #75 can be closed as answered: the experiment it specifies was run,
twice, and the answer is negative.

This is not the ambiguous-tie-break kind of reject that
POST_NORMALIZATION.md §10 provides for. v2 fails five of the eight applicable
criteria, is materially worse in all three runs, and lost 20 of 24 blind
verdicts on a panel that had just been shown to reproduce v1's outcome exactly.

### The specific grounds

1. **Not robust.** Two sentences flipped the result completely (§5.1).
2. **Destroys elicited content.** run-01 replaced a real verification step with
   the prompt's own placeholder string, and no automated check caught it (§3).
3. **Invents load-bearing structure.** run-02 added an unsupported relationship
   and made it an action precondition (§3).
4. **Does not obey explicit prohibitions.** run-03 did the one thing its prompt
   forbade in as many words, on the one case that prompt was written for (§3).
5. **Unmeasurable by the existing scorer**, in either direction (§4), so no
   cheap automated guardrail exists for it.

### What would overturn this, if anyone wants to revisit it

Not a v3 prompt. The evidence says prompt-level tuning moves the failure rather
than removing it, and a third iteration on the same three transcripts would be
tuning against the corpus the result is measured on. What would actually change
the picture is a change of *role*:

* **A detector, not a rewriter.** The single durable result is v1/run-02: a
  cross-check between rules and the value sets, relationships and properties they
  reference found a real contradiction the interview missed. That check does not
  need an LLM's judgement about what the model *should* look like, and mostly
  does not need an LLM at all — "this rule requires a value this property does
  not allow", "this rule references a path from this action's input that the
  graph does not contain" are deterministic queries over the domain model. A
  lint pass that *reports* to the expert and changes nothing has none of the five
  failure modes above.
* **A held-out fixture (B5)** if the elicitation question is revisited at all.
  All six candidates here derive from the three transcripts the interviewer
  prompt was iterated against, and that remains the binding external-validity
  limitation for the whole eval program.

### For the #74/#80 session

The normalization motivation for preview mode is gone, but three findings from
this experiment survive it and should be carried in:

* **The Apply path is viable.** All six candidates validate against the app's
  grammar and round-trip through its real YAML import without losing a class,
  relationship, property, rule or action.
* **A graph-level preview is not sufficient.** Every damaging change in this
  experiment lived in rule conditions and action verification text. run-01's
  destroyed verification step is invisible in a before/after graph view and shows
  only at the details and raw-YAML levels. Whatever produces a candidate,
  the review dialog's rules/actions sections have to be first-class.
* **`lib/ontologyDiff.mjs` is reusable as-is.** Deterministic, no DOM, no ids,
  domain-model-document in and categorised changes out, with tests. It was
  written for #80's preview mode to call for a candidate the same way the
  shipped engine handles a history entry.

**Implementation stops here and waits for your explicit decision** (issue #75
§11).
