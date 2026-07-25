# TODO — Knowledge Graph Canvas

Progress tracker for the project defined in `spec.md`. Keep this file up to
date as work happens: check items off, add notes under "Log / Decisions"
when something deviates from spec or gets clarified, and update "Current
State" so the project can be picked up cold at any time.

---

## Current State

- **Phase:** Phases 0, 1, 2, and 3 complete, all with green automated test
  suites (`node --test tests/*.spec.mjs`, 69 tests, see Log below). Not yet
  hand-tested on real touch hardware (pinch/long-press) — deferred to
  Phase 10, not blocking. Phase 4 not started.
- **Target file:** `index.html` (single file, no external deps/CDN links).
  Dev-only test tooling lives in `tests/` (see `tests/README.md`) and never
  ships as part of the app.
- **Next action:** Phase 4 (Tier 1 storage — every edit auto-saved to OPFS
  in the background, restored on load for crash/dropped-tab recovery).

---

## How to resume this project

1. Read `spec.md` in full (it is the single source of truth; this TODO only
   tracks execution order and status).
2. Read "Current State" above and "Log / Decisions" below for anything that
   overrides or clarifies the spec.
3. Open the target HTML file (once it exists) and check which of the phase
   checkboxes below are actually done by inspecting the code — do not trust
   a checked box blindly if the code looks incomplete.
4. Continue with the first unchecked item.

No build step, no dependencies, no test framework mandated by the spec for
the *app itself* — `index.html` stays a single dependency-free file no
matter what. Verification tooling is a separate, dev-only concern; see
"Testing Strategy" below for how each phase gets checked before its boxes
are ticked.

---

## Testing Strategy

Two tiers, used together on every phase. Automated tests catch regressions
fast and cheaply; manual checks cover what this sandbox can't reach (real
touch hardware, OS-native file/save dialogs, actual cross-browser installs).

**Tier A — Automated (`tests/`, headless Chromium via Playwright).**

- One spec file per phase: `tests/phase0.spec.mjs`, `tests/phase1.spec.mjs`,
  etc., run with Node's built-in test runner — `node --test tests/*.spec.mjs`
  — no extra test-framework dependency beyond Playwright itself. See
  `tests/README.md` for setup.
- Drives the real UI: dispatches pointer/keyboard/wheel events at
  `index.html` loaded via `file://`, same as a user would — not just
  calling internal functions directly.
- Asserts against `window.__kg`, a small debug/test-only hook the app
  exposes (current `state`, `camera`, and the same action functions the
  UI's own handlers call). This is additive introspection over state that
  already exists for the app's own operation — never a new runtime
  dependency, and `index.html` works identically whether or not anything
  reads it.
- Every test also fails on any console error or page error observed during
  the run, independent of its explicit assertions.
- Environment-dependent (needs Playwright + a Chromium binary), so treat it
  as a strong nice-to-have that should be run and kept green whenever the
  environment supports it, not a hard gate that blocks marking a phase
  done — consistent with "verification is manual unless otherwise stated."

**Tier B — Manual checklist (the required minimum).**

- Whatever Tier A structurally cannot exercise here: real multi-touch
  pinch/long-press, native save/open file dialogs (Tier 2/3 flows), and all
  of Phase 10's cross-browser/cross-device matrix.
- Each phase below has its own "Tests:" sub-bullets listing concrete Tier A
  + Tier B checks scoped to what that phase actually adds — do both before
  checking a phase's boxes complete, not a separate monolithic test plan at
  the end.

---

## Working across environments (CLI vs claude.ai/code)

This project gets worked on from two different Claude Code environments —
the local/CLI one and the web-based claude.ai/code one — sometimes in the
same day. **The GitHub repo (`solalatus/ontology_builder`, `main` branch) is
the only source of truth between them.** Neither environment's local working
directory persists or is shared with the other — each session starts from
whatever is on `origin/main`.

Rules to avoid confusion:

- **Before switching environments:** commit and push whatever you were doing
  in the one you're leaving (git itself is handled by the user, not by
  Claude — see below). An environment switch with uncommitted local changes
  means those changes are invisible to the other environment.
