# Ontology translation tools

Compiles an external RDF/OWL ontology into this project's Agent Ontology
`.domain.yaml` format, per issue #102 (`RDF/OWL source -> deterministic
source IR -> LLM semantic compilation -> *.domain.yaml`). Everything for
this initiative lives under `ontology_translation/` at the repo root — see
issue #101's "Repository layout" note; nothing here touches `index.html`
or the app's own dependency-free constraint (spec.md §2). These are dev/
research tools only.

## Pipeline

```
fetch.py        source_url (+ pinned SHA-256) -> local RDF/OWL file
extract.py      RDF/OWL file -> source_ir.json  (deterministic, RDFLib, no LLM)
compile.py      source_ir.json -> N x {run-i.domain.yaml, run-i.translation.json}  (Azure OpenAI GPT-5.4)
validate_domain.py   structural hard gate on a .domain.yaml (also called by compile.py after every run,
                     and reused by evaluate.py's layer-1 gate — see issue #103, not yet built)
```

`source_manifest.py` reads/writes the `source-manifest.yaml` every domain
carries — the reproducibility record (source URL, pinned SHA-256, scope
roots, compiler prompt version and run count) required by issue #101.

## Setup

```sh
pip install -r ontology_translation/tools/requirements.txt
```

Azure credentials go in a `.env` file at the repo root (gitignored, see
`.gitignore` line 5 — **never commit it**), same convention as
`tests/lib/env.mjs`/`AZURE_OPENAI_API_KEY` for the main app's live tests:

```
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-5.4
```

`AZURE_OPENAI_DEPLOYMENT` is the resource-owner-chosen deployment name, not
necessarily the literal model id — confirm it against the actual Azure
resource before a live run. Environment variables win over `.env` if both
are set (`env.py`, mirrors `tests/lib/env.mjs` exactly).

## Running a domain

```sh
python3 ontology_translation/tools/fetch.py --manifest path/to/source-manifest.yaml --out path/to/source.ttl
python3 ontology_translation/tools/extract.py --input path/to/source.ttl --manifest path/to/source-manifest.yaml --out path/to/source_ir.json
python3 ontology_translation/tools/compile.py --source-ir path/to/source_ir.json --manifest path/to/source-manifest.yaml --out-dir path/to/domain-dir --dry-run
```

**Always run `compile.py` with `--dry-run` first on a new domain.** It
assembles the exact prompts and prints an approximate cost estimate
without calling the API or writing anything — drop `--dry-run` only once
that number looks right.

## Cost and monitoring

Every real `compile.py` run:

- prices itself using Azure GPT-5.4 Global Standard rates ($2.50/$15 per 1M
  input/output tokens, $0.25/1M for cached input — see the Aug-2026 cost
  estimate this pipeline was budgeted from) and reports actual cost per
  call from the real token usage the API returns, not just the pre-flight
  estimate;
- writes a structured JSONL event to `<out-dir>/run.log.jsonl` **and**
  stdout at every milestone (call start/end, tokens, cost, structural
  validation result per run) — `tail -f run.log.jsonl` on a long-running
  compile to watch it live;
- writes `<out-dir>/run-manifest.json` at the end: deployment, api version,
  prompt version, and per-run token/cost/validation figures, for
  reproducibility.

## Testing

```sh
python3 -m unittest discover -s ontology_translation/tools/tests -p "test_*.py" -t ontology_translation/tools
```

Every test except one is offline and deterministic — mocked Azure client,
no network, no credentials, no cost — matching this repo's existing
`tests/README.md` convention of keeping the default suite free to run.

`test_compile_live.py` is the one exception, mirroring
`helper-agent-live-azure.spec.mjs` exactly: included in normal discovery,
but skips with a clear reason unless `AZURE_OPENAI_ENDPOINT` and
`AZURE_OPENAI_API_KEY` are both set (env or `.env`). When they are, running
the suite makes one real, cheap compiler pass (a 2-class synthetic
ontology, a fraction of a cent) against the live Azure resource — this is
what actually caught real integration issues a mocked client cannot (see
`ontology_translation/TODO.md`'s Log). Never runs in CI; only when
credentials are deliberately provided locally. Beyond that one file, the
real pipeline is only ever invoked explicitly via the CLI commands above.

## Scope selection

`extract.py --manifest` reads `scope.roots` from the manifest and walks
`rdfs:subClassOf` in both directions from whatever matches, keeping only
that connected slice of classes (plus any property whose domain/range
lands inside it) — this is what keeps a large upstream ontology like Brick
or FIBO from blowing the compiler's context. Root matching is exact
(case-insensitive) against a class's local name or any of its labels, not
substring containment — `roots: [Fan]` means the class named Fan, not every
class whose name happens to contain "fan".

Taxonomy (`subClassOf`) is used for scope selection and interpretation
only — per issue #102, it must never itself become a `relationships` entry
in the compiled output. `compile.py`'s prompt (`prompts/compiler-v1.md`)
enforces this on the LLM side; `validate_domain.py` cannot detect a
smuggled-in taxonomy edge structurally, since it would look like any other
relationship — that's part of what #103's semantic judging layer is for.

## Prompt versioning

`prompts/compiler-v1.md` is self-contained (it embeds its own copy of the
target `.domain.yaml` schema rather than referencing `agent_ontology_spec.md`
live) so a pinned `compiler.prompt_version` in a domain's
`source-manifest.yaml` stays reproducible even if the spec doc changes
later for unrelated reasons. A wording change to that file is a new
version (`compiler-v2.md`, ...), never an in-place edit.
