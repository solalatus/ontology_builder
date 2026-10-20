# Paired stages inside one run: design note (pre-registration)

Issue #182, measuring #179 (coverage sweep), #180 (naming pass) and #181 Part 2 (`high` vs `medium`). Committed before the first paid run, as `ontology_translation/results/majority-vote/DESIGN.md` was for #174. The stage texts below are the exact ones the harness sends; `tests/paired-stages.spec.mjs` fails if this file and `tests/evals/lib/pairedStages.mjs` drift apart.

## Design

Each run is one interview with the shipped interviewer prompt (its golden hash is unchanged). When the interviewer first wraps up, the harness does not end the run:

1. **Snapshot A (control)**: the model as the interviewer left it at its own wrap-up.
2. **Coverage sweep (#179)**, injected as a message from the expert's side: the Phase 9 neighbourhood question for every class on the canvas, in batches of three to five, with two new categories (more specific or sibling kinds; properties confirmed on a sibling class). Each round ends with a `COVERAGE LEDGER` line. The classes a round added are swept in the next round. The sweep stops at the first round that adds no class, or after 3 rounds. If the sweep changed the model, one more message asks for the Phase 3 jointly-mentioned pair/path check and the Phase 10 checklist over the enlarged model (step 5 of #179); if it changed nothing, that step is skipped.
3. **Snapshot B**.
4. **Naming pass (#180)**: for every relationship, then property, then class on the canvas, in batches of three to five, the interviewer asks for the expert's own term and direction and records it with the rename tool. The pass ends with a `NAMING LEDGER` line.
5. **Snapshot C**; the run ends (`stoppedReason: stages_complete`).

Paired effects per run: sweep = B − A, naming = C − B, combined = C − A.

### When a stage ends

A stage ends at the first of these four signals:

- the interviewer's ledger line, detected without a model call;
- the completion classifier saying the interviewer has wrapped up;
- a two-sided sign-off (the pleasantry detector);
- the stage's turn cap: 45 turns per sweep round, 15 for the close-out, 45 for the naming pass.

A stage ended by its cap is recorded as `capped` in `provenance.json` (`stages.stagesCapped`) and reported, never treated as finished.

### Snapshots and scoring

- **What is saved.** Each snapshot is the app's own `buildDomainYamlExport()` at that moment. It is written to `snapshots/<A|B|C>/recovered-model.yaml` together with:
  - the turn it was taken at;
  - the elapsed time;
  - the running cost.
- **How every snapshot is scored.** The same way each time, on the same path as `rescore-saved-run.mjs`:
  - the model is read back from its YAML (`recoveredStateFromYaml`);
  - the heuristic scorer runs on the full domain and on the practical scope;
  - rules and actions are scored;
  - the semantic judge runs, and its verdicts are stored beside the snapshot.
- **Replay check.** The runner replays each snapshot offline once and records whether the replay reproduces the live numbers (`offlineRescoreAgrees`).
- **Scorer unchanged.** The scorer is the one at the commit recorded in `provenance.json`. If a scorer change lands mid-protocol, every snapshot is rescored offline and the report says so.

### Arms

| Block | Interviewer effort | Domains | Replicates | Runs |
|---|---|---|---|---|
| 1 | explicit `medium` | fibo-loans, brick-hvac | 3 each | 6 |
| 2 | explicit `high` | fibo-loans, brick-hvac | 3 each | 6 |

- **Order.** Block 1 runs before block 2. Within a block, runs alternate domain by domain: fibo-loans run-01, brick-hvac run-01, fibo-loans run-02, and so on.
- **Condition for block 2.** Block 2 runs only if block 1 completed cleanly: every run `stages_complete`, none over a cap.
- **Smoke run.** The first paid run is a smoke run. It is brick-hvac run-01 of block 1, and it measures the cached share, the cost and the time.
  - **It counts** as that replicate if nothing in the code or the settings below changes after it.
  - **Otherwise it is discarded** and re-run, and the report says so.

## Fixed for every run

| Setting | Value |
|---|---|
| Interviewer model | `gpt-6-sol` on the Azure OpenAI resource: the first rung of the #178 ladder (`gpt-6.1-sol`, then `gpt-6-sol`) that the resource serves; `gpt-6.1-sol` is not deployed there (deployment listing, 2026-10-20) |
| Interviewer route | the app's own: Chat Completions, with tool-carrying calls on the Responses API, which this model requires for function tools with an explicit effort (#183) |
| Interviewer effort | explicit `medium` (block 1) / explicit `high` (block 2), sent on every interviewer call and recorded as `reasoningEffort` |
| Persona, completion classifier, transcript review, semantic judge | `gpt-6-sol`, same deployment; no effort parameter (the provider default), identical in both blocks |
| Prompt caching | `prompt_cache_key` per connection (#176), measured per run as `cachedShare` |
| Wall clock | 120 minutes per run (see Deviations) |
| Turn limit | 300 (the wall clock is the binding limit) |
| One app turn may take | 600 s before the run counts as hung |
| Sweep rounds | at most 3 |
| Stage turn caps | 45 per sweep round, 15 close-out, 45 naming pass |
| Per-run cost cap | 30 USD (both the app's and the harness's calls, at the prices below), checked before every turn |
| Prices used for cost | 2.00 USD per million uncached input tokens, 0.20 cached, 10.00 output (reasoning tokens are output); Azure Global Standard list prices for `gpt-6-sol`, October 2026 |
| Budget for the whole protocol | the driver (`tests/evals/run-paired-stages.mjs`) stops before starting a run once 200 USD have been recorded as spent under `ontology_translation/results/paired-stages/` |
| Runs | one at a time, never in parallel |
| Scorer | `tests/evals/lib/recoveryMetrics.mjs` and `llmMatcher.mjs` at the recorded commit |

A run that hits the wall clock, the turn limit, the cost cap, or a stage cap is reported and not averaged in. The driver stops the block at the first run that does not end `stages_complete`, and the owner is asked before anything else is spent.

## Reported

Per domain, per snapshot, per block:

- class, relationship and property recall and precision, separately, and F1;
- the composite (heuristic, full domain and practical scope) with the semantic composite beside it;
- rules F1 and actions F1;
- controlled-value fidelity and the allowed-value-list count.

Operational, per run and per stage (from the snapshot timestamps and costs):

- turns, wall clock;
- prompt, cached and completion tokens, reasoning tokens, cached share, cost in USD;
- `get_graph_state`, apply, remove and rename calls, tool errors and skips;
- compaction events, leak events, `degraded`.

For the stages:

- the sweep's rounds, the classes each round added, and its ledgers (candidates surfaced, added, declined, open);
- the naming pass's renames as the app recorded them: relationships renamed, relationships turned round, properties renamed, classes renamed, renames refused.

Per-item recall attribution at A and C for every run, with the moves between them (`tests/evals/attribute-recall.mjs`, categories in `tests/evals/lib/recallAttribution.mjs`):

- recovered;
- endpoint class missing;
- other name;
- removed;
- mentioned, not committed;
- never mentioned.

## Pass criteria (from #182, unchanged)

- **#179**: B − A composite at least +0.05 on the mean of both domains, class precision at snapshot B at least 0.95, allowed-value-list count not down.
- **#180**: C − B relationship F1 or property F1 up by more than the within-block replicate stdev, relationship precision not down.
- **#181**: `high` becomes the shipped default if its snapshot A composite beats `medium`'s by more than the `medium` block's replicate stdev on both domains, with every run inside the cap; otherwise explicit `medium` stays.
- **Floors for everything**: composite not down, practical-scope composite not down, no run over the cap.

How these are computed (`tests/evals/analyze-paired-stages.mjs`, written before the first run):

- **Which block decides.** #179 and #180 are decided on block 1, as #182's arms table assigns them. Block 2 is reported against the same criteria, as the test of whether the gains hold at `high`.
- **Averages.** "Mean" is the mean over a domain's clean replicates. "The mean of both domains" is the mean of the two domain means. A paired difference (B − A, C − B) is computed per run, then averaged.
- **Standard deviations.** "The within-block replicate stdev" (#180) is the sample stdev (n − 1) of that metric at snapshot B over the block's replicates of that domain. "The `medium` block's replicate stdev" (#181) is the sample stdev of the snapshot-A composite over block 1's replicates of that domain.
- **Scorer.** All criteria use the heuristic scorer on the full domain. The semantic composite and the practical-scope figures are reported beside it.

## Deviations from #182, #179 and #180, and why

1. **Wall clock 120 minutes, not 90.** The owner raised it on 2026-10-20 for these runs, which carry two stages after the interview.
2. **Model `gpt-6-sol`.** The protocol named "whatever #178 lands on"; this is that ladder's reachable rung. The committed `multi-domain-post152` runs (`gpt-5.4`, provider-default effort) remain context only, as #182 says.
3. **The completion classifier is sent without `temperature: 0`.** `gpt-6-sol` rejects any temperature but the default. The harness drops it on the first rejection and records that in `classifierParamsDropped`. The forced JSON format and the two-call confirmation are kept.
4. **The rename tool.** #180 asks for renames "through the existing rename tool (#153)". That tool belongs to the import-merge agent: the interviewer is not offered it, and it renames only classes, rules and actions.
   - **What the naming pass uses instead.** An eval-only `rename_ontology_elements` tool (`index.html`, `RENAME_ONTOLOGY_ELEMENTS_TOOL`). It renames classes, relationships and properties in place, in batches:
     - a renamed class keeps its old name as an alias;
     - a renamed relationship keeps its old name as an alias, and `reverse: true` turns it round;
     - a renamed property takes the new name, since there is no property alias field.
   - **When it is offered.** Only during the naming pass, behind an eval-only switch that no UI sets. Snapshots A and B are taken with the shipped tool set, and the production tool list and prompt are unchanged.
   - **Edit budget.** Renames add no content, so they do not draw on the per-turn edit budget, but they fold into the turn's one undo step.
5. **The sweep's close-out (#179 step 5) is skipped when the sweep changed nothing.** The checks it repeats would run over the same model a second time.
6. **Stage ends are detected by a ledger line as well as by the classifier**, so that a stage ending with an offer to continue (which the classifier's pre-filters always read as "not finished") is not mistaken for an unfinished one. The ledger lines are in English in both language versions because they are machine-read.
7. **All three snapshots are scored from their YAML export** (see Snapshots and scoring), so the paired differences share one scoring path.
8. **No Bedrock, no other domains.** As #182: fibo-loans and brick-hvac only, on Azure only.

## The stage texts, verbatim

The harness sends the English texts (the domains and the persona are English). `{classes}` is replaced by the comma-separated names of the classes the previous round added.

### English

#### Coverage sweep, first round

```text
Before we close, one more systematic pass, to catch what we have not talked about yet.

Call get_graph_state first and treat it as the source of truth for what is already on the canvas. Then go through every class on the canvas, three to five classes per question, and ask me, for each one: whether it has subordinate parts or components; states or lifecycle events; actors or responsible parties; inputs and outputs; related documents or agreements; measurements or characteristic values it carries; earlier or later stages of a workflow; more specific or sibling kinds of the same thing; and which of the properties already confirmed on a sibling class also apply to it. Skip the categories that plainly do not fit a class.

Every candidate this turns up goes through the same competency-question justification as before; nothing is added only because it was mentioned. Keep a running list of the candidates and close each one as added, declined (with my reason) or left open; none may silently disappear.

When every class in this pass has been asked about and every candidate is closed, end that message with one line in exactly this form, and ask nothing further in it:
COVERAGE LEDGER: surfaced=<number>; added=<number>; declined=<number>; open=<number>
```

#### Coverage sweep, each further round

```text
Thank you. These classes were added in that pass: {classes}.
Please ask the same questions about each of them, under the same rules, and close this pass with the same COVERAGE LEDGER line.
```

#### Coverage sweep, close-out (only if the sweep changed the model)

```text
The model has grown during this pass. Please run the Phase 3 check of jointly mentioned pairs and paths, and the Phase 10 checklist, once more over the whole model, then wrap up as you normally would.
```

#### Naming pass

```text
One last pass, on wording: I would like the model to use our own words.

Call get_graph_state first. Then go through what is on the canvas, three to five items per question, relationships first, then properties, then classes:
- for each relationship, ask me what we call this connection ourselves, in one verb phrase, and which way round we would say it;
- for each property and each class, ask me whether that is what we would call it, or whether we have our own term for it.

Record each answer with the rename_ontology_elements tool: a relationship takes my verb phrase, and if I state it the other way round it is turned round (reverse: true); a property or a class takes my term. Previous names of classes and relationships are kept as aliases automatically. Where I say the current name is already right, leave it as it is. Do not add or remove anything in this pass.

When every relationship, property and class has been asked about, end that message with one line in exactly this form, and ask nothing further in it:
NAMING LEDGER: relationships_renamed=<number>; relationships_redirected=<number>; properties_renamed=<number>; classes_renamed=<number>
```

### Hungarian

#### Coverage sweep, first round

```text
Mielőtt lezárnánk, még egy módszeres kört szeretnék, hogy előkerüljön, amiről eddig nem beszéltünk.

Először hívd meg a get_graph_state eszközt, és azt tekintsd mérvadónak abban, hogy mi van már a vásznon. Utána menj végig a vásznon lévő összes osztályon, kérdésenként három-öt osztállyal, és kérdezd meg tőlem mindegyikről: vannak-e alárendelt részei vagy összetevői; állapotai vagy életciklus-eseményei; szereplői vagy felelősei; bemenetei és kimenetei; kapcsolódó dokumentumai vagy megállapodásai; mért vagy jellemző értékei, amelyeket hordoz; egy munkafolyamat korábbi vagy későbbi szakaszai; ugyanannak a dolognak szűkebb vagy testvér fajtái; és hogy egy testvérosztályon már jóváhagyott tulajdonságok közül melyek érvényesek erre is. Hagyd ki azokat a szempontokat, amelyek egy osztályra nyilvánvalóan nem illenek.

Minden így előkerülő jelölt ugyanazon a kompetenciakérdés-alapú indokláson megy át, mint eddig; semmi sem kerül be csak azért, mert szóba került. Vezess folyamatos listát a jelöltekről, és mindegyiket zárd le: felvéve, elutasítva (az én indokommal) vagy nyitva hagyva; egyik sem tűnhet el szó nélkül.

Amikor ebben a körben minden osztályról kérdeztél, és minden jelölt le van zárva, azt az üzenetet pontosan ilyen alakú sorral zárd, és abban már ne kérdezz semmit:
COVERAGE LEDGER: surfaced=<szám>; added=<szám>; declined=<szám>; open=<szám>
```

#### Coverage sweep, each further round

```text
Köszönöm. Ebben a körben ezek az osztályok kerültek be: {classes}.
Kérlek, ugyanezeket a kérdéseket tedd fel mindegyikről, ugyanazokkal a szabályokkal, és ezt a kört is ugyanazzal a COVERAGE LEDGER sorral zárd.
```

#### Coverage sweep, close-out (only if the sweep changed the model)

```text
A modell ebben a körben bővült. Kérlek, futtasd le még egyszer a teljes modellre a 3. fázis együtt említett párokra és utakra vonatkozó ellenőrzését és a 10. fázis ellenőrzőlistáját, majd zárd le úgy, ahogy szoktad.
```

#### Naming pass

```text
Egy utolsó kör a szóhasználatról: szeretném, ha a modell a mi saját szavainkat használná.

Először hívd meg a get_graph_state eszközt. Utána menj végig azon, ami a vásznon van, kérdésenként három-öt elemmel, előbb a kapcsolatokon, aztán a tulajdonságokon, végül az osztályokon:
- minden kapcsolatnál kérdezd meg, mi magunk hogyan nevezzük ezt a kapcsolatot, egyetlen igei kifejezéssel, és melyik irányból mondanánk;
- minden tulajdonságnál és osztálynál kérdezd meg, hogy mi is így neveznénk-e, vagy van rá saját szavunk.

Minden választ a rename_ontology_elements eszközzel rögzíts: a kapcsolat az én igei kifejezésemet kapja, és ha fordított irányból mondom, meg is fordul (reverse: true); a tulajdonság vagy az osztály az én szavamat kapja. Az osztályok és kapcsolatok korábbi neve automatikusan alternatív névként megmarad. Ahol azt mondom, hogy a mostani név már jó, hagyd úgy. Ebben a körben ne vegyél fel és ne törölj semmit.

Amikor minden kapcsolatról, tulajdonságról és osztályról kérdeztél, azt az üzenetet pontosan ilyen alakú sorral zárd, és abban már ne kérdezz semmit:
NAMING LEDGER: relationships_renamed=<szám>; relationships_redirected=<szám>; properties_renamed=<szám>; classes_renamed=<szám>
```
