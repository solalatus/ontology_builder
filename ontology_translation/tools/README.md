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
                     and reused by evaluate.py's layer-1 gate)
evaluate.py     automatic translation-quality evaluation, issue #103 (8 layers: structural + provenance +
                     relationship/action endpoint-citation hard gates, independent semantic judging,
                     stability, reverse coverage, round-trip, competency-question support)
repair.py       targeted repair pass for elements evaluate.py's semantic judging rejected -- standing
                     policy: reground/replace before drop, drop only as a last resort (see prompts/repair-prompt.md)
reinstate.py    the symmetric pass for the opposite direction: source elements evaluate.py's
                     disposition-judging found were EXCLUDED with an unjustified or boilerplate reason
                     (see prompts/reinstate-prompt.md)
run_pipeline.py single-command orchestration of everything above -- see "Running a domain" below
```

`index.html` also imports/exports this exact `.domain.yaml` format
(`agent_ontology_spec.md` §11 Phase G) — nothing in this `tools/` folder
touches it, and it stays a single dependency-free file regardless of what's
installed here, but the *format* has to actually agree between the two
independent parsers (this pipeline's Python/PyYAML side and `index.html`'s
own hand-rolled JS importer). It didn't, for real committed output, until
2026-08-17 — see `ontology_translation/TODO.md`'s Log for the two parser
bugs that were found and fixed in `index.html` itself.

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

### The one-command way: `run_pipeline.py`

```sh
python3 ontology_translation/tools/run_pipeline.py \
  --manifest path/to/source-manifest.yaml --out-dir path/to/domain-dir --dry-run
```

Chains every stage above in order — fetch → extract → compile → evaluate →
(repair/reinstate as needed, looped up to `--max-fix-rounds`, default 2) →
final evaluate — using each tool's own CLI conventions and file layout, so
its output is identical to running the steps by hand. `--dry-run` runs
fetch+extract for real (both are free — no API call, no Azure needed) and
stops at `compile.py`'s own `--dry-run` cost estimate, same as running
`compile.py --dry-run` directly; drop it only once that estimate looks
right. Exit code reflects the *final* evaluation's `hard_gates_ok`, not
just whether every stage ran without crashing — a pipeline that completes
but leaves hard gates failing is still a failure. `--source-file` skips
`fetch.py` and uses an already-downloaded file instead (useful for
re-running against a file you've already fetched and want to keep using,
without re-downloading or re-pinning).

**What the automatic repair/reinstate loop can and can't fix.** It builds
`repair.py`'s and `reinstate.py`'s input batches directly from
`evaluate.py`'s own report (the exact translation of "read the report,
build the next tool's input" this session did by hand every round before
this existed) — so it fixes exactly what a human following the same
process would fix: majority-unsupported content (via `repair.py`) and
unjustified exclusions (via `reinstate.py`). It does **not** attempt to
fix `structural_validity` or `endpoint_citation_completeness` failures
automatically — those indicate a real compile-time defect, not a judged
content problem, and stops with a clear message instead of looping
uselessly. It also won't loop forever chasing an unfixable gap: if a round
makes no real progress, or `--max-fix-rounds` is exhausted, it stops and
reports the true final state rather than pretending success. Some things
it legitimately can't fix at all — a competency question the source
ontology, as scoped, genuinely has no material for is not a repair.py/
reinstate.py problem, and forcing one to "pass" would mean fabricating
content, which every prompt in this pipeline is built to refuse.

### The manual, step-by-step way

Useful for inspecting intermediate output, re-running a single stage, or
building the repair/reinstate batches yourself with human judgment in the
loop (how every real fix on Brick HVAC was actually made — see
`ontology_translation/TODO.md`'s Log):

```sh
python3 ontology_translation/tools/fetch.py --manifest path/to/source-manifest.yaml --out path/to/source.ttl
python3 ontology_translation/tools/extract.py --input path/to/source.ttl --manifest path/to/source-manifest.yaml --out path/to/source_ir.json
python3 ontology_translation/tools/compile.py --source-ir path/to/source_ir.json --manifest path/to/source-manifest.yaml --out-dir path/to/domain-dir --dry-run
python3 ontology_translation/tools/evaluate.py --domain-yaml path/to/domain-dir/run-1.domain.yaml --translation path/to/domain-dir/run-1.translation.json --source-ir path/to/source_ir.json --manifest path/to/source-manifest.yaml --out-dir path/to/eval-out
python3 ontology_translation/tools/repair.py --domain-yaml path/to/domain-dir/run-1.domain.yaml --translation path/to/domain-dir/run-1.translation.json --rejected path/to/rejected.json --source-context path/to/source-context.json --out-dir path/to/repair-out
python3 ontology_translation/tools/reinstate.py --domain-yaml path/to/domain-dir/run-1.domain.yaml --translation path/to/domain-dir/run-1.translation.json --flagged path/to/flagged.json --out-dir path/to/reinstate-out
```

`repair.py --rejected`/`--source-context` and `reinstate.py --flagged`
take hand- (or script-) built JSON — see each file's own `--help` for the
exact shape, or `run_pipeline.py`'s `_build_repair_batch`/
`_build_reinstate_batch` for a worked, generic example of deriving them
from `evaluate.py`'s report.

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

`test_repair.py` and `test_reinstate.py` follow `test_compile.py`'s
convention exactly (mocked client, no live variant of their own yet) — the
actual live repair/reinstate passes on Brick HVAC were run directly via
each tool's CLI, not through these test files, same as every other real
domain run.

`test_run_pipeline.py` tests `run_pipeline.py`'s batch-builder functions
directly (pure/deterministic, no mocking needed) plus one dry-run
integration test that exercises fetch-skip → real extract → compile
`--dry-run` against a local fixture file — no network, no credentials, no
cost, same as everything else in this suite.

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
in the compiled output. `compile.py`'s prompt (`prompts/compiler-prompt.md`)
enforces this on the LLM side; `validate_domain.py` cannot detect a
smuggled-in taxonomy edge structurally, since it would look like any other
relationship — that's part of what #103's semantic judging layer is for.

## The prompt file

There is one current prompt, `prompts/compiler-prompt.md` -- deliberately
not a `compiler-v1.md`/`compiler-v2.md`/... lineage of parallel files.
Past wording is recovered from git history
(`git log -p -- ontology_translation/tools/prompts/compiler-prompt.md`),
not from multiple files sitting in this folder. It's self-contained (it
embeds its own copy of the target `.domain.yaml` schema rather than
referencing `agent_ontology_spec.md` live) so a run stays reproducible even
if the spec doc changes later for unrelated reasons. Every real compile run
records the prompt file's SHA-256 in `run-manifest.json`
(`compile.py`'s `prompt_sha256()`), which is what actually pins a specific
run to specific wording -- a manifest's `compiler.prompt_version` is just a
free-text label for context, not a file selector.

`prompts/repair-prompt.md` and `prompts/reinstate-prompt.md` are two
further, separate prompt files for `repair.py`'s and `reinstate.py`'s
narrower passes (see the Pipeline section above) -- deliberately not
variants of `compiler-prompt.md`, since each is a genuinely different task
(fix a handful of already-rejected elements; reconsider a handful of
already-excluded ones) from compiling a whole domain, not an alternate
version of the same one. Same reproducibility convention: both tools have
their own `prompt_sha256()`.
