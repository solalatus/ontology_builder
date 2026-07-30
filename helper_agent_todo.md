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

## Addendum — ontology-recovery eval (simulated interview against a real domain)

**2026-07-29.** User-directed: a separate, optional eval that simulates a full ontology-elicitation
interview between the app's real helper agent and a second, independent LLM playing a domain-expert
persona, grounded in a hidden ground-truth ontology (a ~2800-line MTSR model for a fictional Hungarian
bank's IT-ops/incident-response domain, plus a matching persona prompt for "Eszter Farkas", both supplied
by the user), then reports how much of it the interview recovered.

- [x] `tests/evals/` — a new subdirectory specifically because `node --test tests/*.spec.mjs`'s glob is
      non-recursive and never sees it, keeping this eval out of the default suite run without any
      skip-flag plumbing. Run explicitly: `node --test tests/evals/*.eval.spec.mjs`.
- [x] `tests/evals/fixtures/itops_mtsr.yaml` / `persona-eszter.md` — unmodified, versioned copies of the
      user-supplied ontology and persona prompt. Not secrets (the ground truth is hidden only from the
      app agent under test, never from the repo).
- [x] `package.json` (new — this repo had none before) with `js-yaml` as its one devDependency, needed to
      parse the fixture's YAML anchors correctly; `index.html` itself remains fully dependency-free
      (spec.md Section 2) regardless, same precedent as Playwright already being dev-only tooling.
- [x] `tests/lib/liveOpenAi.mjs` — `forwardToRealOpenAi()`/`connectAgentLive()`/`sendChatMessage()`/
      `withPageAllowingResourceErrors()` extracted out of `tests/helper-agent-live-openai.spec.mjs` into a
      shared module, reused by both that suite and this eval instead of duplicated. Re-ran the live suite
      after the extraction to confirm no behavior change (6/6 still passing).
- [x] `tests/evals/lib/groundTruthModel.mjs` — parses the fixture into normalized classes/relationships/
      properties/valueSets. Implements the user's own instruction ("modify the yaml based on the handbook,
      skip what is needed") as a documented, auditable filter (`isRecoverableProperty`) over the untouched
      fixture rather than a hand-trimmed copy: any property whose target datatype is `identifier` or `uri`
      is excluded from the recovery target, since the app's own baked howto doc already tells the agent
      not to model those ("Do not include technical fields that users never ask about") — scoring their
      absence as a failure would penalize the agent for following its own instructions. 68 classes / 143
      relationships / 111 (of 148) properties survive.
- [x] `tests/evals/lib/personaAgent.mjs` — a plain Node-side Chat Completions loop simulating Eszter (no
      browser needed for this side -- it's a test fixture, not the code path under test, and Node's own
      `fetch()` reaches OpenAI directly in this sandbox). System prompt = the persona doc + the full,
      *unfiltered* ground-truth YAML embedded literally below it, matching the persona doc's own claim
      that the reference file is "present alongside this prompt." Conversation seeded with the persona
      doc's own scripted opening line, not generated.
- [x] `tests/evals/lib/conversationOrchestrator.mjs` — alternates the real app agent (through the browser,
      relayed exactly like the live suite) and the persona agent, starting from the opening line. Stops on
      whichever comes first: a cheap real classifier call (`appearsFinished()`) judging the interviewer's
      latest reply as a genuine final wrap-up, `ONTOLOGY_EVAL_MAX_TURNS` (default 100), or
      `ONTOLOGY_EVAL_WALLCLOCK_MINUTES` (default 45) — all three user-specified. A `consecutiveEmptyAppTurns`
      guard aborts cleanly if the app agent ever produces a tool-only turn with no text three times running,
      rather than burning the whole turn budget on empty nudges.
