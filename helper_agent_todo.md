# TODO — Helper Agent (embedded BYOK ontology chat panel)

Progress tracker for `helper_agent_plan.md`. Same convention as the base app's `TODO.md`: check items
off as work happens, log deviations/decisions with a dated entry, keep "Current State" accurate enough
that this can be picked up cold. This branch (`helper_agent`) is a standalone subproject and is never
merged into `main` — see `helper_agent_plan.md` §0.

---

## Current State

- **Phase:** Phases 1 (panel scaffold + BYOK connect modal + live model list) and 2 (live chat, no tools
  yet) are implemented, tested, and green. Phases 3–6 (see `helper_agent_plan.md` §6) are not started.
- **Test suite:** `tests/helper-agent-phase1.spec.mjs` (11 tests) + `tests/helper-agent-phase2.spec.mjs`
  (15 tests), all mocking the OpenAI API via `page.route()` (no real network calls, no API key needed).
  Full repo suite: 313 JS tests, all green, run twice consecutively (plus 3 standalone reruns of
  `tests/ui-polish.spec.mjs` after a small robustness fix there — see the Phase 2 Log entry).
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
- **`window.__kg.agent`** exposes the same test-introspection surface the rest of the app already
  follows: `state`, `isExpanded`/`setExpanded`, `openConnectModal`/`closeConnectModal`/`submitConnect`,
  `disconnect`, `forgetStoredKey`/`hasStoredKey`, `pickDefaultModel` (+ the two heuristic predicates it's
  built from), `getConnectErrorKind`, and now `sendMessage`/`buildSystemPrompt`/`isSending`.

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
