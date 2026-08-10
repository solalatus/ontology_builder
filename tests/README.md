# Tests

Automated smoke/behavior tests for `index.html`, using Node's built-in test
runner (`node:test`) driving a real headless Chromium via Playwright. This
is dev-only tooling — it never ships as part of the app, and `index.html`
remains a single dependency-free file regardless of whether these tests are
ever run (spec.md Section 2).

See `TODO.md`'s "Testing Strategy" section for how this fits into the
overall per-phase testing approach (this is Tier A; Tier B is the manual
checklist listed per phase in TODO.md).

## Running

```sh
node --test tests/*.spec.mjs
```

Requires Playwright and a Chromium binary. If this repo has no local
`node_modules`, install it first:

```sh
npm install
npx playwright install chromium
```

Playwright is a pinned `devDependency` in `package.json` (`^1.56.1`, the
version this project was actually developed and tested against), so plain
`npm install` resolves it reproducibly — no separate `npm install -D
playwright` step needed.

`tests/lib/browser.mjs` also tolerates a Playwright installed globally
outside the project (as pre-configured in the Claude Code sandbox this
project was originally built in, under `/opt/node22` +
`/opt/pw-browsers/chromium`) — if `import('playwright')` fails to resolve
as a normal project dependency, it falls back to that fixed path. That
fallback is sandbox-specific and may not exist on your machine; the
`npm install` path above is the portable one.

`package.json`'s other committed dependency is `js-yaml`, used to parse the
ontology-recovery ground-truth fixture (`tests/evals/lib/groundTruthModel.mjs`)
— not only by the opt-in eval itself, but also by
`tests/ontology-recovery-metrics.spec.mjs`'s always-run, API-free unit tests
against the same loader, so it's a dependency of the default suite too, not
just the opt-in one. Plain `npm install` in the repo root picks it up
regardless. `index.html` itself remains a single dependency-free file
regardless (spec.md Section 2); this
is dev-only test tooling, same as Playwright.

## Layout

- `lib/browser.mjs` — Playwright chromium launcher w/ the fallback above.
- `lib/page.mjs` — shared `withPage()` helper (opens `index.html`, fails
  the test on any console/page error, always closes the browser) and small
  UI-flow helpers reused across spec files.