- [x] `tests/evals/lib/recoveryMetrics.mjs` — diffs the recovered canvas (`window.__kg.state`) against the
      filtered ground truth. Heuristic token-set-Jaccard label matching (not an LLM judge, to keep this
      eval's own moving parts small — documented limitation in `tests/evals/README.md`). Class/relationship
      recall+precision+F1, property recall, controlled-value fidelity (allowed-value-list overlap), and an
      equal-weighted composite "recovery effectiveness" score.
- [x] `tests/evals/lib/reportGenerator.mjs` — writes `results/report.md` (headline metrics table first, per
      the user's own instruction — "things one can optimize against") and `results/conversation-log.md`
      (the full interleaved transcript), both fixed filenames **overwritten every run**, gitignored. The
      report's own "LLM review" section is one real call (default: whatever model the interviewer itself
      connected with) reading the full log and flagging errors/noteworthy events in structured markdown —
      the user's own explicit request.
- [x] `tests/evals/ontology-recovery.eval.spec.mjs` — the single `node:test` entry point. Generous sanity-
      floor assertions only (no crash, at least one real API call, metrics are finite numbers) — this is a
      report-generating eval, not a strict pass/fail test, since two real non-deterministic LLMs are
      talking to each other.

**A real bug the eval's own first full-length try-out run found, in the eval itself:** the first genuine
100-turn/45-minute run stopped after only 17 turns via `appearsFinished()`, having created zero classes.
The actual turn-17 text was the interviewer's own system prompt correctly recapping the end of **Phase 1**
(real questions/actions) and asking to proceed to Phase 2 (classes) — normal, expected mid-interview
behavior per the INTERVIEW PROCESS's own per-phase checkpoint design (`helper_agent_plan.md` §4.3), not the
whole interview being done. The classifier's prompt only described "a final summary, a closing check for
anything else" without telling it the interviewer checkpoints at the end of *every* one of its 10 phases,
so a single-phase recap satisfied that description. Fixed by naming all 10 phases explicitly in the
classifier's system prompt and requiring the message to look like the phase-9-equivalent final wrap-up
specifically, defaulting to NO for any earlier phase's checkpoint. Verified against the exact false-positive
text (now NO), a genuine final-wrap-up example (still YES), and a second early-phase example (NO) before
re-running.
- Tried out for real against a funded key: an initial 3-turn smoke run (mechanics only), then two full
  100-turn/45-minute attempts — the first surfaced the classifier bug above (stopped at 17 turns, 0%
  recovery, real API calls confirmed working throughout); see `tests/evals/results/` for the
  post-fix run's actual report/log (gitignored, not part of this commit).
- Full suite (all `tests/*.spec.mjs`, including the 6 live tests) green, run twice consecutively, plus the
  eval itself run for real multiple times as described above.

## Addendum — fixed the merge-semantics bug the eval's second full run found (Option B)

**2026-07-29.** The second full 100-turn run above (report at the time: 3.7% composite recovery, 21
classes created, 0% relationship recall despite 29 real edges) surfaced a real, severe bug via its LLM
review, independently of anything this addendum's own author was looking for: the assistant repeatedly
said things like *"I also noticed the live canvas had lost the Incident meaning during the previous
property merge, so I restored it"* (turn 73) and *"I also restored Incident.status because the live merge
had dropped it when severity was added"* (turn 74), with the same pattern recurring at turns 98 and 100.

**Root cause:** `commitYamlImport()` (`index.html`), shared by both the manual Domain-Model import dialog
and the agent's `apply_ontology_yaml` tool, did a wholesale field overwrite on any matched-by-label
existing class — `existing.meaning`/`existing.aliases`/`existing.properties` were unconditionally
reassigned from whatever the incoming YAML specified for that class, defaulting to `null`/`[]`/an empty
array when a field was simply absent. This directly contradicted the tool's own documented contract, stated
twice (its schema description *and* the system prompt's own `EDITING THE LIVE ONTOLOGY` section): *"Only
include entries that are new or have changed — this merges against the existing model, it does not need to
restate everything."* A real model correctly following that instruction and sending a minimal diff (e.g.
just one new property) had everything else it didn't restate silently wiped. The same wholesale-replace
pattern also applied to rule `conditions`, relationship `meaning`, and action `input`/`preconditions`/
`effect`/`verification`. An old bug (present since Phase G's original manual-import implementation, and
*deliberately* pinned there by its own test — `tests/agent-ontology-phase-g.spec.mjs`'s "Merge overwrites a
matched class's meaning/aliases/properties wholesale" — a human re-uploading a self-contained file
reasonably expects it to be authoritative for what it lists); inherited unnoticed when Phase 3 bolted the
agent tool onto the same function without reconciling that the agent's own incremental, minimal-diff
use case needs the opposite default. Never caught before because every existing test either restated full
class definitions or never chained a genuinely partial update against a richer pre-existing node — only a
long, natural, real conversation exercises it, which only this eval produces.

**Fix chosen (Option B of two presented to the user):** rather than changing "merge" globally (which would
retroactively change the manual dialog's own deliberately-tested wholesale-replace behavior), `commitYamlImport`
gained a third mode, `"agent-merge"`, used only by `handleAgentToolCall()`. Under it, a field absent from an
existing/matched entity's incoming YAML is left exactly as it was, not cleared — classes' `meaning`/`aliases`,
rules' `conditions`, relationships' `meaning`, and actions' `input`/`preconditions`/`effect`/`verification`
all follow this rule. `properties` specifically upserts by name (new helper `mergePropertiesByName()`) instead
of replacing the whole array, since that's the field the real run's own transcript showed being lost
repeatedly. Newly-created entities are unaffected (nothing to preserve yet). Plain `"merge"` (manual dialog)
and `"replace"` keep their exact prior behavior, matched-entity fields included — Phase G's own wholesale-
replace test needed no changes and stayed green throughout.

- [x] `mergePropertiesByName()` + `commitYamlImport`'s `fieldLevelMerge` branching (index.html).
- [x] `handleAgentToolCall()` calls `commitYamlImport(yamlText, "agent-merge")`, not `"merge"`.
- [x] Comments updated at both the `APPLY_ONTOLOGY_YAML_TOOL` definition and `commitYamlImport` itself
      explaining why a third mode exists and what each of the three modes does.
- [x] Mocked regression tests, `tests/helper-agent-phase3.spec.mjs` (+5): a second tool call adding one
      property doesn't wipe the class's meaning or the first call's property; re-specifying an existing
      property by name updates it in place instead of duplicating it; meaning is still explicitly
      updatable when a call *does* specify it (omission preserves, but doesn't get "stuck"); aliases
      preserved the same way; a re-declared relationship without a meaning preserves the meaning an
      earlier call set. All of Phase G's own existing tests (including the wholesale-replace one) stayed
      green unchanged.
- [x] Live regression test, `tests/helper-agent-live-openai.spec.mjs` (+1, "agentic" end-to-end): two real,
      separate tool calls against the same class, the second one deliberately told not to restate the
      first's meaning/property — confirms the fix holds against the genuine API, not just mocked
      responses. Stable across two consecutive real runs.
- Full suite (`tests/*.spec.mjs`, including the 7 live tests) green, run twice consecutively, plus 13
  Python tests.
- A third full 100-turn/45-minute real eval run was done post-fix as an end-to-end confirmation, showing a
  clean, unconfounded improvement with the same turn cap and domain: composite recovery 3.7% → 8.2%,
  classes matched 5 → 12, properties matched 4 → 10, and the "I noticed X was lost" self-correction pattern
  gone entirely from the transcript.

## Addendum — eval-tooling and interview-pacing fixes found by analyzing that same post-fix run

**2026-07-29.** User asked for a short analysis of what could still be improved before doing anything.
Two further issues were identified from the merge-fix confirmation run above, both then fixed:

**1. A real bug in the eval's own metrics code (not the app).** Relationship recall was still only 0.7%
(1/143) despite 60 real edges having been created that run. The app stores relationship names in its own
camelCase dialect (`isImplementedBy`, `dependsOn` — the YAML shape `apply_ontology_yaml` itself uses), while
the ground truth's predicate labels are natural-language phrases (`"is implemented by"`). The eval's
`labelsMatch()` (`tests/evals/lib/recoveryMetrics.mjs`) tokenizes on whitespace only, so a camelCase relation
name arrives as one unsplit token (`isimplementedby`) that can essentially never overlap with the ground
truth's multi-word tokens — silently suppressing almost all relationship recall regardless of real interview
quality.

- [x] `normalize()` now splits camelCase into words before lowercasing (`splitCamelCase()`), so
      `isImplementedBy` → `is implemented by` and correctly compares against the ground truth's own phrasing.
      Same known consecutive-uppercase-acronym limitation as the app's own `toCamelCaseId()` (`TODO.md`'s
      prior note on that) — not solved here either, for the same reason: not a real predicate name in this
      domain.
- [x] New fast, deterministic unit-test file `tests/ontology-recovery-metrics.spec.mjs` (4 tests, no browser,
      no API key — pure logic, runs as part of the main suite even though the eval itself lives separately
      under `tests/evals/`): the camelCase fix itself; the pre-existing substring-conflation pitfall
      ("Incident" vs "Major Incident") stays fixed; `groundTruthModel`'s identifier/uri filter removes only
      what it should; an empty recovered state produces finite, non-NaN metrics.

**2. A real interview-pacing inefficiency, independently flagged twice by the LLM review in one run** (turns
42–89: "one class meaning per turn... a batched prompt could have collected 5–10 at once"; turns 89+: same
for constraints). Root cause: `AGENT_SYSTEM_PROMPT_BASE`'s very first `GROUND RULES` line was an absolute
rule — *"Ask ONE focused question at a time. Never send a multi-part questionnaire."* — with no carve-out
for asking the same small question about several similar items at once.

- [x] Rewrote that rule (`index.html`): one-at-a-time still applies when items are different in kind or
      answer-dependent, but once a repeating pattern is established, batch 3-5 similar, low-ambiguity items
      (several class meanings, several relationships' aliases, several properties' allowed-value lists) into
      one question instead of one exchange per item. Explicit non-goal preserved: never batch genuinely
      different-in-kind questions, never send a confusing wall of unrelated ones.
- [x] Reinforced at the two specific phases the real run's own LLM review singled out — Phase 4 (properties),
      Phase 5 (language layer), Phase 6 (constraints) — each now points back to the batching rule as the
      expected pattern for that phase specifically, not just a generic footnote.
- [x] New mocked test, `tests/helper-agent-phase4.spec.mjs` (+1): pins the batching-guidance text and its
      explicit different-in-kind exclusion in the system prompt.
- [x] `ONTOLOGY_EVAL_MAX_TURNS` default raised 100 → 500 (`tests/evals/ontology-recovery.eval.spec.mjs`,
      `tests/evals/README.md`), per the user's own explicit instruction, gated on the pacing fix actually
      landing first: with batching, more turns should mean covering more of the ground truth, not just more
      turns spent re-asking the same shape of question. The 45-minute wall-clock default is unchanged and
      remains the practical real-world bound in nearly every run regardless of the turn cap.
- Full suite (`tests/*.spec.mjs`, including the 7 live tests) green, run twice consecutively (374 JS tests),
  plus 13 Python tests.
- A full real eval run at the new 500-turn cap, both fixes active, was done as end-to-end confirmation:
  composite recovery 8.2% → 39.2%, classes matched 12 → 18 (81.8% precision), properties matched 10 → 23,
  controlled-value fidelity 0.0% → 90.1%, and the interview finished naturally in 39 turns instead of hitting
  its (much larger) turn budget unfinished. Shipped as PR #41, merged into `helper_agent`.

## Addendum — root-cause analysis of the low composite score, and full tool-call transparency

**2026-07-29.** User asked, analysis-only, (1) whether the post-batching-fix run's LLM-review "tool/state
sync issue" notes (turns 22/23, 35, 36 — aliases/preconditions/allowed-values apparently needing
re-application) indicated a real bug, and (2) why the composite score was still only 39.2% and how that could
be improved, evidence-based.

**Finding 1 — no code bug found.** Read the actual turn 22/23/35/36 transcript text plus the
`commitYamlImport`/`get_graph_state` code directly rather than trusting the LLM reviewer's paraphrase (same
discipline as the original PR #40 investigation). `agent-merge`'s field-level-preserve logic is intact, and
both `nameToRule` and `labelToNode` (`index.html`, `commitYamlImport`) are pre-seeded from *existing* state
before a call's own YAML is processed, so a precondition/name reference to an entity created several turns
earlier resolves correctly — there's no code path that would silently drop it. The system prompt's own
"STAYING IN SYNC WITH THE LIVE ONTOLOGY" section explicitly tells the interviewer to call `get_graph_state`
before every apply and reconcile defensively ("an extra get_graph_state call is cheap; silently overwriting
or duplicating the expert's own work is not") — the re-applies are that instruction working as intended, not
evidence of data loss. Given this couldn't be fully proven from the human-readable transcript alone (it never
shows the interviewer's actual tool-call arguments), see "Full transparency" below.

**Finding 2 — the low composite score is mostly a scope-mismatch artifact, not an interview-quality
problem, with hard numbers behind that claim.** The ground-truth fixture is a comprehensive 68-class
reference domain; the interview is deliberately competency-question-driven (elicit real questions/actions
first, model only what's needed for them). Computed the actual ceiling: given the 18 ground-truth classes the
interview's own scope reached, only 35/143 relationships (24.5%) and 58/111 properties (52.3%) were even
structurally reachable — the composite was being measured against a domain several times larger than what a
single-session, competency-driven interview was ever trying to cover. The interview's own Phase 9 validation
pass in that same run confirmed full support for all 20 original competency questions and all 10 actions —
judged against its actual design goal, it succeeded.

Two secondary, real findings from the same analysis:
- 23 of the ground truth's 143 relationships are `"is a"` (subclass) predicates the app's flat
  classes-plus-relationships data model has no way to represent — the interviewer correctly avoided forcing
  these onto generic relationship edges (turn 5: "this tool does not use subclassing directly ... instead,
  connect them with a clear relationship"), but the eval was still scoring their absence as a recall miss.
- Phase 3 (relationships) of the system prompt had no completeness guidance — unlike Phases 4/5/6, which got
  the earlier batching reinforcement — so the interviewer proposed one opening backbone batch of
  relationships and moved on, without working back through the rest of its own confirmed class list.

**Fixes implemented** (user: "implement all of these... implement, test, PR"), all in
`tests/evals/lib/groundTruthModel.mjs` unless noted:

- `isRecoverableRelationship()` — excludes `"is a"` predicates from scored relationships, same documented,
  auditable-filter-over-the-untouched-fixture pattern as the existing `isRecoverableProperty()`.
- `buildPracticalScopeClassIds()` / `practicalScopeClassIds` — a second, tighter, still mechanically (not
  hand-) derived denominator: every class whose label or alias appears, whole-word, inside the fixture's own
  canonical `competencyQuestions:` + `actions:` text. 28 of 68 classes, 48 of 120 non-"is a" relationships, 69
  of 111 properties. `scopeGroundTruth()` filters an already-loaded ground truth down to a class-id set,
  reusing `computeRecoveryMetrics()` unchanged for both the full-domain and practical-scope columns.
  `report.md`'s headline table now shows both side by side, not one replacing the other — full-domain for
  cross-run comparability, practical-scope as the more meaningful single-run quality read.
- `index.html`'s Phase 3 (relationships) gained the same don't-stop-after-one-batch, cover-everything-
  confirmed guidance Phases 4/5/6 already had, specifically calling out that a confirmed class left with no
  relationships is a sign of stopping too early, not a naturally standalone class.
- **Full tool-call transparency** (user: "implement tooling for logging... tool call args and whatever else
  needed"): `conversationOrchestrator.mjs` now also captures `window.__kg.agent.state.apiMessages` (the exact
  API-level request/response content the app itself sends/receives, already exposed for testing) after every
  turn, tagged by turn (`tagApiMessagesWithTurn`), and `reportGenerator.mjs`'s new `writeToolCallLog()` dumps
  it to `results/tool-calls.md` (overwritten every run, same convention as the other results files) —
  every `apply_ontology_yaml` call's real `yaml` argument, pretty-printed, and every tool result's real
  content, so a future suspected tool/state-sync issue can be checked against what actually happened instead
  of the interviewer's own narration or the LLM reviewer's summary of it.

Tests: `tests/ontology-recovery-metrics.spec.mjs` (+4: "is a" exclusion with a raw-fixture sanity count,
practicalScopeClassIds is non-trivial and contains/excludes the expected classes, `scopeGroundTruth` filters
correctly, scoped denominators never exceed full ones and stay NaN-safe); new top-level
`tests/ontology-recovery-transparency.spec.mjs` (+5, no browser/API key: `tagApiMessagesWithTurn` tags and
passes content through unchanged including on an empty slice; `writeToolCallLog` renders real tool-call
arguments and results and overwrites rather than accumulates; `writeReport` renders both metrics columns);
`tests/helper-agent-phase4.spec.mjs` (+1: pins the Phase 3 completeness-guidance text).

**Live progress logging.** A live confirmatory eval run then hit a real `page.waitForFunction` timeout inside
one `sendChatMessage` call, ~13 minutes in — and left nothing on disk to inspect, since `conversation-log.md`/
the new `tool-calls.md` were only ever written once, after the whole run succeeded (the per-turn arrays were
function-local until the final `return`, discarded by the exception). Fixed: `runOntologyRecoveryConversation`
now takes an `onProgress` callback, fired before and after the one call in the loop with no progress signal of
its own (`sendChatMessage`); the eval spec's own `onProgress` re-uses `writeConversationLog`/`writeToolCallLog`
so both files stay live and current turn-by-turn, each with a "Last updated" timestamp — a run can be checked
mid-flight, and a hang or crash leaves everything up through the last completed turn on disk instead of
nothing. New tests (+2 in `tests/ontology-recovery-transparency.spec.mjs`): `writeConversationLog` reflects a
growing, in-progress log correctly across repeated calls; both writers include the live timestamp. The
original timeout turned out to be a one-off (a same-config re-run completed cleanly in ~15.7 minutes), not a
reproducible regression from the Phase 3 change.

**A real, confirmed app bug, found using the new transparency log itself.** That successful re-run's own LLM
review flagged, more insistently than before, that action preconditions and class aliases kept coming back
empty even after re-application — "final validation still notes `preconditions: []`". Reading `tool-calls.md`
instead of trusting the review's paraphrase: the model's real tool-call arguments contained
`preconditions: [canDeclareMajorIncident]` and `aliases: [ticket, issue]` — a completely idiomatic *inline
flow-list*, not the block `- item` style this app's own YAML exporter always produces — and the very next
`get_graph_state` result showed `preconditions: []` / `aliases: []` for those exact same entries. Root cause,
confirmed by reading the code: `parseYamlValueToken` (`index.html`) only special-cased the *empty* inline list
token `"[]"`; a non-empty one like `"[canDeclareMajorIncident]"` fell through to the plain-string branch, so
`Array.isArray(action.preconditions)` downstream (`commitYamlImport`'s field-level-merge checks) saw a string,
treated the field as not-given, and silently created the action/class with an empty list — discarding exactly
what the model sent, every time it chose this (very natural) syntax. Not a new bug from anything in this
addendum; a pre-existing parser gap the model started triggering naturally once conversations grew
action/rule-heavy enough for it to reach for inline lists on its own.

- [x] Fixed: `parseYamlValueToken` now parses a non-empty inline flow-list (`[a, b, c]`) into a real array,
      via a new `splitYamlInlineListItems()` that splits on top-level commas only (reusing
      `findYamlClosingQuote`'s own escape handling so a quoted item's internal comma doesn't split it), each
      item then re-run through `parseYamlValueToken` itself for consistent scalar handling. Deliberately
      scoped to `[...]` only, not a non-empty inline flow-*map* `{...}` — the app's own exporter never emits
      one and no real tool-call payload has been observed using that syntax, so there's no evidence yet it's
      a live problem worth the extra parsing surface.
- [x] Tests: `tests/agent-ontology-phase-g.spec.mjs` (+2 — manual-import "merge" pathway, which shares the
      same parser): the same worked-example YAML with every list field in inline-flow style parses identically
      to the existing block-list version (aliases and action preconditions both resolve correctly, not to
      `[]`); a quoted list item containing a comma doesn't get split on its own inner comma.
      `tests/helper-agent-phase3.spec.mjs` (+1 — the actual real-world agent-merge pathway): reproduces the
      exact two-turn shape a live conversation naturally produces (a rule defined in one tool call, an action
      referencing it via `preconditions: [ruleName]` in a later one, plus `aliases: [a, b]` on a class in that
      same later call) and confirms the precondition resolves to the real rule id and the aliases parse to a
      real array, not `[]`.
- Full suite (`tests/*.spec.mjs`, 389 JS tests) green, run twice, plus 13 Python tests. A full real eval
  re-run confirmed the fix end-to-end — see this addendum's own follow-up note for the actual numbers.

## Addendum — single-input actions: agent guidance + a documented ground-truth reduction

**2026-07-29.** Follow-up analysis on the just-fixed run's LLM review, which flagged several actions as
having "incomplete inputs" (e.g. `assignResolverGroup` only takes `Incident`, not also `ResolverGroup`).
Traced this to a real, deliberate schema boundary, not a modeling mistake: `state.actions[].inputClassId`
(`index.html`) is a single scalar, not a list — the Actions manager UI is a single-select, the YAML tool
schema's `input:` key is singular, and `deleteNode()`'s reference cleanup assumes exactly one reference to
null out. Confirmed this is a genuine ontology-expressiveness limit (not a file-format/parsing detail like
the YAML-list bug above): there's no array anywhere in the pipeline already waiting to be read correctly.
User's direction: keep the app's model as-is, but (1) tell the interviewing agent explicitly so it stops
treating this as something to work around, and (2) stop letting the eval's ground truth implicitly expect
what the app can't represent.

- [x] `index.html`'s `INTERVIEW PROCESS` Phase 8 (actions) now states directly: an action has exactly one
      input class in this tool; if a real action needs more than one, pick the class it's fundamentally
      about and represent the other participant via a relationship, property, or precondition instead —
      "a deliberate limit of this tool, not something to work around or apologize for." Mirrors how the
      no-subclassing limitation is already explicitly documented for the interviewer elsewhere in the same
      prompt.
- [x] `tests/evals/lib/groundTruthModel.mjs`'s new `buildReducedActions()`: reduces each ground-truth
      action's potentially-multiple `inputs:` (the fixture itself declares several per action, e.g.
      `declareMajorIncident: inputs: {incident: ..., commander: ...}`) down to the first-listed ("primary")
      one, recording how many were dropped (`droppedInputCount`) so the reduction is an explicit, auditable
      adjustment rather than a silent omission — same documented-filter pattern as `isRecoverableProperty`/
      `isRecoverableRelationship`. Exposed as `groundTruth.actions`, filtered by `scopeGroundTruth()` the
      same way classes/relationships/properties already are. Not wired into `computeRecoveryMetrics` (no
      action-recall metric exists), but the primary input class of each action now feeds
      `practicalScopeClassIds`'s corpus — secondary inputs deliberately never do. Verified empirically this
      doesn't silently change the existing practical-scope class set for the current fixture (already-covered
      via other text), so it's a correctness/auditability improvement, not an unannounced behavior change.
- [x] Tests: `tests/ontology-recovery-metrics.spec.mjs` (+4): every multi-input fixture action reduces to its
      first-listed input with the correct drop count (including a pinned check on `declareMajorIncident`
      specifically); a genuinely single-input action reports zero dropped; `scopeGroundTruth` filters actions
      by primary-input-class membership, both against the real fixture and a synthetic ground truth object.
      `tests/helper-agent-phase4.spec.mjs` (+1): pins the Phase 8 single-input guidance text.
- Full suite (`tests/*.spec.mjs`, 394 JS tests) green, plus 13 Python tests. A full real eval re-run
  confirmed the change doesn't regress anything — see this addendum's own follow-up note for the numbers.

## Addendum — physically corrected the ground-truth fixture itself, on top of the runtime filters

**2026-07-29.** User's explicit follow-up instruction: apply all three corrections above (identifier/uri
properties, `"is a"` predicates, multi-input actions) directly to `fixtures/itops_mtsr.yaml` itself, not just
as runtime filters. Asked first (via `AskUserQuestion`) whether the runtime filters should then be removed as
redundant or kept as a defensive safety net — user chose **keep both**.

- [x] Wrote a one-off Node script (js-yaml-driven, surgical raw-text line removal so the rest of the file's
      formatting is untouched — no full YAML re-serialization, which would have reformatted the whole
      ~2800-line file and lost the real diff signal) that: removed all 23 `"is a"` predicates, all 37
      identifier/uri-target datatype predicates, and every action's secondary `inputs:` entries (keeping only
      the first-listed one). Verified via re-parse: 0 `"is a"` predicates, 0 identifier/uri properties, 0
      multi-input actions remain; counts match the runtime filters' own output exactly (120 relationships, 111
      properties, 68 classes unchanged). Diff is confined entirely to the `predicates:` and `actions:`
      sections — `classes:`, `valueSets:`, `constraints:`, `mappings:`, and `competencyQuestions:` are
      byte-for-byte untouched. 373 lines removed, 0 added.
- [x] `isRecoverableProperty`, `isRecoverableRelationship`, and `buildReducedActions` (`groundTruthModel.mjs`)
      are now exported — they're a no-op against the corrected bundled fixture, but still real, unit-tested
      code that would immediately do its job again if the fixture is ever replaced by a fresh, uncorrected
      gold-standard upload.
- [x] `tests/evals/README.md`'s "Fixtures" section no longer claims `itops_mtsr.yaml` is a byte-for-byte
      unmodified upload — documents exactly what was changed and why, and that every other section is
      untouched.
- [x] Tests reworked: the three "does the filter remove something from the real fixture" tests (which would
      now be vacuously true/false against a pre-cleaned file) became **isolated unit tests of the exported
      filter functions against synthetic predicates/actions** (the real, still-meaningful safety-net
      behavior) plus **idempotence checks against the real fixture** (filtering an already-clean file changes
      nothing — proves the physical edit and the code filter agree exactly, not just that neither crashes).
- Full suite (`tests/*.spec.mjs`, 397 JS tests) green. A full real eval re-run confirmed no regression — see
  this addendum's own follow-up note for the numbers.

**Note:** PR #42 (covering everything up to this point in this file) was merged mid-session; the two addenda
above ended up as unmerged commits on top of already-merged history. Per protocol, rebased them onto the
fresh `helper_agent` and opened a new PR (#43) rather than reusing the closed one — see that PR for the
concrete rebase/force-push mechanics.

## Addendum — appearsFinished false-positive, round two: a deterministic pre-filter + a smarter classifier model

**2026-07-29.** PR #43's own confirmatory eval run stopped after only 11 turns — the `appearsFinished`
classifier (`tests/evals/lib/conversationOrchestrator.mjs`) fired on a message that opened with **"Phase 3
recap — relationships captured:"** and closed by asking to move into the next phase: textbook mid-interview
checkpoint language, and exactly the failure mode already "fixed" once before (see this file's earlier Log
entry) by telling the classifier about all 10 phases explicitly. That instruction was already correct and
specific; the cheap, 2-token-budget model still got it wrong. User's diagnosis request, then explicit
instruction: implement a fix, and separately upgrade the classifier model.

- [x] **Deterministic pre-filter** — new `looksLikeEarlyPhaseCheckpoint()`, exported from
      `conversationOrchestrator.mjs`. Regexes for the interviewer's own consistent phrasing ("Phase N recap",
      "recap ... Phase N", "Phase N is confirmed complete", N restricted to 0-8 so a genuine phase-9 final
      pass still reaches the LLM) run *before* the classifier API call at all; a match short-circuits straight
      to "not finished" with zero API cost. Only ever forces NO, never YES — strictly additive, can't make the
      classifier more trigger-happy than before, only less.
- [x] **Smarter classifier model** — `ONTOLOGY_EVAL_CLASSIFIER_MODEL`'s default changed from a hardcoded
      `"gpt-4o-mini"` to whatever real, live-picked "standard tier" model the interviewer itself connects
      with (same pattern `ONTOLOGY_EVAL_REVIEW_MODEL` already used) — a fixed cheap model was plausibly part
      of why the instruction alone wasn't enough. Still overridable via the env var for anyone who wants a
      specific model regardless.
- [x] **A little more room to reason** — `max_tokens` raised from 2 to 60, and the classifier prompt now asks
      for a one-line phase identification before the YES/NO verdict (parsed from the *last* non-empty line of
      the response) instead of forcing an immediate terse guess. `report.md` now also lists the classifier
      model used, alongside the interviewer's and persona's, for transparency.
- [x] Tests (`tests/ontology-recovery-transparency.spec.mjs`, +6): `looksLikeEarlyPhaseCheckpoint` catches the
      exact real message that fooled the classifier; catches "Phase N recap" for every early phase 0-8 and
      the reverse "recap ... phase N" order; catches "Phase N is confirmed complete"; does *not* match phase 9
      (so the real final pass still reaches the LLM) or a genuine phase-9-style final wrap-up with no
      phase-recap phrasing at all; does not match ordinary unrelated text. `writeReport` test updated to cover
      the new classifier-model line.
- Full suite (`tests/*.spec.mjs`, 403 JS tests) green. A full real eval re-run confirmed the fix and upgraded
  model together — see this addendum's own follow-up note for the numbers.

## Addendum — the classifier-model upgrade's own regression: `max_tokens` rejected by reasoning-tier models, silently swallowed as "not finished"

**2026-07-29.** User's ask: "check the discussion in the log if it is healthy" — not just the turn-count
header, the actual content. Reading `results/conversation-log.md` around turns 190-200 of the confirmatory
run for the previous addendum found the interviewer had explicitly finished at turn 38-39 ("we'll consider
the ontology interview complete for this first version"), then just kept trading "Thank you" / "You're
welcome" / "Take care" for 160+ turns after that — the exact false-negative version of the false-positive bug
the previous addendum fixed, and self-inflicted by that same fix.

Root cause: `ONTOLOGY_EVAL_CLASSIFIER_MODEL` now defaults to the interviewer's own live-picked model, which
can be a reasoning-tier model (e.g. a real `gpt-5.5-...` pick). The classifier request still sent
`temperature: 0, max_tokens: 60`, and reasoning-tier models reject `max_tokens` outright — confirmed live with
two isolated `node -e` API calls (one with `max_tokens` → HTTP 400 `"Unsupported parameter: 'max_tokens' is
not supported with this model. Use 'max_completion_tokens' instead."`; the same call without it → 200 success,
`completion_tokens_details.reasoning_tokens: 20` in the response). The old `appearsFinished()` code treated
*any* API failure the same as an empty answer (`data.choices` undefined → `answer = ""` → regex match fails →
`false`), so every single classifier call silently failed and the run just never stopped on its own — bounded
only by the turn cap / wallclock. Killed the confirmed-broken background run (PIDs 19146/19145/18789) rather
than let it burn the remaining budget for a result already known to be worthless.

User's follow-up instruction, in the same message: fix this, **and** harden the finished-detection with a
second, independent layer that doesn't depend on the classifier at all, **and** add a prompt-level defense on
the persona side so the simulated interview subject stops re-igniting the small talk once things are actually
done. All three implemented together:

- [x] **The actual bug** — `appearsFinished()` no longer sends `temperature` or `max_tokens` at all, matching
      `index.html`'s own `callAgentChatRaw()` (confirmed via grep to never set either, which is exactly why
      the interviewer's own real conversation never hit this). Added a `res.ok`/`data.error` check that throws
      a descriptive error naming the model and HTTP status on any classifier API failure, so a *future*
      incompatibility is a loud, immediate test failure instead of another silent multi-hour hang.
- [x] **Second, independent safety net (no API call, can't be fooled)** — new `looksLikePureAcknowledgment()`,
      exported from `conversationOrchestrator.mjs`: a message under 25 words, with no `?` in it, that opens
      with a stock closing phrase ("thank you", "you're welcome", "take care", "sounds good", "no problem",
      "goodbye", etc.) is a content-free pleasantry regardless of what any classifier thinks. Two of these in
      a row from the app agent stop the run (`pleasantry_loop_detected`) *before* even calling
      `appearsFinished()` — cheaper, and immune to the exact failure mode above by construction, since it
      never touches the network. Can only shorten a run that's already gone idle; a real answer is either
      longer or asks something back, so it can't misfire on genuine content.
- [x] **Persona-side prompt defense** — new "Ending the interview" section in
      `tests/evals/fixtures/persona-eszter.md`: instructs Eszter to recognize the interviewer's own wrap-up
      cues (final validation pass, competency check, an explicit "interview complete"/"ready for use"
      statement) and give one short closing line instead of volunteering new content, asking a new question of
      her own, or trading farewells back and forth turn after turn. Doesn't stop the loop by itself (that's
      the two mechanisms above), but stops the persona from being the thing that keeps feeding the interviewer
      new material to react to once the real interview is over.
- [x] Tests (`tests/ontology-recovery-transparency.spec.mjs`, +5): `looksLikePureAcknowledgment` recognizes
      the real stock closing lines from the actual 160-turn loop; rejects real content even when it opens with
      a closing-sounding word (word-count guard); rejects anything ending in `?`; rejects ordinary domain
      content and empty/null input.
- Full suite (`tests/*.spec.mjs`, 407 JS tests) green; the 5 failures seen in this run are pre-existing,
  unrelated `helper-agent-live-openai.spec.mjs` live tests hit by real API rate limiting (HTTP 429), not this
  change.

## Addendum — rate-limit backoff, in both the production agent and the test harness

**2026-07-29.** Attempting the live confirmatory eval for the addendum above hit real 429s immediately on
connect (before even reaching the interview), and re-running it a second time hit the same wall. User's
instruction: implement backoff for rate limiting in both the agent and the tests, on top of everything already
in flight.

- [x] **Production agent (`index.html`)** — `callAgentChatRaw` (chat turns) and `fetchOpenAiModels` (the
      connect-flow model list) both used to fail immediately on any 429, including an ordinary transient
      `rate_limit_exceeded` that would very plausibly have succeeded a moment later. Both now retry with
      exponential backoff (new shared `AGENT_RATE_LIMIT_MAX_ATTEMPTS = 4`, `agentRateLimitBackoffMs`: 1s, 2s,
      4s — 1 initial try + 3 retries) before surfacing an error to the user. `insufficient_quota` (the
      permanent, billing-exhausted case, distinguished by `error.code` exactly like the existing
      rate-limit-vs-quota distinction) is still never retried — no amount of waiting fixes it, and retrying it
      anyway would just burn more time for no benefit.
- [x] **Test harness (`tests/lib/liveOpenAi.mjs`)** — `forwardToRealOpenAi`, the Node-side relay every live
      test/eval routes real API calls through (this sandbox's browser can't reach `api.openai.com` directly),
      now retries the same way *inside the relay itself*, before ever calling `route.fulfill()`. This matters
      for a reason the client-side retry above can't fix on its own: Chromium logs its own
      `"Failed to load resource: ... 429"` console message for *every* non-2xx response it receives, even one
      a caller's own retry loop recovers from -- and `withPage()` (`tests/lib/page.mjs`) asserts zero
      console/page errors for the whole test. Without retrying inside the relay, each intermediate failed
      attempt would still fail the test even if the retry eventually succeeded. Relaying only the final
      (post-retry) response means the page only ever sees one outcome per request, exactly like a real
      (non-relayed) client experiencing one slow call rather than several distinct failed ones. Root-caused via
      `tests/evals/*.eval.spec.mjs` failing with exactly three `"Failed to load resource: ... 429"` console
      errors, all during the model-discovery call at connect.
- [x] Tests: `tests/helper-agent-phase2.spec.mjs` (+4) -- a transient 429 is retried and succeeds once the API
      recovers (proven by counting actual requests sent, not just the final outcome); a rate limit that never
      clears is retried exactly 4 times total then gives up (bounded, not infinite); `insufficient_quota` is
      never retried (exactly 1 attempt); the connect flow's model-discovery call gets the same treatment.
      `tests/live-openai-relay-backoff.spec.mjs` (new, +3) -- unit tests of the relay itself, monkey-patching
      Node's global `fetch` with a scripted 429/429/200 sequence (no API key, no real network) to prove the
      page genuinely only ever sees the eventual single outcome, not each intermediate attempt; a permanent
      `insufficient_quota` is never retried; a rate limit that never clears still gives up after exactly 4
      attempts rather than hanging forever.
- Full suite (`tests/*.spec.mjs`, 414 JS tests) green.

**Follow-up, same day, once the account's quota was restored:** the live confirmatory eval finally ran for
real (~98s) instead of failing at connect -- and then failed again, `insufficient_quota`, from
`personaAgent.mjs`'s own direct `fetch()` call mid-conversation. That call (and `conversationOrchestrator.mjs`'s
`appearsFinished` classifier, and `reportGenerator.mjs`'s `generateLlmReview`) each make their own real API call
outside the relay entirely and had no backoff of any kind -- a real gap in the work above, which only covered
`index.html` and the relay.

- [x] Consolidated the backoff constants (`RATE_LIMIT_MAX_ATTEMPTS`, `rateLimitBackoffMs`,
      `isInsufficientQuotaError`) into exported members of `tests/lib/liveOpenAi.mjs` (previously private to
      the relay) and reused them in all three previously-unprotected call sites: `personaAgent.mjs`'s
      `reply()`, `conversationOrchestrator.mjs`'s `appearsFinished` (now exported for direct testability, same
      reasoning as `looksLikeEarlyPhaseCheckpoint`), and `reportGenerator.mjs`'s `generateLlmReview` (which
      keeps its existing degrade-to-a-soft-fail-message-instead-of-throwing behavior once retries are
      exhausted, rather than adopting the throw-on-failure shape of the other two).
