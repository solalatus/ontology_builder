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
- **#106 (Brick HVAC v1.4.4): pipeline work done, all hard gates pass.**
  Real source fetched and checksum-pinned; scoped to 81 classes via 6
  hand-picked HVAC entry points. **2026-08-17: full clean pipeline rerun
  from a genuinely blank slate** (wiped outputs, re-fetched, re-extracted,
  re-compiled, re-evaluated, repaired) replaced the earlier iteratively-
  patched candidate with a fresh one built entirely through the current
  tooling. Four more real pipeline bugs found and fixed this pass (on top
  of the six from the original run) — full account in the 2026-08-17 Log
  entry. Final accepted candidate: `reference.domain.yaml` 29 classes /
  32 relationships / 7 rules / 5 actions, 105 source-mapped elements,
  structurally clean, 100% provenance, 100% reverse coverage, zero
  majority-unsupported, assembled under
  `ontology_translation/domains/brick-hvac/`. Deliberately narrower than
  the prior candidate (48 classes) — this run's compiler judged more of
  the scoped subset out-of-scope for the selected operational slice, and
  every one of those calls is disclosed via a real `disposition` +
  justification note, not silently dropped (verified). Not yet merged to
  `main` — still on `ontology-translation/106-manual-spot-check`.
- **In-session manual spot-check done, 2026-08-17: 17/18 accept, 1
  reject, real bug found and fixed.** 10%-stratified sample (18 of 175
  artefacts, seed 106) reviewed live against original Brick source docs.
  One rejection (`classes.CRAH.properties.status`) surfaced a genuine,
  spec-violating defect — `allowed` lists mixing YAML booleans with
  strings — present on 16 classes, not just the sampled one.
  `validate_domain.py` and the compiler prompt were both fixed so this
  can't recur on any future domain; `reference.domain.yaml` was
  hand-corrected (no LLM rerun). Full detail:
  `domains/brick-hvac/manual-spot-check.md`.
- **2026-08-17/18: #106 closed, merged as PR #116.** `run_pipeline.py`
  (single-command fetch to extract to compile to evaluate to
  repair/reinstate orchestrator) built to close the remaining real gaps
  (no one-command pipeline, stale `tools/README.md`), then the official
  `evaluate.py` CLI run end-to-end for the final authoritative report. Two
  more general pipeline bugs found afterward while translating IOF Supply
  Chain (see below) — both independently verified, via direct diff against
  Brick's real committed `translation.json`, to have had **zero actual
  effect** on Brick's merged result: (1) `_all_source_iris()` including
  `owl:imports` records — Brick's two import-subject IRIs were already,
  independently, correctly dispositioned; (2) `_sibling_context_for_iri`'s
  false-"mapped" signal — Brick's one instance (`rec#servicedBy`) is an
  object property, and the sibling-context function only ever draws from
  `kind == "class"` records, so the false signal was never actually
  reachable. No rerun of Brick was needed for either. No PR reopened for
  #106.
- **Standing policy, applies to every domain, not just Brick, going
  forward: a rejected/contested element gets a real repair attempt before
  it's dropped.** `repair.py` + `prompts/repair-prompt.md` (reground /
  replace / drop, same provenance bar as a full compile, mechanically
  validated before anything is applied). Applied twice on Brick: first to
  the 3 originally-dropped relationships (1 replaced — wrong-class
  evidence corrected, `Chiller hasPart Compressor` → `CondensingUnit
  hasPart Compressor`; 1 regrounded — `Zone hasPoint
  TemperatureDeadbandSetpoint`; 1 confirmed genuine drop — `AHU hasPart
  AirPlenum`, redundant with the already-present `AHU feeds AirPlenum`).
  `repair.py` was later **generalized** (it originally only worked
  retroactively and only for relationships) to repair any element kind
  *in place* while still live in the file, then applied a second time to
  9 flagged `status` properties/a rule surfaced by the systemic judging
  fix below (3 valve properties renamed `status`→`position`, 3
  regrounded, 3 genuinely dropped). Every addition/change independently
  re-judged, never taken on the repair call's own word. Full account in
  today's later Log entries.
- **`index.html`'s own `.domain.yaml` importer did not enforce the same
  format the Python pipeline does, and it was worse than a missing check
  — it flat-out could not read the pipeline's real output.** Two real
  parser bugs found and fixed (same-column block sequences; plain-scalar
  line wrapping), plus one more, pre-existing and unrelated, found along
  the way (a blank-line paragraph break inside an explicit `>` block
  scalar double-newlined). All backward-compatible by construction — no
  separate migration step, the fix is "parse this correctly." 16 new
  tests in `tests/yaml-robustness.spec.mjs` (46/46 passing); full existing
  suite re-run twice, 974 tests, only one unrelated pre-existing flake
  (agent-panel CSS timing, confirmed by re-running that file alone). Full
  account in today's later Log entry.
- **Semantic judging had a systemic soundness gap: judges only ever saw
  the compiler's own self-reported evidence, never real source material
  to check it against.** Fixed generally in `evaluate.py` (ground-truth
  enrichment + contested-elements tracking), found and fixed two further
  real bugs by actually running it at full scale (PascalCase class-name
  normalization; judge-prompt calibration for actions' partial ground
  truth), then used it for real: found and repaired a genuine pattern (6
  of Brick's `status` properties/a rule had no real per-class grounding
  behind a shared templated justification). **Overfitting audit** done
  explicitly ahead of #107–#110: stripped all HVAC/finance-flavored
  vocabulary from every LLM-facing prompt, stated principles abstractly
  instead. Full account in today's later Log entries.
- Real Azure spend so far this session: smoke tests are a handful of cents
  (re-spent lightly every time the full suite is run locally with
  credentials present — see `tools/README.md`'s testing section); Brick
  HVAC's full iteration history (2 superseded 3-pass compiles + 1 final
  single-pass compile + 2 full QA-suite runs, the first superseded, both
  repair passes, and the full systemic-judging-fix re-verification lineage)
  cost **~$8.61** total — see the Log for the full breakdown. Still well
  inside the ~$21.57 "Large tier, 3 correction rounds" ceiling from the
  original cost estimate.
- **#104–#105, #107–#111: not started.**
- One domain translated and merged: `ontology_translation/domains/brick-hvac/`.
  No other domain started yet.

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

  **Re-run: 58 -> 16 unsupported / 181.** Rules/actions/properties all
  cleared. All 16 remaining were relationships, and reading them showed a
  *third* instance of the same root cause: the compiler's relationship
  evidence cited only the generic property definition (e.g. `hasPoint`'s
  Brick-wide "has a source of telemetry" text), never framing the specific
  endpoint pair as standard-practice-grounded the way rules/actions/
  properties already were. Fixed by extending that same authorization to
  relationship endpoint pairs in the compiler prompt, with a worked
  example. Also, while reading these results closely (per explicit
  instruction to sanity-check the actual output, not just the pass/fail
  number): found a **fourth** real bug — `judge_mappings`'s majority
  computation used `Counter.most_common(1)` alone, which silently treats a
  genuine 3-way judge split (one each of supported/partially_supported/
  unsupported) as "majority unsupported" purely because that verdict
  happened to be judge-1's answer and got inserted into the Counter first.
  Fixed: `_majority_verdict()` now requires a strict majority
  (> half the votes); a real tie returns no verdict and isn't rejected.

  **Single fresh compile pass** with the relationship-grounding fix (not a
  full 3 -- translation-stability was already well-established from the
  earlier 3-run set, no need to re-earn it for a wording-only prompt
  change): 48 classes, 60 relationships, 9 rules, 9 actions, 12 CQs, 52
  properties, structurally clean, 100% provenance, $0.5054. Full QA suite
  on it: only 4/178 unsupported this time, and reading *those* rationales
  individually (not just trusting the count) found:
  - 2 genuine, defensible rejections: `Chiller hasPart Compressor` — the
    cited evidence actually described a *Condensing Unit* having a
    compressor, not a Chiller directly, a real conflation; and
    `AHU hasPart AirPlenum` — evidence was indirect ("receives air from")
    rather than a real part-of claim.
  - 1 more genuine rejection revealed once the tie-break fix was applied
    directly to the raw judgments already on hand (no need to re-call the
    LLM): `Zone hasPoint TemperatureDeadbandSetpoint`, unanimous 3/3
    unsupported — its own cited evidence hedged ("zones *may* use..."),
    and the judges correctly caught that the standard-practice claim was
    weaker for a deadband setpoint than for the more universal
    heating/cooling setpoints.
  - 1 false rejection killed by the tie-break fix:
    `Zone hasPoint HeatingTemperatureSetpoint` had one each of
    supported/partially_supported/unsupported -- a real split, not a
    majority, correctly no longer rejected.

  **Final candidate: surgically removed the 3 genuinely-rejected
  relationships** (not a 4th full re-compile+re-evaluate cycle — cheaper
  and just as principled, since the 3 judges' own verdicts are the reason
  for removal): reindexed the remaining relationships and their
  `translation.json` mapping entries, re-ran structural validation and
  provenance/reverse-coverage checks (both clean, both still 100%),
  recomputed semantic-judging results for the survivors with the fixed
  tie-break rule. **Result: 175 elements, all hard gates pass — structural
  clean, provenance 100%, zero majority-unsupported.**

  **Manual read-through of the final content** (per explicit instruction:
  check it actually makes sense, don't just trust the numbers) — read
  every class name, every rule's conditions, every action's precondition/
  effect/verification, every competency question, and a relationship
  sample: 48 classes cover real HVAC vocabulary end to end (central plant
  through terminal units, sensors, setpoints, spatial containment); the 9
  rules are textbook BAS control sequences (temperature-vs-setpoint calls,
  a deadband to stop hunting, CO2-driven ventilation, frost protection,
  chilled/hot water enable, scheduled setpoints, occupancy-based
  conditioning) — genuine domain knowledge, not filler; actions properly
  reference their preconditions by rule name; competency questions are all
  real operational questions, none of the "what classes exist" style the
  issue explicitly warns against; `AHU` correctly carries "Air Handling
  Unit"/"Air Handler Unit" as aliases (the `owl:equivalentClass` fix
  working as intended); relationships read coherently (`Site hasPart
  Building`, `AHU serves Zone`, etc.); no subclass-shaped relationship
  names leaked through. This genuinely holds up.

  **Total real Azure spend, this domain, all iterations:** two full 3-run
  compiles ($1.2761 + $1.2506) that were superseded by the bug-fixing
  process, one final single-run compile ($0.5054), two full QA-suite runs
  ($1.1548 + $1.1723, the first also superseded) = **~$5.36** across every
  iteration including the throwaway ones. Well inside the ~$21.57 "Large
  tier, 3 correction rounds" ceiling from the original cost estimate,
  despite four real pipeline bugs being found and fixed along the way —
  the token estimates that budget was built on were conservative, and
  reusing already-established stability data instead of re-earning it on
  wording-only prompt changes saved real money.

  **Assembled and PASSING**: `ontology_translation/domains/brick-hvac/`
  now has `source-manifest.yaml`, `reference.domain.yaml`,
  `translation.json`, `translation-evaluation.json`,
  `translation-report.md`, `persona.md`. Per explicit instruction, #106
  stays **open** after this PR merges — the manual spot-check above is
  mine, not the user's; they want to do their own review before the issue
  closes, and we'll discuss what that process looks like after merge.