- `lib/server.mjs` — tiny dependency-free static file server, used only by
  `phase4.spec.mjs` to exercise the OPFS storage backend for real (it
  throws under `file://`, see TODO.md's Phase 4 Log entry).
- `fixtures/*.txt` — TXT edge-list files used by both `phase6.spec.mjs`
  (the app's own importer) and `../tools/test_load_edge_list.py` (the
  standalone Python reference loader), so both are checked against one
  shared set of examples instead of two that could drift apart.
- `fixtures/accented-roundtrip.json`, `fixtures/legacy-named_v0007_*.json` —
  canonical JSON exports for `json-import.spec.mjs`. Synthetic, but shaped
  after a real user's file: non-ASCII labels, meanings and property names
  throughout, non-default box geometry, an undirected edge, allowed-value
  lists, rules and actions. The `legacy-named_*` one is the same graph with
  `meta.graph_name` removed, standing in for every export written before
  that field existed — its name has to come back from the filename instead.
- `phase0.spec.mjs`, `phase1.spec.mjs`, ... — one file per TODO.md phase.
- `json-import.spec.mjs` — the canonical JSON round trip (`spec.md` §5.5):
  what Save Version writes must reopen identically, including ids,
  coordinates, the version chain and the graph name. Also covers merge
  semantics, id-counter safety, undo, and tolerance of hand-damaged files.
- `import-routing.spec.mjs` — which file reaches which importer (`spec.md`
  §5.6), and what the dialog does with a file it can't import. The
  regression it exists for: an unimportable file used to offer Merge and
  Replace anyway, with Replace ready to wipe the graph "to match" content
  the app had never parsed.
- `yaml-robustness.spec.mjs` — the hand-rolled domain-model YAML parser,
  construct by construct (flow collections, quoting styles, block scalars,
  comments, indentation widths). Deliberately granular: unsupported YAML in
  this parser degrades *silently* into an empty field rather than raising,
  so happy-path coverage alone would not have caught either of the two real
  bugs this file now pins.
- `filename-sanitization.spec.mjs` — graph-name → filename reduction
  (`spec.md` §5.4), both halves: names in any script survive, and characters
  that genuinely break filesystems still don't.
- `python-parity.spec.mjs` — runs `../tools/load_edge_list.py` as a
  subprocess against every fixture and diffs its output against the JS
  importer's `parseTxtImport()`, proving the two agree rather than just
  asserting it in a comment. Skips gracefully (with a console warning, not
  a failure) if `python3` isn't on `PATH` — see "Python tests" below.

## Live OpenAI integration tests (opt-in)

`helper-agent-live-openai.spec.mjs` is the one file in this suite that makes
genuine calls to the real OpenAI API instead of mocking `page.route()` —
every other `helper-agent-*` spec is fully mocked, deterministic, and needs
no secret. It exists to catch the class of bug a hand-authored mock can
never catch: a mismatch between what the code *assumes* the live API
returns and what it actually returns today. It found two real bugs this way
(see `helper_agent_todo.md`'s Log for the account) — a default-model
heuristic that picked a specialty/incompatible model against a real
account's model list, and a 429 error message that conflated a transient
rate limit with a permanently exhausted quota.

Opt-in: skips every test, with a clear reason, unless `OPENAI_API_KEY` is
set. Put it in a `.env` file at the repo root (`OPENAI_API_KEY=sk-...`) —
`.env` is gitignored and must never be committed — or export it in the
environment; either way `tests/lib/env.mjs` picks it up (environment wins
over `.env` if both are set). Costs a small amount of real money per run (a
handful of cheap chat-completion calls); never runs in CI, only when a key
is deliberately provided.

## Azure OpenAI support

The helper agent's BYOK connect flow accepts either an OpenAI key or an
Azure OpenAI key + resource endpoint — entering an endpoint is the only
signal that switches provider (see `isAzureProvider()` in `index.html`).
The two APIs differ in more than just the URL: Azure uses an `api-key`
header instead of `Authorization: Bearer`, requires an explicit
`api-version` query param on every request, addresses a model via a
resource-owner-chosen *deployment* name in the URL path rather than a
`model` field in the body, and its deployment-list response shapes each
entry differently from OpenAI's `/v1/models` (an `id` that's the arbitrary
deployment name, and a separate `model` field for the actual underlying
model — which is what the reasoning/chat-model default-picking heuristics
read, not the deployment name).

`helper-agent-azure-openai.spec.mjs` covers all of this fully mocked — no
key or endpoint needed, always runs, deterministic in CI, same as every
other non-live `helper-agent-*` spec.

`helper-agent-live-azure.spec.mjs` mirrors `helper-agent-live-openai.spec.mjs`
for the Azure code path — genuine calls to a real Azure OpenAI resource, to
catch a mismatch between what the code assumes the live deployments-list/
chat-completions response shape is and what a real resource actually
returns. Opt-in: skips every test, with a clear reason, unless **both**
`AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT` are set (same `.env`/
environment convention as `OPENAI_API_KEY` above — `AZURE_OPENAI_ENDPOINT`
is the resource's own base URL, e.g. `https://your-resource.openai.azure.com`).
A key alone can't be used to run these: unlike OpenAI's single global API
host, an Azure OpenAI key is only meaningful against the specific resource
it belongs to. Costs a small amount of real money per run; never runs in
CI, only when both are deliberately provided.

Either live suite is independent of the other — set only `OPENAI_API_KEY`
to exercise the OpenAI live path, only the two Azure variables to exercise
the Azure live path, or both to exercise both; the mocked suites for both
providers always run regardless of what's configured.

## Ontology-recovery eval (opt-in, separate from the main suite)

`tests/evals/ontology-recovery.eval.spec.mjs` simulates a full ontology-
elicitation interview between the app's real helper agent and a second,
independent LLM playing a domain-expert persona grounded in a hidden
ground-truth ontology, then reports how much of it the interview recovered.
Lives under `tests/evals/` specifically so `tests/*.spec.mjs` never sweeps
it in — run it explicitly:

```sh
node --test tests/evals/*.eval.spec.mjs
```

Same `OPENAI_API_KEY`/`.env` convention as the live suite above, plus its
own env-configurable turn/wall-clock/model budget. See
`tests/evals/README.md` for the full design writeup — it's a report-
generating eval, not a strict pass/fail test, and costs meaningfully more
time/money per run than anything else in this directory.

The most recent live run's actual output — `tests/evals/results/report.md`
(metrics + LLM review), `conversation-log.md` (human-readable transcript),
`tool-calls.md` (raw tool-call arguments/results) — is **committed to the
repo**, not gitignored, and gets refreshed with every PR that includes a
new live run. Only the latest run's files are ever present (each write
overwrites the previous run, never accumulates), so those three files under
`tests/evals/results/` are always the current, real record of the most
recent run — read them directly, no need to re-run the eval just to see
what the last one found.

## Python tests

`tools/load_edge_list.py` (the reference loader from spec.md's Appendix,
kept in sync with it by hand) has its own suite, `tools/test_load_edge_list.py`
— standard library only (`unittest`), no dependencies:

```sh
python3 -m unittest discover -s tools -p "test_*.py"
```

It reuses the same `tests/fixtures/*.txt` files the JS suite does. Run both
suites (JS + Python) before considering Phase 6-related changes done —
`tests/python-parity.spec.mjs` (part of the JS suite above) additionally
cross-checks the two against each other directly.

## The `window.__kg` test hook

`index.html` exposes a small `window.__kg` object (state, camera, and the
same action functions the UI's own event handlers call) purely for test
introspection and setup. It's additive — the app works identically whether
or not anything reads it — and tests assert against it directly (e.g.
`window.__kg.state.nodes`) instead of only inferring outcomes from pixels,
while still driving interactions through real pointer/keyboard events so
the UI wiring itself is exercised end-to-end.