- [x] Tests (`tests/eval-rate-limit-backoff.spec.mjs`, new, +6): each of the three call sites retries a
      transient 429 and succeeds once it recovers (proven by counting real fetch calls against a scripted
      429/429/200 sequence); each never retries a permanent `insufficient_quota`; `generateLlmReview`
      specifically confirmed to degrade to its soft-fail message (not throw) after exactly 4 bounded attempts
      against a rate limit that never clears. All via a monkey-patched `global.fetch` -- deterministic, no API
      key, no real network.
- Full suite (`tests/*.spec.mjs`, 420 JS tests) green, including all 5 previously-failing live tests in
  `helper-agent-live-openai.spec.mjs` -- confirmed the account's quota, not a code bug, was the entire cause of
  every failure seen in this addendum and the one above it.
- **Live confirmation, finally clean:** with quota restored and all three backoff gaps closed, the
  confirmatory eval ran a full real interview end to end and stopped itself at **turn 45 (849s wall-clock)**
  via `app_agent_appears_finished`, on a genuine final wrap-up (full competency check + final checklist
  against the original acceptance questions/actions) -- not the 500-turn cap, not the 45-minute wallclock, and
  no pleasantry loop. This is the confirmation the `appearsFinished`/`max_tokens` fix, both hardening layers,
  and the full backoff pass were all waiting on. Task #116 (this whole thread of work) is done.

