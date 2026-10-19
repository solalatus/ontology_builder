# Knowledge Graph Canvas

A single-file, offline-first visual editor for building small-to-medium
knowledge graphs / ontologies by hand: draggable entity boxes, labeled
directional or bidirectional relations, fast infinite-zoom canvas
interaction, and explicit export/import to versioned files on disk. It's
meant to sit upstream of a GraphRAG/n8n-style pipeline: sketch an ontology by
hand, export it in a form immediately usable by scripts or an LLM, or edit
the exported text directly and bring it back in. Full design rationale:
`spec.md`.

The toolbar's **Export** button (formerly "Save Version") asks what to write.
**Results only** writes three files side by side, and all three can be
imported back through the same button:

| File | What it is | Re-import restores |
|---|---|---|
| `.json` | canonical, full-fidelity (`spec.md` §5.1) | everything — ids, positions, box sizes, and the version history, so the next save continues the same numbered series |
| `.txt` | portable edge list, structure only (§5.2) | nodes and relations; positions are not in the format, so the graph is re-laid out |
| `.domain.yaml` | domain model (`agent_ontology_spec.md` §5) | competency questions, classes, relationships, rules and actions; no positions or ids |

The `.txt` and `.domain.yaml` are the hand-editable, pipeline-friendly ones;
the `.json` is the one to reopen when you want the canvas back exactly as you
left it.

