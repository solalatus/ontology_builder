# TODO — Helper Agent (embedded BYOK ontology chat panel)

Progress tracker for `helper_agent_plan.md`. Same convention as the base app's `TODO.md`: check items
off as work happens, log deviations/decisions with a dated entry, keep "Current State" accurate enough
that this can be picked up cold. This branch (`helper_agent`) is a standalone subproject and is never
merged into `main` — see `helper_agent_plan.md` §0.

---

## Current State

- **Phase:** Phases 1 (panel scaffold + BYOK connect modal + live model list), 2 (live chat, no tools
  yet), and 3 (tool-calling) are implemented, tested, and green. Phases 4–6 (see `helper_agent_plan.md`
  §6) are not started.
- **Test suite:** `tests/helper-agent-phase1.spec.mjs` (11 tests) + `tests/helper-agent-phase2.spec.mjs`
  (15 tests) + `tests/helper-agent-phase3.spec.mjs` (9 tests), all mocking the OpenAI API via
  `page.route()` (no real network calls, no API key needed). Full repo suite: 322 JS tests, all green,
  run twice consecutively (plus 3 standalone reruns of `tests/ui-polish.spec.mjs` after a small
  robustness fix there — see the Phase 2 Log entry).
- **What Phase 1 built:** the collapsed-by-default `#agent-panel` (toggle fixed to the left edge), the
  two-stage `#agent-connect-overlay` modal (stage 1: enter API key → live `GET /v1/models` call, which
  doubles as the real-world CORS check per plan §3; stage 2: review/override the heuristically
  preselected newest-reasoning-model, then confirm), BYOK persistence (unchecked-by-default in-memory
  key, opt-in `localStorage` under `kg-agent-key`/`kg-agent-model`, a "forget saved key" action),
  disconnect, and bilingual (en/hu) strings for all of it.
- **What Phase 2 built:** real (mocked-in-tests) Chat Completions calls once connected — the chat
  input/send are now enabled, not permanently disabled. An adapted system prompt (ROLE/GROUND
  RULES/SCOPE-hardening/TONE, `AGENT_SYSTEM_PROMPT_BASE`) is resent in full on every turn, with a
  language-lock directive (plan §4.9) computed fresh from the current UI language each time — not
  cached — and an `AGENT_KNOWLEDGE` seam left empty for Phase 4 to fill in without touching this
  plumbing. A reactive context-length summarization flow (plan §4.10) compacts `agentState.apiMessages`
  (bounded to 2 compaction attempts, falling back to a deeper compaction on a second overflow) while
  `agentState.transcript` — what the user actually sees — is never shortened. No `tools` field is sent
  yet (Phase 3). Transcript rendering is `textContent`-only, never `innerHTML` (plan §4.7).
- **What Phase 3 built:** a single coarse `apply_ontology_yaml` tool (plan §4.5 — no fine-grained
  per-entity tool set), attached to every chat request (`tools`/`tool_choice: "auto"`), wired to the
  exact same `parseDomainYamlImport()`/`planYamlImport()`/`commitYamlImport()` pipeline the manual Import
  dialog uses. Always "merge," never "replace" — the tool literally cannot reach replace mode. Exactly
  one real commit is allowed per user turn: the first tool call that actually changes something commits
  (one `commitYamlImport()` call = one undo step, inherited for free from that function's own existing
  `snapshotState()`/`pushHistory()`), and any further tool calls that same turn are skipped with a
  visible, localized transcript note rather than merged into the same commit (a deliberate simplification
  over the plan's literal "concatenate the YAML" wording — see this section's Log entry). Every outcome
  (applied / skipped / nothing-to-apply / malformed-arguments) gets its own transcript note, not just the
  success case. A bounded `AGENT_MAX_TOOL_ROUNDS = 5` stops a pathological always-calls-the-tool loop from
  running forever, independent of the existing `AGENT_MAX_COMPACTIONS` bound for context-length recovery.
- **`window.__kg.agent`** exposes the same test-introspection surface the rest of the app already
  follows: `state`, `isExpanded`/`setExpanded`, `openConnectModal`/`closeConnectModal`/`submitConnect`,
  `disconnect`, `forgetStoredKey`/`hasStoredKey`, `pickDefaultModel` (+ the two heuristic predicates it's
  built from), `getConnectErrorKind`, `sendMessage`/`buildSystemPrompt`/`isSending`. Phase 3 didn't need
  to add anything new here — tests exercise tool-calling entirely through the existing `sendMessage()` +
  `window.__kg.state`/`window.__kg.history` surfaces.

## Phase 1 — Panel scaffold + connect modal + model list

- [x] Collapsed/expanded panel state machine (`#agent-panel`, `agentState.panelExpanded`).
- [x] Connect modal: key input, live `GET /v1/models`, heuristic default model
      (`pickDefaultAgentModel` — newest `o[0-9]*`/`*think*`/`*reason*` id, falling back to the newest
      non-audio/image/embedding/moderation id if none match), manual override before confirming.
