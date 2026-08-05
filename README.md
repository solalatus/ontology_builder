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
model — and a **Helper Agent** (`helper_agent_plan.md`) adds an embedded,
bring-your-own-key chat panel that can interview a user and build/edit that
same domain model live on the canvas through tool calls, with its own
conversation persisted across reloads.

## Companion paper

This repository is the reference implementation and evaluation artifact for
the paper *"Conversational Elicitation of Shared Domain Representations for
Human–Agent Collaboration"* (Szabados & Kiss). Every number in the paper's
tables is re-derivable from the persisted artifacts in this repository
without an API key:

- **Reference fixture & persona** (paper Table 1): `tests/evals/fixtures/itops_mtsr.yaml`,
  `tests/evals/fixtures/persona-eszter.md`.
- **Interactive runs** (Tables 2–4): `tests/evals/results/runs/run-01..03/` —
  each with full transcript (`conversation-log.md`), raw tool-call log,
  recovered model (`recovered-model.yaml`), per-item heuristic matches,
  semantic-judge verdicts, and aggregate metrics; rescore offline with
  `tests/evals/rescore-saved-run.mjs`.
- **Comparison conditions B1/B2/B3** (Table 5):
  `tests/evals/results/baselines/{b1-one-shot,b2-generic-interviewer,b3-no-commit}/`,
  scored via `tests/evals/score-baseline.mjs`.
- **Endpoint-conditioned analysis and set-level stability**: `tests/evals/cross-run-analyses.mjs`.
- **Threshold sweep**: `tests/evals/threshold-sensitivity.mjs`.
- **Interviewer system prompt**: in `index.html` (search for the staged
  interview prompt); persona and stopping configuration are recorded per run.

See `tests/evals/README.md` for the full methodology and its documented
limitations.

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

The repository includes a separate, opt-in eval
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
  agent's design plan and progress log.
- `tests/` — the Node-based Playwright test suite for `index.html`,
  including the `tests/evals/` ontology-recovery eval.
- `tools/` — a small Python utility (`load_edge_list.py`) for
  programmatically producing the plain-text edge-list import format, plus
  its own test suite.

## License

MIT — see `LICENSE`.