- **After switching environments:** pull `origin/main` first, then re-read
  this TODO.md's "Current State" section before doing anything else — it
  may have been updated by the other environment.
- **This file is the handoff mechanism.** Keep "Current State" accurate and
  commit it along with any code change, so whichever environment opens the
  repo next — CLI or web — sees the same picture.
- **Git operations in the CLI environment are handled by the user, not
  Claude**, for this project (confirmed 2026-07-25) — Claude should edit
  files but leave staging/commit/push to the user here. Whether the same
  holds in claude.ai/code is a separate call the user makes there.

**Do not confuse this with the app's own storage tiers (spec Section 3.2).**
"Tier 1 / Tier 2 / Tier 3" in `spec.md` describe how the *Knowledge Graph
Canvas app itself* persists a user's graph data at runtime (OPFS, folder
sync, export files) — that's a feature being built. It has nothing to do
with how the *source code of this project* is synced between the CLI and
claude.ai/code, which is plain git via GitHub as described above.

---

## Phase 0 — Scaffold

- [x] Create single HTML file with inlined `<style>` and `<script>` blocks
      (no external files, no CDN links — spec Section 2)
- [x] Canvas2D setup with camera transform (pan offset + zoom scale) —
      Section 6
- [x] Basic render loop: dirty-flag driven `requestAnimationFrame`, not a
      constant loop — Section 6
- [x] Empty-state UI shell: button bar per Section 7 (Add Node, Connect,
      Auto-layout, Undo, Redo, Save Version, Import from TXT, zoom +/−)
- Tests (`tests/phase0.spec.mjs`, 5 tests, all green):
  - Automated: page loads with zero console/page errors and `camera` at
    identity; drag-pan, wheel-zoom (cursor over canvas), and the +/−
    buttons each change `window.__kg.camera` as expected; window resize
    keeps the canvas filling its container.
  - Manual (deferred to Phase 10 — needs real hardware): pinch-zoom and
    single-finger pan on an actual touch device.

## Phase 1 — Data model & core node/edge ops

- [x] Implement Node model (Section 4.1): id, label, type, x/y/w/h, groups[],
      boundary_mode, notes
- [x] Implement Edge model (Section 4.2): id, source, target, relation,
      directed, auto
- [x] Add node: double-tap empty canvas → inline name field; also via
      "Add Node" button → tap placement point
- [x] Move node: drag the box
- [x] Add edge: drag from node edge handle → relation label prompt; also via
      "Connect" mode toggle (tap source, tap target)
- [x] Toggle edge direction (directed ↔ bidirectional) via edge context menu
      — bidirectional renders as plain line, **no arrowheads either end**
- [x] Delete node/edge: select + delete key, or long-press → delete, or
      trash icon on selection
- Tests (`tests/phase1.spec.mjs`, 31 tests, all green — expanded from an
  initial 14 with a second, more extensive pass covering data-model shape
  and interaction edge cases):
  - Automated: dblclick-add and Add-Node-button-then-tap both create a node
    with the entered label/default size; dblclick on an existing node is a
    no-op (no duplicate); Add Node is one-shot (mode reverts after
    placement) and Escape-cancelable; dragging a node body moves it by the
    exact drag delta; dragging from a handle to another node and
    tap-tap in Connect mode both create a `directed:true` edge with the
    entered relation; Escape cancels a pending Connect-mode source;
    selecting an edge + the direction-toggle button flips `directed`;
    Delete key removes a selected node *and* its incident edges; the trash
    button removes a selected edge; long-press (>600ms, no movement)
    deletes a node, a short press does not; pre-existing pan behavior is
    unaffected (regression check). Extensive additions: full Node/Edge
    shape matches Section 4.1/4.2 exactly; ids are never reused after
    delete+recreate; empty-label submit and Escape-while-editing both
    create nothing; clicking empty canvas clears selection and hides the
    selection toolbar (and shows it on select); Backspace deletes same as
    Delete; trash icon also deletes a selected *node* (not just an edge);
    long-press also deletes a selected *edge*; Escape with nothing pending
    is a harmless no-op; Connect-mode self-tap and empty-canvas-tap both
    cancel a pending source instead of misbehaving; a handle-drag released
    on empty canvas or back on its own node creates no edge; two edges
    with different relations can coexist between the same node pair; a
    label with quotes/angle-brackets/ampersands round-trips intact;
    deleting a node also clears its selection/toolbar.
  - Manual (not exercised here — no touch hardware in this sandbox, defer
    to Phase 10): long-press timing/feel and inline-input UX on an actual
    touch screen; long node labels at extreme zoom levels.

