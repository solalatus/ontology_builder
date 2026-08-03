# Knowledge Graph Canvas

A single-file, offline-first visual editor for building small-to-medium
knowledge graphs / ontologies by hand: draggable entity boxes, labeled
directional or bidirectional relations, fast infinite-zoom canvas
interaction, and explicit export/import to versioned files on disk (JSON
canonical + plain-text edge list). It's meant to sit upstream of a
GraphRAG/n8n-style pipeline: sketch an ontology by hand, export it in a form
immediately usable by scripts or an LLM, or edit the exported text directly
and bring it back in. Full design rationale: `spec.md`.

Built on top of that base editor, an **Agent Ontology** layer
(`agent_ontology_spec.md`) adds domain-model authoring — classes,
relationships, rules, and actions, exportable as a structured YAML domain
model — and a **Helper Agent** (`helper_agent_plan.md`, on the `helper_agent`
branch) adds an embedded, bring-your-own-key chat panel that can interview a
user and build/edit that same domain model live on the canvas through tool
calls, with its own conversation persisted across reloads.

## Running it

No install, no build step. Open `index.html` directly in a browser
(Chrome/Chromium/Brave on desktop, Chrome on Android — see `spec.md` §3.1
for the exact platform/storage-capability matrix). `index.html` is the
entire client application — every other file in this repository is either
documentation or dev-only test tooling; the shipped app has zero runtime
dependencies.

## Running the tests

```sh
npm install
npx playwright install chromium
node --test tests/*.spec.mjs
```

See `tests/README.md` for the full test-suite layout, and
`tools/test_load_edge_list.py` / `python3 -m unittest discover -s tools -p
"test_*.py"` for the plain-text edge-list importer's own Python-side tests
(`tools/load_edge_list.py`).

## Reproducing the ontology-recovery eval

The `helper_agent` branch includes a separate, opt-in eval
(`tests/evals/`) that simulates a full ontology-elicitation interview
between the real Helper Agent and a second, independent LLM playing a
domain-expert persona, then scores how much of a hidden ground-truth
ontology the interview actually recovered. Not part of the default test
run — see `tests/evals/README.md` for the full methodology (including its
own documented limitations), cost/configuration knobs, and exactly which
files under `tests/evals/results/` a reported run's numbers come from
(`report.md`'s headline table, plus `recovered-model.yaml`,
`heuristic-matches.json`, `semantic-judgments.json`, and
`semantic-matches.json` for auditing the specific pairings/judgments behind
those numbers). Requires `OPENAI_API_KEY`:

```sh
node --test tests/evals/*.eval.spec.mjs
```

## Repository layout

- `index.html` — the entire client application (single file, spec.md §2).
- `spec.md` / `TODO.md` — the base canvas editor's design spec and
  phase-by-phase progress log.
- `agent_ontology_spec.md` / `agent_ontology_todo.md` — the domain-model
  authoring layer's spec and progress log.
- `helper_agent_plan.md` / `helper_agent_todo.md` — the embedded chat
  agent's design plan and progress log (a standalone subproject on the
  `helper_agent` branch — see that document's own §0 for why it's never
  merged into `main`).
- `tests/` — the Node-based Playwright test suite for `index.html`,
  including the `tests/evals/` ontology-recovery eval.
- `tools/` — a small Python utility (`load_edge_list.py`) for
  programmatically producing the plain-text edge-list import format, plus
  its own test suite.

## License

MIT — see `LICENSE`.
