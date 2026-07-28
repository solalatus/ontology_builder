# TODO — Agent Ontology (Domain Model Authoring)

Progress tracker for `agent_ontology_spec.md`. Same convention as the base app's `TODO.md`: check
items off as work happens, log deviations/decisions with a dated entry, keep "Current State" accurate
enough that this can be picked up cold.

---

## Current State

- **Phase:** All of Phases A through I are implemented, tested, and green — see their checklists below,
  now fully checked off (Phase C was folded into B; Phase E was folded into D; Phase H's actual scope
  turned out small and was folded into the same pass as Phase G — see each phase's own note). **The
  Agent Ontology initiative as originally planned is complete.** Of the four open questions from
  `agent_ontology_spec.md` §9: #3 (relationship-key collisions) is resolved — the user chose a list
  structure for `relationships` over a name-keyed map, sidestepping the collision-naming question
  entirely (see the dated Log entry). #4 (Groups) is also resolved, by a route neither original option
  covered: the user asked for Groups to be removed from the *base app* entirely (canvas UI, data model,
  both file formats), not just excluded from this export — implemented as its own dedicated phase/PR
  ahead of Phase F, tracked in the dated Log entry below and in the base app's own `TODO.md`/`spec.md`
  (Decision Log #11), not in this file's phase checklist since it's a base-app change, not an Agent
  Ontology one. Phase G's own flagged question (import merge/replace semantics) is resolved too — see
  Decision #10. #1 (app title) and #2 (boolean property type) remain genuinely open — deferred to their
  stated defaults throughout, since nothing in Phases F through I ever surfaced a reason to revisit
  either; picking those back up (if ever) would be new, separately-scoped work, not a continuation of
  this initiative's own plan.
- **Relationship to the base app:** this branch builds strictly on top of `index.html` as it exists on
  `main` today (all PRs through #28 merged: bugfixes, visual polish, Android-reliability follow-ups,
  this branch's own Phase A through H, and the base app's own separate Groups-removal PR). Nothing in
  the base app's `spec.md`/`TODO.md` changes as a *consequence of Agent Ontology* — Groups removal is a
  base-app decision with its own base-app PR, documented in the base app's own `spec.md`/`TODO.md`.
- **Test suite:** 287 JS tests (282 through Phase I + 5 from the post-initiative coverage/UI pass below)
  + 11 Python tests, all green, run twice consecutively. (Phase A/B/D's own test files remain at their
  original counts — 7/15/13 — this Current State bullet now just reports the whole-suite total rather
  than re-deriving it phase-by-phase; see each phase's own checklist above, and the base app's own
  `TODO.md`, for the itemized per-file breakdown.)
- **Post-initiative coverage + Rules UI pass (2026-07-28, after Phase I):** the user asked for the
  initiative's own critical-area gaps to be closed and for the Domain Model's Rules/Actions UI to be
  reviewed for usability — not a new lettered phase, since the initiative itself was already complete;
  see the dated Log entry for the full account. Summary: fixed a real UI bug (Effect/Verification inputs
  and the Preconditions select had no persistent labels — once filled in, two plain text boxes were
  visually indistinguishable), and added test coverage for three previously-thin areas: a large-scale
  (350-entry) YAML export/import round trip, a documented-and-pinned known limitation in
  `toCamelCaseId()`, a 25-rule/25-action Domain Model UI stress test, and a longer, multi-stage rules/
  actions chain exercised end to end (including a multi-precondition action and mid-chain deletion).
- **A Phase B side effect worth knowing about:** widening `#sel-toolbar` from 3 icons to 4 (the new
  "Edit Details" icon) exposed a real, if narrow, pre-existing interaction hazard — a lingering
  selection's floating toolbar can now more easily reach over a nearby node's own click point, since
  `setMode()` never clears `state.selection`. This broke a shared test helper
  (`createEdgeViaConnectMode` in `tests/lib/page.mjs`, used by many spec files, not just this branch's
  own), fixed by having that helper clear selection before arming connect mode. See the dated Log entry
  — this is a base-app-level test-infra fix that happened to be surfaced by an Agent Ontology UI change,
  not something scoped to Agent Ontology's own feature set, but recorded here since that's where it
  happened and why.
- **Target file:** still `index.html` (same single file — Agent Ontology is not a separate app or a
  second file, just new fields/UI/export on the existing one).
- **Next action:** none planned — this initiative (Phases A through I) is complete. The howto's full
  shape (classes with meaning/aliases/properties, relationships with meaning, rules, actions) can now be
  hand-authored on canvas, exported as `.domain.yaml`, and re-imported, round-tripping cleanly. Any
  further work here (Open Questions #1/#2, or anything beyond the original plan) would start as a fresh,
  explicitly-scoped request, not a continuation of an in-flight phase. The base app's own `TODO.md` still
  has Phase 10 (manual cross-platform verification) outstanding, unrelated to this initiative.

---

## How to resume this initiative

1. Read `agent_ontology_spec.md` in full — it's the source of truth for this feature set, same role
   `spec.md` plays for the base app.
2. Read the base app's own `spec.md` + `TODO.md` "Current State" for what the app already does — Agent
   Ontology assumes and depends on all of it (storage tiers, undo/redo, i18n, the existing node/edge
   model — note that Groups were removed from the base app; see `spec.md` Decision Log #11).
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

## Phase B — Class editor UI ✅ done

- [x] New 4th icon in `#sel-toolbar` (`#sel-details`, an ⓘ glyph), shown for every selection — node
      *and* edge alike, unlike `#sel-toggle-dir` which hides for nodes (Phase C folded in from the
      start, see below)
- [x] New modal (`#details-overlay`/`#details-dialog`, the `.modal-dialog` pattern): Meaning
      (textarea), Aliases (add/remove rows), Properties (add/remove cards: name, type dropdown
      [text/number/date/boolean], unit — shown only for type "number", allowed-values — a single
      comma-separated text field, parsed/trimmed/de-duped-of-empties on save rather than its own
      repeatable sub-list, for a simpler first pass)
- [x] Committing the modal is one undo step (`snapshotState()`/`pushHistory()`, same as every other
      discrete action) — and, matching the existing rename flow's own discipline, a save with no actual
      changes pushes no history entry at all
- [x] Existing rename (✎) flow untouched — still label-only, still fast, still its own icon
- [x] Global keydown handler extended with a `detailsEditingTarget`-guarded early return (Escape closes/
      cancels; critically, this also prevents Delete/Backspace inside the dialog's own text fields from
      falling through to the canvas-level delete-selection shortcut)
- Tests (`tests/agent-ontology-phase-b.spec.mjs`, 15 tests, all green): opening pre-fills every field
  from current state; Class vs. Group vs. Relationship titles differ correctly; Save commits
  meaning+aliases+properties together as exactly one undo step and undo fully reverts it; Cancel/
  clicking outside/Escape all discard without pushing history; backspacing in the meaning textarea
  doesn't delete the selected node; removing an alias/property row before saving persists the removal;
  the Unit field's visibility tracks the property type dropdown live; a nameless newly-added property
  row is dropped rather than saved; allowed-values parsing trims and drops empty entries; a genuinely
  no-op save pushes no undo step; language toggle re-translates the dialog's static chrome; a node with
  nothing set behaves exactly as before this phase.
- **A CSS layout bug found and fixed during this phase, not a pre-existing one:** the first draft laid
  out each property as one flat 5-cell flex row (name/type/unit/allowed/remove-button). At this dialog's
  width those don't fit on one line, so the row wrapped — but flex-wrap wraps a row's own children, not
  whole rows, so the remove button (and sometimes the allowed-values field) visually landed on what
  looked like a second, unrelated, ownerless row. Screenshot-caught before committing, not left for a
  test to catch (getComputedStyle-based tests wouldn't have flagged a purely visual misread). Fixed by
  restructuring each property into a deliberate two-line card (name+remove on top, type+unit+allowed
  below) rather than relying on accidental wrap — verified clean in both themes via screenshot.
- **A real, if narrow, pre-existing interaction hazard this phase's UI change exposed** (not an Agent
  Ontology bug itself — see the dated Log entry and the Current State bullet above for the full account):
  widening `#sel-toolbar` broke a *shared, base-app* test helper (`createEdgeViaConnectMode`), fixed at
  the helper level.

## Phase C — Relationship editor UI ✅ done (folded into Phase B)

`agent_ontology_spec.md` §7 always described this as "the same new icon, shown for edge selection
instead" — one shared dialog, not two separate implementations — so it was built and tested alongside
Phase B rather than as later, separate work. Nothing here needed its own dedicated code.

- [x] Same new icon, shown for edge selection instead: `openDetailsDialog("edge", id)` hides the
      aliases/properties sections (`display: none`) and shows only Meaning, leaving the rest of the
      dialog's chrome (title text swaps to "Edit Relationship Details", Save/Cancel/Escape/outside-click
      all behave identically) shared with the node case
- [x] Existing relation-label rename flow untouched
- Tests: covered directly in `tests/agent-ontology-phase-b.spec.mjs` ("an edge's details dialog shows
  only Meaning — aliases/properties sections are hidden") plus Phase A's own
  `tests/agent-ontology-phase-a.spec.mjs`, which already proved `Edge.meaning` round-trips through
  Tier 1 storage and the JSON export before any UI existed to set it by hand

## Phase D — Rules manager ✅ done

- [x] New toolbar button "Domain Model" (`#btn-domain-model`, placed right after Connect) — the only
      new top-level toolbar button this whole feature adds, per `agent_ontology_spec.md` §7 Decision #5
- [x] Modal (`#domain-model-overlay`), Rules section: add/edit/delete a named rule with an ordered
      list of free-text conditions — whole-dialog draft-then-commit (every add/remove/edit happens
      against DOM elements only; `state.rules`/`state.actions` are read once on open, written once on
      Save as a single undo step), same philosophy as the Phase B/C details dialog
- [x] **Decision on the flagged question** (deleting a rule referenced by an action's precondition):
      dropped silently, not blocked — both inside the modal's own save flow (a rule left nameless, or
      removed via its row's ✕, drops out of any action's selected preconditions) and at the data-layer
      `deleteRule()` primitive itself (extended to scrub the id from every action's preconditions, the
      same pattern `deleteNode()` already uses for cleaning up `groups[]` references). Consistent with
      Phase A's own original reasoning for storing preconditions by id rather than name: making a
      rename/delete non-catastrophic by construction, not something needing a confirmation dialog.
- Tests (`tests/agent-ontology-phase-d.spec.mjs`, shared with Phase E below, 13 tests total): rule
  CRUD round-trips with real sequential ids; a nameless rule is dropped rather than saved; removing a
  rule row live-updates any action's preconditions `<select>` (its option disappears immediately, not
  just after save); `deleteRule()` scrubs dangling preconditions; Cancel/Escape discard all edits made
  since opening; a genuinely no-op save pushes no undo step; language toggle re-translates the dialog.

## Phase E — Actions manager ✅ done (built together with Phase D — one shared modal, per spec §7)

- [x] Same modal, Actions section: add/edit/delete a named action — input-class dropdown (a static
      snapshot of `state.nodes` at modal-open time, since nothing else on the page is interactive while
      the modal is open, so it can't go stale mid-session), preconditions multi-select (a native
      `<select multiple>`, kept live-in-sync with the Rules section above — see `refreshAction
      PreconditionOptions()`, re-run on rule add/remove/rename), effect (text), verification (text)
- [x] **Decision on the flagged question** (deleting a class referenced as an action's input): the
      reference is nulled, not the whole action — `deleteNode()` extended to null out `inputClassId` on
      any action pointing at the deleted node, mirroring the same reasoning as Phase D's rule-deletion
      decision above (an action's effect/verification/preconditions text is still meaningful without an
      input class; the dropdown already has a "— no class —" option to represent that state)
- [x] A same-session precondition reference (an action selecting a rule added earlier in the *same*
      still-open editing session, before either has a real id) resolves correctly at Save time via a
      draft-id → real-id map, since neither the rule nor the action has a real id until the moment
      they're actually committed
- Tests: covered together with Phase D in `tests/agent-ontology-phase-d.spec.mjs` — action CRUD;
  resolving a same-session draft precondition id to the saved rule's real id; pre-filling an existing
  action's input class and pre-*selecting* its existing preconditions on dialog open; the input-class
  dropdown reflecting current canvas nodes (with "no class" staying selectable); `deleteNode()` nulling
  `inputClassId` rather than deleting the action it belonged to

## Phase F — Domain Model YAML export ✅ done

- [x] Hand-written minimal YAML serializer (`yamlScalar`/`yamlLines`/`toYaml`), block style only — no
      anchors/tags/flow-style, no external dependency. A plain scalar is emitted unquoted only when
      unambiguous under YAML's plain-scalar grammar; anything else (colons, hashes, brackets/braces/
      commas, quotes, leading/trailing whitespace, newlines, YAML-reserved literals like `true`/`null`/
      a bare number) is double-quoted with backslash escaping. Empty arrays/objects render as the
      inline `[]`/`{}` token — the one deliberate exception to "block style only," since there's no
      other way to represent zero items in block form.
- [x] Bundled as a third file into the existing "Save Version" action (`performSaveVersion()`, both the
      Tier 3 download branch and the Tier 2 folder-write branch, with the same fallback-to-download
      behavior on a Tier 2 write failure that the JSON/TXT files already had):
      `<graph-name>_v<0000>_<UTC-timestamp>.domain.yaml`
- [x] `classes:` — one entry per node, keyed by label, per spec §5; `meaning` always present (`null`
      when unset); each property keyed by name with `type` always present, `unit`/`allowed` only when
      actually set
- [x] `relationships:` — a **list** of `{name, from, to, meaning}` entries, one per edge (resolved: the
      user chose a list structure over a name-keyed map, sidestepping Open Question 3's collision-naming
      question entirely — no numeric-suffix disambiguation needed). `name` is still a camelCase id
      derived from the edge's `relation` label via `toCamelCaseId()` (e.g. "issued by" → `issuedBy`,
      unicode-letter-aware word splitting) — the list structure means two edges deriving the *same*
      camelCase name just become two distinct list entries, not a collision to resolve.
- [x] `rules:` / `actions:` — per spec §4.3 shapes, keyed by name; an action's `inputClassId`/
      `preconditions` (rule ids) resolve to the current class label / rule names at export time, and
      degrade to `null` / a filtered (non-crashing) list if a referenced node or rule is somehow gone by
      the time of export (defensive — in practice `deleteNode()`/`deleteRule()` already keep these
      references clean, per Phase D/E's own decisions)
- [x] No group/`contains`-edge special-casing needed — Groups were removed from the base app entirely
      (Open Question 4, resolved by elimination; see base app's `spec.md` Decision Log #11)
- Tests (`tests/agent-ontology-phase-f.spec.mjs`, 10 new tests, all green): exported YAML matches the
  howto's own worked example shape exactly, byte-for-byte, when fed an equivalent graph; a graph with no
  classes/relationships/rules/actions filled in still exports valid, minimal YAML; two edges whose
  relation labels derive the same camelCase name both survive as distinct list entries rather than one
  overwriting the other; property export includes `type` always and `unit`/`allowed` only when actually
  set (including the empty-`allowed`-array case, which must omit the key rather than emit an empty
  list); class/edge `meaning` renders as the literal `null` when unset and as real text when set;
  YAML-significant characters (colon, hash, quotes, newline) in a label/meaning/alias get double-quoted
  and escaped while plain-safe scalars stay bare for readability; `toCamelCaseId()` handles multi-word,
  single-word, and punctuation-heavy relation labels; an action whose input class was deleted (via a
  real Delete keypress, not a hand-simulated stale reference) exports `input: null` rather than a
  dangling id; Save Version bundles the YAML as a third download named per the versioned filename
  convention, alongside JSON/TXT; the YAML addition doesn't change JSON/TXT content or shape (and
  confirms no stale `auto` field leaking through from the removed Groups feature).

## Phase G — Import (YAML → canvas) ✅ done

- [x] Hand-written parser (`parseDomainYamlImport()`, built on `parseYamlBlock()`/`splitYamlKeyValue()`/
      `parseYamlValueToken()`) for exactly the block-style YAML subset `buildDomainYamlExport()` can
      produce — symmetric to the existing TXT import (`spec.md` §5.3), not a general YAML parser.
      Malformed/truncated input degrades gracefully (missing pieces default to empty) rather than
      throwing, matching `parseTxtImport()`'s own skip-don't-crash discipline.
- [x] **Merge/replace semantics resolved** (was the one flagged open question): reuses the exact same
      two-mode dialog/UX as TXT import — no new confirmation flow — but deliberately more aggressive:
      a matched class/relationship/rule/action is overwritten wholesale with the file's values on both
      Merge and Replace (not left untouched like TXT's node/edge merge); only Replace additionally
      removes anything the file doesn't mention. See `agent_ontology_spec.md` §11/Decision #10 and the
      dated Log entry below for the full rationale.
- [x] Entry point: the existing "Import from TXT" button/file-input/drag-drop, relabeled **"Import"**
      (both languages) and widened to recognize `.yaml`/`.yml` (routes to the new importer) vs.
      everything else including `.txt` (routes to the existing, unchanged TXT importer) — no new toolbar
      button, matching the export side's own "minimize new UI surface" precedent.
- [x] Matching rules: classes/rules/actions by label/name exactly; relationships by
      `(endpoint labels, toCamelCaseId(edge.relation) === entry.name)` — a match's `relation` text is
      itself normalized to the imported literal name, an honest consequence of the export only ever
      storing the derived camelCase name, not the original human phrasing.
- [x] Commit order is fixed (classes, rules, relationships, actions) regardless of the file's own section
      order, since relationships/actions reference classes/rules by label/name; a dangling reference
      (to a class/rule declared nowhere in the file and not already on canvas) is skipped defensively,
      not treated as an error.
- [x] **Found and fixed a real bug while implementing this, not a pre-existing one:** `toCamelCaseId()`
      (Phase F) wasn't idempotent — re-deriving from an already-camelCase string like `"issuedBy"`
      lowercased the whole thing to `"issuedby"` instead of reproducing it, because the word-splitter
      only split on non-letter/digit separators, not on camelCase's own lowercase→uppercase boundaries.
      Since a matched relationship's `relation` text gets normalized to the imported name on import, a
      *second* import of the same file recomputed `toCamelCaseId()` against that now-already-camelCase
      text, got a different (over-lowercased) result, and silently created a duplicate edge instead of
      recognizing its own prior normalization. Fixed by also splitting on camelCase boundaries before the
      existing separator-based split, making the function idempotent for realistic input; added a direct
      regression test in `tests/agent-ontology-phase-f.spec.mjs` for `toCamelCaseId()` itself, not just
      the import behavior that surfaced it.
- Tests (`tests/agent-ontology-phase-g.spec.mjs`, 15 tests, all green): a full worked-example YAML
  imports classes/relationships/rules/actions correctly on an empty graph; re-importing the identical
  file is idempotent (no duplicates — this is the test that caught the `toCamelCaseId()` bug above);
  Merge overwrites a matched class's meaning/aliases/properties wholesale rather than field-by-field;
  Merge never removes an unmatched class/rule/action; Replace removes everything absent from the file in
  exactly one undo step, fully reversible; a matched relationship's meaning is overwritten and its
  relation label normalized to the imported name; a relationship referencing an undeclared class is
  skipped without crashing; the Replace button hides on an empty graph; Cancel applies nothing; commit
  order resolves references correctly regardless of the file's own section order (actions/relationships
  declared *before* classes/rules in the raw text); unicode and quoted-scalar class names/meanings
  survive an export-then-reimport round trip; malformed/truncated/garbage YAML degrades gracefully;
  both `.yaml` and `.yml` extensions route to the domain importer; the diff-summary counts match what
  actually happens on commit, including the "0 added / N changed" case after a full prior import.

## Phase H — Localization ✅ done

Scope turned out small: Phase F added zero new UI strings at all (bundled into the existing Save Version
action, no new toolbar button or dialog). Phase G added exactly three — the relabeled `importButton`
("Import from TXT" → "Import," since the button now handles two formats) and the two new YAML-import
summary strings (`importYamlMergeSummary`/`importYamlReplaceSummary`) — all three already given `en`/`hu`
entries as part of Phase G's own implementation, following the existing `STRINGS` pattern exactly. This
phase's remaining work was verification, not new string-writing:

- [x] Every new/changed string has both `en` and `hu` entries (verified — done during Phase G itself)
- [x] Language toggle correctly re-renders the new surfaces — added a dedicated test for the YAML import
      summary specifically (the one new surface that didn't already have language-toggle coverage; the
      relabeled Import button's own toggle behavior was already exercised by the existing "toggling the
      language switches all static toolbar/dialog text" test in `tests/localization.spec.mjs`, just
      updated to expect "Import" instead of "Import from TXT")
- Tests (`tests/localization.spec.mjs`, 13 → 14 tests): new test asserts the Domain Model YAML import
  summary's "N item(s) would be added, M existing item(s) would be updated" phrasing translates correctly
  with interpolated counts, in both languages, mirroring the existing TXT-import-summary translation test
  right next to it.

## Phase I — Regression pass, docs, PR ✅ done

- [x] Full suite green (base app's existing tests + all new Agent Ontology tests), run twice
      consecutively per this project's established convention
- [x] **A new cross-phase integration test**, per the user's standing "keep adding test coverage" request:
      every prior phase's own test file exercises its slice in isolation; nothing until now exercised
      Phases A through H *together* in one realistic session, the same "integration bugs only surface in
      combination" rationale `tests/end-to-end-workflow.spec.mjs` uses for the base app. Added
      `tests/agent-ontology-end-to-end.spec.mjs`: two classes authored with meaning/aliases/properties via
      the Details dialog, connected by a relationship with its own meaning, a rule and an action
      referencing each other and a class, Save Version (verifying all three exported files' actual
      content, not just their count), undo/redo across the domain-model save, a full reload proving every
      new field across every collection survives Tier 1 persistence *together* (not just individually, as
      each phase's own tests already prove), simulated hand-edit drift on a class's meaning, a YAML
      re-import of the earlier export that aggressively overwrites the drift back to the exported value
      (Phase G's semantics, exercised against a real multi-collection graph rather than a minimal
      fixture), and finally Clear + Undo restoring the fully-reconciled graph exactly. Ran 4 times
      consecutively on its own (not just as part of the full-suite runs below) given its length and
      realistic-session complexity — stable every time, no flake.
- [x] `agent_ontology_todo.md` "Current State" updated to reflect what shipped
- [x] Commit/push on `agent_ontology`; PR opened (matching the pattern every prior phase in this
      initiative has followed)

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
- 2026-07-26 — Phase A's PR merged; user said to continue. Implemented Phase B (Class editor UI) and,
  since the spec always described it as one shared dialog rather than two separate ones, Phase C
  (Relationship editor UI) came along for free — see both phases' checklists above for the full
  breakdown. New `#sel-details` icon in `#sel-toolbar`; new `#details-overlay` modal (Meaning textarea
  always, Aliases/Properties sections shown for nodes and hidden for edges); `createPropertyRow()`/
  `createAliasRow()` build the repeatable form rows; `saveDetailsDialog()` commits everything as one
  `pushHistory()` step, skipping the push entirely when nothing actually changed (matching the existing
  rename flow's own no-op discipline); the global keydown handler gained a `detailsEditingTarget` guard
  so Escape closes the dialog and — more importantly — Delete/Backspace while typing in the dialog's own
  fields no longer falls through to the canvas-level delete-selection shortcut.
  Caught and fixed a real CSS layout bug via screenshot before it ever reached a test: the first
  property-row draft was one flat 5-cell flex row, which doesn't fit this dialog's width and wraps —
  but flex-wrap wraps a row's own children individually, so the remove button (and sometimes the
  allowed-values field) landed on what visually read as a separate, ownerless row. Restructured each
  property into a deliberate two-line card instead of relying on wrap; reconfirmed clean in both themes.
  Also surfaced a real, narrow, pre-existing interaction hazard in the *base app*, not an Agent Ontology
  bug: widening `#sel-toolbar` from 3 icons to 4 was enough to make the floating selection toolbar (which
  `setMode()` never hides — it only clears `connectSource`, not `state.selection`) reach over a nearby
  node's own click point. This broke `tests/end-to-end-workflow.spec.mjs` (a base-app test, unrelated to
  this branch's own feature) by covering Alice's center point with the toolbar left over from the
  previous edge's selection, right as the test tried to arm connect-mode's second parallel edge.
  Confirmed via `git stash` A/B testing that this was a genuine regression, not pre-existing flakiness.
  Fixed at the right level — the shared `createEdgeViaConnectMode` test helper in `tests/lib/page.mjs`
  (used by many spec files, not just this branch's) now clears selection and waits for the toolbar to
  actually hide (the same render-loop dirty-flag timing race documented next to its other occurrence in
  `parallel-edges.spec.mjs`) before arming connect mode — rather than papering over it by tweaking one
  test's node-spacing coordinates, which would've left the same hazard latent for the next test or the
  next icon this toolbar gains.
  New `tests/agent-ontology-phase-b.spec.mjs` (15 tests) covers Phase B/C together. Full suite green
  twice consecutively: 301 JS tests (286 + 15 new) and 15 Python tests. PR opened; waiting for merge
  before starting Phase D, per the same wait-for-merge instruction as Phase A.
- 2026-07-28 — Phase B/C's PR merged; user said "go." Implemented Phase D (Rules manager) and, since
  `agent_ontology_spec.md` §7 always described Rules and Actions as one shared "Domain Model" modal
  rather than two separate toolbar entries, Phase E (Actions manager) came along in the same pass —
  same pattern as Phase C folding into B. New `#btn-domain-model` toolbar button (the only new
  top-level button this whole initiative adds, per spec Decision #5); new `#domain-model-overlay`
  modal with two sections (Rules: name + ordered free-text conditions; Actions: name + input-class
  dropdown + preconditions multi-select + effect + verification), whole-dialog draft-then-commit on
  Save exactly like the Phase B/C details dialog — nothing here mutates `state.rules`/`state.actions`
  live, only on an explicit Save, as one undo step.
  The two decisions both phases' checklists flagged as needing a call: **deleting a rule referenced by
  an action's precondition** — dropped silently (both inside the modal's save-time filtering and at the
  `deleteRule()` primitive itself, extended to scrub the reference, mirroring `deleteNode()`'s existing
  `groups[]` cleanup) — and **deleting a class referenced as an action's input** — `inputClassId` nulled
  rather than the action deleted, since effect/verification/preconditions text stays meaningful without
  an input class and the dropdown already models "unset" via its blank option. Both decisions follow the
  same reasoning Phase A originally gave for storing these references by id rather than name: making a
  rename/delete a non-catastrophic, silent cleanup rather than something that needs to block or cascade.
  Real implementation complexity, not just wiring: actions can reference rules added in the *same* still
  -open editing session before either has a real id yet (both are DOM-only drafts until Save), handled
  via `draft_`-prefixed placeholder ids and a draftId→realId map built at save time; and a rule's
  precondition *options* inside every action's `<select multiple>` have to stay live-synced as rules are
  added, renamed, or removed while the dialog is still open — not just refreshed once on open — since a
  user plausibly writes a rule, then references it from an action, all in one sitting.
  New `tests/agent-ontology-phase-d.spec.mjs` (13 tests, covering D and E together) — including one
  that specifically proves the live-select-option-sync above by checking option count *before* saving,
  not just the final saved state. Full suite green twice consecutively: 314 JS tests (301 + 13 new) and
  15 Python tests. PR opened; waiting for merge before starting Phase F, per the same instruction as
  Phase A/B.
- 2026-07-28 — Phase D/E's PR merged; user said "go" to continue toward Phase F. Before implementing,
  raised the two design questions Phase F's export actually needs answered (`agent_ontology_spec.md` §9
  Open Questions 3 and 4): how to handle relationship-name collisions in the YAML export, and whether a
  group's `contains` edges should export as class-hierarchy relationships. User resolved both, and the
  second answer went well beyond the question asked: (1) for relationship-key collisions — switch
  `relationships` to a **list** of `{name, from, to, meaning}` objects instead of a name-keyed map,
  eliminating the collision-naming problem entirely rather than picking a disambiguation scheme; (2) for
  groups — **remove Groups from the app altogether, UI and data model both, not just exclude them from
  this export** ("Stick to the ontology spec"). Scope of (2) is a base-app change, not an Agent Ontology
  one: the "Add Group" toolbar button and placement mode, drag-into-group membership, rigid-body group
  move, group resize, `type`/`groups[]`/`boundary_mode` on nodes, `auto` on edges, the TXT/JSON
  `[group]`/`contains` syntax, and the Python reference loader's group parsing. Asked whether this should
  be its own dedicated phase/PR ahead of Phase F or folded into Phase F itself; user chose a separate
  phase first, then said to plan and implement it immediately in the same session rather than waiting for
  further confirmation. Implemented as a base-app change on its own branch/PR — not tracked as a
  numbered phase in this file, since it isn't an Agent Ontology feature, but logged here because it
  directly unblocks and simplifies Phase F (see the base app's own `TODO.md` Log and `spec.md` Decision
  Log #11 for the full account: what was removed, the full list of touched files, and the historical
  Decision Log entries it reverses). Net effect on this initiative: Phase F's `relationships:` export is
  now simpler on both fronts than the spec originally described — a list, and no group/`contains`-edge
  special-casing to write at all.
- 2026-07-28 — Groups-removal PR merged; user said to go ahead with Phase F and to add more tests along
  the way "to stabilize." Before implementing, found and fixed two things left inconsistent by the
  previous session's design-question resolution: `agent_ontology_spec.md` §5's own YAML example and
  "Generation rules" text still showed the *old* map-keyed-with-collision-suffix `relationships` shape
  (Open Question 3 was resolved in conversation and in this file's own Log/Phase-F-checklist, but the
  spec document itself was never actually updated to match) — rewritten to the list shape, block-style
  arrays throughout (matching a fresh design decision made while implementing: the serializer supports
  exactly one style, block, never inline `[a, b, c]`/`{k: v}` flow syntax, to keep the "minimal, no
  flow-style" implementation genuinely single-path rather than needing a per-value style decision) —
  and Open Question 3 itself marked resolved with a new Decision Log entry (#9), matching how Open
  Question 4/Groups was already handled.
  Implemented Phase F in full: `yamlScalar()`/`yamlLines()`/`toYaml()` (a general-purpose, block-style-
  only recursive serializer for plain JS values — objects/arrays/scalars — not special-cased per section,
  so classes/relationships/rules/actions all go through the same code path), `toCamelCaseId()` (unicode-
  letter-aware word splitting, e.g. "issued by" → `issuedBy`), and `buildDomainModel()`/
  `buildDomainYamlExport()` reshaping `state` into the spec's structure. Wired into `performSaveVersion()`
  as a third file (`.domain.yaml`) in both the Tier 3 download branch and the Tier 2 folder-write branch,
  with the same fallback-to-download-on-write-failure behavior the JSON/TXT files already had. Also
  caught and fixed one small piece of leftover Groups-removal debt while in this code: `buildJsonExport()`
  still spread `auto: e.auto` into every exported edge — harmless (always `undefined`, silently dropped
  by `JSON.stringify`) but dead, confusing code from before Groups were removed; deleted.
  Manually verified the exact worked-example shape via a scratch script before writing it into the test
  suite (byte-for-byte match against the howto's own compact example), then checked edge cases the same
  way: empty graph, unicode/quote/colon/hash/newline-containing labels and meanings, and two edges whose
  relation labels derive the same camelCase name (confirms the list-not-map decision actually holds under
  the exact scenario it was chosen to avoid — both survive as distinct entries, no silent overwrite).
  Per the user's explicit "add more tests to stabilize" request, went beyond just covering Phase F's own
  new code: added `tests/agent-ontology-phase-f.spec.mjs` (10 tests covering all of the above, including
  Save Version's three-download bundling and a check that the YAML addition doesn't perturb JSON/TXT
  content) and updated every existing test that hard-coded a two-download assumption from Save Version
  now that there are three — `tests/phase5.spec.mjs` (6 `downloads.length` assertions, 2→3 and 4→6) and
  `tests/phase7.spec.mjs` (Tier 2 folder-write equivalents: `filenames.length` 2→3, plus 3 more
  `downloads.length` assertions in its Tier-2-failure-falls-back-to-Tier-3 tests).
  Full suite green: `node --test tests/*.spec.mjs` (264 tests) run three times consecutively (one run hit
  a single unrelated flake in `tests/ui-polish.spec.mjs` — a visual/theme test that passed cleanly both
  standalone and on the next full-suite run, consistent with resource contention across many parallel
  browser instances rather than a real regression from this phase's changes) and
  `python3 -m unittest discover -s tools -p "test_*.py"` (11 tests, untouched by this phase — YAML export
  is JS-only), all green.
- 2026-07-28 — Phase F's PR merged; user said to go ahead with the next phase, and added a standing
  instruction to keep adding test coverage along the way in future phases too, not just when a phase's
  own scope specifically calls for it. Started Phase G (Import). Its checklist flagged one real open
  design question up front: merge/replace semantics for a Domain Model YAML import, given it describes
  classes/relationships/rules/actions rather than simple nodes/edges. Offered two options via
  `AskUserQuestion` (reuse TXT-import's existing "never touch a match" semantics vs. a field-level
  partial-merge for classes); the user dismissed that prompt and instead said directly: reuse the
  existing TXT-import mechanism/UX, but be aggressive — matched entries can be overwritten. This is
  actually simpler than either option originally offered (no field-by-field partial-merge logic needed)
  — confirmed the interpretation in one sentence and proceeded rather than re-prompting.
  Implemented Phase G in full — see its own checklist above for the complete breakdown. Highlights not
  already covered there: `parseYamlBlock()` is one general recursive parser (mirroring `yamlLines()` in
  reverse) rather than four separate hard-coded per-section parsers, since properties-within-classes and
  the relationships list both need real nested-structure parsing anyway, so a shared engine pays for
  itself; the one special case is a list item that's itself a mapping (`- name: ...` relationship
  entries), where the first key shares the dash's own line. `commitYamlImport()` processes classes, then
  rules, then relationships, then actions in that **fixed** order regardless of the source file's actual
  section order, specifically so forward references (an action declared before its input class, etc.)
  resolve correctly — verified with a dedicated test that deliberately writes the sections in a
  scrambled, unrealistic order.
  Found and fixed a real bug during this phase, not a pre-existing one: `toCamelCaseId()` (Phase F) is
  not idempotent by construction, and Phase G's own aggressive-overwrite import normalizes a matched
  edge's relation text to the imported camelCase name — so a second import recomputing
  `toCamelCaseId()` against that already-normalized text got a different, over-lowercased result
  (`"issuedBy"` → `"issuedby"`) and silently created a duplicate edge instead of recognizing its own
  prior normalization. Caught by the idempotent-re-import test, not by inspection. Fixed by also
  splitting on camelCase's own lowercase→uppercase boundaries before the existing separator-based word
  split; added a direct unit-level regression test for `toCamelCaseId()` itself in
  `tests/agent-ontology-phase-f.spec.mjs` (not just the import-level symptom) so a future change to that
  function can't silently reintroduce the same class of bug.
  Also renamed the "Import from TXT" button to "Import" (both languages) since it now recognizes two
  file formats by extension, and fixed the one pre-existing test that hard-coded the old label
  (`tests/localization.spec.mjs`).
  Folded Phase H (Localization) into the same pass, per the user's "always add test coverage" standing
  instruction and because its actual scope turned out tiny: Phase F added no new UI strings at all, and
  Phase G added exactly three (`importButton`, `importYamlMergeSummary`, `importYamlReplaceSummary`),
  all already given `en`/`hu` entries as part of Phase G's own implementation. Phase H's remaining work
  was a verification pass — added one new test asserting the YAML import summary's interpolated counts
  translate correctly in both languages (the one new surface that didn't already have language-toggle
  coverage from Phase G's own tests).
  Full suite green twice consecutively: `node --test tests/*.spec.mjs` (281 tests — 264 + 15 in
  `tests/agent-ontology-phase-g.spec.mjs` + 1 in `tests/agent-ontology-phase-f.spec.mjs` (the
  `toCamelCaseId()` regression) + 1 in `tests/localization.spec.mjs`) and
  `python3 -m unittest discover -s tools -p "test_*.py"` (11 tests, untouched — Phase G's import is
  JS-only), all green.
- 2026-07-28 — Phase G/H's PR merged; user said "ok, next phase," repeating the standing "add some more
  test coverage on the way" instruction from the previous round. Phase I is explicitly a wrap-up phase
  (regression pass, docs, PR) rather than new feature work, so the coverage-add for this round took the
  form of the one thing genuinely missing across the whole initiative: every phase's own test file
  exercises its slice in isolation (Phase A's data model, Phase B/C's details dialog, Phase D/E's rules/
  actions modal, Phase F's export, Phase G's import), but nothing exercised Phases A through H *together*
  in one realistic session — the same gap `tests/end-to-end-workflow.spec.mjs` fills for the base app,
  never mirrored for the Agent Ontology layer specifically. Added
  `tests/agent-ontology-end-to-end.spec.mjs` (1 long test, not many small ones, matching that file's own
  precedent): two classes authored through the real Details dialog UI with meaning/aliases/properties, a
  relationship connected and given its own meaning the same way, a rule and action created through the
  real Domain Model modal UI referencing each other and a class, Save Version with assertions against the
  *actual content* of all three exported files (not just that three downloads happened — phase5/phase-f's
  own tests already cover that mechanically), undo/redo across the domain-model save, a full reload
  proving meaning/aliases/properties/relationship-meaning/rules/actions all survive Tier 1 persistence
  *together* in one graph (each is proven individually elsewhere, but never all at once), simulated
  hand-edit drift on a class's meaning after the reload, a YAML re-import of the earlier export
  aggressively overwriting that drift back to the exported value (Phase G's semantics, exercised against
  a real multi-collection graph rather than a minimal fixture), and finally Clear + Undo restoring the
  fully-reconciled graph exactly. Ran standalone 4 times consecutively given its length before folding it
  into the full-suite runs, to rule out flakiness specific to a long realistic session — stable every
  time.
  Full suite green twice consecutively: `node --test tests/*.spec.mjs` (282 tests — 281 + 1) and
  `python3 -m unittest discover -s tools -p "test_*.py"` (11 tests, untouched), all green. This closes out
  the Agent Ontology initiative as originally planned (Phases A through I) — see the "Current State"
  section above for the final summary and what, if anything, would come next.
- 2026-07-28 — Asked what critical areas could most benefit from more test coverage now that the
  initiative was closed. Answered with four concrete, verified gaps rather than speculating: no stress/
  scale test existed for the Domain Model YAML export/import path at all (every other big feature in this
  codebase has one); `toCamelCaseId()`'s consecutive-uppercase-letter limitation, found while fixing its
  idempotency bug in Phase G, was undocumented and untested; the Domain Model modal's rule/action UI had
  never been exercised at more than 2-3 entries; and Phase 10 (manual cross-platform verification) is
  real but can't be automated. User said to implement the first three, and separately to make the Rules
  UI itself "work well and look well," plus add end-to-end tests for longer chains of actions.
  **Rules UI fix, not just polish:** screenshotted the Domain Model dialog in both themes before touching
  anything (a filled-in Effect input and a filled-in Verification input are two plain text boxes with no
  persistent label — once typed into, the field's own placeholder text vanishes, so there was no way to
  tell which was which at a glance; same gap for the Preconditions multi-select and the input-class
  select). Added a `.details-field-sublabel` style (a smaller, more muted variant of the existing
  `.details-field-label` used for the dialog's top-level Meaning/Aliases/Properties/Rules/Actions
  headings) and a small `createSublabel()` helper, wired into `createRuleCard()` (a "Conditions" label)
  and `createActionCard()` ("Input class," "Preconditions (hold Ctrl/Cmd to select multiple)," "Effect,"
  "Verification"). New `en`/`hu` strings for all five, following the existing per-card (not live-
  retranslated while the dialog stays open) placeholder-text precedent rather than inventing a new one.
  Re-screenshotted to confirm the fix in both themes before writing the confirming test.
  **Coverage additions**, one per identified gap: (1) `tests/agent-ontology-phase-g.spec.mjs` gained a
  150-class/100-relationship/50-rule/50-action export-then-fresh-reimport round-trip test, completing in
  well under a second — proves the recursive `yamlLines()`/`parseYamlBlock()` pair doesn't degrade at a
  size closer to a real generated domain model. (2) `toCamelCaseId()` got a code comment documenting the
  consecutive-uppercase-letters limitation precisely (re-deriving from an already-camelCase string with a
  run of 2+ capitals, e.g. from back-to-back single-letter words, can lowercase part of that run on a
  *second* derivation — verified by direct execution before writing the comment, not just reasoned about)
  plus a pinning test in `tests/agent-ontology-phase-f.spec.mjs` asserting the exact (imperfect but
  stable-after-one-step) behavior, so a future change can't silently regress it further without a test
  failing. (3) `tests/agent-ontology-phase-d.spec.mjs` gained a 25-rule/25-action stress test built
  through the *real* UI (not a data-layer bypass) — found no bugs, `refreshActionPreconditionOptions()`'s
  live-sync rebuild held up correctly at scale, including verifying every action's option count drops
  together, immediately, when a rule is removed mid-session. (4) Also added a direct test for the new
  sublabels in the same file.
  **Longer-chains end-to-end test:** added a second, differently-focused long test to
  `tests/agent-ontology-end-to-end.spec.mjs` (the Phase I integration-test file — a chain-of-rules-and-
  actions scenario is a variant of "cross-phase integration," not a new category, so it lives alongside
  the original session-based test rather than in its own file): a 4-stage invoice approval workflow
  (submit → match → approve → pay) built through the real Domain Model UI, with the approve stage gated
  on *two* preconditions at once (a genuine longer-chain reference pattern no single-rule test elsewhere
  exercises), verified through Save, a Save Version export (checking the exported YAML reads as one
  coherent chain, not four disconnected fragments), a mid-chain rule deletion through the real UI
  (confirming the dangling reference is scrubbed from both places that pointed to it, without disturbing
  unrelated stages), and undo restoring the entire chain — including both cleanup effects — as the one
  undo step a dialog Save always is. Ran standalone 4 times to confirm no flakiness, matching the
  convention set for the original end-to-end test.
  Full suite green twice consecutively: `node --test tests/*.spec.mjs` (287 tests — 282 + 5) and
  `python3 -m unittest discover -s tools -p "test_*.py"` (11 tests, untouched — everything here is
  JS-only), all green.
