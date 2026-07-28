# TODO — Agent Ontology (Domain Model Authoring)

Progress tracker for `agent_ontology_spec.md`. Same convention as the base app's `TODO.md`: check
items off as work happens, log deviations/decisions with a dated entry, keep "Current State" accurate
enough that this can be picked up cold.

---

## Current State

- **Phase:** Phase A (data model additions) is implemented, tested, and green — see its checklist
  below, now fully checked off. Phases B through I are not started. The four open questions from
  `agent_ontology_spec.md` §9 have not been explicitly answered by the user yet; Phase A proceeded on
  the spec's own stated defaults (§9's answers don't block Phase A's data-model-only scope — they
  matter starting Phase D/F). Still worth resolving before those phases start.
- **Relationship to the base app:** this branch builds strictly on top of `index.html` as it exists on
  `main` today (all PRs through #22 merged: bugfixes, visual polish, Android-reliability follow-ups).
  Nothing in the base app's `spec.md`/`TODO.md` changes — this is a new capability layered on, tracked
  separately so the base app's own history/conventions stay undisturbed.
- **Test suite:** 286 JS tests (279 base + 7 new in `tests/agent-ontology-phase-a.spec.mjs`) + 15
  Python tests, all green, run twice consecutively.
- **Target file:** still `index.html` (same single file — Agent Ontology is not a separate app or a
  second file, just new fields/UI/export on the existing one).
- **Next action:** confirm/resolve the four open questions in `agent_ontology_spec.md` §9 (or proceed
  with the spec's stated defaults), then start Phase A.

---

## How to resume this initiative

1. Read `agent_ontology_spec.md` in full — it's the source of truth for this feature set, same role
   `spec.md` plays for the base app.
2. Read the base app's own `spec.md` + `TODO.md` "Current State" for what the app already does — Agent
   Ontology assumes and depends on all of it (storage tiers, undo/redo, i18n, the existing node/edge/
   group model).
3. Read this file's "Current State" and "Log / Decisions" for anything that's been clarified or
   changed since the spec was drafted.
4. Continue with the first unchecked item below.

---

## Testing Strategy

Same tooling and conventions as the base app — no new test framework, no new dependency:
- `node --test tests/*.spec.mjs` (Playwright-driven, headless Chromium) — one new spec file per phase
  below, following the base app's existing "one file per phase/feature" convention (`tests/README.md`).
- Every phase's automated tests must pass, and the **full** existing suite (279 JS + 15 Python tests as
  of this branch's starting point) must stay green throughout — Agent Ontology is additive and must not
  regress any base-app behavior.
- `window.__kg` debug hook gets extended (not replaced) with whatever new state/actions each phase
  introduces (e.g. `window.__kg.state.rules`, `window.__kg.actions.addRule(...)`), mirroring how the
  base app already exposes `state`/`actions`/`storage` for testing.

---

## Phase A — Data model additions ✅ done

- [x] Rename `Node.notes` → `Node.meaning` (schema + the one place it's read/written today — see
      `agent_ontology_spec.md` §3, this is a rename of a dormant field, not new state)
- [x] Add `Node.aliases: string[]` (default `[]`)
- [x] Add `Node.properties: Property[]` (default `[]`) — shape per spec §4.1
- [x] Add `Edge.meaning: string | null` (default `null`)
- [x] Add top-level `state.rules: Rule[]` and `state.actions: Action[]` (default `[]` each), plus
      `state.nextRuleNum`/`state.nextActionNum` id counters and `createRule`/`createAction`/
      `deleteRule`/`deleteAction` data-model constructors (mirroring `createNode`/`createEdge` exactly
      — no undo-history registration inside them either, that's always the caller's job; no UI calls
      them yet, exposed on `window.__kg.actions` for Phase D/E and for this phase's own tests)
- [x] Tier 1 payload (`writeGraphToStorage`/`loadGraphFromStorage`) extended to persist/restore the new
      fields above — backward compatible: a payload saved before this phase loads with all new fields
      defaulting to their empty values (`normalizeLoadedNode`/`normalizeLoadedEdge`), no crash, no
      migration step, verified via a hand-seeded pre-Phase-A-shaped `localStorage` payload
- [x] `snapshotState()`/`restoreSnapshot()` (the undo/redo engine) extended to clone `aliases`/
      `properties`/`rules`/`actions` too, not just `groups`/nodes/edges as before — nothing mutates
      these yet via any UI, but this keeps the "every field is undo-correct by construction" property
      the existing code already documents, rather than leaving a latent gap for Phase D/E to trip over
- [x] Existing `.json` export (`spec.md` §5.1) includes the new fields on every node/edge, plus two new
      top-level `rules`/`actions` arrays
- Tests (`tests/agent-ontology-phase-a.spec.mjs`, 7 new tests, all green): `createRule`/`createAction`
  produce sequential, non-colliding ids; `deleteRule`/`deleteAction` remove by id without disturbing
  anything else; a node's meaning/aliases/properties and an edge's meaning survive a Tier 1 save/reload
  round-trip; rules/actions (and their id counters) survive the same round-trip, including a
  post-reload id not colliding with a restored one; a payload saved before this phase existed loads
  cleanly with every new field defaulting correctly, no crash, no console error; the JSON export
  includes populated meaning/aliases/properties/rules/actions when they're actually set; undo/redo
  restores rules via a genuinely independent clone, not an aliased array reference (proven by mutating
  live state in place after taking a snapshot, then confirming redo doesn't inherit that mutation).
  Fixed 3 pre-existing base-app tests that referenced the now-renamed `notes` field or hand-rolled the
  old (pre-Phase-A) two-array snapshot shape directly (`phase1.spec.mjs`, `phase3.spec.mjs`,
  `phase5.spec.mjs`) — expected fallout from an intentional rename/shape change, not regressions.

## Phase B — Class editor UI

- [ ] New 4th icon in `#sel-toolbar`, shown for entity/group node selection: "Edit Details"
- [ ] New modal (`.modal-dialog` pattern): Meaning (textarea), Aliases (add/remove chips or lines),
      Properties (add/remove rows: name, type dropdown [text/number/date/boolean], unit — number only,
      allowed-values list — optional)
- [ ] Committing the modal is one undo step, same as every other discrete action in the app
- [ ] Existing rename (✎) flow untouched — still label-only, still fast
- Tests: opening/editing/saving each field persists correctly; cancel discards changes; undo reverts a
  commit in one step; a node with no meaning/aliases/properties set behaves exactly as before this phase

## Phase C — Relationship editor UI

- [ ] Same new icon, shown for edge selection instead: smaller modal with just Meaning
- [ ] Existing relation-label rename flow untouched
- Tests: meaning round-trips through Tier 1 + JSON export; undo reverts in one step

## Phase D — Rules manager

- [ ] New toolbar button "Domain Model" (only new top-level toolbar button this whole feature adds)
- [ ] Modal, Rules section: add/edit/delete a named rule with an ordered list of free-text conditions
- Tests: CRUD round-trips through Tier 1 + JSON export; deleting a rule that's referenced by an
  existing Action's preconditions is handled explicitly (decide: block deletion with a message, or
  delete and drop the dangling reference — needs a decision when this phase starts)

## Phase E — Actions manager

- [ ] Same modal, Actions section: add/edit/delete a named action — input-class dropdown (populated
      from current entity/group nodes), preconditions multi-select (populated from current Rules),
      effect (text), verification (text)
- Tests: CRUD round-trips; input-class dropdown reflects current nodes live; deleting a class that's
  referenced as an Action's input is handled explicitly (same category of decision as Phase D)

## Phase F — Domain Model YAML export

- [ ] Hand-written minimal YAML serializer (indentation + list/scalar only — no external dependency)
- [ ] Bundled as a third file into the existing "Save Version" action:
      `<graph-name>_v<0000>_<UTC-timestamp>.domain.yaml`
- [ ] `classes:` — one entry per non-group node, keyed by label, per spec §5
- [ ] `relationships:` — one entry per non-auto edge, keyed by camelCase-derived id from `relation`,
      collision-suffixed per spec §5's Open Question 3 resolution
- [ ] `rules:` / `actions:` — per spec §4.3 shapes
- [ ] Group `contains` edges handled per spec §6's resolved decision (either exported as `includes`
      relationships, or excluded entirely — depends on Open Question 4)
- Tests: exported YAML matches the howto's own worked example shape when fed an equivalent graph
  (structural comparison, not brittle string-diff); relationship-key collisions produce distinct keys,
  not silent overwrites; a graph with no classes/relationships/rules/actions filled in still exports
  valid (if mostly empty) YAML without crashing

## Phase G — Import (YAML → canvas) — later phase, lower priority

- [ ] Parser for the same YAML shape, symmetric to the existing TXT import (`spec.md` §5.3) — merge/
      replace semantics still to be decided (does it reuse the exact same two-mode UX, or is a
      class/relationship-level description different enough to warrant its own confirmation flow?)
- Tests: TBD once this phase actually starts

## Phase H — Localization

- [ ] Every new label/placeholder/button/modal string gets `en` and `hu` entries in `STRINGS`,
      following the existing pattern exactly
- Tests: language toggle correctly re-renders all new UI surfaces, same pattern as existing
  `localization.spec.mjs`-style coverage

## Phase I — Regression pass, docs, PR

- [ ] Full suite green (base app's existing tests + all new Agent Ontology tests), run twice
      consecutively per this project's established convention
- [ ] `agent_ontology_todo.md` "Current State" updated to reflect what shipped
- [ ] Commit/push on `agent_ontology`; PR only if/when explicitly asked for

---

## Log / Decisions

*(Same convention as the base app's `TODO.md` — append dated entries here, keep `agent_ontology_spec.md`
as the reference and record deltas/clarifications here instead of rewriting the spec.)*

- 2026-07-26 — Branch `agent_ontology` created off `main` (all PRs through #22 merged: bugfixes, visual
  polish, `navigator.storage.persist()` + restore toast). User supplied
  `176ada33-minimal_domain_model_howto.md` (a guide for hand-describing a business domain — classes
  with meaning/aliases/properties, relationships with a verb-phrase name and meaning, rules as named
  plain-language condition lists, actions with input/preconditions/effect/verification) and asked for a
  minimal-reorg plan to let this app's next iteration produce exactly that shape, then a new branch with
  the spec and this todo manifested, ready for phased implementation — explicitly not implementation
  yet. `agent_ontology_spec.md` v0.1 written: treats existing non-group nodes as Classes (additive
  reframing, not a mode switch); renames the dormant, never-wired-up `Node.notes` field to `meaning`
  (a genuine zero-risk find, not new state); adds `aliases`/`properties` to nodes and `meaning` to
  edges; adds two new top-level collections (`rules`, `actions`) since neither is graph-shaped and
  doesn't belong on canvas as boxes/arrows; proposes bundling the new YAML export as a third file into
  the existing "Save Version" action (zero new toolbar buttons for export) and a single combined
  "Domain Model" toolbar button for managing Rules/Actions (avoiding two more buttons on an already
  dense 14-element toolbar); proposes reusing existing Group/`contains` semantics as free class-hierarchy
  authoring in the export (flagged as an open question, not a firm decision, since the howto's own
  example has no hierarchy at all). Four open questions left for explicit confirmation before/while
  implementing (app title rename, boolean property type, relationship-key collision handling, whether
  groups export as hierarchy or stay cosmetic) — spec states a default for each so implementation isn't
  blocked on an answer, but Phase A hasn't started yet pending direction on those.
- 2026-07-26 — User asked to start implementing on this same branch, first phase only, then test and
  PR and wait for merge before continuing. Phase A (data model additions) implemented in full per its
  checklist above: `Node.notes` renamed to `meaning` (the one existing read/write site, in
  `buildJsonExport`, updated along with it); `Node.aliases`/`Node.properties` added; `Edge.meaning`
  added; `state.rules`/`state.actions` added as new top-level arrays with their own id counters and
  `createRule`/`createAction`/`deleteRule`/`deleteAction` constructors (same shape and lack of
  self-registered undo history as `createNode`/`createEdge`); `snapshotState()`/`restoreSnapshot()`
  extended to clone every new array field, not just the ones currently reachable from UI; Tier 1
  storage read/write extended, with a new normalization step on load
  (`normalizeLoadedNode`/`normalizeLoadedEdge`) so a payload saved before this phase — or any payload
  missing the new fields for any reason — gets sane defaults rather than `undefined` propagating
  through the app; the JSON export extended to include all of the above. No `format_version` bump —
  every change is additive-only, consistent with the spec's own backward-compatibility section.
  3 pre-existing tests broke as a direct, expected consequence of the rename/shape change (not
  regressions) and were fixed in place: `phase1.spec.mjs` and `phase5.spec.mjs` asserted the old
  `notes` field name; `phase3.spec.mjs`'s "20 sequential adds" stress test hand-rolled its own
  before/after snapshot shape (bypassing `snapshotState()` for speed, per its own comment) using the
  old two-array `{nodes, edges}` shape, which `restoreSnapshot()` now expects to include `rules`/
  `actions` too. New `tests/agent-ontology-phase-a.spec.mjs` (7 tests) covers the new behavior,
  including one test that specifically proves `restoreSnapshot()` hands back independently-cloned
  arrays rather than aliased references, by mutating live state in place after a snapshot and
  confirming a subsequent redo doesn't inherit that mutation. Full suite green twice consecutively:
  286 JS tests (279 + 7 new) and 15 Python tests. PR opened per the user's request; per instruction,
  waiting for the user to merge rather than proceeding straight to Phase B.