- 2026-08-17 — **PR #115 merged.** User then defined a standing term for
  the review process: everything with a `translation.json` mapping entry
  (classes, class properties, relationships, rules, actions — 175 total
  for Brick HVAC) is an "artefact," and asked for 10% of them sampled and
  reviewed live in-session, original source info shown against the
  resulting translation, with accept/reject/comment per item, materialized
  afterward as a file in the repo as evidence.

  **Sampling:** stratified by artefact type (not pure random — with only 9
  rules and 9 actions in the population, a flat random draw could plausibly
  miss a whole category), proportional allocation via largest-remainder
  rounding, seed `106` for reproducibility. 18 of 175 sampled: 5 classes, 5
  properties, 6 relationships, 1 rule, 1 action. Competency questions
  excluded from the artefact population — they're synthesized, not
  source-mapped, so there's no "original source info" to check them
  against.

  **Review, live in chat:** all 18 presented with source IRIs/evidence
  side by side with the resulting `.domain.yaml` content. User accepted 17
  outright and flagged one (`classes.CRAH.properties.status`, `allowed:
  [false, true, "cooling", "alarm"]`) for a source-doc check rather than
  taking it on faith.

  **The check found a real bug.** `rec:status` in the pinned Brick source
  (`Brick.ttl:32600`) is a bare `owl:DatatypeProperty` with only a label —
  no comment, no range, no enumeration — so there's no source basis for
  any `status` enum at all. Separately and more concretely:
  `agent_ontology_spec.md` types `allowed` as `string[] | null`, and this
  property's `allowed` list mixed literal YAML booleans with strings — a
  real type violation of our own spec, not a grounding nuance. A full scan
  turned up the identical pattern on **16 classes**, not just the sampled
  one: `AHU`, `Boiler`, `Chiller`, `Compressor`, `CondensingUnit`,
  `CoolingTower`, `Fan`, `HeatExchanger`, `Humidifier`, `Pump`,
  `SpaceHeater`, `TerminalUnit`, `Thermostat`, `WallAirConditioner`,
  `CRAC`, `CRAH`. In hindsight, the translation-stability report already
  had a signal for this — `allowed_values` F1 was 0.37, the lowest of any
  stability metric, meaning the compiler was already visibly inconsistent
  about `allowed` lists across its 3 independent runs. Worth watching on
  every future domain even when the structural gate is green.

  **Fixed per explicit instruction: fix the code, don't rerun the
  pipeline, log the review as-is, hand-correct the data, and log that the
  fix was manual.**
  - Code: `validate_domain.py`'s structural gate now flags
    `allowed_not_all_strings` when any `allowed` entry isn't a plain `str`
    (previously it only checked `allowed` was *a list at all* —
    `[false, true, "alarm"]` passed silently). Test added. Compiler prompt
    (`prompts/compiler-prompt.md`) now explicitly forbids bare YAML
    booleans in `allowed`, citing this finding, so future compiles on any
    domain don't reproduce it.
  - Data: hand-edited `reference.domain.yaml` — replaced the YAML `false`/
    `true` values with the strings `"off"`/`"on"` in all 16 affected
    classes' `status.allowed` lists. Diff is exactly those 32 lines,
    nothing else touched. **No LLM call was made for this fix** — the
    compiler was not re-invoked, and every other mapping's content and
    rationale in `translation.json` is untouched.
  - Re-validation: re-ran the free, offline `validate_domain.py` against
    the corrected file with the new check active (0 errors, 0 warnings)
    and the full offline suite (95 tests, all passing). No live/paid API
    calls were made anywhere in this fix.
  - Evidence materialized: `domains/brick-hvac/manual-spot-check.md` and
    `.json` (full sample, verdicts, the S10 finding, and the remediation
    account above); `translation-evaluation.json` and
    `translation-report.md` both cross-reference it.

  **#106 still open.** This spot-check is the evidence the user asked for,
  not itself an instruction to close the issue — that's still their call,
  to be given explicitly.

- 2026-08-17 (later) — **Two standing-policy asks, both acted on: (1)
  don't silently drop rejected elements, repair first, rerun the LLM if
  that's what it takes; (2) `.domain.yaml` format enforcement has to be
  uniform everywhere it's parsed, not just here — asked specifically
  whether `index.html` (the main interviewer app, which also imports/
  exports this exact format per `agent_ontology_spec.md` §11 Phase G)
  agrees with `validate_domain.py`.**

  **Checked index.html — it did not agree, and worse than expected.**
  Traced (and empirically ran, by extracting the real parser functions
  into Node) `index.html`'s hand-rolled YAML importer against the actual
  committed `reference.domain.yaml`. Two independent, real bugs, not one:

  1. **Same-column block sequences.** PyYAML's own `yaml.safe_dump()`
     default (a list's dashes at the *same* column as the key that owns
     it, e.g. `allowed:` / `- off` both at column 8) is what the
     compiler's LLM-authored output actually uses throughout — and
     `index.html`'s column-stack indentation tracker had no way to tell
     that apart from a *sibling key* at that column, so the first such
     list desynced every enclosing loop above it and silently lost the
     rest of the document (`classes: {}`, zero classes, on the real
     file). Fixed in `flattenYamlLines()`: each stack frame now also
     tracks whether it was opened to hold a same-column sequence
     (`isSeq`), opened the first time a dash line follows a bare `key:`
     at the frame's own column, closed again the moment a later
     same-column line isn't a dash. Purely additive — the app's own
     one-deeper-indented export style is unaffected.
  2. **Plain-scalar line wrapping.** The LLM's own long prose fields
     (`meaning`/`text`/`effect`/`conditions`/...) wrap across physical
     lines the way plain YAML scalars are allowed to (folding, like an
     explicit `>` block scalar) — `index.html` only ever handled that for
     an *explicit* `|`/`>` header, never a plain unquoted value, so an
     unconsumed continuation line desynced everything after it the same
     way. Fixed by extending the same lookahead used for explicit block
     scalars to plain scalars too (both `key: value` and bare `- value`
     list items), reusing `readYamlBlockScalar()`'s own fold/dedent logic
     rather than duplicating it — added an optional `firstLine` param so
     the inline first line folds through the *same* reduce as the rest of
     the body (a separate string-join afterward can't tell "fresh
     paragraph" from "same-paragraph space-join" the way the reduce
     already does).
  3. **Found and fixed a third, pre-existing bug along the way,
     unrelated to either fix above:** a blank-line paragraph break inside
     an *explicit* `>` block scalar already double-newlined
     (`"a\n\nb"` instead of `"a\nb"`) — untested until the plain-scalar
     fold path needed the exact same blank-line behavior and exposed it.
     One-line fix to the reduce in `readYamlBlockScalar()`.

  **Verified, not assumed:** both fixes are backward-compatible by
  construction — they only add recognition for two additional, 100%
  YAML-spec-legal shapes the parser previously mishandled; the app's own
  export style still takes the same code path as before and is untouched.
  No separate "migration" step was needed for old files, since the fix is
  "parse this correctly," not "detect and patch a broken file." Confirmed
  with the real `reference.domain.yaml` (extracted the real parser
  functions into Node): now parses to the exact expected counts (48
  classes, 57→59 relationships after the repair pass below, 9 rules, 9
  actions, 12 CQs) instead of 0 classes. Added 16 new tests to
  `tests/yaml-robustness.spec.mjs` (same-column sequences incl. the exact
  Brick CRAH `allowed`-list shape, plain-scalar folding incl. the blank-
  line-paragraph-break case, a full PyYAML-style document exercising
  every section at once, plus the pre-existing block-scalar bug) — 46/46
  passing. Ran the *entire* existing suite twice (66 spec files, 974
  tests) to check for regressions: first run (before the blank-line
  reduce fix) was already 0 failures; second run had exactly 1 failure,
  `helper-agent-phase1.spec.mjs`'s agent-panel-width test, which is
  layout/CSS-timing and has nothing to do with YAML — re-ran that file
  alone and it passed cleanly, confirming flake under the loaded
  full-suite run rather than a real regression.

  **Repair pass, not just a drop, for the 3 relationships removed
  earlier.** Built `repair.py` + `prompts/repair-prompt.md`: a small,
  separate, narrowly-scoped prompt (not a variant of `compiler-prompt.md`)
  that takes already-rejected elements plus their rejection rationale plus
  the *specific* source class definitions involved, and returns one of
  `reground` (same element, stronger evidence), `replace` (the claim was
  attached to the wrong class — fix the target), or `drop` (genuinely no
  honest grounding, last resort) per item — with the same provenance rigor
  as a real compile, mechanically checked before anything is applied
  (`validate_repairs()`). `apply_repairs()` always *appends* accepted
  items at fresh indices rather than rewriting in place, so nothing else
  needs renumbering. 17 new offline/mocked tests in `test_repair.py`.

  Ran it for real on Brick's 3 dropped relationships (~$0.04 dry-run
  estimate, $0.0127 actual):
  - `Chiller hasPart Compressor` → **replace** → `CondensingUnit hasPart
    Compressor`. Matches the original rejection exactly: CondensingUnit's
    own source definition explicitly says "It comprises a condenser coil,
    **compressor**, fan..." — Chiller's own definition never says that.
    The domain already has `Chiller hasPart CondensingUnit`, so this also
    completes a coherent, non-redundant composition chain instead of a
    wrong shortcut.
  - `Zone hasPoint TemperatureDeadbandSetpoint` → **reground**, same
    shape, now grounded against the zone's own already-accepted sibling
    relationships (`Zone hasPoint Heating/CoolingTemperatureSetpoint`)
    instead of the original hedged "zones may use..." evidence.
  - `AHU hasPart AirPlenum` → **drop**, confirmed correct, not a gap: the
    domain already has `AHU feeds AirPlenum`, which is what the original
    evidence ("receives air from the air handling unit") actually
    supports — `hasPart` was simply the wrong relationship type, nothing
    lost by leaving it out.

  **Closed the loop rather than trusting the repair call's own
  self-assessment:** independently re-judged both additions with the same
  3-judge `judge_mappings()` process used for the rest of the domain (not
  reused from the repair call) — **unanimously supported, 0
  unsupported**, twice (re-ran it a second time to double check
  consistency), $0.0126/run. Re-ran the free structural/provenance/
  reverse-coverage gates against the updated file: all still clean at
  100%. `reference.domain.yaml`: 57 → 59 relationships.
  `translation-evaluation.json`/`translation-report.md` updated with the
  full account. Total this repair effort: ~$0.026 (one repair call + two
  independent re-judging passes).

  **#106 still open** — none of this changes that; still the user's call,
  still pending their own review, which was explicitly deferred until
  after this round of fixes.

