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
  actual Azure resource. See today's Log entry for the result — one real
  bug found and fixed (in the test itself, not `compile.py`), then a clean
  pass. Total real spend so far across both live runs: **$0.0193**.
- **#103 (automatic translation-quality evaluation): not started yet.**
  Paused to do the live smoke test first, per explicit instruction: "do
  some smoke tests with the real api first... only when they pass, go
  ahead with next step." Smoke test passed — #103 is next.
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