## Phase 2 — Groups

- [x] Group node type + creation
- [x] Membership mechanic: drag smaller box into larger box, commit on drop
      (directional-by-action, never recomputed from later overlap) —
      Section 4.3, Decision #2
- [x] Auto-generate `contains` edge on membership (`auto: true`,
      `directed: true`) — not drawn as visible arrow, containment shown via
      nesting only
- [x] Remove from group: drag member fully outside group boundary
- [x] Support recursive membership (group belonging to another group) and
      overlapping membership (node in multiple groups)
- [x] `boundary_mode` always `"manual"` — group box independently resizable,
      never auto-fits to members — Decision #3
- Tests (`tests/phase2.spec.mjs`, 17 tests, all green):
  - Automated: "Add Group" creates a `type:"group"` node with the Section
    4.3 defaults (320×220, `boundary_mode:"manual"`, empty `groups[]`), is
    one-shot, and Escape-cancelable, mirroring Add Node. Dragging a smaller
    node fully into a group commits `groups[]` + creates exactly one
    `auto:true` `contains` edge; creating a node directly inside a group's
    boundary (no drag) does *not* auto-join; a drop that only *partially*
    overlaps neither commits a new membership nor removes an existing one;
    dragging a member fully outside removes membership + the edge; moving
    or resizing the *group* afterward never cascades into changing an
    already-committed member's membership; the resize-corner handle
    changes w/h by the exact drag delta and clamps at a minimum size;
    recursive nesting (a shrunk group dragged into a bigger one, then an
    entity dragged into that inner group) joins only the *innermost*
    container, never also the outer one; overlapping membership (one node
    in two separate groups) works via two sequential drags, with equal-area
    ties broken deterministically by creation order; deleting a group
    clears the field from any (former) member's `groups[]` and removes the
    edge; deleting a member leaves the group intact; a `contains` edge is
    never selectable by clicking near it (the click resolves to a node);
    hit-testing always picks the smallest/topmost box under the cursor
    regardless of which node was created first.
  - Manual: visual nesting reads correctly across zoom levels (spot-checked
    via screenshots this session, not exhaustively at every zoom level);
    confirm no arrow is ever drawn on canvas for a `contains` edge (also
    confirmed via screenshot).

## Phase 3 — Undo/redo

- [x] Command-pattern undo stack in memory
- [x] Every discrete action = one undo step: add, move, connect, delete,
      group, autolayout, TXT import (autolayout/TXT import don't exist yet
      — Phases 8/6 — so only add/move/connect/delete/group are wired so
      far; the history mechanism itself is generic and ready for them)
- [x] Undo/Redo buttons only, no dedicated gesture — Decision #8
- [x] Confirm: undo stack NOT persisted across reload (reload starts fresh
      from last saved state) — Section 8
