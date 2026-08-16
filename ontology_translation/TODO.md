# TODO — Multi-domain ontology translation and elicitation benchmark

Progress tracker for the initiative defined in epic #101. Keep this file up
to date as work happens: check items off, add dated notes under "Log /
Decisions" when something deviates from an issue's spec or gets clarified,
and keep "Current State" accurate so the work can be picked up cold at any
time — same convention as the top-level `TODO.md`/`agent_ontology_todo.md`.

Repo-root docs (`README.md`, `agent_ontology_spec.md`, etc.) are
deliberately **not** touched by this initiative yet — per explicit
instruction, those only get updated once one full domain passthrough
(fetch → extract → compile → evaluate → accepted `reference.domain.yaml`)
succeeds end to end. Until then, this file is the only record.

---

## Current State

- **Issues:** epic #101 and its 10 sub-issues (#102–#111) created and
  cross-linked (see #101 for the full map). #106–#110 (the five domain
  translations) are explicitly optional/budget-dependent — at least one
  must land for #111 to unblock, not all five.
- **#102 (compiler tooling): done, merged.** PR #112 — `extract.py`
  (deterministic RDFLib extraction + exact-match scope selection),
  `compile.py` (Azure OpenAI GPT-5.4 calls, N independent passes,
  self-pricing, JSONL live-progress logging), `validate_domain.py`
  (structural hard gate, reused by #103), `source_manifest.py`/`fetch.py`
  (checksummed reproducibility record). 53 offline/mocked tests at merge
  time.
- **Live Azure integration confirmed working**, not just mocked: added
  `test_compile_live.py` (opt-in, same convention as
  `helper-agent-live-azure.spec.mjs`) and ran it for real against the
  actual Azure resource. See the 2026-08-16 Log entry for the result — one
  real bug found and fixed (in the test itself, not `compile.py`), then a
  clean pass.
- **#103 (automatic translation-quality evaluation): done, merged.** PR #114
  — `evaluate.py` implements all 7 QA layers from the issue (structural +
  provenance hard gates, independent semantic judging, translation
  stability, reverse coverage, round-trip test, CQ generation/support).
  26 offline tests + a live smoke test (`test_evaluate_live.py`, same
  opt-in convention), run for real.
- **Standing policy, applies to every domain, not just Brick:** the
  compiler must produce a *full* Agent Ontology — rules, actions and 8-15
  competency questions populated wherever the source material (including
  standard, well-established domain practice tied to the specific named
  concepts in scope, not only literal RDF axioms) supports them, not
  defaulted to empty out of caution. See the prompt file itself
  (`ontology_translation/tools/prompts/compiler-prompt.md`) and today's Log
  entry for the full account of why this changed.
- **Prompt file: one current file, not a `-v1`/`-v2`/... lineage.**
  `prompts/compiler-prompt.md` is the only prompt file that exists; past
  wording is recovered from git history, and every real compile run pins
  itself to exact wording via a SHA-256 recorded in `run-manifest.json`
  (`compile.py`'s `prompt_sha256()`) rather than via a versioned filename.
- **#106 (Brick HVAC v1.4.4): in progress**, first real domain translation.
  Real source fetched and checksum-pinned; scoped to 81 classes via 6
  hand-picked HVAC entry points (`ontology_translation/domains/brick-hvac/
  source-manifest.yaml`). Two real pipeline bugs found and fixed by
  actually running this (not caught by any synthetic test) — see today's
  Log entry. Compiler re-run in flight with the fixed pipeline; not yet
  evaluated or accepted.
- Real Azure spend so far this session: smoke tests are a handful of cents
  (re-spent lightly every time the full suite is run locally with
  credentials present — see `tools/README.md`'s testing section); the
  first (now-superseded, pre-bugfix) 3-pass Brick compile cost ~$0.97; a
  second 3-pass compile with the fixed pipeline is in flight as this is
  written — final total to be confirmed once it completes.
- **#104–#111: not started.**
- No domain has been translated yet. No `ontology_translation/domains/`
  directory exists yet.

## Log / Decisions

*(Append dated entries here when something is clarified, changed, or
deviates from an issue's spec — keep the issue text itself as the
reference and record deltas/decisions here instead.)*

- 2026-08-16 — Epic #101 and sub-issues #102–#111 created in
  `solalatus/ontology_builder`, tagged `broadscale ellicitation test`, with
  GitHub sub-issue hierarchy under #101 in addition to the checklist/
  `Depends on:` text. #106–#110 marked optional/budget-dependent per user
  instruction (translations are "at least one of," not all required);
  #111's dependency section rewritten to match. Manual-spot-check
  acceptance criteria added to each of #106–#110 (automated QA is a hard
  gate, not a substitute for human review). Repository layout convention
  established: everything new lives under `ontology_translation/`, not
  scattered across the repo root/`tools/`/`tests/evals/`.
- 2026-08-16 — Azure/GPT-5.4 cost estimate produced (published as an
  artifact) to size the effort before building anything: translation
  ledger ~$26–86 across all 5 domains depending on correction rounds, plus
  tool-build/debug and margin allowances, landing on a recommended
  $150–300 reserve. Elicitation testing (#111) explicitly out of scope for
  that estimate.
- 2026-08-16 — #102 built and merged (PR #112): see "Current State" above
  for the file list. Key design decisions made while building it:
  - `select_scope()`'s root matching is **exact** (case-insensitive
    against local name/label), not substring — substring matching let a
    root like `Fan` spuriously also match an unrelated `FanStatusEnum` in
    testing, which would have caused real scope creep on a large ontology
    like Brick or FIBO.
  - `validate_domain.py`'s original `x = data.get(k) or default` pattern
    had a real bug: a present-but-wrong-type falsy value (e.g.
    `relationships: {}` where a list was required) silently passed through
    the default and never tripped the type check. Fixed with a
    `_get_typed()` helper that only defaults on true absence. Also fixed
    duplicate-identifier detection to flag exact repeats (e.g. two
    competency questions sharing an id), not just near-duplicates that
    normalize the same but differ in raw spelling.
  - Adjudicating between a domain's N independent compiler runs into one
    accepted candidate is *not* part of #102 — proposed to land as part of
    #103 (next to the translation-stability comparison) or as an explicit
    follow-up, since #102's own file list doesn't assign it.
  - The Azure API key the user provided was stored only in a local,
    gitignored `.env` (repo root, same convention as `tests/lib/env.mjs`),
    never in any tracked file, issue, or PR body. Flagged to the user that
    since it was pasted into chat, rotating it in the Azure portal once
    testing is done is the safer long-term practice.
- 2026-08-16 — Live Azure smoke test added and run for real
  (`test_compile_live.py`, opt-in per `tests/README.md`'s existing Azure
  live-test convention). First run: the real API call itself succeeded
  (structural validation clean, real cost $0.0117) but the test *assertion*
  failed — a bug in the test, not `compile.py`: it checked the output files
  after the `tempfile.TemporaryDirectory()` context manager had already
  deleted them. Fixed by moving the assertions inside the `with` block.
  Second run: clean pass, real cost $0.0076 (cheaper than the first run —
  Azure's prompt-caching discount kicked in on the repeated schema/prompt
  prefix, confirming that mechanism works as documented). Confirms, against
  the real resource rather than a mock: the `AzureOpenAI` client
  construction, the placeholder `AZURE_OPENAI_DEPLOYMENT=gpt-5.4` (turned
  out to be the correct deployment name on this resource),
  `response_format={"type": "json_object"}` support, and end-to-end
  domain_yaml/translation.json parsing all work as `compile.py` assumes.
- 2026-08-16 — #103 built: `evaluate.py`, all 7 QA layers. Notable
  decisions:
  - Layers 1-2 (structural, provenance) and layer 5 (reverse coverage) are
    fully deterministic — no LLM, no cost, always run. Layer 4
    (translation stability) is a heuristic normalized-name-overlap P/R/F1
    across a domain's independent compiler runs, not yet the semantic/LLM-
    judged version the JS eval harness uses elsewhere in this repo — a
    reasonable upgrade once real multi-run data exists to tune it against,
    but out of scope for a first pass. Layers 3/6/7 (semantic judging,
    round-trip, CQ support) call the LLM as an independent judge/generator.
  - Reused `compile.py`'s `RunLogger`, `estimate_cost`, `approx_tokens`,
    `_extract_json_object` by import rather than moving them into a shared
    module — avoids touching #102's already-merged, already-tested code
    for a second consumer; a real shared `llm.py` extraction is a
    reasonable future cleanup, not done here.
  - `run_evaluation()` skips all LLM-based layers entirely (and never
    touches Azure credentials) when either hard gate fails — a rejected
    translation isn't worth spending on.
  - Added `test_evaluate_live.py`, same opt-in convention as
    `test_compile_live.py`, and ran it for real: kept deliberately tiny
    (judges=1, round_trip_sample=1, cq_count=2, one-class translation) to
    validate all four LLM call shapes cheaply. First run passed cleanly —
    no bugs this time (the `tempfile.TemporaryDirectory()`-scoping mistake
    from the compile.py smoke test was caught in `test_evaluate.py`'s own
    mocked suite before ever reaching a live run). Real cost $0.0060–0.0062
    per run; judge verdict "supported", round-trip score 0.96, two
    genuinely sensible source-grounded CQs generated by the real model.
- 2026-08-16 — Started #106 (Brick HVAC v1.4.4), the first real domain
  translation, choosing it over the originally-suggested IOF Maintenance
  per explicit instruction. Fetched the real release asset
  (`https://github.com/BrickSchema/Brick/releases/download/v1.4.4/Brick.ttl`,
  1.75MB, sha256 pinned in `domains/brick-hvac/source-manifest.yaml`).
  Scoped extraction picked 6 hand-chosen entry points ("HVAC Equipment",
  "Temperature Sensor", "Temperature Setpoint", "CO2 Sensor",
  "Occupancy Sensor", "Location") rather than Brick's broad top-level hubs
  ("Equipment", "Sensor", "Setpoint", "Point") — those span every Brick
  domain (fire, security, lighting, electrical), not just HVAC, and
  `select_scope()`'s bidirectional subClassOf walk would climb to them and
  fan back out into unrelated siblings. `max_depth: 1` bounds the walk to
  each root's immediate parent + children. Result: 81 classes, a coherent
  HVAC/building slice (AHU, Boiler, Chiller, Fan, Damper, Pump, Cooling
  Tower, Temperature/CO2/Occupancy sensors, Temperature setpoints,
  Zone/Space/Building/Floor), confirmed by eyeballing the label list before
  spending anything.

  **Two real pipeline bugs found by actually running this — neither caught
  by any synthetic test, both fixed immediately:**
  1. `extract.py`'s property scope filter required `rdfs:domain`/
     `rdfs:range` to decide whether a property was in scope. Brick barely
     uses those (7 occurrences total in a 1.75MB file) — it constrains
     relationships via SHACL `sh:property` shapes on individual classes
     instead. Every one of Brick's 199 object/datatype properties was
     silently dropped from the scoped IR as a result (including exactly
     the "equipment/point relationships" issue #106 asks for). Fixed:
     `_property_in_scope()` now includes a property when it has *no*
     domain/range declared at all, rather than treating that as
     "unscoped, drop it" — there's nothing to filter by, so dropping was
     the more wrong assumption. Generalizes to any lightly-typed/
     SHACL-styled source, not just Brick.
  2. `validate_domain.py` flagged 28-29 `duplicate_identifier` errors on
     the first two real compiler outputs — all false positives. It treated
     any repeated relationship *name* as a duplicate, but
     `agent_ontology_spec.md` Section 5 explicitly chose a list over a
     name-keyed map so the same name (`hasPoint`, `feeds`, `hasLocation`,
     ...) *can* repeat across different class pairs — that's normal, not
     an error. Fixed: duplicate detection now keys on the full
     `(name, from, to)` signature, so only a truly redundant exact-repeat
     entry is flagged. Both real compiler runs the bug had rejected turned
     out to be structurally clean once re-checked.

  Also added, while investigating: `owl:equivalentClass` target labels now
  fold into `altLabels` (standard OWL construct, not Brick-specific — e.g.
  Brick's "AHU" `owl:equivalentClass` "Air_Handling_Unit").

  **Separately, explicit standing instruction from the user, applying to
  every domain, not just this one:** the first compile pass (pre-bugfix)
  came back structurally clean but genuinely bare — 0 rules, 0 actions
  across all 3 runs, only 5/8-15 competency questions, inconsistent
  properties (0 on 2 of 3 runs). Rewrote the compiler prompt to instruct it
  to actively ground rules/actions in standard, well-established domain
  practice tied to the specific named concepts in scope (not only literal
  RDF axioms), to require 8-15 CQs explicitly, and to infer obvious
  properties from class names/definitions rather than only from explicit
  datatype-property records — while keeping the existing anti-fabrication
  guardrails (ground everything in something real; empty rules/actions is
  still correct when a domain is genuinely purely descriptive even at the
  standard-practice level).

  **Also, separate explicit instruction: consolidated to one prompt file.**
  Had initially started a `compiler-v1.md`/`compiler-v2.md` split for this
  rewrite; the user pushed back on that pattern accumulating in the repo.
  Now there is exactly one file, `prompts/compiler-prompt.md`; past wording
  lives in git history, and `compile.py` records the file's SHA-256 in
  every run's `run-manifest.json` (`prompt_sha256()`) so a specific run's
  exact wording is always recoverable without parallel files. A
  `source-manifest.yaml`'s `compiler.prompt_version` is now documented as a
  free-text label, not a file selector.

  Re-running the 3-pass compile with the fixed extractor + rewritten prompt
  gave 3 structurally-clean, genuinely rich outputs (all details below) —
  but a *third* real bug surfaced at the provenance-completeness hard gate,
  which none of the 3 runs passed (68-86% element-provenance coverage, not
  the required 100%):

  - **All 3 real compile runs (structural + richness), for the record:**
    run-1: 47 classes, 57 relationships, 9 rules, 5 actions, 12 CQs, 70
    properties, 6 aliases, $0.4851. run-2: 48 classes, 52 relationships, 10
    rules, 7 actions, 12 CQs, 73 properties, 10 aliases, $0.3537. run-3: 46
    classes, 59 relationships, 14 rules, 12 actions, 12 CQs, 56 properties,
    4 aliases, $0.4373. Total $1.2761. All 3 structurally clean (0 errors)
    once the relationship-duplicate validator bug above was fixed — sample
    rule (run-1): `canCallForCooling` = "zone air temperature is above the
    applicable cooling temperature setpoint" + "the zone is served by HVAC
    equipment capable of cooling"; sample action: `startCoolingForZone`,
    preconditions `[canCallForCooling, shouldRunFanForDelivery]`, effect
    "cooling-serving equipment and related cooling valves/dampers are
    commanded...". Heuristic translation-stability across the 3: classes
    F1=0.91, relationships F1=0.81, properties F1=0.71 — solid agreement.
  - **Bug 3 — root cause of the provenance gate failure:** the compiler's
    own `target_path` addressing for relationships was `relationships.
    <name>`, which is exactly the same ambiguity as bug 2 (a name can
    address several different relationship instances). The model
    frequently skipped provenance entries for relationships whose name
    repeated (e.g. `hasPart` had zero mapping entries in run-1 and run-3,
    despite non-zero `hasPart` relationships existing in the output), and
    was inconsistent about per-property mapping entries too (run-2: 1
    mapping for the `AirHandlingUnit` class, 0 for any of its properties).
    Fixed at the root, not just patched around: relationships are now
    addressed by list index (`relationships[<idx>]`, never by name) in
    both the compiler prompt (explicit addressing spec + a worked example
    + "every element needs its own mapping entry, this is checked
    automatically" framing) and `evaluate.py`'s `_iter_generated_elements`/
    `_describe_target_element` (now a small path tokenizer handling both
    `.key` and `[index]` segments, not a naive `.split(".")`).

  **Re-run with the addressing fix — provenance now passes.** run-1:
  53 classes, 56 relationships, 10 rules, 7 actions, 12 CQs, 55 properties,
  6 aliases, structurally clean, 100% provenance coverage, $0.4859. run-2:
  56 classes, 54 relationships, 8 rules, 7 actions, 10 CQs, 36 properties,
  8 aliases, structurally clean, 100% provenance coverage, $0.3923. run-3:
  38 classes, 45 relationships, 8 rules, 6 actions, 12 CQs, 44 properties,
  4 aliases, **1 structural error** (`relationships[9]` references a
  `Compressor` class this run didn't emit — a real, if minor, compiler
  slip; disqualifies it from direct acceptance, still usable for
  stability comparison), 100% provenance coverage anyway, $0.3724. Total
  this pass: $1.2506. Stability across all 3: classes F1=0.85,
  relationships F1=0.78, properties F1=0.64.

  **Adjudicated candidate: run-1** — both structural and provenance hard
  gates clean, richest properties (55 vs 36/44) and most rules (10 vs 8/8),
  highest class-level agreement with run-2 (F1=0.92, the best pairwise
  score of any pair). No automated adjudication logic exists yet (noted as
  a gap in #102's PR); this was a manual, reasoned selection, recorded here
  for exactly that reason.

  **First full QA suite run (real, $0.60 judging + ~$0.05 round-trip +
  ~$0.20 CQ layer) surfaced two more real bugs — this is exactly the
  "check at the end if things are really making sense" the user asked
  for, and they didn't, on first look:**

  - 58/181 elements (32%) came back majority-`unsupported`, and reading
    the actual judge rationales showed why: every single standard-practice-
    grounded rule/action was unanimously rejected with rationales like
    "only a general assertion about standard HVAC practice... does not
    provide specific source text" — precisely the evidence category the
    *compiler* prompt was just told is legitimate. `JUDGE_SYSTEM_PROMPT`
    had never been updated to know that category exists, so it was
    grading the compiler's now-richer output against a stricter standard
    than the compiler was ever told to meet. The two prompts were working
    against each other. Fixed: judge prompt now explicitly names both
    evidence kinds (literal source snippet vs. named standard-practice
    citation) as legitimate and grades each on its own terms — still
    rejects evidence that's absent, contradictory, too generic to tie to
    the specific concepts involved, or more specific than the evidence
    supports.
  - Round-trip average score was 0.398, and reading the actual
    reconstructions showed a second, unrelated bug: `round_trip_sample`
    handed the reconstruction model a property's bare dict value (e.g.
    `{"type": "number"}`) with **no name and no owning class** — so
    `classes.Building.properties.yearBuilt` got reconstructed as "a
    generic numeric value... measurement, count, or identifier" (score
    0.18) and `grossArea` similarly (score 0.04), because the payload
    genuinely never told the model which property it was looking at.
    Fixed: added `_leaf_label()` (e.g. `"Building.yearBuilt"`) alongside
    the raw content in the payload.
  - CQ support (60%, 6/10) was checked too and found to be a genuine,
    working-as-intended signal — the rationales for the 4 "not supported"
    CQs cited real, specific gaps (no hydronic/refrigerant distribution
    path relationships from boilers/chillers to terminal units, no coil
    classes, no CRAC/CRAH-to-space linkage) rather than looking like a
    prompt artifact. No change made there.

  Re-running the full QA suite now with both fixes in place.
