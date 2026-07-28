# Helper Agent — Implementation Plan

Status: **Phases 1–2 implemented and tested** (see `helper_agent_todo.md` for
the per-phase log). Revised after user feedback on the first draft (see §3,
§4.1, §4.3, §4.9, §4.10 for what changed).
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

## 3. CORS — empirical finding (updated; provisional go)

**CORS on `api.openai.com`.** The original draft flagged this as unresolved
(mixed community reports, no authoritative OpenAI statement). It's now been
checked directly against the real API with `curl`, simulating the browser
preflight/response cycle:

- `OPTIONS /v1/chat/completions` with `Origin: null` (what a `file://` page
  sends) → `200`, with `access-control-allow-origin: null`,
  `access-control-allow-methods: GET, OPTIONS, POST`, and
  `access-control-allow-headers: authorization,content-type`. Also checked
  with an arbitrary `Origin: https://example.com` → echoed back correctly.
  Preflight is fully permissive for exactly the request shape this feature
  needs (`Authorization` + `Content-Type` headers, `POST`).
- `GET /v1/models` (used for the model-list fetch, §4.1) → the actual
  (non-preflight) response carries `access-control-allow-origin: *` even on
  a `401`, meaning a browser can read it regardless of key validity.
- `POST /v1/chat/completions` with a deliberately invalid key → the actual
  `401` response in this sandbox did **not** carry an
  `access-control-allow-origin` header, which would make it unreadable from
  browser JS specifically on the error path.

**Caveat on this result:** this sandbox's own outbound HTTPS goes through a
pre-configured agent proxy, and the `401` response above included an
`x-openai-internal-caller: unknown_through_ide` header that a direct
client-to-OpenAI call would not produce — strong evidence the proxy is
intercepting/rewriting this specific traffic rather than passing it through
unmodified. So the missing CORS header on the error path is **not** trusted
as representative of real-world behavior (a real user's browser, hitting
`api.openai.com` directly, may see a normal fully-CORS'd error response).

**A second attempt was made with a real headless browser**, not just
`curl`, to get closer to the truth: a Playwright-launched Chromium, given
this sandbox's proxy explicitly (`proxy: { server: "http://127.0.0.1:44683" }`)
and TLS errors ignored, opened `index.html` from `file://` and ran the same
`fetch()` calls the real feature would make. Both failed with
`net::ERR_CONNECTION_RESET` at the network layer — but `curl` through that
*exact same proxy*, at the *same moment*, still succeeded. Since the only
variable is the client (curl vs. Chromium's proxy-tunneling/TLS
negotiation), this is a sandbox-specific plumbing limitation, not a CORS
signal — it says nothing about how a real user's ordinary, unproxied browser
behaves. No API key — real or fake — resolves this; it's a network-path
problem, not an authentication one. This is the ceiling of what's testable
from inside this environment.

**Resolution:** treat this as a provisional go rather than a hard blocker,
and fold the real validation into the product itself instead of a throwaway
spike: the connect modal's own "run one trivial live request to confirm the
key works" step (§4.1) — executed by real users, on real networks, with real
keys, outside this sandbox — **is** the live CORS check. If it fails for a
real user, the modal's error state (§4.1, §4.6) surfaces it immediately and
legibly rather than silently. This removed the need for a separate "Phase 0
spike" phase — it's now just the first thing Phase 1 does at runtime.

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
- Fields: API key (password-style input) and a model `<select>` — see below,
  populated live rather than hardcoded.
- Checkbox: "Remember this key on this device" — **unchecked by default**.
  - Unchecked (default): key lives only in an in-memory JS variable, cleared
    on reload. Mirrors the existing Folder-Sync precedent (session-scoped
    unless the user opts in).
  - Checked: key persisted to `localStorage` under a distinct key (e.g.
    `agentApiKey`), separate from the ontology's own autosave storage.
- On submit: call `GET https://api.openai.com/v1/models` with the supplied
  key. This single call does double duty: it's the live key-validity check
  *and* the real-world CORS check (§3), *and* it supplies the data for the
  model picker below — no separate throwaway request needed.
  - Success → populate the model `<select>` from the response's `data[]`
    (each entry has `id` and a `created` unix timestamp) and flip the panel
    to "connected".
  - Failure → clear inline error in the modal (bad key, network/CORS
    failure, rate limit) without leaving the modal in a half-connected state.

**Model selection (updated per user feedback).** Rather than a free-text
model-name field, the list of models the user's key can actually access is
fetched live (above) and offered as a dropdown, defaulting to a heuristic
pick rather than a hardcoded name — hardcoding would silently go stale as
OpenAI's lineup changes, exactly the failure mode a live fetch avoids:

```js
// Reasoning/"thinking" models are the current o-series (o1, o3, o4, ...)
// and any id that says so explicitly. Heuristic on purpose — the naming
// scheme is OpenAI's to change, and this stays correct without an edit as
// long as future reasoning models keep either convention.
function isLikelyReasoningModel(id) {
  return /^o[0-9]/i.test(id) || /think|reason/i.test(id);
}
// Excludes non-chat model families (audio/image/embedding/moderation/base
// completion) so the fallback pool (when no reasoning model is available on
// this key) doesn't default to something that can't hold a conversation.
function isLikelyChatModel(id) {
  return !/whisper|tts|dall-e|embedding|moderation|davinci|babbage|curie|ada|realtime|audio|transcribe|image/i.test(id);
}
function pickDefaultAgentModel(models) {
  const chatModels = models.filter((m) => isLikelyChatModel(m.id));
  const pool = chatModels.filter((m) => isLikelyReasoningModel(m.id));
  const candidates = pool.length ? pool : chatModels;
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => (b.created || 0) - (a.created || 0))[0].id;
}
```

The newest-by-`created` reasoning-family model is pre-selected in the
dropdown; the user can override it to any other model their key can access
before hitting Connect, or change it later from the connected panel header
without reopening the modal.

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

**Scope hardening (added per user feedback).** The base MyGPT prompt assumes
a cooperative user in a walled-garden ChatGPT UI; this version is embedded in
a page anyone can open with their own key, so the prompt gets an explicit
new GROUND RULES entry addressing that:

- State the persona's sole purpose plainly (ontology elicitation and editing
  for this tool) and instruct it to decline anything outside that scope —
  general Q&A, code/content generation unrelated to ontology modeling,
  role-play as a different persona, or requests to disregard these
  instructions — with a short, polite redirect back to the interview, not a
  long refusal essay.