- Tests (`tests/phase3.spec.mjs`, 16 tests, all green):
  - Automated: Undo/Redo buttons start disabled and correctly flip enabled/
    disabled as the stack fills/empties (checked via the real `disabled`
    DOM attribute, not just internal state); add node, add edge, toggle
    edge direction, delete node (incl. its incident edges), delete edge,
    move node, and resize a group each Undo to the exact prior state and
    Redo back — ids are preserved across both (never regenerated); a
    group-membership commit from a drag-in is exactly *one* combined undo
    step (not two), and undoing it clears both `groups[]` and the auto
    `contains` edge together; long-press delete is also exactly one step;
    performing a new action after an Undo discards the redo stack; Undo/
    Redo are genuinely inert with an empty stack (both via the disabled
    button being unclickable *and* via calling the underlying functions
    directly as a defensive check); several sequential adds are exactly
    that many undo steps; reloading the page always starts with an empty
    stack, confirming no persistence.
  - Manual: rapid alternating Undo/Redo clicks don't visibly desync the
    canvas from `state` (spot-checked via screenshots this session, not an
    extended stress pass).

## Phase 4 — Tier 1 storage (OPFS live engine)

- [ ] Every edit writes immediately to OPFS in background (add/move/connect/
      group/delete) — no prompts, no visible file
- [ ] On load: restore from OPFS if present (crash/dropped-tab recovery)
- [ ] Verify this works on all 4 target combos (OPFS is universally
      supported per Section 3.1 capability matrix)
- Tests (planned, `tests/phase4.spec.mjs`):
  - Automated: make an edit, `page.reload()` without any explicit save, and
    confirm `window.__kg.state` after reload matches pre-reload state
    (crash/dropped-tab recovery); confirm an OPFS write happens on every
    edit type, not just on an explicit save action.
  - Manual: spot-check on all 4 target browser/OS combos per the Section
    3.1 matrix — OPFS is claimed universal there, worth confirming directly
    at least once per platform.

## Phase 5 — File formats (export)

- [ ] JSON canonical export exactly per Section 5.1 schema (meta, nodes,
      edges — full fidelity incl. positions/sizes/group boundaries)
- [ ] TXT edge-list export exactly per Section 5.2 grammar (`## NODES`,
      `## EDGES`, `->` / `<->`, `[group]` suffix, comment header)
- [ ] Versioned filename convention (Section 5.4):
      `<graph-name>_v<0000>_<UTC-timestamp>.{json,txt}` — both written
      together on every "Save Version"
- [ ] Version number increments monotonically, stored in graph metadata,
      continuous across sessions
- Tests (planned, `tests/phase5.spec.mjs`):
  - Automated: build a small fixture graph via `window.__kg.actions`,
    trigger "Save Version", intercept the downloaded blob(s) (Playwright's
    `page.on('download', ...)`) and assert the JSON matches Section 5.1's
    schema exactly (round-trips through `JSON.parse`) and the TXT matches
    Section 5.2's grammar byte-for-byte for that fixture; filenames follow
    the `<graph-name>_v<0000>_<UTC-timestamp>.{json,txt}` convention;
    saving twice increments the version number monotonically.
  - Manual: confirm the files actually land on disk via the real
    browser-native save/download flow (Tier 3 baseline).

## Phase 6 — TXT import (Section 5.3)

- [ ] Reference Python-style loader logic ported to JS (parse `## NODES` /
      `## EDGES`, `[group]`, `->` vs `<->`)
- [ ] Merge mode (default): label+type matched; new nodes created and
      auto-placed (shelf/grid, flagged as new); existing nodes keep
      position/size/groups untouched; new edges added; missing edges left
      alone (never deleted); `X -> Y : contains` lines interpreted as group
      membership, not literal edges
- [ ] Replace mode: same diff, but removes nodes/edges absent from TXT;
      requires confirmation step showing diff summary (N added/removed/
      unchanged); one undo step regardless of size
- [ ] Triggered via "Import from TXT" button (native file-open dialog) and
      drag-and-drop of `.txt` onto canvas where supported