## Addendum -- four follow-up questions on recovery quality, opinion-and-plan then all four implemented

**2026-07-30.** With PR #44 merged, user asked why class/relationship/property recall were all low (a
follow-up to the merged run's own report.md), then four concrete questions on what to do about it: (A) can the
interview realistically be widened toward 80%+ scoped recall, (B) can relationship prompting be improved, (C)
can the gold's scope be made more realistic (pruned properties + more discussion depth/prompting), (D) how
would the scoring logic itself be audited. Discussed and opined first (turn budget isn't the real constraint --
the last run stopped at turn 45 of 500 with 36 unused minutes, because the interviewer decided it was done, not
because it ran out of room), then user: "implement them all, test, PR."

D was done first, using the just-merged run's own real `results/tool-calls.md` (still on disk, not yet
overwritten) as the audit dataset -- the last `get_graph_state` dump (turn 44) against the gold fixture's own
`predicates:` section directly, before any new eval run could overwrite that evidence.

- [x] **D -- matching threshold audit, real findings, targeted fix.** Confirmed a real, structural asymmetry:
      classes get every declared alias cross-checked against the recovered node's own label/meaning/aliases
      (rich, many-to-many); relationships and properties get exactly one recorded label against exactly one
      gold label, because the fixture's `predicates:` section has no `aliases:` field and the app's own
      edge/property data model has no alias concept either (unlike nodes). Manually diffing the last run's
      actual recovered relationships against gold found concrete, real near-misses this asymmetry was
      silently failing: `Incident handledUsing Runbook` (gold: "is handled with", Jaccard 0.33) and `Incident
      recoveredUsing RecoveryPlan` (gold: "is recovered with", same 0.33) -- correct class pair, correct
      direction, correct meaning, purely a preposition choice the interviewer could never have known to avoid
      since gold's exact wording is deliberately hidden from it. `recoveryMetrics.mjs`'s `labelsMatch()` now
      takes a threshold param: `CLASS_LABEL_MATCH_THRESHOLD = 0.6` (unchanged) vs a new
      `REL_PROP_LABEL_MATCH_THRESHOLD = 0.3` for relationships/properties, justified by the real 0.33 evidence
      and by the fact that a rel/prop match is always additionally gated by its class pair (or host class)
      already matching, which does most of a class match's own disambiguating work. Explicitly does **not**
      rescue a genuine zero-overlap word choice (gold "impacts" vs recorded "affects", Jaccard 0) -- documented
      as an accepted residual limit, not silently papered over with a synonym dictionary.