- 2026-08-17 (later still) — **A manual look at the two repaired
  relationships above, asked for by the user during a live spot-check
  round, surfaced a systemic gap: "how could we handle this suspect
  case?"** Checking `Chiller hasPart CondensingUnit` (a never-
  independently-scrutinized relationship, accepted in the original run)
  against the real Brick source found *zero* grounding — no `sh:property`,
  no restriction, nothing. The root cause was general, not specific to
  this one relationship: `judge_mappings()` only ever showed judges the
  compiler's own self-reported `source_evidence`/`rationale` — a
  confident-sounding fabrication and a genuinely-grounded claim read
  identically from that vantage point, since the judge was judging the
  claim's description of itself, never the claim against reality. User
  instruction: **"attempt a systematic fix... be general, good for later
  ontologies also... check we did not overfit."**

  **Systemic fix in `evaluate.py`** (applies to every future domain, not
  just Brick): `_class_names_involved()` / `_index_source_classes_by_label()`
  / `_ground_truth_for_target()` resolve the real `source_ir` class
  definitions for whatever classes a `target_path` structurally involves
  (both relationship endpoints, a property's owning class, an action's
  input class) and `judge_mappings()` now includes that as
  `actual_source_class_definitions` in the judge prompt when resolvable.
  New **contested-elements tracking** (report-only): flags any element
  where judges disagree even when a majority still says "supported" —
  found for real that the flagged relationship came back 2-supported/
  1-partially_supported even with ground truth in front of the judges, a
  real majority so the hard gate stayed quiet, but genuine disagreement
  existed that a random sample could miss.

  **Overfitting audit, done explicitly because more domain conversions
  are coming (#107–#110).** The pipeline *code* was already domain-
  agnostic, but every worked example for "standard-practice grounding" in
  `compiler-prompt.md` and `JUDGE_SYSTEM_PROMPT` was HVAC-flavored — real
  risk of anchoring reasoning before this exact prompt runs unchanged on
  FIBO Loans, IOF Supply Chain, SOSA/SSN. First pass added a *second*,
  contrasting finance example alongside each one; on a stronger, more
  explicit user directive ("must not contain specific guidance that
  overfits it to one ontology" — not even balanced across two named
  domains), rewrote all of them a second time to state the underlying
  principle *abstractly*, with no named-domain vocabulary at all (neither
  HVAC nor finance). Confirmed with a full grep across every prompt string
  constant sent to any model: zero domain-vocabulary hits remain anywhere.
  The one deliberate exception: `compiler-prompt.md`'s top-level
  Invoice/Supplier YAML-syntax example, which predates this session, has
  no reasoning content, and needs *some* concrete illustration to be
  legible — a different category from the reasoning/decision guidance
  fixed here.

  **Two more real bugs found by actually running the fix at full scale**
  (177 elements × 3 judges), not just trusting the unit tests:
  1. **PascalCase/camelCase class-name normalization.** Compiled class
     names are virtually always PascalCase (`CondensingUnit`); source
     labels are virtually always space-separated (`Condensing Unit`).
     `_normalize_name` alone never split camelCase boundaries, so ground-
     truth resolution silently failed for almost every multi-word class —
     and it was actively *misleading*, not just incomplete: the first
     full re-judge flipped `relationships[57]`
     (`CondensingUnit hasPart Compressor`, just added by the earlier
     repair pass and independently verified supported) to
     majority-unsupported, because judges saw only `Compressor`'s
     definition (says nothing about composition) and never
     `CondensingUnit`'s own definition (which explicitly says it
     comprises a compressor) — the missing ground truth read as evidence
     *against* the claim. Fixed with `_normalize_class_name()` (splits
     camelCase/digit-to-uppercase boundaries before normalizing, applied
     to both sides of the lookup); 6 new tests including a direct
     regression reproducing the exact scenario. Verified live:
     `relationships[57]` back to unanimous supported.
  2. **Judge-prompt calibration for actions' necessarily-partial ground
     truth.** `actions.holdDeadband` and `actions.initiateFrostProtection`
     both came back unanimous unsupported with rationales all saying the
     same thing — the only ground truth given was the action's `input`
     class (Zone/AHU), which doesn't itself mention deadbands or frost
     sensing. True, but never meant to be the whole picture: an action's
     real grounding often depends on a *different* class (a sensor that
     triggers it) that isn't its declared input, and ground-truth
     resolution was only ever designed to cover the input class for
     actions. The prompt didn't say that, so judges over-read a gap that
     was always expected to be there. Reworded `JUDGE_SYSTEM_PROMPT` to
     say plainly what `actual_source_class_definitions` does and doesn't
     cover per target kind. Verified live: both actions back to unanimous
     supported.

  **With both fixes in place, ran the corrected full 177×3 re-judge for
  real ($1.55).** Result: 6 elements majority-unsupported, 15 contested —
  all converging on one real, coherent pattern: *every* `status` property
  in the whole file shares one identical templated justification
  (`rec datatype property "status"; standard <X> operating state
  practice"`, just the noun swapped in) with zero real per-class
  grounding behind any of them. Under genuine scrutiny this held up for
  **equipment** status (AHU, Fan, Chiller, Boiler, Pump...) but not
  consistently for **sensor/valve** status (a passive sensor's
  health/availability field, or calling a valve's state "status" rather
  than "position," are both real but shakier standard-practice claims
  than "this fan has an on/off state").

  **Generalized `repair.py` before using it for real** — it only ever
  worked for the one historical case it was first written against
  (retroactively re-appending Brick's original 3 already-*removed*
  relationships), and only understood relationships. That's backwards
  from the actual policy: repair is supposed to run *while an element is
  still in the file*, on any kind of element, before anything gets
  dropped. Rebuilt `apply_repairs()` to resolve a `target_path` against
  live `domain_data` and mutate in place when it exists (`reground`
  updates only the mapping; `replace` overwrites content at the same path
  or moves it via an optional `new_target_path` for a rename; `drop`
  removes the element, its mapping, and renumbers every later
  `relationships[j]` mapping if the dropped element was itself a
  relationship) — falling back to the old append behavior only when the
  path doesn't resolve at all (the genuine retroactive case). Generalized
  `repair-prompt.md`'s contract (`new_relationship` → `new_content`,
  works for any element kind; added `new_target_path` for renames). 11
  new/renamed tests, 141 total passing.

  **Ran the real repair batch** on the 9 flagged status-property/rule
  items (~$0.024, real): 3 valve properties **renamed**
  `status` → `position` (`HeatingValve`, `IsolationValve`, `SteamValve` —
  the allowed values were fine, the *name* was ungrounded); 3 items
  **regrounded** with stronger specific evidence (majority already
  supported, just contested — the CO2 ventilation rule plus two sensor
  properties); 3 sensor `status` properties **genuinely dropped**
  (`CO2LevelSensor`, `WaterTemperatureSensor`, `AirQualitySensor` — no
  defensible grounding, and correctly no forced narrower replacement
  invented). All 6 kept elements independently re-judged afterward:
  unanimous supported, 0 unsupported, 0 contested — confirmed twice, not
  taken on the repair call's own word. Structural/provenance/reverse-
  coverage gates re-checked and still 100%/clean; `index.html`'s (now-
  fixed) importer re-verified against the file too.

  **Final state:** `reference.domain.yaml` 48 classes / 59 relationships
  / 9 rules / 9 actions, 174 source-mapped elements (177 − 3 genuine
  drops). Hard gates: structural clean, provenance 100%/100%, reverse
  coverage 100%, semantic judging **0 majority-unsupported**. 8 elements
  remain genuinely **contested** (real, disclosed judge disagreement on
  otherwise-passing elements, e.g. whether `Space`'s merge is stated at
  exactly the right level of generality) — left as-is, not force-resolved,
  same "report don't hide" principle as everything else here.
  `translation-evaluation.json`/`translation-report.md` updated with the
  full account.

  **Total real Azure cost, this entire sub-effort** (the original 2-item
  repair + verification, sanity checks, two full 177×3 re-judge passes,
  the action-calibration check, the 9-item repair batch, and all
  verification, summed from every logged call): **$3.22**. Running total
  for the whole Brick HVAC effort across every phase so far: **~$8.61**.

  **#106 still open.**