- Tests (planned, `tests/phase6.spec.mjs`):
  - Automated: a handful of fixture `.txt` files under `tests/fixtures/`
    covering — new nodes created + auto-placed; existing label matches
    keep position/size/groups untouched; new edges added; edges missing
    from the TXT left alone (merge is additive-only); `X -> Y : contains`
    lines become group membership, not literal edges. Separately: Replace
    mode removes graph-only nodes/edges, shows correct N-added/N-removed/
    N-unchanged diff counts, and both modes commit as exactly one undo
    step regardless of file size. Drive import via `page.setInputFiles()`
    on the hidden file input (no real OS file-picker needed for this part).
  - Manual: actual drag-and-drop of a `.txt` file onto the canvas in a real
    browser window; native file-open dialog path.

## Phase 7 — Tier 2 storage (live folder sync, progressive enhancement)

- [ ] Feature-detect `showDirectoryPicker` — offer opt-in only on Chrome/
      Windows and Chromium/Linux (NOT Brave, NOT Android — Section 3.1)
- [ ] On grant, explicit saves write silently into chosen folder, no further
      prompts
- [ ] Confirm app is fully functional with Tier 2 entirely absent (Brave/
      Android path never blocked)
- Tests (planned, `tests/phase7.spec.mjs`):
  - Automated: force `'showDirectoryPicker' in window` both true and false
    (headless Chromium won't have real user-gesture directory access
    either way, so this is a feature-detection/branch-coverage check, not
    a real grant/write test) and confirm the app offers/hides the opt-in
    accordingly and never throws when the API is absent.
  - Manual (required — this phase is fundamentally about real OS
    interaction): actual folder grant + silent write-back on Chrome/
    Windows and Chromium/Linux; confirm Brave/Linux and Chrome/Android
    never even offer Tier 2.

## Phase 8 — Autolayout

- [ ] Explicit "Auto-layout" button only, never automatic (Section 2, 8)
- [ ] Algorithm: implementation detail, not fixed by spec (force-directed /
      hierarchical / grid — pick one, document choice in Log below)
- [ ] Single undo step regardless of node count (one "before" snapshot of
      all positions)
- Tests (planned, `tests/phase8.spec.mjs`):
  - Automated: running autolayout on a fixture graph changes node
    positions but is exactly one undo step (Undo restores every node's
    pre-layout position in one action); doesn't crash/hang on disconnected
    components or floating groups.
  - Manual: visually sane result (no total node overlap) on a real fixture
    graph — layout aesthetics aren't something to assert numerically.

## Phase 9 — Scale & performance

- [ ] Viewport culling (draw/hit-test only what intersects visible camera
      rect) — Section 6
- [ ] Verify smooth 60fps drag/pan/zoom at ~1,000 synthetic nodes
- [ ] Confirm disconnected components / floating groups behave identically
      to connected graphs under pan/zoom/culling
- Tests (planned, `tests/phase9.spec.mjs`):
  - Automated: seed ~1,000 synthetic nodes via `window.__kg.actions`
    (bypassing the UI for setup speed), then assert `render()` stays under
    a rough frame-time budget and that viewport culling actually reduces
    draw/hit-test work when zoomed into a small region (e.g. instrument a
    counter, or compare timing zoomed-out vs zoomed-in) — a smoke check on
    the *shape* of the perf characteristic, not a strict benchmark/CI gate.
  - Manual: real-device feel (Chrome/Android in particular) with a large
    graph — headless timing doesn't substitute for actually dragging it.

## Phase 10 — Cross-platform verification

- [ ] Chrome / Windows — full Tier 2 path
- [ ] Chromium / Linux — full Tier 2 path
- [ ] Brave / Linux — confirm graceful Tier 3-only fallback, no broken UI
      from absent File System Access API
- [ ] Chrome / Android — touch gestures (pinch zoom, double-tap add,
      long-press delete, drag), Tier 3-only fallback
- Tests: manual only — this phase *is* the manual cross-platform matrix.
  Run the full Section 7 interaction table by hand on each of the 4 target
  browser/OS combos; this is also where every deferred Tier-B item from
  Phases 0–9 above (real touch pinch/long-press, native file dialogs, OPFS
  spot-checks, Tier 2 grant flow) finally gets exercised for real.

## Phase 11 — Polish / out-of-scope guardrails

