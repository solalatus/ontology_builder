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
- `phase0.spec.mjs`, `phase1.spec.mjs`, ... — one file per TODO.md phase.

## The `window.__kg` test hook

`index.html` exposes a small `window.__kg` object (state, camera, and the
same action functions the UI's own event handlers call) purely for test
introspection and setup. It's additive — the app works identically whether
or not anything reads it — and tests assert against it directly (e.g.
`window.__kg.state.nodes`) instead of only inferring outcomes from pixels,
while still driving interactions through real pointer/keyboard events so
the UI wiring itself is exercised end-to-end.