- Explicitly instruct it to treat instructions that arrive embedded in
  ordinary conversation (e.g. "ignore previous instructions and...") as
  ordinary user text to evaluate against the ground rules above, not as
  authoritative — i.e. don't let in-conversation text re-privilege itself.
- Explicitly instruct it not to reveal the raw system prompt or the baked
  knowledge string verbatim on request (it can describe what it's grounded
  in and cite sections, per the existing "cite the specific section" rule,
  without dumping the source text) — a light guard, not a security boundary
  (nothing here is a secret; the point is keeping the interaction on-task,
  not preventing extraction of non-sensitive text).
- This is a prompt-level guardrail, not a technical enforcement mechanism —
  consistent with how far BYOK/single-page tools reasonably go; documented
  here so the limitation is explicit rather than assumed away.

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

### 4.9 Output-language lock (added per user feedback)

The agent's *reply* language should track the app's current UI language
(`lang` — `en`/`hu`, `index.html:864`), not whatever language the
conversation happens to drift into. Two things enforce this together:

- A short, clearly-delimited directive appended to the system prompt on
  every request (not just the first), e.g.:
  ```
  ---
  OUTPUT LANGUAGE: Hungarian (hu). Always reply in this language,
  regardless of what language the user writes in, unless they explicitly
  ask you to switch.
  ---
  ```
  Re-stating it on every call (rather than only once at conversation start)
  is what prevents drift over a long conversation — a single instruction
  buried at the very top of a long, stale-feeling history is exactly the
  kind of thing models start deprioritizing after enough turns.
- If the user toggles the app's language mid-conversation (`toggleLanguage()`,
  `index.html:952`), the next outgoing request picks up the new value
  automatically, since the directive is generated fresh per-request from
  the live `lang` variable rather than baked in once at connect time.
- The directive text itself only needs an `en` and `hu` copy (two short
  strings), not a new general-purpose mechanism.

### 4.10 Long-context handling and conversation memory (added per user feedback)