- [x] BYOK persistence: unchecked "remember" by default (in-memory only), opt-in `localStorage`,
      pre-fill on next modal open, explicit "forget saved key" action.
- [x] Disconnect action resets `agentState` and the connected/disconnected UI.
- [x] Bilingual (en/hu) `STRINGS` entries + `applyAgentLanguage()`, including re-rendering the last
      connect error by *kind* (not pre-rendered text) so a language toggle mid-error doesn't leave a
      stale-language message on screen.
- [x] Error handling: empty key, invalid key (401), generic non-2xx, network/CORS failure — each a
      distinct, testable `agentConnectErrorKind`.
- [x] Tests: `tests/helper-agent-phase1.spec.mjs`, all OpenAI calls mocked via `page.route()`.

### Log

**2026-07-28 — Phase 1 implemented.** Built per `helper_agent_plan.md` as revised after the user's
second feedback round (prompt hardening, long-context summarization, language lock, and live model
listing were folded into the plan before this phase started — see that document's own revision history
for the reasoning). Two notable implementation decisions made along the way, not explicitly spelled out
in the plan text itself:

- The connect modal became a genuine **two-stage** flow (enter key → fetch models → review/override →
  confirm) rather than a single submit, because the plan's "manually overridable" model requirement is
  only meaningful if the user can see the live-fetched list *before* the connection is finalized, not
  only after. The submit button's label changes (`Connect` → `Confirm model & connect`) to reflect the
  stage.