- [ ] No feature creep into: real-time collaboration, concurrent multi-
      device merge, cloud sync, OWL/RDF reasoning/validation, multi-graph
      switcher (all explicitly out of scope — Section 10)
- [ ] Version retention: confirm no auto-pruning exists anywhere in code
      (Decision #7)
- Tests (planned): automated grep/read-through of `index.html` confirming
  no code path implements an out-of-scope feature (collaboration, cloud
  sync, OWL/RDF reasoning, multi-graph switcher) and no auto-pruning logic
  exists for version files; manual final read-through of `TODO.md` vs
  `spec.md` for drift before calling v1.0 done.

---

## Log / Decisions

*(Append dated entries here when something is clarified, changed, or
deviates from spec.md — keep spec.md itself as the frozen v1.0 reference
and record deltas here instead of editing the spec.)*

- 2026-07-25 — TODO.md created. No implementation code exists yet; only
  `spec.md` (v1.0, finalized) is committed. Repo: `solalatus/ontology_builder`
  on `main`, working tree clean at commit `a6091b4` ("initial commit").
- 2026-07-25 — Phase 0 (scaffold) implemented in `index.html`: single file,
  Canvas2D with a pan (screenX = worldX*scale + panX form) + zoom camera,
  dirty-flag `requestAnimationFrame` render loop (adaptive dot grid +
  empty-state message as placeholder render content), and the full Section 7
  toolbar. Pan via Pointer Events drag; zoom via wheel and touch pinch, plus
  the +/− toolbar buttons (all three paths call one `zoomAt()` that keeps the
  world point under the cursor/midpoint fixed). Only the zoom buttons and
  pan/zoom gestures are functionally real in this phase — Add Node, Connect,
  Auto-layout, Undo, Redo, Save Version, and Import from TXT are wired to a
  `notImplemented()` console-warn stub (Import from TXT additionally opens a
  real native file picker via a hidden `<input type=file accept=".txt">`, but
  only logs the picked filename — no parsing yet, that's Phase 6).
  Smoke-tested headlessly with Playwright/Chromium: zero console/page errors
  on load; drag-pan, the +/− toolbar buttons, and ctrl/plain wheel-zoom over
  the canvas each produce the expected pixel-level canvas change (verified by
  diffing screenshots, not eyeballing); window resize reflows the canvas
  correctly under the fixed toolbar. Pinch-zoom and touch pan share the same
  `zoomAt()`/pointer-drag code paths as the tested mouse/wheel paths but
  weren't separately exercised (no real touch device here) — confirm on an
  actual Android device in Phase 10.
- 2026-07-25 — Automated test infrastructure added under `tests/` (Node's
  built-in `node:test` + Playwright/headless Chromium; see the new "Testing
  Strategy" section above and `tests/README.md`). `index.html` now exposes
  a small `window.__kg` debug/test hook (state, camera, action functions) —
  additive only, app behavior is unchanged whether or not it's read.
  Retroactively wrote `tests/phase0.spec.mjs` (5 tests) for the existing
  Phase 0 scaffold; also wrote `tests/phase1.spec.mjs` (14 tests) alongside
  the Phase 1 implementation below. All 19 pass.
- 2026-07-25 — Phase 1 (data model & core node/edge ops) implemented in
  `index.html`. Notable implementation decisions, recorded here since they
  fill in gaps the spec leaves open rather than contradicting it:
  - **Inline `<input>` instead of native `prompt()`** for both node-label
    entry and edge-relation entry — one reusable `showInlineInput()`
    helper, Enter commits / Escape cancels / blur commits-if-non-empty.
    Chosen for consistent styling, and because it's DOM-testable (a real
    `prompt()` dialog is awkward to drive from Playwright and to skin).
  - **"Edge context menu" (spec Section 7 table) implemented as a floating
    selection toolbar**, not a right-click menu — right-click has no touch
    equivalent, and Section 2's "buttons are the primary control surface"
    principle favors an always-tappable affordance. Selecting a node shows
    a trash button; selecting an edge shows trash + a direction-toggle
    button. This single mechanism also satisfies the separate "trash icon
    on selection" line in the same table, rather than building two things.
  - **Add Node is one-shot**: clicking the button arms placement mode: the
    *next* canvas tap places exactly one node, then mode reverts to idle
    automatically (rather than staying armed until toggled off). Connect
    mode, per spec, *is* a sticky toggle (tap source, tap target, repeat).
  - **New default edge relation text is `"related to"`** if the inline
    input is submitted empty — spec doesn't specify a default; chosen so
    an empty-Enter still produces a valid, visibly-labeled edge.
  - **Pan is disabled while Add Node or Connect mode is armed** (tap-only
    during those modes) — keeps the interaction state machine simple and
    unambiguous; spec doesn't describe panning during these modes either
    way.
  - Edge relation labels are rendered on canvas at the edge midpoint —
    not explicitly required by Section 6/7, but without it there'd be no
    way to see a relation's label at all, so treated as a necessary part
    of "edge rendering" rather than scope creep.
  - `type: "group"` and the group `boundary_mode` field exist in the data
    model already (per Section 4.1), but nothing in Phase 1 creates a group
    node yet — group creation/membership behavior is entirely Phase 2's.
- 2026-07-25 — PR #1 (Phases 0+1) merged to `main` by the user. Restarted
  this branch from `origin/main` per the merged-PR protocol before starting
  Phase 2 (`git fetch origin main && git checkout -B
  claude/todo-first-step-44a4p1 origin/main`) — no unmerged work existed on
  the old branch tip, so this was a clean rebase-from-main, not a rebase of
  pending commits.
- 2026-07-25 — Phase 2 (Groups) implemented in `index.html`, plus an
  "extensive tests" pass requested by the user covering Phase 1 more
  thoroughly (14→31 tests) alongside the new Phase 2 suite (17 tests, 53
  total). Notable decisions:
  - **Added a corner resize handle for group nodes** (bottom-right corner,
    drag to resize, clamped to a `MIN_GROUP_SIZE` floor of 60). This is a
    deliberate, spec-motivated *addition* beyond Section 7's interaction
    table (which has no "resize" row at all): Section 4.3 explicitly says
    a group's box is "independently resizable," and — critically — since
    "Add Group" always creates the same 320×220 default size, two groups
    can *only* ever nest if one is resized smaller than the other first;
    without this, "recursive membership (group belonging to another
    group)," an explicit Phase 2 checklist item, would be structurally
    unreachable through the UI. Scoped to group nodes only (not entities),
    since Section 4.3's "resizable" language is specific to groups and
    nothing in the spec says the same about entities. Resizing a group
    intentionally does *not* trigger `updateGroupMembership` — consistent
    with Section 4.3's own example of "resizing the group box" as a case
    that must never auto-recompute membership.
  - **Added an "Add Group" toolbar button**, mirroring "Add Node" (one-shot
    placement mode, inline label input). Phase 0's button-bar checklist
    named a fixed set of buttons from Section 7's table, which has no
    dedicated group-creation row — but Section 4.3 requires groups to
    exist as a creatable node type, and per Section 2's own principle
    ("every core action reachable via an on-screen button"), a button is
    the right way to reach it. Considered folding group-vs-entity choice
    into the existing inline-input UI instead (e.g. a type toggle next to
    the text field); went with a separate button because it's simpler code
    and at least as discoverable.
  - **Membership commit/removal is evaluated only at the end of an actual
    drag** (movement past `MOVE_THRESHOLD`), never on a plain click/no-op
    press and never on node *creation* — otherwise merely clicking a node
    that happens to already sit inside a group's visual bounds (e.g. one
    created there directly) would silently join it, which is exactly the
    "recomputed from later overlap" behavior Decision #2 rules out.
  - **Membership add requires full containment; membership removal
    requires zero overlap.** A drop that only partially overlaps a group
    changes nothing either way — it neither joins nor leaves. This
    asymmetric rule was the most literal reading of the two separate
    spec sentences ("dropping inside commits," "drag fully outside" to
    remove) and was locked in with explicit tests for both directions.
  - **When a node's drop point is fully contained by more than one group
    at once** (nested or overlapping), it joins only the smallest-area
    (innermost) one that it isn't already a member of; a genuinely
    disjoint second membership (spec's "overlapping membership") is only
    reachable via a second, separate drag once the first is committed —
    matching the "drag into a group, commit on drop" mechanic being an
    inherently single-target action. Equal-area ties (e.g. two groups at
    default size) are broken deterministically in favor of whichever group
    was created first, so behavior is reproducible rather than
    order-of-iteration-dependent.
  - Hit-testing (and draw order) changed from Phase 1's "last created wins"
    to "smallest-area box wins" (draw order is the reverse, so bigger/
    outer boxes paint first and smaller/nested ones paint on top) — a
    correctness fix that Phase 1 didn't need since nothing nested yet, but
    Phase 2 does: without it, clicking a node fully inside a much bigger
    group would hit the group instead of the member.
- 2026-07-25 — PR #2 (Phase 2) merged to `main` by the user. Restarted this
  branch from `origin/main` again per the merged-PR protocol before
  starting Phase 3 — same clean case as before, no unmerged work on the old
  tip.
- 2026-07-25 — Phase 3 (Undo/redo) implemented in `index.html`
  (`tests/phase3.spec.mjs`, 16 tests; 69 total across all phases). Notable
  decisions:
  - **Snapshot-based, not delta-based.** Every undo step stores a full
    `{before, after}` clone of `{nodes, edges}` rather than a hand-written
    inverse per action type. Chosen for correctness by construction — a
    delta-based command for, say, "delete node" would need to remember to
    also restore every incident edge and every other node's `groups[]`
    entry that referenced it, and any future phase that adds a new mutation
    would need its own hand-rolled inverse too. A snapshot can't get this
    wrong. This also directly matches the spec's own description of
    autolayout (Phase 8) as "one before snapshot of all positions" —
    generalized here to every action instead of being special-cased later.
    `nextNodeNum`/`nextEdgeNum` counters are deliberately *not* part of the
    snapshot, since ids must never be reused (Section 4.1) even across
    undo/redo.
  - **Group membership is not a separate undo step from the move that
    caused it.** Since the *only* way to change membership is the drag-in/
    drag-out mechanic (Phase 2), the before/after snapshot for a "move"
    action is taken spanning the entire drag lifecycle (pointerdown to
    pointerup, after `updateGroupMembership` runs) — so a drag that both
    repositions a node *and* changes its group membership is one Undo, not
    two. Verified explicitly in the test suite.
  - **Resize (the group-only corner handle added in Phase 2) is undoable
    too**, via the same before/after-snapshot-around-the-drag pattern as
    move. Phase 3's checklist enumerates "add, move, connect, delete,
    group, autolayout, TXT import" and doesn't name resize specifically,
    but it's a real state mutation with no other listed category to fall
    under — leaving it un-undoable would just be a gap, not a deliberate
    scope boundary.
  - **Undo/Redo buttons are `disabled` (real DOM attribute) when their
    stack is empty**, not just inert. Decision #8 says "buttons only, no
    dedicated gesture" for undo/redo, which this doesn't contradict — it's
    about *how* the action is reached, not whether the button gives
    feedback when there's nothing to do.
  - Selection is intentionally cleared (not restored) on every Undo/Redo —
    the previously-selected node or edge may not exist in the restored
    snapshot (e.g. it was the thing just undone into non-existence), so
    trying to preserve it isn't meaningfully well-defined.

---

## Open Questions (not yet decided — raise before implementing that part)

- Exact autolayout algorithm choice (Phase 8) — spec leaves this open.
- Graph name (used in versioned filenames, Section 5.4) — is it user-entered
  at first save, or derived from something else? Spec doesn't say explicitly.
