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
npm install -D playwright
npx playwright install chromium
```

`tests/lib/browser.mjs` also tolerates a Playwright installed globally
outside the project (as pre-configured in the Claude Code sandbox this
project was originally built in, under `/opt/node22` +
`/opt/pw-browsers/chromium`) — if `import('playwright')` fails to resolve
as a normal project dependency, it falls back to that fixed path. That
fallback is sandbox-specific and may not exist on your machine; the
`npm install` path above is the portable one.

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
- `phase0.spec.mjs`, `phase1.spec.mjs`, ... — one file per TODO.md phase.
- `python-parity.spec.mjs` — runs `../tools/load_edge_list.py` as a
  subprocess against every fixture and diffs its output against the JS
  importer's `parseTxtImport()`, proving the two agree rather than just
  asserting it in a comment. Skips gracefully (with a console warning, not
  a failure) if `python3` isn't on `PATH` — see "Python tests" below.

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
