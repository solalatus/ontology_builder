# Helper Agent — Implementation Plan

Status: **DRAFT — awaiting review**. Nothing beyond this document has been built.
Branch: `helper_agent`, branched from `origin/main` at `533820e` (tip after PR #30).

## 0. Standing ground rules for this subproject

- All work lives on `helper_agent`. It is **never merged into `main`**. Future PRs
  for this feature target `helper_agent` as their base branch.
- `main` is not touched for this subproject unless explicitly instructed otherwise.
- Architecture constraint carries over unchanged from the base app: **one HTML
  file, no server, no external files fetched at runtime** — including the
  knowledge content used to ground the agent, which must be baked into the
  page as a JS string constant, not loaded from a sibling file.

## 1. Vision recap (for traceability, not new content)

An in-page chat panel, minimized by default. A "Connect" action opens a modal
asking for the user's own OpenAI API key (BYOK). Once connected, the panel
becomes a chat interface with a persona equivalent to the user's existing
"Ontology Interview Assistant" custom GPT — same interview methodology, same
output grammar — except instead of only handing back a downloadable YAML file
at the end, it can call a tool at any point in the conversation that applies
changes directly to the live ontology on canvas, visible immediately.

## 2. Decisions already made (confirmed by user, binding on this plan)

| Question | Decision |
|---|---|
| Edit application model | Fully autonomous — no per-edit confirmation gate. Trust is maintained through undo, not through a confirm dialog. |
| Tool granularity | One coarse tool, `apply_ontology_yaml`, not a fine-grained per-entity tool set. It reuses the existing YAML import pipeline verbatim. |
| Localization | Bilingual (en/hu) from day one, matching the base app's existing `STRINGS` convention — not English-only for this first pass. |

## 3. Open technical risk — must be validated before real API wiring begins

**CORS on `api.openai.com`.** Evidence found during feasibility research was
genuinely mixed (some 2024–2025 community reports say direct browser calls to
the Chat Completions endpoint work, others report the classic CORS block).
There is no authoritative OpenAI statement settling this either way.

This gets a dedicated **Phase 0 spike**, done before any panel UI is wired to
a real key: a five-minute empirical check — open the page from a `file://`
URL (matching how a single-HTML-file, no-server app is actually distributed)
with a real user-supplied key, and attempt a minimal `fetch()` POST to
`https://api.openai.com/v1/chat/completions`. Record whether the preflight
`OPTIONS` succeeds and whether the response is readable from JS.

- **If it works:** proceed exactly as designed below.
- **If it's blocked:** the BYOK/no-server model is not viable as literally
  specified, and this needs to come back to the user before continuing —
  the likely fallback (a thin same-origin proxy) would violate the
  "no server" constraint and isn't something to substitute silently.

This is the single biggest go/no-go item in the whole plan and is called out
first on purpose.

## 4. Architecture overview

New, self-contained additions to `index.html` (no new files — everything
still ships as one page):

```
┌─────────────────────────────────────────────────────────────┐
│ #agent-panel (collapsed by default, fixed to one side)      │
│  ┌─ collapsed: small toggle tab/button                      │
│  └─ expanded:                                                │
│      ├─ not connected: "Connect" button                     │
│      │    → opens #agent-connect-modal (API key entry)      │
│      └─ connected: chat transcript + input box               │
│           each assistant turn that edited the ontology gets  │
│           an inline "✓ applied: +N / ~N / -N" transcript line│
└─────────────────────────────────────────────────────────────┘
```

### 4.1 BYOK connect modal

- New `.modal-overlay`/`.modal-dialog` instance (`#agent-connect-overlay`),
  following the exact pattern already used by `#import-overlay` /
  `#domain-model-overlay`.
- Fields: API key (password-style input), an optional model-name text input
  defaulting to a stated current model (kept as plain text, not a hardcoded
  enum, since the model lineup changes over time and this is a single-file
  app with no build step to update a dropdown).
- Checkbox: "Remember this key on this device" — **unchecked by default**.
  - Unchecked (default): key lives only in an in-memory JS variable, cleared
    on reload. Mirrors the existing Folder-Sync precedent (session-scoped
    unless the user opts in).
  - Checked: key persisted to `localStorage` under a distinct key (e.g.
    `agentApiKey`), separate from the ontology's own autosave storage.
- On submit: run one trivial live request (e.g. a `models.list` call or a
  1-token chat completion) to confirm the key works before flipping the
  panel into "connected" state; show a clear inline error otherwise (bad
  key, network/CORS failure, rate limit).

### 4.2 Chat panel state machine

Three states: `collapsed` → `disconnected` (expanded, showing Connect) →
`connected` (chat UI). State lives in a new `agentState` object alongside
existing `state`, kept separate from the ontology data model entirely —
it is UI/session state, not something that round-trips through
export/import or undo history.

### 4.3 System prompt

Adapted from the already-designed MyGPT system prompt (captured in full in
`mygpt_setup.md`), restructured for tool-calling rather than end-of-session
file download:

- Keep: ROLE, GROUND RULES, the 9-phase INTERVIEW PROCESS, TONE.
- Change OUTPUT FORMAT / DELIVERABLES: instead of "produce a YAML file at
  the end and offer it for download," the prompt instructs the model to
  call `apply_ontology_yaml` **incrementally, whenever it has captured
  something concrete enough to add** (e.g. after a class or relationship is
  confirmed in conversation with the expert), rather than batching
  everything to a single final dump. This is the natural adaptation of
  "downloadable file" → "live tool call" and is what makes edits appear on
  canvas progressively during the interview, not just at the end.
- Add an explicit instruction that at most one `apply_ontology_yaml` call is
  made per assistant turn (see §4.5 on why), and that the YAML passed to the
  tool need only contain the new/changed entries for that step — the tool
  merges against the live graph, it does not need a full restated model
  every time.

### 4.4 Baked-in knowledge

A single JS string constant (e.g. `const AGENT_KNOWLEDGE = "..."`), embedded
directly in `index.html`, concatenated into the system prompt sent on every
request. Contents, sourced from the uploaded reference files:

- The full `minimal_domain_model_howto.md` text (~190 lines — small, include
  in full, it's already written for a non-technical audience).
- The full `load_edge_list.py` source (so the model can describe the `.txt`
  edge-list format precisely if asked) — already identical to
  `tools/load_edge_list.py` in this repo.
- A **condensed, operational** excerpt from the academic paper — not the
  full paper (explicitly out of scope per the user's own instruction: "maybe
  not the full PDF scientific paper... the relevant parts... not for
  science but for operation"). Proposed source sections to condense from,
  to be authored as an actual deliverable in Phase 4, not decided finally
  here:
  - §4 (the MTSR formalism: classes/predicates/domain-range/lexical layer)
  - §7 (recommended minimal profile — what's required vs. optional)
  - §9 (construction method — this is what the interview phases already
    mirror, so it reinforces rather than duplicates)
  - Appendix A (the how-to, already covered above in full, so this excerpt
    only needs a one-line pointer, not a restatement)
  - This selection is a default, called out explicitly for the user to
    confirm or amend during plan review — it's the one open scope question
    not covered by the three clarifying questions already asked.

This keeps the constant small (a few KB of text), avoids any retrieval
infrastructure (no embeddings, no vector store, no chunking), and satisfies
"no external files" since it ships inline in the HTML.

### 4.5 Tool definition and wiring

```js
{
  type: "function",
  function: {
    name: "apply_ontology_yaml",
    description: "Apply new or changed classes, relationships, rules, or " +
      "actions to the live ontology. Only include entries that are new or " +
      "have changed — this merges against the existing model, it does not " +
      "need to restate everything.",
    parameters: {
      type: "object",
      properties: {
        yaml: { type: "string", description: "Domain-model YAML using the " +
          "classes/relationships/rules/actions block-style shape." }
      },
      required: ["yaml"]
    }
  }
}
```

Execution path when the model calls it:

1. `parseDomainYamlImport(args.yaml)` → parsed structure (already handles
   malformed/partial YAML defensively — reused as-is, no changes needed).
2. `planYamlImport(parsed)` → added/changed/removed counts, used to render
   the "✓ applied: +N / ~N / -N" transcript line (this is what makes edits
   visibly transparent per the vision's "real time presents what the
   chatbot edited" requirement, beyond just the canvas repainting).
3. `commitYamlImport(args.yaml, "merge")` → applies it. This function
   already does its own `snapshotState()`/`pushHistory()` internally
   (`index.html:3751-3856`), so **one call already equals exactly one undo
   step** — no new history-batching code is needed for the common case of a
   single tool call per turn.
4. The existing render loop already reacts to any state mutation via
   `markDirty()` inside `commitYamlImport`, so canvas updates happen with
   zero new rendering code.
5. "Replace" mode is deliberately not exposed to the agent — an
   autonomous agent nuking the whole graph on a misunderstanding is a much
   worse failure mode than the manual dialog's aggressive-overwrite option,
   which a human explicitly opts into. The tool only ever merges.

**Guardrail on turn/undo granularity:** OpenAI's API can return multiple
`tool_calls` in a single assistant response. To keep the "one undo step per
agent turn" property exactly (per the confirmed decision), the plan is:
- Instruct the model via the system prompt to make at most one
  `apply_ontology_yaml` call per turn.
- Defensively, if a response ever contains more than one call to it anyway,
  concatenate their `yaml` bodies under merged top-level keys before a
  single `commitYamlImport` call, rather than committing each separately —
  cheap to implement, and keeps the guarantee even if the model doesn't
  follow the instruction perfectly.

### 4.6 API integration details

- Endpoint: OpenAI Chat Completions (`/v1/chat/completions`) with `tools`
  and `tool_choice: "auto"` — the general-purpose API, not any custom-GPT-
  specific endpoint (confirmed during feasibility research: no API exists to
  address a specific custom GPT's persona directly).
- Non-streaming for the first pass. Streaming plus tool-call parsing adds
  real complexity (partial JSON argument buffering) for a first
  implementation; can be revisited later.
- Every request resends: system prompt + baked knowledge + full running
  message history (the API is stateless). Noted cost/latency implication;
  OpenAI's automatic prompt-prefix caching should absorb most of the
  repeated-prefix cost for the system prompt/knowledge portion, but this is
  an observation to confirm empirically, not something to build.
- Error handling surfaced directly in the chat transcript as a system-style
  message: invalid key, rate limit (429), network/CORS failure, malformed
  tool-call arguments (caught around the `parseDomainYamlImport` call —
  already defensive, but wrap anyway so a bad model response can't throw
  past the chat loop).

### 4.7 Rendering the transcript safely

Assistant/user message text is rendered as escaped text content (not
`innerHTML`) to avoid introducing an XSS surface via model output — this is
a new external-data ingestion point the base app didn't have before, so it
gets the same treatment as any other untrusted-content rendering.

### 4.8 i18n

New `STRINGS` keys (en/hu) for: panel toggle label, Connect button, modal
field labels/placeholder, connection error messages, chat input placeholder,
send button, the "✓ applied: +N / ~N / -N" transcript line template,
disconnect/forget-key action. Follows the exact existing `STRINGS` table
pattern (`index.html:704`) — no new i18n mechanism.

## 5. Non-goals for this first version

- No streaming responses.
- No fine-grained tool set (single coarse tool only, per confirmed decision).
- No multi-provider support (OpenAI only, matching the existing MyGPT).
- No conversation persistence across reloads by default (mirrors the API
  key's own default-in-memory stance) — revisit only if requested.
- No cost/usage tracking or budget limits.
- No file upload/vision support in the panel.

## 6. Implementation phases

Mirrors this project's existing lettered-phase convention (Agent Ontology
Phases A–I), renumbered fresh for this subproject:

- **Phase 0 — CORS spike.** Empirical validation per §3. Go/no-go gate.
- **Phase 1 — Panel scaffold.** Collapsed/expanded UI, connect modal (UI
  only, key capture + in-memory/localStorage toggle), no live API calls yet.
- **Phase 2 — Live chat, no tools.** Real Chat Completions calls, plain
  back-and-forth text, error handling, key validation on connect.
- **Phase 3 — Tool-calling.** Wire `apply_ontology_yaml`, the merge-based
  commit path, the applied-diff transcript line, the single-call-per-turn
  guardrail.
- **Phase 4 — System prompt + knowledge.** Finalize the adapted system
  prompt and author the condensed paper excerpt (§4.4) as a concrete
  reviewable string.
- **Phase 5 — i18n + visual polish.** Bilingual strings, styling pass
  matching existing modal/panel conventions.
- **Phase 6 — Tests + docs.** Playwright tests with a mocked `fetch` (real
  OpenAI calls aren't viable in CI — no committed key, and non-deterministic
  model output). Mock returns scripted tool-call responses to exercise the
  merge/undo/transcript path deterministically. Update this repo's todo/spec
  docs for the subproject on the `helper_agent` branch only.

Each phase can be its own PR against `helper_agent`, following the existing
project convention of phase-sized reviewable increments.

## 7. Open items for user review (please confirm or adjust)

1. **Paper excerpt scope** (§4.4): is §4/§7/§9/Appendix-A-pointer the right
   condensation, or should it lean narrower/broader?
2. Default model name to suggest in the connect modal (left unspecified
   above deliberately, since this is a fast-moving choice best made at
   implementation time, not locked into this plan).
3. Anything about the phase breakdown in §6 that should be reordered,
   merged, or split differently before Phase 0 starts.
