# Experiment brief: comparison conditions for the elicitation eval

**Audience:** a coding agent implementing new experimental conditions in this
repository. **Status of this document:** specification, not a task list — you
decide the implementation, but the invariants in §4 are not negotiable and the
acceptance checks in §8 must pass before you report a condition as working.

Written in English to match the rest of the repository's code and docs.

---

## 1. The scientific question

The existing eval measures what the **interactive** elicitation agent recovered:
it interviews a simulated domain-expert persona turn by turn, deciding what to
ask next, and commits each confirmed step into the live model through a tool
call. Three fixed-configuration runs (`tests/evals/results/runs/run-01..03`)
show a consistent result: concept recovery clearly exceeds relationship
recovery, and property recovery is lower still once precision is counted.

What the eval does **not** show is whether any of the machinery is responsible
for that. The observed gap could equally come from:

- the interactive, tool-committing loop (the thing the paper argues for);
- the specific interviewer prompt;
- the MTSR profile itself (flat classes, one directed edge per connection);
- the scorer and the reference model's own modelling conventions.

Every condition below exists to separate these. **A condition is only useful if
it varies one factor and holds the rest fixed.** If you cannot state in one
sentence which single factor your condition varies, it is not ready to run.

Results that favour the baseline are just as publishable as results that favour
the interactive agent. Do not tune a condition until it produces the preferred
direction — see §4.6.

---

## 2. What already exists (read this before writing anything)

| Path | What it is |
|---|---|
| `tests/evals/ontology-recovery.eval.spec.mjs` | the live interactive run (real browser, real API) |
| `tests/evals/lib/conversationOrchestrator.mjs` | turn loop, stopping conditions |
| `tests/evals/lib/personaAgent.mjs` | the simulated expert (prompt + fixture, Node-side) |
| `tests/evals/lib/groundTruthModel.mjs` | fixture loading, preprocessing, `scopeGroundTruth` |
| `tests/evals/lib/recoveryMetrics.mjs` | deterministic one-to-one scorer, `MATCH_THRESHOLDS` |
| `tests/evals/lib/llmMatcher.mjs` | semantic (LLM-judged) pass |
| `tests/evals/rescore-saved-run.mjs` | offline re-score of a saved run, no model calls |
| `tests/evals/baseline-one-shot.mjs` | **condition B1, the control implementation** |
| `tests/evals/score-baseline.mjs` | offline baseline-vs-interactive comparison |
| `tests/evals/BASELINE_HOWTO.md` | how to run B1 |

**`baseline-one-shot.mjs` + `score-baseline.mjs` are the reference pattern.**
They already solve the boring problems correctly: retry/backoff, YAML
extraction from a fenced or bare reply, provenance capture, the
undeclared-endpoint edge filter, and the heuristic-only comparability rule.
Copy their structure rather than inventing a new one, and keep the same output
contract (§5) so `score-baseline.mjs` can score your condition unchanged.

---

## 3. Conditions

### B1 — one-shot transcript → MTSR *(implemented; control)*

One model call, input = the finished transcript of an interactive run, output =
an MTSR model. Isolates **how a conversation becomes a model**, holding the
conversation fixed. Deliberately generous to the baseline: it inherits the
interactive agent's questioning for free.

### B2 — generic interviewer

A fresh interview against the same persona, but the interviewer runs on a
short, generic prompt ("interview this expert and build a domain model")
instead of the app's staged `INTERVIEW PROCESS`. Isolates **the interviewer
prompt**. Requires a full interview: expensive, ~40–60 turns.

Hold fixed: persona prompt and model, fixture, interviewer model, stopping
conditions, tool availability, scorer.

### B3 — structured interview without tool calls

The app's real interviewer prompt, but the agent cannot commit anything
mid-conversation; the model is produced only at the end from its own
transcript. Isolates **incremental committing** specifically, which is the
closest thing to the paper's actual claim. This is the highest-value untried
condition.

### B4 — no shared live model

The agent commits, but into a private scratch model the human surface never
shows. Isolates **shared visibility** rather than committing as such. Lower
priority: closer to a UX claim than to a recovery claim, and recovery metrics
may not detect a difference at all. Say so if you implement it.

### B5 — held-out domain

Any condition above, on a second reference fixture the interviewer prompt was
never tuned against. This is what actually addresses external validity; every
other condition is still development-case evidence. Needs a new fixture built
to the same conventions as `fixtures/itops_mtsr.yaml` (see §7.4).

**Suggested order:** B3, then B2, then B5. B4 last, if ever.

---

## 4. Invariants (non-negotiable)

**4.1 Never modify anything under `tests/evals/results/runs/`.** Those are the
paper's primary artifacts. New conditions write to a sibling directory
(`results/baselines/<condition>/<run-id>/`). If a condition needs a saved
run's transcript, open it read-only.

**4.2 Never leak the fixture into a condition that should not have it.** The
persona holds the hidden ground truth; interviewers and model-builders must
not. Any prompt you write must be checkable against this rule by reading it.
If a prompt contains fixture content, the condition is invalid, not merely
noisy.

**4.3 Hold the model fixed across compared conditions.** Same interviewer model
as the interactive runs (`gpt-5.5-2026-04-23`) unless model capability *is* the
factor under study. A condition run on a different model does not answer a
procedural question.

**4.4 Record provenance for every generated artifact:** model id, temperature
and any sampling params, prompt hash, input hash, timestamp, token usage. Copy
the `baseline-provenance.json` shape from B1. An artifact whose provenance is
unrecorded cannot enter the paper.