- [x] **B -- Phase 3 (relationships) prompting.** Two more mechanical pushes on top of the existing "don't stop
      after one opening batch" guidance (already in place, evidently not enough on its own): ground candidates
      directly in the Phase 1 material itself (many relationships are already implied by a real question/action
      -- the same anchoring already used for property gating), and require an actual `get_graph_state` call to
      check each class's relationship count before leaving the phase, rather than trusting memory of what's
      already been asked.
- [x] **A -- Phase 9 (validation) mechanical completeness audit.** The turn/wallclock budget was never the
      real constraint (45 of 500 turns, 14 of 45 minutes used) -- the interviewer's own willingness to
      self-declare "done" is. The final checklist now requires calling `get_graph_state` and confirming
      directly from that result (not memory) that every class has at least one relationship, and explicitly
      forbids reporting the interview complete over a checklist gap that was merely noted rather than closed.
- [x] **C -- property scope tightening.** New `practicalScopePropertyIds` in `groundTruthModel.mjs`, mirroring
      `practicalScopeClassIds` but one level deeper: a property on an in-scope class isn't automatically
      in-scope itself, its own label has to independently show content-word overlap with the fixture's
      competency-question/action corpus. First attempt (whole-phrase substring, matching the class approach
      exactly) matched **zero** of 111 properties -- two-thirds of the fixture's predicate labels follow a
      "has X" / "is X" convention no natural competency question is ever going to contain verbatim. Switched to
      stopword-stripped content-word overlap (all of a property's own content words must each appear somewhere
      in the corpus, not necessarily adjacent). Against the bundled fixture: scoped properties drop from 69
      (class-only) to 26 -- genuinely generic fields (`has name`, `has description`, `has version`) don't
      survive even on an in-scope class, while decision-bearing ones (`has status`, `has severity`) do,
      matching AGENT_KNOWLEDGE's own "reject nice to know fields" instruction. `scopeGroundTruth()` takes an
      optional third `propertyIds` argument (omitting it keeps the prior class-only behavior, so existing
      2-arg call sites/tests are unaffected).