- `populateAgentModelSelects()` builds `<option>` elements via `createElement`/`textContent` (mirroring
  the existing Domain Model dialog's own `ruleOptions` population pattern), not an interpolated HTML
  string — model ids come back from a live API response and get the same "don't build HTML from
  external strings" treatment as the chat transcript will in Phase 2 (plan §4.7).
- A real (non-`curl`) CORS spike was attempted with a Playwright-launched Chromium against the actual
  `api.openai.com`, proxy explicitly configured and TLS errors ignored. It failed with
  `net::ERR_CONNECTION_RESET` at the network layer — while `curl` through the identical proxy, at the
  same time, succeeded — isolating the failure to this sandbox's own browser/proxy tunneling rather than
  a CORS answer either way. See `helper_agent_plan.md` §3 for the full writeup; the connect modal's own
  live `/v1/models` call remains the real-world check, run by actual users outside this sandbox.
- One pre-existing test (`tests/ui-polish.spec.mjs`'s theme/armed-button-border test) flaked once under
  full-suite load during this pass; it passed cleanly both in isolation and on a full-suite rerun
  immediately after, and is unrelated to any change made here (unmodified CSS/logic in that area) — not
  logged further, since the project already has a documented history of this test class flaking under
  load (see the base app's own `TODO.md`).

## Phase 2 — Live chat, no tools yet

- [x] Real Chat Completions calls (`callAgentChat()`), no `tools` param (Phase 3's job).
- [x] Chat input/send enabled once connected; send stays disabled until there's non-whitespace text to
      send, and while a reply is in flight (typing indicator shown).
- [x] Adapted system prompt (`AGENT_SYSTEM_PROMPT_BASE`: ROLE/GROUND RULES/SCOPE-hardening/TONE) resent
      in full on every turn, plus the output-language directive (`agentLanguageDirective()`, plan §4.9)
      recomputed fresh from the live `lang` value each call — never cached, so a mid-conversation
      language toggle takes effect on the very next message.
- [x] `AGENT_KNOWLEDGE` constant left empty as the seam Phase 4 fills in (howto + `load_edge_list.py` +
      condensed paper excerpts) without touching any of this request-building code.
- [x] Reactive context-length summarization (plan §4.10): `agentState.apiMessages` (API-facing) is what
      compacts; `agentState.transcript` (UI-facing) never shortens. Bounded to
      `AGENT_MAX_COMPACTIONS = 2` attempts — first keeps the last 4 messages verbatim and summarizes the
      rest, the second (fallback) keeps only the single most recent message — so a pathological
      never-fits case fails cleanly with a visible error instead of retrying forever.
- [x] Distinct, testable error kinds for invalid key (401), rate limit (429), network/CORS failure, and
      context-length-exhausted, each surfaced as a `role: "system"` transcript entry (never fabricated
      as if the assistant said it).
- [x] Transcript rendering is `textContent`-only (`renderAgentTranscript()`), never `innerHTML` — model
      output is untrusted external content (plan §4.7).
- [x] Disconnect clears `transcript`, `apiMessages`, and the `sending` flag, and resets the rendered DOM.
- [x] Tests: `tests/helper-agent-phase2.spec.mjs` (15 tests, all OpenAI calls mocked via `page.route()`).
      Updated the one Phase 1 assertion that assumed the chat input stayed permanently disabled.

### Log

**2026-07-28 — Phase 2 implemented.** Per the user's explicit instruction after Phase 1 merged: extensive
tests for every new feature going forward, keep existing tests up to date, stability is the priority.

- The system prompt is more fully written out here than the plan's phase breakdown strictly required for
  Phase 2 (which only asked for "real Chat Completions calls" plus the language lock and context
  handling) — done deliberately so Phase 2 is already a genuinely usable conversational agent, not a
  placeholder. Phase 4 only needs to populate `AGENT_KNOWLEDGE` and refine wording; the OUTPUT
  FORMAT/tool-calling instructions are still deferred to Phase 3, since they'd reference a tool that
  doesn't exist yet.
- Compaction test coverage required seeding `agentState.apiMessages` with prior turns directly
  (`seedAgentPriorHistory()`) rather than round-tripping several real mocked exchanges first — a
  single-message conversation has nothing "older than the last 4 messages" to summarize, so a
  context-length error on message #1 is correctly unrecoverable by design, not a bug; the tests reflect
  a conversation that has actually grown long enough for compaction to be meaningful.
- Found and fixed a real, reproducible flake in a *pre-existing* test while chasing full-suite
  stability: `tests/ui-polish.spec.mjs`'s theme-toggle test sampled `#btn-connect`'s border color
  immediately after clicking the theme toggle, with no wait for the border-color transition
  (`--transition-fast`, 120ms) to settle — unlike the two other tests in the same file, which already
  wait 200ms after their own color-changing clicks. Added the same wait after both clicks in that test.
  Confirmed fixed: 3 standalone reruns of that file plus 2 full-suite reruns, all green.
- Full suite: 313 JS tests, green, run twice consecutively (plus the standalone reruns above).

## Phase 3 — Tool-calling

- [x] `APPLY_ONTOLOGY_YAML_TOOL` schema (single `yaml` string parameter), attached to every chat request.
- [x] `handleAgentToolCall()` wires the tool to `parseDomainYamlImport()`/`planYamlImport()`/
      `commitYamlImport(yaml, "merge")` — never `"replace"`.
- [x] One-real-commit-per-turn guardrail: first applying call commits (and inherits the "one call =
      one undo step" property directly from `commitYamlImport()`'s own snapshot/pushHistory pair, no new
      history-batching code needed); further tool calls the same turn are skipped with a visible note.
- [x] No-op detection: a tool call whose YAML adds/changes nothing is reported as such and creates no
      undo step (a defensive check added on top of `commitYamlImport()`, which itself would otherwise
      push an empty-diff history entry unconditionally).
- [x] Malformed tool-call arguments (invalid JSON) are caught and reported, not thrown.
- [x] `AGENT_MAX_TOOL_ROUNDS = 5` bounds a pathological always-calls-the-tool loop.
- [x] `AGENT_SYSTEM_PROMPT_BASE` gained an "EDITING THE LIVE ONTOLOGY" section: call the tool
      incrementally as things are confirmed (not batched to one end-of-interview dump, unlike the
      original MyGPT's file-download framing), at most one call per message, the YAML shape spec.
- [x] Tests: `tests/helper-agent-phase3.spec.mjs` (9 tests). Updated one Phase 2 test whose "no tools
      field" assertion Phase 3 intentionally made untrue.

### Log

**2026-07-28 — Phase 3 implemented.** Notable decisions/deviations from the plan's literal text:

- The plan's §4.5 speculated that multiple `tool_calls` in one response would be handled by
  "concatenat[ing] their yaml bodies under merged top-level keys before a single `commitYamlImport`
  call." Implemented differently: only the *first* call that actually changes something commits; any
  others are skipped with their own visible tool-role response (`"Skipped: only one apply_ontology_yaml
  call is applied per message."`) sent back to the API, and a separate localized transcript note shown
  to the user. This gives the identical guarantee (one real edit, one undo step, per turn) with far less
  surface area — no bespoke re-serialization of merged parsed YAML back into the bespoke text dialect,
  which would have been the fragile part of the literal approach.
- Every tool-call outcome (applied / skipped / nothing-to-apply / malformed-arguments) gets its own
  transcript note, not just the success case the plan explicitly named — reasoned to matter for the
  same "real time presents what the chatbot edited" transparency goal the plan states, extended to also
  cover *attempted-but-not-applied* edits, which are just as important for the user to see.
- Added a no-op guard in front of `commitYamlImport()`: that function's own `pushHistory()` call is
  unconditional (it doesn't check whether `before`/`after` snapshots actually differ), which is fine for
  its existing manual-import caller (only invoked after a real file selection) but would let a
  do-nothing tool call still burn an undo-history slot. `handleAgentToolCall()` now checks
  `planYamlImport()`'s added/changed counts before ever calling `commitYamlImport()`.
- Extensive test coverage per the user's explicit instruction: real canvas-state assertions (not just
  transcript text) that a tool call went through the actual import pipeline, an undo-reverses-it test,
  a two-tool-calls-in-one-response test asserting both the skip behavior *and* that both `tool_call_id`s
  get a response (an API-contract requirement, not just app-internal correctness), a bounded-runaway-loop
  test, and a combined tool-calling + context-length-compaction test to prove the two Phase 2/3 features
  compose correctly rather than just each working in isolation.
- Full suite: 322 JS tests, green, run twice consecutively.
