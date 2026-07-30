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
   practical-scope subset (see below), and writes `results/report.md` +
   `results/conversation-log.md` + `results/tool-calls.md` — three fixed
   filenames, **overwritten every run, never accumulated**.
   **Committed to the repo as of the run bundled with each PR** (not
   gitignored — see `.gitignore`'s own comment on this): only the most
   recent run's files are ever present, so anyone browsing the repo can
   read the latest real transcript/report directly, or re-run the eval
   themselves and get a fresh version of the exact same three files in the
   exact same place. If you're looking for "what did the last live run
   actually do," these three files under `tests/evals/results/` *are* that
   record — no separate archive or changelog to hunt for.
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

- **Class / relationship recall, precision, F1** — standard set-comparison
  metrics between the ground truth and the recovered canvas model.
- **Property recall** — ground-truth properties (post-filter) recovered as
  a property on the matched class.
- **Controlled-value fidelity** — average allowed-value-list overlap
  (Jaccard) across matched controlled-value properties.
- **Recovery effectiveness** — equal-weighted average of the four above
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