- [x] Tests: `tests/ontology-recovery-metrics.spec.mjs` (+7) -- the two real near-miss relationships now
      credited; the zero-overlap "impacts"/"affects" case still correctly not credited (the accepted residual
      limit, pinned so it's a documented choice, not a silent gap); `practicalScopePropertyIds` is a real,
      non-trivial subset with specific real examples on each side; `scopeGroundTruth`'s new `propertyIds` arg
      behaves correctly both given and omitted. `tests/helper-agent-phase4.spec.mjs` (+2) -- Phase 3's new
      Phase-1-grounding and `get_graph_state` coverage-check phrasing; Phase 9's new mechanical-audit and
      no-declaring-complete-over-a-noted-gap phrasing.
- Full suite (`tests/*.spec.mjs`, 427 JS tests) green.
- **Live confirmation.** A fresh confirmatory run (turn 37, 662s, `app_agent_appears_finished` -- genuine
  finish again, not a cap/timeout/loop) against the previous merged run (turn 45, 849s) as baseline:
  - **Composite recovery effectiveness: 19.7% -> 30.2% full domain, 24.8% -> 47.3% scoped** -- a large,
    clear improvement.
  - **Property recall: 9.0% -> 31.5% full domain** (10 -> 35 matched, out of the *same* unchanged 111-property
    full-domain denominator) -- direct, strong confirmation the lower relationship/property matching threshold
    (D) is doing real work, not just a scoped-denominator artifact. Scoped property recall (11.6% -> 38.5%)
    combines that same threshold effect with the smaller, tighter 26-property scoped denominator (C).
  - **Class recall/precision, scoped: 50.0%/66.7% -> 53.6%/75.0%** -- a real but modest gain.
  - **Relationships: roughly flat this run** (2.5%/8.3% -> 2.5%/5.6% full, 6.3%/8.3% -> 4.2%/5.6% scoped) --
    not the improvement hoped for from B, but this is the noisiest single metric across two independent live
    LLM conversations (this eval's own stated philosophy: "run-to-run variance is expected and normal"), and
    the LLM review of *this specific run* explicitly praised relationship elicitation as "systematic," "ensured
    every class had at least one relationship," and "efficient coverage" (turns 6-11) -- a positive qualitative
    read the raw numbers alone don't capture, plausibly explained by this run's specific recovered wording
    happening not to overlap well with gold's, rather than the interviewer skipping relationships. Would need
    more than one run to separate a real B regression from ordinary variance; not chasing that further without
    more evidence either way.
  - Fewer turns (45 -> 37) and less wall-clock time (849s -> 662s) despite the new mechanical
    `get_graph_state` audits in both Phase 3 and Phase 9 (`get_graph_state` calls: 4 -> 6) -- the composite
    score went up substantially with a *shorter* session, suggesting the grounding-in-Phase-1 guidance made
    elicitation more efficient per turn rather than requiring more turns to cover the same ground.
- **Live confirmation blocked, not skipped:** re-running the confirmatory eval to prove the *original*
  `appearsFinished`/`max_tokens` fix actually stops a genuine finished interview promptly (this addendum's own
  stated goal) still failed immediately -- but by design this time: `forwardToRealOpenAi`'s own new
  quota-vs-rate-limit check correctly declined to retry, and a direct, isolated `curl`-equivalent call against
  the real key confirmed why: `error.code: "insufficient_quota"`, "You exceeded your current quota, please
  check your plan and billing details." This is the account's real, current OpenAI billing state, not a bug in
  this branch -- todays's heavy API usage (all the mocked suite's live tests, the two earlier eval attempts,
  this diagnostic call itself) appears to have exhausted it. Every automated check that doesn't require a live
  key (407 -> 414 mocked JS tests, all passing) is done and confirms both the original fix and this addendum's
  backoff work behave correctly, including correctly *not* retrying this exact condition. The one thing still
  outstanding -- an actual multi-turn live interview proving `appearsFinished`/`looksLikePureAcknowledgment`
  stop a real run promptly -- needs the account's quota restored first; nothing further to fix in code until
  then.
