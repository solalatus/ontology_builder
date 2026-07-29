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
     essentially wrapped up (a cheap real classification call after each
     app-agent turn — `appearsFinished()` in `lib/conversationOrchestrator.mjs`);
   - `ONTOLOGY_EVAL_MAX_TURNS` turns (default 100);
   - `ONTOLOGY_EVAL_WALLCLOCK_MINUTES` wall-clock minutes (default 45).
4. Diffs the final recovered canvas model against the ground-truth fixture
   (`lib/recoveryMetrics.mjs`) and writes `results/report.md` +
   `results/conversation-log.md` — both fixed filenames, **overwritten every
   run**, gitignored (this is a report to read, not repo content).
5. `results/report.md` also includes one real LLM call's review of the full
   conversation, flagging errors and noteworthy events — defaults to
   whatever model the interviewer itself connected with, overridable via
   `ONTOLOGY_EVAL_REVIEW_MODEL`.

## Fixtures

`fixtures/itops_mtsr.yaml` and `fixtures/persona-eszter.md` are versioned,
unmodified copies of the uploaded ground-truth ontology and persona prompt.
They are not secrets — the ground truth is hidden only from the app agent
under test (which never sees this directory), not from the repo.

## The one deliberate edit to the ground truth

The user's own instruction was to trim the ground truth "based on the
handbook" before treating it as the recovery target. Implemented as a
documented, auditable filter in `lib/groundTruthModel.mjs`
(`isRecoverableProperty`), not a hand-edited copy of the fixture: any
property predicate whose target datatype is `identifier` or `uri` is
excluded from the comparison target. The app's own baked howto doc
(`AGENT_KNOWLEDGE` in `index.html`) explicitly tells the agent not to model
these ("Do not include technical fields that users never ask about"), so
scoring their absence as a recall failure would penalize the agent for
correctly following its own instructions. Everything else in the ~2800-line
fixture — all 68 classes, all 143 relationships, all 111 remaining
decision-relevant properties, every controlled-value set — is fair game.

## Metrics (see `lib/recoveryMetrics.mjs`)

Matching is heuristic token-set-overlap string comparison (normalized,
stopword-stripped, Jaccard ≥ 0.6), not an LLM judge — deterministic and
cheap, at the cost of missing recoveries phrased very differently from the
ground truth's own labels/aliases. A known limitation, not solved here to
keep this eval's own moving parts small.

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

## Expectation to set going in

The ground truth is large. A bounded interview — even up to 100 turns — will
realistically recover a minority of it, the same way a real human interview
would need several sessions for a domain this size. This eval's value is
trend-tracking (did a prompt or heuristic change move the recovery rate up
or down, did tool-call errors increase, did the interview get less
efficient) rather than expecting the composite score to approach 100%.

## Cost and configuration knobs

All environment-configurable, none hardcoded:

| Variable | Default | Purpose |
|---|---|---|
| `ONTOLOGY_EVAL_MAX_TURNS` | 100 | Hard turn cap |
| `ONTOLOGY_EVAL_WALLCLOCK_MINUTES` | 45 | Hard wall-clock cap |
| `ONTOLOGY_EVAL_PERSONA_MODEL` | `gpt-4o-mini` | Simulating Eszter is a lighter task than open-ended elicitation, so this defaults cheap |
| `ONTOLOGY_EVAL_CLASSIFIER_MODEL` | `gpt-4o-mini` | The cheap "does this look finished?" check |
| `ONTOLOGY_EVAL_REVIEW_MODEL` | (interviewer's own connected model) | The report's LLM-review call |

The interviewer side always uses whatever model the app's own real
default-model heuristic picks for the connecting key — that's the actual
behavior a real user gets, not a value to override here.

A full 100-turn run realistically costs well under a dollar (mini-tier
persona/classifier calls dominate call count; the interviewer's own calls
are comparatively few) but can take a meaningful fraction of the 45-minute
wall-clock budget if it never trips the early-stop check. For quick
iteration while changing this eval itself, override the turn cap down, e.g.:

```sh
ONTOLOGY_EVAL_MAX_TURNS=6 node --test tests/evals/*.eval.spec.mjs
```
