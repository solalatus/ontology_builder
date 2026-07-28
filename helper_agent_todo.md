# TODO — Helper Agent (embedded BYOK ontology chat panel)

Progress tracker for `helper_agent_plan.md`. Same convention as the base app's `TODO.md`: check items
off as work happens, log deviations/decisions with a dated entry, keep "Current State" accurate enough
that this can be picked up cold. This branch (`helper_agent`) is a standalone subproject and is never
merged into `main` — see `helper_agent_plan.md` §0.

---

## Current State

- **Phase:** All six phases (see `helper_agent_plan.md` §6) are implemented, tested, and green: 1 (panel
  scaffold + BYOK connect modal + live model list), 2 (live chat, no tools yet), 3 (tool-calling, plus its
  `get_graph_state` addendum — see its own dated Log entry below), 4 (baked knowledge + finalized system
  prompt), 5 (visual QA pass), and 6 (this final regression/docs pass).
- **Test suite:** `tests/helper-agent-phase1.spec.mjs` (11) + `tests/helper-agent-phase2.spec.mjs` (15) +
  `tests/helper-agent-phase3.spec.mjs` (9) + `tests/helper-agent-graph-state.spec.mjs` (10) +
  `tests/helper-agent-phase4.spec.mjs` (8), all mocking the OpenAI API via `page.route()` (no real network
  calls, no API key needed). Full repo suite: 348 JS tests + 13 Python tests, all green, run twice
  consecutively.
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

## Maintenance — merged base-app fixes from `main`

