# Ontology-recovery eval

An optional, opt-in eval — not part of the default test suite, and not a
strict pass/fail check. It simulates a full ontology-elicitation interview
between the app's real helper agent (interviewer) and a second, independent
LLM playing a domain-expert persona, then measures how much of a hidden
ground-truth ontology the interview actually recovered.

Not swept in by `node --test tests/*.spec.mjs` — that glob is
non-recursive and never sees this subdirectory. Run it explicitly:

```sh
node --test tests/evals/*.eval.spec.mjs
```

Requires `OPENAI_API_KEY` (same `.env`/`tests/lib/env.mjs` convention as
`tests/helper-agent-live-openai.spec.mjs` — see `tests/README.md`). Skips
with a clear reason if absent.

**Do not import this spec file directly with plain `node`** (e.g.
`node -e 'import("...")'`) to "just check it loads" — `node:test`'s `test()`
runs immediately on import outside the `node --test` harness, so that
executes the real eval, not a dry run. Use `node --check` for a syntax-only
check, or run it for real via `node --test`.

## What it does

1. Connects the app's real helper agent with a real key, through a real
   headless browser — exactly like `tests/helper-agent-live-openai.spec.mjs`
   (same relay trick for the same sandbox-networking reason; see that
   file's own header comment).
2. Seeds the conversation with the persona's own scripted opening line,
   then alternates turns: the app agent replies (through the real UI, real
   tool calls), its natural-language reply is forwarded to the persona
   agent (a separate, plain Node-side Chat Completions loop — see
   `lib/personaAgent.mjs`), whose reply goes back into the app's chat box.
3. Stops on whichever comes first:
   - the app agent's latest reply looks like it believes the interview is
     essentially wrapped up (a real classification call after each
     app-agent turn — `appearsFinished()` in `lib/conversationOrchestrator.mjs`,
     itself backed by a deterministic pre-filter that never needs the API
     call at all — see the config table below);
   - the app agent has sent two consecutive short, content-free
     pleasantries in a row with no question in them (`looksLikePureAcknowledgment()`
     in `lib/conversationOrchestrator.mjs`) — a second, independent safety
     net that needs no API call and can't be fooled by a classifier model
     misjudging content, added after a real run looped 160+ turns of pure
     "Thank you" / "You're welcome" / "Take care" past the point the
     interview had already, explicitly finished (the classifier call itself
     was silently failing that run — see the `ONTOLOGY_EVAL_CLASSIFIER_MODEL`
     row below);
   - `ONTOLOGY_EVAL_MAX_TURNS` turns (default 500);
   - `ONTOLOGY_EVAL_WALLCLOCK_MINUTES` wall-clock minutes (default 45).

   The persona itself (`lib/personaAgent.mjs`'s `fixtures/persona-eszter.md`)
   also carries a prompt-level defense against the same failure: instructed
   to recognize the interviewer's own wrap-up cues (a final validation pass,
   a competency check, an explicit "interview complete" statement) and give
   one short closing line rather than keep volunteering new content or
   trading farewells back and forth — the persona's own contribution to
   *not* re-igniting the loop, alongside the two deterministic/LLM checks
   above that actually stop it.
4. Diffs the final recovered canvas model against the ground-truth fixture
   (`lib/recoveryMetrics.mjs`), against both the full domain and the
   practical-scope subset (see below), and writes seven files under
   `results/` — **overwritten every run, never accumulated**:
   - `report.md`, `conversation-log.md`, `tool-calls.md` — the original
     three (aggregate metrics table, human-readable turn-by-turn log, raw
     API-level tool-call transparency log; see "Full transparency" below).
   - `recovered-model.yaml` — the exact YAML `get_graph_state` itself would
     return for the final canvas state, captured directly via
     `window.buildDomainYamlExport()` rather than left for a reader to
     reconstruct by hand from `tool-calls.md`'s last `get_graph_state`
     block (which can go stale if the model kept editing afterward without
     calling the tool again).
   - `heuristic-matches.json` — `lib/recoveryMetrics.mjs`'s
     `computeHeuristicMatchPairs()` output: exactly which gold
     class/relationship/property matched which recovered
     node/edge/property name (one-to-one throughout — see "Metrics"
     below), full domain only (practical-scope matches are always a subset
     of the same ids).
   - `semantic-judgments.json` / `semantic-matches.json` — the LLM judge's
     full per-item verdicts (MATCH *and* NO MATCH, judgments.json) or just
     the resolved MATCH pairs (matches.json), plus each judge call's raw
     response text, for **both** the full-domain and practical-scope
     passes (two genuinely separate sets of real judge calls, each with
     its own narrower-or-wider unmatched-item list — not one result shown
     twice). Before these existed, this data was computed and then
     discarded before ever reaching disk — an external review of this
     eval's methodology flagged that gap; see "Metrics" below for the
     correctness issue it was found alongside.

   **Committed to the repo as of the run bundled with each PR** (not
   gitignored — see `.gitignore`'s own comment on this): only the most
   recent run's files are ever present, so anyone browsing the repo can
   read the latest real transcript/report directly, or re-run the eval
   themselves and get a fresh version of the exact same seven files in the
   exact same place. If you're looking for "what did the last live run
   actually do, and exactly why did it score what it scored," these seven
   files under `tests/evals/results/` *are* that record — no separate
   archive or changelog to hunt for.
   `tests/evals/lib/reportGenerator.mjs`'s `write*` functions default to
   this real, shared path; they accept an optional `{ dir }` override used
   only by this project's own *mocked* unit tests
   (`tests/ontology-recovery-transparency.spec.mjs`), so that running the
   regular mocked suite (`node --test tests/*.spec.mjs`) — which includes
   those tests — can never again silently clobber a real run's committed
   results with synthetic test fixture content (this happened once; see
   `helper_agent_todo.md`'s dated addendum for the concrete incident that
   motivated the `{ dir }` override).
5. `results/report.md` also includes one real LLM call's review of the full
   conversation, flagging errors and noteworthy events — defaults to
   whatever model the interviewer itself connected with, overridable via
   `ONTOLOGY_EVAL_REVIEW_MODEL`. Treat its findings as a lead to verify, not
   a verdict: it only ever sees the human-readable transcript, so anything
   it flags as a possible tool/state-sync issue should be checked against
   `results/tool-calls.md` (see "Full transparency" below) before being
   taken at face value — a real run's reviewer flagged exactly this kind of
   issue, and reading the underlying app code showed the live-sync-caution
   language in the system prompt's own "STAYING IN SYNC WITH THE LIVE
   ONTOLOGY" section was a more likely explanation than an actual bug
   (helper_agent_todo.md's dated Log entry).

## Full transparency: `results/tool-calls.md`

The human-readable conversation log only ever shows short tool notes
("Checked the current ontology state.", "Applied: 3 added, 1 updated.") —
never what the interviewer actually sent as `apply_ontology_yaml`'s `yaml`
argument, or exactly what `get_graph_state` returned. `results/tool-calls.md`
dumps the raw API-level message log instead: every tool call's real
arguments (pretty-printed) and every tool result's real content, turn by
turn, captured from `window.__kg.agent.state.apiMessages` (the exact
request/response content the app itself sent and received —
`lib/conversationOrchestrator.mjs`'s `tagApiMessagesWithTurn`). This exists
specifically so a suspected tool/state-sync issue can be checked against
what actually happened instead of the interviewer's own narration of it, or
the LLM reviewer's summary of that narration.

## Fixtures

`fixtures/itops_mtsr.yaml` and `fixtures/persona-eszter.md` are versioned
copies of the uploaded ground-truth ontology and persona prompt. They are
not secrets — the ground truth is hidden only from the app agent under test
(which never sees this directory), not from the repo.

`itops_mtsr.yaml` is *not* a byte-for-byte unmodified copy of the original
upload — see "Deliberate, documented edits to the ground truth" below for
exactly what was changed and why (three categories, each also enforced at
runtime by a still-exported filter function, so the correction survives even
if this file is ever replaced by a fresh, uncorrected upload). Every other
section (`classes:`, `valueSets:`, `constraints:`, `mappings:`,
`competencyQuestions:`) is untouched from the original upload.

## Running against a domain other than itops (issue #104)

`EVAL_DOMAIN` picks which domain the eval runs against:

```sh
EVAL_DOMAIN=brick-hvac node --test tests/evals/ontology-recovery.eval.spec.mjs
```

Defaults to `itops` -- the original, hand-authored `persona-eszter.md` +
`itops_mtsr.yaml`, completely unchanged, still writing to this directory
(`results/`, overwritten every run, as described above). Every other value
resolves to `ontology_translation/domains/<id>/reference.domain.yaml` +
`persona.md` (auto-discovered by directory scan -- run with no
`EVAL_DOMAIN` set, or list `ontology_translation/domains/` yourself, to see
what's available) and writes to its own isolated
`ontology_translation/results/runs/<domain>/<run-id>/` instead, so repeated
runs never overwrite each other's results the way this shared directory's
single-run convention does.

A non-itops domain's persona uses the same domain-agnostic experiment
scaffolding `persona-eszter.md` itself now shares
(`fixtures/persona-experiment-wrapper.md` -- the "don't leak the hidden
file," ending-the-interview, and consistency-checklist rules that apply to
any persona) combined with that domain's own `persona.md`. Its opening
line is derived mechanically from that file's own "Who they are" section
(`lib/personaAgent.mjs`'s `deriveOpeningLine`) rather than requiring a
hand-authored scripted paragraph the way itops's own `OPENING_LINE` is.

`lib/groundTruthModel.mjs`'s `loadGroundTruthModel({ format, path })` is
the loader both paths go through -- `format: "mtsr"` (the default, for
`itops_mtsr.yaml`-shaped fixtures) or `format: "domain-yaml"` (for any
`ontology_translation/domains/*/reference.domain.yaml`). Every existing
call site across `tests/evals/*.mjs` uses the old zero-arg
`loadGroundTruthModel()` form and is unaffected either way.

itops itself has an equivalent `.domain.yaml` too
(`ontology_translation/domains/itops/`), produced by a re-runnable
conversion script (`tests/evals/convert-itops-to-domain-yaml.mjs`) rather
than a hand transcription -- confirmed to carry the exact same class/
relationship/property counts as the original MTSR fixture
(`tests/itops-domain-yaml-parity.spec.mjs`, offline and deterministic, no
live run needed). The live itops eval keeps using the original
`persona-eszter.md`/`itops_mtsr.yaml` pair by default regardless, since
every other tool under `tests/evals/` (`rescore-saved-run.mjs`,
`score-baseline.mjs`, `cross-run-analyses.mjs`,
`threshold-sensitivity.mjs`) reads from exactly that path.

## Deliberate, documented edits to the ground truth

The user's own instruction was to trim the ground truth "based on the
handbook" before treating it as the recovery target — always as a
documented, auditable filter in `lib/groundTruthModel.mjs`, never a
hand-edited copy of the fixture. Four adjustments, each independently
justified:

- **`isRecoverableProperty`** — excludes any property predicate whose
  target datatype is `identifier` or `uri`. The app's own baked howto doc
  (`AGENT_KNOWLEDGE` in `index.html`) explicitly tells the agent not to
  model these ("Do not include technical fields that users never ask
  about"), so scoring their absence as a recall failure would penalize the
  agent for correctly following its own instructions.
- **`isRecoverableRelationship`** — excludes the 23 `"is a"` (subclass)
  predicates the fixture models (`Major Incident is a Incident`,
  `Application is a Configuration Item`, and so on). The app's data model
  is flat classes plus directed relationship edges only — no subclassing
  (see `index.html`'s `commitYamlImport` comment) — and a real eval run's
  own interviewer correctly said so mid-interview ("this tool does not use
  subclassing directly ... instead, connect them with a clear
  relationship"), modeling `Major Incident —declared from→ Incident`
  instead of forcing `"is a"` onto a generic edge. Scoring that choice as a
  miss would penalize correct behavior, not bad interview technique.
- **`buildReducedActions`** — the fixture's own actions each declare
  potentially several named inputs (e.g. `declareMajorIncident: inputs:
  {incident: ..., commander: ...}`), but this app's Action node has exactly
  one input class (`inputClassId` is a scalar, not a list — see
  `index.html`'s own Phase 8 note, which tells the interviewer this
  explicitly). Ground-truth actions are reduced to their first-listed
  ("primary") input only; secondary inputs are dropped, with the drop count
  recorded (`groundTruth.actions[].droppedInputCount`) so the reduction is
  visible, not silent. Not currently wired into any scored metric (there's
  no action-recall dimension yet), but the *primary* input class of each
  action does feed `practicalScopeClassIds` below — the *secondary* ones
  deliberately never do, for the same reason `isRecoverableRelationship`
  excludes `"is a"`.
- **`practicalScopeClassIds`** — see "Full domain vs. practical scope"
  below.

Everything else — all 68 classes, all 120 remaining relationships, all 111
remaining decision-relevant properties, every controlled-value set — is
fair game, scored against the full domain as before.

## Full domain vs. practical scope

The fixture models a *comprehensive* 68-class reference domain, built for
reuse across many possible interviews/experiments — not a scoped
deliverable for any one of them. A real, single-session,
competency-question-driven interview (this app's own actual methodology:
elicit real questions/actions first, then model only what's needed to
answer them) will only ever reach the slice of that domain implied by
whatever questions/actions actually came up. Scoring 100%-domain recall
every run measures the wrong thing — a live run whose interviewer opened
with "I lead IT operations governance and major-incident management" and
never asked about, say, container platforms or business continuity testing
isn't failing to recover those; they were never in scope to begin with.

`groundTruthModel.mjs`'s `practicalScopeClassIds` gives a second, tighter,
and just as auditable denominator: every class whose label or a declared
alias appears (case/punctuation-insensitive, whole-word) inside the
fixture's *own* canonical `competencyQuestions:` + `actions:` section, plus
each reduced action's primary input class (see "Deliberate, documented
edits" above — secondary inputs never count here) — mechanical, not
hand-picked, since it only depends on what the fixture's own canonical
competency-test material actually talks about. `report.md`'s
headline table now shows both **Full domain** and **Practical scope**
columns side by side for every metric — full-domain numbers for
cross-run/cross-fixture-revision comparability, practical-scope numbers as
the more meaningful read of a single interview's own quality. `scopeGroundTruth()`
filters an already-loaded ground truth model down to a given class-id set,
reusing the exact same `computeRecoveryMetrics()` scoring logic for both
columns rather than maintaining a second code path.

`practicalScopePropertyIds` narrows the properties column one level
further, the same way `practicalScopeClassIds` narrows classes: a property
living on an in-scope class isn't automatically in scope itself — its own
label has to independently show up (content-word overlap against the same
corpus, since two-thirds of the fixture's predicate labels follow a "has X"
/ "is X" convention no natural competency question is going to contain
verbatim) in that competency-question/action material too. Against the
bundled fixture this drops the scoped property count from 69 (class-only)
to 26 — genuine "nice to know" fields like `has name`/`has description`/
`has version` don't survive even though their host class is squarely in
scope, while decision-bearing ones like `has status`/`has severity` do.
`scopeGroundTruth()` takes an optional third `propertyIds` argument for
this (omit it to keep the old class-only property filtering).

**Relationships are scoped differently from classes and properties, and it
matters for how to read the number.** Classes and properties are each
independently filtered by their *own* textual mention in the competency-
question/action corpus (above). Relationships are not: `scopeGroundTruth()`
keeps a gold relationship whenever *both* its endpoint classes are already
in scope (`groundTruthModel.mjs`'s `scopeGroundTruth`:
`classIds.has(r.fromClassId) && classIds.has(r.toClassId)`) — an **induced
subgraph** over the scoped class set, not a filter on the relationship's
own mention anywhere in the competency/action text. Against the bundled
fixture this is 41 practical-scope relationships. Practically: the scoped
relationship denominator can include a relationship whose two endpoint
classes are each independently justified by the competency material, but
where that *specific connection between them* was never actually needed to
answer any competency question or resolve any action — so a low
practical-scope relationship recall is not automatically evidence that the
interview under-elicited relative to what the competency material actually
demanded; some of the denominator is there because of what its endpoints
individually talk about, not because the fixture ever posed a question that
specifically required that edge.

## Metrics (see `lib/recoveryMetrics.mjs`)

Matching is heuristic token-set-overlap string comparison (normalized,
stopword-stripped, Jaccard-based), not an LLM judge — deterministic and
cheap, at the cost of missing recoveries phrased very differently from the
ground truth's own labels/aliases. A known limitation, not solved here to
keep this eval's own moving parts small. Normalization does split camelCase
into words first (`isImplementedBy` → `is implemented by`) — the app's own
relationship-name dialect is camelCase while the ground truth's predicate
labels are natural-language phrases, and a first real run found this
silently suppressing almost all relationship recall before the split was
added (helper_agent_todo.md's dated Log entry).

Two different Jaccard thresholds, not one: classes (0.6) get every one of
the ground truth's own declared aliases cross-checked against the recovered
node's own label/meaning/aliases — real, built-in tolerance for rephrasing.
Relationships and properties (0.3) get none of that: the fixture's
`predicates:` section has no `aliases:` field at all, and the app's own
edge/property data model has no alias concept either — always exactly one
recorded label against exactly one gold label, with nowhere else to look.
Auditing a real confirmatory run's actual recovered relationships against
gold found this asymmetry silently costing correct recoveries at the class
threshold (e.g. `Incident handledUsing Runbook` for gold's `Incident is
handled with Runbook` — same class pair, same direction, same meaning, one
preposition the interviewer could never have known to avoid since gold's
exact wording is hidden from it — Jaccard 0.33). The lower threshold is
still gated by the relationship/property's class pair (or host class)
already matching, which does most of the disambiguating work a class match
relies on alone, so it's safe to be more forgiving here without the same
false-positive risk classes would have. It does *not* rescue a genuine
different word choice with zero token overlap at all (gold's "impacts" vs a
recorded "affects" — Jaccard 0) — that residual gap is accepted, not
silently hidden behind a synonym dictionary this eval deliberately doesn't
maintain.

**Class matching is one-to-one, both heuristically and under the semantic
judge.** An external methodology review of this eval found that
`matchClasses()` used to accept *every* gold-class/recovered-node pair that
cleared the Jaccard threshold, with no exclusivity constraint — a single
recovered node whose aliases happened to overlap two different gold classes
(a real, confirmed case: an "Incident Commander" node's "major incident
manager" alias also clearing the threshold against the separate
`majorIncident` gold class) counted as recovering *both*, inflating class
recall (which counts per gold class) without inflating precision (which
dedupes per recovered node) — the same asymmetry existed one level up in
the semantic judge's aggregation, since its prompt only constrains one gold
item's own line ("pick the single best candidate"), not different lines
from independently picking the same candidate. Both are now resolved via a
proper one-to-one assignment: every candidate pair becomes a weighted edge
(the Jaccard score, for the heuristic pass; uniform weight, since a judge
verdict is binary, for the semantic pass) in a bipartite graph, and
`lib/bipartiteMatching.mjs`'s from-scratch Hungarian-algorithm implementation
picks the globally optimal assignment where each gold item and each
recovered item is used at most once. `results/heuristic-matches.json` and
`results/semantic-matches.json` (see "What it does" above) make the
resulting pairing directly auditable, rather than trusting the aggregate
percentage alone.

- **Class / relationship / property recall, precision, F1** — standard
  set-comparison metrics between the ground truth and the recovered canvas
  model. A property is recovered when it appears on the matched host class;
  all three dimensions are matched one-to-one (`matchClasses()`,
  `matchProperties()`), so each precision is denominated on the complete
  recovered set of that kind and no recovered element can be credited twice.
  Property precision matters more than it might sound: recovered models list
  41–135 properties each, and most of them match nothing in the reference, so
  property coverage read on its own overstates that layer substantially.
- **Controlled-value fidelity** — average allowed-value-list overlap
  (Jaccard) across matched controlled-value properties.
- **Recovery effectiveness** — equal-weighted average of the three F1s and
  value fidelity above
  (value fidelity excluded from the average on runs that never matched a
  controlled-value property, rather than penalizing a short interview that
  never reached that territory). A documented default weighting, not a
  fitted one — tune in `computeRecoveryMetrics()` if a different balance
  matters more for what's being optimized.

Relationship recall specifically was found to lag even its own reachable
ceiling (well below what the classes actually modeled in a run could
support) because Phase 3 of the interviewer's own system prompt
(`index.html`'s `INTERVIEW PROCESS`) asked one opening batch of backbone
relationships, then moved on to properties without working back through the
rest of the confirmed class list. Fixed by adding explicit
don't-stop-after-one-batch, cover-everything-confirmed guidance to Phase 3,
pinned by `tests/helper-agent-phase4.spec.mjs`.

## Rules and actions (issue #105)

Classes/relationships/properties above have always been scored; rules and
actions were part of the representation from the start but had no recall
metric at all until this issue — reported as their own dimensions,
deliberately **not** folded into `recoveryEffectiveness`'s composite (the
issue's own instruction: "a later issue can define a new composite once
enough domains have been run" with this data).

**Rules** (`computeRuleMetrics`/`matchRules`) are matched one-to-one on a
weighted combination of name similarity (30%) and condition-text
similarity (70%), gated by an independent condition-overlap floor on top
of the combined threshold — "a rule is recovered only if the core decision
condition is semantically equivalent; matching the name alone is
insufficient" is a hard requirement, not just a weighting preference. Only
`.domain.yaml`-sourced ground truth has rules at all (issue #104's own
addition to the normalized model) — always empty, and every metric here
degrades to 0/no-crash, for MTSR-sourced ground truth.

**Actions** (`computeActionMetrics`/`matchActions`) are matched one-to-one
on name/meaning similarity alone — deliberately *not* gated on input-class
agreement, so a same-named action with the wrong input class still counts
as identified, with that mismatch showing up in its own component metric
instead. Reported separately per the issue's own list: identification
recall/precision/F1, input-class accuracy, precondition recovery, effect
recovery, verification recovery. Gold's own `preconditions` field is
always resolved condition *text* by the time it reaches this layer, never
a rule-name reference, regardless of source format — `.domain.yaml`
resolves its own rule-name references to that rule's real conditions at
ground-truth load time (`groundTruthModel.mjs`); the RECOVERED side's
preconditions (real rule-id references from `window.__kg.state.actions`)
are resolved the same way at scoring time, once a live recovered state
exists to resolve them against. A component metric is `null`, not `0`,
whenever the matched gold action never had that field populated in the
first place — "do not penalize fields absent from the reference domain"
needs a real, distinguishable "not applicable" outcome.

**Semantic supplement**: `judgeRules`/`judgeActions`
(`llmMatcher.mjs`) follow the same pairing-judge pattern as classes/
relationships, scoped to identification only — the component metrics
above are always computed from the heuristic pass's own matched pairs,
never re-judged or extended by which pass did the identifying (the same
scoping `controlledValueFidelity` already uses for its own component:
never re-scored via the semantic *class*/*property* judge's own matches,
only ever the heuristic `matchProperties` assignment). `report.md` renders
this as two new sections ("Rules and actions (heuristic)" / "(semantic)"),
present only when a run actually captured rule/action data.

## Expectation to set going in

The full-domain ground truth is large, and by design a bounded, focused
interview should only reach a fraction of it — that's not a shortfall to
close, it's what a scoped, competency-driven interview is supposed to do
(see "Full domain vs. practical scope" above). Even the **practical-scope**
composite, scored against just the classes/relationships/properties the
fixture's own canonical competency material actually talks about, is a more
demanding bar than it looks — it still requires near-exhaustive elicitation
across everything in that narrower scope. This eval's value is
trend-tracking on both columns (did a prompt or heuristic change move
practical-scope recovery up or down, did full-domain scope itself widen,
did tool-call errors increase, did the interview get less efficient) rather
than expecting either composite score to approach 100%.

## A methodological limitation: the same fixture was used to develop the prompt and to score the reported run

`helper_agent_todo.md`'s dated Log entries document, honestly and in detail,
that the interviewer's system prompt (`index.html`'s `INTERVIEW PROCESS`/
`GROUND RULES`) went through several rounds of changes directly motivated by
this eval's own results against this same `itops_mtsr.yaml` fixture — some
of those changes were accepted specifically because they raised this
fixture's own composite or sub-metric scores over a prior baseline run
("merge gate" language appears in that log more than once). Domain-specific
wording that crept in during that process was later found and removed (see
the "general-purpose, not domain-specific" retrofit recorded in
`helper_agent_todo.md`'s own Log), so the prompt itself is not simply
overfit to IT-operations vocabulary today. That does not remove the more
basic issue: **the numbers reported for any given run are development-case
results, not evidence of transfer to a fixture the prompt was never
iterated against.** No held-out-domain fixture exists in this repo to
measure that gap directly — reading these scores as "how well this general-
purpose interview technique performs on unseen domains" would be reading
more into them than a single, repeatedly-tuned-against fixture can support.

## Single-run design: partially addressed via a 3-run replication set

The other major empirical limitation an external review flagged was that only one run's numbers were ever
reported — no way to tell how much of any given score reflects the interview technique versus ordinary
run-to-run variance between two independent LLM conversations. `results/runs/` holds three runs under an
explicitly **frozen configuration** (same prompt, same fixture, same models, same scoring code, zero tuning
between runs): `run-01` is the pre-designated anchor (the same run this repo's other analysis already
reviewed in detail), `run-02` and `run-03` are pure replications. All three are reported side by side in
`results/runs/README.md`, including the honest finding that the concept–structure gap (classes recovered far
more reliably than relationships) repeats in all three, and that run-to-run variance on individual sub-
metrics is often much larger than the composite score's own apparent stability suggests. This narrows the
"single stochastic run" objection specifically — it does **not** address the development-case-overlap
limitation above, the lack of unseen-domain transfer evidence, or the lack of real human-subject data (see
`results/runs/README.md`'s own closing section for the precise scope of what three runs can and can't show).

## Translating a simulated run into a real engagement's time/effort

The interviewer side of this eval is the real app agent — its numbers here
are the actual product experience, not a proxy. The *persona* side is not:
it's a single independently-sampled LLM improvising a domain expert from
general IT-operations knowledge in one pass, with no ability to actually
go check anything (an exact severity taxonomy, an internal status
vocabulary, an org chart) the way a real subject would. That gap matters
for reading these numbers correctly, not just for interpreting turn counts.

**AI-pace wall-clock is not human wall-clock.** The best confirmed run on
this repo's history (`helper_agent-prompt-fixes-round2`, merged) took 48
turns and 909s (~15 minutes) — that's LLM-to-LLM latency, seconds per
turn, nothing like what a real subject needs to read, think, and answer.
Estimated from the actual message density in these transcripts (each
interviewer turn batches 3-9 items, needing a real multi-sentence answer):
roughly **2.5-4 hours of a real expert's engaged time** for an interview
of this depth, done back-to-back — and realistically more than that in
practice, because a real subject stops to verify things (an exact status
list, a regulatory threshold) that the simulated persona just invents
instantly, and because no one sustains that density of precise technical
answers for hours without a real quality drop.

**Company-side commitment estimate: two domain experts, two days each**
(~4 person-days total, done as a compressed engagement rather than spread
over calendar weeks) is a realistic sizing for a real interview at this
fixture's scope — splitting by domain (operational/incident-response vs.
regulatory/compliance, since this fixture spans both) cuts each expert's
share of raw Q&A to roughly the 1.5-2 hour range, with the rest of each
day's allocation covering fact-finding, prep, and reviewing the resulting
model afterward rather than trusting it blind. **This estimate is scoped
to recover the *full* practical-scope ground truth**, not the partial
recovery this eval's simulated runs actually land on (composite scores in
the 40-65% range even on the best confirmed runs as of this writing) — the
eval's ceiling is capped by what a single-pass, non-fact-checking
simulated persona happens to volunteer, not by what a real, resourced,
two-session engagement with real subject-matter access could achieve. Two
experts with two real days and the ability to actually go verify things
should reasonably be expected to reach full practical-scope coverage,
which this eval's own simulated numbers cannot demonstrate by construction
and should not be read as a ceiling on.

See `helper_agent_plan.md` §9 for the feature this reasoning directly
motivated (agent conversation persistence across reloads) — a two-day,
two-person engagement will not fit in one open browser tab.

## Cost and configuration knobs

All environment-configurable, none hardcoded:

| Variable | Default | Purpose |
|---|---|---|
| `ONTOLOGY_EVAL_MAX_TURNS` | 500 | Hard turn cap — raised from 100 once the interviewer's own pacing was fixed to batch similar items instead of one-per-turn (helper_agent_todo.md's dated Log entry) |
| `ONTOLOGY_EVAL_WALLCLOCK_MINUTES` | 45 | Hard wall-clock cap |
| `ONTOLOGY_EVAL_PERSONA_MODEL` | `gpt-4o-mini` | Simulating Eszter is a lighter task than open-ended elicitation, so this defaults cheap |
| `ONTOLOGY_EVAL_CLASSIFIER_MODEL` | (interviewer's own connected model) | The "does this look finished?" check — was a fixed cheap default (`gpt-4o-mini`) until a real run found it hard to instruction-away from a false positive on an early-phase recap; now defaults to whatever real, live-picked "standard tier" model the interviewer connects with, same pattern as `ONTOLOGY_EVAL_REVIEW_MODEL`. Also backed by a deterministic pre-filter (`looksLikeEarlyPhaseCheckpoint` in `lib/conversationOrchestrator.mjs`) that catches the interviewer's own "Phase N recap" phrasing before ever calling this model at all. Defaulting to the interviewer's own model can pick a reasoning-tier model, which rejects the `temperature`/`max_tokens` params this call used to send (HTTP 400, `"Unsupported parameter: 'max_tokens'..."`); the old code silently treated that failure as "not finished" instead of surfacing it, which is what let the 160+-turn pleasantry loop above happen in the first place. `appearsFinished()` no longer sends either param (matching `index.html`'s own `callAgentChatRaw()`, which never did) and now throws instead of silently defaulting on any classifier API error. |
| `ONTOLOGY_EVAL_REVIEW_MODEL` | (interviewer's own connected model) | The report's LLM-review call |

The interviewer side always uses whatever model the app's own real
default-model heuristic picks for the connecting key — that's the actual
behavior a real user gets, not a value to override here.

A full run realistically costs well under a dollar regardless of the turn
cap (mini-tier persona/classifier calls dominate call count; the
interviewer's own calls are comparatively few), but in practice the
45-minute wall-clock default is almost always what actually stops a run
long before 500 turns — the turn cap is headroom for an efficient
interview to use, not a target it's expected to reach. For quick iteration
while changing this eval itself, override the turn cap down, e.g.:

```sh
ONTOLOGY_EVAL_MAX_TURNS=6 node --test tests/evals/*.eval.spec.mjs
```

## Conditions built on top of this eval

Two separate specifications extend the eval rather than being part of it, and
neither is run by `node --test tests/evals/*.eval.spec.mjs`:

- **`EXPERIMENT_BRIEF.md`** — the B1/B2/B3 comparison conditions, each varying
  one factor of the pipeline that *produces* a model (how a transcript becomes
  a model; the interviewer prompt; whether anything can be committed
  mid-conversation). Results: `results/baselines/README.md`.
- **`POST_NORMALIZATION.md`** — conditions `post-normalization-v1` and `-v2`
  (issue #75):
  a post-interview **structural review pass** over a finished transcript and
  the ontology built from it. Unlike B1–B3 it does not replace any part of the
  pipeline; it starts from the interactive run's own output, so the comparison
  is paired, and its primary endpoint is a blind transcript-grounded A/B judge
  rather than recovery F1 — because, as that document argues in advance and
  the result then confirmed, recovery F1 cannot see structural change at all.
  v2 is v1's prompt plus exactly two constraints, constructed from v1's own
  string so that "only these two rules differ" is a tested property rather than
  a claim. Results: `results/baselines/post-normalization-v1/REPORT.md` and
  `results/baselines/post-normalization-v2/REPORT.md`, the latter carrying the
  experiment's final **REJECT** recommendation.

Both are evaluation-only with respect to the shipped app. The production
interviewer's system prompt and tool surface are pinned by
`tests/agent-production-invariants.spec.mjs` in the default suite, so a
condition cannot quietly change the thing it is supposed to be measuring
against.

## Non-regression runners (a different shape from the conditions above)

Some changes *do* alter the shipped interviewer. When that happens the golden
hash in `tests/agent-production-invariants.spec.mjs` fails by design, and the
change owes a fresh evaluation before merge — the anchor runs were produced
under a different prompt, so nothing may be compared against them until one
exists. Two runners exist for that, both two-arm and within-model:

- **`self-correction-eval.mjs`** (issue #85) — the self-correcting interviewer.
  Control arm: the frozen pre-#84 prompt with self-correction disabled.
  Results: `results/baselines/self-correcting-interviewer/`.
- **`cq-non-regression.mjs`** (issue #94) — the competency-question
  interviewer. Control arm: the frozen pre-#94 prompt
  (`fixtures/interviewer-prompt-pre-94.txt`, verified against the golden hash
  that shipped before the change, so a drifted fixture aborts the run rather
  than producing a void comparison). Scored offline, arm against arm, by
  `analyze-cq-non-regression.mjs`. Design and pass criteria:
  `CQ_NON_REGRESSION.md`. Results:
  `results/baselines/competency-questions/REPORT.md`.

Both run the *same* harness, fixture, persona and scorer for both arms, so the
arms differ by the interviewer prompt alone; both re-run the control rather
than reuse `results/runs/`, because the anchors' model is not reachable from
the environment these were executed in. Neither reads or writes anything under
`results/runs/`.