**Whole conversation and session results** writes the same three files plus
one session bundle, `<name>_vNNNN_<timestamp>.session.json` (issue #165) — a
single file a study participant can hand back. It holds:

| Field | Contents |
|---|---|
| `format`, `format_version` | `"kg-session-bundle"`, `1` |
| `app` | page name/file, `document.lastModified`, UI language, and `index_html_sha256` (the exact page bytes; only when the page is served over http(s) — a `file://` page cannot read itself, so it is `null` there) |
| `saved_at`, `graph_name`, `graph_meta` | when, which graph, its version metadata |
| `exports` | the `.json`, `.txt` and `.domain.yaml` texts, byte-identical to the three files written alongside |
| `conversation.transcript` | the Helper Agent chat as shown in the panel |
| `conversation.api_messages` | the API-level history, every tool call and tool result included |
| `interviewer` | model name, provider (`openai`/`azure`/`bedrock`), and the system prompt exactly as the page builds it, with its SHA-256 |
| `checks` | current consistency-checker findings, plus the latest model-based contradiction and competency-question coverage results if they were run |
| `usage` | every model call of the conversation with its kind (`interview`, `compaction`, `consistency_llm`, `cq_coverage`, `import_merge`, `import_suggest`), model, served model, provider and the provider's `usage` object verbatim (prompt, cached, cache-write, completion and reasoning tokens); plus totals per kind and overall, with the cache-hit share. Counts only, never priced. Kept with the conversation: it survives a reload, and Restart Conversation starts a new log (issue #177) |

It never contains the API key, the Azure endpoint/api-version, the Bedrock
region/endpoint, or any other connection setting beyond the model name. As a
second safeguard, the file is scrubbed of the live key, the endpoint, and
anything shaped like an OpenAI (`sk-`) or Bedrock (`ABSK`,
`bedrock-api-key-`) key, such as one pasted into the chat. Exporting never changes the
interviewer prompt or the agent's behaviour. With Folder Sync granted, the
bundle is written to the folder like the other three files.

**Clear** removes the whole domain model — classes, relationships,
competency questions, rules and actions — as one undoable step; the confirm
dialog lists what it will remove, with counts, and (when a Helper Agent
conversation exists) offers to restart that conversation too, which is not
undoable and therefore off by default.

Built on top of that base editor, an **Agent Ontology** layer
(`agent_ontology_spec.md`) adds domain-model authoring — competency
questions, classes, relationships, rules, and actions, exportable as a
structured YAML domain model — and a **Helper Agent**
(`helper_agent_plan.md`) adds an embedded, bring-your-own-key chat panel
that can interview a user and build/edit that same domain model live on the
canvas through tool calls, with its own conversation persisted across
reloads. The key can be an OpenAI key, an Azure OpenAI key with its resource
endpoint, or an **AWS Bedrock** API key with its region (issue #183). Pick
the provider from the small "Other provider" row under the key field; a
pasted Bedrock key selects Bedrock by itself. Bedrock is reached through
its bedrock-mantle endpoint, the one Bedrock endpoint a browser may call,
and every model call (the interview, compaction, the model-based checks,
import merge) goes to the same provider. A fresh connection lands on
**GPT-6.1-sol** whenever the key can reach it, whatever the provider. The
model is recognised by its actual identity, not its listed name:
`gpt-61-sol`, `GPT 6.1 Sol`, Bedrock's `openai.gpt-6.1-sol`, dated snapshots
and `-preview` all count; `-mini` or `6.10` do not. Without it, the newest
standard reasoning model is chosen as before, and any model can still be
picked by hand (issue #178).

**Competency questions** (issue #94) are the requirements the rest of the
model answers to: the real questions the future agent must be able to answer,
or have enough domain orientation to work out how to answer. They are
requirements *on* the ontology rather than elements of it — they never become
canvas boxes, and they are explicitly not runtime instance data. A
satisfactory model does not contain the answer to "which escalation policy
applies to this support request?"; it contains enough orientation for the
future agent to know which concepts, relationships, rules, actions and
verification steps are involved in getting there. You can elicit them
conversationally (the Helper Agent's first interview phase), write them by
hand in the Domain Model panel, or import them — a `.domain.yaml` containing
nothing but a `competency_questions:` section is a valid import, so an
external requirements process can seed a model with them. The canonical
`.json` and the `.domain.yaml` both preserve them; the `.txt` edge list
deliberately does not, since it remains the lossy nodes/edges view.

A **consistency checker** runs over the model after every edit — yours or the
agent's — and reports contradictions it can prove: a rule requiring a value its
property does not allow, an action whose preconditions reason about a class
unreachable from its own input, a relationship silently dropped because an
endpoint class does not exist. It is deterministic and needs no API key; a
`Check` button in the toolbar opens the findings, and stays quiet while a model
is merely unfinished. It also notes, without calling it a contradiction, a class
whose name says it is a kind of another (`StorageFacility`, `Facility`) when
nothing connects the two: the tool has no subclass link, so such a subtype
needs either a property on the general class or a real relationship (issue
#155). Notes like this stay in the panel and are never handed to the Helper
Agent. An optional pass that also asks the connected model to
look for contradictions runs from the same panel; it is on by default (issue
#89) but can be switched off there, and only ever runs on an explicit click —
nothing is sent anywhere on its own. Importing a domain-model file reports
the same way before you commit: the dialog says how many contradictions
Merge or Replace would each leave behind — separately, because they give you
different models — and neither is blocked.

A separate, optional **competency-question coverage** check lives in the same
panel, shown only once the model has questions to check. It asks the connected
model whether the ontology gives a future agent enough orientation to address
each question, and reports `covered` / `partial` / `not covered` with concise
evidence and, where relevant, the specific gap. It answers a genuinely
different question from the consistency checker — a model can be perfectly
self-consistent and cover its questions badly, or the reverse — so the two are
never merged into one score, and a coverage verdict is always labelled as the
model judgement it is, never as deterministic proof. One click is one API
call, results are read-only (nothing is ever auto-edited from them), and any
edit to the ontology or the question list clears them rather than showing you
a verdict about a model you have already changed. No RDF, SPARQL, SHACL or
OWL formalization is performed anywhere in this: the questions stay natural
language, and so does the judgement.

## Interview field guide

`Ontology_Interview_One_Page_Guide.pdf` is a printable one-page cheat sheet
for running a domain-expert interview by hand — the same elicitation
structure the Helper Agent follows. It covers the six building blocks
(things, properties, relationships, rules/constraints, actions,
results/states) with worked examples from two domains, a quick
thing-vs-property classification test, a minimal interview progression, a
live note-taking format, and the six exact questions to ask. Useful either
as a human fallback when there's no API key, or as a reviewer's checklist
for what an agent-run interview should have covered.

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
- `Ontology_Interview_One_Page_Guide.pdf` — printable one-page field guide
  for running the elicitation interview by hand.
- `tests/` — the Node-based Playwright test suite for `index.html`,
  including the `tests/evals/` ontology-recovery eval.
- `tools/` — a small Python utility (`load_edge_list.py`) for
  programmatically producing the plain-text edge-list import format, plus
  its own test suite; `layout-bench.mjs`, the autolayout benchmark harness
  whose outputs live in `tools/layout-bench-out/`; and `zoom-check.mjs`, a
  multi-zoom visual-QA script that screenshots the same laid-out graph at
  several zoom levels (issue #64).

## License

MIT — see `LICENSE`.