**2026-07-28.** Per explicit instruction after the base-scope retrospective test-coverage pass (PR #34)
merged into `main`: this branch had diverged from `main` before that pass, so it still carried the same 6
pre-existing bugs `main` just fixed (a malformed rules/actions storage payload crashing undo/save, silent
class/rule/action name collisions in the YAML export, unguarded modal stacking, a UTF-8-BOM bug in
`tools/load_edge_list.py`, stale rule/action card sub-labels on a language toggle, and a literal-
placeholder-text graph rename false positive — see `TODO.md`'s own dated Log entry on `main` for the full
per-bug account) plus a test-stability fix in `tests/ui-polish.spec.mjs` this branch had *also* made
independently (see Phase 2's own Log entry above) before the two branches diverged.

Merged `origin/main` into this branch. One trivial conflict, in `tests/ui-polish.spec.mjs` — both
branches had independently added the identical fix (a missing `waitForTimeout` before sampling a
transitioning border color) with slightly different comment wording; kept `main`'s wording, since it's
otherwise byte-identical. `index.html` merged with no conflicts (the two branches' changes touch entirely
different functions — this subproject's own agent-panel code vs. the base-app fixes). No changes needed
to any of this branch's own `helper-agent-phase*.spec.mjs` files.

Full suite (base app's 295 + this subproject's own 35 = 330 JS tests) green, run twice consecutively; 13
Python tests green.

## Addendum to Phase 3 — `get_graph_state` + prompt-cache key

**2026-07-28.** User-directed follow-up after asking "how does the agent know about the current state of
the graph?" — a real gap: the agent had no channel at all for learning what's already on canvas, only the
running conversation. See `helper_agent_plan.md` §4.5b for the full design writeup and the explicit
tradeoff reasoning (a pull tool, chosen over auto-injecting live state into the system prompt, specifically
to keep the prompt prefix byte-stable so OpenAI's prompt-prefix caching stays effective across a whole
connection — the user's own explicit direction, overriding this plan's earlier default lean).

- [x] `GET_GRAPH_STATE_TOOL` — no arguments, reuses the existing, already-tested `buildDomainYamlExport()`
      verbatim (no new serialization logic). Attached to every chat request alongside
      `APPLY_ONTOLOGY_YAML_TOOL`.
- [x] New "STAYING IN SYNC WITH THE LIVE ONTOLOGY" system-prompt section (directly above "EDITING THE LIVE
      ONTOLOGY"): call `get_graph_state` at conversation start, before any write it's not sure is genuinely
      new-vs-changed, and after any long pause or surprise. Prompt-based behavioral guarding only — no
      structural guarantee the model actually calls it, an explicit, accepted tradeoff for keeping the
      cache prefix stable.
- [x] `handleGetGraphStateCall()` — read-only, never touches `committedThisTurn`, so it never counts
      against `apply_ontology_yaml`'s one-real-commit-per-turn guardrail and can be called any number of
      times per turn, bounded only by the existing shared `AGENT_MAX_TOOL_ROUNDS` limit.
      `sendAgentChatMessage()`'s tool-dispatch loop now branches on `call.function.name`.
- [x] `agentState.promptCacheKey` — generated fresh on connect (`crypto.randomUUID()`-based), cleared on
      disconnect, sent as `prompt_cache_key` on every request (both `callAgentChatRaw()` call sites,
      including the summarization path). Clarified in code comments: OpenAI's prompt-prefix caching is
      automatic with no explicit enable flag — `prompt_cache_key` only strengthens cache-hit *routing
      consistency* for a shared long prefix, which is exactly what staying pull-tool-based (rather than
      injecting live state into the prompt) is what makes worth doing at all.
- [x] Tests: `tests/helper-agent-graph-state.spec.mjs` (10 new) — correctness against
      `buildDomainYamlExport()` on empty and populated graphs, reflecting a manual canvas edit made
      entirely outside the conversation, non-interaction with the one-commit guardrail, no undo step ever
      created by the read tool, the shared round-limit still applying to a read-only loop, the tool
      schema present on every request, **the system prompt's message content proven byte-identical before
      and after the graph changes** (the concrete proof the cache-preserving design actually holds), the
      cache key's stability within one connection and freshness across a reconnect, and graceful handling
      of an unrecognized tool name. Updated one pre-existing Phase 3 test whose "exactly one tool"
      assertion this addendum intentionally made untrue.
- Full suite: 340 JS tests + 13 Python tests, green, run twice consecutively.

## Phase 4 — System prompt + knowledge

- [x] `AGENT_KNOWLEDGE` populated (previously the empty seam Phase 2 left behind): the full
      `minimal_domain_model_howto.md` text, the full `tools/load_edge_list.py` source (kept in sync with
      the retrospective-audit BOM fix — `encoding="utf-8-sig"`, not plain `utf-8`), and a condensed,
      newly-authored excerpt of the paper's operational sections (§4 formalism rationale — why
      relationships and properties are both just predicates distinguished by range; §7 recommended
      minimal profile, levels 0–3; §9 construction method's 9 steps) — deliberately not the full paper, no
      proofs/citations/benchmark numbers.
- [x] New "INTERVIEW PROCESS" system-prompt section (`AGENT_SYSTEM_PROMPT_BASE`, between GROUND RULES and
      SCOPE): 10 numbered phases (0 orientation via `get_graph_state` first, 1 real questions/actions, 2
      classes, 3 relationships, 4 decision-bearing properties, 5 language layer, 6 constraints/fixed
      choices, 7 rules, 8 actions, 9 validation pass with a competency check + final checklist), adapted
      from the original MyGPT prompt's phase structure and the paper's §9 construction method, reconciled
      for incremental `apply_ontology_yaml` calls instead of an end-of-session file dump.
- [x] Tests: `tests/helper-agent-phase4.spec.mjs` (7 tests at the time) — the full howto content present
      (including its own complete compact example, proving the whole doc is embedded rather than
      summarized), the loader source present with the BOM fix, the paper excerpt present with negative
      assertions proving it's a condensation (no `Proposition \d`, no benchmark dataset names, no numbered
      citation markers), all 10 INTERVIEW PROCESS phase markers present, no leaked API mechanics
      (endpoint URL, key prefix), system-prompt stability across repeated calls, and language-toggle
      isolation (only the OUTPUT LANGUAGE directive block differs between en/hu, everything else
      byte-identical).

### Log

**2026-07-28 — Phase 4 implemented.** The knowledge content was authored from the actual uploaded source
files (the howto doc and `tools/load_edge_list.py`, copied verbatim) plus a fresh re-read of the full
paper PDF for §4/§7/§9, rather than paraphrased from memory — confirmed accurate against the paper's own
text before splicing into `index.html`. One test-authoring bug surfaced and fixed during this phase's own
test-writing, not a content bug: the "no numbered citation markers" negative assertion
(`assert.doesNotMatch(prompt, /\[\d+\]/)`) initially false-matched the embedded Python loader's own
`sys.argv[0]`/`sys.argv[1]` array indexing. Fixed by tightening the regex to
`/(?<!\w)\[\d+\]/` — a citation bracket is never immediately preceded by a word character the way
`argv[` is. Full suite: 347 JS tests + 13 Python tests, green, run twice consecutively.

## Phase 5 — i18n + visual polish

i18n needed no new work here — every phase since Phase 1 added its own bilingual `STRINGS` entries as it
went, so this phase was purely the visual QA sweep the plan's §6 called for.

- [x] Screenshot-driven QA pass (`page.screenshot()` against a real headless Chromium, mocked OpenAI
      responses): collapsed panel, disconnected expanded panel, both connect-modal stages (key entry,
      model review), both connect-modal error states (empty key, network/CORS failure), a connected panel
      with an empty transcript, a mixed-role transcript (user/assistant text/tool-outcome note), light and
      dark themes, a narrow (420px) viewport, and long-message word-wrap/auto-scroll behavior.
- [x] Found and fixed one real defect: `agentNoToolsNote` (the static line under the transcript) still
      read "This agent can only talk for now — editing the canvas arrives in a later phase" in both
      languages — stale copy written before Phase 3 shipped `apply_ontology_yaml`, never updated since.
      Reworded (en: "This agent can read the current domain model and apply changes to it — review each
      edit as it lands."; hu: matching translation) in both the `STRINGS` table and the static HTML
      fallback markup.
- [x] Everything else held up under the sweep with no changes needed: text wrapping, transcript
      auto-scroll, panel width at a narrow viewport, error-message contrast/readability, and both themes
      all rendered correctly.
- [x] Test: added to `tests/helper-agent-phase4.spec.mjs` (bringing it to 8) — asserts the note no longer
      contains the stale "can only talk for now" / "arrives in a later phase" phrasing in either language,
      and does contain the corrected wording.

### Log

**2026-07-28 — Phase 5 implemented.** No CSS/layout changes were needed — the panel's existing flex layout
(transcript `flex:1` with a `max-height: 40vh` cap, growing from the top rather than pinning input to the
very bottom on a short conversation) was already a deliberate, working choice from earlier phases, not a
new regression, so it was left as-is rather than redesigned without a concrete complaint driving it. The
one substantive finding (stale pre-Phase-3 copy) is exactly the kind of thing this phase's QA sweep was
for. Full suite: 348 JS tests + 13 Python tests, green, run twice consecutively.

## Phase 6 — Tests + docs

- [x] Full regression pass: 348 JS tests (`node --test tests/*.spec.mjs`), run twice consecutively, plus
      13 Python tests (`python3 -m unittest discover -s tools -p "test_*.py"`) — all green.
- [x] `helper_agent_plan.md` §6 updated to mark Phases 4–6 done, with a short summary of what each
      actually built (vs. the plan's original forward-looking description).
- [x] This file's Current State and per-phase sections updated to close out the subproject's originally
      planned six phases.

### Log

**2026-07-28 — Phase 6 implemented.** Per the user's explicit instruction to implement all remaining
phases (4, 5, and 6) in one continuous pass. This closes out the six-phase plan from
`helper_agent_plan.md` §6 in full; the branch remains `helper_agent`, still never merged into `main` per
§0.

## Addendum — live OpenAI integration tests + two real bugs found

**2026-07-28.** User-directed follow-up: every prior test in this subproject mocks the OpenAI API
entirely (`page.route()` serving hand-authored JSON), so nothing had ever exercised this code against the
*actual* live API contract. Per explicit instruction: a gitignored `.env` (`OPENAI_API_KEY=...`) at the
repo root, never committed and never baked into any shipped file, plus a new opt-in live test file.

- [x] `tests/lib/env.mjs` — minimal dependency-free `.env` parser (`loadEnvKey(name)`); environment wins
      over `.env` if both are set.
- [x] `.gitignore` gained a `.env` entry.
- [x] `tests/helper-agent-live-openai.spec.mjs` (6 tests) — see its own header comment for the full
      design writeup. Skips entirely, with a clear reason, when no key is configured. Because a real
      headless Chromium *inside this specific sandbox* cannot reach `api.openai.com` directly (confirmed
      via `page.on("requestfailed")` → `net::ERR_CONNECTION_RESET`, reproducing the exact finding
      `helper_agent_plan.md` §3's CORS spike already made once, independent of which key is used), every
      live test's `page.route()` handler forwards the app's real outgoing request to the genuine OpenAI
      endpoint via Node's own `fetch()` (confirmed reachable from Node in this sandbox) and relays the
      real response back unmodified — the browser still drives real UI interactions and real app code the
      whole way; only the last network hop is relayed through Node rather than dialed directly, a sandbox
      artifact rather than a change to what's being tested. A real user's own browser has no such
      restriction.
- [x] Live coverage: a real `GET /v1/models` call (shape assumptions, default-model selection against a
      real catalog), a real invalid-key 401, a real plain chat reply rendered through the actual UI, a
      real tool-calling round trip that genuinely applies to the canvas through the real import pipeline,
      a real `get_graph_state` call seeing a manually-added node, and the output-language lock holding
      against a real Hungarian directive. Confirmed stable across two consecutive real runs.

**Two real bugs found this way, neither of which any mocked test could have caught:**

1. **Default-model heuristic picked a "deep-research" specialty model, and never saw `gpt-5.x` at all.**
   Against a real key's actual model list, the newest id in the "reasoning" pool was
   `o4-mini-deep-research-2025-06-26` — a specialized autonomous-research product, not a general chat
   model — because the original heuristic only recognized `o<digit>` ids and the literal words
   think/reason, so the account's entire `gpt-5.x` lineup (its real current reasoning-capable models) was
   invisible to it. Fixed: excluded `deep-research`/`search-preview`/`search-api` from the chat-model
   pool, and extended the reasoning-family heuristic to `gpt-5` and above.
2. **That same fix's own newest pick, `gpt-5.6-luna`, turned out to be unusable by this app at all.**
   A live chat-completion call with tools attached (i.e. every real request this app makes) returned a
   real `400`: *"Function tools with reasoning_effort are not supported for gpt-5.6-luna in
   /v1/chat/completions. To use function tools, use /v1/responses or set reasoning_effort to 'none'."*
   Tested systematically across the account's whole reasoning-family model list: this failure was
   specific to the newest preview-codename generation (`-luna`/`-terra`/`-sol`), not to `gpt-5.x` in
   general (`gpt-5`, `gpt-5.5`, `gpt-5-mini`, `gpt-5-nano`, the o-series, and `gpt-4o-mini`/`gpt-4.1` all
   supported tools fine). Also tested the error's own suggested workaround
   (`reasoning_effort: "none"`) — it does unblock `gpt-5.6-luna`, but every other model tested (`o1`,
   `o3-mini`, `gpt-5`, `gpt-5-mini`, `gpt-4o-mini`, `gpt-4.1`) rejects that same parameter outright, so
   sending it unconditionally was not viable. Nothing in OpenAI's own `/v1/models` response signals this
   incompatibility ahead of time. Fixed, and reinforced by the user's own explicit instruction ("medium
   models are preferred, not the small/cheap ones"): added `isStandardTierModel()` — prefers the bare
   version id (optionally with a dated snapshot suffix, e.g. `gpt-5.5-2026-04-23`) over any
   mini/nano/pro/chat-latest/codex/preview-codename-suffixed variant. This satisfies the user's own
   stated size preference and, as a side effect of the same rule, structurally avoids ever auto-selecting
   an undiscovered-but-similarly-exotic preview variant again, without needing an extra live capability
   probe on every connect.
- [x] `pickDefaultAgentModel`'s mocked regression tests (`tests/helper-agent-phase1.spec.mjs`) rewritten
      to match: standard-tier preferred over a newer mini/nano/pro variant, standard-tier preferred over a
      newer preview-codename variant (the exact real-world shape of bug 2), a dated snapshot of the
      standard tier still counts as standard, and the full reasoning pool remains the fallback when a key
      has no standard-tier candidate at all.
- [x] `tests/helper-agent-phase2.spec.mjs` gained two new mocked tests locking in the `insufficientQuota`
      fix from the prior session (a 429 with `error.code: "insufficient_quota"` now shows a distinct
      message from an ordinary rate limit; an unrecognized `error.code` still falls back to the ordinary
      rate-limit message) — this fix had been implemented and tested before this addendum but is recorded
      here since it was discovered by the same live-key investigation (the first key provided had no
      billing quota at all, which is what led to writing that fix before a funded key was provided).
- Full suite: 363 JS tests (including the 6 live tests, run for real against a funded key) + 13 Python
  tests, green, run twice consecutively.