- 2026-08-17 — **Full clean pipeline rerun from a blank slate**, per
  explicit instruction: *"irrespective of cost, do a real clean rerun of
  the full pipeline from scratch. we need to stabilize full pipeline
  behavior, not just patch things. wipe outputs and temporal results,
  clean start, run again."* This deliberately rejected the prior pattern
  of hand-patching an already-compiled artifact, in favor of validating
  the pipeline itself — fetch → extract → compile → validate → evaluate →
  repair — end to end, using every fix made so far, starting from nothing.
  Wiped `/tmp/brick-source/` entirely and all 7 generated
  `domains/brick-hvac/` artifacts (kept `source-manifest.yaml`).

  **Bug #1 (real, found immediately): `source-manifest.yaml`'s
  `scope.max_depth: 1` was never actually read.** Re-extracting from the
  identical checksum-verified source with the identical manifest produced
  **1622 classes instead of the original 81**. Root cause: `extract.py`'s
  CLI only ever obeyed a separate, easy-to-forget `--max-depth` flag,
  defaulting to unlimited whenever it was omitted — `SourceManifest` never
  parsed `scope.max_depth` from the manifest at all, despite the field
  being written into every manifest as if it were binding. A
  reproducibility record that doesn't actually reproduce. Fixed:
  `source_manifest.py` now parses/validates/round-trips `scope_max_depth`;
  `extract.py --max-depth` falls back to the manifest's value when the
  flag isn't given (same precedence pattern as `compile.py --runs`). 7 new
  tests, including 3 new CLI-level end-to-end tests specifically because
  the old `SelectScopeTests` only ever called `select_scope()` directly
  with an explicit kwarg and could never have caught a CLI-wiring bug —
  worth remembering as a coverage-gap lesson for future tooling. Re-ran
  extraction: 81 classes, matching the original.

  **Compiled 3 fresh runs (~$1.02).** All 3 failed structural validation
  on `allowed_not_all_strings` (4/7/4 errors) — the exact same
  boolean-in-`allowed` defect from the original manual spot-check,
  reproduced on every single independent run **despite** the explicit
  prompt instruction against it added back then. Proof that prompt text
  alone isn't a reliable defense for this class of defect.

  **Bug #2: added a deterministic code-level normalization step to
  `compile.py`,** rather than relying on the model to comply.
  `normalize_allowed_lists()` walks every class property's `allowed` list
  after each run, coerces non-string entries to strings (`True`/`False` ->
  `"on"`/`"off"`, matching the established manual-fix convention; anything
  else stringified), and *that* corrected YAML — not the raw LLM output —
  is what gets written to disk and structurally validated. Corrections are
  logged (`run_normalized` event), not silent. General for any future
  domain. Applied by hand to the 3 already-generated, already-paid-for
  compile outputs rather than re-spending money on a re-call — all 3 now
  validate with 0 errors. 5 new tests.

  **Adjudicated run-2 as the candidate** (29 classes / 33 properties / 32
  relationships / 7 rules / 12 CQs — the richest of the 3 fresh runs,
  both hard gates clean, same "richest + clean gates" criterion used for
  the original adjudication). No automated adjudication logic exists yet
  — still a manual, reasoned selection, recorded here for that reason.

  **Ran the full `evaluate.py` QA suite on run-2 (~$1.50, real):**
  structural/provenance/reverse-coverage all clean, but semantic judging
  failed the hard gate — 1 majority-unsupported
  (`classes.AirHandlingUnit.properties.mode`, an invented operating-state
  enumeration with zero real source backing, same fabrication pattern as
  the original spot-check's `status` defect) plus 4 contested items.

  **Ran repair on the 5 flagged items (~$0.015) — and found a third real
  bug in the process.** The first repair call dropped 2 of the 5
  (`rules.canUseEconomizer`, `actions.maintainCurrentMode`) with
  rationales explicitly saying no source material was provided for them —
  correct given what they were shown, but wrong that they were shown
  nothing: both had real, on-topic source evidence (`Economizer`,
  `Temperature_Deadband_Setpoint`) cited by IRI in their own
  `translation.json` mappings, never looked up.

  **Bug #3: `evaluate.py`'s ground-truth resolution only ever worked
  structurally** (`_class_names_involved` maps a `target_path` to a class
  name, e.g. `classes.Fan` -> `Fan`) — which returns nothing at all for
  rules, since a rule's conditions are free text with no structural class
  reference. This wasn't just a judging blind spot for rules specifically;
  it fed directly into repair's source-context, so a rule could get
  rejected — or, as happened here, nearly dropped by repair — for "no
  source material" when real material existed and was simply never
  fetched. Fixed generally: `_ground_truth_for_target` now also accepts
  a mapping's own `source_iris` plus a new IRI-indexed source lookup
  (`_index_source_records_by_iri`), folding in anything that resolves by
  exact IRI under a `cited:<label>` key, strictly additive to the
  structural resolution. `judge_mappings` wires this through
  automatically, so every future domain's rules (and any element whose
  real grounding isn't its structural class) get a fair shot at both
  judging and repair. 7 new tests.

  **Re-ran repair with real source context for all 5 items (~$0.013).**
  Only 1 now genuinely dropped (`classes.AirHandlingUnit.properties.mode`
  — confirmed no honest grounding exists even with the Economizer
  definition in hand, correct call). The other 4: 1 reground, 3 replaced
  (one of which — `rules.canUseEconomizer` -> a more accurately-named
  `rules.economizerReducesMechanicalConditioning` — is a rename). Repair's
  own re-validation caught a new problem: `structural_ok=False`, 1 error
  (`action_precondition_unresolved`) — the rule rename left
  `actions.enableEconomizer`'s precondition still pointing at the old
  name.

  **Bug #4: `repair.py` renames a class or rule in place but never updated
  anything else that referenced it by name.** Classes and rules are the
  only name-addressed collections anything else points at by exact string
  (relationship endpoints/action inputs cite class names; action
  preconditions cite rule names) — properties and relationships are
  index-addressed, so they had no such risk. Fixed: `apply_repairs()` now
  calls a new `_cascade_rename()` after any class/rule rename, updating
  relationship endpoints, action inputs, and action preconditions that
  pointed at the old name, and records exactly what it touched
  (`cascaded_renames`) so the fix stays visible. 4 new tests. Applied by
  hand to the already-completed repair run (the code fix landed right
  after the call was made) — verified structurally clean afterward.

  **Independently re-judged the 4 repaired/kept elements (~$0.04, real,
  not taken on the repair call's own word):** unanimous supported, 0
  unsupported, 0 contested.

  **Ran one final, authoritative full `evaluate.py` pass on the truly
  final candidate (~$1.10, real)** — deliberately a fresh full pass rather
  than stitching together partial re-checks, matching "stabilize, don't
  patch" for the report itself: structural clean, provenance 100%/100%,
  reverse coverage 100%, semantic judging **0 majority-unsupported**.
  3 elements contested (`relationships[8]`, `relationships[13]`,
  `relationships[20]`) — genuine, disclosed judge disagreement on
  otherwise-passing elements; one of them (`relationships[20]`, the item
  just reground) flipped from unanimous-supported on the isolated
  4-item re-check to majority-`partially_supported`-and-contested on
  this full pass with zero code or content change in between — a live,
  reproduced instance of the LLM-judge non-determinism noted earlier this
  session. Left as-is, not force-resolved, same "report don't hide"
  principle as the original candidate's 8 contested items.

  **Qualitative read-through, per standing policy:** the final
  `reference.domain.yaml` reads as a coherent, real air-side HVAC + basic
  spatial-containment ontology — classes/relationships/rules/actions/CQs
  all consistent with each other, no dangling references, no fabricated
  enumerations surviving. Verified against the previous (48-class)
  candidate that everything present in the old file but absent here has a
  real, specific `out_of_scope`/`not_agent_relevant`/etc. disposition with
  a justification note in `translation.json` — not a silent omission, a
  disclosed compiler judgment call about how much of the scoped subset to
  treat as first-class for this operational slice. `persona.md`
  regenerated to match (drops central-plant-internals and data-center
  framing the old, broader candidate supported but this one doesn't).

  **Total real Azure cost, this clean-rerun sub-effort:** compile $1.02 +
  first full eval $1.09 + two repair calls $0.03 + targeted re-judge $0.04
  + final full eval $1.11 = **~$3.28**. Running total for the whole Brick
  HVAC effort across every phase so far: **~$11.89**.

  Full offline test suite: **163/163 passing** (up from 141 at the start
  of this sub-effort).

  **#106 still open** — none of this changes that; still the user's call.
  Not yet merged to `main` — this candidate is meaningfully different in
  scope-breadth from the one already on `main` via PR #115, so that's
  flagged to the user rather than assumed as an automatic replacement.

- 2026-08-17 (continued) — **A real question exposed a real QA gap: "is
  the narrower candidate's judgment actually *right*, not just
  different?"** Checked honestly: no. `reverse_coverage` only ever verified
  a dropped source element carried a non-empty `note`, never that the note
  was a *sound* reason, and `judge_mappings` only ever judged elements that
  made it **into** the domain, nothing symmetric existed for exclusions.
  Manual inspection of the "narrower" candidate's `out_of_scope` notes
  found the same shallow, templated-justification failure mode already
  fixed once this session for a fabricated `status` property — reused
  near-verbatim ("not needed in/for selected subset") across dozens of
  real, well-defined source classes, several of them direct
  `HVAC_Equipment` siblings of classes the domain modeled in detail
  (Compressor, CondensingUnit, CoolingTower, Pump, HeatExchanger) with no
  principled distinction drawn.

  **Built the missing hard gate, generally, not Brick-specific.**
  `evaluate.py` layer 3b, `judge_dispositions`: an independent judge sees
  each non-mapped disposition's real source definition (ground truth by
  IRI, not self-reported), the compiler's own disposition/note, and
  `included_siblings` — other source elements from the same immediate
  taxonomy area that WERE kept, with what they were mapped to, so a judge
  can catch an exclusion inconsistent with what similar concepts received,
  not just implausible in isolation. New hard gate: zero
  majority-unjustified exclusions. 11 new tests.

  **Ran it for real (233 exclusions × 3 judges, $1.94).** 10 unanimous
  `unjustified` (CO2DifferentialSensor, CondensingUnit, CoolingTower,
  HVAC_Valve, HeatExchanger, IsolationValve, Pump, SpaceHeater, SteamValve,
  WaterTemperatureSensor), plus `Compressor` unanimous `partially_justified`
  ("the note doesn't explain why this wasn't kept like Boiler/Chiller") and
  `Humidifier` contested leaning unjustified — confirming the manual
  finding with real, specific (not templated) judge reasoning.

  **Built `reinstate.py`, the symmetric counterpart to `repair.py` for
  exclusions**, since an excluded element has no `target_path` for
  `repair.py` to mutate — it was never in the domain to begin with. Given
  each flagged exclusion's real source definition, decides per item
  `reinstate` (add real, provenance-backed domain content) or `reground`
  (the exclusion was right, but replace the boilerplate note with one that
  actually engages with the element).

  **Two more real bugs found and fixed while using it for real:**
  1. A first reinstate call added 10 well-grounded classes with **zero
     relationships and zero properties each** — the prompt only ever
     showed bare class names, no relationship-naming precedent to reuse.
     Fixed: `build_reinstate_user_prompt` now shows the domain's actual
     relationship list and each sibling's actual domain properties, not
     just names.
  2. A second attempt (now with real relationships/properties) came back
     with **17 of 35 new elements majority-unsupported** on independent
     re-check — the schema let one evidence block cover a whole reinstated
     item, and `apply_reinstatements` then reused that same class-level
     evidence for every property and relationship mapping. A class's bare
     definition doesn't itself justify a specific property or a specific
     connection to another class — the exact same root failure mode as the
     original `status`-property fabrication, reintroduced fresh in this
     module's first version. Fixed: `class_evidence`, one
     `property_evidence` entry per property, and inline evidence on every
     `new_relationships` entry are now all separately required and
     mechanically validated before anything is applied. 9 more tests.

  **Redid the reinstate call with the fixed schema (12 items, $0.078):** 9
  reinstated (properly grounded per-property/per-relationship evidence
  this time — genuinely fewer, tighter relationships than the broken
  attempt, e.g. `CondensingUnit hasPart Fan` directly quoting Condensing
  Unit's own definition, rather than the earlier attempt's broader
  guessed-at plant-loop connections with no direct textual support), 3
  reground with real specific reasoning (`Compressor`, `HVAC_Valve`,
  `SteamValve` — on reflection genuinely better modeled as subsumed
  by/redundant with classes already in the domain). Independently
  re-verified, not taken on the tool's own word: all 20 new/changed
  elements unanimous supported, all 3 reground notes unanimous justified.

  **Ran one truly-final, full authoritative `evaluate.py` pass** (all 7
  layers, ~$3.16) on the merged result — and it found **one more real,
  genuinely new** majority-unjustified exclusion: `Dry_Cooler`, unanimous
  3/3, specifically *because* it's now clearly comparable to `CoolingTower`
  and `CondensingUnit` — both of which only became real sibling context
  once the reinstatement round above added them. This is the mechanism
  working as intended, not noise: richer domain content sharpens what
  counts as an inconsistent exclusion. Reinstated it too (`DryCooler`,
  $0.017, independently re-verified unanimous supported).

  **Ran a second full pass to check convergence (~$3.20) — clean.** All 4
  hard gates pass: structural clean, provenance 100%/100%, reverse
  coverage 100%, zero majority-unsupported mappings, **zero
  majority-unjustified exclusions**. 22 contested exclusions remain,
  report-only — almost all administrative/metadata RDF properties
  (`serialNumber`, `modelNumber`, `timestamp`, `documentation`, rated-*
  electrical properties) plus 3 genuinely borderline scope calls already
  examined and left as-is (`Site`, `WallAirConditioner`,
  `Water_Temperature_Setpoint` — real, defensible scope-narrowing, not the
  shallow-justification pattern that got fixed). Same "report don't hide"
  principle as every other disclosed-but-not-forced item this session.

  **Known, disclosed limitation:** several reinstated classes remain
  relationship-isolated (Pump, CoolingTower, HeatExchanger, IsolationValve,
  Humidifier, DryCooler, CO2DifferentialSensor, WaterTemperatureSensor) —
  real, correctly-defined, provenance-backed classes, but not wired into
  the rest of the equipment graph, because Brick's source text doesn't
  state their specific connections to other kept classes precisely enough
  to ground a relationship without inventing structure beyond what's
  given. Judged the honest tradeoff: sparser connectivity over a repeat of
  the fabricated-relationship failure mode. Left as-is, not force-connected.

  **Final state:** `reference.domain.yaml` 39 classes / 34 relationships /
  7 rules / 5 actions. `persona.md` regenerated again to include the new
  plant-side equipment while still correctly deferring on
  compressor-internals-level detail.

  **Total real Azure cost, this disposition-judging sub-effort:** ~$9.06
  (initial disposition scan $1.94, three reinstate iterations, four
  targeted re-checks, two full authoritative eval passes). Running total
  for the whole Brick HVAC effort across every phase so far: **~$20.95**.

  Full offline test suite: **198/198 passing** (up from 163 at the start
  of this sub-effort). New modules this sub-effort: `reinstate.py` +
  `prompts/reinstate-prompt.md`.

  **#106 still open** — still the user's call.

- 2026-08-17 (continued) — **Second manual spot-check round**, against the
  domain's current state (post disposition-judging fix, post reinstate.py).
  10%-stratified sample (13 of 127 artefacts, seed 106), reviewer
  szablevi@gmail.com in-session. Full detail:
  `domains/brick-hvac/manual-spot-check.md`/`.json`.

  Result: **13/13 accepted**, one real defect found and fixed along the
  way. `relationships[31]` (Thermostat serves Zone) was flagged for having
  empty `source_iris` despite quoting what looked like real evidence; asked
  to investigate rather than accept on the flag alone, the agent confirmed
  the quote was a genuine verbatim substring of Zone's real source
  definition and found an additional real, uncited match
  (`rec#servicedBy`). Root cause was general, not specific to this one
  mapping: **`repair.py`'s `reground` action asked for evidence as free
  text but never asked for `source_iris` as structured data** — so even an
  accurate prose citation left a mapping just as unverifiable as before the
  repair. Fixed in `repair.py` itself (schema, validation, and
  `apply_repairs` all updated; ~13 test fixtures + 2 new tests), then
  reapplied to this specific item and independently re-verified: unanimous
  supported.

  One process note, not an artefact defect: the agent initially misflagged
  `actions.maintainWithinDeadband`'s rationale as a "stale" leftover
  (wording references the action's pre-rename name). Challenged directly by
  the reviewer given the session's full-rerun claim. Verified by diffing
  against the pre-repair compile output that the current text is genuinely
  different, proving it was written fresh during the repair-driven rename —
  the old name is referenced to explain the rename, not left unrefreshed.
  Flag withdrawn; logged transparently rather than silently corrected.

  Full offline test suite: **200/200 passing**.

  **#106 still open** — still the user's call.

- 2026-08-17 (continued) — **Third manual spot-check round, escalating to a
  full comprehensive provenance audit.** 10%-stratified sample (13 of 127,
  seed 306), 13/13 accepted, but 2 flagged items
  (`relationships[22]`, `actions.verifyOccupiedZoneConditioning`) were the
  2nd and 3rd data points in the same pattern round 2's `relationships[31]`
  had already surfaced. Reviewer, correctly reading this as systemic rather
  than isolated ("this looks like whack a mole more and more"), directed a
  full read-through of all 127 mappings, not another sample, with explicit
  authorization to recompile if needed.

  **Full account: `domains/brick-hvac/provenance-audit.md`.** Deterministic
  scan (does a mapping's evidence/rationale text name a real source class
  that isn't in its own `source_iris`?) found **42 of 127 mappings (33%)**
  with incomplete provenance citations. Root cause found in
  `compiler-prompt.md` itself: it explicitly told the compiler *"empty
  list `[]` is valid for a rule/action grounded in standard practice ...
  say so in `rationale` instead"* — directly licensing exactly the pattern
  found. Fixed generally (source_iris now required for every named concept,
  standard-practice groundings included) — this changes every future
  domain's compile, not just Brick's.

  Fixing the 42 existing mappings needed **two** repair passes, not one: the
  first (42 items, $0.106) correctly reground 33 but the repair model
  *dropped* 9 rather than fabricate — a bug in the audit's own input
  construction (9 reinstate.py-produced equipment classes were given only
  sibling/precedent class definitions as source context, never their own
  real class definition), not a content defect. Correctly refusing to
  ground a class's own property from only its siblings' definitions was the
  right call, not a nuisance — worth noting as the "don't fabricate"
  discipline visibly working. Second pass (9 items, corrected context
  including each item's own real definition, $0.033): all 9 succeeded.

  **All 42 changes are provenance-only** — zero `reference.domain.yaml`
  content changed, only `source_iris`/`source_evidence`/`confidence`/
  `rationale`. Independently re-verified (not taken on the repair calls'
  own word): structural/provenance/reverse-coverage all clean, and **every
  one of the 42 changed elements individually re-judged**: 0
  majority-unsupported, 3 contested (the same "does a modulating valve
  honestly have a numeric position value" category of disclosed,
  non-blocking borderline call already accepted elsewhere in this domain).
  A full authoritative `evaluate.py` pass was deliberately not re-run for
  this fix — content didn't change and every mapping across the whole
  domain has now been independently verified at some point this session;
  re-running the full ~$4 pass would re-confirm, not discover.

  **Total cost, this audit + fix: ~$0.49.** Running total for the whole
  Brick HVAC effort across every phase so far: **~$21.4**.

  Full detail, including the exact 42-item list and per-round-3-sample
  verdicts: `domains/brick-hvac/manual-spot-check.md`/`.json` (now
  multi-round, `rounds` key) and `domains/brick-hvac/provenance-audit.md`.

  **#106 still open** — still the user's call.

- 2026-08-17 (continued) — **Fourth manual spot-check round: the round-3
  audit had missed things.** 10%-stratified sample (13 of 127, seed 512),
  10/13 clean, but 3 flagged (`classes.Chiller.properties.status`,
  `classes.Chiller.properties.coolingCapacity`, `relationships[10]`) had
  the *exact same* uncited-paraphrase defect the round-3 audit was
  supposed to have already eliminated everywhere. Rather than patch these
  3 in isolation (already ruled out as an approach), audited the round-3
  audit's own scan and found two real bugs in it: a case-sensitive label
  match that missed lowercased paraphrases ("chiller" vs. label
  "Chiller"), and a `len(label) > 3` filter that excluded valid short
  labels like "AHU". Re-scanned case-insensitively with no length filter
  (107 raw hits — mostly noise from generic short labels that collide
  with common English words), filtered with an explicit stoplist (→27),
  manually read every one, landed on **20 genuine items** (these 3 plus
  17 more the original audit never caught). Reground with the same
  provenance-only discipline as before.

  A second bug was found and fixed while applying that fix, not in
  `repair.py` itself: the fix batch's `source_context` per item only
  listed the *new* citation to add, never the item's pre-existing correct
  ones — and `repair.py`'s `apply_repairs()` replaces `source_iris`
  wholesale rather than merging, so all 20 items silently lost previously
  -correct citations. Fixed directly with a pure Python union of old+new
  `source_iris`, no re-run needed. Verified: structural clean, 0/127
  mappings with empty `source_iris`, independent re-judge of all 20
  changed elements — 0 unsupported, 3 contested (same disclosed,
  non-blocking borderline category as before). Cost: $0.1475.

  Full account, including the corrected scan methodology and the "a
  comprehensive audit is only as comprehensive as its own scan logic"
  lesson: `domains/brick-hvac/provenance-audit.md` (follow-up section) and
  `domains/brick-hvac/manual-spot-check.md`/`.json` (round 4).

  Running total for the whole Brick HVAC effort across every phase so
  far: **~$21.5**.

  **#106 still open** — still the user's call.

- 2026-08-17 (continued) — **Domain-agnosticism audit, user-directed
  ("the whole extraction pipeline is generic... it MUST BE A GENERAL
  PIPELINE FOR ANY FRIGGIN ONTOLOGY OUT THERE! is it so? if not, FIX").**
  Grepped and AST-scanned (Python string-constant walk, to distinguish
  hardcoded runtime logic from comments) every `.py` file in
  `ontology_translation/tools/`, and grepped every `.md` prompt file, for
  HVAC/Brick/building-domain terms.

  Runtime logic was already fully clean everywhere. Two real violations
  found in illustrative prompt examples, both introduced/left this
  session:

  - `compiler-prompt.md`: the "standard practice needs citations" example
    (added earlier this session, in the round-3 audit's own fix) used a
    concrete Boiler/Chiller/AHU example.
  - `reinstate-prompt.md` (written fresh this session, never went through
    the earlier de-biasing pass other prompts got): its "separate
    evidence" paragraph and full worked JSON output example both used
    HVAC equipment (Compressor/CondensingUnit/Fan/Chiller).

  Both replaced with an abstract Invoice/PurchaseOrder/LineItem example
  matching the files' existing vocabulary, each file now ending with an
  explicit "examples are illustrative, not domain guidance" disclaimer.
  `repair-prompt.md`, `evaluate.py`'s embedded judge prompts,
  `agent_ontology_spec.md`, and `index.html` were all already clean (only
  benign generic-English false positives, e.g. "building the model").
  Full offline test suite re-run clean: 200/200. No LLM cost (deterministic
  scan + manual read-through only).

  **#106 still open** — still the user's call.

- 2026-08-17 (continued) — **Fifth manual spot-check round, and a
  root-cause code fix in `repair.py`.** 10%-stratified sample (13 of 127,
  seed 823), 10/13 clean, 3 flagged (`relationships[11]`,
  `relationships[13]`, `relationships[23]`) — the same uncited-paraphrase
  defect rounds 3-4 were meant to have eliminated. `relationships[13]` had
  even been "fixed" once already in round 4, for a different gap on the
  same mapping — that fix's own rewritten prose introduced a fresh
  uncited mention nothing rescanned afterward.

  User directed escalation. Root cause: a **third** scan-methodology gap
  (after round 4's case-sensitivity and short-label-filter fixes) — the
  scan only matched evidence text using the source ontology's spaced
  label ("Temperature Deadband Setpoint"), never the domain's own compiled
  PascalCase name ("TemperatureDeadbandSetpoint") that compiler-generated
  evidence sometimes uses instead. Fixed with a second matcher: exact
  whole-token comparison against the label's no-space form (not a raw
  substring search, which would create real false positives across word
  boundaries, e.g. "Wing" inside "flowing").

  Full rescan (all 127, not just the sample) with the corrected matcher,
  an expanded stoplist (`area`, `regulates`, `capacity`, `includes` — real
  Brick/REC labels that double as generic English words), and a new
  synonym-cluster check (citing one member of a real synonym set, e.g.
  AHU/Air_Handler_Unit/Air_Handling_Unit, already covers a mention of
  another member). **21 genuine items** found, dominated by
  `AirHandlingUnit`-family relationships whose endpoint was named in
  evidence prose but never cited. `relationships[29]` turned out to be a
  **third-round finding on the same path** — flagged in round 3's raw
  scan, never fixed, still uncited after round 4 touched it for an
  unrelated reason. Fixed directly (pure Python citation addition, no LLM
  call needed — the prose was already correct in all 21, only the
  citation was missing).

  **Real root-cause fix, not another data patch**: investigating
  `relationships[23]` found the round-4-style replace-not-merge regression
  had *also* independently hit round 3's own fix for the same mapping —
  its `hasPart` citation silently dropped, and `Space` (which round 3's
  own scan had already correctly flagged) never even included in that
  batch's construction. Second independent occurrence of the same failure
  mode crossed the line from "be more careful next time" to "fix it in
  the code." **`repair.py`'s `apply_repairs()` now unions old and new
  `source_iris` for `reground` decisions instead of replacing wholesale**
  — reground is documented as strengthening evidence for content that's
  already correct, so it never has a legitimate reason to drop a
  previously-valid citation. New regression test:
  `test_reground_merges_source_iris_instead_of_replacing`.

  Verified: structural clean, 0/127 mappings with empty `source_iris`,
  independent re-judge of all 21 changed elements — 0 unsupported, 1
  contested (same disclosed, non-blocking borderline category as before).
  Full offline suite: 201/201. Cost: $0.1821 (re-judge only; the scan and
  fix themselves were free).

  Full account: `domains/brick-hvac/provenance-audit.md` (second
  follow-up section) and `domains/brick-hvac/manual-spot-check.md`/`.json`
  (round 5).

  Running total for the whole Brick HVAC effort across every phase so
  far: **~$21.7**.

  **#106 still open** — still the user's call.

- 2026-08-17 (continued) — **Sixth manual spot-check round, escalated to a
  full non-sampled audit of the entire domain plus, for the first time,
  every competency question.** User: *"do an utterly complete check.
  Basically everything. the whole ontology. all rules. EVERYTHING... when
  the pass is ready, fix fundamentally and systematically ALL errors! most
  general and stable way possible, no matter the effort or token cost."*

  Sample (13/127, seed 1147): 12/13 clean including confirmation all four
  round-5 fixes held; 1 flagged (`classes.TemperatureSensor.properties.
  value`, same recurring citation-completeness defect, fresh instance).

  **Replaced the text-heuristic scanning approach entirely** for
  relationship/action endpoint completeness, after three rounds of it
  needing new patches every time (case-sensitivity, no-space matching, an
  ever-growing stoplist, synonym clusters). New **`endpoint_citation_gate`**
  in `evaluate.py`, added as a real pipeline layer and permanent hard gate:
  purely structural, no prose-reading at all — checks that every
  relationship's own `source_iris` includes an already-known IRI for its
  `from` and `to` classes, and every action's for its `input` class, drawn
  from each class's own `classes.<Name>` mapping. Can't be fooled by
  phrasing, and applies to any future domain, not just Brick HVAC.

  Found **8 real gaps** across all 127 mappings this way. 3 of them
  (`relationships[14,18,20]`) had rationale text that literally *described*
  a fix ("...the missing cited class IRI should be included") without
  actually performing it — leftover meta-commentary from round 3's original
  repair pass, undetected until a check finally looked at prose *content*
  instead of just citation presence. A 4th item's identical leftover
  phrasing turned out cosmetic (citation was already correct). Fixed all 9
  directly, cleaned all 4 leftover-commentary rationales.

  **Fixed at the source too, not just detected**: added explicit
  "cite both endpoints" instructions to `compiler-prompt.md` and
  `repair-prompt.md` (with an explicit warning against describing a fix
  instead of performing it). Found the *same* defect as a real code bug in
  `reinstate.py`: `apply_reinstatements()` had always cited only the newly
  reinstated class's own IRI on new relationships, never the pre-existing
  other endpoint's already-known one. Fixed generally, 2 new regression
  tests.

  **First competency-question audit this session** (CQs were excluded from
  every prior round as "requirements, not generated elements"): 3 of 12 not
  supported. `cq5` (outside-air vs. return-air CO2 sensing) had real,
  citable source material that just hadn't been connected — fixed by adding
  2 new relationships (AHU hasPoint OutsideAirCO2Sensor/ReturnAirCO2Sensor),
  same standard-practice grounding already used elsewhere in this domain.
  `cq11`/`cq12` were checked against the real scoped source IR and found to
  have **no material to ground them on at all** (no path/connection concept
  in Brick, no outside-air-temperature/enthalpy sensor classes in scope) —
  fabricating content to force these to pass would violate this session's
  standing no-fabrication rule, so both are left honestly unsupported and
  documented as genuine scope limits, not defects.

  Verified: structural clean, `endpoint_citation_gate` 0 gaps (was 8),
  0/129 mappings with empty `source_iris`, reverse coverage 100%. Full
  127-mapping independent semantic re-judge (not sampled): 0 unsupported,
  5 contested (same disclosed non-blocking category throughout this
  domain), $1.123. New relationships independently re-judged: 0
  unsupported, 0 contested. `cq_support` re-run after the fix: `cq5` now
  `True`. Full offline test suite: 209/209 (82 in `test_evaluate.py` incl.
  6 new tests; 26 in `test_reinstate.py` incl. 2 new regression tests).

  Full account: `domains/brick-hvac/provenance-audit.md` (third follow-up
  section) and `domains/brick-hvac/manual-spot-check.md`/`.json` (round 6).

  **Total cost this round: $1.53.** Running total for the whole Brick HVAC
  effort across every phase so far: **~$23.2**.

  **#106 still open** — still the user's call.

- 2026-08-17 (continued) — **Seventh manual spot-check round: first clean
  round, zero findings.** 10%-stratified sample (13 of 129 -- population
  grew by 2 after round 6's cq5 fix -- seed 3301). All 13 accepted,
  including direct re-confirmation that three separate round-5/6 fixes
  (`relationships[4]`, `relationships[25]`, `relationships[18]`) held under
  fresh sampling, and that `actions.verifyOccupiedZoneConditioning`'s input
  class is correctly cited per the new `endpoint_citation_gate`. Full
  129-mapping deterministic gate re-check: structural clean,
  `endpoint_citation_gate` 0 gaps, 0/129 empty citations. No LLM cost.

  Full account: `domains/brick-hvac/manual-spot-check.md`/`.json` (round 7).

  **#106 still open** — still the user's call.

- 2026-08-17 (continued) — **Closed two real gaps surfaced by direct
  questions: no single-command pipeline facility, and an out-of-date
  README.** Asked plainly whether a "run it all and get a flawless
  ontology" facility existed and was documented -- answer was no on both
  counts, and the README gap was worse than assumed: its own "Pipeline"
  section never mentioned `reinstate.py` at all, despite it being
  load-bearing (it's what fixed `cq5` this round), and still said
  `evaluate.py` has "7 layers" after round 6 added an 8th
  (`endpoint_citation_gate`) -- which, on checking, `_render_markdown()`
  never rendered the status of either, despite it being a hard gate in the
  JSON report since round 6.

  Added **`run_pipeline.py`**: chains fetch -> extract -> compile ->
  evaluate -> repair/reinstate (looped up to `--max-fix-rounds`) -> final
  evaluate, using each tool's own CLI conventions and file layout. Its
  repair/reinstate batch-builders generalize the exact process this whole
  session followed by hand every round -- read `evaluate.py`'s own report,
  derive the next tool's input from it -- reusing the same generic helpers
  `evaluate.py`'s own judges already use internally
  (`_class_names_involved`, `_ground_truth_for_target`,
  `_sibling_context_for_iri`), so nothing domain-specific was reinvented.
  Does not attempt to auto-fix `structural_validity`/
  `endpoint_citation_completeness` failures (real compile defects, not
  judged-content problems) and does not loop forever or fabricate its way
  to a passing report.

  Fixed `evaluate.py`'s `_render_markdown()` to actually show
  `endpoint_citation_completeness`'s status. Rewrote `tools/README.md`'s
  Pipeline section to include `reinstate.py` and `run_pipeline.py`, added
  worked CLI examples for `evaluate.py`/`repair.py`/`reinstate.py` (only
  fetch/extract/compile had one before), and corrected the layer count.

  Re-confirmed domain-agnosticism of everything added: `run_pipeline.py`
  and its tests grepped clean, no Brick/HVAC terms anywhere.

  Tests: batch-builder unit tests (pure, deterministic) + one dry-run
  integration test (fetch-skip -> real extract -> compile `--dry-run`
  against a local fixture, no network/credentials/cost) for
  `run_pipeline.py`; one new test for the markdown-rendering fix. Full
  offline suite: 217/217 passing.

  **#106 still open** — still the user's call.

- 2026-08-17 (continued) — **First-ever run of the official `evaluate.py`
  CLI end-to-end on Brick HVAC (all 8 layers together, as a real user
  would run it), for a final authoritative close-out report.** Every
  prior round this session called individual layer functions directly via
  scratch scripts for efficiency, never `run_evaluation()` itself. Running
  it for real found two more real bugs immediately:

  1. **`relationships[2]` (AHU hasPart Damper) was the sole
     majority-unsupported mapping in the entire 129-item domain** (2/3
     judges unsupported) -- every sibling AHU-hasPart-<component>
     relationship (Fan, Filter, CoolingValve, HeatingValve, Economizer)
     passed unanimously. The evidence framed AHU and Damper as both
     connected to the same *external* air-distribution system, a real gap
     short of hasPart's actual compositional claim; the siblings that
     passed used a directly compositional framing instead ("standard
     practice includes X sections in AHUs"). Reworded to match. Re-judged
     independently: 3/3 now supported.

  2. **`cq_support` came back 0.0/10** despite every other gate passing,
     including `disposition_judging` finding zero unjustified exclusions.
     Root cause: `generate_cqs()` summarized `source_ir` (the full 81-class
     scoped source ontology) to write its questions, with no knowledge of
     what the compiler actually chose to model -- every generated question
     asked about material the domain had already correctly, deliberately
     excluded (CRAH/CRAC, dual-duct hot/cold decks, steam/bypass valves,
     "wing"). This is general, not Brick-specific: any domain scoped down
     from a broader source (virtually always the case) would hit the same
     mismatch. Fixed by grounding `generate_cqs()` in the compiled
     domain's own content instead. Verified against the live domain:
     `support_score` 0.0 -> 0.7 (then 0.9 on the final official run --
     `generate_cqs` is stochastic, so the exact score varies run to run,
     but the questions are now genuinely about this domain's own content).

  **Final official result: `hard_gates_ok: True`.** Structural 0 errors,
  provenance 100%/100%, endpoint-citation-completeness 0 gaps, reverse
  coverage 100% (0 silently dropped), semantic judging 0 unsupported (4
  disclosed non-blocking contested), disposition judging 0 unjustified (14
  disclosed non-blocking contested), round-trip average 0.83 (5 sampled),
  CQ support 0.9 (9/10, report-only). Full offline test suite: 218/218.

  Cost: two full official `evaluate.py` runs (~$3.13 each -- the first
  found the two bugs above, the second is the official closing report) +
  small targeted re-judges (~$0.16). **Running total for the whole Brick
  HVAC effort across every phase so far: ~$29.6.**

  **#106 closed 2026-08-18, merged as PR #116.**

- 2026-08-18 -- **Started #109 (IOF Supply Chain, Release_202602).**
  `domains/iof-supply-chain/source-manifest.yaml`: `scope.roots: []`
  (unlike Brick) -- SupplyChain.rdf is already a single-purpose,
  appropriately-sized module (113 locally-defined classes, 18 object
  properties, 1 datatype property, 0 enumerations, 203 restrictions, 1
  `owl:imports`), and 95/113 classes subclass directly from external IOF
  Core/BFO terms this file never defines, so subClassOf-walking from an
  in-file root wouldn't narrow anything -- full local extraction goes to
  the compiler, relevance curation happens via disposition-judging, same
  as Brick's out-of-scope classes.

  **Two more real, general pipeline bugs found while translating this
  structurally different (restriction-heavy, not comment-heavy) source,
  both fixed in `evaluate.py`, both independently verified against Brick's
  real committed data to confirm zero regression there (see the #106 entry
  above):**

  1. `_all_source_iris()` included `"imports"` records. `extract_imports()`
     correctly keys an import record by the *importing* document's own
     IRI (real `owl:imports` semantics) -- document-level metadata a
     compiler can never legitimately disposition as mapped/excluded. This
     unconditionally failed `provenance_gate` for any source with
     `owl:imports`, common for modular BFO-based ontologies. Fixed by
     excluding `"imports"` from the iterated sections.
  2. `_sibling_context_for_iri`'s `mapped_source_iris` conflated "IRI cited
     as supporting evidence" with "IRI's own concept was mapped" --
     `judge_dispositions()` and `run_pipeline.py`'s `_build_reinstate_batch`
     both scanned every mapping's *entire* `source_iris` list, but a
     mapping can legitimately cite another concept's IRI as supporting
     evidence (this session's own citation-completeness discipline
     encourages exactly this) without that concept itself being mapped.
     Created a false "ShipFromLocationRole/ShipToLocationRole were mapped"
     signal that misled both `reinstate.py`'s own reinstate decision
     (tried to reuse already-existing class names, a real validation
     collision -- diagnostic evidence in itself that `reground`, not
     `reinstate`, was the correct action) and a disposition re-judge
     (verdicts explicitly cited the false signal as grounds for
     "unjustified"). Fixed with a new shared helper,
     `_mapped_source_iris_by_disposition(translation)`, built from
     `translation['dispositions']` entries actually marked `mapped` (using
     each disposition's own `note` field as the target_path, per
     `compiler-prompt.md`'s explicit instruction) -- both call sites now
     use this single correct implementation instead of each duplicating
     the buggy scan.

  **A third general bug, found while trying to get IOF's official report
  a real stability number:** `run_evaluation()` built layer 4's
  `domain_datas` only from `--stability-runs`, never including `domain_data`
  itself (the actual `--domain-yaml` being reported on) -- every stability
  score this pipeline had ever produced measured agreement only among the
  *other* supplied runs, silently excluding the domain actually being
  shipped. Fixed (`domain_datas = [domain_data] + [...stability_run_paths]`).
  Also fixed a related gap: `run_pipeline.py`'s own fix-loop and final
  evaluate call never forwarded compile.py's sibling `run-N.domain.yaml`
  files as `--stability-runs` at all, so any domain run through the
  single-command pipeline got no stability signal whatsoever regardless of
  manifest `runs` count -- now forwarded automatically. Brick's already-
  merged `translation-evaluation.json`/`translation-report.md` regenerated
  with the real numbers this enables; `hard_gates_ok` unaffected
  (report-only layer, never a hard gate). New tests for all of the above;
  full offline suite 227/227 passing at this point.

  **Compiler content-quality finding, not a code bug:** the compiler
  invented `status` properties on 7 classes (Carrier, Customer, Supplier,
  FreightForwarder, MaterialTradeItem, PurchaseOrder, Shipment), each
  citing real IRIs per `compiler-prompt.md`'s letter but grounded only in
  a generic "standard domain practice" template with no source-stated
  state vocabulary -- exactly the kind of overreach independent semantic
  judging exists to catch. Handled via repeated real, honest
  evaluate/repair rounds (never a fabricated judge verdict) using
  `run_pipeline.py`'s actual `_fix_round` loop: Carrier/Customer/Supplier/
  MaterialTradeItem/PurchaseOrder.status dropped (no honest grounding
  under any formulation, confirmed across multiple independent real judge
  rounds each); FreightForwarder.status kept (passed cleanly, unanimous,
  every real round it appeared in). One self-correction logged
  transparently: a first pass hand-fabricated a judge verdict for
  `FreightForwarder.status` based on pattern-matching rather than a real
  judge call, extending the earlier round's *legitimate* drops
  (PurchaseOrder/Shipment.status, which real rounds did flag) with one
  illegitimate one -- caught, reverted to the last honest state, and
  re-run for real before proceeding. Standing lesson: act only on real
  `evaluate.py` output via the actual fix-loop, never hand-picked batches
  based on eyeballing a pattern across rounds.

  **Real structural-consistency finding, found by direct inspection, not
  by any existing gate:** dropping `Shipment.status`/`PurchaseOrder.status`
  left `rules.canPrepareShipment`/`canDispatchShipment`/`canReceiveShipment`
  and their corresponding actions referencing status values in free-text
  conditions/effect/verification strings -- nothing in the pipeline checks
  for this class of defect (`structural_gate` only catches a *rule name*
  going dangling, not a property name mentioned in prose). Repaired
  through the real `repair.py` tool (not hand-edited). One of the three,
  `canDispatchShipment`, turned out to have **no honest grounding at all**
  once stripped of the status framing -- confirmed independently across 3
  real repair-tool calls, each reaching `drop` on its own for the same
  reason (only bare class labels for Shipment/Container/FreightContainer/
  TransportProcess/SupplyChainNode, no definitions or stated relations).
  Dropping it broke `structural_validity` (`actions.dispatchShipment`'s
  `preconditions` still named it) -- fixed by repairing both target_paths
  together in one real call; the action now has `preconditions: []` and a
  more general effect/verification, honestly reflecting that no
  source-groundable dispatch precondition currently exists. This class of
  defect (referential consistency after a drop) is flagged as a real,
  general, not-yet-built gate candidate -- see the follow-up issue linked
  from #109 for a prioritized punch list of robustness improvements
  identified this session.

  **Final official result: `hard_gates_ok: True`.** Structural 0 errors,
  provenance 100%/100%, endpoint-citation-completeness 0 gaps, reverse
  coverage 100% (0 silently dropped), semantic judging 0 unsupported (12
  disclosed non-blocking contested), disposition judging 0 unjustified (20
  disclosed non-blocking contested), round-trip average 0.61 (10 sampled --
  lower than Brick's, consistent with IOF's much sparser source
  definitions, cross-validated against the 0-unsupported semantic-judging
  result rather than treated as a defect on its own), CQ support 1.0
  (10/10, report-only). `persona.md` written, grounded in the accepted
  `reference.domain.yaml`. Domain folder assembled under
  `ontology_translation/domains/iof-supply-chain/`.

  **#109 not yet closed -- manual spot-check (explicitly requested by the
  user before any PR) still pending, and no PR opened yet.**

- 2026-08-18 (continued) -- **Manual spot-check round 1: 9/10 accept, 1/10
  reject (fixed), pipeline hardened generally as a result.** 10%-stratified
  sample (10 of 96, seed 109 -- matching issue number, same convention as
  Brick's seed 106). Agent proactively flagged 3 of 10 before rating:
  `classes.Load` and `classes.Retailer` accepted (bare-label-plus-context
  meaning, same pattern already accepted on Brick); `relationships[16]`
  (Shipment usesContainer FreightContainer) accepted as a legitimate,
  disclosed standard-practice specialization of the already-real
  `Shipment usesContainer Container` relationship. **`classes.TrackingEvent.
  properties.eventType` rejected**: `allowed: [packed, shipped, arrived,
  received, stored]` justified only by generic "standard domain practice"
  evidence with zero source text naming any of the 5 specific words --
  same defect family as this domain's already-dropped `status` properties,
  but this one had passed automated judging in the final official run
  (0 unsupported) purely by LLM judge sampling variance, not genuine
  grounding.

  **Reviewer's direction: "fix S5, but in a principled way. the pipeline
  should get better than before."** Rather than a one-off hand-drop, added
  a new elevated-evidence-bar rule to both `compiler-prompt.md` and
  `repair-prompt.md`, modeled on the existing composition-claims (`hasPart`)
  rule: an `allowed` list's specific value *strings* need their own source
  grounding (an `owl:oneOf` enumeration, or values literally named in
  source text) -- a property's existence being standard practice does not,
  by itself, justify any particular set of values; when only existence is
  grounded, the correct shape is plain `type: text`, not invented-but-
  plausible values. Used the strengthened prompt, via the real `repair.py`
  tool, to fix the flagged property for real: model correctly kept the
  property (genuinely grounded) and dropped the invented `allowed` list.
  Re-verified with a full official `evaluate.py` run: `hard_gates_ok: True`,
  0 unsupported, 0 unjustified. Full test suite: 227/227. This is a
  general, domain-agnostic prompt improvement -- every future domain's
  compiler/repair runs now carry this rule, not just IOF. Full account:
  `domains/iof-supply-chain/manual-spot-check.md`.

  Also this session: opened **#117** (linked under epic #101), a
  prioritized punch list of further robustness improvements identified
  along the way -- a referential-consistency gate (nothing currently
  checks that dropping a property/rule doesn't leave dangling free-text
  references in rule/action prose, found only by direct inspection when
  fixing `PurchaseOrder`/`Shipment.status`), judge-stability hardening
  (more judges or a confirmation round for contested items, given the
  repeated verdict flip-flopping observed on identical content across
  independent real rounds this session), and related prompting work.

  **#109 not yet closed -- still no PR opened. Next: user's call on
  whether more spot-check rounds are wanted, or proceed straight to PR.**