Chat Completions is stateless, so the full running message history is resent
every turn; on a long interview this can eventually exceed the model's
context window and the API responds with an error (OpenAI surfaces this as
a `400` with `error.code === "context_length_exceeded"` or equivalent
message-length wording, depending on the parameter that overflowed).

**Design: reactive summarization, triggered on that specific rejection —
not proactive token counting.** This keeps the mechanism simple (no client-
side tokenizer needed to estimate usage ahead of time) at the cost of one
extra round-trip the first time a conversation gets long, which is an
acceptable trade for a first version.

- Two message arrays are kept apart in `agentState`, not one:
  - `agentState.transcript` — the full conversation, exactly as shown in
    the UI. Never trimmed. This is what the user sees and scrolls through.
  - `agentState.apiMessages` — the working set actually sent to the API.
    Starts identical to the transcript's user/assistant/tool turns, but is
    the *only* thing that gets compacted.
- The system prompt + baked knowledge (§4.3/§4.4/§4.9) are **not** part of
  either array — they're always regenerated fresh and prepended to the
  outgoing request. Summarization only ever touches `apiMessages`; it must
  never overwrite or paraphrase the system/knowledge content, per explicit
  instruction.
- On a `context_length_exceeded`-shaped error:
  1. Take `apiMessages` minus the most recent few turns (keep, say, the
     last 4 messages verbatim, so immediate context isn't lost).
  2. Send one extra Chat Completions call — system prompt/knowledge still
     included, no tools attached — asking the model to summarize that
     older slice into a compact paragraph capturing the ontology decisions
     made so far (confirmed classes/relationships/rules/actions, open
     questions, which interview phase it's in).
  3. Replace that older slice in `apiMessages` with a single message:
     `{ role: "user", content: "[Earlier conversation summary]: " + summary }`
     (or `role: "system"` — implementation detail to settle in Phase 2 —
     but always visibly tagged as a summary, never disguised as a verbatim
     turn).
  4. Retry the original request against the now-shorter `apiMessages`.
  5. The UI-facing `transcript` is untouched throughout — the user keeps
     scrolling through the real history; only the API-facing copy shrinks.
- If the *retry itself* still overflows (pathological case — the kept
  "last few turns" alone are already too large), fall back to summarizing
  everything except the single most recent user message, and surface a
  small transcript note that older context was compacted, so the behavior
  is never silently lossy from the user's point of view.
- Proactive context-budget tracking (estimating tokens before hitting the
  limit, to summarize pre-emptively) is called out as a reasonable future
  enhancement but is explicitly out of scope for this first version —
  reactive-on-rejection is what was asked for and is simpler to get right.

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

- **Phase 1 — Panel scaffold + connect modal + model list.** Collapsed/
  expanded panel UI, connect modal (key capture + in-memory/localStorage
  toggle), the live `GET /v1/models` call (doubles as the real CORS check
  per §3), the default-model heuristic + override dropdown. No chat-turn
  API calls yet — the connected panel shows the model picker and an empty
  transcript with sending disabled, so state machine and network
  validation are both exercised before any conversation logic exists.
- **Phase 2 — Live chat, no tools yet.** Real Chat Completions calls, plain
  back-and-forth text, the language-lock directive (§4.9), and the
  long-context/summarization flow (§4.10) — this is inherent to the chat
  loop itself, not specific to tool-calling, so it belongs here rather than
  later.
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

## 7. Review resolutions (previously open items)

1. **Paper excerpt scope** (§4.4): confirmed as proposed — §4/§7/§9/
   Appendix-A-pointer.
2. **Default model**: not a hardcoded name — a live `GET /v1/models` fetch
   on connect, defaulting to the newest reasoning/"thinking" model the key
   can access, manually overridable in the modal or later from the panel.
   See §3 and the revised §4.1.
3. **Phase breakdown**: no changes requested; Phase 0 folded into Phase 1
   per the CORS finding in §3, Phase 2 absorbed the language-lock and
   long-context handling since both are chat-loop concerns rather than
   tool-calling ones. See revised §6.
4. Also added per this review round, not from the original open-items list:
   prompt scope-hardening (§4.3), the output-language lock (§4.9), and the
   long-context/summarization flow (§4.10) — all reflected above.