**4.5 Deterministic scoring is the comparison surface.** The semantic judge was
asked about the *interactive runs'* specific near-misses. Those verdicts do not
transfer to a different model's different near-misses, and re-judging is a new
model call with its own cost and its own provenance requirements. Compare on
the heuristic pass; if you want semantic figures for a new condition, judge it
explicitly and store the verdicts alongside, never reuse.

**4.6 Do not iterate a condition toward a preferred result.** If you change a
baseline prompt after seeing its score, you have started tuning it, and it is
no longer a baseline — it is a second treatment. Record every version you ran
and report the first pre-registered one. Prompt iteration is what made the
interactive runs development-case results in the first place; do not repeat
that mistake in the comparison arm.

**4.7 One call per artifact where possible; never a silent retry loop that
hides failures.** Reuse `RATE_LIMIT_MAX_ATTEMPTS` / `rateLimitBackoffMs` from
`tests/lib/liveOpenAi.mjs`. Never retry `insufficient_quota`.

---

## 5. Output contract

Each generated model must be written as `recovered-model.yaml` in exactly the
grammar the app's own export produces, because the scorer parses that shape:

```yaml
classes:
  ClassName:
    meaning: "One sentence."
    aliases: [term, other term]
    properties:
      propertyName:
        type: text | number | date | boolean
        allowed: [value-one, value-two]     # controlled sets only
relationships:
  - name: verbPhrase
    from: ClassName
    to: OtherClassName
    meaning: "One sentence."
    aliases: [phrasing]
rules: []
actions: []
```

Alongside it: `raw-response.md` (the untouched model reply) and
`baseline-provenance.json` (§4.4).

Profile constraints your prompts must state, because the reference model is
scored under them: flat classes with **no subclassing**; **exactly one directed
edge per real-world connection** (never also its inverse); properties only when
decision-relevant (skip identifier/URI-style fields); the expert's own
vocabulary for names and aliases.

---

## 6. Scoring

```sh
node tests/evals/score-baseline.mjs run-01 run-02 run-03
```

Scores a condition against `fixtures/itops_mtsr.yaml` with the same one-to-one
scorer, on both denominators (full domain primary; practical scope is a post
hoc sensitivity view), and prints per-dimension deltas against the interactive
run. Extend it for new conditions rather than forking it.

Supporting analyses that already exist and should be run on any new condition
that produces multiple runs: `cross-run-analyses.mjs` (set-level stability,
endpoint-conditioned relationship recovery) and `threshold-sensitivity.mjs`
(does the dimension ordering survive other matching thresholds?).

---

## 7. Known pitfalls in this codebase

**7.1 `js-yaml` is not vendored.** `npm install js-yaml@4` before running
anything that parses YAML, or you will get `ERR_MODULE_NOT_FOUND` from
`groundTruthModel.mjs`.

**7.2 A generated model can name an endpoint class it never declared.** The app
rejects such an edge; a one-shot generator does not. `score-baseline.mjs` drops
these and reports the count. Keep that behaviour — crediting an edge whose own
model cannot support it inflates the baseline.

**7.3 Model replies are not reliably bare YAML.** Handle fenced, unfenced, and
preamble-then-fence shapes, and **fail loudly** when no `classes:` block is
present rather than writing prose the scorer will silently misread.

**7.4 The fixture is preprocessed before scoring** (`groundTruthModel.mjs`):
subclass predicates and identifier/URI properties are excluded, and 12
reciprocal predicate pairs collapse into single scored units (120 raw object
predicates → 108 scored relationships; 111 scored properties). A new fixture
for B5 must follow the same conventions or its numbers will not be comparable.

**7.5 Matching thresholds live in one place** — the exported `MATCH_THRESHOLDS`
object. Do not reintroduce private per-module copies; that drift bug has
already been fixed once.

**7.6 Only the most recent live run's files are retained** under
`results/` by design, and re-scoring is *metric*-idempotent, not byte-identical
(timestamps). Do not "fix" either behaviour.

---

## 8. Acceptance checks (run these before reporting a condition as working)

1. **Identity check.** Score a condition directory whose `recovered-model.yaml`
   is a copy of the interactive run's model. Every delta must be exactly
   0 points in every dimension and both scopes. Non-zero means your parsing or
   scoring path diverges from the reference one.
2. **Degenerate-input check.** A near-empty model, and a model with an edge
   pointing at an undeclared class, must both score without crashing, and the
   dropped-edge count must be reported.
3. **Extraction check.** Bare YAML, ```` ```yaml ````-fenced, plain-fenced, and
   preamble-then-fenced replies all parse; a prose-only reply raises.
4. **No-mutation check.** `git status` shows nothing modified under
   `tests/evals/results/runs/`.
5. **Existing suites still green:**
   ```sh
   node --test tests/bipartite-matching.spec.mjs tests/one-to-one-scoring.spec.mjs \
                tests/ontology-recovery-metrics.spec.mjs
   python -m unittest discover -s tools -p "test_*.py"
   ```
   Full deterministic (non-browser) suite is 62/62; Python is 13/13.
6. **Dry run before spending calls.** Exercise the whole path on a synthetic or
   cached reply first. Checks 1–3 are all doable with zero API calls.

---

## 9. What to report back

For each condition: the single factor varied; what was held fixed; the prompts
(or their hashes) and model configuration; per-dimension F1 on both
denominators against the interactive runs; the dropped-edge count; total API
calls and token usage; and any deviation from this brief with its reason.

State the result plainly, in whichever direction it falls. A condition showing
that the interactive machinery does **not** earn its complexity on this fixture
is a finding, and the paper's claims will be narrowed to match rather than the
result being set aside.
